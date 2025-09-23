// API utility functions for LingoBoost

export const explainSentence = async (
  sentence: string,
  fromLanguage: string,
  toLanguage: string
): Promise<string> => {
  try {
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
    return data.explanation || 'No explanation available.';
  } catch (error) {
    console.error('Error fetching explanation:', error);
    
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
  previousThemes: string[] = []
): Promise<string[]> => {
  try {
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
    return data.themes || [];
  } catch (error) {
    console.error('Error generating themes:', error);
    
    // Return mock themes for testing when API is not available
    console.log('🎨 [API] Using mock themes since API is not available');
    
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
  previousExercises: string[] = []
): Promise<Exercise[]> => {
  try {
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
    console.log('Generated exercises:', data.exercises);
    return data.exercises || [];
  } catch (error) {
    console.error('Error generating exercises:', error);
    throw error;
  }
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
  previousExercises: string[] = []
): Promise<Exercise[]> => {
  console.log(`🎨 [API] Generating theme queue for: "${theme}" (${numberOfExercises} exercises × ${repetitions} repetitions)`);
  
  // Generate the specified number of unique exercises
  const uniqueExercises = await generateExercisesSimple(
    fromLanguage,
    toLanguage,
    sentenceLength,
    theme,
    numberOfExercises,
    previousExercises
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