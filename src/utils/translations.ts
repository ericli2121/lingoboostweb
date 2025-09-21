import { supabase } from './supabase';
import { generateThemeQueue, generateExercisesSimple } from './api';

// Track ongoing background generation to prevent duplicate calls
const ongoingGenerations = new Map<string, Promise<void>>();

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
  console.log(`💾 [DB] insertTranslationsBatch - attempting to insert ${translations.length} translations`);
  console.log(`💾 [DB] Insert params: user=${userId.substring(0,8)}..., ${fromLanguage}->${toLanguage}`);
  
  const result: BatchInsertResult = {
    insertedCount: 0,
    skippedCount: 0,
    errors: []
  };

  try {
    // First, get existing from_sentences for this user/language combination
    console.log(`🔍 [DB] Checking for existing translations to prevent duplicates...`);
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

/**
 * Fetch n random translation pairs for a user where number_of_times_correct < threshold
 * Always returns translations in random order. Set allowDuplicates=true to allow the same translation multiple times
 */
export async function getRandomTranslationsForPractice(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  count: number,
  numberOfTimesCorrect: number,
  allowDuplicates: boolean = false
): Promise<{ translations: Translation[]; error?: string }> {
  console.log(`🔍 [DB] getRandomTranslationsForPractice - searching for ${count} translations (duplicates: ${allowDuplicates})`);
  console.log(`🔍 [DB] Query params: user=${userId.substring(0,8)}..., ${fromLanguage}->${toLanguage}, correctThreshold<${numberOfTimesCorrect}`);
  
  try {
    // Get all translations where correct count is less than threshold
    const { data: availableTranslations, error: fetchError } = await supabase
      .from('translations')
      .select('from_sentence, to_sentence')
      .eq('user_id', userId)
      .eq('from_language', fromLanguage)
      .eq('to_language', toLanguage)
      .lt('number_of_times_correct', numberOfTimesCorrect);

    if (fetchError) {
      console.error('❌ [DB] Database fetch error:', fetchError);
      return { translations: [], error: `Database error: ${fetchError.message}` };
    }

    console.log(`📊 [DB] Found ${availableTranslations?.length || 0} available translations in database`);

    if (!availableTranslations || availableTranslations.length === 0) {
      console.log('📭 [DB] No translations available for practice');
      return { translations: [], error: 'No translations available for practice' };
    }

    // Select translations based on allowDuplicates parameter
    const selectedTranslations: Translation[] = [];
    
    if (allowDuplicates) {
      // Randomly select n translations (allowing duplicates)
      console.log(`🎲 [DB] Selecting ${count} random translations (duplicates allowed)`);
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableTranslations.length);
        selectedTranslations.push(availableTranslations[randomIndex]);
      }
    } else {
      // Randomly select translations without duplicates (up to available count)
      console.log(`🎲 [DB] Selecting ${Math.min(count, availableTranslations.length)} random translations (no duplicates)`);
      const shuffled = [...availableTranslations].sort(() => Math.random() - 0.5);
      const selectCount = Math.min(count, availableTranslations.length);
      for (let i = 0; i < selectCount; i++) {
        selectedTranslations.push(shuffled[i]);
      }
    }

    console.log(`✅ [DB] Selected ${selectedTranslations.length} translations for practice:`);
    selectedTranslations.forEach((t, i) => {
      console.log(`   ${i + 1}. "${t.from_sentence}" -> "${t.to_sentence}"`);
    });
    return { translations: selectedTranslations };
  } catch (error) {
    return { 
      translations: [], 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Background generation of translations to keep the database stocked
 */
async function generateTranslationsInBackground(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  sentenceLength: number,
  theme?: string,
  onAIStatusChange?: (isCallingAI: boolean) => void
): Promise<void> {
  const generationKey = `${userId}-${fromLanguage}-${toLanguage}-${sentenceLength}-${theme || ''}`;
  
  // Check if generation is already in progress for this combination
  if (ongoingGenerations.has(generationKey)) {
    console.log('Background generation already in progress for this configuration');
    return;
  }

  const generationPromise = (async () => {
    try {
      console.log('🔄 [Background] Starting background generation of translations...');
      console.log(`🔄 [Background] Generating for: ${fromLanguage} -> ${toLanguage}, length=${sentenceLength}, theme="${theme}"`);
      
      // Generate new exercises via API (generate more to build up stock)
      onAIStatusChange?.(true);
      const newExercises = await generateExercisesSimple(
        fromLanguage,
        toLanguage,
        sentenceLength,
        theme,
        20 // Generate 20 more in background
      );
      onAIStatusChange?.(false);

      if (!newExercises || newExercises.length === 0) {
        console.warn('⚠️ [Background] Failed to generate new exercises from API');
        return;
      }

      console.log(`✅ [Background] Generated ${newExercises.length} new exercises, saving to database...`);
      console.log(`🔄 [Background] Background translations generated:`);
      newExercises.forEach((exercise, i) => {
        console.log(`   ${i + 1}. "${exercise.from}" -> "${exercise.to}"`);
      });

      // Convert API exercises to translations format
      const translationsToSave: Translation[] = newExercises.map(exercise => ({
        from_sentence: exercise.from,
        to_sentence: exercise.to
      }));

      // Save new translations to database
      const insertResult = await insertTranslationsBatch(
        userId,
        fromLanguage,
        toLanguage,
        translationsToSave
      );

      if (insertResult.errors.length > 0) {
        console.error('❌ [Background] Errors inserting translations:', insertResult.errors);
      }

      console.log(`✅ [Background] Inserted ${insertResult.insertedCount} new translations, skipped ${insertResult.skippedCount} duplicates`);

    } catch (error) {
      console.error('❌ [Background] Background generation error:', error);
    }
  })();

  // Store the promise to prevent duplicate calls
  ongoingGenerations.set(generationKey, generationPromise);
  console.log(`📝 [Background] Stored generation promise for key: ${generationKey}`);
  
  // Remove from tracking when complete
  generationPromise.finally(() => {
    ongoingGenerations.delete(generationKey);
  });

  await generationPromise;
}

/**
 * Smart function to get translations for practice
 * If no translations available, generates new ones via API and saves to DB
 */
export async function getTranslationsForPracticeWithFallback(
  userId: string,
  fromLanguage: string,
  toLanguage: string,
  count: number,
  sentenceLength: number,
  theme?: string,
  numberOfTimesCorrect: number = 5,
  onAIStatusChange?: (isCallingAI: boolean) => void
): Promise<{ translations: Translation[]; error?: string; generatedNew?: boolean }> {
  console.log(`🔍 [Translations] Starting getTranslationsForPracticeWithFallback`);
  console.log(`🔍 [Translations] Parameters: userId=${userId.substring(0,8)}..., from=${fromLanguage}, to=${toLanguage}, count=${count}, length=${sentenceLength}, theme="${theme}", correctThreshold=${numberOfTimesCorrect}`);
  
  try {
    // First try to get existing translations
    console.log(`📊 [Translations] Checking for existing translations in database...`);
    const existingResult = await getRandomTranslationsForPractice(
      userId,
      fromLanguage,
      toLanguage,
      count,
      numberOfTimesCorrect,
      false // Don't allow duplicates by default
    );

    // If we have enough translations, return them
    if (!existingResult.error && existingResult.translations.length > 0) {
      console.log(`✅ [Translations] Found ${existingResult.translations.length} existing translations`);
      
      // Check if we have fewer translations than requested - trigger background generation
      if (existingResult.translations.length < count * 3) { // Increased threshold for testing
        console.log(`📈 [Translations] Have ${existingResult.translations.length} translations but need ${count * 3}, starting background generation...`);
        // Start background generation asynchronously (don't await)
        generateTranslationsInBackground(
          userId,
          fromLanguage,
          toLanguage,
          sentenceLength,
          theme,
          onAIStatusChange
        ).catch(error => {
          console.error('❌ [Translations] Background generation failed:', error);
        });
      } else {
        console.log(`✅ [Translations] Have enough translations (${existingResult.translations.length}/${count * 3}), no background generation needed`);
      }
      
      return { 
        translations: existingResult.translations,
        generatedNew: false
      };
    }

    console.log('🚫 [Translations] No existing translations found, generating new ones...');

    // Generate new exercises via API
    console.log(`🌐 [Translations] Calling API to generate ${count} new exercises...`);
    onAIStatusChange?.(true);
    const newExercises = await generateExercisesSimple(
      fromLanguage,
      toLanguage,
      sentenceLength,
      theme,
      count
    );
    onAIStatusChange?.(false);

    if (!newExercises || newExercises.length === 0) {
      console.error('❌ [Translations] API returned no exercises');
      return { 
        translations: [], 
        error: 'Failed to generate new exercises from API' 
      };
    }

    console.log(`✅ [Translations] API generated ${newExercises.length} new exercises, saving to database...`);
    console.log(`🆕 [Translations] New translations from API:`);
    newExercises.forEach((exercise, i) => {
      console.log(`   ${i + 1}. "${exercise.from}" -> "${exercise.to}"`);
    });

    // Convert API exercises to translations format
    const translationsToSave: Translation[] = newExercises.map(exercise => ({
      from_sentence: exercise.from,
      to_sentence: exercise.to
    }));

    // Save new translations to database
    const insertResult = await insertTranslationsBatch(
      userId,
      fromLanguage,
      toLanguage,
      translationsToSave
    );

    if (insertResult.errors.length > 0) {
      console.error('Errors inserting translations:', insertResult.errors);
    }

    console.log(`Inserted ${insertResult.insertedCount} new translations, skipped ${insertResult.skippedCount} duplicates`);

    // Now try to get translations again
    const finalResult = await getRandomTranslationsForPractice(
      userId,
      fromLanguage,
      toLanguage,
      count,
      numberOfTimesCorrect,
      false // Don't allow duplicates by default
    );

    if (finalResult.error || finalResult.translations.length === 0) {
      return { 
        translations: [], 
        error: 'Failed to fetch translations after generating new ones' 
      };
    }

    return { 
      translations: finalResult.translations,
      generatedNew: true
    };

  } catch (error) {
    return { 
      translations: [], 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}