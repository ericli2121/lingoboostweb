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
    return [];
  }
};