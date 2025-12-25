# 🩹 Injection Module - Setup Guide

## Overview

The Injection Module allows HMS staff to record injection administration details with proper relationships to existing patient registrations.

---

## ✅ What Has Been Created

### 1. Database Schema
**File:** `supabase/migrations/20250914192000_create_injections_table.sql`

**Table:** `injections`
- `id` (uuid, primary key)
- `registration_id` (FK to registrations)
- `patient_id` (FK to patients)
- `doctor_id` (FK to doctors)
- `date` (timestamp, default now)
- `payment_method` ('Cash' or 'UPI')
- `payment_amount` (numeric with 2 decimals)
- `injection_details` (optional text)
- `created_at`, `updated_at` (automatic timestamps)

**Features:**
- ✅ Proper foreign key relationships
- ✅ Cascades on registration deletion
- ✅ Restricts on patient/doctor deletion
- ✅ Indexes for fast queries
- ✅ RLS enabled with proper policies
- ✅ Auto-updating timestamps

### 2. TypeScript Types
**File:** `src/lib/supabase.ts`

**Added:**
- `Injection` interface
- Database service methods:
  - `getInjections()` - Get all injections
  - `getInjectionById(id)` - Get single injection
  - `getInjectionsByPatient(patientId)` - Get injections by patient
  - `getInjectionsByRegistration(registrationId)` - Get injections by registration
  - `createInjection(data)` - Create new injection record
  - `getRegistrationWithPatient(registrationId)` - Auto-fill patient data

### 3. UI Components
**File:** `src/pages/Injections.tsx`

**Features:**
- Registration ID search with auto-fill
- Patient information display
- Date picker (defaults to today)
- Payment method selector (Cash/UPI)
- Payment amount input
- Injection details textarea
- Real-time validation
- Success/error messaging
- Form reset after successful submission

### 4. Navigation
**Files Updated:**
- `src/App.tsx` - Added route `/injections`
- `src/components/Layout.tsx` - Added "Injections" menu item with syringe icon

---

## 🚀 Setup Instructions

### Step 1: Apply the Database Migration

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

2. **Copy the migration:**
   Open: `supabase/migrations/20250914192000_create_injections_table.sql`

3. **Paste and run** the SQL in the editor

4. **Expected output:**
   ```
   ✅ Injections table created successfully with all relationships and indexes
   ```

### Step 2: Verify Installation

After applying the migration:
1. Start your dev server (if not already running)
2. Navigate to `/injections` in your HMS application
3. You should see the Injection Module page

---

## 📖 How to Use

### Recording an Injection

1. **Navigate to Injections**
   - Click "Injections" in the sidebar menu

2. **Search for Registration**
   - Enter a valid Registration ID (UUID)
   - Click "Search" or press Enter
   - Patient information will auto-fill

3. **Fill Injection Details**
   - **Date:** Defaults to today (editable)
   - **Payment Method:** Select Cash or UPI (required)
   - **Payment Amount:** Enter amount in ₹ (required)
   - **Injection Details:** Optional notes about the injection

4. **Submit**
   - Click "Save Injection Record"
   - Success message will appear
   - Form will reset for next entry

---

## 🔍 Field Details

### Registration ID
- **Type:** UUID
- **Required:** Yes
- **Purpose:** Links injection to a specific patient registration
- **How to get:** From the registration workflow or patient records

### Auto-Filled Fields
When a valid Registration ID is entered:
- Patient ID (AAYUSH-XXXXXX format)
- Patient Name
- Age & Gender
- Contact Number
- Registration Type (IP/OP)

### Payment Fields
- **Method:** Cash or UPI (dropdown)
- **Amount:** Numeric, minimum 0, supports decimals
- **Purpose:** Track injection service payments

### Injection Details
- **Type:** Textarea (optional)
- **Purpose:** Record medication name, dosage, notes, side effects, etc.
- **Example:** "Tetanus toxoid, 0.5ml, IM, left deltoid"

---

## 🔗 Database Relationships

```
injections
  ├── registration_id → registrations.id (CASCADE on delete)
  ├── patient_id → patients.id (RESTRICT on delete)
  └── doctor_id → doctors.id (RESTRICT on delete)
```

**Cascade Behavior:**
- If a registration is deleted, associated injections are deleted
- Patients and doctors cannot be deleted if they have injection records

---

## 📊 Integration with HMS

The Injection Module integrates seamlessly:

1. **Registration Workflow**
   - Uses existing patient registrations
   - Links to registered patients and doctors

2. **Patient Records**
   - Injection history can be queried per patient
   - Viewable through patient profiles (future enhancement)

3. **Financial Tracking**
   - Payment methods tracked (Cash/UPI)
   - Amount recorded for billing/reporting

4. **Doctor Assignment**
   - Links to the doctor from the original registration
   - Maintains provider accountability

---

## 🛡️ Security & Validation

### Database Level
- ✅ Foreign key constraints
- ✅ Check constraints on payment_method
- ✅ Non-negative payment amounts
- ✅ Row Level Security enabled
- ✅ Indexed for performance

### UI Level
- ✅ Required field validation
- ✅ Type checking (date, number)
- ✅ Minimum value validation (amount > 0)
- ✅ Real-time error feedback
- ✅ Success confirmation

---

## 🔧 Future Enhancements

Potential additions:
- Injection history view in Patient Profile page
- Bulk injection recording
- Medication inventory integration
- Injection type categorization
- Adverse reaction tracking
- Appointment scheduling for follow-up injections

---

## 📝 Example Usage

### Scenario: Recording a Vaccination

1. Patient comes for vaccination after registration
2. Staff opens Injection Module
3. Enters Registration ID from patient's registration slip
4. Patient info auto-fills
5. Selects:
   - Date: Today
   - Payment Method: Cash
   - Amount: ₹150
   - Details: "Hepatitis B vaccine, 1ml, IM, right deltoid"
6. Clicks "Save Injection Record"
7. Record saved successfully
8. Form ready for next patient

---

## ✅ Checklist

Before using the Injection Module:
- [ ] Database migration applied successfully
- [ ] Application builds without errors
- [ ] "Injections" menu item appears in sidebar
- [ ] Can navigate to `/injections` page
- [ ] Have valid Registration IDs to test with
- [ ] Understand the registration workflow

---

## 🆘 Troubleshooting

### "Registration ID not found"
- Verify the ID is correct (UUIDs are case-sensitive)
- Check that registration exists in database
- Ensure registration is not deleted

### "Payment method is required"
- Select either Cash or UPI from dropdown
- Cannot submit without payment method

### "Payment amount is required"
- Enter a valid positive number
- Use decimals for paisa (e.g., 150.50)

### Database Error
- Verify migration was applied successfully
- Check RLS policies allow anon/authenticated access
- Review browser console for detailed errors

---

## 📞 Support

The Injection Module is now fully integrated into your HMS system!

**Migration File:** `supabase/migrations/20250914192000_create_injections_table.sql`

Apply this migration and start recording injection administration immediately! 🎉
