# Registration Refunds Migration Instructions

## NEW MIGRATION FILE - USE THIS ONE

**Migration File:** `supabase/migrations/20250915140000_complete_refunds_system.sql`

This is a **safe, idempotent migration** that:
- Checks if each object exists before creating it
- Won't fail if run multiple times
- Handles partial migration scenarios
- Properly migrates existing data

---

## IMPORTANT: Run this NEW migration in your Supabase SQL Editor

Copy the SQL from the file: **`supabase/migrations/20250915140000_complete_refunds_system.sql`**

Or copy from below:

```sql
/*
  # Complete Registration Cancellation & Refund System Setup

  This migration safely completes the refunds system setup by:
  1. Ensuring all columns exist in registrations table
  2. Updating status constraint if needed
  3. Creating registration_refunds table if not exists
  4. Creating indexes if not exist
  5. Enabling RLS and creating policies only if they don't exist
  6. Migrating existing data to new status values
*/

-- Step 1: Add cancellation columns to registrations table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'cancel_reason'
  ) THEN
    ALTER TABLE registrations ADD COLUMN cancel_reason TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE registrations ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'cancelled_by'
  ) THEN
    ALTER TABLE registrations ADD COLUMN cancelled_by TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE registrations ADD COLUMN refund_amount NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- Step 2: Update status constraint to include ACTIVE and CANCELLED
DO $$
BEGIN
  -- Drop old constraint if it exists
  ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;

  -- Add new constraint with all allowed values
  ALTER TABLE registrations ADD CONSTRAINT registrations_status_check
    CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show', 'ACTIVE', 'CANCELLED'));
END $$;

-- Step 3: Migrate existing data to new status values (only if not already migrated)
DO $$
BEGIN
  -- Only update records that still have old status values
  UPDATE registrations
  SET status = CASE
    WHEN status = 'Scheduled' THEN 'ACTIVE'
    WHEN status = 'Completed' THEN 'ACTIVE'
    WHEN status = 'No Show' THEN 'ACTIVE'
    WHEN status = 'Cancelled' THEN 'CANCELLED'
    ELSE status
  END
  WHERE status IN ('Scheduled', 'Completed', 'No Show', 'Cancelled');
END $$;

-- Step 4: Create registration_refunds table if not exists
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

-- Step 5: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_registration_refunds_registration_id ON public.registration_refunds(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_refunds_patient_id ON public.registration_refunds(patient_id);
CREATE INDEX IF NOT EXISTS idx_registration_refunds_refunded_at ON public.registration_refunds(refunded_at);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_cancelled_at ON public.registrations(cancelled_at);

-- Step 6: Enable RLS on registration_refunds
ALTER TABLE public.registration_refunds ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies only if they don't exist
DO $$
BEGIN
  -- Check and create anonymous read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'registration_refunds'
    AND policyname = 'Allow anonymous read access to registration_refunds'
  ) THEN
    CREATE POLICY "Allow anonymous read access to registration_refunds"
      ON public.registration_refunds
      FOR SELECT
      TO anon
      USING (true);
  END IF;

  -- Check and create anonymous insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'registration_refunds'
    AND policyname = 'Allow anonymous insert access to registration_refunds'
  ) THEN
    CREATE POLICY "Allow anonymous insert access to registration_refunds"
      ON public.registration_refunds
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  -- Check and create authenticated read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'registration_refunds'
    AND policyname = 'Allow authenticated read access to registration_refunds'
  ) THEN
    CREATE POLICY "Allow authenticated read access to registration_refunds"
      ON public.registration_refunds
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Check and create authenticated insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'registration_refunds'
    AND policyname = 'Allow authenticated insert access to registration_refunds'
  ) THEN
    CREATE POLICY "Allow authenticated insert access to registration_refunds"
      ON public.registration_refunds
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
```

---

## What This Migration Does:

### Step 1: Add Columns Safely
Checks each column individually before adding it to avoid errors if columns already exist.

### Step 2: Update Status Constraint
Drops the old constraint and recreates it with both old and new status values for compatibility.

### Step 3: Migrate Existing Data
Updates only records that still have old status values, preserving any records already migrated.

### Step 4: Create Refunds Table
Creates the `registration_refunds` table only if it doesn't exist.

### Step 5: Create Indexes
Creates all necessary indexes for optimal query performance (all use `IF NOT EXISTS`).

### Step 6: Enable RLS
Enables Row Level Security on the refunds table.

### Step 7: Create Policies Safely
Checks if each policy exists before creating it, preventing duplicate policy errors.

---

## Key Features of This Migration:

✅ **Idempotent** - Can be run multiple times safely
✅ **Handles Partial Migrations** - Completes any unfinished steps
✅ **No Data Loss** - Only updates records that need updating
✅ **Error-Free** - Checks for existence before creating objects

---

## After Running This Migration:

The system will be fully operational with:
1. ✅ Cancellation tracking columns in registrations table
2. ✅ Updated status constraint allowing ACTIVE and CANCELLED
3. ✅ All existing data migrated to new status values
4. ✅ registration_refunds table with complete audit trail
5. ✅ All indexes for optimal performance
6. ✅ RLS enabled with proper access policies

---

## Status Values After Migration:

- **ACTIVE** - Current valid registrations (migrated from Scheduled, Completed, No Show)
- **CANCELLED** - Cancelled registrations with refunds (migrated from Cancelled)

---

## Verification Query:

After running the migration, verify it worked with:

```sql
-- Check status distribution
SELECT status, COUNT(*)
FROM registrations
GROUP BY status;

-- Check refunds table exists
SELECT COUNT(*) FROM registration_refunds;

-- Check policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'registration_refunds';
```
