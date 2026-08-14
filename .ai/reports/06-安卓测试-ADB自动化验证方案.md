# ADB 自动化验证方案

> **版本**: v1.0  
> **日期**: 2026-08-14  
> **作者**: Android Testing Sub-Agent

---

## 一、ADB 自动化命令速查表

### 1.1 设备管理

```bash
# 列出已连接设备
adb devices

# 重启设备
adb reboot

# 查询屏幕尺寸和密度
adb shell wm size
adb shell wm density

# 查询设备信息
adb shell getprop ro.build.version.release
adb shell getprop ro.product.model
```

### 1.2 App 生命周期

```bash
# 安装应用
adb install -r app-debug.apk

# 卸载应用
adb uninstall com.example.a2ui

# 强制停止应用
adb shell am force-stop com.example.a2ui

# 启动应用
adb shell am start -n com.example.a2ui/.MainActivity

# 清除应用数据
adb shell pm clear com.example.a2ui

# 查询进程
adb shell pidof com.example.a2ui
```

### 1.3 UI 交互

```bash
# 点击坐标
adb shell input tap 500 800

# 滑动
adb shell input swipe 500 800 500 400 300

# 输入文本
adb shell input text "hello world"

# 按键事件
adb shell input keyevent KEYCODE_HOME
adb shell input keyevent KEYCODE_BACK
```

### 1.4 UI 层级检查

```bash
# 导出 UI 树
adb shell uiautomator dump /data/local/tmp/ui.xml
adb pull /data/local/tmp/ui.xml

# 检查 Activity 状态
adb shell dumpsys activity activities

# 检查 Window 状态
adb shell dumpsys window windows

# 检查 Notification
adb shell dumpsys notification
```

### 1.5 截图与视觉验证

```bash
# 截屏
adb exec-out screencap -p > screenshot.png

# 截屏到设备再拉取
adb shell screencap -p /data/local/tmp/screenshot.png
adb pull /data/local/tmp/screenshot.png
```

### 1.6 日志监控

```bash
# 按 Tag 过滤
adb logcat -s "A2UI" "Agent" "Compose"

# 按 PID 过滤
adb logcat --pid=$(adb shell pidof com.example.a2ui)

# 按优先级过滤
adb logcat *:E    # 仅错误
adb logcat *:W    # 警告及以上
```

### 1.7 性能监控

```bash
# 帧率统计
adb shell dumpsys gfxinfo com.example.a2ui framestats

# 内存使用
adb shell dumpsys meminfo com.example.a2ui

# CPU 使用
adb shell dumpsys cpuinfo

# Bugreport（完整系统状态）
adb bugreport bugreport.zip
```

### 1.8 Emulator 管理

```bash
# 创建模拟器
avdmanager create avd -n test_avd -k "system-images;android-35;google_apis;x86_64"

# 启动模拟器
emulator -avd test_avd -no-snapshot-load

# 保存快照
adb shell adb shell am broadcast -a android.intent.action.SAVE_SNAPSHOT

# 恢复快照
adb shell adb shell am broadcast -a android.intent.action.RESTORE_SNAPSHOT

# 恢复出厂设置
adb shell adb shell am broadcast -a android.intent.action.FACTORY_RESET
```

---

## 二、框架选型

### 2.1 ADB 自动化框架对比

| 框架 | 语言 | 优势 | 劣势 | 推荐场景 |
|------|------|------|------|---------|
| **pure-python-adb** | Python | 纯 Python 实现，无需 adb 二进制 | 部分高级功能有限 | 快速原型、Python 技术栈 |
| **adb-shell** | Python | 轻量级封装，简单易用 | 功能覆盖不全 | 简单测试场景 |
| **adbkit** | Node.js | TypeScript 支持、API 丰富 | 社区较小 | Node.js 技术栈 |
| **adb-client** | Kotlin | Kotlin 原生、协程支持 | 较新、文档有限 | Android 项目内测试 |

### 2.2 三阶段演进方案

```
阶段一：复用现有 android-emulator-skill/scripts/
  ├── 零配置，立即可用
  ├── Shell 脚本入口
  └── 适合快速验证

阶段二：引入 pure-python-adb
  ├── 替换 adb 子进程调用
  ├── Python 测试运行器
  └── 适合 CI/CD 集成

阶段三：Kotlin Multiplatform + Compose Test
  ├── 深度集成到 Android 项目
  ├── Compose Test Rule
  └── 适合长期维护
```

---

## 三、A2UI 专项测试策略

### 3.1 Agent UI 生成速度验证

```
时间线拆分：
  t0: 用户点击"生成 UI"
  t1: Agent 开始生成（Intent 理解完成）
  t2: A2UI 协议 JSON 生成完成
  t3: 原生渲染完成（首帧可交互）

目标：t3 - t0 < 3 秒
     t2 - t1 < 1.5 秒（LLM 响应）
     t3 - t2 < 0.5 秒（原生渲染）
```

