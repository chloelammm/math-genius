import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, ChevronRight } from 'lucide-react';
import StarRating from './StarRating';

const CONFETTI_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#e879f9'];

function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 12,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '110vh', 
            opacity: [1, 1, 0],
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
          }}
          transition={{ 
            duration: particle.duration, 
            delay: particle.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

export default function CelebrationScreen({ 
  score, 
  totalQuestions, 
  stars, 
  onRetry, 
  onNextLevel, 
  onHome,
  hasNextLevel 
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getMessage = () => {
    if (stars === 3) return { text: '太棒了！完美！', emoji: '🏆' };
    if (stars === 2) return { text: '做得很好！', emoji: '🌟' };
    if (stars === 1) return { text: '繼續加油！', emoji: '💪' };
    return { text: '再試一次吧！', emoji: '🎯' };
  };

  const message = getMessage();

  return (
    <>
      {stars >= 2 && <Confetti />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Emoji */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl md:text-8xl mb-4"
          >
            {message.emoji}
          </motion.div>

          {/* Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {message.text}
          </h2>

          {/* Score */}
          <div className="my-6">
            <p className="text-lg text-gray-500 mb-2">你的分數</p>
            <p className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              {score}/{totalQuestions}
            </p>
            <p className="text-gray-400 mt-1">{percentage}% 正確</p>
          </div>

          {/* Stars */}
          <div className="my-8">
            <StarRating stars={stars} size="lg" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {hasNextLevel && stars >= 1 && (
              <Button
                onClick={onNextLevel}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                下一關 <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 h-12 text-lg font-bold rounded-xl border-2"
              >
                <RotateCcw className="mr-2 w-5 h-5" /> 再玩一次
              </Button>
              
              <Button
                onClick={onHome}
                variant="outline"
                className="flex-1 h-12 text-lg font-bold rounded-xl border-2"
              >
                <Home className="mr-2 w-5 h-5" /> 主頁
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}