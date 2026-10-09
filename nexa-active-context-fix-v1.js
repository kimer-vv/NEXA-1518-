/* NEXA Active Context Fix V1
   Fixes Fleet State -> Active Account -> Home persistence.
   Main Account remains unchanged; this only controls the currently active account.
*/
(()=>{
'use strict';
if(window.__NEXA_ACTIVE_CONTEXT_FIX_V1__) return;
window.__NEXA_ACTIVE_CONTEXT_FIX_V1__=true;

const STATE_KEY='nexa_active_state_v49';
const ACCOUNT_KEY='nexa_active_account_v49';
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

let localClient=null;
let syncTimer=0;
let syncing=false;

function db(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  if(window.nexaAccountDataClient?.from) return window.nexaAccountDataClient;
  if(!localClient && window.supabase?.createClient){
    localClient=window.supabase.createClient(SB_URL,SB_KEY);
  }
  return localClient;
}

function stateNum(v){
  const n=Number(String(v??'').replace(/\D/g,''));
  return Number.isFinite(n)&&n>0?n:0;
}

function getActiveState(){
  return stateNum(
    window.NEXA_ACTIVE_STATE ||
    localStorage.getItem(STATE_KEY) ||
    document.documentElement.dataset.nexaState ||
    0
  );
}

async function getAccounts(){
  const c=db();
  if(!c) return [];
  const {data:{user},error:userError}=await c.auth.getUser();
  if(userError||!user) return [];
  const {data,error}=await c.from('player_accounts')
    .select('id,in_game_name,player_id,is_main,state_number,alliance_id,custom_alliance_tag,profile_photo_url,alliances(tag)')
    .eq('user_id',user.id)
    .order('is_main',{ascending:false})
    .order('created_at',{ascending:true});
  if(error) throw error;
  return Array.isArray(data)?data:[];
}

function chooseAccount(rows,state){
  const currentId=String(
    window.NEXA_ACTIVE_ACCOUNT_ID ||
    localStorage.getItem(ACCOUNT_KEY) ||
    ''
  );

  return rows.find(a =>
      Number(a.state_number)===state &&
      String(a.id)===currentId
    ) ||
    rows.find(a =>
      Number(a.state_number)===state &&
      a.is_main===true
    ) ||
    rows.find(a =>
      Number(a.state_number)===state
    ) ||
    null;
}

function setActiveAccount(account,state,{emit=true}={}){
  if(!account?.id) return;
  const id=String(account.id);
  const old=String(window.NEXA_ACTIVE_ACCOUNT_ID||'');
  window.NEXA_ACTIVE_ACCOUNT_ID=id;
  localStorage.setItem(ACCOUNT_KEY,id);

  if(emit && old!==id){
    window.dispatchEvent(new CustomEvent('nexa:account-changed',{
      detail:{
        accountId:id,
        stateNumber:state,
        source:'fleet-state'
      }
    }));
  }
}

function allianceTag(a){
  return a?.alliances?.tag || a?.custom_alliance_tag || 'Not Listed';
}

function avatar(a){
  return a?.profile_photo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(a?.in_game_name||'NEXA')}&background=111a38&color=cabaff&bold=true&size=256`;
}

function paintHome(account){
  if(!account) return;

  const photo=document.getElementById('nexa-profile-launcher-photo');
  const name=document.getElementById('nexa-profile-launcher-name');
  const badge=document.getElementById('nexa-profile-launcher-badge');

  if(photo) photo.src=avatar(account);
  if(name){
    name.textContent=
      `${String(account.in_game_name||'PLAYER').toUpperCase()} • `+
      `${String(allianceTag(account)).toUpperCase()} • `+
      `ID ${account.player_id||''}`;
  }
  if(badge) badge.textContent='ACTIVE';
}

async function syncActiveContext({emit=true}={}){
  if(syncing) return;
  syncing=true;
  try{
    const state=getActiveState();
    if(!state) return;

    const rows=await getAccounts();
    const account=chooseAccount(rows,state);
    if(!account) return;

    setActiveAccount(account,state,{emit});
    paintHome(account);

    /* Legacy loader currently prefers is_main.
       Allow it to refresh its own cache, then repaint the true active account. */
    try{ await window.nexaLoadHomeAccountCards?.(); }catch(_){}
    paintHome(account);

    try{ window.NEXA_HOME_VISUALS_REFRESH?.(); }catch(_){}
  }catch(err){
    console.warn('[NEXA Active Context Fix]',err?.message||err);
  }finally{
    syncing=false;
  }
}

function scheduleSync(delay=0){
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>syncActiveContext({emit:true}),delay);
}

/* State Hub/Fleet changes */
window.addEventListener('nexa:active-state-changed',()=>scheduleSync(20));

/* Restore selected State/account after navigation or reload */
window.addEventListener('pageshow',()=>scheduleSync(80));
window.addEventListener('nexa:home-ready',()=>scheduleSync(40));
document.addEventListener('DOMContentLoaded',()=>scheduleSync(80));

/* Closing the constellation must keep the selected State account on Home. */
document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-close-constellation]')){
    scheduleSync(0);
    setTimeout(()=>syncActiveContext({emit:true}),140);
  }
},true);

/* Public hook for Fleet and the future My Accounts UI. */
window.NEXA_SYNC_ACTIVE_CONTEXT=syncActiveContext;
})();
