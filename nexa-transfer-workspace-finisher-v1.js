// NEXA TRANSFER WORKSPACE FINISHER V2.8 — PERSISTENT GROUPS FOLDER / GROUP REMOVAL SAFEGUARDS / STABILITY
(()=>{
'use strict';

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const SB=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;

let workspaceId='',token='',online=[],groups=[],groupMode=false,activeGroup=null,profileRows=[],canManage=false,booted=false,formEventId='',formRows=[],presenceTimer=null,refreshTimer=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=Number(n||0);return !n?'—':n>=1e9?(n/1e9).toFixed(2).replace(/\.00$/,'')+'B':n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':n.toLocaleString()};
const validTime=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||'').trim());
const isHalfHour=v=>/^([01]\d|2[0-3]):(?:00|30)$/.test(String(v||'').trim());
function getToken(){return localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||''}
function getWorkspaceId(){const q=new URLSearchParams(location.search),d=q.get('workspace');if(d&&/^[0-9a-f-]{36}$/i.test(d))return d;const i=$('workspaceLink');if(i?.value){try{const u=new URL(i.value,location.href),x=u.searchParams.get('workspace');if(x)return x}catch{}}return''}
async function copyText(t,b){try{await navigator.clipboard.writeText(String(t||''));if(b){const o=b.textContent;b.textContent='Copied ✓';setTimeout(()=>b.textContent=o,1000)}}catch{}}

function injectStyles(){
 if($('nexaFinisherStylesV17'))return;
 const s=document.createElement('style');s.id='nexaFinisherStylesV17';s.textContent=`
 #workspaceRoot .heroGrid>div:first-child{position:relative;padding-right:88px}
 .nexa-presence-pill{position:absolute;top:0;right:0;border:1px solid rgba(103,227,172,.24);background:rgba(7,17,39,.72);color:#c9f8e3;border-radius:999px;min-height:28px;padding:5px 8px;display:inline-flex;align-items:center;gap:6px;font-weight:900;font-size:10px;white-space:nowrap}
 .nexa-presence-dot{width:6px;height:6px;border-radius:50%;background:#67e3ac;box-shadow:0 0 8px rgba(103,227,172,.7)}
 .nexa-finisher-modal{position:fixed;inset:0;z-index:12000;display:none;place-items:center;padding:14px;background:rgba(0,0,0,.76);backdrop-filter:blur(6px)}.nexa-finisher-modal.open{display:grid}
 .nexa-finisher-card{width:min(620px,100%);max-height:90dvh;overflow:auto;border:1px solid rgba(89,228,255,.28);border-radius:22px;background:linear-gradient(180deg,#091226,#05091a);padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.58)}
 .nexa-finisher-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.nexa-finisher-close{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:#081127;color:white;font-size:20px}
 .nexa-group-view{display:none;margin-top:10px}.nexa-group-view.open{display:block}.nexa-group-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.nexa-group-list{display:grid;gap:9px;margin-top:12px}
 .nexa-group-row{padding:13px;border-radius:17px;border:1px solid rgba(255,255,255,.10);background:linear-gradient(145deg,rgba(12,22,46,.92),rgba(7,11,28,.94));cursor:pointer}.nexa-group-row:hover{border-color:rgba(89,228,255,.30)}
 .nexa-group-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.nexa-pill{display:inline-flex;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);font-size:9px;font-weight:950}.nexa-pill.good{color:#8df2c3;border-color:rgba(103,227,172,.25)}.nexa-pill.warn{color:#ffe39a;border-color:rgba(255,213,109,.25)}
 .nexa-group-members{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.nexa-member{padding:13px;border-radius:18px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);min-width:0}.nexa-member.gold{border-color:rgba(255,213,109,.56);box-shadow:inset 3px 0 0 rgba(255,213,109,.86)}.nexa-member.blue{border-color:rgba(115,207,255,.52);box-shadow:inset 3px 0 0 rgba(115,207,255,.82)}
 .nexa-member-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.nexa-member-actions select,.nexa-member-actions button{width:100%;min-height:38px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:#071022;color:#fff;padding:7px;font-size:10px;font-weight:850}.nexa-member-actions .wide{grid-column:1/-1}
 .nexa-copy-id{border:0;background:none;color:#8fefff;padding:0;font-size:10px;font-weight:900}.nexa-inline-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.timeInputs{align-items:start!important}.timeInputs .time24{height:46px!important;min-height:46px!important;max-height:46px!important;align-self:start!important}.timeInputs .nexa-manual-wrap{align-self:start!important}
.nexa-manual-wrap{display:grid;grid-template-columns:1fr;gap:6px;align-items:stretch;width:100%}.nexa-manual-wrap button{justify-self:start;min-height:28px;border-radius:9px;border:1px solid rgba(89,228,255,.20);background:rgba(89,228,255,.05);color:#bff7ff;font-size:9px;font-weight:900;padding:4px 8px}.nexa-manual-time{width:100%;height:46px;min-height:46px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#071022;color:#fff;padding:9px 12px;text-align:left;font-size:14px;font-weight:800;letter-spacing:.02em}
 .nexa-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:10px;border-radius:12px;background:#050b1b;border:1px solid rgba(89,228,255,.16);overflow-wrap:anywhere}.nexa-online-list{display:grid;gap:8px;margin-top:14px}.nexa-online-person{padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);display:flex;justify-content:space-between;gap:10px}

 .nexa-member-primary{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
 .nexa-member-sub{margin-top:6px;color:#91a0bd;font-size:10px;line-height:1.35}
 .nexa-lock-note{margin-top:12px;padding:11px 12px;border-radius:14px;border:1px solid rgba(255,213,109,.24);background:rgba(255,213,109,.06);color:#ffe5a1;font-size:11px;line-height:1.45}
 .nexa-form-list{display:grid;gap:9px;margin-top:10px}.nexa-form-row{padding:12px;border-radius:15px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035)}.nexa-form-main{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:9px;align-items:center}.nexa-form-main input{width:21px;height:21px}.nexa-form-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px;padding-left:37px}
 @media(max-width:620px){.nexa-group-members,.nexa-inline-grid{grid-template-columns:1fr}#workspaceRoot .heroGrid>div:first-child{padding-right:76px}.nexa-presence-pill{font-size:9px}}
 `;
 document.head.appendChild(s);
}
function ensureModal(){
 if($('nexaFinisherModal'))return;
 const m=document.createElement('div');m.id='nexaFinisherModal';m.className='nexa-finisher-modal';m.innerHTML=`<div class="nexa-finisher-card"><div class="nexa-finisher-head"><div><div class="tag" id="nexaFinisherTag">NEXA</div><h3 id="nexaFinisherTitle" style="margin:4px 0 0">Details</h3></div><button class="nexa-finisher-close" id="nexaFinisherClose" type="button">×</button></div><div id="nexaFinisherBody"></div></div>`;document.body.appendChild(m);$('nexaFinisherClose').onclick=()=>m.classList.remove('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')}
}
function openModal(tag,title,html){ensureModal();$('nexaFinisherTag').textContent=tag;$('nexaFinisherTitle').textContent=title;$('nexaFinisherBody').innerHTML=html;$('nexaFinisherModal').classList.add('open')}
function closeModal(){$('nexaFinisherModal')?.classList.remove('open')}

