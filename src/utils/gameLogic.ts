import { SentencePair, GameState } from '../types';

function isCJKLanguage(text: string): boolean {
  // Check if text contains CJK characters (Chinese, Japanese, Korean)
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
  return cjkRegex.test(text);
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
  // For CJK languages, we'll create chunks of 1-3 characters to make it manageable
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

function splitThaiSentence(sentence: string): string[] {
  // For Thai, split by characters but try to keep some meaningful groups
  const chunks: string[] = [];
  let i = 0;
  
  while (i < sentence.length) {
    const char = sentence[i];
    
    // Skip spaces
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // For Thai vowels and tone marks, combine with previous character
    if (i > 0 && /[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/.test(char)) {
      if (chunks.length > 0) {
        chunks[chunks.length - 1] += char;
      } else {
        chunks.push(char);
      }
      i++;
      continue;
    }
    
    // Regular character
    chunks.push(char);
    i++;
  }
  
  return chunks.filter(chunk => chunk.trim() !== '');
}

export function scrambleWords(sentence: string): string[] {
  // Detect language type and handle accordingly
  if (isCJKLanguage(sentence)) {
    const chunks = splitCJKSentence(sentence);
    const scrambled = [...chunks];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled;
  } else if (isThaiLanguage(sentence)) {
    const chunks = splitThaiSentence(sentence);
    const scrambled = [...chunks];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled;
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
    
    return scrambled;
  } else {
    // For space-separated languages (English, Spanish, French, German, etc.)
    const words = sentence.split(' ').filter(word => word.trim() !== '');
    const scrambled = [...words];
    
    // Fisher-Yates shuffle algorithm
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    return scrambled;
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
