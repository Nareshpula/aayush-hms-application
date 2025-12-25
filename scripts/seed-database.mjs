import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gatgyhxtgqmzwjatbmzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdGd5aHh0Z3FtendqYXRibXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MzkwMzEsImV4cCI6MjA1MTIxNTAzMX0.NFTc_RRh8cADLNNb_N856RxoaA5PWxRjEayk_eBN6CI';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🌱 Seeding Bolt-managed Database...\n');

async function seedDoctors() {
  console.log('👨‍⚕️ Adding sample doctors...');

  const doctors = [
    {
      id: '98a78477-ae6a-41c4-8938-a10cd129b112',
      name: 'Dr. G Sridhar',
      title: 'Senior Consultant in Pediatrics',
      specialization: 'Pediatrics',
      experience: '15+ years',
      phone: '+91 98765 43210',
      email: 'dr.sridhar@aayushhospital.com',
      department: 'Pediatrics',
      avatar_url: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
      availability_status: 'Available Today'
    },
    {
      id: '95b573b2-17a6-4f9c-bc56-668ac5922f02',
      name: 'Dr. Himabindu Sridhar',
      title: 'Consultant Dermatologist, Cosmetologist, Laser & Hair Transplant Surgeon',
      specialization: 'Dermatology & Cosmetology',
      experience: '12+ years',
      phone: '+91 98765 43211',
      email: 'dr.himabindu@aayushhospital.com',
      department: 'Dermatology',
      avatar_url: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
      availability_status: 'Available Today'
    }
  ];

  for (const doctor of doctors) {
    const { data: existing } = await supabase
      .from('doctors')
      .select('id')
      .eq('email', doctor.email)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  ${doctor.name} already exists`);
      continue;
    }

    const { data, error } = await supabase
      .from('doctors')
      .insert([doctor])
      .select();

    if (error) {
      console.error(`   ❌ Error adding ${doctor.name}:`, error.message);
    } else {
      console.log(`   ✅ Added ${doctor.name}`);
    }
  }
}

async function verifyDatabase() {
  console.log('\n📊 Verifying database state...\n');

  const { data: doctors, error: doctorsError } = await supabase
    .from('doctors')
    .select('*');

  if (doctorsError) {
    console.error('❌ Error fetching doctors:', doctorsError.message);
  } else {
    console.log(`✅ Doctors table: ${doctors?.length || 0} records`);
    doctors?.forEach(doc => {
      console.log(`   - ${doc.name} (${doc.specialization})`);
    });
  }

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('patient_id, full_name');

  if (patientsError) {
    console.error('❌ Error fetching patients:', patientsError.message);
  } else {
    console.log(`\n✅ Patients table: ${patients?.length || 0} records`);
    patients?.forEach(patient => {
      console.log(`   - ${patient.patient_id}: ${patient.full_name}`);
    });
  }

  const { data: registrations, error: regsError } = await supabase
    .from('registrations')
    .select('id, registration_type');

  if (regsError) {
    console.error('❌ Error fetching registrations:', regsError.message);
  } else {
    console.log(`\n✅ Registrations table: ${registrations?.length || 0} records`);
  }

  console.log('\n🎉 Database seeding complete!');
}

async function main() {
  await seedDoctors();
  await verifyDatabase();
}

main().catch(console.error);
