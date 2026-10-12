(()=>{'use strict';
if(window.__NEXA_MINISTRY_FIX_192__)return;
window.__NEXA_MINISTRY_FIX_192__=true;

const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hm=v=>String(v||'').slice(0,5);
const fmt=n=>n==null||n===''?'—':Number(n).toLocaleString();
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const sb=window.supabase?.createClient?.(SUPA,PUB);

let snapshot=null,loading=false,lastLoad=0;

function workspaceId(){
  const q=new URLSearchParams(location.search);
  if(q.get('workspace'))return q.get('workspace');
  try{return new URL($('ministryWorkspaceLink')?.value||location.href,location.href).searchParams.get('workspace')||''}
  catch{return ''}
}
function trainingInfo(r){
  const d=r?.response_data||{};
  return {speed:Number(d.training_speedup_minutes||0),t12:d.upgrading_t12===true};
}
function trainingHtml(r){
  const d=trainingInfo(r);
  return `<div class="nexaTrainingLine"><span>T Speed-ups:</span> <b>${fmt(d.speed)} min</b></div>`+
         `<div class="nexaTrainingLine"><span>T12:</span> <b>${d.t12?'Yes':'No'}</b></div>`;
}
async function loadSnapshot(force=false){
  if(!sb||loading)return snapshot;
  if(!force&&snapshot&&Date.now()-lastLoad<2000)return snapshot;
  const w=workspaceId(),t=token();
  if(!w||!t)return snapshot;
  loading=true;
  try{
    const {data,error}=await sb.rpc('ministry_workspace_snapshot_v2',{p_workspace_id:w,p_token:t});
    if(!error&&data?.ok){snapshot=data;lastLoad=Date.now()}
  }catch(_){}
  loading=false;
  return snapshot;
}

function ensureCss(){
  if($('nexaMinistry192Css'))return;
  const s=document.createElement('style');
  s.id='nexaMinistry192Css';
  s.textContent=`
    .nexaTrainingLine{display:block;line-height:1.55}
    #view-clear .owner-tools{display:block}
    #view-clear{margin-top:0}
  `;
  document.head.appendChild(s);
}
function ensureClearTab(){
  const nav=document.querySelector('nav.pills');
  if(!nav)return;

  let btn=nav.querySelector('[data-view="clear"]');
  if(!btn){
    btn=document.createElement('button');
    btn.className='pill';
    btn.dataset.view='clear';
    btn.textContent='Clear Data';
    const appt=nav.querySelector('[data-view="appointments"]');
    appt?.insertAdjacentElement('afterend',btn) || nav.appendChild(btn);
  }

  let panel=$('view-clear');
  if(!panel){
    panel=document.createElement('section');
    panel.id='view-clear';
    panel.className='panel hidden';
    const access=$('view-access');
    if(access)access.insertAdjacentElement('beforebegin',panel);
    else (document.querySelector('main.shell')||document.querySelector('main'))?.appendChild(panel);
  }

  const tools=$('ownerTools');
  if(tools&&tools.parentElement!==panel){
    panel.appendChild(tools);
    tools.classList.remove('hidden');
  }

  const recovery=$('clearRecovery');
  const actions=recovery?.querySelector('.recovery-actions');
  if(actions&&!$('cancelClearBtn')){
    const b=document.createElement('button');
    b.id='cancelClearBtn';
    b.className='btn secondary';
    b.type='button';
    b.textContent='Cancel Delete';
    b.onclick=()=>$('restoreClearBtn')?.click();
    actions.appendChild(b);
  }

  btn.onclick=e=>{
    e.preventDefault();
    document.querySelectorAll('.pill').forEach(x=>x.classList.toggle('active',x===btn));
    ['view-requests','view-appointments','view-access'].forEach(id=>$(id)?.classList.add('hidden'));
    panel.classList.remove('hidden');
    tools?.classList.remove('hidden');
  };

  nav.querySelectorAll('.pill:not([data-view="clear"])').forEach(x=>{
    if(x.dataset.nexaClear192)return;
    x.dataset.nexaClear192='1';
    x.addEventListener('click',()=>panel.classList.add('hidden'));
  });
}

function fixScheduledDrag(){
  document.querySelectorAll('[data-slot-drag]').forEach(h=>{
    if(!h.dataset.drag)h.dataset.drag=h.dataset.slotDrag;
  });
}

function patchTraining(){
  if(!snapshot?.requests)return;
  const byId=new Map(snapshot.requests.map(r=>[String(r.id),r]));

  document.querySelectorAll('#requestGrid [data-view-request]').forEach(btn=>{
    const r=byId.get(String(btn.dataset.viewRequest));
    if(!r||r.day_type!=='training')return;
    const card=btn.closest('.request-card');
    const block=card?.querySelector('.training-priority');
    if(block)block.innerHTML=trainingHtml(r);
    if(btn.dataset.nexaTraining192)return;
    btn.dataset.nexaTraining192='1';
    btn.addEventListener('click',()=>{
      const id=String(btn.dataset.viewRequest||'');
      setTimeout(()=>{
        const req=byId.get(id),body=$('detailBody');
        if(!req||req.day_type!=='training'||!body)return;
        body.innerHTML=
          `<p><b>Game ID:</b> <code>${esc(req.game_id||'—')}</code><br>`+
          `<b>Alliance:</b> ${esc(req.alliance_tag||'—')}<br>`+
          `<b>Preferred Window:</b> ${hm(req.preferred_window_start)||'—'}–${hm(req.preferred_window_end)||'—'} UTC<br>`+
          `<b>Preferred Time:</b> ${hm(req.preferred_time)||'—'} UTC</p>`+
          `<div class="training-priority">${trainingHtml(req)}</div>`;
      },0);
    });
  });

  document.querySelectorAll('#playerBank [data-player]').forEach(card=>{
    const r=byId.get(String(card.dataset.player));
    if(!r||r.day_type!=='training')return;
    const meta=card.querySelector('.pmeta');
    if(meta)meta.innerHTML=
      `${esc(r.alliance_tag||'—')}<br>${trainingHtml(r)}`+
      `<div>${hm(r.preferred_window_start)||'—'}–${hm(r.preferred_window_end)||'—'} • Pref ${hm(r.preferred_time)||'—'}</div>`;
  });

  document.querySelectorAll('#slotList [data-slot-player]').forEach(slot=>{
    const r=byId.get(String(slot.dataset.slotPlayer));
    if(!r||r.day_type!=='training')return;
    const sub=slot.querySelector('.slot-sub');
    if(sub)sub.innerHTML=`${esc(r.alliance_tag||'—')}<br>${trainingHtml(r)}`;
  });
}

function patchDirectLink(){
  const input=$('ministryWorkspaceLink'),w=workspaceId();
  if(!input||!w)return;
  const u=new URL('/ministry-workspace-v192.html',location.origin);
  u.searchParams.set('workspace',w);
  const st=new URLSearchParams(location.search).get('state');
  if(st)u.searchParams.set('state',st);
  input.value=u.href;
}

let queued=false;
function run(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(async()=>{
    queued=false;
    ensureCss();
    ensureClearTab();
    fixScheduledDrag();
    patchDirectLink();
    await loadSnapshot();
    patchTraining();
  });
}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('pageshow',()=>loadSnapshot(true).then(run));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadSnapshot(true).then(run)});
setInterval(()=>loadSnapshot(true).then(()=>{ensureClearTab();fixScheduledDrag();patchTraining();patchDirectLink()}),4000);
run();
})();