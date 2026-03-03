-- ============================================================
-- Startup Plan & Deliverables — Supabase schema + RLS
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enums (use text + check if your Postgres doesn't support CREATE TYPE in migrations)
-- startup_type: tech | service | product | productive_family | other
-- stage: idea | mvp | growth
-- plan_period: monthly | quarterly
-- deliverable_mode: project_execution | product_catalog | service_catalog
-- deliverable_type: feature | service | product | campaign | partnership | other
-- deliverable status: planned | in_progress | done | blocked

-- ------------------------------------------------------------
-- A) startups (create or extend)
-- If you already have a startups table, add the new columns with ALTER.
-- Here we assume a fresh table keyed by id (uuid).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id text UNIQUE,
  startup_name text,
  startup_type text NOT NULL DEFAULT 'other' CHECK (startup_type IN ('tech','service','product','productive_family','other')),
  stage text NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea','mvp','growth')),
  description text,
  incubator_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- If extending existing table (uncomment and adjust name):
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS startup_name text;
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS startup_type text DEFAULT 'other';
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS stage text DEFAULT 'idea';
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS description text;
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
-- ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_startups_incubator ON public.startups(incubator_id);
CREATE INDEX IF NOT EXISTS idx_startups_startup_id ON public.startups(startup_id);

-- ------------------------------------------------------------
-- Founder/startup membership (who owns/belongs to which startup)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startup_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'founder',
  created_at timestamptz DEFAULT now(),
  UNIQUE(startup_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_startup_members_user ON public.startup_members(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_members_startup ON public.startup_members(startup_id);

-- ------------------------------------------------------------
-- B) startup_plans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startup_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  created_by uuid,
  plan_period text NOT NULL DEFAULT 'monthly' CHECK (plan_period IN ('monthly','quarterly')),
  deliverable_mode text NOT NULL DEFAULT 'project_execution' CHECK (deliverable_mode IN ('project_execution','product_catalog','service_catalog')),
  summary text,
  expected_outcomes text,
  next_milestone_title text,
  next_milestone_due_date date,
  roadmap_notes text,
  assumptions_risks text,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(startup_id)
);
CREATE INDEX IF NOT EXISTS idx_startup_plans_startup ON public.startup_plans(startup_id);

-- ------------------------------------------------------------
-- C) startup_deliverables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startup_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  deliverable_type text NOT NULL DEFAULT 'other' CHECK (deliverable_type IN ('feature','service','product','campaign','partnership','other')),
  title text NOT NULL,
  description text,
  owner text,
  target_date date,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','done','blocked')),
  target_metric_name text,
  target_metric_value numeric,
  current_metric_value numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_startup_deliverables_startup ON public.startup_deliverables(startup_id);

-- ------------------------------------------------------------
-- Incubator admins (admin can read all startups under their incubator)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incubator_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incubator_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(incubator_id, user_id)
);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;

-- Startups: founder sees own; admin sees incubator's
CREATE POLICY "startups_select_own" ON public.startups
  FOR SELECT USING (
    id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startups_select_admin" ON public.startups
  FOR SELECT USING (
    incubator_id IN (SELECT incubator_id FROM public.incubator_admins WHERE user_id = auth.uid())
  );
CREATE POLICY "startups_insert_own" ON public.startups
  FOR INSERT WITH CHECK (true);
CREATE POLICY "startups_update_own" ON public.startups
  FOR UPDATE USING (
    id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );

-- startup_members
CREATE POLICY "startup_members_select_own" ON public.startup_members
  FOR SELECT USING (user_id = auth.uid() OR startup_id IN (SELECT id FROM public.startups WHERE incubator_id IN (SELECT incubator_id FROM public.incubator_admins WHERE user_id = auth.uid())));
CREATE POLICY "startup_members_insert" ON public.startup_members FOR INSERT WITH CHECK (true);
CREATE POLICY "startup_members_update" ON public.startup_members FOR UPDATE USING (user_id = auth.uid());

-- startup_plans: founder read/write own; admin read
CREATE POLICY "startup_plans_select_own" ON public.startup_plans
  FOR SELECT USING (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startup_plans_select_admin" ON public.startup_plans
  FOR SELECT USING (
    startup_id IN (SELECT id FROM public.startups WHERE incubator_id IN (SELECT incubator_id FROM public.incubator_admins WHERE user_id = auth.uid()))
  );
CREATE POLICY "startup_plans_insert" ON public.startup_plans
  FOR INSERT WITH CHECK (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startup_plans_update" ON public.startup_plans
  FOR UPDATE USING (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );

-- startup_deliverables: same as plans
CREATE POLICY "startup_deliverables_select_own" ON public.startup_deliverables
  FOR SELECT USING (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startup_deliverables_select_admin" ON public.startup_deliverables
  FOR SELECT USING (
    startup_id IN (SELECT id FROM public.startups WHERE incubator_id IN (SELECT incubator_id FROM public.incubator_admins WHERE user_id = auth.uid()))
  );
CREATE POLICY "startup_deliverables_insert" ON public.startup_deliverables
  FOR INSERT WITH CHECK (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startup_deliverables_update" ON public.startup_deliverables
  FOR UPDATE USING (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );
CREATE POLICY "startup_deliverables_delete" ON public.startup_deliverables
  FOR DELETE USING (
    startup_id IN (SELECT startup_id FROM public.startup_members WHERE user_id = auth.uid())
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'startups_updated_at') THEN
    CREATE TRIGGER startups_updated_at BEFORE UPDATE ON public.startups FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'startup_plans_updated_at') THEN
    CREATE TRIGGER startup_plans_updated_at BEFORE UPDATE ON public.startup_plans FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'startup_deliverables_updated_at') THEN
    CREATE TRIGGER startup_deliverables_updated_at BEFORE UPDATE ON public.startup_deliverables FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
