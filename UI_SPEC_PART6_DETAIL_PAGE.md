# MeetFlow 界面内容布局文档 - 第6部分：会议详情页

---

## 2. 会议详情页 (MeetingDetailScreen)

### 2.1 页面入口
- **路由文件**: `app/meeting-detail.tsx`
- **Screen 文件**: `screens/meeting-detail/index.tsx`
- **参数**: `{ id: string }` (会议 ID)
- **导航方式**: `router.push('/meeting-detail', { id: meeting.id })`

### 2.2 数据加载
```
1. GET /api/v1/meetings/:id → 获取会议基本信息
2. POST /api/v1/a2ui/stream → { meetingId: id, action: 'load' } → SSE 流式加载 A2UI 组件
```

### 2.3 页面整体结构 (手机竖屏)

```
┌─────────────────────────────────────┐
│  SafeAreaView                       │
│                                     │
│  ┌── Header ────────────────────┐   │
│  │  flexDirection: row          │   │
│  │  alignItems: center          │   │
│  │  paddingHorizontal: 16       │   │
│  │  paddingTop: insets.top + 8  │   │
│  │  paddingBottom: 12           │   │
│  │  backgroundColor: #F0F0F3    │   │
│  │                              │   │
│  │  [← 返回]  会议标题           │   │
│  │            组织者·人数·地点    │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌── ScrollView ────────────────┐   │
│  │  paddingHorizontal: 20       │   │
│  │  paddingTop: 16             │   │
│  │                              │   │
│  │  ┌── Meeting Info Card ───┐  │   │
│  │  │  bg: #FFFFFF            │  │   │
│  │  │  borderRadius: 16       │  │   │
│  │  │  padding: 16            │  │   │
│  │  │  marginBottom: 16       │  │   │
│  │  │  gap: 10               │  │   │
│  │  │                        │  │   │
│  │  │  [clock] 会议时间       │  │   │
│  │  │  [pin]  会议地点        │  │   │
│  │  │  [badge] 进行中         │  │   │
│  │  └────────────────────────┘  │   │
│  │                              │   │
│  │  ┌── A2UI Components ──────┐ │   │
│  │  │  (SSE 流式加载)          │ │   │
│  │  │                          │ │   │
│  │  │  1. Heading: "标题"     │ │   │
│  │  │  2. Text: 描述文本      │ │   │
│  │  │  3. Divider             │ │   │
│  │  │  4. Agenda: 议程列表    │ │   │
│  │  │  5. Poll: 投票           │ │   │
│  │  │  6. Note: 笔记          │ │   │
│  │  │  7. QA: 问答            │ │   │
│  │  │  8. TaskList: 任务列表   │ │   │
│  │  │  9. ActionButton: 按钮   │ │   │
│  │  └──────────────────────────┘ │   │
│  │                              │   │
│  │  height: 100 (底部留白)     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2.4 Header 详细内容

#### 返回按钮
```
形状: 圆角矩形, 38x38, borderRadius: 12
背景: #E8E8EB
图标: FontAwesome6 name="chevron-left" size={18} color="#1E293B"
点击行为: router.back()
```

#### 标题区域 (headerCenter)
```
marginLeft: 12

标题:
  fontSize: 16, fontWeight: '700', color: '#1E293B'
  numberOfLines: 1
  文本: meeting?.title || '会议详情'

副标题:
  fontSize: 12, color: '#64748B', marginTop: 2
  文本: `${meeting?.organizer} · ${meeting?.participants}人参与 · ${meeting?.location}`
```

#### 右侧流式指示器
```
当 streamLoading 为 true 时显示:

