/* NEXA V47.13 — HOME CARD OWNER / INLINE ACCENTS + LEGACY V45.3 NEUTRALIZED
   COMPLETE REPLACEMENT for: nexa-v47-visual-assets.js

   Owns:
   - NEXA identity / Home branding
   - Home command-card visual family
   - no decorative card icons; border glow is the visual cue
   - real DOM top glow + left signal line on all 4 Home cards
   - inline-important palette lock so legacy ID rules cannot recolor borders
   - removes Transfer pseudo-element conflict from legacy index CSS
   - soft blinking/pulsing signal only when a card has active information
   - Chief Gear asset resolver
   - Alliance emblem asset globals

   Preserves:
   - Stellar Signal
   - player portrait
   - Home menu
   - robot / drone systems owned elsewhere

   No MutationObserver.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4713_CONTROL_HUB__) return;
window.__NEXA_V4713_CONTROL_HUB__=true;

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
    progress.gear_quality||progress.quality||progress.rarity||progress.color||'green'
  );
  const t=validTierForQuality(
    q,
    normalizeTier(progress.gear_tier||progress.current_tier||progress.tier||'base')
  );

  if(q==='red'){
    if(t==='base') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red.png`;
    if(t==='t6') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_t6.png.jpeg`;
    return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_${t}.png`;
  }

  if(t==='base') return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}.png`;
  return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}_${t}.png`;
}

window.NEXA_CHIEF_GEAR_ASSETS={
  get:gearAsset,
  qualityOptions:TIER_OPTIONS
};

/* ---------------------------------------------------------
   CSS
--------------------------------------------------------- */

