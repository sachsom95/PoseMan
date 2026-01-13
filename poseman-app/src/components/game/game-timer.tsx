'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/utils/cn';

interface GameTimerProps {
  className?: string;
}

export function GameTimer({ className }: GameTimerProps) {
  const { timeRemaining, totalTime, status, updateTimer } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'playing') {
      intervalRef.current = setInterval(() => {
        updateTimer(timeRemaining - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeRemaining, updateTimer]);

  const percentage = (timeRemaining / totalTime) * 100;
  const isLow = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Clock
        className={cn(
          'w-6 h-6',
          isCritical ? 'text-red-500 animate-pulse' : isLow ? 'text-yellow-500' : 'text-gray-400'
        )}
      />

      <div className="flex-1">
        {/* Progress bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isCritical ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-purple-500'
            )}
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <motion.span
        className={cn(
          'text-lg font-mono font-bold min-w-[60px] text-right',
          isCritical ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-white'
        )}
        animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: isCritical ? Infinity : 0, duration: 0.5 }}
      >
        {formatTime(timeRemaining)}
      </motion.span>
    </div>
  );
}
