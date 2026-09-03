// NEXA TRANSFER WORKSPACE FINISHER V1.6 — PRESENCE / PERSISTENT HISTORY HANDOFF / PROTECTED FORM LIBRARY / SECURE HISTORY DELETE / USERNAME CHANGE
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
let formEventId='';
let formRows=[];

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtNum=n=>{const v=Number(n||0);return Number.isFinite(v)?v.toLocaleString():'0'};
const fmtDate=v=>{if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})};

function getToken(){
  return localStorage.getItem('nexa_transfer_staff_token')||
         sessionStorage.getItem('nexa_transfer_staff_token')||'';
}
function getWorkspaceId(){
  const q=new URLSearchParams(location.search),direct=q.get('workspace');
  if(direct&&/^[0-9a-f-]{36}$/i.test(direct))return direct;
  const input=$('workspaceLink');
  if(input?.value){
    try{
      const u=new URL(input.value,location.href),id=u.searchParams.get('workspace');
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
  #workspaceRoot .heroGrid>div:first-child{position:relative;padding-right:88px}
  .nexa-presence-pill{position:absolute;top:0;right:0;border:1px solid rgba(103,227,172,.24);background:rgba(7,17,39,.72);color:#c9f8e3;border-radius:999px;min-height:28px;padding:5px 8px;display:inline-flex;align-items:center;gap:6px;font-weight:900;font-size:10px;white-space:nowrap;cursor:pointer}
  .nexa-presence-dot{width:6px;height:6px;border-radius:50%;background:#67e3ac;box-shadow:0 0 8px rgba(103,227,172,.7)}
  .nexa-finisher-modal{position:fixed;inset:0;z-index:12000;display:none;place-items:center;padding:14px;background:rgba(0,0,0,.76);backdrop-filter:blur(6px)}
  .nexa-finisher-modal.open{display:grid}.nexa-finisher-card{width:min(560px,100%);max-height:88dvh;overflow:auto;border:1px solid rgba(89,228,255,.28);border-radius:22px;background:linear-gradient(180deg,#091226,#05091a);padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.58)}
  .nexa-finisher-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.nexa-finisher-close{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:#081127;color:white;font-size:20px}
  .nexa-online-list{display:grid;gap:8px;margin-top:14px}.nexa-online-person{padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);display:flex;justify-content:space-between;gap:10px;align-items:center}
  .nexa-online-person small{display:block;color:#91a1c4;margin-top:3px}.nexa-role-pill{flex:0 0 auto;border-radius:999px;padding:5px 8px;border:1px solid rgba(89,228,255,.22);color:#a9f3ff;background:rgba(89,228,255,.06);font-size:10px;font-weight:950}
  .nexa-history-card{width:100%;text-align:left;color:inherit;padding:14px;border-radius:17px;border:1px solid rgba(255,255,255,.10);background:linear-gradient(145deg,rgba(12,22,46,.92),rgba(7,11,28,.94));cursor:pointer}
  .nexa-history-card+.nexa-history-card{margin-top:9px}.nexa-history-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.nexa-history-date{font-weight:950}.nexa-history-state{font-size:10px;color:#8fefff;font-weight:900}.nexa-history-class{font-size:11px;color:#aab4d0;margin-top:5px}
  .nexa-history-mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}.nexa-history-mini div{padding:8px;border-radius:11px;background:rgba(255,255,255,.035);min-width:0}.nexa-history-mini small{display:block;color:#8795b7;font-size:8px;letter-spacing:.06em;text-transform:uppercase}.nexa-history-mini b{display:block;margin-top:3px;font-size:10px;overflow-wrap:anywhere}
  .nexa-history-detail{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.nexa-history-detail div{padding:11px;border-radius:13px;background:rgba(255,255,255,.035)}.nexa-history-detail small{display:block;color:#8795b7;font-size:9px;text-transform:uppercase}.nexa-history-detail b{display:block;margin-top:4px}
  .nexa-form-library-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.nexa-form-count{font-size:10px;font-weight:950;color:#9cefff;border:1px solid rgba(89,228,255,.22);border-radius:999px;padding:5px 8px}
  .nexa-form-list{display:grid;gap:9px;margin-top:10px}.nexa-form-row{padding:12px;border-radius:15px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035)}
  .nexa-form-row.active{border-color:rgba(103,227,172,.42);background:rgba(26,72,58,.12)}.nexa-form-main{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:9px;align-items:center}.nexa-form-main input{width:21px;height:21px;accent-color:#67e3ac}
  .nexa-form-name{font-weight:950;min-width:0;overflow-wrap:anywhere}.nexa-form-meta{font-size:10px;color:#8f9dbd;margin-top:3px}.nexa-form-active{font-size:9px;font-weight:950;color:#8df2c3;border:1px solid rgba(103,227,172,.25);border-radius:999px;padding:4px 7px}
  .nexa-form-protected{font-size:9px;font-weight:950;color:#ffd77d;border:1px solid rgba(255,215,125,.24);border-radius:999px;padding:4px 7px}.nexa-form-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px;padding-left:37px}
  .nexa-form-help{font-size:11px;color:#9aa7c3;line-height:1.45;margin-top:10px}.nexa-form-limit{color:#ffd77d}.nexa-form-password{width:100%;min-height:46px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#071022;color:#fff;font-size:16px}
  @media(max-width:620px){.nexa-history-mini,.nexa-history-detail{grid-template-columns:1fr}#workspaceRoot .heroGrid>div:first-child{padding-right:76px}.nexa-presence-pill{min-height:26px;padding:4px 7px;font-size:9px}.nexa-form-main{grid-template-columns:26px minmax(0,1fr)}.nexa-form-main>span:last-child{grid-column:2}.nexa-form-actions{padding-left:35px}}
  `;
  document.head.appendChild(s);
}
function ensureModal(){
  if($('nexaFinisherModal'))return;
  const m=document.createElement('div');m.id='nexaFinisherModal';m.className='nexa-finisher-modal';
  m.innerHTML=`<div class="nexa-finisher-card"><div class="nexa-finisher-head"><div><div class="tag" id="nexaFinisherTag">NEXA</div><h3 id="nexaFinisherTitle" style="margin:4px 0 0">Details</h3></div><button class="nexa-finisher-close" id="nexaFinisherClose" type="button">×</button></div><div id="nexaFinisherBody"></div></div>`;
  document.body.appendChild(m);$('nexaFinisherClose').onclick=()=>m.classList.remove('open');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
}
function openModal(tag,title,html){ensureModal();$('nexaFinisherTag').textContent=tag;$('nexaFinisherTitle').textContent=title;$('nexaFinisherBody').innerHTML=html;$('nexaFinisherModal').classList.add('open')}
function closeModal(){$('nexaFinisherModal')?.classList.remove('open')}

function ensurePresencePill(){
  if($('nexaPresencePill'))return;
  const hero=document.querySelector('#workspaceRoot .heroGrid > div:first-child');if(!hero)return;
  const b=document.createElement('button');b.id='nexaPresencePill';b.className='nexa-presence-pill';b.type='button';b.innerHTML=`<span class="nexa-presence-dot"></span><span><b id="nexaPresenceCount">1</b> online</span>`;hero.appendChild(b);b.onclick=showPresence;
}
function showPresence(){
  const rows=online.length?online.map(p=>`<div class="nexa-online-person"><div><b>${esc(p.game_name||p.game_id||'Staff')}</b><small>${p.is_self?'You · ':''}${esc(p.game_id||'')}</small></div><span class="nexa-role-pill">${esc(p.role||'Transfer Staff')}</span></div>`).join(''):`<div class="muted" style="margin-top:14px">No active staff detected right now.</div>`;
  openModal('ONLINE NOW',`${online.length} online`,`<div class="nexa-online-list">${rows}</div>`);
}
async function heartbeat(){
  token=getToken();workspaceId=getWorkspaceId();if(!SB||!token||!workspaceId)return;
  try{const {data,error}=await SB.rpc('transfer_workspace_presence_heartbeat',{p_workspace_id:workspaceId,p_token:token});if(error||!data?.ok)return;online=Array.isArray(data.online)?data.online:[];ensurePresencePill();if($('nexaPresenceCount'))$('nexaPresenceCount').textContent=String(data.count??online.length)}catch{}
}
async function leave(){
  token=getToken();workspaceId=getWorkspaceId();if(!token||!workspaceId)return;
  try{fetch(`${SB_URL}/rest/v1/rpc/transfer_workspace_presence_leave`,{method:'POST',keepalive:true,headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({p_workspace_id:workspaceId,p_token:token})})}catch{}
}

function historyRange(h){const start=h.starts_at||null,end=h.ended_at||h.ends_at||null;if(start&&end)return`${fmtDate(start)} – ${fmtDate(end)}`;if(end)return`Ended ${fmtDate(end)}`;if(start)return`Started ${fmtDate(start)}`;return'Transfer Cycle'}
function historyCard(h){
  const ordUsed=Number(h.ordinary_used||0),ordAvail=Number(h.ordinary_available||0),spUsed=Number(h.special_used||0),spAvail=Number(h.special_available||0);
  return `<div class="nexa-history-card" data-nexa-history="${esc(h.id)}" role="button" tabindex="0"><div class="nexa-history-top"><div><div class="nexa-history-date">${esc(historyRange(h))}</div><div class="nexa-history-class">${esc(h.classification||'Ordinary')}</div></div><div style="display:flex;align-items:center;gap:8px"><div class="nexa-history-state">STATE ${esc(h.destination_state||'—')}</div>${canManageHistory?`<button class="btn danger mini" type="button" data-nexa-delete-history="${esc(h.id)}">Delete</button>`:''}</div></div><div class="nexa-history-mini"><div><small>Power Cap</small><b>${fmtNum(h.power_cap)}</b></div><div><small>Ordinary Invites</small><b>${ordUsed} used / ${ordAvail}</b></div><div><small>Special Invites</small><b>${spUsed} used / ${spAvail}</b></div></div></div>`;
}
function openHistory(h){
  if(!h)return;const ordUsed=Number(h.ordinary_used||0),ordAvail=Number(h.ordinary_available||0),spUsed=Number(h.special_used||0),spAvail=Number(h.special_available||0);
  openModal('TRANSFER HISTORY',historyRange(h),`<div class="nexa-history-detail"><div><small>State</small><b>State ${esc(h.destination_state||'—')}</b></div><div><small>Classification</small><b>${esc(h.classification||'Ordinary')}</b></div><div><small>Power Cap</small><b>${fmtNum(h.power_cap)}</b></div><div><small>Ordinary Invites</small><b>${ordUsed} used / ${ordAvail} available</b></div><div><small>Special Invites</small><b>${spUsed} used / ${spAvail} available</b></div><div><small>Total Applicants</small><b>${fmtNum(h.applicants_total)}</b></div></div><p class="muted" style="margin:13px 2px 0">Simple cycle summary only — no activity log.</p>`);
}
async function loadHistory(){
  if(window.NEXA_TRANSFER_PERSISTENT_ARCHIVE_V1)return;
  token=getToken();workspaceId=getWorkspaceId();const box=$('historyList');if(!SB||!token||!workspaceId||!box)return;
  try{
    const access=await SB.rpc('transfer_staff_access_list',{p_workspace_id:workspaceId,p_token:token});canManageHistory=access.data?.ok===true&&access.data?.can_manage===true;
    const {data,error}=await SB.rpc('transfer_workspace_history_summary',{p_workspace_id:workspaceId,p_token:token});if(error||!data?.ok)return;
    const rows=Array.isArray(data.history)?data.history:[];box.innerHTML=rows.length?rows.map(historyCard).join(''):`<div class="empty">No completed Transfer Cycles yet.</div>`;
    box.querySelectorAll('[data-nexa-history]').forEach(card=>{card.onclick=e=>{if(e.target.closest('[data-nexa-delete-history]'))return;openHistory(rows.find(x=>String(x.id)===String(card.dataset.nexaHistory)))};card.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('[data-nexa-delete-history]')){e.preventDefault();openHistory(rows.find(x=>String(x.id)===String(card.dataset.nexaHistory)))}}});
    box.querySelectorAll('[data-nexa-delete-history]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();confirmDeleteHistory(rows.find(x=>String(x.id)===String(btn.dataset.nexaDeleteHistory)))});
  }catch{}
}
function confirmDeleteHistory(h){
  if(!h||!canManageHistory)return;
  openModal('DELETE HISTORY','Delete Transfer Cycle?',`<p class="muted">Delete <b>${esc(historyRange(h))}</b> from History permanently?</p><p class="muted">This removes the archived cycle card and cannot be undone.</p><div class="actions"><button class="btn secondary" type="button" id="nexaCancelDeleteHistory">Cancel</button><button class="btn danger" type="button" id="nexaConfirmDeleteHistory">Delete</button></div><div class="status" id="nexaDeleteHistoryStatus"></div>`);
  $('nexaCancelDeleteHistory').onclick=closeModal;$('nexaConfirmDeleteHistory').onclick=async()=>{const s=$('nexaDeleteHistoryStatus');s.textContent='Deleting…';const {data,error}=await SB.rpc('transfer_workspace_delete_history',{p_workspace_id:workspaceId,p_token:token,p_event_id:h.id});if(error||data?.ok!==true){s.textContent=error?.message||'Unable to delete this History card.';return}closeModal();await loadHistory()};
}
function confirmSecurePersistentHistoryDelete(eventId){
  if(!eventId)return;
  token=getToken();workspaceId=getWorkspaceId();
  openModal('DELETE HISTORY','Delete Transfer Cycle?',`<p class="muted">Permanently delete this Transfer Cycle from History?</p><div class="notice">This will also permanently delete any <b>Ordinary</b> and <b>Special</b> applicant records attached to this cycle. New Applicants, Not Selected, and Next Transfer Cycle are not deleted.</div><label class="field">NEXA Password<input class="nexa-form-password" id="nexaHistoryDeletePassword" type="password" autocomplete="current-password"></label><label class="field">Type CLEAR to continue<input class="nexa-form-password" id="nexaHistoryDeleteConfirmation" type="text" autocomplete="off" autocapitalize="characters"></label><div class="actions"><button class="btn secondary" id="nexaCancelSecureHistoryDelete" type="button">Cancel</button><button class="btn danger" id="nexaConfirmSecureHistoryDelete" type="button">Delete Permanently</button></div><div class="status" id="nexaSecureHistoryDeleteStatus"></div>`);
  $('nexaCancelSecureHistoryDelete').onclick=closeModal;
  $('nexaConfirmSecureHistoryDelete').onclick=async()=>{
    const st=$('nexaSecureHistoryDeleteStatus'),password=$('nexaHistoryDeletePassword').value,confirmation=$('nexaHistoryDeleteConfirmation').value.trim().toUpperCase();
    if(!password){st.textContent='Enter your NEXA password.';return}
    if(confirmation!=='CLEAR'){st.textContent='Type CLEAR to continue.';return}
    st.textContent='Deleting Transfer Cycle…';
    const {data,error}=await SB.rpc('transfer_workspace_delete_history_secure',{p_workspace_id:workspaceId,p_token:token,p_event_id:eventId,p_password:password,p_confirmation:confirmation});
    if(error||data?.ok!==true){const m={invalid_password:'NEXA password is incorrect.',confirmation_required:'Type CLEAR to continue.',manager_required:'Admin Access is required.',history_not_found:'This Transfer Cycle no longer exists.'};st.textContent=m[data?.error]||error?.message||'Unable to delete this Transfer Cycle.';return}
    const card=document.querySelector(`[data-delete-history="${CSS.escape(eventId)}"]`)?.closest('.historyCard');
    if(card)card.remove();
    if(!$('historyList')?.querySelector('.historyCard'))$('historyList').innerHTML='<div class="empty">No completed Transfer Cycles yet.</div>';
    closeModal();
  };
}
function installPersistentHistoryDeleteGuard(){
  if(document.documentElement.dataset.nexaSecureHistoryDelete==='1')return;
  document.documentElement.dataset.nexaSecureHistoryDelete='1';
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('[data-delete-history]');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    confirmSecurePersistentHistoryDelete(btn.dataset.deleteHistory||'');
  },true);
}
function polishHistoryCopy(){if(window.NEXA_TRANSFER_PERSISTENT_ARCHIVE_V1)return;const p=document.querySelector('[data-panel="history"] article.card.full > p.muted');if(p)p.textContent='A simple summary of each completed Transfer Cycle.'}

function enhanceUsernameControl(){
  const myPass=document.querySelector('[data-my-pass]');
  if(!myPass)return;
  const actions=myPass.closest('.actions');
  if(!actions||actions.querySelector('[data-change-username]'))return;
  const b=document.createElement('button');
  b.className='btn secondary mini';
  b.type='button';
  b.dataset.changeUsername='1';
  b.textContent='Change Username';
  b.onclick=openChangeUsername;
  actions.insertBefore(b,myPass.nextSibling);
}
function openChangeUsername(){
  const selfCard=document.querySelector('[data-my-pass]')?.closest('[data-access]');
  const current=selfCard?.querySelector('.staffInfo div:nth-child(2) b')?.textContent?.trim()||'';
  openModal('ACCOUNT','Change Username',`<p class="muted">Choose a new Transfer Workspace username. You will still be able to log in with your Game ID.</p><label class="field">New Username<input class="nexa-form-password" id="nexaNewUsername" type="text" value="${esc(current)}" autocomplete="username" autocapitalize="none" spellcheck="false"></label><label class="field">Current NEXA Password<input class="nexa-form-password" id="nexaUsernamePassword" type="password" autocomplete="current-password"></label><div class="note" style="margin-top:8px">3–32 characters • letters, numbers, dot, underscore or hyphen.</div><div class="actions"><button class="btn secondary" id="nexaCancelUsername" type="button">Cancel</button><button class="btn" id="nexaSaveUsername" type="button">Save Username</button></div><div class="status" id="nexaUsernameStatus"></div>`);
  $('nexaCancelUsername').onclick=closeModal;
  $('nexaSaveUsername').onclick=async()=>{
    const st=$('nexaUsernameStatus'),username=$('nexaNewUsername').value.trim(),password=$('nexaUsernamePassword').value;
    if(!username){st.textContent='Enter a username.';return}
    if(!password){st.textContent='Enter your current NEXA password.';return}
    st.textContent='Saving…';
    const {data,error}=await SB.rpc('transfer_staff_change_username',{p_token:token,p_current_password:password,p_new_username:username});
    if(error||data?.ok!==true){
      const m={wrong_password:'Current password is incorrect.',username_taken:'That username is already in use.',invalid_username_length:'Username must be 3–32 characters.',invalid_username_format:'Use only letters, numbers, dot, underscore or hyphen.',session_expired:'Your session expired. Log in again.'};
      st.textContent=m[data?.error]||error?.message||'Unable to change username.';
      return;
    }
    const selfCard=document.querySelector('[data-my-pass]')?.closest('[data-access]');
    const userCell=selfCard?.querySelector('.staffInfo div:nth-child(2) b');
    if(userCell)userCell.textContent=data.username;
    closeModal();
  };
}

function polishAccess(){
  const panel=document.querySelector('[data-panel="access"]');if(!panel)return;
  const intro=panel.querySelector('article.card.full > p.muted');if(intro)intro.textContent='Owner 👑 = protected owner · Admin ★ = access management · Transfer Staff ☆ = normal transfer operations.';enhanceUsernameControl();
  const w=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);for(const n of nodes){if(!n.nodeValue)continue;n.nodeValue=n.nodeValue.replace(/\bAccess Management\b/g,'Admin Access').replace(/\bManager\b/g,'Admin').replace(/\bmanager\b/g,'admin')}
}

function openWorkspaceOverlay(url,title){
  const ov=$('formOverlay'),frame=$('formFrame'),t=$('overlayTitle');
  if(!ov||!frame)return location.href=url;
  if(t)t.textContent=title;frame.src=url;ov.classList.add('open');
}
function formRowHtml(f){
  const active=!!f.is_active,primary=!!f.is_primary;
  return `<div class="nexa-form-row ${active?'active':''}" data-form-id="${esc(f.id)}">
    <div class="nexa-form-main">
      <input type="checkbox" data-form-select="${esc(f.id)}" ${active?'checked':''} aria-label="Use ${esc(f.name)}">
      <div><div class="nexa-form-name">${esc(f.name)}</div><div class="nexa-form-meta">${primary?'Protected official form':'Custom form'}</div></div>
      <span class="${active?'nexa-form-active':primary?'nexa-form-protected':'nexa-form-meta'}">${active?'ACTIVE':primary?'PROTECTED':''}</span>
    </div>
    ${primary?'':`<div class="nexa-form-actions"><button class="btn secondary mini" type="button" data-form-edit="${esc(f.id)}">Edit</button><button class="btn danger mini" type="button" data-form-delete="${esc(f.id)}" ${active?'disabled':''}>Delete</button></div>`}
  </div>`;
}
async function loadFormLibrary(){
  token=getToken();workspaceId=getWorkspaceId();const card=$('formIntegration');if(!SB||!workspaceId||!card)return;
  try{
    const {data,error}=await SB.rpc('transfer_form_library_workspace',{p_workspace_id:workspaceId,p_token:token||null});
    if(error||data?.ok!==true){card.innerHTML=`<div class="tag">APPLICATION FORM</div><h3>Application Form</h3><p class="muted">${esc(error?.message||data?.error||'Unable to load form library.')}</p>`;return}
    formEventId=data.event_id||'';formRows=Array.isArray(data.forms)?data.forms:[];const count=formRows.length,full=count>=Number(data.limit||3);
    card.innerHTML=`<div class="nexa-form-library-head"><div><div class="tag">APPLICATION FORM</div><h3 style="margin:4px 0">Application Form</h3></div><span class="nexa-form-count">Forms ${count}/3</span></div>
      <p class="muted">Choose which saved form is used for the permanent Transfer Workspace intake. Primary Form is permanent and protected.</p>
      <div class="nexa-form-list">${formRows.map(formRowHtml).join('')}</div>
      <div class="actions"><button class="btn" id="nexaCreateTransferForm" type="button" ${full?'disabled':''}>Create New Form</button></div>
      <div class="nexa-form-help ${full?'nexa-form-limit':''}">${full?'Maximum reached. Delete an inactive Custom Form before creating another.':'Primary Form + up to 2 Custom Forms.'}</div>`;
    card.querySelectorAll('[data-form-select]').forEach(x=>x.onchange=e=>{const f=formRows.find(r=>String(r.id)===String(x.dataset.formSelect));if(!f)return;if(f.is_active){x.checked=true;return}x.checked=false;confirmActivateForm(f)});
    card.querySelectorAll('[data-form-edit]').forEach(b=>b.onclick=()=>openWorkspaceOverlay(`transfer-form-custom.html?event=${encodeURIComponent(formEventId)}&template=${encodeURIComponent(b.dataset.formEdit)}&workspace=1`,'Edit Custom Form'));
    card.querySelectorAll('[data-form-delete]').forEach(b=>b.onclick=()=>confirmDeleteForm(formRows.find(r=>String(r.id)===String(b.dataset.formDelete))));
    $('nexaCreateTransferForm')?.addEventListener('click',()=>openWorkspaceOverlay(`transfer-form-custom.html?event=${encodeURIComponent(formEventId)}&new=1&workspace=1`,'Create New Form'));
  }catch(e){card.innerHTML=`<div class="tag">APPLICATION FORM</div><h3>Application Form</h3><p class="muted">${esc(e.message||'Unable to load form library.')}</p>`}
}
async function confirmActivateForm(f){
  openModal('APPLICATION FORM','Confirm Active Form',`<p class="muted">Switch the active Transfer application to <b>${esc(f.name)}</b>?</p><p class="muted">NEXA already knows your account. Enter your personal NEXA password to confirm this change.</p><label class="field">NEXA Password<input class="nexa-form-password" id="nexaFormPassword" type="password" autocomplete="current-password"></label><div class="actions"><button class="btn secondary" id="nexaCancelFormSwitch" type="button">Cancel</button><button class="btn" id="nexaConfirmFormSwitch" type="button">Confirm</button></div><div class="status" id="nexaFormSwitchStatus"></div>`);
  $('nexaCancelFormSwitch').onclick=closeModal;
  $('nexaConfirmFormSwitch').onclick=async()=>{
    const st=$('nexaFormSwitchStatus'),password=$('nexaFormPassword').value;
    if(!password){st.textContent='Enter your NEXA password.';return}
    st.textContent='Verifying…';
    const {data:{session}}=await SB.auth.getSession(),user=session?.user;
    if(!user?.email){st.textContent='Sign in to your NEXA account first. Password confirmation requires your personal NEXA session.';return}
    const verify=await SB.auth.signInWithPassword({email:user.email,password});
    if(verify.error||verify.data?.user?.id!==user.id){st.textContent='Password incorrect. Active form was not changed.';return}
    st.textContent='Switching form…';
    const r=await SB.rpc('transfer_form_template_activate',{p_event_id:formEventId,p_template_id:f.id,p_token:token||null});
    if(r.error||r.data?.ok!==true){st.textContent=r.error?.message||r.data?.error||'Unable to switch form.';return}
    closeModal();await loadFormLibrary();
  };
}
function confirmDeleteForm(f){
  if(!f||f.is_primary||f.is_active)return;
  openModal('DELETE FORM','Delete Custom Form?',`<p class="muted">Delete <b>${esc(f.name)}</b> permanently?</p><p class="muted">Primary Form cannot be deleted. Active forms must be switched before deletion.</p><div class="actions"><button class="btn secondary" id="nexaCancelFormDelete" type="button">Cancel</button><button class="btn danger" id="nexaConfirmFormDelete" type="button">Delete Form</button></div><div class="status" id="nexaFormDeleteStatus"></div>`);
  $('nexaCancelFormDelete').onclick=closeModal;
  $('nexaConfirmFormDelete').onclick=async()=>{const st=$('nexaFormDeleteStatus');st.textContent='Deleting…';const r=await SB.rpc('transfer_form_template_delete',{p_event_id:formEventId,p_template_id:f.id,p_token:token||null});if(r.error||r.data?.ok!==true){st.textContent=r.error?.message||r.data?.error||'Unable to delete form.';return}closeModal();await loadFormLibrary()};
}
function attachTabHooks(){
  document.querySelectorAll('.tab').forEach(btn=>{
    if(btn.dataset.nexaFinisherHooked)return;btn.dataset.nexaFinisherHooked='1';
    btn.addEventListener('click',()=>{if(btn.dataset.tab==='history')setTimeout(loadHistory,80);if(btn.dataset.tab==='access')setTimeout(polishAccess,80);if(btn.dataset.tab==='integrations')setTimeout(loadFormLibrary,80)});
  });
  $('closeOverlay')?.addEventListener('click',()=>setTimeout(loadFormLibrary,120));
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='nexa-transfer-form-saved')setTimeout(loadFormLibrary,120)});
}
function start(){
  if(booted)return;token=getToken();workspaceId=getWorkspaceId();const app=$('workspaceRoot');if(!SB||!workspaceId||!app||app.classList.contains('hidden'))return;
  booted=true;injectStyles();ensureModal();ensurePresencePill();installPersistentHistoryDeleteGuard();polishHistoryCopy();polishAccess();attachTabHooks();heartbeat();loadHistory();loadFormLibrary();
  presenceTimer=setInterval(heartbeat,30000);historyTimer=setInterval(()=>{const hp=document.querySelector('[data-panel="history"]');if(hp?.classList.contains('active'))loadHistory();const ap=document.querySelector('[data-panel="access"]');if(ap?.classList.contains('active'))polishAccess();const ip=document.querySelector('[data-panel="integrations"]');if(ip?.classList.contains('active'))loadFormLibrary()},15000);
  window.addEventListener('pagehide',leave,{once:true});
}
const bootTimer=setInterval(()=>{start();if(booted)clearInterval(bootTimer)},500);setTimeout(start,50);
})();
