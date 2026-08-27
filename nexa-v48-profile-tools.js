/* NEXA V48.4 — PROFILE LAYOUT FINAL + CONTINUOUS MASTERY + CLEAN MAX
   COMPLETE REPLACEMENT for: nexa-v48-profile-tools.js

   Extends stable V33.6 without taking Profile ownership.
   Includes:
   - cleaner Profile tool layout
   - category MAX multi-select + automatic ✓ MAX badges
   - fixed Apply Max persistence
   - Chief Gear MAX selector uses Red T6 visuals
   - Charms MAX selector uses Lv18 charm visuals
   - Rally Capacity + Deployment Capacity
   - Main March Hero Gear: MAXED / CUSTOM with continuous Mastery 0–20
   - Second March Hero Gear: MAXED / CUSTOM / NONE with continuous Mastery 0–20
   - Empowerment appears only for Legendary / Red Hero Gear
   - no MutationObserver, no manual scrollLeft, no touchmove preventDefault
*/
(()=>{
'use strict';
if(window.__NEXA_V484_PROFILE_TOOLS__) return;
window.__NEXA_V484_PROFILE_TOOLS__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

let localSb=null;
let accountId=null;
let items=[];
let inventory=[];
let accountData={rally_capacity:null,deployment_capacity:null,hero_gear:{}};
let busy=false;
let battleDraft=null;

function sb(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient){
    localSb=window.supabase.createClient(
      'https://dfxcxboxrkfmrnsgpyin.supabase.co',
      'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
    );
  }
  return localSb;
}

const CATS={
  heroes:{label:'HEROES',type:'hero'},
  experts:{label:'EXPERTS',type:'expert'},
  troops:{label:'TROOPS',type:'troop'},
  pets:{label:'PETS',type:'pet'},
  gear:{label:'CHIEF GEAR',type:'chief_gear'},
  charms:{label:'CHARMS',type:'chief_gear'}
};

const PET_MAX={
  'Cave Hyena':50,'Arctic Wolf':60,'Musk Ox':60,'Giant Tapir':70,'Titan Roc':70,
  'Snow Leopard':80,'Giant Elk':80,'Cave Lion':100,'Snow Ape':100,'Iron Rhino':100,
  'Saber-tooth Tiger':100,'Mammoth':100,'Frost Gorilla':100,'Frostscale Chameleon':100
};

const HERO_GEAR_TYPES=['infantry','lancer','marksman'];
const HERO_GEAR_SLOTS=[
  ['headgear','Headgear / Goggles'],
  ['gloves','Gloves'],
  ['belt','Belt'],
  ['boots','Boots']
];

function injectCSS(){
  $('#nexa-v481-css')?.remove();
  const st=document.createElement('style');
  st.id='nexa-v481-css';
  st.textContent=`
  #v48-profile-tools{
    position:relative;z-index:4;display:grid;grid-template-columns:1fr 1fr;gap:8px;
    padding:5px 14px 7px
  }
  .v48-tool-btn{
    appearance:none;-webkit-appearance:none;min-height:37px;border-radius:14px;
    background:rgba(6,13,31,.62);font-size:9px;font-weight:950;letter-spacing:.12em
  }
  .v48-tool-btn.max-all{border:1px solid rgba(80,225,255,.48);color:#9af3ff;box-shadow:0 0 13px rgba(53,215,255,.09)}
  .v48-tool-btn.battle{border:1px solid rgba(193,105,255,.48);color:#e9c5ff;box-shadow:0 0 13px rgba(180,76,255,.08)}

  #v48-category-tools{
    position:relative;z-index:4;display:flex;justify-content:flex-end;align-items:center;
    padding:5px 14px 3px;margin-top:1px
  }
  .v48-category-max{
    appearance:none;-webkit-appearance:none;min-height:30px;padding:6px 10px;
    border-radius:999px;border:1px solid rgba(77,226,255,.40);
    background:rgba(5,17,37,.72);color:#91f1ff;font-size:8px;font-weight:950;letter-spacing:.10em
  }
  .v48-category-max .info{
    display:inline-grid;place-items:center;margin-left:6px;width:17px;height:17px;border-radius:50%;
    border:1px solid rgba(193,143,255,.45);color:#d7bcff;font-size:9px;letter-spacing:0
  }

  .v48-max-badge{
    position:absolute;right:-4px;top:-5px;z-index:8;pointer-events:none;
    padding:2px 5px;border-radius:999px;border:1px solid rgba(87,235,179,.74);
    background:rgba(5,31,28,.94);color:#97f4cd;font-size:7px;font-weight:1000;letter-spacing:.05em;
    box-shadow:0 0 9px rgba(53,230,166,.25)
  }
  .v48-max-badge:before{content:"✓ ";}

  /* Profile header cleanup: Guide removed; Edit stays compact beside account identity. */
  #nexa-profile-modal #nexa-v425-profile-actions .nexa-v425-guide,
  #nexa-profile-modal [data-nexa-profile-guide],
  #nexa-profile-modal #nexa-profile-guide{display:none!important}
  #nexa-profile-modal .v481-edit-mini{
    display:inline-flex!important;align-items:center!important;gap:4px!important;padding:5px 8px!important;
    min-height:27px!important;border-radius:999px!important;font-size:8px!important;
    border:1px solid rgba(100,204,255,.28)!important;background:rgba(8,18,41,.58)!important;color:#d6e5ff!important
  }
  #nexa-profile-modal .nexa-profile-edit-row.v481-moved{margin:0!important;display:inline-flex!important}

  .v48-overlay{
    position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:14px;
    background:rgba(1,3,12,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)
  }
  .v48-modal{
    width:min(540px,100%);max-height:calc(100dvh - 28px);overflow-y:auto;-webkit-overflow-scrolling:touch;
    box-sizing:border-box;padding:17px;border-radius:24px;color:#fff;
    border:1px solid rgba(132,95,255,.58);
    background:radial-gradient(circle at 12% 0%,rgba(126,70,255,.20),transparent 35%),linear-gradient(160deg,#111735,#060a1a 70%,#03050d);
    box-shadow:0 0 35px rgba(93,60,255,.18)
  }
  .v48-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .v48-kicker{color:#8eeaff;font-size:8px;font-weight:1000;letter-spacing:.18em}
  .v48-modal h3{margin:5px 0 5px;font-size:21px;line-height:1.08}
  .v48-help{margin:0;color:#aab4cf;font-size:11px;line-height:1.5}
  .v48-close{
    appearance:none;width:34px;height:34px;min-width:34px;border-radius:50%;
    border:1px solid rgba(255,255,255,.14);background:#0b1026;color:#fff;font-size:21px
  }
  .v48-msg{min-height:18px;margin-top:9px;text-align:center;color:#8fe8ff;font-size:9px}

  .v48-list{display:grid;gap:7px;margin-top:13px}
  .v48-select-row{
    display:grid;grid-template-columns:20px 44px minmax(0,1fr);gap:9px;align-items:center;
    min-height:54px;padding:7px 9px;border-radius:14px;border:1px solid rgba(111,130,188,.18);
    background:linear-gradient(145deg,rgba(7,13,31,.70),rgba(3,8,22,.58))
  }
  .v48-select-row input{width:17px;height:17px;margin:0;accent-color:#73e7ff}
  .v48-select-row .visual{width:42px;height:42px;display:grid;place-items:center;position:relative}
  .v48-select-row .visual>img{max-width:42px;max-height:42px;width:100%;height:100%;object-fit:contain;border-radius:9px;background:rgba(255,255,255,.025)}
  .v48-select-row .visual.charm-trio{
    display:flex;align-items:center;justify-content:center;gap:2px;width:44px;height:42px
  }
  .v48-charm-gem{
    width:12px;height:25px;border-radius:7px 7px 9px 9px;display:grid;place-items:center;
    border:1px solid rgba(170,118,255,.52);
    background:linear-gradient(180deg,rgba(133,83,255,.40),rgba(32,18,72,.70));
    color:#eee7ff;font-size:7px;font-weight:1000;line-height:1;
    box-shadow:inset 0 0 9px rgba(168,99,255,.17),0 0 7px rgba(124,86,255,.10)
  }
  .v48-charm-gem:nth-child(2){transform:translateY(-2px)}
  .v48-charm-gem small{font-size:5px;color:#d9caff;letter-spacing:0}
  .v48-select-row b{display:block;font-size:11px}
  .v48-select-row small{display:block;color:#8793b5;font-size:7px;margin-top:3px;line-height:1.35}

  .v48-actions{display:flex;gap:8px;margin-top:16px}
  .v48-actions button{
    flex:1;min-height:42px;border-radius:999px;font-size:10px;font-weight:950;letter-spacing:.08em
  }
  .v48-cancel{border:1px solid rgba(255,255,255,.14);background:#0a1025;color:#acb5d0}
  .v48-apply{border:1px solid rgba(87,224,255,.55);background:rgba(20,91,120,.34);color:#b8f8ff}
  .v48-danger{border-color:rgba(255,191,88,.55)!important;background:rgba(106,64,10,.30)!important;color:#ffd99b!important}

  .v48-battle-grid{display:grid;gap:10px;margin-top:14px}
  .v48-field{
    padding:11px;border-radius:15px;border:1px solid rgba(111,130,188,.18);background:rgba(4,9,24,.52)
  }
  .v48-field>label,.v48-sub-label{
    display:block;color:#9ba8cb;font-size:8px;font-weight:950;letter-spacing:.13em;margin-bottom:7px
  }
  .v48-field input,.v48-field select,.v48-gear-cell select{
    width:100%;box-sizing:border-box;min-height:40px;padding:8px 10px;border-radius:11px;
    border:1px solid rgba(126,145,205,.26);background:#090f27;color:#fff;font:inherit;font-size:12px
  }
  .v48-field small{display:block;color:#7f8aa9;font-size:9px;line-height:1.45;margin-top:7px}
  .v48-toggle-row{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}
  .v48-toggle-row.three{grid-template-columns:repeat(3,1fr)}
  .v48-toggle{
    appearance:none;min-height:39px;border-radius:11px;border:1px solid rgba(126,145,205,.24);
    background:#090f27;color:#8995b8;font-size:9px;font-weight:950
  }
  .v48-toggle.active{
    border-color:#61e2c0;color:#baffea;background:rgba(13,74,61,.34);box-shadow:0 0 11px rgba(73,221,176,.12)
  }

  .v48-custom-gear{display:grid;gap:10px;margin-top:10px}
  .v48-troop-gear{
    border:1px solid rgba(119,101,255,.18);border-radius:15px;padding:10px;background:rgba(7,11,28,.55)
  }
  .v48-troop-title{font-size:9px;font-weight:1000;letter-spacing:.13em;color:#c9b8ff;margin-bottom:8px}
  .v48-gear-piece{
    display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;align-items:start;
    padding:9px 0;border-top:1px solid rgba(255,255,255,.06)
  }
  .v48-gear-piece:first-of-type{border-top:0;padding-top:0}
  .v48-gear-icon{
    width:28px;height:28px;border-radius:9px;display:grid;place-items:center;
    border:1px solid rgba(123,105,255,.25);background:rgba(15,19,46,.76);font-size:15px
  }
  .v48-gear-piece b{display:block;font-size:10px;margin-bottom:6px}
  .v48-gear-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
  .v48-gear-cell label{display:block;color:#7f8aab;font-size:7px;font-weight:900;letter-spacing:.08em;margin-bottom:3px}
  .v48-gear-cell select{min-height:34px;padding:5px 7px;font-size:10px}

  .v48-troop-chooser{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:9px}
  .v48-troop-card{
    appearance:none;min-height:68px;padding:8px 6px;border-radius:14px;
    border:1px solid rgba(121,105,255,.22);background:rgba(7,12,31,.62);color:#d9ddf8;
    display:grid;gap:4px;place-items:center;text-align:center
  }
  .v48-troop-card strong{font-size:8px;letter-spacing:.10em}
  .v48-troop-card small{margin:0!important;font-size:7px!important;color:#8792b5!important}
  .v48-troop-card .orb{
    width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:13px;
    border:1px solid rgba(105,220,255,.25);background:rgba(10,25,52,.66)
  }
  .v48-gear-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:9px 0 7px}
  .v48-back{
    appearance:none;border:1px solid rgba(111,135,205,.25);background:#091027;color:#b9c3e0;
    border-radius:999px;min-height:30px;padding:5px 9px;font-size:8px;font-weight:900
  }
  .v48-buff-note{
    margin-top:6px;padding:6px 7px;border-radius:9px;background:rgba(11,27,51,.62);
    color:#8ddff7;font-size:7px;line-height:1.35
  }

  .v48-confirm-note{
    margin-top:12px;padding:10px;border-radius:13px;border:1px solid rgba(255,190,84,.20);
    background:rgba(90,56,8,.15);color:#d4c19b;font-size:9px;line-height:1.5
  }

  @media(max-width:390px){
    #v48-profile-tools{padding-inline:10px}
    #v48-category-tools{padding-inline:10px}
    .v48-gear-fields{grid-template-columns:1fr 1fr}
  }`;
  document.head.appendChild(st);
}

async function resolveAccount(){
  const c=sb();if(!c)return null;
  if(window.NEXA_ACTIVE_ACCOUNT_ID){
    accountId=String(window.NEXA_ACTIVE_ACCOUNT_ID);
    return accountId;
  }
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return null;
    const pid=String($('#nexa-profile-player-id')?.textContent||'').trim();
    let q=null;
    if(pid&&pid!=='—'){
      q=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',pid).maybeSingle();
    }
    if(!q?.data?.id){
      q=await c.from('player_accounts').select('id').eq('user_id',user.id)
        .order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
    }
    if(q?.data?.id){
      accountId=String(q.data.id);
      window.NEXA_ACTIVE_ACCOUNT_ID=accountId;
    }
  }catch(e){console.warn('V48.1 account',e?.message||e)}
  return accountId;
}

