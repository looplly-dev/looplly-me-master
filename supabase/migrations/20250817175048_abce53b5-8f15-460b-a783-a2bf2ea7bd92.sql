-- Delete profiles for mobile number 7708997235
DELETE FROM public.profiles WHERE mobile = '7708997235';

-- Delete the corresponding auth users
DELETE FROM auth.users WHERE id IN (
  '7fda2988-1135-46e5-a3f3-fe75b6a65ae6',
  '9f7d1093-c2ac-454e-9bb7-02a2f6d19c91'
);

-- Also delete any communication preferences
DELETE FROM public.communication_preferences WHERE user_id IN (
  '7fda2988-1135-46e5-a3f3-fe75b6a65ae6',
  '9f7d1093-c2ac-454e-9bb7-02a2f6d19c91'
);