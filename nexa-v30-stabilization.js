/* NEXA V33 — consolidated current-review stabilization
   Replaces the previous nexa-v30-stabilization.js.
   Scope: Home strips, Stellar placement, Passport/Profile mobile sizing,
   horizontal rails, level controls, OWNED/Reset/help, menu placement.
   Troop artwork is intentionally NOT changed here.
*/
(()=>{
'use strict';
if(window.__NEXA_V33__) return;
window.__NEXA_V33__=1;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const visible=e=>{
  if(!e || !(e instanceof HTMLElement)) return false;
  const s=getComputedStyle(e), r=e.getBoundingClientRect();
  return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;
};

function addStyle(){
  if($('#nexa-v33-style')) return;
  const st=document.createElement('style');
  st.id='nexa-v33-style';
  st.textContent=`
  html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
  *{box-sizing:border-box}
  .nexa-v33-hide{display:none!important}

  /* HOME */
  .nexa-v33-signal-wrap{
    width:calc(100% - 32px)!important;max-width:760px!important;
    margin:12px auto 20px!important;display:flex!important;flex-direction:column!important;
    gap:10px!important;align-items:stretch!important;
  }
  .nexa-v33-strip{
    width:100%!important;max-width:100%!important;min-width:0!important;
    min-height:62px!important;height:auto!important;margin:0!important;
    padding:12px 15px!important;border-radius:20px!important;
    display:grid!important;align-content:center!important;overflow:hidden!important;
    background:
      radial-gradient(circle at 7% 0%,rgba(69,206,255,.10),transparent 32%),
      linear-gradient(145deg,rgba(13,17,49,.96),rgba(5,8,27,.98))!important;
    border:1px solid rgba(103,111,255,.40)!important;
    box-shadow:0 0 22px rgba(68,74,255,.09)!important;
  }
  .nexa-v33-strip[data-nexa-active="true"]{min-height:92px!important}
  .nexa-v33-strip h1,.nexa-v33-strip h2,.nexa-v33-strip h3{
    margin:0 0 4px!important;font-size:18px!important;line-height:1.15!important;
  }
  .nexa-v33-strip p{margin:0!important;font-size:13px!important;line-height:1.35!important}
  .nexa-v33-strip button,.nexa-v33-strip a[role="button"]{
    min-height:34px!important;margin-top:8px!important;padding:7px 12px!important;
    width:auto!important;max-width:220px!important;
  }
  .nexa-v33-strip>*{max-width:100%!important;min-width:0!important}
  .nexa-v33-strip>div,.nexa-v33-strip>section,.nexa-v33-strip>article{
    width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;
    min-height:0!important;margin:0!important;
  }

  /* Stellar stays above profile and is compact */
  .nexa-v33-stellar{
    width:calc(100% - 32px)!important;max-width:760px!important;margin:10px auto 12px!important;
    min-height:58px!important;padding:11px 15px!important;border-radius:20px!important;
    position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;
    text-align:center!important;overflow:hidden!important;
    border:1px solid rgba(98,142,255,.46)!important;
    background:
      radial-gradient(circle at 12% 20%,rgba(76,219,255,.10),transparent 35%),
      linear-gradient(145deg,rgba(13,20,52,.96),rgba(5,8,27,.97))!important;
  }
  .nexa-v33-stellar:after{
    content:"✦  ·  ✧  ·  ✦";position:absolute;right:14px;top:9px;
    color:#b9f2ff;opacity:.42;letter-spacing:.28em;font-size:9px;pointer-events:none;
  }

  /* HOME old vertical cards must obey strip width */
  #home-svs-section,#home-transfers-section,#nexa-v302-pulse,#nexa-v31-alliance,
  [data-nexa-signal="live"],[data-nexa-signal="transfer"],[data-nexa-signal="pulse"],[data-nexa-signal="alliance"]{
    width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;
    min-height:62px!important;margin:0!important;float:none!important;
  }

  /* PASSPORT: keep field sizes, only compact top header and dead space */
  .nexa-v33-passport{
    width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
    height:auto!important;min-height:0!important;max-height:calc(100dvh - 18px)!important;
    overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
    margin:auto!important;padding-bottom:18px!important;
  }
  .nexa-v33-passport .nexa-v33-passport-title{
    font-size:clamp(20px,5.8vw,28px)!important;line-height:1.08!important;
    letter-spacing:-.02em!important;overflow-wrap:anywhere!important;word-break:normal!important;
    max-width:100%!important;
  }
  .nexa-v33-passport [data-nexa-field],
  .nexa-v33-passport .passport-field,
  .nexa-v33-passport [class*="field"]{
    font-size:inherit!important;
  }
  .nexa-v33-passport .nexa-v33-empty-space{
    min-height:0!important;height:auto!important;padding-top:0!important;padding-bottom:0!important;margin-top:0!important;margin-bottom:0!important;
  }

  /* PLAYER INTELLIGENCE PROFILE shell */
  .nexa-v33-profile{
    position:fixed!important;inset:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important;
    width:auto!important;max-width:760px!important;margin:auto!important;
    overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
    overscroll-behavior:contain!important;padding-bottom:calc(96px + env(safe-area-inset-bottom))!important;
  }
  .nexa-v33-profile .nexa-v33-profile-head-title{
    font-size:clamp(19px,5.5vw,27px)!important;line-height:1.06!important;
    letter-spacing:-.02em!important;overflow-wrap:anywhere!important;max-width:100%!important;
  }
  .nexa-v33-profile [class*="header"],.nexa-v33-profile [class*="hero"]{min-width:0!important}

  /* horizontal rails */
  .nexa-v33-rail{
    display:flex!important;flex-wrap:nowrap!important;gap:10px!important;
    overflow-x:auto!important;overflow-y:hidden!important;
    -webkit-overflow-scrolling:touch!important;scroll-snap-type:none!important;
    scroll-behavior:auto!important;overscroll-behavior-x:auto!important;
    touch-action:pan-x pan-y!important;white-space:nowrap!important;
    max-width:100%!important;min-width:0!important;scrollbar-width:none!important;
  }
  .nexa-v33-rail::-webkit-scrollbar{display:none!important}
  .nexa-v33-rail>*{
    flex:0 0 auto!important;scroll-snap-align:none!important;scroll-snap-stop:normal!important;
  }

  /* compact controls — do not shrink normal passport fields */
  .nexa-v33-profile input[type="number"],
  .nexa-v33-profile select{
    font-size:16px!important;min-height:42px!important;max-width:100%!important;
  }
  .nexa-v33-profile input[type="number"]{padding:7px 10px!important}
  .nexa-v33-profile .nexa-v33-level-button,
  .nexa-v33-profile [class*="level"] button,
  .nexa-v33-profile [class*="tier"] button{
    min-width:44px!important;min-height:38px!important;padding:6px 9px!important;
    font-size:14px!important;line-height:1!important;
  }

  /* OWNED hidden */
  .nexa-v33-owned{display:none!important}

  /* Reset + Help */
  .nexa-v33-tools{
    display:flex!important;align-items:center!important;justify-content:center!important;
    gap:9px!important;margin:10px auto 0!important;width:100%!important;
  }
  .nexa-v33-reset,.nexa-v33-help{
    appearance:none!important;border:1px solid rgba(105,100,255,.64)!important;
    background:linear-gradient(145deg,rgba(24,25,67,.98),rgba(7,10,30,.99))!important;
    color:#eef3ff!important;min-height:36px!important;border-radius:999px!important;
    font-weight:850!important;box-shadow:0 0 14px rgba(89,72,255,.13)!important;
  }
  .nexa-v33-reset{padding:7px 15px!important}
  .nexa-v33-help{width:36px!important;min-width:36px!important;padding:0!important;color:#8feaff!important;border-color:rgba(74,204,255,.64)!important}
  .nexa-v33-help-modal{
    position:fixed!important;left:18px!important;right:18px!important;top:50%!important;
    transform:translateY(-50%)!important;z-index:2147483600!important;
    max-width:520px!important;margin:auto!important;padding:22px!important;border-radius:22px!important;
    color:#eef4ff!important;
    background:radial-gradient(circle at 15% 0%,rgba(86,194,255,.14),transparent 35%),linear-gradient(145deg,#090d26,#050714)!important;
    border:1px solid rgba(126,92,255,.65)!important;
    box-shadow:0 0 32px rgba(92,65,255,.35),0 0 60px rgba(40,178,255,.12)!important;
  }

  /* configuration panels safe on iPhone */
  .nexa-v33-config{
    width:calc(100% - 12px)!important;max-width:calc(100vw - 20px)!important;
    margin-left:auto!important;margin-right:auto!important;overflow-x:hidden!important;
  }

  /* MENU */
  .nexa-v33-menu-row{
    appearance:none!important;border:0!important;background:transparent!important;color:inherit!important;
    width:100%!important;text-align:left!important;padding:12px 20px!important;
    font:inherit!important;font-weight:760!important;border-radius:12px!important;
  }
  .nexa-v33-menu-row:hover,.nexa-v33-menu-row:focus{background:rgba(101,83,255,.10)!important}
  .nexa-v33-menu-sep{border-top:1px solid rgba(255,255,255,.08)!important;margin-top:4px!important;padding-top:10px!important}
  `;
  document.head.appendChild(st);
}

function leafByText(re,root=document){
  return $$('*',root).find(e=>e.children.length===0 && re.test(txt(e)));
}
function ancestors(el,limit=7){
  const a=[]; let p=el;
  while(p&&a.length<limit){a.push(p);p=p.parentElement}
  return a;
}
function bestContainerForText(re,{minW=250,minH=50,maxH=1200}={}){
  const leaf=leafByText(re);
  if(!leaf) return null;
  const list=ancestors(leaf,9).filter(e=>{
    if(!(e instanceof HTMLElement)) return false;
    const r=e.getBoundingClientRect(), t=txt(e);
    return r.width>=minW && r.height>=minH && r.height<=maxH && t.length<1800;
  });
  return list[0]||leaf.parentElement;
}

function removeLegacyTagline(){
  $$('*').filter(e=>e.children.length===0 && /EVENTS\s*[✦•·]?\s*ACCOUNTS\s*[✦•·]?\s*COORDINATION/i.test(txt(e)))
    .forEach(e=>e.classList.add('nexa-v33-hide'));
}

function findHomeProfile(){
  const cands=$$('section,article,div').filter(e=>{
    if(!visible(e)) return false;
    const t=txt(e);
    if(!/\bACTIVE\b/i.test(t)) return false;
    if(!/\bID\s*\d+/i.test(t)) return false;
    const r=e.getBoundingClientRect();
    return r.width>280 && r.height>180 && r.height<650 && t.length<900;
  });
  cands.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
  return cands[0]||null;
}

function findStellar(){
  const leaf=leafByText(/STELLAR\s+SIGNAL/i);
  if(!leaf) return null;
  const cands=ancestors(leaf,8).filter(e=>{
    if(!(e instanceof HTMLElement)) return false;
    const r=e.getBoundingClientRect(),t=txt(e);
    return r.width>250&&r.height>40&&r.height<220&&t.length<300;
  });
  return cands[0]||leaf.parentElement;
}

function normalizeStrip(el){
  if(!el) return;
  el.classList.add('nexa-v33-strip');
  el.querySelectorAll(':scope > *').forEach(ch=>{
    if(ch instanceof HTMLElement){
      ch.style.setProperty('width','100%','important');
      ch.style.setProperty('max-width','100%','important');
      ch.style.setProperty('min-width','0','important');
      ch.style.setProperty('height','auto','important');
      ch.style.setProperty('min-height','0','important');
      ch.style.setProperty('margin-left','0','important');
      ch.style.setProperty('margin-right','0','important');
    }
  });
}

function ensureHome(){
  const live=$('#home-svs-section')||bestContainerForText(/\bLive Event\b/i,{minH:80,maxH:700});
  const transfer=$('#home-transfers-section')||bestContainerForText(/^Transfers$/i,{minH:80,maxH:700});
  const pulse=$('#nexa-v302-pulse')||bestContainerForText(/NEXA\s+PULSE/i,{minH:50,maxH:500});
  const alliance=$('#nexa-v31-alliance')||bestContainerForText(/ALLIANCE\s+SIGNAL/i,{minH:50,maxH:500});
  const homeProfile=findHomeProfile();
  const stellar=findStellar();

  if(stellar && homeProfile){
    stellar.classList.add('nexa-v33-stellar');
    if(stellar.parentElement!==homeProfile.parentElement || stellar.nextElementSibling!==homeProfile){
      homeProfile.parentElement?.insertBefore(stellar,homeProfile);
    }
  }

  const signals=[live,transfer,pulse,alliance].filter(Boolean);
  if(!signals.length) return;
  let wrap=$('#nexa-v33-signal-wrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='nexa-v33-signal-wrap';
    wrap.className='nexa-v33-signal-wrap';
    const anchor=signals[0];
    anchor.parentElement?.insertBefore(wrap,anchor);
  }
  signals.forEach(el=>{
    normalizeStrip(el);
    if(el.parentElement!==wrap) wrap.append(el);
  });
}

function findPassport(){
  const title=leafByText(/DIGITAL PROFILE PASSPORT/i);
  if(!title) return null;
  const cands=ancestors(title,10).filter(e=>{
    if(!(e instanceof HTMLElement)) return false;
    const t=txt(e),r=e.getBoundingClientRect();
    return /OPEN PLAYER INTELLIGENCE PROFILE/i.test(t) && r.width>300 && r.height>350;
  });
  cands.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
  return cands[0]||null;
}

function compactPassport(){
  const pass=findPassport();
  if(!pass) return;
  pass.classList.add('nexa-v33-passport');

  const nameCandidates=$$('h1,h2,h3,strong,div,span',pass).filter(e=>{
    if(e.children.length>4) return false;
    const t=txt(e);
    return /\bID\s*\d{5,}/i.test(t) && /[A-Za-z]/.test(t) && t.length<100;
  });
  nameCandidates.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height);
  nameCandidates[0]?.classList.add('nexa-v33-passport-title');

  // Remove only obvious spacer blocks between data grid and the Open Profile button.
  const btn=$$('button,a',pass).find(e=>/OPEN PLAYER INTELLIGENCE PROFILE/i.test(txt(e)));
  if(btn){
    let p=btn.parentElement;
    for(let i=0;i<4&&p&&p!==pass;i++,p=p.parentElement){
      const r=p.getBoundingClientRect(), t=txt(p);
      if(r.height>180 && t.length<90 && !/GAME ID|ALLIANCE|ROLE|FURNACE|POWER|DEPLOYMENT/i.test(t)){
        p.classList.add('nexa-v33-empty-space');
      }
    }
  }
  // Override explicit min-heights that create dead space without changing field typography.
  ancestors(btn||pass,5).forEach(e=>{
    if(e===pass) return;
    if(!(e instanceof HTMLElement)) return;
    const r=e.getBoundingClientRect(), t=txt(e);
    if(r.height>240 && t.length<160 && !/IN-GAME NAME|GAME ID|ALLIANCE|ROLE|FURNACE|POWER|DEPLOYMENT/i.test(t)){
      e.style.setProperty('min-height','0','important');
      e.style.setProperty('height','auto','important');
    }
  });
}

function findProfile(){
  const title=leafByText(/PLAYER INTELLIGENCE PROFILE/i);
  if(title){
    const cands=ancestors(title,10).filter(e=>{
      if(!(e instanceof HTMLElement))return false;
      const t=txt(e),r=e.getBoundingClientRect();
      return /HEROES/i.test(t)&&/EXPERTS/i.test(t)&&r.width>300&&r.height>400;
    });
    cands.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
    if(cands[0]) return cands[0];
  }
  // fallback: visible full-screen profile containing Heroes/Experts/Troops
  const cands=$$('section,article,div').filter(e=>{
    if(!visible(e))return false;
    const t=txt(e),r=e.getBoundingClientRect();
    return /HEROES/i.test(t)&&/EXPERTS/i.test(t)&&/TROOPS/i.test(t)&&r.width>300&&r.height>500&&t.length<10000;
  });
  cands.sort((a,b)=>a.getBoundingClientRect().width-b.getBoundingClientRect().width);
  return cands[0]||null;
}

function applyProfile(){
  const profile=findProfile();
  if(!profile) return;
  profile.classList.add('nexa-v33-profile');

  const heads=$$('h1,h2,h3,strong,div,span',profile).filter(e=>{
    const t=txt(e);
    return /\bID\s*\d{5,}/i.test(t)&&t.length<110&&e.getBoundingClientRect().height>28;
  });
  heads.sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height);
  heads[0]?.classList.add('nexa-v33-profile-head-title');

  // Configuration modal/panel.
  const cfgLeaf=leafByText(/PROFILE CONFIGURATION/i,profile);
  if(cfgLeaf){
    ancestors(cfgLeaf,6).forEach(e=>{
      if(!(e instanceof HTMLElement))return;
      const r=e.getBoundingClientRect();
      if(r.width>300&&r.height>250&&r.height<1000)e.classList.add('nexa-v33-config');
    });
  }
}