┌── Streaming Indicator ──────────┐
│  flexDirection: row            │
│  alignItems: center            │
│  gap: 6                        │
│  bg: rgba(79,70,229,0.08)      │
│  paddingHorizontal: 10         │
│  paddingVertical: 6            │
│  borderRadius: 12             │
│                                │
│  [ActivityIndicator small]     │
│  "AI 生成中"                    │
│  fontSize: 11, fontWeight: '600'│
│  color: #4F46E5                │
└────────────────────────────────┘
```

### 2.5 会议信息卡片 (Meeting Info Card)

#### 手机竖屏样式
```
bg: #FFFFFF
borderRadius: 16
padding: 16
marginBottom: 16
gap: 10
shadowColor: #4F46E5
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.06, shadowRadius: 8
elevation: 2
```

#### 信息行内容 (3行)

| 行 | 图标 | 图标容器 | 文本内容 | 文本样式 |
|----|------|---------|---------|---------|
| 1 | clock | 32x32 圆角 10, bg rgba(79,70,229,0.08) | meeting.time | fontSize: 14, color: #475569, fontWeight: '500' |
| 2 | location-dot | 同上 | meeting.location | 同上 |
| 3 | (无图标) | - | 状态标签 | 见下方状态标签 |

#### 状态标签 (详情页内)
```
paddingHorizontal: 10, paddingVertical: 4
borderRadius: 8
backgroundColor: getStatusColor(status) + '15' (15% 透明度)

