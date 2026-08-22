/* NEXA V30.2 — Consolidated recovery patch
   Fixes iOS navigation/scroll regressions, profile usability, troop galaxy presentation,
   and keeps Home from reopening Administration after refresh.
*/
(()=>{
'use strict';
if(window.__NEXA_V302__) return;
window.__NEXA_V302__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>String(e?.textContent||'').replace(/\s+/g,' ').trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const railPos=new WeakMap();
let adminIntent=false, queued=false;

function css(){
 if($('#nexa-v302-style')) return;
 const st=document.createElement('style'); st.id='nexa-v302-style';
 st.textContent=`
 html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
 body{min-width:0!important}
 .nexa-v302-hide{display:none!important}

 /* HOME */
 .nexa-v302-stellar{position:relative!important;overflow:hidden!important;isolation:isolate!important}
 .nexa-v302-stellar:before,.nexa-v302-stellar:after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:
 radial-gradient(circle at 8% 30%,#fff 0 1px,transparent 1.7px),radial-gradient(circle at 22% 72%,#69dcff 0 1px,transparent 1.8px),
 radial-gradient(circle at 43% 16%,#d9c7ff 0 1px,transparent 1.8px),radial-gradient(circle at 66% 76%,#fff 0 1px,transparent 1.8px),
 radial-gradient(circle at 91% 25%,#75d7ff 0 1px,transparent 1.8px);animation:nexaV302Twinkle 3.6s ease-in-out infinite alternate;opacity:.55}
 .nexa-v302-stellar:after{transform:scale(.82) rotate(23deg);animation-delay:1.1s;animation-duration:5.2s;opacity:.34}
 .nexa-v302-stellar>*{position:relative;z-index:1}
 @keyframes nexaV302Twinkle{0%{opacity:.18;filter:brightness(.8)}50%{opacity:.85;filter:brightness(1.55)}100%{opacity:.34}}

 /* ADMIN: centered single shell */
 #admin-modal{box-sizing:border-box!important}
 #admin-modal.open,#admin-modal.nexa-v25-admin,#admin-modal.nexa-v30-shell{position:fixed!important;left:12px!important;right:12px!important;top:max(12px,env(safe-area-inset-top))!important;bottom:max(12px,env(safe-area-inset-bottom))!important;width:auto!important;max-width:760px!important;height:auto!important;max-height:none!important;margin:0 auto!important;overflow-y:auto!important;overflow-x:hidden!important;border-radius:24px!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}
 #admin-modal .modal-content,#admin-modal .admin-content,#admin-modal .admin-modal-card,#admin-modal .nexa-v25-host,#admin-modal #svs-admin-content{width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;max-height:none!important;overflow:visible!important;box-sizing:border-box!important}
 #admin-modal .nexa-v25-host{padding-left:16px!important;padding-right:16px!important;padding-bottom:36px!important}
 #admin-modal .nexa-v25-panel,#admin-modal [class*="admin-panel"],#admin-modal [class*="access-panel"]{width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;box-sizing:border-box!important;margin-left:auto!important;margin-right:auto!important}
 #admin-modal .nexa-v25-planets{width:100%!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
 @media(max-width:430px){#admin-modal.open,#admin-modal.nexa-v25-admin,#admin-modal.nexa-v30-shell{left:10px!important;right:10px!important}#admin-modal .nexa-v25-host{padding-left:14px!important;padding-right:14px!important}}

 /* PROFILE/PASSPORT: one scroll, no crop */
 .nexa-v302-profile-shell{position:fixed!important;inset:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important;width:auto!important;max-width:760px!important;height:auto!important;max-height:none!important;margin:0 auto!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;box-sizing:border-box!important;padding-bottom:calc(100px + env(safe-area-inset-bottom))!important}
 .nexa-v302-profile-shell>*{max-width:100%!important;box-sizing:border-box!important}
 .nexa-v302-profile-shell h1,.nexa-v302-profile-shell [class*="account-name"],.nexa-v302-profile-shell [class*="passport-name"]{font-size:clamp(22px,6vw,34px)!important;line-height:1.04!important;overflow-wrap:anywhere!important}

 /* HORIZONTAL RAILS */
 .nexa-v302-rail{overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;scroll-behavior:auto!important;overscroll-behavior-x:contain!important;touch-action:pan-x!important;white-space:nowrap!important}
 .nexa-v302-rail>*{scroll-snap-align:none!important;flex-shrink:0!important}

 /* TROOPS — galaxy star + moving orbit, while retaining the actual tier hex */
 .nexa-v302-troop-star{position:relative!important;overflow:visible!important;background:transparent!important;isolation:isolate!important}
 .nexa-v302-troop-star:before{content:"";position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(105,214,255,.32);box-shadow:0 0 18px rgba(71,205,255,.18),0 0 36px rgba(114,78,255,.16);background:radial-gradient(circle at 16% 19%,#fff 0 1px,transparent 1.6px),radial-gradient(circle at 82% 18%,#76ddff 0 1px,transparent 1.7px),radial-gradient(circle at 91% 67%,#d9c5ff 0 1px,transparent 1.7px),radial-gradient(circle at 25% 91%,#fff 0 1px,transparent 1.6px);animation:nexaV302StarPulse 3.5s ease-in-out infinite alternate;pointer-events:none;z-index:-1}
 .nexa-v302-troop-star:after{content:"✦";position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;display:grid;place-items:center;color:#d8f7ff;font-size:11px;text-shadow:0 0 6px #fff,0 0 11px #5edaff,0 0 18px #8168ff;animation:nexaV302Orbit 8.5s linear infinite;pointer-events:none;z-index:5}
 @keyframes nexaV302StarPulse{0%{opacity:.55;filter:brightness(.86)}50%{opacity:1;filter:brightness(1.25)}100%{opacity:.72}}
 @keyframes nexaV302Orbit{from{transform:rotate(0deg) translateX(57px) rotate(0deg)}to{transform:rotate(360deg) translateX(57px) rotate(-360deg)}}
 img[src*="nexa-troop-"]{background:transparent!important;object-fit:contain!important;object-position:center!important;clip-path:polygon(25% 5%,75% 5%,98% 50%,75% 95%,25% 95%,2% 50%)!important;filter:drop-shadow(0 0 7px rgba(91,218,255,.36)) drop-shadow(0 0 15px rgba(119,82,255,.24))!important}

 /* Replace OWNED presentation with small action controls */
 .nexa-v302-owned{display:none!important}
 .nexa-v302-card-tools{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin:8px 0 2px}
 .nexa-v302-reset,.nexa-v302-help{border:1px solid rgba(102,112,255,.55);background:linear-gradient(145deg,rgba(20,24,65,.95),rgba(7,12,34,.98));color:#e8efff;border-radius:999px;font-weight:850;min-height:34px;box-shadow:0 0 14px rgba(93,75,255,.10)}
 .nexa-v302-reset{padding:7px 13px}.nexa-v302-help{width:34px;padding:0;border-color:rgba(75,202,255,.55);color:#8fe9ff}

 /* NEXA PULSE */
 #nexa-v302-pulse{margin:14px 0 20px;padding:16px;border:1px solid rgba(100,105,255,.34);border-radius:20px;background:radial-gradient(circle at 10% 0%,rgba(57,188,255,.10),transparent 34%),linear-gradient(145deg,rgba(10,15,44,.92),rgba(4,7,24,.96));box-shadow:0 0 24px rgba(82,77,255,.08)}
 #nexa-v302-pulse .pulse-kicker{font-size:.72rem;letter-spacing:.22em;font-weight:950;color:#84e3ff}#nexa-v302-pulse h3{margin:5px 0 6px;color:#fff}#nexa-v302-pulse p{margin:0;color:#aeb9d5;line-height:1.45}
 `;
 document.head.appendChild(st);
}

function normalizeLanding(){
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 const isReload=nav?.type==='reload';
 const u=new URL(location.href);
 if((isReload || !sessionStorage.getItem('nexaAdminIntent')) && (u.searchParams.has('admin')||u.searchParams.has('tab'))){
   u.searchParams.delete('admin'); u.searchParams.delete('tab');
   history.replaceState({},'',u.pathname+(u.searchParams.toString()?('?'+u.searchParams):'')+u.hash);
 }
 sessionStorage.removeItem('nexaAdminIntent');
 const m=$('#admin-modal'); if(m && !adminIntent){m.classList.remove('open');m.setAttribute('aria-hidden','true');}
}

function stellar(){
 const els=$$('section,article,div').filter(e=>/STELLAR SIGNAL|NEXA SIGNAL/i.test(text(e)) && text(e).length<300);
 const e=els.sort((a,b)=>a.children.length-b.children.length)[0];
 if(!e) return; e.classList.add('nexa-v302-stellar');
 $$('*',e).forEach(x=>{if(/^NEXA SIGNAL$/i.test(text(x))) x.textContent='STELLAR SIGNAL'});
 const q=$$('p,span,div',e).find(x=>x.children.length===0 && text(x).length>20 && !/STELLAR SIGNAL/i.test(text(x)));
 if(q) q.textContent='Clear signals turn scattered stars into one constellation.';
}

function pulse(){
 if($('#nexa-v302-pulse')) return;
 const live=$('#home-svs-section'), transfer=$('#home-transfers-section');
 if(!live && !transfer) return;
 const anchor=(live?.parentElement===transfer?.parentElement?live.parentElement:null)||transfer?.parentElement||live?.parentElement;
 if(!anchor) return;
 const p=document.createElement('section');p.id='nexa-v302-pulse';
 p.innerHTML='<div class="pulse-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Active forms, surveys and event response requests will appear here when leadership publishes them.</p>';
 if(transfer && transfer.parentElement===anchor) transfer.insertAdjacentElement('afterend',p); else anchor.appendChild(p);
}

function centerAdmin(){
 const m=$('#admin-modal'); if(!m) return;
 $$('.nexa-v25-panel,[class*="admin-panel"],[class*="access-panel"]',m).forEach(x=>{x.style.minHeight='0';x.style.height='auto'});
 // only hide duplicate Bug Reports under Testing/Sandbox
 const bugs=$$('h2,h3,h4,strong,b',m).filter(x=>/^Bug Reports$/i.test(text(x)));
 if(bugs.length>1) bugs.slice(1).forEach(h=>{const c=h.closest('article,.nexa-v25-panel,.card,.panel,section'); if(c && /Testing\s*\/\s*Sandbox/i.test(text(c.parentElement))) c.style.display='none'});
}

function adminNav(){
 if(window.__NEXA_V302_NAV__) return; window.__NEXA_V302_NAV__=1;
 document.addEventListener('click',e=>{
   const b=e.target.closest('button,a'); if(!b) return;
   const label=text(b);
   const map={Alliances:'alliances','NEXA Access':'permissions',Roles:'roles','System Operations':'system'};
   if(label==='Library' && b.closest('#nexa-home-menu,.nexa-home-menu-card,.nexa-home-menu-subview')){
     e.preventDefault();e.stopImmediatePropagation();location.href='library.html';return;
   }
   const tab=map[label]; if(!tab || !b.closest('#nexa-home-menu,.nexa-home-menu-card,.nexa-home-menu-subview')) return;
   e.preventDefault();e.stopImmediatePropagation();adminIntent=true;sessionStorage.setItem('nexaAdminIntent','1');
   const u=new URL(location.href);u.searchParams.set('admin','administration');u.searchParams.set('tab',tab);location.href=u.toString();
 },true);
}

function profileShell(){
 const candidates=$$('div,section,article').filter(e=>{
   const t=text(e).slice(0,350); if(!/PROFILE CONFIGURATION|PLAYER INTELLIGENCE PROFILE|DIGITAL PROFILE PASSPORT/i.test(t)) return false;
   const r=e.getBoundingClientRect(); return r.width>280 && r.height>340;
 });
 candidates.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width).slice(0,1).forEach(e=>e.classList.add('nexa-v302-profile-shell'));
}

function rails(){
 const all=$$('*').filter(e=>e instanceof HTMLElement && e.children.length>1 && e.scrollWidth>e.clientWidth+18 && ['auto','scroll'].includes(getComputedStyle(e).overflowX));
 all.forEach(e=>{
   e.classList.add('nexa-v302-rail');
   if(e.dataset.v302rail) return; e.dataset.v302rail='1';
   e.addEventListener('scroll',()=>railPos.set(e,e.scrollLeft),{passive:true});
   e.addEventListener('touchend',()=>{railPos.set(e,e.scrollLeft);setTimeout(()=>{const p=railPos.get(e);if(Number.isFinite(p)&&Math.abs(e.scrollLeft-p)>10)e.scrollLeft=p},120)},{passive:true});
 });
 requestAnimationFrame(()=>all.forEach(e=>{const p=railPos.get(e);if(Number.isFinite(p)&&Math.abs(e.scrollLeft-p)>10)e.scrollLeft=p}));
}

function troopAssets(){
 const types=['infantry','lancer','marksman'];
 $$('img').forEach(img=>{
   const host=img.closest('article,.card,[class*="card"],section,div'); if(!host) return;
   const t=text(host).toLowerCase(); const type=types.find(x=>t.includes(x)); if(!type) return;
   const tierMatch=t.match(/(?:^|\s)t(?:ier)?\s*(1[0-2]|[1-9])\b/i)||t.match(/\b(1[0-2]|[1-9])\b/);
   let tier=tierMatch?Number(tierMatch[1]):null;
   const selected=$$('button,[role="button"]',host).find(b=>/\bT?(?:1[0-2]|[1-9])\b/i.test(text(b)) && (b.classList.contains('active')||b.classList.contains('selected')||b.getAttribute('aria-pressed')==='true'));
   if(selected){const m=text(selected).match(/(1[0-2]|[1-9])/);if(m)tier=Number(m[1])}
   if(tier && tier>=1 && tier<=12 && (/nexa-troop-|troop/i.test(img.src)||/troop/i.test(img.alt||''))) img.src=`nexa-troop-${type}-t${tier}.webp`;
   if(/nexa-troop-/.test(img.src)){const p=img.parentElement;if(p)p.classList.add('nexa-v302-troop-star')}
 });
}

function ownedTools(){
 $$('label,span,div,b,strong').forEach(e=>{
   if(!/^OWNED$/i.test(text(e))) return;
   const lab=e.closest('label')||e; lab.classList.add('nexa-v302-owned');
   const card=e.closest('article,.card,[class*="card"],[class*="config"],section'); if(!card||card.querySelector('.nexa-v302-card-tools')) return;
   const tools=document.createElement('div');tools.className='nexa-v302-card-tools';tools.innerHTML='<button type="button" class="nexa-v302-reset">Reset</button><button type="button" class="nexa-v302-help" aria-label="Help">?</button>';
   card.appendChild(tools);
   tools.querySelector('.nexa-v302-help').onclick=()=>alert('If this entry was marked or filled incorrectly, use Reset to clear the selection and return it to an unconfigured state.');
   tools.querySelector('.nexa-v302-reset').onclick=()=>{
     $$('input',card).forEach(i=>{if(i.type==='checkbox'||i.type==='radio')i.checked=false;else if(i.type!=='hidden')i.value=''});
     $$('select',card).forEach(s=>s.selectedIndex=0);$$('.active,.selected',card).forEach(x=>{if(!x.closest('.nexa-v302-card-tools'))x.classList.remove('active','selected')});
     card.dispatchEvent(new Event('change',{bubbles:true}));
   };
 });
}

async function syncHeroImages(){
 const sb=window.supabaseClient||window.sb; if(!sb?.from) return;
 if(window.__NEXA_V302_HERO_SYNC__) return; window.__NEXA_V302_HERO_SYNC__=1;
 try{
  const {data,error}=await sb.from('nexa_library_items').select('name,image_url,item_type').eq('item_type','hero').eq('is_active',true); if(error||!data) return;
  const map=new Map(data.filter(x=>x.image_url).map(x=>[String(x.name).toLowerCase(),x.image_url]));
  $$('article,.card,[class*="hero"],[class*="profile-item"]').forEach(c=>{const t=text(c).toLowerCase();for(const [name,url] of map){if(t.includes(name)){const img=$('img',c);if(img && img.src!==url)img.src=url;break}}});
 }catch(_){}
}

function run(){css();stellar();pulse();centerAdmin();profileShell();rails();troopAssets();ownedTools();syncHeroImages()}
adminNav();normalizeLanding();run();
const mo=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})});mo.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',()=>{normalizeLanding();run()},{passive:true});window.addEventListener('resize',()=>setTimeout(run,80),{passive:true});
})();
