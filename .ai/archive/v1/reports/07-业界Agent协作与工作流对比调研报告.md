# 业界 Agent 协作与工作流对比调研报告

> **版本**: v1.0 | **日期**: 2026-08-14 | **调研范围**: 7 大主流框架 + 5 大协作模式

---

## 一、执行摘要

当前 Agent 框架已从"单 Agent 工具调用"演进为"多 Agent 协作系统"。本报告系统调研了 **AutoGen、LangGraph、CrewAI、MetaGPT、OpenAI Agents SDK/Swarm、Google ADK、Amazon Bedrock AgentCore** 七大主流框架，从架构模型、通信机制、编排模式、状态管理、生产就绪度五个维度进行深度对比。

**核心发现**:
1. **没有银弹** — 不同框架在不同协作模式下各有优势，需按场景选型
2. **图编排范式** 正成为主流（LangGraph / AgentCore / ADK 均采用）
3. **角色驱动 + SOP** 模式在垂直领域（如软件开发）表现优异（MetaGPT / CrewAI）
4. **对话式协作** 适合开放域任务（AutoGen），但需防止循环死锁
5. **MCP 与 A2A 协议** 正成为跨框架互操作的标准

---

## 二、框架逐一深度分析

### 2.1 AutoGen（Microsoft）

**官网**: https://github.com/microsoft/autogen  
**GitHub Stars**: 30k+  
**定位**: 对话驱动的多 Agent 协作框架

#### 架构模型

```
┌─────────────────────────────────────────────┐
│            AutoGen 三层架构                  │
├─────────────────────────────────────────────┤
│  扩展层 (Extensions)                        │
│  ├─ LocalSearchTool (本地搜索)               │
│  ├─ MultimodalWebSurfer (多模态浏览)         │
│  └─ 自定义扩展                               │
├─────────────────────────────────────────────┤
│  AgentChat 层 (对话式 Agent 集)              │
│  ├─ AssistantAgent (LLM 驱动的助手)          │
│  ├─ UserProxyAgent (代码执行与工具代理)      │
│  └─ GroupChatManager (群聊协调器)            │
├─────────────────────────────────────────────┤
│  Core 层 (事件驱动运行时)                    │
│  ├─ 消息传递 API                            │
│  ├─ 事件驱动 Agent 运行时                    │
│  └─ 本地/分布式执行环境                      │
└─────────────────────────────────────────────┘
```

#### 核心协作模式

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| **对话式协作** | Agent 间通过自由对话协商任务分工 | 开放式研究、头脑风暴 |
| **GroupChat** | 多 Agent 群聊，RoundRobin 轮发言 | 多角色讨论、决策会议 |
| **MagneticOne** | 通用 Agent 动态调度专家 Agent | 复杂开放任务分解 |
| **嵌套 Team** | Team 内嵌套 Team，层级化组织 | 大型项目、多团队协作 |
| **Human-in-the-Loop** | Agent 与人类交替交互 | 需要人工审批的流程 |

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 成熟度高（30k+ Stars，大量生产案例） | 对话循环易死锁，需 `max_turns` 硬限制 |
| 内置代码执行沙箱 | 2026 版前无类型化状态管理 |
| AutoGen Studio 提供无代码拖拽界面 | 分布式运行时仍为实验性 |
| 2026 升级为 Microsoft Agent Framework（基于 Workflow 图） | 对话式协作的 Token 消耗较高 |

#### 最新演进：Microsoft Agent Framework

微软 2026 年将 AutoGen 升级为 **Agent Framework**，核心变化：
- 从事件驱动 → **图编排队列（GraphFlow）**
- 引入类型化 State，替代自由对话
- 原生支持 OpenAI Responses API（区别于 Chat Completions）
- 托管工具：代码解释器、Web 搜索
- 检查点（Checkpoint）支持断点续跑
- 内置可观测性（OpenTelemetry 集成）

---

### 2.2 LangGraph（LangChain）

**官网**: https://github.com/langchain-ai/langgraph  
**定位**: 基于状态图的 Agent 编排框架

#### 架构模型

