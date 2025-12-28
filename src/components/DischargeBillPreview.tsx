import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Printer, CheckCircle, X } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

// ✅ Helper: format Admission Date + Time (IST, 12-hour with AM/PM)
const formatAdmissionDateTime = (date?: string, time?: string) => {
  if (!date) return 'N/A';

  // If time is missing, show date only
  if (!time) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Combine date + time safely
  const dateTimeString = `${date}T${time}`;

  return new Date(dateTimeString).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // ✅ AM / PM
  });
};

// ✅ Helper: extract time from timestamp (for discharge time from updated_at)
const extractTimeFromTimestamp = (timestamp?: string) => {
  if (!timestamp) return undefined;

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

function numberToWords(num: number): string {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  if (num === 0) return 'ZERO';

  const convert = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  return 'RUPEES ' + convert(rupees) + ' ONLY';
}

export default function DischargeBillPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const billData = location.state;

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedBillNo, setSavedBillNo] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No bill data available</p>
          <button
            onClick={() => navigate('/discharge-bills')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Discharge Bills
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);

      let savedBill;
      let billNo;

      if (billData.existingDischargeBill) {
        billNo = billData.existingDischargeBill.bill_no;

        savedBill = await DatabaseService.updateDischargeBill(billData.existingDischargeBill.id, {
          section: billData.section,
          patient_id: billData.patient.id,
          registration_id: billData.admission.id,
          doctor_id: billData.admission.doctor_id,
          admission_date: billData.admission.ip_admissions?.[0]?.admission_date || new Date().toISOString().split('T')[0],
          discharge_date: billData.admission.ip_admissions?.[0]?.discharge_date || new Date().toISOString().split('T')[0],
          total_amount: billData.totalAmount,
          paid_amount: billData.paidAmount,
          outstanding_amount: billData.outstanding || 0,
          refundable_amount: billData.refundable || 0,
          ip_joining_amount: billData.ipJoiningAmount,
          status: 'finalized',
          created_by: billData.createdBy
        });

        await DatabaseService.deleteDischargeBillItems(billData.existingDischargeBill.id);
      } else {
        billNo = await DatabaseService.generateDischargeBillNumber();

        savedBill = await DatabaseService.saveDischargeBill({
          bill_no: billNo,
          section: billData.section,
          patient_id: billData.patient.id,
          registration_id: billData.admission.id,
          doctor_id: billData.admission.doctor_id,
          admission_date: billData.admission.ip_admissions?.[0]?.admission_date || new Date().toISOString().split('T')[0],
          discharge_date: billData.admission.ip_admissions?.[0]?.discharge_date || new Date().toISOString().split('T')[0],
          total_amount: billData.totalAmount,
          paid_amount: billData.paidAmount,
          outstanding_amount: billData.outstanding,
          refundable_amount: billData.refundable,
          status: 'finalized',
          created_by: billData.createdBy
        });
      }

      const itemsToSave = billData.lineItems.map((item: any) => ({
        discharge_bill_id: savedBill.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        reference_id: item.reference_id,
        reference_type: item.reference_type
      }));

      await DatabaseService.saveDischargeBillItems(itemsToSave);

      setSaveSuccess(true);
      setSavedBillNo(billNo);
      setSuccessMessage(`Discharge Bill ${billNo} ${billData.existingDischargeBill ? 'updated' : 'saved'} successfully!`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error saving bill:', error);
      setSuccessMessage('Failed to save discharge bill. Please try again.');
      setShowSuccessToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (saveSuccess) {
      navigate('/discharge-bills');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 print:min-h-0 print:bg-white">
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-3">
            {!saveSuccess && (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Bill'}
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="print:hidden bg-green-50 border-l-4 border-green-500 px-6 py-4 mx-6 mt-4">
          <p className="text-green-800 font-medium">
            Bill {savedBillNo} has been saved successfully! You can now print or go back.
          </p>
        </div>
      )}

      <div className="max-w-[210mm] mx-auto bg-white my-8 print:m-0 shadow-lg print:shadow-none" style={{ fontSize: '11pt', lineHeight: '1.4' }}>
        <style>
          {`
            @media print {
              @page {
                margin: 0;
                size: A4 portrait;
              }

              html {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }

              body {
                margin: 12mm !important;
                padding: 0 !important;
                background: white !important;
                min-height: 0 !important;
                height: auto !important;
              }

              #root {
                background: white !important;
                min-height: 0 !important;
                height: auto !important;
              }

              * {
                page-break-after: auto !important;
                page-break-before: auto !important;
                page-break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              nav, header, footer, aside,
              button, .no-print, [class*="print:hidden"],
              [class*="fixed"], [class*="sticky"],
              .bg-green-50 {
                display: none !important;
              }

              /* Hide browser-generated headers and footers */
              @page :first {
                margin-top: 0;
              }

              @page :last {
                margin-bottom: 0;
              }
            }
          `}
        </style>

        <div className="px-8 py-6 print:px-6 print:py-4">
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0 mr-4">
              <img
                src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
                alt="Aayush Hospital Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold mb-1 tracking-wide" style={{ letterSpacing: '0.05em' }}>AAYUSH HOSPITAL</h1>
              <p className="text-xs">#3-153-9, Opp. Joyalukkas, C.T.M. Road, Madanapalle Town, Madanapalle Dist. | Cell: 8179880809, 8822699996</p>
            </div>
            <div className="flex-shrink-0 w-16"></div>
          </div>

          <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-black text-xs">
            <div className="flex-1">
              <p className="font-medium">Smt. Dr. Himabindu</p>
              <p>M.B.B.S., M.D. (DERMATOLOGY)</p>
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium">Sri. Dr. Sridhar</p>
              <p>M.B.B.S., M.D., DNB. (PEDIATRICS)</p>
            </div>
          </div>

          <h2 className="text-center text-lg font-bold mb-3 tracking-wide">FINAL BILL</h2>

          <div className="flex justify-between text-xs mb-3">
            <div className="space-y-0.5">
              <p><span className="font-semibold inline-block w-28">IP No</span>: {billData.patient.patient_id_code?.replace('AYH-', '') || 'N/A'}</p>
              <p><span className="font-semibold inline-block w-28">Consultant</span>: {billData.admission.doctors?.name || 'N/A'}</p>
              <p><span className="font-semibold inline-block w-28">Department</span>: {billData.existingDischargeBill?.section || billData.section || billData.admission.doctors?.department || 'N/A'}</p>
              <p><span className="font-semibold inline-block w-28">D.O.A</span>: {' '}{formatAdmissionDateTime(billData.admission.ip_admissions?.[0]?.admission_date,billData.admission.ip_admissions?.[0]?.admission_time)}</p>
              <p><span className="font-semibold inline-block w-28">Room Details</span>: {billData.admission.ip_admissions?.[0]?.room_number || 'N/A'}</p>
            </div>
            <div className="space-y-0.5">
              <p><span className="font-semibold inline-block w-16">Bill No</span>: {billData.existingDischargeBill?.bill_no || savedBillNo || '[To be generated]'}</p>
              <p><span className="font-semibold inline-block w-16">Date</span>: {new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p><span className="font-semibold inline-block w-16">D.O.D</span>: {formatAdmissionDateTime(billData.admission.ip_admissions?.[0]?.discharge_date, extractTimeFromTimestamp(billData.admission.ip_admissions?.[0]?.updated_at))}</p>
            </div>
          </div>

          <table className="w-full mb-3 text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1 text-left font-semibold">Name</th>
                <th className="border border-black px-2 py-1 text-left font-semibold">ID</th>
                <th className="border border-black px-2 py-1 text-left font-semibold">Age</th>
                <th className="border border-black px-2 py-1 text-left font-semibold">Gender</th>
                <th className="border border-black px-2 py-1 text-left font-semibold">Mobile</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1">{billData.patient.full_name}</td>
                <td className="border border-black px-2 py-1">{billData.patient.patient_id_code || 'N/A'}</td>
                <td className="border border-black px-2 py-1">{billData.patient.age} years</td>
                <td className="border border-black px-2 py-1">{billData.patient.gender}</td>
                <td className="border border-black px-2 py-1">{billData.patient.contact_number}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs mb-2"><span className="font-semibold">Payment Type:</span> {billData.admission.payment_method || 'Cash'}</p>

          <table className="w-full mb-3 text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1.5 text-left font-semibold">Particulars</th>
                <th className="border border-black px-2 py-1.5 text-center font-semibold w-16">Qty</th>
                <th className="border border-black px-2 py-1.5 text-right font-semibold w-24">Amount</th>
                <th className="border border-black px-2 py-1.5 text-right font-semibold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(billData.categoryTotals).map(([category, items]: [string, any]) => {
                const categoryItems = billData.lineItems.filter((item: any) => item.category === category);
                return (
                  <tr key={category}>
                    <td colSpan={4} className="border border-black px-2 py-1">
                      <p className="font-bold mb-1 uppercase">{category}</p>
                      {categoryItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-0.5">
                          <span className="flex-1">{item.description}</span>
                          <span className="w-16 text-center">{item.quantity}</span>
                          <span className="w-24 text-right">{item.rate.toFixed(2)}</span>
                          <span className="w-28 text-right">{item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t-2 border-black pt-2 mb-3">
            <div className="flex justify-between items-start">
              <div className="text-xs flex-1">
                <p className="font-semibold mb-1">Amount (in words):</p>
                <p className="italic">{numberToWords(billData.existingDischargeBill?.paid_amount || billData.paidAmount)}</p>
              </div>
              <div className="text-xs space-y-1" style={{ minWidth: '200px' }}>
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">{(billData.existingDischargeBill?.total_amount || billData.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Advance:</span>
                  <span className="font-semibold">{(billData.existingDischargeBill?.ip_joining_amount || billData.ipJoiningAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-black pt-1">
                  <span className="font-semibold">Amount Receivable:</span>
                  <span className="font-semibold">{billData.existingDischargeBill ? ((billData.existingDischargeBill.total_amount || 0) - (billData.existingDischargeBill.ip_joining_amount || 0)).toFixed(2) : (billData.amountReceivable || Math.max(0, billData.outstanding)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-black pb-1">
                  <span className="font-semibold">Amount Received:</span>
                  <span className="font-semibold">{billData.existingDischargeBill ? ((billData.existingDischargeBill.paid_amount || 0) - (billData.existingDischargeBill.ip_joining_amount || 0)).toFixed(2) : (billData.amountReceived || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-right">
            <p className="text-xs font-semibold mb-12">Authorized Signature</p>
          </div>
        </div>
      </div>

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
}
