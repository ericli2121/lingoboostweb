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
  count: number = 5
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
        count
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
  count: number = 10
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
        count
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
    
    // Return mock data for testing when API is not available
    console.log('🤖 [API] Using mock data since API is not available');
    
    // Simulate API delay for testing the loading indicator
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockExercises: Exercise[] = [];
    for (let i = 0; i < count; i++) {
      const id = `mock-${Date.now()}-${i}`;
      let from: string, to: string;
      
      if (fromLanguage === 'English' && toLanguage === 'Vietnamese') {
        const englishSentences = [
          "I love to eat pizza",
          "The cat is sleeping",
          "We are going home",
          "She reads a book",
          "They play football together",
          "The weather is nice",
          "He drinks coffee daily",
          "My family is important",
          "The dog runs fast",
          "Students study hard"
        ];
        const vietnameseSentences = [
          "Tôi thích ăn pizza",
          "Con mèo đang ngủ",
          "Chúng tôi đang về nhà",
          "Cô ấy đọc sách",
          "Họ chơi bóng đá cùng nhau",
          "Thời tiết đẹp",
          "Anh ấy uống cà phê hàng ngày",
          "Gia đình tôi rất quan trọng",
          "Con chó chạy nhanh",
          "Học sinh học tập chăm chỉ"
        ];
        from = englishSentences[i % englishSentences.length];
        to = vietnameseSentences[i % vietnameseSentences.length];
      } else {
        // Generic mock data for other language pairs
        from = `${fromLanguage} sentence ${i + 1} about ${theme || 'general topics'}`;
        to = `${toLanguage} translation ${i + 1} about ${theme || 'general topics'}`;
      }
      
      mockExercises.push({
        id,
        from,
        to,
        words: to.split(' ')
      });
    }
    
    console.log(`🤖 [API] Generated ${mockExercises.length} mock exercises`);
    return mockExercises;
  }
};

/**
 * Generate a theme-based queue of 60 exercises (20 unique sentences, each repeated 3 times)
 */
export const generateThemeQueue = async (
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme: string
): Promise<Exercise[]> => {
  console.log(`🎨 [API] Generating theme queue for: "${theme}"`);
  
  // Generate exactly 20 unique exercises
  const uniqueExercises = await generateExercisesSimple(
    fromLanguage,
    toLanguage,
    sentenceLength,
    theme,
    20
  );
  
  if (uniqueExercises.length === 0) {
    throw new Error('Failed to generate exercises for theme');
  }
  
  // Create queue with each exercise repeated 3 times (total 60)
  const queue: Exercise[] = [];
  
  for (let repetition = 0; repetition < 3; repetition++) {
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
  
  console.log(`✅ [API] Generated theme queue with ${queue.length} exercises (${uniqueExercises.length} unique × 3 repetitions)`);
  return queue;
};