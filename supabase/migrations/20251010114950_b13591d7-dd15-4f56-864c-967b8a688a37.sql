-- ============================================
-- Missing Tables for Existing Code
-- ============================================

-- 1. Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'reward', 'withdrawal', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  source TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- 2. User Balances table
CREATE TABLE IF NOT EXISTS public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'USD',
  pending_balance DECIMAL(10, 2) DEFAULT 0.00,
  lifetime_earnings DECIMAL(10, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance" ON public.user_balances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own balance" ON public.user_balances
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all balances" ON public.user_balances
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_user_balances_user ON public.user_balances(user_id);

-- 3. Earning Activities table
CREATE TABLE IF NOT EXISTS public.earning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.earning_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.earning_activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own activities" ON public.earning_activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activities" ON public.earning_activities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activities" ON public.earning_activities
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_earning_activities_user ON public.earning_activities(user_id);
CREATE INDEX idx_earning_activities_status ON public.earning_activities(status);
CREATE INDEX idx_earning_activities_created_at ON public.earning_activities(created_at DESC);

-- 4. Cint Survey Sessions table
CREATE TABLE IF NOT EXISTS public.cint_survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  survey_id TEXT NOT NULL,
  cint_session_id TEXT NOT NULL,
  survey_url TEXT NOT NULL,
  estimated_reward DECIMAL(10, 2) NOT NULL,
  estimated_duration INTEGER,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'terminated', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  actual_reward DECIMAL(10, 2),
  terminated_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cint_survey_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own survey sessions" ON public.cint_survey_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own survey sessions" ON public.cint_survey_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own survey sessions" ON public.cint_survey_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all survey sessions" ON public.cint_survey_sessions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_cint_sessions_user ON public.cint_survey_sessions(user_id);
CREATE INDEX idx_cint_sessions_status ON public.cint_survey_sessions(status);
CREATE INDEX idx_cint_sessions_created_at ON public.cint_survey_sessions(created_at DESC);

-- 5. Auto-create balance on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_balances (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_balance ON public.profiles;
CREATE TRIGGER on_profile_created_balance
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_balance();