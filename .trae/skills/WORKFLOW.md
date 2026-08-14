# Agent2UI 六角色工作流编排配置

基于方案 A（质量护栏）的 Agent Skills 安装清单和工作流定义。

> **SSOT 目录**: `.ai/` | **跨工具适配**: 见文件底部

## 跨工具适配快速索引

Agent 定义采用中立格式（Markdown + YAML frontmatter），支持多工具：

| 工具 | 入口文件 | 自动加载 |
|------|---------|---------|
| **Trae** | `.trae/agents/` + `.trae/skills/` | ✅ 自动扫描 frontmatter |
| **Claude Code** | `CLAUDE.md` + `.claude/commands/` | ✅ `CLAUDE.md` 自动注入，commands 可手动触发 |
| **Cursor** | `.cursor/rules/` | ✅ 自动注入 rules 到上下文 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ 自动加载 |
| **Codex / 通用** | `AGENTS.md`（根目录） | ✅ LLM 自行读取理解 |

**修改 Agent/Skill 只需更新 `.ai/` 下的 SSOT 文件**，各工具目录为引用层。

---

## 已安装 Skills 清单

### 元框架（addyosmani/agent-skills）
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| spec-driven-development | PRD 驱动开发 | `.trae/skills/spec-driven-development/SKILL.md` |
| planning-and-task-breakdown | 任务拆解规划 | `.trae/skills/planning-and-task-breakdown/SKILL.md` |
| source-driven-development | 官方文档溯源 | `.trae/skills/source-driven-development/SKILL.md` |
| frontend-ui-engineering | UI 工程化 | `.trae/skills/frontend-ui-engineering/SKILL.md` |
| code-review-and-quality | 五轴代码审核 | `.trae/skills/code-review-and-quality/SKILL.md` |
| security-and-hardening | 安全加固 | `.trae/skills/security-and-hardening/SKILL.md` |
| test-driven-development | TDD 测试驱动 | `.trae/skills/test-driven-development/SKILL.md` |
| debugging-and-error-recovery | 调试与错误恢复 | `.trae/skills/debugging-and-error-recovery/SKILL.md` |
| using-agent-skills | 技能使用指南 | `.trae/skills/using-agent-skills/SKILL.md` |

### Agent Personas
| Persona | 用途 | 路径 |
|---------|------|------|
| code-reviewer | 高级代码审核专家 | `.trae/skills/agents/code-reviewer.md` |
| security-auditor | 安全审计专家 | `.trae/skills/agents/security-auditor.md` |
| test-engineer | QA 测试工程师 | `.trae/skills/agents/test-engineer.md` |

### UX 设计（taste-skill）
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| taste-skill | 反 AI 烂 UI 审美框架 | `.trae/skills/taste-skill/SKILL.md` |
| image-to-code-skill | 图→码工作流 | `.trae/skills/image-to-code-skill/SKILL.md` |
| imagegen-frontend-mobile | 移动端设计稿生成 | `.trae/skills/imagegen-frontend-mobile/SKILL.md` |
| redesign-skill | UI 重设计技能 | `.trae/skills/redesign-skill/SKILL.md` |

### Android 开发
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| compose-expert | Jetpack Compose 专家 | `.trae/skills/compose-expert/SKILL.md` |
| compose-ui | Compose UI 组件 | `.trae/skills/compose-ui/SKILL.md` |
| compose-navigation | Compose 导航 | `.trae/skills/compose-navigation/SKILL.md` |
| compose-performance-audit | Compose 性能审计 | `.trae/skills/compose-performance-audit/SKILL.md` |
| coil-compose | 图片加载库 | `.trae/skills/coil-compose/SKILL.md` |
| android-architecture | Android 架构指导 | `.trae/skills/android-architecture/SKILL.md` |
| android-viewmodel | ViewModel 模式 | `.trae/skills/android-viewmodel/SKILL.md` |
| android-data-layer | 数据层设计 | `.trae/skills/android-data-layer/SKILL.md` |
| android-coroutines | 协程并发 | `.trae/skills/android-coroutines/SKILL.md` |
| android-retrofit | Retrofit 网络 | `.trae/skills/android-retrofit/SKILL.md` |
| kotlin-concurrency-expert | Kotlin 并发专家 | `.trae/skills/kotlin-concurrency-expert/SKILL.md` |
| android-testing | Android 测试策略 | `.trae/skills/android-testing/SKILL.md` |
| android-emulator-skill | 模拟器自动化 | `.trae/skills/android-emulator-skill/SKILL.md` |
| android-accessibility | 无障碍设计 | `.trae/skills/android-accessibility/SKILL.md` |
| android-gradle-logic | Gradle 构建逻辑 | `.trae/skills/android-gradle-logic/SKILL.md` |
| gradle-build-performance | Gradle 构建性能 | `.trae/skills/gradle-build-performance/SKILL.md` |
| xml-to-compose-migration | XML→Compose 迁移 | `.trae/skills/xml-to-compose-migration/SKILL.md` |
| rxjava-to-coroutines-migration | RxJava→Coroutines 迁移 | `.trae/skills/rxjava-to-coroutines-migration/SKILL.md` |

