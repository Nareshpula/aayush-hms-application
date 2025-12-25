/*
  # Create Fresh HMS Database Schema with Payment Fields

  1. New Tables in Public Schema
    - `doctors` - Doctor information
    - `patients` - Patient records
    - `registrations` - Registration records WITH PAYMENT FIELDS
      - `payment_method` (text) - 'Cash' or 'UPI'
      - `payment_amount` (numeric) - Amount paid
    - `ip_admissions` - Inpatient-specific data
    - `op_admissions` - Outpatient-specific data
    - `reports` - Analytics and reports

  2. Functions and Triggers
    - Auto-generate patient IDs
    - Update timestamps
    - Complete registration function WITH payment support

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create indexes for performance including payment fields
*/

-- Drop existing objects if they exist to ensure clean migration
DROP FUNCTION IF EXISTS public.create_complete_registration CASCADE;
DROP TRIGGER IF EXISTS trigger_set_patient_id ON public.patients CASCADE;
DROP TRIGGER IF EXISTS trigger_doctors_updated_at ON public.doctors CASCADE;
DROP TRIGGER IF EXISTS trigger_patients_updated_at ON public.patients CASCADE;
DROP TRIGGER IF EXISTS trigger_registrations_updated_at ON public.registrations CASCADE;
DROP TRIGGER IF EXISTS trigger_ip_admissions_updated_at ON public.ip_admissions CASCADE;
DROP TRIGGER IF EXISTS trigger_op_admissions_updated_at ON public.op_admissions CASCADE;
DROP TRIGGER IF EXISTS trigger_reports_updated_at ON public.reports CASCADE;

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  specialization text NOT NULL,
  experience text NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  avatar_url text,
  availability_status text DEFAULT 'Available Today',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text UNIQUE NOT NULL DEFAULT '',
  full_name text NOT NULL,
  contact_number text NOT NULL,
  age integer NOT NULL CHECK (age >= 0 AND age <= 150),
  date_of_birth date,
  email text,
  blood_group text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  address text NOT NULL,
  initial_vital_signs jsonb DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  emergency_contact jsonb DEFAULT '{}',
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Under Treatment', 'Recovered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registrations table WITH PAYMENT FIELDS
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  registration_type text NOT NULL CHECK (registration_type IN ('IP', 'OP')),
  appointment_date date NOT NULL,
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')),
  payment_method text CHECK (payment_method IN ('Cash', 'UPI')),
  payment_amount numeric(10,2) CHECK (payment_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ip_admissions table
CREATE TABLE IF NOT EXISTS public.ip_admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  guardian_name text NOT NULL,
  guardian_relationship text NOT NULL,
  admission_date date NOT NULL,
  admission_time time NOT NULL,
  admission_type text NOT NULL CHECK (admission_type IN ('General Ward', 'Private Room', 'ICU', 'Emergency')),
  department text NOT NULL,
  room_number text NOT NULL,
  discharge_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create op_admissions table
CREATE TABLE IF NOT EXISTS public.op_admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  appointment_time time NOT NULL,
  consultation_type text NOT NULL CHECK (consultation_type IN ('Regular Consultation', 'Follow-up', 'Emergency', 'Specialist Consultation')),
  symptoms text,
  referred_by text,
  priority text DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('Demographics', 'Financial', 'Operational', 'Quality', 'Analytics')),
  generated_by uuid,
  report_data jsonb DEFAULT '{}',
  status text DEFAULT 'Generated' CHECK (status IN ('Generated', 'Processing', 'Failed', 'Archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create helper functions
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM 8) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.patients
  WHERE patient_id ~ '^AAYUSH-[0-9]+$';

  new_id := 'AAYUSH-' || LPAD(counter::text, 6, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_patient_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.patient_id IS NULL OR NEW.patient_id = '' THEN
    NEW.patient_id := public.generate_patient_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_set_patient_id
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_patient_id();

CREATE TRIGGER trigger_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_ip_admissions_updated_at
  BEFORE UPDATE ON public.ip_admissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_op_admissions_updated_at
  BEFORE UPDATE ON public.op_admissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes (including payment fields)
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_contact_number ON public.patients(contact_number);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at);

CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_department ON public.doctors(department);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);

CREATE INDEX IF NOT EXISTS idx_registrations_patient_id ON public.registrations(patient_id);
CREATE INDEX IF NOT EXISTS idx_registrations_doctor_id ON public.registrations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_registrations_appointment_date ON public.registrations(appointment_date);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON public.registrations(registration_type);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_method ON public.registrations(payment_method);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_amount ON public.registrations(payment_amount);

CREATE INDEX IF NOT EXISTS idx_ip_admissions_registration_id ON public.ip_admissions(registration_id);
CREATE INDEX IF NOT EXISTS idx_ip_admissions_room_number ON public.ip_admissions(room_number);
CREATE INDEX IF NOT EXISTS idx_ip_admissions_admission_date ON public.ip_admissions(admission_date);

CREATE INDEX IF NOT EXISTS idx_op_admissions_registration_id ON public.op_admissions(registration_id);
CREATE INDEX IF NOT EXISTS idx_op_admissions_appointment_time ON public.op_admissions(appointment_time);
CREATE INDEX IF NOT EXISTS idx_op_admissions_priority ON public.op_admissions(priority);

CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.op_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Allow all operations on doctors" ON public.doctors;
CREATE POLICY "Allow all operations on doctors"
  ON public.doctors FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
CREATE POLICY "Allow all operations on patients"
  ON public.patients FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on registrations" ON public.registrations;
CREATE POLICY "Allow all operations on registrations"
  ON public.registrations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on ip_admissions" ON public.ip_admissions;
CREATE POLICY "Allow all operations on ip_admissions"
  ON public.ip_admissions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on op_admissions" ON public.op_admissions;
CREATE POLICY "Allow all operations on op_admissions"
  ON public.op_admissions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on reports" ON public.reports;
CREATE POLICY "Allow all operations on reports"
  ON public.reports FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Complete registration function WITH PAYMENT SUPPORT
-- This is created AFTER the tables are created to ensure columns exist
CREATE OR REPLACE FUNCTION public.create_complete_registration(
  p_full_name text,
  p_contact_number text,
  p_age integer,
  p_blood_group text,
  p_gender text,
  p_address text,
  p_doctor_id uuid,
  p_registration_type text,
  p_appointment_date date,
  p_date_of_birth date DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_initial_vital_signs jsonb DEFAULT '{}',
  p_allergies text[] DEFAULT '{}',
  p_emergency_contact jsonb DEFAULT '{}',
  p_guardian_name text DEFAULT NULL,
  p_guardian_relationship text DEFAULT NULL,
  p_admission_date date DEFAULT NULL,
  p_admission_time time DEFAULT NULL,
  p_admission_type text DEFAULT NULL,
  p_ip_department text DEFAULT NULL,
  p_room_number text DEFAULT NULL,
  p_appointment_time time DEFAULT NULL,
  p_consultation_type text DEFAULT NULL,
  p_symptoms text DEFAULT NULL,
  p_referred_by text DEFAULT NULL,
  p_payment_method text DEFAULT NULL,
  p_payment_amount numeric DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_patient_id uuid;
  v_registration_id uuid;
  v_patient_record jsonb;
  v_registration_record jsonb;
  v_generated_patient_id text;
BEGIN
  BEGIN
    SELECT public.generate_patient_id() INTO v_generated_patient_id;

    INSERT INTO public.patients (
      patient_id, full_name, contact_number, age, date_of_birth, email, blood_group,
      gender, address, initial_vital_signs, allergies, emergency_contact
    ) VALUES (
      v_generated_patient_id, p_full_name, p_contact_number, p_age, p_date_of_birth, p_email, p_blood_group,
      p_gender, p_address, p_initial_vital_signs, p_allergies, p_emergency_contact
    ) RETURNING id INTO v_patient_id;

    INSERT INTO public.registrations (
      patient_id, doctor_id, registration_type, appointment_date, payment_method, payment_amount
    ) VALUES (
      v_patient_id, p_doctor_id, p_registration_type, p_appointment_date, p_payment_method, p_payment_amount
    ) RETURNING id INTO v_registration_id;

    IF p_registration_type = 'IP' THEN
      INSERT INTO public.ip_admissions (
        registration_id, guardian_name, guardian_relationship, admission_date,
        admission_time, admission_type, department, room_number
      ) VALUES (
        v_registration_id, p_guardian_name, p_guardian_relationship, p_admission_date,
        p_admission_time, p_admission_type, p_ip_department, p_room_number
      );
    END IF;

    IF p_registration_type = 'OP' THEN
      INSERT INTO public.op_admissions (
        registration_id, appointment_time, consultation_type, symptoms, referred_by
      ) VALUES (
        v_registration_id, p_appointment_time, p_consultation_type, p_symptoms, p_referred_by
      );
    END IF;

    SELECT to_jsonb(p.*) INTO v_patient_record
    FROM public.patients p
    WHERE p.id = v_patient_id;

    SELECT to_jsonb(r.*) INTO v_registration_record
    FROM public.registrations r
    WHERE r.id = v_registration_id;

    RETURN jsonb_build_object(
      'success', true,
      'patient_id', v_patient_id,
      'registration_id', v_registration_id,
      'generated_patient_id', v_generated_patient_id,
      'patient', v_patient_record,
      'registration', v_registration_record,
      'message', 'Patient registered successfully'
    );

  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Registration failed: ' || SQLERRM
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample doctors data with specific UUIDs
DO $$
DECLARE
  doctor1_id uuid := '98a78477-ae6a-41c4-8938-a10cd129b112'::uuid;
  doctor2_id uuid := '95b573b2-17a6-4f9c-bc56-668ac5922f02'::uuid;
BEGIN
  INSERT INTO public.doctors (id, name, title, specialization, experience, phone, email, department, avatar_url) VALUES
  (doctor1_id, 'Dr. G Sridhar', 'Senior Consultant in Pediatrics', 'Pediatrics', '15+ years', '+91 98765 43210', 'dr.sridhar@aayushhospital.com', 'Pediatrics', 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop'),
  (doctor2_id, 'Dr. Himabindu Sridhar', 'Consultant Dermatologist, Cosmetologist, Laser & Hair Transplant Surgeon', 'Dermatology & Cosmetology', '12+ years', '+91 98765 43211', 'dr.himabindu@aayushhospital.com', 'Dermatology', 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop')
  ON CONFLICT (email) DO NOTHING;
END $$;
