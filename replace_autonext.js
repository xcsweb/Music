import fs from 'fs';

let content = fs.readFileSync('src/pages/LevelPlay.tsx', 'utf-8');

// Replace review finish
content = content.replace(
  /if \(!isFinished\) \{\n\s+setIsFinished\(true\);\n\s+setShowSettlement\(true\);\n\s+\}/,
  `if (!isFinished) {
      setIsFinished(true);
      if (level.autoNext && level.id < LEVELS.length) {
        setFeedback({ text: '无需复习，即将进入下一关...', type: 'success' });
        setTimeout(() => {
          store.unlockLevel(level.id + 1);
          setShowSettlement(false);
          navigate('/level/' + (level.id + 1));
        }, 1500);
      } else if (!level.autoNext) {
        setShowSettlement(true);
      } else {
        setTimeout(() => navigate('/'), 1500);
      }
    }`
);

// Replace others
content = content.replace(
  /setTimeout\(\(\) => setShowSettlement\(true\), 1000\);/g,
  `if (level.autoNext && level.id < LEVELS.length) {
              setFeedback({ text: '太棒了！即将进入下一关...', type: 'success' });
              setTimeout(() => {
                store.unlockLevel(level.id + 1);
                setCurrentIndex(0);
                setIsFinished(false);
                setFeedback(null);
                setErrorCount(0);
                setShowSettlement(false);
                setDictationRounds(0);
                setDictationStreak(0);
                navigate('/level/' + (level.id + 1));
              }, 1500);
            } else if (!level.autoNext) {
              setTimeout(() => setShowSettlement(true), 1000);
            } else {
              setTimeout(() => navigate('/'), 1500);
            }`
);

// Replace settlement condition
content = content.replace(
  /\{showSettlement && \(/,
  `{showSettlement && !level?.autoNext && (`
);

// Replace theory
content = content.replace(
  /return \(\n\s+<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">/,
  `return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      {level?.type === 'theory' ? (
        <div className="max-w-2xl w-full bg-gray-900 border border-amber-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col">
          <h2 className="text-3xl font-bold mb-6 text-amber-400">{level.title}</h2>
          <div className="text-gray-300 space-y-4 text-lg leading-relaxed mb-8">
            {level.theoryContent?.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <button
            onClick={() => {
              if (level.id < LEVELS.length) {
                store.unlockLevel(level.id + 1);
                navigate('/level/' + (level.id + 1));
              } else {
                navigate('/');
              }
            }}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all text-white"
          >
            我已了解，继续
          </button>
        </div>
      ) : (`
);

// Close theory tag
content = content.replace(
  /\{\/\* 结算弹窗 \*\/\}/,
  `)}\n\n      {/* 结算弹窗 */}`
);

// Add countdown
content = content.replace(
  /const \[replaysLeft, setReplaysLeft\] = useState\(3\);/,
  `const [replaysLeft, setReplaysLeft] = useState(3);\n  const [countdown, setCountdown] = useState(0);`
);

// Auto return logic for failure
content = content.replace(
  /const handleFailureFinish = \(\) => {[\s\S]*?};/,
  `// Auto return logic for failure
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
  }, [showFailure, level?.fallbackLevelId, store, navigate]);`
);

// Update failure UI
content = content.replace(
  /<p className="text-gray-300 mb-8">错误次数过多（\{errorCount\} 次），请重新学习之前的关卡。<\/p>[\s\S]*?<\/button>/,
  `<p className="text-gray-300 mb-8">错误次数过多（{errorCount} 次），即将返回重新学习...</p>
            <div className="text-4xl font-mono text-rose-500 font-bold">{countdown}</div>`
);

fs.writeFileSync('src/pages/LevelPlay.tsx', content);
