# Discharge Patients Module - UI Overview

## 🎨 Main Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Discharge Patients                    [+ Add Discharge Entry]  │
│  Track and manage discharged patients...                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Pediatrics Discharged Patients] [Dermatology Discharged...]   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [🔍 Search: Patient ID, Name...]  [From Date]  [To Date]      │
│  [All Doctors ▼]  [All Status ▼]  [📥 Export to Excel]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Bill No │ Patient │ Admission │ Doctor │ Dates │ Actions │  │
│  ├─────────┼─────────┼───────────┼────────┼───────┼─────────┤  │
│  │ DBILL-  │ Ram     │ IP        │ Dr.    │ Adm:  │ 👁 🖨 ✓  │  │
│  │ 2025-   │ Kumar   │           │ Singh  │ Dis:  │         │  │
│  │ 00001   │ ID: ... │           │        │       │         │  │
│  └─────────┴─────────┴───────────┴────────┴───────┴─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🆕 Add Discharge Entry Modal - Step 1: Select Patient

```
┌────────────────────────────────────────────────────────────┐
│  Add New Discharge Entry - Pediatrics              [X]     │
├────────────────────────────────────────────────────────────┤
│  Select Patient Registration                               │
│  (Available Pediatrics registrations without discharge)    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Ram Kumar                       Dr. Singh           │ │
│  │ ID: AAYUSH-2025-001            IP                   │ │
│  │ 5y / Male • 9876543210         23/11/2025          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Sita Devi                       Dr. Kumar           │ │
│  │ ID: AAYUSH-2025-002            OP                   │ │
│  │ 3y / Female • 9876543211       22/11/2025          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## ✏️ Add Discharge Entry Modal - Step 2: Fill Details

```
┌────────────────────────────────────────────────────────────┐
│  Add New Discharge Entry - Pediatrics              [X]     │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐│
│  │ Selected Patient                                       ││
│  │ Name: Ram Kumar          Doctor: Dr. Singh            ││
│  │ ID: AAYUSH-2025-001      Type: IP                     ││
│  │ Age/Gender: 5y / Male    Contact: 9876543210         ││
│  │ [Change Patient]                                      ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Admission Date *        Discharge Date *                 │
│  [2025-11-20      ]     [2025-11-23      ]               │
│                                                            │
│  Total Bill Amount (₹) * Paid Amount (₹) *               │
│  [10000.00        ]     [10000.00        ]               │
│                                                            │
│  Outstanding Amount (₹)  Refundable Amount (₹)           │
│  [0.00            ]     [0.00            ]               │
│  (Auto-calculated)       (Auto-calculated)                │
│                                                            │
│  Payment Method *                                         │
│  [Cash ▼          ]                                       │
│                                                            │
│  Notes (Optional)                                         │
│  [Patient discharged in good health...              ]    │
│  [                                                   ]    │
│                                                            │
│                           [Cancel] [✓ Save Discharge...]  │
└────────────────────────────────────────────────────────────┘
```

## 👁️ Bill Preview Modal

```
┌────────────────────────────────────────────────────────────┐
│  Discharge Bill Preview                            [X]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    AAYUSH Hospital                         │
│                    Discharge Bill                          │
│                 Bill No: DBILL-2025-00001                  │
│                                                            │
│  ┌─────────────────────────┬──────────────────────────┐   │
│  │ Patient Information     │ Admission Details        │   │
│  │                         │                          │   │
│  │ Patient ID: AAYUSH-..   │ Department: Pediatrics   │   │
│  │ Name: Ram Kumar         │ Admission Type: IP       │   │
│  │ Age/Gender: 5y / Male   │ Doctor: Dr. Singh        │   │
│  │ Contact: 9876543210     │ Admission: 20/11/2025    │   │
│  │ Address: ...            │ Discharge: 23/11/2025    │   │
│  └─────────────────────────┴──────────────────────────┘   │
│                                                            │
│  Billing Summary                                           │
│  ─────────────────────────────────────────────────────    │
│  Total Bill Amount:              ₹10,000.00               │
│  Amount Paid:                    ₹10,000.00               │
│  Outstanding Amount:             ₹0.00                     │
│  Payment Method:                 Cash                      │
│                                                            │
│  Notes                                                     │
│  Patient discharged in good health.                        │
│                                                            │
│  Generated on: 23/11/2025, 2:30 PM IST                    │
│  This is a computer generated bill                         │
│                                                            │
│                              [🖨 Print Bill] [Close]       │
└────────────────────────────────────────────────────────────┘
```

## 🎯 Button Locations & Functions

### Top Right Header:
- **[+ Add Discharge Entry]** - Blue button to add new discharge

### Filter Section:
- **Search Box** - Left side with magnifying glass icon
- **Date Filters** - From Date and To Date fields
- **Doctor Dropdown** - Filter by doctor
- **Status Dropdown** - Filter by discharge status
- **[Export to Excel]** - Download filtered data as CSV

### Table Actions (per row):
- **👁 View** - Blue eye icon - Opens bill preview
- **🖨 Print** - Gray printer icon - Opens bill and prints
- **✓ Finalize** - Green checkmark - Mark as finalized (if draft)

### Modal Buttons:
- **[X]** - Top right corner - Close modal
- **[Change Patient]** - Link button - Go back to patient selection
- **[Cancel]** - Gray button - Close without saving
- **[✓ Save Discharge Record]** - Green button - Save and close

## 🎨 Color Coding

### Status Badges:
- **Green Badge** - "Discharged" (finalized status)
- **Yellow Badge** - "Pending Final Bill" (draft status)

### Admission Type Badges:
- **Blue Badge** - "IP" (In-Patient)
- **Green Badge** - "OP" (Out-Patient)

### Billing Amounts:
- **Black** - Total Amount
- **Green** - Paid Amount
- **Red** - Outstanding Amount (money owed)
- **Blue** - Refundable Amount (money to return)

### Department Tabs:
- **Blue Underline** - Active tab
- **Gray** - Inactive tab

## 📱 Responsive Behavior

### Desktop (1200px+):
- Full table visible
- All filters in one row
- Modal centered, 4xl width

### Tablet (768px - 1199px):
- Table scrollable horizontally
- Filters wrap to 2 rows
- Modal full width with margins

### Mobile (<768px):
- Table cards instead of rows
- Filters stack vertically
- Modal full screen
- Touch-friendly buttons

## 🔔 User Feedback Messages

### Success:
- ✅ "Discharge record created successfully!"

### Errors:
- ❌ "This patient has already been discharged. Cannot create duplicate discharge record."
- ❌ "Please select a registration"
- ❌ "Please enter admission and discharge dates"
- ❌ "Please enter billing amounts"
- ❌ "Error loading available registrations"
- ❌ "Failed to save discharge record: [error message]"

## 🎬 User Journey Example

1. **User lands on page** → Sees empty state with "Add First Discharge Entry" button
2. **Clicks button** → Modal opens showing available patients
3. **Clicks patient card** → Form appears with patient details pre-filled
4. **Enters amounts** → Outstanding/Refund auto-calculate in real-time
5. **Clicks Save** → Success message, modal closes, table updates
6. **New discharge appears** → Can view, print, or finalize
7. **Clicks View** → Bill preview opens with all details
8. **Clicks Print** → Browser print dialog opens

## 💡 Key UI Improvements

✅ **Clear Call-to-Action** - Prominent "Add Discharge Entry" button
✅ **Visual Patient Selection** - Cards instead of dropdowns
✅ **Real-time Feedback** - Auto-calculations update as you type
✅ **Smart Filtering** - Shows only relevant patients
✅ **Professional Bills** - Clean, printable layout
✅ **Responsive Design** - Works on all devices
✅ **Consistent Styling** - Matches AAYUSH HMS theme
✅ **Loading States** - Spinners for async operations
✅ **Empty States** - Helpful messages when no data
✅ **Error Handling** - Clear error messages

The UI is now intuitive, professional, and ready for production use!
