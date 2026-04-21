-- Supabase Full Production Data Reset Script
-- WARNING: This will permanently delete ALL users, applications, experts, and marketplace data.
-- It explicitly PRESERVES the admin account(s) and their authentication sessions.

BEGIN;

-- 1. Wipe all marketplace tables safely
-- Using CASCADE violently strips away intersecting relational constraints.
-- (Includes both legacy applications and professional_applications table variants)
TRUNCATE TABLE public.professional_applications CASCADE;
TRUNCATE TABLE public.applications CASCADE;
TRUNCATE TABLE public.professionals CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.leads CASCADE;
TRUNCATE TABLE public.portfolios CASCADE;
TRUNCATE TABLE public.reviews CASCADE;

-- 2. Cleanly delete all non-admin Auth users
-- This interacts with Supabase's native auth schema directly.
-- It protects your core administrative access by isolating the `admin` role and recognized owner emails.
DELETE FROM auth.users 
WHERE email != 'ronakdiscord@gmail.com' 
  AND (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' != 'admin');

COMMIT;

-- Instructions:
-- 1. Copy this script.
-- 2. Open your Supabase Dashboard -> SQL Editor.
-- 3. Paste and run this script.
-- 4. In your browser frontend, go to /login (in dev mode) and click "Wipe Dev Data" to guarantee local memory is completely pristine.
