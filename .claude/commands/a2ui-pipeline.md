---
description: 启动完整 A2UI 六 Agent 流水线
---
请启动 A2UI 六 Agent 协作流水线。按照以下顺序依次激活各 Agent：

1. 产品经理 (`.ai/agents/product-manager.agent.md`) → 产出 spec.md、tasks.md、target_data_model.md
2. UX 设计师 (`.ai/agents/ux-designer.agent.md`) → 产出 design.md、design_tokens.md、component_library.md、interaction_flows.md
3. A2UI 专家 (`.ai/agents/a2ui-expert.agent.md`) → 产出 a2ui_schema.json、compose_code/、data_mapping.md、component_catalog.md
4. Android 开发 (`.ai/agents/android-developer.agent.md`) → 产出完整 Android 项目代码
5. 代码审核 (`.ai/agents/code-reviewer.agent.md`) → 产出 review_report.md、review_comments.md、code_package/
6. Android 测试 (`.ai/agents/android-tester.agent.md`) → 产出 test_report.md、performance_baseline.md

每个 Agent 完成后，读取上游 Agent 的产出物作为输入。完整工作流配置见 `.ai/skills/WORKFLOW.md`。