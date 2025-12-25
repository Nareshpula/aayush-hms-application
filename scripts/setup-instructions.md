# Bolt-Managed Database Setup Instructions

Your HMS application is already connected to the **Bolt-managed Supabase database**.

## Current Status

✅ **Database Connection**: Working
✅ **Tables Created**: Yes (doctors, patients, registrations, ip_admissions, op_admissions, reports)
✅ **Database URL**: https://gatgyhxtgqmzwjatbmzk.supabase.co
⚠️ **Sample Data**: Not yet added (RLS policies prevent anon key inserts)

---

## Option 1: Add Sample Data via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk

2. Click on "Table Editor" in the left sidebar

3. Select the `doctors` table

4. Click "Insert row" and add the following two doctors:

### Doctor 1:
```
id: 98a78477-ae6a-41c4-8938-a10cd129b112
name: Dr. G Sridhar
title: Senior Consultant in Pediatrics
specialization: Pediatrics
experience: 15+ years
phone: +91 98765 43210
email: dr.sridhar@aayushhospital.com
department: Pediatrics
avatar_url: https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop
availability_status: Available Today
```

### Doctor 2:
```
id: 95b573b2-17a6-4f9c-bc56-668ac5922f02
name: Dr. Himabindu Sridhar
title: Consultant Dermatologist, Cosmetologist, Laser & Hair Transplant Surgeon
specialization: Dermatology & Cosmetology
experience: 12+ years
phone: +91 98765 43211
email: dr.himabindu@aayushhospital.com
department: Dermatology
avatar_url: https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop
availability_status: Available Today
```

---

## Option 2: Temporarily Allow Anon Inserts

Run this SQL in your Supabase SQL Editor to temporarily allow data insertion:

```sql
-- Temporarily allow anon inserts for seeding
DROP POLICY IF EXISTS "Allow all operations on doctors" ON public.doctors;
CREATE POLICY "Allow all operations on doctors"
  ON public.doctors FOR ALL TO anon
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
CREATE POLICY "Allow all operations on patients"
  ON public.patients FOR ALL TO anon
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on registrations" ON public.registrations;
CREATE POLICY "Allow all operations on registrations"
  ON public.registrations FOR ALL TO anon
  USING (true) WITH CHECK (true);
```

Then run:
```bash
node scripts/seed-database.mjs
```

---

## Option 3: Add Auth and Use Authenticated Requests

If you want proper authentication:

1. The RLS policies are already set up to allow authenticated users
2. You'll need to implement Supabase Auth in your application
3. Then all operations will work through authenticated requests

---

## Testing Your Setup

After adding the sample doctors, run:

```bash
node scripts/test-db-connection.mjs
```

This will verify:
- ✅ Database connection
- ✅ Tables exist
- ✅ Sample data is present

---

## Database Schema

Your database includes:

### Tables:
- **doctors**: Doctor information and profiles
- **patients**: Patient records with auto-generated IDs (AAYUSH-XXXXXX)
- **registrations**: Registration records with payment tracking (Cash/UPI)
- **ip_admissions**: Inpatient admission details
- **op_admissions**: Outpatient admission details
- **reports**: Analytics and reporting data

### Features:
- ✅ Auto-generated patient IDs (AAYUSH-000001, AAYUSH-000002, etc.)
- ✅ Payment tracking (payment_method: Cash/UPI, payment_amount)
- ✅ Automatic timestamp updates
- ✅ Row Level Security (RLS) enabled
- ✅ Proper indexes for performance
- ✅ Database function: `create_complete_registration()` for one-step patient registration

---

## Next Steps

1. Add sample doctors (using Option 1 or 2 above)
2. Test the application
3. Start registering patients!

Your HMS system is ready to use with the Bolt-managed Supabase database.
