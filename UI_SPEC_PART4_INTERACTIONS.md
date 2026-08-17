# MeetFlow UI 规范 - 第4部分：交互与动效

## 1. 交互状态规范

### 1.1 按钮状态

| 状态 | 背景色 | 边框 | 文本色 | 透明度 |
|-----|--------|------|--------|--------|
| Default | primary-600 | - | #FFFFFF | 100% |
| Hover | primary-700 | - | #FFFFFF | 100% |
| Pressed | primary-800 | - | #FFFFFF | 100% |
| Disabled | gray-200 | - | gray-400 | 50% |
| Loading | primary-600 | - | #FFFFFF | 100% |

### 1.2 输入框状态

| 状态 | 背景色 | 边框 | 阴影 |
|-----|--------|------|------|
| Default | gray-100 | transparent | - |
| Focused | gray-100 | primary-500 | 0 0 0 3px primary-100 |
| Error | gray-100 | error-500 | 0 0 0 3px error-100 |
| Disabled | gray-50 | gray-200 | - |

### 1.3 卡片状态

| 状态 | 阴影 | 边框 | 变换 |
|-----|------|------|------|
| Default | shadow-md | - | - |
| Hover | shadow-lg | - | translateY(-2px) |
| Pressed | shadow-sm | - | scale(0.98) |

### 1.4 列表项状态

| 状态 | 背景色 | 变换 |
|-----|--------|------|
| Default | transparent | - |
| Hover | gray-50 | - |
| Pressed | gray-100 | scale(0.98) |
| Selected | primary-50 | - |

## 2. 动效详细规范

### 2.1 页面转场

```typescript
// 进入页面 (从右滑入)
{
  from: { transform: [{ translateX: screenWidth }] },
  to: { transform: [{ translateX: 0 }] },
  config: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  },
}

// 退出页面 (向左滑出)
{
  from: { transform: [{ translateX: 0 }] },
  to: { transform: [{ translateX: -screenWidth }] },
  config: {
    duration: 300,
    easing: Easing.in(Easing.cubic),
  },
}

// 淡入
{
  from: { opacity: 0 },
  to: { opacity: 1 },
  config: {
    duration: 200,
    easing: Easing.out(Easing.cubic),
  },
}
```

### 2.2 列表项动画

```typescript
// 列表项进入动画 (交错)
Animated.stagger(50, items.map((_, index) => 
  Animated.parallel([
    Animated.timing(fadeAnim[index], {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim[index], {
      toValue: 0,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }),
  ])
))
```

### 2.3 按钮点击动画

```typescript
// 按下缩放
Animated.timing(scaleAnim, {
  toValue: 0.95,
  duration: 100,
  useNativeDriver: true,
})

// 释放回弹
Animated.spring(scaleAnim, {
  toValue: 1,
  friction: 3,
  useNativeDriver: true,
})
```

### 2.4 复选框动画

```typescript
// 选中动画序列
Animated.sequence([
  // 缩小
  Animated.timing(checkScale, {
    toValue: 0.9,
    duration: 100,
    useNativeDriver: true,
  }),
  // 回弹
  Animated.spring(checkScale, {
    toValue: 1,
    friction: 3,
    useNativeDriver: true,
  }),
])
```

### 2.5 进度条动画

```typescript
Animated.timing(progressAnim, {
  toValue: targetValue,
  duration: 500,
  useNativeDriver: false, // width 不支持 native driver
})
```

### 2.6 Toast 动画

```typescript
// 显示 (从底部滑入 + 淡入)
Animated.parallel([
  Animated.spring(slideAnim, {
    toValue: 0,
    friction: 8,
    useNativeDriver: true,
  }),
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }),
])

// 隐藏 (向下滑出 + 淡出)
Animated.parallel([
  Animated.timing(slideAnim, {
    toValue: 100,
    duration: 200,
    useNativeDriver: true,
  }),
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  }),
])
```

### 2.7 骨架屏闪光动画

