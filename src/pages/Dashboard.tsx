import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  ArrowRight,
  Building,
  User,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalPatients: number;
  todayDrGSridharPatients: number;
  todayDrHimabinduPatients: number;
  todayIPPatients: number;
  todayOPPatients: number;
  totalIPPatientsTillDate: number;
  todayIPAdmissions: number;
  todayDischargedPatients: number;
}

interface ActiveIPPatient {
  id: string;
  room_number: string;
  admission_date: string;
  patient_name: string;
  patient_id: string;
  contact_number: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayDrGSridharPatients: 0,
    todayDrHimabinduPatients: 0,
    todayIPPatients: 0,
    todayOPPatients: 0,
    totalIPPatientsTillDate: 0,
    todayIPAdmissions: 0,
    todayDischargedPatients: 0,
  });

  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayDrGSridharPatients: 0,
    todayDrHimabinduPatients: 0,
    todayIPPatients: 0,
    todayOPPatients: 0,
    totalIPPatientsTillDate: 0,
    todayIPAdmissions: 0,
    todayDischargedPatients: 0,
  });

  const [activeIPPatients, setActiveIPPatients] = useState<ActiveIPPatient[]>([]);
  const [filteredIPPatients, setFilteredIPPatients] = useState<ActiveIPPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingIPPatients, setLoadingIPPatients] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchActiveIPPatients();
  }, []);

  useEffect(() => {
    if (!loading) animateNumbers();
  }, [loading, stats]);

  const getTodayIST = () => {
    const now = new Date();
    return new Date(now.getTime() + 5.5 * 3600000)
      .toISOString()
      .split('T')[0];
  };

  const formatDateDDMMYYYY = (dateString: string) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  /* ---------------- FETCH STATS ---------------- */
  const fetchDashboardStats = async () => {
    try {
      const today = getTodayIST();

      // Total Patients = All registrations (IP + OP) till date
      const { count: totalPatients } = await supabase.from('registrations').select('*',{ count:'exact', head:true });

      const { data: doctors } = await supabase.from('doctors').select('id,name')
        .in('name',['Dr. G Sridhar','Dr. Himabindu Sridhar']);

      const drGSridharId = doctors?.find(d=>d.name==='Dr. G Sridhar')?.id;
      const drHimabinduId = doctors?.find(d=>d.name==='Dr. Himabindu Sridhar')?.id;

      let todayDrGSridhar=0,todayDrHimabindu=0;

      if(drGSridharId){
        const { count } = await supabase.from('registrations')
          .select('*',{count:'exact',head:true}).eq('doctor_id',drGSridharId).eq('appointment_date',today);
        todayDrGSridhar=count||0;
      }
      if(drHimabinduId){
        const { count } = await supabase.from('registrations')
          .select('*',{count:'exact',head:true}).eq('doctor_id',drHimabinduId).eq('appointment_date',today);
        todayDrHimabindu=count||0;
      }

      const { count: todayIP } = await supabase.from('registrations')
        .select('*',{count:'exact',head:true}).eq('registration_type','IP').eq('appointment_date',today);

      const { count: todayOP } = await supabase.from('registrations')
        .select('*',{count:'exact',head:true}).eq('registration_type','OP').eq('appointment_date',today);

      // Total IP Patients = All IP registrations till date
      const { count: totalIPTillDate } = await supabase.from('registrations')
        .select('*',{count:'exact',head:true}).eq('registration_type','IP');

      const { count: todayIPAdmissions } = await supabase.from('ip_admissions')
        .select('*',{count:'exact',head:true}).eq('admission_date',today);

      const { count: todayDischarged } = await supabase.from('discharge_patients_view')
        .select('*',{count:'exact',head:true}).eq('discharge_date',today);

      setStats({
        totalPatients: totalPatients||0,
        todayDrGSridharPatients: todayDrGSridhar,
        todayDrHimabinduPatients: todayDrHimabindu,
        todayIPPatients: todayIP||0,
        todayOPPatients: todayOP||0,
        totalIPPatientsTillDate: totalIPTillDate||0,
        todayIPAdmissions: todayIPAdmissions||0,
        todayDischargedPatients: todayDischarged||0,
      });

    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  /* ---------------- ACTIVE IP FETCH ---------------- */
  const fetchActiveIPPatients = async () => {
    try{
      setLoadingIPPatients(true);

      const { data: admission } = await supabase.from('ip_admissions')
        .select('id,room_number,admission_date,discharge_date,registration_id')
        .is('discharge_date',null).order('admission_date',{ascending:false}).limit(5);

      if(!admission?.length){ setActiveIPPatients([]); setFilteredIPPatients([]); return; }

      const regIds=admission.map(a=>a.registration_id);
      const { data: reg } = await supabase.from('registrations').select('id,patient_id').in('id',regIds);
      const patIds=reg?.map(r=>r.patient_id)||[];

      const { data: patients } = await supabase.from('patients')
        .select('id,patient_id,full_name,contact_number').in('id',patIds);

      const regMap=new Map(reg?.map(r=>[r.id,r.patient_id]));
      const patMap=new Map(patients?.map(p=>[p.id,p]));

      const result:ActiveIPPatient[]=admission.map(a=>{
        const pid=regMap.get(a.registration_id);
        const p=pid?patMap.get(pid):null;
        return{
          id:a.id, room_number:a.room_number, admission_date:a.admission_date,
          patient_name:p?.full_name||'Unknown', patient_id:p?.patient_id||'', contact_number:p?.contact_number||''
        };
      });
// Sort by room number ASC (numeric)
result.sort((a, b) =>
  Number(a.room_number.replace(/\D/g, "")) -
  Number(b.room_number.replace(/\D/g, ""))
);

      setActiveIPPatients(result);
      setFilteredIPPatients(result);
    }
    catch(e){ console.error(e); }
    finally{ setLoadingIPPatients(false); }
  };

  useEffect(()=>{
    if(!searchQuery.trim()) return setFilteredIPPatients(activeIPPatients);
    const q=searchQuery.toLowerCase();
    setFilteredIPPatients(activeIPPatients.filter(p=>(
      p.patient_name.toLowerCase().includes(q) ||
      p.patient_id.toLowerCase().includes(q) ||
      p.contact_number.includes(q)
    )));
  },[searchQuery,activeIPPatients]);

  const animateNumbers=()=>{
    const steps=30, duration=1000, interval=duration/steps;
    let s=0;
    const run=setInterval(()=>{
      s++;const p=s/steps;
      setAnimatedStats({
        totalPatients:Math.floor(stats.totalPatients*p),
        todayDrGSridharPatients:Math.floor(stats.todayDrGSridharPatients*p),
        todayDrHimabinduPatients:Math.floor(stats.todayDrHimabinduPatients*p),
        todayIPPatients:Math.floor(stats.todayIPPatients*p),
        todayOPPatients:Math.floor(stats.todayOPPatients*p),
        totalIPPatientsTillDate:Math.floor(stats.totalIPPatientsTillDate*p),
        todayIPAdmissions:Math.floor(stats.todayIPAdmissions*p),
        todayDischargedPatients:Math.floor(stats.todayDischargedPatients*p)
      });
      if(s>=steps){ clearInterval(run);setAnimatedStats(stats); }
    },interval);
  };

  const statCards=[
    {name:'Total Patients',value:animatedStats.totalPatients,icon:Users,gradient:'from-blue-500 to-blue-600'},
    {name:"Today's Dr. G Sridhar Patients (IP + OP)",value:animatedStats.todayDrGSridharPatients,icon:Stethoscope,gradient:'from-emerald-500 to-teal-600'},
    {name:"Today's Dr. Himabindu Sridhar Patients (IP + OP)",value:animatedStats.todayDrHimabinduPatients,icon:Stethoscope,gradient:'from-violet-500 to-purple-600'},
    {name:"Today's IP Patients",value:animatedStats.todayIPPatients,icon:Building,gradient:'from-rose-500 to-pink-600'},
    {name:"Today's OP Patients",value:animatedStats.todayOPPatients,icon:User,gradient:'from-amber-500 to-orange-600'},
  ];

  return (
<div className="py-6">
<div className="max-w-7xl mx-auto px-4">

{/* ---------------------- HERO ---------------------- */}
<div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-6 overflow-hidden p-8">
  <h1 className="text-3xl font-semibold text-white mb-1">Welcome to AAYUSH Hospital HMS</h1>
  <p className="text-blue-100 mb-5">Your centralized solution for efficient patient care.</p>
  <Link to="/patients" className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold">
    View Patients <ArrowRight className="inline h-4 w-4 ml-1"/>
  </Link>
</div>

{/* --------------------- METRIC CARDS --------------------- */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
{statCards.map((stat,index)=>( 
  <div key={index} className={`bg-gradient-to-br ${stat.gradient} rounded-lg p-4 text-center text-white shadow-lg`}>
    <div className="bg-white/20 p-2 rounded-md inline-block mb-2"><stat.icon className="h-5"/></div>
    <p className="text-sm opacity-90">{stat.name}</p>
    <p className="text-3xl font-bold mt-1">{stat.value}</p>
  </div>
))}
</div>

{/* ------------------- TWO BOX LAYOUT ------------------- */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

{/* ===================== FINAL UPDATED ASSIGNED BED BOX ===================== */}
<div
  className="rounded-xl shadow p-4"
  style={{ background: 'linear-gradient(to bottom right,#e7dbf4,#f3eef8,#e7dbf4)' }}
>
  <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
    Assigned Bed
  </h2>

  {/* Search bar */}
  <div className="relative mb-3">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search by Name, ID, Phone..."
      className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
    />
  </div>

  {/* Patient List */}
  <div className="space-y-2 max-h-64 overflow-y-auto">
    {loadingIPPatients ? (
      <p className="text-center text-gray-500 py-4">Loading...</p>
    ) : filteredIPPatients.length === 0 ? (
      <p className="text-center text-gray-500 py-4">
        {searchQuery ? 'No match found' : 'No active IP patients'}
      </p>
    ) : (
      [...filteredIPPatients]
        .sort((a, b) => Number(a.room_number) - Number(b.room_number))
        .map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-md shadow-sm border">
            <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              Room Number {p.room_number.replace("Room ", "")}
            </span>
            <p className="font-semibold mt-1">{p.patient_name}</p>
            <p className="text-xs text-gray-600">
              Admitted: {formatDateDDMMYYYY(p.admission_date)}
            </p>
          </div>
        ))
    )}
  </div>
</div>
{/* ===================== END UPDATED ASSIGNED BED BOX ===================== */}

{/* TODAY IP & DISCHARGE SUMMARY */}
<div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-xl p-7 text-center text-white">

<h2 className="text-3xl font-bold mb-6">Today's IP & Discharge Summary</h2>

<div className="flex flex-col items-center">

  <div className="relative w-60 h-32 mb-3">
    <svg viewBox="0 0 200 100" className="w-full h-full">
      <path d="M 20 90 A 80 80 0 0 1 180 90"
        fill="none" stroke="#F59E0B" strokeWidth="17" strokeLinecap="round"/>

      {stats.todayDischargedPatients>0 &&(()=>{
        const r=stats.todayDischargedPatients/stats.totalIPPatientsTillDate;
        const arc=251.2*r;
        return(
          <path d="M 180 90 A 80 80 0 0 1 20 90"
            fill="none" stroke="#10B981" strokeWidth="17" strokeLinecap="round"
            style={{strokeDasharray:251.2,strokeDashoffset:251.2-arc,transition:"1s"}}/>
        );
      })()}
    </svg>

    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
      <span className="text-6xl font-extrabold">{stats.totalIPPatientsTillDate}</span>
      <span className="text-lg opacity-90">Total IP Patients</span>
    </div>
  </div>

  <div className="flex gap-12 mt-2">
    <div>
      <p className="flex items-center gap-2 text-lg">
        <span className="w-3 h-3 bg-amber-400 rounded-full"></span> Admitted
      </p>
      <p className="text-4xl font-bold mt-1">{stats.todayIPAdmissions}</p>
    </div>

    <div className="border-r border-white/40 h-12"></div>

    <div>
      <p className="flex items-center gap-2 text-lg">
        <span className="w-3 h-3 bg-emerald-400 rounded-full"></span> Discharged
      </p>
      <p className="text-4xl font-bold mt-1">{stats.todayDischargedPatients}</p>
    </div>
  </div>

</div>
</div>

</div>{/* END TWO BOX */}

</div>
</div>
);
};

export default Dashboard;