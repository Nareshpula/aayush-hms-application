# Discharge Bills Module - Completion Guide

## ✅ Completed

1. **Database Migration** - File created at `supabase/migrations/20250923000000_create_discharge_bills_system.sql`
   - Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

2. **TypeScript Interfaces** - Added to `src/lib/supabase.ts` (lines 222-251)
   - DischargeBill interface
   - DischargeBillItem interface

3. **Database Service Methods** - Added to `src/lib/supabase.ts` (lines 1546-1709)
   - generateDischargeBillNumber()
   - getActiveIPAdmissionForPatient()
   - getPatientServicesByRegistration()
   - saveDischargeBill()
   - saveDischargeBillItems()
   - getDischargeBillByNumber()
   - getDischargeBills()
   - searchDischargeBills()

4. **Main Page Component** - Created `src/pages/DischargeBills.tsx` (422 lines)
   - Section selector (Pediatrics/Dermatology)
   - Patient search functionality
   - Auto-load admission and service data
   - Editable line items table
   - Category-wise totals
   - Real-time calculations

## 🔨 Remaining Tasks

### 1. Create Preview Component

Create file: `src/components/DischargeBillPreview.tsx`

Use this pattern (similar to InjectionInvoicePreview.tsx):

```typescript
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, Printer } from 'lucide-react';
import { DatabaseService } from '../lib/supabase';

export default function DischargeBillPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const billData = location.state;

  // States for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Generate bill number
      const billNo = await DatabaseService.generateDischargeBillNumber();

      // Save bill
      const savedBill = await DatabaseService.saveDischargeBill({
        bill_no: billNo,
        section: billData.section,
        patient_id: billData.patient.id,
        registration_id: billData.admission.id,
        doctor_id: billData.admission.doctor_id,
        admission_date: billData.admission.ip_admissions[0]?.admission_date || new Date().toISOString().split('T')[0],
        discharge_date: billData.admission.ip_admissions[0]?.discharge_date || new Date().toISOString().split('T')[0],
        total_amount: billData.totalAmount,
        paid_amount: billData.paidAmount,
        outstanding_amount: billData.outstanding,
        refundable_amount: billData.refundable,
        status: 'finalized',
        created_by: billData.createdBy
      });

      // Save line items
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
      alert(`Discharge Bill ${billNo} saved successfully!`);
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save discharge bill');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Buttons - Hide on print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Bill'}
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
      </div>

      {/* A4 Printable Bill */}
      <div className="max-w-[210mm] mx-auto bg-white my-8 p-12 print:m-0 print:p-8 shadow-lg print:shadow-none">
        {/* Hospital Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AAYUSH HOSPITAL</h1>
          <p className="text-gray-600">123 Medical Street, City Name - 123456</p>
          <p className="text-gray-600">Phone: +91 98765 43210 | Email: info@aayush.com</p>
        </div>

        {/* Bill Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center mb-4">DISCHARGE BILL</h2>
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p><span className="font-medium">Section:</span> {billData.section}</p>
              <p><span className="font-medium">Bill Date:</span> {new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p><span className="font-medium">Bill No:</span> [Will be generated on save]</p>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="mb-6 border border-gray-300 rounded p-4">
          <h3 className="font-bold mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p><span className="font-medium">Name:</span> {billData.patient.full_name}</p>
            <p><span className="font-medium">Patient ID:</span> {billData.patient.patient_id_code}</p>
            <p><span className="font-medium">Age/Gender:</span> {billData.patient.age}Y / {billData.patient.gender}</p>
            <p><span className="font-medium">Contact:</span> {billData.patient.contact_number}</p>
            <p><span className="font-medium">Doctor:</span> {billData.admission.doctors?.name}</p>
            <p><span className="font-medium">Room:</span> {billData.admission.ip_admissions?.[0]?.room_number || 'N/A'}</p>
            <p><span className="font-medium">Admission:</span> {billData.admission.ip_admissions?.[0]?.admission_date}</p>
            <p><span className="font-medium">Discharge:</span> {billData.admission.ip_admissions?.[0]?.discharge_date || new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Bill Items Table */}
        <div className="mb-6">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">S.No</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">Rate</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.lineItems.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.category}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.description}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category Totals */}
        <div className="mb-6 border border-gray-300 rounded p-4">
          <h3 className="font-bold mb-3">Category-wise Summary</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(billData.categoryTotals).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>{category}:</span>
                <span className="font-medium">₹{(amount as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final Totals */}
        <div className="border-t-2 border-gray-800 pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span>₹{billData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Paid Amount:</span>
              <span>₹{billData.paidAmount.toFixed(2)}</span>
            </div>
            {billData.outstanding > 0 && (
              <div className="flex justify-between text-red-600 font-bold text-base">
                <span>Outstanding Amount:</span>
                <span>₹{billData.outstanding.toFixed(2)}</span>
              </div>
            )}
            {billData.refundable > 0 && (
              <div className="flex justify-between text-blue-600 font-bold text-base">
                <span>Refundable Amount:</span>
                <span>₹{billData.refundable.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>
              <p>Created By: {billData.createdBy}</p>
              <p>Date: {new Date().toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Authorized Signature</p>
              <div className="mt-8 border-t border-gray-400 w-48"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Update App.tsx

Add the route for both pages:

```typescript
import DischargeBills from './pages/DischargeBills';
import DischargeBillPreview from './components/DischargeBillPreview';

// In the Routes section, add:
<Route path="/discharge-bills" element={<DischargeBills />} />
<Route path="/discharge-bill-preview" element={<DischargeBillPreview />} />
```

### 3. Update Layout.tsx

Add navigation link:

```typescript
// In the navigation menu items, add:
{
  name: 'Discharge Bills',
  icon: FileText,
  path: '/discharge-bills',
}
```

### 4. Integrate with Billing.tsx

In the `searchInvoices` function, add discharge bills search:

```typescript
// Add discharge bill search
if (!serviceType || serviceType === 'discharge') {
  let query = supabase
    .from('discharge_bills')
    .select(`
      *,
      patients(patient_id_code, full_name)
    `);

  if (patientIds.length > 0) {
    query = query.or(`bill_no.ilike.%${searchTerm}%,patient_id.in.(${patientIds.join(',')})`);
  } else {
    query = query.ilike('bill_no', `%${searchTerm}%`);
  }

  const { data: dischargeBillData } = await query;

  if (dischargeBillData) {
    results.push(...dischargeBillData.map(d => ({
      ...d,
      date: d.created_at,
      service_type: 'Discharge Bill',
      payment_amount: d.total_amount
    })));
  }
}
```

## Testing Steps

1. Apply the migration in Supabase SQL Editor
2. Restart dev server
3. Navigate to Discharge Bills
4. Search for an IP patient
5. Verify all services are loaded
6. Add/edit line items
7. Preview the bill
8. Save the bill
9. Print the bill
10. Search for saved bills in Billing module

## Success Criteria

- ✅ Section selector works (Pediatrics/Dermatology)
- ✅ Patient search loads IP admissions
- ✅ Services auto-populate
- ✅ Line items are editable
- ✅ Totals calculate correctly
- ✅ Preview displays A4 format
- ✅ Bills save with sequential numbers
- ✅ Bills appear in Billing search
- ✅ Print output is clean A4

## Notes

- Bill numbers format: `DBILL-2025-00001`, `DBILL-2025-00002`, etc.
- Only IP patients with completed registrations can have discharge bills
- Outstanding amount = Total - Paid
- Refundable amount = Paid - Total (if positive)
- Category totals group by category name
- All amounts in INR (₹)
