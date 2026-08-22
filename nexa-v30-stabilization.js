/* NEXA V40 — CONSOLIDATED UX + ALLIANCE HUB
   Replaces V39 completely.
   Goals: Stellar placement, Guide system, flat Profile/Admin surfaces,
   stable rails through Gen 10, Reset replacing OWNED, My Alliance hub/menu.
   No schema migrations and no troop artwork changes.
*/
(()=>{'use strict';
if(window.__NEXA_V40__)return;window.__NEXA_V40__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const GUIDE_GENERAL='#ff4fd8';
const GUIDE_CONTEXT='#ffbf47';

function installCSS(){
  $('#nexa-v40-css')?.remove();
  const s=document.createElement('style');s.id='nexa-v40-css';
  s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*,*:before,*:after{box-sizing:border-box!important}

/* ---------- HOME ---------- */
main.shell{
  width:min(680px,calc(100% - 24px))!important;
  max-width:calc(100% - 24px)!important;
  margin:0 auto!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  gap:10px!important
}
main.shell>*{grid-column:1/-1!important;width:100%!important;max-width:100%!important;min-width:0!important}
main.shell>.hero{padding:14px 0 8px!important;margin:0!important;min-height:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
main.shell>.hero h1{margin:0!important;font-size:clamp(42px,12vw,62px)!important;line-height:.95!important;letter-spacing:-.04em!important}
main.shell>.hero p{display:none!important}

#nexa-profile-launcher-section{
  padding:12px 0 14px!important;margin:0!important;min-height:0!important;height:auto!important;
  background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important
}

/* Stellar = floating signal BELOW profile, ABOVE Live Event */
#nexa-v40-stellar{
  width:100%!important;margin:0!important;padding:4px 10px 7px!important;
  background:transparent!important;border:0!important;box-shadow:none!important;
  text-align:center!important;position:relative!important;overflow:visible!important
}
#nexa-v40-stellar .nexa-v40-stellar-label{
  display:inline-flex!important;align-items:center!important;gap:7px!important;
  color:#c5b6ff!important;font-size:9px!important;font-weight:950!important;
  letter-spacing:.18em!important;text-shadow:0 0 13px rgba(180,156,255,.62)!important
}
#nexa-v40-stellar .nexa-v40-stellar-copy{
  display:block!important;margin-top:3px!important;color:#d7d1ea!important;
  font-size:10px!important;line-height:1.25!important
}
#nexa-v40-stellar .nexa-v40-star{color:#f0eaff!important;animation:nexa40twinkle 2.1s ease-in-out infinite}
@keyframes nexa40twinkle{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.16)}}

