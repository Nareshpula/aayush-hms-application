# Discharge Patients Module - Complete Setup Guide

## ✅ What Has Been Created

### 1. Database Migration Files
Located in: `supabase/migrations/`

**File 1: 20250923000000_create_discharge_bills_system.sql** (4.9 KB)
- Creates `discharge_bills` table
- Creates `discharge_bill_items` table  
- Creates sequence for bill number generation
- Adds RLS policies for anonymous access
- Creates indexes for performance

**File 2: 20250925000000_enhance_discharge_patients_module.sql** (5.3 KB)
- Adds `payment_method`, `notes`, and `department` columns
- Creates 6 additional performance indexes
- Adds duplicate discharge prevention trigger
- Adds authenticated user RLS policies
- Creates `discharge_patients_view` with joined data

### 2. Frontend Components

**Page: src/pages/DischargePatients.tsx**
- Complete discharge patients management interface
- Two tabs: Pediatrics and Dermatology
- Search by Patient ID, Name, or Phone
- Filter by Date Range, Doctor, and Status
- Export to Excel/CSV functionality
- View and Print discharge bills
- Mark bills as finalized

**Modal: Inline Bill Preview**
- Professional discharge bill preview
- Patient and admission details
- Complete billing breakdown
- Print-friendly format

### 3. Routes and Navigation

**Added to App.tsx:**
```typescript
<Route path="/discharge-patients" element={<DischargePatients />} />
```

**Added to Layout.tsx:**
```typescript
{ name: 'Discharge Patients', href: '/discharge-patients', icon: Users }
```

---

## 🚀 Quick Start - Run Migrations

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run First Migration (Already Exists - Verify Only)
Copy and paste this content:
```sql
-- Content from: 20250923000000_create_discharge_bills_system.sql
-- (See the file in supabase/migrations/)
```

Click **Run** or press `Ctrl+Enter`

### Step 3: Run Second Migration (Enhancement)
Copy and paste this content:
```sql
-- Content from: 20250925000000_enhance_discharge_patients_module.sql
-- (See the file in supabase/migrations/)
```

Click **Run** or press `Ctrl+Enter`

---

## 📋 Database Schema Created

### discharge_bills Table
```sql
CREATE TABLE discharge_bills (
  id uuid PRIMARY KEY,
  bill_no text UNIQUE NOT NULL,              -- DBILL-2025-00001
  section text NOT NULL,                     -- 'Pediatrics' or 'Dermatology'
  patient_id uuid REFERENCES patients(id),
  registration_id uuid REFERENCES registrations(id),
  doctor_id uuid REFERENCES doctors(id),
  admission_date date NOT NULL,
  discharge_date date NOT NULL,
  total_amount decimal(10,2) DEFAULT 0,
  paid_amount decimal(10,2) DEFAULT 0,
  outstanding_amount decimal(10,2) DEFAULT 0,
  refundable_amount decimal(10,2) DEFAULT 0,
  payment_method text,                       -- 'Cash' or 'UPI'
  status text DEFAULT 'draft',               -- 'draft' or 'finalized'
  notes text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);
```

### discharge_bill_items Table
```sql
CREATE TABLE discharge_bill_items (
  id uuid PRIMARY KEY,
  discharge_bill_id uuid REFERENCES discharge_bills(id),
  category text NOT NULL,                    -- Room, Consultation, etc.
  description text NOT NULL,
  quantity integer DEFAULT 1,
  rate decimal(10,2) DEFAULT 0,
  amount decimal(10,2) DEFAULT 0,
  reference_id uuid,                         -- Links to source record
  reference_type text                        -- 'injection', 'vaccination', etc.
);
```

### discharge_patients_view (Read-Only View)
Automatically joins discharge_bills with patients, doctors, and registrations for easy querying.

---

## 🔧 Features Included

