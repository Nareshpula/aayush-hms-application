import React, { useState } from 'react';
import { Search, XCircle, DollarSign, AlertCircle, CheckCircle, Calendar, User, CreditCard } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';
import { formatDateTimeIST } from '../lib/dateUtils';

interface RegistrationRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  registration_type: string;
  appointment_date: string;
  registration_date: string;
  status: string;
  payment_method?: string;
  payment_amount?: number;
  cancel_reason?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  refund_amount?: number;
  patients: {
    id: string;
    patient_id_code: string;
    full_name: string;
    contact_number: string;
  };
  doctors: {
    id: string;
    name: string;
  };
}

const CancellationRefunds: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRecord | null>(null);

  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [refundReason, setRefundReason] = useState('');
  const [refundedBy, setRefundedBy] = useState('Admin');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter Patient ID, Phone number, or Patient name');
      return;
    }

    setLoading(true);
    try {
      const results = await DatabaseService.searchRegistrationsForRefund(searchTerm.trim());
      setSearchResults(results || []);
      if (results && results.length === 0) {
        alert('No registrations found for the given search term');
      }
    } catch (error) {
      console.error('Error searching registrations:', error);
      alert('Failed to search registrations');
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (registration: RegistrationRecord) => {
    setSelectedRegistration(registration);
    setRefundAmount(registration.payment_amount || 0);
    setRefundMethod(registration.payment_method as 'Cash' | 'UPI' || 'Cash');
    setRefundReason('');
    setRefundedBy('Admin');
    setShowRefundModal(true);
  };

  const handleRefund = async () => {
    if (!selectedRegistration) return;

    if (!refundReason.trim()) {
      alert('Please provide a reason for refund');
      return;
    }

    if (refundAmount <= 0 || refundAmount > (selectedRegistration.payment_amount || 0)) {
      alert('Invalid refund amount');
      return;
    }

    if (!refundedBy.trim()) {
      alert('Please provide the name of person processing refund');
      return;
    }

    setProcessing(true);
    try {
      await DatabaseService.cancelRegistrationAndRefund({
        registrationId: selectedRegistration.id,
        patientId: selectedRegistration.patient_id,
        invoiceNo: undefined,
        paidAmount: selectedRegistration.payment_amount || 0,
        refundAmount: refundAmount,
        refundMethod: refundMethod,
        reason: refundReason,
        refundedBy: refundedBy
      });

      setSuccessMessage('Registration cancelled & refund recorded successfully.');
      setShowRefundModal(false);

      setTimeout(() => {
        setSuccessMessage('');
        handleSearch();
      }, 2000);
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ color: '#7c3b92' }}>Cancellation & Refunds</h1>
        <p className="text-gray-600">Search and cancel registrations with refund processing</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Patient ID, Phone Number, or Patient Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Patient ID, Phone, or Name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 mt-7"
          >
            <Search size={18} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((registration) => (
            <div key={registration.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {registration.patients.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Patient ID: {registration.patients.patient_id_code}
                  </p>
                </div>
                <div className="text-right">
                  {registration.status === 'CANCELLED' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      <XCircle size={16} />
                      CANCELLED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle size={16} />
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Admission Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registration.registration_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Doctor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registration.doctors?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Registration Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTimeIST(registration.registration_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registration.patients.contact_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registration.payment_method || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Paid Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(registration.payment_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {registration.status}
                  </p>
                </div>
              </div>

              {registration.status === 'CANCELLED' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Refund Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-red-600">Refunded Amount</p>
                      <p className="font-medium text-red-900">
                        {formatCurrency(registration.refund_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600">Refunded At</p>
                      <p className="font-medium text-red-900">
                        {registration.cancelled_at ? formatDateTimeIST(registration.cancelled_at) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600">Refunded By</p>
                      <p className="font-medium text-red-900">
                        {registration.cancelled_by || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600">Reason</p>
                      <p className="font-medium text-red-900">
                        {registration.cancel_reason || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {registration.status !== 'CANCELLED' && registration.payment_amount && registration.payment_amount > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => openRefundModal(registration)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle size={18} />
                    Cancel Registration
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRefundModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Cancel Registration</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Patient: <span className="font-medium text-gray-900">{selectedRegistration.patients.full_name}</span></p>
              <p className="text-sm text-gray-600">Patient ID: <span className="font-medium text-gray-900">{selectedRegistration.patients.patient_id_code}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={selectedRegistration.payment_amount || 0}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {formatCurrency(selectedRegistration.payment_amount || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as 'Cash' | 'UPI')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refunded By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refundedBy}
                  onChange={(e) => setRefundedBy(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : 'Confirm & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationRefunds;
