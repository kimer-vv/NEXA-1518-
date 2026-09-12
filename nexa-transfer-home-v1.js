/* NEXA TRANSFER HOME V1.14 — CONTENT OWNER ONLY — 2026-09-11
   COMPLETE REPLACEMENT for: nexa-transfer-home-v1.js

   Data/shell ownership:
   - NEXA V49 State Hub creates #nexa-v49-transfer-card.
   - NEXA V49 State Hub may continue writing its hidden #nexa-v49-transfer-events sink.

   Visible ownership:
   - This file alone writes #nexa-transfer-home-surface.

   DOES NOT:
   - position the Transfer card relative to Alliance/Pulse/Live.
   - own Home order.

   Home order is owned by nexa-home-compositor-v1.js.

   Safety:
   - No MutationObserver.
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_TRANSFER_HOME_V114_CONTENT_ONLY__) return;
window.__NEXA_TRANSFER_HOME_V114_CONTENT_ONLY__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

let client=null;
let generation=0;
let lastPaintKey='';

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

function sb(){
  if(window.supabaseClient?.rpc) return window.supabaseClient;
  if(window.sb?.rpc) return window.sb;
  if(!client&&window.supabase?.createClient){
    client=window.supabase.createClient(SB_URL,SB_KEY);
  }
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
  if(Array.isArray(data)) return data;
  if(Array.isArray(data?.get_transfer_center_cards)) return data.get_transfer_center_cards;
  if(Array.isArray(data?.cards)) return data.cards;
  if(data?.event_id) return [data];
  return [];
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
  if($('#nexa-transfer-home-v114-css')) return;

  const s=document.createElement('style');
  s.id='nexa-transfer-home-v114-css';
  s.textContent=`
    #nexa-v49-transfer-card{
      --tech:#ff9148;
      --tech-rgb:255,145,72;
      position:relative!important;
      isolation:isolate!important;
      overflow:visible!important;
      width:100%!important;
      max-width:100%!important;
      min-height:116px!important;
      height:auto!important;
      max-height:none!important;
      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;
      border-radius:20px!important;
      border:1px solid rgba(var(--tech-rgb),.34)!important;
      background:
        radial-gradient(circle at 8% 0%,rgba(var(--tech-rgb),.10),transparent 34%),
        radial-gradient(circle at 92% 82%,rgba(86,84,255,.07),transparent 38%),
        linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))!important;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.018),
        inset 0 1px 0 rgba(var(--tech-rgb),.18),
        inset 0 0 28px rgba(var(--tech-rgb),.035),
        0 0 9px rgba(var(--tech-rgb),.035)!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    #nexa-v49-transfer-card::before{
      display:none!important;
    }

    #nexa-v49-transfer-card::after{
      content:""!important;
      position:absolute!important;
      left:-1px!important;
      top:18px!important;
      width:3px!important;
      height:40px!important;
      border-radius:999px!important;
      background:#ff9d5c!important;
      box-shadow:0 0 5px rgba(255,157,92,.80),0 0 10px rgba(255,145,72,.36)!important;
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

    #nexa-v49-transfer-card > h3{
      display:none!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      position:absolute!important;
      width:1px!important;
      height:1px!important;
      min-height:0!important;
      max-height:1px!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }

    #nexa-v49-transfer-card #nexa-transfer-home-surface{
      position:relative!important;
      z-index:3!important;
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v18-title{
      margin:0 0 5px!important;
      color:#fff!important;
      font-size:16px!important;
      line-height:1.15!important;
      font-weight:900!important;
      letter-spacing:-.01em!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v18-copy,
    #nexa-v49-transfer-card .nexa-transfer-v18-status{
      margin:0!important;
      color:#9aa8c3!important;
      font-size:12px!important;
      line-height:1.35!important;
      font-weight:400!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v18-status{
      margin-top:4px!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v18-actions{
      display:flex!important;
      gap:7px!important;
      flex-wrap:wrap!important;
      margin-top:9px!important;
    }

    #nexa-v49-transfer-card .nexa-transfer-v18-actions .btn{
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

    #nexa-v49-transfer-card .nexa-transfer-v18-actions .btn.secondary{
      border-color:rgba(143,157,205,.25)!important;
      background:rgba(16,23,49,.78)!important;
      color:#bdc9e6!important;
    }

    #nexa-transfer-workspace-card,
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

function retireLegacy(){
  $('#nexa-transfer-workspace-card')?.remove();

  const current=$('#nexa-v49-transfer-card');

  [
    '#home-transfers-section',
    '#nexa-v430-transfer-card',
    '#nexa-transfer-card',
    '.nexa-v453-transfer',
    '[data-nexa-transfer]'
  ].forEach(sel=>{
    $$(sel).forEach(el=>{
      if(!el || el===current || el.closest?.('#nexa-v49-transfer-card')) return;
      el.remove();
    });
  });
}

function emptyHTML(){
  return `
    <h3 class="nexa-transfer-v18-title">No transfer form published</h3>
    <p class="nexa-transfer-v18-copy">Transfer applications will appear here when leadership publishes them.</p>
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
    <h3 class="nexa-transfer-v18-title">${esc(title)}</h3>
    <p class="nexa-transfer-v18-copy">Transfer application for State ${esc(activeState()||'—')}.</p>
    ${open?`<p class="nexa-transfer-v18-status">OPEN • Applications Open</p>`:''}
    <div class="nexa-transfer-v18-actions">
      <a class="btn" href="${esc(publicLink(row))}">Open Form</a>
      <button class="btn secondary" type="button" data-nexa-transfer-copy>Copy Link</button>
    </div>
  `;
}

function visibleSurface(card){
  if(!card) return null;

  let surface=$('#nexa-transfer-home-surface',card);
  if(surface) return surface;

  surface=document.createElement('div');
  surface.id='nexa-transfer-home-surface';
  surface.dataset.nexaTransferOwner='v1.14';

  const sink=$('#nexa-v49-transfer-events',card);
  if(sink?.parentNode){
    sink.insertAdjacentElement('afterend',surface);
  }else{
    card.appendChild(surface);
  }

  return surface;
}

function announceReady(){
  window.dispatchEvent(new CustomEvent('nexa:home-surface-ready',{
    detail:{surface:'transfer',id:'nexa-v49-transfer-card'}
  }));
  try{window.NEXA_HOME_COMPOSE?.()}catch(_){}
}

async function render(){
  installCSS();
  retireLegacy();

  const card=$('#nexa-v49-transfer-card');
  if(!card) return false;

  card.classList.add('nexa-v49-transfer-visible','nexa-v31-strip');
  card.classList.remove('hidden');
  card.setAttribute('aria-hidden','false');

  const sink=$('#nexa-v49-transfer-events',card);
  if(!sink) return false;

  const host=visibleSurface(card);
  if(!host) return false;

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

  const ownsPaint=!!host.querySelector('.nexa-transfer-v18-title');

  if(paintKey!==lastPaintKey || !ownsPaint){
    host.innerHTML=row ? openHTML(row) : emptyHTML();
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

  retireLegacy();
  announceReady();
  return true;
}

installCSS();
retireLegacy();

function finitePasses(){
  const mine=++generation;

  [0,150,500,1200,3000,7000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation) return;
      render().catch(()=>{});
    },ms);
  });
}

window.NEXA_REFRESH_TRANSFER_HOME=()=>render();

window.addEventListener('nexa:home-ready',finitePasses);
window.addEventListener('nexa:active-state-changed',finitePasses);
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
