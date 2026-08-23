/* NEXA Player Library V23 — reliable Profile renderer
   Native iOS rails. Resolves the active account from the visible Profile or Main account.
   No MutationObserver. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_PLAYER_LIBRARY_V23__) return;
window.__NEXA_PLAYER_LIBRARY_V23__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let accountId=window.NEXA_ACTIVE_ACCOUNT_ID||null;
let activeCategory='heroes',activeGeneration='all',items=[],inventory=[],renderSeq=0;
const types={
 heroes:['hero'],experts:['expert'],troops:['troop'],pets:['pet'],
 gear:['chief_gear'],charms:['chief_charm']
};

function sb(){return window.supabaseClient?.from?window.supabaseClient:(window.sb?.from?window.sb:null)}
function addCSS(){
 if($('#nexa-player-library-v23-css'))return;
 const s=document.createElement('style');s.id='nexa-player-library-v23-css';s.textContent=`
 #nexa-profile-modal .nexa-profile-tabs,#nexa-player-gen-rail{
   display:flex!important;flex-flow:row nowrap!important;gap:7px!important;width:100%!important;max-width:100%!important;
   overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important;
   scroll-snap-type:none!important;scroll-behavior:auto!important;scrollbar-width:none!important
 }
 #nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,#nexa-player-gen-rail::-webkit-scrollbar{display:none!important}
 #nexa-profile-modal .nexa-profile-tab{flex:0 0 auto!important;min-width:84px!important;white-space:nowrap!important;padding:10px 12px!important}
 #nexa-player-gen-rail{padding:9px 15px 6px!important;background:rgba(6,10,25,.82)!important}
 .nexa-player-gen{flex:0 0 auto!important;border:1px solid rgba(132,145,204,.22)!important;border-radius:999px!important;background:#0b1128!important;color:#909cc0!important;padding:8px 12px!important;font-size:10px!important;font-weight:900!important;white-space:nowrap!important}
 .nexa-player-gen.active{color:#fff!important;border-color:#a97cff!important;background:rgba(103,66,190,.28)!important}
 #nexa-profile-modal .nexa-profile-content{padding:12px!important;overflow-x:hidden!important;min-height:220px!important}
 .nexa-pl-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
 .nexa-pl-card{min-width:0!important;border:1px solid rgba(131,111,222,.27)!important;border-radius:18px!important;padding:10px!important;background:linear-gradient(150deg,rgba(19,24,53,.94),rgba(5,10,26,.98))!important}
 .nexa-pl-top{display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;gap:9px!important;align-items:center!important}
 .nexa-pl-avatar-wrap{width:54px!important;height:54px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;border:2px solid rgba(140,103,255,.72)!important;background:#101633!important;box-shadow:0 0 15px rgba(117,85,255,.18)!important}
 .nexa-pl-avatar{width:100%!important;height:100%!important;object-fit:cover!important}.nexa-pl-avatar.hero{transform:scale(1.34);transform-origin:50% 24%!important}.nexa-pl-avatar.troop{object-fit:contain!important;transform:none!important}
 .nexa-pl-fallback{font-weight:950!important;color:#cbbcff!important}.nexa-pl-name{margin:0!important;font-size:13px!important;color:#fff!important;line-height:1.08!important}.nexa-pl-meta{margin-top:4px!important;color:#8995b9!important;font-size:8px!important;line-height:1.25!important}
 .nexa-pl-fields{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;margin-top:9px!important}
 .nexa-pl-fields label{min-width:0!important;color:#8e99ba!important;font-size:8px!important;font-weight:900!important;letter-spacing:.05em!important}
 .nexa-pl-fields input,.nexa-pl-fields select{width:100%!important;min-width:0!important;margin-top:4px!important;padding:8px!important;border:1px solid rgba(127,143,204,.22)!important;border-radius:10px!important;background:#091129!important;color:#fff!important;font-size:16px!important}
 .nexa-pl-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;margin-top:9px!important}
 .nexa-pl-save,.nexa-pl-reset{min-height:32px!important;border-radius:999px!important;padding:6px 10px!important;font-weight:900!important;font-size:9px!important}
 .nexa-pl-save{border:1px solid rgba(76,194,255,.42)!important;background:rgba(11,53,83,.48)!important;color:#8ee7ff!important}.nexa-pl-reset{border:1px solid rgba(133,101,255,.50)!important;background:#10142d!important;color:#d9d0ff!important}
 .nexa-pl-guide{width:32px!important;height:32px!important;min-width:32px!important;border-radius:50%!important;display:grid!important;place-items:center!important;border:1px solid #ffbf47!important;background:#101323!important;color:#ffbf47!important;font-weight:950!important}
 .nexa-pl-status{min-height:11px!important;margin-top:5px!important;text-align:center!important;color:#77dfff!important;font-size:8px!important}
 .nexa-pl-fc{width:24px!important;height:24px!important;object-fit:contain!important;vertical-align:middle!important;margin-left:3px!important}
 .nexa-pl-empty{padding:26px 14px!important;text-align:center!important;color:#909aba!important;border:1px dashed rgba(130,143,195,.20)!important;border-radius:18px!important}.nexa-pl-empty b{display:block!important;color:#fff!important;margin-bottom:5px!important}
 #nexa-pl-guide-overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);display:grid;place-items:center;padding:16px}
 #nexa-pl-guide-overlay>div{width:min(480px,100%);max-height:84dvh;overflow:auto;border:1px solid #ffbf47;border-radius:22px;padding:18px;background:linear-gradient(155deg,#0c112c,#050713);color:#fff}
 #nexa-pl-guide-overlay p{color:#c5cada;line-height:1.5}#nexa-pl-guide-overlay button{width:100%;margin-top:12px;padding:10px;border-radius:999px;border:1px solid #ffbf47;background:#11152f;color:#fff;font-weight:900}
 @media(max-width:390px){.nexa-pl-grid{gap:7px!important}.nexa-pl-card{padding:8px!important}.nexa-pl-avatar-wrap{width:47px!important;height:47px!important}.nexa-pl-name{font-size:12px!important}}
 `;
 document.head.appendChild(s);
}
function installTabs(){
 const bar=$('#nexa-profile-modal .nexa-profile-tabs'),content=$('#nexa-profile-content');if(!bar||!content)return false;
 const map={heroes:'HEROES',experts:'EXPERTS',troops:'TROOPS',pets:'PETS'};
 for(const [k,label] of Object.entries(map)){const b=bar.querySelector(`[data-nexa-tab="${k}"]`);if(b){b.dataset.libraryTab=k;b.textContent=label}}
 for(const [k,label] of [['gear','CHIEF GEAR'],['charms','CHARMS']]){
  if(!bar.querySelector(`[data-library-tab="${k}"]`)){const b=document.createElement('button');b.type='button';b.className='nexa-profile-tab';b.dataset.libraryTab=k;b.textContent=label;bar.appendChild(b)}
 }
 if(!$('#nexa-player-gen-rail')){const r=document.createElement('nav');r.id='nexa-player-gen-rail';r.setAttribute('aria-label','Generation');content.before(r)}
 return true;
}
async function resolveAccount(preferred=null){
 if(preferred){accountId=String(preferred);window.NEXA_ACTIVE_ACCOUNT_ID=accountId;return accountId}
 const c=sb();if(!c)return accountId;
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)return accountId;
  const visibleId=String($('#nexa-profile-player-id')?.textContent||'').trim();
  let q;
  if(visibleId&&visibleId!=='—')q=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',visibleId).maybeSingle();
  if(!q?.data?.id)q=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
  if(q?.data?.id){accountId=String(q.data.id);window.NEXA_ACTIVE_ACCOUNT_ID=accountId}
 }catch(e){console.warn('Profile account resolution',e?.message||e)}
 return accountId;
}
const typeMatches=(x,cat)=>types[cat]?.includes(String(x.item_type||'').toLowerCase())||false;
function generationOf(x){const n=Number(x.generation);return Number.isFinite(n)?n:0}
function troopType(x){const s=String(x.troop_type||x.name||'').toLowerCase();return ['infantry','lancer','marksman'].find(k=>s.includes(k))||''}
function progressMap(){return new Map(inventory.map(x=>[String(x.library_item_id),x]))}
function progressOf(x){return progressMap().get(String(x.id))?.progress||{}}
function tierOf(x,p={}){const n=Number(p.tier||p.troop_tier||x.metadata?.tier||0);return n>=1&&n<=12?n:1}
function fcOf(x,p={}){const n=Number(p.fc_level||p.fire_crystal||0);return n>=1&&n<=10?n:0}
function imageFor(x,p={}){
 if(typeMatches(x,'troops')){
  const t=troopType(x),tier=tierOf(x,p),u=window.NEXA_TROOP_ASSETS?.getPortrait?.(t,tier)||window.NEXA_TROOP_PORTRAITS?.[t]?.['t'+tier];
  if(u)return [u,'troop'];
 }
 return [x.image_url||'',x.item_type==='hero'?'hero':''];
}
function meta(x,p={}){
 const a=[];
 if(typeMatches(x,'heroes')||typeMatches(x,'experts'))a.push(generationOf(x)===0?'EPIC':`GEN ${generationOf(x)}`);
 if(typeMatches(x,'troops'))a.push((troopType(x)||'TROOP').toUpperCase(),`T${tierOf(x,p)}`);
 if(x.rarity)a.push(String(x.rarity).toUpperCase());
 return a.join(' • ');
}
function fields(x,p){
 if(typeMatches(x,'heroes'))return `<label>STARS<input data-f="stars" type="number" min="0" max="5" step=".1" value="${esc(p.stars??'')}"></label><label>SKILL<input data-f="skill_level" type="number" min="0" max="5" value="${esc(p.skill_level??'')}"></label><label>WIDGET<input data-f="widget_level" type="number" min="0" max="10" value="${esc(p.widget_level??'')}"></label><label>LEVEL<input data-f="level" type="number" min="0" max="80" value="${esc(p.level??'')}"></label>`;
 if(typeMatches(x,'experts'))return `<label>AFFINITY<input data-f="affinity" type="number" min="0" max="100" value="${esc(p.affinity??p.level??'')}"></label><label>SKILL<input data-f="skill_level" type="number" min="0" max="10" value="${esc(p.skill_level??'')}"></label>`;
 if(typeMatches(x,'pets'))return `<label>LEVEL<input data-f="level" type="number" min="0" value="${esc(p.level??'')}"></label><label>SKILL<input data-f="skill_level" type="number" min="0" max="20" value="${esc(p.skill_level??'')}"></label><label>REFINE<input data-f="refinement" type="number" min="0" value="${esc(p.refinement??'')}"></label>`;
 if(typeMatches(x,'troops'))return `<label>TIER<select data-f="tier">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${tierOf(x,p)===i+1?'selected':''}>T${i+1}</option>`).join('')}</select></label><label>FC LEVEL<select data-f="fc_level"><option value="0">None</option>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${fcOf(x,p)===i+1?'selected':''}>FC ${i+1}</option>`).join('')}</select></label>`;
 if(typeMatches(x,'gear'))return `<label>TIER<input data-f="current_tier" value="${esc(p.current_tier??'')}"></label><label>STAR<input data-f="stars" type="number" min="0" max="3" value="${esc(p.stars??'')}"></label>`;
 return [1,2,3].map(n=>`<label>CHARM ${n}<input data-f="charm_${n}" type="number" min="0" max="18" value="${esc((p.charm_levels||[])[n-1]??'')}"></label>`).join('');
}
function genRail(list){
 const rail=$('#nexa-player-gen-rail');if(!rail)return;
 const gens=[...new Set(list.map(generationOf))].sort((a,b)=>a-b);
 if(activeGeneration!=='all'&&!gens.includes(Number(activeGeneration)))activeGeneration='all';
 rail.innerHTML=`<button class="nexa-player-gen ${activeGeneration==='all'?'active':''}" data-gen="all" type="button">ALL</button>`+gens.map(g=>`<button class="nexa-player-gen ${String(g)===String(activeGeneration)?'active':''}" data-gen="${g}" type="button">${g===0?'EPIC':`GEN ${g}`}</button>`).join('');
}
function cards(list){
 return `<div class="nexa-pl-grid">${list.map(x=>{const p=progressOf(x),[src,cls]=imageFor(x,p),initials=String(x.name||'?').split(/\s+/).map(v=>v[0]).join('').slice(0,2).toUpperCase(),fc=fcOf(x,p),fcsrc=fc?(window.NEXA_TROOP_ASSETS?.getFireCrystal?.(fc)||window.NEXA_FIRE_CRYSTAL_BADGES?.[String(fc)]||''):'';
 const pic=src?`<span class="nexa-pl-avatar-wrap"><img class="nexa-pl-avatar ${cls}" src="${esc(src)}" alt="${esc(x.name||'')}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="nexa-pl-fallback" hidden>${esc(initials)}</span></span>`:`<span class="nexa-pl-avatar-wrap"><span class="nexa-pl-fallback">${esc(initials)}</span></span>`;
 return `<article class="nexa-pl-card" data-library-item="${esc(x.id)}"><div class="nexa-pl-top">${pic}<div><h4 class="nexa-pl-name">${esc(x.name||'Item')}${fcsrc?` <img class="nexa-pl-fc" src="${esc(fcsrc)}" alt="FC${fc}">`:''}</h4><div class="nexa-pl-meta">${esc(meta(x,p))}</div></div></div><div class="nexa-pl-fields">${fields(x,p)}</div><div class="nexa-pl-actions"><button class="nexa-pl-reset" type="button">Reset</button><button class="nexa-pl-guide" type="button">ⓘ</button><button class="nexa-pl-save" type="button">Save</button></div><div class="nexa-pl-status"></div></article>`}).join('')}</div>`;
}
function paint(){
 installTabs();const content=$('#nexa-profile-content');if(!content)return;
 const byCat=items.filter(x=>typeMatches(x,activeCategory));genRail(byCat);
 const list=activeGeneration==='all'?byCat:byCat.filter(x=>generationOf(x)===Number(activeGeneration));
 $$('#nexa-profile-modal .nexa-profile-tab').forEach(b=>b.classList.toggle('active',(b.dataset.libraryTab||b.dataset.nexaTab)===activeCategory));
 content.innerHTML=list.length?cards(list):`<div class="nexa-pl-empty"><b>No visible entries</b>This category has no visible Library entries right now.</div>`;
}
async function load(){
 const c=sb();if(!c||!accountId)throw new Error('Select an account first.');
 const seq=++renderSeq;
 const [a,b]=await Promise.all([
  c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
  c.from('player_library_inventory').select('*').eq('player_account_id',accountId)
 ]);
 if(seq!==renderSeq)return false;if(a.error)throw a.error;if(b.error)console.warn(b.error);
 items=a.data||[];inventory=b.data||[];return true;
}
async function render(cat=activeCategory,reload=true){
 activeCategory=types[cat]?cat:'heroes';activeGeneration='all';addCSS();installTabs();
 const content=$('#nexa-profile-content');if(!content)return;
 await resolveAccount();
 if(!accountId){content.innerHTML='<div class="nexa-pl-empty"><b>Select an account</b>Open My Profile again.</div>';return}
 if(reload){content.innerHTML='<div class="nexa-pl-empty"><b>Loading Library…</b>Preparing this account.</div>';try{await load()}catch(e){content.innerHTML=`<div class="nexa-pl-empty"><b>Could not load Library</b>${esc(e?.message||e)}</div>`;return}}
 paint();
}
function read(card){
 const p={};$$('[data-f]',card).forEach(el=>{if(el.value==='')return;p[el.dataset.f]=(el.type==='number'||el.tagName==='SELECT')?Number(el.value):el.value.trim()});
 if(p.charm_1!==undefined||p.charm_2!==undefined||p.charm_3!==undefined){p.charm_levels=[p.charm_1||0,p.charm_2||0,p.charm_3||0];delete p.charm_1;delete p.charm_2;delete p.charm_3}return p;
}
async function save(card,owned=true){
 const c=sb(),st=$('.nexa-pl-status',card);if(!c||!accountId)return;if(st)st.textContent='Saving…';
 try{const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');
  const payload={user_id:user.id,player_account_id:accountId,library_item_id:card.dataset.libraryItem,owned,progress:read(card),updated_at:new Date().toISOString()};
  const {error}=await c.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});if(error)throw error;
  const i=inventory.findIndex(x=>String(x.library_item_id)===String(card.dataset.libraryItem));if(i>=0)inventory[i]={...inventory[i],...payload};else inventory.push(payload);
  if(st)st.textContent=owned?'Saved ✓':'Reset ✓';if(activeCategory==='troops')paint();
 }catch(e){if(st){st.textContent=e?.message||e;st.style.color='#ff88a8'}}
}
function showGuide(x){
 $('#nexa-pl-guide-overlay')?.remove();const d=document.createElement('div');d.id='nexa-pl-guide-overlay';
 const copy={heroes:'Set stars, skill level, widget and visual level.',experts:'Set affinity and skill level.',troops:'Choose the exact troop tier and Fire Crystal level. The portrait and Fire Crystal insignia update to match.',pets:'Set pet level, skill and refinement.',gear:'Set the current Chief Gear tier and stars.',charms:'Set the three Charm levels.'}[activeCategory]||'Update this item.';
 d.innerHTML=`<div><b style="color:#ffbf47">${esc(x.name||'Item')}</b><p>${copy}</p><button type="button">Close</button></div>`;d.onclick=e=>{if(e.target===d||e.target.tagName==='BUTTON')d.remove()};document.body.appendChild(d);
}
function itemFor(card){return items.find(x=>String(x.id)===String(card.dataset.libraryItem))}
async function scheduleOpen(preferred=null){
 if(preferred)await resolveAccount(preferred);else await resolveAccount();
 [180,520,1050].forEach((ms,i)=>setTimeout(()=>render(i?activeCategory:'heroes',i===0),ms));
}

document.addEventListener('click',e=>{
 const planet=e.target.closest?.('[data-nexa-profile],[data-account-constellation-id]');
 if(planet){scheduleOpen(planet.dataset.nexaProfile||planet.dataset.accountConstellationId);return}
 if(e.target.closest?.('#nexa-profile-launcher,#nexa-profile-launcher-section')){scheduleOpen();return}
 const tab=e.target.closest?.('#nexa-profile-modal .nexa-profile-tab');if(tab){const cat=tab.dataset.libraryTab||tab.dataset.nexaTab;if(types[cat]){e.preventDefault();e.stopImmediatePropagation();render(cat,true);return}}
 const gen=e.target.closest?.('#nexa-player-gen-rail [data-gen]');if(gen){e.preventDefault();e.stopImmediatePropagation();activeGeneration=gen.dataset.gen;paint();return}
 const saveBtn=e.target.closest?.('.nexa-pl-save');if(saveBtn){e.preventDefault();save(saveBtn.closest('.nexa-pl-card'),true);return}
 const reset=e.target.closest?.('.nexa-pl-reset');if(reset){e.preventDefault();const card=reset.closest('.nexa-pl-card');$$('input',card).forEach(x=>x.value='');$$('select',card).forEach(x=>x.selectedIndex=0);save(card,false);return}
 const guide=e.target.closest?.('.nexa-pl-guide');if(guide){e.preventDefault();const x=itemFor(guide.closest('.nexa-pl-card'));if(x)showGuide(x);return}
},true);
document.addEventListener('change',e=>{
 if(!e.target.closest?.('.nexa-pl-card')||!e.target.matches('[data-f="tier"],[data-f="fc_level"]'))return;
 const card=e.target.closest('.nexa-pl-card'),x=itemFor(card);if(!x)return;
 const p=read(card),[src,cls]=imageFor(x,p),img=$('.nexa-pl-avatar',card);if(src&&img){img.hidden=false;img.src=src;img.className=`nexa-pl-avatar ${cls}`;}
 const fc=fcOf(x,p),fcsrc=fc?(window.NEXA_TROOP_ASSETS?.getFireCrystal?.(fc)||window.NEXA_FIRE_CRYSTAL_BADGES?.[String(fc)]||''):'';
 const old=$('.nexa-pl-fc',card);if(old)old.remove();if(fcsrc){const ni=document.createElement('img');ni.className='nexa-pl-fc';ni.src=fcsrc;ni.alt='FC'+fc;$('.nexa-pl-name',card)?.append(' ',ni)}
},true);
document.addEventListener('nexa:profile-opened',e=>scheduleOpen(e.detail?.accountId));
function boot(){addCSS();installTabs()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