async function loadAccess(){try{const r=await SB.rpc('transfer_staff_access_list',{p_workspace_id:workspaceId,p_token:token});canManage=r.data?.ok===true&&r.data?.can_manage===true}catch{}}
function ensurePresence(){
 if($('nexaPresencePill'))return;
 const hero=document.querySelector('#workspaceRoot .heroGrid>div:first-child');if(!hero)return;
 const b=document.createElement('button');b.id='nexaPresencePill';b.className='nexa-presence-pill';b.type='button';b.innerHTML=`<span class="nexa-presence-dot"></span><span><b id="nexaPresenceCount">1</b> online</span>`;hero.appendChild(b);b.onclick=()=>openModal('ONLINE NOW',`${online.length} online`,`<div class="nexa-online-list">${online.length?online.map(p=>`<div class="nexa-online-person"><div><b>${esc(p.game_name||p.game_id||'Staff')}</b><small>${p.is_self?'You · ':''}${esc(p.game_id||'')}</small></div><span class="nexa-pill">${esc(p.role||'Transfer Staff')}</span></div>`).join(''):'<div class="muted">No active staff detected.</div>'}</div>`)
}
async function heartbeat(){try{const r=await SB.rpc('transfer_workspace_presence_heartbeat',{p_workspace_id:workspaceId,p_token:token});if(r.data?.ok){online=r.data.online||[];ensurePresence();if($('nexaPresenceCount'))$('nexaPresenceCount').textContent=String(r.data.count??online.length)}}catch{}}

