-- -----------------------------------------------------
-- MIGRATION: Add Missing JS Payload Columns
-- -----------------------------------------------------
-- This migration adds the exact camelCase properties transmitted by ProOnboarding.jsx 
-- into the professional_applications table. PostgREST handles camelCase gracefully
-- if the columns are explicitly defined with double quotes.

ALTER TABLE public.professional_applications
    ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS "certificationId" TEXT,
    ADD COLUMN IF NOT EXISTS "languages" TEXT;

-- -----------------------------------------------------
-- Directory Table Sync
-- -----------------------------------------------------
-- If dbService also pulls 'hourlyRate' in camelCase from the live database:
ALTER TABLE public.professionals
    ADD COLUMN IF NOT EXISTS "hourlyRate" INTEGER DEFAULT 1500;

-- -----------------------------------------------------
-- MIGRATION: Phase 3 Portfolios
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    published BOOLEAN DEFAULT true,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
