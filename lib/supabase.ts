import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type StartupType = 'tech' | 'service' | 'product' | 'productive_family' | 'other';
export type Stage = 'idea' | 'mvp' | 'growth';
export type DeliverableType = 'feature' | 'service' | 'product' | 'campaign' | 'partnership' | 'other';
export type DeliverableStatus = 'planned' | 'in_progress' | 'done' | 'blocked';
export type PlanPeriod = 'monthly' | 'quarterly';
export type DeliverableMode = 'project_execution' | 'product_catalog' | 'service_catalog';
