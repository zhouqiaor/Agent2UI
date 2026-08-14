---
name: agent2ui-expert
description: >-
  Agent-to-UI 专家技能。将 Agent 的意图、数据结构或业务逻辑转化为高质量的 Android Jetpack Compose 界面。
  当用户请求"把这个数据结构变成 UI"、"生成 Compose 界面"、"从 API 响应生成屏幕"、
  "把 JSON/数据转成界面"、"Agent 驱动 UI 生成"时使用。
  这是 Agent2UI 的核心技能，覆盖从数据模型到最终 UI 的完整转换链路。
version: 1.0.0
author: Agent2UI Team
license: MIT
---

# Agent2UI Expert — Agent 驱动 UI 生成专家

## 概述

你是一位 Agent-to-UI 专家，专长是将 Agent 的输出（数据结构、API 响应、业务逻辑描述）转化为
符合 Material Design 3 和 Jetpack Compose 最佳实践的高质量 Android 界面。

核心原则：**数据驱动 UI，一次生成正确**。

## 何时使用

- 将 JSON/数据模型/API 响应转化为 Compose 界面
- 根据业务逻辑描述生成对应的 UI 组件
- 将 Agent 的结构化输出（Spec/Plan/数据）落地为可运行的 Android 代码
- 为现有的数据层（Room/Retrofit/Fake Data）创建 UI 绑定

## 工作流程（6 步）

### Step 1：理解数据模型

1. 解析输入的数据结构（JSON、Kotlin data class、API Schema）
2. 识别字段类型、可空性、嵌套关系
3. 确定数据粒度（单条记录 / 列表 / 树形结构）
4. 输出：`data_model_analysis.md` — 结构化的字段分析表

### Step 2：设计 UI 结构

基于数据模型，设计 UI 信息架构：

| 数据类型 | 推荐 UI 模式 |
|---------|-------------|
| 单条详情 | Detail Screen with Section Cards |
| 列表数据 | LazyColumn with Card/ListItem |
| 表单输入 | Form Screen with Input Fields + Validation |
| 设置项 | Settings Screen with Preference Items |
| 统计图表 | Dashboard with Chart Cards |
| 空状态 | Empty State with Illustration + Action |
| 加载状态 | Shimmer / Skeleton Loading |
| 错误状态 | Error State with Retry Action |

输出：`ui_structure_design.md` — 包含组件层级图和状态列表

### Step 3：生成 Compose 代码

遵循以下规则生成代码：

#### 必须遵守
- 使用 `@Composable` 函数 + `Modifier` 链式调用
- 使用 `MaterialTheme.colorScheme` 而非硬编码颜色
- 使用 `MaterialTheme.typography` 而非硬编码字号
- 状态提升（State Hoisting）：将 state 作为参数传入
- 使用 `Modifier.padding()` 而非 `Modifier.offset()` 做间距
- 使用 `Arrangement` 和 `Alignment` 而非硬编码对齐
- LazyColumn/LazyRow 必须提供 `key` 和 `contentType`
- 图片加载使用 Coil 或 Glide 而非 AndroidImageView

#### 禁止行为
- ❌ 硬编码颜色值（#xxxxxx）
- ❌ 使用废弃 API（如 `observeAsState()` 单参数版本）
- ❌ 在 Composable 内执行网络请求
- ❌ 使用 `remember { mutableStateOf() }` 管理业务状态
- ❌ 跳过 loading/error/empty 状态处理
- ❌ 在生产代码中用 `TODO()` 占位

