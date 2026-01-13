'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Clock, Flame, Lock, Crown } from 'lucide-react';
import Link from 'next/link';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import { PoseCamera } from '@/components/pose/pose-camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { fitnessRoutines } from '@/lib/game-data';
import type { FitnessRoutine, FitnessExercise } from '@/types';

export default function FitnessPage() {
  const {
    status,
    setMode,
    currentRoutine,
    currentExercise,
    exerciseIndex,
    exerciseTimer,
    exercisesCompleted,
    score,
    startRoutine,
    completeExercise,
    updateExerciseTimer,
    resetGame,
  } = useGameStore();

  const { profile } = useAuthStore();
  const [selectedRoutine, setSelectedRoutine] = useState<FitnessRoutine | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    setMode('fitness');
    return () => resetGame();
  }, [setMode, resetGame]);

  // Exercise timer countdown
  useEffect(() => {
    if (status !== 'playing' || !currentExercise) return;

    const interval = setInterval(() => {
      if (exerciseTimer <= 1) {
        completeExercise();
      } else {
        updateExerciseTimer(exerciseTimer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, exerciseTimer, currentExercise, completeExercise, updateExerciseTimer]);

  const handleStartRoutine = (routine: FitnessRoutine) => {
    if (routine.isPremium && !profile?.isPremium) {
      return;
    }

    setSelectedRoutine(routine);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          startRoutine(routine);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

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

          <h1 className="text-2xl font-bold text-white">Fitness Mode</h1>

          <div className="w-20" />
        </div>

        {/* Routine selection */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Choose a Routine</h2>
              <p className="text-gray-400">
                Follow guided exercises and track your movement quality
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {fitnessRoutines.map((routine) => {
                const isLocked = routine.isPremium && !profile?.isPremium;

                return (
                  <Card
                    key={routine.id}
                    className={`relative overflow-hidden ${
                      isLocked ? 'opacity-75' : 'hover:border-green-500/50 cursor-pointer'
                    }`}
                    onClick={() => !isLocked && handleStartRoutine(routine)}
                  >
                    {routine.isPremium && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="premium">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {routine.name}
                        {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                      </CardTitle>
                      <CardDescription>{routine.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">
                            {routine.estimatedDuration} min
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className={`w-4 h-4 ${getDifficultyColor(routine.difficulty)}`} />
                          <span className={getDifficultyColor(routine.difficulty)}>
                            {routine.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {routine.exercises.slice(0, 3).map((exercise) => (
                          <span
                            key={exercise.id}
                            className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400"
                          >
                            {exercise.name}
                          </span>
                        ))}
                        {routine.exercises.length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                            +{routine.exercises.length - 3} more
                          </span>
                        )}
                      </div>

                      {!isLocked && (
                        <Button className="w-full mt-4" variant="secondary">
                          <Play className="w-4 h-4 mr-2" />
                          Start Routine
                        </Button>
                      )}

                      {isLocked && (
                        <Link href="/profile">
                          <Button className="w-full mt-4" variant="outline">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
              <div className="text-center">
                <p className="text-xl text-gray-400 mb-4">Get Ready!</p>
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-9xl font-bold text-green-500"
                >
                  {countdown}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active workout */}
        {status === 'playing' && currentRoutine && currentExercise && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera */}
            <div>
              <Card className="overflow-hidden">
                <PoseCamera className="aspect-[4/3] w-full" />
              </Card>
            </div>

            {/* Exercise info */}
            <div className="space-y-6">
              {/* Progress */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-semibold">
                    {exerciseIndex + 1} / {currentRoutine.exercises.length}
                  </span>
                </div>
                <Progress
                  value={((exerciseIndex + 1) / currentRoutine.exercises.length) * 100}
                  variant="success"
                />
              </Card>

              {/* Current exercise */}
              <Card className="p-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentExercise.name}
                  </h2>
                  <p className="text-gray-400 mb-6">{currentExercise.description}</p>

                  {/* Timer circle */}
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="8"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={440}
                        strokeDashoffset={
                          440 - (exerciseTimer / currentExercise.duration) * 440
                        }
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {exerciseTimer}
                      </span>
                    </div>
                  </div>

                  {currentExercise.reps && (
                    <p className="text-gray-400">
                      Target: <span className="text-white font-semibold">{currentExercise.reps} reps</span>
                    </p>
                  )}
                </div>
              </Card>

              {/* Score */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Session Score</span>
                  <span className="text-2xl font-bold text-green-400">{score}</span>
                </div>
              </Card>

              {/* Up next */}
              {exerciseIndex < currentRoutine.exercises.length - 1 && (
                <Card className="p-4 bg-gray-800/50">
                  <p className="text-sm text-gray-500 mb-1">Up Next</p>
                  <p className="text-white font-semibold">
                    {currentRoutine.exercises[exerciseIndex + 1].name}
                  </p>
                </Card>
              )}

              {/* Cancel button */}
              <Button onClick={resetGame} variant="outline" className="w-full">
                End Workout
              </Button>
            </div>
          </div>
        )}

        {/* Finished */}
        {status === 'finished' && currentRoutine && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <Flame className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Workout Complete!</h2>
              <p className="text-gray-400 mb-6">Great job finishing {currentRoutine.name}!</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Exercises</p>
                  <p className="text-2xl font-bold text-white">{exercisesCompleted}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-2xl font-bold text-green-400">{score}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetGame} variant="secondary" className="flex-1">
                  New Routine
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Home
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
