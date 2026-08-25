/* NEXA V44.8 — PROFILE STABILITY PASS — 2026-08-25
   Focused follow-up loaded AFTER V44.7.
   Fixes only: account badge labels, Pet deployment rows, Expert explanatory/current-effect cards,
   and Constellation -> selected Passport/Profile recovery.
   Preserves V44.7 Pet cooldowns. No MutationObserver. No polling. No touchmove preventDefault.
*/
(()=>{
'use strict';
if(window.__NEXA_V448_PROFILE_STABILITY__) return;
window.__NEXA_V448_PROFILE_STABILITY__=true;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');
const sb=()=>window.supabaseClient?.from?window.supabaseClient:(window.sb?.from?window.sb:null);
let deployBusy=false, expertBusy=false;

function css(){
 if($('#nexa-v448-profile-stability-css'))return;
 const s=document.createElement('style');s.id='nexa-v448-profile-stability-css';s.textContent=`
 #nexa-profile-type.v448-main{color:#ffd96b!important;border-color:rgba(255,198,64,.72)!important;box-shadow:0 0 14px rgba(255,191,51,.26)!important}
 #nexa-profile-type.v448-alt{color:#86eaff!important;border-color:rgba(77,216,255,.65)!important;box-shadow:0 0 14px rgba(73,215,255,.22)!important}
 .v448-expert-info{display:grid;gap:5px;margin:9px 0;padding:10px 11px;border:1px solid rgba(96,211,255,.28);border-radius:12px;background:rgba(7,28,48,.55)}
 .v448-expert-info small{font-size:8px;font-weight:950;letter-spacing:.11em;color:#68ddff}.v448-expert-info b{font-size:11px;line-height:1.42;color:#eef8ff}.v448-expert-info span{font-size:9px;line-height:1.4;color:#9daac8}.v448-expert-current{color:#ffd96b!important;font-weight:900!important}
 `;document.head.appendChild(s);
}
async function accountId(){
 if(window.NEXA_ACTIVE_ACCOUNT_ID)return String(window.NEXA_ACTIVE_ACCOUNT_ID);
 const c=sb();if(!c)return null;
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)return null;
  const pid=String($('#nexa-profile-player-id')?.textContent||'').trim();
  let q=pid&&pid!=='—'?await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',pid).maybeSingle():null;
  if(!q?.data?.id)q=await c.from('player_accounts').select('id').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
  if(q?.data?.id){window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);return String(q.data.id)}
 }catch{}
 return null;
}
async function accountBadge(){
 const badge=$('#nexa-profile-type');if(!badge)return;
 const c=sb(),id=await accountId();if(!c||!id)return;
 try{
  const q=await c.from('player_accounts').select('is_main').eq('id',id).maybeSingle();if(!q.data)return;
  badge.classList.remove('v445-main','v445-alt','v448-main','v448-alt');
  if(q.data.is_main){badge.textContent='★ MAIN ACCOUNT';badge.classList.add('v448-main')}
  else{badge.textContent='✦ ALT ACCOUNT';badge.classList.add('v448-alt')}
 }catch{}
}
function cleanAccountPurposeLabels(){
 const roots=[$('#nexa-account-constellation'),$('#nexa-profile-modal')].filter(Boolean);
 roots.forEach(root=>$$('span,b,strong,small,p,label,option',root).forEach(el=>{
  if(el.children.length&&el.tagName!=='OPTION')return;
  const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
  if(/^(point(s)? account|buff account|buff points?|boost account|boost points?|full|basic|alt account)$/i.test(t))el.textContent='✦ ALT ACCOUNT';
  if(/^main$/i.test(t)&&el.closest('[data-nexa-profile],#nexa-profile-modal'))el.textContent='★ MAIN ACCOUNT';
 }));
}
async function deployment(){
 if(deployBusy)return;const panel=$('#nexa-deploy-panel');if(!panel)return;
 const parse=v=>Number(String(v||'').replace(/[^\d]/g,'')||0);
 const base=parse($('#nexa-edit-deployment')?.value)||parse($('#nexa-profile-deployment')?.textContent);if(!base)return;
 const set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=typeof v==='number'?Math.round(v).toLocaleString():String(v)};
 set('dep-base',base);set('dep-10',base*1.10);set('dep-20',base*1.20);
 deployBusy=true;
 try{
  const c=sb(),id=await accountId();if(!c||!id)return;
  let pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').eq('name','Snow Ape').maybeSingle();
  if(!pet.data?.id)pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').ilike('name','%Snow%Ape%').limit(1).maybeSingle();
  if(!pet.data?.id)return;
  const inv=await c.from('player_library_inventory').select('progress').eq('player_account_id',id).eq('library_item_id',pet.data.id).maybeSingle();
  const p=inv.data?.progress||{};const lv=clamp(Number(p.pet_skill??p.skill_level??p.level_skill??0),0,10);
  const vals=[0,1500,3000,4500,6000,7500,9000,10500,12000,13500,15000],plus=vals[lv]||0;
  if(!plus){set('dep-pet','Set pet first');set('dep-pet10','Set pet first');set('dep-pet20','Set pet first');return}
  set('dep-pet',base+plus);set('dep-pet10',(base+plus)*1.10);set('dep-pet20',(base+plus)*1.20);
 }catch(e){console.warn('[NEXA V44.8] deployment',e)}finally{deployBusy=false}
}
const EXPERT_FALLBACK={
 'scavenging':['Earns extra Enhancement XP Components from Bear Hunt rewards.','Bear Hunt rewards'],
 'weapon master':['Earns extra Essence Stones from Bear Hunt rewards.','Bear Hunt rewards'],
 'entrapment':['Increases the maximum number of troops that can fit in your Bear Hunt rally.','Bear Hunt rally capacity'],
 "ursa's bane":['Increases the number of your own troops you can deploy during Bear Hunt.','Bear Hunt personal deployment']
};
async function experts(){
 if(expertBusy)return;const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
 const boxes=$$('.v33-skill[data-v33-expert-box]',root);if(!boxes.length)return;
 expertBusy=true;
 try{
  const title=String($('.v33-title h3',root)?.textContent||'').trim(),c=sb();let md={};
  if(c&&title){const q=await c.from('nexa_library_items').select('metadata').eq('item_type','expert').eq('name',title).maybeSingle();md=q.data?.metadata||{}}
  const skills=Array.isArray(md.skills)?md.skills:[];
  boxes.forEach(box=>{
   const name=String($('h4',box)?.textContent||'').trim();const sk=skills.find(x=>norm(x.name)===norm(name))||{};
   const fb=EXPERT_FALLBACK[norm(name)]||[];
   const desc=sk.description||sk.effect||sk.details||fb[0]||'This Expert skill improves its listed bonus as the skill level increases.';
   const where=sk.applies_to||sk.scope||sk.specialty||fb[1]||md.specialty||'Expert bonus';
   const nativeResult=String($('.v33-result',box)?.textContent||'').replace(/\s+/g,' ').trim()||'Not active';
   let info=$('.v448-expert-info',box);if(!info){info=document.createElement('div');info.className='v448-expert-info';const r=$('.v33-result',box);r?r.before(info):box.appendChild(info)}
   info.innerHTML=`<small>WHAT IT DOES</small><b>${esc(desc)}</b><span>Applies to: ${esc(where)}</span><small>CURRENT EFFECT / BUFF</small><span class="v448-expert-current">${esc(nativeResult)}</span>`;
  });
 }catch(e){console.warn('[NEXA V44.8] experts',e)}finally{expertBusy=false}
}
async function openSelectedProfile(id){
 if(!id)return;window.NEXA_ACTIVE_ACCOUNT_ID=String(id);
 try{
  if(typeof window.openNexaProfile==='function'){window.openNexaProfile(String(id));return}
  const c=sb();if(!c)return;
  const q=await c.from('player_accounts').select('*,alliances(tag,name)').eq('id',id).maybeSingle();const a=q.data;if(!a)return;
  const put=(sel,val)=>{const e=$(sel);if(e)e.textContent=val??'—'};
  put('#nexa-profile-name',a.in_game_name||a.ign||'Account');put('#nexa-profile-player-id',a.player_id||'—');
  put('#nexa-profile-alliance',a.alliances?.tag||a.custom_alliance_tag||'—');put('#nexa-profile-role',a.alliance_role||a.role||'—');
  put('#nexa-profile-furnace',a.furnace_level||a.furnace||'—');put('#nexa-profile-power',a.power?Number(a.power).toLocaleString():'—');put('#nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
  const modal=$('#nexa-profile-modal');modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');
  $('#nexa-account-constellation')?.classList.remove('open');
  window.dispatchEvent(new CustomEvent('nexa:profile-open',{detail:{accountId:String(id),account:a}}));
 }catch(e){console.warn('[NEXA V44.8] profile open',e)}
}
function apply(){css();cleanAccountPurposeLabels();accountBadge();deployment();experts()}
function schedule(){requestAnimationFrame(apply);[40,120,260,520,900,1500].forEach(ms=>setTimeout(apply,ms))}

document.addEventListener('click',e=>{
 const card=e.target.closest?.('[data-nexa-profile]');
 if(card&&card.closest('#nexa-account-constellation')){
  const id=card.dataset.nexaProfile;if(id){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSelectedProfile(id).then(schedule);return}
 }
 const other=e.target.closest?.('[data-v446-account]');if(other?.dataset.v446Account){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openSelectedProfile(other.dataset.v446Account).then(schedule);return}
 if(e.target.closest?.('#nexa-deployment-stat,[data-v33-save],[data-v33-expert-box],[data-v33-item]'))schedule();
},true);
document.addEventListener('change',e=>{if(e.target.closest?.('[data-v33-expert-level],[data-v44-pet-level],#nexa-edit-deployment'))schedule()},true);
window.addEventListener('nexa:profile-open',schedule);window.addEventListener('nexa:profile-updated',schedule);window.addEventListener('pageshow',schedule);window.addEventListener('load',schedule);
schedule();
})();
