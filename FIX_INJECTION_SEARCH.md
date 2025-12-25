# 🩹 Fix Injection Module Search - Quick Guide

## Problem Fixed
The Injection module was failing with:
```
22P02: invalid input syntax for type uuid: "AAYUSH-000007"
```

## Solution Applied
Changed search to use **Patient ID Code** instead of UUID.

---

## 🚀 Apply These 2 Migrations (In Order!)

### 1. Add Patient ID Code Column
**File:** `supabase/migrations/20250914193000_add_patient_id_code.sql`

**Go to:** https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new

Copy, paste, run.

**What it does:**
- Adds `patient_id_code` column (AAYUSH-YYYY-NNN format)
- Creates auto-generation function
- Backfills existing patients
- Creates indexes

---

### 2. Update Registration Function
**File:** `supabase/migrations/20250914193500_update_registration_function.sql`

Copy, paste, run (same SQL editor).

**What it does:**
- Updates patient registration to use new ID format
- Returns new ID in API response

---

## ✅ What Changed

### Patient ID Format
**Old:** `AAYUSH-000001`, `AAYUSH-000002`
**New:** `AAYUSH-2025-001`, `AAYUSH-2025-002`

Sequence resets each year!

### Injection Module UI
**Before:**
- Search by "Registration ID"
- Input: UUID

**After:**
- Search by "Patient ID"
- Input: AAYUSH-2025-001

---

## 📋 How to Use (After Migrations)

1. **Register a new patient** → Get ID like `AAYUSH-2025-001`
2. **Open Injection module**
3. **Enter Patient ID:** `AAYUSH-2025-001`
4. **Click Search** → Patient info auto-fills
5. **Fill injection details** → Submit

---

## 🧪 Test It

1. Apply both migrations
2. Register a test patient
3. Note the patient ID from confirmation
4. Go to Injections page
5. Search using that patient ID
6. Verify info loads correctly

---

## 📊 Migration Summary

| Migration File | Purpose |
|---------------|---------|
| `20250914193000_add_patient_id_code.sql` | Add new ID column + generation |
| `20250914193500_update_registration_function.sql` | Update registration to use new IDs |

---

## ⚡ Quick Checklist

- [ ] Apply migration 1
- [ ] Apply migration 2
- [ ] Register new patient
- [ ] Test Injection module search
- [ ] Verify patient info loads
- [ ] Submit test injection record

---

**Result:** Injection module now works with human-readable patient IDs! 🎉
