/* NEXA V44.4 — PROFILE RESTORE + HEADER ICONS + OWNER OP BADGES
   Keeps Transfer fixed.
   Restores the compact horizontal V31 Profile workspace.
   Restores Ministry/Guide/header stat icons.
   Allows Owner operational-role toggles without unlocking protected module ownership.
   My Alliance is untouched.
*/
(()=>{
'use strict';
if(window.__NEXA_V444_PATCH__) return;
window.__NEXA_V444_PATCH__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function loadFresh(id,src){
  if(document.getElementById(id)) return;
  const s=document.createElement('script');
  s.id=id;
  s.src=src;
  s.async=false;
  document.head.appendChild(s);
}

function addCSS(){
  if(document.getElementById('nexa-v444-css')) return;
  const s=document.createElement('style');
  s.id='nexa-v444-css';
  s.textContent=`
  #nexa-profile-modal #nexa-p29-shell,
  #nexa-profile-modal #nexa-player-gen-rail,
  #nexa-profile-modal #nexa-pl-owned-root,
  #nexa-profile-modal #nexa-profile-content,
  #nexa-profile-modal .nexa-profile-content,
  #nexa-profile-modal .nexa-profile-tabs{display:none!important}

  #nexa-profile-modal.nexa-v30-owned #nexa-v30-shell{display:block!important;width:100%!important}
  #nexa-profile-modal.nexa-v30-owned #nexa-v30-tabs,
  #nexa-profile-modal.nexa-v30-owned #nexa-v30-gens,
  #nexa-profile-modal.nexa-v30-owned #nexa-v30-items{display:flex!important}
  #nexa-profile-modal.nexa-v30-owned #nexa-v30-detail{display:block!important}

  #nexa-v425-profile-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;margin:10px 0 2px!important}
  #nexa-v425-profile-actions button{
    width:38px!important;height:38px!important;min-width:38px!important;border-radius:999px!important;
    display:grid!important;place-items:center!important;border:1px solid rgba(255,255,255,.16)!important;
    background:#101428!important;color:#fff!important;box-shadow:none!important;font-size:0!important;overflow:hidden!important;
  }
  #nexa-v425-profile-actions .nexa-v425-guide{color:#ff4fd8!important;border-color:rgba(255,79,216,.55)!important}
  #nexa-v425-profile-actions .nexa-v425-ministry{color:#86e6ff!important;border-color:rgba(134,230,255,.45)!important}
  #nexa-v425-profile-actions svg{display:block!important;width:19px!important;height:19px!important}

  #nexa-profile-modal .nexa-profile-stats>*{position:relative!important}
  .nexa-v444-stat-icon{
    width:18px!important;height:18px!important;display:inline-grid!important;place-items:center!important;
    border-radius:999px!important;margin-right:7px!important;vertical-align:middle!important;
    border:1px solid currentColor!important;background:color-mix(in srgb,currentColor 14%,transparent)!important;
    box-shadow:0 0 10px color-mix(in srgb,currentColor 16%,transparent)!important;
  }
  .nexa-v444-stat-icon svg{width:11px!important;height:11px!important;display:block!important}
  .nexa-v444-stat-icon.furnace{color:#69d2ff!important}
  .nexa-v444-stat-icon.power{color:#b283ff!important}
  .nexa-v444-stat-icon.deployment{color:#68f5b2!important}
  .nexa-v444-stat-icon.finance{color:#ffd466!important}

  .nexa-v444-op-note{margin-top:6px!important;color:#8be7ff!important;font-size:10px!important;line-height:1.3!important}
  `;
  document.head.appendChild(s);
}

const ICONS={
  guide:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.2v5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1" fill="currentColor"/></svg>',
  ministry:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14v10H5zM7 5v4M17 5v4M8 13h3v3H8zM13 13h3v3h-3zM8 5h8M6 9h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  furnace:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v4l2-1 1 2 2-1 1 2V7l2 2v8a3 3 0 0 1-3 3h-2a5 5 0 0 1-5-5V9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  power:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 6 13h5l-1 9 8-12h-5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  deployment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17h10M12 6v11M8.5 9.5 12 6l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  finance:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v9M9.2 9.7c.5-1 1.6-1.7 2.8-1.7 1.6 0 2.9 1 2.9 2.4 0 1.2-.9 1.9-2.4 2.3l-1 .2c-1.3.3-2.1 1-2.1 2.1 0 1.3 1.2 2.2 2.9 2.2 1.2 0 2.3-.5 3-1.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function repairActionIcons(){
  const row=$('#nexa-v425-profile-actions');
  if(!row) return;
  const guide=row.querySelector('.nexa-v425-guide');
  const ministry=row.querySelector('.nexa-v425-ministry, #nexa-v425-ministry');
  if(guide && !guide.dataset.v444Done){ guide.innerHTML=ICONS.guide; guide.dataset.v444Done='1'; }
  if(ministry && !ministry.dataset.v444Done){ ministry.innerHTML=ICONS.ministry; ministry.dataset.v444Done='1'; ministry.setAttribute('aria-label','Ministry Schedule'); }
}

function detectKind(text){
  const t=String(text||'').toLowerCase();
  if(t.includes('furnace')) return 'furnace';
  if(t.includes('power')) return 'power';
  if(t.includes('deploy')) return 'deployment';
  if(t.includes('finance')) return 'finance';
  return '';
}

function repairStatIcons(){
  $$('#nexa-profile-modal .nexa-profile-stats > *').forEach(card=>{
    const txt=(card.textContent||'').trim();
    const kind=detectKind(txt);
    if(!kind) return;
    if(card.querySelector('.nexa-v444-stat-icon')) return;
    const label=card.querySelector('small,[class*="label" i],b,strong,span,div') || card.firstElementChild || card;
    const icon=document.createElement('span');
    icon.className=`nexa-v444-stat-icon ${kind}`;
    icon.innerHTML=ICONS[kind];
    label.prepend(icon);
  });
}

function restoreProfileOwner(){
  const modal=$('#nexa-profile-modal');
  if(!modal) return;
  modal.classList.remove('nexa-p29-owned');
  modal.classList.add('nexa-v30-owned');
  $('#nexa-p29-shell',modal)?.remove();
  $('#nexa-player-gen-rail',modal)?.remove();
  $('#nexa-pl-owned-root',modal)?.remove();
}

function loadProfileStack(){
  loadFresh('nexa-v444-troops','nexa-troop-assets-v25.js?v=25-444-20260824');
  loadFresh('nexa-v444-profile-owner','nexa-profile-owner-v31.js?v=31-444-20260824');
}

function patchOwnerOperationalRoles(){
  $$('.nexa-v25-protected').forEach(badge=>{
    const card=badge.closest('article,section,div') || badge.parentElement;
    if(!card) return;
    card.querySelectorAll('input[data-v25-op-user][data-v25-op]').forEach(input=>{
      input.disabled=false;
      input.removeAttribute('disabled');
      input.dataset.v444OwnerOp='1';
    });
    if(!card.querySelector('.nexa-v444-op-note')){
      const note=document.createElement('div');
      note.className='nexa-v444-op-note';
      note.textContent='Owner module access stays protected. Operational badges/toggles remain editable here.';
      badge.after(note);
    }
  });
}

function interceptOwnerProtected(){
  document.addEventListener('click',e=>{
    const input=e.target.closest?.('input[data-v25-op-user][data-v25-op]');
    if(!input) return;
    const card=input.closest('article,section,div');
    if(!card?.querySelector('.nexa-v25-protected')) return;
    e.stopImmediatePropagation();
    setTimeout(()=>{
      input.disabled=false;
      input.checked=!input.checked;
      input.dispatchEvent(new Event('change',{bubbles:true}));
      input.dispatchEvent(new Event('input',{bubbles:true}));
    },0);
  },true);
}

function pulse(){
  addCSS();
  restoreProfileOwner();
  repairActionIcons();
  repairStatIcons();
  patchOwnerOperationalRoles();
}

function boot(){
  addCSS();
  loadProfileStack();
  interceptOwnerProtected();
  pulse();
  [150,500,1000,1800,3200].forEach(ms=>setTimeout(pulse,ms));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.addEventListener('pageshow',()=>setTimeout(boot,80));
})();