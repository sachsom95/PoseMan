'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/utils/cn';

interface WordDisplayProps {
  className?: string;
}

export function WordDisplay({ className }: WordDisplayProps) {
  const { currentWord, guessedLetters, detectedLetter, poseConfidence } = useGameStore();

  if (!currentWord) return null;

  const letters = currentWord.word.split('');

  return (
    <div className={cn('text-center', className)}>
      {/* Hint */}
      {currentWord.hint && (
        <p className="text-gray-400 mb-4 text-lg">Hint: {currentWord.hint}</p>
      )}

      {/* Word display */}
      <div className="flex justify-center gap-3 mb-6">
        {letters.map((letter, index) => {
          const isGuessed = guessedLetters.includes(letter);
          const isCurrentLetter = !isGuessed && detectedLetter === letter;

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'w-16 h-20 flex items-center justify-center rounded-xl text-4xl font-bold border-2 transition-all duration-300',
                isGuessed
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : isCurrentLetter
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400 animate-pulse'
                  : 'bg-gray-800 border-gray-700 text-gray-600'
              )}
            >
              {isGuessed ? letter : isCurrentLetter ? letter : '_'}
            </motion.div>
          );
        })}
      </div>

      {/* Detected letter indicator */}
      {detectedLetter && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-gray-400">Detected:</span>
          <span className="text-3xl font-bold text-purple-400">{detectedLetter}</span>
          <span className="text-sm text-gray-500">
            ({Math.round(poseConfidence * 100)}% confident)
          </span>
        </motion.div>
      )}
    </div>
  );
}
