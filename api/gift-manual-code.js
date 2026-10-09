/* NEXA Gift Manual Code API v1.0
   Allows Global Gift Owner/WOS Admin and State redeemer_admin to submit an emergency code.
   The code is validated by the real Whiteout Survival redeem provider, not by public-source presence.
*/
import { createHash } from 'node:crypto';
import { runGiftAutoWorker } from '../server/nexa-gift-auto-worker.js';

const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const enc=v=>encodeURIComponent(String(v));
const hash=v=>createHash('sha256').update(String(v)).digest('hex');
const send=(res,status,data)=>res.status(status).json(data);

async function db(path,{method='GET',body}={}){
 if(!KEY)throw Object.assign(new Error('Server configuration unavailable.'),{status:503});
 const r=await fetch(`${SB_URL}/rest/v1/${path}`,{
  method,
  headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},
  body:body===undefined?undefined:JSON.stringify(body)
 });
 const raw=await r.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
 if(!r.ok)throw Object.assign(new Error(data?.message||data?.error||`Database request failed (${r.status})`),{status:r.status>=500?502:400});
 return data
}
const rpc=(name,body)=>db(`rpc/${name}`,{method:'POST',body});

async function codeManager(req){
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
 if(!token)throw Object.assign(new Error('Sign in to the staff workspace.'),{status:401});
 const sessions=await db(`transfer_staff_sessions?token_hash=eq.${hash(token)}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
 if(!sessions?.length)throw Object.assign(new Error('Staff session expired. Sign in again.'),{status:401});
 const accountId=sessions[0].account_id;
 let access=await db(`gift_staff_access?staff_account_id=eq.${enc(accountId)}&is_active=eq.true&select=role,state_number,alliance_id`);
 if(!access?.length){
  const acct=(await db(`transfer_staff_accounts?id=eq.${enc(accountId)}&select=game_id&limit=1`))[0];
  const wos=acct?(await db(`wos_utility_staff_access?game_id=eq.${enc(acct.game_id)}&status=eq.active&select=role,module_access&limit=1`))[0]:null;
  if(wos&&wos.module_access?.gift!==false&&['owner','administrative'].includes(wos.role))return {accountId,role:wos.role};
 }
 if(access.some(a=>['owner','wos_admin','redeemer_admin'].includes(a.role)))return {accountId,role:access.find(a=>['owner','wos_admin','redeemer_admin'].includes(a.role))?.role};
 throw Object.assign(new Error('State Admin or Owner access required to add Gift Codes.'),{status:403});
}

export default async function handler(req,res){
 try{
  if(req.method!=='POST')return send(res,405,{ok:false,error:'Method not allowed.'});
  await codeManager(req);
  const code=String(req.body?.code||'').trim();
  if(!/^[A-Za-z0-9_-]{4,120}$/.test(code))return send(res,400,{ok:false,error:'Enter a valid Gift Code.'});

  let current=(await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`))?.[0]||null;
  if(!current){
   await rpc('gift_v1_record_discovered_code',{p_code:code,p_source:'NEXA Staff (manual emergency add)',p_reward_type:'unknown'});
   current=(await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`))?.[0]||null;
  }
  if(!current)throw new Error('Gift Code could not be saved.');

  // If the code had previously been marked expired, do not silently revive it.
  if(String(current.status||'').toLowerCase()==='expired'){
   return send(res,200,{ok:true,status:'expired',code:current});
  }

  await rpc('gift_v1_prepare_redemption_queue',{p_limit:5000});
  const auto=await runGiftAutoWorker();
  current=(await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`))?.[0]||current;
  return send(res,200,{ok:true,status:String(current.status||'processed').toLowerCase(),code:current,auto});
 }catch(e){
  return send(res,e.status||500,{ok:false,error:e.message||'Gift Code request failed.'});
 }
}
