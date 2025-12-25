/*
  # Create Registration Cancellation & Refund System

  1. New Tables
    - `registration_refunds`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, references registrations)
      - `patient_id` (uuid, references patients)
      - `invoice_no` (text)
      - `paid_amount` (numeric)
      - `refund_amount` (numeric)
      - `refund_method` (text - Cash/UPI)
      - `reason` (text)
      - `refunded_at` (timestamptz)
      - `refunded_by` (text)
      - `created_at` (timestamptz)

  2. Schema Changes
    - Add cancellation columns to `registrations` table:
      - `cancel_reason` (text)
      - `cancelled_at` (timestamptz)
      - `cancelled_by` (text)
      - `refund_amount` (numeric)
    - Update status constraint to include 'ACTIVE' and 'CANCELLED'

  3. Security
    - Enable RLS on `registration_refunds` table
    - Add policies for authenticated access
*/

-- Add cancellation columns to registrations table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'cancel_reason'
  ) THEN
    ALTER TABLE registrations
    ADD COLUMN cancel_reason TEXT,
    ADD COLUMN cancelled_at TIMESTAMPTZ,
    ADD COLUMN cancelled_by TEXT,
    ADD COLUMN refund_amount NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- Drop old status constraint and add new one with ACTIVE and CANCELLED
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check
  CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show', 'ACTIVE', 'CANCELLED'));

-- Update existing records: map old statuses to new ones
UPDATE registrations
SET status = CASE
  WHEN status = 'Scheduled' THEN 'ACTIVE'
  WHEN status = 'Completed' THEN 'ACTIVE'
  WHEN status = 'No Show' THEN 'ACTIVE'
  WHEN status = 'Cancelled' THEN 'CANCELLED'
  ELSE 'ACTIVE'
END
WHERE status IN ('Scheduled', 'Completed', 'No Show', 'Cancelled') OR status IS NULL;

-- Create registration_refunds table
CREATE TABLE IF NOT EXISTS public.registration_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  invoice_no TEXT,
  paid_amount NUMERIC(10,2) NOT NULL CHECK (paid_amount >= 0),
  refund_amount NUMERIC(10,2) NOT NULL CHECK (refund_amount >= 0),
  refund_method TEXT NOT NULL CHECK (refund_method IN ('Cash', 'UPI')),
  reason TEXT NOT NULL,
  refunded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  refunded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_registration_refunds_registration_id ON public.registration_refunds(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_refunds_patient_id ON public.registration_refunds(patient_id);
CREATE INDEX IF NOT EXISTS idx_registration_refunds_refunded_at ON public.registration_refunds(refunded_at);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_cancelled_at ON public.registrations(cancelled_at);

-- Enable RLS
ALTER TABLE public.registration_refunds ENABLE ROW LEVEL SECURITY;

-- Create policies for registration_refunds
CREATE POLICY "Allow anonymous read access to registration_refunds"
  ON public.registration_refunds
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to registration_refunds"
  ON public.registration_refunds
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to registration_refunds"
  ON public.registration_refunds
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access to registration_refunds"
  ON public.registration_refunds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
