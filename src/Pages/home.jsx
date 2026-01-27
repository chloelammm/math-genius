import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Play, Book, Trophy, Zap, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LevelCard from '@/components/math/LevelCard';

const LEVELS = [
  { id: 1, operation: 'addition', name: '簡單加法', range: [1, 10] },
  { id: 2, operation: 'addition', name: '進階加法', range: [10, 20] },
  { id: 3, operation: 'addition', name: '挑戰加法', range: [10, 50] },
  { id: 4, operation: 'subtraction', name: '簡單減法', range: [1, 10] },
  { id: 5, operation: 'subtraction', name: '進階減法', range: [10, 20] },
  { id: 6, operation: 'subtraction', name: '挑戰減法', range: [10, 50] },
  { id: 7, operation: 'mixed', name: '混合練習 I', range: [1, 20] },
  { id: 8, operation: 'mixed', name: '混合練習 II', range: [10, 30] },
  { id: 9, operation: 'mixed', name: '數學大師', range: [10, 50] },
];

export default function Home() {
  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.list(),
  });

  const getLevelProgress = (levelId) => {
    const levelProgress = progress.find(p => p.level_id === levelId);
    return levelProgress || { stars_earned: 0, completed: false };
  };

  const isLevelUnlocked = (levelId) => {
    if (levelId === 1) return true;
    const prevLevelProgress = getLevelProgress(levelId - 1);
    return prevLevelProgress.completed && prevLevelProgress.stars_earned >= 1;
  };

  const totalStars = progress.reduce((sum, p) => sum + (p.stars_earned || 0), 0);
  const maxStars = LEVELS.length * 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-indigo-100">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-20 left-10 text-6xl opacity-20"
        >🎈</motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute top-40 right-10 text-5xl opacity-20"
        >✨</motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute bottom-40 left-20 text-5xl opacity-20"
        >🌟</motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-6xl md:text-8xl"
            >
              🧮
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            數學小天才
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            學習加法和減法，成為數學高手！
          </p>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">我的星星</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800">
                  {totalStars} <span className="text-lg text-gray-400">/ {maxStars}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 md:w-8 md:h-8 ${i <= Math.ceil(totalStars / (maxStars / 3)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Level categories */}
        <div className="space-y-8">
          {/* Addition levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                ➕
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">加法</h2>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {LEVELS.filter(l => l.operation === 'addition').map((level) => (
                <Link key={level.id} to={createPageUrl(`Play?level=${level.id}`)}>
                  <LevelCard
                    level={level.id}
                    stars={getLevelProgress(level.id).stars_earned}
                    isLocked={!isLevelUnlocked(level.id)}
                    operationType={level.operation}
                  />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Subtraction levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                ➖
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">減法</h2>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {LEVELS.filter(l => l.operation === 'subtraction').map((level) => (
                <Link key={level.id} to={createPageUrl(`Play?level=${level.id}`)}>
                  <LevelCard
                    level={level.id}
                    stars={getLevelProgress(level.id).stars_earned}
                    isLocked={!isLevelUnlocked(level.id)}
                    operationType={level.operation}
                  />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Mixed levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold">
                🔀
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">混合練習</h2>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {LEVELS.filter(l => l.operation === 'mixed').map((level) => (
                <Link key={level.id} to={createPageUrl(`Play?level=${level.id}`)}>
                  <LevelCard
                    level={level.id}
                    stars={getLevelProgress(level.id).stars_earned}
                    isLocked={!isLevelUnlocked(level.id)}
                    operationType={level.operation}
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Game Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-blue-500" />
            更多練習模式
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Challenge */}
            <Link to={createPageUrl('TimeChallenge')}>
              <Card className="bg-gradient-to-br from-amber-400 to-orange-500 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-white text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-1">計時挑戰</h3>
                  <p className="text-sm text-white/80">
                    限時內答越多越好！
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Mistake Notes */}
            <Link to={createPageUrl('MistakeNotes')}>
              <Card className="bg-gradient-to-br from-purple-400 to-pink-500 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-white text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-1">錯題本</h3>
                  <p className="text-sm text-white/80">
                    複習做錯的題目
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Skill Practice */}
            <Link to={createPageUrl('SkillPractice')}>
              <Card className="bg-gradient-to-br from-teal-400 to-cyan-500 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-white text-center">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-1">循序漸進</h3>
                  <p className="text-sm text-white/80">
                    專項技能練習
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center"
        >
          <Book className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <h3 className="font-bold text-gray-800 mb-2">小提示</h3>
          <p className="text-sm text-gray-600">
            每關有5道題目，答對越多星星越多！<br />
            獲得至少1顆星星才能解鎖下一關哦！
          </p>
        </motion.div>
      </div>
    </div>
  );
}