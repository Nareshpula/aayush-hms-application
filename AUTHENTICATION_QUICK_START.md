# 🚀 Authentication Module - Quick Start Guide

## ⚡ 3-Step Setup

### Step 1: Apply Database Migration (2 minutes)

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/gatgyhxtgqmzwjatbmzk/sql/new
   ```

2. Open this file in your project:
   ```
   supabase/migrations/20250924000000_create_staff_users_authentication.sql
   ```

3. Copy ALL contents (182 lines) and paste into SQL Editor

4. Click **"Run"** button (or Ctrl+Enter)

5. Should see: `Success. 3 rows returned` ✅

---

### Step 2: Test Login (1 minute)

1. Restart your dev server (if running):
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:5173`
   - Should automatically redirect to `/login`

3. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

4. Click **"Sign In"**

5. Should redirect to Dashboard ✅

---

### Step 3: Test Features (2 minutes)

#### Test User Display
- Look at top-right corner
- Should see user avatar with "S" (System Administrator)
- Name: "System Administrator"
- Role: "admin"

#### Test Logout
- Click on user avatar (top-right)
- Click "Sign Out" button
- Should redirect to login page
- Try accessing `http://localhost:5173/patients`
- Should redirect back to login ✅

#### Test Protected Routes
- Without logging in, try: `http://localhost:5173/registration`
- Should redirect to login
- After login, all routes accessible ✅

---

## 🎯 That's It!

Your authentication system is now:
- ✅ Fully functional
- ✅ Secure (bcrypt passwords)
- ✅ Session-based
- ✅ Route protected

---

## 👥 Test Users

### Administrator
- Username: `admin`
- Password: `admin123`
- Role: Full access

### Receptionist
- Username: `receptionist`
- Password: `reception123`
- Role: Front desk

### Doctor
- Username: `doctor`
- Password: `doctor123`
- Role: Medical staff

---

## 🔐 Security Reminder

**⚠️ IMPORTANT:** In production:
1. Change all default passwords immediately
2. Use strong passwords (min 8 chars, mixed case, numbers)
3. Remove test users if not needed
4. Monitor last_login for inactive accounts

---

## 📖 Full Documentation

See `LOGIN_AUTHENTICATION_MODULE.md` for:
- Complete feature list
- Security details
- User management
- Troubleshooting
- Production deployment

---

## 🆘 Troubleshooting

### "Invalid username or password"
- Check migration was applied successfully
- Verify username (case-sensitive)
- Confirm password is correct

### Redirect loop
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Not redirecting after login
- Check browser console
- Verify migration created users
- Test with: `SELECT * FROM staff_users;` in Supabase

---

## ✅ Success Criteria

If you can:
1. ✅ Access login page
2. ✅ Login with admin/admin123
3. ✅ See user name at top-right
4. ✅ Access all HMS pages
5. ✅ Logout successfully
6. ✅ Cannot access pages when logged out

**You're all set!** 🎉

---

**Estimated Setup Time:** 5 minutes
**Status:** Production Ready ✅
