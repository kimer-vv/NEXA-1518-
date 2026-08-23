/* NEXA Profile Owner V30 — clean horizontal Profile workspace
   Single visual owner. Native iOS rails. No MutationObserver. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_PROFILE_V30_INITIALIZED__) return;
window.__NEXA_PROFILE_V30_INITIALIZED__=true;
window.__NEXA_PROFILE_OWNER__='V30';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const TYPES={heroes:['hero'],experts:['expert'],troops:['troop'],pets:['pet'],gear:['chief_gear'],charms:['chief_charm']};
const LABELS={heroes:'HEROES',experts:'EXPERTS',troops:'TROOPS',pets:'PETS',gear:'CHIEF GEAR',charms:'CHARMS'};
const GEAR={
 helmet:'/nexa-gear-helmet.webp',watch:'/nexa-gear-watch.webp',coat:'/nexa-gear-coat.webp',
 pants:'/nexa-gear-pants.webp',belt:'/nexa-gear-belt.webp','short staff':'/nexa-gear-shortstaff.webp',shortstaff:'/nexa-gear-shortstaff.webp'
};
let localSb=null,accountId=null,active='heroes',generation='all',items=[],inventory=[],selectedId=null,loadSeq=0;

function sb(){
 if(window.supabaseClient?.from)return window.supabaseClient;
 if(window.sb?.from)return window.sb;
 if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient('https://dfxcxboxrkfmrnsgpyin.supabase.co','sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-');
 return localSb;
}
const isType=(x,cat)=>TYPES[cat]?.includes(String(x?.item_type||'').toLowerCase())||false;
const genOf=x=>{const n=Number(x?.generation);return Number.isFinite(n)?n:0};
function troopType(x){const s=String(x?.troop_type||x?.name||'').toLowerCase();return ['infantry','lancer','marksman'].find(k=>s.includes(k))||''}
function invFor(x){return inventory.find(i=>String(i.library_item_id)===String(x.id))||null}
function progress(x){return invFor(x)?.progress||{}}
function owned(x){return invFor(x)?.owned===true}
function tierOf(x,p={}){const n=Number(p.tier||p.troop_tier||x?.metadata?.tier||1);return n>=1&&n<=12?n:1}
function fcOf(p={}){const n=Number(p.fc_level||p.fire_crystal||0);return n>=1&&n<=10?n:0}
function initials(name){return String(name||'?').split(/\s+/).filter(Boolean).map(v=>v[0]).join('').slice(0,2).toUpperCase()}
function rarity(x){return String(x?.rarity||'').trim().toLowerCase()}
function accent(x){
 const r=rarity(x);
 if(/mythic|legend|gold/.test(r))return'#ffbd4a';
 if(/epic|purple/.test(r))return'#a977ff';
 if(/rare|blue/.test(r))return'#55c8ff';
 if(/green|uncommon/.test(r))return'#58e0a7';
 if(isType(x,'troops'))return'#7b9dff';
 if(isType(x,'pets'))return'#58e0cf';
 if(isType(x,'gear'))return'#c38cff';
 if(isType(x,'charms'))return'#74d7ff';
 return'#a977ff';
}
function canonicalImage(x,p={}){
 if(isType(x,'troops')){
   const t=troopType(x),tier=tierOf(x,p);
   return window.NEXA_TROOP_ASSETS?.getPortrait?.(t,tier)||window.NEXA_TROOP_PORTRAITS?.[t]?.['t'+tier]||x.image_url||'';
 }
 if(isType(x,'gear')){
   const k=String(x.name||'').trim().toLowerCase();
   return GEAR[k]||x.image_url||'';
 }
 return x.image_url||'';
}
function meta(x,p={}){
 const a=[];
 if(isType(x,'heroes')||isType(x,'experts')||isType(x,'pets'))a.push(genOf(x)===0?'EPIC':`GEN ${genOf(x)}`);
 if(isType(x,'troops'))a.push((troopType(x)||'TROOP').toUpperCase(),`T${tierOf(x,p)}`);
 if(x.rarity)a.push(String(x.rarity).toUpperCase());
 return a.join(' • ');
}

function addCSS(){
 if($('#nexa-profile-v30-css'))return;
 const st=document.createElement('style');st.id='nexa-profile-v30-css';st.textContent=`
 /* Hard reset every legacy Profile shape. */
 #nexa-profile-modal.nexa-v30-owned{
   position:fixed!important;inset:0!important;z-index:2147483300!important;
   display:none!important;place-items:center!important;padding:calc(8px + env(safe-area-inset-top)) 8px calc(8px + env(safe-area-inset-bottom))!important;
   background:rgba(2,4,14,.76)!important;backdrop-filter:blur(8px)!important;overflow:hidden!important;
 }
 #nexa-profile-modal.nexa-v30-owned.open{display:grid!important}
 #nexa-profile-modal.nexa-v30-owned .nexa-profile-sheet{
   position:relative!important;inset:auto!important;transform:none!important;
   width:min(680px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;
   height:auto!important;min-height:0!important;max-height:calc(100dvh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;
   margin:0 auto!important;padding:0!important;border-radius:26px!important;
   border:1px solid rgba(126,104,255,.46)!important;
   background:radial-gradient(circle at 18% 4%,rgba(111,74,255,.22),transparent 32%),radial-gradient(circle at 88% 14%,rgba(38,183,255,.11),transparent 29%),linear-gradient(165deg,#101738,#050916 72%)!important;
   box-shadow:0 24px 90px rgba(0,0,0,.55),0 0 34px rgba(84,64,212,.14)!important;
   overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important;
   clip-path:none!important;mask:none!important;-webkit-mask:none!important;
 }
 #nexa-profile-modal.nexa-v30-owned .nexa-profile-sheet:before,#nexa-profile-modal.nexa-v30-owned .nexa-profile-sheet:after{display:none!important}
 #nexa-profile-modal.nexa-v30-owned .nexa-profile-tabs,
 #nexa-profile-modal.nexa-v30-owned #nexa-profile-content,
 #nexa-profile-modal.nexa-v30-owned .nexa-profile-content,
 #nexa-profile-modal.nexa-v30-owned #nexa-player-gen-rail,
 #nexa-profile-modal.nexa-v30-owned #nexa-pl-owned-root,
 #nexa-profile-modal.nexa-v30-owned #nexa-p29-shell{display:none!important}

 #nexa-v30-shell{display:block!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;padding:0 14px 18px!important}
 #nexa-v30-tabs,#nexa-v30-gens,#nexa-v30-items{
   display:flex!important;flex-flow:row nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
   -webkit-overflow-scrolling:touch!important;touch-action:auto!important;scrollbar-width:none!important;scroll-snap-type:none!important;
 }
 #nexa-v30-tabs::-webkit-scrollbar,#nexa-v30-gens::-webkit-scrollbar,#nexa-v30-items::-webkit-scrollbar{display:none!important}
 #nexa-v30-tabs{gap:7px!important;padding:9px 0 7px!important}
 #nexa-v30-gens{gap:7px!important;padding:3px 0 9px!important}
 .nexa-v30-tab,.nexa-v30-gen{
   flex:0 0 auto!important;white-space:nowrap!important;border:1px solid rgba(137,143,205,.24)!important;border-radius:999px!important;
   background:#0b1129!important;color:#929bb8!important;font-weight:950!important;letter-spacing:.07em!important;
 }
 .nexa-v30-tab{padding:8px 12px!important;font-size:9px!important}.nexa-v30-gen{padding:6px 10px!important;font-size:8px!important}
 .nexa-v30-tab.active,.nexa-v30-gen.active{color:#fff!important;border-color:#a77cff!important;background:rgba(108,72,214,.25)!important;box-shadow:0 0 17px rgba(122,82,255,.13)!important}
 #nexa-v30-gens:empty{display:none!important}
 #nexa-v30-status{min-height:13px!important;padding:0 2px 5px!important;color:#70dcff!important;font-size:8px!important}

 #nexa-v30-items{gap:10px!important;padding:2px 1px 11px!important;scroll-padding-inline:1px!important}
 .nexa-v30-card{
   --ac:#a977ff;flex:0 0 132px!important;min-width:132px!important;max-width:132px!important;
   border:1px solid color-mix(in srgb,var(--ac) 42%,transparent)!important;border-radius:18px!important;
   background:linear-gradient(155deg,color-mix(in srgb,var(--ac) 10%,#111630),#070b1d 70%)!important;
   padding:9px!important;color:#fff!important;text-align:center!important;box-sizing:border-box!important;
   box-shadow:0 0 18px color-mix(in srgb,var(--ac) 8%,transparent)!important;
 }
 .nexa-v30-card.selected{border-color:var(--ac)!important;box-shadow:0 0 22px color-mix(in srgb,var(--ac) 24%,transparent)!important;transform:translateY(-1px)!important}
 .nexa-v30-portrait{
   width:82px!important;height:82px!important;margin:0 auto 7px!important;border-radius:50%!important;overflow:hidden!important;
   display:grid!important;place-items:center!important;border:2px solid var(--ac)!important;
   background:radial-gradient(circle at 40% 30%,color-mix(in srgb,var(--ac) 18%,#11172f),#080d22 74%)!important;
   box-shadow:0 0 17px color-mix(in srgb,var(--ac) 22%,transparent)!important;
 }
 .nexa-v30-portrait img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 28%!important;transform:none!important;padding:0!important;border-radius:0!important}
 .nexa-v30-portrait img.troop,.nexa-v30-portrait img.gear,.nexa-v30-portrait img.charm{object-fit:contain!important;object-position:center!important;padding:3px!important;box-sizing:border-box!important}
 .nexa-v30-card b{display:block!important;font-size:12px!important;line-height:1.12!important;white-space:normal!important;overflow-wrap:anywhere!important}
 .nexa-v30-card small{display:block!important;margin-top:4px!important;color:#8f99b8!important;font-size:7px!important;line-height:1.25!important;min-height:18px!important}
 .nexa-v30-owned{display:inline-block!important;margin-top:6px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;padding:4px 7px!important;font-size:7px!important;font-weight:950!important;color:#8b95b4!important}
 .nexa-v30-owned.yes{color:#74efbf!important;border-color:rgba(74,227,171,.38)!important;background:rgba(35,113,81,.16)!important}

 #nexa-v30-detail{--ac:#a977ff;border:1px solid color-mix(in srgb,var(--ac) 38%,transparent)!important;border-radius:18px!important;background:linear-gradient(155deg,rgba(14,20,48,.96),rgba(5,9,25,.98))!important;padding:12px!important;min-height:84px!important}
 .nexa-v30-detail-head{display:grid!important;grid-template-columns:54px minmax(0,1fr) auto!important;gap:9px!important;align-items:center!important;margin-bottom:10px!important}
 .nexa-v30-detail-head .mini{width:54px!important;height:54px!important;border-radius:50%!important;overflow:hidden!important;border:2px solid var(--ac)!important;display:grid!important;place-items:center!important;background:#0b112a!important}
 .nexa-v30-detail-head .mini img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 28%!important}.nexa-v30-detail-head .mini img.troop,.nexa-v30-detail-head .mini img.gear,.nexa-v30-detail-head .mini img.charm{object-fit:contain!important;padding:2px!important;box-sizing:border-box!important}
 .nexa-v30-detail-head h4{margin:0!important;font-size:14px!important}.nexa-v30-detail-head p{margin:3px 0 0!important;color:#929cba!important;font-size:8px!important}
 .nexa-v30-toggle{border:1px solid rgba(87,223,177,.40)!important;border-radius:999px!important;background:rgba(26,93,68,.18)!important;color:#87f0ce!important;padding:7px 9px!important;font-size:8px!important;font-weight:950!important}
 .nexa-v30-toggle.off{border-color:rgba(255,255,255,.14)!important;background:#0b1128!important;color:#949db9!important}
 .nexa-v30-fields{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 .nexa-v30-field{min-width:0!important}.nexa-v30-field>span{display:block!important;margin-bottom:5px!important;color:#909bb9!important;font-size:7px!important;font-weight:950!important;letter-spacing:.08em!important}
 .nexa-v30-chips{display:flex!important;gap:5px!important;overflow-x:auto!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}.nexa-v30-chips::-webkit-scrollbar{display:none!important}
 .nexa-v30-chip{flex:0 0 auto!important;min-width:30px!important;border:1px solid rgba(128,140,196,.24)!important;border-radius:9px!important;background:#081027!important;color:#9da7c5!important;padding:6px 7px!important;font-size:8px!important;font-weight:900!important}.nexa-v30-chip.active{border-color:var(--ac)!important;color:#fff!important;background:color-mix(in srgb,var(--ac) 23%,#081027)!important}
 .nexa-v30-input{width:100%!important;box-sizing:border-box!important;border:1px solid rgba(127,143,204,.22)!important;border-radius:10px!important;background:#081027!important;color:#fff!important;padding:8px!important;font-size:16px!important}
 .nexa-v30-actions{display:flex!important;justify-content:flex-end!important;gap:7px!important;margin-top:10px!important}.nexa-v30-actions button{border-radius:999px!important;padding:7px 10px!important;font-size:8px!important;font-weight:950!important}.nexa-v30-reset{border:1px solid rgba(255,106,157,.32)!important;background:#151025!important;color:#ff9bbc!important}.nexa-v30-save{border:1px solid rgba(77,204,255,.42)!important;background:rgba(16,77,109,.28)!important;color:#83e6ff!important}
 .nexa-v30-empty{width:100%!important;padding:24px 12px!important;border:1px dashed rgba(132,143,194,.22)!important;border-radius:16px!important;text-align:center!important;color:#929bb8!important;font-size:10px!important}
 @media(max-width:390px){.nexa-v30-card{flex-basis:120px!important;min-width:120px!important;max-width:120px!important}.nexa-v30-portrait{width:74px!important;height:74px!important}}
 `;document.head.appendChild(st);
}

function mount(){
 const modal=$('#nexa-profile-modal');if(!modal)return false;
 modal.classList.remove('nexa-p29-owned');modal.classList.add('nexa-v30-owned');
 $('#nexa-p29-shell',modal)?.remove();
 const sheet=$('.nexa-profile-sheet',modal)||modal;
 let shell=$('#nexa-v30-shell',modal);
 if(!shell){
   shell=document.createElement('section');shell.id='nexa-v30-shell';
   shell.innerHTML='<nav id="nexa-v30-tabs" aria-label="Profile categories"></nav><nav id="nexa-v30-gens" aria-label="Generation"></nav><div id="nexa-v30-status"></div><div id="nexa-v30-items"></div><section id="nexa-v30-detail"></section>';
   const anchor=$('#nexa-v425-profile-actions',modal)||$('.nexa-profile-stats',modal)||$('.nexa-profile-header',modal);
   if(anchor)anchor.after(shell);else sheet.appendChild(shell);
 }
 renderTabs();return true;
}
function renderTabs(){const n=$('#nexa-v30-tabs');if(n)n.innerHTML=Object.keys(LABELS).map(k=>`<button type="button" class="nexa-v30-tab ${k===active?'active':''}" data-v30-tab="${k}">${LABELS[k]}</button>`).join('')}
function renderGens(list){
 const n=$('#nexa-v30-gens');if(!n)return;
 if(!['heroes','experts','pets'].includes(active)){n.innerHTML='';return}
 const gs=[...new Set(list.map(genOf))].sort((a,b)=>a-b);if(generation!=='all'&&!gs.includes(Number(generation)))generation='all';
 n.innerHTML=`<button type="button" class="nexa-v30-gen ${generation==='all'?'active':''}" data-v30-gen="all">ALL</button>`+gs.map(g=>`<button type="button" class="nexa-v30-gen ${String(g)===String(generation)?'active':''}" data-v30-gen="${g}">${g===0?'EPIC':`GEN ${g}`}</button>`).join('');
}
function cardClass(x){return isType(x,'troops')?'troop':isType(x,'gear')?'gear':isType(x,'charms')?'charm':''}
function portrait(x,p,mini=false){
 const src=canonicalImage(x,p),cls=cardClass(x),ini=initials(x.name);
 if(src)return `<img class="${cls}" src="${esc(src)}" alt="${esc(x.name||'')}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span ${mini?'':'class="nexa-v30-fallback"'} hidden style="font-weight:950;color:#d7cdff">${esc(ini)}</span>`;
 return `<span style="font-weight:950;color:#d7cdff">${esc(ini)}</span>`;
}
function visibleItems(){const by=items.filter(x=>isType(x,active));return generation==='all'?by:by.filter(x=>genOf(x)===Number(generation))}
function paint(){
 mount();renderTabs();const by=items.filter(x=>isType(x,active));renderGens(by);const rows=visibleItems();
 if(!rows.some(x=>String(x.id)===String(selectedId)))selectedId=rows[0]?.id||null;
 const rail=$('#nexa-v30-items');
 if(rail)rail.innerHTML=rows.length?rows.map(x=>{const p=progress(x),ac=accent(x);return `<button type="button" class="nexa-v30-card ${String(x.id)===String(selectedId)?'selected':''}" style="--ac:${ac}" data-v30-item="${esc(x.id)}"><span class="nexa-v30-portrait">${portrait(x,p)}</span><b>${esc(x.name||'Item')}</b><small>${esc(meta(x,p))}</small><span class="nexa-v30-owned ${owned(x)?'yes':''}">${owned(x)?'OWNED':'NOT OWNED'}</span></button>`}).join(''):`<div class="nexa-v30-empty">No visible entries in this category.</div>`;
 paintDetail();
}
function chips(field,max,value,start=0,labelFn=null){const v=Number(value??start);return `<div class="nexa-v30-chips">${Array.from({length:max-start+1},(_,i)=>i+start).map(n=>`<button type="button" class="nexa-v30-chip ${n===v?'active':''}" data-v30-set="${field}" data-value="${n}">${esc(labelFn?labelFn(n):n)}</button>`).join('')}</div><input type="hidden" data-v30-f="${field}" value="${v}">`}
function fields(x,p){
 if(isType(x,'heroes'))return `<label class="nexa-v30-field"><span>STARS</span>${chips('stars',5,p.stars??0)}</label><label class="nexa-v30-field"><span>SKILL</span>${chips('skill_level',5,p.skill_level??0)}</label><label class="nexa-v30-field"><span>WIDGET</span>${chips('widget_level',10,p.widget_level??0)}</label><label class="nexa-v30-field"><span>LEVEL</span><input class="nexa-v30-input" data-v30-f="level" type="number" min="0" max="80" value="${esc(p.level??'')}"></label>`;
 if(isType(x,'experts'))return `<label class="nexa-v30-field"><span>AFFINITY</span><input class="nexa-v30-input" data-v30-f="affinity" type="number" min="0" max="100" value="${esc(p.affinity??p.level??'')}"></label><label class="nexa-v30-field"><span>SKILL</span>${chips('skill_level',10,p.skill_level??0)}</label>`;
 if(isType(x,'pets'))return `<label class="nexa-v30-field"><span>LEVEL</span><input class="nexa-v30-input" data-v30-f="level" type="number" min="0" value="${esc(p.level??'')}"></label><label class="nexa-v30-field"><span>SKILL</span><input class="nexa-v30-input" data-v30-f="skill_level" type="number" min="0" max="20" value="${esc(p.skill_level??'')}"></label><label class="nexa-v30-field"><span>REFINE</span><input class="nexa-v30-input" data-v30-f="refinement" type="number" min="0" value="${esc(p.refinement??'')}"></label>`;
 if(isType(x,'troops'))return `<label class="nexa-v30-field"><span>TIER</span>${chips('tier',12,tierOf(x,p),1,n=>'T'+n)}</label><label class="nexa-v30-field"><span>FIRE CRYSTAL</span>${chips('fc_level',10,fcOf(p),0,n=>n===0?'NONE':'FC'+n)}</label>`;
 if(isType(x,'gear'))return `<label class="nexa-v30-field"><span>TIER</span><input class="nexa-v30-input" data-v30-f="current_tier" value="${esc(p.current_tier??'')}"></label><label class="nexa-v30-field"><span>STARS</span>${chips('stars',3,p.stars??0)}</label>`;
 const arr=Array.isArray(p.charm_levels)?p.charm_levels:[];return [1,2,3].map(n=>`<label class="nexa-v30-field"><span>CHARM ${n}</span><input class="nexa-v30-input" data-v30-f="charm_${n}" type="number" min="0" max="18" value="${esc(arr[n-1]??'')}"></label>`).join('');
}
function paintDetail(){
 const box=$('#nexa-v30-detail');if(!box)return;const x=items.find(v=>String(v.id)===String(selectedId));if(!x){box.innerHTML='<div class="nexa-v30-empty">Select an item.</div>';return}
 const p=progress(x),ac=accent(x);box.style.setProperty('--ac',ac);box.innerHTML=`<div class="nexa-v30-detail-head"><span class="mini">${portrait(x,p,true)}</span><div><h4>${esc(x.name||'Item')}</h4><p>${esc(meta(x,p))}</p></div><button type="button" class="nexa-v30-toggle ${owned(x)?'':'off'}" data-v30-owned>${owned(x)?'OWNED':'NOT OWNED'}</button></div><div class="nexa-v30-fields">${fields(x,p)}</div><div class="nexa-v30-actions"><button type="button" class="nexa-v30-reset" data-v30-reset>Reset</button><button type="button" class="nexa-v30-save" data-v30-save>Save</button></div>`;
}
async function resolveAccount(preferred=null){
 if(preferred){accountId=String(preferred);window.NEXA_ACTIVE_ACCOUNT_ID=accountId;return accountId}
 const c=sb();if(!c)return null;try{const {data:{user}}=await c.auth.getUser();if(!user)return null;const visible=String($('#nexa-profile-player-id')?.textContent||'').trim();let q=null;if(visible&&visible!=='—')q=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',visible).maybeSingle();if(!q?.data?.id)q=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();if(q?.data?.id){accountId=String(q.data.id);window.NEXA_ACTIVE_ACCOUNT_ID=accountId}}catch(e){console.warn('V30 account',e?.message||e)}return accountId;
}
async function load(preferred=null){
 addCSS();mount();await resolveAccount(preferred);const status=$('#nexa-v30-status');if(!accountId){if(status)status.textContent='Open a game account first.';return}
 const c=sb(),seq=++loadSeq;if(status)status.textContent='Loading…';try{const [a,b]=await Promise.all([c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),c.from('player_library_inventory').select('*').eq('player_account_id',accountId)]);if(seq!==loadSeq)return;if(a.error)throw a.error;items=a.data||[];inventory=b.data||[];if(status)status.textContent='';paint()}catch(e){if(status)status.textContent=e?.message||String(e)}
}
function readDetail(){const p={};$$('[data-v30-f]',$('#nexa-v30-detail')).forEach(el=>{if(el.value==='')return;const k=el.dataset.v30F;p[k]=(el.type==='number'||el.type==='hidden')?Number(el.value):el.value.trim()});if(['charm_1','charm_2','charm_3'].some(k=>p[k]!==undefined)){p.charm_levels=[p.charm_1||0,p.charm_2||0,p.charm_3||0];delete p.charm_1;delete p.charm_2;delete p.charm_3}return p}
async function saveSelected(forceOwned=null){
 const x=items.find(v=>String(v.id)===String(selectedId));if(!x||!accountId)return;const c=sb(),status=$('#nexa-v30-status');try{const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');const current=invFor(x),payload={user_id:user.id,player_account_id:accountId,library_item_id:x.id,owned:forceOwned===null?(current?.owned===true):!!forceOwned,progress:readDetail(),updated_at:new Date().toISOString()};const {error}=await c.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});if(error)throw error;const i=inventory.findIndex(v=>String(v.library_item_id)===String(x.id));if(i>=0)inventory[i]={...inventory[i],...payload};else inventory.push(payload);if(status)status.textContent='Saved ✓';paint()}catch(e){if(status)status.textContent=e?.message||String(e)}
}
function setField(field,value){const box=$('#nexa-v30-detail');const input=$(`[data-v30-f="${field}"]`,box);if(input)input.value=String(value);$$(`[data-v30-set="${field}"]`,box).forEach(b=>b.classList.toggle('active',String(b.dataset.value)===String(value)));const x=items.find(v=>String(v.id)===String(selectedId));if(x&&isType(x,'troops')&&field==='tier'){const img=$('.mini img',box);const u=canonicalImage(x,{...progress(x),...readDetail(),tier:Number(value)});if(img&&u)img.src=u}}

document.addEventListener('click',e=>{
 const planet=e.target.closest?.('[data-nexa-profile],[data-account-constellation-id]');if(planet){setTimeout(()=>load(planet.dataset.nexaProfile||planet.dataset.accountConstellationId),90);return}
 if(e.target.closest?.('#nexa-profile-launcher,#nexa-profile-launcher-section')){setTimeout(()=>load(),100);return}
 const tab=e.target.closest?.('[data-v30-tab]');if(tab){e.preventDefault();active=tab.dataset.v30Tab;generation='all';selectedId=null;paint();return}
 const gen=e.target.closest?.('[data-v30-gen]');if(gen){e.preventDefault();generation=gen.dataset.v30Gen;selectedId=null;paint();return}
 const card=e.target.closest?.('[data-v30-item]');if(card){e.preventDefault();selectedId=card.dataset.v30Item;paint();return}
 const chip=e.target.closest?.('[data-v30-set]');if(chip){e.preventDefault();setField(chip.dataset.v30Set,Number(chip.dataset.value));return}
 if(e.target.closest?.('[data-v30-owned]')){e.preventDefault();const x=items.find(v=>String(v.id)===String(selectedId));saveSelected(!(x&&owned(x)));return}
 if(e.target.closest?.('[data-v30-save]')){e.preventDefault();saveSelected(null);return}
 if(e.target.closest?.('[data-v30-reset]')){e.preventDefault();$$('input',$('#nexa-v30-detail')).forEach(i=>i.value='');saveSelected(false);return}
},true);

function boot(){addCSS();mount();if($('#nexa-profile-modal')?.classList.contains('open'))load();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{addCSS();mount()},80));
})();
