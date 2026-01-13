'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Gamepad2,
  Dumbbell,
  Swords,
  ArrowRight,
  Camera,
  Zap,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Camera,
    title: 'AI Pose Detection',
    description: 'Advanced machine learning detects your body poses in real-time using just your webcam.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get immediate visual and audio feedback as you make poses and progress through games.',
  },
  {
    icon: Trophy,
    title: 'Track Progress',
    description: 'Save your scores, track your streaks, and compete on global leaderboards.',
  },
  {
    icon: Users,
    title: 'Play Together',
    description: 'Challenge friends to real-time 1v1 pose battles and see who is the pose master.',
  },
];

const gameModes = [
  {
    id: 'classic',
    title: 'Classic Mode',
    description: 'Guess words by forming letters with your body. Perfect for learning and fun!',
    icon: Gamepad2,
    color: 'from-purple-500 to-pink-500',
    href: '/play',
    badge: null,
  },
  {
    id: 'fitness',
    title: 'Fitness Mode',
    description: 'Follow guided exercise routines and track your movement quality.',
    icon: Dumbbell,
    color: 'from-green-500 to-emerald-500',
    href: '/fitness',
    badge: null,
  },
  {
    id: 'battle',
    title: '1v1 Battles',
    description: 'Challenge players in real-time pose competitions. May the best poser win!',
    icon: Swords,
    color: 'from-orange-500 to-red-500',
    href: '/battle',
    badge: 'New',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 animated-gradient opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="premium" className="mb-4">
              Now with real-time multiplayer!
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">Gamify</span> Your Breaks
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Turn your webcam into a fitness game. Make poses to spell words,
              complete exercise routines, or battle friends in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/play">
                <Button size="lg" className="group">
                  Start Playing
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#modes">
                <Button variant="outline" size="lg">
                  Explore Modes
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 relative max-w-4xl mx-auto"
          >
            <div className="aspect-video bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-400">Your pose-powered game awaits</p>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-4 top-1/4 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pose Detected!</p>
                  <p className="text-xs text-gray-400">Letter: T</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -right-4 bottom-1/4 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">+50 Points!</p>
                  <p className="text-xs text-gray-400">Word complete</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why PoseMan?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built with cutting-edge AI and designed for fun, PoseMan makes staying active effortless.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:border-purple-500/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section id="modes" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Choose Your Mode
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Whether you want to learn, exercise, or compete - we have a mode for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={mode.href}>
                    <Card className="h-full group hover:border-purple-500/50 transition-all cursor-pointer">
                      <CardContent className="pt-6">
                        {mode.badge && (
                          <Badge variant="success" className="mb-4">
                            {mode.badge}
                          </Badge>
                        )}

                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                          {mode.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {mode.description}
                        </p>

                        <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300">
                          Play Now
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="gradient" className="text-center py-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Strike a Pose?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              No signup required to start playing. Just allow camera access and begin your pose-powered adventure!
            </p>
            <Link href="/play">
              <Button size="lg" className="group">
                Start Playing Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
