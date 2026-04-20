# Tasks
- [ ] Task 1: 扩展关卡数据模型以支持 `ear_dictation` 类型。
  - [ ] SubTask 1.1: 在 `src/store/useStore.ts` 的 `Level.type` 中加入 `ear_dictation`。
  - [ ] SubTask 1.2: 为 `ear_dictation` 增加配置字段（建议）：`notePool: string[]`, `rounds: number`, `replayLimit: number`, `maxErrors?: number`, `fallbackLevelId?: number`。
- [ ] Task 2: 在 `src/data/levels.ts` 插入听写关卡作为所有 `song` 关卡的前置。
  - [ ] SubTask 2.1: 在“曲目挑战：小星星”前插入“听写：曲目前测”关卡。
  - [ ] SubTask 2.2: 为听写关卡配置 `notePool` 为当前已学音符集合（例如 `C4,D4,E4`，后续随课程扩展）。
  - [ ] SubTask 2.3: 处理 ID 顺延与 `fallbackLevelId` 引用修正（若有）。
- [ ] Task 3: 实现听写关卡游玩逻辑（`src/pages/LevelPlay.tsx`）。
  - [ ] SubTask 3.1: 增加播放控制：开始播放/再听一遍（受 `replayLimit` 限制）。
  - [ ] SubTask 3.2: 播放时隐藏答案音名；作答后给出正确/错误反馈。
  - [ ] SubTask 3.3: 轮次管理：正确进入下一轮；完成 `rounds` 次后通关并进入下一关。
  - [ ] SubTask 3.4: 失败处理：错误达到 `maxErrors` 时触发失败回退，自动跳转 `fallbackLevelId`。
- [ ] Task 4: UI 与关卡列表适配（可见性与标签）。
  - [ ] SubTask 4.1: 在 `src/components/LevelCard.tsx` 增加 `ear_dictation` 标签文案（“听写”）与配色。
  - [ ] SubTask 4.2: 在听写关卡中提供简短操作提示（“先听，再按键” / “可回放X次”）。
- [ ] Task 5: 验证与回归。
  - [ ] SubTask 5.1: 验证听写关卡能在曲目前正确出现，并能通关进入曲目。
  - [ ] SubTask 5.2: 验证回放次数限制与按钮状态正确。
  - [ ] SubTask 5.3: 验证失败回退逻辑正确执行且不会卡死。
  - [ ] SubTask 5.4: 运行 `npm run build` 通过。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 1]
- [Task 5] depends on [Task 1, Task 2, Task 3, Task 4]

