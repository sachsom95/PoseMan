'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, RotateCcw, Home, Share2 } from 'lucide-react';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GameOverModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
}

export function GameOverModal({ isOpen, onPlayAgain }: GameOverModalProps) {
  const router = useRouter();
  const { score, wordsCompleted, exercisesCompleted, mode, resetGame } = useGameStore();
  const { profile, stats } = useAuthStore();

  // Trigger confetti on high scores
  useEffect(() => {
    if (isOpen && score > 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f59e0b'],
      });
    }
  }, [isOpen, score]);

  const handleGoHome = () => {
    resetGame();
    router.push('/');
  };

  const handleShare = async () => {
    const text = `I scored ${score} points playing PoseMan! Can you beat my score? 🎮💪`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PoseMan Score',
          text,
          url: window.location.origin,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  const isNewHighScore = stats && score > (stats.totalScore / Math.max(stats.totalGames, 1));

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="md">
      <div className="text-center">
        {/* Trophy animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {isNewHighScore ? 'New High Score!' : 'Game Over!'}
        </h2>
        <p className="text-gray-400 mb-8">
          {isNewHighScore
            ? 'You beat your average score!'
            : 'Great effort! Keep practicing to improve.'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Score</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-purple-400"
            >
              {score}
            </motion.p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">
              {mode === 'fitness' ? 'Exercises' : 'Words'}
            </p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-green-400"
            >
              {mode === 'fitness' ? exercisesCompleted : wordsCompleted}
            </motion.p>
          </div>
        </div>

        {/* XP earned (if logged in) */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-8 text-yellow-400"
          >
            <Star className="w-5 h-5" />
            <span className="font-semibold">+{Math.floor(score / 10)} XP earned!</span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={onPlayAgain} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>

          <div className="flex gap-3">
            <Button onClick={handleGoHome} variant="secondary" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Sign up prompt for guests */}
        {!profile && (
          <p className="mt-6 text-sm text-gray-500">
            <button
              onClick={() => router.push('/auth')}
              className="text-purple-400 hover:underline"
            >
              Sign up
            </button>
            {' '}to save your scores and compete on leaderboards!
          </p>
        )}
      </div>
    </Modal>
  );
}