### A2UI 专家（自建）
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| agent2ui-expert | Agent 驱动 UI 生成 | `.trae/skills/agent2ui-expert/SKILL.md` |

### 参考资料
| 文件 | 用途 | 路径 |
|------|------|------|
| definition-of-done.md | 完成定义 | `.trae/skills/references/definition-of-done.md` |
| testing-patterns.md | 测试模式 | `.trae/skills/references/testing-patterns.md` |
| security-checklist.md | 安全检查清单 | `.trae/skills/references/security-checklist.md` |
| performance-checklist.md | 性能检查清单 | `.trae/skills/references/performance-checklist.md` |
| accessibility-checklist.md | 无障碍检查清单 | `.trae/skills/references/accessibility-checklist.md` |
| orchestration-patterns.md | 编排模式 | `.trae/skills/references/orchestration-patterns.md` |
| observability-checklist.md | 可观测性检查清单 | `.trae/skills/references/observability-checklist.md` |

---

## 六角色工作流

### 角色 1：产品经理（Product Manager）
**使用 Skills**: `spec-driven-development` → `planning-and-task-breakdown`

```
输入：用户需求描述
  ↓
spec-driven-development（写 PRD）
  ├── 目标与非目标
  ├── 用户故事
  ├── 技术约束
  └── 验收标准
  ↓
输出：spec.md
  ↓
planning-and-task-breakdown（任务拆解）
  ├── 垂直切片规划
  ├── 依赖分析
  └── 风险评估
  ↓
输出：tasks.md
```

### 角色 2：UX 设计师（UX Designer）
**使用 Skills**: `taste-skill` + `imagegen-frontend-mobile`

```
输入：spec.md（来自产品经理）
  ↓
taste-skill（审美基线）
  ├── 三拨杆调节（Design Variance / Motion Intensity / Visual Density）
  ├── Anti-Slop 起飞前检查
  └── Material 3 合规性
  ↓
imagegen-frontend-mobile（设计稿生成）
  ├── 移动端界面流
  └── 视觉参考图
  ↓
输出：design.md + 参考图
```

### 角色 3：A2UI 专家（Agent-to-UI Expert）
**使用 Skills**: `agent2ui-expert` + `image-to-code-skill`

```
输入：spec.md + design.md + 数据模型
  ↓
agent2ui-expert（核心转换）
  ├── Step 1：数据模型分析
  ├── Step 2：UI 结构设计
  ├── Step 3：Compose 代码生成
  ├── Step 4：数据层集成
  ├── Step 5：交互与状态
  └── Step 6：验证与交付
  ↓
输出：完整的 Jetpack Compose 功能模块
```

### 角色 4：Android 开发（Android Developer）
**使用 Skills**: `compose-expert` + `android-architecture` + `compose-performance-audit`

```
输入：A2UI 生成的代码
  ↓
compose-expert（Compose 专项优化）
  ├── 状态管理优化
  ├── 性能优化
  └── 导航集成
  ↓
android-architecture（架构对齐）
  ├── MVVM/MVI 模式
  ├── 依赖注入
  └── 分层校验
  ↓
compose-performance-audit（性能审计）
  ├── 重组次数检测
  ├── 延迟列表优化
  └── 内存泄漏检测
  ↓
输出：生产级 Android 代码
```

