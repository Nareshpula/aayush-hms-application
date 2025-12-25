/*
  # Create Dermatology Procedures Table

  1. New Tables
    - `dermatology_procedures`
      - `id` (uuid, primary key)
      - `registration_id` (uuid) - Links to registrations
      - `patient_id` (uuid) - Links to patients
      - `doctor_id` (uuid) - Links to doctors
      - `date` (timestamptz) - Date of procedure
      - `admission_type` (text) - IP or OP
      - `payment_method` (text) - Cash or UPI
      - `payment_amount` (numeric)
      - `procedure_details` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `dermatology_procedures` table
    - Add policies for anon and authenticated users to read/write

  3. Indexes
    - Create indexes for foreign keys and date for fast queries
    - Create composite indexes for reporting
*/

-- Create dermatology_procedures table
CREATE TABLE IF NOT EXISTS public.dermatology_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  date timestamptz DEFAULT now() NOT NULL,
  admission_type text CHECK (admission_type IN ('IP', 'OP')),
  payment_method text CHECK (payment_method IN ('Cash', 'UPI')),
  payment_amount numeric(10,2) CHECK (payment_amount >= 0),
  procedure_details text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dermatology_procedures ENABLE ROW LEVEL SECURITY;

-- Create policies for anon users (allow all operations for now)
CREATE POLICY "Allow anonymous read access to dermatology_procedures"
  ON public.dermatology_procedures FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to dermatology_procedures"
  ON public.dermatology_procedures FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to dermatology_procedures"
  ON public.dermatology_procedures FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to dermatology_procedures"
  ON public.dermatology_procedures FOR DELETE
  TO anon
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access to dermatology_procedures"
  ON public.dermatology_procedures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access to dermatology_procedures"
  ON public.dermatology_procedures FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to dermatology_procedures"
  ON public.dermatology_procedures FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access to dermatology_procedures"
  ON public.dermatology_procedures FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_registration_id ON public.dermatology_procedures(registration_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_patient_id ON public.dermatology_procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_doctor_id ON public.dermatology_procedures(doctor_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_date ON public.dermatology_procedures(date);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_admission_type ON public.dermatology_procedures(admission_type);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_payment_method ON public.dermatology_procedures(payment_method);

-- Create composite indexes for reporting
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_date_admission_type ON public.dermatology_procedures(date, admission_type);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedures_doctor_admission_type ON public.dermatology_procedures(doctor_id, admission_type);

-- Create updated_at trigger
CREATE TRIGGER set_dermatology_procedures_updated_at
  BEFORE UPDATE ON public.dermatology_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Verify table creation
DO $$
DECLARE
  table_exists boolean;
  policy_count integer;
  index_count integer;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'dermatology_procedures'
  ) INTO table_exists;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'dermatology_procedures';

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'dermatology_procedures';

  IF table_exists THEN
    RAISE NOTICE '✅ Dermatology Procedures table created successfully';
    RAISE NOTICE '   - % RLS policies created', policy_count;
    RAISE NOTICE '   - % indexes created', index_count;
    RAISE NOTICE '   - Ready for dermatology procedure tracking';
  ELSE
    RAISE WARNING '⚠️ Table creation failed';
  END IF;
END $$;
