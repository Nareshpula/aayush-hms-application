# Fix Vaccination Invoice Number Duplicates

## Problem Identified

The vaccination invoice generation is failing with duplicate key errors because the invoice number generation functions are reading from the **wrong tables**.

### Current (Broken) Behavior:
- `generate_vaccination_invoice_number()` reads from `vaccinations` table
- `generate_newborn_vaccination_invoice_number()` reads from `newborn_vaccinations` table
- **BUT** invoices are saved to `vaccination_invoices` and `newborn_vaccination_invoices` tables
- This causes the functions to return duplicate invoice numbers

### How Injection Module Works (Correctly):
- `generate_injection_invoice_number()` reads from `injection_invoices` table
- When an invoice is saved, it goes to `injection_invoices` table
- Next call to function sees the saved invoice and increments properly
- **No duplicates occur**

## Solution

Update both functions to read from their respective **invoice tables** instead of vaccination tables.

## SQL Fix to Apply

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix Vaccination Invoice Number Generation
-- This makes it match the working Injection module pattern

-- Drop existing vaccination invoice function
DROP FUNCTION IF EXISTS generate_vaccination_invoice_number();

-- Create new vaccination invoice function (reads from vaccination_invoices table)
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

  -- Get the maximum invoice number for current year from vaccination_invoices table
  -- Extract the numeric part (after "VACC-YYYY-") and add 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.vaccination_invoices
  WHERE invoice_no LIKE 'VACC-' || current_year || '-%';

  -- Format: VACC-YYYY-00001
  invoice_number := 'VACC-' || current_year || '-' || LPAD(next_number::text, 5, '0');

  RETURN invoice_number;
END;
$$;

-- Drop existing newborn vaccination invoice function
DROP FUNCTION IF EXISTS generate_newborn_vaccination_invoice_number();

-- Create new newborn vaccination invoice function (reads from newborn_vaccination_invoices table)
CREATE OR REPLACE FUNCTION generate_newborn_vaccination_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  current_year text;
  next_number int;
  invoice_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  -- Get the maximum invoice number for current year from newborn_vaccination_invoices table
  -- Extract the numeric part (after "NBVACC-YYYY-") and add 1
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 13) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.newborn_vaccination_invoices
  WHERE invoice_no LIKE 'NBVACC-' || current_year || '-%';

  -- Format: NBVACC-YYYY-00001
  invoice_number := 'NBVACC-' || current_year || '-' || LPAD(next_number::text, 5, '0');

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
6. Verify both functions are updated successfully

### Option 2: Via psql or Database Client
```bash
psql -h db.gatgyhxtgqmzwjatbmzk.supabase.co -U postgres -d postgres -f fix.sql
```

## Verification

After applying, test with these queries:

```sql
-- Test vaccination invoice number generation
SELECT generate_vaccination_invoice_number();
-- Should return: VACC-2025-00001 (or next available number)

-- Test newborn vaccination invoice number generation
SELECT generate_newborn_vaccination_invoice_number();
-- Should return: NBVACC-2025-00001 (or next available number)

-- Check existing vaccination invoices
SELECT invoice_no, generated_at
FROM vaccination_invoices
ORDER BY generated_at DESC
LIMIT 5;

-- Check existing newborn vaccination invoices
SELECT invoice_no, generated_at
FROM newborn_vaccination_invoices
ORDER BY generated_at DESC
LIMIT 5;
```

## Expected Behavior After Fix

### Before Fix:
1. User previews invoice → Function returns VACC-2025-00001
2. User saves invoice → Invoice saved with VACC-2025-00001
3. Another user previews → Function STILL returns VACC-2025-00001 (reads from wrong table!)
4. User saves → **ERROR: Duplicate key violation** ❌

### After Fix:
1. User previews invoice → Function returns VACC-2025-00001
2. User saves invoice → Invoice saved with VACC-2025-00001
3. Another user previews → Function returns VACC-2025-00002 (reads from vaccination_invoices!)
4. User saves → Success! ✅

## Technical Details

### Table Structures:
- **vaccination_invoices**: Stores all vaccination invoices with unique invoice_no
- **newborn_vaccination_invoices**: Stores all newborn vaccination invoices with unique invoice_no
- **vaccinations**: Stores vaccination records (references invoice optionally)
- **newborn_vaccinations**: Stores newborn vaccination records (references invoice optionally)

### Invoice Number Formats:
- Vaccination: `VACC-YYYY-00001` (11 chars before number)
- Newborn Vaccination: `NBVACC-YYYY-00001` (13 chars before number)
- Injection: `INV-YYYY-00001` (10 chars before number)

### SUBSTRING Extraction:
- `SUBSTRING(invoice_no FROM 11)` for VACC (starts at position 11)
- `SUBSTRING(invoice_no FROM 13)` for NBVACC (starts at position 13)
- `SUBSTRING(invoice_no FROM 10)` for INV (starts at position 10)

## What This Fix Does

✅ Fixes duplicate invoice number errors
✅ Makes vaccination invoices work like injection invoices
✅ Ensures proper auto-increment from saved invoices
✅ Maintains invoice number format consistency
✅ Prevents any data loss or corruption

## What This Fix Does NOT Change

❌ Does not modify any existing invoice records
❌ Does not change UI or page functionality
❌ Does not affect other modules (Injections, Dermatology, etc.)
❌ Does not modify database table structures
❌ Does not change invoice number formats

## Migration File Reference

This fix should be saved as:
```
/supabase/migrations/20250926000000_fix_vaccination_invoice_number_generation.sql
```

## Post-Fix Testing

1. **Test Vaccination Invoice:**
   - Go to Vaccinations page
   - Select a patient
   - Preview invoice (note the invoice number)
   - Save the invoice
   - Preview another invoice
   - Verify the number incremented by 1

2. **Test Newborn Vaccination Invoice:**
   - Go to N/B Babies page
   - Select a patient
   - Preview invoice (note the invoice number)
   - Save the invoice
   - Preview another invoice
   - Verify the number incremented by 1

3. **Verify No Duplicates:**
   ```sql
   -- Should return 0 duplicates
   SELECT invoice_no, COUNT(*)
   FROM vaccination_invoices
   GROUP BY invoice_no
   HAVING COUNT(*) > 1;

   SELECT invoice_no, COUNT(*)
   FROM newborn_vaccination_invoices
   GROUP BY invoice_no
   HAVING COUNT(*) > 1;
   ```

## Rollback (If Needed)

If you need to revert to the old functions:

```sql
-- Revert to reading from vaccinations table (OLD BEHAVIOR - HAS BUGS)
DROP FUNCTION IF EXISTS generate_vaccination_invoice_number();
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
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.vaccinations  -- OLD: Reading from wrong table
  WHERE invoice_no LIKE 'VACC-' || current_year || '-%'
    AND invoice_no IS NOT NULL;
  invoice_number := 'VACC-' || current_year || '-' || LPAD(next_number::text, 5, '0');
  RETURN invoice_number;
END;
$$;
```

**Note:** Rollback is NOT recommended as it will reintroduce the duplicate key errors.

## Summary

This fix resolves the root cause of duplicate invoice number errors by ensuring invoice generation functions read from the correct tables where invoices are actually stored. The fix aligns vaccination and newborn vaccination invoice generation with the proven working pattern used by the injection module.
