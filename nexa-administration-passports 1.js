/* NEXA Administration V25 — stable isolated Administration workspace
   No Profile image rewriting. No global attribute MutationObserver.
   A -> L -> N -> R -> S alphabetical navigation.
*/
(()=>{
'use strict';
if(window.__NEXA_ADMIN_V25__) return;
window.__NEXA_ADMIN_V25__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=v=>String(v??'')
 .replace(/â€¢|Ã¢ÂÂ¢|â¦|Ã¢ÂÂ¦/g,'•')
 .replace(/â€”|Ã¢ÂÂ/g,'—').replace(/â€“|Ã¢ÂÂ/g,'–')
 .replace(/â†|Ã¢ÂÂ/g,'←').replace(/â†’|Ã¢ÂÂ/g,'→')
 .replace(/Ã—|Ã/g,'×').replace(/Â/g,'');

const TABS=[
 {key:'alliances',letter:'A',label:'Alliances',id:'admin-alliances'},
 {key:'library',letter:'L',label:'Library',href:'library.html?admin=1'},
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
const PALETTE=['#ff4fc8','#7b61ff','#3cc8ff','#48e3b3','#ff9a4d','#d76cff','#58a6ff','#ff667f'];

let localSb=null,current='alliances',activationSeq=0,nexaRole='player',callerRank='';
function sb(){
 if(window.supabaseClient?.from) return window.supabaseClient;
 if(window.sb?.from) return window.sb;
 if(!localSb && window.supabase?.createClient){
   localSb=window.supabase.createClient(
    'https://dfxcxboxrkfmrnsgpyin.supabase.co',
    'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
   );
 }
 return localSb;
}
async function rpc(name,args={}){
 const c=sb(); if(!c) throw new Error('NEXA could not connect to Supabase.');
 const {data,error}=await c.rpc(name,args); if(error) throw error; return data;
}
function colorFor(tag,i=0){
 let h=0; for(const ch of String(tag||'')) h=(h*31+ch.charCodeAt(0))>>>0;
 return PALETTE[(h+i)%PALETTE.length];
}
function fmt(n){
 const x=Number(n||0); if(!x)return'—';
 return Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(x);
}

function addStyle(){
 if($('#nexa-v25-admin-style'))return;
 const st=document.createElement('style');st.id='nexa-v25-admin-style';st.textContent=`
 #admin-modal.nexa-v25-admin #nexa-module-shell-head,
 #admin-modal.nexa-v25-admin #admin-context-tabs{display:none!important}
 #admin-modal.nexa-v25-admin #svs-admin-content{display:block!important}
 #admin-modal.nexa-v25-admin #admin-module-chooser{display:none!important}
 #admin-modal.nexa-v25-admin .admin-section{display:none!important}
 #admin-modal.nexa-v25-admin .admin-section.nexa-v25-active{display:block!important}
 .nexa-v25-nav{position:sticky;top:0;z-index:60;display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:9px 0 13px;background:linear-gradient(180deg,rgba(4,7,22,.98) 0%,rgba(4,7,22,.91) 74%,transparent)}
 .nexa-v25-nav .left{justify-self:start}.nexa-v25-nav .right{justify-self:end}
 .nexa-v25-arrow{border:1px solid rgba(142,96,255,.58);background:linear-gradient(145deg,rgba(28,22,67,.94),rgba(8,15,39,.96));color:#f8f4ff;border-radius:999px;min-width:50px;padding:9px 12px;font-weight:950;box-shadow:0 0 18px rgba(112,67,255,.12)}
 .nexa-v25-title{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:950;white-space:nowrap}
 .nexa-v25-help{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(83,208,255,.55);background:#081a35;color:#75ddff;font-weight:950}
 .nexa-v25-help.general{border-color:rgba(204,92,255,.48);color:#ef9dff;background:#1a0c2d}
 .nexa-v25-host{min-height:220px}
 .nexa-v25-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:5px 0 14px}
 .nexa-v25-add{width:42px;height:42px;border-radius:50%;font-size:25px;line-height:1;border:1px solid rgba(91,208,255,.56);color:#7ee3ff;background:#09152f;box-shadow:0 0 18px rgba(55,190,255,.14)}
 .nexa-v25-refresh{border:1px solid rgba(139,96,255,.38);background:#0d1330;color:#cbd5ff;border-radius:12px;padding:9px 11px;font-weight:850}
 .nexa-v25-planets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .nexa-v25-alliance{--pc:#7b61ff;position:relative;border:1px solid color-mix(in srgb,var(--pc) 56%,transparent);border-radius:24px;background:radial-gradient(circle at 50% 25%,color-mix(in srgb,var(--pc) 18%,transparent),rgba(5,8,23,.96) 66%);padding:14px 9px 13px;color:#fff;text-align:center;overflow:hidden;box-shadow:0 0 25px color-mix(in srgb,var(--pc) 10%,transparent)}
 .nexa-v25-orbit{position:relative;width:92px;height:92px;margin:3px auto 10px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--pc);box-shadow:0 0 22px color-mix(in srgb,var(--pc) 42%,transparent),inset 0 0 22px color-mix(in srgb,var(--pc) 14%,transparent)}
 .nexa-v25-orbit::before{content:"";position:absolute;inset:-8px;border-radius:50%;border:1px dashed color-mix(in srgb,var(--pc) 42%,transparent);animation:nexaV25Orbit 12s linear infinite}
 .nexa-v25-orbit::after{content:"";position:absolute;width:6px;height:6px;border-radius:50%;right:-3px;top:22%;background:var(--pc);box-shadow:0 0 11px var(--pc)}
 @keyframes nexaV25Orbit{to{transform:rotate(360deg)}}
 .nexa-v25-emblem{width:70px;height:70px;border-radius:50%;object-fit:contain}.nexa-v25-letter{font-size:19px;font-weight:950}
 .nexa-v25-tag{display:block;font-size:1.08rem;font-weight:950}.nexa-v25-chips{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin-top:6px}
 .nexa-v25-chip{border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 7px;color:#bfc6df;font-size:.64rem;font-weight:850}
 .nexa-v25-card-actions{position:absolute;top:8px;right:8px;display:flex;gap:5px;z-index:4}
 .nexa-v25-icon{width:29px;height:29px;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(6,10,27,.83);color:#dbe2ff;font-weight:950}
 .nexa-v25-icon.danger{color:#ff9fb9;border-color:rgba(255,101,141,.38)}.nexa-v25-icon.off{color:#ffd38a}
 .nexa-v25-empty{border:1px dashed rgba(128,143,205,.22);border-radius:18px;padding:25px;text-align:center;color:#8994b6}
 .nexa-v25-panel{border:1px solid rgba(133,93,255,.28);border-radius:20px;padding:14px;background:linear-gradient(145deg,rgba(14,19,46,.86),rgba(5,9,24,.93));margin-bottom:11px}
 .nexa-v25-panel h3,.nexa-v25-panel h4{margin:0 0 5px}.nexa-v25-muted{color:#909abc;font-size:.82rem;line-height:1.42}
 .nexa-v25-members{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
 .nexa-v25-member{border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:9px;background:#081027;min-width:0}
 .nexa-v25-member b,.nexa-v25-member small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nexa-v25-member small{color:#8995b6}
 .nexa-v25-avatar{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #8c6cff;float:left;margin-right:8px}
 .nexa-v25-buttons{display:flex;gap:6px;flex-wrap:wrap;clear:both;padding-top:8px}
 .nexa-v25-btn{border:1px solid rgba(131,99,255,.36);border-radius:10px;padding:8px 10px;background:#101632;color:#fff;font-weight:800}.nexa-v25-btn.danger{color:#ffb4c8;border-color:rgba(255,90,132,.4)}
 .nexa-v25-search{width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid rgba(128,143,205,.22);border-radius:13px;background:#0a1026;color:#fff;margin-bottom:10px;font-size:16px}
 .nexa-v25-checks{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.nexa-v25-checks label{display:flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.11);border-radius:999px;padding:6px 8px;font-size:.69rem}.nexa-v25-checks input{width:auto!important}
 .nexa-v25-dialog{position:fixed;inset:0;z-index:2147483645;display:grid;place-items:center;padding:18px;background:rgba(0,2,13,.78);backdrop-filter:blur(9px)}
 .nexa-v25-dialog-card{position:relative;width:min(520px,100%);max-height:82dvh;overflow:auto;padding:20px;border-radius:24px;background:linear-gradient(155deg,#101631,#050819);color:#fff;box-shadow:0 28px 80px rgba(0,0,0,.58),0 0 35px rgba(91,72,255,.18)}
 .nexa-v25-dialog-card::before{content:"";position:absolute;inset:-1px;border-radius:24px;padding:1px;background:conic-gradient(from 0deg,#6c5cff,#35caff,#ff59cf,#6c5cff);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:nexaV25Border 6s linear infinite;pointer-events:none}
 @keyframes nexaV25Border{to{transform:rotate(360deg)}}.nexa-v25-dialog-card h3{margin:0 0 10px;font-size:1.35rem}.nexa-v25-dialog-card p{color:#b5bdd8;line-height:1.5}
 .nexa-v25-dialog-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:17px}
 .nexa-v25-field{display:grid;gap:5px;margin-top:10px;color:#cbd3ec;font-size:.8rem}.nexa-v25-field input{width:100%;box-sizing:border-box;padding:11px;border-radius:11px;border:1px solid rgba(255,255,255,.16);background:#090f24;color:#fff;font-size:16px}
 .nexa-v25-testgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:12px}.nexa-v25-testgrid>div{border:1px solid rgba(255,255,255,.1);border-radius:15px;padding:12px;background:#081027}
 @media(min-width:760px){.nexa-v25-planets{grid-template-columns:repeat(3,minmax(0,1fr))}}
 @media(max-width:430px){.nexa-v25-planets,.nexa-v25-members{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.nexa-v25-orbit{width:78px;height:78px}.nexa-v25-title{font-size:.9rem}}
 `;
 document.head.appendChild(st);
}

function modal(title,body,buttons=[['Close','close']]){
 return new Promise(resolve=>{
  const ov=document.createElement('div');ov.className='nexa-v25-dialog';
  ov.innerHTML=`<div class="nexa-v25-dialog-card" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><div>${body}</div><div class="nexa-v25-dialog-actions">${buttons.map(([label,val,cls])=>`<button type="button" class="nexa-v25-btn ${cls||''}" data-v25-result="${esc(val)}">${esc(label)}</button>`).join('')}</div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{
   const b=e.target.closest('[data-v25-result]'); if(!b)return;
   const fields={};
   ov.querySelectorAll('input,select,textarea').forEach(el=>{if(el.id)fields[el.id]=el.value});
   const result={action:b.dataset.v25Result,fields};
   ov.remove();resolve(result);
  });
 });
}
function notice(title,text){return modal(title,`<p>${esc(clean(text))}</p>`)}
async function confirmV(title,text){
 const r=await modal(title,`<p>${esc(text)}</p>`,[['Cancel','no'],['Confirm','yes','danger']]);
 return r.action==='yes';
}
async function generalGuide(){
 await modal('Administration Quick Guide',`
 <p>Use the letters and arrows to move through Administration.</p>
 <p><b>A</b> = Alliances<br><b>L</b> = Library<br><b>N</b> = NEXA Access<br><b>R</b> = Roles<br><b>S</b> = System Operations</p>
 <p>HOME exits Administration. The <b>ⓘ</b> beside each page explains that section.</p>`);
}
async function sectionGuide(key){
 const copy={
 alliances:'Alliance planets open an Alliance Passport. Use + to add an alliance. The power icon activates/deactivates it and × schedules deletion safely.',
 library:'Library is the verified master catalog for Heroes, Experts, Pets, Troops, Chief Gear and Charms.',
 access:'NEXA Access controls exactly which tools a person can open. It is separate from Alliance Rank and Operational Role.',
 roles:'Alliance Rank is separate from Operational Role. Battle Strategist, Event Operator, Scheduler and Transfer Coordinator can be combined and do not automatically grant module access.',
 system:'Owner-only Maintenance, Recovery and protected Testing controls live here.'
 };
 await notice(TABS.find(x=>x.key===key)?.label||'Administration',copy[key]||'');
}

function navHTML(key){
 const i=TABS.findIndex(x=>x.key===key),t=TABS[i],p=TABS[i-1],n=TABS[i+1];
 const btn=x=>x?.href
  ? `<button type="button" class="nexa-v25-arrow" data-v25-href="${esc(x.href)}">${x.letter}${x===p?' ←':' →'}</button>`
  : x ? `<button type="button" class="nexa-v25-arrow" data-v25-go="${x.key}">${x===p?'← ':''}${x.letter}${x===n?' →':''}</button>`:'<span></span>';
 return `<nav class="nexa-v25-nav">${p?`<span class="left">${btn(p)}</span>`:'<span></span>'}<div class="nexa-v25-title"><button class="nexa-v25-help general" data-v25-general>?</button><span>${t.label}</span><button class="nexa-v25-help" data-v25-guide="${key}">ⓘ</button></div>${n?`<span class="right">${btn(n)}</span>`:'<span></span>'}</nav>`;
}
function section(key){return $(TABS.find(x=>x.key===key)?.id?`#${TABS.find(x=>x.key===key).id}`:'')}
function ensureHost(key){
 const el=section(key);if(!el)return null;
 let nav=$(':scope>.nexa-v25-nav',el);if(nav)nav.remove();
 el.insertAdjacentHTML('afterbegin',navHTML(key));
 let host=$(':scope>.nexa-v25-host',el);
 if(!host){host=document.createElement('div');host.className='nexa-v25-host';el.appendChild(host)}
 return host;
}
function setSectionVisibility(key){
 const modalEl=$('#admin-modal'),content=$('#svs-admin-content');
 modalEl?.classList.add('module-view','nexa-v25-admin');
 $('#admin-module-chooser')?.classList.add('hidden');
 content?.classList.remove('hidden');
 for(const t of TABS){
  if(!t.id)continue;
  const el=$(`#${t.id}`);if(!el)continue;
  const on=t.key===key;
  el.classList.toggle('nexa-v25-active',on);
  el.classList.toggle('hidden',!on);
 }
}

async function roleContext(){
 try{nexaRole=String(await rpc('current_nexa_role')||'player').toLowerCase()}catch{nexaRole='player'}
 try{
  const c=sb(),{data:{user}}=await c.auth.getUser();
  if(user){
   const {data}=await c.from('player_accounts').select('alliance_role').eq('user_id',user.id).eq('is_main',true).maybeSingle();
   callerRank=String(data?.alliance_role||'').toUpperCase();
  }
 }catch{callerRank=''}
}

async function activate(key,{first=false}={}){
 if(key==='library'){location.href='library.html?admin=1';return}
 if(!TABS.some(x=>x.key===key))key='alliances';
 current=key;const seq=++activationSeq;
 setSectionVisibility(key);const host=ensureHost(key);if(!host)return;
 // Never destructively mark legacy children. We only hide known legacy blocks on custom pages.
 if(key==='alliances'){
  $$(':scope>.admin-section-head,:scope>#alliance-admin-form,:scope>#admin-alliances-message,:scope>#alliances-admin-list',section(key)).forEach(x=>x.style.display='none');
  await renderAlliances(host,seq);
 }
 if(key==='access'){
  $$(':scope>.admin-section-head,:scope>#permissions-search-form,:scope>#permissions-message,:scope>#permissions-list',section(key)).forEach(x=>x.style.display='none');
  await renderAccess(host,seq);
 }
 if(key==='roles'){
  $$(':scope>.admin-section-head,:scope>.empty-state',section(key)).forEach(x=>x.style.display='none');
  await renderRoles(host,seq);
 }
 if(key==='system'){
  host.innerHTML='';
  // System Operations keeps all original Maintenance/Recovery controls visible.
  $$(':scope>.admin-section-head,:scope>.setting-card',section(key)).forEach(x=>x.style.display='');
  renderTesting(host);
  try{await window.loadSystemOperations?.()}catch(e){console.warn(e)}
 }
 if(first && !localStorage.getItem('nexa_admin_quickguide_v25')){
   localStorage.setItem('nexa_admin_quickguide_v25','seen');setTimeout(generalGuide,120);
 }
}

async function alliances(){
 const data=await rpc('nexa_list_alliance_passports');
 return Array.isArray(data)?data:[];
}
function planet(a,i){
 const color=a.color||colorFor(a.tag,i);
 const emblem=a.emblemUrl?`<img class="nexa-v25-emblem" src="${esc(a.emblemUrl)}" alt="">`:`<span class="nexa-v25-letter">${esc(a.tag||'?')}</span>`;
 return `<article class="nexa-v25-alliance" style="--pc:${esc(color)}">
  <div class="nexa-v25-card-actions">
   ${a.canManage?`<button class="nexa-v25-icon ${a.active===false?'off':''}" title="${a.active===false?'Activate':'Deactivate'}" data-v25-toggle="${esc(a.id)}">${a.active===false?'○':'●'}</button>`:''}
   ${a.canDelete?`<button class="nexa-v25-icon danger" title="Schedule deletion" data-v25-delete="${esc(a.id)}">×</button>`:''}
  </div>
  <button type="button" style="all:unset;display:block;width:100%;cursor:pointer" data-v25-alliance="${esc(a.id)}">
   <span class="nexa-v25-orbit">${emblem}</span>
   <span class="nexa-v25-tag">${esc(a.tag||'Alliance')}</span>
   <span class="nexa-v25-chips"><span class="nexa-v25-chip">${a.active===false?'INACTIVE':'ACTIVE'}</span><span class="nexa-v25-chip">${Number(a.registeredMembers||0)} MEMBERS</span></span>
  </button>
 </article>`;
}
async function renderAlliances(host,seq){
 host.innerHTML='<div class="nexa-v25-empty">Loading alliance planets…</div>';
 try{
  const rows=await alliances();if(seq!==activationSeq)return;
  host.dataset.rows=JSON.stringify(rows);
  host.innerHTML=`<div class="nexa-v25-toolbar"><button class="nexa-v25-add" data-v25-add-alliance title="Add Alliance">+</button><button class="nexa-v25-refresh" data-v25-refresh>↻ Refresh</button></div><div class="nexa-v25-planets">${rows.map(planet).join('')||'<div class="nexa-v25-empty">No alliances available.</div>'}</div>`;
 }catch(e){host.innerHTML=`<div class="nexa-v25-empty">${esc(clean(e.message))}</div>`}
}
function getRows(){try{return JSON.parse($('.nexa-v25-host',section('alliances'))?.dataset.rows||'[]')}catch{return[]}}
function memberCard(m,a){
 const photo=m.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name||'?')}&background=111a38&color=cabaff&bold=true`;
 return `<div class="nexa-v25-member"><img class="nexa-v25-avatar" src="${esc(photo)}" alt=""><b>${esc(clean(m.name))}</b><small>ID ${esc(m.gameId||'—')} · ${esc(m.rank||'')}</small><div class="nexa-v25-buttons"><button class="nexa-v25-btn" data-v25-person="${esc(m.accountId)}" data-aid="${esc(a.id)}">Passport</button>${a.canAssignRanks?`<button class="nexa-v25-btn" data-v25-rank="${esc(m.accountId)}" data-aid="${esc(a.id)}">Rank</button>`:''}${(nexaRole==='owner'||nexaRole==='admin'||callerRank==='R5')?`<button class="nexa-v25-btn" data-v25-reset="${esc(m.accountId)}" data-aid="${esc(a.id)}">Reset PW</button>`:''}</div></div>`;
}
function rankGroup(a,label,ranks){
 const ms=(a.members||[]).filter(m=>ranks.includes(String(m.rank||'').toUpperCase()));
 return `<div class="nexa-v25-panel"><h4>${label}</h4><div class="nexa-v25-members">${ms.map(m=>memberCard(m,a)).join('')||'<div class="nexa-v25-empty">No members</div>'}</div></div>`;
}
function passport(a){
 const host=$('.nexa-v25-host',section('alliances'));if(!host)return;
 host.innerHTML=`<div class="nexa-v25-toolbar"><button class="nexa-v25-btn" data-v25-back-alliance>← Alliance Planets</button></div>
 <div class="nexa-v25-panel"><h3>${esc(a.tag)}${a.name?' · '+esc(clean(a.name)):''}</h3><div class="nexa-v25-muted">${a.active===false?'Inactive':'Active'} · ${Number(a.registeredMembers||0)} registered members · ${fmt(a.registeredPower||a.gamePower)} power</div>
 ${a.password?`<div class="nexa-v25-chips"><span class="nexa-v25-chip">Alliance password: ${esc(a.password)}</span></div>`:''}
 ${a.scheduledDeleteAt?`<p class="nexa-v25-muted">Scheduled deletion: ${esc(new Date(a.scheduledDeleteAt).toLocaleString())}</p>`:''}</div>
 ${rankGroup(a,'R5',['R5'])}${rankGroup(a,'R4',['R4'])}${rankGroup(a,'R3–R1',['R3','R2','R1'])}`;
}
async function createAlliance(){
 const result=await modal('Add Alliance',`<label class="nexa-v25-field">Alliance Tag<input id="v25-new-tag" maxlength="12" placeholder="FSU"></label><label class="nexa-v25-field">Alliance Name<input id="v25-new-name" maxlength="60" placeholder="Optional"></label><label class="nexa-v25-field">Alliance Password<input id="v25-new-password" maxlength="80" placeholder="Optional app-level password"></label><label class="nexa-v25-field">Planet Color<input id="v25-new-color" type="color" value="#7b61ff"></label>`,[['Cancel','cancel'],['Create','create']]);
 if(result.action!=='create')return;
 const tag=String(result.fields['v25-new-tag']||'').trim(),name=String(result.fields['v25-new-name']||'').trim(),pw=result.fields['v25-new-password']||'',color=result.fields['v25-new-color']||'#7b61ff';
 if(!tag)return notice('Alliance','Alliance Tag is required.');
 try{await rpc('nexa_create_alliance',{p_tag:tag,p_name:name||null,p_password:pw||null,p_color:color});await activate('alliances')}
 catch(e){await notice('Could not add alliance',e.message)}
}
async function toggleAlliance(id){
 const a=getRows().find(x=>String(x.id)===String(id));if(!a)return;
 try{await rpc('nexa_update_alliance_passport',{p_alliance_id:Number(a.id),p_name:a.name||null,p_color:a.color||colorFor(a.tag),p_server_rank:a.serverRank||null,p_game_power:a.gamePower||null,p_is_active:!a.active,p_password:a.password||null});await activate('alliances')}
 catch(e){await notice('Alliance',e.message)}
}
async function deleteAlliance(id){
 const a=getRows().find(x=>String(x.id)===String(id));if(!a)return;
 if(!(await confirmV('Schedule Alliance Deletion',`${a.tag} will enter the safe deletion countdown instead of being removed instantly.`)))return;
 try{await rpc('nexa_request_alliance_deletion',{p_alliance_id:Number(id)});await activate('alliances')}
 catch(e){await notice('Alliance',e.message)}
}
async function changeRank(a,m){
 let allowed=[];
 if(['owner','admin'].includes(nexaRole))allowed=['R5','R4','R3','R2','R1'];
 else if(callerRank==='R5')allowed=['R4','R3','R2','R1'];
 else if(callerRank==='R4')allowed=['R3','R2','R1'];
 if(!allowed.length)return;
 const opts=allowed.map(r=>`<option ${r===m.rank?'selected':''}>${r}</option>`).join('');
 const result=await modal('Change Alliance Rank',`<p>${esc(clean(m.name))}</p><label class="nexa-v25-field">Rank<select id="v25-rank" style="padding:11px;border-radius:11px;background:#090f24;color:#fff;border:1px solid rgba(255,255,255,.16)">${opts}</select></label>`,[['Cancel','cancel'],['Save','save']]);
 if(result.action!=='save')return;
 try{await rpc('nexa_set_alliance_rank',{p_account_id:m.accountId,p_new_rank:result.fields['v25-rank']});await activate('alliances')}
 catch(e){await notice('Rank',e.message)}
}
async function resetPassword(m){
 const result=await modal('Reset NEXA Password',`<p>${esc(clean(m.name))}</p><label class="nexa-v25-field">Temporary password<input id="v25-pw" type="password" minlength="8"></label>`,[['Cancel','cancel'],['Reset','reset']]);
 if(result.action!=='reset')return;
 const pw=result.fields['v25-pw']||'';if(pw.length<8)return notice('Password','Use at least 8 characters.');
 try{
  const c=sb(),{data:{session}}=await c.auth.getSession();
  const r=await fetch('/api/nexa-admin-reset-password',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session?.access_token||''}`},body:JSON.stringify({account_id:m.accountId,password:pw})});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Password reset failed.');
  await notice('Password','Temporary NEXA password updated.');
 }catch(e){await notice('Password',e.message)}
}

