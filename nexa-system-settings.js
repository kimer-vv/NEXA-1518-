import {
  SUPABASE_URL,
  json,
  userRole,
  bypassCookie,
} from './_nexa-maintenance-common.js';

async function getSetting(service) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/nexa_system_settings?key=eq.maintenance_mode&select=value&limit=1`,
    {
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
      },
      cache: 'no-store',
    }
  );

  if (!r.ok) throw new Error('Could not read Maintenance Mode.');
  const rows = await r.json();
  const value = rows?.[0]?.value;
  return value === true || value?.enabled === true;
}

async function setSetting(service, enabled) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/nexa_system_settings?on_conflict=key`,
    {
      method: 'POST',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        key: 'maintenance_mode',
        value: { enabled: !!enabled },
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!r.ok) throw new Error('Could not update Maintenance Mode.');
}

export default async function handler(req, res) {
  try {
    const token = String(req.headers.authorization || '').replace(
      /^Bearer\s+/i,
      ''
    );

    const role = await userRole(token);
    if (role !== 'owner') {
      return json(res, 403, { error: 'System Operations is Owner-only.' });
    }

    const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!service) {
      return json(res, 503, {
        error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel.',
      });
    }

    if (req.method === 'GET') {
      return json(res, 200, {
        maintenance_mode: await getSetting(service),
      });
    }

    if (req.method === 'POST') {
      const enabled = !!req.body?.maintenance_mode;

      // Establish the Owner escape route BEFORE enabling Maintenance Mode.
      if (enabled) bypassCookie(res);

      await setSetting(service, enabled);
      return json(res, 200, { maintenance_mode: enabled });
    }

    return json(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return json(res, error.status || 500, {
      error: error.message || 'System Operations failed.',
    });
  }
}
