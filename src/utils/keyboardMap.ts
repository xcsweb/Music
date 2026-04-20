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
export interface NoteMapping {
  note: string;
  octaveOffset: number;
}

export const keyboardToNoteMap: Record<string, NoteMapping> = {
  'a': { note: 'C', octaveOffset: 0 },
  'w': { note: 'C#', octaveOffset: 0 },
  's': { note: 'D', octaveOffset: 0 },
  'e': { note: 'D#', octaveOffset: 0 },
  'd': { note: 'E', octaveOffset: 0 },
  'f': { note: 'F', octaveOffset: 0 },
  't': { note: 'F#', octaveOffset: 0 },
  'g': { note: 'G', octaveOffset: 0 },
  'y': { note: 'G#', octaveOffset: 0 },
  'h': { note: 'A', octaveOffset: 0 },
  'u': { note: 'A#', octaveOffset: 0 },
  'j': { note: 'B', octaveOffset: 0 },
  'k': { note: 'C', octaveOffset: 1 },
  'o': { note: 'C#', octaveOffset: 1 },
  'l': { note: 'D', octaveOffset: 1 },
  'p': { note: 'D#', octaveOffset: 1 },
  ';': { note: 'E', octaveOffset: 1 },
  
  // 兼容大写字母输入（例如用户开启了 CapsLock）
  'A': { note: 'C', octaveOffset: 0 },
  'W': { note: 'C#', octaveOffset: 0 },
  'S': { note: 'D', octaveOffset: 0 },
  'E': { note: 'D#', octaveOffset: 0 },
  'D': { note: 'E', octaveOffset: 0 },
  'F': { note: 'F', octaveOffset: 0 },
  'T': { note: 'F#', octaveOffset: 0 },
  'G': { note: 'G', octaveOffset: 0 },
  'Y': { note: 'G#', octaveOffset: 0 },
  'H': { note: 'A', octaveOffset: 0 },
  'U': { note: 'A#', octaveOffset: 0 },
  'J': { note: 'B', octaveOffset: 0 },
  'K': { note: 'C', octaveOffset: 1 },
  'O': { note: 'C#', octaveOffset: 1 },
  'L': { note: 'D', octaveOffset: 1 },
  'P': { note: 'D#', octaveOffset: 1 },
  ':': { note: 'E', octaveOffset: 1 }, // ; 的 shift 状态
};

/**
 * 根据按键获取对应的钢琴音符
 * @param key 键盘按键字符串，通常为 KeyboardEvent.key
 * @param baseOctave 当前的基准八度
 * @returns 钢琴音符（例如 'C4'），如果不匹配则返回 null
 */
export const getNoteFromKey = (key: string, baseOctave: number = 4): string | null => {
  const mapping = keyboardToNoteMap[key];
  if (!mapping) return null;
  return `${mapping.note}${baseOctave + mapping.octaveOffset}`;
};
