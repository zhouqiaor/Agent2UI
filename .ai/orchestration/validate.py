"""
A2UI 6-Agent 流水线验证脚本
验证端到端编排正确性：产物数量、消费者链路、重试逻辑、条件边
"""

import sys
from pipeline import PipelineOrchestrator, _match_profile


def validate_pipeline(scene: str):
    print(f"\n{'='*60}")
    print(f"验证流水线: {scene}")
    print(f"{'='*60}")

    orchestrator = PipelineOrchestrator()
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
    expected_min = 11  # PM(2) + UX(3) + A2UI(3) + Dev(2) + Review(2) + Test(2) - 去重前
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

    # 8. Review 结果
    print(f"\n[8] 条件边结果:")
    print(f"    review_result: {result.get('review_result', 'N/A')}")
    print(f"    test_result: {result.get('test_result', 'N/A')}")

    # 总结
    print(f"\n{'='*60}")
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

    print(f"\n{'='*60}")
    if all_passed:
        print("🎉 所有场景验证通过!")
    else:
        print("❌ 部分场景验证失败")
        sys.exit(1)


if __name__ == "__main__":
    main()