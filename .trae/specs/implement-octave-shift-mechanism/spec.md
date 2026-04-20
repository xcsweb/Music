# 钢琴键盘全音域支持 (八度切换机制) Spec

## Why
标准的钢琴键盘有 88 个琴键，而电脑键盘的按键数量有限。目前我们的虚拟键盘被硬编码在 C4 到 F5 的固定音域，这导致我们无法练习或弹奏包含更低音（如 C1, C2）或更高音（如 C6, C7）的曲目。为了突破物理按键的限制并支持全音域弹奏，我们需要引入“八度切换”机制：通过按下数字键（1~7）来动态改变当前键盘映射的基础八度。

## What Changes
- **动态音高映射**：重构 `src/utils/keyboardMap.ts`，将硬编码的音高（如 `C4`）改为基于当前“基础八度（Base Octave）”的相对计算。例如，如果基础八度为 1，按下 `A` 键发出的声音将是 `C1` 而不是 `C4`。
- **八度状态管理**：在全局状态或组件状态中增加 `baseOctave`（默认值为 4）。监听键盘上的数字键 `1` 到 `7`，按下对应的数字键即可将 `baseOctave` 切换为该数字。
- **UI 动态更新**：虚拟键盘上的音名标签（如原本固定显示 `C4`）将根据当前的 `baseOctave` 实时更新为真实的音名（如 `C1`）。
- **增加提示信息**：在界面上方或键盘上方增加一个指示器，提示用户“当前基础八度：4（按数字键 1~7 快速切换音域）”。

## Impact
- Affected specs: 键盘按键映射逻辑、虚拟键盘 UI 渲染、发声模块。
- Affected code: `src/utils/keyboardMap.ts`, `src/components/Keyboard.tsx`, `src/pages/LevelPlay.tsx`, `src/store/useStore.ts`（如需全局管理）。

## ADDED Requirements
### Requirement: 动态八度切换
系统必须支持通过按下数字键来实时改变键盘映射的音区。

#### Scenario: 切换到低音区
- **WHEN** 默认状态下，用户按下字母 `A`
- **THEN** 听到 `C4` 的声音。
- **WHEN** 用户按下数字键 `1`
- **THEN** 界面上的 `C4` 标签变为 `C1`。
- **WHEN** 用户再次按下字母 `A`
- **THEN** 听到 `C1` 的声音。

## MODIFIED Requirements
### Requirement: 虚拟键盘的按键渲染
虚拟键盘不能再写死 `C4`、`D4`。它的 `note` 属性必须是基于 `baseOctave` 动态计算的，以便正确显示并触发正确的音效。

## REMOVED Requirements
### Requirement: 固定音域映射
**Reason**: 限制了教学内容的扩展性和用户自由弹奏 88 键曲目的可能性。
**Migration**: 用相对音高和八度偏移量替代绝对音高。