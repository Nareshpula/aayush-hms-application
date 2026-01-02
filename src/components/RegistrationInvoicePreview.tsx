import { ArrowLeft, Printer } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RegistrationPreviewData {
  patient: {
    patient_id: string;
    full_name: string;
    age: string | number;
    gender: string;
    address: string;
    contact_number: string;
  };
  registration: {
    registration_type: string;
    appointment_date: string;
    appointment_time?: string;
    consultation_type?: string;
    ip_department?: string;
  };
  doctor: {
    name: string;
    specialization: string;
  };
}

export default function RegistrationInvoicePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewData = location.state as RegistrationPreviewData;

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No registration data available</p>
          <button
            onClick={() => navigate('/registration')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const datePart = new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (!timeString) {
      return datePart;
    }

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${datePart}, ${displayHour}:${minutes} ${ampm}`;
  };

  const getDepartment = () => {
    if (previewData.registration.registration_type === 'IP') {
      return previewData.registration.ip_department || previewData.doctor.specialization;
    }
    return previewData.doctor.specialization;
  };

  const getPatientType = () => {
    return previewData.registration.registration_type === 'IP' ? 'In Patient' : 'Out Patient';
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
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>

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
              [class*="fixed"], [class*="sticky"] {
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
          {/* Hospital Header - Reused from DischargeBillPreview */}
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0 mr-4">
              <img
                src="https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Skin-pages-image/Aayush-logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvU2tpbi1wYWdlcy1pbWFnZS9BYXl1c2gtbG9nby5wbmciLCJpYXQiOjE3NDM2OTk3MzAsImV4cCI6MTkwMTM3OTczMH0.pg25T9SRSiXE0jn46_vxVzTK_vlJGURYwbeRpbjnIF0"
                alt="Aayush Hospital Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold mb-1 tracking-wide" style={{ letterSpacing: '0.05em', color: '#783B94' }}>AAYUSH HOSPITAL</h1>
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

          {/* Title */}
          <h2 className="text-center text-base font-bold mb-4 tracking-wide">PATIENT ASSESSMENT REPORT</h2>

          {/* Patient Information Section */}
          <div className="border-2 border-black p-4 mb-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-32">Patient ID:</span>
                  <span>{previewData.patient.patient_id}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Patient Name:</span>
                  <span className="font-bold">{previewData.patient.full_name}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Age / Gender:</span>
                  <span>{previewData.patient.age_text ? previewData.patient.age_text : previewData.patient.age !== null ? `${previewData.patient.age} Years` : ''} / {previewData.patient.gender}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Address:</span>
                  <span className="flex-1">{previewData.patient.address}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Doctor Name:</span>
                  <span className="font-bold">{previewData.doctor.name}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-32">Visit Date:</span>
                  <span>{formatDateTime(previewData.registration.appointment_date, previewData.registration.appointment_time)}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Mobile Number:</span>
                  <span>{previewData.patient.contact_number}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Department:</span>
                  <span>{getDepartment()}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-32">Type:</span>
                  <span>{getPatientType()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Section */}
          <div className="text-xs text-right space-y-1 mb-6">
            <p>Wt: _____________</p>
            <p>Hgt: _____________</p>
            <p>BP: _____________</p>
            <p>PR: _____________</p>
            <p>Temp: _____________</p>
            <p>SpO₂: _____________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
