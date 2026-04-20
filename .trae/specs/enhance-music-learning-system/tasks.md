# Tasks
- [x] Task 1: 更新关卡数据模型：修改 `src/data/levels.ts` 和相关的类型定义，支持 `requiredHits`、`sequence`、`maxErrors` 以及 `fallbackLevelId` 等属性，以表示多次重复、音符序列和测试失败后的回退关卡。
  - [x] SubTask 1.1: 在 `types` 或相关文件中更新 `Level` 接口，增加支持“教学”、“练习”、“回归测试”的类型标记
  - [x] SubTask 1.2: 重新设计初期关卡和回归测试关卡序列（例如：学习 C4 -> 练习 C4 5次 -> 学习 D4 -> 练习 D4 5次 -> 混合练习 -> 回归测试）
- [x] Task 2: 重构 `LevelPlay.tsx` 页面逻辑：适应新的关卡模型，要求用户完成多次正确按键或音符序列才能通关；并引入失败机制。
  - [x] SubTask 2.1: 在组件状态中添加 `currentHits`、`currentSequenceIndex` 以及 `errorCount`
  - [x] SubTask 2.2: 当用户按下正确按键时，更新进度；按下错误按键时，增加错误计数
  - [x] SubTask 2.3: 只有当 `currentHits` 达到 `requiredHits`，或序列全部完成时，才触发通关逻辑
  - [x] SubTask 2.4: 如果在回归测试或练习中，错误次数超过 `maxErrors`，则触发失败逻辑，重置并降级到指定的 `fallbackLevelId`
- [x] Task 3: 完善用户状态与进度存储：更新 Zustand 状态管理，允许降低最高已解锁关卡（如果需要强制回退），或在页面导航上强制引导用户前往指定的回退关卡。
- [x] Task 4: 增加关卡内进度与失败反馈 UI：在教学和测试界面显示进度和错误提示。
  - [x] SubTask 4.1: 实现轻量级的进度指示器（例如“已完成 1/5”）
  - [x] SubTask 4.2: 实现失败与重学的弹窗提示，明确告知用户测试未通过，需要重新学习
- [x] Task 5: 测试与验证：验证整个学习、测试与回退闭环是否符合预期。
  - [x] SubTask 5.1: 验证连续输入 C4 5 次的通关逻辑
  - [x] SubTask 5.2: 验证混合序列（如 C-D-C-D）的通关逻辑
  - [x] SubTask 5.3: 验证回归测试失败后，成功回退至之前的学习关卡并重新打卡练习
  - [x] SubTask 5.4: 验证旧有关卡在新的接口定义下依然正常运行

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 2, Task 3]
- [Task 5] depends on [Task 1, Task 2, Task 3, Task 4]