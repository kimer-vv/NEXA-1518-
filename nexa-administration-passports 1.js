/* NEXA Administration — Alliance Passports V1 */
(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>n==null?'—':Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(Number(n));
  const when=v=>v?new Date(v).toLocaleString():'—';
  const roles=[['scheduler','Scheduler'],['svs','SvS'],['transfers','Transfers'],['event_operations','Event Operations'],['team_builder','Team Builder'],['test_lab','Test Lab']];
  let alliances=[],opened=null,myNexaRole='player',hasAllianceStaff=false;

  function css(){
    if($('#nexa-passports-style'))return;
    const s=document.createElement('style');s.id='nexa-passports-style';s.textContent=`
      .ap-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:18px}.ap-head h3{margin:0 0 6px}.ap-head p{margin:0;color:var(--muted)}
      .ap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.ap-planet-card{appearance:none;color:inherit;border:1px solid color-mix(in srgb,var(--planet) 65%,transparent);border-radius:24px;background:radial-gradient(circle at 50% 25%,color-mix(in srgb,var(--planet) 22%,transparent),rgba(5,8,24,.86) 62%);padding:18px 12px;text-align:center;min-width:0;box-shadow:0 0 24px color-mix(in srgb,var(--planet) 20%,transparent)}
      .ap-orbit{width:116px;height:116px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;border:3px solid var(--planet);box-shadow:0 0 22px var(--planet),inset 0 0 24px color-mix(in srgb,var(--planet) 30%,transparent);position:relative;background:rgba(8,15,38,.9)}
      .ap-orbit:before,.ap-orbit:after{content:"";position:absolute;border-radius:50%;border:1px dotted color-mix(in srgb,var(--planet) 72%,transparent)}.ap-orbit:before{inset:-9px}.ap-orbit:after{inset:8px}.ap-orbit img{width:78px;height:78px;object-fit:contain;border-radius:50%}.ap-tag{font-weight:950;font-size:1.15rem}.ap-meta{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:7px}.ap-chip{border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:5px 8px;font-size:.7rem;color:var(--muted)}.ap-pending{border-color:#ef4444!important;box-shadow:0 0 26px rgba(239,68,68,.28)!important}.ap-pending .ap-orbit{border-color:#ef4444;box-shadow:0 0 22px #ef4444}.ap-empty{grid-column:1/-1;padding:28px;text-align:center;border:1px dashed rgba(255,255,255,.14);border-radius:20px;color:var(--muted)}
      .ap-detail{display:grid;gap:16px}.ap-back{width:max-content}.ap-banner{border:1px solid color-mix(in srgb,var(--planet) 55%,transparent);border-radius:22px;padding:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--planet) 20%,transparent),rgba(5,8,24,.76))}.ap-banner-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ap-banner h3{margin:0;font-size:1.7rem}.ap-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.ap-stat{padding:12px;border:1px solid rgba(255,255,255,.11);border-radius:15px;background:rgba(5,8,24,.45)}.ap-stat small{display:block;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}.ap-stat b{display:block;margin-top:5px}.ap-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.ap-danger{color:#fecaca!important;border-color:#ef4444!important;background:rgba(127,29,29,.28)!important}.ap-warning{border:1px solid #ef4444;border-radius:16px;padding:14px;background:rgba(127,29,29,.19);color:#fecaca}.ap-groups{display:grid;gap:18px}.ap-group h4{margin:0 0 10px}.ap-members{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ap-member{border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:12px;background:rgba(8,12,29,.62);min-width:0}.ap-member-head{display:flex;align-items:center;gap:10px}.ap-avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--planet);background:rgba(255,255,255,.06);overflow:hidden;font-weight:900}.ap-avatar img{width:100%;height:100%;object-fit:cover}.ap-member-copy{min-width:0;flex:1}.ap-member-copy b,.ap-member-copy small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ap-member-copy small{color:var(--muted);margin-top:3px}.ap-role-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}.ap-member-actions{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}.ap-member-actions button{font-size:.76rem;padding:7px 9px}.ap-dialog{border:1px solid rgba(142,92,255,.72);border-radius:22px;background:#080b20;color:#fff;width:min(520px,calc(100vw - 28px));max-height:85dvh;overflow:auto;padding:20px;box-shadow:0 25px 90px #000}.ap-dialog::backdrop{background:rgba(0,0,0,.75);backdrop-filter:blur(4px)}.ap-dialog h3{margin-top:0}.ap-form{display:grid;gap:12px}.ap-form label{display:grid;gap:6px}.ap-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ap-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.11);border-radius:12px;padding:9px}.ap-check input{width:auto!important;margin:0}.ap-dialog-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px}.ap-permission-card{border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;margin-top:12px;background:rgba(8,12,29,.62)}
      @media(max-width:430px){.ap-grid,.ap-members{grid-template-columns:1fr 1fr}.ap-orbit{width:102px;height:102px}.ap-stats{grid-template-columns:1fr 1fr}.ap-member{padding:10px}.ap-avatar{width:44px;height:44px}}
    `;document.head.appendChild(s);
  }

  async function rpc(name,args={}){
    const {data,error}=await supabaseClient.rpc(name,args);if(error)throw error;return data;
  }
  function toast(text,bad=false){const m=$('#admin-alliances-message')||$('#permissions-message');if(!m)return;m.textContent=text;m.classList.toggle('error',bad);}
  function planet(a){
    const pending=a.deletionStatus==='pending_deletion';
    return `<button class="ap-planet-card ${pending?'ap-pending':''}" style="--planet:${esc(a.color||'#8b5cf6')}" data-ap-open="${a.id??'unassigned'}">
      <span class="ap-orbit">${a.emblemUrl?`<img src="${esc(a.emblemUrl)}" alt="">`:`<b>${esc(a.tag==='UNASSIGNED'?'?':a.tag)}</b>`}</span>
      <span class="ap-tag">${esc(a.tag)}</span><small>${esc(a.name||'')}</small>
      <span class="ap-meta"><span class="ap-chip">${a.registeredMembers||0} members</span><span class="ap-chip">${fmt(a.registeredPower)} power</span>${pending?'<span class="ap-chip">DELETING</span>':''}</span>
    </button>`;
  }
  async function load(){
    const section=$('#admin-alliances');if(!section)return;
    section.innerHTML=`<div class="ap-head"><div><h3>Alliance Passports</h3><p>Alliance planets, members, ranks and operational access.</p></div></div><div id="admin-alliances-message" class="form-message"></div><div id="ap-root" class="ap-grid"><div class="ap-empty">Loading alliance constellation…</div></div>`;
    try{
      const [list,unassigned,role]=await Promise.all([rpc('nexa_list_alliance_passports'),rpc('nexa_list_unassigned_passport'),rpc('current_nexa_role')]);
      myNexaRole=role||'player';alliances=[...(list||[]),unassigned].filter(Boolean);renderGrid();
    }catch(e){$('#ap-root').innerHTML=`<div class="ap-empty">${esc(e.message)}</div>`;}
  }
  function renderGrid(){
    opened=null;$('#ap-root').className='ap-grid';$('#ap-root').innerHTML=alliances.length?alliances.map(planet).join(''):'<div class="ap-empty">No alliances found.</div>';
  }
  function rankGroup(a,rank){return (a.members||[]).filter(m=>rank==='R3–R1'?['R3','R2','R1',null].includes(m.rank):m.rank===rank);}
  function member(m,a){
    const initials=String(m.name||'?').slice(0,2).toUpperCase();
    return `<article class="ap-member" style="--planet:${esc(a.color)}"><div class="ap-member-head"><span class="ap-avatar">${m.photo?`<img src="${esc(m.photo)}" alt="">`:esc(initials)}</span><div class="ap-member-copy"><b>${esc(m.name)}</b><small>ID ${esc(m.gameId)} · ${esc(m.rank||'No rank')}</small></div></div><div class="ap-role-row">${(m.roles||[]).map(r=>`<span class="ap-chip">${esc(roles.find(x=>x[0]===r)?.[1]||r)}</span>`).join('')}</div>${a.canAssignRanks?`<div class="ap-member-actions"><button class="btn secondary" data-ap-player="${m.accountId}">Manage</button><button class="btn secondary" data-ap-view="${m.accountId}">Passport</button></div>`:''}</article>`;
  }
  function renderPassport(a){
    opened=a;const pending=a.deletionStatus==='pending_deletion';$('#ap-root').className='ap-detail';
    $('#ap-root').innerHTML=`<button class="btn secondary ap-back" data-ap-back>← Alliance Planets</button>
      <section class="ap-banner" style="--planet:${esc(a.color)}"><div class="ap-banner-top"><div><small>ALLIANCE PASSPORT</small><h3>${esc(a.tag)} · ${esc(a.name)}</h3></div><span class="ap-chip">${a.active?'ACTIVE':'INACTIVE'}</span></div>
      <div class="ap-stats"><div class="ap-stat"><small>Game Power</small><b>${fmt(a.gamePower)}</b></div><div class="ap-stat"><small>NEXA Registered Power</small><b>${fmt(a.registeredPower)}</b></div><div class="ap-stat"><small>Server Rank</small><b>${a.serverRank?`#${a.serverRank}`:'—'}</b></div><div class="ap-stat"><small>Registered Members</small><b>${a.registeredMembers||0}</b></div></div>
      ${a.canManage?`<div class="ap-actions">${a.id!=null?`<button class="btn secondary" data-ap-edit>Edit Alliance</button><button class="btn secondary" data-ap-toggle>${a.active?'Deactivate':'Activate'}</button>${pending?'<button class="btn ap-danger" data-ap-cancel-delete>Cancel Deletion</button>':'<button class="btn ap-danger" data-ap-delete>⚠ Delete Alliance</button>'}`:''}</div>`:''}
      ${pending?`<div class="ap-warning">⚠ Pending permanent deletion<br><b>${esc(when(a.scheduledDeleteAt))}</b><br>Members will move to Unassigned.</div>`:''}</section>
      <section class="ap-groups">${['R5','R4','R3–R1'].map(r=>{const ms=rankGroup(a,r);return `<div class="ap-group"><h4>${r} <span class="ap-chip">${ms.length}</span></h4><div class="ap-members">${ms.length?ms.map(m=>member(m,a)).join(''):'<div class="ap-empty">No members</div>'}</div></div>`}).join('')}</section>`;
  }
  function dialog(html){let d=$('#ap-dialog');if(!d){d=document.createElement('dialog');d.id='ap-dialog';d.className='ap-dialog';document.body.appendChild(d);}d.innerHTML=html;d.showModal();return d;}
  function editAlliance(a){
    const d=dialog(`<h3>Edit ${esc(a.tag)}</h3><form id="ap-edit-form" class="ap-form"><label>Alliance Name<input name="name" value="${esc(a.name)}"></label><label>Alliance Color<input name="color" type="color" value="${esc(a.color||'#8b5cf6')}"></label><label>Server Rank<input name="rank" type="number" min="1" value="${a.serverRank||''}"></label><label>Official Game Power<input name="power" type="number" min="0" value="${a.gamePower||''}"></label><label class="ap-check"><input name="active" type="checkbox" ${a.active?'checked':''}> Active alliance</label><div class="ap-dialog-actions"><button type="button" class="btn secondary" data-ap-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
    $('#ap-edit-form',d).onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await rpc('nexa_update_alliance_passport',{p_alliance_id:a.id,p_name:f.get('name'),p_color:f.get('color'),p_server_rank:f.get('rank')?Number(f.get('rank')):null,p_game_power:f.get('power')?Number(f.get('power')):null,p_is_active:f.get('active')==='on'});d.close();await reload(a.id);}catch(x){alert(x.message)}};
  }
  function managePlayer(m,a){
    const allowedRanks=myNexaRole==='owner'||myNexaRole==='admin'?['R1','R2','R3','R4','R5']:(a.canManage?['R1','R2','R3','R4']:['R1','R2','R3']);
    const d=dialog(`<h3>${esc(m.name)}</h3><p>Game ID ${esc(m.gameId)}</p><form id="ap-player-form" class="ap-form"><label>Alliance Rank<select name="rank">${allowedRanks.map(r=>`<option ${m.rank===r?'selected':''}>${r}</option>`).join('')}</select></label><b>Operational Roles</b><div class="ap-checks">${roles.map(([k,n])=>`<label class="ap-check"><input type="checkbox" name="roles" value="${k}" ${(m.roles||[]).includes(k)?'checked':''}> ${n}</label>`).join('')}</div><div class="ap-dialog-actions"><button type="button" class="btn secondary" data-ap-close>Cancel</button><button class="btn" type="submit">Save</button></div></form>`);
    $('#ap-player-form',d).onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{if(f.get('rank')!==m.rank)await rpc('nexa_set_alliance_rank',{p_account_id:m.accountId,p_new_rank:f.get('rank')});await rpc('nexa_set_operational_roles',{p_account_id:m.accountId,p_roles:f.getAll('roles')});d.close();await reload(a.id);}catch(x){alert(x.message)}};
  }
  async function reload(openId){const [list,u]=await Promise.all([rpc('nexa_list_alliance_passports'),rpc('nexa_list_unassigned_passport')]);alliances=[...(list||[]),u].filter(Boolean);const a=alliances.find(x=>String(x.id??'unassigned')===String(openId));a?renderPassport(a):renderGrid();}

  async function permissions(){
    const s=$('#admin-permissions');if(!s)return;s.innerHTML=`<div class="ap-head"><div><h3>Admin Permissions</h3><p>Only the Owner can assign or remove NEXA Admin access.</p></div></div><form id="ap-admin-search" class="alliance-inline-form"><input id="ap-admin-id" inputmode="numeric" placeholder="Enter Game ID" required><button class="btn">Search</button></form><div id="permissions-message" class="form-message"></div><div id="ap-admin-result"></div><h4>Owner & Admins</h4><div id="permissions-list" class="admin-list"></div>`;
    try{myNexaRole=await rpc('current_nexa_role');if(myNexaRole!=='owner'){s.innerHTML='<div class="ap-empty">Only the Owner can manage Admin access.</div>';return;}await admins();}catch(e){s.innerHTML=`<div class="ap-empty">${esc(e.message)}</div>`;}
    $('#ap-admin-search')?.addEventListener('submit',async e=>{e.preventDefault();try{const p=await rpc('nexa_find_admin_candidate',{p_game_id:$('#ap-admin-id').value});$('#ap-admin-result').innerHTML=p?`<article class="ap-permission-card"><b>${esc(p.name)}</b><small>Game ID ${esc(p.gameId)} · ${esc(p.alliance)} · ${esc(p.rank||'No rank')}</small><div class="ap-actions"><button class="btn" data-ap-assign-admin="${esc(p.gameId)}">Assign Admin</button></div></article>`:'<div class="ap-empty">Game ID not found.</div>';}catch(x){toast(x.message,true)}});
  }
  function applyTabVisibility(){
    const owner=myNexaRole==='owner',admin=myNexaRole==='admin';
    document.querySelectorAll('[data-admin-tab="alliances"]').forEach(x=>x.classList.remove('hidden'));
    document.querySelectorAll('[data-admin-tab="permissions"]').forEach(x=>x.classList.toggle('hidden',!owner));
    document.querySelectorAll('[data-admin-tab="library"]').forEach(x=>x.classList.toggle('hidden',!(owner||admin)));
    document.querySelectorAll('[data-admin-tab="system"]').forEach(x=>x.classList.toggle('hidden',!owner));
  }
  function openStaffPassports(){
    const modal=$('#admin-modal');modal?.classList.add('open','module-view');modal?.setAttribute('aria-hidden','false');
    $('#admin-module-chooser')?.classList.add('hidden');$('#svs-admin-content')?.classList.remove('hidden');$('#admin-context-tabs')?.classList.remove('hidden');
    document.querySelectorAll('.svs-context-tab').forEach(x=>x.classList.add('hidden'));
    document.querySelectorAll('.administration-context-tab').forEach(x=>x.classList.add('hidden'));
    const tab=$('[data-admin-tab="alliances"]');tab?.classList.remove('hidden');
    document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x===tab));
    ['admin-events','admin-forms','admin-roles','admin-permissions','admin-library','admin-system','admin-announcements'].forEach(id=>$('#'+id)?.classList.add('hidden'));
    $('#admin-alliances')?.classList.remove('hidden');
    const title=$('#nexa-module-title'),desc=$('#nexa-module-description'),head=$('#nexa-module-shell-head');head?.classList.remove('hidden');if(title)title.textContent='Alliance Passports';if(desc)desc.textContent='Manage your alliance members, ranks and operational access.';
    load();
  }
  async function exposeStaffAccess(){
    try{myNexaRole=await rpc('current_nexa_role')||'player';hasAllianceStaff=await rpc('nexa_has_alliance_staff_access');const b=$('#admin-panel-button');if(b&&hasAllianceStaff){b.classList.remove('hidden');if(!['owner','admin'].includes(myNexaRole))b.textContent='Operations';}applyTabVisibility();}catch(_){ }
  }
  async function admins(){const rows=await rpc('nexa_list_admins');$('#permissions-list').innerHTML=(rows||[]).map(x=>`<article class="ap-permission-card"><b>${esc(x.name||x.role)}</b><small>Game ID ${esc(x.gameId||'—')} · ${esc(x.alliance||'Unassigned')}</small><div class="ap-meta"><span class="ap-chip">${esc(String(x.role).toUpperCase())}</span></div>${x.role==='admin'?`<div class="ap-actions"><button class="btn ap-danger" data-ap-remove-admin="${x.userId}">Remove Admin</button></div>`:''}</article>`).join('')||'<div class="ap-empty">No admins.</div>';}

  document.addEventListener('click',async e=>{
    const t=e.target.closest('[data-ap-open],[data-ap-back],[data-ap-edit],[data-ap-toggle],[data-ap-delete],[data-ap-cancel-delete],[data-ap-player],[data-ap-view],[data-ap-close],[data-ap-assign-admin],[data-ap-remove-admin]');if(!t)return;
    if(t.matches('[data-ap-open]')){const a=alliances.find(x=>String(x.id??'unassigned')===t.dataset.apOpen);if(a)renderPassport(a);}
    else if(t.hasAttribute('data-ap-back'))renderGrid();
    else if(t.hasAttribute('data-ap-edit'))editAlliance(opened);
    else if(t.hasAttribute('data-ap-toggle')){try{await rpc('nexa_update_alliance_passport',{p_alliance_id:opened.id,p_name:opened.name,p_color:opened.color,p_server_rank:opened.serverRank,p_game_power:opened.gamePower,p_is_active:!opened.active});await reload(opened.id)}catch(x){alert(x.message)}}
    else if(t.hasAttribute('data-ap-delete')){if(!confirm(`⚠ Delete ${opened.tag}?\n\nThe alliance will deactivate now and be permanently deleted after 24 hours. Its members will move to Unassigned.`))return;if(prompt(`Type ${opened.tag} to schedule deletion:`)!==opened.tag)return;try{await rpc('nexa_request_alliance_deletion',{p_alliance_id:opened.id});await reload(opened.id)}catch(x){alert(x.message)}}
    else if(t.hasAttribute('data-ap-cancel-delete')){try{await rpc('nexa_cancel_alliance_deletion',{p_alliance_id:opened.id});await reload(opened.id)}catch(x){alert(x.message)}}
    else if(t.hasAttribute('data-ap-player')){const m=opened.members.find(x=>x.accountId===t.dataset.apPlayer);if(m)managePlayer(m,opened);}
    else if(t.hasAttribute('data-ap-view'))alert('Player Passport Support View will open here in the next Administration block.');
    else if(t.hasAttribute('data-ap-close'))t.closest('dialog')?.close();
    else if(t.dataset.apAssignAdmin){if(confirm(`Assign NEXA Admin to Game ID ${t.dataset.apAssignAdmin}?`)){try{await rpc('nexa_assign_admin_by_game_id',{p_game_id:t.dataset.apAssignAdmin});await admins();$('#ap-admin-result').innerHTML='';}catch(x){alert(x.message)}}}
    else if(t.dataset.apRemoveAdmin){if(confirm('Remove this Admin access?')){try{await rpc('nexa_remove_admin',{p_user_id:t.dataset.apRemoveAdmin});await admins()}catch(x){alert(x.message)}}}
  });

  function boot(){
    css();const tabs=[...document.querySelectorAll('[data-admin-tab]')];tabs.filter(x=>x.dataset.adminTab==='alliances').forEach(x=>x.textContent='Alliance Passports');tabs.filter(x=>x.dataset.adminTab==='roles').forEach(x=>x.remove());
    const alliancesTab=tabs.find(x=>x.dataset.adminTab==='alliances');alliancesTab?.addEventListener('click',()=>setTimeout(load,0));
    const permissionTab=tabs.find(x=>x.dataset.adminTab==='permissions');permissionTab?.addEventListener('click',()=>setTimeout(permissions,0));
    const openAdmin=$('#open-administration');openAdmin?.addEventListener('click',()=>setTimeout(()=>{applyTabVisibility();const active=$('[data-admin-tab].active');if(active?.dataset.adminTab==='alliances')load();},60));
    $('#admin-panel-button')?.addEventListener('click',e=>{if(hasAllianceStaff&&!['owner','admin'].includes(myNexaRole)){e.preventDefault();e.stopImmediatePropagation();openStaffPassports();}},true);
    exposeStaffAccess();setTimeout(exposeStaffAccess,800);setTimeout(exposeStaffAccess,2200);
    try{supabaseClient.auth.onAuthStateChange(()=>setTimeout(exposeStaffAccess,100));}catch(_){ }
    const url=new URL(location.href);if(url.searchParams.get('tab')==='alliances')setTimeout(load,300);if(url.searchParams.get('tab')==='permissions')setTimeout(permissions,300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
