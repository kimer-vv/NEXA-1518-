/* NEXA V43 REVIEW HOTFIX — 2026-08-24
   Consolidated structural fixes from Profile review.
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
   NEXA V43.2 ADD-ON
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

function currentHero(){return ($('#nexa-v33-detail .v33-title h3')?.textContent||'').trim()}
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
   <div class="nexa-widget-buff"><b>${aVal}</b><small>${a?`Effect Lv ${a}/5`:'Locked'}</small></div>
  </article>
  <article class="v33-skill">
   <div class="nexa-widget-name"><b>${d[3]}</b><span>EXPEDITION</span></div>
   <div class="nexa-widget-desc">${d[4]} • unlocks/upgrades at Widget Lv 2/4/6/8/10.</div>
   <div class="nexa-widget-buff"><b>${bVal}</b><small>${b?`Effect Lv ${b}/5`:'Locked'}</small></div>
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
 'Musk Ox':['Burden Bearer','ox',['Cooldown 35h','Cooldown 31h','Cooldown 27h','Cooldown 23h','Cooldown 19h','Cooldown 15h'],['35h','31h','27h','23h','19h','15h'],'The Musk Ox utility skill improves by lowering its cooldown.'],
 'Giant Tapir':['Natural Intuition','tapir',['Pet Food +200','Pet Food +250','Pet Food +300','Pet Food +350','Pet Food +400','Pet Food +450','Pet Food +500'],Array(7).fill('23h'),'Natural intuition helps discover extra Pet Food.'],
 'Titan Roc':['Razorbeak','bird',['Enemy HP -1.5%','Enemy HP -2%','Enemy HP -2.5%','Enemy HP -3%','Enemy HP -3.5%','Enemy HP -4%','Enemy HP -5%'],Array(7).fill('20h'),'Razorbeak weakens enemy troop Health.'],
 'Giant Elk':['Mystical Finding','elk',['Cooldown 51h','Cooldown 47h','Cooldown 43h','Cooldown 39h','Cooldown 35h','Cooldown 31h','Cooldown 27h','Cooldown 23h'],['51h','47h','43h','39h','35h','31h','27h','23h'],'Mystical Finding improves as its cooldown is reduced.'],
 'Snow Leopard':['Lightning Raid','cat',['March Speed +15% • Enemy Lethality -1.5%','March Speed +17% • Enemy Lethality -2%','March Speed +19% • Enemy Lethality -2.5%','March Speed +21% • Enemy Lethality -3%','March Speed +23% • Enemy Lethality -3.5%','March Speed +25% • Enemy Lethality -4%','March Speed +27% • Enemy Lethality -4.5%','March Speed +30% • Enemy Lethality -5%'],Array(8).fill('20h'),'A rapid assault boosts March Speed while lowering enemy Lethality.'],
 'Cave Lion':['Feral Anthem','lion',['Troop Attack +2.5%','Troop Attack +3%','Troop Attack +3.5%','Troop Attack +4%','Troop Attack +5%','Troop Attack +6%','Troop Attack +7%','Troop Attack +8%','Troop Attack +9%','Troop Attack +10%'],null,'A battle anthem increases Troop Attack.'],
 'Snow Ape':['Tumbling Power','ape',['Squad Capacity +1,500','Squad Capacity +3,000','Squad Capacity +4,500','Squad Capacity +6,000','Squad Capacity +7,500','Squad Capacity +9,000','Squad Capacity +10,500','Squad Capacity +12,000','Squad Capacity +13,500','Squad Capacity +15,000'],null,'Tumbling Power increases Squad Capacity.'],
 'Iron Rhino':['Rallying Beasts','rhino',['Rally Capacity +60,000','Rally Capacity +70,000','Rally Capacity +80,000','Rally Capacity +90,000','Rally Capacity +100,000','Rally Capacity +110,000','Rally Capacity +120,000','Rally Capacity +130,000','Rally Capacity +140,000','Rally Capacity +150,000'],null,'Rallying Beasts increases Rally Capacity.'],
 'Saber-tooth Tiger':['Apex Assault','cat',['Troop Lethality +2.5%','Troop Lethality +3%','Troop Lethality +3.5%','Troop Lethality +4%','Troop Lethality +5%','Troop Lethality +6%','Troop Lethality +7%','Troop Lethality +8%','Troop Lethality +9%','Troop Lethality +10%'],null,'Apex Assault increases Troop Lethality.'],
 'Mammoth':['Hardened Skin','mammoth',['Troop Defense +2.5%','Troop Defense +3%','Troop Defense +3.5%','Troop Defense +4%','Troop Defense +5%','Troop Defense +6%','Troop Defense +7%','Troop Defense +8%','Troop Defense +9%','Troop Defense +10%'],null,'Hardened Skin increases Troop Defense.'],
 'Frost Gorilla':['Earthbound Vigor','gorilla',['Troop Health +2.5%','Troop Health +3%','Troop Health +3.5%','Troop Health +4%','Troop Health +5%','Troop Health +6%','Troop Health +7%','Troop Health +8%','Troop Health +9%','Troop Health +10%'],null,'Earthbound Vigor increases Troop Health.'],
 'Frostscale Chameleon':['Icy Shroud','lizard',['Enemy Defense -2.5%','Enemy Defense -3%','Enemy Defense -3.5%','Enemy Defense -4%','Enemy Defense -5%','Enemy Defense -6%','Enemy Defense -7%','Enemy Defense -8%','Enemy Defense -9%','Enemy Defense -10%'],null,'Icy Shroud lowers Enemy Defense.']
};
function animalSVG(kind){
 const shapes={hyena:'M5 15l2-6 3-3 2 2 3-3 2 5 2 3-3 4H9z',wolf:'M5 16l2-7 3-4 2 3 3-4 2 5 2 4-4 5H9z',ox:'M7 8c2-3 8-3 10 0l1 7-3 4H9l-3-4z',tapir:'M4 12c3-5 10-6 14-2l2 4-4 4H8l-4-3z',bird:'M4 14c5-7 9-8 16-6-5 1-7 4-8 8-3-2-5-2-8-2z',elk:'M8 10c2-3 6-3 8 0v8H8z',cat:'M6 10l2-5 4 3 4-3 2 5v6l-3 3H9l-3-3z',lion:'M4 12a8 8 0 1 0 16 0A8 8 0 1 0 4 12',ape:'M6 20c0-6 2-10 6-10s6 4 6 10zM7 7a5 5 0 1 0 10 0A5 5 0 1 0 7 7',gorilla:'M3 20c1-7 4-11 9-11s8 4 9 11zM7 7a5 5 0 1 0 10 0A5 5 0 1 0 7 7',rhino:'M4 10c5-4 11-4 15 1l1 6H7l-3-3zM18 10l3-4-1 6',mammoth:'M4 11c2-5 12-6 15-1v8H8l-4-3zM18 12c4 5 1 8-2 7',lizard:'M5 12c3-4 9-4 12 0l4-3-3 5-4 2H8l-5 3 3-5z'};
 return `<svg viewBox="0 0 24 24" style="width:30px;height:30px;filter:drop-shadow(0 0 5px currentColor)"><path d="${shapes[kind]||shapes.wolf}" fill="currentColor"/></svg>`;
}
function petV432(){
 const root=$('#nexa-v33-detail');if(!root)return;
 const p=P[currentHero()];if(!p)return;
 const sec=$$('.v33-section',root).find(x=>/PET SKILL/i.test($('.v33-kicker span',x)?.textContent||''));
 if(!sec)return;
 const old=$('[data-v33-pet-skill]',sec);
 const lv=clamp(Number(old?.value||0),0,p[2].length);
 sec.innerHTML=`
  <div class="v33-kicker"><span>PET SKILL</span><strong>LEVEL ${lv}</strong></div>
  <div class="nexa-v432-pet" style="padding:10px;border:1px solid rgba(84,218,255,.22);border-radius:16px;background:rgba(4,21,42,.46)">
   <div class="nexa-v432-pet-head" style="display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;cursor:pointer">
    <span style="width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#74ecff;border:1px solid rgba(98,226,255,.5);box-shadow:0 0 12px rgba(76,224,255,.48),0 0 30px rgba(78,92,255,.22)">${animalSVG(p[1])}</span>
    <div><b>${p[0]}</b><small style="display:block;color:#73e4ff;margin-top:3px">TAP FOR SKILL DETAILS</small></div>
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

/* Ministry: force a self-contained inline calendar/star icon even if old image is broken. */
function ministryV432(){
 const b=$('#nexa-v425-ministry');if(!b)return;
 b.innerHTML=`<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
  <rect x="4.5" y="5.5" width="15" height="14" rx="2.4" fill="none" stroke="#5be7ff" stroke-width="1.8"/>
  <path d="M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4" fill="none" stroke="#5be7ff" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z" fill="#5be7ff"/>
 </svg>`;
 b.style.background='radial-gradient(circle,rgba(46,205,255,.20),rgba(7,17,37,.95) 70%)';
 b.style.borderColor='rgba(76,218,255,.72)';
 b.style.boxShadow='0 0 12px rgba(61,215,255,.34)';
}

