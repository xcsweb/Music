import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { useStore } from '../store/useStore';
import { getNoteFromKey } from '../utils/keyboardMap';

export interface KeyboardProps {
  /**
   * 当前按下的音符或提示的音符（例如：['C4', 'E4']）
   */
  activeNotes?: string[];
}

type KeyType = 'white' | 'black';

interface KeyConfig {
  baseNote: string;
  octaveOffset: number;
  key: string;
  type: KeyType;
}

// 建立电脑按键与音符的映射关系 (Key Mapping)
const KEYBOARD_KEYS: KeyConfig[] = [
  { baseNote: 'C', octaveOffset: 0, key: 'A', type: 'white' },
  { baseNote: 'C#', octaveOffset: 0, key: 'W', type: 'black' },
  { baseNote: 'D', octaveOffset: 0, key: 'S', type: 'white' },
  { baseNote: 'D#', octaveOffset: 0, key: 'E', type: 'black' },
  { baseNote: 'E', octaveOffset: 0, key: 'D', type: 'white' },
  { baseNote: 'F', octaveOffset: 0, key: 'F', type: 'white' },
  { baseNote: 'F#', octaveOffset: 0, key: 'T', type: 'black' },
  { baseNote: 'G', octaveOffset: 0, key: 'G', type: 'white' },
  { baseNote: 'G#', octaveOffset: 0, key: 'Y', type: 'black' },
  { baseNote: 'A', octaveOffset: 0, key: 'H', type: 'white' },
  { baseNote: 'A#', octaveOffset: 0, key: 'U', type: 'black' },
  { baseNote: 'B', octaveOffset: 0, key: 'J', type: 'white' },
  { baseNote: 'C', octaveOffset: 1, key: 'K', type: 'white' },
  { baseNote: 'C#', octaveOffset: 1, key: 'O', type: 'black' },
  { baseNote: 'D', octaveOffset: 1, key: 'L', type: 'white' },
  { baseNote: 'D#', octaveOffset: 1, key: 'P', type: 'black' },
  { baseNote: 'E', octaveOffset: 1, key: ';', type: 'white' },
  { baseNote: 'F', octaveOffset: 1, key: "'", type: 'white' },
];

const KEY_WIDTH_WHITE = 60;
const KEY_WIDTH_BLACK = 40;

