-- Create user_streaks table
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  streak_started_at TIMESTAMPTZ,
  milestones JSONB DEFAULT '{"weekly": {"achieved": false, "count": 0}, "monthly": {"achieved": false, "count": 0}, "quarterly": {"achieved": false, "count": 0}, "yearly": {"achieved": false, "count": 0}}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_reputation table
CREATE TABLE public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  score INT DEFAULT 0 CHECK (score >= 0),
  level TEXT DEFAULT 'Bronze Novice',
  tier TEXT DEFAULT 'Bronze',
  prestige INT DEFAULT 0 CHECK (prestige >= 0),
  next_level_threshold INT DEFAULT 100,
  history JSONB DEFAULT '[]'::jsonb,
  quality_metrics JSONB DEFAULT '{"surveysCompleted": 0, "surveysRejected": 0, "averageTime": "0 min", "consistencyScore": 0, "speedingRate": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_referrals table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  referral_code TEXT,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'qualified', 'paid')),
  earnings NUMERIC(10, 2) DEFAULT 0.00 CHECK (earnings >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  qualified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Create user_referral_stats table
CREATE TABLE public.user_referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invited_count INT DEFAULT 0 CHECK (invited_count >= 0),
  joined_count INT DEFAULT 0 CHECK (joined_count >= 0),
  qualified_count INT DEFAULT 0 CHECK (qualified_count >= 0),
  total_earnings NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_earnings >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tip', 'poll', 'suggestion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  category TEXT,
  moderation_score JSONB,
  poll_options JSONB,
  reputation_impact INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create community_votes table
CREATE TABLE public.community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create kyc_verifications table
CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  provider TEXT,
  verification_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_user_reputation_score ON public.user_reputation(score);
CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_user_id);
CREATE INDEX idx_user_referrals_referred ON public.user_referrals(referred_user_id);
CREATE INDEX idx_user_referrals_status ON public.user_referrals(status);
CREATE INDEX idx_user_referral_stats_user_id ON public.user_referral_stats(user_id);
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_status ON public.community_posts(status);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_votes_post_id ON public.community_votes(post_id);
CREATE INDEX idx_community_votes_user_id ON public.community_votes(user_id);
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_streaks
CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streaks"
  ON public.user_streaks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all streaks"
  ON public.user_streaks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_reputation
CREATE POLICY "Users can view own reputation"
  ON public.user_reputation FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reputation"
  ON public.user_reputation FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reputation"
  ON public.user_reputation FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reputation"
  ON public.user_reputation FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view others reputation scores"
  ON public.user_reputation FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for user_referrals
CREATE POLICY "Users can view own referrals as referrer"
  ON public.user_referrals FOR SELECT
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Users can view own referrals as referred"
  ON public.user_referrals FOR SELECT
  USING (referred_user_id = auth.uid());

CREATE POLICY "Users can insert own referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (referrer_user_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can update referrals they created"
  ON public.user_referrals FOR UPDATE
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
  ON public.user_referrals FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all referrals"
  ON public.user_referrals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_referral_stats
CREATE POLICY "Users can view own referral stats"
  ON public.user_referral_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own referral stats"
  ON public.user_referral_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own referral stats"
  ON public.user_referral_stats FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all referral stats"
  ON public.user_referral_stats FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for community_posts
CREATE POLICY "All authenticated users can view approved posts"
  ON public.community_posts FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can insert own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all posts"
  ON public.community_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for community_votes
CREATE POLICY "All authenticated users can view votes"
  ON public.community_votes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own votes"
  ON public.community_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own votes"
  ON public.community_votes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own votes"
  ON public.community_votes FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view own kyc"
  ON public.kyc_verifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own kyc"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own kyc"
  ON public.kyc_verifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all kyc"
  ON public.kyc_verifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all kyc"
  ON public.kyc_verifications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON public.user_reputation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_referral_stats_updated_at
  BEFORE UPDATE ON public.user_referral_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();