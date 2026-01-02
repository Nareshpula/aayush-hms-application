import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Download, User, Activity, Syringe, FileText, DollarSign, Clock, UserCheck } from 'lucide-react';
import { DatabaseService, Patient, Doctor } from '../lib/supabase';
import { getCurrentISTDate } from '../lib/dateUtils';
import { useDebounce } from '../lib/hooks';

interface ComprehensivePatientData {
  patient: Patient | null;
  registrations: any[];
  injections: any[];
  vaccinations: any[];
  newbornVaccinations: any[];
  dermatologyProcedures: any[];
}

const PatientList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'dateRange' | 'doctor'>('search');

  // Search Tab State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ComprehensivePatientData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Date Range Tab State
  const [startDate, setStartDate] = useState(getCurrentISTDate());
  const [endDate, setEndDate] = useState(getCurrentISTDate());
  const [dateRangeData, setDateRangeData] = useState<any>(null);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);

  // Doctor Filter Tab State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctorStartDate, setDoctorStartDate] = useState(getCurrentISTDate());
  const [doctorEndDate, setDoctorEndDate] = useState(getCurrentISTDate());
  const [doctorPatientData, setDoctorPatientData] = useState<any>(null);
  const [doctorLoading, setDoctorLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim().length >= 2) {
      handleSearch();
    } else if (debouncedSearchTerm.trim().length === 0) {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const loadDoctors = async () => {
    try {
      const doctorList = await DatabaseService.getDoctors();
      setDoctors(doctorList);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      const results = await DatabaseService.searchPatientByNameOrId(searchTerm);
      setSearchResults(results);
      setSelectedPatient(null);
    } catch (err) {
      console.error('Error searching patients:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    setSearchLoading(true);
    try {
      const data = await DatabaseService.getComprehensivePatientData(patientId);
      setSelectedPatient(data);
      setSearchResults([]);
    } catch (err) {
      console.error('Error loading patient details:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setDateRangeLoading(true);
    try {
      const data = await DatabaseService.getPatientActivitiesByDateRange(startDate, endDate);
      setDateRangeData(data);
    } catch (err) {
      console.error('Error fetching date range data:', err);
    } finally {
      setDateRangeLoading(false);
    }
  };

  const handleDoctorSearch = async () => {
    if (!selectedDoctor || !doctorStartDate || !doctorEndDate) {
      alert('Please select doctor and date range');
      return;
    }

    setDoctorLoading(true);
    try {
      const data = await DatabaseService.getPatientsByDoctorAndDateRange(selectedDoctor, doctorStartDate, doctorEndDate);
      setDoctorPatientData(data);
    } catch (err) {
      console.error('Error fetching doctor patient data:', err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const exportToExcel = (data: any, filename: string) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const convertToCSV = (data: any) => {
    const allRecords: any[] = [];

    if (data.opAdmissions) {
      data.opAdmissions.forEach((op: any) => {
        allRecords.push({
          Type: 'OP Admission',
          Date: op.created_at,
          PatientID: op.registrations?.patients?.patient_id_code || '',
          PatientName: op.registrations?.patients?.full_name || '',
          Doctor: op.registrations?.doctors?.name || '',
          AdmissionType: 'OP',
          PaymentMethod: op.registrations?.payment_method || '',
          Amount: op.registrations?.payment_amount || 0
        });
      });
    }

    if (data.ipAdmissions) {
      data.ipAdmissions.forEach((ip: any) => {
        allRecords.push({
          Type: 'IP Admission',
          Date: ip.admission_date,
          PatientID: ip.registrations?.patients?.patient_id_code || '',
          PatientName: ip.registrations?.patients?.full_name || '',
          Doctor: ip.registrations?.doctors?.name || '',
          AdmissionType: 'IP',
          PaymentMethod: ip.registrations?.payment_method || '',
          Amount: ip.registrations?.payment_amount || 0
        });
      });
    }

    if (data.injections) {
      data.injections.forEach((i: any) => {
        allRecords.push({
          Type: 'Injection',
          Date: i.date,
          PatientID: i.patients?.patient_id_code || '',
          PatientName: i.patients?.full_name || '',
          Doctor: i.doctors?.name || '',
          AdmissionType: i.admission_type,
          PaymentMethod: i.payment_method || '',
          Amount: i.payment_amount || 0
        });
      });
    }

    if (data.vaccinations) {
      data.vaccinations.forEach((v: any) => {
        allRecords.push({
          Type: 'Vaccination',
          Date: v.date,
          PatientID: v.patients?.patient_id_code || '',
          PatientName: v.patients?.full_name || '',
          Doctor: v.doctors?.name || '',
          AdmissionType: v.admission_type,
          PaymentMethod: v.payment_method || '',
          Amount: v.payment_amount || 0
        });
      });
    }

    if (data.newbornVaccinations) {
      data.newbornVaccinations.forEach((nv: any) => {
        allRecords.push({
          Type: 'Newborn Vaccination',
          Date: nv.date,
          PatientID: nv.patients?.patient_id_code || '',
          PatientName: nv.patients?.full_name || '',
          Doctor: nv.doctors?.name || '',
          AdmissionType: nv.admission_type,
          PaymentMethod: nv.payment_method || '',
          Amount: nv.payment_amount || 0
        });
      });
    }

    if (data.dermatologyProcedures) {
      data.dermatologyProcedures.forEach((dp: any) => {
        allRecords.push({
          Type: 'Dermatology',
          Date: dp.date,
          PatientID: dp.patients?.patient_id_code || '',
          PatientName: dp.patients?.full_name || '',
          Doctor: dp.doctors?.name || '',
          AdmissionType: dp.admission_type,
          PaymentMethod: dp.payment_method || '',
          Amount: dp.payment_amount || 0
        });
      });
    }

    if (allRecords.length === 0) return '';

    const headers = Object.keys(allRecords[0]).join(',');
    const rows = allRecords.map(record => Object.values(record).join(','));
    return [headers, ...rows].join('\n');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTimeIST = (dateString: string) => {
    const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);

    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const year = istDate.getUTCFullYear();

    let hours = istDate.getUTCHours();
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} | ${hours}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold text-white" style={{ color: '#7c3b92' }}>Patient Management System</h1>
          </div>
          <p className="text-gray-600">Search patients, view comprehensive records, and generate reports</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Patient Search</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('dateRange')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'dateRange'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date Range Report</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'doctor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Doctor-Based Report</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Patient Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Patient</h2>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter Patient Name or Patient ID (e.g., AAYUSH-2025-001)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>{searchLoading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h2>
                <div className="space-y-2">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => loadPatientDetails(patient.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{patient.full_name}</p>
                          <p className="text-sm text-gray-600">ID: {patient.patient_id_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Age: {patient.age_text ? patient.age_text : patient.age !== null ? `${patient.age} Years` : ''} | {patient.gender}</p>
                          <p className="text-sm text-gray-600">{patient.contact_number}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive Patient Profile */}
            {selectedPatient && selectedPatient.patient && (
              <div className="space-y-6">
                {/* Patient Basic Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Patient ID</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.patient_id_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.age_text ? selectedPatient.patient.age_text : selectedPatient.patient.age !== null ? `${selectedPatient.patient.age} Years` : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-lg font-medium text-gray-900">{selectedPatient.patient.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* OP/IP Visit Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium mb-1">OP Visits</p>
                      <p className="text-3xl font-bold text-green-700">
                        {selectedPatient.registrations.filter((r: any) => r.registration_type === 'OP').length}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600 font-medium mb-1">IP Admissions</p>
                      <p className="text-3xl font-bold text-red-700">
                        {selectedPatient.registrations.filter((r: any) => r.registration_type === 'IP').length}
                      </p>
                    </div>
                  </div>

                  {/* Latest Visits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latest OP Visit */}
                    {(() => {
                      const latestOP = selectedPatient.registrations.find((r: any) => r.registration_type === 'OP');
                      return latestOP ? (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-2">Latest OP</span>
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">{formatDateTimeIST(latestOP.registration_date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Doctor:</span>
                              <span className="font-medium text-gray-900">{latestOP.doctors?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(latestOP.payment_amount || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-500 text-center">No OP visits recorded</p>
                        </div>
                      );
                    })()}

                    {/* Latest IP Admission */}
                    {(() => {
                      const latestIP = selectedPatient.registrations.find((r: any) => r.registration_type === 'IP');
                      return latestIP ? (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded mr-2">Latest IP</span>
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">{formatDateTimeIST(latestIP.registration_date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Doctor:</span>
                              <span className="font-medium text-gray-900">{latestIP.doctors?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(latestIP.payment_amount || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-500 text-center">No IP admissions recorded</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Registration History */}
                {selectedPatient.registrations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Registration History ({selectedPatient.registrations.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPatient.registrations.map((reg: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(reg.registration_date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{reg.doctors?.name || 'N/A'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  reg.registration_type === 'IP' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {reg.registration_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{reg.payment_method || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(reg.payment_amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Injections */}
                {selectedPatient.injections.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-blue-600" />
                      <span>Injections ({selectedPatient.injections.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPatient.injections.map((inj: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(inj.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{inj.doctors?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{inj.injection_details || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(inj.payment_amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Vaccinations */}
                {selectedPatient.vaccinations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-green-600" />
                      <span>Vaccinations ({selectedPatient.vaccinations.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPatient.vaccinations.map((vac: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(vac.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vac.doctors?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vac.vaccination_details || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(vac.payment_amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Newborn Vaccinations */}
                {selectedPatient.newbornVaccinations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-pink-600" />
                      <span>Newborn Vaccinations ({selectedPatient.newbornVaccinations.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPatient.newbornVaccinations.map((nb: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(nb.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{nb.doctors?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{nb.vaccination_details || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(nb.payment_amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Dermatology Procedures */}
                {selectedPatient.dermatologyProcedures.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Dermatology Procedures ({selectedPatient.dermatologyProcedures.length})</span>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPatient.dermatologyProcedures.map((dp: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(dp.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{dp.doctors?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{dp.procedure_details || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(dp.payment_amount || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Date Range Report Tab */}
        {activeTab === 'dateRange' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleDateRangeSearch}
                    disabled={dateRangeLoading}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>{dateRangeLoading ? 'Loading...' : 'Search'}</span>
                  </button>
                  {dateRangeData && (
                    <button
                      onClick={() => exportToExcel(dateRangeData, 'date_range_report')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Excel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Date Range Results */}
            {dateRangeData && (
              <div className="space-y-6">
                {/* OP/IP Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
                    <p className="text-sm text-green-700 font-semibold mb-2">Total OP Visits</p>
                    <p className="text-4xl font-bold text-green-800">
                      {dateRangeData.opAdmissions?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2">Total IP Admissions</p>
                    <p className="text-4xl font-bold text-red-800">
                      {dateRangeData.ipAdmissions?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Activity Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Registrations</p>
                    <p className="text-2xl font-bold text-blue-600">{dateRangeData.registrations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Injections</p>
                    <p className="text-2xl font-bold text-blue-600">{dateRangeData.injections.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Vaccinations</p>
                    <p className="text-2xl font-bold text-green-600">{dateRangeData.vaccinations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">N/B Vaccinations</p>
                    <p className="text-2xl font-bold text-pink-600">{dateRangeData.newbornVaccinations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Dermatology</p>
                    <p className="text-2xl font-bold text-purple-600">{dateRangeData.dermatologyProcedures.length}</p>
                  </div>
                </div>

                {/* All Activities */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">All Patient Activities</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dateRangeData.injections.map((i: any, idx: number) => (
                          <tr key={`inj-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Injection</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(i.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(i.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {dateRangeData.vaccinations.map((v: any, idx: number) => (
                          <tr key={`vac-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Vaccination</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(v.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(v.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {dateRangeData.newbornVaccinations.map((nb: any, idx: number) => (
                          <tr key={`nb-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded">N/B Vaccination</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(nb.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(nb.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {dateRangeData.dermatologyProcedures.map((dp: any, idx: number) => (
                          <tr key={`dp-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Dermatology</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(dp.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(dp.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {dateRangeData.opAdmissions && dateRangeData.opAdmissions.map((op: any, idx: number) => (
                          <tr key={`op-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">OP Admission</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(op.created_at)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">OP</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(op.registrations?.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {dateRangeData.ipAdmissions && dateRangeData.ipAdmissions.map((ip: any, idx: number) => (
                          <tr key={`ip-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">IP Admission</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(ip.admission_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.doctors?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">IP</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(ip.registrations?.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {!dateRangeData.opAdmissions?.length &&
                         !dateRangeData.ipAdmissions?.length &&
                         !dateRangeData.injections?.length &&
                         !dateRangeData.vaccinations?.length &&
                         !dateRangeData.newbornVaccinations?.length &&
                         !dateRangeData.dermatologyProcedures?.length && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No patient activities found for the selected date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Doctor-Based Report Tab */}
        {activeTab === 'doctor' && (
          <div className="space-y-6">
            {/* Doctor Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor-Based Patient Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={doctorStartDate}
                    onChange={(e) => setDoctorStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={doctorEndDate}
                    onChange={(e) => setDoctorEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleDoctorSearch}
                    disabled={doctorLoading}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>{doctorLoading ? 'Loading...' : 'Search'}</span>
                  </button>
                  {doctorPatientData && (
                    <button
                      onClick={() => exportToExcel(doctorPatientData, 'doctor_patients_report')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Excel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Patient Results */}
            {doctorPatientData && (
              <div className="space-y-6">
                {/* OP/IP Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-6 border border-green-200">
                    <p className="text-sm text-green-700 font-semibold mb-2">OP Visits by Doctor</p>
                    <p className="text-4xl font-bold text-green-800">
                      {doctorPatientData.opAdmissions?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm p-6 border border-red-200">
                    <p className="text-sm text-red-700 font-semibold mb-2">IP Admissions by Doctor</p>
                    <p className="text-4xl font-bold text-red-800">
                      {doctorPatientData.ipAdmissions?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Activity Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Registrations</p>
                    <p className="text-2xl font-bold text-blue-600">{doctorPatientData.registrations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Injections</p>
                    <p className="text-2xl font-bold text-blue-600">{doctorPatientData.injections.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Vaccinations</p>
                    <p className="text-2xl font-bold text-green-600">{doctorPatientData.vaccinations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">N/B Vaccinations</p>
                    <p className="text-2xl font-bold text-pink-600">{doctorPatientData.newbornVaccinations.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-sm text-gray-600">Dermatology</p>
                    <p className="text-2xl font-bold text-purple-600">{doctorPatientData.dermatologyProcedures.length}</p>
                  </div>
                </div>

                {/* Doctor's Patients Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Patients Treated by {doctors.find(d => d.id === selectedDoctor)?.name || 'Doctor'}</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {doctorPatientData.injections.map((i: any, idx: number) => (
                          <tr key={`doc-inj-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Injection</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(i.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{i.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(i.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {doctorPatientData.vaccinations.map((v: any, idx: number) => (
                          <tr key={`doc-vac-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Vaccination</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(v.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(v.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {doctorPatientData.newbornVaccinations.map((nb: any, idx: number) => (
                          <tr key={`doc-nb-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded">N/B Vaccination</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(nb.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{nb.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(nb.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {doctorPatientData.dermatologyProcedures.map((dp: any, idx: number) => (
                          <tr key={`doc-dp-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Dermatology</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(dp.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.admission_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dp.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(dp.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {doctorPatientData.opAdmissions && doctorPatientData.opAdmissions.map((op: any, idx: number) => (
                          <tr key={`doc-op-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">OP Admission</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(op.created_at)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">OP</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{op.registrations?.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(op.registrations?.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {doctorPatientData.ipAdmissions && doctorPatientData.ipAdmissions.map((ip: any, idx: number) => (
                          <tr key={`doc-ip-${idx}`}>
                            <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">IP Admission</span></td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(ip.admission_date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.patients?.patient_id_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.patients?.full_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">IP</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ip.registrations?.payment_method || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(ip.registrations?.payment_amount || 0)}</td>
                          </tr>
                        ))}
                        {!doctorPatientData.opAdmissions?.length &&
                         !doctorPatientData.ipAdmissions?.length &&
                         !doctorPatientData.injections?.length &&
                         !doctorPatientData.vaccinations?.length &&
                         !doctorPatientData.newbornVaccinations?.length &&
                         !doctorPatientData.dermatologyProcedures?.length && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No patient activities found for this doctor in the selected date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
