/* NEXA V43.6 — FOCUSED PROFILE + ACCESS FIX — 2026-08-24
   Multiple Owner operational roles + module badges.
   Hero/Expert/Pet visual polish + Ministry Appointments pill.
   Main Account chip + anti-flash/profile fixes.
   No global MutationObserver. No polling.
*/
(()=>{
'use strict';
if(window.__NEXA_V43_REVIEW_HOTFIX__)return;
window.__NEXA_V43_REVIEW_HOTFIX__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const pad=n=>String(Math.max(0,Number(n)||0)).padStart(2,'0');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function addCSS(){
  if($('#nexa-v43-review-hotfix-css'))return;
  const s=document.createElement('style');
  s.id='nexa-v43-review-hotfix-css';
  s.textContent=`
  #nexa-v430-transfer-card h3,
  #home-transfers-section h2,
  #home-transfers-section h3{
    font-size:16px!important;line-height:1.15!important;margin:3px 0 4px!important
  }

  .nexa-widget-table .v33-skills{
    display:grid!important;grid-template-columns:1fr!important;gap:8px!important
  }
  .nexa-widget-table .v33-skill{
    display:grid!important;
    grid-template-columns:minmax(118px,.85fr) minmax(0,1.7fr) minmax(88px,.55fr)!important;
    gap:10px!important;align-items:center!important;padding:11px 12px!important;min-height:0!important
  }
  .nexa-widget-table .nexa-widget-cell{min-width:0!important}
  .nexa-widget-table .nexa-widget-name b{
    display:block!important;color:#fff!important;font-size:12px!important;line-height:1.25!important
  }
  .nexa-widget-table .nexa-widget-name span{
    display:block!important;margin-top:3px!important;color:#77e9ff!important;
    font-size:8px!important;font-weight:950!important;letter-spacing:.12em!important
  }
  .nexa-widget-table .nexa-widget-desc{
    color:#c8cfe2!important;font-size:10px!important;line-height:1.4!important
  }
  .nexa-widget-table .nexa-widget-buff{
    padding:8px 9px!important;border:1px solid rgba(152,93,255,.4)!important;
    border-radius:10px!important;background:rgba(79,40,143,.22)!important;
    color:#fff!important;font-size:11px!important;font-weight:900!important;text-align:center!important
  }
  @media(max-width:520px){
    .nexa-widget-table .v33-skill{grid-template-columns:1fr!important;gap:6px!important}
    .nexa-widget-table .nexa-widget-buff{text-align:left!important}
  }

  .v33-charm-img{
    object-fit:contain!important;background:transparent!important;opacity:1!important;
    transform:scale(1.08)!important
  }

  .nexa-pet-skill-clickable .v33-skill-top{
    cursor:pointer!important;border-radius:16px!important;padding:8px!important;
    background:radial-gradient(circle at 15% 50%,rgba(73,219,255,.14),transparent 42%)!important
  }
  .nexa-pet-skill-clickable .v33-skill-icon{
    box-shadow:0 0 12px rgba(63,221,255,.6),0 0 28px rgba(96,89,255,.26)!important;
    animation:nexaPetGlow 2.2s ease-in-out infinite!important
  }
  .nexa-pet-skill-clickable .nexa-pet-desc{
    display:none!important;margin:8px 0 0!important;color:#cbd3e8!important;
    font-size:10px!important;line-height:1.45!important
  }
  .nexa-pet-skill-clickable.open .nexa-pet-desc{display:block!important}
  @keyframes nexaPetGlow{
    0%,100%{transform:scale(.96);filter:brightness(.92)}
    50%{transform:scale(1.04);filter:brightness(1.16)}
  }

  #nexa-v425-ministry{
    color:#69e7ff!important;border-color:rgba(76,218,255,.72)!important;
    background:radial-gradient(circle at 50% 45%,rgba(46,205,255,.22),rgba(7,17,37,.95) 70%)!important;
    box-shadow:0 0 10px rgba(61,215,255,.34),0 0 24px rgba(72,101,255,.18)!important
  }

  #nexa-owner-operational-role{
    margin:12px 0!important;padding:13px!important;border:1px solid rgba(94,222,255,.28)!important;
    border-radius:16px!important;background:linear-gradient(145deg,rgba(7,30,49,.82),rgba(10,12,35,.94))!important
  }
  #nexa-owner-operational-role label{
    display:grid!important;gap:7px!important;color:#d9e8ff!important;font-weight:850!important
  }
  #nexa-owner-operational-role select{
    width:100%!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:11px!important;
    padding:10px!important;background:#091329!important;color:#fff!important
  }
  #nexa-owner-operational-role .nexa-role-actions{
    display:flex!important;gap:8px!important;margin-top:9px!important
  }`;
  document.head.appendChild(s);
}

function cleanMultiserverBranding(){
  const p=$('.nexa-auth-brand p');
  if(p){
    const cleaned=(p.textContent||'')
      .replace(/\bSTATE\s*1518\s*[•·|\-–—]?\s*/ig,'')
      .replace(/^\s*[•·|\-–—]\s*/,'').trim();
    p.textContent=cleaned||'MANAGEMENT & EVENT COORDINATION';
  }
  $$('.footer').forEach(f=>{
    if(/NEXA\s*[•·]\s*State\s*1518/i.test(f.textContent||'')){
      f.innerHTML='One hub. Everything connected.<br>NEXA';
    }
  });
}

function ministrySVG(){
  return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <rect x="4.5" y="5.5" width="15" height="14" rx="2.4"
      fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4"
      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z"
      fill="currentColor"/>
  </svg>`;
}
function repairMinistry(){
  const b=$('#nexa-v425-ministry');
  if(!b)return;
  if(!b.querySelector('svg'))b.innerHTML=ministrySVG();
  b.setAttribute('aria-label',b.getAttribute('aria-label')||'Ministry appointment');
}

function charmTypeFromAlt(alt=''){
  const s=String(alt).toLowerCase();
  if(s.includes('infantry'))return 'infantry';
  if(s.includes('lancer'))return 'lancer';
  if(s.includes('marksman'))return 'marksman';
  return '';
}
function repairCharmAssets(root=document){
  $$('.v33-charm-img',root).forEach(img=>{
    const alt=img.alt||'';
    const type=charmTypeFromAlt(alt);
    const m=alt.match(/Lv\s*(\d+)/i);
    const lv=m?Number(m[1]):0;
    if(!type||!lv)return;
    const wanted=`/lv${pad(lv)}-${type}.png`;
    img.onerror=()=>{img.style.opacity='.2';};
    if(img.getAttribute('src')!==wanted)img.src=wanted;
    img.style.opacity='1';
  });
}

function troopTypeFromText(text=''){
  const s=String(text).toLowerCase();
  if(s.includes('infantry'))return 'infantry';
  if(s.includes('lancer'))return 'lancer';
  if(s.includes('marksman'))return 'marksman';
  return '';
}
function troopAsset(type,tier){
  return type&&tier?`/nexa-troop-${type}-t${tier}.webp`:'';
}
function repairTroopPortraits(root=document){
  $$('.v33-item[data-type="troop"]',root).forEach(card=>{
    const type=troopTypeFromText(card.textContent||'');
    const m=(card.textContent||'').match(/\bT(\d{1,2})\b/i);
    const tier=m?Number(m[1]):1;
    const img=$('img',card),src=troopAsset(type,tier);
    if(img&&src&&img.getAttribute('src')!==src)img.src=src;
  });

  const sheet=$('#nexa-v33-detail .v33-sheet',root);
  if(sheet){
    const titleText=(($('.v33-title',sheet)||{}).textContent||'');
    const type=troopTypeFromText(titleText);
    const active=$('[data-v33-troop-tier].active',sheet);
    const tier=Number(active?.dataset.v33TroopTier||((titleText.match(/\bT(\d{1,2})\b/i)||[])[1])||1);
    const img=$('.v33-mini.troop img',sheet),src=troopAsset(type,tier);
    if(img&&src)img.src=src;
  }
}

function normalizeWidgetRows(root=document){
  $$('.v33-section',root).forEach(sec=>{
    const kicker=$('.v33-kicker span',sec);
    if(!kicker||!/EXCLUSIVE GEAR|WIDGET/i.test(kicker.textContent||''))return;
    sec.classList.add('nexa-widget-table');
    $$('.v33-skill',sec).forEach((card,index)=>{
      if(card.dataset.nexaWidgetRow==='1')return;
      const name=$('h4',card)?.textContent?.trim()||`Widget Effect ${index+1}`;
      const desc=$('.v33-skill-top small',card)?.textContent?.trim()||'';
      const result=$('.v33-result',card)?.textContent?.trim()||'Not active';
      const type=card.dataset.skillType||((index===0)?'GEAR EFFECT':'WIDGET EFFECT');
      card.innerHTML=
        `<div class="nexa-widget-cell nexa-widget-name"><b>${esc(name)}</b><span>${esc(type)}</span></div>`+
        `<div class="nexa-widget-cell nexa-widget-desc">${esc(desc)}</div>`+
        `<div class="nexa-widget-cell nexa-widget-buff">${esc(result)}</div>`;
      card.dataset.nexaWidgetRow='1';
    });
  });
}

function polishPetSkill(root=document){
  $$('.v33-section',root).forEach(sec=>{
    const kicker=$('.v33-kicker span',sec);
    if(!kicker||!/PET SKILL/i.test(kicker.textContent||''))return;
    const card=$('.v33-skill',sec);
    if(!card)return;
    card.classList.add('nexa-pet-skill-clickable');
    const top=$('.v33-skill-top',card);
    if(!top)return;
    if(!$('.nexa-pet-desc',card)){
      const description=$('.v33-skill-top small',card)?.textContent?.trim()||'';
      const p=document.createElement('p');
      p.className='nexa-pet-desc';
      p.textContent=description||'Pet skill details';
      top.after(p);
    }
    if(top.dataset.nexaPetToggle!=='1'){
      top.dataset.nexaPetToggle='1';
      top.setAttribute('role','button');
      top.setAttribute('tabindex','0');
      const toggle=()=>card.classList.toggle('open');
      top.addEventListener('click',toggle);
      top.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
      });
    }
  });
}

async function ensureOwnerRoleCard(){
  const host=$('#admin-roles');
  if(!host||$('#nexa-owner-operational-role',host))return;

  const client=window.supabaseClient||window.sb;
  if(!client?.auth?.getUser)return;

  let user=null,role='';
  try{
    ({data:{user}}=await client.auth.getUser());
    const rr=await client.rpc('current_nexa_role');
    role=String(rr?.data||'').toLowerCase();
  }catch(_){return;}

  if(!user||role!=='owner')return;

  const card=document.createElement('div');
  card.id='nexa-owner-operational-role';
  card.innerHTML=`
    <b>MY OPERATIONAL ROLE</b>
    <p class="muted">Owner access stays protected. This only assigns your working role.</p>
    <label>Operational Role
      <select id="nexa-owner-role-select">
        <option value="">None</option>
        <option value="battle_strategist">Battle Strategist</option>
        <option value="event_operator">Event Operator</option>
        <option value="scheduler">Scheduler</option>
        <option value="transfer_coordinator">Transfer Coordinator</option>
      </select>
    </label>
    <div class="nexa-role-actions">
      <button id="nexa-owner-role-save" class="btn" type="button">Save My Role</button>
    </div>
    <div id="nexa-owner-role-message" class="form-message"></div>`;
  host.appendChild(card);

  const select=$('#nexa-owner-role-select',card);
  const msg=$('#nexa-owner-role-message',card);

  try{
    const q=await client.from('nexa_operational_roles')
      .select('role').eq('user_id',user.id).limit(1).maybeSingle();
    if(q.data?.role)select.value=q.data.role;
  }catch(_){}

  $('#nexa-owner-role-save',card).onclick=async()=>{
    msg.textContent='Saving…';
    try{
      const wanted=select.value;
      const del=await client.from('nexa_operational_roles').delete().eq('user_id',user.id);
      if(del.error)throw del.error;
      if(wanted){
        const ins=await client.from('nexa_operational_roles')
          .insert({user_id:user.id,role:wanted,created_by:user.id});
        if(ins.error)throw ins.error;
      }
      msg.textContent='Operational role updated ✓';
    }catch(e){
      msg.textContent=e?.message||'Could not update role.';
    }
  };
}

function applyAll(){
  addCSS();
  cleanMultiserverBranding();
  repairMinistry();
  repairCharmAssets();
  repairTroopPortraits();
  normalizeWidgetRows();
  polishPetSkill();
  ensureOwnerRoleCard();
}
function deferApply(){
  requestAnimationFrame(applyAll);
  setTimeout(applyAll,60);
  setTimeout(applyAll,220);
}

document.addEventListener('click',e=>{
  if(e.target.closest?.(
    '[data-nexa-tab],.v33-item,[data-v33-cat],[data-v33-gen],'+
    '[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],'+
    '[data-v33-troop-skill],[data-v33-widget],#nexa-profile-launcher-section,'+
    '[data-open-full-profile],#admin-panel-button,[data-admin-tab]'
  ))deferApply();
},true);

document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level]')){
    deferApply();
  }
},true);

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',applyAll,{once:true});
}else applyAll();

window.addEventListener('load',applyAll,{once:true});
window.addEventListener('pageshow',applyAll);

setTimeout(applyAll,350);
setTimeout(applyAll,1100);
})();


/* ==========================================================
   NEXA V43.4 PROFILE + ROLES CONSOLIDATED FIX
   Loaded after the V43 base above. This layer owns the fixes
   requested in the Aug 24 review without changing Chief Gear.
   ========================================================== */
(()=>{
'use strict';
if(window.__NEXA_V432_ADDON__)return;
window.__NEXA_V432_ADDON__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const pad=n=>String(Number(n)||0).padStart(2,'0');
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'");
const EXP=[0,'5%','7.5%','10%','12.5%','15%'];

/* Verified/curated Exclusive Gear names + two effects.
   Odd Widget levels raise Exploration: 1/3/5/7/9.
   Even Widget levels raise Expedition: 2/4/6/8/10.
   Where a source gives a full effect ladder, it is explicit.
   Otherwise NEXA displays Effect Lv x/5 instead of fabricating a value. */
const W={
 jeronimo:['Dawnbreak','Shield of Swords',['Damage Taken -10%','Damage Taken -15%','Damage Taken -20%','Damage Taken -25%','Damage Taken -30%'],'Discernment','Rally Troop Attack'],
 natalia:['Gale Force','Unity',['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%'],'Invincibles','Rally Troop Lethality'],
 molly:['Yeti Spirit','Modified Launcher',['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%'],'Snowy Blessing','Defender Troop Lethality'],
 zinman:['Woodpecker','Overclocked Nail Gun',['Attack Speed +8%','Attack Speed +12%','Attack Speed +16%','Attack Speed +20%','Attack Speed +24%'],'Defend to Attack','Defender Troop Attack'],
 flint:['Dragonbane','Vengeful Task',['Attack +8%','Attack +12%','Attack +16%','Attack +20%','Attack +24%'],'Dragonbreath','Defender Troop Attack'],
 philly:['Pharmacologica','Extraction',['Healing +30%','Healing +40%','Healing +50%','Healing +60%','Healing +70%'],'First Aid Training','Defender Troop Health'],
 alonso:['Captain Ahab',"Ocean's Bounty",null,'Harpoon Enhancement','Rally Troop Lethality'],
 logan:['Fists of Steel','Enhanced Fists of Steel',['Damage +10%','Damage +15%','Damage +20%','Damage +25%','Damage +30%'],'Strong Protection','Defender Troop Defense'],
 mia:['Fate Crystal','Vision of Truth',['Fluctuation +30','Fluctuation +60','Fluctuation +90','Fluctuation +120','Fluctuation +150'],'Rally of Fate','Rally Troop Attack'],
 greg:['State Edict','Courtroom Order',['Silence 3s • Damage 220%','Silence 3.5s • Damage 240%','Silence 4s • Damage 260%','Silence 4.5s • Damage 280%','Silence 5s • Damage 300%'],'Trumpet of Justice','Rally Troop Health'],
 ahmose:["Guardian's Relic",'Unyielding Determination',['Attack +30%','Attack +33%','Attack +36%','Attack +39%','Attack +42%'],'Oath of Guardian','Defender Troop Health'],
 reina:['Ninjaken - Raikiri','Silhouette Strike',['Extra hit 25%','Extra hit 30%','Extra hit 35%','Extra hit 40%','Extra hit 45%'],'Fiery Invasion','Rally Troop Lethality'],
 lynn:["Ella's Tear","Aira's Elegy",['Attack +7%','Attack +9%','Attack +11%','Attack +13%','Attack +15%'],"Iranon's Determination",'Defender Troop Lethality'],
 hector:['Steel Fangs',"Reaper's Embrace",['Heal 7% of damage','Heal 9% of damage','Heal 11% of damage','Heal 13% of damage','Heal 15% of damage'],'Goliath','Defender Troop Attack'],
 norah:['Snow Cruiser','Disruptor',['Stun 25% • 0.6s','Stun 27.5% • 0.7s','Stun 30% • 0.8s','Stun 32.5% • 0.9s','Stun 35% • 1s'],'True Grit','Defender Troop Defense'],
 gwen:['Wings of Hope','Fire Support Unit',['Damage 50%','Damage 55%','Damage 60%','Damage 65%','Damage 70%'],'Marauder','Rally Troop Lethality'],
 'wu ming':['Dragonslayer','Martial Zenith',['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%'],'Steel Discipline','Defender Troop Defense'],
 renee:['Illusion Magiball','Dream Illusion',['Confusion 2%','Confusion 3.5%','Confusion 5%','Confusion 6.5%','Confusion 8%'],'Wistful Enchantment','Rally Troop Lethality'],
 wayne:['Power Boomerang','Gunslinger',['Damage 40% • Knockdown 40%','Damage 44% • Knockdown 55%','Damage 48% • Knockdown 70%','Damage 52% • Knockdown 85%','Damage 56% • Knockdown 100%'],'Offensive Defense','Defender Troop Lethality'],
 edith:['Charm Toolkit','Pocket Engineer',['Heal 15% • DEF +10%','Heal 20% • DEF +15%','Heal 25% • DEF +20%','Heal 30% • DEF +25%','Heal 35% • DEF +30%'],'Fortworks','Defender Troop Health'],
 gordon:['Bonecrux Venom','Potion #1325',['Damage Dealt +5%','Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%'],'Bio Assault','Rally Troop Lethality'],
 bradley:['Thunder Cannon','Onslaught',['Attack Speed +6%','Attack Speed +8%','Attack Speed +10%','Attack Speed +12%','Attack Speed +14%'],'Siege Insight','Defender Troop Attack'],
 gatot:['Golden Fang',"King's Punishment",['Shield +55% • Reflect 10%','Shield +65% • Reflect 15%','Shield +75% • Reflect 20%','Shield +85% • Reflect 25%','Shield +95% • Reflect 30%'],'Indestructible City','Defender Troop Defense'],
 sonya:['Mangrove Frog','Chilled to the Bone',['Attack +8% • Shatter 50%','Attack +12% • Shatter 55%','Attack +16% • Shatter 60%','Attack +20% • Shatter 65%','Attack +24% • Shatter 70%'],'Vortex Turret','Defender Troop Lethality'],
 hendrik:['Abyss Diver',"Hydra's Dance",['Summonee HP 10%','Summonee HP 15%','Summonee HP 20%','Summonee HP 25%','Summonee HP 30%'],'Abyssal Blessing','Rally Troop Attack'],
 magnus:['Storm Axe','Heroic Stock',['Damage -5% • DEF +25%','Damage -7.5% • DEF +37.5%','Damage -10% • DEF +50%','Damage -12.5% • DEF +62.5%','Damage -15% • DEF +75%'],'Valoric Inspiration','Defender Troop Health'],
 fred:['Blazebearer','Idealism',['Attack +8% • DEF/stack +2%','Attack +12% • DEF/stack +4%','Attack +16% • DEF/stack +6%','Attack +20% • DEF/stack +8%','Attack +24% • DEF/stack +10%'],'Call of the Firefighter','Rally Troop Attack'],
 xura:['Witch Mask','War Cry',['Damage +20%','Damage +30%','Damage +40%','Damage +50%','Damage +60%'],'Gaiac Hymn','Defender Troop Attack'],
 gregory:['Solarsword','Indomitable Armor',['Defense +10%','Defense +20%','Defense +30%','Defense +40%','Defense +50%'],'Day of the Guard','Defender Troop Lethality'],
 freya:['Blood Moon Scythe','Night Raid',['Damage +10%','Damage +15%','Damage +20%','Damage +25%','Damage +30%'],'Defender of the Watch','Defender Troop Defense'],
 blanchette:['Wolf Hunter',"Hunter's Rage",['Attack Speed +10%','Attack Speed +15%','Attack Speed +20%','Attack Speed +25%','Attack Speed +30%'],'Lightning Strike','Rally Troop Lethality'],
 eleonora:['Scepter of Solaris','Hammer & Shield',['ATK +8% • DEF +25%','ATK +12% • DEF +37.5%','ATK +16% • DEF +50%','ATK +20% • DEF +62.5%','ATK +24% • DEF +75%'],'Last Fortress','Defender Troop Health'],
 lloyd:['Mastercraft Treasure','Frosty Whisper',['Damage +3% • Speed -3%','Damage +6% • Speed -6%','Damage +9% • Speed -9%','Damage +12% • Speed -12%','Damage +15% • Speed -15%'],'Steel Maze','Defender Troop Attack'],
 rufus:['Meteor Blaster','Ember of Conflict',['Burn 6%/s','Burn 12%/s','Burn 18%/s','Burn 24%/s','Burn 30%/s'],'Blazing Legion','Rally Troop Attack'],
 hervor:['Hammer of Sathla','Mark of the Chieftain',['Speed +10% • Chance +5%','Speed +15% • Chance +10%','Speed +20% • Chance +15%','Speed +25% • Chance +20%','Speed +30% • Chance +25%'],'Fort of Rock','Defender Troop Defense'],
 karol:['Spirit of Winterwind','Eagle Flutter',['ATK Speed +6% • Move +20%','ATK Speed +8% • Move +40%','ATK Speed +10% • Move +60%','ATK Speed +12% • Move +80%','ATK Speed +14% • Move +100%'],'Triumphant March','Rally Troop Attack'],
 ligeia:['Fateweaver','Spider Queen',['Extra target 25%','Extra target 50%','Extra target 75%','Extra target 75%','Extra target 100%'],'Trap Nest','Defender Troop Lethality'],
 gisela:['Helacore','Energy Efficiency',['Energy +3 • Shield +70%','Energy +6 • Shield +100%','Energy +9 • Shield +130%','Energy +12 • Shield +160%','Energy +15 • Shield +190%'],'Auto-Target','Defender Troop Attack'],
 flora:['Kernel of Plenty',"Venom's Heart",['Damage 5%','Damage 10%','Damage 15%','Damage 20%','Damage 25%'],'Fruit of Life','Defender Troop Health'],
 vulcanus:['Doom Sigil','Laceration',['Bleed 4%','Bleed 8%','Bleed 12%','Bleed 16%','Bleed 20%'],'Born King','Rally Troop Attack'],
 elif:['Moonscar','Blazing Edge',['Speed +7% • Confusion +7%','Speed +10% • Confusion +10%','Speed +13% • Confusion +13%','Speed +16% • Confusion +16%','Speed +20% • Confusion +20%'],"Guardian's Grace",'Defender Troop Defense'],
 dominic:['Exobox','Illusion Mastery',['Damage Dealt +5%','Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%'],'Grand Fantasy','Rally Troop Lethality'],
 cara:['Velocomet','Techno Power',['Normal Attack +5%','Normal Attack +10%','Normal Attack +15%','Normal Attack +20%','Normal Attack +25%'],'Shrouded Haven','Defender Troop Lethality'],
 hank:['Roaring Rage','Steel Barricade',['Shield 100% ATK','Shield 130% ATK','Shield 160% ATK','Shield 190% ATK','Shield 220% ATK'],'Wall of Despair','Defender Troop Health'],
 estrella:['Dreamscape Painting','Color Burst',['Enemy Damage Taken +10%','Enemy Damage Taken +15%','Enemy Damage Taken +20%','Enemy Damage Taken +25%','Enemy Damage Taken +30%'],'Homeland Defense','Defender Troop Attack'],
 viveca:['Dark Star','Blood Hunt',['Damage Dealt +5%','Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%'],'Song of Dawn','Rally Troop Lethality'],
 seigel:['Blacklight Halberd','Inhuman Cast',['Heal 5% of damage','Heal 10% of damage','Heal 15% of damage','Heal 20% of damage','Heal 25% of damage'],"Hell's Vow",'Defender Troop Lethality'],
 ursar:['Progenitor Spear','Venomous Edge',['Poison 10%','Poison 15%','Poison 20%','Poison 25%','Poison 30%'],'Typhoon Drums','Rally Troop Attack'],
 aisling:['Cord of Destiny','Woodland Harmony',['Enemy Speed -10%','Enemy Speed -15%','Enemy Speed -20%','Enemy Speed -25%','Enemy Speed -30%'],'Forest Guardian','Defender Troop Defense']
};

function currentDetailRoot(){return $('#nexa-v33-detail')||$('#nexa-v30-detail')||$('#nexa-profile-modal')}
function currentHero(){
 return (
   $('#nexa-v33-detail .v33-title h3')?.textContent||
   $('#nexa-v30-detail .nexa-v30-detail-head h4')?.textContent||
   $('#nexa-v30-detail h4')?.textContent||
   ''
 ).trim();
}
function effectLv(widgetLevel,kind){
 return kind==='explore'?clamp(Math.ceil(widgetLevel/2),0,5):clamp(Math.floor(widgetLevel/2),0,5);
}
function widgetV432(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const d=W[norm(currentHero())];if(!d)return;
 const sec=$$('.v33-section',root).find(x=>/EXCLUSIVE GEAR|WIDGET/i.test($('.v33-kicker span',x)?.textContent||''));
 if(!sec)return;
 const lv=Number($('[data-v33-widget].active',sec)?.dataset.v33Widget||0);
 const a=effectLv(lv,'explore'),b=effectLv(lv,'exp');
 const k=$('.v33-kicker strong',sec);if(k)k.textContent=`${d[0]} • LV ${lv}`;
 sec.classList.add('nexa-widget-table');
 let skills=$('.v33-skills',sec);
 if(!skills){skills=document.createElement('div');skills.className='v33-skills';sec.appendChild(skills)}
 const aVal=a?(d[2]?.[a-1]||`Effect Lv ${a}/5`):'Locked';
 const bVal=b?`${d[4]} +${EXP[b]}`:'Locked';
 skills.innerHTML=`
  <article class="v33-skill">
   <div class="nexa-widget-name"><b>${d[1]}</b><span>EXPLORATION</span></div>
   <div class="nexa-widget-desc">Exclusive Gear effect • unlocks/upgrades at Widget Lv 1/3/5/7/9.</div>
   <div class="nexa-widget-buff"><b>${aVal}</b><small>${a?`Effect Lv ${a}/5`:'Unlocks at Widget Lv 1'}</small></div>
  </article>
  <article class="v33-skill">
   <div class="nexa-widget-name"><b>${d[3]}</b><span>EXPEDITION</span></div>
   <div class="nexa-widget-desc">${d[4]} • unlocks/upgrades at Widget Lv 2/4/6/8/10.</div>
   <div class="nexa-widget-buff"><b>${bVal}</b><small>${b?`Effect Lv ${b}/5`:'Unlocks at Widget Lv 2'}</small></div>
  </article>`;
}

/* Troop passive skill restoration. */
const TS={
 infantry:[
  ['T1','Master Brawler','Attack Damage to Lancers +10%',(t,f)=>t>=1],
  ['T7','Bands of Steel','Defense against Lancers +10%',(t,f)=>t>=7],
  ['FC3','Crystal Shield I','25% chance to offset 36% damage',(t,f)=>f>=3],
  ['FC5','Crystal Shield II','37.5% chance to offset 36% damage',(t,f)=>f>=5],
  ['FC8','Body of Light I','Infantry Defense +4% • Crystal Shield active: extra 10% damage reduction',(t,f)=>f>=8],
  ['FC10','Body of Light II','Infantry Defense +6% • Crystal Shield active: extra 15% damage reduction',(t,f)=>f>=10]
 ],
 lancer:[
  ['T1','Charge','Attack Damage to Marksmen +10%',(t,f)=>t>=1],
  ['T7','Ambusher','20% chance to strike Marksmen behind Infantry',(t,f)=>t>=7],
  ['FC3','Crystal Lance I','10% chance to deal double damage',(t,f)=>f>=3],
  ['FC5','Crystal Lance II','15% chance to deal double damage',(t,f)=>f>=5],
  ['FC8','Incandescent Field I','10% chance to take half damage when attacked',(t,f)=>f>=8],
  ['FC10','Incandescent Field II','15% chance to take half damage when attacked',(t,f)=>f>=10]
 ],
 marksman:[
  ['T1','Ranged Strike','Attack Damage to Infantry +10%',(t,f)=>t>=1],
  ['T7','Volley','10% chance for attacks to strike twice',(t,f)=>t>=7],
  ['FC3','Crystal Gunpowder I','20% chance to deal 50% more damage',(t,f)=>f>=3],
  ['FC5','Crystal Gunpowder II','30% chance to deal 50% more damage',(t,f)=>f>=5],
  ['FC8','Flame Charge I','Marksman basic attack +4% • proc adds +25% damage',(t,f)=>f>=8],
  ['FC10','Flame Charge II','Marksman basic attack +6% • proc adds +37.5% damage',(t,f)=>f>=10]
 ]
};
function troopType(){
 const s=(currentHero()+' '+($('#nexa-v33-detail .v33-title small')?.textContent||'')).toLowerCase();
 return s.includes('infantry')?'infantry':s.includes('lancer')?'lancer':s.includes('marksman')?'marksman':'';
}
function troopV432(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const type=troopType();if(!type)return;
 const tier=Number($('[data-v33-troop-tier].active',root)?.dataset.v33TroopTier||1);
 const fc=Number($('[data-v33-troop-fc].active',root)?.dataset.v33TroopFc||0);
 const sec=$$('.v33-section',root).find(x=>/ACTIVE TROOP SUMMARY/i.test($('.v33-kicker span',x)?.textContent||''));
 if(!sec)return;

 let box=$('.nexa-v432-passives',sec);
 if(!box){box=document.createElement('div');box.className='nexa-v432-passives';box.style.cssText='display:grid;gap:7px;margin-top:10px';sec.appendChild(box)}
 const unlocked=TS[type].filter(x=>x[3](tier,fc));
 box.innerHTML=unlocked.map(x=>`
  <div style="display:grid;grid-template-columns:42px 1fr;gap:8px;padding:8px 9px;border:1px solid rgba(88,199,255,.18);border-radius:11px;background:rgba(6,22,43,.42)">
   <span style="font-size:8px;font-weight:950;color:#70e9ff">${x[0]}</span>
   <div><b style="display:block;font-size:10px">${x[1]}</b><small style="display:block;color:#acb7d0;font-size:9px">${x[2]}</small></div>
  </div>`).join('');
 window.NEXA_ACTIVE_TROOP_BUFFS={type,tier,fc,skills:unlocked.map(x=>({name:x[1],effect:x[2]}))};
}

/* Pets: actual names + glowy species silhouette + level value/cooldown. */
const P={
 'Cave Hyena':['Builder’s Aide','hyena',['Construction Speed +5%','Construction Speed +7%','Construction Speed +9%','Construction Speed +12%','Construction Speed +15%'],['23h','23h','23h','23h','23h'],'Skilled hyenas deliver tools to architects, increasing Construction Speed.'],
 'Arctic Wolf':['Arctic Embrace','wolf',['Stamina +35','Stamina +40','Stamina +45','Stamina +50','Stamina +55','Stamina +60'],['23h','23h','23h','23h','23h','23h'],'The wolf restores Stamina when the skill is activated.'],
 'Musk Ox':['Burden Bearer','ox',Array(6).fill('Instantly completes gathering at the next wilderness resource tile'),['35h','31h','27h','23h','19h','15h'],"Harnessing the Musk Ox's strength and endurance instantly completes gathering upon reaching the next wilderness resource tile. Secured Alliance Gathering Nodes are excluded."],
 'Giant Tapir':['Natural Intuition','tapir',['Pet Food +200','Pet Food +250','Pet Food +300','Pet Food +350','Pet Food +400','Pet Food +450','Pet Food +500'],Array(7).fill('23h'),'Natural intuition helps discover extra Pet Food.'],
 'Titan Roc':['Razorbeak','bird',['Enemy HP -1.5%','Enemy HP -2%','Enemy HP -2.5%','Enemy HP -3%','Enemy HP -3.5%','Enemy HP -4%','Enemy HP -5%'],Array(7).fill('20h'),'Razorbeak weakens enemy troop Health.'],
 'Giant Elk':['Mystical Finding','elk',Array(8).fill('Unearths an item lost on the Tundra'),['51h','47h','43h','39h','35h','31h','27h','23h'],'Guided by mystical intuition, the Giant Elk unearths an item lost on the Tundra.'],
 'Snow Leopard':['Lightning Raid','cat',['March Speed +15% • Enemy Lethality -1.5%','March Speed +17% • Enemy Lethality -2%','March Speed +19% • Enemy Lethality -2.5%','March Speed +21% • Enemy Lethality -3%','March Speed +23% • Enemy Lethality -3.5%','March Speed +25% • Enemy Lethality -4%','March Speed +27% • Enemy Lethality -4.5%','March Speed +30% • Enemy Lethality -5%'],Array(8).fill('20h'),'A rapid assault boosts March Speed while lowering enemy Lethality.'],
 'Cave Lion':['Feral Anthem','lion',['Troop Attack +2.5%','Troop Attack +3%','Troop Attack +3.5%','Troop Attack +4%','Troop Attack +5%','Troop Attack +6%','Troop Attack +7%','Troop Attack +8%','Troop Attack +9%','Troop Attack +10%'],null,'A battle anthem increases Troop Attack.'],
 'Snow Ape':['Tumbling Power','ape',['Squad Capacity +1,500','Squad Capacity +3,000','Squad Capacity +4,500','Squad Capacity +6,000','Squad Capacity +7,500','Squad Capacity +9,000','Squad Capacity +10,500','Squad Capacity +12,000','Squad Capacity +13,500','Squad Capacity +15,000'],null,'Tumbling Power increases Squad Capacity.'],
 'Iron Rhino':['Rallying Beasts','rhino',['Rally Capacity +60,000','Rally Capacity +70,000','Rally Capacity +80,000','Rally Capacity +90,000','Rally Capacity +100,000','Rally Capacity +110,000','Rally Capacity +120,000','Rally Capacity +130,000','Rally Capacity +140,000','Rally Capacity +150,000'],null,'Rallying Beasts increases Rally Capacity.'],
 'Saber-tooth Tiger':['Apex Assault','cat',['Troop Lethality +2.5%','Troop Lethality +3%','Troop Lethality +3.5%','Troop Lethality +4%','Troop Lethality +5%','Troop Lethality +6%','Troop Lethality +7%','Troop Lethality +8%','Troop Lethality +9%','Troop Lethality +10%'],null,'Apex Assault increases Troop Lethality.'],
 'Mammoth':['Hardened Skin','mammoth',['Troop Defense +2.5%','Troop Defense +3%','Troop Defense +3.5%','Troop Defense +4%','Troop Defense +5%','Troop Defense +6%','Troop Defense +7%','Troop Defense +8%','Troop Defense +9%','Troop Defense +10%'],null,'Hardened Skin increases Troop Defense.'],
 'Frost Gorilla':['Earthbound Vigor','gorilla',['Troop Health +2.5%','Troop Health +3%','Troop Health +3.5%','Troop Health +4%','Troop Health +5%','Troop Health +6%','Troop Health +7%','Troop Health +8%','Troop Health +9%','Troop Health +10%'],null,'Earthbound Vigor increases Troop Health.'],
 'Frostscale Chameleon':['Icy Shroud','lizard',['Enemy Defense -2.5%','Enemy Defense -3%','Enemy Defense -3.5%','Enemy Defense -4%','Enemy Defense -5%','Enemy Defense -6%','Enemy Defense -7%','Enemy Defense -8%','Enemy Defense -9%','Enemy Defense -10%'],null,'Icy Shroud lowers Enemy Defense.']
};
const PET_GLOW={
 'Cave Hyena':['#67dfff','#17384a'],'Arctic Wolf':['#8be8ff','#1b3c65'],'Musk Ox':['#d0a46b','#51351f'],
 'Giant Tapir':['#b59b7c','#3f3227'],'Titan Roc':['#c3a4ff','#32265b'],'Snow Leopard':['#aeeeff','#24446f'],
 'Giant Elk':['#7bd9c7','#21473f'],'Cave Lion':['#ffb24e','#5d3416'],'Snow Ape':['#f2fbff','#486175'],
 'Iron Rhino':['#aeb7c2','#3d444c'],'Saber-tooth Tiger':['#ff8438','#612910'],'Mammoth':['#d7bd93','#533f2d'],
 'Frost Gorilla':['#508bff','#192c63'],'Frostscale Chameleon':['#5de9c0','#174f45']
};
function animalSVG(kind){
 const glyphs={
  hyena:'🐕',wolf:'🐺',ox:'🐂',tapir:'🐗',bird:'🦅',elk:'🦌',
  cat:'🐆',lion:'🦁',ape:'🦍',gorilla:'🦍',rhino:'🦏',mammoth:'🐘',lizard:'🦎'
 };
 const g=glyphs[kind]||'🐾';
 return `<span aria-hidden="true" class="nexa-v434-animal-glyph">${g}</span>`;
}
function petV432(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const petName=currentHero(),p=P[petName];if(!p)return;
 const sec=$$('.v33-section',root).find(x=>/PET SKILL/i.test($('.v33-kicker span',x)?.textContent||''));
 if(!sec)return;
 const old=$('[data-v33-pet-skill]',sec);
 const lv=clamp(Number(old?.value||0),0,p[2].length);
 const glow=PET_GLOW[petName]||['#74ecff','#173d54'];
 sec.innerHTML=`
  <div class="v33-kicker"><span>PET SKILL</span><strong>LEVEL ${lv}</strong></div>
  <div class="nexa-v432-pet" style="padding:10px;border:1px solid color-mix(in srgb,${glow[0]} 35%,transparent);border-radius:16px;background:rgba(4,21,42,.46)">
   <div class="nexa-v432-pet-head" style="display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;cursor:pointer">
    <span class="nexa-v434-pet-orb" style="--pet:${glow[0]};--petbg:${glow[1]}">${animalSVG(p[1])}</span>
    <div><b>${p[0]}</b><small style="display:block;color:${glow[0]};margin-top:3px">TAP FOR SKILL DETAILS</small></div>
   </div>
   <p class="nexa-v432-pet-desc" style="display:none;color:#c5cde2;font-size:10px">${p[4]}</p>
   <select class="v33-select" style="margin-top:9px" data-v33-pet-skill>
    ${Array.from({length:p[2].length+1},(_,i)=>`<option value="${i}" ${i===lv?'selected':''}>${i}</option>`).join('')}
   </select>
   <div class="v33-result" style="margin-top:8px">${lv?p[2][lv-1]:'Not active'}</div>
   ${lv&&p[3]?.[lv-1]?`<div style="margin-top:6px;font-size:9px;color:#aeb8d3">Cooldown: ${p[3][lv-1]}</div>`:''}
  </div>`;
 const head=$('.nexa-v432-pet-head',sec),desc=$('.nexa-v432-pet-desc',sec);
 head?.addEventListener('click',()=>desc.style.display=desc.style.display==='block'?'none':'block');
}

/* Charms use the user's flat ROOT naming:
   lv01-infantry.png / lv01-lancer.png / lv01-marksman.png ... lv18 */
function charmType(s=''){s=String(s).toLowerCase();return s.includes('infantry')?'infantry':s.includes('lancer')?'lancer':s.includes('marksman')?'marksman':''}
function charmPath(type,lv){return lv?`/lv${pad(lv)}-${type}.png`:''}
function charmsV432(root=document){
 $$('img',root).forEach(img=>{
  const src=img.getAttribute('src')||'',alt=img.alt||'';
  if(!/charm/i.test(alt)&&!/assets\/charms/i.test(src)&&!/lv\d{1,2}-(infantry|lancer|marksman)/i.test(src))return;
  const type=charmType(alt)||charmType(src);
  const m=alt.match(/Lv\s*(\d+)/i)||src.match(/lv[-_]?(\d+)/i);
  const lv=Number(m?.[1]||0);if(!type||!lv)return;
  img.src=charmPath(type,lv);
  img.style.background='transparent';
  img.style.opacity='1';
 });
 const detail=$('#nexa-v33-detail');
 if(!detail||!/charms/i.test(currentHero()))return;
 const type=charmType($('.v33-kicker strong',detail)?.textContent||'');
 $$('.v33-charm-row',detail).forEach(row=>{
  const sel=$('[data-v33-charm-level]',row);if(!sel)return;
  const lv=Number(sel.value||0);let img=$('.v33-charm-img',row);
  if(lv&&type){
   if(!img){img=document.createElement('img');img.className='v33-charm-img';$('.v33-charm-body',row)?.prepend(img)}
   img.src=charmPath(type,lv);img.alt=`${type} Charm Lv ${lv}`;img.style.visibility='visible';
  }else img?.remove();
 });
}

/* Ministry Appointments: readable action pill with self-contained calendar glyph. */
function ministryV432(){
 const b=$('#nexa-v425-ministry');if(!b)return;
 b.classList.add('nexa-v434-ministry-pill');
 b.innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <rect x="4.5" y="5.5" width="15" height="14" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <path d="M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z" fill="currentColor"/>
 </svg><span>MINISTRY APPOINTMENTS</span>`;
 b.setAttribute('aria-label','Ministry Appointments');
 b.title='Ministry Appointments';
}

/* Main-account / Alliance line overflow fix. */
function profileFitV432(){
 const p=$('#nexa-profile-modal');if(!p)return;
 $$('.nexa-profile-sub,.nexa-profile-identity,.nexa-profile-main,.nexa-profile-hero',p).forEach(x=>{x.style.minWidth='0';x.style.maxWidth='100%'});
 $$('span,small,p,div',p).filter(x=>x.children.length===0).forEach(x=>{
   const t=(x.textContent||'').trim();
   if(/^this is your main account\.?$/i.test(t)){
     x.textContent='★ MAIN ACCOUNT';
     x.classList.add('nexa-v434-main-chip');
   }
 });
 $$('.nexa-glass-tag,[class*="main-account"],[class*="main-note"]',p).forEach(x=>{
  x.style.maxWidth='100%';x.style.minWidth='0';x.style.whiteSpace='normal';x.style.overflowWrap='anywhere';x.style.boxSizing='border-box';
 });
}

/* Last Signal: one deterministic quote per UTC date + automatic 00:00 UTC rollover. */
const Q=[
 'Small moves become strong systems.','Plan clearly. Move together.','Every reset is a fresh signal.',
 'Good coordination beats last-minute chaos.','Build the system once. Let it work for everyone.',
 'Today’s clean setup is tomorrow’s easy win.','Strong teams share the same signal.',
 'Clear timing makes strong teams stronger.','One reset. One signal. One direction.','Consistency wins the long game.'
];
function qIndex(){return ((Math.floor(Date.now()/86400000)%Q.length)+Q.length)%Q.length}
function signalV432(){
 const key=new Date().toISOString().slice(0,10),msg=Q[qIndex()];
 $$('h1,h2,h3,h4,b,strong,span').forEach(h=>{
  if((h.textContent||'').trim().toLowerCase()!=='the last signal')return;
  const wrap=h.closest('section,article,.glass,.card,div');if(!wrap)return;
  const p=$('p',wrap)||$$('div',wrap).find(x=>x!==h&&x.children.length===0&&x.textContent.trim());
  if(p&&!/the last signal/i.test(p.textContent||'')){p.textContent=msg;p.dataset.nexaSignalDate=key}
 });
 localStorage.setItem('nexa_last_signal_date',key);
}
function nextSignal(){const now=new Date(),next=new Date(now);next.setUTCHours(24,0,2,0);setTimeout(()=>{signalV432();nextSignal()},Math.max(1000,next-now))}


function cleanLockedLabels(root=document){
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').trim();
    if(/^Locked$/i.test(t)){
      const p=el.parentElement;
      if(p && /Unlocks at Widget Lv/i.test(p.textContent||'')) el.remove();
    }
  });
}

