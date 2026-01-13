'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useGameStore } from '@/store/game-store';
import { PoseCamera } from '@/components/pose/pose-camera';
import { WordDisplay } from '@/components/game/word-display';
import { GameTimer } from '@/components/game/game-timer';
import { ScoreDisplay } from '@/components/game/score-display';
import { DifficultySelector } from '@/components/game/difficulty-selector';
import { GameOverModal } from '@/components/game/game-over-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PlayPage() {
  const {
    status,
    mode,
    setMode,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    detectedLetter,
    guessLetter,
    currentWord,
  } = useGameStore();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Set mode to classic on mount
  useEffect(() => {
    setMode('classic');
    return () => resetGame();
  }, [setMode, resetGame]);

  // Handle detected letters - auto guess
  useEffect(() => {
    if (status === 'playing' && detectedLetter && currentWord) {
      const letterInWord = currentWord.word.includes(detectedLetter);
      if (letterInWord) {
        guessLetter(detectedLetter);
      }
    }
  }, [detectedLetter, status, currentWord, guessLetter]);

  // Show game over modal when finished
  useEffect(() => {
    if (status === 'finished') {
      setShowGameOver(true);
    }
  }, [status]);

  const handleStart = useCallback(() => {
    // Start countdown
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          startGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    resetGame();
  }, [resetGame]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <h1 className="text-2xl font-bold text-white">Classic Mode</h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera feed */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden">
              <PoseCamera className="aspect-[4/3] w-full" />
            </Card>

            {/* Detected letter indicator */}
            {status === 'playing' && detectedLetter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center"
              >
                <p className="text-gray-400 mb-1">Making pose:</p>
                <p className="text-6xl font-bold text-purple-400">{detectedLetter}</p>
              </motion.div>
            )}
          </div>

          {/* Game panel */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Pre-game: Difficulty selection */}
            {status === 'idle' && countdown === null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Select Difficulty</h2>
                  <DifficultySelector className="mb-6" />

                  <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-white mb-2">How to Play</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>Stand in front of your camera where your full body is visible</li>
                      <li>Form letters with your body poses (T, Y, I, etc.)</li>
                      <li>Guess the word before time runs out!</li>
                    </ul>
                  </div>

                  <Button onClick={handleStart} size="lg" className="w-full">
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Countdown */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                >
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="text-9xl font-bold text-purple-500"
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Playing state */}
            {(status === 'playing' || status === 'paused') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Timer and score */}
                <Card className="p-4">
                  <GameTimer className="mb-4" />
                  <ScoreDisplay />
                </Card>

                {/* Word display */}
                <Card className="p-6">
                  <WordDisplay />
                </Card>

                {/* Controls */}
                <div className="flex gap-4">
                  {status === 'playing' ? (
                    <Button onClick={pauseGame} variant="secondary" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeGame} variant="secondary" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={resetGame} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </div>

                {/* Pose guide */}
                <Card className="p-4">
                  <h3 className="font-semibold text-white mb-3">Quick Pose Guide</h3>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-purple-400">T</p>
                      <p className="text-gray-500">Arms out</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-purple-400">Y</p>
                      <p className="text-gray-500">Arms up wide</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-purple-400">I</p>
                      <p className="text-gray-500">Arms up straight</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <p className="text-2xl font-bold text-purple-400">A</p>
                      <p className="text-gray-500">Hands together up</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal isOpen={showGameOver} onPlayAgain={handlePlayAgain} />
    </div>
  );
}