async function refreshData(){
  const c=sb();if(!c)return false;
  const id=await resolveAccount();if(!id)return false;
  try{
    const [lib,inv,acct]=await Promise.all([
      c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
      c.from('player_library_inventory').select('*').eq('player_account_id',id),
      c.from('player_accounts').select('rally_capacity,deployment_capacity,hero_gear').eq('id',id).maybeSingle()
    ]);
    if(!lib.error)items=lib.data||[];
    if(!inv.error)inventory=inv.data||[];
    if(!acct.error){
      accountData={
        rally_capacity:acct.data?.rally_capacity??null,
        deployment_capacity:acct.data?.deployment_capacity??null,
        hero_gear:acct.data?.hero_gear&&typeof acct.data.hero_gear==='object'?acct.data.hero_gear:{}
      };
    }
    return true;
  }catch(e){console.warn('V48.1 refresh',e?.message||e);return false}
}

function rarityOf(i){
  const s=String(i?.rarity||i?.tier||i?.metadata?.rarity||i?.metadata?.tier||'').trim().toLowerCase();
  if(s.includes('legend')||s.includes('myth'))return 'legendary';
  if(s.includes('epic')||s.includes('purple'))return 'epic';
  if(s.includes('rare')||s.includes('blue'))return 'rare';
  if(s.includes('common')||s.includes('green'))return 'common';
  return s;
}
function heroEligible(i){
  if(i?.item_type!=='hero')return true;
  const r=rarityOf(i);
  if(r==='rare'||r==='common')return false;
  if(Number(i.generation||0)>0)return true;
  return r==='epic';
}
function activeCategory(){return $('.v33-cat.active')?.dataset?.v33Cat||'heroes'}
function catItems(cat){
  const def=CATS[cat]||CATS.heroes;
  let a=items.filter(i=>i.item_type===def.type);
  if(cat==='heroes')a=a.filter(heroEligible);
  return a;
}
function invMap(){return new Map(inventory.map(x=>[String(x.library_item_id),x]))}

