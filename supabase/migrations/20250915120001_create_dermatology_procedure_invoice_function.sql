/*
  # Create Dermatology Procedure Invoice Number Function

  1. Function
    - `generate_dermatology_procedure_invoice_number()` - Generates next invoice number
    - Reads MAX invoice number from dermatology_procedures table
    - Function peeks at next available number without consuming it
    - Matches vaccination invoice behavior exactly

  2. Behavior
    - If last saved invoice = DERM-2025-00002 → returns DERM-2025-00003
    - If no saved invoices → returns DERM-2025-00001
    - Can be called multiple times without consuming numbers
    - Number only "used" when dermatology procedure record is saved with that invoice_no

  3. Important Notes
    - Function is read-only (doesn't modify state)
    - Safe to call for preview multiple times
    - Invoice prefix: DERM-YYYY-XXXXX
*/

-- Create function that peeks at next available invoice number
CREATE OR REPLACE FUNCTION generate_dermatology_procedure_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year text;
  next_number int;
  invoice_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  -- Get the maximum invoice number for current year from saved dermatology procedures
  -- Extract the numeric part and add 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.dermatology_procedures
  WHERE invoice_no LIKE 'DERM-' || current_year || '-%'
    AND invoice_no IS NOT NULL;

  -- Format: DERM-YYYY-00001
  invoice_number := 'DERM-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;

-- Verify function was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'generate_dermatology_procedure_invoice_number'
  ) THEN
    RAISE NOTICE '✅ Dermatology procedure invoice function created successfully';
    RAISE NOTICE '   - Prefix: DERM-YYYY-XXXXX';
    RAISE NOTICE '   - Reads MAX from dermatology_procedures.invoice_no';
    RAISE NOTICE '   - Safe to call multiple times for preview';
    RAISE NOTICE '   - Number only consumed when procedure is saved';
  ELSE
    RAISE WARNING '⚠️ Function creation failed';
  END IF;
END $$;