```typescript
Animated.loop(
  Animated.timing(shimmerAnim, {
    toValue: 200,
    duration: 1500,
    useNativeDriver: true,
  })
)
```

## 3. 响应式布局规范

### 3.1 断点定义

```typescript
const breakpoints = {
  mobile: 0,        // 0-767px
  tablet: 768,      // 768-1023px
  desktop: 1024,    // 1024px+
};
```

### 3.2 设备检测 Hook

```typescript
const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;
  
  return {
    isTablet,
    isDesktop,
    isLandscape,
    isMobile: !isTablet,
    screenWidth: width,
    screenHeight: height,
  };
};
```

### 3.3 平板横屏布局

#### 会议列表页 (横屏)
```typescript
// 双列布局
{
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
}

// 卡片宽度
{
  width: '50%',
  paddingHorizontal: 8,
  marginBottom: 16,
}
```

#### 会议详情页 (横屏)
```typescript
// 双栏布局
{
  flexDirection: 'row',
  flex: 1,
}

// 左侧信息栏
{
  width: '40%',
  borderRightWidth: 1,
  borderRightColor: colors.border,
}

// 右侧内容栏
{
  flex: 1,
}
```

#### AI 助手页 (横屏)
```typescript
// 双列消息布局
{
  flexDirection: 'row',
  flexWrap: 'wrap',
}

// 消息宽度
{
  width: '50%',
  paddingHorizontal: 8,
}
```

### 3.4 侧边导航 (平板横屏)

```typescript
// 侧边栏容器
{
  width: 80,
  backgroundColor: colors.surface,
  borderRightWidth: 1,
  borderRightColor: colors.border,
  paddingTop: insets.top + 12,
  paddingBottom: insets.bottom,
}

// 导航项
{
  width: 56,
  height: 56,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 12,
  marginBottom: 8,
  backgroundColor: isActive ? colors.primaryLight10 : 'transparent',
}

// 图标
{
  size: 24,
  color: isActive ? colors.primary : colors.textSecondary,
}
```

## 4. 图标规范

### 4.1 图标库

使用 `@expo/vector-icons` 中的 `Ionicons`

### 4.2 常用图标映射

```typescript
const icons = {
  // 导航
  home: 'home-outline',
  homeFilled: 'home',
  calendar: 'calendar-outline',
  calendarFilled: 'calendar',
  chat: 'chatbubble-outline',
  chatFilled: 'chatbubble',
  person: 'person-outline',
  personFilled: 'person',
  
  // 操作
  add: 'add',
  close: 'close',
  back: 'chevron-back',
  forward: 'chevron-forward',
  more: 'ellipsis-horizontal',
  
  // 状态
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  alert: 'alert-circle',
  info: 'information-circle',
  
  // 会议
  people: 'people-outline',
  location: 'location-outline',
  time: 'time-outline',
  video: 'videocam-outline',
  
  // A2UI
  agenda: 'list-outline',
  poll: 'bar-chart-outline',
  note: 'document-text-outline',
  task: 'checkbox-outline',
};
```

### 4.3 图标尺寸

| 场景 | Size | 说明 |
|-----|------|------|
| Tab Bar | 24px | 底部导航图标 |
| Header | 24px | 返回/更多按钮 |
| List Item | 20px | 列表项图标 |
| Meta Info | 14-16px | 元信息图标 |
| Button | 20px | 按钮内图标 |

## 5. 表单规范

### 5.1 输入框

```typescript
// 标准输入框
{
  backgroundColor: colors.gray100,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  color: colors.textPrimary,
}

// 多行输入框
{
  ...textInput,
  minHeight: 100,
  textAlignVertical: 'top',
}
```

### 5.2 标签

```typescript
{
  fontSize: 12,
  fontWeight: '500',
  color: colors.textSecondary,
  marginBottom: 4,
}
```

### 5.3 错误信息

```typescript
{
  fontSize: 12,
  color: colors.error,
  marginTop: 4,
}
```

### 5.4 表单间距

