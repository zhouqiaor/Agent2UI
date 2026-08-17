# A2UI UX 设计体系 - 可复用规范

> 本文档总结了 MeetFlow 项目的 UX 设计体系，包含设计原则、交互模式、组件规范、响应式布局策略和优化方法论，可直接复用于其他 A2UI / AI 驱动型应用。

---

## 目录

1. [设计原则](#1-设计原则)
2. [交互模式库](#2-交互模式库)
3. [A2UI 组件设计规范](#3-a2ui-组件设计规范)
4. [响应式布局体系](#4-响应式布局体系)
5. [用户旅程设计](#5-用户旅程设计)
6. [错误处理与容错设计](#6-错误处理与容错设计)
7. [性能与体验优化](#7-性能与体验优化)
8. [优化路线图模板](#8-优化路线图模板)
9. [度量指标体系](#9-度量指标体系)

---

## 1. 设计原则

### 1.1 核心原则

| 原则 | 说明 | 应用场景 |
|------|------|----------|
| **渐进式披露** | 先展示核心信息，按需展开细节 | 会议列表 → 详情 → 组件交互 |
| **即时反馈** | 每个操作都有明确的视觉/触觉反馈 | 投票、勾选、提交 |
| **上下文感知** | 组件展示时附带来源、时间、关联信息 | A2UI 组件的元数据标签 |
| **容错优先** | 允许撤销、支持离线、优雅降级 | 网络断开、误操作恢复 |
| **一致性** | 相同类型的交互使用相同的模式 | 所有 Modal、所有列表、所有卡片 |

### 1.2 设计决策框架

```
用户需求 → 场景分析 → 交互模式选择 → 组件实现 → 验证迭代

场景分析维度:
├── 使用频率: 高频(每日) / 中频(每周) / 低频(偶尔)
├── 操作复杂度: 简单(1步) / 中等(2-3步) / 复杂(4+步)
├── 容错要求: 高(不可逆) / 中(可撤销) / 低(可重做)
└── 协作需求: 单人 / 少量协作 / 多人实时
```

---

## 2. 交互模式库

### 2.1 首次使用引导 (Onboarding)

**适用场景**: 用户首次打开 App，需要理解核心概念

```
设计要点:
├── 3-5 页滑动引导，不超过 5 页
├── 每页一个核心概念 + 一个视觉焦点
├── 支持跳过（右上角"跳过"按钮）
├── 最后一页引导到核心功能入口
└── 使用 AsyncStorage 记录已完成状态
```

**实现模板**:
```tsx
// 引导页数据结构
interface OnboardingStep {
  icon: string;           // 图标名称
  title: string;          // 标题 (6-12字)
  description: string;    // 描述 (20-40字)
  illustration?: string;  // 插图 URL
}

// 关键交互
// - 左右滑动切换
// - 底部圆点指示器
// - "跳过" + "下一步" 按钮
// - 最后一页变为 "开始体验"
```

### 2.2 空状态设计

**适用场景**: 列表为空、搜索无结果、无数据

```
设计要点:
├── 友好的插图/图标 (非空白)
├── 说明文案: 解释为什么是空的
├── 行动引导: 提供明确的下一步操作
├── 快捷入口: AI 辅助创建 / 模板创建
└── 避免: 纯文字 "暂无数据"
```

**实现模板**:
```tsx
interface EmptyState {
  icon: string;           // 大图标
  title: string;          // "暂无xxx"
  description: string;    // 解释原因 + 引导
  primaryAction?: {       // 主操作按钮
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {     // 次操作按钮
    label: string;
    onPress: () => void;
  };
}
```

### 2.3 加载状态

**适用场景**: 数据加载中、AI 生成中、网络请求中

```
设计要点:
├── 骨架屏: 列表/卡片加载时使用
├── 进度指示: AI 生成时显示进度
├── 流式加载: SSE 数据流式到达时逐块渲染
├── 避免: 全屏 Loading 遮罩
└── 超时处理: 超过 10 秒显示重试按钮
```

**骨架屏模板**:
```tsx
// 列表骨架屏
<View style={styles.skeleton}>
  <SkeletonBox width="60%" height={20} />   {/* 标题 */}
  <SkeletonBox width="40%" height={14} />   {/* 副标题 */}
  <SkeletonBox width="100%" height={80} />  {/* 内容区 */}
</View>

// 动画: 从左到右的渐变扫光效果
// 颜色: 背景色 → 浅一度 → 背景色
// 周期: 1.5s
```

### 2.4 操作反馈

**适用场景**: 用户完成投票、勾选、提交等操作

```
设计要点:
├── 即时视觉反馈: 选中状态变化 (< 100ms)
├── 动画反馈: 弹性缩放、颜色渐变
├── Toast 提示: 操作成功/失败的全局提示
├── 数据更新: 实时更新统计数据
└── 避免: 操作后无任何变化
```

**反馈层级**:
```
Level 1 - 微交互 (组件内)
├── 选中态颜色变化
├── 弹性缩放动画
└── 进度条更新

Level 2 - 局部反馈 (卡片内)
├── 成功/失败状态图标
├── 统计数据更新
└── 倒计时/进度变化

Level 3 - 全局反馈 (Toast/Modal)
├── 操作成功 Toast (3s 自动消失)
├── 操作失败 Toast + 重试按钮
└── 重要操作确认 Modal
```

### 2.5 Modal 表单

**适用场景**: 创建/编辑记录、配置设置

```
设计要点:
├── 标题: 明确操作类型 (新增/编辑)
├── 表单: ScrollView 包裹，支持键盘避让
├── 按钮: 主操作(右) + 取消(左)
├── 校验: 实时校验 + 提交时校验
└── 关闭: 点击遮罩/取消按钮/ESC
```

**标准结构**:
```tsx
<Modal visible={visible} transparent animationType="slide">
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text>✕</Text></TouchableOpacity>
        </View>

        {/* Body (Scrollable) */}
        <ScrollView style={styles.modalBody}>
          {/* 表单字段 */}
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={onClose}><Text>取消</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleSave}><Text>保存</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  </KeyboardAvoidingView>
</Modal>
```

---

## 3. A2UI 组件设计规范

### 3.1 组件类型体系

```
A2UI 组件
├── 基础组件
│   ├── text        - 文本段落
│   ├── heading     - 标题 (h1-h3)
│   └── divider     - 分割线
│
├── 交互组件
│   ├── poll        - 投票 (单选/多选)
│   ├── qa          - 问答 (提问/回答)
│   ├── action_button - 操作按钮
│   └── form        - 表单 (输入/选择)
│
├── 信息组件
│   ├── agenda      - 议程列表 (可勾选)
│   ├── note        - 笔记卡片
│   ├── task_list   - 任务列表
│   └── chart       - 图表 (柱状/饼图/折线)
│
└── 媒体组件
    ├── image       - 图片
    ├── video       - 视频
    └── audio       - 音频
```

### 3.2 组件数据结构

```typescript
// 基础组件接口
interface A2UIComponent {
  id: string;                    // 唯一标识
  type: A2UIComponentType;       // 组件类型
  props: Record<string, any>;    // 组件属性
  metadata?: ComponentMetadata;  // 元数据 (可选)
}

// 元数据 (上下文信息)
interface ComponentMetadata {
  source?: string;               // 来源 (如 "主持人发起")
  timestamp?: string;            // 创建时间
  relatedAgenda?: string;        // 关联议程
  participantCount?: number;     // 参与人数
  expiresAt?: string;            // 过期时间
}
```

### 3.3 组件渲染规范

| 组件类型 | 竖屏布局 | 横屏布局 | 最大宽度 |
|----------|----------|----------|----------|
| text | 全宽 | 全宽 | 无限制 |
| heading | 全宽 | 全宽 | 无限制 |
| poll | 单列选项 | 双列选项 | 600px |
| agenda | 单列 | 双列 | 800px |
| qa | 单列 | 单列 | 600px |
| note | 全宽 | 全宽 | 无限制 |
| task_list | 单列 | 看板视图 | 800px |
| chart | 全宽 | 全宽 | 无限制 |

### 3.4 组件交互规范

**投票组件**:
```
交互流程:
1. 展示选项列表
2. 用户点击选项 → 即时高亮 + 弹性动画
3. 显示投票结果 → 进度条动画
4. 显示统计信息 → 参与人数、剩余时间
5. 投票结束 → 显示最终结果 + 庆祝动画

状态管理:
├── idle: 未投票
├── voted: 已投票 (显示选择 + 结果)
├── expired: 已过期 (只显示结果)
└── loading: 提交中
```

**议程组件**:
```
交互流程:
1. 展示议程列表
2. 当前议程高亮显示
3. 用户可勾选已完成的议程
4. 顶部显示进度条
5. 全部完成时显示庆祝提示

状态管理:
├── pending: 未开始
├── active: 进行中 (高亮)
├── completed: 已完成 (打勾)
└── skipped: 已跳过
```

---

## 4. 响应式布局体系

### 4.1 断点定义

```typescript
const BREAKPOINTS = {
  small: 0,        // 手机竖屏
  medium: 640,     // 手机横屏 / 小平板
  large: 1024,     // 平板横屏
  extraLarge: 1440 // 桌面
};

// 设备类型判断
const getDeviceType = (width: number) => {
  if (width >= 1440) return 'desktop';
  if (width >= 1024) return 'tablet';
  return 'mobile';
};

// 是否使用侧边导航
const shouldUseSidebar = (width: number, isLandscape: boolean) => {
  return width >= 1024 && isLandscape;
};
```

### 4.2 布局策略

```
┌─────────────────────────────────────────────────────────────────┐
│                        布局决策树                                │
│                                                                 │
│  屏幕宽度 >= 1024px 且横屏?                                     │
│  ├── 是 → 侧边导航 + 双栏内容                                   │
│  │       ├── 侧边栏宽度: 80px (图标) / 240px (图标+文字)        │
│  │       └── 内容区: 自适应宽度                                  │
│  │                                                              │
│  └── 否 → 底部 Tab Bar + 单栏内容                               │
│          ├── Tab Bar 高度: 60px + 安全区                         │
│          └── 内容区: 全宽                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 侧边导航规范

```typescript
// 侧边导航组件
interface SidebarNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

// 导航项
interface NavItem {
  id: string;           // 路由标识
  icon: string;         // 图标名称
  label: string;        // 文字标签
  badge?: number;       // 角标数字
}

// 样式规范
// - 宽度: 80px (紧凑) / 240px (展开)
// - 图标大小: 24px
// - 选中态: 主色背景 + 白色图标
// - 未选中态: 透明背景 + 灰色图标
// - 悬停态: 浅灰背景
```

### 4.4 双栏布局规范

```typescript
// 双栏布局比例
const TWO_COLUMN_LAYOUT = {
  // 会议详情: 左 60% + 右 40%
  meetingDetail: { left: 0.6, right: 0.4 },

  // AI 助手: 左 50% + 右 50%
  assistant: { left: 0.5, right: 0.5 },

  // 列表页: 左 30% + 右 70%
  listDetail: { left: 0.3, right: 0.7 },
};

// 最小宽度限制
const MIN_COLUMN_WIDTH = 320; // px
```

---

## 5. 用户旅程设计

### 5.1 旅程地图模板

```
用户角色: [角色名称]
目标: [用户想要达成什么]

阶段        │ 触点              │ 情绪    │ 痛点              │ 机会
────────────┼──────────────────┼────────┼──────────────────┼──────────
发现        │ 应用商店/推荐     │ 😐 中性 │ 不知道能做什么    │ 引导页
────────────┼──────────────────┼────────┼──────────────────┼──────────
入门        │ 首次打开/注册     │ 🙂 期待 │ 流程复杂          │ 简化流程
────────────┼──────────────────┼────────┼──────────────────┼──────────
核心使用    │ 主要功能操作      │ 😊 满意 │ 找不到入口        │ 快捷操作
────────────┼──────────────────┼────────┼──────────────────┼──────────
高级使用    │ 高级功能/定制     │ 🤔 思考 │ 学习成本高        │ 渐进披露
────────────┼──────────────────┼────────┼──────────────────┼──────────
留存        │ 日常使用/习惯     │ 😌 习惯 │ 缺乏新鲜感        │ 个性化
```

### 5.2 关键旅程优化

**创建内容旅程**:
```
优化前: 首页 → 切换Tab → 输入需求 → 等待 → 返回 → 找到 → 进入
优化后: 首页 → 点击创建 → 表单填写 → AI预览 → 确认 → 直接进入

优化点:
├── 减少页面跳转 (6步 → 4步)
├── 提供即时预览 (AI 生成结果可编辑)
├── 创建成功自动跳转 (无需手动返回)
└── 支持模板快速创建 (减少输入)
```

**参与互动旅程**:
```
优化前: 收到通知 → 打开App → 找会议 → 进入 → 空白 → 不知道做什么
优化后: 收到通知 → 打开App → 自动跳转 → 看到状态 → 引导参与 → 反馈

优化点:
├── 深度链接直达会议详情
├── 显示当前状态 (进行中/等待中)
├── 引导下一步操作 (参与投票/提问)
└── 即时反馈 (投票成功/问题已提交)
```

---

## 6. 错误处理与容错设计

### 6.1 错误分类与处理策略

```
┌─────────────────────────────────────────────────────────────────┐
│                        错误处理矩阵                              │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ 错误类型      │ 用户感知      │ 处理策略      │ UI 表现            │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ 网络断开      │ 操作失败      │ 本地暂存      │ 顶部提示 + 重试    │
│ 请求超时      │ 等待过久      │ 自动重试      │ Loading + 取消     │
│ 服务器错误    │ 操作失败      │ 提示重试      │ Toast + 重试按钮   │
│ 数据校验失败  │ 输入错误      │ 即时提示      │ 字段高亮 + 提示    │
│ 权限不足      │ 无法操作      │ 引导授权      │ Modal 说明         │
│ 并发冲突      │ 数据不一致    │ 合并/覆盖     │ 冲突解决 Modal     │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

### 6.2 离线模式设计

```typescript
// 离线暂存策略
interface OfflineStrategy {
  // 哪些操作支持离线
  supportedActions: ('vote' | 'note' | 'qa')[];

  // 暂存位置
  storage: 'AsyncStorage' | 'SQLite';

  // 同步策略
  syncStrategy: 'auto' | 'manual';  // 自动同步 / 手动同步

  // 冲突处理
  conflictResolution: 'server-wins' | 'client-wins' | 'merge';
}

// 离线状态 UI
interface OfflineUI {
  // 顶部提示条
  banner: {
    message: string;        // "网络连接已断开"
    action?: string;        // "重试"
  };

  // 暂存指示器
  indicator: {
    count: number;          // 暂存操作数量
    label: string;          // "3 条待同步"
  };
}
```

### 6.3 重试机制

```typescript
// 重试策略
interface RetryStrategy {
  maxRetries: number;       // 最大重试次数 (默认 3)
  initialDelay: number;     // 初始延迟 (ms)
  maxDelay: number;         // 最大延迟 (ms)
  backoffFactor: number;    // 退避因子 (默认 2)

  // 重试条件
  retryOn: number[];        // 可重试的 HTTP 状态码 [500, 502, 503, 504]
}

// 指数退避算法
const calculateDelay = (attempt: number, strategy: RetryStrategy) => {
  const delay = strategy.initialDelay * Math.pow(strategy.backoffFactor, attempt);
  return Math.min(delay, strategy.maxDelay);
};
```

---

## 7. 性能与体验优化

### 7.1 列表性能

```typescript
// FlatList 优化配置
const FLATLIST_CONFIG = {
  // 性能优化
  removeClippedSubviews: true,     // 移除屏幕外的子视图
  maxToRenderPerBatch: 10,         // 每批渲染数量
  windowSize: 5,                   // 渲染窗口大小
  initialNumToRender: 10,          // 初始渲染数量

  // 用户体验
  getItemLayout: (data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }),

  // 刷新
  refreshing: boolean,
  onRefresh: () => void,
};
```

### 7.2 图片优化

```typescript
// 图片加载策略
const IMAGE_STRATEGY = {
  // 缩略图
  thumbnail: {
    width: 200,
    quality: 0.6,
    format: 'webp',
  },

  // 原图
  original: {
    width: 1200,
    quality: 0.8,
    format: 'webp',
  },

  // 懒加载
  lazy: true,

  // 占位图
  placeholder: 'blurhash',  // 使用 blurhash 作为占位
};
```

### 7.3 动画性能

```typescript
// 动画优化原则
const ANIMATION_GUIDELINES = {
  // 使用原生驱动
  useNativeDriver: true,

  // 避免布局动画
  preferTransform: true,  // 使用 transform 而非 layout 属性

  // 动画时长
  durations: {
    micro: 100,    // 微交互 (按钮点击)
    short: 200,    // 短动画 (状态切换)
    medium: 300,   // 中等动画 (页面切换)
    long: 500,     // 长动画 (复杂过渡)
  },

  // 缓动函数
  easings: {
    standard: 'ease-in-out',  // 标准动画
    enter: 'ease-out',        // 进入动画
    exit: 'ease-in',          // 退出动画
  },
};
```

---

## 8. 优化路线图模板

### 8.1 优先级矩阵

```
                    高影响
                      │
         ┌────────────┼────────────┐
         │            │            │
         │  P0 紧急   │  P1 重要   │
         │  (立即做)   │  (计划做)   │
         │            │            │
低努力 ──┼────────────┼────────────┼── 高努力
         │            │            │
         │  P2 增强   │  P3 远期   │
         │  (有空做)   │  (评估做)   │
         │            │            │
         └────────────┼────────────┘
                      │
                    低影响
```

### 8.2 迭代周期模板

```
Week 1-2: P0 基础体验
├── 核心流程优化
├── 关键交互反馈
├── 错误处理完善
└── 性能基线建立

Week 3-4: P1 交互增强
├── 快捷操作入口
├── 上下文信息补充
├── 实时状态更新
└── 离线模式基础

Week 5-6: P2 体验打磨
├── 手势操作
├── 主题定制
├── 动画优化
└── 无障碍支持

Week 7-8: P3 高级功能
├── 语音交互
├── 多语言支持
├── 数据导出
└── 高级分析
```

### 8.3 优化决策清单

```
每个优化项需要回答:
□ 解决什么用户痛点?
□ 影响多少用户? (使用频率 × 用户比例)
□ 实现成本多高? (人天估算)
□ 如何衡量效果? (具体指标)
□ 有无技术风险? (依赖/兼容性)
□ 是否可分阶段? (MVP → 完整版)
```

---

## 9. 度量指标体系

### 9.1 核心指标

| 指标类别 | 指标名称 | 计算方式 | 目标值 |
|----------|----------|----------|--------|
| **转化** | 创建转化率 | 成功创建 / 点击创建 | > 70% |
| **转化** | 参与转化率 | 参与互动 / 进入会议 | > 60% |
| **效率** | 任务完成时间 | 从开始到完成的平均时间 | < 30s |
| **效率** | 操作步骤数 | 完成核心任务的步骤 | < 4 步 |
| **满意度** | NPS 分数 | 推荐者% - 贬损者% | > 40 |
| **满意度** | 任务完成率 | 成功完成 / 尝试完成 | > 80% |
| **留存** | 次日留存率 | 次日回访 / 首次使用 | > 40% |
| **留存** | 7日留存率 | 7日内回访 / 首次使用 | > 25% |

### 9.2 体验指标

| 指标 | 说明 | 目标值 |
|------|------|--------|
| **首次内容渲染 (FCP)** | 页面首次渲染时间 | < 1.5s |
| **可交互时间 (TTI)** | 页面可交互时间 | < 3s |
| **操作响应时间** | 用户操作到视觉反馈 | < 100ms |
| **错误恢复率** | 遇到错误后成功恢复 | > 70% |
| **崩溃率** | 崩溃次数 / 会话数 | < 0.1% |

### 9.3 度量方法

```typescript
// 埋点规范
interface AnalyticsEvent {
  event: string;           // 事件名称 (snake_case)
  properties: {
    // 通用属性
    screen: string;        // 当前页面
    timestamp: number;     // 时间戳

    // 业务属性
    [key: string]: any;
  };
}

// 关键事件
const EVENTS = {
  // 页面
  SCREEN_VIEW: 'screen_view',

  // 操作
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',

  // 结果
  TASK_COMPLETE: 'task_complete',
  TASK_FAIL: 'task_fail',

  // 性能
  LOAD_COMPLETE: 'load_complete',
  ERROR_OCCURRED: 'error_occurred',
};
```

---

## 附录: 快速参考卡片

### A. 颜色使用规范

```
主色 (Primary):     品牌色，用于主要操作和强调
辅色 (Secondary):   次要操作和辅助信息
成功 (Success):     成功状态、正向反馈
警告 (Warning):     警告状态、需要注意
错误 (Error):       错误状态、危险操作
信息 (Info):        提示信息、中性状态

背景层级:
├── Level 0: 页面背景 (最浅)
├── Level 1: 卡片背景
├── Level 2: 输入框背景
└── Level 3: 悬停/选中背景 (最深)
```

### B. 间距规范

```
基础单位: 4px

间距层级:
├── xs: 4px   - 紧凑元素间距
├── sm: 8px   - 相关元素间距
├── md: 16px  - 组件内间距
├── lg: 24px  - 组件间间距
├── xl: 32px  - 区块间间距
└── 2xl: 48px - 页面级间距
```

### C. 字体规范

```
字号层级:
├── xs: 12px  - 辅助文字、标签
├── sm: 14px  - 正文、描述
├── md: 16px  - 小标题
├── lg: 20px  - 标题
├── xl: 24px  - 大标题
├── 2xl: 32px - 页面标题
└── 3xl: 40px - 数据展示

字重:
├── regular: 400 - 正文
├── medium: 500  - 强调
├── semibold: 600 - 小标题
└── bold: 700    - 标题
```

### D. 圆角规范

```
圆角层级:
├── none: 0px   - 分割线
├── sm: 8px     - 按钮、输入框
├── md: 12px    - 小卡片
├── lg: 16px    - 卡片
├── xl: 24px    - 大卡片、Modal
└── full: 9999px - 圆形头像、胶囊按钮
```

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2024-01 | 初始版本，基于 MeetFlow 项目总结 |

---

> 本文档由 MeetFlow 项目团队编写，旨在为 A2UI / AI 驱动型应用提供可复用的 UX 设计规范。
> 如有问题或建议，欢迎反馈。
