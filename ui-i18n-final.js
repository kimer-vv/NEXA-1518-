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

/* ============================================================
   NEXA v58.5 — DIRECT PROFILE BOOTSTRAP
   One-file fix. Does NOT depend on another /api file.
   Reads the existing Supabase auth token directly and calls one
   authenticated RPC that returns BOTH accounts + alliances.
   ============================================================ */
(function(){
  'use strict';

  const SUPABASE_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
  const SUPABASE_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  let bootstrapCache=null;
  let bootstrapAt=0;

  function accessToken(){
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i)||'';
        if(!/^sb-.*-auth-token$/.test(key)) continue;
        const raw=localStorage.getItem(key);
        if(!raw) continue;
        const parsed=JSON.parse(raw);
        const token=parsed?.access_token || parsed?.currentSession?.access_token;
        if(token) return token;
      }
    }catch(_){}
    return '';
  }

  async function bootstrap(force=false){
    if(!force && bootstrapCache && Date.now()-bootstrapAt<15000) return bootstrapCache;

    const token=accessToken();
    if(!token) throw new Error('NEXA session not found.');

    const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/get_nexa_profile_bootstrap',{
      method:'POST',
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:'Bearer '+token,
        'Content-Type':'application/json'
      },
      body:'{}',
      cache:'no-store'
    });

    const raw=await r.text();
    let data={};
    try{data=raw?JSON.parse(raw):{};}catch(_){}
    if(!r.ok) throw new Error(data?.message||data?.error||raw||'Could not load profile.');

    bootstrapCache={
      accounts:Array.isArray(data?.accounts)?data.accounts:[],
      alliances:Array.isArray(data?.alliances)?data.alliances:[]
    };
    bootstrapAt=Date.now();
    return bootstrapCache;
  }

  function avatar(a){
    return a?.profile_photo_url ||
      'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+
      '&background=111a38&color=cabaff&bold=true&size=256';
  }

  function allianceTag(account, alliances){
    if(account?.custom_alliance_tag) return account.custom_alliance_tag;
    if(!account?.alliance_id) return 'Not Listed';
    return alliances.find(a=>String(a.id)===String(account.alliance_id))?.tag || 'Not Listed';
  }

  function renderConstellation(payload){
    const system=$('nexa-constellation-system');
    if(!system) return;

    const accounts=payload.accounts||[];
    const positions=[[82,32],[82,68],[18,68],[18,32]];

    let html=
      '<span class="nexa-constellation-orbit one"></span>'+
      '<span class="nexa-constellation-orbit two"></span>';

    if(accounts.length){
      const main=accounts.find(a=>a.is_main===true)||accounts[0];
      const others=accounts.filter(a=>String(a.id)!==String(main.id));

      html+=
        '<button type="button" class="nexa-account-planet main" data-nexa-v585-profile="'+esc(main.id)+'">'+
          '<img src="'+esc(avatar(main))+'" alt="">'+
          '<span class="nexa-account-planet-name">'+esc(main.in_game_name||'Main Account')+'</span>'+
          '<span class="nexa-account-planet-type">MAIN</span>'+
        '</button>';

      others.slice(0,4).forEach((a,i)=>{
        const [left,top]=positions[i];
        html+=
          '<button type="button" class="nexa-account-planet alt" style="left:'+left+'%;top:'+top+'%" data-nexa-v585-profile="'+esc(a.id)+'">'+
            '<img src="'+esc(avatar(a))+'" alt="">'+
            '<span class="nexa-account-planet-name">'+esc(a.in_game_name||'Account')+'</span>'+
            '<span class="nexa-account-planet-type">'+
              (String(a.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC')+
            '</span>'+
          '</button>';
      });
    }

    if(accounts.length<5){
      const idx=Math.min(accounts.length,3);
      const p=positions[idx]||[50,14];
      html+=
        '<button type="button" id="nexa-v585-add" class="nexa-account-planet alt nexa-add-planet" style="left:'+p[0]+'%;top:'+p[1]+'%">'+
          '<span class="nexa-add-planet-symbol">+</span>'+
          '<span class="nexa-account-planet-name">ADD ACCOUNT</span>'+
        '</button>';
    }

    system.innerHTML=html;

    const manage=$('nexa-constellation-manage');
    if(manage) manage.style.display='none';
  }

  function showConstellation(){
    const m=$('nexa-account-constellation');
    if(!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden','false');
  }

  async function openConstellation(){
    showConstellation();
    try{
      renderConstellation(await bootstrap(true));
    }catch(e){
      console.warn('NEXA v58.5 bootstrap:',e?.message||e);
      const system=$('nexa-constellation-system');
      if(system) system.innerHTML=
        '<div style="padding:32px;text-align:center;color:#aeb8d8">Could not load accounts.<br><small>Please refresh NEXA and sign in again.</small></div>';
    }
  }

  function populateAllianceSelect(payload){
    const select=$('alliance') ||
      document.querySelector('#accounts-modal select[name="alliance_id"]') ||
      Array.from(document.querySelectorAll('#accounts-modal select')).find(s=>/alliance/i.test((s.id||'')+' '+(s.name||'')));
    if(!select) return;

    select.innerHTML=
      '<option value="">Select alliance</option>'+
      (payload.alliances||[]).map(a=>'<option value="'+esc(a.id)+'">'+esc(a.tag)+'</option>').join('')+
      '<option value="not-listed">Not Listed</option>';
  }

  function fixTimezone(){
    const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    if($('timezone-display')) $('timezone-display').textContent=zone;
    if($('timezone-offset')){
      try{
        const part=new Intl.DateTimeFormat('en-US',{
          timeZone:zone,timeZoneName:'shortOffset',hour:'2-digit'
        }).formatToParts(new Date()).find(p=>p.type==='timeZoneName');
        $('timezone-offset').textContent=(part?.value||'').replace('GMT','UTC');
      }catch(_){}
    }
  }

  async function openAddAccount(){
    $('nexa-account-constellation')?.classList.remove('open');
    const modal=$('accounts-modal');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
    fixTimezone();
    try{populateAllianceSelect(await bootstrap(false));}
    catch(e){console.warn('NEXA v58.5 alliances:',e?.message||e);}
  }

  async function openProfile(id){
    try{
      const payload=await bootstrap(false);
      const a=payload.accounts.find(x=>String(x.id)===String(id));
      if(!a) return;

      const set=(id,val)=>{const el=$(id);if(el)el.textContent=val;};
      set('nexa-profile-name',(a.in_game_name||'PLAYER').toUpperCase());
      set('nexa-profile-player-id',a.player_id||'');
      set('nexa-profile-alliance',allianceTag(a,payload.alliances));
      set('nexa-profile-role',a.alliance_role||'R3');
      set('nexa-profile-type',a.is_main?'MAIN':(String(a.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC'));
      set('nexa-profile-furnace',a.furnace_level||'—');
      set('nexa-profile-power',a.power?Number(a.power).toLocaleString():'—');
      set('nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
      if($('nexa-profile-photo')) $('nexa-profile-photo').src=avatar(a);

      $('nexa-account-constellation')?.classList.remove('open');
      const modal=$('nexa-profile-modal');
      if(modal){
        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
      }
    }catch(e){console.warn('NEXA v58.5 profile:',e?.message||e);}
  }

  /* Capture BEFORE the legacy document click handler. */
  document.addEventListener('click',function(e){
    const profileLauncher=e.target.closest?.('#nexa-profile-launcher');
    if(profileLauncher){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openConstellation();
      return;
    }

    const add=e.target.closest?.('#nexa-v585-add,#nexa-constellation-add');
    if(add){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openAddAccount();
      return;
    }

    const planet=e.target.closest?.('[data-nexa-v585-profile]');
    if(planet){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openProfile(planet.getAttribute('data-nexa-v585-profile'));
    }
  },true);

  document.addEventListener('DOMContentLoaded',fixTimezone);
})();
