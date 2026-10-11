/* NEXA Fleet Identity V1 — canonical identity/state/account controller — 2026-10-10 */
(()=>{
'use strict';
if(window.__NEXA_FLEET_IDENTITY_V1__)return;
window.__NEXA_FLEET_IDENTITY_V1__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let localSb=null;
let fleetCache=null;
let manageState=0;

function db(){
  try{ if(typeof supabaseClient!=='undefined'&&supabaseClient?.from)return supabaseClient; }catch(_){}
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.nexaAccountDataClient?.from)return window.nexaAccountDataClient;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}
function activeState(){
  const raw=window.NEXA_ACTIVE_STATE||localStorage.getItem('nexa_active_state_v49')||localStorage.getItem('nexa_active_state')||0;
  const n=Number(String(raw||'').replace(/\D/g,''));
  return Number.isFinite(n)&&n>0?n:0;
}
function activeAccountId(){
  return String(localStorage.getItem('nexa_active_account_v49')||window.NEXA_ACTIVE_ACCOUNT_ID||'');
}
function setLocalContext(a){
  if(!a)return;
  const state=Number(a.state_number||0);
  window.NEXA_ACTIVE_ACCOUNT_ID=String(a.account_id);
  window.NEXA_ACTIVE_STATE=state;
  document.documentElement.dataset.nexaState=String(state||'');
  try{
    localStorage.setItem('nexa_active_account_v49',String(a.account_id));
    localStorage.setItem('nexa_active_state_v49',String(state));
    localStorage.setItem('nexa_active_state',String(state));
  }catch(_){}
}
async function rpc(fn,args={}){
  const c=db();if(!c?.rpc)throw new Error('NEXA connection is not ready.');
  const {data,error}=await c.rpc(fn,args);
  if(error)throw error;
  return data;
}
async function fleet(force=false){
  if(fleetCache&&!force)return fleetCache;
  const d=await rpc('nexa_my_fleet_v1');
  if(!d?.ok)throw new Error(d?.error||'Unable to load NEXA Fleet.');
  fleetCache=d;
  return d;
}
function groupByState(accounts){
  const map=new Map();
  for(const a of accounts||[]){
    const st=Number(a.state_number||0);
    if(!map.has(st))map.set(st,[]);
    map.get(st).push(a);
  }
  return [...map.entries()].sort((a,b)=>a[0]-b[0]);
}
function avatar(a){
  return a?.profile_photo_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(a?.game_name||'NEXA')}&background=111a38&color=cabaff&bold=true&size=256`;
}
function ensureStyle(){
 if($('#nexa-fleet-identity-style'))return;
 const s=document.createElement('style');s.id='nexa-fleet-identity-style';s.textContent=`
 #nexa-fleet-identity-modal{position:fixed;inset:0;z-index:2147483600;display:none;overflow:auto;padding:18px;background:rgba(2,4,15,.90);backdrop-filter:blur(12px);color:#f8f7ff}
 #nexa-fleet-identity-modal.open{display:block}
 .nfi-shell{width:min(760px,100%);margin:3vh auto 70px;border:1px solid rgba(128,108,255,.38);border-radius:25px;background:radial-gradient(circle at 12% 0,rgba(103,70,255,.19),transparent 34%),linear-gradient(155deg,#0e1531,#070a19 75%);box-shadow:0 28px 90px rgba(0,0,0,.55);overflow:hidden}
 .nfi-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:20px;border-bottom:1px solid rgba(151,170,255,.18)} .nfi-head small{display:block;color:#67dcff;font-weight:950;letter-spacing:.14em}.nfi-head h2{margin:5px 0 3px;font-size:27px}.nfi-muted{color:#9da9c8;font-size:12px;line-height:1.45}.nfi-x{width:40px;height:40px;border-radius:50%;border:1px solid rgba(151,170,255,.25);background:#10162e;color:white;font-size:23px}
 .nfi-body{padding:17px}.nfi-state{border:1px solid rgba(151,170,255,.17);border-radius:20px;padding:14px;margin:12px 0;background:rgba(9,15,36,.72)}.nfi-state-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.nfi-state-head b{font-size:15px}.nfi-count{font-size:10px;color:#8ee8ff}
 .nfi-account{display:grid;grid-template-columns:52px 1fr;gap:11px;align-items:center;padding:11px;border-radius:16px;border:1px solid rgba(151,170,255,.13);background:rgba(13,20,46,.75);margin:8px 0}.nfi-account.active{border-color:rgba(99,232,199,.48);box-shadow:inset 4px 0 0 rgba(99,232,199,.72)}.nfi-account img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(130,116,255,.5)}.nfi-name{font-weight:950}.nfi-meta{font-size:10px;color:#9da9c8;margin-top:3px}.nfi-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.nfi-tag{font-size:9px;padding:4px 7px;border-radius:999px;border:1px solid rgba(151,170,255,.22);color:#cad4ef}.nfi-tag.main{color:#ff9ee8;border-color:rgba(255,101,220,.34)}.nfi-tag.primary{color:#91f1d3;border-color:rgba(89,222,181,.34)}
 .nfi-actions{grid-column:1/-1;display:flex;gap:7px;flex-wrap:wrap}.nfi-btn{border:1px solid rgba(125,142,255,.30);border-radius:11px;background:#111a38;color:#eef3ff;padding:8px 10px;font-size:10px;font-weight:900}.nfi-btn.primary{background:linear-gradient(135deg,#6648d4,#198db3)}.nfi-btn.warn{border-color:rgba(255,184,102,.32);color:#ffd1a2}.nfi-footer{display:grid;gap:9px;padding:17px;border-top:1px solid rgba(151,170,255,.18)}.nfi-footer .nfi-btn{min-height:42px}
 .nfi-account .nfi-delete{margin-left:auto;border-color:#e6689c;color:#ff9dbd}
 .nfi-status{min-height:18px;font-size:11px;color:#7ee6ff}
 `;
 s.textContent+=`#nexa-constellation-system .nexa-fleet-current-account{filter:drop-shadow(0 0 15px rgba(87,255,208,.9)) drop-shadow(0 0 24px rgba(87,255,208,.45))!important;outline:2px solid #6bffda!important;outline-offset:4px;border-radius:50%}#nexa-constellation-system .nexa-fleet-current-flag{display:block;position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#075e51;color:#d6fff5;border:1px solid #6bffda;border-radius:20px;padding:3px 7px;font-size:9px;font-weight:900;z-index:12;pointer-events:none}`;
 document.head.appendChild(s);
}
function ensureModal(){
 ensureStyle();
 let m=$('#nexa-fleet-identity-modal');
 if(m)return m;
 m=document.createElement('div');m.id='nexa-fleet-identity-modal';
 m.innerHTML=`<section class="nfi-shell"><header class="nfi-head"><div><small>NEXA FLEET IDENTITY</small><h2>My Accounts</h2><div class="nfi-muted">One person. Multiple States. Independent account context.</div></div><button class="nfi-x" data-nfi-close>×</button></header><div class="nfi-body" id="nfi-body"></div><footer class="nfi-footer"><button class="nfi-btn primary" data-nfi-add>＋ Add Existing Account</button><button class="nfi-btn" data-nfi-global-password>Global Fleet Password</button><div class="nfi-status" id="nfi-status"></div></footer></section>`;
 document.body.appendChild(m);
 m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-nfi-close]'))closeIdentityCenter();});
 m.querySelector('[data-nfi-add]').onclick=()=>{closeIdentityCenter();window.NEXA_OPEN_ACCOUNTS?.();};
 m.querySelector('[data-nfi-global-password]').onclick=configureGlobalPassword;
 return m;
}
function status(msg,bad=false){
 const el=$('#nfi-status');if(!el)return;el.textContent=msg||'';el.style.color=bad?'#ff9bb8':'#7ee6ff';
}
async function renderIdentityCenter(){
 const m=ensureModal(),body=m.querySelector('#nfi-body');
 body.innerHTML='<div class="nfi-muted">Loading Fleet…</div>';
 try{
  const d=await fleet(true),accounts=(d.accounts||[]).filter(a=>Number(a.state_number)===manageState),groups=groupByState(accounts),aid=activeAccountId();
  body.innerHTML=groups.map(([st,list])=>`<section class="nfi-state"><div class="nfi-state-head"><b>State ${esc(st||'—')}</b><span class="nfi-count">${list.length} ACCOUNT${list.length===1?'':'S'}</span></div>${list.map(a=>`<article class="nfi-account ${String(a.account_id)===aid?'active':''}" data-nfi-account="${esc(a.account_id)}"><img src="${esc(avatar(a))}" alt=""><div><div class="nfi-name">${esc(a.game_name||'Account')}</div><div class="nfi-meta">Game ID ${esc(a.game_id||'—')}</div><div class="nfi-tags">${a.is_main?'<span class="nfi-tag main">MAIN GLOBAL</span>':''}${a.is_state_primary?'<span class="nfi-tag primary">STATE PRIMARY</span>':''}${a.is_last_active?'<span class="nfi-tag">LAST ACTIVE</span>':''}</div></div><div class="nfi-actions">${a.is_state_primary?'':`<button class="nfi-btn" data-nfi-primary="${esc(a.account_id)}">Set State Primary</button>`}<button class="nfi-btn warn" data-nfi-move="${esc(a.account_id)}" data-current-state="${esc(st)}">Move State</button>${a.is_main||String(a.account_id)===aid?'':`<button class="nfi-btn nfi-delete" data-nfi-delete="${esc(a.account_id)}">× Delete Account</button>`}</div></article>`).join('')}</section>`).join('')||'<div class="nfi-muted">No linked accounts found.</div>';
  body.querySelectorAll('[data-nfi-delete]').forEach(b=>b.onclick=()=>deleteManagedAccount(b.dataset.nfiDelete));
  body.querySelectorAll('[data-nfi-switch]').forEach(b=>b.onclick=()=>switchAccount(b.dataset.nfiSwitch));
  body.querySelectorAll('[data-nfi-primary]').forEach(b=>b.onclick=()=>setStatePrimary(b.dataset.nfiPrimary));
  body.querySelectorAll('[data-nfi-move]').forEach(b=>b.onclick=()=>moveState(b.dataset.nfiMove,Number(b.dataset.currentState||0)));
 }catch(e){body.innerHTML=`<div class="nfi-muted">${esc(e.message||String(e))}</div>`;}
}
async function openIdentityCenter(state=activeState()){
  manageState=Number(state||0);
  if(!manageState){alert('Select a State before managing accounts.');return;}
  const m=ensureModal();m.querySelector('.nfi-head h2').textContent=`Manage Accounts · State ${manageState}`;
  m.classList.add('open');await renderIdentityCenter();
}
async function deleteManagedAccount(id){
 try{
  const d=await fleet(),a=(d.accounts||[]).find(x=>String(x.account_id)===String(id));
  if(!a||Number(a.state_number)!==manageState)throw new Error('Account does not belong to this State.');
  if(a.is_main||String(id)===activeAccountId())throw new Error('Switch to another account before deleting this one. Main Global accounts are protected.');
  if(!confirm(`Permanently delete ${a.game_name||'account'} (Game ID ${a.game_id}) from State ${manageState}? This removes its saved account data and cannot be undone.`))return;
  status('Deleting account…');await rpc('nexa_delete_player_account',{p_account_id:id});
  fleetCache=null;await renderIdentityCenter();status('Account deleted.');
 }catch(e){status(e.message||String(e),true);}
}
async function openAccountCard(id){
 try{
  const d=await fleet(),a=(d.accounts||[]).find(x=>String(x.account_id)===String(id)&&Number(x.state_number)===activeState());
  if(!a)return;
  let modal=$('#nexa-fleet-account-card');if(!modal){modal=document.createElement('div');modal.id='nexa-fleet-account-card';document.body.appendChild(modal);}
  modal.style.cssText='position:fixed;inset:0;z-index:2147483640;background:rgba(1,3,14,.91);display:flex;align-items:center;justify-content:center;padding:22px;color:white;backdrop-filter:blur(12px)';
  const current=String(a.account_id)===activeAccountId();
  modal.innerHTML=`<section style="width:min(410px,100%);background:#101630;border:1px solid #7562d4;border-radius:24px;padding:25px;text-align:center;box-shadow:0 0 60px #38237670"><button data-card-close style="float:right;background:transparent;color:white;border:0;font-size:28px">×</button><img src="${esc(avatar(a))}" alt="" style="width:94px;height:94px;border-radius:50%;object-fit:cover;border:3px solid ${current?'#5dfbd0':'#b37aff'};box-shadow:0 0 25px ${current?'#5dfbd0':'#b37aff'}"><h2>${esc(a.game_name||'Account')}</h2><p>State ${esc(a.state_number)} · Game ID ${esc(a.game_id)}</p><p style="color:#75f6d1">${current?'● CURRENT ACCOUNT':a.is_state_primary?'STATE PRIMARY':''}</p><button data-card-switch style="width:100%;padding:14px;border:0;border-radius:12px;background:${current?'#29344d':'linear-gradient(90deg,#7152df,#198cba)'};color:white;font-weight:900">${current?'Go to Home · Current Account':'Change to this account'}</button><button data-card-manage style="display:block;margin:16px auto 0;background:transparent;border:1px solid #7897db;border-radius:12px;color:white;padding:10px 18px">Manage Accounts</button></section>`;
  modal.querySelector('[data-card-close]').onclick=()=>modal.remove();
  modal.querySelector('[data-card-switch]').onclick=()=>{if(current){window.location.replace('/index.html');return;}switchAccount(id)};
  modal.querySelector('[data-card-manage]').onclick=()=>{modal.remove();openIdentityCenter(Number(a.state_number))};
 }catch(e){alert(e.message||String(e));}
}
function closeIdentityCenter(){ensureModal().classList.remove('open');}
async function switchAccount(id){
 try{
  status('Switching account…');
  const d=await fleet(),a=(d.accounts||[]).find(x=>String(x.account_id)===String(id));
  if(!a)throw new Error('Account not found.');
  const mark=await rpc('nexa_mark_active_account_v1',{p_player_account_id:id});
  if(mark?.ok===false)throw new Error(mark.error||'Unable to activate account.');
  setLocalContext(a);
  fleetCache=null;
  window.dispatchEvent(new CustomEvent('nexa:active-state-changed',{detail:{stateNumber:Number(a.state_number||0),source:'fleet-identity'}}));
  window.dispatchEvent(new CustomEvent('nexa:account-changed',{detail:{accountId:id,stateNumber:Number(a.state_number||0),source:'fleet-identity'}}));
  closeIdentityCenter();
  // One clean navigation prevents stale listeners repainting the old State.
  window.location.replace('/index.html');
 }catch(e){status(e.message||String(e),true);}
}
async function setStatePrimary(id){
 try{
  status('Updating State Primary…');
  const d=await rpc('nexa_set_state_primary_v1',{p_player_account_id:id});
  if(d?.ok===false)throw new Error(d.error||'Unable to update.');
  fleetCache=null;status('State Primary updated.');await renderIdentityCenter();
 }catch(e){status(e.message||String(e),true);}
}
async function moveState(id,current){
 const raw=prompt(`Move this account from State ${current} to which State?`,String(current||''));
 if(raw===null)return;
 const next=Number(String(raw).replace(/\D/g,''));
 if(!next||next===current){status('Enter a different valid State.',true);return;}
 const makePrimary=confirm(`Move this account to State ${next}.\n\nMake it the State Primary for ${next}?`);
 try{
  status('Moving account…');
  const d=await rpc('nexa_move_my_account_state_v1',{p_player_account_id:id,p_new_state:next,p_make_state_primary:makePrimary});
  if(d?.ok===false)throw new Error(d.error||'Unable to move account.');
  fleetCache=null;
  const f=await fleet(true),a=(f.accounts||[]).find(x=>String(x.account_id)===String(id));
  if(a&&String(id)===activeAccountId())setLocalContext(a);
  status(`Moved to State ${next}.`);
  await renderIdentityCenter();
 }catch(e){status(e.message||String(e),true);}
}
async function configureGlobalPassword(){
 const enable=confirm('Enable or change your Global Fleet Password?\n\nOK = Enable / Change\nCancel = Disable');
 if(!enable){
   if(!confirm('Disable the Global Fleet Password? Individual account passwords will remain unchanged.'))return;
   try{const d=await rpc('nexa_set_my_global_fleet_password_v1',{p_password:'',p_enabled:false});if(d?.ok===false)throw new Error(d.error||'Unable to disable.');status('Global Fleet Password disabled.');}catch(e){status(e.message||String(e),true);}
   return;
 }
 const p1=prompt('Create your Global Fleet Password (minimum 8 characters):','');
 if(p1===null)return;
 if(String(p1).length<8){status('Password must contain at least 8 characters.',true);return;}
 const p2=prompt('Repeat your Global Fleet Password:','');
 if(p2===null)return;
 if(p1!==p2){status('Passwords do not match.',true);return;}
 try{
  const d=await rpc('nexa_set_my_global_fleet_password_v1',{p_password:p1,p_enabled:true});
  if(d?.ok===false)throw new Error(d.error||'Unable to save password.');
  status('Global Fleet Password enabled.');
 }catch(e){status(e.message||String(e),true);}
}

/* Make Manage Accounts open the canonical Identity Center instead of another legacy account surface. */
document.addEventListener('click',e=>{
 const manage=e.target.closest?.('#nexa-constellation-manage-accounts');
 if(manage){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openIdentityCenter(activeState());return;}
},true);

document.addEventListener('click',e=>{
 const planet=e.target.closest?.('#nexa-constellation-system [data-account-constellation-id],#nexa-constellation-system [data-nexa-profile]');
 if(!planet)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 openAccountCard(planet.dataset.accountConstellationId||planet.dataset.nexaProfile);
},true);

/* Decorate current State constellation after any renderer paints it. */
async function decorate(){
 try{
  const d=await fleet(),state=activeState(),list=(d.accounts||[]).filter(a=>!state||Number(a.state_number)===state);
  const system=$('#nexa-constellation-system');if(!system)return;
  system.querySelectorAll('[data-nexa-profile],[data-account-constellation-id]').forEach(el=>{
   const id=el.dataset.nexaProfile||el.dataset.accountConstellationId;
   const a=list.find(x=>String(x.account_id)===String(id));
   if(!a){el.style.display='none';return;}
   el.style.removeProperty('display');
   const isCurrent=String(a.account_id)===activeAccountId() && Number(a.state_number)===state;
   el.classList.toggle('nexa-fleet-current-account',isCurrent);
   el.setAttribute('aria-label',`${a.game_name||'Account'} · State ${a.state_number} · Game ID ${a.game_id}${isCurrent?' · CURRENT ACCOUNT':''}`);
   const type=el.querySelector('.nexa-account-planet-type');
   if(type)type.textContent=isCurrent?'● CURRENT ACCOUNT':(a.is_state_primary?'STATE PRIMARY':(a.is_main?'MAIN GLOBAL':String(a.account_purpose||'full').toUpperCase()+' ACCOUNT'));
   let flag=el.querySelector('.nexa-fleet-current-flag');
   if(isCurrent&&!flag){flag=document.createElement('span');flag.className='nexa-fleet-current-flag';flag.textContent='● CURRENT ACCOUNT';el.appendChild(flag);}
   if(!isCurrent&&flag)flag.remove();
  });
 }catch(_){}
}
window.addEventListener('nexa:active-state-changed',()=>setTimeout(decorate,30));
window.addEventListener('nexa:account-changed',()=>setTimeout(decorate,30));

document.addEventListener('DOMContentLoaded',()=>{setTimeout(decorate,500);});

window.NEXA_OPEN_IDENTITY_CENTER=openIdentityCenter;
window.NEXA_FLEET_REFRESH=async()=>{fleetCache=null;return fleet(true);};
})();
