/* NEXA V43.9 — WIDGETS + CHARMS + PROFILE CLEANUP — 2026-08-24
   Single focused runtime for the remaining Profile/Admin conflicts.
   Does NOT modify Heroes, Experts, Troops, or Library data.
   Fixes: Pets, Ministry visual ownership, legacy Ministry card cleanup,
   Charms re-entry, Main Account/Alliance polish, Owner Roles + Module Access.
   No MutationObserver. No polling. No manual scrollLeft. No touchmove preventDefault.
*/
(()=>{
'use strict';
if(window.__NEXA_V439_STABLE_RUNTIME__)return;
window.__NEXA_V439_STABLE_RUNTIME__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const pad=n=>String(Math.max(0,Number(n)||0)).padStart(2,'0');
function sb(){return window.supabaseClient?.from?window.supabaseClient:(window.sb?.from?window.sb:null)}

const PETS={
 'Cave Hyena':['Builder’s Aide','🐕',['Construction Speed +5%','Construction Speed +7%','Construction Speed +9%','Construction Speed +12%','Construction Speed +15%'],['23h','23h','23h','23h','23h'],'Skilled hyenas deliver tools to architects, increasing Construction Speed.','#67dfff','#17384a'],
 'Arctic Wolf':['Arctic Embrace','🐺',['Stamina +35','Stamina +40','Stamina +45','Stamina +50','Stamina +55','Stamina +60'],['23h','23h','23h','23h','23h','23h'],'The wolf restores Stamina when the skill is activated.','#8be8ff','#1b3c65'],
 'Musk Ox':['Burden Bearer','🐂',Array(6).fill('Instantly completes gathering at the next wilderness resource tile'),['35h','31h','27h','23h','19h','15h'],"Harnessing the Musk Ox's strength and endurance instantly completes gathering upon reaching the next wilderness resource tile. Secured Alliance Gathering Nodes are excluded.",'#d0a46b','#51351f'],
 'Giant Tapir':['Natural Intuition','🐗',['Pet Food +200','Pet Food +250','Pet Food +300','Pet Food +350','Pet Food +400','Pet Food +450','Pet Food +500'],Array(7).fill('23h'),'Natural intuition helps discover extra Pet Food.','#b59b7c','#3f3227'],
 'Titan Roc':['Razorbeak','🦅',['Enemy HP -1.5%','Enemy HP -2%','Enemy HP -2.5%','Enemy HP -3%','Enemy HP -3.5%','Enemy HP -4%','Enemy HP -5%'],Array(7).fill('20h'),'Razorbeak weakens enemy troop Health.','#c3a4ff','#32265b'],
 'Giant Elk':['Mystical Finding','🦌',Array(8).fill('Unearths an item lost on the Tundra'),['51h','47h','43h','39h','35h','31h','27h','23h'],'Guided by mystical intuition, the Giant Elk unearths an item lost on the Tundra.','#7bd9c7','#21473f'],
 'Snow Leopard':['Lightning Raid','🐆',['March Speed +15% • Enemy Lethality -1.5%','March Speed +17% • Enemy Lethality -2%','March Speed +19% • Enemy Lethality -2.5%','March Speed +21% • Enemy Lethality -3%','March Speed +23% • Enemy Lethality -3.5%','March Speed +25% • Enemy Lethality -4%','March Speed +27% • Enemy Lethality -4.5%','March Speed +30% • Enemy Lethality -5%'],Array(8).fill('20h'),'A rapid assault boosts March Speed while lowering enemy Lethality.','#aeeeff','#24446f'],
 'Cave Lion':['Feral Anthem','🦁',['Troop Attack +2.5%','Troop Attack +3%','Troop Attack +3.5%','Troop Attack +4%','Troop Attack +5%','Troop Attack +6%','Troop Attack +7%','Troop Attack +8%','Troop Attack +9%','Troop Attack +10%'],null,'A battle anthem increases Troop Attack.','#ffb24e','#5d3416'],
 'Snow Ape':['Tumbling Power','🦍',['Squad Capacity +1,500','Squad Capacity +3,000','Squad Capacity +4,500','Squad Capacity +6,000','Squad Capacity +7,500','Squad Capacity +9,000','Squad Capacity +10,500','Squad Capacity +12,000','Squad Capacity +13,500','Squad Capacity +15,000'],null,'Tumbling Power increases Squad Capacity.','#f2fbff','#486175'],
 'Iron Rhino':['Rallying Beasts','🦏',['Rally Capacity +60,000','Rally Capacity +70,000','Rally Capacity +80,000','Rally Capacity +90,000','Rally Capacity +100,000','Rally Capacity +110,000','Rally Capacity +120,000','Rally Capacity +130,000','Rally Capacity +140,000','Rally Capacity +150,000'],null,'Rallying Beasts increases Rally Capacity.','#aeb7c2','#3d444c'],
 'Saber-tooth Tiger':['Apex Assault','🐅',['Troop Lethality +2.5%','Troop Lethality +3%','Troop Lethality +3.5%','Troop Lethality +4%','Troop Lethality +5%','Troop Lethality +6%','Troop Lethality +7%','Troop Lethality +8%','Troop Lethality +9%','Troop Lethality +10%'],null,'Apex Assault increases Troop Lethality.','#ff8438','#612910'],
 'Mammoth':['Hardened Skin','🐘',['Troop Defense +2.5%','Troop Defense +3%','Troop Defense +3.5%','Troop Defense +4%','Troop Defense +5%','Troop Defense +6%','Troop Defense +7%','Troop Defense +8%','Troop Defense +9%','Troop Defense +10%'],null,'Hardened Skin increases Troop Defense.','#d7bd93','#533f2d'],
 'Frost Gorilla':['Earthbound Vigor','🦍',['Troop Health +2.5%','Troop Health +3%','Troop Health +3.5%','Troop Health +4%','Troop Health +5%','Troop Health +6%','Troop Health +7%','Troop Health +8%','Troop Health +9%','Troop Health +10%'],null,'Earthbound Vigor increases Troop Health.','#508bff','#192c63'],
 'Frostscale Chameleon':['Icy Shroud','🦎',['Enemy Defense -2.5%','Enemy Defense -3%','Enemy Defense -3.5%','Enemy Defense -4%','Enemy Defense -5%','Enemy Defense -6%','Enemy Defense -7%','Enemy Defense -8%','Enemy Defense -9%','Enemy Defense -10%'],null,'Icy Shroud lowers Enemy Defense.','#5de9c0','#174f45']
};
const PET_ALIAS={'Frost Chameleon':'Frostscale Chameleon','Sabertooth Tiger':'Saber-tooth Tiger','Saber Tooth Tiger':'Saber-tooth Tiger'};
const OPS=[['battle_strategist','Battle Strategist'],['event_operator','Event Operator'],['scheduler','Scheduler'],['transfer_coordinator','Transfer Coordinator']];
const MODULES=[['svs_access','SvS'],['transfer_access','Transfer'],['sbs_access','SBS'],['team_builder_access','Team Builder'],['forms_access','Forms'],['events_access','Events'],['library_access','Library'],['administration_access','Administration']];

function css(){
 if($('#nexa-v437-css'))return;
 const s=document.createElement('style');s.id='nexa-v437-css';s.textContent=`
 #nexa-v425-ministry{
   width:auto!important;min-width:188px!important;height:42px!important;min-height:42px!important;
   display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;
   padding:0 15px 0 42px!important;border-radius:999px!important;font-size:0!important;
   color:#70e9ff!important;border:1px solid rgba(75,224,255,.72)!important;
   background-color:#08152d!important;
   background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='4.5' y='5.5' width='15' height='14' rx='2.4' fill='none' stroke='%236fe9ff' stroke-width='1.8'/%3E%3Cpath d='M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4' fill='none' stroke='%236fe9ff' stroke-width='1.8' stroke-linecap='round'/%3E%3Cpath d='M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z' fill='%236fe9ff'/%3E%3C/svg%3E"),linear-gradient(135deg,rgba(8,40,65,.98),rgba(9,14,38,.98))!important;
   background-size:20px 20px,auto!important;background-repeat:no-repeat!important;background-position:14px center,center!important;
   box-shadow:0 0 15px rgba(67,220,255,.28)!important
 }
 #nexa-v425-ministry>*{display:none!important}
 #nexa-v425-ministry:after{content:'MINISTRY APPOINTMENTS';display:block!important;color:#79ebff!important;font-size:9px!important;font-weight:950!important;letter-spacing:.08em!important;white-space:nowrap!important}
 #nexa-v425-ministry[data-v33-ministry-active='1']{animation:nexaV437MinistryPulse 1.8s ease-in-out infinite!important}
 @keyframes nexaV437MinistryPulse{50%{box-shadow:0 0 22px rgba(72,229,255,.52),0 0 38px rgba(83,104,255,.22)!important}}

 .nexa-v437-pet{--pet:#70eaff;--petbg:#17384a;padding:12px;border:1px solid color-mix(in srgb,var(--pet) 40%,transparent);border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--petbg) 42%,#071128),#071020)}
 .nexa-v437-pet-head{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;align-items:center;width:100%;padding:0;border:0;background:transparent;color:#fff;text-align:left}
 .nexa-v437-pet-orb{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-size:28px;border:1px solid color-mix(in srgb,var(--pet) 75%,white 10%);background:radial-gradient(circle,color-mix(in srgb,var(--pet) 16%,var(--petbg)),#071225 70%);box-shadow:0 0 12px color-mix(in srgb,var(--pet) 70%,transparent),0 0 30px color-mix(in srgb,var(--pet) 28%,transparent);filter:drop-shadow(0 0 5px var(--pet))}
 .nexa-v437-pet-copy b{display:block;font-size:13px}.nexa-v437-pet-copy small{display:block;margin-top:3px;color:var(--pet);font-size:8px;font-weight:950;letter-spacing:.09em}
 .nexa-v437-pet-desc{margin:9px 0 0;padding:9px 10px;border-radius:11px;background:rgba(4,10,27,.55);color:#cbd3e7;font-size:10px;line-height:1.45}
 .nexa-v437-pet select{width:100%;margin-top:9px;padding:9px 10px;border:1px solid rgba(115,139,199,.26);border-radius:11px;background:#071027;color:#fff;font-size:16px}
 .nexa-v437-pet-result{display:grid;gap:3px;margin-top:9px;padding:10px;border-radius:12px;border:1px solid color-mix(in srgb,var(--pet) 35%,transparent);background:color-mix(in srgb,var(--pet) 8%,#081027)}
 .nexa-v437-pet-result small{color:#8d99b9;font-size:8px;font-weight:950;letter-spacing:.12em}.nexa-v437-pet-result strong{color:var(--pet);font-size:12px}.nexa-v437-pet-result span{color:#b0bad2;font-size:9px}

 .nexa-v437-main{display:inline-flex!important;width:max-content!important;max-width:100%!important;padding:5px 9px!important;border:1px solid rgba(255,211,96,.35)!important;border-radius:999px!important;background:rgba(72,51,13,.22)!important;color:#ffd879!important;font-size:8px!important;font-weight:950!important;letter-spacing:.08em!important;white-space:nowrap!important}
 .nexa-v437-alliance-note{display:grid;gap:2px;margin:3px 0 6px}.nexa-v437-alliance-note b{color:#75e7ff;font-size:9px}.nexa-v437-alliance-note small{color:#8e99b9;font-size:8px;line-height:1.3}

 #nexa-v437-owner-manager,.nexa-v438-owner-manager{display:grid;gap:13px;margin:12px 0 16px;padding:14px;border:1px solid rgba(78,213,255,.32);border-radius:18px;background:linear-gradient(145deg,rgba(7,29,50,.92),rgba(7,10,31,.97));box-shadow:0 0 25px rgba(57,188,255,.08)}
 #nexa-v437-owner-manager .v437-title,.nexa-v438-owner-manager .v437-title{color:#82eaff;font-size:9px;font-weight:950;letter-spacing:.13em}
 #nexa-v437-owner-manager label,.nexa-v438-owner-manager label{display:grid;gap:5px;color:#9ba7c5;font-size:8px;font-weight:950;letter-spacing:.08em}
 #nexa-v437-owner-manager select,.nexa-v438-owner-manager select{width:100%;padding:10px;border:1px solid rgba(112,136,201,.28);border-radius:11px;background:#071027;color:#fff;font-size:16px}
 .v437-badges{display:flex;gap:6px;flex-wrap:wrap}.v437-badge{border:1px solid rgba(72,209,255,.36);border-radius:999px;padding:6px 9px;background:rgba(13,51,72,.62);color:#d4f8ff;font-size:8px;font-weight:900}.v437-badge.mod{border-color:rgba(166,107,255,.38);background:rgba(48,28,83,.58);color:#eadfff}
 .v437-add{width:max-content;border:0;background:transparent;color:#72e3ff;padding:0;font-size:9px;font-weight:900}.v437-msg{min-height:14px;color:#8debc7;font-size:9px}
 .v437-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v437-check-grid label{display:flex!important;flex-direction:row!important;align-items:center!important;gap:7px!important;padding:8px;border:1px solid rgba(255,255,255,.10);border-radius:11px;background:rgba(5,11,29,.52);font-size:9px!important;letter-spacing:0!important;color:#cbd3e7!important}.v437-check-grid input{width:18px!important;height:18px!important}

/* V43.8 — restore the working widget table + compact Transfer heading. */
.nexa-v438-widget-table .v33-skills{
  display:grid!important;
  grid-template-columns:1fr!important;
  gap:8px!important;
}
.nexa-v438-widget-table .v33-skill{
  display:grid!important;
  grid-template-columns:minmax(115px,.85fr) minmax(0,1.7fr) minmax(92px,.62fr)!important;
  gap:10px!important;
  align-items:center!important;
  padding:11px 12px!important;
  min-height:0!important;
}
.nexa-v438-widget-name b{display:block!important;color:#fff!important;font-size:12px!important;line-height:1.25!important}
.nexa-v438-widget-name span{display:block!important;margin-top:3px!important;color:#77e9ff!important;font-size:8px!important;font-weight:950!important;letter-spacing:.12em!important}
.nexa-v438-widget-desc{color:#c8cfe2!important;font-size:10px!important;line-height:1.4!important}
.nexa-v438-widget-buff{padding:8px 9px!important;border:1px solid rgba(152,93,255,.40)!important;border-radius:10px!important;background:rgba(79,40,143,.22)!important;color:#fff!important;font-size:11px!important;font-weight:900!important;text-align:center!important}
.nexa-v438-widget-buff small{display:block!important;margin-top:3px!important;color:#aeb7d1!important;font-size:8px!important;font-weight:700!important}
@media(max-width:520px){
  .nexa-v438-widget-table .v33-skill{
    grid-template-columns:minmax(92px,.75fr) minmax(0,1.5fr) minmax(84px,.65fr)!important;
    gap:7px!important;
  }
  .nexa-v438-widget-desc{font-size:9px!important}
}
#nexa-v430-transfer-card h3,
#nexa-transfer-card h3,
[data-nexa-transfer] h3,
#home-transfers-section h2,
#home-transfers-section h3{
  font-size:16px!important;
  line-height:1.15!important;
  margin:3px 0 4px!important;
}
.v33-charm-img{
  width:76px!important;height:76px!important;
  object-fit:contain!important;
  display:block!important;
  background:transparent!important;
  opacity:1!important;
  visibility:visible!important;
}

 `;document.head.appendChild(s);
}

function schedule(fn){requestAnimationFrame(fn);[0,40,120,280,600].forEach(ms=>setTimeout(fn,ms))}

function petName(){
 const raw=($('#nexa-v33-detail .v33-title h3')?.textContent||'').trim();
 return PET_ALIAS[raw]||raw;
}
function repairPet(){
 const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
 const name=petName(),p=PETS[name];if(!p)return;
 const sec=$$('.v33-section',root).find(x=>/PET SKILL/i.test($('.v33-kicker span',x)?.textContent||''));
 if(!sec)return;
 const old=$('[data-v33-pet-skill]',sec);
 const max=p[2].length,lv=clamp(Number(old?.value||0),0,max);
 sec.innerHTML=`<div class="v33-kicker"><span>PET SKILL</span><strong>LEVEL ${lv}</strong></div><div class="nexa-v437-pet" style="--pet:${p[5]};--petbg:${p[6]}"><button type="button" class="nexa-v437-pet-head" aria-expanded="false"><span class="nexa-v437-pet-orb" aria-hidden="true">${p[1]}</span><span class="nexa-v437-pet-copy"><b>${esc(p[0])}</b><small>TAP TO VIEW PET SKILL</small></span></button><div class="nexa-v437-pet-desc" hidden>${esc(p[4])}</div><select data-v33-pet-skill>${Array.from({length:max+1},(_,i)=>`<option value="${i}" ${i===lv?'selected':''}>${i}</option>`).join('')}</select><div class="nexa-v437-pet-result"><small>PET BUFF</small><strong>${lv?esc(p[2][lv-1]):'Not active'}</strong>${lv&&p[3]?.[lv-1]?`<span>Cooldown: ${esc(p[3][lv-1])}</span>`:''}</div></div>`;
 const head=$('.nexa-v437-pet-head',sec),desc=$('.nexa-v437-pet-desc',sec);
 head.onclick=()=>{desc.hidden=!desc.hidden;head.setAttribute('aria-expanded',String(!desc.hidden))};
}

function charmType(text=''){
 const s=String(text).toLowerCase();
 if(/coat|pants|infantry/.test(s))return'infantry';
 if(/helmet|watch|lancer/.test(s))return'lancer';
 if(/ring|short\s*staff|shortstaff|marksman/.test(s))return'marksman';
 return'';
}
function repairCharms(){
 const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
 const title=($('#nexa-v33-detail .v33-title h3')?.textContent||'');
 const type=charmType(title+' '+root.textContent);if(!type)return;
 $$('[data-v33-charm-level]',root).forEach(sel=>{
   const lv=clamp(Number(sel.value||0),0,18);if(!lv)return;
   const row=sel.closest('.v33-charm,.v33-section,div');if(!row)return;
   let img=$('img.v33-charm-img,img',row);
   const src=`/lv${pad(lv)}-${type}.png`;
   if(!img){
     const q=$$('i,span,div',row).find(x=>!x.children.length&&/^\s*[?◇]\s*$/.test(x.textContent||''));
     if(q){img=document.createElement('img');img.className='v33-charm-img';q.replaceWith(img)}
   }
   if(img){img.src=src;img.alt=`${type} Charm Lv ${lv}`;img.style.opacity='1';img.style.visibility='visible';img.style.display='block'}
 });
}

function cleanupProfile(){
 const root=$('#nexa-profile-modal');if(!root)return;
 $$('*',root).forEach(el=>{
   if(el.children.length)return;
   const t=(el.textContent||'').trim();
   if(/^This is your main account\.?$/i.test(t)){el.textContent='★ MAIN ACCOUNT';el.classList.add('nexa-v437-main')}
 });
 $$('select',root).forEach(sel=>{
   if(sel.dataset.v437Alliance==='1')return;
   const w=sel.closest('label,.form-group,.profile-field,.nexa-profile-field,div');if(!w)return;
   if(!/alliance/i.test(w.textContent||''))return;
   const note=document.createElement('div');note.className='nexa-v437-alliance-note';note.innerHTML='<b>Change Alliance</b><small>Select your new alliance below, then use the existing Save Profile button.</small>';sel.before(note);sel.dataset.v437Alliance='1';
 });
 // Retire the legacy visible Ministry schedule card but never the new button or overlay.
 $$('section,article,.card,.panel,div',root).forEach(el=>{
   if(el.closest('#nexa-v425-ministry,#nexa-v33-ministry-overlay'))return;
   const t=(el.textContent||'').replace(/\s+/g,' ').trim();
   if(t.length>0&&t.length<650&&/Ministry Schedule/i.test(t)){el.style.display='none';el.setAttribute('aria-hidden','true')}
 });
}

async function ownerManager(){
 const host=$('#admin-roles .nexa-v25-host')||$('#admin-roles');if(!host)return;
 const c=sb();if(!c)return;
 let user,role='';
 try{({data:{user}}=await c.auth.getUser());if(!user)return;role=String((await c.rpc('current_nexa_role')).data||'').toLowerCase()}catch{return}
 if(role!=='owner')return;
 let box=$('#nexa-v437-owner-manager');if(!box){box=document.createElement('section');box.id='nexa-v437-owner-manager';host.prepend(box)}
 let accounts=[],roles=[],access={};
 try{
   const [a,r,m]=await Promise.all([
     c.from('player_accounts').select('id,in_game_name,player_id,is_main').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at',{ascending:true}),
     c.from('nexa_operational_roles').select('role').eq('user_id',user.id),
     c.from('staff_module_access').select('*').eq('user_id',user.id).maybeSingle()
   ]);
   accounts=a.data||[];roles=(r.data||[]).map(x=>x.role);access=m.data||{};
 }catch{}
 const accountOptions=accounts.map(a=>`<option value="${esc(a.id)}">${esc(a.in_game_name||'Account')} • ID ${esc(a.player_id||'—')}${a.is_main?' • MAIN':''}</option>`).join('');
 const roleOptions=OPS.filter(([k])=>!roles.includes(k)).map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
 box.innerHTML=`<div class="v437-title">MY NEXA WORK ACCESS</div><label>ACCOUNT<select data-v437-account>${accountOptions||'<option>My NEXA account</option>'}</select></label><label>OPERATIONAL ROLE<select data-v437-role><option value="">Add operational role…</option>${roleOptions}</select></label><div class="v437-badges">${roles.map(k=>`<button type="button" class="v437-badge" data-v437-remove-role="${k}">${esc(OPS.find(x=>x[0]===k)?.[1]||k)} ×</button>`).join('')||'<small>No operational roles selected.</small>'}</div><button type="button" class="v437-add" data-v437-focus-role>+ Add another operational role</button><div><label style="margin-bottom:6px">MODULE ACCESS</label><div class="v437-check-grid">${MODULES.map(([k,n])=>`<label><input type="checkbox" data-v437-module="${k}" ${access[k]?'checked':''}>${n}</label>`).join('')}</div></div><div class="v437-msg" data-v437-msg></div>`;
 const msg=$('[data-v437-msg]',box);
 $('[data-v437-role]',box).onchange=async e=>{const v=e.target.value;if(!v)return;msg.textContent='Saving…';const q=await c.rpc('nexa_owner_add_my_operational_role',{new_role:v});msg.textContent=q.error?(q.error.message||'Could not add role.'):'Role added ✓';if(!q.error)schedule(ownerManager)};
 $$('[data-v437-remove-role]',box).forEach(b=>b.onclick=async()=>{msg.textContent='Saving…';const q=await c.rpc('nexa_owner_remove_my_operational_role',{old_role:b.dataset.v437RemoveRole});msg.textContent=q.error?(q.error.message||'Could not remove role.'):'Role removed ✓';if(!q.error)schedule(ownerManager)});
 $('[data-v437-focus-role]',box).onclick=()=> $('[data-v437-role]',box)?.focus();
 $$('[data-v437-module]',box).forEach(ch=>ch.onchange=async()=>{
   msg.textContent='Saving module access…';
   const state=Object.fromEntries(MODULES.map(([k])=>[k,!!$(`[data-v437-module="${k}"]`,box)?.checked]));
   const q=await c.rpc('nexa_owner_set_my_module_access',{new_svs:state.svs_access,new_transfer:state.transfer_access,new_sbs:state.sbs_access,new_team_builder:state.team_builder_access,new_forms:state.forms_access,new_events:state.events_access,new_library:state.library_access,new_administration:state.administration_access});
   msg.textContent=q.error?(q.error.message||'Could not save module access.'):'Module access updated ✓';
 });
 // Hide only the Owner's legacy checkbox surfaces; leave other staff cards visible.
 $$('.nexa-v25-panel',host).forEach(p=>{if(p===box)return;const txt=(p.textContent||'');if(/Owner Main Access Protected/i.test(txt))$$('.nexa-v25-checks',p).forEach(x=>x.style.display='none')});
}

function apply(){css();repairPet();repairCharms();cleanupProfile();ownerManager()}
function defer(){schedule(apply)}

document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-v33-item],[data-v33-cat],[data-v33-gen],[data-v33-save],#nexa-profile-launcher-section,[data-open-full-profile],#admin-roles,.nexa-v25-arrow,.nexa-v25-access-result'))defer();
},true);
document.addEventListener('change',e=>{
 if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level],#nexa-profile-modal select'))defer();
},true);
window.addEventListener('nexa:profile-open',defer);
window.addEventListener('nexa:profile-updated',defer);
window.addEventListener('nexa:auth-ready',defer);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',defer,{once:true});else defer();

