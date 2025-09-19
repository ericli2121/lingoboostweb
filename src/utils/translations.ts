import { supabase } from './supabase';

export interface Translation {
  from_sentence: string;
  to_sentence: string;
}

export interface TranslationRecord {
  id?: number;
  created_at?: string;
  user_id: string;
  from_language: string;
  to_language: string;
  from_sentence: string;
  to_sentence: string;
  number_of_times_correct: number;
}

export interface BatchInsertResult {
  insertedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Insert multiple translations for a user, skipping duplicates based on from_sentence
 */
export async function insertTranslationsBatch(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  translations: Translation[]
): Promise<BatchInsertResult> {
  const result: BatchInsertResult = {
    insertedCount: 0,
    skippedCount: 0,
    errors: []
  };

  try {
    // First, get existing from_sentences for this user/language combination
    const { data: existingTranslations, error: fetchError } = await supabase
      .from('translations')
      .select('from_sentence')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage);

    if (fetchError) {
      result.errors.push(`Error fetching existing translations: ${fetchError.message}`);
      return result;
    }

    const existingFromSentences = new Set(
      existingTranslations?.map(t => t.from_sentence) || []
    );

    // Filter out translations that already exist
    const newTranslations = translations.filter(translation => {
      if (existingFromSentences.has(translation.from_sentence)) {
        result.skippedCount++;
        return false;
      }
      return true;
    });

    // Insert new translations if any
    if (newTranslations.length > 0) {
      const translationsToInsert: Omit<TranslationRecord, 'id' | 'created_at'>[] = 
        newTranslations.map(translation => ({
          user_id: userId,
          from_language: fromLanguage,
          to_language: toLanguage,
          from_sentence: translation.from_sentence,
          to_sentence: translation.to_sentence,
          number_of_times_correct: 0
        }));

      const { data, error: insertError } = await supabase
        .from('translations')
        .insert(translationsToInsert)
        .select();

      if (insertError) {
        result.errors.push(`Error inserting translations: ${insertError.message}`);
      } else {
        result.insertedCount = data?.length || 0;
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Insert a single translation if it doesn't already exist
 */
export async function insertTranslationIfNotExists(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  fromSentence: string,
  toSentence: string
): Promise<{ inserted: boolean; error?: string }> {
  try {
    // Check if translation already exists
    const { data: existing, error: checkError } = await supabase
      .from('translations')
      .select('id')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .eq('from_sentence', fromSentence)
      .limit(1);

    if (checkError) {
      return { inserted: false, error: `Error checking existing translation: ${checkError.message}` };
    }

    // If already exists, return false
    if (existing && existing.length > 0) {
      return { inserted: false };
    }

    // Insert new translation
    const { error: insertError } = await supabase
      .from('translations')
      .insert({
        user_id: userId,
        from_language: fromLanguage,
        to_language: toLanguage,
        from_sentence: fromSentence,
        to_sentence: toSentence,
        number_of_times_correct: 0
      });

    if (insertError) {
      return { inserted: false, error: `Error inserting translation: ${insertError.message}` };
    }

    return { inserted: true };
  } catch (error) {
    return { 
      inserted: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Get all translations for a user and language pair
 */
export async function getUserTranslations(
  userId: string,
  fromLanguage: string,
  toLanguage: string
): Promise<{ translations: TranslationRecord[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .order('created_at', { ascending: false });

    if (error) {
      return { translations: [], error: `Error fetching translations: ${error.message}` };
    }

    return { translations: data || [] };
  } catch (error) {
    return { 
      translations: [], 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Update the number of times a translation was answered correctly
 */
export async function updateTranslationCorrectCount(
  translationId: number,
  increment: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the current count
    const { data: current, error: fetchError } = await supabase
      .from('translations')
      .select('number_of_times_correct')
      .eq('id', translationId)
      .single();

    if (fetchError) {
      return { success: false, error: `Error fetching current count: ${fetchError.message}` };
    }

    // Update with the new count
    const { error } = await supabase
      .from('translations')
      .update({ 
        number_of_times_correct: (current.number_of_times_correct || 0) + increment
      })
      .eq('id', translationId);

    if (error) {
      return { success: false, error: `Error updating translation: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Increment the correct count by 1 for a translation
 */
export async function incrementTranslationCorrectCount(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  fromSentence: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First get the current count for the specific translation
    const { data: current, error: fetchError } = await supabase
      .from('translations')
      .select('number_of_times_correct')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .eq('from_sentence', fromSentence)
      .single();

    if (fetchError) {
      return { success: false, error: `Error fetching translation: ${fetchError.message}` };
    }

    if (!current) {
      return { success: false, error: 'Translation not found' };
    }

    // Update with the incremented count
    const { error: updateError } = await supabase
      .from('translations')
      .update({ 
        number_of_times_correct: (current.number_of_times_correct || 0) + 1
      })
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .eq('from_sentence', fromSentence);

    if (updateError) {
      return { success: false, error: `Error updating translation: ${updateError.message}` };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Fetch n random translation pairs for a user where number_of_times_correct < 5
 * Allows duplicates in the result
 */
export async function getRandomTranslationsForPractice(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  count: number,
  numberOfTimesCorrect: number = 5
): Promise<{ translations: Translation[]; error?: string }> {
  try {
    // Get all translations where correct count is less than 5
    const { data: availableTranslations, error: fetchError } = await supabase
      .from('translations')
      .select('from_sentence, to_sentence')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .lt('number_of_times_correct', numberOfTimesCorrect);

    if (fetchError) {
      return { translations: [], error: `Error fetching translations: ${fetchError.message}` };
    }

    if (!availableTranslations || availableTranslations.length === 0) {
      return { translations: [], error: 'No translations available for practice' };
    }

    // Randomly select n translations (allowing duplicates)
    const selectedTranslations: Translation[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableTranslations.length);
      selectedTranslations.push(availableTranslations[randomIndex]);
    }

    return { translations: selectedTranslations };
  } catch (error) {
    return { 
      translations: [], 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}