**测试脚本示例**：
```python
import time
from adb_shell.adb_device import AdbDevice

def test_agent_ui_generation_speed():
    device = AdbDevice('localhost', 5554)
    device.connect()
    
    # 启动应用
    start_time = time.time()
    device.shell("am start -n com.example.a2ui/.MainActivity")
    
    # 等待 Agent 开始生成
    device.shell("input tap 500 800")  # 点击生成按钮
    time.sleep(0.5)
    
    # 等待 UI 渲染完成
    time.sleep(3)
    
    # 检查最终状态
    result = device.shell("dumpsys activity activities")
    elapsed = time.time() - start_time
    
    assert elapsed < 3.0, f"Agent UI generation took {elapsed:.2f}s, target < 3s"
```

### 3.2 视觉回归测试

```
基线录制 → 测试执行 → 差异对比 → 报告生成

步骤：
1. 在基准设备上录制 UI 截图作为基线
2. 每次测试时截取相同界面
3. 使用 Pillow 对比两张截图
4. 生成差异图和相似度报告
5. 相似度 < 95% 时标记为失败
```

**测试脚本示例**：
```python
from PIL import Image, ImageChops
import io

def test_visual_regression(device, screen_name, threshold=0.95):
    # 截取当前屏幕
    screenshot = device.shell("screencap -p")
    current = Image.open(io.BytesIO(screenshot))
    
    # 加载基线
    baseline = Image.open(f"baselines/{screen_name}.png")
    
    # 计算相似度
    diff = ImageChops.difference(current, baseline)
    bbox = diff.getbbox()
    
    if bbox is None:
        similarity = 1.0  # 完全相同
    else:
        diff_pixels = sum(1 for pixel in diff.getdata() if pixel != (0, 0, 0))
        total_pixels = current.size[0] * current.size[1]
        similarity = 1.0 - (diff_pixels / total_pixels)
    
    assert similarity >= threshold, \
        f"Visual regression: {similarity:.2%} < {threshold:.0%} threshold"
```

### 3.3 性能基准测试

| 指标 | 测试方法 | 目标值 |
|------|---------|--------|
| Agent 响应时间（简单列表） | 记录 t3 - t0 | < 2s |
| Agent 响应时间（仪表盘） | 记录 t3 - t0 | < 4s |
| 首帧渲染 | `dumpsys gfxinfo` | < 500ms |
| Jank 比例 | `dumpsys gfxinfo framestats` | < 5% |
| 大 Jank | `dumpsys gfxinfo framestats` | < 1% |
| 基础内存占用 | `dumpsys meminfo` | < 200MB |
| 操作内存增长 | `dumpsys meminfo` 对比 | < 50MB |

### 3.4 稳定性测试

| 测试项 | 方法 | 目标 |
|--------|------|------|
| 长会话稳定性 | 100 轮对话，监控内存 | 无内存泄漏、无崩溃 |
| 配置变更恢复 | 旋转屏幕、分屏、折叠 | 状态正确恢复 |
| 后台恢复 | 锁屏、切换 App 后恢复 | Agent 状态保留 |
| 网络异常恢复 | 断网、弱网、网络切换 | 优雅降级、重连 |
| ANR 预防 | 长时间操作监控 | 0 ANR |

### 3.5 兼容性测试

| 配置 | 规格 | 目的 |
|------|------|------|
| 手机（小屏） | 360×800, mdpi | 小屏适配 |
| 手机（标准） | 412×915, xhdpi | 主流设备 |
| 平板 | 1280×800, xhdpi | 大屏适配 |
| 折叠屏（展开） | 2200×2480 | 折叠态 |
| 折叠屏（折叠） | 1080×2480 | 折叠态 |
| 深色模式 | 所有配置 × 深色 | 深色主题 |
| 不同密度 | mdpi / hdpi / xhdpi / xxhdpi | 密度适配 |

---

## 四、CI/CD 集成

### 4.1 GitHub Actions 工作流

```yaml
name: A2UI Android Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  android-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'oracle'
          
      - name: Run ADB Tests
        run: |
          ./gradlew connectedAndroidTest
          
      - name: Generate Test Report
        run: |
          adb shell am instrument -w \
            -e coverage true \
            -e instrumentationResultClass androidx.test.runner.AndroidJUnitRunner \
            com.example.a2ui.test/androidx.test.runner.AndroidJUnitRunner
```

### 4.2 通用 CI 入口脚本