/* =========================================================
   V43.8 RESTORE ONLY — do not touch Pets/Heroes/Experts art.
   ========================================================= */

/* Known widget table behavior that was working before V43.7.
   Widget effects advance independently:
   Exploration at 1/3/5/7/9; Expedition at 2/4/6/8/10. */
const V438_EXP=[0,3,5,7,10,15];
const V438_WIDGETS={
 jeronimo:['Dawnbreak','Shield of Swords',['Damage Taken -30%','Damage Taken -30%','Damage Taken -30%','Damage Taken -30%','Damage Taken -30%'],'Discernment','Rally Troop Attack'],
 natalia:['Ursus Strength','Polar Rampage',['Effect Lv 1','Effect Lv 2','Effect Lv 3','Effect Lv 4','Effect Lv 5'],'Ursus Might','Rally Troop Attack']
};
function v438Norm(s=''){return String(s).toLowerCase().replace(/[^a-z0-9]/g,'')}
function v438EffectLv(widgetLevel,kind){
  return kind==='explore'
    ? clamp(Math.ceil(widgetLevel/2),0,5)
    : clamp(Math.floor(widgetLevel/2),0,5);
}
function v438WidgetData(name){
  const direct=V438_WIDGETS[v438Norm(name)];
  if(direct)return direct;

  /* Read the current V33-rendered skills so heroes already working are not replaced
     with invented data. We only change layout/progression presentation. */
  const root=$('#nexa-v33-detail');
  const sec=$$('.v33-section',root).find(x=>/EXCLUSIVE GEAR|WIDGET/i.test($('.v33-kicker span',x)?.textContent||''));
  if(!sec)return null;
  const gear=($('.v33-kicker strong',sec)?.textContent||'Widget').split('•')[0].trim();
  const cards=$$('.v33-skill',sec);
  if(cards.length<2)return null;
  return [
    gear,
    $('h4',cards[0])?.textContent?.trim()||'Exploration Effect',
    [],
    $('h4',cards[1])?.textContent?.trim()||'Expedition Effect',
    (($('small',cards[1])?.textContent||'').split('•')[0].trim()||'Expedition Buff')
  ];
}
function v438Widget(){
  const root=$('#nexa-v33-detail');
  if(!root?.classList.contains('open'))return;

  const sec=$$('.v33-section',root).find(x=>/EXCLUSIVE GEAR|WIDGET/i.test($('.v33-kicker span',x)?.textContent||''));
  if(!sec)return;

  const hero=(($('.v33-title h3',root)?.textContent)||'').trim();
  const key=v438Norm(hero);
  const lv=Number($('[data-v33-widget].active',sec)?.dataset.v33Widget
               || $('[data-v33-widget-level].active',sec)?.dataset.v33WidgetLevel
               || root.dataset.widgetLevel || 0);
  const exploreLv=v438EffectLv(lv,'explore');
  const expeditionLv=v438EffectLv(lv,'exp');

  const EXACT={
    natalia:{
      gear:'Ursus Strength',
      a:'Polar Rampage',
      ad:'Natalia channels the ferocity of her polar bear to strengthen her combat presence.',
      b:'Ursus Might',
      bd:'Strengthens allied rally troops through Natalia’s exclusive gear.'
    },
    jeronimo:{
      gear:'Dawnbreak',
      a:'Shield of Swords',
      ad:'When attacking, Jeronimo forms a sword-energy shield that reduces damage taken by 30%.',
      b:'Discernment',
      bd:'Jeronimo attacks with a sword formation, increasing the Attack of rallied Troops by 15%.'
    },
    molly:{
      gear:'Yeti Spirit',
      a:'Modified Launcher',
      ad:'Molly wields a modified launcher, increasing damage dealt.',
      av:['Damage Dealt +10%','Damage Dealt +15%','Damage Dealt +20%','Damage Dealt +25%','Damage Dealt +30%'],
      b:'Snowy Blessing',
      bd:'The blessing of the snow increases Defender Troops’ Lethality.',
      bv:['Defender Troop Lethality +5%','Defender Troop Lethality +7.5%','Defender Troop Lethality +10%','Defender Troop Lethality +12.5%','Defender Troop Lethality +15%']
    },
    alonso:{
      gear:'Captain Ahab',
      a:"Ocean's Bounty",
      ad:"Alonso shares the spoils of success, healing the weakest hero with each basic attack.",
      av:['Healing effect active','Healing effect active','Healing effect active','Healing effect active','Heals weakest hero by 15%'],
      b:'Harpoon Enhancement',
      bd:"Alonso modifies the troops’ weapons, increasing rallied Troop Lethality.",
      bv:['Rally Troop Lethality +5%','Rally Troop Lethality +7.5%','Rally Troop Lethality +10%','Rally Troop Lethality +12.5%','Rally Troop Lethality +15%']
    }
  };

  const cards=$$('.v33-skill',sec);
  const oldA=cards[0];
  const oldB=cards[1];
  const oldAName=$('h4',oldA)?.textContent?.trim()||'Exploration Effect';
  const oldBName=$('h4',oldB)?.textContent?.trim()||'Expedition Effect';
  const oldADesc=$('small',oldA)?.textContent?.trim()||'';
  const oldBDesc=$('small',oldB)?.textContent?.trim()||'';
  const oldAResult=$('.v33-result',oldA)?.textContent?.trim()||'';
  const oldBResult=$('.v33-result',oldB)?.textContent?.trim()||'';

  const d=EXACT[key]||{
    gear:($('.v33-kicker strong',sec)?.textContent||'Widget').split('•')[0].trim(),
    a:/^Exploration Effect$/i.test(oldAName)?'Exploration Effect':oldAName,
    ad:oldADesc,
    b:/^Expedition Effect$/i.test(oldBName)?'Expedition Effect':oldBName,
    bd:oldBDesc
  };

  const k=$('.v33-kicker strong',sec);
  if(k)k.textContent=`${d.gear} • LV ${lv}`;

  let skills=$('.v33-skills',sec);
  if(!skills){skills=document.createElement('div');skills.className='v33-skills';sec.appendChild(skills)}
  sec.classList.add('nexa-v438-widget-table');

  function cleanResult(v){
    v=String(v||'').replace(/Effect\s*Lv\s*\d+\s*\/\s*5/ig,'').replace(/\s+/g,' ').trim();
    return /^(Not active|Locked)$/i.test(v)?'':v;
  }
  const aResult=cleanResult(oldAResult);
  const bResult=cleanResult(oldBResult);

  let aBuff=lv<1?'Unlocks at Widget Lv 1':
    (d.av?.[Math.max(0,exploreLv-1)] || aResult || 'Active');
  let bBuff=lv<2?'Unlocks at Widget Lv 2':
    (d.bv?.[Math.max(0,expeditionLv-1)] || bResult || 'Active');

  /* Natalia's existing V33 calculation is already correct for the buff box.
     Keep that numeric result if present; only remove the unwanted Effect Lv label. */
  if(key==='natalia'){
    if(aResult)aBuff=aResult;
    if(bResult)bBuff=bResult;
  }

  skills.innerHTML=`
    <article class="v33-skill">
      <div class="nexa-v438-widget-name"><b>${esc(d.a)}</b><span>EXPLORATION</span></div>
      <div class="nexa-v438-widget-desc">${esc(d.ad||oldADesc||'Exclusive Gear exploration effect.')}</div>
      <div class="nexa-v438-widget-buff"><b>${esc(aBuff)}</b></div>
    </article>
    <article class="v33-skill">
      <div class="nexa-v438-widget-name"><b>${esc(d.b)}</b><span>EXPEDITION</span></div>
      <div class="nexa-v438-widget-desc">${esc(d.bd||oldBDesc||'Exclusive Gear expedition effect.')}</div>
      <div class="nexa-v438-widget-buff"><b>${esc(bBuff)}</b></div>
    </article>`;

  /* Kill any leftover Effect Lv text outside the rebuilt cards. */
  $$('*',sec).forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').trim();
    if(/^Effect\s*Lv\s*\d+\s*\/\s*5$/i.test(t))el.remove();
  });
}
/* Troop summary must change immediately when Tier/FC/T11/T12 changes.
   Preserve V33's existing visual/cards; only restore cumulative passive summary. */
