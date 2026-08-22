/* NEXA V37 — SAFE RECOVERY + TARGETED MOBILE FIX
   Replaces V36 completely.
   Key rule: do NOT broadly mutate profile/library containers.
*/
(()=>{'use strict';
if(window.__NEXA_V37__) return;
window.__NEXA_V37__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

function installCSS(){
  $('#nexa-v37-css')?.remove();
  const s=document.createElement('style');
  s.id='nexa-v37-css';
  s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*,*:before,*:after{box-sizing:border-box!important}

/* HOME WIDTH */
main.shell{
  width:min(680px,calc(100% - 24px))!important;
  max-width:calc(100% - 24px)!important;
  margin-inline:auto!important;
}
@media(max-width:700px){
  main.shell{display:block!important}
  main.shell>*{max-width:100%!important;min-width:0!important}
}

/* NEXA heading */
main.shell>.hero{
  padding:14px 0 8px!important;
  min-height:0!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
}
main.shell>.hero h1{
  font-size:clamp(42px,12vw,62px)!important;
  line-height:.95!important;
  margin:0!important;
  letter-spacing:-.04em!important;
}
main.shell>.hero p{display:none!important}

/* Profile launcher should not look like a card */
#nexa-profile-launcher-section{
  width:100%!important;
  min-height:0!important;
  height:auto!important;
  margin:0 0 10px!important;
  padding:12px 0!important;
  background:transparent!important;
  border:0!important;
  border-radius:0!important;
  box-shadow:none!important;
  outline:0!important;
}
#nexa-profile-launcher-section:before,
#nexa-profile-launcher-section:after{display:none!important}

/* Compact home strips */
#nexa-v37-stellar,
#nexa-v37-pulse,
#nexa-v37-alliance,
#home-svs-section,
#home-transfers-section{
  width:100%!important;
  min-width:0!important;
  min-height:0!important;
  height:auto!important;
  margin:0 0 10px!important;
  border-radius:18px!important;
  overflow:hidden!important;
}
#nexa-v37-stellar{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:9px!important;
  padding:10px 13px!important;
  text-align:center!important;
  border:1px solid rgba(77,186,255,.42)!important;
  background:linear-gradient(145deg,rgba(10,24,48,.92),rgba(5,9,28,.97))!important;
}
#nexa-v37-stellar b{
  color:#86e9ff!important;
  font-size:9px!important;
  letter-spacing:.16em!important;
  white-space:nowrap!important
}
#nexa-v37-stellar span{font-size:11px!important;line-height:1.25!important;color:#c7d0e7!important}

#nexa-v37-pulse,#nexa-v37-alliance{padding:10px 13px!important}
#nexa-v37-pulse{
  border:1px solid rgba(48,211,255,.44)!important;
  background:linear-gradient(145deg,rgba(4,34,53,.93),rgba(4,11,30,.98))!important
}
#nexa-v37-alliance{
  border:1px solid rgba(219,66,255,.45)!important;
  background:linear-gradient(145deg,rgba(37,8,52,.93),rgba(13,6,30,.98))!important
}
.nexa-v37-kicker{
  font-size:8px!important;line-height:1!important;
  letter-spacing:.17em!important;font-weight:950!important;margin-bottom:4px!important
}
#nexa-v37-pulse .nexa-v37-kicker{color:#66eaff!important}
#nexa-v37-alliance .nexa-v37-kicker{color:#ec8cff!important}
#nexa-v37-pulse h3,#nexa-v37-alliance h3{
  margin:0 0 2px!important;font-size:14px!important;line-height:1.1!important
}
#nexa-v37-pulse p,#nexa-v37-alliance p{
  margin:0!important;font-size:10px!important;line-height:1.25!important;color:#acb7d0!important
}

/* Live Event / Transfers = strips, no nested card look */
#home-svs-section,#home-transfers-section{
  padding:10px 13px!important;
  background:linear-gradient(145deg,rgba(12,18,42,.94),rgba(6,10,27,.98))!important
}
#home-svs-section{border:1px solid rgba(126,105,255,.34)!important}
#home-transfers-section{border:1px solid rgba(255,137,76,.32)!important}
#home-svs-section>.head,#home-transfers-section>.head{
  padding:0!important;margin:0 0 5px!important;min-height:0!important
}
#home-svs-section>.head h2,#home-transfers-section>.head h2{
  margin:0!important;font-size:15px!important;line-height:1.1!important
}
#home-svs-section>.glass,#home-transfers-section>.glass,
#home-svs-section .event{
  padding:0!important;margin:0!important;
  min-height:0!important;height:auto!important;
  border:0!important;border-radius:0!important;
  background:transparent!important;box-shadow:none!important;outline:0!important
}
.nexa-v37-empty-copy{
  margin:0!important;font-size:10px!important;line-height:1.3!important;color:#acb7d0!important
}
#home-svs-section .btn,#home-transfers-section .btn{
  width:auto!important;min-width:80px!important;min-height:32px!important;
  padding:6px 11px!important;font-size:11px!important;border-radius:999px!important
}

