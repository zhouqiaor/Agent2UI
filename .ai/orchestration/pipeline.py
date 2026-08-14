"""
A2UI 6-Agent StateGraph 编排引擎 v2.0
=======================================

基于 LangGraph 的 StateGraph 实现 6 角色 Agent 协作流水线。
v2.0 升级：持久检查点、质量门控、成本追踪、产物落盘、可观测性、HITL

节点: PM → UX → A2UI → Dev → Review → Test
条件边:
  - Review: on_pass → Test / on_review_fail → Dev (max 3x)
  - Test: on_pass → 交付 / on_test_fail → Dev (max 3x)
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Annotated, Any, Callable, Literal, TypedDict

from langgraph.graph import StateGraph, END, START

# ============================================================
# 0. 日志与配置
# ============================================================

logger = logging.getLogger("a2ui.pipeline")

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
CHECKPOINT_DB = os.path.join(os.path.dirname(__file__), "checkpoints.db")
TOKEN_BUDGET = 50000
MAX_DEV_RETRIES = 3
QUALITY_THRESHOLD_PASS = 60
QUALITY_THRESHOLD_PASS_STRICT = 80


# ============================================================
# 1. 状态定义 (LangGraph TypedDict 风格)
# ============================================================

def _merge_lists(existing: list, new_val: list | dict) -> list:
    if not new_val:
        return existing
    if isinstance(new_val, dict):
        return existing + [new_val]
    if isinstance(new_val, list):
        return existing + new_val
    return existing


def _merge_execution_logs(existing: list, new_val: list | dict) -> list:
    if not new_val:
        return existing
    if isinstance(new_val, dict):
        return existing + [new_val]
    if isinstance(new_val, list):
        return existing + new_val
    return existing


def _merge_node_logs(existing: dict, new_val: dict) -> dict:
    if not new_val:
        return existing
    merged = dict(existing)
    for node_id, entries in new_val.items():
        if node_id in merged:
            merged[node_id] = merged[node_id] + entries
        else:
            merged[node_id] = list(entries)
    return merged


class NodeExecutionLog(TypedDict, total=False):
    node_id: str
    node_label: str
    started_at: str
    completed_at: str
    duration_ms: int
    token_usage: dict[str, int]
    status: Literal["success", "failed", "skipped"]
    output_count: int
    retry_number: int
    quality_score: int
    quality_gate: Literal["pass", "fail", "none"]


class PipelineState(TypedDict):
    messages: Annotated[list, _merge_lists]
    current_node: str
    artifacts: dict
    retry_counts: dict[str, int]
    result_status: Literal["pending", "pass", "fail"]
    review_result: Literal["pending", "pass", "fail"]
    test_result: Literal["pending", "pass", "fail"]
    error: str | None
    started_at: float
    completed_at: float | None

    token_usage: dict[str, int]
    total_cost_usd: float
    execution_logs: Annotated[list, _merge_execution_logs]
    node_execution_logs: Annotated[dict, _merge_node_logs]
    quality_scores: dict[str, int]
    human_interrupt: bool

    step_count: int
    circuit_breaker_status: dict[str, str]


def _create_initial_state(scene_description: str) -> PipelineState:
    return PipelineState(
        messages=[
            {"role": "user", "content": scene_description}
        ],
        current_node="start",
        artifacts={},
        retry_counts={},
        result_status="pending",
        review_result="pending",
        test_result="pending",
        error=None,
        started_at=time.time(),
        completed_at=None,
        token_usage={"prompt": 0, "completion": 0, "total": 0, "budget_limit": TOKEN_BUDGET},
        total_cost_usd=0.0,
        execution_logs=[],
        node_execution_logs={},
        quality_scores={},
        human_interrupt=False,
        step_count=0,
        circuit_breaker_status={},
    )


# ============================================================
# 2. 质量门控框架
# ============================================================

@dataclass
class QualityRule:
    rule_id: str
    description: str
    severity: Literal["blocker", "major", "nit"]
    check_fn: Callable[[dict], bool]
    error_message: str


class QualityEvaluator:
    def __init__(self):
        self._rules: dict[str, list[QualityRule]] = {}

    def register_rules(self, node_id: str, rules: list[QualityRule]):
        self._rules[node_id] = rules

    def evaluate(self, node_id: str, artifacts: dict) -> tuple[int, list[str]]:
        rules = self._rules.get(node_id, [])
        blockers = 0
        majors = 0
        total = len(rules)
        errors: list[str] = []

        for rule in rules:
            passed = rule.check_fn(artifacts)
            if not passed:
                errors.append(f"[{rule.severity.upper()}] {rule.error_message}")
                if rule.severity == "blocker":
                    blockers += 1
                elif rule.severity == "major":
                    majors += 1

        if total == 0:
            return 100, []

        deduction = blockers * 30 + majors * 10
        score = max(0, 100 - deduction)
        return score, errors


evaluator = QualityEvaluator()

evaluator.register_rules("pm", [
    QualityRule("pm_spec_exists", "spec artifact exists", "blocker",
                lambda a: "spec" in a, "spec.md 产物缺失"),
    QualityRule("pm_data_model_exists", "target_data_model artifact exists", "blocker",
                lambda a: "target_data_model" in a, "target_data_model.md 产物缺失"),
    QualityRule("pm_spec_has_goal", "spec contains product goal", "major",
                lambda a: a.get("spec", {}).get("content", "") or "产品目标" in str(a.get("spec", {})),
                "spec.md 缺少产品目标"),
    QualityRule("pm_consumers_valid", "spec consumers declared", "major",
                lambda a: len(a.get("spec", {}).get("consumers", [])) > 0,
                "spec.md 未声明 consumers"),
])

evaluator.register_rules("ux", [
    QualityRule("ux_design_exists", "design artifact exists", "blocker",
                lambda a: "design" in a, "design.md 产物缺失"),
    QualityRule("ux_tokens_exists", "design_tokens artifact exists", "blocker",
                lambda a: "design_tokens" in a, "design_tokens.md 产物缺失"),
    QualityRule("ux_components_exists", "component_library artifact exists", "blocker",
                lambda a: "component_library" in a, "component_library.md 产物缺失"),
])

evaluator.register_rules("a2ui", [
    QualityRule("a2ui_schema_exists", "a2ui_schema artifact exists", "blocker",
                lambda a: "a2ui_schema" in a, "a2ui_schema.json 产物缺失"),
    QualityRule("a2ui_compose_exists", "compose_code artifact exists", "blocker",
                lambda a: "compose_code" in a, "compose_code 产物缺失"),
    QualityRule("a2ui_mapping_exists", "data_mapping artifact exists", "major",
                lambda a: "data_mapping" in a, "data_mapping.md 产物缺失"),
])

evaluator.register_rules("dev", [
    QualityRule("dev_project_exists", "project_code artifact exists", "blocker",
                lambda a: "project_code" in a, "project_code 产物缺失"),
    QualityRule("dev_arch_exists", "architecture_doc artifact exists", "major",
                lambda a: "architecture_doc" in a, "ARCHITECTURE.md 产物缺失"),
])

evaluator.register_rules("review", [
    QualityRule("review_artifacts_on_pass", "code_package and review_comments exist when passing", "blocker",
                lambda a: True, "审查通过时必须存在 code_package 和 review_comments（此规则在 pass 后由 _review_handler 保证）"),
])

evaluator.register_rules("test", [
    QualityRule("test_artifacts_on_pass", "test_report and performance_baseline exist when passing", "blocker",
                lambda a: True, "测试通过时必须存在 test_report 和 performance_baseline（此规则在 pass 后由 _test_handler 保证）"),
])


# ============================================================
# 3. 成本追踪
# ============================================================

def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, len(text) // 4)


def estimate_cost(token_usage: dict[str, int], model: str = "gpt-4o") -> float:
    rates = {
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
        "claude-sonnet": {"input": 0.003, "output": 0.015},
        "default": {"input": 0.005, "output": 0.015},
    }
    rate = rates.get(model, rates["default"])
    prompt_cost = token_usage.get("prompt", 0) * rate["input"] / 1000
    completion_cost = token_usage.get("completion", 0) * rate["output"] / 1000
    return round(prompt_cost + completion_cost, 4)


def check_token_budget(token_usage: dict[str, int]) -> tuple[bool, str]:
    total = token_usage.get("total", 0)
    remaining = TOKEN_BUDGET - total
    if total > TOKEN_BUDGET:
        return False, f"Token 预算已耗尽: {total}/{TOKEN_BUDGET}"
    if remaining < 5000:
        return True, f"Token 预算即将耗尽: 剩余 {remaining}"
    return True, f"Token 预算充足: 剩余 {remaining}"


# ============================================================
# 3.5 六层防护体系 (Guardrail Framework)
# ============================================================

MAX_STEPS = 40
MAX_AGENT_DEPTH = 3
LOOP_WARN_THRESHOLD = 3
LOOP_HARD_STOP_THRESHOLD = 8
SEMANTIC_SIMILARITY_THRESHOLD = 0.85
SEMANTIC_WINDOW_SIZE = 5


@dataclass
class ToolLoopGuard:
    call_count: int = 0
    fail_count: int = 0
    last_tool: str = ""
    last_args: str = ""

    def record(self, tool: str, args: str, success: bool) -> str | None:
        if tool == self.last_tool and args == self.last_args:
            self.call_count += 1
            if not success:
                self.fail_count += 1
        else:
            self.call_count = 1
            self.fail_count = 0
            self.last_tool = tool
            self.last_args = args
            return None

        if self.fail_count >= LOOP_HARD_STOP_THRESHOLD:
            return f"HARD_STOP: 工具 [{tool}] 相同参数连续失败 {self.fail_count} 次"
        if self.fail_count >= LOOP_WARN_THRESHOLD:
            logger.warning(f"LOOP_WARN: 工具 [{tool}] 相同参数连续失败 {self.fail_count} 次")
        return None


class CircuitBreaker:
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"
    HALT = "HALT"

    def __init__(self, failure_threshold: int = 3, cooldown_seconds: float = 30.0):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self._state: dict[str, dict] = {}

    def _get_state(self, node_id: str) -> dict:
        if node_id not in self._state:
            self._state[node_id] = {
                "status": self.CLOSED,
                "failures": 0,
                "last_failure_ts": 0.0,
                "degrade_count": 0,
            }
        return self._state[node_id]

    def record_success(self, node_id: str):
        s = self._get_state(node_id)
        if s["status"] in (self.OPEN, self.HALF_OPEN):
            s["status"] = self.CLOSED
        s["failures"] = 0
        s["degrade_count"] = max(0, s["degrade_count"] - 1)

    def record_failure(self, node_id: str) -> str:
        s = self._get_state(node_id)
        s["failures"] += 1
        s["last_failure_ts"] = time.time()
        s["degrade_count"] += 1

        if s["failures"] >= self.failure_threshold * 2:
            s["status"] = self.HALT
            return self.HALT
        if s["failures"] >= self.failure_threshold:
            s["status"] = self.OPEN
            return self.OPEN
        if s["degrade_count"] >= 2:
            return "DEGRADE"
        return self.CLOSED

    def get_status(self, node_id: str) -> str:
        return self._get_state(node_id)["status"]

    def is_halted(self, node_id: str) -> bool:
        return self.get_status(node_id) == self.HALT


@dataclass
class SemanticWindow:
    messages: list[str] = field(default_factory=list)
    max_size: int = SEMANTIC_WINDOW_SIZE

    def add(self, text: str):
        self.messages.append(text)
        if len(self.messages) > self.max_size:
            self.messages = self.messages[-self.max_size:]

    def detect_loop(self) -> tuple[bool, float]:
        if len(self.messages) < 3:
            return False, 0.0
        recent = self.messages[-1]
        older = self.messages[:-1]
        max_sim = 0.0
        for msg in older:
            sim = self._char_jaccard(recent, msg)
            max_sim = max(max_sim, sim)
        return max_sim >= SEMANTIC_SIMILARITY_THRESHOLD, max_sim

    @staticmethod
    def _char_jaccard(a: str, b: str) -> float:
        if not a or not b:
            return 0.0
        sa, sb = set(a), set(b)
        return len(sa & sb) / len(sa | sb) if sa | sb else 0.0


def _check_guardrails(state: PipelineState) -> tuple[bool, str]:
    step_count = state.get("step_count", 0)
    if step_count >= MAX_STEPS:
        return False, f"步骤数超限: {step_count}/{MAX_STEPS}"

    token_usage = state.get("token_usage", {})
    total_tokens = token_usage.get("total", 0)
    budget_limit = token_usage.get("budget_limit", TOKEN_BUDGET)
    if total_tokens > budget_limit:
        return False, f"Token 预算已耗尽: {total_tokens}/{budget_limit}"

    total_cost = state.get("total_cost_usd", 0.0)
    if total_cost > 5.0:
        return False, f"成本超限: ${total_cost:.2f}"

    return True, "ok"


def _increment_step(state: PipelineState) -> dict:
    current = state.get("step_count", 0)
    return {"step_count": current + 1}


# ============================================================
# 4. 产物落盘
# ============================================================

def save_artifacts(artifacts: dict, thread_id: str, node_id: str):
    node_dir = os.path.join(ARTIFACTS_DIR, thread_id, node_id)
    os.makedirs(node_dir, exist_ok=True)

    saved = []
    for name, info in artifacts.items():
        if not isinstance(info, dict):
            continue
        file_name = info.get("file", f"{name}.txt")
        content = info.get("content", "")
        if not content:
            continue

        base_name = file_name.rstrip("/")
        if "/" in file_name and not file_name.startswith("."):
            sub_dir = os.path.join(node_dir, base_name)
            os.makedirs(sub_dir, exist_ok=True)
            target = os.path.join(sub_dir, "_index.txt")
        else:
            target = os.path.join(node_dir, base_name)

        mode = "w"
        if isinstance(content, (dict, list)):
            content = json.dumps(content, indent=2, ensure_ascii=False)
        with open(target, mode, encoding="utf-8") as f:
            f.write(str(content))
        saved.append(target)

    manifest_path = os.path.join(node_dir, "_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "node_id": node_id,
            "saved_at": datetime.now(timezone.utc).isoformat(),
            "artifacts": [info.get("file", name) for name, info in artifacts.items() if isinstance(info, dict)],
        }, f, indent=2, ensure_ascii=False)

    return saved


# ============================================================
# 5. Agent 定义与工具
# ============================================================

@dataclass
class AgentNode:
    node_id: str
    role: str
    description: str
    inputs: list[str]
    outputs: list[str]
    handler: Callable[[PipelineState], dict] = field(default=None)


SCENE_PROFILES: dict[str, dict] = {
    "counter": {
        "name": "极简计数器 App",
        "goal": "通过 Agent 驱动的 UI 创建一个支持加减计数的简单计数器",
        "features": ["加减计数", "重置", "Agent 语音控制"],
        "data_model": {
            "entities": ["Counter", "User", "AgentCommand"],
            "fields": {
                "Counter": ["id: Long", "value: Int", "step: Int", "label: String"],
                "User": ["id: Long", "name: String", "preferences: Json"],
                "AgentCommand": ["id: Long", "action: String", "timestamp: Long", "status: String"],
            },
        },
    },
}


def _match_profile(scene: str) -> dict | None:
    scene_lower = scene.lower()
    for key, profile in SCENE_PROFILES.items():
        if key in scene_lower or profile["name"] in scene:
            return profile
    return None


def _estimate_node_tokens(node_id: str, artifacts: dict) -> dict[str, int]:
    total_chars = 0
    for info in artifacts.values():
        if isinstance(info, dict):
            total_chars += len(str(info.get("content", "")))

    base_tokens = {
        "pm": 1200, "ux": 1500, "a2ui": 2000,
        "dev": 2500, "review": 800, "test": 1000,
    }.get(node_id, 500)

    additional = estimate_tokens(" ".join(
        str(a.get("content", "")) for a in artifacts.values() if isinstance(a, dict)
    ))
    prompt = base_tokens + additional // 2
    completion = max(200, additional // 3)
    return {"prompt": prompt, "completion": completion, "total": prompt + completion}


def _node_log_entry(node_id: str, node_label: str, start_ts: float,
                    artifacts: dict, status: str, retry: int,
                    quality_score: int, quality_gate: str) -> NodeExecutionLog:
    end_ts = time.time()
    duration = int((end_ts - start_ts) * 1000)
    token_usage = _estimate_node_tokens(node_id, artifacts)
    return NodeExecutionLog(
        node_id=node_id,
        node_label=node_label,
        started_at=datetime.fromtimestamp(start_ts, tz=timezone.utc).isoformat(),
        completed_at=datetime.fromtimestamp(end_ts, tz=timezone.utc).isoformat(),
        duration_ms=duration,
        token_usage=token_usage,
        status=status,
        output_count=len([v for v in artifacts.values() if isinstance(v, dict)]),
        retry_number=retry,
        quality_score=quality_score,
        quality_gate=quality_gate,
    )


def _execute_node(node_id: str, node_label: str, state: PipelineState,
                  handler: Callable) -> dict:
    start_ts = time.time()
    logger.info(f"[{node_label}] 开始执行...")

    step_count = state.get("step_count", 0) + 1

    result = handler(state)

    artifacts = result.get("artifacts", {})
    score, errors = evaluator.evaluate(node_id, artifacts)
    gate = "pass" if score >= QUALITY_THRESHOLD_PASS else "fail"

    if errors:
        logger.warning(f"[{node_label}] 质量评估: score={score}, issues={errors}")
    else:
        logger.info(f"[{node_label}] 质量评估: score={score}, gate={gate}")

    log_entry = _node_log_entry(node_id, node_label, start_ts, artifacts, "success",
                                state.get("retry_counts", {}).get("dev", 0),
                                score, gate)

    token_usage = log_entry["token_usage"]
    state_tokens = dict(state.get("token_usage", {}))
    state_tokens["prompt"] = state_tokens.get("prompt", 0) + token_usage["prompt"]
    state_tokens["completion"] = state_tokens.get("completion", 0) + token_usage["completion"]
    state_tokens["total"] = state_tokens.get("total", 0) + token_usage["total"]
    state_tokens["budget_limit"] = TOKEN_BUDGET

    total_cost = state.get("total_cost_usd", 0.0) + estimate_cost(token_usage)

    entry_key = f"{node_id}_{int(start_ts)}"
    node_logs = dict(state.get("node_execution_logs", {}))
    node_logs[node_id] = (node_logs.get(node_id, []) + [dict(log_entry)])[-30:]

    logs = list(state.get("execution_logs", [])) + [dict(log_entry)]
    if len(logs) > 200:
        logs = logs[-200:]

    quality_scores = dict(state.get("quality_scores", {}))
    quality_scores[node_id] = score

    result["execution_logs"] = logs
    result["node_execution_logs"] = node_logs
    result["token_usage"] = state_tokens
    result["total_cost_usd"] = round(total_cost, 4)
    result["quality_scores"] = quality_scores
    result["step_count"] = step_count

    budget_ok, budget_msg = check_token_budget(state_tokens)
    if not budget_ok:
        logger.error(f"[{node_label}] {budget_msg}")
        result["error"] = budget_msg
        result["result_status"] = "fail"
    elif budget_msg.startswith("Token 预算即将耗尽"):
        logger.warning(f"[{node_label}] {budget_msg}")

    cb_status = dict(state.get("circuit_breaker_status", {}))
    if gate == "fail":
        current_failures = cb_status.get(f"f_{node_id}", 0)
        current_failures += 1
        cb_status[f"f_{node_id}"] = current_failures

        if current_failures >= 6:
            cb_status[node_id] = CircuitBreaker.HALT
            logger.error(f"[GUARDRAIL] {node_id} 熔断器进入 HALT 状态 (连续失败 {current_failures} 次)")
            result["error"] = f"{node_id} 熔断器 HALT: 连续失败 {current_failures} 次"
            result["result_status"] = "fail"
        elif current_failures >= 3:
            cb_status[node_id] = CircuitBreaker.OPEN
            logger.warning(f"[GUARDRAIL] {node_id} 熔断器 OPEN (连续失败 {current_failures} 次)")
        else:
            cb_status[node_id] = CircuitBreaker.CLOSED
    else:
        cb_status[f"f_{node_id}"] = 0
        cb_status[node_id] = CircuitBreaker.CLOSED

    result["circuit_breaker_status"] = cb_status

    logger.info(
        f"[{node_label}] 完成: duration={log_entry['duration_ms']}ms, "
        f"score={score}, gate={gate}, tokens={state_tokens['total']}, "
        f"steps={step_count}"
    )

    return result


# ============================================================
# 6. Agent Handlers
# ============================================================

def _pm_handler(state: PipelineState) -> dict:
    scene = state["messages"][0]["content"] if state["messages"] else "(no scene)"
    profile = _match_profile(scene)
    artifacts = dict(state.get("artifacts", {}))

    if profile:
        spec_content = (
            f"# {profile['name']} - PRD\n\n"
            f"## 产品目标\n{profile['goal']}\n\n"
            f"## 功能列表\n"
            + "\n".join(f"- {f}" for f in profile["features"])
            + "\n\n## 用户故事\n"
              f"- As a 用户, I want to 计数, So that I can 记录数值\n"
              f"- As a 用户, I want to 语音控制, So that I can 免手操作"
        )
        data_model_content = (
            f"# 数据模型\n\n"
            f"## 实体定义\n"
            f"### Counter\n"
            f"```kotlin\n"
            f"data class Counter(\n"
            f"    val id: Long = 0,\n"
            f"    val value: Int = 0,\n"
            f"    val step: Int = 1,\n"
            f"    val label: String = \"\"\n"
            f")\n"
            f"```\n\n"
            f"### 关系图\n"
            f"User 1──N AgentCommand\n"
            f"Counter 1──N AgentCommand\n"
        )
    else:
        spec_content = (
            f"# {scene} - PRD\n\n"
            f"## 产品目标\n基于业务场景定义需求\n\n"
            f"## 功能列表\n- 核心功能\n- Agent 驱动交互\n\n"
            f"## 用户故事\n- As a 用户, I want to 完成核心任务, So that I can 达成目标"
        )
        data_model_content = (
            f"# 数据模型\n\n"
            f"## 实体定义\n- Entity: 核心业务实体\n- AgentResult: Agent 执行结果\n\n"
            f"## 关系图\nUser 1──N AgentResult"
        )

    artifacts["spec"] = {
        "file": "spec.md", "content": spec_content,
        "schema": "目标/范围/功能列表/用户故事", "consumers": ["ux", "a2ui"],
    }
    artifacts["target_data_model"] = {
        "file": "target_data_model.md", "content": data_model_content,
        "consumers": ["a2ui"],
    }

    raw_result = {
        "current_node": "pm",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": f"[PM] 需求分析完成 → spec.md + target_data_model.md"}],
    }
    return _execute_node("pm", "产品经理", state, lambda s: raw_result)


def _ux_handler(state: PipelineState) -> dict:
    scene = state["messages"][0]["content"] if state["messages"] else "(no scene)"
    profile = _match_profile(scene)
    artifacts = dict(state.get("artifacts", {}))

    if profile:
        design_content = (
            f"# {profile['name']} - 设计规范\n\n"
            f"## 布局策略\n- 单屏垂直布局\n- 居中显示计数\n- 底部操作栏\n\n"
            f"## 视觉规范\n- Material 3 ColorScheme\n- 大号数字显示 (Text Display Large)\n- 圆角按钮"
        )
        tokens_content = (
            f"# Design Tokens\n\n"
            f"## 颜色\n- primary: #6750A4 (Purple 40)\n- onPrimary: #FFFFFF\n"
            f"- background: #FFFBFE\n- onBackground: #1C1B1F\n\n"
            f"## 字体\n- displayLarge: 57sp / regular\n- headlineMedium: 28sp / regular\n"
            f"- labelLarge: 14sp / medium\n\n"
            f"## 间距\n- xs: 4dp, sm: 8dp, md: 16dp, lg: 24dp\n\n"
            f"## 形状\n- button: 20dp 圆角\n- card: 16dp 圆角"
        )
        component_content = (
            f"# 组件库\n\n"
            f"| 组件 | 类型 | 状态 | 用途 |\n"
            f"|------|------|------|------|\n"
            f"| CounterDisplay | text | idle/updating/error | 显示计数 |\n"
            f"| ActionButton | button | default/pressed/disabled | 加减操作 |\n"
            f"| AgentStatusCard | card | thinking/streaming/done | Agent 状态 |\n"
            f"| ResultCard | card | success/error | Agent 结果 |"
        )
    else:
        design_content = f"# {scene} - 设计规范\n\n## 布局策略\n响应式布局\n\n## 视觉规范\nMaterial 3"
        tokens_content = "# Design Tokens\n\n颜色/字体/间距 Token 定义"
        component_content = "# 组件库\n\nscreen/card/list/button/text/chart/form"

    artifacts["design"] = {
        "file": "design.md", "content": design_content, "consumers": ["a2ui"],
    }
    artifacts["design_tokens"] = {
        "file": "design_tokens.md", "content": tokens_content, "consumers": ["a2ui", "dev"],
    }
    artifacts["component_library"] = {
        "file": "component_library.md", "content": component_content, "consumers": ["a2ui"],
    }

    raw_result = {
        "current_node": "ux",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": "[UX] 设计规范完成 → design.md + design_tokens.md + component_library.md"}],
    }
    return _execute_node("ux", "UX 设计师", state, lambda s: raw_result)


def _a2ui_handler(state: PipelineState) -> dict:
    scene = state["messages"][0]["content"] if state["messages"] else "(no scene)"
    profile = _match_profile(scene)
    artifacts = dict(state.get("artifacts", {}))

    if profile:
        a2ui_schema = {
            "$schema": "https://a2ui.dev/schema/v1",
            "surfaceId": "counter-main",
            "type": "screen",
            "data": {
                "counter": {"value": 0, "step": 1, "label": "计数"},
                "agentStatus": "idle",
                "lastCommand": None,
            },
            "layout": {
                "template": "centered",
                "sections": ["counter_display", "action_bar", "agent_panel"],
            },
            "actions": [
                {"id": "increment", "label": "+", "schema": "CounterAction"},
                {"id": "decrement", "label": "-", "schema": "CounterAction"},
                {"id": "reset", "label": "重置", "schema": "CounterAction"},
            ],
            "events": [
                {"type": "onAgentResponse", "handler": "re-render"},
                {"type": "onCounterChange", "handler": "update-display"},
            ],
        }
        compose_code = (
            f"@Composable\n"
            f"fun CounterScreen(\n"
            f"    state: CounterUiState,\n"
            f"    onIntent: (CounterIntent) -> Unit\n"
            f") {{\n"
            f"    MaterialTheme {{\n"
            f"        Scaffold(\n"
            f"            containerColor = MaterialTheme.colorScheme.background\n"
            f"        ) {{\n"
            f"            Column(\n"
            f"                modifier = Modifier.fillMaxSize(),\n"
            f"                horizontalAlignment = Alignment.CenterHorizontally,\n"
            f"                verticalArrangement = Arrangement.Center\n"
            f"            ) {{\n"
            f"                Text(\n"
            f"                    text = state.value.toString(),\n"
            f"                    style = MaterialTheme.typography.displayLarge\n"
            f"                )\n"
            f"                Row {{\n"
            f"                    Button(onClick = {{ onIntent(Decrement) }}) {{ Text(\"-\") }}\n"
            f"                    Button(onClick = {{ onIntent(Increment) }}) {{ Text(\"+\") }}\n"
            f"                }}\n"
            f"            }}\n"
            f"        }}\n"
            f"    }}\n"
            f"}}"
        )
        data_mapping = (
            f"# 数据映射\n\n"
            f"| 数据字段 | UI 属性 | 组件 |\n"
            f"|---------|---------|------|\n"
            f"| counter.value | Text.text | CounterDisplay |\n"
            f"| counter.label | Text.label | CounterDisplay |\n"
            f"| agentStatus | Card.state | AgentStatusCard |\n"
            f"| lastCommand | Card.content | ResultCard |"
        )
    else:
        a2ui_schema = {
            "$schema": "https://a2ui.dev/schema/v1",
            "surfaceId": "main",
            "type": "screen",
            "data": {},
            "layout": {"template": "default", "sections": ["content"]},
            "actions": [],
            "events": [],
        }
        compose_code = "// Compose code for generic screen\n@Composable\nfun MainScreen() { /* ... */ }"
        data_mapping = "# 数据映射\n\n数据字段 → UI 属性映射表"

    artifacts["a2ui_schema"] = {
        "file": "a2ui_schema.json",
        "content": json.dumps(a2ui_schema, indent=2, ensure_ascii=False),
        "consumers": ["dev"],
    }
    artifacts["compose_code"] = {
        "file": "compose_code/",
        "content": compose_code,
        "consumers": ["dev"],
    }
    artifacts["data_mapping"] = {
        "file": "data_mapping.md",
        "content": data_mapping,
        "consumers": ["dev"],
    }

    raw_result = {
        "current_node": "a2ui",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": "[A2UI] Schema + Compose 代码 → a2ui_schema.json + compose_code/"}],
    }
    return _execute_node("a2ui", "A2UI 专家", state, lambda s: raw_result)


def _dev_handler(state: PipelineState) -> dict:
    artifacts = dict(state.get("artifacts", {}))
    retry_counts = dict(state.get("retry_counts", {}))
    node_id = "dev"
    current_retries = retry_counts.get(node_id, 0)

    artifacts["project_code"] = {
        "file": "project_root/",
        "content": "[Project] 完整 Android 项目，Clean Architecture + MVI",
        "consumers": ["reviewer", "tester"],
    }
    artifacts["architecture_doc"] = {
        "file": "ARCHITECTURE.md",
        "content": "[Architecture] 架构图 / 模块依赖",
        "consumers": ["reviewer"],
    }
    retry_counts[node_id] = current_retries

    raw_result = {
        "current_node": "dev",
        "artifacts": artifacts,
        "retry_counts": retry_counts,
        "messages": [{"role": "assistant", "content": f"[Dev] 代码实现完成 (重试 {current_retries})"}],
    }
    return _execute_node("dev", "Android 开发", state, lambda s: raw_result)


def _review_handler(state: PipelineState) -> dict:
    artifacts = dict(state.get("artifacts", {}))
    retry_counts = dict(state.get("retry_counts", {}))
    node_id = "dev"
    current_retries = retry_counts.get(node_id, 0)

    score, errors = evaluator.evaluate("review", artifacts)
    blockers_present = any("[BLOCKER]" in e for e in errors) if errors else False

    should_pass = not blockers_present and current_retries >= 2

    if should_pass:
        artifacts["code_package"] = {
            "file": "code_package/",
            "content": "[Code Package] 审查通过的代码包",
            "consumers": ["tester"],
        }
        artifacts["review_comments"] = {
            "file": "review_comments.md",
            "content": "[Review Comments] 审查结论 + 通过前提",
            "consumers": ["tester"],
        }
        raw_result = {
            "current_node": "review",
            "review_result": "pass",
            "artifacts": artifacts,
            "messages": [{"role": "assistant", "content": f"[Review] 代码审查通过 ✅ (score={score}) → 流转到测试"}],
        }
    else:
        retry_counts[node_id] = current_retries + 1
        artifacts["issue_list"] = {
            "file": "issue_list.md",
            "content": "[Issue List] " + (" / ".join(errors) if errors else "质量门未达通过阈值") + " / Design Token 未使用 / 协程作用域错误",
            "consumers": ["dev"],
        }
        raw_result = {
            "current_node": "review",
            "review_result": "fail",
            "artifacts": artifacts,
            "retry_counts": retry_counts,
            "messages": [{"role": "assistant", "content": f"[Review] 代码审查不通过 🔴 (score={score}, 重试 {current_retries}/3) → 回退到开发"}],
        }

    return _execute_node("review", "代码审核", state, lambda s: raw_result)


def _test_handler(state: PipelineState) -> dict:
    artifacts = dict(state.get("artifacts", {}))
    retry_counts = dict(state.get("retry_counts", {}))
    node_id = "dev"
    current_retries = retry_counts.get(node_id, 0)

    score, errors = evaluator.evaluate("test", artifacts)

    test_pass = not errors and current_retries < 3

    if test_pass:
        artifacts["test_report"] = {
            "file": "test_report.md",
            "content": "[Test Report] 测试概览 / 通过统计 / 问题列表 → 交付完成",
            "consumers": ["pm", "dev"],
        }
        artifacts["performance_baseline"] = {
            "file": "performance_baseline.md",
            "content": "[Performance] Agent 响应 < 3s / 首帧 < 500ms ✅",
            "consumers": ["pm", "dev"],
        }
        raw_result = {
            "current_node": "test",
            "test_result": "pass",
            "result_status": "pass",
            "artifacts": artifacts,
            "completed_at": time.time(),
            "messages": [{"role": "assistant", "content": f"[Test] 所有测试通过 ✅ (score={score}) → 交付完成 🎉"}],
        }
    else:
        artifacts["test_report"] = {
            "file": "test_report.md",
            "content": "[Test Report] 测试失败：" + (" / ".join(errors) if errors else "重试次数超限"),
            "consumers": ["pm", "dev"],
        }
        retry_counts[node_id] = current_retries + 1
        raw_result = {
            "current_node": "test",
            "test_result": "fail",
            "result_status": "fail",
            "artifacts": artifacts,
            "retry_counts": retry_counts,
            "messages": [{"role": "assistant", "content": f"[Test] 测试失败 🔴 (score={score}, 重试 {current_retries}/3) → 回退到开发"}],
        }

    return _execute_node("test", "Android 测试", state, lambda s: raw_result)


AGENT_HANDLERS: dict[str, Callable[[PipelineState], dict]] = {
    "pm": _pm_handler,
    "ux": _ux_handler,
    "a2ui": _a2ui_handler,
    "dev": _dev_handler,
    "review": _review_handler,
    "test": _test_handler,
}


# ============================================================
# 7. 条件边函数
# ============================================================

def route_after_review(state: PipelineState) -> str:
    guard_ok, guard_msg = _check_guardrails(state)
    if not guard_ok:
        logger.error(f"[GUARDRAIL] 防护触发: {guard_msg}")
        return "retry_exhausted"

    step_count = state.get("step_count", 0)
    if step_count >= MAX_STEPS:
        logger.error(f"[GUARDRAIL] 步骤数超限: {step_count}/{MAX_STEPS}")
        return "retry_exhausted"

    cb_status = state.get("circuit_breaker_status", {})
    if cb_status.get("review") == CircuitBreaker.HALT:
        logger.error("[GUARDRAIL] Review 节点熔断器已 HALT")
        return "retry_exhausted"

    if state.get("review_result") == "pass":
        logger.info("Review 通过 → 流转到 Test")
        return "to_tester"
    elif state.get("review_result") == "fail":
        retry_counts = state.get("retry_counts", {})
        if retry_counts.get("dev", 0) >= MAX_DEV_RETRIES:
            logger.warning("Review 失败且重试耗尽 → Error")
            return "retry_exhausted"
        logger.info(f"Review 失败 → 回退到 Dev (重试 {retry_counts.get('dev', 0)}/{MAX_DEV_RETRIES})")
        return "to_dev"
    return END


def route_after_test(state: PipelineState) -> str:
    guard_ok, guard_msg = _check_guardrails(state)
    if not guard_ok:
        logger.error(f"[GUARDRAIL] 防护触发: {guard_msg}")
        return "retry_exhausted"

    step_count = state.get("step_count", 0)
    if step_count >= MAX_STEPS:
        logger.error(f"[GUARDRAIL] 步骤数超限: {step_count}/{MAX_STEPS}")
        return "retry_exhausted"

    cb_status = state.get("circuit_breaker_status", {})
    if cb_status.get("test") == CircuitBreaker.HALT:
        logger.error("[GUARDRAIL] Test 节点熔断器已 HALT")
        return "retry_exhausted"

    if state.get("test_result") == "pass":
        logger.info("Test 通过 → 交付完成")
        return "to_end"
    elif state.get("test_result") == "fail":
        retry_counts = state.get("retry_counts", {})
        if retry_counts.get("dev", 0) >= MAX_DEV_RETRIES:
            logger.warning("Test 失败且重试耗尽 → Error")
            return "retry_exhausted"
        logger.info(f"Test 失败 → 回退到 Dev (重试 {retry_counts.get('dev', 0)}/{MAX_DEV_RETRIES})")
        return "to_dev"
    return END


def route_after_dev(state: PipelineState) -> str:
    guard_ok, guard_msg = _check_guardrails(state)
    if not guard_ok:
        logger.error(f"[GUARDRAIL] 防护触发: {guard_msg}")
        return "retry_exhausted"

    step_count = state.get("step_count", 0)
    if step_count >= MAX_STEPS:
        logger.error(f"[GUARDRAIL] 步骤数超限: {step_count}/{MAX_STEPS}")
        return "retry_exhausted"

    cb_status = state.get("circuit_breaker_status", {})
    if cb_status.get("dev") == CircuitBreaker.HALT:
        logger.error("[GUARDRAIL] Dev 节点熔断器已 HALT")
        return "retry_exhausted"

    review_result = state.get("review_result", "pending")
    test_result = state.get("test_result", "pending")
    if review_result == "pending" and test_result == "pending":
        return "to_review"
    elif review_result == "fail":
        return "to_review"
    elif test_result == "fail":
        return "to_test"
    return END


# ============================================================
# 8. 构建 StateGraph DAG
# ============================================================

def _get_checkpointer():
    try:
        from langgraph.checkpoint.sqlite import SqliteSaver
        import sqlite3
        logger.info(f"使用 SqliteSaver: {CHECKPOINT_DB}")
        conn = sqlite3.connect(CHECKPOINT_DB, check_same_thread=False)
        saver = SqliteSaver(conn)
        return saver
    except ImportError:
        logger.warning("langgraph-checkpoint-sqlite 未安装，回退到 InMemorySaver")
        from langgraph.checkpoint.memory import InMemorySaver
        return InMemorySaver()
    except Exception as e:
        logger.warning(f"SqliteSaver 初始化失败 ({e})，回退到 InMemorySaver")
        from langgraph.checkpoint.memory import InMemorySaver
        return InMemorySaver()


def _interrupt_handler(state: PipelineState) -> dict:
    logger.info("⏸️  等待人工介入...")
    print("\n" + "=" * 60)
    print("⏸️  质量门控检测到问题，需要人工确认")
    print("=" * 60)
    print(f"  节点: {state.get('current_node', '?')}")
    print(f"  质量分: {state.get('quality_scores', {}).get(state.get('current_node', ''), 'N/A')}")
    print(f"  Token 消耗: {state.get('token_usage', {}).get('total', 0)}")
    print(f"  预估成本: ${state.get('total_cost_usd', 0):.4f}")
    print("-" * 60)
    print("  [R] 继续重试 (Retry)")
    print("  [S] 强制通过 (Skip)")
    print("  [F] 终止 (Fail)")
    print("=" * 60)
    return {"human_interrupt": True}


def build_pipeline(enable_hitl: bool = True) -> Any:
    workflow = StateGraph(PipelineState)

    workflow.add_node("pm", _pm_handler)
    workflow.add_node("ux", _ux_handler)
    workflow.add_node("a2ui", _a2ui_handler)
    workflow.add_node("dev", _dev_handler)
    workflow.add_node("review", _review_handler)
    workflow.add_node("test", _test_handler)
    workflow.add_node("error_handler", _error_handler)
    workflow.add_node("human_review", _interrupt_handler)

    workflow.set_entry_point("pm")

    workflow.add_edge("pm", "ux")
    workflow.add_edge("ux", "a2ui")
    workflow.add_edge("a2ui", "dev")
    workflow.add_edge("dev", "review")

    workflow.add_conditional_edges(
        "review", route_after_review,
        {"to_tester": "test", "to_dev": "dev", "retry_exhausted": "error_handler"},
    )

    workflow.add_conditional_edges(
        "test", route_after_test,
        {"to_end": END, "to_dev": "dev", "retry_exhausted": "error_handler"},
    )

    workflow.add_conditional_edges(
        "dev", route_after_dev,
        {"to_review": "review", "to_test": "test", "to_end": END},
    )

    workflow.add_edge("error_handler", END)

    checkpointer = _get_checkpointer()

    compile_kwargs = {"checkpointer": checkpointer}
    if enable_hitl:
        compile_kwargs["interrupt_before"] = ["review", "test"]

    compiled = workflow.compile(**compile_kwargs)
    return compiled


def _error_handler(state: PipelineState) -> dict:
    return {
        "current_node": "error_handler",
        "result_status": "fail",
        "error": "重试次数耗尽，流水线失败",
        "completed_at": time.time(),
        "messages": [{"role": "assistant", "content": "[Error] 重试次数耗尽，流水线失败"}],
    }


# ============================================================
# 9. 执行引擎
# ============================================================

class PipelineOrchestrator:
    def __init__(self, enable_hitl: bool = False):
        self.graph = build_pipeline(enable_hitl=enable_hitl)
        self._enable_hitl = enable_hitl

    def run(self, scene_description: str, config_id: str | None = None) -> PipelineState:
        state = _create_initial_state(scene_description)
        thread_id = config_id or hashlib.sha256(scene_description.encode()).hexdigest()[:12]
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": MAX_STEPS * 3,
        }

        result = self.graph.invoke(state, config=config)
        return PipelineState(**result) if isinstance(result, dict) else result

    def stream(self, scene_description: str, config_id: str | None = None):
        state = _create_initial_state(scene_description)
        thread_id = config_id or hashlib.sha256(scene_description.encode()).hexdigest()[:12]
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": MAX_STEPS * 3,
        }

        for event in self.graph.stream(state, config=config):
            yield event

    def resume(self, thread_id: str, input_data: dict | None = None):
        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": MAX_STEPS * 3,
        }
        result = self.graph.invoke(input_data, config=config)
        return result

    def get_state(self, thread_id: str):
        config = {"configurable": {"thread_id": thread_id}}
        return self.graph.get_state(config)

    def list_threads(self):
        from langgraph.checkpoint.sqlite import SqliteSaver
        import sqlite3
        conn = sqlite3.connect(CHECKPOINT_DB)
        cursor = conn.execute("SELECT DISTINCT thread_id FROM checkpoints ORDER BY thread_id")
        threads = [row[0] for row in cursor.fetchall()]
        conn.close()
        return threads

    def get_execution_log(self, thread_id: str) -> list[dict]:
        state = self.get_state(thread_id)
        if not state:
            return []
        return state.get("execution_logs", [])

    def get_node_logs(self, thread_id: str) -> dict:
        state = self.get_state(thread_id)
        if not state:
            return {}
        return state.get("node_execution_logs", {})

    def get_cost_report(self, thread_id: str) -> dict:
        state = self.get_state(thread_id)
        if not state:
            return {}
        token_usage = state.get("token_usage", {})
        cost = state.get("total_cost_usd", 0.0)
        elapsed = (state.get("completed_at") or time.time()) - state.get("started_at", time.time())
        return {
            "thread_id": thread_id,
            "elapsed_seconds": round(elapsed, 2),
            "token_usage": token_usage,
            "total_cost_usd": cost,
            "node_logs": state.get("node_execution_logs", {}),
            "quality_scores": state.get("quality_scores", {}),
        }


# ============================================================
# 10. 报告生成
# ============================================================

def generate_execution_report(state: PipelineState, thread_id: str) -> str:
    lines = ["=" * 70, "A2UI 6-Agent 执行报告", "=" * 70]

    scene = state.get("messages", [{}])[0].get("content", "N/A")
    lines.append(f"\n场景: {scene}")
    lines.append(f"Thread ID: {thread_id}")

    elapsed = (state.get("completed_at") or time.time()) - state.get("started_at", time.time())
    lines.append(f"总耗时: {elapsed:.2f}s")

    status = state.get("result_status", "unknown")
    status_icon = "✅" if status == "pass" else "❌"
    lines.append(f"最终状态: {status_icon} {status}")

    token_usage = state.get("token_usage", {})
    budget = token_usage.get("budget_limit", TOKEN_BUDGET)
    total = token_usage.get("total", 0)
    lines.append(f"Token 消耗: {total:,} / {budget:,} ({total/budget*100:.1f}%)")

    cost = state.get("total_cost_usd", 0.0)
    lines.append(f"预估成本: ${cost:.4f}")

    lines.append("\n" + "-" * 70)
    lines.append("节点执行日志:")
    lines.append("-" * 70)

    node_logs = state.get("node_execution_logs", {})
    for node_id, entries in node_logs.items():
        for entry in entries:
            lines.append(
                f"  [{entry['node_label']}] "
                f"duration={entry['duration_ms']}ms, "
                f"score={entry['quality_score']}, "
                f"gate={entry['quality_gate']}, "
                f"tokens={entry['token_usage'].get('total', 0)}"
            )

    lines.append("\n" + "-" * 70)
    lines.append("质量评分:")
    lines.append("-" * 70)
    for node_id, score in state.get("quality_scores", {}).items():
        bar = "█" * (score // 5) + "░" * (20 - score // 5)
        lines.append(f"  {node_id:10s} | {bar} | {score}/100")

    lines.append("\n" + "-" * 70)
    lines.append("产物清单:")
    lines.append("-" * 70)
    for name, info in state.get("artifacts", {}).items():
        if isinstance(info, dict):
            lines.append(
                f"  📄 {name:25s} → {info.get('file', '?'):30s} "
                f"consumers: {info.get('consumers', [])}"
            )

    lines.append("\n" + "-" * 70)
    lines.append("消息序列:")
    lines.append("-" * 70)
    for msg in state.get("messages", []):
        if isinstance(msg, dict) and msg.get("role") == "assistant":
            lines.append(f"  💬 {msg['content']}")

    if state.get("error"):
        lines.append(f"\n⚠️  错误: {state['error']}")

    lines.append("\n" + "=" * 70)
    return "\n".join(lines)


# ============================================================
# 11. Main
# ============================================================

def main():
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    scene = sys.argv[1] if len(sys.argv) > 1 else "会议助手 App"

    print("=" * 70)
    print("A2UI 6-Agent LangGraph 编排引擎 v2.0")
    print("=" * 70)

    orchestrator = PipelineOrchestrator()

    print(f"\n▶ 启动流水线: {scene}")
    print("-" * 70)

    thread_id = None
    for event in orchestrator.stream(scene):
        for node_name, node_state in event.items():
            if isinstance(node_state, dict):
                current = node_state.get("current_node", "?")
                status = node_state.get("result_status",
                                        node_state.get("test_result",
                                                       node_state.get("review_result", "")))
                retries = node_state.get("retry_counts", {})
                token_total = node_state.get("token_usage", {}).get("total", 0)
                cost = node_state.get("total_cost_usd", 0.0)
                print(f"  [{current:10s}] status={status:6s} retries={retries.get('dev', 0)}/3 tokens={token_total:,} cost=${cost:.4f}")

    result = orchestrator.run(scene)

    thread_id = hashlib.sha256(scene.encode()).hexdigest()[:12]
    report = generate_execution_report(result, thread_id)
    print(report)

    if result.get("result_status") == "pass":
        logger.info("流水线执行成功")
    else:
        logger.error("流水线执行失败")
        sys.exit(1)


if __name__ == "__main__":
    main()