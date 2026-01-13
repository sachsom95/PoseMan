'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Users, Trophy, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBattleStore } from '@/store/battle-store';
import { useAuthStore } from '@/store/auth-store';
import { PoseCamera } from '@/components/pose/pose-camera';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BattlePage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const {
    status,
    isSearching,
    myScore,
    opponentScore,
    currentChallenge,
    challengeIndex,
    totalChallenges,
    timeRemaining,
    winnerId,
    searchForMatch,
    cancelSearch,
    leaveBattle,
    updateTimer,
  } = useBattleStore();

  const [countdown, setCountdown] = useState<number | null>(null);

  // Timer countdown during battle
  useEffect(() => {
    if (status !== 'active') return;

    const interval = setInterval(() => {
      updateTimer(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, timeRemaining, updateTimer]);

  const handleFindMatch = () => {
    if (!profile) {
      router.push('/auth?redirect=/battle');
      return;
    }

    searchForMatch(profile.id);
  };

  const handleCancel = () => {
    cancelSearch();
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

          <h1 className="text-2xl font-bold text-white">1v1 Battle</h1>

          <div className="w-20" />
        </div>

        {/* Not logged in */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-orange-500" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
              <p className="text-gray-400 mb-6">
                You need to be signed in to battle other players in real-time.
              </p>

              <Link href="/auth?redirect=/battle">
                <Button className="w-full">Sign In to Battle</Button>
              </Link>
            </Card>
          </motion.div>
        )}

        {/* Logged in - idle state */}
        {profile && status === 'waiting' && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Swords className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Ready to Battle?</h2>
              <p className="text-gray-400">
                Challenge another player to a pose battle. Complete challenges faster and more accurately to win!
              </p>
            </div>

            <Card className="p-6 mb-6">
              <h3 className="font-semibold text-white mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 font-semibold text-xs">1</span>
                  </div>
                  <p>Click Find Match to be paired with another player</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 font-semibold text-xs">2</span>
                  </div>
                  <p>Both players receive the same pose challenges</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 font-semibold text-xs">3</span>
                  </div>
                  <p>Complete each challenge within the time limit to score points</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 font-semibold text-xs">4</span>
                  </div>
                  <p>The player with the most points at the end wins!</p>
                </div>
              </div>
            </Card>

            <Button onClick={handleFindMatch} size="lg" className="w-full">
              <Swords className="w-5 h-5 mr-2" />
              Find Match
            </Button>
          </motion.div>
        )}

        {/* Searching for match */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="p-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Searching for opponent...</h2>
              <p className="text-gray-400 mb-6">
                Looking for another player to battle. This might take a moment.
              </p>

              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Match found countdown */}
        <AnimatePresence>
          {status === 'countdown' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            >
              <div className="text-center">
                <p className="text-xl text-gray-400 mb-2">Opponent Found!</p>
                <p className="text-gray-500 mb-8">Battle starts in...</p>
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-9xl font-bold text-orange-500"
                >
                  {countdown || 3}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active battle */}
        {status === 'active' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera */}
            <div>
              <Card className="overflow-hidden">
                <PoseCamera className="aspect-[4/3] w-full" />
              </Card>
            </div>

            {/* Battle info */}
            <div className="space-y-6">
              {/* Scores */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">You</p>
                    <p className="text-4xl font-bold text-orange-400">{myScore}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-500 text-sm">VS</p>
                    <Swords className="w-8 h-8 text-gray-600 mx-auto mt-1" />
                  </div>

                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Opponent</p>
                    <p className="text-4xl font-bold text-red-400">{opponentScore}</p>
                  </div>
                </div>
              </Card>

              {/* Current challenge */}
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Challenge {challengeIndex + 1} of {totalChallenges}
                  </p>
                  <h2 className="text-2xl font-bold text-white mb-4">{currentChallenge}</h2>

                  {/* Timer */}
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke={timeRemaining <= 5 ? '#ef4444' : '#f97316'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={352}
                        strokeDashoffset={352 - (timeRemaining / 15) * 352}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${timeRemaining <= 5 ? 'text-red-500' : 'text-white'}`}>
                        {timeRemaining}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Button onClick={leaveBattle} variant="outline" className="w-full">
                Leave Battle
              </Button>
            </div>
          </div>
        )}

        {/* Battle finished */}
        {status === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="p-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                winnerId === profile?.id
                  ? 'bg-yellow-500/20'
                  : winnerId
                  ? 'bg-red-500/20'
                  : 'bg-gray-500/20'
              }`}>
                <Trophy className={`w-10 h-10 ${
                  winnerId === profile?.id
                    ? 'text-yellow-500'
                    : winnerId
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                {winnerId === profile?.id
                  ? 'You Won!'
                  : winnerId
                  ? 'You Lost'
                  : "It's a Tie!"}
              </h2>

              <p className="text-gray-400 mb-6">
                {winnerId === profile?.id
                  ? 'Congratulations on your victory!'
                  : winnerId
                  ? 'Better luck next time!'
                  : 'What a close match!'}
              </p>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Your Score</p>
                  <p className="text-3xl font-bold text-orange-400">{myScore}</p>
                </div>
                <div className="text-2xl text-gray-600">-</div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Opponent</p>
                  <p className="text-3xl font-bold text-red-400">{opponentScore}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleFindMatch} className="flex-1">
                  <Swords className="w-4 h-4 mr-2" />
                  Play Again
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
