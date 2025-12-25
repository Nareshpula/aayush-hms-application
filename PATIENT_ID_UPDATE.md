# 🆔 Patient ID Format Update - AAYUSH-YYYY-NNN

## Overview

Updated patient ID format from `AAYUSH-XXXXXX` to **`AAYUSH-YYYY-NNN`** with year-based sequential numbering.

---

## ✅ What Changed

### New Format
**Pattern:** `AAYUSH-<YEAR>-<SEQUENCE>`

**Examples:**
- AAYUSH-2025-001
- AAYUSH-2025-002
- AAYUSH-2025-003
- ...
- AAYUSH-2026-001 (sequence resets on new year)

### Database Changes

1. **New Column:** `patient_id_code` added to `patients` table
   - Stores the new format (AAYUSH-YYYY-NNN)
   - Unique constraint enforced
   - Indexed for fast lookups

2. **New Function:** `generate_patient_id_code()`
   - Auto-generates year-based IDs
   - Resets sequence each year
   - Zero-pads to 3 digits (001, 002, etc.)

3. **Updated Function:** `create_complete_registration()`
   - Now uses `generate_patient_id_code()`
   - Returns `patient_id_code` in response
   - Maintains backward compatibility with `patient_id`

---

## 🚀 Apply These Migrations

You need to apply **2 new migrations** in order:

### Migration 1: Add patient_id_code Column
**File:** `supabase/migrations/20250914193000_add_patient_id_code.sql`

**What it does:**
- ✅ Adds `patient_id_code` column
- ✅ Creates `generate_patient_id_code()` function
- ✅ Backfills existing records with new IDs
- ✅ Creates unique index

**Go to:** https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

Copy the SQL from the migration file, paste, and click "Run".

---

### Migration 2: Update Registration Function
**File:** `supabase/migrations/20250914193500_update_registration_function.sql`

**What it does:**
- ✅ Updates `create_complete_registration()` to use new ID format
- ✅ Returns `patient_id_code` in API response
- ✅ Maintains backward compatibility

Apply this migration the same way (copy, paste, run in SQL editor).

---

## 📱 UI Updates

### Injection Module
**Changed:** Search now uses Patient ID instead of Registration UUID

**Before:**
- Field: "Registration ID"
- Placeholder: "Enter Registration ID (UUID)"
- Input: UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)

**After:**
- Field: "Patient ID"
- Placeholder: "Enter Patient ID (e.g., AAYUSH-2025-001)"
- Input: New format (e.g., AAYUSH-2025-001)

**How it works:**
1. Enter patient ID (AAYUSH-2025-001)
2. System finds patient by `patient_id_code`
3. Auto-loads patient info + most recent registration
4. Fill injection details and submit

---

## 🔄 Migration Impact

### Existing Data
- ✅ All existing patients get new IDs automatically
- ✅ Old `patient_id` column preserved
- ✅ No data loss
- ✅ Backward compatible

### New Registrations
- ✅ Auto-generates AAYUSH-YYYY-NNN format
- ✅ Sequence starts at 001 for each year
- ✅ Returns new format in API response

---

## 📊 How Sequences Work

### Year 2025
```
Patient 1: AAYUSH-2025-001
Patient 2: AAYUSH-2025-002
Patient 3: AAYUSH-2025-003
...
Patient 100: AAYUSH-2025-100
```

### Year 2026 (sequence resets)
```
Patient 1: AAYUSH-2026-001
Patient 2: AAYUSH-2026-002
...
```

### Query Logic
The function finds the highest sequence number for the current year:

```sql
SELECT MAX(sequence) FROM patients
WHERE patient_id_code LIKE 'AAYUSH-2025-%'
```

Then increments: `MAX + 1`

---

## 🔧 API Changes

### Database Service Methods

**New Methods:**
```typescript
// Get patient by patient_id_code
getPatientByIdCode(patientIdCode: string): Promise<Patient | null>

// Get patient + most recent registration
getPatientWithRegistration(patientIdCode: string): Promise<{
  patient: Patient | null;
  registration: Registration | null;
}>
```

**Updated Interface:**
```typescript
interface Patient {
  id: string;
  patient_id: string;
  patient_id_code?: string;  // NEW FIELD
  full_name: string;
  // ... other fields
}
```

---

## ✨ Benefits

1. **Human-Readable:** Easy to remember and communicate
2. **Year-Based:** Clear annual organization
3. **Sequential:** Simple counting within each year
4. **Unique:** Database constraints ensure no duplicates
5. **Searchable:** Fast indexed lookups
6. **Predictable:** Format is consistent and familiar

---

## 🧪 Testing

### Test the Update

1. **Apply both migrations**
2. **Register a new patient** via Registration module
3. **Check the confirmation screen** - should show new format
4. **Go to Injection module**
5. **Enter the patient ID** (AAYUSH-2025-XXX)
6. **Verify patient info loads** correctly
7. **Submit an injection record**

### Verify in Database

Run this query in Supabase SQL Editor:

```sql
SELECT patient_id, patient_id_code, full_name, created_at
FROM patients
ORDER BY created_at DESC
LIMIT 10;
```

Should see:
- `patient_id`: Old format (for backward compat)
- `patient_id_code`: New format (AAYUSH-YYYY-NNN)

---

## 🔍 Troubleshooting

### "Patient ID not found" in Injection module
- Verify patient was registered **after** applying migrations
- Check the exact ID from registration confirmation
- IDs are case-sensitive: use uppercase AAYUSH

### Sequence numbering seems wrong
- Check current year in database vs. your system
- Verify `generate_patient_id_code()` function exists
- Re-apply migration 1 if needed (it's idempotent)

### Old format still showing
- Patient was registered before migration
- Old patients keep old format
- New patients get new format
- Both formats work side-by-side

---

## 📋 Checklist

Before declaring success:

- [ ] Both migrations applied successfully
- [ ] No SQL errors in migration output
- [ ] Registration module still works
- [ ] New patients get AAYUSH-YYYY-NNN IDs
- [ ] Injection module searches by patient ID
- [ ] Patient info auto-fills correctly
- [ ] Can submit injection records
- [ ] Old patients still accessible (if any)

---

## 📞 Summary

**Apply 2 migrations → Restart dev server → Test registration + injection workflow**

**Migrations:**
1. `20250914193000_add_patient_id_code.sql`
2. `20250914193500_update_registration_function.sql`

**Result:** Year-based patient IDs (AAYUSH-2025-001, etc.) working in all modules! 🎉
