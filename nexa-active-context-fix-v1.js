/* NEXA Active Context Fix V3
   Fixes Fleet State -> Active Account -> Home persistence.
   Main Account remains unchanged; this only controls the currently active account.
*/
(()=>{
'use strict';
if(window.__NEXA_ACTIVE_CONTEXT_FIX_V3__) return;
window.__NEXA_ACTIVE_CONTEXT_FIX_V3__=true;

/* Production cleanup: hide/remove legacy V49 runtime proof diagnostics. */
(function suppressLegacyRuntimeProof(){
  const style=document.createElement('style');
  style.id='nexa-hide-v49-runtime-proof';
  style.textContent='#nexa-v49-runtime-proof-box{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
  (document.head||document.documentElement).appendChild(style);
  const remove=()=>document.getElementById('nexa-v49-runtime-proof-box')?.remove();
  remove();
  window.addEventListener('load',()=>{
    remove();
    setTimeout(remove,1100);
    setTimeout(remove,2700);
  });
  try{
    const observer=new MutationObserver(()=>remove());
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }catch(_){}
})();

const STATE_KEY='nexa_active_state_v49';
const ACCOUNT_KEY='nexa_active_account_v49';
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

let localClient=null;
let syncTimer=0;
let syncing=false;
let canonicalHomeLoader=null;
let lastActiveAccount=null;
let homeObserver=null;

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

async function syncActiveContext({emit=true,refreshCanonical=false}={}){
  if(syncing) return lastActiveAccount;
  syncing=true;
  try{
    const state=getActiveState();
    if(!state) return null;

    if(refreshCanonical && canonicalHomeLoader){
      try{ await canonicalHomeLoader(); }catch(_){}
    }

    const rows=await getAccounts();
    const account=chooseAccount(rows,state);
    if(!account) return null;

    lastActiveAccount=account;
    setActiveAccount(account,state,{emit});
    paintHome(account);

    try{ window.NEXA_HOME_VISUALS_REFRESH?.(); }catch(_){}
    return account;
  }catch(err){
    console.warn('[NEXA Active Context Fix]',err?.message||err);
    return null;
  }finally{
    syncing=false;
  }
}

function scheduleSync(delay=0){
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>syncActiveContext({emit:true}),delay);
}

function installCanonicalHomeOwnership(){
  /* ui-i18n-final.js historically treats is_main as the active account.
     Keep its loader for data refresh, but always finish with the Fleet-selected account. */
  if(!canonicalHomeLoader && typeof window.nexaLoadHomeAccountCards==='function'){
    canonicalHomeLoader=window.nexaLoadHomeAccountCards.bind(window);
    window.nexaLoadHomeAccountCards=async function(...args){
      let result;
      try{ result=await canonicalHomeLoader(...args); }catch(err){ throw err; }
      await syncActiveContext({emit:false,refreshCanonical:false});
      return result;
    };
  }

  const name=document.getElementById('nexa-profile-launcher-name');
  const photo=document.getElementById('nexa-profile-launcher-photo');
  const badge=document.getElementById('nexa-profile-launcher-badge');

  if(homeObserver) homeObserver.disconnect();
  if(name||photo||badge){
    homeObserver=new MutationObserver(()=>{
      if(!lastActiveAccount) return;
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>paintHome(lastActiveAccount),10);
    });
    [name,photo,badge].filter(Boolean).forEach(el=>{
      homeObserver.observe(el,{childList:true,characterData:true,subtree:true,attributes:true});
    });
  }
}

/* State Hub/Fleet changes */
window.addEventListener('nexa:active-state-changed',()=>{
  scheduleSync(10);
  setTimeout(installCanonicalHomeOwnership,40);
});
window.addEventListener('nexa:account-changed',()=>scheduleSync(10));

/* Restore selected State/account after navigation or reload */
window.addEventListener('pageshow',()=>{
  installCanonicalHomeOwnership();
  scheduleSync(40);
});
window.addEventListener('nexa:home-ready',()=>{
  installCanonicalHomeOwnership();
  scheduleSync(20);
});
window.addEventListener('nexa:home-profile-ready',()=>{
  installCanonicalHomeOwnership();
  scheduleSync(10);
});
document.addEventListener('DOMContentLoaded',()=>{
  installCanonicalHomeOwnership();
  scheduleSync(40);
});

/* Closing the constellation must keep the selected State account on Home. */
document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-close-constellation]')){
    scheduleSync(0);
    setTimeout(()=>syncActiveContext({emit:true}),120);
  }
},true);

/* Late legacy scripts can install/reinstall their loader after initial parse. */
setTimeout(()=>{installCanonicalHomeOwnership();syncActiveContext({emit:false});},250);
setTimeout(()=>{installCanonicalHomeOwnership();syncActiveContext({emit:false});},1000);
setTimeout(()=>{installCanonicalHomeOwnership();syncActiveContext({emit:false});},2500);

/* Public hook for Fleet and the future My Accounts UI. */
window.NEXA_SYNC_ACTIVE_CONTEXT=syncActiveContext;
})();
