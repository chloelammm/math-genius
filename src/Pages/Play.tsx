import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import QuestionDisplay from '@/components/math/QuestionDisplay';
import CelebrationScreen from '@/components/math/CelebrationScreen';

const LEVELS = [
  { id: 1, operation: 'addition', name: '簡單加法', range: [1, 10], theme: 'fruits' },
  { id: 2, operation: 'addition', name: '進階加法', range: [10, 20], theme: 'animals' },
  { id: 3, operation: 'addition', name: '挑戰加法', range: [10, 50], theme: 'fruits' },
  { id: 4, operation: 'subtraction', name: '簡單減法', range: [1, 10], theme: 'animals' },
  { id: 5, operation: 'subtraction', name: '進階減法', range: [10, 20], theme: 'fruits' },
  { id: 6, operation: 'subtraction', name: '挑戰減法', range: [10, 50], theme: 'animals' },
  { id: 7, operation: 'mixed', name: '混合練習 I', range: [1, 20], theme: 'fruits' },
  { id: 8, operation: 'mixed', name: '混合練習 II', range: [10, 30], theme: 'animals' },
  { id: 9, operation: 'mixed', name: '數學大師', range: [10, 50], theme: 'fruits' },
];

const TOTAL_QUESTIONS = 5;

function generateQuestion(level) {
  const [min, max] = level.range;
  let num1, num2, operation;

  if (level.operation === 'mixed') {
    operation = Math.random() > 0.5 ? '+' : '-';
  } else {
    operation = level.operation === 'addition' ? '+' : '-';
  }

  if (operation === '+') {
    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    // Ensure sum doesn't exceed 99 for two-digit focus
    while (num1 + num2 > 99) {
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  } else {
    // For subtraction, ensure num1 >= num2 for positive results
    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * num1) + 1;
    // Ensure num1 is larger
    if (num2 > num1) {
      [num1, num2] = [num2, num1];
    }
  }

  return { num1, num2, operation };
}

export default function Play() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const urlParams = new URLSearchParams(window.location.search);
  const levelId = parseInt(urlParams.get('level')) || 1;
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'finished'
  const [questions, setQuestions] = useState([]);

  // Generate all questions at the start
  useEffect(() => {
    const newQuestions = Array.from({ length: TOTAL_QUESTIONS }).map(() => 
      generateQuestion(level)
    );
    setQuestions(newQuestions);
    setCurrentQuestion(1);
    setScore(0);
    setGameState('playing');
  }, [levelId]);

  const { data: progress = [] } = useQuery({
    queryKey: ['progress'],
    queryFn: () => base44.entities.Progress.list(),
  });

  // Clear progress on page mount
  useEffect(() => {
    const clearProgress = async () => {
      if (progress.length > 0) {
        for (const p of progress) {
          await base44.entities.Progress.delete(p.id);
        }
        queryClient.invalidateQueries({ queryKey: ['progress'] });
      }
    };
    clearProgress();
  }, []);

  const saveProgressMutation = useMutation({
    mutationFn: async (newProgress) => {
      const existing = progress.find(p => p.level_id === levelId);
      if (existing) {
        // Only update if new score is better
        if (newProgress.stars_earned > existing.stars_earned) {
          return base44.entities.Progress.update(existing.id, newProgress);
        }
        return existing;
      }
      return base44.entities.Progress.create(newProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const saveMistakeMutation = useMutation({
    mutationFn: (mistake) => base44.entities.MistakeNote.create(mistake),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mistakes'] });
    },
  });

  const currentQuestionData = questions[currentQuestion - 1];

  const handleAnswer = (isCorrect, userAnswer) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Save mistake
      const correctAnswer = currentQuestionData.operation === '+' 
        ? currentQuestionData.num1 + currentQuestionData.num2 
        : currentQuestionData.num1 - currentQuestionData.num2;
      const mistakeType = level.operation === 'mixed' ? 'mixed_error' : 
        (currentQuestionData.operation === '+' ? 'addition_error' : 'subtraction_error');
      
      saveMistakeMutation.mutate({
        num1: currentQuestionData.num1,
        num2: currentQuestionData.num2,
        operation: currentQuestionData.operation,
        correct_answer: correctAnswer,
        user_answer: parseInt(userAnswer) || 0,
        mistake_type: mistakeType,
        practiced: false,
        practice_count: 0,
      });
    }

    if (currentQuestion >= TOTAL_QUESTIONS) {
      const finalScore = isCorrect ? score + 1 : score;
      const stars = calculateStars(finalScore);
      
      // Save progress
      saveProgressMutation.mutate({
        level_id: levelId,
        stars_earned: stars,
        best_score: finalScore,
        completed: true,
        operation_type: level.operation,
      });
      
      setGameState('finished');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateStars = (finalScore) => {
    if (finalScore === TOTAL_QUESTIONS) return 3;
    if (finalScore >= TOTAL_QUESTIONS - 1) return 2;
    if (finalScore >= TOTAL_QUESTIONS - 2) return 1;
    return 0;
  };

  const handleRetry = () => {
    const newQuestions = Array.from({ length: TOTAL_QUESTIONS }).map(() => 
      generateQuestion(level)
    );
    setQuestions(newQuestions);
    setCurrentQuestion(1);
    setScore(0);
    setGameState('playing');
  };

  const handleNextLevel = () => {
    if (levelId < LEVELS.length) {
      navigate(createPageUrl(`Play?level=${levelId + 1}`));
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const getBgGradient = () => {
    switch (level.operation) {
      case 'addition': return 'from-emerald-100 via-teal-50 to-cyan-100';
      case 'subtraction': return 'from-orange-100 via-rose-50 to-pink-100';
      case 'mixed': return 'from-violet-100 via-purple-50 to-indigo-100';
      default: return 'from-blue-100 via-sky-50 to-indigo-100';
    }
  };

  if (!currentQuestionData && gameState === 'playing') {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${getBgGradient()} flex items-center justify-center`}>
        <div className="animate-pulse text-2xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getBgGradient()}`}>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              第 {levelId} 關
            </h1>
            <p className="text-xs md:text-sm text-gray-500">{level.name}</p>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {gameState === 'playing' ? (
          <QuestionDisplay
            num1={currentQuestionData.num1}
            num2={currentQuestionData.num2}
            operation={currentQuestionData.operation}
            onAnswer={handleAnswer}
            questionNumber={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            theme={level.theme}
          />
        ) : (
          <CelebrationScreen
            score={score}
            totalQuestions={TOTAL_QUESTIONS}
            stars={calculateStars(score)}
            onRetry={handleRetry}
            onNextLevel={handleNextLevel}
            onHome={handleHome}
            hasNextLevel={levelId < LEVELS.length}
          />
        )}
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
    </div>
  );
}