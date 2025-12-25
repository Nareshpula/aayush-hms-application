# Discharge Patients Module - Complete Workflow Guide

## ✅ What Was Fixed

### Previous Issues:
❌ No way to add new discharge entries
❌ No "Add Discharge" button
❌ Module only showed existing records
❌ Unclear how discharge entries were created
❌ No connection between registrations and discharge

### New Features Added:
✅ **"Add Discharge Entry"** button in top right
✅ Smart patient selection from available registrations
✅ Auto-filters registrations by department (Pediatrics/Dermatology)
✅ Prevents duplicate discharge entries automatically
✅ Auto-calculates outstanding and refund amounts
✅ Enhanced search includes Bill Number
✅ Professional discharge entry form
✅ Real-time billing calculations

---

## 📋 Complete Workflow

### Step 1: Navigate to Discharge Patients
1. Login to AAYUSH HMS
2. Click **"Discharge Patients"** in the left sidebar
3. You'll see two tabs: **Pediatrics** and **Dermatology**

### Step 2: Add New Discharge Entry
1. Click the **"Add Discharge Entry"** button (top right, blue button with + icon)
2. The modal will open showing available registrations for the selected department

### Step 3: Select Patient
The system shows:
- All registrations from the selected department (Pediatrics or Dermatology)
- Only patients who HAVE NOT been discharged yet
- Patient details: Name, ID, Age, Gender, Contact, Doctor, Registration Type

**Click on any patient card** to select them for discharge

### Step 4: Fill Discharge Details
After selecting a patient, you'll see a form with:

**Auto-Populated Fields:**
- Patient Information (Name, ID, Age, Gender, Contact, Doctor)
- Admission Date (from registration date)
- Discharge Date (defaults to today)

**Fields You Need to Fill:**

1. **Admission Date** - Can adjust if needed
2. **Discharge Date** - Adjust as needed
3. **Total Bill Amount (₹)** - Enter the total bill
4. **Paid Amount (₹)** - Enter amount paid by patient
5. **Outstanding Amount** - Auto-calculated (Total - Paid)
6. **Refundable Amount** - Auto-calculated (Paid - Total, if overpaid)
7. **Payment Method** - Select Cash or UPI
8. **Notes** - Optional notes about discharge

**Smart Auto-Calculation:**
- When you enter Total Amount and Paid Amount
- Outstanding = Total - Paid (if Total > Paid)
- Refundable = Paid - Total (if Paid > Total)
- Both update automatically as you type!

### Step 5: Save Discharge Record
1. Review all details
2. Click **"Save Discharge Record"** button (green button with checkmark)
3. System generates unique Bill Number (format: DBILL-2025-00001)
4. Record is saved with status "Discharged (Finalized)"

### Step 6: View & Manage Discharge Records

**Search & Filter:**
- Search by: Patient ID, Name, Phone Number, or Bill Number
- Filter by: Date Range (From/To)
- Filter by: Doctor
- Filter by: Status (Pending/Discharged)

**Actions Available:**
- 👁️ **View** - Opens detailed bill preview
- 🖨️ **Print** - Opens bill preview and triggers print dialog
- ✓ **Finalize** - Mark draft bills as finalized (if status is draft)

**Export:**
- Click **"Export to Excel"** to download CSV file with all filtered records

---

## 🔄 How It Works (Technical Flow)

### 1. Data Source
```
Registrations Table → Filter by Department → Exclude Already Discharged → Show Available Patients
```

### 2. Department Filtering
- **Pediatrics Tab**: Shows only doctors where `department = 'Pediatrics'`
- **Dermatology Tab**: Shows only doctors where `department = 'Dermatology'`

### 3. Duplicate Prevention
- Database trigger prevents duplicate discharge entries
- Same registration cannot be discharged twice
- Error shown if attempted: "This patient has already been discharged"

### 4. Bill Number Generation
- Format: `DBILL-YYYY-XXXXX`
- Example: `DBILL-2025-00001`
- Auto-incremented using sequence
- Unique per bill

### 5. Data Storage
All information stored in `discharge_bills` table:
- Bill number, section (department)
- Patient ID, Registration ID, Doctor ID
- Admission & Discharge dates
- Billing amounts (total, paid, outstanding, refundable)
- Payment method, status, notes
- Timestamps (IST timezone)

---

## 📊 Example Scenarios

### Scenario 1: Full Payment
- Patient: Ram Kumar (AAYUSH-2025-001)
- Total Bill: ₹10,000
- Paid Amount: ₹10,000
- **Result**: Outstanding = ₹0, Refundable = ₹0
- Status: Discharged

