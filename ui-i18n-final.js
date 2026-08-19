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
  let accounts=[],loaded=false,loading=null,selectedId=null;

  function db(){
    if(typeof supabaseClient!=='undefined') return supabaseClient;
    if(window.nexaAccountDataClient) return window.nexaAccountDataClient;
    if(!window.supabase?.createClient) return null;
    return window.nexaAccountDataClient=window.supabase.createClient('https://dfxcxboxrkfmrnsgpyin.supabase.co','sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-');
  }
  const tag=a=>a?.alliances?.tag||a?.custom_alliance_tag||'Not Listed';
  const avatar=a=>a?.profile_photo_url||'https://ui-avatars.com/api/?name='+encodeURIComponent(a?.in_game_name||'NEXA')+'&background=111a38&color=cabaff&bold=true&size=256';
  const compactNumber=value=>{
    const number=Number(value||0);if(!Number.isFinite(number)||!number)return 'Not set';
    const units=[[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']];
    for(const [size,suffix] of units)if(Math.abs(number)>=size){const scaled=number/size;let text=scaled>=100?scaled.toFixed(0):scaled>=10?scaled.toFixed(1):scaled.toFixed(2);text=text.replace(/\.0+$/,'').replace(/(\.\d*[1-9])0+$/,'$1');return text+suffix;}
    return number.toLocaleString();
  };
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
    $('nexa-account-constellation')?.classList.remove('open');
    $('nexa-account-constellation')?.setAttribute('aria-hidden','true');
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
            <div class="nexa-passport-field"><span>POWER</span><strong>${esc(compactNumber(a.power))}</strong></div>
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
    set('nexa-profile-power',a.power?compactNumber(a.power):'—');
    set('nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
    const photo=$('nexa-profile-photo');if(photo)photo.src=avatar(a);
    if($('nexa-edit-name'))$('nexa-edit-name').value=a.in_game_name||'';
    if($('nexa-edit-role'))$('nexa-edit-role').value=a.alliance_role||'R3';
    if($('nexa-edit-furnace'))$('nexa-edit-furnace').value=a.furnace_level||'';
    if($('nexa-edit-power'))$('nexa-edit-power').value=a.power||'';
    if($('nexa-edit-deployment'))$('nexa-edit-deployment').value=a.deployment_capacity||'';
    $('nexa-profile-editor')?.classList.remove('open');
    $('nexa-passport-modal')?.classList.remove('open');
    $('nexa-account-constellation')?.classList.remove('open');
    const profile=$('nexa-profile-modal');
    profile?.classList.add('open');
    profile?.setAttribute('aria-hidden','false');
    const fresh=id=>{const old=$(id);if(!old)return null;const next=old.cloneNode(true);old.replaceWith(next);return next;};
    const editButton=fresh('nexa-profile-edit-btn');
    if(editButton)editButton.onclick=event=>{event.preventDefault();$('nexa-profile-editor')?.classList.toggle('open');};
    const photoInput=fresh('nexa-photo-input');
    const photoButton=fresh('nexa-photo-edit');
    if(photoButton)photoButton.onclick=event=>{event.preventDefault();photoInput?.click();};
    const oldSave=profile?.querySelector('.nexa-profile-save'),saveButton=oldSave?.cloneNode(true);
    if(oldSave&&saveButton)oldSave.replaceWith(saveButton);
    if(saveButton){saveButton.type='button';saveButton.onclick=event=>{event.preventDefault();saveSelectedProfile();};}
    if(photoInput)photoInput.onchange=event=>{const file=event.target.files?.[0];if(file)uploadSelectedPhoto(file);};
  }

  function render(){
    const system=$('nexa-constellation-system');if(!system)return;
    const main=active(),others=main?accounts.filter(a=>a.id!==main.id):[],positions=[[82,31],[79,72],[21,72],[18,31]];
    let html='<span class="nexa-space-stars"></span><span class="nexa-space-planet planet-a"></span><span class="nexa-space-planet planet-b"></span><span class="nexa-space-planet planet-c"></span><span class="nexa-constellation-orbit orbit-three"></span><span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';
    if(main)html+=`<button type="button" class="nexa-account-planet main type-main account-color-1" data-account-constellation-id="${esc(main.id)}"><img src="${esc(avatar(main))}" alt=""><span class="nexa-account-planet-name">${esc(main.in_game_name)}</span><span class="nexa-account-planet-type">MAIN ACCOUNT</span></button>`;
    others.forEach((a,i)=>{const p=positions[i%positions.length],kind=accountKind(a);html+=`<button type="button" class="nexa-account-planet alt type-${kind} account-color-${i+2}" style="left:${p[0]}%;top:${p[1]}%" data-account-constellation-id="${esc(a.id)}"><img src="${esc(avatar(a))}" alt=""><span class="nexa-account-planet-name">${esc(a.in_game_name)}</span><span class="nexa-account-planet-type">${accountLabel(a)}</span></button>`;});
    if(accounts.length<5){const p=positions[Math.min(others.length,positions.length-1)]||[50,14];html+=`<button type="button" id="nexa-constellation-add-account" class="nexa-account-planet alt nexa-add-planet" style="left:${p[0]}%;top:${p[1]}%"><span class="nexa-add-planet-symbol">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span></button>`;}
    html+=`<button type="button" id="nexa-constellation-manage-accounts">MANAGE ACCOUNTS</button>`;
    system.innerHTML=html;
    system.querySelectorAll('[data-account-constellation-id]').forEach(planet=>{
      planet.onclick=event=>{
        event.preventDefault();event.stopImmediatePropagation();
        passport(accounts.find(a=>String(a.id)===String(planet.dataset.accountConstellationId)));
      };
    });
    const add=$('nexa-constellation-add-account');
    if(add)add.onclick=event=>{event.preventDefault();event.stopImmediatePropagation();openAccounts();};
    const manage=$('nexa-constellation-manage-accounts');
    if(manage)manage.onclick=event=>{event.preventDefault();event.stopImmediatePropagation();openAccounts();};
  }

  function selectedAccount(){return accounts.find(a=>String(a.id)===String(selectedId))||null;}
  function profileMessage(message,bad=false){
    let box=$('nexa-profile-message');
    if(!box){box=document.createElement('div');box.id='nexa-profile-message';box.className='nexa-profile-message';$('nexa-profile-editor')?.appendChild(box);}
    box.textContent=message||'';box.classList.toggle('error',bad);
  }
  function refreshProfileView(a){
    if(!a)return;
    const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
    set('nexa-profile-name',(a.in_game_name||'PLAYER').toUpperCase());
    set('nexa-profile-role',a.alliance_role||'R3');
    set('nexa-profile-type',a.is_main?'MAIN':accountKind(a)==='points'?'POINTS':'FULL');
    set('nexa-profile-furnace',a.furnace_level||'—');
    set('nexa-profile-power',a.power?compactNumber(a.power):'—');
    set('nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
    const photo=$('nexa-profile-photo');if(photo)photo.src=avatar(a);
  }
  async function saveSelectedProfile(){
    const a=selectedAccount();if(!a){profileMessage('No account selected.',true);return;}
    const payload={
      in_game_name:$('nexa-edit-name')?.value.trim()||a.in_game_name,
      alliance_role:$('nexa-edit-role')?.value||'R3',
      furnace_level:$('nexa-edit-furnace')?.value||null,
      power:Number(($('nexa-edit-power')?.value||'').replace(/\D/g,''))||null,
      deployment_capacity:Number(($('nexa-edit-deployment')?.value||'').replace(/\D/g,''))||null
    };
    profileMessage('Saving…');
    const {data,error}=await db().from('player_accounts').update(payload).eq('id',a.id).select().single();
    if(error){diagnostic('PROFILE-SAVE-04',error.message);profileMessage(error.message,true);return;}
    Object.assign(a,data||payload);refreshProfileView(a);syncHome();render();
    $('nexa-profile-editor')?.classList.remove('open');profileMessage('Profile saved.');
  }
  function cropPhoto(file){
    return new Promise((resolve,reject)=>{
      let modal=$('nexa-photo-cropper');
      if(!modal){modal=document.createElement('div');modal.id='nexa-photo-cropper';document.body.appendChild(modal);}
      modal.innerHTML=`<div class="nexa-crop-backdrop"></div><section class="nexa-crop-card" role="dialog" aria-modal="true"><header><div><small>NEXA PHOTO</small><strong>CROP PROFILE PICTURE</strong></div><button type="button" data-crop-cancel>×</button></header><canvas width="420" height="420"></canvas><label>ZOOM<input type="range" min="1" max="3" value="1" step="0.01"></label><p>Drag the photo to position it inside the circle.</p><div class="nexa-crop-actions"><button type="button" data-crop-cancel>CANCEL</button><button type="button" data-crop-use>USE PHOTO</button></div></section>`;
      modal.classList.add('open');
      const canvas=modal.querySelector('canvas'),ctx=canvas.getContext('2d'),range=modal.querySelector('input'),img=new Image();
      let zoom=1,ox=0,oy=0,drag=false,lastX=0,lastY=0;
      const draw=()=>{
        const base=Math.max(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight),scale=base*zoom,dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
        ox=Math.max((canvas.width-dw)/2,Math.min((dw-canvas.width)/2,ox));oy=Math.max((canvas.height-dh)/2,Math.min((dh-canvas.height)/2,oy));
        ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,(canvas.width-dw)/2+ox,(canvas.height-dh)/2+oy,dw,dh);
      };
      const close=value=>{modal.classList.remove('open');URL.revokeObjectURL(img.src);resolve(value);};
      img.onload=draw;img.onerror=()=>{modal.classList.remove('open');reject(new Error('Unable to read image.'));};img.src=URL.createObjectURL(file);
      range.oninput=()=>{zoom=Number(range.value);draw();};
      canvas.onpointerdown=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);};
      canvas.onpointermove=e=>{if(!drag)return;const ratio=canvas.width/canvas.getBoundingClientRect().width;ox+=(e.clientX-lastX)*ratio;oy+=(e.clientY-lastY)*ratio;lastX=e.clientX;lastY=e.clientY;draw();};
      canvas.onpointerup=()=>{drag=false;};
      modal.querySelectorAll('[data-crop-cancel]').forEach(x=>x.onclick=()=>close(null));
      modal.querySelector('[data-crop-use]').onclick=()=>canvas.toBlob(blob=>close(blob),'image/jpeg',.9);
    });
  }
  async function uploadSelectedPhoto(file){
    const a=selectedAccount();if(!a||!file)return;
    if(file.size>8*1024*1024){profileMessage('Please choose an image under 8 MB.',true);return;}
    try{
      const blob=await cropPhoto(file);if(!blob)return;
      const {data:{user}}=await db().auth.getUser();if(!user)return;
      profileMessage('Uploading photo…');
      const path=`${user.id}/${a.id}-${Date.now()}.jpg`;
      const {error:uploadError}=await db().storage.from('profile-photos').upload(path,blob,{contentType:'image/jpeg'});
      if(uploadError)throw uploadError;
      const {data:publicData}=db().storage.from('profile-photos').getPublicUrl(path);
      const url=publicData?.publicUrl;if(!url)throw new Error('Photo URL was not created.');
      const {error}=await db().from('player_accounts').update({profile_photo_url:url}).eq('id',a.id);
      if(error)throw error;
      a.profile_photo_url=url;refreshProfileView(a);syncHome();render();profileMessage('Photo updated.');
    }catch(error){diagnostic('PHOTO-UPLOAD-05',error.message);profileMessage(error.message,true);}
    finally{if($('nexa-photo-input'))$('nexa-photo-input').value='';}
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
  document.addEventListener('click',async event=>{
    if(event.target.closest?.('[data-close-passport]')){event.preventDefault();$('nexa-passport-modal')?.classList.remove('open');$('nexa-passport-modal')?.setAttribute('aria-hidden','true');return;}
    if(event.target.closest?.('[data-open-full-profile]')){event.preventDefault();openFullProfile(accounts.find(a=>a.id===selectedId));return;}
    if(event.target.closest?.('#nexa-profile-launcher')){event.preventDefault();event.stopImmediatePropagation();await openConstellation();return;}
  },true);
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
    #nexa-passport-modal{display:none;position:fixed;inset:0;z-index:2147483200;overflow:auto;padding:24px 14px 80px}
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
    #nexa-constellation-system .nexa-account-planet.account-color-1 img{border-color:#ff59d6;box-shadow:0 0 0 5px rgba(255,73,209,.1),0 0 34px rgba(255,73,209,.42)}
    #nexa-constellation-system .nexa-account-planet.account-color-1 .nexa-account-planet-type{color:#ff8de3}
    #nexa-constellation-system .nexa-account-planet.account-color-2 img{border-color:#9a75ff;box-shadow:0 0 30px rgba(143,101,255,.42)}
    #nexa-constellation-system .nexa-account-planet.account-color-2 .nexa-account-planet-type{color:#b9a3ff}
    #nexa-constellation-system .nexa-account-planet.account-color-3 img{border-color:#52d9ff;box-shadow:0 0 30px rgba(56,198,255,.42)}
    #nexa-constellation-system .nexa-account-planet.account-color-3 .nexa-account-planet-type{color:#78e5ff}
    #nexa-constellation-system .nexa-account-planet.account-color-4 img{border-color:#55eba8;box-shadow:0 0 30px rgba(57,224,151,.4)}
    #nexa-constellation-system .nexa-account-planet.account-color-4 .nexa-account-planet-type{color:#79f3bd}
    #nexa-constellation-system .nexa-account-planet.account-color-5 img{border-color:#ffc85c;box-shadow:0 0 30px rgba(255,190,70,.42)}
    #nexa-constellation-system .nexa-account-planet.account-color-5 .nexa-account-planet-type{color:#ffd77d}
    #nexa-constellation-manage-accounts{position:absolute;left:50%;bottom:-32px;z-index:12;transform:translateX(-50%);padding:8px 13px;border:1px solid rgba(111,190,255,.38);border-radius:999px;background:rgba(8,18,42,.9);color:#82dcff;font-size:8px;font-weight:950;letter-spacing:.12em;white-space:nowrap;box-shadow:0 0 20px rgba(57,164,255,.14)}
    #nexa-passport-modal{overflow:hidden;padding:max(10px,env(safe-area-inset-top)) 12px max(10px,env(safe-area-inset-bottom));display:none;align-items:center;justify-content:center}
    #nexa-passport-modal.open{display:flex}
    .nexa-passport-backdrop{background:radial-gradient(circle at 16% 22%,rgba(111,63,205,.23),transparent 25%),radial-gradient(circle at 82% 72%,rgba(31,149,210,.18),transparent 28%),rgba(1,3,14,.94)}
    .nexa-passport-backdrop:before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.72) 0 1px,transparent 1.4px),radial-gradient(circle,rgba(113,198,255,.55) 0 1px,transparent 1.5px);background-size:43px 43px,71px 71px;background-position:7px 13px,29px 3px;opacity:.34}
    .nexa-passport-backdrop:after{content:"";position:absolute;width:54px;height:54px;right:8%;top:12%;border-radius:50%;background:radial-gradient(circle at 34% 28%,#9cc8ff,#3c4ea8 60%,#11163f);box-shadow:0 0 28px rgba(83,115,255,.55)}
    .nexa-passport-book{margin:0;max-height:calc(100dvh - 20px);display:flex;flex-direction:column}
    .nexa-passport-pages{min-height:0;flex:1}
    @media(max-width:620px){
      .nexa-passport-book{width:100%;border-radius:20px}
      .nexa-passport-header{padding:10px 13px}.nexa-passport-header strong{font-size:10px}.nexa-passport-header span{font-size:8px}.nexa-passport-header button{width:32px;height:32px;font-size:22px}
      .nexa-passport-pages{grid-template-columns:1fr;display:block}
      .nexa-passport-identity{height:112px;display:grid;grid-template-columns:76px 1fr;grid-template-rows:auto auto auto;column-gap:13px;padding:12px 16px;border-right:0;border-bottom:1px solid rgba(139,111,255,.28);text-align:left}
      .nexa-passport-identity img{grid-row:1/4;width:72px;height:72px}.nexa-passport-identity h2{margin:0;font-size:21px;align-self:end}.nexa-passport-identity .nexa-passport-type{justify-self:start;padding:3px 8px;font-size:8px}.nexa-passport-identity>small{margin:0;font-size:7px;align-self:start}.nexa-passport-seal{display:none}
      .nexa-passport-data{grid-template-columns:1fr 1fr;gap:6px;padding:27px 12px 10px;align-content:start}
      .nexa-passport-code{right:13px;top:8px;font-size:9px}.nexa-passport-field{gap:2px;padding:7px 8px;border-radius:9px;min-height:43px}.nexa-passport-field span{font-size:7px}.nexa-passport-field strong{font-size:11px;white-space:nowrap}.nexa-passport-machine{margin-top:0;padding-top:7px;font-size:7px}
      .nexa-passport-actions{padding:8px 12px 10px}.nexa-passport-actions button{padding:9px 10px;font-size:9px}
    }
    #nexa-profile-modal{z-index:2147483000}
    #nexa-profile-modal .nexa-profile-backdrop{background:radial-gradient(circle at 12% 18%,rgba(113,61,204,.24),transparent 28%),radial-gradient(circle at 85% 78%,rgba(30,146,210,.18),transparent 30%),rgba(1,3,14,.95)}
    #nexa-profile-modal .nexa-profile-backdrop:before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.7) 0 1px,transparent 1.4px),radial-gradient(circle,rgba(111,196,255,.5) 0 1px,transparent 1.5px);background-size:49px 49px,79px 79px;opacity:.3}
    #nexa-profile-modal .nexa-profile-sheet{border-color:rgba(143,107,255,.48);background:radial-gradient(circle at 18% 10%,rgba(106,65,214,.22),transparent 27%),linear-gradient(155deg,rgba(9,14,35,.98),rgba(3,7,21,.99));box-shadow:0 0 70px rgba(86,68,218,.2),0 30px 90px rgba(0,0,0,.6)}
    @media(max-width:700px){
      #nexa-profile-modal .nexa-profile-sheet{width:calc(100% - 16px);height:calc(100dvh - 16px);max-height:none;margin:8px auto;overflow:hidden;display:flex;flex-direction:column;border-radius:20px}
      #nexa-profile-modal .nexa-profile-hero{padding:15px 14px 9px;flex:0 0 auto}
      #nexa-profile-modal .nexa-profile-main{gap:11px;align-items:center}
      #nexa-profile-modal .nexa-profile-photo{width:62px;height:62px}
      #nexa-profile-modal .nexa-photo-edit{width:25px;height:25px}
      #nexa-profile-modal .nexa-profile-name{font-size:23px}
      #nexa-profile-modal .nexa-profile-id{font-size:10px}
      #nexa-profile-modal .nexa-profile-sub{margin-top:6px;gap:4px}
      #nexa-profile-modal .nexa-glass-tag{padding:3px 6px;font-size:8px}
      #nexa-profile-modal .nexa-profile-stats{gap:5px;margin-top:10px}
      #nexa-profile-modal .nexa-stat{padding:7px 6px;border-radius:10px}
      #nexa-profile-modal .nexa-stat label{font-size:7px}
      #nexa-profile-modal .nexa-stat strong{font-size:11px;margin-top:3px}
      #nexa-profile-modal .nexa-profile-edit-row{margin-top:6px}
      #nexa-profile-modal .nexa-profile-edit-btn{padding:5px 8px;font-size:9px}
      #nexa-profile-modal .nexa-profile-tabs{position:relative;padding:6px 8px;gap:3px}
      #nexa-profile-modal .nexa-profile-tab{padding:7px 2px;font-size:8px}
      #nexa-profile-modal .nexa-profile-content{padding:8px;overflow:auto;min-height:0;flex:1}
      #nexa-profile-modal .nexa-profile-grid{grid-template-columns:repeat(2,1fr);gap:6px}
      #nexa-profile-modal .nexa-profile-item{min-height:78px;padding:8px;border-radius:11px}
      #nexa-profile-modal .nexa-profile-close{right:9px;top:8px;width:31px;height:31px}
    }
    .nexa-profile-message{margin-top:8px;color:#74e6bd;font-size:10px;font-weight:800}.nexa-profile-message.error{color:#ff8ba1}
    #nexa-photo-cropper{display:none;position:fixed;inset:0;z-index:2147483600;align-items:center;justify-content:center;padding:14px}#nexa-photo-cropper.open{display:flex}
    .nexa-crop-backdrop{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(103,67,220,.24),transparent 35%),rgba(1,3,14,.96);backdrop-filter:blur(14px)}
    .nexa-crop-card{position:relative;width:min(430px,100%);padding:14px;border:1px solid rgba(151,111,255,.58);border-radius:22px;background:linear-gradient(155deg,#111735,#05091c);box-shadow:0 25px 80px rgba(0,0,0,.65);color:white}
    .nexa-crop-card header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.nexa-crop-card header div{display:grid;gap:3px}.nexa-crop-card header small{color:#a98cff;letter-spacing:.22em;font-weight:900}.nexa-crop-card header strong{font-size:13px;letter-spacing:.08em}.nexa-crop-card header button{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:#10162e;color:white;font-size:22px}
    .nexa-crop-card canvas{display:block;width:min(76vw,360px);height:min(76vw,360px);margin:auto;border-radius:50%;border:3px solid #9b76ff;box-shadow:0 0 0 8px rgba(128,88,255,.09),0 0 40px rgba(82,144,255,.24);touch-action:none;background:#080d22}
    .nexa-crop-card label{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:10px;margin:14px 3px 0;color:#9da9ca;font-size:9px;letter-spacing:.15em}.nexa-crop-card input{width:100%}.nexa-crop-card p{text-align:center;color:#7f8bad;font-size:9px}
    .nexa-crop-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nexa-crop-actions button{padding:10px;border:1px solid rgba(132,111,255,.4);border-radius:11px;background:rgba(24,28,59,.8);color:#cbd4f2;font-weight:900}.nexa-crop-actions [data-crop-use]{background:linear-gradient(135deg,#7449ff,#269fff);color:white}
  `;document.head.appendChild(style);
})();
