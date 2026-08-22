/* NEXA V34 — consolidated production stabilization
   Single runtime patch loaded by index.html as nexa-v30-stabilization.js.
   No troop artwork changes. No Account Constellation changes.
*/
(()=>{'use strict';
if(window.__NEXA_V34__) return;
window.__NEXA_V34__=1;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const visible=e=>{
  if(!(e instanceof HTMLElement)) return false;
  const cs=getComputedStyle(e), r=e.getBoundingClientRect();
  return cs.display!=='none' && cs.visibility!=='hidden' && r.width>0 && r.height>0;
};

function style(){
  if($('#nexa-v34-css')) return;
  const s=document.createElement('style');
  s.id='nexa-v34-css';
  s.textContent=`
html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
*{box-sizing:border-box}

/* ---------- HOME: exact existing sections, no wrapper/reparenting ---------- */
main.shell>#home-svs-section,
main.shell>#home-transfers-section,
main.shell>#nexa-v34-pulse,
main.shell>#nexa-v34-alliance{
  grid-column:1/-1!important;
  width:calc(100% - 16px)!important;
  max-width:none!important;
  margin:0 8px 10px!important;
  min-width:0!important;
  height:auto!important;
}
#home-svs-section>.home-card,
#home-transfers-section>.home-card,
#home-svs-section>.svs-card,
#home-transfers-section>.transfers-card,
#home-svs-section>article,
#home-transfers-section>article,
#home-svs-section>div:first-child,
#home-transfers-section>div:first-child{
  width:100%!important;
  max-width:none!important;
  min-width:0!important;
  min-height:72px!important;
  height:auto!important;
  margin:0!important;
  padding:13px 16px!important;
  border-radius:20px!important;
  overflow:hidden!important;
}
#home-svs-section h2,#home-svs-section h3,
#home-transfers-section h2,#home-transfers-section h3{
  font-size:18px!important;line-height:1.15!important;margin:0 0 5px!important
}
#home-svs-section p,#home-transfers-section p{font-size:13px!important;line-height:1.35!important;margin:0!important}
#home-svs-section button,#home-transfers-section button,
#home-svs-section a[role="button"],#home-transfers-section a[role="button"]{
  min-height:36px!important;height:auto!important;width:auto!important;max-width:220px!important;
  padding:7px 14px!important;margin-top:8px!important
}
#nexa-v34-pulse,#nexa-v34-alliance{
  padding:13px 16px!important;border-radius:20px!important;min-height:66px!important;
  background:linear-gradient(145deg,rgba(13,18,53,.96),rgba(5,8,27,.98))!important;
  border:1px solid rgba(100,114,255,.40)!important;
  box-shadow:0 0 22px rgba(65,76,255,.09)!important;
}
#nexa-v34-pulse h3,#nexa-v34-alliance h3{font-size:17px!important;line-height:1.15!important;margin:2px 0 4px!important}
#nexa-v34-pulse p,#nexa-v34-alliance p{font-size:13px!important;line-height:1.35!important;margin:0!important}
.nexa-v34-kicker{font-size:10px!important;letter-spacing:.20em!important;font-weight:900!important;color:#8ceaff!important}

/* Stellar is independent full-width row above profile */
#nexa-v34-stellar{
  grid-column:1/-1!important;width:calc(100% - 16px)!important;max-width:none!important;
  margin:0 8px 12px!important;padding:12px 16px!important;min-height:62px!important;
  border-radius:20px!important;display:flex!important;align-items:center!important;justify-content:center!important;
  text-align:center!important;position:relative!important;overflow:hidden!important;
  background:radial-gradient(circle at 12% 18%,rgba(79,220,255,.12),transparent 34%),
             linear-gradient(145deg,rgba(13,20,52,.96),rgba(5,8,27,.98))!important;
  border:1px solid rgba(101,145,255,.48)!important;box-shadow:0 0 22px rgba(62,91,255,.10)!important
}
#nexa-v34-stellar:after{content:"✦  ·  ✧  ·  ✦";position:absolute;right:13px;top:8px;color:#c5f6ff;opacity:.38;letter-spacing:.24em;font-size:9px}
#nexa-v34-stellar b{font-size:12px!important;letter-spacing:.20em!important;color:#91eaff!important;margin-right:10px}
#nexa-v34-stellar span{font-size:14px!important;line-height:1.3!important}

/* ---------- PASSPORT ---------- */
.nexa-v34-passport{
  width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
  min-height:0!important;height:auto!important;max-height:calc(100dvh - 18px)!important;
  margin:auto!important;overflow-y:auto!important;overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;padding-bottom:14px!important
}
.nexa-v34-passport-title{
  font-size:clamp(21px,6vw,29px)!important;line-height:1.06!important;
  letter-spacing:-.025em!important;overflow-wrap:anywhere!important;max-width:100%!important
}
/* do NOT shrink lower passport fields */
.nexa-v34-passport [class*="field"],.nexa-v34-passport [data-nexa-field]{font-size:inherit!important}
.nexa-v34-passport-open-wrap{margin-top:12px!important;padding-top:0!important;min-height:0!important;height:auto!important}

/* ---------- PLAYER PROFILE ---------- */
.nexa-v34-profile-shell{
  position:fixed!important;inset:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important;
  width:auto!important;max-width:760px!important;margin:auto!important;
  overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;padding-bottom:calc(88px + env(safe-area-inset-bottom))!important
}
.nexa-v34-profile-title{
  font-size:clamp(20px,5.7vw,27px)!important;line-height:1.05!important;
  letter-spacing:-.025em!important;overflow-wrap:anywhere!important;max-width:100%!important
}
.nexa-v34-rail{
  display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
  -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;scroll-behavior:auto!important;
  overscroll-behavior-x:auto!important;touch-action:pan-x!important;white-space:nowrap!important;
  max-width:100%!important;min-width:0!important;scrollbar-width:none!important
}
.nexa-v34-rail::-webkit-scrollbar{display:none!important}
.nexa-v34-rail>*{flex:0 0 auto!important;scroll-snap-align:none!important;scroll-snap-stop:normal!important}
.nexa-v34-profile-shell input[type="number"],.nexa-v34-profile-shell select{
  font-size:16px!important;min-height:42px!important;max-width:100%!important
}
.nexa-v34-level{
  min-width:44px!important;min-height:38px!important;padding:6px 9px!important;
  font-size:14px!important;line-height:1!important
}
.nexa-v34-owned{display:none!important}
.nexa-v34-config{
  width:calc(100% - 12px)!important;max-width:calc(100vw - 20px)!important;
  margin-left:auto!important;margin-right:auto!important;overflow-x:hidden!important
}
.nexa-v34-tools{display:flex!important;gap:9px!important;align-items:center!important;margin:9px 0 0!important}
.nexa-v34-reset,.nexa-v34-help{
  appearance:none!important;border-radius:999px!important;min-height:36px!important;font-weight:850!important;
  border:1px solid rgba(105,100,255,.65)!important;
  background:linear-gradient(145deg,rgba(24,25,67,.98),rgba(7,10,30,.99))!important;color:#eef3ff!important
}
.nexa-v34-reset{padding:7px 15px!important}.nexa-v34-help{width:36px!important;min-width:36px!important;padding:0!important;color:#8feaff!important;border-color:rgba(74,204,255,.65)!important}
#nexa-v34-help-modal{
  position:fixed!important;left:18px!important;right:18px!important;top:50%!important;transform:translateY(-50%)!important;
  z-index:2147483600!important;max-width:520px!important;margin:auto!important;padding:22px!important;border-radius:22px!important;
  color:#eef4ff!important;background:radial-gradient(circle at 15% 0%,rgba(86,194,255,.14),transparent 35%),linear-gradient(145deg,#090d26,#050714)!important;
  border:1px solid rgba(126,92,255,.65)!important;box-shadow:0 0 32px rgba(92,65,255,.35),0 0 60px rgba(40,178,255,.12)!important
}

/* ---------- MENU ---------- */
.nexa-v34-menu-row{
  appearance:none!important;border:0!important;background:transparent!important;color:inherit!important;
  width:100%!important;text-align:left!important;padding:11px 20px!important;font:inherit!important;
  font-weight:760!important;border-radius:12px!important
}
.nexa-v34-menu-row:focus{background:rgba(101,83,255,.10)!important}
.nexa-v34-menu-bug{border-top:1px solid rgba(255,255,255,.08)!important;margin-top:5px!important;padding-top:12px!important}
`;
  document.head.appendChild(s);
}

function leaf(re,root=document){
  return $$('*',root).find(e=>e.children.length===0&&re.test(text(e)));
}
function chain(el,n=9){const out=[];for(let p=el;p&&out.length<n;p=p.parentElement)out.push(p);return out}

function removeOldTagline(){
  $$('*').filter(e=>e.children.length===0&&/EVENTS\s*[✦•·]?\s*ACCOUNTS\s*[✦•·]?\s*COORDINATION/i.test(text(e)))
    .forEach(e=>e.style.setProperty('display','none','important'));
}

function findHomeProfile(){
  const main=$('main.shell')||$('main');
  if(!main)return null;
  const cands=Array.from(main.children).filter(e=>{
    const t=text(e),r=e.getBoundingClientRect();
    return /\bID\s*\d{5,}/i.test(t)&&(/\bMAIN\b|\bACTIVE\b/i.test(t))&&r.height>160&&r.height<700;
  });
  if(cands.length)return cands[0];
  const all=$$('section,article,div',main).filter(e=>{
    const t=text(e),r=e.getBoundingClientRect();
    return /\bID\s*\d{5,}/i.test(t)&&(/\bMAIN\b|\bACTIVE\b/i.test(t))&&r.width>280&&r.height>160&&r.height<700&&t.length<900;
  });
  all.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
  return all[0]||null;
}

function home(){
  const main=$('main.shell')||$('main');
  if(!main)return;

  let stellar=$('#nexa-v34-stellar');
  if(!stellar){
    stellar=document.createElement('section');
    stellar.id='nexa-v34-stellar';
    stellar.innerHTML='<b>STELLAR SIGNAL</b><span>Small course corrections can change the path of an entire orbit.</span>';
  }
  const hp=findHomeProfile();
  if(hp&&stellar.parentElement!==hp.parentElement) hp.parentElement.insertBefore(stellar,hp);
  else if(hp&&stellar.nextElementSibling!==hp) hp.parentElement.insertBefore(stellar,hp);

  let pulse=$('#nexa-v34-pulse');
  if(!pulse){
    pulse=document.createElement('section');pulse.id='nexa-v34-pulse';
    pulse.innerHTML='<div class="nexa-v34-kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>';
  }
  let alliance=$('#nexa-v34-alliance');
  if(!alliance){
    alliance=document.createElement('section');alliance.id='nexa-v34-alliance';
    alliance.innerHTML='<div class="nexa-v34-kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>';
  }
  const transfer=$('#home-transfers-section'), live=$('#home-svs-section');
  if(transfer?.parentElement){
    if(pulse.parentElement!==transfer.parentElement) transfer.after(pulse);
    if(alliance.parentElement!==transfer.parentElement) pulse.after(alliance);
  }else if(live?.parentElement){
    if(pulse.parentElement!==live.parentElement) live.after(pulse);
    if(alliance.parentElement!==live.parentElement) pulse.after(alliance);
  }
}

function findPassport(){
  const l=leaf(/DIGITAL PROFILE PASSPORT/i);if(!l)return null;
  const c=chain(l,10).filter(e=>{
    if(!(e instanceof HTMLElement))return false;
    const t=text(e),r=e.getBoundingClientRect();
    return /OPEN PLAYER INTELLIGENCE PROFILE/i.test(t)&&r.width>300&&r.height>350;
  });
  c.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
  return c[0]||null;
}
function passport(){
  const p=findPassport();if(!p)return;
  p.classList.add('nexa-v34-passport');
  const titles=$$('h1,h2,h3,strong,div,span',p).filter(e=>{
    const t=text(e);return /\bID\s*\d{5,}/i.test(t)&&/[A-Za-z]/.test(t)&&t.length<100&&e.getBoundingClientRect().height>25;
  });
  titles.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height);
  titles[0]?.classList.add('nexa-v34-passport-title');
  const b=$$('button,a',p).find(e=>/OPEN PLAYER INTELLIGENCE PROFILE/i.test(text(e)));
  if(b){
    let wrap=b.parentElement;wrap?.classList.add('nexa-v34-passport-open-wrap');
    for(let x=wrap,i=0;x&&x!==p&&i<4;x=x.parentElement,i++){
      const r=x.getBoundingClientRect(),t=text(x);
      if(r.height>180&&t.length<100){
        x.style.setProperty('min-height','0','important');
        x.style.setProperty('height','auto','important');
      }
    }
  }
}

function findProfile(){
  const modalCandidates=$$('section,article,div').filter(e=>{
    if(!visible(e))return false;
    const t=text(e),r=e.getBoundingClientRect();
    return /HEROES/i.test(t)&&/EXPERTS/i.test(t)&&/TROOPS/i.test(t)&&/PETS/i.test(t)&&
      r.width>300&&r.height>500&&r.height<=innerHeight*1.2&&t.length<14000;
  });
  modalCandidates.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
  return modalCandidates[0]||null;
}
function profile(){
  const p=findProfile();if(!p)return;
  p.classList.add('nexa-v34-profile-shell');
  const titleCands=$$('h1,h2,h3,strong,div,span',p).filter(e=>{
    const t=text(e),r=e.getBoundingClientRect();
    return /\bID\s*\d{5,}/i.test(t)&&t.length<110&&r.height>28&&r.width>180;
  });
  titleCands.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height);
  titleCands[0]?.classList.add('nexa-v34-profile-title');

  $$('*',p).forEach(e=>{
    if(!(e instanceof HTMLElement)||e.children.length<2||!visible(e))return;
    const t=text(e),r=e.getBoundingClientRect(),cn=String(e.className||'');
    const semantic=/tabs|rail|generation|tier|chips|carousel/i.test(cn) ||
      (/HEROES/i.test(t)&&/EXPERTS/i.test(t)&&/TROOPS/i.test(t)&&r.height<150) ||
      (/EPIC/i.test(t)&&/GEN\s*1/i.test(t)&&/GEN\s*2/i.test(t)&&r.height<160) ||
      (/\bT1\b/i.test(t)&&/\bT2\b/i.test(t)&&r.height<190);
    if((e.scrollWidth>e.clientWidth+8||semantic)&&r.width>220&&r.height<190)e.classList.add('nexa-v34-rail');
  });
  $$('button,[role="button"]',p).forEach(b=>{
    if(/^(?:T|FC)?\s*(?:NONE|MAXED|[0-9]{1,2})$/i.test(text(b)))b.classList.add('nexa-v34-level');
  });
  $$('label,span,strong,b,div',p).filter(e=>e.children.length===0&&/^OWNED$/i.test(text(e)))
    .forEach(e=>e.classList.add('nexa-v34-owned'));
}

