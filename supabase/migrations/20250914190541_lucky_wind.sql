/*
  # Fix Sample Patient Data with Correct Date Formats

  1. Data Fixes
    - Insert sample patients with properly formatted dates
    - Use correct date casting for date_of_birth
    - Ensure all data types match table schema

  2. Safety
    - Only insert if no patients exist
    - Use proper type casting for all fields
    - Handle null values correctly
*/

-- Insert sample patients for testing with proper date formatting
INSERT INTO public.patients (
  full_name, contact_number, age, date_of_birth, email, blood_group, 
  gender, address, initial_vital_signs, allergies, emergency_contact, 
  status, last_visit
) 
SELECT * FROM (VALUES
  ('John Smith', '+1 (555) 123-4567', 45, DATE '1979-03-15', 'john.smith@email.com', 'O+', 'Male', 
   '123 Main Street, New York, NY 10001', 
   '{"blood_pressure": "140/90", "heart_rate": "72", "temperature": "98.6", "weight": "185"}'::jsonb,
   ARRAY['Penicillin', 'Nuts'], 
   '{"name": "Jane Smith", "relationship": "Spouse", "phone": "+1 (555) 987-6543"}'::jsonb,
   'Active', now() - interval '5 days'),
   
  ('Emma Johnson', '+1 (555) 234-5678', 32, DATE '1992-07-22', 'emma.johnson@email.com', 'A+', 'Female',
   '456 Oak Avenue, Los Angeles, CA 90210',
   '{"blood_pressure": "120/80", "heart_rate": "68", "temperature": "98.4", "weight": "140"}'::jsonb,
   ARRAY['Shellfish'],
   '{"name": "Michael Johnson", "relationship": "Husband", "phone": "+1 (555) 876-5432"}'::jsonb,
   'Under Treatment', now() - interval '2 days'),
   
  ('Michael Brown', '+1 (555) 345-6789', 28, DATE '1996-11-08', 'michael.brown@email.com', 'B-', 'Male',
   '789 Pine Street, Chicago, IL 60601',
   '{"blood_pressure": "110/70", "heart_rate": "75", "temperature": "98.2", "weight": "170"}'::jsonb,
   ARRAY[]::text[],
   '{"name": "Sarah Brown", "relationship": "Sister", "phone": "+1 (555) 765-4321"}'::jsonb,
   'Recovered', now() - interval '10 days'),
   
  ('Sarah Davis', '+1 (555) 456-7890', 38, DATE '1986-05-12', 'sarah.davis@email.com', 'AB+', 'Female',
   '321 Elm Drive, Houston, TX 77001',
   '{"blood_pressure": "130/85", "heart_rate": "70", "temperature": "98.8", "weight": "155"}'::jsonb,
   ARRAY['Latex', 'Aspirin'],
   '{"name": "David Davis", "relationship": "Spouse", "phone": "+1 (555) 654-3210"}'::jsonb,
   'Active', now() - interval '1 day'),
   
  ('Robert Wilson', '+1 (555) 567-8901', 52, DATE '1972-09-30', 'robert.wilson@email.com', 'O-', 'Male',
   '654 Maple Lane, Phoenix, AZ 85001',
   '{"blood_pressure": "145/95", "heart_rate": "78", "temperature": "98.5", "weight": "190"}'::jsonb,
   ARRAY['Iodine'],
   '{"name": "Linda Wilson", "relationship": "Wife", "phone": "+1 (555) 543-2109"}'::jsonb,
   'Inactive', NULL),

  ('Maria Garcia', '+1 (555) 678-9012', 29, DATE '1995-01-18', 'maria.garcia@email.com', 'A-', 'Female',
   '987 Cedar Street, Miami, FL 33101',
   '{"blood_pressure": "115/75", "heart_rate": "65", "temperature": "98.3", "weight": "125"}'::jsonb,
   ARRAY[]::text[],
   '{"name": "Carlos Garcia", "relationship": "Husband", "phone": "+1 (555) 432-1098"}'::jsonb,
   'Active', now() - interval '3 days'),

  ('James Wilson', '+1 (555) 789-0123', 41, DATE '1983-08-25', 'james.wilson@email.com', 'B+', 'Male',
   '456 Birch Avenue, Seattle, WA 98101',
   '{"blood_pressure": "125/82", "heart_rate": "73", "temperature": "98.7", "weight": "175"}'::jsonb,
   ARRAY['Peanuts'],
   '{"name": "Lisa Wilson", "relationship": "Wife", "phone": "+1 (555) 321-0987"}'::jsonb,
   'Under Treatment', now() - interval '7 days')
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM public.patients LIMIT 1);