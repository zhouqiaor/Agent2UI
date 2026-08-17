# MeetFlow 界面内容布局文档 - 第5部分：会议列表页

> 本文档记录每个界面的**确切内容**、文本标签、数据结构、布局层级和交互行为

---

## 1. 会议列表页 (MeetingsScreen)

### 1.1 页面入口
- **路由文件**: `app/(tabs)/index.tsx`
- **Screen 文件**: `screens/meetings/index.tsx`
- **Tab 名称**: 首页
- **Tab 图标**: `FontAwesome6 name="house"`
- **首次进入**: 检测 AsyncStorage `@meetflow_onboarding_done`，若不存在则显示引导页

### 1.2 页面整体结构 (手机竖屏)

```
┌─────────────────────────────────────┐
│  SafeAreaView (bg: #F0F0F3)         │
│                                     │
│  ┌─── Header ────────────────────┐  │
│  │  paddingTop: insets.top + 12   │  │
│  │  paddingHorizontal: 20          │  │
│  │  paddingBottom: 16             │  │
│  │                                │  │
│  │  ┌── Header Top Row ────────┐  │  │
│  │  │  flexDirection: row       │  │  │
│  │  │  justifyContent: space-between│ │  │
│  │  │                            │  │  │
│  │  │  ┌── Left ──┐  ┌── Right ─┐│  │  │
│  │  │  │ MeetFlow │  │ [Avatar] ││  │  │
│  │  │  │ 智能会议助手│  │  42x42  ││  │  │
│  │  │  └──────────┘  └─────────┘│  │  │
│  │  └────────────────────────────┘  │  │
│  │                                │  │
│  │  ┌── Filter Row ──────────────┐  │  │
│  │  │  flexDirection: row        │  │  │
│  │  │  gap: 8                    │  │  │
│  │  │                            │  │  │
│  │  │  [全部] [进行中]            │  │  │
│  │  │  [即将开始] [已结束]        │  │  │
│  │  └────────────────────────────┘  │  │
│  └────────────────────────────────┘  │
│                                     │
│  ┌── ScrollView ─────────────────┐   │
│  │  paddingHorizontal: 20        │   │
│  │  paddingTop: 8               │   │
│  │  gap: 16                     │   │
│  │                              │   │
│  │  ┌── Meeting Card ────────┐  │   │
│  │  │  (见下方详细结构)       │  │   │
│  │  └────────────────────────┘  │   │
│  │                              │   │
│  │  ┌── Meeting Card ────────┐  │   │
│  │  └────────────────────────┘  │   │
│  │  ...                         │   │
│  │  height: 100 (底部留白)     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 1.3 Header 详细内容

#### 左侧文字
```
"MeetFlow"         → fontSize: 26, fontWeight: '800', color: '#1E293B'
"智能会议助手"      → fontSize: 13, color: '#64748B', marginTop: 2
```

#### 右侧头像按钮
```
形状: 圆形, 42x42, borderRadius: 21
背景: rgba(79,70,229,0.1)
图标: FontAwesome6 name="user" size={18} color="#4F46E5"
点击行为: router.push('/profile')
```

### 1.4 筛选标签 (Filter Chips) 完整内容

| 标签文本 | key 值 | 说明 |
|---------|--------|------|
| 全部 | all | 默认选中 |
| 进行中 | ongoing | 进行中的会议 |
| 即将开始 | upcoming | 未开始的会议 |
| 已结束 | completed | 已结束的会议 |

#### 筛选标签样式
```
未选中:
  paddingHorizontal: 14, paddingVertical: 8
  borderRadius: 20
  backgroundColor: #E8E8EB
  文本: fontSize: 13, fontWeight: '600', color: '#64748B'

选中:
  backgroundColor: #4F46E5
  文本: color: '#FFFFFF'
