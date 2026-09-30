/* NEXA Gift Code Workspace | Server API v1
 * CREATE: server/nexa-gift-workspace.js (imported from existing API route)
 * Requires reviewed Gift Workspace SQL and an explicitly assigned gift_staff_access owner.
 * Discovery still queues locally. One Owner-only controlled worker action may send exactly one hard-locked provider request.
 */
import { createHash } from 'node:crypto';
import { discoverAndPrepare } from './nexa-gift-discovery.js';
import { runGiftControlledTest } from './nexa-gift-auto-worker.js';

const URL = process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const json=(res,status,data)=>res.status(status).json(data);
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const enc=x=>encodeURIComponent(String(x));

async function db(path,{method='GET',body}={}){
  if(!KEY)throw fail('Server configuration unavailable.',503);

  const response=await fetch(`${URL}/rest/v1/${path}`,{
    method,
    headers:{
      apikey:KEY,
      Authorization:`Bearer ${KEY}`,
      'Content-Type':'application/json',
      Prefer:'return=representation'
    },
    body:body===undefined?undefined:JSON.stringify(body)
  });

  const raw=await response.text();
  let data;

  try{
    data=raw?JSON.parse(raw):null;
  }catch{
    data=raw;
  }

  if(!response.ok){
    throw fail(
      `Database request failed (${response.status}): ${data?.message||data?.error||'Unknown error'}`,
      response.status>=500?502:400
    );
  }

  return data;
}

async function rpc(name,body){
  return db(`rpc/${name}`,{method:'POST',body});
}

function getToken(req){
  const v=String(req.headers.authorization||'');
  return v.startsWith('Bearer ')?v.slice(7).trim():'';
}

async function staff(req){
  const token=getToken(req);

  if(!token){
    throw fail('Sign in to the staff workspace.',401);
  }

  const hash=createHash('sha256').update(token).digest('hex');

  const sessions=await db(
    `transfer_staff_sessions?token_hash=eq.${hash}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`
  );

  if(!sessions?.length){
    throw fail('Staff session expired. Sign in again.',401);
  }

  const id=sessions[0].account_id;

  const access=await db(
    `gift_staff_access?staff_account_id=eq.${enc(id)}&is_active=eq.true&select=role,state_number,alliance_id`
  );

  if(!access?.length){
    throw fail('No Gift Code Workspace access has been assigned.',403);
  }

  return {id,token,access};
}

const owner=s=>s.access.some(a=>a.role==='owner');

const allowed=(s,state,alliance)=>
  owner(s)||
  s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||
  s.access.some(a=>a.role==='alliance_manager'&&alliance&&a.alliance_id===alliance);

const stateAllowed=(s,state)=>
  owner(s)||
  s.access.some(a=>a.role==='redeemer_admin'&&a.state_number===Number(state))||
  s.access.some(a=>a.role==='alliance_manager'&&a.alliance_id);

function idCheck(v){
  const x=String(v??'').trim();
  if(!/^\d{1,30}$/.test(x)){
    throw fail('Game ID must contain 