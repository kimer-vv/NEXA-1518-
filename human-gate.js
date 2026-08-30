/* NEXA HUMAN GATE V2.3 — RUNTIME V5 CACHE BUST / ASCII STATUS TEXT */
(()=>{
'use strict';
const SITE_KEY="0x4AAAAAAEQbiQbUBfI6Fc5x";
const VERIFY_URL='/api/human-verify';
const SESSION_URL='/api/human-session';
function loadFormRuntime(){
 if(document.querySelector('script[data-nexa-form-runtime]'))return;
 const s=document.createElement('script');
 s.src='/nexa-form-runtime-v1.js?v=5';
 s.defer=true;
 s.dataset.nexaFormRuntime='1';
 document.head.appendChild(s);
}
function css(){
 if(document.getElementById('nexa-human-gate-style'))return;
 const s=document.createElement('style');s.id='nexa-human-gate-style';
 s.textContent=`#nexa-human-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;background:#090b18;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#nexa-human-gate .nh-card{width:min(440px,100%);padding:30px 24px;border-radius:24px;background:rgba(18,21,43,.96);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 80px rgba(0,0,0,.45);text-align:center;color:#fff}#nexa-human-gate h1{margin:0 0 8px;font-size:24px}#nexa-human-gate p{margin:0 0 22px;color:#c8cbe0;line-height:1.45}#nexa-human-widget{display:flex;justify-content:center;min-height:70px}#nexa-human-status{min-height:22px;margin-top:14px;font-size:14px;color:#c8cbe0}#nexa-human-gate .nh-error{color:#ffb4b4}`;
 document.head.appendChild(s);
}
function gate(){css();let el=document.getElementById('nexa-human-gate');if(el)return el;el=document.createElement('div');el.id='nexa-human-gate';el.innerHTML=`<div class="nh-card"><h1>Verify you're human</h1><p>Complete this quick verification to continue to NEXA.</p><div id="nexa-human-widget"></div><div id="nexa-human-status">Checking your session...</div></div>`;document.documentElement.appendChild(el);document.documentElement.style.overflow='hidden';return el}
function unlock(){document.getElementById('nexa-human-gate')?.remove();document.documentElement.style.overflow=''}
async function hasSession(){try{const r=await fetch(SESSION_URL,{credentials:'same-origin',cache:'no-store'});return r.ok}catch{return false}}
function loadTurnstile(){return new Promise((resolve,reject)=>{if(window.turnstile)return resolve();const existing=document.querySelector('script[data-nexa-turnstile]');if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.defer=true;s.dataset.nexaTurnstile='1';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
async function verifyToken(token,widgetId){const status=document.getElementById('nexa-human-status');if(status)status.textContent='Verifying...';try{const r=await fetch(VERIFY_URL,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({token})});const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||'Verification failed.');unlock()}catch(err){if(status){status.textContent=err.message||'Verification failed. Please try again.';status.classList.add('nh-error')}try{window.turnstile.reset(widgetId)}catch{}}}
async function start(){loadFormRuntime();gate();if(await hasSession())return unlock();const status=document.getElementById('nexa-human-status');if(status)status.textContent='';try{await loadTurnstile();let widgetId;widgetId=window.turnstile.render('#nexa-human-widget',{sitekey:SITE_KEY,theme:'auto',action:'nexa_site_access',callback:(token)=>verifyToken(token,widgetId),'error-callback':()=>{const x=document.getElementById('nexa-human-status');if(x){x.textContent='Verification could not load. Please try again.';x.classList.add('nh-error')}},'expired-callback':()=>{const x=document.getElementById('nexa-human-status');if(x)x.textContent='Verification expired. Please try again.'}})}catch{if(status){status.textContent='Verification could not load. Please refresh the page.';status.classList.add('nh-error')}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();