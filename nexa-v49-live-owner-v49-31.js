/* NEXA LIVE OWNER V49.46 — CONTENT OWNER ONLY — 2026-09-11
   COMPLETE REPLACEMENT for: nexa-v49-live-owner-v49-31.js

   Owns ONLY:
   - #nexa-v4937-live-event
   - Live Event visible content
   - retirement of stale legacy Live card

   DOES NOT:
   - anchor itself to Pulse
   - move Pulse
   - move Alliance
   - move Transfers
   - own Home order

   Home order is owned by nexa-home-compositor-v1.js.

   Safety:
   - No MutationObserver.
   - No polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4946_LIVE_CONTENT_ONLY__) return;
window.__NEXA_V4946_LIVE_CONTENT_ONLY__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const CARD_ID='nexa-v4937-live-event';
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
  if($('#nexa-v4937-live-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v4937-live-css';
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
      border:1px solid rgba(255,79,200,.34)!important;
      background:
        radial-gradient(circle at 8% 8%,rgba(255,79,200,.065),transparent 34%),
        linear-gradient(145deg,rgba(7,18,38,.97),rgba(4,10,27,.985))!important;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.012),
        0 0 9px rgba(255,79,200,.035)!important;
    }

    #${CARD_ID}.is-live,
    #${CARD_ID}.is-empty{
      display:block!important;
    }

    #${CARD_ID}::before{
      display:none!important;
    }

    #${CARD_ID}::after{
      content:"";
      position:absolute;
      left:-1px;
      top:18px;
      width:3px;
      height:40px;
      border-radius:999px;
      background:#ff62d1;
      box-shadow:0 0 5px rgba(255,98,209,.82),0 0 10px rgba(255,79,200,.38);
      pointer-events:none;
      z-index:5;
    }

    #${CARD_ID} .v4937-kicker{
      margin:0 0 6px;
      color:#ff79dc;
      font-size:10px;
      font-weight:950;
      letter-spacing:.16em;
      line-height:1.1;
    }

    #${CARD_ID} .v4937-title{
      margin:0 0 5px!important;
      color:#fff!important;
      font-size:16px!important;
      line-height:1.15!important;
      font-weight:900!important;
      letter-spacing:-.01em!important;
      font-family:inherit!important;
    }

    #${CARD_ID}.is-empty{
      min-height:0!important;
      padding:12px 16px!important;
    }

    #${CARD_ID} .v4939-empty-copy{
      margin:0!important;
      color:#9aa8c3!important;
      font-size:12px!important;
      line-height:1.35!important;
      font-weight:400!important;
    }

    #${CARD_ID} .v4937-alliance-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:7px;
      margin-top:10px;
    }

    #${CARD_ID} .v4937-mini{
      min-width:0;
      padding:8px 9px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      background:rgba(255,255,255,.022);
    }

    #${CARD_ID} .v4937-mini span{
      display:block;
      margin-bottom:3px;
      color:#8290ad;
      font-size:.52rem;
      font-weight:900;
      letter-spacing:.10em;
      line-height:1.2;
    }

    #${CARD_ID} .v4937-mini strong{
      display:block;
      color:#f4f7ff;
      font-size:.75rem;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    #${CARD_ID} .v4937-schedule{
      display:grid;
      gap:6px;
      margin-top:10px;
    }

    #${CARD_ID} .v4937-schedule-title{
      color:#8998b7;
      font-size:.54rem;
      font-weight:950;
      letter-spacing:.12em;
      margin-bottom:1px;
    }

    #${CARD_ID} .v4937-row{
      display:grid;
      grid-template-columns:100px minmax(0,1fr);
      gap:9px;
      align-items:start;
      padding:8px 9px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.022);
    }

    #${CARD_ID} .v4937-day{
      color:#ff9caf;
      font-size:.68rem;
      font-weight:950;
      line-height:1.2;
    }

    #${CARD_ID} .v4937-date{
      display:block;
      margin-top:2px;
      color:#77839f;
      font-size:.57rem;
      font-weight:850;
      line-height:1.25;
    }

    #${CARD_ID} .v4937-focus{
      color:#eef2ff;
      font-size:13px;
      font-weight:900;
      line-height:1.28;
    }

    #${CARD_ID} .v4937-ministry{
      margin-top:2px;
      color:#9aa8c3;
      font-size:10px;
      line-height:1.3;
    }

    #${CARD_ID} .v4937-time{
      margin-top:3px;
      color:#f4b45f;
      font-size:.62rem;
      font-weight:850;
      line-height:1.32;
    }

    #home-svs-section,
    [data-nexa-retired-live="v49-46"]{
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
  `;
  document.head.appendChild(s);
}

function ensureCard(){
  let card=$('#'+CARD_ID);
  if(card) return card;

  card=document.createElement('section');
  card.id=CARD_ID;
  card.className='section nexa-v477-tech-card nexa-v31-strip nexa-v4937-live-card';
  card.dataset.nexaTech='live';
  card.dataset.nexaLiveOwner='v49.46';
  card.setAttribute('aria-live','polite');

  const home=$('#home') || $('main.shell') || $('main');
  if(home) home.appendChild(card);

  return card;
}

function announceReady(){
  window.dispatchEvent(new CustomEvent('nexa:home-surface-ready',{
    detail:{surface:'live',id:CARD_ID}
  }));
  try{window.NEXA_HOME_COMPOSE?.()}catch(_){}
}

function isLegacyNoLiveText(raw){
  const t=clean(raw);
  return /\bLIVE EVENT\b/i.test(t)
    && /\bNo Live Event\b/i.test(t)
    && /\bUpcoming state events\b/i.test(t);
}

function retireLegacyLiveCards(){
  const keep=$('#'+CARD_ID);
  const home=$('#home') || $('main.shell') || document.body;

  $('#home-svs-section')?.setAttribute('data-nexa-retired-live','v49-46');

  $$('section,article,div',home).forEach(el=>{
    if(el===keep || keep?.contains(el) || el.contains(keep)) return;
    if(!isLegacyNoLiveText(el.textContent)) return;

    el.dataset.nexaRetiredLive='v49-46';
    el.setAttribute('aria-hidden','true');
  });
}

function renderEmpty(){
  window.NEXA_CURRENT_LIVE_EVENT=null;

  const card=ensureCard();
  if(!card) return false;

  card.innerHTML=`
    <div class="v4937-kicker">LIVE EVENT</div>
    <h2 class="v4937-title">No Live Event</h2>
    <p class="v4939-empty-copy">Upcoming state events, schedules and forms will appear here when leadership publishes them.</p>
  `;

  card.classList.remove('is-live');
  card.classList.add('is-empty');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  retireLegacyLiveCards();
  announceReady();
  return true;
}

function render(live){
  if(!live) return renderEmpty();

  window.NEXA_CURRENT_LIVE_EVENT=live;

  const p=payloadOf(live);
  const schedule=Array.isArray(p.schedule)?p.schedule:[];
  const card=ensureCard();
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
      <div class="v4937-row">
        <div>
          <div class="v4937-day">${day}</div>
          ${date?`<span class="v4937-date">${date}</span>`:''}
        </div>
        <div>
          <div class="v4937-focus">${focus}</div>
          ${ministry?`<div class="v4937-ministry">${ministry}</div>`:''}
          ${(time||secondary)?`<div class="v4937-time">${[time,secondary].filter(Boolean).join(' • ')}</div>`:''}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML=`
    <div class="v4937-kicker">LIVE EVENT</div>
    <h2 class="v4937-title">${esc(live.title||'SvS')}</h2>

    <div class="v4937-alliance-grid">
      <div class="v4937-mini">
        <span>GOING FOR THE STAR</span>
        <strong>${esc(star)}</strong>
      </div>
      <div class="v4937-mini">
        <span>UP FOR PRESIDENCY</span>
        <strong>${esc(presidency)}</strong>
      </div>
    </div>

    ${rows?`
      <div class="v4937-schedule">
        <div class="v4937-schedule-title">SVS SCHEDULE</div>
        ${rows}
      </div>
    `:''}
  `;

  card.classList.remove('is-empty');
  card.classList.add('is-live');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  retireLegacyLiveCards();
  announceReady();
  return true;
}

function consume(){
  const live=window.NEXA_CURRENT_LIVE_EVENT;
  if(live && typeof live==='object') return render(live);
  return renderEmpty();
}

async function syncThenConsume(){
  if(typeof window.NEXA_SYNC_STATE_HOME==='function'){
    try{
      await window.NEXA_SYNC_STATE_HOME();
    }catch(err){
      console.warn('[NEXA Live V49.46] State Home sync failed',err?.message||err);
    }
  }
  return consume();
}

function finitePasses({resync=false}={}){
  const mine=++generation;

  [0,250,800,2000].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;
      if(resync && index===0) await syncThenConsume();
      else consume();
    },ms);
  });
}

function boot(){
  installCSS();
  ensureCard();
  retireLegacyLiveCards();
  consume();

  window.addEventListener('nexa:live-event-ready',e=>{
    const live=e?.detail?.live;
    if(live && typeof live==='object') render(live);
    else renderEmpty();
  });

  window.addEventListener('nexa:home-ready',()=>finitePasses({resync:false}));
  window.addEventListener('pageshow',()=>finitePasses({resync:true}));

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) finitePasses({resync:true});
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    window.NEXA_CURRENT_LIVE_EVENT=null;
    finitePasses({resync:true});
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
