'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Pose, Keypoint } from '@/types';

interface UsePoseDetectionOptions {
  onPoseDetected?: (pose: Pose | null) => void;
  onLetterDetected?: (letter: string | null, confidence: number) => void;
  minConfidence?: number;
}

interface UsePoseDetectionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  currentPose: Pose | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

// MoveNet keypoint names
const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

// Simple pose classification based on keypoint positions
function classifyPose(keypoints: Keypoint[]): { letter: string | null; confidence: number } {
  if (keypoints.length < 17) return { letter: null, confidence: 0 };

  // Get key body parts with enough confidence
  const getPoint = (name: string) => {
    const idx = KEYPOINT_NAMES.indexOf(name);
    const kp = keypoints[idx];
    return kp && (kp.score ?? 0) > 0.3 ? kp : null;
  };

  const leftShoulder = getPoint('left_shoulder');
  const rightShoulder = getPoint('right_shoulder');
  const leftElbow = getPoint('left_elbow');
  const rightElbow = getPoint('right_elbow');
  const leftWrist = getPoint('left_wrist');
  const rightWrist = getPoint('right_wrist');
  const nose = getPoint('nose');

  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
    return { letter: null, confidence: 0 };
  }

  // Calculate arm positions relative to shoulders
  const leftArmUp = leftWrist.y < leftShoulder.y;
  const rightArmUp = rightWrist.y < rightShoulder.y;
  const leftArmOut = Math.abs(leftWrist.x - leftShoulder.x) > 50;
  const rightArmOut = Math.abs(rightWrist.x - rightShoulder.x) > 50;

  // T pose: both arms out to sides
  if (leftArmOut && rightArmOut && !leftArmUp && !rightArmUp) {
    const leftLevel = Math.abs(leftWrist.y - leftShoulder.y) < 50;
    const rightLevel = Math.abs(rightWrist.y - rightShoulder.y) < 50;
    if (leftLevel && rightLevel) {
      return { letter: 'T', confidence: 0.9 };
    }
  }

  // Y pose: both arms up and out (like a Y)
  if (leftArmUp && rightArmUp && leftArmOut && rightArmOut) {
    return { letter: 'Y', confidence: 0.9 };
  }

  // I pose: both arms straight up close together
  if (leftArmUp && rightArmUp && !leftArmOut && !rightArmOut) {
    const armsClose = Math.abs(leftWrist.x - rightWrist.x) < 100;
    if (armsClose) {
      return { letter: 'I', confidence: 0.85 };
    }
  }

  // A pose: arms up forming a triangle (hands together above head)
  if (leftArmUp && rightArmUp) {
    const handsClose = Math.abs(leftWrist.x - rightWrist.x) < 80;
    const handsAboveHead = nose && leftWrist.y < nose.y && rightWrist.y < nose.y;
    if (handsClose && handsAboveHead) {
      return { letter: 'A', confidence: 0.85 };
    }
  }

  // L pose: one arm up, one arm out to side
  if ((leftArmUp && !rightArmUp && rightArmOut) ||
      (!leftArmUp && rightArmUp && leftArmOut)) {
    return { letter: 'L', confidence: 0.8 };
  }

  // K pose: one arm up diagonal, one arm down diagonal
  if (leftArmUp && !rightArmUp && leftArmOut) {
    return { letter: 'K', confidence: 0.75 };
  }

  // V pose: arms up and spread wide (wider than Y)
  if (leftArmUp && rightArmUp) {
    const spread = Math.abs(leftWrist.x - rightWrist.x);
    if (spread > 200) {
      return { letter: 'V', confidence: 0.8 };
    }
  }

  // X pose: arms crossed
  if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
    const leftCrossed = leftWrist.x > rightShoulder.x;
    const rightCrossed = rightWrist.x < leftShoulder.x;
    if (leftCrossed && rightCrossed) {
      return { letter: 'X', confidence: 0.85 };
    }
  }

  // O pose: arms forming a circle above head
  if (leftArmUp && rightArmUp) {
    const elbowsOut = leftElbow && rightElbow &&
      Math.abs(leftElbow.x - rightElbow.x) > 150;
    const handsClose = Math.abs(leftWrist.x - rightWrist.x) < 100;
    if (elbowsOut && handsClose) {
      return { letter: 'O', confidence: 0.8 };
    }
  }

  return { letter: null, confidence: 0 };
}

