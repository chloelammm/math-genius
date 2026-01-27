import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BookOpen, Trash2, Play, CheckCircle, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MistakeCard from '@/components/math/MistakeCard';
import QuickAnswerInput from '@/components/math/QuickAnswerInput';

export default function MistakeNotes() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [practiceResults, setPracticeResults] = useState({ correct: 0, total: 0 });

  const { data: mistakes = [], isLoading } = useQuery({
    queryKey: ['mistakes'],
    queryFn: () => base44.entities.MistakeNote.list('-created_date'),
  });

  const updateMistakeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MistakeNote.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mistakes'] }),
  });

  const deleteMistakeMutation = useMutation({
    mutationFn: (id) => base44.entities.MistakeNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mistakes'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      for (const mistake of mistakes) {
        await base44.entities.MistakeNote.delete(mistake.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mistakes'] }),
  });

  const filteredMistakes = mistakes.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unpracticed') return !m.practiced;
    if (filter === 'practiced') return m.practiced;
    return m.mistake_type === filter;
  });

  const startPractice = (selectedMistakes = null) => {
    const toPractice = selectedMistakes || filteredMistakes.filter(m => !m.practiced);
    if (toPractice.length === 0) return;
    
    setPracticeQueue(toPractice);
    setCurrentPracticeIndex(0);
    setPracticeResults({ correct: 0, total: 0 });
    setPracticeMode(true);
  };

  const handlePracticeAnswer = (isCorrect, questionData) => {
    const currentMistake = practiceQueue[currentPracticeIndex];
    
    // Update mistake
    updateMistakeMutation.mutate({
      id: currentMistake.id,
      data: {
        practiced: true,
        practice_count: (currentMistake.practice_count || 0) + 1,
      }
    });

    setPracticeResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Move to next question or finish
    setTimeout(() => {
      if (currentPracticeIndex < practiceQueue.length - 1) {
        setCurrentPracticeIndex(prev => prev + 1);
      } else {
        setPracticeMode(false);
      }
    }, 800);
  };

  const currentPracticeQuestion = practiceQueue[currentPracticeIndex];

  const unpracticedCount = mistakes.filter(m => !m.practiced).length;
  const mistakeTypes = {
    carry: mistakes.filter(m => m.mistake_type === 'carry').length,
    borrow: mistakes.filter(m => m.mistake_type === 'borrow').length,
    basic: mistakes.filter(m => m.mistake_type === 'basic').length,
  };

  if (practiceMode && currentPracticeQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-rose-100">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setPracticeMode(false)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-800">錯題練習</h1>
              <p className="text-sm text-gray-500">
                {currentPracticeIndex + 1} / {practiceQueue.length}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-green-600 font-bold">
                {practiceResults.correct} ✓
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {practiceQueue.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentPracticeIndex ? 'bg-green-400' :
                  i === currentPracticeIndex ? 'bg-blue-500 scale-125' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Card className="p-8">
            <QuickAnswerInput
              num1={currentPracticeQuestion.num1}
              num2={currentPracticeQuestion.num2}
              operation={currentPracticeQuestion.operation}
              onAnswer={handlePracticeAnswer}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Practice complete screen
  if (practiceMode && !currentPracticeQuestion && practiceResults.total > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">練習完成！</h2>
          <p className="text-lg text-gray-600 mb-6">
            答對 {practiceResults.correct} / {practiceResults.total} 題
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setPracticeMode(false)}
              className="flex-1"
            >
              返回錯題本
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-rose-100">
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
              <BookOpen className="w-5 h-5 text-purple-500" />
              錯題本
            </h1>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white/80">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{mistakes.length}</p>
              <p className="text-sm text-gray-500">總錯題</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{unpracticedCount}</p>
              <p className="text-sm text-gray-500">待練習</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{mistakeTypes.carry}</p>
              <p className="text-sm text-gray-500">進位錯誤</p>
            </CardContent>
          </Card>
          <Card className="bg-rose-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-rose-600">{mistakeTypes.borrow}</p>
              <p className="text-sm text-gray-500">退位錯誤</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {mistakes.length > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={() => startPractice()}
              disabled={unpracticedCount === 0}
              className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Play className="w-5 h-5 mr-2" />
              練習未完成 ({unpracticedCount})
            </Button>
            <Button
              onClick={() => startPractice(filteredMistakes)}
              variant="outline"
              className="h-12"
            >
              練習全部
            </Button>
          </div>
        )}

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="unpracticed">未練習</TabsTrigger>
            <TabsTrigger value="carry">進位</TabsTrigger>
            <TabsTrigger value="borrow">退位</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Mistake list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-xl">載入中...</div>
          </div>
        ) : filteredMistakes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {mistakes.length === 0 ? '還沒有錯題' : '沒有符合條件的錯題'}
            </h3>
            <p className="text-gray-500">
              {mistakes.length === 0 ? '繼續練習，錯題會自動收集到這裡' : '試試其他篩選條件'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredMistakes.map((mistake, index) => (
                <MistakeCard
                  key={mistake.id}
                  mistake={mistake}
                  index={index}
                  onPractice={(m) => startPractice([m])}
                  onDelete={(id) => deleteMistakeMutation.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Clear all button */}
        {mistakes.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => {
                if (confirm('確定要清除所有錯題嗎？')) {
                  deleteAllMutation.mutate();
                }
              }}
              variant="ghost"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除所有錯題
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}