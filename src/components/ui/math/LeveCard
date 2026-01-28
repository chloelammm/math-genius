import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock } from 'lucide-react';

export default function LevelCard({ level, stars, isLocked, onClick, operationType }) {
  const getBgColor = () => {
    if (isLocked) return 'bg-gray-200';
    switch (operationType) {
      case 'addition': return 'bg-gradient-to-br from-emerald-400 to-teal-500';
      case 'subtraction': return 'bg-gradient-to-br from-orange-400 to-rose-500';
      case 'mixed': return 'bg-gradient-to-br from-violet-400 to-purple-500';
      default: return 'bg-gradient-to-br from-blue-400 to-indigo-500';
    }
  };

  const getIcon = () => {
    switch (operationType) {
      case 'addition': return '➕';
      case 'subtraction': return '➖';
      case 'mixed': return '🔀';
      default: return '🔢';
    }
  };

  return (
    <motion.button
      onClick={!isLocked ? onClick : undefined}
      whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      className={`
        relative w-20 h-20 md:w-28 md:h-28 rounded-2xl shadow-lg
        ${getBgColor()}
        ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-200
      `}
    >
      {isLocked ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Lock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <span className="text-2xl md:text-3xl mb-1">{getIcon()}</span>
          <span className="text-xl md:text-2xl font-bold">{level}</span>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 md:w-4 md:h-4 ${s <= stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Shine effect */}
      {!isLocked && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rotate-12 transform translate-x-full animate-pulse" />
        </div>
      )}
    </motion.button>
  );
}