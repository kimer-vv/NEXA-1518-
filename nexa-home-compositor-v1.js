/* NEXA HOME COMPOSITOR V1.1 — CANONICAL HOME SIGNAL HOST — 2026-09-12
   COMPLETE REPLACEMENT for: nexa-home-compositor-v1.js

   Owns ONLY:
   - Home signal sibling order.

   Final visible order:
   Live Event -> NEXA Pulse -> Alliance Signal -> Transfers

   Important correction from V1.0:
   - NEVER uses Alliance Signal's parent as the global Home host.
   - Prefers the canonical #nexa-v31-signals host.
   - Falls back only to known Home-level hosts.
   - Retires stale legacy Live/Pulse/Transfer cards without wrapping the
     current cards inside Alliance or another visual signal card.

   Does NOT own:
   - Supabase data
   - card innerHTML
   - Administration
   - Home menu
   - My Profile
   - Alliances/emblems
   - Alliance Signal data

   Safety:
   - No MutationObserver.
   - No indefinite layout polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_HOME_COMPOSITOR_V11__) return;
window.__NEXA_HOME_COMPOSITOR_V11__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const STACK_ID='nexa-home-signal-stack-v1';
let generation=0;

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
}

function currentLive(){
  return $('#nexa-v4937-live-event');
}

function currentPulse(){
  return $('#nexa-pulse-visible-owner-v34');
}

function currentTransfer(){
  return $('#nexa-v49-transfer-card');
}

function exactAlliance(){
  return $('#nexa-v31-alliance');
}

/*
  Fallback Alliance discovery is deliberately restricted to leaf-like
  section/article elements. We never accept a broad DIV wrapper because
  that was the V1.0 nesting bug visible on iPhone.
*/
function fallbackAlliance(){
  return $$('section,article').find(el=>{
    if(el.id==='nexa-v4937-live-event' ||
       el.id==='nexa-pulse-visible-owner-v34' ||
       el.id==='nexa-v49-transfer-card') return false;

    const t=clean(el.textContent);
    if(!/\bALLIANCE SIGNAL\b/i.test(t)) return false;
    if(/\bLIVE EVENT\b|\bNEXA PULSE\b|\bTRANSFERS\b/i.test(t)) return false;

    const nestedOfficial=
      el.querySelector?.('#nexa-v4937-live-event,#nexa-pulse-visible-owner-v34,#nexa-v49-transfer-card');

    return !nestedOfficial;
  }) || null;
}

function allianceCard(){
  return exactAlliance() || fallbackAlliance();
}

function homeRoot(){
  return $('#home') ||
         $('[data-page="home"]') ||
         $('main.shell') ||
         $('main') ||
         document.body;
}

function canonicalHost(){
  const explicit=$('#nexa-v31-signals');
  if(explicit) return explicit;

  /*
    Known legacy signal cards are safer host hints than Alliance's parent.
    Their parent historically represents the Home signals region.
  */
  const legacyLive=$('#home-svs-section');
  if(legacyLive?.parentNode && legacyLive.parentNode.nodeType===1){
    return legacyLive.parentNode;
  }

  const legacyTransfer=$('#home-transfers-section');
  if(legacyTransfer?.parentNode && legacyTransfer.parentNode.nodeType===1){
    return legacyTransfer.parentNode;
  }

  return homeRoot();
}

