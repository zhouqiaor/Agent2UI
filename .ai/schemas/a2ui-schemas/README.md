# A2UI JSON Schema 模板库
> 版本: v1.0 | 角色: A2UI 专家 Agent | 日期: 2026-08-15
> 用于将 Agent 的结构化输出映射为 UI 组件树

---

## 模板结构规范

```
A2UI Schema = {
  "meta": {
    "scene_id": string,        // 场景唯一标识
    "scene_name": string,      // 场景中文名
    "version": string,         // 模板版本
    "source": string,          // 数据来源 (agent | mock | hybrid)
    "harmony_version": string  // 绑定的鸿蒙设计版本
  },
  "intent": {
    "primary": string,         // Agent 核心意图
    "actions": [string]        // 支持的动作列表
  },
  "data_model": {
    "state": object,           // UI 状态定义
    "entities": object         // 数据实体定义
  },
  "ui_schema": {
    "layout": object,          // 布局结构
    "components": [object]     // 组件列表
  },
  "interaction_protocol": {
    "states": [object],        // 状态机
    "events": [object],        // 事件定义
    "actions": [object]        // 动作定义
  },
  "design_tokens": {
    "color": object,           // 色彩令牌映射
    "typography": object,      // 字体令牌映射
    "spacing": object,         // 间距令牌映射
    "shape": object            // 形状/圆角令牌映射
  }
}
```

---

## 6 个场景模板索引

| 场景 | 文件 | 核心意图 |
|------|------|---------|
| 签到计数 | `a2ui-attendance.schema.json` | 基于名单的快速考勤 |
| 投票表决 | `a2ui-vote.schema.json` | 实时会议表决 |
| 课堂答题 | `a2ui-quiz.schema.json` | 互动答题与解析 |
| 分组计分 | `a2ui-score.schema.json` | 团队竞技计分 |
| IdeaHub 白板 | `a2ui-whiteboard.schema.json` | 智能图形识别 |
| IdeaHub 会议 | `a2ui-meeting.schema.json` | 实时字幕与纪要 |

---

## 设计原则

1. **数据驱动 UI**: 所有 UI 组件均由 `data_model.state` 驱动，无硬编码
2. **状态提升**: 所有 mutable state 通过 interaction_protocol 管理
3. **HarmonyOS 合规**: design_tokens 必须映射到 design-tokens.json v1.2.0
4. **Agent 友好**: intent 和 actions 定义 Agent 可理解的语义
5. **可组合**: 模板可嵌套，组件可复用
