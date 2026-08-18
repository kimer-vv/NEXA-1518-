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

/* NEXA v58.6 — PROFILE / CONSTELLATION DIRECT SESSION FIX */
(function(){
  'use strict';

  const SUPABASE_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
  const SUPABASE_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
  const STORAGE_KEY='sb-dfxcxboxrkfmrnsgpyin-auth-token';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  let cache=null, cacheAt=0;

  async function accessToken(){
    try{
      if(window.supabaseClient?.auth?.getSession){
        const {data}=await window.supabaseClient.auth.getSession();
        if(data?.session?.access_token) return data.session.access_token;
      }
    }catch(_){}
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const p=JSON.parse(raw);
        return p?.access_token || p?.currentSession?.access_token || '';
      }
    }catch(_){}
    return '';
  }

  async function bootstrap(force=false){
    if(!force && cache && Date.now()-cacheAt<10000) return cache;
    const token=await accessToken();
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
    try{ data=raw?JSON.parse(raw):{}; }catch(_){}
    if(!r.ok) throw new Error(data?.message||data?.error||raw||'Could not load profile.');

    cache={
      accounts:Array.isArray(data?.accounts)?data.accounts:[],
      alliances:Array.isArray(data?.alliances)?data.alliances:[]
    };
    cacheAt=Date.now();
    return cache;
  }

  function avatar(a){
    return a?.profile_photo_url ||
      'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+
      '&background=111a38&color=cabaff&bold=true&size=256';
  }

  function allianceTag(a,alliances){
    if(a?.custom_alliance_tag) return a.custom_alliance_tag;
    if(!a?.alliance_id) return 'Not Listed';
    return alliances.find(x=>String(x.id)===String(a.alliance_id))?.tag || 'Not Listed';
  }

  function updateHome(payload){
    const accounts=payload.accounts||[];
    const main=accounts.find(a=>a.is_main===true)||accounts[0];
    const img=$('nexa-profile-launcher-photo');
    const name=$('nexa-profile-launcher-name');
    const badge=$('nexa-profile-launcher-badge');
    const count=$('nexa-profile-launcher-count');

    if(main){
      if(img){ img.src=avatar(main); img.style.display='block'; }
      if(name) name.textContent=(main.in_game_name||'MY PROFILE').toUpperCase();
      if(badge) badge.textContent='MAIN';
      if(count){
        count.textContent=String(accounts.length);
        count.classList.toggle('hidden',accounts.length<2);
      }
    }else{
      if(img){ img.removeAttribute('src'); img.style.display='none'; }
      if(name) name.textContent='MY PROFILE';
      if(badge) badge.textContent='MAIN';
      if(count) count.classList.add('hidden');
    }
  }

  function renderConstellation(payload){
    const system=$('nexa-constellation-system');
    if(!system) return;
    const accounts=payload.accounts||[];
    const positions=[[82,32],[82,68],[18,68],[18,32]];
    let html='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';

    if(accounts.length){
      const main=accounts.find(a=>a.is_main===true)||accounts[0];
      const others=accounts.filter(a=>String(a.id)!==String(main.id));
      html+='<button type="button" class="nexa-account-planet main" data-nexa-v586-profile="'+esc(main.id)+'">'+
        '<img src="'+esc(avatar(main))+'" alt=""><span class="nexa-account-planet-name">'+esc(main.in_game_name||'Main Account')+
        '</span><span class="nexa-account-planet-type">MAIN</span></button>';

      others.slice(0,4).forEach((a,i)=>{
        const [left,top]=positions[i];
        html+='<button type="button" class="nexa-account-planet alt" style="left:'+left+'%;top:'+top+'%" data-nexa-v586-profile="'+esc(a.id)+'">'+
          '<img src="'+esc(avatar(a))+'" alt=""><span class="nexa-account-planet-name">'+esc(a.in_game_name||'Account')+
          '</span><span class="nexa-account-planet-type">'+
          (String(a.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC')+'</span></button>';
      });
    }

    if(accounts.length<5){
      const p=positions[Math.min(accounts.length,3)]||[50,14];
      html+='<button type="button" id="nexa-v586-add" class="nexa-account-planet alt nexa-add-planet" style="left:'+p[0]+'%;top:'+p[1]+'%">'+
        '<span class="nexa-add-planet-symbol">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span></button>';
    }
    system.innerHTML=html;
    const manage=$('nexa-constellation-manage');
    if(manage) manage.style.display='none';
  }

  function populateAlliances(payload){
    const select=$('alliance');
    if(!select) return;
    const current=select.value;
    select.innerHTML='<option value="">Select alliance</option>'+
      (payload.alliances||[]).map(a=>'<option value="'+esc(a.id)+'">'+esc(a.tag)+'</option>').join('')+
      '<option value="not-listed">Not Listed</option>';
    if([...select.options].some(o=>o.value===current)) select.value=current;
  }

  async function refresh(force=true){
    const p=await bootstrap(force);
    updateHome(p);
    populateAlliances(p);
    return p;
  }

  async function openConstellation(){
    const modal=$('nexa-account-constellation');
    if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
    try{ renderConstellation(await refresh(true)); }
    catch(e){
      console.warn('NEXA v58.6:',e);
      const system=$('nexa-constellation-system');
      if(system) system.innerHTML='<div style="padding:32px;text-align:center;color:#aeb8d8">Could not load accounts.</div>';
    }
  }

  async function openAdd(){
    $('nexa-account-constellation')?.classList.remove('open');
    const modal=$('accounts-modal');
    if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
    try{ await refresh(true); }catch(e){ console.warn('NEXA v58.6 alliances:',e); }
  }

  async function openProfile(id){
    try{
      const p=await refresh(false);
      const a=p.accounts.find(x=>String(x.id)===String(id));
      if(!a) return;
      const set=(id,val)=>{const el=$(id);if(el)el.textContent=val;};
      set('nexa-profile-name',(a.in_game_name||'PLAYER').toUpperCase());
      set('nexa-profile-player-id',a.player_id||'');
      set('nexa-profile-alliance',allianceTag(a,p.alliances));
      set('nexa-profile-role',a.alliance_role||'R3');
      set('nexa-profile-type',a.is_main?'MAIN':(String(a.account_purpose||'full').toLowerCase()==='full'?'FULL':'BASIC'));
      set('nexa-profile-furnace',a.furnace_level||'—');
      set('nexa-profile-power',a.power?Number(a.power).toLocaleString():'—');
      set('nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
      if($('nexa-profile-photo')) $('nexa-profile-photo').src=avatar(a);
      $('nexa-account-constellation')?.classList.remove('open');
      const m=$('nexa-profile-modal');
      if(m){m.classList.add('open');m.setAttribute('aria-hidden','false');}
    }catch(e){console.warn('NEXA v58.6 profile:',e);}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nexa-profile-launcher')){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      openConstellation(); return;
    }
    if(e.target.closest?.('#nexa-v586-add,#nexa-v585-add,#nexa-constellation-add')){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      openAdd(); return;
    }
    const planet=e.target.closest?.('[data-nexa-v586-profile]');
    if(planet){
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      openProfile(planet.getAttribute('data-nexa-v586-profile')); return;
    }
  },true);

  async function boot(){
    try{ await refresh(true); }catch(e){ console.warn('NEXA v58.6 boot:',e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250));
  else setTimeout(boot,250);

  window.addEventListener('pageshow',()=>setTimeout(boot,100));
})();
