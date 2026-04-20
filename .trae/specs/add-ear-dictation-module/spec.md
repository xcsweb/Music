# 听音按键（听写）模块 Spec

## Why
目前的教学与练习主要依赖视觉提示（看到音名 -> 按键），而真实的音乐学习通常需要“听辨”能力：听到一个音或一段短旋律，能够在键盘上找到并弹出来（类似课堂里的听写）。如果缺少这一环节，用户在进入曲目学习前会出现“会按键但不会听”的断层。

因此需要增加一个“听音 -> 用户按键复现”的听写模块，并将其插入到**所有练习阶段结束后、学习一首歌之前**，作为进入曲目学习前的关键门槛与巩固。

## What Changes
- 新增关卡类型 `ear_dictation`（听写）：系统播放一个音（或短序列），用户在虚拟键盘上弹出相同的音（或序列）完成该轮。
- 听写关卡通过后自动进入下一关（通常是曲目关卡）；听写关卡失败则回退到指定的练习关卡重新巩固。
- 调整 `src/data/levels.ts`：在每个 `song` 关卡之前插入一个 `ear_dictation` 关卡。
- 调整 `LevelPlay.tsx`：支持 `ear_dictation` 的播放、回放、输入判定、进度与失败回退 UI。
- 调整 `useStore.ts`：在 `Level.type` 中加入 `ear_dictation`，并为该关卡增加必要的配置字段（如音池、轮数、回放次数、错误上限）。
- 可选：在 `LevelCard.tsx` 为 `ear_dictation` 增加标签（例如“听写”）。

## Impact
- Affected specs: 关卡系统、关卡游玩流程、曲目前置门槛
- Affected code: `src/data/levels.ts`, `src/pages/LevelPlay.tsx`, `src/store/useStore.ts`, `src/components/LevelCard.tsx`

## ADDED Requirements
### Requirement: 听写关卡播放与作答
系统 SHALL 支持听写关卡：播放提示音，等待用户按键作答，并给出正确/错误反馈。

#### Scenario: 单音听写（成功）
- **GIVEN** 用户已完成阶段练习，即将进入曲目学习
- **WHEN** 用户进入听写关卡并点击“播放”
- **THEN** 系统播放一个目标音（例如 `E4`），且界面不直接显示答案音名
- **WHEN** 用户在键盘上弹奏 `E4`
- **THEN** 系统提示“正确”，进入下一轮或直接通关并进入曲目关卡

#### Scenario: 单音听写（失败回退）
- **GIVEN** 听写关卡配置了 `maxErrors = 2`，`fallbackLevelId = 6`（返回到某个练习/学习关）
- **WHEN** 用户累计错误次数达到上限
- **THEN** 系统提示“听写未通过，即将返回巩固练习”，并自动跳转到 `fallbackLevelId`

### Requirement: 回放控制
系统 SHALL 提供“再听一遍”能力，但有次数限制以促使用户建立听觉记忆。

#### Scenario: 限制回放次数
- **WHEN** 用户点击“再听一遍”
- **THEN** 系统重新播放目标音
- **AND** 当回放次数耗尽时按钮置灰，并提示“回放次数已用完”

## MODIFIED Requirements
### Requirement: 曲目关卡的前置要求
曲目关卡（`song`）前必须存在并要求通过一个听写关卡（`ear_dictation`），以保证用户在进入曲目学习前完成听辨巩固。

## REMOVED Requirements
无

