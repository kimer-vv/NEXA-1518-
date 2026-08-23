/* NEXA V44.6 — REFERENCE PROFILE RESTORE
   Visual target: approved legacy NEXA Profile screenshot.
   - Keeps existing account photo/header.
   - Restores NEXA stat symbols and Ministry/Guide actions.
   - Restores dark category tabs + colored generation pills.
   - Restores compact circular Hero/Expert/Troop/Pet presentation.
   - Chief Gear and Charms stay linked: Charms uses the same Chief Gear pieces
     and stores each piece's three charm levels in that gear inventory progress.
   - Loads Troop V25 and Profile V31 as the single profile data owner.
   - No MutationObserver, no manual scrollLeft, no touchmove preventDefault.
   - Transfer and My Alliance are intentionally untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_V446_REFERENCE__) return;
window.__NEXA_V446_REFERENCE__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function sb(){
  return window.supabaseClient?.from ? window.supabaseClient :
         window.sb?.from ? window.sb : null;
}

function loadFresh(id,src){
  if(document.getElementById(id)) return;
  const s=document.createElement('script');
  s.id=id;s.src=src;s.async=false;
  document.head.appendChild(s);
}

const ICONS={
 furnace:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.6" fill="currentColor" opacity=".9"/><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".72"/></svg>',
 power:'<svg viewBox="0 0 24 24"><path d="M14.1 2.8 7.3 13h4.6l-1.2 8.2L17.8 10h-4.4z" fill="currentColor"/></svg>',
 deployment:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.25" opacity=".72"/></svg>',
 guide:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="8.2" r="1.1" fill="currentColor"/><path d="M12 11v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 ministry:'<svg viewBox="0 0 24 24"><path d="M8 6.5h8M9 6.5v3h6v-3M7.5 10h9l1.1 8H6.4zM6 19.5h12" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.7 12.2h6.6M9.5 14.6h5M10.2 17h3.6" stroke="currentColor" stroke-width="1.15" opacity=".8"/></svg>'
};

function addCSS(){
  document.getElementById('nexa-v44-css')?.remove();
  document.getElementById('nexa-v444-css')?.remove();
  if(document.getElementById('nexa-v446-css')) return;
  const s=document.createElement('style');
  s.id='nexa-v446-css';
  s.textContent=`
  /* Retire legacy surfaces. V31 is the only visible Profile workspace. */
  #nexa-profile-modal #nexa-p29-shell,
  #nexa-profile-modal #nexa-player-gen-rail,
  #nexa-profile-modal #nexa-pl-owned-root,
  #nexa-profile-modal #nexa-profile-content,
  #nexa-profile-modal .nexa-profile-content,
  #nexa-profile-modal .nexa-profile-tabs{display:none!important}

  #nexa-profile-modal{
    padding:6px!important;overflow:hidden!important
  }
  #nexa-profile-modal .nexa-profile-sheet{
    width:min(680px,calc(100vw - 12px))!important;
    max-width:calc(100vw - 12px)!important;
    max-height:calc(100dvh - 12px)!important;
    border-radius:26px!important;
    overflow-y:auto!important;overflow-x:hidden!important;
    -webkit-overflow-scrolling:touch!important;
    clip-path:none!important;-webkit-clip-path:none!important;
    mask:none!important;-webkit-mask:none!important
  }
  #nexa-profile-modal .nexa-profile-sheet:before,
  #nexa-profile-modal .nexa-profile-sheet:after{display:none!important}

  /* Header stats: match the approved reference. */
  #nexa-profile-modal .nexa-profile-stats{
    display:grid!important;
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:10px!important
  }
  #nexa-profile-modal .nexa-profile-stats>*{
    position:relative!important;min-width:0!important;
    border-radius:16px!important;
    background:linear-gradient(145deg,rgba(10,17,42,.96),rgba(6,12,31,.96))!important;
    border:1px solid rgba(92,113,180,.20)!important;
    box-shadow:inset 0 0 24px rgba(35,68,145,.06)!important
  }
  .nexa-v446-stat-icon{
    position:absolute!important;right:14px!important;top:50%!important;transform:translateY(-50%)!important;
    width:34px!important;height:34px!important;display:grid!important;place-items:center!important;
    color:var(--c)!important
  }
  .nexa-v446-stat-icon svg{width:100%!important;height:100%!important;filter:drop-shadow(0 0 7px color-mix(in srgb,var(--c) 55%,transparent))!important}
  .nexa-v446-stat-icon.furnace{--c:#64caff}
  .nexa-v446-stat-icon.power{--c:#a978ff;width:29px!important;height:29px!important}
  .nexa-v446-stat-icon.deployment{--c:#56d7ff}

  /* Guide + Ministry as in approved screenshot. */
  #nexa-v425-profile-actions{
    display:flex!important;justify-content:center!important;align-items:center!important;
    gap:16px!important;margin:12px 0 18px!important
  }
  #nexa-v425-profile-actions button{
    position:relative!important;width:54px!important;height:54px!important;min-width:54px!important;
    border-radius:50%!important;display:grid!important;place-items:center!important;
    font-size:0!important;background:rgba(10,14,35,.72)!important
  }
  #nexa-v425-profile-actions .nexa-v425-guide{
    color:#ff54db!important;border:2px solid #ff54db!important;
    box-shadow:0 0 16px rgba(255,84,219,.16)!important
  }
  #nexa-v425-profile-actions .nexa-v425-ministry{
    color:#cbc4ff!important;border:2px solid rgba(190,183,255,.55)!important;
    box-shadow:0 0 16px rgba(160,141,255,.10)!important
  }
  #nexa-v425-profile-actions svg{width:25px!important;height:25px!important;display:block!important}

  /* Category bar from reference: dark, spacious, active boxed. */
  #nexa-v30-shell{
    display:block!important;width:100%!important;box-sizing:border-box!important;
    padding:0 0 18px!important
  }
  #nexa-v30-tabs{
    display:flex!important;flex-flow:row nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
    -webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;
    gap:4px!important;padding:13px 12px!important;
    border-top:1px solid rgba(255,255,255,.07)!important;
    border-bottom:1px solid rgba(255,255,255,.07)!important;
    background:rgba(2,6,20,.82)!important
  }
  #nexa-v30-tabs::-webkit-scrollbar,#nexa-v30-gens::-webkit-scrollbar{display:none!important}
  .nexa-v30-tab{
    flex:1 0 auto!important;min-width:92px!important;
    border:1px solid transparent!important;border-radius:18px!important;
    padding:15px 14px!important;background:transparent!important;
    color:#727da7!important;font-size:10px!important;font-weight:950!important;
    letter-spacing:.14em!important
  }
  .nexa-v30-tab.active{
    color:#fff!important;border-color:rgba(112,94,229,.44)!important;
    background:linear-gradient(145deg,rgba(42,41,92,.78),rgba(12,27,62,.88))!important;
    box-shadow:inset 0 0 22px rgba(83,74,196,.10),0 0 15px rgba(68,75,220,.06)!important
  }

  /* Generation pills: exact visual language from reference. */
  #nexa-v30-gens{
    display:flex!important;flex-flow:row nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
    -webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;
    gap:10px!important;padding:14px 14px 18px!important;background:rgba(2,6,20,.72)!important
  }
  .nexa-v30-gen{
    flex:0 0 112px!important;min-width:112px!important;
    padding:14px 12px!important;border-radius:999px!important;
    background:rgba(18,24,48,.86)!important;
    font-size:10px!important;font-weight:950!important;letter-spacing:.08em!important;color:#d7dcff!important
  }
  .nexa-v30-gen:nth-child(1){border:2px solid #8657df!important;color:#cbaaff!important;box-shadow:0 0 15px rgba(134,87,223,.12)!important}
  .nexa-v30-gen:nth-child(2){border:2px solid #3fb6d8!important;color:#7ee4ff!important;box-shadow:0 0 15px rgba(63,182,216,.12)!important}
  .nexa-v30-gen:nth-child(3){border:2px solid #d34aa8!important;color:#ff8bd1!important;box-shadow:0 0 15px rgba(211,74,168,.12)!important}
  .nexa-v30-gen:nth-child(4){border:2px solid #3e72e6!important;color:#86a7ff!important;box-shadow:0 0 15px rgba(62,114,230,.12)!important}
  .nexa-v30-gen:nth-child(5){border:2px solid #40b980!important;color:#8ff0bd!important;box-shadow:0 0 15px rgba(64,185,128,.12)!important}
  .nexa-v30-gen:nth-child(n+6){border:2px solid #6b73d8!important;color:#abb2ff!important}
  .nexa-v30-gen.active{background:rgba(26,34,72,.98)!important;filter:brightness(1.12)!important}

  /* Library portrait field: three clean NEXA portraits across, no white cards. */
  #nexa-v30-items{
    display:grid!important;
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:18px 12px!important;
    padding:18px 14px 12px!important;
    overflow:visible!important
  }
  .nexa-v30-card{
    --ac:#4edbd4!important;
    min-width:0!important;max-width:none!important;width:100%!important;
    border:0!important;border-radius:0!important;background:transparent!important;
    padding:0!important;color:#fff!important;text-align:center!important;
    box-shadow:none!important
  }
  .nexa-v30-card.selected{transform:none!important;border:0!important;box-shadow:none!important}
  .nexa-v30-portrait{
    width:min(26vw,112px)!important;height:min(26vw,112px)!important;
    max-width:112px!important;max-height:112px!important;
    margin:0 auto 9px!important;border-radius:50%!important;overflow:hidden!important;
    display:grid!important;place-items:center!important;
    border:3px solid #43d5cf!important;
    background:#0b1730!important;
    box-shadow:
      0 0 0 4px rgba(58,196,194,.13),
      0 0 20px rgba(52,217,205,.23)!important
  }
  .nexa-v30-portrait img{
    width:100%!important;height:100%!important;object-fit:cover!important;
    object-position:50% 28%!important;transform:none!important;padding:0!important
  }
  .nexa-v30-portrait img.troop,.nexa-v30-portrait img.gear,.nexa-v30-portrait img.charm{
    object-fit:contain!important;object-position:center!important;padding:4px!important
  }
  .nexa-v30-card b{
    display:block!important;font-size:14px!important;line-height:1.1!important;
    color:#fff!important;font-weight:950!important;margin-top:4px!important
  }
  .nexa-v30-card small{
    display:block!important;margin-top:5px!important;color:#9299bd!important;
    font-size:9px!important;line-height:1.3!important;min-height:0!important
  }
  .nexa-v30-owned{
    display:block!important;margin:3px 0 0!important;padding:0!important;
    border:0!important;background:transparent!important;
    color:#7e86a8!important;font-size:8px!important
  }
  .nexa-v30-owned.yes{color:#72efc0!important}

  /* Detail panel remains dark/compact below portraits. */
  #nexa-v30-detail{
    margin:12px 14px 0!important;border-radius:18px!important;
    background:linear-gradient(155deg,rgba(11,17,43,.96),rgba(5,9,25,.98))!important
  }

  /* Linked Charms renderer. */
  #nexa-v446-charms{padding:8px 14px 18px!important}
  .nexa-v446-gear-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
  .nexa-v446-gear-card{
    border:1px solid rgba(118,102,220,.27)!important;border-radius:20px!important;
    padding:12px!important;background:linear-gradient(150deg,rgba(20,24,55,.95),rgba(6,10,28,.98))!important
  }
  .nexa-v446-gear-top{display:grid!important;grid-template-columns:68px minmax(0,1fr)!important;gap:10px!important;align-items:center!important}
  .nexa-v446-gear-img{
    width:68px!important;height:68px!important;border-radius:18px!important;display:grid!important;place-items:center!important;
    overflow:hidden!important;border:1px solid rgba(117,96,244,.48)!important;background:#0a1129!important
  }
  .nexa-v446-gear-img img{width:100%!important;height:100%!important;object-fit:contain!important;padding:5px!important;box-sizing:border-box!important}
  .nexa-v446-gear-name{font-size:13px!important;font-weight:950!important;color:#fff!important}
  .nexa-v446-gear-meta{font-size:8px!important;color:#8f98b9!important;margin-top:4px!important}
  .nexa-v446-charms-row{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin-top:11px!important}
  .nexa-v446-charm{
    min-width:0!important;border:1px solid rgba(94,207,255,.24)!important;border-radius:14px!important;
    padding:8px 5px!important;text-align:center!important;background:#091126!important
  }
  .nexa-v446-charm-orb{
    width:34px!important;height:34px!important;margin:0 auto 5px!important;border-radius:50%!important;
    display:grid!important;place-items:center!important;color:#72dfff!important;
    border:1px solid currentColor!important;
    background:radial-gradient(circle,rgba(93,219,255,.22),rgba(5,11,30,.9) 68%)!important;
    box-shadow:0 0 12px rgba(74,208,255,.16)!important;font-size:10px!important;font-weight:950!important
  }
  .nexa-v446-charm label{display:block!important;font-size:7px!important;color:#8e98ba!important;font-weight:900!important}
  .nexa-v446-charm select{
    width:100%!important;margin-top:4px!important;padding:6px 3px!important;
    border-radius:9px!important;border:1px solid rgba(123,142,205,.22)!important;
    background:#071029!important;color:#fff!important;font-size:11px!important
  }
  .nexa-v446-charm-save{
    width:100%!important;margin-top:10px!important;padding:8px!important;border-radius:999px!important;
    border:1px solid rgba(76,205,255,.42)!important;background:rgba(12,60,93,.38)!important;
    color:#82e6ff!important;font-size:9px!important;font-weight:950!important
  }
  .nexa-v446-status{min-height:13px!important;margin-top:5px!important;text-align:center!important;color:#76e2ff!important;font-size:8px!important}

  @media(max-width:390px){
    .nexa-v30-tab{min-width:84px!important;padding:13px 11px!important}
    .nexa-v30-gen{flex-basis:104px!important;min-width:104px!important}
    #nexa-v30-items{gap:15px 8px!important;padding-inline:10px!important}
    .nexa-v30-card b{font-size:12px!important}
    .nexa-v30-card small{font-size:8px!important}
    .nexa-v446-gear-grid{grid-template-columns:1fr!important}
  }
  `;
  document.head.appendChild(s);
}

function repairHeader(){
  const stats=$$('#nexa-profile-modal .nexa-profile-stats > *');
  stats.forEach(card=>{
    const t=(card.textContent||'').toLowerCase();
    let kind='';
    if(t.includes('furnace'))kind='furnace';
    else if(t.includes('power'))kind='power';
    else if(t.includes('deploy'))kind='deployment';
    if(!kind)return;
    card.querySelectorAll('.nexa-v444-stat-icon,.nexa-v445-sigil,.nexa-v446-stat-icon').forEach(n=>n.remove());
    const i=document.createElement('span');
    i.className=`nexa-v446-stat-icon ${kind}`;
    i.innerHTML=ICONS[kind];
    card.appendChild(i);
  });

  const row=$('#nexa-v425-profile-actions');
  if(row){
    const guide=row.querySelector('.nexa-v425-guide');
    const ministry=row.querySelector('.nexa-v425-ministry,#nexa-v425-ministry');
    if(guide){guide.innerHTML=ICONS.guide;guide.setAttribute('aria-label','Profile Guide')}
    if(ministry){ministry.innerHTML=ICONS.ministry;ministry.setAttribute('aria-label','Ministry Schedule')}
  }
}

function gearImage(name,item){
  const n=String(name||'').toLowerCase().trim();
  const map={
    helmet:'/nexa-gear-helmet.webp',
    watch:'/nexa-gear-watch.webp',
    coat:'/nexa-gear-coat.webp',
    pants:'/nexa-gear-pants.webp',
    belt:'/nexa-gear-belt.webp',
    'short staff':'/nexa-gear-shortstaff.webp',
    shortstaff:'/nexa-gear-shortstaff.webp'
  };
  return map[n]||item?.image_url||item?.image||'';
}

async function renderLinkedCharms(){
  const shell=$('#nexa-v30-shell');
  if(!shell) return;
  const accountId=window.NEXA_ACTIVE_ACCOUNT_ID;
  const c=sb();
  if(!c||!accountId) return;

  $('#nexa-v446-charms')?.remove();
  $('#nexa-v30-items')?.setAttribute('hidden','');
  $('#nexa-v30-detail')?.setAttribute('hidden','');
  $('#nexa-v30-gens')?.setAttribute('hidden','');

  const host=document.createElement('section');
  host.id='nexa-v446-charms';
  host.innerHTML='<div class="nexa-v446-status">Loading Charms…</div>';
  shell.appendChild(host);

  try{
    const [gearQ,invQ]=await Promise.all([
      c.from('nexa_library_items').select('*').eq('is_active',true).eq('is_visible',true).eq('item_type','chief_gear').order('sort_order').order('name'),
      c.from('player_library_inventory').select('*').eq('player_account_id',accountId)
    ]);
    if(gearQ.error) throw gearQ.error;
    if(invQ.error) throw invQ.error;
    const inv=new Map((invQ.data||[]).map(x=>[String(x.library_item_id),x]));
    const gears=gearQ.data||[];
    host.innerHTML=`<div class="nexa-v446-gear-grid">${gears.map(g=>{
      const row=inv.get(String(g.id))||{};
      const p=row.progress||{};
      const levels=Array.isArray(p.charm_levels)?p.charm_levels:[0,0,0];
      const img=gearImage(g.name,g);
      return `<article class="nexa-v446-gear-card" data-v446-gear="${esc(g.id)}">
        <div class="nexa-v446-gear-top">
          <div class="nexa-v446-gear-img">${img?`<img src="${esc(img)}" alt="${esc(g.name||'Chief Gear')}">`:''}</div>
          <div><div class="nexa-v446-gear-name">${esc(g.name||'Chief Gear')}</div>
          <div class="nexa-v446-gear-meta">${esc(p.current_tier||'')} ${p.stars!==undefined?`• ${esc(p.stars)} STAR`:''}</div></div>
        </div>
        <div class="nexa-v446-charms-row">
          ${[0,1,2].map(i=>`<div class="nexa-v446-charm">
            <div class="nexa-v446-charm-orb">${levels[i]||0}</div>
            <label>CHARM ${i+1}
              <select data-v446-charm="${i}">
                ${Array.from({length:19},(_,n)=>`<option value="${n}" ${Number(levels[i]||0)===n?'selected':''}>${n}</option>`).join('')}
              </select>
            </label>
          </div>`).join('')}
        </div>
        <button type="button" class="nexa-v446-charm-save">SAVE CHARMS</button>
        <div class="nexa-v446-status"></div>
      </article>`;
    }).join('')}</div>`;
  }catch(err){
    host.innerHTML=`<div class="nexa-v446-status">${esc(err?.message||err)}</div>`;
  }
}

async function saveLinkedCharms(card){
  const c=sb(),accountId=window.NEXA_ACTIVE_ACCOUNT_ID;
  if(!c||!accountId||!card)return;
  const status=$('.nexa-v446-status',card);
  if(status)status.textContent='Saving…';
  try{
    const {data:{user}}=await c.auth.getUser();
    if(!user)throw new Error('Sign in required.');
    const id=card.dataset.v446Gear;
    const q=await c.from('player_library_inventory').select('*').eq('player_account_id',accountId).eq('library_item_id',id).maybeSingle();
    if(q.error)throw q.error;
    const existing=q.data||{};
    const progress={...(existing.progress||{})};
    progress.charm_levels=$$('[data-v446-charm]',card).map(s=>Number(s.value||0));
    const payload={
      user_id:user.id,
      player_account_id:accountId,
      library_item_id:id,
      owned:existing.owned===true,
      progress,
      updated_at:new Date().toISOString()
    };
    const up=await c.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});
    if(up.error)throw up.error;
    $$('.nexa-v446-charm',card).forEach((box,i)=>{
      const orb=$('.nexa-v446-charm-orb',box);
      if(orb)orb.textContent=progress.charm_levels[i];
    });
    if(status)status.textContent='Saved ✓';
  }catch(err){
    if(status)status.textContent=err?.message||String(err);
  }
}

function leaveLinkedCharms(){
  $('#nexa-v446-charms')?.remove();
  $('#nexa-v30-items')?.removeAttribute('hidden');
  $('#nexa-v30-detail')?.removeAttribute('hidden');
  $('#nexa-v30-gens')?.removeAttribute('hidden');
}

function fixOwnerOperationalRoleInputs(){
  $$('.nexa-v25-protected').forEach(badge=>{
    const card=badge.closest('article');
    if(!card)return;
    card.querySelectorAll('input[data-v25-op-user][data-v25-op]').forEach(input=>{
      input.disabled=false;
      input.removeAttribute('disabled');
    });
  });
}

function boot(){
  addCSS();
  loadFresh('nexa-v446-troops','nexa-troop-assets-v25.js?v=25-446-20260823');
  loadFresh('nexa-v446-profile','nexa-profile-owner-v31.js?v=31-446-20260823');

  [120,350,800,1500,2600].forEach(ms=>setTimeout(()=>{
    addCSS();repairHeader();fixOwnerOperationalRoleInputs();
  },ms));
}

document.addEventListener('click',e=>{
  const tab=e.target.closest?.('[data-v30-tab]');
  if(tab){
    if(tab.dataset.v30Tab==='charms'){
      setTimeout(renderLinkedCharms,80);
    }else{
      leaveLinkedCharms();
    }
  }
  const save=e.target.closest?.('.nexa-v446-charm-save');
  if(save){
    e.preventDefault();
    saveLinkedCharms(save.closest('.nexa-v446-gear-card'));
  }
  if(e.target.closest?.('#nexa-profile-launcher,#nexa-profile-launcher-section,[data-nexa-profile],[data-account-constellation-id]')){
    [120,350,700].forEach(ms=>setTimeout(repairHeader,ms));
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('pageshow',()=>setTimeout(boot,80));
})();
