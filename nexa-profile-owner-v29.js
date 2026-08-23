/* NEXA Profile Owner V29 — clean Profile workspace
   Purpose: visually and functionally own My Profile without relying on legacy player-library renderers.
   No MutationObserver. No manual scrollLeft. Mobile-first.
*/
(()=>{
'use strict';
if(window.__NEXA_PROFILE_OWNER__) return;
window.__NEXA_PROFILE_OWNER__='V29';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const TYPES={heroes:['hero'],experts:['expert'],troops:['troop'],pets:['pet'],gear:['chief_gear'],charms:['chief_charm']};
const LABELS={heroes:'HEROES',experts:'EXPERTS',troops:'TROOPS',pets:'PETS',gear:'CHIEF GEAR',charms:'CHARMS'};
let localSb=null,accountId=null,active='heroes',generation='all',items=[],inventory=[],renderToken=0;

function sb(){
 if(window.supabaseClient?.from)return window.supabaseClient;
 if(window.sb?.from)return window.sb;
 if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient('https://dfxcxboxrkfmrnsgpyin.supabase.co','sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-');
 return localSb;
}
function isType(x,cat){return TYPES[cat]?.includes(String(x?.item_type||'').toLowerCase())||false}
function genOf(x){const n=Number(x?.generation);return Number.isFinite(n)?n:0}
function troopType(x){const s=String(x?.troop_type||x?.name||'').toLowerCase();return ['infantry','lancer','marksman'].find(k=>s.includes(k))||''}
function invMap(){return new Map(inventory.map(x=>[String(x.library_item_id),x]))}
function invFor(x){return invMap().get(String(x.id))||null}
function progress(x){return invFor(x)?.progress||{}}
function owned(x){return invFor(x)?.owned===true}
function tierOf(x,p={}){const n=Number(p.tier||p.troop_tier||x?.metadata?.tier||1);return n>=1&&n<=12?n:1}
function fcOf(p={}){const n=Number(p.fc_level||p.fire_crystal||0);return n>=1&&n<=10?n:0}
function imgFor(x,p={}){
 if(isType(x,'troops')){
  const t=troopType(x),tier=tierOf(x,p);
  const u=window.NEXA_TROOP_ASSETS?.getPortrait?.(t,tier)||window.NEXA_TROOP_PORTRAITS?.[t]?.['t'+tier];
  if(u)return u;
 }
 return x?.image_url||'';
}
function initials(name){return String(name||'?').split(/\s+/).filter(Boolean).map(v=>v[0]).join('').slice(0,2).toUpperCase()}
function meta(x,p={}){
 const a=[];
 if(isType(x,'heroes')||isType(x,'experts'))a.push(genOf(x)===0?'EPIC':`GEN ${genOf(x)}`);
 if(isType(x,'troops'))a.push((troopType(x)||'TROOP').toUpperCase(),`T${tierOf(x,p)}`);
 if(x?.rarity)a.push(String(x.rarity).toUpperCase());
 return a.join(' • ');
}

function addCSS(){
 if($('#nexa-p29-css'))return;
 const st=document.createElement('style');st.id='nexa-p29-css';st.textContent=`
 #nexa-profile-modal.nexa-p29-owned .nexa-profile-tabs,
 #nexa-profile-modal.nexa-p29-owned #nexa-profile-content,
 #nexa-profile-modal.nexa-p29-owned .nexa-profile-content,
 #nexa-profile-modal.nexa-p29-owned #nexa-player-gen-rail,
 #nexa-profile-modal.nexa-p29-owned #nexa-pl-owned-root{display:none!important}
 #nexa-p29-shell{display:block!important;width:100%!important;min-width:0!important;padding:0 14px 22px!important;box-sizing:border-box!important}
 #nexa-p29-tabs,#nexa-p29-gens{display:flex!important;gap:8px!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;padding:10px 0!important;touch-action:auto!important}
 #nexa-p29-tabs::-webkit-scrollbar,#nexa-p29-gens::-webkit-scrollbar{display:none!important}
 .nexa-p29-tab,.nexa-p29-gen{flex:0 0 auto!important;white-space:nowrap!important;border:1px solid rgba(130,118,215,.28)!important;border-radius:999px!important;background:#0a1026!important;color:#8e98bb!important;font-weight:900!important;letter-spacing:.05em!important}
 .nexa-p29-tab{padding:9px 12px!important;font-size:10px!important}.nexa-p29-gen{padding:7px 11px!important;font-size:9px!important}
 .nexa-p29-tab.active,.nexa-p29-gen.active{color:#fff!important;border-color:#966cff!important;background:linear-gradient(135deg,rgba(111,74,220,.38),rgba(45,70,160,.22))!important;box-shadow:0 0 18px rgba(119,82,255,.15)!important}
 #nexa-p29-gens:empty{display:none!important}
 #nexa-p29-status{min-height:18px!important;color:#7adfff!important;font-size:10px!important;padding:2px 2px 6px!important}
 #nexa-p29-grid{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;align-items:start!important}
 .nexa-p29-card{display:block!important;border:1px solid rgba(128,108,217,.28)!important;border-radius:20px!important;background:linear-gradient(150deg,rgba(17,23,52,.97),rgba(6,10,27,.99))!important;overflow:hidden!important;box-shadow:0 12px 34px rgba(0,0,0,.14)!important}
 .nexa-p29-card[open]{border-color:rgba(151,111,255,.56)!important;box-shadow:0 0 26px rgba(102,72,224,.12)!important}
 .nexa-p29-card>summary{list-style:none!important;display:grid!important;grid-template-columns:72px minmax(0,1fr) auto!important;gap:11px!important;align-items:center!important;padding:11px!important;cursor:pointer!important;min-width:0!important}
 .nexa-p29-card>summary::-webkit-details-marker{display:none!important}
 .nexa-p29-avatar{width:72px!important;height:72px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;border:2px solid rgba(139,99,255,.72)!important;background:radial-gradient(circle at 40% 30%,rgba(98,76,207,.22),#0a112b 72%)!important;box-shadow:0 0 17px rgba(119,85,255,.18)!important}
 .nexa-p29-avatar img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.nexa-p29-avatar img.troop{object-fit:contain!important}.nexa-p29-avatar img.hero{transform:scale(1.27)!important;transform-origin:50% 25%!important}
 .nexa-p29-fallback{font-size:18px!important;font-weight:950!important;color:#d6ccff!important}
 .nexa-p29-title{min-width:0!important}.nexa-p29-title h4{margin:0!important;color:#fff!important;font-size:16px!important;line-height:1.08!important}.nexa-p29-title small{display:block!important;margin-top:5px!important;color:#8691b2!important;font-size:9px!important;letter-spacing:.04em!important}
 .nexa-p29-owned{border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;padding:6px 8px!important;font-size:8px!important;font-weight:950!important;color:#7f8bab!important;background:#0a1128!important;white-space:nowrap!important}.nexa-p29-owned.yes{color:#74f0bb!important;border-color:rgba(58,221,156,.34)!important;background:rgba(18,92,67,.18)!important}
 .nexa-p29-config{border-top:1px solid rgba(255,255,255,.075)!important;padding:11px!important;display:grid!important;gap:10px!important}
 .nexa-p29-field{display:grid!important;gap:6px!important}.nexa-p29-field>span{color:#929dbc!important;font-size:9px!important;font-weight:950!important;letter-spacing:.08em!important}
 .nexa-p29-chips{display:flex!important;gap:6px!important;overflow-x:auto!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;padding-bottom:2px!important}.nexa-p29-chips::-webkit-scrollbar{display:none!important}
 .nexa-p29-chip{flex:0 0 auto!important;min-width:34px!important;border:1px solid rgba(126,139,194,.24)!important;border-radius:10px!important;background:#091128!important;color:#9ba5c6!important;padding:7px 8px!important;font-size:10px!important;font-weight:900!important}.nexa-p29-chip.active{color:#fff!important;border-color:#8e6cff!important;background:rgba(111,72,211,.34)!important}
 .nexa-p29-input{width:100%!important;box-sizing:border-box!important;border:1px solid rgba(127,143,204,.22)!important;border-radius:12px!important;background:#081129!important;color:#fff!important;padding:10px 11px!important;font-size:16px!important}
 .nexa-p29-actions{display:flex!important;gap:8px!important;justify-content:flex-end!important;align-items:center!important;flex-wrap:wrap!important;padding-top:2px!important}.nexa-p29-actions button{border-radius:999px!important;padding:8px 12px!important;font-size:10px!important;font-weight:950!important}.nexa-p29-remove{border:1px solid rgba(255,105,153,.32)!important;background:#151126!important;color:#ff9fbe!important}.nexa-p29-save{border:1px solid rgba(74,205,255,.42)!important;background:rgba(15,78,109,.28)!important;color:#88e8ff!important}
 .nexa-p29-card-status{min-height:12px!important;color:#75dfff!important;font-size:9px!important;text-align:right!important}
 .nexa-p29-empty{padding:26px 14px!important;border:1px dashed rgba(128,141,196,.24)!important;border-radius:18px!important;text-align:center!important;color:#909abb!important}.nexa-p29-empty b{display:block!important;color:#fff!important;margin-bottom:5px!important}
 @media(min-width:760px){#nexa-p29-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
 `;document.head.appendChild(st);
}

function mount(){
 const modal=$('#nexa-profile-modal');if(!modal)return false;
 const sheet=$('.nexa-profile-sheet',modal)||modal;
 modal.classList.add('nexa-p29-owned');
 let shell=$('#nexa-p29-shell',modal);
 if(!shell){
  shell=document.createElement('section');shell.id='nexa-p29-shell';
  shell.innerHTML='<nav id="nexa-p29-tabs" aria-label="Profile Library"></nav><nav id="nexa-p29-gens" aria-label="Generation"></nav><div id="nexa-p29-status"></div><div id="nexa-p29-grid"></div>';
  const anchor=$('#nexa-v425-profile-actions',modal)||$('.nexa-profile-stats',modal)||$('.nexa-profile-header',modal);
  if(anchor)anchor.after(shell);else sheet.appendChild(shell);
 }
 renderTabs();
 return true;
}
function renderTabs(){
 const nav=$('#nexa-p29-tabs');if(!nav)return;
 nav.innerHTML=Object.keys(LABELS).map(k=>`<button type="button" class="nexa-p29-tab ${k===active?'active':''}" data-p29-tab="${k}">${LABELS[k]}</button>`).join('');
}
function renderGens(list){
 const nav=$('#nexa-p29-gens');if(!nav)return;
 if(!['heroes','experts'].includes(active)){nav.innerHTML='';return}
 const gens=[...new Set(list.map(genOf))].sort((a,b)=>a-b);
 if(generation!=='all'&&!gens.includes(Number(generation)))generation='all';
 nav.innerHTML=`<button type="button" class="nexa-p29-gen ${generation==='all'?'active':''}" data-p29-gen="all">ALL</button>`+gens.map(g=>`<button type="button" class="nexa-p29-gen ${String(g)===String(generation)?'active':''}" data-p29-gen="${g}">${g===0?'EPIC':`GEN ${g}`}</button>`).join('');
}
function chips(field,max,value,start=0,labelFn=null){
 const v=Number(value??start);
 return `<div class="nexa-p29-chips" data-chip-field="${field}">${Array.from({length:max-start+1},(_,i)=>i+start).map(n=>`<button type="button" class="nexa-p29-chip ${n===v?'active':''}" data-set-field="${field}" data-value="${n}">${esc(labelFn?labelFn(n):n)}</button>`).join('')}</div><input type="hidden" data-f="${field}" value="${v}">`;
}
function fields(x,p){
 if(isType(x,'heroes'))return `
  <label class="nexa-p29-field"><span>STARS</span>${chips('stars',5,p.stars??0)}</label>
  <label class="nexa-p29-field"><span>SKILL LEVEL</span>${chips('skill_level',5,p.skill_level??0)}</label>
  <label class="nexa-p29-field"><span>WIDGET</span>${chips('widget_level',10,p.widget_level??0)}</label>
  <label class="nexa-p29-field"><span>VISUAL LEVEL</span><input class="nexa-p29-input" data-f="level" type="number" min="0" max="80" value="${esc(p.level??'')}"></label>`;
 if(isType(x,'experts'))return `
  <label class="nexa-p29-field"><span>AFFINITY</span><input class="nexa-p29-input" data-f="affinity" type="number" min="0" max="100" value="${esc(p.affinity??p.level??'')}"></label>
  <label class="nexa-p29-field"><span>SKILL LEVEL</span>${chips('skill_level',10,p.skill_level??0)}</label>`;
 if(isType(x,'pets'))return `
  <label class="nexa-p29-field"><span>LEVEL</span><input class="nexa-p29-input" data-f="level" type="number" min="0" value="${esc(p.level??'')}"></label>
  <label class="nexa-p29-field"><span>SKILL LEVEL</span><input class="nexa-p29-input" data-f="skill_level" type="number" min="0" max="20" value="${esc(p.skill_level??'')}"></label>
  <label class="nexa-p29-field"><span>REFINEMENT</span><input class="nexa-p29-input" data-f="refinement" type="number" min="0" value="${esc(p.refinement??'')}"></label>`;
 if(isType(x,'troops'))return `
  <label class="nexa-p29-field"><span>TIER</span>${chips('tier',12,tierOf(x,p),1,n=>'T'+n)}</label>
  <label class="nexa-p29-field"><span>FIRE CRYSTAL</span>${chips('fc_level',10,fcOf(p),0,n=>n===0?'NONE':'FC'+n)}</label>`;
 if(isType(x,'gear'))return `
  <label class="nexa-p29-field"><span>TIER</span><input class="nexa-p29-input" data-f="current_tier" value="${esc(p.current_tier??'')}"></label>
  <label class="nexa-p29-field"><span>STARS</span>${chips('stars',3,p.stars??0)}</label>`;
 const arr=Array.isArray(p.charm_levels)?p.charm_levels:[];
 return [1,2,3].map(n=>`<label class="nexa-p29-field"><span>CHARM ${n}</span><input class="nexa-p29-input" data-f="charm_${n}" type="number" min="0" max="18" value="${esc(arr[n-1]??'')}"></label>`).join('');
}
function card(x){
 const p=progress(x),src=imgFor(x,p),ini=initials(x.name),isOwned=owned(x),cls=isType(x,'troops')?'troop':(isType(x,'heroes')?'hero':'');
 const pic=src?`<span class="nexa-p29-avatar"><img class="${cls}" src="${esc(src)}" alt="${esc(x.name||'')}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="nexa-p29-fallback" hidden>${esc(ini)}</span></span>`:`<span class="nexa-p29-avatar"><span class="nexa-p29-fallback">${esc(ini)}</span></span>`;
 return `<details class="nexa-p29-card" data-library-item="${esc(x.id)}"><summary>${pic}<span class="nexa-p29-title"><h4>${esc(x.name||'Item')}</h4><small>${esc(meta(x,p))}</small></span><span class="nexa-p29-owned ${isOwned?'yes':''}">${isOwned?'OWNED':'NOT OWNED'}</span></summary><div class="nexa-p29-config">${fields(x,p)}<div class="nexa-p29-actions"><button type="button" class="nexa-p29-remove">Remove</button><button type="button" class="nexa-p29-save">Save</button></div><div class="nexa-p29-card-status"></div></div></details>`;
}
function paint(){
 mount();renderTabs();
 const all=items.filter(x=>isType(x,active));renderGens(all);
 const list=generation==='all'||!['heroes','experts'].includes(active)?all:all.filter(x=>genOf(x)===Number(generation));
 const grid=$('#nexa-p29-grid');if(!grid)return;
 grid.innerHTML=list.length?list.map(card).join(''):'<div class="nexa-p29-empty"><b>No visible entries</b>This category has no visible Library entries right now.</div>';
}
async function resolveAccount(preferred=null){
 if(preferred){accountId=String(preferred);window.NEXA_ACTIVE_ACCOUNT_ID=accountId;return accountId}
 const c=sb();if(!c)return null;
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)return null;
  const visible=String($('#nexa-profile-player-id')?.textContent||'').trim();
  let r=null;
  if(visible&&visible!=='—')r=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',visible).maybeSingle();
  if(!r?.data?.id)r=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
  if(r?.data?.id){accountId=String(r.data.id);window.NEXA_ACTIVE_ACCOUNT_ID=accountId}
 }catch(e){console.warn('V29 account resolution',e?.message||e)}
 return accountId;
}
async function load(preferred=null){
 const token=++renderToken;mount();const status=$('#nexa-p29-status');if(status)status.textContent='Loading Profile Library…';
 await resolveAccount(preferred);const c=sb();if(!c||!accountId){if(status)status.textContent='Select an account first.';return}
 const [a,b]=await Promise.all([
  c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
  c.from('player_library_inventory').select('*').eq('player_account_id',accountId)
 ]);
 if(token!==renderToken)return;
 if(a.error){if(status)status.textContent=a.error.message;return}
 items=a.data||[];inventory=b.error?[]:(b.data||[]);if(status)status.textContent='';paint();
}
function read(card){
 const p={};$$('[data-f]',card).forEach(el=>{if(el.value==='')return;const key=el.dataset.f;p[key]=(el.type==='number'||el.type==='hidden')?Number(el.value):el.value.trim()});
 if(p.charm_1!==undefined||p.charm_2!==undefined||p.charm_3!==undefined){p.charm_levels=[p.charm_1||0,p.charm_2||0,p.charm_3||0];delete p.charm_1;delete p.charm_2;delete p.charm_3}
 return p;
}
async function saveCard(card,isOwned){
 const c=sb(),st=$('.nexa-p29-card-status',card);if(!c||!accountId)return;if(st)st.textContent='Saving…';
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');
  const payload={user_id:user.id,player_account_id:accountId,library_item_id:card.dataset.libraryItem,owned:isOwned,progress:isOwned?read(card):{},updated_at:new Date().toISOString()};
  const {error}=await c.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});if(error)throw error;
  const i=inventory.findIndex(x=>String(x.library_item_id)===String(card.dataset.libraryItem));if(i>=0)inventory[i]={...inventory[i],...payload};else inventory.push(payload);
  const pill=$('.nexa-p29-owned',card);if(pill){pill.classList.toggle('yes',isOwned);pill.textContent=isOwned?'OWNED':'NOT OWNED'}
  if(st)st.textContent=isOwned?'Saved ✓':'Removed ✓';
 }catch(e){if(st){st.textContent=e?.message||e;st.style.color='#ff88a8'}}
}
function refreshTroopPreview(card){
 const x=items.find(i=>String(i.id)===String(card.dataset.libraryItem));if(!x||!isType(x,'troops'))return;
 const p=read(card),src=imgFor(x,p),img=$('.nexa-p29-avatar img',card),small=$('.nexa-p29-title small',card);if(src&&img)img.src=src;if(small)small.textContent=meta(x,p);
}

