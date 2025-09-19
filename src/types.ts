export interface SentencePair {
  from: string;
  to: string;
}

export interface GameState {
  currentSentence: SentencePair;
  scrambledWords: string[];
  constructedWords: string[];
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
