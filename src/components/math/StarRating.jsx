import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function StarRating({ stars, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center gap-2 md:gap-4">
      {[1, 2, 3].map((index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: index <= stars ? 1 : 0.7, 
            rotate: 0 
          }}
          transition={{ 
            delay: index * 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${index <= stars 
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' 
                : 'fill-gray-300 text-gray-300'
              }
            `}
          />
        </motion.div>
      ))}
    </div>
  );
}