/* Home operational strips */
#home-svs-section,#home-transfers-section,#nexa-v40-pulse,#nexa-v40-alliance{
  width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;
  height:auto!important;margin:0!important;border-radius:18px!important;overflow:hidden!important
}
#home-svs-section,#home-transfers-section{
  padding:10px 13px!important;background:linear-gradient(145deg,rgba(12,18,42,.94),rgba(6,10,27,.98))!important
}
#home-svs-section{border:1px solid rgba(126,105,255,.34)!important}
#home-transfers-section{border:1px solid rgba(255,137,76,.32)!important}
#home-svs-section>.head,#home-transfers-section>.head{padding:0!important;margin:0 0 5px!important;min-height:0!important}
#home-svs-section>.head h2,#home-transfers-section>.head h2{margin:0!important;font-size:15px!important;line-height:1.1!important}
#home-svs-section>.glass,#home-transfers-section>.glass,#home-svs-section .event{
  padding:0!important;margin:0!important;min-height:0!important;height:auto!important;
  border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important
}
.nexa-v40-empty{margin:0!important;font-size:10px!important;line-height:1.3!important;color:#aeb7ce!important}
.nexa-v40-view{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-height:32px!important;margin-top:7px!important;padding:6px 12px!important;border-radius:999px!important;
  border:1px solid rgba(105,111,255,.68)!important;background:rgba(82,73,255,.12)!important;
  color:#aeb8ff!important;font-size:11px!important;font-weight:900!important
}

#nexa-v40-pulse,#nexa-v40-alliance{padding:10px 13px!important}
#nexa-v40-pulse{border:1px solid rgba(48,211,255,.34)!important;background:linear-gradient(145deg,rgba(4,34,53,.91),rgba(4,11,30,.97))!important}
#nexa-v40-alliance{border:1px solid rgba(219,66,255,.34)!important;background:linear-gradient(145deg,rgba(37,8,52,.91),rgba(13,6,30,.97))!important}
.nexa-v40-k{font-size:8px!important;letter-spacing:.17em!important;font-weight:950!important;margin-bottom:4px!important}
#nexa-v40-pulse .nexa-v40-k{color:#66eaff!important}
#nexa-v40-alliance .nexa-v40-k{color:#ec8cff!important}
#nexa-v40-pulse h3,#nexa-v40-alliance h3{margin:0 0 2px!important;font-size:14px!important}
#nexa-v40-pulse p,#nexa-v40-alliance p{margin:0!important;font-size:10px!important;line-height:1.25!important;color:#acb7d0!important}

/* ---------- GUIDE LANGUAGE ---------- */
.nexa-guide-general,.nexa-guide-context{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  width:34px!important;height:34px!important;min-width:34px!important;border-radius:50%!important;
  background:#0d1129!important;font-weight:950!important;font-size:15px!important
}
.nexa-guide-general{color:${GUIDE_GENERAL}!important;border:1px solid ${GUIDE_GENERAL}!important;box-shadow:0 0 16px rgba(255,79,216,.18)!important}
.nexa-guide-context{color:${GUIDE_CONTEXT}!important;border:1px solid ${GUIDE_CONTEXT}!important;box-shadow:0 0 16px rgba(255,191,71,.14)!important}

/* ---------- PROFILE: one surface, no card-on-card ---------- */
#nexa-profile-modal{padding:8px!important;overflow:hidden!important}
#nexa-profile-modal .nexa-profile-sheet{
  width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
  max-height:calc(100dvh - 16px)!important;margin:0 auto!important;overflow-y:auto!important;overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;border-radius:24px!important;
  background:linear-gradient(160deg,rgba(8,12,31,.98),rgba(3,6,19,.99))!important
}
#nexa-profile-modal .nexa-profile-hero{
  padding:48px 14px 12px!important;min-height:0!important;border:0!important;border-radius:0!important;
  background:transparent!important;box-shadow:none!important;overflow:hidden!important
}
#nexa-profile-modal .nexa-profile-content{
  width:100%!important;min-width:0!important;padding:8px 10px 18px!important;
  border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
  overflow:visible!important
}
#nexa-profile-modal .nexa-profile-tabs{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  width:100%!important;min-width:0!important;overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;scroll-behavior:auto!important;
  scrollbar-width:none!important;touch-action:pan-x!important
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;min-width:86px!important;height:34px!important;white-space:nowrap!important}

/* known generation/filter rails */
#nexa-profile-modal [class*="generation" i],
#nexa-profile-modal [class*="gen-tabs" i],
#nexa-profile-modal [class*="gen-row" i],
#nexa-profile-modal [class*="filter-row" i]{
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;
  width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;scroll-behavior:auto!important;
  scrollbar-width:none!important;touch-action:pan-x!important
}
#nexa-profile-modal [class*="generation" i]>*,
#nexa-profile-modal [class*="gen-tabs" i]>*,
#nexa-profile-modal [class*="gen-row" i]>*,
#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}

/* keep hero/library overview compact */
#nexa-profile-modal .nexa-lib-grid,
#nexa-profile-modal [class*="hero-grid" i],
#nexa-profile-modal [class*="library-grid" i]{
  display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:12px 8px!important;width:100%!important;min-width:0!important
}
#nexa-profile-modal .nexa-lib-card,
#nexa-profile-modal [class*="hero-card" i],
#nexa-profile-modal [class*="hero-item" i]{
  width:100%!important;min-width:0!important
}

/* OWNED removed; Reset + contextual Guide replace it */
#nexa-profile-modal .nexa-lib-owned,
#nexa-profile-modal [class*="owned" i]{display:none!important}
.nexa-v40-item-tools{
  display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
  margin:7px 0 2px!important
}
.nexa-v40-reset{
  min-height:32px!important;padding:6px 12px!important;border-radius:999px!important;
  border:1px solid rgba(131,107,255,.55)!important;background:#10152f!important;
  color:#f2efff!important;font-size:10px!important;font-weight:900!important
}

