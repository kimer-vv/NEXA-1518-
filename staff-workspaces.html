/* NEXA Shared Workspace UI V4.0
 * One global navigation + one Access Management visual system.
 * Transfer / Ministry / WOS Utilities share the same cards, modal, roles and 7-day restore flow.
 */
(()=>{'use strict';
if(window.__NEXA_SHARED_V4__) return;
window.__NEXA_SHARED_V4__=true;

const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SUPA,PUB);
if(!sb) return;

const file=(location.pathname.split('/').pop()||'').toLowerCase();
const MODULE=file.startsWith('transfer-')?'transfer':file.startsWith('ministry-')?'ministry':file.startsWith('wos-utilities')?'wos':file.startsWith('gift-code-')?'gift':'';
const q=new URLSearchParams(location.search);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getToken=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const getState=()=>Number(localStorage.getItem('nexa_active_state')||sessionStorage.getItem('nexa_active_state')||localStorage.getItem('nexa_active_state_v49')||sessionStorage.getItem('nexa_active_state_v49')||q.get('state')||0);
const getWorkspace=()=>q.get('workspace')||'';
let modules=[], accessMode=MODULE==='wos'?'wos':MODULE, accessData=null, selectedAlliance='', renderBusy=false, modalMember=null;

async function rpc(name,args){
 const {data,error}=await sb.rpc(name,args);
 if(error) throw Error(error.message||String(error));
 return data;
}
function stateSync(){
 const n=getState(),t=getToken(); if(!n||!t)return;
 window.NEXA_ACTIVE_STATE=n;
 const store=localStorage.getItem('nexa_transfer_staff_token')===t?localStorage:sessionStorage;
 store.setItem('nexa_active_state',String(n));
 store.setItem('nexa_active_state_v49',String(n));
}
function clearSession(){
 for(const s of [localStorage,sessionStorage]){
  s.removeItem('nexa_transfer_staff_token');
  s.removeItem('nexa_active_state');
  s.removeItem('nexa_active_state_v49');
 }
}
function hubUrl(reason=''){
 const u=new URL('staff-workspaces.html',location.href);
 const here=(location.pathname.split('/').pop()||'')+location.search;
 if(here&&!here.toLowerCase().startsWith('staff-workspaces.html'))u.searchParams.set('next',here);
 if(reason)u.searchParams.set('reason',reason);
 return u.href;
}
function moduleLabel(m){return m.module==='transfer'?'Transfer':m.module==='ministry'?'Ministry':'WOS Utilities'}
function sameState(m){return !getState()||!m?.state_number||Number(m.state_number)===getState()}
function normalizeModules(rows){
 const seen=new Set(),out=[];
 for(const m of rows||[]){
  if(!m?.url||!sameState(m))continue;
  const k=m.module||m.url;if(seen.has(k))continue;
  seen.add(k);out.push(m);
 }
 const order={transfer:1,ministry:2,gift:3,wos:3};
 return out.sort((a,b)=>(order[a.module]||9)-(order[b.module]||9));
}
function exactCurrent(){
 return modules.find(m=>m.module===MODULE&&sameState(m))||modules.find(m=>m.module===MODULE)||null;
}
function currentMatches(url){
 try{
  const a=new URL(url,location.href),b=new URL(location.href);
  if(a.pathname!==b.pathname)return false;
  const aw=a.searchParams.get('workspace'),bw=b.searchParams.get('workspace');
  return !aw||!bw||aw===bw;
 }catch{return false}
}
function enforceNav(){
 const sel=$('workspaceSwitch')||$('moduleSwitch'); if(!sel||!modules.length)return;
 const current=exactCurrent(), sig=modules.map(m=>`${moduleLabel(m)}|${m.url}`).join('||');
 const now=[...sel.options].map(o=>`${o.text}|${o.value}`).join('||');
 if(sig!==now){
  sel.replaceChildren(...modules.map(m=>new Option(moduleLabel(m),m.url,false,current?m===current:currentMatches(m.url))));
 }
 if(current&&[...sel.options].some(o=>o.value===current.url))sel.value=current.url;
 sel.onchange=()=>{const u=sel.value;if(u&&!currentMatches(u))location.href=u};
}

/* ---------- shared visual language ---------- */
function installCss(){
 if($('nexaSharedV4Css'))return;
 const st=document.createElement('style');st.id='nexaSharedV4Css';st.textContent=`
 #workspaceSwitch,#moduleSwitch{
   min-height:48px!important;max-width:240px!important;width:100%!important;
   border-radius:16px!important;border:1px solid rgba(132,146,232,.48)!important;
   background:#11182f!important;color:#fff!important;padding:10px 42px 10px 16px!important;
   font-weight:850!important;font-size:15px!important;box-shadow:none!important
 }
 .nexaAccessHost>:not(#nexaUnifiedAccessRoot){display:none!important}
 #staffView.nexaAccessHost>.backbar{display:flex!important}
 #staffView.nexaAccessHost>:not(.backbar):not(#nexaUnifiedAccessRoot){display:none!important}
 #nexaUnifiedAccessRoot{display:block!important;width:100%;color:#f7f8ff}
 .nua-stack{display:grid;gap:14px}
 .nua-card{border:1px solid rgba(149,167,255,.23);border-radius:23px;padding:18px;background:linear-gradient(145deg,rgba(16,24,51,.96),rgba(8,13,30,.98))}
 .nua-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
 .nua-kicker{font-size:9px;letter-spacing:.16em;color:#91a2ca;font-weight:950}
 .nua-title{font-size:25px;font-weight:950;margin:5px 0 4px}
 .nua-muted{color:#aab5d1;line-height:1.5}
 .nua-tabs{display:flex;gap:7px;overflow:auto;margin-top:12px}
 .nua-tab{flex:0 0 auto;border:1px solid rgba(149,167,255,.25)!important;background:#10172c!important;color:#b7c2dd!important;border-radius:999px!important;padding:9px 13px!important;min-height:39px!important;font-size:12px!important}
 .nua-tab.active{color:#fff!important;border-color:rgba(89,228,255,.55)!important;background:linear-gradient(135deg,rgba(91,67,190,.72),rgba(28,139,176,.62))!important}
 .nua-form{display:grid;grid-template-columns:minmax(0,1fr) 210px auto;gap:9px;align-items:end;margin-top:14px}
 .nua-label{display:grid;gap:6px;color:#c3cde4;font-size:12px;font-weight:850}
 .nua-input,.nua-select{width:100%;min-height:44px;border:1px solid rgba(149,167,255,.28);border-radius:13px;background:#0b1228;color:#fff;padding:10px 12px;font:inherit}
 .nua-btn{min-height:42px;border:1px solid rgba(89,228,255,.34);border-radius:13px;background:linear-gradient(135deg,rgba(79,62,174,.86),rgba(21,137,171,.75));color:#fff;padding:9px 14px;font-weight:900}
 .nua-btn.secondary{background:#121a31}.nua-btn.danger{background:#4d1d35;border-color:#9d4768}
 .nua-status{min-height:18px;margin-top:9px;font-size:12px;color:#8ee9ce}
 .nua-status.bad{color:#ff9db7}
 .nua-scope{display:grid;grid-template-columns:1fr;gap:6px;margin-top:12px}
 .nua-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}
 .nua-member{--tone:#ffb58f;min-width:0;padding:13px;border-radius:18px;border:1px solid color-mix(in srgb,var(--tone) 40%,transparent);background:color-mix(in srgb,var(--tone) 8%,#0a1024);box-shadow:inset 4px 0 0 color-mix(in srgb,var(--tone) 72%,transparent)}
 .nua-member.admin{--tone:#e6a0ff}.nua-member.owner{--tone:#d995ff}.nua-member.wos{--tone:#9be8ff}.nua-member.removed{--tone:#aeb8cf;opacity:.82;border-style:dashed}
 .nua-name{font-size:15px;font-weight:1000;color:var(--tone);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .nua-role{margin-top:5px;color:#a4afc8;font-size:9px;font-weight:950;letter-spacing:.06em}
 .nua-id{margin-top:9px;color:#e5ecfa;font-size:10px;font-weight:950}
 .nua-view{width:100%;margin-top:10px}
 .nua-recent-head{display:flex;justify-content:space-between;gap:10px;align-items:end;margin-top:5px}
 .nua-recent-head h3{margin:3px 0 0}.nua-recent-head small{color:#9da8c4}
 .nua-empty{padding:18px;text-align:center;color:#96a3c2;border:1px dashed rgba(255,255,255,.12);border-radius:16px}
 #nexaAccessModal{position:fixed;inset:0;z-index:50000;display:none;place-items:center;padding:14px;background:rgba(0,0,0,.78);backdrop-filter:blur(7px)}
 #nexaAccessModal.open{display:grid}
 #nexaAccessModal .nua-modal-card{width:min(560px,100%);max-height:90dvh;overflow:auto;border:1px solid rgba(149,167,255,.34);border-radius:24px;background:#0b1125;padding:19px}
 .nua-modal-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
 .nua-x{width:44px;height:44px;border-radius:50%;border:1px solid rgba(89,228,255,.3);background:#091429;color:#ddfbff;font-size:23px}
 .nua-detail{display:grid;gap:9px;margin:16px 0}
 .nua-detail-row{padding:11px 13px;border-radius:15px;background:#121a31;border:1px solid rgba(255,255,255,.05)}
 .nua-detail-row small{display:block;color:#8f9ec2;font-size:9px;letter-spacing:.1em;font-weight:950}.nua-detail-row b{display:block;margin-top:5px}
 .nua-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.nua-actions .nua-btn{flex:1 1 145px}
 .nua-code{padding:14px;border:1px solid rgba(89,228,255,.25);background:rgba(89,228,255,.06);border-radius:15px;font-size:20px;font-weight:950;text-align:center;letter-spacing:.05em}
 @media(max-width:700px){
   .nua-form{grid-template-columns:1fr}
   .nua-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
   #workspaceSwitch,#moduleSwitch{max-width:220px!important}
 }
 @media(max-width:420px){
   .nua-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
   .nua-member{padding:10px}.nua-name{font-size:13px}
 }
 `;
 document.head.appendChild(st);
}

/* ---------- access manager ---------- */
function host(){
 if(MODULE==='transfer')return document.querySelector('[data-panel="access"]');
 if(MODULE==='ministry')return $('accessAdmin')?.closest('.access-shell')||$('view-access');
 if(MODULE==='wos')return $('staffView');
 return null;
}
function ensureAccessRoot(){
 const h=host();if(!h)return null;
 h.classList.add('nexaAccessHost');
 let root=$('nexaUnifiedAccessRoot');
 if(!root){root=document.createElement('section');root.id='nexaUnifiedAccessRoot';h.appendChild(root)}
 return root;
}
function roleOptions(mode){
 if(mode==='wos')return [['r4','R4'],['r5','R5 â¢ Access Management']];
 if(mode==='gift')return [['alliance_manager','Alliance Manager'],['redeemer_admin','State Admin']];
 if(mode==='ministry')return [['regular','Regular Access'],['admin','Administrative Access']];
 return [['regular','Regular Access'],['admin','Access Management']];
}
function roleLabel(role,mode=accessMode){
 if(role==='owner')return'Owner';
 if(mode==='wos')return role==='r5'?'R5 â¢ Access Management':'R4';
 if(mode==='gift')return role==='redeemer_admin'?'State Admin':'Alliance Manager';
 if(mode==='ministry')return role==='admin'?'Administrative Access':'Regular Access';
 return role==='admin'?'Access Management':'Regular Access';
}
function memberTone(m){
 if(m.is_owner||m.role==='owner')return'owner';
 if(['admin','r5','redeemer_admin'].includes(m.role))return'admin';
 if(accessMode==='wos')return'wos';
 return'';
}
function listArgs(mode=accessMode){
 const args={p_token:getToken(),p_module:mode,p_workspace_id:null,p_state_number:null,p_alliance_id:null};
 if(mode==='transfer'||mode==='ministry')args.p_workspace_id=getWorkspace()||exactCurrent()?.workspace_id||null;
 else {args.p_state_number=getState()||null;args.p_alliance_id=selectedAlliance||null}
 return args;
}
function friendlyError(e){
 const s=String(e?.message||e||'');
 const map={
  r5_already_assigned:'This alliance already has an active R5. Change that R5 to R4 first.',
  forbidden:'You do not have permission for this action.',
  restore_window_expired:'The 7-day restore window has expired.',
  not_registered:'This Game ID has not completed staff registration yet.',
  invalid_game_id:'Enter a valid Game ID.',
  alliance_required:'Choose an alliance first.'
 };
 return map[s]||s.replaceAll('_',' ');
}
async function loadAccess(){
 const root=ensureAccessRoot();if(!root)return;
 root.innerHTML='<div class="nua-card nua-muted">Loading Access Managementâ¦</div>';
 try{
  const d=await rpc('nexa_workspace_access_list_v1',listArgs());
  if(!d?.ok)throw Error(d?.error||'Unable to load access.');
  accessData=d;
  if((accessMode==='wos'||accessMode==='gift')&&!selectedAlliance){
   const scopes=d.scopes||[];
   if(scopes.length===1)selectedAlliance=String(scopes[0].id);
  }
  if((accessMode==='wos'||accessMode==='gift')&&selectedAlliance){
   const d2=await rpc('nexa_workspace_access_list_v1',listArgs());
   if(d2?.ok)accessData=d2;
  }
  renderAccess();
 }catch(e){root.innerHTML=`<div class="nua-card"><div class="nua-status bad">${esc(friendlyError(e))}</div></div>`}
}
function scopeHtml(){
 if(!['wos','gift'].includes(accessMode))return'';
 const scopes=accessData?.scopes||[];
 if(!scopes.length)return'';
 return `<div class="nua-scope"><label class="nua-label">Alliance<select id="nuaAlliance" class="nua-select"><option value="">All authorized alliances</option>${scopes.map(s=>`<option value="${esc(s.id)}" ${String(selectedAlliance)===String(s.id)?'selected':''}>${esc(s.tag)}${s.name?' â¢ '+esc(s.name):''}</option>`).join('')}</select></label></div>`;
}
function moduleTabs(){
 if(MODULE!=='wos')return'';
 return `<div class="nua-tabs"><button class="nua-tab ${accessMode==='wos'?'active':''}" data-nua-module="wos">WOS Utilities</button><button class="nua-tab ${accessMode==='gift'?'active':''}" data-nua-module="gift">Gift Codes</button></div>`;
}
function renderAccess(){
 const root=ensureAccessRoot();if(!root||!accessData)return;
 const can=!!accessData.can_manage, members=accessData.members||[], removed=accessData.recently_removed||[];
 const opts=roleOptions(accessMode);
 const title=accessMode==='transfer'?'Transfer Staff':accessMode==='ministry'?'Ministry Staff':accessMode==='gift'?'Gift Code Staff':'WOS Utility Staff';
 root.innerHTML=`<div class="nua-stack">
  <section class="nua-card">
   <div class="nua-head"><div><div class="nua-kicker">ACCESS MANAGEMENT</div><div class="nua-title">${title}</div><div class="nua-muted">Authorize by Game ID. Username is not used anywhere in NEXA staff access.</div></div></div>
   ${moduleTabs()}${scopeHtml()}
  </section>
  ${can?`<section class="nua-card"><div class="nua-kicker">ADD ACCESS</div><div class="nua-title" style="font-size:20px">+ Add ${title.replace(' Staff','')} Staff</div>
   <div class="nua-form"><label class="nua-label">Game ID<input id="nuaGameId" class="nua-input" inputmode="numeric" placeholder="Enter Game ID"></label>
   <label class="nua-label">Role<select id="nuaRole" class="nua-select">${opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
   <button id="nuaAdd" class="nua-btn">Add Staff</button></div><div id="nuaStatus" class="nua-status"></div>
  </section>`:''}
  <section class="nua-card"><div class="nua-grid">${members.length?members.map(memberCard).join(''):'<div class="nua-empty" style="grid-column:1/-1">No staff access yet.</div>'}</div></section>
  ${can&&removed.length?`<section class="nua-card"><div class="nua-recent-head"><div><div class="nua-kicker">RECENTLY REMOVED</div><h3>Restore Access</h3></div><small>Available for 7 days</small></div><div class="nua-grid">${removed.map(m=>memberCard(m,true)).join('')}</div></section>`:''}
 </div>`;
 bindAccess();
}
function memberCard(m,removed=false){
 return `<article class="nua-member ${memberTone(m)} ${removed?'removed':''}" data-nua-member="${esc(m.access_id)}" data-removed="${removed?'1':'0'}">
   <div class="nua-name">${esc(m.game_name||m.game_id||'Staff')}</div>
   <div class="nua-role">${esc(roleLabel(m.role).toUpperCase())} â¢ ${esc(String(m.status||'active').toUpperCase())}</div>
   <div class="nua-id">Game ID ${esc(m.game_id)}</div>
   ${m.alliance_tag?`<div class="nua-id">${esc(m.alliance_tag)}</div>`:''}
   <button class="nua-btn secondary nua-view">View</button>
 </article>`;
}
function bindAccess(){
 document.querySelectorAll('[data-nua-module]').forEach(b=>b.onclick=async()=>{accessMode=b.dataset.nuaModule;selectedAlliance='';await loadAccess()});
 $('nuaAlliance')?.addEventListener('change',async e=>{selectedAlliance=e.target.value;await loadAccess()});
 $('nuaAdd')?.addEventListener('click',async()=>{
  const id=$('nuaGameId').value.trim(),role=$('nuaRole').value,status=$('nuaStatus');status.classList.remove('bad');status.textContent='Adding accessâ¦';
  try{
   const d=await rpc('nexa_workspace_access_add_v1',{...listArgs(),p_game_id:id,p_role:role});
   if(!d?.ok)throw Error(d?.error||'Unable to add access.');
   status.textContent=d.status==='pending_registration'?'Access authorized. Waiting for staff registration.':'Access added â';
   await loadAccess();
  }catch(e){status.classList.add('bad');status.textContent=friendlyError(e)}
 });
 document.querySelectorAll('[data-nua-member]').forEach(c=>c.querySelector('.nua-view').onclick=()=>openMember(c.dataset.nuaMember,c.dataset.removed==='1'));
}
function findMember(id,removed=false){
 const arr=removed?(accessData?.recently_removed||[]):(accessData?.members||[]);
 return arr.find(x=>String(x.access_id)===String(id));
}
function ensureModal(){
 let m=$('nexaAccessModal');if(m)return m;
 m=document.createElement('div');m.id='nexaAccessModal';document.body.appendChild(m);return m;
}
function openMember(id,removed=false){
 const m=findMember(id,removed);if(!m)return;modalMember={...m,removed};
 const modal=ensureModal(),can=!!accessData?.can_manage,protectedOwner=!!m.is_owner||m.role==='owner';
 const opts=roleOptions(accessMode);
 const roleEditor=can&&!protectedOwner&&!removed&&accessMode!=='gift'?`<label class="nua-label">Role<select id="nuaEditRole" class="nua-select">${opts.map(([v,l])=>`<option value="${v}" ${m.role===v?'selected':''}>${l}</option>`).join('')}</select></label><button id="nuaSaveRole" class="nua-btn">Save Role</button>`:'';
 const restore=can&&removed?`<button id="nuaRestore" class="nua-btn">Restore Access</button>`:'';
 const recovery=can&&!removed&&m.registered?`<button id="nuaRecovery" class="nua-btn secondary">Generate Recovery Code</button>`:'';
 const remove=can&&!protectedOwner&&!removed?`<button id="nuaRemove" class="nua-btn danger">Remove Access</button>`:'';
 modal.innerHTML=`<section class="nua-modal-card">
   <div class="nua-modal-top"><div><div class="nua-kicker">ACCESS MEMBER</div><div class="nua-title">${esc(m.game_name||m.game_id)}</div></div><button id="nuaClose" class="nua-x">Ã</button></div>
   <div class="nua-detail">
    <div class="nua-detail-row"><small>STATUS</small><b>${removed?'Removed â¢ Restore available for 7 days':esc(String(m.status||'active').toUpperCase())}</b></div>
    <div class="nua-detail-row"><small>ACCESS</small><b>${esc(roleLabel(m.role))}</b></div>
    <div class="nua-detail-row"><small>GAME ID</small><b>${esc(m.game_id)}</b></div>
    <div class="nua-detail-row"><small>STAFF LOGIN</small><b>${m.registered?'Registered':'Pending Registration'}</b></div>
    ${m.alliance_tag?`<div class="nua-detail-row"><small>ALLIANCE</small><b>${esc(m.alliance_tag)}</b></div>`:''}
   </div>
   ${roleEditor?`<div class="nua-actions">${roleEditor}</div>`:''}
   <div class="nua-actions">${recovery}${restore}${remove}<button id="nuaClose2" class="nua-btn secondary">Close</button></div>
   <div id="nuaModalStatus" class="nua-status"></div>
  </section>`;
 modal.classList.add('open');
 $('nuaClose').onclick=$('nuaClose2').onclick=()=>modal.classList.remove('open');
 $('nuaSaveRole')?.addEventListener('click',saveRole);
 $('nuaRemove')?.addEventListener('click',removeMember);
 $('nuaRestore')?.addEventListener('click',restoreMember);
 $('nuaRecovery')?.addEventListener('click',recoveryCode);
}
async function saveRole(){
 const status=$('nuaModalStatus');status.classList.remove('bad');status.textContent='Saving roleâ¦';
 try{
  const d=await rpc('nexa_workspace_access_set_role_v1',{...listArgs(),p_access_id:modalMember.access_id,p_role:$('nuaEditRole').value});
  if(!d?.ok)throw Error(d?.error||'Unable to change role.');
  status.textContent='Role updated â';await loadAccess();ensureModal().classList.remove('open');
 }catch(e){status.classList.add('bad');status.textContent=friendlyError(e)}
}
async function removeMember(){
 if(!confirm(`Remove access for ${modalMember.game_name||modalMember.game_id}? Access stops immediately. You can restore it for 7 days.`))return;
 const status=$('nuaModalStatus');status.classList.remove('bad');status.textContent='Removing accessâ¦';
 try{
  const d=await rpc('nexa_workspace_access_remove_v1',{...listArgs(),p_access_id:modalMember.access_id});
  if(!d?.ok)throw Error(d?.error||'Unable to remove access.');
  ensureModal().classList.remove('open');await loadAccess();
 }catch(e){status.classList.add('bad');status.textContent=friendlyError(e)}
}
async function restoreMember(){
 const status=$('nuaModalStatus');status.classList.remove('bad');status.textContent='Restoring accessâ¦';
 try{
  const d=await rpc('nexa_workspace_access_restore_v1',{...listArgs(),p_access_id:modalMember.access_id});
  if(!d?.ok)throw Error(d?.error||'Unable to restore access.');
  ensureModal().classList.remove('open');await loadAccess();
 }catch(e){status.classList.add('bad');status.textContent=friendlyError(e)}
}
async function recoveryCode(){
 const status=$('nuaModalStatus');status.classList.remove('bad');status.textContent='Generating recovery codeâ¦';
 try{
  const d=await rpc('nexa_workspace_generate_recovery_v1',{...listArgs(),p_access_id:modalMember.access_id});
  if(!d?.ok)throw Error(d?.error||'Unable to generate code.');
  const modal=ensureModal();modal.querySelector('.nua-modal-card').innerHTML=`<div class="nua-kicker">TEMPORARY RECOVERY CODE</div><div class="nua-title">${esc(modalMember.game_name||modalMember.game_id)}</div><div class="nua-code">${esc(d.code)}</div><p class="nua-muted">Valid for 30 minutes and one use.</p><div class="nua-actions"><button id="nuaCopyCode" class="nua-btn">Copy Code</button><button id="nuaRecoveryClose" class="nua-btn secondary">Close</button></div>`;
  $('nuaCopyCode').onclick=async()=>{await navigator.clipboard.writeText(d.code);$('nuaCopyCode').textContent='Copied â'};
  $('nuaRecoveryClose').onclick=()=>modal.classList.remove('open');
 }catch(e){status.classList.add('bad');status.textContent=friendlyError(e)}
}

/* ---------- boot ---------- */
async function boot(){
 if(!MODULE)return;
 installCss();stateSync();
 const token=getToken();if(!token){location.replace(hubUrl('sign_in_required'));return}
 try{
  const [session,access]=await Promise.all([
   rpc('transfer_staff_session',{p_token:token}),
   rpc('nexa_staff_workspace_access_v1',{p_token:token})
  ]);
  if(!session?.ok||!access?.ok){clearSession();location.replace(hubUrl('session_expired'));return}
  modules=normalizeModules(access.modules||session.modules||[]);
  const mine=exactCurrent();
  if(!mine&&MODULE!=='gift'){location.replace(hubUrl('no_access'));return}
  if((MODULE==='transfer'||MODULE==='ministry')&&!getWorkspace()&&mine?.workspace_id){
   const u=new URL(mine.url,location.href);location.replace(u.href);return;
  }
  enforceNav();
  const obs=new MutationObserver(()=>{enforceNav();ensureAccessRoot()});
  obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  [100,350,800,1600,3000].forEach(ms=>setTimeout(enforceNav,ms));
  setTimeout(loadAccess,500);
  window.addEventListener('pageshow',()=>{setTimeout(enforceNav,0);setTimeout(loadAccess,250)});
 }catch(e){
  console.warn('NEXA shared boot failed',e);
  const msg=String(e?.message||e||'').toLowerCase();
  if(/session|token|jwt|unauthoriz/.test(msg))clearSession();
  location.replace(hubUrl(/session|token|jwt|unauthoriz/.test(msg)?'session_expired':'workspace_error'));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();