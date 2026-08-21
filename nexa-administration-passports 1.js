/* NEXA Administration V24.2 — profile image safety hotfix
   Safe boot: no document-wide attribute/class MutationObserver loops.
   Scope: isolated Administration pages, Alliance Passports, Roles/NEXA Access,
   global navigation escape, close controls, testing framework, troop portrait framing. */
(()=>{
'use strict';
if(window.__NEXA_ADMIN_V242__) return;
window.__NEXA_ADMIN_V242__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'')
 .replace(/â€¢|â—|â¦/g,'•').replace(/â€”/g,'—').replace(/â€“/g,'–')
 .replace(/â†/g,'←').replace(/â†’/g,'→').replace(/Â/g,'').replace(/Ã—/g,'×');

const TABS=[
 {key:'alliances',letter:'A',label:'Alliances',id:'admin-alliances'},
 {key:'library',letter:'L',label:'Library',id:'admin-library'},
 {key:'access',letter:'N',label:'NEXA Access',id:'admin-permissions'},
 {key:'roles',letter:'R',label:'Roles',id:'admin-roles'},
 {key:'system',letter:'S',label:'System Operations',id:'admin-system'}
];
const OPS=[
 ['battle_strategist','Battle Strategist'],
 ['event_operator','Event Operator'],
 ['scheduler','Scheduler'],
 ['transfer_coordinator','Transfer Coordinator']
];
const MODULES=[
 ['svs','SvS'],['sbs','SBS'],['transfer','Transfer'],['team_builder','Team Builder'],
 ['forms','Forms'],['events','Events'],['library','Library'],['administration','Administration']
];

let current='alliances', nexaRole='player', callerAllianceRank='', allianceCache=[], opRoleRows=[];
let profileObserver=null, rootObserver=null;

let localSb=null;
function sb(){
 if(window.supabaseClient) return window.supabaseClient;
 if(window.sb && typeof window.sb.from==='function' && typeof window.sb.rpc==='function') return window.sb;
 if(!localSb && window.supabase?.createClient){
  localSb=window.supabase.createClient(
   'https://dfxcxboxrkfmrnsgpyin.supabase.co',
   'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
  );
 }
 return localSb;
}
async function rpc(name,args={}){
 const c=sb(); if(!c) throw new Error('Supabase is not ready.');
 const {data,error}=await c.rpc(name,args); if(error)throw error; return data;
}
function fmt(v){if(v==null||v==='')return'—';const n=Number(v);return Number.isFinite(n)?Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(n):clean(v)}
function addStyles(){
 if($('#nexa-v24-style'))return;
 const s=document.createElement('style');s.id='nexa-v24-style';s.textContent=`
 #admin-modal .admin-tabs,#admin-modal .admin-tabs-scroll,#admin-modal>[class*="tabs"]{display:none!important}
 .nexa-v24-hide{display:none!important}
 .nexa-v24-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin:0 0 16px;position:sticky;top:0;z-index:30;padding:8px 0;background:linear-gradient(180deg,rgba(6,9,26,.97),rgba(6,9,26,.82),transparent)}
 .nexa-v24-nav .prev{justify-self:start}.nexa-v24-nav .next{justify-self:end}
 .nexa-v24-jump{appearance:none;border:1px solid rgba(139,92,246,.58);background:#0b1028;color:#fff;border-radius:999px;padding:8px 12px;min-width:48px;font:inherit;font-weight:900}
 .nexa-v24-title{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:950;white-space:nowrap}
 .nexa-v24-info,.nexa-v24-close{appearance:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:18px;font-weight:950;cursor:pointer}
 .nexa-v24-info{border:1px solid rgba(75,211,255,.58);background:#081a35;color:#71dcff}
 .nexa-v24-close{position:sticky;top:12px;float:right;z-index:999;border:1px solid rgba(255,255,255,.2);background:#0b1028;color:#fff}
 .nexa-v24-card{border:1px solid rgba(139,92,246,.35);border-radius:20px;padding:14px;background:linear-gradient(145deg,rgba(18,23,53,.94),rgba(5,9,25,.96));margin:10px 0}
 .nexa-v24-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
 .nexa-v24-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
 .nexa-v24-btn{appearance:none;border:1px solid rgba(139,92,246,.46);background:#101632;color:#fff;border-radius:11px;padding:9px 11px;font-weight:850}
 .nexa-v24-danger{border-color:rgba(239,68,68,.7);color:#fecaca}
 .nexa-v24-muted{color:#9ca6c8;font-size:.86rem}
 .nexa-v24-empty{border:1px dashed rgba(255,255,255,.15);border-radius:16px;padding:20px;text-align:center;color:#9ca6c8}
 .nexa-v24-planets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
 .nexa-v24-planet{appearance:none;border:1px solid color-mix(in srgb,var(--pc,#8b5cf6) 60%,transparent);border-radius:22px;padding:14px 9px;background:radial-gradient(circle at 50% 25%,color-mix(in srgb,var(--pc,#8b5cf6) 23%,transparent),rgba(5,9,25,.94) 68%);color:#fff;text-align:center;min-width:0}
 .nexa-v24-orbit{width:90px;height:90px;border-radius:50%;margin:0 auto 8px;border:2px solid var(--pc,#8b5cf6);display:grid;place-items:center;overflow:hidden;background:#0b112a;box-shadow:0 0 22px color-mix(in srgb,var(--pc,#8b5cf6) 40%,transparent)}
 .nexa-v24-orbit img{width:82%;height:82%;object-fit:contain;border-radius:50%}
 .nexa-v24-tag{font-weight:950;font-size:1.1rem}.nexa-v24-chip{display:inline-flex;padding:4px 7px;border:1px solid rgba(255,255,255,.13);border-radius:999px;margin:4px 2px 0;font-size:.7rem;color:#bbc3df}
 .nexa-v24-passhead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
 .nexa-v24-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.nexa-v24-stat{border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:9px}.nexa-v24-stat small,.nexa-v24-stat b{display:block}
 .nexa-v24-rank{margin-top:15px}.nexa-v24-members{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 .nexa-v24-member{border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:9px;background:#081027;min-width:0}.nexa-v24-member b,.nexa-v24-member small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .nexa-v24-avatar{width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid #8664ff;display:grid;place-items:center;background:#111936;flex:0 0 auto}.nexa-v24-avatar img{width:100%;height:100%;object-fit:cover}
 .nexa-v24-search{width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:#0b1025;color:#fff;margin:0 0 10px}
 .nexa-v24-checks{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.nexa-v24-checks label{display:flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 8px;font-size:.72rem}.nexa-v24-checks input{width:auto!important}
 .nexa-v24-testing{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}.nexa-v24-testing>div{border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:12px;background:#081027}
 .nexa-v24-framework{display:inline-flex;border:1px solid rgba(99,220,255,.42);color:#70dcff;border-radius:999px;padding:3px 7px;font-size:.65rem;font-weight:900}
 #nexa-profile-modal .nexa-v24-close{position:absolute;right:14px;top:14px;float:none}
 @media(min-width:720px){.nexa-v24-planets{grid-template-columns:repeat(3,minmax(0,1fr))}}
 @media(max-width:430px){.nexa-v24-planets,.nexa-v24-members{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.nexa-v24-orbit{width:78px;height:78px}.nexa-v24-title{font-size:.92rem}}
 `;document.head.appendChild(s);
}
function section(key){return document.getElementById(TABS.find(t=>t.key===key)?.id||'')}
function adminOpen(){const m=$('#admin-modal');return!!(m&&(m.classList.contains('open')||m.getAttribute('aria-hidden')==='false'||!m.hidden))}
function navHTML(key){
 const i=TABS.findIndex(t=>t.key===key),t=TABS[i],p=TABS[i-1],n=TABS[i+1];
 return `<div class="nexa-v24-nav">${p?`<button class="nexa-v24-jump prev" data-v24-go="${p.key}" title="${p.label}">‹ ${p.letter}</button>`:'<span></span>'}<div class="nexa-v24-title"><span>${t.label}</span><button class="nexa-v24-info" data-v24-guide="${key}">ⓘ</button></div>${n?`<button class="nexa-v24-jump next" data-v24-go="${n.key}" title="${n.label}">${n.letter} ›</button>`:'<span></span>'}</div>`;
}
function ensureNav(el,key){let old=$('.nexa-v24-nav',el);if(old)old.remove();el.insertAdjacentHTML('afterbegin',navHTML(key))}
function legacyChildren(el,keepId){
 Array.from(el.children).forEach(ch=>{if(ch.classList.contains('nexa-v24-nav')||ch.id===keepId)return;ch.classList.add('nexa-v24-legacy')});
}
function hideLegacy(el,hide=true){$$(':scope>.nexa-v24-legacy',el).forEach(x=>x.classList.toggle('nexa-v24-hide',hide))}
function openAdministration(key='alliances'){
 const m=$('#admin-modal');if(m){m.hidden=false;m.classList.add('open');m.setAttribute('aria-hidden','false')}
 activate(key);setTimeout(maybeFirstGuide,80);
}
async function activate(key){
 if(!TABS.some(t=>t.key===key))key='alliances';current=key;
 TABS.forEach(t=>{const el=section(t.key);if(!el)return;const on=t.key===key;el.hidden=!on;el.classList.toggle('nexa-v24-hide',!on);el.setAttribute('aria-hidden',on?'false':'true');if(on)ensureNav(el,key)});
 if(key==='alliances')await renderAlliances();
 if(key==='roles')await renderRoles();
 if(key==='access')await renderAccess();
 if(key==='library')renderLibrary();
 if(key==='system')renderTesting();
}
function guide(key){
 const copy={
 alliances:'Alliance planets open an Alliance Passport. Manage alliance details, members, ranks, password resets and deletion scheduling from one place.',
 roles:'Alliance Rank and Operational Role are separate. Operational Roles describe NEXA work and never grant module access by themselves.',
 access:'NEXA Access controls exactly which NEXA modules a person may use. It is independent from Alliance Rank and Operational Roles.',
 library:'The verified master catalog. Heroes, Experts and Pets support Hidden, Scheduled and Unlocked generation visibility.',
 system:'Maintenance, recovery and protected testing controls. Permission Preview and Battle Sandbox are staged for a future activation.'
 }[key];alert(`${TABS.find(t=>t.key===key)?.label||'Administration'}\n\n${copy||''}`);
}
function maybeFirstGuide(){
 if(!adminOpen()||localStorage.getItem('nexa_admin_guide_v24'))return;
 localStorage.setItem('nexa_admin_guide_v24','seen');
 alert('Administration Quick Guide\n\nUse the arrows to move between Administration pages.\n\nA = Alliances\nL = Library\nN = NEXA Access\nR = Roles\nS = System Operations\n\nTap ⓘ on any page for its guide.');
}
async function getRole(){
 try{nexaRole=String(await rpc('current_nexa_role')||'player').toLowerCase()}catch{nexaRole='player'}
 try{
  const c=sb(),{data:{user}}=await c.auth.getUser();
  if(user){const {data}=await c.from('player_accounts').select('alliance_role').eq('user_id',user.id).eq('is_main',true).maybeSingle();callerAllianceRank=String(data?.alliance_role||'').toUpperCase()}
 }catch{callerAllianceRank=''}
 return nexaRole
}
function alliancePlanet(a){
 const c=a.color||'#8b5cf6',img=a.emblemUrl?`<img src="${esc(a.emblemUrl)}" alt="">`:`<b>${esc(a.tag||'?')}</b>`;
 return `<button class="nexa-v24-planet" style="--pc:${esc(c)}" data-v24-alliance="${esc(a.id)}"><span class="nexa-v24-orbit">${img}</span><span class="nexa-v24-tag">${esc(a.tag||'Alliance')}</span><span class="nexa-v24-chip">${a.active===false?'INACTIVE':'ACTIVE'}</span><span class="nexa-v24-chip">${Number(a.registeredMembers||0)} MEMBERS</span></button>`;
}
async function renderAlliances(force=false){
 const el=section('alliances');if(!el)return;
 let body=$('#nexa-v24-alliances',el);
 if(!body){body=document.createElement('div');body.id='nexa-v24-alliances';el.appendChild(body);legacyChildren(el,body.id)}
 hideLegacy(el,true);
 body.innerHTML='<div class="nexa-v24-empty">Loading alliances…</div>';
 try{
  if(force||!allianceCache.length)allianceCache=await rpc('nexa_list_alliance_passports')||[];
  body.innerHTML=`<div class="nexa-v24-row"><button class="nexa-v24-btn" data-v24-manage>Manage Alliances</button><button class="nexa-v24-btn" data-v24-refresh>Refresh</button></div><div class="nexa-v24-planets">${allianceCache.map(alliancePlanet).join('')||'<div class="nexa-v24-empty">No alliances found.</div>'}</div>`;
 }catch(e){body.innerHTML=`<div class="nexa-v24-empty">${esc(e.message)}</div>`}
}
function ranks(a,rank){const ms=(a.members||[]).filter(m=>rank==='R3–R1'?['R3','R2','R1'].includes(String(m.rank||'').toUpperCase()):String(m.rank||'').toUpperCase()===rank);return ms}
function memberCard(m,a){
 const ava=m.photo?`<img src="${esc(m.photo)}" alt="">`:esc((m.name||'?').slice(0,2).toUpperCase());
 return `<div class="nexa-v24-member"><div class="nexa-v24-row"><span class="nexa-v24-avatar">${ava}</span><span style="min-width:0"><b>${esc(clean(m.name))}</b><small class="nexa-v24-muted">ID ${esc(m.gameId||'—')} · ${esc(m.rank||'')}</small></span></div><div class="nexa-v24-actions"><button class="nexa-v24-btn" data-v24-person="${esc(m.accountId)}" data-aid="${esc(a.id)}">Passport</button>${a.canAssignRanks?`<button class="nexa-v24-btn" data-v24-rank="${esc(m.accountId)}" data-aid="${esc(a.id)}">Rank</button>`:''}${(nexaRole==='owner'||nexaRole==='admin'||callerAllianceRank==='R5')?`<button class="nexa-v24-btn" data-v24-reset="${esc(m.accountId)}" data-aid="${esc(a.id)}">Reset PW</button>`:''}</div></div>`;
}
function alliancePassport(a){
 const del=a.scheduledDeleteAt?new Date(a.scheduledDeleteAt).toLocaleString():'—';
 return `<div class="nexa-v24-card"><div class="nexa-v24-passhead"><div><button class="nexa-v24-btn" data-v24-back-alliance>← Alliances</button><h3>${esc(a.tag)} · ${esc(clean(a.name||''))}</h3><div class="nexa-v24-muted">${a.active===false?'Inactive':'Active'}${a.deletionStatus&&a.deletionStatus!=='active'?' · '+esc(a.deletionStatus):''}</div></div></div><div class="nexa-v24-stats"><div class="nexa-v24-stat"><small>Alliance Password</small><b>${esc(a.password||'—')}</b></div><div class="nexa-v24-stat"><small>Registered Members</small><b>${esc(a.registeredMembers||0)}</b></div><div class="nexa-v24-stat"><small>Power</small><b>${fmt(a.registeredPower||a.gamePower)}</b></div><div class="nexa-v24-stat"><small>Scheduled Delete</small><b>${esc(del)}</b></div></div>${a.canDelete?`<div class="nexa-v24-actions"><button class="nexa-v24-btn nexa-v24-danger" data-v24-delete-alliance="${esc(a.id)}">Schedule Delete</button>${a.scheduledDeleteAt?`<button class="nexa-v24-btn" data-v24-cancel-delete="${esc(a.id)}">Cancel Delete</button>`:''}</div>`:''}${['R5','R4','R3–R1'].map(r=>`<div class="nexa-v24-rank"><h4>${r}</h4><div class="nexa-v24-members">${ranks(a,r).map(m=>memberCard(m,a)).join('')||'<div class="nexa-v24-empty">No members</div>'}</div></div>`).join('')}</div>`;
}
function findMember(aid,accountId){const a=allianceCache.find(x=>String(x.id)===String(aid));return[a,(a?.members||[]).find(x=>String(x.accountId)===String(accountId))]}
function personPassport(a,m){
 const accounts=m?.accounts||[];
 const body=section('alliances')?.querySelector('#nexa-v24-alliances');if(!body||!m)return;
 body.innerHTML=`<div class="nexa-v24-card"><button class="nexa-v24-btn" data-v24-open-alliance="${esc(a.id)}">← ${esc(a.tag)}</button><h3>${esc(clean(m.name))}</h3><p class="nexa-v24-muted">Choose an account Passport.</p>${accounts.map(x=>`<button class="nexa-v24-card" style="width:100%;color:inherit;text-align:left" data-v24-account="${esc(x.id)}"><b>${esc(clean(x.name))}${x.isMain?' · MAIN':''}</b><small class="nexa-v24-muted" style="display:block">ID ${esc(x.gameId||'—')} · ${esc(x.furnace||'—')} · ${fmt(x.power)}</small></button>`).join('')||'<div class="nexa-v24-empty">No linked accounts.</div>'}</div>`;
}
async function setRank(a,m){
 const allowed=nexaRole==='owner'||nexaRole==='admin'?['R5','R4','R3','R2','R1']:callerAllianceRank==='R5'?['R4','R3','R2','R1']:callerAllianceRank==='R4'?['R3','R2','R1']:[];
 const v=prompt(`New Alliance Rank for ${clean(m.name)}\nAllowed: ${allowed.join(', ')}`,m.rank||'R3');if(!v)return;
 const rank=v.toUpperCase();if(!allowed.includes(rank)){alert('That rank is not allowed for your role.');return}
 try{await rpc('nexa_set_alliance_rank',{p_account_id:m.accountId,p_new_rank:rank});await renderAlliances(true);const fresh=allianceCache.find(x=>String(x.id)===String(a.id));section('alliances').querySelector('#nexa-v24-alliances').innerHTML=alliancePassport(fresh)}catch(e){alert(e.message)}
}
async function resetPW(m){
 const pw=prompt(`Temporary NEXA password for ${clean(m.name)}\nMinimum 8 characters.`);if(!pw)return;if(pw.length<8){alert('Use at least 8 characters.');return}
 try{const {data:{session}}=await sb().auth.getSession();const r=await fetch('/api/nexa-admin-reset-password',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session?.access_token||''}`},body:JSON.stringify({account_id:m.accountId,password:pw})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Reset failed');alert('Password reset complete.')}catch(e){alert(e.message)}
}
async function renderRoles(){
 const el=section('roles');if(!el)return;let body=$('#nexa-v24-roles',el);
 if(!body){body=document.createElement('div');body.id='nexa-v24-roles';el.appendChild(body);legacyChildren(el,body.id)}hideLegacy(el,true);
 body.innerHTML='<div class="nexa-v24-empty">Loading roles…</div>';
 try{
  if(!allianceCache.length)allianceCache=await rpc('nexa_list_alliance_passports')||[];
  if(['owner','admin'].includes(nexaRole)){try{opRoleRows=await rpc('nexa_list_operational_roles')||[]}catch{opRoleRows=[]}}
  const opSet=new Set(opRoleRows.map(x=>`${x.userId}:${x.role}`));
  body.innerHTML=`<div class="nexa-v24-card"><b>Role Model</b><div class="nexa-v24-muted">Alliance Rank ≠ Operational Role ≠ NEXA Access. Operational Roles can be combined and do not unlock modules automatically.</div></div>`+allianceCache.map(a=>`<section class="nexa-v24-card"><h3>${esc(a.tag)} · ${esc(clean(a.name||''))}</h3>${['R5','R4','R3–R1'].map(r=>`<div class="nexa-v24-rank"><h4>${r}</h4>${ranks(a,r).map(m=>`<div class="nexa-v24-member" style="margin-bottom:8px"><b>${esc(clean(m.name))}</b><small class="nexa-v24-muted">ID ${esc(m.gameId||'—')} · ${esc(m.rank||'')}</small>${['owner','admin'].includes(nexaRole)?`<div class="nexa-v24-checks">${OPS.map(([k,n])=>`<label><input type="checkbox" data-v24-op-user="${esc(m.userId)}" data-v24-op="${k}" ${opSet.has(`${m.userId}:${k}`)?'checked':''}> ${n}</label>`).join('')}</div>`:''}</div>`).join('')||'<div class="nexa-v24-empty">No members</div>'}</div>`).join('')}</section>`).join('')||'<div class="nexa-v24-empty">No alliance members found.</div>';
 }catch(e){body.innerHTML=`<div class="nexa-v24-empty">${esc(e.message)}</div>`}
}
async function renderAccess(){
 const el=section('access');if(!el)return;let body=$('#nexa-v24-access',el);
 if(!body){body=document.createElement('div');body.id='nexa-v24-access';el.appendChild(body);legacyChildren(el,body.id)}hideLegacy(el,true);
 body.innerHTML='<div class="nexa-v24-empty">Loading NEXA Access…</div>';
 if(!['owner','admin'].includes(nexaRole)){body.innerHTML='<div class="nexa-v24-empty">Owner or Admin access required.</div>';return}
 try{
  const rows=await rpc('nexa_list_module_access')||[];
  body.innerHTML=`<input class="nexa-v24-search" id="nexa-v24-access-search" placeholder="Search player or Game ID"><div class="nexa-v24-muted" style="margin-bottom:8px">Showing assigned NEXA Access. Search to find any player.</div><div id="nexa-v24-access-list">${rows.map(p=>{const assigned=MODULES.some(([k])=>p[k==='team_builder'?'teamBuilder':k]);return`<article class="nexa-v24-card" data-v24-access-card data-v24-assigned="${assigned?'1':'0'}" style="${assigned?'':'display:none'}"><b>${esc(clean(p.name||'Player'))}</b><small class="nexa-v24-muted" style="display:block">ID ${esc(p.gameId||'—')} · ${esc(clean(p.allianceRole||'R3'))}</small><div class="nexa-v24-checks">${MODULES.map(([k,n])=>{const prop=k==='team_builder'?'teamBuilder':k;return`<label><input type="checkbox" data-v24-access-user="${esc(p.userId)}" data-v24-access-module="${k}" ${p[prop]?'checked':''}> ${n}</label>`}).join('')}</div><div class="nexa-v24-actions"><button class="nexa-v24-btn nexa-v24-danger" data-v24-remove-access="${esc(p.userId)}">Remove from NEXA Access</button></div></article>`}).join('')||'<div class="nexa-v24-empty">No players found.</div>'}</div>`;
 }catch(e){body.innerHTML=`<div class="nexa-v24-empty">${esc(e.message)}</div>`}
}
function renderLibrary(){
 const el=section('library');if(!el)return;let body=$('#nexa-v24-library',el);
 if(!body){body=document.createElement('div');body.id='nexa-v24-library';el.appendChild(body);legacyChildren(el,body.id)}hideLegacy(el,true);
 body.innerHTML=`<div class="nexa-v24-card"><h3>Library Catalog</h3><p class="nexa-v24-muted">Heroes · Experts · Pets · Troops · Chief Gear · Charms</p><p>Open the full catalog. Administration navigation remains available there.</p><button class="nexa-v24-btn" data-v24-open-library>Open Library</button></div>`;
}
function renderTesting(){
 const el=section('system');if(!el)return;hideLegacy(el,false);
 let host=$('#nexa-v24-testing',el);if(host)return;
 host=document.createElement('section');host.id='nexa-v24-testing';host.className='nexa-v24-card';host.innerHTML=`<div class="nexa-v24-row"><h3 style="margin:0">Testing</h3><span class="nexa-v24-framework">FRAMEWORK READY</span></div><p class="nexa-v24-muted">Visible foundation only. It does not impersonate users or alter production data yet.</p><div class="nexa-v24-testing"><div><b>Test Mode</b><select id="nexa-v24-test-mode" style="width:100%;margin-top:8px"><option value="off">Test Mode Off</option><option value="manual">Test Mode</option><option value="auto">Test Mode Auto</option></select></div><div><b>Permission Preview</b><p class="nexa-v24-muted">Owner · Admin · R5 · R4 · R3–R1 + selected NEXA Access.</p><button class="nexa-v24-btn" data-v24-coming>Start Preview</button></div><div><b>Battle Sandbox</b><p class="nexa-v24-muted">Teams, rally capacity, Forms/Team Sheet and future battle intelligence.</p><button class="nexa-v24-btn" data-v24-coming>Open Sandbox</button></div></div>`;
 el.appendChild(host);
}
function closeLayer(el){
 if(!el)return;el.classList.remove('open','active','show','visible');el.setAttribute('aria-hidden','true');
}
function ensureCloseControls(){
 const pm=$('#nexa-profile-modal');
 if(pm&&!$('#nexa-v24-profile-close',pm)){
  const b=document.createElement('button');b.id='nexa-v24-profile-close';b.className='nexa-v24-close';b.textContent='×';b.title='Close My Profile';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();closeLayer(pm)};pm.prepend(b)
 }
 const sys=$('#nexa-constellation-system');
 if(sys){
  let box=sys;
  while(box.parentElement && box.parentElement!==document.body){
   const p=box.parentElement,cs=getComputedStyle(p);box=p;
   if((cs.position==='fixed'||cs.position==='absolute')&&box.offsetWidth>260&&box.offsetHeight>320)break;
  }
  if(!$('#nexa-v24-constellation-close',box)){
   const b=document.createElement('button');b.id='nexa-v24-constellation-close';b.className='nexa-v24-close';
   b.style.cssText='position:absolute;right:18px;top:18px;float:none;z-index:2147483600';
   b.textContent='×';b.title='Close Account Constellation';
   b.onclick=e=>{e.preventDefault();e.stopPropagation();location.href='index.html'};
   if(getComputedStyle(box).position==='static')box.style.position='relative';
   box.prepend(b)
  }
 }
}
// IMPORTANT: Administration must never rewrite My Profile item image src values.
function watchProfile(){
 const pm=$('#nexa-profile-modal');if(!pm||profileObserver)return;
 profileObserver=new MutationObserver(()=>{requestAnimationFrame(ensureCloseControls)});
 profileObserver.observe(pm,{childList:true,subtree:true});
 ensureCloseControls();
}
function preNavigate(e){
 const control=e.target.closest?.('button,a,[role="button"]');if(!control)return;
 const txt=clean(control.textContent||'').trim();
 const moduleHit=/^(Administration|SBS|SvS|Team Builder|Transfers?|Transfer|Library|Home|Events?|Forms?)$/i.test(txt);
 if(!moduleHit)return;
 // Escape any large overlay before the existing NEXA navigation handler runs.
 ['#nexa-profile-modal','#admin-modal'].forEach(s=>{const el=$(s);if(el&&!/Administration/i.test(txt))closeLayer(el)});
 $$('[aria-modal="true"],.modal.open,.overlay.open,.screen.active').forEach(el=>{if(el!==$('#admin-modal')&&el!==$('#nexa-profile-modal'))closeLayer(el)});
 const constellation=$('#nexa-constellation-system');
 if(constellation&&/^(Administration|SBS|SvS|Team Builder|Transfers?|Transfer|Library|Events?|Forms?)$/i.test(txt)){
  const routes={'team builder':'team-builder.html','transfer':'transfer-admin.html','transfers':'transfer-admin.html','library':'library.html?admin=1'};
  const k=txt.toLowerCase();
  if(/^Administration$/i.test(txt)){e.preventDefault();setTimeout(()=>openAdministration(current),0);return}
  if(routes[k]){e.preventDefault();location.href=routes[k];return}
 }
 if(/^Administration$/i.test(txt))setTimeout(()=>openAdministration(current),30);
}
function bind(){
 addStyles();getRole().then(()=>{});
 document.addEventListener('click',preNavigate,true);
 document.addEventListener('click',async e=>{
  const go=e.target.closest?.('[data-v24-go]');if(go){e.preventDefault();await activate(go.dataset.v24Go);return}
  const g=e.target.closest?.('[data-v24-guide]');if(g){e.preventDefault();guide(g.dataset.v24Guide);return}
  if(e.target.closest?.('[data-v24-manage]')){const el=section('alliances');hideLegacy(el,false);$('#nexa-v24-alliances',el)?.classList.add('nexa-v24-hide');return}
  if(e.target.closest?.('[data-v24-refresh]')){await renderAlliances(true);return}
  const ap=e.target.closest?.('[data-v24-alliance]');if(ap){const a=allianceCache.find(x=>String(x.id)===String(ap.dataset.v24Alliance));if(a)$('#nexa-v24-alliances').innerHTML=alliancePassport(a);return}
  if(e.target.closest?.('[data-v24-back-alliance]')){await renderAlliances();return}
  const oa=e.target.closest?.('[data-v24-open-alliance]');if(oa){const a=allianceCache.find(x=>String(x.id)===String(oa.dataset.v24OpenAlliance));if(a)$('#nexa-v24-alliances').innerHTML=alliancePassport(a);return}
  const pp=e.target.closest?.('[data-v24-person]');if(pp){const [a,m]=findMember(pp.dataset.aid,pp.dataset.v24Person);personPassport(a,m);return}
  const acct=e.target.closest?.('[data-v24-account]');if(acct){if(typeof window.openAccountPassport==='function')window.openAccountPassport(acct.dataset.v24Account);else alert('Account Passport is available from My Profile.');return}
  const rr=e.target.closest?.('[data-v24-rank]');if(rr){const[a,m]=findMember(rr.dataset.aid,rr.dataset.v24Rank);if(a&&m)await setRank(a,m);return}
  const rp=e.target.closest?.('[data-v24-reset]');if(rp){const[a,m]=findMember(rp.dataset.aid,rp.dataset.v24Reset);if(m)await resetPW(m);return}
  const del=e.target.closest?.('[data-v24-delete-alliance]');if(del){const mins=Number(prompt('Delete countdown in minutes (1440 = 24 hours):','1440'));if(!mins)return;if(confirm('Schedule this alliance for deletion?')){try{await rpc('nexa_request_alliance_deletion',{p_alliance_id:Number(del.dataset.v24DeleteAlliance),p_delay_minutes:mins});await renderAlliances(true)}catch(x){alert(x.message)}}return}
  const cd=e.target.closest?.('[data-v24-cancel-delete]');if(cd){try{await rpc('nexa_cancel_alliance_deletion',{p_alliance_id:Number(cd.dataset.v24CancelDelete)});await renderAlliances(true)}catch(x){alert(x.message)}return}
  const op=e.target.closest?.('[data-v24-op-user]');if(op){op.disabled=true;try{await rpc('nexa_set_operational_role',{p_user_id:op.dataset.v24OpUser,p_role:op.dataset.v24Op,p_enabled:op.checked})}catch(x){op.checked=!op.checked;alert(x.message)}finally{op.disabled=false}return}
  const acc=e.target.closest?.('[data-v24-access-user]');if(acc){acc.disabled=true;try{await rpc('nexa_set_module_access',{p_user_id:acc.dataset.v24AccessUser,p_module:acc.dataset.v24AccessModule,p_enabled:acc.checked})}catch(x){acc.checked=!acc.checked;alert(x.message)}finally{acc.disabled=false}return}
  const rem=e.target.closest?.('[data-v24-remove-access]');if(rem){if(confirm('Remove this member’s NEXA Access and Operational Roles? The player account itself will NOT be deleted.')){try{await rpc('nexa_remove_staff_access',{p_user_id:rem.dataset.v24RemoveAccess});await renderAccess()}catch(x){alert(x.message)}}return}
  if(e.target.closest?.('[data-v24-open-library]')){location.href='library.html?admin=1';return}
  if(e.target.closest?.('[data-v24-coming]')){alert('Framework ready. This feature is intentionally not active yet.');return}
  const tab=e.target.closest?.('.admin-tab,[data-admin-tab],.admin-tabs-scroll button');if(tab){const raw=clean(tab.dataset.adminTab||tab.textContent).trim().toLowerCase();const map={alliances:'alliances',roles:'roles',permissions:'access','module access':'access','nexa access':'access',library:'library','system operations':'system',system:'system'};if(map[raw]){e.preventDefault();e.stopImmediatePropagation();await activate(map[raw]);return}}
  const mode=e.target.closest?.('#nexa-v24-test-mode');if(mode&&mode.value!=='off'){alert('Testing framework is ready, but activation is intentionally disabled for now.');mode.value='off'}
 },true);
 document.addEventListener('input',e=>{if(e.target.id==='nexa-v24-access-search'){const q=e.target.value.toLowerCase().trim();$$('[data-v24-access-card]').forEach(c=>{const match=clean(c.innerText).toLowerCase().includes(q);c.style.display=q?(match?'':''):(c.dataset.v24Assigned==='1'?'':'none')})}});
 watchProfile();ensureCloseControls();
 // Child-additions only; never observes class/style/attributes.
 rootObserver=new MutationObserver(muts=>{let needs=false;for(const m of muts){if(m.addedNodes.length){needs=true;break}}if(needs)requestAnimationFrame(()=>{ensureCloseControls();watchProfile()})});
 rootObserver.observe(document.documentElement,{childList:true,subtree:true});
 const q=new URLSearchParams(location.search),k=q.get('adminTab');
 if(k)setTimeout(()=>openAdministration(k),100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();