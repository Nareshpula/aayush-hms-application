/*
  # Allow Anonymous Access for HMS Application

  1. Changes
    - Update RLS policies to allow anon access (for applications without authentication)
    - This allows the HMS application to work immediately without implementing auth first

  2. Security Note
    - This is suitable for internal hospital systems where the application itself is behind authentication
    - For public-facing applications, you should implement Supabase Auth and use authenticated policies
*/

-- Update doctors policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on doctors" ON public.doctors;
CREATE POLICY "Allow all operations on doctors"
  ON public.doctors FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Update patients policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
CREATE POLICY "Allow all operations on patients"
  ON public.patients FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Update registrations policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on registrations" ON public.registrations;
CREATE POLICY "Allow all operations on registrations"
  ON public.registrations FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Update ip_admissions policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on ip_admissions" ON public.ip_admissions;
CREATE POLICY "Allow all operations on ip_admissions"
  ON public.ip_admissions FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Update op_admissions policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on op_admissions" ON public.op_admissions;
CREATE POLICY "Allow all operations on op_admissions"
  ON public.op_admissions FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Update reports policies to allow anon access
DROP POLICY IF EXISTS "Allow all operations on reports" ON public.reports;
CREATE POLICY "Allow all operations on reports"
  ON public.reports FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Insert sample doctors data if not exists
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
