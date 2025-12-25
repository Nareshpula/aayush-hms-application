# Discharge Bill Number Format Update

## Overview
This migration updates the discharge bill number generation to use department-specific formats:
- **Pediatrics**: `IP-P-{YEAR}-{SEQUENCE}`
- **Dermatology**: `IP-D-{YEAR}-{SEQUENCE}`

## Important Notes
- Existing bill numbers remain unchanged
- New records will use the new format
- Sequence numbers increment independently per department per year
- The sequence automatically resets for each new year within each department

## SQL Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Drop the old sequence
DROP SEQUENCE IF EXISTS discharge_bill_seq CASCADE;

-- Drop the old function
DROP FUNCTION IF EXISTS generate_discharge_bill_number();

-- Create new function that generates department-specific bill numbers
CREATE OR REPLACE FUNCTION generate_discharge_bill_number(p_section text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number integer;
  bill_number text;
  current_year text;
  dept_prefix text;
BEGIN
  -- Get current year
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Determine department prefix
  IF p_section = 'Pediatrics' THEN
    dept_prefix := 'IP-P';
  ELSIF p_section = 'Dermatology' THEN
    dept_prefix := 'IP-D';
  ELSE
    RAISE EXCEPTION 'Invalid section: %. Must be Pediatrics or Dermatology', p_section;
  END IF;

  -- Get the next sequence number for this department and year
  -- This query finds the highest existing number for this department and year, then adds 1
  SELECT COALESCE(MAX(
    CAST(
      SPLIT_PART(bill_no, '-', 4) AS INTEGER
    )
  ), 0) + 1
  INTO new_number
  FROM discharge_bills
  WHERE section = p_section
    AND bill_no LIKE dept_prefix || '-' || current_year || '-%';

  -- If no records found, start with 1
  IF new_number IS NULL THEN
    new_number := 1;
  END IF;

  -- Generate the bill number
  bill_number := dept_prefix || '-' || current_year || '-' || new_number::text;

  RETURN bill_number;
END;
$$;
```

## How to Apply

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the SQL migration above
4. Click "Run" to execute the migration

## Testing

After applying the migration, test by:
1. Creating a new discharge entry in Pediatrics - should get `IP-P-2025-1`
2. Creating a new discharge entry in Dermatology - should get `IP-D-2025-1`
3. Creating another Pediatrics entry - should get `IP-P-2025-2`

## Examples

- First Pediatrics discharge in 2025: `IP-P-2025-1`
- Second Pediatrics discharge in 2025: `IP-P-2025-2`
- First Dermatology discharge in 2025: `IP-D-2025-1`
- First Pediatrics discharge in 2026: `IP-P-2026-1` (sequence resets for new year)
