/* NEXA TRANSFER APPLICANT ARCHIVE BULK V1.0
   Complete standalone file.
   Adds multi-select + bulk permanent delete to Applicant Archive.
*/
(()=>{
'use strict';

if(window.__NEXA_TRANSFER_ARCHIVE_BULK_V1__)return;
window.__NEXA_TRANSFER_ARCHIVE_BULK_V1__=true;

const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const SB=window.supabase?.createClient?window.supabase.createClient(SUPA,PUB):null;

const selected=new Set();
let canManage=false;
let observer=null;

const $=id=>document.getElementById(id);
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const workspace=()=>{
  const q=new URLSearchParams(location.search);
  const w=q.get('workspace');
  if(w)return w;
  const i=$('workspaceLink');
  if(i?.value){
    try{return new URL(i.value,location.href).searchParams.get('workspace')||''}catch{}
  }
  return '';
};

function ensureStyles(){
  if($('nexaArchiveBulkStyles'))return;
  const s=document.createElement('style');
  s.id='nexaArchiveBulkStyles';
  s.textContent=`
  .nexa-archive-bulk-bar{
    display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
    margin:0 0 12px;padding:11px 12px;border:1px solid rgba(89,228,255,.22);
    border-radius:15px;background:linear-gradient(145deg,rgba(13,25,49,.95),rgba(7,12,28,.96))
  }
  .nexa-archive-bulk-left,.nexa-archive-bulk-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .nexa-archive-bulk-count{font-size:11px;font-weight:950;color:#bfefff}
  .nexa-archive-bulk-bar button{
    min-height:34px;padding:7px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.12);
    background:#10182f;color:#fff;font-size:10px;font-weight:900
  }
  .nexa-archive-bulk-bar button.danger{
    border-color:rgba(255,97,130,.38);background:rgba(90,18,40,.42);color:#ffc1cf
  }
  .nexa-archive-bulk-bar button:disabled{opacity:.45;cursor:not-allowed}
  .archiveCardWrap{position:relative}
  .nexa-archive-check{
    position:absolute;top:10px;right:10px;z-index:5;width:22px;height:22px;
    accent-color:#59e4ff
  }
  .archiveCardWrap.nexa-archive-picked{
    outline:2px solid rgba(89,228,255,.34);outline-offset:2px;border-radius:18px
  }
  .nexa-archive-delete-modal{
    position:fixed;inset:0;z-index:22000;display:none;place-items:center;padding:16px;
    background:rgba(0,0,0,.80);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)
  }
  .nexa-archive-delete-modal.open{display:grid}
  .nexa-archive-delete-box{
    width:min(470px,100%);padding:18px;border-radius:22px;border:1px solid rgba(255,103,137,.35);
    background:linear-gradient(160deg,#111a34,#070b19);box-shadow:0 28px 80px rgba(0,0,0,.6)
  }
  .nexa-archive-delete-box h3{margin:5px 0 8px}
  .nexa-archive-delete-box p{color:#aebbd2;line-height:1.45}
  .nexa-archive-delete-actions{display:flex;gap:8px;margin-top:14px}
  .nexa-archive-delete-actions button{flex:1;min-height:42px;border-radius:12px;font-weight:900}
  .nexa-archive-delete-cancel{border:1px solid rgba(255,255,255,.13);background:#10182e;color:#fff}
  .nexa-archive-delete-confirm{border:1px solid rgba(255,92,130,.42);background:#481326;color:#ffd2dc}
  .nexa-archive-delete-status{min-height:18px;margin-top:9px;color:#ffb7c7;font-size:12px}
  `;
  document.head.appendChild(s);
}

function cards(){
  return [...document.querySelectorAll('#applicantArchiveList .archiveCardWrap[data-archive-wrap]')];
}

function updateBar(){
  const count=$('nexaArchiveBulkCount');
  const del=$('nexaArchiveDeleteSelected');
  const all=$('nexaArchiveSelectAll');
  const total=cards().length;
  const n=selected.size;
  if(count)count.textContent=`${n} selected`;
  if(del)del.disabled=n===0;
  if(all)all.textContent=n>0&&n===total?'Unselect All':'Select All';
}

function ensureBar(){
  const host=$('applicantArchiveList');
  if(!host||!canManage)return;
  if(!host.querySelector('.archiveCardWrap'))return;

  let bar=$('nexaArchiveBulkBar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='nexaArchiveBulkBar';
    bar.className='nexa-archive-bulk-bar';
    bar.innerHTML=`
      <div class="nexa-archive-bulk-left">
        <button id="nexaArchiveSelectAll" type="button">Select All</button>
        <span id="nexaArchiveBulkCount" class="nexa-archive-bulk-count">0 selected</span>
      </div>
      <div class="nexa-archive-bulk-actions">
        <button id="nexaArchiveClearSelection" type="button">Clear Selection</button>
        <button id="nexaArchiveDeleteSelected" class="danger" type="button" disabled>Delete Selected</button>
      </div>`;
    host.prepend(bar);

    $('nexaArchiveSelectAll').onclick=()=>{
      const list=cards();
      const allSelected=list.length>0&&list.every(c=>selected.has(c.dataset.archiveWrap));
      if(allSelected)selected.clear();
      else list.forEach(c=>selected.add(c.dataset.archiveWrap));
      syncCards();
    };

    $('nexaArchiveClearSelection').onclick=()=>{
      selected.clear();
      syncCards();
    };

    $('nexaArchiveDeleteSelected').onclick=openDeleteModal;
  }
  updateBar();
}

function syncCards(){
  cards().forEach(card=>{
    const id=card.dataset.archiveWrap;
    let cb=card.querySelector('.nexa-archive-check');
    if(!cb&&canManage){
      cb=document.createElement('input');
      cb.type='checkbox';
      cb.className='nexa-archive-check';
      cb.setAttribute('aria-label','Select archived applicant');
      cb.addEventListener('click',e=>e.stopPropagation());
      cb.addEventListener('change',()=>{
        if(cb.checked)selected.add(id);
        else selected.delete(id);
        syncCards();
      });
      card.prepend(cb);
    }
    if(cb)cb.checked=selected.has(id);
    card.classList.toggle('nexa-archive-picked',selected.has(id));
  });
  ensureBar();
  updateBar();
}

function ensureDeleteModal(){
  let m=$('nexaArchiveDeleteModal');
  if(m)return m;
  m=document.createElement('div');
  m.id='nexaArchiveDeleteModal';
  m.className='nexa-archive-delete-modal';
  m.innerHTML=`
    <section class="nexa-archive-delete-box" role="dialog" aria-modal="true" aria-labelledby="nexaArchiveDeleteTitle">
      <div style="font-size:10px;letter-spacing:.16em;font-weight:950;color:#ff9cb5">APPLICANT ARCHIVE</div>
      <h3 id="nexaArchiveDeleteTitle">Delete Selected Applicants?</h3>
      <p id="nexaArchiveDeleteText"></p>
      <div class="nexa-archive-delete-actions">
        <button id="nexaArchiveDeleteCancel" class="nexa-archive-delete-cancel" type="button">Cancel</button>
        <button id="nexaArchiveDeleteConfirm" class="nexa-archive-delete-confirm" type="button">Delete Permanently</button>
      </div>
      <div id="nexaArchiveDeleteStatus" class="nexa-archive-delete-status" role="status"></div>
    </section>`;
  document.body.appendChild(m);
  $('nexaArchiveDeleteCancel').onclick=()=>m.classList.remove('open');
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
  return m;
}

function openDeleteModal(){
  if(!selected.size)return;
  const m=ensureDeleteModal();
  $('nexaArchiveDeleteText').innerHTML=
    `Permanently delete <b>${selected.size}</b> archived applicant${selected.size===1?'':'s'}? This cannot be undone.`;
  $('nexaArchiveDeleteStatus').textContent='';
  $('nexaArchiveDeleteConfirm').disabled=false;
  $('nexaArchiveDeleteConfirm').onclick=deleteSelected;
  m.classList.add('open');
}

async function deleteSelected(){
  const ids=[...selected];
  if(!ids.length)return;
  const b=$('nexaArchiveDeleteConfirm'),st=$('nexaArchiveDeleteStatus');
  b.disabled=true;
  st.textContent=`Deleting ${ids.length} applicant${ids.length===1?'':'s'}â¦`;

  try{
    const r=await SB.rpc('transfer_workspace_delete_archived_applications_bulk',{
      p_workspace_id:workspace(),
      p_token:token(),
      p_application_ids:ids
    });
    if(r.error||r.data?.ok!==true){
      const code=r.data?.error||r.error?.message||'Unable to delete selected applicants.';
      const msg={
        manager_required:'Access Management is required.',
        no_selection:'Select at least one archived applicant.'
      }[code]||code;
      st.textContent=msg;
      b.disabled=false;
      return;
    }

    const deleted=Number(r.data.deleted_count||0);
    selected.clear();
    $('nexaArchiveDeleteModal').classList.remove('open');

    const status=$('cycleStatus');
    if(status)status.textContent=`Deleted ${deleted} archived applicant${deleted===1?'':'s'} permanently.`;

    $('historyCyclesTab')?.click();
    setTimeout(()=>$('historyArchiveTab')?.click(),80);
  }catch(e){
    st.textContent=e?.message||'Unable to delete selected applicants.';
    b.disabled=false;
  }
}

async function checkManage(){
  if(!SB||!workspace()||!token())return false;
  try{
    const r=await SB.rpc('transfer_staff_access_ok',{
      p_workspace_id:workspace(),
      p_token:token(),
      p_manager:true
    });
    canManage=r.data===true;
  }catch{
    canManage=false;
  }
  return canManage;
}

function watchArchive(){
  const host=$('applicantArchiveList');
  if(!host)return;
  if(observer)observer.disconnect();
  observer=new MutationObserver(()=>syncCards());
  observer.observe(host,{childList:true,subtree:true});
  syncCards();
}

async function boot(){
  ensureStyles();
  await checkManage();
  watchArchive();

  $('historyArchiveTab')?.addEventListener('click',()=>{
    selected.clear();
    setTimeout(syncCards,120);
    setTimeout(syncCards,500);
  });

  $('historyCyclesTab')?.addEventListener('click',()=>{
    selected.clear();
    updateBar();
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150),{once:true});
else setTimeout(boot,150);

})();
