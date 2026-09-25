/* NEXA Gift Code Workspace | Server API v1
 * CREATE: server/nexa-gift-workspace.js (imported from existing API route)
 * Requires reviewed Gift Workspace SQL and an explicitly assigned gift_staff_access owner.
 * No redemption calls are made by this module.
 */
import { createHash } from 'node:crypto';
const URL = process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const json=(res,status,data)=>res.status(status).json(data);
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const enc=x=>encodeURIComponent(String(x));
async function db(path,{method='GET',body}={}){
  if(!KEY)throw fail('Server configuration unavailable.',503);
  const response=await fetch(`${URL}/rest/v1/${path}`,{method,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const raw=await response.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
  if(!response.ok)throw fail(`Database request failed (${response.status}): ${data?.message||data?.error||'Unknown error'}`,response.status>=500?502:400);
  return data;
}
async function rpc(name,body){return db(`rpc/${name}`,{method:'POST',body});}
function getToken(req){const v=String(req.headers.authorization||'');return v.startsWith('Bearer ')?v.slice(7).trim():'';}
async function staff(req){
 const token=getToken(req);if(!token)throw fail('Sign in to the staff workspace.',401);
 const hash=createHash('sha256').update(token).digest('hex');
 const sessions=await db(`transfer_staff_sessions?token_hash=eq.${hash}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
 if(!sessions?.length)throw fail('Staff session expired. Sign in again.',401);
 const id=sessions[0].account_id;
 const access=await db(`gift_staff_access?staff_account_id=eq.${enc(id)}&is_active=eq.true&select=role,state_number,alliance_id`);
 if(!access?.length)throw fail('No Gift Code Workspace access has been assigned.',403);
 return {id,token,access};
}
const owner=s=>s.access.some(a=>a.role==='owner');
const allowed=(s,state,alliance)=>owner(s)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||s.access.some(a=>a.role==='alliance_manager'&&alliance&&a.alliance_id===alliance);
const stateAllowed=(s,state)=>owner(s)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||s.access.some(a=>a.role==='alliance_manager'&&a.alliance_id);
function idCheck(v){const x=String(v??'').trim();if(!/^\d{1,30}$/.test(x))throw fail('Game ID must contain 1â30 digits.');return x;}
function nameCheck(v){const x=String(v??'').trim();if(!x||x.length>80)throw fail('Game Name is required (maximum 80 characters).');return x;}
function stateCheck(v){const n=Number(v);if(!Number.isSafeInteger(n)||n<=0)throw fail('Invalid state number.');return n;}
function allianceCheck(v){const x=String(v??'');if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(x))throw fail('Invalid alliance.');return x;}
async function alliance(id){const a=await db(`gift_alliances?id=eq.${enc(id)}&select=id,state_number,tag,is_active,auto_redeem&limit=1`);if(!a.length)throw fail('Alliance not found.',404);return a[0]}
async function snapshot(s){
 const states=await db('gift_states?select=state_number,display_name,is_active&order=state_number.asc');
 const all=await db('gift_alliances?select=id,state_number,tag,name,is_active,auto_redeem&order=state_number.asc,tag.asc');
 const alliances=owner(s)?all:all.filter(a=>allowed(s,a.state_number,a.id));
 const visibleStates=states.filter(x=>owner(s)||alliances.some(a=>a.state_number===x.state_number)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===x.state_number));
 return {states:visibleStates,alliances,role:owner(s)?'owner':s.access.some(a=>a.role==='redeemer_admin')?'redeemer_admin':'alliance_manager'};
}
async function members(s,a){if(!allowed(s,a.state_number,a.id))throw fail('Access denied for alliance.',403);return db(`gift_members?alliance_id=eq.${enc(a.id)}&select=game_id,game_name,state_number,alliance_id,is_active,auto_redeem_enabled,registration_method&order=game_name.asc&limit=1000`);}
async function exists(s,ids){if(ids.length>1000)throw fail('Import limit is 1000 rows.');if(!ids.length)return [];const gameIds=[...new Set(ids.map(idCheck))];const rows=await db(`gift_members?game_id=in.(${gameIds.map(enc).join(',')})&select=game_id,game_name,state_number,alliance_id`);return rows.filter(x=>owner(s)||allowed(s,x.state_number,x.alliance_id)).map(x=>({game_id:x.game_id,game_name:x.game_name,state_number:x.state_number,alliance_id:x.alliance_id}));}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(!['GET','POST'].includes(req.method))return json(res,405,{error:'Method not allowed.'});
  const s=await staff(req);
  if(req.method==='GET'){
   if(req.query?.action==='members'){const a=await alliance(allianceCheck(req.query.alliance));return json(res,200,{ok:true,members:await members(s,a)});}
   return json(res,200,{ok:true,...await snapshot(s)});
  }
  const b=req.body||{};
  switch(b.action){
   case 'lookup':return json(res,200,{ok:true,existing:await exists(s,Array.isArray(b.ids)?b.ids:[])});
   case 'create_state':{
    if(!owner(s))throw fail('Owner access required.',403);
    const n=stateCheck(b.state_number);
    const rows=await db('gift_states',{method:'POST',body:{state_number:n,display_name:`State ${n}`}});
    return json(res,200,{ok:true,state:rows?.[0]});
   }
   case 'create_alliance':{
    const n=stateCheck(b.state_number);if(!owner(s)&&!s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===n))throw fail('State administrator or Owner access required.',403);
    const tag=String(b.tag||'').trim().toUpperCase();if(!/^[^\s]{1,24}$/.test(tag))throw fail('Alliance tag must contain 1â24 characters without spaces.');
    const rows=await db('gift_alliances',{method:'POST',body:{state_number:n,tag,name:String(b.name||tag).trim().slice(0,80),auto_redeem:false}});
    return json(res,200,{ok:true,alliance:rows?.[0]});
   }
   case 'register':{
    const a=await alliance(allianceCheck(b.alliance_id));if(!allowed(s,a.state_number,a.id))throw fail('Access denied.',403);
    const rows=Array.isArray(b.rows)?b.rows:[];if(!rows.length||rows.length>1000)throw fail('Enter 1â1000 members.');
    const clean=rows.map(x=>({game_id:idCheck(x.game_id),game_name:nameCheck(x.game_name)}));
    const ids=clean.map(x=>x.game_id);if(new Set(ids).size!==ids.length)throw fail('Duplicate Game IDs in this import.');
    const bulk=b.method==='bulk';let batch=null;
    if(bulk){const inserted=await db('gift_import_batches',{method:'POST',body:{state_number:a.state_number,alliance_id:a.id,uploaded_by_staff_id:s.id,source_name:String(b.source_name||'Pasted text').slice(0,160),preview_rows:clean}});batch=inserted?.[0]?.id;}
    const result=await rpc('gift_v1_register_members',{p_staff_token:s.token,p_state:a.state_number,p_alliance:a.id,p_rows:clean,p_method:bulk?'bulk':'manual',p_import_batch:batch});
    return json(res,200,{ok:true,result});
   }
   case 'move':{
    const src=await alliance(allianceCheck(b.source_alliance_id)),dest=await alliance(allianceCheck(b.destination_alliance_id));
    if(!allowed(s,src.state_number,src.id)||!allowed(s,dest.state_number,dest.id))throw fail('Access required for source AND destination.',403);
    const ids=Array.isArray(b.game_ids)?b.game_ids.map(idCheck):[];
    const result=await rpc('gift_v1_move_members',{p_staff_token:s.token,p_source_alliance:src.id,p_destination_alliance:dest.id,p_game_ids:ids,p_note:'Gift Code Workspace move'});
    return json(res,200,{ok:true,result});
   }
   case 'alliance_auto':{
    const a=await alliance(allianceCheck(b.alliance_id));if(!allowed(s,a.state_number,a.id))throw fail('Access denied.',403);
    const result=await rpc('gift_v1_set_alliance_auto_redeem',{p_staff_token:s.token,p_alliance:a.id,p_enabled:b.enabled===true});return json(res,200,{ok:true,result});
   }
   case 'member_auto':{
    const id=idCheck(b.game_id);const rows=await db(`gift_members?game_id=eq.${id}&select=alliance_id,state_number&limit=1`);if(!rows.length||!allowed(s,rows[0].state_number,rows[0].alliance_id))throw fail('Access denied.',403);
    const result=await rpc('gift_v1_set_member_auto_redeem',{p_staff_token:s.token,p_game_id:id,p_enabled:b.enabled===true});return json(res,200,{ok:true,result});
   }
   default:throw fail('Unknown action.');
  }
 }catch(e){return json(res,e.status||500,{ok:false,error:e.message||'Unexpected error.'});}
}
