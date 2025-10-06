import { SentencePair, GameState, WordItem } from '../types';
import { loadDefaultThaiParser, loadDefaultSimplifiedChineseParser, loadDefaultTraditionalChineseParser, loadDefaultJapaneseParser } from 'budoux';

function isCJKLanguage(text: string): boolean {
  // Check if text contains CJK characters (Chinese, Japanese, Korean)
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
  return cjkRegex.test(text);
}

function isChineseLanguage(text: string): boolean {
  // Check if text contains Chinese characters (Simplified and Traditional)
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
}

function isJapaneseLanguage(text: string): boolean {
  // Check if text contains Japanese characters (Hiragana, Katakana, Kanji)
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/;
  return japaneseRegex.test(text);
}

function isKoreanLanguage(text: string): boolean {
  // Check if text contains Korean characters (Hangul)
  const koreanRegex = /[\uac00-\ud7af]/;
  return koreanRegex.test(text);
}

function isThaiLanguage(text: string): boolean {
  // Check if text contains Thai characters
  const thaiRegex = /[\u0e00-\u0e7f]/;
  return thaiRegex.test(text);
}

function isArabicLanguage(text: string): boolean {
  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
  return arabicRegex.test(text);
}

function splitCJKSentence(sentence: string): string[] {
  try {
    let parser;
    
    // Determine which parser to use based on language detection
    if (isChineseLanguage(sentence)) {
      // Try Simplified Chinese first, fallback to Traditional
      try {
        parser = loadDefaultSimplifiedChineseParser();
      } catch {
        parser = loadDefaultTraditionalChineseParser();
      }
    } else if (isJapaneseLanguage(sentence)) {
      parser = loadDefaultJapaneseParser();
    } else if (isKoreanLanguage(sentence)) {
      // Korean doesn't have a specific parser in BudouX, use Japanese as fallback
      parser = loadDefaultJapaneseParser();
    } else {
      // Default to Japanese parser for mixed CJK text
      parser = loadDefaultJapaneseParser();
    }
    
    const segments = parser.parse(sentence);
    
    // Filter out empty segments and return
    return segments.filter(segment => segment.trim() !== '');
  } catch (error) {
    console.warn('BudouX failed for CJK, falling back to character-based splitting:', error);
    
    // Fallback: Original character-based splitting
    const chunks: string[] = [];
    let i = 0;
    
    while (i < sentence.length) {
      const char = sentence[i];
      
      // Skip spaces and punctuation
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      
      // For punctuation, treat as single unit
      if (/[。！？，、；：""''（）【】〈〉《》「」『』〔〕［］｛｝]/.test(char)) {
        chunks.push(char);
        i++;
        continue;
      }
      
      // For regular characters, create chunks of 1-2 characters
      let chunkSize = 1;
      
      // If current character is followed by similar character types, group them
      if (i + 1 < sentence.length) {
        const nextChar = sentence[i + 1];
        // Group consecutive similar character types (hiragana, katakana, kanji, etc.)
        if (
          (/[\u3040-\u309f]/.test(char) && /[\u3040-\u309f]/.test(nextChar)) || // hiragana
          (/[\u30a0-\u30ff]/.test(char) && /[\u30a0-\u30ff]/.test(nextChar)) || // katakana
          (/[\u4e00-\u9fff]/.test(char) && /[\u4e00-\u9fff]/.test(nextChar)) || // kanji
          (/[\uac00-\ud7af]/.test(char) && /[\uac00-\ud7af]/.test(nextChar))    // korean
        ) {
          chunkSize = Math.min(2, sentence.length - i);
        }
      }
      
      chunks.push(sentence.substring(i, i + chunkSize));
      i += chunkSize;
    }
    
    return chunks.filter(chunk => chunk.trim() !== '');
  }
}

