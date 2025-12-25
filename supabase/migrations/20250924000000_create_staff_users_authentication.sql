/*
  # Create Staff Users Authentication System

  1. New Tables
    - `staff_users`
      - `id` (uuid, primary key)
      - `username` (text, unique, required)
      - `password_hash` (text, required) - bcrypt hashed password
      - `full_name` (text, required)
      - `role` (text, required) - admin, receptionist, nurse, doctor, billing
      - `is_active` (boolean, default true)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Functions
    - `authenticate_staff_user` - Verify username and password

  3. Security
    - Enable RLS on staff_users table
    - Add policies for authentication
    - Password stored as bcrypt hash

  4. Default Admin User
    - Username: admin
    - Password: admin123 (CHANGE IMMEDIATELY IN PRODUCTION)
*/

-- Install pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create staff_users table
CREATE TABLE IF NOT EXISTS staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'receptionist', 'nurse', 'doctor', 'billing', 'pharmacist')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_users_username ON staff_users(username);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);

-- Function to authenticate staff user
CREATE OR REPLACE FUNCTION authenticate_staff_user(
  p_username text,
  p_password text
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  role text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Get user record
  SELECT 
    u.id,
    u.username,
    u.password_hash,
    u.full_name,
    u.role,
    u.is_active
  INTO v_user_record
  FROM staff_users u
  WHERE u.username = p_username;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check if user is active
  IF NOT v_user_record.is_active THEN
    RETURN;
  END IF;

  -- Verify password using crypt
  IF v_user_record.password_hash = crypt(p_password, v_user_record.password_hash) THEN
    -- Update last login time
    UPDATE staff_users
    SET last_login = now()
    WHERE staff_users.id = v_user_record.id;

    -- Return user data (without password hash)
    RETURN QUERY
    SELECT 
      v_user_record.id,
      v_user_record.username,
      v_user_record.full_name,
      v_user_record.role,
      v_user_record.is_active;
  END IF;

  -- If password doesn't match, return nothing
  RETURN;
END;
$$;

-- Function to create staff user with hashed password
CREATE OR REPLACE FUNCTION create_staff_user(
  p_username text,
  p_password text,
  p_full_name text,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO staff_users (username, password_hash, full_name, role)
  VALUES (
    p_username,
    crypt(p_password, gen_salt('bf', 10)),
    p_full_name,
    p_role
  )
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;

-- Function to update staff user password
CREATE OR REPLACE FUNCTION update_staff_user_password(
  p_user_id uuid,
  p_new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE staff_users
  SET 
    password_hash = crypt(p_new_password, gen_salt('bf', 10)),
    updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Enable RLS
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

-- Policies for staff_users
CREATE POLICY "Allow anonymous read access to staff_users"
  ON staff_users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to staff_users"
  ON staff_users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to staff_users"
  ON staff_users FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to staff_users"
  ON staff_users FOR DELETE
  TO anon
  USING (true);

-- Create default admin user
-- Username: admin
-- Password: admin123 (CHANGE THIS IMMEDIATELY IN PRODUCTION)
SELECT create_staff_user(
  'admin',
  'admin123',
  'System Administrator',
  'admin'
);

-- Create sample users for testing (optional - remove in production)
SELECT create_staff_user(
  'receptionist',
  'reception123',
  'Reception Desk',
  'receptionist'
);

SELECT create_staff_user(
  'doctor',
  'doctor123',
  'Dr. Sample',
  'doctor'
);

-- Verification query to check if users were created
-- Run this to see the created users (password_hash will be encrypted)
-- SELECT id, username, full_name, role, is_active, created_at FROM staff_users;
