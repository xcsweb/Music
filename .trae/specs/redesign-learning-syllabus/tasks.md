# Tasks
- [x] Task 1: 重新梳理教学大纲数据：更新 `src/data/levels.ts`，增加破冰关卡、打通 C4~A4 的音阶和乐句过渡，使其更平缓和系统化。同时为某些关卡配置 `autoNext: true` 属性。
  - [x] SubTask 1.1: 在 Level 接口中增加 `autoNext?: boolean` 配置。
  - [x] SubTask 1.2: 设计阶段 0 (破冰：电脑键盘映射)，阶段 1 (C4, D4, E4)，阶段 2 (F4, G4)，阶段 3 (A4与小曲目) 的序列。
- [x] Task 2: 键盘组件的视觉引导增强：修改 `src/components/Keyboard.tsx`，在按键上显示对应的电脑键盘字母，并为当前需要弹奏的目标键添加显眼的闪烁或呼吸灯动画。
  - [x] SubTask 2.1: 在每个琴键的 UI 上（例如琴键底部）用小字显示对应的电脑键盘按键（如 'A', 'S', 'D'）。
  - [x] SubTask 2.2: 当琴键在 `activeNotes` 中时，增加呼吸动画 (`animate-pulse` 或自定义 css 动画) 吸引视线。
- [x] Task 3: 关卡无缝连贯体验：修改 `src/pages/LevelPlay.tsx` 的通关逻辑。
  - [x] SubTask 3.1: 判断如果当前关卡配置了 `autoNext: true`，在满足通关条件后不显示结算弹窗。
  - [x] SubTask 3.2: 直接在界面中心显示“太棒了！即将进入下一关...”等简短反馈，并在 1.5 秒后自动触发下一关加载逻辑。
- [x] Task 4: 界面和样式适配：确保大量关卡在首页 `Home.tsx` 中能正常滚动和显示。

# Task Dependencies
- [Task 1] 无依赖
- [Task 2] 无依赖
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1]