function rails(){
  const profile=findProfile();
  const roots=[profile,document].filter(Boolean);
  roots.forEach(root=>{
    $$('*',root).forEach(e=>{
      if(!(e instanceof HTMLElement)||e.children.length<2||!visible(e)) return;
      const r=e.getBoundingClientRect(), cs=getComputedStyle(e), cn=String(e.className||'');
      const t=txt(e);
      const looksLikeTabs=/tabs|rail|scroll|generation|tier|chips|pills|carousel/i.test(cn) ||
        (/HEROES/.test(t)&&/EXPERTS/.test(t)&&/TROOPS/.test(t)&&r.height<130) ||
        (/GEN\s*1/i.test(t)&&/GEN\s*2/i.test(t)&&r.height<140) ||
        (/\bT1\b/.test(t)&&/\bT2\b/.test(t)&&r.height<180);
      if((e.scrollWidth>e.clientWidth+6 || looksLikeTabs) && r.width>220 && r.height<190){
        e.classList.add('nexa-v33-rail');
        // Crucial: preserve user's position. Do not write scrollLeft here.
      }
    });
  });
}

function hideOwned(){
  $$('label,span,strong,b,div').filter(e=>e.children.length===0&&/^OWNED$/i.test(txt(e)))
    .forEach(e=>e.classList.add('nexa-v33-owned'));
}

