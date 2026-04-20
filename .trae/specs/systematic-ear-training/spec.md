# 系统化听音学习与听写闸门 Spec

## Why
只加一个“听写关卡”还不够系统：如果用户听写没过，直接回到键位练习会让训练目标不聚焦。传统音乐教学里，听写前往往会先做“听辨训练”（例如：单音辨识、两音高低/音程方向、短音组），再进入更严格的听写考核。

我们需要把“听音”做成一个可循序渐进的模块体系：**先学会听，再通过听写考试，最后才进入歌曲学习**。并且在听写失败时，能够明确回退到“听音训练模块”，形成闭环。

## What Changes
- 新增关卡类型 `ear_training`（听音训练）与 `ear_dictation`（听写考核）。
- 在每个 `song` 关卡前，插入一段“听音训练模块 + 听写闸门”：
  - `ear_training`：可重复播放、带提示、目标是建立听觉-键位映射。
  - `ear_dictation`：有限回放、不直接展示答案音名、作为进入歌曲的门槛。
- 听写失败的回退策略调整：
  - `ear_dictation` 失败 **不再** 直接回到键位练习，而是回到对应的 `ear_training` 模块起点（或最近的听音训练关）。
  - 用户必须重新通过听音训练模块，再次挑战听写闸门。

## Impact
- Affected specs: 关卡系统、关卡游玩逻辑、课程编排
- Affected code: `src/store/useStore.ts`, `src/data/levels.ts`, `src/pages/LevelPlay.tsx`, `src/components/LevelCard.tsx`

## ADDED Requirements
### Requirement: 听音训练模块（Ear Training）
系统 SHALL 提供“先听后按”的训练关卡，允许用户通过高频回放与即时反馈建立听觉与键位的映射。

#### Scenario: 单音听辨训练（训练态）
- **WHEN** 用户进入 `ear_training`（单音）关卡
- **THEN** 系统提示“点击播放听一个音，再在键盘上按出来”
- **AND** 系统允许不限次数播放（或较高回放上限）
- **WHEN** 用户按键作答
- **THEN** 系统立即提示正确/错误；错误时可提示“更高/更低”或给出正确音名（训练态允许给答案）

### Requirement: 听写闸门（Ear Dictation Gate）
系统 SHALL 在进入歌曲前提供听写考核关卡，限制回放次数并隐藏答案音名，通过后才解锁歌曲。

#### Scenario: 歌曲前置闸门
- **GIVEN** 用户完成了对应阶段的练习与听音训练
- **WHEN** 用户通过 `ear_dictation` 关卡
- **THEN** 系统自动进入下一关（`song`）

### Requirement: 听写失败回退到听音训练
系统 SHALL 在听写失败后自动回退到对应的听音训练模块，并要求重新通过训练后再挑战听写。

#### Scenario: 听写未通过后的闭环
- **GIVEN** `ear_dictation` 配置 `fallbackLevelId` 指向某个 `ear_training` 起点
- **WHEN** 用户在听写中错误次数达到上限
- **THEN** 系统提示“听写未通过，即将返回听音训练巩固”，并自动跳转到该 `ear_training` 关卡

## MODIFIED Requirements
### Requirement: 课程编排规则
所有 `song` 关卡前必须按顺序存在：
1) 练习（practice/回归测试）
2) 听音训练（ear_training）
3) 听写闸门（ear_dictation）
4) 歌曲（song）

## REMOVED Requirements
无

