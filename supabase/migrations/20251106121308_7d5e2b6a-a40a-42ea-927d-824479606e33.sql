-- Fix functions missing search_path setting

-- 1. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Fix update_profile_timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Fix compute_targeting_metadata
CREATE OR REPLACE FUNCTION public.compute_targeting_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_question RECORD;
BEGIN
  -- Fetch question metadata
  SELECT question_key, targeting_tags, question_group
  INTO v_question
  FROM profile_questions
  WHERE id = NEW.question_id;
  
  -- Normalize answer value
  NEW.answer_normalized := CASE
    WHEN NEW.answer_value IS NOT NULL THEN NEW.answer_value
    WHEN NEW.answer_json IS NOT NULL THEN 
      COALESCE(
        NEW.answer_json->>'value',
        NEW.answer_json->>'formatted_address'
      )
    ELSE NULL
  END;
  
  -- Cache targeting metadata
  NEW.targeting_metadata := jsonb_build_object(
    'question_key', v_question.question_key,
    'tags', COALESCE(v_question.targeting_tags, ARRAY[]::TEXT[]),
    'group', v_question.question_group
  );
  
  RETURN NEW;
END;
$function$;