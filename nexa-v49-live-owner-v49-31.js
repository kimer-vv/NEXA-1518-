/* NEXA V49.41 — HOME SIGNALS TRUE TAKEOVER
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Fixes V49.40:
   - Uses the EXISTING #nexa-v31-signals as the one Home signal stack.
   - Does not nest a second stack inside an old Live Event card.
   - Removes old Pulse / Alliance / Transfer visual shells before creating new ones.
   - Keeps the stable IDs required by existing data modules.
   - One visual family for Live Event, NEXA Pulse, Alliance Signal, Transfers.
   - Live Event stays compact when inactive and expands when active.

   Data owners remain unchanged:
   - V49 State Hub: Live Event + Transfer state/data
   - nexa-pulse-forms-v1.js: Pulse forms + Battle Plan
   - nexa-transfer-home-v1.js: Transfer actions

   No MutationObserver.
   No indefinite polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4941_HOME_SIGNALS_TRUE_TAKEOVER__) return;
window.__NEXA_V4941_HOME_SIGNALS_TRUE_TAKEOVER__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const HOST_ID='nexa-v31-signals';
const LIVE_ID='nexa-v4941-live-event';
const PULSE_ID='nexa-v302-pulse';
const ALLIANCE_ID='nexa-v31-alliance';
const TRANSFER_ID='nexa-v49-transfer-card';

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
    month:'short',day:'numeric',year:'numeric',timeZone:'UTC'
  }).format(d);
}

function installCSS(){
  $('#nexa-v4940-home-signals-css')?.remove();
  if($('#nexa-v4941-home-signals-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v4941-home-signals-css';
  s.textContent=`
    #${HOST_ID}{
      display:grid!important;
      grid-template-columns:1fr!important;
      gap:10px!important;
      width:calc(100% - 32px)!important;
      max-width:760px!important;
      margin:12px auto 18px!important;
      box-sizing:border-box!important;
    }

    #${HOST_ID} > .nexa-v4941-card{
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

    #${HOST_ID} .nexa-v4941-top,
    #${HOST_ID} .nexa-v4941-left{
      position:absolute!important;
      z-index:8!important;
      pointer-events:none!important;
      display:block!important;
    }

    #${HOST_ID} .nexa-v4941-top{
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

    #${HOST_ID} .nexa-v4941-left{
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

    #${HOST_ID} .nexa-v4941-kicker{
      margin:0 0 6px!important;
      color:var(--nexa-accent)!important;
      font-size:.64rem!important;
      line-height:1.1!important;
      font-weight:950!important;
      letter-spacing:.16em!important;
      text-transform:uppercase!important;
    }

    #${HOST_ID} .nexa-v4941-title{
      margin:0!important;
      color:#fff!important;
      font-size:1.05rem!important;
      line-height:1.16!important;
      font-weight:950!important;
      letter-spacing:-.012em!important;
    }

    #${HOST_ID} .nexa-v4941-copy{
      margin-top:4px!important;
      color:#9aa8c3!important;
      font-size:.68rem!important;
      line-height:1.38!important;
    }

    #${HOST_ID} .nexa-v4941-content{
      min-width:0!important;
      width:100%!important;
    }

    #${PULSE_ID} #nexa-pulse-published-forms,
    #${PULSE_ID} #nexa-pulse-battle-plans{
      margin-top:10px!important;
    }

    #${LIVE_ID} .v4941-alliance-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:7px;
      margin-top:10px;
    }

    #${LIVE_ID} .v4941-mini{
      min-width:0;padding:8px 9px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;background:rgba(255,255,255,.022);
    }

    #${LIVE_ID} .v4941-mini span{
      display:block;margin-bottom:3px;color:#8290ad;
      font-size:.52rem;font-weight:900;letter-spacing:.10em;line-height:1.2;
    }

    #${LIVE_ID} .v4941-mini strong{
      display:block;color:#f4f7ff;font-size:.75rem;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }

    #${LIVE_ID} .v4941-schedule{
      display:grid;gap:6px;margin-top:10px;
    }

    #${LIVE_ID} .v4941-schedule-title{
      color:#8998b7;font-size:.54rem;font-weight:950;
      letter-spacing:.12em;margin-bottom:1px;
    }

    #${LIVE_ID} .v4941-row{
      display:grid;grid-template-columns:100px minmax(0,1fr);
      gap:9px;align-items:start;padding:8px 9px;border-radius:12px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.022);
    }

    #${LIVE_ID} .v4941-day{color:#ff9caf;font-size:.68rem;font-weight:950;line-height:1.2}
    #${LIVE_ID} .v4941-date{display:block;margin-top:2px;color:#77839f;font-size:.57rem;font-weight:850;line-height:1.25}
    #${LIVE_ID} .v4941-focus{color:#eef2ff;font-size:.72rem;font-weight:900;line-height:1.28}
    #${LIVE_ID} .v4941-ministry{margin-top:2px;color:#9aa8c3;font-size:.64rem;line-height:1.3}
    #${LIVE_ID} .v4941-time{margin-top:3px;color:#f4b45f;font-size:.62rem;font-weight:850;line-height:1.32}

    /* Retired visual shells only. */
    #home-svs-section,
    #home-transfers-section,
    #nexa-v430-transfer-card,
    #nexa-transfer-card,
    .nexa-v453-transfer,
    #nexa-v4937-live-event,
    #nexa-v4935-live-event,
    #nexa-v4934-live-event,
    #nexa-v4933-live-event,
    #nexa-v4940-home-signals,
    [data-nexa-home-retired="v49-41"]{
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
      #${HOST_ID}{width:calc(100% - 32px)!important}
      #${LIVE_ID} .v4941-row{grid-template-columns:90px minmax(0,1fr)}
    }
  `;
  document.head.appendChild(s);
}

function accents(){
  return `<span class="nexa-v4941-top" aria-hidden="true"></span>
          <span class="nexa-v4941-left" aria-hidden="true"></span>`;
}

function makeCard({id,tech,kicker,title,copy}){
  const el=document.createElement('section');
  el.id=id;
  el.className='section nexa-v477-tech-card nexa-v4941-card';
  el.dataset.nexaTech=tech;
  el.dataset.nexaUnifiedOwner='v49-41';
  el.innerHTML=`
    ${accents()}
    <div class="nexa-v4941-content">
      <div class="nexa-v4941-kicker">${esc(kicker)}</div>
      <h2 class="nexa-v4941-title">${esc(title)}</h2>
      <div class="nexa-v4941-copy">${esc(copy)}</div>
    </div>
  `;
  return el;
}

function host(){
  return $('#'+HOST_ID);
}

function capturePulseBoxes(){
  const boxes=[];
  ['nexa-pulse-published-forms','nexa-pulse-battle-plans'].forEach(id=>{
    const node=$('#'+id);
    if(node) boxes.push(node);
  });
  return boxes;
}

function readAlliance(){
  const old=$$(`#${ALLIANCE_ID}`)
    .find(el=>el?.dataset?.nexaUnifiedOwner!=='v49-41');

  if(!old) return {
    title:'No alliance event published',
    copy:'Foundry, Canyon and alliance strategy updates will appear here.'
  };

  const heads=$$('h1,h2,h3,b,strong',old)
    .map(x=>clean(x.textContent))
    .filter(Boolean)
    .filter(x=>!/ALLIANCE SIGNAL/i.test(x));

  const body=$$('.muted,small,p',old)
    .map(x=>clean(x.textContent))
    .filter(Boolean)
    .filter(x=>!/ALLIANCE SIGNAL/i.test(x));

  return {
    title:heads[0]||'No alliance event published',
    copy:body[0]||'Foundry, Canyon and alliance strategy updates will appear here.'
  };
}

