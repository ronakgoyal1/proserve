# ProServe Marketplace - Deployment Guide

This guide covers the necessary steps to deploy the ProServe Vite + React application to Vercel and how to verify the deployment.

## 1. Vercel Deployment Checklist

- [ ] **Push to GitHub**: Ensure the `main` branch is up-to-date.
- [ ] **Import Project**: In the Vercel dashboard, click "Add New..." -> "Project" and select the ProServe repository.
- [ ] **Framework Preset**: Vercel should automatically detect **Vite**.
- [ ] **Root Directory**: Leave as `./` (unless you moved the app into a subfolder).
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`
- [ ] **Environment Variables**: You **MUST** add the following environment variables in the Vercel project settings before deploying:

### Required Environment Variables
| Variable Name | Description | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Supabase Dashboard -> Project Settings -> API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Project Anon Key | Supabase Dashboard -> Project Settings -> API |

### Optional Environment Variables (Email Notifications)
| Variable Name | Description | Where to find it |
|---|---|---|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS Service ID | EmailJS Dashboard -> Email Services |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS Template ID | EmailJS Dashboard -> Email Templates |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS Public Key | EmailJS Dashboard -> Account -> API Keys |

## 2. Routing Configuration

A `vercel.json` file is already included in the root directory. It contains SPA rewrite rules to ensure React Router handles paths correctly instead of returning 404s on direct navigation.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 3. Post-Deploy Smoke Testing Guide

Once Vercel has generated the production URL (e.g., `https://wisor.in`), perform the following checks:

### 1. Public Pages (SEO & Content)
- [ ] **Home Page (`/`)**: Verify Hero banner, Search functionality, and featured CAs load properly.
- [ ] **Search Page (`/search`)**: Make sure filtering by Category and City works.
- [ ] **Static Pages**: Verify `/about`, `/privacy`, `/terms`, `/contact` render successfully without 404s.

### 2. Authentication Flow
- [ ] **Login/Signup (`/login`)**: Ensure the UI renders properly.
- [ ] **Google OAuth**: Click "Continue with Google". Verify it redirects to Google, allows account selection, and successfully redirects back to the Vercel domain.
- [ ] **Session Check**: After login, close the tab and reopen the URL. Confirm you are still logged in.

### 3. Protected Dashboards
- [ ] Navigate directly to `/dashboard`. If logged out, it should redirect to `/login`. If logged in, it should display your bookings.

### 4. Core Workflows
- [ ] **Booking a Pro**: Navigate to a Pro profile, click "Book Consultation", and proceed through the modal.
- [ ] Check if the booking appears in your `/dashboard`.
- [ ] Check if you receive a mock confirmation alert or an actual email (if EmailJS is fully configured).

### 5. Performance & Mobile
- [ ] Open the site on a mobile device or responsive emulator. Ensure menus and filter sidebars toggle correctly.
- [ ] Run a Google Lighthouse test to ensure SEO and Performance metrics are >90.
