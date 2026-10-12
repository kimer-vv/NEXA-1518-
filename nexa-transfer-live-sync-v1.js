(()=>{'use strict';
if(window.__NEXA_TRANSFER_LIVE_SYNC_V1__)return;
window.__NEXA_TRANSFER_LIVE_SYNC_V1__=true;

const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SUPA,PUB);
const $=s=>document.querySelector(s);
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
function workspace(){
  const q=new URLSearchParams(location.search),w=q.get('workspace');
  if(w)return w;
  try{return new URL($('#workspaceLink')?.value||'',location.href).searchParams.get('workspace')||''}catch{return ''}
}

const STATE_KEY='nexa_transfer_live_view_v1';
function captureView(){
  const tab=$('.tab.active')?.dataset.tab||'cycle';
  const folder=$('.folderBox.active[data-folder]')?.dataset.folder||'';
  const groups=!!$('[data-nexa-groups-folder].active');
  const groupName=String($('#nexaGroupView.open .nexa-group-head h3')?.textContent||'').trim();
  const data={tab,folder,groups,groupName,y:window.scrollY,t:Date.now()};
  try{sessionStorage.setItem(STATE_KEY,JSON.stringify(data))}catch(_){}
}
function restoreView(){
  let x=null;
  try{x=JSON.parse(sessionStorage.getItem(STATE_KEY)||'null')}catch(_){}
  if(!x||Date.now()-Number(x.t||0)>15000)return;
  try{sessionStorage.removeItem(STATE_KEY)}catch(_){}
  setTimeout(()=>{
    document.querySelector(`.tab[data-tab="${CSS.escape(x.tab||'cycle')}"]`)?.click();
    setTimeout(()=>{
      if(x.groups)$('[data-nexa-groups-folder]')?.click();
      else if(x.folder)$(`.folderBox[data-folder="${CSS.escape(x.folder)}"]`)?.click();
      setTimeout(()=>window.scrollTo({top:Number(x.y||0),behavior:'instant'}),120);
    },120);
  },250);
}

async function snapshot(){
  if(!sb||!workspace()||!token())return null;
  const {data,error}=await sb.rpc('transfer_workspace_snapshot',{p_workspace_id:workspace(),p_token:token()});
  return !error&&data?.ok?data:null;
}
async function waitFor(test,timeout=2600){
  const start=Date.now();
  while(Date.now()-start<timeout){
    const s=await snapshot();
    if(s&&test(s))return true;
    await new Promise(r=>setTimeout(r,180));
  }
  return false;
}
function appFrom(s,id){return (s?.applications||[]).find(a=>String(a.id)===String(id))}
let reloading=false;
function autoReload(){
  if(reloading)return;
  reloading=true;
  captureView();
  setTimeout(()=>location.reload(),30);
}
function cardId(el){
  return el?.closest?.('[data-app]')?.dataset.app||
         el?.closest?.('[data-v515-app]')?.dataset.v515App||'';
}

document.addEventListener('click',e=>{
  const route=e.target.closest?.('[data-route-card],[data-v515-route]');
  if(route){
    const id=cardId(route),target=route.dataset.routeCard||route.dataset.v515Route;
    if(id&&target)waitFor(s=>String(appFrom(s,id)?.application_bucket||'')===String(target)).then(ok=>{if(ok)autoReload()});
    return;
  }

  const invite=e.target.closest?.('[data-invite-toggle],[data-v515-invite]');
  if(invite){
    const id=cardId(invite);
    const sent=(invite.dataset.inviteToggle||invite.dataset.v515Invite)==='sent';
    if(id)waitFor(s=>(appFrom(s,id)?.invite_status==='sent')===sent).then(ok=>{if(ok)autoReload()});
    return;
  }

  if(e.target.closest?.('[data-order-up],[data-order-down],[data-gup],[data-gdown]')){
    setTimeout(autoReload,650);
  }
},false);

document.addEventListener('change',e=>{
  const assign=e.target.closest?.('[data-assign-card],[data-v515-assign]');
  if(assign){
    const id=cardId(assign),tag=String(assign.value||'');
    if(id)waitFor(s=>String(appFrom(s,id)?.assigned_alliance_tag||'')===tag).then(ok=>{if(ok)autoReload()});
  }
},false);

/* Drag reorder: after the existing drag implementation has had time to persist,
   refresh the canonical snapshot automatically. */
let dragTouched=false;
document.addEventListener('touchstart',e=>{
  if(e.target.closest?.('.rank524,.groupRank524'))dragTouched=true;
},{capture:true,passive:true});
document.addEventListener('touchend',()=>{
  if(!dragTouched)return;dragTouched=false;setTimeout(autoReload,750);
},{capture:true,passive:true});
document.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'&&e.target.closest?.('.rank524,.groupRank524'))dragTouched=true;
},{capture:true});
document.addEventListener('pointerup',e=>{
  if(e.pointerType==='touch'||!dragTouched)return;dragTouched=false;setTimeout(autoReload,750);
},{capture:true});

restoreView();
})();