function removeOldVisuals(h){
  const protectedIds=new Set([
    'nexa-pulse-published-forms',
    'nexa-pulse-battle-plans'
  ]);

  Array.from(h.children).forEach(el=>{
    if(protectedIds.has(el.id)) return;
    el.remove();
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
    '#nexa-v4933-live-event',
    '#nexa-v4940-home-signals'
  ].forEach(sel=>$$(sel).forEach(el=>{
    if(!h.contains(el)) el.remove();
  }));
}

function takeover(){
  const h=host();
  if(!h) return false;

  installCSS();

  if(h.dataset.nexaUnifiedOwner==='v49-41') return true;

  const pulseBoxes=capturePulseBoxes();
  const alliance=readAlliance();

  removeOldVisuals(h);

  const live=makeCard({
    id:LIVE_ID,tech:'live',kicker:'LIVE EVENT',
    title:'No Live Event',
    copy:'Upcoming state events, schedules and forms will appear here when leadership publishes them.'
  });

  const pulse=makeCard({
    id:PULSE_ID,tech:'pulse',kicker:'NEXA PULSE',
    title:'Signals & response requests',
    copy:'Forms, surveys and requests appear here when leadership publishes them.'
  });

  pulseBoxes.forEach(n=>pulse.appendChild(n));

  const allianceCard=makeCard({
    id:ALLIANCE_ID,tech:'alliance',kicker:'ALLIANCE SIGNAL',
    title:alliance.title,copy:alliance.copy
  });

  const transfer=makeCard({
    id:TRANSFER_ID,tech:'transfer',kicker:'TRANSFERS',
    title:'Transfer Center',
    copy:'Transfer cycles and recruiting information will appear here when active.'
  });

  const transferHost=document.createElement('div');
  transferHost.id='nexa-v49-transfer-events';
  transferHost.style.marginTop='4px';
  $('.nexa-v4941-content',transfer).appendChild(transferHost);

  h.append(live,pulse,allianceCard,transfer);
  h.dataset.nexaUnifiedOwner='v49-41';

  return true;
}

function ours(id){
  const h=host();
  if(!h) return null;
  return $$(`#${id}`,h).find(el=>el?.dataset?.nexaUnifiedOwner==='v49-41')||null;
}

function renderEmptyLive(){
  const card=ours(LIVE_ID);
  if(!card) return false;

  card.innerHTML=`
    ${accents()}
    <div class="nexa-v4941-content">
      <div class="nexa-v4941-kicker">LIVE EVENT</div>
      <h2 class="nexa-v4941-title">No Live Event</h2>
      <div class="nexa-v4941-copy">Upcoming state events, schedules and forms will appear here when leadership publishes them.</div>
    </div>
  `;
  return true;
}

function renderLive(live){
  if(!live) return renderEmptyLive();

  const card=ours(LIVE_ID);
  if(!card) return false;

  const p=payloadOf(live);
  const schedule=Array.isArray(p.schedule)?p.schedule:[];
  const star=p.star_alliance?.tag||'—';
  const presidency=p.presidency_alliance?.tag||'—';

  const rows=schedule.map(row=>`
    <div class="v4941-row">
      <div>
        <div class="v4941-day">${esc(row?.day||'')}</div>
        ${row?.date?`<span class="v4941-date">${esc(fmtDate(row.date))}</span>`:''}
      </div>
      <div>
        <div class="v4941-focus">${esc(row?.focus||'')}</div>
        ${row?.ministry?`<div class="v4941-ministry">${esc(row.ministry)}</div>`:''}
        ${(row?.time_utc||row?.secondary)?`<div class="v4941-time">${[row?.time_utc,row?.secondary].filter(Boolean).map(esc).join(' • ')}</div>`:''}
      </div>
    </div>
  `).join('');

  card.innerHTML=`
    ${accents()}
    <div class="nexa-v4941-content">
      <div class="nexa-v4941-kicker">LIVE EVENT</div>
      <h2 class="nexa-v4941-title">${esc(live.title||'SvS')}</h2>

      <div class="v4941-alliance-grid">
        <div class="v4941-mini"><span>GOING FOR THE STAR</span><strong>${esc(star)}</strong></div>
        <div class="v4941-mini"><span>UP FOR PRESIDENCY</span><strong>${esc(presidency)}</strong></div>
      </div>

      ${rows?`<div class="v4941-schedule"><div class="v4941-schedule-title">SVS SCHEDULE</div>${rows}</div>`:''}
    </div>
  `;

  return true;
}

function syncLive(){
  const live=window.NEXA_CURRENT_LIVE_EVENT;
  return live&&typeof live==='object' ? renderLive(live) : renderEmptyLive();
}

function cleanupDuplicates(){
  const h=host();
  if(!h) return;

  [PULSE_ID,ALLIANCE_ID,TRANSFER_ID].forEach(id=>{
    $$(`#${id}`).forEach(el=>{
      if(h.contains(el) && el.dataset?.nexaUnifiedOwner==='v49-41') return;
      el.remove();
    });
  });

  $$(`#${LIVE_ID}`).forEach(el=>{
    if(h.contains(el)) return;
    el.remove();
  });
}

function recoverPulseBoxes(){
  const pulse=ours(PULSE_ID);
  if(!pulse) return;

  ['nexa-pulse-published-forms','nexa-pulse-battle-plans'].forEach(id=>{
    $$(`#${id}`).forEach(node=>{
      if(!pulse.contains(node)) pulse.appendChild(node);
    });
  });
}

async function requestOwners(){
  try{
    if(typeof window.NEXA_SYNC_STATE_HOME==='function'){
      await window.NEXA_SYNC_STATE_HOME();
    }
  }catch(err){
    console.warn('[NEXA V49.41] Home sync failed',err?.message||err);
  }

  takeover();
  syncLive();
  recoverPulseBoxes();
  cleanupDuplicates();
}

function finitePasses(){
  const mine=++generation;

  [0,120,300,650,1100,1800,3000,5000,8000,12000].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;

      if(index<=3){
        await requestOwners();
      }else{
        takeover();
        syncLive();
        recoverPulseBoxes();
        cleanupDuplicates();
      }
    },ms);
  });
}

function boot(){
  installCSS();

  /* Wait only until the real Home signals host exists. */
  const tryBoot=()=>{
    if(takeover()){
      syncLive();
      cleanupDuplicates();
      finitePasses();
      return true;
    }
    return false;
  };

  if(!tryBoot()){
    [100,250,500,900,1400,2200].forEach(ms=>setTimeout(tryBoot,ms));
  }

  window.addEventListener('nexa:live-event-ready',e=>{
    takeover();
    const live=e?.detail?.live;
    if(live&&typeof live==='object') renderLive(live);
    else renderEmptyLive();
    cleanupDuplicates();
  });

  window.addEventListener('nexa:home-ready',finitePasses);
  window.addEventListener('pageshow',finitePasses);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) finitePasses();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
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
