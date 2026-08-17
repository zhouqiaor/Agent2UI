# MeetFlow UI 规范 - 第3部分：组件规范

## 1. Agenda Component (议程组件)

### 结构
```typescript
<View style={container}>
  <View style={header}>
    <Text>📋 会议议程</Text>
    <Text>{completedCount}/{totalCount} 已完成</Text>
  </View>
  
  <View style={progressBar}>
    <Animated.View style={progressFill} />
  </View>
  
  {items.map(item => <AgendaItem />)}
</View>
```

### 样式
```typescript
// 容器
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

// 进度条
{
  height: 4,
  backgroundColor: colors.gray200,
  borderRadius: 2,
  marginBottom: 16,
  overflow: 'hidden',
}

// 议程项
{
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  backgroundColor: item.completed ? colors.primaryLight10 : colors.gray50,
  marginBottom: 8,
}

// 复选框
{
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: item.completed ? colors.primary : colors.gray300,
  backgroundColor: item.completed ? colors.primary : 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
}
```

### 动画
```typescript
// 进度条动画
Animated.timing(progressAnim, {
  toValue: (completedCount / totalCount) * 100,
  duration: 500,
  useNativeDriver: false,
})

// 复选框动画
Animated.sequence([
  Animated.timing(checkScale, { toValue: 0.9, duration: 100 }),
  Animated.spring(checkScale, { toValue: 1, friction: 3 }),
])
```

## 2. Poll Component (投票组件)

### 结构
```typescript
<View style={container}>
  <Text style={title}>🗳️ {poll.title}</Text>
  
  {poll.options.map(option => <PollOption />)}
  
  {!hasVoted && <Button>提交投票</Button>}
  
  {hasVoted && <Text>已有 {poll.totalVotes} 人参与投票</Text>}
</View>
```

### 样式
```typescript
// 选项
{
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: isSelected ? colors.primary : colors.gray200,
  backgroundColor: isSelected ? colors.primaryLight10 : 'transparent',
  marginBottom: 8,
  overflow: 'hidden',
}

// 单选框
{
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: isSelected ? colors.primary : colors.gray300,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
}

// 选中点
{
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.primary,
}
```

### 投票结果动画
```typescript
Animated.timing(progressAnim, {
  toValue: (option.votes / poll.totalVotes) * 100,
  duration: 800,
  delay: 200,
  useNativeDriver: false,
})
```

## 3. Note Component (笔记组件)

### 样式
```typescript
{
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.primary,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
}

// 标签
{
  backgroundColor: colors.primaryLight10,
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginRight: 8,
  marginBottom: 8,
}
```

## 4. Task List Component (任务列表)

### 样式
```typescript
// 任务项
{
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  backgroundColor: colors.gray50,
  marginBottom: 8,
}

// 优先级标签
{
  high: { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low: { bg: '#DCFCE7', text: '#166534' },
}
```

## 5. Button Component (按钮)

### Primary Button
```typescript
{
  backgroundColor: disabled ? colors.gray200 : colors.primary,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 24,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: disabled ? 0.5 : 1,
}

// 文本
{
  fontSize: 14,
  fontWeight: '500',
  color: '#FFFFFF',
}
```

### Secondary Button
```typescript
{
  backgroundColor: 'transparent',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 22,
  borderWidth: 2,
  borderColor: colors.primary,
}

// 文本
{
  fontSize: 14,
  fontWeight: '500',
  color: colors.primary,
}
```

## 6. Input Component (输入框)

### 样式
```typescript
// 容器
{
  backgroundColor: colors.gray100,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: error ? colors.error : (focused ? colors.primary : 'transparent'),
  flexDirection: 'row',
  alignItems: 'center',
}

// 输入框
{
  flex: 1,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  color: colors.textPrimary,
}
```

## 7. Toast Component (提示)

### 样式
```typescript
{
  position: 'absolute',
  bottom: 100,
  left: 16,
  right: 16,
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
}

// 类型颜色
{
  success: { bg: '#DCFCE7', icon: '#166534' },
  error: { bg: '#FEE2E2', icon: '#991B1B' },
  warning: { bg: '#FEF3C7', icon: '#92400E' },
  info: { bg: '#DBEAFE', icon: '#1E40AF' },
}
```

### 动画
```typescript
// 显示
Animated.parallel([
  Animated.spring(slideAnim, { toValue: 0, friction: 8 }),
  Animated.timing(fadeAnim, { toValue: 1, duration: 200 }),
])

// 隐藏
Animated.parallel([
  Animated.timing(slideAnim, { toValue: 100, duration: 200 }),
  Animated.timing(fadeAnim, { toValue: 0, duration: 200 }),
])
```

## 8. Skeleton Component (骨架屏)

### 样式
```typescript
{
  backgroundColor: colors.gray200,
  borderRadius: borderRadius,
  overflow: 'hidden',
  width: width,
  height: height,
}

// 闪光效果
Animated.loop(
  Animated.timing(shimmerAnim, {
    toValue: 200,
    duration: 1500,
    useNativeDriver: true,
  })
)
```