function detailRoot(){return $('#nexa-v33-detail')||$('#nexa-v30-detail')||$('#nexa-profile-modal')}

function skillGlyphSVG(kind){
 const icons={
  attack:'<svg viewBox="0 0 24 24"><path d="M5 19 19 5M13 5h6v6M5 13v6h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  defense:'<svg viewBox="0 0 24 24"><path d="M12 3 19 7v5c0 4.2-2.7 7.1-7 9-4.3-1.9-7-4.8-7-9V7z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  speed:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 12 17 9M7 6l-2-2M17 6l2-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  heal:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.2-7-9.2C5 7.6 7 6 9.4 6c1.4 0 2.3.7 2.6 1.3.3-.6 1.2-1.3 2.6-1.3C17 6 19 7.6 19 10.8 19 15.8 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.6"/></svg>',
  build:'<svg viewBox="0 0 24 24"><path d="M5 19h14M7 19V9h10v10M9 9V6h6v3M10 13h4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  resource:'<svg viewBox="0 0 24 24"><path d="M12 3c4 3.1 6 6 6 9.1A6 6 0 1 1 6 12c0-3.1 2-6 6-9z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 14c1.2 1 4.8 1 6 0" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  generic:'<svg viewBox="0 0 24 24"><path d="m12 3 2.3 5 5.4.6-4 3.7 1.1 5.4L12 15l-4.8 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
 };
 return icons[kind]||icons.generic;
}
function classifySkill(name=''){
 const s=name.toLowerCase();
 if(/attack|lethality|damage|assault|strike|offense|rally/.test(s))return 'attack';
 if(/defen|health|shield|protect|guard|fort/.test(s))return 'defense';
 if(/speed|march|quick|rapid|swift/.test(s))return 'speed';
 if(/heal|recover|restore|stamina/.test(s))return 'heal';
 if(/build|construct|research|train/.test(s))return 'build';
 if(/resource|gather|food|wood|coal|iron/.test(s))return 'resource';
 return 'generic';
}
function expertGlyphsV435(){
 const root=detailRoot();if(!root)return;
 const isExpert=/expert/i.test(
   $('.nexa-v30-tab.active')?.textContent||$('.v33-cat.active')?.textContent||''
 );
 if(!isExpert)return;
 let cards=$$('.v33-skill,.nexa-v30-skill,[class*="skill-card"],[class*="expert-skill"]',root);
 if(!cards.length){
   cards=$$('article,section,div',root).filter(x=>{
     const tx=(x.textContent||'').trim();
     return tx.length>3&&tx.length<500&&/skill/i.test(tx)&&$('select,input,.v33-levels,.nexa-v30-chips',x);
   }).slice(0,12);
 }
 cards.forEach((card,n)=>{
   if(card.dataset.nexaV435Expert==='1')return;
   const title=$('h4,h5,b,strong,[class*="skill-name"]',card)?.textContent?.trim()||`Expert Skill ${n+1}`;
   const kind=classifySkill(title);
   let icon=$('.v33-skill-icon,.nexa-v30-skill-icon,[class*="skill-icon"]',card);
   if(!icon){
     icon=document.createElement('span');
     icon.className='nexa-v435-expert-icon';
     const first=$('h4,h5,b,strong,[class*="skill-name"]',card);
     first?.parentElement?.insertBefore(icon,first);
   }
   if(icon){
     icon.classList.add('nexa-v435-expert-icon');
     icon.style.setProperty('--skill-glow',COLORS[(n*2+1)%COLORS.length]||'#73e8ff');
     icon.innerHTML=skillGlyphSVG(kind);
   }
   card.dataset.nexaV435Expert='1';
 });
}

