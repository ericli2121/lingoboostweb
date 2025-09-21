import { supabase } from './supabase';
import { generateThemeQueue } from './api';

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
  theme?: string;
  completion_time_ms?: number;
}

/**
 * Save a completed sentence as a record in the database
 */
export async function saveCompletedSentence(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  fromSentence: string,
  toSentence: string,
  theme?: string,
  completionTimeMs?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const record: Omit<CompletedSentenceRecord, 'id' | 'created_at'> = {
      user_id: userId,
      from_language: fromLanguage,
      to_language: toLanguage,
      from_sentence: fromSentence,
      to_sentence: toSentence,
      theme,
      completion_time_ms: completionTimeMs
    };

    const { error } = await supabase
      .from('completed_sentences')
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
      .from('completed_sentences')
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
 * Generate a new theme-based queue with 60 exercises (20 unique × 3 repetitions)
 */
export async function generateNewThemeQueue(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme: string,
  onAIStatusChange?: (isCallingAI: boolean) => void
): Promise<{ translations: Translation[]; error?: string }> {
  console.log(`🎨 [Queue] Generating new theme queue for: "${theme}"`);
  
  try {
    onAIStatusChange?.(true);
    
    const exercises = await generateThemeQueue(
      fromLanguage,
      toLanguage,
      sentenceLength,
      theme
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

    console.log(`✅ [Queue] Generated ${translations.length} translations for theme: "${theme}"`);
    return { translations };

  } catch (error) {
    onAIStatusChange?.(false);
    return { 
      translations: [], 
      error: `Error generating theme queue: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}