/*
  # Enhance Discharge Patients Module

  1. Enhancements
    - Add additional indexes for discharge_bills filtering
    - Add payment_method column to discharge_bills
    - Add notes column for discharge records
    - Add trigger for updated_at timestamp
    - Add function to prevent duplicate discharge entries
    - Add department column for better filtering

  2. Security
    - Update RLS policies for authenticated users
    - Maintain existing anonymous access for compatibility

  3. Performance
    - Add indexes for common query patterns (doctor_id, section, status, discharge_date)
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discharge_bills' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE discharge_bills ADD COLUMN payment_method text CHECK (payment_method IN ('Cash', 'UPI'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discharge_bills' AND column_name = 'notes'
  ) THEN
    ALTER TABLE discharge_bills ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discharge_bills' AND column_name = 'department'
  ) THEN
    ALTER TABLE discharge_bills ADD COLUMN department text;
  END IF;
END $$;

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discharge_bills_doctor_id ON discharge_bills(doctor_id);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_section ON discharge_bills(section);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_status ON discharge_bills(status);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_discharge_date ON discharge_bills(discharge_date);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_admission_date ON discharge_bills(admission_date);
CREATE INDEX IF NOT EXISTS idx_discharge_bills_created_at ON discharge_bills(created_at);

-- Create trigger function for updated_at if not exists
CREATE OR REPLACE FUNCTION trigger_discharge_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_discharge_bills_updated_at ON discharge_bills;

CREATE TRIGGER trigger_discharge_bills_updated_at
  BEFORE UPDATE ON discharge_bills
  FOR EACH ROW
  EXECUTE FUNCTION trigger_discharge_bills_updated_at();

-- Create function to prevent duplicate discharge entries
CREATE OR REPLACE FUNCTION check_duplicate_discharge()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM discharge_bills
    WHERE registration_id = NEW.registration_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Discharge record already exists for this registration';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_check_duplicate_discharge ON discharge_bills;

CREATE TRIGGER trigger_check_duplicate_discharge
  BEFORE INSERT OR UPDATE ON discharge_bills
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_discharge();

-- Add policies for authenticated users (in addition to anonymous access)
CREATE POLICY "Authenticated users can read discharge_bills"
  ON discharge_bills
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert discharge_bills"
  ON discharge_bills
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update discharge_bills"
  ON discharge_bills
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete discharge_bills"
  ON discharge_bills
  FOR DELETE
  TO authenticated
  USING (true);

-- Add policies for discharge_bill_items for authenticated users
CREATE POLICY "Authenticated users can read discharge_bill_items"
  ON discharge_bill_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert discharge_bill_items"
  ON discharge_bill_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update discharge_bill_items"
  ON discharge_bill_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete discharge_bill_items"
  ON discharge_bill_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a view for easy discharge patient listing with all details
CREATE OR REPLACE VIEW discharge_patients_view AS
SELECT 
  db.id,
  db.bill_no,
  db.section,
  db.patient_id,
  db.registration_id,
  db.doctor_id,
  db.admission_date,
  db.discharge_date,
  db.total_amount,
  db.paid_amount,
  db.outstanding_amount,
  db.refundable_amount,
  db.payment_method,
  db.status,
  db.notes,
  db.department,
  db.created_at,
  db.updated_at,
  p.patient_id as patient_code,
  p.full_name as patient_name,
  p.age,
  p.gender,
  p.contact_number,
  p.address,
  d.name as doctor_name,
  r.registration_type,
  r.payment_method as registration_payment_method
FROM discharge_bills db
LEFT JOIN patients p ON db.patient_id = p.id
LEFT JOIN doctors d ON db.doctor_id = d.id
LEFT JOIN registrations r ON db.registration_id = r.id;

-- Grant access to the view
GRANT SELECT ON discharge_patients_view TO anon;
GRANT SELECT ON discharge_patients_view TO authenticated;