function applicantsPanel(){return document.querySelector('[data-panel="applicants"] article.card.full')}
function ensureAddGroupButton(){
 const panel=applicantsPanel(),title=panel?.querySelector('.sectionTitle');if(!panel||!title||$('nexaAddGroupTop'))return;
 const b=document.createElement('button');b.id='nexaAddGroupTop';b.type='button';b.className='btn mini';b.textContent='+ Add Group';b.style.marginLeft='auto';b.classList.toggle('hidden',!canManage);b.onclick=()=>openGroupEditor(null);title.appendChild(b);
}
function ensureGroupView(){
 const panel=applicantsPanel();if(!panel||$('nexaGroupView'))return;
 const v=document.createElement('div');v.id='nexaGroupView';v.className='nexa-group-view';panel.appendChild(v);
}
function setBaseApplicantsVisible(show){const p=applicantsPanel();if(!p)return;['.searchRow','#allocationCounters','#copyRow','.appSectionTitle','#appList'].forEach(sel=>{const x=p.querySelector(sel);if(x)x.classList.toggle('hidden',!show)});if(!show){const v=$('nexaGroupView');if(v&&v.getBoundingClientRect().height<320)v.style.minHeight='420px'}}
function leaveGroups(){groupMode=false;activeGroup=null;setBaseApplicantsVisible(true);$('nexaGroupView')?.classList.remove('open');document.querySelector('[data-nexa-groups-folder]')?.classList.remove('active')}
async function loadGroups(renderActive=false){
 if(!workspaceId||!token)return;
 const r=await SB.rpc('transfer_workspace_groups_get',{p_workspace_id:workspaceId,p_token:token});if(r.data?.ok)groups=r.data.groups||[];
 ensureAddGroupButton();ensureGroupView();syncGroupFolder();if(groupMode&&renderActive)renderGroupView();
}
function syncGroupFolder(){
 const grid=$('folderGrid');if(!grid)return;
 let b=grid.querySelector('[data-nexa-groups-folder]');
 if(!b){b=document.createElement('button');b.type='button';b.className='folderBox';b.dataset.nexaGroupsFolder='1';b.innerHTML=`<strong>Groups</strong><span>${groups.length}</span>`;grid.appendChild(b);b.onclick=()=>{groupMode=true;activeGroup=null;setBaseApplicantsVisible(false);b.classList.add('active');grid.querySelectorAll('[data-folder]').forEach(x=>x.classList.remove('active'));renderGroupView()}}
 else b.querySelector('span').textContent=String(groups.length);
 b.classList.toggle('active',groupMode);
 grid.querySelectorAll('[data-folder]').forEach(x=>{if(!x.dataset.nexaGroupExit){x.dataset.nexaGroupExit='1';x.addEventListener('click',leaveGroups)}})
}
function installPersistentGroupsFolder(){
 if(window.__nexaGroupsFolderHooked)return;
 const base=window.renderFolders;
 if(typeof base!=='function')return;
 window.__nexaGroupsFolderHooked=true;
 window.renderFolders=function(...args){
   const result=base.apply(this,args);
   syncGroupFolder();
   return result;
 };
}
function groupStatus(g){return g.status==='approved'?'Approved':'Under Review'}
async function snapshotApps(){const r=await SB.rpc('transfer_workspace_snapshot',{p_workspace_id:workspaceId,p_token:token});return r.data?.ok?(r.data.applications||[]):[]}
function groupDirectoryHtml(){return `<div class="nexa-group-head"><div><div class="tag">GROUPS</div><h3 style="margin:4px 0">Transfer Groups</h3><div class="muted">Groups are tracked separately from each player’s classification.</div></div>${canManage?'<button class="btn mini" id="nexaAddGroupInside">+ Add Group</button>':''}</div><div class="nexa-group-list">${groups.length?groups.map(g=>`<div class="nexa-group-row" data-open-group="${esc(g.id)}"><div class="appTop"><div><b>${esc(g.group_name)}</b><div class="meta">${esc(groupStatus(g))}${g.destination_alliance_tag?' • '+esc(g.destination_alliance_tag):g.new_alliance_tag?' • '+esc(g.new_alliance_tag):''}</div></div><span class="badge">${Number(g.member_count||0)} member${Number(g.member_count||0)===1?'':'s'}</span></div><div class="nexa-group-meta"><span class="nexa-pill">${Number(g.ordinary_count||0)} Ordinary</span><span class="nexa-pill">${Number(g.special_count||0)} Special</span><span class="nexa-pill ${g.status==='approved'?'good':'warn'}">${esc(groupStatus(g))}</span></div></div>`).join(''):'<div class="empty">No transfer groups yet. Use + Add Group to create one.</div>'}</div>`}
async function renderGroupView(){
 const v=$('nexaGroupView');if(!v)return;v.classList.add('open');
 if(!activeGroup){v.style.minHeight='';v.innerHTML=groupDirectoryHtml();$('nexaAddGroupInside')?.addEventListener('click',()=>openGroupEditor(null));v.querySelectorAll('[data-open-group]').forEach(x=>x.onclick=()=>{activeGroup=groups.find(g=>String(g.id)===String(x.dataset.openGroup));renderGroupView()});return}
 const heldHeight=Math.max(Math.ceil(v.getBoundingClientRect().height),420);
 v.style.minHeight=heldHeight+'px';
 v.style.opacity='.72';
 v.style.pointerEvents='none';
 const all=await snapshotApps(),members=all.filter(a=>String(a.group_id)===String(activeGroup.id)),profiles=await recruitingProfiles();
 const powerCap=Number((await currentEvent()).power_cap||0);
 const counts={ordinary:members.filter(a=>a.application_bucket==='ordinary'&&a.application_cycle!=='next').length,special:members.filter(a=>a.application_bucket==='special'&&a.application_cycle!=='next').length,sent:members.filter(a=>a.invite_status==='sent').length};
 v.innerHTML=`<div class="nexa-group-head"><div><button class="btn secondary mini" id="nexaBackGroups" type="button">← All Groups</button><div class="tag" style="margin-top:10px">GROUP</div><h3 style="margin:4px 0">${esc(activeGroup.group_name)}</h3><div class="nexa-group-meta"><span class="nexa-pill">${members.length} Members</span><span class="nexa-pill">${counts.ordinary} Ordinary</span><span class="nexa-pill">${counts.special} Special</span><span class="nexa-pill">${counts.sent} Invite Sent</span><span class="nexa-pill ${activeGroup.status==='approved'?'good':'warn'}">${esc(groupStatus(activeGroup))}</span></div></div><div class="actions" style="margin:0">${canManage?`<button class="btn secondary mini" id="nexaEditGroup">Edit Group</button>${activeGroup.status==='approved'?'<button class="btn mini" id="nexaAddPlayer">+ Add Player</button>':''}`:''}</div></div>
 ${activeGroup.status==='approved'?'':`<div class="nexa-lock-note"><b>UNDER REVIEW — Members locked until approval</b><br>Approve this group before adding or managing group members.</div>`}
 <div class="notice" style="margin-top:12px"><b>NEXA Group Code</b><div class="nexa-code" id="nexaGroupCode">${esc(activeGroup.group_code||'—')}</div><div class="helper" style="margin-top:6px">Permanent code — changes only if regenerated by Transfer Staff.</div><div class="actions"><button class="btn secondary mini" id="nexaCopyGroupCode">Copy Code</button>${canManage?'<button class="btn secondary mini" id="nexaRegenGroupCode">Regenerate Code</button>':''}</div></div>
 <div class="nexa-group-members">${members.length?members.map(a=>memberCard(a,profiles,powerCap)).join(''):'<div class="empty">No players have been added to this group yet.</div>'}</div>`;
 v.style.opacity='1';
 v.style.pointerEvents='';
 $('nexaBackGroups').onclick=()=>{activeGroup=null;renderGroupView()};$('nexaEditGroup')?.addEventListener('click',()=>openGroupEditor(activeGroup));$('nexaAddPlayer')?.addEventListener('click',()=>openAddPlayer(activeGroup));$('nexaCopyGroupCode').onclick=e=>copyText(activeGroup.group_code,e.currentTarget);$('nexaRegenGroupCode')?.addEventListener('click',()=>regenerateGroupCode(activeGroup));
 v.querySelectorAll('[data-nexa-member]').forEach(card=>wireMember(card,members.find(a=>String(a.id)===String(card.dataset.nexaMember))));
 requestAnimationFrame(()=>requestAnimationFrame(()=>{v.style.minHeight=''}));
}
function memberCard(a,profiles,powerCap){
 const over=powerCap>0&&Number(a.current_power)>powerCap,within=powerCap>0&&Number(a.current_power)<=powerCap,inv=a.invite_status==='sent'?'Invite Sent':a.invite_pending_reason==='over_power'?'Over Power Cap':'Not Sent',bucket=a.application_cycle==='next'?'next_cycle':(a.application_bucket||'inbox'),t12=!!(a.has_t12_general||a.t12_infantry||a.t12_lancer||a.t12_marksman),quick=!!(a.application_payload?.quick_group_member),opts=['inbox','ordinary','special','not_selected','next_cycle'],labels={inbox:'New Applications',ordinary:'Ordinary',special:'Special',not_selected:'Not Selected',next_cycle:'Next Transfer Cycle'};
 return `<div class="nexa-member ${over?'gold':within?'blue':''}" data-nexa-member="${a.id}">
   <div class="nexa-member-primary">
     <div><b>${esc(a.in_game_name||'Applicant')}</b><div class="meta">Game ID <button class="nexa-copy-id" data-copy-id>${esc(a.player_id||'—')}</button></div></div>
     <span class="badge ${a.invite_status==='sent'?'good':a.invite_pending_reason==='over_power'?'bad':'warn'}">${esc(inv)}</span>
   </div>
   <div class="nexa-group-meta">
     <span class="nexa-pill ${quick?'':'good'}">${quick?'Quick Group Member':'Form Filler'}</span>
     <span class="nexa-pill">${esc(labels[bucket]||bucket)}</span>
     <span class="nexa-pill">${esc(a.assigned_alliance_tag||'Unassigned')}</span>
   </div>
   <div class="nexa-member-sub">${fmt(a.current_power)} • ${esc(String(a.furnace_level||'—').toUpperCase())} • ${t12?'T12':'No T12'}</div>
   <div class="nexa-member-actions">
     ${quick?'':`<button class="wide" type="button" data-open-full>Open Full Application</button>`}
     <select data-move>${opts.map(x=>`<option value="${x}" ${bucket===x?'selected':''}>${labels[x]}</option>`).join('')}</select>
     <select data-assign><option value="">Unassigned</option>${profiles.filter(p=>p.is_active!==false).map(p=>`<option value="${esc(p.tag)}" ${a.assigned_alliance_tag===p.tag?'selected':''}>${esc(p.tag)}</option>`).join('')}</select>
     <select class="wide" data-invite><option value="not_sent" ${a.invite_status!=='sent'&&a.invite_pending_reason!=='over_power'?'selected':''}>Not Sent</option><option value="over_power" ${a.invite_status!=='sent'&&a.invite_pending_reason==='over_power'?'selected':''}>Not Sent — Over Power Cap</option><option value="sent" ${a.invite_status==='sent'?'selected':''}>Invite Sent</option></select>
     ${canManage?`<button type="button" data-move-individual>Move to Applicants</button><button type="button" class="danger" data-remove-member>Remove Member</button>`:''}
   </div>
 </div>`;
}
async function wireMember(card,a){
 card.querySelector('[data-copy-id]').onclick=e=>copyText(a.player_id,e.currentTarget);
 card.querySelector('[data-open-full]')?.addEventListener('click',()=>{
   const original=document.querySelector(`.app[data-app="${CSS.escape(String(a.id))}"]`);
   if(original)original.click();
 });
 card.querySelector('[data-move]').onchange=async e=>{const t=e.target.value,patch={application_bucket:t==='inbox'?'inbox':t,application_cycle:t==='next_cycle'?'next':'current',invite_type:t==='ordinary'?'ordinary':t==='special'?'special':''};await updateMember(a,patch)};
 card.querySelector('[data-assign]').onchange=e=>updateMember(a,{assigned_alliance_tag:e.target.value});
 card.querySelector('[data-invite]').onchange=e=>{const x=e.target.value;updateMember(a,x==='sent'?{invite_status:'sent',invite_pending_reason:null}:{invite_status:'not_sent',invite_pending_reason:x==='over_power'?'over_power':null})};
 card.querySelector('[data-move-individual]')?.addEventListener('click',()=>moveMemberToApplicants(a));
 card.querySelector('[data-remove-member]')?.addEventListener('click',()=>confirmRemoveMember(a));
}
async function moveMemberToApplicants(a){
 const r=await SB.rpc('transfer_workspace_update_application',{p_workspace_id:workspaceId,p_token:token,p_application_id:a.id,p_patch:{group_id:null}});
 if(r.error||r.data?.ok!==true){openModal('GROUP MEMBER','Unable to Move Member',`<p class="muted">${esc(r.data?.error||r.error?.message||'Unable to move this member.')}</p><div class="actions"><button class="btn" id="nexaMoveMemberClose">Close</button></div>`);$('nexaMoveMemberClose').onclick=closeModal;return}
 await loadGroups(false);
 activeGroup=groups.find(g=>String(g.id)===String(activeGroup?.id))||activeGroup;
 await renderGroupView();
}
function confirmRemoveMember(a){
 openModal('REMOVE MEMBER',`Remove ${esc(a.in_game_name||'Member')}?`,`<p class="muted">This member will be removed from the group and archived from the Active Transfer Workspace. If they still want to transfer individually, move them to the individual Applicants list first.</p><div class="actions"><button class="btn secondary" id="nexaCancelRemoveMember">Cancel</button><button class="btn danger" id="nexaConfirmRemoveMember">Remove Member</button></div><div class="status" id="nexaRemoveMemberStatus"></div>`);
 $('nexaCancelRemoveMember').onclick=closeModal;
 $('nexaConfirmRemoveMember').onclick=async()=>{const st=$('nexaRemoveMemberStatus');st.textContent='Removing…';const r=await SB.rpc('transfer_workspace_group_remove_member',{p_workspace_id:workspaceId,p_token:token,p_application_id:a.id});if(r.error||r.data?.ok!==true){st.textContent=r.data?.error||r.error?.message||'Unable to remove member.';return}closeModal();await loadGroups(false);activeGroup=groups.find(g=>String(g.id)===String(activeGroup?.id))||activeGroup;await renderGroupView()};
}
async function updateMember(a,patch){
 const r=await SB.rpc('transfer_workspace_update_application',{p_workspace_id:workspaceId,p_token:token,p_application_id:a.id,p_patch:patch});
 if(r.data?.ok){
   Object.assign(a,patch);
   await loadGroups(false);
   activeGroup=groups.find(g=>String(g.id)===String(activeGroup?.id))||activeGroup;
   await renderGroupView();
 }
}
async function recruitingProfiles(){const r=await SB.rpc('transfer_workspace_recruiting_profiles_get',{p_workspace_id:workspaceId,p_token:token});return r.data?.ok?(r.data.profiles||[]):[]}
async function currentEvent(){const r=await SB.rpc('transfer_workspace_snapshot',{p_workspace_id:workspaceId,p_token:token});return r.data?.event||{}}

