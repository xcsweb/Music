import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 遗忘曲线时间间隔（单位：毫秒）
// 阶段 0: 5分钟
// 阶段 1: 30分钟
// 阶段 2: 12小时
// 阶段 3: 1天
// 阶段 4: 2天
// 阶段 5: 4天
// 阶段 6: 7天
// 阶段 7: 15天
export const FORGETTING_CURVE_INTERVALS = [
  5 * 60 * 1000,
  30 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  4 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000,
];

export interface FailedNoteRecord {
  note: string; // 音符，如 "C4"
  failCount: number; // 失败次数
  lastFailedAt: number; // 时间戳
  nextReviewAt: number; // 根据遗忘曲线计算的下次复习时间
  reviewStage: number; // 处于遗忘曲线的哪个阶段 (0: 5min, 1: 30min, 2: 12hr, 3: 1day 等)
}

export interface UserProgress {
  currentLevel: number;
  unlockedLevels: number[];
  failedNotes: FailedNoteRecord[];
  baseOctave: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  type: 'teaching' | 'single_note' | 'multi_note' | 'song' | 'review' | 'practice' | 'regression_test' | 'theory';
  targetNotes: string[] | string[][]; // 单音数组，或和弦/曲目数组
  requiredScore: number;
  requiredHits?: number;
  sequence?: string[];
  maxErrors?: number;
  fallbackLevelId?: number;
  autoNext?: boolean;
  theoryContent?: string[];
}

interface AppState extends UserProgress {
  // Actions
  unlockLevel: (levelId: number) => void;
  setCurrentLevel: (levelId: number) => void;
  downgradeLevel: (levelId: number) => void;
  recordFailedNote: (note: string) => void;
  reviewNoteSuccess: (note: string) => void;
  resetProgress: () => void;
  setBaseOctave: (octave: number) => void;
}

const initialState: UserProgress = {
  currentLevel: 1,
  unlockedLevels: [1],
  failedNotes: [],
  baseOctave: 4,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      unlockLevel: (levelId: number) =>
        set((state) => ({
          unlockedLevels: state.unlockedLevels.includes(levelId)
            ? state.unlockedLevels
            : [...state.unlockedLevels, levelId],
          currentLevel: Math.max(state.currentLevel, levelId),
        })),

      setCurrentLevel: (levelId: number) => set({ currentLevel: levelId }),

      downgradeLevel: (levelId: number) =>
        set((state) => ({
          currentLevel: levelId,
          unlockedLevels: state.unlockedLevels.filter((id) => id <= levelId),
        })),

      recordFailedNote: (note: string) => {
        const now = Date.now();
        set((state) => {
          const existingRecord = state.failedNotes.find((r) => r.note === note);
          
          if (existingRecord) {
            // 如果已存在，重置 reviewStage 并增加 failCount
            const updatedRecord: FailedNoteRecord = {
              ...existingRecord,
              failCount: existingRecord.failCount + 1,
              lastFailedAt: now,
              reviewStage: 0,
              nextReviewAt: now + FORGETTING_CURVE_INTERVALS[0],
            };
            return {
              failedNotes: state.failedNotes.map((r) =>
                r.note === note ? updatedRecord : r
              ),
            };
          } else {
            // 如果不存在，创建新记录
            const newRecord: FailedNoteRecord = {
              note,
              failCount: 1,
              lastFailedAt: now,
              reviewStage: 0,
              nextReviewAt: now + FORGETTING_CURVE_INTERVALS[0],
            };
            return {
              failedNotes: [...state.failedNotes, newRecord],
            };
          }
        });
      },

      reviewNoteSuccess: (note: string) => {
        set((state) => {
          const record = state.failedNotes.find((r) => r.note === note);
          if (!record) return state;

          const nextStage = record.reviewStage + 1;
          
          // 如果超过最大阶段，认为已经记住，从数组中移除
          if (nextStage >= FORGETTING_CURVE_INTERVALS.length) {
            return {
              failedNotes: state.failedNotes.filter((r) => r.note !== note),
            };
          }

          const now = Date.now();
          const updatedRecord: FailedNoteRecord = {
            ...record,
            reviewStage: nextStage,
            nextReviewAt: now + FORGETTING_CURVE_INTERVALS[nextStage],
          };

          return {
            failedNotes: state.failedNotes.map((r) =>
              r.note === note ? updatedRecord : r
            ),
          };
        });
      },

      resetProgress: () => set(initialState),

      setBaseOctave: (octave: number) => set({ baseOctave: octave }),
    }),
    {
      name: 'piano-app-storage', // localStorage key
    }
  )
);
