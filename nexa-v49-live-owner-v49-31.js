/* NEXA V49.44 — LIVE EVENT SINGLE OWNER
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Purpose:
   - Own ONLY the Home Live Event card.
   - Do NOT recreate, remove, restyle, or reorder NEXA Pulse, Alliance Signal, or Transfers.
   - Consume the authoritative V49 State Hub bridge:
       window.NEXA_CURRENT_LIVE_EVENT
       nexa:live-event-ready
   - Never render a false "No Live Event" card before State Hub finishes.
   - Keep the Live Event immediately before NEXA Pulse when Pulse exists.

   Safety:
   - No MutationObserver.
   - No setInterval / indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4944_LIVE_EVENT_SINGLE_OWNER__) return;
window.__NEXA_V4944_LIVE_EVENT_SINGLE_OWNER__ = true;

const HOST_ID = 'nexa-v31-signals';
const LIVE_ID = 'nexa-v4944-live-event';
const PULSE_ID = 'nexa-v302-pulse';

const $ = (s,r=document)=>r?.querySelector?.(s)||null;
const $$ = (s,r=document)=>r?.querySelectorAll ? Array.from(r.querySelectorAll(s)) : [];

const esc = v => String(v ?? '').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();

function payloadOf(live){
  return live?.live_event_payload && typeof live.live_event_payload === 'object'
    ? live.live_event_payload
    : {};
}

function fmtDate(v){
  if(!v) return '';
  const raw = String(v).slice(0,10);
  const d = new Date(`${raw}T00:00:00Z`);
  if(Number.isNaN(d.getTime())) return clean(v);
  return new Intl.DateTimeFormat(undefined,{
    month:'short',
    day:'numeric',
    year:'numeric',
    timeZone:'UTC'
  }).format(d);
}

function installCSS(){
  $('#nexa-v4944-live-event-css')?.remove();

  const s = document.createElement('style');
  s.id = 'nexa-v4944-live-event-css';
  s.textContent = `
    #${LIVE_ID}{
      --nexa-rgb:255,79,200;
      --nexa-accent:#ff4fc8;
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

    #${LIVE_ID} .nexa-v4944-top,
    #${LIVE_ID} .nexa-v4944-left{
      position:absolute!important;
      z-index:8!important;
      pointer-events:none!important;
      display:block!important;
    }

    #${LIVE_ID} .nexa-v4944-top{
      left:18px!important;
      top:-1px!important;
      width:48px!important;
      height:2px!important;
      border-radius:999px!important;
      background:linear-gradient(
        90deg,transparent,rgba(var(--nexa-rgb),.42),
        rgba(var(--nexa-rgb),1),#fff,rgba(var(--nexa-rgb),1),
        rgba(var(--nexa-rgb),.42),transparent
      )!important;
      box-shadow:
        0 0 5px rgba(var(--nexa-rgb),.98),
        0 0 12px rgba(var(--nexa-rgb),.64),
        0 0 22px rgba(var(--nexa-rgb),.22)!important;
    }

    #${LIVE_ID} .nexa-v4944-left{
      left:-1px!important;
      top:18px!important;
      width:3px!important;
      height:40px!important;
      border-radius:0 999px 999px 0!important;
      background:linear-gradient(
        180deg,transparent 0%,rgba(var(--nexa-rgb),.45) 12%,
        rgba(var(--nexa-rgb),1) 42%,#fff 50%,
        rgba(var(--nexa-rgb),1) 58%,rgba(var(--nexa-rgb),.45) 88%,
        transparent 100%
      )!important;
      box-shadow:
        0 0 5px rgba(var(--nexa-rgb),.96),
        0 0 13px rgba(var(--nexa-rgb),.58)!important;
    }

    #${LIVE_ID} .nexa-v4944-kicker{
      margin:0 0 6px!important;
      color:var(--nexa-accent)!important;
      font-size:.64rem!important;
      line-height:1.1!important;
      font-weight:950!important;
      letter-spacing:.16em!important;
      text-transform:uppercase!important;
    }

    #${LIVE_ID} .nexa-v4944-title{
      margin:0!important;
      color:#fff!important;
      font-size:1.05rem!important;
      line-height:1.16!important;
      font-weight:950!important;
      letter-spacing:-.012em!important;
    }

    #${LIVE_ID} .nexa-v4944-meta{
      margin-top:5px!important;
      color:#9aa8c3!important;
      font-size:.68rem!important;
      line-height:1.38!important;
    }

    #${LIVE_ID} .nexa-v4944-alliance-grid{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:7px!important;
      margin-top:10px!important;
    }

    #${LIVE_ID} .nexa-v4944-mini{
      min-width:0!important;
      padding:8px 9px!important;
      border:1px solid rgba(255,255,255,.08)!important;
      border-radius:12px!important;
      background:rgba(255,255,255,.022)!important;
    }

    #${LIVE_ID} .nexa-v4944-mini span{
      display:block!important;
      margin-bottom:3px!important;
      color:#8290ad!important;
      font-size:.52rem!important;
      font-weight:900!important;
      letter-spacing:.10em!important;
      line-height:1.2!important;
      text-transform:uppercase!important;
    }

    #${LIVE_ID} .nexa-v4944-mini strong{
      display:block!important;
      color:#f4f7ff!important;
      font-size:.75rem!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
    }

    #${LIVE_ID} .nexa-v4944-schedule{
      display:grid!important;
      gap:6px!important;
      margin-top:10px!important;
    }

    #${LIVE_ID} .nexa-v4944-schedule-title{
      color:#8998b7!important;
      font-size:.54rem!important;
      font-weight:950!important;
      letter-spacing:.12em!important;
      margin-bottom:1px!important;
      text-transform:uppercase!important;
    }

    #${LIVE_ID} .nexa-v4944-row{
      display:grid!important;
      grid-template-columns:100px minmax(0,1fr)!important;
      gap:9px!important;
      align-items:start!important;
      padding:8px 9px!important;
      border-radius:12px!important;
      border:1px solid rgba(255,255,255,.07)!important;
      background:rgba(255,255,255,.022)!important;
    }

    #${LIVE_ID} .nexa-v4944-day{
      color:#ff9caf!important;
      font-size:.68rem!important;
      font-weight:950!important;
      line-height:1.2!important;
    }

    #${LIVE_ID} .nexa-v4944-date{
      display:block!important;
      margin-top:2px!important;
      color:#77839f!important;
      font-size:.57rem!important;
      font-weight:850!important;
      line-height:1.25!important;
    }

    #${LIVE_ID} .nexa-v4944-focus{
      color:#eef2ff!important;
      font-size:.72rem!important;
      font-weight:900!important;
      line-height:1.28!important;
    }

    #${LIVE_ID} .nexa-v4944-ministry{
      margin-top:2px!important;
      color:#9aa8c3!important;
      font-size:.64rem!important;
      line-height:1.3!important;
    }

    #${LIVE_ID} .nexa-v4944-time{
      margin-top:3px!important;
      color:#f4b45f!important;
      font-size:.62rem!important;
      font-weight:850!important;
      line-height:1.32!important;
    }

    /* Retire ONLY old Live Event visual shells. Do not touch Pulse / Alliance / Transfers. */
    #home-svs-section,
    #nexa-v4933-live-event,
    #nexa-v4934-live-event,
    #nexa-v4935-live-event,
    #nexa-v4937-live-event,
    #nexa-v4940-home-signals,
    #nexa-v4941-live-event{
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
      #${LIVE_ID} .nexa-v4944-row{
        grid-template-columns:90px minmax(0,1fr)!important;
      }
    }
  `;
  document.head.appendChild(s);
}

function host(){
  return $('#'+HOST_ID);
}

function retireOldLive(){
  [
    '#nexa-v4933-live-event',
    '#nexa-v4934-live-event',
    '#nexa-v4935-live-event',
    '#nexa-v4937-live-event',
    '#nexa-v4940-home-signals',
    '#nexa-v4941-live-event'
  ].forEach(sel=>{
    $$(sel).forEach(el=>{
      if(el.id !== LIVE_ID) el.remove();
    });
  });
}

function ensureCard(){
  const h = host();
  if(!h) return null;

  let card = $('#'+LIVE_ID);
  if(!card){
    card = document.createElement('section');
    card.id = LIVE_ID;
    card.className = 'section nexa-v4944-live-card';
    card.dataset.nexaTech = 'live';
    card.dataset.nexaLiveOwner = 'v49-44';
  }

  const pulse = $('#'+PULSE_ID);

  if(pulse && pulse.parentNode === h){
    if(card.parentNode !== h || card.nextElementSibling !== pulse){
      h.insertBefore(card,pulse);
    }
  }else if(card.parentNode !== h){
    h.prepend(card);
  }

  return card;
}

function placeCard(){
  const h = host();
  const card = $('#'+LIVE_ID);
  if(!h || !card) return false;

  const pulse = $('#'+PULSE_ID);
  if(pulse && pulse.parentNode === h){
    if(card.parentNode !== h || card.nextElementSibling !== pulse){
      h.insertBefore(card,pulse);
    }
  }else if(card.parentNode !== h){
    h.prepend(card);
  }
  return true;
}

function renderLive(live){
  if(!live || typeof live !== 'object') return false;

  const card = ensureCard();
  if(!card) return false;

  const p = payloadOf(live);
  const schedule = Array.isArray(p.schedule) ? p.schedule : [];

  const state =
    p.state ??
    live.state_number ??
    live.state ??
    '';

  const opponent =
    p.opponent ??
    p.opponent_state ??
    live.opponent_state ??
    '';

  const prep =
    p.prep_start ??
    p.prep_monday ??
    live.prep_monday ??
    '';

  const battle =
    p.battle_date ??
    '';

  const star =
    p.star_alliance?.tag ??
    p.star_alliance?.name ??
    '—';

  const presidency =
    p.presidency_alliance?.tag ??
    p.presidency_alliance?.name ??
    '—';

  const metaParts = [];
  if(state) metaParts.push(`State ${esc(state)}`);
  if(opponent) metaParts.push(`vs ${esc(opponent)}`);
  if(prep) metaParts.push(`Prep ${esc(fmtDate(prep))}`);
  if(battle) metaParts.push(`Battle ${esc(fmtDate(battle))}`);

  const rows = schedule.map(row=>{
    const day = clean(row?.day || row?.label || '');
    const date = clean(row?.date || '');
    const focus = clean(row?.focus || row?.event || row?.task || '');
    const ministry = clean(row?.ministry || row?.role || row?.owner || '');
    const time = clean(row?.time || '');
    const location = clean(row?.location || '');
    const extra = [time,location].filter(Boolean).join(' • ');

    return `
      <div class="nexa-v4944-row">
        <div>
          <div class="nexa-v4944-day">${esc(day || 'Schedule')}</div>
          ${date ? `<span class="nexa-v4944-date">${esc(fmtDate(date))}</span>` : ''}
        </div>
        <div>
          ${focus ? `<div class="nexa-v4944-focus">${esc(focus)}</div>` : ''}
          ${ministry ? `<div class="nexa-v4944-ministry">${esc(ministry)}</div>` : ''}
          ${extra ? `<div class="nexa-v4944-time">${esc(extra)}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <span class="nexa-v4944-top" aria-hidden="true"></span>
    <span class="nexa-v4944-left" aria-hidden="true"></span>

    <div class="nexa-v4944-kicker">LIVE EVENT</div>
    <h2 class="nexa-v4944-title">${esc(live.title || p.event_name || 'State of Power (SvS)')}</h2>

    <div class="nexa-v4944-meta">${metaParts.join(' • ')}</div>

    <div class="nexa-v4944-alliance-grid">
      <div class="nexa-v4944-mini">
        <span>Going for the Star</span>
        <strong>${esc(star)}</strong>
      </div>
      <div class="nexa-v4944-mini">
        <span>Up for Presidency</span>
        <strong>${esc(presidency)}</strong>
      </div>
    </div>

    ${rows ? `
      <div class="nexa-v4944-schedule">
        <div class="nexa-v4944-schedule-title">Schedule</div>
        ${rows}
      </div>
    ` : ''}
  `;

  card.dataset.liveEventId = clean(live.id || '');
  card.setAttribute('aria-hidden','false');
  card.hidden = false;

  placeCard();
  return true;
}

