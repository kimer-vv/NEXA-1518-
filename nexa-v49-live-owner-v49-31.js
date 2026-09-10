/* NEXA V49.31 — LIVE EVENT FINAL OWNER TAKEOVER
   COMPLETE FILE

   Purpose:
   - Keep nexa-v49-state-hub.js as the State/Fleet/Admin owner.
   - Make the real #home-svs-section the final visible Home Live Event surface.
   - Repaint from the current live svs_events row after late Home renderers finish.
   - Retire only obsolete "No Live Event" surfaces outside the real card.

   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_V4931_LIVE_OWNER_TAKEOVER__) return;
window.__NEXA_V4931_LIVE_OWNER_TAKEOVER__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const ACTIVE_STATE_KEY='nexa_active_state_v49';

let localSb=null;
let lastLive=null;
let lastState=0;
let takeoverGeneration=0;

function sb(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  if(!localSb && window.supabase?.createClient){
    localSb=window.supabase.createClient(SB_URL,SB_KEY);
  }
  return localSb;
}

function stateNum(v){
  const n=Number(String(v??'').replace(/\D/g,''));
  return Number.isFinite(n)&&n>0?n:0;
}

function activeState(){
  let raw=window.NEXA_ACTIVE_STATE||null;
  if(!raw){
    try{ raw=window.localStorage?.getItem(ACTIVE_STATE_KEY)||null; }
    catch(_){}
  }
  return stateNum(raw||1518)||1518;
}

function normalizeText(el){
  return String(el?.textContent||'').replace(/\s+/g,' ').trim();
}

function realLiveSection(){
  return $('#home-svs-section');
}

function visibleRect(el){
  if(!el?.getBoundingClientRect) return false;
  const r=el.getBoundingClientRect();
  const cs=getComputedStyle(el);
  return r.width>0 && r.height>0 &&
    cs.display!=='none' &&
    cs.visibility!=='hidden' &&
    Number(cs.opacity||1)>0;
}

function chooseHomeMain(section){
  const directMain=$('main.shell');
  if(directMain) return directMain;
  return section?.closest?.('main') || $('#home') || $('main');
}

function restoreRealSurface(section){
  if(!section) return null;

  const homeMain=chooseHomeMain(section);
  const profile=$('#nexa-profile-launcher-section');

  if(homeMain && section.parentElement!==homeMain){
    if(profile && profile.parentElement===homeMain){
      profile.insertAdjacentElement('afterend',section);
    }else{
      const firstSignal=
        $('#nexa-v31-signals',homeMain) ||
        $('#nexa-v302-pulse',homeMain) ||
        $('#nexa-v31-alliance',homeMain);

      if(firstSignal?.parentElement===homeMain){
        firstSignal.insertAdjacentElement('beforebegin',section);
      }else{
        homeMain.prepend(section);
      }
    }
  }

  section.classList.remove('hidden');
  section.removeAttribute('hidden');
  section.setAttribute('aria-hidden','false');

  section.style.setProperty('display','block','important');
  section.style.setProperty('visibility','visible','important');
  section.style.setProperty('opacity','1','important');
  section.style.setProperty('pointer-events','auto','important');
  section.style.setProperty('position','relative','important');
  section.style.setProperty('width','100%','important');
  section.style.setProperty('height','auto','important');
  section.style.setProperty('min-height','1px','important');
  section.style.setProperty('overflow','visible','important');

  if(homeMain){
    homeMain.classList.remove('hidden');
    homeMain.removeAttribute('hidden');
    homeMain.setAttribute('aria-hidden','false');
    homeMain.style.setProperty('display','block','important');
    homeMain.style.setProperty('visibility','visible','important');
    homeMain.style.setProperty('opacity','1','important');
  }

  return section;
}

function retireObsoleteLiveSurfaces(section){
  if(!section) return;

  const candidates=new Set();

  $$('section,article,div').forEach(el=>{
    if(!el || el===section || section.contains(el) || el.contains(section)) return;
    if(el===document.body || el===document.documentElement) return;
    if(el.matches?.('main,main.shell,#home')) return;

    const text=normalizeText(el);
    if(!/\bNo Live Event\b/i.test(text)) return;

    const looksLikeLiveSurface=
      /\bLIVE EVENT\b/i.test(text) ||
      /\bUpcoming state events\b/i.test(text) ||
      /\bactive or upcoming event\b/i.test(text) ||
      /\bleadership publishes\b/i.test(text);

    if(!looksLikeLiveSurface) return;

    let card=el.closest?.(
      'section,.section,article,[data-nexa-tech="live"],[class*="event-card"],[class*="signal"]'
    ) || el;

    if(
      !card ||
      card===section ||
      section.contains(card) ||
      card.contains(section) ||
      card===document.body ||
      card===document.documentElement ||
      card.matches?.('main,main.shell,#home')
    ) return;

    candidates.add(card);
  });

  candidates.forEach(el=>{
    if(!visibleRect(el) && el.getAttribute('aria-hidden')==='true') return;
    el.setAttribute('aria-hidden','true');
    el.dataset.nexaRetiredLiveSurface='v49-31';
    el.style.setProperty('display','none','important');
    el.style.setProperty('visibility','hidden','important');
    el.style.setProperty('opacity','0','important');
    el.style.setProperty('pointer-events','none','important');
  });
}

function paintLive(live,st){
  if(!live || !st) return false;

  const section=restoreRealSurface(realLiveSection());
  if(!section) return false;

  retireObsoleteLiveSurfaces(section);

  const title=$('#home-event-title',section) || $('#home-event-title');
  const meta=$('#home-event-meta',section) || $('#home-event-meta');
  const count=$('#home-event-countdown',section) || $('#home-event-countdown');

  if(title){
    title.textContent=
      live.title ||
      `SvS vs State ${live.opponent_state||'—'}`;
  }

  if(meta){
    meta.textContent=`State ${st} • ${live.description||'Live Event'}`;
  }

  if(count){
    count.textContent='LIVE';
  }

  section.dataset.nexaLiveOwner='v49-31';
  section.dataset.nexaLiveEventId=String(live.id||'');

  try{
    window.NEXA_APPLY_LIVE_EVENT_THEME?.(
      live.live_event_payload?.theme ||
      live.live_event_payload?.event_key ||
      'svs'
    );
  }catch(_){}

  try{ window.NEXA_REFRESH_LIVE_EVENT_DETAILS?.(); }
  catch(_){}

  try{ window.NEXA_HOME_VISUALS_REFRESH?.(); }
  catch(_){}

  /* A visual refresher may restyle/move cards synchronously.
     Re-assert the real owner's final visibility immediately afterward. */
  section.classList.remove('hidden');
  section.removeAttribute('hidden');
  section.setAttribute('aria-hidden','false');
  section.style.setProperty('display','block','important');
  section.style.setProperty('visibility','visible','important');
  section.style.setProperty('opacity','1','important');
  section.style.setProperty('height','auto','important');
  section.style.setProperty('min-height','1px','important');

  if(title){
    title.textContent=
      live.title ||
      `SvS vs State ${live.opponent_state||'—'}`;
  }
  if(meta){
    meta.textContent=`State ${st} • ${live.description||'Live Event'}`;
  }
  if(count) count.textContent='LIVE';

  retireObsoleteLiveSurfaces(section);
  return true;
}

