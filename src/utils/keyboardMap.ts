/**
 * 电脑键盘按键到钢琴音符的映射
 * 
 * 对应关系（以 C4 为基准）：
 * 
 * 黑键（半音）：  W   E       T   Y   U       O   P
 *              C#4 D#4     F#4 G#4 A#4     C#5 D#5
 * 白键（全音）：A   S   D   F   G   H   J   K   L   ;
 *             C4  D4  E4  F4  G4  A4  B4  C5  D5  E5
 * 
 * 建议在查询前将 `event.key` 转换为小写字母。
 */
export const keyboardToNoteMap: Record<string, string> = {
  'a': 'C4',
  'w': 'C#4',
  's': 'D4',
  'e': 'D#4',
  'd': 'E4',
  'f': 'F4',
  't': 'F#4',
  'g': 'G4',
  'y': 'G#4',
  'h': 'A4',
  'u': 'A#4',
  'j': 'B4',
  'k': 'C5',
  'o': 'C#5',
  'l': 'D5',
  'p': 'D#5',
  ';': 'E5',
  
  // 兼容大写字母输入（例如用户开启了 CapsLock）
  'A': 'C4',
  'W': 'C#4',
  'S': 'D4',
  'E': 'D#4',
  'D': 'E4',
  'F': 'F4',
  'T': 'F#4',
  'G': 'G4',
  'Y': 'G#4',
  'H': 'A4',
  'U': 'A#4',
  'J': 'B4',
  'K': 'C5',
  'O': 'C#5',
  'L': 'D5',
  'P': 'D#5',
  ':': 'E5', // ; 的 shift 状态
};

/**
 * 根据按键获取对应的钢琴音符
 * @param key 键盘按键字符串，通常为 KeyboardEvent.key
 * @returns 钢琴音符（例如 'C4'），如果不匹配则返回 null
 */
export const getNoteFromKey = (key: string): string | null => {
  return keyboardToNoteMap[key] || null;
};
