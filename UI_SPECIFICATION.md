# MeetFlow UI 规范文档

> 本文档提供完整的 UI 设计规范，便于其他项目 1:1 还原全量界面和交互

---

## 目录

1. [设计系统](#设计系统)
2. [页面结构](#页面结构)
3. [组件规范](#组件规范)
4. [交互规范](#交互规范)
5. [响应式适配](#响应式适配)
6. [动效规范](#动效规范)

---

## 设计系统

### 色彩体系

#### 主色调
```
Primary (主色):     #4F46E5 (Indigo 600)
Primary Light:      #818CF8 (Indigo 400)
Primary Dark:       #3730A3 (Indigo 800)

Secondary (辅色):   #06B6D4 (Cyan 500)
Accent (强调色):    #F59E0B (Amber 500)
```

#### 语义色
```
Success (成功):     #10B981 (Emerald 500)
Warning (警告):     #F59E0B (Amber 500)
Error (错误):       #EF4444 (Red 500)
Info (信息):        #3B82F6 (Blue 500)
```

#### 中性色
```
Background:         #F9FAFB (Gray 50)
Surface:            #FFFFFF (White)
Border:             #E5E7EB (Gray 200)
Text Primary:       #111827 (Gray 900)
Text Secondary:     #6B7280 (Gray 500)
Text Tertiary:      #9CA3AF (Gray 400)
```

#### 暗色模式
```
Background:         #111827 (Gray 900)
Surface:            #1F2937 (Gray 800)
Border:             #374151 (Gray 700)
Text Primary:       #F9FAFB (Gray 50)
Text Secondary:     #9CA3AF (Gray 400)
```

### 字体系统

```
Font Family:        System Default (San Francisco / Roboto)

Display Large:      34px / Bold / -0.5px tracking
Display Medium:     28px / Bold / -0.3px tracking
Headline Large:     24px / Semibold
Headline Medium:    20px / Semibold
Title Large:        18px / Medium
Title Medium:       16px / Medium
Body Large:         16px / Regular
Body Medium:        14px / Regular
Body Small:         12px / Regular
Caption:            11px / Regular
```

### 间距系统

```
Base Unit:          4px

Spacing XS:         4px
Spacing SM:         8px
Spacing MD:         12px
Spacing LG:         16px
Spacing XL:         20px
Spacing 2XL:        24px
Spacing 3XL:        32px
Spacing 4XL:        40px
Spacing 5XL:        48px
```

### 圆角系统

```
Radius None:        0px
Radius SM:          4px
Radius MD:          8px
Radius LG:          12px
Radius XL:          16px
Radius 2XL:         20px
Radius 3XL:         24px
Radius Full:        9999px (圆形)
```

### 阴影系统

```
Shadow SM:          0 1px 2px rgba(0, 0, 0, 0.05)
Shadow MD:          0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
Shadow LG:          0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
Shadow XL:          0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

---

## 页面结构

### 1. 会议列表页 (Meetings Screen)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px)                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  标题: "会议" (24px Bold)                            │   │
│  │  副标题: "共 X 场会议" (14px Regular, Gray 500)      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Filter Tabs (48px)                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [全部] [进行中] [即将开始] [已结束]                  │   │
│  │  选中态: Primary 色下划线 (2px)                       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Content Area (Flex 1)                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Meeting Card                               │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │  状态标签 (Badge)                    │   │   │   │
│  │  │  │  标题 (18px Semibold)                │   │   │   │
│  │  │  │  描述 (14px Regular, Gray 500)       │   │   │   │
│  │  │  │  ─────────────────────────────────   │   │   │   │
│  │  │  │  📅 日期时间 (12px, Gray 400)        │   │   │   │
│  │  │  │  👥 参会人数 (12px, Gray 400)        │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Meeting Card                               │   │   │
│  │  │  ...                                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Tab Bar (56px + Safe Area)                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🏠 会议]    [🤖 AI助手]    [👤 我的]              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Meeting Card 规范
```
Container:
  - Background: Surface (#FFFFFF)
  - Border Radius: 16px
  - Padding: 16px
  - Margin Bottom: 12px
  - Shadow: Shadow MD

Status Badge:
  - Position: Top Right
  - Padding: 4px 8px
  - Border Radius: 8px
  - Font: 11px Medium
  - Colors:
    - 进行中: Background #DCFCE7, Text #166534
    - 即将开始: Background #FEF3C7, Text #92400E
    - 已结束: Background #F3F4F6, Text #4B5563

Title:
  - Font: 18px Semibold
  - Color: Text Primary
  - Margin Top: 8px

Description:
  - Font: 14px Regular
  - Color: Text Secondary
  - Margin Top: 4px
  - Max Lines: 2

Meta Info:
  - Layout: Row, Space Between
  - Margin Top: 12px
  - Padding Top: 12px
  - Border Top: 1px solid Border
  - Font: 12px Regular
  - Color: Text Tertiary
```

#### 空状态规范
```
Container:
  - Flex: 1
  - Align Items: Center
  - Justify Content: Center
  - Padding: 40px

Icon:
  - Size: 80px
  - Color: Text Tertiary
  - Margin Bottom: 16px

Title:
  - Font: 18px Semibold
  - Color: Text Primary
  - Margin Bottom: 8px

Description:
  - Font: 14px Regular
  - Color: Text Secondary
  - Text Align: Center
  - Margin Bottom: 24px

Action Button:
  - Background: Primary
  - Padding: 12px 24px
  - Border Radius: 12px
  - Font: 14px Medium
  - Color: White
```

---

### 2. 会议详情页 (Meeting Detail Screen)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px)                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← 返回按钮    会议标题 (18px Semibold)              │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Meeting Info Card                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  状态标签                                            │   │
│  │  标题 (24px Bold)                                    │   │
│  │  描述 (14px Regular)                                 │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  📅 2024-01-15 14:00 - 15:30                        │   │
│  │  👥 12 人参会                                        │   │
│  │  📍 会议室 A                                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  A2UI Components Area (Flex 1, Scrollable)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Agenda Component                           │   │   │
│  │  │  ...                                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Poll Component                             │   │   │
│  │  │  ...                                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Note Component                             │   │   │
│  │  │  ...                                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. AI 助手页 (Assistant Screen)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px)                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🤖 AI 助手 (20px Semibold)                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Messages Area (Flex 1, Scrollable)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  User Message (Right Aligned)               │   │   │
│  │  │  Background: Primary                         │   │   │
│  │  │  Color: White                                │   │   │
│  │  │  Border Radius: 16px 16px 4px 16px          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  AI Message (Left Aligned)                  │   │   │
│  │  │  Background: Surface                         │   │   │
│  │  │  Color: Text Primary                         │   │   │
│  │  │  Border Radius: 16px 16px 16px 4px          │   │   │
│  │  │                                             │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │  A2UI Component (if any)            │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Input Area (Auto Height, Min 56px)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  TextInput (Placeholder: "输入消息...")      │   │   │
│  │  │  Background: Gray 100                        │   │   │
│  │  │  Border Radius: 20px                         │   │   │
│  │  │  Padding: 12px 16px                          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  [发送按钮] (Primary, Circle, 40px)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. 个人中心页 (Profile Screen)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  Header (56px)                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  个人中心 (20px Semibold)                            │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Profile Card                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Avatar (80px Circle)                       │   │   │
│  │  │  Background: Primary Light                  │   │   │
│  │  │  Icon: User (40px, White)                   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  用户名 (20px Semibold)                             │   │
│  │  邮箱 (14px Regular, Gray 500)                      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Stats Grid (2x2)                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  12          │  │  48          │                │   │
│  │  │  参与会议    │  │  创建投票    │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  156         │  │  89%         │                │   │
│  │  │  互动次数    │  │  满意度      │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Menu List                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  ⚙️  设置                              →    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  📊  数据统计                            →    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  ℹ️  关于                                →    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  🚪  退出登录                            →    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 组件规范

### 1. Agenda Component (议程组件)

```
Container:
  - Background: Surface
  - Border Radius: 16px
  - Padding: 16px
  - Margin Bottom: 12px

Title:
  - Font: 16px Semibold
  - Color: Text Primary
  - Margin Bottom: 12px

Progress Bar:
  - Height: 4px
  - Background: Gray 200
  - Border Radius: 2px
  - Margin Bottom: 12px
  - Fill: Primary (animated width)

Agenda Item:
  - Layout: Row, Align Center
  - Padding: 12px
  - Border Radius: 12px
  - Margin Bottom: 8px
  - Background: Gray 50 (unchecked), Primary Light 10% (checked)

Checkbox:
  - Size: 24px
  - Border: 2px solid Gray 300 (unchecked)
  - Background: Primary (checked)
  - Icon: Check (White, 16px)
  - Margin Right: 12px

Item Text:
  - Font: 14px Regular
  - Color: Text Primary (unchecked), Text Secondary (checked)
  - Text Decoration: None (unchecked), Line Through (checked)
```

### 2. Poll Component (投票组件)

```
Container:
  - Background: Surface
  - Border Radius: 16px
  - Padding: 16px
  - Margin Bottom: 12px

Title:
  - Font: 16px Semibold
  - Color: Text Primary
  - Margin Bottom: 12px

Option:
  - Layout: Row, Align Center
  - Padding: 12px 16px
  - Border Radius: 12px
  - Margin Bottom: 8px
  - Border: 2px solid Gray 200 (unselected)
  - Border: 2px solid Primary (selected)
  - Background: Surface (unselected), Primary Light 10% (selected)

Radio:
  - Size: 20px
  - Border: 2px solid Gray 300 (unselected)
  - Border: 2px solid Primary (selected)
  - Inner Circle: 10px, Primary (selected only)
  - Margin Right: 12px

Option Text:
  - Font: 14px Regular
  - Color: Text Primary
  - Flex: 1

Vote Count:
  - Font: 12px Medium
  - Color: Text Secondary
  - Margin Left: 8px

Submit Button:
  - Background: Primary
  - Padding: 12px
  - Border Radius: 12px
  - Font: 14px Medium
  - Color: White
  - Margin Top: 8px
  - Disabled: Opacity 0.5
```

### 3. Note Component (笔记组件)

```
Container:
  - Background: Surface
  - Border Radius: 16px
  - Padding: 16px
  - Margin Bottom: 12px
  - Border Left: 4px solid Primary

Title:
  - Font: 16px Semibold
  - Color: Text Primary
  - Margin Bottom: 8px

Content:
  - Font: 14px Regular
  - Color: Text Secondary
  - Line Height: 22px
```

### 4. Task List Component (任务列表组件)

```
Container:
  - Background: Surface
  - Border Radius: 16px
  - Padding: 16px
  - Margin Bottom: 12px

Title:
  - Font: 16px Semibold
  - Color: Text Primary
  - Margin Bottom: 12px

Task Item:
  - Layout: Row, Align Center
  - Padding: 12px
  - Border Radius: 12px
  - Margin Bottom: 8px
  - Background: Gray 50

Checkbox:
  - Size: 20px
  - Border: 2px solid Gray 300 (unchecked)
  - Background: Success (checked)
  - Icon: Check (White, 14px)
  - Margin Right: 12px

Task Text:
  - Font: 14px Regular
  - Color: Text Primary (unchecked), Text Secondary (checked)
  - Text Decoration: None (unchecked), Line Through (checked)
  - Flex: 1

Priority Badge:
  - Padding: 2px 8px
  - Border Radius: 6px
  - Font: 11px Medium
  - Colors:
    - High: Background #FEE2E2, Text #991B1B
    - Medium: Background #FEF3C7, Text #92400E
    - Low: Background #DCFCE7, Text #166534
```

### 5. Button Component

```
Primary Button:
  - Background: Primary
  - Padding: 12px 24px
  - Border Radius: 12px
  - Font: 14px Medium
  - Color: White
  - Shadow: Shadow SM
  - Pressed: Background Primary Dark

Secondary Button:
  - Background: Transparent
  - Border: 2px solid Primary
  - Padding: 10px 22px
  - Border Radius: 12px
  - Font: 14px Medium
  - Color: Primary
  - Pressed: Background Primary Light 10%

Text Button:
  - Background: Transparent
  - Padding: 8px 16px
  - Font: 14px Medium
  - Color: Primary
  - Pressed: Background Gray 100

Disabled State:
  - Opacity: 0.5
  - Pointer Events: None
```

### 6. Input Component

```
Container:
  - Background: Gray 100
  - Border Radius: 12px
  - Padding: 12px 16px
  - Border: 2px solid Transparent (default)
  - Border: 2px solid Primary (focused)

Text:
  - Font: 14px Regular
  - Color: Text Primary
  - Placeholder Color: Text Tertiary

Label:
  - Font: 12px Medium
  - Color: Text Secondary
  - Margin Bottom: 4px

Error State:
  - Border: 2px solid Error
  - Error Text: 12px Regular, Error Color, Margin Top: 4px
```

---

## 交互规范

### 1. 页面转场

```
Push (进入页面):
  - Animation: Slide from Right
  - Duration: 300ms
  - Easing: ease-out

Pop (返回页面):
  - Animation: Slide to Right
  - Duration: 300ms
  - Easing: ease-in

Modal (弹出模态):
  - Animation: Slide from Bottom
  - Duration: 300ms
  - Easing: ease-out
  - Backdrop: rgba(0, 0, 0, 0.5)
```

### 2. 列表交互

```
Pull to Refresh:
  - Trigger Distance: 60px
  - Indicator: Circular Progress
  - Color: Primary

Load More:
  - Trigger: Scroll to Bottom - 100px
  - Indicator: Loading Spinner at Bottom
  - Color: Primary

Swipe Actions:
  - Left Swipe: Delete (Red Background)
  - Right Swipe: Archive (Gray Background)
  - Threshold: 80px
```

### 3. 表单交互

```
Focus:
  - Border Color: Primary
  - Shadow: 0 0 0 3px Primary Light 20%

Validation:
  - Real-time validation on blur
  - Error message appears below input
  - Error border: Error Color

Submit:
  - Disable button during submission
  - Show loading spinner in button
  - Success: Toast notification
  - Error: Toast notification with error message
```

### 4. 投票交互

```
Select Option:
  - Animation: Scale 0.95 → 1.0
  - Duration: 150ms
  - Border Color: Primary
  - Background: Primary Light 10%

Submit Vote:
  - Button: Loading state
  - Success: Show results with animated progress bars
  - Progress Bar Animation: Width 0% → X%, Duration 500ms

Results Display:
  - Show vote count and percentage
  - Highlight selected option
  - Disable further voting
```

### 5. 议程交互

```
Check Item:
  - Animation: Scale 0.9 → 1.0
  - Duration: 200ms
  - Checkbox: Fill animation
  - Text: Strikethrough animation
  - Progress Bar: Animated width update

Complete All:
  - Show celebration animation
  - Confetti effect (optional)
  - Toast: "所有议程已完成"
```

---

## 响应式适配

### 断点定义

```
Small (手机竖屏):     < 640px
Medium (手机横屏):    640px - 1024px
Large (平板):         1024px - 1440px
Extra Large (桌面):   >= 1440px
```

### 布局适配

#### Small (< 640px)
```
- 单列布局
- 底部 Tab Bar
- 卡片全宽
- 间距: 16px
```

#### Medium (640px - 1024px)
```
- 单列布局
- 底部 Tab Bar
- 卡片最大宽度: 600px, 居中
- 间距: 20px
```

#### Large (1024px - 1440px)
```
- 双列布局 (会议列表)
- 侧边导航 (替代底部 Tab)
- 侧边栏宽度: 80px (图标) 或 240px (图标+文字)
- 主内容区: Flex 1
- 间距: 24px
```

#### Extra Large (>= 1440px)
```
- 双列布局
- 侧边导航 (240px)
- 主内容区最大宽度: 1200px, 居中
- 间距: 32px
```

### 组件适配

#### Meeting Card
```
Small:   全宽, 单列
Medium:  最大 600px, 单列
Large:   50% 宽度, 双列网格
XL:      33% 宽度, 三列网格
```

#### Poll Options
```
Small:   单列
Medium:  单列
Large:   双列 (选项 > 4 时)
XL:      双列
```

---

## 动效规范

### 1. 通用动效

```
Fade In:
  - Opacity: 0 → 1
  - Duration: 200ms
  - Easing: ease-out

Scale In:
  - Scale: 0.95 → 1.0
  - Opacity: 0 → 1
  - Duration: 200ms
  - Easing: ease-out

Slide Up:
  - TranslateY: 20px → 0
  - Opacity: 0 → 1
  - Duration: 300ms
  - Easing: ease-out
```

### 2. 列表项动效

```
Stagger Animation:
  - Delay: index * 50ms
  - Animation: Slide Up + Fade In
  - Duration: 300ms
  - Max Items: 10 (之后无延迟)
```

### 3. 交互动效

```
Button Press:
  - Scale: 1.0 → 0.95
  - Duration: 100ms
  - Easing: ease-in

Checkbox Toggle:
  - Scale: 0.9 → 1.0
  - Duration: 200ms
  - Easing: spring (stiffness: 300, damping: 20)

Progress Bar:
  - Width: 0% → X%
  - Duration: 500ms
  - Easing: ease-out
```

### 4. 加载动效

```
Skeleton:
  - Animation: Shimmer (left to right)
  - Duration: 1500ms
  - Loop: Infinite
  - Colors: Gray 200 → Gray 100 → Gray 200

Spinner:
  - Animation: Rotate 360deg
  - Duration: 1000ms
  - Loop: Infinite
  - Easing: linear
```

---

## 附录

### 图标规范

```
Icon Library: Lucide Icons
Icon Size:
  - Small: 16px
  - Medium: 20px
  - Large: 24px
  - Extra Large: 32px

Icon Color:
  - Default: Text Secondary
  - Active: Primary
  - Disabled: Text Tertiary
```

### 状态管理

```
Loading States:
  - Initial Load: Skeleton
  - Refresh: Pull to Refresh indicator
  - Load More: Spinner at bottom
  - Action: Button loading state

Empty States:
  - Icon + Title + Description + Action Button
  - Centered vertically and horizontally

Error States:
  - Icon + Error Message + Retry Button
  - Centered vertically and horizontally
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2024-01-15 | 初始版本，完整 UI 规范 |

---

**文档维护**: MeetFlow Design Team  
**最后更新**: 2024-01-15
