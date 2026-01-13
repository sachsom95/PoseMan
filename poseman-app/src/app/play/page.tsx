'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Github } from 'lucide-react';
import Link from 'next/link';
import { useGameStore } from '@/store/game-store';
import { SVGAvatar } from '@/components/pose/svg-avatar';
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
    setMode,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    detectedLetter,
    setDetectedLetter,
    guessLetter,
    currentWord,
  } = useGameStore();

  const [countdown, setCountdown] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isAvatarReady, setIsAvatarReady] = useState(false);

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

  const handleLetterDetected = useCallback((letter: string | null, confidence: number) => {
    setDetectedLetter(letter, confidence);
  }, [setDetectedLetter]);

  // "Ready Set Go" animation like the original
  const handleStart = useCallback(() => {
    const words = ['Ready', 'Set', 'Go!'];
    let index = 0;

    setCountdown(words[index]);

    const interval = setInterval(() => {
      index++;
      if (index >= words.length) {
        clearInterval(interval);
        setCountdown(null);
        startGame();
      } else {
        setCountdown(words[index]);
      }
    }, 800);
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    setShowGameOver(false);
    resetGame();
  }, [resetGame]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header - matching original style */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">PoseMan</h1>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Home
          </Link>
          <a
            href="https://github.com/sachsom95/PoseMan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </nav>
      </header>

      {/* Main content - split screen like original */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left side - Avatar Canvas (larger) */}
          <div className="lg:col-span-8">
            <div className="relative aspect-square max-h-[600px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <SVGAvatar
                className="w-full h-full"
                onLetterDetected={handleLetterDetected}
                onReady={() => setIsAvatarReady(true)}
              />
            </div>

            {/* Detected letter label - like original */}
            <div className="mt-4 text-center">
              <AnimatePresence mode="wait">
                {status === 'playing' && detectedLetter ? (
                  <motion.div
                    key={detectedLetter}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="inline-block px-6 py-3 bg-purple-500/20 rounded-xl"
                  >
                    <span className="text-gray-400 text-sm">Detected: </span>
                    <span className="text-4xl font-bold text-purple-400 ml-2">{detectedLetter}</span>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500"
                  >
                    {status === 'idle' ? 'Make a pose to see it detected!' : 'Waiting for pose...'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - Game controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Welcome / Pre-game state */}
            {status === 'idle' && countdown === null && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome to PoseMan</h2>
                  <p className="text-gray-400">
                    Click Start to begin the game. See your animated avatar on left. Good Luck :)
                  </p>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold text-white mb-4">Select Difficulty</h3>
                  <DifficultySelector className="mb-6" />

                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full"
                    disabled={!isAvatarReady}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </Card>

                {/* Instructions */}
                <Card className="p-4 bg-gray-800/30">
                  <h4 className="font-semibold text-white mb-2 text-sm">How to Play</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Stand where your full body is visible</li>
                    <li>• Form letters with your body</li>
                    <li>• Guess the word before time runs out!</li>
                  </ul>
                </Card>
              </motion.div>
            )}

            {/* Playing state */}
            {(status === 'playing' || status === 'paused') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Timer */}
                <Card className="p-4 text-center">
                  <GameTimer />
                </Card>

                {/* Word to guess with image hint */}
                <Card className="p-6">
                  {currentWord?.imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 bg-gray-800 rounded-xl flex items-center justify-center">
                        <span className="text-6xl">
                          {/* Emoji based on word */}
                          {currentWord.word === 'CAT' ? '🐱' :
                           currentWord.word === 'DOG' ? '🐕' :
                           currentWord.word === 'BAT' ? '🦇' :
                           currentWord.word === 'SUN' ? '☀️' :
                           currentWord.word === 'HAT' ? '🎩' :
                           currentWord.word === 'TOY' ? '🧸' : '❓'}
                        </span>
                      </div>
                    </div>
                  )}
                  <WordDisplay />
                </Card>

                {/* Score */}
                <Card className="p-4">
                  <ScoreDisplay />
                </Card>

                {/* Controls */}
                <div className="flex gap-3">
                  {status === 'playing' ? (
                    <Button onClick={pauseGame} variant="outline" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeGame} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button onClick={resetGame} variant="ghost">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Ready Set Go Animation - like original */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          >
            <motion.h1
              key={countdown}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -50 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-7xl sm:text-9xl font-black text-white"
              style={{ textShadow: '0 0 40px rgba(168, 85, 247, 0.5)' }}
            >
              {countdown}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-500 text-sm">
        <p>
          PoseMan. Made with{' '}
          <a href="https://www.tensorflow.org/js" className="text-white hover:text-purple-400">
            TensorFlow.js
          </a>{' '}
          and{' '}
          <a href="https://github.com/tensorflow/tfjs-models" className="text-white hover:text-purple-400">
            MoveNet
          </a>
          .
        </p>
      </footer>

      {/* Game Over Modal */}
      <GameOverModal isOpen={showGameOver} onPlayAgain={handlePlayAgain} />
    </div>
  );
}
