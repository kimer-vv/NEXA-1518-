/* NEXA V47.2 — CONTROL HUB VISUAL SYSTEM
   2026-08-26

   COMPLETE REPLACEMENT for: nexa-v47-visual-assets.js

   Goals:
   - Preserve the official NEXA "N" symbol asset.
   - Home header: N symbol + CONTROL HUB.
   - Move the NEXA Home wordmark into the main Home identity area.
   - Give Home cards a cleaner robotic / galactic command-panel skin.
   - Keep existing Home content and behavior intact.
   - Chief Gear: slightly larger planet while keeping the artwork itself
     at its previous visual size, giving T1/T2/etc. extra breathing room.
   - Preserve NEXA identity / alliance emblem asset globals.
   - Preserve Chief Gear asset resolver for other modules.
   - No MutationObserver.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V472_CONTROL_HUB__) return;
window.__NEXA_V472_CONTROL_HUB__=true;

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
  if($('#nexa-v472-control-hub-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v472-control-hub-css';

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

  header.topbar .logo.nexa-v472-control-brand{
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    min-width:0!important;
    text-decoration:none!important;
  }

  .nexa-v472-control-symbol{
    width:34px!important;
    height:34px!important;
    flex:0 0 34px!important;
    object-fit:contain!important;
    filter:
      drop-shadow(0 0 8px rgba(101,126,255,.55))
      drop-shadow(0 0 14px rgba(175,70,255,.28));
  }

  .nexa-v472-control-copy{
    display:grid!important;
    gap:1px!important;
    min-width:0!important;
    line-height:1!important;
  }

  .nexa-v472-control-copy strong{
    color:#f6f7ff!important;
    font-size:12px!important;
    font-weight:950!important;
    letter-spacing:.17em!important;
    white-space:nowrap!important;
  }

  .nexa-v472-control-copy small{
    color:#bb6cff!important;
    font-size:8px!important;
    font-weight:950!important;
    letter-spacing:.24em!important;
    white-space:nowrap!important;
    text-shadow:0 0 10px rgba(166,79,255,.38);
  }

  /* ---------- MAIN HOME NEXA WORDMARK ---------- */

  .nexa-v472-home-wordmark-wrap{
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    margin:2px auto 12px!important;
    width:min(360px,80vw)!important;
    min-height:62px!important;
  }

  .nexa-v472-home-wordmark{
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

  .nexa-v472-tech-card{
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

  .nexa-v472-tech-card:before{
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

  .nexa-v472-tech-card:after{
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

  .nexa-v472-tech-card[data-nexa-tech="live"]{--tech:#a56bff;}
  .nexa-v472-tech-card[data-nexa-tech="transfer"]{--tech:#ff9d3d;}
  .nexa-v472-tech-card[data-nexa-tech="pulse"]{--tech:#39dfff;}
  .nexa-v472-tech-card[data-nexa-tech="alliance"]{--tech:#e263ff;}

  .nexa-v472-tech-icon{
    float:left!important;
    width:48px!important;
    height:48px!important;
    margin:0 12px 8px 0!important;
    display:grid!important;
    place-items:center!important;
    border-radius:15px!important;
    border:1px solid color-mix(in srgb,var(--tech) 68%,transparent)!important;
    background:
      radial-gradient(circle,color-mix(in srgb,var(--tech) 20%,transparent),rgba(5,10,28,.86))!important;
    color:color-mix(in srgb,var(--tech) 82%,white)!important;
    font-size:22px!important;
    font-weight:900!important;
    box-shadow:
      inset 0 0 18px color-mix(in srgb,var(--tech) 10%,transparent),
      0 0 13px color-mix(in srgb,var(--tech) 18%,transparent)!important;
  }

  .nexa-v472-tech-card h2,
  .nexa-v472-tech-card h3,
  .nexa-v472-tech-card h4{
    text-shadow:0 0 12px color-mix(in srgb,var(--tech) 17%,transparent)!important;
  }

  /* ---------- CHIEF GEAR PLANETS ----------
     Planet grows from the old 74px ceiling to 80px.
     The artwork itself stays at 74px, so we create real breathing room
     around T1/T2/etc. instead of simply scaling everything up.
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

  /* Keep the orbit balanced after the +6px planet adjustment. */
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

    .nexa-v472-control-symbol{
      width:31px!important;
      height:31px!important;
      flex-basis:31px!important;
    }

    .nexa-v472-control-copy strong{
      font-size:11px!important;
    }

    .nexa-v472-control-copy small{
      font-size:7.5px!important;
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

  if(!logo||logo.dataset.nexaV472Brand==='1') return;

  logo.dataset.nexaV472Brand='1';
  logo.classList.add('nexa-v472-control-brand');

  logo.innerHTML=`
    <img
      class="nexa-v472-control-symbol"
      src="${IDENTITY.symbol}"
      alt=""
      aria-hidden="true"
    >
    <span class="nexa-v472-control-copy">
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

  if(!target||target.dataset.nexaV472Wordmark==='1') return;

  target.dataset.nexaV472Wordmark='1';
  target.classList.add('nexa-v472-home-wordmark-wrap');

  target.innerHTML=`
    <img
      class="nexa-v472-home-wordmark"
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
    match:['NO LIVE EVENT'],
    type:'live',
    icon:'⌁'
  },
  {
    match:['TRANSFER CENTER'],
    type:'transfer',
    icon:'↻'
  },
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

function closestCard(el){
  return el.closest(
    'article,section,.card,.home-card,.glass,.panel,.signal-card,.event-card,.transfer-card'
  );
}

function decorateHomeCards(){
  const nodes=$$('h1,h2,h3,h4,strong,b');

  CARD_RULES.forEach(rule=>{
    const heading=nodes.find(el=>{
      if(el.closest('#nexa-profile-modal')) return false;
      if(el.closest('#admin-modal')) return false;

      const text=String(el.textContent||'')
        .trim()
        .replace(/\s+/g,' ')
        .toUpperCase();

      return rule.match.includes(text);
    });

    if(!heading) return;

    const card=closestCard(heading);
    if(!card||card.dataset.nexaTech) return;

    card.dataset.nexaTech=rule.type;
    card.classList.add('nexa-v472-tech-card');

    const icon=document.createElement('span');
    icon.className='nexa-v472-tech-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=rule.icon;

    const firstContent=
      card.querySelector('h1,h2,h3,h4,strong,b,p,div')||
      card.firstElementChild;

    if(firstContent){
      card.insertBefore(icon,firstContent);
    }else{
      card.prepend(icon);
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
  decorateHomeCards();
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
