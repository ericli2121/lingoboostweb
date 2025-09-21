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