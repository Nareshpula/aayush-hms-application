/*
  # Add Admission Type to Injections Table

  1. Changes
    - Add `admission_type` column to injections table ('IP' or 'OP')
    - Create index for faster queries and reporting

  2. Purpose
    - Track whether injection was for IP or OP patient
    - Enable OP/IP injection tracking reports
    - Support admission type filtering

  3. Safety
    - Incremental migration (only adds column)
    - Does not modify existing columns
    - Adds index for performance
*/

-- Add admission_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'injections'
    AND column_name = 'admission_type'
  ) THEN
    ALTER TABLE public.injections
    ADD COLUMN admission_type text CHECK (admission_type IN ('IP', 'OP'));
    
    RAISE NOTICE 'Added admission_type column to injections table';
  ELSE
    RAISE NOTICE 'admission_type column already exists in injections table';
  END IF;
END $$;

-- Create index for faster admission type queries
CREATE INDEX IF NOT EXISTS idx_injections_admission_type 
ON public.injections(admission_type);

-- Create composite index for date + admission_type reporting
CREATE INDEX IF NOT EXISTS idx_injections_date_admission_type 
ON public.injections(date, admission_type);

-- Create composite index for doctor + admission_type reporting
CREATE INDEX IF NOT EXISTS idx_injections_doctor_admission_type 
ON public.injections(doctor_id, admission_type);

-- Verify the changes
DO $$
DECLARE
  has_column boolean;
  index_count integer;
BEGIN
  -- Check column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'injections'
    AND column_name = 'admission_type'
  ) INTO has_column;

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'injections'
  AND indexname LIKE 'idx_injections_%admission_type%';

  IF has_column THEN
    RAISE NOTICE '✅ Migration successful:';
    RAISE NOTICE '   - admission_type column added';
    RAISE NOTICE '   - % indexes created for reporting', index_count;
    RAISE NOTICE '   - Ready for OP/IP injection tracking';
  ELSE
    RAISE WARNING '⚠️ Migration incomplete - please check errors';
  END IF;
END $$;