```
┌─────────────────────────────────────────────┐
│          LangGraph 核心架构                  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │ Node A  │───▶│ Node B  │───▶│ Node C  │ │
│  │(Agent/  │    │(Agent/  │    │(Agent/  │ │
│  │ Tool)   │    │ Tool)   │    │ Tool)   │ │
│  └────┬────┘    └────┬────┘    └─────────┘ │
│       │              │              ▲       │
│       ▼              ▼              │       │
│  ┌─────────────────────────────────────┐    │
│  │         Centralized State           │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  Typed State (GraphState)   │    │    │
│  │  │  - messages: list            │    │    │
│  │  │  - research_data: dict      │    │    │
│  │  │  - final_output: str         │    │    │
│  │  │  - ...                      │    │    │
│  │  └─────────────────────────────┘    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  控制流机制：                                │
│  • Conditional Edges（条件跳转）             │
│  • Parallel Execution（并行执行）            │
│  • Scatter-Gather（分发-聚合）              │
│  • Cyclic Loops（循环迭代）                 │
│  • Interrupt/Resume（中断/恢复）            │
│  • Checkpoint（检查点持久化）              │
└─────────────────────────────────────────────┘
```

#### 核心协作模式

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| **顺序管线** | 节点按 DAG 顺序执行 | 固定流程如文档处理 |
| **条件路由** | 根据 State 条件跳转 | 意图分类、分支决策 |
| **并行扇出/扇入** | 多 Agent 并行处理后合并 | 多源数据收集、投票决策 |
| **监督者-工作者** | Supervisor 动态分配任务 | 开放域问题求解 |
| **评估者-优化者** | Generator → Evaluator 循环 | 代码生成、内容优化 |
| **人机交替** | Interrupt 暂停等待人工输入 | 审批流程、策略审查 |

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 类型化状态管理，可审计可追溯 | 学习曲线陡峭，复杂图设计困难 |
| 编译时验证（Cycle 检测、路径优化） | 状态同步开销（不可变数据结构） |
| Checkpoint 持久化，支持断点续跑 | 大量 Agent 并行时可能出现状态竞争 |
| LangSmith 深度集成，可视化调试 | 对于简单任务过度工程化 |
| 内置 Human-in-the-Loop 支持 | 调试分布式 Agent 复杂 |
| 支持子图嵌套，模块化复用 | — |

#### 核心代码模式

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str
    research_data: dict
    final_output: str

def research_node(state: AgentState):
    return {"research_data": research_result, "next_step": "analyze"}

def analyze_node(state: AgentState):
    return {"messages": [analysis], "next_step": "write"}

def should_continue(state: AgentState):
    return state.get("next_step", "end")

