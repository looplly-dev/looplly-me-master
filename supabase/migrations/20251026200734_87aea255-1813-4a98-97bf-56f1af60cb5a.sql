-- Rename test user to Sipho Radebe (classic South African name)
UPDATE profiles 
SET 
  first_name = 'Sipho',
  last_name = 'Radebe',
  updated_at = now()
WHERE user_id = '834a58af-2cf7-4b2d-82e8-6acdd95b198f' AND is_test_account = true;