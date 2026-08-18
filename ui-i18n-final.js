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
   document.querySelectorAll("h1,h2,h3,p,div,span").forEach(el=>{
     if(el.children.length) return;
     const s=(el.textContent||"").trim();
     const m=s.match(/^SvS against\s+(.+)$/i);
     if(m && !el.dataset.nexaUiI18n){
       el.textContent=tr("svsAgainst").replace("{state}",m[1]);
       el.dataset.nexaUiI18n="1";
     }
   });
 }
 document.addEventListener("DOMContentLoaded",()=>{
   NEXA_I18N.setDir(L()); walk();
   new MutationObserver(walk).observe(document.body,{childList:true,subtree:true});
 });
})();

/* =========================================================
   NEXA v58.2 — PROFILE / CONSTELLATION / ALLIANCES FIX
   Loaded after lang.js so this safely overrides the old mobile
   profile handlers without touching the working HOME / TOOLS.
   ========================================================= */
(function(){
  'use strict';

  const PROJECT_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
  const PROJECT_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  function sbClient(){
    if(window.supabaseClient?.auth) return window.supabaseClient;
    if(window.__nexaProfileSb) return window.__nexaProfileSb;
    if(window.supabase?.createClient){
      window.__nexaProfileSb=window.supabase.createClient(PROJECT_URL,PROJECT_KEY);
      return window.__nexaProfileSb;
    }
    return null;
  }

  async function getUser(){
    const sb=sbClient();
    if(!sb) return null;
    try{
      const {data}=await sb.auth.getUser();
      return data?.user||null;
    }catch(_){
      return null;
    }
  }

  async function loadMyAccounts(){
    const sb=sbClient();
    const user=await getUser();
    if(!sb||!user) return [];

    try{
      const {data,error}=await sb.rpc('get_my_player_accounts');

      if(error) throw error;
      return data||[];
    }catch(error){
      console.warn('NEXA v58.2 accounts:',error?.message||error);
      return [];
    }
  }

  function avatar(account){
    return account?.profile_photo_url ||
      'https://ui-avatars.com/api/?name='+
      encodeURIComponent(account?.in_game_name||'NEXA')+
      '&background=111a38&color=cabaff&bold=true&size=256';
  }

  function renderConstellation(accounts){
    const system=$('nexa-constellation-system');
    if(!system) return;

    const rows=Array.isArray(accounts)?accounts:[];
    const positions=[
      [50,14],[82,33],[84,67],
      [50,86],[16,67],[18,33]
    ];

    let html=
      '<span class="nexa-constellation-orbit one"></span>'+
      '<span class="nexa-constellation-orbit two"></span>';

    if(rows.length){
      const main=rows.find(a=>a.is_main===true)||rows[0];
      const others=rows.filter(a=>String(a.id)!==String(main.id));

      html+=
        '<button type="button" class="nexa-account-planet main" data-v582-account="'+esc(main.id)+'">'+
          '<img src="'+esc(avatar(main))+'" alt="">'+
          '<span class="nexa-account-planet-name">'+esc(main.in_game_name||'Main Account')+'</span>'+
          '<span class="nexa-account-planet-type">MAIN</span>'+
        '</button>';

      others.forEach((account,index)=>{
        const p=positions[index%positions.length];
        html+=
          '<button type="button" class="nexa-account-planet alt" '+
          'style="left:'+p[0]+'%;top:'+p[1]+'%" data-v582-account="'+esc(account.id)+'">'+
            '<img src="'+esc(avatar(account))+'" alt="">'+
            '<span class="nexa-account-planet-name">'+esc(account.in_game_name||'Account')+'</span>'+
            '<span class="nexa-account-planet-type">'+
              (String(account.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC')+
            '</span>'+
          '</button>';
      });
    }

    if(rows.length<5){
      const p=positions[Math.max(0,rows.length-1)%positions.length];
      html+=
        '<button type="button" id="nexa-v582-add-account" class="nexa-account-planet alt nexa-add-planet" '+
        'style="left:'+p[0]+'%;top:'+p[1]+'%">'+
          '<span class="nexa-add-planet-symbol">+</span>'+
          '<span class="nexa-account-planet-name">ADD ACCOUNT</span>'+
        '</button>';
    }

    system.innerHTML=html;

    const legacyManage=$('nexa-constellation-manage');
    if(legacyManage) legacyManage.style.display='none';
  }

  async function openConstellation(){
    const modal=$('nexa-account-constellation');
    if(!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    renderConstellation(await loadMyAccounts());
  }

  function findAllianceSelect(){
    return $('alliance-select') ||
      $('alliance') ||
      document.querySelector('#accounts-modal select[name="alliance_id"]') ||
      Array.from(document.querySelectorAll('#accounts-modal select')).find(select=>{
        const key=((select.id||'')+' '+(select.name||'')).toLowerCase();
        return key.includes('alliance');
      });
  }

  async function populateAlliances(){
    const sb=sbClient();
    const select=findAllianceSelect();
    if(!sb||!select) return;

    select.innerHTML='<option value="">Loading alliances...</option>';

    try{
      const {data,error}=await sb.rpc('get_public_nexa_alliances');

      if(error) throw error;

      select.innerHTML=
        '<option value="">Select alliance</option>'+
        (data||[]).map(a=>
          '<option value="'+esc(a.id)+'">'+esc(a.tag)+'</option>'
        ).join('')+
        '<option value="not-listed">Not Listed</option>';
    }catch(error){
      console.warn('NEXA v58.2 alliances:',error?.message||error);
      select.innerHTML=
        '<option value="">Alliance unavailable</option>'+
        '<option value="not-listed">Not Listed</option>';
    }
  }

  function fixTimezone(){
    const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    const display=$('timezone-display');
    const offset=$('timezone-offset');

    if(display) display.textContent=zone;

    if(offset){
      try{
        const part=new Intl.DateTimeFormat('en-US',{
          timeZone:zone,
          timeZoneName:'shortOffset',
          hour:'2-digit'
        }).formatToParts(new Date()).find(p=>p.type==='timeZoneName');

        offset.textContent=(part?.value||'').replace('GMT','UTC');
      }catch(_){
        offset.textContent='';
      }
    }
  }

  async function openAddAccount(){
    const constellation=$('nexa-account-constellation');
    if(constellation){
      constellation.classList.remove('open');
      constellation.setAttribute('aria-hidden','true');
    }

    const modal=$('accounts-modal');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }

    fixTimezone();
    await populateAlliances();
  }

  async function getAllianceTag(account){
    if(account?.custom_alliance_tag) return account.custom_alliance_tag;
    if(!account?.alliance_id) return 'Not Listed';

    const sb=sbClient();
    if(!sb) return 'Not Listed';

    try{
      const {data}=await sb
        .from('alliances')
        .select('tag')
        .eq('id',account.alliance_id)
        .maybeSingle();

      return data?.tag||'Not Listed';
    }catch(_){
      return 'Not Listed';
    }
  }

  async function openAccountProfile(accountId){
    const rows=await loadMyAccounts();
    const account=rows.find(a=>String(a.id)===String(accountId));
    if(!account) return;

    const setText=(id,value)=>{
      const el=$(id);
      if(el) el.textContent=value;
    };

    setText('nexa-profile-name',(account.in_game_name||'PLAYER').toUpperCase());
    setText('nexa-profile-player-id',account.player_id||'');
    setText('nexa-profile-alliance',await getAllianceTag(account));
    setText('nexa-profile-role',account.alliance_role||'R3');
    setText('nexa-profile-type',
      account.is_main===true
        ? 'MAIN'
        : (String(account.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC')
    );
    setText('nexa-profile-furnace',account.furnace_level||'—');
    setText('nexa-profile-power',
      account.power ? Number(account.power).toLocaleString() : '—'
    );
    setText('nexa-profile-deployment',
      account.deployment_capacity
        ? Number(account.deployment_capacity).toLocaleString()
        : '—'
    );

    const photo=$('nexa-profile-photo');
    if(photo) photo.src=avatar(account);

    const constellation=$('nexa-account-constellation');
    if(constellation){
      constellation.classList.remove('open');
      constellation.setAttribute('aria-hidden','true');
    }

    const profile=$('nexa-profile-modal');
    if(profile){
      profile.classList.add('open');
      profile.setAttribute('aria-hidden','false');
    }
  }

  function replaceProfileLauncher(){
    const old=$('nexa-profile-launcher');
    if(!old || old.dataset.v582==='1') return;

    const fresh=old.cloneNode(true);
    fresh.dataset.v582='1';
    old.replaceWith(fresh);

    fresh.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      openConstellation();
    },true);
  }

  function install(){
    replaceProfileLauncher();
    fixTimezone();

    document.addEventListener('click',event=>{
      const add=event.target.closest?.('#nexa-v582-add-account');
      if(add){
        event.preventDefault();
        event.stopImmediatePropagation();
        openAddAccount();
        return;
      }

      const planet=event.target.closest?.('[data-v582-account]');
      if(planet){
        event.preventDefault();
        event.stopImmediatePropagation();
        openAccountProfile(planet.getAttribute('data-v582-account'));
      }
    },true);

    setTimeout(replaceProfileLauncher,500);
    setTimeout(fixTimezone,600);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  }else{
    install();
  }
})();
