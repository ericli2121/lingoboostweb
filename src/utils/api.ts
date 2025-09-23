// API utility functions for RapidLingo
import { trackApiCall } from './analytics';

// Retry utility function with timeout and status updates
const retryWithTimeout = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  timeoutMs: number = 2000,
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [Retry] Starting attempt ${attempt}/${maxRetries}`);
      
      // Only show status updates starting from the second attempt (actual retries)
      if (onStatusUpdate && attempt > 1) {
        onStatusUpdate(attempt, maxRetries);
      }
      
      const result = await operation();
      console.log(`✅ [Retry] Attempt ${attempt}/${maxRetries} succeeded`);
      
      // Track successful API call
      trackApiCall('api_success', true, attempt);
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ [Retry] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`⏱️ [Retry] Waiting ${timeoutMs}ms before attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, timeoutMs));
      }
    }
  }
  
  console.error(`💥 [Retry] All ${maxRetries} attempts failed. Final error:`, lastError.message);
  
  // Track failed API call after all retries
  trackApiCall('api_failure', false, maxRetries);
  
  // All attempts failed
  throw lastError;
};

export const explainSentence = async (
  sentence: string,
  fromLanguage: string,
  toLanguage: string,
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<string> => {
  try {
    return await retryWithTimeout(
      async () => {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const response = await fetch(`${baseUrl}/explain`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sentence,
            from_language: fromLanguage,
            to_language: toLanguage
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const explanation = data.explanation || '';
        
        // Validate that we actually got an explanation back
        if (!explanation || explanation.trim().length === 0) {
          throw new Error('API returned empty explanation');
        }
        
        console.log(`✅ [API] Successfully got explanation (${explanation.length} characters)`);
        return explanation;
      },
      3,
      2000,
      onStatusUpdate
    );
  } catch (error) {
    console.error('Error fetching explanation after all retries:', error);
    
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('CORS error: The server needs to be configured to allow requests from this domain. Please contact the administrator to enable CORS for this endpoint.');
    } else {
      throw new Error(`Error: ${error.message}. Please try again later.`);
    }
  }
};

export interface Exercise {
  id: string;
  from: string;
  to: string;
  words: string[];
}

export interface ThemeResponse {
  success: boolean;
  themes: string[];
  language: string;
  count: number;
  total_generated: number;
}

export const generateThemes = async (
  language: string,
  count: number = 5,
  previousThemes: string[] = [],
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<string[]> => {
  try {
    return await retryWithTimeout(
      async () => {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const response = await fetch(`${baseUrl}/generate_themes`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            language,
            count,
            previous_themes: previousThemes
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ThemeResponse = await response.json();
        const themes = data.themes || [];
        
        // Validate that we actually got themes back
        if (themes.length === 0) {
          throw new Error('API returned no themes');
        }
        
        console.log(`✅ [API] Successfully generated ${themes.length} themes`);
        return themes;
      },
      3,
      2000,
      onStatusUpdate
    );
  } catch (error) {
    console.error('Error generating themes:', error);
    
    // Return mock themes for testing when API is not available after all retries
    console.log('🎨 [API] Using mock themes since API is not available after retries');
    
    const mockThemes = [
      "cute animals and their baby names",
      "adjectives to describe personality traits", 
      "conditional sentences about imaginary situations",
      "phrases using 'it is too ___ to ___'",
      "questions using the five W words (who, what, when, where, why)",
      "present continuous tense for describing current activities",
      "comparisons between city and countryside life",
      "past tense stories about childhood memories",
      "polite requests and formal language",
      "weather expressions and seasonal activities",
      "food textures and flavors vocabulary",
      "emotions and feelings in different contexts",
      "travel vocabulary for airport situations",
      "family relationships and kinship terms",
      "workplace communication phrases"
    ];
    
    return mockThemes.slice(0, count);
  }
};

export const generateExercisesSimple = async (
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme?: string,
  count: number = 10,
  previousExercises: string[] = [],
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<Exercise[]> => {
  return retryWithTimeout(
    async () => {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await fetch(`${baseUrl}/generate_exercises_simple`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          from_language: fromLanguage,
          to_language: toLanguage,
          sentence_length: sentenceLength,
          subject: theme || undefined,
          count,
          previous_exercises: previousExercises
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const exercises = data.exercises || [];
      
      // Validate that we actually got exercises back
      if (exercises.length === 0) {
        throw new Error('API returned no exercises');
      }
      
      console.log(`✅ [API] Successfully generated ${exercises.length} exercises`);
      return exercises;
    },
    3,
    2000,
    onStatusUpdate
  );
};

/**
 * Generate a theme-based queue with configurable exercises and repetitions
 */
export const generateThemeQueue = async (
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme: string,
  numberOfExercises: number = 20,
  repetitions: number = 3,
  previousExercises: string[] = [],
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<Exercise[]> => {
  console.log(`🎨 [API] Generating theme queue for: "${theme}" (${numberOfExercises} exercises × ${repetitions} repetitions)`);
  
  // Generate the specified number of unique exercises
  const uniqueExercises = await generateExercisesSimple(
    fromLanguage,
    toLanguage,
    sentenceLength,
    theme,
    numberOfExercises,
    previousExercises,
    onStatusUpdate
  );
  
  if (uniqueExercises.length === 0) {
    throw new Error('Failed to generate exercises for theme');
  }
  
  // Create queue with each exercise repeated the specified number of times
  const queue: Exercise[] = [];
  
  for (let repetition = 0; repetition < repetitions; repetition++) {
    for (const exercise of uniqueExercises) {
      queue.push({
        ...exercise,
        id: `${exercise.id}-rep${repetition + 1}` // Unique ID for each repetition
      });
    }
  }
  
  // Shuffle the queue so repetitions are not consecutive
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  
  console.log(`✅ [API] Generated theme queue with ${queue.length} exercises (${uniqueExercises.length} unique × ${repetitions} repetitions)`);
  return queue;
};