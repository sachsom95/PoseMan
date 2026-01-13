// Pose Detection Types
export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

// Game Types
export type GameMode = 'classic' | 'fitness' | 'battle';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'idle' | 'ready' | 'playing' | 'paused' | 'finished';

export interface GameWord {
  word: string;
  hint?: string;
  imageUrl?: string;
  difficulty: GameDifficulty;
}

export interface FitnessExercise {
  id: string;
  name: string;
  description: string;
  targetPose: string;
  duration: number; // seconds
  reps?: number;
  imageUrl?: string;
}

export interface FitnessRoutine {
  id: string;
  name: string;
  description: string;
  exercises: FitnessExercise[];
  difficulty: GameDifficulty;
  estimatedDuration: number; // minutes
  isPremium: boolean;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  score: number;
  startedAt: Date;
  endedAt?: Date;
  wordsCompleted?: number;
  exercisesCompleted?: number;
}

// Battle Types
export type BattleStatus = 'waiting' | 'matched' | 'countdown' | 'active' | 'finished';

export interface BattlePlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  score: number;
  isReady: boolean;
}

export interface Battle {
  id: string;
  status: BattleStatus;
  players: BattlePlayer[];
  currentChallenge?: string;
  winnerId?: string;
  createdAt: Date;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  isPremium: boolean;
  createdAt: Date;
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  wordsGuessed: number;
  exercisesCompleted: number;
  battlesWon: number;
  battlesPlayed: number;
  currentStreak: number;
  longestStreak: number;
}

// Avatar Animation Types
export interface AvatarKeypoints {
  nose: Keypoint;
  leftEye: Keypoint;
  rightEye: Keypoint;
  leftEar: Keypoint;
  rightEar: Keypoint;
  leftShoulder: Keypoint;
  rightShoulder: Keypoint;
  leftElbow: Keypoint;
  rightElbow: Keypoint;
  leftWrist: Keypoint;
  rightWrist: Keypoint;
  leftHip: Keypoint;
  rightHip: Keypoint;
  leftKnee: Keypoint;
  rightKnee: Keypoint;
  leftAnkle: Keypoint;
  rightAnkle: Keypoint;
}

// Pose Classification
export interface PoseClassification {
  label: string;
  confidence: number;
}

export type PoseLetter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
