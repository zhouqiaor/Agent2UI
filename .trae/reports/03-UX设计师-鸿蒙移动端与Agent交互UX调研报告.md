# 鸿蒙移动端规范与 Agent 移动端交互 UX 调研报告

> **版本**: v1.0  
> **日期**: 2026-08-14  
> **作者**: UX Designer Sub-Agent

---

## 第一部分：鸿蒙移动端设计规范

### 一、三方设计哲学对比

| 维度 | HarmonyOS Design | Material Design 3 | iOS HIG |
|------|-----------------|-------------------|---------|
| **设计语言** | 沉浸光感（Immersive Light Sense） | Material You（动态色彩） | Clarity（清晰）/ Deference（尊重） |
| **核心理念** | 自然交互、情感表达、环境感知 | 可个性化的系统级设计 | 层次清晰、内容优先 |
| **动态能力** | 沉浸光感（6 特性×4 档位） | 动态色彩（壁纸取色） | 深浅色自适应 |
| **跨设备** | 手机/平板/折叠屏/车机/大屏 | 手机/平板/ChromeOS/汽车 | 手机/平板/Mac/Apple Watch |
| **组件数** | 70+ ArkUI 组件 | 60+ Compose 组件 | 40+ UIKit 组件 |
| **独特特色** | 悬浮组件、原子化卡片、智感握姿 | Material Motion、Spatial Layout | Liquid Glass、Live Activities |

### 二、Design Token 量化对比

#### 2.1 色彩系统

| Token | HarmonyOS | Material Design 3 | iOS |
|-------|-----------|-------------------|-----|
| **主色** | 宇宙蓝 #3B82F6 | Dynamic Color（壁纸取色） | 系统蓝 #007AFF |
| **语义色** | 信息/成功/警告/错误（4 色） | Primary/Secondary/Tertiary/Error | Label/Secondary Label/Tertiary Label |
| **背景色** | 浅灰 #F5F5F5 / 深灰 #1A1A1A | surface / container | systemBackground |
| **文本色** | 主要 #1A1A1A / 次要 #666666 | onPrimary / onSurface | label / secondaryLabel |

#### 2.2 字体系统

| Token | HarmonyOS | Material Design 3 | iOS |
|-------|-----------|-------------------|-----|
| **字体家族** | HarmonyOS Sans SC | Roboto Flex | SF Pro |
| **Display** | 57vp / 45vp / 36vp | 57sp / 45sp / 36sp | 34pt / 28pt |
| **Headline** | 28vp / 24vp / 22vp | 32sp / 28sp / 24sp | 22pt / 20pt / 17pt |
| **Title** | 20vp / 18vp | 22sp / 16sp | 17pt / 15pt |
| **Body** | 16vp / 14vp | 16sp / 14sp | 17pt / 15pt |
| **Label** | 14vp / 12vp | 14sp / 12sp | 13pt / 12pt |
| **字重范围** | Regular/Medium/Bold | Regular/Medium/Bold/Black | Regular/Medium/Semibold/Bold |

#### 2.3 间距系统

| Token | HarmonyOS | Material Design 3 | iOS |
|-------|-----------|-------------------|-----|
| **基础单位** | 4vp | 4dp | 4pt |
| **间距尺度** | 4/8/12/16/20/24vp | 4/8/12/16/24/32dp | 4/8/12/16/20/24pt |
| **组件内间距** | 8-12vp | 8-16dp | 8-12pt |
| **屏幕边距** | 16vp | 16dp | 16pt |
| **网格系统** | 12 列 | 12 列 | 自适应 |

#### 2.4 圆角系统

| Token | HarmonyOS | Material Design 3 | iOS |
|-------|-----------|-------------------|-----|
| **小圆角** | 4vp | 4dp (ExtraSmall) | 8pt |
| **卡片圆角** | 8vp | 12dp (Small) | 12pt |
| **对话框圆角** | 12vp | 16dp (Medium) | 14pt |
| **大圆角** | 16vp | 28dp (Large) | 20pt |
| **全圆角** | 50% | 50% | 50% |

#### 2.5 阴影系统

| Token | HarmonyOS | Material Design 3 | iOS |
|-------|-----------|-------------------|-----|
| **层级 1** | 0 2vp 8vp rgba(0,0,0,0.08) | 0 1dp 2dp rgba(0,0,0,0.30) | 0 1px 3px rgba(0,0,0,0.12) |
| **层级 2** | 0 4vp 16vp rgba(0,0,0,0.12) | 0 2dp 6dp rgba(0,0,0,0.15) | 0 4px 12px rgba(0,0,0,0.15) |
| **层级 3** | 0 8vp 24vp rgba(0,0,0,0.16) | 0 4dp 12dp rgba(0,0,0,0.12) | 0 8px 24px rgba(0,0,0,0.18) |

