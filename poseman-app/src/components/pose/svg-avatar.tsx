'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SVGAvatarProps {
  className?: string;
  onLetterDetected?: (letter: string | null, confidence: number) => void;
  onReady?: () => void;
}

// Dynamic imports for browser-only code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let paper: any = null;
let tf: typeof import('@tensorflow/tfjs') | null = null;
let poseDetection: typeof import('@tensorflow-models/pose-detection') | null = null;

export function SVGAvatar({ className, onLetterDetected, onReady }: SVGAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paperScopeRef = useRef<any>(null);
  const detectorRef = useRef<unknown>(null);
  const illustrationRef = useRef<unknown>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState<'girl' | 'boy'>('girl');

  // Pose classification
  const classifyPose = useCallback((keypoints: Array<{x: number; y: number; score?: number}>) => {
    if (!keypoints || keypoints.length < 17) return;

    const getPoint = (idx: number) => {
      const kp = keypoints[idx];
      return kp && (kp.score ?? 0) > 0.3 ? kp : null;
    };

    const leftShoulder = getPoint(5);
    const rightShoulder = getPoint(6);
    const leftWrist = getPoint(9);
    const rightWrist = getPoint(10);
    const nose = getPoint(0);

    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
      onLetterDetected?.(null, 0);
      return;
    }

    const leftArmUp = leftWrist.y < leftShoulder.y;
    const rightArmUp = rightWrist.y < rightShoulder.y;
    const leftArmOut = Math.abs(leftWrist.x - leftShoulder.x) > 50;
    const rightArmOut = Math.abs(rightWrist.x - rightShoulder.x) > 50;

    // T pose
    if (leftArmOut && rightArmOut && !leftArmUp && !rightArmUp) {
      const leftLevel = Math.abs(leftWrist.y - leftShoulder.y) < 50;
      const rightLevel = Math.abs(rightWrist.y - rightShoulder.y) < 50;
      if (leftLevel && rightLevel) {
        onLetterDetected?.('T', 0.9);
        return;
      }
    }

    // Y pose
    if (leftArmUp && rightArmUp && leftArmOut && rightArmOut) {
      onLetterDetected?.('Y', 0.9);
      return;
    }

    // I pose
    if (leftArmUp && rightArmUp && !leftArmOut && !rightArmOut) {
      if (Math.abs(leftWrist.x - rightWrist.x) < 100) {
        onLetterDetected?.('I', 0.85);
        return;
      }
    }

    // A pose
    if (leftArmUp && rightArmUp && nose) {
      if (Math.abs(leftWrist.x - rightWrist.x) < 80 && leftWrist.y < nose.y) {
        onLetterDetected?.('A', 0.85);
        return;
      }
    }

    onLetterDetected?.(null, 0);
  }, [onLetterDetected]);

  // Initialize everything
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Random avatar
        setAvatarType(Math.random() > 0.5 ? 'girl' : 'boy');

        // Load libraries
        setLoadingStatus('Loading TensorFlow...');
        tf = await import('@tensorflow/tfjs');
        await tf.ready();

        setLoadingStatus('Loading pose detection model...');
        poseDetection = await import('@tensorflow-models/pose-detection');

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );
        detectorRef.current = detector;

        setLoadingStatus('Loading Paper.js...');
        paper = await import('paper');

        setLoadingStatus('Setting up camera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Setup Paper.js canvas
        if (canvasRef.current && paper) {
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;

          const scope = new paper.PaperScope();
          scope.setup(canvasRef.current);
          paperScopeRef.current = scope;

          // Load SVG avatar
          setLoadingStatus('Loading avatar...');
          const svgUrl = `/avatars/${avatarType}.svg`;
          const response = await fetch(svgUrl);
          const svgText = await response.text();

          scope.project.importSVG(svgText, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onLoad: (item: any) => {
              item.position = scope.view.center;
              item.scale(0.8);
              illustrationRef.current = item;
            }
          });
        }

        if (mounted) {
          setIsLoading(false);
          onReady?.();
          startDetection();
        }
      } catch (err) {
        console.error('Init error:', err);
        if (mounted) {
          setError('Failed to initialize. Please allow camera access.');
          setIsLoading(false);
        }
      }
    }

    function startDetection() {
      async function detect() {
        if (!detectorRef.current || !videoRef.current || !paperScopeRef.current) {
          animationRef.current = requestAnimationFrame(detect);
          return;
        }

        const video = videoRef.current;
        if (video.readyState !== 4) {
          animationRef.current = requestAnimationFrame(detect);
          return;
        }

        try {
          const detector = detectorRef.current as {
            estimatePoses: (video: HTMLVideoElement) => Promise<Array<{
              keypoints: Array<{x: number; y: number; score?: number; name?: string}>;
            }>>;
          };
          const poses = await detector.estimatePoses(video);

          if (poses.length > 0 && illustrationRef.current) {
            const pose = poses[0];
            classifyPose(pose.keypoints);

            // Simple avatar animation based on pose
            const scope = paperScopeRef.current;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const item = illustrationRef.current as any;

            if (scope && item) {
              // Clear and redraw
              scope.project.activeLayer.removeChildren();

              // Re-import and position based on pose
              const leftWrist = pose.keypoints[9];
              const rightWrist = pose.keypoints[10];

              if (leftWrist && rightWrist) {
                // Simple animation: rotate based on arm positions
                const tilt = (leftWrist.y - rightWrist.y) / 10;
                item.rotation = tilt;
              }

              scope.project.activeLayer.addChild(item);
              scope.view.draw();
            }
          }
        } catch (err) {
          console.error('Detection error:', err);
        }

        animationRef.current = requestAnimationFrame(detect);
      }

      detect();
    }

    init();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [avatarType, classifyPose, onReady]);

  return (
    <div className={cn('relative bg-gray-900 rounded-2xl overflow-hidden', className)}>
      {/* Hidden video for pose detection */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Main canvas showing animated SVG */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-10"
          >
            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <p className="text-white font-medium mb-2">{loadingStatus}</p>
            <p className="text-gray-500 text-sm">Loading {avatarType} avatar...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
          <Camera className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-red-400 text-center px-4">{error}</p>
        </div>
      )}

      {/* Avatar indicator */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm">
            {avatarType === 'girl' ? '👧' : '👦'} {avatarType.charAt(0).toUpperCase() + avatarType.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
