-- Create referrals table to track referral relationships and qualification status
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  referee_earnings NUMERIC DEFAULT 0.00,
  referrer_payout NUMERIC DEFAULT 0.35,
  qualification_met BOOLEAN DEFAULT false,
  min_rep_points INTEGER DEFAULT 100,
  accountant_status TEXT DEFAULT 'awaiting_referee_earnings',
  funds_verified BOOLEAN DEFAULT false,
  payout_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  qualified_at TIMESTAMPTZ NULL,
  paid_at TIMESTAMPTZ NULL,
  UNIQUE(referrer_id, referee_id)
);

-- Rename column if it exists with old name (for compatibility with earlier migration)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'referrals' 
    AND column_name = 'referred_id'
  ) THEN
    ALTER TABLE public.referrals RENAME COLUMN referred_id TO referee_id;
  END IF;
END $$;

-- Add new columns if they don't exist
ALTER TABLE public.referrals 
  ADD COLUMN IF NOT EXISTS referee_earnings NUMERIC DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS referrer_payout NUMERIC DEFAULT 0.35,
  ADD COLUMN IF NOT EXISTS qualification_met BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_rep_points INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS accountant_status TEXT DEFAULT 'awaiting_referee_earnings',
  ADD COLUMN IF NOT EXISTS funds_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL;

-- Enable RLS (idempotent)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view referrals they made or received" ON public.referrals;
DROP POLICY IF EXISTS "Users can insert referrals they made" ON public.referrals;
DROP POLICY IF EXISTS "Users can update referrals they made" ON public.referrals;

-- Create policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can insert their own referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at (idempotent via OR REPLACE)
DROP TRIGGER IF EXISTS update_referrals_updated_at ON public.referrals;
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add referral_id to transactions table for tracking referral-related payouts
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL;

-- Create referral codes table for unique code generation
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for referral codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes" 
ON public.referral_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral codes" 
ON public.referral_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
ON public.referral_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for referral codes updated_at
CREATE TRIGGER update_referral_codes_updated_at
BEFORE UPDATE ON public.referral_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance (skip if they already exist)
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_accountant_status ON public.referrals(accountant_status);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