function maxProgress(i,cat,current={}){
  const p=structuredClone(current||{});
  const md=i.metadata||{};
  if(cat==='heroes'){
    const hs={};
    (md.expedition_skills||[]).forEach(s=>{if(s?.name)hs[s.name]=Number(s.max_level||5)});
    return {...p,star_step:30,stars:5,hero_skills:hs,widget_level:rarityOf(i)==='legendary'?10:0};
  }
  if(cat==='experts'){
    const es={};
    (md.skills||[]).forEach(s=>{if(s?.name)es[s.name]=Number(s.max_level||10)});
    return {...p,affinity:Number(md.relationship_max||100),expert_skills:es};
  }
  if(cat==='pets'){
    const sm=md.skill||md.pet_skill||{};
    const sk=Number(sm.max_level||md.skill_max||10);
    return {...p,level:Number(PET_MAX[i.name]||md.max_level||100),pet_skill:sk,skill_level:sk};
  }
  if(cat==='troops')return {...p,tier:12,fc_level:10,t11_unlocked:true,t12_unlocked:true,advanced_skill:3};
  if(cat==='gear')return {...p,gear_quality:'Red',gear_tier:6,gear_stars:3,gear_substep:4};
  if(cat==='charms')return {...p,charm_levels:[18,18,18],charm_substeps:[5,5,5],charm_1:18,charm_2:18,charm_3:18};
  return p;
}

function isMaxed(i,cat,p={}){
  if(cat==='heroes'){
    if(Number(p.star_step||0)<30)return false;
    if(rarityOf(i)==='legendary'&&Number(p.widget_level||0)<10)return false;
    return (i.metadata?.expedition_skills||[]).every(s=>Number(p.hero_skills?.[s.name]||0)>=Number(s.max_level||5));
  }
  if(cat==='experts'){
    if(Number(p.affinity||0)<Number(i.metadata?.relationship_max||100))return false;
    return (i.metadata?.skills||[]).every(s=>Number(p.expert_skills?.[s.name]||0)>=Number(s.max_level||10));
  }
  if(cat==='pets'){
    const sm=i.metadata?.skill||i.metadata?.pet_skill||{};
    return Number(p.level||0)>=Number(PET_MAX[i.name]||i.metadata?.max_level||100) &&
      Number(p.pet_skill||p.skill_level||0)>=Number(sm.max_level||i.metadata?.skill_max||10);
  }
  if(cat==='troops')return Number(p.tier||0)>=12&&Number(p.fc_level||0)>=10&&p.t11_unlocked===true&&p.t12_unlocked===true&&Number(p.advanced_skill||0)>=3;
  if(cat==='gear')return p.gear_quality==='Red'&&Number(p.gear_tier||0)>=6&&Number(p.gear_stars||0)>=3&&Number(p.gear_substep||0)>=4;
  if(cat==='charms'){
    const l=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
    const s=Array.isArray(p.charm_substeps)?p.charm_substeps:[0,0,0];
    return [0,1,2].every(n=>Number(l[n]||0)>=18&&Number(s[n]||0)>=5);
  }
  return false;
}

