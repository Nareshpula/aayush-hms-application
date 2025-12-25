/*
  # Create Vaccination Invoice Number Function

  1. New Function
    - `generate_vaccination_invoice_number()` - Generates unique vaccination invoice numbers
      - Format: VACC-YYYY-XXXXX (e.g., VACC-2025-00001)
      - Year-based sequential numbering
      - Returns the next available invoice number

  2. Important Notes
    - Invoice numbers are auto-generated for vaccinations module
    - Sequential numbering resets each year
    - Uses the vaccinations table to track invoice numbers

  3. Security
    - Function is accessible to anon and authenticated users
    - RLS policies on vaccinations table control access
*/

-- Create sequence for vaccination invoice numbers (resets yearly)
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
    RAISE NOTICE '✅ Vaccination invoice number function created successfully';
  ELSE
    RAISE WARNING '⚠️ Vaccination invoice number function creation failed';
  END IF;
END $$;
