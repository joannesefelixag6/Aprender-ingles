export enum ProficiencyLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  definition: string;
  example: string;
  level: ProficiencyLevel;
  nextReview: number; // timestamp
  interval: number; // in days
  ease: number;
}

export interface UserStats {
  xp: number;
  level: number;
  proficiency: ProficiencyLevel;
  streak: number;
  lastPracticeDate: string; // ISO date
  wordsLearned: number;
  lessonsCompleted: number;
  studyTimeSeconds: number;
}

export interface GrammarExercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type ViewState = 'dashboard' | 'vocabulary' | 'grammar' | 'speech' | 'settings';
