/*
  # Update Vaccination Invoice Function to Peek (Not Increment)

  1. Changes
    - Drop sequence-based approach
    - Update function to read MAX invoice number from vaccinations table
    - Function now peeks at next available number without consuming it
    - Matches injection invoice behavior exactly

  2. Behavior
    - If last saved invoice = VACC-2025-00002 → returns VACC-2025-00003
    - If no saved invoices → returns VACC-2025-00001
    - Can be called multiple times without consuming numbers
    - Number only "used" when vaccination record is saved with that invoice_no

  3. Important Notes
    - Removed sequence dependency
    - Function is now read-only (doesn't modify state)
    - Safe to call for preview multiple times
*/

-- Drop the sequence (no longer needed)
DROP SEQUENCE IF EXISTS vaccination_invoice_seq;

-- Drop existing function
DROP FUNCTION IF EXISTS generate_vaccination_invoice_number();

-- Create new function that peeks at next available number
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

  -- Get the maximum invoice number for current year from saved vaccinations
  -- Extract the numeric part and add 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.vaccinations
  WHERE invoice_no LIKE 'VACC-' || current_year || '-%'
    AND invoice_no IS NOT NULL;

  -- Format: VACC-YYYY-00001
  invoice_number := 'VACC-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;

-- Verify function was updated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'generate_vaccination_invoice_number'
  ) THEN
    RAISE NOTICE '✅ Vaccination invoice function updated to peek-based (non-incrementing)';
    RAISE NOTICE '   - Reads MAX from vaccinations.invoice_no';
    RAISE NOTICE '   - Safe to call multiple times for preview';
    RAISE NOTICE '   - Number only consumed when vaccination is saved';
  ELSE
    RAISE WARNING '⚠️ Function update failed';
  END IF;
END $$;
