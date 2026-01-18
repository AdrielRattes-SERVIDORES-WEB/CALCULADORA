-- EMERGENCY UNBLOCK SCRIPT
-- Purpose: Remove the failing Database Trigger and allow the Frontend to create users directly.

-- 1. KILL THE TRIGGER (This removes the "Database error saving new user" block)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure Table Exists (Just in case)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'free',
  free_calculations_used INTEGER DEFAULT 0,
  free_calculations_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure Columns Exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS free_calculations_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_calculations_reset_date TIMESTAMPTZ DEFAULT NOW();

-- 4. ENABLE FRONTEND CREATION (Crucial for Self-Healing to work)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remove old restrictive policies
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Allow Users to INSERT their own record (Self-Healing Logic)
CREATE POLICY "Allow Users to Insert Own Data" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow Users to SELECT their own data
CREATE POLICY "Allow Users to View Own Data" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Allow Users to UPDATE their own data
CREATE POLICY "Allow Users to Update Own Data" ON public.users
FOR UPDATE USING (auth.uid() = id);
