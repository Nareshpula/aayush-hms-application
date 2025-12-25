/*
  # Create Injections Module

  1. New Table
    - `injections` - Records for injection administration
      - `id` (uuid, primary key)
      - `registration_id` (uuid, FK to registrations)
      - `patient_id` (uuid, FK to patients)
      - `doctor_id` (uuid, FK to doctors)
      - `date` (timestamptz, default now)
      - `payment_method` (text, 'Cash' or 'UPI')
      - `payment_amount` (numeric)
      - `injection_details` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Relationships
    - Links to existing registrations, patients, and doctors tables
    - Cascades on registration deletion
    - Restricts on patient/doctor deletion

  3. Security
    - Enable RLS
    - Allow anon and authenticated access (matching HMS pattern)
    - Create indexes for performance
*/

-- Create injections table
CREATE TABLE IF NOT EXISTS public.injections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  date timestamptz DEFAULT now() NOT NULL,
  payment_method text CHECK (payment_method IN ('Cash', 'UPI')),
  payment_amount numeric(10,2) CHECK (payment_amount >= 0),
  injection_details text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_injections_registration_id ON public.injections(registration_id);
CREATE INDEX IF NOT EXISTS idx_injections_patient_id ON public.injections(patient_id);
CREATE INDEX IF NOT EXISTS idx_injections_doctor_id ON public.injections(doctor_id);
CREATE INDEX IF NOT EXISTS idx_injections_date ON public.injections(date);
CREATE INDEX IF NOT EXISTS idx_injections_payment_method ON public.injections(payment_method);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER trigger_injections_updated_at
  BEFORE UPDATE ON public.injections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.injections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for anon and authenticated access
CREATE POLICY "Allow all operations on injections"
  ON public.injections FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'injections'
  ) THEN
    RAISE NOTICE '✅ Injections table created successfully with all relationships and indexes';
  ELSE
    RAISE WARNING '⚠️ Injections table creation failed';
  END IF;
END $$;
