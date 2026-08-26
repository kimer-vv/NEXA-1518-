/* NEXA V47.5 — EXPLICIT HOME CARD OWNERSHIP
   2026-08-26

   COMPLETE REPLACEMENT for: nexa-v47-visual-assets.js

   Goals:
   - Preserve the official NEXA "N" symbol asset.
   - Preserve the current Home wordmark / CONTROL HUB branding.
   - Style the REAL Home wrappers directly:
       #home-svs-section
       #home-transfers-section
   - Live Event and Transfer use the same robotic / galactic family as
     NEXA Pulse / Stellar Signal.
   - Transfer uses ⇄, never the refresh-style ↻ icon.
   - Keep text to the right of the icon on iPhone/Safari.
   - Preserve Chief Gear asset resolver and the current slight planet spacing.
   - Preserve NEXA identity / alliance emblem asset globals.
   - No MutationObserver.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V475_CONTROL_HUB__) return;
window.__NEXA_V475_CONTROL_HUB__=true;

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
  const s=String(item?.slug||item?.name||'')
    .toLowerCase()
    .replace(/[^a-z]/g,'');

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
    if(t==='base'){
      return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red.png`;
    }

    if(t==='t6'){
      return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_t6.png.jpeg`;
    }

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
   VISUAL CSS
--------------------------------------------------------- */

