-- Security Fix: Lock down profiles table RLS and add KYC audit logging

-- 1. Create audit function for KYC access
CREATE OR REPLACE FUNCTION public.audit_kyc_access(
  accessor_id uuid,
  target_user_id uuid,
  access_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the KYC access event
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    accessor_id,
    'view_kyc_verification',
    'kyc_verifications',
    target_user_id::text,
    jsonb_build_object(
      'reason', access_reason,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- 2. Fix profiles table RLS - users can only view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users view own profile only"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all profiles with proper role check
CREATE POLICY "Admins view all profiles"
  ON public.profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- 3. Fix KYC verifications RLS - add audit logging for admin access
DROP POLICY IF EXISTS "Admins can view all kyc" ON public.kyc_verifications;

CREATE POLICY "Users view own KYC"
  ON public.kyc_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view KYC with mandatory audit logging
CREATE POLICY "Admins view KYC with audit"
  ON public.kyc_verifications
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    (has_role(auth.uid(), 'admin') AND
     audit_kyc_access(auth.uid(), user_id, 'compliance_review'))
  );

-- Keep existing update policies
-- (Users and admins can still update as per existing policies)