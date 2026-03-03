import { NextRequest } from 'next/server';
import { getSessionUser, jsonResponse, unauthorized } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ startup_id: string }> }
) {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  const { startup_id: paramId } = await params;
  if (!paramId) return Response.json({ error: 'startup_id مطلوب' }, { status: 400 });

  const { data: adminRow } = await supabase
    .from('incubator_admins')
    .select('incubator_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paramId);
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq(isUuid ? 'id' : 'startup_id', paramId)
    .maybeSingle();

  if (!startup) return Response.json({ error: 'الشركة غير موجودة' }, { status: 404 });
  const startup_id = startup.id;

  if (adminRow && startup.incubator_id !== adminRow.incubator_id) {
    return unauthorized('غير مصرح بعرض هذه الشركة');
  }

  const [{ data: plan }, { data: deliverables }] = await Promise.all([
    supabase.from('startup_plans').select('*').eq('startup_id', startup_id).maybeSingle(),
    supabase.from('startup_deliverables').select('*').eq('startup_id', startup_id).order('target_date', { ascending: true }),
  ]);

  return jsonResponse({
    startup,
    plan: plan || null,
    deliverables: deliverables || [],
  });
}
