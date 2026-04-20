import React from 'react';
import type { Level } from '../store/useStore';

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  onClick: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, isUnlocked, onClick }) => {
  return (
    <div
      onClick={isUnlocked ? onClick : undefined}
      className={`relative p-6 rounded-xl border border-transparent bg-gray-900 transition-all duration-300
        ${isUnlocked 
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] border-cyan-500/50 hover:border-cyan-400' 
          : 'cursor-not-allowed opacity-60 grayscale'}
      `}
      style={isUnlocked ? {
        boxShadow: '0 0 10px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)',
      } : {}}
    >
      {/* 霓虹灯发光边框效果（通过伪元素增强） */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-cyan-400 opacity-30 shadow-[0_0_8px_#22d3ee]" />
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-xl font-bold ${isUnlocked ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-gray-400'}`}>
          {level.title}
        </h3>
        
        {/* 锁定图标 */}
        {!isUnlocked && (
          <div className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        )}
      </div>
      
      <p className="text-gray-300 text-sm line-clamp-2">
        {level.description}
      </p>

      <div className="mt-4 flex gap-2">
        <span className={`text-xs px-2 py-1 rounded border 
          ${isUnlocked 
            ? 'border-cyan-500/30 text-cyan-300 bg-cyan-950/50' 
            : 'border-gray-600 text-gray-400 bg-gray-800'}`}
        >
          {getTypeLabel(level.type)}
        </span>
      </div>
    </div>
  );
};

// 辅助函数，用于将关卡类型转换为中文标签
function getTypeLabel(type: Level['type']) {
  const map: Record<Level['type'], string> = {
    teaching: '教学',
    single_note: '单音测试',
    multi_note: '和弦测试',
    song: '曲目',
    review: '智能复习',
  };
  return map[type] || type;
}

export default LevelCard;
