/* NEXA Administration V26 — stable isolated Administration workspace
   No Profile image rewriting. No global attribute MutationObserver.
   A -> L -> N -> R -> S alphabetical navigation.
*/
(()=>{
'use strict';
if(window.__NEXA_ADMIN_V26__) return;
window.__NEXA_ADMIN_V26__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=v=>String(v??'')
 .replace(/â€¢|Ã¢ÂÂ¢|â¦|Ã¢ÂÂ¦/g,'•')
 .replace(/â€”|Ã¢ÂÂ/g,'—').replace(/â€“|Ã¢ÂÂ/g,'–')
 .replace(/â†|Ã¢ÂÂ/g,'←').replace(/â†’|Ã¢ÂÂ/g,'→')
 .replace(/â€¦|Ã¢ÂÂ¦/g,'…').replace(/â|Ã¢ÂÂ/g,'✓')
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
 ['svs','SvS'],['transfer','Transfer'],['team_builder','Team Builder'],
 ['forms','Forms'],['events','Events'],['administration','Administration']
];
const EMBLEMS=Array.from({length:10},(_,i)=>`/nexa-alliance-emblem-${String(i+1).padStart(2,'0')}.png`);
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
 .nexa-v25-status-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:#8a91a8;box-shadow:0 0 8px rgba(138,145,168,.35)}.nexa-v25-status-dot.active{background:#39e58c;box-shadow:0 0 11px #39e58c}
 .nexa-v25-code{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}.nexa-v25-code code{padding:8px 10px;border-radius:10px;background:#070c1e;border:1px solid rgba(108,198,255,.22);letter-spacing:.08em}
 .nexa-v25-emblem-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.nexa-v25-emblem-pick{position:relative;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:#090f25;padding:6px;aspect-ratio:1;display:grid;place-items:center}.nexa-v25-emblem-pick img{width:100%;height:100%;object-fit:contain}.nexa-v25-emblem-pick.used{opacity:.28;filter:grayscale(.7)}.nexa-v25-emblem-pick.current{border-color:#61d8ff;box-shadow:0 0 16px rgba(97,216,255,.22)}
 .nexa-v25-access-results{display:grid;gap:7px;margin:8px 0 12px}.nexa-v25-access-result{width:100%;text-align:left;border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:10px 12px;background:#091027;color:#fff}.nexa-v25-protected{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;border:1px solid rgba(95,220,255,.24);color:#8ee9ff;font-size:.72rem;font-weight:850}
 .logo .star.nexa-native-star:before,.logo .star.nexa-native-star:after{display:none!important}.nexa-v26-main{filter:drop-shadow(0 0 24px rgba(96,142,255,.95)) drop-shadow(0 0 48px rgba(139,72,255,.72))!important}.nexa-v26-alt{filter:drop-shadow(0 0 13px rgba(92,162,255,.52))!important}
 @media(max-width:700px){html,body{max-width:100%!important;overflow-x:hidden!important}#admin-modal.nexa-v25-admin,.nexa-v25-host,.nexa-v25-panel{min-width:0!important;max-width:100%!important}.nexa-v25-planets,.nexa-v25-members{grid-template-columns:1fr!important}.nexa-v25-checks{max-width:100%!important}.nexa-v25-checks label{max-width:100%;white-space:normal}.nexa-v25-nav{grid-template-columns:minmax(48px,1fr) minmax(0,auto) minmax(48px,1fr)}.nexa-v25-title{min-width:0;font-size:.92rem}.nexa-v25-emblem-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
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
 <p><b>MENU</b> opens navigation without closing your current screen. The <b>ⓘ</b> beside each page explains that section.</p>`);
}
async function sectionGuide(key){
 const copy={
 alliances:'Alliance planets open an Alliance Passport. Use + to add an alliance. The power icon activates/deactivates it and × schedules deletion safely.',
 library:'Library is the verified master catalog for Heroes, Experts, Pets, Troops, Chief Gear and Charms.',
 access:'NEXA Access controls exactly which tools a person can open. It is separate from Alliance Rank and Operational Role.',
 roles:'Operational Roles are work functions inside NEXA. Battle Strategist, Event Operator, Scheduler and Transfer Coordinator may be combined and never grant module access automatically. Alliance Rank is managed from the Alliance Passport.',
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
   ${a.canManage?`<button class="nexa-v25-icon ${a.active===false?'off':''}" title="${a.active===false?'Activate':'Deactivate'}" data-v25-toggle="${esc(a.id)}"><span class="nexa-v25-status-dot ${a.active===false?'':'active'}"></span></button>`:''}
   ${a.canDelete?`<button class="nexa-v25-icon danger" title="Schedule deletion" data-v25-delete="${esc(a.id)}">×</button>`:''}
  </div>
  <button type="button" style="all:unset;display:block;width:100%;cursor:pointer" data-v25-alliance="${esc(a.id)}">
   <span class="nexa-v25-orbit">${emblem}</span>
   <span class="nexa-v25-tag">${esc(a.tag||'Alliance')}</span>
   <span class="nexa-v25-chips"><span class="nexa-v25-chip"><span class="nexa-v25-status-dot ${a.active===false?'':'active'}"></span>${a.active===false?'INACTIVE':'ACTIVE'}</span><span class="nexa-v25-chip">${Number(a.registeredMembers||0)} MEMBERS</span></span>
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
 return `<div class="nexa-v25-member"><img class="nexa-v25-avatar" src="${esc(photo)}" alt=""><b>${esc(clean(m.name))}</b><small>ID ${esc(m.gameId||'—')} · ${esc(m.rank||'')} ${m.allianceVerified?'· ✓ VERIFIED':''}</small><div class="nexa-v25-buttons"><button class="nexa-v25-btn" data-v25-person="${esc(m.accountId)}" data-aid="${esc(a.id)}">Passport</button>${a.canAssignRanks?`<button class="nexa-v25-btn" data-v25-rank="${esc(m.accountId)}" data-aid="${esc(a.id)}">Rank</button>`:''}${(nexaRole==='owner'||nexaRole==='admin'||callerRank==='R5')?`<button class="nexa-v25-btn" data-v25-reset="${esc(m.accountId)}" data-aid="${esc(a.id)}">Reset PW</button>`:''}</div></div>`;
}
function rankGroup(a,label,ranks){
 const ms=(a.members||[]).filter(m=>ranks.includes(String(m.rank||'').toUpperCase()));
 return `<div class="nexa-v25-panel"><h4>${label}</h4><div class="nexa-v25-members">${ms.map(m=>memberCard(m,a)).join('')||'<div class="nexa-v25-empty">No members</div>'}</div></div>`;
}
function passport(a){
 const host=$('.nexa-v25-host',section('alliances'));if(!host)return;
 const emblem=a.emblemUrl?`<img class="nexa-v25-emblem" src="${esc(a.emblemUrl)}" alt="${esc(a.tag)} emblem">`:`<span class="nexa-v25-letter">${esc(a.tag||'?')}</span>`;
 host.innerHTML=`<div class="nexa-v25-toolbar"><button class="nexa-v25-btn" data-v25-back-alliance>← Alliance Planets</button></div>
 <div class="nexa-v25-panel" style="--pc:${esc(a.color||colorFor(a.tag))}"><div class="nexa-v25-orbit" style="margin-bottom:12px">${emblem}</div><h3>${esc(a.tag)}${a.name?' · '+esc(clean(a.name)):''}</h3><div class="nexa-v25-muted"><span class="nexa-v25-status-dot ${a.active===false?'':'active'}"></span>${a.active===false?'Inactive':'Active'} · ${Number(a.registeredMembers||0)} registered members · ${fmt(a.registeredPower||a.gamePower)} power</div>
 ${a.canViewAccessCode&&a.accessCode?`<details style="margin-top:12px"><summary style="cursor:pointer;font-weight:900">Alliance Access Code</summary><div class="nexa-v25-code"><code>${esc(a.accessCode)}</code><button class="nexa-v25-btn" data-v25-copy-code="${esc(a.accessCode)}">Copy Code</button>${a.canRegenerateAccessCode?`<button class="nexa-v25-btn" data-v25-regenerate-code="${esc(a.id)}">Regenerate</button>`:''}</div><p class="nexa-v25-muted">One-time verification for members when they select or change to this alliance in Profile.</p></details>`:''}
 ${a.canChooseEmblem?`<div class="nexa-v25-buttons"><button class="nexa-v25-btn" data-v25-emblems="${esc(a.id)}">Choose Alliance Emblem</button></div>`:''}
 ${a.scheduledDeleteAt?`<p class="nexa-v25-muted">Scheduled deletion: ${esc(new Date(a.scheduledDeleteAt).toLocaleString())}</p>`:''}</div>
 ${rankGroup(a,'R5',['R5'])}${rankGroup(a,'R4',['R4'])}${rankGroup(a,'R3–R1',['R3','R2','R1'])}`;
}

async function createAlliance(){
 const result=await modal('Add Alliance',`<label class="nexa-v25-field">Alliance Tag<input id="v25-new-tag" maxlength="12" placeholder="FSU"></label><label class="nexa-v25-field">Alliance Name<input id="v25-new-name" maxlength="60" placeholder="Optional"></label><p class="nexa-v25-muted">NEXA automatically assigns a unique planet color and generates the Alliance Access Code.</p>`,[['Cancel','cancel'],['Create','create']]);
 if(result.action!=='create')return;
 const tag=String(result.fields['v25-new-tag']||'').trim(),name=String(result.fields['v25-new-name']||'').trim();
 if(!tag)return notice('Alliance','Alliance Tag is required.');
 try{await rpc('nexa_create_alliance',{p_tag:tag,p_name:name||null,p_password:null,p_color:null});await activate('alliances')}
 catch(e){await notice('Could not add alliance',e.message)}
}
async function chooseEmblem(a){
 const used=new Set(getRows().filter(x=>String(x.id)!==String(a.id)&&x.emblemUrl).map(x=>x.emblemUrl));
 const ov=document.createElement('div');ov.className='nexa-v25-dialog';
 ov.innerHTML=`<div class="nexa-v25-dialog-card" role="dialog" aria-modal="true"><h3>Choose Alliance Emblem</h3><p>Each emblem can belong to only one alliance at a time. You can switch later to any emblem that is free.</p><div class="nexa-v25-emblem-grid">${EMBLEMS.map(url=>`<button type="button" class="nexa-v25-emblem-pick ${used.has(url)?'used':''} ${a.emblemUrl===url?'current':''}" ${used.has(url)?'disabled':''} data-v25-direct-emblem="${esc(url)}"><img src="${esc(url)}" alt="Alliance emblem"></button>`).join('')}</div><div class="nexa-v25-dialog-actions"><button type="button" class="nexa-v25-btn" data-v25-close-emblems>Cancel</button></div></div>`;
 document.body.appendChild(ov);
 ov.addEventListener('click',async e=>{
   if(e.target.closest('[data-v25-close-emblems]')){ov.remove();return}
   const pick=e.target.closest('[data-v25-direct-emblem]');if(!pick)return;
   const url=pick.dataset.v25DirectEmblem;ov.remove();await setEmblem(a.id,url);
 });
}

async function setEmblem(aid,url){
 try{await rpc('nexa_set_alliance_emblem',{p_alliance_id:Number(aid),p_emblem_url:url});await activate('alliances');const a=getRows().find(x=>String(x.id)===String(aid));if(a)passport(a)}catch(e){await notice('Alliance Emblem',e.message)}
}

async function toggleAlliance(id){
 const a=getRows().find(x=>String(x.id)===String(id));if(!a)return;
 try{await rpc('nexa_update_alliance_passport',{p_alliance_id:Number(a.id),p_name:a.name||null,p_color:null,p_server_rank:a.serverRank||null,p_game_power:a.gamePower||null,p_is_active:!a.active,p_password:null});await activate('alliances')}
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
  const ars=await alliances();let op=[],access=[];
  if(['owner','admin'].includes(nexaRole)){try{op=await rpc('nexa_list_operational_roles')||[]}catch{}try{access=await rpc('nexa_list_module_access')||[]}catch{}}
  if(seq!==activationSeq)return;
  const opSet=new Set(op.map(x=>`${x.userId}:${x.role}`));
  const accessByUser=new Map(access.map(x=>[String(x.userId),x]));
  const people=[];const seen=new Set();
  for(const a of ars)for(const m of (a.members||[])){if(seen.has(String(m.userId)))continue;seen.add(String(m.userId));people.push({...m,allianceTag:a.tag});}
  host.innerHTML=`<div class="nexa-v25-panel"><h3>Operational Roles</h3><div class="nexa-v25-muted">Alliance Rank is managed inside each Alliance Passport. Operational Roles describe a person's work in NEXA and never grant module access automatically.</div></div>`+
   (people.map(m=>{const ax=accessByUser.get(String(m.userId));const enabled=MODULES.filter(([k])=>{const prop=k==='team_builder'?'teamBuilder':k;return !!ax?.[prop]}).map(([,n])=>n);return`<article class="nexa-v25-panel"><b>${esc(clean(m.name||'Player'))}</b><div class="nexa-v25-muted">ID ${esc(m.gameId||'—')} · ${esc(m.allianceTag||'—')} · ${esc(m.rank||'')}</div><div class="nexa-v25-checks">${OPS.map(([k,n])=>`<label><input type="checkbox" data-v25-op-user="${esc(m.userId)}" data-v25-op="${k}" ${opSet.has(`${m.userId}:${k}`)?'checked':''} ${['owner','admin'].includes(nexaRole)?'':'disabled'}> ${n}</label>`).join('')}</div><div class="nexa-v25-muted" style="margin-top:8px">NEXA Access: ${enabled.length?esc(enabled.join(' · ')):'No special module access'}</div>${['owner','admin'].includes(nexaRole)?`<div class="nexa-v25-buttons"><button class="nexa-v25-btn" data-v25-manage-access="${esc(m.userId)}">Manage Access</button></div>`:''}</article>`}).join('')||'<div class="nexa-v25-empty">No alliance members found.</div>');
 }catch(e){host.innerHTML=`<div class="nexa-v25-empty">${esc(clean(e.message))}</div>`}
}
let accessCache=[];
async function renderAccess(host,seq,selectUser=''){
 host.innerHTML='<div class="nexa-v25-empty">Loading NEXA Access…</div>';
 if(!['owner','admin'].includes(nexaRole)){host.innerHTML='<div class="nexa-v25-empty">Owner or Admin access required.</div>';return}
 try{
  const rows=await rpc('nexa_list_module_access')||[];let op=[];try{op=await rpc('nexa_list_operational_roles')||[]}catch{}
  if(seq!==activationSeq)return;accessCache=rows;
  const opSet=new Set(op.map(x=>`${x.userId}:${x.role}`));
  host.innerHTML=`<input id="v25-access-search" class="nexa-v25-search" placeholder="Search Player Name or Game ID" autocomplete="off"><div class="nexa-v25-muted" style="margin-bottom:8px">Find a player, then manage Operational Roles and Module Access in one ficha.</div><div id="v25-access-results" class="nexa-v25-access-results"></div><div id="v25-access-selected"></div>`;
  host.dataset.opset=JSON.stringify(Array.from(opSet));
  if(selectUser){const p=rows.find(x=>String(x.userId)===String(selectUser));if(p){$('#v25-access-search',host).value=p.name||p.gameId||'';showAccessPlayer(p)}}
 }catch(e){host.innerHTML=`<div class="nexa-v25-empty">${esc(clean(e.message))}</div>`}
}
function showAccessPlayer(p){
 const host=$('.nexa-v25-host',section('access')),target=$('#v25-access-selected',host);if(!host||!target)return;
 const opSet=new Set(JSON.parse(host.dataset.opset||'[]'));
 const owner=String(p.systemRole||'').toLowerCase()==='owner';
 target.innerHTML=`<article class="nexa-v25-panel"><b>${esc(clean(p.name||'Player'))}</b><div class="nexa-v25-muted">ID ${esc(p.gameId||'—')} · ${esc(p.allianceRole||'')} · ${esc(String(p.systemRole||'player').toUpperCase())}</div>${owner?'<div class="nexa-v25-protected" style="margin-top:9px">✦ Owner Main Access Protected</div>':''}<h4 style="margin-top:14px">Operational Roles</h4><div class="nexa-v25-checks">${OPS.map(([k,n])=>`<label><input type="checkbox" data-v25-op-user="${esc(p.userId)}" data-v25-op="${k}" ${opSet.has(`${p.userId}:${k}`)?'checked':''} ${owner?'disabled':''}> ${n}</label>`).join('')}</div><h4 style="margin-top:14px">Module Access</h4><div class="nexa-v25-checks">${MODULES.map(([k,n])=>{const prop=k==='team_builder'?'teamBuilder':k;return`<label><input type="checkbox" data-v25-access-user="${esc(p.userId)}" data-v25-access-module="${k}" ${p[prop]?'checked':''} ${owner?'disabled':''}> ${n}</label>`}).join('')}</div>${owner?'':`<div class="nexa-v25-buttons"><button class="nexa-v25-btn danger" data-v25-remove-access="${esc(p.userId)}">Remove from NEXA Access</button></div>`}</article>`;
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
 b.onclick=()=>{wrap.classList.remove('open');wrap.setAttribute('aria-hidden','true');const prev=wrap.dataset.nexaPreviousLayer;if(prev==='profile')$('#nexa-profile-modal')?.classList.add('open')};stage.prepend(b);
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
  const menuItem=e.target.closest('.nexa-home-menu-item');if(menuItem&&/library/i.test(menuItem.textContent||'')&&/ADMINISTRATION/i.test($('#nexa-home-menu-card')?.textContent||'')){e.preventDefault();e.stopImmediatePropagation();location.href='library.html?admin=1';return}
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
  const emb=e.target.closest('[data-v25-emblems]');if(emb){const a=getRows().find(x=>String(x.id)===String(emb.dataset.v25Emblems));if(a)await chooseEmblem(a);return}
  const copy=e.target.closest('[data-v25-copy-code]');if(copy){try{await navigator.clipboard.writeText(copy.dataset.v25CopyCode);await notice('Alliance Access Code','Copied to clipboard.')}catch{await notice('Alliance Access Code',copy.dataset.v25CopyCode)}return}
  const regen=e.target.closest('[data-v25-regenerate-code]');if(regen){if(await confirmV('Regenerate Alliance Access Code','Existing verified members stay verified. The old code will stop working for future verification.')){try{await rpc('nexa_regenerate_alliance_access_code',{p_alliance_id:Number(regen.dataset.v25RegenerateCode)});await activate('alliances')}catch(err){await notice('Alliance Access Code',err.message)}}return}
  const ma=e.target.closest('[data-v25-manage-access]');if(ma){await activate('access');const host=$('.nexa-v25-host',section('access'));if(host)await renderAccess(host,activationSeq,ma.dataset.v25ManageAccess);return}
  const account=e.target.closest('[data-v25-account]');if(account){if(typeof window.openAccountPassport==='function')window.openAccountPassport(account.dataset.v25Account);else await notice('Passport','Open this account from My Profile to view its full Passport.');return}
  const op=e.target.closest('[data-v25-op-user]');if(op){op.disabled=true;try{await rpc('nexa_set_operational_role',{p_user_id:op.dataset.v25OpUser,p_role:op.dataset.v25Op,p_enabled:op.checked})}catch(err){op.checked=!op.checked;await notice('Operational Role',err.message)}finally{op.disabled=false}return}
  const sel=e.target.closest('[data-v25-select-access]');if(sel){const p=accessCache.find(x=>String(x.userId)===String(sel.dataset.v25SelectAccess));if(p){showAccessPlayer(p);$('#v25-access-results').innerHTML=''}return}
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

  // MENU does not discard the current layer. Explicit destinations handle their own navigation.
 },true);

 document.addEventListener('input',e=>{
  if(e.target.id==='v25-access-search'){
   const q=clean(e.target.value).toLowerCase().trim(),out=$('#v25-access-results');if(!out)return;
   const hits=q?accessCache.filter(p=>clean(`${p.name} ${p.gameId}`).toLowerCase().includes(q)).slice(0,8):[];
   out.innerHTML=hits.map(p=>`<button class="nexa-v25-access-result" data-v25-select-access="${esc(p.userId)}"><b>${esc(clean(p.name||'Player'))}</b><div class="nexa-v25-muted">ID ${esc(p.gameId||'—')} · ${esc(p.allianceRole||'')}</div></button>`).join('');
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


async function v26OwnerToken(){try{return (await sb().auth.getSession()).data?.session?.access_token||''}catch{return''}}
async function v26SystemRequest(path,method='GET',body=null){const token=await v26OwnerToken();const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:body?JSON.stringify(body):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`Request failed (${r.status})`);return j}
async function v26BypassProbe(){try{const r=await fetch('/?nexa_bypass_probe='+Date.now(),{credentials:'same-origin',cache:'no-store'});return !/\/maintenance\.html(?:[?#]|$)/i.test(r.url||'')}catch{return false}}
async function v26LoadSystemOperations(){
 const sw=$('#maintenance-mode-switch'),state=$('#maintenance-mode-state'),msg=$('#system-operations-message');if(!sw||!state)return;sw.disabled=true;state.textContent='Checking status…';
 try{const d=await v26SystemRequest('/api/nexa-system-settings');sw.checked=!!d.maintenance_mode;if(d.maintenance_mode){const ok=await v26BypassProbe();state.textContent=ok?'Maintenance Mode is ON — Owner bypass verified on this device.':'Maintenance Mode is ON — Owner bypass is not verified. Turn Maintenance Mode OFF before leaving this screen.'}else state.textContent='Maintenance Mode is OFF — NEXA is publicly available.';if(msg)msg.textContent=''}catch(e){state.textContent=clean(e.message)}finally{sw.disabled=false}
}
async function v26ToggleMaintenance(sw){
 const wanted=!!sw.checked,state=$('#maintenance-mode-state');sw.disabled=true;
 try{
   const d=await v26SystemRequest('/api/nexa-system-settings','POST',{maintenance_mode:wanted});
   if(wanted){const ok=await v26BypassProbe();if(!ok){await v26SystemRequest('/api/nexa-system-settings','POST',{maintenance_mode:false}).catch(()=>{});sw.checked=false;throw new Error('Owner bypass could not be verified, so NEXA automatically returned Maintenance Mode to OFF.')}}
   sw.checked=!!d.maintenance_mode;state.textContent=wanted?'Maintenance Mode is ON — Owner bypass verified on this device.':'Maintenance Mode is OFF — public NEXA routes are available again.';
 }catch(e){sw.checked=false;state.textContent=clean(e.message||'Maintenance Mode could not be changed.')}finally{sw.disabled=false}
}
function v26MaintenanceGuard(){window.loadSystemOperations=v26LoadSystemOperations;document.addEventListener('change',e=>{if(e.target?.id==='maintenance-mode-switch'){e.preventDefault();e.stopImmediatePropagation();v26ToggleMaintenance(e.target)}},true)}
function v26GlobalPolish(){
 const authAlliance=$('#nexa-create-alliance');if(authAlliance){authAlliance.innerHTML='<option value="not-listed" selected>Profile setup</option>';authAlliance.value='not-listed';const label=authAlliance.closest('label');if(label)label.style.display='none';const custom=$('#nexa-custom-alliance-wrap');if(custom)custom.style.display='none';const ci=$('#nexa-create-custom-alliance');if(ci){ci.required=false;ci.value=''}}
 const authLogo=$('.nexa-auth-logo');if(authLogo&&!authLogo.querySelector('img'))authLogo.innerHTML='<img src="/nexa-icon.png" alt="NEXA" style="width:100%;height:100%;object-fit:contain">';
 const nativeStar=$('.logo .star.nexa-native-star');if(nativeStar&&!nativeStar.querySelector('img'))nativeStar.innerHTML='<img src="/nexa-icon.png" alt="" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 10px rgba(87,184,255,.75))">';
 const menu=$('#nexa-home-menu-toggle');if(menu){const span=menu.querySelector('span');if(span)span.textContent='MENU';menu.style.top='max(62px,calc(env(safe-area-inset-top) + 28px))'}
 $$('.nexa-home-menu-item').forEach(x=>{if(/permissions/i.test(x.textContent||''))x.textContent=(x.textContent||'').replace(/permissions/ig,'NEXA Access')});
 const brand=$('.brand-mark,.home-brand-mark,#home-brand-mark');if(brand && !brand.querySelector('img[data-nexa-logo-icon]')){brand.innerHTML='<img data-nexa-logo-icon src="/nexa-icon.png" alt="NEXA" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 12px rgba(88,180,255,.7))">'}
 document.documentElement.style.maxWidth='100%';document.documentElement.style.overflowX='hidden';document.body.style.maxWidth='100%';document.body.style.overflowX='hidden';
 const launcher=$('#nexa-home-profile-launcher,.nexa-home-profile-launcher');if(launcher)launcher.style.filter='drop-shadow(0 0 18px rgba(105,116,255,.9)) drop-shadow(0 0 34px rgba(122,70,255,.55))';
 $$('.nexa-account-planet,.nexa-constellation-account').forEach((el,i)=>{el.style.filter=i===0?'drop-shadow(0 0 22px rgba(104,121,255,.95)) drop-shadow(0 0 42px rgba(125,72,255,.6))':'drop-shadow(0 0 13px rgba(105,132,255,.55))'});
 // Fix mojibake left by older System Operations strings.
 ['#maintenance-mode-state','#system-operations-message','#home-event-meta','#home-visibility-message'].forEach(sel=>{const el=$(sel);if(el&&/Ã|â|Â/.test(el.textContent||''))el.textContent=clean(el.textContent)});
}
function v26Asteroids(){
 if($('#nexa-v26-asteroids'))return;const layer=document.createElement('div');layer.id='nexa-v26-asteroids';layer.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden';document.body.appendChild(layer);
 const shower=()=>{if(document.hidden)return;for(let i=0;i<5;i++){const a=document.createElement('i');a.style.cssText=`position:absolute;left:${-15-Math.random()*25}vw;top:${5+Math.random()*40}vh;width:${45+Math.random()*70}px;height:1px;background:linear-gradient(90deg,transparent,rgba(190,210,255,.75),white);filter:drop-shadow(0 0 5px #8398ff);transform:rotate(-22deg);opacity:.0;transition:transform 2.1s linear,opacity .25s`;layer.appendChild(a);setTimeout(()=>{a.style.opacity='.75';a.style.transform='translate(135vw,48vh) rotate(-22deg)'},i*120);setTimeout(()=>a.remove(),2600+i*120)}};
 setTimeout(shower,9000);setInterval(()=>{if(Math.random()>.55)shower()},45000);
}

async function v26CurrentUser(){try{return (await sb().auth.getUser()).data?.user||null}catch{return null}}
async function v26Accounts(){const u=await v26CurrentUser();if(!u)return[];const {data,error}=await sb().from('player_accounts').select('id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url,alliances(tag,emblem_url,color)').eq('user_id',u.id).order('created_at');if(error)return[];return data||[]}
function v26Avatar(a){return a?.profile_photo_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(a?.in_game_name||'NEXA')}&background=111a38&color=cabaff&bold=true&size=256`}
async function v26RefreshConstellation(){
 if(window.NEXA_CANONICAL_ACCOUNTS)return;
 const system=$('#nexa-constellation-system');if(!system)return;const rows=await v26Accounts();if(!rows.length)return;
 window.nexaAccountsCache=rows;const main=rows.find(a=>a.is_main)||rows[0],others=rows.filter(a=>a.id!==main.id),pos=[[50,14],[82,33],[84,67],[50,86],[16,67],[18,33]];
 let out='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';
 out+=`<button type="button" class="nexa-account-planet main nexa-v26-main" data-nexa-profile="${esc(main.id)}"><img src="${esc(v26Avatar(main))}" alt=""><span class="nexa-account-planet-name">${esc(main.in_game_name||'WOS Account')}</span><span class="nexa-account-planet-type">MAIN</span></button>`;
 others.forEach((a,i)=>{const q=pos[i%pos.length];out+=`<button type="button" class="nexa-account-planet alt nexa-v26-alt" style="left:${q[0]}%;top:${q[1]}%" data-nexa-profile="${esc(a.id)}"><img src="${esc(v26Avatar(a))}" alt=""><span class="nexa-account-planet-name">${esc(a.in_game_name||'Account')}</span><span class="nexa-account-planet-type">${esc(String(a.account_purpose||'full').toUpperCase())}</span></button>`});
 if(rows.length<5){const q=pos[Math.max(0,rows.length-1)%pos.length];out+=`<button type="button" id="nexa-constellation-add" class="nexa-account-planet alt nexa-add-planet" style="left:${q[0]}%;top:${q[1]}%"><span class="nexa-add-planet-symbol">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span></button>`}
 system.innerHTML=out;
 const photo=$('#nexa-profile-launcher-photo'),name=$('#nexa-profile-launcher-name'),badge=$('#nexa-profile-launcher-badge'),count=$('#nexa-profile-launcher-count');if(photo)photo.src=v26Avatar(main);if(name)name.textContent=(main.in_game_name||'MY PROFILE').toUpperCase();if(badge)badge.textContent='MAIN';if(count){const extra=Math.max(0,rows.length-1);count.textContent='+'+extra;count.classList.toggle('hidden',!extra)}
}
async function v26InjectProfileEditor(){
 const form=$('#nexa-profile-editor');if(!form||form.querySelector('#v26-edit-alliance'))return;const pid=$('#nexa-profile-player-id')?.textContent?.trim();if(!pid)return;const u=await v26CurrentUser();if(!u)return;
 const {data:account}=await sb().from('player_accounts').select('id,alliance_id,is_main').eq('user_id',u.id).eq('player_id',pid).maybeSingle();if(!account)return;
 const {data:als}=await sb().rpc('get_public_nexa_alliances');
 const block=document.createElement('div');block.id='v26-profile-alliance-block';block.style.cssText='display:grid;gap:8px;margin:12px 0;padding:12px;border:1px solid rgba(106,101,255,.24);border-radius:14px;background:rgba(9,14,35,.72)';
 block.innerHTML=`<label style="display:grid;gap:6px;font-weight:800">Alliance<select id="v26-edit-alliance" style="width:100%;padding:11px;border-radius:11px;background:#090f24;color:#fff;border:1px solid rgba(255,255,255,.16)"><option value="">Not Listed</option>${(als||[]).map(a=>`<option value="${a.id}" ${String(a.id)===String(account.alliance_id)?'selected':''}>${esc(a.tag)}${a.name?' · '+esc(a.name):''}</option>`).join('')}</select></label><div id="v26-alliance-code-wrap" hidden><label style="display:grid;gap:6px;font-weight:800">Alliance Access Code<input id="v26-alliance-code" autocomplete="off" placeholder="One-time verification code"></label><div class="nexa-v25-muted">This one-time code confirms that you are authorized to join the selected alliance in NEXA. You will only be asked again if you change alliances.</div></div><label style="display:flex;align-items:center;gap:8px"><input id="v26-set-main" type="checkbox" ${account.is_main?'checked disabled':''}> ${account.is_main?'This is your Main account':'Make this my Main account'}</label>`;
 const submit=form.querySelector('[type="submit"]');if(submit)form.insertBefore(block,submit);else form.appendChild(block);
 $('#nexa-edit-role')?.setAttribute('disabled','disabled');
 block.querySelector('#v26-edit-alliance').addEventListener('change',e=>{block.querySelector('#v26-alliance-code-wrap').hidden=String(e.target.value)===String(account.alliance_id)||!e.target.value});
 form.dataset.v26AccountId=account.id;form.dataset.v26AllianceId=account.alliance_id||'';form.dataset.v26IsMain=account.is_main?'1':'0';
}
async function v26SaveProfile(e){
 const form=e.target;if(form?.id!=='nexa-profile-editor'||!form.dataset.v26AccountId)return false;e.preventDefault();e.stopImmediatePropagation();
 try{
  const aid=form.dataset.v26AccountId,newAlliance=$('#v26-edit-alliance')?.value||'',oldAlliance=form.dataset.v26AllianceId||'';
  if(newAlliance && String(newAlliance)!==String(oldAlliance)){const code=$('#v26-alliance-code')?.value?.trim()||'';if(!code)throw new Error('Enter the Alliance Access Code to verify the new alliance.');await rpc('nexa_change_account_alliance',{p_account_id:aid,p_alliance_id:Number(newAlliance),p_access_code:code})}
  const payload={in_game_name:$('#nexa-edit-name')?.value?.trim()||'',furnace_level:$('#nexa-edit-furnace')?.value||null,power:Number(($('#nexa-edit-power')?.value||'').replace(/\D/g,''))||null,deployment_capacity:Number(($('#nexa-edit-deployment')?.value||'').replace(/\D/g,''))||null};
  const {error}=await sb().from('player_accounts').update(payload).eq('id',aid);if(error)throw error;
  if($('#v26-set-main')?.checked && form.dataset.v26IsMain!=='1')await rpc('nexa_set_main_account',{p_account_id:aid});
  form.classList.remove('open');await v26RefreshConstellation();await notice('Profile','Profile updated. Alliance verification and Main account changes are saved.');
  const sel=$('#v26-edit-alliance');if(sel){const txt=sel.options[sel.selectedIndex]?.textContent||'Not Listed';$('#nexa-profile-alliance').textContent=txt.split(' · ')[0]}
  $('#nexa-profile-name').textContent=(payload.in_game_name||'PLAYER').toUpperCase();return true;
 }catch(err){await notice('Profile',err.message||'Could not save profile.');return true}
}
async function v26DecorateProfile(){
 const pid=$('#nexa-profile-player-id')?.textContent?.trim();if(!pid)return;const u=await v26CurrentUser();if(!u)return;const {data:a}=await sb().from('player_accounts').select('alliance_id,alliances(tag,emblem_url,color)').eq('user_id',u.id).eq('player_id',pid).maybeSingle();if(!a)return;
 const alliance=$('#nexa-profile-alliance');if(alliance&&a.alliances?.emblem_url&&!$('#v26-profile-alliance-emblem')){const img=document.createElement('img');img.id='v26-profile-alliance-emblem';img.src=a.alliances.emblem_url;img.alt='Alliance emblem';img.style.cssText='width:26px;height:26px;object-fit:contain;vertical-align:middle;margin-right:6px;filter:drop-shadow(0 0 8px '+(a.alliances.color||'#7b61ff')+')';alliance.prepend(img)}
}

function v26FixTroopImages(){
 const c=$('#nexa-profile-content');if(!c)return;const activeTab=$('.nexa-profile-tab.active');if(String(activeTab?.dataset?.nexaTab||'').toLowerCase()!=='troops')return;
 const portraits=window.NEXA_TROOP_PORTRAITS||{};
 c.querySelectorAll('img').forEach(img=>{
   let node=img,box=null,type='';
   for(let i=0;i<6&&node;i++,node=node.parentElement){const t=clean(node.textContent).toLowerCase();for(const k of ['infantry','lancer','marksman'])if(t.includes(k)){box=node;type=k;break}if(type)break}
   if(!type||!box)return;
   let tier=1;const select=box.querySelector('select');const av=select?.value||box.querySelector('.active,[aria-pressed="true"]')?.textContent||box.textContent||'';const m=String(av).match(/(?:tier|t)?\s*(1[0-2]|[1-9])\b/i);if(m)tier=Number(m[1]);
   const src=portraits?.[type]?.['t'+tier];if(src&&img.getAttribute('src')!==src){img.src=src;img.classList.add('nexa-v25-troop-art');img.closest('span,div')?.classList.add('nexa-v25-troop-orbit')}
 });
}
function v26ProfileEvents(){
 document.addEventListener('submit',e=>{if(e.target?.id==='nexa-profile-editor'&&e.target.dataset.v26AccountId)v26SaveProfile(e)},true);
 document.addEventListener('click',e=>{
   if(e.target.closest('#nexa-profile-launcher'))setTimeout(v26RefreshConstellation,180);
   if(e.target.closest('[data-nexa-profile]')){const c=$('#nexa-account-constellation');if(c)c.dataset.nexaPreviousLayer='constellation';setTimeout(v26DecorateProfile,260)}
   if(e.target.closest('#nexa-profile-edit-btn'))setTimeout(v26InjectProfileEditor,80);
   if(e.target.closest('[data-nexa-tab="troops"]'))setTimeout(v26FixTroopImages,240);
   if(e.target.closest('#nexa-profile-content'))setTimeout(v26FixTroopImages,80);
   if(e.target.closest('[data-close-nexa-profile]'))return;
 },true);
}
const v26Obs=new MutationObserver(()=>requestAnimationFrame(v26GlobalPolish));
function v26Start(){v26MaintenanceGuard();v26GlobalPolish();v26Asteroids();v26ProfileEvents();setTimeout(v26RefreshConstellation,800);v26Obs.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();v26Start()},{once:true});else{bind();v26Start()}
})();
