/* NEXA V47.33 — IDENTITY + ASSETS ONLY
   COMPLETE REPLACEMENT for: nexa-v47-visual-assets.js

   IMPORTANT:
   V47 NO LONGER OWNS HOME SIGNAL CARDS.

   Preserves:
   - NEXA identity assets
   - Alliance emblem asset globals
   - Chief Gear asset resolver
   - Auth logo identity
   - Control Hub header branding
   - Home NEXA wordmark
   - Chief Gear profile sizing

   Removed from V47 ownership:
   - Live Event card styling/render decoration
   - NEXA Pulse card styling/render decoration
   - Alliance Signal card styling/render decoration
   - Transfers card styling/render decoration
   - Home signal active-state pulse/blink ownership
   - generic heading scanning for Home cards

   The unified V49 Home Signals owner is now responsible for all four Home cards.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4733_IDENTITY_ASSETS_ONLY__) return;
window.__NEXA_V4733_IDENTITY_ASSETS_ONLY__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const IDENTITY={
  symbol:'/assets/nexa/identity/NEXA_01_N_Symbol.png',
  wordmark:'/assets/nexa/identity/NEXA_02_Main_Wordmark.png',
  appIcon:'/assets/nexa/identity/NEXA_03_App_Icon.png',
  compact:'/assets/nexa/identity/NEXA_04_Compact_Lockup.png',
  home:'/assets/nexa/identity/NEXA_05_Home_Wordmark.png'
};

const ALLIANCE_EMBLEMS=[
  '/assets/nexa/alliances/Alliance_01_Stellar_Guardians.png',
  '/assets/nexa/alliances/Alliance_02_Celestial_Legion.png',
  '/assets/nexa/alliances/Alliance_03_Obsidian_Syndicate.png',
  '/assets/nexa/alliances/Alliance_04_Nova_Empire.png',
  '/assets/nexa/alliances/Alliance_05_Eclipse_Order.png',
  '/assets/nexa/alliances/Alliance_06_Dragonis_Clan.png',
  '/assets/nexa/alliances/Alliance_07_Veridian_Covenant.png',
  '/assets/nexa/alliances/Alliance_08_Infinite_Horizon.png',
  '/assets/nexa/alliances/Alliance_09_Solar_Vanguard.png',
  '/assets/nexa/alliances/Alliance_10_Lost_Protocol.png'
];

window.NEXA_ASSETS=Object.assign(window.NEXA_ASSETS||{},{
  identity:IDENTITY,
  allianceEmblems:ALLIANCE_EMBLEMS
});

/* ---------------------------------------------------------
   CHIEF GEAR ASSET RESOLVER
--------------------------------------------------------- */

const PIECE_FILE={
  helmet:'helmet',
  watch:'watch',
  coat:'chestplate',
  pants:'pants',
  belt:'ring',
  ring:'ring',
  shortstaff:'staff'
};

const TIER_OPTIONS={
  green:['base'],
  blue:['base'],
  purple:['base','t1'],
  gold:['base','t1','t2'],
  red:['base','t1','t2','t3','t4','t5','t6']
};

function normalizeQuality(v){
  const s=String(v||'').trim().toLowerCase();
  if(s.includes('legend')||s.includes('red')) return 'red';
  if(s.includes('myth')||s.includes('gold')) return 'gold';
  if(s.includes('epic')||s.includes('purple')) return 'purple';
  if(s.includes('rare')||s.includes('blue')) return 'blue';
  return 'green';
}

function normalizeTier(v){
  const s=String(v||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!s||s==='0'||s==='base'||s==='none') return 'base';
  const m=s.match(/t?([1-6])/);
  return m?'t'+m[1]:'base';
}

function normalizeSlug(item){
  const s=String(item?.slug||item?.name||'').toLowerCase().replace(/[^a-z]/g,'');
  if(s.includes('helmet')) return 'helmet';
  if(s.includes('watch')) return 'watch';
  if(s.includes('coat')||s.includes('chest')) return 'coat';
  if(s.includes('pants')) return 'pants';
  if(s.includes('belt')||s.includes('ring')) return 'belt';
  if(s.includes('shortstaff')||s.includes('staff')) return 'shortstaff';
  return s;
}

