# A2IdeaUI 界面分析报告

## 📱 界面概览

### 1. client.html - 客户端（手机/平板）
**定位**：移动端用户界面，用于对话生成 A2UI 结果并投屏到大屏

**核心特性**：
- 支持手机/平板两种设备模式
- 支持竖屏/横屏两种布局
- 可投屏卡片到服务端大屏

---

### 2. index.html - 鸿蒙工作台（大屏端）
**定位**：大屏工作台界面，三栏结构展示场景、结果和对话

**核心特性**：
- 左栏：场景选择 + 日程列表
- 中栏：A2UI 结果展示
- 右栏：用户对话
- 支持左右栏折叠
- 接收客户端投屏

---

## 🎨 设计系统

### 色彩令牌（Design Tokens）

#### 深色模式
```css
--brand: #3D9BFF           /* 品牌蓝 */
--brand-pressed: #2B82E6   /* 按下态 */
--brand-surface: #123A5C   /* 品牌背景 */
--success: #4CAF50         /* 成功绿 */
--warning: #FFB84D         /* 警告橙 */
--danger: #FF6B61          /* 危险红 */
--text-1: #E6E6E6          /* 主文字 */
--text-2: #B0B3B8          /* 次文字 */
--text-3: #8A8D93          /* 弱文字 */
--surface: #1F1F22         /* 卡片背景 */
--surface-muted: #2A2A2E   /* 次要背景 */
--bg: #141416              /* 页面背景 */
--divider: #3A3A40         /* 分割线 */
```

#### 浅色模式
```css
--brand: #007DFF           /* 品牌蓝 */
--brand-pressed: #0069D6   /* 按下态 */
--brand-surface: #E8F3FF   /* 品牌背景 */
--success: #2E7D32         /* 成功绿 */
--warning: #F5A623         /* 警告橙 */
--danger: #FF3B30          /* 危险红 */
--text-1: #181818          /* 主文字 */
--text-2: #666666          /* 次文字 */
--text-3: #999999          /* 弱文字 */
--surface: #FFFFFF         /* 卡片背景 */
--surface-muted: #F5F6F7   /* 次要背景 */
--bg: #F2F3F5              /* 页面背景 */
--divider: #E8EAED         /* 分割线 */
```

### 圆角系统
```css
--r-sm: 8px    /* 小圆角：按钮、输入框 */
--r-md: 12px   /* 中圆角：卡片、面板 */
--r-lg: 16px   /* 大圆角：大卡片 */
--r-full: 999px /* 全圆角：胶囊按钮、标签 */
```

### 字体系统
```css
--font: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", system-ui
```

### 动效曲线
```css
--ease: cubic-bezier(0.4, 0, 0.2, 1)  /* 标准缓动 */
```

---

## 📐 布局结构

### client.html - 客户端布局

#### 竖屏布局（390×844）
```
┌─────────────────────────┐
│ 状态栏 (32px)           │
├─────────────────────────┤
│ AppBar (54px)           │
│ [Logo] A2IdeaUI [连接]  │
├─────────────────────────┤
│                         │
│  A2UI 结果区            │
│  (卡片列表)             │
│                         │
├─────────────────────────┤
│                         │
│  对话区                 │
│  (消息列表)             │
│                         │
├─────────────────────────┤
│ 💡 智能提示             │
│ [发起投票] [记录要点]   │
├─────────────────────────┤
│ [输入框]        [发送]  │
└─────────────────────────┘
```

#### 横屏布局（844×390）
```
┌──────────────────────────────────────────┐
│ AppBar (54px)                            │
│ [Logo] A2IdeaUI [连接] [📱] [⤢]         │
├────────────────────┬─────────────────────┤
│                    │                     │
│  对话区            │  A2UI 结果区        │
│  (左侧)          │  (右侧)             │
│                    │                     │
│                    │                     │
├────────────────────┼─────────────────────┤
│ 💡 智能提示        │  卡片网格           │
│ [发起投票] [记录]  │  (双列)             │
├────────────────────┴─────────────────────┤
│ [输入框]                        [发送]   │
└──────────────────────────────────────────┘
```

### index.html - 工作台布局

