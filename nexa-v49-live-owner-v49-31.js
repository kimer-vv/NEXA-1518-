/* NEXA V49.33 — CLEAN LIVE EVENT SURFACE
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Architecture:
   - nexa-v49-state-hub.js remains the ONLY data owner.
   - This file performs ZERO Supabase queries.
   - It calls V49's exposed sync owner, reads only the result V49 painted,
     then renders one brand-new Home Live Event surface.
   - The legacy #home-svs-section is no longer used as the visible card.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4933_CLEAN_LIVE_SURFACE__) return;
window.__NEXA_V4933_CLEAN_LIVE_SURFACE__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const NEW_ID='nexa-live-event-v4933';
let generation=0;
let lastSnapshot=null;

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
}

function isUsefulTitle(v){
  const t=clean(v);
  return !!t &&
    !/^No Live Event$/i.test(t) &&
    !/^V49 TRACE\b/i.test(t) &&
    !/^State Hub Setup Incomplete$/i.test(t);
}

function parseOpponent(title){
  const m=clean(title).match(/\b(?:vs\.?|versus)\s*(?:State\s*)?(\d+)\b/i);
  return m?.[1]||'';
}

function readV49Snapshot(){
  const legacy=$('#home-svs-section');
  const title=
    clean($('#home-event-title',legacy)?.textContent) ||
    clean($('#home-event-title')?.textContent);

  if(!isUsefulTitle(title)) return null;

  const meta=
    clean($('#home-event-meta',legacy)?.textContent) ||
    clean($('#home-event-meta')?.textContent);

  const count=
    clean($('#home-event-countdown',legacy)?.textContent) ||
    clean($('#home-event-countdown')?.textContent) ||
    'LIVE';

  let state='';
  const stateMatch=meta.match(/\bState\s+(\d+)\b/i);
  if(stateMatch) state=stateMatch[1];

  const snapshot={
    title,
    meta,
    count,
    stateNumber:state,
    opponentState:parseOpponent(title)
  };

  lastSnapshot=snapshot;

  window.NEXA_CURRENT_LIVE_EVENT={
    title:snapshot.title,
    description:snapshot.meta,
    opponent_state:snapshot.opponentState||null,
    state_number:snapshot.stateNumber||null,
    source:'v49-dom-bridge'
  };

  try{
    window.dispatchEvent(new CustomEvent('nexa:live-event-ready',{
      detail:{
        live:window.NEXA_CURRENT_LIVE_EVENT,
        stateNumber:snapshot.stateNumber||null
      }
    }));
  }catch(_){}

  return snapshot;
}

function homeMain(){
  return $('main.shell') || $('#home') || $('main');
}

function ensureNewSurface(){
  let card=$('#'+NEW_ID);
  if(card) return card;

  const main=homeMain();
  if(!main) return null;

  card=document.createElement('section');
  card.id=NEW_ID;
  card.className='nexa-v4933-live-card';
  card.setAttribute('aria-live','polite');
  card.innerHTML=`
    <div class="nexa-v4933-kicker">
      <span class="nexa-v4933-dot" aria-hidden="true"></span>
      LIVE EVENT
    </div>

    <div class="nexa-v4933-main">
      <div class="nexa-v4933-copy">
        <h2 class="nexa-v4933-title">Loading Live Event…</h2>
        <p class="nexa-v4933-meta">Syncing current State event.</p>
      </div>
      <div class="nexa-v4933-status">LIVE</div>
    </div>

    <div class="nexa-v4933-facts" hidden>
      <div class="nexa-v4933-fact nexa-v4933-state-wrap">
        <span>STATE</span>
        <strong class="nexa-v4933-state">—</strong>
      </div>
      <div class="nexa-v4933-fact nexa-v4933-opponent-wrap">
        <span>OPPONENT</span>
        <strong class="nexa-v4933-opponent">—</strong>
      </div>
    </div>
  `;

  const profile=$('#nexa-profile-launcher-section',main);
  const signals=$('#nexa-v31-signals',main);

  if(profile?.parentElement===main){
    profile.insertAdjacentElement('afterend',card);
  }else if(signals?.parentElement===main){
    signals.insertAdjacentElement('beforebegin',card);
  }else{
    main.prepend(card);
  }

  return card;
}

function installCSS(){
  if($('#nexa-v4933-live-css')) return;

  const style=document.createElement('style');
  style.id='nexa-v4933-live-css';
  style.textContent=`
    #${NEW_ID}{
      display:none;
      box-sizing:border-box;
      width:100%;
      margin:10px 0 12px;
      padding:17px 18px 16px;
      border:1px solid rgba(255,82,109,.32);
      border-radius:20px;
      background:
        radial-gradient(circle at 0% 0%,rgba(255,82,109,.13),transparent 35%),
        radial-gradient(circle at 100% 100%,rgba(48,118,255,.10),transparent 36%),
        linear-gradient(145deg,rgba(11,18,40,.96),rgba(6,10,25,.96));
      box-shadow:
        0 0 0 1px rgba(255,255,255,.025) inset,
        0 12px 30px rgba(0,0,0,.20),
        0 0 26px rgba(255,82,109,.07);
      color:#fff;
      position:relative;
      z-index:25;
      overflow:hidden;
      visibility:visible;
      opacity:1;
    }

    #${NEW_ID}.is-live{display:block!important}

    #${NEW_ID} .nexa-v4933-kicker{
      display:flex;
      align-items:center;
      gap:7px;
      margin-bottom:10px;
      font-size:.68rem;
      line-height:1;
      font-weight:950;
      letter-spacing:.13em;
      color:#ff8da0;
    }

    #${NEW_ID} .nexa-v4933-dot{
      width:7px;
      height:7px;
      border-radius:50%;
      background:#ff526d;
      box-shadow:0 0 11px rgba(255,82,109,.85);
      flex:0 0 auto;
    }

    #${NEW_ID} .nexa-v4933-main{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:14px;
    }

    #${NEW_ID} .nexa-v4933-copy{
      min-width:0;
      flex:1;
    }

    #${NEW_ID} .nexa-v4933-title{
      margin:0;
      font-size:clamp(1.22rem,5.8vw,1.6rem);
      line-height:1.12;
      letter-spacing:-.025em;
      color:#fff;
    }

    #${NEW_ID} .nexa-v4933-meta{
      margin:7px 0 0;
      color:#aebbd6;
      font-size:.78rem;
      line-height:1.42;
    }

    #${NEW_ID} .nexa-v4933-status{
      flex:0 0 auto;
      border:1px solid rgba(255,98,123,.42);
      border-radius:999px;
      padding:6px 9px;
      background:rgba(104,13,38,.40);
      color:#ff9caf;
      font-size:.62rem;
      line-height:1;
      font-weight:950;
      letter-spacing:.08em;
    }

    #${NEW_ID} .nexa-v4933-facts{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px;
      margin-top:13px;
      padding-top:12px;
      border-top:1px solid rgba(255,255,255,.075);
    }

    #${NEW_ID} .nexa-v4933-facts[hidden]{display:none!important}

    #${NEW_ID} .nexa-v4933-fact{
      display:grid;
      gap:3px;
      min-width:0;
    }

    #${NEW_ID} .nexa-v4933-fact span{
      color:#7584a8;
      font-size:.57rem;
      font-weight:900;
      letter-spacing:.10em;
    }

    #${NEW_ID} .nexa-v4933-fact strong{
      color:#eef4ff;
      font-size:.82rem;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    /* Legacy Live Event is data staging only. It is never the visible Home card. */
    #home-svs-section{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }

    [data-nexa-retired-live-surface="v49-33"]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }
  `;

  document.head.appendChild(style);
}

function retireLegacyVisibleCards(){
  const keep=$('#'+NEW_ID);

  $$('section,article,div').forEach(el=>{
    if(!el || el===keep || keep?.contains(el) || el.contains(keep)) return;
    if(el===document.body || el===document.documentElement) return;
    if(el.matches?.('main,main.shell,#home')) return;
    if(el.id==='home-svs-section' || $('#home-svs-section')?.contains(el)) return;

    const raw=clean(el.textContent);
    if(!/\bNo Live Event\b/i.test(raw)) return;

    const looksLikeLegacy=
      /\bLIVE EVENT\b/i.test(raw) ||
      /\bUpcoming state events\b/i.test(raw) ||
      /\bleadership publishes\b/i.test(raw) ||
      /\bactive or upcoming event\b/i.test(raw);

    if(!looksLikeLegacy) return;

    const card=el.closest?.(
      'section,.section,article,[data-nexa-tech="live"],[class*="event-card"],[class*="signal"]'
    ) || el;

    if(
      !card ||
      card===keep ||
      keep?.contains(card) ||
      card.contains(keep) ||
      card===document.body ||
      card===document.documentElement ||
      card.matches?.('main,main.shell,#home')
    ) return;

    card.dataset.nexaRetiredLiveSurface='v49-33';
    card.setAttribute('aria-hidden','true');
  });
}

function render(snapshot){
  if(!snapshot) return false;

  const card=ensureNewSurface();
  if(!card) return false;

  const title=$('.nexa-v4933-title',card);
  const meta=$('.nexa-v4933-meta',card);
  const status=$('.nexa-v4933-status',card);
  const facts=$('.nexa-v4933-facts',card);
  const state=$('.nexa-v4933-state',card);
  const opponent=$('.nexa-v4933-opponent',card);
  const stateWrap=$('.nexa-v4933-state-wrap',card);
  const opponentWrap=$('.nexa-v4933-opponent-wrap',card);

  if(title) title.textContent=snapshot.title;
  if(meta) meta.textContent=snapshot.meta||'Live State event';
  if(status) status.textContent=snapshot.count||'LIVE';

  let hasFact=false;

  if(snapshot.stateNumber){
    if(state) state.textContent=snapshot.stateNumber;
    if(stateWrap) stateWrap.hidden=false;
    hasFact=true;
  }else if(stateWrap){
    stateWrap.hidden=true;
  }

  if(snapshot.opponentState){
    if(opponent) opponent.textContent=`State ${snapshot.opponentState}`;
    if(opponentWrap) opponentWrap.hidden=false;
    hasFact=true;
  }else if(opponentWrap){
    opponentWrap.hidden=true;
  }

  if(facts) facts.hidden=!hasFact;

  card.classList.add('is-live');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  retireLegacyVisibleCards();
  return true;
}

function hideNewSurface(){
  const card=$('#'+NEW_ID);
  if(!card) return;
  card.classList.remove('is-live');
  card.setAttribute('aria-hidden','true');
}

async function syncOnce(){
  const owner=window.NEXA_SYNC_STATE_HOME;

  if(typeof owner!=='function'){
    return false;
  }

  try{
    await owner();
  }catch(err){
    console.warn('[NEXA V49.33] V49 sync failed',err?.message||err);
    return false;
  }

  const snapshot=readV49Snapshot();

  if(snapshot){
    render(snapshot);
    return true;
  }

  if(lastSnapshot && isUsefulTitle(lastSnapshot.title)){
    render(lastSnapshot);
    return true;
  }

  hideNewSurface();
  return false;
}

function scheduleFiniteSync(){
  const mine=++generation;

  [0,150,400,850,1500,2600,4200].forEach(ms=>{
    setTimeout(async()=>{
      if(mine!==generation) return;
      await syncOnce();
    },ms);
  });
}

function boot(){
  installCSS();
  ensureNewSurface();
  retireLegacyVisibleCards();
  scheduleFiniteSync();

  window.addEventListener('load',scheduleFiniteSync,{once:true});
  window.addEventListener('pageshow',scheduleFiniteSync);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) scheduleFiniteSync();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    lastSnapshot=null;
    hideNewSurface();
    scheduleFiniteSync();
  });

  window.addEventListener('nexa:home-ready',scheduleFiniteSync);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