### Scenario 2: Partial Payment
- Patient: Sita Devi (AAYUSH-2025-002)
- Total Bill: ₹15,000
- Paid Amount: ₹10,000
- **Result**: Outstanding = ₹5,000, Refundable = ₹0
- Status: Discharged (patient owes ₹5,000)

### Scenario 3: Overpayment
- Patient: Arjun Singh (AAYUSH-2025-003)
- Total Bill: ₹8,000
- Paid Amount: ₹10,000
- **Result**: Outstanding = ₹0, Refundable = ₹2,000
- Status: Discharged (refund ₹2,000 to patient)

---

## 🎯 Key Features

### Smart Patient Selection
✅ Shows ONLY patients not yet discharged
✅ Filters by department automatically
✅ Shows all relevant patient info at a glance
✅ Click to select - no typing needed

### Real-Time Calculations
✅ Outstanding amount auto-calculated
✅ Refund amount auto-calculated
✅ Updates instantly as you type
✅ No manual math required

### Duplicate Prevention
✅ Database-level trigger blocks duplicates
✅ Same patient can't be discharged twice
✅ Clear error message if attempted
✅ Data integrity maintained

### Comprehensive Search
✅ Search by Patient ID
✅ Search by Patient Name
✅ Search by Phone Number
✅ Search by Bill Number
✅ Real-time filtering

### Professional Bill Preview
✅ Hospital header (AAYUSH Hospital)
✅ Complete patient information
✅ Admission details
✅ Billing breakdown
✅ Payment method
✅ Optional notes section
✅ Timestamp (IST)
✅ Print-friendly format

---

## 🔍 Troubleshooting

### Issue: No patients appear when clicking "Add Discharge Entry"
**Cause**: All patients in that department have already been discharged
**Solution**: 
- Switch to other department tab (Pediatrics/Dermatology)
- Register new patients first in Registration module
- Check if registrations exist for that department

### Issue: "This patient has already been discharged" error
**Cause**: Attempting to create duplicate discharge entry
**Solution**: 
- This patient is already discharged
- View existing discharge record using search
- If need to modify, contact admin or delete old record first

### Issue: Can't find a specific patient
**Solution**: 
- Use search box (top of page)
- Search by Patient ID, Name, or Phone
- Check if correct department tab is selected
- Verify patient was registered in this department

### Issue: Outstanding/Refundable amounts not calculating
**Cause**: Values not entered as numbers
**Solution**: 
- Enter numeric values only
- Use decimal point for paisa (e.g., 1500.50)
- Don't include ₹ symbol
- Both Total and Paid amounts must be filled

---

## 📱 Mobile/Tablet Usage

The module is fully responsive:
- ✅ Works on desktop, tablet, and mobile
- ✅ Touch-friendly buttons and inputs
- ✅ Scrollable tables on small screens
- ✅ Modal forms adapt to screen size
- ✅ No horizontal scrolling issues

---

## 🎓 Training Tips

### For Front Desk Staff:
1. Always verify patient identity before creating discharge
2. Double-check billing amounts
3. Add notes for special cases
4. Print bill immediately after creating
5. Use search to verify no duplicate exists

### For Administrators:
1. Export data regularly for backup
2. Review outstanding amounts weekly
3. Process refunds promptly
4. Monitor both Pediatrics and Dermatology tabs
5. Train staff on proper workflow

---

## 📈 Reports & Analytics

### Available Data Export:
- Bill Number
- Patient ID & Name
- Age & Gender
- Contact Number
- Admission Type (IP/OP)
- Doctor Name
- Admission & Discharge Dates
- Total Bill Amount
- Paid Amount
- Outstanding Amount
- Refundable Amount
- Status

### Use Cases:
- Monthly revenue reports
- Outstanding payments tracking
- Refund processing
- Doctor-wise discharge statistics
- Department comparison
- Average billing analysis

---

## ✨ Summary

The Discharge Patients module is now FULLY FUNCTIONAL with:

1. ✅ **Add Discharge Entry** - Create new discharge records
2. ✅ **Smart Patient Selection** - Choose from available registrations
3. ✅ **Auto-Calculations** - Outstanding & refund amounts
4. ✅ **Duplicate Prevention** - Database-level protection
5. ✅ **Search & Filter** - Find records quickly
6. ✅ **View & Print Bills** - Professional discharge bills
7. ✅ **Export to Excel** - Data export for reporting
8. ✅ **Mobile Responsive** - Works on all devices
9. ✅ **IST Timezone** - Indian Standard Time throughout
10. ✅ **Department Separation** - Pediatrics & Dermatology tabs

**Next Step**: Start using the module! Add your first discharge entry now.
