-- Harden documentation versioning to avoid duplicate key errors during reseeding
CREATE OR REPLACE FUNCTION public.archive_documentation_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_max_hist_version INTEGER;
  v_next_version INTEGER;
  v_prev_version INTEGER;
BEGIN
  -- Find the highest version already archived for this document
  SELECT COALESCE(MAX(version), 0)
    INTO v_max_hist_version
  FROM public.documentation_history
  WHERE doc_id = OLD.id;

  -- Determine previous version (fallback to computed if NULL)
  v_prev_version := COALESCE(OLD.version, v_max_hist_version);

  -- Compute the next safe version number
  v_next_version := GREATEST(v_prev_version + 1, v_max_hist_version + 1);

  -- Archive the previous row; if it already exists, skip to avoid conflicts
  INSERT INTO public.documentation_history (
    doc_id,
    version,
    title,
    content,
    category,
    tags,
    description,
    audience,
    parent,
    changed_by,
    change_summary,
    created_at
  ) VALUES (
    OLD.id,
    v_prev_version,
    OLD.title,
    OLD.content,
    OLD.category,
    OLD.tags,
    OLD.description,
    OLD.audience,
    OLD.parent,
    NEW.changed_by,
    NEW.change_summary,
    OLD.updated_at
  )
  ON CONFLICT (doc_id, version) DO NOTHING;

  -- Bump version and metadata on the main record
  NEW.version := v_next_version;
  NEW.previous_version_id := OLD.id || '_v' || v_prev_version;
  NEW.updated_at := now();

  RETURN NEW;
END;
$function$;