/*
  # Add Payment Columns to Registrations Table

  1. Changes
    - Add `payment_method` column (text) - Stores payment type: 'Cash' or 'UPI'
    - Add `payment_amount` column (numeric) - Stores payment amount with 2 decimal places

  2. Safety
    - Uses IF NOT EXISTS pattern via DO blocks to check if columns exist
    - Only adds columns if they are missing
    - Does not modify or delete existing data
    - Idempotent - safe to run multiple times

  3. Constraints
    - payment_method: Must be either 'Cash' or 'UPI' (or NULL)
    - payment_amount: Must be non-negative (or NULL)
*/

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'registrations'
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.registrations
    ADD COLUMN payment_method text CHECK (payment_method IN ('Cash', 'UPI'));
    
    RAISE NOTICE 'Added payment_method column to registrations table';
  ELSE
    RAISE NOTICE 'payment_method column already exists in registrations table';
  END IF;
END $$;

-- Add payment_amount column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'registrations'
    AND column_name = 'payment_amount'
  ) THEN
    ALTER TABLE public.registrations
    ADD COLUMN payment_amount numeric(10,2) CHECK (payment_amount >= 0);
    
    RAISE NOTICE 'Added payment_amount column to registrations table';
  ELSE
    RAISE NOTICE 'payment_amount column already exists in registrations table';
  END IF;
END $$;

-- Create index on payment_method for faster queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_registrations_payment_method 
ON public.registrations(payment_method);

-- Create index on payment_amount for faster queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_registrations_payment_amount 
ON public.registrations(payment_amount);

-- Verify the columns were added
DO $$
DECLARE
  has_payment_method boolean;
  has_payment_amount boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'registrations'
    AND column_name = 'payment_method'
  ) INTO has_payment_method;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'registrations'
    AND column_name = 'payment_amount'
  ) INTO has_payment_amount;

  IF has_payment_method AND has_payment_amount THEN
    RAISE NOTICE '✅ Payment columns verified: Both payment_method and payment_amount exist';
  ELSE
    RAISE WARNING '⚠️ Payment columns verification failed';
  END IF;
END $$;
