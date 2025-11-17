-- Create test users for restricted access
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
(
  gen_random_uuid(),
  'warren@looplly.me',
  crypt('L00ply1111', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Warren", "lastName": "Test"}',
  false,
  'authenticated'
),
(
  gen_random_uuid(),
  'candice@looplly.me',
  crypt('L00ply1111', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Candice", "lastName": "Test"}',
  false,
  'authenticated'
),
(
  gen_random_uuid(),
  'calvin@looplly.me',
  crypt('L00ply1111', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Calvin", "lastName": "Test"}',
  false,
  'authenticated'
),
(
  gen_random_uuid(),
  'james@looplly.me',
  crypt('L00ply1111', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "James", "lastName": "Test"}',
  false,
  'authenticated'
),
(
  gen_random_uuid(),
  'jean@looplly.me',
  crypt('L00ply1111', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Jean", "lastName": "Test"}',
  false,
  'authenticated'
);