function compactLevelControls(){
  const profile=findProfile();
  if(!profile)return;
  $$('button,[role="button"]',profile).forEach(b=>{
    const t=txt(b);
    if(/^(?:T|FC)?\s*(?:NONE|MAXED|[0-9]{1,2})$/i.test(t) || /^[0-9]{1,2}$/.test(t)){
      b.classList.add('nexa-v33-level-button');
    }
  });
}

function resetHost(host){
  if(!host)return;
  $$('input,select',host).forEach(el=>{
    if(el.type==='checkbox'||el.type==='radio') el.checked=false;
    else if(el.tagName==='SELECT') el.selectedIndex=0;
    else if(el.type==='number') el.value=el.min||'0';
    else if(!['button','submit','hidden','file'].includes(el.type)) el.value='';
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  });
  $$('[aria-pressed="true"],button.active,button.selected,[role="button"].active,[role="button"].selected',host).forEach(el=>{
    el.setAttribute?.('aria-pressed','false');
    el.classList.remove('active','selected');
  });
}

function showHelp(){
  $('#nexa-v33-help-modal')?.remove();
  const d=document.createElement('div');
  d.id='nexa-v33-help-modal';
  d.className='nexa-v33-help-modal';
  d.innerHTML=`
    <div style="font-size:11px;letter-spacing:.18em;font-weight:900;color:#8eeaff;margin-bottom:8px">NEXA GUIDE</div>
    <div style="font-size:19px;font-weight:900;margin-bottom:8px">Profile configuration</div>
    <p style="line-height:1.5;margin:0 0 16px;color:#cbd5ef">
      Use Reset to clear an incorrect selection and return this entry to an unconfigured state.
    </p>
    <button type="button" style="width:100%;padding:11px;border-radius:999px;border:1px solid #675cff;background:#12173b;color:white;font-weight:850">Close</button>`;
  d.querySelector('button').onclick=()=>d.remove();
  document.body.append(d);
}

