/* NEXA Administration Hub V23 — stable admin navigation, guides, testing framework, profile/troop guards */
(()=>{
'use strict';
if(window.__NEXA_ADMIN_V23__) return;
window.__NEXA_ADMIN_V23__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tabs=[
  {key:'alliances',letter:'A',label:'Alliances',id:'admin-alliances'},
  {key:'library',letter:'L',label:'Library',id:'admin-library'},
  {key:'roles',letter:'R',label:'Roles',id:'admin-roles'},
  {key:'module',letter:'M',label:'Module Access',id:'admin-permissions'},
  {key:'system',letter:'S',label:'System Operations',id:'admin-system'}
];
const guideCopy={
  alliances:['Alliance Constellation','Create and manage alliances here. Open an alliance planet for its Alliance Passport, password, status, members and rank structure. Owner/Admin can deactivate or schedule deletion; R5 manages ranks and password resets inside their own alliance.'],
  library:['Library','The verified NEXA catalog lives here: Heroes, Experts, Pets, Troops, Chief Gear and Charms. Generation visibility can be Hidden, Scheduled or Unlocked.'],
  roles:['Roles','This is the global rank audit. Alliance rank and NEXA module access are separate. R5 can assign R4 or R3–R1 in their alliance; R4 can assign R3–R1.'],
  module:['Module Access','Owner/Admin assign special NEXA access here, such as SBS, SvS, Transfer, Team Builder, Forms, Events, Library and Administration. Alliance rank never grants these automatically.'],
  system:['System Operations','System-wide maintenance, recovery and protected operations only. Alliance management and module access do not belong here.']
};
let current='alliances', allianceCache=[], nexaRole='player', lastFC=null;

function css(){
 if($('#nexa-admin-v22-style')) return;
 const s=document.createElement('style'); s.id='nexa-admin-v22-style'; s.textContent=`
 .nexa-admin-v22-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;margin:0 0 14px}
 .nexa-admin-v22-nav .prev{justify-self:start}.nexa-admin-v22-nav .next{justify-self:end}
 .nexa-admin-v22-jump{appearance:none;border:1px solid rgba(139,92,246,.55);background:rgba(12,16,40,.86);color:#fff;border-radius:999px;padding:8px 11px;font:inherit;font-weight:800;cursor:pointer;min-width:48px}
 .nexa-admin-v22-title{display:flex;align-items:center;justify-content:center;gap:8px;min-width:0;text-align:center;font-weight:900;letter-spacing:.02em}
 .nexa-guide-btn{appearance:none;border:1px solid rgba(64,210,255,.55);background:rgba(9,21,48,.9);color:#7de8ff;border-radius:50%;width:31px;height:31px;display:inline-grid;place-items:center;font-weight:950;cursor:pointer}
 .nexa-general-guide{position:absolute;right:14px;top:14px;z-index:6}
 .nexa-admin-v22-section-head{display:flex;align-items:center;gap:8px;margin:0 0 12px}
 .nexa-admin-v22-section-head h3{margin:0}.nexa-v23-legacy-hide{display:none!important}
 .nexa-admin-v22-hidden{display:none!important}
 .nexa-ap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
 .nexa-ap-planet{appearance:none;min-width:0;border:1px solid color-mix(in srgb,var(--planet,#8b5cf6) 65%,transparent);border-radius:24px;background:radial-gradient(circle at 50% 28%,color-mix(in srgb,var(--planet,#8b5cf6) 22%,transparent),rgba(5,8,24,.9) 65%);padding:16px 10px;color:#fff;text-align:center;cursor:pointer}
 .nexa-ap-orbit{width:104px;height:104px;border-radius:50%;margin:0 auto 10px;border:3px solid var(--planet,#8b5cf6);display:grid;place-items:center;box-shadow:0 0 20px color-mix(in srgb,var(--planet,#8b5cf6) 45%,transparent);overflow:hidden;background:#080d23}
 .nexa-ap-orbit img{width:82%;height:82%;object-fit:contain;border-radius:50%}.nexa-ap-tag{display:block;font-size:1.15rem;font-weight:950}.nexa-ap-sub{display:block;color:var(--muted,#aeb4ca);font-size:.82rem;margin-top:3px}
 .nexa-chip{display:inline-flex;border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:4px 8px;font-size:.72rem;color:var(--muted,#b7bdd2);margin:5px 2px 0}
 .nexa-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}.nexa-admin-actions button{min-height:40px}
 .nexa-passport{border:1px solid rgba(139,92,246,.5);border-radius:22px;padding:16px;background:rgba(7,10,28,.78)}
 .nexa-passport-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.nexa-passport h3{margin:2px 0 0}
 .nexa-pass-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.nexa-pass-stat{border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px}.nexa-pass-stat small{display:block;color:var(--muted,#aeb4ca)}.nexa-pass-stat b{display:block;margin-top:4px}
 .nexa-rank-group{margin-top:18px}.nexa-rank-group h4{margin:0 0 9px}.nexa-member-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .nexa-member{border:1px solid rgba(255,255,255,.11);border-radius:17px;padding:10px;background:rgba(8,12,31,.7);min-width:0}.nexa-member-main{display:flex;gap:9px;align-items:center}.nexa-member-avatar{width:46px;height:46px;border-radius:50%;border:2px solid #8b5cf6;overflow:hidden;display:grid;place-items:center;background:#111735;font-weight:900;flex:0 0 auto}.nexa-member-avatar img{width:100%;height:100%;object-fit:cover}.nexa-member-copy{min-width:0}.nexa-member-copy b,.nexa-member-copy small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nexa-member-copy small{color:var(--muted,#aeb4ca)}
 .nexa-member-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.nexa-member-actions button{font-size:.75rem;padding:7px 8px}
 .nexa-module-row{border:1px solid rgba(255,255,255,.11);border-radius:17px;padding:12px;margin:10px 0;background:rgba(8,12,31,.7)}.nexa-module-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.nexa-module-checks{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.nexa-module-checks label{display:flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 8px;font-size:.75rem}.nexa-module-checks input{width:auto!important;margin:0}
 .nexa-admin-dialog{border:1px solid rgba(139,92,246,.65);border-radius:22px;background:#080c22;color:#fff;width:min(540px,calc(100vw - 28px));max-height:84dvh;overflow:auto;padding:18px}.nexa-admin-dialog::backdrop{background:rgba(0,0,0,.75);backdrop-filter:blur(4px)}.nexa-admin-dialog h3{margin-top:0}.nexa-admin-dialog label{display:grid;gap:6px;margin:10px 0}.nexa-admin-dialog input,.nexa-admin-dialog select{width:100%;min-width:0}.nexa-dialog-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:14px}
 .nexa-danger{border-color:#ef4444!important;color:#fecaca!important}.nexa-warning{margin-top:10px;border:1px solid rgba(239,68,68,.6);border-radius:14px;padding:10px;color:#fecaca;background:rgba(127,29,29,.18)}
 .nexa-empty{padding:18px;border:1px dashed rgba(255,255,255,.15);border-radius:16px;color:var(--muted,#aeb4ca);text-align:center}
 button[data-nexa-fc-selected="1"]{border-color:#a855f7!important;background:linear-gradient(135deg,rgba(126,34,206,.65),rgba(37,99,235,.35))!important;box-shadow:0 0 0 1px rgba(168,85,247,.35) inset!important;color:#fff!important}
 img.nexa-troop-fit{object-fit:contain!important;padding:6%!important;box-sizing:border-box!important;transform:scale(.9)!important;transform-origin:center!important}
 img.nexa-troop-fit-lancer{padding:10%!important;transform:scale(.82)!important}
 @media(max-width:430px){.nexa-ap-grid,.nexa-member-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.nexa-ap-orbit{width:92px;height:92px}.nexa-admin-v22-title .full{display:none}.nexa-pass-stats{grid-template-columns:1fr 1fr}}
 @media(min-width:700px){.nexa-ap-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
 #nexa-profile-modal .nexa-lib-owned,#nexa-profile-modal [data-owned-label],#nexa-profile-modal label:has(input[name="owned"]){display:none!important}
 #nexa-profile-modal [data-nexa-troop-image],#nexa-profile-modal .nexa-troop-card img,#nexa-profile-modal [data-troop-type] img{object-fit:contain!important;object-position:center!important;transform:none!important;max-width:100%!important;max-height:100%!important}
 .nexa-testing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px}.nexa-testing-card{border:1px solid rgba(255,255,255,.11);border-radius:17px;padding:14px;background:rgba(8,12,31,.7)}.nexa-testing-card h4{margin:0 0 8px}.nexa-testing-card select,.nexa-testing-card input{width:100%;margin-top:6px}.nexa-testing-disabled{opacity:.72}.nexa-framework-badge{display:inline-flex;border:1px solid rgba(125,232,255,.4);color:#7de8ff;border-radius:999px;padding:4px 8px;font-size:.7rem;font-weight:900;margin-left:6px}
 `;
 document.head.appendChild(s);
}
function rpc(name,args={}){return window.supabaseClient.rpc(name,args).then(({data,error})=>{if(error)throw error;return data})}
function fmt(n){return n==null?'—':Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(Number(n))}
function dialog(html){
 let d=$('#nexa-admin-v22-dialog'); if(!d){d=document.createElement('dialog');d.id='nexa-admin-v22-dialog';d.className='nexa-admin-dialog';document.body.appendChild(d)}
 d.innerHTML=html; d.showModal(); $$('[data-close]',d).forEach(b=>b.onclick=()=>d.close()); return d;
}
function generalGuide(){
 const d=dialog(`<h3>Administration Quick Guide</h3><p>Use the arrows to move between Administration pages without going back Home.</p>
 <div class="nexa-module-row"><b>A</b> = Alliances<br><b>L</b> = Library<br><b>R</b> = Roles<br><b>M</b> = Module Access<br><b>S</b> = System Operations</div>
 <p><b>‹</b> previous section · <b>›</b> next section. The floating <b>Home</b> control remains your shortcut to other NEXA modules.</p>
 <div class="nexa-dialog-actions"><button class="btn secondary" id="nexa-guide-skip">Skip</button><button class="btn" id="nexa-guide-gotit">Got it</button></div>`);
 const done=()=>{localStorage.setItem('nexa_admin_guide_v23','seen');d.close()};$('#nexa-guide-gotit',d).onclick=done;$('#nexa-guide-skip',d).onclick=done;
}
function sectionGuide(key){const [t,c]=guideCopy[key]; dialog(`<h3>${esc(t)} Guide</h3><p>${esc(c)}</p><div class="nexa-dialog-actions"><button class="btn" data-close>Got it</button></div>`)}

function findAdminSections(){
 return tabs.map(t=>({t,el:document.getElementById(t.id)})).filter(x=>x.el);
}
function locateTabButtons(){
 return $$('.admin-tab, [data-admin-tab], .admin-tabs-scroll button').filter(b=>tabs.some(t=>{
   const z=(b.textContent||'').trim().toLowerCase();
   return z===t.label.toLowerCase() || (t.key==='module' && z==='permissions');
 }));
}
function ensureHeader(){
 const secs=findAdminSections(); if(!secs.length)return;
 const first=secs[0].el; const parent=first.parentElement; if(!parent)return;
 if(!$('#nexa-admin-general-guide',parent)){
   parent.style.position=parent.style.position||'relative';
   const g=document.createElement('button');g.id='nexa-admin-general-guide';g.className='nexa-guide-btn nexa-general-guide';g.textContent='ⓘ';g.title='Administration Quick Guide';g.onclick=generalGuide;parent.prepend(g);
 }
}
function navFor(key){
 const i=tabs.findIndex(x=>x.key===key), p=tabs[i-1], n=tabs[i+1], t=tabs[i];
 return `<div class="nexa-admin-v22-nav">
 ${p?`<button class="nexa-admin-v22-jump prev" data-admin-v22-go="${p.key}" title="${p.label}">‹ ${p.letter}</button>`:'<span></span>'}
 <div class="nexa-admin-v22-title"><span class="full">${t.label}</span><button class="nexa-guide-btn" data-section-guide="${key}" title="${t.label} guide">ⓘ</button></div>
 ${n?`<button class="nexa-admin-v22-jump next" data-admin-v22-go="${n.key}" title="${n.label}">${n.letter} ›</button>`:'<span></span>'}
 </div>`;
}
function compactSection(key,el){
 if(!el||key==='system')return;
 const keepIds={alliances:['nexa-ap-body'],roles:['nexa-roles-body'],module:['nexa-module-body'],library:['nexa-library-v22-body']}[key]||[];
 Array.from(el.children).forEach(ch=>{if(ch.classList?.contains('nexa-admin-v22-nav')||keepIds.includes(ch.id))ch.classList.remove('nexa-v23-legacy-hide');else ch.classList.add('nexa-v23-legacy-hide')});
}
function activate(key){
 current=key;
 const secs=findAdminSections();
 secs.forEach(({t,el})=>{
   const on=t.key===key;
   el.classList.toggle('nexa-admin-v22-hidden',!on);
   el.classList.toggle('hidden',!on);
   el.hidden=!on;
   el.setAttribute('aria-hidden',on?'false':'true');
 });
 locateTabButtons().forEach(b=>{
   const z=(b.textContent||'').trim().toLowerCase();
   const is=(key==='module' ? ['module access','permissions'].includes(z) : z===tabs.find(t=>t.key===key)?.label.toLowerCase());
   b.classList.toggle('active',is); b.setAttribute('aria-selected',is?'true':'false');
 });
 const el=document.getElementById(tabs.find(t=>t.key===key)?.id||'');
 if(el){
   compactSection(key,el);
   let nav=$('.nexa-admin-v22-nav',el); if(nav)nav.remove();
   el.insertAdjacentHTML('afterbegin',navFor(key));
   $$('[data-admin-v22-go]',el).forEach(b=>b.onclick=()=>activate(b.dataset.adminV22Go));
   $$('[data-section-guide]',el).forEach(b=>b.onclick=()=>sectionGuide(b.dataset.sectionGuide));
 }
 if(key==='alliances') loadAlliances();
 if(key==='roles') renderRoles();
 if(key==='module') loadModuleAccess();
 if(key==='library') renderLibraryLauncher();
 if(key==='system') renderTestingFramework();
}
function wireTabs(){
 const buttons=locateTabButtons();
 buttons.forEach(b=>{
   if((b.textContent||'').trim().toLowerCase()==='permissions') b.textContent='Module Access';
   if(b.dataset.nexaV23)return;b.dataset.nexaV23='1';
   b.addEventListener('click',()=>{
     const z=(b.textContent||'').trim().toLowerCase();
     const t=tabs.find(x=>x.label.toLowerCase()===z)||(z==='permissions'?tabs[3]:null);
     if(t)setTimeout(()=>activate(t.key),0);
   });
 });
 const currentButtons=locateTabButtons(), parent=currentButtons[0]?.parentElement;
 if(parent&&currentButtons.length>=5&&currentButtons.every(b=>b.parentElement===parent)){
   const byKey={};currentButtons.forEach(b=>{const z=(b.textContent||'').trim().toLowerCase();const t=tabs.find(x=>x.label.toLowerCase()===z)||(z==='permissions'?tabs[3]:null);if(t)byKey[t.key]=b});
   tabs.forEach(t=>{if(byKey[t.key])parent.appendChild(byKey[t.key])});
 }
}


async function loadAlliances(){
 const el=$('#admin-alliances'); if(!el)return;
 const old=$('#nexa-ap-body',el); if(old)old.remove();
 el.insertAdjacentHTML('beforeend',`<div id="nexa-ap-body"><div class="nexa-admin-actions"><button class="btn" id="nexa-create-alliance">+ Create / Manage Alliance</button></div><div id="nexa-ap-root" class="nexa-ap-grid"><div class="nexa-empty">Loading alliances…</div></div></div>`);
 compactSection('alliances',el);$('#nexa-create-alliance',el).onclick=createAlliance;
 try{allianceCache=await rpc('nexa_list_alliance_passports')||[]; renderAllianceGrid()}catch(e){$('#nexa-ap-root',el).innerHTML=`<div class="nexa-empty">${esc(e.message)}</div>`}
}
function renderAllianceGrid(){
 const root=$('#nexa-ap-root');if(!root)return;root.className='nexa-ap-grid';
 root.innerHTML=allianceCache.length?allianceCache.map(a=>`<button class="nexa-ap-planet" data-alliance="${a.id}" style="--planet:${esc(a.color||'#8b5cf6')}"><span class="nexa-ap-orbit">${a.emblemUrl?`<img src="${esc(a.emblemUrl)}" alt="">`:`<b>${esc(a.tag)}</b>`}</span><span class="nexa-ap-tag">${esc(a.tag)}</span><span class="nexa-ap-sub">${esc(a.name||'')}</span><span class="nexa-chip">${a.registeredMembers||0} members</span>${a.deletionStatus==='pending_deletion'?'<span class="nexa-chip">DELETING</span>':''}</button>`).join(''):'<div class="nexa-empty">No alliances found.</div>';
 $$('[data-alliance]',root).forEach(b=>b.onclick=()=>openAlliance(Number(b.dataset.alliance)));
}
function rankMembers(a,r){return (a.members||[]).filter(m=>r==='R3–R1'?['R3','R2','R1','',null].includes(m.rank):String(m.rank||'').toUpperCase()===r)}
function memberCard(m,a){
 const initials=String(m.name||'?').slice(0,2).toUpperCase();
 return `<article class="nexa-member"><div class="nexa-member-main"><span class="nexa-member-avatar">${m.photo?`<img src="${esc(m.photo)}" alt="">`:esc(initials)}</span><div class="nexa-member-copy"><b>${esc(m.name)}</b><small>ID ${esc(m.gameId)} · ${esc(m.rank||'R3–R1')}</small></div></div><div class="nexa-member-actions"><button class="btn secondary" data-person="${m.accountId}">Profile</button>${a.canAssignRanks?`<button class="btn secondary" data-rank="${m.accountId}">Role</button>`:''}${a.canManage?`<button class="btn secondary" data-reset="${m.accountId}">Reset Password</button>`:''}</div></article>`;
}
function openAlliance(id){
 const a=allianceCache.find(x=>Number(x.id)===Number(id));if(!a)return;
 const root=$('#nexa-ap-root');root.className='';
 const pending=a.deletionStatus==='pending_deletion';
 root.innerHTML=`<div class="nexa-admin-actions"><button class="btn secondary" id="nexa-alliance-back">← Alliance Planets</button></div><section class="nexa-passport" style="--planet:${esc(a.color||'#8b5cf6')}"><div class="nexa-passport-top"><div><small>ALLIANCE PASSPORT</small><h3>${esc(a.tag)} · ${esc(a.name||'')}</h3></div><span class="nexa-chip">${a.active?'ACTIVE':'INACTIVE'}</span></div><div class="nexa-pass-stats"><div class="nexa-pass-stat"><small>Password</small><b>${a.password?esc(a.password):'••••••••'}</b></div><div class="nexa-pass-stat"><small>Members</small><b>${a.registeredMembers||0}</b></div><div class="nexa-pass-stat"><small>Power</small><b>${fmt(a.registeredPower)}</b></div><div class="nexa-pass-stat"><small>Server Rank</small><b>${a.serverRank?`#${a.serverRank}`:'—'}</b></div></div>
 ${a.canManage?`<div class="nexa-admin-actions"><button class="btn secondary" id="nexa-edit-alliance">Edit / Password</button>${a.canDelete?(pending?'<button class="btn nexa-danger" id="nexa-cancel-delete">Cancel Deletion</button>':'<button class="btn nexa-danger" id="nexa-delete-alliance">Delete Alliance</button>'):''}</div>`:''}
 ${pending?`<div class="nexa-warning">Scheduled removal: <b>${new Date(a.scheduledDeleteAt).toLocaleString()}</b>. Members remain intact and become unassigned.</div>`:''}</section>
 ${['R5','R4','R3–R1'].map(r=>{const ms=rankMembers(a,r);return `<section class="nexa-rank-group"><h4>${r} <span class="nexa-chip">${ms.length}</span></h4><div class="nexa-member-grid">${ms.length?ms.map(m=>memberCard(m,a)).join(''):'<div class="nexa-empty">No members</div>'}</div></section>`}).join('')}`;
 $('#nexa-alliance-back').onclick=renderAllianceGrid;
 if($('#nexa-edit-alliance'))$('#nexa-edit-alliance').onclick=()=>editAlliance(a);
 if($('#nexa-delete-alliance'))$('#nexa-delete-alliance').onclick=()=>deleteAlliance(a);
 if($('#nexa-cancel-delete'))$('#nexa-cancel-delete').onclick=()=>cancelDelete(a);
 $$('[data-person]',root).forEach(b=>b.onclick=()=>personDialog(a.members.find(m=>m.accountId===b.dataset.person)));
 $$('[data-rank]',root).forEach(b=>b.onclick=()=>rankDialog(a,a.members.find(m=>m.accountId===b.dataset.rank)));
 $$('[data-reset]',root).forEach(b=>b.onclick=()=>resetPassword(a.members.find(m=>m.accountId===b.dataset.reset)));
}
function createAlliance(){
 const d=dialog(`<h3>Manage Alliances</h3><label>Alliance Tag<input id="na-tag" maxlength="8" placeholder="FSU"></label><label>Alliance Name<input id="na-name"></label><label>Alliance Password<input id="na-pass"></label><label>Planet Color<input id="na-color" type="color" value="#8b5cf6"></label><div class="nexa-dialog-actions"><button class="btn secondary" data-close>Cancel</button><button class="btn" id="na-save">Create Alliance</button></div>`);
 $('#na-save',d).onclick=async()=>{try{await rpc('nexa_create_alliance',{p_tag:$('#na-tag',d).value,p_name:$('#na-name',d).value||null,p_password:$('#na-pass',d).value||null,p_color:$('#na-color',d).value});d.close();await loadAlliances()}catch(e){alert(e.message)}};
}
function editAlliance(a){
 const d=dialog(`<h3>${esc(a.tag)} · Alliance Passport</h3><label>Name<input id="ea-name" value="${esc(a.name||'')}"></label><label>Password<input id="ea-pass" value="${esc(a.password||'')}" autocomplete="off"></label><label>Color<input id="ea-color" type="color" value="${esc(a.color||'#8b5cf6')}"></label><label>Server Rank<input id="ea-rank" type="number" min="1" value="${a.serverRank||''}"></label><label>Official Game Power<input id="ea-power" type="number" min="0" value="${a.gamePower||''}"></label><label><input id="ea-active" type="checkbox" ${a.active?'checked':''}> Active</label><div class="nexa-dialog-actions"><button class="btn secondary" data-close>Cancel</button><button class="btn" id="ea-save">Save</button></div>`);
 $('#ea-save',d).onclick=async()=>{try{await rpc('nexa_update_alliance_passport',{p_alliance_id:a.id,p_name:$('#ea-name',d).value||null,p_color:$('#ea-color',d).value,p_server_rank:$('#ea-rank',d).value?Number($('#ea-rank',d).value):null,p_game_power:$('#ea-power',d).value?Number($('#ea-power',d).value):null,p_is_active:$('#ea-active',d).checked,p_password:$('#ea-pass',d).value});d.close();await loadAlliances()}catch(e){alert(e.message)}};
}
async function deleteAlliance(a){if(!confirm(`Schedule ${a.tag} for removal in 24 hours?`))return;try{await rpc('nexa_request_alliance_deletion',{p_alliance_id:a.id});await loadAlliances()}catch(e){alert(e.message)}}
async function cancelDelete(a){try{await rpc('nexa_cancel_alliance_deletion',{p_alliance_id:a.id});await loadAlliances()}catch(e){alert(e.message)}}
function rankDialog(a,m){
 if(!m)return; const options=nexaRole==='owner'||nexaRole==='admin'?['R5','R4','R3','R2','R1']:['R4','R3','R2','R1'];
 const d=dialog(`<h3>${esc(m.name)} · Role</h3><p>Alliance role only. Special NEXA access is managed separately under Module Access.</p><label>Alliance Role<select id="mr-rank">${options.map(x=>`<option ${x===m.rank?'selected':''}>${x}</option>`).join('')}</select></label><div class="nexa-dialog-actions"><button class="btn secondary" data-close>Cancel</button><button class="btn" id="mr-save">Save Role</button></div>`);
 $('#mr-save',d).onclick=async()=>{try{await rpc('nexa_set_alliance_rank',{p_account_id:m.accountId,p_new_rank:$('#mr-rank',d).value});d.close();await loadAlliances()}catch(e){alert(e.message)}};
}
function personDialog(m){
 if(!m)return; const accounts=m.accounts||[];
 const d=dialog(`<h3>${esc(m.name)}</h3><p>Choose an account to view its Passport.</p>${accounts.map(x=>`<button class="nexa-module-row" style="width:100%;color:inherit;text-align:left" data-account-view="${x.id}"><b>${esc(x.name)}${x.isMain?' · MAIN':''}</b><br><small>ID ${esc(x.gameId)} · ${esc(x.furnace||'—')} · ${fmt(x.power)}</small></button>`).join('')||'<div class="nexa-empty">No linked accounts.</div>'}<div class="nexa-dialog-actions"><button class="btn" data-close>Close</button></div>`);
 $$('[data-account-view]',d).forEach(b=>b.onclick=()=>{
   const a=accounts.find(x=>x.id===b.dataset.accountView);
   if(typeof window.openAccountPassport==='function'){d.close();window.openAccountPassport(a.id);return}
   dialog(`<h3>${esc(a.name)}${a.isMain?' · MAIN':''}</h3><p>ID ${esc(a.gameId)}</p><div class="nexa-pass-stats"><div class="nexa-pass-stat"><small>Furnace</small><b>${esc(a.furnace||'—')}</b></div><div class="nexa-pass-stat"><small>Power</small><b>${fmt(a.power)}</b></div><div class="nexa-pass-stat"><small>Deployment</small><b>${fmt(a.deployment)}</b></div></div><div class="nexa-dialog-actions"><button class="btn" data-close>Close</button></div>`)
 });
}
function resetPassword(m){
 const d=dialog(`<h3>Reset NEXA Password</h3><p>${esc(m.name)} · ID ${esc(m.gameId)}</p><label>Temporary Password<input id="rp-pass" type="password" minlength="8" autocomplete="new-password"></label><p><small>The player should change this temporary password after signing in.</small></p><div class="nexa-dialog-actions"><button class="btn secondary" data-close>Cancel</button><button class="btn" id="rp-save">Reset Password</button></div>`);
 $('#rp-save',d).onclick=async()=>{const password=$('#rp-pass',d).value;if(password.length<8){alert('Use at least 8 characters.');return}try{const {data:{session}}=await window.supabaseClient.auth.getSession();const r=await fetch('/api/nexa-admin-reset-password',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session?.access_token||''}`},body:JSON.stringify({account_id:m.accountId,password})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Reset failed');d.close();alert('Password reset complete.')}catch(e){alert(e.message)}};
}

async function renderRoles(){
 const el=$('#admin-roles');if(!el)return; let body=$('#nexa-roles-body',el);if(body)body.remove();el.insertAdjacentHTML('beforeend','<div id="nexa-roles-body"><div class="nexa-empty">Loading roles…</div></div>');body=$('#nexa-roles-body',el);compactSection('roles',el);
 try{if(!allianceCache.length)allianceCache=await rpc('nexa_list_alliance_passports')||[];body.innerHTML=allianceCache.map(a=>`<section class="nexa-passport" style="margin-bottom:12px"><h3>${esc(a.tag)} · ${esc(a.name||'')}</h3>${['R5','R4','R3–R1'].map(r=>{const ms=rankMembers(a,r);return `<div class="nexa-rank-group"><h4>${r}</h4><div class="nexa-member-grid">${ms.length?ms.map(m=>memberCard(m,a)).join(''):'<div class="nexa-empty">No members</div>'}</div></div>`}).join('')}</section>`).join('')||'<div class="nexa-empty">No alliance roles found.</div>';$$('[data-rank]',body).forEach(b=>b.onclick=()=>{const a=allianceCache.find(a=>(a.members||[]).some(m=>m.accountId===b.dataset.rank));if(a)rankDialog(a,a.members.find(m=>m.accountId===b.dataset.rank))})}catch(e){body.innerHTML=`<div class="nexa-empty">${esc(e.message)}</div>`}
}
async function loadModuleAccess(){
 const el=$('#admin-permissions');if(!el)return;let body=$('#nexa-module-body',el);if(body)body.remove();el.insertAdjacentHTML('beforeend','<div id="nexa-module-body"><input id="nexa-module-search" type="search" placeholder="Search player or Game ID" style="width:100%;margin:0 0 10px"><div id="nexa-module-list"><div class="nexa-empty">Loading Module Access…</div></div></div>');body=$('#nexa-module-body',el);const list=$('#nexa-module-list',body);compactSection('module',el);
 try{const rows=await rpc('nexa_list_module_access')||[];const mods=[['svs','SvS'],['sbs','SBS'],['transfer','Transfer'],['team_builder','Team Builder'],['forms','Forms'],['events','Events'],['library','Library'],['administration','Administration']];list.innerHTML=rows.map(p=>`<div class="nexa-module-row"><div class="nexa-module-head"><div><b>${esc(p.name)}</b><small style="display:block;color:var(--muted)">ID ${esc(p.gameId)} · ${esc(p.allianceRole||'R3–R1')}</small></div></div><div class="nexa-module-checks">${mods.map(([k,n])=>`<label><input type="checkbox" data-access-user="${p.userId}" data-access-module="${k}" ${p[k==='team_builder'?'teamBuilder':k]?'checked':''}> ${n}</label>`).join('')}</div></div>`).join('')||'<div class="nexa-empty">No players found.</div>';$$('[data-access-user]',list).forEach(c=>c.onchange=async()=>{c.disabled=true;try{await rpc('nexa_set_module_access',{p_user_id:c.dataset.accessUser,p_module:c.dataset.accessModule,p_enabled:c.checked})}catch(e){c.checked=!c.checked;alert(e.message)}finally{c.disabled=false}});const q=$('#nexa-module-search',body);if(q)q.oninput=()=>{const v=q.value.trim().toLowerCase();$$('.nexa-module-row',list).forEach(r=>r.style.display=!v||(r.innerText||'').toLowerCase().includes(v)?'':'none')}}catch(e){list.innerHTML=`<div class="nexa-empty">${esc(e.message)}</div>`}
}
function renderLibraryLauncher(){
 const el=$('#admin-library');if(!el)return;let body=$('#nexa-library-v22-body',el);if(body)return;
 el.insertAdjacentHTML('beforeend',`<div id="nexa-library-v22-body"><div class="nexa-passport"><h3>Library Catalog</h3><p>Heroes · Experts · Pets · Troops · Chief Gear · Charms</p><div class="nexa-admin-actions"><button class="btn" id="nexa-open-library">Open Library</button></div></div></div>`);
 compactSection('library',el);$('#nexa-open-library',el).onclick=()=>{location.href='library.html'};
}

function renderTestingFramework(){
 const el=$('#admin-system');if(!el)return;
 let host=$('#nexa-testing-v23',el);if(host)return;
 host=document.createElement('section');host.id='nexa-testing-v23';host.className='nexa-passport';host.style.marginTop='16px';
 host.innerHTML=`<div class="nexa-admin-v22-section-head"><h3>Testing</h3><span class="nexa-framework-badge">FRAMEWORK READY</span></div>
 <p style="color:var(--muted,#aeb4ca)">Preview controls are staged here without changing your real role, permissions or production data.</p>
 <div class="nexa-testing-grid">
  <div class="nexa-testing-card"><h4>Test Mode</h4><label>Mode<select id="nexa-test-mode"><option value="off">Test Mode Off</option><option value="manual">Test Mode</option><option value="auto">Test Mode Auto</option></select></label><small>Manual and Auto activation will be enabled in a future phase.</small></div>
  <div class="nexa-testing-card nexa-testing-disabled"><h4>Permission Preview</h4><label>View as<select><option>Owner</option><option>Admin</option><option>R5</option><option>R4</option><option>R3–R1</option></select></label><div class="nexa-module-checks">${['SBS','SvS','Transfer','Team Builder','Forms','Events','Library','Administration'].map(x=>`<label><input type="checkbox"> ${x}</label>`).join('')}</div><button class="btn secondary" data-test-coming style="margin-top:10px">Start Preview</button></div>
  <div class="nexa-testing-card nexa-testing-disabled"><h4>Battle Sandbox</h4><label>Teams<input type="number" min="1" max="12" value="6"></label><label>Rally Capacity<input type="number" min="0" placeholder="e.g. 120000"></label><button class="btn secondary" data-test-coming style="margin-top:10px">Open Sandbox</button><small>Battle Form / Team Sheet preview and buff intelligence will be activated later.</small></div>
 </div>`;
 el.appendChild(host);
 $$('[data-test-coming]',host).forEach(b=>b.onclick=()=>alert('Framework ready. This testing feature is not active yet.'));
 const mode=$('#nexa-test-mode',host);if(mode)mode.onchange=()=>{if(mode.value!=='off'){alert('The testing framework is ready, but activation is intentionally disabled for now.');mode.value='off'}};
}
function adminIsOpen(){const m=$('#admin-modal');return !!(m&&m.classList.contains('open'))}
function maybeShowAdminGuide(){
 if(!adminIsOpen())return;
 const q=new URLSearchParams(location.search), admin=q.get('admin'), raw=(q.get('tab')||'').toLowerCase();
 const visible=findAdminSections().find(({el})=>!el.hidden&&!el.classList.contains('hidden'));
 const isAdministration=admin==='administration'||!!visible;
 if(!isAdministration)return;
 ensureHeader();wireTabs();
 const key=raw==='permissions'?'module':tabs.some(t=>t.key===raw)?raw:(visible?.t?.key||current);
 if(key)activate(key);
 if(!localStorage.getItem('nexa_admin_guide_v23'))setTimeout(()=>{if(adminIsOpen())generalGuide()},180);
}
function profileOwnershipGuards(){
 const modal=$('#nexa-profile-modal');if(!modal)return;
 // Hide redundant Owned/Own It controls in My Profile only. Library remains untouched.
 $$('.nexa-lib-owned,[data-owned-label]',modal).forEach(el=>el.style.display='none');
 $$('label,button,span',modal).forEach(el=>{const t=(el.textContent||'').trim();if(/^(Owned|Own It)$/i.test(t)&&!el.dataset.nexaReset)el.style.display='none'});
 // Heroes / Experts / Pets get a local per-card reset. It reuses the existing Save path instead of inventing a second DB write path.
 $$('.nexa-lib-card',modal).forEach(card=>{
   const txt=(card.innerText||'').toUpperCase();
   const resetEligible=/HERO LEVEL|AFFINITY|PET LEVEL|SKILL LEVEL/.test(txt)&&!/CURRENT TIER|CHARM [123] LEVEL/.test(txt);
   if(resetEligible&&!$('[data-nexa-reset]',card)){const b=document.createElement('button');b.type='button';b.className='btn secondary';b.dataset.nexaReset='1';b.textContent='Reset';b.style.cssText='width:100%;margin-top:7px';const save=$('.nexa-lib-save',card);(save?.parentElement||card).insertBefore(b,save?.nextSibling||null)}
 });
 // Stable troop framing regardless of selected tier.
 $$('img',modal).forEach(img=>{let p=img.parentElement,txt='';for(let i=0;p&&i<5;i++,p=p.parentElement)txt+=' '+(p.innerText||'').slice(0,250);if(/Infantry|Lancer|Marksman/i.test(txt)&&/T\d|FC\d|HELIOS|TROOP/i.test(txt)){img.style.objectFit='contain';img.style.objectPosition='center';img.style.transform='none';img.style.padding=/Lancer/i.test(txt)?'12%':'7%';img.style.boxSizing='border-box'}});
}
let profileAccountId=window.NEXA_ACTIVE_ACCOUNT_ID||null, profileFurnace=null;
async function refreshProfileFurnace(){
 if(!profileAccountId||!window.supabaseClient)return;
 try{const {data,error}=await window.supabaseClient.from('player_accounts').select('furnace_level').eq('id',profileAccountId).maybeSingle();if(!error)profileFurnace=Number(String(data?.furnace_level||'').replace(/[^0-9]/g,''))||0}catch{}
}
function profileTabKey(tab){return tab?.dataset?.libraryTab||tab?.dataset?.nexaTab||''}
function gateProfileTab(tab){
 const key=profileTabKey(tab);if(!['gear','charms','pets'].includes(key))return false;
 if(key==='gear'&&profileFurnace!=null&&profileFurnace<22){alert('🔒 Chief Gear unlocks at Furnace Lv. 22.');return true}
 if(key==='charms'&&profileFurnace!=null&&profileFurnace<25){alert('🔒 Charms unlock at Furnace Lv. 25.');return true}
 if(key==='pets'&&profileFurnace!=null&&profileFurnace<18){alert('🔒 Pets require Furnace Lv. 18.');return true}
 if(key==='pets'&&profileFurnace>=18&&profileAccountId){const k='nexa_pets_unlocked_'+profileAccountId;const v=localStorage.getItem(k);if(v!=='yes'){const yes=confirm('Does your server already have Pets unlocked?\n\nOK = Yes · Cancel = No');if(!yes){localStorage.setItem(k,'no');return true}localStorage.setItem(k,'yes')}}
 if((key==='gear'||key==='charms')&&profileAccountId){const k='nexa_profile_'+key+'_guide_'+profileAccountId;if(!localStorage.getItem(k)){alert(key==='gear'?'Select only the Chief Gear pieces you currently have. Configuring a piece counts it as owned.':'Select only the Charms you currently have unlocked. You can save 1–3 charms per Chief Gear piece.');localStorage.setItem(k,'seen')}}
 return false;
}
function installProfileBehavior(){
 if(window.__NEXA_PROFILE_V23_WIRED__)return;window.__NEXA_PROFILE_V23_WIRED__=true;
 document.addEventListener('click',e=>{
   const planet=e.target.closest?.('[data-nexa-profile]');if(planet){profileAccountId=planet.dataset.nexaProfile||profileAccountId;window.__NEXA_V23_PROFILE_ACCOUNT__=profileAccountId;setTimeout(refreshProfileFurnace,0)}
   const tab=e.target.closest?.('#nexa-profile-modal [data-library-tab],#nexa-profile-modal [data-nexa-tab]');if(tab&&gateProfileTab(tab)){e.preventDefault();e.stopImmediatePropagation();return}
   const reset=e.target.closest?.('#nexa-profile-modal [data-nexa-reset]');if(reset){e.preventDefault();const card=reset.closest('.nexa-lib-card');if(!card)return;if(!confirm('Reset this item? This will clear its saved profile selections.'))return;$$('input[data-f],select[data-f]',card).forEach(x=>{x.value=''});const owned=$('[data-owned]',card);if(owned)owned.checked=false;const save=$('.nexa-lib-save',card);if(save)save.click();return}
   const save=e.target.closest?.('#nexa-profile-modal .nexa-lib-save');if(save){const card=save.closest('.nexa-lib-card');const owned=$('[data-owned]',card);if(owned){const any=$$('[data-f]',card).some(x=>String(x.value??'').trim()!==''&&String(x.value)!=='0');owned.checked=any}}
 },true);
}

function troopTuning(){
 const tune=()=>{
   $$('img').forEach(img=>{
     if(img.dataset.nexaTroopFit)return;
     let p=img.parentElement, hit='';
     for(let i=0;p&&i<4;i++,p=p.parentElement){
       const txt=(p.innerText||'').slice(0,500);
       if(/\bInfantry\b/i.test(txt)&&/\bTroop\b/i.test(txt)){hit='infantry';break}
       if(/\bLancer\b/i.test(txt)&&/\bTroop\b/i.test(txt)){hit='lancer';break}
       if(/\bMarksman\b/i.test(txt)&&/\bTroop\b/i.test(txt)){hit='marksman';break}
     }
     if(hit){img.dataset.nexaTroopFit=hit;img.classList.add('nexa-troop-fit');if(hit==='lancer')img.classList.add('nexa-troop-fit-lancer')}
   });
   if(lastFC){
    $$('button').filter(b=>/^(NONE|FC\d+)$/i.test((b.textContent||'').trim())).forEach(b=>{
      let p=b.parentElement,ok=false;for(let i=0;p&&i<3;i++,p=p.parentElement){if(/FIRE CRYSTAL LEVEL/i.test(p.innerText||'')){ok=true;break}}
      if(ok)b.dataset.nexaFcSelected=((b.textContent||'').trim().toUpperCase()===lastFC)?'1':'0';
    });
   }
 };
 document.addEventListener('click',e=>{
   const b=e.target.closest?.('button');if(!b)return;const v=(b.textContent||'').trim().toUpperCase();if(!/^(NONE|FC\d+)$/.test(v))return;
   let p=b.parentElement,ok=false;for(let i=0;p&&i<4;i++,p=p.parentElement){if(/FIRE CRYSTAL LEVEL/i.test(p.innerText||'')){ok=true;break}} if(!ok)return;
   lastFC=v;setTimeout(tune,0);setTimeout(tune,120);
 },true);
 const mo=new MutationObserver(()=>requestAnimationFrame(tune));mo.observe(document.documentElement,{childList:true,subtree:true});tune();
}

async function init(){
 css(); wireTabs(); ensureHeader();
 try{nexaRole=(await rpc('current_nexa_role'))||'player'}catch{}
 if(!['owner','admin'].includes(nexaRole)){
   locateTabButtons().filter(b=>(b.textContent||'').trim()==='Module Access').forEach(b=>b.style.display='none');
 }
 troopTuning();profileOwnershipGuards();installProfileBehavior();
}
const boot=new MutationObserver(()=>{
 wireTabs();profileOwnershipGuards();
 if(adminIsOpen())maybeShowAdminGuide();
 if(!window.__NEXA_ADMIN_V23_INIT__&&($('#admin-alliances')||$('#admin-library'))){window.__NEXA_ADMIN_V23_INIT__=true;init()}
});
boot.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();setTimeout(maybeShowAdminGuide,100)});else setTimeout(()=>{init();maybeShowAdminGuide()},50);
})();