/* PROFILE: exact native classes only. No dynamic rail classing. */
#nexa-profile-modal{
  padding:8px!important;
  overflow:hidden!important
}
#nexa-profile-modal .nexa-profile-sheet{
  width:min(680px,calc(100vw - 16px))!important;
  max-width:calc(100vw - 16px)!important;
  max-height:calc(100dvh - 16px)!important;
  margin:0 auto!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  border-radius:22px!important
}
#nexa-profile-modal .nexa-profile-hero{
  padding:52px 14px 14px!important;
  min-height:0!important
}
#nexa-profile-modal .nexa-profile-close{top:10px!important;right:10px!important}
#nexa-profile-modal .nexa-profile-main{
  display:flex!important;
  align-items:center!important;
  gap:10px!important;
  min-width:0!important
}
#nexa-profile-modal .nexa-photo-wrap{flex:0 0 64px!important}
#nexa-profile-modal .nexa-profile-photo{width:64px!important;height:64px!important}
#nexa-profile-modal .nexa-profile-identity{
  flex:1 1 auto!important;
  min-width:0!important;
  max-width:calc(100% - 74px)!important
}
#nexa-profile-modal .nexa-profile-name-line{
  display:block!important;
  min-width:0!important;
  max-width:100%!important
}
#nexa-profile-modal #nexa-profile-name{
  display:block!important;
  font-size:clamp(20px,5.7vw,27px)!important;
  line-height:1.05!important;
  margin:0 0 4px!important;
  max-width:100%!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important
}
#nexa-profile-modal #nexa-profile-player-id{
  display:block!important;
  max-width:100%!important;
  font-size:10px!important;
  line-height:1.2!important;
  white-space:normal!important;
  overflow-wrap:anywhere!important
}
#nexa-profile-modal .nexa-profile-sub{margin-top:6px!important;gap:5px!important;flex-wrap:wrap!important}
#nexa-profile-modal .nexa-glass-tag{font-size:8px!important;padding:3px 6px!important}
#nexa-profile-modal .nexa-profile-stats{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:6px!important;
  margin-top:10px!important
}
#nexa-profile-modal .nexa-stat{min-width:0!important;padding:8px 6px!important}
#nexa-profile-modal .nexa-stat label{font-size:7px!important}
#nexa-profile-modal .nexa-stat strong{font-size:12px!important}
#nexa-profile-modal .nexa-profile-edit-row{margin-top:7px!important}

/* FIX the exact tabs bar that became a huge vertical column */
#nexa-profile-modal .nexa-profile-tabs{
  display:flex!important;
  flex-direction:row!important;
  flex-wrap:nowrap!important;
  grid-template-columns:none!important;
  width:100%!important;
  min-width:0!important;
  min-height:auto!important;
  height:auto!important;
  max-height:none!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  scroll-snap-type:none!important;
  gap:5px!important;
  padding:8px 10px!important;
  scrollbar-width:none!important
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  flex:0 0 auto!important;
  width:auto!important;
  min-width:86px!important;
  min-height:34px!important;
  height:34px!important;
  max-height:34px!important;
  padding:6px 11px!important;
  writing-mode:horizontal-tb!important;
  white-space:nowrap!important
}
#nexa-profile-modal .nexa-profile-content{
  width:100%!important;
  min-width:0!important;
  padding:10px!important;
  overflow-x:hidden!important
}

/* Native library cards */
#nexa-profile-modal .nexa-lib-grid{
  display:grid!important;
  grid-template-columns:1fr!important;
  width:100%!important;
  min-width:0!important
}
#nexa-profile-modal .nexa-lib-card{width:100%!important;min-width:0!important}
#nexa-profile-modal .nexa-lib-owned{display:none!important}

/* Hide Owned rows from detailed v20 configuration without touching layout parents */
#nexa-profile-modal label:has(input[type="checkbox"])[class*="owned" i],
#nexa-profile-modal [class*="owned" i]:has(input[type="checkbox"]){
  display:none!important
}

