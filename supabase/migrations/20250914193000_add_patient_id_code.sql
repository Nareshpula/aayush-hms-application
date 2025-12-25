/*
  # Add Year-Based Patient ID Code

  1. Changes
    - Add `patient_id_code` column to patients table (format: AAYUSH-YYYY-NNN)
    - Drop old generate_patient_id function
    - Create new generate_patient_id_code function with year-based sequence
    - Update existing patient records with new ID format
    - Create unique index on patient_id_code

  2. Format
    - AAYUSH-<YEAR>-<SEQUENCE>
    - Example: AAYUSH-2025-001, AAYUSH-2025-002
    - Sequence resets every year

  3. Safety
    - Only adds new column, doesn't modify patient_id
    - Backfills existing records
    - Creates unique constraint
*/

-- Add patient_id_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patients'
    AND column_name = 'patient_id_code'
  ) THEN
    ALTER TABLE public.patients
    ADD COLUMN patient_id_code text;
    
    RAISE NOTICE 'Added patient_id_code column to patients table';
  ELSE
    RAISE NOTICE 'patient_id_code column already exists in patients table';
  END IF;
END $$;

-- Drop old generate_patient_id function if it exists
DROP FUNCTION IF EXISTS public.generate_patient_id();

-- Create new function to generate year-based patient ID codes
CREATE OR REPLACE FUNCTION public.generate_patient_id_code()
RETURNS text AS $$
DECLARE
  current_year text;
  next_sequence integer;
  new_patient_id text;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- Find the highest sequence number for the current year
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(patient_id_code FROM 'AAYUSH-' || current_year || '-([0-9]+)')
        AS INTEGER
      )
    ),
    0
  ) + 1
  INTO next_sequence
  FROM public.patients
  WHERE patient_id_code LIKE 'AAYUSH-' || current_year || '-%';
  
  -- Generate new patient ID code with zero-padded sequence
  new_patient_id := 'AAYUSH-' || current_year || '-' || LPAD(next_sequence::text, 3, '0');
  
  RETURN new_patient_id;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing patient records with new ID format
DO $$
DECLARE
  patient_record RECORD;
  new_id_code text;
  counter integer := 1;
BEGIN
  FOR patient_record IN 
    SELECT id FROM public.patients 
    WHERE patient_id_code IS NULL 
    ORDER BY created_at
  LOOP
    new_id_code := 'AAYUSH-' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '-' || LPAD(counter::text, 3, '0');
    
    UPDATE public.patients
    SET patient_id_code = new_id_code
    WHERE id = patient_record.id;
    
    counter := counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Backfilled % patient records with new ID codes', counter - 1;
END $$;

-- Create unique index on patient_id_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_patient_id_code_unique 
ON public.patients(patient_id_code);

-- Create regular index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_patient_id_code 
ON public.patients(patient_id_code);

-- Verify the changes
DO $$
DECLARE
  has_column boolean;
  has_function boolean;
  sample_count integer;
BEGIN
  -- Check column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patients'
    AND column_name = 'patient_id_code'
  ) INTO has_column;

  -- Check function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'generate_patient_id_code'
  ) INTO has_function;

  -- Count records with new ID format
  SELECT COUNT(*) INTO sample_count
  FROM public.patients
  WHERE patient_id_code IS NOT NULL;

  IF has_column AND has_function THEN
    RAISE NOTICE '✅ Migration successful:';
    RAISE NOTICE '   - patient_id_code column added';
    RAISE NOTICE '   - generate_patient_id_code function created';
    RAISE NOTICE '   - % existing records updated', sample_count;
    RAISE NOTICE '   - Unique index created';
  ELSE
    RAISE WARNING '⚠️ Migration incomplete - please check errors';
  END IF;
END $$;