### 角色 5：代码审核（Code Review）
**使用 Skills**: `code-review-and-quality` Persona: `code-reviewer`

```
输入：代码变更（diff）
  ↓
code-reviewer Persona（高级工程师视角）
  ├── 正确性审核
  ├── 可维护性审核
  ├── 可读性审核
  ├── 执行效率审核
  └── 安全性审核
  ↓
security-and-hardening（安全加固）
  ├── OWASP Top 10 检查
  ├── 密钥管理
  └── 依赖审计
  ↓
输出：审核意见 + 分级标签（Nit/Optional/FYI/Blocker）
```

### 角色 6：Android 测试（Android Testing）
**使用 Skills**: `test-driven-development` + `android-testing` Persona: `test-engineer`

```
输入：代码 + spec.md
  ↓
test-engineer Persona（QA 专家视角）
  ├── 测试策略制定
  ├── 覆盖率分析
  └── Prove-It 模式
  ↓
test-driven-development（TDD 实现）
  ├── Red：写失败的测试
  ├── Green：写最少的代码
  └── Refactor：重构优化
  ↓
android-testing（Android 专项）
  ├── 单元测试（Junit5 + MockK）
  ├── UI 测试（Espresso + Compose UI Test）
  └── 截图测试（Paparazzi）
  ↓
输出：测试代码 + 覆盖率报告
```

---

## 六角色 Agent 定义文件

每个角色的完整定义（含 frontmatter、技能绑定、输入输出契约、行为约束）存放在 `.trae/agents/` 目录下：

| # | Agent 文件 | 角色 | 绑定 Skill | 核心输出 |
|---|----------|------|-----------|---------|
| 1 | `product-manager.agent.md` | 产品经理 | `spec-driven-development`, `planning-and-task-breakdown`, `using-agent-skills` | spec.md, user_personas.md, competitor_analysis.md, mvp_scope.md, tasks.md, target_data_model.md |
| 2 | `ux-designer.agent.md` | UX 设计师 | `compose-ui`, `android-accessibility`, `taste-skill`, `frontend-ui-engineering` | design.md, design_tokens.md, component_library.md, interaction_flows.md |
| 3 | `a2ui-expert.agent.md` | A2UI 专家 | `agent2ui-expert`, `compose-expert`, `source-driven-development`, `spec-driven-development` | a2ui_schema.json, compose_code/, data_mapping.md, component_catalog.md |
| 4 | `android-developer.agent.md` | Android 开发 | `compose-expert`, `android-architecture`, `android-data-layer`, `android-viewmodel`, `android-coroutines`, `compose-performance-audit`, `coil-compose`, `compose-navigation` | 完整 Android 项目代码, ARCHITECTURE.md |
| 5 | `code-reviewer.agent.md` | 代码审核 | `code-review-and-quality`, `TRAE-code-review`, `TRAE-security-review`, `source-driven-development` | review_report.md, issue_list.md, a2ui_compliance_report.md, review_comments.md, code_package/ |
| 6 | `android-tester.agent.md` | Android 测试 | `android-emulator-skill`, `android-testing`, `compose-performance-audit`, `planning-and-task-breakdown` | test_report.md, performance_baseline.md, test_scripts/, visual_baselines/ |

### Agent 定义文件结构（每个 .agent.md 包含）

```
┌──────────────────────────────────────────────────────────┐
│                   Frontmatter 元数据                       │
│  role, name, emoji, description, skills[], inputs[],      │
│  outputs[], triggers[], knowledge_refs[]                  │
├──────────────────────────────────────────────────────────┤
│                   正文内容                                 │
│  1. 角色身份                                              │
│  2. 核心能力                                              │
│  3. 工作模式（独立调用 + 流水线协作 + 可选实时调用）          │
│  4. 输入契约                                              │
│  5. 输出契约                                              │
│  6. 行为约束（Do / Don't）                                 │
│  7. 示例触发                                              │
└──────────────────────────────────────────────────────────┘
```

### 调用方式

```
# 方式 1：自然语言触发（推荐）
"作为产品经理，为会议助手 App 撰写 MVP PRD"
"作为 Android 开发，实现基于 A2UI Schema 的课程详情页"

# 方式 2：Skill 直接调用
"调用 agent2ui-expert skill 生成 A2UI Schema"
"调用 code-review-and-quality skill 审查这次 PR"

# 方式 3：流水线模式
"启动 A2UI 开发流水线：PM → UX → A2UI → Dev → Review → Test"
```

