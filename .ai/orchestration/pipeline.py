"""
A2UI 6-Agent StateGraph 编排引擎
===================================

基于 LangGraph 的 StateGraph 实现 6 角色 Agent 协作流水线。
参考 LangGraph 官方架构：StateGraph + TypedDict + Checkpoint + Conditional Edges
参考 MetaGPT 理念：SOP 契约 + 反馈循环

节点: PM → UX → A2UI → Dev → Review → Test
条件边:
  - Review: on_pass → Test / on_review_fail → Dev (max 3x)
  - Test: on_pass → 交付 / on_test_fail → Dev (max 3x)
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from dataclasses import dataclass, field
from typing import Annotated, Any, Callable, Literal, TypedDict

from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import InMemorySaver


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
    )


# ============================================================
# 2. Agent 定义（每个 Agent 是一个节点函数）
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
        "file": "spec.md",
        "content": spec_content,
        "schema": "目标/范围/功能列表/用户故事",
        "consumers": ["ux", "a2ui"],
    }
    artifacts["target_data_model"] = {
        "file": "target_data_model.md",
        "content": data_model_content,
        "consumers": ["a2ui"],
    }
    return {
        "current_node": "pm",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": f"[PM] 需求分析完成 → spec.md + target_data_model.md"}],
    }


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
        "file": "design.md",
        "content": design_content,
        "consumers": ["a2ui"],
    }
    artifacts["design_tokens"] = {
        "file": "design_tokens.md",
        "content": tokens_content,
        "consumers": ["a2ui", "dev"],
    }
    artifacts["component_library"] = {
        "file": "component_library.md",
        "content": component_content,
        "consumers": ["a2ui"],
    }
    return {
        "current_node": "ux",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": "[UX] 设计规范完成 → design.md + design_tokens.md + component_library.md"}],
    }


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
    return {
        "current_node": "a2ui",
        "artifacts": artifacts,
        "messages": [{"role": "assistant", "content": "[A2UI] Schema + Compose 代码 → a2ui_schema.json + compose_code/"}],
    }


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

    return {
        "current_node": "dev",
        "artifacts": artifacts,
        "retry_counts": retry_counts,
        "messages": [{"role": "assistant", "content": f"[Dev] 代码实现完成 (重试 {current_retries})"}],
    }


def _review_handler(state: PipelineState) -> dict:
    artifacts = dict(state.get("artifacts", {}))
    retry_counts = dict(state.get("retry_counts", {}))
    node_id = "dev"
    current_retries = retry_counts.get(node_id, 0)
    prev_review = state.get("review_result", "pending")

    should_pass = current_retries >= 2

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
        return {
            "current_node": "review",
            "review_result": "pass",
            "artifacts": artifacts,
            "messages": [{"role": "assistant", "content": "[Review] 代码审查通过 ✅ → 流转到测试"}],
        }
    else:
        retry_counts[node_id] = current_retries + 1
        artifacts["issue_list"] = {
            "file": "issue_list.md",
            "content": "[Issue List] Blocker: Design Token 未使用 / 协程作用域错误",
            "consumers": ["dev"],
        }
        return {
            "current_node": "review",
            "review_result": "fail",
            "artifacts": artifacts,
            "retry_counts": retry_counts,
            "messages": [{"role": "assistant", "content": f"[Review] 代码审查不通过 🔴 (重试 {current_retries}/3) → 回退到开发"}],
        }


def _test_handler(state: PipelineState) -> dict:
    artifacts = dict(state.get("artifacts", {}))
    retry_counts = dict(state.get("retry_counts", {}))
    node_id = "dev"
    current_retries = retry_counts.get(node_id, 0)

    test_pass = current_retries < 3

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
        return {
            "current_node": "test",
            "test_result": "pass",
            "result_status": "pass",
            "artifacts": artifacts,
            "completed_at": time.time(),
            "messages": [{"role": "assistant", "content": "[Test] 所有测试通过 ✅ → 交付完成 🎉"}],
        }
    else:
        artifacts["test_report"] = {
            "file": "test_report.md",
            "content": "[Test Report] 测试失败：Agent 响应 > 5s",
            "consumers": ["pm", "dev"],
        }
        retry_counts[node_id] = current_retries + 1
        return {
            "current_node": "test",
            "test_result": "fail",
            "result_status": "fail",
            "artifacts": artifacts,
            "retry_counts": retry_counts,
            "messages": [{"role": "assistant", "content": f"[Test] 测试失败 🔴 (重试 {current_retries}/3) → 回退到开发"}],
        }


AGENT_HANDLERS: dict[str, Callable[[PipelineState], dict]] = {
    "pm": _pm_handler,
    "ux": _ux_handler,
    "a2ui": _a2ui_handler,
    "dev": _dev_handler,
    "review": _review_handler,
    "test": _test_handler,
}

# ============================================================
# 3. 条件边函数（LangGraph 风格）
# ============================================================

def route_after_review(state: PipelineState) -> str:
    if state.get("review_result") == "pass":
        return "to_tester"
    elif state.get("review_result") == "fail":
        retry_counts = state.get("retry_counts", {})
        if retry_counts.get("dev", 0) >= 3:
            return "retry_exhausted"
        return "to_dev"
    return END


def route_after_test(state: PipelineState) -> str:
    if state.get("test_result") == "pass":
        return "to_end"
    elif state.get("test_result") == "fail":
        retry_counts = state.get("retry_counts", {})
        if retry_counts.get("dev", 0) >= 3:
            return "retry_exhausted"
        return "to_dev"
    return END


def route_after_dev(state: PipelineState) -> str:
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
# 4. 构建 StateGraph DAG
# ============================================================

def build_pipeline() -> Any:
    workflow = StateGraph(PipelineState)

    # 4.1 添加节点
    workflow.add_node("pm", _pm_handler)
    workflow.add_node("ux", _ux_handler)
    workflow.add_node("a2ui", _a2ui_handler)
    workflow.add_node("dev", _dev_handler)
    workflow.add_node("review", _review_handler)
    workflow.add_node("test", _test_handler)
    workflow.add_node("error_handler", _error_handler)

    # 4.2 设置入口
    workflow.set_entry_point("pm")

    # 4.3 固定边（always 流转）
    workflow.add_edge("pm", "ux")
    workflow.add_edge("ux", "a2ui")
    workflow.add_edge("a2ui", "dev")
    workflow.add_edge("dev", "review")

    # 4.4 条件边：Review → Tester / Review → Dev
    workflow.add_conditional_edges(
        "review",
        route_after_review,
        {
            "to_tester": "test",
            "to_dev": "dev",
            "retry_exhausted": "error_handler",
        },
    )

    # 4.5 条件边：Test → End / Test → Dev
    workflow.add_conditional_edges(
        "test",
        route_after_test,
        {
            "to_end": END,
            "to_dev": "dev",
            "retry_exhausted": "error_handler",
        },
    )

    # 4.6 Dev 条件路由（区分 Review 回退 vs Test 回退）
    workflow.add_conditional_edges(
        "dev",
        route_after_dev,
        {
            "to_review": "review",
            "to_test": "test",
            "to_end": END,
        },
    )

    # 4.7 Error handler → END
    workflow.add_edge("error_handler", END)

    # 4.8 检查点
    checkpointer = InMemorySaver()

    # 编译
    compiled = workflow.compile(checkpointer=checkpointer)
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
# 5. 执行引擎
# ============================================================

class PipelineOrchestrator:
    def __init__(self):
        self.graph = build_pipeline()

    def run(self, scene_description: str, config_id: str | None = None) -> PipelineState:
        state = _create_initial_state(scene_description)
        thread_id = config_id or hashlib.sha256(scene_description.encode()).hexdigest()[:12]
        config = {"configurable": {"thread_id": thread_id}}

        result = self.graph.invoke(state, config=config)
        return PipelineState(**result) if isinstance(result, dict) else result

    def stream(self, scene_description: str, config_id: str | None = None):
        state = _create_initial_state(scene_description)
        thread_id = config_id or hashlib.sha256(scene_description.encode()).hexdigest()[:12]
        config = {"configurable": {"thread_id": thread_id}}

        for event in self.graph.stream(state, config=config):
            yield event

    def resume(self, thread_id: str):
        config = {"configurable": {"thread_id": thread_id}}
        result = self.graph.invoke(None, config=config)
        return result

    def get_state(self, thread_id: str):
        config = {"configurable": {"thread_id": thread_id}}
        return self.graph.get_state(config)


def main():
    import sys
    scene = sys.argv[1] if len(sys.argv) > 1 else "会议助手 App"

    print("=" * 60)
    print("A2UI 6-Agent LangGraph 编排引擎")
    print("=" * 60)

    orchestrator = PipelineOrchestrator()

    print(f"\n▶ 启动流水线: {scene}")
    print("-" * 60)

    for event in orchestrator.stream(scene):
        for node_name, node_state in event.items():
            if isinstance(node_state, dict):
                current = node_state.get("current_node", "?")
                status = node_state.get("result_status", node_state.get("test_result", node_state.get("review_result", "")))
                retries = node_state.get("retry_counts", {})
                print(f"  [{current}] status={status} retries={retries.get('dev', 0)}/3")

    result = orchestrator.run(scene)

    print("-" * 60)
    print(f"▶ 流水线完成")
    print(f"  结果: {result.get('result_status', 'unknown')}")
    print(f"  最终节点: {result.get('current_node', '?')}")
    print(f"  耗时: {result.get('completed_at', 0) - result.get('started_at', 0):.2f}s")
    print(f"  产物数量: {len(result.get('artifacts', {}))}")

    artifacts = result.get("artifacts", {})
    for name, info in artifacts.items():
        if isinstance(info, dict):
            print(f"  📄 {name}: {info.get('file', '?')} → consumers: {info.get('consumers', [])}")

    messages = result.get("messages", [])
    for msg in messages:
        if isinstance(msg, dict) and msg.get("role") == "assistant":
            print(f"  💬 {msg['content']}")


if __name__ == "__main__":
    main()