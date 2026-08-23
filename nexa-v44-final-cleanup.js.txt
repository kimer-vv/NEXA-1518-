/* NEXA V44 — FINAL ROOT CLEANUP
   Scope: Transfer compact sizing, Profile V31 ownership, Ministry SVG, fresh Troop V25.
   My Alliance is intentionally untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_V44_FINAL__) return;
window.__NEXA_V44_FINAL__=true;

const $=(s,r=document)=>r.querySelector(s);

function css(){
 if(document.getElementById('nexa-v44-css')) return;
 const s=document.createElement('style');
 s.id='nexa-v44-css';
 s.textContent=`
   /* TRANSFER: exact compact card rhythm used by the neighboring Home cards. */
   body #nexa-v430-transfer-card{
     width:100%!important;max-width:100%!important;min-width:0!important;
     min-height:0!important;height:auto!important;max-height:none!important;aspect-ratio:auto!important;
     margin:0!important;padding:12px 14px!important;border-radius:18px!important;box-sizing:border-box!important;
   }
   body #nexa-v430-transfer-card .kicker{
     margin:0 0 4px!important;padding:0!important;font-size:8px!important;
     line-height:1.2!important;letter-spacing:.17em!important;font-weight:950!important;
   }
   body #nexa-v430-transfer-card h1,
   body #nexa-v430-transfer-card h2,
   body #nexa-v430-transfer-card h3,
   body #nexa-v430-transfer-card h4{
     margin:0 0 3px!important;padding:0!important;font-size:15px!important;
     line-height:1.12!important;letter-spacing:0!important;font-weight:900!important;
   }
   body #nexa-v430-transfer-card p{
     margin:0!important;padding:0!important;font-size:10px!important;line-height:1.38!important;
     color:#adb7cf!important;letter-spacing:0!important;
   }
   body #nexa-v430-transfer-card .nexa-v430-actions{margin-top:8px!important;gap:7px!important}
   body #nexa-v430-transfer-card .nexa-v430-actions a{min-height:30px!important;padding:6px 11px!important;font-size:10px!important}

   /* Kill every known legacy Profile content surface. V31 is the only visible owner. */
   #nexa-profile-modal #nexa-p29-shell,
   #nexa-profile-modal #nexa-player-gen-rail,
   #nexa-profile-modal #nexa-pl-owned-root,
   #nexa-profile-modal #nexa-profile-content,
   #nexa-profile-modal .nexa-profile-content{display:none!important}

   #nexa-v425-ministry{font-size:0!important;overflow:hidden!important}
   #nexa-v425-ministry svg{display:block!important;width:19px!important;height:19px!important}
 `;
 document.head.appendChild(s);
}

function ministry(){
 const b=document.getElementById('nexa-v425-ministry');
 if(!b) return;
 b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8.5h12v10H6zM8 5v3.5M16 5v3.5M8.5 12h3v3h-3zM12.5 12h3v3h-3zM7 8.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 b.setAttribute('aria-label','Ministry Schedule');
}

function loadFresh(id,src){
 const old=document.getElementById(id);
 if(old) return;
 const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.head.appendChild(s);
}

function boot(){
 css();
 /* These unique URLs are the cache cutover. */
 loadFresh('nexa-v44-troops','nexa-troop-assets-v25.js?v=25-20260823');
 loadFresh('nexa-v44-profile','nexa-profile-owner-v31.js?v=31-20260823');
 ministry();
 [150,450,900,1600,3000].forEach(ms=>setTimeout(()=>{css();ministry();},ms));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('pageshow',()=>setTimeout(boot,80));
})();
