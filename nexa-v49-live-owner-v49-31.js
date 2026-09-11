/* NEXA V49.40 — UNIFIED HOME SIGNAL STACK OWNER
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   One visual owner for:
   1) Live Event
   2) NEXA Pulse
   3) Alliance Signal
   4) Transfers

   Data ownership stays where it already belongs:
   - Live Event / Transfer state: NEXA V49 State Hub
   - Published forms / Battle Plan: nexa-pulse-forms-v1.js
   - Transfer Center actions: nexa-transfer-home-v1.js

   This file owns ONLY the four Home shells, geometry, ordering and active/empty Live Event render.
   It retires duplicate legacy visual cards and keeps the IDs expected by existing data modules.

   No MutationObserver.
   No indefinite polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4940_UNIFIED_HOME_SIGNALS__) return;
window.__NEXA_V4940_UNIFIED_HOME_SIGNALS__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const STACK_ID='nexa-v4940-home-signals';
const LIVE_ID='nexa-v4940-live-event';
const PULSE_ID='nexa-v302-pulse';
const ALLIANCE_ID='nexa-v31-alliance';
const TRANSFER_ID='nexa-v49-transfer-card';

let lastLive=null;
let generation=0;

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
}

function payloadOf(live){
  return live?.live_event_payload && typeof live.live_event_payload==='object'
    ? live.live_event_payload
    : {};
}

function fmtDate(v){
  if(!v) return '';
  const d=new Date(`${v}T00:00:00Z`);
  if(Number.isNaN(d.getTime())) return clean(v);
  return new Intl.DateTimeFormat(undefined,{
    month:'short',
    day:'numeric',
    year:'numeric',
    timeZone:'UTC'
  }).format(d);
}

function installCSS(){
  if($('#nexa-v4940-home-signals-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v4940-home-signals-css';
  s.textContent=`
    #${STACK_ID}{
      grid-column:1/-1!important;
      width:100%!important;
      max-width:760px!important;
      margin:12px auto 18px!important;
      display:grid!important;
      gap:10px!important;
      box-sizing:border-box!important;
    }

    #${STACK_ID} > .nexa-v4940-card{
      position:relative!important;
      isolation:isolate!important;
      overflow:hidden!important;
      width:100%!important;
      max-width:100%!important;
      min-height:0!important;
      height:auto!important;
      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;
      border-radius:20px!important;
      border:1px solid rgba(var(--nexa-rgb),.58)!important;
      background:
        linear-gradient(90deg,rgba(var(--nexa-rgb),.10),rgba(var(--nexa-rgb),0) 14px),
        radial-gradient(circle at 22px 0,rgba(255,255,255,.12),transparent 42px),
        radial-gradient(circle at 8% 10%,rgba(var(--nexa-rgb),.08),transparent 34%),
        radial-gradient(circle at 92% 85%,rgba(var(--nexa-rgb),.045),transparent 38%),
        linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))!important;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.018),
        inset 0 1px 0 rgba(var(--nexa-rgb),.14),
        inset 0 0 27px rgba(var(--nexa-rgb),.03),
        0 0 14px rgba(var(--nexa-rgb),.10)!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    #${LIVE_ID}{--nexa-rgb:255,79,200;--nexa-accent:#ff4fc8}
    #${PULSE_ID}{--nexa-rgb:57,223,255;--nexa-accent:#39dfff}
    #${ALLIANCE_ID}{--nexa-rgb:167,108,255;--nexa-accent:#a76cff}
    #${TRANSFER_ID}{--nexa-rgb:53,255,149;--nexa-accent:#35ff95}

    #${STACK_ID} .nexa-v4940-top-accent,
    #${STACK_ID} .nexa-v4940-left-accent{
      position:absolute!important;
      z-index:8!important;
      pointer-events:none!important;
      display:block!important;
    }

    #${STACK_ID} .nexa-v4940-top-accent{
      left:18px!important;
      top:-1px!important;
      width:48px!important;
      height:2px!important;
      border-radius:999px!important;
      background:linear-gradient(
        90deg,
        transparent,
        rgba(var(--nexa-rgb),.42),
        rgba(var(--nexa-rgb),1),
        #fff,
        rgba(var(--nexa-rgb),1),
        rgba(var(--nexa-rgb),.42),
        transparent
      )!important;
      box-shadow:
        0 0 5px rgba(var(--nexa-rgb),.98),
        0 0 12px rgba(var(--nexa-rgb),.64),
        0 0 22px rgba(var(--nexa-rgb),.22)!important;
    }

    #${STACK_ID} .nexa-v4940-left-accent{
      left:-1px!important;
      top:18px!important;
      width:3px!important;
      height:40px!important;
      border-radius:0 999px 999px 0!important;
      background:linear-gradient(
        180deg,
        transparent 0%,
        rgba(var(--nexa-rgb),.45) 12%,
        rgba(var(--nexa-rgb),1) 42%,
        #fff 50%,
        rgba(var(--nexa-rgb),1) 58%,
        rgba(var(--nexa-rgb),.45) 88%,
        transparent 100%
      )!important;
      box-shadow:
        0 0 5px rgba(var(--nexa-rgb),.96),
        0 0 13px rgba(var(--nexa-rgb),.58)!important;
    }

    #${STACK_ID} .nexa-v4940-kicker{
      margin:0 0 6px!important;
      color:color-mix(in srgb,var(--nexa-accent) 78%,#fff)!important;
      font-size:.64rem!important;
      line-height:1.1!important;
      font-weight:950!important;
      letter-spacing:.16em!important;
      text-transform:uppercase!important;
    }

    #${STACK_ID} .nexa-v4940-title{
      margin:0!important;
      color:#fff!important;
      font-size:1.05rem!important;
      line-height:1.16!important;
      font-weight:950!important;
      letter-spacing:-.012em!important;
    }

    #${STACK_ID} .nexa-v4940-copy{
      margin-top:4px!important;
      color:#9aa8c3!important;
      font-size:.68rem!important;
      line-height:1.38!important;
    }

    #${STACK_ID} .nexa-v4940-content{
      min-width:0!important;
      width:100%!important;
    }

    /* Existing Pulse plugin boxes are allowed to expand this one shell. */
    #${PULSE_ID} #nexa-pulse-published-forms,
    #${PULSE_ID} #nexa-pulse-battle-plans{
      margin-top:10px!important;
    }

    #${LIVE_ID} .v4940-alliance-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:7px;
      margin-top:10px;
    }

    #${LIVE_ID} .v4940-mini{
      min-width:0;
      padding:8px 9px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      background:rgba(255,255,255,.022);
    }

    #${LIVE_ID} .v4940-mini span{
      display:block;
      margin-bottom:3px;
      color:#8290ad;
      font-size:.52rem;
      font-weight:900;
      letter-spacing:.10em;
      line-height:1.2;
    }

    #${LIVE_ID} .v4940-mini strong{
      display:block;
      color:#f4f7ff;
      font-size:.75rem;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    #${LIVE_ID} .v4940-schedule{
      display:grid;
      gap:6px;
      margin-top:10px;
    }

    #${LIVE_ID} .v4940-schedule-title{
      color:#8998b7;
      font-size:.54rem;
      font-weight:950;
      letter-spacing:.12em;
      margin-bottom:1px;
    }

    #${LIVE_ID} .v4940-row{
      display:grid;
      grid-template-columns:100px minmax(0,1fr);
      gap:9px;
      align-items:start;
      padding:8px 9px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.022);
    }

    #${LIVE_ID} .v4940-day{
      color:#ff9caf;
      font-size:.68rem;
      font-weight:950;
      line-height:1.2;
    }

    #${LIVE_ID} .v4940-date{
      display:block;
      margin-top:2px;
      color:#77839f;
      font-size:.57rem;
      font-weight:850;
      line-height:1.25;
    }

    #${LIVE_ID} .v4940-focus{
      color:#eef2ff;
      font-size:.72rem;
      font-weight:900;
      line-height:1.28;
    }

    #${LIVE_ID} .v4940-ministry{
      margin-top:2px;
      color:#9aa8c3;
      font-size:.64rem;
      line-height:1.3;
    }

    #${LIVE_ID} .v4940-time{
      margin-top:3px;
      color:#f4b45f;
      font-size:.62rem;
      font-weight:850;
      line-height:1.32;
    }

    /* Quarantine only OLD visual owners. Master data modules stay untouched. */
    #home-svs-section,
    #home-transfers-section,
    #nexa-v430-transfer-card,
    #nexa-transfer-card,
    .nexa-v453-transfer,
    #nexa-v4937-live-event,
    #nexa-v4935-live-event,
    #nexa-v4934-live-event,
    #nexa-v4933-live-event,
    [data-nexa-home-retired="v49-40"]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      max-height:0!important;
      min-height:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }

    @media(max-width:560px){
      #${STACK_ID}{
        width:100%!important;
        max-width:100%!important;
      }
      #${LIVE_ID} .v4940-row{
        grid-template-columns:90px minmax(0,1fr);
      }
    }
  `;
  document.head.appendChild(s);
}

function accents(){
  return `<span class="nexa-v4940-top-accent" aria-hidden="true"></span>
          <span class="nexa-v4940-left-accent" aria-hidden="true"></span>`;
}

function shell({id,tech,kicker,title,copy}){
  const el=document.createElement('section');
  el.id=id;
  el.className='section nexa-v477-tech-card nexa-v4940-card';
  el.dataset.nexaTech=tech;
  el.dataset.nexaUnifiedOwner='v49-40';
  el.innerHTML=`
    ${accents()}
    <div class="nexa-v4940-content">
      <div class="nexa-v4940-kicker">${esc(kicker)}</div>
      <h2 class="nexa-v4940-title">${esc(title)}</h2>
      <div class="nexa-v4940-copy">${esc(copy)}</div>
    </div>
  `;
  return el;
}

function findAnchor(){
  return $('#nexa-v4937-live-event')
    || $('#home-svs-section')
    || $('#nexa-v302-pulse')
    || $('#nexa-v31-alliance')
    || $('#nexa-v49-transfer-card')
    || $('.footer');
}

function legacyPulseChildren(){
  const host=$('#nexa-v302-pulse');
  if(!host || host.dataset.nexaUnifiedOwner==='v49-40') return [];
  return [
    $('#nexa-pulse-published-forms',host),
    $('#nexa-pulse-battle-plans',host)
  ].filter(Boolean);
}

function readLegacyAlliance(){
  const candidates=$$('#nexa-v31-alliance,section,article,div')
    .filter(el=>el?.dataset?.nexaUnifiedOwner!=='v49-40')
    .filter(el=>/\bALLIANCE SIGNAL\b/i.test(clean(el.textContent)));

  if(!candidates.length) return null;

  candidates.sort((a,b)=>a.querySelectorAll('*').length-b.querySelectorAll('*').length);
  const el=candidates[0];

  const headings=$$('h1,h2,h3,b,strong',el)
    .map(x=>clean(x.textContent))
    .filter(Boolean)
    .filter(x=>!/ALLIANCE SIGNAL/i.test(x));

  const muted=$$('.muted,small,p',el)
    .map(x=>clean(x.textContent))
    .filter(Boolean)
    .filter(x=>!/ALLIANCE SIGNAL/i.test(x));

  return {
    title:headings[0] || 'No alliance event published',
    copy:muted[0] || 'Foundry, Canyon and alliance strategy updates will appear here.'
  };
}

function ensureStack(){
  let stack=$('#'+STACK_ID);
  if(stack) return stack;

  const pulseChildren=legacyPulseChildren();
  const alliance=readLegacyAlliance();

  const anchor=findAnchor();

  stack=document.createElement('section');
  stack.id=STACK_ID;
  stack.dataset.nexaUnifiedOwner='v49-40';

  const live=shell({
    id:LIVE_ID,
    tech:'live',
    kicker:'LIVE EVENT',
    title:'No Live Event',
    copy:'Upcoming state events, schedules and forms will appear here when leadership publishes them.'
  });

  const pulse=shell({
    id:PULSE_ID,
    tech:'pulse',
    kicker:'NEXA PULSE',
    title:'Signals & response requests',
    copy:'Forms, surveys and requests appear here when leadership publishes them.'
  });

  const allianceCard=shell({
    id:ALLIANCE_ID,
    tech:'alliance',
    kicker:'ALLIANCE SIGNAL',
    title:alliance?.title || 'No alliance event published',
    copy:alliance?.copy || 'Foundry, Canyon and alliance strategy updates will appear here.'
  });

  const transfer=shell({
    id:TRANSFER_ID,
    tech:'transfer',
    kicker:'TRANSFERS',
    title:'Transfer Center',
    copy:'Transfer cycles and recruiting information will appear here when active.'
  });

  /* IDs expected by the existing Transfer data owners. */
  const transferContent=$('.nexa-v4940-content',transfer);
  const events=document.createElement('div');
  events.id='nexa-v49-transfer-events';
  events.style.marginTop='4px';
  transferContent.appendChild(events);

  /* Preserve Pulse plugin results if it already rendered before this owner booted. */
  pulseChildren.forEach(node=>pulse.appendChild(node));

  stack.append(live,pulse,allianceCard,transfer);

  if(anchor?.parentNode){
    if(anchor.classList?.contains('footer')) anchor.parentNode.insertBefore(stack,anchor);
    else anchor.parentNode.insertBefore(stack,anchor);
  }else{
    const main=$('main.shell') || $('#home') || $('main') || document.body;
    main.appendChild(stack);
  }

  return stack;
}

function our(id){
  return $$(`#${id}`).find(el=>el?.dataset?.nexaUnifiedOwner==='v49-40') || null;
}

