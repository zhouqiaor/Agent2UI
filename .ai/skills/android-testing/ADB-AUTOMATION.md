# ADB 自动化测试方案 — A2UI 应用终端验证

> 版本: 1.0.0 | 针对 Agent2UI (A2UI) Android 应用的 ADB 自动化测试完整方案

---

## 目录

1. [ADB 自动化命令速查表](#1-adb-自动化命令速查表)
2. [Python/Kotlin 自动化框架选型](#2-pythonkotlin-自动化框架选型)
3. [A2UI 专项测试策略](#3-a2ui-专项测试策略)
4. [CI/CD 集成方案](#4-cicd-集成方案)
5. [测试覆盖率目标](#5-测试覆盖率目标)
6. [性能基准线建议](#6-性能基准线建议)
7. [测试脚本示例](#7-测试脚本示例)

---

## 1. ADB 自动化命令速查表

### 1.1 设备管理

```bash
# 列出连接设备
adb devices

# 选择特定设备（多设备场景）
adb -s <serial> devices

# 设备重启
adb reboot

# 检查设备硬件信息
adb shell getprop ro.build.version.release
adb shell getprop ro.product.model
adb shell wm size        # 屏幕尺寸
adb shell wm density    # 屏幕密度
```

### 1.2 App 生命周期控制

```bash
# 启动 App（显式 Activity）
adb shell am start -n com.a2ui.app/.MainActivity

# 启动 App（通过 Launcher，更稳健）
adb shell monkey -p com.a2ui.app -c android.intent.category.LAUNCHER 1

# 强制停止 App
adb shell am force-stop com.a2ui.app

# 安装 APK（覆盖安装）
adb install -r app-debug.apk

# 卸载 APK
adb uninstall com.a2ui.app

# 清空 App 数据
adb shell pm clear com.a2ui.app

# 查看 App 进程
adb shell pidof com.a2ui.app

# 查看前台 Activity
adb shell dumpsys activity activities | grep mCurrentFocus
```

### 1.3 UI 交互操作

```bash
# 点击指定坐标
adb shell input tap 540 960

# 滑动（起点 → 终点，持续毫秒）
adb shell input swipe 540 1800 540 600 300

# 输入文本（支持中文需先在设置中启用）
adb shell input text "HelloWorld"

# 按键事件
adb shell input keyevent KEYCODE_HOME
adb shell input keyevent KEYCODE_BACK
adb shell input keyevent KEYCODE_ENTER
adb shell input keyevent KEYCODE_TAB

# 长按
adb shell input swipe 540 960 540 960 1000
```

### 1.4 UI 层级检查

```bash
# 导出 UI 层级结构（XML）
adb shell uiautomator dump /sdcard/ui_dump.xml
adb pull /sdcard/ui_dump.xml ./ui_dump.xml

# 检查当前窗口 Activity
adb shell dumpsys window windows | grep mCurrentFocus

# 检查通知状态
adb shell dumpsys notification --noredact

# 检查 Activity 栈
adb shell dumpsys activity activities
```

### 1.5 截图与视觉验证

```bash
# 截屏保存到设备
adb shell screencap -p /sdcard/screen.png

# 拉取到本地
adb pull /sdcard/screen.png ./screenshots/

# 一站式截图（shell + pull）
adb exec-out screencap -p > ./screenshots/screen_$(date +%s).png
```

### 1.6 日志监控

```bash
# 实时日志（按优先级过滤）
adb logcat -v color '*:I'

# 按 Tag 过滤
adb logcat -s "A2UI" "Agent" "Compose"

# 按包名 PID 过滤
adb logcat --pid=$(adb shell pidof com.a2ui.app)

# 清空日志
adb logcat -c

# 导出日志到文件
adb logcat -d > full_log.txt

# 错误日志专用
adb logcat -b crash -b system '*:E'
```

### 1.7 性能监控

```bash
# 帧率信息（Jank 检测）
adb shell dumpsys gfxinfo com.a2ui.app framestats

# 内存信息
adb shell dumpsys meminfo com.a2ui.app

# CPU 使用率
adb shell top -n 1 | grep com.a2ui.app

# 简单性能测试
adb shell am instrument -w \
  com.a2ui.app.test/androidx.test.runner.AndroidJUnitRunner

# 完整 Bug Report
adb bugreport ./bugreport.zip

# Simpleperf CPU Profile
adb shell simpleperf record -p $(pidof com.a2ui.app) \
  -o /data/local/tmp/perf.data --duration 10
adb pull /data/local/tmp/perf.data ./perf.data
```

### 1.8 Emulator 管理

```bash
# 列出可用 AVD
emulator -list-avds

# 启动模拟器（无窗口模式）
emulator -avd Pixel_6_API_34 -no-window -no-audio -no-boot-anim

# 冷启动（不使用快照）
emulator -avd Pixel_6_API_34 -no-snapshot-load

# 保存当前状态为快照
adb emu avd snapshot save test_snapshot

# 恢复快照
adb emu avd snapshot load test_snapshot

# 恢复出厂设置
adb emu factory-reset

# 关闭模拟器
adb emu kill
```

---

## 2. Python/Kotlin 自动化框架选型

### 2.1 框架对比

| 维度 | pure-python-adb | adb-shell | adbkit (Node) | adb-client (Kotlin) | 现有脚本 |
|------|-----------------|-----------|---------------|---------------------|---------|
| **语言** | Python | Python | TypeScript | Kotlin | Python |
| **安装** | `pip install` | `pip install` | `npm install` | Gradle 依赖 | 零配置 |
| **ADB 协议** | 原生 Protocol Buffers | 子进程封装 | 原生 Protocol Buffers | 原生 Protocol Buffers | 子进程封装 |
| **设备管理** | ✅ 多设备 | ✅ 多设备 | ✅ 多设备 | ✅ 多设备 | ✅ 单设备 |
| **Shell 命令** | ✅ 原生 | ✅ 子进程 | ✅ 原生 | ✅ 原生 | ✅ 子进程 |
| **UI 测试** | ❌ 需封装 | ❌ 需封装 | ❌ 需封装 | ⚠️ 有限 | ✅ uiautomator |
| **异步支持** | ❌ 同步 | ✅ asyncio | ✅ Promise | ✅ Coroutines | ❌ 同步 |
| **CI/CD 集成** | ✅ SSH 友好 | ✅ SSH 友好 | ⚠️ Node 环境 | ⚠️ JVM 环境 | ✅ 零依赖 |
| **适用场景** | 生产级测试 | 快速原型 | JS 技术栈 | Kotlin 技术栈 | 现有项目 |

### 2.2 推荐方案：分层架构

```
┌─────────────────────────────────────────────┐
│          A2UI Test Runner (Python)          │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ ADB层   │  │ UI层     │  │ 断言层    │  │
│  │         │  │          │  │           │  │
│  │ - 设备  │  │ - 页面   │  │ - 文本    │  │
│  │   管理  │  │   对象   │  │   匹配    │  │
│  │ - Shell │  │ - 交互   │  │ - 截图    │  │
│  │   命令  │  │   操作   │  │   对比    │  │
│  │ - 进程  │  │ - 等待   │  │ - 性能    │  │
│  │   监控  │  │   策略   │  │   指标    │  │
│  └─────────┘  └──────────┘  └───────────┘  │
├─────────────────────────────────────────────┤
│     底层实现：pure-python-adb / 子进程       │
└─────────────────────────────────────────────┘
```

### 2.3 选型建议

#### 阶段一：快速验证（当前）
- **复用现有 `android-emulator-skill/scripts/`** 作为基础
- 扩展 `common.py` 添加性能监控方法
- 新增 A2UI 专项测试脚本
- 优点：零额外依赖，快速落地

#### 阶段二：规模化（1-2 月后）
- 引入 `pure-python-adb` 替换子进程调用
- 原因：原生协议、更快的命令执行、更好的错误处理
- 补充 `adb-shell` 用于需要快速原型的场景

#### 阶段三：深度集成（3 月后）
- 核心测试框架迁移至 Kotlin Multiplatform
- 使用 `adb-client` 与 Compose Test 集成
- 统一 CI/CD 中的测试报告格式

### 2.4 关键框架安装与使用

#### pure-python-adb

```bash
pip install pure-python-adb
```

```python
from ppadb.client import Client as AdbClient

client = AdbClient(host="127.0.0.1", port=5037)
device = client.devices()[0]

# Shell 命令
result = device.shell("input tap 540 960")

# 安装 APK
device.push("app-debug.apk", "/data/local/tmp/app-debug.apk")
device.shell("pm install -r /data/local/tmp/app-debug.apk")

# 截屏
result = device.screencap()
with open("screen.png", "wb") as f:
    f.write(result)

# uiautomator dump
result = device.shell("uiautomator dump /dev/tty")
```

#### adb-shell

```bash
pip install adb-shell[async]
```

```python
from adb_shell.auth.sign_pythonrsa import PythonRSASigner
from adb_shell.adb_device import AdbDevice

device = AdbDevice(serial='emulator-5554')
device.connect()

# Shell
output = device.shell("input swipe 540 1800 540 600 300")

# 屏幕截图
from adb_shell.transport.usb_transport import UsbTransport
# ...

device.close()
```

---

## 3. A2UI 专项测试策略

### 3.1 Agent UI 生成速度验证

**目标**：验证 Agent 从接收指令到完成 UI 渲染的端到端延迟。

```
时间线：
┌──────────┐  ┌───────────────┐  ┌────────────┐  ┌──────────┐
│ Agent    │→│ 数据模型解析  │→│ Compose    │→│ 首帧渲染 │
│ 接收指令 │  │ + 代码生成    │  │ 代码编译   │  │ 完成     │
└──────────┘  └───────────────┘  └────────────┘  └──────────┘
     t0              t1               t2            t3

指标：
- Agent 响应时间 = t3 - t0（目标 < 3s）
- 数据解析时间 = t1 - t0（目标 < 500ms）
- 编译 + 部署时间 = t2 - t1（目标 < 2s）
- 首帧渲染时间 = t3 - t2（目标 < 500ms）
```

**测试方法**：

```python
class AgentSpeedTest:
    """A2UI Agent UI 生成速度测试"""

    def test_agent_ui_generation_time(self):
        """验证从 Agent 指令到 UI 渲染完成的总时长"""
        # 1. 清空日志
        self.adb.run_adb_command(["logcat", "-c"])

        # 2. 注入 Agent 指令（模拟用户请求）
        start_time = time.time()
        self.inject_agent_instruction("生成用户资料页面")

        # 3. 等待 UI 渲染完成（监听 Compose 首帧信号）
        self.wait_for_compose_first_frame(timeout=10000)
        end_time = time.time()

        # 4. 计算指标
        total_duration = end_time - start_time
        assert total_duration < 3.0, (
            f"Agent UI generation took {total_duration:.2f}s, "
            f"exceeding 3s threshold"
        )

    def test_data_model_parsing_speed(self):
        """验证数据模型解析速度"""
        start_time = time.time()
        self.inject_agent_instruction(
            "生成包含 50 个字段的复杂表单"
        )
        self.wait_for_agent_log("DataModelParsed")
        parsing_time = time.time() - start_time
        assert parsing_time < 0.5

    def test_compose_compilation_speed(self):
        """验证 Compose 代码编译和部署速度"""
        self.inject_agent_instruction("生成仪表盘页面")
        compilation_start = time.time()
        self.wait_for_agent_log("ComposeCompiled")
        compilation_end = time.time()
        compile_duration = compilation_end - compilation_start
        assert compile_duration < 2.0
```

### 3.2 Multi-Agent 协作结果验证

**目标**：验证多个 Agent 协同工作时，UI 结果的一致性和正确性。

```
Multi-Agent 场景：
┌─────────┐     ┌──────────┐     ┌──────────┐
│ Agent A │────→│ Agent B  │────→│ Agent C  │
│ 数据收集 │     │ 逻辑处理 │     │ UI 生成  │
└─────────┘     └──────────┘     └──────────┘
     │               │                │
     ▼               ▼                ▼
  验证数据一致性   验证逻辑正确性   验证 UI 渲染
```

**测试方法**：

```python
class MultiAgentTest:
    """Multi-Agent 协作测试"""

    def test_cross_agent_data_consistency(self):
        """验证跨 Agent 数据一致性"""
        # Agent A 生成数据
        agent_a_data = self.agent_a_execute(
            "查询用户订单列表",
            capture_output=True
        )

        # Agent B 基于数据生成报告
        agent_b_report = self.agent_b_execute(
            f"基于以下数据生成报告: {agent_a_data}"
        )

        # Agent C 基于报告生成 UI
        self.inject_agent_instruction(
            f"根据报告生成 UI: {agent_b_report}"
        )

        # 验证 UI 展示的数据与 Agent A 原始数据一致
        displayed_data = self.extract_ui_text()
        assert displayed_data.contains_all(agent_a_data.fields)

    def test_agent_fallback_behavior(self):
        """验证 Agent 失败时的降级行为"""
        # 模拟 Agent B 失败
        self.mock_agent_failure("Agent B")

        # 触发协作流程
        self.inject_multi_agent_workflow(
            agents=["A", "B", "C"],
            fallback=True
        )

        # 验证系统使用降级方案
        fallback_used = self.wait_for_agent_log("FallbackActivated")
        assert fallback_used is True

        # 验证 UI 仍能正确渲染（使用降级数据）
        self.wait_for_compose_first_frame(timeout=10000)
        self.verify_ui_elements_visible()
```

### 3.3 视觉回归测试（Screenshot Comparison）

**目标**：确保每次 UI 变更不会引入视觉回归缺陷。

#### 方案：基于 ADB 截图 + 图像对比

```python
import hashlib
import os
from datetime import datetime
from PIL import Image, ImageChops

class VisualRegressionTest:
    """视觉回归测试"""

    BASELINE_DIR = "test/baselines/"
    CURRENT_DIR = "test/current/"
    DIFF_DIR = "test/diff/"

    def capture_and_compare(
        self,
        screen_name: str,
        threshold: float = 0.95
    ) -> bool:
        """
        截图并与基线对比

        Args:
            screen_name: 屏幕标识
            threshold: 相似度阈值（0-1，越高越严格）

        Returns:
            是否通过对比
        """
        baseline_path = f"{self.BASELINE_DIR}/{screen_name}.png"
        current_path = f"{self.CURRENT_DIR}/{screen_name}.png"
        diff_path = f"{self.DIFF_DIR}/{screen_name}_diff.png"

        # 1. 截取当前屏幕
        self.adb.run_adb_command([
            "shell", "screencap", "-p",
            "/sdcard/screen.png"
        ])
        self.adb.run_adb_command([
            "pull", "/sdcard/screen.png", current_path
        ])

        # 2. 如果基线不存在，创建基线
        if not os.path.exists(baseline_path):
            os.makedirs(self.BASELINE_DIR, exist_ok=True)
            shutil.copy(current_path, baseline_path)
            self.log(f"Baseline created for {screen_name}")
            return True

        # 3. 图像对比
        baseline = Image.open(baseline).convert("RGBA")
        current = Image.open(current_path).convert("RGBA")

        # 确保尺寸一致
        if baseline.size != current.size:
            current = current.resize(
                baseline.size, Image.LANCZOS
            )

        # 计算差异
        diff = ImageChops.difference(baseline, current)
        diff_bbox = diff.getbbox()

        if diff_bbox is None:
            return True  # 完全一致

        # 计算相似度
        total_pixels = baseline.size[0] * baseline.size[1]
        diff_pixels = sum(
            1 for pixel in diff.getdata()
            if sum(pixel[:3]) > 30  # 忽略微小差异
        )
        similarity = 1.0 - (diff_pixels / total_pixels)

        # 4. 保存差异图
        os.makedirs(self.DIFF_DIR, exist_ok=True)
        diff.save(diff_path)

        # 5. 判定结果
        passed = similarity >= threshold
        if not passed:
            self.log(
                f"Visual regression: {similarity:.2%} similarity "
                f"(threshold: {threshold:.0%})"
            )
        return passed

    def record_baseline(self, screen_name: str):
        """录制基线截图"""
        self.capture_and_compare(screen_name)
        # 将当前截图设为基线
        current = f"{self.CURRENT_DIR}/{screen_name}.png"
        baseline = f"{self.BASELINE_DIR}/{screen_name}.png"
        os.makedirs(self.BASELINE_DIR, exist_ok=True)
        shutil.copy(current, baseline)

    def test_all_screens_visual_regression(self):
        """批量验证所有屏幕的视觉回归"""
        screens = self.get_all_test_screens()
        results = {}
        failed = []

        for screen in screens:
            passed = self.capture_and_compare(screen)
            results[screen] = passed
            if not passed:
                failed.append(screen)

        if failed:
            raise AssertionError(
                f"Visual regression failed for: {failed}"
            )

        self.log(f"All {len(screens)} screens passed visual check")
```

### 3.4 性能基准测试

```python
class PerformanceBenchmark:
    """A2UI 性能基准测试"""

    def benchmark_agent_response_time(self):
        """基准：Agent 响应时间"""
        scenarios = [
            ("简单列表", "生成一个包含 10 条数据的列表页面"),
            ("复杂表单", "生成包含 20 个字段的表单页面"),
            ("数据仪表盘", "生成包含图表和统计卡片的仪表盘"),
            ("详情页", "生成包含嵌套卡片的详情页面"),
        ]

        results = {}
        for name, instruction in scenarios:
            durations = []
            for _ in range(5):  # 5 次取平均
                start = time.time()
                self.inject_agent_instruction(instruction)
                self.wait_for_compose_first_frame(timeout=15000)
                durations.append(time.time() - start)

            avg = sum(durations) / len(durations)
            p95 = sorted(durations)[int(len(durations) * 0.95)]
            results[name] = {"avg": avg, "p95": p95}

        self.report_performance(results)

    def benchmark_ui_render_time(self):
        """基准：UI 渲染性能（帧率）"""
        # 使用 gfxinfo 获取帧数据
        self.inject_agent_instruction("生成复杂动画页面")

        # 触发 UI 交互
        self.adb.run_adb_command([
            "shell", "input", "swipe",
            "540", "1800", "540", "600", "500"
        ])

        # 收集帧率
        result = self.adb.run_adb_command([
            "shell", "dumpsys", "gfxinfo",
            "com.a2ui.app", "framestats"
        ])

        # 解析帧数据
        frame_times = self.parse_frame_stats(result.stdout)
        jank_frames = [
            ft for ft in frame_times if ft > 16.67  # > 60fps threshold
        ]
        jank_rate = len(jank_frames) / len(frame_times)

        assert jank_rate < 0.05, (
            f"Jank rate {jank_rate:.2%} exceeds 5%"
        )

    def benchmark_memory_usage(self):
        """基准：内存使用"""
        # 基础内存
        baseline_mem = self.get_app_memory()

        # 加载多个页面
        for _ in range(10):
            self.inject_agent_instruction("生成新页面")
            self.wait_for_compose_first_frame(timeout=10000)

        # 峰值内存
        peak_mem = self.get_app_memory()
        mem_increase = peak_mem - baseline_mem

        assert mem_increase < 100 * 1024 * 1024, (
            f"Memory increased by {mem_increase / 1024 / 1024:.1f}MB"
        )

    def get_app_memory(self) -> int:
        """获取 App 内存使用量（KB）"""
        result = self.adb.run_adb_command([
            "shell", "dumpsys", "meminfo", "com.a2ui.app"
        ])
        # 解析 "TOTAL PSS: XXXXX"
        for line in result.stdout.splitlines():
            if "TOTAL PSS:" in line:
                return int(line.split()[-1])
        return 0
```

### 3.5 稳定性测试

```python
class StabilityTest:
    """A2UI 稳定性测试"""

    def test_long_session_stability(self):
        """长会话稳定性（内存泄漏检测）"""
        initial_memory = self.get_app_memory()

        for round_num in range(50):
            self.inject_agent_instruction(
                f"生成第 {round_num} 个页面"
            )
            self.wait_for_compose_first_frame(timeout=15000)

            # 每 10 轮检查一次内存
            if round_num % 10 == 0:
                current_memory = self.get_app_memory()
                growth = current_memory - initial_memory
                self.log(
                    f"Round {round_num}: "
                    f"memory growth = {growth / 1024:.1f}MB"
                )

        final_memory = self.get_app_memory()
        total_growth = final_memory - initial_memory

        # 内存增长不应超过 50MB（50 轮操作）
        assert total_growth < 50 * 1024 * 1024, (
            f"Memory leak detected: {total_growth / 1024 / 1024:.1f}MB "
            f"growth after 50 rounds"
        )

    def test_anr_prevention(self):
        """ANR（应用无响应）预防测试"""
        # 在后台压力下测试 App 响应性
        self.start_background_load()

        # 同时进行 UI 操作
        for _ in range(20):
            self.adb.run_adb_command([
                "shell", "input", "tap", "540", "960"
            ])
            self.inject_agent_instruction("快速生成页面")

        # 检查是否有 ANR
        anr_logs = self.collect_anr_logs()
        assert len(anr_logs) == 0, f"ANR detected: {anr_logs}"

    def test_app_recovery_after_crash(self):
        """崩溃后恢复能力"""
        # 触发非致命错误
        self.inject_malformed_instruction()

        # 验证 App 不崩溃
        app_alive = self.is_app_running()
        assert app_alive, "App crashed on malformed input"

        # 验证可继续使用
        self.inject_agent_instruction("生成正常页面")
        self.wait_for_compose_first_frame(timeout=10000)

    def test_configuration_change_resilience(self):
        """配置变更恢复（旋转屏幕等）"""
        # 切换方向
        self.adb.run_adb_command([
            "shell", "settings", "put", "system",
            "accelerometer_rotation", "0"
        ])
        self.adb.run_adb_command([
            "shell", "input", "keyevent", "82"  # KEYCODE_NOTIFICATION
        ])
        # 使用 dumpsys 切换
        self.adb.run_adb_command([
            "shell", "dumpsys", "input", "set", "orientation", "1"
        ])

        # 验证 UI 正确恢复
        self.wait_for_compose_first_frame(timeout=5000)
        self.verify_ui_elements_visible()
```

### 3.6 兼容性测试

```python
class CompatibilityTest:
    """多设备兼容性测试"""

    SCREEN_CONFIGS = [
        # (分辨率, 密度, 屏幕类型)
        ((1080, 2400), 420, "phone_normal"),
        ((1440, 3200), 560, "phone_high_density"),
        ((720, 1280), 320, "phone_low_res"),
        ((1200, 1920), 320, "tablet"),
        ((2560, 1600), 420, "tablet_large"),
        ((1080, 2636), 480, "foldable_closed"),
        ((2200, 2480), 480, "foldable_open"),
    ]

    def test_multi_screen_compatibility(self):
        """多屏幕尺寸兼容性"""
        for resolution, density, config_name in self.SCREEN_CONFIGS:
            self.log(f"Testing: {config_name}")

            # 设置屏幕参数
            width, height = resolution
            self.adb.run_adb_command([
                "shell", "wm", "size", f"{width}x{height}"
            ])
            self.adb.run_adb_command([
                "shell", "wm", "density", str(density)
            ])

            # 等待屏幕应用
            time.sleep(0.5)

            # 启动 App
            self.launch_app()
            self.wait_for_compose_first_frame(timeout=10000)

            # 验证所有 UI 元素可见
            ui_elements = self.screen_mapper.analyze()
            self.verify_all_elements_within_bounds(
                ui_elements, width, height
            )

            # 截图记录
            self.capture_screen(f"compat_{config_name}")

            # 重置
            self.adb.run_adb_command(["shell", "wm", "size", "reset"])
            self.adb.run_adb_command(["shell", "wm", "density", "reset"])

    def verify_all_elements_within_bounds(
        self, elements, width, height
    ):
        """验证所有 UI 元素在屏幕范围内"""
        for elem in elements.get("interactive", []):
            bounds = elem.get("bounds", {})
            if bounds:
                assert bounds["x"] >= 0
                assert bounds["y"] >= 0
                assert bounds["x"] + bounds["width"] <= width
                assert bounds["y"] + bounds["height"] <= height
```

---

## 4. CI/CD 集成方案

### 4.1 GitHub Actions 工作流

```yaml
# .github/workflows/a2ui-test.yml
name: A2UI Automated Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # 每日凌晨 2 点

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        api-level: [34]
        target: [google_apis]

    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'zulu'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          api-level: ${{ matrix.api-level }}
          target: ${{ matrix.target }}

      - name: Run Tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: ${{ matrix.api-level }}
          target: ${{ matrix.target }}
          script: |
            ./gradlew connectedCheck
            python scripts/run_a2ui_tests.py --ci

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.api-level }}
          path: |
            app/build/reports/
            app/build/outputs/
            test/reports/
            test/screenshots/
            test/diff/

      - name: Visual Regression Check
        if: github.event_name == 'pull_request'
        run: |
            python scripts/visual_regression.py \
              --baseline test/baselines/ \
              --current test/current/ \
              --output test/diff/

      - name: Performance Benchmark
        if: github.event_name == 'schedule'
        run: |
            python scripts/benchmark.py \
              --scenarios test/configs/benchmark_scenarios.json \
              --output test/reports/benchmark/

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run ktlint
        run: ./gradlew lintDebug
      - name: Upload Lint Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lint-results
          path: app/build/reports/lint/
```

### 4.2 Shell 脚本：本地/CI 通用入口

```bash
#!/bin/bash
# scripts/ci_test_runner.sh
set -euo pipefail

PACKAGE="com.a2ui.app"
RESULTS_DIR="${CI_ARTIFACTS_DIR:-./test-results}"
SCREENSHOT_DIR="$RESULTS_DIR/screenshots"
LOG_DIR="$RESULTS_DIR/logs"

log() { echo "[$(date +'%H:%M:%S')] $*"; }
fail() { log "FATAL: $*"; exit 1; }

# ========== 前置检查 ==========
check_env() {
    log "Checking environment..."
    command -v adb >/dev/null 2>&1 || fail "adb not found"
    command -v emulator >/dev/null 2>&1 || fail "emulator not found"
    adb devices | grep -q "device$" || fail "No device/emulator connected"
}

# ========== App 生命周期 ==========
setup_app() {
    log "Installing APK..."
    adb install -r app/build/outputs/apk/debug/app-debug.apk
    adb shell pm clear "$PACKAGE"
    adb logcat -c
    log "Starting app..."
    adb shell monkey -p "$PACKAGE" \
        -c android.intent.category.LAUNCHER 1
    sleep 2
}

teardown_app() {
    log "Stopping app..."
    adb shell am force-stop "$PACKAGE"
}

# ========== 日志采集 ==========
collect_logs() {
    local tag="$1"
    local output_file="$LOG_DIR/${tag}_$(date +%s).log"
    adb logcat -d -s "A2UI" "$tag" > "$output_file" 2>&1 || true
    log "Logs saved: $output_file"
}

# ========== 截图 ==========
take_screenshot() {
    local name="$1"
    local path="$SCREENSHOT_DIR/${name}_$(date +%s).png"
    adb exec-out screencap -p > "$path"
    log "Screenshot: $path"
}

# ========== UI 检查 ==========
dump_ui() {
    local label="$1"
    adb shell uiautomator dump /sdcard/ui_dump.xml
    local path="$RESULTS_DIR/ui_${label}_$(date +%s).xml"
    adb pull /sdcard/ui_dump.xml "$path" >/dev/null
    log "UI dump: $path"
}

# ========== 性能采样 ==========
sample_performance() {
    local duration="${1:-10}"
    log "Sampling performance for ${duration}s..."

    # 帧率
    adb shell dumpsys gfxinfo "$PACKAGE" framestats \
        > "$LOG_DIR/framestats_$(date +%s).log" 2>&1

    # 内存
    adb shell dumpsys meminfo "$PACKAGE" \
        > "$LOG_DIR/meminfo_$(date +%s).log" 2>&1

    log "Performance samples collected"
}

# ========== 主流程 ==========
main() {
    mkdir -p "$RESULTS_DIR" "$SCREENSHOT_DIR" "$LOG_DIR"

    check_env
    setup_app

    log "=== Running A2UI Test Suite ==="

    # 1. 基础 UI 测试
    dump_ui "initial"
    take_screenshot "initial_screen"

    # 2. Agent 指令测试
    adb shell input tap 540 960  # 触发 Agent 入口
    sleep 1
    adb shell input text "生成用户仪表盘"
    sleep 3
    dump_ui "agent_result"
    take_screenshot "agent_generated"

    # 3. 性能采样
    sample_performance 5

    # 4. 日志检查
    collect_logs "A2UI"
    collect_logs "Agent"

    # 5. 错误日志检查
    error_count=$(adb logcat -d '*:E' | wc -l)
    if [ "$error_count" -gt 0 ]; then
        log "WARNING: $error_count error logs found"
    fi

    teardown_app
    log "=== Test Suite Complete ==="
}

main "$@"
```

### 4.3 报告生成

```python
# scripts/test_report_generator.py
import json
import os
from datetime import datetime

class TestReportGenerator:
    """生成结构化测试报告"""

    def generate(self, results: dict, output_dir: str):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report = {
            "meta": {
                "timestamp": timestamp,
                "a2ui_version": self.get_app_version(),
                "device": self.get_device_info(),
                "test_duration": results.get("total_duration", 0),
            },
            "summary": {
                "total_tests": len(results.get("tests", [])),
                "passed": sum(
                    1 for t in results["tests"]
                    if t.get("passed")
                ),
                "failed": sum(
                    1 for t in results["tests"]
                    if not t.get("passed")
                ),
                "pass_rate": self.calc_pass_rate(results),
            },
            "agent_metrics": results.get("agent_metrics", {}),
            "performance_metrics": results.get("perf_metrics", {}),
            "visual_regression": results.get("visual", {}),
            "stability": results.get("stability", {}),
            "compatibility": results.get("compatibility", {}),
        }

        output_path = os.path.join(
            output_dir, f"test_report_{timestamp}.json"
        )
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # 生成 Markdown 摘要
        self.generate_markdown_summary(report, output_dir, timestamp)
        return output_path

    def generate_markdown_summary(
        self, report: dict, output_dir: str, timestamp: str
    ):
        summary = report["summary"]
        agent = report["agent_metrics"]
        perf = report["performance_metrics"]

        md = f"""# A2UI 自动化测试报告

**时间**: {timestamp}
**设备**: {report['meta']['device']}
**通过率**: {summary['pass_rate']:.1%}

## 测试结果

| 类别 | 通过 | 失败 |
|------|------|------|
| Agent 速度 | {agent.get('speed_pass', '-')} | {agent.get('speed_fail', '-')} |
| 视觉回归 | {report['visual'].get('pass', '-')} | {report['visual'].get('fail', '-')} |
| 稳定性 | {report['stability'].get('pass', '-')} | {report['stability'].get('fail', '-')} |
| 兼容性 | {report['compatibility'].get('pass', '-')} | {report['compatibility'].get('fail', '-')} |

## 性能指标

| 指标 | 实测 | 目标 | 状态 |
|------|------|------|------|
| Agent 响应 (avg) | {perf.get('agent_avg', '-')}s | < 3s | {'✅' if perf.get('agent_avg', 99) < 3 else '❌'} |
| 渲染帧时间 (p95) | {perf.get('frame_p95', '-')}ms | < 16ms | {'✅' if perf.get('frame_p95', 999) < 16 else '❌'} |
| Jank 率 | {perf.get('jank_rate', '-')}% | < 5% | {'✅' if perf.get('jank_rate', 100) < 5 else '❌'} |
| 内存增长 | {perf.get('mem_growth', '-')}MB | < 50MB | {'✅' if perf.get('mem_growth', 999) < 50 else '❌'} |
"""
        md_path = os.path.join(
            output_dir, f"test_summary_{timestamp}.md"
        )
        with open(md_path, "w") as f:
            f.write(md)
```

---

## 5. 测试覆盖率目标

### 5.1 金字塔分层覆盖

```
          ╱ ╲
         ╱ E2E ╲        ← 100% 关键路径覆盖
        ╱───────╲
       ╱  UI测试  ╲      ← 90% 核心交互覆盖
      ╱─────────────╲
     ╱  集成测试     ╲   ← 85% 数据层交互覆盖
    ╱─────────────────╲
   ╱    单元测试        ╲  ← 80% 逻辑覆盖
  ╱─────────────────────╲
```

### 5.2 A2UI 专项覆盖率矩阵

| 测试类别 | 覆盖目标 | 测试数量 | 优先级 |
|---------|---------|---------|--------|
| **Agent 生成速度** | 100% 核心场景 | ≥ 5 场景 | P0 |
| **多 Agent 协作** | 90% 协作模式 | ≥ 8 场景 | P0 |
| **视觉回归** | 100% 核心页面 | ≥ 15 页面 | P0 |
| **性能基准** | 100% 指标基线 | ≥ 6 指标 | P0 |
| **稳定性** | 100% 长会话 | ≥ 3 测试 | P1 |
| **兼容性** | 80% 屏幕配置 | ≥ 7 配置 | P1 |
| **错误恢复** | 100% 错误类型 | ≥ 5 类型 | P1 |
| **无障碍** | WCAG AA 合规 | ≥ 10 检查 | P2 |

### 5.3 代码覆盖率目标

| 层级 | 覆盖率 | 工具 |
|------|--------|------|
| ViewModel 逻辑 | ≥ 90% | JaCoCo |
| Data Layer (Repo/Dao) | ≥ 80% | JaCoCo + Room |
| UI 层 (Composable) | ≥ 70% | Roborazzi + Compose Test |
| Agent 引擎逻辑 | ≥ 85% | 单元测试 + Mock |
| ADB 自动化脚本 | ≥ 80% | pytest + unittest |

---

## 6. 性能基准线建议

### 6.1 Agent 响应时间

| 场景 | 目标 (avg) | 目标 (p95) | 测试方法 |
|------|-----------|-----------|---------|
| 简单列表 (10 项) | < 2s | < 3s | 5 次重复取平均 |
| 复杂表单 (20 字段) | < 3s | < 4s | 5 次重复取平均 |
| 仪表盘 (图表+卡片) | < 4s | < 5s | 5 次重复取平均 |
| 详情页 (嵌套卡片) | < 3s | < 4s | 5 次重复取平均 |
| 空状态页面 | < 1.5s | < 2s | 5 次重复取平均 |
| 错误状态页面 | < 1.5s | < 2s | 5 次重复取平均 |

### 6.2 UI 渲染性能

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 首帧渲染时间 | < 500ms | gfxinfo |
| 平均帧间隔 | < 16ms (≥60fps) | gfxinfo framestats |
| Jank 帧比例 | < 5% | gfxinfo framestats |
| 大 Jank (>32ms) | < 1% | gfxinfo framestats |
| 页面切换动画 FPS | ≥ 60fps | perfetto / gfxinfo |

### 6.3 资源占用

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 基础内存占用 | < 200MB | dumpsys meminfo |
| 操作后内存增长 | < 50MB / 10 轮 | dumpsys meminfo |
| 50 轮后内存增长 | < 80MB | dumpsys meminfo |
| CPU 峰值 | < 30% | top / simpleperf |
| 后台 CPU | < 5% | top |
| 电量消耗 (1h) | < 15% | dumpsys batterystats |

### 6.4 稳定性指标

| 指标 | 目标值 | 测试条件 |
|------|--------|---------|
| 连续操作无崩溃 | 100% | 50 轮连续 Agent 指令 |
| 配置变更存活 | 100% | 10 次屏幕旋转 |
| 后台恢复成功率 | 100% | 20 次后台/前台切换 |
| 异常输入处理 | 100% | 20 条恶意/格式指令 |
| ANR 发生率 | 0% | 压力测试 30min |

---

## 7. 测试脚本示例

### 7.1 Python：A2UI 测试运行器（完整示例）

```python
#!/usr/bin/env python3
"""
A2UI Test Runner - 主测试入口

Usage:
    python run_a2ui_tests.py                    # 运行全部测试
    python run_a2ui_tests.py --suite agent       # 仅运行 Agent 测试
    python run_a2ui_tests.py --suite visual      # 仅运行视觉回归
    python run_a2ui_tests.py --baseline          # 录制基线
    python run_a2ui_tests.py --ci               # CI 模式
"""

import argparse
import json
import os
import shutil
import sys
import time
import traceback
from datetime import datetime
from pathlib import Path

# 复用现有脚本模块
sys.path.insert(0, os.path.join(
    os.path.dirname(__file__), "android-emulator-skill", "scripts"
))
from common import (
    resolve_serial,
    run_adb_command,
    get_screen_size,
)

class A2UITestRunner:
    """A2UI 自动化测试运行器"""

    PACKAGE = "com.a2ui.app"
    TEST_DIR = Path("test")
    SCREENSHOT_DIR = TEST_DIR / "screenshots"
    BASELINE_DIR = TEST_DIR / "baselines"
    DIFF_DIR = TEST_DIR / "diff"
    LOG_DIR = TEST_DIR / "logs"
    REPORTS_DIR = TEST_DIR / "reports"

    def __init__(self, serial=None, ci_mode=False):
        self.serial = serial or resolve_serial()
        self.ci_mode = ci_mode
        self.results = {
            "tests": [],
            "agent_metrics": {},
            "perf_metrics": {},
            "visual": {},
            "stability": {},
            "compatibility": {},
            "total_duration": 0,
        }
        self._ensure_dirs()

    def _ensure_dirs(self):
        for d in [
            self.TEST_DIR, self.SCREENSHOT_DIR,
            self.BASELINE_DIR, self.DIFF_DIR,
            self.LOG_DIR, self.REPORTS_DIR
        ]:
            d.mkdir(parents=True, exist_ok=True)

    # ========== 设备操作基元 ==========

    def shell(self, *args):
        return run_adb_command(
            ["shell"] + list(args), serial=self.serial
        )

    def tap(self, x, y):
        self.shell("input", "tap", str(x), str(y))

    def swipe(self, x1, y1, x2, y2, duration=300):
        self.shell(
            "input", "swipe",
            str(x1), str(y1), str(x2), str(y2), str(duration)
        )

    def input_text(self, text):
        self.shell("input", "text", text)

    def press_key(self, keycode):
        self.shell("input", "keyevent", str(keycode))

    def launch_app(self):
        run_adb_command(
            ["shell", "am", "force-stop", self.PACKAGE],
            serial=self.serial, check=False
        )
        run_adb_command(
            [
                "shell", "monkey", "-p", self.PACKAGE,
                "-c", "android.intent.category.LAUNCHER", "1"
            ],
            serial=self.serial
        )
        time.sleep(2)

    def take_screenshot(self, name):
        path = self.SCREENSHOT_DIR / f"{name}.png"
        run_adb_command(
            ["shell", "screencap", "-p", "/sdcard/screen.png"],
            serial=self.serial
        )
        run_adb_command(
            ["pull", "/sdcard/screen.png", str(path)],
            serial=self.serial
        )
        return path

    def dump_ui(self):
        run_adb_command(
            ["shell", "uiautomator", "dump", "/sdcard/ui.xml"],
            serial=self.serial
        )
        return run_adb_command(
            ["pull", "/sdcard/ui.xml", str(self.LOG_DIR)],
            serial=self.serial
        )

    def get_memory_kb(self):
        result = self.shell("dumpsys", "meminfo", self.PACKAGE)
        for line in result.stdout.splitlines():
            if "TOTAL PSS:" in line:
                return int(line.split()[-1])
        return 0

    def get_frame_stats(self):
        result = self.shell(
            "dumpsys", "gfxinfo", self.PACKAGE, "framestats"
        )
        return result.stdout

    # ========== Agent 指令注入 ==========

    def inject_agent_instruction(self, instruction: str):
        """
        通过 ADB 输入向 App 注入 Agent 指令。
        实际实现可能通过 Deep Link、Broadcast 或 Activity 启动。
        """
        # 方式 1: 文本输入（需要 App 有输入框）
        self.tap(540, 2000)  # 点击输入框
        time.sleep(0.3)
        self.input_text(instruction)
        time.sleep(0.2)
        self.press_key(66)  # KEYCODE_ENTER

        # 方式 2: 通过 Deep Link 注入
        # run_adb_command(["shell", "am", "start", "-a",
        #     "android.intent.action.VIEW", "-d",
        #     f"a2ui://agent/instruct?prompt={instruction}"])

    def wait_for_compose_first_frame(self, timeout=10):
        """等待 Compose 首帧渲染信号"""
        start = time.time()
        while time.time() - start < timeout:
            try:
                result = run_adb_command(
                    [
                        "shell", "logcat", "-d", "-s",
                        "Compose", "-t", "1"
                    ],
                    serial=self.serial, check=False
                )
                if "FirstFrame" in result.stdout:
                    return True
            except Exception:
                pass
            time.sleep(0.5)
        return False

    # ========== 视觉对比 ==========

    def compare_screenshots(self, name, threshold=0.95):
        """截图与基线对比"""
        try:
            from PIL import Image, ImageChops
        except ImportError:
            self.log("Pillow not installed, skipping visual comparison")
            return True

        baseline = self.BASELINE_DIR / f"{name}.png"
        current = self.SCREENSHOT_DIR / f"{name}.png"

        if not baseline.exists():
            self.take_screenshot(name)
            shutil.copy(current, baseline)
            return True

        self.take_screenshot(name)

        try:
            b = Image.open(baseline).convert("RGBA")
            c = Image.open(current).convert("RGBA")
            if b.size != c.size:
                c = c.resize(b.size, Image.LANCZOS)

            diff = ImageChops.difference(b, c)
            bbox = diff.getbbox()

            if bbox is None:
                return True

            total = b.size[0] * b.size[1]
            diff_pixels = sum(
                1 for px in diff.getdata() if sum(px[:3]) > 30
            )
            similarity = 1.0 - (diff_pixels / total)

            if similarity < threshold:
                diff_path = self.DIFF_DIR / f"{name}_diff.png"
                diff.save(diff_path)
                self.add_result(
                    "visual_regression", False,
                    f"{name}: similarity={similarity:.1%} "
                    f"< {threshold:.0%}"
                )
                return False
            return True
        except Exception as e:
            self.log(f"Comparison error: {e}")
            return True

    # ========== 测试执行 ==========

    def run_agent_speed_tests(self):
        """Agent 响应速度测试套件"""
        scenarios = [
            ("simple_list", "生成一个包含 10 条数据的列表页面"),
            ("complex_form", "生成包含 20 个字段的表单页面"),
            ("dashboard", "生成包含图表的仪表盘页面"),
            ("detail_page", "生成包含嵌套卡片的详情页面"),
            ("empty_state", "生成空状态页面"),
        ]

        for name, instruction in scenarios:
            durations = []
            for i in range(3):
                self.log(f"  Agent test: {name} (run {i+1}/3)")
                self.launch_app()
                run_adb_command(
                    ["logcat", "-c"], serial=self.serial
                )

                start = time.time()
                self.inject_agent_instruction(instruction)
                self.wait_for_compose_first_frame(timeout=15)
                elapsed = time.time() - start
                durations.append(elapsed)

            avg = sum(durations) / len(durations)
            self.results["agent_metrics"][name] = {
                "avg_seconds": round(avg, 2),
                "p95_seconds": round(sorted(durations)[-1], 2),
                "target_seconds": 3.0,
                "passed": avg < 3.0,
            }
            self.add_result(
                f"agent_speed_{name}",
                avg < 3.0,
                f"avg={avg:.2f}s"
            )

    def run_visual_tests(self):
        """视觉回归测试套件"""
        self.launch_app()
        time.sleep(3)

        screens = [
            "home_screen", "agent_input",
            "generated_list", "generated_form",
            "generated_dashboard", "empty_state",
            "error_state",
        ]

        visual_results = {"pass": 0, "fail": 0}
        for screen in screens:
            self.log(f"  Visual test: {screen}")
            passed = self.compare_screenshots(screen)
            if passed:
                visual_results["pass"] += 1
            else:
                visual_results["fail"] += 1

        self.results["visual"] = visual_results

    def run_performance_tests(self):
        """性能基准测试套件"""
        self.launch_app()
        time.sleep(2)

        # 帧率采样
        self.inject_agent_instruction("生成复杂动画页面")
        time.sleep(3)
        self.swipe(540, 1800, 540, 600, 500)
        time.sleep(1)

        framestats = self.get_frame_stats()
        # 解析 framestats 计算 Jank
        perf = self._analyze_framestats(framestats)

        # 内存采样
        baseline_mem = self.get_memory_kb()
        for _ in range(10):
            self.inject_agent_instruction("生成新页面")
            time.sleep(2)
        peak_mem = self.get_memory_kb()

        perf["memory_growth_mb"] = round(
            (peak_mem - baseline_mem) / 1024, 1
        )
        perf["memory_pass"] = perf["memory_growth_mb"] < 50
        self.results["perf_metrics"] = perf

        self.add_result(
            "perf_jank_rate",
            perf.get("jank_rate", 1) < 0.05,
            f"jank={perf.get('jank_rate', 0):.2%}"
        )
        self.add_result(
            "perf_memory",
            perf["memory_pass"],
            f"growth={perf['memory_growth_mb']}MB"
        )

    def run_stability_tests(self):
        """稳定性测试套件"""
        self.launch_app()

        # 长会话测试
        initial_mem = self.get_memory_kb()
        for i in range(20):
            self.inject_agent_instruction(f"生成第 {i} 个页面")
            time.sleep(2)

        final_mem = self.get_memory_kb()
        growth_mb = round((final_mem - initial_mem) / 1024, 1)

        stability = {
            "memory_growth_mb": growth_mb,
            "memory_pass": growth_mb < 50,
            "rounds_completed": 20,
            "no_crash": True,
        }

        self.results["stability"] = stability
        self.add_result(
            "stability_memory",
            stability["memory_pass"],
            f"growth={growth_mb}MB after 20 rounds"
        )

    # ========== 辅助方法 ==========

    def _analyze_framestats(self, framestats_text):
        """解析 gfxinfo framestats"""
        frame_lines = [
            l for l in framestats_text.splitlines()
            if "Draw" in l and "VSync" in l
        ]
        if not frame_lines:
            return {"jank_rate": 0, "frame_count": 0}

        frame_times = []
        for line in frame_lines:
            parts = line.split()
            try:
                vsync = float(parts[1]) if len(parts) > 1 else 0
                draw = float(parts[3]) if len(parts) > 3 else 0
                duration = draw - vsync
                frame_times.append(duration)
            except (ValueError, IndexError):
                continue

        jank_count = sum(1 for t in frame_times if t > 16.67)
        total = len(frame_times)
        return {
            "frame_count": total,
            "jank_count": jank_count,
            "jank_rate": jank_count / total if total > 0 else 0,
            "avg_frame_ms": round(
                sum(frame_times) / total, 2
            ) if total > 0 else 0,
            "p95_frame_ms": round(
                sorted(frame_times)[int(total * 0.95)]
                if total > 0 else 0, 2
            ),
        }

    def add_result(self, name, passed, detail=""):
        self.results["tests"].append({
            "name": name,
            "passed": passed,
            "detail": detail,
            "timestamp": datetime.now().isoformat(),
        })
        status = "✅" if passed else "❌"
        self.log(f"  {status} {name}: {detail}")

    def log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {msg}")

    def generate_report(self):
        report_path = self.REPORTS_DIR / f"report_{datetime.now():%Y%m%d_%H%M%S}.json"
        with open(report_path, "w") as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        self.log(f"Report: {report_path}")

        passed = sum(
            1 for t in self.results["tests"] if t["passed"]
        )
        total = len(self.results["tests"])
        rate = passed / total if total > 0 else 0
        self.log(f"Results: {passed}/{total} passed ({rate:.1%})")
        return rate >= 0.95  # 95% 通过线

    # ========== 主入口 ==========

    def run(self, suites=None):
        """运行指定测试套件"""
        suites = suites or [
            "agent", "visual", "performance", "stability"
        ]
        self.log(f"Starting A2UI tests on {self.serial}")
        start = time.time()

        try:
            if "agent" in suites:
                self.log("=== Agent Speed Tests ===")
                self.run_agent_speed_tests()

            if "visual" in suites:
                self.log("=== Visual Regression Tests ===")
                self.run_visual_tests()

            if "performance" in suites:
                self.log("=== Performance Benchmarks ===")
                self.run_performance_tests()

            if "stability" in suites:
                self.log("=== Stability Tests ===")
                self.run_stability_tests()

        except Exception as e:
            self.log(f"Test error: {e}")
            traceback.print_exc()

        self.results["total_duration"] = round(time.time() - start, 1)
        return self.generate_report()


def main():
    parser = argparse.ArgumentParser(description="A2UI Test Runner")
    parser.add_argument(
        "--suite", nargs="+",
        choices=["agent", "visual", "performance", "stability", "compat"],
        help="Test suites to run"
    )
    parser.add_argument(
        "--baseline", action="store_true",
        help="Record visual baselines instead of testing"
    )
    parser.add_argument(
        "--ci", action="store_true",
        help="CI mode (non-interactive)"
    )
    parser.add_argument(
        "--serial", "-s",
        help="Target device serial"
    )

    args = parser.parse_args()

    runner = A2UITestRunner(
        serial=args.serial, ci_mode=args.ci
    )

    if args.baseline:
        runner.log("Recording visual baselines...")
        runner.launch_app()
        time.sleep(3)
        for screen in [
            "home_screen", "agent_input",
            "generated_list", "generated_form",
            "empty_state", "error_state",
        ]:
            path = runner.take_screenshot(screen)
            shutil.copy(path, runner.BASELINE_DIR / f"{screen}.png")
            runner.log(f"  Baseline: {screen}")
        runner.log("Baselines recorded")
        return

    passed = runner.run(suites=args.suite)
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
```

### 7.2 Shell：Emulator 快照测试流程

```bash
#!/bin/bash
# scripts/snapshot_test_flow.sh
# 使用 Emulator 快照进行快速回归测试

set -euo pipefail

AVD_NAME="Pixel_6_API_34"
SNAPSHOT_NAME="a2ui-clean-state"
PACKAGE="com.a2ui.app"

log() { echo "[$(date +'%H:%M:%S')] $*"; }

# ========== 阶段 1：准备快照 ==========
prepare_snapshot() {
    log "Phase 1: Preparing snapshot..."

    # 1.1 启动模拟器（不加载旧快照）
    emulator -avd "$AVD_NAME" -no-snapshot-load &
    local emu_pid=$!
    log "Waiting for emulator..."
    adb wait-for-device
    while [ "$(adb shell getprop sys.boot_completed)" != "1" ]; do
        sleep 1
    done

    # 1.2 安装并启动 App
    adb install -r app-debug.apk
    adb shell monkey -p "$PACKAGE" \
        -c android.intent.category.LAUNCHER 1
    sleep 3

    # 1.3 清理状态
    adb shell pm clear "$PACKAGE"
    adb shell am force-stop "$PACKAGE"

    # 1.4 保存快照
    adb emu avd snapshot save "$SNAPSHOT_NAME"
    log "Snapshot '$SNAPSHOT_NAME' saved"

    # 1.5 关闭模拟器
    adb emu kill
    wait $emu_pid 2>/dev/null || true
    log "Snapshot ready for quick testing"
}

# ========== 阶段 2：快速回归测试 ==========
run_from_snapshot() {
    local test_round=$1
    log "Phase 2: Test round $test_round from snapshot..."

    # 2.1 从快照快速启动
    emulator -avd "$AVD_NAME" -no-boot-anim &
    local emu_pid=$!
    adb wait-for-device
    log "Emulator started from snapshot"

    # 2.2 启动 App
    adb shell monkey -p "$PACKAGE" \
        -c android.intent.category.LAUNCHER 1
    sleep 2

    # 2.3 执行测试步骤
    log "Running test scenario..."
    adb logcat -c

    # 点击 Agent 入口
    local wm_size=$(adb shell wm size | grep -oP '\d+x\d+')
    local width=${wm_size%x*}
    local height=${wm_size#*x}
    local cx=$((width / 2))
    local cy=$((height / 2))

    # 测试用例 1: 简单列表
    adb shell input tap "$cx" "$((cy - 200))"
    sleep 0.3
    adb shell input text "生成 10 条订单列表"
    adb shell input keyevent 66
    sleep 3
    adb exec-out screencap -p > "round${test_round}_list.png"
    adb shell uiautomator dump /sdcard/ui_list.xml
    adb pull /sdcard/ui_list.xml "round${test_round}_list.xml"

    # 测试用例 2: 表单
    adb shell input keyevent 4  # KEYCODE_BACK
    sleep 0.5
    adb shell input text "生成用户注册表单"
    adb shell input keyevent 66
    sleep 3
    adb exec-out screencap -p > "round${test_round}_form.png"

    # 测试用例 3: 仪表盘
    adb shell input keyevent 4
    sleep 0.5
    adb shell input text "生成销售数据仪表盘"
    adb shell input keyevent 66
    sleep 4
    adb exec-out screencap -p > "round${test_round}_dashboard.png"

    # 2.4 收集日志
    adb logcat -d -s "A2UI:*" "Agent:*" \
        > "round${test_round}_logs.txt" 2>&1

    # 2.5 检查错误
    local errors=$(adb logcat -d '*:E' | wc -l)
    if [ "$errors" -gt 10 ]; then
        log "WARNING: $errors error entries found"
    else
        log "No significant errors"
    fi

    # 2.6 关闭并恢复快照
    adb emu kill
    wait $emu_pid 2>/dev/null || true
    log "Test round $test_round complete"
}

# ========== 主流程 ==========
main() {
    local action=${1:-"test"}

    case "$action" in
        prepare)
            prepare_snapshot
            ;;
        test)
            local rounds=${2:-1}
            for i in $(seq 1 "$rounds"); do
                run_from_snapshot "$i"
            done
            ;;
        full)
            prepare_snapshot
            run_from_snapshot 1
            ;;
        *)
            echo "Usage: $0 {prepare|test|full}"
            echo "  prepare  - 创建快照"
            echo "  test [N] - 从快照运行 N 轮测试"
            echo "  full     - 创建快照并运行一轮测试"
            exit 1
            ;;
    esac
}

main "$@"
```

### 7.3 Kotlin：Instrumented 性能测试

```kotlin
// app/src/androidTest/java/com/a2ui/PerformanceBenchmarkTest.kt
@RunWith(AndroidJUnit4::class)
class PerformanceBenchmarkTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun measureAgentResponseTime() {
        val times = mutableListOf<Long>()

        repeat(5) {
            val start = SystemClock.elapsedRealtime()

            composeTestRule.onNodeWithText("Agent 入口").performClick()
            composeTestRule.onNodeWithText("输入指令").performTextInput(
                "生成用户订单列表"
            )
            composeTestRule.onNodeWithText("发送").performClick()

            composeTestRule.onNodeWithText("订单列表")
                .assertExists()

            val end = SystemClock.elapsedRealtime()
            times.add(end - start)

            composeTestRule.activity.runOnUiThread {
                composeTestRule.activity.recreate()
            }
        }

        val avg = times.average()
        val p95 = times.sorted().let {
            it[(it.size * 0.95).toInt()]
        }

        assertTrue(
            "Average agent response ${avg}ms exceeds 3000ms",
            avg < 3000
        )
        assertTrue(
            "P95 agent response ${p95}ms exceeds 4000ms",
            p95 < 4000
        )
    }

    @Test
    fun measureFrameJank() {
        val activity = composeTestRule.activity
        val metrics = activity.getInstrumentation()
            .uiAutomation

        composeTestRule.onNodeWithText("生成仪表盘").performClick()

        val startTime = SystemClock.elapsedRealtime()
        var frameCount = 0
        var jankCount = 0

        while (SystemClock.elapsedRealtime() - startTime < 5000) {
            val frameTime = SystemClock.elapsedRealtime()
            frameCount++
            if (frameTime % 16 > 0) {
                jankCount++
            }
        }

        val jankRate = jankCount.toFloat() / frameCount
        assertTrue(
            "Jank rate ${jankRate * 100}% exceeds 5%",
            jankRate < 0.05
        )
    }

    @Test
    fun measureMemoryStability() {
        val activity = composeTestRule.activity
        val runtime = Runtime.getRuntime()

        val initialMem = runtime.totalMemory() - runtime.freeMemory()

        repeat(20) {
            composeTestRule.onNodeWithText("生成新页面")
                .performClick()
            composeTestRule.waitForIdleSync()
        }

        val finalMem = runtime.totalMemory() - runtime.freeMemory()
        val growthMB = (finalMem - initialMem) / 1024 / 1024

        assertTrue(
            "Memory grew ${growthMB}MB after 20 iterations (threshold: 50MB)",
            growthMB < 50
        )
    }
}
```

---

## 附录

### A. 常用 ADB 命令速查表

| 操作 | 命令 |
|------|------|
| 设备列表 | `adb devices` |
| 安装 APK | `adb install -r <apk>` |
| 卸载 APK | `adb uninstall <package>` |
| 启动 App | `adb shell monkey -p <pkg> -c android.intent.category.LAUNCHER 1` |
| 停止 App | `adb shell am force-stop <package>` |
| 清空数据 | `adb shell pm clear <package>` |
| 点击坐标 | `adb shell input tap <x> <y>` |
| 滑动 | `adb shell input swipe <x1> <y1> <x2> <y2> <ms>` |
| 输入文本 | `adb shell input text "<text>"` |
| 按键 | `adb shell input keyevent <code>` |
| 截图 | `adb exec-out screencap -p > file.png` |
| UI dump | `adb shell uiautomator dump /sdcard/ui.xml` |
| 日志 | `adb logcat -s <tag>` |
| 内存 | `adb shell dumpsys meminfo <package>` |
| 帧率 | `adb shell dumpsys gfxinfo <package> framestats` |
| 快照保存 | `adb emu avd snapshot save <name>` |
| 快照恢复 | `adb emu avd snapshot load <name>` |
| 关模拟器 | `adb emu kill` |

### B. Keyevent 代码速查

| 事件 | Code |
|------|------|
| KEYCODE_HOME | 3 |
| KEYCODE_BACK | 4 |
| KEYCODE_ENTER | 66 |
| KEYCODE_TAB | 61 |
| KEYCODE_DEL | 67 |
| KEYCODE_POWER | 26 |
| KEYCODE_NOTIFICATION | 82 |
| KEYCODE_WAKEUP | 224 |

### C. 推荐文件结构

```
project/
├── .github/workflows/
│   └── a2ui-test.yml              # CI 工作流
├── scripts/
│   ├── run_a2ui_tests.py          # Python 测试运行器
│   ├── ci_test_runner.sh          # Shell CI 入口
│   ├── snapshot_test_flow.sh      # 快照测试流程
│   ├── test_report_generator.py  # 报告生成
│   └── visual_regression.py       # 视觉回归独立脚本
├── test/
│   ├── baselines/                 # 基线截图
│   ├── current/                   # 当前截图
│   ├── diff/                      # 差异截图
│   ├── logs/                      # 日志采集
│   ├── reports/                   # 测试报告
│   └── configs/
│       └── benchmark_scenarios.json
└── app/src/androidTest/
    └── java/com/a2ui/
        └── PerformanceBenchmarkTest.kt
```