const V438_TROOP_SKILLS={
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
function v438TroopType(){
  const root=$('#nexa-v33-detail');if(!root)return'';
  const s=(($('.v33-title h3',root)?.textContent||'')+' '+($('.v33-title small',root)?.textContent||'')).toLowerCase();
  return s.includes('infantry')?'infantry':s.includes('lancer')?'lancer':s.includes('marksman')?'marksman':'';
}
function v438Troop(){
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const type=v438TroopType();if(!type)return;

  const tier=Number($('[data-v33-troop-tier].active',root)?.dataset.v33TroopTier||root.dataset.troopTier||1);
  const fc=Number($('[data-v33-troop-fc].active',root)?.dataset.v33TroopFc||root.dataset.troopFc||0);
  const sec=$$('.v33-section',root).find(x=>/ACTIVE TROOP SUMMARY/i.test($('.v33-kicker span',x)?.textContent||''));
  if(!sec)return;

  let box=$('.nexa-v438-passives',sec);
  if(!box){
    box=document.createElement('div');
    box.className='nexa-v438-passives';
    box.style.cssText='display:grid;gap:7px;margin-top:10px';
    sec.appendChild(box);
  }
  const unlocked=V438_TROOP_SKILLS[type].filter(x=>x[3](tier,fc));
  box.innerHTML=unlocked.map(x=>`
    <div style="display:grid;grid-template-columns:42px 1fr;gap:8px;padding:8px 9px;border:1px solid rgba(88,199,255,.18);border-radius:11px;background:rgba(6,22,43,.42)">
      <span style="font-size:8px;font-weight:950;color:#70e9ff">${x[0]}</span>
      <div><b style="display:block;font-size:10px">${x[1]}</b><small style="display:block;color:#acb7d0;font-size:9px">${x[2]}</small></div>
    </div>`).join('');

  window.NEXA_ACTIVE_TROOP_BUFFS={type,tier,fc,skills:unlocked.map(x=>({name:x[1],effect:x[2]}))};
}

/* Charms: V33 still points to /assets/charms/<type>/lv-N.png.
   The real files in this project use /lv01-infantry.png etc.
   Repair the exact charm row, not a generic ancestor. */
function v438CharmType(){
  const root=$('#nexa-v33-detail');if(!root)return'';
  const head=($('.v33-charm-gear-head',root)?.textContent||'')+' '+($('.v33-title h3',root)?.textContent||'');
  const s=head.toLowerCase();
  if(/infantry|coat|pants/.test(s))return'infantry';
  if(/lancer|helmet|watch/.test(s))return'lancer';
  if(/marksman|ring|short\s*staff|shortstaff/.test(s))return'marksman';
  return'';
}
function v438Charms(){
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const type=v438CharmType();if(!type)return;

  $$('.v33-charm-row',root).forEach(row=>{
    const sel=$('[data-v33-charm-level]',row);if(!sel)return;
    const lv=clamp(Number(sel.value||0),0,18);
    const body=$('.v33-charm-body',row);if(!body)return;

    let img=$('.v33-charm-img',row);
    let ph=$('.v33-charm-placeholder',row);
    if(!lv){
      img?.remove();
      if(!ph){
        ph=document.createElement('div');ph.className='v33-charm-placeholder';ph.textContent='◇';
        body.prepend(ph);
      }
      return;
    }

    if(!img){
      img=document.createElement('img');
      img.className='v33-charm-img';
      if(ph)ph.replaceWith(img); else body.prepend(img);
    }
    img.onerror=null;
    img.src=`/lv${pad(lv)}-${type}.png`;
    img.alt=`${type} Charm Lv ${lv}`;
    img.style.opacity='1';
    img.style.visibility='visible';
    img.style.display='block';
    img.style.background='transparent';
  });
}

/* Keep the Ministry pill clickable.
   Do NOT hide any ancestor that contains the new Ministry button. */
function v438MinistrySafety(){
  const root=$('#nexa-profile-modal');if(!root)return;
  $$('section,article,.card,.panel,div',root).forEach(el=>{
    if(el.id==='nexa-v425-ministry'||el.querySelector?.('#nexa-v425-ministry'))return;
    if(el.closest('#nexa-v425-ministry,#nexa-v33-ministry-overlay'))return;
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(t.length>0&&t.length<650&&/Ministry Schedule/i.test(t)){
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    }
  });
}

/* Main Account / Alliance: target the actual profile identity/editor,
   without changing account data. */
function v438ProfileIdentity(){
  const root=$('#nexa-profile-modal');if(!root)return;
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(/This is your main account/i.test(t)){
      el.textContent='★ MAIN ACCOUNT';
      el.classList.add('nexa-v437-main');
    }
  });
  $$('select',root).forEach(sel=>{
    if(sel.dataset.v438Alliance==='1')return;
    const wrap=sel.closest('label,.form-group,.profile-field,.nexa-profile-field,.nexa-profile-editor,div');
    if(!wrap)return;
    const t=(wrap.textContent||'').replace(/\s+/g,' ').trim();
    if(!/alliance/i.test(t))return;
    const note=document.createElement('div');
    note.className='nexa-v437-alliance-note';
    note.innerHTML='<b>Change Alliance</b><small>Select the alliance, then Save Profile.</small>';
    sel.before(note);
    sel.dataset.v438Alliance='1';
  });
}

