# Agent2UI 六角色工作流编排配置

> **版本**: v2.0 | **最后更新**: 2026-08-14  
> **架构**: LangGraph 状态图编排 + MetaGPT SOP 契约  
> **SSOT 目录**: `.ai/` | **跨工具适配**: 见文件底部

## 架构设计

### 设计理念

```
LangGraph 状态图编排
  → 节点 = Agent 角色
  → 边 = 流转规则（always / on_pass / on_fail）
  → 检查点 = 每个节点完成后的持久化快照
  → 条件边 = 质量门控驱动的分流

MetaGPT SOP 契约
  → 严格类型化 Input/Output
  → 每个产物有明确 schema 定义
  → 消费者显式声明（防止产物错位）
  → 反馈循环（Review↔Dev 最多 3 次）
```

### 状态图 DAG

```
[PM] ──always──▶ [UX] ──always──▶ [A2UI] ──always──▶ [Dev] ──always──▶ [Review] ──on_pass──▶ [Test]
                                                       ▲                  │  ▲                          │
                                                       │                  │  │                          │
                                                       └──on_fail────────┘  └──on_fail────────────────┘
                                                            (max 3x)              (max 3x)
```

### 检查点策略

每个节点完成后创建检查点，基于关键输出文件的 hash：

| 节点 | 检查点 | 断点恢复点 |
|------|--------|-----------|
| PM | spec_hash = hash(spec.md + mvp_scope.md + target_data_model.md) | 可从 PM 之后的任意节点恢复 |
| UX | design_hash = hash(design.md + design_tokens.md + component_library.md + interaction_flows.md) | 可从 UX 之后的任意节点恢复 |
| A2UI | a2ui_hash = hash(a2ui_schema.json + compose_code/ + data_mapping.md) | 可从 A2UI 之后的任意节点恢复 |
| Dev | code_hash = hash(project_root/ + ARCHITECTURE.md) | 可从 Dev 之后的任意节点恢复 |
| Review | review_hash = hash(review_report.md + issue_list.md) | 可从 Review 之后的任意节点恢复 |
| Test | test_hash = hash(test_report.md + performance_baseline.md) | 最终检查点 |

---

## YAML Frontmatter Schema 规范

每个 Agent `.agent.md` 文件必须遵循以下 YAML Frontmatter Schema：

```yaml
---
role: <角色名称>
name: <显示名称>
emoji: <emoji>
description: >
  <角色描述，包含在流水线中的定位>

# ============================================================
# 状态图节点定义（LangGraph 风格）
# ============================================================
state_graph:
  node_id: <唯一标识>              # pm | ux | a2ui | dev | review | tester
  node_type: <类型>                # source（入口）| transform（转换）| sink（终端）
  position: <序号>                 # 1-6
  entry_node: <bool>               # 是否为入口节点
  checkpoint: <bool>               # 是否创建检查点
  checksum: <hash_name>            # 检查点 hash 名称

  incoming_edges:                  # 入边列表
    - from: <source_node_id>
      condition: <条件>            # always | on_pass | on_fail
      description: <描述>

  outgoing_edges:                  # 出边列表
    - to: <target_node_id>
      condition: <条件>
      description: <描述>

  fallback_edges:                  # 回退边（条件不满足时）
    - to: <target_node_id>
      condition: <on_xxx_fail>
      max_retries: <int>           # 最大重试次数
      description: <描述>

# ============================================================
# MetaGPT SOP 契约（类型化 Input/Output）
# ============================================================
contract:
  input:
    required:
      - name: <字段名>
        type: <类型>               # string | array | file | directory | enum
        format: <格式>             # markdown | json | kotlin | toml | mermaid | png
        path: <文件路径>
        source: <来源node_id>
        schema: <schema要求>
        example: <示例>
    optional: [...]

  output:
    - name: <字段名>
      type: <类型>
      format: <格式>
      path: <文件路径>
      schema:
        required: [<必填项列表>]
        validation: <验证规则>
      consumers: [<消费node_id列表>]

  result_type: <enum>              # pass | fail（仅 review/tester 节点需要）
  quality_gates:
    - id: <门控ID>
      name: <门控名称>
      check: <检查内容>
      severity: <blocker|major|minor>

skills: [...]          # 绑定的 skill 列表
triggers: [...]        # 触发关键词
knowledge_refs: [...]  # 参考资料
---
```

---

## 跨角色上下文传递表（状态图边映射）

### 完整流转矩阵