/* Old V36/V35 classes must not survive */
.nexa-v36-rail,.nexa-v36-config,.nexa-v36-num,
.nexa-v35-rail,.nexa-v35-config-root,.nexa-v35-level{
  all:unset
}
#nexa-v36-tools,#nexa-v35-config-tools,.nexa-v34-tools,.nexa-v33-tools{display:none!important}
#nexa-v36-stellar,#nexa-v35-stellar,#nexa-v34-stellar,#nexa-v33-stellar,
#nexa-v36-pulse,#nexa-v35-pulse,#nexa-v34-pulse,
#nexa-v36-alliance,#nexa-v35-alliance,#nexa-v34-alliance,
#nexa-v33-signal-wrap{display:none!important}
`;
  document.head.appendChild(s);
}

function removeBadClasses(){
  $$('.nexa-v36-rail,.nexa-v36-config,.nexa-v36-num,.nexa-v35-rail,.nexa-v35-config-root,.nexa-v35-level')
    .forEach(e=>{
      e.classList.remove('nexa-v36-rail','nexa-v36-config','nexa-v36-num','nexa-v35-rail','nexa-v35-config-root','nexa-v35-level');
      if(e.dataset?.nexaV36RailKey) delete e.dataset.nexaV36RailKey;
      if(e.dataset?.nexaV36Bound) delete e.dataset.nexaV36Bound;
    });
  ['nexa-v36-tools','nexa-v35-config-tools','nexa-v36-stellar','nexa-v35-stellar','nexa-v34-stellar','nexa-v33-stellar','nexa-v36-pulse','nexa-v35-pulse','nexa-v34-pulse','nexa-v36-alliance','nexa-v35-alliance','nexa-v34-alliance','nexa-v33-signal-wrap']
    .forEach(id=>$('#'+id)?.remove());
}

function ensureHome(){
  const main=$('main.shell');
  const profile=$('#nexa-profile-launcher-section');
  if(!main||!profile) return;

  // remove any other compact stellar duplicate
  $$('section,article,div',main).forEach(e=>{
    if(e.id==='nexa-v37-stellar') return;
    const t=tx(e);
    if(/\bSTELLAR SIGNAL\b/i.test(t) && t.length<400) e.remove();
  });

  let stellar=$('#nexa-v37-stellar');
  if(!stellar){
    stellar=document.createElement('section');
    stellar.id='nexa-v37-stellar';
    stellar.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>';
  }
  main.insertBefore(stellar,profile);

  const live=$('#home-svs-section');
  if(live){
    const title=tx($('#home-event-title'));
    const countdown=tx($('#home-event-countdown'));
    const inactive=!title || /XXXX|TBD|NO\s+EVENT/i.test(title) || !countdown || /^[—–-]+$/.test(countdown);
    let empty=$('#nexa-v37-live-empty',live);
    if(inactive){
      $('.glass',live)?.setAttribute('hidden','');
      $('.event-actions',live)?.setAttribute('hidden','');
      if(!empty){
        empty=document.createElement('p');
        empty.id='nexa-v37-live-empty';
        empty.className='nexa-v37-empty-copy';
        empty.textContent='Server events and current SvS information will appear here when published.';
        live.appendChild(empty);
      }
    }else{
      $('.glass',live)?.removeAttribute('hidden');
      $('.event-actions',live)?.removeAttribute('hidden');
      empty?.remove();
    }
  }

  const transfer=$('#home-transfers-section');
  if(transfer){
    const data=$('#home-transfer-events');
    const content=tx(data);
    const inactive=!content || /Transfer Center|Applications stay available|next transfer cycle/i.test(content);
    data?.toggleAttribute('hidden',inactive);
    $('.nexa-transfer-home-actions',transfer)?.toggleAttribute('hidden',inactive);
    let empty=$('#nexa-v37-transfer-empty',transfer);
    if(inactive && !empty){
      empty=document.createElement('p');
      empty.id='nexa-v37-transfer-empty';
      empty.className='nexa-v37-empty-copy';
      empty.textContent='Transfer cycle information will appear here when a cycle is published.';
      transfer.appendChild(empty);
    }else if(!inactive) empty?.remove();
  }

  let pulse=$('#nexa-v37-pulse');
  if(!pulse){
    pulse=document.createElement('section');
    pulse.id='nexa-v37-pulse';
    pulse.innerHTML='<div class="nexa-v37-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>';
  }
  let alliance=$('#nexa-v37-alliance');
  if(!alliance){
    alliance=document.createElement('section');
    alliance.id='nexa-v37-alliance';
    alliance.innerHTML='<div class="nexa-v37-kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>';
  }
  const anchor=transfer||live||profile;
  anchor.after(pulse);
  pulse.after(alliance);
}

function run(){
  installCSS();
  removeBadClasses();
  ensureHome();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,500);setTimeout(run,1400)},{once:true});
}else{
  run();setTimeout(run,500);setTimeout(run,1400);
}

let busy=false;
new MutationObserver(()=>{
  if(busy)return;
  busy=true;
  requestAnimationFrame(()=>{busy=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});
})();