/* Render Owner controls in BOTH Roles and NEXA Access.
   This avoids depending on which admin panel V26 happens to render first. */
async function v438OwnerManagers(){
  const c=sb();if(!c)return;
  let user,role='';
  try{
    ({data:{user}}=await c.auth.getUser());
    if(!user)return;
    role=String((await c.rpc('current_nexa_role')).data||'').toLowerCase();
  }catch{return}
  if(role!=='owner')return;

  let accounts=[],roles=[],access={};
  try{
    const [a,r,m]=await Promise.all([
      c.from('player_accounts').select('id,in_game_name,player_id,is_main').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at',{ascending:true}),
      c.from('nexa_operational_roles').select('role').eq('user_id',user.id),
      c.from('staff_module_access').select('*').eq('user_id',user.id).maybeSingle()
    ]);
    accounts=a.data||[];
    roles=(r.data||[]).map(x=>x.role);
    access=m.data||{};
  }catch{}

  const hosts=[
    $('#admin-roles .nexa-v25-host')||$('#admin-roles'),
    $('#admin-permissions .nexa-v25-host')||$('#admin-permissions')
  ].filter(Boolean);

  for(const host of hosts){
    const key=host.closest('#admin-permissions')?'access':'roles';
    let box=$(`[data-v438-owner-manager="${key}"]`,host);
    if(!box){
      box=document.createElement('section');
      box.className='nexa-v438-owner-manager';
      box.dataset.v438OwnerManager=key;
      box.id=key==='roles'?'nexa-v437-owner-manager':'nexa-v438-owner-access-manager';
      host.prepend(box);
    }
    const accountOptions=accounts.map(a=>`<option value="${esc(a.id)}">${esc(a.in_game_name||'Account')} • ID ${esc(a.player_id||'—')}${a.is_main?' • MAIN':''}</option>`).join('');
    const roleOptions=OPS.filter(([k])=>!roles.includes(k)).map(([k,n])=>`<option value="${k}">${n}</option>`).join('');

    box.innerHTML=`<div class="v437-title">MY NEXA WORK ACCESS</div>
      <label>ACCOUNT<select data-v438-account>${accountOptions||'<option>My NEXA account</option>'}</select></label>
      <label>OPERATIONAL ROLE<select data-v438-role><option value="">Add operational role…</option>${roleOptions}</select></label>
      <div class="v437-badges">${roles.map(k=>`<button type="button" class="v437-badge" data-v438-remove-role="${k}">${esc(OPS.find(x=>x[0]===k)?.[1]||k)} ×</button>`).join('')||'<small>No operational roles selected.</small>'}</div>
      <button type="button" class="v437-add" data-v438-focus-role>+ Add another operational role</button>
      <div><label style="margin-bottom:6px">MODULE ACCESS</label><div class="v437-check-grid">${MODULES.map(([k,n])=>`<label><input type="checkbox" data-v438-module="${k}" ${access[k]?'checked':''}>${n}</label>`).join('')}</div></div>
      <div class="v437-msg" data-v438-msg></div>`;

    const msg=$('[data-v438-msg]',box);
    $('[data-v438-role]',box).onchange=async e=>{
      const v=e.target.value;if(!v)return;
      msg.textContent='Saving…';
      const q=await c.rpc('nexa_owner_add_my_operational_role',{new_role:v});
      msg.textContent=q.error?(q.error.message||'Could not add role.'):'Role added ✓';
      if(!q.error)v438Schedule();
    };
    $$('[data-v438-remove-role]',box).forEach(b=>b.onclick=async()=>{
      msg.textContent='Saving…';
      const q=await c.rpc('nexa_owner_remove_my_operational_role',{old_role:b.dataset.v438RemoveRole});
      msg.textContent=q.error?(q.error.message||'Could not remove role.'):'Role removed ✓';
      if(!q.error)v438Schedule();
    });
    $('[data-v438-focus-role]',box).onclick=()=> $('[data-v438-role]',box)?.focus();
    $$('[data-v438-module]',box).forEach(ch=>ch.onchange=async()=>{
      msg.textContent='Saving module access…';
      const state=Object.fromEntries(MODULES.map(([k])=>[k,!!$(`[data-v438-module="${k}"]`,box)?.checked]));
      const q=await c.rpc('nexa_owner_set_my_module_access',{
        new_svs:state.svs_access,
        new_transfer:state.transfer_access,
        new_sbs:state.sbs_access,
        new_team_builder:state.team_builder_access,
        new_forms:state.forms_access,
        new_events:state.events_access,
        new_library:state.library_access,
        new_administration:state.administration_access
      });
      msg.textContent=q.error?(q.error.message||'Could not save module access.'):'Module access updated ✓';
    });
  }
}

