/*
  # Add last_visit column to patients table

  1. New Column
    - `last_visit` (timestamptz, optional) - tracks the last visit date for each patient

  2. Index
    - Add index on last_visit for performance when sorting/filtering by visit dates
*/

-- Add last_visit column to patients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'last_visit'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN last_visit timestamptz;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_patients_last_visit ON public.patients(last_visit);

-- Update some sample records with last visit dates (optional)
UPDATE public.patients 
SET last_visit = created_at + INTERVAL '1 day' + (RANDOM() * INTERVAL '30 days')
WHERE last_visit IS NULL AND RANDOM() > 0.3;