/* NEXA V49.7 — CLEAN ADMIN DIRECTORY / LEGACY UI PURGE
   NEW FILE: nexa-v49-state-hub.js

   Owns:
   - persistent active State across Fleet -> Constellation -> Profile -> Home
   - State-scoped Home Live Event + Transfer data
   - Add State to Fleet: Join Existing State Hub / Start a State Hub
   - State Hub activation by one additional admin Game ID
   - Constellation account creation restricted to the current State
   - Delete Account, including Main, with automatic Main reassignment
   - Remove State from Fleet with destructive warning
   - Administration -> NEXA Access = Administrative Access only
   - Administration -> Roles = Operational Roles + Battle Roles
   - state-scoped Operational Roles and Battle Roles
   - circled-i guides for both role sections

   Does NOT own My Profile inventory/cards.
   No MutationObserver.
   No polling.
   No touchmove preventDefault.
   No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V497_STATE_HUB__) return;
window.__NEXA_V497_STATE_HUB__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const ACTIVE_STATE_KEY='nexa_active_state_v49';
const ACTIVE_ACCOUNT_KEY='nexa_active_account_v49';
const ALLIANCE_EMBLEMS=[
  '/assets/nexa/alliances/Alliance_01_Stellar_Guardians.png',
  '/assets/nexa/alliances/Alliance_02_Celestial_Legion.png',
  '/assets/nexa/alliances/Alliance_03_Obsidian_Syndicate.png',
  '/assets/nexa/alliances/Alliance_04_Nova_Empire.png',
  '/assets/nexa/alliances/Alliance_05_Eclipse_Order.png',
  '/assets/nexa/alliances/Alliance_06_Dragonis_Clan.png',
  '/assets/nexa/alliances/Alliance_07_Veridian_Covenant.png',
  '/assets/nexa/alliances/Alliance_08_Infinite_Horizon.png',
  '/assets/nexa/alliances/Alliance_09_Solar_Vanguard.png',
  '/assets/nexa/alliances/Alliance_10_Lost_Protocol.png'
];
let localSb=null;
let cachedAccounts=[];
let booted=false;

function sb(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}
async function rpc(name,args={}){
  const c=sb();if(!c)throw new Error('NEXA could not connect to Supabase.');
  const {data,error}=await c.rpc(name,args);
  if(error)throw error;
  return data;
}
function stateNum(v){
  const n=Number(String(v??'').replace(/\D/g,''));
  return Number.isFinite(n)&&n>0?n:0;
}
function activeState(){
  return stateNum(window.NEXA_ACTIVE_STATE||localStorage.getItem(ACTIVE_STATE_KEY)||0);
}
function setActiveState(value,{emit=true}={}){
  const n=stateNum(value);if(!n)return 0;
  window.NEXA_ACTIVE_STATE=n;
  localStorage.setItem(ACTIVE_STATE_KEY,String(n));
  document.documentElement.dataset.nexaState=String(n);
  const c=sb();
  if(c?.rpc)c.rpc('nexa_set_active_state',{p_state:n}).then(()=>{}).catch(()=>{});
  if(emit)window.dispatchEvent(new CustomEvent('nexa:active-state-changed',{detail:{stateNumber:n}}));
  updateStateLabels(n);
  return n;
}
function setActiveAccount(id){
  const v=String(id||'');
  window.NEXA_ACTIVE_ACCOUNT_ID=v;
  if(v)localStorage.setItem(ACTIVE_ACCOUNT_KEY,v);else localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
}
async function ownAccounts(){
  const c=sb();if(!c)return [];
  const {data:{user}}=await c.auth.getUser();if(!user)return [];
  const {data,error}=await c.from('player_accounts')
    .select('id,user_id,in_game_name,player_id,is_main,state_number,alliance_id,custom_alliance_tag,alliance_verified_at,alliances(tag)')
    .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at');
  if(error)throw error;
  cachedAccounts=data||[];
  return cachedAccounts;
}
async function restoreActiveContext(){
  const rows=await ownAccounts();
  if(!rows.length)return;
  const states=new Set(rows.map(x=>stateNum(x.state_number)).filter(Boolean));
  let st=activeState();
  if(!states.has(st)){
    const main=rows.find(x=>x.is_main)||rows[0];
    st=stateNum(main?.state_number);
  }
  setActiveState(st,{emit:false});
  let aid=String(localStorage.getItem(ACTIVE_ACCOUNT_KEY)||window.NEXA_ACTIVE_ACCOUNT_ID||'');
  let account=rows.find(x=>String(x.id)===aid&&stateNum(x.state_number)===st);
  if(!account)account=rows.find(x=>stateNum(x.state_number)===st&&x.is_main)||rows.find(x=>stateNum(x.state_number)===st);
  if(account)setActiveAccount(account.id);
}

function installCSS(){
  if($('#nexa-v49-state-css'))return;
  const s=document.createElement('style');s.id='nexa-v49-state-css';
  s.textContent=`
  /* Account Manager: State belongs to the selected Fleet and Alliance belongs to Profile. */
  #accounts-modal label:has(#account-state),
  #accounts-modal label:has(#alliance),
  #accounts-modal label:has(#custom-alliance){display:none!important}
  #accounts-modal .nexa-v49-account-note{
    margin:8px 0 14px;padding:10px 12px;border:1px solid rgba(83,217,255,.20);
    border-radius:12px;background:rgba(7,26,52,.56);color:#a9bbdc;font-size:.76rem;line-height:1.4
  }
  #accounts-modal .nexa-v49-account-note b{color:#74e2ff}
  .nexa-v49-fleet-group{position:relative;display:grid;gap:5px}
  .nexa-v49-remove-state{
    justify-self:end;border:1px solid rgba(255,102,145,.38);border-radius:999px;padding:6px 10px;
    background:rgba(54,8,28,.72);color:#ffabc1;font-size:9px;font-weight:950;letter-spacing:.05em
  }
  .nexa-v49-add-state{
    width:100%;margin-top:12px;border:1px dashed rgba(82,215,255,.48);border-radius:18px;padding:15px;
    background:linear-gradient(145deg,rgba(8,28,53,.82),rgba(20,10,50,.82));color:#a8efff;font-weight:950;
    letter-spacing:.05em;box-shadow:0 0 20px rgba(57,205,255,.08)
  }
  .nexa-v49-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;
    background:rgba(0,2,13,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
  .nexa-v49-dialog{width:min(540px,100%);max-height:88dvh;overflow:auto;box-sizing:border-box;padding:19px;
    border:1px solid rgba(112,100,255,.44);border-radius:24px;color:#fff;
    background:radial-gradient(circle at 10% 0%,rgba(63,199,255,.13),transparent 32%),
      radial-gradient(circle at 95% 100%,rgba(187,75,255,.14),transparent 35%),
      linear-gradient(155deg,#0b1531,#050817);
    box-shadow:0 30px 90px rgba(0,0,0,.65),0 0 30px rgba(91,79,255,.13)}
  .nexa-v49-dialog h3{margin:0 36px 7px 0;font-size:1.25rem}.nexa-v49-dialog p{color:#aab6d2;line-height:1.48;font-size:.84rem}
  .nexa-v49-close{float:right;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.14);
    background:#0c1330;color:#fff;font-weight:950}
  .nexa-v49-choice{display:grid;gap:9px;margin-top:14px}
  .nexa-v49-choice button,.nexa-v49-primary,.nexa-v49-secondary,.nexa-v49-danger{
    width:100%;box-sizing:border-box;padding:12px 13px;border-radius:13px;font-weight:900;color:#fff
  }
  .nexa-v49-choice button,.nexa-v49-primary{border:1px solid rgba(76,211,255,.42);background:linear-gradient(135deg,#14386f,#352466)}
  .nexa-v49-secondary{border:1px solid rgba(144,112,255,.35);background:#0d1532}
  .nexa-v49-danger{border:1px solid rgba(255,94,133,.52);background:linear-gradient(135deg,#471127,#2b0b22);color:#ffd1dd}
  .nexa-v49-field{display:grid;gap:6px;margin-top:11px;color:#dce7ff;font-size:.78rem;font-weight:850}
  .nexa-v49-field input,.nexa-v49-field select,.nexa-v49-field textarea{
    width:100%;box-sizing:border-box;padding:11px 12px;border-radius:12px;border:1px solid rgba(123,143,213,.28);
    background:#081126;color:#fff;font:inherit
  }
  .nexa-v49-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.nexa-v49-actions>*{flex:1}
  .nexa-v49-status{margin-top:9px;min-height:18px;color:#7fe6ff;font-size:.77rem;line-height:1.4}
  .nexa-v49-warning{margin:11px 0;padding:11px;border:1px solid rgba(255,152,76,.28);border-radius:12px;
    background:rgba(70,34,10,.28);color:#ffd2ac;font-size:.78rem;line-height:1.45}

  /* V49.6 — Access/Roles are visual member directories. Legacy checklist/form UI is not an owner. */
  #admin-permissions,#admin-roles{position:relative!important}
  #admin-permissions>.nexa-v49-admin-host,
  #admin-roles>.nexa-v49-admin-host{
    display:block!important;
    position:relative!important;
    z-index:40!important;
    width:100%!important;
    min-height:220px!important
  }
  #admin-permissions>.nexa-v25-host,
  #admin-roles>.nexa-v25-host,
  #admin-permissions>.nexa-v27-role-card,
  #admin-roles>.nexa-v27-role-card{display:none!important}
  .nexa-v49-admin-host{min-height:220px}
  .nexa-v49-panel{border:1px solid rgba(132,95,255,.27);border-radius:18px;padding:14px;margin-bottom:11px;
    background:linear-gradient(145deg,rgba(14,19,46,.88),rgba(5,9,24,.94));color:#fff}
  .nexa-v49-panel h3,.nexa-v49-panel h4{margin:0 0 5px}.nexa-v49-muted{color:#929fbe;font-size:.79rem;line-height:1.45}
  .nexa-v49-heading{display:flex;align-items:center;gap:8px}.nexa-v49-info{
    width:26px;height:26px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(82,211,255,.46);
    background:#071a34;color:#7de6ff;font-weight:950
  }
  .nexa-v49-searchrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-top:12px}
  .nexa-v49-searchrow input,.nexa-v49-searchrow select{
    min-width:0;padding:10px 11px;border:1px solid rgba(124,143,205,.26);border-radius:11px;background:#081027;color:#fff
  }
  .nexa-v49-searchrow button,.nexa-v49-mini{
    border:1px solid rgba(99,204,255,.34);border-radius:10px;padding:9px 11px;background:#101a39;color:#fff;font-weight:850
  }
  .nexa-v49-person{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-top:1px solid rgba(255,255,255,.07)}
  .nexa-v49-person:first-child{border-top:0}.nexa-v49-person b,.nexa-v49-person small{display:block}.nexa-v49-person small{color:#8996b5}
  .nexa-v49-x{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,101,141,.34);background:#230b1b;color:#ffabc0;font-weight:950}
  .nexa-v49-rolegrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}
  .nexa-v49-rolecard{border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:11px;background:#081027}
  .nexa-v49-rolecard h4{font-size:.88rem}.nexa-v49-copyrow{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:10px 0}
  .nexa-v49-role-section{border:1px solid rgba(125,95,255,.24);border-radius:17px;padding:12px;margin-top:10px;background:rgba(7,13,31,.78)}
  .nexa-v49-role-section-head{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:8px}
  .nexa-v49-role-section-head h4{margin:0;font-size:.98rem}
  #admin-roles>.nexa-v49-admin-host{display:block!important;width:100%!important}
  #admin-roles>.nexa-v49-admin-host .nexa-v49-panel{display:block!important}
  #admin-roles>.nexa-v49-admin-host .nexa-v49-role-section{display:block!important}
  .nexa-v49-member-list{display:grid;gap:8px}
  .nexa-v49-member-card{
    display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:11px;align-items:center;
    padding:11px;border:1px solid rgba(111,126,255,.23);border-radius:16px;
    background:
      radial-gradient(circle at 8% 20%,rgba(64,211,255,.09),transparent 32%),
      linear-gradient(145deg,rgba(10,18,43,.96),rgba(5,9,25,.98));
    box-shadow:inset 0 0 18px rgba(81,93,255,.035),0 0 14px rgba(74,113,255,.045)
  }
  .nexa-v49-member-avatar{
    width:54px;height:54px;border-radius:50%;object-fit:cover;
    border:2px solid rgba(111,199,255,.62);background:#101733;
    box-shadow:0 0 12px rgba(64,205,255,.18),0 0 20px rgba(121,76,255,.10)
  }
  .nexa-v49-member-copy{min-width:0}
  .nexa-v49-member-copy b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .nexa-v49-member-copy small{display:block;margin-top:2px;color:#8f9ab8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .nexa-v49-addmember{border:1px solid rgba(82,215,255,.34);border-radius:10px;padding:8px 10px;background:#0d1c39;color:#9beaff;font-size:.72rem;font-weight:900;white-space:nowrap}
  .nexa-v49-empty{padding:12px;border:1px dashed rgba(140,150,200,.18);border-radius:12px;color:#7f8ba9;text-align:center;font-size:.77rem}
  .nexa-v49-emblem-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
  .nexa-v49-emblem{position:relative;aspect-ratio:1;border:1px solid rgba(255,255,255,.13);border-radius:15px;background:#081027;padding:7px;display:grid;place-items:center;overflow:hidden}
  .nexa-v49-emblem img{width:100%;height:100%;object-fit:contain}
  .nexa-v49-emblem.used{opacity:.30;filter:grayscale(.8)}
  .nexa-v49-emblem.current{border-color:#62dcff;box-shadow:0 0 18px rgba(98,220,255,.25)}
  .nexa-v49-copyrow select{flex:1;min-width:150px;padding:9px;border-radius:10px;background:#081027;color:#fff;border:1px solid rgba(255,255,255,.12)}
  @media(max-width:560px){.nexa-v49-rolegrid{grid-template-columns:1fr}.nexa-v49-searchrow{grid-template-columns:1fr}.nexa-v49-actions{display:grid}}
  `;
  document.head.appendChild(s);
}

function refreshHomeVisualOwner(){
  try{window.NEXA_HOME_VISUALS_REFRESH?.()}catch(_){}
}

function updateStateLabels(st=activeState()){
  if(!st)return;
  const transferHead=$('#home-transfers-section .head span');
  if(transferHead)transferHead.textContent=`State ${st}`;
  const liveHead=$('#home-svs-section .head span');
  if(liveHead)liveHead.textContent=`State ${st}`;
  const footer=$('#home .footer')||$('.footer');
  if(footer){
    const html=footer.innerHTML;
    footer.innerHTML=html
      .replace(/Your state\. One hub\. Everything connected\./i,'Your state. One hub. Everything connected.')
      .replace(/NEXA(?:\s*[•·]\s*|\s+)State\s+\d+/i,`NEXA • State ${st}`);
  }
}

async function hubStatus(st=activeState()){
  if(!st)return null;
  const c=sb();if(!c)return null;
  const {data,error}=await c.from('state_hubs').select('state_number,status,created_by,activated_at').eq('state_number',st).maybeSingle();
  if(error)throw error;
  return data||null;
}

function liveEmpty(st){
  const title=$('#home-event-title'),meta=$('#home-event-meta'),count=$('#home-event-countdown');
  if(title)title.textContent='No Live Event';
  if(meta)meta.textContent=`No active event published for State ${st}.`;
  if(count)count.textContent='—';
}
function transferEmpty(st){
  let host=$('#home-transfer-events');
  if(!host){refreshHomeVisualOwner();host=$('#home-transfer-events')}
  if(!host)return;
  host.innerHTML=`<article class="event"><div class="event-row"><div><h3>Transfer Center</h3><div class="muted">Transfer cycles and recruiting information for State ${esc(st)} will appear here when active.</div></div></div></article>`;
}
async function syncStateHome(){
  const st=activeState();if(!st)return;
  refreshHomeVisualOwner();
  updateStateLabels(st);
  const c=sb();if(!c)return;
  try{
    const hub=await hubStatus(st);
    if(hub&&hub.status==='pending_setup'){
      const t=$('#home-event-title'),m=$('#home-event-meta');
      if(t)t.textContent='State Hub Setup Incomplete';
      if(m)m.textContent=`State ${st} needs one additional admin confirmation before full activation.`;
      transferEmpty(st);
      refreshHomeVisualOwner();
      return;
    }
    const [{data:live,error:le},{data:trans,error:te}]=await Promise.all([
      c.from('svs_events').select('*').eq('state_number',st).eq('is_live',true).order('updated_at',{ascending:false}).limit(1).maybeSingle(),
      c.from('transfer_events').select('*').eq('destination_state',st).order('updated_at',{ascending:false}).limit(1).maybeSingle()
    ]);
    if(le)throw le;if(te)throw te;
    if(live){
      const title=$('#home-event-title'),meta=$('#home-event-meta'),count=$('#home-event-countdown');
      if(title)title.textContent=live.title||`SvS vs State ${live.opponent_state||'—'}`;
      if(meta)meta.textContent=`State ${st} • ${live.description||'Live Event'}`;
      if(count)count.textContent='LIVE';
    }else liveEmpty(st);

    const host=$('#home-transfer-events');
    if(host){
      if(trans){
        const status=String(trans.status||'upcoming').replace(/_/g,' ').toUpperCase();
        host.innerHTML=`<article class="event"><div class="event-row"><div><h3>${esc(trans.title||'Transfer Center')}</h3><div class="muted">State ${esc(st)} • ${esc(status)}${trans.applications_open?' • Applications Open':''}</div></div></div></article>`;
      }else transferEmpty(st);
    }
    refreshHomeVisualOwner();
  }catch(err){console.warn('[NEXA V49] state home',err?.message||err)}
}

function accountFormForState(){
  const form=$('#account-form');if(!form)return;
  const st=activeState();
  const state=$('#account-state',form);
  if(state){state.value=st?String(st):'';state.required=false}
  const alliance=$('#alliance',form);if(alliance){alliance.value='';alliance.required=false}
  const custom=$('#custom-alliance',form);if(custom){custom.value='';custom.required=false}
  let note=$('.nexa-v49-account-note',form);
  if(!note){
    note=document.createElement('div');note.className='nexa-v49-account-note';
    const submit=form.querySelector('[type="submit"]');
    submit?.before(note);
  }
  note.innerHTML=`<b>State ${esc(st||'—')}</b> • New accounts created here belong only to this State. Alliance is selected later from Edit Profile.`;
}

async function enhanceAccountManager(){
  accountFormForState();
  const list=$('#accounts-list');if(!list)return;
  const st=activeState();
  let visible=0;
  $$('.claimed-account',list).forEach(card=>{
    const text=String(card.textContent||'');
    const match=text.match(/State\s+(\d+)/i);
    const same=!match||stateNum(match[1])===st;
    card.style.display=same?'':'none';
    if(same)visible++;
  });
  const count=$('#account-count');
  if(count)count.textContent=`${visible} ACCOUNT${visible===1?'':'S'} • STATE ${st||'—'}`;
  const title=$('#accounts-modal .modal-head h2');
  if(title&&title.firstChild)title.firstChild.nodeValue='WOS Accounts ';
  $$('[data-v4483-delete]',list).forEach(btn=>{
    btn.dataset.v49DeleteAccount=btn.dataset.v4483Delete;
    btn.removeAttribute('data-v4483-delete');
  });
  try{
    const hub=await hubStatus(st);
    const form=$('#account-form'),edit=String($('#edit-account-id',form)?.value||'');
    const submit=form?.querySelector('[type="submit"]');
    if(submit){
      const locked=hub?.status!=='active'&&!edit;
      submit.disabled=!!locked;
      submit.title=locked?'This State Hub must be Active before additional personal accounts can be created.':'';
    }
    const note=$('.nexa-v49-account-note',form);
    if(note&&hub?.status!=='active')note.innerHTML+=`<br><span style="color:#ffd09b">Hub status: ${esc(String(hub?.status||'not active').replace(/_/g,' ').toUpperCase())}. Additional personal accounts stay locked until activation.</span>`;
  }catch(_){}
}

function dialog(html){
  $('.nexa-v49-overlay')?.remove();
  const ov=document.createElement('div');ov.className='nexa-v49-overlay';
  ov.innerHTML=`<section class="nexa-v49-dialog">${html}</section>`;
  document.body.appendChild(ov);
  $('.nexa-v49-close',ov)?.addEventListener('click',()=>ov.remove());
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  return ov;
}
function choiceDialog(){
  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Add State to Fleet</h3>
    <p>Your NEXA login can connect to multiple State Hubs. Personal accounts can only be created in an active State Hub.</p>
    <div class="nexa-v49-choice">
      <button type="button" data-v49-join-hub>JOIN AN EXISTING STATE HUB</button>
      <button type="button" data-v49-start-hub>START A STATE HUB</button>
    </div>`);
  $('[data-v49-join-hub]',ov).onclick=()=>joinHubDialog();
  $('[data-v49-start-hub]',ov).onclick=()=>startHubDialog();
}
async function activeHubSet(){
  const rows=await rpc('nexa_list_active_state_hubs');
  return new Set((rows||[]).map(x=>stateNum(x.state_number)));
}
function joinHubDialog(){
  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Join an Existing State Hub</h3>
    <p>Create your first account for an active State Hub. If you were invited as the required second admin for a Hub still in Setup, your matching Player ID can also enter here.</p>
    <label class="nexa-v49-field">State<input id="v49-join-state" inputmode="numeric" placeholder="1517"></label>
    <label class="nexa-v49-field">In-game Name<input id="v49-join-name" maxlength="40" placeholder="Your WOS name"></label>
    <label class="nexa-v49-field">Player ID<input id="v49-join-id" inputmode="numeric" placeholder="Numbers only"></label>
    <div class="nexa-v49-actions"><button class="nexa-v49-primary" data-go>CREATE STATE ACCOUNT</button></div>
    <div class="nexa-v49-status"></div>`);
  $('[data-go]',ov).onclick=async()=>{
    const status=$('.nexa-v49-status',ov);status.textContent='Checking State Hub…';
    try{
      const st=stateNum($('#v49-join-state',ov).value);
      const name=$('#v49-join-name',ov).value.trim();
      const pid=$('#v49-join-id',ov).value.replace(/\D/g,'');
      const id=await rpc('nexa_create_state_account',{p_state:st,p_in_game_name:name,p_player_id:pid});
      setActiveState(st);setActiveAccount(id);
      status.textContent='Account created. Opening your new State Fleet…';
      setTimeout(()=>location.reload(),350);
    }catch(e){status.textContent=e.message||String(e)}
  };
}
function startHubDialog(){
  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Start a State Hub</h3>
    <p>You will become the Founding Admin. The Hub stays in Setup until one additional admin accepts your invitation.</p>
    <label class="nexa-v49-field">State<input id="v49-start-state" inputmode="numeric" placeholder="1517"></label>
    <label class="nexa-v49-field">In-game Name<input id="v49-start-name" maxlength="40"></label>
    <label class="nexa-v49-field">Player ID<input id="v49-start-id" inputmode="numeric" placeholder="Numbers only"></label>
    <div class="nexa-v49-warning"><b>Activation requirement:</b> Add at least one additional administrator. We strongly recommend an R5 or alliance leader from a different alliance. This requirement is only for Hub activation; after activation you may manage additional admins from Administration → NEXA Access.</div>
    <div class="nexa-v49-actions"><button class="nexa-v49-primary" data-go>START HUB</button></div>
    <div class="nexa-v49-status"></div>`);
  $('[data-go]',ov).onclick=async()=>{
    const status=$('.nexa-v49-status',ov);status.textContent='Creating State Hub…';
    try{
      const st=stateNum($('#v49-start-state',ov).value);
      const name=$('#v49-start-name',ov).value.trim();
      const pid=$('#v49-start-id',ov).value.replace(/\D/g,'');
      const id=await rpc('nexa_start_state_hub',{p_state:st,p_in_game_name:name,p_player_id:pid});
      setActiveState(st);setActiveAccount(id);
      secondAdminDialog(st);
    }catch(e){status.textContent=e.message||String(e)}
  };
}
function secondAdminDialog(st){
  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Add a Second Admin</h3>
    <p>State ${esc(st)} is created, but the State Hub is not fully active yet.</p>
    <div class="nexa-v49-warning">Enter the Game ID of the additional admin. Let that person know they must create/sign in to their NEXA account for State ${esc(st)} and accept the Admin invitation.</div>
    <label class="nexa-v49-field">Second Admin Game ID<input id="v49-admin-id" inputmode="numeric" placeholder="Numbers only"></label>
    <div class="nexa-v49-actions"><button class="nexa-v49-primary" data-send>SEND ADMIN INVITE</button></div>
    <div class="nexa-v49-status"></div>`);
  $('[data-send]',ov).onclick=async()=>{
    const status=$('.nexa-v49-status',ov);
    try{
      const pid=$('#v49-admin-id',ov).value.replace(/\D/g,'');
      await rpc('nexa_invite_state_admin',{p_state:st,p_game_id:pid});
      status.textContent='Invitation saved. The Hub will become Active after that player accepts.';
    }catch(e){status.textContent=e.message||String(e)}
  };
}

async function removeState(st){
  const rows=await ownAccounts();
  const n=rows.filter(x=>stateNum(x.state_number)===st).length;

  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Remove State ${esc(st)} from Fleet?</h3>
    <p>This will permanently delete your <b>${esc(n)} NEXA account${n===1?'':'s'}</b> and saved account data for State ${esc(st)}.</p>
    <div class="nexa-v49-warning"><b>Only want to delete one account?</b><br>Open State ${esc(st)} and choose <b>Delete Account</b> instead.</div>
    <p>This removes State ${esc(st)} only from <b>your NEXA Fleet</b>. It does not delete the State Hub for other players.</p>
    <div class="nexa-v49-actions">
      <button class="nexa-v49-secondary" type="button" data-v49-cancel-remove>CANCEL</button>
      <button class="nexa-v49-danger" type="button" data-v49-confirm-remove>REMOVE STATE</button>
    </div>
    <div class="nexa-v49-status"></div>`);

  $('[data-v49-cancel-remove]',ov).onclick=()=>ov.remove();
  $('[data-v49-confirm-remove]',ov).onclick=async()=>{
    const status=$('.nexa-v49-status',ov);
    const btn=$('[data-v49-confirm-remove]',ov);
    btn.disabled=true;
    status.textContent=`Removing State ${st} from your Fleet…`;
    try{
      await rpc('nexa_remove_state_from_fleet',{p_state:st});
      const left=await ownAccounts();
      const next=left.find(x=>x.is_main)||left[0];
      if(next){setActiveState(next.state_number);setActiveAccount(next.id)}
      else{localStorage.removeItem(ACTIVE_STATE_KEY);setActiveAccount('')}
      location.reload();
    }catch(e){
      btn.disabled=false;
      status.textContent=e.message||String(e);
    }
  };
}
async function deleteAccount(id){
  const rows=await ownAccounts(),a=rows.find(x=>String(x.id)===String(id));if(!a)return;
  const ok=confirm(`DELETE ACCOUNT?\n\n${a.in_game_name||'Game Account'}\nID ${a.player_id||'—'} • State ${a.state_number||'—'}\n\nThis permanently deletes this account's Profile, Battle Data, inventory and other saved account data.\n\nOther accounts in State ${a.state_number||'—'} will remain.\n\nThis action cannot be undone.`);
  if(!ok)return;
  try{
    await rpc('nexa_delete_player_account',{p_account_id:a.id});
    const left=await ownAccounts();
    const same=left.find(x=>stateNum(x.state_number)===activeState());
    const next=same||left.find(x=>x.is_main)||left[0];
    if(next){setActiveState(next.state_number);setActiveAccount(next.id)}
    else{localStorage.removeItem(ACTIVE_STATE_KEY);setActiveAccount('')}
    location.reload();
  }catch(e){alert(e.message||String(e))}
}

function scheduleV49Enhancers(){
  [260,700,1400].forEach(ms=>setTimeout(()=>{
    enhanceFleet();
    enhanceAccountManager();
    relabelOperationalRolesUI();
  },ms));
}

async function enhanceFleet(){
  const ov=$('#nexa-v4484-fleet'),list=$('[data-fleet-list]',ov);if(!ov||!list)return;
  $$('[data-fleet-state]',list).forEach(ship=>{
    if(ship.closest('.nexa-v49-fleet-group'))return;
    const st=stateNum(ship.dataset.fleetState);
    const wrap=document.createElement('div');wrap.className='nexa-v49-fleet-group';
    ship.parentNode.insertBefore(wrap,ship);wrap.appendChild(ship);
    const remove=document.createElement('button');remove.type='button';remove.className='nexa-v49-remove-state';
    remove.dataset.v49RemoveState=String(st);remove.innerHTML='× REMOVE STATE';
    wrap.appendChild(remove);
  });
  if(!$('[data-v49-add-state]',list)){
    const add=document.createElement('button');add.type='button';add.className='nexa-v49-add-state';
    add.dataset.v49AddState='1';add.textContent='+ ADD STATE TO FLEET';
    list.appendChild(add);
  }
}

async function selectStateAccount(st){
  const rows=await ownAccounts();
  const a=rows.find(x=>stateNum(x.state_number)===st&&x.is_main)||rows.find(x=>stateNum(x.state_number)===st);
  if(a)setActiveAccount(a.id);
}

async function adminSearch(query){
  return await rpc('nexa_search_state_players_v2',{p_state:activeState(),p_query:String(query||'')})||[];
}
function memberAvatar(p){
  return String(p?.profile_photo_url||'').trim() ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(String(p?.in_game_name||'NEXA'))}`;
}
function memberMeta(p){
  return [p?.alliance_tag||'No Alliance',p?.alliance_role||'—',p?.player_id?`ID ${p.player_id}`:''].filter(Boolean).join(' • ');
}
function memberCard(p,removeAttrs=''){
  return `<div class="nexa-v49-member-card">
    <img class="nexa-v49-member-avatar" src="${esc(memberAvatar(p))}" alt="">
    <div class="nexa-v49-member-copy"><b>${esc(p.in_game_name||'Player')}</b><small>${esc(memberMeta(p))}</small></div>
    ${removeAttrs?`<button class="nexa-v49-x" ${removeAttrs} title="Remove">×</button>`:''}
  </div>`;
}
function claimAdminSection(sectionId){
  const section=$(sectionId);if(!section)return;
  Array.from(section.children).forEach(ch=>{
    if(ch.classList?.contains('nexa-v49-admin-host')){
      ch.style.setProperty('display','block','important');
      ch.style.setProperty('position','relative','important');
      ch.style.setProperty('z-index','40','important');
    }else{
      ch.style.setProperty('display','none','important');
      ch.setAttribute('aria-hidden','true');
    }
  });
}

function adminHost(sectionId){
  const section=$(sectionId);if(!section)return null;
  claimAdminSection(sectionId);
  let host=$(':scope>.nexa-v49-admin-host',section);
  if(!host){host=document.createElement('div');host.className='nexa-v49-admin-host';section.appendChild(host)}
  return host;
}
function relabelOperationalRolesUI(){
  const section=$('#admin-roles');
  if(section){
    $$('.nexa-v25-title',section).forEach(el=>{
      if(/^roles$/i.test(String(el.textContent||'').trim()))el.textContent='Operational Roles';
    });
  }
  $$('[data-admin-tab="roles"]').forEach(el=>{
    if(/^roles$/i.test(String(el.textContent||'').trim()))el.textContent='Operational Roles';
  });
  $$('.nexa-home-menu-item,.nexa-home-menu-subview button').forEach(el=>{
    if(/^roles$/i.test(String(el.textContent||'').trim()))el.textContent='Operational Roles';
  });
}

function normalizeAllianceEmblem(url){
  const s=String(url||'');
  const m=s.match(/nexa-alliance-emblem-(\d{2})\.png$/i);
  if(m){
    const i=Math.max(0,Math.min(ALLIANCE_EMBLEMS.length-1,Number(m[1])-1));
    return ALLIANCE_EMBLEMS[i];
  }
  return s;
}

async function openAllianceEmblemPicker(allianceId){
  try{
    const rows=await rpc('nexa_list_alliance_passports')||[];
    const current=rows.find(x=>String(x.id)===String(allianceId));
    const used=new Set(rows.filter(x=>String(x.id)!==String(allianceId)).map(x=>normalizeAllianceEmblem(x.emblemUrl||x.emblem_url)).filter(Boolean));
    const currentUrl=normalizeAllianceEmblem(current?.emblemUrl||current?.emblem_url);
    const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
      <h3>Choose Alliance Emblem</h3>
      <p>Select one of the official NEXA alliance emblems. Each emblem can be assigned to only one alliance at a time.</p>
      <div class="nexa-v49-emblem-grid">
        ${ALLIANCE_EMBLEMS.map((url,i)=>{
          const isUsed=used.has(url),isCurrent=currentUrl===url;
          return `<button type="button" class="nexa-v49-emblem ${isUsed?'used':''} ${isCurrent?'current':''}" ${isUsed?'disabled':''} data-v49-emblem="${esc(url)}" title="Emblem ${i+1}"><img src="${esc(url)}" alt="Alliance emblem ${i+1}"></button>`;
        }).join('')}
      </div>
      <div class="nexa-v49-status"></div>`);
    ov.addEventListener('click',async e=>{
      const pick=e.target.closest?.('[data-v49-emblem]');if(!pick)return;
      const status=$('.nexa-v49-status',ov);
      try{
        pick.disabled=true;
        status.textContent='Saving emblem…';
        await rpc('nexa_set_alliance_emblem',{p_alliance_id:Number(allianceId),p_emblem_url:pick.dataset.v49Emblem});
        ov.remove();
        const refresh=$('[data-v25-refresh]');
        if(refresh)refresh.click();
      }catch(err){
        pick.disabled=false;
        status.textContent=err.message||String(err);
      }
    });
  }catch(err){alert(err.message||String(err))}
}

function infoDialog(kind){
  if(kind==='access'){
    dialog(`<button class="nexa-v49-close" type="button">×</button><h3>NEXA Access</h3>
      <p>NEXA Access controls who can open and manage Administration for this State Hub.</p>
      <div class="nexa-v49-warning">Administrative Access does not assign Operational Roles or Battle Roles. Those are managed separately.</div>`);
  }else if(kind==='ops'){
    dialog(`<button class="nexa-v49-close" type="button">×</button><h3>Operational Roles</h3>
      <p><b>Battle Strategy</b> — strategy tools and battle configuration.</p>
      <p><b>Battle Planning</b> — Battle Planning, Team Builder and assignments.</p>
      <p><b>Ministry Scheduler</b> — Ministry scheduling tools.</p>
      <p><b>Transfer</b> — Transfer management tools.</p>
      <div class="nexa-v49-warning">Assigning an Operational Role automatically enables the tools connected to that responsibility. NEXA Access is separate.</div>`);
  }else{
    dialog(`<button class="nexa-v49-close" type="button">×</button><h3>Battle Roles</h3>
      <p><b>Rally Lead</b> and <b>Joiner</b> classify how players participate in battle and are used by Forms, Battle Planning / Team Builder and assignments.</p>
      <div class="nexa-v49-warning">Battle Roles do not grant Administrative Access.</div>`);
  }
}

async function renderAdminAccess(){
  const host=adminHost('#admin-permissions');if(!host)return;
  host.innerHTML='<div class="nexa-v49-panel">Loading Administrative Access…</div>';
  try{
    const admins=await rpc('nexa_list_state_admins_v2',{p_state:activeState()})||[];
    host.innerHTML=`<section class="nexa-v49-panel">
      <div class="nexa-v49-heading"><h3>NEXA Access</h3><button class="nexa-v49-info" type="button" data-v49-info="access">i</button></div>
      <div class="nexa-v49-muted">Administration access only for State ${esc(activeState())}. Search a player by Game ID, grant access, and manage current administrators below. Operational Roles and Battle Roles are separate.</div>
      <div class="nexa-v49-searchrow"><input id="v49-admin-search" inputmode="numeric" placeholder="Search Game ID"><button data-v49-find-admin>SEARCH</button></div>
      <div id="v49-admin-results"></div>
    </section>
    <section class="nexa-v49-panel">
      <h4>Current Administrators</h4>
      <div class="nexa-v49-member-list">
        ${admins.map(a=>memberCard(a,a.admin_kind==='founder'?'':`data-v49-revoke-admin="${esc(a.user_id)}"`)).join('')||'<div class="nexa-v49-empty">No administrators found.</div>'}
      </div>
    </section>`;
  }catch(e){host.innerHTML=`<div class="nexa-v49-panel">${esc(e.message||String(e))}</div>`}
}
async function findAdminCandidate(){
  const host=adminHost('#admin-permissions'),q=$('#v49-admin-search',host)?.value||'';
  const out=$('#v49-admin-results',host);if(!out)return;
  try{
    const rows=await adminSearch(q);
    out.innerHTML=rows.map(p=>`<div class="nexa-v49-member-card"><img class="nexa-v49-member-avatar" src="${esc(memberAvatar(p))}" alt=""><div class="nexa-v49-member-copy"><b>${esc(p.in_game_name)}</b><small>${esc(memberMeta(p))}</small></div><button class="nexa-v49-mini" data-v49-grant-admin="${esc(p.player_id)}">GRANT</button></div>`).join('')||'<div class="nexa-v49-empty">No matching player in this State Hub.</div>';
  }catch(e){out.textContent=e.message||String(e)}
}

const OP_LABELS={
  battle_strategy:'Battle Strategy',
  battle_planning:'Battle Planning',
  ministry_scheduler:'Ministry Scheduler',
  transfer:'Transfer'
};
async function renderRoles(){
  const host=adminHost('#admin-roles');if(!host)return;
  host.innerHTML='<div class="nexa-v49-panel">Loading Operational Roles…</div>';
  try{
    const [ops,battle,players]=await Promise.all([
      rpc('nexa_list_state_operational_roles_v2',{p_state:activeState()}),
      rpc('nexa_list_state_battle_roles_v2',{p_state:activeState()}),
      adminSearch('')
    ]);
    const byRole={};Object.keys(OP_LABELS).forEach(k=>byRole[k]=[]);
    (ops||[]).forEach(x=>(byRole[x.role]||=[]).push(x));
    const alliances=[...new Set((players||[]).map(x=>x.alliance_tag).filter(Boolean))].sort();
    host.dataset.v49Battle=JSON.stringify(battle||[]);

    host.innerHTML=`<section class="nexa-v49-panel">
      <div class="nexa-v49-heading"><h3>Operational Roles</h3><button class="nexa-v49-info" type="button" data-v49-info="ops">i</button></div>
      <div class="nexa-v49-muted">Add members by Game ID.</div>

      ${Object.entries(OP_LABELS).map(([key,label])=>`
        <div class="nexa-v49-role-section">
          <div class="nexa-v49-role-section-head">
            <h4>${label}</h4>
            <button class="nexa-v49-addmember" type="button" data-v49-role-add="${key}">+ ADD MEMBER</button>
          </div>
          <div class="nexa-v49-member-list">
            ${(byRole[key]||[]).map(p=>memberCard(p,`data-v49-remove-op="${esc(p.player_id)}" data-role="${key}"`)).join('')||'<div class="nexa-v49-empty">No members assigned.</div>'}
          </div>
        </div>`).join('')}
    </section>

    <section class="nexa-v49-panel">
      <div class="nexa-v49-heading"><h3>Battle Roles</h3><button class="nexa-v49-info" type="button" data-v49-info="battle">i</button></div>
      <div class="nexa-v49-muted">Rally Lead and Joiner classifications for Forms, Battle Planning / Team Builder and battle assignments.</div>
      <div class="nexa-v49-copyrow">
        <select id="v49-battle-alliance"><option value="">All Alliances</option>${alliances.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('')}</select>
        <button class="nexa-v49-mini" data-v49-copy-battle>COPY</button>
      </div>

      <div class="nexa-v49-role-section">
        <div class="nexa-v49-role-section-head"><h4>Rally Lead</h4><button class="nexa-v49-addmember" type="button" data-v49-battle-add="rally_lead">+ ADD MEMBER</button></div>
        <div id="v49-battle-rally-list" class="nexa-v49-member-list"></div>
      </div>
      <div class="nexa-v49-role-section">
        <div class="nexa-v49-role-section-head"><h4>Joiner</h4><button class="nexa-v49-addmember" type="button" data-v49-battle-add="joiner">+ ADD MEMBER</button></div>
        <div id="v49-battle-joiner-list" class="nexa-v49-member-list"></div>
      </div>
    </section>`;
    renderBattleList();
  }catch(e){host.innerHTML=`<div class="nexa-v49-panel">${esc(e.message||String(e))}</div>`}
}
function renderBattleList(){
  const host=adminHost('#admin-roles');if(!host)return;
  let rows=[];try{rows=JSON.parse(host.dataset.v49Battle||'[]')}catch{}
  const alliance=$('#v49-battle-alliance',host)?.value||'';

  const paint=(role,target)=>{
    const filtered=rows.filter(x=>x.role===role&&(!alliance||String(x.alliance_tag||'')===alliance));
    const out=$(target,host);if(!out)return;
    if(!alliance){
      const groups=new Map();
      filtered.forEach(p=>{const a=p.alliance_tag||'No Alliance';if(!groups.has(a))groups.set(a,[]);groups.get(a).push(p)});
      out.innerHTML=[...groups.entries()].map(([a,ps])=>`<div><div class="nexa-v49-muted" style="margin:5px 0 6px;font-weight:900">${esc(a)}</div>${ps.map(p=>memberCard(p,`data-v49-remove-battle="${esc(p.player_id)}" data-role="${role}"`)).join('')}</div>`).join('')||'<div class="nexa-v49-empty">No members assigned.</div>';
    }else{
      out.innerHTML=filtered.map(p=>memberCard(p,`data-v49-remove-battle="${esc(p.player_id)}" data-role="${role}"`)).join('')||'<div class="nexa-v49-empty">No members assigned.</div>';
    }
  };

  paint('rally_lead','#v49-battle-rally-list');
  paint('joiner','#v49-battle-joiner-list');
}
function addRoleMemberDialog({kind,role,label}){
  const ov=dialog(`<button class="nexa-v49-close" type="button">×</button>
    <h3>Add Member — ${esc(label)}</h3>
    <p>Enter the player's Game ID for State ${esc(activeState())}.</p>
    <label class="nexa-v49-field">Game ID<input id="v49-add-role-id" inputmode="numeric" placeholder="Numbers only"></label>
    <div class="nexa-v49-actions"><button class="nexa-v49-primary" type="button" data-v49-confirm-role-add>ADD MEMBER</button></div>
    <div class="nexa-v49-status"></div>`);
  $('[data-v49-confirm-role-add]',ov).onclick=async()=>{
    const status=$('.nexa-v49-status',ov),gameId=String($('#v49-add-role-id',ov)?.value||'').replace(/\D/g,'');
    if(!gameId){status.textContent='Enter a Game ID.';return}
    try{
      const player=await resolvePlayer(gameId);
      if(kind==='op')await rpc('nexa_set_state_operational_role',{p_state:activeState(),p_game_id:player.player_id,p_role:role,p_enabled:true});
      else await rpc('nexa_set_state_battle_role',{p_state:activeState(),p_game_id:player.player_id,p_role:role,p_enabled:true});
      ov.remove();await renderRoles();
    }catch(err){status.textContent=err.message||String(err)}
  };
}

async function resolvePlayer(text){
  const q=String(text||'').trim();if(!q)throw new Error('Enter an IGN or Game ID.');
  const rows=await adminSearch(q);
  if(!rows.length)throw new Error('Player not found in this State Hub.');
  const exact=rows.find(x=>String(x.player_id)===q)||rows.find(x=>String(x.in_game_name||'').toLowerCase()===q.toLowerCase());
  if(exact)return exact;
  if(rows.length===1)return rows[0];
  throw new Error('More than one player matched. Use the exact Game ID.');
}

async function acceptPendingInviteIfAny(){
  const st=activeState();if(!st)return;
  try{
    await rpc('nexa_accept_state_admin_invite',{p_state:st});
    alert(`State ${st} State Hub Admin invitation accepted. The Hub will activate automatically once the required second admin is confirmed.`);
    syncStateHome();
  }catch(_){}
}

function hideLegacyBlock(node){
  if(!node || node.closest?.('.nexa-v49-admin-host'))return;
  let cur=node;
  for(let i=0;i<6&&cur&&cur!==document.body;i++,cur=cur.parentElement){
    if(cur.closest?.('.nexa-v49-admin-host'))return;
    const cls=String(cur.className||'');
    const txt=String(cur.textContent||'').trim().replace(/\s+/g,' ');
    if(
      /(?:help|panel|card|role|search|access)/i.test(cls) &&
      txt.length<1800
    ){
      cur.style.setProperty('display','none','important');
      cur.setAttribute('aria-hidden','true');
      return;
    }
  }
  node.style?.setProperty?.('display','none','important');
  node.setAttribute?.('aria-hidden','true');
}

function purgeLegacyAdminUI(){
  const modal=$('#admin-modal');if(!modal)return;

  const phrases=[
    'Find a player and manage Operational Roles and module access from one place.',
    'Alliance Rank is managed inside each Alliance Passport.'
  ];

  $$('*',modal).forEach(el=>{
    if(el.closest('.nexa-v49-admin-host'))return;
    const txt=String(el.textContent||'').trim().replace(/\s+/g,' ');
    if(!txt || txt.length>650)return;
    if(phrases.some(p=>txt.includes(p)))hideLegacyBlock(el);
  });

  $$('input[placeholder="Search Player Name or Game ID"]',modal).forEach(input=>{
    if(!input.closest('.nexa-v49-admin-host'))hideLegacyBlock(input);
  });

  $$('*',modal).forEach(el=>{
    if(el.closest('.nexa-v49-admin-host'))return;
    const txt=String(el.textContent||'').trim().replace(/\s+/g,' ');
    if(
      txt.length>80 && txt.length<1600 &&
      txt.includes('Battle Strategist') &&
      txt.includes('Event Operator') &&
      txt.includes('Scheduler') &&
      txt.includes('Transfer Coordinator') &&
      txt.includes('Manage Access')
    ){
      hideLegacyBlock(el);
    }
  });
}

function refreshAdminOwners(){
  purgeLegacyAdminUI();
  renderAdminAccess();
  renderRoles();
  purgeLegacyAdminUI();
}

function scheduleAdminOwners(){
  /* Legacy Administration carousel paints synchronously from its arrows.
     Reclaim immediately after that user navigation and once after its transition.
     Finite event follow-up only: no observer and no polling. */
  [0,90,240].forEach(ms=>setTimeout(()=>{
    purgeLegacyAdminUI();
    claimAdminSection('#admin-permissions');
    claimAdminSection('#admin-roles');
    relabelOperationalRolesUI();
    renderAdminAccess();
    renderRoles();
    purgeLegacyAdminUI();
  },ms));
}

function bind(){
  document.addEventListener('click',async e=>{
    const adminOwnerTrigger=e.target.closest?.(
      '#admin-modal .nexa-v25-arrow,#admin-modal .nexa-v25-nav,'+
      '[data-admin-tab="roles"],[data-admin-tab="permissions"],'+
      '[data-admin-tab="access"],[data-admin-section="roles"],'+
      '[data-admin-section="permissions"],[data-open-admin],#open-admin'
    );
    if(adminOwnerTrigger) scheduleAdminOwners();

    const emblemButton=e.target.closest?.('[data-v25-emblems]');
    if(emblemButton){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      await openAllianceEmblemPicker(emblemButton.dataset.v25Emblems);
      return;
    }

    const ship=e.target.closest?.('[data-fleet-state]');
    if(ship&&!e.target.closest('[data-v49-remove-state]')){
      const st=stateNum(ship.dataset.fleetState);
      if(st){setActiveState(st);await selectStateAccount(st);setTimeout(syncStateHome,80)}
    }

    if(e.target.closest?.('[data-v49-add-state]')){e.preventDefault();e.stopPropagation();choiceDialog();return}
    const rm=e.target.closest?.('[data-v49-remove-state]');if(rm){e.preventDefault();e.stopPropagation();await removeState(stateNum(rm.dataset.v49RemoveState));return}
    const del=e.target.closest?.('[data-v49-delete-account]');if(del){e.preventDefault();e.stopPropagation();await deleteAccount(del.dataset.v49DeleteAccount);return}

    if(e.target.closest?.('[data-v49-find-admin]')){await findAdminCandidate();return}
    const ga=e.target.closest?.('[data-v49-grant-admin]');if(ga){try{await rpc('nexa_grant_state_admin',{p_state:activeState(),p_game_id:ga.dataset.v49GrantAdmin});await renderAdminAccess()}catch(err){alert(err.message)}return}
    const ra=e.target.closest?.('[data-v49-revoke-admin]');if(ra){if(confirm('Remove Administrative Access for this person?')){try{await rpc('nexa_revoke_state_admin',{p_state:activeState(),p_target:ra.dataset.v49RevokeAdmin});await renderAdminAccess()}catch(err){alert(err.message)}}return}

    const info=e.target.closest?.('[data-v49-info]');if(info){infoDialog(info.dataset.v49Info);return}
    const addOp=e.target.closest?.('[data-v49-role-add]');
    if(addOp){addRoleMemberDialog({kind:'op',role:addOp.dataset.v49RoleAdd,label:OP_LABELS[addOp.dataset.v49RoleAdd]||'Operational Role'});return}
    const addBattle=e.target.closest?.('[data-v49-battle-add]');
    if(addBattle){addRoleMemberDialog({kind:'battle',role:addBattle.dataset.v49BattleAdd,label:addBattle.dataset.v49BattleAdd==='rally_lead'?'Rally Lead':'Joiner'});return}
    if(e.target.closest?.('[data-v49-add-op]')){
      try{
        const host=adminHost('#admin-roles'),p=await resolvePlayer($('#v49-op-player',host).value),role=$('#v49-op-role',host).value;
        await rpc('nexa_set_state_operational_role',{p_state:activeState(),p_game_id:p.player_id,p_role:role,p_enabled:true});await renderRoles();
      }catch(err){alert(err.message)}return
    }
    const ro=e.target.closest?.('[data-v49-remove-op]');if(ro){try{await rpc('nexa_set_state_operational_role',{p_state:activeState(),p_game_id:ro.dataset.v49RemoveOp,p_role:ro.dataset.role,p_enabled:false});await renderRoles()}catch(err){alert(err.message)}return}
    if(e.target.closest?.('[data-v49-add-battle]')){
      try{
        const host=adminHost('#admin-roles'),p=await resolvePlayer($('#v49-battle-player',host).value),role=$('#v49-battle-role',host).value;
        await rpc('nexa_set_state_battle_role',{p_state:activeState(),p_game_id:p.player_id,p_role:role,p_enabled:true});await renderRoles();
      }catch(err){alert(err.message)}return
    }
    const rb=e.target.closest?.('[data-v49-remove-battle]');if(rb){try{await rpc('nexa_set_state_battle_role',{p_state:activeState(),p_game_id:rb.dataset.v49RemoveBattle,p_role:rb.dataset.role,p_enabled:false});await renderRoles()}catch(err){alert(err.message)}return}
    if(e.target.closest?.('[data-v49-copy-battle]')){
      const host=adminHost('#admin-roles');
      const rally=$('#v49-battle-rally-list',host)?.innerText||'';
      const joiner=$('#v49-battle-joiner-list',host)?.innerText||'';
      const text=`RALLY LEADS\n${rally}\n\nJOINERS\n${joiner}`.replace(/\n×/g,'').trim();
      try{await navigator.clipboard.writeText(text);alert('Battle Role list copied.')}catch{alert(text||'Nothing to copy.')}return
    }

    /* Existing UI can render Fleet/Account/Admin asynchronously after the click.
       These are single follow-up paints, not polling. */
    requestAnimationFrame(()=>{enhanceFleet();enhanceAccountManager();});
    scheduleV49Enhancers();
  },true);

  document.addEventListener('animationstart',e=>{
    if(e.target?.closest?.('#nexa-v4484-fleet'))scheduleV49Enhancers();
  },true);

  document.addEventListener('focusin',e=>{
    if(e.target?.closest?.('#nexa-v4484-fleet,#accounts-modal'))scheduleV49Enhancers();
  },true);

  document.addEventListener('change',e=>{
    if(e.target?.matches?.('#v49-battle-alliance'))renderBattleList();
  });

  document.addEventListener('pointerup',e=>{
    if(e.target?.closest?.('#admin-modal .nexa-v25-arrow'))scheduleAdminOwners();
  },true);

  window.addEventListener('nexa:active-state-changed',()=>{
    syncStateHome();accountFormForState();scheduleAdminOwners();
  });
  window.addEventListener('pageshow',()=>setTimeout(syncStateHome,100));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncStateHome()});
}

async function boot(){
  if(booted)return;booted=true;
  installCSS();
  try{await restoreActiveContext()}catch(e){console.warn('[NEXA V49] restore',e?.message||e)}
  updateStateLabels();
  accountFormForState();
  enhanceAccountManager();
  enhanceFleet();

  /* Replace the two legacy Administration hosts with the state-scoped owners. */
  adminHost('#admin-permissions');
  adminHost('#admin-roles');
  renderAdminAccess();
  renderRoles();
  relabelOperationalRolesUI();
  scheduleAdminOwners();

  /* Old index Home sync was globally hard-coded to 1518. From V49 onward the
     active Fleet State is the source of truth. */
  window.NEXA_SYNC_STATE_HOME=syncStateHome;
  try{window.syncHomeLiveEvent=syncStateHome}catch(_){}
  try{window.syncHomeTransfers=syncStateHome}catch(_){}
  await syncStateHome();
  /* One delayed final paint wins over the legacy async Home loader that may still
     be finishing its original 1518 request during DOMContentLoaded. */
  setTimeout(syncStateHome,650);

  bind();

  /* If this signed-in player already has a pending second-admin invitation for
     the selected State, one explicit confirmation path is exposed through Fleet. */
  const st=activeState();
  if(st){
    try{
      const c=sb();
      const {data:{user}}=await c.auth.getUser();
      if(user){
        const rows=await ownAccounts();
        const acct=rows.find(x=>stateNum(x.state_number)===st);
        if(acct){
          const {data:invite,error:inviteError}=await c.rpc('nexa_my_pending_state_admin_invite',{p_state:st});
          if(!inviteError&&invite===true){
            const ov=dialog(`<button class="nexa-v49-close" type="button">×</button><h3>State Hub Admin Invitation</h3>
              <p>You were invited to help administer State ${esc(st)}.</p>
              <div class="nexa-v49-warning">Accepting this invitation may complete activation of this State Hub.</div>
              <div class="nexa-v49-actions"><button class="nexa-v49-primary" data-v49-accept-invite>ACCEPT ADMIN INVITATION</button></div>`);
            $('[data-v49-accept-invite]',ov).onclick=async()=>{ov.remove();await acceptPendingInviteIfAny()};
          }
        }
      }
    }catch(_){}
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

})();
