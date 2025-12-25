/*
  # Create Injection Invoices Table

  1. New Table
    - `injection_invoices` - Tracks generated invoices for injections
      - `id` (uuid, primary key)
      - `invoice_no` (text, unique, format: INV-YYYY-XXXXX)
      - `injection_id` (uuid, FK to injections, nullable for preview-only)
      - `patient_id` (uuid, FK to patients)
      - `doctor_id` (uuid, FK to doctors)
      - `injection_details` (text, optional)
      - `payment_method` (text)
      - `payment_amount` (numeric)
      - `admission_type` (text)
      - `generated_at` (timestamptz, default now)

  2. Important Notes
    - Invoice numbers are auto-generated in format INV-YYYY-XXXXX
    - injection_id is nullable to support preview-only invoices
    - Once injection is saved, the invoice can be linked back

  3. Security
    - Enable RLS
    - Allow anon and authenticated access
    - Create indexes for performance
*/

-- Create injection_invoices table
CREATE TABLE IF NOT EXISTS public.injection_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL,
  injection_id uuid REFERENCES public.injections(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  injection_details text,
  payment_method text NOT NULL,
  payment_amount numeric(10,2) NOT NULL CHECK (payment_amount >= 0),
  admission_type text NOT NULL,
  generated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_injection_invoices_invoice_no ON public.injection_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_injection_invoices_injection_id ON public.injection_invoices(injection_id);
CREATE INDEX IF NOT EXISTS idx_injection_invoices_patient_id ON public.injection_invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_injection_invoices_doctor_id ON public.injection_invoices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_injection_invoices_generated_at ON public.injection_invoices(generated_at);

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_injection_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year text;
  next_number int;
  invoice_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 10) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.injection_invoices
  WHERE invoice_no LIKE 'INV-' || current_year || '-%';

  invoice_number := 'INV-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.injection_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for anon and authenticated access
CREATE POLICY "Allow all operations on injection_invoices"
  ON public.injection_invoices FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'injection_invoices'
  ) THEN
    RAISE NOTICE '✅ Injection invoices table created successfully';
  ELSE
    RAISE WARNING '⚠️ Injection invoices table creation failed';
  END IF;
END $$;
