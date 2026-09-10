/* NEXA V49.36 — LIVE EVENT HOME FAMILY CARD
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Goal:
   - Active Live Event must occupy the SAME Home slot and visual family as the inactive card.
   - Exact position: immediately before NEXA Pulse.
   - No extra LIVE pill.
   - No redundant State/Prep/Battle summary line at the top.
   - Full published schedule with dates.
   - Legacy "No Live Event" surface is retired completely.

   Architecture:
   - nexa-v49-state-hub.js remains the ONLY Supabase/data owner.
   - This file performs ZERO Supabase queries.
   - It consumes window.NEXA_CURRENT_LIVE_EVENT and nexa:live-event-ready.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4936_LIVE_HOME_FAMILY__) return;
window.__NEXA_V4936_LIVE_HOME_FAMILY__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const CARD_ID='nexa-v4936-live-event';
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

function pulse(){
  return $('#nexa-v302-pulse');
}

function ensureCard(){
  let card=$('#'+CARD_ID);
  if(card) return card;

  card=document.createElement('section');
  card.id=CARD_ID;
  card.className='section nexa-v477-tech-card nexa-v4936-live-card';
  card.dataset.nexaTech='live';
  card.setAttribute('aria-live','polite');

  const p=pulse();

  if(p?.parentNode){
    p.parentNode.insertBefore(card,p);
    return card;
  }

  const old=$('#home-svs-section');
  if(old?.parentNode){
    old.parentNode.insertBefore(card,old);
    return card;
  }

  const main=$('main.shell') || $('#home') || $('main');
  if(main) main.appendChild(card);

  return card;
}

function forceExactSlot(){
  const card=ensureCard();
  const p=pulse();

  if(card && p?.parentNode){
    if(card.parentNode!==p.parentNode || card.nextElementSibling!==p){
      p.parentNode.insertBefore(card,p);
    }
  }

  return card;
}

function installCSS(){
  if($('#nexa-v4936-live-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v4936-live-css';
  s.textContent=`
    #${CARD_ID}{
      --tech:#ff4fc8;
      --tech-rgb:255,79,200;
      display:none;
      width:100%!important;
      max-width:100%!important;
      min-height:64px!important;
      height:auto!important;
      margin:0!important;
      padding:12px 16px!important;
      border-radius:20px!important;
      box-sizing:border-box!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
      position:relative!important;
      overflow:hidden!important;
    }

    #${CARD_ID}.is-live{display:block!important}

    #${CARD_ID} .v4936-kicker{
      margin:0 0 7px;
      color:#df9cff;
      font-size:.64rem;
      font-weight:950;
      letter-spacing:.16em;
      line-height:1.1;
    }

    #${CARD_ID} .v4936-title{
      margin:0;
      color:#fff;
      font-size:1.15rem;
      line-height:1.15;
      letter-spacing:-.018em;
    }

    #${CARD_ID} .v4936-alliance-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:7px;
      margin-top:10px;
    }

    #${CARD_ID} .v4936-mini{
      min-width:0;
      padding:8px 9px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      background:rgba(255,255,255,.022);
    }

    #${CARD_ID} .v4936-mini span{
      display:block;
      margin-bottom:3px;
      color:#8290ad;
      font-size:.52rem;
      font-weight:900;
      letter-spacing:.10em;
      line-height:1.2;
    }

    #${CARD_ID} .v4936-mini strong{
      display:block;
      color:#f4f7ff;
      font-size:.75rem;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    #${CARD_ID} .v4936-schedule{
      display:grid;
      gap:6px;
      margin-top:10px;
    }

    #${CARD_ID} .v4936-schedule-title{
      color:#8998b7;
      font-size:.54rem;
      font-weight:950;
      letter-spacing:.12em;
      margin-bottom:1px;
    }

    #${CARD_ID} .v4936-row{
      display:grid;
      grid-template-columns:100px minmax(0,1fr);
      gap:9px;
      align-items:start;
      padding:8px 9px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.022);
    }

    #${CARD_ID} .v4936-day{
      color:#ff9caf;
      font-size:.68rem;
      font-weight:950;
      line-height:1.2;
    }

    #${CARD_ID} .v4936-date{
      display:block;
      margin-top:2px;
      color:#77839f;
      font-size:.57rem;
      font-weight:850;
      line-height:1.25;
    }

    #${CARD_ID} .v4936-focus{
      color:#eef2ff;
      font-size:.72rem;
      font-weight:900;
      line-height:1.28;
    }

    #${CARD_ID} .v4936-ministry{
      margin-top:2px;
      color:#9aa8c3;
      font-size:.64rem;
      line-height:1.3;
    }

    #${CARD_ID} .v4936-time{
      margin-top:3px;
      color:#f4b45f;
      font-size:.62rem;
      font-weight:850;
      line-height:1.32;
    }

    #home-svs-section,
    [data-nexa-retired-live="v49-36"]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(s);
}

function retireLegacyLiveCards(){
  const keep=$('#'+CARD_ID);
  const home=$('#home') || $('main.shell') || document.body;

  $$('section,article,div',home).forEach(el=>{
    if(!el || el===keep || keep?.contains(el) || el.contains(keep)) return;
    if(el===home || el===document.body || el===document.documentElement) return;
    if(el.id==='nexa-v302-pulse') return;

    if(el.id==='home-svs-section'){
      el.dataset.nexaRetiredLive='v49-36';
      return;
    }

    const raw=clean(el.textContent);
    if(!/\bLIVE EVENT\b/i.test(raw)) return;
    if(!(/\bNo Live Event\b/i.test(raw) || /\bUpcoming state events\b/i.test(raw))) return;

    const card=el.closest?.(
      'section,.section,article,[class*="event-card"],[class*="signal"]'
    ) || el;

    if(
      !card ||
      card===keep ||
      keep?.contains(card) ||
      card.contains(keep) ||
      card===home ||
      card===document.body ||
      card===document.documentElement
    ) return;

    card.dataset.nexaRetiredLive='v49-36';
    card.setAttribute('aria-hidden','true');
  });
}

function render(live){
  if(!live) return false;

  lastLive=live;
  window.NEXA_CURRENT_LIVE_EVENT=live;

  const p=payloadOf(live);
  const schedule=Array.isArray(p.schedule)?p.schedule:[];
  const card=forceExactSlot();
  if(!card) return false;

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
      <div class="v4936-row">
        <div>
          <div class="v4936-day">${day}</div>
          ${date?`<span class="v4936-date">${date}</span>`:''}
        </div>
        <div>
          <div class="v4936-focus">${focus}</div>
          ${ministry?`<div class="v4936-ministry">${ministry}</div>`:''}
          ${(time||secondary)?`<div class="v4936-time">${[time,secondary].filter(Boolean).join(' • ')}</div>`:''}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML=`
    <div class="v4936-kicker">LIVE EVENT</div>
    <h2 class="v4936-title">${esc(live.title||'SvS')}</h2>

    <div class="v4936-alliance-grid">
      <div class="v4936-mini">
        <span>GOING FOR THE STAR</span>
        <strong>${esc(star)}</strong>
      </div>
      <div class="v4936-mini">
        <span>UP FOR PRESIDENCY</span>
        <strong>${esc(presidency)}</strong>
      </div>
    </div>

    ${rows?`
      <div class="v4936-schedule">
        <div class="v4936-schedule-title">SVS SCHEDULE</div>
        ${rows}
      </div>
    `:''}
  `;

  card.classList.add('is-live');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  retireLegacyLiveCards();
  forceExactSlot();
  return true;
}

function consume(){
  const live=window.NEXA_CURRENT_LIVE_EVENT;
  if(live && typeof live==='object') return render(live);
  if(lastLive) return render(lastLive);
  return false;
}

async function askV49(){
  if(typeof window.NEXA_SYNC_STATE_HOME!=='function') return false;
  try{
    await window.NEXA_SYNC_STATE_HOME();
  }catch(err){
    console.warn('[NEXA V49.36] V49 sync failed',err?.message||err);
  }
  return consume();
}

function scheduleFinitePasses(){
  const mine=++generation;
  [0,150,400,850,1500,2600,4200,7000,10000].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;
      if(index<=2){
        await askV49();
      }else{
        consume();
        retireLegacyLiveCards();
        forceExactSlot();
      }
    },ms);
  });
}

function boot(){
  installCSS();
  ensureCard();
  retireLegacyLiveCards();
  consume();
  scheduleFinitePasses();

  window.addEventListener('nexa:live-event-ready',e=>{
    const live=e?.detail?.live;
    if(live && typeof live==='object') render(live);
  });

  window.addEventListener('nexa:home-ready',scheduleFinitePasses);
  window.addEventListener('pageshow',scheduleFinitePasses);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) scheduleFinitePasses();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    lastLive=null;
    scheduleFinitePasses();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
