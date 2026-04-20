import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

import { getNoteFromKey } from '../utils/keyboardMap';

export interface KeyboardProps {
  /**
   * 当前按下的音符或提示的音符（例如：['C4', 'E4']）
   */
  activeNotes?: string[];
}

type KeyType = 'white' | 'black';

interface KeyConfig {
  note: string;
  key: string;
  type: KeyType;
}

// 建立电脑按键与音符的映射关系 (Key Mapping)
const KEYBOARD_KEYS: KeyConfig[] = [
  { note: 'C4', key: 'A', type: 'white' },
  { note: 'C#4', key: 'W', type: 'black' },
  { note: 'D4', key: 'S', type: 'white' },
  { note: 'D#4', key: 'E', type: 'black' },
  { note: 'E4', key: 'D', type: 'white' },
  { note: 'F4', key: 'F', type: 'white' },
  { note: 'F#4', key: 'T', type: 'black' },
  { note: 'G4', key: 'G', type: 'white' },
  { note: 'G#4', key: 'Y', type: 'black' },
  { note: 'A4', key: 'H', type: 'white' },
  { note: 'A#4', key: 'U', type: 'black' },
  { note: 'B4', key: 'J', type: 'white' },
  { note: 'C5', key: 'K', type: 'white' },
  { note: 'C#5', key: 'O', type: 'black' },
  { note: 'D5', key: 'L', type: 'white' },
  { note: 'D#5', key: 'P', type: 'black' },
  { note: 'E5', key: ';', type: 'white' },
  { note: 'F5', key: "'", type: 'white' },
];

export const Keyboard: React.FC<KeyboardProps> = ({ activeNotes = [] }) => {
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const synth = useRef<Tone.PolySynth | null>(null);

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
    // 带有霓虹复古感的合成器音色配置
    synth.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sawtooth',
      },
      envelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.4,
        release: 1,
      },
    }).toDestination();

    // 可以在这里加一点混响或者延迟效果，为了保持性能先不用，或者加上基本的 Chorus
    const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
    synth.current.connect(chorus);

    return () => {
      stopAllNotes();
      synth.current?.dispose();
      chorus.dispose();
    };
  }, []);

  // 处理按键按下
  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.repeat) return; // 防止长按重复触发
    
    // 从映射表中获取音符，处理大小写和 shift 状态
    const note = getNoteFromKey(e.key);
    if (!note) return;
    
    const config = KEYBOARD_KEYS.find((k) => k.note === note);

    if (config) {
      await Tone.start(); // 确保音频上下文已启动
      setPressedNotes((prev) => {
        const next = new Set(prev);
        if (!next.has(config.note)) {
          next.add(config.note);
          synth.current?.triggerAttack(config.note);
        }
        return next;
      });
    }
  };

  // 处理按键抬起
  const handleKeyUp = (e: KeyboardEvent) => {
    const note = getNoteFromKey(e.key);
    if (!note) return;
    
    const config = KEYBOARD_KEYS.find((k) => k.note === note);

    if (config) {
      setPressedNotes((prev) => {
        const next = new Set(prev);
        if (next.has(config.note)) {
          next.delete(config.note);
          synth.current?.triggerRelease([config.note]);
        }
        return next;
      });
    }
  };

  // 全局事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  // 鼠标/触摸交互处理
  const playNote = async (note: string) => {
    await Tone.start();
    synth.current?.triggerAttack(note);
    setPressedNotes((prev) => new Set(prev).add(note));
  };

  const releaseNote = (note: string) => {
    synth.current?.triggerRelease([note]);
    setPressedNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  // 渲染按键
  const renderKeys = useMemo(() => {
    const KEY_WIDTH_WHITE = 60; // 白键宽度
    const KEY_WIDTH_BLACK = 40; // 黑键宽度
    let whiteKeyIndex = 0;

    return KEYBOARD_KEYS.map((config) => {
      const isWhite = config.type === 'white';
      const isPressed = pressedNotes.has(config.note);
      const isActive = activeNotes.includes(config.note);

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
          key={config.note}
          className={`${baseClasses} ${isWhite ? whiteClasses : blackClasses}`}
          style={{
            left: leftPosition,
            width: width,
            height: height,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          initial={false}
          animate={{
            y: isPressed ? 4 : 0,
            scale: isPressed ? 0.98 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onMouseDown={() => playNote(config.note)}
          onMouseUp={() => releaseNote(config.note)}
          onMouseLeave={() => {
            if (pressedNotes.has(config.note)) releaseNote(config.note);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            playNote(config.note);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            releaseNote(config.note);
          }}
        >
          {/* 按键上的文字标签 */}
          <div className="flex flex-col items-center pointer-events-none">
            <span className={`text-xs font-bold mb-1 ${isPressed ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}>
              {config.key}
            </span>
            <span className={`text-[10px] opacity-70 ${isPressed ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`}>
              {config.note}
            </span>
          </div>
        </motion.div>
      );
    });
  }, [pressedNotes, activeNotes]);

  // 计算容器总宽度
  const totalWhiteKeys = KEYBOARD_KEYS.filter((k) => k.type === 'white').length;
  const containerWidth = totalWhiteKeys * 60;

  return (
    <div className="flex justify-center items-center p-8 bg-gray-950 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] border border-gray-800/50">
      <div
        className="relative"
        style={{ width: containerWidth, height: 240 }}
      >
        {renderKeys}
      </div>
    </div>
  );
};