function pieceKey(i){
  const s=String(i?.name||'').toLowerCase().replace(/\s+/g,'');
  if(s.includes('helmet')||s.includes('head'))return 'helmet';
  if(s.includes('watch'))return 'watch';
  if(s.includes('coat')||s.includes('chest'))return 'coat';
  if(s.includes('pants'))return 'pants';
  if(s.includes('belt')||s.includes('ring'))return 'belt';
  if(s.includes('staff')||s.includes('weapon'))return 'shortstaff';
  return s;
}
function chiefT6Asset(i){
  try{
    const resolver=window.NEXA_CHIEF_GEAR_ASSETS?.get;
    if(typeof resolver==='function'){
      const hit=resolver(i,{gear_quality:'Red',gear_tier:6,gear_stars:3,gear_substep:4});
      if(hit)return hit;
    }
  }catch(_){}
  const file={
    helmet:'helmet',watch:'watch',coat:'chestplate',pants:'pants',belt:'ring',shortstaff:'staff'
  }[pieceKey(i)];
  if(!file)return i.image_url||'';
  return `/assets/nexa/chief-gear-red/chiefgear_${file}_red_t6.png.jpeg`;
}
function charmType(i){
  const k=pieceKey(i);
  if(k==='coat'||k==='pants')return 'infantry';
  if(k==='helmet'||k==='watch')return 'lancer';
  return 'marksman';
}
function visualFor(i,cat){
  if(cat==='gear'){
    return `<span class="visual"><img src="${esc(chiefT6Asset(i))}" alt="${esc(i.name)} T6" onerror="this.onerror=null;this.src='${esc(i.image_url||'')}'"></span>`;
  }
  if(cat==='charms'){
    return `<span class="visual charm-trio" aria-label="Three Level 18 Charms">
      ${[0,1,2].map(()=>`<span class="v48-charm-gem">18</span>`).join('')}
    </span>`;
  }
  const src=i.image_url||'';
  return src?`<span class="visual"><img src="${esc(src)}" alt="" onerror="this.style.opacity=.18"></span>`:`<span class="visual">✦</span>`;
}

function subtitle(i,cat){
  if(cat==='gear')return `${String(i.metadata?.benefits||i.troop_type||'').toUpperCase()} • RED T6 • 3★`;
  if(cat==='charms')return `${String(charmType(i)).toUpperCase()} • 3 × LV18`;
  if(cat==='heroes')return `${Number(i.generation||0)?'GEN '+Number(i.generation):'EPIC'} • ${String(i.troop_type||i.rarity||'').toUpperCase()}`;
  if(cat==='experts'||cat==='pets')return `GEN ${Number(i.generation||1)}`;
  if(cat==='troops')return String(i.troop_type||i.name||'TROOP').toUpperCase();
  return '';
}

function ensureTools(){
  const cats=$('#v33-cats'),filters=$('#v33-filters');
  if(!cats||!filters)return;

  if(!$('#v48-profile-tools')){
    const top=document.createElement('div');
    top.id='v48-profile-tools';
    top.innerHTML=`<button type="button" class="v48-tool-btn max-all" data-v48-max-all>✦ MAX ALL</button>
      <button type="button" class="v48-tool-btn battle" data-v48-battle>◈ BATTLE DATA</button>`;
    cats.before(top);
  }
  if(!$('#v48-category-tools')){
    const x=document.createElement('div');
    x.id='v48-category-tools';
    x.innerHTML=`<button type="button" class="v48-category-max" data-v48-category-max>✓ MAX <span class="info">i</span></button>`;
    filters.after(x);
  }
  organizeHeader();
}

function removeGuide(modal){
  if(!modal)return;
  [
    $('.nexa-v425-guide',modal),
    $('[data-nexa-profile-guide]',modal),
    $('#nexa-profile-guide',modal)
  ].filter(Boolean).forEach(x=>x.remove());

  const actions=$('#nexa-v425-profile-actions',modal);
  if(actions){
    $$('button',actions).forEach(b=>{
      if(b.id!=='nexa-v425-ministry')b.remove();
    });
    if(!actions.children.length)actions.remove();
  }
}

function hideLegacyDeploymentEditor(){
  const value=accountData?.deployment_capacity;
  $$('input,select,textarea').forEach(input=>{
    if(input.closest('#v48-overlay'))return;
    const key=[
      input.id,input.name,input.getAttribute('data-field'),input.getAttribute('aria-label'),
      input.placeholder
    ].filter(Boolean).join(' ').toLowerCase();
    if(!/deployment/.test(key))return;

    if(value!=null && 'value' in input) input.value=String(value);
    const row=input.closest('label,.field,.form-field,.form-group,.nexa-field,.nexa-profile-field,.nexa-edit-field,.input-group')||input.parentElement;
    if(row){
      row.style.display='none';
      row.setAttribute('data-v483-hidden-deployment','1');
    }else{
      input.style.display='none';
      input.setAttribute('data-v483-hidden-deployment','1');
    }
  });

  $$('label').forEach(label=>{
    if(label.closest('#v48-overlay'))return;
    if(/deployment\s*capacity/i.test(label.textContent||'')){
      const row=label.closest('.field,.form-field,.form-group,.nexa-field,.nexa-profile-field,.nexa-edit-field')||label;
      row.style.display='none';
      row.setAttribute('data-v483-hidden-deployment','1');
    }
  });
}

function organizeHeader(){
  const modal=$('#nexa-profile-modal');if(!modal)return;
  removeGuide(modal);

  const edit=$('#nexa-profile-edit-btn',modal)||$('.nexa-profile-edit-btn',modal);
  const mainChip=[...$$('*',modal)].find(el=>el.children.length===0&&/MAIN ACCOUNT/i.test(el.textContent||''));
  if(edit&&mainChip&&!mainChip.parentElement?.contains(edit)){
    const row=edit.closest('.nexa-profile-edit-row');
    edit.classList.add('v481-edit-mini');
    if(row){
      row.classList.add('v481-moved');
      mainChip.after(row);
    }else mainChip.after(edit);
  }
}

