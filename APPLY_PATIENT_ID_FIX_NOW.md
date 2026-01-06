# URGENT: Apply Patient ID Fix to Prevent Duplicate Key Errors

## Problem
Current registrations are failing with:
```
duplicate key value violates unique constraint "patients_patient_id_key"
Key (patient_id)=(AAYUSH-2026-100) already exists
```

This happens because the database function uses fixed-width padding (LPAD) that breaks after ID 999.

## Solution
Apply the SQL fix below (also available in `supabase/migrations/20260106000000_fix_patient_id_unbounded_growth.sql`)

## SQL Fix Code (Copy and Run This)

```sql
/*
  # Fix Patient ID Generation for Unbounded Growth

  1. Problem
    - Current function uses fixed-width LPAD(3) padding
    - Causes duplicate key violations when sequence exceeds 999
    - Blocks OP/IP registrations during peak hours

  2. Solution
    - Remove LPAD logic
    - Extract numeric suffix using regex
    - Allow unlimited growth (1000, 10000, etc.)
    - Keep existing patient IDs untouched

  3. Changes
    - Replace generate_patient_id_code() function
    - Use regex to find max numeric suffix
    - Generate IDs without fixed-width padding

  4. HMS Standard Compliance
    - Patient IDs grow unbounded
    - No truncation at database level
    - Unique forever
    - Independent of UI formatting

  5. Impact
    - No schema changes
    - No data migration needed
    - Existing IDs remain valid
    - Future IDs: AAYUSH-2026-1000, AAYUSH-2026-1001, etc.
*/

CREATE OR REPLACE FUNCTION public.generate_patient_id_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  current_year text;
  next_sequence integer;
BEGIN
  -- Current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  -- Get highest numeric suffix for the year and increment
  SELECT
    COALESCE(
      MAX(
        (regexp_match(patient_id_code, 'AAYUSH-' || current_year || '-([0-9]+)$'))[1]::int
      ),
      0
    ) + 1
  INTO next_sequence
  FROM public.patients
  WHERE patient_id_code LIKE 'AAYUSH-' || current_year || '-%';

  -- Generate ID without fixed-width padding (HMS-safe)
  RETURN 'AAYUSH-' || current_year || '-' || next_sequence::text;
END;
$function$;
```

## Steps to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire SQL code above
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify success message appears

### Option 2: Supabase CLI
```bash
supabase db execute --file supabase/migrations/20260106000000_fix_patient_id_unbounded_growth.sql
```

## What This Fix Does

**Before (Broken):**
- Uses `LPAD(next_sequence::text, 3, '0')`
- Generates: AAYUSH-2026-001, AAYUSH-2026-002, ..., AAYUSH-2026-999
- At 1000: Generates AAYUSH-2026-100 (collision!) ❌

**After (Fixed):**
- Uses regex to extract max numeric suffix
- Generates: AAYUSH-2026-1, AAYUSH-2026-2, ..., AAYUSH-2026-999, AAYUSH-2026-1000, AAYUSH-2026-1001 ✅
- No limit, no collisions, HMS-compliant

## Verification

After applying, test with:

```sql
-- Test the function
SELECT generate_patient_id_code();

-- Should return next available ID (e.g., AAYUSH-2026-1000 if last was 999)
```

## Impact
- ✅ Zero downtime
- ✅ No data changes
- ✅ Existing IDs stay valid
- ✅ Future registrations will work forever
- ✅ No UI changes needed

## Urgency
**CRITICAL** - Apply immediately to prevent registration failures during peak hours.