function petNameV435(){
 return (
   $('#nexa-v30-detail .nexa-v30-detail-head h4')?.textContent||
   $('#nexa-v33-detail .v33-title h3')?.textContent||
   ''
 ).trim();
}
function existingPetSkillControl(root){
 const direct=$('[data-v33-pet-skill],[data-v30-pet-skill],[name="pet_skill"],[data-field="pet_skill"]',root);
 if(direct)return direct;
 return $$('select,input',root).find(el=>{
   const wrap=el.closest('.nexa-v30-field,.v33-section,label,div');
   return /skill level|pet skill/i.test(wrap?.textContent||'');
 });
}
function petPanelV435(){
 const root=$('#nexa-v30-detail')||$('#nexa-v33-detail');if(!root)return;
 const name=petNameV435(),p=P[name];if(!p)return;
 const glow=PET_GLOW[name]||['#74ecff','#173d54'];
 const native=existingPetSkillControl(root);
 let lv=clamp(Number(native?.value||0),0,p[2].length);
 let panel=$('#nexa-v435-pet-panel',root);
 if(!panel){
   panel=document.createElement('section');panel.id='nexa-v435-pet-panel';
   const anchor=$('.nexa-v30-actions,.v33-actions',root);
   anchor?.parentElement?.insertBefore(panel,anchor);
   if(!panel.isConnected)root.appendChild(panel);
 }
 panel.style.setProperty('--pet',glow[0]);panel.style.setProperty('--petbg',glow[1]);
 panel.innerHTML=`
   <div class="nexa-v435-pet-head" role="button" tabindex="0">
     <span class="nexa-v435-pet-orb">${animalSVG(p[1])}</span>
     <div><b>${p[0]}</b><small>TAP TO VIEW PET SKILL</small></div>
   </div>
   <div class="nexa-v435-pet-desc" hidden>${p[4]}</div>
   <label class="nexa-v435-pet-label">PET SKILL LEVEL
     <select class="nexa-v435-pet-select" data-nexa-v435-pet-skill>
       ${Array.from({length:p[2].length+1},(_,i)=>`<option value="${i}" ${i===lv?'selected':''}>${i}</option>`).join('')}
     </select>
   </label>
   <div class="nexa-v435-pet-buff">
      <small>PET BUFF</small>
      <strong>${lv?p[2][lv-1]:'Not active'}</strong>
      ${lv&&p[3]?.[lv-1]?`<span>Cooldown: ${p[3][lv-1]}</span>`:''}
   </div>`;
 const head=$('.nexa-v435-pet-head',panel),desc=$('.nexa-v435-pet-desc',panel);
 const toggle=()=>{desc.hidden=!desc.hidden};
 head.onclick=toggle;head.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
 const sel=$('[data-nexa-v435-pet-skill]',panel);
 sel.onchange=()=>{
   const v=Number(sel.value||0);
   if(native){
     native.value=String(v);
     native.dispatchEvent(new Event('change',{bubbles:true}));
     native.dispatchEvent(new Event('input',{bubbles:true}));
   }
   petPanelV435();
 };
 // Hide only the old pet-skill editor; keep all other native fields and save buttons.
 if(native){
   const wrap=native.closest('.nexa-v30-field,.v33-section,label');
   if(wrap && !wrap.contains(panel))wrap.style.display='none';
 }
}

