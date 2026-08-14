# A2UI 项目子 Agent 调用指南

> **版本**: v1.0  
> **日期**: 2026-08-14  
> **适用项目**: Agent2UI

---

## 一、Agent 总览

| 编号 | Agent 角色 | 对应 Skill | 核心能力 | 典型输出 |
|------|-----------|-----------|---------|---------|
| 1 | 产品经理 | `product-manager` | 需求分析、PRD、场景调研、MVP 定义 | PRD 文档、用户画像、竞品分析 |
| 2 | UX 设计师 | `ux-design-architect` | 交互设计、视觉规范、Design Token、原型 | 设计规范、交互流、组件清单 |
| 3 | A2UI 专家 | `agent2ui-expert` | A2UI 架构、协议设计、数据模型、Compose 代码生成 | A2UI Schema、Compose 组件、数据映射 |
| 4 | Android 开发 | `frontend-architect` / `compose-expert` | Jetpack Compose、MVI、Clean Architecture、性能优化 | 可运行代码、架构图、依赖配置 |
| 5 | 代码审核 | `TRAE-code-review` / `code-review-and-quality` | Git 检视、多 Agent 协作、质量护栏、规范审查 | 审查意见、改进建议、冲突裁决 |
| 6 | Android 测试 | `android-emulator-skill` / `android-testing` | ADB 自动化、性能基准、视觉回归、稳定性测试 | 测试报告、覆盖率、性能数据 |

---

## 二、调用方式详解

### 方式一：自然语言触发（推荐）

在对话框中直接使用以下模式描述需求，系统会自动匹配对应 Skill：

#### 🔴 产品经理调用示例

```
# 场景：需求分析
"作为产品经理，帮我分析在线教育的 AI 问答场景需求"

# 场景：PRD 编写
"作为产品经理，为一个 A2UI 驱动的会议助手 App 撰写 MVP PRD"

# 场景：竞品分析
"作为产品经理，对比 AGenUI 和 Google A2UI 的市场定位差异"

# 场景：用户画像
"作为产品经理，为 K-12 学生用户创建用户画像和核心使用路径"

# 场景：功能优先级
"作为产品经理，对以下功能进行 RICE 模型排序：
 1. Agent 对话 UI
 2. 数据可视化仪表盘
 3. 多 Agent 协作
 4. 离线模式"
```

#### 🟡 UX 设计师调用示例

```
# 场景：设计规范
"作为 UX 设计师，为 A2UI Agent 聊天界面设计鸿蒙风格的 Design Token"

# 场景：交互原型
"作为 UX 设计师，设计 Agent 流式响应的打字机效果交互"

# 场景：组件库
"作为 UX 设计师，列出 A2UI 应用所需的核心组件清单和状态"

# 场景：视觉审查
"作为 UX 设计师，审查当前的 UI 设计是否符合 Material 3 规范"

# 场景：适配方案
"作为 UX 设计师，设计折叠屏设备下 A2UI 面板的布局策略"
```

#### 🟢 A2UI 专家调用示例

```
# 场景：数据模型设计
"作为 A2UI 专家，为课程详情页设计 A2UI JSON Schema"

# 场景：组件生成
"作为 A2UI 专家，将以下 JSON 数据转换为 Jetpack Compose 代码：
 { type: 'card', title: '高等数学', subtitle: '第 3 章', progress: 0.75 }"

# 场景：协议对接
"作为 A2UI 专家，分析 AGenUI 的 A2UI 协议并给出 Android 端适配方案"

# 场景：组件 Catalog
"作为 A2UI 专家，定义 A2UI 组件 Catalog 的最小可行集合（MVP）"

# 场景：性能优化
"作为 A2UI 专家，优化 A2UI JSON 解析到 Compose 渲染的端到端延迟"
```

#### 🔵 Android 开发调用示例

```
# 场景：架构搭建
"作为 Android 开发，搭建一个基于 Jetpack Compose + Hilt 的 A2UI 项目骨架"

# 场景：UI 实现
"作为 Android 开发，实现一个 Agent 对话界面，支持流式响应的打字机效果"

# 场景：数据层
"作为 Android 开发，实现 Room + Retrofit 混合数据源的 Repository 模式"

# 场景：性能优化
"作为 Android 开发，优化以下 Compose 列表的性能问题（附代码）"

# 场景：导航实现
"作为 Android 开发，使用 Navigation 3 实现 Agent 多步骤任务的状态驱动导航"
```