async function renderRoles(host,seq){
 host.innerHTML='<div class="nexa-v25-empty">Loading roles…</div>';
 try{
  const rows=await alliances();let op=[];
  if(['owner','admin'].includes(nexaRole)){try{op=await rpc('nexa_list_operational_roles')||[]}catch{}}
  if(seq!==activationSeq)return;
  const set=new Set(op.map(x=>`${x.userId}:${x.role}`));
  host.innerHTML=`<div class="nexa-v25-panel"><h3>Role Model</h3><div class="nexa-v25-muted">Alliance Rank ≠ Operational Role ≠ NEXA Access. Operational Roles may be combined and never unlock modules automatically.</div></div>`+
   rows.map(a=>`<div class="nexa-v25-panel"><h3>${esc(a.tag)}</h3>${['R5','R4','R3','R2','R1'].map(rank=>{const ms=(a.members||[]).filter(m=>String(m.rank||'').toUpperCase()===rank);return`<h4 style="margin-top:13px">${rank}</h4>${ms.map(m=>`<div class="nexa-v25-member" style="margin-bottom:7px"><b>${esc(clean(m.name))}</b><small>ID ${esc(m.gameId||'—')}</small>${['owner','admin'].includes(nexaRole)?`<div class="nexa-v25-checks">${OPS.map(([k,n])=>`<label><input type="checkbox" data-v25-op-user="${esc(m.userId)}" data-v25-op="${k}" ${set.has(`${m.userId}:${k}`)?'checked':''}> ${n}</label>`).join('')}</div>`:''}</div>`).join('')||'<div class="nexa-v25-muted">No members</div>'}`}).join('')}</div>`).join('')||'<div class="nexa-v25-empty">No alliance members found.</div>';
 }catch(e){host.innerHTML=`<div class="nexa-v25-empty">${esc(clean(e.message))}</div>`}
}
async function renderAccess(host,seq){
 host.innerHTML='<div class="nexa-v25-empty">Loading NEXA Access…</div>';
 if(!['owner','admin'].includes(nexaRole)){host.innerHTML='<div class="nexa-v25-empty">Owner or Admin access required.</div>';return}
 try{
  const rows=await rpc('nexa_list_module_access')||[];if(seq!==activationSeq)return;
  host.innerHTML=`<input id="v25-access-search" class="nexa-v25-search" placeholder="Search player or Game ID"><div class="nexa-v25-muted" style="margin-bottom:8px">Search any player, then choose exactly which NEXA tools they may open.</div><div id="v25-access-list">${rows.map(p=>`<article class="nexa-v25-panel" data-v25-access-card><b>${esc(clean(p.name||'Player'))}</b><div class="nexa-v25-muted">ID ${esc(p.gameId||'—')} · ${esc(p.allianceRole||'')}</div><div class="nexa-v25-checks">${MODULES.map(([k,n])=>{const prop=k==='team_builder'?'teamBuilder':k;return`<label><input type="checkbox" data-v25-access-user="${esc(p.userId)}" data-v25-access-module="${k}" ${p[prop]?'checked':''}> ${n}</label>`}).join('')}</div><div class="nexa-v25-buttons"><button class="nexa-v25-btn danger" data-v25-remove-access="${esc(p.userId)}">Remove from NEXA Access</button></div></article>`).join('')||'<div class="nexa-v25-empty">No players found.</div>'}</div>`;
 }catch(e){host.innerHTML=`<div class="nexa-v25-empty">${esc(clean(e.message))}</div>`}
}
function renderTesting(host){
 if($('#nexa-v25-testing',section('system')))return;
 const block=document.createElement('section');block.id='nexa-v25-testing';block.className='nexa-v25-panel';block.innerHTML=`<h3>Testing / Sandbox</h3><div class="nexa-v25-muted">Foundation is visible now. Permission Preview and Battle Sandbox remain intentionally inactive until the later testing phase.</div><div class="nexa-v25-testgrid"><div><b>Test Mode</b><select id="v25-testmode" style="width:100%;margin-top:8px;padding:9px;border-radius:10px;background:#091027;color:#fff"><option>Test Mode Off</option><option>Test Mode</option><option>Test Mode Auto</option></select></div><div><b>Permission Preview</b><p class="nexa-v25-muted">Owner / Admin / R5 / R4 / R3–R1 + selected NEXA Access.</p><button class="nexa-v25-btn" data-v25-coming>Preview</button></div><div><b>Battle Sandbox</b><p class="nexa-v25-muted">Teams, rally capacity and future battle simulations.</p><button class="nexa-v25-btn" data-v25-coming>Sandbox</button></div></div>`;
 host.appendChild(block);
}

