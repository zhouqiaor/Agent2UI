# MeetFlow UI 规范 - 第1部分：设计令牌

## 1. 色彩系统

### 主色调 (Indigo)
| Token | 色值 | 用途 |
|-------|------|------|
| primary-50 | #EEF2FF | 最浅背景 |
| primary-100 | #E0E7FF | 浅色背景 |
| primary-200 | #C7D2FE | 边框 |
| primary-500 | #6366F1 | 主色 |
| primary-600 | #4F46E5 | 按钮/链接 |
| primary-700 | #4338CA | 按下状态 |

### 语义色
| 类型 | 50 | 500 | 700 |
|-----|----|----|-----|
| Success | #F0FDF4 | #10B981 | #047857 |
| Warning | #FFFBEB | #F59E0B | #B45309 |
| Error | #FEF2F2 | #EF4444 | #B91C1C |
| Info | #EFF6FF | #3B82F6 | #1D4ED8 |

### 中性色
| Token | 色值 | 用途 |
|-------|------|------|
| gray-50 | #F9FAFB | 页面背景 |
| gray-100 | #F3F4F6 | 卡片背景 |
| gray-200 | #E5E7EB | 边框 |
| gray-400 | #9CA3AF | 占位符 |
| gray-500 | #6B7280 | 次要文本 |
| gray-700 | #374151 | 标题文本 |
| gray-900 | #111827 | 最深文本 |

### 暗色模式
| Token | Light | Dark |
|-------|-------|------|
| background | #F9FAFB | #111827 |
| surface | #FFFFFF | #1F2937 |
| border | #E5E7EB | #374151 |
| text-primary | #111827 | #F9FAFB |
| text-secondary | #6B7280 | #9CA3AF |

## 2. 字体系统

| Token | Size | Line Height | Weight | 用途 |
|-------|------|-------------|--------|------|
| text-xs | 12px | 16px | 400 | 辅助文本 |
| text-sm | 14px | 20px | 400 | 正文小 |
| text-base | 16px | 24px | 400 | 正文 |
| text-lg | 18px | 28px | 400 | 正文大 |
| text-xl | 20px | 28px | 500 | 小标题 |
| text-2xl | 24px | 32px | 600 | 标题 |
| text-3xl | 30px | 36px | 700 | 大标题 |

## 3. 间距系统

| Token | Value | 用途 |
|-------|-------|------|
| space-1 | 4px | 最小间距 |
| space-2 | 8px | 紧凑间距 |
| space-3 | 12px | 小间距 |
| space-4 | 16px | 标准间距 |
| space-5 | 20px | 中等间距 |
| space-6 | 24px | 大间距 |
| space-8 | 32px | 区块间距 |

## 4. 圆角系统

| Token | Value | 用途 |
|-------|-------|------|
| rounded-sm | 4px | 小元素 |
| rounded-md | 8px | 按钮/输入框 |
| rounded-lg | 12px | 卡片 |
| rounded-xl | 16px | 大卡片 |
| rounded-2xl | 20px | 模态框 |
| rounded-full | 9999px | 圆形 |

## 5. 阴影系统

| Token | Value | 用途 |
|-------|-------|------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 轻微 |
| shadow | 0 1px 3px rgba(0,0,0,0.1) | 默认 |
| shadow-md | 0 4px 6px rgba(0,0,0,0.1) | 中等 |
| shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | 大 |
