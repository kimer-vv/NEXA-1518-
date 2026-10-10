/* NEXA HUMAN GATE V2.8 — CONSOLIDATED ROUTING / ADMIN CLEANUP */
(()=>{
'use strict';
const SITE_KEY="0x4AAAAAAEQbiQbUBfI6Fc5x";
const VERIFY_URL='/api/human-verify';
const SESSION_URL='/api/human-session';

function isMainNexaPage(){
  const p=String(location.pathname||'/').toLowerCase();
  return p==='/'||p.endsWith('/index.html');
}

function loadFormRuntime(){
 if(document.querySelector('script[data-nexa-form-runtime]'))return;
 const s=document.createElement('script');
 s.src='/nexa-form-runtime-v1.js?v=8';
 s.defer=true;
 s.dataset.nexaFormRuntime='1';
 document.head.appendChild(s);
}

function cleanupNormalAdmin(){
 if(!isMainNexaPage())return;

 document.querySelectorAll('#admin-system').forEach(el=>{
   el.classList.add('hidden');
   el.setAttribute('aria-hidden','true');
   el.style.display='none';
 });

 document.querySelectorAll('button,a,[role="button"]').forEach(el=>{
   const t=String(el.textContent||'').trim().replace(/\s+/g,' ');
   if(t==='System Operations'){
     el.style.display='none';
     el.setAttribute('aria-hidden','true');
     el.tabIndex=-1;
   }
 });

 document.querySelectorAll('.system-ops-card').forEach(card=>{
   const title=card.querySelector('b')?.textContent?.trim()||'';
   if(title==='Testing / Sandbox')card.remove();
 });

 const labels=new Map([
   ['Battle Strategist','Battle Strategy'],
   ['Event Operator','Battle Planning'],
   ['Scheduler','Ministry Scheduler'],
   ['Transfer Coordinator','Transfer']
 ]);
 document.querySelectorAll('span,b,strong,small,p,div,label,option,button').forEach(el=>{
   if(el.children.length)return;
   const raw=String(el.textContent||'').trim();
   if(labels.has(raw))el.textContent=labels.get(raw);
 });
}

function supabaseClient(){
 try{
   if(window.supabaseClient?.rpc)return window.supabaseClient;
   if(window.nexaAccountDataClient?.rpc)return window.nexaAccountDataClient;
   if(window.sb?.rpc)return window.sb;
   if(window.supabase?.createClient){
     window.__NEXA_HG_SB__ ||= window.supabase.createClient(
       'https://dfxcxboxrkfmrnsgpyin.supabase.co',
       'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
     );
     return window.__NEXA_HG_SB__;
   }
 }catch{}
 return null;
}

let switchingAccount=false;
async function selectFleetAccount(accountId){
 if(switchingAccount||!accountId)return;
 switchingAccount=true;
 try{
   const c=supabaseClient();
   if(!c?.rpc)throw new Error('NEXA account service is not ready.');

   const {data:fleet,error:fleetError}=await c.rpc('nexa_my_fleet_v1');
   if(fleetError)throw fleetError;
   if(!fleet?.ok)throw new Error(fleet?.error||'Unable to load NEXA Fleet.');

   const account=(fleet.accounts||[]).find(a=>String(a.account_id)===String(accountId));
   if(!account)throw new Error('Account not found.');

   const {data:marked,error:markError}=await c.rpc('nexa_mark_active_account_v1',{p_player_account_id:accountId});
   if(markError)throw markError;
   if(marked?.ok===false)throw new Error(marked.error||'Unable to activate account.');

   const state=Number(account.state_number||0);
   window.NEXA_ACTIVE_ACCOUNT_ID=String(accountId);
   window.NEXA_ACTIVE_STATE=state;
   try{
     localStorage.setItem('nexa_active_account_v49',String(accountId));
     localStorage.setItem('nexa_active_state_v49',String(state));
     localStorage.setItem('nexa_active_state',String(state));
   }catch{}

   ['nexa-profile-modal','nexa-account-constellation','accounts-modal','nexa-fleet-identity-modal'].forEach(id=>{
     const el=document.getElementById(id);
     if(!el)return;
     el.classList.remove('open');
     el.setAttribute('aria-hidden','true');
   });

   location.replace('/index.html');
 }catch(err){
   console.error('[NEXA Fleet switch]',err);
   switchingAccount=false;
 }
}

function installFleetRoutingFix(){
 if(!isMainNexaPage()||window.__NEXA_FLEET_ROUTING_FIX_V1__)return;
 window.__NEXA_FLEET_ROUTING_FIX_V1__=true;

 document.addEventListener('click',e=>{
   const root=null; // Constellation profile clicks must not activate Fleet accounts.
   if(root){
     const account=e.target.closest?.('[data-nexa-profile],[data-account-constellation-id]');
     if(account){
       const id=account.dataset.nexaProfile||account.dataset.accountConstellationId;
       if(id){
         e.preventDefault();
         e.stopPropagation();
         e.stopImmediatePropagation();
         selectFleetAccount(id);
         return;
       }
     }
   }

   const close=e.target.closest?.(
     '#nexa-profile-modal .nexa-profile-close,'+
     '#nexa-profile-modal [data-profile-close],'+
     '#nexa-profile-modal [data-nexa-profile-close]'
   );
   if(close){
     e.preventDefault();
     e.stopPropagation();
     e.stopImmediatePropagation();
     const profile=document.getElementById('nexa-profile-modal');
     if(profile){
       profile.classList.remove('open');
       profile.setAttribute('aria-hidden','true');
     }
     const constellation=document.getElementById('nexa-account-constellation');
     if(constellation){
       constellation.classList.remove('open');
       constellation.setAttribute('aria-hidden','true');
     }
   }
 },true);
}

function css(){
 if(document.getElementById('nexa-human-gate-style'))return;
 const s=document.createElement('style');s.id='nexa-human-gate-style';
 s.textContent=`#nexa-human-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:#090b18;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#nexa-human-gate .nh-card{width:min(440px,100%);padding:30px 24px;border-radius:24px;background:rgba(18,21,43,.96);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 80px rgba(0,0,0,.45);text-align:center;color:#fff}#nexa-human-gate h1{margin:0 0 8px;font-size:24px}#nexa-human-gate p{margin:0 0 22px;color:#c8cbe0;line-height:1.45}#nexa-human-widget{display:flex;justify-content:center;min-height:70px}#nexa-human-status{min-height:22px;margin-top:14px;font-size:14px;color:#c8cbe0}#nexa-human-gate .nh-error{color:#ffb4b4}`;
 document.head.appendChild(s);
}

function gate(){
 css();
 let el=document.getElementById('nexa-human-gate');
 if(el)return el;
 el=document.createElement('div');
 el.id='nexa-human-gate';
 el.innerHTML=`<div class="nh-card"><h1>Verify you're human</h1><p>Complete this quick verification to continue to NEXA.</p><div id="nexa-human-widget"></div><div id="nexa-human-status">Checking your session...</div></div>`;
 document.documentElement.appendChild(el);
 document.documentElement.style.overflow='hidden';
 return el;
}

function unlock(){
 document.getElementById('nexa-human-gate')?.remove();
 document.documentElement.style.overflow='';
 cleanupNormalAdmin();
 installFleetRoutingFix();
}

async function hasSession(){
 try{const r=await fetch(SESSION_URL,{credentials:'same-origin',cache:'no-store'});return r.ok}catch{return false}
}

function loadTurnstile(){
 return new Promise((resolve,reject)=>{
   if(window.turnstile)return resolve();
   const existing=document.querySelector('script[data-nexa-turnstile]');
   if(existing){
     existing.addEventListener('load',resolve,{once:true});
     existing.addEventListener('error',reject,{once:true});
     return;
   }
   const s=document.createElement('script');
   s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   s.async=true;s.defer=true;s.dataset.nexaTurnstile='1';
   s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
 });
}

async function verifyToken(token,widgetId){
 const status=document.getElementById('nexa-human-status');
 if(status)status.textContent='Verifying...';
 try{
   const r=await fetch(VERIFY_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({token})});
   const body=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(body.error||'Verification failed.');
   unlock();
 }catch(err){
   if(status){status.textContent=err.message||'Verification failed. Please try again.';status.classList.add('nh-error')}
   try{window.turnstile.reset(widgetId)}catch{}
 }
}

function startObserver(){
 if(!isMainNexaPage())return;
 const observer=new MutationObserver(()=>cleanupNormalAdmin());
 observer.observe(document.documentElement,{subtree:true,childList:true});
}

async function start(){
 loadFormRuntime();
 cleanupNormalAdmin();
 installFleetRoutingFix();
 startObserver();
 gate();
 if(await hasSession())return unlock();
 const status=document.getElementById('nexa-human-status');
 if(status)status.textContent='';
 try{
   await loadTurnstile();
   let widgetId;
   widgetId=window.turnstile.render('#nexa-human-widget',{
     sitekey:SITE_KEY,theme:'auto',action:'nexa_site_access',
     callback:(token)=>verifyToken(token,widgetId),
     'error-callback':()=>{const x=document.getElementById('nexa-human-status');if(x){x.textContent='Verification could not load. Please try again.';x.classList.add('nh-error')}},
     'expired-callback':()=>{const x=document.getElementById('nexa-human-status');if(x)x.textContent='Verification expired. Please try again.'}
   });
 }catch{
   if(status){status.textContent='Verification could not load. Please refresh the page.';status.classList.add('nh-error')}
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
