import { GameWord, FitnessRoutine, GameDifficulty } from '@/types';

// Classic Mode Words
export const gameWords: Record<GameDifficulty, GameWord[]> = {
  easy: [
    { word: 'CAT', hint: 'A furry pet that meows', imageUrl: '/images/cat.png', difficulty: 'easy' },
    { word: 'BAT', hint: 'Flies at night', imageUrl: '/images/bat.png', difficulty: 'easy' },
    { word: 'DOG', hint: 'Man\'s best friend', imageUrl: '/images/dog.png', difficulty: 'easy' },
    { word: 'SUN', hint: 'Shines in the sky', imageUrl: '/images/sun.png', difficulty: 'easy' },
    { word: 'HAT', hint: 'Wear it on your head', imageUrl: '/images/hat.png', difficulty: 'easy' },
    { word: 'CUP', hint: 'Drink from it', imageUrl: '/images/cup.png', difficulty: 'easy' },
    { word: 'BED', hint: 'Sleep on it', imageUrl: '/images/bed.png', difficulty: 'easy' },
    { word: 'TOY', hint: 'Kids play with it', imageUrl: '/images/toy.png', difficulty: 'easy' },
  ],
  medium: [
    { word: 'APPLE', hint: 'A red fruit', imageUrl: '/images/apple.png', difficulty: 'medium' },
    { word: 'HOUSE', hint: 'You live in it', imageUrl: '/images/house.png', difficulty: 'medium' },
    { word: 'CHAIR', hint: 'Sit on it', imageUrl: '/images/chair.png', difficulty: 'medium' },
    { word: 'BEACH', hint: 'Sand and waves', imageUrl: '/images/beach.png', difficulty: 'medium' },
    { word: 'CLOUD', hint: 'Floats in the sky', imageUrl: '/images/cloud.png', difficulty: 'medium' },
    { word: 'TIGER', hint: 'Striped big cat', imageUrl: '/images/tiger.png', difficulty: 'medium' },
    { word: 'PLANT', hint: 'Grows in soil', imageUrl: '/images/plant.png', difficulty: 'medium' },
    { word: 'MUSIC', hint: 'You listen to it', imageUrl: '/images/music.png', difficulty: 'medium' },
  ],
  hard: [
    { word: 'ELEPHANT', hint: 'Largest land animal', imageUrl: '/images/elephant.png', difficulty: 'hard' },
    { word: 'COMPUTER', hint: 'You\'re probably using one', imageUrl: '/images/computer.png', difficulty: 'hard' },
    { word: 'BUTTERFLY', hint: 'Beautiful insect with wings', imageUrl: '/images/butterfly.png', difficulty: 'hard' },
    { word: 'UMBRELLA', hint: 'Keeps you dry', imageUrl: '/images/umbrella.png', difficulty: 'hard' },
    { word: 'DINOSAUR', hint: 'Extinct reptile', imageUrl: '/images/dinosaur.png', difficulty: 'hard' },
    { word: 'KEYBOARD', hint: 'You type on it', imageUrl: '/images/keyboard.png', difficulty: 'hard' },
    { word: 'MOUNTAIN', hint: 'Very tall landform', imageUrl: '/images/mountain.png', difficulty: 'hard' },
    { word: 'TREASURE', hint: 'Pirates look for it', imageUrl: '/images/treasure.png', difficulty: 'hard' },
  ],
};

