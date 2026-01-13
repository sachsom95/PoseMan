'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Trophy,
  Gamepad2,
  Dumbbell,
  Swords,
  Zap,
  Crown,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, stats, signOut, refreshStats } = useAuthStore();

  useEffect(() => {
    if (!profile) {
      router.push('/auth?redirect=/profile');
      return;
    }

    refreshStats();
  }, [profile, router, refreshStats]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!profile) {
    return null;
  }

  const level = Math.floor((stats?.totalScore || 0) / 500) + 1;
  const xpProgress = ((stats?.totalScore || 0) % 500) / 500 * 100;
  const xpToNextLevel = 500 - ((stats?.totalScore || 0) % 500);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <Card className="text-center">
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {profile.isPremium && (
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name & badges */}
                <h2 className="text-xl font-bold text-white mb-1">{profile.username}</h2>
                <p className="text-gray-500 text-sm mb-3">{profile.email}</p>

                {profile.isPremium ? (
                  <Badge variant="premium">Premium Member</Badge>
                ) : (
                  <Badge>Free Account</Badge>
                )}

                {/* Level */}
                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Level {level}</span>
                    <span className="text-gray-500 text-xs">{xpToNextLevel} XP to next</span>
                  </div>
                  <Progress value={xpProgress} variant="default" />
                </div>

                {/* Upgrade button */}
                {!profile.isPremium && (
                  <Button className="w-full mt-4" variant="outline">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.totalScore || 0}</p>
                <p className="text-gray-500 text-xs">Total Score</p>
              </Card>

              <Card className="p-4 text-center">
                <Gamepad2 className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.totalGames || 0}</p>
                <p className="text-gray-500 text-xs">Games Played</p>
              </Card>

              <Card className="p-4 text-center">
                <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</p>
                <p className="text-gray-500 text-xs">Day Streak</p>
              </Card>

              <Card className="p-4 text-center">
                <Swords className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats?.battlesWon || 0}</p>
                <p className="text-gray-500 text-xs">Battles Won</p>
              </Card>
            </div>

            {/* Detailed stats */}
            <Card>
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Classic mode */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Classic Mode</p>
                      <p className="text-sm text-gray-500">Words guessed</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{stats?.wordsGuessed || 0}</p>
                </div>

                {/* Fitness mode */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Fitness Mode</p>
                      <p className="text-sm text-gray-500">Exercises completed</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{stats?.exercisesCompleted || 0}</p>
                </div>

                {/* Battle mode */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Swords className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Battles</p>
                      <p className="text-sm text-gray-500">
                        {stats?.battlesWon || 0} wins / {stats?.battlesPlayed || 0} played
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {stats?.battlesPlayed
                      ? Math.round((stats.battlesWon / stats.battlesPlayed) * 100)
                      : 0}%
                  </p>
                </div>

                {/* Longest streak */}
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Longest Streak</p>
                      <p className="text-sm text-gray-500">Days in a row</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{stats?.longestStreak || 0}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-4">
              <Link href="/play">
                <Button variant="secondary" className="w-full">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Classic
                </Button>
              </Link>
              <Link href="/fitness">
                <Button variant="secondary" className="w-full">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Fitness
                </Button>
              </Link>
              <Link href="/battle">
                <Button variant="secondary" className="w-full">
                  <Swords className="w-4 h-4 mr-2" />
                  Battle
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
