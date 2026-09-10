/* NEXA V49.34 — LIVE EVENT SIGNAL CARD
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Architecture:
   - nexa-v49-state-hub.js is the ONLY data owner / Supabase reader.
   - This file performs ZERO Supabase queries.
   - V49 publishes the live row through window.NEXA_CURRENT_LIVE_EVENT
     and the nexa:live-event-ready event.
   - This renderer creates one new Live Event card INSIDE the Home signal stack,
     immediately before NEXA Pulse — the exact slot where Live Event belongs.
   - Legacy Live Event surfaces are hidden, not used as the visible owner.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4934_LIVE_SIGNAL_CARD__) return;
window.__NEXA_V4934_LIVE_SIGNAL_CARD__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const CARD_ID='nexa-v4934-live-event';
let lastLive=null;
let generation=0;

const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
}

function fmtDate(v){
  if(!v) return '';
  const d=new Date(`${v}T00:00:00Z`);
  if(Number.isNaN(d.getTime())) return clean(v);
  return new Intl.DateTimeFormat(undefined,{
    month:'short',
    day:'numeric',
    timeZone:'UTC'
  }).format(d);
}

function payloadOf(live){
  return live?.live_event_payload && typeof live.live_event_payload==='object'
    ? live.live_event_payload
    : {};
}

function signalsHost(){
  return $('#nexa-v31-signals');
}

function pulseAnchor(){
  return $('#nexa-v302-pulse');
}

function ensureCard(){
  let card=$('#'+CARD_ID);
  if(card) return card;

  card=document.createElement('section');
  card.id=CARD_ID;
  card.className='nexa-v4934-live-card';
  card.setAttribute('aria-live','polite');

  const host=signalsHost();
  const pulse=pulseAnchor();

  if(host){
    if(pulse && pulse.parentElement===host){
      host.insertBefore(card,pulse);
    }else{
      host.appendChild(card);
    }
  }else{
    const main=$('main.shell') || $('#home') || $('main');
    if(!main) return null;
    if(pulse?.parentElement){
      pulse.insertAdjacentElement('beforebegin',card);
    }else{
      main.appendChild(card);
    }
  }

  return card;
}

function reanchor(){
  const card=ensureCard();
  if(!card) return null;

  const host=signalsHost();
  const pulse=pulseAnchor();

  if(host && pulse && pulse.parentElement===host){
    if(card.parentElement!==host || card.nextElementSibling!==pulse){
      host.insertBefore(card,pulse);
    }
  }

  return card;
}

function installCSS(){
  if($('#nexa-v4934-live-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v4934-live-css';
  s.textContent=`
    #${CARD_ID}{
      display:none;
      width:100%!important;
      max-width:100%!important;
      box-sizing:border-box!important;
      margin:0!important;
      padding:16px!important;
      border-radius:20px!important;
      border:1px solid rgba(255,78,115,.46)!important;
      background:
        radial-gradient(circle at 0% 0%,rgba(255,70,111,.13),transparent 34%),
        radial-gradient(circle at 100% 100%,rgba(69,112,255,.10),transparent 38%),
        linear-gradient(145deg,rgba(12,17,40,.97),rgba(6,9,25,.97))!important;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.025) inset,
        0 0 24px rgba(255,72,110,.08)!important;
      color:#fff!important;
      position:relative!important;
      visibility:visible!important;
      opacity:1!important;
      overflow:hidden!important;
    }

    #${CARD_ID}.is-live{display:block!important}

    #${CARD_ID} .v4934-kicker{
      display:flex;
      align-items:center;
      gap:7px;
      color:#ff92aa;
      font-size:.67rem;
      font-weight:950;
      letter-spacing:.13em;
      margin-bottom:10px;
    }

    #${CARD_ID} .v4934-dot{
      width:7px;height:7px;border-radius:50%;
      background:#ff5272;
      box-shadow:0 0 10px rgba(255,82,114,.9);
      flex:0 0 auto;
    }

    #${CARD_ID} .v4934-head{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:12px;
    }

    #${CARD_ID} .v4934-title{
      margin:0;
      color:#fff;
      font-size:1.42rem;
      line-height:1.12;
      letter-spacing:-.025em;
    }

    #${CARD_ID} .v4934-live{
      flex:0 0 auto;
      padding:6px 10px;
      border-radius:999px;
      border:1px solid rgba(255,93,124,.45);
      background:rgba(95,13,35,.45);
      color:#ff9db0;
      font-size:.62rem;
      font-weight:950;
      letter-spacing:.08em;
    }

    #${CARD_ID} .v4934-sub{
      margin:7px 0 0;
      color:#aebad3;
      font-size:.77rem;
      line-height:1.4;
    }

    #${CARD_ID} .v4934-alliance-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px;
      margin-top:13px;
      padding-top:12px;
      border-top:1px solid rgba(255,255,255,.08);
    }

    #${CARD_ID} .v4934-mini{
      min-width:0;
      padding:9px 10px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:13px;
      background:rgba(255,255,255,.025);
    }

    #${CARD_ID} .v4934-mini span{
      display:block;
      margin-bottom:4px;
      color:#7887aa;
      font-size:.55rem;
      font-weight:900;
      letter-spacing:.1em;
    }

    #${CARD_ID} .v4934-mini strong{
      display:block;
      color:#f3f6ff;
      font-size:.80rem;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    #${CARD_ID} .v4934-schedule{
      display:grid;
      gap:7px;
      margin-top:13px;
    }

    #${CARD_ID} .v4934-schedule-title{
      color:#8998ba;
      font-size:.58rem;
      font-weight:950;
      letter-spacing:.11em;
      margin-bottom:1px;
    }

    #${CARD_ID} .v4934-row{
      display:grid;
      grid-template-columns:72px minmax(0,1fr);
      gap:9px;
      align-items:start;
      padding:9px 10px;
      border-radius:13px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.025);
    }

    #${CARD_ID} .v4934-day{
      color:#ff9caf;
      font-size:.71rem;
      font-weight:950;
    }

    #${CARD_ID} .v4934-date{
      display:block;
      margin-top:2px;
      color:#697895;
      font-size:.58rem;
      font-weight:800;
    }

    #${CARD_ID} .v4934-focus{
      color:#edf2ff;
      font-size:.75rem;
      font-weight:900;
      line-height:1.32;
    }

    #${CARD_ID} .v4934-ministry{
      margin-top:2px;
      color:#9eacc8;
      font-size:.67rem;
      line-height:1.35;
    }

    #${CARD_ID} .v4934-time{
      margin-top:3px;
      color:#ffbe86;
      font-size:.64rem;
      font-weight:850;
      line-height:1.35;
    }

    /* The old staging surface stays available for V49 internally,
       but is never allowed to become a visible Home card. */
    #home-svs-section{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }

    [data-nexa-retired-live="v49-34"]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(s);
}