function splitThaiSentence(sentence: string): string[] {
  try {
    // Use BudouX for intelligent Thai word segmentation
    const parser = loadDefaultThaiParser();
    const segments = parser.parse(sentence);
    
    // Filter out empty segments and return
    return segments.filter(segment => segment.trim() !== '');
  } catch (error) {
    console.warn('BudouX failed, falling back to character-based splitting:', error);
    
    // Fallback: Remove spaces and split into random word groups of 1-4 characters
    const cleanText = sentence.replace(/\s+/g, '');
    const chunks: string[] = [];
    let i = 0;
    
    while (i < cleanText.length) {
      // Randomly choose group size between 1-4, but don't exceed remaining characters
      const maxGroupSize = Math.min(4, cleanText.length - i);
      const groupSize = Math.floor(Math.random() * maxGroupSize) + 1;
      
      // Extract the group
      const group = cleanText.substring(i, i + groupSize);
      chunks.push(group);
      
      i += groupSize;
    }
    
    return chunks.filter(chunk => chunk.trim() !== '');
  }
}

export function scrambleWords(sentence: string): WordItem[] {
  // Detect language type and handle accordingly
  if (isCJKLanguage(sentence)) {
    const chunks = splitCJKSentence(sentence);
    const scrambled = [...chunks];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled.map((word, index) => ({ word, index }));

  } else if (isThaiLanguage(sentence)) {
    const chunks = splitThaiSentence(sentence);
    const scrambled = [...chunks];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled.map((word, index) => ({ word, index }));

  } else if (isArabicLanguage(sentence)) {
    // Arabic uses spaces but has special considerations for connected letters
    // For now, treat like space-separated languages but could be enhanced
    const words = sentence.split(' ').filter(word => word.trim() !== '');
    const scrambled = [...words];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled.map((word, index) => ({ word, index }));
  } else {
    // For space-separated languages (English, Spanish, French, German, etc.)
    const words = sentence.split(' ').filter(word => word.trim() !== '');
    const scrambled = [...words];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled.map((word, index) => ({ word, index }));
  }
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
  // For CJK and Thai languages, compare without spaces
  if (isCJKLanguage(targetSentence) || isThaiLanguage(targetSentence)) {
    const constructedSentence = constructedWords.join('');
    return constructedSentence === targetSentence.replace(/\s+/g, '');
  } else {
    // For space-separated languages (including Arabic), join with spaces
    return constructedWords.join(' ') === targetSentence;
  }
}

export function moveWordToConstruction(
  word: WordItem,
  scrambledWords: WordItem[],
  constructedWords: WordItem[]
): { newScrambled: WordItem[]; newConstructed: WordItem[] } {
  const wordIndex = scrambledWords.findIndex(item => item.index === word.index);
  let newScrambled = [...scrambledWords];
  let wordToMove: WordItem | undefined;
  
  if (wordIndex !== -1) {
    wordToMove = newScrambled.splice(wordIndex, 1)[0];
  }
  
  const newConstructed = wordToMove 
    ? [...constructedWords, wordToMove]
    : [...constructedWords];
  
  return {
    newScrambled,
    newConstructed
  };
}

export function removeWordFromConstruction(
  word: WordItem,
  scrambledWords: WordItem[],
  constructedWords: WordItem[]
): { newScrambled: WordItem[]; newConstructed: WordItem[] } {
  const wordIndex = constructedWords.findIndex(item => item.index === word.index);
  let newConstructed = [...constructedWords];
  let wordToMove: WordItem | undefined;
  
  if (wordIndex !== -1) {
    wordToMove = newConstructed.splice(wordIndex, 1)[0];
  }
  
  const newScrambled = wordToMove 
    ? [...scrambledWords, wordToMove]
    : [...scrambledWords];
  
  return {
    newScrambled,
    newConstructed
  };
}
// Development helper function to test language detection and scrambling
export function testScrambling() {
  console.log('Testing scrambling for different languages:');
  
  // English
  const english = "Hello world";
  console.log('English:', english, '->', scrambleWords(english));
  
  // Chinese
  const chinese = "你好世界";
  console.log('Chinese:', chinese, '->', scrambleWords(chinese));
  
  // Japanese
  const japanese = "こんにちは世界";
  console.log('Japanese:', japanese, '->', scrambleWords(japanese));
  
  // Korean
  const korean = "안녕하세요 세계";
  console.log('Korean:', korean, '->', scrambleWords(korean));
  
  // Thai
  const thai = "สวัสดีชาวโลก";
  console.log('Thai:', thai, '->', scrambleWords(thai));
  
  // Arabic
  const arabic = "مرحبا بالعالم";
  console.log('Arabic:', arabic, '->', scrambleWords(arabic));
}
