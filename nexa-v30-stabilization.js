/* NEXA V36 — HARD ROOT UI FIX
   Replaces V35. Targets the exact production DOM from index.html.
   No Supabase schema/data changes. No troop artwork changes.
*/
(()=>{'use strict';
if(window.__NEXA_V36__) return;
window.__NEXA_V36__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

function css(){
  $('#nexa-v36-css')?.remove();
  const s=document.createElement('style');
  s.id='nexa-v36-css';
  s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*,*:before,*:after{box-sizing:border-box!important}

/* HOME SHELL */
main.shell{
  width:min(680px,calc(100% - 24px))!important;
  max-width:calc(100% - 24px)!important;
  margin:0 auto!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:10px!important;
}
main.shell>*{grid-column:1!important;min-width:0!important;max-width:100%!important}

/* NEXA title only — remove old subtitle/build proof */
main.shell>.hero{
  padding:16px 0 4px!important;
  margin:0!important;
  min-height:0!important;
  background:transparent!important;border:0!important;box-shadow:none!important;
}
main.shell>.hero h1{
  font-size:clamp(42px,12vw,62px)!important;line-height:.95!important;
  margin:0!important;letter-spacing:-.045em!important;
}
main.shell>.hero p{display:none!important}
main.shell>.shell:has(.build-proof),.build-proof{display:none!important}

/* PROFILE LAUNCHER = orbit/profile only, never a rectangle/card */
#nexa-profile-launcher-section{
  width:100%!important;max-width:100%!important;
  padding:10px 0 12px!important;margin:0!important;
  min-height:0!important;height:auto!important;
  background:transparent!important;border:0!important;border-radius:0!important;
  box-shadow:none!important;outline:0!important;
}
#nexa-profile-launcher-section:before,#nexa-profile-launcher-section:after{display:none!important}
#nexa-profile-launcher{width:100px!important;height:100px!important}
#nexa-profile-launcher-photo{width:86px!important;height:86px!important;inset:7px!important}
#nexa-profile-launcher-name{
  max-width:96%!important;text-align:center!important;white-space:normal!important;
  overflow-wrap:anywhere!important;font-size:14px!important;line-height:1.15!important;margin-top:8px!important
}
#nexa-profile-launcher-badge{margin-top:6px!important}

/* COMMON HOME SIGNAL STRIP */
#nexa-v36-stellar,#nexa-v36-pulse,#nexa-v36-alliance,
#home-svs-section,#home-transfers-section{
  width:100%!important;max-width:100%!important;min-width:0!important;
  min-height:0!important;height:auto!important;margin:0!important;
  border-radius:18px!important;overflow:hidden!important;
}
#nexa-v36-stellar{
  padding:10px 13px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  gap:9px!important;text-align:center!important;
  border:1px solid rgba(74,185,255,.44)!important;
  background:linear-gradient(145deg,rgba(10,24,49,.92),rgba(6,9,29,.96))!important;
}
#nexa-v36-stellar b{color:#84e8ff!important;font-size:9px!important;letter-spacing:.16em!important;white-space:nowrap!important}
#nexa-v36-stellar span{font-size:11px!important;line-height:1.25!important;color:#c4cee7!important}

#nexa-v36-pulse,#nexa-v36-alliance{padding:10px 13px!important}
#nexa-v36-pulse{
  border:1px solid rgba(48,211,255,.44)!important;
  background:linear-gradient(145deg,rgba(5,34,53,.92),rgba(4,12,31,.97))!important;
}
#nexa-v36-alliance{
  border:1px solid rgba(220,64,255,.45)!important;
  background:linear-gradient(145deg,rgba(38,8,52,.92),rgba(13,6,31,.97))!important;
}
.nexa-v36-kicker{font-size:8px!important;line-height:1!important;letter-spacing:.17em!important;font-weight:950!important;margin-bottom:4px!important}
#nexa-v36-pulse .nexa-v36-kicker{color:#67eaff!important}
#nexa-v36-alliance .nexa-v36-kicker{color:#ed8cff!important}
#nexa-v36-pulse h3,#nexa-v36-alliance h3{
  margin:0 0 2px!important;font-size:14px!important;line-height:1.1!important
}
#nexa-v36-pulse p,#nexa-v36-alliance p{
  margin:0!important;font-size:10px!important;line-height:1.25!important;color:#aeb8d1!important
}

