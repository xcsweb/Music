# Tasks
- [x] Task 1: 美化 `src/components/Keyboard.tsx` 键盘组件，移除所有的紫色/洋红 (`fuchsia`)，将其统一为蓝色/青蓝色调。
  - [x] SubTask 1.1: 寻找 `Keyboard.tsx` 中 `blackClasses` 定义。
  - [x] SubTask 1.2: 将默认状态下的 `border-fuchsia-500/50` 替换为深蓝或青色系，如 `border-cyan-700/60` 或 `border-gray-700`，保持黑键有黑键的质感。
  - [x] SubTask 1.3: 保留目标提示为红色的逻辑，保留按下后为绿色的逻辑，只修改“未按下、非目标”状态。
- [x] Task 2: 修复弹窗逻辑：更新 `src/data/levels.ts`，将所有学习和测试过程的关卡（如 `regression_test`，甚至一些简单的 `song`）的 `autoNext` 设为 `true`。
  - [x] SubTask 2.1: 将第 8, 14, 18 关等回归测试的 `autoNext` 改为 `true`。
  - [x] SubTask 2.2: （可选）将第 9, 15 关等简单曲目也改为 `autoNext: true`，只保留最终的第 19 关《小星星》为 `autoNext: false`。
- [x] Task 3: 优化弹窗本身样式：检查 `LevelPlay.tsx` 中结算弹窗的样式，使其看起来更干净、现代。

# Task Dependencies
- [Task 1] 无依赖
- [Task 2] 无依赖
- [Task 3] 无依赖