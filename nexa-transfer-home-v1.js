/* NEXA TRANSFER HOME V1.6 — COMPACT HOME CARD OWNER
   COMPLETE REPLACEMENT for: nexa-transfer-home-v1.js

   Purpose:
   - Keep NEXA V49 State Hub as the Transfer DATA owner.
   - Make the existing #nexa-v49-transfer-card visually match the compact Home card family.
   - Do not create a second Transfer Center card.
   - Keep Transfer Workspace staff card separate.
   - Retire leftover legacy Transfer shells/strips.
   - Preserve View Form / Copy Link actions.

   Safety:
   - No MutationObserver.
   - No indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_TRANSFER_HOME_V16__) return;
window.__NEXA_TRANSFER_HOME_V16__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

let client=null;
let canWorkspace=false;
let generation=0;

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

function staffToken(){
  return localStorage.getItem('nexa_transfer_staff_token')||
         sessionStorage.getItem('nexa_transfer_staff_token')||
         '';
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
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function publicLink(row){
  return new URL(
    `transfer-form-v2.html?public=1&event=${encodeURIComponent(row.event_id)}`,
    location.href
  ).href;
}

function workspaceLink(){
  const st=activeState();
  return new URL(
    `transfer-workspace.html${st?`?state=${encodeURIComponent(st)}`:''}`,
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

async function permission(){
  const c=sb();
  if(!c)return false;
  if(staffToken())return true;

  try{
    if(c.auth?.getSession)await c.auth.getSession();
  }catch(_){}

  try{
    const r=await c.rpc('can_manage_transfers');
    return r?.data===true;
  }catch(_){
    return false;
  }
}

function installCSS(){
  $('#nexa-transfer-home-v16-css')?.remove();

  const s=document.createElement('style');
  s.id='nexa-transfer-home-v16-css';

  s.textContent=`
    /* V1.6 — one compact Transfer Center card, matching Home signal geometry. */
    #nexa-v49-transfer-card{
      --nexa-transfer-rgb:255,145,72;
      --nexa-transfer-accent:#ff9148;

      position:relative!important;
      isolation:isolate!important;
      overflow:hidden!important;

      width:100%!important;
      max-width:100%!important;
      min-height:0!important;
      height:auto!important;

      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;

      border-radius:20px!important;
      border:1px solid rgba(var(--nexa-transfer-rgb),.56)!important;

      background:
        linear-gradient(
          90deg,
          rgba(var(--nexa-transfer-rgb),.10),
          rgba(var(--nexa-transfer-rgb),0) 14px
        ),
        radial-gradient(
          circle at 22px 0,
          rgba(255,255,255,.10),
          transparent 42px
        ),
        radial-gradient(
          circle at 8% 10%,
          rgba(var(--nexa-transfer-rgb),.075),
          transparent 34%
        ),
        radial-gradient(
          circle at 92% 85%,
          rgba(var(--nexa-transfer-rgb),.04),
          transparent 38%
        ),
        linear-gradient(
          145deg,
          rgba(10,17,42,.96),
          rgba(3,8,24,.98)
        )!important;

      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.018),
        inset 0 1px 0 rgba(var(--nexa-transfer-rgb),.12),
        inset 0 0 27px rgba(var(--nexa-transfer-rgb),.025),
        0 0 14px rgba(var(--nexa-transfer-rgb),.09)!important;

      visibility:visible!important;
      opacity:1!important;
    }

    #nexa-v49-transfer-card::before{
      content:""!important;
      position:absolute!important;
      left:18px!important;
      top:-1px!important;
      width:48px!important;
      height:2px!important;
      border-radius:999px!important;
      pointer-events:none!important;
      z-index:8!important;

      background:linear-gradient(
        90deg,
        transparent,
        rgba(var(--nexa-transfer-rgb),.42),
        rgba(var(--nexa-transfer-rgb),1),
        #fff,
        rgba(var(--nexa-transfer-rgb),1),
        rgba(var(--nexa-transfer-rgb),.42),
        transparent
      )!important;

      box-shadow:
        0 0 5px rgba(var(--nexa-transfer-rgb),.98),
        0 0 12px rgba(var(--nexa-transfer-rgb),.60),
        0 0 22px rgba(var(--nexa-transfer-rgb),.20)!important;
    }

    #nexa-v49-transfer-card::after{
      content:""!important;
      position:absolute!important;
      left:-1px!important;
      top:18px!important;
      width:3px!important;
      height:40px!important;
      border-radius:0 999px 999px 0!important;
      pointer-events:none!important;
      z-index:8!important;

      background:linear-gradient(
        180deg,
        transparent 0%,
        rgba(var(--nexa-transfer-rgb),.45) 12%,
        rgba(var(--nexa-transfer-rgb),1) 42%,
        #fff 50%,
        rgba(var(--nexa-transfer-rgb),1) 58%,
        rgba(var(--nexa-transfer-rgb),.45) 88%,
        transparent 100%
      )!important;

      box-shadow:
        0 0 5px rgba(var(--nexa-transfer-rgb),.96),
        0 0 13px rgba(var(--nexa-transfer-rgb),.54)!important;
    }

    #nexa-v49-transfer-card > .nexa-v49-transfer-kicker{
      position:relative!important;
      z-index:3!important;

      margin:0 0 6px!important;
      padding:0!important;

      color:var(--nexa-transfer-accent)!important;
      font-size:.64rem!important;
      line-height:1.1!important;
      font-weight:950!important;
      letter-spacing:.16em!important;
      text-transform:uppercase!important;
    }

    #nexa-v49-transfer-card > h3{
      position:relative!important;
      z-index:3!important;

      margin:0!important;
      padding:0!important;

      color:#fff!important;
      font-size:1.05rem!important;
      line-height:1.16!important;
      font-weight:950!important;
      letter-spacing:-.012em!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events{
      position:relative!important;
      z-index:3!important;

      display:block!important;
      width:100%!important;

      margin:4px 0 0!important;
      padding:0!important;

      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events > .event,
    #nexa-v49-transfer-card #nexa-v49-transfer-events .event-row{
      display:block!important;

      width:100%!important;
      min-height:0!important;
      height:auto!important;

      margin:0!important;
      padding:0!important;

      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      box-shadow:none!important;
      overflow:visible!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events h3{
      margin:0!important;
      padding:0!important;

      color:#f2f5ff!important;
      font-size:.80rem!important;
      line-height:1.26!important;
      font-weight:900!important;
      letter-spacing:0!important;
    }

    #nexa-v49-transfer-card #nexa-v49-transfer-events .muted{
      margin-top:3px!important;
      color:#9aa8c3!important;
      font-size:.68rem!important;
      line-height:1.35!important;
      font-weight:700!important;
    }

    #nexa-v49-transfer-card #nexa-transfer-center-actions{
      display:flex!important;
      gap:7px!important;
      flex-wrap:wrap!important;
      margin:9px 0 0!important;
      padding:0!important;
    }

    #nexa-v49-transfer-card #nexa-transfer-center-actions .btn{
      min-height:32px!important;
      width:auto!important;
      flex:0 0 auto!important;

      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;

      margin:0!important;
      padding:7px 11px!important;

      border-radius:10px!important;
      border:1px solid rgba(255,154,82,.30)!important;

      background:rgba(56,29,20,.46)!important;
      color:#ffd7bc!important;

      box-shadow:none!important;

      font-size:.64rem!important;
      line-height:1!important;
      font-weight:900!important;
      text-decoration:none!important;
      white-space:nowrap!important;
    }

    #nexa-v49-transfer-card #nexa-transfer-center-actions .btn.secondary{
      border-color:rgba(143,157,205,.25)!important;
      background:rgba(16,23,49,.78)!important;
      color:#bdc9e6!important;
    }

    /*
      Neutralize old visual owners inside the current Transfer card.
      This is what removes the giant cyan/pink block from the screenshot.
    */
    #nexa-v49-transfer-card *::before,
    #nexa-v49-transfer-card *::after{
      box-shadow:none;
    }

    #nexa-v49-transfer-card button:not(#nexa-transfer-copy),
    #nexa-v49-transfer-card a:not(.btn){
      max-width:100%!important;
    }

    /* Legacy Transfer shells / empty orange strip are not owners. */
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

    /* Transfer Workspace remains separate and compact. */
    #nexa-transfer-workspace-card{
      position:relative!important;
      overflow:hidden!important;

      width:100%!important;
      max-width:100%!important;
      box-sizing:border-box!important;

      margin:10px 0 0!important;
      padding:12px 16px!important;

      border-radius:20px!important;
      border:1px solid rgba(83,220,255,.34)!important;

      background:
        radial-gradient(circle at 8% 10%,rgba(64,211,255,.07),transparent 32%),
        linear-gradient(145deg,rgba(10,17,42,.96),rgba(3,8,24,.98))!important;

      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.015),
        0 0 13px rgba(57,205,255,.07)!important;
    }

    #nexa-transfer-workspace-card h3{
      margin:5px 0 3px!important;
      font-size:.92rem!important;
    }

    #nexa-transfer-workspace-card .muted{
      color:#9aa8c3!important;
      font-size:.68rem!important;
      line-height:1.35!important;
    }

    #nexa-transfer-workspace-card .btn{
      min-height:32px!important;
      width:auto!important;
      padding:7px 11px!important;
      font-size:.64rem!important;
      border-radius:10px!important;
    }

    @media(max-width:560px){
      #nexa-v49-transfer-card{
        padding:12px 16px!important;
      }
    }
  `;

  document.head.appendChild(s);
}

function retireLegacyTransferShells(){
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

      el.setAttribute('aria-hidden','true');
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
    });
  });

  /*
    Text fallback for an old empty Transfer strip that has no stable ID.
    Do not touch the current V49 card.
  */
  $$('#home .section, main.shell > .section').forEach(el=>{
    if(!el || el===current || el.closest?.('#nexa-v49-transfer-card'))return;

    const text=String(el.textContent||'')
      .replace(/\s+/g,' ')
      .trim();

    if(
      /^TRANSFERS?$/i.test(text) ||
      (
        /^TRANSFERS?\b/i.test(text) &&
        !/Transfer Center/i.test(text) &&
        text.length<60
      )
    ){
      el.setAttribute('aria-hidden','true');
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('pointer-events','none','important');
      el.style.setProperty('max-height','0','important');
      el.style.setProperty('height','0','important');
      el.style.setProperty('margin','0','important');
      el.style.setProperty('padding','0','important');
      el.style.setProperty('border','0','important');
      el.style.setProperty('overflow','hidden','important');
    }
  });
}

function normalizeCurrentCard(){
  const card=$('#nexa-v49-transfer-card');
  if(!card)return false;

  card.classList.add('nexa-transfer-home-v16');

  const kicker=$(':scope > .nexa-v49-transfer-kicker',card);
  if(kicker)kicker.textContent='TRANSFERS';

  const title=$(':scope > h3',card);
  if(title)title.textContent='Transfer Center';

  const host=$('#nexa-v49-transfer-events',card);
  if(host){
    const article=$(':scope > .event',host);
    const row=article?$('.event-row',article):null;
    const innerTitle=row?$('h3',row):$('h3',host);
    const muted=row?$('.muted',row):$('.muted',host);

    if(innerTitle){
      const txt=String(innerTitle.textContent||'').trim();
      if(!txt || /^Transfer Center$/i.test(txt)){
        innerTitle.textContent='Transfer Application Intake';
      }
    }

    if(muted && !String(muted.textContent||'').trim()){
      muted.textContent='Transfer cycles and recruiting information will appear here when active.';
    }
  }

  return true;
}

function removeWorkspaceCard(){
  $('#nexa-transfer-workspace-card')?.remove();
}

async function renderCenterAndWorkspaceCard(){
  const c=sb();
  const state=activeState();
  if(!c||!state)return;

  installCSS();
  retireLegacyTransferShells();

  canWorkspace=await permission();

  const transferCard=$('#nexa-v49-transfer-card');
  if(!transferCard){
    /*
      State Hub is the card creator. Do not create a second Transfer card here.
      A later finite pass will style it once State Hub mounts it.
    */
    return;
  }

  normalizeCurrentCard();

  const centerHost=$('#nexa-v49-transfer-events',transferCard);

  let cards=[];
  try{
    const cr=await c.rpc('get_transfer_center_cards');
    cards=normalize(cr?.data);
  }catch(_){}

  const row=cards.find(x=>Number(x.destination_state)===state);

  if(row&&centerHost){
    /*
      Preserve State Hub's title/status content.
      Only add the member-facing actions under it.
    */
    let actions=$('#nexa-transfer-center-actions',centerHost);

    if(!actions){
      actions=document.createElement('div');
      actions.id='nexa-transfer-center-actions';
      centerHost.appendChild(actions);
    }

    const link=publicLink(row);

    actions.innerHTML=
      `<a class="btn" href="${esc(link)}">View Form</a>`+
      `<button class="btn secondary" type="button" id="nexa-transfer-copy">Copy Link</button>`;

    const copyBtn=$('#nexa-transfer-copy',actions);
    if(copyBtn){
      copyBtn.onclick=e=>copy(link,e.currentTarget);
    }
  }else{
    $('#nexa-transfer-center-actions',centerHost)?.remove();
  }

  removeWorkspaceCard();

  if(canWorkspace){
    const card=document.createElement('section');
    card.id='nexa-transfer-workspace-card';
    card.className='section';
    card.dataset.nexaTech='transfer-workspace';

    card.innerHTML=
      `<div style="font-size:10px;letter-spacing:.15em;font-weight:950;color:#8fefff">TRANSFER STAFF</div>`+
      `<h3>Transfer Workspace</h3>`+
      `<div class="muted">Cycle, applicants, history, integrations and staff access for State ${esc(state)}.</div>`+
      `<div style="margin-top:9px"><a class="btn" href="${esc(workspaceLink())}" style="text-decoration:none">Open Workspace</a></div>`;

    transferCard.insertAdjacentElement('afterend',card);
  }

  retireLegacyTransferShells();
  normalizeCurrentCard();
}

function visualPass(){
  installCSS();
  retireLegacyTransferShells();
  normalizeCurrentCard();
}

function finitePasses(){
  const mine=++generation;

  [
    0,
    120,
    300,
    650,
    1100,
    1800,
    3000,
    5000,
    8000
  ].forEach((ms,index)=>{
    setTimeout(()=>{
      if(mine!==generation)return;

      visualPass();

      if(
        index===1 ||
        index===3 ||
        index===5 ||
        index===7
      ){
        renderCenterAndWorkspaceCard().catch(()=>{});
      }
    },ms);
  });
}

window.addEventListener(
  'nexa:active-state-changed',
  ()=>{
    finitePasses();
  }
);

window.addEventListener(
  'nexa:home-ready',
  ()=>{
    finitePasses();
  }
);

window.addEventListener(
  'pageshow',
  ()=>{
    finitePasses();
  }
);

window.addEventListener(
  'load',
  ()=>{
    finitePasses();
  },
  {once:true}
);

document.addEventListener(
  'visibilitychange',
  ()=>{
    if(!document.hidden)finitePasses();
  }
);

const c=sb();

if(c?.auth?.onAuthStateChange){
  c.auth.onAuthStateChange((_event,session)=>{
    if(session)finitePasses();
  });
}

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    ()=>{
      finitePasses();
    },
    {once:true}
  );
}else{
  finitePasses();
}

})();
