-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;

-- Create proper RLS policies for users table

-- Allow users to insert their own row (for registration)
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role full access (for webhooks, etc.)
CREATE POLICY "Service role full access to users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');
