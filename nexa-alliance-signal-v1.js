/* NEXA ALLIANCE SIGNAL V1.0 — CONTENT OWNER — 2026-09-12
   NEW FILE: nexa-alliance-signal-v1.js

   Owns ONLY:
   - #nexa-v31-alliance
   - Alliance Signal visible content

   Uses the existing alliance schedule RPC:
   - nexa_get_alliance_event_schedule

   Home order belongs to nexa-home-compositor-v1.js.

   Behavior:
   - Shows the signed-in player's alliance schedule.
   - Supports Bear Trap, Foundry, Canyon and custom scheduled alliance events.
   - If nothing is scheduled, shows a clean "No alliance event published" state.
   - No MutationObserver.
   - No structural positioning of Live/Pulse/Transfers.
*/
(()=>{
'use strict';

if(window.__NEXA_ALLIANCE_SIGNAL_V10__) return;
window.__NEXA_ALLIANCE_SIGNAL_V10__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

const CARD_ID='nexa-v31-alliance';

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

let localSb=null;
let generation=0;

function sb(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  if(!localSb && window.supabase?.createClient){
    localSb=window.supabase.createClient(SB_URL,SB_KEY);
  }
  return localSb;
}

function installCSS(){
  if($('#nexa-alliance-signal-v10-css')) return;

  const s=document.createElement('style');
  s.id='nexa-alliance-signal-v10-css';
  s.textContent=`
    #${CARD_ID}{
      --tech:#d75cff;
      --tech-rgb:215,92,255;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      min-height:64px!important;
      height:auto!important;
      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;
      border-radius:20px!important;
      border:1px solid rgba(var(--tech-rgb),.34)!important;
      background:
        radial-gradient(circle at 8% 8%,rgba(var(--tech-rgb),.07),transparent 34%),
        linear-gradient(145deg,rgba(29,8,43,.95),rgba(8,7,27,.985))!important;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.012),0 0 9px rgba(var(--tech-rgb),.035)!important;
      position:relative!important;
      overflow:hidden!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    #${CARD_ID}::after{
      content:"";
      position:absolute;
      left:-1px;
      top:18px;
      width:3px;
      height:40px;
      border-radius:999px;
      background:#df6cff;
      box-shadow:0 0 5px rgba(223,108,255,.82),0 0 10px rgba(215,92,255,.38);
      pointer-events:none;
    }

    #${CARD_ID} .nexa-alliance-kicker{
      margin:0 0 6px!important;
      color:#ec8cff!important;
      font-size:10px!important;
      font-weight:950!important;
      letter-spacing:.18em!important;
      line-height:1.1!important;
      text-transform:uppercase!important;
    }

    #${CARD_ID} .nexa-alliance-title{
      margin:0 0 5px!important;
      color:#fff!important;
      font-size:16px!important;
      line-height:1.15!important;
      font-weight:900!important;
    }

    #${CARD_ID} .nexa-alliance-copy{
      margin:0!important;
      color:#aaa1bd!important;
      font-size:12px!important;
      line-height:1.35!important;
    }

    #${CARD_ID} .nexa-alliance-list{
      display:grid!important;
      gap:7px!important;
      margin-top:10px!important;
    }

    #${CARD_ID} .nexa-alliance-event{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      gap:10px!important;
      align-items:center!important;
      min-width:0!important;
      padding:9px 10px!important;
      border:1px solid rgba(224,113,255,.18)!important;
      border-radius:13px!important;
      background:rgba(255,255,255,.025)!important;
    }

    #${CARD_ID} .nexa-alliance-event b{
      display:block!important;
      color:#f7f0ff!important;
      font-size:12px!important;
      line-height:1.25!important;
    }

    #${CARD_ID} .nexa-alliance-event small{
      display:block!important;
      margin-top:2px!important;
      color:#9f94b5!important;
      font-size:9px!important;
      line-height:1.3!important;
    }

    #${CARD_ID} .nexa-alliance-time{
      color:#eab1ff!important;
      font-size:10px!important;
      font-weight:950!important;
      white-space:nowrap!important;
      text-align:right!important;
    }
  `;
  document.head.appendChild(s);
}

function ensureCard(){
  installCSS();

  let card=$('#'+CARD_ID);
  if(!card){
    card=document.createElement('section');
    card.id=CARD_ID;
    card.className='section nexa-v31-strip';
    card.dataset.nexaTech='alliance';
    card.dataset.nexaAllianceOwner='v1.0';
    card.setAttribute('aria-live','polite');

    card.innerHTML=`
      <div class="nexa-alliance-kicker">ALLIANCE SIGNAL</div>
      <h3 class="nexa-alliance-title">No alliance event published</h3>
      <p class="nexa-alliance-copy">Foundry, Canyon and alliance schedule updates will appear here.</p>
    `;
  }

  $$(`[id="${CARD_ID}"]`).forEach(el=>{
    if(el!==card) el.remove();
  });

  const target=$('#nexa-home-signal-slot');
  if(target && card.parentNode!==target) target.appendChild(card);

  return card;
}

function announceReady(){
  window.dispatchEvent(new CustomEvent('nexa:home-surface-ready',{
    detail:{surface:'alliance',id:CARD_ID}
  }));
  try{window.NEXA_HOME_COMPOSE?.()}catch(_){}
}

function normalizeSlots(slots){
  if(!Array.isArray(slots)) return [];

  return slots.map(slot=>{
    if(typeof slot==='string'){
      return {time:slot,label:''};
    }

    return {
      time:String(
        slot?.time_utc ??
        slot?.time ??
        slot?.utc ??
        slot?.start_time ??
        ''
      ).trim(),
      label:String(
        slot?.label ??
        slot?.team ??
        slot?.name ??
        slot?.note ??
        ''
      ).trim()
    };
  }).filter(x=>x.time || x.label);
}

function normalizeSchedule(data){
  const events=Array.isArray(data?.events)?data.events:[];
  return events
    .map((event,index)=>({
      key:String(event?.key||event?.event_key||`event_${index}`),
      name:String(event?.name||event?.title||event?.key||'Alliance Event'),
      slots:normalizeSlots(event?.slots),
      sortOrder:Number(event?.sortOrder??event?.sort_order??index)
    }))
    .filter(event=>event.slots.length>0)
    .sort((a,b)=>a.sortOrder-b.sortOrder);
}

async function mainAlliance(){
  const c=sb();
  if(!c) return null;

  const {data:{user},error:userError}=await c.auth.getUser();
  if(userError || !user) return null;

  const {data,error}=await c
    .from('player_accounts')
    .select('id,is_main,alliance_id,custom_alliance_tag,alliances(id,tag)')
    .eq('user_id',user.id)
    .order('is_main',{ascending:false})
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if(error) throw error;

  const allianceId=Number(data?.alliance_id || data?.alliances?.id || 0);

  return {
    id:allianceId,
    tag:data?.alliances?.tag || data?.custom_alliance_tag || ''
  };
}

async function loadSchedule(allianceId){
  const c=sb();
  if(!c || !allianceId) return [];

  const {data,error}=await c.rpc(
    'nexa_get_alliance_event_schedule',
    {p_alliance_id:Number(allianceId)}
  );

  if(error) throw error;
  return normalizeSchedule(data);
}

function renderEmpty(card,tag=''){
  card.innerHTML=`
    <div class="nexa-alliance-kicker">ALLIANCE SIGNAL${tag?` · ${esc(tag)}`:''}</div>
    <h3 class="nexa-alliance-title">No alliance event published</h3>
    <p class="nexa-alliance-copy">Foundry, Canyon and alliance schedule updates will appear here.</p>
  `;
}

function renderEvents(card,events,tag=''){
  const rows=events.map(event=>{
    const times=event.slots
      .map(slot=>slot.time)
      .filter(Boolean)
      .join(' / ');

    const labels=event.slots
      .map(slot=>slot.label)
      .filter(Boolean)
      .join(' · ');

    return `
      <div class="nexa-alliance-event">
        <div>
          <b>${esc(event.name)}</b>
          ${labels?`<small>${esc(labels)}</small>`:''}
        </div>
        <div class="nexa-alliance-time">${esc(times || 'Scheduled')}</div>
      </div>
    `;
  }).join('');

  card.innerHTML=`
    <div class="nexa-alliance-kicker">ALLIANCE SIGNAL${tag?` · ${esc(tag)}`:''}</div>
    <h3 class="nexa-alliance-title">Alliance schedule</h3>
    <p class="nexa-alliance-copy">Current recurring event times for your alliance.</p>
    <div class="nexa-alliance-list">${rows}</div>
  `;
}

async function render(){
  const card=ensureCard();
  announceReady();

  try{
    const alliance=await mainAlliance();

    if(!alliance?.id){
      renderEmpty(card,alliance?.tag||'');
      announceReady();
      return true;
    }

    const events=await loadSchedule(alliance.id);

    if(events.length){
      renderEvents(card,events,alliance.tag);
    }else{
      renderEmpty(card,alliance.tag);
    }
  }catch(err){
    console.warn('[NEXA Alliance Signal V1.0]',err?.message||err);
    renderEmpty(card,'');
  }

  announceReady();
  return true;
}

function finitePasses(){
  const mine=++generation;

  [0,250,800,2000,5000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation) return;
      render().catch(()=>{});
    },ms);
  });
}

window.NEXA_REFRESH_ALLIANCE_SIGNAL=()=>render();

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

/* Schedule freshness only; no Home layout ownership. */
setInterval(()=>render().catch(()=>{}),60000);

})();
