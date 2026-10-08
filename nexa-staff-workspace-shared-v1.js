/* NEXA Staff Workspace Shared UI V3.0 — GLOBAL SSO + EXACT WORKSPACE ROUTES */
(()=>{'use strict';
if(window.__NEXA_STAFF_SHARED_V3__)return;
window.__NEXA_STAFF_SHARED_V3__=true;

const URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const file=(location.pathname.split('/').pop()||'').toLowerCase();
const MODULE=file.startsWith('ministry-')?'ministry':file.startsWith('transfer-')?'transfer':file.startsWith('gift-code-')?'gift':'';
const $=id=>document.getElementById(id);
const client=()=>window.supabase?.createClient?.(URL,KEY);
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const state=()=>Number(localStorage.getItem('nexa_active_state')||sessionStorage.getItem('nexa_active_state')||localStorage.getItem('nexa_active_state_v49')||sessionStorage.getItem('nexa_active_state_v49')||0);

function syncState(){
 const n=state();if(!n)return;
 window.NEXA_ACTIVE_STATE=n;
 const t=token(),store=localStorage.getItem('nexa_transfer_staff_token')===t?localStorage:sessionStorage;
 store.setItem('nexa_active_state',String(n));
 store.setItem('nexa_active_state_v49',String(n));
}
function clear(){
 for(const s of [localStorage,sessionStorage]){
  s.removeItem('nexa_transfer_staff_token');s.removeItem('nexa_active_state');s.removeItem('nexa_active_state_v49');
 }
}
async function rpc(name,args){
 const sb=client();if(!sb)throw Error('Supabase client unavailable.');
 const {data,error}=await sb.rpc(name,args);if(error)throw error;return data;
}
function sameState(m,n){return !n||!m?.state_number||Number(m.state_number)===Number(n)}
function exactCurrent(mods){
 const n=state();
 return (mods||[]).find(m=>m.module===MODULE&&sameState(m,n))||(mods||[]).find(m=>m.module===MODULE);
}
async function validate(){
 const t=token();if(!t)return {ok:false,reason:'missing'};
 const [session,access]=await Promise.all([
  rpc('transfer_staff_session',{p_token:t}),
  rpc('nexa_staff_workspace_access_v1',{p_token:t})
 ]);
 if(!session?.ok||!access?.ok)return {ok:false,reason:'session'};
 return {ok:true,session,access,modules:access.modules||session.modules||[]};
}
function currentMatches(url){
 try{
  const a=new URL(url,location.href),b=new URL(location.href);
  if(a.pathname!==b.pathname)return false;
  const aw=a.searchParams.get('workspace'),bw=b.searchParams.get('workspace');
  return !aw||aw===bw;
 }catch{return false}
}
function buildNav(mods){
 const sel=$('workspaceSwitch')||$('moduleSwitch');if(!sel)return;
 const n=state(),list=[],seen=new Set();
 for(const m of mods||[]){
  if(!m?.url||!sameState(m,n))continue;
  const key=m.module||m.url;if(seen.has(key))continue;seen.add(key);list.push(m);
 }
 const order={transfer:1,ministry:2,gift:3,wos:3};
 list.sort((a,b)=>(order[a.module]||9)-(order[b.module]||9));
 const current=exactCurrent(list);
 sel.replaceChildren(...list.map(m=>new Option(
  m.module==='transfer'?'Transfer':m.module==='ministry'?'Ministry':'WOS Utilities',
  m.url,
  false,
  current?m===current:currentMatches(m.url)
 )));
 sel.onchange=()=>{const u=sel.value;if(u&&!currentMatches(u))location.href=u};
}
async function boot(){
 syncState();
 if(!MODULE)return;
 const t=token();
 if(!t){location.replace('staff-workspaces.html');return}
 try{
  const v=await validate();
  if(!v.ok){clear();location.replace('staff-workspaces.html');return}
  const mine=exactCurrent(v.modules);
  if(!mine){location.replace('staff-workspaces.html');return}
  const here=new URL(location.href),target=new URL(mine.url,location.href);
  const missingWorkspace=(MODULE==='transfer'||MODULE==='ministry')&&!here.searchParams.get('workspace')&&target.searchParams.get('workspace');
  if(missingWorkspace){location.replace(target.href);return}
  setTimeout(()=>buildNav(v.modules),0);
  window.addEventListener('pageshow',()=>buildNav(v.modules));
 }catch(e){
  console.warn('NEXA shared session validation failed',e);
  /* Network/module failures do NOT destroy a valid global session. */
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();