import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LEVELS } from '../data/levels';
import { Keyboard } from '../components/Keyboard';
import { getNoteFromKey } from '../utils/keyboardMap';

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
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [targetNotes, setTargetNotes] = useState<string[]>([]);

  // 动态生成 review 模式的目标音符，并在组件挂载时只计算一次
  useEffect(() => {
    if (!level) return;
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
      setShowSettlement(true);
    }
  }, [level, targetNotes.length, isFinished]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || showSettlement || showFailure || !level) return;
      if (e.repeat) return;

      const pressedNote = getNoteFromKey(e.key);
      if (!pressedNote) return;

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
                navigate(`/level/${level.id + 1}`);
              }, 1500);
            } else {
              setTimeout(() => setShowSettlement(true), 1000);
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
                navigate(`/level/${level.id + 1}`);
              }, 1500);
            } else {
              setTimeout(() => setShowSettlement(true), 1000);
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
  }, [currentIndex, isFinished, showSettlement, showFailure, level, targetNotes, store, navigate]);

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

  const handleFailureFinish = () => {
    if (level?.fallbackLevelId !== undefined) {
      store.downgradeLevel(level.fallbackLevelId);
    }
    navigate('/');
  };

  if (!level) {
    return <div className="text-white p-8">关卡不存在</div>;
  }

  const currentTargetNote = targetNotes[currentIndex];
  // 教学模式下，高亮目标音符以供提示
  const activeNotes = level.type === 'teaching' && currentTargetNote ? [currentTargetNote] : [];
  
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

      <Keyboard activeNotes={activeNotes} />

      {/* 进度提示 */}
      {targetNotes.length > 0 && (
        <div className="mt-8 text-gray-500 font-mono">
          进度: {Math.min(currentIndex + 1, targetNotes.length)} / {targetNotes.length}
        </div>
      )}

      {/* 结算弹窗 */}
      {showSettlement && (
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
              错误次数过多（{errorCount} 次），请重新学习之前的关卡。
            </p>
            <button
              onClick={handleFailureFinish}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-full font-bold text-lg hover:from-red-400 hover:to-rose-500 transition-all shadow-[0_0_20px_rgba(248,113,113,0.4)] hover:shadow-[0_0_30px_rgba(248,113,113,0.6)]"
            >
              返回重新学习
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelPlay;
