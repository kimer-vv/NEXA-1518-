(()=>{'use strict';
if(window.__NEXA_TRANSFER_LIVE_SYNC_V3__)return;
window.__NEXA_TRANSFER_LIVE_SYNC_V3__=true;

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

function ensureStyles(){
  if(document.getElementById('nexaTransferPillsV3'))return;
  const s=document.createElement('style');
  s.id='nexaTransferPillsV3';
  s.textContent=`
  /* Strong active/inactive contrast for all Transfer selector pills */
  .babySeg button,
  .orderSeg524 button{
    background:#343946!important;
    color:#aeb6c7!important;
    border:1px solid rgba(255,255,255,.07)!important;
    box-shadow:none!important;
    opacity:1!important;
    transition:background .12s ease,color .12s ease,transform .12s ease,box-shadow .12s ease!important;
  }

  .babySeg button:not(.active),
  .orderSeg524 button:not(.active){
    background:linear-gradient(180deg,#3b404c,#2d323d)!important;
    color:#9da6b8!important;
    border-color:rgba(255,255,255,.06)!important;
    box-shadow:none!important;
  }

  /* First Come / Priority */
  .orderSeg524 button.active{
    background:linear-gradient(135deg,#6f55d9,#3b8fc5)!important;
    color:#fff!important;
    border-color:rgba(151,140,255,.72)!important;
    box-shadow:0 0 0 1px rgba(151,140,255,.20),0 3px 12px rgba(73,96,210,.26)!important;
  }

  /* Ordinary */
  .babySeg button.ordinary.active{
    background:linear-gradient(135deg,#178b61,#45c18e)!important;
    color:#fff!important;
    border-color:rgba(125,241,190,.70)!important;
    box-shadow:0 0 0 1px rgba(125,241,190,.18),0 3px 12px rgba(37,164,113,.25)!important;
  }

  /* Special */
  .babySeg button.special.active{
    background:linear-gradient(135deg,#a86f17,#e3b64e)!important;
    color:#fff!important;
    border-color:rgba(255,213,109,.72)!important;
    box-shadow:0 0 0 1px rgba(255,213,109,.18),0 3px 12px rgba(184,133,35,.26)!important;
  }

  /* Pending */
  .babySeg button.pending.active{
    background:linear-gradient(135deg,#596273,#737f92)!important;
    color:#fff!important;
    border-color:rgba(205,214,230,.45)!important;
    box-shadow:0 0 0 1px rgba(205,214,230,.10),0 3px 10px rgba(0,0,0,.18)!important;
  }

  /* Sent */
  .babySeg button.sent.active{
    background:linear-gradient(135deg,#178b61,#45c18e)!important;
    color:#fff!important;
    border-color:rgba(125,241,190,.70)!important;
    box-shadow:0 0 0 1px rgba(125,241,190,.18),0 3px 12px rgba(37,164,113,.25)!important;
  }

  .babySeg button.active,
  .orderSeg524 button.active{
    transform:translateY(-1px)!important;
    font-weight:1000!important;
  }

  .babySeg.routeLocked button{
    opacity:.55!important;
  }
  `;
  document.head.appendChild(s);
}

async function snapshot(){
  if(!sb||!workspace()||!token())return null;
  const {data,error}=await sb.rpc('transfer_workspace_snapshot',{
    p_workspace_id:workspace(),
    p_token:token()
  });
  return !error&&data?.ok?data:null;
}

async function waitFor(test,timeout=2600){
  const start=Date.now();
  while(Date.now()-start<timeout){
    const s=await snapshot();
    if(s&&test(s))return true;
    await new Promise(r=>setTimeout(r,160));
  }
  return false;
}

function appFrom(s,id){
  return (s?.applications||[]).find(a=>String(a.id)===String(id));
}

function cardId(el){
  return el?.closest?.('[data-app]')?.dataset.app||
         el?.closest?.('[data-v515-app]')?.dataset.v515App||'';
}

function setExclusiveActive(container,selector,activeButton){
  if(!container)return;
  container.querySelectorAll(selector).forEach(b=>b.classList.toggle('active',b===activeButton));
}

function setGroupRouteVisual(button,target){
  const seg=button.closest('.babySeg');
  if(!seg)return;
  setExclusiveActive(seg,'[data-v515-route]',button);

  const card=button.closest('.app[data-v515-app]');
  if(card){
    card.classList.toggle('rangeBlue',target==='ordinary');
    card.classList.toggle('rangeGold',target==='special');
  }
}

function setMainRouteVisual(button,target){
  const seg=button.closest('.babySeg');
  if(seg)setExclusiveActive(seg,'[data-route-card]',button);

  const card=button.closest('.app[data-app]');
  if(card){
    card.classList.toggle('rangeBlue',target==='ordinary');
    card.classList.toggle('rangeGold',target==='special');
  }
}

function setInviteVisual(button,selector,sent){
  const seg=button.closest('.babySeg');
  if(!seg)return;
  setExclusiveActive(seg,selector,button);
}

/* Immediate selector feedback */
document.addEventListener('click',e=>{
  ensureStyles();

  const order=e.target.closest?.('[data-app-order]');
  if(order){
    const seg=order.closest('.orderSeg524');
    if(seg)setExclusiveActive(seg,'[data-app-order]',order);
    return;
  }

  const groupRoute=e.target.closest?.('[data-v515-route]');
  if(groupRoute){
    const id=cardId(groupRoute),target=groupRoute.dataset.v515Route;
    if(!id||!target)return;

    const seg=groupRoute.closest('.babySeg');
    const previous=seg?.querySelector('[data-v515-route].active')?.dataset.v515Route||'';
    setGroupRouteVisual(groupRoute,target);

    waitFor(s=>String(appFrom(s,id)?.application_bucket||'')===String(target)).then(ok=>{
      if(!ok&&previous){
        const old=seg?.querySelector(`[data-v515-route="${CSS.escape(previous)}"]`);
        if(old)setGroupRouteVisual(old,previous);
      }
    });
    return;
  }

  const mainRoute=e.target.closest?.('[data-route-card]');
  if(mainRoute){
    const id=cardId(mainRoute),target=mainRoute.dataset.routeCard;
    if(id&&target){
      const seg=mainRoute.closest('.babySeg');
      const previous=seg?.querySelector('[data-route-card].active')?.dataset.routeCard||'';
      setMainRouteVisual(mainRoute,target);
      waitFor(s=>String(appFrom(s,id)?.application_bucket||'')===String(target)).then(ok=>{
        if(!ok&&previous){
          const old=seg?.querySelector(`[data-route-card="${CSS.escape(previous)}"]`);
          if(old)setMainRouteVisual(old,previous);
        }
      });
    }
    return;
  }

  const groupInvite=e.target.closest?.('[data-v515-invite]');
  if(groupInvite){
    const id=cardId(groupInvite),sent=groupInvite.dataset.v515Invite==='sent';
    if(!id)return;
    setInviteVisual(groupInvite,'[data-v515-invite]',sent);
    waitFor(s=>(appFrom(s,id)?.invite_status==='sent')===sent);
    return;
  }

  const mainInvite=e.target.closest?.('[data-invite-toggle]');
  if(mainInvite){
    const id=cardId(mainInvite),sent=mainInvite.dataset.inviteToggle==='sent';
    if(!id)return;
    setInviteVisual(mainInvite,'[data-invite-toggle]',sent);
    waitFor(s=>(appFrom(s,id)?.invite_status==='sent')===sent);
  }
},true);

document.addEventListener('change',e=>{
  const assign=e.target.closest?.('[data-v515-assign],[data-assign-card]');
  if(!assign)return;
  const id=cardId(assign),tag=String(assign.value||'');
  if(id)waitFor(s=>String(appFrom(s,id)?.assigned_alliance_tag||'')===tag);
},false);

/* Reorder already changes visually; verify persistence only */
let reorderTimer=null;
function verifyReorder(){
  clearTimeout(reorderTimer);
  reorderTimer=setTimeout(()=>snapshot(),500);
}
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-order-up],[data-order-down],[data-gup],[data-gdown]'))verifyReorder();
},true);
document.addEventListener('touchend',e=>{
  if(e.target.closest?.('.rank524,.groupRank524'))verifyReorder();
},{capture:true,passive:true});
document.addEventListener('pointerup',e=>{
  if(e.target.closest?.('.rank524,.groupRank524'))verifyReorder();
},{capture:true});

new MutationObserver(ensureStyles).observe(document.documentElement,{childList:true,subtree:true});
ensureStyles();
})();