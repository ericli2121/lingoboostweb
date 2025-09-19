-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.translations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  from_language text,
  to_language text,
  from_sentence text,
  to_sentence text,
  number_of_times_correct smallint,
  CONSTRAINT translations_pkey PRIMARY KEY (id),
  CONSTRAINT translations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Function to insert multiple translations, avoiding duplicates based on from_sentence
CREATE OR REPLACE FUNCTION insert_translations_batch(
  p_user_id uuid,
  p_from_language text,
  p_to_language text,
  p_translations jsonb
)
RETURNS TABLE(inserted_count integer, skipped_count integer) AS $$
DECLARE
  translation_record jsonb;
  inserted integer := 0;
  skipped integer := 0;
BEGIN
  -- Loop through each translation in the JSON array
  FOR translation_record IN SELECT jsonb_array_elements(p_translations)
  LOOP
    -- Insert only if from_sentence doesn't already exist for this user/language combination
    INSERT INTO public.translations (
      user_id,
      from_language,
      to_language,
      from_sentence,
      to_sentence,
      number_of_times_correct
    )
    SELECT 
      p_user_id,
      p_from_language,
      p_to_language,
      (translation_record->>'from_sentence')::text,
      (translation_record->>'to_sentence')::text,
      0
    WHERE NOT EXISTS (
      SELECT 1 FROM public.translations 
      WHERE user_id = p_user_id 
        AND from_language = p_from_language 
        AND to_language = p_to_language
        AND from_sentence = (translation_record->>'from_sentence')::text
    );
    
    -- Count results
    IF FOUND THEN
      inserted := inserted + 1;
    ELSE
      skipped := skipped + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT inserted, skipped;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert a single translation, avoiding duplicates
CREATE OR REPLACE FUNCTION insert_translation_if_not_exists(
  p_user_id uuid,
  p_from_language text,
  p_to_language text,
  p_from_sentence text,
  p_to_sentence text
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.translations (
    user_id,
    from_language,
    to_language,
    from_sentence,
    to_sentence,
    number_of_times_correct
  )
  SELECT 
    p_user_id,
    p_from_language,
    p_to_language,
    p_from_sentence,
    p_to_sentence,
    0
  WHERE NOT EXISTS (
    SELECT 1 FROM public.translations 
    WHERE user_id = p_user_id 
      AND from_language = p_from_language 
      AND to_language = p_to_language
      AND from_sentence = p_from_sentence
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- 
-- For batch insert:
-- SELECT * FROM insert_translations_batch(
--   'user-uuid-here',
--   'English',
--   'Vietnamese',
--   '[
--     {"from_sentence": "Hello world", "to_sentence": "Xin chào thế giới"},
--     {"from_sentence": "Good morning", "to_sentence": "Chào buổi sáng"},
--     {"from_sentence": "Thank you", "to_sentence": "Cảm ơn"}
--   ]'::jsonb
-- );
--
-- For single insert:
-- SELECT insert_translation_if_not_exists(
--   'user-uuid-here',
--   'English', 
--   'Vietnamese',
--   'Hello world',
--   'Xin chào thế giới'
-- );