// NEXA TRANSFER WORKSPACE FINISHER V1.0 — ONLINE PRESENCE / SIMPLE HISTORY / ROLE LABELS
(()=>{
'use strict';

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const SB=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;

let workspaceId='';
let token='';
let online=[];
let presenceTimer=null;
let historyTimer=null;
let booted=false;
let canManageHistory=false;

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtNum=n=>{
  const v=Number(n||0);
  return Number.isFinite(v)?v.toLocaleString():'0';
};
const fmtDate=v=>{
  if(!v)return'—';
  const d=new Date(v);
  if(Number.isNaN(d.getTime()))return'—';
  return d.toLocaleDateString([], {month:'short',day:'numeric',year:'numeric'});
};

function getToken(){
  return localStorage.getItem('nexa_transfer_staff_token')||
         sessionStorage.getItem('nexa_transfer_staff_token')||'';
}

function getWorkspaceId(){
  const q=new URLSearchParams(location.search);
  const direct=q.get('workspace');
  if(direct&&/^[0-9a-f-]{36}$/i.test(direct))return direct;

  const input=$('workspaceLink');
  if(input?.value){
    try{
      const u=new URL(input.value,location.href);
      const id=u.searchParams.get('workspace');
      if(id&&/^[0-9a-f-]{36}$/i.test(id))return id;
    }catch{}
  }
  return '';
}

function injectStyles(){
  if($('nexaWorkspaceFinisherStyles'))return;
  const s=document.createElement('style');
  s.id='nexaWorkspaceFinisherStyles';
  s.textContent=`
  .nexa-presence-pill{
    border:1px solid rgba(89,228,255,.28);
    background:rgba(7,17,39,.92);
    color:#dcfaff;
    border-radius:999px;
    min-height:40px;
    padding:8px 12px;
    display:inline-flex;
    align-items:center;
    gap:7px;
    font-weight:900;
    font-size:12px;
    white-space:nowrap;
    cursor:pointer;
  }
  .nexa-presence-dot{
    width:8px;height:8px;border-radius:50%;
    background:#67e3ac;box-shadow:0 0 12px rgba(103,227,172,.8)
  }
  .nexa-finisher-modal{
    position:fixed;inset:0;z-index:12000;
    display:none;place-items:center;padding:14px;
    background:rgba(0,0,0,.76);backdrop-filter:blur(6px)
  }
  .nexa-finisher-modal.open{display:grid}
  .nexa-finisher-card{
    width:min(560px,100%);max-height:88dvh;overflow:auto;
    border:1px solid rgba(89,228,255,.28);border-radius:22px;
    background:linear-gradient(180deg,#091226,#05091a);
    padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.58)
  }
  .nexa-finisher-head{display:flex;justify-content:space-between;gap:12px;align-items:center}
  .nexa-finisher-close{
    width:38px;height:38px;border-radius:50%;
    border:1px solid rgba(255,255,255,.14);background:#081127;color:white;
    font-size:20px
  }
  .nexa-online-list{display:grid;gap:8px;margin-top:14px}
  .nexa-online-person{
    padding:11px 12px;border-radius:14px;
    border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);
    display:flex;justify-content:space-between;gap:10px;align-items:center
  }
  .nexa-online-person small{display:block;color:#91a1c4;margin-top:3px}
  .nexa-role-pill{
    flex:0 0 auto;border-radius:999px;padding:5px 8px;
    border:1px solid rgba(89,228,255,.22);color:#a9f3ff;
    background:rgba(89,228,255,.06);font-size:10px;font-weight:950
  }
  .nexa-history-card{
    width:100%;text-align:left;color:inherit;
    padding:14px;border-radius:17px;border:1px solid rgba(255,255,255,.10);
    background:linear-gradient(145deg,rgba(12,22,46,.92),rgba(7,11,28,.94));
    cursor:pointer
  }
  .nexa-history-card + .nexa-history-card{margin-top:9px}
  .nexa-history-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .nexa-history-date{font-weight:950}
  .nexa-history-state{font-size:10px;color:#8fefff;font-weight:900}
  .nexa-history-class{font-size:11px;color:#aab4d0;margin-top:5px}
  .nexa-history-mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}
  .nexa-history-mini div{
    padding:8px;border-radius:11px;background:rgba(255,255,255,.035);
    min-width:0
  }
  .nexa-history-mini small{display:block;color:#8795b7;font-size:8px;letter-spacing:.06em;text-transform:uppercase}
  .nexa-history-mini b{display:block;margin-top:3px;font-size:10px;overflow-wrap:anywhere}
  .nexa-history-detail{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
  .nexa-history-detail div{padding:11px;border-radius:13px;background:rgba(255,255,255,.035)}
  .nexa-history-detail small{display:block;color:#8795b7;font-size:9px;text-transform:uppercase}
  .nexa-history-detail b{display:block;margin-top:4px}
  @media(max-width:620px){
    .nexa-history-mini{grid-template-columns:1fr}
    .nexa-history-detail{grid-template-columns:1fr}
    .nexa-presence-pill{min-height:36px;padding:7px 10px}
  }`;
  document.head.appendChild(s);
}

function ensureModal(){
  if($('nexaFinisherModal'))return;
  const m=document.createElement('div');
  m.id='nexaFinisherModal';
  m.className='nexa-finisher-modal';
  m.innerHTML=`<div class="nexa-finisher-card">
    <div class="nexa-finisher-head">
      <div><div class="tag" id="nexaFinisherTag">NEXA</div><h3 id="nexaFinisherTitle" style="margin:4px 0 0">Details</h3></div>
      <button class="nexa-finisher-close" id="nexaFinisherClose" type="button">×</button>
    </div>
    <div id="nexaFinisherBody"></div>
  </div>`;
  document.body.appendChild(m);
  $('nexaFinisherClose').onclick=()=>m.classList.remove('open');
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
}

function openModal(tag,title,html){
  ensureModal();
  $('nexaFinisherTag').textContent=tag;
  $('nexaFinisherTitle').textContent=title;
  $('nexaFinisherBody').innerHTML=html;
  $('nexaFinisherModal').classList.add('open');
}

function ensurePresencePill(){
  if($('nexaPresencePill'))return;
  const top=document.querySelector('#workspaceRoot .top')||document.querySelector('.top');
  if(!top)return;
  const b=document.createElement('button');
  b.id='nexaPresencePill';
  b.className='nexa-presence-pill';
  b.type='button';
  b.innerHTML=`<span class="nexa-presence-dot"></span><span>👥 <b id="nexaPresenceCount">1</b> online</span>`;
  const home=top.querySelector('.round');
  if(home)top.insertBefore(b,home); else top.appendChild(b);
  b.onclick=showPresence;
}

function showPresence(){
  const rows=online.length?online.map(p=>`
    <div class="nexa-online-person">
      <div><b>${esc(p.game_name||p.game_id||'Staff')}</b>
      <small>${p.is_self?'You · ':''}${esc(p.game_id||'')}</small></div>
      <span class="nexa-role-pill">${esc(p.role||'Transfer Staff')}</span>
    </div>`).join(''):`<div class="muted" style="margin-top:14px">No active staff detected right now.</div>`;
  openModal('ONLINE NOW',`${online.length} online`,`<div class="nexa-online-list">${rows}</div>`);
}

async function heartbeat(){
  token=getToken();
  workspaceId=getWorkspaceId();
  if(!SB||!token||!workspaceId)return;
  try{
    const {data,error}=await SB.rpc('transfer_workspace_presence_heartbeat',{
      p_workspace_id:workspaceId,p_token:token
    });
    if(error||!data?.ok)return;
    online=Array.isArray(data.online)?data.online:[];
    ensurePresencePill();
    if($('nexaPresenceCount'))$('nexaPresenceCount').textContent=String(data.count??online.length);
  }catch{}
}

async function leave(){
  token=getToken();workspaceId=getWorkspaceId();
  if(!token||!workspaceId)return;
  try{
    fetch(`${SB_URL}/rest/v1/rpc/transfer_workspace_presence_leave`,{
      method:'POST',keepalive:true,
      headers:{
        'apikey':SB_KEY,
        'Authorization':`Bearer ${SB_KEY}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({p_workspace_id:workspaceId,p_token:token})
    });
  }catch{}
}

function historyRange(h){
  const start=h.starts_at||null;
  const end=h.ended_at||h.ends_at||null;
  if(start&&end)return `${fmtDate(start)} – ${fmtDate(end)}`;
  if(end)return `Ended ${fmtDate(end)}`;
  if(start)return `Started ${fmtDate(start)}`;
  return 'Transfer Cycle';
}

function historyCard(h){
  const ordUsed=Number(h.ordinary_used||0),ordAvail=Number(h.ordinary_available||0);
  const spUsed=Number(h.special_used||0),spAvail=Number(h.special_available||0);
  return `<div class="nexa-history-card" data-nexa-history="${esc(h.id)}" role="button" tabindex="0">
    <div class="nexa-history-top">
      <div><div class="nexa-history-date">${esc(historyRange(h))}</div>
      <div class="nexa-history-class">${esc(h.classification||'Ordinary')}</div></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="nexa-history-state">STATE ${esc(h.destination_state||'—')}</div>
        ${canManageHistory?`<button class="btn danger mini" type="button" data-nexa-delete-history="${esc(h.id)}">Delete</button>`:''}
      </div>
    </div>
    <div class="nexa-history-mini">
      <div><small>Power Cap</small><b>${fmtNum(h.power_cap)}</b></div>
      <div><small>Ordinary Invites</small><b>${ordUsed} used / ${ordAvail}</b></div>
      <div><small>Special Invites</small><b>${spUsed} used / ${spAvail}</b></div>
    </div>
  </div>`;
}

function openHistory(h){
  if(!h)return;
  const ordUsed=Number(h.ordinary_used||0),ordAvail=Number(h.ordinary_available||0);
  const spUsed=Number(h.special_used||0),spAvail=Number(h.special_available||0);
  openModal('TRANSFER HISTORY',historyRange(h),`
    <div class="nexa-history-detail">
      <div><small>State</small><b>State ${esc(h.destination_state||'—')}</b></div>
      <div><small>Classification</small><b>${esc(h.classification||'Ordinary')}</b></div>
      <div><small>Power Cap</small><b>${fmtNum(h.power_cap)}</b></div>
      <div><small>Ordinary Invites</small><b>${ordUsed} used / ${ordAvail} available</b></div>
      <div><small>Special Invites</small><b>${spUsed} used / ${spAvail} available</b></div>
      <div><small>Total Applicants</small><b>${fmtNum(h.applicants_total)}</b></div>
    </div>
    <p class="muted" style="margin:13px 2px 0">Simple cycle summary only — no activity log.</p>`);
}

async function loadHistory(){
  token=getToken();
  workspaceId=getWorkspaceId();
  const box=$('historyList');
  if(!SB||!token||!workspaceId||!box)return;

  try{
    const access=await SB.rpc('transfer_staff_access_list',{p_workspace_id:workspaceId,p_token:token});
    canManageHistory=access.data?.ok===true&&access.data?.can_manage===true;

    const {data,error}=await SB.rpc('transfer_workspace_history_summary',{
      p_workspace_id:workspaceId,p_token:token
    });
    if(error||!data?.ok)return;
    const rows=Array.isArray(data.history)?data.history:[];
    box.innerHTML=rows.length?rows.map(historyCard).join(''):
      `<div class="empty">No completed Transfer Cycles yet.</div>`;
    box.querySelectorAll('[data-nexa-history]').forEach(card=>{
      card.onclick=e=>{
        if(e.target.closest('[data-nexa-delete-history]'))return;
        openHistory(rows.find(x=>String(x.id)===String(card.dataset.nexaHistory)));
      };
      card.onkeydown=e=>{
        if((e.key==='Enter'||e.key===' ')&&!e.target.closest('[data-nexa-delete-history]')){
          e.preventDefault();
          openHistory(rows.find(x=>String(x.id)===String(card.dataset.nexaHistory)));
        }
      };
    });
    box.querySelectorAll('[data-nexa-delete-history]').forEach(btn=>{
      btn.onclick=e=>{
        e.stopPropagation();
        const h=rows.find(x=>String(x.id)===String(btn.dataset.nexaDeleteHistory));
        confirmDeleteHistory(h);
      };
    });
  }catch{}
}

function confirmDeleteHistory(h){
  if(!h||!canManageHistory)return;
  openModal('DELETE HISTORY','Delete Transfer Cycle?',`
    <p class="muted">Delete <b>${esc(historyRange(h))}</b> from History permanently?</p>
    <p class="muted">This removes the archived cycle card and cannot be undone.</p>
    <div class="actions">
      <button class="btn secondary" type="button" id="nexaCancelDeleteHistory">Cancel</button>
      <button class="btn danger" type="button" id="nexaConfirmDeleteHistory">Delete</button>
    </div>
    <div class="status" id="nexaDeleteHistoryStatus"></div>
  `);
  $('nexaCancelDeleteHistory').onclick=()=>$('nexaFinisherModal').classList.remove('open');
  $('nexaConfirmDeleteHistory').onclick=async()=>{
    const status=$('nexaDeleteHistoryStatus');
    status.textContent='Deleting…';
    const {data,error}=await SB.rpc('transfer_workspace_delete_history',{
      p_workspace_id:workspaceId,
      p_token:token,
      p_event_id:h.id
    });
    if(error||data?.ok!==true){
      status.textContent=error?.message||'Unable to delete this History card.';
      return;
    }
    $('nexaFinisherModal').classList.remove('open');
    await loadHistory();
  };
}

function polishHistoryCopy(){
  const panel=document.querySelector('[data-panel="history"]');
  if(!panel)return;
  const p=panel.querySelector('article.card.full > p.muted');
  if(p)p.textContent='A simple summary of each completed Transfer Cycle.';
}

function polishAccess(){
  const panel=document.querySelector('[data-panel="access"]');
  if(!panel)return;

  const intro=panel.querySelector('article.card.full > p.muted');
  if(intro)intro.textContent='Owner 👑 = protected owner · Admin ★ = access management · Transfer Staff ☆ = normal transfer operations.';

  const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const n of nodes){
    if(!n.nodeValue)continue;
    n.nodeValue=n.nodeValue
      .replace(/\bAccess Management\b/g,'Admin Access')
      .replace(/\bManager\b/g,'Admin')
      .replace(/\bmanager\b/g,'admin');
  }
}

function attachTabHooks(){
  document.querySelectorAll('.tab').forEach(btn=>{
    if(btn.dataset.nexaFinisherHooked)return;
    btn.dataset.nexaFinisherHooked='1';
    btn.addEventListener('click',()=>{
      if(btn.dataset.tab==='history')setTimeout(loadHistory,80);
      if(btn.dataset.tab==='access')setTimeout(polishAccess,80);
    });
  });
}

function start(){
  if(booted)return;
  token=getToken();
  workspaceId=getWorkspaceId();
  const app=$('workspaceRoot');
  if(!SB||!token||!workspaceId||!app||app.classList.contains('hidden'))return;

  booted=true;
  injectStyles();
  ensureModal();
  ensurePresencePill();
  polishHistoryCopy();
  polishAccess();
  attachTabHooks();
  heartbeat();
  loadHistory();

  presenceTimer=setInterval(heartbeat,30000);
  historyTimer=setInterval(()=>{
    const panel=document.querySelector('[data-panel="history"]');
    if(panel?.classList.contains('active'))loadHistory();
    const access=document.querySelector('[data-panel="access"]');
    if(access?.classList.contains('active'))polishAccess();
  },15000);

  window.addEventListener('pagehide',leave,{once:true});
}

const bootTimer=setInterval(()=>{
  start();
  if(booted)clearInterval(bootTimer);
},500);

setTimeout(start,50);
})();
