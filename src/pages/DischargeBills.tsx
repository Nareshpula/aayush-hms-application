import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Plus, Minus } from 'lucide-react';
import { DatabaseService, type Patient, type DischargeBillItem } from '../lib/supabase';
import { useDebounce } from '../lib/hooks';

interface BillLineItem extends Omit<DischargeBillItem, 'id' | 'discharge_bill_id'> {
  tempId: string;
}

export default function DischargeBills() {
  const navigate = useNavigate();
  const [section, setSection] = useState<'Pediatrics' | 'Dermatology'>('Pediatrics');
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [admission, setAdmission] = useState<any>(null);
  const [services, setServices] = useState<any>(null);
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdBy, setCreatedBy] = useState('Admin');
  const [existingDischargeBill, setExistingDischargeBill] = useState<any>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (debouncedSearchTerm.trim().length >= 2) {
      handleSearch();
    } else if (debouncedSearchTerm.trim().length === 0) {
      setPatients([]);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const results = await DatabaseService.searchPatientByNameOrId(searchTerm);
      setPatients(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient: Patient) => {
    setLoading(true);
    try {
      const admissionData = await DatabaseService.getActiveIPAdmissionForPatient(patient.id);
      if (!admissionData) {
        alert('No active IP admission found for this patient');
        setLoading(false);
        return;
      }

      setSelectedPatient(patient);
      setAdmission(admissionData);

      const dischargeBill = await DatabaseService.getDischargeBillByRegistrationId(admissionData.id);
      setExistingDischargeBill(dischargeBill);

      const items: BillLineItem[] = [];
      let tempIdCounter = 1;

      if (dischargeBill && dischargeBill.discharge_bill_items && dischargeBill.discharge_bill_items.length > 0) {
        dischargeBill.discharge_bill_items.forEach((savedItem: any) => {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: savedItem.category,
            description: savedItem.description,
            quantity: savedItem.quantity,
            rate: savedItem.rate,
            amount: savedItem.amount,
            reference_id: savedItem.reference_id,
            reference_type: savedItem.reference_type
          });
        });
      } else {
        const servicesData = await DatabaseService.getPatientServicesByRegistration(admissionData.id);
        setServices(servicesData);

        if (admissionData.payment_amount) {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: 'Registration',
            description: 'IP Registration Fee',
            quantity: 1,
            rate: admissionData.payment_amount,
            amount: admissionData.payment_amount
          });
        }

        servicesData.injections.forEach((inj: any) => {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: 'Injections',
            description: inj.injection_details || 'Injection',
            quantity: 1,
            rate: inj.payment_amount || 0,
            amount: inj.payment_amount || 0,
            reference_id: inj.id,
            reference_type: 'injection'
          });
        });

        servicesData.vaccinations.forEach((vac: any) => {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: 'Vaccinations',
            description: vac.vaccination_details || 'Vaccination',
            quantity: 1,
            rate: vac.payment_amount || 0,
            amount: vac.payment_amount || 0,
            reference_id: vac.id,
            reference_type: 'vaccination'
          });
        });

        servicesData.newbornVaccinations.forEach((nb: any) => {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: 'Newborn Vaccination',
            description: nb.vaccination_details || 'Newborn Vaccination',
            quantity: 1,
            rate: nb.payment_amount || 0,
            amount: nb.payment_amount || 0,
            reference_id: nb.id,
            reference_type: 'newborn_vaccination'
          });
        });

        servicesData.dermatologyProcedures.forEach((derm: any) => {
          items.push({
            tempId: `temp-${tempIdCounter++}`,
            category: 'Dermatology',
            description: derm.procedure_details || 'Dermatology Procedure',
            quantity: 1,
            rate: derm.payment_amount || 0,
            amount: derm.payment_amount || 0,
            reference_id: derm.id,
            reference_type: 'dermatology'
          });
        });
      }

      setLineItems(items);
    } catch (error) {
      console.error('Error loading patient data:', error);
      alert('Error loading patient data');
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      tempId: `temp-${Date.now()}`,
      category: 'Misc',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }]);
  };

  const updateLineItem = (tempId: string, field: keyof BillLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.tempId === tempId) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter(item => item.tempId !== tempId));
  };

  const calculateTotals = () => {
    const categoryTotals: { [key: string]: number } = {};
    lineItems.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    if (existingDischargeBill) {
      const ipJoiningAmount = existingDischargeBill.ip_joining_amount || 0;
      const totalAmount = existingDischargeBill.total_amount || 0;
      const paidAmount = existingDischargeBill.paid_amount || 0;
      const amountReceivable = totalAmount - ipJoiningAmount;

      return {
        categoryTotals,
        totalAmount,
        paidAmount,
        outstanding: amountReceivable,
        refundable: 0,
        ipJoiningAmount,
        amountReceivable,
        existingBillNo: existingDischargeBill.bill_no
      };
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const paidAmount = admission?.payment_amount || 0;
    const outstanding = totalAmount - paidAmount;
    const refundable = paidAmount > totalAmount ? paidAmount - totalAmount : 0;

    return { categoryTotals, totalAmount, paidAmount, outstanding, refundable };
  };

  const handlePreview = () => {
    if (!selectedPatient || !admission || lineItems.length === 0) {
      alert('Please complete all fields before preview');
      return;
    }

    const totals = calculateTotals();
    const billData = {
      section,
      patient: selectedPatient,
      admission,
      lineItems,
      ...totals,
      createdBy,
      existingDischargeBill,
      useExistingBillData: !!existingDischargeBill
    };

    navigate('/discharge-bill-preview', { state: billData });
  };

  const totals = selectedPatient ? calculateTotals() : null;
  
const formatAdmissionDateTime = (date?: string, time?: string) => {
  if (!date) return 'N/A';

  const formattedDate = new Date(date).toLocaleDateString('en-IN');

  if (!time) return formattedDate;

  return `${formattedDate}, ${time}`;
};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ color: '#7c3b92' }}>Discharge Bills</h1>
        <p className="text-gray-600">Generate final discharge bills for IP patients</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
          <div className="flex gap-4">
            <button
              onClick={() => setSection('Pediatrics')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                section === 'Pediatrics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pediatrics
            </button>
            <button
              onClick={() => setSection('Dermatology')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                section === 'Dermatology'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dermatology
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by Patient ID, Name, or Phone"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {patients.length > 0 && !selectedPatient && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
            <div className="space-y-2">
              {patients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="font-medium">{patient.full_name}</div>
                  <div className="text-sm text-gray-600">
                    {patient.patient_id_code} | {patient.contact_number} | Age: {patient.age}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedPatient && admission && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {selectedPatient.full_name}</div>
                <div><span className="font-medium">ID:</span> {selectedPatient.patient_id_code}</div>
                <div><span className="font-medium">Age/Gender:</span> {selectedPatient.age}Y / {selectedPatient.gender}</div>
                <div><span className="font-medium">Contact:</span> {selectedPatient.contact_number}</div>
                <div><span className="font-medium">Doctor:</span> {admission.doctors?.name}</div>
                <div><span className="font-medium">Room:</span> {admission.ip_admissions?.[0]?.room_number || 'N/A'}</div>
                <div><span className="font-medium">Admission:</span> {' '}{formatAdmissionDateTime(admission.ip_admissions?.[0]?.admission_date,admission.ip_admissions?.[0]?.admission_time)}</div>
                <div><span className="font-medium">Discharge:</span> {admission.ip_admissions?.[0]?.discharge_date || new Date().toISOString().split('T')[0]}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Bill Items</h3>
                <button
                  onClick={addLineItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rate</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map(item => (
                      <tr key={item.tempId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => updateLineItem(item.tempId, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            disabled={!!item.reference_id}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.tempId, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.tempId, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.tempId, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">₹{item.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeLineItem(item.tempId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove item"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totals && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  {!existingDischargeBill && Object.entries(totals.categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-gray-600">{category}:</span>
                      <span className="font-medium">₹{(amount as number).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    {existingDischargeBill && (
                      <>
                        {existingDischargeBill.bill_no && (
                          <div className="flex justify-between font-medium text-blue-600 mb-2">
                            <span>Existing Bill No:</span>
                            <span>{existingDischargeBill.bill_no}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{totals.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Advance:</span>
                          <span>₹{(totals as any).ipJoiningAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-orange-600 font-medium">
                          <span>Amount Receivable:</span>
                          <span>₹{(totals as any).amountReceivable?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Amount Received:</span>
                          <span>₹{totals.paidAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {!existingDischargeBill && (
                      <>
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <span>₹{totals.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Paid Amount:</span>
                          <span>₹{totals.paidAmount.toFixed(2)}</span>
                        </div>
                        {totals.outstanding > 0 && (
                          <div className="flex justify-between text-red-600 font-medium">
                            <span>Outstanding:</span>
                            <span>₹{totals.outstanding.toFixed(2)}</span>
                          </div>
                        )}
                        {totals.refundable && totals.refundable > 0 && (
                          <div className="flex justify-between text-blue-600 font-medium">
                            <span>Refundable:</span>
                            <span>₹{totals.refundable.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePreview}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                <FileText className="w-5 h-5" />
                Preview & Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
