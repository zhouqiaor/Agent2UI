# MeetFlow 界面内容布局文档 - 第7部分：AI助手页

---

## 3. AI 助手页 (AssistantScreen)

### 3.1 页面入口
- **路由文件**: `app/(tabs)/assistant.tsx`
- **Screen 文件**: `screens/assistant/index.tsx`
- **Tab 名称**: AI助手
- **Tab 图标**: `FontAwesome6 name="wand-magic-sparkles"`

### 3.2 页面整体结构 (手机竖屏)

```
┌─────────────────────────────────────┐
│  SafeAreaView                       │
│                                     │
│  ┌── Header ────────────────────┐   │
│  │  flexDirection: row          │   │
│  │  alignItems: center          │   │
│  │  paddingHorizontal: 20       │   │
│  │  paddingTop: insets.top + 8  │   │
│  │  paddingBottom: 12           │   │
│  │  backgroundColor: #F0F0F3    │   │
│  │  borderBottomWidth: 1        │   │
│  │  borderBottomColor: #E8E8EB  │   │
│  │                              │   │
│  │  ┌── Avatar ─┐  ┌── Info ──┐│   │
│  │  │ 40x40      │  │ AI助手   ││   │
│  │  │ 圆角 12    │  │ 灵感×效率 ││   │
│  │  │ bg:linear  │  │         ││   │
│  │  │ gradient   │  └─────────┘│   │
│  │  │ [bot icon] │             │   │
│  │  │ white 20px │             │   │
│  │  └────────────┘             │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌── FlatList (消息列表) ───────┐   │
│  │  flex: 1                     │   │
│  │  contentContainerStyle:      │   │
│  │    paddingHorizontal: 20      │   │
│  │    paddingVertical: 16        │   │
│  │                              │   │
│  │  [消息气泡列表...]            │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌── Quick Actions (预设建议) ──┐   │
│  │  flexDirection: row          │   │
│  │  gap: 8                     │   │
│  │  paddingHorizontal: 20       │   │
│  │  paddingBottom: 12           │   │
│  │                              │   │
│  │  [创建会议] [生成议程]        │   │
│  │  [总结纪要] [会议复盘]        │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌── Input Bar ────────────────┐   │
│  │  flexDirection: row         │   │
│  │  alignItems: center         │   │
│  │  paddingHorizontal: 20       │   │
│  │  paddingTop: 8              │   │
│  │  paddingBottom: insets.bottom│   │
│  │  backgroundColor: #F0F0F3    │   │
│  │  borderTopWidth: 1          │   │
│  │  borderTopColor: #E8E8EB     │   │
│  │  gap: 10                    │   │
│  │                             │   │
│  │  ┌── Text Input ──────┐  ┌──Send──┐│
│  │  │ flex: 1            │  │ 42x42  ││
│  │  │ borderRadius: 12   │  │ 圆角14 ││
│  │  │ bg: #FFFFFF        │  │ bg:#4F46E5│
│  │  │ paddingHorizontal:14│  │ [paper-plane]│
│  │  │ paddingVertical:10 │  │ white 18px│
│  │  │ fontSize: 14       │  └────────┘│
│  │  │ placeholder:"输入  │            │
│  │  │ 你的问题..."       │            │
│  │  └────────────────────┘            │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3.3 Header 详细内容

#### AI 头像
```
形状: 圆角矩形, 40x40, borderRadius: 12
背景: linear-gradient(135deg, #4F46E5, #7C3AED)
图标: FontAwesome6 name="robot" size={20} color="#FFFFFF"
justifyContent: center, alignItems: center
```

#### 标题区域
```
标题: "AI助手" → fontSize: 17, fontWeight: '700', color: '#1E293B'
副标题: "灵感×效率" → fontSize: 12, color: '#64748B', marginTop: 2
```

### 3.4 消息气泡 (Message Bubble) 完整结构

#### AI 消息 (左对齐)
```
┌── View (flexDirection: row, marginBottom: 12) ──────────┐
│                                                          │
│  ┌── AI Avatar ─┐  ┌── Bubble Container ──────────┐     │
│  │ 32x32         │  │ maxWidth: '85%'               │     │
│  │ 圆角 8        │  │ bg: #FFFFFF                    │     │
│  │ bg: gradient  │  │ borderRadius: 16               │     │
│  │ [robot] 16px  │  │ borderTopLeftRadius: 4         │     │
│  │ white         │  │ padding: 12                   │     │
│  │ marginRight:8  │  │ shadowColor: #4F46E5          │     │
│  └───────────────┘  │ shadowOpacity: 0.05           │     │
│                      │ shadowRadius: 6               │     │
│                      │ elevation: 2                 │     │
│                      │                              │     │
│                      │  文本内容:                    │     │
│                      │  fontSize: 14                 │     │
│                      │  color: #334155              │     │
│                      │  lineHeight: 20               │     │
│                      └──────────────────────────────┘     │
│                                                          │
│  时间标签:                                                │
│  fontSize: 10, color: #94A3B8, marginLeft: 40            │
│  格式: HH:mm                                              │
└──────────────────────────────────────────────────────────┘
```

#### 用户消息 (右对齐)
```
┌── View (flexDirection: row, justifyContent: flex-end, marginBottom: 12) ─┐
│                                                                          │
│  ┌── Bubble Container ──────────────┐  ┌── User Avatar ──┐              │
│  │  maxWidth: '85%'                 │  │ 32x32              │              │
│  │  bg: #4F46E5                     │  │ 圆角 8             │              │
│  │  borderRadius: 16                │  │ bg: #E8E8EB        │              │
│  │  borderTopRightRadius: 4         │  │ [user] 16px        │              │
│  │  padding: 12                    │  │ color: #4F46E5     │              │
│  │  marginLeft: 40                  │  │ marginLeft: 8       │              │
│  │                                  │  └────────────────────┘              │
│  │  文本内容:                        │                                      │
│  │  fontSize: 14                    │                                      │
│  │  color: #FFFFFF                 │                                      │
│  │  lineHeight: 20                  │                                      │
│  └──────────────────────────────────┘                                      │
│                                                                          │
│  时间标签 (右对齐):                                                        │
│  fontSize: 10, color: #94A3B8, marginRight: 40                            │
│  格式: HH:mm                                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.5 流式加载指示器 (AI 回复中)

```
当 isStreaming = true 时在最新 AI 消息后显示:

┌── Streaming Row ─────────────────────┐
│  flexDirection: row                  │
│  alignItems: center                  │
│  gap: 6                              │
│  marginLeft: 40 (与气泡对齐)          │
│  marginBottom: 12                    │
│                                      │
│  [ActivityIndicator size="small"    │
│   color="#4F46E5"]                    │
│                                      │
│  "正在思考..."                       │
│  fontSize: 12, color: #94A3B8        │
│  fontStyle: 'italic'                │
└──────────────────────────────────────┘
```

### 3.6 快捷操作 (Quick Actions) 完整内容

| 序号 | 标签文本 | 图标 | 发送的消息 |
|------|---------|------|-----------|
| 1 | 创建会议 | calendar-plus | "帮我创建一个新会议" |
| 2 | 生成议程 | list-check | "帮我生成会议议程" |
| 3 | 总结纪要 | file-lines | "帮我总结会议纪要" |
| 4 | 会议复盘 | chart-line | "帮我做会议复盘" |

#### 快捷操作样式
```
paddingHorizontal: 12, paddingVertical: 8
borderRadius: 10
backgroundColor: rgba(79,70,229,0.08)
gap: 4

图标: 12px, color: #4F46E5
文本: fontSize: 12, fontWeight: '500', color: #4F46E5

点击行为: 将对应消息发送给 AI 助手
```

### 3.7 AI 回复内容 (服务端预设回复)

根据用户消息关键词匹配不同回复：

#### 关键词匹配规则

| 用户消息包含 | AI 回复模板 |
|-------------|-------------|
| "创建会议" / "新建会议" | 会议创建引导 + A2UI 组件预览 |
| "生成议程" / "议程" | 议程生成 + Agenda 组件 |
| "总结" / "纪要" | 会议纪要 + Note 组件 |
| "复盘" / "总结" | 会议复盘 + TaskList 组件 |
| (其他) | 通用智能回复 |

#### AI 示例回复 - 创建会议场景
```
"好的！我可以帮你创建一个新会议。请告诉我以下信息：

1. 会议主题是什么？
2. 预计参与人数？
3. 是线上还是线下？

或者，你可以选择一个模板快速开始："

(随后流式发送 Agenda 组件作为模板预览)
```

#### AI 示例回复 - 生成议程场景
```
"我根据你的需求生成了一个会议议程，请查看：

(随后流式发送 Agenda 组件:
  标题: "建议议程"
  items: [
    "开场介绍与背景说明",
    "核心议题讨论",
    "方案评估与决策",
    "行动计划与任务分配",
    "总结与下次会议安排"
  ])
```

#### AI 示例回复 - 总结纪要场景
```
"这是本次会议的纪要摘要：

(随后流式发送 Note 组件:
  标题: "会议纪要"
  内容: "本次会议主要讨论了产品规划方向，达成了三项关键决策..."
  标签: ["决策", "规划", "行动项"])
```

### 3.8 输入框区域

#### 输入框
```
flex: 1
borderRadius: 12
backgroundColor: #FFFFFF
paddingHorizontal: 14
paddingVertical: 10
fontSize: 14
color: #334155
placeholder: "输入你的问题..."
placeholderTextColor: #94A3B8
maxHeight: 100
```

#### 发送按钮
```
形状: 圆角矩形, 42x42, borderRadius: 14
背景: 当 inputText 为空时 → #C7D2FE
      当 inputText 有内容时 → #4F46E5
图标: FontAwesome6 name="paper-plane" size={18} color="#FFFFFF"

点击行为:
  1. 发送消息到 AI 助手
  2. 清空输入框
  3. AI 通过 SSE 流式回复
  4. 自动滚动到底部
```

### 3.9 平板横屏布局

```
┌──────────────────────────────────────────────────────┐
│  Header (同手机版)                                    │
├───────────────────────────┬──────────────────────────┤
│  Left Panel (flex: 1)    │  Right Panel (flex: 1.4) │
│                           │                          │
│  ┌── Quick Actions ───┐  │  ┌── Message List ───┐  │
│  │  标题: "快捷操作"   │  │  │  (消息气泡列表)    │  │
│  │                    │  │  │                    │  │
│  │  [创建会议]         │  │  │  AI: ...          │  │
│  │  [生成议程]         │  │  │  User: ...        │  │
│  │  [总结纪要]         │  │  │  AI: ...          │  │
│  │  [会议复盘]         │  │  │  (A2UI 组件预览)  │  │
│  │                    │  │  │                    │  │
│  │  标题: "最近会议"   │  │  └────────────────────┘  │
│  │                    │  │                          │
│  │  ┌── Meeting Item ┐│  │  ┌── Input Bar ───────┐ │
│  │  │ 标题 + 时间     ││  │  │  [Input] [Send]    │ │
│  │  └────────────────┘│  │  └────────────────────┘ │
│  │  ...               │  │                          │
│  └────────────────────┘  │                          │
│                           │                          │
│  padding: 24              │  padding: 24             │
└───────────────────────────┴──────────────────────────┘
```

### 3.10 数据来源

```
1. POST /api/v1/assistant/chat (SSE)
   Body: { message: string }
   响应: SSE 流式返回 AI 回复文本 + A2UI 组件

2. GET /api/v1/meetings?limit=5
   用于横屏左栏"最近会议"列表
```

### 3.11 初始欢迎消息

```
当 messages 数组为空时，自动添加一条 AI 消息:

角色: ai
内容: "你好！我是 MeetFlow AI 助手，可以帮你：

· 创建和规划会议
· 生成会议议程
· 总结会议纪要
· 进行会议复盘

试试下面的快捷操作，或者直接输入你的需求吧！"
时间: 当前时间
```