function consumeCurrent(){
  const live = window.NEXA_CURRENT_LIVE_EVENT;
  if(live && typeof live === 'object'){
    return renderLive(live);
  }
  return false;
}

function askStateHub(){
  if(typeof window.NEXA_SYNC_STATE_HOME !== 'function') return;
  try{
    const result = window.NEXA_SYNC_STATE_HOME();
    if(result && typeof result.catch === 'function'){
      result.catch(()=>{});
    }
  }catch(_){}
}

function bootPass(){
  retireOldLive();

  if(consumeCurrent()){
    placeCard();
    return;
  }

  /*
    IMPORTANT:
    Do not create a "No Live Event" fallback here.
    State Hub may still be resolving the authenticated state/live row.
  */
}

function boot(){
  installCSS();

  window.addEventListener('nexa:live-event-ready',e=>{
    const live = e?.detail?.live;
    if(live && typeof live === 'object'){
      window.NEXA_CURRENT_LIVE_EVENT = live;
      renderLive(live);
    }
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      bootPass();
      askStateHub();
    },{once:true});
  }else{
    bootPass();
    askStateHub();
  }

  /*
    Finite recovery passes only.
    These cover Safari/defer/auth timing without polling forever.
  */
  [100,300,700,1500,3000,6000,10000].forEach(ms=>{
    setTimeout(()=>{
      bootPass();
      if(ms===700 || ms===3000) askStateHub();
    },ms);
  });
}

boot();

})();
