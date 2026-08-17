import crypto from 'node:crypto';

export const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';

export const SUPABASE_ANON =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

export function json(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

export async function userRole(token) {
  if (!token) {
    throw Object.assign(new Error('Sign in required.'), { status: 401 });
  }

  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const user = await authRes.json().catch(() => null);
  if (!authRes.ok || !user?.id) {
    throw Object.assign(
      new Error('Owner session could not be verified. Please sign in again.'),
      { status: 401 }
    );
  }

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!service) {
    throw Object.assign(
      new Error('SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel.'),
      { status: 503 }
    );
  }

  const roleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`,
    {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      cache: 'no-store',
    }
  );

  const rows = await roleRes.json().catch(() => []);
  if (!roleRes.ok) {
    throw Object.assign(new Error('NEXA could not read the Owner role.'), {
      status: 500,
    });
  }

  return String(rows?.[0]?.role || 'player').toLowerCase();
}

export function bypassCookie(res) {
  const secret = process.env.NEXA_MAINTENANCE_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      'NEXA_MAINTENANCE_COOKIE_SECRET is not configured in Vercel.'
    );
  }

  const exp = String(Math.floor(Date.now() / 1000) + 60 * 60 * 12);
  const sig = crypto.createHmac('sha256', secret).update(exp).digest('hex');

  res.setHeader(
    'Set-Cookie',
    `nexa_owner_bypass=${encodeURIComponent(
      exp + '.' + sig
    )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 12}`
  );
}
