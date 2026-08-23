/* NEXA Player Library V22 — native iOS rails, no observers
   Owns Profile Library rendering only. No MutationObserver and no scrollLeft restoration.
*/
(()=>{
'use strict';
if(window.__NEXA_PLAYER_LIBRARY_V22__) return;
window.__NEXA_PLAYER_LIBRARY_V22__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
let accountId=window.NEXA_ACTIVE_ACCOUNT_ID||null;
let activeCategory='heroes';
let activeGeneration='all';
let cachedItems=[];
let cachedInventory=[];
let renderToken=0;
const categoryTypes={
  heroes:['hero','heroes'],
  experts:['expert','experts'],
  troops:['troop','troops'],
  pets:['pet','pets'],
  gear:['chief_gear','gear','chiefgear'],
  charms:['chief_charm','charm','charms','chief_charms']
};

function sb(){
  return window.supabaseClient?.from ? window.supabaseClient :
         window.sb?.from ? window.sb : null;
}
function addCSS(){
  if($('#nexa-player-library-v22-css')) return;
  const s=document.createElement('style');
  s.id='nexa-player-library-v22-css';
  s.textContent=`
  #nexa-profile-modal .nexa-profile-tabs,
  #nexa-player-gen-rail{
    display:flex!important;
    flex-flow:row nowrap!important;
    width:100%!important;
    max-width:100%!important;
    overflow-x:auto!important;
    overflow-y:hidden!important;
    -webkit-overflow-scrolling:touch!important;
    touch-action:auto!important;
    scroll-snap-type:none!important;
    scroll-behavior:auto!important;
    overscroll-behavior-x:auto!important;
    scrollbar-width:none!important;
  }
  #nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,
  #nexa-player-gen-rail::-webkit-scrollbar{display:none!important}
  #nexa-profile-modal .nexa-profile-tab{
    flex:0 0 auto!important;
    min-width:84px!important;
    white-space:nowrap!important;
    padding:10px 12px!important;
  }
  #nexa-player-gen-rail{
    gap:8px!important;
    padding:10px 16px 5px!important;
    background:rgba(6,10,25,.88)!important;
  }
  .nexa-player-gen{
    flex:0 0 auto!important;
    border:1px solid rgba(132,145,204,.19)!important;
    border-radius:999px!important;
    background:#0b1128!important;
    color:#909cc0!important;
    padding:8px 12px!important;
    font-size:10px!important;
    font-weight:900!important;
    white-space:nowrap!important;
  }
  .nexa-player-gen.active{
    color:#fff!important;
    border-color:rgba(169,126,255,.72)!important;
    background:rgba(103,66,190,.28)!important;
    box-shadow:0 0 14px rgba(120,80,255,.12)!important;
  }
  #nexa-profile-modal .nexa-profile-content{padding:12px!important;overflow-x:hidden!important}
  .nexa-pl-grid{
    display:grid!important;
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:10px!important;
  }
  .nexa-pl-card{
    min-width:0!important;
    border:1px solid rgba(131,111,222,.26)!important;
    border-radius:18px!important;
    padding:11px!important;
    background:linear-gradient(150deg,rgba(19,24,53,.94),rgba(5,10,26,.98))!important;
    box-shadow:0 10px 26px rgba(0,0,0,.18)!important;
  }
  .nexa-pl-top{display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;gap:9px!important;align-items:center!important}
  .nexa-pl-avatar-wrap{
    width:54px!important;height:54px!important;border-radius:50%!important;overflow:hidden!important;
    display:grid!important;place-items:center!important;
    border:2px solid rgba(140,103,255,.72)!important;background:#101633!important;
    box-shadow:0 0 15px rgba(117,85,255,.18)!important;
  }
  .nexa-pl-avatar{width:100%!important;height:100%!important;object-fit:cover!important}
  .nexa-pl-avatar.hero{transform:scale(1.36);transform-origin:50% 24%!important}
  .nexa-pl-avatar.troop{object-fit:contain!important;border-radius:0!important}
  .nexa-pl-fallback{font-weight:950!important;color:#cbbcff!important}
  .nexa-pl-name{margin:0!important;font-size:14px!important;color:#fff!important;line-height:1.05!important}
  .nexa-pl-meta{margin-top:4px!important;color:#8995b9!important;font-size:9px!important;line-height:1.25!important}
  .nexa-pl-fields{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;margin-top:10px!important}
  .nexa-pl-fields label{min-width:0!important;color:#8e99ba!important;font-size:8px!important;font-weight:900!important;letter-spacing:.06em!important}
  .nexa-pl-fields input,.nexa-pl-fields select{
    width:100%!important;min-width:0!important;margin-top:4px!important;padding:8px!important;
    border:1px solid rgba(127,143,204,.20)!important;border-radius:10px!important;background:#091129!important;color:#fff!important;font-size:16px!important;
  }
  .nexa-pl-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;margin-top:9px!important}
  .nexa-pl-save,.nexa-pl-reset{
    min-height:32px!important;border-radius:999px!important;padding:6px 11px!important;font-weight:900!important;font-size:9px!important;
  }
  .nexa-pl-save{border:1px solid rgba(76,194,255,.42)!important;background:rgba(11,53,83,.48)!important;color:#8ee7ff!important}
  .nexa-pl-reset{border:1px solid rgba(133,101,255,.50)!important;background:#10142d!important;color:#d9d0ff!important}
  .nexa-pl-guide{
    width:32px!important;height:32px!important;min-width:32px!important;border-radius:50%!important;
    display:grid!important;place-items:center!important;border:1px solid #ffbf47!important;background:#101323!important;color:#ffbf47!important;font-weight:950!important;
  }
  .nexa-pl-status{min-height:12px!important;margin-top:5px!important;text-align:center!important;color:#77dfff!important;font-size:8px!important}
  .nexa-pl-fc{width:25px!important;height:25px!important;object-fit:contain!important;vertical-align:middle!important;margin-left:3px!important}
  .nexa-pl-empty{padding:26px 14px!important;text-align:center!important;color:#909aba!important;border:1px dashed rgba(130,143,195,.20)!important;border-radius:18px!important}
  .nexa-pl-empty b{display:block!important;color:#fff!important;margin-bottom:5px!important}
  @media(max-width:390px){.nexa-pl-grid{gap:8px!important}.nexa-pl-card{padding:9px!important}.nexa-pl-avatar-wrap{width:48px!important;height:48px!important}.nexa-pl-name{font-size:13px!important}}
  `;
  document.head.appendChild(s);
}

function installTabs(){
  const bar=$('#nexa-profile-modal .nexa-profile-tabs');
  if(!bar) return;
  const native={
    heroes:bar.querySelector('[data-nexa-tab="heroes"]'),
    experts:bar.querySelector('[data-nexa-tab="experts"]'),
    troops:bar.querySelector('[data-nexa-tab="troops"]'),
    pets:bar.querySelector('[data-nexa-tab="pets"]')
  };
  for(const [key,b] of Object.entries(native)){
    if(!b) continue;
    b.dataset.libraryTab=key;
    b.textContent=key.toUpperCase();
  }
  for(const [key,label] of [['gear','CHIEF GEAR'],['charms','CHARMS']]){
    if(bar.querySelector(`[data-library-tab="${key}"]`)) continue;
    const b=document.createElement('button');
    b.type='button';b.className='nexa-profile-tab';b.dataset.libraryTab=key;b.textContent=label;
    bar.appendChild(b);
  }
  let rail=$('#nexa-player-gen-rail');
  const content=$('#nexa-profile-content');
  if(!rail&&content){
    rail=document.createElement('nav');
    rail.id='nexa-player-gen-rail';
    rail.setAttribute('aria-label','Generation');
    content.before(rail);
  }
}

function aliasesFor(cat){return categoryTypes[cat]||categoryTypes.heroes}
function categoryMatches(item,cat){
  const t=String(item.item_type||'').toLowerCase().replace(/\s+/g,'_');
  return aliasesFor(cat).includes(t);
}
function generationOf(item){
  const raw=item.generation ?? item.gen ?? item.generation_number;
  if(raw===null||raw===undefined||raw==='') return 0;
  const n=Number(String(raw).replace(/\D/g,''));
  return Number.isFinite(n)?n:0;
}
function tierOf(item){
  const raw=item.tier ?? item.troop_tier ?? item.level;
  if(raw!==null&&raw!==undefined&&raw!==''){
    const n=Number(String(raw).replace(/\D/g,'')); if(n) return n;
  }
  const m=String(item.name||'').match(/\bT(?:IER)?\s*(\d{1,2})\b/i)||String(item.name||'').match(/\b(\d{1,2})\b/);
  return m?Number(m[1]):null;
}
function troopTypeOf(item){
  const s=String(item.troop_type||item.type||item.name||'').toLowerCase();
  if(s.includes('infantry')) return 'infantry';
  if(s.includes('lancer')) return 'lancer';
  if(s.includes('marksman')) return 'marksman';
  return '';
}
function fcOf(item,progress={}){
  const vals=[progress.fire_crystal,progress.fc_level,item.fire_crystal_level,item.fc_level,item.fire_crystal];
  for(const v of vals){const n=Number(String(v??'').replace(/\D/g,''));if(n>=1&&n<=10)return n}
  const m=String(item.name||'').match(/\bFC\s*(10|[1-9])\b/i);
  return m?Number(m[1]):null;
}
function itemImage(item,progress={}){
  if(categoryMatches(item,'troops')){
    const type=troopTypeOf(item),tier=tierOf(item);
    const u=window.NEXA_TROOP_ASSETS?.getPortrait?.(type,tier) || window.NEXA_TROOP_PORTRAITS?.[type]?.['t'+tier];
    if(u) return [u,'troop'];
  }
  return [item.image_url||item.image||'', item.item_type==='hero'?'hero':''];
}
function metaText(item){
  const parts=[];
  const g=generationOf(item);
  if(categoryMatches(item,'heroes')||categoryMatches(item,'experts')) parts.push(g===0?'EPIC':`GEN ${g}`);
  const tt=troopTypeOf(item); if(tt) parts.push(tt.toUpperCase());
  const tier=tierOf(item); if(categoryMatches(item,'troops')&&tier) parts.push(`T${tier}`);
  if(item.rarity) parts.push(String(item.rarity).toUpperCase());
  return parts.join(' • ');
}
function inventoryMap(){return new Map(cachedInventory.map(x=>[String(x.library_item_id),x]))}
function progressOf(item){return inventoryMap().get(String(item.id))?.progress||{}}

function fieldHTML(item,p){
  if(categoryMatches(item,'heroes')) return `
    <label>STARS<input data-f="stars" type="number" min="0" max="5" step=".1" value="${esc(p.stars??'')}"></label>
    <label>SKILL<input data-f="skill_level" type="number" min="0" max="5" value="${esc(p.skill_level??'')}"></label>
    <label>WIDGET<input data-f="widget_level" type="number" min="0" max="10" value="${esc(p.widget_level??'')}"></label>
    <label>LEVEL<input data-f="level" type="number" min="0" max="80" value="${esc(p.level??'')}"></label>`;
  if(categoryMatches(item,'experts')) return `
    <label>AFFINITY<input data-f="affinity" type="number" min="0" max="100" value="${esc(p.affinity??p.level??'')}"></label>
    <label>SKILL<input data-f="skill_level" type="number" min="0" max="10" value="${esc(p.skill_level??'')}"></label>`;
  if(categoryMatches(item,'pets')) return `
    <label>LEVEL<input data-f="level" type="number" min="0" value="${esc(p.level??'')}"></label>
    <label>SKILL<input data-f="skill_level" type="number" min="0" max="20" value="${esc(p.skill_level??'')}"></label>
    <label>REFINE<input data-f="refinement" type="number" min="0" value="${esc(p.refinement??'')}"></label>`;
  if(categoryMatches(item,'troops')) return `
    <label>TIER<input data-f="tier" type="number" min="1" max="12" value="${esc(p.tier??tierOf(item)??'')}"></label>
    <label>FC LEVEL<input data-f="fc_level" type="number" min="0" max="10" value="${esc(p.fc_level??'')}"></label>`;
  if(categoryMatches(item,'gear')) return `
    <label>TIER<input data-f="current_tier" value="${esc(p.current_tier??'')}"></label>
    <label>STAR<input data-f="stars" type="number" min="0" max="3" value="${esc(p.stars??'')}"></label>`;
  return [1,2,3].map(n=>`<label>CHARM ${n}<input data-f="charm_${n}" type="number" min="0" max="18" value="${esc((p.charm_levels||[])[n-1]??'')}"></label>`).join('');
}

function guideBody(item){
  const cat=activeCategory;
  const meta=metaText(item);
  const specific={
    heroes:'Record this hero’s current stars, skill level, widget level and visual level for this account.',
    experts:'Record the Expert affinity and skill level used by NEXA recommendations.',
    troops:'Record this troop tier and Fire Crystal level. The exact troop portrait and Fire Crystal insignia are linked to the selected level.',
    pets:'Record the pet and its skill/refinement level for deployment and recommendation calculations.',
    gear:'Record the current Chief Gear tier and stars for this piece.',
    charms:'Record the three Charm levels for this Chief Gear piece.'
  }[cat]||'Record the current values for this item.';
  return `<b>${esc(item.name||'Item')}</b>${meta?`<br><span>${esc(meta)}</span>`:''}<p>${specific}</p>`;
}
function showGuide(title,body){
  $('#nexa-pl-guide-overlay')?.remove();
  const d=document.createElement('div');
  d.id='nexa-pl-guide-overlay';
  d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);display:grid;place-items:center;padding:16px';
  d.innerHTML=`<section style="width:min(500px,100%);max-height:82dvh;overflow:auto;border:1px solid #ffbf47;border-radius:22px;padding:18px;background:linear-gradient(155deg,#0c112b,#050713);color:#fff"><small style="color:#ffbf47;font-weight:950;letter-spacing:.15em">GUIDE</small><h2 style="margin:6px 0 10px">${esc(title)}</h2><div style="color:#c3c7da;line-height:1.5;font-size:13px">${body}</div><button type="button" style="width:100%;margin-top:14px;padding:10px;border-radius:999px;border:1px solid #ffbf47;background:#11152f;color:#fff;font-weight:900">Close</button></section>`;
  d.querySelector('button').onclick=()=>d.remove();
  d.addEventListener('click',e=>{if(e.target===d)d.remove()});
  document.body.appendChild(d);
}

async function loadData(){
  const c=sb(); if(!c||!accountId) return false;
  const token=++renderToken;
  const [li,inv]=await Promise.all([
    c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
    c.from('player_library_inventory').select('*').eq('player_account_id',accountId)
  ]);
  if(token!==renderToken) return false;
  if(li.error) throw li.error;
  cachedItems=li.data||[];
  cachedInventory=inv.data||[];
  return true;
}

function generationButtons(items){
  const rail=$('#nexa-player-gen-rail'); if(!rail) return;
  const gens=[...new Set(items.map(generationOf))].sort((a,b)=>a-b);
  if(activeGeneration!=='all'&&!gens.includes(Number(activeGeneration))) activeGeneration='all';
  rail.innerHTML=`<button type="button" class="nexa-player-gen ${activeGeneration==='all'?'active':''}" data-gen="all">ALL</button>`+
    gens.map(g=>`<button type="button" class="nexa-player-gen ${String(activeGeneration)===String(g)?'active':''}" data-gen="${g}">${g===0?'EPIC':`GEN ${g}`}</button>`).join('');
}

function cardsHTML(items){
  const map=inventoryMap();
  return `<div class="nexa-pl-grid">${items.map(item=>{
    const row=map.get(String(item.id)),p=row?.progress||{};
    const [img,cls]=itemImage(item,p);
    const initials=String(item.name||'?').split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const image=img?`<span class="nexa-pl-avatar-wrap"><img class="nexa-pl-avatar ${cls}" src="${esc(img)}" alt="${esc(item.name||'')}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="nexa-pl-fallback" hidden>${esc(initials)}</span></span>`:`<span class="nexa-pl-avatar-wrap"><span class="nexa-pl-fallback">${esc(initials)}</span></span>`;
    const fc=fcOf(item,p);
    const fcImg=fc?(window.NEXA_TROOP_ASSETS?.getFireCrystal?.(fc)||window.NEXA_FIRE_CRYSTAL_BADGES?.[String(fc)]||''):'';
    return `<article class="nexa-pl-card" data-library-item="${esc(item.id)}">
      <div class="nexa-pl-top">${image}<div><h4 class="nexa-pl-name">${esc(item.name||'Item')}${fcImg?` <img class="nexa-pl-fc" src="${esc(fcImg)}" alt="FC${fc}">`:''}</h4><div class="nexa-pl-meta">${esc(metaText(item))}</div></div></div>
      <div class="nexa-pl-fields">${fieldHTML(item,p)}</div>
      <div class="nexa-pl-actions"><button class="nexa-pl-reset" type="button">Reset</button><button class="nexa-pl-guide" type="button" aria-label="Item Guide">ⓘ</button><button class="nexa-pl-save" type="button">Save</button></div>
      <div class="nexa-pl-status"></div>
    </article>`;
  }).join('')}</div>`;
}

function paintFromCache(){
  installTabs();
  const content=$('#nexa-profile-content'); if(!content) return;
  const items=cachedItems.filter(x=>categoryMatches(x,activeCategory));
  generationButtons(items);
  const filtered=activeGeneration==='all'?items:items.filter(x=>generationOf(x)===Number(activeGeneration));
  $$('#nexa-profile-modal .nexa-profile-tab').forEach(b=>b.classList.toggle('active',b.dataset.libraryTab===activeCategory));
  content.innerHTML=filtered.length?cardsHTML(filtered):`<div class="nexa-pl-empty"><b>No visible entries</b>This category/generation has no visible Library entries right now.</div>`;
}
async function render(category=activeCategory,{reload=true}={}){
  activeCategory=category||'heroes';
  activeGeneration='all';
  installTabs();
  const content=$('#nexa-profile-content'); if(!content) return;
  if(!accountId){
    content.innerHTML='<div class="nexa-pl-empty"><b>Select an account</b>Open a planet from Account Constellation first.</div>';
    return;
  }
  if(reload){
    content.innerHTML='<div class="nexa-pl-empty"><b>Loading Library…</b>Preparing this account.</div>';
    try{await loadData()}catch(err){content.innerHTML=`<div class="nexa-pl-empty"><b>Could not load Library</b>${esc(err?.message||err)}</div>`;return}
  }
  paintFromCache();
}
function readProgress(card){
  const p={};
  $$('[data-f]',card).forEach(el=>{
    if(el.value==='') return;
    p[el.dataset.f]=el.type==='number'?Number(el.value):el.value.trim();
  });
  if(p.charm_1!==undefined||p.charm_2!==undefined||p.charm_3!==undefined){
    p.charm_levels=[p.charm_1||0,p.charm_2||0,p.charm_3||0];
    delete p.charm_1;delete p.charm_2;delete p.charm_3;
  }
  return p;
}
async function saveCard(card,owned=true){
  const c=sb(); if(!c||!accountId) return;
  const status=$('.nexa-pl-status',card); if(status) status.textContent='Saving…';
  try{
    const {data:{user}}=await c.auth.getUser(); if(!user) throw new Error('Sign in required.');
    const payload={user_id:user.id,player_account_id:accountId,library_item_id:card.dataset.libraryItem,owned,progress:readProgress(card),updated_at:new Date().toISOString()};
    const {error}=await c.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});
    if(error) throw error;
    const i=cachedInventory.findIndex(x=>String(x.library_item_id)===String(card.dataset.libraryItem));
    if(i>=0) cachedInventory[i]={...cachedInventory[i],...payload}; else cachedInventory.push(payload);
    if(status){status.textContent=owned?'Saved ✓':'Reset ✓';status.style.color='#77dfff'}
    if(activeCategory==='troops') setTimeout(paintFromCache,120);
  }catch(err){if(status){status.textContent=err?.message||String(err);status.style.color='#ff88a8'}}
}
async function resetCard(card){
  $$('input,select,textarea',card).forEach(el=>{
    if(el.tagName==='SELECT') el.selectedIndex=0;
    else if(el.type==='number') el.value='';
    else if(el.type!=='file') el.value='';
  });
  await saveCard(card,false);
}
function itemByCard(card){return cachedItems.find(x=>String(x.id)===String(card.dataset.libraryItem))}

function selectAccount(id){
  if(!id) return;
  accountId=String(id);
  window.NEXA_ACTIVE_ACCOUNT_ID=accountId;
}
function boot(){
  addCSS();installTabs();
}
document.addEventListener('click',e=>{
  const planet=e.target.closest?.('[data-nexa-profile],[data-account-constellation-id]');
  if(planet){
    selectAccount(planet.dataset.nexaProfile||planet.dataset.accountConstellationId);
    setTimeout(()=>render('heroes'),180);
    return;
  }
  const tab=e.target.closest?.('#nexa-profile-modal .nexa-profile-tab');
  if(tab){
    const cat=tab.dataset.libraryTab||tab.dataset.nexaTab;
    if(cat&&categoryTypes[cat]){
      e.preventDefault();e.stopImmediatePropagation();
      render(cat);
      return;
    }
  }
  const gen=e.target.closest?.('#nexa-player-gen-rail [data-gen]');
  if(gen){
    e.preventDefault();e.stopPropagation();
    activeGeneration=gen.dataset.gen;
    paintFromCache();
    return;
  }
  const save=e.target.closest?.('.nexa-pl-save');
  if(save){e.preventDefault();e.stopPropagation();saveCard(save.closest('.nexa-pl-card'));return}
  const reset=e.target.closest?.('.nexa-pl-reset');
  if(reset){e.preventDefault();e.stopPropagation();resetCard(reset.closest('.nexa-pl-card'));return}
  const guide=e.target.closest?.('.nexa-pl-guide');
  if(guide){
    e.preventDefault();e.stopPropagation();
    const item=itemByCard(guide.closest('.nexa-pl-card'));
    if(item) showGuide(item.name||'Item Guide',guideBody(item));
    return;
  }
},true);

document.addEventListener('nexa:profile-opened',e=>{
  selectAccount(e.detail?.accountId);
  setTimeout(()=>render(activeCategory),80);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