```

### 1.5 会议卡片 (Meeting Card) 完整结构

```
┌── Pressable (onPress: router.push('/meeting-detail', { id })) ──┐
│  backgroundColor: #F0F0F3                                       │
│  borderRadius: 20                                               │
│  marginBottom: 16                                               │
│  overflow: hidden                                               │
│  shadowColor: #D1D9E6                                           │
│  shadowOffset: { width: 4, height: 4 }                         │
│  shadowOpacity: 0.6, shadowRadius: 8                            │
│  elevation: 4                                                   │
│                                                                 │
│  ┌── Image ───────────────────────────────────────────────┐     │
│  │  source: { uri: meeting.imageUrl }                     │     │
│  │  width: 100%, height: 140                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌── Card Overlay (padding: 16) ─────────────────────────┐     │
│  │                                                        │     │
│  │  ┌── Card Top Row ──────────────────────────────┐     │     │
│  │  │  flexDirection: row                            │     │     │
│  │  │  justifyContent: space-between                 │     │     │
│  │  │  alignItems: center                            │     │     │
│  │  │  marginBottom: 8                               │     │     │
│  │  │                                                │     │     │
│  │  │  ┌── Status Badge ──────┐  ┌── Type Badge ──┐│     │     │
│  │  │  │ flexDirection: row     │  │ flexDirection: row││     │     │
│  │  │  │ alignItems: center     │  │ alignItems: center││     │     │
│  │  │  │ gap: 4                 │  │ gap: 4           ││     │     │
│  │  │  │ paddingHorizontal: 10  │  │ bg: rgba(79,    ││     │     │
│  │  │  │ paddingVertical: 4     │  │ 70,229,0.08)    ││     │     │
│  │  │  │ borderRadius: 12      │  │ paddingHorizontal││     │     │
│  │  │  │                        │  │ : 8              ││     │     │
│  │  │  │ ┌──Dot─┐ ┌──Text──┐   │  │ paddingVertical: 4││     │     │
│  │  │  │ │ 6x6  │ │ 进行中 │   │  │ borderRadius: 10 ││     │     │
│  │  │  │ │ 圆点  │ │        │   │  │                  ││     │     │
│  │  │  │ └──────┘ └───────┘   │  │ [图标] 教育/会议  ││     │     │
│  │  │  └───────────────────────┘  └─────────────────┘│     │     │
│  │  └────────────────────────────────────────────────┘     │     │
│  │                                                        │     │
│  │  ┌── Title ───────────────────────────────────────┐     │     │
│  │  │  fontSize: 16, fontWeight: '700'               │     │     │
│  │  │  color: '#1E293B', marginBottom: 10            │     │     │
│  │  │  numberOfLines: 2                               │     │     │
│  │  │  文本: meeting.title                            │     │     │
│  │  └────────────────────────────────────────────────┘     │     │
│  │                                                        │     │
│  │  ┌── Meta Row ────────────────────────────────────┐     │     │
│  │  │  flexDirection: row, gap: 14                    │     │     │
│  │  │                                                │     │     │
│  │  │  ┌── Time ──────┐  ┌── People ─┐  ┌── Org ──┐│     │     │
│  │  │  │ [clock] 09:00 │  │[user-group]│  │[user]   ││     │     │
│  │  │  │ size: 11      │  │  45人     │  │ 张教授  ││     │     │
│  │  │  │ color:#94A3B8 │  │           │  │         ││     │     │
│  │  │  └───────────────┘  └──────────┘  └─────────┘│     │     │
│  │  └────────────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 状态标签完整内容

| 状态 key | 标签文本 | 圆点颜色 | 文字颜色 | 背景色 |
|---------|---------|---------|---------|-------|
| ongoing | 进行中 | #10B981 | #10B981 | rgba(16,185,129,0.1) |
| upcoming | 即将开始 | #F59E0B | #F59E0B | rgba(245,158,11,0.1) |
| completed | 已结束 | #94A3B8 | #94A3B8 | rgba(148,163,184,0.1) |

### 1.7 类型标签完整内容

