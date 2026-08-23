/* NEXA V42 — SINGLE OWNER CORE
   Replaces the runtime duties previously split between V40/V41.2.
   IMPORTANT: load this file INSTEAD OF nexa-v30-stabilization.js and nexa-v41-review-fixes.js.
   No schema migration. No troop-art integration. No Charms data mutation.
*/
(()=>{'use strict';
if(window.__NEXA_V42__) return;
window.__NEXA_V42__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let localSb=null;
let adminSection='alliances';
let libraryOpen=false;
let adminObserver=null,menuObserver=null,profileObserver=null;

function sb(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}

function addCSS(){
 if($('#nexa-v42-css'))return;
 const s=document.createElement('style');s.id='nexa-v42-css';s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important}
.nexa-v42-hidden{display:none!important}

/* ---------- HOME / STELLAR ---------- */
#nexa-v42-stellar{width:100%!important;margin:0!important;padding:5px 10px 8px!important;text-align:center!important;background:transparent!important;border:0!important;box-shadow:none!important}
#nexa-v42-stellar .k{display:inline-flex;align-items:center;gap:7px;color:#c8b8ff;font-size:9px;font-weight:950;letter-spacing:.18em;text-shadow:0 0 13px rgba(180,156,255,.62)}
#nexa-v42-stellar .c{display:block;margin-top:3px;color:#d7d1ea;font-size:10px;line-height:1.25}
#nexa-v42-stellar .star{animation:nexa42twinkle 2.1s ease-in-out infinite}@keyframes nexa42twinkle{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.16)}}

/* ---------- PROFILE ---------- */
#nexa-profile-modal{overflow:hidden!important;padding:6px!important}
#nexa-profile-modal .nexa-profile-sheet{width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important}
#nexa-profile-modal .nexa-profile-hero,#nexa-profile-modal .nexa-profile-content,#nexa-profile-modal form,#nexa-profile-modal fieldset,#nexa-profile-modal [class*="panel" i],#nexa-profile-modal [class*="detail" i],#nexa-profile-modal [class*="editor" i]{max-width:100%!important;min-width:0!important}
#nexa-profile-modal input,#nexa-profile-modal select,#nexa-profile-modal textarea{max-width:100%!important;min-width:0!important}
#nexa-profile-modal .nexa-profile-stats>*:nth-child(3) small,#nexa-profile-modal .nexa-profile-stats>*:nth-child(3) [class*="label" i]{white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;font-size:clamp(7px,1.8vw,10px)!important;letter-spacing:.10em!important}
#nexa-profile-modal .nexa-profile-tabs,#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:none!important;scroll-behavior:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;touch-action:pan-x!important;scrollbar-width:none!important;padding-right:42px!important}
#nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,#nexa-profile-modal [class*="generation" i]::-webkit-scrollbar,#nexa-profile-modal [class*="gen-tabs" i]::-webkit-scrollbar,#nexa-profile-modal [class*="gen-row" i]::-webkit-scrollbar,#nexa-profile-modal [class*="filter-row" i]::-webkit-scrollbar{display:none!important}
#nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;min-width:82px!important;padding-inline:10px!important;white-space:nowrap!important}
#nexa-profile-modal [class*="generation" i]>*,#nexa-profile-modal [class*="gen-tabs" i]>*,#nexa-profile-modal [class*="gen-row" i]>*,#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}
#nexa-v42-profile-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;margin:10px 0 3px!important}
.nexa-v42-guide-general,.nexa-v42-guide-context{display:inline-grid!important;place-items:center!important;width:36px!important;height:36px!important;min-width:36px!important;border-radius:50%!important;background:#0d1129!important;font-weight:950!important}
.nexa-v42-guide-general{color:#ff4fd8!important;border:1px solid #ff4fd8!important;box-shadow:0 0 16px rgba(255,79,216,.18)!important}
.nexa-v42-guide-context{color:#ffbf47!important;border:1px solid #ffbf47!important;box-shadow:0 0 16px rgba(255,191,71,.14)!important}
#nexa-v42-ministry{width:36px!important;height:36px!important;border-radius:50%!important;border:1px solid rgba(197,182,255,.56)!important;background:#10142d!important;color:#d9ccff!important;font-size:17px!important}
.nexa-v42-item-tools{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;margin:7px 0 2px!important}
.nexa-v42-reset{min-height:32px!important;padding:6px 12px!important;border-radius:999px!important;border:1px solid rgba(131,107,255,.55)!important;background:#10152f!important;color:#f2efff!important;font-size:10px!important;font-weight:900!important}
#nexa-profile-modal [class*="owned" i],#nexa-profile-modal .nexa-v40-item-tools{display:none!important}

/* ---------- HOME MENU ---------- */
#nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px)!important}
#nexa-v42-my-alliance{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;width:100%!important;min-height:76px!important;padding:14px 20px!important;border:0!important;border-bottom:1px solid rgba(213,91,255,.14)!important;background:radial-gradient(circle at 12% 0%,rgba(226,64,255,.16),transparent 42%),linear-gradient(90deg,rgba(70,26,111,.34),rgba(14,20,55,.18))!important;color:#fff!important;text-align:left!important;font:inherit!important;font-size:19px!important;font-weight:950!important;text-shadow:0 0 18px rgba(235,79,255,.30)!important}
#nexa-v42-my-alliance small{margin-top:4px;font-size:12px!important;color:#f09cff!important;letter-spacing:.08em!important}
#nexa-v42-report-bugs{display:flex!important;width:100%!important;align-items:center!important;justify-content:space-between!important;min-height:54px!important;padding:10px 20px!important;border:0!important;background:transparent!important;color:#f1ecff!important;font:inherit!important;font-weight:850!important;text-align:left!important}
#nexa-v42-report-bugs span:last-child{color:#6fdcff!important}

/* ---------- ADMINISTRATION ---------- */
#admin-modal.open{overflow:hidden!important}
#admin-modal .admin-modal-card{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border:0!important;border-radius:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding:calc(10px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 12% 9%,rgba(77,104,255,.16),transparent 30%),radial-gradient(circle at 88% 24%,rgba(212,68,255,.12),transparent 30%),radial-gradient(circle at 48% 82%,rgba(46,201,255,.07),transparent 34%),linear-gradient(165deg,#080d25,#030611 76%)!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important}
#admin-modal .admin-modal-card:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.09;background-image:radial-gradient(circle,rgba(255,255,255,.8) 0 1px,transparent 1.4px),radial-gradient(circle,rgba(101,184,255,.75) 0 1px,transparent 1.4px);background-size:49px 49px,83px 83px;background-position:7px 13px,29px 31px}
#admin-modal .admin-modal-card>*{position:relative;z-index:1;max-width:720px!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;min-width:0!important}
#admin-modal [data-close-admin]:not(.modal-backdrop){position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:14px!important;z-index:2147483200!important;width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid rgba(255,72,173,.62)!important;background:rgba(33,7,38,.90)!important;color:transparent!important;font-size:0!important;box-shadow:0 0 20px rgba(255,62,173,.16)!important}
#admin-modal [data-close-admin]:not(.modal-backdrop):after{content:"×"!important;color:#ff8fc8!important;font-size:28px!important;line-height:1!important;font-weight:900!important}
#admin-modal .modal-backdrop[data-close-admin]{display:none!important}
#admin-modal .modal-head{min-height:50px!important;padding:0 54px 4px 0!important}
#admin-modal .modal-head>div{display:none!important}
#admin-modal #admin-context-tabs,#admin-modal.module-view #nexa-module-shell-head{display:none!important}
#nexa-v42-admin-guide{margin:1px 0 3px!important}
#nexa-v42-admin-nav{display:grid!important;grid-template-columns:48px 1fr 48px!important;align-items:center!important;gap:10px!important;margin:0 auto 8px!important;padding:0!important;max-width:680px!important}
#nexa-v42-admin-nav button{width:44px!important;height:38px!important;border-radius:999px!important;border:1px solid rgba(117,104,255,.54)!important;background:linear-gradient(145deg,rgba(30,26,72,.95),rgba(7,13,36,.98))!important;color:#dce3ff!important;font-size:20px!important;font-weight:900!important}
#nexa-v42-admin-nav button:disabled{opacity:.18!important}
#nexa-v42-admin-nav b{text-align:center!important;color:#fff!important;font-size:18px!important}
#admin-modal #svs-admin-content{padding-top:0!important}
#admin-modal #admin-alliances,#admin-modal #admin-roles,#admin-modal #admin-permissions,#admin-modal #admin-system,#admin-modal #admin-library{margin-top:0!important;padding-top:0!important;max-width:680px!important}
#admin-modal #internal-module-frame-wrap.nexa-v42-library{display:block!important;width:100%!important;max-width:680px!important;margin:0 auto!important;overflow:visible!important}
#admin-modal #internal-module-frame-wrap.nexa-v42-library #internal-module-frame{display:block!important;width:100%!important;height:1100px;min-height:900px!important;border:0!important;background:transparent!important;overflow:hidden!important}

/* ---------- MY ALLIANCE ---------- */
#nexa-v42-alliance-hub{position:fixed!important;inset:0!important;z-index:2147483400!important;color:#f5f3ff!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding:calc(12px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 16% 10%,rgba(86,102,255,.20),transparent 31%),radial-gradient(circle at 85% 18%,rgba(231,62,255,.15),transparent 29%),radial-gradient(circle at 48% 72%,rgba(35,204,255,.09),transparent 36%),linear-gradient(165deg,#080d25,#030611 76%)!important}
#nexa-v42-alliance-hub:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.15;background-image:radial-gradient(circle,rgba(255,255,255,.9) 0 1px,transparent 1.5px),radial-gradient(circle,rgba(91,196,255,.8) 0 1px,transparent 1.5px);background-size:51px 51px,91px 91px;background-position:8px 14px,33px 26px}
#nexa-v42-alliance-hub>*{position:relative;z-index:1}
.nexa-v42-hub-head{display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:8px;max-width:680px;margin:0 auto 10px}
.nexa-v42-hub-head h2{margin:0;text-align:center;font-size:18px}.nexa-v42-hub-close{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,72,173,.58);background:rgba(33,7,38,.9);color:#ff8fc8;font-size:27px;font-weight:900}.nexa-v42-hub-guide{width:36px;height:36px;border-radius:50%;border:1px solid #ff4fd8;background:#0d1129;color:#ff4fd8;font-weight:950}
.nexa-v42-passport{max-width:520px;margin:0 auto;padding:18px 12px;text-align:center;border:1px solid rgba(132,105,255,.24);border-radius:26px;background:linear-gradient(145deg,rgba(15,22,54,.72),rgba(6,10,28,.48));box-shadow:0 0 32px rgba(94,75,255,.08)}
.nexa-v42-emblem{width:112px;height:112px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(196,178,255,.36);background:radial-gradient(circle,#171d45,#070a1c);box-shadow:0 0 32px rgba(148,100,255,.22),inset 0 0 24px rgba(78,168,255,.08);font-size:25px}.nexa-v42-emblem img{width:100%;height:100%;object-fit:contain}
.nexa-v42-passport h1{margin:0;font-size:32px}.nexa-v42-passport p{margin:5px 0 0;color:#aaa9c2;font-size:12px}.nexa-v42-stats{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:10px}.nexa-v42-stat{border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:7px 11px;background:rgba(10,15,36,.68);font-size:11px;font-weight:850}
.nexa-v42-tabs{display:flex;gap:8px;max-width:680px;margin:12px auto 0;padding:6px 2px 12px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.nexa-v42-tabs::-webkit-scrollbar{display:none}.nexa-v42-tabs button{flex:0 0 auto;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 14px;background:#11152b;color:#eee;font-weight:850}.nexa-v42-tabs button.active{border-color:#b28aff;background:rgba(113,65,213,.26)}
#nexa-v42-hub-body{max-width:680px;margin:0 auto}.nexa-v42-member{margin:10px 0;padding:14px;border:1px solid rgba(114,98,255,.24);border-radius:17px;background:linear-gradient(145deg,rgba(14,20,48,.80),rgba(6,10,27,.88));box-shadow:0 0 20px rgba(82,73,255,.06)}.nexa-v42-member b{display:block;font-size:17px}.nexa-v42-member small{display:block;color:#9ca6c7;margin-top:4px}.nexa-v42-member-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.nexa-v42-pending-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:11px}.nexa-v42-approve{border:1px solid rgba(73,220,179,.55);border-radius:999px;background:rgba(18,79,65,.32);color:#8ff2d4;padding:8px 13px;font-weight:900}.nexa-v42-empty{padding:30px 16px;text-align:center;border:1px dashed rgba(255,255,255,.15);border-radius:18px;color:#9ba1be}
@media(max-width:700px){#admin-modal .admin-modal-card{padding-left:12px!important;padding-right:12px!important}#nexa-v42-admin-nav{grid-template-columns:44px minmax(0,1fr) 44px!important}#nexa-profile-modal .nexa-profile-tab{min-width:78px!important}}
`;
 document.head.appendChild(s);
}

function overlay(id,title,body,accent='#ff4fd8'){
 $('#'+id)?.remove();
 const d=document.createElement('div');d.id=id;d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);display:grid;place-items:center;padding:16px';
 d.innerHTML=`<section style="width:min(520px,100%);max-height:82dvh;overflow:auto;border:1px solid ${accent};border-radius:22px;padding:20px;background:radial-gradient(circle at 10% 0%,rgba(109,74,255,.18),transparent 35%),linear-gradient(155deg,#0b1028,#050713);color:#fff;box-shadow:0 25px 70px rgba(0,0,0,.58)"><div style="font-size:10px;letter-spacing:.16em;color:${accent};font-weight:950">GUIDE</div><h2 style="margin:6px 0 9px">${title}</h2><div style="color:#c4c7db;line-height:1.5;font-size:13px">${body}</div><button type="button" style="width:100%;margin-top:16px;padding:10px;border-radius:999px;border:1px solid ${accent};background:#11152f;color:#fff;font-weight:900">Close</button></section>`;
 d.addEventListener('click',e=>{if(e.target===d)d.remove()});d.querySelector('button').onclick=()=>d.remove();document.body.appendChild(d);
}

function ensureStellar(){
 const main=$('main.shell'),profile=$('#nexa-profile-launcher-section');if(!main||!profile)return;
 /* Delete every previous Stellar implementation so only V42 owns it. */
 $$('section,div,article').forEach(el=>{if(el.id==='nexa-v42-stellar')return;const t=text(el);if(/STELLAR SIGNAL/i.test(t)&&(el.id?.includes('stellar')||/Chart the course|Small course corrections|Adjust with the stars|Move together/i.test(t)))el.remove()});
 let st=$('#nexa-v42-stellar');if(!st){st=document.createElement('section');st.id='nexa-v42-stellar';st.innerHTML='<div class="k"><span class="star">✦</span> STELLAR SIGNAL <span class="star">✦</span></div><span class="c">Small course corrections can change the path of an entire orbit.</span>'}
 const live=$('#home-svs-section');if(live)main.insertBefore(st,live);else profile.after(st);
}

function profileGuide(){overlay('nexa-v42-profile-guide','Player Profile','Maintain the selected account here. Update identity, Furnace, Power and Deployment, then use the horizontal rails for Heroes, Experts, Troops, Pets, Chief Gear and Charms. Gold Guide buttons explain one item.','#ff4fd8')}
function ministry(){overlay('nexa-v42-ministry-guide','Ministry Schedule','Your Ministry appointments and live status appear here when schedule data is available. This shortcut stays attached to the active account profile.','#bca7ff')}
function resetCard(card){$$('input,select,textarea',card).forEach(el=>{if(el.type==='checkbox'||el.type==='radio')el.checked=false;else if(el.tagName==='SELECT')el.selectedIndex=0;else if(el.type==='number')el.value=el.min||'0';else if(el.type!=='file')el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))})}
function isItemCard(el){return el?.matches?.('.nexa-lib-card,[class*="hero-card" i],[class*="hero-item" i],[class*="expert-card" i],[class*="expert-item" i],[class*="pet-card" i],[class*="pet-item" i],[class*="troop-card" i],[class*="gear-card" i],[class*="charm-card" i]')}
function ensureProfile(){
 const root=$('#nexa-profile-modal');if(!root)return;
 /* remove obsolete V40 rows only; V42 rows are stable and do not get recreated */
 $$('.nexa-v40-item-tools',root).forEach(x=>x.remove());
 const stats=$('.nexa-profile-stats',root);if(stats&&!$('#nexa-v42-profile-actions',root)){
   const row=document.createElement('div');row.id='nexa-v42-profile-actions';row.innerHTML='<button type="button" class="nexa-v42-guide-general" aria-label="Profile Guide">ⓘ</button><button id="nexa-v42-ministry" type="button" aria-label="Ministry Schedule">♜</button>';
   row.querySelector('.nexa-v42-guide-general').onclick=profileGuide;row.querySelector('#nexa-v42-ministry').onclick=ministry;stats.after(row);
 }
 const cards=$$('.nexa-lib-card,[class*="hero-card" i],[class*="hero-item" i],[class*="expert-card" i],[class*="expert-item" i],[class*="pet-card" i],[class*="pet-item" i],[class*="troop-card" i],[class*="gear-card" i],[class*="charm-card" i]',root).filter(isItemCard);
 cards.forEach(card=>{
   const existing=$$('.nexa-v42-item-tools',card);existing.slice(1).forEach(x=>x.remove());if(existing[0])return;
   const tools=document.createElement('div');tools.className='nexa-v42-item-tools';tools.innerHTML='<button type="button" class="nexa-v42-reset">Reset</button><button type="button" class="nexa-v42-guide-context">ⓘ</button>';
   tools.querySelector('.nexa-v42-reset').onclick=e=>{e.stopPropagation();resetCard(card)};
   tools.querySelector('.nexa-v42-guide-context').onclick=e=>{e.stopPropagation();overlay('nexa-v42-item-guide','This Item','Set the progression that matches this account. Reset clears only this item so you can enter it again.','#ffbf47')};
   card.appendChild(tools);
 });
 /* remove any reset/guide row left outside a real card */
 $$('.nexa-v42-item-tools',root).forEach(t=>{if(!isItemCard(t.parentElement))t.remove()});
}

function cleanAdminURL(){
 const u=new URL(location.href);let changed=false;['admin','tab'].forEach(k=>{if(u.searchParams.has(k)){u.searchParams.delete(k);changed=true}});if(changed)history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?('?'+u.searchParams.toString()):'')+u.hash)
}
function closeResurrectedAdmin(){
 const nav=performance.getEntriesByType?.('navigation')?.[0];if(!['reload','back_forward'].includes(nav?.type))return;const m=$('#admin-modal');if(m?.classList.contains('open')){m.classList.remove('open','module-view');m.setAttribute('aria-hidden','true')}cleanAdminURL();
}

const ADMIN_ORDER=['alliances','library','permissions','roles','system'];
const ADMIN_LABEL={alliances:'Alliances',library:'Library',permissions:'NEXA Access',roles:'Operational Roles',system:'System Operations'};
function ensureAdminNav(target=adminSection){
 const modal=$('#admin-modal'),content=$('#svs-admin-content');if(!modal||!content)return;
 let nav=$('#nexa-v42-admin-nav');if(!nav){nav=document.createElement('nav');nav.id='nexa-v42-admin-nav';nav.innerHTML='<button type="button" data-dir="-1">‹</button><b></b><button type="button" data-dir="1">›</button>';content.prepend(nav)}
 adminSection=target;const i=ADMIN_ORDER.indexOf(target);const label=ADMIN_LABEL[target]||'Administration';if(text($('b',nav))!==label)$('b',nav).textContent=label;const bs=$$('button',nav);bs[0].disabled=i<=0;bs[1].disabled=i<0||i>=ADMIN_ORDER.length-1;bs.forEach(b=>b.onclick=()=>{const ni=i+Number(b.dataset.dir||0);if(ni>=0&&ni<ADMIN_ORDER.length)openAdminSection(ADMIN_ORDER[ni])});
}
function adminChrome(){
 const modal=$('#admin-modal');if(!modal)return;
 $$('button,a,div,span',modal).forEach(el=>{const t=text(el).toUpperCase();if(t==='MENU')el.classList.add('nexa-v42-hidden');if(t==='CLOSE'&&!el.matches('[data-close-admin]')&&!el.closest('[data-close-admin]'))el.classList.add('nexa-v42-hidden')});
 const card=$('.admin-modal-card',modal);if(card&&!$('#nexa-v42-admin-guide',card)){const g=document.createElement('button');g.id='nexa-v42-admin-guide';g.className='nexa-v42-guide-general';g.type='button';g.textContent='ⓘ';g.onclick=()=>overlay('nexa-v42-admin-help','Administration','Use the arrows to move between Alliances, Library, NEXA Access, Operational Roles and System Operations.','#ff4fd8');card.prepend(g)}
 if(modal.classList.contains('open'))ensureAdminNav(libraryOpen?'library':adminSection);
}
function waitFor(fn,timeout=2200){return new Promise(resolve=>{const t0=Date.now();const tick=()=>{const v=fn();if(v)return resolve(v);if(Date.now()-t0>timeout)return resolve(null);setTimeout(tick,45)};tick()})}
async function openAdminBase(){
 const modal=$('#admin-modal');if(!modal)return null;modal.classList.add('open');modal.setAttribute('aria-hidden','false');
 const chooser=$('#admin-module-chooser'),content=$('#svs-admin-content');if(chooser&&content){chooser.classList.add('hidden');content.classList.remove('hidden')}
 const open=await waitFor(()=>$('#open-administration'),500);if(open&&content?.classList.contains('hidden'))open.click();
 cleanAdminURL();adminChrome();return modal;
}
function hideAdminSections(){['admin-events','admin-forms','admin-alliances','admin-roles','admin-permissions','admin-library','admin-system','admin-announcements'].forEach(id=>$('#'+id)?.classList.add('hidden'));$('#native-module-host')?.classList.add('hidden')}
function sizeLibraryFrame(frame){try{const d=frame.contentDocument;if(!d)return;const h=Math.max(d.documentElement?.scrollHeight||0,d.body?.scrollHeight||0,900);frame.style.height=Math.min(Math.max(h+12,900),5200)+'px'}catch(_){}}
function patchLibraryDoc(d){
 if(!d)return;let st=d.getElementById('nexa-v42-embedded');if(!st){st=d.createElement('style');st.id='nexa-v42-embedded';d.head.appendChild(st)}
 st.textContent='html,body{background:transparent!important;min-height:0!important}.nebula-bg,.starfield,.admin-nav,.back{display:none!important}.lib-shell{width:100%!important;max-width:100%!important;margin:0!important;padding:2px 0 70px!important}.lib-head{margin-top:0!important}.lib-head .lib-kicker{display:none!important}.lib-head h1{font-size:28px!important}.lib-head>div>.lib-muted{font-size:11px!important}body>button[title="Library Guide"]{display:none!important}';
 $$('button,div,h1,h2,h3,strong,b',d).forEach(el=>{const t=text(el);if(/^Gen 0\s*[•·-]\s*Unlocked$/i.test(t))el.textContent='Epic • Unlocked';if(/HERO\s*[•·-]\s*GEN 0 VISIBILITY/i.test(t))el.textContent='HERO • EPIC VISIBILITY'});
 sizeLibraryFrame($('#internal-module-frame'));
}
function styleEmbeddedLibrary(frame){try{const d=frame.contentDocument;if(!d)return;patchLibraryDoc(d);if(window.ResizeObserver&&!frame._nexa42RO){frame._nexa42RO=new ResizeObserver(()=>sizeLibraryFrame(frame));frame._nexa42RO.observe(d.documentElement);if(d.body)frame._nexa42RO.observe(d.body)}if(!frame._nexa42Click){frame._nexa42Click=1;d.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(/index\.html/i.test(href)){e.preventDefault();openAdminSection(/tab=([^&]+)/.exec(href)?.[1]||'alliances')}},true)}}catch(_){}}
async function openLibraryEmbed(){
 libraryOpen=true;adminSection='library';await openAdminBase();hideAdminSections();$('#admin-context-tabs')?.classList.add('hidden');
 const wrap=$('#internal-module-frame-wrap'),frame=$('#internal-module-frame');if(!wrap||!frame)return;wrap.classList.remove('hidden');wrap.classList.add('nexa-v42-library');frame.onload=()=>{styleEmbeddedLibrary(frame);setTimeout(()=>styleEmbeddedLibrary(frame),250)};frame.src='library.html?admin=1&embed=1&v=42';ensureAdminNav('library');$('.admin-modal-card',$('#admin-modal'))?.scrollTo({top:0,behavior:'auto'});
}
async function openAdminSection(target){
 if(target==='library')return openLibraryEmbed();libraryOpen=false;adminSection=target;await openAdminBase();const wrap=$('#internal-module-frame-wrap'),frame=$('#internal-module-frame');wrap?.classList.add('hidden');wrap?.classList.remove('nexa-v42-library');if(frame)frame.src='about:blank';
 hideAdminSections();const sec=$('#admin-'+target);sec?.classList.remove('hidden');$$('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===target));
 if(target==='permissions')$('[data-admin-tab="permissions"]')?.click();if(target==='system')$('[data-admin-tab="system"]')?.click();
 ensureAdminNav(target);adminChrome();$('.admin-modal-card',$('#admin-modal'))?.scrollTo({top:0,behavior:'auto'});
}

async function allianceContext(){
 const c=sb();if(!c)return null;const {data:{user}}=await c.auth.getUser();if(!user)return null;
 const {data:acct,error}=await c.from('player_accounts').select('*').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();if(error||!acct)return null;
 let alliance=null,members=[];if(acct.alliance_id){const a=await c.from('alliances').select('*').eq('id',acct.alliance_id).maybeSingle();alliance=a.data||null;const m=await c.from('player_accounts').select('*').eq('alliance_id',acct.alliance_id).order('in_game_name');members=m.data||[]}
 return {c,user,acct,alliance,members};
}
function emblemUrl(a){return a?.emblem_url||a?.logo_url||a?.image_url||a?.emblem||''}
function renderAllianceTab(type,ctx){
 const body=$('#nexa-v42-hub-body');if(!body)return;$$('.nexa-v42-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===type));const members=ctx?.members||[];
 if(type==='members'){const rows=members.filter(x=>x.alliance_verified_at);body.innerHTML=rows.length?rows.map(m=>`<div class="nexa-v42-member"><div class="nexa-v42-member-top"><div><b>${esc(m.in_game_name||'Player')}</b><small>ID ${esc(m.player_id||'—')} • ${esc(m.alliance_role||'Member')}</small></div><span>${m.is_main?'MAIN':''}</span></div></div>`).join(''):'<div class="nexa-v42-empty">No verified members found.</div>';return}
 if(type==='pending'){const rows=members.filter(x=>!x.alliance_verified_at);body.innerHTML=rows.length?rows.map(m=>`<div class="nexa-v42-member"><div class="nexa-v42-member-top"><div><b>${esc(m.in_game_name||'Player')}</b><small>ID ${esc(m.player_id||'—')} • Waiting for Approval</small></div><span>Pending</span></div><div class="nexa-v42-pending-actions"><button type="button" class="nexa-v42-approve" data-player-id="${esc(m.player_id||'')}">Approve</button></div></div>`).join(''):'<div class="nexa-v42-empty">No pending members right now.</div>';return}
 if(type==='pulse')body.innerHTML='<div class="nexa-v42-empty">Active alliance NEXA Pulse requests and response progress will appear here when published.</div>';
 else if(type==='history')body.innerHTML='<div class="nexa-v42-empty">Closed NEXA Pulse history will appear here.</div>';
 else body.innerHTML='<div class="nexa-v42-empty">Foundry, Canyon and alliance strategy events will appear here when leadership publishes them.</div>';
}
async function openAllianceHub(){
 $('#nexa-v42-alliance-hub')?.remove();const hub=document.createElement('section');hub.id='nexa-v42-alliance-hub';hub.innerHTML='<div class="nexa-v42-hub-head"><button class="nexa-v42-hub-guide" type="button">ⓘ</button><h2>My Alliance</h2><button class="nexa-v42-hub-close" type="button">×</button></div><div class="nexa-v42-passport"><div class="nexa-v42-emblem">✦</div><h1>Loading…</h1><p>Alliance Passport</p><div class="nexa-v42-stats"></div></div><nav class="nexa-v42-tabs"><button data-tab="members" class="active">Members</button><button data-tab="pending">Pending Members</button><button data-tab="pulse">NEXA Pulse</button><button data-tab="history">Pulse History</button><button data-tab="events">Alliance Events</button></nav><div id="nexa-v42-hub-body"><div class="nexa-v42-empty">Loading alliance…</div></div>';
 document.body.appendChild(hub);hub.querySelector('.nexa-v42-hub-close').onclick=()=>hub.remove();hub.querySelector('.nexa-v42-hub-guide').onclick=()=>overlay('nexa-v42-alliance-guide','My Alliance','Your alliance passport, verified members, pending approvals, NEXA Pulse and alliance events live here.','#ff4fd8');
 const ctx=await allianceContext();if(!ctx){hub.querySelector('.nexa-v42-passport h1').textContent='No Alliance';hub.querySelector('#nexa-v42-hub-body').innerHTML='<div class="nexa-v42-empty">No alliance is linked to this account.</div>';return}
 const tag=ctx.alliance?.tag||ctx.alliance?.name||'Alliance';hub.querySelector('.nexa-v42-passport h1').textContent=tag;const em=emblemUrl(ctx.alliance);if(em)hub.querySelector('.nexa-v42-emblem').innerHTML=`<img src="${esc(em)}" alt="${esc(tag)} emblem">`;
 const verified=ctx.members.filter(x=>x.alliance_verified_at).length,pending=ctx.members.filter(x=>!x.alliance_verified_at).length;hub.querySelector('.nexa-v42-stats').innerHTML=`<span class="nexa-v42-stat">${verified} Members</span><span class="nexa-v42-stat">${pending} Pending</span><span class="nexa-v42-stat">${ctx.alliance?.is_active===false?'INACTIVE':'ACTIVE'}</span>`;
 $$('.nexa-v42-tabs button',hub).forEach(b=>b.onclick=()=>renderAllianceTab(b.dataset.tab,ctx));renderAllianceTab('members',ctx);
}
async function approvePending(playerId,button){
 const c=sb();if(!c||!playerId)return;button.disabled=true;button.textContent='Approving…';try{const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in again.');const {data:me,error:meErr}=await c.from('player_accounts').select('alliance_id,alliance_role,is_main').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();if(meErr)throw meErr;if(!me?.alliance_id)throw new Error('No alliance linked.');if(!['R4','R5'].includes(String(me.alliance_role||'').toUpperCase()))throw new Error('R4/R5 approval required.');const {error}=await c.from('player_accounts').update({alliance_verified_at:new Date().toISOString()}).eq('player_id',String(playerId)).eq('alliance_id',me.alliance_id);if(error)throw error;button.textContent='Approved ✓';setTimeout(openAllianceHub,400)}catch(err){button.disabled=false;button.textContent='Approve';overlay('nexa-v42-approve-error','Could not approve',esc(err?.message||err),'#ffbf47')}
}

async function currentAllianceTag(){try{const ctx=await allianceContext();return ctx?.alliance?.tag||ctx?.alliance?.name||ctx?.acct?.alliance_tag||''}catch(_){return ''}}
async function ensureMenu(){
 const menu=$('#nexa-home-menu'),card=$('#nexa-home-menu-card')||menu;if(!menu||!card)return;
 /* remove obsolete navigation rows instead of letting them remain active */
 $$('button,a',card).forEach(el=>{const t=text(el).toUpperCase();if(['HOME','LIVE EVENT','TRANSFERS'].includes(t))el.remove()});
 let mine=$('#nexa-v42-my-alliance',card);if(!mine){mine=document.createElement('button');mine.id='nexa-v42-my-alliance';mine.type='button';mine.innerHTML='<span>My Alliance</span><small>Loading…</small>';mine.onclick=()=>{menu.setAttribute('aria-hidden','true');openAllianceHub()};card.prepend(mine);const tag=await currentAllianceTag();mine.querySelector('small').textContent=tag||'Alliance'}
 if(!$('#nexa-v42-report-bugs',card)){const logout=$$('button,a',card).find(x=>/^LOGOUT$/i.test(text(x)));const b=document.createElement('button');b.id='nexa-v42-report-bugs';b.type='button';b.innerHTML='<span>Report Bugs</span><span>›</span>';b.onclick=()=>openAdminSection('system');if(logout)logout.before(b);else card.appendChild(b)}
}

function intercept(e){
 const el=e.target.closest('button,a');if(!el)return;
 if(el.matches('.nexa-v42-approve')){e.preventDefault();approvePending(el.dataset.playerId,el);return}
 const menu=el.closest('#nexa-home-menu');if(menu){const t=text(el).toUpperCase(),href=el.getAttribute('href')||'';if(/library\.html/i.test(href)||t==='LIBRARY'){e.preventDefault();e.stopImmediatePropagation();openLibraryEmbed();return}if(t==='ALLIANCES'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('alliances');return}if(t==='PERMISSIONS'||t==='NEXA ACCESS'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('permissions');return}if(t==='ROLES'||t==='OPERATIONAL ROLES'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('roles');return}if(t==='SYSTEM OPERATIONS'){e.preventDefault();e.stopImmediatePropagation();openAdminSection('system');return}}
 if(el.matches('[data-admin-tab="library"]')){e.preventDefault();e.stopImmediatePropagation();openLibraryEmbed();return}
 if(el.matches('[data-admin-tab="alliances"],[data-admin-tab="permissions"],[data-admin-tab="roles"],[data-admin-tab="system"]')){adminSection=el.dataset.adminTab;libraryOpen=false;setTimeout(()=>ensureAdminNav(adminSection),0)}
}

function observeTargets(){
 const menu=$('#nexa-home-menu-card')||$('#nexa-home-menu');if(menu&&!menuObserver){menuObserver=new MutationObserver(()=>requestAnimationFrame(ensureMenu));menuObserver.observe(menu,{childList:true,subtree:true})}
 const profile=$('#nexa-profile-modal');if(profile&&!profileObserver){profileObserver=new MutationObserver(()=>requestAnimationFrame(ensureProfile));profileObserver.observe(profile,{childList:true,subtree:true})}
 const admin=$('#admin-modal');if(admin&&!adminObserver){adminObserver=new MutationObserver(()=>requestAnimationFrame(adminChrome));adminObserver.observe(admin,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-hidden']})}
}

function boot(){
 addCSS();cleanAdminURL();closeResurrectedAdmin();ensureStellar();ensureProfile();ensureMenu();adminChrome();observeTargets();
 setTimeout(()=>{ensureStellar();ensureProfile();ensureMenu();adminChrome();observeTargets()},400);
 setTimeout(()=>{ensureStellar();ensureProfile();ensureMenu();adminChrome()},1400);
}
document.addEventListener('click',intercept,true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>{cleanAdminURL();closeResurrectedAdmin();setTimeout(boot,40)});
})();
