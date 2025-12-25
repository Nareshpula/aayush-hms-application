/*
  # Create Vaccination Invoices Table

  1. New Tables
    - `vaccination_invoices`
      - `id` (uuid, primary key)
      - `invoice_no` (text, unique) - Invoice number
      - `vaccination_id` (uuid) - Links to vaccinations table
      - `patient_id` (uuid) - Links to patients
      - `doctor_id` (uuid) - Links to doctors
      - `vaccination_details` (text) - Details of vaccination
      - `payment_method` (text) - Cash or UPI
      - `payment_amount` (numeric) - Amount paid
      - `admission_type` (text) - IP or OP
      - `generated_at` (timestamptz) - When invoice was generated
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on `vaccination_invoices` table
    - Add policies for anon and authenticated users

  3. Indexes
    - Create indexes for performance
    - Create index on invoice_no for fast lookups
*/

-- Create vaccination_invoices table
CREATE TABLE IF NOT EXISTS public.vaccination_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL,
  vaccination_id uuid REFERENCES public.vaccinations(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  vaccination_details text,
  payment_method text CHECK (payment_method IN ('Cash', 'UPI')),
  payment_amount numeric(10,2) CHECK (payment_amount >= 0),
  admission_type text CHECK (admission_type IN ('IP', 'OP')),
  generated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vaccination_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for anon users
CREATE POLICY "Allow anonymous read access to vaccination_invoices"
  ON public.vaccination_invoices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to vaccination_invoices"
  ON public.vaccination_invoices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to vaccination_invoices"
  ON public.vaccination_invoices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to vaccination_invoices"
  ON public.vaccination_invoices FOR DELETE
  TO anon
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access to vaccination_invoices"
  ON public.vaccination_invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access to vaccination_invoices"
  ON public.vaccination_invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to vaccination_invoices"
  ON public.vaccination_invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access to vaccination_invoices"
  ON public.vaccination_invoices FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_invoice_no ON public.vaccination_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_vaccination_id ON public.vaccination_invoices(vaccination_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_patient_id ON public.vaccination_invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_doctor_id ON public.vaccination_invoices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_generated_at ON public.vaccination_invoices(generated_at);
CREATE INDEX IF NOT EXISTS idx_vaccination_invoices_payment_method ON public.vaccination_invoices(payment_method);
