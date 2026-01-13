'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
  showPreview?: boolean;
}

export function PremiumGate({ children, feature = 'This feature', showPreview = false }: PremiumGateProps) {
  const { profile } = useAuthStore();

  // If user is premium, show the content
  if (profile?.isPremium) {
    return <>{children}</>;
  }

  // If not premium, show the gate
  return (
    <div className="relative">
      {/* Blurred preview */}
      {showPreview && (
        <div className="blur-sm pointer-events-none opacity-50">
          {children}
        </div>
      )}

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${showPreview ? 'absolute inset-0' : ''} flex items-center justify-center p-8`}
      >
        <Card className="max-w-md text-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-yellow-500/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
          <p className="text-gray-400 mb-6">
            {feature} is available for premium members. Upgrade to unlock all features!
          </p>

          <div className="space-y-3">
            <Link href="/pricing">
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>

            {!profile && (
              <Link href="/auth">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// Badge component to show on premium content
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full ${className}`}>
      <Crown className="w-3 h-3" />
      PRO
    </span>
  );
}

// Lock icon overlay for premium items in lists
export function PremiumLock() {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
      <div className="bg-gray-900/80 rounded-full p-3">
        <Lock className="w-6 h-6 text-yellow-500" />
      </div>
    </div>
  );
}