function charmPieceType(text=''){
 const s=text.toLowerCase();
 if(/coat|pants/.test(s))return'infantry';
 if(/helmet|watch/.test(s))return'lancer';
 if(/ring|shortstaff|short staff|belt/.test(s))return'marksman';
 return charmType(s);
}
function repairLinkedCharmsV435(root=document){
 const zones=$$('#nexa-v446-charms,[class*="charm"]',root);
 zones.forEach(zone=>{
   const pieceText=(zone.closest('section,article,div')?.textContent||zone.textContent||'');
   const type=charmPieceType(pieceText);
   $$('select',zone).forEach(sel=>{
     const lv=Number(sel.value||0);if(!lv||!type)return;
     const row=sel.closest('[class*="charm"],.nexa-v30-field,section,article,div');
     if(!row)return;
     let img=$('img',row);
     if(!img){
       const ph=$$('div,span',row).find(x=>/^\s*[?◇]\s*$/.test(x.textContent||''));
       if(ph){
         img=document.createElement('img');img.className='nexa-v435-charm-img';
         ph.replaceWith(img);
       }
     }
     if(img){
       img.src=charmPath(type,lv);img.alt=`${type} Charm Lv ${lv}`;
       img.style.opacity='1';img.style.visibility='visible';img.style.background='transparent';
     }
   });
 });
 charmsV432(root);
}

