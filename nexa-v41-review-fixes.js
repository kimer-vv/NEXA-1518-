/* NEXA V41.2 — CONSOLIDATED REVIEW/STABILITY REPLACEMENT
   Replace the ENTIRE contents of nexa-v41-review-fixes.js with this file.
   Goals:
   - No extra patch layer: replaces the previous V41.
   - Fix Safari/admin URL resurrection + auth flashes from full-page admin navigation.
   - Unify Library inside Administration.
   - Fix Profile controls, rails, duplicate Reset/Guide controls and Deployment label.
   - Clean Administration shell, add reliable section navigation.
   - Give My Alliance a true NEXA galaxy treatment and actionable pending approval.
   No schema migration. No troop artwork integration. No Charms data changes.
*/
(()=>{'use strict';
if(window.__NEXA_V412__)return;window.__NEXA_V412__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let localSb=null;
let adminSection='alliances';
let libraryOpen=false;
let adminObserver=null;

function sb(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}

function addCSS(){
 if($('#nexa-v412-css'))return;
 const s=document.createElement('style');s.id='nexa-v412-css';
 s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important}

/* ---------- PROFILE ---------- */
#nexa-profile-modal{overflow:hidden!important;padding:6px!important}
#nexa-profile-modal .nexa-profile-sheet{
 width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;
 max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;
 -webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important
}
#nexa-profile-modal .nexa-profile-hero,#nexa-profile-modal .nexa-profile-content,
#nexa-profile-modal form,#nexa-profile-modal fieldset,#nexa-profile-modal [class*="panel" i],
#nexa-profile-modal [class*="detail" i],#nexa-profile-modal [class*="editor" i]{max-width:100%!important;min-width:0!important}
#nexa-profile-modal input,#nexa-profile-modal select,#nexa-profile-modal textarea{max-width:100%!important;min-width:0!important}

/* Deployment must stay on one line. */
#nexa-profile-modal .nexa-profile-stats>*:nth-child(3) small,
#nexa-profile-modal .nexa-profile-stats>*:nth-child(3) [class*="label" i]{
 white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;
 font-size:clamp(7px,1.8vw,10px)!important;letter-spacing:.12em!important
}

/* Profile category + generation rails are true native horizontal scrollers. */
#nexa-profile-modal .nexa-profile-tabs,
#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],
#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]{
 display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
 scroll-snap-type:none!important;scroll-behavior:auto!important;-webkit-overflow-scrolling:touch!important;
 overscroll-behavior-x:contain!important;touch-action:pan-x!important;scrollbar-width:none!important;
 padding-right:28px!important
}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,
#nexa-profile-modal [class*="generation" i]::-webkit-scrollbar,
#nexa-profile-modal [class*="gen-row" i]::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;min-width:78px!important;padding-inline:10px!important;white-space:nowrap!important}
#nexa-profile-modal [class*="generation" i]>*,#nexa-profile-modal [class*="gen-tabs" i]>*,
#nexa-profile-modal [class*="gen-row" i]>*,#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}

/* Exactly one Reset + contextual Guide per item card. */
#nexa-profile-modal .nexa-v40-item-tools{max-width:100%!important}
#nexa-profile-modal .nexa-v412-orphan-tools{display:none!important}
#nexa-profile-modal [class*="owned" i]{display:none!important}

/* ---------- HOME MENU ---------- */
#nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px)!important}
#nexa-v40-my-alliance{
 min-height:72px!important;padding:13px 20px!important;
 background:radial-gradient(circle at 12% 0%,rgba(226,64,255,.14),transparent 42%),linear-gradient(90deg,rgba(70,26,111,.32),rgba(14,20,55,.18))!important;
 border-bottom:1px solid rgba(213,91,255,.14)!important
}
#nexa-v40-my-alliance{font-size:18px!important;text-shadow:0 0 18px rgba(235,79,255,.30)!important}
#nexa-v40-my-alliance small{font-size:12px!important;color:#f09cff!important;letter-spacing:.08em!important}
.nexa-v412-menu-hide{display:none!important}
#nexa-v412-report-bugs{display:flex!important;width:100%!important;align-items:center!important;justify-content:space-between!important;
 min-height:54px!important;padding:10px 20px!important;border:0!important;background:transparent!important;color:#f1ecff!important;
 font:inherit!important;font-weight:850!important;text-align:left!important}