| 类型 key | 标签文本 | 图标 |
|---------|---------|------|
| education | 教育 | FontAwesome6 name="graduation-cap" |
| meeting | 会议 | FontAwesome6 name="users" |

### 1.8 卡片元信息行完整内容

| 元信息 | 图标 | 图标尺寸 | 图标颜色 | 文字样式 |
|--------|------|---------|---------|---------|
| 时间 | clock | 11 | #94A3B8 | fontSize: 12, color: #94A3B8 |
| 人数 | user-group | 11 | #94A3B8 | fontSize: 12, color: #94A3B8 |
| 组织者 | user | 11 | #94A3B8 | fontSize: 12, color: #94A3B8 |

时间格式：`new Date(meeting.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })`

### 1.9 空状态 (Empty State) 完整内容

```
┌── Empty State ──────────────────────────┐
│  alignItems: center                     │
│  paddingVertical: 60                    │
│  paddingHorizontal: 32                  │
│                                        │
│  ┌── Icon Container ──────────────┐     │
│  │  80x80, borderRadius: 24       │     │
│  │  bg: rgba(79,70,229,0.1)       │     │
│  │  图标: calendar-plus, 36px     │     │
│  │  color: #4F46E5                │     │
│  │  marginBottom: 20              │     │
│  └────────────────────────────────┘     │
│                                        │
│  "暂无会议安排"                         │
│  fontSize: 18, fontWeight: '700'        │
│  color: '#1E293B', marginBottom: 8      │
│                                        │
│  "AI 助手可以帮你快速创建会议           │
│   并自动生成议程和互动组件"              │
│  fontSize: 14, color: '#64748B'         │
│  textAlign: center, lineHeight: 20      │
│  marginBottom: 24                       │
│                                        │
│  ┌── Primary Button ───────────────┐    │
│  │  "让 AI 帮我创建"               │    │
│  │  图标: wand-magic-sparkles 14px │    │
│  │  bg: #4F46E5                    │    │
│  │  color: #FFFFFF                 │    │
│  │  borderRadius: 14              │    │
│  │  width: 100%                    │    │
│  │  onPress: router.push('/assistant')│  │
│  └─────────────────────────────────┘    │
│                                        │
│  ┌── Secondary Button ─────────────┐    │
│  │  "手动创建会议"                 │    │
│  │  bg: rgba(79,70,229,0.08)       │    │
│  │  color: #4F46E5                 │    │
│  │  borderRadius: 14              │    │
│  │  width: 100%                    │    │
│  │  onPress: router.push('/assistant')│  │
│  └─────────────────────────────────┘    │
└────────────────────────────────────────┘
```

### 1.10 骨架屏 (Loading State)

首次加载时显示 2 个 `MeetingCardSkeleton` 组件

### 1.11 平板横屏布局差异

```
meetingGridTablet:
  flexDirection: row
  flexWrap: wrap
  gap: 16

meetingCardTablet:
  width: '48%'  (每行两张卡片)
```

### 1.12 数据来源

```
GET /api/v1/meetings              → 获取全部会议
GET /api/v1/meetings?status=ongoing → 获取进行中会议
GET /api/v1/meetings?status=upcoming → 获取即将开始会议
GET /api/v1/meetings?status=completed → 获取已结束会议
```

### 1.13 预置会议数据 (5条)

| ID | 标题 | 类型 | 状态 | 人数 | 组织者 | 时间 |
|----|------|------|------|------|--------|------|
| 1 | React Native 高级架构研讨 | education | ongoing | 45 | 张教授 | 2025-01-15 09:00 |
| 2 | Q1 产品规划会议 | meeting | ongoing | 12 | 李总监 | 2025-01-15 14:00 |
| 3 | AI 在教育领域的应用 | education | upcoming | 80 | 王博士 | 2025-01-16 10:00 |
| 4 | 团队建设活动规划 | meeting | upcoming | 8 | 赵经理 | 2025-01-17 15:00 |
| 5 | 移动端性能优化分享 | education | completed | 60 | 陈工程师 | 2025-01-10 09:00 |
