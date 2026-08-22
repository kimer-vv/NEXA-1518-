/* NEXA V32 — iPhone UI correction pack
   Scope: current post-V31 review only. Troop artwork intentionally untouched.
*/
(()=>{'use strict';
if(window.__NEXA_V32__) return; window.__NEXA_V32__=1;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const css=`
html,body{max-width:100%!important;overflow-x:hidden!important}

/* HOME: compact full-width signal strips */
#nexa-v31-signals{display:flex!important;flex-direction:column!important;gap:10px!important;width:calc(100% - 32px)!important;max-width:760px!important;margin:12px auto 18px!important}
#nexa-v31-signals>.nexa-v31-strip,
#nexa-v31-signals>#home-svs-section,
#nexa-v31-signals>#home-transfers-section,
#nexa-v31-signals>#nexa-v302-pulse,
#nexa-v31-signals>#nexa-v31-alliance{
 width:100%!important;max-width:100%!important;min-height:64px!important;height:auto!important;
 margin:0!important;padding:12px 16px!important;border-radius:20px!important;box-sizing:border-box!important;
}
#nexa-v31-signals .nexa-v31-strip>*{max-width:100%!important}
#nexa-v31-signals #home-svs-section>*,#nexa-v31-signals #home-transfers-section>*{
 width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;margin:0!important;
}
#nexa-v31-signals h2,#nexa-v31-signals h3{font-size:18px!important;line-height:1.15!important;margin:0 0 5px!important}
#nexa-v31-signals p{font-size:13px!important;line-height:1.35!important;margin:0!important}
#nexa-v31-signals button,#nexa-v31-signals a[role="button"]{min-height:36px!important;margin-top:8px!important}
.nexa-v32-stellar-first{order:-20!important}

/* Passport/profile mobile sizing */
.nexa-v31-profile{left:10px!important;right:10px!important;top:max(10px,env(safe-area-inset-top))!important;bottom:max(10px,env(safe-area-inset-bottom))!important;width:auto!important;max-width:720px!important}
.nexa-v31-profile h1,.nexa-v31-profile [class*="account-name"],.nexa-v31-profile [class*="passport-name"]{
 font-size:clamp(18px,5vw,27px)!important;line-height:1.08!important;letter-spacing:-.02em!important;
 overflow-wrap:anywhere!important;word-break:normal!important;max-width:100%!important;
}
@media(max-width:430px){
 .nexa-v31-profile{left:8px!important;right:8px!important}
 .nexa-v31-profile h1,.nexa-v31-profile [class*="account-name"],.nexa-v31-profile [class*="passport-name"]{font-size:22px!important}
}

/* Rails: free native horizontal scrolling; no snap-back */
.nexa-v31-rail,.nexa-v32-rail{
 overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;
 scroll-snap-type:none!important;scroll-behavior:auto!important;overscroll-behavior-x:auto!important;
 touch-action:pan-x pan-y!important;white-space:nowrap!important;max-width:100%!important;
}
.nexa-v31-rail>*,.nexa-v32-rail>*{scroll-snap-align:none!important;scroll-snap-stop:normal!important;flex:0 0 auto!important}

/* Compact level controls */
.nexa-v31-profile input[type="number"],.nexa-v31-profile select,
.nexa-v31-profile button:not(.nexa-v32-reset):not(.nexa-v32-help){
 max-width:100%!important;font-size:16px!important;
}
.nexa-v31-profile input[type="number"]{min-height:44px!important;padding:8px 12px!important}
.nexa-v31-profile [class*="level"] button,.nexa-v31-profile [class*="tier"] button{
 min-width:48px!important;min-height:40px!important;padding:7px 10px!important;font-size:14px!important;
}

/* Hide OWNED wording only, preserve actual controls/data */
.nexa-v31-owned-label,.nexa-v32-owned-word{display:none!important}

/* Restore compact Reset + ? tools */
.nexa-v32-tools{display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;margin:9px auto 2px!important}
.nexa-v32-reset,.nexa-v32-help{
 appearance:none!important;border:1px solid rgba(104,103,255,.62)!important;
 background:linear-gradient(145deg,rgba(22,25,68,.96),rgba(7,11,31,.98))!important;color:#eef3ff!important;
 min-height:36px!important;border-radius:999px!important;font-weight:850!important;box-shadow:0 0 14px rgba(93,75,255,.13)!important
}
.nexa-v32-reset{padding:7px 15px!important}.nexa-v32-help{width:36px!important;padding:0!important;color:#8eeaff!important;border-color:rgba(77,204,255,.62)!important}

/* Configuration panels keep safe margins */
.nexa-v31-profile [class*="configuration"],.nexa-v31-profile [class*="config-modal"],
.nexa-v31-profile [class*="profile-modal"]{max-width:calc(100vw - 20px)!important;box-sizing:border-box!important}

/* Menu placement */
.nexa-v32-menu-item{appearance:none;border:0;background:transparent;color:inherit;width:100%;text-align:left;padding:12px 20px;font:inherit;font-weight:750}
.nexa-v32-menu-alliance{border-bottom:1px solid rgba(255,255,255,.08)}
`;
function addStyle(){if($('#nexa-v32-css'))return;let s=document.createElement('style');s.id='nexa-v32-css';s.textContent=css;document.head.appendChild(s)}

function fixHome(){
 const wrap=$('#nexa-v31-signals'); if(!wrap)return;
 let stellar=[...wrap.children].find(e=>/STELLAR SIGNAL/i.test(txt(e)));
 if(stellar){stellar.classList.add('nexa-v32-stellar-first'); if(wrap.firstElementChild!==stellar)wrap.prepend(stellar)}
}

function fixRails(){
 $$('*').forEach(e=>{
   if(!(e instanceof HTMLElement)||e.children.length<2)return;
   let cs=getComputedStyle(e);
   let likely=e.scrollWidth>e.clientWidth+8 && (['auto','scroll'].includes(cs.overflowX) || /tabs|rail|generation|tier|chips/i.test(e.className||''));
   if(likely)e.classList.add('nexa-v32-rail');
 });
}

function hideOwned(){
 $$('label,span,strong,b,div').filter(e=>e.children.length===0&&/^OWNED$/i.test(txt(e))).forEach(e=>e.classList.add('nexa-v32-owned-word'));
}

function resetElement(host){
 const controls=$$('input,select',host);
 controls.forEach(el=>{
   if(el.type==='checkbox'||el.type==='radio') el.checked=false;
   else if(el.tagName==='SELECT') el.selectedIndex=0;
   else if(el.type==='number') el.value=el.min||0;
   else if(!['button','submit','hidden'].includes(el.type)) el.value='';
   el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
 });
 $$('[aria-pressed="true"],.selected,.active',host).forEach(el=>{
   if(el.matches('button,[role="button"]')){el.setAttribute('aria-pressed','false');el.classList.remove('selected','active')}
 });
}
function addTools(){
 const profile=$('.nexa-v31-profile'); if(!profile)return;
 const candidates=$$('article,.card,[class*="card"],[class*="configuration"],[class*="config"]',profile)
  .filter(h=>h.querySelector('input,select') && !h.querySelector(':scope > .nexa-v32-tools'));
 candidates.forEach(host=>{
   if(host.closest('.nexa-v32-tools'))return;
   let tools=document.createElement('div');tools.className='nexa-v32-tools';
   tools.innerHTML='<button type="button" class="nexa-v32-reset">Reset</button><button type="button" class="nexa-v32-help" aria-label="Help">?</button>';
   tools.querySelector('.nexa-v32-reset').onclick=()=>resetElement(host);
   tools.querySelector('.nexa-v32-help').onclick=()=>showHelp();
   host.append(tools);
 });
}
function showHelp(){
 $('#nexa-v32-help')?.remove();
 let d=document.createElement('div');d.id='nexa-v32-help';d.className='nexa-v31-help';
 d.innerHTML='<b style="letter-spacing:.16em;color:#8eeaff">NEXA GUIDE</b><p style="line-height:1.5">Use Reset to clear an incorrect selection and return this item to its unconfigured state.</p><button type="button" style="width:100%;padding:11px;border-radius:999px;border:1px solid #675cff;background:#12173b;color:white;font-weight:800">Close</button>';
 d.querySelector('button').onclick=()=>d.remove();document.body.append(d);
}

function fixMenu(){
 const card=$('#nexa-home-menu-card');if(!card)return;
 // Remove V31's loose white buttons.
 $$('button,a',card).filter(e=>/^My Alliance$|^Report a Bug$/i.test(txt(e))).forEach(e=>e.remove());
 const toolsLabel=$$('*',card).find(e=>e.children.length===0&&/^TOOLS$/i.test(txt(e)));
 if(!toolsLabel)return;
 if(!$('#nexa-v32-my-alliance')){
   let b=document.createElement('button');b.id='nexa-v32-my-alliance';b.type='button';b.className='nexa-v32-menu-item nexa-v32-menu-alliance';
   let alliance=(document.body.dataset.alliance||'').trim();b.textContent=alliance?`My Alliance · ${alliance}`:'My Alliance';
   b.onclick=()=>window.dispatchEvent(new CustomEvent('nexa:open-my-alliance'));
   toolsLabel.parentElement.insertBefore(b,toolsLabel);
 }
 if(!$('#nexa-v32-report-bug')){
   let b=document.createElement('button');b.id='nexa-v32-report-bug';b.type='button';b.className='nexa-v32-menu-item';b.textContent='Report a Bug';
   let toolContainer=toolsLabel.parentElement;
   let logout=$$('button,a',toolContainer).find(e=>/^Logout$/i.test(txt(e)));
   if(logout)toolContainer.insertBefore(b,logout);else toolContainer.append(b);
   b.onclick=()=>{let x=$$('button,a').find(e=>e!==b&&/Report a Bug/i.test(txt(e)));x?.click?.()};
 }
}

function run(){addStyle();fixHome();fixRails();hideOwned();addTools();fixMenu()}
run();let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
setInterval(run,1800);
})();