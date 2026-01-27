import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QuickAnswerInput({ 
  num1, 
  num2, 
  operation, 
  onAnswer,
  autoFocus = true
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  const correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;

  useEffect(() => {
    setUserAnswer('');
    setFeedback(null);
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [num1, num2, operation]);

  const handleSubmit = () => {
    if (userAnswer === '') return;
    
    const answer = parseInt(userAnswer);
    const isCorrect = answer === correctAnswer;
    
    setFeedback({ isCorrect, correctAnswer });
    
    setTimeout(() => {
      onAnswer(isCorrect, { num1, num2, operation, correctAnswer, userAnswer: answer });
      setUserAnswer('');
      setFeedback(null);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Question */}
      <div className="text-center mb-4">
        <p className="text-3xl md:text-5xl font-bold text-gray-800">
          {num1} {operation} {num2} = 
          <span className="text-blue-500 ml-2">?</span>
        </p>
      </div>

      {/* Input area */}
      <div className="flex items-center justify-center gap-3">
        <Input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="?"
          className="text-center text-3xl font-bold h-16 w-32 rounded-xl border-3 border-blue-300 focus:border-blue-500"
          disabled={feedback !== null}
        />
        <Button
          onClick={handleSubmit}
          disabled={userAnswer === '' || feedback !== null}
          className="h-16 px-6 text-xl font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          確認
        </Button>
      </div>

      {/* Quick feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`
              absolute inset-0 flex items-center justify-center
              rounded-2xl
              ${feedback.isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'}
            `}
          >
            {feedback.isCorrect ? (
              <Check className="w-16 h-16 text-white" />
            ) : (
              <div className="text-center text-white">
                <X className="w-12 h-12 mx-auto" />
                <p className="text-lg mt-1">答案: {feedback.correctAnswer}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}