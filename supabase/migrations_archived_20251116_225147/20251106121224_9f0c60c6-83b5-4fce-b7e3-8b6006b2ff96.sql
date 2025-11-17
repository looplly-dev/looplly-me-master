-- Fix RLS policies to require authentication

-- 1. Fix badge_catalog - require authentication for viewing
DROP POLICY IF EXISTS "Users can view active badges" ON public.badge_catalog;
CREATE POLICY "Authenticated users can view active badges"
  ON public.badge_catalog
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- 2. Fix agent_dependencies - require authentication
DROP POLICY IF EXISTS "Users can view dependencies" ON public.agent_dependencies;
CREATE POLICY "Authenticated users can view active dependencies"
  ON public.agent_dependencies
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- 3. Fix earning_rules - require authentication for viewing
DROP POLICY IF EXISTS "Authenticated users can view active earning rules" ON public.earning_rules;
CREATE POLICY "Authenticated users can view active earning rules"
  ON public.earning_rules
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- 4. Fix ai_agents table - require authentication
DROP POLICY IF EXISTS "Users can view agents" ON public.ai_agents;
CREATE POLICY "Authenticated users can view agents"
  ON public.ai_agents
  FOR SELECT
  USING (auth.uid() IS NOT NULL);