#### 🟣 代码审核调用示例

```
# 场景：PR 审查
"作为代码审核，审查这次 PR 的代码质量（粘贴 diff 或指 branch）"

# 场景：规范检查
"作为代码审核，检查项目是否遵循 Kotlin 协程最佳实践"

# 场景：多 Agent 协作
"作为代码审核，设计一个 5-Agent 并行审查的冲突解决机制"

# 场景：A2UI 合规
"作为代码审核，验证以下 A2UI JSON 是否符合协议规范"

# 场景：安全审计
"作为代码审核，检查代码中是否存在安全漏洞（OWASP Top 10）"
```

#### 🟠 Android 测试调用示例

```
# 场景：速度测试
"作为 Android 测试，为 Agent UI 生成速度编写 ADB 自动化测试脚本"

# 场景：视觉回归
"作为 Android 测试，设置视觉回归测试基线并验证当前 UI"

# 场景：性能基准
"作为 Android 测试，收集当前 App 的帧率、内存、CPU 性能数据"

# 场景：稳定性
"作为 Android 测试，执行 100 轮对话的长会话稳定性测试"

# 场景：兼容性
"作为 Android 测试，设计针对不同屏幕尺寸的兼容性测试矩阵"
```

---

### 方式二：Skill 直接调用

在对话中明确指定 Skill 名称：

| 意图 | 触发方式 |
|------|---------|
| 代码审查 | "调用 TRAE-code-review skill 审查这段代码" |
| Compose 开发 | "调用 compose-expert skill 实现这个界面" |
| Compose 性能优化 | "调用 compose-performance-audit skill 分析这个组件" |
| 架构设计 | "调用 android-architecture skill 搭建项目架构" |
| 数据层 | "调用 android-data-layer skill 实现 Repository" |
| ViewModel | "调用 android-viewmodel skill 实现这个 ViewModel" |
| Retrofit | "调用 android-retrofit skill 配置网络层" |
| 协程 | "调用 android-coroutines skill 检查协程使用" |
| 测试 | "调用 android-testing skill 编写测试" |
| XML 转 Compose | "调用 xml-to-compose-migration skill 转换布局" |
| 图像加载 | "调用 coil-compose skill 优化图片加载" |
| Kotlin 并发 | "调用 kotlin-concurrency-expert skill 审查并发代码" |

---

### 方式三：流水线模式（多 Agent 协作）

通过 `WORKFLOW.md` 定义的 6 角色流水线，一步完成从需求到交付：

```
# 标准流水线调用
"启动 A2UI 开发流水线：
 1. 产品经理分析在线教育场景需求
 2. UX 设计师设计交互规范
 3. A2UI 专家生成数据模型和组件
 4. Android 开发实现完整功能
 5. 代码审核执行质量检查
 6. Android 测试执行自动化验证
 输入场景：[具体描述]"
```

**流水线执行流程**：

```
用户需求
  │
  ▼
┌──────────────┐  spec.md  ┌──────────────┐  design.md  ┌──────────────┐
│  PM Agent   │──────────→│  UX Agent   │──────────→│  A2UI Agent │
│  (PRD)      │           │  (Design)   │           │  (Generate) │
└──────────────┘           └──────────────┘           └──────┬───────┘
                                                             │
                                                             ▼
                                                      Compose 代码
                                                             │
┌──────────────┐  审查意见  ┌──────────────┐  测试报告        │
│  Reviewer   │←──────────│  Tester     │←──────────────────┘
│  (Quality)  │           │  (ADB)      │
└──────┬───────┘           └──────────────┘
       │ ✅
       ▼
    交付 📦
```

---

## 三、项目上下文传递

### 3.1 上下文文件约定