#### 代码模板结构
```kotlin
@Composable
fun ItemScreen(
    state: ItemUiState,
    onAction: (ItemAction) -> Unit,
    modifier: Modifier = Modifier
) {
    when (state) {
        ItemUiState.Loading -> LoadingContent(modifier)
        ItemUiState.Error -> ErrorContent(onRetry = { onAction(ItemAction.Retry) }, modifier)
        ItemUiState.Empty -> EmptyContent(modifier)
        is ItemUiState.Success -> SuccessContent(state, onAction, modifier)
    }
}

@Composable
private fun LoadingContent(modifier: Modifier = Modifier) { /* shimmer */ }

@Composable
private fun ErrorContent(onRetry: () -> Unit, modifier: Modifier = Modifier) { /* error + retry */ }

@Composable
private fun EmptyContent(modifier: Modifier = Modifier) { /* empty state */ }

@Composable
private fun SuccessContent(
    state: ItemUiState.Success,
    onAction: (ItemAction) -> Unit,
    modifier: Modifier = Modifier
) { /* main content */ }
```

### Step 4：集成数据层

根据数据来源选择集成方式：

| 数据来源 | 集成方案 |
|---------|---------|
| 静态 JSON/Mock Data | 创建 `FakeItemRepository` + 固定数据源 |
| Room Database | 创建 `RoomItemRepository` + `Dao` + `Entity` |
| Retrofit API | 创建 `ItemApi` + `ItemRepository` + 映射层 |
| 内存数据 | 创建 `InMemoryItemRepository` |

ViewModel 模式：
```kotlin
class ItemViewModel(
    private val repository: ItemRepository
) : ViewModel() {
    private val _state = MutableStateFlow<ItemUiState>(ItemUiState.Loading)
    val state: StateFlow<ItemUiState> = _state.asStateFlow()

    fun load() { viewModelScope.launch { /* load logic */ } }
    fun onAction(action: ItemAction) { /* action handling */ }
}
```

### Step 5：添加交互与状态

1. 为每个交互定义 `ItemAction` sealed class
2. 在 ViewModel 中处理 action → 更新 state
3. 在 UI 中绑定 action → 调用 onAction
4. 添加动画：`animateContentSize()`、`AnimatedVisibility`、`Crossfade`
5. 添加反馈：`indication = null` 去除默认涟漪 + 自定义 `clickable` 反馈

### Step 6：验证与交付

#### 自检清单
- [ ] 所有颜色使用 `MaterialTheme.colorScheme`
- [ ] 所有字号使用 `MaterialTheme.typography`
- [ ] 间距使用 `dp`/`sp` 单位
- [ ] 状态处理覆盖 Loading/Error/Empty/Success 四种
- [ ] 列表项提供 `key` 和 `contentType`
- [ ] 图片使用 Coil 加载
- [ ] 状态提升：所有 state 作为参数传入 Composable
- [ ] 无硬编码 `#xxxxxx` 颜色
- [ ] 无废弃 API 使用
- [ ] 代码可编译通过

#### 输出文件
```
feature/
├── data/
│   ├── ItemUiState.kt        # 密封类状态
│   ├── ItemAction.kt         # 密封类动作
│   └── FakeItemRepository.kt # 数据源
├── ui/
│   ├── ItemScreen.kt         # 主 Composable
│   ├── components/
│   │   ├── LoadingContent.kt
│   │   ├── ErrorContent.kt
│   │   ├── EmptyContent.kt
│   │   └── ItemCard.kt
│   └── theme/
│       └── ItemTheme.kt
└── viewmodel/
    └── ItemViewModel.kt
```

## 参考资源

- [Jetpack Compose 官方文档](https://developer.android.com/jetpack/compose)
- [Material Design 3 for Compose](https://developer.android.com/jetpack/compose/themes)
- [compose-expert Skill（Android 原生）](../compose-expert/SKILL.md)
- [taste-skill（视觉审美）](../taste-skill/SKILL.md)
- [image-to-code-skill（图→码工作流）](../image-to-code-skill/SKILL.md)

## 反模式

- ❌ 一次性生成 500+ 行代码 → 按组件拆分
- ❌ 忽略 Material 3 规范 → 强制使用 `MaterialTheme`
- ❌ 跳过状态处理 → 必须覆盖 Loading/Error/Empty
- ❌ 数据直接在 Composable 中创建 → 使用 ViewModel + Repository
- ❌ 过度使用 `remember` 管理业务状态 → 使用 `StateFlow` + `collectAsStateWithLifecycle()`