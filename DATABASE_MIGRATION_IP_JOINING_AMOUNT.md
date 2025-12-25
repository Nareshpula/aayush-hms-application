# Database Migration Required: IP Joining Amount

## Overview
A new column `ip_joining_amount` has been added to the `discharge_bills` table to store the payment amount collected at IP admission registration.

## Migration SQL

Run the following SQL in your Supabase SQL Editor:

```sql
/*
  # Add IP Joining Amount to Discharge Bills

  ## Changes
  - Add `ip_joining_amount` column to `discharge_bills` table to store the payment amount collected at IP admission registration

  ## Details
  - Column: `ip_joining_amount` (numeric, default 0)
  - This field captures the registration payment that was collected when the patient was admitted as IP
  - Read-only field in UI that auto-populates from the selected registration's payment_amount
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discharge_bills' AND column_name = 'ip_joining_amount'
  ) THEN
    ALTER TABLE discharge_bills ADD COLUMN ip_joining_amount numeric DEFAULT 0;
  END IF;
END $$;
```

## What This Migration Does

1. Adds a new column `ip_joining_amount` to the `discharge_bills` table
2. Sets default value to 0 for any existing records
3. Uses a safe check to prevent errors if the column already exists

## UI Changes

The Discharge Entry modal now includes:
- A new read-only field "IP Joining Amount (₹)"
- This field automatically populates with the registration's payment_amount when a patient is selected
- The value is stored in the database when the discharge record is saved

## No Logic Changes

This update only adds a new field for tracking purposes. No existing calculations or business logic has been modified.