| 状态 | 文本 | 文字颜色 |
|------|------|---------|
| live | 进行中 | #10B981 |
| upcoming | 即将开始 | #4F46E5 |
| ended | 已结束 | #94A3B8 |
```

### 2.6 A2UI 组件流式加载顺序

**教育场景** (meetingId: 1, 3, 5):

| 序号 | 组件类型 | 内容数据 |
|------|---------|---------|
| 1 | heading | { text: "React Native 新架构深度解析", level: 1 } |
| 2 | text | "本次研讨将深入探讨 React Native 的新架构设计..." |
| 3 | divider | {} (分割线) |
| 4 | agenda | { title: "今日议程", items: [...] } |
| 5 | poll | { question: "你最期待哪个主题？", options: [...] } |
| 6 | note | { title: "关键要点", content: "...", tags: [...] } |
| 7 | qa | { question: "...", answers: [...] } |
| 8 | task_list | { title: "课后任务", tasks: [...] } |
| 9 | action_button | { text: "加入讨论", action: "join_discussion", variant: "primary" } |

**会议场景** (meetingId: 2, 4):

| 序号 | 组件类型 | 内容数据 |
|------|---------|---------|
| 1 | heading | { text: "Q1 产品规划会议", level: 1 } |
| 2 | text | "本次会议将讨论 2025 年第一季度的产品路线图..." |
| 3 | divider | {} |
| 4 | agenda | { title: "会议议程", items: [...] } |
| 5 | poll | { question: "Q1 最优先的产品方向是？", options: [...] } |
| 6 | note | { title: "会议要点", content: "...", tags: [...] } |
| 7 | task_list | { title: "行动项", tasks: [...] } |
| 8 | action_button | { text: "查看完整纪要", action: "view_summary", variant: "primary" } |

### 2.7 教育场景 A2UI 组件完整数据

#### 议程组件数据 (Agenda)
```json
{
  "title": "今日议程",
  "items": [
    { "id": "a1", "text": "新架构概览与演进历程", "completed": true },
    { "id": "a2", "text": "Fabric 渲染器原理", "completed": true },
    { "id": "a3", "text": "TurboModules 实战", "completed": false },
    { "id": "a4", "text": "JSI 与宿主通信机制", "completed": false },
    { "id": "a5", "text": "Q&A 互动环节", "completed": false }
  ]
}
```

#### 投票组件数据 (Poll)
```json
{
  "question": "你最期待哪个主题？",
  "type": "single",
  "options": [
    { "id": "p1", "text": "Fabric 渲染器", "votes": 12 },
    { "id": "p2", "text": "TurboModules", "votes": 18 },
    { "id": "p3", "text": "JSI 通信机制", "votes": 8 },
    { "id": "p4", "text": "迁移最佳实践", "votes": 15 }
  ],
  "totalVotes": 53
}
```

#### 笔记组件数据 (Note)
```json
{
  "title": "关键要点",
  "content": "Fabric 渲染器采用同步渲染模式，解决了旧架构中的线程通信延迟问题。TurboModules 实现了按需加载，显著减少了启动时间。",
  "tags": ["核心概念", "架构设计"]
}
```

#### 问答组件数据 (QA)
```json
{
  "question": "Fabric 渲染器与旧架构的主要区别是什么？",
  "answers": [
    { "author": "张教授", "content": "Fabric 采用同步渲染，消除了异步通信的延迟。", "isExpert": true },
    { "author": "陈工程师", "content": "新架构支持了 React 的并发特性，提升了交互体验。", "isExpert": false }
  ]
}
```

#### 任务列表数据 (TaskList)
```json
{
  "title": "课后任务",
  "tasks": [
    { "id": "t1", "text": "阅读 Fabric 源码文档", "assignee": "全体", "priority": "high" },
    { "id": "t2", "text": "完成 TurboModules Demo", "assignee": "开发组", "priority": "medium" },
    { "id": "t3", "text": "撰写学习心得", "assignee": "全体", "priority": "low" }
  ]
}
```

#### 操作按钮数据 (ActionButton)
```json
{
  "text": "加入讨论",
  "action": "join_discussion",
  "variant": "primary"
}
```

### 2.8 会议场景 A2UI 组件完整数据

#### 议程组件数据
```json
{
  "title": "会议议程",
  "items": [
    { "id": "a1", "text": "回顾 Q4 目标完成情况", "completed": true },
    { "id": "a2", "text": "Q1 核心目标讨论", "completed": false },
    { "id": "a3", "text": "资源分配与优先级", "completed": false },
    { "id": "a4", "text": "风险评估与应对策略", "completed": false },
    { "id": "a5", "text": "下一步行动计划", "completed": false }
  ]
}
```

#### 投票组件数据
```json
{
  "question": "Q1 最优先的产品方向是？",
  "type": "single",
  "options": [
    { "id": "p1", "text": "用户体验优化", "votes": 5 },
    { "id": "p2", "text": "新功能开发", "votes": 3 },
    { "id": "p3", "text": "性能与稳定性", "votes": 4 },
    { "id": "p4", "text": "国际化拓展", "votes": 2 }
  ],
  "totalVotes": 14
}
```

#### 任务列表数据
```json
{
  "title": "行动项",
  "tasks": [
    { "id": "t1", "text": "完成需求文档", "assignee": "产品组", "priority": "high" },
    { "id": "t2", "text": "技术方案设计", "assignee": "技术组", "priority": "high" },
    { "id": "t3", "text": "市场调研", "assignee": "市场组", "priority": "medium" }
  ]
}
```

### 2.9 平板横屏双栏布局

```
┌──────────────────────────────────────────────────────┐
│  Header (同手机版)                                    │
├───────────────────────────┬──────────────────────────┤
│  Left Column (flex: 3)   │  Right Column (flex: 2)  │
│  borderRightWidth: 1      │  bg: rgba(79,70,229,0.02)│
│                           │                          │
│  ┌── Meeting Info ──────┐ │  ┌── Right Header ────┐ │
│  │  [clock] 时间         │ │  │ [comments] 实时互动 │ │
│  │  [pin] 地点          │ │  └────────────────────┘ │
│  │  [badge] 状态        │ │                          │
│  └──────────────────────┘ │  ┌── Interaction ────┐  │
│                           │  │  Components:      │  │
│  ┌── Info Components ──┐  │  │  • Poll           │  │
│  │  • Heading          │  │  │  • QA             │  │
│  │  • Text             │  │  │  • TaskList       │  │
│  │  • Divider          │  │  │  • ActionButton   │  │
│  │  • Agenda           │  │  └───────────────────┘  │
│  │  • Note             │  │                          │
│  └────────────────────┘  │                          │
│                           │                          │
│  padding: 24              │  padding: 24             │
└───────────────────────────┴──────────────────────────┘

组件分类规则:
  INFO_TYPES: heading, text, agenda, note, divider → 左栏
  INTERACTION_TYPES: poll, qa, task_list, action_button → 右栏
```

### 2.10 加载状态

```
首次加载 (loadingMeeting = true):
  居中显示 ActivityIndicator (size: "large", color: "#4F46E5")

流式加载 (streamLoading = true && components.length === 0):
  A2UIRenderer 显示流式加载指示器
```
