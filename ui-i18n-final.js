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

  async function load(force=false){
    if(loading) return loading;
    if(loaded&&!force) return accounts;
    loading=(async()=>{
      const client=db(); if(!client) return [];
      const {data:{user},error:userError}=await client.auth.getUser();
      if(userError||!user){accounts=[];loaded=true;return accounts;}
      const {data,error}=await client.from('player_accounts')
        .select('id,user_id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url,created_at,alliances(tag)')
        .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at',{ascending:true});
      if(error) throw error;
      accounts=Array.isArray(data)?data:[];loaded=true;window.nexaAccountsCache=accounts;syncHome();return accounts;
    })().catch(error=>{console.error('NEXA Account Constellation:',error);accounts=[];loaded=false;return accounts;}).finally(()=>{loading=null;});
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
    selectedId=a?.id||null;$('nexa-account-passport')?.remove();
    const modal=$('nexa-account-constellation');if(!modal||!a)return;
    const section=document.createElement('section');section.id='nexa-account-passport';
    section.innerHTML=`<div class="nexa-account-passport-card"><img src="${esc(avatar(a))}" alt=""><div class="nexa-account-passport-copy"><span>PROFILE PASSPORT</span><strong>${esc(a.in_game_name||'PLAYER')}</strong><small>${esc(tag(a))} • ID ${esc(a.player_id||'')}</small></div><div class="nexa-account-passport-hint">Double tap to make active</div></div>`;
    modal.appendChild(section);
  }

  function render(){
    const system=$('nexa-constellation-system');if(!system)return;
    const main=active(),others=main?accounts.filter(a=>a.id!==main.id):[],positions=[[82,31],[79,72],[21,72],[18,31]];
    let html='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';
    if(main)html+=`<button type="button" class="nexa-account-planet main" data-account-constellation-id="${esc(main.id)}"><img src="${esc(avatar(main))}" alt=""><span class="nexa-account-planet-name">${esc(main.in_game_name)}</span><span class="nexa-account-planet-type">ACTIVE</span></button>`;
    others.forEach((a,i)=>{const p=positions[i%positions.length];html+=`<button type="button" class="nexa-account-planet alt" style="left:${p[0]}%;top:${p[1]}%" data-account-constellation-id="${esc(a.id)}"><img src="${esc(avatar(a))}" alt=""><span class="nexa-account-planet-name">${esc(a.in_game_name)}</span><span class="nexa-account-planet-type">ACCOUNT</span></button>`;});
    if(accounts.length<5){const p=positions[Math.min(others.length,positions.length-1)]||[50,14];html+=`<button type="button" id="nexa-constellation-add-account" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%"><span class="nexa-add-planet-symbol">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span></button>`;}
    system.innerHTML=html;if(main)passport(accounts.find(a=>a.id===selectedId)||main);
  }

  async function openConstellation(){const modal=$('nexa-account-constellation');modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');selectedId=null;await load(true);render();}
  function openAccounts(){$('nexa-account-constellation')?.classList.remove('open');const button=$('open-accounts');if(button){button.click();return;}const modal=$('accounts-modal');modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');}
  async function setActive(id){
    const account=accounts.find(a=>String(a.id)===String(id));if(!account||account.is_main)return;
    const {error}=await db().rpc('set_active_player_account',{p_account_id:account.id});
    if(error){console.error('NEXA active account:',error);alert(error.message);return;}
    await load(true);selectedId=account.id;render();
  }

  document.addEventListener('click',async event=>{
    if(event.target.closest?.('#nexa-profile-launcher')){event.preventDefault();event.stopImmediatePropagation();await openConstellation();return;}
    if(event.target.closest?.('#nexa-constellation-add-account')){event.preventDefault();event.stopImmediatePropagation();openAccounts();return;}
    const planet=event.target.closest?.('[data-account-constellation-id]');if(!planet)return;
    event.preventDefault();event.stopImmediatePropagation();const id=planet.dataset.accountConstellationId,now=Date.now();
    if(lastTap.id===id&&now-lastTap.time<430){clearTimeout(tapTimer);tapTimer=null;lastTap={id:null,time:0};await setActive(id);return;}
    lastTap={id,time:now};clearTimeout(tapTimer);tapTimer=setTimeout(()=>{passport(accounts.find(a=>String(a.id)===String(id)));tapTimer=null;},220);
  },true);
  document.addEventListener('dblclick',async event=>{const planet=event.target.closest?.('[data-account-constellation-id]');if(!planet)return;event.preventDefault();event.stopImmediatePropagation();clearTimeout(tapTimer);await setActive(planet.dataset.accountConstellationId);},true);
  document.addEventListener('DOMContentLoaded',async()=>{await load(true);try{db()?.auth?.onAuthStateChange?.(()=>{loaded=false;setTimeout(()=>load(true),100);});}catch(_){}});
  window.nexaLoadHomeAccountCards=async()=>{await load(true);if($('nexa-account-constellation')?.classList.contains('open'))render();return accounts;};

  const style=document.createElement('style');style.textContent=`#nexa-constellation-system .nexa-account-planet{z-index:5}#nexa-account-passport{width:min(520px,calc(100% - 34px));margin:24px auto 80px;position:relative;z-index:8}.nexa-account-passport-card{display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center;padding:14px;border:1px solid rgba(119,87,246,.5);border-radius:20px;background:rgba(13,18,42,.9);box-shadow:0 18px 50px rgba(0,0,0,.28)}.nexa-account-passport-card img{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid rgba(116,198,255,.65)}.nexa-account-passport-copy{display:grid;gap:3px;min-width:0}.nexa-account-passport-copy span{font-size:10px;letter-spacing:.18em;color:#a98cff;font-weight:900}.nexa-account-passport-copy strong{font-size:20px;color:white;overflow:hidden;text-overflow:ellipsis}.nexa-account-passport-copy small{color:#9ca9c8;overflow:hidden;text-overflow:ellipsis}.nexa-account-passport-hint{grid-column:1/-1;text-align:center;font-size:11px;color:#6dd8ff;letter-spacing:.08em;text-transform:uppercase}`;document.head.appendChild(style);
})();
