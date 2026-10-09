/* NEXA Gift Scan Now API v1.0
   Global Gift Owner/WOS Admin and State redeemer_admin may manually trigger a source scan.
*/
import { createHash } from 'node:crypto';
import { discoverAndPrepare } from '../server/nexa-gift-discovery.js';
import { runGiftAutoWorker } from '../server/nexa-gift-auto-worker.js';

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
 return data
}
async function canScan(req){
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
 if(!token)throw Object.assign(new Error('Sign in to the staff workspace.'),{status:401});
 const sessions=await db(`transfer_staff_sessions?token_hash=eq.${hash(token)}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
 if(!sessions?.length)throw Object.assign(new Error('Staff session expired. Sign in again.'),{status:401});
 const accountId=sessions[0].account_id;
 const access=await db(`gift_staff_access?staff_account_id=eq.${enc(accountId)}&is_active=eq.true&select=role`);
 if(access.some(a=>['owner','wos_admin','redeemer_admin'].includes(a.role)))return true;
 const acct=(await db(`transfer_staff_accounts?id=eq.${enc(accountId)}&select=game_id&limit=1`))[0];
 const wos=acct?(await db(`wos_utility_staff_access?game_id=eq.${enc(acct.game_id)}&status=eq.active&select=role,module_access&limit=1`))[0]:null;
 if(wos&&wos.module_access?.gift!==false&&['owner','administrative'].includes(wos.role))return true;
 throw Object.assign(new Error('State Admin or Owner access required to check for Gift Codes.'),{status:403});
}
export default async function handler(req,res){
 try{
  if(req.method!=='POST')return send(res,405,{ok:false,error:'Method not allowed.'});
  await canScan(req);
  const result=await discoverAndPrepare();
  if(!result.ok)return send(res,502,{ok:false,...result});
  const auto=await runGiftAutoWorker();
  return send(res,200,{ok:true,...result,auto});
 }catch(e){return send(res,e.status||500,{ok:false,error:e.message||'Gift Code scan failed.'})}
}
