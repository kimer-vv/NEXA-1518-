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

/* NEXA v58.7 — SINGLE SOURCE ACCOUNT CONSTELLATION */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  let selectedId=null;
  let lastSignature='';

  function accounts(){
    const rows=Array.isArray(window.nexaAccountsCache)?window.nexaAccountsCache:[];
    return rows.filter(Boolean);
  }

  function mainAccount(rows){
    if(!rows.length) return null;
    const stored=localStorage.getItem('nexa_active_account_id');
    return rows.find(a=>String(a.id)===String(stored)) || rows.find(a=>a.is_main===true) || rows[0];
  }

  function avatar(a){
    return a?.profile_photo_url ||
      'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+
      '&background=111a38&color=cabaff&bold=true&size=256';
  }

  function purpose(a,isMain){
    if(isMain) return 'MAIN';
    const p=String(a?.account_purpose||'full').toLowerCase();
    return p==='full'?'FULL':'BASIC';
  }

  function syncHome(rows){
    const active=mainAccount(rows);
    if(!active) return;
    const img=$('nexa-profile-launcher-photo');
    const name=$('nexa-profile-launcher-name');
    const badge=$('nexa-profile-launcher-badge');
    const count=$('nexa-profile-launcher-count');
    if(img){img.src=avatar(active);img.style.display='block';}
    if(name) name.textContent=(active.in_game_name||'MY PROFILE').toUpperCase();
    if(badge) badge.textContent='MAIN';
    if(count){
      count.textContent=String(rows.length);
      count.classList.toggle('hidden',rows.length<2);
    }
  }

  function renderPassport(a){
    selectedId=a?.id||null;
    $('nexa-v587-passport')?.remove();
    const host=$('nexa-account-constellation');
    if(!host || !a) return;

    const alliance=a.custom_alliance_tag || a.alliances?.tag || 'Not Listed';
    const box=document.createElement('section');
    box.id='nexa-v587-passport';
    box.innerHTML=`
      <div class="nexa-v587-passport-card">
        <img src="${esc(avatar(a))}" alt="">
        <div class="nexa-v587-passport-copy">
          <span>PROFILE PASSPORT</span>
          <strong>${esc(a.in_game_name||'Account')}</strong>
          <small>${esc(alliance)}${a.player_id?' • ID '+esc(a.player_id):''}</small>
        </div>
        <div class="nexa-v587-passport-hint">Double tap to switch</div>
      </div>`;
    host.appendChild(box);
  }

  function render(){
    const rows=accounts();
    const system=$('nexa-constellation-system');
    if(!system) return;

    const sig=rows.map(a=>[a.id,a.in_game_name,a.is_main,a.profile_photo_url].join(':')).join('|')+'|'+localStorage.getItem('nexa_active_account_id');
    if(sig===lastSignature && system.querySelector('[data-nexa-v587-account]')) return;
    lastSignature=sig;

    syncHome(rows);

    const active=mainAccount(rows);
    const others=active?rows.filter(a=>String(a.id)!==String(active.id)):rows;
    const pos=[[82,30],[79,72],[21,72],[18,30]];

    let out='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';

    if(active){
      out+=`<button type="button" class="nexa-account-planet main" data-nexa-v587-account="${esc(active.id)}">
        <img src="${esc(avatar(active))}" alt="">
        <span class="nexa-account-planet-name">${esc(active.in_game_name||'Account')}</span>
        <span class="nexa-account-planet-type">MAIN</span>
      </button>`;
    }

    others.slice(0,4).forEach((a,i)=>{
      const p=pos[i];
      out+=`<button type="button" class="nexa-account-planet alt" style="left:${p[0]}%;top:${p[1]}%" data-nexa-v587-account="${esc(a.id)}">
        <img src="${esc(avatar(a))}" alt="">
        <span class="nexa-account-planet-name">${esc(a.in_game_name||'Account')}</span>
        <span class="nexa-account-planet-type">${purpose(a,false)}</span>
      </button>`;
    });

    if(rows.length<5){
      const p=pos[Math.min(others.length,3)]||[50,14];
      out+=`<button type="button" id="nexa-v587-add" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%">
        <span class="nexa-add-planet-symbol">+</span>
        <span class="nexa-account-planet-name">ADD ACCOUNT</span>
      </button>`;
    }

    system.innerHTML=out;
    const manage=$('nexa-constellation-manage');
    if(manage) manage.style.display='none';
    if(active && selectedId==null) renderPassport(active);
  }

  function openConstellation(){
    const modal=$('nexa-account-constellation');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
    lastSignature='';
    render();
    setTimeout(render,120);
    setTimeout(render,500);
  }

  function openAdd(){
    $('nexa-account-constellation')?.classList.remove('open');
    const modal=$('accounts-modal');
    if(modal){modal.classList.add('open');modal.setAttribute('aria-hidden','false');}
  }

  function switchAccount(id){
    const rows=accounts();
    const a=rows.find(x=>String(x.id)===String(id));
    if(!a) return;
    localStorage.setItem('nexa_active_account_id',String(a.id));
    selectedId=a.id;
    lastSignature='';
    render();
  }

  let lastTapId=null,lastTapAt=0;
  document.addEventListener('click',function(e){
    const launcher=e.target.closest?.('#nexa-profile-launcher');
    if(launcher){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      openConstellation();
      return;
    }

    const add=e.target.closest?.('#nexa-v587-add');
    if(add){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      openAdd();
      return;
    }

    const planet=e.target.closest?.('[data-nexa-v587-account]');
    if(planet){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const id=planet.getAttribute('data-nexa-v587-account');
      const rows=accounts();
      const a=rows.find(x=>String(x.id)===String(id));
      const now=Date.now();
      if(lastTapId===id && now-lastTapAt<430){
        lastTapId=null;lastTapAt=0;
        switchAccount(id);
      }else{
        lastTapId=id;lastTapAt=now;
        renderPassport(a);
      }
      return;
    }
  },true);

  document.addEventListener('dblclick',function(e){
    const planet=e.target.closest?.('[data-nexa-v587-account]');
    if(!planet) return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    switchAccount(planet.getAttribute('data-nexa-v587-account'));
  },true);

  const style=document.createElement('style');
  style.textContent=`
    #nexa-constellation-system .nexa-account-planet{z-index:4}
    #nexa-constellation-system .nexa-constellation-orbit.one{animation:nexaV587Spin 28s linear infinite}
    #nexa-constellation-system .nexa-constellation-orbit.two{animation:nexaV587SpinReverse 40s linear infinite}
    @keyframes nexaV587Spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes nexaV587SpinReverse{to{transform:translate(-50%,-50%) rotate(-360deg)}}
    #nexa-v587-passport{width:min(520px,calc(100% - 34px));margin:24px auto 80px;position:relative;z-index:5}
    .nexa-v587-passport-card{display:grid;grid-template-columns:62px 1fr;gap:12px;align-items:center;padding:14px;border:1px solid rgba(119,87,246,.5);border-radius:20px;background:rgba(13,18,42,.82);box-shadow:0 18px 50px rgba(0,0,0,.28)}
    .nexa-v587-passport-card img{width:62px;height:62px;border-radius:50%;object-fit:cover;border:2px solid rgba(116,198,255,.65)}
    .nexa-v587-passport-copy{display:grid;gap:3px;min-width:0}
    .nexa-v587-passport-copy span{font-size:10px;letter-spacing:.18em;color:#a98cff;font-weight:900}
    .nexa-v587-passport-copy strong{font-size:20px;color:white;overflow:hidden;text-overflow:ellipsis}
    .nexa-v587-passport-copy small{color:#9ca9c8;overflow:hidden;text-overflow:ellipsis}
    .nexa-v587-passport-hint{grid-column:1/-1;text-align:center;font-size:11px;color:#6dd8ff;letter-spacing:.08em;text-transform:uppercase}
  `;
  document.head.appendChild(style);

  function heartbeat(){
    const rows=accounts();
    if(rows.length) syncHome(rows);
    const modal=$('nexa-account-constellation');
    if(modal?.classList.contains('open')) render();
  }
  setInterval(heartbeat,700);
  window.addEventListener('pageshow',()=>setTimeout(heartbeat,120));
})();
