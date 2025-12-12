-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own row" ON public.users;

-- Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Users can only read their own data
CREATE POLICY "Users can view own data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy for INSERT: Authenticated users can insert a row with their own ID
CREATE POLICY "Users can insert own data" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy for UPDATE: Users can only update their own data
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Also fix the calculations table policies
DROP POLICY IF EXISTS "Users can view own calculations" ON public.calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON public.calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON public.calculations;

-- Make sure RLS is enabled on calculations
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT on calculations
CREATE POLICY "Users can view own calculations" 
ON public.calculations 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy for INSERT on calculations
CREATE POLICY "Users can insert own calculations" 
ON public.calculations 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE on calculations
CREATE POLICY "Users can delete own calculations" 
ON public.calculations 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
