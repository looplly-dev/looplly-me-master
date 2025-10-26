-- Add 'tester' role to the app_role enum
-- This allows team members to have testing permissions without full admin access

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tester';