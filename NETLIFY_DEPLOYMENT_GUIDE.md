# HMS Netlify Deployment Guide

## Production Build Completed ✓

This Hospital Management System is now ready for production deployment on Netlify.

---

## Deployment Methods

### Method 1: Drag & Drop Deployment (Recommended for First Deploy)

1. **Open Netlify**
   - Go to https://app.netlify.com
   - Log in to your account

2. **Deploy the `dist/` folder**
   - Drag and drop the entire `dist/` folder to the Netlify deploy zone
   - Wait for deployment to complete (usually 30-60 seconds)

3. **Configure Custom Domain**
   - Go to Site settings → Domain management
   - Add custom domain: `hms.aayushhospitalmpl.com`
   - Configure DNS according to Netlify instructions

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=https://gatgyhxtgqmzwjatbmzk.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdGd5aHh0Z3FtendqYXRibXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MzkwMzEsImV4cCI6MjA1MTIxNTAzMX0.NFTc_RRh8cADLNNb_N856RxoaA5PWxRjEayk_eBN6CI
     ```
   - Note: These are already baked into the build, but it's good practice to have them in Netlify

---

### Method 2: GitHub CI/CD (For Ongoing Updates)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial HMS production build"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - In Netlify dashboard: New site from Git
   - Connect your GitHub repository
   - Build settings are already configured in `netlify.toml`
   - Deploy!

---

## Build Output Structure

```
project/
├── dist/                          ← DEPLOY THIS FOLDER
│   ├── index.html                 (Entry point with relative paths)
│   └── assets/
│       ├── index-a9vD6Sp5.js     (Main application code - 341KB)
│       ├── vendor-CQ3yCU-2.js    (React, Router - 174KB)
│       ├── supabase-CuO-GRVS.js  (Supabase client - 126KB)
│       └── index-BSM9IMxQ.css    (Tailwind styles - 42KB)
│
├── netlify.toml                   (SPA routing + headers)
├── .env                           (Supabase connection)
└── vite.config.ts                 (Relative path config)
```

---

## Key Configurations

### ✅ SPA Routing (React Router)
- Configured in `netlify.toml`
- All routes (/, /patients, /billing, etc.) redirect to `/index.html`
- Works with browser refresh and deep links

### ✅ Relative Paths
- All assets use `./assets/` paths
- Works on any domain/subdomain without hardcoded URLs
- Compatible with: `hms.aayushhospitalmpl.com`

### ✅ Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection enabled
- Proper cache control for static assets

### ✅ Optimized Build
- Code splitting (vendor, supabase, app)
- Minified with esbuild
- Total size: ~680KB (gzipped: ~150KB)
- No source maps (production safe)

---

## Verification Checklist

After deployment, test these URLs:

- ✓ `https://hms.aayushhospitalmpl.com/` (Home/Login)
- ✓ `https://hms.aayushhospitalmpl.com/dashboard` (Dashboard)
- ✓ `https://hms.aayushhospitalmpl.com/patients` (Patient List)
- ✓ `https://hms.aayushhospitalmpl.com/registration` (Registration)
- ✓ `https://hms.aayushhospitalmpl.com/billing` (Billing)
- ✓ Refresh any page (should NOT show 404)
- ✓ Login functionality (Supabase auth)
- ✓ Database operations (patient CRUD)

---

## Database Connection

**Supabase Instance:** `gatgyhxtgqmzwjatbmzk.supabase.co`

The build already includes the Supabase connection configuration. No additional setup needed.

All RLS policies and migrations are already applied.

---

## Post-Deployment Notes

1. **First Login:** Use the staff credentials configured in your Supabase `staff_users` table
2. **HTTPS:** Netlify provides free SSL automatically
3. **Performance:** First load ~150KB gzipped, subsequent loads use browser cache
4. **Updates:** To redeploy, just drag-and-drop a new `dist/` folder or push to GitHub

---

## Troubleshooting

**Problem:** 404 on refresh
- **Solution:** Verify `netlify.toml` is in the project root (NOT inside dist/)

**Problem:** Assets not loading
- **Solution:** Ensure you deployed the entire `dist/` folder, not just its contents

**Problem:** Login not working
- **Solution:** Check Supabase project is active and staff_users table has entries

**Problem:** Blank page
- **Solution:** Check browser console for errors, verify environment variables

---

## Support

For production deployment support:
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- React Router: https://reactrouter.com

---

**Build Date:** 2025-12-24
**Build Version:** Production
**Framework:** React 18.3 + Vite 5.4 + TypeScript
**Backend:** Supabase PostgreSQL
**Hosting:** Netlify (hms.aayushhospitalmpl.com)