```bash
#!/bin/bash
# run_a2ui_tests.sh

set -e

TEST_TYPE=${1:-all}
DEVICE_SERIAL=${2:-"emulator-5554"}

echo "=== A2UI Test Suite ==="
echo "Test Type: $TEST_TYPE"
echo "Device: $DEVICE_SERIAL"

# 等待设备就绪
adb -s $DEVICE_SERIAL wait-for-device

case $TEST_TYPE in
  agent_speed)
    echo "Running Agent Speed Tests..."
    python3 tests/agent_speed_test.py --device $DEVICE_SERIAL
    ;;
  visual_regression)
    echo "Running Visual Regression Tests..."
    python3 tests/visual_regression_test.py --device $DEVICE_SERIAL
    ;;
  performance)
    echo "Running Performance Benchmarks..."
    python3 tests/performance_benchmark.py --device $DEVICE_SERIAL
    ;;
  stability)
    echo "Running Stability Tests..."
    python3 tests/stability_test.py --device $DEVICE_SERIAL
    ;;
  all)
    echo "Running All Tests..."
    bash run_a2ui_tests.sh agent_speed $DEVICE_SERIAL
    bash run_a2ui_tests.sh visual_regression $DEVICE_SERIAL
    bash run_a2ui_tests.sh performance $DEVICE_SERIAL
    bash run_a2ui_tests.sh stability $DEVICE_SERIAL
    ;;
  *)
    echo "Usage: $0 {agent_speed|visual_regression|performance|stability|all} [device_serial]"
    exit 1
    ;;
esac

echo "=== Test Complete ==="
```

---

## 五、覆盖率目标

### 5.1 覆盖率金字塔

```
┌─────────────────────────────────────┐
│  E2E 测试 100%                      │
│  (Agent 速度 / 视觉回归 / 性能)      │
├─────────────────────────────────────┤
│  UI 测试 90%                        │
│  (Compose Test + Espresso)          │
├─────────────────────────────────────┤
│  集成测试 85%                       │
│  (Agent ↔ UI ↔ 数据层)              │
├─────────────────────────────────────┤
│  单元测试 80%                       │
│  (ViewModel / UseCase / Repository) │
└─────────────────────────────────────┘
```

### 5.2 A2UI 专项覆盖率矩阵

| 维度 | 覆盖率目标 | 测试方法 |
|------|-----------|---------|
| A2UI 协议消息类型 | 100% | 协议单元测试 |
| Agent 状态转换 | 100% | MVI 状态机测试 |
| UI 组件渲染 | 95% | Compose Test |
| Agent 意图处理 | 90% | ViewModel 单元测试 |
| 数据层操作 | 85% | Room/Retrofit 测试 |
| 用户交互路径 | 90% | UI 集成测试 |

---

## 六、性能基准线

| 指标 | 目标值 | 测量方法 | 频率 |
|------|--------|---------|------|
| Agent 响应时间（简单列表） | < 2s | t3 - t0 | 每次提交 |
| Agent 响应时间（仪表盘） | < 4s | t3 - t0 | 每次提交 |
| 首帧渲染 | < 500ms | `dumpsys gfxinfo` | 每次提交 |
| Jank 比例 | < 5% | `framestats` | 每次提交 |
| 大 Jank | < 1% | `framestats` | 每次提交 |
| 基础内存 | < 200MB | `meminfo` | 每日构建 |
| 操作内存增长 | < 50MB | `meminfo` 对比 | 每日构建 |
| 长会话稳定性 | 100% | 100 轮对话 | 每日构建 |
| 崩溃/ANR | 0 | Crash 统计 | 每次提交 |

---

## 七、测试文件结构

```
agent2ui/
├── tests/
│   ├── agent_speed_test.py          # Agent 响应速度测试
│   ├── visual_regression_test.py    # 视觉回归测试
│   ├── performance_benchmark.py     # 性能基准测试
│   ├── stability_test.py            # 稳定性测试
│   ├── baselines/                   # 视觉基线截图
│   │   ├── home_screen.png
│   │   ├── agent_result.png
│   │   └── settings_screen.png
│   └── utils/
│       ├── adb_helper.py            # ADB 工具封装
│       ├── image_comparator.py      # 图片对比
│       └── performance_collector.py # 性能数据收集
├── test/
│   └── instrumented/
│       ├── compose/                 # Compose UI 测试
│       │   ├── AgentScreenTest.kt
│       │   └── LearningPathScreenTest.kt
│       └── integration/             # 集成测试
│           ├── AgentIntegrationTest.kt
│           └── DataLayerIntegrationTest.kt
└── run_a2ui_tests.sh                # CI 入口脚本
```

---

## 八、总结

A2UI 应用的 ADB 自动化验证方案遵循以下原则：

1. **三阶段演进**：从复用现有脚本 → Python 自动化 → Kotlin 深度集成
2. **性能优先**：Agent 响应时间 < 3s、首帧 < 500ms、Jank < 5% 是硬指标
3. **视觉守护**：基线截图 + Pillow 对比，相似度 ≥ 95%
4. **稳定性保障**：100 轮长会话、配置变更恢复、0 ANR 目标
5. **CI/CD 集成**：GitHub Actions 自动化执行，每次 PR 必跑

核心目标：**在用户可见之前，确保 Agent 生成的每一个 UI 界面都经过自动化验证**。