/* Main-account / Alliance line overflow fix. */
function profileFitV432(){
 const p=$('#nexa-profile-modal');if(!p)return;
 $$('.nexa-profile-sub,.nexa-profile-identity,.nexa-profile-main,.nexa-profile-hero',p).forEach(x=>{x.style.minWidth='0';x.style.maxWidth='100%'});
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
function qIndex(key){let h=2166136261;for(const ch of key){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)%Q.length}
function signalV432(){
 const key=new Date().toISOString().slice(0,10),msg=Q[qIndex(key)];
 $$('h1,h2,h3,h4,b,strong,span').forEach(h=>{
  if((h.textContent||'').trim().toLowerCase()!=='the last signal')return;
  const wrap=h.closest('section,article,.glass,.card,div');if(!wrap)return;
  const p=$('p',wrap)||$$('div',wrap).find(x=>x!==h&&x.children.length===0&&x.textContent.trim());
  if(p&&!/the last signal/i.test(p.textContent||'')){p.textContent=msg;p.dataset.nexaSignalDate=key}
 });
 localStorage.setItem('nexa_last_signal_date',key);
}
function nextSignal(){const now=new Date(),next=new Date(now);next.setUTCHours(24,0,2,0);setTimeout(()=>{signalV432();nextSignal()},Math.max(1000,next-now))}

/* Owner working role + module badges. RPCs are installed in Supabase. */
const RL={battle_strategist:'Battle Strategist',event_operator:'Event Operator',scheduler:'Scheduler',transfer_coordinator:'Transfer Coordinator'};
function sb(){return window.supabaseClient||window.sb||null}
async function rolePanelV432(){
 const host=$('#admin-roles');if(!host||$('#nexa-v432-role-panel',host))return;
 const c=sb();if(!c)return;
 let role='';try{role=String((await c.rpc('current_nexa_role')).data||'').toLowerCase()}catch{}
 if(role!=='owner')return;
 let user=null;try{user=(await c.auth.getUser()).data?.user}catch{}if(!user)return;
 let work='',access={};
 try{work=(await c.from('nexa_operational_roles').select('role').eq('user_id',user.id).limit(1).maybeSingle()).data?.role||''}catch{}
 try{access=(await c.from('staff_module_access').select('*').eq('user_id',user.id).maybeSingle()).data||{}}catch{}
 const d=document.createElement('div');d.id='nexa-v432-role-panel';d.style.cssText='margin:12px 0;padding:13px;border:1px solid rgba(94,222,255,.28);border-radius:16px;background:rgba(7,20,45,.86)';
 d.innerHTML=`<b>MY WORKING ROLE & MODULE BADGES</b><p class="muted">Owner access stays protected. These only describe what you actively do.</p>
 <select id="nexa-v432-role" style="width:100%;margin:8px 0;padding:10px;background:#091329;color:#fff;border-radius:10px">
  <option value="">No working-role badge</option>${Object.entries(RL).map(([v,l])=>`<option value="${v}" ${work===v?'selected':''}>${l}</option>`).join('')}
 </select>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
 ${[['svs_access','SVS'],['transfer_access','Transfers'],['sbs_access','SBS'],['team_builder_access','Team Builder'],['forms_access','Forms'],['events_access','Events'],['library_access','Library'],['administration_access','Administration']].map(([k,l])=>`<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-v432-module="${k}" ${access[k]?'checked':''}>${l}</label>`).join('')}
 </div><button class="btn" id="nexa-v432-role-save" style="margin-top:10px">SAVE MY WORKING ROLE</button><div class="form-message" id="nexa-v432-role-msg"></div>`;
 host.appendChild(d);
 $('#nexa-v432-role-save',d).onclick=async()=>{
  const msg=$('#nexa-v432-role-msg',d);msg.textContent='Saving…';
  const vals={};$$('[data-v432-module]',d).forEach(x=>vals[x.dataset.v432Module]=x.checked);
  try{
   let q=await c.rpc('nexa_owner_set_my_operational_role',{new_role:$('#nexa-v432-role',d).value||null});if(q.error)throw q.error;
   q=await c.rpc('nexa_owner_set_my_module_access',{new_svs:!!vals.svs_access,new_transfer:!!vals.transfer_access,new_sbs:!!vals.sbs_access,new_team_builder:!!vals.team_builder_access,new_forms:!!vals.forms_access,new_events:!!vals.events_access,new_library:!!vals.library_access,new_administration:!!vals.administration_access});if(q.error)throw q.error;
   msg.textContent='Working role updated ✓';
  }catch(e){msg.textContent=e?.message||'Could not save working role.'}
 };
}

/* Troop image visual only: remove the gray panel. We intentionally do NOT replace
   the actual troop artwork in this TXT because the user is resending the final images. */
function troopVisualV432(){
 $$('.v33-item[data-type="troop"] .v33-planet,.v33-mini.troop').forEach(x=>x.style.background='transparent');
 $$('.v33-item[data-type="troop"] img,.v33-mini.troop img').forEach(x=>{
  x.style.background='transparent';x.style.objectFit='contain';x.style.objectPosition='center';x.style.transform='scale(.90)';
 });
}

function allV432(){
 widgetV432();troopV432();petV432();charmsV432();ministryV432();
 profileFitV432();signalV432();rolePanelV432();troopVisualV432();
}
function deferV432(){requestAnimationFrame(()=>requestAnimationFrame(allV432));setTimeout(allV432,80);setTimeout(allV432,260)}

document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-nexa-tab],.v33-item,[data-v33-cat],[data-v33-gen],[data-v33-widget],[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],[data-v33-troop-skill],[data-v33-charm-sub],#admin-panel-button,[data-admin-tab]'))deferV432();
},true);
document.addEventListener('change',e=>{
 if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level]'))deferV432();
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',allV432,{once:true});else allV432();
window.addEventListener('load',allV432,{once:true});window.addEventListener('pageshow',allV432);
setTimeout(allV432,350);setTimeout(allV432,1100);nextSignal();

window.NEXA_V432_WIDGETS=W;
window.NEXA_V432_TROOP_SKILLS=TS;
window.NEXA_V432_PETS=P;
})();