/* passport quick actions under stats */
#nexa-v40-profile-actions{
  display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;
  margin:10px 0 2px!important
}
#nexa-v40-ministry{
  width:36px!important;height:36px!important;border-radius:50%!important;
  border:1px solid rgba(197,182,255,.56)!important;background:#10142d!important;
  color:#d9ccff!important;font-size:17px!important;box-shadow:0 0 15px rgba(187,164,255,.12)!important
}

/* ---------- MENU ---------- */
#nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px))!important}
#nexa-home-menu [data-section-label="navigation"],
#nexa-home-menu .navigation-label{display:none!important}
#nexa-v40-my-alliance{
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;
  width:100%!important;min-height:58px!important;padding:10px 20px!important;margin:0!important;
  border:0!important;background:transparent!important;color:#fff!important;text-align:left!important;
  font:inherit!important;font-weight:900!important
}
#nexa-v40-my-alliance small{margin-top:3px!important;color:#d5c8ff!important;font-size:10px!important;font-weight:800!important}

/* ---------- ADMINISTRATION = SINGLE SURFACE ---------- */
#admin-modal{padding:0!important}
#admin-modal .modal-backdrop{background:rgba(1,2,10,.88)!important}
#admin-modal .admin-modal-card{
  width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;
  margin:0!important;padding:env(safe-area-inset-top) 14px calc(18px + env(safe-area-inset-bottom))!important;
  border:0!important;border-radius:0!important;background:linear-gradient(165deg,#080d25,#030611 76%)!important;
  box-shadow:none!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important
}
#admin-modal .admin-modal-card>*{width:100%!important;max-width:100%!important;min-width:0!important}
#admin-modal .modal-head,#admin-modal [class*="modal-head" i]{
  display:flex!important;align-items:center!important;justify-content:space-between!important;
  gap:10px!important;padding:8px 2px 12px!important
}
#admin-modal .modal-close,#admin-modal [data-close-admin],#admin-modal button[aria-label*="close" i]{
  width:auto!important;min-width:auto!important;height:auto!important;border:0!important;background:transparent!important;
  color:#d9d3ec!important;font-size:12px!important;font-weight:900!important;padding:8px!important
}
#admin-modal .admin-panel,#admin-modal .module-action-card,#admin-modal .adminPanel{
  max-width:100%!important;margin-inline:auto!important
}

