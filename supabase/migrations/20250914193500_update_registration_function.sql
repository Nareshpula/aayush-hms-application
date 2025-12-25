/*
  # Update Registration Function for Year-Based Patient IDs

  1. Changes
    - Update create_complete_registration function to use generate_patient_id_code()
    - Return patient_id_code in response instead of patient_id
    - Maintain backward compatibility

  2. New Behavior
    - Generates AAYUSH-YYYY-NNN format IDs
    - Stores in patient_id_code column
    - Returns new format in response
*/

-- Drop and recreate the function with updated ID generation
DROP FUNCTION IF EXISTS public.create_complete_registration CASCADE;

CREATE OR REPLACE FUNCTION public.create_complete_registration(
  -- Required patient data
  p_full_name text,
  p_contact_number text,
  p_age integer,
  p_blood_group text,
  p_gender text,
  p_address text,

  -- Required registration data
  p_doctor_id uuid,
  p_registration_type text,
  p_appointment_date date,

  -- Optional patient data
  p_date_of_birth date DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_initial_vital_signs jsonb DEFAULT '{}',
  p_allergies text[] DEFAULT '{}',
  p_emergency_contact jsonb DEFAULT '{}',

  -- IP-specific data
  p_guardian_name text DEFAULT NULL,
  p_guardian_relationship text DEFAULT NULL,
  p_admission_date date DEFAULT NULL,
  p_admission_time time DEFAULT NULL,
  p_admission_type text DEFAULT NULL,
  p_ip_department text DEFAULT NULL,
  p_room_number text DEFAULT NULL,

  -- OP-specific data
  p_appointment_time time DEFAULT NULL,
  p_consultation_type text DEFAULT NULL,
  p_symptoms text DEFAULT NULL,
  p_referred_by text DEFAULT NULL,

  -- Payment data
  p_payment_method text DEFAULT NULL,
  p_payment_amount numeric DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_patient_uuid uuid;
  v_registration_id uuid;
  v_patient_record jsonb;
  v_registration_record jsonb;
  v_generated_patient_id_code text;
BEGIN
  BEGIN
    -- Generate year-based patient ID code
    SELECT public.generate_patient_id_code() INTO v_generated_patient_id_code;

    -- Insert patient record with new ID code
    INSERT INTO public.patients (
      patient_id,
      patient_id_code,
      full_name,
      contact_number,
      age,
      date_of_birth,
      email,
      blood_group,
      gender,
      address,
      initial_vital_signs,
      allergies,
      emergency_contact
    ) VALUES (
      v_generated_patient_id_code,
      v_generated_patient_id_code,
      p_full_name,
      p_contact_number,
      p_age,
      p_date_of_birth,
      p_email,
      p_blood_group,
      p_gender,
      p_address,
      p_initial_vital_signs,
      p_allergies,
      p_emergency_contact
    ) RETURNING id INTO v_patient_uuid;

    -- Insert registration record with payment data
    INSERT INTO public.registrations (
      patient_id,
      doctor_id,
      registration_type,
      appointment_date,
      payment_method,
      payment_amount
    ) VALUES (
      v_patient_uuid,
      p_doctor_id,
      p_registration_type,
      p_appointment_date,
      p_payment_method,
      p_payment_amount
    ) RETURNING id INTO v_registration_id;

    -- Insert IP admission if registration type is IP
    IF p_registration_type = 'IP' THEN
      INSERT INTO public.ip_admissions (
        registration_id,
        guardian_name,
        guardian_relationship,
        admission_date,
        admission_time,
        admission_type,
        department,
        room_number
      ) VALUES (
        v_registration_id,
        p_guardian_name,
        p_guardian_relationship,
        p_admission_date,
        p_admission_time,
        p_admission_type,
        p_ip_department,
        p_room_number
      );
    END IF;

    -- Insert OP admission if registration type is OP
    IF p_registration_type = 'OP' THEN
      INSERT INTO public.op_admissions (
        registration_id,
        appointment_time,
        consultation_type,
        symptoms,
        referred_by
      ) VALUES (
        v_registration_id,
        p_appointment_time,
        p_consultation_type,
        p_symptoms,
        p_referred_by
      );
    END IF;

    -- Fetch the complete patient record
    SELECT to_jsonb(p.*) INTO v_patient_record
    FROM public.patients p
    WHERE p.id = v_patient_uuid;

    -- Fetch the complete registration record
    SELECT to_jsonb(r.*) INTO v_registration_record
    FROM public.registrations r
    WHERE r.id = v_registration_id;

    -- Return success with all data including new patient_id_code
    RETURN jsonb_build_object(
      'success', true,
      'patient_id', v_patient_uuid,
      'registration_id', v_registration_id,
      'generated_patient_id', v_generated_patient_id_code,
      'patient_id_code', v_generated_patient_id_code,
      'patient', v_patient_record,
      'registration', v_registration_record,
      'message', 'Patient registered successfully'
    );

  EXCEPTION WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Registration failed: ' || SQLERRM
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.create_complete_registration TO anon, authenticated;

-- Verify function was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'create_complete_registration'
  ) THEN
    RAISE NOTICE '✅ create_complete_registration function updated successfully';
    RAISE NOTICE '   - Now uses generate_patient_id_code()';
    RAISE NOTICE '   - Returns patient_id_code in AAYUSH-YYYY-NNN format';
  ELSE
    RAISE WARNING '⚠️ Function update failed';
  END IF;
END $$;
