import { NextRequest } from 'next/server';
import { getSessionUser, jsonResponse, unauthorized, badRequest } from '@/lib/auth';

async function getDeliverableAndCheck(supabase: Awaited<ReturnType<typeof getSessionUser>>['supabase'], userId: string, id: string) {
  const { data: row, error } = await supabase
    .from('startup_deliverables')
    .select('id, startup_id')
    .eq('id', id)
    .single();
  if (error || !row) return { deliverable: null, allowed: false };
  const { data: members } = await supabase
    .from('startup_members')
    .select('startup_id')
    .eq('user_id', userId)
    .eq('startup_id', row.startup_id);
  return { deliverable: row, allowed: !!members?.length };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  const { id } = await params;
  const { deliverable, allowed } = await getDeliverableAndCheck(supabase, user.id, id);
  if (!allowed || !deliverable) return unauthorized('غير مصرح أو التسليم غير موجود');

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('طلب غير صالح');
  }

  const allowedFields = [
    'title', 'description', 'owner', 'target_date', 'status',
    'target_metric_name', 'target_metric_value', 'current_metric_value', 'notes', 'deliverable_type',
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) return badRequest('لا حقول للتحديث');

  const { data, error } = await supabase
    .from('startup_deliverables')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  const { id } = await params;
  const { allowed } = await getDeliverableAndCheck(supabase, user.id, id);
  if (!allowed) return unauthorized('غير مصرح أو التسليم غير موجود');

  const { error } = await supabase.from('startup_deliverables').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true });
}
