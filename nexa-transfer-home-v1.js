/* NEXA TRANSFER HOME V1.11 — PULSE ALLIANCE EXACT VISUAL / STABLE
   COMPLETE REPLACEMENT for: nexa-transfer-home-v1.js

   Goal:
   - ONE Home Transfers card only.
   - NO "Transfer Staff" / "Transfer Workspace" Home card.
   - When a transfer application is published/open, show it inside Transfers with:
       Open Form
       Copy Link
   - When nothing is published/open, show a compact empty state.
   - Match the Home signal card geometry used by NEXA Pulse / Alliance Signal / Live Event.

   Data ownership:
   - NEXA V49 State Hub still creates #nexa-v49-transfer-card.
   - This file owns only the member-facing Home content and visual normalization.

   Safety:
   - No MutationObserver.
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_TRANSFER_HOME_V111_PULSE_ALLIANCE_VISUAL__) return;
window.__NEXA_TRANSFER_HOME_V111_PULSE_ALLIANCE_VISUAL__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

let client=null;
let generation=0;
let lastPaintKey='';

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

function sb(){
  if(window.supabaseClient?.rpc)return window.supabaseClient;
  if(window.sb?.rpc)return window.sb;
  if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);
  return client;
}

function activeState(){
  return Number(
    window.NEXA_ACTIVE_STATE||
    localStorage.getItem('nexa_active_state_v49')||
    0
  );
}

function normalize(data){
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.get_transfer_center_cards))return data.get_transfer_center_cards;
  if(Array.isArray(data?.cards))return data.cards;
  if(data?.event_id)return[data];
  return[];
}

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function publicLink(row){
  return new URL(
    `transfer-form-v2.html?public=1&event=${encodeURIComponent(row.event_id)}`,
    location.href
  ).href;
}

async function copy(text,button){
  try{
    await navigator.clipboard.writeText(text);
    const old=button.textContent;
    button.textContent='Copied ✓';
    setTimeout(()=>button.textContent=old,1200);
  }catch(_){
    location.href=text;
  }
}

function installCSS(){
  if($('#nexa-transfer-home-v111-css')) return;

  const s=document.createElement('style');
  s.id='nexa-transfer-home-v111-css';
  s.textContent=`
    #nexa-v49-transfer-card{
      --tech:#ff9148;
      --tech-rgb:255,145,72;

      position:relative!important;
      isolation:isolate!important;
      overflow:hidden!important;

      width:100%!important;
      max-width:100%!important;
      min-height:64px!important;
      height:auto!important;

      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;

      border-radius:20px!important;
      border:1px solid rgba(var(--tech-rgb),.58)!important;

      background:
        radial-gradient(circle at 8% 0%,rgba(var(--tech-rgb),.10),transparent 34%),
        radial-gradient(circle at 92% 82%,rgba(86,84,255,.07),transparent 38%),
        linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))!important;

      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.018),
        inset 0 1px 0 rgba(var(--tech-rgb),.18),
        inset 0 0 28px rgba(var(--tech-rgb),.035),
        0 0 16px rgba(var(--tech-rgb),.13)!important;

      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    #nexa-v49-transfer-card::before{display:none!important}

    #nexa-v49-transfer-card::after{
      content:""!important;
      position:absolute!important;
      left:-1px!important;
      top:18px!important;
      width:3px!important;
      height:40px!important;
      border-radius:999px!important;
      background:#ff9d5c!important;
      box-shadow:0 0 7px rgba(255,157,92,.90),0 0 13px rgba(255,145,72,.52)!important;
      pointer-events:none!important;
      z-index:5!important;
    }

    #nexa-v49-transfer-card > .nexa-v49-transfer-kicker{
      margin:0 0 6px!important;
      padding:0!important;
      color:#ffab72!important;
      font-size:10px!important;
      font-weight:950!important;
      letter-spacing:.18em!important;
      line-height:1.1!important;
      text-transform:uppercase!important;
    }

    /* State Hub may paint this first. Keep its typography identical to the final
       V1.8 title so Safari never shows a large/small white-text jump. */
    #nexa-v49-transfer-card > h3{
      display:none!important;
      margin:0 0 5px!important;
      font-size:18px!important;
      line-height:1.15!important;
      font-weight:950!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events{
      position:relative!important;
      z-index:3!important;
      width:100%!important;
      margin:0!important;
      padding:0!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events > *,
    #nexa-v49-transfer-card #nexa-v49-transfer-events .event,
    #nexa-v49-transfer-card #nexa-v49-transfer-events .event-row,
    #nexa-v49-transfer-card #nexa-v49-transfer-events article{
      background:transparent!important;
      background-image:none!important;
      border:0!important;
      box-shadow:none!important;
      border-radius:0!important;
      padding:0!important;
      margin:0!important;
      min-height:0!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-title{
      margin:0 0 5px!important;
      color:#fff!important;
      font-size:18px!important;
      line-height:1.15!important;
      font-weight:900!important;
      letter-spacing:-.01em!important;
      font-family:inherit!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
      padding:0!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-copy{
      margin:0!important;
      color:#9aa8c3!important;
      font-size:13px!important;
      line-height:1.35!important;
      font-weight:400!important;
      letter-spacing:0!important;
      font-family:inherit!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
      padding:0!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-status{
      margin:4px 0 0!important;
      padding:0!important;
      color:#9aa8c3!important;
      font-size:13px!important;
      line-height:1.35!important;
      font-weight:400!important;
      letter-spacing:0!important;
      background:transparent!important;
      border:0!important;
      border-radius:0!important;
      box-shadow:none!important;
      font-family:inherit!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-actions{
      display:flex!important;
      gap:7px!important;
      flex-wrap:wrap!important;
      margin-top:9px!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-actions .btn{
      width:auto!important;
      min-height:34px!important;
      margin:0!important;
      padding:7px 11px!important;
      border-radius:10px!important;
      border:1px solid rgba(255,145,72,.32)!important;
      background:rgba(55,29,20,.48)!important;
      color:#ffd7bc!important;
      box-shadow:none!important;
      font-size:.64rem!important;
      line-height:1!important;
      font-weight:900!important;
      text-decoration:none!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v17-actions .btn.secondary{
      border-color:rgba(143,157,205,.25)!important;
      background:rgba(16,23,49,.78)!important;
      color:#bdc9e6!important;
    }

    /* There is no Transfer Staff/Home Workspace card in V1.7. */
    #nexa-transfer-workspace-card{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      max-height:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }

    /* Retire older Transfer shells / orange strip duplicates. */
    #home-transfers-section,
    #nexa-v430-transfer-card,
    #nexa-transfer-card,
    .nexa-v453-transfer,
    [data-nexa-transfer]:not(#nexa-v49-transfer-card){
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

function removeWorkspaceCard(){
  $('#nexa-transfer-workspace-card')?.remove();
}

function retireLegacy(){
  removeWorkspaceCard();

  const current=$('#nexa-v49-transfer-card');

  [
    '#home-transfers-section',
    '#nexa-v430-transfer-card',
    '#nexa-transfer-card',
    '.nexa-v453-transfer',
    '[data-nexa-transfer]'
  ].forEach(sel=>{
    $$(sel).forEach(el=>{
      if(!el || el===current || el.closest?.('#nexa-v49-transfer-card'))return;
      el.remove();
    });
  });
}

function emptyHTML(){
  return `
    <h3 class="nexa-transfer-v17-title">No transfer form published</h3>
    <p class="nexa-transfer-v17-copy">Transfer applications will appear here when leadership publishes them.</p>
  `;
}

function openHTML(row){
  const title=
    row?.title||
    row?.form_title||
    'Transfer Application';

  const open=
    row?.applications_open===true ||
    row?.public_access_enabled===true ||
    String(row?.status||'').toLowerCase()==='open';

  return `
    <h3 class="nexa-transfer-v17-title">${esc(title)}</h3>
    <p class="nexa-transfer-v17-copy">Transfer application for State ${esc(activeState()||'—')}.</p>
    ${open?`<p class="nexa-transfer-v17-status">OPEN • Applications Open</p>`:''}
    <div class="nexa-transfer-v17-actions">
      <a class="btn" href="${esc(publicLink(row))}">Open Form</a>
      <button class="btn secondary" type="button" data-nexa-transfer-copy>Copy Link</button>
    </div>
  `;
}

async function render(){
  installCSS();
  retireLegacy();

  const card=$('#nexa-v49-transfer-card');
  if(!card)return false;

  card.classList.add('nexa-v49-transfer-visible','nexa-v31-strip');
  card.classList.remove('hidden');
  card.setAttribute('aria-hidden','false');

  const host=$('#nexa-v49-transfer-events',card);
  if(!host)return false;

  const c=sb();
  const state=activeState();

  let row=null;

  if(c&&state){
    try{
      const result=await c.rpc('get_transfer_center_cards');
      const cards=normalize(result?.data);
      row=cards.find(x=>Number(x.destination_state)===state)||null;
    }catch(_){}
  }

  const paintKey=row
    ? `open:${row.event_id||''}:${row.title||row.form_title||''}:${row.status||''}:${row.applications_open===true}:${row.public_access_enabled===true}`
    : 'empty';

  const ownsPaint=!!host.querySelector('.nexa-transfer-v17-title');

  if(paintKey!==lastPaintKey || !ownsPaint){
    if(row){
      host.innerHTML=openHTML(row);
    }else{
      host.innerHTML=emptyHTML();
    }
    lastPaintKey=paintKey;
  }

  if(row){
    const copyBtn=$('[data-nexa-transfer-copy]',host);
    if(copyBtn && !copyBtn.dataset.nexaBound){
      const link=publicLink(row);
      copyBtn.dataset.nexaBound='1';
      copyBtn.onclick=e=>copy(link,e.currentTarget);
    }
  }

  removeWorkspaceCard();
  retireLegacy();
  return true;
}

/* Install the stable skin immediately when the deferred script executes.
   The data/card can arrive later; the visual rules are already present. */
installCSS();
removeWorkspaceCard();

function finitePasses(){
  const mine=++generation;

  [0,120,300,650,1100,1800,3000,5000,8000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation)return;
      render().catch(()=>{});
    },ms);
  });
}

window.addEventListener('nexa:home-ready',finitePasses);
window.addEventListener('nexa:active-state-changed',finitePasses);
window.addEventListener('pageshow',finitePasses);
window.addEventListener('load',finitePasses,{once:true});

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)finitePasses();
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',finitePasses,{once:true});
}else{
  finitePasses();
}

})();