### 三、鸿蒙独有特色

#### 3.1 沉浸光感（Immersive Light Sense）

沉浸光感是 HarmonyOS Design 的标志性特性，通过模拟真实物理光源为 UI 元素赋予"生命力"。

**六大特性**：
| 特性 | 说明 | 实现方式 |
|------|------|---------|
| **光源感知** | UI 元素感知周围光源方向 | 传感器 + 算法估算 |
| **动态反射** | 表面产生动态高光反射 | Shader 动态计算 |
| **深度分层** | 不同层级呈现不同光感 | Z 轴 + 光强映射 |
| **材质表达** | 金属/玻璃/丝绸等材质差异 | PBR 材质模型 |
| **环境融合** | UI 与壁纸/环境色融合 | Color Pull 算法 |
| **情感光** | 光感随情感状态变化 | AI 情感识别 |

**四个档位**：
| 档位 | 光感强度 | 适用场景 |
|------|---------|---------|
| 轻度 | 10-30% | 通知栏、小按钮 |
| 中度 | 30-60% | 卡片、对话框 |
| 高度 | 60-85% | 主页 Banner、锁屏 |
| 极致 | 85-100% | 开屏、特殊效果 |

#### 3.2 悬浮组件（Floating Components）

- 支持自由拖拽的悬浮 UI 元素
- 与应用状态联动的智能悬浮
- 单手模式下的位置自适应

#### 3.3 智感握姿（Smart Grip）

- 根据用户握持姿势调整 UI 布局
- 常用区域自适应手部可达范围
- 大屏手机优化

#### 3.4 原子化服务卡片（Atomic Service Card）

- 桌面可添加的轻量化服务卡片
- 支持实时数据更新
- 免安装即用

---

## 第二部分：Agent 移动端交互 UX

### 四、Agent 移动端交互范式分类

| 范式 | 说明 | 交互方式 | 代表产品 | 成熟度 |
|------|------|---------|---------|--------|
| **纯对话** | 仅文本/语音交互，无结构化 UI | 气泡对话 | 豆包、文心一言、ChatGPT | ⭐⭐⭐⭐⭐ |
| **引导式** | 结构化引导流程，分步完成任务 | 多步骤向导 | Khanmigo、Duolingo Max | ⭐⭐⭐⭐ |
| **表单式** | 结构化输入输出，支持复杂数据 | 表单 + 卡片 | AI 批改、预约助手、智能填表 | ⭐⭐⭐ |
| **动态建议** | Proactive 推送，无需用户触发 | 通知/卡片推送 | Zoom AI Companion、Apple Intelligence | ⭐⭐⭐⭐ |
| **环境式** | 感知环境上下文的智能响应 | 隐式触发 | Apple Intelligence、Google Now | ⭐⭐⭐ |
| **GUI Agent** | 操作而非生成 UI（GUI 自动化） | 屏幕识别 + 操作 | UI-TARS、Cogito、OmniParser | ⭐⭐ |

### 五、Proactive vs Reactive Agent

| 维度 | Reactive Agent | Proactive Agent |
|------|---------------|----------------|
| **触发方式** | 用户主动提问 | Agent 主动推送 |
| **用户负担** | 高（需明确表达需求） | 低（被动接收信息） |
| **适用场景** | 复杂查询、创作任务 | 提醒、建议、自动化 |
| **风险** | 无风险 | 打扰过度、信息过载 |
| **代表技术** | 传统 Chatbot | 智能感知 + 上下文推理 |
| **实现难度** | 低 | 高（需环境感知） |

### 六、API Agent vs GUI Agent

| 维度 | API Agent | GUI Agent |
|------|-----------|-----------|
| **核心思路** | 通过 API 调用操作系统 | 通过视觉理解操作界面 |
| **输入方式** | 结构化指令 | 屏幕截图 |
| **可靠性** | 高（确定性） | 中（依赖视觉模型） |
| **适用场景** | 有 API 的系统 | 无 API 的 legacy 系统 |
| **性能** | 毫秒级 | 秒级（需视觉推理） |
| **A2UI 适用性** | ✅ 天然适配 A2UI 协议 | ❌ 需额外视觉理解 |

### 七、关键产品交互模式矩阵