#### 三栏结构（1920×1080）
```
┌────────────────────────────────────────────────────────────┐
│ 顶栏 (60px)                                                │
│ [Logo] A2IdeaUI 鸿蒙工作台                    [深色|浅色|跟随] │
├──────────┬─────────────────────────┬───────────────────────┤
│          │                         │                       │
│ 左栏     │ 中栏                    │ 右栏                  │
│ (288px)  │ (flex: 1.4)            │ (420px)               │
│          │                         │                       │
│ 工作台   │ 📡 已连接客户端         │ 用户对话              │
│          │ [客户端1] [客户端2]     │                       │
│ 💡 提示  │                         │ [消息列表]            │
│          │ A2UI 结果区             │                       │
│ 日程     │                         │                       │
│ [09:30]  │ ┌─────────────────┐    │                       │
│ 项目周会 │ │ 议程卡片        │    │                       │
│          │ │ ✓ 周报汇总      │    │                       │
│ [14:00]  │ │ □ 联调环境      │    │                       │
│ 需求评审 │ └─────────────────┘    │                       │
│          │                         │                       │
│ 场景     │ ┌─────────────────┐    │ ✎ 正在修改：议程      │
│ 📅 例会  │ │ 投票卡片        │    │                       │
│ 🧐 评审  │ │ 方案A: 42%      │    │                       │
│ 🎓 宣讲  │ │ 方案B: 58%      │    │                       │
│ 🚀 发布  │ └─────────────────┘    │                       │
│          │                         │                       │
│          │                         │ 💡 智能提示           │
│ ─────── │                         │ [发起投票] [记录要点] │
│ 主题     │                         │                       │
│ [深色]   │                         │ 常用功能              │
│ [浅色]   │                         │ [📅生成议程] [🧐发起] │
│ [跟随]   │                         │                       │
│          │                         │ [输入框]      [发送]  │
└──────────┴─────────────────────────┴───────────────────────┘
```

---

## 🎯 核心组件

### 1. 卡片组件（sm-card）

#### 结构
```html
<div class="sm-card">
  <div class="sm-head">
    <span class="rc-dot"></span>           <!-- 品牌圆点 -->
    <span class="rc-title">标题</span>      <!-- 卡片标题 -->
    <div class="rc-actions">
      <button class="rc-btn star">☆</button>  <!-- 收藏 -->
      <button class="rc-btn sel">✎</button>   <!-- 选中修改 -->
      <button class="rc-btn cast">📱</button> <!-- 客户端操作 -->
      <button class="rc-btn close">×</button> <!-- 关闭 -->
    </div>
  </div>
  <div class="sm-body">
    <!-- 卡片内容 -->
  </div>
</div>
```

#### 状态
- **默认态**：`border: 1px solid var(--divider)`
- **选中态**：`.active` - 品牌蓝边框 + 品牌色光晕
- **投屏态**：`.casting` - 品牌蓝边框 + 底部状态条
- **远程态**：`.remote` - 远程客户端投屏卡片

### 2. 议程组件（Agenda）

#### 结构
```html
<div class="ag">
  <div class="ag-item done">
    <div class="ag-check on">✓</div>
    <div class="ag-text">已完成项</div>
  </div>
  <div class="ag-item">
    <div class="ag-check"></div>
    <div class="ag-text">待完成项</div>
  </div>
  <div class="progress">
    <i style="width: 50%"></i>  <!-- 进度条 -->
  </div>
</div>
```

#### 交互
- 点击议程项：切换完成状态
- 自动更新进度条宽度
- 完成项显示删除线

### 3. 投票组件（Poll）

#### 结构
```html
<div class="poll">
  <div class="poll-opt chosen">
    <span class="fill" style="width: 60%"></span>
    <span class="lbl">选项A</span>
    <span class="pct">60%</span>
  </div>
  <div class="poll-opt">
    <span class="fill"></span>
    <span class="lbl">选项B</span>
    <span class="pct">40%</span>
  </div>
</div>
```

#### 交互
- 点击选项：选中该选项
- 显示投票比例填充动画
- 单选模式（互斥）

### 4. 笔记组件（Note）

#### 结构
```html
<div class="note">
  笔记内容文本
  <div class="note-tags">
    <span class="chip">#标签1</span>
    <span class="chip">#标签2</span>
  </div>
</div>
```

