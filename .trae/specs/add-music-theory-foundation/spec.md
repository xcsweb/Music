# 补充基础乐理与键盘认知 Spec

## Why
用户反映在接触第一关（直接学习 C4）时，缺乏对整个钢琴键盘宏观架构的认知（为什么键盘这么长？为什么要从 C4 开始？）。同时，纯按键记忆脱离了传统音乐的记谱法，缺乏简谱（1=Do）和五线谱（下加一线）等基础乐理知识作为支撑。为了使我们的在线音乐教学更专业且知其然更知其所以然，我们需要在大纲的最前方和关键节点插入“乐理知识”模块。

## What Changes
- **新增关卡类型 `theory`（乐理知识）**：这种关卡不需要复杂的交互弹奏，而是以图文并茂的卡片形式向用户展示音乐基础知识，用户阅读完毕后点击“我已了解”进入下一关。
- **新增乐理关卡内容**：
  - **第 1 关（宏观认知）：认识钢琴与中央 C**：解释 88 键钢琴的结构（黑白键交替规律），以及为什么学习音乐都是从键盘正中间的“中央 C (C4)”开始。
  - **第 2 关（记谱法基础）：认识简谱与五线谱**：解释音名（C D E F G A B）、唱名（Do Re Mi Fa Sol La Si）、简谱数字（1 2 3 4 5 6 7）以及 C4 在五线谱（高音谱表下加一线）上的位置对应关系。
- **调整大纲序号**：原有的“学习 C4”将顺延至第 3 关，确保用户在进行实操前已经建立了乐理认知框架。

## Impact
- Affected specs: 关卡系统模型 (`Level`)、关卡游玩页面 (`LevelPlay.tsx`)、首页卡片 (`Home.tsx`)
- Affected code: `src/data/levels.ts`, `src/store/useStore.ts`, `src/pages/LevelPlay.tsx`, `src/components/LevelCard.tsx`

## ADDED Requirements
### Requirement: 乐理知识展示模式 (Theory Mode)
系统能够渲染纯图文的知识卡片，用于教授乐理。

#### Scenario: 学习基础乐理
- **WHEN** 用户进入类型为 `theory` 的关卡（如：“认识钢琴与中央C”）
- **THEN** 界面隐藏或缩小交互式虚拟键盘，居中展示带有插图或排版优美的文本内容（例如解释 88 键和 C4 的含义）。
- **WHEN** 用户阅读完毕点击“我已了解，继续”按钮
- **THEN** 系统自动解锁并跳转至下一个实操关卡（学习 C4）。

## MODIFIED Requirements
### Requirement: Level 接口扩展
在 `Level` 接口中，扩展 `type` 字段，允许 `'theory'`。并新增一个可选字段 `theoryContent`（可以是一个支持 Markdown 或 React 节点的组件结构）来存储文本知识。

## REMOVED Requirements
### Requirement: 无背景知识的开局
**Reason**: 容易让零基础用户产生“盲人摸象”的困惑。
**Migration**: 用“宏观认知”关卡作为整个应用的破冰起点。