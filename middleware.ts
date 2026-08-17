import { next } from '@vercel/functions';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name:'HMAC', hash:'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(sig));
}
function cookieValue(req: Request, name: string) {
  const raw = req.headers.get('cookie') || '';
  const hit = raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
  return hit ? decodeURIComponent(hit.slice(name.length+1)) : '';
}
async function bypassOK(req: Request) {
  const secret = process.env.NEXA_MAINTENANCE_COOKIE_SECRET || '';
  if (!secret) return false;
  const value = cookieValue(req,'nexa_owner_bypass');
  const [exp,sig] = value.split('.');
  if (!exp || !sig || Number(exp) < Math.floor(Date.now()/1000)) return false;
  const expected = await hmac(secret, exp);
  return expected === sig;
}
async function maintenanceEnabled() {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!service) return false; // fail-open so Owner is never locked out by missing env
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/nexa_system_settings?key=eq.maintenance_mode&select=value&limit=1`, {
      headers:{ apikey:service, Authorization:`Bearer ${service}` },
      cache:'no-store'
    });
    if(!r.ok) return false; // fail-open for safety
    const rows = await r.json();
    const value = rows?.[0]?.value;
    return value === true || value?.enabled === true;
  } catch {
    return false; // fail-open: infrastructure failure must not trap Owner
  }
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Never block the recovery/auth/service routes required to regain control.
  if (
    path === '/maintenance.html' ||
    path === '/owner-access.html' ||
    path.startsWith('/owner-recovery-') ||
    path.startsWith('/api/nexa-owner-') ||
    path.startsWith('/api/nexa-system-settings') ||
    path === '/favicon.ico' ||
    /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(path)
  ) return next();

  if (!(await maintenanceEnabled())) return next();
  if (await bypassOK(request)) return next();

  return Response.redirect(new URL('/maintenance.html', request.url), 307);
}

export const config = {
  matcher: '/((?!_next/).*)'
};