function decorateBadges(){
  const cat=activeCategory(),map=invMap();
  $$('[data-v33-item]').forEach(card=>{
    $('.v48-max-badge',card)?.remove();
    const i=items.find(x=>String(x.id)===String(card.dataset.v33Item));
    if(!i)return;
    if(!isMaxed(i,cat,map.get(String(i.id))?.progress||{}))return;
    const p=$('.v33-planet',card);if(!p)return;
    const b=document.createElement('span');b.className='v48-max-badge';b.textContent='MAX';p.appendChild(b);
  });
}
function scheduleRefresh(ms=180){
  setTimeout(async()=>{await refreshData();ensureTools();decorateBadges();organizeHeader();hideLegacyDeploymentEditor()},ms);
}
async function repaintProfileInPlace(){
  await refreshData();
  ensureTools();
  decorateBadges();
  organizeHeader();
  hideLegacyDeploymentEditor();
  const modal=$('#nexa-profile-modal');
  if(modal){
    modal.classList.remove('hidden');
    modal.style.display='';
  }
}

function closeOverlay(){$('#v48-overlay')?.remove()}
function overlay(kicker,title,help,body,actions=''){
  closeOverlay();
  const o=document.createElement('div');o.id='v48-overlay';o.className='v48-overlay';
  o.innerHTML=`<section class="v48-modal" role="dialog" aria-modal="true">
    <div class="v48-modal-head"><div><div class="v48-kicker">${esc(kicker)}</div><h3>${esc(title)}</h3>${help?`<p class="v48-help">${esc(help)}</p>`:''}</div>
    <button type="button" class="v48-close" data-v48-close>×</button></div>
    ${body}${actions}<div class="v48-msg"></div></section>`;
  document.body.appendChild(o);return o;
}

function openMaxInfo(){
  overlay('PROFILE SHORTCUT','Max Selection',
    'Select only the items you actually have fully maxed. NEXA fills the real saved levels and upgrades.',
    `<div class="v48-confirm-note">The ✓ MAX marker is calculated from the saved values. If you later lower an upgrade, the marker disappears automatically.</div>`,
    `<div class="v48-actions"><button class="v48-apply" data-v48-close>GOT IT</button></div>`);
}

async function openCategoryMax(){
  await refreshData();
  const cat=activeCategory(),map=invMap(),arr=catItems(cat);
  const rows=arr.map(i=>{
    const checked=isMaxed(i,cat,map.get(String(i.id))?.progress||{});
    const name=cat==='charms'?`${i.name==='Belt'?'Ring':i.name} Charms`:i.name;
    return `<label class="v48-select-row">
      <input type="checkbox" data-v48-max-item="${esc(i.id)}" ${checked?'checked':''}>
      ${visualFor(i,cat)}
      <span><b>${esc(name)}</b><small>${esc(subtitle(i,cat))}</small></span>
    </label>`;
  }).join('');
  overlay('MAX SELECTION',CATS[cat]?.label||cat.toUpperCase(),
    'Choose the items that are fully maxed, then apply. Existing non-maxed items are not changed.',
    `<div class="v48-list">${rows||'<p class="v48-help">No items available.</p>'}</div>`,
    `<div class="v48-actions"><button class="v48-cancel" data-v48-close>CANCEL</button><button class="v48-apply" data-v48-apply-cat="${esc(cat)}">APPLY MAX</button></div>`);
}

async function upsertItem(i,cat,current,userId){
  const c=sb();
  return c.from('player_library_inventory').upsert({
    user_id:userId,player_account_id:accountId,library_item_id:i.id,owned:true,
    progress:maxProgress(i,cat,current),updated_at:new Date().toISOString()
  },{onConflict:'player_account_id,library_item_id'});
}

async function applyCategory(cat){
  if(busy)return;busy=true;
  const root=$('#v48-overlay'),msg=$('.v48-msg',root),btn=$('[data-v48-apply-cat]',root);
  if(btn)btn.disabled=true;if(msg)msg.textContent='Saving…';
  try{
    await refreshData();
    const c=sb(),{data:{user}}=await c.auth.getUser();if(!user)throw new Error('Please sign in again.');
    const selected=new Set($$('[data-v48-max-item]:checked',root).map(x=>String(x.dataset.v48MaxItem)));
    const map=invMap(),targets=catItems(cat).filter(i=>selected.has(String(i.id)));
    for(const i of targets){
      const q=await upsertItem(i,cat,map.get(String(i.id))?.progress||{},user.id);
      if(q.error)throw q.error;
    }
    if(msg)msg.textContent=`Saved ${targets.length} maxed item${targets.length===1?'':'s'} ✓`;
    await refreshData();
    setTimeout(async()=>{closeOverlay();await repaintProfileInPlace()},260);
  }catch(e){
    if(msg)msg.textContent=e?.message||String(e);
    if(btn)btn.disabled=false;
  }finally{busy=false}
}

function openMaxAll(){
  overlay('PROFILE SHORTCUT','Max All Profile?',
    'This will set all current Profile categories to their maximum supported values.',
    `<div class="v48-confirm-note">Rally Capacity and Deployment Capacity are NOT guessed. Hero Gear is set to MAXED. You can edit Battle Data afterward.</div>`,
    `<div class="v48-actions"><button class="v48-cancel" data-v48-close>CANCEL</button><button class="v48-apply v48-danger" data-v48-do-max-all>YES, MAX ALL</button></div>`);
}
async function applyMaxAll(){
  if(busy)return;busy=true;
  const root=$('#v48-overlay'),msg=$('.v48-msg',root),btn=$('[data-v48-do-max-all]',root);
  if(btn)btn.disabled=true;if(msg)msg.textContent='Maxing Profile…';
  try{
    await refreshData();
    const c=sb(),{data:{user}}=await c.auth.getUser();if(!user)throw new Error('Please sign in again.');
    const map=invMap();
    for(const cat of ['heroes','experts','pets','troops','gear','charms']){
      for(const i of catItems(cat)){
        const current=map.get(String(i.id))?.progress||{};
        const q=await upsertItem(i,cat,current,user.id);if(q.error)throw q.error;
        const prev=map.get(String(i.id))||{};map.set(String(i.id),{...prev,library_item_id:i.id,progress:maxProgress(i,cat,current)});
      }
    }
    const hg=normalizeHeroGear(accountData.hero_gear||{});
    hg.main={...hg.main,mode:'maxed',data:maxHeroGearSet()};
    hg.second={...hg.second,mode:'maxed',data:maxHeroGearSet()};
    const q=await c.from('player_accounts').update({hero_gear:hg,updated_at:new Date().toISOString()}).eq('id',accountId);
    if(q.error)throw q.error;
    if(msg)msg.textContent='Profile maxed ✓';
    setTimeout(async()=>{closeOverlay();await repaintProfileInPlace()},300);
  }catch(e){
    if(msg)msg.textContent=e?.message||String(e);if(btn)btn.disabled=false;
  }finally{busy=false}
}

