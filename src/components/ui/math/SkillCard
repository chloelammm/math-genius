import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2 } from 'lucide-react';

const SKILL_INFO = {
  add_no_carry: { name: '不進位加法', icon: '➕', color: 'from-green-400 to-emerald-500', example: '23 + 14' },
  add_with_carry: { name: '進位加法', icon: '🔢', color: 'from-teal-400 to-cyan-500', example: '28 + 15' },
  sub_no_borrow: { name: '不退位減法', icon: '➖', color: 'from-orange-400 to-amber-500', example: '47 - 23' },
  sub_with_borrow: { name: '退位減法', icon: '📊', color: 'from-rose-400 to-pink-500', example: '42 - 18' },
  add_tens: { name: '十位數加法', icon: '🔟', color: 'from-blue-400 to-indigo-500', example: '30 + 40' },
  sub_tens: { name: '十位數減法', icon: '🎯', color: 'from-purple-400 to-violet-500', example: '70 - 30' },
};

export default function SkillCard({ skillType, progress, isLocked, onClick }) {
  const skill = SKILL_INFO[skillType];
  const mastery = progress?.mastery_percentage || 0;
  const level = progress?.level || 1;

  return (
    <motion.button
      onClick={!isLocked ? onClick : undefined}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={`
        w-full p-4 rounded-2xl text-left transition-all
        ${isLocked 
          ? 'bg-gray-100 cursor-not-allowed' 
          : `bg-gradient-to-br ${skill.color} shadow-lg hover:shadow-xl`
        }
      `}
    >
      {isLocked ? (
        <div className="flex items-center justify-center py-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <div className="text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{skill.icon}</span>
            {mastery >= 100 && (
              <CheckCircle2 className="w-6 h-6 text-yellow-300" />
            )}
          </div>
          
          <h3 className="text-lg font-bold mb-1">{skill.name}</h3>
          <p className="text-sm text-white/80 mb-3">例：{skill.example}</p>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>等級 {level}/5</span>
              <span>{Math.round(mastery)}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.button>
  );
}