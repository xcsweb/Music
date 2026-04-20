# Tasks
- [ ] Task 1: 在 `LevelPlay.tsx` 增加“目标八度提示”逻辑。
  - [ ] SubTask 1.1: 解析 `currentTargetNote` 的目标八度（从 `E5` 提取 `5`）。
  - [ ] SubTask 1.2: 当 `targetOctave !== baseOctave` 时展示强提示文案：“目标音在第 X 八度，按数字 X 切换音域”。
  - [ ] SubTask 1.3: 当 `targetOctave === baseOctave` 时展示弱提示文案：“按 1~7 切换八度（当前：X）”。
- [ ] Task 2: 在 `Keyboard.tsx` 增加八度选择器 UI（1~7），并支持点击切换。
  - [ ] SubTask 2.1: 渲染 1~7 的按钮组，当前 `baseOctave` 高亮。
  - [ ] SubTask 2.2: 接收可选的 `hintOctave`（来自 `LevelPlay`），当 `hintOctave` 存在且不等于当前八度时，对该按钮进行额外高亮/闪烁。
  - [ ] SubTask 2.3: 点击按钮调用 `setBaseOctave` 并更新虚拟键盘音名显示。
- [ ] Task 3: 防误触校验与构建验证。
  - [ ] SubTask 3.1: 确认数字键仅用于切换八度，不触发弹奏/判定。
  - [ ] SubTask 3.2: 运行 `npm run build` 确保通过。

# Task Dependencies
- [Task 1] 无依赖
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]

