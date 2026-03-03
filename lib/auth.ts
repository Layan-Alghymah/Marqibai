import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (_) {}
        },
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error, supabase };
}

export function jsonResponse(data: object, status = 200) {
  return Response.json(data, { status });
}

export function unauthorized(msg = 'Unauthorized') {
  return Response.json({ error: msg }, { status: 401 });
}

export function badRequest(msg: string, details?: object) {
  return Response.json({ error: msg, ...details }, { status: 400 });
}
