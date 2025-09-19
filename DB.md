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