function markLegacy(el){
  if(!el || el.dataset?.nexaUnifiedOwner==='v49-40') return;
  if(el.id===STACK_ID) return;
  el.dataset.nexaHomeRetired='v49-40';
  el.setAttribute('aria-hidden','true');
}

function retireLegacy(){
  const stack=ensureStack();

  /* Duplicate IDs from older owners: keep only the card inside our stack. */
  [PULSE_ID,ALLIANCE_ID,TRANSFER_ID].forEach(id=>{
    $$(`#${id}`).forEach(el=>{
      if(!stack.contains(el)) markLegacy(el);
    });
  });

  [
    '#home-svs-section',
    '#home-transfers-section',
    '#nexa-v430-transfer-card',
    '#nexa-transfer-card',
    '.nexa-v453-transfer',
    '#nexa-v4937-live-event',
    '#nexa-v4935-live-event',
    '#nexa-v4934-live-event',
    '#nexa-v4933-live-event'
  ].forEach(sel=>$$(sel).forEach(markLegacy));

  /* Text fallback for legacy cards that have no stable id. */
  $$('section,article,div').forEach(el=>{
    if(stack.contains(el) || el.contains(stack)) return;
    const t=clean(el.textContent);

    if(/\bLIVE EVENT\b/i.test(t) && /\bNo Live Event\b/i.test(t) && /\bUpcoming state events\b/i.test(t)){
      const card=el.closest?.('section,article,[class*="card"],[class*="signal"]') || el;
      if(card && !card.contains(stack)) markLegacy(card);
    }
  });
}

