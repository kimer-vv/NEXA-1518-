/* NEXA V47 — VISUAL ASSETS + CHIEF GEAR
   2026-08-26
   Purpose:
   - Use the uploaded NEXA identity art.
   - Expose Alliance Emblem asset paths.
   - Render Chief Gear with the uploaded art by quality/tier.
   - Preserve the established Profile shell.
   - No MutationObserver, no touchmove preventDefault, no manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V47_VISUAL_ASSETS__) return;
window.__NEXA_V47_VISUAL_ASSETS__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]));

const IDENTITY={
  symbol:'/assets/nexa/identity/NEXA_01_N_Symbol.png',
  wordmark:'/assets/nexa/identity/NEXA_02_Main_Wordmark.png',
  appIcon:'/assets/nexa/identity/NEXA_03_App_Icon.png',
  compact:'/assets/nexa/identity/NEXA_04_Compact_Lockup.png',
  home:'/assets/nexa/identity/NEXA_05_Home_Wordmark.png'
};

const ALLIANCE_EMBLEMS=[
  '/assets/nexa/alliances/Alliance_01_Stellar_Guardians.png',
  '/assets/nexa/alliances/Alliance_02_Celestial_Legion.png',
  '/assets/nexa/alliances/Alliance_03_Obsidian_Syndicate.png',
  '/assets/nexa/alliances/Alliance_04_Nova_Empire.png',
  '/assets/nexa/alliances/Alliance_05_Eclipse_Order.png',
  '/assets/nexa/alliances/Alliance_06_Dragonis_Clan.png',
  '/assets/nexa/alliances/Alliance_07_Veridian_Covenant.png',
  '/assets/nexa/alliances/Alliance_08_Infinite_Horizon.png',
  '/assets/nexa/alliances/Alliance_09_Solar_Vanguard.png',
  '/assets/nexa/alliances/Alliance_10_Lost_Protocol.png'
];

window.NEXA_ASSETS=Object.assign(window.NEXA_ASSETS||{},{
  identity:IDENTITY,
  allianceEmblems:ALLIANCE_EMBLEMS
});

const PIECE_FILE={
  helmet:'helmet',
  watch:'watch',
  coat:'chestplate',
  pants:'pants',
  belt:'ring',
  shortstaff:'staff'
};

const QUALITY_LABEL={
  green:'GREEN',
  blue:'BLUE',
  purple:'PURPLE',
  gold:'MYTHIC / GOLD',
  red:'LEGENDARY / RED'
};

const TIER_OPTIONS={
  green:['base'],
  blue:['base'],
  purple:['base','t1'],
  gold:['base','t1','t2'],
  red:['base','t1','t2','t3','t4','t5','t6']
};

function normalizeQuality(v){
  const s=String(v||'').trim().toLowerCase();
  if(s.includes('legend')||s.includes('red')) return 'red';
  if(s.includes('myth')||s.includes('gold')) return 'gold';
  if(s.includes('epic')||s.includes('purple')) return 'purple';
  if(s.includes('rare')||s.includes('blue')) return 'blue';
  return 'green';
}

function normalizeTier(v){
  const s=String(v||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!s||s==='0'||s==='base'||s==='none') return 'base';
  const m=s.match(/t?([1-6])/);
  return m?'t'+m[1]:'base';
}

function normalizeSlug(item){
  const s=String(item?.slug||item?.name||'').toLowerCase().replace(/[^a-z]/g,'');
  if(s.includes('helmet')) return 'helmet';
  if(s.includes('watch')) return 'watch';
  if(s.includes('coat')||s.includes('chest')) return 'coat';
  if(s.includes('pants')) return 'pants';
  if(s.includes('belt')||s.includes('ring')) return 'belt';
  if(s.includes('shortstaff')||s.includes('staff')) return 'shortstaff';
  return s;
}

function validTierForQuality(q,t){
  const list=TIER_OPTIONS[q]||['base'];
  return list.includes(t)?t:list[0];
}

function gearAsset(item,progress={}){
  const slug=normalizeSlug(item);
  const piece=PIECE_FILE[slug];
  if(!piece) return item?.image_url||item?.image||'';

  const q=normalizeQuality(progress.quality||progress.rarity||progress.color||'green');
  const t=validTierForQuality(q,normalizeTier(progress.current_tier||progress.tier||'base'));

  if(q==='red'){
    if(t==='base') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red.png`;
    if(t==='t6') return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_t6.png.jpeg`;
    return `/assets/nexa/chief-gear-red/chiefgear_${piece}_red_${t}.png`;
  }

  if(t==='base') return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}.png`;
  return `/assets/nexa/chief-gear/chiefgear_${piece}_${q}_${t}.png`;
}

window.NEXA_CHIEF_GEAR_ASSETS={
  get:gearAsset,
  qualityOptions:TIER_OPTIONS
};

function sb(){
  return window.supabaseClient?.from ? window.supabaseClient :
         window.sb?.from ? window.sb : null;
}

function installCSS(){
  if($('#nexa-v47-assets-css')) return;

  const s=document.createElement('style');
  s.id='nexa-v47-assets-css';
  s.textContent=`
  .nexa-auth-logo{
    background:transparent!important;
    box-shadow:none!important;
    overflow:visible!important;
  }

  .nexa-auth-logo img{
    object-fit:contain!important;
    filter:drop-shadow(0 0 12px rgba(112,105,255,.38));
  }

  #nexa-profile-content .nexa-v47-gear-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:10px;
  }

  #nexa-profile-content .nexa-v47-gear-card{
    min-width:0;
    border:1px solid rgba(131,111,222,.26);
    border-radius:18px;
    padding:11px;
    background:linear-gradient(150deg,rgba(19,24,53,.94),rgba(5,10,26,.98));
    box-shadow:0 10px 26px rgba(0,0,0,.18);
  }

  .nexa-v47-gear-top{
    display:grid;
    grid-template-columns:76px minmax(0,1fr);
    gap:10px;
    align-items:center;
  }

  .nexa-v47-gear-art{
    position:relative;
    width:76px;
    height:76px;
    display:grid;
    place-items:center;
    border-radius:18px;
    border:1px solid rgba(146,126,255,.24);
    background:radial-gradient(circle,rgba(90,62,168,.20),rgba(6,10,26,.88));
    overflow:hidden;
  }

  .nexa-v47-gear-art img{
    width:100%;
    height:100%;
    object-fit:contain;
    filter:drop-shadow(0 0 9px rgba(134,104,255,.20));
  }

  .nexa-v47-stars{
    position:absolute;
    left:5px;
    bottom:4px;
    font-size:9px;
    line-height:1;
    color:#ffd76b;
    text-shadow:0 0 6px rgba(255,192,54,.65);
    letter-spacing:-1px;
  }

  .nexa-v47-gear-name{
    margin:0;
    color:#fff;
    font-size:14px;
    line-height:1.08;
  }

  .nexa-v47-gear-benefit{
    margin-top:4px;
    color:#8995b9;
    font-size:9px;
  }

  .nexa-v47-fields{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:7px;
    margin-top:10px;
  }

  .nexa-v47-fields label{
    min-width:0;
    color:#8e99ba;
    font-size:8px;
    font-weight:900;
    letter-spacing:.06em;
  }

  .nexa-v47-fields select{
    width:100%;
    min-width:0;
    margin-top:4px;
    padding:8px;
    border:1px solid rgba(127,143,204,.20);
    border-radius:10px;
    background:#091129;
    color:#fff;
    font-size:14px;
  }

  .nexa-v47-actions{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:7px;
    margin-top:9px;
  }

  .nexa-v47-save,
  .nexa-v47-reset{
    min-height:32px;
    border-radius:999px;
    padding:6px 11px;
    font-weight:900;
    font-size:9px;
  }

  .nexa-v47-save{
    border:1px solid rgba(76,194,255,.42);
    background:rgba(11,53,83,.48);
    color:#8ee7ff;
  }

  .nexa-v47-reset{
    border:1px solid rgba(133,101,255,.50);
    background:#10142d;
    color:#d9d0ff;
  }

  .nexa-v47-status{
    min-height:12px;
    margin-top:5px;
    text-align:center;
    color:#77dfff;
    font-size:8px;
  }

  .nexa-v47-empty{
    padding:26px 14px;
    text-align:center;
    color:#909aba;
    border:1px dashed rgba(130,143,195,.20);
    border-radius:18px;
  }

  .nexa-v47-empty b{
    display:block;
    color:#fff;
    margin-bottom:5px;
  }

  @media(max-width:390px){
    #nexa-profile-content .nexa-v47-gear-grid{gap:8px}
    #nexa-profile-content .nexa-v47-gear-card{padding:9px}
    .nexa-v47-gear-top{grid-template-columns:64px minmax(0,1fr)}
    .nexa-v47-gear-art{width:64px;height:64px}
  }`;

  document.head.appendChild(s);
}

function applyIdentity(){
  installCSS();

  const authLogo=$('.nexa-auth-logo img');
  if(authLogo && authLogo.getAttribute('src')!==IDENTITY.appIcon){
    authLogo.src=IDENTITY.appIcon;
  }

  $$('[data-nexa-identity]').forEach(img=>{
    const key=img.dataset.nexaIdentity;
    if(IDENTITY[key]) img.src=IDENTITY[key];
  });

  $$('[data-alliance-emblem-index]').forEach(img=>{
    const i=Number(img.dataset.allianceEmblemIndex);
    if(Number.isInteger(i)&&ALLIANCE_EMBLEMS[i]){
      img.src=ALLIANCE_EMBLEMS[i];
    }
  });
}

function currentAccountId(){
  return String(window.NEXA_ACTIVE_ACCOUNT_ID||'').trim();
}

function inventoryMap(rows){
  return new Map((rows||[]).map(x=>[String(x.library_item_id),x]));
}

function qualityOptions(selected){
  return Object.keys(TIER_OPTIONS).map(q=>
    `<option value="${q}" ${q===selected?'selected':''}>${QUALITY_LABEL[q]}</option>`
  ).join('');
}

function tierOptions(q,selected){
  return (TIER_OPTIONS[q]||['base']).map(t=>
    `<option value="${t}" ${t===selected?'selected':''}>${t==='base'?'BASE':t.toUpperCase()}</option>`
  ).join('');
}

function starsText(n){
  const x=Math.max(0,Math.min(3,Number(n)||0));
  return '★'.repeat(x);
}

function cardHTML(item,row){
  const p=row?.progress||{};
  const q=normalizeQuality(p.quality||p.rarity||p.color||'green');
  const t=validTierForQuality(q,normalizeTier(p.current_tier||p.tier||'base'));
  const stars=Math.max(0,Math.min(3,Number(p.stars)||0));
  const img=gearAsset(item,{...p,quality:q,current_tier:t});
  const benefit=item?.metadata?.benefits||'Chief Gear';

  return `<article class="nexa-v47-gear-card" data-gear-item="${esc(item.id)}">
    <div class="nexa-v47-gear-top">

      <div class="nexa-v47-gear-art">
        <img src="${esc(img)}" alt="${esc(item.name||'Chief Gear')}" loading="lazy">
        <span class="nexa-v47-stars">${esc(starsText(stars))}</span>
      </div>

      <div>
        <h4 class="nexa-v47-gear-name">${esc(item.name||'Chief Gear')}</h4>
        <div class="nexa-v47-gear-benefit">${esc(benefit)}</div>
      </div>

    </div>

    <div class="nexa-v47-fields">

      <label>QUALITY
        <select data-gear-f="quality">
          ${qualityOptions(q)}
        </select>
      </label>

      <label>TIER
        <select data-gear-f="current_tier">
          ${tierOptions(q,t)}
        </select>
      </label>

      <label>STARS
        <select data-gear-f="stars">
          <option value="0" ${stars===0?'selected':''}>0</option>
          <option value="1" ${stars===1?'selected':''}>1</option>
          <option value="2" ${stars===2?'selected':''}>2</option>
          <option value="3" ${stars===3?'selected':''}>3</option>
        </select>
      </label>

    </div>

    <div class="nexa-v47-actions">
      <button type="button" class="nexa-v47-reset">Reset</button>
      <button type="button" class="nexa-v47-save">Save</button>
    </div>

    <div class="nexa-v47-status"></div>

  </article>`;
}

function itemById(items,id){
  return (items||[]).find(x=>String(x.id)===String(id));
}

function progressFromCard(card){
  const q=normalizeQuality(
    $('[data-gear-f="quality"]',card)?.value||'green'
  );

  const t=validTierForQuality(
    q,
    normalizeTier(
      $('[data-gear-f="current_tier"]',card)?.value||'base'
    )
  );

  const stars=Math.max(
    0,
    Math.min(
      3,
      Number($('[data-gear-f="stars"]',card)?.value)||0
    )
  );

  return {
    quality:q,
    current_tier:t,
    stars
  };
}

function refreshCard(card,item){
  const p=progressFromCard(card);

  const tier=$('[data-gear-f="current_tier"]',card);

  if(tier){
    const wanted=p.current_tier;
    tier.innerHTML=tierOptions(p.quality,wanted);
    tier.value=validTierForQuality(p.quality,wanted);
  }

  const img=$('.nexa-v47-gear-art img',card);
  if(img){
    img.src=gearAsset(item,progressFromCard(card));
  }

  const star=$('.nexa-v47-stars',card);
  if(star){
    star.textContent=starsText(progressFromCard(card).stars);
  }
}

let gearItems=[];
let gearInventory=[];

async function loadGear(){
  const c=sb();
  const accountId=currentAccountId();
  const content=$('#nexa-profile-content');

  if(!content) return;

  if(!c||!accountId){
    content.innerHTML=
      '<div class="nexa-v47-empty"><b>Select an account</b>Open a planet from Account Constellation first.</div>';
    return;
  }

  content.innerHTML=
    '<div class="nexa-v47-empty"><b>Loading Chief Gear…</b>Preparing this account.</div>';

  const [li,inv]=await Promise.all([
    c.from('nexa_library_items')
      .select('*')
      .eq('is_active',true)
      .eq('is_visible',true)
      .eq('item_type','chief_gear')
      .order('sort_order')
      .order('name'),

    c.from('player_library_inventory')
      .select('*')
      .eq('player_account_id',accountId)
  ]);

  if(li.error){
    content.innerHTML=
      `<div class="nexa-v47-empty"><b>Could not load Chief Gear</b>${esc(li.error.message)}</div>`;
    return;
  }

  gearItems=li.data||[];
  gearInventory=inv.data||[];

  const map=inventoryMap(gearInventory);

  const rail=$('#nexa-player-gen-rail');
  if(rail){
    rail.innerHTML='';
  }

  $$('#nexa-profile-modal .nexa-profile-tab').forEach(b=>{
    const k=b.dataset.libraryTab||b.dataset.nexaTab;
    b.classList.toggle('active',k==='gear');
  });

  content.innerHTML=gearItems.length
    ? `<div class="nexa-v47-gear-grid">${gearItems.map(x=>cardHTML(x,map.get(String(x.id)))).join('')}</div>`
    : '<div class="nexa-v47-empty"><b>No Chief Gear entries</b>No visible Chief Gear Library items are active.</div>';
}

async function saveGearCard(card,owned=true){
  const c=sb();
  const accountId=currentAccountId();
  const status=$('.nexa-v47-status',card);

  if(!c||!accountId) return;

  if(status){
    status.textContent='Saving…';
  }

  try{
    const {data:{user}}=await c.auth.getUser();

    if(!user){
      throw new Error('Sign in required.');
    }

    const payload={
      user_id:user.id,
      player_account_id:accountId,
      library_item_id:card.dataset.gearItem,
      owned,
      progress:progressFromCard(card),
      updated_at:new Date().toISOString()
    };

    const {error}=await c
      .from('player_library_inventory')
      .upsert(payload,{
        onConflict:'player_account_id,library_item_id'
      });

    if(error){
      throw error;
    }

    if(status){
      status.textContent=owned?'Saved ✓':'Reset ✓';
      status.style.color='#77dfff';
    }

  }catch(err){
    if(status){
      status.textContent=err?.message||String(err);
      status.style.color='#ff88a8';
    }
  }
}

function resetGearCard(card){
  const q=$('[data-gear-f="quality"]',card);
  const t=$('[data-gear-f="current_tier"]',card);
  const s=$('[data-gear-f="stars"]',card);

  if(q){
    q.value='green';
  }

  if(t){
    t.innerHTML=tierOptions('green','base');
    t.value='base';
  }

  if(s){
    s.value='0';
  }

  const item=itemById(
    gearItems,
    card.dataset.gearItem
  );

  if(item){
    refreshCard(card,item);
  }

  saveGearCard(card,false);
}

document.addEventListener('click',e=>{

  const tab=e.target.closest?.(
    '#nexa-profile-modal .nexa-profile-tab'
  );

  if(tab){
    const cat=
      tab.dataset.libraryTab||
      tab.dataset.nexaTab;

    if(cat==='gear'){
      e.preventDefault();
      e.stopImmediatePropagation();
      loadGear();
      return;
    }
  }

  const save=e.target.closest?.('.nexa-v47-save');

  if(save){
    e.preventDefault();
    e.stopImmediatePropagation();

    saveGearCard(
      save.closest('.nexa-v47-gear-card')
    );

    return;
  }

  const reset=e.target.closest?.('.nexa-v47-reset');

  if(reset){
    e.preventDefault();
    e.stopImmediatePropagation();

    resetGearCard(
      reset.closest('.nexa-v47-gear-card')
    );

    return;
  }

},true);

document.addEventListener('change',e=>{

  const field=e.target.closest?.('[data-gear-f]');

  if(!field) return;

  const card=field.closest('.nexa-v47-gear-card');

  if(!card) return;

  const item=itemById(
    gearItems,
    card.dataset.gearItem
  );

  if(item){
    refreshCard(card,item);
  }

},true);

function boot(){
  installCSS();
  applyIdentity();
}

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    boot,
    {once:true}
  );
}else{
  boot();
}

window.addEventListener(
  'load',
  applyIdentity,
  {once:true}
);

window.addEventListener(
  'pageshow',
  applyIdentity
);

document.addEventListener(
  'nexa:profile-opened',
  applyIdentity
);

})();