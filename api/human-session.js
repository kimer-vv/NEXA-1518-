import crypto from 'node:crypto';

const COOKIE='nexa_human_session';

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}
function safeEqual(a,b) {
  try {
    const x=Buffer.from(a), y=Buffer.from(b);
    return x.length===y.length && crypto.timingSafeEqual(x,y);
  } catch { return false; }
}

export default function handler(req,res) {
  if(req.method!=='GET') return res.status(405).end();

  const secret=process.env.TURNSTILE_SECRET_KEY;
  if(!secret) return res.status(500).end();

  const raw=(req.headers.cookie||'').split(';').map(x=>x.trim())
    .find(x=>x.startsWith(COOKIE+'='));
  if(!raw) return res.status(401).end();

  const value=decodeURIComponent(raw.slice(COOKIE.length+1));
  const dot=value.indexOf('.');
  if(dot<1) return res.status(401).end();

  const issued=value.slice(0,dot), sig=value.slice(dot+1);
  if(!safeEqual(sig,sign(issued,secret))) return res.status(401).end();

  // Safety cap: even if a browser restores session cookies, re-check after 12 hours.
  const age=Date.now()-Number(issued);
  if(!Number.isFinite(age) || age<0 || age>12*60*60*1000) return res.status(401).end();

  res.setHeader('Cache-Control','no-store');
  return res.status(204).end();
}