| 源节点 | 目标节点 | 条件 | 传递产物 | Schema 要求 |
|--------|---------|------|---------|------------|
| **PM** | UX | always | spec.md | 目标/范围/功能列表/用户故事 |
| PM | UX | always | target_data_model.md | 实体/字段映射/关系图 |
| **UX** | A2UI | always | design.md | 视觉规范/布局策略 |
| UX | A2UI | always | design_tokens.md | 颜色/字体/间距 Token |
| UX | A2UI | always | component_library.md | 组件/状态/变体 |
| UX | A2UI | always | interaction_flows.md | 用户路径/Agent 状态流 |
| **PM** | A2UI | always | target_data_model.md | 实体/字段映射 |
| **A2UI** | Dev | always | a2ui_schema.json | surfaceId/type/data/layout |
| A2UI | Dev | always | compose_code/ | 可运行 Compose 组件 |
| A2UI | Dev | always | data_mapping.md | 数据字段→UI 属性映射 |
| **UX** | Dev | always | design_tokens.md | Design Token 引用 |
| **Dev** | Review | always | project_root/ | 可编译运行的项目 |
| Dev | Review | always | ARCHITECTURE.md | 架构图/模块依赖 |
| **Review** | Tester | on_pass | code_package/ | 审查通过的代码包 |
| Review | Tester | on_pass | review_comments.md | 审查结论（含通过前提条件） |
| **Review** | Dev | on_review_fail | issue_list.md | 具体修复清单 |
| Review | Dev | on_review_fail | review_report.md | 问题详情 |
| **Tester** | Dev | on_test_fail | test_report.md | 失败项详情 |
| Tester | Dev | on_test_fail | performance_baseline.md | 性能数据 |

### 条件边判断逻辑

#### Review → Tester (on_pass) / Review → Dev (on_review_fail)

```python
def review_result(issues):
    blocker_count = count(issues where severity == "blocker")
    major_count = count(issues where severity == "major")
    if blocker_count > 0: return "on_review_fail"
    if major_count >= 3: return "on_review_fail"
    return "on_pass"
```

#### Tester → 交付 (pass) / Tester → Dev (on_test_fail)

```python
def test_result(tests):
    blocker_fails = count(tests where severity == "blocker" and status == "fail")
    major_fails = count(tests where severity == "major" and status == "fail")
    if blocker_fails > 0: return "on_test_fail"
    if major_fails >= 2: return "on_test_fail"
    return "pass"
```

---

## 质量门控矩阵

### 各节点质量门控汇总

| 节点 | 门控 ID | 名称 | 检查内容 | 严重度 |
|------|---------|------|---------|--------|
| **PM** | qg_pm_1 | RICE 量化排序 | MVP 功能列表经 RICE 评分 | 🔴 Blocker |
| PM | qg_pm_2 | 用户故事完备 | 每个功能有 User Story | 🟠 Major |
| **UX** | qg_ux_1 | 组件状态完备 | 每个组件定义 7 种状态 | 🔴 Blocker |
| UX | qg_ux_2 | Agent 特有交互 | Agent 组件含 streaming/thinking | 🟠 Major |
| UX | qg_ux_3 | 多端适配 | 深色模式+小屏 | 🟠 Major |
| **A2UI** | qg_a2ui_1 | Schema 协议合规 | a2ui_schema.json 符合 v1 | 🔴 Blocker |
| A2UI | qg_a2ui_2 | Design Token 引用 | Compose 代码无硬编码 | 🔴 Blocker |
| A2UI | qg_a2ui_3 | 组件白名单 | 类型在白名单内 | 🟠 Major |
| **Dev** | qg_dev_1 | Clean Architecture | UI/Domain/Data 分层 | 🔴 Blocker |
| Dev | qg_dev_2 | Design Token | 无硬编码值 | 🔴 Blocker |
| Dev | qg_dev_3 | 协程作用域 | 无 GlobalScope | 🔴 Blocker |
| Dev | qg_dev_4 | Compose 稳定性 | StateFlow 正确收集 | 🟠 Major |
| **Review** | qg_review_1 | 正确性 | sealed 穷举/StateFlow/协程 | 🔴 Blocker |
| Review | qg_review_2 | 安全性 | 无硬编码密钥/输入验证 | 🔴 Blocker |
| Review | qg_review_3 | 性能 | Compose 稳定性 | 🟠 Major |
| Review | qg_review_4 | A2UI 合规 | 白名单/Token/Schema | 🔴 Blocker |
| Review | qg_review_5 | 代码风格 | 命名/架构/文档 | 🔵 Nit |
| **Test** | qg_test_1 | Agent 响应速度 | 简单<3s, 复杂<5s | 🔴 Blocker |
| Test | qg_test_2 | 首帧渲染 | < 500ms | 🔴 Blocker |
| Test | qg_test_3 | 视觉回归 | 相似度 ≥ 95% | 🟠 Major |
| Test | qg_test_4 | 稳定性 | 100 轮无崩溃 | 🟠 Major |
| Test | qg_test_5 | 兼容性 | 多设备兼容 | 🟠 Major |

---

## 六角色 Agent 定义文件

### Agent 文件索引

| # | 文件 | node_id | 类型 | 位置 | 检查点 | 出边 | 回退边 |
|---|------|---------|------|------|--------|------|--------|
| 1 | `product-manager.agent.md` | pm | source | 1 | ✅ | pm→ux (always) | 无 |
| 2 | `ux-designer.agent.md` | ux | transform | 2 | ✅ | ux→a2ui (always) | 无 |
| 3 | `a2ui-expert.agent.md` | a2ui | transform | 3 | ✅ | a2ui→dev (always) | 无 |
| 4 | `android-developer.agent.md` | dev | transform | 4 | ✅ | dev→review (always) | review→dev (max 3) |
| 5 | `code-reviewer.agent.md` | review | transform | 5 | ✅ | review→tester (on_pass) | review→dev (max 3) |
| 6 | `android-tester.agent.md` | tester | sink | 6 | ✅ | 无 | tester→dev (max 3) |