function configTools(){
  const l=leaf(/PROFILE CONFIGURATION/i);if(!l)return;
  const host=chain(l,7).find(e=>{
    if(!(e instanceof HTMLElement))return false;
    const r=e.getBoundingClientRect();return r.width>300&&r.height>300&&r.height<innerHeight*1.15;
  });
  if(!host)return;
  host.classList.add('nexa-v34-config');
  if(host.querySelector('.nexa-v34-tools'))return;
  const tools=document.createElement('div');tools.className='nexa-v34-tools';
  tools.innerHTML='<button type="button" class="nexa-v34-reset">Reset</button><button type="button" class="nexa-v34-help">?</button>';
  tools.querySelector('.nexa-v34-reset').onclick=()=>{
    $$('input,select',host).forEach(el=>{
      if(el.type==='checkbox'||el.type==='radio')el.checked=false;
      else if(el.tagName==='SELECT')el.selectedIndex=0;
      else if(el.type==='number')el.value=el.min||'0';
      else if(!['hidden','file','button','submit'].includes(el.type))el.value='';
      el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    $$('[aria-pressed="true"],button.active,button.selected',host).forEach(el=>{
      el.setAttribute('aria-pressed','false');el.classList.remove('active','selected');
    });
  };
  tools.querySelector('.nexa-v34-help').onclick=()=>{
    $('#nexa-v34-help-modal')?.remove();
    const m=document.createElement('div');m.id='nexa-v34-help-modal';
    m.innerHTML='<div style="font-size:11px;letter-spacing:.18em;font-weight:900;color:#8eeaff;margin-bottom:8px">NEXA GUIDE</div><div style="font-size:19px;font-weight:900;margin-bottom:8px">Profile configuration</div><p style="line-height:1.5;margin:0 0 16px;color:#cbd5ef">Use Reset to clear an incorrect selection and return this entry to an unconfigured state.</p><button type="button" style="width:100%;padding:11px;border-radius:999px;border:1px solid #675cff;background:#12173b;color:white;font-weight:850">Close</button>';
    m.querySelector('button').onclick=()=>m.remove();document.body.appendChild(m);
  };
  const titleBlock=l.parentElement;
  if(titleBlock&&titleBlock.parentElement===host)titleBlock.after(tools);else host.insertBefore(tools,host.children[2]||null);
}

function menu(){
  const card=$('#nexa-home-menu-card')||$('#nexa-home-menu')||$$('nav,section,div').find(e=>visible(e)&&/^NAVIGATION\b/i.test(text(e))&&/\bTOOLS\b/i.test(text(e))&&text(e).length<1400);
  if(!card)return;
  $$('button,a',card).filter(e=>(/^My Alliance(?:\s*[·•].*)?$/i.test(text(e))||/^Report a Bug$/i.test(text(e)))&&!e.classList.contains('nexa-v34-menu-row')).forEach(e=>e.remove());
  const tools=$$('*',card).find(e=>e.children.length===0&&/^TOOLS$/i.test(text(e)));if(!tools)return;
  const parent=tools.parentElement||card;

  if(!$('#nexa-v34-my-alliance')){
    const b=document.createElement('button');b.id='nexa-v34-my-alliance';b.type='button';b.className='nexa-v34-menu-row';b.textContent='My Alliance';
    b.onclick=()=>window.dispatchEvent(new CustomEvent('nexa:open-my-alliance'));
    parent.insertBefore(b,tools);
  }
  if(!$('#nexa-v34-report-bug')){
    const b=document.createElement('button');b.id='nexa-v34-report-bug';b.type='button';b.className='nexa-v34-menu-row nexa-v34-menu-bug';b.textContent='Report a Bug';
    const logout=$$('button,a',card).find(e=>/^Logout$/i.test(text(e)));
    if(logout?.parentElement)logout.parentElement.insertBefore(b,logout);else parent.appendChild(b);
    b.onclick=()=>{
      const target=$$('button,a').find(e=>e!==b&&/Report a Bug/i.test(text(e)));
      target?.click?.();
    };
  }
}

function run(){style();removeOldTagline();home();passport();profile();configTools();menu()}
run();
let scheduled=false;
new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});
setInterval(run,2000);
})();