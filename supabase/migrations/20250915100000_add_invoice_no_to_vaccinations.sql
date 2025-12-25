/*
  # Add Invoice Number to Vaccinations Table

  1. Changes
    - Add `invoice_no` column to vaccinations table
    - Column is optional (nullable) for backward compatibility
    - Will be populated when invoice is saved/printed

  2. Important Notes
    - Existing records will have NULL invoice_no
    - New records will get invoice_no when saved through invoice preview
    - This matches the pattern used in injection_invoices table
*/

-- Add invoice_no column to vaccinations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaccinations' AND column_name = 'invoice_no'
  ) THEN
    ALTER TABLE public.vaccinations ADD COLUMN invoice_no text;
    RAISE NOTICE '✅ Added invoice_no column to vaccinations table';
  ELSE
    RAISE NOTICE '✓ invoice_no column already exists';
  END IF;
END $$;

-- Create index for invoice_no for fast lookups
CREATE INDEX IF NOT EXISTS idx_vaccinations_invoice_no ON public.vaccinations(invoice_no);
