import * as Tone from 'tone';

// 单例的 PolySynth 实例
let synth: Tone.PolySynth | null = null;
let isInitialized = false;

/**
 * 初始化音频上下文并创建合成器
 * 必须在用户交互后调用，以满足浏览器的自动播放策略
 */
export const initAudio = async () => {
  if (isInitialized) return;

  try {
    // 启动音频上下文
    await Tone.start();
    
    // 创建多音轨合成器并连接到主输出
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    isInitialized = true;
    console.log('AudioContext started and synth initialized.');
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

/**
 * 播放指定的音符
 * @param note 钢琴音符（例如 'C4', 'C#4'）
 * @param duration 持续时间（例如 '8n' 代表八分音符，也可以是秒数，默认 '8n'）
 * @param time 播放时间（可选）
 */
export const playNote = (note: string, duration: string | number = '8n', time?: number) => {
  if (!synth || !isInitialized) {
    console.warn('Synth is not initialized. Please call initAudio() first on user interaction.');
    return;
  }
  
  synth.triggerAttackRelease(note, duration, time);
};

/**
 * 按下音符（持续发声，直到 releaseNote 被调用）
 * 常用于键盘按下事件
 * @param note 钢琴音符
 * @param time 播放时间（可选）
 */
export const triggerAttack = (note: string, time?: number) => {
  if (!synth || !isInitialized) return;
  synth.triggerAttack(note, time);
};

/**
 * 释放音符（停止发声）
 * 常用于键盘抬起事件
 * @param note 钢琴音符
 * @param time 播放时间（可选）
 */
export const triggerRelease = (note: string, time?: number) => {
  if (!synth || !isInitialized) return;
  synth.triggerRelease(note, time);
};

/**
 * 获取当前的合成器实例
 */
export const getSynth = () => synth;
