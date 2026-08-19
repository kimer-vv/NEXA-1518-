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
   NEXA v58.9 — ACCOUNT CONSTELLATION GLOBAL CLIENT FIX
   IMPORTANT:
   index.html declares `const supabaseClient = ...`.
   A top-level const is NOT window.supabaseClient.
   This file now reads that exact global lexical binding.
   ========================================================== */
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  let rows=[];
  let selectedId=null;
  let tapId=null;
  let tapAt=0;
  let loading=false;

  function sb(){
    /* `supabaseClient` lives in index.html as a global lexical const.
       It does not appear on window, which is why v58.8 saw no client. */
    try{
      if(typeof supabaseClient!=='undefined' && supabaseClient?.auth){
        return supabaseClient;
      }
    }catch(_){}
    if(window.supabaseClient?.auth) return window.supabaseClient;
    return null;
  }

  async function currentUser(){
    const client=sb();
    if(!client?.auth) return null;
    const {data:{session}}=await client.auth.getSession();
    return session?.user||null;
  }

  async function loadAccounts(){
    if(loading) return rows;
    loading=true;
    try{
      const client=sb();
      const user=await currentUser();

      if(!client || !user){
        const cached=Array.isArray(window.nexaAccountsCache)?window.nexaAccountsCache:[];
        if(cached.length){
          rows=cached;
          return rows;
        }
        throw new Error('Signed-in NEXA session/client not available.');
      }

      const {data,error}=await client
        .from('player_accounts')
        .select('id,user_id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url,created_at,alliances(tag)')
        .eq('user_id',user.id)
        .order('is_main',{ascending:false})
        .order('created_at',{ascending:true});

      if(error) throw error;

      rows=Array.isArray(data)?data:[];
      window.nexaAccountsCache=rows;
      return rows;
    }finally{
      loading=false;
    }
  }

  function avatar(a){
    return a?.profile_photo_url ||
      'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+
      '&background=111a38&color=cabaff&bold=true&size=256';
  }

  function activeAccount(){
    if(!rows.length) return null;
    const stored=localStorage.getItem('nexa_active_account_id');
    return rows.find(a=>String(a.id)===String(stored)) ||
      rows.find(a=>a.is_main===true) ||
      rows[0];
  }

  function allianceLabel(a){
    return a?.custom_alliance_tag || a?.alliances?.tag || 'Not Listed';
  }

  function syncHome(){
    const a=activeAccount();
    if(!a) return;

    const img=$('nexa-profile-launcher-photo');
    const name=$('nexa-profile-launcher-name');
    const badge=$('nexa-profile-launcher-badge');
    const count=$('nexa-profile-launcher-count');

    if(img){
      img.src=avatar(a);
      img.style.display='block';
    }
    if(name) name.textContent=(a.in_game_name||'MY PROFILE').toUpperCase();
    if(badge) badge.textContent='MAIN';
    if(count){
      count.textContent=String(rows.length);
      count.classList.toggle('hidden',rows.length<2);
    }
  }

  function accountType(a,isActive){
    if(isActive) return 'MAIN';
    return String(a?.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC';
  }

  function renderPassport(a){
    selectedId=a?.id||null;
    $('nexa-v589-passport')?.remove();

    const modal=$('nexa-account-constellation');
    if(!modal || !a) return;

    const section=document.createElement('section');
    section.id='nexa-v589-passport';
    section.innerHTML=`
      <div class="nexa-v589-passport-card">
        <img src="${esc(avatar(a))}" alt="">
        <div class="nexa-v589-passport-copy">
          <span>PROFILE PASSPORT</span>
          <strong>${esc(a.in_game_name||'Account')}</strong>
          <small>${esc(allianceLabel(a))}${a.player_id?' • ID '+esc(a.player_id):''}</small>
        </div>
        <div class="nexa-v589-passport-hint">Double tap to enter this account</div>
      </div>`;
    modal.appendChild(section);
  }

  function renderConstellation(){
    const system=$('nexa-constellation-system');
    if(!system) return;

    const active=activeAccount();
    const orbiting=active?rows.filter(a=>String(a.id)!==String(active.id)):rows;
    const pos=[[82,30],[78,72],[22,72],[18,30]];

    let html=
      '<span class="nexa-constellation-orbit one"></span>'+
      '<span class="nexa-constellation-orbit two"></span>';

    if(active){
      html+=`
        <button type="button" class="nexa-account-planet main" data-v589-account="${esc(active.id)}">
          <img src="${esc(avatar(active))}" alt="">
          <span class="nexa-account-planet-name">${esc(active.in_game_name||'Account')}</span>
          <span class="nexa-account-planet-type">MAIN</span>
        </button>`;
    }

    orbiting.slice(0,4).forEach((a,i)=>{
      const p=pos[i];
      html+=`
        <button type="button" class="nexa-account-planet alt" style="left:${p[0]}%;top:${p[1]}%" data-v589-account="${esc(a.id)}">
          <img src="${esc(avatar(a))}" alt="">
          <span class="nexa-account-planet-name">${esc(a.in_game_name||'Account')}</span>
          <span class="nexa-account-planet-type">${accountType(a,false)}</span>
        </button>`;
    });

    if(rows.length<5){
      /* Keep Add Account as another small object on the orbital field. */
      const p=pos[Math.min(orbiting.length,3)]||[50,14];
      html+=`
        <button type="button" id="nexa-v589-add" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%">
          <span class="nexa-add-planet-symbol">+</span>
          <span class="nexa-account-planet-name">ADD ACCOUNT</span>
        </button>`;
    }

    system.innerHTML=html;

    const manage=$('nexa-constellation-manage');
    if(manage) manage.style.display='none';

    if(active && !selectedId) renderPassport(active);
  }

  async function refreshAndRender(){
    try{
      await loadAccounts();
      syncHome();
      renderConstellation();
    }catch(error){
      console.warn('NEXA v58.9 accounts:',error?.message||error);

      /* Last fallback: reuse the exact rows the legacy WOS Accounts UI already loaded. */
      const cached=Array.isArray(window.nexaAccountsCache)?window.nexaAccountsCache:[];
      if(cached.length){
        rows=cached;
        syncHome();
        renderConstellation();
      }
    }
  }

  async function openConstellation(){
    const modal=$('nexa-account-constellation');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }

    const system=$('nexa-constellation-system');
    if(system){
      system.innerHTML=
        '<span class="nexa-constellation-orbit one"></span>'+
        '<span class="nexa-constellation-orbit two"></span>'+
        '<div class="nexa-v589-loading">Loading accounts…</div>';
    }

    selectedId=null;
    await refreshAndRender();
  }

  function openAddAccount(){
    $('nexa-account-constellation')?.classList.remove('open');

    const modal=$('accounts-modal');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
  }

  function switchAccount(id){
    const a=rows.find(x=>String(x.id)===String(id));
    if(!a) return;

    localStorage.setItem('nexa_active_account_id',String(a.id));
    selectedId=a.id;
    syncHome();
    renderConstellation();
    renderPassport(a);
  }

  document.addEventListener('click',function(e){
    const launcher=e.target.closest?.('#nexa-profile-launcher');
    if(launcher){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openConstellation();
      return;
    }

    const add=e.target.closest?.('#nexa-v589-add');
    if(add){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openAddAccount();
      return;
    }

    const planet=e.target.closest?.('[data-v589-account]');
    if(planet){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const id=planet.getAttribute('data-v589-account');
      const a=rows.find(x=>String(x.id)===String(id));
      const now=Date.now();

      if(tapId===id && now-tapAt<450){
        tapId=null;
        tapAt=0;
        switchAccount(id);
      }else{
        tapId=id;
        tapAt=now;
        renderPassport(a);
      }
    }
  },true);

  document.addEventListener('dblclick',function(e){
    const planet=e.target.closest?.('[data-v589-account]');
    if(!planet) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    switchAccount(planet.getAttribute('data-v589-account'));
  },true);

  /* When Add Account is closed after a save, requery Supabase so the new
     account appears in the constellation without a manual refresh. */
  const modalObserver=new MutationObserver(()=>{
    const modal=$('accounts-modal');
    if(modal && !modal.classList.contains('open')){
      setTimeout(()=>{
        selectedId=null;
        refreshAndRender();
      },180);
    }
  });

  function boot(){
    const accountModal=$('accounts-modal');
    if(accountModal){
      modalObserver.observe(accountModal,{
        attributes:true,
        attributeFilter:['class','aria-hidden']
      });
    }

    setTimeout(async()=>{
      try{
        await loadAccounts();
        syncHome();
      }catch(_){}
    },650);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot);
  }else{
    boot();
  }

  window.addEventListener('pageshow',()=>{
    setTimeout(async()=>{
      try{
        await loadAccounts();
        syncHome();
      }catch(_){}
    },250);
  });

  const style=document.createElement('style');
  style.textContent=`
    .nexa-v589-loading{
      position:absolute;
      left:50%;top:50%;
      transform:translate(-50%,-50%);
      color:#8290b4;
      font-size:13px;
      letter-spacing:.08em;
      text-transform:uppercase
    }
    #nexa-constellation-system .nexa-account-planet{z-index:5}
    #nexa-constellation-system .nexa-constellation-orbit.one{
      animation:nexaV589Spin 30s linear infinite
    }
    #nexa-constellation-system .nexa-constellation-orbit.two{
      animation:nexaV589SpinBack 44s linear infinite
    }
    @keyframes nexaV589Spin{
      to{transform:translate(-50%,-50%) rotate(360deg)}
    }
    @keyframes nexaV589SpinBack{
      to{transform:translate(-50%,-50%) rotate(-360deg)}
    }
    #nexa-v589-passport{
      width:min(520px,calc(100% - 34px));
      margin:24px auto 80px;
      position:relative;
      z-index:8
    }
    .nexa-v589-passport-card{
      display:grid;
      grid-template-columns:64px 1fr;
      gap:12px;
      align-items:center;
      padding:14px;
      border:1px solid rgba(119,87,246,.5);
      border-radius:20px;
      background:rgba(13,18,42,.84);
      box-shadow:0 18px 50px rgba(0,0,0,.28)
    }
    .nexa-v589-passport-card img{
      width:64px;height:64px;
      border-radius:50%;
      object-fit:cover;
      border:2px solid rgba(116,198,255,.65)
    }
    .nexa-v589-passport-copy{
      display:grid;gap:3px;min-width:0
    }
    .nexa-v589-passport-copy span{
      font-size:10px;
      letter-spacing:.18em;
      color:#a98cff;
      font-weight:900
    }
    .nexa-v589-passport-copy strong{
      font-size:20px;color:white;
      overflow:hidden;text-overflow:ellipsis
    }
    .nexa-v589-passport-copy small{
      color:#9ca9c8;
      overflow:hidden;text-overflow:ellipsis
    }
    .nexa-v589-passport-hint{
      grid-column:1/-1;
      text-align:center;
      font-size:11px;
      color:#6dd8ff;
      letter-spacing:.08em;
      text-transform:uppercase
    }
  `;
  document.head.appendChild(style);
})();
