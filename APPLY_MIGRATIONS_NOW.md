# 🚨 URGENT: Apply These 3 Migrations to Fix Patient Registration

Your patient registration is currently broken. Apply these migrations IN ORDER to fix it.

---

## Quick Links

**Supabase SQL Editor:** https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

---

## Apply These 3 Migrations in Order

### ✅ Migration 1: Enable App Access
**File:** `supabase/migrations/20250914190000_allow_anon_access.sql`

What it does:
- Updates RLS policies to allow your app to access the database
- Inserts 2 sample doctors automatically

---

### ✅ Migration 2: Add Payment Columns (FIXES THE CURRENT ERROR!)
**File:** `supabase/migrations/20250914191500_add_payment_columns.sql`

What it does:
- ✅ Adds `payment_method` column to registrations table
- ✅ Adds `payment_amount` column to registrations table
- ✅ Creates indexes for faster queries
- ✅ Fixes error: "column payment_method does not exist"

**Expected output after running:**
```
✅ Payment columns verified: Both payment_method and payment_amount exist
```

---

### ✅ Migration 3: Create Registration Function
**File:** `supabase/migrations/20250914191000_create_rpc_function.sql`

What it does:
- ✅ Creates the `create_complete_registration` RPC function
- ✅ Enables full patient registration functionality
- ✅ Fixes error: "Could not find the function create_complete_registration"

**Expected output after running:**
```
Success. No rows returned
```

---

## How to Apply

1. Open each migration file (in order)
2. Copy ALL its contents
3. Go to Supabase SQL Editor (link above)
4. Paste the SQL
5. Click "Run"
6. Wait for success message
7. Move to next migration

---

## After All Migrations

Your patient registration will work perfectly! You'll be able to:

✅ Register new patients
✅ Track payment methods (Cash/UPI)
✅ Record payment amounts
✅ Create IP admissions with guardian info
✅ Create OP appointments with symptoms
✅ Auto-generate patient IDs (AAYUSH-000001, etc.)

---

## Order Matters!

Apply migrations in this exact order:
1. 20250914190000_allow_anon_access.sql
2. 20250914191500_add_payment_columns.sql ⚠️ THIS FIXES YOUR CURRENT ERROR
3. 20250914191000_create_rpc_function.sql

**Don't skip any migrations!**