function v438Apply(){
  v438Widget();
  v438Troop();
  v438Charms();
  v438MinistrySafety();
  v438ProfileIdentity();
  v438OwnerManagers();
}
function v438Schedule(){
  requestAnimationFrame(v438Apply);
  [30,100,220,450,800,1400].forEach(ms=>setTimeout(v438Apply,ms));
}

document.addEventListener('click',e=>{
  if(e.target.closest?.(
    '[data-v33-widget],[data-v33-widget-level],'+
    '[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],[data-v33-troop-skill],'+
    '[data-v33-charm-sub],[data-v33-item],[data-v33-save],'+
    '#admin-roles,#admin-permissions,.nexa-v25-arrow,[data-v25-manage-access]'
  ))v438Schedule();
},true);
document.addEventListener('change',e=>{
  if(e.target.matches?.(
    '[data-v33-charm-level],'+
    '[data-v33-troop-tier],[data-v33-troop-fc],'+
    '#admin-roles select,#admin-permissions select'
  ))v438Schedule();
},true);
window.addEventListener('nexa:profile-open',v438Schedule);
window.addEventListener('nexa:profile-updated',v438Schedule);
window.addEventListener('nexa:auth-ready',v438Schedule);
v438Schedule();


/* =========================
   V43.9 focused cleanup
   ========================= */

