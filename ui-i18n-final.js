(function(){
 const L=()=>NEXA_I18N.device();
 const tr=(k)=>NEXA_I18N.t(L(),k);
 const MAP={
  "LIVE":"live","View Event":"viewEvent","Apply":"apply","Apply →":"apply",
  "View Prep":"viewPrep","Fill Prep":"fillPrep","Claim Account":"claimAccount",
  "State Assignments":"stateAssignments","Puzzle & Presidency":"puzzlePresidency",
  "Transfers":"transfers","TRANSFER":"transfers","Back Home":"backHome",
  "My Submissions":"mySubmissions","Admin":"admin"
 };
 function walk(){
   document.querySelectorAll("a,button,.badge,.pill,.eyebrow,.nav-link").forEach(el=>{
     const raw=(el.textContent||"").trim();
     if(MAP[raw] && !el.dataset.nexaUiI18n){
       el.textContent=tr(MAP[raw]) + (raw.endsWith("→")?" →":"");
       el.dataset.nexaUiI18n="1";
     }
   });
 }
 document.addEventListener("DOMContentLoaded",()=>{
   try{NEXA_I18N.setDir(L());walk();new MutationObserver(walk).observe(document.body,{childList:true,subtree:true});}catch(_){}
 });
})();

/* ==========================================================
   NEXA v59.0 — CONSTELLATION MIRROR FIX
   Source of truth: the SAME rendered WOS Accounts list that is
   visibly showing Kimer + Test. No second Supabase query.
   ========================================================== */
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  let accounts=[];
  let selectedKey=null;
  let tapKey=null;
  let tapAt=0;

  function initials(name){
    const parts=String(name||'NEXA').trim().split(/\s+/).filter(Boolean);
    return (parts.length>1 ? parts[0][0]+parts[1][0] : parts[0]?.slice(0,2) || 'NX').toUpperCase();
  }

  function avatarData(name){
    const text=initials(name);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
      <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#24315f"/><stop offset="1" stop-color="#15192f"/></linearGradient></defs>
      <rect width="100%" height="100%" rx="90" fill="url(#g)"/>
      <text x="50%" y="57%" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="62" fill="#c9b4ff">${text}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }

  function parseCard(card,index){
    const text=(card.innerText||card.textContent||'').replace(/\s+/g,' ').trim();
    if(!text) return null;

    const buttons=[...card.querySelectorAll('button')].map(b=>(b.textContent||'').trim().toLowerCase());
    if(!buttons.some(x=>x==='edit') && !buttons.some(x=>x==='delete')) return null;

    const lines=(card.innerText||card.textContent||'').split(/\n+/).map(s=>s.trim()).filter(Boolean);
    const filtered=lines.filter(s=>!/^(edit|delete)$/i.test(s));
    if(!filtered.length) return null;

    const name=filtered[0];
    const detail=filtered.slice(1).join(' ');
    const idMatch=detail.match(/\bID\s*([^\s]+)/i);
    const playerId=idMatch?.[1]||'';
    const alliance=(detail.split(/[•·]/)[0]||'').replace(/\bID\b.*$/i,'').trim()||'Not Listed';

    return {
      key: playerId || `${name}-${index}`,
      name,
      playerId,
      alliance,
      isMain:index===0
    };
  }

  function readVisibleAccounts(){
    const list=$('accounts-list');
    if(!list) return [];

    const candidates=[...list.children].filter(el=>el.nodeType===1);
    const parsed=candidates.map(parseCard).filter(Boolean);

    if(parsed.length) return parsed;

    // Fallback for nested card wrappers.
    const nested=[...list.querySelectorAll('article,.account-card,.card,[data-account-id]')];
    return nested.map(parseCard).filter(Boolean);
  }

  function activeAccount(){
    if(!accounts.length) return null;
    const stored=localStorage.getItem('nexa_active_account_key');
    return accounts.find(a=>String(a.key)===String(stored)) || accounts[0];
  }

  function syncHome(){
    const a=activeAccount();
    if(!a) return;

    const img=$('nexa-profile-launcher-photo');
    const name=$('nexa-profile-launcher-name');
    const badge=$('nexa-profile-launcher-badge');
    const count=$('nexa-profile-launcher-count');

    if(img){
      img.src=avatarData(a.name);
      img.style.display='block';
    }
    if(name) name.textContent=String(a.name||'MY PROFILE').toUpperCase();
    if(badge) badge.textContent='MAIN';
    if(count){
      count.textContent=String(accounts.length);
      count.classList.toggle('hidden',accounts.length<2);
    }
  }

  function renderPassport(a){
    selectedKey=a?.key||null;
    $('nexa-v590-passport')?.remove();

    const modal=$('nexa-account-constellation');
    if(!modal || !a) return;

    const section=document.createElement('section');
    section.id='nexa-v590-passport';
    section.innerHTML=`
      <div class="nexa-v590-passport-card">
        <img src="${avatarData(a.name)}" alt="">
        <div class="nexa-v590-passport-copy">
          <span>PROFILE PASSPORT</span>
          <strong>${esc(a.name)}</strong>
          <small>${esc(a.alliance)}${a.playerId?' • ID '+esc(a.playerId):''}</small>
        </div>
        <div class="nexa-v590-passport-hint">Double tap to enter this account</div>
      </div>`;
    modal.appendChild(section);
  }

  function renderConstellation(){
    const system=$('nexa-constellation-system');
    if(!system) return;

    const active=activeAccount();
    const orbiting=active ? accounts.filter(a=>a.key!==active.key) : [];
    const positions=[[82,31],[79,72],[21,72],[18,31]];

    let html=
      '<span class="nexa-constellation-orbit one"></span>'+
      '<span class="nexa-constellation-orbit two"></span>';

    if(active){
      html+=`
        <button type="button" class="nexa-account-planet main" data-v590-account="${esc(active.key)}">
          <img src="${avatarData(active.name)}" alt="">
          <span class="nexa-account-planet-name">${esc(active.name)}</span>
          <span class="nexa-account-planet-type">MAIN</span>
        </button>`;
    }

    orbiting.slice(0,4).forEach((a,i)=>{
      const p=positions[i];
      html+=`
        <button type="button" class="nexa-account-planet alt" style="left:${p[0]}%;top:${p[1]}%" data-v590-account="${esc(a.key)}">
          <img src="${avatarData(a.name)}" alt="">
          <span class="nexa-account-planet-name">${esc(a.name)}</span>
          <span class="nexa-account-planet-type">ACCOUNT</span>
        </button>`;
    });

    if(accounts.length<5){
      const p=positions[Math.min(orbiting.length,3)]||[50,14];
      html+=`
        <button type="button" id="nexa-v590-add" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%">
          <span class="nexa-add-planet-symbol">+</span>
          <span class="nexa-account-planet-name">ADD ACCOUNT</span>
        </button>`;
    }

    system.innerHTML=html;
    const manage=$('nexa-constellation-manage');
    if(manage) manage.style.display='none';

    if(active && !selectedKey) renderPassport(active);
  }

  function refreshFromWosList(){
    const next=readVisibleAccounts();
    if(!next.length) return false;
    accounts=next;
    syncHome();

    const constellation=$('nexa-account-constellation');
    if(constellation?.classList.contains('open')) renderConstellation();
    return true;
  }

  function openConstellation(){
    const modal=$('nexa-account-constellation');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }

    selectedKey=null;

    if(refreshFromWosList()){
      renderConstellation();
      return;
    }

    // The legacy Accounts UI already knows how to load the correct accounts.
    // Open it invisibly for a moment if its list has not populated yet.
    const accountsModal=$('accounts-modal');
    const wasOpen=accountsModal?.classList.contains('open');
    if(accountsModal && !wasOpen){
      accountsModal.style.visibility='hidden';
      accountsModal.style.pointerEvents='none';
      accountsModal.classList.add('open');
      accountsModal.setAttribute('aria-hidden','false');
    }

    const wait=()=>{
      if(refreshFromWosList()){
        if(accountsModal && !wasOpen){
          accountsModal.classList.remove('open');
          accountsModal.setAttribute('aria-hidden','true');
          accountsModal.style.visibility='';
          accountsModal.style.pointerEvents='';
        }
        renderConstellation();
        return;
      }
      setTimeout(wait,120);
    };
    setTimeout(wait,120);
  }

  function openAdd(){
    $('nexa-account-constellation')?.classList.remove('open');
    const modal=$('accounts-modal');
    if(modal){
      modal.style.visibility='';
      modal.style.pointerEvents='';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
  }

  function switchAccount(key){
    const a=accounts.find(x=>String(x.key)===String(key));
    if(!a) return;

    localStorage.setItem('nexa_active_account_key',String(a.key));
    selectedKey=a.key;
    syncHome();
    renderConstellation();
    renderPassport(a);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nexa-profile-launcher')){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openConstellation();
      return;
    }

    if(e.target.closest?.('#nexa-v590-add')){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openAdd();
      return;
    }

    const planet=e.target.closest?.('[data-v590-account]');
    if(planet){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const key=planet.getAttribute('data-v590-account');
      const a=accounts.find(x=>String(x.key)===String(key));
      const now=Date.now();

      if(tapKey===key && now-tapAt<450){
        tapKey=null;
        tapAt=0;
        switchAccount(key);
      }else{
        tapKey=key;
        tapAt=now;
        renderPassport(a);
      }
    }
  },true);

  document.addEventListener('dblclick',e=>{
    const planet=e.target.closest?.('[data-v590-account]');
    if(!planet) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    switchAccount(planet.getAttribute('data-v590-account'));
  },true);

  function watchAccountsList(){
    const list=$('accounts-list');
    if(!list){ setTimeout(watchAccountsList,250); return; }

    new MutationObserver(()=>{
      setTimeout(refreshFromWosList,40);
    }).observe(list,{childList:true,subtree:true,characterData:true});

    refreshFromWosList();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(watchAccountsList,300));
  }else{
    setTimeout(watchAccountsList,300);
  }

  const style=document.createElement('style');
  style.textContent=`
    #nexa-constellation-system .nexa-account-planet{z-index:5}
    #nexa-constellation-system .nexa-constellation-orbit.one{animation:nexaV590Spin 30s linear infinite}
    #nexa-constellation-system .nexa-constellation-orbit.two{animation:nexaV590SpinBack 44s linear infinite}
    @keyframes nexaV590Spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes nexaV590SpinBack{to{transform:translate(-50%,-50%) rotate(-360deg)}}
    #nexa-v590-passport{width:min(520px,calc(100% - 34px));margin:24px auto 80px;position:relative;z-index:8}
    .nexa-v590-passport-card{display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center;padding:14px;border:1px solid rgba(119,87,246,.5);border-radius:20px;background:rgba(13,18,42,.84);box-shadow:0 18px 50px rgba(0,0,0,.28)}
    .nexa-v590-passport-card img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(116,198,255,.65)}
    .nexa-v590-passport-copy{display:grid;gap:3px;min-width:0}
    .nexa-v590-passport-copy span{font-size:10px;letter-spacing:.18em;color:#a98cff;font-weight:900}
    .nexa-v590-passport-copy strong{font-size:20px;color:white;overflow:hidden;text-overflow:ellipsis}
    .nexa-v590-passport-copy small{color:#9ca9c8;overflow:hidden;text-overflow:ellipsis}
    .nexa-v590-passport-hint{grid-column:1/-1;text-align:center;font-size:11px;color:#6dd8ff;letter-spacing:.08em;text-transform:uppercase}
  `;
  document.head.appendChild(style);
})();
