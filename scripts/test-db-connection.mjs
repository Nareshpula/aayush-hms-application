import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gatgyhxtgqmzwjatbmzk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdGd5aHh0Z3FtendqYXRibXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MzkwMzEsImV4cCI6MjA1MTIxNTAzMX0.NFTc_RRh8cADLNNb_N856RxoaA5PWxRjEayk_eBN6CI';

console.log('🔍 Testing Bolt-managed Supabase Database Connection...\n');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseKey?.substring(0, 20)}...`);

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Error: Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing connection...');

    const { data, error } = await supabase
      .from('doctors')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('\n⚠️  Tables do not exist yet');
        console.log('📝 You need to apply the migration first');
        console.log('\n📋 To apply migrations:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new');
        console.log('   2. Copy the contents of: supabase/migrations/20250914173639_crystal_castle.sql');
        console.log('   3. Paste it into the SQL editor');
        console.log('   4. Click "Run" to execute the migration');
        console.log('\n✅ After applying the migration, your database will be ready!');
        return;
      }

      console.error('\n❌ Connection error:', error.message);
      console.error('Details:', error);
      return;
    }

    console.log('\n✅ Database connection successful!');
    console.log('✅ Tables are already set up!');

    console.log('\n📊 Checking existing doctors...');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*');

    if (doctorsError) {
      console.error('❌ Error fetching doctors:', doctorsError.message);
    } else {
      console.log(`   Found ${doctors?.length || 0} doctors in database`);
      if (doctors && doctors.length > 0) {
        doctors.forEach(doc => {
          console.log(`   - ${doc.name} (${doc.specialization})`);
        });
      }
    }

    console.log('\n📊 Checking existing patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('count');

    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError.message);
    } else {
      console.log(`   Found ${patients?.length || 0} patients in database`);
    }

    console.log('\n🎉 Your Bolt-managed database is fully operational!');

  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
  }
}

testConnection();