#nexa-v412-report-bugs span:last-child{color:#6fdcff!important}

/* ---------- ADMINISTRATION SHELL ---------- */
#admin-modal.open{overflow:hidden!important}
#admin-modal .admin-modal-card{
 width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;
 margin:0!important;border:0!important;border-radius:0!important;overflow-y:auto!important;overflow-x:hidden!important;
 padding:calc(10px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom))!important;
 background:
  radial-gradient(circle at 12% 9%,rgba(77,104,255,.16),transparent 30%),
  radial-gradient(circle at 88% 24%,rgba(212,68,255,.12),transparent 30%),
  radial-gradient(circle at 48% 82%,rgba(46,201,255,.07),transparent 34%),
  linear-gradient(165deg,#080d25,#030611 76%)!important;
 -webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important
}
#admin-modal .admin-modal-card:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.09;
 background-image:radial-gradient(circle,rgba(255,255,255,.8) 0 1px,transparent 1.4px),radial-gradient(circle,rgba(101,184,255,.75) 0 1px,transparent 1.4px);
 background-size:49px 49px,83px 83px;background-position:7px 13px,29px 31px}
#admin-modal .admin-modal-card>*{position:relative;z-index:1;max-width:720px!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;min-width:0!important}

/* One close only: keep the X in the top-right. V40 may change its text; CSS owns its visual. */
#admin-modal [data-close-admin]{position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:14px!important;z-index:2147483200!important;
 width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid rgba(255,72,173,.62)!important;
 background:rgba(33,7,38,.90)!important;color:transparent!important;font-size:0!important;box-shadow:0 0 20px rgba(255,62,173,.16)!important}
#admin-modal [data-close-admin]:after{content:"×"!important;color:#ff8fc8!important;font-size:28px!important;line-height:1!important;font-weight:900!important}
#admin-modal .modal-backdrop[data-close-admin]{display:none!important}
#admin-modal .modal-head{min-height:50px!important;padding:0 54px 4px 0!important}
#admin-modal .modal-head>div{display:none!important}
#admin-modal .nexa-v412-hide-close,#admin-modal .nexa-v412-hide-menu{display:none!important}

/* Remove old tab/menu bars from the module surface. Navigation is handled by clean arrows. */
#admin-modal #admin-context-tabs{display:none!important}
#admin-modal.module-view #nexa-module-shell-head{display:none!important}
#admin-modal #nexa-v40-admin-guide{margin:2px 0 6px!important}

#nexa-v412-admin-nav{display:grid!important;grid-template-columns:48px 1fr 48px!important;align-items:center!important;gap:10px!important;
 margin:2px auto 8px!important;padding:0 0 5px!important;max-width:720px!important}
#nexa-v412-admin-nav button{width:44px!important;height:38px!important;border-radius:999px!important;border:1px solid rgba(117,104,255,.54)!important;
 background:linear-gradient(145deg,rgba(30,26,72,.95),rgba(7,13,36,.98))!important;color:#dce3ff!important;font-size:20px!important;font-weight:900!important}
#nexa-v412-admin-nav button:disabled{opacity:.18!important}
#nexa-v412-admin-nav b{text-align:center!important;color:#fff!important;font-size:16px!important;letter-spacing:.02em!important}