function retireOldVisibleLiveCards(){
  const keep=$('#'+CARD_ID);
  const host=signalsHost();
  if(!host) return;

  Array.from(host.children).forEach(el=>{
    if(!el || el===keep || el.id==='nexa-v302-pulse' || el.id==='nexa-v31-alliance') return;

    if(el.id==='home-svs-section'){
      el.dataset.nexaRetiredLive='v49-34';
      return;
    }

    const t=clean(el.textContent);
    const isOldLive=
      /\bLIVE EVENT\b/i.test(t) &&
      (
        /\bNo Live Event\b/i.test(t) ||
        /\bUpcoming state events\b/i.test(t)
      );

    if(isOldLive){
      el.dataset.nexaRetiredLive='v49-34';
      el.setAttribute('aria-hidden','true');
    }
  });
}

function render(live){
  if(!live) return false;

  lastLive=live;
  window.NEXA_CURRENT_LIVE_EVENT=live;

  const p=payloadOf(live);
  const schedule=Array.isArray(p.schedule)?p.schedule:[];
  const card=reanchor();
  if(!card) return false;

  const state=p.state_number ?? live.state_number ?? '—';
  const opponent=p.opponent_state ?? live.opponent_state ?? '—';
  const star=p.star_alliance?.tag || '—';
  const presidency=p.presidency_alliance?.tag || '—';
  const prep=p.prep_start || live.prep_monday || '';
  const battle=p.battle_date || '';

  const scheduleHtml=schedule.map(row=>{
    const day=esc(row?.day||'');
    const date=esc(fmtDate(row?.date||''));
    const focus=esc(row?.focus||'');
    const ministry=esc(row?.ministry||'');
    const time=esc(row?.time_utc||'');
    const secondary=esc(row?.secondary||'');

    return `
      <div class="v4934-row">
        <div>
          <div class="v4934-day">${day}</div>
          ${date?`<span class="v4934-date">${date}</span>`:''}
        </div>
        <div>
          <div class="v4934-focus">${focus}</div>
          ${ministry?`<div class="v4934-ministry">${ministry}</div>`:''}
          ${(time||secondary)?`<div class="v4934-time">${[time,secondary].filter(Boolean).join(' • ')}</div>`:''}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML=`
    <div class="v4934-kicker">
      <span class="v4934-dot" aria-hidden="true"></span>
      LIVE EVENT
    </div>

    <div class="v4934-head">
      <div>
        <h2 class="v4934-title">${esc(live.title||`SvS vs ${opponent}`)}</h2>
        <div class="v4934-sub">
          State ${esc(state)}
          ${prep?` • Prep ${esc(prep)}`:''}
          ${battle?` • Battle ${esc(battle)}`:''}
        </div>
      </div>
      <div class="v4934-live">LIVE</div>
    </div>

    <div class="v4934-alliance-grid">
      <div class="v4934-mini">
        <span>GOING FOR THE STAR</span>
        <strong>${esc(star)}</strong>
      </div>
      <div class="v4934-mini">
        <span>UP FOR PRESIDENCY</span>
        <strong>${esc(presidency)}</strong>
      </div>
    </div>

    ${scheduleHtml?`
      <div class="v4934-schedule">
        <div class="v4934-schedule-title">SVS SCHEDULE</div>
        ${scheduleHtml}
      </div>
    `:''}
  `;

  card.classList.add('is-live');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  retireOldVisibleLiveCards();
  return true;
}

function consumePublished(){
  const live=window.NEXA_CURRENT_LIVE_EVENT;
  if(live && typeof live==='object'){
    return render(live);
  }
  if(lastLive) return render(lastLive);
  return false;
}

async function askV49(){
  if(typeof window.NEXA_SYNC_STATE_HOME!=='function') return false;

  try{
    await window.NEXA_SYNC_STATE_HOME();
  }catch(err){
    console.warn('[NEXA V49.34] V49 sync failed',err?.message||err);
  }

  return consumePublished();
}

function scheduleFinitePasses(){
  const mine=++generation;

  [0,150,400,850,1500,2600,4200].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;
      if(index<=2){
        await askV49();
      }else{
        reanchor();
        consumePublished();
        retireOldVisibleLiveCards();
      }
    },ms);
  });
}

function boot(){
  installCSS();
  ensureCard();
  retireOldVisibleLiveCards();
  consumePublished();
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