function installCSS(){
  if($('#nexa-v475-control-hub-css')) return;

  $('#nexa-v474-control-hub-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-v475-control-hub-css';

  s.textContent=`
  /* ---------- AUTH IDENTITY ---------- */

  .nexa-auth-logo{
    background:transparent!important;
    box-shadow:none!important;
    overflow:visible!important;
  }

  .nexa-auth-logo img{
    object-fit:contain!important;
    filter:drop-shadow(0 0 12px rgba(112,105,255,.38));
  }

  /* ---------- HOME TOP IDENTITY ---------- */

  header.topbar .logo.nexa-v475-control-brand{
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    min-width:0!important;
    text-decoration:none!important;
  }

  .nexa-v475-control-symbol{
    width:34px!important;
    height:34px!important;
    flex:0 0 34px!important;
    object-fit:contain!important;
    filter:
      drop-shadow(0 0 8px rgba(101,126,255,.55))
      drop-shadow(0 0 14px rgba(175,70,255,.28));
  }

  .nexa-v475-control-copy{
    display:grid!important;
    gap:1px!important;
    min-width:0!important;
    line-height:1!important;
  }

  .nexa-v475-control-copy strong{
    color:#f6f7ff!important;
    font-size:12px!important;
    font-weight:950!important;
    letter-spacing:.17em!important;
    white-space:nowrap!important;
  }

  .nexa-v475-control-copy small{
    color:#bb6cff!important;
    font-size:8px!important;
    font-weight:950!important;
    letter-spacing:.24em!important;
    white-space:nowrap!important;
    text-shadow:0 0 10px rgba(166,79,255,.38);
  }

  /* ---------- MAIN HOME NEXA WORDMARK ---------- */

  .nexa-v475-home-wordmark-wrap{
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    margin:2px auto 12px!important;
    width:min(360px,80vw)!important;
    min-height:62px!important;
  }

  .nexa-v475-home-wordmark{
    display:block!important;
    width:min(330px,76vw)!important;
    max-height:92px!important;
    height:auto!important;
    object-fit:contain!important;
    filter:
      drop-shadow(0 0 13px rgba(114,100,255,.34))
      drop-shadow(0 0 24px rgba(178,75,255,.16));
  }

  /* ---------- ROBOTIC / GALACTIC HOME PANELS ---------- */

  .nexa-v475-tech-card{
    --tech:#9b63ff;
    position:relative!important;
    isolation:isolate!important;
    overflow:hidden!important;
    border:1px solid color-mix(in srgb,var(--tech) 63%,transparent)!important;
    border-radius:21px!important;
    background:
      radial-gradient(circle at 7% 12%,color-mix(in srgb,var(--tech) 14%,transparent),transparent 33%),
      radial-gradient(circle at 90% 75%,color-mix(in srgb,var(--tech) 9%,transparent),transparent 34%),
      linear-gradient(145deg,rgba(10,17,42,.94),rgba(3,8,24,.97))!important;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,.025),
      inset 0 0 32px color-mix(in srgb,var(--tech) 5%,transparent),
      0 0 18px color-mix(in srgb,var(--tech) 12%,transparent)!important;
  }

  .nexa-v475-tech-card:before{
    content:""!important;
    position:absolute!important;
    inset:0!important;
    z-index:-1!important;
    pointer-events:none!important;
    opacity:.32!important;
    background:
      linear-gradient(90deg,transparent 0 78%,color-mix(in srgb,var(--tech) 20%,transparent) 78% 78.4%,transparent 78.4%),
      linear-gradient(0deg,transparent 0 22%,color-mix(in srgb,var(--tech) 14%,transparent) 22% 22.4%,transparent 22.4%),
      radial-gradient(circle at 88% 26%,var(--tech) 0 1px,transparent 1.7px),
      radial-gradient(circle at 92% 49%,var(--tech) 0 1px,transparent 1.7px),
      radial-gradient(circle at 86% 72%,var(--tech) 0 1px,transparent 1.7px);
  }

  .nexa-v475-tech-card:after{
    content:""!important;
    position:absolute!important;
    left:18px!important;
    right:18px!important;
    top:0!important;
    height:1px!important;
    pointer-events:none!important;
    background:linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb,var(--tech) 82%,white),
      transparent
    )!important;
    box-shadow:0 0 11px color-mix(in srgb,var(--tech) 50%,transparent)!important;
  }

  .nexa-v475-tech-card[data-nexa-tech="live"]{--tech:#a56bff;}
  .nexa-v475-tech-card[data-nexa-tech="transfer"]{--tech:#ff9d3d;}
  .nexa-v475-tech-card[data-nexa-tech="pulse"]{--tech:#39dfff;}
  .nexa-v475-tech-card[data-nexa-tech="alliance"]{--tech:#e263ff;}

  .nexa-v475-tech-icon{
    width:48px!important;
    height:48px!important;
    display:grid!important;
    place-items:center!important;
    border-radius:15px!important;
    border:1px solid color-mix(in srgb,var(--tech) 68%,transparent)!important;
    background:
      radial-gradient(circle,color-mix(in srgb,var(--tech) 20%,transparent),rgba(5,10,28,.86))!important;
    color:color-mix(in srgb,var(--tech) 82%,white)!important;
    font-size:22px!important;
    font-weight:900!important;
    line-height:1!important;
    box-shadow:
      inset 0 0 18px color-mix(in srgb,var(--tech) 10%,transparent),
      0 0 13px color-mix(in srgb,var(--tech) 18%,transparent)!important;
  }

  .nexa-v475-tech-card h2,
  .nexa-v475-tech-card h3,
  .nexa-v475-tech-card h4{
    text-shadow:0 0 12px color-mix(in srgb,var(--tech) 17%,transparent)!important;
  }

  /* REAL legacy Home wrappers. Do not guess by inner text. */
  #home-svs-section.nexa-v475-tech-card,
  #home-transfers-section.nexa-v475-tech-card{
    box-sizing:border-box!important;
    padding-left:68px!important;
    min-height:0!important;
  }

  #home-svs-section.nexa-v475-tech-card{
    border-color:rgba(171,104,255,.78)!important;
    box-shadow:
      inset 0 0 28px rgba(119,67,255,.08),
      0 0 18px rgba(142,83,255,.16)!important;
  }

  #home-transfers-section.nexa-v475-tech-card{
    border-color:rgba(255,157,61,.72)!important;
    box-shadow:
      inset 0 0 28px rgba(255,140,45,.07),
      0 0 18px rgba(255,142,50,.13)!important;
  }

  #home-svs-section > .nexa-v475-tech-icon,
  #home-transfers-section > .nexa-v475-tech-icon{
    position:absolute!important;
    left:12px!important;
    top:50%!important;
    transform:translateY(-50%)!important;
    z-index:4!important;
    margin:0!important;
    float:none!important;
  }

  #home-transfers-section > .nexa-v475-tech-icon{
    font-size:25px!important;
    letter-spacing:-3px!important;
  }

  #home-svs-section > .head,
  #home-transfers-section > .head{
    position:relative!important;
    z-index:2!important;
    padding-left:12px!important;
    padding-right:14px!important;
  }

  #home-svs-section > .glass,
  #home-transfers-section > .glass,
  #home-transfers-section > .nexa-transfer-home-actions{
    position:relative!important;
    z-index:2!important;
    min-width:0!important;
  }

  #home-svs-section .head h2,
  #home-transfers-section .head h2{
    font-size:17px!important;
    line-height:1.12!important;
    margin:0!important;
  }

  /* Kill the older oversized decorative transfer pseudo-icon so ⇄ is unique. */
  #home-transfers-section::after{
    content:none!important;
    display:none!important;
  }

  /* Keep the empty Transfer copy inside the content lane, not under the icon. */
  #home-transfer-events:empty::before{
    left:12px!important;
    right:12px!important;
  }

  /* Generic command-card copy wrapper retained for Pulse / Stellar-style cards. */
  .nexa-v475-tech-copy{
    position:relative!important;
    z-index:2!important;
    width:100%!important;
    min-width:0!important;
  }

  /* ---------- CHIEF GEAR PLANETS ----------
     Preserve the V47.4 spacing adjustment exactly.
  */

  #nexa-profile-modal
  .v33-item[data-type="chief_gear"]
  .v33-planet{
    width:min(20.5vw,80px)!important;
    height:min(20.5vw,80px)!important;
    max-width:80px!important;
    max-height:80px!important;
  }

  #nexa-profile-modal
  .v33-item[data-type="chief_gear"]
  .v33-planet img{
    width:min(19vw,74px)!important;
    height:min(19vw,74px)!important;
    max-width:74px!important;
    max-height:74px!important;
    padding:3px!important;
    box-sizing:border-box!important;
    object-fit:contain!important;
    border-radius:50%!important;
  }

  #nexa-profile-modal
  .v33-item[data-type="chief_gear"]
  .v33-orbit-dot{
    right:-4px!important;
    top:15px!important;
  }

  @media(max-width:380px){
    #nexa-profile-modal
    .v33-item[data-type="chief_gear"]
    .v33-planet{
      width:min(21vw,78px)!important;
      height:min(21vw,78px)!important;
      max-width:78px!important;
      max-height:78px!important;
    }

    .nexa-v475-control-symbol{
      width:31px!important;
      height:31px!important;
      flex-basis:31px!important;
    }

    .nexa-v475-control-copy strong{
      font-size:11px!important;
    }

    .nexa-v475-control-copy small{
      font-size:7.5px!important;
    }

    #home-svs-section.nexa-v475-tech-card,
    #home-transfers-section.nexa-v475-tech-card{
      padding-left:64px!important;
    }

    #home-svs-section > .nexa-v475-tech-icon,
    #home-transfers-section > .nexa-v475-tech-icon{
      left:10px!important;
      width:44px!important;
      height:44px!important;
    }
  }
  `;

  document.head.appendChild(s);
}

/* ---------------------------------------------------------
   HOME BRANDING
--------------------------------------------------------- */

function installHeaderBrand(){
  const logo=$('header.topbar .logo');

  if(!logo) return;

  logo.dataset.nexaV475Brand='1';
  logo.classList.remove('nexa-v474-control-brand');
  logo.classList.add('nexa-v475-control-brand');

  logo.innerHTML=`
    <img
      class="nexa-v475-control-symbol"
      src="${IDENTITY.symbol}"
      alt=""
      aria-hidden="true"
    >
    <span class="nexa-v475-control-copy">
      <strong>CONTROL HUB</strong>
      <small>NEXA SYSTEM</small>
    </span>
  `;
}

function installHomeWordmark(){
  const candidates=$$('h1,h2,h3,[data-home-title],.home-title,.hero-title,.nexa-home-title');

  const target=candidates.find(el=>{
    if(el.closest('header.topbar')) return false;
    if(el.closest('#nexa-auth-gate')) return false;

    const text=String(el.textContent||'').trim().toUpperCase();
    return text==='NEXA';
  });

  if(!target) return;

  target.dataset.nexaV475Wordmark='1';
  target.classList.remove('nexa-v474-home-wordmark-wrap');
  target.classList.add('nexa-v475-home-wordmark-wrap');

  const existing=target.querySelector('img');
  if(
    existing &&
    existing.getAttribute('src')===IDENTITY.home &&
    existing.classList.contains('nexa-v475-home-wordmark')
  ) return;

  target.innerHTML=`
    <img
      class="nexa-v475-home-wordmark"
      src="${IDENTITY.home}"
      alt="NEXA"
    >
  `;
}

/* ---------------------------------------------------------
   HOME COMMAND CARDS
--------------------------------------------------------- */

const CARD_RULES=[
  {
    match:['SIGNALS & RESPONSE REQUESTS','SIGNALS AND RESPONSE REQUESTS'],
    type:'pulse',
    icon:'⌁'
  },
  {
    match:['NO ALLIANCE EVENT PUBLISHED'],
    type:'alliance',
    icon:'◇'
  }
];

function textKey(el){
  return String(el?.textContent||'')
    .trim()
    .replace(/\s+/g,' ')
    .toUpperCase();
}

function clearOldV474(card){
  if(!card) return;
  card.classList.remove('nexa-v474-tech-card');
  delete card.dataset.nexaTech;

  $$(':scope > .nexa-v474-tech-icon',card).forEach(x=>x.remove());
  $$('.nexa-v474-tech-copy',card).forEach(x=>x.classList.remove('nexa-v474-tech-copy'));
}

function addExplicitIcon(card,type,iconText){
  if(!card) return;

  clearOldV474(card);

  card.dataset.nexaTech=type;
  card.classList.add('nexa-v475-tech-card');

  let icon=card.querySelector(':scope > .nexa-v475-tech-icon');

  if(!icon){
    icon=document.createElement('span');
    icon.className='nexa-v475-tech-icon';
    icon.setAttribute('aria-hidden','true');
    card.prepend(icon);
  }

  icon.textContent=iconText;
}

function decorateExplicitHomeCards(){
  addExplicitIcon($('#home-svs-section'),'live','⌁');
  addExplicitIcon($('#home-transfers-section'),'transfer','⇄');
}

/* Retain the previous family styling for Pulse / alliance signal cards only.
   Live Event and Transfer are NEVER resolved heuristically anymore. */
function resolveGenericCard(heading){
  if(!heading) return null;

  let el=heading.parentElement;
  let best=null;

  for(let depth=0;el&&depth<7;depth++,el=el.parentElement){
    if(
      el===document.body ||
      el.matches?.('main,#home,#home-view,.home-view,.shell')
    ) break;

    if(
      el.closest?.('#nexa-profile-modal,#admin-modal,#nexa-auth-gate')
    ) continue;

    const txt=textKey(el);
    const rect=el.getBoundingClientRect?.();
    const visible=!rect || (rect.width>220 && rect.height>70);

    if(visible && txt.length>25 && txt.length<900){
      best=el;
      const hasBody=!!el.querySelector?.('p,small,[class*="desc"],[class*="copy"],[class*="text"]');
      if(hasBody) break;
    }
  }

  return best;
}

function decorateGenericCards(){
  const nodes=$$('h1,h2,h3,h4,strong,b');

  CARD_RULES.forEach(rule=>{
    const heading=nodes.find(el=>{
      if(el.closest('#nexa-profile-modal,#admin-modal,#nexa-auth-gate')) return false;
      return rule.match.includes(textKey(el));
    });

    if(!heading) return;

    const card=resolveGenericCard(heading);
    if(!card) return;

    clearOldV474(card);

    card.dataset.nexaTech=rule.type;
    card.classList.add('nexa-v475-tech-card');

    let icon=card.querySelector(':scope > .nexa-v475-tech-icon');
    if(!icon){
      icon=document.createElement('span');
      icon.className='nexa-v475-tech-icon';
      icon.setAttribute('aria-hidden','true');
      card.prepend(icon);
    }
    icon.textContent=rule.icon;

    const copy=heading.parentElement;
    if(copy && copy!==card){
      copy.classList.add('nexa-v475-tech-copy');
    }
  });
}

/* ---------------------------------------------------------
   EXISTING IDENTITY HOOKS
--------------------------------------------------------- */

function applyIdentityHooks(){
  const authLogo=$('.nexa-auth-logo img');

  if(authLogo&&authLogo.getAttribute('src')!==IDENTITY.appIcon){
    authLogo.src=IDENTITY.appIcon;
  }

  $$('[data-nexa-identity]').forEach(img=>{
    const key=img.dataset.nexaIdentity;
    if(IDENTITY[key]){
      img.src=IDENTITY[key];
    }
  });

  $$('[data-alliance-emblem-index]').forEach(img=>{
    const i=Number(img.dataset.allianceEmblemIndex);

    if(Number.isInteger(i)&&ALLIANCE_EMBLEMS[i]){
      img.src=ALLIANCE_EMBLEMS[i];
    }
  });
}

/* ---------------------------------------------------------
   SAFE RE-APPLY
--------------------------------------------------------- */

function applyVisuals(){
  installCSS();
  applyIdentityHooks();
  installHeaderBrand();
  installHomeWordmark();
  decorateExplicitHomeCards();
  decorateGenericCards();
}

function delayedRefresh(){
  applyVisuals();

  [120,350,800].forEach(ms=>{
    setTimeout(applyVisuals,ms);
  });
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

document.addEventListener(
  'click',
  e=>{
    if(e.target.closest?.(
      '#nexa-home-menu-toggle,'+
      '[data-close-nexa-profile],'+
      '#nexa-profile-launcher,'+
      '[data-nexa-profile]'
    )){
      setTimeout(applyVisuals,0);
      setTimeout(applyVisuals,220);
    }
  },
  true
);

})();
