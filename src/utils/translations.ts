import { supabase } from './supabase';
import { generateThemeQueue } from './api';
import { COMMON_LANGUAGES } from '../data/languages';

export interface Translation {
  from_sentence: string;
  to_sentence: string;
}

export interface CompletedSentenceRecord {
  id?: number;
  created_at?: string;
  user_id: string;
  from_language: string;
  to_language: string;
  from_sentence: string;
  to_sentence: string;
  number_of_times_correct?: number;
}

/**
 * Convert language name to language code
 */
function getLanguageCode(languageName: string): string {
  if (!languageName) return 'en';
  
  // If it's already a code (2-3 characters), return as is
  if (languageName.length <= 3) {
    return languageName.toLowerCase();
  }
  
  // Find the language code by name
  const language = COMMON_LANGUAGES.find(lang => 
    lang.name.toLowerCase() === languageName.toLowerCase()
  );
  
  return language?.code || 'en';
}

/**
 * Save a completed sentence as a record in the database
 */
export async function saveCompletedSentence(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  fromSentence: string,
  toSentence: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const record: Omit<CompletedSentenceRecord, 'id' | 'created_at'> = {
      user_id: userId,
      from_language: fromLanguage,
      to_language: toLanguage,
      from_sentence: fromSentence,
      to_sentence: toSentence,
      number_of_times_correct: 1
    };

    const { error } = await supabase
      .from('translations')
      .insert(record);

    if (error) {
      return { success: false, error: `Error saving completed sentence: ${error.message}` };
    }

    console.log(`✅ [DB] Saved completed sentence: "${fromSentence}" -> "${toSentence}"`);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Get completed sentences count for statistics
 */
export async function getCompletedSentencesCount(
  userId: string,
  fromLanguage?: string,
  toLanguage?: string
): Promise<{ count: number; error?: string }> {
  try {
    let query = supabase
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (fromLanguage) {
      query = query.eq('from_language', fromLanguage);
    }
    if (toLanguage) {
      query = query.eq('to_language', toLanguage);
    }

    const { count, error } = await query;

    if (error) {
      return { count: 0, error: `Error fetching completed sentences count: ${error.message}` };
    }

    return { count: count || 0 };
  } catch (error) {
    return { 
      count: 0, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Generate a new theme-based queue with configurable exercises and repetitions
 */
export async function generateNewThemeQueue(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme: string,
  numberOfExercises: number = 20,
  repetitions: number = 3,
  onAIStatusChange?: (isCallingAI: boolean) => void,
  onStatusUpdate?: (attempt: number, maxRetries: number) => void
): Promise<{ translations: Translation[]; error?: string }> {
  console.log(`🎨 [Queue] Generating new theme queue for: "${theme}" (${numberOfExercises} exercises × ${repetitions} repetitions)`);
  
  try {
    onAIStatusChange?.(true);
    
    // Fetch recent exercises to avoid duplication
    const recentExercises = await fetchRecentExercises(userId, fromLanguage, toLanguage, 40);
    
    // Extract just the "to" sentences for deduplication
    const previousToSentences = recentExercises.map(exercise => exercise.to_sentence);
    
    const exercises = await generateThemeQueue(
      fromLanguage,
      toLanguage,
      sentenceLength,
      theme,
      numberOfExercises,
      repetitions,
      previousToSentences,
      onStatusUpdate
    );
    
    onAIStatusChange?.(false);

    if (exercises.length === 0) {
      return { 
        translations: [], 
        error: `Failed to generate exercises for theme: ${theme}` 
      };
    }

    // Convert exercises to translation format
    const translations: Translation[] = exercises.map(exercise => ({
      from_sentence: exercise.from,
      to_sentence: exercise.to
    }));

    console.log(`✅ [Queue] Generated ${translations.length} translations for theme: "${theme}" (avoiding ${previousToSentences.length} recent exercises)`);
    return { translations };

  } catch (error) {
    onAIStatusChange?.(false);
    return { 
      translations: [], 
      error: `Error generating theme queue: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Fetch user's recent completed sentences for deduplication
 */
export async function fetchRecentExercises(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  limit: number = 40
): Promise<Translation[]> {
  try {
    console.log(`📚 [Recent] Fetching recent exercises for user ${userId}: ${fromLanguage} -> ${toLanguage}`);
    
    const { data, error } = await supabase
      .from('translations')
      .select('from_sentence, to_sentence')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [Recent] Error fetching recent exercises:', error);
      throw error;
    }

    const recentExercises = data?.map(item => ({
      from_sentence: item.from_sentence,
      to_sentence: item.to_sentence
    })) || [];

    console.log(`✅ [Recent] Fetched ${recentExercises.length} recent exercises for deduplication`);
    return recentExercises;
  } catch (error) {
    console.error('❌ [Recent] Error in fetchRecentExercises:', error);
    // Return empty array on error to avoid blocking exercise generation
    return [];
  }
}

/**
 * Fetch user's completed sentences history for a specific language pair
 */
export async function fetchUserHistory(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  limit: number = 200
): Promise<CompletedSentenceRecord[]> {
  try {
    console.log(`📚 [History] Fetching history for user ${userId}: ${fromLanguage} -> ${toLanguage}`);
    
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [History] Error fetching history:', error);
      throw error;
    }

    console.log(`✅ [History] Fetched ${data?.length || 0} history entries`);
    return data || [];
  } catch (error) {
    console.error('❌ [History] Error in fetchUserHistory:', error);
    throw error;
  }
}

/**
 * Get user's most recent language preferences from their translation history
 */
export async function getUserLanguagePreferences(
  userId: string
): Promise<{ fromLanguage: string; toLanguage: string; error?: string }> {
  try {
    console.log(`🌐 [LanguagePrefs] Fetching language preferences for user ${userId}`);
    
    // Get the most recent translation entry to determine preferred languages
    const { data, error } = await supabase
      .from('translations')
      .select('from_language, to_language')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no translations exist, return default values
      if (error.code === 'PGRST116') {
        console.log('🌐 [LanguagePrefs] No translation history found, using defaults');
        return { fromLanguage: 'en', toLanguage: 'es' };
      }
      console.error('❌ [LanguagePrefs] Error fetching language preferences:', error);
      return { fromLanguage: 'en', toLanguage: 'es', error: error.message };
    }

    if (data) {
      console.log(`✅ [LanguagePrefs] Found preferences: ${data.from_language} -> ${data.to_language}`);
      return { 
        fromLanguage: getLanguageCode(data.from_language || 'en'), 
        toLanguage: getLanguageCode(data.to_language || 'es') 
      };
    }

    // Fallback to defaults
    return { fromLanguage: 'en', toLanguage: 'es' };
  } catch (error) {
    console.error('❌ [LanguagePrefs] Error in getUserLanguagePreferences:', error);
    return { 
      fromLanguage: 'en', 
      toLanguage: 'es', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}