function restoreTools(){
  const profile=findProfile();
  if(!profile)return;
  // Add tools to the currently open configuration panel.
  const cfgLeaf=leafByText(/PROFILE CONFIGURATION/i,profile);
  if(!cfgLeaf)return;
  let host=ancestors(cfgLeaf,6).find(e=>{
    if(!(e instanceof HTMLElement))return false;
    const r=e.getBoundingClientRect();
    return r.width>300&&r.height>300&&r.height<1100;
  });
  if(!host||host.querySelector(':scope > .nexa-v33-tools'))return;

  const tools=document.createElement('div');
  tools.className='nexa-v33-tools';
  tools.innerHTML='<button type="button" class="nexa-v33-reset">Reset</button><button type="button" class="nexa-v33-help" aria-label="Help">?</button>';
  tools.querySelector('.nexa-v33-reset').onclick=()=>resetHost(host);
  tools.querySelector('.nexa-v33-help').onclick=showHelp;

  // Place near the top identity/config section, not at the very bottom.
  const ownedLeaf=$$('label,span,strong,b,div',host).find(e=>e.children.length===0&&/^OWNED$/i.test(txt(e)));
  const anchor=ownedLeaf?.parentElement;
  if(anchor?.parentElement===host) anchor.after(tools);
  else host.insertBefore(tools,host.children[Math.min(2,host.children.length)]||null);
}

