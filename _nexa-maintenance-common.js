const crypto = require('crypto');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

function json(res,status,body){res.setHeader('Cache-Control','no-store');return res.status(status).json(body);}
async function userRole(token){
  if(!token) throw Object.assign(new Error('Sign in required.'),{status:401});
  const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/current_nexa_role`,{
    method:'POST',
    headers:{apikey:SUPABASE_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:'{}'
  });
  const role=await r.json().catch(()=>null);
  if(!r.ok) throw Object.assign(new Error('Could not verify NEXA role.'),{status:403});
  return String(role||'').replace(/^"|"$/g,'').toLowerCase();
}
function bypassCookie(res){
  const secret=process.env.NEXA_MAINTENANCE_COOKIE_SECRET;
  if(!secret) throw new Error('NEXA_MAINTENANCE_COOKIE_SECRET is not configured in Vercel.');
  const exp=String(Math.floor(Date.now()/1000)+(60*60*12));
  const sig=crypto.createHmac('sha256',secret).update(exp).digest('hex');
  res.setHeader('Set-Cookie',`nexa_owner_bypass=${encodeURIComponent(exp+'.'+sig)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60*60*12}`);
}
module.exports={SUPABASE_URL,SUPABASE_ANON,json,userRole,bypassCookie};