/* My Alliance full-screen hub */
#nexa-v40-alliance-hub{
  position:fixed!important;inset:0!important;z-index:2147483000!important;
  background:linear-gradient(165deg,#080d25,#030611 76%)!important;color:#f5f3ff!important;
  overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;padding:calc(12px + env(safe-area-inset-top)) 14px calc(24px + env(safe-area-inset-bottom))!important
}
.nexa-v40-hub-head{display:grid!important;grid-template-columns:40px 1fr auto!important;align-items:center!important;gap:8px!important;margin-bottom:12px!important}
.nexa-v40-hub-head h2{margin:0!important;text-align:center!important;font-size:16px!important}
.nexa-v40-close{border:0!important;background:transparent!important;color:#ddd7ea!important;font-weight:900!important;padding:8px!important}
.nexa-v40-alliance-passport{text-align:center!important;padding:16px 10px 14px!important}
.nexa-v40-emblem{
  width:98px!important;height:98px!important;margin:0 auto 10px!important;border-radius:50%!important;
  display:grid!important;place-items:center!important;overflow:hidden!important;
  border:1px solid rgba(196,178,255,.36)!important;background:radial-gradient(circle,#171d45,#070a1c)!important;
  box-shadow:0 0 28px rgba(162,131,255,.15)!important
}
.nexa-v40-emblem img{width:100%!important;height:100%!important;object-fit:contain!important}
.nexa-v40-alliance-passport h1{margin:0!important;font-size:30px!important}
.nexa-v40-alliance-passport p{margin:5px 0 0!important;color:#aaa9c2!important;font-size:11px!important}
.nexa-v40-alliance-stats{display:flex!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important;margin-top:10px!important}
.nexa-v40-stat{padding:6px 9px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.10)!important;background:rgba(255,255,255,.035)!important;font-size:10px!important}
.nexa-v40-hub-tabs{display:flex!important;gap:7px!important;overflow-x:auto!important;scrollbar-width:none!important;padding:5px 0 10px!important}
.nexa-v40-hub-tabs button{flex:0 0 auto!important;white-space:nowrap!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:999px!important;background:#10142b!important;color:#c9c8dc!important;padding:8px 11px!important;font-size:10px!important;font-weight:900!important}
.nexa-v40-hub-tabs button.active{border-color:#b997ff!important;color:#fff!important;background:rgba(123,83,255,.18)!important}
.nexa-v40-hub-body{padding:4px 0 30px!important}
.nexa-v40-member{display:grid!important;grid-template-columns:1fr auto!important;gap:8px!important;padding:10px 4px!important;border-bottom:1px solid rgba(255,255,255,.07)!important}
.nexa-v40-member small{display:block!important;color:#8f91aa!important;margin-top:2px!important}
.nexa-v40-empty-panel{padding:24px 12px!important;text-align:center!important;color:#9698b1!important;border:1px dashed rgba(255,255,255,.10)!important;border-radius:16px!important}

/* old V39/V38 nodes */
#nexa-v39-stellar,#nexa-v39-pulse,#nexa-v39-alliance,#nexa-v39-my-alliance,
#nexa-v38-stellar,#nexa-v38-pulse,#nexa-v38-alliance,#nexa-v38-my-alliance,
#nexa-v38-profile-help,#nexa-v38-ministry{display:none!important}
`;
  document.head.appendChild(s);
}

function removeOld(){
 ['nexa-v39-stellar','nexa-v39-pulse','nexa-v39-alliance','nexa-v39-my-alliance',
  'nexa-v38-stellar','nexa-v38-pulse','nexa-v38-alliance','nexa-v38-my-alliance',
  'nexa-v38-profile-help','nexa-v38-ministry'].forEach(id=>$('#'+id)?.remove());
}

/* ---------- HOME ---------- */
function realEvent(){
 const title=tx($('#home-event-title')),cd=tx($('#home-event-countdown'));
 return !!title&&!/XXXX|TBD|NO\s+EVENT/i.test(title)&&!!cd&&!/^[—–-]+$/.test(cd);
}
function realTransfer(){
 const t=tx($('#home-transfer-events'));
 return !!t&&!/Transfer Center|Applications stay available|next transfer cycle|No .*transfer/i.test(t);
}
function ensureHome(){
 const main=$('main.shell'),profile=$('#nexa-profile-launcher-section');if(!main||!profile)return;

 let stellar=$('#nexa-v40-stellar');
 if(!stellar){
   stellar=document.createElement('section');stellar.id='nexa-v40-stellar';
   stellar.innerHTML='<div class="nexa-v40-stellar-label"><span class="nexa-v40-star">✦</span> STELLAR SIGNAL <span class="nexa-v40-star">✦</span></div><span class="nexa-v40-stellar-copy">Small course corrections can change the path of an entire orbit.</span>';
 }
 const live=$('#home-svs-section');
 if(live) main.insertBefore(stellar,live); else profile.after(stellar);

 if(live){
   const active=realEvent(),glass=$('.glass',live),old=$('.event-actions',live);
   let empty=$('#nexa-v40-live-empty',live),view=$('#nexa-v40-live-view',live);
   if(!active){
     glass?.setAttribute('hidden','');old?.setAttribute('hidden','');view?.remove();
     if(!empty){empty=document.createElement('p');empty.id='nexa-v40-live-empty';empty.className='nexa-v40-empty';empty.textContent='Server events and current SvS information will appear here when published.';live.appendChild(empty)}
   }else{
     glass?.removeAttribute('hidden');old?.setAttribute('hidden','');empty?.remove();
     if(!view){view=document.createElement('button');view.id='nexa-v40-live-view';view.className='nexa-v40-view';view.type='button';view.textContent='View';view.onclick=()=>$('.event-actions button,.event-actions a',live)?.click();live.appendChild(view)}
   }
 }
 const tr=$('#home-transfers-section');
 if(tr){
   const active=realTransfer(),data=$('#home-transfer-events'),old=$('.nexa-transfer-home-actions',tr);
   let empty=$('#nexa-v40-transfer-empty',tr),view=$('#nexa-v40-transfer-view',tr);
   if(!active){
     data?.setAttribute('hidden','');old?.setAttribute('hidden','');view?.remove();
     if(!empty){empty=document.createElement('p');empty.id='nexa-v40-transfer-empty';empty.className='nexa-v40-empty';empty.textContent='Transfer cycle information will appear here when a cycle is published.';tr.appendChild(empty)}
   }else{
     data?.removeAttribute('hidden');old?.setAttribute('hidden','');empty?.remove();
     if(!view){view=document.createElement('button');view.id='nexa-v40-transfer-view';view.className='nexa-v40-view';view.type='button';view.textContent='View';view.onclick=()=>$('.nexa-transfer-home-actions button,.nexa-transfer-home-actions a',tr)?.click();tr.appendChild(view)}
   }
 }
 let pulse=$('#nexa-v40-pulse');if(!pulse){pulse=document.createElement('section');pulse.id='nexa-v40-pulse';pulse.innerHTML='<div class="nexa-v40-k">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>'}
 let alliance=$('#nexa-v40-alliance');if(!alliance){alliance=document.createElement('section');alliance.id='nexa-v40-alliance';alliance.innerHTML='<div class="nexa-v40-k">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>'}
 const anchor=tr||live||stellar;anchor.after(pulse);pulse.after(alliance);
}

/* ---------- GUIDE ---------- */
function help(title,body,general=true){
 $('#nexa-v40-guidebox')?.remove();
 const d=document.createElement('div');d.id='nexa-v40-guidebox';
 Object.assign(d.style,{position:'fixed',inset:'0',zIndex:'2147483645',background:'rgba(0,0,0,.74)',display:'grid',placeItems:'center',padding:'16px'});
 const accent=general?GUIDE_GENERAL:GUIDE_CONTEXT;
 d.innerHTML=`<div style="width:min(520px,100%);max-height:82dvh;overflow:auto;border-radius:22px;padding:20px;background:linear-gradient(160deg,#0b1028,#050713);border:1px solid ${accent};box-shadow:0 0 34px ${general?'rgba(255,79,216,.18)':'rgba(255,191,71,.15)'}"><div style="font-size:10px;letter-spacing:.17em;font-weight:950;color:${accent};margin-bottom:6px">GUIDE</div><h2 style="margin:0 0 8px;font-size:20px">${title}</h2><div style="font-size:13px;line-height:1.5;color:#c7c8da">${body}</div><button type="button" style="margin-top:16px;width:100%;padding:10px;border-radius:999px;border:1px solid ${accent};background:#10152f;color:#fff;font-weight:900">Close</button></div>`;
 d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}

/* ---------- PROFILE ---------- */
const railState=new Map();
function railKey(r){
 const id=r.id?`#${r.id}`:'';
 const cls=String(r.className||'').split(/\s+/).filter(Boolean).slice(0,3).join('.');
 const parent=String(r.parentElement?.className||'').split(/\s+/).filter(Boolean).slice(0,2).join('.');
 return `${id}|${cls}|${parent}|${r.children.length}`;
}
function preserveRails(){
 const rails=$$('#nexa-profile-modal .nexa-profile-tabs,#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]');
 rails.forEach(r=>{
   const key=railKey(r);
   if(!r.dataset.nexa40Bound){
     r.dataset.nexa40Bound='1';
     const save=()=>railState.set(key,r.scrollLeft);
     r.addEventListener('scroll',save,{passive:true});
     r.addEventListener('touchend',save,{passive:true});
   }
   const saved=railState.get(key);
   if(Number.isFinite(saved)&&Math.abs(r.scrollLeft-saved)>10){
     requestAnimationFrame(()=>{r.scrollLeft=saved});
     setTimeout(()=>{if(Math.abs(r.scrollLeft-saved)>10)r.scrollLeft=saved},90);
   }
 });
}
function resetCard(card){
 $$('input,select',card).forEach(el=>{
   if(el.type==='checkbox'||el.type==='radio')el.checked=false;
   else if(el.tagName==='SELECT')el.selectedIndex=0;
   else if(el.type==='number')el.value=el.min||'0';
   else if(el.type!=='file')el.value='';
   el.dispatchEvent(new Event('input',{bubbles:true}));
   el.dispatchEvent(new Event('change',{bubbles:true}));
 });
}
function ensureCardTools(){
 const root=$('#nexa-profile-modal');if(!root)return;
 const cards=$$('.nexa-lib-card,[class*="hero-card" i],[class*="hero-item" i],[class*="expert-card" i],[class*="pet-card" i]',root);
 cards.forEach(card=>{
   $$('[class*="owned" i]',card).forEach(e=>e.style.setProperty('display','none','important'));
   if(card.querySelector('.nexa-v40-item-tools'))return;
   const tools=document.createElement('div');tools.className='nexa-v40-item-tools';
   tools.innerHTML='<button type="button" class="nexa-v40-reset">Reset</button><button type="button" class="nexa-guide-context">ⓘ</button>';
   tools.querySelector('.nexa-v40-reset').onclick=e=>{e.stopPropagation();resetCard(card)};
   tools.querySelector('.nexa-guide-context').onclick=e=>{e.stopPropagation();help('THIS ITEM','Set the levels and progression that match this account. <b>Reset</b> clears the values shown for this item so you can enter them again. It does not reset the entire NEXA account.',false)};
   card.appendChild(tools);
 });
}
function ministryPanel(){
 $('#nexa-v40-ministry-panel')?.remove();
 const d=document.createElement('div');d.id='nexa-v40-ministry-panel';
 Object.assign(d.style,{position:'fixed',inset:'0',zIndex:'2147483644',background:'rgba(0,0,0,.74)',display:'grid',placeItems:'center',padding:'16px'});
 d.innerHTML='<div style="width:min(500px,100%);max-height:78dvh;overflow:auto;border-radius:22px;padding:18px;background:linear-gradient(160deg,#0b1028,#050713);border:1px solid rgba(197,182,255,.5)"><div style="font-size:10px;letter-spacing:.16em;color:#c8baff;font-weight:950">MINISTRY SCHEDULE</div><h2 style="margin:5px 0 8px">My Appointments</h2><p style="font-size:12px;line-height:1.45;color:#aeb2c9">Your submitted Ministry appointments and their real statuses will appear here when available: Pending, Scheduled, Alternative Available, Alternative Requested, Waiting List, or Not Scheduled.</p><div id="nexa-v40-ministry-live" style="margin-top:12px"></div><button type="button" style="width:100%;margin-top:14px;padding:10px;border-radius:999px;border:1px solid #8c78ff;background:#10152f;color:#fff;font-weight:900">Close</button></div>';
 d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}
function ensureProfileActions(){
 const modal=$('#nexa-profile-modal');if(!modal)return;
 const stats=$('.nexa-profile-stats',modal);if(!stats)return;
 let row=$('#nexa-v40-profile-actions',modal);
 if(!row){
   row=document.createElement('div');row.id='nexa-v40-profile-actions';
   row.innerHTML='<button type="button" class="nexa-guide-general">ⓘ</button><button id="nexa-v40-ministry" type="button" aria-label="Ministry Schedule">♜</button>';
   row.querySelector('.nexa-guide-general').onclick=()=>help('PLAYER PROFILE','Use this page to maintain your account identity, Furnace, Power, Deployment and Player Intelligence. Open each category to enter your Heroes, Experts, Pets, Troops, Chief Gear and Charms. The magenta Guide explains the whole page; gold Guides explain the section you are currently using.',true);
   row.querySelector('#nexa-v40-ministry').onclick=ministryPanel;
   stats.after(row);
 }
}

/* ---------- ADMIN ---------- */
function ensureAdminChrome(){
 const modal=$('#admin-modal');if(!modal||!modal.classList.contains('open'))return;
 const close=$$('.modal-close,[data-close-admin],button[aria-label*="close" i]',modal)[0];
 if(close){close.textContent='Close';close.setAttribute('aria-label','Close')}
 // remove MENU action inside admin surface
 $$('button,a',modal).filter(e=>/^MENU$/i.test(tx(e))).forEach(e=>e.style.setProperty('display','none','important'));

 const card=$('.admin-modal-card',modal);if(!card)return;
 if(!$('#nexa-v40-admin-guide',card)){
   const g=document.createElement('button');g.id='nexa-v40-admin-guide';g.className='nexa-guide-general';g.type='button';g.textContent='ⓘ';
   g.style.margin='8px 0 10px';
   g.onclick=()=>help('ADMINISTRATION','Administration is the control center for Alliances, Library, NEXA Access, Roles and System Operations. Use the gold Guide inside a section when you need instructions specific to that module.',true);
   card.prepend(g);
 }
 // contextual guide beside major headings
 $$('h1,h2,h3,strong',card).forEach(h=>{
   const t=tx(h);if(!/(Alliances|Library|NEXA Access|Roles|System Operations|Bug Reports)/i.test(t))return;
   if(h.parentElement?.querySelector(':scope > .nexa-guide-context'))return;
   const g=document.createElement('button');g.type='button';g.className='nexa-guide-context';g.textContent='ⓘ';
   g.onclick=()=>help(t.toUpperCase(),
     /Alliances/i.test(t)?'Manage alliance identity, emblem, members and alliance-specific settings here.':
     /Library/i.test(t)?'Manage the shared NEXA catalog and what players can see in their Player Intelligence profile.':
     /NEXA Access/i.test(t)?'Manage operational roles and module access. NEXA Access codes are reserved for sensitive verification workflows rather than normal alliance joining.':
     /Roles/i.test(t)?'Review governance and operational roles here.':
     /System Operations/i.test(t)?'Owner-level maintenance, recovery and system controls live here.':
     'Review submitted bug reports and diagnostic context here.',false);
   h.parentElement?.appendChild(g);
 });
}

/* ---------- MY ALLIANCE ---------- */
function sb(){
 if(window.supabaseClient)return window.supabaseClient;
 if(window.supabase?.createClient){
   window.__nexaV40Sb=window.__nexaV40Sb||window.supabase.createClient('https://dfxcxboxrkfmrnsgpyin.supabase.co','sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-');
   return window.__nexaV40Sb;
 }
 return null;
}
async function allianceContext(){
 const c=sb();if(!c)return null;
 const {data:{user}}=await c.auth.getUser();if(!user)return null;
 const {data:acct}=await c.from('player_accounts').select('id,in_game_name,player_id,alliance_id,alliance_role,alliance_verified_at,is_main').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();
 if(!acct)return null;
 let alliance=null;
 if(acct.alliance_id){
   const r=await c.from('alliances').select('*').eq('id',acct.alliance_id).maybeSingle();alliance=r.data||null;
 }
 return {c,user,acct,alliance};
}
function hubPanel(type,ctx,members){
 const body=$('#nexa-v40-hub-body');if(!body)return;
 $$('.nexa-v40-hub-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===type));
 if(type==='members'){
   const verified=(members||[]).filter(x=>x.alliance_verified_at);
   body.innerHTML=verified.length?verified.map(m=>`<div class="nexa-v40-member"><div><b>${m.in_game_name||'Player'}</b><small>ID ${m.player_id||'—'} • ${m.alliance_role||'Member'}</small></div><span>${m.is_main?'MAIN':''}</span></div>`).join(''):'<div class="nexa-v40-empty-panel">No verified members found.</div>';
 }else if(type==='pending'){
   const pending=(members||[]).filter(x=>!x.alliance_verified_at);
   body.innerHTML=pending.length?pending.map(m=>`<div class="nexa-v40-member"><div><b>${m.in_game_name||'Player'}</b><small>ID ${m.player_id||'—'} • Waiting for Approval</small></div><span>Pending</span></div>`).join(''):'<div class="nexa-v40-empty-panel">No pending members right now.</div>';
 }else if(type==='pulse'){
   body.innerHTML='<div class="nexa-v40-empty-panel">Active alliance NEXA Pulse requests and response progress will appear here when published.</div>';
 }else if(type==='history'){
   body.innerHTML='<div class="nexa-v40-empty-panel">Closed alliance NEXA Pulse history will appear here.</div>';
 }else{
   const leader=['R4','R5'].includes(String(ctx?.acct?.alliance_role||'').toUpperCase());
   body.innerHTML=`<div class="nexa-v40-empty-panel">${leader?'Foundry, Canyon and Alliance Events can be managed here by authorized R4/R5 leadership. Published events surface to members through Alliance Signal on Home.':'Published Foundry, Canyon and alliance event information will appear here when leadership releases it.'}</div>`;
 }
}
async function openAllianceHub(){
 $('#nexa-v40-alliance-hub')?.remove();
 const hub=document.createElement('section');hub.id='nexa-v40-alliance-hub';
 hub.innerHTML='<div class="nexa-v40-hub-head"><button class="nexa-guide-general" type="button">ⓘ</button><h2>My Alliance</h2><button class="nexa-v40-close" type="button">Close</button></div><div class="nexa-v40-alliance-passport"><div class="nexa-v40-emblem"><span>✦</span></div><h1>Loading…</h1><p>Alliance Passport</p><div class="nexa-v40-alliance-stats"></div></div><div class="nexa-v40-hub-tabs"><button data-tab="members" class="active">Members</button><button data-tab="pending">Pending Members</button><button data-tab="pulse">NEXA Pulse</button><button data-tab="history">Pulse History</button><button data-tab="events">Alliance Events</button></div><div id="nexa-v40-hub-body"><div class="nexa-v40-empty-panel">Loading alliance…</div></div>';
 document.body.appendChild(hub);
 hub.querySelector('.nexa-v40-close').onclick=()=>hub.remove();
 hub.querySelector('.nexa-guide-general').onclick=()=>help('MY ALLIANCE','My Alliance is your alliance passport and hub. Review members, pending membership requests, active and past NEXA Pulse activity, and alliance events. Authorized R4/R5 leadership can manage alliance operations; published information appears to members in Alliance Signal.',true);

 const ctx=await allianceContext();
 if(!ctx||!ctx.alliance){
   $('.nexa-v40-alliance-passport h1',hub).textContent='No Alliance';
   $('#nexa-v40-hub-body',hub).innerHTML='<div class="nexa-v40-empty-panel">This account is not linked to an alliance yet.</div>';return;
 }
 const a=ctx.alliance,tag=a.tag||a.name||'Alliance';
 $('.nexa-v40-alliance-passport h1',hub).textContent=tag;
 $('.nexa-v40-alliance-passport p',hub).textContent=(a.name&&a.name!==tag)?a.name:'Alliance Passport';
 const emblem=a.emblem_url||a.emblem||'';
 const em=$('.nexa-v40-emblem',hub);if(emblem)em.innerHTML=`<img src="${String(emblem).replace(/"/g,'&quot;')}" alt="">`;
 const {data:members}=await ctx.c.from('player_accounts').select('id,in_game_name,player_id,alliance_role,alliance_verified_at,is_main').eq('alliance_id',ctx.acct.alliance_id).order('is_main',{ascending:false});
 const verified=(members||[]).filter(x=>x.alliance_verified_at).length,pending=(members||[]).filter(x=>!x.alliance_verified_at).length;
 $('.nexa-v40-alliance-stats',hub).innerHTML=`<span class="nexa-v40-stat">${verified} Members</span><span class="nexa-v40-stat">${pending} Pending</span><span class="nexa-v40-stat">ACTIVE</span>`;
 hubPanel('members',ctx,members||[]);
 $$('.nexa-v40-hub-tabs button',hub).forEach(b=>b.onclick=()=>hubPanel(b.dataset.tab,ctx,members||[]));
}
function allianceTag(){
 const t=tx($('#nexa-profile-launcher-name'));const m=t.match(/•\s*([^•]+)\s*•\s*ID/i);return m?m[1].trim():'My Alliance';
}
function ensureMenu(){
 const menu=$('#nexa-home-menu');if(!menu)return;
 // remove NAVIGATION label by literal text
 $$('*',menu).filter(e=>e.children.length===0&&/^NAVIGATION$/i.test(tx(e))).forEach(e=>e.remove());
 $('#nexa-v40-my-alliance')?.remove();
 const home=$$('#nexa-home-menu button,#nexa-home-menu a').find(e=>/^Home$/i.test(tx(e)));
 const tools=$$('*',menu).find(e=>e.children.length===0&&/^TOOLS$/i.test(tx(e)));
 const parent=(home||tools)?.parentElement||menu;
 const b=document.createElement('button');b.id='nexa-v40-my-alliance';b.type='button';b.innerHTML=`My Alliance<small>${allianceTag()}</small>`;b.onclick=openAllianceHub;
 if(home&&home.parentElement===parent)parent.insertBefore(b,home);else if(tools)tools.before(b);else parent.prepend(b);
}

function run(){
 installCSS();removeOld();ensureHome();preserveRails();ensureCardTools();ensureProfileActions();ensureMenu();ensureAdminChrome();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,450);setTimeout(run,1300)},{once:true});
else{run();setTimeout(run,450);setTimeout(run,1300)}
let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
})();