document.addEventListener('click',e=>{
 const tab=e.target.closest?.('[data-p29-tab]');if(tab){e.preventDefault();active=tab.dataset.p29Tab;generation='all';paint();return}
 const gen=e.target.closest?.('[data-p29-gen]');if(gen){e.preventDefault();generation=gen.dataset.p29Gen;paint();return}
 const chip=e.target.closest?.('[data-set-field]');if(chip){e.preventDefault();const card=chip.closest('.nexa-p29-card'),field=chip.dataset.setField,val=chip.dataset.value,input=$(`[data-f="${field}"]`,card);if(input)input.value=val;$$(`[data-set-field="${field}"]`,card).forEach(b=>b.classList.toggle('active',b===chip));refreshTroopPreview(card);return}
 const save=e.target.closest?.('.nexa-p29-save');if(save){e.preventDefault();saveCard(save.closest('.nexa-p29-card'),true);return}
 const rem=e.target.closest?.('.nexa-p29-remove');if(rem){e.preventDefault();saveCard(rem.closest('.nexa-p29-card'),false);return}
 const planet=e.target.closest?.('[data-nexa-profile],[data-account-constellation-id]');if(planet){const id=planet.dataset.nexaProfile||planet.dataset.accountConstellationId;setTimeout(()=>load(id),180);return}
 if(e.target.closest?.('#nexa-profile-launcher,#nexa-profile-launcher-section'))setTimeout(()=>load(),220);
},true);
document.addEventListener('nexa:profile-opened',e=>setTimeout(()=>load(e.detail?.accountId||null),100));

let watch=null;
function boot(){
 addCSS();mount();
 let wasOpen=false;watch=setInterval(()=>{
  const modal=$('#nexa-profile-modal'),open=!!modal?.classList.contains('open');
  if(open&&!wasOpen)load();
  if(open)mount();
  wasOpen=open;
 },500);
 if($('#nexa-profile-modal')?.classList.contains('open'))load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.NEXA_PROFILE_V29={reload:load};
})();
