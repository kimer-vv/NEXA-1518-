(function(){
  const lang=()=>window.NEXA_I18N?.device?.()||'en';
  const tr=k=>window.NEXA_I18N?.t?.(lang(),k)||k;
  const map={LIVE:'live','View Event':'viewEvent',Apply:'apply','Apply →':'apply','View Prep':'viewPrep','Fill Prep':'fillPrep','Claim Account':'claimAccount','State Assignments':'stateAssignments','Puzzle & Presidency':'puzzlePresidency',Transfers:'transfers',TRANSFER:'transfers','Back Home':'backHome','My Submissions':'mySubmissions',Admin:'admin'};
  function walk(){document.querySelectorAll('a,button,.badge,.pill,.eyebrow,.nav-link').forEach(el=>{const raw=(el.textContent||'').trim();if(map[raw]&&!el.dataset.nexaUiI18n){el.textContent=tr(map[raw])+(raw.endsWith('→')?' →':'');el.dataset.nexaUiI18n='1';}})}
  document.addEventListener('DOMContentLoaded',()=>{try{window.NEXA_I18N?.setDir?.(lang());walk();new MutationObserver(walk).observe(document.body,{childList:true,subtree:true});}catch(_){}});
})();

/* Account Constellation: one source of truth = public.player_accounts. */
(function(){
  'use strict';
  window.NEXA_CANONICAL_ACCOUNTS=true;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let accounts=[],loaded=false,loading=null,selectedId=null,tapTimer=null,lastTap={id:null,time:0};

  function db(){
    if(typeof supabaseClient!=='undefined') return supabaseClient;
    if(window.nexaAccountDataClient) return window.nexaAccountDataClient;
    if(!window.supabase?.createClient) return null;
    return window.nexaAccountDataClient=window.supabase.createClient('https://dfxcxboxrkfmrnsgpyin.supabase.co','sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-');
  }
  const tag=a=>a?.alliances?.tag||a?.custom_alliance_tag||'Not Listed';
  const avatar=a=>a?.profile_photo_url||'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+'&background=111a38&color=cabaff&bold=true&size=256';
  const active=()=>accounts.find(a=>a.is_main===true)||accounts[0]||null;
  const accountKind=a=>a?.is_main?'main':String(a?.account_purpose||'full').toLowerCase()==='buff_points'?'points':'full';
  const accountLabel=a=>accountKind(a)==='main'?'MAIN ACCOUNT':accountKind(a)==='points'?'POINTS ACCOUNT':'FULL ACCOUNT';

  function diagnostic(code,detail){
    console.error('NEXA '+code,detail||'');
    let box=$('nexa-account-diagnostic');
    if(!box){
      box=document.createElement('div');
      box.id='nexa-account-diagnostic';
      box.className='form-message error';
      ($('nexa-account-constellation')||$('accounts-modal')||document.body).appendChild(box);
    }
    box.textContent='NEXA DIAGNOSTIC '+code+(detail?' · '+detail:'');
  }

  async function load(force=false){
    if(loading) return loading;
    if(loaded&&!force) return accounts;
    const previous=accounts;
    loading=(async()=>{
      const client=db(); if(!client) return [];
      const {data:{user},error:userError}=await client.auth.getUser();
      if(userError||!user){
        if(previous.length) return previous;
        accounts=[];loaded=true;return accounts;
      }
      const {data,error}=await client.from('player_accounts')
        .select('id,user_id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url,created_at,alliances(tag)')
        .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at',{ascending:true});
      if(error) throw error;
      accounts=Array.isArray(data)?data:[];loaded=true;window.nexaAccountsCache=accounts;syncHome();return accounts;
    })().catch(error=>{diagnostic('ACCT-LOAD-01',error?.message||String(error));accounts=previous;loaded=previous.length>0;return accounts;}).finally(()=>{loading=null;});
    return loading;
  }

  function syncHome(){
    const a=active(),photo=$('nexa-profile-launcher-photo'),name=$('nexa-profile-launcher-name'),badge=$('nexa-profile-launcher-badge'),count=$('nexa-profile-launcher-count');
    if(!a){if(name)name.textContent='ADD ACCOUNT';if(badge)badge.textContent='PROFILE';count?.classList.add('hidden');return;}
    if(photo)photo.src=avatar(a);
    if(name)name.textContent=(a.in_game_name||'PLAYER').toUpperCase()+' • '+tag(a).toUpperCase()+' • ID '+(a.player_id||'');
    if(badge)badge.textContent='ACTIVE';
    if(count){count.textContent=accounts.length+'/5';count.classList.toggle('hidden',accounts.length<2);}
  }

  function passport(a){
    if(!a)return;
    selectedId=a.id;
    let modal=$('nexa-passport-modal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='nexa-passport-modal';
      modal.setAttribute('aria-hidden','true');
      document.body.appendChild(modal);
    }
    const type=accountLabel(a);
    modal.innerHTML=`
      <div class="nexa-passport-backdrop" data-close-passport></div>
      <section class="nexa-passport-book" role="dialog" aria-modal="true" aria-label="NEXA Profile Passport">
        <header class="nexa-passport-header">
          <div><span>NEXA</span><strong>DIGITAL PROFILE PASSPORT</strong></div>
          <button type="button" data-close-passport aria-label="Close passport">×</button>
        </header>
        <div class="nexa-passport-pages">
          <div class="nexa-passport-identity">
            <div class="nexa-passport-seal">NEXA<br><small>1518</small></div>
            <img src="${esc(avatar(a))}" alt="">
            <h2>${esc(a.in_game_name||'PLAYER')}</h2>
            <span class="nexa-passport-type">${esc(type)}</span>
            <small>ACCOUNT HOLDER</small>
          </div>
          <div class="nexa-passport-data">
            <div class="nexa-passport-code">NX-${esc(String(a.player_id||'').slice(-6)||'000000')}</div>
            <div class="nexa-passport-field wide"><span>IN-GAME NAME</span><strong>${esc(a.in_game_name||'—')}</strong></div>
            <div class="nexa-passport-field"><span>GAME ID</span><strong>${esc(a.player_id||'—')}</strong></div>
            <div class="nexa-passport-field"><span>ALLIANCE</span><strong>${esc(tag(a))}</strong></div>
            <div class="nexa-passport-field"><span>ROLE</span><strong>${esc(a.alliance_role||'R3')}</strong></div>
            <div class="nexa-passport-field"><span>FURNACE LEVEL</span><strong>${esc(a.furnace_level||'Not set')}</strong></div>
            <div class="nexa-passport-field"><span>POWER</span><strong>${a.power?Number(a.power).toLocaleString():'Not set'}</strong></div>
            <div class="nexa-passport-field"><span>DEPLOYMENT BASE</span><strong>${a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'Not set'}</strong></div>
            <div class="nexa-passport-machine">NEXA&lt;${esc(String(a.in_game_name||'PLAYER').toUpperCase().replace(/\s+/g,'&lt;'))}&lt;&lt;${esc(a.player_id||'000000')}</div>
          </div>
        </div>
        <footer class="nexa-passport-actions">
          <button type="button" data-open-full-profile>OPEN PLAYER INTELLIGENCE PROFILE</button>
        </footer>
      </section>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }

  function openFullProfile(a){
    if(!a)return;
    const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
    set('nexa-profile-name',(a.in_game_name||'PLAYER').toUpperCase());
    set('nexa-profile-player-id',a.player_id||'');
    set('nexa-profile-alliance',tag(a));
    set('nexa-profile-role',a.alliance_role||'R3');
    set('nexa-profile-type',a.is_main?'MAIN':String(a.account_purpose||'full').toUpperCase());
    set('nexa-profile-furnace',a.furnace_level||'—');
    set('nexa-profile-power',a.power?Number(a.power).toLocaleString():'—');
    set('nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
    const photo=$('nexa-profile-photo');if(photo)photo.src=avatar(a);
    $('nexa-passport-modal')?.classList.remove('open');
    $('nexa-account-constellation')?.classList.remove('open');
    const profile=$('nexa-profile-modal');
    profile?.classList.add('open');
    profile?.setAttribute('aria-hidden','false');
  }

  function render(){
    const system=$('nexa-constellation-system');if(!system)return;
    const main=active(),others=main?accounts.filter(a=>a.id!==main.id):[],positions=[[82,31],[79,72],[21,72],[18,31]];
    let html='<span class="nexa-space-stars"></span><span class="nexa-space-planet planet-a"></span><span class="nexa-space-planet planet-b"></span><span class="nexa-space-planet planet-c"></span><span class="nexa-constellation-orbit orbit-three"></span><span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';
    if(main)html+=`<button type="button" class="nexa-account-planet main type-main" data-account-constellation-id="${esc(main.id)}"><img src="${esc(avatar(main))}" alt=""><span class="nexa-account-planet-name">${esc(main.in_game_name)}</span><span class="nexa-account-planet-type">MAIN ACCOUNT</span></button>`;
    others.forEach((a,i)=>{const p=positions[i%positions.length],kind=accountKind(a);html+=`<button type="button" class="nexa-account-planet alt type-${kind}" style="left:${p[0]}%;top:${p[1]}%" data-account-constellation-id="${esc(a.id)}"><img src="${esc(avatar(a))}" alt=""><span class="nexa-account-planet-name">${esc(a.in_game_name)}</span><span class="nexa-account-planet-type">${accountLabel(a)}</span></button>`;});
    if(accounts.length<5){const p=positions[Math.min(others.length,positions.length-1)]||[50,14];html+=`<button type="button" id="nexa-constellation-add-account" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%"><span class="nexa-add-planet-symbol">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span></button>`;}
    system.innerHTML=html;
  }

  async function openConstellation(){
    const modal=$('nexa-account-constellation');
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden','false');
    selectedId=null;
    if(accounts.length) render();
    await load(!accounts.length);
    render();
  }
  async function loadAlliances(){
    const select=$('alliance');if(!select)return;
    const {data,error}=await db().from('alliances').select('id,tag').eq('is_active',true).order('tag');
    if(error){diagnostic('ALLY-LOAD-01',error.message);return;}
    select.innerHTML='<option value="">Select alliance</option>'+
      (data||[]).map(a=>'<option value="'+esc(a.id)+'">'+esc(a.tag)+'</option>').join('')+
      '<option value="not-listed">Not Listed</option>';
    if(!(data||[]).length)diagnostic('ALLY-EMPTY-02','Supabase returned 0 active alliances');
  }
  async function openAccounts(){
    $('nexa-account-constellation')?.classList.remove('open');
    const button=$('open-accounts');
    if(button)button.click();
    else{const modal=$('accounts-modal');modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');}
    await loadAlliances();
  }
  async function setActive(id){
    const account=accounts.find(a=>String(a.id)===String(id));if(!account||account.is_main)return;
    const {error}=await db().rpc('set_active_player_account',{p_account_id:account.id});
    if(error){diagnostic('ACCT-ACTIVE-03',error.message);return;}
    await load(true);selectedId=account.id;render();
  }

  document.addEventListener('click',async event=>{
    if(event.target.closest?.('[data-close-passport]')){event.preventDefault();$('nexa-passport-modal')?.classList.remove('open');$('nexa-passport-modal')?.setAttribute('aria-hidden','true');return;}
    if(event.target.closest?.('[data-open-full-profile]')){event.preventDefault();openFullProfile(accounts.find(a=>a.id===selectedId));return;}
    if(event.target.closest?.('#nexa-profile-launcher')){event.preventDefault();event.stopImmediatePropagation();await openConstellation();return;}
    if(event.target.closest?.('#nexa-constellation-add-account')){event.preventDefault();event.stopImmediatePropagation();await openAccounts();return;}
    const planet=event.target.closest?.('[data-account-constellation-id]');if(!planet)return;
    event.preventDefault();event.stopImmediatePropagation();const id=planet.dataset.accountConstellationId,now=Date.now();
    if(lastTap.id===id&&now-lastTap.time<430){clearTimeout(tapTimer);tapTimer=null;lastTap={id:null,time:0};await setActive(id);return;}
    lastTap={id,time:now};clearTimeout(tapTimer);tapTimer=setTimeout(()=>{passport(accounts.find(a=>String(a.id)===String(id)));tapTimer=null;},220);
  },true);
  document.addEventListener('dblclick',async event=>{const planet=event.target.closest?.('[data-account-constellation-id]');if(!planet)return;event.preventDefault();event.stopImmediatePropagation();clearTimeout(tapTimer);await setActive(planet.dataset.accountConstellationId);},true);
  document.addEventListener('DOMContentLoaded',async()=>{await load(true);try{db()?.auth?.onAuthStateChange?.(()=>{loaded=false;setTimeout(()=>load(true),100);});}catch(_){}});
  window.NEXA_OPEN_ACCOUNT_CONSTELLATION=openConstellation;
  window.NEXA_OPEN_ACCOUNTS=openAccounts;
  window.nexaLoadHomeAccountCards=async()=>{await load(true);if($('nexa-account-constellation')?.classList.contains('open'))render();return accounts;};

  const style=document.createElement('style');style.textContent=`
    #nexa-constellation-system .nexa-account-planet{z-index:5}
    #nexa-constellation-system .nexa-account-planet.main{z-index:7}
    #nexa-constellation-system .nexa-account-planet.main img{object-fit:cover}
    #nexa-account-constellation .nexa-constellation-stage{background:radial-gradient(circle at 50% 45%,rgba(74,47,148,.17),transparent 34%),radial-gradient(circle at 12% 18%,rgba(35,116,181,.09),transparent 22%),linear-gradient(180deg,rgba(2,4,18,.94),rgba(2,5,20,.985))}
    #nexa-constellation-system{isolation:isolate}
    #nexa-constellation-system:before{content:"";position:absolute;inset:-18%;z-index:-3;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.72) 0 1px,transparent 1.5px),radial-gradient(circle,rgba(119,188,255,.5) 0 1px,transparent 1.6px);background-size:47px 47px,73px 73px;background-position:9px 17px,31px 4px;opacity:.32;animation:nexaStarDrift 28s linear infinite}
    @keyframes nexaStarDrift{to{background-position:56px 64px,104px 77px}}
    .nexa-space-stars{position:absolute;inset:0;border-radius:50%;z-index:-2;pointer-events:none;background:radial-gradient(circle at 21% 31%,#fff 0 1px,transparent 2px),radial-gradient(circle at 71% 19%,#69c9ff 0 1px,transparent 2px),radial-gradient(circle at 83% 66%,#d68cff 0 1px,transparent 2px),radial-gradient(circle at 35% 81%,#fff 0 1px,transparent 2px)}
    .nexa-space-planet{position:absolute;z-index:-1;border-radius:50%;pointer-events:none;box-shadow:inset -7px -5px 12px rgba(0,0,0,.48),0 0 14px currentColor}
    .nexa-space-planet.planet-a{width:22px;height:22px;left:9%;top:18%;color:#a961ff;background:radial-gradient(circle at 32% 28%,#d9a7ff,#6321a6 64%,#190d3f)}
    .nexa-space-planet.planet-b{width:34px;height:34px;right:7%;top:9%;color:#436dff;background:radial-gradient(circle at 32% 28%,#8cbaff,#314caa 62%,#111c57)}
    .nexa-space-planet.planet-c{width:16px;height:16px;right:15%;bottom:12%;color:#50d6c8;background:radial-gradient(circle at 32% 28%,#a5fff1,#218a87 64%,#0a3e4a)}
    #nexa-constellation-system .nexa-constellation-orbit.orbit-three{width:94%;height:94%;border-style:dashed;opacity:.38;animation:nexaOrbitClockwise 52s linear infinite}
    #nexa-constellation-system .nexa-constellation-orbit.one{animation:nexaOrbitClockwise 24s linear infinite}
    #nexa-constellation-system .nexa-constellation-orbit.two{animation:nexaOrbitCounter 38s linear infinite}
    @keyframes nexaOrbitClockwise{to{transform:translate(-50%,-50%) rotate(360deg)}}
    @keyframes nexaOrbitCounter{to{transform:translate(-50%,-50%) rotate(-360deg)}}
    #nexa-constellation-system .nexa-account-planet.type-main img{border-color:#ff66dc;box-shadow:0 0 0 5px rgba(255,73,209,.1),0 0 34px rgba(255,73,209,.38)}
    #nexa-constellation-system .nexa-account-planet.type-main .nexa-account-planet-type{color:#ff86e2;border-color:rgba(255,87,215,.42);background:rgba(160,28,134,.22)}
    #nexa-constellation-system .nexa-account-planet.type-full img{border-color:#8b79ff;box-shadow:0 0 26px rgba(114,95,255,.3)}
    #nexa-constellation-system .nexa-account-planet.type-full .nexa-account-planet-type{color:#ad9cff}
    #nexa-constellation-system .nexa-account-planet.type-points img{border-color:#55e3c4;filter:saturate(.88) hue-rotate(18deg);box-shadow:0 0 28px rgba(57,222,181,.34)}
    #nexa-constellation-system .nexa-account-planet.type-points .nexa-account-planet-type{color:#6cf0c8}
    #nexa-passport-modal{display:none;position:fixed;inset:0;z-index:10040;overflow:auto;padding:24px 14px 80px}
    #nexa-passport-modal.open{display:block}
    .nexa-passport-backdrop{position:fixed;inset:0;background:rgba(1,3,14,.9);backdrop-filter:blur(12px)}
    .nexa-passport-book{position:relative;width:min(760px,100%);margin:6vh auto 0;border:1px solid rgba(153,113,255,.62);border-radius:26px;overflow:hidden;color:#f7f4ff;background:radial-gradient(circle at 18% 14%,rgba(111,73,220,.24),transparent 30%),linear-gradient(145deg,#101631,#070b1c 72%);box-shadow:0 28px 90px rgba(0,0,0,.62),0 0 48px rgba(96,72,255,.18)}
    .nexa-passport-book:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.17;background-image:repeating-linear-gradient(45deg,transparent 0 15px,rgba(143,119,255,.16) 16px 17px)}
    .nexa-passport-header{position:relative;display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(139,111,255,.28);background:rgba(10,13,35,.72)}
    .nexa-passport-header div{display:grid;gap:3px}.nexa-passport-header span{font-size:11px;letter-spacing:.3em;color:#a98cff;font-weight:900}.nexa-passport-header strong{font-size:15px;letter-spacing:.1em}.nexa-passport-header button{width:40px;height:40px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.05);color:white;font-size:27px}
    .nexa-passport-pages{position:relative;display:grid;grid-template-columns:.78fr 1.22fr;min-height:390px}
    .nexa-passport-identity{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:34px 24px;border-right:1px solid rgba(139,111,255,.28);text-align:center}
    .nexa-passport-identity img{width:150px;height:150px;border-radius:50%;object-fit:cover;border:3px solid #9d77ff;box-shadow:0 0 0 8px rgba(122,85,255,.1),0 0 42px rgba(86,159,255,.24)}
    .nexa-passport-identity h2{margin:18px 0 7px;font-size:27px}.nexa-passport-identity>small{margin-top:12px;letter-spacing:.2em;color:#8997ba;font-size:9px}.nexa-passport-type{padding:5px 11px;border:1px solid rgba(94,195,255,.48);border-radius:999px;background:rgba(41,132,209,.18);color:#72d9ff;font-size:10px;letter-spacing:.12em}
    .nexa-passport-seal{position:absolute;left:20px;top:18px;width:58px;height:58px;display:grid;place-items:center;border:1px solid rgba(169,140,255,.26);border-radius:50%;color:rgba(191,173,255,.38);font-size:10px;letter-spacing:.12em;transform:rotate(-12deg)}.nexa-passport-seal small{font-size:8px}
    .nexa-passport-data{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:46px 26px 28px;align-content:center}
    .nexa-passport-code{position:absolute;right:24px;top:18px;color:#8d9ac0;font-family:monospace;letter-spacing:.12em}
    .nexa-passport-field{display:grid;gap:5px;padding:12px 13px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.025);min-width:0}.nexa-passport-field.wide{grid-column:1/-1}.nexa-passport-field span{font-size:9px;letter-spacing:.16em;color:#8e9ab8}.nexa-passport-field strong{font-size:15px;overflow:hidden;text-overflow:ellipsis}
    .nexa-passport-machine{grid-column:1/-1;margin-top:5px;padding-top:15px;border-top:1px dashed rgba(153,125,255,.3);color:#808db0;font-family:monospace;font-size:10px;letter-spacing:.08em;overflow:hidden;white-space:nowrap}
    .nexa-passport-actions{position:relative;padding:16px 20px 20px;border-top:1px solid rgba(139,111,255,.2);text-align:center}.nexa-passport-actions button{width:min(420px,100%);padding:13px 16px;border:1px solid rgba(127,100,255,.62);border-radius:14px;background:linear-gradient(135deg,rgba(106,67,221,.38),rgba(42,126,206,.2));color:white;font-weight:900;letter-spacing:.06em}
    @media(max-width:620px){.nexa-passport-book{margin-top:2vh}.nexa-passport-pages{grid-template-columns:1fr}.nexa-passport-identity{border-right:0;border-bottom:1px solid rgba(139,111,255,.28);padding:42px 20px 26px}.nexa-passport-identity img{width:126px;height:126px}.nexa-passport-data{padding:44px 18px 22px}.nexa-passport-header strong{font-size:12px}.nexa-passport-field strong{font-size:13px}}
  `;document.head.appendChild(style);
})();