function v439CharmMiniatures(){
  const root=$('#nexa-profile-modal');if(!root)return;
  $$('.v33-charm-mini-row img',root).forEach(img=>{
    const src=img.getAttribute('src')||'';
    const m=src.match(/\/assets\/charms\/(infantry|lancer|marksman)\/lv-(\d+)\.png/i);
    if(!m)return;
    const type=m[1].toLowerCase(),lv=Number(m[2]);
    img.onerror=null;
    img.src=`/lv${pad(lv)}-${type}.png`;
    img.style.opacity='1';
    img.style.visibility='visible';
    img.style.display='block';
  });
  $$('.v33-charm-mini-row i',root).forEach(i=>{
    const txt=(i.textContent||'').trim();
    if(txt==='?'||txt==='◇')i.style.opacity='.35';
  });
}

function v439Ministry(){
  const b=$('#nexa-v425-ministry');if(!b)return;
  b.setAttribute('aria-label','Ministry Appointments');
  b.setAttribute('title','Ministry Appointments');
  b.innerHTML='';
  b.style.removeProperty('font-size');
  /* CSS pseudo-label owns the visible text/icon. */
  b.style.fontSize='0';
  const parent=b.parentElement;
  if(parent){
    Array.from(parent.children).forEach(el=>{
      if(el===b)return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/Ministry Schedule/i.test(t) || (el.tagName==='DIV' && !t && el.getBoundingClientRect?.().width<60)){
        el.style.display='none';
      }
    });
  }
}