function defaultPiece(){return {quality:'Mythic',enhancement:0,mastery:0,empowerment:0}}
function defaultGearSet(){
  const out={};
  HERO_GEAR_TYPES.forEach(t=>{
    out[t]={};
    HERO_GEAR_SLOTS.forEach(([k])=>out[t][k]=defaultPiece());
  });
  return out;
}
function maxHeroGearSet(){
  const out=defaultGearSet();
  HERO_GEAR_TYPES.forEach(t=>HERO_GEAR_SLOTS.forEach(([k])=>{
    out[t][k]={quality:'Legendary',enhancement:100,mastery:20,empowerment:100};
  }));
  return out;
}
function normalizeGearSet(raw){
  const base=defaultGearSet();
  if(!raw||typeof raw!=='object')return base;
  HERO_GEAR_TYPES.forEach(t=>HERO_GEAR_SLOTS.forEach(([k])=>{
    const p=raw?.[t]?.[k]||{};
    base[t][k]={
      quality:p.quality==='Legendary'?'Legendary':'Mythic',
      enhancement:clamp(p.enhancement,0,100),
      mastery:clamp(p.mastery,0,20),
      empowerment:p.quality==='Legendary'?([0,20,40,60,80,100].includes(Number(p.empowerment))?Number(p.empowerment):(Number(p.empowerment)<=5?Number(p.empowerment)*20:clamp(p.empowerment,0,100))):0
    };
  }));
  return base;
}
function normalizeHeroGear(raw){
  const old=raw&&typeof raw==='object'?structuredClone(raw):{};
  const mainMode=old.main?.mode||(old.main_set_maxed===true?'maxed':'custom');
  let secondMode=old.second?.mode;
  if(!secondMode)secondMode=old.second_set_maxed===true?'maxed':'none';
  return {
    ...old,
    main:{mode:mainMode==='maxed'?'maxed':'custom',data:normalizeGearSet(old.main?.data)},
    second:{mode:['maxed','custom','none'].includes(secondMode)?secondMode:'none',data:normalizeGearSet(old.second?.data)}
  };
}

function nOptions(max,val){return Array.from({length:max+1},(_,n)=>`<option value="${n}" ${n===Number(val)?'selected':''}>${n}</option>`).join('')}
function empowermentOptions(val){
  const cur=Number(val)||0;
  return [0,20,40,60,80,100].map(n=>`<option value="${n}" ${n===cur?'selected':''}>${n===0?'0':'+'+n}</option>`).join('');
}
function expeditionEmpowerText(t,k,emp){
  const troop=t.charAt(0).toUpperCase()+t.slice(1);
  const e=Number(emp)||0,parts=[];
  if(k==='headgear'||k==='belt'){
    if(e>=20)parts.push(`${troop} Attack +20%`);
    if(e>=60)parts.push(`${troop} Defense +30%`);
    if(e>=100)parts.push(`${troop} Attack +50%`);
  }else{
    if(e>=20)parts.push(`${troop} Defense +20%`);
    if(e>=60)parts.push(`${troop} Attack +30%`);
    if(e>=100)parts.push(`${troop} Defense +50%`);
  }
  return parts.length?`EXPEDITION: ${parts.join(' • ')}`:(e===40||e===80?'This milestone is Exploration-focused; earlier Expedition milestones remain active.':'No Expedition Empowerment milestone yet.');
}
function heroGearPieceHTML(setName,t,k,label,p){
  const legendary=p.quality==='Legendary';
  const icon={headgear:'🥽',gloves:'🧤',belt:'◈',boots:'🥾'}[k]||'◇';
  return `<div class="v48-gear-piece" data-v48-piece="${setName}:${t}:${k}">
    <span class="v48-gear-icon">${icon}</span>
    <div><b>${esc(label)}</b><div class="v48-gear-fields">
      <div class="v48-gear-cell"><label>QUALITY</label><select data-v48-hg-quality>
        <option value="Mythic" ${!legendary?'selected':''}>Mythic (Gold)</option>
        <option value="Legendary" ${legendary?'selected':''}>Legendary (Red)</option>
      </select></div>
      <div class="v48-gear-cell"><label>ENHANCEMENT</label><select data-v48-hg-enhancement>${nOptions(100,p.enhancement)}</select></div>
      <div class="v48-gear-cell"><label>MASTERY</label><select data-v48-hg-mastery>${nOptions(20,p.mastery)}</select></div>
      <div class="v48-gear-cell" data-v48-empower-cell ${legendary?'':'hidden'}><label>EMPOWERMENT</label><select data-v48-hg-empowerment ${legendary?'':'disabled'}>${empowermentOptions(legendary?p.empowerment:0)}</select></div>
    </div><div class="v48-buff-note" data-v48-buff-preview>${esc(expeditionEmpowerText(t,k,p.empowerment))}</div></div>
  </div>`;
}
function troopSummary(data,t){
  const d=normalizeGearSet(data)?.[t]||{};
  const vals=HERO_GEAR_SLOTS.map(([k])=>d[k]||defaultPiece());
  const max=vals.every(p=>p.quality==='Legendary'&&Number(p.enhancement)>=100&&Number(p.mastery)>=20&&Number(p.empowerment)>=100);
  const avg=Math.round(vals.reduce((a,p)=>a+Number(p.mastery||0),0)/Math.max(vals.length,1));
  return max?'4/4 MAXED':`Avg Mastery ${avg}`;
}
function customGearChooserHTML(setName,data){
  const d=normalizeGearSet(data);
  return `<div class="v48-custom-gear" data-v48-custom="${setName}">
    <div class="v48-troop-chooser">
      ${HERO_GEAR_TYPES.map(t=>`<button type="button" class="v48-troop-card" data-v48-open-troop="${setName}:${t}">
        <span class="orb">${t==='infantry'?'🛡️':t==='lancer'?'⚔️':'🏹'}</span>
        <strong>${t.toUpperCase()}</strong><small>${esc(troopSummary(d,t))}</small>
      </button>`).join('')}
    </div>
  </div>`;
}
function troopGearEditorHTML(setName,t,data){
  const d=normalizeGearSet(data);
  return `<div class="v48-custom-gear" data-v48-custom="${setName}" data-v48-open-type="${t}">
    <div class="v48-gear-editor-head"><button type="button" class="v48-back" data-v48-back-troops="${setName}">‹ ALL THREE</button>
      <span class="v48-troop-title">${t.toUpperCase()} HERO GEAR</span></div>
    <section class="v48-troop-gear">
      ${HERO_GEAR_SLOTS.map(([k,l])=>heroGearPieceHTML(setName,t,k,l,d[t][k])).join('')}
    </section>
  </div>`;
}

