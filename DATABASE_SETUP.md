# HMS Database Setup - Bolt-Managed Supabase

## ✅ Current Status

Your HMS application is **already connected** to a Bolt-managed Supabase database!

- **Database Provider**: Supabase (PostgreSQL)
- **Connection**: ✅ Active and working
- **Tables**: ✅ Created (doctors, patients, registrations, ip_admissions, op_admissions, reports)
- **Connection Details**: Already configured in `.env` file

---

## 🚀 Quick Start - Apply Required Migrations

Your database tables exist, but need two migrations to enable full functionality. Follow these simple steps:

### Step 1: Go to Supabase SQL Editor

Visit: https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

### Step 2: Apply RLS Policy Migration

Copy the entire contents of this file:
```
supabase/migrations/20250914190000_allow_anon_access.sql
```

Paste it into the SQL editor and click **"Run"**.

This migration will:
- ✅ Update RLS policies to allow your app to access the database
- ✅ Insert the 2 sample doctors automatically

### Step 3: Apply Payment Columns Migration (CRITICAL!)

Copy the entire contents of this file:
```
supabase/migrations/20250914191500_add_payment_columns.sql
```

Paste it into the SQL editor and click **"Run"**.

This migration will:
- ✅ Add `payment_method` and `payment_amount` columns to registrations table
- ✅ Create indexes for payment queries
- ✅ Validate column constraints

### Step 4: Apply RPC Function Migration (CRITICAL!)

Copy the entire contents of this file:
```
supabase/migrations/20250914191000_create_rpc_function.sql
```

Paste it into the SQL editor and click **"Run"**.

This migration will:
- ✅ Create the `create_complete_registration` RPC function
- ✅ Enable patient registration functionality in your app
- ✅ Grant necessary permissions for the function

### Step 5: Verify Setup

Run this command to test everything:

```bash
node scripts/test-db-connection.mjs
```

Expected output:
```
✅ Database connection successful!
✅ Tables are already set up!
📊 Found 2 doctors in database
   - Dr. G Sridhar (Pediatrics)
   - Dr. Himabindu Sridhar (Dermatology & Cosmetology)
```

---

## 📊 Database Schema Overview

### Tables Created:

#### 1. **doctors**
- Doctor profiles and information
- Includes specialization, experience, contact details
- Auto-populated with 2 sample doctors

#### 2. **patients**
- Patient records with auto-generated IDs
- Format: `AAYUSH-000001`, `AAYUSH-000002`, etc.
- Stores demographics, vital signs, allergies, emergency contacts

#### 3. **registrations**
- Registration records for both IP and OP patients
- **Payment tracking**: `payment_method` (Cash/UPI), `payment_amount`
- Links patients with doctors and appointments

#### 4. **ip_admissions**
- Inpatient-specific data
- Admission type, room number, guardian information

#### 5. **op_admissions**
- Outpatient-specific data
- Consultation type, symptoms, appointment time

#### 6. **reports**
- Analytics and reporting system
- Demographics, financial, operational reports

---

## 🎯 Key Features

### Auto-Generated Patient IDs
- Format: `AAYUSH-XXXXXX`
- Automatically increments (AAYUSH-000001, AAYUSH-000002, etc.)
- Triggered automatically on patient creation

### Payment Tracking
- Payment method: `Cash` or `UPI`
- Amount tracking with 2 decimal precision
- Indexed for fast financial queries

### One-Step Registration
Database function: `create_complete_registration()`
- Creates patient record
- Creates registration
- Creates IP or OP admission
- Returns complete patient data
- All in a single atomic transaction

### Automatic Timestamps
- `created_at`: Set when record is created
- `updated_at`: Automatically updated on record modification

---

## 🔒 Security (Row Level Security)

RLS is enabled on all tables with policies that allow:
- ✅ Anonymous access (for your HMS app)
- ✅ Authenticated access (if you add auth later)

This setup is ideal for internal hospital systems where the application itself is access-controlled.

---

## 🧪 Testing Your Database

### Test Connection:
```bash
node scripts/test-db-connection.mjs
```

### Seed Additional Data (if needed):
```bash
node scripts/seed-database.mjs
```

---

## 📝 Migration Files

All migration files are in `supabase/migrations/`:

1. **20250914173639_crystal_castle.sql**
   - Creates all tables
   - Sets up triggers and helper functions
   - Enables RLS
   - Creates initial policies

2. **20250914190000_allow_anon_access.sql** ⭐ **Apply this!**
   - Updates policies for app access
   - Inserts sample doctors

3. **20250914191500_add_payment_columns.sql** ⭐ **CRITICAL - Apply this FIRST!**
   - Adds `payment_method` column to registrations table
   - Adds `payment_amount` column to registrations table
   - Creates indexes for payment queries
   - Safe and idempotent

4. **20250914191000_create_rpc_function.sql** ⭐ **CRITICAL - Apply this SECOND!**
   - Creates the `create_complete_registration` RPC function
   - Enables patient registration in your app
   - Handles payment tracking (Cash/UPI)
   - Supports both IP and OP registrations

---

## 🔄 How to Export for Production Supabase Later

Your schema is PostgreSQL-standard and fully portable. To migrate later:

1. **Export your data:**
   ```sql
   -- In Supabase SQL Editor
   COPY doctors TO '/tmp/doctors.csv' CSV HEADER;
   COPY patients TO '/tmp/patients.csv' CSV HEADER;
   -- etc.
   ```

2. **Your migration files already work with production Supabase!**
   Just run them in order in your production database.

3. **No code changes needed** - just update `.env` with production credentials.

---

## 🎉 You're All Set!

After applying the final migration (`20250914190000_allow_anon_access.sql`):

1. ✅ Database is fully configured
2. ✅ Sample doctors are loaded
3. ✅ App can read/write data
4. ✅ Patient registration will work
5. ✅ All features are enabled

**Start your dev server and begin using your HMS system!**

---

## 📞 Support

- Supabase Dashboard: https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk
- Test Scripts: `scripts/test-db-connection.mjs`
- Migration Files: `supabase/migrations/`