async function openGroupEditor(g){
 const prof=await recruitingProfiles(),isEdit=!!g;
 openModal('TRANSFER GROUP',isEdit?'Edit Group':'Add Group',`<div class="nexa-inline-grid"><label class="field">Group Name<input id="nexaGroupName" value="${esc(g?.group_name||'')}"></label><label class="field">Status<select id="nexaGroupStatus"><option value="under_review" ${g?.status!=='approved'?'selected':''}>Under Review</option><option value="approved" ${g?.status==='approved'?'selected':''}>Approved</option></select></label><label class="field">Main Contact — In-game Name<input id="nexaGroupIgn" value="${esc(g?.main_contact_ign||'')}"></label><label class="field">Main Contact — Game ID<input id="nexaGroupPid" inputmode="numeric" value="${esc(g?.main_contact_player_id||'')}"></label><label class="field">Current State<input id="nexaGroupState" inputmode="numeric" value="${esc(g?.current_state||'')}"></label><label class="field">Main Contact — Discord<input id="nexaGroupDiscord" value="${esc(g?.main_contact_discord||'')}"></label><label class="field" style="grid-column:1/-1">Group Plan<select id="nexaGroupPlan"><option value="undecided" ${!g||g.plan==='undecided'?'selected':''}>Not decided yet</option><option value="merge_existing" ${g?.plan==='merge_existing'?'selected':''}>Merge into existing recruiting alliance</option><option value="start_own" ${g?.plan==='start_own'?'selected':''}>Start / rebuild own alliance</option></select></label><label class="field hidden" id="nexaGroupDestWrap" style="grid-column:1/-1">Recruiting Alliance<select id="nexaGroupDest"><option value="">Select</option>${prof.filter(p=>p.profile_exists&&p.is_active!==false).map(p=>`<option value="${esc(p.tag)}" ${g?.destination_alliance_tag===p.tag?'selected':''}>${esc(p.tag)}</option>`).join('')}</select></label><label class="field hidden" id="nexaGroupNewWrap" style="grid-column:1/-1">Alliance Tag<input id="nexaGroupNew" value="${esc(g?.new_alliance_tag||'')}"></label></div>${isEdit?`<div class="notice" style="margin-top:12px"><b>Permanent Group Code</b><div class="nexa-code">${esc(g.group_code||'—')}</div></div>`:''}<div class="actions"><button class="btn secondary" id="nexaCancelGroup">Cancel</button>${isEdit?'<button class="btn danger" id="nexaDeleteGroup">Delete Group</button>':''}<button class="btn" id="nexaSaveGroup">${isEdit?'Save Group':'Create Group'}</button></div><div class="status" id="nexaGroupSaveStatus"></div>`);
 const refresh=()=>{$('nexaGroupDestWrap').classList.toggle('hidden',$('nexaGroupPlan').value!=='merge_existing');$('nexaGroupNewWrap').classList.toggle('hidden',$('nexaGroupPlan').value!=='start_own')};$('nexaGroupPlan').onchange=refresh;refresh();$('nexaCancelGroup').onclick=closeModal;$('nexaDeleteGroup')?.addEventListener('click',()=>confirmDeleteGroup(g));
 $('nexaSaveGroup').onclick=async()=>{const st=$('nexaGroupSaveStatus'),payload={group_name:$('nexaGroupName').value.trim(),status:$('nexaGroupStatus').value,plan:$('nexaGroupPlan').value,destination_alliance_tag:$('nexaGroupDest').value,new_alliance_tag:$('nexaGroupNew').value.trim().toUpperCase(),main_contact_ign:$('nexaGroupIgn').value.trim(),main_contact_player_id:$('nexaGroupPid').value.trim(),main_contact_discord:$('nexaGroupDiscord').value.trim(),current_state:$('nexaGroupState').value.trim()};if(!payload.group_name)return st.textContent='Group Name is required.';st.textContent='Saving…';const r=await SB.rpc('transfer_workspace_group_save',{p_workspace_id:workspaceId,p_token:token,p_group_id:g?.id||null,p_payload:payload,p_apply_destination_to_members:false});if(r.error||r.data?.ok!==true){st.textContent=r.data?.error||r.error?.message||'Unable to save group.';return}closeModal();await loadGroups();if(g){activeGroup=groups.find(x=>String(x.id)===String(g.id))||null;renderGroupView()}}
}
function confirmDeleteGroup(g){
 openModal('DELETE GROUP',`Delete ${esc(g.group_name||'Group')}?`,`<p class="muted">This will delete the group and archive all remaining members. If anyone still wants to transfer, move them to the individual Applicants list first.</p><div class="actions"><button class="btn secondary" id="nexaCancelDeleteGroup">Cancel</button><button class="btn danger" id="nexaConfirmDeleteGroup">Delete Group</button></div><div class="status" id="nexaDeleteGroupStatus"></div>`);
 $('nexaCancelDeleteGroup').onclick=closeModal;
 $('nexaConfirmDeleteGroup').onclick=async()=>{const st=$('nexaDeleteGroupStatus');st.textContent='Deleting…';const r=await SB.rpc('transfer_workspace_group_delete',{p_workspace_id:workspaceId,p_token:token,p_group_id:g.id});if(r.error||r.data?.ok!==true){st.textContent=r.data?.error||r.error?.message||'Unable to delete group.';return}closeModal();activeGroup=null;await loadGroups(false);renderGroupView()};
}
async function openAddPlayer(g){
 const ev=await currentEvent();
 const configured=ev?.form_settings?.era?.furnace_options;
 const furnaceOptions=(Array.isArray(configured)&&configured.length?configured:[{value:'fc8',label:'Fire Crystal 8 (FC8)'},{value:'fc9',label:'Fire Crystal 9 (FC9)'},{value:'fc10',label:'Fire Crystal 10 (FC10)'}]).map(x=>({value:String(x?.value||'').trim(),label:String(x?.label||x?.name||x?.value||'').trim()})).filter(x=>x.value&&x.label);
 openModal('GROUP MEMBER',`Add Player · ${g.group_name}`,`<div class="nexa-inline-grid"><label class="field">In-game Name<input id="nexaMemberIgn"></label><label class="field">Game ID<input id="nexaMemberPid" inputmode="numeric"></label><label class="field">Furnace Level<select id="nexaMemberFurnace"><option value="">Select Furnace Level</option>${furnaceOptions.map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('')}</select></label><label class="field">Current Power<input id="nexaMemberPower" inputmode="numeric"></label><label class="field" style="grid-column:1/-1">Does this player have T12?<select id="nexaMemberT12"><option value="false">No</option><option value="true">Yes</option></select></label></div><div class="actions"><button class="btn secondary" id="nexaCancelMember">Cancel</button><button class="btn" id="nexaSaveMember">Add Player</button></div><div class="status" id="nexaMemberSaveStatus"></div>`);$('nexaCancelMember').onclick=closeModal;$('nexaSaveMember').onclick=async()=>{const st=$('nexaMemberSaveStatus'),payload={in_game_name:$('nexaMemberIgn').value.trim(),player_id:$('nexaMemberPid').value.trim(),furnace_level:$('nexaMemberFurnace').value.trim(),current_power:$('nexaMemberPower').value.replace(/\D/g,''),has_t12:$('nexaMemberT12').value==='true'};st.textContent='Adding…';const r=await SB.rpc('transfer_workspace_group_add_player',{p_workspace_id:workspaceId,p_token:token,p_group_id:g.id,p_payload:payload});if(r.error||r.data?.ok!==true){st.textContent=r.data?.error||r.error?.message||'Unable to add player.';return}closeModal();await loadGroups();activeGroup=groups.find(x=>String(x.id)===String(g.id))||g;renderGroupView()}
}
async function regenerateGroupCode(g){openModal('GROUP CODE','Regenerate Group Code?',`<p class="muted">The current code will stop working immediately. Everyone must use the new code.</p><div class="actions"><button class="btn secondary" id="nexaCancelRegen">Cancel</button><button class="btn danger" id="nexaConfirmRegen">Regenerate</button></div><div class="status" id="nexaRegenStatus"></div>`);$('nexaCancelRegen').onclick=closeModal;$('nexaConfirmRegen').onclick=async()=>{const st=$('nexaRegenStatus');st.textContent='Generating…';const r=await SB.rpc('transfer_workspace_group_regenerate_code',{p_workspace_id:workspaceId,p_token:token,p_group_id:g.id});if(r.error||r.data?.ok!==true){st.textContent=r.data?.error||r.error?.message||'Unable to regenerate code.';return}closeModal();await loadGroups();activeGroup=groups.find(x=>String(x.id)===String(g.id))||g;renderGroupView()}}