function installCSS(){
  if($('#nexa-home-compositor-v11-css')) return;

  $('#nexa-home-compositor-v1-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-home-compositor-v11-css';
  s.textContent=`
    #${STACK_ID}{
      display:flex!important;
      flex-direction:column!important;
      gap:10px!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    #${STACK_ID} > #nexa-v4937-live-event,
    #${STACK_ID} > #nexa-pulse-visible-owner-v34,
    #${STACK_ID} > #nexa-v31-alliance,
    #${STACK_ID} > #nexa-v49-transfer-card{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:0!important;
      box-sizing:border-box!important;
    }

    #${STACK_ID} > #nexa-v302-pulse,
    #home-svs-section,
    #home-transfers-section,
    [data-nexa-home-legacy-retired="v11"]{
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

function ensureStack(host,reference){
  let stack=$('#'+STACK_ID);

  /*
    V1.0 may already have placed the stack inside the wrong visual wrapper.
    Move the stack itself to the canonical host before moving any cards.
  */
  if(stack){
    if(stack.parentNode!==host){
      if(reference?.parentNode===host){
        host.insertBefore(stack,reference);
      }else{
        host.appendChild(stack);
      }
    }
    return stack;
  }

  stack=document.createElement('div');
  stack.id=STACK_ID;
  stack.dataset.nexaHomeOrderOwner='home-compositor-v1.1';
  stack.setAttribute('aria-label','NEXA Home signals');

  if(reference?.parentNode===host){
    host.insertBefore(stack,reference);
  }else{
    host.appendChild(stack);
  }

  return stack;
}

function rescueOfficialCardsFromWrongWrappers(stack){
  /*
    If V1.0 caused the official cards to sit inside a visual Alliance wrapper,
    appendChild below extracts them into the canonical sibling stack.
    This function additionally strips V1.0 ownership styling from wrappers.
  */
  const oldStable=$('#nexa-home-signals-stable-stack');
  if(oldStable && oldStable!==stack){
    Array.from(oldStable.children).forEach(child=>{
      if([
        'nexa-v4937-live-event',
        'nexa-v302-pulse',
        'nexa-pulse-visible-owner-v34',
        'nexa-v31-alliance',
        'nexa-v49-transfer-card'
      ].includes(child.id)){
        stack.appendChild(child);
      }
    });

    if(!oldStable.children.length) oldStable.remove();
    else oldStable.style.display='none';
  }
}

function retireKnownLegacy(){
  const live=currentLive();
  const pulse=currentPulse();
  const transfer=currentTransfer();

  $('#home-svs-section')?.setAttribute('data-nexa-home-legacy-retired','v11');
  $('#home-transfers-section')?.setAttribute('data-nexa-home-legacy-retired','v11');

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
      el.setAttribute('data-nexa-home-legacy-retired','v11');
      el.setAttribute('aria-hidden','true');
    });
  });

  /*
    Catch the two exact stale cards visible in the screenshots, but only
    section/article candidates that are NOT ancestors/descendants of the
    official current surfaces. This avoids hiding broad Home wrappers.
  */
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
      el.setAttribute('data-nexa-home-legacy-retired','v11');
      el.setAttribute('aria-hidden','true');
    }
  });
}

function compose(){
  installCSS();
  retireKnownLegacy();

  const alliance=allianceCard();
  if(!alliance) return false;

  const host=canonicalHost();

  /*
    Never allow the selected host to be one of the four signal cards or a
    descendant of one. If that ever happens, fall all the way back to Home.
  */
  const official=[currentLive(),currentPulse(),alliance,currentTransfer()].filter(Boolean);
  let safeHost=host;

  if(official.some(card=>card===safeHost || card.contains?.(safeHost))){
    safeHost=homeRoot();
  }

  const stack=ensureStack(safeHost,alliance);
  rescueOfficialCardsFromWrongWrappers(stack);

  const live=currentLive();
  const sink=$('#nexa-v302-pulse');
  const pulse=currentPulse();
  const transfer=currentTransfer();

  /*
    Single structural owner. These nodes become siblings, in exact order.
    The hidden sink remains only for compatibility and consumes no layout.
  */
  [live,sink,pulse,alliance,transfer].forEach(node=>{
    if(node && node!==stack){
      stack.appendChild(node);
    }
  });

  retireKnownLegacy();

  window.dispatchEvent(new CustomEvent('nexa:home-composed',{
    detail:{
      owner:'home-compositor-v1.1',
      hostId:safeHost.id||null,
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

  [0,80,180,420,900,1800,3200,6000,10000].forEach(ms=>{
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

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden) finitePasses();
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',finitePasses,{once:true});
}else{
  finitePasses();
}

})();
