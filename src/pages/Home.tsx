import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LEVELS } from '../data/levels';
import LevelCard from '../components/LevelCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const unlockedLevels = useStore((state) => state.unlockedLevels);

  return (
    <div className="min-h-screen bg-black text-white p-8 overflow-hidden relative">
      {/* 背景光晕效果 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-900/30 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/20 rounded-full blur-[100px] -z-10" />

      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] tracking-wider">
          音符宇宙探索
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          通过科学的艾宾浩斯记忆法，轻松掌握五线谱。从基础单音到复杂和弦，点亮你的音乐天赋。
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-cyan-100 flex items-center gap-2">
          <span className="w-2 h-6 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></span>
          关卡列表
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVELS.map((level) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            return (
              <LevelCard
                key={level.id}
                level={level}
                isUnlocked={isUnlocked}
                onClick={() => navigate(`/level/${level.id}`)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