async function loadProfileRows(){profileRows=await recruitingProfiles();paintProfiles()}
function scheduleOfRaw(p){const s=p?.event_schedule&&typeof p.event_schedule==='object'?p.event_schedule:{};return{bear:Array.isArray(s.bear)?s.bear:[],foundry:Array.isArray(s.foundry)?s.foundry:[],canyon:Array.isArray(s.canyon)?s.canyon:[]}}
function paintProfiles(){
 document.querySelectorAll('[data-profile]').forEach(card=>{
   const p=profileRows.find(x=>String(x.alliance_id)===String(card.dataset.profile));if(!p)return;const s=scheduleOfRaw(p);
   const times=card.querySelector('.profileTimes');
   if(times){
     const showTime=x=>`${esc(x)} UTC`;
     times.innerHTML=`<b>Bear:</b> ${s.bear.length?s.bear.map(showTime).join(' • '):'—'}<br><b>Foundry:</b> ${s.foundry.length?s.foundry.map(showTime).join(' • '):'—'}<br><b>Canyon:</b> ${s.canyon.length?s.canyon.map(showTime).join(' • '):'—'}`;
   }
   ['bear','foundry','canyon'].forEach(k=>{const controls=[...card.querySelectorAll(`[data-sched="${k}"]`)];controls.forEach((c,i)=>enhanceTimeControl(c,k,i,s[k]?.[i]||''))});
 });
}