workflow = StateGraph(AgentState)
workflow.add_node("research", research_node)
workflow.add_node("analyze", analyze_node)
workflow.add_conditional_edges("research", should_continue, {"analyze": "analyze", "end": END})
app = workflow.compile()
```

---

### 2.3 CrewAI

**官网**: https://github.com/crewAIInc/crewAI  
**GitHub Stars**: 20k+  
**定位**: 角色驱动的团队协作框架

#### 架构模型

```
┌─────────────────────────────────────────────┐
│           CrewAI 角色团队架构                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           Crew (团队容器)             │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │     Process (执行流程)        │    │    │
│  │  │  • Sequential（顺序）        │    │    │
│  │  │  • Hierarchical（层级）      │    │    │
│  │  │  • Custom（自定义 Flow）     │    │    │
│  │  └─────────────────────────────┘    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Agent (角色化智能体)                        │
│  ├─ role: "高级研究员"                       │
│  ├─ goal: "全面收集准确信息"                 │
│  ├─ backstory: "你是资深研究员..."            │
│  ├─ tools: [search_tool]                    │
│  └─ allow_delegation: true/false            │
│                                             │
│  Task (任务单元)                             │
│  ├─ description: "研究{topic}的关键数据"      │
│  ├─ expected_output: "带引用的研究简报"       │
│  ├─ agent: researcher                       │
│  └─ context: [other_task]  ← 依赖前序任务    │
│                                             │
│  Memory (记忆系统)                           │
│  ├─ Short-term: 当前会话上下文               │
│  ├─ Long-term: 历史知识持久化               │
│  └─ Shared: Agent 间共享信息池               │
└─────────────────────────────────────────────┘
```

#### 核心协作模式

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| **顺序管线** | 任务按 `context` 依赖顺序执行 | 内容生产流水线 |
| **层级管理** | Manager Agent 动态分配任务给 Worker | 复杂项目协调 |
| **任务委托** | Agent 可将子任务委托给其他 Agent | 递归问题分解 |
| **Flow 可视化** | YAML 定义条件分支和循环 | 复杂业务流程 |
| **并行执行** | 独立任务并行处理 | 多源数据收集 |

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 角色-目标-背景三元组驱动，行为一致性高 | Token 消耗大（递归 Agent 循环） |
| YAML 配置驱动，非技术人员可维护 | 调试困难（幻觉链式传播） |
| 内置任务委托机制 | 企业级可观测性需付费 AMP 平台 |
| 独立架构，无 LangChain 依赖 | 长流程中上下文管理脆弱 |
| Fortune 500 验证（63% 采用） | 强 Python 绑定 |

---

### 2.4 MetaGPT

**官网**: https://github.com/geekan/MetaGPT  
**GitHub Stars**: 65k+  
**定位**: SOP 驱动的软件公司仿真框架

#### 架构模型

```
┌─────────────────────────────────────────────────────────┐
│          MetaGPT "AI 软件公司" 架构                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  用户需求 ──▶ ┌────────────────────────────────────┐    │
│              │     Publish-Subscribe MessagePool    │    │
│              │  (结构化消息池，按类型订阅)           │    │
│              └──────────────┬───────────────────────┘    │
│                             │                            │
│    ┌────────────────────────┼────────────────────────┐   │
│    ▼            ▼            ▼            ▼          ▼   │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   │
│  │  PM  │   │ Arch │   │  PM  │   │ Eng  │   │  QA  │   │
│  │产品经理│   │架构师│   │项目经理│   │工程师│   │测试师│   │
│  └──┬───┘   └──┬───┘   └──┬───┘   └──┬───┘   └──┬───┘   │
│     │          │          │          │          │        │
│     ▼          ▼          ▼          ▼          ▼        │
│   PRD文档  设计文档   任务列表   源代码     测试用例      │
│                                                         │
│  核心公式: Code = SOP(Team)                              │
│  • SOP = 标准操作流程（编码为 Prompt 序列）                │
│  • Team = 角色化 Agent 团队                              │
│  • 每个角色有严格的 Input/Output 契约                     │
│                                                         │
│  反馈循环:                                               │
│  Engineer 生成代码 → QA 执行测试 → 失败则 Engineer 修正    │
│  （最多 3 次迭代，实现 HumanEval +4.2% 提升）              │
└─────────────────────────────────────────────────────────┘
```

#### 角色-产物映射表

| 角色 | 输入 | 输出（产物） | 对应 Action |
|------|------|-------------|------------|
| Product Manager | 用户需求 | PRD 文档 | WritePRD |
| Architect | PRD | 设计文档 + API 规范 | WriteDesign |
| Project Manager | 设计文档 | 任务列表 + 依赖关系 | WriteTasks |
| Engineer | 任务列表 + 设计 | 源代码 | WriteCode |
| QA Engineer | 源代码 | 测试用例 + 报告 | WriteTest |

#### 优势与局限

| 优势 | 局限 |
|------|------|
| SOP 编码人类流程，幻觉率最低 | 灵活性差（固定流水线） |
| 结构化 Output，产物可审阅 | 仅适合软件开发场景 |
| Pub/Sub 消息池，信息过载防护 | 非软件工程领域需重新定义角色 |
| 124.3 Token/代码行（仅为 ChatDev 的 50%） | 调试仍需深入框架 |
| 可执行反馈循环，代码质量持续提升 | 角色间耦合度较高 |

---

### 2.5 OpenAI Agents SDK / Swarm

**Swarm 官网**: https://github.com/openai/swarm  
**定位**: 极简 Agent 交接（Handoff）框架 + 生产级 Agents SDK

#### Swarm 架构（极简教学框架）

```
┌─────────────────────────────────────────────┐
│            OpenAI Swarm 架构                │
├─────────────────────────────────────────────┤
│                                             │
│  核心概念（仅 2 个）：                       │
│  1. Agent — 指令 + 函数集合                  │
│  2. Handoff — Agent 间的控制权交接            │
│                                             │
│  ┌──────────┐   handoff    ┌──────────┐     │
│  │ Agent A  │─────────────▶│ Agent B  │     │
│  │(通用助手) │  function    │(算术专家) │     │
│  └──────────┘  returns     └──────────┘     │
│                Agent B                      │
│                                             │
│  特点：                                     │
│  • 无状态（基于 Chat Completions API）      │
│  • 零服务器开销                              │
│  • 仅支持 OpenAI 生态                       │
│  • 明确标注为"教学/实验性"                   │
└─────────────────────────────────────────────┘
```

#### OpenAI Agents SDK（生产级演进）

| 特性 | Swarm | Agents SDK |
|------|-------|------------|
| 状态管理 | 无 | 会话持久化 |
| 模型支持 | 仅 OpenAI | 多模型（含 Anthropic/Llama） |
| 多 Agent 协作 | Handoff | Handoff + 并行 |
| 工具集成 | function → JSON Schema | 自动推断 Schema |
| 可观测性 | 无 | 内建追踪 |
| 生产就绪 | ❌ | ✅ |

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 极简心智模型，上手最快 | Swarm 无状态，不适合复杂系统 |
| 与 OpenAI API 深度集成，延迟最低 | Swarm 绑定 OpenAI 生态 |
| SDK 支持多模型和并行协作 | 相比 LangGraph 控制粒度较低 |
| 内建 Guardrails（输入/输出校验） | 社区生态不如 LangChain |

---

### 2.6 Google ADK（Agent Development Kit）

**官网**: https://google.github.io/adk/  
**定位**: Google Cloud 生态的企业级 Agent 开发框架

#### 架构模型

```
┌─────────────────────────────────────────────┐
│          Google ADK 架构                     │
├─────────────────────────────────────────────┤
│                                             │
│  核心抽象：                                  │
│  • Agent（类 + 方法风格，软件工程范式）       │
│  • Tool（函数 → 工具自动注册）               │
│  • Workflow（状态图编排）                    │
│  • Evaluator（质量评估）                     │
│                                             │
│  关键特性：                                  │
│  • 多语言支持（Python + TypeScript）         │
│  • A2A 协议原生支持（Agent-to-Agent）        │
│  • MCP 协议支持（Model Context Protocol）    │
│  • 深度集成 Google 工具（Search/Gmail/Cal）  │
│  • Vertex AI Grounding（事实核查）           │
│  • 评估框架 + 可观测性                       │
│                                             │
│  适用场景：                                  │
│  • Google Cloud 生态企业                     │
│  • 需要企业级安全合规的场景                   │
│  • 多 Agent 跨平台互操作                     │
└─────────────────────────────────────────────┘
```

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 软件工程范式（类/方法），开发者友好 | 仍处于 Pre-GA 阶段 |
| A2A + MCP 双协议支持 | Google 平台绑定 |
| 企业级安全与合规 | 升级路径偶有摩擦 |
| 原生 Google 工具集成 | 社区生态较新 |

---

### 2.7 Amazon Bedrock AgentCore

**官网**: https://aws.amazon.com/bedrock/agentcore/  
**定位**: 全托管的 Agent 运行时平台

#### 架构模型

```
┌─────────────────────────────────────────────┐
│       Amazon Bedrock AgentCore 架构          │
├─────────────────────────────────────────────┤
│                                             │
│  9 大服务：                                  │
│  ├─ Runtime（无服务器执行环境）              │
│  ├─ Memory（上下文感知记忆）                │
│  ├─ Gateway（API/Lambda → 工具转换）        │
│  ├─ Browser（云端浏览器运行时）              │
│  ├─ Code Interpreter（安全代码执行）        │
│  ├─ Identity（安全访问控制）                │
│  ├─ Observability（追踪/调试/监控）         │
│  ├─ Evaluation（质量评估，预览）            │
│  └─ Policy（执行边界控制，预览）            │
│                                             │
│  框架中立性：                                │
│  • 支持 CrewAI / LangGraph / ADK / OpenAI   │
│  • 支持 MCP 和 A2A 协议                     │
│  • 支持任何基础模型（Bedrock 内外）          │
│                                             │
│  协作模式：                                  │
│  • Supervisor 模式（主管 Agent 协调）        │
│  • Router 模式（简单请求直接路由）           │
│  • 自动降级（复杂请求回退到 Supervisor）     │
└─────────────────────────────────────────────┘
```

#### 优势与局限

| 优势 | 局限 |
|------|------|
| 全托管，零基础设施管理 | AWS 生态绑定 |
| 框架/模型完全中立 | 成本（全托管溢价） |
| 9 大服务覆盖生产全链路 | 预览功能稳定性待验证 |
| 多区域部署 | 供应商锁定风险 |

---

## 三、多维对比分析

### 3.1 综合对比表

| 维度 | AutoGen | LangGraph | CrewAI | MetaGPT | OpenAI SDK | Google ADK | Bedrock AgentCore |
|------|---------|-----------|--------|---------|------------|------------|-------------------|
| **核心范式** | 对话式协作 | 状态图编排 | 角色团队 | SOP 流水线 | Handoff 路由 | 软件工程 | 全托管运行时 |
| **开源协议** | Apache 2.0 | MIT | MIT | MIT | MIT | Apache 2.0 | 商业服务 |
| **GitHub Stars** | 30k+ | 20k+ | 20k+ | 65k+ | 10k+ | — | — |
| **语言支持** | Python | Python | Python | Python | Python | Py + TS | API |
| **编排模型** | 事件驱动 → 图 | DAG 状态图 | 流程容器 | Pub/Sub | 路由切换 | 状态图 | 服务编排 |
| **状态管理** | 弱→类型化 | 强（Typed State） | 中（共享记忆） | 强（结构化消息） | 弱→会话持久 | 中 | 强（托管） |
| **通信协议** | 内部消息 | 状态传递 | 消息传递 | Pub/Sub | 函数调用 | A2A + MCP | MCP + A2A |
| **Human-in-the-Loop** | ✅ | ✅ 原生 | 部分 | ❌ | ✅ | ✅ | ✅ |
| **检查点/恢复** | ✅ | ✅ 原生 | ❌ | ❌ | 部分 | ✅ | ✅ |
| **并行执行** | ✅ 群聊 | ✅ DAG 并行 | ✅ 流程并行 | ❌ 串行 | ✅ | ✅ | ✅ |
| **可观测性** | 迁移中 | LangSmith 深度 | 基础/付费 | 基础 | 基础 | ✅ | ✅ 9 服务 |
| **生产就绪** | ✅ | ✅ | ✅ | ⚠️ 垂直领域 | Swarm:❌ SDK:✅ | ⚠️ Pre-GA | ✅ |
| **学习曲线** | 中 | 高 | 低 | 中 | 低 | 中 | 低 |
| **最大优势** | 成熟度+生态 | 可控+可审计 | 易用+角色化 | 质量保证 | 简洁+延迟 | 企业集成 | 零运维 |
| **最大劣势** | 对话死锁 | 复杂度高 | Token 消耗 | 场景受限 | Swarm 无状态 | 平台绑定 | AWS 绑定 |

### 3.2 协作模式支持矩阵

| 协作模式 | AutoGen | LangGraph | CrewAI | MetaGPT | OpenAI SDK | ADK | AgentCore |
|---------|---------|-----------|--------|---------|------------|-----|-----------|
| 顺序管线 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 条件路由 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 并行扇入/扇出 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 监督者-工作者 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| 角色团队 | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 辩论/讨论 | ✅ GroupChat | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SOP 流水线 | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 评估-优化循环 | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| 人机交替 | ✅ | ✅ | 部分 | ❌ | ✅ | ✅ | ✅ |
| 动态任务委托 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

---

## 四、5 大协作模式深度解析

### 4.1 监督者-工作者模式（Orchestrator-Workers）

```
┌─────────────────────────────────────────────┐
│  监督者-工作者模式                           │
│                                             │
│  ┌─────────────┐                           │
│  │  Supervisor  │ ← LLM 动态拆解任务        │
│  │  (Orchestrator)│                           │
│  └──────┬──────┘                           │
│         │ 动态分配（运行时决定）              │
│    ┌────┼────┬──────────┐                   │
│    ▼    ▼    ▼          ▼                   │
│  ┌──┐ ┌──┐ ┌──┐      ┌──┐                  │
│  │W1│ │W2│ │W3│ ...  │Wn│  ← 专职 Worker   │
│  └──┘ └──┘ └──┘      └──┘                  │
│    │    │    │          │                   │
│    └────┼────┴──────────┘                   │
│         ▼ 汇总回传                           │
│  ┌─────────────┐                           │
│  │  最终合成    │                           │
│  └─────────────┘                           │
│                                             │
│  代表框架：AutoGen（MagneticOne）、          │
│  LangGraph（自定义 Supervisor 节点）、      │
│  Amazon Bedrock（Supervisor 模式）          │
└─────────────────────────────────────────────┘
```

**适用场景**: 开放域问题求解、多领域任务、未知子任务结构  
**优点**: 灵活性最高，可处理开放式问题  
**缺点**: 成本不可预测、延迟高（15-60s+）、调试困难  
**选型建议**: 仅在任务确实无法预定义流程时使用

### 4.2 顺序管线模式（Sequential Pipeline）

```
┌─────────────────────────────────────────────┐
│  顺序管线模式                                │
│                                             │
│  Input ──▶ [Agent A] ──▶ [Agent B] ──▶     │
│              │              │               │
│              ▼              ▼               │
│         产物 A          产物 B               │
│              │              │               │
│              └──────────────┬──────────────┘│
│                             ▼               │
│                        [Agent C] ──▶ Output │
│                                             │
│  代表框架：MetaGPT（SOP 流水线）、           │
│  CrewAI（Sequential Process）、             │
│  LangGraph（线性 DAG）                       │
└─────────────────────────────────────────────┘
```

**适用场景**: 固定流程（如内容生产、文档处理、软件开发）  
**优点**: 可预测、低成本、易调试  
**缺点**: 灵活性低，无法处理分支需求  
**选型建议**: 首选模式，能用管线就不要用 Agent

### 4.3 并行扇入/扇出模式（Scatter-Gather）

```
┌─────────────────────────────────────────────┐
│  并行扇入/扇出模式                          │
│                                             │
│              ┌──▶ [Agent A] ──┐             │
│              │                 │             │
│  Input ──▶ Scatter ──▶ [Agent B] ──▶ Merge  │
│              │                 │             │
│              └──▶ [Agent C] ──┘             │
│                                             │
│  代表框架：LangGraph（并行 DAG 分支）、       │
│  AutoGen（GroupChat 并行）、                 │
│  CrewAI（并行 Task）                         │
└─────────────────────────────────────────────┘
```

**适用场景**: 多源数据收集、投票决策、独立子任务并行  
**优点**: 延迟低（并行执行）、可扩展性强  
**缺点**: 合并逻辑复杂、需要处理冲突结果  
**选型建议**: 当子任务独立且可并行时优先使用

### 4.4 条件路由模式（Routing）

```
┌─────────────────────────────────────────────┐
│  条件路由模式                                │
│                                             │
│  Input ──▶ [Classifier]                     │
│                │                            │
│    ┌───────────┼───────────┐                 │
│    ▼           ▼           ▼                 │
│  [Agent A]  [Agent B]  [Agent C]            │
│  (退款)     (技术支持) (账单)                │
│                                             │
│  代表框架：OpenAI SDK（Triage Agent）、      │
│  LangGraph（Conditional Edges）、            │
│  Amazon Bedrock（Router 模式）              │
└─────────────────────────────────────────────┘
```

**适用场景**: 意图分类、分级支持、规则分发  
**优点**: 可预测、延迟低、成本可控  
**缺点**: 分类错误会导致路径偏差  
**选型建议**: 已知路由规则时首选，比 Supervisor 更高效

### 4.5 评估-优化循环模式（Evaluator-Optimizer）

```
┌─────────────────────────────────────────────┐
│  评估-优化循环模式                          │
│                                             │
│  ┌─────────────┐                           │
│  │  Generator  │ ──▶ 初始输出               │
│  └──────┬──────┘                           │
│         ▼                                   │
│  ┌─────────────┐                           │
│  │  Evaluator  │ ──▶ 评分 + 改进建议        │
│  └──────┬──────┘                           │
│         │                                   │
│         ▼ 若未达阈值                         │
│  ┌─────────────┐                           │
│  │  Generator  │ ──▶ 改进输出 ◀── 循环      │
│  └─────────────┘        (max_iterations)    │
│         │                                   │
│         ▼ 若已达阈值                         │
│      Final Output ✅                        │
│                                             │
│  代表框架：LangGraph（自定义循环）、          │
│  MetaGPT（Engineer↔QA 反馈循环）、           │
│  Google ADK（Evaluator 组件）                │
└─────────────────────────────────────────────┘
```

**适用场景**: 代码生成、内容优化、设计迭代  
**优点**: 输出质量持续提升  
**缺点**: 成本高（多轮迭代）、需设计好评分标准  
**选型建议**: 质量要求高且允许额外 Token 消耗时使用

---

## 五、生产就绪度评估

### 5.1 可观测性对比

| 框架 | 追踪 | 日志 | 指标 | 评估 | 工具 |
|------|------|------|------|------|------|
| AutoGen | ✅ OpenTelemetry | ✅ | 部分 | ❌ | 迁移至 AF |
| LangGraph | ✅ LangSmith | ✅ | ✅ | ✅ | LangSmith |
| CrewAI | 基础 | ✅ | 基础 | ❌ | AMP 付费 |
| MetaGPT | 基础 | ✅ | ❌ | ❌ | 自研 |
| OpenAI SDK | ✅ | ✅ | ✅ | ✅ | 内建 |
| Google ADK | ✅ | ✅ | ✅ | ✅ | 内建 |
| AgentCore | ✅ 全链路 | ✅ | ✅ | ✅ | 9 大服务 |

### 5.2 选型决策树

```
你的任务是什么？
│
├── 固定流程 / 已知步骤
│   ├── 角色分工明确（如软件开发） → MetaGPT / CrewAI
│   └── 流程复杂且需可审计 → LangGraph
│
├── 动态路由 / 意图分类
│   ├── OpenAI 生态 → OpenAI Agents SDK
│   └── 云中立 → LangGraph（Conditional Edges）
│
├── 开放域问题 / 未知子任务
│   ├── 需要多轮对话 → AutoGen（MagneticOne）
│   └── 需要结构化输出 → LangGraph（Supervisor 模式）
│
├── 企业级生产部署
│   ├── AWS 生态 → Amazon Bedrock AgentCore
│   ├── Google 生态 → Google ADK
│   └── 云中立自建 → LangGraph + LangSmith
│
└── 快速原型 / 学习
    ├── 最简入门 → OpenAI Swarm
    ├── 角色化快速实现 → CrewAI
    └── 图编排入门 → LangGraph