function installCSS(){
  $('#nexa-v475-control-hub-css')?.remove();
  $('#nexa-v477-control-hub-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-v477-control-hub-css';
  s.textContent=`
  .nexa-auth-logo{
    background:transparent!important;
    box-shadow:none!important;
    overflow:visible!important
  }
  .nexa-auth-logo img{
    object-fit:contain!important;
    filter:drop-shadow(0 0 12px rgba(112,105,255,.38))
  }

  header.topbar .logo.nexa-v477-control-brand{
    display:flex!important;align-items:center!important;gap:10px!important;
    min-width:0!important;text-decoration:none!important
  }
  .nexa-v477-control-symbol{
    width:34px!important;height:34px!important;flex:0 0 34px!important;object-fit:contain!important;
    filter:drop-shadow(0 0 8px rgba(101,126,255,.55)) drop-shadow(0 0 14px rgba(175,70,255,.28))
  }
  .nexa-v477-control-copy{display:grid!important;gap:1px!important;min-width:0!important;line-height:1!important}
  .nexa-v477-control-copy strong{
    color:#f6f7ff!important;font-size:12px!important;font-weight:950!important;
    letter-spacing:.17em!important;white-space:nowrap!important
  }
  .nexa-v477-control-copy small{
    color:#bb6cff!important;font-size:8px!important;font-weight:950!important;
    letter-spacing:.24em!important;white-space:nowrap!important;text-shadow:0 0 10px rgba(166,79,255,.38)
  }

  .nexa-v477-home-wordmark-wrap{
    display:flex!important;align-items:center!important;justify-content:center!important;
    margin:2px auto 12px!important;width:min(360px,80vw)!important;min-height:62px!important
  }
  .nexa-v477-home-wordmark{
    display:block!important;width:min(330px,76vw)!important;max-height:92px!important;
    height:auto!important;object-fit:contain!important;
    filter:drop-shadow(0 0 13px rgba(114,100,255,.34)) drop-shadow(0 0 24px rgba(178,75,255,.16))
  }

  /* UNIFIED HOME CARD FAMILY — no icons, glow is the visual cue */
  .nexa-v477-tech-card{
    --tech:#9b63ff;
    --tech-rgb:155,99,255;
    position:relative!important;
    isolation:isolate!important;
    overflow:hidden!important;
    box-sizing:border-box!important;
    border:1px solid rgba(var(--tech-rgb),.54)!important;
    border-radius:20px!important;
    padding-left:16px!important;
    background:
      linear-gradient(90deg,rgba(var(--tech-rgb),.12),rgba(var(--tech-rgb),0) 14px),
      radial-gradient(circle at 24px 0px,rgba(255,255,255,.16),transparent 42px),
      radial-gradient(circle at 8% 12%,rgba(var(--tech-rgb),.10),transparent 34%),
      radial-gradient(circle at 91% 76%,rgba(var(--tech-rgb),.06),transparent 37%),
      linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))!important;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,.018),
      inset 0 1px 0 rgba(var(--tech-rgb),.16),
      inset 0 0 28px rgba(var(--tech-rgb),.035),
      0 0 14px rgba(var(--tech-rgb),.10)!important
  }

  .nexa-v477-tech-card[data-nexa-tech="live"]{--tech:#ff4fc8;--tech-rgb:255,79,200}
  .nexa-v477-tech-card[data-nexa-tech="transfer"]{--tech:#ff9d3d;--tech-rgb:255,157,61}
  .nexa-v477-tech-card[data-nexa-tech="pulse"]{--tech:#39dfff;--tech-rgb:57,223,255}
  .nexa-v477-tech-card[data-nexa-tech="alliance"]{--tech:#a76cff;--tech-rgb:167,108,255}

  /*
    V47.13: V44/V45.3 used .nexa-v453-home-card on both outer and inner Home nodes.
    That second visual owner is why Transfer kept its old long orange line while Live lost
    its line. V47 is now the only Home-card visual owner.
  */
  #home .nexa-v453-home-card::before,
  #home .nexa-v453-home-card::after{
    content:none!important;
    display:none!important
  }
  #home .nexa-v453-home-card{
    --nexa-tech:transparent!important
  }
  #home .nexa-v477-tech-card .nexa-v453-home-card{
    border:0!important;
    background:transparent!important;
    box-shadow:none!important
  }

  /* Old DOM accent spans are intentionally hidden. V47.13 paints the two accents
     directly into the card background so Safari cannot lose them behind inner cards. */
  .nexa-v4711-left-accent,
  .nexa-v4711-top-accent{display:none!important}

  /*
    V47.11 accent ownership:
    actual child elements, NOT ::before/::after.
    Transfer had legacy ID-level pseudo CSS in index.html, so pseudo ownership was unreliable.
    All four cards now use the exact same DOM accents.
  */
  .nexa-v4711-left-accent,
  .nexa-v4711-top-accent{
    position:absolute!important;
    z-index:8!important;
    pointer-events:none!important;
    display:block!important
  }

  .nexa-v4711-left-accent{
    left:-1px!important;
    top:18px!important;
    width:3px!important;
    height:40px!important;
    border-radius:0 999px 999px 0!important;
    background:linear-gradient(
      180deg,
      transparent 0%,
      rgba(var(--tech-rgb),.45) 12%,
      rgba(var(--tech-rgb),1) 42%,
      #fff 50%,
      rgba(var(--tech-rgb),1) 58%,
      rgba(var(--tech-rgb),.45) 88%,
      transparent 100%
    )!important;
    box-shadow:
      0 0 5px rgba(var(--tech-rgb),.92),
      0 0 12px rgba(var(--tech-rgb),.54)!important;
    opacity:.98!important
  }

  .nexa-v4711-top-accent{
    left:18px!important;
    top:-1px!important;
    width:42px!important;
    height:2px!important;
    border-radius:999px!important;
    background:linear-gradient(
      90deg,
      transparent,
      rgba(var(--tech-rgb),.40),
      rgba(var(--tech-rgb),1),
      #fff,
      rgba(var(--tech-rgb),1),
      rgba(var(--tech-rgb),.40),
      transparent
    )!important;
    box-shadow:
      0 0 5px rgba(var(--tech-rgb),.95),
      0 0 12px rgba(var(--tech-rgb),.58),
      0 0 22px rgba(var(--tech-rgb),.20)!important;
    opacity:1!important
  }

  /* Disable legacy Home-card pseudo decoration. Actual accents above own the visuals. */
  #home-svs-section::before,
  #home-svs-section::after,
  #home-transfers-section::before,
  #home-transfers-section::after,
  #nexa-v302-pulse::before,
  #nexa-v302-pulse::after,
  #nexa-v31-alliance::before,
  #nexa-v31-alliance::after{
    content:none!important;
    display:none!important
  }

  /* Active information = signal breath/blink. Nothing active stays completely static. */
  .nexa-v477-tech-card[data-nexa-active="1"]{
    border-color:rgba(var(--tech-rgb),.90)!important;
    animation:nexaV479ActiveCardPulse 1.85s ease-in-out infinite!important
  }
  .nexa-v477-tech-card[data-nexa-active="1"] > .nexa-v4711-left-accent,
  .nexa-v477-tech-card[data-nexa-active="1"] > .nexa-v4711-top-accent{
    animation:nexaV479SignalBlink 1.85s ease-in-out infinite!important
  }

  @keyframes nexaV479ActiveCardPulse{
    0%,100%{
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.018),
        inset 0 0 30px rgba(var(--tech-rgb),.06),
        0 0 13px rgba(var(--tech-rgb),.16)!important
    }
    50%{
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.025),
        inset 0 0 38px rgba(var(--tech-rgb),.13),
        0 0 28px rgba(var(--tech-rgb),.38)!important
    }
  }

  @keyframes nexaV479SignalBlink{
    0%,100%{
      opacity:.66!important;
      filter:brightness(.92)!important
    }
    50%{
      opacity:1!important;
      filter:brightness(1.45)!important
    }
  }

  .nexa-v477-tech-copy,
  .nexa-v477-tech-card > .head,
  .nexa-v477-tech-card > .glass,
  .nexa-v477-tech-card > .nexa-transfer-home-actions{
    position:relative!important;
    z-index:3!important;
    min-width:0!important
  }

  .nexa-v477-tech-card h2,
  .nexa-v477-tech-card h3,
  .nexa-v477-tech-card h4{
    text-shadow:0 0 11px rgba(var(--tech-rgb),.16)!important
  }

  /* Remove old icon elements. Pseudo-elements are reserved only for the two signal accents above. */
  .nexa-v477-tech-card > .nexa-v477-card-icon,
  .nexa-v477-tech-card > .nexa-v475-tech-icon,
  .nexa-v477-tech-card > .nexa-v474-tech-icon{
    display:none!important
  }

  @media (prefers-reduced-motion: reduce){
    .nexa-v477-tech-card[data-nexa-active="1"],
    .nexa-v477-tech-card[data-nexa-active="1"] > .nexa-v4711-left-accent,
    .nexa-v477-tech-card[data-nexa-active="1"] > .nexa-v4711-top-accent{
      animation:none!important
    }
  }

  /* Preserve Chief Gear presentation */
  #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet{
    width:min(20.5vw,80px)!important;height:min(20.5vw,80px)!important;
    max-width:80px!important;max-height:80px!important
  }
  #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet img{
    width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;
    padding:0!important;box-sizing:border-box!important;object-fit:contain!important;border-radius:50%!important
  }
  #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-orbit-dot{
    right:-4px!important;top:15px!important
  }

  @media(max-width:380px){
    .nexa-v477-control-symbol{width:31px!important;height:31px!important;flex-basis:31px!important}
    .nexa-v477-control-copy strong{font-size:11px!important}
    .nexa-v477-control-copy small{font-size:7.5px!important}
    .nexa-v477-tech-card{padding-left:14px!important}
    #nexa-profile-modal .v33-item[data-type="chief_gear"] .v33-planet{
      width:min(21vw,78px)!important;height:min(21vw,78px)!important;max-width:78px!important;max-height:78px!important
    }
  }

  @media(prefers-reduced-motion:reduce){
    .nexa-v477-tech-card[data-nexa-active="1"],
    .nexa-v4711-left-accent,
    .nexa-v4711-top-accent{
      animation:none!important
    }
  }`;

  document.head.appendChild(s);
}

/* ---------------------------------------------------------
   BRANDING
--------------------------------------------------------- */

function installHeaderBrand(){
  const logo=$('header.topbar .logo');
  if(!logo)return;

  logo.classList.remove('nexa-v474-control-brand','nexa-v475-control-brand');
  logo.classList.add('nexa-v477-control-brand');

  logo.innerHTML=`
    <img class="nexa-v477-control-symbol" src="${IDENTITY.symbol}" alt="" aria-hidden="true">
    <span class="nexa-v477-control-copy">
      <strong>CONTROL HUB</strong>
      <small>NEXA SYSTEM</small>
    </span>`;
}

function installHomeWordmark(){
  const candidates=$$('h1,h2,h3,[data-home-title],.home-title,.hero-title,.nexa-home-title');
  const target=candidates.find(el=>{
    if(el.closest('header.topbar,#nexa-auth-gate'))return false;
    return String(el.textContent||'').trim().toUpperCase()==='NEXA';
  });
  if(!target)return;

  target.classList.remove('nexa-v474-home-wordmark-wrap','nexa-v475-home-wordmark-wrap');
  target.classList.add('nexa-v477-home-wordmark-wrap');

  const img=$('img',target);
  if(img&&img.src.includes('NEXA_05_Home_Wordmark.png')){
    img.className='nexa-v477-home-wordmark';
    return;
  }

  target.innerHTML=`<img class="nexa-v477-home-wordmark" src="${IDENTITY.home}" alt="NEXA">`;
}

/* ---------------------------------------------------------
   HOME CARDS
--------------------------------------------------------- */

const RULES=[
  {type:'pulse',icon:'⌁',match:['SIGNALS & RESPONSE REQUESTS','SIGNALS AND RESPONSE REQUESTS']},
  {type:'alliance',icon:'◇',match:['NO ALLIANCE EVENT PUBLISHED','ALLIANCE SIGNAL']}
];

function textKey(el){
  return String(el?.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
}

function genericCardFromHeading(heading){
  let el=heading?.parentElement;
  let best=null;

  for(let depth=0;el&&depth<7;depth++,el=el.parentElement){
    if(el===document.body||el.matches?.('main,#home,#home-view,.home-view,.shell'))break;
    if(el.closest?.('#nexa-profile-modal,#admin-modal,#nexa-auth-gate'))continue;

    const rect=el.getBoundingClientRect?.();
    const txt=textKey(el);
    if((!rect||rect.width>220)&&txt.length>20&&txt.length<1000){
      best=el;
      if(el.querySelector?.('p,small,[class*="desc"],[class*="copy"],[class*="text"]'))break;
    }
  }
  return best;
}

function removeOldDecor(card){
  if(!card)return;
  card.classList.remove('nexa-v474-tech-card','nexa-v475-tech-card');
  $$(':scope > .nexa-v474-tech-icon,:scope > .nexa-v475-tech-icon',card).forEach(x=>x.remove());
}

function isEmptyState(type,text){
  const t=String(text||'').toUpperCase();
  if(type==='live') return /NO\s+(LIVE|ACTIVE)\s+EVENT|NO EVENT|NOT PUBLISHED|STANDBY/.test(t);
  if(type==='transfer') return /NO\s+TRANSFER|NOT OPEN|CLOSED|NO EVENT|STANDBY/.test(t);
  if(type==='pulse') return /NO\s+(SIGNALS|REQUESTS)|STANDBY|NO ACTIVE/.test(t);
  if(type==='alliance') return /NO ALLIANCE EVENT PUBLISHED|NO ALLIANCE EVENT|STANDBY/.test(t);
  return true;
}

function ensureCardAccents(card){
  if(!card)return;
  let left=$(':scope > .nexa-v4711-left-accent',card);
  let top=$(':scope > .nexa-v4711-top-accent',card);
  if(!left){
    left=document.createElement('span');
    left.className='nexa-v4711-left-accent';
    left.setAttribute('aria-hidden','true');
    card.prepend(left);
  }
  if(!top){
    top=document.createElement('span');
    top.className='nexa-v4711-top-accent';
    top.setAttribute('aria-hidden','true');
    card.prepend(top);
  }
}


function v4713CardBackground(rgb){
  return [
    `linear-gradient(180deg,transparent 0%,rgba(${rgb},.45) 12%,rgba(${rgb},1) 42%,#fff 50%,rgba(${rgb},1) 58%,rgba(${rgb},.45) 88%,transparent 100%) 0 18px / 3px 40px no-repeat`,
    `linear-gradient(90deg,transparent,rgba(${rgb},.40),rgba(${rgb},1),#fff,rgba(${rgb},1),rgba(${rgb},.40),transparent) 18px 0 / 42px 2px no-repeat`,
    `linear-gradient(90deg,rgba(${rgb},.12),rgba(${rgb},0) 14px)`,
    `radial-gradient(circle at 24px 0px,rgba(255,255,255,.16),transparent 42px)`,
    `radial-gradient(circle at 8% 12%,rgba(${rgb},.10),transparent 34%)`,
    `radial-gradient(circle at 91% 76%,rgba(${rgb},.06),transparent 37%)`,
    `linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))`
  ].join(',');
}

function neutralizeV453(card){
  if(!card)return;
  const old=['nexa-v453-home-card','nexa-v453-live','nexa-v453-transfer','nexa-v453-pulse','nexa-v453-alliance','nexa-v453-has-info'];
  card.classList.remove(...old);
  $$('*',card).forEach(el=>{
    if(old.some(c=>el.classList?.contains(c)))el.classList.remove(...old);
  });
}

function decorateCard(card,type){
  if(!card)return;
  removeOldDecor(card);
  neutralizeV453(card);

  card.classList.add('nexa-v477-tech-card');
  card.dataset.nexaTech=type;
  ensureCardAccents(card);

  const palette={
    live:['255,79,200','#ff4fc8'],
    transfer:['255,157,61','#ff9d3d'],
    pulse:['57,223,255','#39dfff'],
    alliance:['167,108,255','#a76cff']
  }[type]||['155,99,255','#9b63ff'];

  card.style.setProperty('--tech-rgb',palette[0],'important');
  card.style.setProperty('--tech',palette[1],'important');
  card.style.setProperty('border-color',`rgba(${palette[0]},.54)`,'important');
  card.style.setProperty('background',v4713CardBackground(palette[0]),'important');
  ensureCardAccents(card);

  $$(':scope > .nexa-v477-card-icon',card).forEach(x=>x.remove());

  const txt=textKey(card);
  card.dataset.nexaActive=isEmptyState(type,txt)?'0':'1';

  const heading=$('h1,h2,h3,h4,strong,b',card);
  const copy=heading?.parentElement;
  if(copy&&copy!==card)copy.classList.add('nexa-v477-tech-copy');
}

function decorateHomeCards(){
  decorateCard($('#home-svs-section'),'live');
  decorateCard($('#home-transfers-section'),'transfer');

  const nodes=$$('h1,h2,h3,h4,strong,b');
  RULES.forEach(rule=>{
    const heading=nodes.find(el=>{
      if(el.closest('#nexa-profile-modal,#admin-modal,#nexa-auth-gate'))return false;
      const txt=textKey(el);
      return rule.match.some(m=>txt===m||txt.includes(m));
    });
    if(!heading)return;
    const card=genericCardFromHeading(heading);
    if(card)decorateCard(card,rule.type);
  });
}

/* ---------------------------------------------------------
   IDENTITY HOOKS
--------------------------------------------------------- */

function applyIdentityHooks(){
  const authLogo=$('.nexa-auth-logo img');
  if(authLogo&&authLogo.getAttribute('src')!==IDENTITY.appIcon)authLogo.src=IDENTITY.appIcon;

  $$('[data-nexa-identity]').forEach(img=>{
    const key=img.dataset.nexaIdentity;
    if(IDENTITY[key])img.src=IDENTITY[key];
  });

  $$('[data-alliance-emblem-index]').forEach(img=>{
    const i=Number(img.dataset.allianceEmblemIndex);
    if(Number.isInteger(i)&&ALLIANCE_EMBLEMS[i])img.src=ALLIANCE_EMBLEMS[i];
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
  [120,350,800,1400].forEach(ms=>setTimeout(applyVisuals,ms));
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',delayedRefresh,{once:true});
}else{
  delayedRefresh();
}

window.addEventListener('load',delayedRefresh,{once:true});
window.addEventListener('pageshow',delayedRefresh);

document.addEventListener('nexa:profile-opened',applyVisuals);

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