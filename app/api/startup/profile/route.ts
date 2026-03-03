import { NextRequest } from 'next/server';
import { getSessionUser, jsonResponse, unauthorized, badRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  const startupId = request.nextUrl.searchParams.get('startup_id');

  const { data: members } = await supabase
    .from('startup_members')
    .select('startup_id')
    .eq('user_id', user.id);
  const allowedStartupIds = (members || []).map((m) => m.startup_id);
  if (allowedStartupIds.length === 0) {
    return jsonResponse({
      startup: null,
      plan: null,
      deliverables: [],
    });
  }

  const targetId = startupId && allowedStartupIds.includes(startupId) ? startupId : allowedStartupIds[0];

  const { data: startup, error: eStartup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', targetId)
    .single();

  if (eStartup || !startup) {
    return jsonResponse({
      startup: null,
      plan: null,
      deliverables: [],
    });
  }

  const [{ data: plan }, { data: deliverables }] = await Promise.all([
    supabase.from('startup_plans').select('*').eq('startup_id', targetId).maybeSingle(),
    supabase.from('startup_deliverables').select('*').eq('startup_id', targetId).order('target_date', { ascending: true }),
  ]);

  return jsonResponse({
    startup,
    plan: plan || null,
    deliverables: deliverables || [],
  });
}

export async function POST(request: NextRequest) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  let body: {
    startup_id?: string;
    startup_name?: string;
    startup_type?: string;
    stage?: string;
    description?: string;
    plan_period?: string;
    deliverable_mode?: string;
    summary?: string;
    expected_outcomes?: string;
    next_milestone_title?: string;
    next_milestone_due_date?: string;
    roadmap_notes?: string;
    assumptions_risks?: string;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest('طلب غير صالح');
  }

  const {
    startup_id: existingStartupId,
    startup_name,
    startup_type,
    stage,
    description,
    plan_period,
    deliverable_mode,
    summary,
    expected_outcomes,
    next_milestone_title,
    next_milestone_due_date,
    roadmap_notes,
    assumptions_risks,
  } = body;

  const { data: members } = await supabase
    .from('startup_members')
    .select('startup_id')
    .eq('user_id', user.id);
  const allowedIds = (members || []).map((m) => m.startup_id);

  let startupId = existingStartupId;
  if (startupId && !allowedIds.includes(startupId))
    return unauthorized('غير مصرح بتعديل هذه الشركة');

  if (!startupId && allowedIds.length > 0) startupId = allowedIds[0];

  if (!startupId) {
    const { data: newStartup, error: insertErr } = await supabase
      .from('startups')
      .insert({
        startup_name: startup_name || 'شركة جديدة',
        startup_type: startup_type || 'other',
        stage: stage || 'idea',
        description: description || null,
      })
      .select('id')
      .single();
    if (insertErr) return jsonResponse({ error: insertErr.message }, 400);
    startupId = newStartup!.id;
    await supabase.from('startup_members').insert({ startup_id: startupId, user_id: user.id });
  } else {
    const updates: Record<string, unknown> = {};
    if (startup_name !== undefined) updates.startup_name = startup_name;
    if (startup_type !== undefined) updates.startup_type = startup_type;
    if (stage !== undefined) updates.stage = stage;
    if (description !== undefined) updates.description = description;
    if (Object.keys(updates).length > 0) {
      await supabase.from('startups').update(updates).eq('id', startupId);
    }
  }

  const planPayload = {
    startup_id: startupId,
    created_by: user.id,
    plan_period: plan_period || 'monthly',
    deliverable_mode: deliverable_mode || 'project_execution',
    summary: summary ?? null,
    expected_outcomes: expected_outcomes ?? null,
    next_milestone_title: next_milestone_title ?? null,
    next_milestone_due_date: next_milestone_due_date || null,
    roadmap_notes: roadmap_notes ?? null,
    assumptions_risks: assumptions_risks ?? null,
    last_reviewed_at: new Date().toISOString(),
  };

  const { error: planErr } = await supabase.from('startup_plans').upsert(planPayload, {
    onConflict: 'startup_id',
  });

  if (planErr) return jsonResponse({ error: planErr.message }, 400);

  return jsonResponse({ success: true, startup_id: startupId });
}
