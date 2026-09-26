import {
  SUPABASE_URL,
  json,
  userRole,
  bypassCookie,
} from '../server/_nexa-maintenance-common-new.js';
import giftWorkspaceHandler from '../server/nexa-gift-workspace.js';
import { giftCron } from '../server/nexa-gift-discovery.js';
import { redeemSingleTest } from '../server/nexa-gift-redeemer.js';
import { runGiftAutoWorker } from '../server/nexa-gift-auto-worker.js';

const HERO_IMAGE_HOSTS = new Set([
  'www.whiteoutsurvival-community.com',
  'whiteoutsurvival-community.com',
  'gom-s3-user-avatar.s3.us-west-2.amazonaws.com',
]);

function heroImageUrl(raw) {
  try {
    const u = new URL(String(raw || ''));
    if (u.protocol !== 'https:') return null;
    if (!HERO_IMAGE_HOSTS.has(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function serveHeroImage(req, res) {
  const raw = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  const url = heroImageUrl(raw);
  if (!url) return json(res, 400, { error: 'Invalid hero image URL.' });
  try {
    const upstream = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 NEXA/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    if (!upstream.ok) return json(res, upstream.status, { error: 'Hero image could not be loaded.' });
    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return json(res, 415, { error: 'Requested resource is not an image.' });
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).send(body);
  } catch (error) {
    console.error('[NEXA hero image]', error);
    return json(res, 502, { error: 'Hero image proxy failed.' });
  }
}

async function getSetting(service) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/nexa_system_settings?key=eq.maintenance_mode&select=value&limit=1`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` }, cache: 'no-store',
  });
  if (!r.ok) throw new Error('Could not read Maintenance Mode.');
  const rows = await r.json();
  const value = rows?.[0]?.value;
  return value === true || value?.enabled === true;
}

async function setSetting(service, enabled) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/nexa_system_settings?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: service, Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({key: 'maintenance_mode', value: {enabled: !!enabled}, updated_at: new Date().toISOString()}),
  });
  if (!r.ok) throw new Error('Could not update Maintenance Mode.');
}

export default async function handler(req, res) {
  try {
    if (req.query?.mode === 'gift-test-redeem') return await redeemSingleTest(req, res);
    // Existing CRON_SECRET protects discovery AND the auto worker.
    if (req.query?.mode === 'giftcron') {
      // Preserve existing discovery/queue behavior; worker only runs after discovery handler.
      // giftCron writes the HTTP response, so use a response adapter to collect its result.
      let status = 200;
      let payload;
      const proxy = {
        setHeader: (...args) => res.setHeader(...args),
        status: (code) => { status = code; return proxy; },
        json: (data) => { payload = data; return proxy; },
      };
      await giftCron(req, proxy);
      if (status === 401 || status === 405) return res.status(status).json(payload);
      let auto;
      try { auto = await runGiftAutoWorker(); }
      catch (e) {
        console.error('[NEXA Gift Auto]', e);
        auto = {enabled: process.env.NEXA_GIFT_AUTO_ENABLED === 'true', error: String(e?.message || e).slice(0,180)};
      }
      return res.status(status).json({...payload, auto});
    }
    if (req.query?.mode === 'gift') return await giftWorkspaceHandler(req, res);
    if (req.method === 'GET' && req.query?.mode === 'hero-image') return await serveHeroImage(req, res);
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const role = await userRole(token);
    if (role !== 'owner') return json(res, 403, {error: 'System Operations is Owner-only.'});
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!service) return json(res, 503, {error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel.'});
    if (req.method === 'GET') return json(res, 200, {maintenance_mode: await getSetting(service)});
    if (req.method === 'POST') {
      const enabled = !!req.body?.maintenance_mode;
      if (enabled) bypassCookie(res);
      await setSetting(service, enabled);
      return json(res, 200, {maintenance_mode: enabled});
    }
    return json(res, 405, {error: 'Method not allowed.'});
  } catch (error) {
    return json(res, error.status || 500, {error: error.message || 'System Operations failed.'});
  }
}