function renderEmptyLive(){
  const card=our(LIVE_ID);
  if(!card) return false;

  card.innerHTML=`
    ${accents()}
    <div class="nexa-v4940-content">
      <div class="nexa-v4940-kicker">LIVE EVENT</div>
      <h2 class="nexa-v4940-title">No Live Event</h2>
      <div class="nexa-v4940-copy">Upcoming state events, schedules and forms will appear here when leadership publishes them.</div>
    </div>
  `;
  card.classList.remove('is-live');
  card.classList.add('is-empty');
  return true;
}

function renderLive(live){
  if(!live) return renderEmptyLive();

  lastLive=live;
  window.NEXA_CURRENT_LIVE_EVENT=live;

  const card=our(LIVE_ID);
  if(!card) return false;

  const p=payloadOf(live);
  const schedule=Array.isArray(p.schedule)?p.schedule:[];
  const star=p.star_alliance?.tag || '—';
  const presidency=p.presidency_alliance?.tag || '—';

  const rows=schedule.map(row=>{
    const day=esc(row?.day||'');
    const date=esc(fmtDate(row?.date||''));
    const focus=esc(row?.focus||'');
    const ministry=esc(row?.ministry||'');
    const time=esc(row?.time_utc||'');
    const secondary=esc(row?.secondary||'');

    return `
      <div class="v4940-row">
        <div>
          <div class="v4940-day">${day}</div>
          ${date?`<span class="v4940-date">${date}</span>`:''}
        </div>
        <div>
          <div class="v4940-focus">${focus}</div>
          ${ministry?`<div class="v4940-ministry">${ministry}</div>`:''}
          ${(time||secondary)?`<div class="v4940-time">${[time,secondary].filter(Boolean).join(' • ')}</div>`:''}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML=`
    ${accents()}
    <div class="nexa-v4940-content">
      <div class="nexa-v4940-kicker">LIVE EVENT</div>
      <h2 class="nexa-v4940-title">${esc(live.title||'SvS')}</h2>

      <div class="v4940-alliance-grid">
        <div class="v4940-mini">
          <span>GOING FOR THE STAR</span>
          <strong>${esc(star)}</strong>
        </div>
        <div class="v4940-mini">
          <span>UP FOR PRESIDENCY</span>
          <strong>${esc(presidency)}</strong>
        </div>
      </div>

      ${rows?`
        <div class="v4940-schedule">
          <div class="v4940-schedule-title">SVS SCHEDULE</div>
          ${rows}
        </div>
      `:''}
    </div>
  `;

  card.classList.remove('is-empty');
  card.classList.add('is-live');
  return true;
}

function consumeLive(){
  const live=window.NEXA_CURRENT_LIVE_EVENT;
  if(live && typeof live==='object') return renderLive(live);
  lastLive=null;
  return renderEmptyLive();
}

function adoptLateAlliance(){
  const stack=ensureStack();
  const legacy=$$('#nexa-v31-alliance')
    .find(el=>el?.dataset?.nexaUnifiedOwner!=='v49-40' && !stack.contains(el));

  if(!legacy) return;

  const data=readLegacyAlliance();
  const card=our(ALLIANCE_ID);
  if(data && card){
    const title=$('.nexa-v4940-title',card);
    const copy=$('.nexa-v4940-copy',card);
    if(title && data.title) title.textContent=data.title;
    if(copy && data.copy) copy.textContent=data.copy;
  }
  markLegacy(legacy);
}

function recoverPulseChildren(){
  const stack=ensureStack();
  const pulse=our(PULSE_ID);
  if(!pulse) return;

  ['nexa-pulse-published-forms','nexa-pulse-battle-plans'].forEach(id=>{
    const nodes=$$(`#${id}`);
    const keep=nodes.find(n=>pulse.contains(n));
    nodes.forEach(n=>{
      if(n===keep) return;
      if(!pulse.contains(n)) pulse.appendChild(n);
    });
  });

  /* If plugin has not rendered yet, do nothing; its own retry loop will find our stable host. */
  void stack;
}

async function requestDataOwners(){
  try{
    if(typeof window.NEXA_SYNC_STATE_HOME==='function'){
      await window.NEXA_SYNC_STATE_HOME();
    }
  }catch(err){
    console.warn('[NEXA V49.40] State Home sync failed',err?.message||err);
  }

  consumeLive();
  recoverPulseChildren();
  adoptLateAlliance();
  retireLegacy();
}

function finitePasses(){
  const mine=++generation;
  [0,120,300,650,1100,1800,3000,5000,8000,12000].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;

      if(index<=3){
        await requestDataOwners();
      }else{
        consumeLive();
        recoverPulseChildren();
        adoptLateAlliance();
        retireLegacy();
      }
    },ms);
  });
}

function boot(){
  installCSS();
  ensureStack();
  retireLegacy();
  consumeLive();
  finitePasses();

  window.addEventListener('nexa:live-event-ready',e=>{
    const live=e?.detail?.live;
    if(live && typeof live==='object') renderLive(live);
    else renderEmptyLive();
    retireLegacy();
  });

  window.addEventListener('nexa:home-ready',finitePasses);
  window.addEventListener('pageshow',finitePasses);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) finitePasses();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    lastLive=null;
    renderEmptyLive();
    finitePasses();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