export const Keyboard: React.FC<KeyboardProps> = ({ activeNotes = [] }) => {
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const synth = useRef<Tone.PolySynth | null>(null);
  const baseOctave = useStore((state) => state.baseOctave);
  const setBaseOctave = useStore((state) => state.setBaseOctave);

  const stopAllNotes = () => {
    setPressedNotes((prev) => {
      const notes = Array.from(prev);
      if (notes.length > 0) {
        synth.current?.triggerRelease(notes);
      }
      return new Set();
    });
  };

  // 初始化合成器
  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle8',
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    });

    const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
    synth.current.connect(chorus);

    return () => {
      stopAllNotes();
      synth.current?.dispose();
      chorus.dispose();
    };
  }, []);

  // 监听失去焦点和页面隐藏
  useEffect(() => {
    const handleBlur = () => stopAllNotes();
    const handleVisibilityChange = () => {
      if (document.hidden) stopAllNotes();
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 处理按键按下
  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.repeat) return; // 防止长按重复触发

    // 处理数字键 1-7 切换八度
    if (e.key >= '1' && e.key <= '7') {
      setBaseOctave(parseInt(e.key));
      return;
    }

    const note = getNoteFromKey(e.key, baseOctave);
    if (!note) return;

    await Tone.start(); // 确保音频上下文已启动
    setPressedNotes((prev) => {
      const next = new Set(prev);
      if (!next.has(note)) {
        next.add(note);
        synth.current?.triggerAttack(note);
      }
      return next;
    });
  };

  // 处理按键抬起
  const handleKeyUp = (e: KeyboardEvent) => {
    const note = getNoteFromKey(e.key, baseOctave);
    if (!note) return;

    setPressedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(note)) {
        next.delete(note);
        synth.current?.triggerRelease([note]);
      }
      return next;
    });
  };

  // 全局事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseOctave, setBaseOctave]);

  // 鼠标/触摸交互处理
  const playNote = async (note: string) => {
    await Tone.start();
    setPressedNotes((prev) => {
      const next = new Set(prev);
      next.add(note);
      return next;
    });
    synth.current?.triggerAttack(note);
  };

  const releaseNote = (note: string) => {
    setPressedNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    synth.current?.triggerRelease([note]);
  };

  // 渲染按键
  const renderKeys = useMemo(() => {
    let whiteKeyIndex = 0;

    return KEYBOARD_KEYS.map((config) => {
      const isWhite = config.type === 'white';
      const note = `${config.baseNote}${baseOctave + config.octaveOffset}`;
      const isPressed = pressedNotes.has(note);
      const isActive = activeNotes.includes(note);

      // 计算按键位置
      const leftPosition = isWhite
        ? whiteKeyIndex * KEY_WIDTH_WHITE
        : whiteKeyIndex * KEY_WIDTH_WHITE - KEY_WIDTH_BLACK / 2;

      if (isWhite) whiteKeyIndex++;

      // 动态样式
      const baseClasses = "absolute rounded-b-md flex flex-col justify-end items-center pb-4 cursor-pointer select-none transition-colors transition-shadow duration-200";

      const whiteClasses = isPressed
        ? "bg-green-500/30 border-2 border-green-400 text-green-100 shadow-[0_0_20px_rgba(74,222,128,0.8),inset_0_0_15px_rgba(74,222,128,0.5)] z-0"
        : isActive
          ? "bg-red-900/60 border-2 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse z-0"
          : "bg-gray-800/80 border-2 border-cyan-500/40 text-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-gray-700/80 z-0";

      const blackClasses = isPressed
        ? "bg-green-500/30 border-2 border-green-400 text-green-100 shadow-[0_0_20px_rgba(74,222,128,0.8),inset_0_0_15px_rgba(74,222,128,0.5)] z-10"
        : isActive
          ? "bg-red-900/60 border-2 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse z-10"
          : "bg-gray-900 border-2 border-cyan-800 text-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-gray-800 z-10";

      const width = isWhite ? KEY_WIDTH_WHITE : KEY_WIDTH_BLACK;
      const height = isWhite ? 240 : 150;

      return (
        <motion.div
          key={note}
          className={`${baseClasses} ${isWhite ? whiteClasses : blackClasses}`}
          style={{
            left: leftPosition,
            width,
            height,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            scale: isPressed ? 0.98 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onMouseDown={() => playNote(note)}
          onMouseUp={() => releaseNote(note)}
          onMouseLeave={() => {
            if (pressedNotes.has(note)) releaseNote(note);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            playNote(note);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            releaseNote(note);
          }}
        >
          {/* 按键上的文字标签 */}
          <div className="flex flex-col items-center pointer-events-none">
            <span className={`text-xs font-bold mb-1 ${isPressed ? 'text-white' : ''}`}>
              {config.key}
            </span>
            <span className={`text-[10px] opacity-70 ${isPressed ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`}>
              {note}
            </span>
          </div>
        </motion.div>
      );
    });
  }, [pressedNotes, activeNotes, baseOctave]);

  // 计算容器总宽度
  const totalWhiteKeys = KEYBOARD_KEYS.filter((k) => k.type === 'white').length;
  const containerWidth = totalWhiteKeys * 60;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-cyan-400/80 text-sm font-medium tracking-wider bg-gray-900/50 px-4 py-2 rounded-full border border-cyan-900/30">
        当前八度: {baseOctave} <span className="text-gray-500 ml-2 text-xs">(按数字键 1~7 切换)</span>
      </div>
      <div className="flex justify-center items-center p-8 bg-gray-950 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] border border-gray-800/50">
        <div
          className="relative"
          style={{ width: containerWidth, height: 240 }}
        >
          {renderKeys}
        </div>
      </div>
    </div>
  );
};
