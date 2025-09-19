import { SentencePair, GameState } from '../types';

export function scrambleWords(sentence: string): string[] {
  const words = sentence.split(' ').filter(word => word.trim() !== '');
  const scrambled = [...words];
  
  // Fisher-Yates shuffle algorithm
  for (let i = scrambled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
  }
  
  return scrambled;
}

export function initializeGameState(sentence: SentencePair, index: number): GameState {
  return {
    currentSentence: sentence,
    scrambledWords: scrambleWords(sentence.to),
    constructedWords: [],
    isCompleted: false,
    showAnswer: false,
    currentIndex: index
  };
}

export function checkCompletion(constructedWords: string[], targetSentence: string): boolean {
  return constructedWords.join(' ') === targetSentence;
}

export function moveWordToConstruction(
  word: string,
  scrambledWords: string[],
  constructedWords: string[]
): { newScrambled: string[]; newConstructed: string[] } {
  const newScrambled = scrambledWords.filter(w => w !== word);
  const newConstructed = [...constructedWords, word];
  
  return {
    newScrambled,
    newConstructed
  };
}

export function removeWordFromConstruction(
  word: string,
  scrambledWords: string[],
  constructedWords: string[]
): { newScrambled: string[]; newConstructed: string[] } {
  const newConstructed = constructedWords.filter(w => w !== word);
  const newScrambled = [...scrambledWords, word];
  
  return {
    newScrambled,
    newConstructed
  };
}
