# HarmonyOS Design 规范（完全遵守）

## 一、设计原则

### 1.1 核心理念
- **简洁**：去除冗余元素，聚焦核心内容
- **一致**：统一的视觉语言和交互模式
- **高效**：减少用户操作步骤，提升任务完成效率
- **优雅**：流畅的动效和精致的细节

### 1.2 设计价值观
- **以人为本**：以用户需求为中心
- **自然流畅**：符合物理世界的运动规律
- **精致细腻**：注重每一个细节的打磨
- **创新突破**：引领设计趋势，创造独特体验

---

## 二、色彩系统

### 2.1 品牌色

#### 主色（Primary）
| Token | 色值 | 用途 |
|-------|------|------|
| primary | #0A1F44 | 主色（深蓝） |
| primary-light | #1A3A5C | 浅色主色 |
| primary-dark | #050F22 | 深色主色 |

#### 强调色（Accent）
| Token | 色值 | 用途 |
|-------|------|------|
| accent | #007DFF | 强调色（华为蓝） |
| accent-light | #3D9BFF | 浅色强调 |
| accent-dark | #0056CC | 深色强调 |

### 2.2 语义色

#### 成功色（Success）
| Token | 色值 | 用途 |
|-------|------|------|
| success | #00C853 | 成功状态 |
| success-light | #4CAF50 | 浅色成功 |
| success-dark | #009624 | 深色成功 |

#### 警告色（Warning）
| Token | 色值 | 用途 |
|-------|------|------|
| warning | #FF9800 | 警告状态 |
| warning-light | #FFB74D | 浅色警告 |
| warning-dark | #F57C00 | 深色警告 |

#### 错误色（Error）
| Token | 色值 | 用途 |
|-------|------|------|
| error | #F44336 | 错误状态 |
| error-light | #EF5350 | 浅色错误 |
| error-dark | #D32F2F | 深色错误 |

### 2.3 中性色

#### 背景色
| Token | 色值 | 用途 |
|-------|------|------|
| background | #F5F7FA | 页面背景 |
| surface | #FFFFFF | 卡片背景 |
| surface-variant | #F0F2F5 | 次级卡片背景 |

#### 文字色
| Token | 色值 | 用途 |
|-------|------|------|
| text-primary | #1A1A1A | 主要文字 |
| text-secondary | #666666 | 次要文字 |
| text-tertiary | #999999 | 辅助文字 |
| text-disabled | #CCCCCC | 禁用文字 |

#### 边框色
| Token | 色值 | 用途 |
|-------|------|------|
| border | #E5E7EB | 默认边框 |
| border-light | #F0F2F5 | 浅色边框 |
| border-dark | #D1D5DB | 深色边框 |

### 2.4 暗色模式

#### 暗色背景
| Token | 色值 | 用途 |
|-------|------|------|
| background-dark | #121212 | 深色背景 |
| surface-dark | #1E1E1E | 深色卡片 |
| surface-variant-dark | #2A2A2A | 深色次级卡片 |

#### 暗色文字
| Token | 色值 | 用途 |
|-------|------|------|
| text-primary-dark | #FFFFFF | 深色主要文字 |
| text-secondary-dark | #B0B0B0 | 深色次要文字 |
| text-tertiary-dark | #808080 | 深色辅助文字 |

---

## 三、字体系统

