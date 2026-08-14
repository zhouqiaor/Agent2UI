# Agent2UI 项目指引

## 项目概述

Agent2UI 是一个 Agent-to-UI 驱动的 Android 应用开发框架，包含 6 个预配置的 AI Agent 用于端到端开发。

## 快速开始

1. 阅读 [`AGENTS.md`](AGENTS.md) 了解 6 个 Agent 的能力和调用方式
2. 阅读 [`.ai/skills/WORKFLOW.md`](.ai/skills/WORKFLOW.md) 了解完整工作流编排
3. 通过自然语言触发对应 Agent（如"作为产品经理..."）

## Agent 角色

| Agent | 角色 | 定义文件 |
|-------|------|---------|
| PM | 产品经理 | [`.ai/agents/product-manager.agent.md`](.ai/agents/product-manager.agent.md) |
| UX | UX 设计师 | [`.ai/agents/ux-designer.agent.md`](.ai/agents/ux-designer.agent.md) |
| A2UI | A2UI 专家 | [`.ai/agents/a2ui-expert.agent.md`](.ai/agents/a2ui-expert.agent.md) |
| Dev | Android 开发 | [`.ai/agents/android-developer.agent.md`](.ai/agents/android-developer.agent.md) |
| Review | 代码审核 | [`.ai/agents/code-reviewer.agent.md`](.ai/agents/code-reviewer.agent.md) |
| Test | Android 测试 | [`.ai/agents/android-tester.agent.md`](.ai/agents/android-tester.agent.md) |

## 技术栈

- Kotlin 2.3+ / Jetpack Compose BOM 2025.12
- Hilt / Room / Retrofit / Navigation 3
- MVI 架构模式 + Clean Architecture
- A2UI 协议驱动的 UI 生成

## 注意事项

- Agent 定义文件的 SSOT 在 `.ai/` 目录
- `.trae/`、`.claude/`、`.cursor/` 是各工具的适配层
- 修改 Agent/Skill 配置只需更新 `.ai/` 下的文件

---

## 改进路线图（2026-08-14 检视）

> 详情：[`.ai/reports/08-工作流检视报告.md`](.ai/reports/08-工作流检视报告.md)

### 🔴 Blocker（1 个）

| 任务 | 关联文件 | 工作量 |
|------|---------|--------|
| 编排引擎 Agent handler 对接真实 Skill 调用 | `pipeline.py` | 4-8 h |

### 🟠 Major（4 个）

| 任务 | 关联文件 | 工作量 |
|------|---------|--------|
| `.trae/agents/` 同步 v2.0 格式 | `.trae/agents/*.md` | 5 min |
| Dev 回退路径增加 test_report 输入源 | `android-developer.agent.md` | 10 min |
| 双版本 WORKFLOW.md 同步 | `.trae/skills/WORKFLOW.md` | 15 min |
| 扩展 SCENE_PROFILES 支持多场景 | `pipeline.py` | 30 min |

### 🟡 Minor（3 个）

| 任务 | 关联文件 | 工作量 |
|------|---------|--------|
| PM spec.md 增加 consumers 声明 | `product-manager.agent.md` | 2 min |
| 错误处理增加恢复机制 | `pipeline.py` | 30 min |
| 质量门控运行时验证 | `validate.py` | 1 h |