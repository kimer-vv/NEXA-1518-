/* NEXA V48.0 — PROFILE QUICK MAX + BATTLE DATA
   COMPLETE NEW FILE: nexa-v48-profile-tools.js

   Purpose:
   - Extend the stable V33.6 Profile owner without replacing or competing with it.
   - MAX ALL shortcut for the whole Profile.
   - Per-category MAXED multi-select.
   - Automatic ✓ MAX indicators based on the real saved values.
   - Rally Capacity account field.
   - Simplified Hero Gear readiness: Main maxed set + second maxed set.
   - No MutationObserver.
   - No touchmove preventDefault.
   - No manual scrollLeft.

   Required player_accounts columns:
   - rally_capacity bigint
   - hero_gear jsonb
*/
(()=>{
'use strict';

if(window.__NEXA_V480_PROFILE_TOOLS__) return;
window.__NEXA_V480_PROFILE_TOOLS__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

let localSb=null;
let activeAccountId=null;
let cachedItems=[];
let cachedInventory=[];
let cachedBattleData={rally_capacity:null,hero_gear:{}};
let busy=false;

function sb(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  if(!localSb && window.supabase?.createClient){
    localSb=window.supabase.createClient(
      'https://dfxcxboxrkfmrnsgpyin.supabase.co',
      'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
    );
  }
  return localSb;
}

function injectCSS(){
  if($('#nexa-v480-css')) return;
  const st=document.createElement('style');
  st.id='nexa-v480-css';
  st.textContent=`
    #v48-profile-tools{
      position:relative;z-index:3;
      display:grid;grid-template-columns:1fr 1fr;gap:8px;
      padding:10px 14px 4px;
    }
    .v48-tool-btn{
      appearance:none;-webkit-appearance:none;
      min-height:42px;border-radius:15px;
      border:1px solid rgba(123,103,255,.38);
      background:linear-gradient(145deg,rgba(24,31,70,.82),rgba(7,12,31,.86));
      color:#fff;font-size:10px;font-weight:950;letter-spacing:.10em;
      box-shadow:inset 0 0 20px rgba(94,76,255,.06),0 0 12px rgba(84,67,255,.08);
    }
    .v48-tool-btn.max-all{
      border-color:rgba(101,224,255,.48);
      color:#9ef2ff;
      box-shadow:inset 0 0 20px rgba(62,208,255,.08),0 0 15px rgba(59,204,255,.10);
    }
    .v48-tool-btn.battle{
      border-color:rgba(191,114,255,.45);
      color:#e4c7ff;
    }
    #v48-category-tools{
      position:relative;z-index:3;
      display:flex;align-items:center;justify-content:flex-end;gap:7px;
      padding:0 14px 2px;
    }
    .v48-category-max,.v48-info{
      appearance:none;-webkit-appearance:none;
      border:1px solid rgba(83,222,255,.38);
      background:rgba(8,18,39,.78);color:#8ceeff;
      font-size:9px;font-weight:950;letter-spacing:.09em;
      min-height:30px;border-radius:999px;padding:7px 11px;
    }
    .v48-info{
      width:30px;min-width:30px;padding:0;
      display:grid;place-items:center;
      border-color:rgba(153,114,255,.42);color:#ccb7ff;
      font-size:12px;
    }
    .v48-max-badge{
      position:absolute;right:-5px;top:-6px;z-index:5;
      display:inline-flex;align-items:center;gap:3px;
      padding:3px 6px;border-radius:999px;
      border:1px solid rgba(92,235,187,.72);
      background:rgba(5,31,31,.92);
      color:#8ff5ca;font-size:7px;font-weight:1000;letter-spacing:.07em;
      box-shadow:0 0 10px rgba(62,227,174,.28);
      pointer-events:none;
    }
    .v48-max-badge:before{content:"✓";font-size:8px}
    .v48-overlay{
      position:fixed;inset:0;z-index:2147483646;
      display:grid;place-items:center;
      padding:16px;background:rgba(1,3,12,.80);
      backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    }
    .v48-modal{
      width:min(520px,100%);
      max-height:calc(100dvh - 32px);
      overflow-y:auto;-webkit-overflow-scrolling:touch;
      border:1px solid rgba(133,99,255,.58);
      border-radius:24px;
      background:
        radial-gradient(circle at 10% 0%,rgba(126,70,255,.22),transparent 34%),
        linear-gradient(160deg,#111735,#060a1a 68%,#03050d);
      box-shadow:0 0 34px rgba(90,60,255,.19);
      padding:17px;
      color:#fff;
    }
    .v48-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .v48-kicker{color:#8eeaff;font-size:8px;font-weight:1000;letter-spacing:.18em}
    .v48-modal h3{margin:5px 0 4px;font-size:21px;line-height:1.1}
    .v48-help{margin:0;color:#a9b3d0;font-size:11px;line-height:1.5}
    .v48-close{
      appearance:none;border:1px solid rgba(255,255,255,.14);
      width:34px;height:34px;border-radius:50%;background:#0b1026;color:#fff;
      font-size:21px;
    }
    .v48-list{display:grid;gap:8px;margin-top:15px}
    .v48-select-row{
      display:grid;grid-template-columns:22px 44px minmax(0,1fr);gap:10px;align-items:center;
      min-height:56px;padding:8px 10px;border-radius:15px;
      border:1px solid rgba(111,130,188,.17);background:rgba(4,9,24,.55);
    }
    .v48-select-row input{width:18px;height:18px;margin:0;accent-color:#77e8ff}
    .v48-select-row img{
      width:42px;height:42px;border-radius:50%;object-fit:cover;
      background:rgba(255,255,255,.04)
    }
    .v48-select-row .v48-placeholder{
      width:42px;height:42px;border-radius:50%;display:grid;place-items:center;
      border:1px solid rgba(130,110,255,.28);color:#a998ff
    }
    .v48-select-row b{display:block;font-size:12px}
    .v48-select-row small{display:block;color:#8591b4;font-size:8px;margin-top:3px}
    .v48-actions{display:flex;gap:8px;margin-top:16px}
    .v48-actions button{
      flex:1;min-height:42px;border-radius:999px;font-weight:950;font-size:10px;
      letter-spacing:.08em;
    }
    .v48-cancel{border:1px solid rgba(255,255,255,.14);background:#0a1025;color:#acb5d0}
    .v48-apply{border:1px solid rgba(87,224,255,.55);background:rgba(20,91,120,.34);color:#b8f8ff}
    .v48-danger{border-color:rgba(255,190,84,.58)!important;color:#ffd998!important;background:rgba(104,65,12,.30)!important}
    .v48-msg{min-height:18px;margin-top:9px;text-align:center;color:#8fe8ff;font-size:9px}
    .v48-battle-grid{display:grid;gap:12px;margin-top:16px}
    .v48-field{
      border:1px solid rgba(111,130,188,.18);
      border-radius:16px;background:rgba(4,9,24,.53);padding:12px;
    }
    .v48-field label{
      display:block;color:#9aa7cb;font-size:8px;font-weight:950;
      letter-spacing:.13em;margin-bottom:7px;
    }
    .v48-field input,.v48-field select{
      width:100%;box-sizing:border-box;
      border:1px solid rgba(126,145,205,.26);
      background:#090f27;color:#fff;border-radius:12px;
      min-height:42px;padding:9px 11px;font:inherit;font-size:13px;
    }
    .v48-field small{display:block;color:#7f8aa9;font-size:9px;line-height:1.45;margin-top:7px}
    .v48-toggle-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .v48-toggle{
      appearance:none;border:1px solid rgba(126,145,205,.24);
      background:#090f27;color:#8e99ba;border-radius:12px;
      min-height:42px;font-size:10px;font-weight:950;
    }
    .v48-toggle.active{
      border-color:#62e2c0;color:#b8ffe7;
      box-shadow:0 0 12px rgba(75,222,179,.13);
      background:rgba(13,74,61,.35);
    }
    .v48-confirm-note{
      margin-top:14px;padding:11px;border-radius:14px;
      border:1px solid rgba(255,190,84,.20);background:rgba(90,56,8,.16);
      color:#d7c49d;font-size:9px;line-height:1.5;
    }
    @media(max-width:390px){
      #v48-profile-tools{padding-inline:10px}
      #v48-category-tools{padding-inline:10px}
      .v48-tool-btn{font-size:9px}
    }
  `;
  document.head.appendChild(st);
}

async function resolveAccount(){
  const c=sb();
  if(!c) return null;

  if(window.NEXA_ACTIVE_ACCOUNT_ID){
    activeAccountId=String(window.NEXA_ACTIVE_ACCOUNT_ID);
    return activeAccountId;
  }

  try{
    const {data:{user}}=await c.auth.getUser();
    if(!user) return null;

    const playerId=String($('#nexa-profile-player-id')?.textContent||'').trim();
    let q=null;

    if(playerId && playerId!=='—'){
      q=await c.from('player_accounts')
        .select('id')
        .eq('user_id',user.id)
        .eq('player_id',playerId)
        .maybeSingle();
    }

    if(!q?.data?.id){
      q=await c.from('player_accounts')
        .select('id')
        .eq('user_id',user.id)
        .order('is_main',{ascending:false})
        .order('created_at')
        .limit(1)
        .maybeSingle();
    }

    if(q?.data?.id){
      activeAccountId=String(q.data.id);
      window.NEXA_ACTIVE_ACCOUNT_ID=activeAccountId;
    }
  }catch(e){
    console.warn('V48 resolveAccount',e?.message||e);
  }

  return activeAccountId;
}

function rarityOf(i){
  const s=String(i?.rarity||i?.tier||i?.metadata?.rarity||i?.metadata?.tier||'')
    .trim().toLowerCase();
  if(s.includes('legend')||s.includes('myth')) return 'legendary';
  if(s.includes('epic')||s.includes('purple')) return 'epic';
  if(s.includes('rare')||s.includes('blue')) return 'rare';
  if(s.includes('common')||s.includes('green')) return 'common';
  return s;
}

function heroEligible(i){
  if(i?.item_type!=='hero') return true;
  const rarity=rarityOf(i);
  if(rarity==='rare'||rarity==='common') return false;
  if(Number(i?.generation||0)>0) return true;
  return rarity==='epic';
}

const PET_MAX={
  'Cave Hyena':50,
  'Arctic Wolf':60,
  'Musk Ox':60,
  'Giant Tapir':70,
  'Titan Roc':70,
  'Snow Leopard':80,
  'Giant Elk':80,
  'Cave Lion':100,
  'Snow Ape':100,
  'Iron Rhino':100,
  'Saber-tooth Tiger':100,
  'Mammoth':100,
  'Frost Gorilla':100,
  'Frostscale Chameleon':100
};

function mergeProgress(base,extra){
  return Object.assign({},base&&typeof base==='object'?base:{},extra||{});
}

function maxProgressFor(i,category,existing={}){
  const md=i?.metadata||{};
  const p=existing&&typeof existing==='object'?structuredClone(existing):{};

  if(category==='heroes'){
    const skills=Array.isArray(md.expedition_skills)?md.expedition_skills:[];
    const hero_skills={};
    skills.forEach(s=>{ if(s?.name) hero_skills[s.name]=Number(s.max_level||5); });
    return mergeProgress(p,{
      star_step:30,
      stars:5,
      hero_skills,
      widget_level:rarityOf(i)==='legendary'?10:0
    });
  }

  if(category==='experts'){
    const skills=Array.isArray(md.skills)?md.skills:[];
    const expert_skills={};
    skills.forEach(s=>{ if(s?.name) expert_skills[s.name]=Number(s.max_level||10); });
    return mergeProgress(p,{
      affinity:Number(md.relationship_max||100),
      expert_skills
    });
  }

  if(category==='pets'){
    const petSkill=md.skill||md.pet_skill||{};
    const maxSkill=Number(petSkill.max_level||md.skill_max||10);
    return mergeProgress(p,{
      level:Number(PET_MAX[i.name]||md.max_level||100),
      pet_skill:maxSkill,
      skill_level:maxSkill
    });
  }

  if(category==='troops'){
    return mergeProgress(p,{
      tier:12,
      fc_level:10,
      t11_unlocked:true,
      t12_unlocked:true,
      advanced_skill:3
    });
  }

  if(category==='gear'){
    return mergeProgress(p,{
      gear_quality:'Red',
      gear_tier:6,
      gear_stars:3,
      gear_substep:4
    });
  }

  if(category==='charms'){
    return mergeProgress(p,{
      charm_levels:[18,18,18],
      charm_substeps:[5,5,5],
      charm_1:18,
      charm_2:18,
      charm_3:18
    });
  }

  return p;
}

function isMaxed(i,category,p={}){
  if(category==='heroes'){
    if(Number(p.star_step||0)<30) return false;
    if(rarityOf(i)==='legendary' && Number(p.widget_level||0)<10) return false;
    const skills=Array.isArray(i?.metadata?.expedition_skills)?i.metadata.expedition_skills:[];
    return skills.every(s=>Number(p?.hero_skills?.[s.name]||0)>=Number(s.max_level||5));
  }

  if(category==='experts'){
    if(Number(p.affinity||0)<Number(i?.metadata?.relationship_max||100)) return false;
    const skills=Array.isArray(i?.metadata?.skills)?i.metadata.skills:[];
    return skills.every(s=>Number(p?.expert_skills?.[s.name]||0)>=Number(s.max_level||10));
  }

  if(category==='pets'){
    const maxLv=Number(PET_MAX[i.name]||i?.metadata?.max_level||100);
    const petSkill=i?.metadata?.skill||i?.metadata?.pet_skill||{};
    const maxSkill=Number(petSkill.max_level||i?.metadata?.skill_max||10);
    return Number(p.level||0)>=maxLv && Number(p.pet_skill||p.skill_level||0)>=maxSkill;
  }

  if(category==='troops'){
    return Number(p.tier||0)>=12 &&
      Number(p.fc_level||0)>=10 &&
      p.t11_unlocked===true &&
      p.t12_unlocked===true &&
      Number(p.advanced_skill||0)>=3;
  }

  if(category==='gear'){
    return String(p.gear_quality||'')==='Red' &&
      Number(p.gear_tier||0)>=6 &&
      Number(p.gear_stars||0)>=3 &&
      Number(p.gear_substep||0)>=4;
  }

  if(category==='charms'){
    const l=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
    const s=Array.isArray(p.charm_substeps)?p.charm_substeps:[0,0,0];
    return [0,1,2].every(n=>Number(l[n]||0)>=18 && Number(s[n]||0)>=5);
  }

  return false;
}

function currentCategory(){
  return $('.v33-cat.active')?.dataset?.v33Cat || 'heroes';
}

function itemTypeForCategory(category){
  return ({
    heroes:'hero',
    experts:'expert',
    troops:'troop',
    pets:'pet',
    gear:'chief_gear',
    charms:'chief_gear'
  })[category]||'hero';
}

function labelForCategory(category){
  return ({
    heroes:'HEROES',
    experts:'EXPERTS',
    troops:'TROOPS',
    pets:'PETS',
    gear:'CHIEF GEAR',
    charms:'CHARMS'
  })[category]||String(category).toUpperCase();
}

function inventoryMap(){
  return new Map(cachedInventory.map(x=>[String(x.library_item_id),x]));
}

async function refreshData(){
  const c=sb();
  if(!c) return false;
  const id=await resolveAccount();
  if(!id) return false;

  try{
    const [lib,inv,acct]=await Promise.all([
      c.from('nexa_library_items')
        .select('*')
        .eq('is_active',true)
        .eq('is_visible',true)
        .order('generation')
        .order('sort_order')
        .order('name'),
      c.from('player_library_inventory')
        .select('*')
        .eq('player_account_id',id),
      c.from('player_accounts')
        .select('rally_capacity,hero_gear')
        .eq('id',id)
        .maybeSingle()
    ]);

    if(!lib.error) cachedItems=lib.data||[];
    if(!inv.error) cachedInventory=inv.data||[];

    if(!acct.error){
      cachedBattleData={
        rally_capacity:acct.data?.rally_capacity??null,
        hero_gear:acct.data?.hero_gear&&typeof acct.data.hero_gear==='object'
          ?acct.data.hero_gear:{}
      };
    }else{
      cachedBattleData={rally_capacity:null,hero_gear:{},schema_error:acct.error.message};
    }
    return true;
  }catch(e){
    console.warn('V48 refreshData',e?.message||e);
    return false;
  }
}

function ensureTools(){
  const shell=$('#nexa-v33');
  const cats=$('#v33-cats');
  const filters=$('#v33-filters');
  if(!shell||!cats||!filters) return;

  if(!$('#v48-profile-tools')){
    const top=document.createElement('div');
    top.id='v48-profile-tools';
    top.innerHTML=`
      <button type="button" class="v48-tool-btn max-all" data-v48-max-all>✦ MAX ALL</button>
      <button type="button" class="v48-tool-btn battle" data-v48-battle-data>◈ BATTLE DATA</button>
    `;
    cats.before(top);
  }

  if(!$('#v48-category-tools')){
    const tools=document.createElement('div');
    tools.id='v48-category-tools';
    tools.innerHTML=`
      <button type="button" class="v48-category-max" data-v48-category-max>✓ MAXED</button>
      <button type="button" class="v48-info" data-v48-info aria-label="About Maxed Selection">i</button>
    `;
    filters.before(tools);
  }
}

function cardImage(i){
  if(i?.item_type==='chief_gear'){
    const key=String(i.name||'').toLowerCase().replace(/\s+/g,'');
    const file={
      helmet:'helmet',
      watch:'watch',
      coat:'chestplate',
      pants:'pants',
      belt:'ring',
      ring:'ring',
      shortstaff:'staff'
    }[key];
    if(file) return `/assets/nexa/chief-gear-red/chiefgear_${file}_red_t6.png${file==='staff'?'':''}`;
  }
  return i?.image_url||'';
}

function decorateMaxBadges(){
  const category=currentCategory();
  const map=inventoryMap();

  $$('[data-v33-item]').forEach(card=>{
    card.querySelector('.v48-max-badge')?.remove();

    const id=String(card.dataset.v33Item||'');
    const item=cachedItems.find(x=>String(x.id)===id);
    if(!item) return;

    const row=map.get(id);
    const progress=row?.progress||{};
    if(!isMaxed(item,category,progress)) return;

    const planet=$('.v33-planet',card);
    if(!planet) return;

    const badge=document.createElement('span');
    badge.className='v48-max-badge';
    badge.textContent='MAX';
    planet.appendChild(badge);
  });
}

function scheduleDecorate(delay=80){
  setTimeout(async()=>{
    ensureTools();
    if(!cachedItems.length) await refreshData();
    decorateMaxBadges();
  },delay);
}

function closeOverlay(){
  $('#v48-overlay')?.remove();
}

function overlayShell(kicker,title,help,body,actions=''){
  closeOverlay();
  const o=document.createElement('div');
  o.className='v48-overlay';
  o.id='v48-overlay';
  o.innerHTML=`
    <section class="v48-modal" role="dialog" aria-modal="true">
      <div class="v48-modal-head">
        <div>
          <div class="v48-kicker">${esc(kicker)}</div>
          <h3>${esc(title)}</h3>
          ${help?`<p class="v48-help">${esc(help)}</p>`:''}
        </div>
        <button type="button" class="v48-close" data-v48-close aria-label="Close">×</button>
      </div>
      ${body}
      ${actions}
      <div class="v48-msg"></div>
    </section>
  `;
  document.body.appendChild(o);
  return o;
}

function showInfo(){
  overlayShell(
    'PROFILE SHORTCUT',
    'Maxed Selection',
    'Select the items you currently have fully maxed. NEXA will set all applicable levels, skills and upgrades to their maximum saved values.',
    `<div class="v48-confirm-note">
      A small ✓ MAX marker appears automatically when an item is truly maxed.
      If you later lower a star, skill, level or upgrade, the marker disappears automatically.
      Unchecking an item in the selector does not downgrade it; edit that item normally if you need to lower a value.
    </div>`,
    `<div class="v48-actions"><button type="button" class="v48-apply" data-v48-close>GOT IT</button></div>`
  );
}

function categoryItems(category){
  const type=itemTypeForCategory(category);
  let arr=cachedItems.filter(i=>i.item_type===type);
  if(category==='heroes') arr=arr.filter(heroEligible);
  return arr;
}

function itemSubtitle(i,category){
  if(category==='heroes'){
    const g=Number(i.generation||0);
    return `${g?`GEN ${g}`:'EPIC'} • ${String(i.troop_type||i.rarity||'').toUpperCase()}`;
  }
  if(category==='experts'||category==='pets') return `GEN ${Number(i.generation||1)}`;
  if(category==='troops') return String(i.troop_type||'TROOP').toUpperCase();
  if(category==='gear'||category==='charms') return String(i.metadata?.benefits||'CHIEF GEAR').toUpperCase();
  return '';
}

async function openCategoryMax(){
  await refreshData();
  const category=currentCategory();
  const arr=categoryItems(category);
  const map=inventoryMap();

  const list=arr.map(i=>{
    const p=map.get(String(i.id))?.progress||{};
    const checked=isMaxed(i,category,p);
    const img=i.image_url||'';
    return `
      <label class="v48-select-row">
        <input type="checkbox" data-v48-max-item="${esc(i.id)}" ${checked?'checked':''}>
        ${img?`<img src="${esc(img)}" alt="" onerror="this.style.opacity=.18">`:`<span class="v48-placeholder">✦</span>`}
        <span><b>${esc(category==='charms'?`${i.name==='Belt'?'Ring':i.name} Charms`:i.name)}</b><small>${esc(itemSubtitle(i,category))}</small></span>
      </label>
    `;
  }).join('');

  overlayShell(
    'MAXED SELECTION',
    labelForCategory(category),
    'Choose the items that are fully maxed, then apply. Existing non-maxed items are not changed.',
    `<div class="v48-list">${list||'<p class="v48-help">No items are available in this category.</p>'}</div>`,
    `<div class="v48-actions">
      <button type="button" class="v48-cancel" data-v48-close>CANCEL</button>
      <button type="button" class="v48-apply" data-v48-apply-category="${esc(category)}">APPLY MAX</button>
    </div>`
  );
}

async function upsertProgress(item,category,currentProgress,userId){
  const c=sb();
  if(!c||!activeAccountId) return {error:{message:'No active account'}};

  const progress=maxProgressFor(item,category,currentProgress||{});
  return c.from('player_library_inventory').upsert({
    user_id:userId,
    player_account_id:activeAccountId,
    library_item_id:item.id,
    owned:true,
    progress,
    updated_at:new Date().toISOString()
  },{
    onConflict:'player_account_id,library_item_id'
  });
}

async function applyCategoryMax(category){
  if(busy) return;
  busy=true;

  const btn=$(`[data-v48-apply-category="${CSS.escape(category)}"]`);
  const msg=$('.v48-msg','#v48-overlay');
  if(btn) btn.disabled=true;
  if(msg) msg.textContent='Saving…';

  try{
    await refreshData();
    const c=sb();
    const {data:{user}}=await c.auth.getUser();
    if(!user) throw new Error('Please sign in again.');

    const selected=new Set(
      $$('[data-v48-max-item]:checked','#v48-overlay').map(x=>String(x.dataset.v48MaxItem))
    );

    const map=inventoryMap();
    const targets=categoryItems(category).filter(i=>selected.has(String(i.id)));

    for(const item of targets){
      const current=map.get(String(item.id))?.progress||{};
      const q=await upsertProgress(item,category,current,user.id);
      if(q.error) throw q.error;
    }

    if(msg) msg.textContent=`Saved ${targets.length} maxed item${targets.length===1?'':'s'} ✓`;

    await refreshData();
    setTimeout(()=>{
      closeOverlay();
      window.dispatchEvent(new Event('pageshow'));
      scheduleDecorate(420);
    },450);
  }catch(e){
    if(msg) msg.textContent=e?.message||String(e);
    if(btn) btn.disabled=false;
  }finally{
    busy=false;
  }
}

function openMaxAllConfirm(){
  overlayShell(
    'PROFILE SHORTCUT',
    'Max All Profile?',
    'This will set every current Profile item to its maximum supported values for this account.',
    `<div class="v48-confirm-note">
      This affects Heroes, Experts, Pets, Troops, Chief Gear and Charms.
      It will also mark Main Hero Gear and the second Hero Gear set as maxed.
      Rally Capacity is NOT guessed or changed because that number is unique to your account.
    </div>`,
    `<div class="v48-actions">
      <button type="button" class="v48-cancel" data-v48-close>CANCEL</button>
      <button type="button" class="v48-apply v48-danger" data-v48-confirm-max-all>YES, MAX ALL</button>
    </div>`
  );
}

async function applyMaxAll(){
  if(busy) return;
  busy=true;

  const btn=$('[data-v48-confirm-max-all]');
  const msg=$('.v48-msg','#v48-overlay');
  if(btn) btn.disabled=true;
  if(msg) msg.textContent='Maxing Profile…';

  try{
    await refreshData();
    const c=sb();
    const {data:{user}}=await c.auth.getUser();
    if(!user) throw new Error('Please sign in again.');

    const map=inventoryMap();
    const groups=[
      ['heroes',categoryItems('heroes')],
      ['experts',categoryItems('experts')],
      ['pets',categoryItems('pets')],
      ['troops',categoryItems('troops')],
      ['gear',categoryItems('gear')],
      ['charms',categoryItems('charms')]
    ];

    let count=0;

    /* Gear + Charms use the same library rows.
       Each pass merges the existing progress so neither side erases the other. */
    for(const [category,arr] of groups){
      for(const item of arr){
        const current=map.get(String(item.id))?.progress||{};
        const q=await upsertProgress(item,category,current,user.id);
        if(q.error) throw q.error;

        const merged=maxProgressFor(item,category,current);
        const prior=map.get(String(item.id));
        map.set(String(item.id),{
          ...(prior||{}),
          library_item_id:item.id,
          progress:merged
        });
        count++;
      }
    }

    /* Hero Gear is account-wide simplified battle data.
       Rally Capacity is intentionally preserved. */
    const existingHG=cachedBattleData.hero_gear||{};
    const heroGear={
      ...existingHG,
      main_set_maxed:true,
      second_set_maxed:true,
      updated_at:new Date().toISOString()
    };

    const accountUpdate=await c.from('player_accounts')
      .update({hero_gear:heroGear,updated_at:new Date().toISOString()})
      .eq('id',activeAccountId);

    if(accountUpdate.error) throw accountUpdate.error;

    if(msg) msg.textContent=`Profile maxed ✓`;

    await refreshData();
    setTimeout(()=>{
      closeOverlay();
      window.dispatchEvent(new Event('pageshow'));
      scheduleDecorate(500);
    },500);
  }catch(e){
    if(msg) msg.textContent=e?.message||String(e);
    if(btn) btn.disabled=false;
  }finally{
    busy=false;
  }
}

async function openBattleData(){
  await refreshData();

  const hg=cachedBattleData.hero_gear||{};
  const rally=cachedBattleData.rally_capacity??'';
  const main=hg.main_set_maxed===true;
  const second=hg.second_set_maxed===true;
  const schemaError=cachedBattleData.schema_error;

  const body=`
    ${schemaError?`<div class="v48-confirm-note">Database setup needed: ${esc(schemaError)}</div>`:''}
    <div class="v48-battle-grid">
      <div class="v48-field">
        <label>RALLY CAPACITY</label>
        <input type="number" inputmode="numeric" min="0" step="1" data-v48-rally-capacity value="${esc(rally)}" placeholder="Example: 1250000">
        <small>Maximum troop capacity when you start a rally. NEXA does not guess this value.</small>
      </div>

      <div class="v48-field">
        <label>MAIN MARCH HERO GEAR</label>
        <div class="v48-toggle-row">
          <button type="button" class="v48-toggle ${main?'active':''}" data-v48-main-gear="1">MAXED</button>
          <button type="button" class="v48-toggle ${!main?'active':''}" data-v48-main-gear="0">NOT MAXED</button>
        </div>
        <small>This is the Hero Gear set used on your strongest/main march.</small>
      </div>

      <div class="v48-field">
        <label>SECOND MAXED HERO GEAR SET</label>
        <div class="v48-toggle-row">
          <button type="button" class="v48-toggle ${second?'active':''}" data-v48-second-gear="1">YES</button>
          <button type="button" class="v48-toggle ${!second?'active':''}" data-v48-second-gear="0">NO</button>
        </div>
        <small>Useful for players who can field another strong rally/march with a second fully maxed set.</small>
      </div>
    </div>
  `;

  overlayShell(
    'BATTLE DATA',
    'Rally & Hero Gear',
    'These fields are available to every player. Rally Leads can later be required to complete them for battle planning.',
    body,
    `<div class="v48-actions">
      <button type="button" class="v48-cancel" data-v48-close>CANCEL</button>
      <button type="button" class="v48-apply" data-v48-save-battle>SAVE</button>
    </div>`
  );
}

function setToggle(group,value){
  $$(`[data-v48-${group}-gear]`,'#v48-overlay').forEach(b=>{
    b.classList.toggle('active',b.dataset[`v48${group[0].toUpperCase()+group.slice(1)}Gear`]===String(value));
  });
}

async function saveBattleData(){
  if(busy) return;
  busy=true;

  const btn=$('[data-v48-save-battle]');
  const msg=$('.v48-msg','#v48-overlay');
  if(btn) btn.disabled=true;
  if(msg) msg.textContent='Saving…';

  try{
    const c=sb();
    await resolveAccount();
    if(!c||!activeAccountId) throw new Error('No active account found.');

    const rallyRaw=String($('[data-v48-rally-capacity]')?.value||'').trim();
    const rally=rallyRaw===''?null:Math.max(0,Math.floor(Number(rallyRaw)||0));

    const main=$('[data-v48-main-gear="1"]')?.classList.contains('active')===true;
    const second=$('[data-v48-second-gear="1"]')?.classList.contains('active')===true;

    const heroGear={
      ...(cachedBattleData.hero_gear||{}),
      main_set_maxed:main,
      second_set_maxed:second,
      updated_at:new Date().toISOString()
    };

    const q=await c.from('player_accounts')
      .update({
        rally_capacity:rally,
        hero_gear:heroGear,
        updated_at:new Date().toISOString()
      })
      .eq('id',activeAccountId)
      .select('rally_capacity,hero_gear')
      .maybeSingle();

    if(q.error) throw q.error;

    cachedBattleData={
      rally_capacity:q.data?.rally_capacity??rally,
      hero_gear:q.data?.hero_gear||heroGear
    };

    if(msg) msg.textContent='Battle data saved ✓';
    setTimeout(closeOverlay,450);
  }catch(e){
    if(msg) msg.textContent=e?.message||String(e);
    if(btn) btn.disabled=false;
  }finally{
    busy=false;
  }
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-v48-close]')){
    closeOverlay();
    return;
  }

  if(e.target.id==='v48-overlay'){
    closeOverlay();
    return;
  }

  if(e.target.closest?.('[data-v48-info]')){
    showInfo();
    return;
  }

  if(e.target.closest?.('[data-v48-category-max]')){
    openCategoryMax();
    return;
  }

  if(e.target.closest?.('[data-v48-max-all]')){
    openMaxAllConfirm();
    return;
  }

  if(e.target.closest?.('[data-v48-confirm-max-all]')){
    applyMaxAll();
    return;
  }

  const apply=e.target.closest?.('[data-v48-apply-category]');
  if(apply){
    applyCategoryMax(apply.dataset.v48ApplyCategory);
    return;
  }

  if(e.target.closest?.('[data-v48-battle-data]')){
    openBattleData();
    return;
  }

  if(e.target.closest?.('[data-v48-save-battle]')){
    saveBattleData();
    return;
  }

  const mainToggle=e.target.closest?.('[data-v48-main-gear]');
  if(mainToggle){
    $$('[data-v48-main-gear]','#v48-overlay').forEach(b=>
      b.classList.toggle('active',b===mainToggle)
    );
    return;
  }

  const secondToggle=e.target.closest?.('[data-v48-second-gear]');
  if(secondToggle){
    $$('[data-v48-second-gear]','#v48-overlay').forEach(b=>
      b.classList.toggle('active',b===secondToggle)
    );
    return;
  }

  /* V33 owns category/filter/detail state.
     We only re-read and decorate after V33 finishes its own click handler. */
  if(e.target.closest?.('[data-v33-cat],[data-v33-gen],[data-v33-save],[data-v33-reset]')){
    scheduleDecorate(220);
  }
},false);

window.addEventListener('nexa:account-changed',e=>{
  const id=String(e.detail?.accountId||'');
  if(id){
    activeAccountId=id;
    cachedItems=[];
    cachedInventory=[];
    cachedBattleData={rally_capacity:null,hero_gear:{}};
  }
  setTimeout(async()=>{
    await refreshData();
    ensureTools();
    decorateMaxBadges();
  },350);
});

window.addEventListener('pageshow',()=>{
  setTimeout(async()=>{
    await refreshData();
    ensureTools();
    decorateMaxBadges();
  },300);
});

async function boot(){
  injectCSS();

  [80,220,500,1000,1800].forEach(ms=>{
    setTimeout(()=>{
      ensureTools();
      decorateMaxBadges();
    },ms);
  });

  await refreshData();
  ensureTools();
  decorateMaxBadges();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}

})();