// Fitness Mode Routines
export const fitnessRoutines: FitnessRoutine[] = [
  {
    id: 'quick-stretch',
    name: 'Quick Desk Stretch',
    description: 'A 2-minute stretch routine perfect for work breaks',
    difficulty: 'easy',
    estimatedDuration: 2,
    isPremium: false,
    exercises: [
      {
        id: 'arm-raise',
        name: 'Arm Raise',
        description: 'Raise both arms straight up above your head',
        targetPose: 'Y',
        duration: 10,
      },
      {
        id: 'side-stretch-left',
        name: 'Side Stretch Left',
        description: 'Lean to the left with arms extended',
        targetPose: 'LEFT_LEAN',
        duration: 15,
      },
      {
        id: 'side-stretch-right',
        name: 'Side Stretch Right',
        description: 'Lean to the right with arms extended',
        targetPose: 'RIGHT_LEAN',
        duration: 15,
      },
      {
        id: 't-pose',
        name: 'T-Pose Hold',
        description: 'Extend arms out to form a T shape',
        targetPose: 'T',
        duration: 15,
      },
      {
        id: 'forward-fold',
        name: 'Standing Forward Fold',
        description: 'Bend forward and touch your toes',
        targetPose: 'FORWARD_FOLD',
        duration: 20,
      },
    ],
  },
  {
    id: 'energize',
    name: 'Energizer Routine',
    description: 'Get your blood pumping with dynamic movements',
    difficulty: 'medium',
    estimatedDuration: 5,
    isPremium: false,
    exercises: [
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        description: 'Classic jumping jacks - arms up and legs out',
        targetPose: 'JUMPING_JACK_UP',
        duration: 30,
        reps: 10,
      },
      {
        id: 'squat',
        name: 'Squats',
        description: 'Bend your knees like sitting in a chair',
        targetPose: 'SQUAT',
        duration: 30,
        reps: 8,
      },
      {
        id: 'arm-circles',
        name: 'Arm Circles',
        description: 'Extend arms and make circles',
        targetPose: 'T',
        duration: 20,
      },
      {
        id: 'high-knees',
        name: 'High Knees',
        description: 'March in place with high knees',
        targetPose: 'HIGH_KNEE',
        duration: 30,
        reps: 20,
      },
      {
        id: 'cool-down',
        name: 'Cool Down Stretch',
        description: 'Arms up, deep breath',
        targetPose: 'Y',
        duration: 15,
      },
    ],
  },
  {
    id: 'yoga-basics',
    name: 'Yoga Basics',
    description: 'Introduction to basic yoga poses',
    difficulty: 'medium',
    estimatedDuration: 10,
    isPremium: true,
    exercises: [
      {
        id: 'mountain',
        name: 'Mountain Pose',
        description: 'Stand tall with arms at sides',
        targetPose: 'STANDING',
        duration: 20,
      },
      {
        id: 'tree',
        name: 'Tree Pose',
        description: 'Balance on one leg with arms up',
        targetPose: 'TREE',
        duration: 30,
      },
      {
        id: 'warrior1',
        name: 'Warrior I',
        description: 'Lunge forward with arms raised',
        targetPose: 'WARRIOR1',
        duration: 30,
      },
      {
        id: 'warrior2',
        name: 'Warrior II',
        description: 'Lunge with arms extended to sides',
        targetPose: 'WARRIOR2',
        duration: 30,
      },
      {
        id: 'triangle',
        name: 'Triangle Pose',
        description: 'Side bend with extended arms',
        targetPose: 'TRIANGLE',
        duration: 25,
      },
    ],
  },
  {
    id: 'power-workout',
    name: 'Power Workout',
    description: 'Full body workout for maximum calorie burn',
    difficulty: 'hard',
    estimatedDuration: 15,
    isPremium: true,
    exercises: [
      {
        id: 'burpees',
        name: 'Burpee Position',
        description: 'Jump up with arms raised',
        targetPose: 'JUMPING_JACK_UP',
        duration: 45,
        reps: 10,
      },
      {
        id: 'lunges',
        name: 'Lunges',
        description: 'Alternate lunges',
        targetPose: 'LUNGE',
        duration: 40,
        reps: 16,
      },
      {
        id: 'plank-up',
        name: 'Standing Plank Hold',
        description: 'Arms forward, core engaged',
        targetPose: 'PLANK_STAND',
        duration: 30,
      },
      {
        id: 'jump-squats',
        name: 'Jump Squats',
        description: 'Squat then jump up',
        targetPose: 'SQUAT',
        duration: 40,
        reps: 12,
      },
    ],
  },
];

// Battle Mode Challenges
export const battleChallenges = [
  'Make the letter T with your body',
  'Make the letter Y with your body',
  'Make the letter A with your body',
  'Do a squat pose',
  'Stand on one leg',
  'Touch your toes',
  'Arms straight up',
  'Arms out to sides',
  'Lunge position',
  'Jumping jack pose',
];

// Get random word by difficulty
export function getRandomWord(difficulty: GameDifficulty): GameWord {
  const words = gameWords[difficulty];
  return words[Math.floor(Math.random() * words.length)];
}

// Get random battle challenge
export function getRandomChallenge(): string {
  return battleChallenges[Math.floor(Math.random() * battleChallenges.length)];
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