```typescript
// 表单项间距
{
  marginBottom: 16,
}

// 表单组间距
{
  marginBottom: 24,
}
```

## 6. 导航规范

### 6.1 Tab Bar

```typescript
{
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  height: 56 + insets.bottom,
}

// Tab 项
{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}

// 图标
{
  size: 24,
  color: isActive ? colors.primary : colors.textSecondary,
}

// 标签
{
  fontSize: 11,
  color: isActive ? colors.primary : colors.textSecondary,
  marginTop: 4,
}
```

### 6.2 Header

```typescript
{
  height: 56,
  paddingHorizontal: 16,
  paddingTop: insets.top,
  backgroundColor: colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  flexDirection: 'row',
  alignItems: 'center',
}

// 标题
{
  fontSize: 18,
  fontWeight: '600',
  color: colors.textPrimary,
}
```

### 6.3 返回按钮

```typescript
{
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
}

// 图标
{
  name: 'chevron-back',
  size: 24,
  color: colors.textPrimary,
}
```

## 7. 状态管理规范

### 7.1 会议状态

```typescript
type MeetingStatus = 'live' | 'upcoming' | 'ended';

const statusLabels = {
  live: '进行中',
  upcoming: '即将开始',
  ended: '已结束',
};
```

### 7.2 加载状态

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

### 7.3 表单状态

```typescript
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

## 8. 无障碍规范

### 8.1 可访问性标签

```typescript
// 按钮
<TouchableOpacity
  accessible={true}
  accessibilityLabel="创建会议"
  accessibilityRole="button"
  accessibilityState={{ disabled: false }}
>

// 输入框
<TextInput
  accessible={true}
  accessibilityLabel="会议标题"
  accessibilityHint="请输入会议标题"
  accessibilityRole="textbox"
>

// 图标按钮
<TouchableOpacity
  accessible={true}
  accessibilityLabel="返回"
  accessibilityRole="button"
>
```

### 8.2 对比度要求

- 文本与背景对比度至少 4.5:1
- 大文本 (18px+ bold 或 24px+) 至少 3:1
- 交互元素与周围颜色至少 3:1

### 8.3 触摸目标

- 最小触摸目标 44x44px
- 推荐触摸目标 48x48px

## 9. 代码实现参考

### 9.1 文件结构

```
client/
├── app/                          # 路由配置
│   ├── _layout.tsx               # 根布局
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab 布局
│   │   ├── index.tsx             # 会议列表
│   │   ├── assistant.tsx         # AI 助手
│   │   └── profile.tsx           # 个人中心
│   └── meeting-detail.tsx        # 会议详情
├── screens/                      # 页面实现
│   ├── meetings/index.tsx
│   ├── meeting-detail/index.tsx
│   ├── assistant/index.tsx
│   └── profile/index.tsx
├── components/                   # 组件
│   ├── a2ui/
│   │   ├── A2UIRenderer.tsx
│   │   ├── AgendaRenderer.tsx
│   │   ├── PollRenderer.tsx
│   │   ├── NoteRenderer.tsx
│   │   └── TaskListRenderer.tsx
│   ├── Screen.tsx
│   ├── Skeleton.tsx
│   └── Toast.tsx
├── hooks/
│   ├── useA2UIStream.ts
│   └── useResponsive.ts
└── utils/
    └── a2ui-types.ts
```

### 9.2 关键依赖

```json
{
  "expo": "~54.0.0",
  "expo-router": "~4.0.0",
  "react-native": "0.76.0",
  "@expo/vector-icons": "^14.0.0",
  "react-native-sse": "^1.0.0",
  "@react-navigation/native": "^7.0.0"
}
```

### 9.3 主题配置

```typescript
// client/components/ColorSchemeUpdater.tsx
const DEFAULT_THEME = 'system'; // 'light' | 'dark' | 'system'
```

---

**文档版本**: 1.0.0  
**最后更新**: 2024-01-15  
**维护者**: MeetFlow Team