### Data Management
✅ Search by Patient ID, Name, or Phone Number
✅ Filter by Date Range (From/To)
✅ Filter by Doctor
✅ Filter by Status (Draft/Finalized)
✅ Prevent duplicate discharge entries
✅ Auto-generate unique bill numbers

### UI Features
✅ Two department tabs (Pediatrics & Dermatology)
✅ Color-coded status badges
✅ Responsive table with all patient details
✅ Billing summary (Total, Paid, Outstanding, Refund)
✅ Action buttons (View, Print, Finalize)
✅ Export to Excel/CSV

### Bill Preview Modal
✅ Professional bill layout
✅ Hospital header (AAYUSH Hospital)
✅ Patient information section
✅ Admission details section
✅ Billing summary breakdown
✅ Print button for direct printing
✅ IST timezone timestamps

### Security & Performance
✅ Row Level Security (RLS) enabled
✅ Policies for both authenticated and anonymous users
✅ 6+ performance indexes for fast queries
✅ Automatic timestamp updates
✅ Data validation constraints

---

## 🧪 Verify Installation

Run this in Supabase SQL Editor:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('discharge_bills', 'discharge_bill_items');

-- Check view
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'discharge_patients_view';

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'discharge_bills' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'discharge_bills';

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'generate_discharge_bill_number',
  'check_duplicate_discharge',
  'trigger_discharge_bills_updated_at'
);
```

Expected results:
- 2 tables
- 1 view
- 17+ columns in discharge_bills
- 6+ indexes
- 3 functions

---

## 📱 Access the Module

After running migrations:

1. Login to AAYUSH HMS
2. Click **"Discharge Patients"** in the left sidebar
3. Select **Pediatrics** or **Dermatology** tab
4. Start managing discharge records!

---

## 🎯 Usage Workflow

1. **View Discharged Patients**: See all discharge records by department
2. **Search/Filter**: Find specific patients quickly
3. **View Bill**: Click eye icon to see detailed bill
4. **Print Bill**: Click printer icon or use Print button in modal
5. **Finalize**: Click checkmark to mark draft bills as finalized
6. **Export**: Click "Export to Excel" to download CSV

---

## 📊 Sample Data

To test the module, you can insert sample data:

```sql
-- Insert a sample discharge bill
INSERT INTO discharge_bills (
  bill_no,
  section,
  patient_id,
  registration_id,
  doctor_id,
  admission_date,
  discharge_date,
  total_amount,
  paid_amount,
  outstanding_amount,
  refundable_amount,
  payment_method,
  status,
  notes
) VALUES (
  generate_discharge_bill_number(),
  'Pediatrics',
  (SELECT id FROM patients LIMIT 1),
  (SELECT id FROM registrations LIMIT 1),
  (SELECT id FROM doctors LIMIT 1),
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE,
  15000.00,
  15000.00,
  0.00,
  0.00,
  'Cash',
  'finalized',
  'Patient discharged in good health'
);
```

---

## 🆘 Troubleshooting

**Issue: "relation already exists"**
- Solution: Safe to ignore, migration uses `IF NOT EXISTS`

**Issue: "policy already exists"**  
- Solution: Safe to ignore, some policies may already be created

**Issue: No data showing**
- Check: Run sample data insert query above
- Check: Verify you have patients, doctors, and registrations in database

**Issue: Permission denied**
- Check: You're logged in as authenticated user
- Check: RLS policies are properly created

---

## 📞 Support

For issues or questions:
1. Check the migration files in `supabase/migrations/`
2. Review `DISCHARGE_PATIENTS_MIGRATION_GUIDE.md`
3. Verify all referenced tables exist in your database
4. Check Supabase logs for detailed error messages

---

## ✨ Module Complete!

The Discharge Patients module is fully integrated and ready to use. It follows Indian hospital workflows and integrates seamlessly with existing HMS modules (Registrations, Billing, Patients, Doctors).

**Next Step**: Run the two migration files in your Supabase SQL Editor!
