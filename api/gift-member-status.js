/* NEXA Gift Member Health API v1.1
 * GREEN  = this Game ID has proven successful redemption behavior recently.
 * YELLOW = enabled but not yet proven, or a temporary/single issue exists.
 * RED    = auto-redeem off, or repeated hard failures across attempts with no recent success.
 *
 * Important: a newly registered member with no redemption history is YELLOW, not GREEN.
 * That avoids giving false confidence before NEXA has actually processed a code for the account.
 */
import { createHash } from 'node:crypto';

const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const enc=v=>encodeURIComponent(String(v));
const hash=v=>createHash('sha256').update(String(v)).digest('hex');
const send=(res,status,data)=>res.status(status).json(data);

async function db(path){
 if(!KEY)throw Object.assign(new Error('Server configuration unavailable.'),{status:503});
 const r=await fetch(`${SB_URL}/rest/v1/${path}`,{headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}});
 const data=await r.json().catch(()=>null);
 if(!r.ok)throw Object.assign(new Error(data?.message||data?.error||'Database request failed.'),{status:r.status>=500?502:400});
 return data;
}
async function authorize(req,allianceId){
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
 if(!token)throw Object.assign(new Error('Sign in required.'),{status:401});
 const sess=await db(`transfer_staff_sessions?token_hash=eq.${hash(token)}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
 if(!sess.length)throw Object.assign(new Error('Staff session expired.'),{status:401});
 const accountId=sess[0].account_id;
 const alliance=(await db(`gift_alliances?id=eq.${enc(allianceId)}&deleted_at=is.null&select=id,state_number&limit=1`))[0];
 if(!alliance)throw Object.assign(new Error('Alliance not found.'),{status:404});

 const access=await db(`gift_staff_access?staff_account_id=eq.${enc(accountId)}&is_active=eq.true&select=role,state_number,alliance_id`);
 if(access.some(a=>['owner','wos_admin'].includes(a.role)))return alliance;
 if(access.some(a=>a.role==='redeemer_admin'&&Number(a.state_number)===Number(alliance.state_number)))return alliance;
 if(access.some(a=>a.role==='alliance_manager'&&a.alliance_id===alliance.id))return alliance;

 const acct=(await db(`transfer_staff_accounts?id=eq.${enc(accountId)}&select=game_id&limit=1`))[0];
 const wos=acct?(await db(`wos_utility_staff_access?game_id=eq.${enc(acct.game_id)}&status=eq.active&select=role,main_alliance_id,module_access&limit=1`))[0]:null;
 if(wos&&wos.module_access?.gift!==false&&(['owner','administrative'].includes(wos.role)||wos.main_alliance_id===alliance.id))return alliance;
 throw Object.assign(new Error('Access denied.'),{status:403});
}

function healthFor(member, rows){
 if(member.auto_redeem_enabled===false){
  return {level:'red',label:'Auto-redeem OFF — this account is not processing codes'};
 }

 const recent=(rows||[]).slice(0,8);
 if(!recent.length){
  return {level:'yellow',label:'Waiting for first Gift Code test — account not verified yet'};
 }

 const statuses=recent.map(x=>String(x.status||'').toLowerCase());
 const successStatuses=new Set(['redeemed','already_redeemed']);
 const hardStatuses=new Set(['failed','unknown']);
 const softStatuses=new Set(['retry_scheduled','processing','pending']);

 const successIndex=statuses.findIndex(s=>successStatuses.has(s));
 const recentSuccess=successIndex>=0 && successIndex<=4;

 // Expired is a code-level outcome, not an account failure.
 // If there is a recent proven success, remain green even if the newest code expired.
 if(recentSuccess){
  return {level:'green',label:'Gift Codes working — successful redemption history'};
 }

 // Ignore expired rows when judging whether the account itself is failing.
 const accountRelevant=recent.filter(x=>String(x.status||'').toLowerCase()!=='expired');
 const relevantStatuses=accountRelevant.map(x=>String(x.status||'').toLowerCase());

 const hardCount=relevantStatuses.filter(s=>hardStatuses.has(s)).length;
 const firstThree=relevantStatuses.slice(0,3);

 if(firstThree.length>=3 && firstThree.every(s=>hardStatuses.has(s))){
  return {level:'red',label:'Repeated redemption errors — verify/re-enter this Game ID'};
 }

 if(relevantStatuses[0] && (hardStatuses.has(relevantStatuses[0])||softStatuses.has(relevantStatuses[0]))){
  return {level:'yellow',label:'Recent redemption issue — NEXA will keep checking'};
 }

 // History exists, but no successful proof yet (for example only expirations).
 return {level:'yellow',label:'Enabled, but this account has not been successfully verified yet'};
}

export default async function handler(req,res){
 try{
  if(req.method!=='POST')return send(res,405,{ok:false,error:'Method not allowed.'});
  const allianceId=String(req.body?.alliance_id||'').trim();
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(allianceId))return send(res,400,{ok:false,error:'Invalid alliance.'});
  await authorize(req,allianceId);

  const members=await db(`gift_members?alliance_id=eq.${enc(allianceId)}&is_active=eq.true&select=game_id,auto_redeem_enabled&limit=1000`);
  const ids=members.map(m=>m.game_id);
  if(!ids.length)return send(res,200,{ok:true,statuses:{}});

  const rows=await db(`gift_redemptions?game_id=in.(${ids.map(enc).join(',')})&select=game_id,status,last_error_code,updated_at&order=updated_at.desc&limit=10000`);
  const by=new Map();
  for(const r of rows){
   if(!by.has(r.game_id))by.set(r.game_id,[]);
   const arr=by.get(r.game_id);
   if(arr.length<8)arr.push(r);
  }

  const statuses={};
  for(const m of members)statuses[m.game_id]=healthFor(m,by.get(m.game_id)||[]);
  return send(res,200,{ok:true,statuses});
 }catch(e){
  return send(res,e.status||500,{ok:false,error:e.message||'Unable to load member Gift Code status.'});
 }
}
