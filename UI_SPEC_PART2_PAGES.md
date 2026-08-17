# MeetFlow UI 规范 - 第2部分：页面规范

## 1. 会议列表页 (MeetingsScreen)

### 页面结构
```
SafeAreaView
├── Header (56px)
│   ├── Title: "会议" (24px, bold)
│   └── Subtitle: "共 X 场会议" (14px, gray-500)
├── Filter Tabs (48px)
│   ├── [全部] [进行中] [即将开始] [已结束]
│   └── Active: primary bg, white text
│   └── Inactive: transparent, gray-500 text
├── Content (Flex 1)
│   ├── Meeting Card 1
│   ├── Meeting Card 2
│   └── ...
└── Tab Bar (56px + Safe Area)
```

### Header 样式
```typescript
{
  paddingHorizontal: 16,
  paddingTop: insets.top + 12,
  paddingBottom: 12,
  backgroundColor: colors.surface,
}
```

### Filter Tab 样式
```typescript
// 容器
{
  flexDirection: 'row',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

// Tab 项
{
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  borderRadius: 8,
  backgroundColor: isActive ? colors.primary : 'transparent',
}

// Tab 文本
{
  fontSize: 14,
  fontWeight: '500',
  color: isActive ? '#FFFFFF' : colors.textSecondary,
}
```

### Meeting Card 样式
```typescript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
}
```

### 状态标签颜色
```typescript
const statusColors = {
  live: { bg: '#DCFCE7', text: '#166534' },      // green
  upcoming: { bg: '#FEF3C7', text: '#92400E' },  // amber
  ended: { bg: '#F3F4F6', text: '#4B5563' },     // gray
};
```

## 2. 会议详情页 (MeetingDetailScreen)

### 页面结构
```
SafeAreaView
├── Header (56px)
│   ├── Back Button (40x40)
│   └── Title (18px, semibold)
├── Meeting Info Card
│   ├── Status Badge
│   ├── Title (24px, bold)
│   ├── Description (14px, gray-500)
│   ├── Divider
│   └── Meta Info (Date, Participants, Location)
└── A2UI Components (Flex 1)
    ├── Agenda Component
    ├── Poll Component
    └── Note Component
```

### Header 样式
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingTop: insets.top + 12,
  paddingBottom: 12,
  backgroundColor: colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}
```

### Meeting Info Card
```typescript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  margin: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
}
```

## 3. AI 助手页 (AssistantScreen)

### 页面结构
```
SafeAreaView
├── Header (56px)
│   └── Title: "🤖 AI 助手" (20px, semibold)
├── Messages (Flex 1)
│   ├── User Message (Right aligned)
│   │   └── Bubble: primary bg, white text
│   └── AI Message (Left aligned)
│       ├── Bubble: surface bg, primary text
│       └── A2UI Component (optional)
└── Input Area
    ├── TextInput (auto height, max 100px)
    └── Send Button (40x40, circular)
```

### 用户消息气泡
```typescript
{
  alignSelf: 'flex-end',
  maxWidth: '80%',
  backgroundColor: colors.primary,
  borderRadius: 16,
  borderTopRightRadius: 4,
  paddingHorizontal: 16,
  paddingVertical: 12,
}
```

### AI 消息气泡
```typescript
{
  alignSelf: 'flex-start',
  maxWidth: '80%',
  backgroundColor: colors.surface,
  borderRadius: 16,
  borderTopLeftRadius: 4,
  paddingHorizontal: 16,
  paddingVertical: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
}
```

### 输入区域
```typescript
{
  flexDirection: 'row',
  alignItems: 'flex-end',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
}

// TextInput
{
  flex: 1,
  backgroundColor: colors.gray100,
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  maxHeight: 100,
}

// Send Button
{
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: inputText.trim() ? colors.primary : colors.gray200,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 8,
}
```

## 4. 个人中心页 (ProfileScreen)

### 页面结构
```
SafeAreaView
├── Header (56px)
│   └── Title: "个人中心" (20px, semibold)
├── Profile Card
│   ├── Avatar (80x80, circular)
│   ├── Name (20px, semibold)
│   └── Email (14px, gray-500)
├── Stats Grid (2x2)
│   ├── 参与会议: 12
│   ├── 创建投票: 48
│   ├── 互动次数: 156
│   └── 满意度: 89%
└── Menu List
    ├── ⚙️ 设置
    ├── 📊 数据统计
    ├── ℹ️ 关于
    └── 🚪 退出登录
```

### Profile Card
```typescript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 24,
  margin: 16,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
}

// Avatar
{
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.primaryLight,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
}
```

### Stats Grid
```typescript
// 容器
{
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
  marginBottom: 16,
}

// 统计项
{
  width: '50%',
  paddingHorizontal: 8,
  marginBottom: 16,
}

// 统计卡片
{
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
}
```

### Menu List
```typescript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  marginHorizontal: 16,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
}

// Menu Item
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}
```
