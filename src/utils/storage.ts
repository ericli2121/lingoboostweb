import { Statistics } from '../types';

const STATS_KEY = 'rapidlingo-stats';
const CURRENT_INDEX_KEY = 'rapidlingo-current-index';
const LANGUAGE_PREFS_KEY = 'rapidlingo-language-prefs';

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

export interface LanguagePreferences {
  fromLanguage: string;
  toLanguage: string;
}

export function loadLanguagePreferences(): LanguagePreferences {
  try {
    const stored = localStorage.getItem(LANGUAGE_PREFS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load language preferences:', error);
  }
  
  return {
    fromLanguage: 'en',
    toLanguage: 'es'
  };
}

export function saveLanguagePreferences(prefs: LanguagePreferences): void {
  try {
    localStorage.setItem(LANGUAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save language preferences:', error);
  }
}
