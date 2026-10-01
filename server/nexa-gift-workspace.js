/* NEXA Gift Code Workspace | Server API v1.7
 * REPLACE: server/nexa-gift-workspace.js
 * Manual codes are verified before activation. Needs Verification is only a temporary
 * owner fallback when public verification sources are unavailable or incomplete.
 */
import { createHash } from 'node:crypto';
import { discoverAndPrepare } from './nexa-gift-discovery.js';
import { runGiftAutoWorker } from './nexa-gift-auto-worker.js';
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
 let access=await db(`gift_staff_access?staff_account_id=eq.${enc(id)}&is_active=eq.true&select=role,state_number,alliance_id`);
 // WOS Utilities is the parent workspace. If this account has no legacy Gift-specific row,
 // inherit its global WOS Utilities access instead of asking for a second login/registration.
 if(!access?.length){
   const acct=(await db(`transfer_staff_accounts?id=eq.${enc(id)}&select=game_id&limit=1`))[0];
   const wos=acct?(await db(`wos_utility_staff_access?game_id=eq.${enc(acct.game_id)}&status=eq.active&select=role,main_alliance_id,module_access&limit=1`))[0]:null;
   if(!wos||wos.module_access?.gift===false)throw fail('Gift Codes access is not enabled for this WOS Utilities account.',403);
   if(wos.role==='owner')access=[{role:'owner',state_number:null,alliance_id:null}];
   else if(wos.role==='administrative')access=[{role:'wos_admin',state_number:null,alliance_id:null}];
   else access=[{role:'alliance_manager',state_number:null,alliance_id:wos.main_alliance_id||null}];
 }
 return {id,token,access};
}
const owner=s=>s.access.some(a=>a.role==='owner'||a.role==='wos_admin');
const allowed=(s,state,alliance)=>owner(s)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||s.access.some(a=>a.role==='alliance_manager'&&alliance&&a.alliance_id===alliance);
const stateAllowed=(s,state)=>owner(s)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||s.access.some(a=>a.role==='alliance_manager'&&a.alliance_id);
function idCheck(v){const x=String(v??'').trim();if(!/^\d{1,30}$/.test(x))throw fail('Game ID must contain 1â30 digits.');return x;}
function nameCheck(v){const x=String(v??'').trim();if(!x||x.length>80)throw fail('Game Name is required (maximum 80 characters).');return x;}
function stateCheck(v){const n=Number(v);if(!Number.isSafeInteger(n)||n<=0)throw fail('Invalid state number.');return n;}
function allianceCheck(v){const x=String(v??'');if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(x))throw fail('Invalid alliance.');return x;}
async function alliance(id){const a=await db(`gift_alliances?id=eq.${enc(id)}&deleted_at=is.null&select=id,state_number,tag,is_active,auto_redeem&limit=1`);if(!a.length)throw fail('Alliance not found.',404);return a[0]}
async function snapshot(s){
 const states=await db('gift_states?is_active=eq.true&select=state_number,display_name,is_active&order=state_number.asc');
 const all=await db('gift_alliances?deleted_at=is.null&select=id,state_number,tag,name,is_active,auto_redeem&order=state_number.asc,tag.asc');
 const alliances=owner(s)?all:all.filter(a=>allowed(s,a.state_number,a.id));
 const visibleStates=states.filter(x=>owner(s)||alliances.some(a=>a.state_number===x.state_number)||s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===x.state_number));
 return {states:visibleStates,alliances,role:owner(s)?'owner':s.access.some(a=>a.role==='redeemer_admin')?'redeemer_admin':'alliance_manager'};
}
async function members(s,a){ if(!allowed(s,a.state_number,a.id))throw fail('Access denied for alliance.',403);
 const list=await db(`gift_members?alliance_id=eq.${enc(a.id)}&is_active=eq.true&select=game_id,game_name,state_number,alliance_id,is_active,auto_redeem_enabled,registration_method&order=game_name.asc&limit=1000`);
 if(!list.length)return list;
 const ids=list.map(m=>enc(m.game_id)).join(',');
 const results=await db(`gift_redemptions?game_id=in.(${ids})&select=game_id,status,last_error_code,updated_at&order=updated_at.desc&limit=10000`);
 const recent=new Map();
 for(const r of results){if(!recent.has(r.game_id))recent.set(r.game_id,r)}
 return list.map(m=>({...m,redemption_issue:recent.has(m.game_id)&&['failed','error','retry','retry_needed'].includes(String(recent.get(m.game_id).status).toLowerCase())?recent.get(m.game_id):null}));
}
async function exists(s,ids){if(ids.length>1000)throw fail('Import limit is 1000 rows.');if(!ids.length)return [];const gameIds=[...new Set(ids.map(idCheck))];const rows=await db(`gift_members?game_id=in.(${gameIds.map(enc).join(',')})&select=game_id,game_name,state_number,alliance_id`);return rows.filter(x=>owner(s)||allowed(s,x.state_number,x.alliance_id)).map(x=>({game_id:x.game_id,game_name:x.game_name,state_number:x.state_number,alliance_id:x.alliance_id}));}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 try{
  if(!['GET','POST'].includes(req.method))return json(res,405,{error:'Method not allowed.'});
  const s=await staff(req);
  if(req.method==='GET'){
   if(req.query?.action==='members'){const a=await alliance(allianceCheck(req.query.alliance));return json(res,200,{ok:true,members:await members(s,a)});}
   if(req.query?.action==='codes'){
    const codes=await db('gift_codes?select=id,code,status,source,reward_type,discovered_at,expires_at&order=discovered_at.desc&limit=150');
    const runs=owner(s)?await db('gift_discovery_runs?select=source,finished_at,status,codes_found,codes_added,queue_added,error_detail&order=id.desc&limit=10'):[];
    let pending=0;
    if(owner(s)){const items=await db('gift_redemptions?status=eq.pending&select=id&limit=10000');pending=items.length;}
    return json(res,200,{ok:true,codes,runs,pending,redemption_enabled:true,discovery_sources:['WSCO public active gift codes'],note:'Codes are source-listed; individual game eligibility has NOT been confirmed.'});
   }
   return json(res,200,{ok:true,...await snapshot(s)});
  }
  const b=req.body||{};
  switch(b.action){
   case 'scan_codes':{
    if(!owner(s))throw fail('Owner access required.',403);
    const result=await discoverAndPrepare();if(!result.ok)return json(res,502,result);
    let invalid_removed=0;
    if(result.status==='success'){const waiting=await db('gift_codes?status=eq.unverified&select=id&limit=500');for(const item of waiting){try{await rpc('gift_v3_delete_unverified_code',{p_code_id:item.id});invalid_removed++}catch{}}}
    const auto=await runGiftAutoWorker();return json(res,200,{...result,invalid_removed,auto});
   }
   case 'manual_code':{
    if(!owner(s))throw fail('Owner access required.',403);
    const code=String(b.code||'').trim();if(!/^[A-Za-z0-9_-]{4,120}$/.test(code))throw fail('Enter a valid code (4-120 letters, digits, hyphen or underscore).');
    const existing=await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`);
    if(String(existing?.[0]?.status||'').toLowerCase()==='expired')return json(res,200,{ok:true,status:'expired',code:existing[0]});
    const discovery=await discoverAndPrepare();
    const after=await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`);const current=after?.[0]||null;
    if(current&&['available','active'].includes(String(current.status||'').toLowerCase())){const auto=await runGiftAutoWorker();return json(res,200,{ok:true,status:'active',code:current,auto});}
    if(current&&String(current.status||'').toLowerCase()==='expired')return json(res,200,{ok:true,status:'expired',code:current});
    if(discovery.status==='success'){if(current&&String(current.status||'').toLowerCase()==='unverified'){try{await rpc('gift_v3_delete_unverified_code',{p_code_id:current.id})}catch{}}throw fail('Gift code not found. Check the code and try again.',400);}
    let saved=current;if(!saved){await rpc('gift_v1_record_discovered_code',{p_code:code,p_source:'NEXA Staff (manual)',p_reward_type:'unknown'});const rows=await db(`gift_codes?code=eq.${enc(code)}&select=id,code,status,source,expires_at&limit=1`);saved=rows?.[0]||null;}
    return json(res,200,{ok:true,status:'needs_verification',code:saved,verification_status:discovery.status});
   }
   case 'retry_code_verification':{
    if(!owner(s))throw fail('Owner access required.',403);
    const codeId=String(b.code_id||'').trim();const before=await db(`gift_codes?id=eq.${enc(codeId)}&status=eq.unverified&select=id,code,status&limit=1`);if(!before.length)throw fail('Needs Verification code not found.',404);
    const discovery=await discoverAndPrepare();const after=await db(`gift_codes?id=eq.${enc(codeId)}&select=id,code,status,source,expires_at&limit=1`);const current=after?.[0]||null;
    if(current&&['available','active'].includes(String(current.status||'').toLowerCase())){const auto=await runGiftAutoWorker();return json(res,200,{ok:true,status:'active',code:current,auto});}
    if(current&&String(current.status||'').toLowerCase()==='expired')return json(res,200,{ok:true,status:'expired',code:current});
    if(discovery.status==='success'){await rpc('gift_v3_delete_unverified_code',{p_code_id:codeId});return json(res,200,{ok:true,status:'invalid',code:null});}
    return json(res,200,{ok:true,status:'needs_verification',code:current,verification_status:discovery.status});
   }
   case 'delete_unverified_code':{
    if(!owner(s))throw fail('Owner access required.',403);
    const codeId=String(b.code_id||'').trim();if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(codeId))throw fail('Invalid code ID.');
    const result=await rpc('gift_v3_delete_unverified_code',{p_code_id:codeId});return json(res,200,{ok:true,result});
   }
   case 'lookup':return json(res,200,{ok:true,existing:await exists(s,Array.isArray(b.ids)?b.ids:[])});
   case 'create_state':{
    if(!owner(s))throw fail('Owner access required.',403);
    const n=stateCheck(b.state_number);
    const existing=await db(`gift_states?state_number=eq.${n}&select=state_number,display_name,is_active&limit=1`);
    const rows=existing.length
      ?await db(`gift_states?state_number=eq.${n}`,{method:'PATCH',body:{display_name:`State ${n}`,is_active:true}})
      :await db('gift_states',{method:'POST',body:{state_number:n,display_name:`State ${n}`,is_active:true}});
    return json(res,200,{ok:true,state:rows?.[0]});
   }
   case 'delete_state':{
    if(!owner(s))throw fail('Owner access required.',403);
    const n=stateCheck(b.state_number);
    if(String(b.confirm||'')!==String(n))throw fail('Type the exact state number to confirm.');
    const active=await db(`gift_alliances?state_number=eq.${n}&deleted_at=is.null&select=id,tag&limit=2`);
    if(active.length)throw fail(`State ${n} still has active alliances. Delete or move those alliances first.`);
    await db(`gift_states?state_number=eq.${n}`,{method:'PATCH',body:{is_active:false}});
    return json(res,200,{ok:true,deleted_state:n});
   }
   case 'create_alliance':{
    const n=stateCheck(b.state_number);if(!owner(s)&&!s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===n))throw fail('State administrator or Owner access required.',403);
    const tag=String(b.tag||'').trim();if(!/^[^\s]{1,24}$/.test(tag))throw fail('Alliance tag must contain 1â24 characters without spaces.');
    const rows=await db('gift_alliances',{method:'POST',body:{state_number:n,tag,name:String(b.name||tag).trim().slice(0,80),auto_redeem:true}});
    return json(res,200,{ok:true,alliance:rows?.[0]});
   }
   case 'manage_alliance':{
    const a=await alliance(allianceCheck(b.alliance_id));if(!allowed(s,a.state_number,a.id))throw fail('Access denied.',403);
    const action=String(b.operation||'');if(!['edit','deactivate','reactivate','delete'].includes(action))throw fail('Unknown alliance operation.');
    if(action==='delete'&&String(b.confirm||'')!==a.tag)throw fail('Type the exact alliance tag to confirm.');
    if(action==='reactivate'&&a.is_active)throw fail('Alliance is already active.');if(action==='deactivate'&&!a.is_active)throw fail('Alliance is already inactive.');
    const ids=action==='delete'&&Array.isArray(b.game_ids)?b.game_ids.map(idCheck):[];if(ids.length>1000||new Set(ids).size!==ids.length)throw fail('Invalid member selection.');
    const dest=action==='delete'&&ids.length?await alliance(allianceCheck(b.destination_alliance_id)):null;if(dest&&(!dest.is_active||!allowed(s,dest.state_number,dest.id)))throw fail('Destination alliance unavailable or access denied.',403);
    const result=await rpc('gift_v2_manage_alliance',{p_staff_token:s.token,p_action:action,p_alliance:a.id,p_state:action==='edit'?stateCheck(b.state_number):null,p_tag:action==='edit'?String(b.tag||'').trim():null,p_name:action==='edit'?String(b.name||'').trim():null,p_destination:dest?.id||null,p_game_ids:ids,p_confirm:action==='delete'?String(b.confirm):null});
    return json(res,200,{ok:true,result});
   }
   case 'register':{
    const a=await alliance(allianceCheck(b.alliance_id));if(!allowed(s,a.state_number,a.id))throw fail('Access denied.',403);
    const rows=Array.isArray(b.rows)?b.rows:[];if(!rows.length||rows.length>1000)throw fail('Enter 1â1000 members.');
    const clean=rows.map(x=>({game_id:idCheck(x.game_id),game_name:nameCheck(x.game_name)}));const ids=clean.map(x=>x.game_id);if(new Set(ids).size!==ids.length)throw fail('Duplicate Game IDs in this import.');
    const bulk=b.method==='bulk';let batch=null;if(bulk){const inserted=await db('gift_import_batches',{method:'POST',body:{state_number:a.state_number,alliance_id:a.id,uploaded_by_staff_id:s.id,source_name:String(b.source_name||'Pasted text').slice(0,160),preview_rows:clean}});batch=inserted?.[0]?.id;}
    const result=await rpc('gift_v1_register_members',{p_staff_token:s.token,p_state:a.state_number,p_alliance:a.id,p_rows:clean,p_method:bulk?'bulk':'manual',p_import_batch:batch});
    let auto=null;if(a.is_active&&a.auto_redeem){try{auto=await runGiftAutoWorker();}catch(e){console.error('[NEXA Gift Register Auto]',e);auto={error:String(e?.message||e).slice(0,180)};}}
    return json(res,200,{ok:true,result,auto});
   }
   case 'move':{
    const src=await alliance(allianceCheck(b.source_alliance_id)),dest=await alliance(allianceCheck(b.destination_alliance_id));if(!allowed(s,src.state_number,src.id)||!allowed(s,dest.state_number,dest.id))throw fail('Access required for source AND destination.',403);
    const ids=Array.isArray(b.game_ids)?b.game_ids.map(idCheck):[];const result=await rpc('gift_v1_move_members',{p_staff_token:s.token,p_source_alliance:src.id,p_destination_alliance:dest.id,p_game_ids:ids,p_note:'Gift Code Workspace move'});return json(res,200,{ok:true,result});
   }
   case 'alliance_auto':{
    const a=await alliance(allianceCheck(b.alliance_id));if(!allowed(s,a.state_number,a.id))throw fail('Access denied.',403);const result=await rpc('gift_v1_set_alliance_auto_redeem',{p_staff_token:s.token,p_alliance:a.id,p_enabled:b.enabled===true});return json(res,200,{ok:true,result});
   }
   case 'member_auto':{
    const id=idCheck(b.game_id);const rows=await db(`gift_members?game_id=eq.${id}&select=alliance_id,state_number&limit=1`);if(!rows.length||!allowed(s,rows[0].state_number,rows[0].alliance_id))throw fail('Access denied.',403);const result=await rpc('gift_v1_set_member_auto_redeem',{p_staff_token:s.token,p_game_id:id,p_enabled:b.enabled===true});return json(res,200,{ok:true,result});
   }
   case 'edit_member':{
    const oldId=idCheck(b.old_game_id),newId=idCheck(b.game_id),newName=nameCheck(b.game_name);const rows=await db(`gift_members?game_id=eq.${enc(oldId)}&select=game_id,state_number,alliance_id,is_active&limit=1`);
    if(!rows.length||!rows[0].is_active)throw fail('Active member not found.',404);if(!allowed(s,rows[0].state_number,rows[0].alliance_id))throw fail('Access denied.',403);
    if(oldId!==newId){const duplicate=await db(`gift_members?game_id=eq.${enc(newId)}&select=game_id&limit=1`);if(duplicate.length)throw fail('Game ID already registered.');}
    const result=await rpc('gift_v2_correct_member_id',{p_old_id:oldId,p_new_id:newId,p_name:newName});return json(res,200,{ok:true,result});
   }
   case 'delete_member':{
    const id=idCheck(b.game_id);const rows=await db(`gift_members?game_id=eq.${enc(id)}&select=game_id,state_number,alliance_id,is_active&limit=1`);
    if(!rows.length||!rows[0].is_active)throw fail('Active member not found.',404);if(!allowed(s,rows[0].state_number,rows[0].alliance_id))throw fail('Access denied.',403);
    const result=await db(`gift_members?game_id=eq.${enc(id)}&is_active=eq.true`,{method:'PATCH',body:{is_active:false,auto_redeem_enabled:false,updated_at:new Date().toISOString()}});if(result.length!==1)throw fail('Member was not updated; refresh and retry.',409);
    const pending=await db(`gift_redemptions?game_id=eq.${enc(id)}&status=eq.pending`,{method:'PATCH',body:{status:'skipped',last_error_code:'member_removed',updated_at:new Date().toISOString()}});
    return json(res,200,{ok:true,removed:id,pending_cancelled:pending.length});
   }
   case 'grant_staff':{
    const gameId=idCheck(b.game_id),role=String(b.role||'');if(!['redeemer_admin','alliance_manager'].includes(role))throw fail('Invalid Gift staff role.');
    const targetState=role==='redeemer_admin'?stateCheck(b.state_number):null;const targetAlliance=role==='alliance_manager'?allianceCheck(b.alliance_id):null;
    if(role==='redeemer_admin'&&!owner(s))throw fail('Owner access required for State Admin.',403);
    if(role==='alliance_manager'){const dest=await alliance(targetAlliance);if(!owner(s)&&!s.access.some(x=>x.role==='redeemer_admin'&&x.state_number===dest.state_number))throw fail('State Admin or Owner access required.',403);}
    const result=await rpc('gift_v1_grant_staff',{p_staff_token:s.token,p_game_id:gameId,p_role:role,p_state:targetState,p_alliance:targetAlliance});return json(res,200,{ok:true,result});
   }
   default:throw fail('Unknown action.');
  }
 }catch(e){return json(res,e.status||500,{ok:false,error:e.message||'Unexpected error.'});}
}
