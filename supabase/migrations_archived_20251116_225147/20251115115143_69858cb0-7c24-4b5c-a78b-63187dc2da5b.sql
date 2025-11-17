-- ============================================
-- MISSING TRIGGERS MIGRATION (Verified Functions Only)
-- ============================================

-- 1. Update profile timestamp on UPDATE
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_timestamp();

-- 2. Auto-update updated_at on tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Auto-update updated_at on badge_catalog
CREATE TRIGGER update_badge_catalog_updated_at
  BEFORE UPDATE ON public.badge_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Auto-update updated_at on ai_agents
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Auto-update updated_at on agent_configs
CREATE TRIGGER update_agent_configs_updated_at
  BEFORE UPDATE ON public.agent_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Auto-update updated_at on country_question_options
CREATE TRIGGER update_country_question_options_updated_at
  BEFORE UPDATE ON public.country_question_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Auto-update updated_at on country_legal_age
CREATE TRIGGER update_country_legal_age_updated_at
  BEFORE UPDATE ON public.country_legal_age
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Auto-update updated_at on auto_approval_config
CREATE TRIGGER update_auto_approval_config_updated_at
  BEFORE UPDATE ON public.auto_approval_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Auto-update updated_at on country_profiling_gaps
CREATE TRIGGER update_country_profiling_gaps_updated_at
  BEFORE UPDATE ON public.country_profiling_gaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FIX EXISTING TRIGGERS (add UPDATE events)
-- ============================================

-- Drop and recreate compute_targeting_trigger to include UPDATE
DROP TRIGGER IF EXISTS compute_targeting_trigger ON public.profile_answers;
CREATE TRIGGER compute_targeting_trigger
  BEFORE INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_targeting_metadata();

-- Drop and recreate validate_age_on_answer to include UPDATE
DROP TRIGGER IF EXISTS validate_age_on_answer ON public.profile_answers;
CREATE TRIGGER validate_age_on_answer
  BEFORE INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_age_before_save();