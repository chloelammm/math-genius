import React from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍌', '🍒', '🫐'];
const ANIMALS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🐸', '🐵', '🐯'];

export default function VisualCounter({ count, theme = 'fruits', showCrossed = false, maxDisplay = 20 }) {
  const items = theme === 'fruits' ? EMOJIS : ANIMALS;
  const displayCount = Math.min(count, maxDisplay);
  
  // Create rows of items (max 10 per row)
  const rows = [];
  let remaining = displayCount;
  while (remaining > 0) {
    const rowCount = Math.min(remaining, 10);
    rows.push(rowCount);
    remaining -= rowCount;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {rows.map((rowCount, rowIndex) => (
        <div key={rowIndex} className="flex flex-wrap justify-center gap-1 md:gap-2">
          {Array.from({ length: rowCount }).map((_, itemIndex) => {
            const globalIndex = rowIndex * 10 + itemIndex;
            const emoji = items[globalIndex % items.length];
            
            return (
              <motion.div
                key={itemIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: globalIndex * 0.05,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className={`text-2xl md:text-4xl ${showCrossed ? 'opacity-40 line-through' : ''}`}
              >
                {emoji}
              </motion.div>
            );
          })}
        </div>
      ))}
      {count > maxDisplay && (
        <p className="text-sm text-gray-500 mt-1">+{count - maxDisplay} 更多</p>
      )}
    </div>
  );
}