# MeetFlow 界面内容布局文档 - 第8部分：个人中心页

---

## 4. 个人中心页 (ProfileScreen)

### 4.1 页面入口
- **路由文件**: `app/(tabs)/profile.tsx`
- **Screen 文件**: `screens/profile/index.tsx`
- **Tab 名称**: 我的
- **Tab 图标**: `FontAwesome6 name="user"`

### 4.2 页面整体结构 (手机竖屏)

```
┌─────────────────────────────────────┐
│  SafeAreaView                       │
│                                     │
│  ┌── ScrollView ────────────────┐   │
│  │  paddingTop: insets.top + 20 │   │
│  │  paddingHorizontal: 20       │   │
│  │  paddingBottom: 40           │   │
│  │  gap: 20                     │   │
│  │                              │   │
│  │  ┌── User Card ─────────────┐ │   │
│  │  │  bg: #FFFFFF               │ │   │
│  │  │  borderRadius: 20          │ │   │
│  │  │  padding: 20              │ │   │
│  │  │  alignItems: center       │ │   │
│  │  │  (见 4.3 详细结构)         │ │   │
│  │  └────────────────────────────┘ │   │
│  │                              │   │
│  │  ┌── Stats Card ────────────┐ │   │
│  │  │  (见 4.4 详细结构)         │ │   │
│  │  └────────────────────────────┘ │   │
│  │                              │   │
│  │  ┌── Menu Card ─────────────┐ │   │
│  │  │  (见 4.5 详细结构)         │ │   │
│  │  └────────────────────────────┘ │   │
│  │                              │   │
│  │  ┌── About Section ────────┐ │   │
│  │  │  (见 4.6 详细结构)         │ │   │
│  │  └────────────────────────────┘ │   │
│  │                              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 4.3 用户卡片 (User Card)

```
┌── Card (bg: #FFFFFF, borderRadius: 20, padding: 20, alignItems: center) ─┐
│                                                                          │
│  ┌── Avatar Container ───────────────────────────────┐                   │
│  │  80x80, borderRadius: 24                            │                   │
│  │  bg: linear-gradient(135deg, #4F46E5, #7C3AED)     │                   │
│  │  justifyContent: center, alignItems: center         │                   │
│  │                                                      │                   │
│  │  [FontAwesome6 name="user" size={32} color="#FFF"]   │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                                                                          │
│  marginBottom: 12                                                        │
│                                                                          │
│  "张明"                                                                   │
│  fontSize: 20, fontWeight: '800', color: '#1E293B'                       │
│  marginBottom: 4                                                         │
│                                                                          │
│  "产品经理 · 教育科技事业部"                                               │
│  fontSize: 13, color: '#64748B'                                           │
│                                                                          │
│  marginTop: 16                                                           │
│                                                                          │
│  ┌── Edit Profile Button ────────────────────────────┐                   │
│  │  flexDirection: row                               │                   │
│  │  alignItems: center                                │                   │
│  │  gap: 6                                            │                   │
│  │  paddingHorizontal: 16                             │                   │
│  │  paddingVertical: 8                                │                   │
│  │  borderRadius: 12                                  │                   │
│  │  bg: rgba(79,70,229,0.08)                          │                   │
│  │                                                    │                   │
│  │  [FontAwesome6 name="pen" size={12} color="#4F46E5"]│                   │
│  │  "编辑资料"                                        │                   │
│  │  fontSize: 13, fontWeight: '600', color: '#4F46E5' │                   │
│  │                                                    │                   │
│  │  onPress: 显示 Toast "功能开发中"                   │                   │
│  └────────────────────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.4 统计卡片 (Stats Card)

```
┌── Card (bg: #FFFFFF, borderRadius: 20, padding: 16) ──────────────────────┐
│                                                                          │
│  ┌── Stats Row (flexDirection: row, justifyContent: space-around) ──────┐ │
│  │                                                                      │ │
│  │  ┌── Stat Item ─────────┐  ┌── Divider ──┐  ┌── Stat Item ─────────┐│ │
│  │  │  alignItems: center  │  │  width: 1    │  │  alignItems: center  ││ │
│  │  │                       │  │  bg: #E8E8EB │  │                       ││ │
│  │  │  "28"                 │  │              │  │  "156h"               ││ │
│  │  │  fontSize: 24         │  └──────────────┘  │  fontSize: 24         ││ │
│  │  │  fontWeight: '800'    │                    │  fontWeight: '800'    ││ │
│  │  │  color: '#4F46E5'    │                    │  color: '#4F46E5'    ││ │
│  │  │  marginBottom: 4     │                    │  marginBottom: 4     ││ │
│  │  │                       │                    │                       ││ │
│  │  │  "参与会议"            │                    │  "会议时长"            ││ │
│  │  │  fontSize: 12         │                    │  fontSize: 12         ││ │
│  │  │  color: '#64748B'    │                    │  color: '#64748B'    ││ │
│  │  └───────────────────────┘                    └───────────────────────┘│ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 统计数据完整内容

| 统计项 | 数值 | 标签 |
|--------|------|------|
| 参与会议 | 28 | "参与会议" |
| 会议时长 | 156h | "会议时长" |

### 4.5 菜单卡片 (Menu Card)

```
┌── Card (bg: #FFFFFF, borderRadius: 20, overflow: hidden) ────────────────┐
│                                                                          │
│  ┌── Menu Item 1 ──────────────────────────────────────────────────────┐ │
│  │  flexDirection: row, alignItems: center, padding: 16, gap: 12       │ │
│  │                                                                    │ │
│  │  ┌── Icon Container ──┐  ┌── Text ──────────┐  ┌── Arrow ───┐    │ │
│  │  │ 36x36, 圆角 10      │  │ "我的会议"       │  │ [chevron-   │    │ │
│  │  │ bg: rgba(79,70,     │  │ fontSize: 15    │  │  right]     │    │ │
│  │  │ 229,0.08)           │  │ color: #1E293B  │  │ 16px #94A3B8│    │ │
│  │  │ justifyContent:     │  │ fontWeight: '500'│  │             │    │ │
│  │  │  center             │  └─────────────────┘  └─────────────┘    │ │
│  │  │ [calendar] 16px    │                                           │ │
│  │  │  color: #4F46E5    │                                           │ │
│  │  └────────────────────┘                                           │ │
│  │  borderBottomWidth: 1, borderBottomColor: #F1F5F9                │ │
│  │  onPress: router.navigate('/')                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌── Menu Item 2 ──────────────────────────────────────────────────────┐ │
│  │  同上结构                                                           │ │
│  │  图标: bell, color: #4F46E5                                        │ │
│  │  文本: "通知设置"                                                    │ │
│  │  onPress: 显示 Toast "功能开发中"                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌── Menu Item 3 ──────────────────────────────────────────────────────┐ │
│  │  同上结构                                                           │ │
│  │  图标: shield-halved, color: #4F46E5                                │ │
│  │  文本: "隐私与安全"                                                  │ │
│  │  onPress: 显示 Toast "功能开发中"                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌── Menu Item 4 (最后一项, 无底线) ────────────────────────────────────┐ │
│  │  同上结构                                                           │ │
│  │  图标: circle-info, color: #4F46E5                                 │ │
│  │  文本: "帮助与反馈"                                                  │ │
│  │  onPress: 显示 Toast "功能开发中"                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 菜单项完整内容

| 序号 | 图标 | 图标名称 | 文本 | 点击行为 |
|------|------|---------|------|---------|
| 1 | calendar | calendar | 我的会议 | router.navigate('/') |
| 2 | bell | bell | 通知设置 | Toast "功能开发中" |
| 3 | shield-halved | shield-halved | 隐私与安全 | Toast "功能开发中" |
| 4 | circle-info | circle-info | 帮助与反馈 | Toast "功能开发中" |

### 4.6 关于区域 (About Section)

```
┌── View (alignItems: center, gap: 4) ────────────────────────────────────┐
│                                                                        │
│  "MeetFlow v1.0.0"                                                     │
│  fontSize: 13, color: '#94A3B8'                                        │
│                                                                        │
│  "Powered by A2UI Technology"                                          │
│  fontSize: 11, color: '#CBD5E1'                                        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.7 Toast 提示组件

当点击未实现功能时显示:

```
┌── Toast (绝对定位, 底部居中) ──────────────────────────────────────────┐
│  position: absolute                                                   │
│  bottom: insets.bottom + 80                                           │
│  alignSelf: center                                                    │
│  flexDirection: row                                                   │
│  alignItems: center                                                   │
│  gap: 8                                                               │
│  bg: rgba(30,41,59,0.9)                                               │
│  paddingHorizontal: 16                                                │
│  paddingVertical: 12                                                  │
│  borderRadius: 12                                                     │
│                                                                       │
│  [FontAwesome6 name="circle-info" size={14} color="#FFFFFF"]          │
│  "功能开发中"                                                          │
│  fontSize: 14, color: '#FFFFFF'                                       │
└───────────────────────────────────────────────────────────────────────┘

显示时长: 2秒后自动消失
动画: 透明度从 0 → 1 (淡入), 1 → 0 (淡出)
```

### 4.8 平板横屏布局

```
┌──────────────────────────────────────────────────────┐
│  ScrollView (paddingHorizontal: 10% screen width)    │
│                                                      │
│  内容居中显示, maxWidth: 600                         │
│  与手机版结构相同, 仅外边距加宽                       │
│                                                      │
│  ┌── User Card ──────────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
│  ┌── Stats Card ─────────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
│  ┌── Menu Card ──────────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
│  ┌── About Section ───────────────────────────────┐   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 4.9 静态数据

个人中心页所有数据为前端硬编码（无后端接口）：

```typescript
const userInfo = {
  name: "张明",
  role: "产品经理 · 教育科技事业部"
};

const stats = [
  { value: "28", label: "参与会议" },
  { value: "156h", label: "会议时长" }
];

const menuItems = [
  { icon: "calendar", label: "我的会议" },
  { icon: "bell", label: "通知设置" },
  { icon: "shield-halved", label: "隐私与安全" },
  { icon: "circle-info", label: "帮助与反馈" }
];

const appInfo = {
  version: "v1.0.0",
  poweredBy: "Powered by A2UI Technology"
};
```