/* LIVE EVENT + TRANSFERS become compact strips when inactive */
#home-svs-section,#home-transfers-section{
  padding:10px 13px!important;
  background:linear-gradient(145deg,rgba(13,18,43,.93),rgba(6,10,28,.97))!important;
}
#home-svs-section{border:1px solid rgba(126,105,255,.36)!important}
#home-transfers-section{border:1px solid rgba(255,137,76,.34)!important}
#home-svs-section>.head,#home-transfers-section>.head{
  padding:0!important;margin:0 0 5px!important;display:block!important;min-height:0!important
}
#home-svs-section>.head h2,#home-transfers-section>.head h2{
  margin:0!important;font-size:15px!important;line-height:1.1!important
}
#home-svs-section>.head span,#home-transfers-section>.head span{display:none!important}
#home-svs-section>.glass,#home-transfers-section>.glass{
  padding:0!important;margin:0!important;min-height:0!important;height:auto!important;
  background:transparent!important;border:0!important;border-radius:0!important;
  box-shadow:none!important;outline:0!important;
}
#home-svs-section .event{
  padding:0!important;margin:0!important;min-height:0!important;
  background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;
}
#home-svs-section .event-row{display:block!important}
#home-svs-section .event h3{margin:0 0 2px!important;font-size:12px!important;line-height:1.2!important}
#home-svs-section .muted{font-size:10px!important;line-height:1.25!important}
#home-svs-section .count{margin:4px 0 0!important;text-align:left!important}
#home-svs-section .count small{font-size:8px!important}
#home-svs-section .count b{font-size:11px!important}
#home-svs-section .event-actions,
#home-transfers-section .nexa-transfer-home-actions{margin-top:7px!important;padding:0!important}
#home-svs-section .btn,#home-transfers-section .btn{
  min-height:32px!important;width:auto!important;min-width:78px!important;
  padding:6px 11px!important;font-size:11px!important;border-radius:999px!important
}
.nexa-v36-empty-copy{font-size:10px!important;line-height:1.3!important;color:#aeb8d1!important;margin:0!important}

/* PLAYER PASSPORT: keep everything inside viewport, give top breathing room */
#nexa-profile-modal{padding:8px!important;overflow:hidden!important}
#nexa-profile-modal .nexa-profile-sheet{
  width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
  max-height:calc(100dvh - 16px)!important;margin:0 auto!important;
  overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
  border-radius:22px!important;
}
#nexa-profile-modal .nexa-profile-hero{
  padding:52px 14px 14px!important;min-height:0!important;overflow:visible!important;
}
#nexa-profile-modal .nexa-profile-close{top:10px!important;right:10px!important}
#nexa-profile-modal .nexa-profile-main{gap:10px!important;align-items:center!important;min-width:0!important}
#nexa-profile-modal .nexa-photo-wrap{flex:0 0 64px!important}
#nexa-profile-modal .nexa-profile-photo{width:64px!important;height:64px!important}
#nexa-profile-modal .nexa-profile-identity{min-width:0!important;max-width:calc(100% - 74px)!important}
#nexa-profile-modal .nexa-profile-name-line{
  display:block!important;min-width:0!important;max-width:100%!important
}
#nexa-profile-modal #nexa-profile-name{
  display:block!important;max-width:100%!important;
  font-size:clamp(20px,5.7vw,27px)!important;line-height:1.05!important;
  letter-spacing:-.02em!important;margin:0 0 4px!important;
  overflow-wrap:anywhere!important;word-break:break-word!important
}
#nexa-profile-modal #nexa-profile-player-id{
  display:block!important;max-width:100%!important;
  font-size:10px!important;line-height:1.2!important;overflow-wrap:anywhere!important
}
#nexa-profile-modal .nexa-profile-sub{margin-top:6px!important;gap:5px!important}
#nexa-profile-modal .nexa-glass-tag{font-size:8px!important;padding:3px 6px!important}
#nexa-profile-modal .nexa-profile-stats{margin-top:10px!important;gap:6px!important}
#nexa-profile-modal .nexa-stat{padding:8px 6px!important;min-width:0!important}
#nexa-profile-modal .nexa-stat label{font-size:7px!important}
#nexa-profile-modal .nexa-stat strong{font-size:12px!important;overflow-wrap:anywhere!important}
#nexa-profile-modal .nexa-profile-edit-row{margin-top:7px!important}
#nexa-profile-modal .nexa-profile-tabs{
  position:sticky!important;top:0!important;z-index:20!important;
  display:flex!important;grid-template-columns:none!important;flex-wrap:nowrap!important;
  overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;
  scroll-snap-type:none!important;scroll-behavior:auto!important;touch-action:pan-x!important;
  gap:5px!important;padding:8px 10px!important;scrollbar-width:none!important;
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;white-space:nowrap!important;min-width:90px!important}
#nexa-profile-modal .nexa-profile-content{padding:10px!important;overflow-x:hidden!important;min-width:0!important}

