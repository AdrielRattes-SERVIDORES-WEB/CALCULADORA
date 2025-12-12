-- Drop existing policies on users table if any
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;

-- Enable RLS (already enabled, but ensure it's on)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to SELECT their own row
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Allow users to INSERT their own row (for first-time registration)
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to UPDATE their own row
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow service role full access (for webhooks, admin operations)
CREATE POLICY "Service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
