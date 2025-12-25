/*
  # Fix Vaccination Invoice Number Sequence

  1. Changes
    - Drop existing function that uses COUNT
    - Create dedicated sequence for vaccination invoices
    - Update function to use sequence instead of counting records
    - Ensures first invoice is always VACC-YYYY-00001

  2. Important Notes
    - Sequence starts at 1
    - Independent of existing vaccination records
    - Guarantees proper sequential numbering
    - First call returns 1 (VACC-2025-00001)
    - Second call returns 2 (VACC-2025-00002)
    - And so on...

  3. Security
    - Function remains accessible to anon and authenticated users
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS generate_vaccination_invoice_number();

-- Create sequence for vaccination invoice numbers
CREATE SEQUENCE IF NOT EXISTS vaccination_invoice_seq START 1;

-- Create function to generate vaccination invoice number
CREATE OR REPLACE FUNCTION generate_vaccination_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year text;
  next_number int;
  invoice_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  -- Use sequence to generate next number
  -- This ensures it always starts from 1 and increments properly
  next_number := nextval('vaccination_invoice_seq');

  invoice_number := 'VACC-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;

-- Verify function was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'generate_vaccination_invoice_number'
  ) THEN
    RAISE NOTICE '✅ Vaccination invoice number function updated successfully';
  ELSE
    RAISE WARNING '⚠️ Vaccination invoice number function creation failed';
  END IF;
END $$;
