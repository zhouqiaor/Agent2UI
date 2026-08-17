# A2UI 交互组件实现模板

> 本文档提供可直接复用的 React Native / Expo 组件实现模板，配合 `UX-DESIGN-SYSTEM.md` 使用。

---

## 目录

1. [Onboarding 引导页](#1-onboarding-引导页)
2. [EmptyState 空状态](#2-emptystate-空状态)
3. [Skeleton 骨架屏](#3-skeleton-骨架屏)
4. [Toast 提示](#4-toast-提示)
5. [响应式 Hook](#5-响应式-hook)
6. [侧边导航](#6-侧边导航)
7. [A2UI 渲染引擎](#7-a2ui-渲染引擎)
8. [投票组件](#8-投票组件)
9. [议程组件](#9-议程组件)

---

## 1. Onboarding 引导页

### 使用方式

```tsx
import { Onboarding } from '@/components/Onboarding';

const STEPS = [
  {
    icon: 'sparkles',
    title: 'AI 驱动界面',
    description: 'AI 根据你的需求自动生成投票、议程、笔记等交互组件',
  },
  {
    icon: 'users',
    title: '实时协作',
    description: '多人同时参与投票、问答，结果实时同步',
  },
  {
    icon: 'file-text',
    title: '智能纪要',
    description: 'AI 自动整理会议要点，生成结构化纪要',
  },
];

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <Onboarding
        steps={STEPS}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  return <MainApp />;
}
```

### 实现要点

- 使用 `Animated.View` + `PanResponder` 实现滑动切换
- 底部圆点指示器，当前页高亮
- 支持"跳过"和"下一步"按钮
- 最后一页按钮文案变为"开始体验"
- 使用 `AsyncStorage` 记录已完成状态

---

## 2. EmptyState 空状态

### 使用方式

```tsx
import { EmptyState } from '@/components/EmptyState';

function MeetingList({ meetings }) {
  if (meetings.length === 0) {
    return (
      <EmptyState
        icon="calendar"
        title="暂无会议安排"
        description="AI 助手可以帮你快速创建会议并自动生成议程和互动组件"
        primaryAction={{
          label: '✨ 让 AI 帮我创建会议',
          onPress: handleAICreate,
        }}
        secondaryAction={{
          label: '📝 手动创建会议',
          onPress: handleManualCreate,
        }}
      />
    );
  }

  return <MeetingListContent />;
}
```

### 实现要点

- 居中布局，图标 + 标题 + 描述 + 按钮
- 图标使用主色 10% 透明度背景容器
- 主按钮使用主色填充，次按钮使用描边
- 支持自定义插图（可选）

---

## 3. Skeleton 骨架屏

### 使用方式

```tsx
import { Skeleton, SkeletonCard } from '@/components/Skeleton';

function MeetingList({ loading, meetings }) {
  if (loading) {
    return (
      <View>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return <MeetingListContent />;
}

// 自定义骨架
function CustomSkeleton() {
  return (
    <View>
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="100%" height={80} style={{ marginTop: 16 }} />
    </View>
  );
}
```

### 实现要点

- 使用 `Animated.Value` 实现从左到右的渐变扫光效果
- 动画周期 1.5s，无限循环
- 支持自定义宽度、高度、圆角
- `SkeletonCard` 预设卡片骨架布局

---

## 4. Toast 提示

### 使用方式

```tsx
import { Toast, useToast } from '@/components/Toast';

function App() {
  return (
    <ToastProvider>
      <MainApp />
      <Toast />
    </ToastProvider>
  );
}

function SomeComponent() {
  const { showToast } = useToast();

  const handleVote = () => {
    // ... 投票逻辑
    showToast({
      type: 'success',
      message: '投票成功！已有 20 人参与',
      duration: 3000,
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      message: '网络异常，请重试',
      action: { label: '重试', onPress: retry },
    });
  };
}
```

### Toast 类型

| 类型 | 图标 | 颜色 | 用途 |
|------|------|------|------|
| success | check-circle | 绿色 | 操作成功 |
| error | x-circle | 红色 | 操作失败 |
| warning | alert-circle | 橙色 | 警告提示 |
| info | info | 蓝色 | 信息提示 |

### 实现要点

- 从顶部滑入，3s 后自动消失
- 支持手动关闭（点击或滑动）
- 支持操作按钮（如"重试"）
- 使用 Context 管理 Toast 队列

---

## 5. 响应式 Hook

### 使用方式

```tsx
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    shouldUseSidebar,
    shouldUseTwoColumns,
    breakpoint,
  } = useResponsive();

  return (
    <View style={{ flexDirection: shouldUseTwoColumns ? 'row' : 'column' }}>
      <LeftPanel />
      {shouldUseTwoColumns && <RightPanel />}
    </View>
  );
}
```

### 返回值说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `isMobile` | boolean | 宽度 < 640px |
| `isTablet` | boolean | 640px <= 宽度 < 1024px |
| `isDesktop` | boolean | 宽度 >= 1024px |
| `isLandscape` | boolean | 宽度 > 高度 |
| `shouldUseSidebar` | boolean | 平板横屏或桌面 |
| `shouldUseTwoColumns` | boolean | 宽度 >= 1024px 且横屏 |
| `breakpoint` | string | 'small' / 'medium' / 'large' / 'extra-large' |

### 实现要点

- 使用 `Dimensions.useWindowDimensions()` 监听窗口变化
- 自动计算设备类型、方向、断点
- 支持自定义断点阈值

---

## 6. 侧边导航

### 使用方式

```tsx
import { SidebarNav } from '@/components/SidebarNav';

function TabLayout() {
  const { shouldUseSidebar } = useResponsive();

  if (shouldUseSidebar) {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <SidebarNav />
        <View style={{ flex: 1 }}>
          <Stack />
        </View>
      </View>
    );
  }

  return (
    <Tabs>
      {/* 底部 Tab Bar */}
    </Tabs>
  );
}
```

### 实现要点

- 宽度 80px（紧凑模式，只显示图标）
- 选中项使用主色背景 + 白色图标
- 未选中项使用透明背景 + 灰色图标
- 支持角标数字显示
- 底部显示用户头像/设置入口

---

## 7. A2UI 渲染引擎

### 使用方式

```tsx
import { A2UIRenderer } from '@/components/a2ui/A2UIRenderer';

function MeetingDetail() {
  const { components, isStreaming } = useA2UIStream(meetingId);

  return (
    <FlatList
      data={components}
      renderItem={({ item }) => (
        <A2UIRenderer
          component={item}
          onAction={handleComponentAction}
        />
      )}
      keyExtractor={(item) => item.id}
      ListFooterComponent={
        isStreaming ? <StreamingIndicator /> : null
      }
    />
  );
}
```

### 组件类型映射

```typescript
const COMPONENT_MAP = {
  text: TextRenderer,
  heading: HeadingRenderer,
  divider: DividerRenderer,
  poll: PollRenderer,
  qa: QARenderer,
  agenda: AgendaRenderer,
  note: NoteRenderer,
  task_list: TaskListRenderer,
  action_button: ActionButtonRenderer,
};
```

### 实现要点

- 根据 `component.type` 动态选择渲染器
- 每个组件带入场动画（淡入 + 上移）
- 支持 `onAction` 回调处理用户交互
- 流式加载时显示"AI 正在生成..."指示器

---

## 8. 投票组件

### 使用方式

```tsx
import { PollRenderer } from '@/components/a2ui/PollRenderer';

<PollRenderer
  question="选择你倾向的技术方案"
  options={[
    { id: '1', label: 'React Native', votes: 11 },
    { id: '2', label: 'Flutter', votes: 8 },
    { id: '3', label: '原生开发', votes: 5 },
  ]}
  selectedId={selectedOption}
  onSelect={handleVote}
  metadata={{
    source: '主持人发起',
    timestamp: '2分钟前',
    participantCount: 24,
    expiresAt: '2024-01-15T10:30:00Z',
  }}
/>
```

### 状态管理

```typescript
type PollState = 'idle' | 'voted' | 'expired' | 'loading';

// idle: 未投票，显示选项
// voted: 已投票，显示选择 + 结果
// expired: 已过期，只显示结果
// loading: 提交中，禁用交互
```

### 实现要点

- 选项点击后即时高亮 + 弹性缩放动画
- 投票后显示进度条动画（从 0 到实际百分比）
- 显示参与人数和剩余时间
- 横屏时选项变为双列布局
- 支持单选和多选模式

---

## 9. 议程组件

### 使用方式

```tsx
import { AgendaRenderer } from '@/components/a2ui/AgendaRenderer';

<AgendaRenderer
  items={[
    { id: '1', title: '开场介绍', duration: 5, status: 'completed' },
    { id: '2', title: '需求评审', duration: 15, status: 'completed' },
    { id: '3', title: '技术选型', duration: 20, status: 'active' },
    { id: '4', title: '总结', duration: 5, status: 'pending' },
  ]}
  onToggle={handleToggle}
  showProgress={true}
/>
```

### 状态管理

```typescript
type AgendaItemStatus = 'pending' | 'active' | 'completed' | 'skipped';

// pending: 未开始，灰色
// active: 进行中，主色高亮
// completed: 已完成，绿色打勾
// skipped: 已跳过，灰色划线
```

### 实现要点

- 当前议程（active）使用主色背景高亮
- 已完成议程显示绿色打勾 + 划线效果
- 顶部显示进度条（已完成/总数）
- 全部完成时显示庆祝提示
- 横屏时变为双列布局
- 支持拖拽排序（可选）

---

## 附录: 通用样式变量

```typescript
// 颜色
const COLORS = {
  primary: '#4F46E5',      // 主色
  secondary: '#6B7280',    // 辅色
  success: '#10B981',      // 成功
  warning: '#F59E0B',      // 警告
  error: '#EF4444',        // 错误
  info: '#3B82F6',         // 信息

  background: '#F9FAFB',   // 页面背景
  surface: '#FFFFFF',      // 卡片背景
  border: '#E5E7EB',       // 边框
  text: '#111827',         // 主文字
  textSecondary: '#6B7280', // 次文字
};

// 间距
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// 圆角
const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// 阴影
const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
```

---

> 本文档配合 `UX-DESIGN-SYSTEM.md` 使用，提供可直接复用的组件实现模板。