function v439MainBadge(){
  const root=$('#nexa-profile-modal');if(!root)return;
  let badge=null;
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(/This is your\s*Main\s*account/i.test(t)||t==='★ MAIN ACCOUNT')badge=el;
  });
  if(!badge)return;
  badge.textContent='★ MAIN ACCOUNT';
  badge.className='nexa-v437-main';
  badge.style.position='static';
  badge.style.transform='none';
  badge.style.margin='10px 0 0';
  badge.style.float='none';

  const allianceSelect=$$('select',root).find(s=>{
    const p=s.closest('label,.form-group,.profile-field,.nexa-profile-field,div');
    return /alliance/i.test((p?.textContent||''));
  });
  const host=allianceSelect?.closest('label,.form-group,.profile-field,.nexa-profile-field,div');
  if(host && !host.contains(badge))host.appendChild(badge);
}

function v439AccountType(){
  const sel=$('#account-purpose');
  if(!sel)return;
  const opts=Array.from(sel.options);
  opts.forEach(o=>{
    const v=(o.value||'').toLowerCase();
    const t=(o.textContent||'').toLowerCase();
    if(v==='main'||/main/.test(t))o.textContent='Main Account';
    else if(v==='points'||v==='point'||v==='full'||/point|full|alternate|alt/.test(t))o.textContent='Alternate Account';
  });
  /* If legacy Point + Full both exist, keep the current stored values but present one clean choice. */
  const alt=opts.filter(o=>/^(points?|full|alternate|alt)$/i.test(o.value||''));
  if(alt.length>1){
    const keep=alt.find(o=>o.selected)||alt[0];
    alt.forEach(o=>{ if(o!==keep)o.hidden=true; });
    keep.textContent='Alternate Account';
  }
  const label=sel.closest('label');
  if(label){
    const first=Array.from(label.childNodes).find(n=>n.nodeType===3 && /account|purpose/i.test(n.textContent||''));
    if(first)first.textContent='Account Type ';
  }
}

