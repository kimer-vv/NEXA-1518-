/* NEXA V30 — Administration Stabilization + Profile Usability
   Additive overlay. Designed to sit AFTER nexa-v28-admin-polish.js.
*/
(()=>{
  'use strict';
  if (window.__NEXA_V30__) return;
  window.__NEXA_V30__ = true;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const txt=(el)=>String(el?.textContent||'').trim();
  const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

  function addStyle(){
    if($('#nexa-v30-style')) return;
    const s=document.createElement('style');
    s.id='nexa-v30-style';
    s.textContent=`
      html,body{max-width:100%!important;overflow-x:hidden!important}

      /* HOME */
      .nexa-v30-hide{display:none!important}
      .nexa-v30-stellar{position:relative!important;overflow:hidden!important;isolation:isolate!important}
      .nexa-v30-stellar:before,.nexa-v30-stellar:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background-image:
        radial-gradient(circle at 12% 31%,rgba(255,255,255,.95) 0 1px,transparent 1.7px),
        radial-gradient(circle at 29% 71%,rgba(119,219,255,.95) 0 1px,transparent 1.8px),
        radial-gradient(circle at 52% 22%,rgba(210,193,255,.95) 0 1px,transparent 1.8px),
        radial-gradient(circle at 74% 64%,rgba(255,255,255,.85) 0 1px,transparent 1.7px),
        radial-gradient(circle at 91% 26%,rgba(108,204,255,.95) 0 1px,transparent 1.8px);
        animation:nexaV30Twinkle 3.8s ease-in-out infinite alternate;opacity:.58}
      .nexa-v30-stellar:after{transform:scale(.77) rotate(17deg);animation-delay:1.1s;animation-duration:5.3s;opacity:.38}
      .nexa-v30-stellar>*{position:relative;z-index:1}
      @keyframes nexaV30Twinkle{0%{opacity:.22;filter:brightness(.8)}45%{opacity:.72;filter:brightness(1.45)}100%{opacity:.34;filter:brightness(1)}}

      /* One Administration shell, one scroll */
      #admin-modal.nexa-v30-shell{inset:max(10px,env(safe-area-inset-top)) 12px max(10px,env(safe-area-inset-bottom))!important;width:auto!important;max-width:none!important;height:auto!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;border-radius:24px!important;padding:0!important;box-sizing:border-box!important}
      #admin-modal.nexa-v30-shell .admin-modal-card,
      #admin-modal.nexa-v30-shell .modal-content,
      #admin-modal.nexa-v30-shell .admin-content,
      #admin-modal.nexa-v30-shell .nexa-v25-host,
      #admin-modal.nexa-v30-shell #svs-admin-content{width:100%!important;max-width:none!important;min-width:0!important;height:auto!important;max-height:none!important;overflow:visible!important;box-sizing:border-box!important}
      #admin-modal.nexa-v30-shell .nexa-v25-nav{margin-top:58px!important;padding:6px 18px 12px!important;box-sizing:border-box!important}
      #admin-modal.nexa-v30-shell .nexa-v27-admin-close{top:14px!important;right:16px!important;left:auto!important;position:absolute!important;z-index:2147482001!important}
      #admin-modal.nexa-v30-shell .nexa-v25-host{padding:0 18px 30px!important}
      #admin-modal.nexa-v30-shell .nexa-v25-panel{width:100%!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box!important}
      #admin-modal.nexa-v30-shell .nexa-v25-planets{width:100%!important;margin:0 auto!important}
      #admin-modal.nexa-v30-shell .nexa-v25-toolbar{padding-left:0!important;padding-right:0!important}
      #admin-modal.nexa-v30-shell [style*="min-height"]{min-height:0!important}
      #admin-modal.nexa-v30-shell .nexa-v30-content-fit{min-height:0!important;height:auto!important}
      @media(max-width:430px){
        #admin-modal.nexa-v30-shell{left:10px!important;right:10px!important}
        #admin-modal.nexa-v30-shell .nexa-v25-host{padding-left:14px!important;padding-right:14px!important}
        #admin-modal.nexa-v30-shell .nexa-v25-nav{padding-left:14px!important;padding-right:14px!important}
      }

      /* Library speaks the same visual language as Profile */
      body.nexa-v30-library .library-grid,body.nexa-v30-library [class*="library-grid"]{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
      body.nexa-v30-library [class*="library-card"],body.nexa-v30-library .library-item{background:radial-gradient(circle at 50% 12%,rgba(93,91,255,.10),transparent 38%),rgba(4,8,22,.72)!important;border:1px solid rgba(103,104,255,.20)!important;border-radius:18px!important;box-shadow:0 0 22px rgba(83,70,255,.06)!important}
      body.nexa-v30-library [class*="library-card"] img,body.nexa-v30-library .library-item img{border-radius:50%!important;filter:drop-shadow(0 0 12px rgba(116,82,255,.24))}

      /* Profile / Passport */
      .nexa-v30-profile-header-fix h1,.nexa-v30-profile-header-fix [class*="account-name"],.nexa-v30-profile-header-fix [class*="passport-name"]{font-size:clamp(22px,5.8vw,34px)!important;line-height:1.02!important;overflow-wrap:anywhere!important}
      .nexa-v30-profile-scroll{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;max-height:calc(100dvh - 26px)!important;padding-bottom:calc(110px + env(safe-area-inset-bottom))!important}
      .nexa-v30-owned-hidden{display:none!important}

      /* Troops: stable orbit without artificial rectangular plate */
      .nexa-v25-troop-orbit,.nexa-v30-troop-orbit{position:relative!important;overflow:visible!important;background:transparent!important}
      .nexa-v25-troop-orbit:before,.nexa-v30-troop-orbit:before{content:""!important;display:block!important;position:absolute!important;inset:-8px!important;border-radius:50%!important;border:1px dashed rgba(102,205,255,.34)!important;animation:nexaV30Orbit 9s linear infinite!important;pointer-events:none!important;box-shadow:0 0 18px rgba(73,202,255,.12)!important}
      .nexa-v25-troop-orbit:after,.nexa-v30-troop-orbit:after{content:""!important;display:block!important;position:absolute!important;width:6px!important;height:6px!important;border-radius:50%!important;right:-1px!important;top:18%!important;background:#6bddff!important;box-shadow:0 0 11px #6bddff!important;animation:nexaV30OrbitDot 9s linear infinite!important;transform-origin:calc(-50% - 36px) 36px!important;pointer-events:none!important}
      @keyframes nexaV30Orbit{to{transform:rotate(360deg)}}
      @keyframes nexaV30OrbitDot{to{transform:rotate(360deg)}}
      img[src*="nexa-troop-"]{background:transparent!important;mix-blend-mode:normal!important;object-fit:contain!important;object-position:center!important}

      /* horizontal rails: momentum + no snap-back */
      .nexa-v30-hrail{overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:none!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain!important;touch-action:pan-x!important;scroll-behavior:auto!important}
      .nexa-v30-hrail>*{scroll-snap-align:none!important}
    `;
    document.head.appendChild(s);
  }

  const cosmicMessages=[
    'Even distant stars align when every orbit has purpose.',
    'Small signals become constellations when everyone moves together.',
    'Every strong constellation begins with one clear point of light.',
    'Let clarity be the gravity that keeps the whole system aligned.',
    'Momentum grows when every star knows its place in the formation.',
    'A steady orbit turns scattered motion into direction.',
    'The brightest systems are built from many lights moving as one.'
  ];

  function homePolish(){
    // remove legacy tagline wherever language/runtime re-injects it
    $$('p,span,div').forEach(el=>{
      const t=txt(el).replace(/\s+/g,' ');
      if(/^(STATE\s*1518\s*[✦•·-]\s*)?EVENTS\s*[✦•·-]\s*ACCOUNTS\s*[✦•·-]\s*COORDINATION$/i.test(t)) el.classList.add('nexa-v30-hide');
      if(/^NEXA\s*[•·-]\s*State\s*1518$/i.test(t)) el.textContent='NEXA';
    });

    // Stellar Signal
    const candidates=$$('section,article,div').filter(el=>/NEXA SIGNAL|STELLAR SIGNAL/i.test(txt(el)) && txt(el).length<260);
    const signal=candidates.sort((a,b)=>a.children.length-b.children.length)[0];
    if(signal){
      signal.classList.add('nexa-v30-stellar');
      $$('*',signal).forEach(el=>{ if(/^NEXA SIGNAL$/i.test(txt(el))) el.textContent='STELLAR SIGNAL'; });
      if(/^NEXA SIGNAL$/i.test(txt(signal))) signal.textContent='STELLAR SIGNAL';
      const quoteEls=$$('p,span,div',signal).filter(el=>{
        const t=txt(el); return t.length>20 && !/STELLAR SIGNAL/i.test(t) && el.children.length===0;
      });
      if(quoteEls.length){
        const idx=Math.floor(Date.now()/86400000)%cosmicMessages.length;
        quoteEls[0].textContent=cosmicMessages[idx];
      }
    }

    // Lift profile section by removing legacy gap around the old tagline.
    const profile=$('.nexa-profile-launcher-section') || $('[class*="profile-launcher-section"]');
    if(profile){
      profile.style.paddingTop='10px';
      profile.style.paddingBottom='18px';
      profile.style.marginTop='0';
    }

    // Flatten Live Event inner card to match Transfers.
    const live=$('#home-svs-section');
    if(live){
      live.style.padding='0';
      const event=live.querySelector('.event');
      if(event){
        event.style.background='transparent';
        event.style.border='0';
        event.style.boxShadow='none';
        event.style.borderRadius='0';
        event.style.margin='0';
        event.style.padding='18px';
      }
    }
  }

  function markHorizontalRails(){
    const candidates=$$('*').filter(el=>{
      if(!(el instanceof HTMLElement)) return false;
      const cs=getComputedStyle(el);
      const wide=el.scrollWidth>el.clientWidth+24;
      const horizontal=(cs.overflowX==='auto'||cs.overflowX==='scroll');
      const meaningful=el.children.length>=2;
      return wide && horizontal && meaningful;
    });
    candidates.forEach(el=>{
      el.classList.add('nexa-v30-hrail');
      if(el.dataset.v30Rail==='1') return;
      el.dataset.v30Rail='1';
      let wanted=el.scrollLeft, touching=false, timer=0;
      const capture=()=>{wanted=el.scrollLeft;};
      el.addEventListener('touchstart',()=>{touching=true;capture();},{passive:true});
      el.addEventListener('touchmove',capture,{passive:true});
      el.addEventListener('scroll',()=>{if(touching) capture();},{passive:true});
      el.addEventListener('touchend',()=>{
        touching=false; capture(); clearTimeout(timer);
        timer=setTimeout(()=>{ if(Math.abs(el.scrollLeft-wanted)>12) el.scrollLeft=wanted; },80);
        setTimeout(()=>{ if(Math.abs(el.scrollLeft-wanted)>12) el.scrollLeft=wanted; },220);
        setTimeout(()=>{ if(Math.abs(el.scrollLeft-wanted)>12) el.scrollLeft=wanted; },500);
      },{passive:true});
    });
  }

  function adminShell(){
    const modal=$('#admin-modal');
    if(!modal) return;
    modal.classList.add('nexa-v30-shell');

    // Never let stale last-tab state force NEXA Access/Alliances on normal Home load.
    const url=new URL(location.href);
    if(!url.searchParams.has('admin') && !url.searchParams.has('tab') && modal.classList.contains('open')){
      // only auto-close if the user did not just interact with admin in this session
      if(!window.__NEXA_ADMIN_USER_OPENED__) modal.classList.remove('open');
    }

    // Remove duplicated Bug Reports from Testing/Sandbox section only.
    $$('h2,h3,h4,strong,b',modal).forEach(h=>{
      if(!/^Bug Reports$/i.test(txt(h))) return;
      let card=h.closest('article,.nexa-v25-panel,.card,.panel,section,div');
      if(!card) return;
      const parentText=txt(card.parentElement).slice(0,900);
      const before=card.previousElementSibling ? txt(card.previousElementSibling) : '';
      if(/Testing\s*\/\s*Sandbox/i.test(parentText) || /Testing\s*\/\s*Sandbox/i.test(before)){
        // Keep the first principal Bug Reports card; hide duplicates only when there is another visible one.
        const all=$$('h2,h3,h4,strong,b',modal).filter(x=>/^Bug Reports$/i.test(txt(x)));
        if(all.length>1 && h!==all[0]) card.classList.add('nexa-v30-hide');
      }
    });

    // Remove giant empty min-height from panels such as NEXA Access/Roles.
    $$('.nexa-v25-panel,[class*="admin-panel"],[class*="access-panel"]',modal).forEach(el=>el.classList.add('nexa-v30-content-fit'));
  }

  function directAdminNavigation(){
    // Observe menu item clicks by visible text and open requested admin tab directly.
    document.addEventListener('click',async e=>{
      const btn=e.target.closest('button,a');
      if(!btn) return;
      const label=txt(btn).replace(/\s+/g,' ').trim();
      const map={
        'Alliances':'alliances',
        'Library':'library',
        'NEXA Access':'permissions',
        'Roles':'roles',
        'System Operations':'system'
      };
      const tab=map[label];
      if(!tab) return;
      const inMenu=!!btn.closest('#nexa-home-menu,.nexa-home-menu-card,.nexa-home-menu-subview');
      if(!inMenu) return;
      window.__NEXA_ADMIN_USER_OPENED__=true;
      await sleep(25);
      const modal=$('#admin-modal');
      if(modal) modal.classList.add('open','nexa-v30-shell');
      for(let i=0;i<12;i++){
        const target=$(`[data-admin-tab="${tab}"]`);
        if(target){target.click();break;}
        await sleep(60);
      }
    },true);
  }

  function closeButtons(){
    document.addEventListener('click',e=>{
      const b=e.target.closest('.nexa-v27-admin-close,[data-admin-close],#admin-modal .modal-close,#admin-modal [aria-label="Close"]');
      if(!b) return;
      const modal=$('#admin-modal');
      if(modal){
        e.preventDefault();e.stopPropagation();
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
      }
    },true);
  }

  function profilePolish(){
    // Passport/profile header sizing and scrolling.
    $$('[class*="passport"],[class*="profile"]')
      .filter(el=>el instanceof HTMLElement && /KIMER|EDIT PROFILE|PROFILE CONFIGURATION/i.test(txt(el).slice(0,400)))
      .forEach(el=>el.classList.add('nexa-v30-profile-header-fix'));

    // Any visible Profile Configuration/Edit Profile overlay should own a single vertical scroll.
    $$('div,section,article').forEach(el=>{
      const t=txt(el).slice(0,220);
      if(/PROFILE CONFIGURATION|EDIT PROFILE/i.test(t) && el.children.length>2){
        const r=el.getBoundingClientRect();
        if(r.width>250 && r.height>280) el.classList.add('nexa-v30-profile-scroll');
      }
    });

    // Hide OWNED label/checkbox everywhere in Troop configuration.
    $$('label,span,div,b,strong').forEach(el=>{
      if(/^OWNED$/i.test(txt(el))) {
        const lab=el.closest('label')||el;
        lab.classList.add('nexa-v30-owned-hidden');
      }
    });

    // Restore orbit animation around troop selections.
    $$('img[src*="nexa-troop-"]').forEach(img=>{
      const host=img.parentElement;
      if(host) host.classList.add('nexa-v30-troop-orbit');
    });
  }

  function libraryPolish(){
    const bodyText=txt(document.body).slice(0,500);
    if(/ADMINISTRATION\s*[·•]\s*LIBRARY|Verified master catalog/i.test(bodyText)) document.body.classList.add('nexa-v30-library');
  }

  function suppressAuthFlash(){
    // If a signed-in session exists, briefly flashing auth shells during internal admin transitions should stay hidden.
    const hasProfile=/KIMER|ACCOUNT CONSTELLATION|NEXA Access|Alliances|Roles|System Operations/i.test(txt(document.body).slice(0,2500));
    if(!hasProfile) return;
    $$('[class*="auth"],[id*="auth"],.login-card').forEach(el=>{
      if(/LOGIN|CREATE ACCOUNT|Welcome Back/i.test(txt(el).slice(0,500))) el.style.visibility='hidden';
    });
  }

  function run(){
    addStyle();
    homePolish();
    adminShell();
    profilePolish();
    libraryPolish();
    markHorizontalRails();
    suppressAuthFlash();
  }

  directAdminNavigation();
  closeButtons();
  run();

  let queued=false;
  const mo=new MutationObserver(()=>{
    if(queued) return; queued=true;
    requestAnimationFrame(()=>{queued=false;run();});
  });
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:false});

  window.addEventListener('pageshow',run,{passive:true});
  window.addEventListener('resize',()=>setTimeout(run,60),{passive:true});
})();
