import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Play, Trophy, Zap, Clock, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// The following components are missing or cannot be found. 
// If you do not have these components or they are not needed, comment them out or remove their import lines.
// Otherwise, make sure the path is correct and they exist.

//
import TimerDisplay from '@/components/math/TimerDisplay';
import QuickAnswerInput from '@/components/math/QuickAnswerInput';
import StarRating from '@/components/math/StarRating';

const TIME_MODES = [
  { id: '60s', label: '1分鐘', seconds: 60, icon: '⚡' },
  { id: '120s', label: '2分鐘', seconds: 120, icon: '🔥' },
  { id: '180s', label: '3分鐘', seconds: 180, icon: '💪' },
];

const DIFFICULTIES = [
  { id: 'easy', label: '簡單', range: [1, 20], color: 'from-green-400 to-emerald-500' },
  { id: 'medium', label: '中等', range: [10, 50], color: 'from-yellow-400 to-orange-500' },
  { id: 'hard', label: '困難', range: [20, 99], color: 'from-red-400 to-rose-500' },
];

function generateQuestion(difficulty) {
  const diff = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
  const [min, max] = diff.range;
  const operation = Math.random() > 0.5 ? '+' : '-';
  
  let num1, num2;
  if (operation === '+') {
    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    while (num1 + num2 > 99) {
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  } else {
    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * num1) + 1;
    if (num2 > num1) [num1, num2] = [num2, num1];
  }
  
  return { num1, num2, operation };
}

export default function TimeChallenge() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState('setup'); // setup, playing, finished
  const [selectedTime, setSelectedTime] = useState('60s');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const { data: highScores = [] } = useQuery({
    queryKey: ['timeScores'],
    queryFn: () => base44.entities.TimeChallengeScore.list('-score', 10),
  });

  const { data: mistakes = [] } = useQuery({
    queryKey: ['mistakes'],
    queryFn: () => base44.entities.MistakeNote.list(),
  });

  const saveScoreMutation = useMutation({
    mutationFn: (data) => base44.entities.TimeChallengeScore.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeScores'] }),
  });

  const saveMistakeMutation = useMutation({
    mutationFn: (data) => base44.entities.MistakeNote.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mistakes'] }),
  });

  const timeMode = TIME_MODES.find(t => t.id === selectedTime);
  const totalTime = timeMode?.seconds || 60;

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setTimeLeft(totalTime);
    setScore(0);
    setTotalAttempted(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentQuestion(generateQuestion(selectedDifficulty));
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('finished');
    const accuracy = totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0;
    
    saveScoreMutation.mutate({
      mode: selectedTime,
      score: score,
      total_attempted: totalAttempted,
      accuracy: accuracy,
      difficulty: selectedDifficulty,
    });
  };

  const handleAnswer = (isCorrect, questionData) => {
    setTotalAttempted(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
      // Save mistake
      const mistakeType = determineMistakeType(questionData);
      saveMistakeMutation.mutate({
        ...questionData,
        correct_answer: questionData.correctAnswer,
        user_answer: questionData.userAnswer,
        mistake_type: mistakeType,
        practiced: false,
        practice_count: 0,
      });
    }
    
    setCurrentQuestion(generateQuestion(selectedDifficulty));
  };

  const determineMistakeType = ({ num1, num2, operation }) => {
    if (operation === '+') {
      const onesSum = (num1 % 10) + (num2 % 10);
      return onesSum >= 10 ? 'carry' : 'basic';
    } else {
      const onesDigit1 = num1 % 10;
      const onesDigit2 = num2 % 10;
      return onesDigit1 < onesDigit2 ? 'borrow' : 'basic';
    }
  };

  const calculateStars = () => {
    const accuracy = totalAttempted > 0 ? (score / totalAttempted) * 100 : 0;
    if (accuracy >= 90 && score >= 10) return 3;
    if (accuracy >= 70 && score >= 5) return 2;
    if (score >= 3) return 1;
    return 0;
  };

  const bestScore = highScores.find(s => s.mode === selectedTime && s.difficulty === selectedDifficulty)?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-50 to-red-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={createPageUrl('/home')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              計時挑戰
            </h1>
          </div>
          
          {gameState === 'playing' && (
            <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />
          )}
          {gameState !== 'playing' && <div className="w-10" />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Setup Screen */}
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Time selection */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    選擇時間
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_MODES.map((mode) => (
                      <Button
                        key={mode.id}
                        variant={selectedTime === mode.id ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(mode.id)}
                        className={`h-20 text-lg ${selectedTime === mode.id ? 'bg-blue-500' : ''}`}
                      >
                        <div className="text-center">
                          <span className="text-2xl block mb-1">{mode.icon}</span>
                          {mode.label}
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty selection */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    選擇難度
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map((diff) => (
                      <Button
                        key={diff.id}
                        variant="outline"
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={`h-20 ${selectedDifficulty === diff.id ? `bg-gradient-to-br ${diff.color} text-white border-0` : ''}`}
                      >
                        <div className="text-center">
                          <span className="text-lg font-bold block">{diff.label}</span>
                          <span className="text-xs opacity-80">{diff.range[0]}-{diff.range[1]}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Best score */}
              {bestScore > 0 && (
                <Card className="bg-gradient-to-r from-yellow-100 to-amber-100">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">最高紀錄</p>
                        <p className="text-2xl font-bold text-gray-800">{bestScore} 題</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Start button */}
              <Button
                onClick={startGame}
                className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Play className="w-6 h-6 mr-2" />
                開始挑戰！
              </Button>
            </motion.div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Score display */}
              <div className="flex justify-between items-center bg-white/80 rounded-2xl p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">得分</p>
                  <p className="text-3xl font-bold text-green-600">{score}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">連續答對</p>
                  <p className="text-3xl font-bold text-orange-500">{streak}🔥</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">已答</p>
                  <p className="text-3xl font-bold text-blue-600">{totalAttempted}</p>
                </div>
              </div>

              {/* Question */}
              <Card className="p-8">
                <QuickAnswerInput
                  num1={currentQuestion.num1}
                  num2={currentQuestion.num2}
                  operation={currentQuestion.operation}
                  onAnswer={handleAnswer}
                />
              </Card>
            </motion.div>
          )}

          {/* Finished Screen */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="p-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 2, duration: 0.5 }}
                  className="text-6xl mb-4"
                >
                  ⏱️
                </motion.div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">時間到！</h2>
                
                <div className="my-6">
                  <StarRating stars={calculateStars()} size="lg" />
                </div>

                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">正確</p>
                    <p className="text-3xl font-bold text-green-600">{score}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">總共</p>
                    <p className="text-3xl font-bold text-blue-600">{totalAttempted}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">最長連續</p>
                    <p className="text-3xl font-bold text-orange-600">{maxStreak}🔥</p>
                  </div>
                </div>

                <p className="text-lg text-gray-600 mb-6">
                  正確率: {totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={startGame}
                    className="flex-1 h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    再玩一次
                  </Button>
                  <Button
                    onClick={() => setGameState('setup')}
                    variant="outline"
                    className="flex-1 h-14 text-lg font-bold rounded-xl"
                  >
                    返回設定
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}