import React, { useState, useEffect } from 'react';
import { Syringe, Search, CheckCircle, AlertCircle, Calendar, DollarSign, FileText, User, Stethoscope, Receipt } from 'lucide-react';
import { DatabaseService, Patient, Registration, Doctor } from '../lib/supabase';
import InjectionInvoicePreview from '../components/InjectionInvoicePreview';
import { getCurrentISTDate, istDateToUTCStart } from '../lib/dateUtils';
import { useDebounce } from '../lib/hooks';

const Injections: React.FC = () => {
  const [patientIdCode, setPatientIdCode] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    admissionType: '',
    date: getCurrentISTDate(),
    paymentMethod: '',
    paymentAmount: '',
    injectionDetails: ''
  });

  const debouncedPatientIdCode = useDebounce(patientIdCode, 500);

  // Load doctors on component mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorList = await DatabaseService.getDoctors();
        setDoctors(doctorList);
      } catch (err) {
        console.error('Error loading doctors:', err);
      }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    if (debouncedPatientIdCode.trim().length >= 3) {
      handleSearchPatient();
    } else if (debouncedPatientIdCode.trim().length === 0) {
      setPatient(null);
      setRegistration(null);
      setError('');
    }
  }, [debouncedPatientIdCode]);

  const handleSearchPatient = async () => {
    if (!patientIdCode.trim()) {
      setError('Please enter a Patient ID');
      return;
    }

    setLoading(true);
    setError('');
    setPatient(null);
    setRegistration(null);

    try {
      const result = await DatabaseService.getPatientWithRegistration(patientIdCode);

      if (!result.patient) {
        setError('Patient ID not found');
        return;
      }

      if (!result.registration) {
        setError('No registration found for this patient');
        return;
      }

      setPatient(result.patient);
      setRegistration(result.registration);

      // Auto-fill doctor and admission type from registration
      setFormData(prev => ({
        ...prev,
        doctorId: result.registration?.doctor_id || '',
        admissionType: result.registration?.registration_type || ''
      }));

      setError('');
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registration || !patient) {
      setError('Please search for a valid patient first');
      return;
    }

    if (!formData.doctorId) {
      setError('Please select a doctor');
      return;
    }

    if (!formData.admissionType) {
      setError('Please confirm admission type');
      return;
    }

    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    const paymentAmountValue = Number(formData.paymentAmount);

    if (!formData.paymentAmount || paymentAmountValue <= 0 || isNaN(paymentAmountValue)) {
      setError('Please enter a valid payment amount');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Round to 2 decimal places to avoid floating point precision issues
      const roundedAmount = Math.round(paymentAmountValue * 100) / 100;

      await DatabaseService.createInjection({
        registration_id: registration.id,
        patient_id: patient.id,
        doctor_id: formData.doctorId,
        date: istDateToUTCStart(formData.date),
        admission_type: formData.admissionType as 'IP' | 'OP',
        payment_method: formData.paymentMethod as 'Cash' | 'UPI',
        payment_amount: roundedAmount,
        injection_details: formData.injectionDetails || undefined
      });

      setSuccess('Injection record saved successfully!');

      // Reset form
      setFormData({
        doctorId: '',
        admissionType: '',
        date: getCurrentISTDate(),
        paymentMethod: '',
        paymentAmount: '',
        injectionDetails: ''
      });
      setPatientIdCode('');
      setPatient(null);
      setRegistration(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error saving injection:', err);
      setError('Failed to save injection record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateInvoice = async () => {
    if (!registration || !patient) {
      setError('Please search for a valid patient first');
      return;
    }

    if (!formData.doctorId) {
      setError('Please select a doctor');
      return;
    }

    if (!formData.admissionType) {
      setError('Please confirm admission type');
      return;
    }

    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    const paymentAmountValue = Number(formData.paymentAmount);

    if (!formData.paymentAmount || paymentAmountValue <= 0 || isNaN(paymentAmountValue)) {
      setError('Please enter a valid payment amount');
      return;
    }

    setError('');

    try {
      const invoiceNo = await DatabaseService.generateInjectionInvoiceNumber();
      const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const invoice = {
        invoiceNo,
        date: dateStr,
        time: timeStr,
        patientId: patient.patient_id_code,
        patientName: patient.full_name,
        age: `${patient.age} ${patient.age_unit || 'Years'}`,
        gender: patient.gender,
        contactNumber: patient.contact_number,
        admissionType: formData.admissionType,
        doctorName: selectedDoctor?.name || 'N/A',
        injectionDetails: formData.injectionDetails || 'N/A',
        paymentMethod: formData.paymentMethod,
        amount: Math.round(paymentAmountValue * 100) / 100,
        patient_id: patient.id,
        doctor_id: formData.doctorId,
        injection_id: undefined
      };

      setInvoiceData(invoice);
      setShowInvoicePreview(true);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Syringe className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold text-white" style={{ color: '#7c3b92' }}>Injection Module</h1>
          </div>
          <p className="text-gray-600">Record injection administration details</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Patient Search */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Patient</h2>

          <div className="flex space-x-3">
            <div className="flex-1">
              <label htmlFor="patientIdCode" className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                id="patientIdCode"
                value={patientIdCode}
                onChange={(e) => setPatientIdCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
                placeholder="Enter Patient ID (e.g., AAYUSH-2025-001)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearchPatient}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Patient Info Display */}
          {patient && registration && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Patient ID</p>
                  <p className="text-sm font-medium text-blue-900">{patient.patient_id_code || patient.patient_id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Patient Name</p>
                  <p className="text-sm font-medium text-blue-900">{patient.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Age</p>
                  <p className="text-sm font-medium text-blue-900">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Gender</p>
                  <p className="text-sm font-medium text-blue-900">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Contact</p>
                  <p className="text-sm font-medium text-blue-900">{patient.contact_number}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Registration Type</p>
                  <p className="text-sm font-medium text-blue-900">{registration.registration_type}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Injection Form */}
        {patient && registration && (
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Injection Details</h2>

            <div className="space-y-6">
              {/* Patient Name (Read-Only) */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Patient Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patient.full_name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Doctor (Editable Dropdown) */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                    <span>Doctor</span>
                  </div>
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission Type (Auto-filled but editable) */}
              <div>
                <label htmlFor="admissionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Type
                </label>
                <select
                  id="admissionType"
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Admission Type</option>
                  <option value="IP">IP (In-Patient)</option>
                  <option value="OP">OP (Out-Patient)</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>Payment Method</span>
                  </div>
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  name="paymentAmount"
                  value={formData.paymentAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Injection Details */}
              <div>
                <label htmlFor="injectionDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Injection Details (Optional)</span>
                  </div>
                </label>
                <textarea
                  id="injectionDetails"
                  name="injectionDetails"
                  value={formData.injectionDetails}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter injection details, medication name, dosage, notes, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center space-x-2"
                >
                  <Receipt className="h-5 w-5" />
                  <span>Generate Invoice</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Injection Record'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Invoice Preview Modal */}
      {showInvoicePreview && invoiceData && (
        <InjectionInvoicePreview
          invoiceData={invoiceData}
          onClose={() => setShowInvoicePreview(false)}
        />
      )}
    </div>
  );
};

export default Injections;
