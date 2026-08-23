/* NEXA V44.2 — PROFILE UNSTACK CLEAN FIX
   Keeps the Transfer fix and Troop V25.
   Removes only the accidental V31/V29 overlay shells.
   Leaves the established Profile renderer visible and untouched.
   My Alliance is intentionally untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_V442_FINAL__) return;
window.__NEXA_V442_FINAL__=true;

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

   #nexa-v425-ministry{font-size:0!important;overflow:hidden!important}
   #nexa-v425-ministry svg{display:block!important;width:19px!important;height:19px!important}

   /* V44.2: only accidental second-owner shells stay hidden. */
   #nexa-profile-modal #nexa-v30-shell,
   #nexa-profile-modal #nexa-p29-shell{display:none!important}

   /* Explicitly restore the established Profile surfaces. */
   #nexa-profile-modal .nexa-profile-tabs,
   #nexa-profile-modal #nexa-profile-content,
   #nexa-profile-modal .nexa-profile-content,
   #nexa-profile-modal #nexa-player-gen-rail,
   #nexa-profile-modal #nexa-pl-owned-root{
     display:revert!important;
     visibility:visible!important;
     opacity:1!important;
   }
 `;
 document.head.appendChild(s);
}

function ministry(){
 const b=document.getElementById('nexa-v425-ministry');
 if(!b) return;
 b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8.5h12v10H6zM8 5v3.5M16 5v3.5M8.5 12h3v3h-3zM12.5 12h3v3h-3zM7 8.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 b.setAttribute('aria-label','Ministry Schedule');
}


function unstackProfile(){
 const modal=document.getElementById('nexa-profile-modal');
 if(!modal) return;

 modal.querySelector('#nexa-v30-shell')?.remove();
 modal.querySelector('#nexa-p29-shell')?.remove();
 modal.classList.remove('nexa-v30-owned','nexa-p29-owned');

 document.getElementById('nexa-profile-v30-css')?.remove();

 modal.querySelectorAll(
   '.nexa-profile-tabs,#nexa-profile-content,.nexa-profile-content,#nexa-player-gen-rail,#nexa-pl-owned-root'
 ).forEach(el=>{
   el.style.removeProperty('display');
   el.style.removeProperty('visibility');
   el.style.removeProperty('opacity');
   el.removeAttribute('aria-hidden');
 });

 if(window.__NEXA_PROFILE_OWNER__==='V31' ||
    window.__NEXA_PROFILE_OWNER__==='V30' ||
    window.__NEXA_PROFILE_OWNER__==='V29'){
   window.__NEXA_PROFILE_OWNER__='ESTABLISHED-V442';
 }
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
 ministry();
 unstackProfile();
 [120,350,750,1400,2600].forEach(ms=>setTimeout(()=>{css();ministry();unstackProfile();},ms));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{boot();unstackProfile();},80));
})();