function ministryV435(){
 const buttons=$$('#nexa-v425-ministry,.nexa-v425-ministry');
 buttons.forEach(b=>{
   b.classList.add('nexa-v435-ministry-pill');
   b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4.5" y="5.5" width="15" height="14" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z" fill="currentColor"/>
   </svg><span>MINISTRY APPOINTMENTS</span>`;
   b.setAttribute('aria-label','Ministry Appointments');
   b.title='Ministry Appointments';
 });
}

function profileIdentityV435(){
 const p=$('#nexa-profile-modal');if(!p)return;
 $$('*',p).forEach(x=>{
   if(x.children.length)return;
   const t=(x.textContent||'').trim();
   if(/^this is your main account\.?$/i.test(t)||/^★\s*MAIN ACCOUNT$/i.test(t)){
     x.textContent='★ MAIN ACCOUNT';x.classList.add('nexa-v435-main-chip');
   }
 });
 // Improve Alliance editor wording without changing its native save behavior.
 $$('label,.nexa-v30-field,div',p).forEach(w=>{
   if(w.dataset.nexaV435Alliance==='1')return;
   const sel=$('select',w);if(!sel)return;
   const txt=(w.textContent||'').trim();
   if(!/^alliance\b/i.test(txt)&&!/alliance/i.test(txt))return;
   const lab=$('span,label,b,strong',w);
   if(lab&&/alliance/i.test(lab.textContent||''))lab.textContent='CURRENT ALLIANCE';
   const hint=document.createElement('small');hint.className='nexa-v435-alliance-hint';hint.textContent='Change Alliance';
   sel.before(hint);w.dataset.nexaV435Alliance='1';
 });
}

function findRolesHost(){
 const direct=$('#admin-roles')||$('#admin-manage-access')||$('[data-admin-panel="roles"]')||$('[data-admin-content="roles"]');
 if(direct)return direct;
 const candidates=$$('#admin-modal section,#admin-modal article,#admin-modal div').filter(el=>{
   if(getComputedStyle(el).display==='none')return false;
   const t=(el.textContent||'').replace(/\s+/g,' ').trim();
   return /roles/i.test(t)&&/manage access|permissions|operational/i.test(t)&&t.length<5000;
 });
 return candidates.sort((a,b)=>a.textContent.length-b.textContent.length)[0]||$('#admin-modal .admin-modal-card');
}

/* Owner working roles + module badges. Multiple operational roles are supported. */
const RL={battle_strategist:'Battle Strategist',event_operator:'Event Operator',scheduler:'Scheduler',transfer_coordinator:'Transfer Coordinator'};
const MODS={svs_access:'SVS',transfer_access:'Transfers',sbs_access:'SBS',team_builder_access:'Team Builder',forms_access:'Forms',events_access:'Events',library_access:'Library',administration_access:'Administration'};
function sb(){return window.supabaseClient||window.sb||null}
function roleChip(v,label,type='role'){
 return `<span class="nexa-v434-role-chip" data-chip-${type}="${v}"><span>${label}</span><button type="button" aria-label="Remove ${label}" data-remove-${type}="${v}">×</button></span>`;
}
async function rolePanelV432(){
 const host=findRolesHost();if(!host)return;
 const c=sb();if(!c)return;
 let user=null;try{user=(await c.auth.getUser()).data?.user}catch{}if(!user)return;

 let roles=[],access={};
 try{roles=((await c.from('nexa_operational_roles').select('role').eq('user_id',user.id)).data||[]).map(x=>x.role)}catch{}
 try{access=(await c.from('staff_module_access').select('*').eq('user_id',user.id).maybeSingle()).data||{}}catch{}

 let d=$('#nexa-v432-role-panel');
 if(!d){d=document.createElement('div');d.id='nexa-v432-role-panel';host.appendChild(d)}else if(d.parentElement!==host){host.appendChild(d)}
 d.className='nexa-v434-role-panel';
 d.innerHTML=`
 <div class="nexa-v434-panel-title"><b>MY OPERATIONAL ROLES</b><small>Owner permissions stay protected. Add every working role you want shown on your profile.</small></div>
 <div id="nexa-v434-role-chips" class="nexa-v434-chip-wrap">${roles.map(v=>roleChip(v,RL[v]||v)).join('')||'<span class="muted">No operational roles added yet.</span>'}</div>
 <div class="nexa-v434-add-row">
   <select id="nexa-v434-role-select"><option value="">Choose operational role…</option>${Object.entries(RL).filter(([v])=>!roles.includes(v)).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
   <button class="btn" type="button" id="nexa-v434-role-add">ADD</button>
 </div>
 <button type="button" class="nexa-v434-add-another" id="nexa-v434-role-another">＋ Add another operational role</button>

 <div class="nexa-v434-panel-title modules"><b>MY MODULE ACCESS BADGES</b><small>Select the modules you actively work with. Owner access itself is never removed.</small></div>
 <div id="nexa-v434-module-chips" class="nexa-v434-chip-wrap">${Object.entries(MODS).filter(([k])=>access[k]).map(([k,l])=>roleChip(k,l,'module')).join('')||'<span class="muted">No module badges selected yet.</span>'}</div>
 <div class="nexa-v434-add-row">
   <select id="nexa-v434-module-select"><option value="">Choose module…</option>${Object.entries(MODS).filter(([k])=>!access[k]).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select>
   <button class="btn" type="button" id="nexa-v434-module-add">ADD</button>
 </div>
 <button type="button" class="nexa-v434-add-another" id="nexa-v434-module-another">＋ Add another module badge</button>
 <div id="nexa-v432-role-msg" class="form-message"></div>`;

 const msg=$('#nexa-v432-role-msg',d);
 const refresh=()=>{d.remove();rolePanelV432()};

 $('#nexa-v434-role-add',d).onclick=async()=>{
   const wanted=$('#nexa-v434-role-select',d).value;if(!wanted)return;
   msg.textContent='Adding…';
   const q=await c.rpc('nexa_owner_add_my_operational_role',{new_role:wanted});
   if(q.error){msg.textContent=q.error.message||'Could not add role.';return}
   msg.textContent='Role added ✓';refresh();
 };
 $$('[data-remove-role]',d).forEach(btn=>btn.onclick=async()=>{
   msg.textContent='Removing…';
   const q=await c.rpc('nexa_owner_remove_my_operational_role',{old_role:btn.dataset.removeRole});
   if(q.error){msg.textContent=q.error.message||'Could not remove role.';return}
   refresh();
 });

 async function saveModules(next){
   const vals={};Object.keys(MODS).forEach(k=>vals[k]=!!next[k]);
   const q=await c.rpc('nexa_owner_set_my_module_access',{
     new_svs:vals.svs_access,new_transfer:vals.transfer_access,new_sbs:vals.sbs_access,
     new_team_builder:vals.team_builder_access,new_forms:vals.forms_access,new_events:vals.events_access,
     new_library:vals.library_access,new_administration:vals.administration_access
   });
   if(q.error)throw q.error;
 }
 $('#nexa-v434-module-add',d).onclick=async()=>{
   const wanted=$('#nexa-v434-module-select',d).value;if(!wanted)return;
   msg.textContent='Adding…';try{await saveModules({...access,[wanted]:true});refresh()}catch(e){msg.textContent=e?.message||'Could not add module.'}
 };
 $$('[data-remove-module]',d).forEach(btn=>btn.onclick=async()=>{
   msg.textContent='Removing…';try{await saveModules({...access,[btn.dataset.removeModule]:false});refresh()}catch(e){msg.textContent=e?.message||'Could not remove module.'}
 });
 $('#nexa-v434-role-another',d).onclick=()=>$('#nexa-v434-role-select',d)?.focus();
 $('#nexa-v434-module-another',d).onclick=()=>$('#nexa-v434-module-select',d)?.focus();
}


function svgBear(){
 return `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="currentColor"/><circle cx="23" cy="9" r="4" fill="currentColor"/><path d="M7.5 17c0-6 3.8-10 8.5-10s8.5 4 8.5 10-3.8 9-8.5 9-8.5-3-8.5-9z" fill="currentColor"/><ellipse cx="16" cy="20" rx="4.5" ry="3.5" fill="#071327"/><circle cx="13" cy="15" r="1.2" fill="#071327"/><circle cx="19" cy="15" r="1.2" fill="#071327"/><circle cx="16" cy="19" r="1.2" fill="currentColor"/></svg>`;
}
function svgSword(){
 return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M22.8 4.5 27 3l-1.5 4.2-11 11-2.7-2.7 11-11z" fill="currentColor"/><path d="m9.8 15.7 6.5 6.5-2.2 2.2-6.5-6.5zM7 22l3 3-3.8 3.8-3-3z" fill="currentColor"/></svg>`;
}
function heroSpecialV434(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const name=currentHero(),box=$('.v33-special',root),icon=$('.v33-special-icon',box);
 if(!icon)return;
 if(/natalia/i.test(name)){icon.innerHTML=svgBear();icon.classList.add('nexa-v434-polar')}
 if(/jeronimo/i.test(name)){icon.innerHTML=svgSword();icon.classList.add('nexa-v434-sword')}
}
const EXPERT_GLYPHS=[
 `<svg viewBox="0 0 24 24"><path d="M12 3 19 7v5c0 4.4-2.8 7.2-7 9-4.2-1.8-7-4.6-7-9V7z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m9 12 2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
 `<svg viewBox="0 0 24 24"><path d="M4 17 17 4l3 3L7 20z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m13 8 3 3M5 15l4 4" stroke="currentColor" stroke-width="1.7"/></svg>`,
 `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 5v7l4 2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
 `<svg viewBox="0 0 24 24"><path d="M5 18h14M7 18V9h10v9M9 9V6h6v3M10 13h4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
 `<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="1.6"/></svg>`
];
function expertGlyphsV434(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const sec=$$('.v33-section',root).find(x=>/EXPERT SKILLS/i.test($('.v33-kicker span',x)?.textContent||''));if(!sec)return;
 $$('.v33-skill',sec).forEach((card,n)=>{
   const icon=$('.v33-skill-icon',card);if(!icon)return;
   icon.classList.add('nexa-v434-expert-glyph');icon.style.setProperty('--skill-glow',COLORS[(n+2)%COLORS.length]||'#73e8ff');
   icon.innerHTML=EXPERT_GLYPHS[n%EXPERT_GLYPHS.length];
 });
}

/* Troop image visual only: remove the gray panel. We intentionally do NOT replace
   the actual troop artwork in this TXT because the user is resending the final images. */
function troopVisualV432(){
 $$('.v33-item[data-type="troop"] .v33-planet,.v33-mini.troop').forEach(x=>x.style.background='transparent');
 $$('.v33-item[data-type="troop"] img,.v33-mini.troop img').forEach(x=>{
  x.style.background='transparent';x.style.objectFit='contain';x.style.objectPosition='center';x.style.transform='scale(.90)';
 });
}


function addV433CSS(){
 if($('#nexa-v433-css'))return;
 const st=document.createElement('style');st.id='nexa-v433-css';
 st.textContent=`
 #nexa-v33-detail.nexa-v433-switching #v33-detail-body{visibility:hidden!important}
 #nexa-v425-ministry{
   font-size:0!important;
   background-color:#08182b!important;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='4.5' y='5.5' width='15' height='14' rx='2.4' fill='none' stroke='%235be7ff' stroke-width='1.8'/%3E%3Cpath d='M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4' fill='none' stroke='%235be7ff' stroke-width='1.8' stroke-linecap='round'/%3E%3Cpath d='M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z' fill='%235be7ff'/%3E%3C/svg%3E")!important;
   background-repeat:no-repeat!important;background-position:center!important;background-size:21px!important
 }
 #nexa-v425-ministry>*{display:none!important}
 #nexa-profile-modal .nexa-profile-identity,
 #nexa-profile-modal .nexa-profile-main,
 #nexa-profile-modal .nexa-profile-sub{
   min-width:0!important;max-width:100%!important;overflow:hidden!important
 }
 #nexa-profile-modal .nexa-profile-identity *,
 #nexa-profile-modal .nexa-profile-main *,
 #nexa-profile-modal .nexa-profile-sub *{
   min-width:0!important;max-width:100%!important;box-sizing:border-box!important
 }
 #nexa-profile-modal [class*="alliance"],
 #nexa-profile-modal [class*="main-account"],
 #nexa-profile-modal [class*="main-note"]{
   white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important
 }
 .nexa-v434-ministry-pill{
   width:auto!important;min-width:170px!important;height:38px!important;min-height:38px!important;
   border-radius:999px!important;padding:0 13px!important;display:inline-flex!important;align-items:center!important;
   justify-content:center!important;gap:8px!important;font-size:8.5px!important;font-weight:950!important;
   letter-spacing:.10em!important;color:#66e8ff!important;border:1px solid rgba(78,225,255,.62)!important;
   background:linear-gradient(135deg,rgba(6,38,64,.95),rgba(10,16,42,.95))!important;
   box-shadow:0 0 15px rgba(62,220,255,.22)!important
 }
 .nexa-v434-ministry-pill>*{display:block!important}
 .nexa-v434-ministry-pill svg{width:18px!important;height:18px!important;flex:0 0 18px!important}
 .nexa-v434-main-chip{
   display:inline-flex!important;width:max-content!important;max-width:100%!important;padding:5px 9px!important;
   border-radius:999px!important;border:1px solid rgba(255,211,96,.32)!important;background:rgba(70,50,13,.22)!important;
   color:#ffd878!important;font-size:8px!important;font-weight:950!important;letter-spacing:.08em!important;white-space:nowrap!important
 }
 .nexa-v434-pet-orb{
   width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:var(--pet);
   border:1px solid color-mix(in srgb,var(--pet) 72%,white 10%);background:radial-gradient(circle,var(--petbg),#071327 72%);
   box-shadow:0 0 12px color-mix(in srgb,var(--pet) 60%,transparent),0 0 30px color-mix(in srgb,var(--pet) 25%,transparent)
 }
 .nexa-v434-animal-glyph{font-size:27px;line-height:1;filter:drop-shadow(0 0 5px var(--pet))}
 .nexa-v434-polar svg,.nexa-v434-sword svg,.nexa-v434-expert-glyph svg{width:26px!important;height:26px!important;display:block}
 .nexa-v434-polar{color:#dffaff!important;box-shadow:0 0 12px rgba(177,239,255,.5)!important}
 .nexa-v434-sword{color:#ffc96b!important;box-shadow:0 0 12px rgba(255,185,72,.42)!important}
 .nexa-v434-expert-glyph{color:var(--skill-glow)!important;border-color:color-mix(in srgb,var(--skill-glow) 70%,white 10%)!important;
   box-shadow:0 0 12px color-mix(in srgb,var(--skill-glow) 50%,transparent)!important}
 .nexa-v434-role-panel{margin:12px 0;padding:14px;border:1px solid rgba(94,222,255,.28);border-radius:18px;background:rgba(7,20,45,.86)}
 .nexa-v434-panel-title{display:grid;gap:4px}.nexa-v434-panel-title.modules{margin-top:18px}
 .nexa-v434-panel-title small{color:#8f9ab8;font-size:10px;line-height:1.4}
 .nexa-v434-chip-wrap{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}
 .nexa-v434-role-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 7px 6px 10px;border-radius:999px;
   border:1px solid rgba(113,225,255,.32);background:rgba(26,76,101,.24);color:#dff9ff;font-size:9px;font-weight:850}
 .nexa-v434-role-chip button{width:21px;height:21px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;padding:0}
 .nexa-v434-add-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
 .nexa-v434-add-row select{width:100%;min-width:0;padding:10px;border-radius:11px;background:#091329;color:#fff;border:1px solid rgba(255,255,255,.14)}
 .nexa-v434-add-another{margin-top:8px;border:0;background:transparent;color:#6fe6ff;font-size:9px;font-weight:900;padding:4px 0}
 `;
 st.textContent += `

 .nexa-v435-expert-icon{
   width:34px;height:34px;border-radius:50%;display:inline-grid;place-items:center;
   color:var(--skill-glow);border:1px solid color-mix(in srgb,var(--skill-glow) 70%,white 10%);
   background:color-mix(in srgb,var(--skill-glow) 10%,#071327);
   box-shadow:0 0 12px color-mix(in srgb,var(--skill-glow) 52%,transparent),0 0 24px color-mix(in srgb,var(--skill-glow) 20%,transparent);
   margin-right:7px;vertical-align:middle
 }
 .nexa-v435-expert-icon svg{width:21px;height:21px}
 #nexa-v435-pet-panel{
   margin:10px 0;padding:12px;border:1px solid color-mix(in srgb,var(--pet) 38%,transparent);
   border-radius:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--petbg) 40%,#091027),#071020)
 }
 .nexa-v435-pet-head{display:grid;grid-template-columns:50px minmax(0,1fr);gap:10px;align-items:center;cursor:pointer}
 .nexa-v435-pet-head small{display:block;margin-top:3px;color:var(--pet);font-size:8px;font-weight:950;letter-spacing:.08em}
 .nexa-v435-pet-orb{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:var(--pet);
   border:1px solid color-mix(in srgb,var(--pet) 72%,white 10%);
   background:radial-gradient(circle,var(--petbg),#071327 72%);
   box-shadow:0 0 12px color-mix(in srgb,var(--pet) 60%,transparent),0 0 30px color-mix(in srgb,var(--pet) 25%,transparent)}
 .nexa-v435-pet-desc{margin:9px 0 0;color:#c5cde2;font-size:10px;line-height:1.45}
 .nexa-v435-pet-label{display:grid;gap:5px;margin-top:10px;color:#8e9abb;font-size:8px;font-weight:950;letter-spacing:.09em}
 .nexa-v435-pet-select{width:100%;padding:9px;border-radius:10px;background:#071027;color:#fff;border:1px solid rgba(113,130,190,.25)}
 .nexa-v435-pet-buff{display:grid;gap:3px;margin-top:9px;padding:9px 10px;border-radius:11px;
   border:1px solid color-mix(in srgb,var(--pet) 33%,transparent);background:color-mix(in srgb,var(--pet) 8%,#081129)}
 .nexa-v435-pet-buff small{color:#8e9abb;font-size:8px;font-weight:950;letter-spacing:.12em}
 .nexa-v435-pet-buff strong{color:var(--pet);font-size:12px}
 .nexa-v435-pet-buff span{color:#aeb8d3;font-size:9px}
 .nexa-v435-ministry-pill{
   width:auto!important;min-width:176px!important;height:40px!important;min-height:40px!important;
   border-radius:999px!important;padding:0 14px!important;display:inline-flex!important;align-items:center!important;
   justify-content:center!important;gap:8px!important;font-size:8.5px!important;font-weight:950!important;letter-spacing:.08em!important;
   color:#66e8ff!important;border:1px solid rgba(78,225,255,.62)!important;
   background:linear-gradient(135deg,rgba(6,38,64,.95),rgba(10,16,42,.95))!important;
   box-shadow:0 0 15px rgba(62,220,255,.22)!important
 }
 .nexa-v435-ministry-pill svg{width:18px!important;height:18px!important;display:block!important}
 .nexa-v435-main-chip{
   display:inline-flex!important;align-items:center!important;width:max-content!important;max-width:100%!important;
   padding:5px 9px!important;border-radius:999px!important;border:1px solid rgba(255,211,96,.32)!important;
   background:rgba(70,50,13,.22)!important;color:#ffd878!important;font-size:8px!important;font-weight:950!important;
   letter-spacing:.08em!important;white-space:nowrap!important
 }
 .nexa-v435-alliance-hint{display:block;margin:3px 0 5px;color:#71e6ff;font-size:8px;font-weight:900;letter-spacing:.06em}
 .nexa-v435-charm-img{width:76px;height:76px;object-fit:contain;display:block;background:transparent}

 `;
 document.head.appendChild(st);
}
function beginV433Switch(){const r=$('#nexa-v33-detail');if(r)r.classList.add('nexa-v433-switching')}
function endV433Switch(){const r=$('#nexa-v33-detail');if(r)r.classList.remove('nexa-v433-switching')}
function repairAfterSave(){
 [90,220,450,800,1200].forEach(ms=>setTimeout(()=>{charmsV432();ministryV432();profileFitV432();endV433Switch()},ms));
}
function cleanPublicAuthMenu(){
 const auth=$('.nexa-auth-shell,.auth-shell,#auth-screen,#auth-view');
 if(!auth)return;
 const visible=getComputedStyle(auth).display!=='none' && auth.getBoundingClientRect().height>0;
 if(!visible)return;
 $$('button,a').forEach(el=>{
   const t=(el.textContent||'').trim().toLowerCase();
   if(t==='menu'||t==='my alliance')el.style.display='none';
 });
}

function allV432(){
 addV433CSS();widgetV432();heroSpecialV434();expertGlyphsV434();expertGlyphsV435();troopV432();petV432();petPanelV435();charmsV432();repairLinkedCharmsV435();ministryV432();ministryV435();
 profileFitV432();profileIdentityV435();cleanLockedLabels();signalV432();rolePanelV432();troopVisualV432();cleanPublicAuthMenu();
}
function deferV432(){requestAnimationFrame(()=>requestAnimationFrame(()=>{allV432();endV433Switch()}));setTimeout(()=>{allV432();endV433Switch()},80);setTimeout(()=>{allV432();endV433Switch()},260)}

document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v33-widget],[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],[data-v33-troop-skill],[data-v33-charm-sub],.nexa-v30-chip,.nexa-v30-card,.nexa-v30-tab,.nexa-v30-gen'))beginV433Switch();
 if(e.target.closest?.('[data-v33-save]')){beginV433Switch();repairAfterSave()}
 if(e.target.closest?.('[data-nexa-tab],.v33-item,[data-v33-cat],[data-v33-gen],[data-v33-widget],[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],[data-v33-troop-skill],[data-v33-charm-sub],#admin-panel-button,[data-admin-tab],[data-open-full-profile],#nexa-profile-launcher-section,[data-v33-save],.nexa-v30-save,.nexa-v30-card,.nexa-v30-tab,.nexa-v30-gen,[data-admin-tab],#admin-roles,#admin-manage-access'))deferV432();
},true);
document.addEventListener('change',e=>{
 if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level],[data-nexa-v435-pet-skill],#nexa-v30-detail select,#nexa-v446-charms select')){beginV433Switch();deferV432();setTimeout(endV433Switch,320)}
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',allV432,{once:true});else allV432();
window.addEventListener('load',allV432,{once:true});window.addEventListener('pageshow',allV432);
setTimeout(allV432,350);setTimeout(allV432,1100);nextSignal();

window.NEXA_V432_WIDGETS=W;
window.NEXA_V432_TROOP_SKILLS=TS;
window.NEXA_V432_PETS=P;
})();



(function(){
 if(document.getElementById('nexa-v436-css'))return;
 const s=document.createElement('style');s.id='nexa-v436-css';
 s.textContent='\n/* V43.6 focused visual additions */\n#nexa-v436-pet-panel{\n  --pet:#74ecff;--petbg:#173d54;\n  margin:12px 0;padding:12px;border:1px solid color-mix(in srgb,var(--pet) 42%,transparent);\n  border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--petbg) 50%,#081128),#071020);\n  box-shadow:0 0 20px color-mix(in srgb,var(--pet) 10%,transparent)\n}\n.nexa-v436-pet-head{\n  width:100%;display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:center;\n  padding:0;border:0;background:transparent;color:#fff;text-align:left\n}\n.nexa-v436-pet-orb{\n  width:50px;height:50px;border-radius:50%;display:grid;place-items:center;color:var(--pet);\n  border:1px solid color-mix(in srgb,var(--pet) 75%,white 8%);\n  background:radial-gradient(circle at 45% 38%,color-mix(in srgb,var(--pet) 20%,var(--petbg)),#071125 72%);\n  box-shadow:0 0 12px color-mix(in srgb,var(--pet) 75%,transparent),0 0 30px color-mix(in srgb,var(--pet) 28%,transparent)\n}\n.nexa-v436-pet-orb .nexa-v434-animal-glyph{font-size:27px;filter:grayscale(.08) drop-shadow(0 0 7px var(--pet))}\n.nexa-v436-pet-copy b{display:block;font-size:13px}\n.nexa-v436-pet-copy small{display:block;margin-top:4px;color:var(--pet);font-size:8px;font-weight:950;letter-spacing:.09em}\n.nexa-v436-pet-desc{margin:10px 0 0;padding:9px 10px;border-radius:11px;background:rgba(3,10,28,.45);color:#c8d1e6;font-size:10px;line-height:1.45}\n.nexa-v436-pet-level{display:grid;gap:5px;margin-top:10px}\n.nexa-v436-pet-level>span,.nexa-v436-pet-result small{color:#8f9bb9;font-size:8px;font-weight:950;letter-spacing:.1em}\n.nexa-v436-pet-level select,.nexa-v436-access-card select{\n  width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid rgba(122,142,204,.26);\n  border-radius:11px;background:#071027;color:#fff;font-size:16px\n}\n.nexa-v436-pet-result{display:grid;gap:3px;margin-top:9px;padding:10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--pet) 34%,transparent);background:color-mix(in srgb,var(--pet) 8%,#081027)}\n.nexa-v436-pet-result strong{color:var(--pet);font-size:12px}.nexa-v436-pet-result span{color:#b2bdd5;font-size:9px}\n\n.nexa-v436-main-account{\n  display:inline-flex!important;width:max-content!important;max-width:100%!important;\n  padding:5px 9px!important;border:1px solid rgba(255,211,96,.34)!important;border-radius:999px!important;\n  background:rgba(75,53,14,.22)!important;color:#ffd978!important;font-size:8px!important;font-weight:950!important;letter-spacing:.08em!important\n}\n.nexa-v436-alliance-change{display:grid;gap:2px;margin:4px 0 6px}\n.nexa-v436-alliance-change b{color:#72e6ff;font-size:9px}.nexa-v436-alliance-change small{color:#8f9ab9;font-size:8px;line-height:1.3}\n\n.nexa-v436-access-card{\n  display:grid;gap:10px;margin:10px 0 14px;padding:13px;border:1px solid rgba(83,211,255,.28);\n  border-radius:17px;background:linear-gradient(145deg,rgba(8,29,51,.88),rgba(8,11,32,.96));\n  box-shadow:0 0 20px rgba(61,192,255,.08)\n}\n.nexa-v436-access-title{color:#85e9ff;font-size:9px;font-weight:950;letter-spacing:.13em}\n.nexa-v436-select-row{display:grid;gap:5px}.nexa-v436-select-row>span,#nexa-v436-account-picker label>span{color:#9aa6c4;font-size:8px;font-weight:950;letter-spacing:.09em}\n.nexa-v436-badges{display:flex;gap:6px;flex-wrap:wrap;min-height:25px;align-items:center}.nexa-v436-badges small{color:#7e8aaa;font-size:8px}\n.nexa-v436-badge{\n  border:1px solid rgba(91,213,255,.34);border-radius:999px;padding:6px 9px;\n  background:rgba(14,49,69,.62);color:#c8f5ff;font-size:8px;font-weight:900\n}\n.nexa-v436-badge.module{border-color:rgba(164,107,255,.36);background:rgba(48,27,85,.55);color:#e2d4ff}\n.nexa-v436-add-another{width:max-content;border:0;background:transparent;color:#6fddff;padding:2px 0;font-size:9px;font-weight:900}\n';
 document.head.appendChild(s);
})();

/* =========================================================
   NEXA V43.6 FOCUSED FIX
   - DO NOT TOUCH Heroes / Experts / Troops
   - Restore full Pet Skill panel on active V30/V31 Profile
   - Restore Charm art after every re-entry
   - Remove legacy Ministry Schedule block, preserve new pill
   - Main Account + Alliance profile polish
   - Convert existing NEXA Access checkboxes into dropdown workflow
   ========================================================= */

const V436_PET_ALIASES={
  'Frost Chameleon':'Frostscale Chameleon',
  'Frostscale Chameleon':'Frostscale Chameleon',
  'Saber Tooth Tiger':'Saber-tooth Tiger',
  'Sabertooth Tiger':'Saber-tooth Tiger',
  'Saber-tooth Tiger':'Saber-tooth Tiger',
  'Frost Gorilla':'Frost Gorilla',
  'Snow Ape':'Snow Ape',
  'Iron Rhino':'Iron Rhino',
  'Mammoth':'Mammoth',
  'Cave Lion':'Cave Lion',
  'Snow Leopard':'Snow Leopard',
  'Giant Elk':'Giant Elk',
  'Titan Roc':'Titan Roc',
  'Giant Tapir':'Giant Tapir',
  'Musk Ox':'Musk Ox',
  'Arctic Wolf':'Arctic Wolf',
  'Cave Hyena':'Cave Hyena'
};

function v436PetKey(root){
  if(!root)return'';
  const txt=(root.textContent||'').replace(/\s+/g,' ');
  for(const [alias,key] of Object.entries(V436_PET_ALIASES)){
    if(txt.toLowerCase().includes(alias.toLowerCase()))return key;
  }
  const head=(
    $('#nexa-v30-detail h4')?.textContent||
    $('#nexa-v33-detail .v33-title h3')?.textContent||
    ''
  ).trim();
  return V436_PET_ALIASES[head]||head;
}
function v436FindPetLevel(root,max){
  const candidates=$$('select',root).filter(s=>{
    if(s.closest('#nexa-v436-pet-panel'))return false;
    const wrap=s.closest('label,.nexa-v30-field,.v33-section,section,article,div');
    const text=(wrap?.textContent||'').toLowerCase();
    return /pet skill|skill level|level/.test(text);
  });
  let native=candidates.find(s=>{
    const v=Number(s.value);
    return Number.isFinite(v)&&v>=0&&v<=max;
  });
  if(!native){
    native=$$('select',root).find(s=>{
      if(s.closest('#nexa-v436-pet-panel'))return false;
      const v=Number(s.value);
      return Number.isFinite(v)&&v>=0&&v<=max;
    });
  }
  return native||null;
}
function v436PetPanel(){
  const root=$('#nexa-v30-detail')||$('#nexa-v33-detail');
  if(!root)return;
  const key=v436PetKey(root),p=P[key];
  if(!p)return;

  const native=v436FindPetLevel(root,p[2].length);
  const lv=clamp(Number(native?.value||0),0,p[2].length);
  const glow=PET_GLOW[key]||['#74ecff','#173d54'];

  let panel=$('#nexa-v436-pet-panel',root);
  if(!panel){
    panel=document.createElement('section');
    panel.id='nexa-v436-pet-panel';
    const action=$('.nexa-v30-actions,.v33-actions',root);
    if(action?.parentElement)action.parentElement.insertBefore(panel,action);
    else root.appendChild(panel);
  }
  panel.style.setProperty('--pet',glow[0]);
  panel.style.setProperty('--petbg',glow[1]);
  panel.innerHTML=`
    <button type="button" class="nexa-v436-pet-head" aria-expanded="false">
      <span class="nexa-v436-pet-orb">${animalSVG(p[1])}</span>
      <span class="nexa-v436-pet-copy">
        <b>${esc(p[0])}</b>
        <small>TAP TO VIEW PET SKILL</small>
      </span>
    </button>
    <div class="nexa-v436-pet-desc" hidden>${esc(p[4])}</div>
    <label class="nexa-v436-pet-level">
      <span>PET SKILL LEVEL</span>
      <select data-v436-pet-level>
        ${Array.from({length:p[2].length+1},(_,i)=>`<option value="${i}" ${i===lv?'selected':''}>${i}</option>`).join('')}
      </select>
    </label>
    <div class="nexa-v436-pet-result">
      <small>PET BUFF</small>
      <strong>${lv?esc(p[2][lv-1]):'Not active'}</strong>
      ${lv&&p[3]?.[lv-1]?`<span>Cooldown: ${esc(p[3][lv-1])}</span>`:''}
    </div>`;

  const head=$('.nexa-v436-pet-head',panel);
  const desc=$('.nexa-v436-pet-desc',panel);
  head.onclick=()=>{
    desc.hidden=!desc.hidden;
    head.setAttribute('aria-expanded',String(!desc.hidden));
  };
  $('[data-v436-pet-level]',panel).onchange=e=>{
    const n=Number(e.target.value||0);
    if(native){
      native.value=String(n);
      native.dispatchEvent(new Event('input',{bubbles:true}));
      native.dispatchEvent(new Event('change',{bubbles:true}));
    }
    v436PetPanel();
  };

  /* Hide ONLY the old pet skill presentation, never the Save actions. */
  $$('section,.v33-section,.nexa-v30-field',root).forEach(el=>{
    if(el===panel||el.contains(panel))return;
    const text=(el.textContent||'').toLowerCase();
    if(/pet skill/.test(text) && !$('button.nexa-v30-save,[data-v33-save]',el)){
      if(el.contains(native)||/tap for skill details|pet buff/.test(text))el.style.display='none';
    }
  });
}

function v436RemoveLegacyMinistry(){
  const profile=$('#nexa-profile-modal');if(!profile)return;
  $$('section,article,.card,.panel,div',profile).forEach(el=>{
    if(el.closest('.nexa-v435-ministry-pill,#nexa-v425-ministry,.nexa-v425-ministry'))return;
    const tx=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(!tx||tx.length>700)return;
    if(/Ministry Schedule/i.test(tx) && /(VIP Construction|Construction|9\s*P\.?M\.?|9:00)/i.test(tx)){
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    }
  });
}

function v436CharmTypeFromPieceText(text=''){
  const s=String(text).toLowerCase();
  if(/coat|pants/.test(s))return'infantry';
  if(/helmet|watch/.test(s))return'lancer';
  if(/ring|short\s*staff|shortstaff|staff/.test(s))return'marksman';
  return charmType(s);
}
function v436RestoreCharms(){
  const root=$('#nexa-profile-modal');if(!root)return;
  const activeText=($('.nexa-v30-tab.active')?.textContent||$('.v33-cat.active')?.textContent||'').toLowerCase();
  if(activeText && !/charm/.test(activeText))return;

  const detail=$('#nexa-v30-detail')||$('#nexa-v33-detail')||root;
  const detailText=(detail.textContent||'');
  const globalType=v436CharmTypeFromPieceText(detailText);

  $$('select',detail).forEach(sel=>{
    if(sel.closest('#nexa-v436-pet-panel'))return;
    const lv=Number(sel.value||0);
    if(!lv||lv>18)return;

    const row=sel.closest('.v33-charm-row,[class*="charm-row"],[class*="charm-card"],.nexa-v30-field,article,section,div');
    if(!row)return;
    const type=v436CharmTypeFromPieceText(row.textContent||'')||globalType;
    if(!type)return;

    let img=$('img',row);
    if(!img){
      const q=$$('div,span',row).find(x=>{
        if(x.children.length)return false;
        return /^\s*[?]\s*$/.test(x.textContent||'');
      });
      if(q){
        img=document.createElement('img');
        img.className='nexa-v436-charm-img';
        q.replaceWith(img);
      }
    }
    if(img){
      const wanted=charmPath(type,lv);
      img.src=wanted;
      img.alt=`${type} Charm Lv ${lv}`;
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('background','transparent','important');
      img.style.setProperty('object-fit','contain','important');
    }
  });
}

function v436MainAlliance(){
  const root=$('#nexa-profile-modal');if(!root)return;

  /* Main account becomes a compact badge wherever the legacy sentence exists. */
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const tx=(el.textContent||'').trim();
    if(/^This is your main account\.?$/i.test(tx)){
      el.textContent='★ MAIN ACCOUNT';
      el.classList.add('nexa-v436-main-account');
    }
  });

  /* Alliance: preserve the native dropdown + save behavior, only improve its presentation. */
  $$('select',root).forEach(sel=>{
    if(sel.dataset.nexaV436Alliance==='1')return;
    const wrap=sel.closest('label,.nexa-v30-field,.profile-field,.form-group,div');
    if(!wrap)return;
    const tx=(wrap.textContent||'').replace(/\s+/g,' ').trim();
    if(!/alliance/i.test(tx))return;

    const label=$('label,span,b,strong',wrap);
    if(label && /alliance/i.test(label.textContent||''))label.textContent='CURRENT ALLIANCE';

    const hint=document.createElement('div');
    hint.className='nexa-v436-alliance-change';
    hint.innerHTML='<b>Change Alliance</b><small>Select your new alliance below. Your existing profile save button will apply the change.</small>';
    sel.before(hint);
    sel.dataset.nexaV436Alliance='1';
  });
}

/* ---------- Administration / NEXA Access dropdown workflow ---------- */
function v436AccessSection(){
  return $('#admin-permissions')||$('[data-admin-section="access"]')||
    $$('.admin-section').find(x=>/NEXA Access/i.test(x.textContent||''))||null;
}
function v436SelectedAccessCard(){
  const sec=v436AccessSection();if(!sec)return null;
  return $('#v25-access-selected',sec)||$('[id*="access-selected"]',sec)||
    $$('.nexa-v25-panel',sec).find(x=>/Operational Roles/i.test(x.textContent||'')&&/Module Access/i.test(x.textContent||''))||null;
}
function v436ClickNativeBox(box,checked){
  if(!box)return;
  if(box.disabled)box.disabled=false; // Owner can manage own working access in NEXA.
  if(box.checked===checked)return;
  box.click(); // preserve original listeners / persistence path
}
function v436BuildAccessDropdowns(){
  const sec=v436AccessSection();if(!sec)return;

  /* Account picker = existing NEXA Access search results, converted to a dropdown. */
  const resultButtons=$$('.nexa-v25-access-result',sec);
  let picker=$('#nexa-v436-account-picker',sec);
  if(resultButtons.length && !picker){
    picker=document.createElement('div');
    picker.id='nexa-v436-account-picker';
    picker.className='nexa-v436-access-card';
    picker.innerHTML=`
      <label><span>ACCOUNT</span>
        <select data-v436-account>
          <option value="">Select account…</option>
          ${resultButtons.map((b,i)=>`<option value="${i}">${esc((b.textContent||'').replace(/\s+/g,' ').trim())}</option>`).join('')}
        </select>
      </label>`;
    const first=resultButtons[0];
    first.parentElement?.insertBefore(picker,first.parentElement.firstChild);
    resultButtons.forEach(b=>b.style.display='none');
    $('[data-v436-account]',picker).onchange=e=>{
      const i=Number(e.target.value);
      if(Number.isInteger(i)&&resultButtons[i]){
        resultButtons[i].click();
        setTimeout(v436BuildAccessDropdowns,60);
        setTimeout(v436BuildAccessDropdowns,220);
      }
    };
  }

  const target=v436SelectedAccessCard();if(!target)return;
  const opBoxes=$$('input[type="checkbox"][data-v25-op]',target);
  const modBoxes=$$('input[type="checkbox"][data-v25-access-module]',target);
  if(!opBoxes.length && !modBoxes.length)return;

  opBoxes.forEach(b=>b.disabled=false);
  modBoxes.forEach(b=>b.disabled=false);

  let ui=$('#nexa-v436-access-editor',target);
  if(ui)ui.remove();
  ui=document.createElement('div');
  ui.id='nexa-v436-access-editor';
  ui.className='nexa-v436-access-card';

  const opBadges=opBoxes.filter(b=>b.checked).map(b=>{
    const name=(b.closest('label')?.textContent||b.dataset.v25Op||'').trim();
    return `<button type="button" class="nexa-v436-badge" data-v436-remove-op="${esc(b.dataset.v25Op)}">${esc(name)} ×</button>`;
  }).join('');
  const modBadges=modBoxes.filter(b=>b.checked).map(b=>{
    const name=(b.closest('label')?.textContent||b.dataset.v25AccessModule||'').trim();
    return `<button type="button" class="nexa-v436-badge module" data-v436-remove-module="${esc(b.dataset.v25AccessModule)}">${esc(name)} ×</button>`;
  }).join('');

  ui.innerHTML=`
    <div class="nexa-v436-access-title">NEXA ACCESS</div>

    <label class="nexa-v436-select-row">
      <span>OPERATIONAL ROLE</span>
      <select data-v436-add-op>
        <option value="">Add operational role…</option>
        ${opBoxes.filter(b=>!b.checked).map(b=>`<option value="${esc(b.dataset.v25Op)}">${esc((b.closest('label')?.textContent||b.dataset.v25Op).trim())}</option>`).join('')}
      </select>
    </label>
    <div class="nexa-v436-badges">${opBadges||'<small>No operational roles selected.</small>'}</div>
    <button type="button" class="nexa-v436-add-another" data-v436-focus-op>+ Add another operational role</button>

    <label class="nexa-v436-select-row">
      <span>MODULE ACCESS</span>
      <select data-v436-add-module>
        <option value="">Add module access…</option>
        ${modBoxes.filter(b=>!b.checked).map(b=>`<option value="${esc(b.dataset.v25AccessModule)}">${esc((b.closest('label')?.textContent||b.dataset.v25AccessModule).trim())}</option>`).join('')}
      </select>
    </label>
    <div class="nexa-v436-badges">${modBadges||'<small>No special module access selected.</small>'}</div>
    <button type="button" class="nexa-v436-add-another" data-v436-focus-module>+ Add another module</button>`;

  target.prepend(ui);

  /* Old checkboxes remain as the persistence engine but disappear visually. */
  $$('.nexa-v25-checks',target).forEach(x=>x.style.display='none');
  $$('h4',target).forEach(h=>{
    if(/Operational Roles|Module Access/i.test(h.textContent||''))h.style.display='none';
  });
  $$('.nexa-v25-protected',target).forEach(x=>{
    if(/Owner Main Access Protected/i.test(x.textContent||''))x.style.display='none';
  });

  $('[data-v436-add-op]',ui)?.addEventListener('change',e=>{
    const v=e.target.value;if(!v)return;
    v436ClickNativeBox(opBoxes.find(b=>b.dataset.v25Op===v),true);
    setTimeout(v436BuildAccessDropdowns,100);
  });
  $('[data-v436-add-module]',ui)?.addEventListener('change',e=>{
    const v=e.target.value;if(!v)return;
    v436ClickNativeBox(modBoxes.find(b=>b.dataset.v25AccessModule===v),true);
    setTimeout(v436BuildAccessDropdowns,100);
  });
  $$('[data-v436-remove-op]',ui).forEach(btn=>btn.onclick=()=>{
    v436ClickNativeBox(opBoxes.find(b=>b.dataset.v25Op===btn.dataset.v436RemoveOp),false);
    setTimeout(v436BuildAccessDropdowns,100);
  });
  $$('[data-v436-remove-module]',ui).forEach(btn=>btn.onclick=()=>{
    v436ClickNativeBox(modBoxes.find(b=>b.dataset.v25AccessModule===btn.dataset.v436RemoveModule),false);
    setTimeout(v436BuildAccessDropdowns,100);
  });
  $('[data-v436-focus-op]',ui)?.addEventListener('click',()=> $('[data-v436-add-op]',ui)?.focus());
  $('[data-v436-focus-module]',ui)?.addEventListener('click',()=> $('[data-v436-add-module]',ui)?.focus());
}

function v436ApplyFocused(){
  v436PetPanel();
  v436RemoveLegacyMinistry();
  v436RestoreCharms();
  v436MainAlliance();
  v436BuildAccessDropdowns();
}
function v436Defer(){
  requestAnimationFrame(v436ApplyFocused);
  [60,180,360,700].forEach(ms=>setTimeout(v436ApplyFocused,ms));
}
document.addEventListener('click',e=>{
  if(e.target.closest?.(
    '.nexa-v30-tab,.nexa-v30-card,[data-v33-cat],.v33-item,'+
    '.nexa-v25-access-result,[data-v25-manage-access],#admin-permissions,'+
    '[data-admin-tab],[data-v25-nav],[data-v33-save],.nexa-v30-save'
  ))v436Defer();
},true);
document.addEventListener('change',e=>{
  if(e.target.matches?.(
    '#nexa-v30-detail select,#nexa-v33-detail select,#nexa-v446-charms select,'+
    '[data-v25-op],[data-v25-access-module]'
  ))v436Defer();
},true);
window.addEventListener('nexa:profile-open',v436Defer);
window.addEventListener('nexa:profile-updated',v436Defer);
window.addEventListener('nexa:auth-ready',v436Defer);
v436Defer();

/* V43.5 active-profile compatibility layer: targets both legacy V33 detail and current V31/V30 profile DOM. */
