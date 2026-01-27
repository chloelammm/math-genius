import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, GraduationCap, Play, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SkillCard from '@/components/math/SkillCard';
import QuestionDisplay from '@/components/math/QuestionDisplay';
import CelebrationScreen from '@/components/math/CelebrationScreen';

const SKILLS = [
  { 
    id: 'add_no_carry', 
    name: '不進位加法',
    description: '個位相加不超過10',
    levels: [
      { range: [1, 9], questions: 5 },
      { range: [10, 29], questions: 5 },
      { range: [20, 49], questions: 5 },
      { range: [30, 69], questions: 5 },
      { range: [40, 89], questions: 5 },
    ]
  },
  { 
    id: 'add_with_carry', 
    name: '進位加法',
    description: '個位相加超過10需要進位',
    levels: [
      { range: [5, 15], questions: 5 },
      { range: [10, 30], questions: 5 },
      { range: [20, 50], questions: 5 },
      { range: [30, 70], questions: 5 },
      { range: [40, 90], questions: 5 },
    ]
  },
  { 
    id: 'sub_no_borrow', 
    name: '不退位減法',
    description: '個位夠減不需要借位',
    levels: [
      { range: [1, 9], questions: 5 },
      { range: [10, 29], questions: 5 },
      { range: [20, 49], questions: 5 },
      { range: [30, 69], questions: 5 },
      { range: [40, 89], questions: 5 },
    ]
  },
  { 
    id: 'sub_with_borrow', 
    name: '退位減法',
    description: '個位不夠減需要借位',
    levels: [
      { range: [11, 20], questions: 5 },
      { range: [20, 40], questions: 5 },
      { range: [30, 60], questions: 5 },
      { range: [40, 80], questions: 5 },
      { range: [50, 99], questions: 5 },
    ]
  },
  { 
    id: 'add_tens', 
    name: '十位數加法',
    description: '整十數相加',
    levels: [
      { range: [10, 30], questions: 5 },
      { range: [10, 50], questions: 5 },
      { range: [10, 70], questions: 5 },
      { range: [10, 90], questions: 5 },
      { range: [10, 90], questions: 5 },
    ]
  },
  { 
    id: 'sub_tens', 
    name: '十位數減法',
    description: '整十數相減',
    levels: [
      { range: [10, 30], questions: 5 },
      { range: [20, 50], questions: 5 },
      { range: [30, 70], questions: 5 },
      { range: [40, 90], questions: 5 },
      { range: [50, 90], questions: 5 },
    ]
  },
];

function generateSkillQuestion(skillId, level) {
  const skill = SKILLS.find(s => s.id === skillId);
  const levelConfig = skill.levels[level - 1];
  const [min, max] = levelConfig.range;
  
  let num1, num2;
  
  switch (skillId) {
    case 'add_no_carry':
      // Ensure ones digits sum < 10
      do {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
      } while ((num1 % 10) + (num2 % 10) >= 10 || num1 + num2 > 99);
      return { num1, num2, operation: '+' };
      
    case 'add_with_carry':
      // Ensure ones digits sum >= 10
      do {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (max - min + 1)) + min;
      } while ((num1 % 10) + (num2 % 10) < 10 || num1 + num2 > 99);
      return { num1, num2, operation: '+' };
      
    case 'sub_no_borrow':
      // Ensure ones digit of num1 >= ones digit of num2
      do {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * num1) + 1;
      } while ((num1 % 10) < (num2 % 10));
      return { num1, num2, operation: '-' };
      
    case 'sub_with_borrow':
      // Ensure ones digit of num1 < ones digit of num2
      do {
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      } while ((num1 % 10) >= (num2 % 10) || num1 <= num2);
      return { num1, num2, operation: '-' };
      
    case 'add_tens':
      // Round numbers only
      num1 = Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;
      num1 = Math.round(num1 / 10) * 10;
      do {
        num2 = Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;
        num2 = Math.round(num2 / 10) * 10;
      } while (num1 + num2 > 90);
      return { num1, num2, operation: '+' };
      
    case 'sub_tens':
      num1 = Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;
      num1 = Math.round(num1 / 10) * 10;
      num2 = Math.floor(Math.random() * (num1 / 10)) * 10 + 10;
      if (num2 > num1) num2 = num1 - 10;
      if (num2 < 10) num2 = 10;
      return { num1, num2, operation: '-' };
      
    default:
      return { num1: 5, num2: 3, operation: '+' };
  }
}