```

### 5.3 生产环境 5 大失败模式

| 失败模式 | 描述 | 预防措施 |
|---------|------|---------|
| **无限循环** | Agent 间对话陷入死循环 | 设置 `max_turns`、循环检测、超时强制终止 |
| **上下文膨胀** | 多 Agent 传递导致 Token 爆炸 | 类型化状态、摘要压缩、滚动窗口 |
| **连锁幻觉** | 上游错误传递给所有下游 | 结构化 Output、Evaluator 校验、置信度门控 |
| **状态不一致** | 多 Agent 并行导致状态冲突 | 不可变状态、乐观锁、状态版本号 |
| **成本失控** | 未预料的 Agent 循环消耗 | Token 预算上限、小模型路由、缓存策略 |

---

## 六、对 Agent2UI 项目的启示

### 6.1 当前六角色模型映射

我们的六角色流水线：**产品经理 → UX 设计师 → A2UI 专家 → Android 开发 → 代码审核 → Android 测试**

对应业界协作模式：

| 我们的阶段 | 对应协作模式 | 推荐参考框架 |
|-----------|-------------|-------------|
| PM → UX → A2UI | 顺序管线（带条件分支） | MetaGPT（SOP 驱动）+ LangGraph（条件路由） |
| A2UI → Dev → Review | 顺序管线 + 评估-优化循环 | LangGraph（状态图 + Evaluator） |
| Review → Test | 顺序管线 | CrewAI（角色依赖 Task Context） |
| 整体流水线 | SOP 驱动的有向图 | LangGraph（DAG） + MetaGPT（角色 Output 契约） |

### 6.2 可借鉴的设计原则

1. **类型化 Output 契约** — 借鉴 MetaGPT，为每个 Agent 定义严格的 Input/Output 类型，防止连锁幻觉
2. **检查点与恢复** — 借鉴 LangGraph，每个阶段完成后持久化状态，支持断点续跑
3. **Evaluator 门控** — 借鉴 LangGraph，在 Review 和 Test 阶段加入质量评估门
4. **MCP/A2A 协议** — 借鉴 Google ADK，将各 Agent 定义为可独立调用的 MCP 工具，支持跨框架互操作
5. **可观测性** — 借鉴 LangSmith/AgentCore，为每个 Agent 调用添加追踪 ID，支持全链路审计

### 6.3 推荐演进路径

```
当前（v1.0）          →        目标（v2.0）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Markdown Agent 定义           YAML Frontmatter + JSON Schema
自由文本 Output                类型化 Output 契约
手动流转                       LangGraph 状态图编排
无检查点                       检查点 + 断点续跑
无评估门控                     Evaluator 质量门
无追踪                        OpenTelemetry 全链路追踪
```

---

## 七、结论

1. **对于 Agent2UI 的六角色模型**，**LangGraph 的状态图编排 + MetaGPT 的 SOP 契约** 是最优组合：
   - LangGraph 提供确定性的 DAG 编排、检查点、Human-in-the-Loop
   - MetaGPT 的角色 Input/Output 契约保证产物质量
   - 两者互补，可构建可审计、可恢复、可扩展的生产级流水线

2. **不推荐** AutoGen 的对话式协作用于生产核心流程（死锁风险），但可借鉴其 GroupChat 模式用于头脑风暴阶段

3. **CrewAI** 的角色-任务-上下文模型值得借鉴，特别是其 `context` 依赖机制对我们的跨角色流转设计

4. **MCP + A2A 协议** 是未来方向，建议 Agent2UI 的每个角色都暴露为 MCP 工具，支持跨框架调用

5. **可观测性** 是生产环境的基石，从一开始就应设计全链路追踪能力

---

## 附录：参考资源

| 资源 | 链接 |
|------|------|
| AutoGen → Agent Framework 迁移指南 | https://learn.microsoft.com/agent-framework/migration-guide/from-autogen/ |
| LangGraph 官方文档 | https://langchain-ai.github.io/langgraph/ |
| CrewAI 官方文档 | https://docs.crewai.com/ |
| MetaGPT 论文 | https://arxiv.org/abs/2308.00352 |
| OpenAI Agents SDK | https://github.com/openai/openai-agents-python |
| Google ADK | https://google.github.io/adk/ |
| Amazon Bedrock AgentCore | https://aws.amazon.com/bedrock/agentcore/ |
| Anthropic: Building Effective Agents | https://anthropic.com/research/building-effective-agents |
| 2026 Agent 框架全景 | https://blog.csdn.net/yonggeit/article/details/160300811 |