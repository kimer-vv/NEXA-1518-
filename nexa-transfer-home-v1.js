/* NEXA TRANSFER HOME V1.5 — HOME CARDS ONLY / MENU OWNERSHIP REMOVED
   - Transfer Center stays member-facing.
   - Transfer Workspace home card appears only with verified transfer permission or staff session.
   - DOES NOT inject or rewrite the Transfers menu.
   - NEXA V49 State Hub is the single Transfers menu owner.
   - No MutationObserver. No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{'use strict';
if(window.__NEXA_TRANSFER_HOME_V15__)return;
window.__NEXA_TRANSFER_HOME_V15__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let client=null;
let canWorkspace=false;

function sb(){
  if(window.supabaseClient?.rpc)return window.supabaseClient;
  if(window.sb?.rpc)return window.sb;
  if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);
  return client;
}
function activeState(){
  return Number(window.NEXA_ACTIVE_STATE||localStorage.getItem('nexa_active_state_v49')||0);
}
function staffToken(){
  return localStorage.getItem('nexa_transfer_staff_token')||
         sessionStorage.getItem('nexa_transfer_staff_token')||'';
}
function normalize(data){
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.get_transfer_center_cards))return data.get_transfer_center_cards;
  if(Array.isArray(data?.cards))return data.cards;
  if(data?.event_id)return[data];
  return[];
}
function publicLink(row){
  return new URL(`transfer-form-v2.html?public=1&event=${encodeURIComponent(row.event_id)}`,location.href).href;
}
function workspaceLink(){
  const st=activeState();
  return new URL(`transfer-workspace.html${st?`?state=${encodeURIComponent(st)}`:''}`,location.href).href;
}
async function copy(text,button){
  try{
    await navigator.clipboard.writeText(text);
    const old=button.textContent;
    button.textContent='Copied ✓';
    setTimeout(()=>button.textContent=old,1200);
  }catch(_){location.href=text}
}
async function permission(){
  const c=sb();
  if(!c)return false;
  if(staffToken())return true;

  try{
    if(c.auth?.getSession)await c.auth.getSession();
  }catch(_){}

  try{
    const r=await c.rpc('can_manage_transfers');
    return r?.data===true;
  }catch(_){
    return false;
  }
}
function removeWorkspaceCard(){
  document.getElementById('nexa-transfer-workspace-card')?.remove();
}

async function renderCenterAndWorkspaceCard(){
  const c=sb();
  const state=activeState();
  if(!c||!state)return;

  canWorkspace=await permission();

  const transferCard=document.getElementById('nexa-v49-transfer-card');
  if(!transferCard)return;

  const centerHost=document.getElementById('nexa-v49-transfer-events');
  let cards=[];
  try{
    const cr=await c.rpc('get_transfer_center_cards');
    cards=normalize(cr?.data);
  }catch(_){}
  const row=cards.find(x=>Number(x.destination_state)===state);

  let actions=document.getElementById('nexa-transfer-center-actions');
  if(row&&centerHost){
    if(!actions){
      actions=document.createElement('div');
      actions.id='nexa-transfer-center-actions';
      actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';
      centerHost.appendChild(actions);
    }
    const link=publicLink(row);
    actions.innerHTML=`<a class="btn" href="${link}" style="text-decoration:none">View Form</a><button class="btn secondary" type="button" id="nexa-transfer-copy">Copy Link</button>`;
    document.getElementById('nexa-transfer-copy').onclick=e=>copy(link,e.currentTarget);
  }else{
    actions?.remove();
  }

  removeWorkspaceCard();
  if(canWorkspace){
    const card=document.createElement('section');
    card.id='nexa-transfer-workspace-card';
    card.className=transferCard.className||'section';
    card.dataset.nexaTech='transfer-workspace';
    card.innerHTML=`<div style="font-size:10px;letter-spacing:.15em;font-weight:950;color:#8fefff">TRANSFER STAFF</div>
      <h3 style="margin:7px 0">Transfer Workspace</h3>
      <div class="muted">Cycle, applicants, history, integrations and staff access for State ${state}.</div>
      <div style="margin-top:12px"><a class="btn" href="${workspaceLink()}" style="text-decoration:none">Open Workspace</a></div>`;
    transferCard.insertAdjacentElement('afterend',card);
  }
}

window.addEventListener('nexa:active-state-changed',renderCenterAndWorkspaceCard);

window.addEventListener('load',()=>{
  renderCenterAndWorkspaceCard();
  setTimeout(renderCenterAndWorkspaceCard,600);
  setTimeout(renderCenterAndWorkspaceCard,1600);
});

const c=sb();
if(c?.auth?.onAuthStateChange){
  c.auth.onAuthStateChange((_event,session)=>{
    if(session)renderCenterAndWorkspaceCard();
  });
}
})();