function formatManualTimeValue(raw){
 const digits=String(raw||'').replace(/\D/g,'').slice(0,4);
 if(digits.length<=2)return digits;
 return digits.slice(0,2)+':'+digits.slice(2);
}
function bindManualTimeInput(input){
 input.addEventListener('input',()=>{
   const before=input.value;
   const formatted=formatManualTimeValue(before);
   if(input.value!==formatted)input.value=formatted;
 });
 input.addEventListener('blur',()=>{
   const d=String(input.value||'').replace(/\D/g,'');
   if(d.length===3)input.value=d.slice(0,2)+':0'+d.slice(2);
 });
}
function enhanceTimeControl(c,key,index,actual){
 if(c.dataset.nexaManualReady==='1')return;
 if(c.tagName==='SELECT'){
   const first=c.options[0];
   if(first){first.textContent='—';first.value=''}
   if(![...c.options].some(o=>o.value==='__manual__')){
     const manual=document.createElement('option');
     manual.value='__manual__';
     manual.textContent='Set Manually';
     if(first?.nextSibling)c.insertBefore(manual,first.nextSibling);else c.appendChild(manual);
   }
   c.dataset.nexaManualReady='1';
   if(actual&&!isHalfHour(actual))return replaceWithManual(c,key,index,actual);
   if(actual&&isHalfHour(actual))c.value=actual;else if(!actual)c.value='';
   c.addEventListener('change',()=>{if(c.value==='__manual__')replaceWithManual(c,key,index,'')});
 }
}
function replaceWithManual(select,key,index,value){
 const wrap=document.createElement('div');wrap.className='nexa-manual-wrap';wrap.dataset.manualSlot=`${key}-${index}`;
 const input=document.createElement('input');input.type='text';input.className='nexa-manual-time';input.dataset.sched=key;input.dataset.nexaManualReady='1';input.value=value;input.placeholder='00:00';input.inputMode='numeric';input.autocomplete='off';bindManualTimeInput(input);
 const back=document.createElement('button');back.type='button';back.textContent='Use dropdown';back.onclick=()=>{const sel=document.createElement('select');sel.className='time24';sel.dataset.sched=key;sel.innerHTML=`<option value="">—</option><option value="__manual__">Set Manually</option>`+Array.from({length:48},(_,i)=>{const t=`${String(Math.floor(i/2)).padStart(2,'0')}:${i%2?'30':'00'}`;return`<option value="${t}">${t}</option>`}).join('');wrap.replaceWith(sel);enhanceTimeControl(sel,key,index,'')};
 wrap.append(input,back);select.replaceWith(wrap);
}
function validateManualTimesBeforeSave(e){
 const btn=e.target?.closest?.('[data-save-profile]');if(!btn)return;
 const card=btn.closest('[data-profile]');if(!card)return;
 const bad=[...card.querySelectorAll('.nexa-manual-time')].find(x=>x.value.trim()&&!validTime(x.value));
 if(bad){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const status=$('profileStatus');if(status)status.textContent='Manual time must use HH:MM (00:00–23:59).';bad.focus()}
}
document.addEventListener('click',validateManualTimesBeforeSave,true);

