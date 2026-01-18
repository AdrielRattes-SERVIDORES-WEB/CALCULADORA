-- ZOMBIE CLEANER SCRIPT
-- Purpose: Delete "Orphan" user profiles that are causing conflicts (Email already taken).

-- 1. Delete profiles where the login (Auth) no longer exists
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. (Optional but Safe) Delete profiles that conflict with existing emails but have different IDs
-- This handles the specific "Same Email, Different ID" crash
DELETE FROM public.users pu
USING auth.users au
WHERE pu.email = au.email AND pu.id <> au.id;

-- 3. Reset the sequence/constraints if any (Just cleanup)
VACUUM public.users;

-- 4. Re-verify policies (just to be safe)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
