/*
  # Create Discharge Bills System

  1. New Tables
    - `discharge_bills`
      - `id` (uuid, primary key)
      - `bill_no` (text, unique) - Format: DBILL-YYYY-XXXXX
      - `section` (text) - 'Pediatrics' or 'Dermatology'
      - `patient_id` (uuid, foreign key to patients)
      - `registration_id` (uuid, foreign key to registrations)
      - `doctor_id` (uuid, foreign key to doctors)
      - `admission_date` (date)
      - `discharge_date` (date)
      - `total_amount` (decimal)
      - `paid_amount` (decimal)
      - `outstanding_amount` (decimal)
      - `refundable_amount` (decimal)
      - `status` (text) - 'draft', 'finalized'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (text)

    - `discharge_bill_items`
      - `id` (uuid, primary key)
      - `discharge_bill_id` (uuid, foreign key)
      - `category` (text) - Room, Consultation, Procedures, Injections, etc.
      - `description` (text)
      - `quantity` (integer)
      - `rate` (decimal)
      - `amount` (decimal)
      - `reference_id` (uuid) - nullable, links to source record
      - `reference_type` (text) - nullable, 'injection', 'vaccination', etc.

  2. Sequences
    - discharge_bill_seq - For bill number generation

  3. Functions
    - generate_discharge_bill_number() - Generate sequential bill numbers

  4. Security
    - Enable RLS on both tables
    - Add policies for anonymous access
*/

-- Create discharge_bills table
CREATE TABLE IF NOT EXISTS discharge_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_no text UNIQUE NOT NULL,
  section text NOT NULL CHECK (section IN ('Pediatrics', 'Dermatology')),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES registrations(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  admission_date date NOT NULL,
  discharge_date date NOT NULL,
  total_amount decimal(10,2) DEFAULT 0,
  paid_amount decimal(10,2) DEFAULT 0,
  outstanding_amount decimal(10,2) DEFAULT 0,
  refundable_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Create discharge_bill_items table
CREATE TABLE IF NOT EXISTS discharge_bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discharge_bill_id uuid REFERENCES discharge_bills(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  rate decimal(10,2) DEFAULT 0,
  amount decimal(10,2) DEFAULT 0,
  reference_id uuid,
  reference_type text
);

-- Create sequence for discharge bill numbers
CREATE SEQUENCE IF NOT EXISTS discharge_bill_seq START WITH 1;

-- Function to generate discharge bill number
CREATE OR REPLACE FUNCTION generate_discharge_bill_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number integer;
  bill_number text;
  current_year text;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  new_number := nextval('discharge_bill_seq');
  bill_number := 'DBILL-' || current_year || '-' || LPAD(new_number::text, 5, '0');
  RETURN bill_number;
END;
$$;

-- Enable RLS
ALTER TABLE discharge_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharge_bill_items ENABLE ROW LEVEL SECURITY;

-- Policies for discharge_bills
CREATE POLICY "Allow anonymous read access to discharge_bills"
  ON discharge_bills FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to discharge_bills"
  ON discharge_bills FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to discharge_bills"
  ON discharge_bills FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to discharge_bills"
  ON discharge_bills FOR DELETE
  TO anon
  USING (true);

-- Policies for discharge_bill_items
CREATE POLICY "Allow anonymous read access to discharge_bill_items"
  ON discharge_bill_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to discharge_bill_items"
  ON discharge_bill_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to discharge_bill_items"
  ON discharge_bill_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to discharge_bill_items"
  ON discharge_bill_items FOR DELETE
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discharge_bills_patient_id ON discharge_bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_registration_id ON discharge_bills(registration_id);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_bill_no ON discharge_bills(bill_no);
CREATE INDEX IF NOT EXISTS idx_discharge_bill_items_discharge_bill_id ON discharge_bill_items(discharge_bill_id);
