import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LEVELS } from '../data/levels';
import { Keyboard } from '../components/Keyboard';
import { getNoteFromKey } from '../utils/keyboardMap';
import * as Tone from 'tone';

const LevelPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const levelId = parseInt(id || '1', 10);
  const level = LEVELS.find((l) => l.id === levelId);

  const store = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [countdown, setCountdown] = useState(2);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [targetNotes, setTargetNotes] = useState<string[]>([]);

  // 听音和听写相关状态
  const [dictationTarget, setDictationTarget] = useState<string>('');
  const [dictationRounds, setDictationRounds] = useState(0);
  const [dictationStreak, setDictationStreak] = useState(0);
  const [replaysLeft, setReplaysLeft] = useState(0);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  const isEarType = level?.type === 'ear_training' || level?.type === 'ear_dictation';

  // 初始化合成器
  useEffect(() => {
    if (isEarType) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 1 },
      }).toDestination();
      const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
      synthRef.current.connect(chorus);
      return () => {
        synthRef.current?.dispose();
        chorus.dispose();
      };
    }
  }, [isEarType]);

  const playDictationNote = React.useCallback(async (note: string) => {
    if (!note) return;
    await Tone.start();
    synthRef.current?.triggerAttackRelease(note, '4n');
  }, []);

  const startNextDictationRound = React.useCallback(() => {
    if (!level || !level.notePool || level.notePool.length === 0) return;
    const randomNote = level.notePool[Math.floor(Math.random() * level.notePool.length)];
    setDictationTarget(randomNote);
    setReplaysLeft(level.replayLimit ?? 99);
    setFeedback(null);
    setTimeout(() => {
      playDictationNote(randomNote);
    }, 500);
  }, [level, playDictationNote]);

  // On mount for ear types
  useEffect(() => {
    if (isEarType && !isFinished) {
      startNextDictationRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEarType, level]);

  // 动态生成 review 模式的目标音符，并在组件挂载时只计算一次
  useEffect(() => {
    if (!level) return;
    
    // 更新当前学习的关卡记录
    store.setCurrentLevel(level.id);

    if (level.type === 'review') {
      const now = Date.now();
      const notesToReview = store.failedNotes
        .filter((record) => now >= record.nextReviewAt)
        .map((record) => record.note);
      setTargetNotes(notesToReview);
    } else {
      // 兼容所有模式，将可能的多维数组展平为一维数组
      let notes = level.targetNotes.flat() as string[];
      if (level.requiredHits && notes.length === 1) {
        notes = Array(level.requiredHits).fill(notes[0]);
      }
      setTargetNotes(notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // 处理没有复习音符的情况
  useEffect(() => {
    if (level?.type === 'review' && targetNotes.length === 0 && !isFinished) {
      setIsFinished(true);
      if (level.autoNext && level.id < LEVELS.length) {
        setFeedback({ text: '无需复习，即将进入下一关...', type: 'success' });
        setTimeout(() => {
          store.unlockLevel(level.id + 1);
          setShowSettlement(false);
          navigate(`/level/${level.id + 1}`);
        }, 1500);
      } else if (!level.autoNext) {
        setShowSettlement(true);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    }
  }, [level, targetNotes.length, isFinished, navigate, store]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || showSettlement || showFailure || !level) return;
      if (e.repeat) return;

      const pressedNote = getNoteFromKey(e.key, store.baseOctave);
      if (!pressedNote) return;

      if (isEarType) {
        if (!dictationTarget) return;

        if (pressedNote === dictationTarget) {
          setFeedback({ text: '正确！', type: 'success' });
          const newStreak = dictationStreak + 1;
          const newRounds = dictationRounds + 1;
          setDictationStreak(newStreak);
          setDictationRounds(newRounds);

          // 检查是否满足过关条件
          const requiredRounds = level?.rounds ?? 5;
          const requiredStreak = level?.requiredCorrectStreak ?? 0;
          
          if (newRounds >= requiredRounds && newStreak >= requiredStreak) {
            setIsFinished(true);
            setTimeout(() => setShowSettlement(true), 1000);
          } else {
            setTimeout(() => startNextDictationRound(), 1000);
          }
        } else {
          setFeedback({ text: `错误！`, type: 'error' });
          setDictationStreak(0);
          
          setErrorCount((prev) => {
            const newCount = prev + 1;
            if (level?.type === 'ear_dictation' && level.maxErrors && newCount >= level.maxErrors) {
              setIsFinished(true);
              setTimeout(() => setShowFailure(true), 500);
            }
            return newCount;
          });
        }
        return;
      }

      if (level?.type === 'teaching') {
        // teaching 模式：用户随便按，UI 给出提示
        setFeedback({ text: `你按下了 ${pressedNote}`, type: 'info' });
        
        // 如果按下了目标音符，则过关
        const currentTarget = targetNotes[currentIndex];
        if (pressedNote === currentTarget) {
          if (currentIndex + 1 >= targetNotes.length) {
            setIsFinished(true);
            if (level.autoNext && level.id < LEVELS.length) {
              setFeedback({ text: '太棒了！即将进入下一关...', type: 'success' });
              setTimeout(() => {
                store.unlockLevel(level.id + 1);
                setCurrentIndex(0);
                setIsFinished(false);
                setFeedback(null);
                setErrorCount(0);
                setShowSettlement(false);
                navigate(`/level/${level.id + 1}`);
              }, 1500);
            } else if (!level.autoNext) {
              setTimeout(() => setShowSettlement(true), 1000);
            } else {
              // autoNext is true but it's the last level, return to home
              setTimeout(() => {
                navigate('/');
              }, 1500);
            }
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        }
      } else {
        const currentTarget = targetNotes[currentIndex];
        if (!currentTarget) return;
        
        if (pressedNote === currentTarget) {
          setFeedback({ text: '正确！', type: 'success' });
          if (level?.type === 'review') {
            store.reviewNoteSuccess(currentTarget);
          }
          
          if (currentIndex + 1 >= targetNotes.length) {
            setIsFinished(true);
            if (level.autoNext && level.id < LEVELS.length) {
              setFeedback({ text: '太棒了！即将进入下一关...', type: 'success' });
              setTimeout(() => {
                store.unlockLevel(level.id + 1);
                setCurrentIndex(0);
                setIsFinished(false);
                setFeedback(null);
                setErrorCount(0);
                setShowSettlement(false);
                navigate(`/level/${level.id + 1}`);
              }, 1500);
            } else if (!level.autoNext) {
              setTimeout(() => setShowSettlement(true), 1000);
            } else {
              setTimeout(() => {
                navigate('/');
              }, 1500);
            }
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
        } else {
          setFeedback({ text: `错误！应该是 ${currentTarget}`, type: 'error' });
          store.recordFailedNote(currentTarget);
          
          setErrorCount((prev) => {
            const newCount = prev + 1;
            if (level?.maxErrors && newCount >= level.maxErrors) {
              setIsFinished(true);
              setTimeout(() => setShowFailure(true), 500);
            }
            return newCount;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
<<<<<<< ours
  }, [currentIndex, isFinished, showSettlement, showFailure, level, targetNotes, store, navigate]);

  // 失败自动返回重学逻辑
  useEffect(() => {
    if (showFailure) {
      setCountdown(2);
      const timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      const redirectTimer = setTimeout(() => {
        if (level?.fallbackLevelId !== undefined) {
          store.downgradeLevel(level.fallbackLevelId);
        }
        navigate('/');
      }, 2000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [showFailure, level?.fallbackLevelId, store, navigate]);
=======
  }, [
    currentIndex,
    isFinished,
    showSettlement,
    showFailure,
    level,
    targetNotes,
    store,
    isEarType,
    dictationTarget,
    dictationStreak,
    dictationRounds,
    startNextDictationRound,
  ]);
>>>>>>> theirs

  // 结算处理
  const handleFinish = () => {
    if (level) {
      store.unlockLevel(level.id + 1);
    }
    navigate('/');
  };

  const handleNextLevel = () => {
    if (level) {
      store.unlockLevel(level.id + 1);
      setCurrentIndex(0);
      setFeedback(null);
      setIsFinished(false);
      setShowSettlement(false);
      setErrorCount(0);
      navigate(`/level/${level.id + 1}`);
    }
  };

  if (!level) {
    return <div className="text-white p-8">关卡不存在</div>;
  }

  const currentTargetNote = targetNotes[currentIndex];
  // 高亮目标音符以供提示
  const activeNotes = currentTargetNote ? [currentTargetNote] : [];
  
  const isSequence = level.type === 'multi_note' || level.type === 'song' || level.type === 'practice' || level.type === 'regression_test';

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-900/20 rounded-full blur-[100px] -z-10" />

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {level.title}
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">{level.description}</p>
      </header>

      {/* 状态显示区 */}
<<<<<<< ours
      {level.type !== 'theory' && (
        <div className="mb-12 h-32 flex flex-col items-center justify-center">
          {level.type === 'review' && targetNotes.length === 0 ? (
            <div className="text-2xl text-green-400 font-bold">目前没有需要复习的音符，太棒了！</div>
          ) : (
            <>
              {isSequence ? (
                <div className="flex items-center justify-center space-x-6 mb-4 h-20">
                  {targetNotes.slice(currentIndex, currentIndex + 5).map((note, idx) => (
                    <div
                      key={`${note}-${currentIndex + idx}`}
                      className={`transition-all duration-300 flex items-center justify-center ${
                        idx === 0
                          ? 'text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110'
                          : 'text-3xl font-bold text-gray-500 opacity-60'
                      }`}
                    >
                      {note}
                    </div>
                  ))}
                  {currentIndex + 5 < targetNotes.length && (
                    <div className="text-3xl font-bold text-gray-500 opacity-40 tracking-widest">...</div>
                  )}
                </div>
              ) : (
                currentTargetNote && (
                  <div className="text-6xl font-extrabold mb-4 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] h-20 flex items-center justify-center">
                    {currentTargetNote}
                  </div>
                )
              )}
              <div className="h-8">
                {feedback && (
=======
      <div className="mb-12 h-32 flex flex-col items-center justify-center">
        {isEarType ? (
          <>
            <div className="flex flex-col items-center justify-center h-20 mb-4">
              <button
                onClick={() => {
                  if (replaysLeft > 0) {
                    setReplaysLeft((prev) => prev - 1);
                    playDictationNote(dictationTarget);
                  }
                }}
                disabled={replaysLeft <= 0}
                className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${
                  replaysLeft > 0
                    ? 'bg-gradient-to-r from-fuchsia-500 to-rose-600 hover:from-fuchsia-400 hover:to-rose-500 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                播放声音 {level.replayLimit && level.replayLimit < 99 ? `(剩 ${replaysLeft} 次)` : ''}
              </button>
              {level.type === 'ear_training' && dictationStreak > 0 && (
                <div className="mt-2 text-sm text-fuchsia-400">连对: {dictationStreak} / {level.requiredCorrectStreak || 0}</div>
              )}
            </div>
            <div className="h-8">
              {feedback && (
                <div
                  className={`text-xl font-semibold animate-pulse ${
                    feedback.type === 'success'
                      ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'
                      : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]'
                  }`}
                >
                  {feedback.text}
                  {feedback.type === 'error' && level.type === 'ear_training' ? ` 提示: ${dictationTarget}` : ''}
                </div>
              )}
            </div>
          </>
        ) : level.type === 'review' && targetNotes.length === 0 ? (
          <div className="text-2xl text-green-400 font-bold">目前没有需要复习的音符，太棒了！</div>
        ) : (
          <>
            {isSequence ? (
              <div className="flex items-center justify-center space-x-6 mb-4 h-20">
                {targetNotes.slice(currentIndex, currentIndex + 5).map((note, idx) => (
>>>>>>> theirs
                  <div
                    className={`text-xl font-semibold animate-pulse ${
                      feedback.type === 'success'
                        ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'
                        : feedback.type === 'error'
                        ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]'
                        : 'text-cyan-400'
                    }`}
                  >
                    {feedback.text}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {level.type === 'theory' ? (
        <div className="max-w-2xl w-full bg-gray-900/80 border border-amber-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-8 backdrop-blur-sm">
          {level.theoryContent?.map((paragraph, idx) => (
            <p key={idx} className="text-gray-300 text-lg leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleNextLevel}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full font-bold text-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] text-white"
            >
              我已了解，继续
            </button>
          </div>
        </div>
      ) : (
        <Keyboard activeNotes={activeNotes} />
      )}

      {/* 进度提示 */}
<<<<<<< ours
      {level.type !== 'theory' && targetNotes.length > 0 && (
=======
      {isEarType ? (
        <div className="mt-8 text-gray-500 font-mono">
          进度: {Math.min(dictationRounds + 1, level?.rounds ?? 5)} / {level?.rounds ?? 5}
        </div>
      ) : targetNotes.length > 0 ? (
>>>>>>> theirs
        <div className="mt-8 text-gray-500 font-mono">
          进度: {Math.min(currentIndex + 1, targetNotes.length)} / {targetNotes.length}
        </div>
      ) : null}

      {/* 结算弹窗 */}
      {showSettlement && !level.autoNext && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">
              {level.type === 'review' && targetNotes.length === 0 ? '复习完成' : '关卡完成！'}
            </h2>
            <p className="text-gray-300 mb-8">
              你已经成功完成了本关卡，继续你的音乐之旅吧。
            </p>
            <div className="flex flex-col space-y-4">
              {level.id < LEVELS.length && (
                <button
                  onClick={handleNextLevel}
                  className="w-full px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] text-white"
                >
                  继续下一关
                </button>
              )}
              <button
                onClick={handleFinish}
                className={`w-full px-8 py-3 rounded-full font-bold text-lg transition-all ${
                  level.id < LEVELS.length
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] text-white'
                }`}
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 失败弹窗 */}
      {showFailure && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(248,113,113,0.2)] max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-400">
              测试未通过
            </h2>
            <p className="text-gray-300 mb-8">
              错误次数过多（{errorCount} 次），即将返回重新学习...
            </p>
            <div className="text-gray-500 font-mono text-xl animate-pulse">
              {countdown}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelPlay;