// Type for the detector (since we're dynamically importing)
type PoseDetector = {
  estimatePoses: (video: HTMLVideoElement) => Promise<Array<{
    keypoints: Array<{ x: number; y: number; score?: number; name?: string }>;
    score?: number;
  }>>;
  dispose: () => void;
};

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionReturn {
  const { onPoseDetected, onLetterDetected, minConfidence = 0.5 } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPose, setCurrentPose] = useState<Pose | null>(null);

  // Initialize detector with dynamic import
  useEffect(() => {
    async function initDetector() {
      try {
        setIsLoading(true);

        // Dynamic import to avoid SSR issues
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();

        const poseDetection = await import('@tensorflow-models/pose-detection');

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );

        detectorRef.current = detector as PoseDetector;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize pose detector:', err);
        setError('Failed to load pose detection model');
        setIsLoading(false);
      }
    }

    initDetector();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  // Detection loop
  const detectPose = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(video);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw mirrored video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (poses.length > 0) {
        const pose = poses[0];
        const keypoints: Keypoint[] = pose.keypoints.map((kp, idx) => ({
          x: canvas.width - kp.x, // Mirror x coordinate
          y: kp.y,
          score: kp.score,
          name: KEYPOINT_NAMES[idx],
        }));

        const detectedPose: Pose = {
          keypoints,
          score: pose.score,
        };

        setCurrentPose(detectedPose);
        onPoseDetected?.(detectedPose);

        // Classify pose
        const classification = classifyPose(keypoints);
        if (classification.confidence >= minConfidence) {
          onLetterDetected?.(classification.letter, classification.confidence);
        } else {
          onLetterDetected?.(null, 0);
        }

        // Draw keypoints
        keypoints.forEach((kp) => {
          if ((kp.score ?? 0) > 0.3) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
          }
        });

        // Draw skeleton
        const connections = [
          ['left_shoulder', 'right_shoulder'],
          ['left_shoulder', 'left_elbow'],
          ['left_elbow', 'left_wrist'],
          ['right_shoulder', 'right_elbow'],
          ['right_elbow', 'right_wrist'],
          ['left_shoulder', 'left_hip'],
          ['right_shoulder', 'right_hip'],
          ['left_hip', 'right_hip'],
          ['left_hip', 'left_knee'],
          ['left_knee', 'left_ankle'],
          ['right_hip', 'right_knee'],
          ['right_knee', 'right_ankle'],
        ];

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
          const startKp = keypoints.find(kp => kp.name === start);
          const endKp = keypoints.find(kp => kp.name === end);

          if (startKp && endKp && (startKp.score ?? 0) > 0.3 && (endKp.score ?? 0) > 0.3) {
            ctx.beginPath();
            ctx.moveTo(startKp.x, startKp.y);
            ctx.lineTo(endKp.x, endKp.y);
            ctx.stroke();
          }
        });
      } else {
        setCurrentPose(null);
        onPoseDetected?.(null);
        onLetterDetected?.(null, 0);
      }
    } catch (err) {
      console.error('Pose detection error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [onPoseDetected, onLetterDetected, minConfidence]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Set canvas size to match video
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }

        setIsReady(true);

        // Start detection loop
        animationFrameRef.current = requestAnimationFrame(detectPose);
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      setError('Camera access denied or not available');
    }
  }, [detectPose]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setCurrentPose(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isLoading,
    isReady,
    error,
    currentPose,
    startCamera,
    stopCamera,
  };
}
