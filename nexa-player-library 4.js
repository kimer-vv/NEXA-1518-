/* NEXA Player Library Profile + Administration Library — v3.1 */
(()=>{
  'use strict';
  let accountId=window.NEXA_ACTIVE_ACCOUNT_ID||null;
  let activeTab='heroes';
  let profileWasOpen=false;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const types={heroes:'hero',experts:'expert',pets:'pet',gear:'chief_gear',charms:'chief_charm'};

  let libraryClient=null;
  function client(){
    if(window.supabaseClient) return window.supabaseClient;
    if(!libraryClient && window.supabase?.createClient){
      libraryClient=window.supabase.createClient(
        'https://dfxcxboxrkfmrnsgpyin.supabase.co',
        'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
      );
    }
    return libraryClient;
  }
  function addStyles(){
    if($('nexa-library-profile-style')) return;
    const s=document.createElement('style'); s.id='nexa-library-profile-style';
    s.textContent=`
      .nexa-profile-tabs{display:flex!important;overflow-x:auto;grid-template-columns:none!important;scrollbar-width:none}.nexa-profile-tab{flex:0 0 auto;min-width:82px}
      .nexa-lib-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.nexa-lib-card{border:1px solid rgba(137,110,255,.25);border-radius:18px;padding:13px;background:linear-gradient(145deg,rgba(19,25,54,.94),rgba(6,12,29,.96));box-shadow:0 12px 34px rgba(0,0,0,.2)}
      .nexa-lib-head{display:grid;grid-template-columns:58px 1fr auto;gap:10px;align-items:center}.nexa-lib-avatar-wrap{width:58px;height:58px;border-radius:16px;overflow:hidden;border:2px solid #8062ff;background:#101b3b;display:grid;place-items:center}.nexa-lib-avatar{width:100%;height:100%;object-fit:cover;background:#101b3b}.nexa-lib-avatar.hero{transform:scale(1.72);transform-origin:50% 20%;object-position:50% 18%}.nexa-lib-fallback{color:#ccbfff;font-weight:950;font-size:18px}.nexa-lib-head h4{margin:0;color:#fff}.nexa-lib-head small{display:block;color:#8290b8;margin-top:3px}.nexa-lib-owned{display:flex;align-items:center;gap:5px;color:#81ddff;font-size:11px;font-weight:900}.nexa-lib-owned input{width:20px;height:20px}
      .nexa-lib-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.nexa-lib-fields label{font-size:9px;letter-spacing:.08em;color:#8491b8;font-weight:900}.nexa-lib-fields input,.nexa-lib-fields select{width:100%;margin-top:5px;padding:9px;border-radius:10px;border:1px solid rgba(132,146,211,.24);background:#09122b;color:#edf3ff}.nexa-lib-save{width:100%;margin-top:10px;border:0;border-radius:11px;padding:10px;background:linear-gradient(135deg,#754bff,#168fdc);color:white;font-weight:950}.nexa-lib-status{text-align:center;min-height:15px;color:#71dcff;font-size:10px;margin-top:5px}.nexa-lib-loading{text-align:center;color:#8390b8;padding:30px}
      @media(max-width:520px){.nexa-lib-grid{grid-template-columns:1fr}.nexa-profile-content{padding:12px!important}}
    `; document.head.appendChild(s);
  }

  function installTabs(){
    const bar=document.querySelector('.nexa-profile-tabs'); if(!bar) return;
    const mapping={heroes:'HEROES',experts:'EXPERTS',pets:'PETS'};
    Object.entries(mapping).forEach(([key,label])=>{
      const b=bar.querySelector(`[data-nexa-tab="${key}"]`); if(!b)return;
      b.dataset.libraryTab=key; b.textContent=label;
    });
    const troop=bar.querySelector('[data-nexa-tab="troops"]'); if(troop) troop.remove();
    [['gear','CHIEF GEAR'],['charms','CHARMS']].forEach(([key,label])=>{
      if(bar.querySelector(`[data-library-tab="${key}"]`))return;
      const b=document.createElement('button'); b.type='button'; b.className='nexa-profile-tab'; b.dataset.libraryTab=key; b.textContent=label; bar.appendChild(b);
    });
  }

  function installAdministrationLibrary(){
    const section=$('admin-library');
    if(!section || section.dataset.nexaLibraryInstalled==='1') return;
    section.dataset.nexaLibraryInstalled='1';
    section.innerHTML=`
      <div class="admin-section-head">
        <div>
          <h3>NEXA Library</h3>
          <p>Manage Heroes, Experts, Pets, Chief Gear and Charms from the shared catalog.</p>
        </div>
      </div>
      <div style="border:1px solid rgba(137,110,255,.28);border-radius:18px;overflow:hidden;background:#030611">
        <iframe id="nexa-library-admin-frame" src="library.html?v=2" title="NEXA Library" style="display:block;width:100%;height:1200px;border:0;background:#030611"></iframe>
      </div>`;
  }

  function fields(item,row){
    const p=row?.progress||{};
    if(item.item_type==='hero') return `<label>HERO LEVEL<input data-f="level" type="number" inputmode="numeric" min="1" max="80" value="${esc(p.level||'')}"></label><label>STARS<input data-f="stars" type="number" inputmode="decimal" min="0" max="5" step="0.1" value="${esc(p.stars||'')}"></label><label>SKILL LEVEL<input data-f="skill_level" type="number" inputmode="numeric" min="1" max="5" value="${esc(p.skill_level||'')}"></label><label>WIDGET<input data-f="widget_level" type="number" inputmode="numeric" min="0" max="10" value="${esc(p.widget_level||'')}"></label>`;
    if(item.item_type==='expert') return `<label>AFFINITY / LEVEL<input data-f="level" type="number" inputmode="numeric" min="0" value="${esc(p.level||'')}"></label><label>SKILL LEVEL<input data-f="skill_level" type="number" inputmode="numeric" min="0" value="${esc(p.skill_level||'')}"></label>`;
    if(item.item_type==='pet') return `<label>PET LEVEL<input data-f="level" type="number" inputmode="numeric" min="0" value="${esc(p.level||'')}"></label><label>SKILL LEVEL<input data-f="skill_level" type="number" inputmode="numeric" min="0" value="${esc(p.skill_level||'')}"></label><label>REFINEMENT<input data-f="refinement" type="number" inputmode="numeric" min="0" value="${esc(p.refinement||'')}"></label>`;
    if(item.item_type==='chief_gear') return `<label>CURRENT TIER<input data-f="current_tier" placeholder="Mythic T2 ★" value="${esc(p.current_tier||'')}"></label><label>TARGET TIER<input data-f="target_tier" placeholder="Mythic T3" value="${esc(p.target_tier||'')}"></label>`;
    return [0,1,2].map((n)=>`<label>CHARM ${n+1} LEVEL<input data-f="charm_${n+1}" type="number" inputmode="numeric" min="0" value="${esc((p.charm_levels||[])[n]||'')}"></label>`).join('');
  }

  async function render(key){
    activeTab=key||activeTab;
    installTabs(); addStyles();
    const c=$('nexa-profile-content'); if(!c)return;
    document.querySelectorAll('.nexa-profile-tab').forEach(b=>b.classList.toggle('active',b.dataset.libraryTab===key));
    if(!accountId){ c.innerHTML='<div class="nexa-profile-empty"><b>Select an account</b>Open this profile again from its planet.</div>';return; }
    const sb=client(); if(!sb){c.innerHTML='<div class="nexa-profile-empty"><b>Library unavailable</b>Supabase connection was not found.</div>';return;}
    c.innerHTML='<div class="nexa-lib-loading">Loading NEXA Library…</div>';
    const type=types[key]||'hero';
    const [{data:items,error},{data:owned}]=await Promise.all([
      sb.from('nexa_library_items').select('*').eq('item_type',type).eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
      sb.from('player_library_inventory').select('*').eq('player_account_id',accountId)
    ]);
    if(error){c.innerHTML=`<div class="nexa-profile-empty"><b>Could not load Library</b>${esc(error.message)}</div>`;return;}
    const map=new Map((owned||[]).map(x=>[x.library_item_id,x]));
    if(!items?.length){c.innerHTML='<div class="nexa-profile-empty"><b>No visible entries</b>This category is ready; an administrator must show its catalog entries.</div>';return;}
    c.innerHTML=`<div class="nexa-lib-grid">${items.map(item=>{
      const row=map.get(item.id), initials=item.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
      const img=item.image_url?`<span class="nexa-lib-avatar-wrap"><img class="nexa-lib-avatar ${item.item_type==='hero'?'hero':''}" src="${esc(item.image_url)}" alt="${esc(item.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="nexa-lib-fallback" hidden>${esc(initials)}</span></span>`:`<span class="nexa-lib-avatar-wrap nexa-lib-fallback">${esc(initials)}</span>`;
      const meta=[item.generation!=null?`GEN ${item.generation}`:'',item.troop_type||'',item.rarity||''].filter(Boolean).join(' • ');
      return `<article class="nexa-lib-card" data-item="${item.id}">${`<div class="nexa-lib-head">${img}<div><h4>${esc(item.name)}</h4><small>${esc(meta)}</small></div><label class="nexa-lib-owned"><input data-owned type="checkbox" ${row?.owned?'checked':''}> OWNED</label></div>`}<div class="nexa-lib-fields">${fields(item,row)}</div><button type="button" class="nexa-lib-save">SAVE</button><div class="nexa-lib-status"></div></article>`;
    }).join('')}</div>`;
  }

  async function save(card){
    const sb=client(); if(!sb||!accountId)return;
    const status=card.querySelector('.nexa-lib-status'); status.textContent='Saving…';
    const {data:{user}}=await sb.auth.getUser(); if(!user){status.textContent='Sign in required';return;}
    const progress={}; card.querySelectorAll('[data-f]').forEach(x=>{if(x.value!=='')progress[x.dataset.f]=x.type==='number'?Number(x.value):x.value.trim();});
    if(progress.charm_1!==undefined||progress.charm_2!==undefined||progress.charm_3!==undefined){progress.charm_levels=[progress.charm_1||0,progress.charm_2||0,progress.charm_3||0];delete progress.charm_1;delete progress.charm_2;delete progress.charm_3;}
    const payload={user_id:user.id,player_account_id:accountId,library_item_id:card.dataset.item,owned:card.querySelector('[data-owned]').checked,progress,updated_at:new Date().toISOString()};
    const {error}=await sb.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});
    status.textContent=error?error.message:'Saved ✓'; status.style.color=error?'#ff7d9c':'#71dcff';
  }

  function selectAccount(id){
    if(!id)return;
    accountId=String(id);
    window.NEXA_ACTIVE_ACCOUNT_ID=accountId;
    document.dispatchEvent(new CustomEvent('nexa:library-account-selected',{detail:{accountId}}));
  }

  document.addEventListener('nexa:profile-opened',e=>{
    selectAccount(e.detail?.accountId);
    setTimeout(()=>{installTabs();render(activeTab);},80);
  });

  document.addEventListener('click',e=>{
    const planet=e.target.closest('[data-account-constellation-id],[data-nexa-profile]');
    if(planet){
      selectAccount(planet.dataset.accountConstellationId||planet.dataset.nexaProfile);
      setTimeout(()=>{installTabs();render('heroes');},120);
    }
    if(e.target.closest('[data-open-full-profile]')) setTimeout(()=>{installTabs();render(activeTab);},160);
    const tab=e.target.closest('[data-library-tab]'); if(tab){e.preventDefault();e.stopImmediatePropagation();render(tab.dataset.libraryTab);}
    const saveBtn=e.target.closest('.nexa-lib-save'); if(saveBtn){e.preventDefault();save(saveBtn.closest('.nexa-lib-card'));}
  },true);
  new MutationObserver(()=>{
    const profileOpen=!!document.querySelector('#nexa-profile-modal.open');
    if(profileOpen){
      installTabs();
      if(!profileWasOpen)setTimeout(()=>render(activeTab),60);
    }
    profileWasOpen=profileOpen;
    installAdministrationLibrary();
  }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
  addStyles(); installTabs(); installAdministrationLibrary();
})();
