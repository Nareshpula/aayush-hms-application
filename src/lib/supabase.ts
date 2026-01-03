import { createClient } from '@supabase/supabase-js';
import { istDateToUTCStart, istDateToUTCEnd } from './dateUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Using default public schema
});

/**
 * ===============================
 * IP ROOM MANAGEMENT HELPERS
 * ===============================
 */
export async function releaseIPRoom(
  registrationId: string,
  dischargeDate: string
) {
  const { error } = await supabase
    .from('ip_admissions')
    .update({
      discharge_date: dischargeDate
    })
    .eq('registration_id', registrationId)
    .is('discharge_date', null);

  if (error) {
    console.error('Failed to release IP room:', error);
    throw error;
  }
}

// Database types for TypeScript
export interface StaffUser {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'receptionist' | 'nurse' | 'doctor' | 'billing' | 'pharmacist';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialization: string;
  experience: string;
  phone: string;
  email: string;
  department: string;
  avatar_url?: string;
  availability_status: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  patient_id_code?: string;
  full_name: string;
  contact_number: string;
  age: number;
  age_text?: string;
  date_of_birth?: string;
  email?: string;
  blood_group: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  initial_vital_signs: {
    blood_pressure?: string;
    heart_rate?: string;
    temperature?: string;
    weight?: string;
  };
  allergies: string[];
  emergency_contact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  status: 'Active' | 'Inactive' | 'Under Treatment' | 'Recovered';
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  patient_id: string;
  doctor_id: string;
  registration_type: 'IP' | 'OP';
  appointment_date: string;
  registration_date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface IPAdmission {
  id: string;
  registration_id: string;
  guardian_name: string;
  guardian_relationship: string;
  admission_date: string;
  admission_time: string;
  admission_type: 'General Ward' | 'Private Room' | 'ICU' | 'Emergency';
  department: string;
  room_number: string;
  discharge_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OPAdmission {
  id: string;
  registration_id: string;
  appointment_time: string;
  consultation_type: 'Regular Consultation' | 'Follow-up' | 'Emergency' | 'Specialist Consultation';
  symptoms?: string;
  referred_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Injection {
  id: string;
  registration_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  admission_type?: 'IP' | 'OP';
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;
  injection_details?: string;
  created_at: string;
  updated_at: string;
}

export interface Vaccination {
  id: string;
  registration_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  admission_type?: 'IP' | 'OP';
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;
  vaccination_details?: string;
  invoice_no?: string;
  created_at: string;
  updated_at: string;
}

export interface NewbornVaccination {
  id: string;
  registration_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  admission_type?: 'IP' | 'OP';
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;
  vaccination_details?: string;
  invoice_no?: string;
  created_at: string;
  updated_at: string;
}

export interface DermatologyProcedure {
  id: string;
  registration_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  admission_type?: 'IP' | 'OP';
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;
  procedure_details?: string;
  invoice_no?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRefund {
  id: string;
  registration_id: string;
  patient_id: string;
  invoice_no?: string;
  paid_amount: number;
  refund_amount: number;
  refund_method: 'Cash' | 'UPI';
  reason: string;
  refunded_at: string;
  refunded_by: string;
  created_at: string;
}

export interface CompleteRegistrationData {
  // Patient data
  full_name: string;
  contact_number: string;
  age: number;
  age_text?: string;
  date_of_birth?: string;
  email?: string;
  blood_group: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  initial_vital_signs?: {
    blood_pressure?: string;
    heart_rate?: string;
    temperature?: string;
    weight?: string;
  };
  allergies?: string[];
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };

  // Registration data
  doctor_id: string;
  registration_type: 'IP' | 'OP';
  appointment_date: string;

  // Payment data
  payment_method?: 'Cash' | 'UPI';
  payment_amount?: number;

  // IP-specific data
  guardian_name?: string;
  guardian_relationship?: string;
  admission_date?: string;
  admission_time?: string;
  admission_type?: string;
  ip_department?: string;
  room_number?: string;

  // OP-specific data
  appointment_time?: string;
  consultation_type?: string;
  symptoms?: string;
  referred_by?: string;
}

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

// Database service functions
export const DatabaseService = {
  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    console.log('DatabaseService: Starting patient fetch...');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('DatabaseService: Error fetching patients:', error);
      throw error;
    }
    
    console.log('DatabaseService: Raw patient data:', data);
    console.log('DatabaseService: Patient count:', data?.length || 0);
    return data || [];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'patient_id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Registration operations
  async createRegistration(registrationData: Omit<Registration, 'id' | 'created_at' | 'updated_at'>): Promise<Registration> {
    const { data, error } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRegistrationsByPatient(patientId: string): Promise<Registration[]> {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // IP Admission operations
  async createIPAdmission(admissionData: Omit<IPAdmission, 'id' | 'created_at' | 'updated_at'>): Promise<IPAdmission> {
    const { data, error } = await supabase
      .from('ip_admissions')
      .insert([admissionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getIPAdmissionByRegistration(registrationId: string): Promise<IPAdmission | null> {
    const { data, error } = await supabase
      .from('ip_admissions')
      .select('*')
      .eq('registration_id', registrationId)
      .single();

    if (error) throw error;
    return data;
  },

  async getAvailableRooms(): Promise<string[]> {
    const allRooms = Array.from({ length: 50 }, (_, i) => `Room ${String(i + 1).padStart(3, '0')}`);

    const { data: occupiedRooms, error } = await supabase
      .from('ip_admissions')
      .select('room_number')
      .is('discharge_date', null);

    if (error) {
      console.error('Error fetching occupied rooms:', error);
      throw error;
    }

    const occupiedRoomNumbers = new Set(occupiedRooms?.map(r => r.room_number) || []);
    const availableRooms = allRooms.filter(room => !occupiedRoomNumbers.has(room));

    return availableRooms;
  },

  // OP Admission operations
  async createOPAdmission(admissionData: Omit<OPAdmission, 'id' | 'created_at' | 'updated_at'>): Promise<OPAdmission> {
    const { data, error } = await supabase
      .from('op_admissions')
      .insert([admissionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOPAdmissionByRegistration(registrationId: string): Promise<OPAdmission | null> {
    const { data, error } = await supabase
      .from('op_admissions')
      .select('*')
      .eq('registration_id', registrationId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Complete registration operation
  async createCompleteRegistration(registrationData: CompleteRegistrationData): Promise<any> {
    // Build payload object for new JSON-based database function
    const payload = {
      // Required patient data
      full_name: registrationData.full_name,
      contact_number: registrationData.contact_number,
      age: registrationData.age,
      age_text: registrationData.age_text || null,
      blood_group: registrationData.blood_group || null,
      gender: registrationData.gender,
      address: registrationData.address,

      // Optional patient data
      date_of_birth: registrationData.date_of_birth || null,
      email: registrationData.email || null,
      initial_vital_signs: registrationData.initial_vital_signs || {},
      allergies: registrationData.allergies || [],
      emergency_contact: registrationData.emergency_contact || {},

      // Required registration data
      doctor_id: registrationData.doctor_id,
      registration_type: registrationData.registration_type,
      appointment_date: registrationData.appointment_date,

      // Payment data
      payment_method: registrationData.payment_method || null,
      payment_amount: registrationData.payment_amount || null,

      // IP-specific data
      guardian_name: registrationData.guardian_name || null,
      guardian_relationship: registrationData.guardian_relationship || null,
      admission_date: registrationData.admission_date || null,
      admission_time: registrationData.admission_time || null,
      admission_type: registrationData.admission_type || null,
      ip_department: registrationData.ip_department || null,
      room_number: registrationData.room_number || null,

      // OP-specific data
      appointment_time: registrationData.appointment_time || null,
      consultation_type: registrationData.consultation_type || null,
      symptoms: registrationData.symptoms || null,
      referred_by: registrationData.referred_by || null
    };

    const { data, error } = await supabase.rpc('create_complete_registration', { payload });

    if (error) throw error;
    return data;
  },

  // Analytics and reporting
  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayRegistrations, error } = await supabase
      .from('registrations')
      .select('registration_type')
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);
    
    if (error) throw error;
    
    const totalToday = todayRegistrations?.length || 0;
    const ipToday = todayRegistrations?.filter(r => r.registration_type === 'IP').length || 0;
    const opToday = todayRegistrations?.filter(r => r.registration_type === 'OP').length || 0;
    
    return {
      totalPatientsToday: totalToday,
      ipPatientsToday: ipToday,
      opPatientsToday: opToday
    };
  },

  async getDepartmentStats() {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        registration_type,
        doctors!inner(department)
      `);

    if (error) throw error;

    // Process department statistics
    const departmentCounts: { [key: string]: number } = {};
    data?.forEach(reg => {
      const dept = (reg as any).doctors.department;
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    return Object.entries(departmentCounts).map(([name, count]) => ({
      name,
      patients: count,
      percentage: Math.round((count / (data?.length || 1)) * 100)
    }));
  },

  // Injection operations
  async getInjections(): Promise<Injection[]> {
    const { data, error } = await supabase
      .from('injections')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInjectionById(id: string): Promise<Injection | null> {
    const { data, error } = await supabase
      .from('injections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getInjectionsByPatient(patientId: string): Promise<Injection[]> {
    const { data, error } = await supabase
      .from('injections')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInjectionsByRegistration(registrationId: string): Promise<Injection[]> {
    const { data, error } = await supabase
      .from('injections')
      .select('*')
      .eq('registration_id', registrationId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createInjection(injectionData: Omit<Injection, 'id' | 'created_at' | 'updated_at'>): Promise<Injection> {
    const { data, error } = await supabase
      .from('injections')
      .insert([injectionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createVaccination(vaccinationData: Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>): Promise<Vaccination> {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert([vaccinationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createNewbornVaccination(vaccinationData: Omit<NewbornVaccination, 'id' | 'created_at' | 'updated_at'>): Promise<NewbornVaccination> {
    const { data, error } = await supabase
      .from('newborn_vaccinations')
      .insert([vaccinationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createDermatologyProcedure(procedureData: Omit<DermatologyProcedure, 'id' | 'created_at' | 'updated_at'>): Promise<DermatologyProcedure> {
    const { data, error } = await supabase
      .from('dermatology_procedures')
      .insert([procedureData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRegistrationWithPatient(registrationId: string): Promise<{ registration: Registration | null; patient: Patient | null }> {
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .maybeSingle();

    if (regError) throw regError;

    if (!registration) {
      return { registration: null, patient: null };
    }

    const { data: patient, error: patError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', registration.patient_id)
      .maybeSingle();

    if (patError) throw patError;

    return { registration, patient };
  },

  async getPatientByIdCode(patientIdCode: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id_code', patientIdCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPatientWithRegistration(patientIdCode: string): Promise<{ patient: Patient | null; registration: Registration | null }> {
    const { data: patient, error: patError } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id_code', patientIdCode)
      .maybeSingle();

    if (patError) throw patError;

    if (!patient) {
      return { patient: null, registration: null };
    }

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regError) throw regError;

    return { patient, registration };
  },

  async searchPatientByNameOrId(searchTerm: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,patient_id_code.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async getComprehensivePatientData(patientId: string) {
    const [patient, registrations, injections, vaccinations, newbornVaccinations, dermatologyProcedures] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).maybeSingle(),
      supabase.from('registrations').select('*, doctors(*)').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('injections').select('*, doctors(*)').eq('patient_id', patientId).order('date', { ascending: false }),
      supabase.from('vaccinations').select('*, doctors(*)').eq('patient_id', patientId).order('date', { ascending: false }),
      supabase.from('newborn_vaccinations').select('*, doctors(*)').eq('patient_id', patientId).order('date', { ascending: false }),
      supabase.from('dermatology_procedures').select('*, doctors(*)').eq('patient_id', patientId).order('date', { ascending: false })
    ]);

    if (patient.error) throw patient.error;
    if (registrations.error) throw registrations.error;
    if (injections.error) throw injections.error;
    if (vaccinations.error) throw vaccinations.error;
    if (newbornVaccinations.error) throw newbornVaccinations.error;
    if (dermatologyProcedures.error) throw dermatologyProcedures.error;

    return {
      patient: patient.data,
      registrations: registrations.data || [],
      injections: injections.data || [],
      vaccinations: vaccinations.data || [],
      newbornVaccinations: newbornVaccinations.data || [],
      dermatologyProcedures: dermatologyProcedures.data || []
    };
  },

  async getPatientActivitiesByDateRange(startDate: string, endDate: string) {
    console.log('=== Date Range Query ===');
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    const [registrations, opRegistrationIds, ipAdmissions, injections, vaccinations, newbornVaccinations, dermatologyProcedures] = await Promise.all([
      supabase.from('registrations').select('*, patients(*), doctors(*)').not('status', 'in', '("CANCELLED","Cancelled")').gte('appointment_date', startDate).lte('appointment_date', endDate).order('appointment_date', { ascending: false }),
      supabase.from('registrations').select('id').not('status', 'in', '("CANCELLED","Cancelled")').eq('registration_type', 'OP').gte('appointment_date', startDate).lte('appointment_date', endDate),
      supabase.from('ip_admissions').select('*, registrations!inner(*, patients(*), doctors(*))').gte('admission_date', startDate).lte('admission_date', endDate).order('admission_date', { ascending: false }),
      supabase.from('injections').select('*, patients(*), doctors(*)').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('vaccinations').select('*, patients(*), doctors(*)').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('newborn_vaccinations').select('*, patients(*), doctors(*)').gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('dermatology_procedures').select('*, patients(*), doctors(*)').gte('date', startDate).lte('date', endDate).order('date', { ascending: false })
    ]);

    const opRegIds = opRegistrationIds.data?.map(r => r.id) || [];
    const opAdmissions = opRegIds.length > 0
      ? await supabase.from('op_admissions').select('*, registrations(*, patients(*), doctors(*))').in('registration_id', opRegIds)
      : { data: [], error: null };

    console.log('Registrations:', registrations.data?.length || 0, 'records', registrations.error);
    console.log('OP Admissions:', opAdmissions.data?.length || 0, 'records', opAdmissions.error);
    console.log('IP Admissions:', ipAdmissions.data?.length || 0, 'records', ipAdmissions.error);
    console.log('Injections:', injections.data?.length || 0, 'records', injections.error);
    console.log('Vaccinations:', vaccinations.data?.length || 0, 'records', vaccinations.error);
    console.log('N/B Vaccinations:', newbornVaccinations.data?.length || 0, 'records', newbornVaccinations.error);
    console.log('Dermatology:', dermatologyProcedures.data?.length || 0, 'records', dermatologyProcedures.error);

    const filteredIpAdmissions = (ipAdmissions.data || []).filter((admission: any) => {
      const regStatus = admission.registrations?.status;
      return regStatus !== 'CANCELLED' && regStatus !== 'Cancelled';
    });

    return {
      registrations: registrations.data || [],
      opAdmissions: opAdmissions.data || [],
      ipAdmissions: filteredIpAdmissions,
      injections: injections.data || [],
      vaccinations: vaccinations.data || [],
      newbornVaccinations: newbornVaccinations.data || [],
      dermatologyProcedures: dermatologyProcedures.data || []
    };
  },

  async getPatientsByDoctorAndDateRange(doctorId: string, startDate: string, endDate: string) {
    console.log('=== Doctor Report Query ===');
    console.log('Doctor ID:', doctorId);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    const [registrations, opRegistrationIds, ipAdmissions, injections, vaccinations, newbornVaccinations, dermatologyProcedures] = await Promise.all([
      supabase.from('registrations').select('*, patients(*), doctors(*)').not('status', 'in', '("CANCELLED","Cancelled")').eq('doctor_id', doctorId).gte('appointment_date', startDate).lte('appointment_date', endDate).order('appointment_date', { ascending: false }),
      supabase.from('registrations').select('id').not('status', 'in', '("CANCELLED","Cancelled")').eq('doctor_id', doctorId).eq('registration_type', 'OP').gte('appointment_date', startDate).lte('appointment_date', endDate),
      supabase.from('ip_admissions').select('*, registrations!inner(*, patients(*), doctors(*))').eq('registrations.doctor_id', doctorId).gte('admission_date', startDate).lte('admission_date', endDate).order('admission_date', { ascending: false }),
      supabase.from('injections').select('*, patients(*), doctors(*)').eq('doctor_id', doctorId).gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('vaccinations').select('*, patients(*), doctors(*)').eq('doctor_id', doctorId).gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('newborn_vaccinations').select('*, patients(*), doctors(*)').eq('doctor_id', doctorId).gte('date', startDate).lte('date', endDate).order('date', { ascending: false }),
      supabase.from('dermatology_procedures').select('*, patients(*), doctors(*)').eq('doctor_id', doctorId).gte('date', startDate).lte('date', endDate).order('date', { ascending: false })
    ]);

    const opRegIds = opRegistrationIds.data?.map(r => r.id) || [];
    const opAdmissions = opRegIds.length > 0
      ? await supabase.from('op_admissions').select('*, registrations(*, patients(*), doctors(*))').in('registration_id', opRegIds)
      : { data: [], error: null };

    console.log('Registrations:', registrations.data?.length || 0, 'records', registrations.error);
    console.log('OP Admissions:', opAdmissions.data?.length || 0, 'records', opAdmissions.error);
    console.log('IP Admissions:', ipAdmissions.data?.length || 0, 'records', ipAdmissions.error);
    console.log('Injections:', injections.data?.length || 0, 'records', injections.error);
    console.log('Vaccinations:', vaccinations.data?.length || 0, 'records', vaccinations.error);
    console.log('N/B Vaccinations:', newbornVaccinations.data?.length || 0, 'records', newbornVaccinations.error);
    console.log('Dermatology:', dermatologyProcedures.data?.length || 0, 'records', dermatologyProcedures.error);

    const filteredDoctorIpAdmissions = (ipAdmissions.data || []).filter((admission: any) => {
      const regStatus = admission.registrations?.status;
      return regStatus !== 'CANCELLED' && regStatus !== 'Cancelled';
    });

    return {
      registrations: registrations.data || [],
      opAdmissions: opAdmissions.data || [],
      ipAdmissions: filteredDoctorIpAdmissions,
      injections: injections.data || [],
      vaccinations: vaccinations.data || [],
      newbornVaccinations: newbornVaccinations.data || [],
      dermatologyProcedures: dermatologyProcedures.data || []
    };
  },

  async generateInjectionInvoiceNumber() {
    const { data, error } = await supabase.rpc('generate_injection_invoice_number');

    if (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }

    return data;
  },

  async createInjectionInvoice(invoiceData: {
    invoice_no: string;
    injection_id?: string;
    patient_id: string;
    doctor_id: string;
    injection_details?: string;
    payment_method: string;
    payment_amount: number;
    admission_type: string;
  }) {
    const { data, error } = await supabase
      .from('injection_invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating injection invoice:', error);
      throw error;
    }

    return data;
  },

  async checkInjectionInvoiceExists(invoiceNo: string) {
    const { data, error } = await supabase
      .from('injection_invoices')
      .select('id, invoice_no')
      .eq('invoice_no', invoiceNo)
      .maybeSingle();

    if (error) {
      console.error('Error checking invoice existence:', error);
      throw error;
    }

    return data;
  },

  async saveInjectionInvoice(invoiceData: {
    invoice_no: string;
    injection_id?: string | null;
    patient_id: string;
    doctor_id: string;
    injection_details?: string | null;
    payment_method: string;
    payment_amount: number;
    admission_type: string;
  }) {
    const { data, error } = await supabase
      .from('injection_invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Error saving injection invoice:', error);
      throw error;
    }

    return data;
  },

  async getInjectionInvoices() {
    const { data, error } = await supabase
      .from('injection_invoices')
      .select(`
        id,
        invoice_no,
        injection_id,
        patient_id,
        doctor_id,
        injection_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching injection invoices:', error);
      throw error;
    }

    return data || [];
  },

  async getInjectionInvoiceByNumber(invoiceNo: string) {
    const { data, error } = await supabase
      .from('injection_invoices')
      .select(`
        id,
        invoice_no,
        injection_id,
        patient_id,
        doctor_id,
        injection_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .eq('invoice_no', invoiceNo)
      .maybeSingle();

    if (error) {
      console.error('Error fetching injection invoice:', error);
      throw error;
    }

    return data;
  },

  async getBillingData(startDate?: string, endDate?: string, doctorId?: string) {
    const queryStartDate = startDate || '1970-01-01';
    const queryEndDate = endDate || new Date().toISOString().split('T')[0];

    const startDateTime = startDate ? istDateToUTCStart(startDate) : new Date(0).toISOString();

    // Calculate exclusive end boundary (start of next day) for services
    let endDateTimeExclusive: string;
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      endDateTimeExclusive = istDateToUTCStart(nextDayStr);
    } else {
      endDateTimeExclusive = new Date().toISOString();
    }

    console.log('=== Billing Data Query ===');
    console.log('Start Date (IST):', startDate);
    console.log('End Date (IST):', endDate);
    console.log('Doctor ID:', doctorId || 'All Doctors');
    console.log('Query Start Date:', queryStartDate);
    console.log('Query End Date:', queryEndDate);
    console.log('Start DateTime (UTC):', startDateTime);
    console.log('End DateTime Exclusive (UTC):', endDateTimeExclusive);

    // Build queries with doctor filter at database level for better performance
    let registrationsQuery = supabase
      .from('registrations')
      .select('id, patient_id, doctor_id, registration_type, payment_method, payment_amount, appointment_date, created_at, status, patients(id, patient_id_code, full_name), doctors(id, name)')
      .gte('appointment_date', queryStartDate)
      .lte('appointment_date', queryEndDate);

    console.log('UTC Timestamp Range for Services - Start:', startDateTime, 'End (exclusive):', endDateTimeExclusive);

    let injectionsQuery = supabase
      .from('injections')
      .select('id, patient_id, doctor_id, admission_type, payment_method, payment_amount, date, patients(id, patient_id_code, full_name), doctors(id, name)')
      .gte('created_at', startDateTime)
      .lt('created_at', endDateTimeExclusive);

    let vaccinationsQuery = supabase
      .from('vaccinations')
      .select('id, patient_id, doctor_id, admission_type, payment_method, payment_amount, date, invoice_no, patients(id, patient_id_code, full_name), doctors(id, name)')
      .gte('created_at', startDateTime)
      .lt('created_at', endDateTimeExclusive);

    let newbornVaccinationsQuery = supabase
      .from('newborn_vaccinations')
      .select('id, patient_id, doctor_id, admission_type, payment_method, payment_amount, date, invoice_no, patients(id, patient_id_code, full_name), doctors(id, name)')
      .gte('created_at', startDateTime)
      .lt('created_at', endDateTimeExclusive);

    let dermatologyProceduresQuery = supabase
      .from('dermatology_procedures')
      .select('id, patient_id, doctor_id, admission_type, payment_method, payment_amount, date, invoice_no, patients(id, patient_id_code, full_name), doctors(id, name)')
      .gte('created_at', startDateTime)
      .lt('created_at', endDateTimeExclusive);

    // Apply doctor filter at database level if specified
    if (doctorId) {
      registrationsQuery = registrationsQuery.eq('doctor_id', doctorId);
      injectionsQuery = injectionsQuery.eq('doctor_id', doctorId);
      vaccinationsQuery = vaccinationsQuery.eq('doctor_id', doctorId);
      newbornVaccinationsQuery = newbornVaccinationsQuery.eq('doctor_id', doctorId);
      dermatologyProceduresQuery = dermatologyProceduresQuery.eq('doctor_id', doctorId);
    }

    const [registrationsResult, injectionsResult, vaccinationsResult, newbornVaccinationsResult, dermatologyProceduresResult] = await Promise.all([
      registrationsQuery,
      injectionsQuery,
      vaccinationsQuery,
      newbornVaccinationsQuery,
      dermatologyProceduresQuery
    ]);

    // Get filtered data (already filtered by UTC timestamp range at database level)
    const registrations = registrationsResult.data || [];
    const injections = injectionsResult.data || [];
    const vaccinations = vaccinationsResult.data || [];
    const newbornVaccinations = newbornVaccinationsResult.data || [];
    const dermatologyProcedures = dermatologyProceduresResult.data || [];

    console.log('✅ Query Results (filtered by UTC timestamp):');
    console.log('   Registrations:', registrations.length);
    console.log('   Injections:', injections.length);
    console.log('   Vaccinations:', vaccinations.length);
    console.log('   Newborn Vaccinations:', newbornVaccinations.length);
    console.log('   Dermatology Procedures:', dermatologyProcedures.length);

    if (doctorId) {
      console.log('Filtered for doctor:', doctorId);
    }

    return {
      registrations,
      injections,
      vaccinations,
      newbornVaccinations,
      dermatologyProcedures
    };
  },

  async searchInvoices(searchTerm: string, serviceType?: string) {
    const results = [];

    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .or(`patient_id_code.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

    const patientIds = patients?.map(p => p.id) || [];

    if (!serviceType || serviceType === 'injection') {
      let query = supabase
        .from('injection_invoices')
        .select(`
          id,
          invoice_no,
          generated_at,
          payment_amount,
          payment_method,
          admission_type,
          patient_id,
          patients(patient_id_code, full_name)
        `);

      if (patientIds.length > 0) {
        query = query.or(`invoice_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
      } else {
        query = query.ilike('invoice_no', `%${searchTerm}%`);
      }

      const { data: injectionInvoiceData } = await query;

      if (injectionInvoiceData) {
        results.push(...injectionInvoiceData.map(d => ({
          ...d,
          date: d.generated_at,
          service_type: 'Injection'
        })));
      }
    }

    if (!serviceType || serviceType === 'vaccination') {
      let query = supabase
        .from('vaccination_invoices')
        .select(`
          id,
          invoice_no,
          generated_at,
          payment_amount,
          payment_method,
          admission_type,
          patient_id,
          patients(patient_id_code, full_name)
        `);

      if (patientIds.length > 0) {
        query = query.or(`invoice_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
      } else {
        query = query.ilike('invoice_no', `%${searchTerm}%`);
      }

      const { data: vaccinationData } = await query;

      if (vaccinationData) {
        results.push(...vaccinationData.map(d => ({
          ...d,
          date: d.generated_at,
          service_type: 'Vaccination'
        })));
      }
    }

    if (!serviceType || serviceType === 'newborn_vaccination') {
      let query = supabase
        .from('newborn_vaccination_invoices')
        .select(`
          id,
          invoice_no,
          generated_at,
          payment_amount,
          payment_method,
          admission_type,
          patient_id,
          patients(patient_id_code, full_name)
        `);

      if (patientIds.length > 0) {
        query = query.or(`invoice_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
      } else {
        query = query.ilike('invoice_no', `%${searchTerm}%`);
      }

      const { data: nbVaccinationData } = await query;

      if (nbVaccinationData) {
        results.push(...nbVaccinationData.map(d => ({
          ...d,
          date: d.generated_at,
          service_type: 'N/B Vaccination'
        })));
      }
    }

    if (!serviceType || serviceType === 'dermatology') {
      let query = supabase
        .from('dermatology_procedure_invoices')
        .select(`
          id,
          invoice_no,
          generated_at,
          payment_amount,
          payment_method,
          admission_type,
          patient_id,
          patients(patient_id_code, full_name)
        `);

      if (patientIds.length > 0) {
        query = query.or(`invoice_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
      } else {
        query = query.ilike('invoice_no', `%${searchTerm}%`);
      }

      const { data: dermatologyData } = await query;

      if (dermatologyData) {
        results.push(...dermatologyData.map(d => ({
          ...d,
          date: d.generated_at,
          service_type: 'Dermatology'
        })));
      }
    }

    return results;
  },

  async searchRegistrationsForRefund(searchTerm: string) {
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .or(`patient_id_code.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,contact_number.ilike.%${searchTerm}%`);

    if (patientError) {
      console.error('Error searching patients:', patientError);
      throw patientError;
    }

    if (!patients || patients.length === 0) {
      return [];
    }

    const patientIds = patients.map(p => p.id);

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
        cancel_reason,
        cancelled_at,
        cancelled_by,
        refund_amount,
        patients!inner(id, patient_id_code, full_name, contact_number),
        doctors(id, name)
      `)
      .in('patient_id', patientIds)
      .order('registration_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error searching registrations:', error);
      throw error;
    }

    return data;
  },

  async cancelRegistrationAndRefund(refundData: {
    registrationId: string;
    patientId: string;
    invoiceNo?: string;
    paidAmount: number;
    refundAmount: number;
    refundMethod: 'Cash' | 'UPI';
    reason: string;
    refundedBy: string;
  }) {
    const { registrationId, patientId, invoiceNo, paidAmount, refundAmount, refundMethod, reason, refundedBy } = refundData;

    const { data: updateData, error: updateError } = await supabase
      .from('registrations')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        cancelled_by: refundedBy,
        cancel_reason: reason,
        refund_amount: refundAmount
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating registration:', updateError);
      throw updateError;
    }

    const { data: refundRecord, error: refundError } = await supabase
      .from('registration_refunds')
      .insert({
        registration_id: registrationId,
        patient_id: patientId,
        invoice_no: invoiceNo,
        paid_amount: paidAmount,
        refund_amount: refundAmount,
        refund_method: refundMethod,
        reason: reason,
        refunded_at: new Date().toISOString(),
        refunded_by: refundedBy
      })
      .select()
      .single();

    if (refundError) {
      console.error('Error creating refund record:', refundError);
      throw refundError;
    }

    return { registration: updateData, refund: refundRecord };
  },

  async getRefundsByDateRange(startDate: string, endDate: string) {
    const startDateTime = istDateToUTCStart(startDate);

    // Calculate next day for exclusive end boundary (industry standard)
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    const endDateTime = istDateToUTCStart(nextDayStr);

    const { data, error } = await supabase
      .from('registration_refunds')
      .select(`
        *,
        patients(patient_id_code, full_name, contact_number),
        registrations(registration_type, appointment_date)
      `)
      .gte('refunded_at', startDateTime)
      .lt('refunded_at', endDateTime)
      .order('refunded_at', { ascending: false });

    if (error) {
      console.error('Error fetching refunds:', error);
      throw error;
    }

    return data;
  },

  async getTotalRefunds(startDate?: string, endDate?: string, doctorId?: string) {
    console.log('=== getTotalRefunds CALLED ===');
    console.log('📅 startDate:', startDate);
    console.log('📅 endDate:', endDate);
    console.log('👨‍⚕️ doctorId:', doctorId);

    // Use !inner join when doctor filter is applied to enforce relationship
    const selectClause = doctorId
      ? 'refund_amount, registration_id, refunded_at, registrations!inner(doctor_id)'
      : 'refund_amount, registration_id, refunded_at, registrations(doctor_id)';

    let query = supabase
      .from('registration_refunds')
      .select(selectClause);

    // Apply UTC timestamp-range filtering (like getRefundsByDateRange)
    if (startDate && endDate) {
      const startDateTime = istDateToUTCStart(startDate);

      // Calculate exclusive end boundary (start of next day)
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      const endDateTime = istDateToUTCStart(nextDayStr);

      console.log('🔍 UTC Timestamp Range:', startDateTime, 'to', endDateTime, '(exclusive)');

      query = query
        .gte('refunded_at', startDateTime)
        .lt('refunded_at', endDateTime);
    }

    // Apply doctor filter at database level with inner join enforcement
    if (doctorId) {
      query = query.eq('registrations.doctor_id', doctorId);
      console.log('🩺 Doctor filter applied with inner join:', doctorId);
    }

    const { data: refunds, error } = await query.order('refunded_at', { ascending: false });

    if (error) {
      console.error('❌ Refunds query error:', error);
      return 0;
    }

    console.log('✅ Filtered refunds:', refunds?.length || 0);

    if (!refunds || refunds.length === 0) {
      console.log('⚠️ No refunds found');
      return 0;
    }

    const total = refunds.reduce((sum, record) => sum + (Number(record.refund_amount) || 0), 0);

    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 TOTAL REFUNDS: ₹' + total);
    console.log('━━━━━━━━━━━━━━━━━━━━━━');

    return total;
  },

  // Vaccination Invoice Functions
  async generateVaccinationInvoiceNumber() {
    const { data, error } = await supabase.rpc('generate_vaccination_invoice_number');

    if (error) {
      console.error('Error generating vaccination invoice number:', error);
      throw error;
    }

    return data;
  },

  async saveVaccinationInvoice(invoiceData: any) {
    const { data, error } = await supabase
      .from('vaccination_invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error('Error saving vaccination invoice:', error);
      throw error;
    }

    return data;
  },

  async getVaccinationInvoices() {
    const { data, error } = await supabase
      .from('vaccination_invoices')
      .select(`
        id,
        invoice_no,
        vaccination_id,
        patient_id,
        doctor_id,
        vaccination_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching vaccination invoices:', error);
      throw error;
    }

    return data || [];
  },

  async getVaccinationInvoiceByNumber(invoiceNo: string) {
    const { data, error } = await supabase
      .from('vaccination_invoices')
      .select(`
        id,
        invoice_no,
        vaccination_id,
        patient_id,
        doctor_id,
        vaccination_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .eq('invoice_no', invoiceNo)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vaccination invoice:', error);
      throw error;
    }

    return data;
  },

  // Newborn Vaccination Invoice Functions
  async generateNewbornVaccinationInvoiceNumber() {
    const { data, error} = await supabase.rpc('generate_newborn_vaccination_invoice_number');

    if (error) {
      console.error('Error generating newborn vaccination invoice number:', error);
      throw error;
    }

    return data;
  },

  async saveNewbornVaccinationInvoice(invoiceData: any) {
    const { data, error } = await supabase
      .from('newborn_vaccination_invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error('Error saving newborn vaccination invoice:', error);
      throw error;
    }

    return data;
  },

  async getNewbornVaccinationInvoices() {
    const { data, error } = await supabase
      .from('newborn_vaccination_invoices')
      .select(`
        id,
        invoice_no,
        newborn_vaccination_id,
        patient_id,
        doctor_id,
        vaccination_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching newborn vaccination invoices:', error);
      throw error;
    }

    return data || [];
  },

  async getNewbornVaccinationInvoiceByNumber(invoiceNo: string) {
    const { data, error } = await supabase
      .from('newborn_vaccination_invoices')
      .select(`
        id,
        invoice_no,
        newborn_vaccination_id,
        patient_id,
        doctor_id,
        vaccination_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .eq('invoice_no', invoiceNo)
      .maybeSingle();

    if (error) {
      console.error('Error fetching newborn vaccination invoice:', error);
      throw error;
    }

    return data;
  },

  // Dermatology Procedure Invoice Functions
  async generateDermatologyProcedureInvoiceNumber() {
    const { data, error } = await supabase.rpc('generate_dermatology_procedure_invoice_number');

    if (error) {
      console.error('Error generating dermatology procedure invoice number:', error);
      throw error;
    }

    return data;
  },

  async saveDermatologyProcedureInvoice(invoiceData: any) {
    const { data, error } = await supabase
      .from('dermatology_procedure_invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error('Error saving dermatology procedure invoice:', error);
      throw error;
    }

    return data;
  },

  async getDermatologyProcedureInvoices() {
    const { data, error } = await supabase
      .from('dermatology_procedure_invoices')
      .select(`
        id,
        invoice_no,
        dermatology_procedure_id,
        patient_id,
        doctor_id,
        procedure_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .order('generated_at', { ascending: false});

    if (error) {
      console.error('Error fetching dermatology procedure invoices:', error);
      throw error;
    }

    return data || [];
  },

  async getDermatologyProcedureInvoiceByNumber(invoiceNo: string) {
    const { data, error } = await supabase
      .from('dermatology_procedure_invoices')
      .select(`
        id,
        invoice_no,
        dermatology_procedure_id,
        patient_id,
        doctor_id,
        procedure_details,
        payment_method,
        payment_amount,
        admission_type,
        generated_at,
        patients(id, patient_id_code, full_name, age, gender, contact_number),
        doctors(id, name)
      `)
      .eq('invoice_no', invoiceNo)
      .maybeSingle();

    if (error) {
      console.error('Error fetching dermatology procedure invoice:', error);
      throw error;
    }

    return data;
  },

  async generateDischargeBillNumber() {
    const { data, error } = await supabase.rpc('generate_discharge_bill_number');
    if (error) {
      console.error('Error generating discharge bill number:', error);
      throw error;
    }
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
       ip_admissions(admission_date, admission_time, discharge_date, room_number, admission_type, created_at, updated_at)
      `)
      .eq('patient_id', patientId)
      .eq('registration_type', 'IP')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching IP admission:', error);
      throw error;
    }
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

    if (injections.error) throw injections.error;
    if (vaccinations.error) throw vaccinations.error;
    if (newbornVaccinations.error) throw newbornVaccinations.error;
    if (dermatologyProcedures.error) throw dermatologyProcedures.error;

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

    if (error) {
      console.error('Error saving discharge bill:', error);
      throw error;
    }
    return data;
  },

  async saveDischargeBillItems(items: Omit<DischargeBillItem, 'id'>[]) {
    const { data, error } = await supabase
      .from('discharge_bill_items')
      .insert(items)
      .select();

    if (error) {
      console.error('Error saving discharge bill items:', error);
      throw error;
    }
    return data;
  },

  async updateDischargeBill(billId: string, billData: Partial<Omit<DischargeBill, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('discharge_bills')
      .update(billData)
      .eq('id', billId)
      .select()
      .single();

    if (error) {
      console.error('Error updating discharge bill:', error);
      throw error;
    }
    return data;
  },

  async deleteDischargeBillItems(billId: string) {
    const { error } = await supabase
      .from('discharge_bill_items')
      .delete()
      .eq('discharge_bill_id', billId);

    if (error) {
      console.error('Error deleting discharge bill items:', error);
      throw error;
    }
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

    if (error) {
      console.error('Error fetching discharge bill:', error);
      throw error;
    }
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

    if (error) {
      console.error('Error fetching discharge bills:', error);
      throw error;
    }
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

    if (error) {
      console.error('Error searching discharge bills:', error);
      throw error;
    }
    return data || [];
  },

  async getDischargeBillByRegistrationId(registrationId: string) {
    const { data, error } = await supabase
      .from('discharge_bills')
      .select(`
        *,
        patients(id, patient_id_code, full_name, age, gender, contact_number, blood_group),
        doctors(id, name, specialization, department),
        discharge_bill_items(*)
      `)
      .eq('registration_id', registrationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching discharge bill by registration:', error);
      throw error;
    }
    return data;
  },

  async authenticateStaffUser(username: string, password: string): Promise<StaffUser | null> {
    const { data, error } = await supabase
      .rpc('authenticate_staff_user', {
        p_username: username,
        p_password: password
      })
      .maybeSingle();

    if (error) {
      console.error('Authentication error:', error);
      throw error;
    }

    return data;
  },

  async getStaffUserById(userId: string): Promise<StaffUser | null> {
    const { data, error } = await supabase
      .from('staff_users')
      .select('id, username, full_name, role, is_active, last_login, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching staff user:', error);
      throw error;
    }

    return data;
  },

  async getAllStaffUsers() {
    const { data, error } = await supabase
      .from('staff_users')
      .select('id, username, full_name, role, is_active, last_login, created_at')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching staff users:', error);
      throw error;
    }

    return data || [];
  },

  async createStaffUser(username: string, password: string, fullName: string, role: string) {
    const { data, error } = await supabase
      .rpc('create_staff_user', {
        p_username: username,
        p_password: password,
        p_full_name: fullName,
        p_role: role
      });

    if (error) {
      console.error('Error creating staff user:', error);
      throw error;
    }

    return data;
  },

  async updateStaffUserPassword(userId: string, newPassword: string) {
    const { data, error } = await supabase
      .rpc('update_staff_user_password', {
        p_user_id: userId,
        p_new_password: newPassword
      });

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }

    return data;
  }
};