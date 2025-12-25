import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Edit2, CheckCircle, X, Plus, UserPlus, DollarSign, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { releaseIPRoom } from '../lib/supabase';
import { getCurrentISTDate } from '../lib/dateUtils';

interface DischargePatient {
  id: string;
  bill_no: string;
  section: string;
  patient_id: string;
  registration_id: string;
  doctor_id: string;
  admission_date: string;
  discharge_date: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  refundable_amount: number;
  ip_joining_amount: number;
  status: string;
  created_at: string;
  payment_method?: string;
  notes?: string;
  patient: {
    patient_id: string;
    full_name: string;
    age: number;
    gender: string;
    contact_number: string;
    address: string;
  };
  doctor: {
    name: string;
  };
  registration: {
    registration_type: string;
    payment_method: string;
  };
}

interface Registration {
  id: string;
  patient_id: string;
  doctor_id: string;
  registration_type: string;
  payment_method: string;
  payment_amount: number;
  created_at: string;
  patient: {
    patient_id: string;
    full_name: string;
    age: number;
    gender: string;
    contact_number: string;
    address: string;
  };
  doctor: {
    name: string;
    department: string;
  };
}

const DischargePatients: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pediatrics' | 'Dermatology'>('Pediatrics');
  const [dischargeRecords, setDischargeRecords] = useState<DischargePatient[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DischargePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState(getCurrentISTDate());
  const [dateTo, setDateTo] = useState(getCurrentISTDate());
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [previewBill, setPreviewBill] = useState<DischargePatient | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DischargePatient | null>(null);
  const [availableRegistrations, setAvailableRegistrations] = useState<Registration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    admission_date: '',
    discharge_date: '',
    ip_joining_amount: '',
    total_amount: '',
    paid_amount: '',
    outstanding_amount: '',
    refundable_amount: '',
    payment_method: 'Cash',
    notes: ''
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate department-wise discharged amounts
  const departmentAmounts = useMemo(() => {
    const calculateAmount = (department: 'Pediatrics' | 'Dermatology') => {
      return dischargeRecords
        .filter(record =>
          record.section === department &&
          record.status === 'finalized' &&
          (!dateFrom || record.discharge_date >= dateFrom) &&
          (!dateTo || record.discharge_date <= dateTo)
        )
        .reduce((sum, record) => sum + (record.paid_amount || 0), 0);
    };

    return {
      pediatrics: calculateAmount('Pediatrics'),
      dermatology: calculateAmount('Dermatology')
    };
  }, [dischargeRecords, dateFrom, dateTo]);

  useEffect(() => {
    fetchDoctors();
    fetchDischargeRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [activeTab, dischargeRecords, searchQuery, dateFrom, dateTo, selectedDoctor, selectedStatus]);

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('id, name, department')
      .order('name');
    setDoctors(data || []);
  };

  const fetchDischargeRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discharge_bills')
        .select(`
          *,
          patient:patients(patient_id, full_name, age, gender, contact_number, address),
          doctor:doctors(name),
          registration:registrations(registration_type, payment_method)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDischargeRecords(data || []);
    } catch (error) {
      console.error('Error fetching discharge records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRegistrations = async () => {
    try {
      const department = activeTab;

      const { data: allRegistrations, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          patient_id,
          doctor_id,
          registration_type,
          payment_method,
          payment_amount,
          created_at,
          patient:patients(patient_id, full_name, age, gender, contact_number, address),
          doctor:doctors(name, department)
        `)
        .eq('registration_type', 'IP')
        .order('created_at', { ascending: false });

      if (regError) throw regError;

      const { data: existingDischarges, error: disError } = await supabase
        .from('discharge_bills')
        .select('registration_id');

      if (disError) throw disError;

      const { data: cancelledRefunds, error: cancelError } = await supabase
        .from('registration_refunds')
        .select('registration_id');

      if (cancelError) throw cancelError;

      const dischargedIds = new Set(existingDischarges?.map(d => d.registration_id) || []);
      const cancelledIds = new Set(cancelledRefunds?.map(c => c.registration_id) || []);

      const available = (allRegistrations || []).filter(
        reg =>
          !dischargedIds.has(reg.id) &&
          !cancelledIds.has(reg.id) &&
          reg.doctor?.department === department
      );

      setAvailableRegistrations(available);
    } catch (error) {
      console.error('Error fetching available registrations:', error);
      alert('Error loading available registrations');
    }
  };

  const filterRecords = () => {
    let filtered = dischargeRecords.filter(record => record.section === activeTab);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.patient?.patient_id?.toLowerCase().includes(query) ||
        record.patient?.full_name?.toLowerCase().includes(query) ||
        record.patient?.contact_number?.includes(query) ||
        record.bill_no?.toLowerCase().includes(query)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(record => record.discharge_date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(record => record.discharge_date <= dateTo);
    }

    if (selectedDoctor) {
      filtered = filtered.filter(record => record.doctor_id === selectedDoctor);
    }

    if (selectedStatus) {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    setFilteredRecords(filtered);
  };

  const handleViewBill = (record: DischargePatient) => {
    setPreviewBill(record);
    setShowPreview(true);
  };

  const handlePrintBill = (record: DischargePatient) => {
    setPreviewBill(record);
    setShowPreview(true);
    setTimeout(() => window.print(), 500);
  };

  const handleFinalize = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('discharge_bills')
        .update({ status: 'finalized' })
        .eq('id', recordId);

      if (error) throw error;
      fetchDischargeRecords();
    } catch (error) {
      console.error('Error finalizing record:', error);
      alert('Failed to finalize record');
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setEditingRecord(null);
    setSelectedRegistration(null);
    setFormData({
      admission_date: '',
      discharge_date: new Date().toISOString().split('T')[0],
      ip_joining_amount: '',
      total_amount: '',
      paid_amount: '',
      outstanding_amount: '0',
      refundable_amount: '0',
      payment_method: 'Cash',
      notes: ''
    });
    fetchAvailableRegistrations();
  };

  const handleEditRecord = (record: DischargePatient) => {
    setEditingRecord(record);
    setShowAddModal(true);
    setSelectedRegistration({
      id: record.registration_id,
      patient_id: record.patient_id,
      doctor_id: record.doctor_id,
      registration_type: record.registration?.registration_type || 'IP',
      payment_method: record.registration?.payment_method || 'Cash',
      payment_amount: record.ip_joining_amount || 0,
      created_at: record.admission_date,
      patient: record.patient,
      doctor: record.doctor
    } as Registration);
    setFormData({
      admission_date: record.admission_date,
      discharge_date: record.discharge_date,
      ip_joining_amount: record.ip_joining_amount?.toFixed(2) || '0.00',
      total_amount: record.total_amount.toFixed(2),
      paid_amount: record.paid_amount.toFixed(2),
      outstanding_amount: record.outstanding_amount.toFixed(2),
      refundable_amount: record.refundable_amount.toFixed(2),
      payment_method: record.payment_method || 'Cash',
      notes: record.notes || ''
    });
  };

  const handleSelectRegistration = (registration: Registration) => {
    setSelectedRegistration(registration);
    setFormData(prev => ({
      ...prev,
      admission_date: registration.created_at.split('T')[0],
      discharge_date: new Date().toISOString().split('T')[0],
      ip_joining_amount: registration.payment_amount.toFixed(2)
    }));
  };

  const calculateAmounts = (total: string, paid: string) => {
    const totalNum = parseFloat(total) || 0;
    const paidNum = parseFloat(paid) || 0;
    const outstanding = Math.max(0, totalNum - paidNum);
    const refundable = Math.max(0, paidNum - totalNum);

    setFormData(prev => ({
      ...prev,
      total_amount: total,
      paid_amount: paid,
      outstanding_amount: outstanding.toFixed(2),
      refundable_amount: refundable.toFixed(2)
    }));
  };

  const handleSaveDischarge = async () => {
    if (!selectedRegistration) {
      alert('Please select a registration');
      return;
    }

    if (!formData.admission_date || !formData.discharge_date) {
      alert('Please enter admission and discharge dates');
      return;
    }

    if (!formData.total_amount || !formData.paid_amount) {
      alert('Please enter billing amounts');
      return;
    }

    try {
      if (editingRecord) {
        // Update existing record
        const updateData = {
          admission_date: formData.admission_date,
          discharge_date: formData.discharge_date,
          ip_joining_amount: parseFloat(formData.ip_joining_amount) || 0,
          total_amount: parseFloat(formData.total_amount),
          paid_amount: parseFloat(formData.paid_amount),
          outstanding_amount: parseFloat(formData.outstanding_amount),
          refundable_amount: parseFloat(formData.refundable_amount),
          payment_method: formData.payment_method,
          notes: formData.notes
        };

        const { error } = await supabase
          .from('discharge_bills')
          .update(updateData)
          .eq('id', editingRecord.id);

        if (error) throw error;

        setSuccessMessage('Discharge record updated successfully!');
        setShowSuccessToast(true);
        setShowAddModal(false);
        setEditingRecord(null);
        fetchDischargeRecords();
} else {
  // STEP 1: Check if discharge bill already exists for this registration
  const { data: existingBill, error: fetchError } = await supabase
    .from('discharge_bills')
    .select('id, bill_no')
    .eq('registration_id', selectedRegistration.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no rows found (safe to ignore)
    throw fetchError;
  }

  // STEP 2: If exists → UPDATE (reuse bill_no)
  if (existingBill) {
    const { error: updateError } = await supabase
      .from('discharge_bills')
      .update({
        admission_date: formData.admission_date,
        discharge_date: formData.discharge_date,
        ip_joining_amount: parseFloat(formData.ip_joining_amount) || 0,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount),
        outstanding_amount: parseFloat(formData.outstanding_amount),
        refundable_amount: parseFloat(formData.refundable_amount),
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: 'finalized'
      })
      .eq('id', existingBill.id);

    if (updateError) throw updateError;

    setSuccessMessage(`Discharge bill updated successfully! (Bill No: ${existingBill.bill_no})`);
  } 
  // STEP 3: If not exists → CREATE (generate bill number ONCE)
  else {
    const { data: billNumber, error: billError } = await supabase
      .rpc('generate_discharge_bill_number', { p_section: activeTab });

    if (billError) throw billError;

    const { error: insertError } = await supabase
      .from('discharge_bills')
      .insert([{
        bill_no: billNumber,
        section: activeTab,
        patient_id: selectedRegistration.patient_id,
        registration_id: selectedRegistration.id,
        doctor_id: selectedRegistration.doctor_id,
        admission_date: formData.admission_date,
        discharge_date: formData.discharge_date,
        ip_joining_amount: parseFloat(formData.ip_joining_amount) || 0,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount),
        outstanding_amount: parseFloat(formData.outstanding_amount),
        refundable_amount: parseFloat(formData.refundable_amount),
        payment_method: formData.payment_method,
        status: 'finalized',
        notes: formData.notes
      }]);

    if (insertError) throw insertError;

    setSuccessMessage(`Discharge bill created successfully! (Bill No: ${billNumber})`);
  }

  setShowSuccessToast(true);
  setShowAddModal(false);
  fetchDischargeRecords();
} 
        // 🔑 RELEASE IP ROOM — SINGLE, CORRECT PLACE
  if (selectedRegistration.registration_type === 'IP') {
    await releaseIPRoom(
      selectedRegistration.id,
      formData.discharge_date
    );
  }
    } catch (error: any) {
      console.error('Error saving discharge:', error);
      if (error.message?.includes('already exists')) {
        alert('This patient has already been discharged. Cannot create duplicate discharge record.');
      } else {
        alert('Failed to save discharge record: ' + error.message);
      }
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Bill No', 'Patient ID', 'Patient Name', 'Age/Gender', 'Contact', 'Admission Type', 'Doctor', 'Admission Date', 'Discharge Date', 'Total Bill', 'Paid', 'Outstanding', 'Refund', 'Status'].join(','),
      ...filteredRecords.map(record =>
        [
          record.bill_no,
          record.patient?.patient_id || '',
          record.patient?.full_name || '',
          `${record.patient?.age || ''}/${record.patient?.gender || ''}`,
          record.patient?.contact_number || '',
          record.registration?.registration_type || '',
          record.doctor?.name || '',
          record.admission_date,
          record.discharge_date,
          record.total_amount,
          record.paid_amount,
          record.outstanding_amount,
          record.refundable_amount,
          record.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge_patients_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'finalized': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      'finalized': 'Discharged',
      'draft': 'Pending Final Bill'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ color: '#7c3b92' }}>Discharge Patients</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage discharged patients for pediatrics and dermatology departments
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Discharge Entry
          </button>
        </div>

        {/* Department-wise Discharged Amount Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Pediatrics Discharged Amount</h3>
              <DollarSign className="h-6 w-6 opacity-80" />
            </div>
            <p className="text-3xl font-bold">₹{departmentAmounts.pediatrics.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-2">
              {dateFrom === dateTo
                ? `Today's discharged paid amount`
                : `${dateFrom} to ${dateTo}`}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Dermatology Discharged Amount</h3>
              <DollarSign className="h-6 w-6 opacity-80" />
            </div>
            <p className="text-3xl font-bold">₹{departmentAmounts.dermatology.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-2">
              {dateFrom === dateTo
                ? `Today's discharged paid amount`
                : `${dateFrom} to ${dateTo}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['Pediatrics', 'Dermatology'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'Pediatrics' | 'Dermatology')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab} Discharged Patients
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Patient ID, Name, Phone, or Bill No"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="form-input"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="form-input"
              />

              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="form-input"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-input"
              >
                <option value="">All Status</option>
                <option value="draft">Pending Final Bill</option>
                <option value="finalized">Discharged</option>
              </select>

              <button
                onClick={exportToExcel}
                className="btn-secondary flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading discharge records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No discharge records found for {activeTab}</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Discharge Entry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.bill_no}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="font-medium">{record.patient?.full_name || 'N/A'}</div>
                        <div className="text-gray-500">{record.patient?.patient_id || 'N/A'}</div>
                        <div className="text-gray-500">{record.patient?.age || 0}y / {record.patient?.gender || 'N/A'}</div>
                        <div className="text-gray-500">{record.patient?.contact_number || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          record.registration?.registration_type === 'IP'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.registration?.registration_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.doctor?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div>Adm: {new Date(record.admission_date).toLocaleDateString('en-IN')}</div>
                        <div>Dis: {new Date(record.discharge_date).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>Total: ₹{record.total_amount.toFixed(2)}</div>
                        <div className="text-green-600">Paid: ₹{record.paid_amount.toFixed(2)}</div>
                        {record.outstanding_amount > 0 && (
                          <div className="text-red-600">Due: ₹{record.outstanding_amount.toFixed(2)}</div>
                        )}
                        {record.refundable_amount > 0 && (
                          <div className="text-blue-600">Refund: ₹{record.refundable_amount.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Edit Discharge Entry"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPreview && previewBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Discharge Bill Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="border-2 border-gray-300 rounded-lg p-8 bg-white">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">AAYUSH Hospital</h1>
                  <p className="text-sm text-gray-600">Discharge Bill</p>
                  <p className="text-xs text-gray-500 mt-1">Bill No: {previewBill.bill_no}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Patient Information</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Patient ID:</span> {previewBill.patient?.patient_id || 'N/A'}</p>
                      <p><span className="font-medium">Name:</span> {previewBill.patient?.full_name || 'N/A'}</p>
                      <p><span className="font-medium">Age/Gender:</span> {previewBill.patient?.age || 0}y / {previewBill.patient?.gender || 'N/A'}</p>
                      <p><span className="font-medium">Contact:</span> {previewBill.patient?.contact_number || 'N/A'}</p>
                      <p><span className="font-medium">Address:</span> {previewBill.patient?.address || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Admission Details</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Department:</span> {previewBill.section}</p>
                      <p><span className="font-medium">Admission Type:</span> {previewBill.registration?.registration_type || 'N/A'}</p>
                      <p><span className="font-medium">Doctor:</span> {previewBill.doctor?.name || 'N/A'}</p>
                      <p><span className="font-medium">Admission Date:</span> {new Date(previewBill.admission_date).toLocaleDateString('en-IN')}</p>
                      <p><span className="font-medium">Discharge Date:</span> {new Date(previewBill.discharge_date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Billing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Bill Amount:</span>
                      <span className="font-semibold">₹{previewBill.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">₹{previewBill.paid_amount.toFixed(2)}</span>
                    </div>
                    {previewBill.outstanding_amount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Outstanding Amount:</span>
                        <span className="font-semibold">₹{previewBill.outstanding_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {previewBill.refundable_amount > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Refundable Amount:</span>
                        <span className="font-semibold">₹{previewBill.refundable_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-medium">Payment Method:</span>
                      <span className="font-semibold">{previewBill.payment_method || previewBill.registration?.payment_method || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {previewBill.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{previewBill.notes}</p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
                  <p>Generated on: {new Date(previewBill.created_at).toLocaleString('en-IN')}</p>
                  <p className="mt-2">This is a computer generated bill and does not require signature</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Bill
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRecord ? 'Edit Discharge Entry' : 'Add New Discharge Entry'} - {activeTab}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {!selectedRegistration && !editingRecord ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Select Patient Registration (Active IP patients in {activeTab} without discharge)
                  </h3>
                  {availableRegistrations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active IP registrations available for {activeTab}</p>
                      <p className="text-sm text-gray-400 mt-2">All IP patients have been discharged or cancelled</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableRegistrations.map((reg) => (
                        <div
                          key={reg.id}
                          onClick={() => handleSelectRegistration(reg)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{reg.patient?.full_name}</p>
                              <p className="text-sm text-gray-600">ID: {reg.patient?.patient_id}</p>
                              <p className="text-sm text-gray-600">{reg.patient?.age}y / {reg.patient?.gender} • {reg.patient?.contact_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{reg.doctor?.name}</p>
                              <p className="text-xs text-gray-500">{reg.registration_type}</p>
                              <p className="text-xs text-gray-500">{new Date(reg.created_at).toLocaleDateString('en-IN')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Patient</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Name:</span> {selectedRegistration.patient?.full_name}</p>
                        <p><span className="font-medium">ID:</span> {selectedRegistration.patient?.patient_id}</p>
                        <p><span className="font-medium">Age/Gender:</span> {selectedRegistration.patient?.age}y / {selectedRegistration.patient?.gender}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Doctor:</span> {selectedRegistration.doctor?.name}</p>
                        <p><span className="font-medium">Type:</span> {selectedRegistration.registration_type}</p>
                        <p><span className="font-medium">Contact:</span> {selectedRegistration.patient?.contact_number}</p>
                      </div>
                    </div>
                    {!editingRecord && (
                      <button
                        onClick={() => setSelectedRegistration(null)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Change Patient
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admission Date *
                      </label>
                      <input
                        type="date"
                        value={formData.admission_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
                        className="form-input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discharge Date *
                      </label>
                      <input
                        type="date"
                        value={formData.discharge_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, discharge_date: e.target.value }))}
                        className="form-input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IP Joining Amount (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.ip_joining_amount}
                        className="form-input w-full bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Bill Amount (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        onChange={(e) => calculateAmounts(e.target.value, formData.paid_amount)}
                        className="form-input w-full"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paid Amount (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.paid_amount}
                        onChange={(e) => calculateAmounts(formData.total_amount, e.target.value)}
                        className="form-input w-full"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outstanding Amount (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.outstanding_amount}
                        className="form-input w-full bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refundable Amount (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.refundable_amount}
                        className="form-input w-full bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="form-input w-full"
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="form-input w-full"
                      rows={3}
                      placeholder="Add any additional notes about the discharge..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingRecord(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDischarge}
                      className="btn-primary flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {editingRecord ? 'Update Discharge Record' : 'Save Discharge Record'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 flex items-start gap-3 p-4 min-w-[320px] max-w-md" style={{ borderLeftColor: '#834693' }}>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#834693' }}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-600">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargePatients;