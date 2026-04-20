# Tasks
- [x] Task 1: 扩展关卡数据模型，新增 `ear_training` 类型并补齐听音训练所需配置。
  - [x] SubTask 1.1: 在 `src/store/useStore.ts` 的 `Level.type` 中加入 `ear_training`。
  - [x] SubTask 1.2: 为 `ear_training` 增加配置字段（建议）：`notePool`, `rounds`, `replayLimit`, `requiredCorrectStreak`（训练通过条件）。
- [x] Task 2: 调整关卡编排：为每个歌曲前插入“听音训练 + 听写闸门”并设置回退链路。
  - [x] SubTask 2.1: 在 `src/data/levels.ts` 中，为小星星前增加 1 个 `ear_training` + 1 个 `ear_dictation`。
  - [x] SubTask 2.2: 将 `ear_dictation.fallbackLevelId` 指向对应的 `ear_training` 起点（而不是键位练习关）。
  - [x] SubTask 2.3: 若涉及 ID 变化，修正引用与解锁链路。
- [x] Task 3: 实现 `ear_training` 的玩法与 UI（`LevelPlay.tsx`）。
  - [x] SubTask 3.1: 播放按钮与高回放上限；训练态允许显示答案或“更高/更低”的提示。
  - [x] SubTask 3.2: 按 `requiredCorrectStreak` 或 `rounds` 判断训练通关。
- [x] Task 4: 复用/调整 `ear_dictation`：失败时自动跳转到听音训练起点。
  - [x] SubTask 4.1: 确认失败文案与自动回退逻辑符合“回到听音训练”。
- [x] Task 5: UI 标签适配与验证。
  - [x] SubTask 5.1: `LevelCard.tsx` 增加 `ear_training` 标签（如“听音训练”）。
  - [x] SubTask 5.2: 运行 `npm run build` 并验证完整链路：练习 -> 听音训练 -> 听写 -> 歌曲；听写失败 -> 听音训练。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 1, Task 2, Task 3, Task 4]