#### 样式
- 左侧品牌色边框（4px）
- 品牌色背景（brand-surface）
- 圆角：右上、右下

### 5. 问答组件（Q&A）

#### 结构
```html
<div class="qa-list">
  <div class="qa-item">
    <div class="qa-q">Q：问题</div>
    <div class="qa-a">A：答案</div>
  </div>
</div>
<div class="qa-input">
  <input placeholder="向会议助手提问…">
  <button>提问</button>
</div>
```

#### 交互
- 输入问题后点击提问或按 Enter
- 自动追加到问答列表
- 显示"已记录"提示

### 6. 智能提示（Smart Tips）

#### 结构
```html
<div class="smart-tips">
  <div class="smart-h">💡 智能提示</div>
  <div class="smart-list">
    <div class="smart-tip">发起投票</div>
    <div class="smart-tip">记录要点</div>
    <div class="smart-tip">生成议程</div>
  </div>
</div>
```

#### 交互
- 点击提示：快速生成对应卡片
- 悬停效果：上移 + 品牌色背景
- 点击反馈：缩放 0.96

### 7. 对话消息（Message）

#### 结构
```html
<div class="msg ai">
  <div class="avatar">🤖</div>
  <div class="bubble">AI 消息内容</div>
</div>
<div class="msg me">
  <div class="avatar">👤</div>
  <div class="bubble">用户消息内容</div>
</div>
```

#### 样式
- **AI 消息**：左对齐，灰色背景，品牌色头像
- **用户消息**：右对齐，品牌蓝背景，白色文字

---

## 🔄 交互流程

### client.html - 客户端交互

#### 1. 生成卡片
```
用户输入 → 点击发送 → AI 回复 → 生成 1-2 张卡片
```

#### 2. 投屏卡片
```
点击卡片 📺 按钮 → 卡片进入投屏态 → 底部显示"投屏中"状态条
```

#### 3. 切换设备
```
点击 📱/📲 按钮 → 切换手机/平板视图 → 平板横屏时卡片双列布局
```

#### 4. 切换方向
```
点击 ⤢ 按钮 → 切换竖屏/横屏布局
```

#### 5. 连接/断开
```
点击"会议室大屏" → 切换连接状态 → 断开时清除所有投屏
```

### index.html - 工作台交互

#### 1. 选择场景
```
点击场景卡片 → 中栏生成对应 A2UI 结果 → 右栏显示场景对话
```

#### 2. 选择日程
```
点击日程项 → 切换会话上下文 → 中栏+右栏同步切换
```

#### 3. 修改卡片
```
点击卡片 ✎ 按钮 → 卡片进入选中态 → 右栏显示"正在修改"提示
→ 输入消息 → 迭代修改卡片内容
```

#### 4. 收藏卡片
```
点击 ☆ 按钮 → 切换收藏状态 → 可筛选仅显示收藏卡片
```

#### 5. 关闭卡片
```
点击 × 按钮 → 移除卡片 → 清除选中状态
```

#### 6. 折叠侧栏
```
点击左缘手柄 ‹ → 左栏平滑收起 → 中栏扩展
点击右缘手柄 › → 右栏平滑收起 → 中栏扩展
```

#### 7. 接收投屏
```
客户端投屏 → 中栏显示远程卡片 → 带倒计时进度条 → 可固定到本地
```

#### 8. 客户端操作
```
点击 📱 按钮 → 弹出操作弹窗 → 扫码抢答/投屏 → 推送到已连接客户端
```

---

## 🎬 动效规范

### 过渡动画
```css
/* 标准过渡 */
transition: all .15s var(--ease)

/* 卡片悬停 */
transform: translateY(-1px)

/* 按钮点击 */
transform: scale(.96)

/* 消息入场 */
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

/* 打字指示器 */
@keyframes blink {
  0%,60%,100% { opacity: .3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
```

### 进度条动画
```css
/* 投票填充 */
transition: width .5s var(--ease)

/* 议程进度 */
transition: width .35s var(--ease)
```

---

## 📊 数据模型