#admin-modal #svs-admin-content{padding-top:0!important}
#admin-modal #admin-alliances,#admin-modal #admin-roles,#admin-modal #admin-permissions,#admin-modal #admin-system,#admin-modal #admin-library{
 margin-top:4px!important;padding-top:0!important;max-width:680px!important
}
#admin-modal #admin-alliances>.admin-section-head,#admin-modal #admin-roles>.admin-section-head,
#admin-modal #admin-permissions>.admin-section-head,#admin-modal #admin-system>.admin-section-head,#admin-modal #admin-library>.admin-section-head{margin-top:0!important}

/* Embedded Library fills this same Administration surface. */
#admin-modal #internal-module-frame-wrap.nexa-v412-library{display:block!important;width:100%!important;max-width:720px!important;margin:0 auto!important;overflow:visible!important}
#admin-modal #internal-module-frame-wrap.nexa-v412-library #internal-module-frame{display:block!important;width:100%!important;height:1100px;min-height:900px!important;border:0!important;background:transparent!important;overflow:hidden!important}

/* ---------- MY ALLIANCE ---------- */
#nexa-v40-alliance-hub{
 background:
  radial-gradient(circle at 16% 10%,rgba(86,102,255,.19),transparent 31%),
  radial-gradient(circle at 85% 18%,rgba(231,62,255,.14),transparent 29%),
  radial-gradient(circle at 48% 72%,rgba(35,204,255,.08),transparent 36%),
  linear-gradient(165deg,#080d25,#030611 76%)!important;
 overflow-x:hidden!important
}
#nexa-v40-alliance-hub:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.16;
 background-image:radial-gradient(circle,rgba(255,255,255,.9) 0 1px,transparent 1.5px),radial-gradient(circle,rgba(91,196,255,.8) 0 1px,transparent 1.5px);
 background-size:51px 51px,91px 91px;background-position:8px 14px,33px 26px}
#nexa-v40-alliance-hub>*{position:relative;z-index:1}
.nexa-v40-alliance-passport{max-width:520px!important;margin:0 auto!important;border:1px solid rgba(132,105,255,.24)!important;border-radius:26px!important;
 background:linear-gradient(145deg,rgba(15,22,54,.72),rgba(6,10,28,.48))!important;box-shadow:0 0 32px rgba(94,75,255,.08)!important;padding:18px 12px!important}
