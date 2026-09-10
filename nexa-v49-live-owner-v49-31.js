/* NEXA V49.32 — LIVE EVENT VISUAL OWNER
   COMPLETE REPLACEMENT FILE
   File: nexa-v49-live-owner-v49-31.js

   Architecture:
   - nexa-v49-state-hub.js remains the ONLY data owner for Home Live Event.
   - This file performs NO Supabase query.
   - It asks V49 to sync, then only restores/locks the already-painted real card.
   - It retires stale duplicate "No Live Event" surfaces outside the real card.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4932_LIVE_VISUAL_OWNER__) return;
window.__NEXA_V4932_LIVE_VISUAL_OWNER__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

let generation=0;
let lastGood={
  title:'',
  meta:'',
  count:''
};

function text(el){
  return String(el?.textContent||'').replace(/\s+/g,' ').trim();
}

function section(){
  return $('#home-svs-section');
}

function homeMain(sec){
  return $('main.shell') || sec?.closest?.('main') || $('#home') || $('main');
}

function rememberPaint(sec){
  if(!sec) return false;

  const title=$('#home-event-title',sec) || $('#home-event-title');
  const meta=$('#home-event-meta',sec) || $('#home-event-meta');
  const count=$('#home-event-countdown',sec) || $('#home-event-countdown');

  const t=text(title);
  const m=text(meta);
  const c=text(count);

  const isRealLive=
    !!t &&
    !/^No Live Event$/i.test(t) &&
    !/^V49 TRACE\b/i.test(t) &&
    !/^State Hub Setup Incomplete$/i.test(t);

  if(!isRealLive) return false;

  lastGood={
    title:t,
    meta:m,
    count:c||'LIVE'
  };
  return true;
}

function restoreRealCard(){
  const sec=section();
  if(!sec) return null;

  const main=homeMain(sec);
  const profile=$('#nexa-profile-launcher-section');

  if(main && sec.parentElement!==main){
    if(profile && profile.parentElement===main){
      profile.insertAdjacentElement('afterend',sec);
    }else{
      const anchor=
        $('#nexa-v31-signals',main) ||
        $('#nexa-v302-pulse',main) ||
        $('#nexa-v31-alliance',main);

      if(anchor?.parentElement===main){
        anchor.insertAdjacentElement('beforebegin',sec);
      }else{
        main.prepend(sec);
      }
    }
  }

  sec.classList.remove('hidden');
  sec.removeAttribute('hidden');
  sec.setAttribute('aria-hidden','false');
  sec.dataset.nexaLiveVisualOwner='v49-32';

  sec.style.setProperty('display','block','important');
  sec.style.setProperty('visibility','visible','important');
  sec.style.setProperty('opacity','1','important');
  sec.style.setProperty('pointer-events','auto','important');
  sec.style.setProperty('position','relative','important');
  sec.style.setProperty('width','100%','important');
  sec.style.setProperty('height','auto','important');
  sec.style.setProperty('min-height','1px','important');
  sec.style.setProperty('overflow','visible','important');

  if(main){
    main.classList.remove('hidden');
    main.removeAttribute('hidden');
    main.setAttribute('aria-hidden','false');
    main.style.setProperty('visibility','visible','important');
    main.style.setProperty('opacity','1','important');
  }

  return sec;
}

function restoreLastGood(sec){
  if(!sec || !lastGood.title) return false;

  const title=$('#home-event-title',sec) || $('#home-event-title');
  const meta=$('#home-event-meta',sec) || $('#home-event-meta');
  const count=$('#home-event-countdown',sec) || $('#home-event-countdown');

  const current=text(title);

  if(
    !current ||
    /^No Live Event$/i.test(current) ||
    /^V49 TRACE\b/i.test(current)
  ){
    if(title) title.textContent=lastGood.title;
    if(meta) meta.textContent=lastGood.meta;
    if(count) count.textContent=lastGood.count||'LIVE';
  }

  return true;
}

function retireLegacyNoLive(sec){
  if(!sec) return;

  $$('section,article,div').forEach(el=>{
    if(!el || el===sec || sec.contains(el) || el.contains(sec)) return;
    if(el===document.body || el===document.documentElement) return;
    if(el.matches?.('main,main.shell,#home')) return;

    const raw=text(el);
    if(!/\bNo Live Event\b/i.test(raw)) return;

    const looksLegacy=
      /\bLIVE EVENT\b/i.test(raw) ||
      /\bUpcoming state events\b/i.test(raw) ||
      /\bactive or upcoming event\b/i.test(raw) ||
      /\bleadership publishes\b/i.test(raw);

    if(!looksLegacy) return;

    const card=el.closest?.(
      'section,.section,article,[data-nexa-tech="live"],[class*="event-card"],[class*="signal"]'
    ) || el;

    if(
      !card ||
      card===sec ||
      sec.contains(card) ||
      card.contains(sec) ||
      card===document.body ||
      card===document.documentElement ||
      card.matches?.('main,main.shell,#home')
    ) return;

    card.dataset.nexaRetiredLiveSurface='v49-32';
    card.setAttribute('aria-hidden','true');
    card.style.setProperty('display','none','important');
    card.style.setProperty('visibility','hidden','important');
    card.style.setProperty('opacity','0','important');
    card.style.setProperty('pointer-events','none','important');
  });
}

function lockVisual(){
  const sec=restoreRealCard();
  if(!sec) return false;

  rememberPaint(sec);
  restoreLastGood(sec);
  retireLegacyNoLive(sec);

  /* A visual refresher may restyle or move cards synchronously. */
  try{ window.NEXA_HOME_VISUALS_REFRESH?.(); }
  catch(_){}

  restoreRealCard();
  restoreLastGood(sec);
  retireLegacyNoLive(sec);

  return true;
}

async function syncFromV49(){
  const owner=window.NEXA_SYNC_STATE_HOME;

  if(typeof owner!=='function'){
    return false;
  }

  try{
    await owner();
  }catch(err){
    console.warn(
      '[NEXA V49.32] V49 Home sync failed',
      err?.message||err
    );
  }

  lockVisual();
  return true;
}

function scheduleFinitePasses(){
  const mine=++generation;

  [0,120,350,700,1200,2000,3200,4800].forEach((ms,index)=>{
    setTimeout(async()=>{
      if(mine!==generation) return;

      /*
        First passes ask V49 to refresh its data-owned surface.
        Later passes are visual-only so this file never becomes a second data owner.
      */
      if(index<=2){
        await syncFromV49();
      }else{
        lockVisual();
      }
    },ms);
  });
}

function boot(){
  scheduleFinitePasses();

  window.addEventListener('load',()=>{
    scheduleFinitePasses();
  },{once:true});

  window.addEventListener('pageshow',()=>{
    scheduleFinitePasses();
  });

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) scheduleFinitePasses();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    lastGood={title:'',meta:'',count:''};
    scheduleFinitePasses();
  });

  window.addEventListener('nexa:home-ready',()=>{
    scheduleFinitePasses();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