function ensureConstellationX(){
 const wrap=$('#nexa-account-constellation'),stage=wrap?.querySelector('.nexa-constellation-stage');if(!wrap||!stage||$('#nexa-v25-constellation-x',stage))return;
 const b=document.createElement('button');b.id='nexa-v25-constellation-x';b.type='button';b.textContent='×';b.title='Close Account Constellation';
 b.style.cssText='position:absolute;right:18px;top:max(18px,env(safe-area-inset-top));z-index:50;width:38px;height:38px;border-radius:50%;border:1px solid rgba(150,115,255,.48);background:#0b1028;color:#fff;font-size:24px;box-shadow:0 0 20px rgba(117,77,255,.18)';
 b.onclick=()=>{wrap.classList.remove('open');wrap.setAttribute('aria-hidden','true')};stage.prepend(b);
}
function closeOverlaysBeforeNav(){
 $('#nexa-profile-modal')?.classList.remove('open');$('#nexa-profile-modal')?.setAttribute('aria-hidden','true');
 $('#nexa-account-constellation')?.classList.remove('open');$('#nexa-account-constellation')?.setAttribute('aria-hidden','true');
}

function findMember(aid,accountId){
 const a=getRows().find(x=>String(x.id)===String(aid));
 return [a,(a?.members||[]).find(x=>String(x.accountId)===String(accountId))];
}
function personPassport(a,m){
 if(!a||!m)return;
 const host=$('.nexa-v25-host',section('alliances'));if(!host)return;
 host.innerHTML=`<div class="nexa-v25-toolbar"><button class="nexa-v25-btn" data-v25-open-alliance="${esc(a.id)}">← ${esc(a.tag)}</button></div><div class="nexa-v25-panel"><h3>${esc(clean(m.name))}</h3><div class="nexa-v25-muted">Choose an account Passport.</div></div>${(m.accounts||[]).map(x=>`<button class="nexa-v25-panel" style="display:block;width:100%;text-align:left;color:#fff" data-v25-account="${esc(x.id)}"><b>${esc(clean(x.name))}${x.isMain?' · MAIN':''}</b><div class="nexa-v25-muted">ID ${esc(x.gameId||'—')} · ${esc(x.furnace||'—')} · ${fmt(x.power)}</div></button>`).join('')||'<div class="nexa-v25-empty">No linked accounts.</div>'}`;
}

