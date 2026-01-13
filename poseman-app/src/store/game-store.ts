import { create } from 'zustand';
import { GameMode, GameDifficulty, GameStatus, GameWord, FitnessRoutine, FitnessExercise, Pose } from '@/types';
import { getRandomWord, gameWords, shuffleArray } from '@/lib/game-data';

interface GameState {
  // Game settings
  mode: GameMode;
  difficulty: GameDifficulty;
  status: GameStatus;

  // Classic mode state
  currentWord: GameWord | null;
  guessedLetters: string[];
  wordQueue: GameWord[];
  wordsCompleted: number;

  // Fitness mode state
  currentRoutine: FitnessRoutine | null;
  currentExercise: FitnessExercise | null;
  exerciseIndex: number;
  exerciseTimer: number;
  exercisesCompleted: number;

  // Scoring
  score: number;
  streak: number;

  // Timer
  timeRemaining: number;
  totalTime: number;

  // Pose
  currentPose: Pose | null;
  detectedLetter: string | null;
  poseConfidence: number;

  // Actions
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Classic mode actions
  guessLetter: (letter: string) => boolean;
  nextWord: () => void;

  // Fitness mode actions
  startRoutine: (routine: FitnessRoutine) => void;
  nextExercise: () => void;
  completeExercise: () => void;
  updateExerciseTimer: (time: number) => void;

  // Pose actions
  setPose: (pose: Pose | null) => void;
  setDetectedLetter: (letter: string | null, confidence: number) => void;

  // Timer actions
  updateTimer: (time: number) => void;
  addScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  mode: 'classic',
  difficulty: 'easy',
  status: 'idle',

  currentWord: null,
  guessedLetters: [],
  wordQueue: [],
  wordsCompleted: 0,

  currentRoutine: null,
  currentExercise: null,
  exerciseIndex: 0,
  exerciseTimer: 0,
  exercisesCompleted: 0,

  score: 0,
  streak: 0,

  timeRemaining: 0,
  totalTime: 0,

  currentPose: null,
  detectedLetter: null,
  poseConfidence: 0,

  // Game control actions
  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),

  startGame: () => {
    const { mode, difficulty } = get();

    if (mode === 'classic') {
      const words = shuffleArray([...gameWords[difficulty]]);
      const timeMap = { easy: 120, medium: 90, hard: 60 };

      set({
        status: 'playing',
        wordQueue: words.slice(1),
        currentWord: words[0],
        guessedLetters: [],
        wordsCompleted: 0,
        score: 0,
        streak: 0,
        timeRemaining: timeMap[difficulty],
        totalTime: timeMap[difficulty],
      });
    } else if (mode === 'fitness') {
      set({
        status: 'ready',
        exercisesCompleted: 0,
        score: 0,
      });
    }
  },

  pauseGame: () => set({ status: 'paused' }),
  resumeGame: () => set({ status: 'playing' }),

  endGame: () => set({ status: 'finished' }),

  resetGame: () => set({
    status: 'idle',
    currentWord: null,
    guessedLetters: [],
    wordQueue: [],
    wordsCompleted: 0,
    currentRoutine: null,
    currentExercise: null,
    exerciseIndex: 0,
    exerciseTimer: 0,
    exercisesCompleted: 0,
    score: 0,
    streak: 0,
    timeRemaining: 0,
    totalTime: 0,
    detectedLetter: null,
    poseConfidence: 0,
  }),

  // Classic mode actions
  guessLetter: (letter) => {
    const { currentWord, guessedLetters, score, streak } = get();
    if (!currentWord) return false;

    const upperLetter = letter.toUpperCase();

    if (guessedLetters.includes(upperLetter)) return false;

    const isCorrect = currentWord.word.includes(upperLetter);
    const newGuessedLetters = [...guessedLetters, upperLetter];

    if (isCorrect) {
      const letterCount = currentWord.word.split('').filter(l => l === upperLetter).length;
      const pointsPerLetter = 10;
      const streakBonus = Math.floor(streak / 3) * 5;
      const newScore = score + (letterCount * pointsPerLetter) + streakBonus;

      set({
        guessedLetters: newGuessedLetters,
        score: newScore,
        streak: streak + 1,
      });

      // Check if word is complete
      const wordComplete = currentWord.word
        .split('')
        .every(l => newGuessedLetters.includes(l));

      if (wordComplete) {
        setTimeout(() => get().nextWord(), 1000);
      }
    } else {
      set({
        guessedLetters: newGuessedLetters,
        streak: 0,
      });
    }

    return isCorrect;
  },

  nextWord: () => {
    const { wordQueue, wordsCompleted, score } = get();

    if (wordQueue.length === 0) {
      set({ status: 'finished' });
      return;
    }

    const [nextWord, ...remainingWords] = wordQueue;
    const completionBonus = 50;

    set({
      currentWord: nextWord,
      wordQueue: remainingWords,
      guessedLetters: [],
      wordsCompleted: wordsCompleted + 1,
      score: score + completionBonus,
    });
  },

  // Fitness mode actions
  startRoutine: (routine) => {
    const firstExercise = routine.exercises[0];
    set({
      status: 'playing',
      currentRoutine: routine,
      currentExercise: firstExercise,
      exerciseIndex: 0,
      exerciseTimer: firstExercise.duration,
      exercisesCompleted: 0,
    });
  },

  nextExercise: () => {
    const { currentRoutine, exerciseIndex, exercisesCompleted, score } = get();
    if (!currentRoutine) return;

    const nextIndex = exerciseIndex + 1;

    if (nextIndex >= currentRoutine.exercises.length) {
      set({ status: 'finished' });
      return;
    }

    const nextExercise = currentRoutine.exercises[nextIndex];
    set({
      currentExercise: nextExercise,
      exerciseIndex: nextIndex,
      exerciseTimer: nextExercise.duration,
      exercisesCompleted: exercisesCompleted + 1,
      score: score + 25,
    });
  },

  completeExercise: () => {
    const { score } = get();
    set({ score: score + 50 });
    get().nextExercise();
  },

  updateExerciseTimer: (time) => set({ exerciseTimer: time }),

  // Pose actions
  setPose: (pose) => set({ currentPose: pose }),

  setDetectedLetter: (letter, confidence) => set({
    detectedLetter: letter,
    poseConfidence: confidence,
  }),

  // Timer actions
  updateTimer: (time) => {
    set({ timeRemaining: time });
    if (time <= 0) {
      set({ status: 'finished' });
    }
  },

  addScore: (points) => set((state) => ({ score: state.score + points })),
}));