async function loadFormLibrary(){
 const card=$('formIntegration');if(!card)return;
 try{const r=await SB.rpc('transfer_form_library_workspace',{p_workspace_id:workspaceId,p_token:token||null});if(r.error||r.data?.ok!==true)return;formEventId=r.data.event_id||'';formRows=r.data.forms||[];const full=formRows.length>=Number(r.data.limit||3);card.innerHTML=`<div class="profileHeader"><div><div class="tag">APPLICATION FORM</div><h3 style="margin:4px 0">Application Form</h3><p class="muted">Choose which saved form is used for the permanent Transfer Workspace intake.</p></div><span class="badge">Forms ${formRows.length}/3</span></div><div class="nexa-form-list">${formRows.map(f=>`<div class="nexa-form-row"><div class="nexa-form-main"><input type="checkbox" data-form-select="${esc(f.id)}" ${f.is_active?'checked':''}><div><b>${esc(f.name)}</b><div class="meta">${f.is_primary?'Protected official form':'Custom form'}</div></div><span class="badge">${f.is_active?'ACTIVE':f.is_primary?'PROTECTED':''}</span></div>${f.is_primary?'':`<div class="nexa-form-actions"><button class="btn secondary mini" data-form-edit="${esc(f.id)}">Edit</button><button class="btn danger mini" data-form-delete="${esc(f.id)}" ${f.is_active?'disabled':''}>Delete</button></div>`}</div>`).join('')}</div><div class="actions"><button class="btn" id="nexaCreateTransferForm" ${full?'disabled':''}>Create New Form</button></div>`;
 card.querySelectorAll('[data-form-select]').forEach(x=>x.onchange=()=>{const f=formRows.find(r=>String(r.id)===String(x.dataset.formSelect));if(!f||f.is_active)return x.checked=true;activateForm(f)});
 card.querySelectorAll('[data-form-edit]').forEach(b=>b.onclick=()=>openOverlay(`transfer-form-custom.html?event=${encodeURIComponent(formEventId)}&template=${encodeURIComponent(b.dataset.formEdit)}&workspace=1`,'Edit Custom Form'));
 card.querySelectorAll('[data-form-delete]').forEach(b=>b.onclick=()=>deleteForm(formRows.find(r=>String(r.id)===String(b.dataset.formDelete))));
 $('nexaCreateTransferForm')?.addEventListener('click',()=>openOverlay(`transfer-form-custom.html?event=${encodeURIComponent(formEventId)}&new=1&workspace=1`,'Create New Form'));
 }catch{}
}
function openOverlay(url,title){const ov=$('formOverlay'),frame=$('formFrame'),t=$('overlayTitle');if(!ov||!frame)return location.href=url;if(t)t.textContent=title;frame.src=url;ov.classList.add('open')}
async function activateForm(f){openModal('APPLICATION FORM','Confirm Active Form',`<p class="muted">Switch the active form to <b>${esc(f.name)}</b>?</p><label class="field">NEXA Password<input id="nexaFormPassword" type="password"></label><div class="actions"><button class="btn secondary" id="nexaCancelForm">Cancel</button><button class="btn" id="nexaConfirmForm">Confirm</button></div><div class="status" id="nexaFormStatus"></div>`);$('nexaCancelForm').onclick=closeModal;$('nexaConfirmForm').onclick=async()=>{const st=$('nexaFormStatus'),password=$('nexaFormPassword').value;if(!password)return st.textContent='Enter your password.';const {data:{session}}=await SB.auth.getSession(),user=session?.user;if(!user?.email)return st.textContent='Sign in to your NEXA account first.';const v=await SB.auth.signInWithPassword({email:user.email,password});if(v.error)return st.textContent='Password incorrect.';const r=await SB.rpc('transfer_form_template_activate',{p_event_id:formEventId,p_template_id:f.id,p_token:token||null});if(r.error||r.data?.ok!==true)return st.textContent=r.data?.error||r.error?.message||'Unable to switch form.';closeModal();loadFormLibrary()}}
async function deleteForm(f){if(!f||f.is_primary||f.is_active)return;openModal('DELETE FORM','Delete Custom Form?',`<p class="muted">Delete <b>${esc(f.name)}</b> permanently?</p><div class="actions"><button class="btn secondary" id="nexaCancelDeleteForm">Cancel</button><button class="btn danger" id="nexaConfirmDeleteForm">Delete</button></div><div class="status" id="nexaDeleteFormStatus"></div>`);$('nexaCancelDeleteForm').onclick=closeModal;$('nexaConfirmDeleteForm').onclick=async()=>{const r=await SB.rpc('transfer_form_template_delete',{p_event_id:formEventId,p_template_id:f.id,p_token:token||null});if(r.error||r.data?.ok!==true)return $('nexaDeleteFormStatus').textContent=r.data?.error||r.error?.message||'Unable to delete.';closeModal();loadFormLibrary()}}

