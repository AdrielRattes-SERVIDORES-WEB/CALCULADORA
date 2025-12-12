-- Add columns for tracking free calculations usage
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS free_calculations_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_calculations_reset_date timestamp with time zone DEFAULT now();

-- Add comment explaining the columns
COMMENT ON COLUMN public.users.free_calculations_used IS 'Number of free calculations used in current period';
COMMENT ON COLUMN public.users.free_calculations_reset_date IS 'Date when free calculations counter resets';
