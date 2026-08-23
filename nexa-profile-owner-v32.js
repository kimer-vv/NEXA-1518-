/* NEXA PROFILE OWNER V32 — FUNCTIONAL REBUILD
   Single Profile owner for Heroes / Experts / Troops / Pets / Chief Gear / Charms.
   Uses nexa_library_items + player_library_inventory.
   No MutationObserver. No manual scrollLeft. No touchmove preventDefault.
   Transfer and My Alliance are untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_PROFILE_V32_INITIALIZED__) return;
window.__NEXA_PROFILE_V32_INITIALIZED__=true;
window.__NEXA_PROFILE_OWNER__='V32';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const CATS={heroes:'HEROES',experts:'EXPERTS',troops:'TROOPS',pets:'PETS',gear:'CHIEF GEAR',charms:'CHARMS'};
const TYPES={heroes:'hero',experts:'expert',troops:'troop',pets:'pet',gear:'chief_gear'};
const COLORS=['#a967ff','#43dff2','#ff55c7','#4f87ff','#4bd694','#ffae4d','#e55bff','#4ad5b2','#f06686','#68a9ff','#b682ff','#f1d45e'];

let activeCat='heroes', activeGen='all', selectedId=null, accountId=null;
let items=[], inventory=[];

function sb(){return window.supabaseClient?.from?window.supabaseClient:window.sb?.from?window.sb:null}
function genOf(i){return Number(i.generation||0)}
function colorFor(i,idx=0){
  if(i.item_type==='hero'||i.item_type==='expert'||i.item_type==='pet') return COLORS[Math.max(0,genOf(i))%COLORS.length];
  return COLORS[idx%COLORS.length];
}
function invMap(){return new Map(inventory.map(x=>[String(x.library_item_id),x]))}
function invOf(i){return invMap().get(String(i.id))||null}
function progOf(i){return invOf(i)?.progress||{}}
function ownedOf(i){return invOf(i)?.owned===true}
function troopType(i){return String(i.troop_type||i.name||'').toLowerCase().includes('infantry')?'infantry':String(i.troop_type||i.name||'').toLowerCase().includes('lancer')?'lancer':'marksman'}
function gearImg(i){
 const m={helmet:'/nexa-gear-helmet.webp',watch:'/nexa-gear-watch.webp',coat:'/nexa-gear-coat.webp',pants:'/nexa-gear-pants.webp',belt:'/nexa-gear-belt.webp',shortstaff:'/nexa-gear-shortstaff.webp','short staff':'/nexa-gear-shortstaff.webp'};
 return m[String(i.name||'').toLowerCase()]||i.image_url||'';
}
function itemImg(i,p={}){
 if(i.item_type==='troop'){
   const t=troopType(i), tier=clamp(p.tier||1,1,12);
   return window.NEXA_TROOP_ASSETS?.getPortrait?.(t,tier)||window.NEXA_TROOP_PORTRAITS?.[t]?.['t'+tier]||i.image_url||'';
 }
 if(i.item_type==='chief_gear') return gearImg(i);
 return i.image_url||'';
}
function meta(i,p={}){
 if(i.item_type==='hero') return `${genOf(i)?'GEN '+genOf(i):'EPIC'} • ${String(i.troop_type||'').toUpperCase()||i.rarity||''}`;
 if(i.item_type==='expert') return `GEN ${genOf(i)||1}${i.metadata?.specialty?' • '+i.metadata.specialty:''}`;
 if(i.item_type==='pet') return `GEN ${genOf(i)||1}${i.rarity?' • '+i.rarity:''}`;
 if(i.item_type==='troop') return `${String(troopType(i)).toUpperCase()} • T${clamp(p.tier||1,1,12)}`;
 if(i.item_type==='chief_gear') return `${i.metadata?.benefits||''}`;
 return '';
}

function css(){
 if($('#nexa-v32-css'))return;
 const st=document.createElement('style');st.id='nexa-v32-css';st.textContent=`
 #nexa-profile-modal #nexa-p29-shell,
 #nexa-profile-modal #nexa-v30-shell,
 #nexa-profile-modal #nexa-player-gen-rail,
 #nexa-profile-modal #nexa-pl-owned-root,
 #nexa-profile-modal .nexa-profile-tabs,
 #nexa-profile-modal .nexa-profile-content{display:none!important}
 #nexa-profile-modal .nexa-profile-sheet{
   width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;
   max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;
   border-radius:28px!important;clip-path:none!important;-webkit-clip-path:none!important;
   background:radial-gradient(circle at 15% 4%,rgba(112,67,255,.26),transparent 27%),
              radial-gradient(circle at 87% 8%,rgba(42,180,255,.14),transparent 28%),
              linear-gradient(165deg,#111a42 0%,#080f27 43%,#050817 100%)!important;
   border:1px solid rgba(124,85,255,.55)!important;box-shadow:0 0 34px rgba(102,65,245,.16)!important;
   -webkit-overflow-scrolling:touch!important
 }
 #nexa-profile-modal .nexa-profile-edit-row{
   display:flex!important;justify-content:flex-end!important;margin:6px 18px 8px!important;position:relative!important;z-index:30!important
 }
 #nexa-profile-modal .nexa-profile-edit-btn{
   display:inline-flex!important;visibility:visible!important;opacity:1!important;
   padding:6px 10px!important;border-radius:999px!important;font-size:9px!important;min-height:0!important;
   border:1px solid rgba(92,195,255,.38)!important;background:rgba(9,19,48,.65)!important;color:#dbeaff!important;
   box-shadow:0 0 10px rgba(70,183,255,.09)!important
 }
 #nexa-v32{position:relative;padding:0 0 22px;background:
   radial-gradient(circle at 15% 15%,rgba(111,67,255,.09),transparent 24%),
   radial-gradient(circle at 85% 65%,rgba(26,165,255,.06),transparent 30%);
 }
 #nexa-v32:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.28;background-image:
   radial-gradient(circle,rgba(172,151,255,.9) 0 1px,transparent 1.4px),
   radial-gradient(circle,rgba(83,216,255,.7) 0 1px,transparent 1.4px);
   background-size:41px 41px,67px 67px;background-position:8px 13px,29px 3px}
 .v32-rail{position:relative;z-index:2;display:flex;flex-flow:row nowrap;overflow-x:auto;overflow-y:hidden;
   -webkit-overflow-scrolling:touch;scrollbar-width:none;gap:8px;background:transparent;border:0}
 .v32-rail::-webkit-scrollbar{display:none}
 #v32-cats{padding:10px 16px 7px}
 .v32-cat{flex:0 0 auto;min-width:100px;padding:11px 13px;border-radius:999px;border:1px solid rgba(110,125,180,.18);
   background:rgba(5,11,29,.18);color:#7f8aad;font-size:9px;font-weight:950;letter-spacing:.13em;white-space:nowrap}
 .v32-cat.active{color:#fff;border-color:#a668ff;background:rgba(80,43,153,.23);
   box-shadow:0 0 8px rgba(166,104,255,.52),0 0 20px rgba(121,72,255,.18);text-shadow:0 0 8px rgba(255,255,255,.2)}
 #v32-filters{padding:7px 16px 12px}
 .v32-filter{--c:#9a65ef;position:relative;flex:0 0 auto;min-width:92px;padding:10px 14px;border-radius:999px;
   border:1.5px solid var(--c);background:rgba(7,12,30,.42);color:color-mix(in srgb,var(--c) 70%,white);
   font-size:9px;font-weight:950;letter-spacing:.09em;white-space:nowrap;
   box-shadow:0 0 7px color-mix(in srgb,var(--c) 50%,transparent),0 0 16px color-mix(in srgb,var(--c) 18%,transparent)}
 .v32-filter:before,.v32-filter:after{content:"";position:absolute;border:1px solid color-mix(in srgb,var(--c) 42%,transparent);border-radius:50%;pointer-events:none}
 .v32-filter:before{inset:-4px 12px;transform:rotate(-8deg)} .v32-filter:after{inset:5px -3px;transform:rotate(6deg)}
 .v32-filter.active{color:#fff;background:color-mix(in srgb,var(--c) 18%,rgba(5,10,25,.8));
   box-shadow:0 0 10px color-mix(in srgb,var(--c) 72%,transparent),0 0 25px color-mix(in srgb,var(--c) 30%,transparent)}
 #v32-grid{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 8px;padding:14px 11px 12px}
 .v32-item{--c:#58d8d1;min-width:0;padding:0;border:0;background:transparent;color:#fff;text-align:center}
 .v32-planet{position:relative;width:min(22vw,84px);height:min(22vw,84px);max-width:84px;max-height:84px;margin:0 auto 8px;
   border-radius:50%;display:grid;place-items:center}
 .v32-planet:before,.v32-planet:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
 .v32-planet:before{inset:-5px;border:1.5px solid var(--c);box-shadow:0 0 10px var(--c),0 0 22px color-mix(in srgb,var(--c) 33%,transparent)}
 .v32-planet:after{inset:-9px 2px;border:1px solid color-mix(in srgb,var(--c) 42%,transparent);transform:rotate(-13deg);box-shadow:0 0 8px color-mix(in srgb,var(--c) 22%,transparent)}
 .v32-orbit-dot{position:absolute;z-index:4;right:-6px;top:14px;width:5px;height:5px;border-radius:50%;background:var(--c);box-shadow:0 0 7px var(--c)}
 .v32-planet img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 27%;background:#09142b}
 .v32-item[data-type="troop"] .v32-planet img,.v32-item[data-type="chief_gear"] .v32-planet img{object-fit:contain;padding:2px;box-sizing:border-box;background:transparent}
 .v32-item.selected .v32-planet{filter:brightness(1.12)}
 .v32-item b{display:block;font-size:12px;line-height:1.08;margin:0;color:#fff;font-weight:950}
 .v32-item small{display:block;margin-top:4px;color:#929bb9;font-size:7.6px;line-height:1.25;white-space:normal}
 .v32-own{margin-top:4px;font-size:7px;font-weight:900;color:#7e87a5}.v32-own.yes{color:#78efc2}
 #v32-detail{position:relative;z-index:3;margin:14px 14px 0;border:1px solid rgba(132,91,241,.44);border-radius:22px;
   background:linear-gradient(155deg,rgba(15,21,52,.97),rgba(5,9,25,.99));box-shadow:0 0 20px rgba(113,70,235,.10);padding:14px}
 .v32-detail-head{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:10px;align-items:center}
 .v32-mini{--c:#a56bff;width:52px;height:52px;border-radius:50%;overflow:hidden;display:grid;place-items:center;border:2px solid var(--c);
   box-shadow:0 0 10px color-mix(in srgb,var(--c) 55%,transparent)}
 .v32-mini img{width:100%;height:100%;object-fit:cover}.v32-mini.gear img,.v32-mini.troop img{object-fit:contain;background:transparent}
 .v32-title h3{margin:0;color:#fff;font-size:20px}.v32-title small{color:#919aba;font-size:9px}
 .v32-owned{display:flex;align-items:center;gap:5px;color:#92a0c1;font-size:8px;font-weight:900}.v32-owned input{width:18px;height:18px}
 .v32-section{margin-top:13px;padding:12px;border:1px solid rgba(113,128,190,.18);border-radius:17px;background:rgba(6,12,31,.48)}
 .v32-kicker{display:flex;justify-content:space-between;gap:8px;margin-bottom:9px;color:#94a1c5;font-size:8px;font-weight:950;letter-spacing:.13em}
 .v32-kicker strong{color:#6ce5ff}
 .v32-levels{display:flex;gap:6px;flex-wrap:wrap}
 .v32-level{min-width:35px;height:35px;padding:0 9px;border-radius:10px;border:1px solid rgba(108,127,190,.25);background:#09122d;color:#8f9abb;font-weight:900}
 .v32-level.active{color:#fff;border-color:#a86cff;background:rgba(112,65,201,.30);box-shadow:0 0 10px rgba(167,102,255,.22)}
 .v32-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .v32-skill{min-width:0;padding:10px;border:1px solid rgba(100,120,184,.19);border-radius:15px;background:rgba(7,13,34,.72)}
 .v32-skill-top{display:grid;grid-template-columns:38px minmax(0,1fr);gap:8px;align-items:center}
 .v32-skill-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;overflow:hidden;border:1px solid #a269ff;color:#b889ff;
   background:radial-gradient(circle,rgba(138,89,255,.24),#08102a 72%);box-shadow:0 0 9px rgba(154,93,255,.27)}
 .v32-skill-icon img{width:100%;height:100%;object-fit:cover}
 .v32-skill h4{margin:0;font-size:11px;color:#fff}.v32-skill p{margin:7px 0 0;color:#aab3ce;font-size:9px;line-height:1.38}
 .v32-result{margin-top:7px;padding:7px 9px;border-radius:10px;background:rgba(111,63,188,.16);border:1px solid rgba(169,105,255,.27);color:#dfd5ff;font-size:9px}
 .v32-stars{display:grid;gap:9px}
 .v32-star-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
 .v32-flower{--fill:0;position:relative;width:38px;height:38px;border:0;background:transparent;padding:0}
 .v32-petal{position:absolute;left:15px;top:4px;width:8px;height:14px;border-radius:8px 8px 4px 4px;background:#1d294e;border:1px solid #43527e;transform-origin:4px 15px}
 .v32-petal.on{background:#58e8f5;border-color:#82f3ff;box-shadow:0 0 7px #43dff2}
 .v32-petal:nth-child(1){transform:rotate(0deg)}.v32-petal:nth-child(2){transform:rotate(60deg)}.v32-petal:nth-child(3){transform:rotate(120deg)}
 .v32-petal:nth-child(4){transform:rotate(180deg)}.v32-petal:nth-child(5){transform:rotate(240deg)}.v32-petal:nth-child(6){transform:rotate(300deg)}
 .v32-special{display:grid;grid-template-columns:34px minmax(0,1fr);gap:8px;align-items:center;padding:9px;border-radius:13px;border:1px solid rgba(238,178,78,.25);background:rgba(65,40,10,.20)}
 .v32-special-icon{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:19px;border:1px solid #ffbd58;box-shadow:0 0 10px rgba(255,180,69,.22)}
 .v32-special b{font-size:10px}.v32-special small{display:block;color:#b5bdd3;font-size:8px;margin-top:2px}
 .v32-range{width:100%;accent-color:#9b63ff}.v32-number{width:100%;padding:10px;border-radius:11px;border:1px solid rgba(105,124,188,.24);background:#08112a;color:#fff}
 .v32-status{display:inline-flex;padding:5px 8px;border-radius:999px;border:1px solid rgba(94,215,255,.3);color:#6ce4ff;font-size:8px;font-weight:950}
 .v32-charm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
 .v32-charm{padding:8px 6px;border-radius:13px;border:1px solid rgba(90,195,255,.20);background:rgba(6,13,34,.68)}
 .v32-charm b{font-size:9px}.v32-charm select{width:100%;margin-top:5px;padding:7px 3px;border-radius:9px;background:#081129;color:#fff;border:1px solid rgba(107,127,188,.24)}
 .v32-progress{height:7px;border-radius:999px;background:#121b3d;overflow:hidden;margin-top:7px;border:1px solid rgba(132,94,242,.25)}
 .v32-progress i{display:block;height:100%;background:linear-gradient(90deg,#7b48ff,#d24dff);box-shadow:0 0 8px #9c55ff}
 .v32-gear-level{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.v32-gear-level select{width:100%;padding:9px;border-radius:10px;background:#081129;color:#fff;border:1px solid rgba(105,124,188,.24)}
 .v32-buffs{display:grid;gap:6px}.v32-buff{padding:8px 9px;border-radius:11px;background:#09132f;border:1px solid rgba(104,124,188,.18);font-size:9px;color:#bec6db}
 .v32-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}.v32-actions button{padding:9px 15px;border-radius:999px;font-size:9px;font-weight:950}
 .v32-reset{border:1px solid rgba(255,79,146,.35);background:rgba(80,15,47,.22);color:#ff8eb8}.v32-save{border:1px solid rgba(65,210,255,.42);background:rgba(10,73,104,.28);color:#81e8ff}
 .v32-msg{min-height:13px;margin-top:6px;text-align:right;color:#75e5ff;font-size:8px}
 @media(max-width:390px){#v32-grid{gap:21px 5px;padding-inline:8px}.v32-skills{grid-template-columns:1fr 1fr}.v32-skill{padding:8px}.v32-detail-head{grid-template-columns:50px minmax(0,1fr) auto}.v32-title h3{font-size:17px}}
 `;
 document.head.appendChild(st);
}

const GEAR_STAGES=[
 ['Green',0,9.35,0],['Green',1,12.75,0],
 ['Blue',0,17,0],['Blue',1,21.25,0],['Blue',2,25.5,0],['Blue',3,29.75,0],
 ['Purple',0,34,0],['Purple',1,36.89,0],['Purple',2,39.78,0],['Purple',3,42.67,0],
 ['Purple T1',0,45.56,0],['Purple T1',1,48.45,0],['Purple T1',2,51.34,0],['Purple T1',3,54.23,0],
 ['Gold',0,56.78,0],['Gold',1,59.33,0],['Gold',2,61.88,0],['Gold',3,64.43,0],
 ['Gold T1',0,66.98,0],['Gold T1',1,69.53,0],['Gold T1',2,72.08,0],['Gold T1',3,74.63,0],
 ['Gold T2',0,77.18,0],['Gold T2',1,79.73,0],['Gold T2',2,82.28,0],['Gold T2',3,85,0],
 ['Red',0,89.25,40],['Red',1,94.56,90],['Red',2,99.88,140],['Red',3,105.19,190],
 ['Red T1',0,110.5,240],['Red T1',1,115.81,290],['Red T1',2,121.13,340],['Red T1',3,126.44,390],
 ['Red T2',0,127.5,400],['Red T2',1,130.69,610],['Red T2',2,134.94,650],['Red T2',3,139.19,780],
 ['Red T3',0,140.25,790],['Red T3',1,144.5,830],['Red T3',2,148.75,870],['Red T3',3,159.8,1040],
 ['Red T4',0,161.5,1050],['Red T4',1,170,1100],['Red T4',2,178.5,1150],['Red T4',3,187,1200],
 ['Red T5',0,195.5,1340],['Red T5',1,204,1390],['Red T5',2,212.5,1440],['Red T5',3,221,1490],
 ['Red T6',0,229.5,1630],['Red T6',1,238,1680],['Red T6',2,246.5,1730],['Red T6',3,255,1780]
];
const CHARM_TOTAL={0:0,1:9,2:12,3:16,4:19,5:25,6:30,7:35,8:40,9:45,10:50,11:55,12:64,13:73,14:82,15:91,16:100};
const PETS={
 'Cave Hyena':{max:50,skill:'Builder’s Aide',levels:[5,7,9,12,15],unit:'Construction Speed',suffix:'%',desc:'Temporarily increases Construction Speed.'},
 'Arctic Wolf':{max:60,skill:'Arctic Embrace',levels:[35,40,45,50,55,60],unit:'Chief Stamina',suffix:'',desc:'Instantly restores Chief Stamina.'},
 'Musk Ox':{max:60,skill:'Burden Bearer',levels:['35h','31h','27h','23h','19h','15h'],unit:'Cooldown',suffix:'',desc:'Instantly completes gathering after reaching the next wilderness resource tile.'},
 'Giant Tapir':{max:70,skill:'Natural Intuition',maxText:'+500 Pet Food'},
 'Titan Roc':{max:70,skill:'Razorbeak',maxText:'Enemy HP -5%'},
 'Snow Leopard':{max:80,skill:'Lightning Raid',maxText:'March Speed +30% • Enemy Lethality -5%'},
 'Giant Elk':{max:80,skill:'Mystical Finding',maxText:'Cooldown 23h'},
 'Cave Lion':{max:100,skill:'Feral Anthem',levels:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'Troop Attack',suffix:'%',desc:'Increases Troop Attack.'},
 'Snow Ape':{max:100,skill:'Tumbling Power',maxText:'Squad Capacity +15,000'},
 'Iron Rhino':{max:100,skill:'Rallying Beasts',maxText:'Rally Capacity +150,000'},
 'Saber-tooth Tiger':{max:100,skill:'Apex Assault',maxText:'Troop Lethality +10%'},
 'Mammoth':{max:100,skill:'Hardened Skin',maxText:'Troop Defense +10%'},
 'Frost Gorilla':{max:100,skill:'Earthbound Vigor',maxText:'Troop Health +10%'},
 'Frostscale Chameleon':{max:100,skill:'Icy Shroud',maxText:'Enemy Defense -10%'}
};
const SPECIAL={
 Natalia:{name:'Ursus Strength',icon:'🐻‍❄️',stats:['Attack','Defense'],vals:[0,2,4,6,8,10]},
 Jeronimo:{name:'Natural Leader',icon:'⚔️',stats:['Lethality','Health'],vals:[0,3,6,9,12,15]}
};

function ensureShell(){
 const sheet=$('#nexa-profile-modal .nexa-profile-sheet'); if(!sheet)return null;
 let shell=$('#nexa-v32'); if(shell)return shell;
 shell=document.createElement('section');shell.id='nexa-v32';
 shell.innerHTML=`<nav id="v32-cats" class="v32-rail"></nav><nav id="v32-filters" class="v32-rail"></nav><div id="v32-grid"></div><div id="v32-detail"></div>`;
 const editRow=$('#nexa-profile-modal .nexa-profile-edit-row');
 if(editRow){editRow.style.display='flex';editRow.after(shell)} else {
   const actions=$('#nexa-v425-profile-actions'); if(actions)actions.after(shell); else sheet.appendChild(shell);
 }
 return shell;
}
async function resolveAccount(){
 if(window.NEXA_ACTIVE_ACCOUNT_ID)return String(window.NEXA_ACTIVE_ACCOUNT_ID);
 const c=sb();if(!c)return null;
 const playerId=$('#nexa-profile-player-id')?.textContent?.trim();
 const {data:{user}}=await c.auth.getUser();if(!user)return null;
 let q=c.from('player_accounts').select('id').eq('user_id',user.id);
 if(playerId)q=q.eq('player_id',playerId);
 const r=await q.order('is_main',{ascending:false}).limit(1).maybeSingle();
 return r.data?.id?String(r.data.id):null;
}
async function load(){
 const c=sb();if(!c)return;
 accountId=await resolveAccount();if(!accountId)return;
 const [a,b]=await Promise.all([
   c.from('nexa_library_items').select('*').eq('is_active',true).order('sort_order').order('name'),
   c.from('player_library_inventory').select('*').eq('player_account_id',accountId)
 ]);
 if(!a.error)items=a.data||[]; if(!b.error)inventory=b.data||[];
 render();
}
function catItems(){
 if(activeCat==='charms') return items.filter(i=>i.item_type==='chief_gear');
 return items.filter(i=>i.item_type===TYPES[activeCat]);
}
function filters(){
 const arr=catItems();
 if(['heroes','experts','pets'].includes(activeCat)){
   const gs=[...new Set(arr.map(genOf))].sort((a,b)=>a-b);
   return ['all',...gs];
 }
 return ['all'];
}
function renderCats(){
 const r=$('#v32-cats');if(!r)return;
 r.innerHTML=Object.entries(CATS).map(([k,v])=>`<button type="button" class="v32-cat ${k===activeCat?'active':''}" data-v32-cat="${k}">${v}</button>`).join('');
}
function renderFilters(){
 const r=$('#v32-filters');if(!r)return;
 const fs=filters(); if(!fs.includes(activeGen))activeGen='all';
 r.innerHTML=fs.map((g,n)=>{
   const label=g==='all'?(activeCat==='heroes'?'ALL':'ALL'):((activeCat==='heroes'&&Number(g)===0)?'EPIC':`GEN ${g}`);
   const c=COLORS[n%COLORS.length];
   return `<button type="button" class="v32-filter ${String(g)===String(activeGen)?'active':''}" style="--c:${c}" data-v32-gen="${g}">${label}</button>`;
 }).join('');
}
function renderGrid(){
 const r=$('#v32-grid');if(!r)return;
 let arr=catItems();
 if(activeGen!=='all')arr=arr.filter(i=>String(genOf(i))===String(activeGen));
 r.innerHTML=arr.map((i,n)=>{
   const p=progOf(i),img=itemImg(i,p),c=colorFor(i,n);
   return `<button type="button" class="v32-item ${String(i.id)===String(selectedId)?'selected':''}" data-v32-item="${esc(i.id)}" data-type="${esc(i.item_type)}" style="--c:${c}">
     <span class="v32-planet">${img?`<img src="${esc(img)}" alt="${esc(i.name)}">`:''}<i class="v32-orbit-dot"></i></span>
     <b>${esc(activeCat==='charms'?`${i.name} Charms`:i.name)}</b>
     <small>${esc(meta(i,p))}</small><span class="v32-own ${ownedOf(i)?'yes':''}">${ownedOf(i)?'OWNED':'NOT OWNED'}</span>
   </button>`;
 }).join('');
}
function skillValue(skill,lv){
 if(!lv)return 'Not active';
 const d=String(skill.description||skill.effect||'');
 const ranges=[...d.matchAll(/(\d+(?:\.\d+)?)\s*%?\s*[–-]\s*(\d+(?:\.\d+)?)%/g)];
 if(ranges.length){
   return ranges.map(m=>{
     const a=Number(m[1]),b=Number(m[2]),v=a+(b-a)*(lv-1)/4;
     return `${skill.effect||'Current effect'} ${Number.isInteger(v)?v:v.toFixed(1)}%`;
   }).join(' • ');
 }
 return skill.effect||d||`Level ${lv}`;
}
function starHTML(p,name){
 const step=clamp(p.star_step ?? Math.round(Number(p.stars||0)*6),0,30);
 const flowers=Array.from({length:5},(_,s)=>{
   const fill=clamp(step-s*6,0,6);
   return `<button type="button" class="v32-flower" data-star-base="${s*6}" aria-label="Star ${s+1}">
    ${Array.from({length:6},(_,k)=>`<i class="v32-petal ${k<fill?'on':''}" data-star-step="${s*6+k+1}"></i>`).join('')}
   </button>`;
 }).join('');
 const full=Math.floor(step/6);
 const sp=SPECIAL[name];
 return `<div class="v32-section v32-stars"><div class="v32-kicker"><span>STARS</span><strong>${full}★ ${step%6?`• ${step%6}/6`:''}</strong></div>
   <div class="v32-star-row">${flowers}</div>
   ${sp?`<div class="v32-special"><span class="v32-special-icon">${sp.icon}</span><div><b>${sp.name}</b><small>${sp.stats[0]} +${sp.vals[full]}% • ${sp.stats[1]} +${sp.vals[full]}%</small></div></div>`:''}
 </div>`;
}
function heroDetail(i,p){
 const skills=i.metadata?.expedition_skills||[];
 const levels=p.hero_skills||{};
 return `${starHTML(p,i.name)}
 <div class="v32-section"><div class="v32-kicker"><span>EXPEDITION SKILLS</span><strong>MAX LEVEL 5</strong></div>
  <div class="v32-skills">${skills.map((s,n)=>{
    const lv=clamp(levels[s.name]??p[`skill_${n+1}`]??0,0,5);
    return `<article class="v32-skill" data-skill-name="${esc(s.name)}">
      <div class="v32-skill-top"><span class="v32-skill-icon">${s.icon?`<img src="${esc(s.icon)}" alt="">`:'✦'}</span><div><h4>${esc(s.name)}</h4><small>${esc(s.effect||'Expedition Skill')}</small></div></div>
      <div class="v32-levels" style="margin-top:8px">${Array.from({length:6},(_,x)=>`<button type="button" class="v32-level ${x===lv?'active':''}" data-hero-skill="${n}" data-level="${x}">${x}</button>`).join('')}</div>
      <p>${esc(s.description||'')}</p><div class="v32-result">${esc(skillValue(s,lv))}</div>
    </article>`;
  }).join('')||'<div class="v32-result">No verified Expedition Skill metadata is stored for this hero yet.</div>'}</div>
 </div>`;
}
function expertStatus(a){
 a=clamp(a,0,100);
 if(a>=100)return 'Intimate';
 if(a>=90)return 'Close III'; if(a>=80)return 'Close II'; if(a>=70)return 'Close I';
 if(a>=60)return 'Casual III'; if(a>=50)return 'Casual II'; if(a>=40)return 'Casual I';
 if(a>=30)return 'Acquaintance III'; if(a>=20)return 'Acquaintance II'; if(a>=10)return 'Acquaintance I';
 return 'Stranger';
}
function expertDetail(i,p){
 const a=clamp(p.affinity||0,0,100), skills=i.metadata?.skills||[], levels=p.expert_skills||{};
 return `<div class="v32-section"><div class="v32-kicker"><span>AFFINITY</span><strong>${a}/100</strong></div>
   <input class="v32-range" type="range" min="0" max="100" step="1" value="${a}" data-v32-affinity>
   <div style="margin-top:8px"><span class="v32-status">${expertStatus(a)}</span></div></div>
 <div class="v32-section"><div class="v32-kicker"><span>EXPERT SKILLS</span><strong>${esc(i.metadata?.specialty||'')}</strong></div>
 <div class="v32-skills">${skills.map((s,n)=>{
   const max=Number(s.max_level||10),lv=clamp(levels[s.name]||0,0,max);
   return `<article class="v32-skill" data-expert-name="${esc(s.name)}"><div class="v32-skill-top"><span class="v32-skill-icon">${s.icon?`<img src="${esc(s.icon)}" alt="">`:'✦'}</span><div><h4>${esc(s.name)}</h4><small>MAX ${max}</small></div></div>
   <input class="v32-range" style="margin-top:9px" type="range" min="0" max="${max}" value="${lv}" data-expert-skill="${n}">
   <div class="v32-result">Level ${lv} • ${esc(s.effect||'')}</div></article>`;
 }).join('')}</div></div>`;
}
function petDetail(i,p){
 const d=PETS[i.name]||{max:100,skill:'Pet Skill',maxText:'Verified skill data pending'};
 const level=clamp(p.level||0,0,d.max), maxSkill=d.levels?.length||10, sl=clamp(p.pet_skill||p.skill_level||0,0,maxSkill);
 let effect=d.maxText||'';
 if(d.levels?.length&&sl) effect=`${d.unit}: ${d.levels[sl-1]}${d.suffix||''}`;
 return `<div class="v32-section"><div class="v32-kicker"><span>PET LEVEL</span><strong>${level}/${d.max}</strong></div>
  <input class="v32-range" type="range" min="0" max="${d.max}" value="${level}" data-pet-level></div>
 <div class="v32-section"><div class="v32-kicker"><span>PET SKILL</span><strong>VISUAL LEVEL ${sl}</strong></div>
  <div class="v32-skill"><div class="v32-skill-top"><span class="v32-skill-icon">🐾</span><div><h4>${esc(d.skill)}</h4><small>${esc(d.desc||'Pet Skill')}</small></div></div>
  <div class="v32-levels" style="margin-top:9px">${Array.from({length:maxSkill+1},(_,x)=>`<button type="button" class="v32-level ${x===sl?'active':''}" data-pet-skill="${x}">${x}</button>`).join('')}</div>
  <div class="v32-result">${sl?esc(effect||`Skill level ${sl}`):'Not active'}</div></div></div>`;
}
function troopDetail(i,p){
 const tier=clamp(p.tier||1,1,12),fc=clamp(p.fc_level||p.fc||0,0,10),t11=!!p.t11_unlocked,t12=!!p.t12_unlocked,skill=clamp(p.advanced_skill||0,0,3);
 const canT12=fc>=5&&t11;
 const t=troopType(i);
 const skillName=t==='infantry'?'Indomitable Wall':t==='lancer'?'Meridian Phalanx':'Starfire';
 const buffs=[];
 if(tier<=10)buffs.push(`Base troop tier: T${tier}`);
 if(t11)buffs.push('T11 Helios unlocked');
 if(t12)buffs.push('T12 Exalted unlocked');
 if(skill)buffs.push(`${skillName} Level ${skill}`);
 return `<div class="v32-section"><div class="v32-kicker"><span>MAXIMUM TROOP TIER</span><strong>T${tier}</strong></div>
  <div class="v32-levels">${Array.from({length:10},(_,x)=>`<button type="button" class="v32-level ${tier===x+1?'active':''}" data-troop-tier="${x+1}">T${x+1}</button>`).join('')}</div></div>
 <div class="v32-section"><div class="v32-kicker"><span>FIRE CRYSTAL / WAR ACADEMY</span><strong>${fc?'FC'+fc:'NONE'}</strong></div>
  <div class="v32-levels"><button class="v32-level ${fc===0?'active':''}" data-troop-fc="0">NONE</button>${Array.from({length:10},(_,x)=>`<button type="button" class="v32-level ${fc===x+1?'active':''}" data-troop-fc="${x+1}">FC${x+1}</button>`).join('')}</div></div>
 <div class="v32-section"><div class="v32-kicker"><span>HELIOS / EXALTED</span><strong>${t12?'T12':t11?'T11':'STANDARD'}</strong></div>
  <label class="v32-owned"><input type="checkbox" data-t11 ${t11?'checked':''}> T11 HELIOS UNLOCKED</label>
  ${canT12?`<label class="v32-owned" style="margin-top:8px"><input type="checkbox" data-t12 ${t12?'checked':''}> T12 EXALTED UNLOCKED</label>`:`<div class="v32-result">T12 path appears after T11 is unlocked and Exalted research becomes available from War Academy FC5–FC10.</div>`}
 </div>
 ${t12?`<div class="v32-section"><div class="v32-kicker"><span>${skillName.toUpperCase()}</span><strong>SKILL LEVEL</strong></div>
  <div class="v32-levels">${['NONE','LEVEL 1','LEVEL 2','LEVEL 3'].map((x,n)=>`<button type="button" class="v32-level ${skill===n?'active':''}" data-troop-skill="${n}">${x}</button>`).join('')}</div></div>`:''}
 <div class="v32-section"><div class="v32-kicker"><span>ACTIVE TROOP BONUSES</span><strong>${buffs.length}</strong></div><div class="v32-buffs">${buffs.map(x=>`<div class="v32-buff">${esc(x)}</div>`).join('')}</div></div>`;
}
function gearDetail(i,p){
 const idx=clamp(p.gear_stage||0,0,GEAR_STAGES.length-1),g=GEAR_STAGES[idx], benefits=i.metadata?.benefits||'Troops';
 return `<div class="v32-section"><div class="v32-kicker"><span>CHIEF GEAR PROGRESS</span><strong>${esc(g[0])} ${'★'.repeat(g[1])}</strong></div>
   <div class="v32-gear-level"><select data-gear-stage>${GEAR_STAGES.map((x,n)=>`<option value="${n}" ${n===idx?'selected':''}>${esc(x[0])} ${x[1]?'★'.repeat(x[1]):'0★'} — +${x[2]}%</option>`).join('')}</select><span class="v32-status">+${g[2]}%</span></div>
   <div class="v32-result">${esc(benefits)} Attack +${g[2]}% • ${esc(benefits)} Defense +${g[2]}%${g[3]?` • Deployment +${g[3]}`:''}</div>
 </div>`;
}
function charmDetail(i,p){
 const levels=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
 const subs=Array.isArray(p.charm_substeps)?p.charm_substeps:[0,0,0];
 const type=i.metadata?.benefits||'Troops';
 return `<div class="v32-section"><div class="v32-kicker"><span>${esc(i.name)} CHARMS</span><strong>3 LINKED CHARMS</strong></div>
 <div class="v32-charm-grid">${[0,1,2].map(n=>{
   const lv=clamp(levels[n]||0,0,18),sub=clamp(subs[n]||0,0,4),total=CHARM_TOTAL[lv];
   return `<div class="v32-charm"><b>CHARM ${n+1}</b><select data-charm-level="${n}">${Array.from({length:19},(_,x)=>`<option value="${x}" ${x===lv?'selected':''}>LV ${x}</option>`).join('')}</select>
   <div class="v32-progress" title="Sub-level progress"><i style="width:${sub*25}%"></i></div>
   <div class="v32-levels" style="margin-top:6px">${[0,1,2,3,4].map(x=>`<button type="button" class="v32-level ${sub===x?'active':''}" data-charm-sub="${n}:${x}" style="min-width:25px;height:27px;padding:0 4px">${x}</button>`).join('')}</div>
   <div class="v32-result">${total!=null?`${esc(type)} charm stat total +${total}%`:`LV ${lv} — verified sub-level table pending catalog sync`}</div></div>`;
 }).join('')}</div></div>`;
}
function renderDetail(){
 const r=$('#v32-detail');if(!r)return;
 const i=items.find(x=>String(x.id)===String(selectedId));
 if(!i){r.innerHTML='';return}
 const p=progOf(i),img=itemImg(i,p),c=colorFor(i,catItems().indexOf(i));
 let body=activeCat==='heroes'?heroDetail(i,p):activeCat==='experts'?expertDetail(i,p):activeCat==='pets'?petDetail(i,p):activeCat==='troops'?troopDetail(i,p):activeCat==='gear'?gearDetail(i,p):charmDetail(i,p);
 r.innerHTML=`<div class="v32-detail-head"><span class="v32-mini ${i.item_type==='chief_gear'?'gear':i.item_type==='troop'?'troop':''}" style="--c:${c}">${img?`<img src="${esc(img)}" alt="">`:''}</span>
 <div class="v32-title"><h3>${esc(activeCat==='charms'?`${i.name} Charms`:i.name)}</h3><small>${esc(meta(i,p))}</small></div>
 <label class="v32-owned"><input type="checkbox" data-v32-owned ${ownedOf(i)?'checked':''}> OWNED</label></div>${body}
 <div class="v32-actions"><button type="button" class="v32-reset" data-v32-reset>RESET</button><button type="button" class="v32-save" data-v32-save>SAVE</button></div><div class="v32-msg"></div>`;
}
function render(){ensureShell();renderCats();renderFilters();renderGrid();renderDetail();placeEdit()}
function placeEdit(){
 const row=$('#nexa-profile-modal .nexa-profile-edit-row'),shell=$('#nexa-v32');
 if(row&&shell&&row.nextElementSibling!==shell)row.after(shell);
}
function draft(){
 const i=items.find(x=>String(x.id)===String(selectedId)); if(!i)return null;
 return structuredClone(progOf(i)||{});
}
async function save(){
 const i=items.find(x=>String(x.id)===String(selectedId)),c=sb();if(!i||!c||!accountId)return;
 const d=draft()||{};
 const root=$('#v32-detail');
 if(activeCat==='heroes'){
   const lit=$$('.v32-petal.on',root).length; d.star_step=lit;d.stars=lit/6;
   d.hero_skills={};$$('[data-skill-name]',root).forEach((box,n)=>{const a=$('.v32-level.active[data-hero-skill]',box);d.hero_skills[box.dataset.skillName]=Number(a?.dataset.level||0)});
 }else if(activeCat==='experts'){
   d.affinity=Number($('[data-v32-affinity]',root)?.value||0);d.expert_skills={};
   $$('[data-expert-name]',root).forEach((box,n)=>{d.expert_skills[box.dataset.expertName]=Number($('[data-expert-skill]',box)?.value||0)});
 }else if(activeCat==='pets'){
   d.level=Number($('[data-pet-level]',root)?.value||0);d.pet_skill=Number($('[data-pet-skill].active',root)?.dataset.petSkill||0);
 }else if(activeCat==='troops'){
   d.tier=Number($('[data-troop-tier].active',root)?.dataset.troopTier||1);d.fc_level=Number($('[data-troop-fc].active',root)?.dataset.troopFc||0);
   d.t11_unlocked=!!$('[data-t11]',root)?.checked;d.t12_unlocked=!!$('[data-t12]',root)?.checked;d.advanced_skill=Number($('[data-troop-skill].active',root)?.dataset.troopSkill||0);
 }else if(activeCat==='gear'){d.gear_stage=Number($('[data-gear-stage]',root)?.value||0)}
 else if(activeCat==='charms'){
   d.charm_levels=[0,1,2].map(n=>Number($(`[data-charm-level="${n}"]`,root)?.value||0));
   d.charm_substeps=[0,1,2].map(n=>Number($(`[data-charm-sub^="${n}:"]`.replace('"]','"].active'),root)?.dataset.charmSub?.split(':')[1]||0));
   d.charm_1=d.charm_levels[0];d.charm_2=d.charm_levels[1];d.charm_3=d.charm_levels[2];
 }
 const {data:{user}}=await c.auth.getUser();if(!user)return;
 const owned=!!$('[data-v32-owned]',root)?.checked;
 const q=await c.from('player_library_inventory').upsert({user_id:user.id,player_account_id:accountId,library_item_id:i.id,owned,progress:d,updated_at:new Date().toISOString()},{onConflict:'player_account_id,library_item_id'}).select().single();
 const msg=$('.v32-msg',root);if(q.error){if(msg)msg.textContent=q.error.message;return}
 const pos=inventory.findIndex(x=>String(x.library_item_id)===String(i.id));if(pos>=0)inventory[pos]=q.data;else inventory.push(q.data);
 if(msg)msg.textContent='Saved ✓';renderGrid();
}
async function reset(){
 const i=items.find(x=>String(x.id)===String(selectedId)),c=sb();if(!i||!c||!accountId)return;
 const row=invOf(i);
 if(row){
   const q=await c.from('player_library_inventory').update({owned:false,progress:{},updated_at:new Date().toISOString()}).eq('id',row.id).select().single();
   if(!q.error){const pos=inventory.findIndex(x=>x.id===row.id);inventory[pos]=q.data}
 }
 renderGrid();renderDetail();
}

document.addEventListener('click',e=>{
 const cat=e.target.closest?.('[data-v32-cat]');if(cat){activeCat=cat.dataset.v32Cat;activeGen='all';selectedId=null;render();return}
 const gen=e.target.closest?.('[data-v32-gen]');if(gen){activeGen=gen.dataset.v32Gen;selectedId=null;renderFilters();renderGrid();renderDetail();return}
 const item=e.target.closest?.('[data-v32-item]');if(item){selectedId=item.dataset.v32Item;renderGrid();renderDetail();return}
 const petal=e.target.closest?.('[data-star-step]');if(petal){
   const step=Number(petal.dataset.starStep);$$('.v32-petal', $('#v32-detail')).forEach(x=>x.classList.toggle('on',Number(x.dataset.starStep)<=step));
   const i=items.find(x=>String(x.id)===String(selectedId)),p=draft()||{};p.star_step=step;
   const sec=petal.closest('.v32-stars');if(sec&&i){const temp=document.createElement('div');temp.innerHTML=starHTML(p,i.name);sec.replaceWith(temp.firstElementChild)}return;
 }
 const hs=e.target.closest?.('[data-hero-skill]');if(hs){const box=hs.closest('.v32-skill');$$('[data-hero-skill]',box).forEach(x=>x.classList.toggle('active',x===hs));const i=items.find(x=>String(x.id)===String(selectedId)),s=i?.metadata?.expedition_skills?.[Number(hs.dataset.heroSkill)];const res=$('.v32-result',box);if(res&&s)res.textContent=skillValue(s,Number(hs.dataset.level));return}
 const ps=e.target.closest?.('[data-pet-skill]');if(ps){$$('[data-pet-skill]',ps.closest('.v32-skill')).forEach(x=>x.classList.toggle('active',x===ps));const i=items.find(x=>String(x.id)===String(selectedId));const p=draft()||{};p.pet_skill=Number(ps.dataset.petSkill);const sec=ps.closest('.v32-section');if(sec&&i){const temp=document.createElement('div');temp.innerHTML=petDetail(i,p);const parts=temp.children;sec.replaceWith(parts[1])}return}
 const tt=e.target.closest?.('[data-troop-tier]');if(tt){$$('[data-troop-tier]',tt.closest('.v32-section')).forEach(x=>x.classList.toggle('active',x===tt));return}
 const tf=e.target.closest?.('[data-troop-fc]');if(tf){$$('[data-troop-fc]',tf.closest('.v32-section')).forEach(x=>x.classList.toggle('active',x===tf));return}
 const ts=e.target.closest?.('[data-troop-skill]');if(ts){$$('[data-troop-skill]',ts.closest('.v32-section')).forEach(x=>x.classList.toggle('active',x===ts));return}
 const cs=e.target.closest?.('[data-charm-sub]');if(cs){const [n]=cs.dataset.charmSub.split(':');$$(`[data-charm-sub^="${n}:"]`,cs.closest('.v32-charm')).forEach(x=>x.classList.toggle('active',x===cs));const bar=$('.v32-progress i',cs.closest('.v32-charm'));if(bar)bar.style.width=(Number(cs.dataset.charmSub.split(':')[1])*25)+'%';return}
 if(e.target.closest?.('[data-v32-save]')){save();return}
 if(e.target.closest?.('[data-v32-reset]')){reset();return}
},true);

document.addEventListener('input',e=>{
 if(e.target.matches?.('[data-v32-affinity]')){const badge=$('.v32-status',e.target.closest('.v32-section'));if(badge)badge.textContent=expertStatus(e.target.value)}
 if(e.target.matches?.('[data-expert-skill]')){const box=e.target.closest('.v32-skill'),res=$('.v32-result',box);if(res){const i=items.find(x=>String(x.id)===String(selectedId)),s=i?.metadata?.skills?.[Number(e.target.dataset.expertSkill)];res.textContent=`Level ${e.target.value} • ${s?.effect||''}`}}
},true);

function boot(){css();ensureShell();load();[100,300,700].forEach(ms=>setTimeout(()=>{ensureShell();placeEdit()},ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{ensureShell();load()},100));
})();
