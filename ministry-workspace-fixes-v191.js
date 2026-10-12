(()=>{'use strict';
if(window.__NEXA_MINISTRY_FIX_191__)return;window.__NEXA_MINISTRY_FIX_191__=true;

const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hm=v=>String(v||'').slice(0,5);
const fmt=n=>n==null||n===''?'—':Number(n).toLocaleString();
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const sb=window.supabase?.createClient?.(SUPA,PUB);

let snapshot=null,lastSnapshotAt=0,busy=false;

function workspaceId(){
  const q=new URLSearchParams(location.search);
  if(q.get('workspace')) return q.get('workspace');
  try{
    return new URL($('ministryWorkspaceLink')?.value||location.href).searchParams.get('workspace')||'';
  }catch{return ''}
}

function trainingInfo(r){
  const d=r?.response_data||{};
  return {
    speed:Number(d.training_speedup_minutes||0),
    t12:d.upgrading_t12===true
  };
}

function compactTraining(r){
  const d=trainingInfo(r);
  return `T Speed-ups: <b>${fmt(d.speed)} min</b><br>T12: <b>${d.t12?'Yes':'No'}</b>`;
}

async function loadSnapshot(force=false){
  if(!sb||busy) return snapshot;
  const now=Date.now();
  if(!force&&snapshot&&now-lastSnapshotAt<2500) return snapshot;

  const w=workspaceId(),t=token();
  if(!w||!t) return snapshot;

  busy=true;
  try{
    const {data,error}=await sb.rpc('ministry_workspace_snapshot_v2',{
      p_workspace_id:w,
      p_token:t
    });
    if(!error&&data?.ok){
      snapshot=data;
      lastSnapshotAt=Date.now();
    }
  }catch{}
  finally{busy=false}
  return snapshot;
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
    nav.appendChild(btn);
  }

  let panel=$('view-clear');
  if(!panel){
    panel=document.createElement('section');
    panel.id='view-clear';
    panel.className='panel hidden';
    const host=document.querySelector('main.shell')||document.querySelector('main')||nav.parentElement;
    host?.appendChild(panel);
  }

  const tools=$('ownerTools');
  if(tools&&tools.parentElement!==panel)panel.appendChild(tools);

  const recovery=$('clearRecovery');
  if(recovery){
    const actions=recovery.querySelector('.recovery-actions');
    if(actions&&!$('cancelClearBtn')){
      const cancel=document.createElement('button');
      cancel.id='cancelClearBtn';
      cancel.className='btn secondary';
      cancel.type='button';
      cancel.textContent='Cancel Delete';
      cancel.onclick=()=>$('restoreClearBtn')?.click();
      actions.appendChild(cancel);
    }
  }

  btn.onclick=()=>{
    document.querySelectorAll('.pill').forEach(x=>x.classList.toggle('active',x===btn));
    ['view-requests','view-appointments','view-access'].forEach(id=>$(id)?.classList.add('hidden'));
    panel.classList.remove('hidden');
  };

  nav.querySelectorAll('.pill:not([data-view="clear"])').forEach(x=>{
    if(x.dataset.nexaClearHook)return;
    x.dataset.nexaClearHook='1';
    x.addEventListener('click',()=>panel.classList.add('hidden'));
  });
}

function patchDragHandles(){
  document.querySelectorAll('[data-slot-drag]').forEach(h=>{
    if(!h.dataset.drag)h.dataset.drag=h.dataset.slotDrag;
  });
}

function patchTrainingDom(){
  if(!snapshot?.requests)return;
  const byId=new Map(snapshot.requests.map(r=>[String(r.id),r]));

  document.querySelectorAll('#requestGrid [data-view-request]').forEach(btn=>{
    const r=byId.get(String(btn.dataset.viewRequest));
    if(!r||r.day_type!=='training')return;
    const card=btn.closest('.request-card');
    const meta=card?.querySelector('.training-priority');
    if(meta)meta.innerHTML=compactTraining(r);
  });

  document.querySelectorAll('#playerBank [data-player]').forEach(card=>{
    const r=byId.get(String(card.dataset.player));
    if(!r||r.day_type!=='training')return;
    const p=card.querySelector('.pmeta');
    if(!p)return;
    p.innerHTML=
      `${esc(r.alliance_tag||'—')}<br>${compactTraining(r)}<br>`+
      `${hm(r.preferred_window_start)||'—'}–${hm(r.preferred_window_end)||'—'} • Pref ${hm(r.preferred_time)||'—'}`;
  });

  document.querySelectorAll('#slotList [data-slot-player]').forEach(slot=>{
    const r=byId.get(String(slot.dataset.slotPlayer));
    if(!r||r.day_type!=='training')return;
    const sub=slot.querySelector('.slot-sub');
    if(sub)sub.innerHTML=`${esc(r.alliance_tag||'—')}<br>${compactTraining(r)}`;
  });

  document.querySelectorAll('#requestGrid [data-view-request]').forEach(btn=>{
    if(btn.dataset.nexaTrainingDetailHook)return;
    btn.dataset.nexaTrainingDetailHook='1';
    btn.addEventListener('click',()=>{
      const id=String(btn.dataset.viewRequest||'');
      setTimeout(()=>{
        const r=byId.get(id);
        if(!r||r.day_type!=='training')return;
        const body=$('detailBody');
        if(!body)return;
        body.innerHTML=
          `<p><b>Game ID:</b> <code>${esc(r.game_id||'—')}</code><br>`+
          `<b>Alliance:</b> ${esc(r.alliance_tag||'—')}<br>`+
          `<b>Preferred Window:</b> ${hm(r.preferred_window_start)||'—'}–${hm(r.preferred_window_end)||'—'} UTC<br>`+
          `<b>Preferred Time:</b> ${hm(r.preferred_time)||'—'} UTC</p>`+
          `<div class="training-priority">${compactTraining(r)}</div>`;
      },0);
    });
  });
}
function patchDirectLink(){
  const input=$('ministryWorkspaceLink');
  if(!input)return;
  const q=new URLSearchParams(location.search),w=workspaceId();
  if(!w)return;

  const u=new URL('/ministry-workspace-v191.html',location.origin);
  u.searchParams.set('workspace',w);
  const st=q.get('state');
  if(st)u.searchParams.set('state',st);
  input.value=u.href;
}

let scheduled=false;
function queuePatch(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(async()=>{
    scheduled=false;
    ensureClearTab();
    patchDragHandles();
    patchDirectLink();
    await loadSnapshot();
    patchTrainingDom();
  });
}

const obs=new MutationObserver(queuePatch);
obs.observe(document.documentElement,{subtree:true,childList:true});

window.addEventListener('pageshow',()=>{loadSnapshot(true).then(queuePatch)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadSnapshot(true).then(queuePatch)});

setInterval(()=>loadSnapshot(true).then(()=>{
  patchDragHandles();
  patchTrainingDom();
  patchDirectLink();
}),5000);

queuePatch();
})();