### 场景数据（SCENES）
```javascript
{
  id: 'weekly',           // 场景ID
  role: 'meeting',        // 角色：meeting/education
  cat: '例会',            // 分类
  nm: '项目周会',          // 名称
  ds: '同步进展 · 排期',   // 描述
  ico: '📅',              // 图标
  badge: 'Agenda'         // 标签
}
```

### 日程数据（SCHEDULE_BY_ROLE）
```javascript
{
  id: 'm1',               // 日程ID
  time: '09:30',          // 时间
  title: '项目周会',       // 标题
  ds: '例会 · 4 项议程',   // 描述
  a2ui: {
    agenda: [...],        // 议程
    poll: [...],          // 投票
    note: '...',          // 要点
    qa: [...]             // 问答
  }
}
```

### 卡片数据（cards）
```javascript
{
  id: 'card1',            // 卡片ID
  title: '议程',           // 标题
  fav: false              // 是否收藏
}
```

---

## 🎯 关键特性

### client.html
1. ✅ 手机/平板双设备模式
2. ✅ 竖屏/横屏双布局模式
3. ✅ 卡片投屏到大屏
4. ✅ 智能提示快速生成
5. ✅ 连接状态管理

### index.html
1. ✅ 三栏工作台布局
2. ✅ 左右栏平滑折叠
3. ✅ 场景+日程双入口
4. ✅ 多卡片管理（关闭/选中/收藏）
5. ✅ 会话上下文切换
6. ✅ 客户端投屏接收
7. ✅ 客户端操作弹窗（扫码/推送）
8. ✅ 全屏演示模式
9. ✅ 主题切换（深/浅/跟随）

---

## 🎨 视觉风格

### 鸿蒙设计语言
- **品牌色**：#007DFF（华为蓝）
- **圆角**：8/12/16px（层次分明）
- **阴影**：柔和多层阴影
- **动效**：流畅自然（cubic-bezier）
- **字体**：HarmonyOS Sans

### 玻璃拟态
- 半透明背景
- 模糊效果（backdrop-filter）
- 高光边框
- 光斑装饰

### 新拟态
- 双层阴影（凸起/凹陷）
- 大圆角卡片
- 柔和对比
- 内嵌感输入框

---

## 📱 响应式断点

### client.html
```css
/* 手机竖屏 */
body.dev-phone .device { width: 390px; height: 844px; }

/* 手机横屏 */
body.dev-phone.landscape .device { width: 844px; height: 390px; }

/* 平板竖屏 */
body.dev-tablet .device { width: 834px; height: 1112px; }

/* 平板横屏 */
body.dev-tablet.landscape .device { width: 1180px; height: 834px; }
```

### index.html
```css
/* 左栏折叠 */
#workbench.left-collapsed .col-left { width: 0; }

/* 右栏折叠 */
#workbench.right-collapsed .col-right { width: 0; }

/* 平板横屏卡片网格 */
body.dev-tablet.landscape .cards { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
}
```

---

## 🔧 技术实现

### 纯前端实现
- 无框架依赖
- 原生 JavaScript
- CSS 变量（Design Tokens）
- CSS Grid/Flexbox 布局
- CSS 动画/过渡

### 状态管理
```javascript
let curItem = null;              // 当前日程
let cards = [];                  // 卡片列表
let curEditCard = null;          // 当前编辑卡片
let casting = new Set();         // 投屏卡片集合
let sessionCache = new Map();    // 会话缓存
```

### DOM 操作
```javascript
// 创建卡片
function spawnSmall(title, bodyHTML, extraClass, select) { ... }

// 绑定交互
function bindCard(root) { ... }

// 更新 UI
function updateSelUI() { ... }
```

---

## 📝 总结

这两个界面展示了一个完整的 A2UI（Agent-to-UI）系统：

1. **client.html**：移动端用户界面，用于对话生成 A2UI 结果并投屏
2. **index.html**：大屏工作台界面，展示场景、结果和对话

**核心创新**：
- A2UI 协议：AI 动态生成 UI 组件
- 投屏协作：客户端投屏到大屏
- 多卡片管理：灵活的卡片操作
- 鸿蒙设计语言：现代化的视觉风格

**适用场景**：
- 会议管理：议程、投票、纪要、任务
- 教育培训：课程互动、作业管理
- 家校沟通：学情反馈、家长会
- 团队协作：项目管理、任务分派
