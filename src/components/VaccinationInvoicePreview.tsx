import React, { useState } from 'react';
import { X, Printer, Save } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

interface VaccinationInvoicePreviewProps {
  invoiceData: {
    invoiceNo: string;
    date: string;
    time: string;
    patientId: string;
    patientName: string;
    age: string;
    gender: string;
    contactNumber: string;
    admissionType: string;
    doctorName: string;
    vaccinationDetails: string;
    paymentMethod: string;
    amount: number;
    patient_id?: string;
    doctor_id?: string;
    vaccination_id?: string;
  };
  onClose: () => void;
}

const VaccinationInvoicePreview: React.FC<VaccinationInvoicePreviewProps> = ({ invoiceData, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.patient_id || !invoiceData.doctor_id) {
      setSaveError('Missing patient or doctor information');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await DatabaseService.saveVaccinationInvoice({
        invoice_no: invoiceData.invoiceNo,
        vaccination_id: invoiceData.vaccination_id || null,
        patient_id: invoiceData.patient_id,
        doctor_id: invoiceData.doctor_id,
        vaccination_details: invoiceData.vaccinationDetails === 'N/A' ? null : invoiceData.vaccinationDetails,
        payment_method: invoiceData.paymentMethod,
        payment_amount: invoiceData.amount,
        admission_type: invoiceData.admissionType
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving invoice:', err);
      setSaveError(err.message || 'Failed to save invoice');
    } finally {
      setIsSaving(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Invoice Content - A5 Printable - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 invoice-content" style={{ transform: 'scale(0.88)', transformOrigin: 'top center' }}>
          {/* Hospital Header */}
          <div className="text-center border-2 border-gray-800 p-3 mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">AAYUSH Child&Skin HOSPITAL</h1>
            <p className="text-xs text-gray-700">Address: Near Chandana Shopping Mall, CTM Road, Madanapalle, Annamayya Dist.</p>
            <p className="text-xs text-gray-700">Contact: 9676079516 | Email: aayushhospital@gmail.com</p>
            <p className="text-xs text-gray-700">Reg. No: 01/22-23 | GST No: 37XXXXX1234X1ZX</p>
          </div>

          {/* Invoice Header Table */}
          <table className="w-full border border-gray-800 mb-3" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-100" style={{ width: '40%' }}>
                  Invoice No: {invoiceData.invoiceNo}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-100" style={{ width: '30%' }}>
                  Date: {invoiceData.date}
                </td>
                <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-100" style={{ width: '30%' }}>
                  Time: {invoiceData.time}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Patient Details Table */}
          <div className="mb-3">
            <div className="bg-gray-200 border border-gray-800 px-2 py-1">
              <h3 className="text-xs font-bold text-gray-900">PATIENT DETAILS</h3>
            </div>
            <table className="w-full border-l border-r border-b border-gray-800" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Patient ID
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs" style={{ width: '25%' }}>
                    {invoiceData.patientId}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Patient Name
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs" style={{ width: '25%' }}>
                    {invoiceData.patientName}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50">Age / Gender</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">
                    {invoiceData.age} / {invoiceData.gender}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50">Contact Number</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{invoiceData.contactNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50">Admission Type</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{invoiceData.admissionType}</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50">Doctor</td>
                  <td className="border border-gray-400 px-2 py-1 text-xs">{invoiceData.doctorName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vaccination Details Table */}
          <div className="mb-3">
            <div className="bg-gray-200 border border-gray-800 px-2 py-1">
              <h3 className="text-xs font-bold text-gray-900">VACCINATION DETAILS</h3>
            </div>
            <table className="w-full border-l border-r border-b border-gray-800" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '35%' }}>
                    Vaccination Description
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs" style={{ width: '65%' }}>
                    {invoiceData.vaccinationDetails || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details Table */}
          <div className="mb-3">
            <div className="bg-gray-200 border border-gray-800 px-2 py-1">
              <h3 className="text-xs font-bold text-gray-900">PAYMENT DETAILS</h3>
            </div>
            <table className="w-full border-l border-r border-b border-gray-800" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Payment Method
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs" style={{ width: '25%' }}>
                    {invoiceData.paymentMethod}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Amount Paid
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs text-right font-bold" style={{ width: '25%' }}>
                    {formatCurrency(invoiceData.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Table */}
          <div className="mb-3">
            <div className="bg-gray-200 border border-gray-800 px-2 py-1">
              <h3 className="text-xs font-bold text-gray-900">SUMMARY</h3>
            </div>
            <table className="w-full border-l border-r border-b border-gray-800" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Total Amount
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs text-right font-bold" style={{ width: '25%' }}>
                    {formatCurrency(invoiceData.amount)}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50" style={{ width: '25%' }}>
                    Paid Amount
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-xs text-right font-bold" style={{ width: '25%' }}>
                    {formatCurrency(invoiceData.amount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-50">
                    Balance
                  </td>
                  <td colSpan={2} className="border border-gray-400 px-2 py-1 text-xs text-right font-bold">
                    {formatCurrency(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-700 mb-2">
            <p><span className="font-bold">Prepared By:</span> HMS System</p>
            <p><span className="font-bold">Generated On:</span> {invoiceData.date}, {invoiceData.time}</p>
          </div>

          <div className="border-t-2 border-gray-800 pt-2 text-center">
            <p className="text-xs font-bold text-gray-900">Thank you for choosing Aayush Child & Skin Hospital Madanapalle</p>
          </div>
          </div>
        </div>

        {/* Action Buttons - Bottom - Not Printed - Always Visible */}
        <div className="no-print p-4 bg-gray-50 border-t-2 border-gray-200 flex-shrink-0">
          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              Invoice saved successfully!
            </div>
          )}

          {/* Error Message */}
          {saveError && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {saveError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm"
            >
              <X size={20} />
              Back
            </button>
            <button
              onClick={handleSaveInvoice}
              disabled={isSaving || saveSuccess}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Invoice'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Printer size={20} />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }

          @page :first {
            margin-top: 0;
          }

          @page :last {
            margin-bottom: 0;
          }

          html {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .invoice-content, .invoice-content * {
            visibility: visible;
          }

          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10mm;
            transform: scale(1) !important;
          }

          .no-print {
            display: none !important;
          }

          table {
            border-collapse: collapse !important;
          }

          td {
            border: 1px solid #6b7280 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VaccinationInvoicePreview;
