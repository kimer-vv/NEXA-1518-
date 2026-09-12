/* NEXA HOME COMPOSITOR V1.2 — ROOT-LEVEL SIGNAL STACK — 2026-09-12
   COMPLETE REPLACEMENT for: nexa-home-compositor-v1.js

   Owns ONLY:
   - Home signal sibling order.

   Final visible order:
   Live Event -> NEXA Pulse -> Alliance Signal -> Transfers

   V1.2 correction:
   - #nexa-v31-signals is treated as a LEGACY REFERENCE, not as the new host.
   - The new canonical stack is created at the SAME HOME LEVEL as
     #nexa-v31-signals, immediately before it.
   - Current Live/Pulse/Alliance/Transfer cards are moved into that one
     root-level stack.
   - This prevents Live Event from being appended below the footer and avoids
     nesting the signal cards inside an Alliance visual wrapper.

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
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_HOME_COMPOSITOR_V12__) return;
window.__NEXA_HOME_COMPOSITOR_V12__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const STACK_ID='nexa-home-signal-stack-v12';
let generation=0;

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
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

  return $$('section,article').find(el=>{
    if(el.id==='nexa-v4937-live-event' ||
       el.id==='nexa-pulse-visible-owner-v34' ||
       el.id==='nexa-v49-transfer-card') return false;

    const t=clean(el.textContent);
    if(!/\bALLIANCE SIGNAL\b/i.test(t)) return false;
    if(/\bLIVE EVENT\b|\bNEXA PULSE\b|\bTRANSFERS\b/i.test(t)) return false;

    return !el.querySelector?.(
      '#nexa-v4937-live-event,#nexa-pulse-visible-owner-v34,#nexa-v49-transfer-card'
    );
  }) || null;
}

function homeRoot(){
  return $('#home') ||
         $('[data-page="home"]') ||
         $('main.shell') ||
         $('main') ||
         document.body;
}

function legacySignals(){
  return $('#nexa-v31-signals');
}

function structuralHost(){
  const legacy=legacySignals();

  /*
    This is intentionally the PARENT of the known Home signals wrapper,
    never the parent of Alliance Signal itself.
  */
  if(legacy?.parentNode?.nodeType===1){
    return {
      host:legacy.parentNode,
      reference:legacy
    };
  }

  /*
    If the legacy wrapper is absent, use a known Home-level footer as the
    insertion reference so the canonical stack stays above the footer.
  */
  const root=homeRoot();
  const footer=
    $('.footer',root) ||
    $('footer',root) ||
    $('.home-footer',root) ||
    null;

  return {
    host:root,
    reference:footer
  };
}

function installCSS(){
  if($('#nexa-home-compositor-v12-css')) return;

  $('#nexa-home-compositor-v1-css')?.remove();
  $('#nexa-home-compositor-v11-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-home-compositor-v12-css';
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
    [data-nexa-home-legacy-retired="v12"]{
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

    #nexa-v31-signals[data-nexa-v12-empty-shell="1"]{
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

function ensureStack(){
  const {host,reference}=structuralHost();
  let stack=$('#'+STACK_ID);

  if(!stack){
    stack=document.createElement('div');
    stack.id=STACK_ID;
    stack.dataset.nexaHomeOrderOwner='home-compositor-v1.2';
    stack.setAttribute('aria-label','NEXA Home signals');
  }

  if(stack.parentNode!==host){
    if(reference?.parentNode===host){
      host.insertBefore(stack,reference);
    }else{
      host.appendChild(stack);
    }
  }else if(reference?.parentNode===host && stack.nextElementSibling!==reference){
    host.insertBefore(stack,reference);
  }

  return stack;
}

function retireKnownLegacy(){
  const live=liveCard();
  const pulse=pulseCard();
  const transfer=transferCard();

  $('#home-svs-section')?.setAttribute('data-nexa-home-legacy-retired','v12');
  $('#home-transfers-section')?.setAttribute('data-nexa-home-legacy-retired','v12');

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
      el.setAttribute('data-nexa-home-legacy-retired','v12');
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
      el.setAttribute('data-nexa-home-legacy-retired','v12');
      el.setAttribute('aria-hidden','true');
    }
  });
}

function cleanOldCompositorShells(newStack){
  ['#nexa-home-signal-stack-v1','#nexa-home-signals-stable-stack'].forEach(sel=>{
    const old=$(sel);
    if(!old || old===newStack) return;

    Array.from(old.children).forEach(child=>{
      if([
        'nexa-v4937-live-event',
        'nexa-v302-pulse',
        'nexa-pulse-visible-owner-v34',
        'nexa-v31-alliance',
        'nexa-v49-transfer-card'
      ].includes(child.id)){
        newStack.appendChild(child);
      }
    });

    if(!old.children.length){
      old.remove();
    }else{
      old.style.display='none';
    }
  });
}

function markLegacyShellIfEmpty(){
  const legacy=legacySignals();
  if(!legacy) return;

  const officialInside=legacy.querySelector(
    '#nexa-v4937-live-event,#nexa-pulse-visible-owner-v34,#nexa-v31-alliance,#nexa-v49-transfer-card'
  );

  if(!officialInside){
    legacy.dataset.nexaV12EmptyShell='1';
    legacy.setAttribute('aria-hidden','true');
  }else{
    delete legacy.dataset.nexaV12EmptyShell;
  }
}

function compose(){
  installCSS();
  retireKnownLegacy();

  const alliance=allianceCard();
  if(!alliance) return false;

  const stack=ensureStack();
  cleanOldCompositorShells(stack);

  const live=liveCard();
  const sink=$('#nexa-v302-pulse');
  const pulse=pulseCard();
  const transfer=transferCard();

  /*
    This is the only routine that sets sibling order.
    Appending an existing node moves it; it does not duplicate it.
  */
  [live,sink,pulse,alliance,transfer].forEach(node=>{
    if(node && node!==stack){
      stack.appendChild(node);
    }
  });

  retireKnownLegacy();
  markLegacyShellIfEmpty();

  window.dispatchEvent(new CustomEvent('nexa:home-composed',{
    detail:{
      owner:'home-compositor-v1.2',
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

  [0,80,180,420,900,1800,3200,6000,10000,15000].forEach(ms=>{
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