/* Configuration card must be IN profile flow, not floating over the passport */
.nexa-v36-config{
  position:relative!important;inset:auto!important;top:auto!important;left:auto!important;right:auto!important;
  transform:none!important;z-index:auto!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
  max-height:none!important;height:auto!important;margin:0!important;
  overflow:visible!important;border-radius:18px!important;
}
.nexa-v36-config input[type=number],.nexa-v36-config select{
  max-width:100%!important;font-size:16px!important
}

/* OWNED: hide whole checkbox row */
.nexa-v36-owned-row{display:none!important}

/* Compact numerical controls only */
.nexa-v36-num{
  min-width:38px!important;min-height:34px!important;height:auto!important;
  width:auto!important;padding:5px 8px!important;font-size:13px!important;line-height:1!important
}

/* True horizontal rails. Their scroll position is preserved by JS. */
.nexa-v36-rail{
  display:flex!important;grid-template-columns:none!important;flex-direction:row!important;
  flex-wrap:nowrap!important;width:100%!important;max-width:100%!important;min-width:0!important;
  overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;
  scroll-snap-type:none!important;scroll-behavior:auto!important;overscroll-behavior-x:contain!important;
  touch-action:pan-x!important;gap:8px!important;scrollbar-width:none!important;
}
.nexa-v36-rail::-webkit-scrollbar{display:none!important}
.nexa-v36-rail>*{
  flex:0 0 auto!important;scroll-snap-align:none!important;scroll-snap-stop:normal!important;
}

/* Reset + help live inside configuration, not at viewport top */
#nexa-v36-tools{
  position:static!important;inset:auto!important;transform:none!important;z-index:auto!important;
  display:flex!important;gap:7px!important;align-items:center!important;
  width:auto!important;height:auto!important;margin:0 0 10px!important;padding:0!important;
  background:transparent!important;border:0!important;box-shadow:none!important
}
#nexa-v36-tools button{
  position:static!important;inset:auto!important;transform:none!important;
  min-height:32px!important;border-radius:999px!important;font-size:11px!important;font-weight:900!important;
  border:1px solid rgba(102,105,255,.55)!important;background:#111630!important;color:#eef3ff!important
}
#nexa-v36-reset{padding:5px 12px!important}
#nexa-v36-help{width:32px!important;min-width:32px!important;padding:0!important;color:#83e8ff!important;border-color:rgba(60,205,255,.55)!important}

/* Old runtime leftovers */
.nexa-v34-tools,.nexa-v33-tools,#nexa-v35-config-tools{display:none!important}
#nexa-v34-stellar,#nexa-v33-stellar,#nexa-v35-stellar,
#nexa-v34-pulse,#nexa-v35-pulse,#nexa-v34-alliance,#nexa-v35-alliance,
#nexa-v33-signal-wrap{display:none!important}

