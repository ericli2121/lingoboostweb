import { Statistics } from '../types';

const STATS_KEY = 'rapidlingo-stats';
const CURRENT_INDEX_KEY = 'rapidlingo-current-index';

export function loadStatistics(): Statistics {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load statistics:', error);
  }
  
  return {
    sentencesCompleted: 0,
    totalAttempts: 0,
    streak: 0,
    bestStreak: 0
  };
}

export function saveStatistics(stats: Statistics): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to save statistics:', error);
  }
}

export function loadCurrentIndex(): number {
  try {
    const stored = localStorage.getItem(CURRENT_INDEX_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (error) {
    console.warn('Failed to load current index:', error);
  }
  
  return 0;
}

export function saveCurrentIndex(index: number): void {
  try {
    localStorage.setItem(CURRENT_INDEX_KEY, index.toString());
  } catch (error) {
    console.warn('Failed to save current index:', error);
  }
}
