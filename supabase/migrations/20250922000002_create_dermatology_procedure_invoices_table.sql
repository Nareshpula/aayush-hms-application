/*
  # Create Dermatology Procedure Invoices Table

  1. New Tables
    - `dermatology_procedure_invoices`
      - `id` (uuid, primary key)
      - `invoice_no` (text, unique) - Invoice number
      - `dermatology_procedure_id` (uuid) - Links to dermatology_procedures table
      - `patient_id` (uuid) - Links to patients
      - `doctor_id` (uuid) - Links to doctors
      - `procedure_details` (text) - Details of procedure
      - `payment_method` (text) - Cash or UPI
      - `payment_amount` (numeric) - Amount paid
      - `admission_type` (text) - IP or OP
      - `generated_at` (timestamptz) - When invoice was generated
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `dermatology_procedure_invoices` table
    - Add policies for anon and authenticated users

  3. Indexes
    - Create indexes for performance
    - Create index on invoice_no for fast lookups
*/

-- Create dermatology_procedure_invoices table
CREATE TABLE IF NOT EXISTS public.dermatology_procedure_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL,
  dermatology_procedure_id uuid REFERENCES public.dermatology_procedures(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  procedure_details text,
  payment_method text CHECK (payment_method IN ('Cash', 'UPI')),
  payment_amount numeric(10,2) CHECK (payment_amount >= 0),
  admission_type text CHECK (admission_type IN ('IP', 'OP')),
  generated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dermatology_procedure_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for anon users
CREATE POLICY "Allow anonymous read access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR DELETE
  TO anon
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access to dermatology_procedure_invoices"
  ON public.dermatology_procedure_invoices FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_invoice_no ON public.dermatology_procedure_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_dermatology_procedure_id ON public.dermatology_procedure_invoices(dermatology_procedure_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_patient_id ON public.dermatology_procedure_invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_doctor_id ON public.dermatology_procedure_invoices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_generated_at ON public.dermatology_procedure_invoices(generated_at);
CREATE INDEX IF NOT EXISTS idx_dermatology_procedure_invoices_payment_method ON public.dermatology_procedure_invoices(payment_method);
