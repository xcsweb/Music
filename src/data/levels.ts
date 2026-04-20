import type { Level } from '../store/useStore';

export const LEVELS: Level[] = [
  {
    id: 1,
    title: '基础教学：认识中央C',
    description: '学习钢琴键盘上的中央C位置。这是所有音符的基础。',
    type: 'teaching',
    targetNotes: ['C4'],
    requiredScore: 100,
  },
  {
    id: 2,
    title: '单音测试：C大调音阶',
    description: '测试C大调基本音阶（C4到B4）的识别能力。',
    type: 'single_note',
    targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
    requiredScore: 80,
  },
  {
    id: 3,
    title: '和弦入门：C大三和弦',
    description: '同时弹奏C4, E4, G4。',
    type: 'multi_note',
    targetNotes: [['C4', 'E4', 'G4']],
    requiredScore: 100,
  },
  {
    id: 4,
    title: '曲目挑战：小星星',
    description: '弹奏经典儿歌《小星星》的第一句。',
    type: 'song',
    targetNotes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
    requiredScore: 90,
  },
  {
    id: 5,
    title: '智能复习：薄弱音符',
    description: '根据艾宾浩斯记忆曲线，复习你之前弹错的音符。',
    type: 'review',
    targetNotes: [], // 动态生成
    requiredScore: 100,
  },
  {
    id: 6,
    title: '进阶单音：高音区',
    description: '测试C5到G5的识别能力。',
    type: 'single_note',
    targetNotes: ['C5', 'D5', 'E5', 'F5', 'G5'],
    requiredScore: 85,
  }
];