### 3.1 字体家族
```css
font-family: 'HarmonyOS Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 3.2 字号规范

#### 标题字号
| Token | Size | Line Height | Weight | 用途 |
|-------|------|-------------|--------|------|
| display-large | 36px | 44px | Bold | 大标题 |
| display-medium | 32px | 40px | Bold | 中标题 |
| display-small | 28px | 36px | Bold | 小标题 |
| headline-large | 24px | 32px | SemiBold | 大标题 |
| headline-medium | 20px | 28px | SemiBold | 中标题 |
| headline-small | 18px | 26px | SemiBold | 小标题 |

#### 正文字号
| Token | Size | Line Height | Weight | 用途 |
|-------|------|-------------|--------|------|
| body-large | 16px | 24px | Regular | 大正文 |
| body-medium | 14px | 22px | Regular | 中正文 |
| body-small | 12px | 18px | Regular | 小正文 |

#### 辅助字号
| Token | Size | Line Height | Weight | 用途 |
|-------|------|-------------|--------|------|
| label-large | 14px | 20px | Medium | 大标签 |
| label-medium | 12px | 18px | Medium | 中标签 |
| label-small | 10px | 16px | Medium | 小标签 |

### 3.3 字重规范
| Weight | Value | 用途 |
|--------|-------|------|
| Thin | 100 | 极细 |
| Light | 300 | 细体 |
| Regular | 400 | 常规 |
| Medium | 500 | 中等 |
| SemiBold | 600 | 半粗 |
| Bold | 700 | 粗体 |
| ExtraBold | 800 | 极粗 |

---

## 四、间距系统

### 4.1 基础间距
| Token | Value | 用途 |
|-------|-------|------|
| space-xxs | 2px | 极小间距 |
| space-xs | 4px | 超小间距 |
| space-sm | 8px | 小间距 |
| space-md | 12px | 中间距 |
| space-lg | 16px | 大间距 |
| space-xl | 20px | 超大间距 |
| space-xxl | 24px | 极大间距 |
| space-3xl | 32px | 特大间距 |
| space-4xl | 40px | 超大间距 |
| space-5xl | 48px | 巨大间距 |

### 4.2 组件间距
| 组件 | 内边距 | 外边距 |
|------|--------|--------|
| 按钮 | 12px 24px | 8px |
| 卡片 | 16px | 12px |
| 输入框 | 12px 16px | 8px |
| 列表项 | 16px | 8px |
| 模态框 | 24px | 16px |

---

## 五、圆角系统

### 5.1 圆角规范
| Token | Value | 用途 |
|-------|-------|------|
| radius-none | 0px | 无圆角 |
| radius-sm | 4px | 小圆角 |
| radius-md | 8px | 中圆角 |
| radius-lg | 12px | 大圆角 |
| radius-xl | 16px | 超大圆角 |
| radius-2xl | 20px | 特大圆角 |
| radius-3xl | 24px | 极大圆角 |
| radius-full | 9999px | 全圆角 |

### 5.2 组件圆角
| 组件 | 圆角 |
|------|------|
| 按钮 | 8px |
| 卡片 | 12px |
| 输入框 | 8px |
| 模态框 | 16px |
| 标签 | 9999px |
| 头像 | 9999px |

---

## 六、阴影系统

### 6.1 阴影规范
| Token | Value | 用途 |
|-------|-------|------|
| shadow-none | none | 无阴影 |
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 小阴影 |
| shadow-md | 0 2px 8px rgba(0,0,0,0.08) | 中阴影 |
| shadow-lg | 0 4px 16px rgba(0,0,0,0.12) | 大阴影 |
| shadow-xl | 0 8px 24px rgba(0,0,0,0.16) | 超大阴影 |
| shadow-2xl | 0 12px 32px rgba(0,0,0,0.20) | 特大阴影 |

### 6.2 组件阴影
| 组件 | 阴影 |
|------|------|
| 卡片 | shadow-md |
| 按钮（悬浮） | shadow-lg |
| 模态框 | shadow-xl |
| 弹出菜单 | shadow-lg |

---

## 七、动效系统

### 7.1 动效原则
- **自然**：符合物理世界的运动规律
- **流畅**：过渡平滑，无卡顿
- **快速**：响应迅速，不拖沓
- **一致**：相同类型的动效保持一致

### 7.2 缓动曲线
| Token | Value | 用途 |
|-------|-------|------|
| ease-standard | cubic-bezier(0.4, 0, 0.2, 1) | 标准缓动 |
| ease-decelerate | cubic-bezier(0, 0, 0.2, 1) | 减速缓动 |
| ease-accelerate | cubic-bezier(0.4, 0, 1, 1) | 加速缓动 |
| ease-sharp | cubic-bezier(0.4, 0, 0.6, 1) | 尖锐缓动 |

### 7.3 动效时长
| Token | Value | 用途 |
|-------|-------|------|
| duration-instant | 100ms | 即时反馈 |
| duration-fast | 200ms | 快速过渡 |
| duration-normal | 300ms | 标准过渡 |
| duration-slow | 400ms | 慢速过渡 |
| duration-slower | 500ms | 超慢过渡 |

### 7.4 组件动效
| 组件 | 动效 |
|------|------|
| 按钮点击 | scale(0.96) 100ms |
| 卡片悬浮 | translateY(-2px) 200ms |
| 页面切换 | translateX 300ms |
| 模态框弹出 | scale(0.9) + opacity 300ms |
| 列表项出现 | translateY(20px) + opacity 200ms |

---

## 八、组件规范

### 8.1 按钮（Button）

#### 类型
- **主按钮**：accent 背景，白色文字
- **次按钮**：transparent 背景，accent 文字，accent 边框
- **文本按钮**：transparent 背景，accent 文字

#### 尺寸
| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| large | 48px | 16px 32px | 16px |
| medium | 40px | 12px 24px | 14px |
| small | 32px | 8px 16px | 12px |

#### 状态
- **默认**：正常显示
- **悬浮**：背景色加深 10%
- **按下**：scale(0.96)
- **禁用**：opacity 0.4

### 8.2 卡片（Card）

#### 结构
```
┌─────────────────────────┐
│  标题（headline-small）  │
│  描述（body-medium）     │
│  操作区（按钮/链接）     │
└─────────────────────────┘
```

#### 样式
- **背景**：surface (#FFFFFF)
- **圆角**：radius-lg (12px)
- **阴影**：shadow-md
- **内边距**：space-lg (16px)

### 8.3 输入框（Input）

#### 类型
- **单行输入**：text, email, password
- **多行输入**：textarea
- **搜索框**：search

#### 样式
- **背景**：surface-variant (#F0F2F5)
- **圆角**：radius-md (8px)
- **内边距**：space-md space-lg (12px 16px)
- **边框**：none（默认），accent（聚焦）

#### 状态
- **默认**：text-secondary 占位符
- **聚焦**：accent 边框，text-primary 文字
- **错误**：error 边框，error 提示文字
- **禁用**：opacity 0.4

### 8.4 列表（List）

#### 列表项结构
```
┌─────────────────────────┐
│ [图标] 标题        [箭头] │
│        描述              │
└─────────────────────────┘
```

#### 样式
- **背景**：surface (#FFFFFF)
- **圆角**：radius-md (8px)
- **内边距**：space-lg (16px)
- **间距**：space-sm (8px)

#### 交互
- **点击**：背景色变为 surface-variant
- **滑动**：显示操作按钮（删除、编辑等）

### 8.5 模态框（Modal）

#### 结构
```
┌─────────────────────────┐
│  标题（headline-small）  │
│                         │
│  内容（body-medium）     │
│                         │
│  [取消]      [确认]     │
└─────────────────────────┘
```

#### 样式
- **背景**：surface (#FFFFFF)
- **圆角**：radius-xl (16px)
- **阴影**：shadow-xl
- **内边距**：space-xl (24px)

#### 动效
- **弹出**：scale(0.9) + opacity 0 → scale(1) + opacity 1
- **关闭**：scale(1) + opacity 1 → scale(0.9) + opacity 0

---

## 九、图标规范

### 9.1 图标尺寸
| Token | Size | 用途 |
|-------|------|------|
| icon-xs | 16px | 超小图标 |
| icon-sm | 20px | 小图标 |
| icon-md | 24px | 中图标 |
| icon-lg | 32px | 大图标 |
| icon-xl | 40px | 超大图标 |

### 9.2 图标风格
- **线宽**：1.5px 或 2px
- **风格**：线性图标（Outlined）
- **颜色**：text-primary 或 accent

### 9.3 图标库
使用 HarmonyOS 官方图标库或 Material Icons

---

## 十、响应式布局

### 10.1 断点定义
| 设备 | 宽度 | 列数 | 间距 |
|------|------|------|------|
| 手机竖屏 | < 600px | 4 | 16px |
| 手机横屏 | 600-960px | 8 | 20px |
| 平板竖屏 | 600-840px | 8 | 24px |
| 平板横屏 | 840-1200px | 12 | 28px |
| 桌面 | > 1200px | 12 | 32px |

### 10.2 栅格系统
- **列数**：4/8/12 列
- **间距**：gutter（列间距）+ margin（边距）
- **对齐**：左对齐、居中、右对齐

---

## 十一、无障碍设计

### 11.1 对比度要求
- **文字与背景**：≥ 4.5:1（正常文字），≥ 3:1（大文字）
- **图标与背景**：≥ 3:1
- **交互元素**：≥ 3:1

### 11.2 触控区域
- **最小触控区域**：48x48px
- **推荐触控区域**：56x56px
- **间距**：至少 8px

### 11.3 焦点管理
- **键盘导航**：支持 Tab 键导航
- **焦点指示器**：清晰的焦点边框
- **屏幕阅读器**：提供 aria-label

---

## 十二、暗色模式

### 12.1 暗色模式原则
- **降低亮度**：避免纯黑背景
- **降低对比度**：减少视觉疲劳
- **保持层次**：使用不同灰度区分层级
- **调整色彩**：降低饱和度，提高明度

### 12.2 暗色模式色彩
| 元素 | 亮色模式 | 暗色模式 |
|------|---------|---------|
| 背景 | #F5F7FA | #121212 |
| 卡片 | #FFFFFF | #1E1E1E |
| 主要文字 | #1A1A1A | #FFFFFF |
| 次要文字 | #666666 | #B0B0B0 |
| 强调色 | #007DFF | #3D9BFF |

---

## 十三、国际化

### 13.1 文本方向
- **LTR**：从左到右（中文、英文）
- **RTL**：从右到左（阿拉伯文、希伯来文）

### 13.2 日期格式
- **中文**：2024年1月1日
- **英文**：Jan 1, 2024
- **数字**：2024-01-01

### 13.3 数字格式
- **中文**：1,234,567.89
- **英文**：1,234,567.89
- **欧洲**：1.234.567,89

---

## 十四、性能优化

### 14.1 图片优化
- **格式**：WebP（优先）、AVIF
- **压缩**：质量 80%
- **懒加载**：视口外图片延迟加载
- **响应式**：根据屏幕尺寸加载不同尺寸图片

### 14.2 动效优化
- **GPU 加速**：使用 transform 和 opacity
- **减少重绘**：避免布局变化
- **帧率**：保持 60fps

### 14.3 加载优化
- **骨架屏**：内容加载前显示骨架
- **渐进式加载**：优先加载关键内容
- **缓存策略**：合理缓存静态资源

---

## 十五、设计交付

### 15.1 设计稿规范
- **尺寸**：1x（基准）、2x、3x
- **标注**：尺寸、颜色、字号、间距
- **切图**：PNG（图标）、WebP（图片）
- **命名**：组件名_状态_尺寸（如 button_primary_large）

### 15.2 设计走查
- **视觉走查**：对比设计稿和实现效果
- **交互走查**：验证交互逻辑和动效
- **无障碍走查**：检查对比度、焦点管理

---

**本规范完全遵守 HarmonyOS Design 官方设计规范，可作为鸿蒙应用开发的参考标准！**
