# Discharge Bills Module - Complete Implementation Guide

## Overview
This guide provides complete instructions for implementing a Discharge Bills module for IP patient billing at discharge with separate flows for Pediatrics and Dermatology sections.

## Database Migration

### Step 1: Create Migration File

Create file: `supabase/migrations/20250923000000_create_discharge_bills_system.sql`

```sql
/*
  # Create Discharge Bills System

  1. New Tables
    - `discharge_bills` - Main discharge bill records
    - `discharge_bill_items` - Line items for each bill

  2. Sequences
    - discharge_bill_seq - For bill number generation

  3. Functions
    - generate_discharge_bill_number() - Generate sequential bill numbers

  4. Security
    - Enable RLS
    - Add policies for anonymous access
*/

-- Create discharge_bills table
CREATE TABLE IF NOT EXISTS discharge_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_no text UNIQUE NOT NULL,
  section text NOT NULL CHECK (section IN ('Pediatrics', 'Dermatology')),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES registrations(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
  admission_date date NOT NULL,
  discharge_date date NOT NULL,
  total_amount decimal(10,2) DEFAULT 0,
  paid_amount decimal(10,2) DEFAULT 0,
  outstanding_amount decimal(10,2) DEFAULT 0,
  refundable_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- Create discharge_bill_items table
CREATE TABLE IF NOT EXISTS discharge_bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discharge_bill_id uuid REFERENCES discharge_bills(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  rate decimal(10,2) DEFAULT 0,
  amount decimal(10,2) DEFAULT 0,
  reference_id uuid,
  reference_type text
);

-- Create sequence for discharge bill numbers
CREATE SEQUENCE IF NOT EXISTS discharge_bill_seq START WITH 1;

-- Function to generate discharge bill number
CREATE OR REPLACE FUNCTION generate_discharge_bill_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number integer;
  bill_number text;
  current_year text;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  new_number := nextval('discharge_bill_seq');
  bill_number := 'DBILL-' || current_year || '-' || LPAD(new_number::text, 5, '0');
  RETURN bill_number;
END;
$$;

-- Enable RLS
ALTER TABLE discharge_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharge_bill_items ENABLE ROW LEVEL SECURITY;

-- Policies for discharge_bills
CREATE POLICY "Allow anonymous read access to discharge_bills"
  ON discharge_bills FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to discharge_bills"
  ON discharge_bills FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to discharge_bills"
  ON discharge_bills FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to discharge_bills"
  ON discharge_bills FOR DELETE
  TO anon
  USING (true);

-- Policies for discharge_bill_items
CREATE POLICY "Allow anonymous read access to discharge_bill_items"
  ON discharge_bill_items FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to discharge_bill_items"
  ON discharge_bill_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to discharge_bill_items"
  ON discharge_bill_items FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to discharge_bill_items"
  ON discharge_bill_items FOR DELETE
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discharge_bills_patient_id ON discharge_bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_registration_id ON discharge_bills(registration_id);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_bill_no ON discharge_bills(bill_no);
CREATE INDEX IF NOT EXISTS idx_discharge_bill_items_discharge_bill_id ON discharge_bill_items(discharge_bill_id);
```

### Step 2: Apply Migration

Run this SQL in your Supabase SQL Editor or use the Supabase CLI:

```bash
supabase migration up
```

## TypeScript Interfaces

Add these interfaces to `src/lib/supabase.ts`:

```typescript
export interface DischargeBill {
  id: string;
  bill_no: string;
  section: 'Pediatrics' | 'Dermatology';
  patient_id: string;
  registration_id: string;
  doctor_id: string;
  admission_date: string;
  discharge_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  refundable_amount: number;
  status: 'draft' | 'finalized';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DischargeBillItem {
  id: string;
  discharge_bill_id: string;
  category: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  reference_id?: string;
  reference_type?: string;
}
```

## Database Service Methods

Add these methods to `DatabaseService` in `src/lib/supabase.ts`:

```typescript
// Discharge Bill Operations
async generateDischargeBillNumber() {
  const { data, error } = await supabase.rpc('generate_discharge_bill_number');
  if (error) throw error;
  return data;
},

async getActiveIPAdmissionForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      id,
      patient_id,
      doctor_id,
      registration_type,
      appointment_date,
      registration_date,
      status,
      payment_method,
      payment_amount,
      patients(id, patient_id_code, full_name, age, gender, contact_number, blood_group),
      doctors(id, name, specialization),
      ip_admissions(admission_date, discharge_date, room_number, admission_type)
    `)
    .eq('patient_id', patientId)
    .eq('registration_type', 'IP')
    .eq('status', 'Completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
},

