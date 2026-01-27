import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function TimerDisplay({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100;
  const isLow = timeLeft <= 10;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: isLow ? Infinity : 0, duration: 0.5 }}
      className={`
        flex items-center gap-3 px-4 py-2 rounded-full
        ${isLow ? 'bg-red-100' : 'bg-white/80'}
        shadow-lg backdrop-blur-sm
      `}
    >
      <Clock className={`w-5 h-5 ${isLow ? 'text-red-500' : 'text-blue-500'}`} />
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isLow ? 'bg-red-500' : 'bg-blue-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}