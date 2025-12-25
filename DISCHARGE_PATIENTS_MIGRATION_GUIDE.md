# Discharge Patients Module - Database Migration Guide

## Migration Files Created

1. **20250923000000_create_discharge_bills_system.sql** (Already exists)
   - Creates `discharge_bills` table
   - Creates `discharge_bill_items` table
   - Sets up bill number generation sequence
   - Adds RLS policies

2. **20250925000000_enhance_discharge_patients_module.sql** (New)
   - Adds `payment_method`, `notes`, and `department` columns
   - Creates performance indexes
   - Adds duplicate prevention trigger
   - Creates `discharge_patients_view` for easy querying
   - Adds authenticated user policies

## How to Run Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the content of `20250923000000_create_discharge_bills_system.sql`
5. Paste and click **Run**
6. Create another new query
7. Copy the content of `20250925000000_enhance_discharge_patients_module.sql`
8. Paste and click **Run**

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual Execution

Copy and paste each SQL file content directly into your database client.

## Verification

After running the migrations, verify with:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('discharge_bills', 'discharge_bill_items');

-- Check if view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'discharge_patients_view';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'discharge_bills' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'discharge_bills';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_discharge_bill_number', 'check_duplicate_discharge', 'trigger_discharge_bills_updated_at');
```

## Database Schema Overview

### discharge_bills Table
- `id` (uuid) - Primary key
- `bill_no` (text) - Unique bill number (DBILL-YYYY-XXXXX)
- `section` (text) - 'Pediatrics' or 'Dermatology'
- `patient_id` (uuid) - Foreign key to patients
- `registration_id` (uuid) - Foreign key to registrations
- `doctor_id` (uuid) - Foreign key to doctors
- `admission_date` (date)
- `discharge_date` (date)
- `total_amount` (decimal)
- `paid_amount` (decimal)
- `outstanding_amount` (decimal)
- `refundable_amount` (decimal)
- `payment_method` (text) - 'Cash' or 'UPI'
- `status` (text) - 'draft' or 'finalized'
- `notes` (text)
- `department` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `created_by` (text)

### discharge_bill_items Table
- `id` (uuid) - Primary key
- `discharge_bill_id` (uuid) - Foreign key to discharge_bills
- `category` (text)
- `description` (text)
- `quantity` (integer)
- `rate` (decimal)
- `amount` (decimal)
- `reference_id` (uuid) - Optional reference to source record
- `reference_type` (text) - Type of reference ('injection', 'vaccination', etc.)

### discharge_patients_view
A convenient view that joins discharge_bills with patients, doctors, and registrations tables for easy querying.

## Features Enabled

✅ Duplicate discharge prevention
✅ Automatic bill number generation
✅ Updated timestamp tracking
✅ Row Level Security (RLS) policies
✅ Performance indexes for fast queries
✅ IST timezone support
✅ Authenticated and anonymous access

## Troubleshooting

### Issue: Policy already exists
If you see "policy already exists" errors, the migration will skip creating duplicate policies. This is safe to ignore.

### Issue: Column already exists
The migration uses `IF NOT EXISTS` checks, so it's safe to run multiple times.

### Issue: Permission denied
Make sure you're running the SQL as a superuser or the database owner.

## Next Steps

After running the migrations:

1. ✅ Tables and views are created
2. ✅ Navigate to `/discharge-patients` in the HMS application
3. ✅ Start managing discharge records for Pediatrics and Dermatology departments
4. ✅ Use search, filters, and export features

## Support

If you encounter any issues:
1. Check Supabase logs for detailed error messages
2. Verify all referenced tables exist (patients, doctors, registrations)
3. Ensure proper database permissions
4. Review the migration file contents for any custom modifications needed
