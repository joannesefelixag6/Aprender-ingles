import { UserStats, VocabWord, ProficiencyLevel } from '../types';

const STORAGE_KEYS = {
  STATS: 'lingoup_stats',
  VOCAB: 'lingoup_vocab',
};

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  proficiency: ProficiencyLevel.A1,
  streak: 0,
  lastPracticeDate: new Date().toISOString(),
  wordsLearned: 0,
  lessonsCompleted: 0,
  studyTimeSeconds: 0,
};

export const storage = {
  getStats: (): UserStats => {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!data) return DEFAULT_STATS;
    return JSON.parse(data);
  },
  saveStats: (stats: UserStats) => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  },
  getVocab: (): VocabWord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VOCAB);
    return data ? JSON.parse(data) : [];
  },
  saveVocab: (vocab: VocabWord[]) => {
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(vocab));
  },
  updateStats: (updater: (stats: UserStats) => UserStats) => {
    const current = storage.getStats();
    const updated = updater(current);
    storage.saveStats(updated);
    return updated;
  }
};
