# 🚨 CRITICAL: Apply These Migrations to Fix Patient Registration

## Problems
Your patient registration is failing with these errors:

1. **Missing RPC function:**
```
PGRST202: Could not find the function public.create_complete_registration
```

2. **Missing payment columns:**
```
column "payment_method" of relation "registrations" does not exist
```

## Solution
Apply TWO migrations in order to fix both issues.

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
Visit: https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

---

### 2. FIRST MIGRATION - Add Payment Columns

Open this file in your project:
```
supabase/migrations/20250914191500_add_payment_columns.sql
```

Copy **ALL** of its contents and paste into the SQL editor.

Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter).

**Expected output:**
```
✅ Payment columns verified: Both payment_method and payment_amount exist
```

---

### 3. SECOND MIGRATION - Create RPC Function

Open this file in your project:
```
supabase/migrations/20250914191000_create_rpc_function.sql
```

Copy **ALL** of its contents (about 200 lines) and paste into the SQL editor.

Click the **"Run"** button again.

**Expected output:**
```
Success. No rows returned
```

---

### 4. Verify Success
Both migrations should complete without errors. Your patient registration will now work!

---

## What These Migrations Do

### Migration 1: Add Payment Columns
**File:** `20250914191500_add_payment_columns.sql`

✅ Adds `payment_method` column (text) - Stores 'Cash' or 'UPI'
✅ Adds `payment_amount` column (numeric) - Stores payment amount with 2 decimals
✅ Creates indexes for faster payment queries
✅ Validates column constraints (payment_method must be Cash/UPI, payment_amount must be non-negative)
✅ Safe to run multiple times (idempotent)

### Migration 2: Create RPC Function
**File:** `20250914191000_create_rpc_function.sql`

✅ Creates the `create_complete_registration` PostgreSQL function
✅ Accepts all patient and registration details from your UI
✅ Auto-generates patient IDs (AAYUSH-000001, AAYUSH-000002, etc.)
✅ Creates patient record
✅ Creates registration record with payment tracking
✅ Creates IP or OP admission record based on type
✅ Returns all created data in a single transaction

### Function Parameters:
- **Patient Data**: name, contact, age, gender, blood_group, address, email, date_of_birth
- **Registration Data**: doctor_id, registration_type, appointment_date
- **Payment Data**: payment_method (Cash/UPI), payment_amount
- **IP Data**: guardian_name, guardian_relationship, admission details, room_number
- **OP Data**: appointment_time, consultation_type, symptoms, referred_by

---

## After Applying These Migrations

Your patient registration will work immediately! The UI will be able to:

1. Register new patients
2. Track payment methods (Cash/UPI)
3. Record payment amounts
4. Create IP admissions with guardian info
5. Create OP appointments with symptoms
6. Auto-generate patient IDs

---

## Testing

After applying the migration, try registering a test patient in your app. It should work without any errors!

If you still see issues, check:
- Migration was applied successfully (no SQL errors)
- The function exists: Run `SELECT proname FROM pg_proc WHERE proname = 'create_complete_registration';`
- Should return: `create_complete_registration`

---

## Need Help?

The migration file is located at:
```
supabase/migrations/20250914191000_create_rpc_function.sql
```

This is a safe, incremental migration that:
- ✅ Only creates the missing function
- ✅ Does not modify existing tables
- ✅ Does not delete or change data
- ✅ Can be safely applied multiple times (idempotent)