function scheduleFinalTakeover(live,st){
  if(!live || !st) return;

  lastLive=live;
  lastState=st;
  const generation=++takeoverGeneration;

  /* Fixed, finite hydration passes. This is not polling. */
  [0,120,350,700,1200,2000,3200,4800].forEach(ms=>{
    setTimeout(()=>{
      if(generation!==takeoverGeneration) return;
      try{ paintLive(live,st); }
      catch(err){
        console.warn('[NEXA V49.31] Live owner paint',err?.message||err);
      }
    },ms);
  });
}

async function fetchAndTakeover(){
  const st=activeState();
  const c=sb();

  if(!st || !c?.from) return;

  try{
    const {data:live,error}=await c
      .from('svs_events')
      .select('*')
      .eq('state_number',st)
      .eq('status','live')
      .eq('is_live',true)
      .order('updated_at',{ascending:false})
      .limit(1)
      .maybeSingle();

    if(error) throw error;

    if(!live){
      if(lastState===st){
        lastLive=null;
        takeoverGeneration++;
      }
      console.warn(`[NEXA V49.31] No live SvS event returned for State ${st}`);
      return;
    }

    scheduleFinalTakeover(live,st);

  }catch(err){
    console.warn(
      '[NEXA V49.31] Live Event takeover load failed',
      err?.message||err
    );
  }
}

function repaintCached(){
  if(lastLive && lastState){
    scheduleFinalTakeover(lastLive,lastState);
  }else{
    fetchAndTakeover();
  }
}

function boot(){
  fetchAndTakeover();

  window.addEventListener('load',()=>{
    repaintCached();
  },{once:true});

  window.addEventListener('pageshow',()=>{
    repaintCached();
  });

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) repaintCached();
  });

  window.addEventListener('nexa:active-state-changed',()=>{
    lastLive=null;
    lastState=0;
    takeoverGeneration++;
    fetchAndTakeover();
  });

  window.addEventListener('nexa:home-ready',()=>{
    repaintCached();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
