'use client';

import { motion } from 'framer-motion';
import { Zap, Target, Flame } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { GameDifficulty } from '@/types';
import { cn } from '@/utils/cn';

interface DifficultySelectorProps {
  className?: string;
}

const difficulties: { value: GameDifficulty; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: '3-letter words, 2 min timer',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '5-letter words, 90 sec timer',
    icon: <Target className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: '8+ letter words, 60 sec timer',
    icon: <Flame className="w-6 h-6" />,
    color: 'from-red-500 to-pink-500',
  },
];

export function DifficultySelector({ className }: DifficultySelectorProps) {
  const { difficulty, setDifficulty } = useGameStore();

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      {difficulties.map((diff, index) => (
        <motion.button
          key={diff.value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setDifficulty(diff.value)}
          className={cn(
            'relative p-4 rounded-xl border-2 transition-all duration-200',
            difficulty === diff.value
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          )}
        >
          {/* Selected indicator */}
          {difficulty === diff.value && (
            <motion.div
              layoutId="difficulty-indicator"
              className={cn(
                'absolute inset-0 rounded-xl bg-gradient-to-br opacity-20',
                diff.color
              )}
            />
          )}

          <div className="relative z-10">
            <div
              className={cn(
                'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br',
                diff.color
              )}
            >
              {diff.icon}
            </div>
            <h3 className="font-bold text-white mb-1">{diff.label}</h3>
            <p className="text-xs text-gray-400">{diff.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
