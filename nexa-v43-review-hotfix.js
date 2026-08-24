/* NEXA V43 REVIEW HOTFIX — 2026-08-24
   Consolidated structural fixes from Profile review.
   No global MutationObserver. No polling.
*/
(()=>{
'use strict';
if(window.__NEXA_V43_REVIEW_HOTFIX__)return;
window.__NEXA_V43_REVIEW_HOTFIX__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const pad=n=>String(Math.max(0,Number(n)||0)).padStart(2,'0');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function addCSS(){
  if($('#nexa-v43-review-hotfix-css'))return;
  const s=document.createElement('style');
  s.id='nexa-v43-review-hotfix-css';
  s.textContent=`
  #nexa-v430-transfer-card h3,
  #home-transfers-section h2,
  #home-transfers-section h3{
    font-size:16px!important;line-height:1.15!important;margin:3px 0 4px!important
  }

  .nexa-widget-table .v33-skills{
    display:grid!important;grid-template-columns:1fr!important;gap:8px!important
  }
  .nexa-widget-table .v33-skill{
    display:grid!important;
    grid-template-columns:minmax(118px,.85fr) minmax(0,1.7fr) minmax(88px,.55fr)!important;
    gap:10px!important;align-items:center!important;padding:11px 12px!important;min-height:0!important
  }
  .nexa-widget-table .nexa-widget-cell{min-width:0!important}
  .nexa-widget-table .nexa-widget-name b{
    display:block!important;color:#fff!important;font-size:12px!important;line-height:1.25!important
  }
  .nexa-widget-table .nexa-widget-name span{
    display:block!important;margin-top:3px!important;color:#77e9ff!important;
    font-size:8px!important;font-weight:950!important;letter-spacing:.12em!important
  }
  .nexa-widget-table .nexa-widget-desc{
    color:#c8cfe2!important;font-size:10px!important;line-height:1.4!important
  }
  .nexa-widget-table .nexa-widget-buff{
    padding:8px 9px!important;border:1px solid rgba(152,93,255,.4)!important;
    border-radius:10px!important;background:rgba(79,40,143,.22)!important;
    color:#fff!important;font-size:11px!important;font-weight:900!important;text-align:center!important
  }
  @media(max-width:520px){
    .nexa-widget-table .v33-skill{grid-template-columns:1fr!important;gap:6px!important}
    .nexa-widget-table .nexa-widget-buff{text-align:left!important}
  }

  .v33-charm-img{
    object-fit:contain!important;background:transparent!important;opacity:1!important;
    transform:scale(1.08)!important
  }

  .nexa-pet-skill-clickable .v33-skill-top{
    cursor:pointer!important;border-radius:16px!important;padding:8px!important;
    background:radial-gradient(circle at 15% 50%,rgba(73,219,255,.14),transparent 42%)!important
  }
  .nexa-pet-skill-clickable .v33-skill-icon{
    box-shadow:0 0 12px rgba(63,221,255,.6),0 0 28px rgba(96,89,255,.26)!important;
    animation:nexaPetGlow 2.2s ease-in-out infinite!important
  }
  .nexa-pet-skill-clickable .nexa-pet-desc{
    display:none!important;margin:8px 0 0!important;color:#cbd3e8!important;
    font-size:10px!important;line-height:1.45!important
  }
  .nexa-pet-skill-clickable.open .nexa-pet-desc{display:block!important}
  @keyframes nexaPetGlow{
    0%,100%{transform:scale(.96);filter:brightness(.92)}
    50%{transform:scale(1.04);filter:brightness(1.16)}
  }

  #nexa-v425-ministry{
    color:#69e7ff!important;border-color:rgba(76,218,255,.72)!important;
    background:radial-gradient(circle at 50% 45%,rgba(46,205,255,.22),rgba(7,17,37,.95) 70%)!important;
    box-shadow:0 0 10px rgba(61,215,255,.34),0 0 24px rgba(72,101,255,.18)!important
  }

  #nexa-owner-operational-role{
    margin:12px 0!important;padding:13px!important;border:1px solid rgba(94,222,255,.28)!important;
    border-radius:16px!important;background:linear-gradient(145deg,rgba(7,30,49,.82),rgba(10,12,35,.94))!important
  }
  #nexa-owner-operational-role label{
    display:grid!important;gap:7px!important;color:#d9e8ff!important;font-weight:850!important
  }
  #nexa-owner-operational-role select{
    width:100%!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:11px!important;
    padding:10px!important;background:#091329!important;color:#fff!important
  }
  #nexa-owner-operational-role .nexa-role-actions{
    display:flex!important;gap:8px!important;margin-top:9px!important
  }`;
  document.head.appendChild(s);
}

function cleanMultiserverBranding(){
  const p=$('.nexa-auth-brand p');
  if(p){
    const cleaned=(p.textContent||'')
      .replace(/\bSTATE\s*1518\s*[•·|\-–—]?\s*/ig,'')
      .replace(/^\s*[•·|\-–—]\s*/,'').trim();
    p.textContent=cleaned||'MANAGEMENT & EVENT COORDINATION';
  }
  $$('.footer').forEach(f=>{
    if(/NEXA\s*[•·]\s*State\s*1518/i.test(f.textContent||'')){
      f.innerHTML='One hub. Everything connected.<br>NEXA';
    }
  });
}

function ministrySVG(){
  return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <rect x="4.5" y="5.5" width="15" height="14" rx="2.4"
      fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8 3.7v3.4M16 3.7v3.4M4.8 9.3h14.4"
      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 12.1l1.05 1.55 1.82.46-1.17 1.43.12 1.88L12 16.78l-1.82.65.12-1.88-1.17-1.43 1.82-.46L12 12.1z"
      fill="currentColor"/>
  </svg>`;
}
function repairMinistry(){
  const b=$('#nexa-v425-ministry');
  if(!b)return;
  if(!b.querySelector('svg'))b.innerHTML=ministrySVG();
  b.setAttribute('aria-label',b.getAttribute('aria-label')||'Ministry appointment');
}

function charmTypeFromAlt(alt=''){
  const s=String(alt).toLowerCase();
  if(s.includes('infantry'))return 'infantry';
  if(s.includes('lancer'))return 'lancer';
  if(s.includes('marksman'))return 'marksman';
  return '';
}
function repairCharmAssets(root=document){
  $$('.v33-charm-img',root).forEach(img=>{
    const alt=img.alt||'';
    const type=charmTypeFromAlt(alt);
    const m=alt.match(/Lv\s*(\d+)/i);
    const lv=m?Number(m[1]):0;
    if(!type||!lv)return;
    const wanted=`/lv${pad(lv)}-${type}.png`;
    img.onerror=()=>{img.style.opacity='.2';};
    if(img.getAttribute('src')!==wanted)img.src=wanted;
    img.style.opacity='1';
  });
}

function troopTypeFromText(text=''){
  const s=String(text).toLowerCase();
  if(s.includes('infantry'))return 'infantry';
  if(s.includes('lancer'))return 'lancer';
  if(s.includes('marksman'))return 'marksman';
  return '';
}
function troopAsset(type,tier){
  return type&&tier?`/nexa-troop-${type}-t${tier}.webp`:'';
}
function repairTroopPortraits(root=document){
  $$('.v33-item[data-type="troop"]',root).forEach(card=>{
    const type=troopTypeFromText(card.textContent||'');
    const m=(card.textContent||'').match(/\bT(\d{1,2})\b/i);
    const tier=m?Number(m[1]):1;
    const img=$('img',card),src=troopAsset(type,tier);
    if(img&&src&&img.getAttribute('src')!==src)img.src=src;
  });

  const sheet=$('#nexa-v33-detail .v33-sheet',root);
  if(sheet){
    const titleText=(($('.v33-title',sheet)||{}).textContent||'');
    const type=troopTypeFromText(titleText);
    const active=$('[data-v33-troop-tier].active',sheet);
    const tier=Number(active?.dataset.v33TroopTier||((titleText.match(/\bT(\d{1,2})\b/i)||[])[1])||1);
    const img=$('.v33-mini.troop img',sheet),src=troopAsset(type,tier);
    if(img&&src)img.src=src;
  }
}

function normalizeWidgetRows(root=document){
  $$('.v33-section',root).forEach(sec=>{
    const kicker=$('.v33-kicker span',sec);
    if(!kicker||!/EXCLUSIVE GEAR|WIDGET/i.test(kicker.textContent||''))return;
    sec.classList.add('nexa-widget-table');
    $$('.v33-skill',sec).forEach((card,index)=>{
      if(card.dataset.nexaWidgetRow==='1')return;
      const name=$('h4',card)?.textContent?.trim()||`Widget Effect ${index+1}`;
      const desc=$('.v33-skill-top small',card)?.textContent?.trim()||'';
      const result=$('.v33-result',card)?.textContent?.trim()||'Not active';
      const type=card.dataset.skillType||((index===0)?'GEAR EFFECT':'WIDGET EFFECT');
      card.innerHTML=
        `<div class="nexa-widget-cell nexa-widget-name"><b>${esc(name)}</b><span>${esc(type)}</span></div>`+
        `<div class="nexa-widget-cell nexa-widget-desc">${esc(desc)}</div>`+
        `<div class="nexa-widget-cell nexa-widget-buff">${esc(result)}</div>`;
      card.dataset.nexaWidgetRow='1';
    });
  });
}

function polishPetSkill(root=document){
  $$('.v33-section',root).forEach(sec=>{
    const kicker=$('.v33-kicker span',sec);
    if(!kicker||!/PET SKILL/i.test(kicker.textContent||''))return;
    const card=$('.v33-skill',sec);
    if(!card)return;
    card.classList.add('nexa-pet-skill-clickable');
    const top=$('.v33-skill-top',card);
    if(!top)return;
    if(!$('.nexa-pet-desc',card)){
      const description=$('.v33-skill-top small',card)?.textContent?.trim()||'';
      const p=document.createElement('p');
      p.className='nexa-pet-desc';
      p.textContent=description||'Pet skill details';
      top.after(p);
    }
    if(top.dataset.nexaPetToggle!=='1'){
      top.dataset.nexaPetToggle='1';
      top.setAttribute('role','button');
      top.setAttribute('tabindex','0');
      const toggle=()=>card.classList.toggle('open');
      top.addEventListener('click',toggle);
      top.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
      });
    }
  });
}

async function ensureOwnerRoleCard(){
  const host=$('#admin-roles');
  if(!host||$('#nexa-owner-operational-role',host))return;

  const client=window.supabaseClient||window.sb;
  if(!client?.auth?.getUser)return;

  let user=null,role='';
  try{
    ({data:{user}}=await client.auth.getUser());
    const rr=await client.rpc('current_nexa_role');
    role=String(rr?.data||'').toLowerCase();
  }catch(_){return;}

  if(!user||role!=='owner')return;

  const card=document.createElement('div');
  card.id='nexa-owner-operational-role';
  card.innerHTML=`
    <b>MY OPERATIONAL ROLE</b>
    <p class="muted">Owner access stays protected. This only assigns your working role.</p>
    <label>Operational Role
      <select id="nexa-owner-role-select">
        <option value="">None</option>
        <option value="battle_strategist">Battle Strategist</option>
        <option value="event_operator">Event Operator</option>
        <option value="scheduler">Scheduler</option>
        <option value="transfer_coordinator">Transfer Coordinator</option>
      </select>
    </label>
    <div class="nexa-role-actions">
      <button id="nexa-owner-role-save" class="btn" type="button">Save My Role</button>
    </div>
    <div id="nexa-owner-role-message" class="form-message"></div>`;
  host.appendChild(card);

  const select=$('#nexa-owner-role-select',card);
  const msg=$('#nexa-owner-role-message',card);

  try{
    const q=await client.from('nexa_operational_roles')
      .select('role').eq('user_id',user.id).limit(1).maybeSingle();
    if(q.data?.role)select.value=q.data.role;
  }catch(_){}

  $('#nexa-owner-role-save',card).onclick=async()=>{
    msg.textContent='Saving…';
    try{
      const wanted=select.value;
      const del=await client.from('nexa_operational_roles').delete().eq('user_id',user.id);
      if(del.error)throw del.error;
      if(wanted){
        const ins=await client.from('nexa_operational_roles')
          .insert({user_id:user.id,role:wanted,created_by:user.id});
        if(ins.error)throw ins.error;
      }
      msg.textContent='Operational role updated ✓';
    }catch(e){
      msg.textContent=e?.message||'Could not update role.';
    }
  };
}

function applyAll(){
  addCSS();
  cleanMultiserverBranding();
  repairMinistry();
  repairCharmAssets();
  repairTroopPortraits();
  normalizeWidgetRows();
  polishPetSkill();
  ensureOwnerRoleCard();
}
function deferApply(){
  requestAnimationFrame(applyAll);
  setTimeout(applyAll,60);
  setTimeout(applyAll,220);
}

document.addEventListener('click',e=>{
  if(e.target.closest?.(
    '[data-nexa-tab],.v33-item,[data-v33-cat],[data-v33-gen],'+
    '[data-v33-troop-tier],[data-v33-troop-fc],[data-v33-t11],[data-v33-t12],'+
    '[data-v33-troop-skill],[data-v33-widget],#nexa-profile-launcher-section,'+
    '[data-open-full-profile],#admin-panel-button,[data-admin-tab]'
  ))deferApply();
},true);

document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v33-pet-level],[data-v33-pet-skill],[data-v33-charm-level]')){
    deferApply();
  }
},true);

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',applyAll,{once:true});
}else applyAll();

window.addEventListener('load',applyAll,{once:true});
window.addEventListener('pageshow',applyAll);

setTimeout(applyAll,350);
setTimeout(applyAll,1100);
})();