function v439RoleIdentity(){
  $$('.nexa-v438-owner-manager,#nexa-v437-owner-manager').forEach(box=>{
    const account=$('[data-v438-account]',box);if(!account)return;
    const opts=Array.from(account.options);
    if(!opts.length)return;
    const main=opts.find(o=>/\bMAIN\b/i.test(o.textContent||''))||opts[0];
    const linked=opts.filter(o=>o!==main).map(o=>(o.textContent||'').replace(/\s*•\s*ID.*$/i,'').replace(/\s*•\s*MAIN.*$/i,'').trim()).filter(Boolean);
    let id=$('.v439-user-identity',box);
    if(!id){id=document.createElement('div');id.className='v439-user-identity';box.insertBefore(id,box.children[1]||null);}
    const mainName=(main.textContent||'').replace(/\s*•\s*ID.*$/i,'').replace(/\s*•\s*MAIN.*$/i,'').trim();
    id.innerHTML=`<b style="display:block;color:#fff;font-size:11px">Main Account: ${esc(mainName)}</b>
      <small style="display:block;margin-top:4px;color:#95a3c4;font-size:9px">${linked.length?`Linked accounts: ${esc(linked.join(', '))}`:'No linked alternate accounts'}</small>
      <small style="display:block;margin-top:4px;color:#6edfff;font-size:8px">Operational Roles and Module Access belong to this NEXA user.</small>`;
  });
}

function v439Apply(){
  v438Widget();
  v439CharmMiniatures();
  v439Ministry();
  v439MainBadge();
  v439AccountType();
  v439RoleIdentity();
}
function v439Schedule(){
  requestAnimationFrame(v439Apply);
  [40,120,280,600,1100].forEach(ms=>setTimeout(v439Apply,ms));
}
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-v33-widget],[data-v33-item],[data-v33-save],#nexa-profile-edit-btn,#admin-roles,#admin-permissions,[data-v25-manage-access]'))v439Schedule();
},true);
document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v33-widget],[data-v33-charm-level],#account-purpose,[data-v438-account]'))v439Schedule();
},true);
window.addEventListener('nexa:profile-open',v439Schedule);
window.addEventListener('nexa:profile-updated',v439Schedule);
window.addEventListener('pageshow',v439Schedule);
v439Schedule();

})();
