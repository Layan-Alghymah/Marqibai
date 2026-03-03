import { NextRequest } from 'next/server';
import { getSessionUser, jsonResponse, unauthorized, badRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  let body: {
    startup_id: string;
    deliverable_type?: string;
    title: string;
    description?: string;
    owner?: string;
    target_date?: string;
    status?: string;
    target_metric_name?: string;
    target_metric_value?: number;
    current_metric_value?: number;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return badRequest('طلب غير صالح');
  }

  const { startup_id, title } = body;
  if (!startup_id || !title) return badRequest('startup_id و title مطلوبان');

  const { data: members } = await supabase
    .from('startup_members')
    .select('startup_id')
    .eq('user_id', user.id)
    .eq('startup_id', startup_id);
  if (!members?.length) return unauthorized('غير مصرح لهذه الشركة');

  const insert: Record<string, unknown> = {
    startup_id,
    deliverable_type: body.deliverable_type || 'other',
    title,
    description: body.description ?? null,
    owner: body.owner ?? null,
    target_date: body.target_date || null,
    status: body.status || 'planned',
    target_metric_name: body.target_metric_name ?? null,
    target_metric_value: body.target_metric_value ?? null,
    current_metric_value: body.current_metric_value ?? null,
    notes: body.notes ?? null,
  };

  const { data, error } = await supabase.from('startup_deliverables').insert(insert).select().single();
  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse(data);
}