/* Admin/Alliance modal mobile containment */
#admin-modal .admin-modal-card{
  width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
  max-height:calc(100dvh - 16px)!important;margin:8px auto!important;
  overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
}
#admin-modal .admin-modal-card *{max-width:100%}
`;
  document.head.appendChild(s);
}

function cleanOld(){
  ['nexa-v34-stellar','nexa-v33-stellar','nexa-v35-stellar','nexa-v34-pulse','nexa-v35-pulse','nexa-v34-alliance','nexa-v35-alliance','nexa-v33-signal-wrap','nexa-v35-config-tools']
    .forEach(id=>$('#'+id)?.remove());
  $$('.nexa-v34-tools,.nexa-v33-tools').forEach(e=>e.remove());
}

function forceHomeOnBoot(){
  if(window.__NEXA_V36_BOOT_CLOSED__) return;
  // Direct/deep links are respected. Plain home always starts clean.
  const p=new URLSearchParams(location.search);
  if(p.has('direct')||p.has('admin')||p.has('module')) return;
  window.__NEXA_V36_BOOT_CLOSED__=true;
  ['#admin-modal','#accounts-modal','#nexa-account-constellation','#nexa-profile-modal'].forEach(sel=>{
    const e=$(sel); if(!e)return;
    e.classList.remove('open','module-view','native-eventops-view','native-svs-view');
    e.setAttribute('aria-hidden','true');
  });
  $('#nexa-home-menu')?.setAttribute('aria-hidden','true');
  $('#nexa-home-menu-toggle')?.setAttribute('aria-expanded','false');
  window.scrollTo({top:0,left:0,behavior:'auto'});
}

function home(){
  const main=$('main.shell'), profile=$('#nexa-profile-launcher-section');
  if(!main||!profile)return;

  // One Stellar only.
  $$('section,article,div',main).forEach(e=>{
    if(e.id==='nexa-v36-stellar')return;
    const t=text(e);
    if(/\bSTELLAR SIGNAL\b/i.test(t) && t.length<420) e.remove();
  });
  let stellar=$('#nexa-v36-stellar');
  if(!stellar){
    stellar=document.createElement('section');
    stellar.id='nexa-v36-stellar';
    stellar.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>';
  }
  main.insertBefore(stellar,profile);

  // Live Event placeholder -> explanation only, no nested card/button.
  const live=$('#home-svs-section');
  if(live){
    const title=text($('#home-event-title'));
    const countdown=text($('#home-event-countdown'));
    const inactive=!title || /XXXX|TBD|NO\s+EVENT/i.test(title) || !countdown || /^[—–-]+$/.test(countdown);
    live.classList.toggle('nexa-v36-inactive',inactive);
    let empty=$('#nexa-v36-live-empty',live);
    if(inactive){
      $('.glass',live)?.setAttribute('hidden','');
      $('.event-actions',live)?.setAttribute('hidden','');
      if(!empty){
        empty=document.createElement('p');empty.id='nexa-v36-live-empty';empty.className='nexa-v36-empty-copy';
        empty.textContent='Server events and current SvS information will appear here when published.';
        live.appendChild(empty);
      }
    }else{
      $('.glass',live)?.removeAttribute('hidden');
      $('.event-actions',live)?.removeAttribute('hidden');
      empty?.remove();
    }
  }

  // Transfer placeholder -> explanation only, no Open until actual cycle info exists.
  const transfer=$('#home-transfers-section');
  if(transfer){
    const data=$('#home-transfer-events');
    const t=text(data);
    const inactive=!t || /Transfer Center|Applications stay available|No .*transfer|next transfer cycle/i.test(t);
    data?.toggleAttribute('hidden',inactive);
    $('.nexa-transfer-home-actions',transfer)?.toggleAttribute('hidden',inactive);
    let empty=$('#nexa-v36-transfer-empty',transfer);
    if(inactive && !empty){
      empty=document.createElement('p');empty.id='nexa-v36-transfer-empty';empty.className='nexa-v36-empty-copy';
      empty.textContent='Transfer cycle information will appear here when a cycle is published.';
      transfer.appendChild(empty);
    }
    if(!inactive) empty?.remove();
  }

  let pulse=$('#nexa-v36-pulse');
  if(!pulse){
    pulse=document.createElement('section');pulse.id='nexa-v36-pulse';
    pulse.innerHTML='<div class="nexa-v36-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>';
  }
  let alliance=$('#nexa-v36-alliance');
  if(!alliance){
    alliance=document.createElement('section');alliance.id='nexa-v36-alliance';
    alliance.innerHTML='<div class="nexa-v36-kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>';
  }
  const anchor=transfer||live||profile;
  anchor.after(pulse); pulse.after(alliance);
}

const railMemory=new Map();
let railNo=0;
function railKey(e){
  if(!e.dataset.nexaV36RailKey)e.dataset.nexaV36RailKey='r'+(++railNo);
  return e.dataset.nexaV36RailKey;
}
function identifyRails(root=document){
  $$('nav,div,section',root).forEach(e=>{
    if(e.children.length<2)return;
    const c=String(e.className||''),t=text(e);
    const semantic=
      /generation|generations|tier|tabs|chips|carousel|filter|selector|rarity/i.test(c) ||
      (/\bGEN\s*1\b/i.test(t)&&/\bGEN\s*(?:2|3)\b/i.test(t)) ||
      (/\bT1\b/i.test(t)&&/\bT2\b/i.test(t)) ||
      (/\bHEROES\b/i.test(t)&&/\bEXPERTS\b/i.test(t)&&/\bTROOPS\b/i.test(t));
    if(!semantic)return;
    e.classList.add('nexa-v36-rail');
    const k=railKey(e);
    if(!e.dataset.nexaV36Bound){
      e.dataset.nexaV36Bound='1';
      e.addEventListener('scroll',()=>railMemory.set(k,e.scrollLeft),{passive:true});
      e.addEventListener('touchend',()=>railMemory.set(k,e.scrollLeft),{passive:true});
    }
    const saved=railMemory.get(k);
    if(Number.isFinite(saved) && Math.abs(e.scrollLeft-saved)>8){
      requestAnimationFrame(()=>{e.scrollLeft=saved});
    }
  });
}

function configurationRoot(){
  const title=$$('h1,h2,h3,div,span,strong,b').find(e=>e.children.length===0 && /PROFILE CONFIGURATION/i.test(text(e)));
  if(!title)return null;
  let p=title;
  for(let i=0;i<8&&p;i++,p=p.parentElement){
    const r=p.getBoundingClientRect(),t=text(p);
    if(r.width>270 && r.height>250 && t.length<10000 && /HERO|EXPERT|TROOP|PET|CHIEF/i.test(t)) return p;
  }
  return null;
}
function owned(root=document){
  $$('label,div,span,strong,b,p',root).forEach(e=>{
    if(!/\bOWNED\b/i.test(text(e)))return;
    if(e.children.length===0){
      let row=e.parentElement;
      for(let i=0;i<3&&row;i++,row=row.parentElement){
        if(row.querySelector?.('input[type="checkbox"]') && row.getBoundingClientRect().height<120){
          row.classList.add('nexa-v36-owned-row');break;
        }
      }
      if(!row)e.classList.add('nexa-v36-owned-row');
    }
  });
}
function compactNums(root=document){
  $$('button,input[type=number],select',root).forEach(e=>{
    const t=text(e)||e.value||'';
    if(/^(?:T|FC|GEN)?\s*(?:[0-9]{1,2}|MAX|MAXED|NONE)$/i.test(t))e.classList.add('nexa-v36-num');
  });
}
function resetConfig(root){
  $$('input,select',root).forEach(el=>{
    if(el.type==='checkbox'||el.type==='radio')el.checked=false;
    else if(el.tagName==='SELECT')el.selectedIndex=0;
    else if(el.type==='number')el.value=el.min||'0';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
}
function help(){
  $('#nexa-v36-helpbox')?.remove();
  const d=document.createElement('div');d.id='nexa-v36-helpbox';
  Object.assign(d.style,{position:'fixed',left:'16px',right:'16px',top:'50%',transform:'translateY(-50%)',zIndex:'2147483640',maxWidth:'480px',margin:'auto',padding:'18px',borderRadius:'18px',background:'#080d24',border:'1px solid rgba(113,91,255,.7)',boxShadow:'0 0 36px rgba(90,68,255,.35)',color:'#eef4ff'});
  d.innerHTML='<b style="color:#83e8ff;letter-spacing:.12em">NEXA GUIDE</b><p style="font-size:13px;line-height:1.45;color:#c4cee7">Set the levels that match this account. Reset clears the current configuration so you can enter it again.</p><button type="button" style="width:100%;padding:9px;border-radius:999px;border:1px solid #675cff;background:#121735;color:white;font-weight:900">Close</button>';
  d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}
function config(){
  const root=configurationRoot();if(!root)return;
  root.classList.add('nexa-v36-config');
  owned(root);compactNums(root);identifyRails(root);

  // Remove old floating Reset / ? controls near the viewport top.
  $$('button',document).forEach(b=>{
    if(b.closest('#nexa-v36-tools'))return;
    const t=text(b),r=b.getBoundingClientRect(),pos=getComputedStyle(b).position;
    if((t==='Reset'||t==='?') && r.top<190 && (pos==='fixed'||pos==='absolute')) b.remove();
  });

  let tools=$('#nexa-v36-tools');
  if(!tools){
    tools=document.createElement('div');tools.id='nexa-v36-tools';
    tools.innerHTML='<button id="nexa-v36-reset" type="button">Reset</button><button id="nexa-v36-help" type="button">?</button>';
    tools.querySelector('#nexa-v36-reset').onclick=()=>resetConfig(root);
    tools.querySelector('#nexa-v36-help').onclick=help;
    root.prepend(tools);
  }else if(!root.contains(tools))root.prepend(tools);
}

function run(){
  css();cleanOld();home();
  identifyRails();owned();compactNums();
  const pm=$('#nexa-profile-modal');if(pm){identifyRails(pm);owned(pm);compactNums(pm)}
  config();
}

function boot(){
  run();
  setTimeout(forceHomeOnBoot,450);
  setTimeout(forceHomeOnBoot,1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

let pending=false;
new MutationObserver(()=>{
  if(pending)return;pending=true;
  setTimeout(()=>{pending=false;run()},100);
}).observe(document.documentElement,{subtree:true,childList:true});

// Re-assert layout after async Supabase/profile renders, without polling scrollLeft to zero.
window.addEventListener('pageshow',()=>setTimeout(run,80));
window.addEventListener('load',()=>setTimeout(run,100));
})();