"""
A2UI 6-Agent 流水线验证脚本 v2.0
验证端到端编排正确性：产物数量、消费者链路、重试逻辑、条件边、质量门控、成本追踪
"""

import sys
from pipeline import PipelineOrchestrator, _match_profile, TOKEN_BUDGET


def validate_pipeline(scene: str):
    print(f"\n{'='*70}")
    print(f"验证流水线: {scene}")
    print(f"{'='*70}")

    orchestrator = PipelineOrchestrator(enable_hitl=False)
    result = orchestrator.run(scene)
    artifacts = result.get("artifacts", {})
    messages = result.get("messages", [])

    errors = []

    # 1. 结果状态
    status = result.get("result_status", "unknown")
    print(f"\n[1] 最终状态: {status}")
    if status != "pass":
        errors.append(f"期望 result_status=pass, 实际={status}")

    # 2. 产物数量
    expected_min = 11
    actual = len(artifacts)
    print(f"[2] 产物数量: {actual}")
    if actual < expected_min:
        errors.append(f"期望至少 {expected_min} 个产物, 实际={actual}")

    # 3. 必需产物检查
    required_artifacts = [
        ("spec", ["ux", "a2ui"]),
        ("target_data_model", ["a2ui"]),
        ("design", ["a2ui"]),
        ("design_tokens", ["a2ui", "dev"]),
        ("component_library", ["a2ui"]),
        ("a2ui_schema", ["dev"]),
        ("compose_code", ["dev"]),
        ("data_mapping", ["dev"]),
        ("project_code", ["reviewer", "tester"]),
        ("architecture_doc", ["reviewer"]),
        ("code_package", ["tester"]),
        ("review_comments", ["tester"]),
        ("test_report", ["pm", "dev"]),
        ("performance_baseline", ["pm", "dev"]),
    ]
    print(f"[3] 必需产物检查:")
    for name, expected_consumers in required_artifacts:
        art = artifacts.get(name)
        if not art:
            errors.append(f"缺少产物: {name}")
            print(f"    ❌ {name} → 缺失")
        else:
            consumers = art.get("consumers", [])
            missing = [c for c in expected_consumers if c not in consumers]
            if missing:
                errors.append(f"{name}: 缺少消费者 {missing}")
                print(f"    ❌ {name} → 缺少消费者 {missing}")
            else:
                print(f"    ✅ {name} → consumers: {consumers}")

    # 4. 消费者链路闭环
    print(f"[4] 消费者链路闭环:")
    for name, info in artifacts.items():
        if isinstance(info, dict):
            consumers = info.get("consumers", [])
            consumer_list = ", ".join(consumers) if consumers else "(无)"
            print(f"    {name} → {consumer_list}")

    # 5. 场景化内容检查
    profile = _match_profile(scene)
    if profile:
        print(f"\n[5] 场景化内容验证 ({profile['name']}):")
        spec = artifacts.get("spec", {}).get("content", "")
        if profile["goal"] in spec:
            print(f"    ✅ spec.md 包含产品目标")
        else:
            errors.append("spec.md 缺少场景化内容")
            print(f"    ❌ spec.md 缺少场景化内容")

        a2ui = artifacts.get("a2ui_schema", {}).get("content", "")
        if "counter-main" in a2ui or "counter" in a2ui.lower():
            print(f"    ✅ a2ui_schema.json 包含计数器 schema")
        else:
            errors.append("a2ui_schema.json 缺少场景化内容")
            print(f"    ❌ a2ui_schema.json 缺少场景化内容")

        compose = artifacts.get("compose_code", {}).get("content", "")
        if "CounterScreen" in compose:
            print(f"    ✅ compose_code 包含 CounterScreen")
        else:
            errors.append("compose_code 缺少场景化内容")
            print(f"    ❌ compose_code 缺少场景化内容")

    # 6. 消息顺序检查
    print(f"\n[6] 消息序列检查:")
    expected_order = ["PM", "UX", "A2UI", "Dev", "Review", "Test"]
    msg_sequence = []
    for msg in messages:
        if isinstance(msg, dict) and msg.get("role") == "assistant":
            content = msg.get("content", "")
            for node in expected_order:
                if f"[{node}]" in content:
                    msg_sequence.append(node)
                    break
    print(f"    节点序列: {' → '.join(msg_sequence)}")

    # 7. 重试计数
    retry_counts = result.get("retry_counts", {})
    dev_retries = retry_counts.get("dev", 0)
    print(f"\n[7] 重试计数: dev={dev_retries}/3")
    if dev_retries > 3:
        errors.append(f"重试次数超过 3: dev={dev_retries}")

    # 8. 条件边结果
    print(f"\n[8] 条件边结果:")
    print(f"    review_result: {result.get('review_result', 'N/A')}")
    print(f"    test_result: {result.get('test_result', 'N/A')}")

    # 9. 质量门控
    print(f"\n[9] 质量门控评分:")
    quality_scores = result.get("quality_scores", {})
    for node_id, score in quality_scores.items():
        icon = "✅" if score >= 60 else "⚠️"
        print(f"    {icon} {node_id}: {score}/100")

    if not quality_scores:
        errors.append("缺少质量评分数据")

    # 10. 成本追踪
    print(f"\n[10] Token/成本追踪:")
    token_usage = result.get("token_usage", {})
    total_tokens = token_usage.get("total", 0)
    budget = token_usage.get("budget_limit", TOKEN_BUDGET)
    cost = result.get("total_cost_usd", 0.0)
    print(f"    Token 消耗: {total_tokens:,} / {budget:,} ({total_tokens/budget*100:.1f}%)")
    print(f"    预估成本: ${cost:.4f}")

    # 11. 节点执行日志
    print(f"\n[11] 节点执行日志:")
    node_logs = result.get("node_execution_logs", {})
    for node_id, entries in node_logs.items():
        for entry in entries:
            print(f"    [{entry['node_label']}] duration={entry['duration_ms']}ms, score={entry['quality_score']}, gate={entry['quality_gate']}")

    if not node_logs:
        errors.append("缺少节点执行日志")

    # 12. 执行日志完整性
    print(f"\n[12] 执行日志数量: {len(result.get('execution_logs', []))}")

    # 13. 防护指标
    step_count = result.get("step_count", 0)
    print(f"\n[13] 防护指标:")
    print(f"    步骤数: {step_count}")
    if step_count > 40:
        errors.append(f"步骤数超过 40: {step_count}")
        print(f"    ⚠️ 步骤数超限 ({step_count}/40)")

    cb_status = result.get("circuit_breaker_status", {})
    halted_nodes = [n for n, s in cb_status.items() if s == "HALT"]
    if halted_nodes:
        errors.append(f"熔断器 HALT: {halted_nodes}")
        print(f"    ⚠️ 熔断器 HALT: {halted_nodes}")
    else:
        print(f"    ✅ 所有节点熔断器正常")

    # 总结
    print(f"\n{'='*70}")
    if errors:
        print(f"❌ 验证失败 ({len(errors)} 个错误):")
        for e in errors:
            print(f"    - {e}")
        return False
    else:
        print(f"✅ 全部通过!")
        return True


def main():
    scenes = [
        "计数器 App",
        "会议助手 App",
        "待办清单 App",
    ]

    all_passed = True
    for scene in scenes:
        passed = validate_pipeline(scene)
        if not passed:
            all_passed = False

    print(f"\n{'='*70}")
    if all_passed:
        print("🎉 所有场景验证通过!")
    else:
        print("❌ 部分场景验证失败")
        sys.exit(1)


if __name__ == "__main__":
    main()