function installHistoryDeleteGuard(){
 if(document.documentElement.dataset.nexaSecureHistoryDelete==='1')return;document.documentElement.dataset.nexaSecureHistoryDelete='1';
 document.addEventListener('click',e=>{const btn=e.target?.closest?.('[data-delete-history]');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const id=btn.dataset.deleteHistory;openModal('DELETE HISTORY','Delete Transfer Cycle?',`<p class="muted">Permanently delete this Transfer Cycle from History?</p><div class="notice">This also permanently deletes Ordinary and Special applicant records attached to that cycle.</div><label class="field">NEXA Password<input id="nexaHistoryPassword" type="password"></label><label class="field">Type CLEAR<input id="nexaHistoryConfirm" autocapitalize="characters"></label><div class="actions"><button class="btn secondary" id="nexaCancelHistory">Cancel</button><button class="btn danger" id="nexaDeleteHistoryNow">Delete Permanently</button></div><div class="status" id="nexaHistoryStatus"></div>`);$('nexaCancelHistory').onclick=closeModal;$('nexaDeleteHistoryNow').onclick=async()=>{const st=$('nexaHistoryStatus'),p=$('nexaHistoryPassword').value,c=$('nexaHistoryConfirm').value.trim().toUpperCase();if(!p)return st.textContent='Enter your NEXA password.';if(c!=='CLEAR')return st.textContent='Type CLEAR to continue.';const r=await SB.rpc('transfer_workspace_delete_history_secure',{p_workspace_id:workspaceId,p_token:token,p_event_id:id,p_password:p,p_confirmation:c});if(r.error||r.data?.ok!==true)return st.textContent=r.data?.error||r.error?.message||'Unable to delete.';closeModal();location.reload()}},true)
}
function enhanceUsername(){
 const myPass=document.querySelector('[data-my-pass]'),actions=myPass?.closest('.actions');if(!actions||actions.querySelector('[data-change-username]'))return;const b=document.createElement('button');b.className='btn secondary mini';b.type='button';b.dataset.changeUsername='1';b.textContent='Change Username';b.onclick=()=>{const card=myPass.closest('[data-access]'),current=card?.querySelector('.staffInfo div:nth-child(2) b')?.textContent?.trim()||'';openModal('ACCOUNT','Change Username',`<label class="field">New Username<input id="nexaNewUsername" value="${esc(current)}"></label><label class="field">Current NEXA Password<input id="nexaUsernamePassword" type="password"></label><div class="actions"><button class="btn secondary" id="nexaCancelUsername">Cancel</button><button class="btn" id="nexaSaveUsername">Save</button></div><div class="status" id="nexaUsernameStatus"></div>`);$('nexaCancelUsername').onclick=closeModal;$('nexaSaveUsername').onclick=async()=>{const st=$('nexaUsernameStatus'),r=await SB.rpc('transfer_staff_change_username',{p_token:token,p_current_password:$('nexaUsernamePassword').value,p_new_username:$('nexaNewUsername').value.trim()});if(r.error||r.data?.ok!==true)return st.textContent=r.data?.error||r.error?.message||'Unable to change username.';closeModal();location.reload()}};actions.insertBefore(b,myPass.nextSibling)
}
function attachHooks(){
 document.querySelectorAll('.tab').forEach(btn=>{if(btn.dataset.nexaV17)return;btn.dataset.nexaV17='1';btn.addEventListener('click',()=>{if(btn.dataset.tab==='applicants')setTimeout(()=>loadGroups(false),80);if(btn.dataset.tab==='integrations')setTimeout(()=>{loadFormLibrary();loadProfileRows()},80);if(btn.dataset.tab==='access')setTimeout(enhanceUsername,80);if(btn.dataset.tab!=='applicants')leaveGroups()})});
 $('closeOverlay')?.addEventListener('click',()=>setTimeout(loadFormLibrary,120));window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='nexa-transfer-form-saved')setTimeout(loadFormLibrary,120)})
}
async function periodic(){
 const ap=document.querySelector('[data-panel="applicants"]');if(ap?.classList.contains('active'))syncGroupFolder();
 const ip=document.querySelector('[data-panel="integrations"]');if(ip?.classList.contains('active')){await loadProfileRows()}
 const xp=document.querySelector('[data-panel="access"]');if(xp?.classList.contains('active'))enhanceUsername();
}
async function start(){
 if(booted)return;token=getToken();workspaceId=getWorkspaceId();const root=$('workspaceRoot');if(!SB||!token||!workspaceId||!root||root.classList.contains('hidden'))return;booted=true;injectStyles();ensureModal();await loadAccess();ensureAddGroupButton();ensureGroupView();installPersistentGroupsFolder();attachHooks();installHistoryDeleteGuard();enhanceUsername();await heartbeat();await loadGroups(false);await loadFormLibrary();await loadProfileRows();presenceTimer=setInterval(heartbeat,30000);refreshTimer=setInterval(periodic,2500)
}
const boot=setInterval(()=>{start();if(booted)clearInterval(boot)},500);setTimeout(start,80);
})();
