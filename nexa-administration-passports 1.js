/* NEXA Administration V23.1 — emergency boot stability hotfix
   Scope: stop global MutationObserver feedback loops that could stall mobile browsers.
   This file intentionally avoids touching Library/Chief Gear/Charms data or Supabase writes. */
(()=>{
'use strict';
if(window.__NEXA_ADMIN_V231__) return;
window.__NEXA_ADMIN_V231__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const TABS=[
  {key:'alliances',letter:'A',label:'Alliances',id:'admin-alliances'},
  {key:'library',letter:'L',label:'Library',id:'admin-library'},
  {key:'roles',letter:'R',label:'Roles',id:'admin-roles'},
  {key:'module',letter:'M',label:'Module Access',id:'admin-permissions'},
  {key:'system',letter:'S',label:'System Operations',id:'admin-system'}
];
let current='alliances';
let profileObserver=null;
let profileTuneRAF=0;

function addStyles(){
 if($('#nexa-v231-style')) return;
 const s=document.createElement('style');
 s.id='nexa-v231-style';
 s.textContent=`
 .nexa-v231-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;margin:0 0 14px}
 .nexa-v231-nav .prev{justify-self:start}.nexa-v231-nav .next{justify-self:end}
 .nexa-v231-jump{appearance:none;border:1px solid rgba(139,92,246,.55);background:rgba(12,16,40,.86);color:#fff;border-radius:999px;padding:8px 11px;font:inherit;font-weight:800;cursor:pointer;min-width:48px}
 .nexa-v231-title{display:flex;align-items:center;justify-content:center;gap:8px;font-weight:900}
 .nexa-v231-info{appearance:none;border:1px solid rgba(64,210,255,.55);background:rgba(9,21,48,.9);color:#7de8ff;border-radius:50%;width:31px;height:31px;display:inline-grid;place-items:center;font-weight:950;cursor:pointer}
 .nexa-v231-hidden{display:none!important}
 #nexa-profile-modal img[data-nexa-v231-troop]{object-fit:contain!important;object-position:center!important;box-sizing:border-box!important;transform:none!important}
 `;
 document.head.appendChild(s);
}
function adminOpen(){
 const m=$('#admin-modal');
 return !!(m && (m.classList.contains('open') || m.getAttribute('aria-hidden')==='false'));
}
function sections(){return TABS.map(t=>({t,el:document.getElementById(t.id)})).filter(x=>x.el)}
function keyForButton(b){
 const raw=String(b?.dataset?.adminTab||b?.textContent||'').trim().toLowerCase();
 if(raw==='permissions'||raw==='module access'||raw==='module') return 'module';
 const hit=TABS.find(t=>raw===t.key||raw===t.label.toLowerCase());
 return hit?.key||null;
}
function navHTML(key){
 const i=TABS.findIndex(t=>t.key===key),t=TABS[i],p=TABS[i-1],n=TABS[i+1];
 return `<div class="nexa-v231-nav">${p?`<button type="button" class="nexa-v231-jump prev" data-v231-go="${p.key}" title="${p.label}">‹ ${p.letter}</button>`:'<span></span>'}<div class="nexa-v231-title"><span>${t.label}</span><button type="button" class="nexa-v231-info" data-v231-guide="${key}" title="${t.label} guide">ⓘ</button></div>${n?`<button type="button" class="nexa-v231-jump next" data-v231-go="${n.key}" title="${n.label}">${n.letter} ›</button>`:'<span></span>'}</div>`;
}
function ensureNav(el,key){if(!el||$('.nexa-v231-nav',el))return;el.insertAdjacentHTML('afterbegin',navHTML(key))}
function activate(key){
 if(!TABS.some(t=>t.key===key))key='alliances'; current=key;
 sections().forEach(({t,el})=>{const on=t.key===key;el.classList.toggle('nexa-v231-hidden',!on);el.hidden=!on;el.setAttribute('aria-hidden',on?'false':'true');if(on)ensureNav(el,key)});
 $$('.admin-tab,[data-admin-tab],.admin-tabs-scroll button').forEach(b=>{const k=keyForButton(b);if(!k)return;b.classList.toggle('active',k===key);b.setAttribute('aria-selected',k===key?'true':'false')});
 if(key==='system')ensureTestingFramework();
}
function guideText(key){return ({alliances:'Create and manage alliances here. Open an alliance to manage its passport, members and alliance roles.',library:'Verified NEXA catalog: Heroes, Experts, Pets, Troops, Chief Gear and Charms.',roles:'Global alliance-rank audit. Alliance rank and NEXA module access are separate.',module:'Owner/Admin manage special NEXA module access here.',system:'Maintenance, recovery and protected system testing live here.'})[key]||''}
function showGuide(key){const msg=guideText(key);if(msg)alert(`${TABS.find(t=>t.key===key)?.label||'Administration'}\n\n${msg}`)}
function maybeFirstGuide(){
 if(!adminOpen()||localStorage.getItem('nexa_admin_guide_v231'))return;
 localStorage.setItem('nexa_admin_guide_v231','seen');
 setTimeout(()=>{if(adminOpen())alert('Administration Quick Guide\n\nUse ‹ / › to move between Administration pages.\nA = Alliances · L = Library · R = Roles · M = Module Access · S = System Operations.')},120);
}
function ensureTestingFramework(){
 const el=$('#admin-system');if(!el||$('#nexa-testing-v231',el))return;
 const host=document.createElement('section');host.id='nexa-testing-v231';host.style.cssText='margin-top:16px;border:1px solid rgba(139,92,246,.45);border-radius:18px;padding:14px;background:rgba(7,10,28,.72)';
 host.innerHTML=`<h3 style="margin-top:0">Testing <small style="color:#7de8ff">FRAMEWORK READY</small></h3><p>Testing framework is staged but intentionally not active yet.</p><label>Mode <select id="nexa-test-mode-v231"><option>Test Mode Off</option><option>Test Mode</option><option>Test Mode Auto</option></select></label><div style="display:grid;gap:10px;margin-top:12px"><button type="button" class="btn secondary" data-v231-coming>Permission Preview</button><button type="button" class="btn secondary" data-v231-coming>Battle Sandbox</button></div>`;
 el.appendChild(host);
}
function tuneProfileTroops(){
 profileTuneRAF=0;const modal=$('#nexa-profile-modal');if(!modal)return;
 $$('img',modal).forEach(img=>{let p=img.parentElement,txt='';for(let i=0;p&&i<4;i++,p=p.parentElement)txt+=' '+String(p.innerText||'').slice(0,220);if(!/\b(Infantry|Lancer|Marksman)\b/i.test(txt)||!/(Troop|T\d|FC\d|Helios)/i.test(txt))return;img.dataset.nexaV231Troop='1';img.style.padding=/\bLancer\b/i.test(txt)?'12%':'7%'});
}
function scheduleProfileTune(){if(profileTuneRAF)return;profileTuneRAF=requestAnimationFrame(tuneProfileTroops)}
function watchProfileOnly(){
 const modal=$('#nexa-profile-modal');if(!modal||profileObserver)return;
 profileObserver=new MutationObserver(scheduleProfileTune);profileObserver.observe(modal,{childList:true,subtree:true});scheduleProfileTune();
}
function wire(){
 addStyles();
 document.addEventListener('click',e=>{
  const go=e.target.closest?.('[data-v231-go]');if(go){e.preventDefault();activate(go.dataset.v231Go);return}
  const guide=e.target.closest?.('[data-v231-guide]');if(guide){e.preventDefault();showGuide(guide.dataset.v231Guide);return}
  const coming=e.target.closest?.('[data-v231-coming]');if(coming){e.preventDefault();alert('Framework ready. This testing feature is not active yet.');return}
  const tab=e.target.closest?.('.admin-tab,[data-admin-tab],.admin-tabs-scroll button');const key=keyForButton(tab);if(key){setTimeout(()=>activate(key),0);return}
  if(e.target.closest?.('[data-open-admin],#open-admin,.open-admin'))setTimeout(()=>{activate(current);maybeFirstGuide()},60);
  if(e.target.closest?.('[data-nexa-profile],#nexa-profile-modal'))setTimeout(watchProfileOnly,0);
 },false);
 // Child additions only. No class/attribute observation, preventing self-triggering feedback loops.
 const rootObserver=new MutationObserver(muts=>{
  let adminAdded=false,profileAdded=false;
  for(const m of muts)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.id==='admin-modal'||n.querySelector?.('#admin-modal'))adminAdded=true;if(n.id==='nexa-profile-modal'||n.querySelector?.('#nexa-profile-modal'))profileAdded=true}
  if(adminAdded)setTimeout(()=>{activate(current);maybeFirstGuide()},0);
  if(profileAdded)setTimeout(watchProfileOnly,0);
 });
 rootObserver.observe(document.documentElement,{childList:true,subtree:true});
 if(sections().length)activate(current);watchProfileOnly();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
