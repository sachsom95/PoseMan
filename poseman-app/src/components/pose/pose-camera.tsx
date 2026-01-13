'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { usePoseDetection } from '@/hooks/use-pose-detection';
import { useGameStore } from '@/store/game-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface PoseCameraProps {
  className?: string;
  showControls?: boolean;
  showSkeleton?: boolean;
}

export function PoseCamera({ className, showControls = true, showSkeleton = true }: PoseCameraProps) {
  const { setPose, setDetectedLetter, status } = useGameStore();

  const handlePoseDetected = useCallback((pose: import('@/types').Pose | null) => {
    setPose(pose);
  }, [setPose]);

  const handleLetterDetected = useCallback((letter: string | null, confidence: number) => {
    setDetectedLetter(letter, confidence);
  }, [setDetectedLetter]);

  const {
    videoRef,
    canvasRef,
    isLoading,
    isReady,
    error,
    startCamera,
    stopCamera,
  } = usePoseDetection({
    onPoseDetected: handlePoseDetected,
    onLetterDetected: handleLetterDetected,
    minConfidence: 0.7,
  });

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className={cn('relative rounded-2xl overflow-hidden bg-gray-900', className)}>
      {/* Video (hidden, used for processing) */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Canvas with skeleton overlay */}
      <canvas
        ref={canvasRef}
        className={cn(
          'w-full h-full object-cover',
          !showSkeleton && 'hidden'
        )}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400">Loading pose detection...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
          <CameraOff className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={startCamera} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Ready indicator */}
      {isReady && status === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Camera Ready</span>
        </motion.div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex gap-2">
          {isReady ? (
            <button
              onClick={stopCamera}
              className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <CameraOff size={20} />
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Camera size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
