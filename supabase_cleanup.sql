-- Supabase Pre-Launch Data Cleanup Script
-- Safely truncates test marketplace data without touching user accounts or schema definitions.

-- WARNING: This will permanently delete all marketplace interactions and profiles.
-- The auth.users table is untouched, preserving your core users (including admin).

-- Disable triggers temporarily to ensure fast truncation without recursive cascading errors (Requires Superuser/Postgres role)
-- Alternatively, use TRUNCATE CASCADE to automatically wipe rows that depend on these.

BEGIN;

TRUNCATE TABLE public.applications CASCADE;
TRUNCATE TABLE public.professionals CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.leads CASCADE;
TRUNCATE TABLE public.portfolios CASCADE;
TRUNCATE TABLE public.reviews CASCADE;

COMMIT;

-- Note:
-- The 'CASCADE' keyword explicitly tells PostgreSQL to delete rows in ANY other tables 
-- that hold foreign key references pointing to the rows being truncated.
-- 'auth.users' is NOT in this list, so your accounts, admin logins, and passwords will not be damaged.
