/* NEXA PROFILE OWNER V33 — PROFILE / CHIEF GEAR / CHARMS REBUILD
   Replaces V32 as the single Profile owner.
   Goals:
   - richer galaxy Profile surface
   - working category/generation filters
   - focused item detail sheet (no more scrolling to the bottom)
   - no visible OWNED / NOT OWNED UI
   - larger hero star tap targets
   - dropdown controls for Experts and Pets
   - Troop state re-renders immediately
   - Chief Gear: Quality -> Tier -> Stars -> 4-step progress
   - Charms: 3 linked charms, Lv 0-18, 4-step progress, per-level image hook
   - Ministry only shows a future appointment attached to a LIVE SVS event
   - no MutationObserver, no manual scrollLeft, no touchmove preventDefault
*/
(()=>{
'use strict';
if(window.__NEXA_PROFILE_V33_INITIALIZED__) return;
window.__NEXA_PROFILE_V33_INITIALIZED__=true;
window.__NEXA_PROFILE_OWNER__='V33';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const CATS={heroes:'HEROES',experts:'EXPERTS',troops:'TROOPS',pets:'PETS',gear:'CHIEF GEAR',charms:'CHARMS'};
const TYPES={heroes:'hero',experts:'expert',troops:'troop',pets:'pet',gear:'chief_gear'};
const COLORS=['#a967ff','#43dff2','#ff55c7','#4f87ff','#4bd694','#ffae4d','#e55bff','#4ad5b2','#f06686','#68a9ff','#b682ff','#f1d45e'];

let activeCat='heroes', activeGen='all', selectedId=null, accountId=null;
let items=[], inventory=[], localSb=null, detailOpen=false, ministryState=null;
let accountProgress={raw:'',era:'normal',furnace:30,fc:0};

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
const genOf=i=>Number(i?.generation||0);
function parseProgress(raw){
  const v=String(raw||'').trim().toLowerCase();
  const m=v.match(/fc\s*(\d+)/i);
  if(m)return {raw:v,era:'fire_crystal',furnace:30,fc:clamp(m[1],1,10)};
  const n=Number((v.match(/\d+/)||['30'])[0]);
  return {raw:v,era:'normal',furnace:clamp(n,1,30),fc:0};
}
function unlockedCat(cat){
  const f=accountProgress.furnace||1;
  if(cat==='pets')return f>=18;
  if(cat==='gear')return f>=22;
  if(cat==='charms'||cat==='experts')return f>=25;
  return true;
}
function invMap(){return new Map(inventory.map(x=>[String(x.library_item_id),x]))}
function invOf(i){return invMap().get(String(i.id))||null}
function progOf(i){return invOf(i)?.progress||{}}
function colorFor(i,idx=0){
  if(['hero','expert','pet'].includes(i.item_type)) return COLORS[Math.max(0,genOf(i))%COLORS.length];
  return COLORS[idx%COLORS.length];
}
function troopType(i){
  const s=String(i?.troop_type||i?.name||'').toLowerCase();
  return s.includes('infantry')?'infantry':s.includes('lancer')?'lancer':'marksman';
}
function pieceKey(i){
  const s=String(i?.name||'').toLowerCase().replace(/\s+/g,'');
  if(s.includes('helmet')||s.includes('head')||s.includes('cap'))return 'helmet';
  if(s.includes('watch'))return 'watch';
  if(s.includes('coat'))return 'coat';
  if(s.includes('pants'))return 'pants';
  if(s.includes('ring'))return 'ring';
  if(s.includes('staff')||s.includes('weapon'))return 'shortstaff';
  return s;
}
const GEAR_FALLBACK={
  helmet:'/nexa-v23-chief-gear-helmet.webp',
  watch:'/nexa-v23-chief-gear-watch.webp',
  coat:'/nexa-v23-chief-gear-coat.webp',
  pants:'/nexa-v23-chief-gear-pants.webp',
  ring:'/nexa-v23-chief-gear-belt.webp',
  shortstaff:'/nexa-v23-chief-gear-shortstaff.webp'
};
/* Tier-specific assets can be added later without changing this code.
   Naming:
   /assets/chief-gear/t4/helmet-0.png ... helmet-3.png
   /assets/chief-gear/t5/watch-0.png  ... watch-3.png
   /assets/chief-gear/t6/coat-0.png   ... coat-3.png
*/
function gearTierAsset(i,p={}){
  const q=String(p.gear_quality||'Red');
  const tier=clamp(p.gear_tier||0,0,6);
  const star=clamp(p.gear_stars||0,0,3);
  const k=pieceKey(i);
  if(q==='Red' && tier>=3) return `/assets/chief-gear/t${tier}/${k}-${star}.png`;
  return i.image_url||GEAR_FALLBACK[k]||'';
}
function itemImg(i,p={}){
  if(i.item_type==='troop'){
    const t=troopType(i), tier=clamp(p.tier||1,1,12);
    return window.NEXA_TROOP_ASSETS?.getPortrait?.(t,tier)
      ||window.NEXA_TROOP_PORTRAITS?.[t]?.['t'+tier]
      ||i.image_url||'';
  }
  if(i.item_type==='chief_gear') return gearTierAsset(i,p);
  return i.image_url||'';
}
function imgTag(src,alt,fallback=''){
  if(!src)return '';
  return `<img src="${esc(src)}" alt="${esc(alt||'')}" ${fallback?`onerror="this.onerror=null;this.src='${esc(fallback)}'"`:''}>`;
}
function meta(i,p={}){
  if(i.item_type==='hero') return `${genOf(i)?'GEN '+genOf(i):'EPIC'} • ${String(i.troop_type||i.rarity||'').toUpperCase()}`;
  if(i.item_type==='expert') return `GEN ${genOf(i)||1}${i.metadata?.specialty?' • '+i.metadata.specialty:''}`;
  if(i.item_type==='pet') return `GEN ${genOf(i)||1}${i.rarity?' • '+i.rarity:''}`;
  if(i.item_type==='troop') return `${troopType(i).toUpperCase()} • T${clamp(p.tier||1,1,12)}`;
  if(i.item_type==='chief_gear') return i.metadata?.benefits||'Chief Gear';
  return '';
}
function injectCSS(){
  $('#nexa-v33-css')?.remove();
  const st=document.createElement('style');st.id='nexa-v33-css';st.textContent=`
  #nexa-profile-modal #nexa-v32,
  #nexa-profile-modal #nexa-p29-shell,
  #nexa-profile-modal #nexa-v30-shell,
  #nexa-profile-modal #nexa-player-gen-rail,
  #nexa-profile-modal #nexa-pl-owned-root,
  #nexa-profile-modal .nexa-profile-tabs,
  #nexa-profile-modal .nexa-profile-content{display:none!important}

  #nexa-profile-modal .nexa-profile-sheet{
    width:min(680px,calc(100vw - 10px))!important;max-width:calc(100vw - 10px)!important;
    max-height:calc(100dvh - 10px)!important;overflow-y:auto!important;overflow-x:hidden!important;
    border-radius:28px!important;
    background:
      radial-gradient(circle at 12% 4%,rgba(141,80,255,.33),transparent 28%),
      radial-gradient(circle at 90% 8%,rgba(31,194,255,.17),transparent 31%),
      radial-gradient(circle at 70% 65%,rgba(255,61,198,.10),transparent 35%),
      linear-gradient(165deg,#111a42 0%,#080f27 43%,#030611 100%)!important;
    border:1px solid rgba(132,95,255,.58)!important;
    box-shadow:0 0 36px rgba(99,58,240,.18),inset 0 0 50px rgba(14,32,75,.32)!important;
    -webkit-overflow-scrolling:touch!important
  }
  #nexa-v33{position:relative;padding:1px 0 24px;min-height:460px}
  #nexa-v33:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;background-image:
    radial-gradient(circle,rgba(191,175,255,.95) 0 1px,transparent 1.4px),
    radial-gradient(circle,rgba(78,219,255,.8) 0 1px,transparent 1.4px);
    background-size:43px 43px,71px 71px;background-position:6px 15px,28px 1px}
  .v33-rail{position:relative;z-index:2;display:flex;flex-flow:row nowrap;overflow-x:auto;overflow-y:hidden;
    -webkit-overflow-scrolling:touch;scrollbar-width:none;gap:8px}
  .v33-rail::-webkit-scrollbar{display:none}
  #v33-cats{padding:10px 14px 7px}
  .v33-cat{flex:0 0 auto;min-width:98px;padding:10px 13px;border-radius:999px;border:1px solid rgba(110,125,180,.20);
    background:rgba(4,9,26,.38);color:#7f8aad;font-size:9px;font-weight:950;letter-spacing:.12em;white-space:nowrap}
  .v33-cat.active{color:#fff;border-color:#a668ff;background:rgba(80,43,153,.26);
    box-shadow:0 0 9px rgba(166,104,255,.52),0 0 22px rgba(121,72,255,.20)}
  #v33-filters{padding:7px 14px 12px}
  .v33-filter{--c:#9a65ef;position:relative;flex:0 0 auto;min-width:86px;padding:9px 13px;border-radius:999px;
    border:1.5px solid var(--c);background:rgba(4,10,27,.56);color:color-mix(in srgb,var(--c) 68%,white);
    font-size:9px;font-weight:950;white-space:nowrap;box-shadow:0 0 8px color-mix(in srgb,var(--c) 36%,transparent)}
  .v33-filter:before,.v33-filter:after{content:"";position:absolute;border:1px solid color-mix(in srgb,var(--c) 39%,transparent);border-radius:50%;pointer-events:none}
  .v33-filter:before{inset:-4px 11px;transform:rotate(-8deg)}.v33-filter:after{inset:4px -3px;transform:rotate(7deg)}
  .v33-filter.active{color:#fff;background:color-mix(in srgb,var(--c) 20%,rgba(5,10,25,.82));box-shadow:0 0 13px color-mix(in srgb,var(--c) 70%,transparent)}
  #v33-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:19px 5px;padding:12px 8px 18px}
  .v33-item{--c:#59dfdd;border:0;background:transparent;color:#fff;text-align:center;min-width:0;padding:0}
  .v33-planet{position:relative;width:min(19vw,74px);height:min(19vw,74px);max-width:74px;max-height:74px;margin:0 auto 8px;border-radius:50%;display:grid;place-items:center;
    background:radial-gradient(circle at 40% 34%,rgba(40,74,125,.38),rgba(3,8,23,.94) 67%);box-shadow:inset 0 0 18px rgba(0,0,0,.62)}
  .v33-planet:before,.v33-planet:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
  .v33-planet:before{inset:-4px;border:1.5px solid var(--c);box-shadow:0 0 10px var(--c),0 0 24px color-mix(in srgb,var(--c) 31%,transparent)}
  .v33-planet:after{inset:-8px 1px;border:1px solid color-mix(in srgb,var(--c) 48%,transparent);animation:v33Orbit 7s linear infinite;box-shadow:0 0 7px color-mix(in srgb,var(--c) 25%,transparent)}
  .v33-orbit-dot{position:absolute;z-index:4;right:-5px;top:13px;width:5px;height:5px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);animation:v33Dot 7s linear infinite}
  @keyframes v33Orbit{to{transform:rotate(360deg)}} @keyframes v33Dot{50%{transform:translate(-5px,43px)}}
  .v33-planet img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 28%;background:#071127}
  .v33-item[data-type="troop"] .v33-planet img,.v33-item[data-type="chief_gear"] .v33-planet img{object-fit:contain;padding:3px;box-sizing:border-box;background:transparent}
  .v33-item b{display:block;font-size:11px;line-height:1.1;font-weight:950}.v33-item small{display:block;margin-top:3px;color:#929bb9;font-size:7.3px;line-height:1.25}
  .v33-empty{grid-column:1/-1;padding:24px;text-align:center;color:#8994b4;font-size:11px}

  #nexa-v33-detail{
    position:fixed;inset:0;z-index:2147483640;display:none;place-items:end center;
    background:rgba(1,3,12,.72);backdrop-filter:blur(8px);padding:10px
  }
  #nexa-v33-detail.open{display:grid}
  .v33-sheet{width:min(640px,100%);max-height:calc(100dvh - 18px);overflow-y:auto;-webkit-overflow-scrolling:touch;
    border:1px solid rgba(143,101,255,.62);border-radius:27px 27px 20px 20px;padding:15px;
    background:radial-gradient(circle at 12% 0,rgba(122,72,255,.22),transparent 26%),linear-gradient(160deg,#101735,#050919 72%);
    box-shadow:0 0 38px rgba(104,59,236,.21)}
  .v33-detail-head{display:grid;grid-template-columns:54px minmax(0,1fr) 36px;gap:10px;align-items:center;position:sticky;top:-15px;z-index:5;padding:8px 0 10px;background:linear-gradient(#101735 80%,transparent)}
  .v33-mini{--c:#a56bff;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;overflow:hidden;border:2px solid var(--c);box-shadow:0 0 12px color-mix(in srgb,var(--c) 55%,transparent)}
  .v33-mini img{width:100%;height:100%;object-fit:cover}.v33-mini.gear img,.v33-mini.troop img{object-fit:contain;background:transparent}
  .v33-title h3{margin:0;font-size:19px;color:#fff}.v33-title small{color:#96a0bd;font-size:9px}
  .v33-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:#0a1028;color:#fff;font-size:18px}
  .v33-section{margin-top:12px;padding:12px;border:1px solid rgba(113,128,190,.18);border-radius:17px;background:rgba(5,11,29,.58)}
  .v33-kicker{display:flex;justify-content:space-between;gap:8px;margin-bottom:9px;color:#94a1c5;font-size:8px;font-weight:950;letter-spacing:.12em}.v33-kicker strong{color:#6ce5ff}
  .v33-levels{display:flex;gap:6px;flex-wrap:wrap}
  .v33-level{min-width:35px;height:35px;padding:0 9px;border-radius:10px;border:1px solid rgba(108,127,190,.25);background:#081129;color:#8f9abb;font-weight:900}
  .v33-level.active{color:#fff;border-color:#a86cff;background:rgba(112,65,201,.31);box-shadow:0 0 10px rgba(167,102,255,.22)}
  .v33-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .v33-skill{min-width:0;padding:9px;border:1px solid rgba(100,120,184,.18);border-radius:14px;background:rgba(6,12,31,.72)}
  .v33-skill-top{display:grid;grid-template-columns:38px minmax(0,1fr);gap:8px;align-items:center}
  .v33-skill-icon{width:38px;height:38px;border-radius:50%;overflow:hidden;display:grid;place-items:center;border:1px solid #a269ff;background:#08102a;color:#c39aff}
  .v33-skill-icon img{width:100%;height:100%;object-fit:cover}.v33-skill h4{margin:0;font-size:11px}.v33-skill p{margin:6px 0 0;color:#aab3ce;font-size:9px;line-height:1.38}
  .v33-result{margin-top:7px;padding:7px 9px;border-radius:10px;background:rgba(111,63,188,.15);border:1px solid rgba(169,105,255,.25);color:#dfd5ff;font-size:9px;line-height:1.35}
  .v33-select{width:100%;padding:10px 11px;border-radius:11px;background:#071027;color:#fff;border:1px solid rgba(104,126,189,.28);font-weight:800}
  .v33-status{display:inline-flex;padding:5px 8px;border-radius:999px;border:1px solid rgba(94,215,255,.30);color:#6ce4ff;font-size:8px;font-weight:950}
  .v33-star-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.v33-flower{position:relative;width:46px;height:46px;border:0;background:transparent;padding:0}
  .v33-petal{position:absolute;left:18px;top:5px;width:10px;height:17px;border-radius:9px 9px 5px 5px;background:#1d294e;border:1px solid #43527e;transform-origin:5px 18px}
  .v33-petal.on{background:#58e8f5;border-color:#82f3ff;box-shadow:0 0 8px #43dff2}
  .v33-petal:nth-child(1){transform:rotate(0)}.v33-petal:nth-child(2){transform:rotate(60deg)}.v33-petal:nth-child(3){transform:rotate(120deg)}
  .v33-petal:nth-child(4){transform:rotate(180deg)}.v33-petal:nth-child(5){transform:rotate(240deg)}.v33-petal:nth-child(6){transform:rotate(300deg)}
  .v33-special{display:grid;grid-template-columns:36px minmax(0,1fr);gap:8px;align-items:center;margin-top:8px;padding:9px;border-radius:13px;border:1px solid rgba(238,178,78,.25);background:rgba(65,40,10,.20)}
  .v33-special-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;border:1px solid #ffbd58;color:#ffd178}
  .v33-gear-hero{display:grid;grid-template-columns:90px minmax(0,1fr);gap:12px;align-items:center}.v33-gear-img{width:88px;height:88px;border-radius:18px;object-fit:contain;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.10)}
  .v33-chip-row{display:flex;gap:6px;flex-wrap:wrap}.v33-chip{padding:8px 10px;border-radius:999px;border:1px solid rgba(115,130,188,.23);background:#081129;color:#9ba5bf;font-size:9px;font-weight:900}.v33-chip.active{border-color:#a86cff;color:#fff;background:rgba(114,63,201,.30)}
  .v33-segments{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.v33-segment{height:13px;border-radius:999px;border:1px solid rgba(151,99,255,.34);background:#101936}.v33-segment.on{background:linear-gradient(90deg,#7047ff,#d44cff);box-shadow:0 0 8px rgba(169,76,255,.45)}
  .v33-charm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.v33-charm{padding:8px 6px;border-radius:13px;border:1px solid rgba(90,195,255,.20);background:rgba(6,13,34,.68);text-align:center}
  .v33-charm-img{width:54px;height:54px;object-fit:contain;margin:0 auto 4px;display:block}.v33-charm b{font-size:9px}
  .v33-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}.v33-actions button{padding:9px 15px;border-radius:999px;font-size:9px;font-weight:950}.v33-reset{border:1px solid rgba(255,79,146,.35);background:rgba(80,15,47,.22);color:#ff8eb8}.v33-save{border:1px solid rgba(65,210,255,.42);background:rgba(10,73,104,.28);color:#81e8ff}.v33-msg{min-height:13px;margin-top:6px;text-align:right;color:#75e5ff;font-size:8px}
  #nexa-v430-transfer-card{padding:10px 13px!important;border-radius:18px!important}#nexa-v430-transfer-card h3{font-size:16px!important}#nexa-v430-transfer-card p{font-size:10px!important}

  #nexa-profile-modal .nexa-profile-stat:nth-of-type(1)::before,#nexa-profile-modal [data-stat="furnace"]::before{content:"✦";color:#68dfff;margin-right:5px;text-shadow:0 0 9px #4ddcff}
  #nexa-profile-modal .nexa-profile-stat:nth-of-type(2)::before,#nexa-profile-modal [data-stat="power"]::before{content:"ϟ";color:#b48cff;margin-right:5px;text-shadow:0 0 9px #9d6cff}
  #nexa-profile-modal .nexa-profile-stat:nth-of-type(3)::before,#nexa-profile-modal [data-stat="deployment"]::before{content:"◉";color:#5ee8ff;margin-right:5px;text-shadow:0 0 9px #50dfff}
  #nexa-profile-modal .nexa-profile-edit-form,#nexa-profile-modal [data-profile-edit-form]{
    position:fixed!important;inset:12px!important;z-index:2147483635!important;max-width:620px!important;margin:auto!important;max-height:calc(100dvh - 24px)!important;overflow-y:auto!important;
    border-radius:24px!important;background:linear-gradient(160deg,#111833,#060a1b)!important;border:1px solid rgba(139,98,255,.55)!important;padding:16px!important;box-shadow:0 0 32px rgba(90,54,230,.22)!important
  }
  #nexa-v430-transfer-card .kicker{font-size:8px!important}#nexa-v430-transfer-card h3{font-size:14px!important;line-height:1.15!important}

  @media(max-width:390px){#v33-grid{gap:17px 4px;padding-inline:6px}.v33-skills{grid-template-columns:1fr}.v33-gear-hero{grid-template-columns:76px minmax(0,1fr)}.v33-gear-img{width:74px;height:74px}}
  `;
  document.head.appendChild(st);
}
function ensureShell(){
  const sheet=$('#nexa-profile-modal .nexa-profile-sheet'); if(!sheet)return null;
  let shell=$('#nexa-v33'); if(shell)return shell;
  shell=document.createElement('section');shell.id='nexa-v33';
  shell.innerHTML=`<nav id="v33-cats" class="v33-rail"></nav><nav id="v33-filters" class="v33-rail"></nav><div id="v33-grid"></div>`;
  const editRow=$('#nexa-profile-modal .nexa-profile-edit-row');
  if(editRow) editRow.after(shell); else ($('#nexa-v425-profile-actions')||sheet).after?.(shell) || sheet.appendChild(shell);
  let overlay=$('#nexa-v33-detail');
  if(!overlay){overlay=document.createElement('div');overlay.id='nexa-v33-detail';document.body.appendChild(overlay)}
  return shell;
}
async function resolveAccount(){
  if(window.NEXA_ACTIVE_ACCOUNT_ID){accountId=String(window.NEXA_ACTIVE_ACCOUNT_ID);return accountId}
  const c=sb();if(!c)return null;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return null;
    const playerId=String($('#nexa-profile-player-id')?.textContent||'').trim();
    let r=null;
    if(playerId && playerId!=='—') r=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',playerId).maybeSingle();
    if(!r?.data?.id) r=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
    if(r?.data?.id){
      accountId=String(r.data.id);window.NEXA_ACTIVE_ACCOUNT_ID=accountId;
      const pr=await c.from('player_accounts').select('furnace_level').eq('id',accountId).maybeSingle();
      accountProgress=parseProgress(pr?.data?.furnace_level||'30');
    }
  }catch(e){console.warn('V33 account',e?.message||e)}
  return accountId;
}
async function load(){
  const c=sb();render();
  if(!c)return;
  try{
    accountId=await resolveAccount();
    const a=await c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name');
    if(!a.error)items=a.data||[];
    if(accountId){const b=await c.from('player_library_inventory').select('*').eq('player_account_id',accountId);if(!b.error)inventory=b.data||[]}
    else inventory=[];
  }catch(e){console.warn('V33 load',e?.message||e)}
  render();await refreshMinistryState();
}
function catItems(){return activeCat==='charms'?items.filter(i=>i.item_type==='chief_gear'):items.filter(i=>i.item_type===TYPES[activeCat])}
function filters(){
  if(!['heroes','experts','pets'].includes(activeCat))return ['all'];
  return ['all',...[...new Set(catItems().map(genOf))].sort((a,b)=>a-b)];
}
function renderCats(){
  const r=$('#v33-cats');if(!r)return;
  r.innerHTML=Object.entries(CATS).filter(([k])=>unlockedCat(k)).map(([k,v])=>`<button type="button" class="v33-cat ${k===activeCat?'active':''}" data-v33-cat="${k}">${v}</button>`).join('');
}
function renderFilters(){
  const r=$('#v33-filters');if(!r)return;
  const fs=filters();if(!fs.map(String).includes(String(activeGen)))activeGen='all';
  r.innerHTML=fs.map((g,n)=>{
    const label=g==='all'?'ALL':(activeCat==='heroes'&&Number(g)===0?'EPIC':`GEN ${g}`);
    return `<button type="button" class="v33-filter ${String(g)===String(activeGen)?'active':''}" data-v33-gen="${g}" style="--c:${COLORS[n%COLORS.length]}">${label}</button>`;
  }).join('');
}
function renderGrid(){
  const r=$('#v33-grid');if(!r)return;
  let arr=catItems();if(activeGen!=='all')arr=arr.filter(i=>String(genOf(i))===String(activeGen));
  if(!arr.length){r.innerHTML='<div class="v33-empty">Nothing is available in this filter.</div>';return}
  r.innerHTML=arr.map((i,n)=>{
    const p=progOf(i),img=itemImg(i,p),c=colorFor(i,n),fallback=GEAR_FALLBACK[pieceKey(i)]||'';
    return `<button type="button" class="v33-item" data-v33-item="${esc(i.id)}" data-type="${esc(i.item_type)}" style="--c:${c}">
      <span class="v33-planet">${imgTag(img,i.name,fallback)}<i class="v33-orbit-dot"></i></span>
      <b>${esc(activeCat==='charms'?`${i.name==='Belt'?'Ring':i.name} Charms`:i.name)}</b><small>${esc(meta(i,p))}</small>
    </button>`;
  }).join('');
}
function fmtNum(n){return Number.isInteger(n)?n.toLocaleString():Number(n.toFixed(2)).toLocaleString()}
function exactSkillValue(skill,lv){
  if(!lv)return 'Not active';
  const vals=skill.level_values||skill.values||skill.levels;
  if(Array.isArray(vals)&&vals[lv-1]!=null)return String(vals[lv-1]);
  if(vals&&typeof vals==='object'&&vals[lv]!=null)return String(vals[lv]);

  const text=String(skill.effect||skill.description||'');
  const max=Number(skill.max_level||10);

  // Explicit "per level" values from verified source text.
  const per=[...text.matchAll(/([+-]?\d[\d,]*(?:\.\d+)?)\s*(%|hours?|h|\/min)?\s+per level/gi)];
  if(per.length){
    return per.map(m=>`${fmtNum(Number(m[1].replace(/,/g,''))*lv)}${m[2]||''}`).join(' • ');
  }

  // WOS Tools "up to" skills are linear active-skill progressions.
  // Render CURRENT value, never the max-only description.
  const nums=[...text.matchAll(/([+-]?\d[\d,]*(?:\.\d+)?)\s*(%|hours?|h)?/g)]
    .map(m=>({v:Number(m[1].replace(/,/g,'')),u:m[2]||'',raw:m[0]}))
    .filter(x=>Number.isFinite(x.v));
  if(/up to/i.test(text)&&nums.length){
    const current=nums.map(x=>`${x.v<0?'-':x.raw.trim().startsWith('+')?'+':''}${fmtNum(Math.abs(x.v)*lv/max)}${x.u}`).join(' • ');
    return `Current buff: ${current}`;
  }
  return text||`Level ${lv}`;
}
const SPECIAL={
 Natalia:{name:'Ursus Strength',icon:'✹',stats:['Attack','Defense'],vals:[0,2,4,6,8,10]},
 Jeronimo:{name:'Natural Leader',icon:'⚔',stats:['Lethality','Health'],vals:[0,3,6,9,12,15]}
};
function starHTML(p,name){
  const step=clamp(p.star_step??Math.round(Number(p.stars||0)*6),0,30),full=Math.floor(step/6),sp=SPECIAL[name];
  const flowers=Array.from({length:5},(_,s)=>{
    const fill=clamp(step-s*6,0,6);
    return `<button type="button" class="v33-flower" data-v33-star="${s}" aria-label="Star ${s+1}">
      ${Array.from({length:6},(_,k)=>`<i class="v33-petal ${k<fill?'on':''}"></i>`).join('')}
    </button>`;
  }).join('');
  return `<div class="v33-section"><div class="v33-kicker"><span>STARS</span><strong>${full}★${step%6?` • ${step%6}/6`:''}</strong></div>
  <div class="v33-star-row">${flowers}</div>
  ${sp?`<div class="v33-special"><span class="v33-special-icon">${sp.icon}</span><div><b>${sp.name}</b><small>${sp.stats[0]} +${sp.vals[full]}% • ${sp.stats[1]} +${sp.vals[full]}%</small></div></div>`:''}</div>`;
}
function heroDetail(i,p){
  const skills=i.metadata?.expedition_skills||[],levels=p.hero_skills||{};
  return `${starHTML(p,i.name)}<div class="v33-section"><div class="v33-kicker"><span>EXPEDITION SKILLS</span><strong>MAX 5</strong></div>
    <div class="v33-skills">${skills.map((s,n)=>{
      const lv=clamp(levels[s.name]??p[`skill_${n+1}`]??0,0,5);
      return `<article class="v33-skill" data-v33-hero-skill-box="${esc(s.name)}"><div class="v33-skill-top"><span class="v33-skill-icon">${s.icon?imgTag(s.icon,''): '✦'}</span><div><h4>${esc(s.name)}</h4><small>${esc(s.effect||'Expedition Skill')}</small></div></div>
      <div class="v33-levels" style="margin-top:8px">${Array.from({length:6},(_,x)=>`<button class="v33-level ${x===lv?'active':''}" data-v33-hero-skill="${n}" data-level="${x}">${x}</button>`).join('')}</div>
      <p>${esc(s.description||'')}</p><div class="v33-result">${esc(exactSkillValue(s,lv))}</div></article>`;
    }).join('')||'<div class="v33-result">No Expedition Skill metadata is stored for this hero yet.</div>'}</div></div>${heroWidgetDetail(i,p)}`;
}
const HERO_WIDGETS={
  // H5Joy confirms widget levels 1-10 map to 5/10/.../50 and each Legendary has 2 Exclusive Gear effects.
  // Per-hero names/effects can come from metadata.widget/exclusive_gear; these fallbacks cover verified examples.
  Jeronimo:{gear:'Dawnbreak',skills:[{name:'Shield of Swords'},{name:'Discernment'}]},
  Logan:{gear:'Fist of Steel',skills:[{name:'Enhanced Fists of Steel'},{name:'Strong Protection'}]},
  Mia:{gear:'Fate Crystal',skills:[{name:'Vision of Truth',effect:'Increases Mia fluctuating skill limits by 150%'},{name:'Rally of Fate',effect:'Rallied Troop Attack +15%'}]}
};
function heroWidgetDetail(i,p){
  if(String(i.rarity||'').toLowerCase()!=='legendary')return '';
  const md=i.metadata?.widget||i.metadata?.exclusive_gear||HERO_WIDGETS[i.name]||{};
  const level=clamp(p.widget_level||0,0,10),skills=md.skills||md.effects||[];
  const widgetValue=level*5;
  return `<div class="v33-section"><div class="v33-kicker"><span>EXCLUSIVE GEAR / WIDGET</span><strong>${esc(md.gear||md.name||'Widget')} • LV ${level}</strong></div>
    <select class="v33-select" data-v33-widget-level>${optionRange(10,level)}</select>
    <div class="v33-result">Widget upgrade value: ${widgetValue}${level?'':' • Not active'}</div>
    <div class="v33-skills" style="margin-top:8px">${[0,1].map(n=>{const w=skills[n]||{};return `<article class="v33-skill"><div class="v33-skill-top"><span class="v33-skill-icon">${w.icon?imgTag(w.icon,''):'✦'}</span><div><h4>${esc(w.name||`Widget Buff ${n+1}`)}</h4><small>Exclusive Gear Effect</small></div></div><div class="v33-result">${level?esc(exactSkillValue({...w,max_level:10},level)):'Not active'}</div></article>`}).join('')}</div>
  </div>`;
}
function expertStatus(a){
  a=clamp(a,0,100);if(a>=100)return 'Intimate';if(a>=90)return 'Close III';if(a>=80)return 'Close II';if(a>=70)return 'Close I';
  if(a>=60)return 'Casual III';if(a>=50)return 'Casual II';if(a>=40)return 'Casual I';if(a>=30)return 'Acquaintance III';if(a>=20)return 'Acquaintance II';if(a>=10)return 'Acquaintance I';return 'Stranger';
}
function optionRange(max,current){return Array.from({length:max+1},(_,x)=>`<option value="${x}" ${x===current?'selected':''}>${x}</option>`).join('')}
function expertDetail(i,p){
  const a=clamp(p.affinity||0,0,100),skills=i.metadata?.skills||[],levels=p.expert_skills||{};
  return `<div class="v33-section"><div class="v33-kicker"><span>AFFINITY</span><strong>${a}/100</strong></div>
    <select class="v33-select" data-v33-affinity>${optionRange(100,a)}</select><div style="margin-top:8px"><span class="v33-status">${expertStatus(a)}</span></div></div>
  <div class="v33-section"><div class="v33-kicker"><span>EXPERT SKILLS</span><strong>${esc(i.metadata?.specialty||'')}</strong></div>
    <div class="v33-skills">${skills.map((s,n)=>{
      const max=Number(s.max_level||10),lv=clamp(levels[s.name]||0,0,max);
      return `<article class="v33-skill" data-v33-expert-box="${esc(s.name)}"><div class="v33-skill-top"><span class="v33-skill-icon">${s.icon?imgTag(s.icon,''):'✦'}</span><div><h4>${esc(s.name)}</h4><small>MAX ${max}</small></div></div>
      <select class="v33-select" style="margin-top:8px" data-v33-expert-skill="${n}">${optionRange(max,lv)}</select>
      <div class="v33-result">Level ${lv} • ${esc(exactSkillValue(s,lv))}</div></article>`;
    }).join('')}</div></div>`;
}
const PETS={
 'Cave Hyena':{max:50,skill:'Builder’s Aide'},'Arctic Wolf':{max:60,skill:'Arctic Embrace'},'Musk Ox':{max:60,skill:'Burden Bearer'},
 'Giant Tapir':{max:70,skill:'Natural Intuition'},'Titan Roc':{max:70,skill:'Razorbeak'},'Snow Leopard':{max:80,skill:'Lightning Raid'},
 'Giant Elk':{max:80,skill:'Mystical Finding'},'Cave Lion':{max:100,skill:'Feral Anthem',maxText:'Troop Attack up to +10%'},'Snow Ape':{max:100,skill:'Tumbling Power',maxText:'Squad Capacity up to +15,000'}, 
 'Iron Rhino':{max:100,skill:'Rallying Beasts',maxText:'Rally Capacity up to +150,000'},'Saber-tooth Tiger':{max:100,skill:'Apex Assault',maxText:'Troop Lethality up to +10%'},'Mammoth':{max:100,skill:'Hardened Skin',maxText:'Troop Defense up to +10%'}, 
 'Frost Gorilla':{max:100,skill:'Earthbound Vigor',maxText:'Troop Health up to +10%'},'Frostscale Chameleon':{max:100,skill:'Icy Shroud',maxText:'Enemy Defense up to -10%'}
};
function petDetail(i,p){
  const d=PETS[i.name]||{max:100,skill:i.metadata?.skill_name||'Pet Skill'},level=clamp(p.level||0,0,d.max);
  const fallbackPet=PETS[i.name]||{};
  const skillMeta=i.metadata?.skill||i.metadata?.pet_skill||{name:fallbackPet.skill,effect:fallbackPet.maxText||'',max_level:10};
  const maxSkill=Number(skillMeta.max_level||i.metadata?.skill_max||10),sl=clamp(p.pet_skill||p.skill_level||0,0,maxSkill);
  const icon=skillMeta.icon||i.metadata?.skill_icon||'';
  return `<div class="v33-section"><div class="v33-kicker"><span>PET LEVEL</span><strong>${level}/${d.max}</strong></div>
    <select class="v33-select" data-v33-pet-level>${optionRange(d.max,level)}</select></div>
  <div class="v33-section"><div class="v33-kicker"><span>PET SKILL</span><strong>LEVEL ${sl}</strong></div>
    <div class="v33-skill"><div class="v33-skill-top"><span class="v33-skill-icon">${icon?imgTag(icon,''):'✦'}</span><div><h4>${esc(skillMeta.name||d.skill)}</h4><small>${esc(skillMeta.description||i.metadata?.skill_description||'Pet Skill')}</small></div></div>
    <select class="v33-select" style="margin-top:8px" data-v33-pet-skill>${optionRange(maxSkill,sl)}</select>
    <div class="v33-result">${sl?esc(exactSkillValue(skillMeta,sl)):'Not active'}</div></div></div>`;
}
function troopDetail(i,p){
  const tier=clamp(p.tier||1,1,12);
  const profileFC=accountProgress.era==='fire_crystal'?accountProgress.fc:0;
  const fc=clamp(p.fc_level??profileFC,0,10),t11=!!p.t11_unlocked,t12=!!p.t12_unlocked,skill=clamp(p.advanced_skill||0,0,3);
  const t=troopType(i),skillName=t==='infantry'?'Indomitable Wall':t==='lancer'?'Meridian Phalanx':'Starfire';
  return `<div class="v33-section"><div class="v33-kicker"><span>MAXIMUM TROOP TIER</span><strong>T${tier}</strong></div>
    <div class="v33-levels">${Array.from({length:10},(_,x)=>`<button class="v33-level ${tier===x+1?'active':''}" data-v33-troop-tier="${x+1}">T${x+1}</button>`).join('')}</div>
    <div class="v33-result">T1–T10 is independent from Fire Crystal progression.</div></div>
  <div class="v33-section"><div class="v33-kicker"><span>PLAYER ERA</span><strong>${accountProgress.era==='fire_crystal'?`FIRE CRYSTAL ${accountProgress.fc}`:`FURNACE ${accountProgress.furnace}`}</strong></div>
    <div class="v33-result">${accountProgress.era==='fire_crystal'?'Fire Crystal options are unlocked by the Furnace value saved in Edit Profile.':'Fire Crystal is not active on this account yet.'}</div></div>
  ${profileFC?`<div class="v33-section"><div class="v33-kicker"><span>FIRE CRYSTAL</span><strong>FC${fc}</strong></div>
    <div class="v33-levels">${Array.from({length:10},(_,x)=>`<button class="v33-level ${fc===x+1?'active':''}" data-v33-troop-fc="${x+1}">FC${x+1}</button>`).join('')}</div></div>`:''}
  ${fc>=5?`<div class="v33-section"><div class="v33-kicker"><span>T11 HELIOS</span><strong>${t11?'UNLOCKED':'LOCKED'}</strong></div>
    <div class="v33-chip-row"><button class="v33-chip ${!t11?'active':''}" data-v33-t11="0">NO</button><button class="v33-chip ${t11?'active':''}" data-v33-t11="1">YES</button></div></div>`:''}
  ${fc>=10&&t11?`<div class="v33-section"><div class="v33-kicker"><span>T12 EXALTED</span><strong>${t12?'UNLOCKED':'LOCKED'}</strong></div>
    <div class="v33-chip-row"><button class="v33-chip ${!t12?'active':''}" data-v33-t12="0">NO</button><button class="v33-chip ${t12?'active':''}" data-v33-t12="1">YES</button></div></div>`:''}
  ${t12?`<div class="v33-section"><div class="v33-kicker"><span>${skillName.toUpperCase()}</span><strong>SKILL LEVEL ${skill}</strong></div>
    <div class="v33-levels">${['NONE','LEVEL 1','LEVEL 2','LEVEL 3'].map((x,n)=>`<button class="v33-level ${skill===n?'active':''}" data-v33-troop-skill="${n}">${x}</button>`).join('')}</div></div>`:''}
  <div class="v33-section"><div class="v33-kicker"><span>ACTIVE TROOP SUMMARY</span><strong>${t12?'T12':t11?'T11':`T${tier}`}</strong></div>
    <div class="v33-result">Base T${tier}${fc?' • FC'+fc:''}${t11?' • T11 Helios':''}${t12?' • T12 Exalted':''}${skill?' • '+skillName+' Lv.'+skill:''}</div></div>`;
}

/* Full stage map retained from V32. Values are kept until the global game catalog is migrated. */
const GEAR_STAGES=[
 ['Green',0,0,9.35,0],['Green',0,1,12.75,0],['Blue',0,0,17,0],['Blue',0,1,21.25,0],['Blue',0,2,25.5,0],['Blue',0,3,29.75,0],
 ['Purple',0,0,34,0],['Purple',0,1,36.89,0],['Purple',0,2,39.78,0],['Purple',0,3,42.67,0],
 ['Purple',1,0,45.56,0],['Purple',1,1,48.45,0],['Purple',1,2,51.34,0],['Purple',1,3,54.23,0],
 ['Gold',0,0,56.78,0],['Gold',0,1,59.33,0],['Gold',0,2,61.88,0],['Gold',0,3,64.43,0],
 ['Gold',1,0,66.98,0],['Gold',1,1,69.53,0],['Gold',1,2,72.08,0],['Gold',1,3,74.63,0],
 ['Gold',2,0,77.18,0],['Gold',2,1,79.73,0],['Gold',2,2,82.28,0],['Gold',2,3,85,0],
 ['Red',0,0,89.25,40],['Red',0,1,94.56,90],['Red',0,2,99.88,140],['Red',0,3,105.19,190],
 ['Red',1,0,110.5,240],['Red',1,1,115.81,290],['Red',1,2,121.13,340],['Red',1,3,126.44,390],
 ['Red',2,0,127.5,400],['Red',2,1,130.69,610],['Red',2,2,134.94,650],['Red',2,3,139.19,780],
 ['Red',3,0,140.25,790],['Red',3,1,144.5,830],['Red',3,2,148.75,870],['Red',3,3,159.8,1040],
 ['Red',4,0,161.5,1050],['Red',4,1,170,1100],['Red',4,2,178.5,1150],['Red',4,3,187,1200],
 ['Red',5,0,195.5,1340],['Red',5,1,204,1390],['Red',5,2,212.5,1440],['Red',5,3,221,1490],
 ['Red',6,0,229.5,1630],['Red',6,1,238,1680],['Red',6,2,246.5,1730],['Red',6,3,255,1780]
];
function stageFor(q,t,s){return GEAR_STAGES.find(x=>x[0]===q&&x[1]===t&&x[2]===s)||GEAR_STAGES[0]}
function legalGearStars(q,t){
  if(q==='Green')return [0,1];
  if(q==='Blue')return [0,1,2,3];
  return [0,1,2,3];
}
function gearProgressSteps(q,t,s){
  // Wiki explicitly lists 4 intermediate enhancement steps starting at Red.
  // Earlier qualities advance directly by star/tier and do not show the Red step rail.
  return q==='Red'?4:0;
}
function gearDetail(i,p){
  let q=String(p.gear_quality||'Green'),t=clamp(p.gear_tier||0,0,6),s=clamp(p.gear_stars||0,0,3),sub=clamp(p.gear_substep||0,0,4);
  const allowedQ=['Green','Blue','Purple','Gold','Red'];if(!allowedQ.includes(q))q='Green';
  const tiers=q==='Red'?[0,1,2,3,4,5,6]:q==='Gold'?[0,1,2]:q==='Purple'?[0,1]:[0];
  if(!tiers.includes(t))t=tiers[0];
  const stars=legalGearStars(q,t);if(!stars.includes(s))s=stars[0];
  const steps=gearProgressSteps(q,t,s);if(!steps)sub=0;
  const stage=stageFor(q,t,s),img=gearTierAsset(i,{...p,gear_quality:q,gear_tier:t,gear_stars:s}),fallback=GEAR_FALLBACK[pieceKey(i)]||i.image_url||'';
  const benefits=i.metadata?.benefits||'Troops';
  return `<div class="v33-section"><div class="v33-gear-hero">${imgTag(img,i.name,fallback).replace('<img','<img class="v33-gear-img"')}<div><div class="v33-kicker"><span>CHIEF GEAR</span><strong>${q}${t?` T${t}`:''} • ${s}★</strong></div>
    <div class="v33-result">${esc(benefits)} Attack +${stage[3]}% • ${esc(benefits)} Defense +${stage[3]}%${stage[4]?` • Deployment +${stage[4]}`:''}</div></div></div></div>
  <div class="v33-section"><div class="v33-kicker"><span>QUALITY</span><strong>${q}</strong></div><div class="v33-chip-row">${allowedQ.map(x=>`<button class="v33-chip ${x===q?'active':''}" data-v33-gear-q="${x}">${x}</button>`).join('')}</div></div>
  <div class="v33-section"><div class="v33-kicker"><span>TIER</span><strong>${t?`T${t}`:'BASE'}</strong></div><div class="v33-chip-row">${tiers.map(x=>`<button class="v33-chip ${x===t?'active':''}" data-v33-gear-tier="${x}">${x?`T${x}`:'BASE'}</button>`).join('')}</div></div>
  <div class="v33-section"><div class="v33-kicker"><span>STARS</span><strong>${s}★</strong></div><div class="v33-chip-row">${stars.map(x=>`<button class="v33-chip ${x===s?'active':''}" data-v33-gear-star="${x}">${x}★</button>`).join('')}</div></div>
  ${steps?`<div class="v33-section"><div class="v33-kicker"><span>ENHANCEMENT PROGRESS</span><strong>${sub}/${steps}</strong></div><div class="v33-segments">${Array.from({length:steps},(_,n)=>n+1).map(x=>`<button class="v33-segment ${x<=sub?'on':''}" data-v33-gear-sub="${x}" aria-label="Progress ${x} of ${steps}"></button>`).join('')}</div></div>`:''}`;
}

const CHARM_STATS={1: 9, 2: 12, 3: 16, 4: 19, 5: 25, 6: 30, 7: 35, 8: 40, 9: 45, 10: 50, 11: 55, 12: 64, 13: 73, 14: 82, 15: 91, 16: 100, 17: 109, 18: 118};
function charmTypeForPiece(i){
  const k=pieceKey(i);if(['coat','pants'].includes(k))return 'infantry';if(['helmet','watch'].includes(k))return 'lancer';return 'marksman';
}
function charmImg(type,lv){if(!lv)return '';return `/assets/charms/${type}/lv-${lv}.png`}
function charmDetail(i,p){
  const levels=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
  const type=charmTypeForPiece(i),piece=(i.name==='Belt'?'Ring':i.name);
  return `<div class="v33-section"><div class="v33-kicker"><span>${esc(piece)} CHARMS</span><strong>3 LINKED CHARMS</strong></div>
    <div class="v33-charm-grid">${[0,1,2].map(n=>{
      const lv=clamp(levels[n]||0,0,18),src=charmImg(type,lv),stat=CHARM_STATS[lv]||0;
      return `<article class="v33-charm"><b>CHARM ${n+1}</b>${src?`<img class="v33-charm-img" src="${esc(src)}" alt="Charm Lv ${lv}" onerror="this.style.visibility='hidden'">`:'<span class="v33-charm-img"></span>'}
        <select class="v33-select" data-v33-charm-level="${n}">${optionRange(18,lv)}</select>
        <div class="v33-result">${lv?`Lv ${lv} • Stat total +${stat}%`:'Not active'}</div></article>`;
    }).join('')}</div></div>`;
}

function detailBody(i,p){
  if(activeCat==='heroes')return heroDetail(i,p);
  if(activeCat==='experts')return expertDetail(i,p);
  if(activeCat==='pets')return petDetail(i,p);
  if(activeCat==='troops')return troopDetail(i,p);
  if(activeCat==='gear')return gearDetail(i,p);
  return charmDetail(i,p);
}
function openDetail(id){
  selectedId=String(id);detailOpen=true;renderDetail();
  $('#nexa-v33-detail')?.classList.add('open');
}
function closeDetail(){detailOpen=false;selectedId=null;$('#nexa-v33-detail')?.classList.remove('open')}
function renderDetail(){
  const o=$('#nexa-v33-detail');if(!o)return;
  const i=items.find(x=>String(x.id)===String(selectedId));if(!i){o.innerHTML='';return}
  const p=progOf(i),c=colorFor(i,catItems().indexOf(i)),img=itemImg(i,p),fallback=GEAR_FALLBACK[pieceKey(i)]||'';
  o.innerHTML=`<section class="v33-sheet"><div class="v33-detail-head"><span class="v33-mini ${i.item_type==='chief_gear'?'gear':i.item_type==='troop'?'troop':''}" style="--c:${c}">${imgTag(img,i.name,fallback)}</span>
    <div class="v33-title"><h3>${esc(activeCat==='charms'?`${i.name==='Belt'?'Ring':i.name} Charms`:(i.name==='Belt'?'Ring':i.name))}</h3><small>${esc(meta(i,p))}</small></div><button class="v33-close" data-v33-close>×</button></div>
    <div id="v33-detail-body">${detailBody(i,p)}</div>
    <div class="v33-actions"><button class="v33-reset" data-v33-reset>RESET</button><button class="v33-save" data-v33-save>SAVE</button></div><div class="v33-msg"></div></section>`;
}
function render(){ensureShell();renderCats();renderFilters();renderGrid()}
function currentDraft(){const i=items.find(x=>String(x.id)===String(selectedId));return i?structuredClone(progOf(i)||{}):null}
function rerenderBody(draft){
  const i=items.find(x=>String(x.id)===String(selectedId)),b=$('#v33-detail-body');if(!i||!b)return;
  b.innerHTML=detailBody(i,draft);
}
async function save(){
  const i=items.find(x=>String(x.id)===String(selectedId)),c=sb();if(!i||!c||!accountId)return;
  const d=currentDraft()||{},root=$('#nexa-v33-detail');
  if(activeCat==='heroes'){
    d.star_step=Number(root.dataset.starStep||d.star_step||0);d.stars=d.star_step/6;d.widget_level=Number($('[data-v33-widget-level]',root)?.value||d.widget_level||0);d.hero_skills={};
    $$('[data-v33-hero-skill-box]',root).forEach(box=>{d.hero_skills[box.dataset.v33HeroSkillBox]=Number($('.v33-level.active[data-v33-hero-skill]',box)?.dataset.level||0)});
  }else if(activeCat==='experts'){
    d.affinity=Number($('[data-v33-affinity]',root)?.value||0);d.expert_skills={};
    $$('[data-v33-expert-box]',root).forEach(box=>{d.expert_skills[box.dataset.v33ExpertBox]=Number($('[data-v33-expert-skill]',box)?.value||0)});
  }else if(activeCat==='pets'){
    d.level=Number($('[data-v33-pet-level]',root)?.value||0);d.pet_skill=Number($('[data-v33-pet-skill]',root)?.value||0);
  }else if(activeCat==='troops'){
    d.tier=Number(root.dataset.troopTier||d.tier||1);d.fc_level=Number(root.dataset.troopFc||d.fc_level||0);
    d.t11_unlocked=root.dataset.t11==='1';d.t12_unlocked=root.dataset.t12==='1';d.advanced_skill=Number(root.dataset.troopSkill||d.advanced_skill||0);
  }else if(activeCat==='gear'){
    d.gear_quality=root.dataset.gearQ||d.gear_quality||'Green';d.gear_tier=Number(root.dataset.gearTier??d.gear_tier??0);
    d.gear_stars=Number(root.dataset.gearStar??d.gear_stars??0);d.gear_substep=Number(root.dataset.gearSub??d.gear_substep??0);
  }else{
    d.charm_levels=[0,1,2].map(n=>Number($(`[data-v33-charm-level="${n}"]`,root)?.value||0));
    d.charm_substeps=[0,0,0];
    [d.charm_1,d.charm_2,d.charm_3]=d.charm_levels;
  }
  const {data:{user}}=await c.auth.getUser();if(!user)return;
  const q=await c.from('player_library_inventory').upsert({user_id:user.id,player_account_id:accountId,library_item_id:i.id,owned:true,progress:d,updated_at:new Date().toISOString()},{onConflict:'player_account_id,library_item_id'}).select().single();
  const msg=$('.v33-msg',root);if(q.error){if(msg)msg.textContent=q.error.message;return}
  const pos=inventory.findIndex(x=>String(x.library_item_id)===String(i.id));if(pos>=0)inventory[pos]=q.data;else inventory.push(q.data);
  if(msg)msg.textContent='Saved ✓';renderGrid();setTimeout(()=>rerenderBody(d),60);
}
async function reset(){
  const i=items.find(x=>String(x.id)===String(selectedId)),c=sb();if(!i||!c||!accountId)return;
  const row=invOf(i);if(row){const q=await c.from('player_library_inventory').update({owned:false,progress:{},updated_at:new Date().toISOString()}).eq('id',row.id).select().single();if(!q.error){const p=inventory.findIndex(x=>x.id===row.id);inventory[p]=q.data}}
  renderGrid();renderDetail();
}
function ministrySVG(){return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 4h12v3l-2 2v8h2v3H6v-3h2V9L6 7V4zm4 5v8h4V9h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4V2m4 2V2m4 2V2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`}
function paintMinistryButton(active=false,label=''){
  const b=$('#nexa-v425-ministry');if(!b)return;b.innerHTML=ministrySVG();b.dataset.v33MinistryActive=active?'1':'0';b.title=active?label:'No active Ministry appointment';
}
async function activeMinistryAppointment(){
  const c=sb();if(!c)return null;await resolveAccount();if(!accountId)return null;
  try{
    const now=new Date().toISOString();
    const ev=await c.from('svs_events').select('id,prep_monday,is_live,auto_end_at').eq('is_live',true).order('prep_monday',{ascending:false}).limit(10);
    const live=(ev.data||[]).filter(x=>!x.auto_end_at||new Date(x.auto_end_at)>new Date());
    if(!live.length)return null;
    const ids=live.map(x=>x.id);
    const ap=await c.from('ministry_appointments').select('id,event_id,player_account_id,day_type,ministry_position,appointment_time,notes').in('event_id',ids).eq('player_account_id',accountId).gte('appointment_time',now).order('appointment_time',{ascending:true}).limit(1).maybeSingle();
    return ap.error?null:(ap.data||null);
  }catch(e){console.warn('V33 ministry',e?.message||e);return null}
}
async function refreshMinistryState(){ministryState=await activeMinistryAppointment();paintMinistryButton(!!ministryState,ministryState?`${ministryState.ministry_position||''} ${ministryState.day_type||''}`.trim():'')}
function ministryOverlay(ap){
  $('#nexa-v33-ministry-overlay')?.remove();const o=document.createElement('div');o.id='nexa-v33-ministry-overlay';
  o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(1,3,12,.78);backdrop-filter:blur(8px);display:grid;place-items:center;padding:18px';
  const when=ap?.appointment_time?new Date(ap.appointment_time).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'';
  o.innerHTML=`<section style="width:min(430px,100%);border:1px solid rgba(190,149,255,.68);border-radius:24px;background:linear-gradient(160deg,#111632,#070b1d);padding:20px"><div style="color:#caa7ff;font-size:10px;font-weight:950;letter-spacing:.18em">MINISTRY</div><h3 style="margin:8px 0 12px;color:#fff;font-size:23px">${ap?'Ministry Appointment':'No active Ministry appointment'}</h3>${ap?`<div style="color:#c8cce0;font-size:13px;line-height:1.55"><b style="color:#fff">${esc(ap.ministry_position||'')}</b><br>${esc(ap.day_type||'')} • ${esc(when)}</div>`:`<p style="margin:0;color:#aeb6cf;font-size:13px">There is no current Ministry appointment for this account.</p>`}<button data-v33-close-ministry style="margin-top:18px;border:1px solid rgba(190,149,255,.65);border-radius:999px;background:#0d1230;color:#fff;padding:9px 16px;font-weight:900">Close</button></section>`;
  document.body.appendChild(o);
}
document.addEventListener('click',e=>{
  const ministry=e.target.closest?.('#nexa-v425-ministry');if(ministry){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();(async()=>{await refreshMinistryState();ministryOverlay(ministryState)})();return}
  if(e.target.closest?.('[data-v33-close-ministry]')){$('#nexa-v33-ministry-overlay')?.remove();return}
  const cat=e.target.closest?.('[data-v33-cat]');if(cat){activeCat=cat.dataset.v33Cat;activeGen='all';closeDetail();render();return}
  const gen=e.target.closest?.('[data-v33-gen]');if(gen){activeGen=gen.dataset.v33Gen;renderFilters();renderGrid();return}
  const item=e.target.closest?.('[data-v33-item]');if(item){openDetail(item.dataset.v33Item);return}
  if(e.target.closest?.('[data-v33-close]')||e.target.id==='nexa-v33-detail'){if(e.target.id==='nexa-v33-detail'||e.target.closest?.('[data-v33-close]'))closeDetail();return}
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const i=items.find(x=>String(x.id)===String(selectedId));if(!i)return;
  const d=currentDraft()||{};
  const flower=e.target.closest?.('[data-v33-star]');if(flower){const s=Number(flower.dataset.v33Star),cur=Number(root.dataset.starStep||d.star_step||0),base=s*6,within=clamp(cur-base,0,6);root.dataset.starStep=String(within>=6?base:base+6);d.star_step=Number(root.dataset.starStep);rerenderBody(d);return}
  const hs=e.target.closest?.('[data-v33-hero-skill]');if(hs){const box=hs.closest('.v33-skill');$$('[data-v33-hero-skill]',box).forEach(x=>x.classList.toggle('active',x===hs));const s=i.metadata?.expedition_skills?.[Number(hs.dataset.v33HeroSkill)],res=$('.v33-result',box);if(res&&s)res.textContent=exactSkillValue(s,Number(hs.dataset.level));return}
  const tt=e.target.closest?.('[data-v33-troop-tier]');if(tt){root.dataset.troopTier=tt.dataset.v33TroopTier;d.tier=Number(tt.dataset.v33TroopTier);rerenderBody(d);return}
  const tf=e.target.closest?.('[data-v33-troop-fc]');if(tf){root.dataset.troopFc=tf.dataset.v33TroopFc;d.fc_level=Number(tf.dataset.v33TroopFc);if(d.fc_level<5){root.dataset.t11='0';root.dataset.t12='0';d.t11_unlocked=false;d.t12_unlocked=false}if(d.fc_level<10){root.dataset.t12='0';d.t12_unlocked=false}rerenderBody(d);return}
  const t11=e.target.closest?.('[data-v33-t11]');if(t11){root.dataset.t11=t11.dataset.v33T11;d.t11_unlocked=t11.dataset.v33T11==='1';if(!d.t11_unlocked){root.dataset.t12='0';d.t12_unlocked=false}rerenderBody(d);return}
  const t12=e.target.closest?.('[data-v33-t12]');if(t12){root.dataset.t12=t12.dataset.v33T12;d.t12_unlocked=t12.dataset.v33T12==='1';rerenderBody(d);return}
  const ts=e.target.closest?.('[data-v33-troop-skill]');if(ts){root.dataset.troopSkill=ts.dataset.v33TroopSkill;d.advanced_skill=Number(ts.dataset.v33TroopSkill);rerenderBody(d);return}
  const gq=e.target.closest?.('[data-v33-gear-q]');if(gq){root.dataset.gearQ=gq.dataset.v33GearQ;root.dataset.gearTier='0';root.dataset.gearStar='0';root.dataset.gearSub='0';d.gear_quality=gq.dataset.v33GearQ;d.gear_tier=0;d.gear_stars=0;d.gear_substep=0;rerenderBody(d);return}
  const gt=e.target.closest?.('[data-v33-gear-tier]');if(gt){root.dataset.gearTier=gt.dataset.v33GearTier;root.dataset.gearStar='0';root.dataset.gearSub='0';d.gear_tier=Number(gt.dataset.v33GearTier);d.gear_stars=0;d.gear_substep=0;rerenderBody(d);return}
  const gs=e.target.closest?.('[data-v33-gear-star]');if(gs){root.dataset.gearStar=gs.dataset.v33GearStar;root.dataset.gearSub='0';d.gear_stars=Number(gs.dataset.v33GearStar);d.gear_substep=0;rerenderBody(d);return}
  const gsub=e.target.closest?.('[data-v33-gear-sub]');if(gsub){root.dataset.gearSub=gsub.dataset.v33GearSub;d.gear_substep=Number(gsub.dataset.v33GearSub);rerenderBody(d);return}
  const csub=e.target.closest?.('[data-v33-charm-sub]');if(csub){const [n,x]=csub.dataset.v33CharmSub.split(':');root.dataset[`charmSub${n}`]=x;const levels=[0,1,2].map(k=>Number($(`[data-v33-charm-level="${k}"]`,root)?.value||0));d.charm_levels=levels;d.charm_substeps=[0,1,2].map(k=>Number(root.dataset[`charmSub${k}`]||0));rerenderBody(d);return}
  if(e.target.closest?.('[data-v33-save]')){save();return}
  if(e.target.closest?.('[data-v33-reset]')){reset();return}
},true);

document.addEventListener('change',e=>{
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const i=items.find(x=>String(x.id)===String(selectedId));if(!i)return;
  if(e.target.matches?.('[data-v33-affinity]')){const badge=$('.v33-status',e.target.closest('.v33-section'));if(badge)badge.textContent=expertStatus(e.target.value);const k=$('.v33-kicker strong',e.target.closest('.v33-section'));if(k)k.textContent=`${e.target.value}/100`}
  if(e.target.matches?.('[data-v33-expert-skill]')){const box=e.target.closest('.v33-skill'),s=i.metadata?.skills?.[Number(e.target.dataset.v33ExpertSkill)],res=$('.v33-result',box);if(res&&s)res.textContent=`Level ${e.target.value} • ${exactSkillValue(s,Number(e.target.value))}`}
  if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level],[data-v33-widget-level]')){const d=currentDraft()||{};if(e.target.matches('[data-v33-pet-level]'))d.level=Number(e.target.value);if(e.target.matches('[data-v33-pet-skill]'))d.pet_skill=Number(e.target.value);if(e.target.matches('[data-v33-charm-level]')){d.charm_levels=[0,1,2].map(n=>Number($(`[data-v33-charm-level="${n}"]`,root)?.value||0));d.charm_substeps=[0,0,0]}if(e.target.matches('[data-v33-widget-level]'))d.widget_level=Number(e.target.value);rerenderBody(d)}
},true);

function boot(){
  injectCSS();ensureShell();render();paintMinistryButton(false);load();
  [100,300,700,1400].forEach(ms=>setTimeout(()=>{ensureShell();paintMinistryButton(!!ministryState,ministryState?`${ministryState.ministry_position||''} ${ministryState.day_type||''}`.trim():'')},ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{ensureShell();load()},100));
})();
