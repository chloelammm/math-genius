import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trash2, CheckCircle } from 'lucide-react';

const MISTAKE_TYPE_LABELS = {
  carry: '進位錯誤',
  borrow: '退位錯誤',
  basic: '基本運算',
  mixed: '其他'
};

export default function MistakeCard({ mistake, onPractice, onDelete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        bg-white rounded-xl p-4 shadow-md border-l-4
        ${mistake.practiced ? 'border-green-400' : 'border-orange-400'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-gray-800">
              {mistake.num1} {mistake.operation} {mistake.num2}
            </span>
            <Badge variant="outline" className="text-xs">
              {MISTAKE_TYPE_LABELS[mistake.mistake_type] || '其他'}
            </Badge>
            {mistake.practiced && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <div className="flex gap-4 text-sm">
            <span className="text-red-500">
              你的答案: <strong>{mistake.user_answer}</strong>
            </span>
            <span className="text-green-600">
              正確答案: <strong>{mistake.correct_answer}</strong>
            </span>
          </div>
          
          {mistake.practice_count > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              已練習 {mistake.practice_count} 次
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPractice(mistake)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            練習
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(mistake.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}