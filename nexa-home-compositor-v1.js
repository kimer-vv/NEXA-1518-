/* NEXA HOME COMPOSITOR V1.4 — SINGLE STRUCTURAL OWNER — 2026-09-12
   COMPLETE REPLACEMENT for: nexa-home-compositor-v1.js

   Sole structural owner for Home signals.

   Final visible order:
   Live Event -> NEXA Pulse -> Alliance Signal -> Transfers

   V1.4 ownership consolidation:
   - Permanently removes the retired static #home-svs-section and #home-transfers-section.
   - State Hub remains a DATA provider only from the compositor's point of view.
   - Exposes NEXA_HOME_VISUALS_REFRESH = compose so existing State Hub refresh calls
     hand structural control back to this compositor instead of becoming a competing owner.
   - Reclaims Transfer if State Hub temporarily inserts it beside Alliance.
   - Reclaims Live/Pulse/Alliance/Transfer into one canonical static slot.
   - Does not depend on Alliance existing before positioning the other cards.
   - No MutationObserver.
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.

   Does NOT own:
   - Supabase data
   - card innerHTML/content
   - Administration
   - Home menu
   - My Profile
   - Alliances/emblems
   - Alliance Signal data
*/
(()=>{
'use strict';

if(window.__NEXA_HOME_COMPOSITOR_V14__) return;
window.__NEXA_HOME_COMPOSITOR_V14__=true;

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
    if(
      el.id==='nexa-v4937-live-event' ||
      el.id==='nexa-pulse-visible-owner-v34' ||
      el.id==='nexa-v49-transfer-card' ||
      el.id===SLOT_ID
    ) return false;

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
  if($('#nexa-home-compositor-v14-css')) return;

  [
    '#nexa-home-compositor-v1-css',
    '#nexa-home-compositor-v11-css',
    '#nexa-home-compositor-v12-css',
    '#nexa-home-compositor-v13-css'
  ].forEach(sel=>$(sel)?.remove());

  const s=document.createElement('style');
  s.id='nexa-home-compositor-v14-css';
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
    [data-nexa-home-legacy-retired="v14"]{
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

function removeRetiredStaticSurfaces(){
  /*
    These two old index.html sections are no longer allowed to exist in runtime.
    Removing them is intentional: State Hub can still publish Home data/events,
    but it has no retired DOM surface left to move or resurrect.
  */
  $$('#home-svs-section').forEach(el=>el.remove());
  $$('#home-transfers-section').forEach(el=>el.remove());
}

function retireKnownLegacy(){
  removeRetiredStaticSurfaces();

  const live=liveCard();
  const pulse=pulseCard();
  const transfer=transferCard();

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
      el.setAttribute('data-nexa-home-legacy-retired','v14');
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
      el.setAttribute('data-nexa-home-legacy-retired','v14');
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
  removeRetiredStaticSurfaces();

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
    Structural ownership is absolute here.
    Any temporary sibling placement performed by a data/content module is
    normalized back into this canonical order on every compositor pass.
  */
  [live,sink,pulse,alliance,transfer].forEach(node=>{
    if(node && node!==target){
      target.appendChild(node);
    }
  });

  retireKnownLegacy();

  window.dispatchEvent(new CustomEvent('nexa:home-composed',{
    detail:{
      owner:'home-compositor-v1.4',
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

  /*
    Finite startup reconciliation only.
    Covers async auth/state/content hydration without permanent polling.
  */
  [0,80,180,420,900,1800,3200,6000,10000,15000,25000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation) return;
      compose();
    },ms);
  });
}

/*
  Official structural API.
  Existing State Hub calls NEXA_HOME_VISUALS_REFRESH after its own data/content work.
  From V1.4 onward that call explicitly returns structural ownership here.
*/
window.NEXA_HOME_COMPOSE=compose;
window.NEXA_HOME_VISUALS_REFRESH=compose;

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
