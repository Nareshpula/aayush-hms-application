import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Search, Filter, CreditCard, Users, FileText } from 'lucide-react';
import { DatabaseService, Doctor } from '../lib/supabase';
import { getCurrentISTDate } from '../lib/dateUtils';
import { useDebounce } from '../lib/hooks';
import InjectionInvoicePreview from '../components/InjectionInvoicePreview';
import VaccinationInvoicePreview from '../components/VaccinationInvoicePreview';
import NewbornVaccinationInvoicePreview from '../components/NewbornVaccinationInvoicePreview';
import DermatologyProcedureInvoicePreview from '../components/DermatologyProcedureInvoicePreview';

const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctor' | 'invoices' | 'eod'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [refundTotal, setRefundTotal] = useState<number>(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(getCurrentISTDate());
  const [endDate, setEndDate] = useState<string>(getCurrentISTDate());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<'injection' | 'vaccination' | 'newborn_vaccination' | 'dermatology' | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    loadDoctors();
    loadBillingData();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.trim().length >= 2) {
      handleSearch();
    } else if (debouncedSearchTerm.trim().length === 0) {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, serviceFilter]);

  const loadDoctors = async () => {
    try {
      const doctorList = await DatabaseService.getDoctors();
      setDoctors(doctorList);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadBillingData = async (doctor?: string, start?: string, end?: string) => {
    setLoading(true);
    try {
      const [data, refunds] = await Promise.all([
        DatabaseService.getBillingData(start || startDate, end || endDate, doctor),
        DatabaseService.getTotalRefunds(start || startDate, end || endDate, doctor)
      ]);
      setBillingData(data);
      setRefundTotal(refunds);
    } catch (err) {
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const results = await DatabaseService.searchInvoices(searchTerm, serviceFilter);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInjectionInvoice = async (invoiceNo: string) => {
    try {
      const invoice = await DatabaseService.getInjectionInvoiceByNumber(invoiceNo);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      const dateObj = new Date(invoice.generated_at);
      const dateStr = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const invoiceData = {
        invoiceNo: invoice.invoice_no,
        date: dateStr,
        time: timeStr,
        patientId: invoice.patients?.patient_id_code || 'N/A',
        patientName: invoice.patients?.full_name || 'N/A',
        age: `${invoice.patients?.age || 'N/A'} Years`,
        gender: invoice.patients?.gender || 'N/A',
        contactNumber: invoice.patients?.contact_number || 'N/A',
        admissionType: invoice.admission_type,
        doctorName: invoice.doctors?.name || 'N/A',
        injectionDetails: invoice.injection_details || 'N/A',
        paymentMethod: invoice.payment_method,
        amount: invoice.payment_amount,
        patient_id: invoice.patient_id,
        doctor_id: invoice.doctor_id,
        injection_id: invoice.injection_id
      };

      setSelectedInvoiceData(invoiceData);
      setSelectedInvoiceType('injection');
      setShowInvoicePreview(true);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      alert('Failed to load invoice');
    }
  };

  const handleViewVaccinationInvoice = async (invoiceNo: string) => {
    try {
      const invoice = await DatabaseService.getVaccinationInvoiceByNumber(invoiceNo);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      const dateObj = new Date(invoice.generated_at);
      const dateStr = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const invoiceData = {
        invoiceNo: invoice.invoice_no,
        date: dateStr,
        time: timeStr,
        patientId: invoice.patients?.patient_id_code || 'N/A',
        patientName: invoice.patients?.full_name || 'N/A',
        age: `${invoice.patients?.age || 'N/A'} Years`,
        gender: invoice.patients?.gender || 'N/A',
        contactNumber: invoice.patients?.contact_number || 'N/A',
        admissionType: invoice.admission_type,
        doctorName: invoice.doctors?.name || 'N/A',
        vaccinationDetails: invoice.vaccination_details || 'N/A',
        paymentMethod: invoice.payment_method,
        amount: invoice.payment_amount,
        patient_id: invoice.patient_id,
        doctor_id: invoice.doctor_id,
        vaccination_id: invoice.vaccination_id
      };

      setSelectedInvoiceData(invoiceData);
      setSelectedInvoiceType('vaccination');
      setShowInvoicePreview(true);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      alert('Failed to load invoice');
    }
  };

  const handleViewNewbornVaccinationInvoice = async (invoiceNo: string) => {
    try {
      const invoice = await DatabaseService.getNewbornVaccinationInvoiceByNumber(invoiceNo);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      const dateObj = new Date(invoice.generated_at);
      const dateStr = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const invoiceData = {
        invoiceNo: invoice.invoice_no,
        date: dateStr,
        time: timeStr,
        patientId: invoice.patients?.patient_id_code || 'N/A',
        patientName: invoice.patients?.full_name || 'N/A',
        age: `${invoice.patients?.age || 'N/A'} Years`,
        gender: invoice.patients?.gender || 'N/A',
        contactNumber: invoice.patients?.contact_number || 'N/A',
        admissionType: invoice.admission_type,
        doctorName: invoice.doctors?.name || 'N/A',
        vaccinationDetails: invoice.vaccination_details || 'N/A',
        paymentMethod: invoice.payment_method,
        amount: invoice.payment_amount,
        patient_id: invoice.patient_id,
        doctor_id: invoice.doctor_id,
        newborn_vaccination_id: invoice.newborn_vaccination_id
      };

      setSelectedInvoiceData(invoiceData);
      setSelectedInvoiceType('newborn_vaccination');
      setShowInvoicePreview(true);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      alert('Failed to load invoice');
    }
  };

  const handleViewDermatologyProcedureInvoice = async (invoiceNo: string) => {
    try {
      const invoice = await DatabaseService.getDermatologyProcedureInvoiceByNumber(invoiceNo);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      const dateObj = new Date(invoice.generated_at);
      const dateStr = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const invoiceData = {
        invoiceNo: invoice.invoice_no,
        date: dateStr,
        time: timeStr,
        patientId: invoice.patients?.patient_id_code || 'N/A',
        patientName: invoice.patients?.full_name || 'N/A',
        age: `${invoice.patients?.age || 'N/A'} Years`,
        gender: invoice.patients?.gender || 'N/A',
        contactNumber: invoice.patients?.contact_number || 'N/A',
        admissionType: invoice.admission_type,
        doctorName: invoice.doctors?.name || 'N/A',
        procedureDetails: invoice.procedure_details || 'N/A',
        paymentMethod: invoice.payment_method,
        amount: invoice.payment_amount,
        patient_id: invoice.patient_id,
        doctor_id: invoice.doctor_id,
        dermatology_procedure_id: invoice.dermatology_procedure_id
      };

      setSelectedInvoiceData(invoiceData);
      setSelectedInvoiceType('dermatology');
      setShowInvoicePreview(true);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      alert('Failed to load invoice');
    }
  };

  const calculateRevenue = (data: any) => {
    if (!data) return { total: 0, cash: 0, upi: 0, registration: 0, injection: 0, vaccination: 0, nbVaccination: 0, dermatology: 0 };

    const reg = data.registrations || [];
    const inj = data.injections || [];
    const vac = data.vaccinations || [];
    const nbVac = data.newbornVaccinations || [];
    const derm = data.dermatologyProcedures || [];

    const registrationRevenue = reg.reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0);
    const injectionRevenue = inj.reduce((sum: number, i: any) => sum + (i.payment_amount || 0), 0);
    const vaccinationRevenue = vac.reduce((sum: number, v: any) => sum + (v.payment_amount || 0), 0);
    const nbVaccinationRevenue = nbVac.reduce((sum: number, n: any) => sum + (n.payment_amount || 0), 0);
    const dermatologyRevenue = derm.reduce((sum: number, d: any) => sum + (d.payment_amount || 0), 0);

    const totalRevenue = registrationRevenue + injectionRevenue + vaccinationRevenue + nbVaccinationRevenue + dermatologyRevenue;

    const allRecords = [...reg, ...inj, ...vac, ...nbVac, ...derm];
    const cashRevenue = allRecords.filter((r: any) => r.payment_method === 'Cash').reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0);
    const upiRevenue = allRecords.filter((r: any) => r.payment_method === 'UPI').reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0);

    return {
      total: totalRevenue,
      cash: cashRevenue,
      upi: upiRevenue,
      registration: registrationRevenue,
      injection: injectionRevenue,
      vaccination: vaccinationRevenue,
      nbVaccination: nbVaccinationRevenue,
      dermatology: dermatologyRevenue
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const revenue = useMemo(() => calculateRevenue(billingData), [billingData]);

  const exportToExcel = (data: any, filename: string) => {
    if (!data) {
      alert('No data available to export');
      return;
    }

    const csvRows: string[] = [];

    const isDoctorReport = filename.includes('doctor-wise');
    const isEODReport = filename.includes('EOD');

    if (isEODReport) {
      csvRows.push('End-of-Day Report');
      csvRows.push(`Date: ${startDate}`);
    } else if (isDoctorReport) {
      const doctorName = doctors.find(d => d.id === selectedDoctor)?.name || 'All Doctors';
      csvRows.push('Doctor-Wise Revenue Report');
      csvRows.push(`Doctor: ${doctorName}`);
      csvRows.push(`Period: ${startDate} to ${endDate}`);
    } else {
      csvRows.push('Billing Report');
      csvRows.push(`Period: ${startDate} to ${endDate}`);
    }
    csvRows.push('');

    if (data.registrations && data.registrations.length > 0) {
      csvRows.push('REGISTRATIONS');
      csvRows.push('Patient ID,Patient Name,Doctor,Type,Payment Method,Amount,Date');
      data.registrations.forEach((reg: any) => {
        const patientName = reg.patients?.full_name || 'N/A';
        const patientId = reg.patients?.patient_id_code || 'N/A';
        const doctorName = reg.doctors?.name || 'N/A';
        const amount = reg.payment_amount || 0;
        csvRows.push(`${patientId},"${patientName}","${doctorName}",${reg.registration_type},${reg.payment_method},${amount},${reg.appointment_date}`);
      });
      csvRows.push('');
    }

    if (data.injections && data.injections.length > 0) {
      csvRows.push('INJECTIONS');
      csvRows.push('Patient ID,Patient Name,Doctor,Type,Payment Method,Amount,Date');
      data.injections.forEach((inj: any) => {
        const patientName = inj.patients?.full_name || 'N/A';
        const patientId = inj.patients?.patient_id_code || 'N/A';
        const doctorName = inj.doctors?.name || 'N/A';
        const amount = inj.payment_amount || 0;
        csvRows.push(`${patientId},"${patientName}","${doctorName}",${inj.admission_type},${inj.payment_method},${amount},${inj.date}`);
      });
      csvRows.push('');
    }

    if (data.vaccinations && data.vaccinations.length > 0) {
      csvRows.push('VACCINATIONS');
      csvRows.push('Patient ID,Patient Name,Doctor,Type,Payment Method,Amount,Date');
      data.vaccinations.forEach((vac: any) => {
        const patientName = vac.patients?.full_name || 'N/A';
        const patientId = vac.patients?.patient_id_code || 'N/A';
        const doctorName = vac.doctors?.name || 'N/A';
        const amount = vac.payment_amount || 0;
        csvRows.push(`${patientId},"${patientName}","${doctorName}",${vac.admission_type},${vac.payment_method},${amount},${vac.date}`);
      });
      csvRows.push('');
    }

    if (data.newbornVaccinations && data.newbornVaccinations.length > 0) {
      csvRows.push('NEWBORN VACCINATIONS');
      csvRows.push('Patient ID,Patient Name,Doctor,Type,Payment Method,Amount,Date');
      data.newbornVaccinations.forEach((vac: any) => {
        const patientName = vac.patients?.full_name || 'N/A';
        const patientId = vac.patients?.patient_id_code || 'N/A';
        const doctorName = vac.doctors?.name || 'N/A';
        const amount = vac.payment_amount || 0;
        csvRows.push(`${patientId},"${patientName}","${doctorName}",${vac.admission_type},${vac.payment_method},${amount},${vac.date}`);
      });
      csvRows.push('');
    }

    if (data.dermatologyProcedures && data.dermatologyProcedures.length > 0) {
      csvRows.push('DERMATOLOGY PROCEDURES');
      csvRows.push('Patient ID,Patient Name,Doctor,Type,Payment Method,Amount,Date');
      data.dermatologyProcedures.forEach((proc: any) => {
        const patientName = proc.patients?.full_name || 'N/A';
        const patientId = proc.patients?.patient_id_code || 'N/A';
        const doctorName = proc.doctors?.name || 'N/A';
        const amount = proc.payment_amount || 0;
        csvRows.push(`${patientId},"${patientName}","${doctorName}",${proc.admission_type},${proc.payment_method},${amount},${proc.date}`);
      });
      csvRows.push('');
    }

    // Calculate revenue from the actual export data
    const exportRevenue = calculateRevenue(data);
    const totalRevenue = exportRevenue?.total || 0;
    const totalCash = exportRevenue?.cash || 0;
    const totalUpi = exportRevenue?.upi || 0;
    const injectionRev = exportRevenue?.injection || 0;
    const vaccinationRev = exportRevenue?.vaccination || 0;
    const nbVaccinationRev = exportRevenue?.nbVaccination || 0;
    const dermatologyRev = exportRevenue?.dermatology || 0;

    // Calculate IP and OP revenue from registrations only
    let ipRevenue = 0;
    let opRevenue = 0;

    if (isDoctorReport && data.registrations) {
      ipRevenue = data.registrations
        .filter((r: any) => r.registration_type === 'IP')
        .reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0);

      opRevenue = data.registrations
        .filter((r: any) => r.registration_type === 'OP')
        .reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0);
    }

    csvRows.push('SUMMARY');
    csvRows.push(`Total Revenue,${totalRevenue}`);
    csvRows.push(`Cash Payments,${totalCash}`);
    csvRows.push(`UPI Payments,${totalUpi}`);

    if (isDoctorReport) {
      csvRows.push(`IP Revenue,${ipRevenue}`);
      csvRows.push(`OP Revenue,${opRevenue}`);
      csvRows.push(`Injection Revenue,${injectionRev}`);
      csvRows.push(`Vaccination Revenue,${vaccinationRev}`);
      csvRows.push(`Newborn Vaccination Revenue,${nbVaccinationRev}`);
      csvRows.push(`Dermatology Revenue,${dermatologyRev}`);
    }

    csvRows.push(`Refunds,${refundTotal}`);
    csvRows.push(`Net Revenue,${totalRevenue - refundTotal}`);

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename.replace('.xlsx', '.csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2" style={{ color: '#7c3b92' }}>Billing & Revenue</h1>
              <p className="text-gray-600">Consolidated billing dashboard and reports</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'doctor'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Doctor-wise
              </div>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} />
                Invoice Lookup
              </div>
            </button>
            <button
              onClick={() => setActiveTab('eod')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'eod'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                EOD Report
              </div>
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => loadBillingData(undefined, startDate, endDate)}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Loading...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Gross Revenue</span>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total)}</p>
              </div>

              <div className="rounded-lg shadow-sm p-6 border-2 border-red-200" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-600">Total Refunds</span>
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(refundTotal)}</p>
              </div>

              <div className="rounded-lg shadow-sm p-6 border-2 border-green-200" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Net Revenue</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(revenue.total - refundTotal)}</p>
              </div>

              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Date Range</span>
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  {' - '}
                  {new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Cash Payments</span>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.cash)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenue.total > 0 ? ((revenue.cash / revenue.total) * 100).toFixed(1) : 0}% of gross
                </p>
              </div>

              <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">UPI Payments</span>
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.upi)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {revenue.total > 0 ? ((revenue.upi / revenue.total) * 100).toFixed(1) : 0}% of gross
                </p>
              </div>
            </div>

            {/* Service-wise Revenue */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service-wise Revenue</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Registrations (OP/IP)</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.registration)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Injections</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.injection)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Vaccinations</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.vaccination)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">N/B Babies Vaccination</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.nbVaccination)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Dermatology Procedures</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.dermatology)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor-wise Tab */}
        {activeTab === 'doctor' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor-wise Revenue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Doctors</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => loadBillingData(selectedDoctor, startDate, endDate)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Loading...' : 'Generate Report'}
                </button>
                <button
                  onClick={() => exportToExcel(billingData, 'doctor-wise-revenue.xlsx')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download size={18} />
                  Export Excel
                </button>
              </div>
            </div>

            {billingData && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{formatCurrency(revenue.total)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Registrations (OP)</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>
                      {formatCurrency(
                        billingData.registrations
                          ?.filter((r: any) => r.registration_type === 'OP')
                          .reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0) || 0
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Registrations (IP)</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>
                      {formatCurrency(
                        billingData.registrations
                          ?.filter((r: any) => r.registration_type === 'IP')
                          .reduce((sum: number, r: any) => sum + (r.payment_amount || 0), 0) || 0
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Injections</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{formatCurrency(revenue.injection)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Vaccinations</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{formatCurrency(revenue.vaccination)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">N/B Vaccinations</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{formatCurrency(revenue.nbVaccination)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Dermatology</p>
                    <p className="text-xl font-bold" style={{ color: '#1e40af' }}>{formatCurrency(revenue.dermatology)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Refunds Amount</p>
                    <p className="text-xl font-bold" style={{ color: '#dc2626' }}>{formatCurrency(refundTotal)}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f6ff' }}>
                    <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
                    <p className="text-xl font-bold" style={{ color: '#059669' }}>{formatCurrency(revenue.total - refundTotal)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invoice Lookup Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Invoices</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search by Invoice No, Patient ID, or Patient Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Services</option>
                    <option value="injection">Injections</option>
                    <option value="vaccination">Vaccinations</option>
                    <option value="newborn_vaccination">N/B Vaccinations</option>
                    <option value="dermatology">Dermatology</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <Search size={18} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((result, index) => (
                        <tr
                          key={index}
                          onClick={() => {
                            if (result.invoice_no !== 'N/A') {
                              if (result.service_type === 'Injection') {
                                handleViewInjectionInvoice(result.invoice_no);
                              } else if (result.service_type === 'Vaccination') {
                                handleViewVaccinationInvoice(result.invoice_no);
                              } else if (result.service_type === 'N/B Vaccination') {
                                handleViewNewbornVaccinationInvoice(result.invoice_no);
                              } else if (result.service_type === 'Dermatology') {
                                handleViewDermatologyProcedureInvoice(result.invoice_no);
                              }
                            }
                          }}
                          className={`hover:bg-gray-50 ${result.invoice_no !== 'N/A' ? 'cursor-pointer' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.invoice_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(result.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {result.patients?.full_name || 'N/A'}
                            <br />
                            <span className="text-xs text-gray-500">{result.patients?.patient_id_code}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {result.service_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {result.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(result.payment_amount || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EOD Report Tab */}
        {activeTab === 'eod' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">End-of-Day Report</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <button
                    onClick={() => loadBillingData(undefined, startDate, startDate)}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Loading...' : 'Generate'}
                  </button>
                  <button
                    onClick={() => exportToExcel(billingData, `EOD-${startDate}.xlsx`)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {billingData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h4>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenue.total)}</p>
                  </div>
                  <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Cash Payments</h4>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(revenue.cash)}</p>
                  </div>
                  <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">UPI Payments</h4>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(revenue.upi)}</p>
                  </div>
                  <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Refunds</h4>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(refundTotal)}</p>
                  </div>
                  <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f0f6ff' }}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Net Revenue</h4>
                    <p className="text-3xl font-bold" style={{ color: '#059669' }}>{formatCurrency(revenue.total - refundTotal)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Count & Revenue</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Registrations (OP/IP) ({billingData.registrations?.length || 0})
                      </span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.registration)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Injections ({billingData.injections?.length || 0})
                      </span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.injection)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Vaccinations ({billingData.vaccinations?.length || 0})
                      </span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.vaccination)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        N/B Vaccinations ({billingData.newbornVaccinations?.length || 0})
                      </span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.nbVaccination)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        Dermatology ({billingData.dermatologyProcedures?.length || 0})
                      </span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(revenue.dermatology)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && selectedInvoiceData && selectedInvoiceType === 'injection' && (
        <InjectionInvoicePreview
          invoiceData={selectedInvoiceData}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoiceData(null);
            setSelectedInvoiceType(null);
          }}
        />
      )}
      {showInvoicePreview && selectedInvoiceData && selectedInvoiceType === 'vaccination' && (
        <VaccinationInvoicePreview
          invoiceData={selectedInvoiceData}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoiceData(null);
            setSelectedInvoiceType(null);
          }}
        />
      )}
      {showInvoicePreview && selectedInvoiceData && selectedInvoiceType === 'newborn_vaccination' && (
        <NewbornVaccinationInvoicePreview
          invoiceData={selectedInvoiceData}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoiceData(null);
            setSelectedInvoiceType(null);
          }}
        />
      )}
      {showInvoicePreview && selectedInvoiceData && selectedInvoiceType === 'dermatology' && (
        <DermatologyProcedureInvoicePreview
          invoiceData={selectedInvoiceData}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoiceData(null);
            setSelectedInvoiceType(null);
          }}
        />
      )}
    </div>
  );
};

export default Billing;
