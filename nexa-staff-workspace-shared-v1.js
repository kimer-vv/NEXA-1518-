/* NEXA Staff Workspace Shared UI V3.1 — GLOBAL NAV ENFORCER + GAME-ID IDENTITY */
(()=>{'use strict';
if(window.__NEXA_STAFF_SHARED_V31__)return;
window.__NEXA_STAFF_SHARED_V31__=true;

const URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const file=(location.pathname.split('/').pop()||'').toLowerCase();
const MODULE=file.startsWith('ministry-')?'ministry':file.startsWith('transfer-')?'transfer':file.startsWith('gift-code-')?'gift':'';
const $=id=>document.getElementById(id);
const client=()=>window.supabase?.createClient?.(URL,KEY);
const getToken=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const getState=()=>Number(localStorage.getItem('nexa_active_state')||sessionStorage.getItem('nexa_active_state')||localStorage.getItem('nexa_active_state_v49')||sessionStorage.getItem('nexa_active_state_v49')||0);

let cachedModules=[],navLock=false;

function syncState(){
 const n=getState();if(!n)return;
 window.NEXA_ACTIVE_STATE=n;
 const t=getToken(),store=localStorage.getItem('nexa_transfer_staff_token')===t?localStorage:sessionStorage;
 store.setItem('nexa_active_state',String(n));
 store.setItem('nexa_active_state_v49',String(n));
}
function clearSession(){
 for(const s of [localStorage,sessionStorage]){
  s.removeItem('nexa_transfer_staff_token');
  s.removeItem('nexa_active_state');
  s.removeItem('nexa_active_state_v49');
 }
}
async function rpc(name,args){
 const sb=client();if(!sb)throw Error('Supabase client unavailable.');
 const {data,error}=await sb.rpc(name,args);if(error)throw error;return data;
}
function sameState(m,n){return !n||!m?.state_number||Number(m.state_number)===Number(n)}
function simpleLabel(m){return m.module==='transfer'?'Transfer':m.module==='ministry'?'Ministry':'WOS Utilities'}
function normalize(rows){
 const n=getState(),seen=new Set(),list=[];
 for(const m of rows||[]){
  if(!m?.url||!sameState(m,n))continue;
  const key=m.module||m.url;if(seen.has(key))continue;
  seen.add(key);list.push(m);
 }
 const order={transfer:1,ministry:2,gift:3,wos:3};
 return list.sort((a,b)=>(order[a.module]||9)-(order[b.module]||9));
}
function exactCurrent(mods){
 const n=getState();
 return (mods||[]).find(m=>m.module===MODULE&&sameState(m,n))||(mods||[]).find(m=>m.module===MODULE);
}
function currentMatches(url){
 try{
  const a=new URL(url,location.href),b=new URL(location.href);
  if(a.pathname!==b.pathname)return false;
  const aw=a.searchParams.get('workspace'),bw=b.searchParams.get('workspace');
  return !aw||!bw||aw===bw;
 }catch{return false}
}
function navSignature(list){return list.map(m=>`${simpleLabel(m)}|${m.url}`).join('||')}
function currentSelectSignature(sel){return [...sel.options].map(o=>`${o.text}|${o.value}`).join('||')}

function enforceNav(){
 if(navLock||!cachedModules.length)return;
 const sel=$('workspaceSwitch')||$('moduleSwitch');if(!sel)return;
 const list=normalize(cachedModules),wanted=navSignature(list);
 if(!wanted)return;
 if(currentSelectSignature(sel)!==wanted){
  navLock=true;
  const current=exactCurrent(list);
  sel.replaceChildren(...list.map(m=>new Option(simpleLabel(m),m.url,false,current?m===current:currentMatches(m.url))));
  navLock=false;
 }else{
  const current=exactCurrent(list);
  if(current&&[...sel.options].some(o=>o.value===current.url))sel.value=current.url;
 }
 sel.onchange=()=>{const u=sel.value;if(u&&!currentMatches(u))location.href=u};
}

function installTransferIdentityFirewall(){
 if(MODULE!=='transfer')return;
 if(!$('nexa-game-id-identity-css')){
  const css=document.createElement('style');
  css.id='nexa-game-id-identity-css';
  css.textContent=`
   .staffUser{display:none!important}
   #changeUsernameModal,#forgotUserModal{display:none!important}
  `;
  document.head.appendChild(css);
 }
 const clean=()=>{
  document.querySelectorAll('.staffUser').forEach(el=>el.remove());
  document.querySelectorAll('#accessMemberBody .detailItem').forEach(el=>{
   const label=(el.querySelector('small')?.textContent||'').trim().toUpperCase();
   if(label==='USERNAME')el.remove();
  });
  document.querySelectorAll('#accessMemberBody button').forEach(el=>{
   if(/username/i.test(el.textContent||''))el.remove();
  });
  document.querySelectorAll('[data-access-change-user],[data-access-copy-user]').forEach(el=>el.remove());
 };
 clean();
 const obs=new MutationObserver(()=>clean());
 obs.observe(document.body,{subtree:true,childList:true});
}

async function boot(){
 syncState();
 if(!MODULE)return;
 const t=getToken();
 if(!t){location.replace('staff-workspaces.html');return}
 try{
  const [session,access]=await Promise.all([
   rpc('transfer_staff_session',{p_token:t}),
   rpc('nexa_staff_workspace_access_v1',{p_token:t})
  ]);
  if(!session?.ok||!access?.ok){clearSession();location.replace('staff-workspaces.html');return}
  cachedModules=access.modules||session.modules||[];
  const mine=exactCurrent(cachedModules);
  if(!mine){location.replace('staff-workspaces.html');return}
  const here=new URL(location.href),target=new URL(mine.url,location.href);
  const missingWorkspace=(MODULE==='transfer'||MODULE==='ministry')&&!here.searchParams.get('workspace')&&target.searchParams.get('workspace');
  if(missingWorkspace){location.replace(target.href);return}

  installTransferIdentityFirewall();
  enforceNav();

  /* Transfer/Ministry can rebuild their legacy selector after async loading.
     Keep the global selector authoritative without touching module content. */
  const observer=new MutationObserver(()=>queueMicrotask(enforceNav));
  observer.observe(document.body,{subtree:true,childList:true});
  [250,700,1400,2600].forEach(ms=>setTimeout(enforceNav,ms));
  window.addEventListener('pageshow',()=>setTimeout(enforceNav,0));
 }catch(e){
  console.warn('NEXA shared session validation failed',e);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();