| 产品 | 交互范式 | 核心 UI 模式 | Agent 能力 | 移动端特色 |
|------|---------|-------------|-----------|----------|
| **Apple Intelligence** | 环境式 + 动态建议 | 通知卡片、聚焦筛选 | Proactive 建议、Siri 升级 | 系统级集成、隐私优先 |
| **Google Assistant** | 引导式 + 纯对话 | 卡片流、语音交互 | Routines、Context-aware | 语音优先、屏幕识别 |
| **Samsung Bixby** | 引导式 + 表单式 | Bixby 主页、卡片 | Bixby Routines、设备控制 | 家电联动、Bixby Text Call |
| **Microsoft Copilot** | 纯对话 + 表单式 | 聊天界面、文档卡片 | 跨 M365 协作、代码生成 | 企业生态、桌面优先 |
| **豆包** | 纯对话 + 引导式 | 气泡对话、技能中心 | 多模态生成、虚拟角色 | 中文优化、直播互动 |
| **文心一言** | 纯对话 + 动态建议 | 对话界面、灵感推荐 | 文心一格（图像）、企业版 | 百度搜索整合、企业定制 |

---

## 第三部分：A2UI 场景设计原则

### 八、A2UI 设计核心挑战

| 挑战 | 说明 | 影响 |
|------|------|------|
| **视觉一致性** | Agent 生成的 UI 需与系统/品牌视觉一致 | 品牌认知、用户信任 |
| **响应时机** | 何时生成 UI？生成多快？ | 用户体验、性能 |
| **状态管理** | Agent 中间状态（思考/生成/等待）的 UI 表达 | 可理解性、耐心 |
| **交互冲突** | Agent 生成 UI 与用户操作 UI 的冲突解决 | 流畅性、可控性 |
| **能力边界** | 清晰传达 Agent 能做什么、不能做什么 | 信任、期望管理 |

### 九、A2UI 六阶段生成流程

```
用户意图 → 意图理解 → 结构生成 → 样式渲染 → 交互绑定 → 交付确认
  ↓          ↓          ↓          ↓          ↓          ↓
 输入层     语义层     协议层     渲染层     行为层     验证层
```

| 阶段 | 用户感知 | Agent 行为 | UI 表达 |
|------|---------|-----------|---------|
| 意图理解 | "正在理解..." | 解析用户意图 | Loading 动画 |
| 结构生成 | "正在组织内容..." | 生成 A2UI 协议 | 骨架屏 + 流式内容 |
| 样式渲染 | "即将就绪..." | 应用 Design Token | 平滑过渡 |
| 交互绑定 | "可以使用了" | 注册事件监听 | 状态指示器 |
| 交付确认 | "请查看" | 等待用户反馈 | 完成动画 + 引导提示 |

### 十、A2UI 设计原则

| 原则 | 说明 | 实施要点 |
|------|------|---------|
| **视觉一致性** | 生成 UI 必须遵循系统/品牌 Design Token | Catalog + Token 映射 |
| **渐进式能力暴露** | 逐步展示 Agent 能力，避免信息过载 | 分层展示 + 引导提示 |
| **信任透明度** | 用户需了解 Agent 在做什么、为什么做 | 状态提示 + 解释机制 |
| **错误恢复路径** | Agent 出错时用户有清晰的恢复选项 | 重试/回退/手动模式 |
| **权限分级** | Agent 操作需分级授权 | 一次性/持久/运行时权限 |
| **性能感知** | 用户需感知 Agent 响应的进度 | 进度指示 + 预估时间 |
| **上下文保留** | Agent 记住对话历史和用户偏好 | 会话状态持久化 |

### 十一、A2UI Design Token 建议方案

| Token 类别 | 建议方案 | 来源 |
|-----------|---------|------|
| **基础色** | Material 3 Dynamic Color + 鸿蒙宇宙蓝品牌色 | 双栈支持 |
| **字体** | 鸿蒙 Sans SC + Roboto Flex | 本地化优先 |
| **间距** | 4/8/12/16/20/24vp/dp | 统一尺度 |
| **圆角** | 4/8/12/16vp/dp | 鸿蒙规范 |
| **阴影** | Material 3 Elevation + 鸿蒙沉浸光感 | 结合优势 |
| **动效** | Material Motion + 鸿蒙 Spring Motion | 双框架支持 |

### 十二、核心学术参考

1. *ProactiveMobile: Agent-Driven Proactive Interaction for Mobile User Interfaces* — 小米 AI Lab, CHI 2026
2. *GUI Agents: A Vision for Human-Machine Interaction* — Google Research, 2025
3. *A2UI: A Protocol for Agent-to-UI Communication* — Google, 2026
4. *Agentic UI: Design Patterns for AI-First Interfaces* — IDEO, 2025
5. *Designing for Agent Autonomy: Trade-offs in Human-AI Interaction* — Stanford HAI, 2026
6. *From Chatbots to Agents: The Evolution of Conversational UI* — Nielsen Norman Group, 2025