async function openBattle(){
  await refreshData();
  const hg=normalizeHeroGear(accountData.hero_gear||{});
  battleDraft=structuredClone(hg);
  const mainMode=hg.main.mode,secondMode=hg.second.mode;
  const body=`<div class="v48-battle-grid">
    <div class="v48-field"><label>RALLY CAPACITY</label>
      <input type="number" inputmode="numeric" min="0" step="1" data-v48-rally value="${esc(accountData.rally_capacity??'')}" placeholder="Example: 1250000">
      <small>Maximum troop capacity when you start a rally.</small>
    </div>
    <div class="v48-field"><label>DEPLOYMENT CAPACITY</label>
      <input type="number" inputmode="numeric" min="0" step="1" data-v48-deploy value="${esc(accountData.deployment_capacity??'')}" placeholder="Example: 189000">
      <small>Maximum troops in a normal march/deployment.</small>
    </div>

    <div class="v48-field" data-v48-set-card="main"><label>MAIN MARCH HERO GEAR</label>
      <div class="v48-toggle-row">
        <button type="button" class="v48-toggle ${mainMode==='maxed'?'active':''}" data-v48-set-mode="main:maxed">MAXED</button>
        <button type="button" class="v48-toggle ${mainMode==='custom'?'active':''}" data-v48-set-mode="main:custom">CUSTOM</button>
      </div>
      <small>Mastery stays 0–20 for Gold or Red. Empowerment appears only on Legendary / Red gear.</small>
      <div data-v48-set-body="main">${mainMode==='custom'?customGearChooserHTML('main',hg.main.data):''}</div>
    </div>

    <div class="v48-field" data-v48-set-card="second"><label>SECOND MARCH HERO GEAR</label>
      <div class="v48-toggle-row three">
        <button type="button" class="v48-toggle ${secondMode==='maxed'?'active':''}" data-v48-set-mode="second:maxed">MAXED</button>
        <button type="button" class="v48-toggle ${secondMode==='custom'?'active':''}" data-v48-set-mode="second:custom">CUSTOM</button>
        <button type="button" class="v48-toggle ${secondMode==='none'?'active':''}" data-v48-set-mode="second:none">NONE</button>
      </div>
      <small>Use CUSTOM only when you want NEXA to evaluate a second strong gear set separately.</small>
      <div data-v48-set-body="second">${secondMode==='custom'?customGearChooserHTML('second',hg.second.data):''}</div>
    </div>
  </div>`;

  overlay('BATTLE DATA','Battle Capacity & Hero Gear',
    'Saved here once, then Battle Planning can use these values instead of asking again.',
    body,
    `<div class="v48-actions"><button class="v48-cancel" data-v48-close>CANCEL</button><button class="v48-apply" data-v48-save-battle>SAVE BATTLE DATA</button></div>`);
}

function captureOpenGearEditor(setName){
  if(!battleDraft)return;
  const root=$(`[data-v48-custom="${setName}"][data-v48-open-type]`);
  if(!root)return;
  $$('[data-v48-piece]',root).forEach(row=>{
    const [,t,k]=String(row.dataset.v48Piece).split(':');
    const quality=$('[data-v48-hg-quality]',row)?.value==='Legendary'?'Legendary':'Mythic';
    battleDraft[setName].data[t][k]={
      quality,
      enhancement:clamp($('[data-v48-hg-enhancement]',row)?.value,0,100),
      mastery:clamp($('[data-v48-hg-mastery]',row)?.value,0,20),
      empowerment:quality==='Legendary'?Number($('[data-v48-hg-empowerment]',row)?.value||0):0
    };
  });
}
function collectGearSet(setName){
  if(!battleDraft)return defaultGearSet();
  captureOpenGearEditor(setName);
  return normalizeGearSet(battleDraft[setName]?.data);
}
function setMode(setName,mode){
  const root=$('#v48-overlay'),card=$(`[data-v48-set-card="${setName}"]`,root);if(!card)return;
  captureOpenGearEditor(setName);
  $$(`[data-v48-set-mode^="${setName}:"]`,card).forEach(b=>b.classList.toggle('active',b.dataset.v48SetMode===`${setName}:${mode}`));
  card.dataset.mode=mode;
  if(battleDraft)battleDraft[setName].mode=mode;
  const body=$(`[data-v48-set-body="${setName}"]`,card);if(!body)return;
  if(mode==='custom'){
    const data=battleDraft?.[setName]?.data||defaultGearSet();
    body.innerHTML=customGearChooserHTML(setName,data);
  }else body.innerHTML='';
}
function openTroopEditor(setName,t){
  captureOpenGearEditor(setName);
  const body=$(`[data-v48-set-body="${setName}"]`);
  if(!body)return;
  body.innerHTML=troopGearEditorHTML(setName,t,battleDraft?.[setName]?.data||defaultGearSet());
}
function backToTroopChooser(setName){
  captureOpenGearEditor(setName);
  const body=$(`[data-v48-set-body="${setName}"]`);
  if(!body)return;
  body.innerHTML=customGearChooserHTML(setName,battleDraft?.[setName]?.data||defaultGearSet());
}

