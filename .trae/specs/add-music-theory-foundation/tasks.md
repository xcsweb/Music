# Tasks
- [x] Task 1: 扩展关卡数据模型：修改 `src/store/useStore.ts`，在 `Level` 接口中加入 `'theory'` 类型，并添加可选字段 `content` 或 `theoryContent`（可以使用 ReactNode 或者包含标题/段落的结构对象）。
  - [x] SubTask 1.1: 在 `types` 目录下（如果有）或 `useStore.ts` 补充接口定义。
  - [x] SubTask 1.2: 在 `src/components/LevelCard.tsx` 中为 `'theory'` 类型添加标签颜色（如 `bg-amber-500`）和标签名（`乐理`）。
- [x] Task 2: 撰写基础乐理内容：更新 `src/data/levels.ts`。在数组开头插入两关。
  - [x] SubTask 2.1: 新增 Level 1: 认识钢琴与中央C。内容解释钢琴键盘的规律（黑白键交错，循环结构），以及为什么选择处于中央的 C4 作为起点。
  - [x] SubTask 2.2: 新增 Level 2: 简谱与五线谱入门。内容解释音名 (C D E...)、唱名 (Do Re Mi...)、简谱 (1 2 3...) 和五线谱下加一线的概念，为后续实操作铺垫。
  - [x] SubTask 2.3: 顺延原有所有关卡的 `id`（从 1 开始到 22）。由于 `fallbackLevelId` 和内部引用的硬编码 `id` 可能受到影响，需要全局更新关联的 ID。
- [x] Task 3: 重构游玩页面渲染逻辑：修改 `src/pages/LevelPlay.tsx`，使其能正确渲染 `theory` 类型的关卡。
  - [x] SubTask 3.1: 判断 `level.type === 'theory'`。
  - [x] SubTask 3.2: 若为 theory，渲染内容区域（例如使用一个白色的卡片，内含排版良好的文字和简单的图解/示意图）。可以隐藏虚拟键盘或将其缩小/变暗。
  - [x] SubTask 3.3: 在底部放置一个“我已了解，继续”按钮。点击后解锁并进入下一关。
- [ ] Task 4: 兜底数据兼容：既然关卡 ID 整体变动，在启动时若发现 localStorage 数据对不上（如当前等级仍停留在旧体系），可以做一次性清理或提示用户“课程大纲已更新，建议重置进度”。

# Task Dependencies
- [Task 1] 无依赖
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 2]