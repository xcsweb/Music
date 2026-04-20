# Tasks
- [x] Task 1: 在 `useStore.ts` 中增加八度切换的全局状态 `baseOctave`（默认值 4），以及一个设置方法 `setBaseOctave`。
  - [x] SubTask 1.1: 补充状态定义 `baseOctave: number` 和方法。
- [x] Task 2: 重构按键映射逻辑 `src/utils/keyboardMap.ts`。
  - [x] SubTask 2.1: 将硬编码的 `C4`, `D#4` 等改为仅保留音符名称（如 `C`, `D#`）以及相对基础八度的偏移量（如 `offset: 0` 为同八度，`offset: 1` 为高一八度）。
  - [x] SubTask 2.2: 更新获取音符的方法，如 `getNoteFromKey`，它现在需要接收一个 `baseOctave` 参数并动态返回拼接后的音符名称（如 `C` + `baseOctave` = `C4`）。
- [x] Task 3: 适配 `src/components/Keyboard.tsx`，将虚拟键盘的按键渲染改为动态音区。
  - [x] SubTask 3.1: 将写死的 `KEYBOARD_KEYS` 数组提取出音名和八度偏移，动态渲染包含当前 `baseOctave` 的琴键名称。
  - [x] SubTask 3.2: 在界面上加入监听 `keydown` 事件，当按下数字 `1-7` 时，调用 `setBaseOctave`。
  - [x] SubTask 3.3: 渲染一个明显的提示器：“当前八度: X (按数字 1~7 切换)”。
- [x] Task 4: 适配发声逻辑与关卡系统 `src/pages/LevelPlay.tsx`。
  - [x] SubTask 4.1: 确保发声模块使用计算后的动态音符名称来播放对应的声音（C1、C2 等）。
  - [x] SubTask 4.2: 保证现有的关卡判定仍然正确工作（如果关卡目标是 C4，而在 baseOctave=1 时按下 A 发出 C1，应被视为错误；当 baseOctave=4 时按下 A 才是正确的 C4）。

# Task Dependencies
- [Task 1] 无依赖
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1, Task 2]
- [Task 4] depends on [Task 3]