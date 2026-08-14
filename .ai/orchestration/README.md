# A2UI 6-Agent 状态图编排

> **版本**: v2.0 | **日期**: 2026-08-14  
> **架构**: LangGraph StateGraph + MetaGPT SOP 契约  
> **运行时**: Python + langgraph ≥ 1.0  
> **SSOT**: `.ai/orchestration/`

## 快速启动

```bash
# 安装依赖
pip install -r .ai/orchestration/requirements.txt

# 运行流水线
python .ai/orchestration/pipeline.py "会议助手 App"
```

## 核心概念

### StateGraph (LangGraph 风格)

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated

class PipelineState(TypedDict):
    messages: Annotated[list, _merge_lists]
    current_node: str
    artifacts: dict
    retry_counts: dict[str, int]
    result_status: Literal["pending", "pass", "fail"]
    review_result: Literal["pending", "pass", "fail"]
    test_result: Literal["pending", "pass", "fail"]

workflow = StateGraph(PipelineState)
workflow.add_node("pm", _pm_handler)
workflow.add_node("ux", _ux_handler)
workflow.add_edge("pm", "ux")
# ... 添加所有节点和边
compiled = workflow.compile(checkpointer=checkpointer)
result = compiled.invoke(initial_state)
```

### 6 节点 DAG

```
START ──▶ [PM] ──▶ [UX] ──▶ [A2UI] ──▶ [Dev] ──▶ [Review]
                                                        │
                                          ┌─────────────┼──────────────┐
                                          ▼                          ▼
                                    [on_pass]                 [on_review_fail]
                                          │                          │
                                          ▼                          ▼
                                     [Test]                    [Dev] (max 3x)
                                          │                          │
                                    ┌─────┼─────┐                    │
                                    ▼           ▼                    │
                              [on_pass]   [on_test_fail]             │
                                    │           │                    │
                                    ▼           ▼                    │
                                  END        [Dev] (max 3x) ◀───────┘
```

### 检查点策略

LangGraph Checkpointer 自动保存每个节点执行后的状态快照：
- **InMemorySaver**: 内存检查点（用于开发和测试）
- **SqliteSaver**: SQLite 持久化（用于生产环境，支持断点恢复）

```python
from langgraph.checkpoint.memory import InMemorySaver
# 或
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
compiled = workflow.compile(checkpointer=checkpointer)
```

### 条件边

```python
# Review 条件路由
workflow.add_conditional_edges(
    "review",
    route_after_review,
    {
        "to_tester": "test",
        "to_dev": "dev",
        "retry_exhausted": "error_handler",
    },
)
```

### 反馈循环

MetaGPT 风格的反馈循环，max 3 次重试：

```python
def route_after_review(state: PipelineState) -> str:
    if state.get("review_result") == "pass":
        return "to_tester"
    retry_counts = state.get("retry_counts", {})
    if retry_counts.get("dev", 0) >= 3:
        return "retry_exhausted"
    return "to_dev"
```

## Agent 节点规格

| 节点 | node_id | 类型 | 输出产物 | 消费者 |
|------|---------|------|---------|--------|
| PM | pm | source | spec.md, target_data_model.md | ux, a2ui |
| UX | ux | transform | design.md, design_tokens.md, component_library.md | a2ui, dev |
| A2UI | a2ui | transform | a2ui_schema.json, compose_code/, data_mapping.md | dev |
| Dev | dev | transform | project_root/, ARCHITECTURE.md | reviewer, tester |
| Review | review | transform | code_package/, review_comments.md / issue_list.md | tester / dev |
| Test | test | sink | test_report.md, performance_baseline.md | pm, dev |

## 运行模式

### 1. invoke() — 单次执行

```python
result = orchestrator.run("会议助手 App")
print(result["result_status"])  # "pass"
```

### 2. stream() — 流式执行

```python
for event in orchestrator.stream("会议助手 App"):
    for node, state in event.items():
        print(f"[{state['current_node']}] {state.get('result_status', '')}")
```

### 3. 检查点恢复

```python
thread_id = "unique-session-id"
config = {"configurable": {"thread_id": thread_id}}
state = orchestrator.resume(thread_id)
```

## 文件结构

```
.ai/orchestration/
├── requirements.txt          # Python 依赖
├── pipeline.py               # 主编排引擎（StateGraph 实现）
├── SOP.md                    # MetaGPT 风格标准操作流程
└── README.md                 # 本文档
```