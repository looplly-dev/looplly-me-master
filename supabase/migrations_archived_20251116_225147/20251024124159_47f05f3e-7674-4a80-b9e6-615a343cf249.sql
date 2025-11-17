-- Delete duplicate portal accounts for Nadia and Warren
-- This will NOT affect their team accounts (nadia@looplly.me, warren@looplly.me)
-- These user_ids are for portal accounts only:
-- nadia.gaspari1@outlook.com (user_id: f8248437-bad4-432e-98ba-138cfa11a2a1)
-- warrenleroux@gmail.com (user_id: 29b2a26b-7044-4aba-adce-c097cf843a96)

DELETE FROM profiles 
WHERE user_id IN (
  'f8248437-bad4-432e-98ba-138cfa11a2a1',
  '29b2a26b-7044-4aba-adce-c097cf843a96'
);