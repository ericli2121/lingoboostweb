export interface SentencePair {
  from: string;
  to: string;
}

export interface WordItem {
  word: string;
  index: number;
}
export interface GameState {
  currentSentence: SentencePair;
  scrambledWords: WordItem[];
  constructedWords: WordItem[];
  isCompleted: boolean;
  showAnswer: boolean;
  currentIndex: number;
}

export interface Statistics {
  sentencesCompleted: number;
  totalAttempts: number;
  streak: number;
  bestStreak: number;
}

export interface AppState {
  gameState: GameState;
  statistics: Statistics;
  isLoading: boolean;
  error: string | null;
}
