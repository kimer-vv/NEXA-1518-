/* NEXA HOME COMPOSITOR V1.0 — SINGLE VISUAL ORDER OWNER — 2026-09-11
   COMPLETE NEW FILE: nexa-home-compositor-v1.js

   Owns ONLY:
   - Home signal stack DOM order.

   Final order:
   Live Event -> hidden legacy Pulse sink -> NEXA Pulse -> Alliance Signal -> Transfers

   Does NOT own:
   - Supabase data
   - card innerHTML
   - Administration
   - Home menu
   - My Profile
   - Alliances/emblems

   Safety:
   - No MutationObserver.
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_HOME_COMPOSITOR_V1__) return;
window.__NEXA_HOME_COMPOSITOR_V1__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const STACK_ID='nexa-home-signal-stack-v1';
let generation=0;

function visibleNode(id){
  return document.getElementById(id)||null;
}

function allianceCard(){
  return $('#nexa-v31-alliance') ||
    $$('section,article,div').find(el=>{
      const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!/\bALLIANCE SIGNAL\b/i.test(t)) return false;
      if(/\bLIVE EVENT\b|\bNEXA PULSE\b|\bTRANSFERS\b/i.test(t)) return false;
      return true;
    }) ||
    null;
}

function preferredParent(anchor){
  if(anchor?.parentNode) return anchor.parentNode;
  return $('#home') || $('main.shell') || $('main') || document.body;
}

function ensureStack(anchor){
  let stack=$('#'+STACK_ID);
  if(stack) return stack;

  stack=document.createElement('div');
  stack.id=STACK_ID;
  stack.dataset.nexaHomeOrderOwner='home-compositor-v1';
  stack.setAttribute('aria-label','NEXA Home signals');

  const parent=preferredParent(anchor);
  if(anchor?.parentNode===parent){
    parent.insertBefore(stack,anchor);
  }else{
    parent.appendChild(stack);
  }
  return stack;
}

function normalizeOldStack(newStack){
  const old=$('#nexa-home-signals-stable-stack');
  if(!old || old===newStack) return;

  Array.from(old.children).forEach(child=>{
    if(child && child!==newStack) newStack.appendChild(child);
  });

  if(!old.children.length) old.remove();
  else old.style.display='none';
}

function installCSS(){
  if($('#nexa-home-compositor-v1-css')) return;

  const s=document.createElement('style');
  s.id='nexa-home-compositor-v1-css';
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
      background:transparent!important;
      box-shadow:none!important;
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

    #${STACK_ID} > #nexa-v302-pulse{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      width:0!important;
      height:0!important;
      min-height:0!important;
      max-height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }
  `;
  document.head.appendChild(s);
}

function compose(){
  installCSS();

  const alliance=allianceCard();
  if(!alliance) return false;

  const stack=ensureStack(alliance);
  normalizeOldStack(stack);

  const live=visibleNode('nexa-v4937-live-event');
  const sink=visibleNode('nexa-v302-pulse');
  const pulse=visibleNode('nexa-pulse-visible-owner-v34');
  const transfer=visibleNode('nexa-v49-transfer-card');

  /*
    This is the ONLY place in the new Home architecture that re-parents
    sibling Home signal cards.
  */
  [live,sink,pulse,alliance,transfer].forEach(node=>{
    if(node && node!==stack && node.parentNode!==stack){
      stack.appendChild(node);
    }else if(node && node!==stack){
      /* appendChild is also used to normalize exact sibling order. */
      stack.appendChild(node);
    }
  });

  window.dispatchEvent(new CustomEvent('nexa:home-composed',{
    detail:{
      owner:'home-compositor-v1',
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

  [0,80,180,420,900,1800,3200,6000].forEach(ms=>{
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