function bind(){
 addStyle();ensureConstellationX();roleContext();
 // Only child additions are observed: no attribute/class loop.
 new MutationObserver(m=>{if(m.some(x=>x.addedNodes?.length))requestAnimationFrame(ensureConstellationX)}).observe(document.documentElement,{childList:true,subtree:true});

 document.addEventListener('click',async e=>{
  const go=e.target.closest('[data-v25-go]');if(go){e.preventDefault();e.stopPropagation();await activate(go.dataset.v25Go);return}
  const href=e.target.closest('[data-v25-href]');if(href){e.preventDefault();location.href=href.dataset.v25Href;return}
  if(e.target.closest('[data-v25-general]')){e.preventDefault();await generalGuide();return}
  const guide=e.target.closest('[data-v25-guide]');if(guide){e.preventDefault();await sectionGuide(guide.dataset.v25Guide);return}
  if(e.target.closest('[data-v25-refresh]')){await activate('alliances');return}
  if(e.target.closest('[data-v25-add-alliance]')){await createAlliance();return}
  const tog=e.target.closest('[data-v25-toggle]');if(tog){await toggleAlliance(tog.dataset.v25Toggle);return}
  const del=e.target.closest('[data-v25-delete]');if(del){await deleteAlliance(del.dataset.v25Delete);return}
  const ap=e.target.closest('[data-v25-alliance]');if(ap){const a=getRows().find(x=>String(x.id)===String(ap.dataset.v25Alliance));if(a)passport(a);return}
  if(e.target.closest('[data-v25-back-alliance]')){await activate('alliances');return}
  const oa=e.target.closest('[data-v25-open-alliance]');if(oa){const a=getRows().find(x=>String(x.id)===String(oa.dataset.v25OpenAlliance));if(a)passport(a);return}
  const person=e.target.closest('[data-v25-person]');if(person){const[a,m]=findMember(person.dataset.aid,person.dataset.v25Person);personPassport(a,m);return}
  const rank=e.target.closest('[data-v25-rank]');if(rank){const[a,m]=findMember(rank.dataset.aid,rank.dataset.v25Rank);if(a&&m)await changeRank(a,m);return}
  const reset=e.target.closest('[data-v25-reset]');if(reset){const[a,m]=findMember(reset.dataset.aid,reset.dataset.v25Reset);if(m)await resetPassword(m);return}
  const account=e.target.closest('[data-v25-account]');if(account){if(typeof window.openAccountPassport==='function')window.openAccountPassport(account.dataset.v25Account);else await notice('Passport','Open this account from My Profile to view its full Passport.');return}
  const op=e.target.closest('[data-v25-op-user]');if(op){op.disabled=true;try{await rpc('nexa_set_operational_role',{p_user_id:op.dataset.v25OpUser,p_role:op.dataset.v25Op,p_enabled:op.checked})}catch(err){op.checked=!op.checked;await notice('Operational Role',err.message)}finally{op.disabled=false}return}
  const ac=e.target.closest('[data-v25-access-user]');if(ac){ac.disabled=true;try{await rpc('nexa_set_module_access',{p_user_id:ac.dataset.v25AccessUser,p_module:ac.dataset.v25AccessModule,p_enabled:ac.checked})}catch(err){ac.checked=!ac.checked;await notice('NEXA Access',err.message)}finally{ac.disabled=false}return}
  const rem=e.target.closest('[data-v25-remove-access]');if(rem){if(await confirmV('Remove NEXA Access','This removes special NEXA Access and Operational Roles. It does not delete the player account.')){try{await rpc('nexa_remove_staff_access',{p_user_id:rem.dataset.v25RemoveAccess});await activate('access')}catch(err){await notice('NEXA Access',err.message)}}return}
  if(e.target.closest('[data-v25-coming]')){await notice('Testing Framework','This control is reserved and intentionally inactive for now.');return}

  // Existing Admin entry: let legacy code open its modal, then V25 takes ownership of Administration only.
  if(e.target.closest('#open-administration')){
    setTimeout(async()=>{await roleContext();await activate('alliances',{first:true})},180);
  }
  // Leaving Administration to other existing tools removes the V25 shell class.
  if(e.target.closest('#open-svs-admin,#open-announcements,#open-event-operations,#open-layout-management,#open-transfer-admin')){
    $('#admin-modal')?.classList.remove('nexa-v25-admin');
  }

  // Global HOME menu always releases Profile/Constellation before its existing navigation runs.
  if(e.target.closest('.nexa-home-menu-item')) closeOverlaysBeforeNav();
 },true);

 document.addEventListener('input',e=>{
  if(e.target.id==='v25-access-search'){
   const q=e.target.value.toLowerCase().trim();
   $$('[data-v25-access-card]').forEach(c=>c.style.display=!q||clean(c.innerText).toLowerCase().includes(q)?'':'none');
  }
 });
 document.addEventListener('change',e=>{
  if(e.target.id==='v25-testmode' && e.target.value!=='Test Mode Off'){
    notice('Testing Framework','The testing controls are prepared but not activated yet.');e.target.value='Test Mode Off';
  }
 });

 const params=new URLSearchParams(location.search);
 if(params.get('admin')==='administration'){
  const map={alliances:'alliances',library:'library',permissions:'access',roles:'roles',system:'system'};
  const key=map[params.get('tab')]||'alliances';
  setTimeout(async()=>{await roleContext();await activate(key,{first:true})},700);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
