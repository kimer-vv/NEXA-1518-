/* NEXA V43.7 — STABLE OWNER RUNTIME — 2026-08-24
   Single focused runtime for the remaining Profile/Admin conflicts.
   Does NOT modify Heroes, Experts, Troops, or Library data.
   Fixes: Pets, Ministry visual ownership, legacy Ministry card cleanup,
   Charms re-entry, Main Account/Alliance polish, Owner Roles + Module Access.
   No MutationObserver. No polling. No manual scrollLeft. No touchmove preventDefault.
*/
(()=>{
'use strict';
if(window.__NEXA_V437_STABLE_RUNTIME__)return;
window.__NEXA_V437_STABLE_RUNTIME__=true;

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

 #nexa-v437-owner-manager{display:grid;gap:13px;margin:12px 0 16px;padding:14px;border:1px solid rgba(78,213,255,.32);border-radius:18px;background:linear-gradient(145deg,rgba(7,29,50,.92),rgba(7,10,31,.97));box-shadow:0 0 25px rgba(57,188,255,.08)}
 #nexa-v437-owner-manager .v437-title{color:#82eaff;font-size:9px;font-weight:950;letter-spacing:.13em}
 #nexa-v437-owner-manager label{display:grid;gap:5px;color:#9ba7c5;font-size:8px;font-weight:950;letter-spacing:.08em}
 #nexa-v437-owner-manager select{width:100%;padding:10px;border:1px solid rgba(112,136,201,.28);border-radius:11px;background:#071027;color:#fff;font-size:16px}
 .v437-badges{display:flex;gap:6px;flex-wrap:wrap}.v437-badge{border:1px solid rgba(72,209,255,.36);border-radius:999px;padding:6px 9px;background:rgba(13,51,72,.62);color:#d4f8ff;font-size:8px;font-weight:900}.v437-badge.mod{border-color:rgba(166,107,255,.38);background:rgba(48,28,83,.58);color:#eadfff}
 .v437-add{width:max-content;border:0;background:transparent;color:#72e3ff;padding:0;font-size:9px;font-weight:900}.v437-msg{min-height:14px;color:#8debc7;font-size:9px}
 .v437-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v437-check-grid label{display:flex!important;flex-direction:row!important;align-items:center!important;gap:7px!important;padding:8px;border:1px solid rgba(255,255,255,.10);border-radius:11px;background:rgba(5,11,29,.52);font-size:9px!important;letter-spacing:0!important;color:#cbd3e7!important}.v437-check-grid input{width:18px!important;height:18px!important}
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
})();
