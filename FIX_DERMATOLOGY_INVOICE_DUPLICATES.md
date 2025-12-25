# Fix Dermatology Invoice Number Duplicates

## Problem Identified

The dermatology invoice generation is failing with duplicate key errors because the invoice number generation function is reading from the **wrong table**.

### Current (Broken) Behavior:
- `generate_dermatology_procedure_invoice_number()` reads from `dermatology_procedures` table
- **BUT** invoices are saved to `dermatology_procedure_invoices` table
- This causes the function to return duplicate invoice numbers

### How Injection Module Works (Correctly):
- `generate_injection_invoice_number()` reads from `injection_invoices` table
- When an invoice is saved, it goes to `injection_invoices` table
- Next call to function sees the saved invoice and increments properly
- **No duplicates occur**

## Solution

Update the function to read from `dermatology_procedure_invoices` table instead of `dermatology_procedures` table.

## SQL Fix to Apply

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix Dermatology Procedure Invoice Number Generation
-- This makes it match the working Injection module pattern

-- Drop existing dermatology procedure invoice function
DROP FUNCTION IF EXISTS generate_dermatology_procedure_invoice_number();

-- Create new dermatology procedure invoice function (reads from dermatology_procedure_invoices table)
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

  -- Get the maximum invoice number for current year from dermatology_procedure_invoices table
  -- Extract the numeric part (after "DERM-YYYY-") and add 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.dermatology_procedure_invoices
  WHERE invoice_no LIKE 'DERM-' || current_year || '-%';

  -- Format: DERM-YYYY-00001
  invoice_number := 'DERM-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;
```

## How to Apply

### Option 1: Supabase Dashboard SQL Editor
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a **New Query**
4. Copy and paste the entire SQL above
5. Click **Run**
6. Verify function is updated successfully

### Option 2: Via psql or Database Client
```bash
psql -h db.gatgyhxtgqmzwjatbmzk.supabase.co -U postgres -d postgres -f fix_dermatology.sql
```

## Verification

After applying, test with these queries:

```sql
-- Test dermatology procedure invoice number generation
SELECT generate_dermatology_procedure_invoice_number();
-- Should return: DERM-2025-00001 (or next available number)

-- Check existing dermatology procedure invoices
SELECT invoice_no, generated_at
FROM dermatology_procedure_invoices
ORDER BY generated_at DESC
LIMIT 5;

-- Check for duplicates (should return 0 rows)
SELECT invoice_no, COUNT(*)
FROM dermatology_procedure_invoices
GROUP BY invoice_no
HAVING COUNT(*) > 1;
```

## Expected Behavior After Fix

### Before Fix:
1. User previews invoice → Function returns DERM-2025-00001
2. User saves invoice → Invoice saved with DERM-2025-00001
3. Another user previews → Function STILL returns DERM-2025-00001 (reads from wrong table!)
4. User saves → **ERROR: Duplicate key violation** ❌

### After Fix:
1. User previews invoice → Function returns DERM-2025-00001
2. User saves invoice → Invoice saved with DERM-2025-00001
3. Another user previews → Function returns DERM-2025-00002 (reads from dermatology_procedure_invoices!)
4. User saves → Success! ✅

## Technical Details

### Table Structures:
- **dermatology_procedure_invoices**: Stores all dermatology procedure invoices with unique invoice_no
- **dermatology_procedures**: Stores dermatology procedure records (references invoice optionally)

### Invoice Number Format:
- Dermatology: `DERM-YYYY-00001` (11 chars before number)

### SUBSTRING Extraction:
- `SUBSTRING(invoice_no FROM 11)` for DERM (starts at position 11)

## What This Fix Does

✅ Fixes duplicate invoice number errors
✅ Makes dermatology invoices work like injection invoices
✅ Ensures proper auto-increment from saved invoices
✅ Maintains invoice number format consistency
✅ Prevents any data loss or corruption

## What This Fix Does NOT Change

❌ Does not modify any existing invoice records
❌ Does not change UI or page functionality
❌ Does not affect other modules (Injections, Vaccinations, etc.)
❌ Does not modify database table structures
❌ Does not change invoice number format

## Post-Fix Testing

1. **Test Dermatology Procedure Invoice:**
   - Go to Dermatology page
   - Select a patient
   - Preview invoice (note the invoice number)
   - Save the invoice
   - Preview another invoice
   - Verify the number incremented by 1
   - Save successfully without errors

2. **Verify No Duplicates:**
   ```sql
   -- Should return 0 duplicates
   SELECT invoice_no, COUNT(*)
   FROM dermatology_procedure_invoices
   GROUP BY invoice_no
   HAVING COUNT(*) > 1;
   ```

## Summary

This fix resolves the root cause of duplicate invoice number errors by ensuring the invoice generation function reads from the correct table where invoices are actually stored. The fix aligns dermatology procedure invoice generation with the proven working pattern used by the injection module.

**Action Required:**
1. Apply the SQL fix via Supabase Dashboard SQL Editor
2. Test dermatology procedure invoice generation
3. Verify no duplicate errors occur

This is a **database-only fix** - no application code changes are needed.