async function saveBattle(){
  if(busy)return;busy=true;
  const root=$('#v48-overlay'),msg=$('.v48-msg',root),btn=$('[data-v48-save-battle]',root);
  if(btn)btn.disabled=true;if(msg)msg.textContent='Saving…';
  try{
    const c=sb();await resolveAccount();if(!c||!accountId)throw new Error('No active account found.');
    const rallyRaw=String($('[data-v48-rally]',root)?.value||'').trim();
    const deployRaw=String($('[data-v48-deploy]',root)?.value||'').trim();
    const mainCard=$('[data-v48-set-card="main"]',root),secondCard=$('[data-v48-set-card="second"]',root);
    const mainMode=mainCard?.dataset.mode||($('.v48-toggle.active[data-v48-set-mode^="main:"]',mainCard)?.dataset.v48SetMode||'main:custom').split(':')[1];
    const secondMode=secondCard?.dataset.mode||($('.v48-toggle.active[data-v48-set-mode^="second:"]',secondCard)?.dataset.v48SetMode||'second:none').split(':')[1];

    const old=normalizeHeroGear(accountData.hero_gear||{});
    const hero_gear={
      ...old,
      version:'v48.4',
      main:{mode:mainMode,data:mainMode==='maxed'?maxHeroGearSet():collectGearSet('main')},
      second:{
        mode:secondMode,
        data:secondMode==='maxed'?maxHeroGearSet():secondMode==='custom'?collectGearSet('second'):defaultGearSet()
      },
      updated_at:new Date().toISOString()
    };
    const q=await c.from('player_accounts').update({
      rally_capacity:rallyRaw===''?null:Math.max(0,Math.floor(Number(rallyRaw)||0)),
      deployment_capacity:deployRaw===''?null:Math.max(0,Math.floor(Number(deployRaw)||0)),
      hero_gear,updated_at:new Date().toISOString()
    }).eq('id',accountId).select('rally_capacity,deployment_capacity,hero_gear').maybeSingle();
    if(q.error)throw q.error;
    accountData={
      rally_capacity:q.data?.rally_capacity??null,
      deployment_capacity:q.data?.deployment_capacity??null,
      hero_gear:q.data?.hero_gear||hero_gear
    };
    if(msg)msg.textContent='Battle data saved ✓';
    setTimeout(async()=>{closeOverlay();await repaintProfileInPlace()},280);
  }catch(e){
    if(msg)msg.textContent=e?.message||String(e);if(btn)btn.disabled=false;
  }finally{busy=false}
}

function refreshMasteryControl(row){
  const q=$('[data-v48-hg-quality]',row)?.value||'Mythic';
  const m=$('[data-v48-hg-mastery]',row),e=$('[data-v48-hg-empowerment]',row);
  if(m){
    const cur=clamp(m.value,0,20);
    m.innerHTML=nOptions(20,cur);
  }
  if(e){
    e.disabled=q!=='Legendary';
    if(q!=='Legendary')e.value='0';
    const cell=e.closest('[data-v48-empower-cell]');
    if(cell)cell.hidden=q!=='Legendary';
  }
  const rowKey=String(row.dataset.v48Piece||'').split(':');
  const preview=$('[data-v48-buff-preview]',row);
  if(preview&&rowKey.length===3)preview.textContent=expeditionEmpowerText(rowKey[1],rowKey[2],e?.value||0);
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-v48-close]')||e.target.id==='v48-overlay'){closeOverlay();return}

  if(e.target.closest?.('#nexa-profile-edit-btn,.nexa-profile-edit-btn')){
    [40,140,320,700].forEach(ms=>setTimeout(hideLegacyDeploymentEditor,ms));
  }

  const cm=e.target.closest?.('[data-v48-category-max]');
  if(cm){
    if(e.target.closest?.('.info'))openMaxInfo();
    else openCategoryMax();
    return;
  }

  if(e.target.closest?.('[data-v48-max-all]')){openMaxAll();return}
  if(e.target.closest?.('[data-v48-do-max-all]')){applyMaxAll();return}

  const ac=e.target.closest?.('[data-v48-apply-cat]');
  if(ac){applyCategory(ac.dataset.v48ApplyCat);return}

  if(e.target.closest?.('[data-v48-battle]')){openBattle();return}
  if(e.target.closest?.('[data-v48-save-battle]')){saveBattle();return}

  const mode=e.target.closest?.('[data-v48-set-mode]');
  if(mode){
    const [setName,value]=mode.dataset.v48SetMode.split(':');
    setMode(setName,value);return;
  }

  const troop=e.target.closest?.('[data-v48-open-troop]');
  if(troop){
    const [setName,t]=troop.dataset.v48OpenTroop.split(':');
    openTroopEditor(setName,t);return;
  }
  const back=e.target.closest?.('[data-v48-back-troops]');
  if(back){backToTroopChooser(back.dataset.v48BackTroops);return}

  if(e.target.closest?.('[data-v33-cat],[data-v33-gen],[data-v33-save],[data-v33-reset]'))scheduleRefresh(250);
},false);

document.addEventListener('change',e=>{
  const row=e.target.closest?.('[data-v48-piece]');
  if(!row)return;
  if(e.target.matches('[data-v48-hg-quality],[data-v48-hg-empowerment]'))refreshMasteryControl(row);
  const key=String(row.dataset.v48Piece||'').split(':');
  const preview=$('[data-v48-buff-preview]',row);
  if(preview&&key.length===3)preview.textContent=expeditionEmpowerText(key[1],key[2],$('[data-v48-hg-empowerment]',row)?.value||0);
});

window.addEventListener('nexa:account-changed',e=>{
  const next=String(e.detail?.accountId||'');
  if(next){accountId=next;items=[];inventory=[];accountData={rally_capacity:null,deployment_capacity:null,hero_gear:{}}}
  scheduleRefresh(350);
});
window.addEventListener('pageshow',()=>scheduleRefresh(300));

async function boot(){
  injectCSS();
  await refreshData();
  [80,250,600,1200,2200].forEach(ms=>setTimeout(()=>{ensureTools();decorateBadges();organizeHeader();hideLegacyDeploymentEditor()},ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

})();