function validTierForQuality(q,t){
  const list=TIER_OPTIONS[q]||['base'];
  return list.includes(t)?t:list[0];
}

function gearAsset(item,progress={}){
  const slug=normalizeSlug(item);
  const piece=PIECE_FILE[slug];
  if(!piece) return item?.image_url||item?.image||'';

  const q=normalizeQuality(
    progress.gear_quality||
    progress.quality||
    progress.rarity||
    progress.color||
    'green'
  );

  const t=validTierForQuality(
    q,
    normalizeTier(
      progress.gear_tier||
      progress.current_tier||
      progress.tier||
      'base'
    )
  );

  if(q==='red'){
    if(t==='base') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red.png`;
    if(t==='t6') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_t6.png.jpeg`;
    return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_${t}.png`;
  }

  if(t==='base'){
    return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}.png`;
  }

  return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}_${t}.png`;
}

window.NEXA_CHIEF_GEAR_ASSETS={
  get:gearAsset,
  qualityOptions:TIER_OPTIONS
};

/* ---------------------------------------------------------
   IDENTITY / PROFILE CSS ONLY
   NO HOME SIGNAL CARD CSS LIVES HERE ANYMORE.
--------------------------------------------------------- */

function installCSS(){
  $('#nexa-v475-control-hub-css')?.remove();
  $('#nexa-v477-control-hub-css')?.remove();
  $('#nexa-v4733-identity-assets-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-v4733-identity-assets-css';

  s.textContent=`
    .nexa-auth-logo{
      background:transparent!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    .nexa-auth-logo img{
      object-fit:contain!important;
      filter:
        drop-shadow(0 0 12px rgba(112,105,255,.38))
        drop-shadow(0 0 24px rgba(170,75,255,.14))!important;
    }

    header.topbar .logo.nexa-v477-control-brand{
      display:flex!important;
      align-items:center!important;
      gap:10px!important;
      min-width:0!important;
      text-decoration:none!important;
    }

    .nexa-v477-control-symbol{
      width:34px!important;
      height:34px!important;
      flex:0 0 34px!important;
      object-fit:contain!important;
      filter:
        drop-shadow(0 0 8px rgba(101,126,255,.55))
        drop-shadow(0 0 14px rgba(175,70,255,.28))!important;
    }

    .nexa-v477-control-copy{
      display:grid!important;
      gap:1px!important;
      min-width:0!important;
      line-height:1!important;
    }

    .nexa-v477-control-copy strong{
      color:#f6f7ff!important;
      font-size:12px!important;
      font-weight:950!important;
      letter-spacing:.17em!important;
      white-space:nowrap!important;
    }

    .nexa-v477-control-copy small{
      color:#bb6cff!important;
      font-size:8px!important;
      font-weight:950!important;
      letter-spacing:.24em!important;
      white-space:nowrap!important;
      text-shadow:0 0 10px rgba(166,79,255,.38)!important;
    }

    .nexa-v477-home-wordmark-wrap{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      margin:2px auto 12px!important;
      width:min(360px,80vw)!important;
      min-height:62px!important;
    }

    .nexa-v477-home-wordmark{
      display:block!important;
      width:min(330px,76vw)!important;
      max-height:92px!important;
      height:auto!important;
      object-fit:contain!important;
      filter:
        drop-shadow(0 0 13px rgba(114,100,255,.34))
        drop-shadow(0 0 24px rgba(178,75,255,.16))!important;
    }

    /* Preserve Chief Gear presentation. */
    #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet{
      width:min(20.5vw,80px)!important;
      height:min(20.5vw,80px)!important;
      max-width:80px!important;
      max-height:80px!important;
    }

    #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet img{
      width:100%!important;
      height:100%!important;
      max-width:none!important;
      max-height:none!important;
      padding:0!important;
      box-sizing:border-box!important;
      object-fit:contain!important;
      border-radius:50%!important;
    }

    #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-orbit-dot{
      right:-4px!important;
      top:15px!important;
    }

    @media(max-width:380px){
      .nexa-v477-control-symbol{
        width:31px!important;
        height:31px!important;
        flex-basis:31px!important;
      }

      .nexa-v477-control-copy strong{
        font-size:11px!important;
      }

      .nexa-v477-control-copy small{
        font-size:7.5px!important;
      }

      #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet{
        width:min(21vw,78px)!important;
        height:min(21vw,78px)!important;
        max-width:78px!important;
        max-height:78px!important;
      }
    }
  `;

  document.head.appendChild(s);
}

/* ---------------------------------------------------------
   BRANDING
--------------------------------------------------------- */

function installHeaderBrand(){
  const logo=$('header.topbar .logo');
  if(!logo) return;

  logo.classList.remove(
    'nexa-v474-control-brand',
    'nexa-v475-control-brand'
  );

  logo.classList.add('nexa-v477-control-brand');

  logo.innerHTML=`
    <img
      class="nexa-v477-control-symbol"
      src="${IDENTITY.symbol}"
      alt=""
      aria-hidden="true"
    >
    <span class="nexa-v477-control-copy">
      <strong>CONTROL HUB</strong>
      <small>NEXA SYSTEM</small>
    </span>
  `;
}

function installHomeWordmark(){
  const candidates=$$(
    'h1,h2,h3,[data-home-title],.home-title,.hero-title,.nexa-home-title'
  );

  const target=candidates.find(el=>{
    if(el.closest('header.topbar,#nexa-auth-gate')) return false;
    return String(el.textContent||'').trim().toUpperCase()==='NEXA';
  });

  if(!target) return;

  target.classList.remove(
    'nexa-v474-home-wordmark-wrap',
    'nexa-v475-home-wordmark-wrap'
  );

  target.classList.add('nexa-v477-home-wordmark-wrap');

  const img=$('img',target);

  if(img&&img.src.includes('NEXA_05_Home_Wordmark.png')){
    img.className='nexa-v477-home-wordmark';
    return;
  }

  target.innerHTML=`
    <img
      class="nexa-v477-home-wordmark"
      src="${IDENTITY.home}"
      alt="NEXA"
    >
  `;
}

/* ---------------------------------------------------------
   IDENTITY HOOKS
--------------------------------------------------------- */

function applyIdentityHooks(){
  const authLogo=$('.nexa-auth-logo img');

  if(
    authLogo &&
    authLogo.getAttribute('src')!==IDENTITY.appIcon
  ){
    authLogo.src=IDENTITY.appIcon;
  }

  $$('[data-nexa-identity]').forEach(img=>{
    const key=img.dataset.nexaIdentity;
    if(IDENTITY[key]) img.src=IDENTITY[key];
  });

  $$('[data-alliance-emblem-index]').forEach(img=>{
    const i=Number(img.dataset.allianceEmblemIndex);

    if(
      Number.isInteger(i) &&
      ALLIANCE_EMBLEMS[i]
    ){
      img.src=ALLIANCE_EMBLEMS[i];
    }
  });
}

/* ---------------------------------------------------------
   SAFE RE-APPLY
   NOTE: this intentionally does NOT inspect or mutate Home
   signal cards.
--------------------------------------------------------- */

function applyVisuals(){
  installCSS();
  applyIdentityHooks();
  installHeaderBrand();
  installHomeWordmark();
}

/* Keep the public hook because V49 calls it during Home boot.
   It is now identity-only and cannot repaint Pulse / Alliance /
   Live Event / Transfer. */
window.NEXA_HOME_VISUALS_REFRESH=applyVisuals;

function delayedRefresh(){
  applyVisuals();
}

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    delayedRefresh,
    {once:true}
  );
}else{
  delayedRefresh();
}

window.addEventListener(
  'load',
  delayedRefresh,
  {once:true}
);

window.addEventListener(
  'pageshow',
  delayedRefresh
);

document.addEventListener(
  'nexa:profile-opened',
  applyVisuals
);

document.addEventListener('click',e=>{
  if(e.target.closest?.(
    '#nexa-home-menu-toggle,'+
    '[data-close-nexa-profile],'+
    '#nexa-profile-launcher,'+
    '[data-nexa-profile]'
  )){
    setTimeout(applyVisuals,0);
    setTimeout(applyVisuals,220);
  }
},true);

})();
