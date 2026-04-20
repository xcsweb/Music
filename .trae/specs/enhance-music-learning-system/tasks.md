# Tasks
- [ ] Task 1: 更新关卡数据模型：修改 `src/data/levels.ts` 和相关的类型定义，支持 `requiredHits` 或 `sequence` 等属性，以表示多次重复或音符序列。
  - [ ] SubTask 1.1: 在 `types` 或相关文件中更新 `Level` 接口
  - [ ] SubTask 1.2: 重新设计基础关卡（学习 C4、练习 C4、学习 D4、混合练习 C4 和 D4 等），使其符合系统化的音乐教学逻辑
- [ ] Task 2: 重构 `LevelPlay.tsx` 页面逻辑：适应新的关卡模型，要求用户完成多次正确按键或音符序列才能通关。
  - [ ] SubTask 2.1: 在组件状态中添加 `currentHits` 或 `currentSequenceIndex`
  - [ ] SubTask 2.2: 当用户按下正确按键时，更新进度，而不是直接通关
  - [ ] SubTask 2.3: 只有当 `currentHits` 达到 `requiredHits`，或序列全部完成时，才触发通关逻辑（显示结算弹窗）
- [ ] Task 3: 增加关卡内进度反馈 UI：在教学和测试界面显示用户当前完成的次数或序列进度（例如进度条或数字指示）。
  - [ ] SubTask 3.1: 设计并实现一个轻量级的进度条组件或指示器
  - [ ] SubTask 3.2: 在 `LevelPlay.tsx` 中集成该指示器
- [ ] Task 4: 测试与验证：确保基础教学的难度上升曲线平滑，单音练习和混合序列练习能顺利通关，并且中途退出或失败时的状态管理正确。
  - [ ] SubTask 4.1: 验证连续输入 C4 5 次的通关逻辑
  - [ ] SubTask 4.2: 验证混合序列（如 C-D-C-D）的通关逻辑
  - [ ] SubTask 4.3: 验证旧有关卡（如游戏模式、多音模式）在新的接口定义下依然正常运行

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 1, Task 2, Task 3]