const TOTAL_QUESTIONS = 5;

export default function SkillPractice() {
  const queryClient = useQueryClient();
  
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [gameState, setGameState] = useState('select'); // select, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);

  const { data: skillProgress = [] } = useQuery({
    queryKey: ['skillProgress'],
    queryFn: () => base44.entities.SkillProgress.list(),
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      const existing = skillProgress.find(p => p.skill_type === data.skill_type);
      if (existing) {
        return base44.entities.SkillProgress.update(existing.id, data);
      }
      return base44.entities.SkillProgress.create(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skillProgress'] }),
  });

  const getSkillProgress = (skillId) => {
    return skillProgress.find(p => p.skill_type === skillId) || {
      level: 1,
      mastery_percentage: 0,
      total_correct: 0,
      total_attempted: 0,
    };
  };

  const startPractice = (skillId) => {
    const progress = getSkillProgress(skillId);
    const level = progress.level || 1;
    
    const newQuestions = Array.from({ length: TOTAL_QUESTIONS }).map(() =>
      generateSkillQuestion(skillId, level)
    );
    
    setSelectedSkill(skillId);
    setQuestions(newQuestions);
    setCurrentQuestion(1);
    setScore(0);
    setGameState('playing');
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion >= TOTAL_QUESTIONS) {
      const finalScore = isCorrect ? score + 1 : score;
      const progress = getSkillProgress(selectedSkill);
      const newTotalCorrect = (progress.total_correct || 0) + finalScore;
      const newTotalAttempted = (progress.total_attempted || 0) + TOTAL_QUESTIONS;
      const newMastery = Math.min(100, Math.round((newTotalCorrect / newTotalAttempted) * 100));
      
      // Level up if mastery >= 80% and answered at least 10 questions at this level
      let newLevel = progress.level || 1;
      if (newMastery >= 80 && newTotalAttempted >= 10 && newLevel < 5) {
        newLevel = newLevel + 1;
      }

      saveProgressMutation.mutate({
        skill_type: selectedSkill,
        level: newLevel,
        total_correct: newTotalCorrect,
        total_attempted: newTotalAttempted,
        mastery_percentage: newMastery,
      });
      
      setGameState('finished');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateStars = () => {
    if (score === TOTAL_QUESTIONS) return 3;
    if (score >= TOTAL_QUESTIONS - 1) return 2;
    if (score >= TOTAL_QUESTIONS - 2) return 1;
    return 0;
  };

  const currentQuestionData = questions[currentQuestion - 1];
  const currentSkillInfo = SKILLS.find(s => s.id === selectedSkill);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-teal-50 to-emerald-100">
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
              <GraduationCap className="w-5 h-5 text-teal-500" />
              {gameState === 'select' ? '循序漸進' : currentSkillInfo?.name}
            </h1>
            {gameState === 'playing' && (
              <p className="text-sm text-gray-500">
                等級 {getSkillProgress(selectedSkill).level || 1}
              </p>
            )}
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Skill Selection */}
          {gameState === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="bg-white/80 p-4">
                <p className="text-center text-gray-600">
                  選擇一個技能進行專項練習，掌握後自動升級！
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SKILLS.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skillType={skill.id}
                    progress={getSkillProgress(skill.id)}
                    isLocked={false}
                    onClick={() => startPractice(skill.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Playing */}
          {gameState === 'playing' && currentQuestionData && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <QuestionDisplay
                num1={currentQuestionData.num1}
                num2={currentQuestionData.num2}
                operation={currentQuestionData.operation}
                onAnswer={handleAnswer}
                questionNumber={currentQuestion}
                totalQuestions={TOTAL_QUESTIONS}
                theme={currentQuestion % 2 === 0 ? 'animals' : 'fruits'}
              />
            </motion.div>
          )}

          {/* Finished */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CelebrationScreen
                score={score}
                totalQuestions={TOTAL_QUESTIONS}
                stars={calculateStars()}
                onRetry={() => startPractice(selectedSkill)}
                onHome={() => setGameState('select')}
                onNextLevel={() => startPractice(selectedSkill)}
                hasNextLevel={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}