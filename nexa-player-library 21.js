/* NEXA Player Library loader V30 — legacy filename bridge
   Keeps the historical index.html script reference harmless while booting the clean Profile owner.
*/
(()=>{
'use strict';
window.__NEXA_PLAYER_LIBRARY_LEGACY_RETIRED__=true;

// Reserve ownership before V43.2 can inject V29. V29 exits immediately when this flag exists.
if(!window.__NEXA_PROFILE_OWNER__ || window.__NEXA_PROFILE_OWNER__==='V29'){
  window.__NEXA_PROFILE_OWNER__='V30-BOOTING';
}

function addGlobalFixes(){
  if(document.getElementById('nexa-v30-global-fixes')) return;
  const s=document.createElement('style');
  s.id='nexa-v30-global-fixes';
  s.textContent=`
    /* Transfer must use the exact compact rhythm of the other Home signal cards. */
    #nexa-v430-transfer-card{
      width:100%!important;max-width:100%!important;min-width:0!important;
      min-height:0!important;height:auto!important;max-height:none!important;
      aspect-ratio:auto!important;margin:0!important;padding:12px 14px!important;
      border-radius:18px!important;overflow:hidden!important;box-sizing:border-box!important;
    }
    #nexa-v430-transfer-card .kicker{
      margin:0 0 4px!important;padding:0!important;font-size:8px!important;
      line-height:1.2!important;letter-spacing:.17em!important;font-weight:950!important;
    }
    #nexa-v430-transfer-card h1,#nexa-v430-transfer-card h2,#nexa-v430-transfer-card h3,
    #nexa-v430-transfer-card h4,#nexa-v430-transfer-card [class*="title"]{
      margin:0 0 3px!important;padding:0!important;font-size:15px!important;
      line-height:1.12!important;letter-spacing:0!important;font-weight:900!important;
    }
    #nexa-v430-transfer-card p,#nexa-v430-transfer-card [class*="description"]{
      margin:0!important;padding:0!important;font-size:10px!important;line-height:1.38!important;
      color:#adb7cf!important;letter-spacing:0!important;
    }
    #nexa-v430-transfer-card .nexa-v430-actions{margin-top:8px!important;gap:7px!important}
    #nexa-v430-transfer-card .nexa-v430-actions a{
      min-height:30px!important;padding:6px 11px!important;font-size:10px!important;
    }

    /* V29/legacy Profile surfaces are retired. */
    #nexa-p29-shell,#nexa-player-gen-rail,#nexa-pl-owned-root{display:none!important}

    /* Ministry icon is always inline SVG; never render a missing-image square. */
    #nexa-v425-ministry{font-size:0!important;overflow:hidden!important}
    #nexa-v425-ministry svg{display:block!important;width:19px!important;height:19px!important}
  `;
  document.head.appendChild(s);
}

function repairMinistry(){
  const b=document.getElementById('nexa-v425-ministry');
  if(!b) return;
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8.5h12v10H6zM8 5v3.5M16 5v3.5M8.5 12h3v3h-3zM12.5 12h3v3h-3zM7 8.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  b.setAttribute('aria-label','Ministry Schedule');
}

function loadOwner(){
  addGlobalFixes();
  if(document.getElementById('nexa-profile-owner-v30-script')) return;
  const s=document.createElement('script');
  s.id='nexa-profile-owner-v30-script';
  s.src='nexa-profile-owner-v30.js?v=30-1';
  s.async=false;
  document.head.appendChild(s);
}

loadOwner();
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{addGlobalFixes();repairMinistry();setTimeout(repairMinistry,350);},{once:true});
}else{
  addGlobalFixes();repairMinistry();setTimeout(repairMinistry,350);
}
window.addEventListener('pageshow',()=>setTimeout(()=>{addGlobalFixes();repairMinistry();},80));
})();
