'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Star } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/utils/cn';

interface ScoreDisplayProps {
  className?: string;
  showStreak?: boolean;
  showWordsCompleted?: boolean;
}

export function ScoreDisplay({
  className,
  showStreak = true,
  showWordsCompleted = true,
}: ScoreDisplayProps) {
  const { score, streak, wordsCompleted } = useGameStore();

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Score */}
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="text-2xl font-bold text-white"
          >
            {score}
          </motion.span>
        </AnimatePresence>
        <span className="text-gray-500 text-sm">pts</span>
      </div>

      {/* Streak */}
      {showStreak && streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full"
        >
          <Zap className="w-4 h-4 text-orange-500" />
          <span className="text-orange-400 font-semibold">{streak}x</span>
        </motion.div>
      )}

      {/* Words completed */}
      {showWordsCompleted && (
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-500" />
          <span className="text-gray-400">
            <span className="text-white font-semibold">{wordsCompleted}</span> words
          </span>
        </div>
      )}
    </div>
  );
}
