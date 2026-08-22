/* NEXA V38 — CONSOLIDATED CURRENT REVIEW FIX
   Replaces V37 completely.
   Scope: Home, Login, Profile/Library UX, menu/My Alliance, help affordances.
   Does NOT alter Supabase schema/data or troop artwork.
*/
(()=>{'use strict';
if(window.__NEXA_V38__) return;
window.__NEXA_V38__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

const cssText=`
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*,*:before,*:after{box-sizing:border-box!important}

/* ---------- LOGIN ---------- */
#auth-modal .auth-card,.auth-card,.login-card{
  width:min(560px,calc(100vw - 28px))!important;
  max-width:calc(100vw - 28px)!important;
  margin:16px auto!important;
  padding:22px 20px calc(24px + env(safe-area-inset-bottom))!important;
  border-radius:24px!important;
  overflow:hidden!important;
}
#auth-modal input,.auth-card input,.login-card input{
  width:100%!important;max-width:100%!important;font-size:16px!important
}
#auth-modal .auth-logo,.auth-card .auth-logo{max-width:92px!important;margin-inline:auto!important}

/* ---------- HOME ---------- */
main.shell{
  width:min(680px,calc(100% - 24px))!important;
  max-width:calc(100% - 24px)!important;
  margin-inline:auto!important;
}
main.shell>.hero{
  padding:14px 0 8px!important;min-height:0!important;
  background:transparent!important;border:0!important;box-shadow:none!important
}
main.shell>.hero h1{
  margin:0!important;font-size:clamp(42px,12vw,62px)!important;
  line-height:.95!important;letter-spacing:-.04em!important
}
main.shell>.hero p{display:none!important}
#nexa-profile-launcher-section{
  width:100%!important;min-height:0!important;height:auto!important;
  margin:0 0 10px!important;padding:10px 0 12px!important;
  background:transparent!important;border:0!important;border-radius:0!important;
  outline:0!important;box-shadow:none!important
}
#nexa-profile-launcher-section:before,#nexa-profile-launcher-section:after{display:none!important}

#nexa-v38-stellar,#nexa-v38-pulse,#nexa-v38-alliance,
#home-svs-section,#home-transfers-section{
  width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;
  margin:0 0 10px!important;border-radius:18px!important;overflow:hidden!important
}
#nexa-v38-stellar{
  display:flex!important;align-items:center!important;justify-content:center!important;
  gap:9px!important;padding:9px 13px!important;text-align:center!important;
  border:1px solid rgba(77,186,255,.42)!important;
  background:radial-gradient(circle at 50% 0%,rgba(76,130,255,.10),transparent 55%),linear-gradient(145deg,rgba(10,24,48,.92),rgba(5,9,28,.97))!important;
  box-shadow:0 0 18px rgba(54,153,255,.07)!important
}
#nexa-v38-stellar:after{
  content:"✦";font-size:10px;color:#8de9ff;opacity:.75;animation:nexa38blink 2.2s ease-in-out infinite
}
@keyframes nexa38blink{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
#nexa-v38-stellar b{color:#86e9ff!important;font-size:9px!important;letter-spacing:.16em!important;white-space:nowrap!important}
#nexa-v38-stellar span{font-size:11px!important;line-height:1.25!important;color:#c7d0e7!important}

#nexa-v38-pulse,#nexa-v38-alliance{padding:10px 13px!important}
#nexa-v38-pulse{border:1px solid rgba(48,211,255,.44)!important;background:linear-gradient(145deg,rgba(4,34,53,.93),rgba(4,11,30,.98))!important}
#nexa-v38-alliance{border:1px solid rgba(219,66,255,.45)!important;background:linear-gradient(145deg,rgba(37,8,52,.93),rgba(13,6,30,.98))!important}
.nexa-v38-kicker{font-size:8px!important;line-height:1!important;letter-spacing:.17em!important;font-weight:950!important;margin-bottom:4px!important}
#nexa-v38-pulse .nexa-v38-kicker{color:#66eaff!important}
#nexa-v38-alliance .nexa-v38-kicker{color:#ec8cff!important}
#nexa-v38-pulse h3,#nexa-v38-alliance h3{margin:0 0 2px!important;font-size:14px!important;line-height:1.1!important}
#nexa-v38-pulse p,#nexa-v38-alliance p{margin:0!important;font-size:10px!important;line-height:1.25!important;color:#acb7d0!important}

#home-svs-section,#home-transfers-section{
  padding:10px 13px!important;background:linear-gradient(145deg,rgba(12,18,42,.94),rgba(6,10,27,.98))!important
}
#home-svs-section{border:1px solid rgba(126,105,255,.34)!important}
#home-transfers-section{border:1px solid rgba(255,137,76,.32)!important}
#home-svs-section>.head,#home-transfers-section>.head{padding:0!important;margin:0 0 5px!important;min-height:0!important}
#home-svs-section>.head h2,#home-transfers-section>.head h2{margin:0!important;font-size:15px!important;line-height:1.1!important}
#home-svs-section>.glass,#home-transfers-section>.glass,#home-svs-section .event{
  padding:0!important;margin:0!important;min-height:0!important;height:auto!important;
  border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:0!important
}
.nexa-v38-empty{margin:0!important;font-size:10px!important;line-height:1.3!important;color:#acb7d0!important}
.nexa-v38-view{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-height:32px!important;margin-top:7px!important;padding:6px 12px!important;border-radius:999px!important;
  border:1px solid rgba(89,124,255,.7)!important;background:linear-gradient(135deg,rgba(86,73,255,.18),rgba(23,140,221,.18))!important;
  color:#65baff!important;font-size:11px!important;font-weight:900!important
}

/* ---------- PROFILE / PASSPORT ---------- */
#nexa-profile-modal{padding:8px!important;overflow:hidden!important}
#nexa-profile-modal .nexa-profile-sheet{
  width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
  max-height:calc(100dvh - 16px)!important;margin:0 auto!important;
  overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
  border-radius:22px!important
}
#nexa-profile-modal .nexa-profile-hero{
  padding:52px 14px 14px!important;min-height:0!important;overflow:hidden!important
}
#nexa-profile-modal .nexa-profile-close{top:10px!important;right:10px!important}
#nexa-profile-modal .nexa-profile-main{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important}
#nexa-profile-modal .nexa-photo-wrap{flex:0 0 64px!important}
#nexa-profile-modal .nexa-profile-photo{width:64px!important;height:64px!important}
#nexa-profile-modal .nexa-profile-identity{flex:1 1 auto!important;min-width:0!important;max-width:calc(100% - 74px)!important}
#nexa-profile-modal .nexa-profile-name-line{display:block!important;min-width:0!important;max-width:100%!important}
#nexa-profile-modal #nexa-profile-name{
  display:block!important;font-size:clamp(20px,5.7vw,27px)!important;line-height:1.05!important;
  margin:0 0 4px!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important
}
#nexa-profile-modal #nexa-profile-player-id{
  display:block!important;max-width:100%!important;font-size:10px!important;line-height:1.2!important;
  white-space:normal!important;overflow-wrap:anywhere!important
}
#nexa-profile-modal .nexa-profile-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}
#nexa-profile-modal .nexa-stat{min-width:0!important;padding:8px 6px!important}
#nexa-profile-modal .nexa-profile-tabs{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  width:100%!important;min-width:0!important;height:auto!important;min-height:auto!important;
  overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;
  scroll-snap-type:none!important;scroll-behavior:auto!important;gap:5px!important;padding:8px 10px!important;
  scrollbar-width:none!important
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{
  flex:0 0 auto!important;width:auto!important;min-width:86px!important;min-height:34px!important;height:34px!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:6px 11px!important;
  white-space:nowrap!important;writing-mode:horizontal-tb!important
}
#nexa-profile-modal .nexa-profile-content{width:100%!important;min-width:0!important;padding:10px!important;overflow-x:hidden!important}

/* Hero/Library cards back to compact grid */
#nexa-profile-modal .nexa-lib-grid,
#nexa-profile-modal [class*="hero-grid" i],
#nexa-profile-modal [class*="library-grid" i]{
  display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:12px 8px!important;width:100%!important;min-width:0!important
}
#nexa-profile-modal .nexa-lib-card,
#nexa-profile-modal [class*="hero-card" i],
#nexa-profile-modal [class*="hero-item" i]{
  width:100%!important;min-width:0!important;padding:4px!important;text-align:center!important;background:transparent!important;
  border:0!important;box-shadow:none!important
}
#nexa-profile-modal .nexa-lib-avatar,
#nexa-profile-modal [class*="hero-card" i] img,
#nexa-profile-modal [class*="hero-item" i] img{
  width:min(100%,96px)!important;height:auto!important;aspect-ratio:1/1!important;border-radius:50%!important;object-fit:cover!important;margin-inline:auto!important
}

/* generation/type rails */
#nexa-profile-modal [class*="generation" i],
#nexa-profile-modal [class*="gen-tabs" i],
#nexa-profile-modal [class*="gen-row" i],
#nexa-profile-modal [class*="filter-row" i]{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;scroll-behavior:auto!important;
  gap:8px!important;scrollbar-width:none!important
}
#nexa-profile-modal [class*="generation" i]>*,
#nexa-profile-modal [class*="gen-tabs" i]>*,
#nexa-profile-modal [class*="gen-row" i]>*,
#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}

/* OWNED out */
#nexa-profile-modal .nexa-lib-owned{display:none!important}
#nexa-profile-modal [class*="owned" i]{display:none!important}

/* Reset/info inside detailed hero configuration */
.nexa-v38-item-tools{display:flex!important;align-items:center!important;gap:7px!important;margin:8px 0 10px!important}
.nexa-v38-item-tools button{
  min-height:32px!important;border-radius:999px!important;font-size:11px!important;font-weight:900!important;
  background:#111630!important;color:#eef3ff!important;border:1px solid rgba(102,105,255,.55)!important
}
.nexa-v38-reset{padding:5px 12px!important}
.nexa-v38-info{width:32px!important;min-width:32px!important;padding:0!important;color:#83e8ff!important;border-color:rgba(60,205,255,.55)!important}

/* Profile help and ministry block */
#nexa-v38-profile-help,#nexa-v38-ministry{
  margin:10px!important;padding:12px 13px!important;border-radius:16px!important;
  border:1px solid rgba(91,191,255,.26)!important;background:rgba(8,14,35,.62)!important
}
#nexa-v38-profile-help button{
  width:32px!important;height:32px!important;border-radius:50%!important;border:1px solid rgba(69,204,255,.55)!important;
  background:#101735!important;color:#82e7ff!important;font-weight:950!important
}
#nexa-v38-ministry h4{margin:0 0 7px!important;font-size:13px!important}
.nexa-v38-appt-row{display:grid!important;grid-template-columns:1fr auto!important;gap:8px!important;padding:7px 0!important;border-top:1px solid rgba(255,255,255,.07)!important;font-size:10px!important}
.nexa-v38-status{font-weight:900!important;color:#8de8ff!important}

/* ---------- MENU / ALLIANCE ---------- */
#nexa-home-menu{
  width:min(470px,calc(100vw - 42px))!important;
  max-width:calc(100vw - 42px)!important;
  left:21px!important;right:auto!important
}
.nexa-v38-my-alliance{
  display:block!important;width:100%!important;padding:11px 18px!important;margin:0!important;
  border:0!important;background:transparent!important;color:#fff!important;text-align:left!important;
  font:inherit!important;font-weight:900!important
}
.nexa-v38-my-alliance small{display:block!important;margin-top:3px!important;color:#7fdcff!important;font-size:10px!important;font-weight:800!important}

/* Alliance/Admin modal alignment */
#admin-modal .admin-modal-card{
  width:min(680px,calc(100vw - 20px))!important;max-width:calc(100vw - 20px)!important;
  margin:10px auto!important;padding-left:12px!important;padding-right:12px!important;
  overflow-x:hidden!important
}
#admin-modal .admin-modal-card>*{max-width:100%!important}
.nexa-v38-help-inline{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  width:32px!important;height:32px!important;border-radius:50%!important;
  border:1px solid rgba(72,205,255,.55)!important;background:#101735!important;
  color:#83e8ff!important;font-size:15px!important;font-weight:950!important;
  flex:0 0 32px!important
}

/* New-library visual normalization */
#admin-modal [class*="library" i] .card,
#admin-modal [class*="library" i] [class*="card" i]{
  border-radius:16px!important;border:1px solid rgba(94,133,255,.20)!important;
  background:linear-gradient(145deg,rgba(13,20,46,.88),rgba(5,10,28,.95))!important;
  box-shadow:none!important
}

/* Kill old injected versions */
#nexa-v37-stellar,#nexa-v37-pulse,#nexa-v37-alliance,
#nexa-v36-stellar,#nexa-v36-pulse,#nexa-v36-alliance,
#nexa-v35-stellar,#nexa-v35-pulse,#nexa-v35-alliance,
#nexa-v34-stellar,#nexa-v34-pulse,#nexa-v34-alliance,
#nexa-v33-signal-wrap,#nexa-v36-tools,#nexa-v35-config-tools{display:none!important}
`;

function installCSS(){
  $('#nexa-v38-css')?.remove();
  const s=document.createElement('style');
  s.id='nexa-v38-css';s.textContent=cssText;document.head.appendChild(s);
}
function removeOld(){
  ['nexa-v37-stellar','nexa-v37-pulse','nexa-v37-alliance','nexa-v36-stellar','nexa-v36-pulse','nexa-v36-alliance','nexa-v35-stellar','nexa-v35-pulse','nexa-v35-alliance','nexa-v34-stellar','nexa-v34-pulse','nexa-v34-alliance','nexa-v33-signal-wrap','nexa-v36-tools','nexa-v35-config-tools']
  .forEach(id=>$('#'+id)?.remove());
}
function isRealEvent(){
  const title=tx($('#home-event-title'));
  const countdown=tx($('#home-event-countdown'));
  return !!title && !/XXXX|TBD|NO\s+EVENT/i.test(title) && !!countdown && !/^[—–-]+$/.test(countdown);
}
function isRealTransfer(){
  const data=tx($('#home-transfer-events'));
  return !!data && !/Transfer Center|Applications stay available|next transfer cycle|No .*transfer/i.test(data);
}
function ensureHome(){
  const main=$('main.shell'),profile=$('#nexa-profile-launcher-section');
  if(!main||!profile)return;
  $$('section,article,div',main).forEach(e=>{
    if(e.id==='nexa-v38-stellar')return;
    const t=tx(e);
    if(/\bSTELLAR SIGNAL\b/i.test(t)&&t.length<420)e.remove();
  });
  let stellar=$('#nexa-v38-stellar');
  if(!stellar){
    stellar=document.createElement('section');
    stellar.id='nexa-v38-stellar';
    stellar.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>';
  }
  main.insertBefore(stellar,profile);

  const live=$('#home-svs-section');
  if(live){
    const active=isRealEvent();
    const glass=$('.glass',live),actions=$('.event-actions',live);
    let empty=$('#nexa-v38-live-empty',live),view=$('#nexa-v38-live-view',live);
    if(!active){
      glass?.setAttribute('hidden','');actions?.setAttribute('hidden','');view?.remove();
      if(!empty){empty=document.createElement('p');empty.id='nexa-v38-live-empty';empty.className='nexa-v38-empty';empty.textContent='Server events and current SvS information will appear here when published.';live.appendChild(empty)}
    }else{
      glass?.removeAttribute('hidden');actions?.setAttribute('hidden','');empty?.remove();
      if(!view){view=document.createElement('button');view.id='nexa-v38-live-view';view.className='nexa-v38-view';view.type='button';view.textContent='View';view.onclick=()=>{const b=$('.event-actions button,.event-actions a',live);if(b)b.click()};live.appendChild(view)}
    }
  }

  const transfer=$('#home-transfers-section');
  if(transfer){
    const active=isRealTransfer(),data=$('#home-transfer-events'),old=$('.nexa-transfer-home-actions',transfer);
    let empty=$('#nexa-v38-transfer-empty',transfer),view=$('#nexa-v38-transfer-view',transfer);
    if(!active){
      data?.setAttribute('hidden','');old?.setAttribute('hidden','');view?.remove();
      if(!empty){empty=document.createElement('p');empty.id='nexa-v38-transfer-empty';empty.className='nexa-v38-empty';empty.textContent='Transfer cycle information will appear here when a cycle is published.';transfer.appendChild(empty)}
    }else{
      data?.removeAttribute('hidden');old?.setAttribute('hidden','');empty?.remove();
      if(!view){view=document.createElement('button');view.id='nexa-v38-transfer-view';view.className='nexa-v38-view';view.type='button';view.textContent='View';view.onclick=()=>{const b=$('.nexa-transfer-home-actions button,.nexa-transfer-home-actions a',transfer);if(b)b.click()};transfer.appendChild(view)}
    }
  }

  let pulse=$('#nexa-v38-pulse');
  if(!pulse){pulse=document.createElement('section');pulse.id='nexa-v38-pulse';pulse.innerHTML='<div class="nexa-v38-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>'}
  let alliance=$('#nexa-v38-alliance');
  if(!alliance){alliance=document.createElement('section');alliance.id='nexa-v38-alliance';alliance.innerHTML='<div class="nexa-v38-kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>'}
  const anchor=transfer||live||profile;anchor.after(pulse);pulse.after(alliance);
}

const railPositions=new WeakMap();
function preserveKnownRails(){
  const roots=$$('#nexa-profile-modal .nexa-profile-tabs,#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]');
  roots.forEach(r=>{
    if(!r.dataset.nexa38Bound){
      r.dataset.nexa38Bound='1';
      const save=()=>railPositions.set(r,r.scrollLeft);
      r.addEventListener('scroll',save,{passive:true});
      r.addEventListener('touchend',save,{passive:true});
    }
    const p=railPositions.get(r);
    if(Number.isFinite(p)&&Math.abs(r.scrollLeft-p)>12)requestAnimationFrame(()=>{r.scrollLeft=p});
  });
}

function detailedConfigRoot(){
  const scope=$('#nexa-profile-modal'); if(!scope)return null;
  const title=$$('h1,h2,h3,strong,b,div,span',scope).find(e=>e.children.length===0&&/PROFILE CONFIGURATION/i.test(tx(e)));
  if(!title)return null;
  let p=title;
  for(let i=0;i<7&&p;i++,p=p.parentElement){
    if(p.getBoundingClientRect().height>260&&tx(p).length<12000)return p;
  }
  return null;
}
function resetInputs(root){
  $$('input,select',root).forEach(el=>{
    if(el.type==='checkbox'||el.type==='radio')el.checked=false;
    else if(el.tagName==='SELECT')el.selectedIndex=0;
    else if(el.type==='number')el.value=el.min||'0';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
}
function modalHelp(title,body){
  $('#nexa-v38-helpbox')?.remove();
  const d=document.createElement('div');d.id='nexa-v38-helpbox';
  Object.assign(d.style,{position:'fixed',left:'16px',right:'16px',top:'50%',transform:'translateY(-50%)',zIndex:'2147483640',maxWidth:'500px',margin:'auto',padding:'18px',borderRadius:'18px',background:'#080d24',border:'1px solid rgba(113,91,255,.72)',boxShadow:'0 0 36px rgba(90,68,255,.35)',color:'#eef4ff'});
  d.innerHTML=`<b style="color:#83e8ff;letter-spacing:.12em">${title}</b><p style="font-size:13px;line-height:1.45;color:#c4cee7">${body}</p><button type="button" style="width:100%;padding:9px;border-radius:999px;border:1px solid #675cff;background:#121735;color:white;font-weight:900">Close</button>`;
  d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}
function ensureItemTools(){
  const root=detailedConfigRoot();if(!root)return;
  $$('[class*="owned" i]',root).forEach(e=>e.style.setProperty('display','none','important'));
  let tools=$('.nexa-v38-item-tools',root);
  if(!tools){
    tools=document.createElement('div');tools.className='nexa-v38-item-tools';
    tools.innerHTML='<button type="button" class="nexa-v38-reset">Reset</button><button type="button" class="nexa-v38-info">ⓘ</button>';
    tools.querySelector('.nexa-v38-reset').onclick=()=>resetInputs(root);
    tools.querySelector('.nexa-v38-info').onclick=()=>modalHelp('RESET','Reset clears the saved selections shown in this configuration so you can re-enter the correct levels for this hero/item.');
    root.prepend(tools);
  }
}
function ensureProfileHelp(){
  const content=$('#nexa-profile-modal .nexa-profile-content');if(!content)return;
  let h=$('#nexa-v38-profile-help');
  if(!h){
    h=document.createElement('div');h.id='nexa-v38-profile-help';
    h.innerHTML='<button type="button" aria-label="Profile help">ⓘ</button>';
    h.querySelector('button').onclick=()=>modalHelp('PLAYER INTELLIGENCE','This profile grows with your account. Heroes, Experts, Troops, Pets, Chief Gear and Charms appear according to the catalog and progression available to your account. Tap an item to enter its levels and skills; use Reset only when you want to clear that item’s configuration.');
    content.prepend(h);
  }
}
function ensureMinistry(){
  const content=$('#nexa-profile-modal .nexa-profile-content');if(!content)return;
  let m=$('#nexa-v38-ministry');
  if(!m){
    m=document.createElement('section');m.id='nexa-v38-ministry';
    m.innerHTML='<h4>Ministry Appointments</h4><div class="nexa-v38-appt-row"><span>Construction / VP</span><span class="nexa-v38-status">Pending</span></div><div class="nexa-v38-appt-row"><span>Research / VP</span><span class="nexa-v38-status">Pending</span></div><div class="nexa-v38-appt-row"><span>Training / MOE</span><span class="nexa-v38-status">Pending</span></div>';
    content.appendChild(m);
  }
}
function allianceTag(){
  const txt=tx($('#nexa-profile-launcher-name'))||'';
  const m=txt.match(/•\s*([^•]+)\s*•\s*ID/i);return m?m[1].trim():'My Alliance';
}
function ensureMyAllianceMenu(){
  const menu=$('#nexa-home-menu');if(!menu)return;
  let btn=$('#nexa-v38-my-alliance');
  if(!btn){
    btn=document.createElement('button');btn.id='nexa-v38-my-alliance';btn.className='nexa-v38-my-alliance';btn.type='button';
    const tag=allianceTag();btn.innerHTML=`My Alliance<small>${tag}</small>`;
    btn.onclick=()=>{
      const existing=$$('#nexa-home-menu button,#nexa-home-menu a').find(e=>/ALLIANCE/i.test(tx(e))&&!/My Alliance/i.test(tx(e)));
      if(existing){existing.click();return}
      const admin=$$('#nexa-home-menu button,#nexa-home-menu a').find(e=>/Administration/i.test(tx(e)));
      if(admin){admin.click();setTimeout(()=>{const a=$$('button,a').find(e=>/^Alliances$/i.test(tx(e)));a?.click()},180)}
    };
    const toolsLabel=$$('*',menu).find(e=>e.children.length===0&&/^TOOLS$/i.test(tx(e)));
    if(toolsLabel)toolsLabel.before(btn);else menu.appendChild(btn);
  }else{
    const sm=$('small',btn);if(sm)sm.textContent=allianceTag();
  }
}
function ensureAllianceHelp(){
  const modal=$('#admin-modal');if(!modal||!modal.classList.contains('open'))return;
  const headers=$$('h1,h2,h3,strong',modal);
  headers.forEach(h=>{
    const t=tx(h);
    if(!/(Alliances|NEXA Access|System Operations|Bug Reports|Library)/i.test(t))return;
    if(h.parentElement?.querySelector(':scope > .nexa-v38-help-inline'))return;
    const b=document.createElement('button');b.type='button';b.className='nexa-v38-help-inline';b.textContent='ⓘ';
    b.onclick=()=>modalHelp(t.toUpperCase(), t.match(/Alliances/i)?'Manage your alliance passport, members, alliance-specific events, surveys/NEXA Pulse responses and alliance settings here.':t.match(/NEXA Access/i)?'Manage operational roles and module access for players.':t.match(/System Operations/i)?'Owner-level system controls, maintenance and recovery live here.':t.match(/Bug Reports/i)?'Review user-submitted bugs and their diagnostic context here.':'Manage the shared NEXA catalog and what players can see in their profiles.');
    h.parentElement?.appendChild(b);
  });
}
function run(){
  installCSS();removeOld();ensureHome();preserveKnownRails();
  ensureItemTools();ensureProfileHelp();ensureMinistry();
  ensureMyAllianceMenu();ensureAllianceHelp();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,450);setTimeout(run,1300)},{once:true});
else{run();setTimeout(run,450);setTimeout(run,1300)}
let q=false;
new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
})();