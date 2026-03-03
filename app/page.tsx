import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function RootPage() {
  const { user, supabase } = await getSessionUser();

  if (!user) {
    redirect('/landing.html');
  }

  try {
    const { data: adminRow } = await supabase
      .from('incubator_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (adminRow) {
      redirect('/admin/dashboard');
    }

    const { data: founderRow } = await supabase
      .from('startup_members')
      .select('user_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (founderRow) {
      redirect('/founder/home');
    }
  } catch (_) {
    // Tables may not exist or RLS may block; treat as no role
  }

  redirect('/landing.html');
}
