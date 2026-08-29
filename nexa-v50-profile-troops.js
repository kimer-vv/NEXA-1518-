/* NEXA V50.4 — TROOP GRID SAVE SYNC + FIRE CRYSTAL BADGE FIX
   Support module for stable Profile owner V33.6.
   Does NOT take Profile ownership.
   Restores:
   - Fire Crystal FC1–FC10 visual badges on Troop cards
   - Complete Active Troop Summary for Infantry, Lancer, Marksman
   - Verified T1/T7/FC passive-skill summary
   - T12 skill status without inventing unverified Lancer/Marksman percentages
   No MutationObserver. No polling. No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V504_TROOP_SUMMARY__) return;
window.__NEXA_V504_TROOP_SUMMARY__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

let localSb=null;
let inventoryByItem=new Map();
let profileFC=0;
let accountId='';

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
function parseFC(raw){
  const m=String(raw||'').match(/fc\s*(\d+)/i);
  return m?clamp(Number(m[1]),1,10):0;
}
function activeAccountId(){
  return String(window.NEXA_ACTIVE_ACCOUNT_ID||localStorage.getItem('nexa_active_account_v49')||'');
}
async function loadTroopState(){
  const c=sb();
  const next=activeAccountId();
  if(!c||!next)return;
  accountId=next;
  try{
    const [acct,inv]=await Promise.all([
      c.from('player_accounts').select('furnace_level').eq('id',accountId).maybeSingle(),
      c.from('player_library_inventory').select('library_item_id,progress').eq('player_account_id',accountId)
    ]);
    profileFC=parseFC(acct?.data?.furnace_level||'');
    inventoryByItem=new Map((inv?.data||[]).map(x=>[String(x.library_item_id),x.progress||{}]));
  }catch(e){
    console.warn('NEXA V50.2 troop state',e?.message||e);
  }
}

const BASE={
  infantry:{
    1:[3,4,1,6,1],2:[4,5,2,7,2],3:[6,6,3,8,3],4:[9,7,4,9,4],5:[13,8,5,10,5],
    6:[20,9,6,11,6],7:[28,10,7,12,7],8:[38,11,8,13,8],9:[50,12,9,14,9],
    10:[66,13,10,15,10],11:[80,15,12,17,12]
  },
  lancer:{
    1:[3,2,4,2,5],2:[4,3,5,3,6],3:[5,4,6,4,7],4:[9,5,7,5,8],5:[13,6,8,6,9],
    6:[20,7,9,7,10],7:[28,8,10,8,11],8:[38,9,11,9,12],9:[50,10,12,10,13],
    10:[66,11,13,11,14],11:[80,13,15,13,16]
  },
  marksman:{
    1:[3,1,5,1,5],2:[4,2,6,2,7],3:[5,3,7,3,8],4:[9,4,8,4,9],5:[13,5,9,5,10],
    6:[20,6,10,6,11],7:[28,7,11,7,12],8:[38,8,12,8,13],9:[50,9,13,9,14],
    10:[66,10,14,10,15],11:[80,12,16,12,17]
  }
};
const FC10={
  infantry:{
    0:[66,13,10,15,10],1:[71,14,11,16,10],2:[76,16,12,17,11],3:[83,17,13,18,12],
    4:[88,18,13,19,13],5:[94,20,14,20,13],6:[99,21,14,21,13],7:[104,22,15,22,14],
    8:[110,23,15,23,15],9:[115,25,16,24,15],10:[121,26,18,25,16]
  },
  lancer:{
    0:[66,11,13,11,14],1:[71,12,14,11,15],2:[76,13,16,12,16],3:[83,14,17,13,17],
    4:[88,14,18,13,18],5:[94,15,20,14,19],6:[99,15,21,14,20],7:[104,16,22,15,21],
    8:[110,17,23,15,22],9:[115,17,25,16,23],10:[121,19,26,17,24]
  },
  marksman:{
    0:[66,10,14,10,15],1:[71,11,15,11,16],2:[76,12,17,12,17],3:[83,13,18,13,18],
    4:[88,14,19,13,19],5:[94,14,21,14,20],6:[99,15,22,14,21],7:[104,15,23,15,22],
    8:[110,16,24,15,23],9:[115,17,26,16,24],10:[121,19,27,17,25]
  }
};
const FC11={
  infantry:{
    0:[80,15,12,17,12],1:[86,16,13,18,12],2:[92,17,14,19,13],3:[100,18,15,20,14],
    4:[106,19,15,21,15],5:[114,22,16,22,15],6:[120,23,17,23,16],7:[126,24,17,24,16],
    8:[135,25,18,25,17],9:[141,27,18,26,17],10:[148,28,19,27,18]
  },
  lancer:{
    0:[80,13,15,13,16],1:[86,14,16,13,17],2:[92,15,18,14,18],3:[100,16,19,15,19],
    4:[106,16,20,15,20],5:[114,17,22,16,21],6:[120,18,23,16,22],7:[126,18,24,17,23],
    8:[135,19,25,17,24],9:[141,19,27,18,25],10:[148,21,28,20,26]
  },
  marksman:{
    0:[80,12,16,12,17],1:[86,13,17,13,18],2:[92,14,19,14,19],3:[100,15,20,15,20],
    4:[106,16,21,15,21],5:[114,16,23,16,22],6:[120,17,24,16,23],7:[126,18,25,17,24],
    8:[135,19,26,18,25],9:[141,19,28,18,26],10:[148,21,30,20,27]
  }
};
const T12={
  infantry:[178,31,22,30,21],
  lancer:[178,24,31,23,29],
  marksman:[178,24,33,23,30]
};

const BUFFS={
  infantry:{
    t1:['Master Brawler','Attack damage to Lancers +10%'],
    t7:['Bands of Steel','Defense against Lancers +10%'],
    fc3:['Crystal Shield I','25% chance to offset 36 damage'],
    fc5:['Crystal Shield II','37.5% chance to offset 36 damage'],
    fc8:['Body of Light I','Infantry Defense +4%; when Crystal Shield triggers, extra 10% damage reduction'],
    fc10:['Body of Light II','Infantry Defense +6%; when Crystal Shield triggers, extra 15% damage reduction']
  },
  lancer:{
    t1:['Charge','Attack damage to Marksmen +10%'],
    t7:['Ambusher','20% chance to strike Marksmen behind Infantry'],
    fc3:['Crystal Lance I','10% chance to deal double damage'],
    fc5:['Crystal Lance II','15% chance to deal double damage'],
    fc8:['Incandescent Field I','10% chance to take half damage when attacked'],
    fc10:['Incandescent Field II','15% chance to take half damage when attacked']
  },
  marksman:{
    t1:['Ranged Strike','Attack damage to Infantry +10%'],
    t7:['Volley','10% chance to strike twice'],
    fc3:['Crystal Gunpowder I','20% chance to deal 50% more damage'],
    fc5:['Crystal Gunpowder II','30% chance to deal 50% more damage'],
    fc8:['Flame Charge I','Basic attack +4%; +25% extra damage when Crystal Gunpowder is active'],
    fc10:['Flame Charge II','Basic attack +6%; +37.5% extra damage when Crystal Gunpowder is active']
  }
};

function troopTypeFromTitle(){
  const s=String($('#nexa-v33-detail .v33-title h3')?.textContent||'').toLowerCase();
  if(s.includes('infantry'))return 'infantry';
  if(s.includes('lancer'))return 'lancer';
  if(s.includes('marksman'))return 'marksman';
  return '';
}
function activeNumber(selector,fallback=0){
  const el=$(`${selector}.active`,$('#nexa-v33-detail'));
  if(!el)return fallback;
  const txt=String(el.textContent||'').match(/\d+/);
  return txt?Number(txt[0]):fallback;
}
function stateFromDetail(){
  const root=$('#nexa-v33-detail');
  if(!root?.classList.contains('open'))return null;
  const type=troopTypeFromTitle();
  if(!type)return null;
  const tier=activeNumber('[data-v33-troop-tier]',1);
  const fc=activeNumber('[data-v33-troop-fc]',profileFC);
  const t11=!!$('[data-v33-t11="1"].active',root);
  const t12=!!$('[data-v33-t12="1"].active',root);
  const skill=activeNumber('[data-v33-troop-skill]',0);
  return {type,tier,fc,t11,t12,skill};
}
function statsFor(s){
  if(s.t12)return T12[s.type];
  if(s.t11)return FC11[s.type]?.[s.fc]||BASE[s.type]?.[11]||null;
  if(s.tier===10&&s.fc)return FC10[s.type]?.[s.fc]||BASE[s.type]?.[10]||null;
  return BASE[s.type]?.[s.tier]||null;
}
function currentPassiveBuffs(s){
  const b=BUFFS[s.type],out=[];
  if(!b)return out;
  if(s.tier>=1)out.push(b.t1);
  if(s.tier>=7)out.push(b.t7);

  // FC5 replaces FC3; FC10 replaces FC8. Do not double-count I + II as separate buffs.
  if(s.fc>=5)out.push(b.fc5);
  else if(s.fc>=3)out.push(b.fc3);

  if(s.fc>=10)out.push(b.fc10);
  else if(s.fc>=8)out.push(b.fc8);

  if(s.t12&&s.skill){
    if(s.type==='infantry'){
      const val=[0,.6,1.2,1.8][clamp(s.skill,0,3)];
      out.push(['Indomitable Wall',`${val}% enemy damage reduction for 5 turns • Rally/Garrison only • stacks from up to 8 players`]);
    }else if(s.type==='lancer'){
      out.push(['Meridian Phalanx',`Skill Lv.${s.skill} active • Rally/Garrison only • reduces Infantry damage received and increases Marksman damage dealt • stacks from up to 8 players`]);
    }else{
      out.push(['Starfire',`Skill Lv.${s.skill} active • Rally/Garrison only • increases Marksman damage every 5 turns • stacks from up to 8 players`]);
    }
  }
  return out;
}

function ensureCSS(){
  if($('#nexa-v502-css'))return;
  const st=document.createElement('style');
  st.id='nexa-v502-css';
  st.textContent=`
    #v33-grid .v33-item[data-type="troop"] .v33-planet > img.nexa-v502-fc-badge{
      position:absolute!important;
      right:-4px!important;
      bottom:-4px!important;
      z-index:12!important;
      width:27px!important;
      height:27px!important;
      max-width:27px!important;
      max-height:27px!important;
      min-width:0!important;
      min-height:0!important;
      object-fit:contain!important;
      object-position:center!important;
      border-radius:0!important;
      padding:0!important;
      margin:0!important;
      background:transparent!important;
      transform:none!important;
      filter:drop-shadow(0 0 5px rgba(112,215,255,.62))!important;
      pointer-events:none!important
    }
    .nexa-v502-fc-label{
      display:none!important
    }
    .nexa-v502-buffs{display:grid;gap:7px;margin-top:9px}
    .nexa-v502-buff{
      padding:9px 10px;border-radius:11px;border:1px solid rgba(169,105,255,.27);
      background:rgba(86,43,149,.14);color:#dcd5f5;font-size:9px;line-height:1.4
    }
    .nexa-v502-buff b{display:block;color:#fff;margin-bottom:2px}
    .nexa-v502-note{
      margin-top:8px;color:#7f8dab;font-size:7.5px;line-height:1.42
    }
  `;
  document.head.appendChild(st);
}
function decorateGrid(){
  $$('[data-v33-item][data-type="troop"]').forEach(btn=>{
    const planet=$('.v33-planet',btn);
    if(!planet)return;
    planet.querySelectorAll('.nexa-v502-fc-badge,.nexa-v502-fc-label').forEach(x=>x.remove());

    const p=inventoryByItem.get(String(btn.dataset.v33Item))||{};
    const tier=clamp(Number(p.tier||1),1,12);
    const name=String($('b',btn)?.textContent||'').toLowerCase();
    const type=name.includes('infantry')?'infantry':name.includes('lancer')?'lancer':'marksman';

    // Keep the OUTER troop portrait synced with the saved tier.
    const portrait=window.NEXA_TROOP_ASSETS?.getPortrait?.(type,tier)
      ||window.NEXA_TROOP_PORTRAITS?.[type]?.['t'+tier]
      ||'';
    const mainImg=Array.from(planet.querySelectorAll('img')).find(x=>!x.classList.contains('nexa-v502-fc-badge'));
    if(mainImg&&portrait&&mainImg.getAttribute('src')!==portrait)mainImg.setAttribute('src',portrait);

    const fc=clamp(Number(p.fc_level??profileFC),0,10);
    if(!fc)return;
    const n=String(fc).padStart(2,'0');
    const img=document.createElement('img');
    img.className='nexa-v502-fc-badge';
    img.src=`/assets/nexa/fire-crystal/Fire_Crystal_${n}.png`;
    img.alt=`Fire Crystal ${fc}`;
    const label=document.createElement('span');
    label.className='nexa-v502-fc-label';
    label.textContent=`FC${fc}`;
    planet.append(img,label);
  });
}
function decorateSummary(){
  const s=stateFromDetail();
  if(!s)return;
  const sections=$$('#nexa-v33-detail .v33-section');
  const summary=sections.find(sec=>String($('.v33-kicker span',sec)?.textContent||'').trim().toUpperCase()==='ACTIVE TROOP SUMMARY');
  if(!summary)return;
  const kicker=$('.v33-kicker',summary);
  if(!kicker)return;
  const stats=statsFor(s);
  const buffs=currentPassiveBuffs(s);
  Array.from(summary.children).forEach(ch=>{if(ch!==kicker)ch.remove()});
  if(stats){
    const table=document.createElement('div');
    table.className='v33-stat-table';
    const labels=['Power','Defense','Attack','Health','Lethality'];
    table.innerHTML=labels.map((x,i)=>`<div><small>${x}</small><b>${stats[i]}</b></div>`).join('');
    summary.appendChild(table);
  }
  if(buffs.length){
    const list=document.createElement('div');
    list.className='nexa-v502-buffs';
    list.innerHTML=buffs.map(([name,desc])=>`<div class="nexa-v502-buff"><b>${name}</b>${desc}</div>`).join('');
    summary.appendChild(list);
  }
  const note=document.createElement('div');
  note.className='nexa-v502-note';
  note.textContent='FC II skills replace their FC I version; they are not added together as separate buffs. T12 gateway skills stack across eligible Rally/Garrison players, not by adding Lv.1 + Lv.2 + Lv.3 on the same player.';
  summary.appendChild(note);
}
function refreshVisuals(){
  ensureCSS();
  decorateGrid();
  decorateSummary();
}
async function refreshAll(){
  await loadTroopState();
  refreshVisuals();
}

document.addEventListener('click',e=>{
  const saveBtn=e.target.closest?.('[data-v33-save]');
  if(saveBtn){
    // V33 saves asynchronously, then repaints its grid. Re-read Supabase after the save
    // and repaint only the troop portrait/badge so the outside card matches the saved detail.
    setTimeout(refreshAll,350);
    setTimeout(refreshAll,900);
  }
  if(e.target.closest?.(
    '[data-v33-item],[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],[data-v33-troop-skill],[data-v33-reset],[data-v33-prev],[data-v33-next],[data-v33-cat]'
  )){
    queueMicrotask(refreshVisuals);
  }
},true);

window.addEventListener('nexa:account-changed',()=>{inventoryByItem.clear();profileFC=0;accountId='';refreshAll()});
window.addEventListener('pageshow',()=>refreshAll());

function boot(){ensureCSS();refreshAll()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