.nexa-v40-emblem{width:112px!important;height:112px!important;box-shadow:0 0 32px rgba(148,100,255,.22),inset 0 0 24px rgba(78,168,255,.08)!important}
.nexa-v40-hub-tabs{max-width:680px!important;margin:10px auto 0!important;padding:6px 2px 12px!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
#nexa-v40-hub-body{max-width:680px!important;margin:0 auto!important}
.nexa-v40-member{margin:10px 0!important;padding:13px 14px!important;border:1px solid rgba(114,98,255,.24)!important;border-radius:17px!important;
 background:linear-gradient(145deg,rgba(14,20,48,.80),rgba(6,10,27,.88))!important;box-shadow:0 0 20px rgba(82,73,255,.06)!important}
.nexa-v412-pending-actions{display:flex!important;gap:8px!important;justify-content:flex-end!important;margin-top:10px!important}
.nexa-v412-approve{border:1px solid rgba(73,220,179,.55)!important;border-radius:999px!important;background:rgba(18,79,65,.32)!important;color:#8ff2d4!important;padding:7px 12px!important;font-weight:900!important}

@media(max-width:700px){
 #admin-modal .admin-modal-card{padding-left:12px!important;padding-right:12px!important}
 #nexa-v412-admin-nav{grid-template-columns:44px minmax(0,1fr) 44px!important}
 #nexa-profile-modal .nexa-profile-tab{min-width:74px!important}
}
`;
 document.head.appendChild(s);
}

function overlay(id,title,body,accent='#ff4fd8'){
 $('#'+id)?.remove();
 const d=document.createElement('div');d.id=id;
 d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);display:grid;place-items:center;padding:16px';
 d.innerHTML=`<section style="width:min(520px,100%);max-height:82dvh;overflow:auto;border:1px solid ${accent};border-radius:22px;padding:20px;background:radial-gradient(circle at 10% 0%,rgba(109,74,255,.18),transparent 35%),linear-gradient(155deg,#0b1028,#050713);color:#fff;box-shadow:0 25px 70px rgba(0,0,0,.58)"><div style="font-size:10px;letter-spacing:.16em;color:${accent};font-weight:950">GUIDE</div><h2 style="margin:6px 0 9px">${title}</h2><div style="color:#c4c7db;line-height:1.5;font-size:13px">${body}</div><button type="button" style="width:100%;margin-top:16px;padding:10px;border-radius:999px;border:1px solid ${accent};background:#11152f;color:#fff;font-weight:900">Close</button></section>`;
 d.addEventListener('click',e=>{if(e.target===d)d.remove()});d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}

function profileGuide(){overlay('nexa-v412-profile-guide','Player Profile','Maintain the selected account here. Update identity, Furnace, Power and Deployment, then use the horizontal category rails for Heroes, Experts, Troops, Pets, Chief Gear and Charms. Gold Guide buttons explain a specific item.','#ff4fd8')}
function ministry(){overlay('nexa-v412-ministry','Ministry Schedule','Your Ministry appointments and their live status appear here when schedule data is available. This shortcut stays attached to the active account profile.','#bca7ff')}

function profileCleanup(){
 const root=$('#nexa-profile-modal');if(!root)return;
 /* Remove orphan/duplicated item tool rows, preserve one inside each real item card. */
 $$('.nexa-v40-item-tools',root).forEach(tools=>{
   const card=tools.closest('.nexa-lib-card,[class*="hero-card" i],[class*="hero-item" i],[class*="expert-card" i],[class*="pet-card" i]');
   if(!card){tools.classList.add('nexa-v412-orphan-tools');return}
   const all=$$('.nexa-v40-item-tools',card);all.slice(1).forEach(x=>x.remove());
 });
}

function removeDuplicateStellar(){
 const good=$('#nexa-v40-stellar');if(!good)return;
 $$('section,div,article').forEach(el=>{
  if(el===good||good.contains(el)||el.contains(good))return;
  const t=txt(el);if(/STELLAR SIGNAL/i.test(t)&&/Chart the course|Move together|Adjust with the stars/i.test(t))el.style.setProperty('display','none','important');
 });
}

function cleanURLAfterAdmin(){
 const u=new URL(location.href);let changed=false;
 if(u.searchParams.has('admin')){u.searchParams.delete('admin');changed=true}
 if(u.searchParams.has('tab')){u.searchParams.delete('tab');changed=true}
 if(changed)history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?('?'+u.searchParams.toString()):'')+u.hash);
}

function closeResurrectedAdmin(){
 const nav=performance.getEntriesByType?.('navigation')?.[0];
 const reload=nav?.type==='reload'||nav?.type==='back_forward';
 if(!reload)return;
 const m=$('#admin-modal');if(!m?.classList.contains('open'))return;
 m.classList.remove('open','module-view');m.setAttribute('aria-hidden','true');
 cleanURLAfterAdmin();
}

function hideExactInside(root,label,cls){
 $$('button,a,div,span',root).forEach(el=>{if(txt(el).toUpperCase()===label&&el.children.length===0)el.classList.add(cls)})
}

const ADMIN_ORDER=['alliances','library','permissions','roles','system'];
const ADMIN_LABEL={alliances:'Alliances',library:'Library',permissions:'NEXA Access',roles:'Operational Roles',system:'System Operations'};

function ensureAdminNav(target=adminSection){
 const modal=$('#admin-modal');const content=$('#svs-admin-content');if(!modal||!content)return;
 let nav=$('#nexa-v412-admin-nav');if(!nav){nav=document.createElement('nav');nav.id='nexa-v412-admin-nav';nav.innerHTML='<button type="button" data-dir="-1">‹</button><b></b><button type="button" data-dir="1">›</button>';content.prepend(nav)}
 adminSection=target;
 const i=ADMIN_ORDER.indexOf(target);$('b',nav).textContent=ADMIN_LABEL[target]||'Administration';
 const buttons=$$('button',nav);buttons[0].disabled=i<=0;buttons[1].disabled=i<0||i>=ADMIN_ORDER.length-1;
 buttons.forEach(b=>b.onclick=()=>{const ni=i+Number(b.dataset.dir||0);if(ni>=0&&ni<ADMIN_ORDER.length)openAdminSection(ADMIN_ORDER[ni])});
}

function adminChrome(){
 const modal=$('#admin-modal');if(!modal)return;
 /* Hide textual Close and MENU, but never the real data-close-admin X. */
 $$('button,a,div,span',modal).forEach(el=>{
  const t=txt(el).toUpperCase();
  if(t==='MENU')el.classList.add('nexa-v412-hide-menu');
  if(t==='CLOSE'&&!el.matches('[data-close-admin]')&&!el.closest('[data-close-admin]'))el.classList.add('nexa-v412-hide-close');
 });
 const x=$('[data-close-admin]:not(.modal-backdrop)',modal);if(x)x.setAttribute('aria-label','Close Administration');
 if(modal.classList.contains('open'))ensureAdminNav(libraryOpen?'library':adminSection);
}

function waitFor(fn,timeout=2500){return new Promise(resolve=>{const t0=Date.now();const tick=()=>{const v=fn();if(v)return resolve(v);if(Date.now()-t0>timeout)return resolve(null);setTimeout(tick,40)};tick()})}

async function openAdminBase(){
 const modal=$('#admin-modal');if(!modal)return null;
 /* Show shell instantly to remove perceived dead-click delay; existing permission handler still runs. */
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');
 $('#admin-panel-button')?.click();
 const open=await waitFor(()=>$('#open-administration'));
 open?.click();
 await waitFor(()=>$('#svs-admin-content')&&!$('#svs-admin-content').classList.contains('hidden'));
 cleanURLAfterAdmin();adminChrome();return modal;
}

function hideAdminSections(){
 ['admin-events','admin-forms','admin-alliances','admin-roles','admin-permissions','admin-library','admin-system','admin-announcements'].forEach(id=>$('#'+id)?.classList.add('hidden'));
 $('#native-module-host')?.classList.add('hidden');
}

function sizeLibraryFrame(frame){
 try{
  const d=frame.contentDocument;if(!d)return;
  const h=Math.max(d.documentElement?.scrollHeight||0,d.body?.scrollHeight||0,900);
  frame.style.height=Math.min(Math.max(h+12,900),5200)+'px';
 }catch(_){ }
}

function styleEmbeddedLibrary(frame){
 try{
  const d=frame.contentDocument;if(!d)return;
  let st=d.getElementById('nexa-v412-embedded');if(!st){st=d.createElement('style');st.id='nexa-v412-embedded';d.head.appendChild(st)}
  st.textContent=`html,body{background:transparent!important;min-height:0!important}.nebula-bg,.starfield,.admin-nav,.back{display:none!important}.lib-shell{width:100%!important;max-width:100%!important;margin:0!important;padding:2px 0 70px!important}.lib-head{margin-top:0!important}.lib-head .lib-kicker{display:none!important}.lib-head h1{font-size:28px!important}.lib-head>div>.lib-muted{font-size:11px!important}body>button[title="Library Guide"]{display:none!important}`;
  sizeLibraryFrame(frame);
  if(window.ResizeObserver&&!frame._nexa412RO){frame._nexa412RO=new ResizeObserver(()=>sizeLibraryFrame(frame));frame._nexa412RO.observe(d.documentElement);if(d.body)frame._nexa412RO.observe(d.body)}
  /* Inside the embedded Library, its own Close/Home navigation must never leave Administration. */
  d.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(/index\.html/i.test(href)){e.preventDefault();openAdminSection(/tab=([^&]+)/.exec(href)?.[1]||'alliances')}},true);
 }catch(_){ }
}

async function openLibraryEmbed(){
 libraryOpen=true;adminSection='library';await openAdminBase();
 hideAdminSections();
 $('#admin-context-tabs')?.classList.add('hidden');
 const wrap=$('#internal-module-frame-wrap'),frame=$('#internal-module-frame');if(!wrap||!frame)return;
 wrap.classList.remove('hidden');wrap.classList.add('nexa-v412-library');
 frame.onload=()=>{styleEmbeddedLibrary(frame);setTimeout(()=>styleEmbeddedLibrary(frame),250);setTimeout(()=>styleEmbeddedLibrary(frame),900)};
 if(!/library\.html/i.test(frame.src))frame.src='library.html?admin=1&embed=1';
 ensureAdminNav('library');$('#admin-modal .admin-modal-card')?.scrollTo({top:0,behavior:'auto'});
}

async function openAdminSection(target){
 if(target==='library')return openLibraryEmbed();
 libraryOpen=false;adminSection=target;await openAdminBase();
 const wrap=$('#internal-module-frame-wrap'),frame=$('#internal-module-frame');wrap?.classList.add('hidden');wrap?.classList.remove('nexa-v412-library');if(frame&&frame.src!=='about:blank')frame.src='about:blank';
 const tab=$(`[data-admin-tab="${target}"]`);if(tab){tab.click()}else{
  hideAdminSections();$('#admin-'+target)?.classList.remove('hidden');
 }
 ensureAdminNav(target);adminChrome();$('#admin-modal .admin-modal-card')?.scrollTo({top:0,behavior:'auto'});
}

function menuCleanup(){
 const menu=$('#nexa-home-menu');if(!menu)return;
 $$('button,a',menu).forEach(el=>{
  const t=txt(el).toUpperCase();
  if(['HOME','LIVE EVENT','TRANSFERS'].includes(t))el.classList.add('nexa-v412-menu-hide');
 });
 if(!$('#nexa-v412-report-bugs',menu)){
  const logout=$$('button,a',menu).find(x=>/^LOGOUT$/i.test(txt(x)));
  const b=document.createElement('button');b.id='nexa-v412-report-bugs';b.type='button';b.innerHTML='<span>Report Bugs</span><span>›</span>';
  b.onclick=()=>openAdminSection('system');
  if(logout)logout.before(b);else menu.appendChild(b);
 }
}

function interceptNavigation(e){
 const el=e.target.closest('button,a');if(!el)return;
 /* Profile Guide and Ministry: capture phase ensures V40 rerenders cannot break handlers. */
 if(el.matches('#nexa-v40-profile-actions .nexa-guide-general')){e.preventDefault();e.stopImmediatePropagation();profileGuide();return}
 if(el.matches('#nexa-v40-ministry')){e.preventDefault();e.stopImmediatePropagation();ministry();return}

 const menu=el.closest('#nexa-home-menu');
 if(menu){
  const t=txt(el).toUpperCase();
  const href=el.getAttribute('href')||'';
  if(/library\.html/i.test(href)||t==='LIBRARY'){e.preventDefault();e.stopImmediatePropagation();openLibraryEmbed();return}
  if(t==='ALLIANCES'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('alliances');return}
  if(t==='PERMISSIONS'||t==='NEXA ACCESS'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('permissions');return}
  if(t==='ROLES'||t==='OPERATIONAL ROLES'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('roles');return}
  if(t==='SYSTEM OPERATIONS'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('system');return}
 }

 if(el.matches('[data-admin-tab="library"]')){e.preventDefault();e.stopImmediatePropagation();openLibraryEmbed();return}
 if(el.matches('[data-admin-tab="alliances"],[data-admin-tab="permissions"],[data-admin-tab="roles"],[data-admin-tab="system"]')){
   adminSection=el.dataset.adminTab;libraryOpen=false;setTimeout(()=>ensureAdminNav(adminSection),0);
 }
}

async function approvePending(playerId,button){
 const c=sb();if(!c||!playerId)return;
 button.disabled=true;button.textContent='Approving…';
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in again.');
  const {data:me,error:meErr}=await c.from('player_accounts').select('alliance_id,alliance_role,is_main').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();
  if(meErr)throw meErr;if(!me?.alliance_id)throw new Error('No alliance linked.');
  if(!['R4','R5'].includes(String(me.alliance_role||'').toUpperCase()))throw new Error('R4/R5 approval required.');
  const {error}=await c.from('player_accounts').update({alliance_verified_at:new Date().toISOString()}).eq('player_id',String(playerId)).eq('alliance_id',me.alliance_id);
  if(error)throw error;
  button.textContent='Approved ✓';setTimeout(()=>{$('#nexa-v40-alliance-hub')?.remove();$('#nexa-v40-my-alliance')?.click()},450);
 }catch(err){button.disabled=false;button.textContent='Approve';overlay('nexa-v412-approve-error','Could not approve',String(err?.message||err),'#ffbf47')}
}

function allianceCleanup(){
 const hub=$('#nexa-v40-alliance-hub');if(!hub)return;
 /* Pending rows become cards with a real approval action. */
 const active=$('.nexa-v40-hub-tabs button.active',hub);if(!active||active.dataset.tab!=='pending')return;
 $$('.nexa-v40-member',hub).forEach(row=>{
  if(row.querySelector('.nexa-v412-pending-actions'))return;
  const m=txt(row).match(/ID\s*([0-9]+)/i);if(!m)return;
  const actions=document.createElement('div');actions.className='nexa-v412-pending-actions';actions.innerHTML=`<button type="button" class="nexa-v412-approve" data-player-id="${m[1]}">Approve</button>`;
  row.appendChild(actions);
 });
}

function patchGenerationDialog(doc=document){
 $$('dialog,.mode-dialog,section,div',doc).forEach(box=>{
  const t=txt(box);if(!/GEN\s*0\s*[•·-]\s*Unlocked/i.test(t)||!/Review only|generation becomes visible/i.test(t))return;
  const heading=$$('h1,h2,h3,strong,b',box).find(x=>/GEN\s*0/i.test(txt(x)));
  if(heading)heading.textContent='EPIC • Visibility';
  $$('p,div,strong,b',box).forEach(el=>{if(txt(el)==='The generation becomes visible to every player immediately.')el.textContent='Epic heroes are controlled separately from numbered generations.'});
 });
}

function periodic(){
 addCSS();removeDuplicateStellar();profileCleanup();menuCleanup();adminChrome();allianceCleanup();patchGenerationDialog();
 const f=$('#internal-module-frame');if(libraryOpen&&f?.contentDocument)styleEmbeddedLibrary(f);
}

/* Important: NO global MutationObserver. The previous V41 observer was contributing work during every DOM mutation. */
document.addEventListener('click',interceptNavigation,true);
document.addEventListener('click',e=>{const b=e.target.closest('.nexa-v412-approve');if(b){e.preventDefault();approvePending(b.dataset.playerId,b)}},true);

function observeAdminOnly(){
 const m=$('#admin-modal');if(!m||adminObserver)return;
 adminObserver=new MutationObserver(()=>requestAnimationFrame(adminChrome));
 adminObserver.observe(m,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-hidden']});
}

function boot(){
 addCSS();cleanURLAfterAdmin();closeResurrectedAdmin();periodic();observeAdminOnly();
 setTimeout(periodic,350);setTimeout(periodic,1100);setTimeout(periodic,2400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>{cleanURLAfterAdmin();setTimeout(()=>{closeResurrectedAdmin();periodic()},40)});
})();
