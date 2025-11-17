-- Fix the INSERT policy for user_balances table
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.user_balances;

CREATE POLICY "Users can insert their own balance" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);