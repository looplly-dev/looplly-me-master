-- Allow testers and admins to view test accounts
CREATE POLICY "Testers can view test accounts"
ON public.profiles
FOR SELECT
USING (
  is_test_account = true 
  AND has_role(auth.uid(), 'tester')
);