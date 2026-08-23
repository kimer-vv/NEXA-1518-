/* NEXA V44.9 — PROFILE POLISH + LINKED CHARMS + EDIT PROFILE
   Replaces V44.8.
   - Rectangular intelligence panel, never oval
   - Blended / endless-looking category + generation rails
   - Strong NEXA neon glow, not flat color
   - Small crisp glowing stat/action icons
   - Edit Profile restored
   - Planet library layout
   - Charms visually owned by the same Chief Gear piece, 3 charms per gear
   - Owner Operational Roles remain editable (backend protection stays on system role)
   - Native iOS horizontal scrolling only
   Transfer and My Alliance are untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_V449_PROFILE__) return;
window.__NEXA_V449_PROFILE__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function sb(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  return null;
}
function loadFresh(id,src){
  if(document.getElementById(id)) return;
  const s=document.createElement('script');
  s.id=id;s.src=src;s.async=false;document.head.appendChild(s);
}

const ICONS={
  furnace:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5.7" fill="currentColor"/><circle cx="12" cy="12" r="8.7" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".82"/></svg>',
  power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.3 2.7-6.8 10.2h4.6l-1.2 8.4 7-11.4h-4.4z" fill="currentColor"/></svg>',
  deployment:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.1" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2.1" fill="currentColor" opacity=".86"/></svg>',
  guide:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.8" fill="none" stroke="currentColor" stroke-width="1.65"/><circle cx="12" cy="8.2" r="1" fill="currentColor"/><path d="M12 11v5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  ministry:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.2h10M8.7 5.2v3.3h6.6V5.2M7.5 9.7h9l1.3 8.1H6.2zM5.5 19.4h13" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12h6M9.5 14.6h5M10 17h4" fill="none" stroke="currentColor" stroke-width="1.05" opacity=".72"/></svg>'
};

function installCSS(){
  ['nexa-v447-css','nexa-v448-css','nexa-v446-css','nexa-v444-css','nexa-v44-css','nexa-v449-css']
    .forEach(id=>document.getElementById(id)?.remove());

  const st=document.createElement('style');
  st.id='nexa-v449-css';
  st.textContent=`
  /* ===== PROFILE FRAME ===== */
  html body #nexa-profile-modal,
  html body #nexa-profile-modal.nexa-v30-owned{
    border-radius:0!important;clip-path:none!important;-webkit-clip-path:none!important;
    mask:none!important;-webkit-mask:none!important;overflow:hidden!important;
    padding:calc(7px + env(safe-area-inset-top)) 7px calc(7px + env(safe-area-inset-bottom))!important
  }
  html body #nexa-profile-modal .nexa-profile-sheet,
  html body #nexa-profile-modal.nexa-v30-owned .nexa-profile-sheet{
    position:relative!important;inset:auto!important;transform:none!important;
    width:min(700px,calc(100vw - 14px))!important;max-width:calc(100vw - 14px)!important;
    height:auto!important;min-height:0!important;
    max-height:calc(100dvh - 14px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;
    margin:0 auto!important;padding:0!important;border-radius:28px!important;
    clip-path:none!important;-webkit-clip-path:none!important;mask:none!important;-webkit-mask:none!important;
    overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;
    background:
      radial-gradient(circle at 14% 4%,rgba(117,72,255,.26),transparent 30%),
      radial-gradient(circle at 90% 10%,rgba(26,187,255,.13),transparent 28%),
      radial-gradient(circle at 52% 100%,rgba(112,62,255,.08),transparent 42%),
      linear-gradient(165deg,#10193d 0%,#081027 40%,#050817 100%)!important;
    border:1px solid rgba(125,89,255,.52)!important;
    box-shadow:0 28px 92px rgba(0,0,0,.58),0 0 32px rgba(96,66,235,.17)!important
  }
  html body #nexa-profile-modal .nexa-profile-sheet:before,
  html body #nexa-profile-modal .nexa-profile-sheet:after{display:none!important;content:none!important}

  /* V31 owns the data. Legacy list surfaces stay retired. */
  #nexa-profile-modal #nexa-p29-shell,
  #nexa-profile-modal #nexa-player-gen-rail,
  #nexa-profile-modal #nexa-pl-owned-root,
  #nexa-profile-modal #nexa-profile-content,
  #nexa-profile-modal .nexa-profile-content,
  #nexa-profile-modal .nexa-profile-tabs{display:none!important}
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-shell{
    display:block!important;width:100%!important;min-width:0!important;padding:0 0 18px!important;box-sizing:border-box!important
  }

  /* ===== EDIT PROFILE RESTORE ===== */
  html body #nexa-profile-modal .nexa-profile-edit-row{
    position:relative!important;z-index:20!important;
    display:flex!important;visibility:visible!important;opacity:1!important;
    justify-content:flex-end!important;margin:9px 18px 13px!important
  }
  html body #nexa-profile-modal #nexa-profile-edit-btn,
  html body #nexa-profile-modal .nexa-profile-edit-btn{
    display:inline-flex!important;visibility:visible!important;opacity:1!important;
    align-items:center!important;gap:6px!important;
    border:1px solid rgba(111,206,255,.34)!important;border-radius:999px!important;
    background:linear-gradient(135deg,rgba(29,42,83,.88),rgba(13,24,57,.93))!important;
    color:#d8e4ff!important;padding:8px 12px!important;font-size:10px!important;font-weight:900!important;
    box-shadow:0 0 14px rgba(67,181,255,.10)!important
  }
  html body #nexa-profile-modal #nexa-profile-editor,
  html body #nexa-profile-modal .nexa-profile-editor{
    position:relative!important;z-index:21!important
  }
  html body #nexa-profile-modal #nexa-profile-editor.open,
  html body #nexa-profile-modal .nexa-profile-editor.open{display:block!important}

  /* ===== STATS ===== */
  html body #nexa-profile-modal .nexa-profile-stats{
    display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important
  }
  html body #nexa-profile-modal .nexa-profile-stats>*{
    position:relative!important;min-width:0!important;padding:11px 41px 11px 12px!important;
    border-radius:16px!important;background:linear-gradient(145deg,rgba(7,14,36,.97),rgba(5,10,27,.98))!important;
    border:1px solid rgba(88,110,180,.18)!important;
    box-shadow:inset 0 0 20px rgba(41,81,170,.05),0 0 10px rgba(27,47,107,.05)!important
  }
  .nexa-v449-stat-icon{
    position:absolute!important;right:12px!important;top:50%!important;transform:translateY(-50%)!important;
    width:22px!important;height:22px!important;display:grid!important;place-items:center!important;color:var(--c)!important;
    filter:drop-shadow(0 0 4px var(--c)) drop-shadow(0 0 9px color-mix(in srgb,var(--c) 50%,transparent))!important
  }
  .nexa-v449-stat-icon svg{display:block!important;width:100%!important;height:100%!important}
  .nexa-v449-stat-icon.furnace{--c:#5fcaff}
  .nexa-v449-stat-icon.power{--c:#a968ff;width:19px!important;height:19px!important}
  .nexa-v449-stat-icon.deployment{--c:#51e2d6;width:21px!important;height:21px!important}

  /* ===== GUIDE + MINISTRY ===== */
  html body #nexa-v425-profile-actions{
    display:flex!important;justify-content:center!important;align-items:center!important;gap:14px!important;margin:10px 0 12px!important
  }
  html body #nexa-v425-profile-actions button{
    width:42px!important;height:42px!important;min-width:42px!important;border-radius:50%!important;
    display:grid!important;place-items:center!important;padding:0!important;font-size:0!important;
    background:rgba(7,13,34,.74)!important
  }
  html body #nexa-v425-profile-actions .nexa-v425-guide{
    color:#ff54dc!important;border:1.6px solid currentColor!important;
    box-shadow:0 0 9px rgba(255,84,220,.34),0 0 20px rgba(255,84,220,.13),inset 0 0 11px rgba(255,84,220,.05)!important
  }
  html body #nexa-v425-profile-actions .nexa-v425-ministry{
    color:#bdafff!important;border:1.6px solid currentColor!important;
    box-shadow:0 0 9px rgba(189,175,255,.27),0 0 18px rgba(145,113,255,.11),inset 0 0 10px rgba(145,113,255,.05)!important
  }
  html body #nexa-v425-profile-actions svg{display:block!important;width:19px!important;height:19px!important}

  /* ===== RAILS: blend into background, no visible box/end ===== */
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs,
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens{
    position:relative!important;display:flex!important;flex-flow:row nowrap!important;
    overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;
    scrollbar-width:none!important;border:0!important;outline:0!important;
    background:transparent!important;box-shadow:none!important
  }
  #nexa-v30-tabs::-webkit-scrollbar,#nexa-v30-gens::-webkit-scrollbar{display:none!important}
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs{
    gap:8px!important;padding:12px 18px 8px!important;margin-top:4px!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens{
    gap:10px!important;padding:5px 18px 15px!important
  }

  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs .nexa-v30-tab{
    flex:0 0 auto!important;min-width:106px!important;white-space:nowrap!important;
    padding:12px 15px!important;border-radius:999px!important;
    border:1px solid rgba(112,125,184,.18)!important;
    background:rgba(5,11,29,.28)!important;color:#7e89ae!important;
    font-size:10px!important;font-weight:950!important;letter-spacing:.13em!important;
    box-shadow:inset 0 0 12px rgba(35,49,99,.04)!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs .nexa-v30-tab.active{
    color:#fff!important;border-color:#a16cff!important;
    background:radial-gradient(circle at 50% 50%,rgba(120,78,255,.22),rgba(12,19,48,.58) 72%)!important;
    box-shadow:0 0 8px rgba(151,91,255,.45),0 0 20px rgba(112,68,255,.20),inset 0 0 14px rgba(142,82,255,.12)!important;
    text-shadow:0 0 8px rgba(226,213,255,.33)!important
  }

  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens .nexa-v30-gen{
    --gc:#8d62e8;flex:0 0 112px!important;min-width:112px!important;white-space:nowrap!important;
    padding:11px 12px!important;border-radius:999px!important;
    border:1.7px solid var(--gc)!important;background:rgba(6,12,30,.42)!important;
    color:color-mix(in srgb,var(--gc) 70%,white)!important;
    font-size:10px!important;font-weight:950!important;letter-spacing:.09em!important;
    box-shadow:0 0 7px color-mix(in srgb,var(--gc) 45%,transparent),0 0 17px color-mix(in srgb,var(--gc) 18%,transparent),inset 0 0 11px color-mix(in srgb,var(--gc) 7%,transparent)!important
  }
  #nexa-v30-gens .nexa-v30-gen:nth-child(1){--gc:#9569ef}
  #nexa-v30-gens .nexa-v30-gen:nth-child(2){--gc:#42c7ea}
  #nexa-v30-gens .nexa-v30-gen:nth-child(3){--gc:#e34fb7}
  #nexa-v30-gens .nexa-v30-gen:nth-child(4){--gc:#4d7ff1}
  #nexa-v30-gens .nexa-v30-gen:nth-child(5){--gc:#48c78a}
  #nexa-v30-gens .nexa-v30-gen:nth-child(6){--gc:#f2a64f}
  #nexa-v30-gens .nexa-v30-gen:nth-child(n+7){--gc:#737be6}
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens .nexa-v30-gen.active{
    background:color-mix(in srgb,var(--gc) 15%,rgba(6,12,30,.70))!important;
    box-shadow:0 0 10px color-mix(in srgb,var(--gc) 60%,transparent),0 0 24px color-mix(in srgb,var(--gc) 25%,transparent),inset 0 0 14px color-mix(in srgb,var(--gc) 11%,transparent)!important;
    color:#fff!important;text-shadow:0 0 8px color-mix(in srgb,var(--gc) 72%,transparent)!important
  }

  /* ===== PLANETS ===== */
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items{
    display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:22px 10px!important;padding:17px 14px 14px!important;overflow:visible!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card{
    min-width:0!important;max-width:none!important;width:100%!important;flex:none!important;
    border:0!important;border-radius:0!important;background:transparent!important;
    box-shadow:none!important;padding:0!important;margin:0!important;text-align:center!important;color:#fff!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card.selected{
    border:0!important;background:transparent!important;box-shadow:none!important;transform:none!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-portrait{
    width:min(25vw,106px)!important;height:min(25vw,106px)!important;max-width:106px!important;max-height:106px!important;
    margin:0 auto 9px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;
    border:2px solid #43dad2!important;background:#09142c!important;
    box-shadow:0 0 0 3px rgba(67,218,210,.12),0 0 10px rgba(67,218,210,.42),0 0 24px rgba(67,218,210,.18)!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card.selected .nexa-v30-portrait{
    border-color:#b26fff!important;
    box-shadow:0 0 0 3px rgba(178,111,255,.13),0 0 12px rgba(178,111,255,.50),0 0 26px rgba(106,78,255,.20)!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-portrait img{
    width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 28%!important;
    padding:0!important;margin:0!important;transform:none!important;border-radius:0!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-portrait img.troop,
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-portrait img.gear,
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-portrait img.charm{
    object-fit:contain!important;object-position:center!important;padding:4px!important;box-sizing:border-box!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card b{
    display:block!important;margin:0!important;color:#fff!important;font-size:14px!important;font-weight:950!important;line-height:1.13!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card small{
    display:block!important;margin-top:4px!important;color:#929bbc!important;font-size:9px!important;line-height:1.25!important;min-height:0!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-owned{
    display:block!important;margin-top:5px!important;padding:0!important;border:0!important;background:transparent!important;
    color:#7f88aa!important;font-size:8px!important;font-weight:850!important
  }
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-owned.yes{color:#77efc2!important;text-shadow:0 0 7px rgba(85,236,189,.28)!important}

  /* Detail editor */
  html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-detail{
    margin:11px 14px 0!important;padding:14px!important;border-radius:20px!important;
    clip-path:none!important;-webkit-clip-path:none!important;mask:none!important;-webkit-mask:none!important;
    border:1px solid rgba(127,89,236,.40)!important;
    background:linear-gradient(155deg,rgba(15,20,49,.97),rgba(5,9,25,.99))!important;
    box-shadow:0 0 18px rgba(109,75,230,.10)!important;overflow:hidden!important
  }

  /* ===== LINKED CHARMS ===== */
  #nexa-v449-charms{padding:12px 14px 20px!important}
  .nexa-v449-charms-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:13px!important}
  .nexa-v449-gear{
    border:1px solid rgba(112,91,221,.28)!important;border-radius:20px!important;padding:12px!important;
    background:linear-gradient(150deg,rgba(16,22,52,.96),rgba(6,10,27,.98))!important;
    box-shadow:0 0 16px rgba(93,68,210,.07)!important
  }
  .nexa-v449-gear-top{display:grid!important;grid-template-columns:66px minmax(0,1fr)!important;gap:10px!important;align-items:center!important}
  .nexa-v449-gear-orb{
    width:66px!important;height:66px!important;border-radius:50%!important;display:grid!important;place-items:center!important;overflow:hidden!important;
    border:2px solid #49d9d1!important;background:#08132b!important;
    box-shadow:0 0 8px rgba(73,217,209,.45),0 0 20px rgba(73,217,209,.16)!important
  }
  .nexa-v449-gear-orb img{width:100%!important;height:100%!important;object-fit:contain!important;padding:5px!important;box-sizing:border-box!important}
  .nexa-v449-gear h4{margin:0!important;color:#fff!important;font-size:14px!important}
  .nexa-v449-gear-meta{margin-top:4px!important;color:#8f99bb!important;font-size:8px!important;line-height:1.3!important}
  .nexa-v449-three{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;margin-top:11px!important}
  .nexa-v449-charm{
    min-width:0!important;border:1px solid rgba(82,202,255,.24)!important;border-radius:13px!important;padding:7px 4px!important;
    text-align:center!important;background:rgba(6,14,34,.88)!important;box-shadow:inset 0 0 10px rgba(64,193,255,.04)!important
  }
  .nexa-v449-charm-orb{
    width:31px!important;height:31px!important;margin:0 auto 4px!important;border-radius:50%!important;display:grid!important;place-items:center!important;
    color:#7ce8ff!important;border:1px solid currentColor!important;
    background:radial-gradient(circle,rgba(70,213,255,.21),rgba(5,11,29,.95) 70%)!important;
    box-shadow:0 0 8px rgba(70,213,255,.38),0 0 15px rgba(70,213,255,.11)!important;font-size:9px!important;font-weight:950!important
  }
  .nexa-v449-charm label{display:block!important;color:#8e98ba!important;font-size:7px!important;font-weight:950!important}
  .nexa-v449-charm select{
    width:100%!important;margin-top:4px!important;padding:6px 1px!important;border-radius:8px!important;
    border:1px solid rgba(118,137,201,.22)!important;background:#071027!important;color:#fff!important;font-size:11px!important
  }
  .nexa-v449-save{
    width:100%!important;margin-top:9px!important;padding:8px!important;border-radius:999px!important;
    border:1px solid rgba(76,211,255,.42)!important;background:rgba(10,72,103,.28)!important;color:#84e8ff!important;
    box-shadow:0 0 12px rgba(65,198,255,.08)!important;font-size:9px!important;font-weight:950!important
  }
  .nexa-v449-status{min-height:12px!important;margin-top:5px!important;text-align:center!important;color:#80e5ff!important;font-size:8px!important}

  @media(max-width:390px){
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs{padding-inline:12px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens{padding-inline:12px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs .nexa-v30-tab{min-width:96px!important;padding:11px 13px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens .nexa-v30-gen{flex-basis:104px!important;min-width:104px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items{gap:20px 7px!important;padding-inline:9px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card b{font-size:12px!important}
    html body #nexa-profile-modal.nexa-v30-owned #nexa-v30-items .nexa-v30-card small{font-size:8px!important}
    .nexa-v449-charms-grid{grid-template-columns:1fr!important}
  }
  `;
  document.head.appendChild(st);
}

function detectStat(kind){
  const id={furnace:'nexa-profile-furnace',power:'nexa-profile-power',deployment:'nexa-profile-deployment'}[kind];
  const value=document.getElementById(id);
  if(!value)return;
  const card=value.closest('.nexa-stat,.nexa-profile-stat,article,section,div');
  if(!card)return;
  card.querySelectorAll('.nexa-v446-stat-icon,.nexa-v448-stat-icon,.nexa-v449-stat-icon').forEach(x=>x.remove());
  const icon=document.createElement('span');
  icon.className=`nexa-v449-stat-icon ${kind}`;
  icon.innerHTML=ICONS[kind];
  card.appendChild(icon);
}
function repairHeader(){
  detectStat('furnace');detectStat('power');detectStat('deployment');
  const row=$('#nexa-v425-profile-actions');
  if(row){
    const guide=row.querySelector('.nexa-v425-guide');
    const ministry=row.querySelector('.nexa-v425-ministry,#nexa-v425-ministry');
    if(guide){guide.innerHTML=ICONS.guide;guide.setAttribute('aria-label','Profile Guide')}
    if(ministry){ministry.innerHTML=ICONS.ministry;ministry.setAttribute('aria-label','Ministry Appointments')}
  }
  const editRow=$('#nexa-profile-modal .nexa-profile-edit-row');
  const editBtn=$('#nexa-profile-edit-btn')||$('#nexa-profile-modal .nexa-profile-edit-btn');
  if(editRow)editRow.style.removeProperty('display');
  if(editBtn){
    editBtn.style.removeProperty('display');
    editBtn.hidden=false;
    editBtn.removeAttribute('hidden');
  }
}
function enableOwnerOperationalInputs(){
  $$('.nexa-v25-protected').forEach(badge=>{
    const card=badge.closest('article,section,div');
    if(!card)return;
    card.querySelectorAll('input[data-v25-op-user][data-v25-op]').forEach(input=>{
      input.disabled=false;input.removeAttribute('disabled');
    });
  });
}

function gearImage(name,item){
  const n=String(name||'').trim().toLowerCase();
  const map={
    helmet:'/nexa-gear-helmet.webp',watch:'/nexa-gear-watch.webp',coat:'/nexa-gear-coat.webp',
    pants:'/nexa-gear-pants.webp',belt:'/nexa-gear-belt.webp',
    'short staff':'/nexa-gear-shortstaff.webp',shortstaff:'/nexa-gear-shortstaff.webp'
  };
  return map[n]||item?.image_url||'';
}
async function accountId(){
  if(window.NEXA_ACTIVE_ACCOUNT_ID)return String(window.NEXA_ACTIVE_ACCOUNT_ID);
  const playerId=$('#nexa-profile-player-id')?.textContent?.trim();
  const c=sb();if(!c||!playerId)return null;
  const {data:{user}}=await c.auth.getUser();if(!user)return null;
  const q=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',playerId).maybeSingle();
  if(q.error||!q.data?.id)return null;
  window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);
  return String(q.data.id);
}

function hideV31ForCharms(){
  $('#nexa-v30-items')?.setAttribute('hidden','');
  $('#nexa-v30-detail')?.setAttribute('hidden','');
  $('#nexa-v30-gens')?.setAttribute('hidden','');
}
function restoreV31(){
  $('#nexa-v449-charms')?.remove();
  $('#nexa-v30-items')?.removeAttribute('hidden');
  $('#nexa-v30-detail')?.removeAttribute('hidden');
  $('#nexa-v30-gens')?.removeAttribute('hidden');
}
async function renderLinkedCharms(){
  const shell=$('#nexa-v30-shell'),c=sb();if(!shell||!c)return;
  const aid=await accountId();if(!aid)return;

  $('#nexa-v449-charms')?.remove();
  hideV31ForCharms();

  const host=document.createElement('section');
  host.id='nexa-v449-charms';
  host.innerHTML='<div class="nexa-v449-status">Loading Charms…</div>';
  shell.appendChild(host);

  try{
    const [gearQ,invQ]=await Promise.all([
      c.from('nexa_library_items').select('*').eq('item_type','chief_gear').eq('is_active',true).order('sort_order').order('name'),
      c.from('player_library_inventory').select('*').eq('player_account_id',aid)
    ]);
    if(gearQ.error)throw gearQ.error;
    if(invQ.error)throw invQ.error;
    const inv=new Map((invQ.data||[]).map(x=>[String(x.library_item_id),x]));
    const gears=gearQ.data||[];
    host.innerHTML=`<div class="nexa-v449-charms-grid">${gears.map(g=>{
      const row=inv.get(String(g.id))||{};
      const p=row.progress||{};
      let levels=Array.isArray(p.charm_levels)?p.charm_levels:[p.charm_1||0,p.charm_2||0,p.charm_3||0];
      levels=[0,1,2].map(i=>Math.max(0,Math.min(18,Number(levels[i]||0))));
      const img=gearImage(g.name,g);
      const meta=[p.tier||p.current_tier||'',p.stars!==undefined&&p.stars!==null?`${p.stars} STAR`:null].filter(Boolean).join(' • ');
      return `<article class="nexa-v449-gear" data-v449-gear="${esc(g.id)}">
        <div class="nexa-v449-gear-top">
          <div class="nexa-v449-gear-orb">${img?`<img src="${esc(img)}" alt="${esc(g.name||'Chief Gear')}">`:''}</div>
          <div><h4>${esc(g.name||'Chief Gear')}</h4><div class="nexa-v449-gear-meta">${esc(meta||'Chief Gear • 3 linked charms')}</div></div>
        </div>
        <div class="nexa-v449-three">
          ${[0,1,2].map(i=>`<div class="nexa-v449-charm">
            <div class="nexa-v449-charm-orb">${levels[i]}</div>
            <label>CHARM ${i+1}
              <select data-v449-charm="${i}">
                ${Array.from({length:19},(_,n)=>`<option value="${n}" ${levels[i]===n?'selected':''}>${n}</option>`).join('')}
              </select>
            </label>
          </div>`).join('')}
        </div>
        <button class="nexa-v449-save" type="button">SAVE CHARMS</button>
        <div class="nexa-v449-status"></div>
      </article>`;
    }).join('')}</div>`;
  }catch(err){
    host.innerHTML=`<div class="nexa-v449-status">${esc(err?.message||String(err))}</div>`;
  }
}
async function saveCharms(card){
  const c=sb(),aid=await accountId();if(!c||!aid||!card)return;
  const status=$('.nexa-v449-status',card);if(status)status.textContent='Saving…';
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');
    const libId=card.dataset.v449Gear;
    const q=await c.from('player_library_inventory').select('*').eq('player_account_id',aid).eq('library_item_id',libId).maybeSingle();
    if(q.error)throw q.error;
    const existing=q.data||{};
    const progress={...(existing.progress||{})};
    progress.charm_levels=$$('[data-v449-charm]',card).map(s=>Number(s.value||0));
    progress.charm_1=progress.charm_levels[0];
    progress.charm_2=progress.charm_levels[1];
    progress.charm_3=progress.charm_levels[2];

    const up=await c.from('player_library_inventory').upsert({
      user_id:user.id,
      player_account_id:aid,
      library_item_id:libId,
      owned:existing.owned===true,
      progress,
      updated_at:new Date().toISOString()
    },{onConflict:'player_account_id,library_item_id'});
    if(up.error)throw up.error;

    $$('.nexa-v449-charm',card).forEach((box,i)=>{
      const orb=$('.nexa-v449-charm-orb',box);
      if(orb)orb.textContent=progress.charm_levels[i];
    });
    if(status)status.textContent='Saved ✓';
  }catch(err){if(status)status.textContent=err?.message||String(err)}
}

function boot(){
  installCSS();
  loadFresh('nexa-v449-troops','nexa-troop-assets-v25.js?v=25-449-20260823');
  loadFresh('nexa-v449-profile','nexa-profile-owner-v31.js?v=31-449-20260823');
  [80,220,480,900].forEach(ms=>setTimeout(()=>{repairHeader();enableOwnerOperationalInputs()},ms));
}

document.addEventListener('change',e=>{
  const select=e.target.closest?.('[data-v449-charm]');
  if(select){
    const box=select.closest('.nexa-v449-charm');
    const orb=$('.nexa-v449-charm-orb',box);
    if(orb)orb.textContent=select.value;
  }
},true);

document.addEventListener('click',e=>{
  const tab=e.target.closest?.('[data-v30-tab]');
  if(tab){
    if(tab.dataset.v30Tab==='charms')setTimeout(renderLinkedCharms,60);
    else restoreV31();
  }
  const save=e.target.closest?.('.nexa-v449-save');
  if(save){e.preventDefault();saveCharms(save.closest('.nexa-v449-gear'))}

  if(e.target.closest?.('[data-v25-tab],#admin-roles,#admin-permissions,.nexa-v25-nav')){
    [50,160].forEach(ms=>setTimeout(enableOwnerOperationalInputs,ms));
  }
  if(e.target.closest?.('#nexa-profile-launcher,#nexa-profile-launcher-section,[data-nexa-profile],[data-account-constellation-id],[data-open-full-profile]')){
    [60,170,390].forEach(ms=>setTimeout(repairHeader,ms));
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(boot,80));
})();
