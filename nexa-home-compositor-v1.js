/* NEXA HOME COMPOSITOR V1.3 — STATIC HOME SLOT OWNER — 2026-09-12
   COMPLETE REPLACEMENT for: nexa-home-compositor-v1.js

   Owns ONLY:
   - Home signal sibling order inside the static #nexa-home-signal-slot.

   Final visible order:
   Live Event -> NEXA Pulse -> Alliance Signal -> Transfers

   V1.3 correction:
   - Does NOT discover or create its own structural host.
   - Does NOT depend on Alliance Signal existing before composition.
   - Uses one static slot declared directly in index.html before the Home footer.
   - Moves every available current signal surface into that slot.
   - Re-runs on the existing Home/surface lifecycle events and finite startup passes.
   - No MutationObserver and no indefinite layout polling.

   Does NOT own:
   - Supabase data
   - card innerHTML
   - Administration
   - Home menu
   - My Profile
   - Alliances/emblems
   - Alliance Signal data
*/
(()=>{
'use strict';

if(window.__NEXA_HOME_COMPOSITOR_V13__) return;
window.__NEXA_HOME_COMPOSITOR_V13__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const SLOT_ID='nexa-home-signal-slot';
let generation=0;

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
}

function slot(){
  return $('#'+SLOT_ID);
}

function liveCard(){
  return $('#nexa-v4937-live-event');
}

function pulseCard(){
  return $('#nexa-pulse-visible-owner-v34');
}

function transferCard(){
  return $('#nexa-v49-transfer-card');
}

function allianceCard(){
  const exact=$('#nexa-v31-alliance');
  if(exact) return exact;

  return $$('section,article,div').find(el=>{
    if(el.id==='nexa-v4937-live-event' ||
       el.id==='nexa-pulse-visible-owner-v34' ||
       el.id==='nexa-v49-transfer-card' ||
       el.id===SLOT_ID) return false;

    const t=clean(el.textContent);
    if(!/\bALLIANCE SIGNAL\b/i.test(t)) return false;
    if(/\bLIVE EVENT\b|\bNEXA PULSE\b|\bTRANSFERS\b/i.test(t)) return false;

    const containsOfficial=el.querySelector?.(
      '#nexa-v4937-live-event,#nexa-pulse-visible-owner-v34,#nexa-v49-transfer-card'
    );
    return !containsOfficial;
  }) || null;
}

function installCSS(){
  if($('#nexa-home-compositor-v13-css')) return;

  $('#nexa-home-compositor-v1-css')?.remove();
  $('#nexa-home-compositor-v11-css')?.remove();
  $('#nexa-home-compositor-v12-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-home-compositor-v13-css';
  s.textContent=`
    #${SLOT_ID}{
      display:flex!important;
      flex-direction:column!important;
      gap:10px!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:12px 0 18px!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    #${SLOT_ID} > #nexa-v4937-live-event,
    #${SLOT_ID} > #nexa-pulse-visible-owner-v34,
    #${SLOT_ID} > #nexa-v31-alliance,
    #${SLOT_ID} > #nexa-v49-transfer-card{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:0!important;
      box-sizing:border-box!important;
    }

    #${SLOT_ID} > #nexa-v302-pulse,
    #home-svs-section,
    #home-transfers-section,
    [data-nexa-home-legacy-retired="v13"]{
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

    #nexa-home-signal-stack-v1,
    #nexa-home-signal-stack-v12,
    #nexa-home-signals-stable-stack{
      display:none!important;
    }
  `;
  document.head.appendChild(s);
}

function retireKnownLegacy(){
  const live=liveCard();
  const pulse=pulseCard();
  const transfer=transferCard();

  $('#home-svs-section')?.setAttribute('data-nexa-home-legacy-retired','v13');
  $('#home-transfers-section')?.setAttribute('data-nexa-home-legacy-retired','v13');

  [
    '#nexa-pulse-owner-v24',
    '#nexa-pulse-owner-v25',
    '#nexa-pulse-owner-v26',
    '#nexa-pulse-owner-v27',
    '#nexa-v430-transfer-card',
    '#nexa-transfer-card',
    '.nexa-v453-transfer'
  ].forEach(sel=>{
    $$(sel).forEach(el=>{
      if(el===live || el===pulse || el===transfer) return;
      el.setAttribute('data-nexa-home-legacy-retired','v13');
      el.setAttribute('aria-hidden','true');
    });
  });

  $$('section,article').forEach(el=>{
    if(el===live || el===pulse || el===transfer) return;
    if(live && (el.contains(live) || live.contains(el))) return;
    if(pulse && (el.contains(pulse) || pulse.contains(el))) return;
    if(transfer && (el.contains(transfer) || transfer.contains(el))) return;

    const t=clean(el.textContent);

    const staleNoLive=
      /\bLIVE EVENT\b/i.test(t) &&
      /\bNo Live Event\b/i.test(t) &&
      /\bUpcoming state events\b/i.test(t);

    const stalePulse=
      /\bNEXA PULSE\b/i.test(t) &&
      /\bSignals & response requests\b/i.test(t) &&
      /\bForms, surveys and requests appear here\b/i.test(t);

    if(staleNoLive || stalePulse){
      el.setAttribute('data-nexa-home-legacy-retired','v13');
      el.setAttribute('aria-hidden','true');
    }
  });
}

function rescueFromOldStacks(target){
  [
    '#nexa-home-signal-stack-v1',
    '#nexa-home-signal-stack-v12',
    '#nexa-home-signals-stable-stack'
  ].forEach(sel=>{
    const old=$(sel);
    if(!old || old===target) return;

    Array.from(old.children).forEach(child=>{
      if([
        'nexa-v4937-live-event',
        'nexa-v302-pulse',
        'nexa-pulse-visible-owner-v34',
        'nexa-v31-alliance',
        'nexa-v49-transfer-card'
      ].includes(child.id)){
        target.appendChild(child);
      }
    });

    if(!old.children.length) old.remove();
  });
}

function compose(){
  installCSS();

  const target=slot();
  if(!target) return false;

  rescueFromOldStacks(target);
  retireKnownLegacy();

  const live=liveCard();
  const sink=$('#nexa-v302-pulse');
  const pulse=pulseCard();
  const alliance=allianceCard();
  const transfer=transferCard();

  /*
    Compose whatever exists right now.
    Alliance is NOT required for Live/Pulse/Transfer to be positioned.
  */
  [live,sink,pulse,alliance,transfer].forEach(node=>{
    if(node && node!==target){
      target.appendChild(node);
    }
  });

  retireKnownLegacy();

  window.dispatchEvent(new CustomEvent('nexa:home-composed',{
    detail:{
      owner:'home-compositor-v1.3',
      slot:SLOT_ID,
      live:!!live,
      pulse:!!pulse,
      alliance:!!alliance,
      transfer:!!transfer
    }
  }));

  return true;
}

function finitePasses(){
  const mine=++generation;

  [0,80,180,420,900,1800,3200,6000,10000,15000,25000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation) return;
      compose();
    },ms);
  });
}

window.NEXA_HOME_COMPOSE=compose;

window.addEventListener('nexa:home-surface-ready',compose);
window.addEventListener('nexa:home-ready',finitePasses);
window.addEventListener('nexa:active-state-changed',finitePasses);
window.addEventListener('nexa:live-event-ready',compose);
window.addEventListener('pageshow',finitePasses);
window.addEventListener('load',finitePasses,{once:true});

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden) finitePasses();
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',finitePasses,{once:true});
}else{
  finitePasses();
}

})();