| 文件 | 格式 | 用途 | 创建者 |
|------|------|------|--------|
| `spec.md` | Markdown | 产品需求文档 | 产品经理 |
| `design.md` | Markdown | 设计规范与原型 | UX 设计师 |
| `a2ui_schema.json` | JSON | A2UI 数据模型 | A2UI 专家 |
| `code/` | Kotlin 源码 | 实现代码 | Android 开发 |
| `review.md` | Markdown | 审查意见 | 代码审核 |
| `test_report.md` | Markdown | 测试报告 | Android 测试 |

### 3.2 跨 Agent 引用

当需要某个 Agent 参考另一个 Agent 的产出时，使用：

```
"作为 Android 开发，请基于 .trae/reports/03-UX设计师-鸿蒙移动端与Agent交互UX调研报告.md 
中的设计规范，实现课程详情页"
```

---

## 四、最佳实践

### ✅ 应该做

1. **明确角色**：在开头指明 "作为 XX 角色"，帮助系统加载正确的 Skill
2. **指定输出格式**：例如 "生成 Markdown 表格"、"输出 Kotlin 代码"
3. **提供约束**：例如 "目标 API Level 34"、"必须使用 Hilt 注入"
4. **附带参考**：引用已有的报告或规范文件
5. **分步调用**：复杂任务拆分为多步，每步调用对应 Agent

### ❌ 避免做

1. **模糊描述**：不要只说 "帮我设计 UI" 而不指定角色
2. **混合职责**：不要让产品经理写代码或让测试写 PRD
3. **跳过审查**：代码必须经过代码审核 Agent 才能交付
4. **忽略测试**：每次变更都要经过 Android 测试 Agent 验证
5. **硬编码**：组件必须通过 A2UI Schema 生成，不要直接手写

### 📋 快速检查清单

```
[ ] 是否指定了 Agent 角色？
[ ] 是否提供了具体的任务描述？
[ ] 是否附带了必要的参考文件？
[ ] 是否说明了输出格式要求？
[ ] 是否包含了技术约束？
[ ] 是否明确了验收标准？
```

---

## 五、报告与 Skill 对照表

| 报告 | 对应 Skill | 关键触发词 |
|------|-----------|-----------|
| `01-A2UI专家-AGenUI深度调研报告.md` | `agent2ui-expert` | A2UI、AGenUI、协议、Schema、组件 Catalog |
| `02-产品经理-教育与会议场景A2UI研究报告.md` | `product-manager` | 教育、会议、场景、需求、用户画像、MVP |
| `03-UX设计师-鸿蒙移动端与Agent交互UX调研报告.md` | `ux-design-architect` | 鸿蒙、Design Token、交互范式、视觉规范 |
| `04-安卓开发-A2UI技术框架总结.md` | `compose-expert` / `frontend-architect` | Jetpack Compose、MVI、Clean Architecture、Hilt |
| `05-代码审核-Git检视与多Agent协作.md` | `TRAE-code-review` | PR、Git、多 Agent、审查、质量护栏 |
| `06-安卓测试-ADB自动化验证方案.md` | `android-emulator-skill` | ADB、性能、视觉回归、稳定性、自动化 |

---

## 六、常见问题

### Q1: 可以同时调用多个 Agent 吗？
**A**: 可以。在请求中明确说明需要哪些角色协作：
> "请产品经理和 UX 设计师协作，为在线教育 App 设计核心用户路径"

### Q2: 如何确保 Agent 使用项目已有的技术栈？
**A**: 在请求中明确指定约束：
> "作为 Android 开发，使用项目已确定的技术栈（Compose BOM 2025.12、Hilt 2.57、Navigation 3）实现登录功能"

### Q3: Agent 之间如何共享状态？
**A**: 通过 `.trae/reports/` 目录下的上下文文件传递。建议每个 Agent 在完成任务后产出规范的 Markdown/JSON 文件。

### Q4: 如何重新运行某个 Agent 的任务？
**A**: 直接重新调用并指出需要参考的上下文：
> "作为 A2UI 专家，重新生成课程详情页的 Schema，参考 03-UX设计师 报告中的交互规范"

### Q5: 自定义 Agent 如何添加？
**A**: 在 `.trae/skills/` 目录下创建新的 Skill 目录和 `SKILL.md` 文件，然后在本指南中补充对应条目。

---

*本文档将随项目演进持续更新* 🚀