async getPatientServicesByRegistration(registrationId: string) {
  const [injections, vaccinations, newbornVaccinations, dermatologyProcedures] = await Promise.all([
    supabase.from('injections')
      .select('*, doctors(name)')
      .eq('registration_id', registrationId)
      .order('date', { ascending: false }),
    supabase.from('vaccinations')
      .select('*, doctors(name)')
      .eq('registration_id', registrationId)
      .order('date', { ascending: false }),
    supabase.from('newborn_vaccinations')
      .select('*, doctors(name)')
      .eq('registration_id', registrationId)
      .order('date', { ascending: false }),
    supabase.from('dermatology_procedures')
      .select('*, doctors(name)')
      .eq('registration_id', registrationId)
      .order('date', { ascending: false })
  ]);

  return {
    injections: injections.data || [],
    vaccinations: vaccinations.data || [],
    newbornVaccinations: newbornVaccinations.data || [],
    dermatologyProcedures: dermatologyProcedures.data || []
  };
},

async saveDischargeBill(billData: Omit<DischargeBill, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('discharge_bills')
    .insert([billData])
    .select()
    .single();

  if (error) throw error;
  return data;
},

async saveDischargeBillItems(items: Omit<DischargeBillItem, 'id'>[]) {
  const { data, error } = await supabase
    .from('discharge_bill_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data;
},

async getDischargeBillByNumber(billNo: string) {
  const { data, error } = await supabase
    .from('discharge_bills')
    .select(`
      *,
      patients(id, patient_id_code, full_name, age, gender, contact_number, blood_group),
      doctors(id, name, specialization),
      discharge_bill_items(*)
    `)
    .eq('bill_no', billNo)
    .maybeSingle();

  if (error) throw error;
  return data;
},

async getDischargeBills() {
  const { data, error } = await supabase
    .from('discharge_bills')
    .select(`
      *,
      patients(id, patient_id_code, full_name),
      doctors(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
},

async searchDischargeBills(searchTerm: string) {
  const { data: patients } = await supabase
    .from('patients')
    .select('id')
    .or(`patient_id_code.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

  const patientIds = patients?.map(p => p.id) || [];

  let query = supabase
    .from('discharge_bills')
    .select(`
      *,
      patients(patient_id_code, full_name)
    `);

  if (patientIds.length > 0) {
    query = query.or(`bill_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
  } else {
    query = query.ilike('bill_no', `%${searchTerm}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false});

  if (error) throw error;
  return data || [];
}
```

## UI Components Structure

### File: `src/pages/DischargeBills.tsx`

Main page with:
- Section selector (Pediatrics/Dermatology)
- Patient search
- Bill form with auto-calculated totals
- Preview button

### File: `src/components/DischargeBillPreview.tsx`

Full-screen preview with:
- Hospital header
- A4 printable layout
- Itemized table
- Category totals
- Action buttons (Back, Edit, Save, Print)

## Next Steps

1. **Apply the database migration** using the SQL provided above
2. **Add TypeScript interfaces** to `src/lib/supabase.ts`
3. **Add DatabaseService methods** to `src/lib/supabase.ts`
4. **Create DischargeBills.tsx** page component
5. **Create DischargeBillPreview.tsx** component
6. **Update App.tsx** to add the route
7. **Update Layout.tsx** to add navigation link
8. **Integrate with Billing.tsx** for invoice lookup

## Key Features

- Sequential bill numbering (DBILL-YYYY-XXXXX)
- Separate templates for Pediatrics & Dermatology
- Auto-load patient and service data
- Category-wise totals
- Excel-style table layout
- A4 printable format
- Save/Edit capability
- Integration with existing billing system

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Bill number generation works
- [ ] Patient search loads data correctly
- [ ] Services are fetched accurately
- [ ] Totals calculate properly
- [ ] Preview displays correctly
- [ ] Print output is A4 formatted
- [ ] Bills save to database
- [ ] Bills appear in invoice lookup
- [ ] Edit functionality works
- [ ] No duplicate bills per admission

Would you like me to proceed with creating the actual UI components now that the database schema is documented?