### Frontmatter Schema 演进

```
v1.0 (之前):
  role, name, emoji, description, skills[], inputs[], outputs[], triggers[], knowledge_refs[]
  问题: inputs/outputs 无类型化，无消费者声明，无状态图关联

v2.0 (当前):
  + state_graph: 节点ID/类型/位置/入边/出边/回退边/检查点
  + contract.input: 类型化/格式化/来源/schema
  + contract.output: 类型化/格式化/路径/schema/消费者
  + contract.result_type: pass/fail 枚举
  + contract.quality_gates: 质量门控
  改进: 类型化契约 + 状态图编排 + 质量门控 + 条件边
```

---

## 已安装 Skills 清单

### 元框架
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
| android-testing | Android 测试策略 | `.trae/skills/android-testing/SKILL.md` |
| android-emulator-skill | 模拟器自动化 | `.trae/skills/android-emulator-skill/SKILL.md` |
| android-accessibility | 无障碍设计 | `.trae/skills/android-accessibility/SKILL.md` |
| xml-to-compose-migration | XML→Compose 迁移 | `.trae/skills/xml-to-compose-migration/SKILL.md` |
| rxjava-to-coroutines-migration | RxJava→Coroutines 迁移 | `.trae/skills/rxjava-to-coroutines-migration/SKILL.md` |

### A2UI 专家（自建）
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| agent2ui-expert | Agent 驱动 UI 生成 | `.trae/skills/agent2ui-expert/SKILL.md` |

### UX 设计
| Skill 名称 | 用途 | 路径 |
|-----------|------|------|
| taste-skill | 反 AI 烂 UI 审美框架 | `.trae/skills/taste-skill/SKILL.md` |
| frontend-ui-engineering | 前端 UI 工程化 | `.trae/skills/frontend-ui-engineering/SKILL.md` |

### 参考资料
| 文件 | 用途 | 路径 |
|------|------|------|
| definition-of-done.md | 完成定义 | `.trae/skills/references/definition-of-done.md` |
| testing-patterns.md | 测试模式 | `.trae/skills/references/testing-patterns.md` |
| security-checklist.md | 安全检查清单 | `.trae/skills/references/security-checklist.md` |
| performance-checklist.md | 性能检查清单 | `.trae/skills/references/performance-checklist.md` |
| accessibility-checklist.md | 无障碍检查清单 | `.trae/skills/references/accessibility-checklist.md` |
| orchestration-patterns.md | 编排模式 | `.trae/skills/references/orchestration-patterns.md` |

---

## 跨工具适配快速索引

Agent 定义采用中立格式（Markdown + YAML frontmatter），支持多工具：

| 工具 | 入口文件 | 自动加载 |
|------|---------|---------|
| **Trae** | `.trae/agents/` + `.trae/skills/` | ✅ 自动扫描 frontmatter |
| **Claude Code** | `CLAUDE.md` + `.claude/commands/` | ✅ `CLAUDE.md` 自动注入 |
| **Cursor** | `.cursor/rules/` | ✅ 自动注入 rules 到上下文 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ 自动加载 |
| **Codex / 通用** | `AGENTS.md`（根目录） | ✅ LLM 自行读取理解 |

**修改 Agent/Skill 只需更新 `.ai/` 下的 SSOT 文件**，各工具目录为引用层。

---

## 调用方式

### 方式 1：自然语言触发
```
"作为产品经理，为会议助手 App 撰写 MVP PRD"
"作为 Android 开发，实现基于 A2UI Schema 的课程详情页"
"启动 A2UI 开发流水线：PM → UX → A2UI → Dev → Review → Test"
```

### 方式 2：Skill 直接调用
```
"调用 agent2ui-expert skill 生成 A2UI Schema"
"调用 code-review-and-quality skill 审查这次 PR"
```

### 方式 3：状态图流水线
```
"启动 A2UI 状态图流水线：
 1. PM: 定义需求 → 检查 qg_pm_1/2
 2. UX: 设计规范 → 检查 qg_ux_1/2/3
 3. A2UI: 生成 Schema → 检查 qg_a2ui_1/2/3
 4. Dev: 实现代码 → 检查 qg_dev_1/2/3/4
 5. Review: 审查 → result=pass? → Tester : Dev (max 3x)
 6. Test: 测试 → result=pass? → 交付 : Dev (max 3x)"
```

---

## 工作流演进路线

```
v1.0 (之前)                    →        v2.0 (当前)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Markdown Agent 定义                     YAML Frontmatter + 正文分层
自由文本 Input/Output                  类型化 Input/Output 契约
手动顺序流转                           状态图 DAG 编排
无检查点                               检查点 + 断点恢复
无质量门控                             质量门控 (quality_gates)
无条件边                               条件边 (on_pass/on_fail)
无反馈循环                             MetaGPT 风格反馈循环 (max 3x)
无消费者声明                           消费者显式声明 (consumers)
```