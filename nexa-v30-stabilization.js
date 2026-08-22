/* NEXA V39 — TARGETED SCREENSHOT FIX */
(()=>{'use strict';
if(window.__NEXA_V39__)return;window.__NEXA_V39__=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

function style(){
  $('#nexa-v39-css')?.remove();
  const s=document.createElement('style'); s.id='nexa-v39-css';
  s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important}
*,*:before,*:after{box-sizing:border-box!important}
main.shell{width:min(680px,calc(100% - 24px))!important;max-width:calc(100% - 24px)!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
main.shell>*{grid-column:1/-1!important;width:100%!important;max-width:100%!important;min-width:0!important}
main.shell>.hero{padding:14px 0 8px!important;margin:0!important;min-height:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
main.shell>.hero h1{margin:0!important;font-size:clamp(42px,12vw,62px)!important;line-height:.95!important;letter-spacing:-.04em!important}
main.shell>.hero p{display:none!important}
#nexa-profile-launcher-section{padding:12px 0 14px!important;margin:0!important;min-height:0!important;height:auto!important;background:transparent!important;border:0!important;border-radius:0!important;outline:0!important;box-shadow:none!important}

#nexa-v39-stellar,#home-svs-section,#home-transfers-section,#nexa-v39-pulse,#nexa-v39-alliance{width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;border-radius:18px!important;overflow:hidden!important}
#nexa-v39-stellar{display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;padding:9px 13px!important;text-align:center!important;border:1px solid rgba(77,186,255,.42)!important;background:linear-gradient(145deg,rgba(10,24,48,.92),rgba(5,9,28,.97))!important}
#nexa-v39-stellar b{color:#86e9ff!important;font-size:9px!important;letter-spacing:.16em!important;white-space:nowrap!important}
#nexa-v39-stellar span{font-size:11px!important;line-height:1.25!important;color:#c7d0e7!important}

#home-svs-section,#home-transfers-section{padding:10px 13px!important;background:linear-gradient(145deg,rgba(12,18,42,.94),rgba(6,10,27,.98))!important}
#home-svs-section{border:1px solid rgba(126,105,255,.34)!important}
#home-transfers-section{border:1px solid rgba(255,137,76,.32)!important}
#home-svs-section>.head,#home-transfers-section>.head{padding:0!important;margin:0 0 5px!important;min-height:0!important}
#home-svs-section>.head h2,#home-transfers-section>.head h2{margin:0!important;font-size:15px!important;line-height:1.1!important}
#home-svs-section>.glass,#home-transfers-section>.glass,#home-svs-section .event{padding:0!important;margin:0!important;min-height:0!important;height:auto!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.nexa-v39-empty{margin:0!important;font-size:10px!important;line-height:1.3!important;color:#acb7d0!important}

#nexa-v39-pulse,#nexa-v39-alliance{padding:10px 13px!important}
#nexa-v39-pulse{border:1px solid rgba(48,211,255,.44)!important;background:linear-gradient(145deg,rgba(4,34,53,.93),rgba(4,11,30,.98))!important}
#nexa-v39-alliance{border:1px solid rgba(219,66,255,.45)!important;background:linear-gradient(145deg,rgba(37,8,52,.93),rgba(13,6,30,.98))!important}
.nexa-v39-k{font-size:8px!important;letter-spacing:.17em!important;font-weight:950!important;margin-bottom:4px!important}
#nexa-v39-pulse .nexa-v39-k{color:#66eaff!important} #nexa-v39-alliance .nexa-v39-k{color:#ec8cff!important}
#nexa-v39-pulse h3,#nexa-v39-alliance h3{margin:0 0 2px!important;font-size:14px!important}
#nexa-v39-pulse p,#nexa-v39-alliance p{margin:0!important;font-size:10px!important;line-height:1.25!important;color:#acb7d0!important}

#nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px)!important}
#nexa-v39-my-alliance{display:flex!important;flex-direction:column!important;align-items:flex-start!important;width:100%!important;min-height:56px!important;padding:10px 20px!important;border:0!important;background:transparent!important;color:#fff!important;text-align:left!important;font:inherit!important;font-weight:900!important}
#nexa-v39-my-alliance small{margin-top:3px!important;color:#7fdcff!important;font-size:10px!important}

#nexa-profile-modal .nexa-profile-tabs{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:none!important;-webkit-overflow-scrolling:touch!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;min-width:86px!important}
#nexa-profile-modal .nexa-lib-grid,#nexa-profile-modal [class*="hero-grid" i],#nexa-profile-modal [class*="library-grid" i]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px 8px!important;width:100%!important}
#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:none!important;-webkit-overflow-scrolling:touch!important}
#nexa-profile-modal [class*="generation" i]>*,#nexa-profile-modal [class*="gen-tabs" i]>*,#nexa-profile-modal [class*="gen-row" i]>*,#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}
#nexa-v38-profile-help,#nexa-v38-ministry,#nexa-v38-my-alliance,#nexa-v38-stellar,#nexa-v38-pulse,#nexa-v38-alliance{display:none!important}
`;
  document.head.appendChild(s);
}

function killOld(){
 ['nexa-v38-profile-help','nexa-v38-ministry','nexa-v38-my-alliance','nexa-v38-stellar','nexa-v38-pulse','nexa-v38-alliance','nexa-v37-stellar','nexa-v37-pulse','nexa-v37-alliance'].forEach(id=>$('#'+id)?.remove());
}

function removeDuplicateStellar(){
 const main=$('main.shell'); if(!main)return;
 $$('*',main).filter(e=>e.children.length===0&&/^STELLAR SIGNAL$/i.test(tx(e))).forEach(leaf=>{
   if(leaf.closest('#nexa-v39-stellar'))return;
   let p=leaf;
   for(let i=0;i<6&&p&&p!==main;i++,p=p.parentElement){
     const t=tx(p),r=p.getBoundingClientRect();
     if(/STELLAR SIGNAL/i.test(t)&&/Small course corrections/i.test(t)&&r.width>180&&r.height<360){p.remove();break}
   }
 });
}

function home(){
 const main=$('main.shell'),profile=$('#nexa-profile-launcher-section'); if(!main||!profile)return;
 removeDuplicateStellar();
 let st=$('#nexa-v39-stellar'); if(!st){st=document.createElement('section');st.id='nexa-v39-stellar';st.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>'}
 main.insertBefore(st,profile);

 const live=$('#home-svs-section'); if(live){
   const title=tx($('#home-event-title')),cd=tx($('#home-event-countdown'));
   const active=!!title&&!/XXXX|TBD|NO\s+EVENT/i.test(title)&&!!cd&&!/^[—–-]+$/.test(cd);
   let e=$('#nexa-v39-live-empty',live);
   if(!active){$('.glass',live)?.setAttribute('hidden','');$('.event-actions',live)?.setAttribute('hidden','');if(!e){e=document.createElement('p');e.id='nexa-v39-live-empty';e.className='nexa-v39-empty';e.textContent='Server events and current SvS information will appear here when published.';live.appendChild(e)}}
   else{$('.glass',live)?.removeAttribute('hidden');e?.remove()}
 }

 const tr=$('#home-transfers-section'); if(tr){
   const d=$('#home-transfer-events'),t=tx(d),active=!!t&&!/Transfer Center|Applications stay available|next transfer cycle/i.test(t);
   let e=$('#nexa-v39-transfer-empty',tr);
   if(!active){d?.setAttribute('hidden','');$('.nexa-transfer-home-actions',tr)?.setAttribute('hidden','');if(!e){e=document.createElement('p');e.id='nexa-v39-transfer-empty';e.className='nexa-v39-empty';e.textContent='Transfer cycle information will appear here when a cycle is published.';tr.appendChild(e)}}
   else{d?.removeAttribute('hidden');e?.remove()}
 }

 let p=$('#nexa-v39-pulse');if(!p){p=document.createElement('section');p.id='nexa-v39-pulse';p.innerHTML='<div class="nexa-v39-k">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>'}
 let a=$('#nexa-v39-alliance');if(!a){a=document.createElement('section');a.id='nexa-v39-alliance';a.innerHTML='<div class="nexa-v39-k">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>'}
 const anchor=tr||live||profile;anchor.after(p);p.after(a);
}

function allianceTag(){
 const t=tx($('#nexa-profile-launcher-name'));const m=t.match(/•\s*([^•]+)\s*•\s*ID/i);return m?m[1].trim():'My Alliance';
}
function menu(){
 const m=$('#nexa-home-menu');if(!m)return;
 $('#nexa-v39-my-alliance')?.remove();
 const admin=$$('#nexa-home-menu button,#nexa-home-menu a').find(e=>/^Administration$/i.test(tx(e))); if(!admin||!admin.parentElement)return;
 const b=document.createElement('button');b.id='nexa-v39-my-alliance';b.type='button';b.innerHTML=`My Alliance<small>${allianceTag()}</small>`;
 b.onclick=()=>{admin.click();setTimeout(()=>{$$('button,a').find(e=>/^Alliances$/i.test(tx(e)))?.click()},180)};
 admin.parentElement.insertBefore(b,admin);
}

function run(){style();killOld();home();menu()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,500);setTimeout(run,1400)},{once:true});else{run();setTimeout(run,500);setTimeout(run,1400)}
let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
})();