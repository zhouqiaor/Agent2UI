# Agent2UI 六 Agent 协作体系

> **版本**: v1.0 | **最后更新**: 2026-08-14  
> **SSOT 目录**: `.ai/` (Single Source of Truth)

---

## 快速导航

本项目包含 6 个预配置的 AI Agent，用于 A2UI（Agent-to-UI）应用的端到端开发。各 Agent 可独立调用，也可串联为完整流水线。

```
┌─────────────────────────────────────────────────────────────┐
│  Agent2UI 六角色流水线                                       │
│                                                             │
│  ① 产品经理 → ② UX 设计师 → ③ A2UI 专家                     │
│      (spec)      (design)       (schema+code)              │
│         │            │              │                        │
│         ▼            ▼              ▼                        │
│      spec.md    design.md    compose_code/                  │
│         │            │              │                        │
│         └────────────┼──────────────┘                        │
│                      ▼                                       │
│  ④ Android 开发 → ⑤ 代码审核 → ⑥ Android 测试 → 交付        │
│     (arch+impl)    (review)       (ADB+perf)                │
│                      │              │                        │
│                  code_package/  test_report.md               │
└─────────────────────────────────────────────────────────────┘
```

---

## 调用方式

### 方式 1：自然语言（推荐）

```
"作为产品经理，为会议助手 App 撰写 MVP PRD"
"作为 A2UI 专家，为课程详情页设计 A2UI JSON Schema"
"作为 Android 开发，基于 A2UI Schema 实现完整功能"
"作为代码审核，审查这次 PR 的代码质量"
"作为 Android 测试，执行 Agent 速度和视觉回归测试"
```

### 方式 2：Skill 直接调用

```
"调用 agent2ui-expert skill 生成 A2UI Schema"
"调用 compose-expert skill 实现这个界面"
"调用 code-review-and-quality skill 审查代码"
```

### 方式 3：流水线模式

```
"启动 A2UI 开发流水线：PM → UX → A2UI → Dev → Review → Test
 输入场景：[具体描述]"
```

---

## Agent 目录索引

| # | Agent | 文件 | 核心职责 |
|---|-------|------|---------|
| 1 | 产品经理 | [`.ai/agents/product-manager.agent.md`](.ai/agents/product-manager.agent.md) | 需求分析、PRD、用户画像 |
| 2 | UX 设计师 | [`.ai/agents/ux-designer.agent.md`](.ai/agents/ux-designer.agent.md) | Design Token、交互设计、组件库 |
| 3 | A2UI 专家 | [`.ai/agents/a2ui-expert.agent.md`](.ai/agents/a2ui-expert.agent.md) | A2UI Schema、协议、代码生成 |
| 4 | Android 开发 | [`.ai/agents/android-developer.agent.md`](.ai/agents/android-developer.agent.md) | Compose、MVI、Clean Architecture |
| 5 | 代码审核 | [`.ai/agents/code-reviewer.agent.md`](.ai/agents/code-reviewer.agent.md) | 多维度审查、A2UI 合规、冲突解决 |
| 6 | Android 测试 | [`.ai/agents/android-tester.agent.md`](.ai/agents/android-tester.agent.md) | ADB 自动化、性能基准、视觉回归 |

## Skill 目录索引

| 分类 | Skill | 路径 |
|------|-------|------|
| **A2UI 核心** | agent2ui-expert | [`.ai/skills/agent2ui-expert/SKILL.md`](.ai/skills/agent2ui-expert/SKILL.md) |
| **Compose 开发** | compose-expert, compose-ui, compose-navigation, compose-performance-audit, coil-compose | [`.ai/skills/`](.ai/skills/) |
| **Android 架构** | android-architecture, android-viewmodel, android-data-layer, android-coroutines | [`.ai/skills/`](.ai/skills/) |
| **代码质量** | code-review-and-quality, source-driven-development, security-and-hardening | [`.ai/skills/`](.ai/skills/) |
| **测试** | android-testing, android-emulator-skill, test-driven-development | [`.ai/skills/`](.ai/skills/) |
| **设计** | taste-skill, frontend-ui-engineering, android-accessibility | [`.ai/skills/`](.ai/skills/) |

## 调研报告索引

| 报告 | 路径 |
|------|------|
| A2UI 专家 - AGenUI 深度调研 | [`.ai/reports/01-A2UI专家-AGenUI深度调研报告.md`](.ai/reports/01-A2UI专家-AGenUI深度调研报告.md) |
| 产品经理 - 教育与会议场景 | [`.ai/reports/02-产品经理-教育与会议场景A2UI研究报告.md`](.ai/reports/02-产品经理-教育与会议场景A2UI研究报告.md) |
| UX 设计师 - 鸿蒙与 Agent 交互 | [`.ai/reports/03-UX设计师-鸿蒙移动端与Agent交互UX调研报告.md`](.ai/reports/03-UX设计师-鸿蒙移动端与Agent交互UX调研报告.md) |
| Android 开发 - 技术框架总结 | [`.ai/reports/04-安卓开发-A2UI技术框架总结.md`](.ai/reports/04-安卓开发-A2UI技术框架总结.md) |
| 代码审核 - Git 检视与多 Agent | [`.ai/reports/05-代码审核-Git检视与多Agent协作.md`](.ai/reports/05-代码审核-Git检视与多Agent协作.md) |
| Android 测试 - ADB 自动化验证 | [`.ai/reports/06-安卓测试-ADB自动化验证方案.md`](.ai/reports/06-安卓测试-ADB自动化验证方案.md) |

---

## 跨工具适配

本项目的 Agent 定义文件采用**中立格式**（Markdown + YAML frontmatter），可被任何 AI 编码工具读取。各工具的适配器位于：

| 工具 | 适配目录 | 配置文件 |
|------|---------|---------|
| **Trae** | `.trae/` | 自动加载 `.trae/agents/` + `.trae/skills/` |
| **Claude Code** | `.claude/` | `CLAUDE.md` + `.claude/commands/` |
| **Cursor** | `.cursor/` | `.cursor/rules/` |
| **GitHub Copilot** | `.github/` | `.github/copilot-instructions.md` |
| **通用 / Codex** | 根目录 | 本文件 `AGENTS.md` |

各适配器**引用** `.ai/` 下的 SSOT 文件，而非复制。修改 Agent/Skill 只需更新 `.ai/` 下的文件即可。

---

## 工作流详情

完整的工作流编排配置、跨角色上下文传递表、输入输出契约详见：

> [`.trae/skills/WORKFLOW.md`](.trae/skills/WORKFLOW.md) | [`.ai/skills/WORKFLOW.md`](.ai/skills/WORKFLOW.md)