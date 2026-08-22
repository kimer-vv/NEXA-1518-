/* NEXA V35 — HARD UI CONSOLIDATION
   Purpose: one authoritative late runtime layer for the current production index.
   Does not change Supabase data, Account Constellation logic, or troop artwork.
*/
(()=>{'use strict';
if(window.__NEXA_V35__) return;
window.__NEXA_V35__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const isEl=e=>e instanceof HTMLElement;

function installCSS(){
  $('#nexa-v35-hard-css')?.remove();
  const s=document.createElement('style');
  s.id='nexa-v35-hard-css';
  s.textContent=`
/* ---------- GLOBAL MOBILE SAFETY ---------- */
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*,*:before,*:after{box-sizing:border-box!important}
body{overscroll-behavior-x:none!important}

/* ---------- TOP BRAND: proportional, not giant ---------- */
main.shell>.hero{
  grid-column:1/-1!important;
  padding:14px 8px 8px!important;
  min-height:0!important;
  margin:0!important;
}
main.shell>.hero h1{
  font-size:clamp(38px,12vw,64px)!important;
  line-height:.92!important;
  margin:0 0 6px!important;
  letter-spacing:-.045em!important;
}
main.shell>.hero p{
  font-size:10px!important;
  line-height:1.3!important;
  letter-spacing:.13em!important;
  margin:0!important;
}

/* ---------- HOME: ONE COLUMN, COMPACT WHEN EMPTY ---------- */
@media(max-width:700px){
  main.shell{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    gap:10px!important;
  }
  main.shell>*{min-width:0!important;grid-column:1!important}
}
#home-svs-section,#home-transfers-section,
#nexa-v35-stellar,#nexa-v35-pulse,#nexa-v35-alliance{
  grid-column:1/-1!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
  min-height:0!important;
  height:auto!important;
  margin:0 0 10px!important;
  border-radius:20px!important;
  overflow:hidden!important;
}
#home-svs-section,#home-transfers-section{
  padding:0!important;
}
#home-svs-section>.head,#home-transfers-section>.head{
  padding:12px 14px 5px!important;
  min-height:0!important;
}
#home-svs-section>.head h2,#home-transfers-section>.head h2{
  font-size:17px!important;line-height:1.1!important;margin:0!important
}
#home-svs-section>.head span,#home-transfers-section>.head span{
  font-size:9px!important
}
/* Kill card-inside-card appearance */
#home-svs-section>.glass,#home-transfers-section>.glass{
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  border-radius:0!important;
  margin:0!important;
  padding:7px 14px 12px!important;
  min-height:0!important;
  height:auto!important;
}
#home-svs-section .event{
  border:0!important;background:transparent!important;box-shadow:none!important;
  padding:0!important;margin:0!important;min-height:0!important;
}
#home-svs-section .event-row{gap:8px!important}
#home-svs-section .event h3{font-size:15px!important;line-height:1.15!important;margin:0 0 3px!important}
#home-svs-section .muted{font-size:10px!important}
#home-svs-section .count{margin:0!important}
#home-svs-section .count small{font-size:8px!important}
#home-svs-section .count b{font-size:12px!important}
#home-svs-section .event-actions{margin-top:8px!important}
#home-svs-section .btn,#home-transfers-section .btn{
  min-height:34px!important;height:auto!important;padding:7px 12px!important;
  font-size:12px!important;width:auto!important;min-width:92px!important;
}
/* Empty Transfers must collapse instead of reserving a giant card */
#home-transfer-events:empty{
  display:none!important;min-height:0!important;height:0!important;padding:0!important;margin:0!important;
}
#home-transfer-events:empty:before{display:none!important;content:none!important}
#home-transfers-section:has(#home-transfer-events:empty){
  min-height:0!important;
}
#home-transfers-section .nexa-transfer-home-actions{
  padding:5px 14px 12px!important;
}
#home-transfers-section .nexa-transfer-open-btn{
  width:auto!important;min-width:92px!important;min-height:34px!important;
}

/* ---------- STELLAR: exactly one, directly above profile ---------- */
#nexa-v35-stellar{
  min-height:56px!important;padding:10px 14px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;
  text-align:center!important;position:relative!important;
  border:1px solid rgba(92,168,255,.44)!important;
  background:radial-gradient(circle at 12% 0%,rgba(73,217,255,.12),transparent 36%),linear-gradient(145deg,rgba(11,19,49,.95),rgba(5,8,27,.98))!important;
  box-shadow:0 0 22px rgba(55,150,255,.09)!important;
}
#nexa-v35-stellar b{font-size:10px!important;letter-spacing:.18em!important;color:#8de9ff!important;white-space:nowrap}
#nexa-v35-stellar span{font-size:12px!important;line-height:1.3!important;color:#cbd5ef!important}

/* ---------- PULSE / ALLIANCE: intentionally different colors ---------- */
#nexa-v35-pulse,#nexa-v35-alliance{
  min-height:58px!important;padding:11px 14px!important;
}
#nexa-v35-pulse{
  border:1px solid rgba(65,210,255,.42)!important;
  background:radial-gradient(circle at 10% 10%,rgba(41,205,255,.13),transparent 34%),linear-gradient(145deg,rgba(7,25,48,.96),rgba(5,9,28,.98))!important;
  box-shadow:0 0 22px rgba(35,185,255,.08)!important;
}
#nexa-v35-alliance{
  border:1px solid rgba(211,83,255,.42)!important;
  background:radial-gradient(circle at 10% 10%,rgba(218,66,255,.12),transparent 34%),linear-gradient(145deg,rgba(28,11,48,.96),rgba(8,7,28,.98))!important;
  box-shadow:0 0 22px rgba(195,55,255,.08)!important;
}
.nexa-v35-kicker{font-size:9px!important;letter-spacing:.18em!important;font-weight:900!important;margin-bottom:3px!important}
#nexa-v35-pulse .nexa-v35-kicker{color:#66e7ff!important}
#nexa-v35-alliance .nexa-v35-kicker{color:#e78cff!important}
#nexa-v35-pulse h3,#nexa-v35-alliance h3{font-size:15px!important;line-height:1.15!important;margin:0 0 2px!important}
#nexa-v35-pulse p,#nexa-v35-alliance p{font-size:11px!important;line-height:1.3!important;margin:0!important;color:#aeb8d2!important}

/* ---------- HOME PROFILE LAUNCHER ---------- */
#nexa-profile-launcher-section{
  grid-column:1/-1!important;
  margin:4px auto 12px!important;
  padding:0!important;
  min-height:0!important;
}

/* ---------- DIGITAL / PLAYER PROFILE: exact native classes ---------- */
#nexa-profile-modal{
  overflow:hidden!important;
}
#nexa-profile-modal .nexa-profile-sheet{
  width:min(720px,calc(100vw - 12px))!important;
  max-width:calc(100vw - 12px)!important;
  max-height:calc(100dvh - 12px)!important;
  height:auto!important;
  margin:6px auto!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;
  border-radius:22px!important;
}
#nexa-profile-modal .nexa-profile-hero{
  padding:20px 16px 14px!important;
  min-height:0!important;
}
#nexa-profile-modal .nexa-profile-main{
  gap:12px!important;min-width:0!important;align-items:center!important
}
#nexa-profile-modal .nexa-profile-photo{width:70px!important;height:70px!important;flex:0 0 70px!important}
#nexa-profile-modal .nexa-profile-identity{min-width:0!important;flex:1 1 auto!important}
#nexa-profile-modal .nexa-profile-name-line{
  min-width:0!important;display:flex!important;flex-wrap:wrap!important;align-items:baseline!important;gap:4px 8px!important
}
#nexa-profile-modal .nexa-profile-name{
  font-size:clamp(21px,6.2vw,31px)!important;
  line-height:1.02!important;margin:0!important;letter-spacing:-.025em!important;
  max-width:100%!important;overflow-wrap:anywhere!important
}
#nexa-profile-modal .nexa-profile-id{
  font-size:11px!important;line-height:1.2!important;letter-spacing:.03em!important;
  max-width:100%!important;overflow-wrap:anywhere!important
}
#nexa-profile-modal .nexa-profile-sub{gap:5px!important;flex-wrap:wrap!important}
#nexa-profile-modal .nexa-glass-tag{font-size:9px!important;padding:4px 7px!important}
#nexa-profile-modal .nexa-profile-stats{margin-top:12px!important;gap:7px!important}
#nexa-profile-modal .nexa-stat{padding:9px 7px!important;min-width:0!important}
#nexa-profile-modal .nexa-stat label{font-size:8px!important}
#nexa-profile-modal .nexa-stat strong{font-size:13px!important;overflow-wrap:anywhere!important}
#nexa-profile-modal .nexa-profile-edit-row{margin-top:8px!important}
#nexa-profile-modal .nexa-profile-tabs{
  position:sticky!important;top:0!important;z-index:5!important;
  display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;touch-action:pan-x!important;
  scrollbar-width:none!important;max-width:100%!important;
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;white-space:nowrap!important;scroll-snap-align:none!important}
#nexa-profile-modal .nexa-profile-content{
  padding:14px!important;min-width:0!important;overflow-x:hidden!important;
}

/* ---------- ALL DYNAMIC LIBRARY RAILS: native horizontal scroll, never vertical columns ---------- */
.nexa-v35-rail{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
  overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  scroll-snap-type:none!important;scroll-behavior:auto!important;
  overscroll-behavior-x:contain!important;touch-action:pan-x!important;
  scrollbar-width:none!important;gap:8px!important;
}
.nexa-v35-rail::-webkit-scrollbar{display:none!important}
.nexa-v35-rail>*{
  flex:0 0 auto!important;width:auto!important;max-width:none!important;
  scroll-snap-align:none!important;scroll-snap-stop:normal!important;
}

/* Dynamic profile configuration modal/card */
.nexa-v35-config-root{
  max-width:calc(100vw - 14px)!important;width:min(680px,calc(100vw - 14px))!important;
  max-height:calc(100dvh - 16px)!important;
  overflow-y:auto!important;overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  margin:auto!important;
}
.nexa-v35-config-root h1,.nexa-v35-config-root h2,.nexa-v35-config-root h3{
  overflow-wrap:anywhere!important;max-width:100%!important
}
/* Keep ordinary field text readable; only number/chip controls are compact */
.nexa-v35-config-root input[type=number],.nexa-v35-config-root select{
  font-size:16px!important;max-width:100%!important
}
.nexa-v35-level{
  min-width:40px!important;min-height:36px!important;
  padding:5px 8px!important;font-size:13px!important;line-height:1!important;
}

/* OWNED should never display */
.nexa-v35-owned{display:none!important}

/* Reset/help belong INSIDE the configuration card, never fixed at viewport top */
#nexa-v35-config-tools{
  position:static!important;inset:auto!important;transform:none!important;
  display:flex!important;align-items:center!important;justify-content:flex-start!important;
  gap:8px!important;width:auto!important;height:auto!important;
  margin:8px 0 12px!important;padding:0!important;z-index:auto!important;
  background:transparent!important;border:0!important;box-shadow:none!important;
}
#nexa-v35-config-tools button{
  position:static!important;inset:auto!important;transform:none!important;
  min-height:34px!important;border-radius:999px!important;
  border:1px solid rgba(101,101,255,.58)!important;
  background:linear-gradient(145deg,rgba(25,25,67,.98),rgba(7,10,30,.99))!important;
  color:#eef3ff!important;font-weight:850!important;
}
#nexa-v35-reset{padding:6px 14px!important}
#nexa-v35-help{width:34px!important;min-width:34px!important;padding:0!important;color:#8feaff!important;border-color:rgba(74,204,255,.64)!important}

/* Kill old injected V34 controls/nodes if any survive cache */
.nexa-v34-tools,.nexa-v33-tools{display:none!important}
#nexa-v34-stellar,#nexa-v33-stellar,#nexa-v34-pulse,#nexa-v34-alliance,#nexa-v33-signal-wrap{display:none!important}

/* Help card */
#nexa-v35-help-card{
  position:fixed!important;left:16px!important;right:16px!important;top:50%!important;
  transform:translateY(-50%)!important;z-index:2147483640!important;
  max-width:500px!important;margin:auto!important;padding:20px!important;border-radius:20px!important;
  color:#eef4ff!important;background:radial-gradient(circle at 12% 0%,rgba(79,194,255,.14),transparent 34%),linear-gradient(145deg,#090d26,#050714)!important;
  border:1px solid rgba(126,92,255,.65)!important;box-shadow:0 0 34px rgba(92,65,255,.34)!important;
}
`;
  document.head.appendChild(s);
}

function removeOldRuntimeNodes(){
  ['nexa-v34-stellar','nexa-v34-pulse','nexa-v34-alliance','nexa-v33-signal-wrap'].forEach(id=>$('#'+id)?.remove());
  $$('.nexa-v34-tools,.nexa-v33-tools').forEach(e=>e.remove());
}

function ensureHome(){
  const main=$('main.shell');
  const profile=$('#nexa-profile-launcher-section');
  if(!main||!profile) return;

  // Remove duplicate Stellar cards from any previous runtime layer.
  $$('section,article,div',main).filter(e=>{
    if(e.id==='nexa-v35-stellar') return false;
    const t=tx(e);
    return t.includes('STELLAR SIGNAL') && t.length<400;
  }).forEach(e=>e.remove());

  let stellar=$('#nexa-v35-stellar');
  if(!stellar){
    stellar=document.createElement('section');
    stellar.id='nexa-v35-stellar';
    stellar.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>';
  }
  if(stellar.parentElement!==main || stellar.nextElementSibling!==profile) main.insertBefore(stellar,profile);

  let pulse=$('#nexa-v35-pulse');
  if(!pulse){
    pulse=document.createElement('section');
    pulse.id='nexa-v35-pulse';
    pulse.innerHTML='<div class="nexa-v35-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>';
  }
  let alliance=$('#nexa-v35-alliance');
  if(!alliance){
    alliance=document.createElement('section');
    alliance.id='nexa-v35-alliance';
    alliance.innerHTML='<div class="nexa-v35-kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>';
  }
  const transfer=$('#home-transfers-section'), live=$('#home-svs-section');
  const anchor=transfer||live;
  if(anchor){
    if(pulse.parentElement!==main || pulse.previousElementSibling!==anchor) anchor.after(pulse);
    if(alliance.parentElement!==main || alliance.previousElementSibling!==pulse) pulse.after(alliance);
  }
}

function markOwned(root=document){
  $$('label,span,strong,b,div,p',root).forEach(e=>{
    if(e.children.length===0 && /^OWNED$/i.test(tx(e))) e.classList.add('nexa-v35-owned');
  });
}

function markLevels(root){
  $$('button,[role=button]',root).forEach(b=>{
    const t=tx(b);
    if(/^(?:T|FC|GEN)?\s*(?:[0-9]{1,2}|NONE|MAX|MAXED)$/i.test(t) || /^[0-9]{1,2}$/.test(t)){
      b.classList.add('nexa-v35-level');
    }
  });
}

function markRails(root=document){
  $$('div,nav,section',root).forEach(e=>{
    if(!isEl(e)||e.children.length<2) return;
    const t=tx(e), c=String(e.className||'');
    const r=e.getBoundingClientRect();
    if(r.width<180 || r.height>180) return;
    const semantic=
      /generation|tier|tabs|chips|carousel|filter-row|level-row|selector-row/i.test(c) ||
      ((/\bGEN\s*1\b/i.test(t)&&/\bGEN\s*2\b/i.test(t)) ||
       (/\bT1\b/i.test(t)&&/\bT2\b/i.test(t)) ||
       (/\bHEROES\b/i.test(t)&&/\bEXPERTS\b/i.test(t)&&/\bTROOPS\b/i.test(t)));
    if(semantic) e.classList.add('nexa-v35-rail');
  });
}

function configRoot(){
  const leaves=$$('h1,h2,h3,strong,b,div,span').filter(e=>e.children.length===0 && /PROFILE CONFIGURATION/i.test(tx(e)));
  for(const leaf of leaves){
    let p=leaf;
    for(let i=0;i<8&&p;i++,p=p.parentElement){
      if(!isEl(p)) continue;
      const r=p.getBoundingClientRect(), t=tx(p);
      if(r.width>260 && r.height>280 && t.length<8000 && (/HERO|EXPERT|TROOP|PET/i.test(t))){
        return p;
      }
    }
  }
  return null;
}

function resetConfig(root){
  if(!root) return;
  $$('input,select',root).forEach(el=>{
    if(el.type==='checkbox'||el.type==='radio') el.checked=false;
    else if(el.tagName==='SELECT') el.selectedIndex=0;
    else if(el.type==='number') el.value=el.min||'0';
    else if(!['button','submit','hidden','file'].includes(el.type)) el.value='';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
}

function showHelp(){
  $('#nexa-v35-help-card')?.remove();
  const d=document.createElement('div');
  d.id='nexa-v35-help-card';
  d.innerHTML='<div style="font-size:10px;letter-spacing:.18em;font-weight:900;color:#8eeaff;margin-bottom:7px">NEXA GUIDE</div><div style="font-size:18px;font-weight:900;margin-bottom:7px">Profile configuration</div><div style="font-size:13px;line-height:1.45;color:#cbd5ef;margin-bottom:14px">Choose the levels that match this account. Reset clears the current configuration so you can enter it again.</div><button type="button" style="width:100%;padding:10px;border-radius:999px;border:1px solid #675cff;background:#12173b;color:white;font-weight:850">Close</button>';
  d.querySelector('button').onclick=()=>d.remove();
  document.body.appendChild(d);
}

function ensureConfig(){
  const root=configRoot();
  if(!root) return;
  root.classList.add('nexa-v35-config-root');
  markOwned(root); markLevels(root); markRails(root);

  // Remove any Reset/? pair injected by older patches that escaped known class names.
  $$('button',document).filter(b=>{
    if(b.closest('#nexa-v35-config-tools')) return false;
    const t=tx(b);
    const cs=getComputedStyle(b);
    return (t==='Reset'||t==='?') && (cs.position==='fixed'||cs.position==='absolute') && b.getBoundingClientRect().top<180;
  }).forEach(b=>b.remove());

  let tools=$('#nexa-v35-config-tools');
  if(!tools){
    tools=document.createElement('div');
    tools.id='nexa-v35-config-tools';
    tools.innerHTML='<button id="nexa-v35-reset" type="button">Reset</button><button id="nexa-v35-help" type="button" aria-label="Help">?</button>';
    tools.querySelector('#nexa-v35-reset').onclick=()=>resetConfig(root);
    tools.querySelector('#nexa-v35-help').onclick=showHelp;

    const title=$$('h1,h2,h3,strong,b,div,span',root).find(e=>e.children.length===0 && /PROFILE CONFIGURATION/i.test(tx(e)));
    if(title){
      const titleBlock=title.parentElement;
      if(titleBlock && titleBlock.parentElement) titleBlock.after(tools);
      else root.prepend(tools);
    }else root.prepend(tools);
  }else if(!root.contains(tools)){
    root.prepend(tools);
  }
}

function run(){
  installCSS();
  removeOldRuntimeNodes();
  ensureHome();
  markOwned();
  markRails();
  const pm=$('#nexa-profile-modal');
  if(pm){ markRails(pm); markLevels(pm); }
  ensureConfig();
}

run();
let q=false;
new MutationObserver(()=>{
  if(q)return;q=true;
  requestAnimationFrame(()=>{q=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});

// Low-frequency safety pass only; no scrollLeft writes and no reparenting of native profile content.
setInterval(run,3000);
})();