/*
  # Add Sample Patient Data for Testing

  1. Sample Data
    - Add a few test patients to verify the system is working
    - Include various blood groups, ages, and statuses
    - Set some last_visit dates for testing

  2. Data Verification
    - Ensures the patients table has data to display
    - Helps test the frontend functionality
*/

-- Insert sample patients for testing (only if table is empty)
INSERT INTO public.patients (
  full_name, contact_number, age, date_of_birth, email, blood_group, 
  gender, address, initial_vital_signs, allergies, emergency_contact, 
  status, last_visit
) 
SELECT * FROM (VALUES
  ('John Smith', '+1 (555) 123-4567', 45, '1979-03-15', 'john.smith@email.com', 'O+', 'Male', 
   '123 Main Street, New York, NY 10001', 
   '{"blood_pressure": "140/90", "heart_rate": "72", "temperature": "98.6", "weight": "185"}',
   ARRAY['Penicillin', 'Nuts'], 
   '{"name": "Jane Smith", "relationship": "Spouse", "phone": "+1 (555) 987-6543"}',
   'Active', now() - interval '5 days'),
   
  ('Emma Johnson', '+1 (555) 234-5678', 32, '1992-07-22', 'emma.johnson@email.com', 'A+', 'Female',
   '456 Oak Avenue, Los Angeles, CA 90210',
   '{"blood_pressure": "120/80", "heart_rate": "68", "temperature": "98.4", "weight": "140"}',
   ARRAY['Shellfish'],
   '{"name": "Michael Johnson", "relationship": "Husband", "phone": "+1 (555) 876-5432"}',
   'Under Treatment', now() - interval '2 days'),
   
  ('Michael Brown', '+1 (555) 345-6789', 28, '1996-11-08', 'michael.brown@email.com', 'B-', 'Male',
   '789 Pine Street, Chicago, IL 60601',
   '{"blood_pressure": "110/70", "heart_rate": "75", "temperature": "98.2", "weight": "170"}',
   ARRAY[]::text[],
   '{"name": "Sarah Brown", "relationship": "Sister", "phone": "+1 (555) 765-4321"}',
   'Recovered', now() - interval '10 days'),
   
  ('Sarah Davis', '+1 (555) 456-7890', 38, '1986-05-12', 'sarah.davis@email.com', 'AB+', 'Female',
   '321 Elm Drive, Houston, TX 77001',
   '{"blood_pressure": "130/85", "heart_rate": "70", "temperature": "98.8", "weight": "155"}',
   ARRAY['Latex', 'Aspirin'],
   '{"name": "David Davis", "relationship": "Spouse", "phone": "+1 (555) 654-3210"}',
   'Active', now() - interval '1 day'),
   
  ('Robert Wilson', '+1 (555) 567-8901', 52, '1972-09-30', 'robert.wilson@email.com', 'O-', 'Male',
   '654 Maple Lane, Phoenix, AZ 85001',
   '{"blood_pressure": "145/95", "heart_rate": "78", "temperature": "98.5", "weight": "190"}',
   ARRAY['Iodine'],
   '{"name": "Linda Wilson", "relationship": "Wife", "phone": "+1 (555) 543-2109"}',
   'Inactive', NULL)
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM public.patients LIMIT 1);