function findMenuCard(){
  return $('#nexa-home-menu-card')||$('#nexa-home-menu')||
    $$('nav,section,div').find(e=>visible(e)&&/^NAVIGATION\b/i.test(txt(e))&&/\bTOOLS\b/i.test(txt(e))&&txt(e).length<1200);
}

function menu(){
  const card=findMenuCard();
  if(!card)return;

  // Remove old loose/white duplicates.
  $$('button,a',card).filter(e=>/^My Alliance$/i.test(txt(e))||/^Report a Bug$/i.test(txt(e))).forEach(e=>{
    if(!e.classList.contains('nexa-v33-menu-row')) e.remove();
  });

  const toolsLabel=$$('*',card).find(e=>e.children.length===0&&/^TOOLS$/i.test(txt(e)));
  if(!toolsLabel)return;
  const toolsParent=toolsLabel.parentElement||card;

  let my=$('#nexa-v33-my-alliance');
  if(!my){
    my=document.createElement('button');
    my.id='nexa-v33-my-alliance';my.type='button';my.className='nexa-v33-menu-row';
    let tag='';
    const homeProfile=findHomeProfile();
    const m=txt(homeProfile).match(/^[A-Z0-9_ -]+\s*[•·]\s*([A-Z0-9]{2,6})\s*[•·]\s*ID/i);
    if(m) tag=m[1];
    my.textContent=tag?`My Alliance · ${tag}`:'My Alliance';
    my.onclick=()=>{
      const existing=$$('button,a').find(x=>x!==my&&/^My Alliance$/i.test(txt(x)));
      if(existing) existing.click();
      else window.dispatchEvent(new CustomEvent('nexa:open-my-alliance'));
    };
    toolsParent.insertBefore(my,toolsLabel);
  }

  let bug=$('#nexa-v33-report-bug');
  if(!bug){
    bug=document.createElement('button');
    bug.id='nexa-v33-report-bug';bug.type='button';bug.className='nexa-v33-menu-row nexa-v33-menu-sep';
    bug.textContent='Report a Bug';
    bug.onclick=()=>{
      const existing=$$('button,a').find(x=>x!==bug&&/Report a Bug/i.test(txt(x)));
      existing?.click?.();
    };
    // Insert after the last normal tool, before Logout when possible.
    const logout=$$('button,a',card).find(e=>/^Logout$/i.test(txt(e)));
    if(logout?.parentElement) logout.parentElement.insertBefore(bug,logout);
    else toolsParent.append(bug);
  }
}

function preserveConstellation(){
  // Deliberately no visual mutations to Account Constellation.
}

function run(){
  addStyle();
  removeLegacyTagline();
  ensureHome();
  compactPassport();
  applyProfile();
  rails();
  hideOwned();
  compactLevelControls();
  restoreTools();
  menu();
  preserveConstellation();
}

run();
let queued=false;
new MutationObserver(()=>{
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;run()});
}).observe(document.documentElement,{subtree:true,childList:true});

setInterval(run,1600);
})();