---

## 完整工作流编排

```
┌─────────────────────────────────────────────────────────────────┐
│                    Agent2UI 六角色流水线                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① 产品经理 ──→ ② UX 设计师 ──→ ③ A2UI 专家                    │
│  (.agent.md)     (.agent.md)      (.agent.md)                 │
│       │               │                │                         │
│       ▼               ▼                ▼                         │
│    spec.md         design.md     a2ui_schema.json              │
│    tasks.md        design_tokens  compose_code/                │
│    target_data     component_    data_mapping.md              │
│    _model.md       library.md    component_catalog.md          │
│                    interaction_                                 │
│                    flows.md                                     │
│       │               │                │                         │
│       └───────────────┼────────────────┘                         │
│                       ▼                                         │
│  ④ Android 开发 ──────────────────→ ⑤ 代码审核                  │
│  (.agent.md)                         (.agent.md)             │
│       │                                  │                      │
│       ▼                                  ▼                      │
│    code_package/                      review_report.md          │
│    (完整 Android 项目)                review_comments.md       │
│                                        issue_list.md            │
│                                        code_package/            │
│       │                                  │                      │
│       └──────────┬───────────────────────┘                      │
│                  ▼                                              │
│  ⑥ Android 测试 ──────────────────→ 交付                       │
│  (.agent.md)                                                    │
│       │                                                         │
│       ▼                                                         │
│    test_report.md                                               │
│    performance_baseline.md                                      │
│    test_scripts/ + visual_baselines/                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 跨角色上下文传递

每个角色通过**文件系统**传递上下文，避免上下文污染：

| 产出物 | 格式 | 产出者 → 消费者 |
|--------|------|---------------|
| `spec.md` | Markdown | 产品经理 → UX 设计师 → A2UI 专家 → Android 开发 → Android 测试 |
| `tasks.md` | Markdown | 产品经理 → 所有后续角色 |
| `target_data_model.md` | Markdown + JSON | 产品经理 → A2UI 专家 |
| `design.md` | Markdown + 图片 | UX 设计师 → A2UI 专家 → Android 开发 |
| `design_tokens.md` | Markdown + JSON 表格 | UX 设计师 → A2UI 专家 → Android 开发 |
| `component_library.md` | Markdown 表格 | UX 设计师 → A2UI 专家 |
| `interaction_flows.md` | Mermaid 文本 | UX 设计师 → A2UI 专家 |
| `a2ui_schema.json` | JSON | A2UI 专家 → Android 开发 |
| `compose_code/` | Kotlin (.kt) | A2UI 专家 → Android 开发 |
| `data_mapping.md` | Markdown | A2UI 专家 → Android 开发 |
| `component_catalog.md` | Markdown 表格 | A2UI 专家 → Android 开发 |
| `code_package/` | 源码目录 | Android 开发 → 代码审核 → Android 测试 |
| `review_report.md` | Markdown | 代码审核 → Android 开发 → Android 测试 |
| `review_comments.md` | Markdown | 代码审核 → Android 开发 → Android 测试 |
| `test_report.md` | Markdown | Android 测试 → 所有角色 |
| `performance_baseline.md` | Markdown 表格 | Android 测试 → Android 开发（回归优化） |

---

## 使用方式

### 方式 1：触发特定角色
```
"作为产品经理，帮我写一个登录页的 PRD"
→ 自动激活 spec-driven-development Skill

"作为 A2UI 专家，把这个 JSON 变成 Compose 界面"
→ 自动激活 agent2ui-expert Skill

"作为代码审核专家，审查这个 PR"
→ 自动激活 code-reviewer Persona + code-review-and-quality Skill
```

### 方式 2：串联完整流水线
```
"从 0 到 1 完成一个功能：产品经理写 PRD → UX 设计 → A2UI 生成界面 → Android 开发 → 代码审核 → 测试"
→ 按顺序激活所有角色 Skill
```

### 方式 3：组合特定 Skill
```
"用 taste-skill + compose-expert 优化这个界面"
→ 同时激活两个 Skill
```