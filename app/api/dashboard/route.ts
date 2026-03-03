import { getSessionUser, jsonResponse, unauthorized } from '@/lib/auth';

export async function GET() {
  const { user, supabase } = await getSessionUser();
  if (!user) return unauthorized('تسجيل الدخول مطلوب');

  const { data: adminRow } = await supabase
    .from('incubator_admins')
    .select('incubator_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const incubatorId = adminRow?.incubator_id;
  let list: Array<{ id: string; startup_id: string | null; startup_name: string | null; startup_type: string; stage: string }> = [];

  if (incubatorId) {
    const { data: startups } = await supabase
      .from('startups')
      .select('id, startup_id, startup_name, startup_type, stage, description, created_at, updated_at')
      .eq('incubator_id', incubatorId);
    list = startups || [];
  }

  const list = startups || [];
  const ids = list.map((s: { id: string }) => s.id);

  const { data: plans } = ids.length
    ? await supabase.from('startup_plans').select('startup_id, next_milestone_due_date').in('startup_id', ids)
    : { data: [] };

  const planByStartup = (plans || []).reduce((acc: Record<string, { next_milestone_due_date: string | null }>, p: { startup_id: string; next_milestone_due_date: string | null }) => {
    acc[p.startup_id] = { next_milestone_due_date: p.next_milestone_due_date };
    return acc;
  }, {});

  const stageMap: Record<string, string> = { idea: 'فكرة', mvp: 'MVP', growth: 'نمو' };
  const typeMap: Record<string, string> = {
    tech: 'تقني',
    service: 'خدمي',
    product: 'منتج',
    productive_family: 'أسرة منتجة',
    other: 'آخر',
  };

  const startupsForDashboard = list.map((s: {
    id: string;
    startup_id: string | null;
    startup_name: string | null;
    startup_type: string;
    stage: string;
  }) => {
    const plan = planByStartup[s.id];
    return {
      id: s.startup_id || s.id,
      name: s.startup_name || `شركة ${s.startup_id || s.id}`,
      startup_name: s.startup_name || null,
      startup_type: typeMap[s.startup_type] || s.startup_type,
      stage: stageMap[s.stage] || s.stage,
      type: typeMap[s.startup_type] || s.startup_type,
      next_milestone_due_date: plan?.next_milestone_due_date ?? null,
      health: 60,
      risk: 'medium',
      escalation: false,
      alert: false,
      c1: 60,
      c2: 55,
      c3: 60,
      c4: 65,
      flags: [],
      recommendation: 'انتظر التحديث',
      committed: true,
      lastUpdate: 'غير محدد',
    };
  });

  if (startupsForDashboard.length === 0) {
    return jsonResponse({ startups: getFallbackMockStartups() });
  }

  return jsonResponse({ startups: startupsForDashboard });
}

function getFallbackMockStartups() {
  const MOCK = [
    { id: 'ST001', name: 'نماء للتقنية', startup_name: 'نماء للتقنية', startup_type: 'تقني', stage: 'MVP', type: 'تقني', next_milestone_due_date: null, health: 32, risk: 'high', escalation: true, alert: true, c1: 40, c2: 25, c3: 30, c4: 35, flags: ['إيرادات صفر'], recommendation: 'مراجعة طارئ', committed: false, lastUpdate: 'منذ أسبوعين' },
    { id: 'ST002', name: 'سدرة للاستشارات', startup_name: 'سدرة للاستشارات', startup_type: 'خدمي', stage: 'فكرة', type: 'خدمي', next_milestone_due_date: null, health: 55, risk: 'medium', escalation: false, alert: true, c1: 60, c2: 50, c3: 55, c4: 55, flags: ['نسبة الإنجاز أقل من 50%'], recommendation: 'جلسة إرشاد', committed: true, lastUpdate: 'منذ يومين' },
  ];
  return MOCK;
}
