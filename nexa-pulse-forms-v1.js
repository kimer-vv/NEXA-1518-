/* NEXA PULSE FORMS V2.3 — SINGLE VISIBLE CONTENT OWNER
   COMPLETE REPLACEMENT for: nexa-pulse-forms-v1.js

   Purpose:
   - NEXA Pulse remains the Home card owner.
   - This file is the ONLY visible owner of published forms / listed battle plans inside Pulse.
   - Published forms come from event_form_templates.settings.published_to_nexa.
   - State/legacy Pulse painters may keep the base card, but cannot visually replace this surface.
   - Rebuilds the visible surface on finite Home lifecycle passes if another renderer rewrites Pulse.

   Safety:
   - No MutationObserver.
   - No indefinite sub-second polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_PULSE_FORMS_V23_SINGLE_VISIBLE_OWNER__) return;
window.__NEXA_PULSE_FORMS_V23_SINGLE_VISIBLE_OWNER__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

const sb=
  window.supabaseClient?.from ? window.supabaseClient :
  window.sb?.from ? window.sb :
  window.supabase?.createClient?.(SB_URL,SB_KEY);

if(!sb) return;

const SURFACE_ID='nexa-pulse-live-surface';
const LEGACY_FORMS_ID='nexa-pulse-published-forms';
const LEGACY_PLANS_ID='nexa-pulse-battle-plans';

let generation=0;
let lastPaintKey='';

const META={
  svs:{
    title:'Battle Sign-Up',
    url:'battle-form.html?public=1',
    sub:''
  },
  fdt:{
    title:'FDT Sign-Up',
    url:'fdt-form.html?public=1',
    sub:''
  },
  tal:{
    title:'TAL Sign-Up',
    url:'tal-form.html?public=1',
    sub:'7 Rounds'
  },
  ministry:{
    title:'Ministry Sign-Up',
    url:'ministry-signup.html?internal=1',
    sub:'Construction · Research · Training'
  }
};

const $=(s,r=document)=>r?.querySelector?.(s)||null;

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}

function getHost(){
  return $('#nexa-v302-pulse') ||
         $('[data-nexa-tech="pulse"]') ||
         $('#nexa-pulse-card');
}

function deadline(settings){
  if(!settings?.deadline_enabled || !settings?.deadline_at){
    return {label:'OPEN',detail:'Open',tone:'green'};
  }

  const ms=new Date(settings.deadline_at).getTime()-Date.now();

  if(!Number.isFinite(ms)){
    return {label:'OPEN',detail:'Open',tone:'green'};
  }

  if(ms<=0){
    return {label:'CLOSED',detail:'Deadline passed',tone:'red'};
  }

  const days=Math.floor(ms/86400000);
  const hours=Math.floor(ms/3600000)%24;
  const mins=Math.floor(ms/60000)%60;

  const detail=days>0
    ? `Deadline · ${days}D ${hours}H`
    : `Deadline · ${hours}H ${mins}M`;

  if(ms<=86400000) return {label:'OPEN',detail,tone:'red'};
  if(ms<=4*86400000) return {label:'OPEN',detail,tone:'yellow'};
  return {label:'OPEN',detail,tone:'green'};
}

function titleFor(key,settings){
  return settings?.form_title ||
         settings?.title ||
         META[key]?.title ||
         `${String(key||'Form').toUpperCase()} Form`;
}

function urlFor(key,settings){
  return settings?.public_url ||
         settings?.form_url ||
         META[key]?.url ||
         'forms-center.html';
}

function subFor(key,settings){
  return settings?.pulse_subtitle ||
         META[key]?.sub ||
         '';
}

function installCSS(){
  if($('#nexa-pulse-forms-v23-css')) return;

  const s=document.createElement('style');
  s.id='nexa-pulse-forms-v23-css';

  s.textContent=`
    /* Old visible content owners are retired. */
    #${LEGACY_FORMS_ID},
    #${LEGACY_PLANS_ID}{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      max-height:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }

    #${SURFACE_ID}{
      display:grid!important;
      gap:9px!important;
      width:100%!important;
      min-width:0!important;
      margin-top:10px!important;
      padding:0!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
    }

    #${SURFACE_ID}.is-empty{
      display:none!important;
      margin:0!important;
    }

    #${SURFACE_ID} .nexa-pulse-form-card,
    #${SURFACE_ID} .nexa-pulse-bp-card{
      display:grid!important;
      gap:8px!important;
      min-width:0!important;
      padding:11px 12px!important;
      border:1px solid rgba(57,223,255,.18)!important;
      border-radius:14px!important;
      background:rgba(4,18,36,.46)!important;
      box-shadow:none!important;
    }

    #${SURFACE_ID} .nexa-pulse-bp-card{
      border-color:rgba(158,116,255,.28)!important;
      background:
        linear-gradient(
          145deg,
          rgba(28,20,70,.46),
          rgba(5,24,45,.48)
        )!important;
    }

    #${SURFACE_ID} .nexa-pulse-form-head{
      display:flex!important;
      align-items:flex-start!important;
      justify-content:space-between!important;
      gap:10px!important;
      min-width:0!important;
    }

    #${SURFACE_ID} .nexa-pulse-form-copy{
      display:grid!important;
      gap:3px!important;
      min-width:0!important;
    }

    #${SURFACE_ID} .nexa-pulse-form-copy b{
      color:#f5fbff!important;
      font-size:12px!important;
      line-height:1.25!important;
    }

    #${SURFACE_ID} .nexa-pulse-form-copy small{
      color:#9faccb!important;
      font-size:9px!important;
      line-height:1.35!important;
      font-weight:800!important;
    }

    #${SURFACE_ID} .nexa-pulse-status{
      flex:0 0 auto!important;
      padding:4px 7px!important;
      border-radius:999px!important;
      border:1px solid rgba(255,255,255,.12)!important;
      font-size:8px!important;
      font-weight:950!important;
      letter-spacing:.08em!important;
    }

    #${SURFACE_ID} .nexa-pulse-status.green{
      color:#8affcb!important;
      border-color:rgba(84,240,181,.38)!important;
      background:rgba(22,92,72,.17)!important;
    }

    #${SURFACE_ID} .nexa-pulse-status.yellow{
      color:#ffe28a!important;
      border-color:rgba(255,215,94,.40)!important;
      background:rgba(111,82,10,.15)!important;
    }

    #${SURFACE_ID} .nexa-pulse-status.red{
      color:#ff9aad!important;
      border-color:rgba(255,90,120,.43)!important;
      background:rgba(109,24,45,.16)!important;
    }

    #${SURFACE_ID} .nexa-pulse-status.purple{
      color:#d5c5ff!important;
      border-color:rgba(170,126,255,.40)!important;
      background:rgba(76,49,133,.18)!important;
    }

    #${SURFACE_ID} .nexa-pulse-deadline-line{
      font-size:10px!important;
      line-height:1.3!important;
      font-weight:900!important;
    }

    #${SURFACE_ID} .nexa-pulse-deadline-line.green{color:#8affcb!important}
    #${SURFACE_ID} .nexa-pulse-deadline-line.yellow{color:#ffe28a!important}
    #${SURFACE_ID} .nexa-pulse-deadline-line.red{color:#ff9aad!important}

    #${SURFACE_ID} .nexa-pulse-form-action{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:100%!important;
      min-height:38px!important;
      padding:8px 11px!important;
      box-sizing:border-box!important;
      border:1px solid rgba(75,213,231,.48)!important;
      border-radius:11px!important;
      background:
        linear-gradient(
          135deg,
          rgba(19,104,111,.72),
          rgba(32,75,118,.78) 54%,
          rgba(61,49,139,.76)
        )!important;
      color:#fff!important;
      text-decoration:none!important;
      font-size:10px!important;
      font-weight:950!important;
      letter-spacing:.02em!important;
    }

    #${SURFACE_ID} .nexa-pulse-bp-action{
      border-color:rgba(156,116,255,.48)!important;
      background:
        linear-gradient(
          135deg,
          rgba(73,45,146,.82),
          rgba(42,72,133,.80),
          rgba(20,104,114,.72)
        )!important;
    }
  `;

  document.head.appendChild(s);
}

function retireLegacyBoxes(host){
  if(!host) return;

  const a=$('#'+LEGACY_FORMS_ID,host);
  const b=$('#'+LEGACY_PLANS_ID,host);

  if(a) a.remove();
  if(b) b.remove();
}

function ensureSurface(){
  const host=getHost();
  if(!host) return null;

  retireLegacyBoxes(host);

  let surface=$('#'+SURFACE_ID,host);

  if(!surface){
    surface=document.createElement('div');
    surface.id=SURFACE_ID;
    surface.dataset.nexaPulseOwner='v2.3';
    host.appendChild(surface);
  }

  return surface;
}

async function loadPublishedForms(){
  const {data,error}=await sb
    .from('event_form_templates')
    .select('event_type_key,settings');

  if(error) throw error;

  return (data||[])
    .filter(row=>
      row?.settings?.published_to_nexa===true &&
      row?.settings?.public_access_removed!==true
    );
}

async function loadBattlePlans(){
  const {data,error}=await sb
    .from('svs_battle_plans')
    .select('id,title,state_number,status,is_listed,published_at,published_document')
    .eq('status','published')
    .eq('is_listed',true)
    .order('published_at',{ascending:false})
    .limit(3);

  if(error) return [];
  return data||[];
}

function formHTML(row){
  const key=row.event_type_key;
  const st=row.settings||{};
  const d=deadline(st);

  const title=titleFor(key,st);
  const sub=subFor(key,st);
  const url=urlFor(key,st);
  const action=d.label==='CLOSED' ? 'View Form' : 'Start Form';

  return `
    <div class="nexa-pulse-form-card" data-form-key="${esc(key)}">
      <div class="nexa-pulse-form-head">
        <div class="nexa-pulse-form-copy">
          <b>${esc(title)}</b>
          ${sub ? `<small>${esc(sub)}</small>` : ''}
        </div>
        <span class="nexa-pulse-status ${esc(d.tone)}">${esc(d.label)}</span>
      </div>

      <div class="nexa-pulse-deadline-line ${esc(d.tone)}">
        ${esc(d.detail)}
      </div>

      <a class="nexa-pulse-form-action" href="${esc(url)}">
        ${esc(action)}
      </a>
    </div>
  `;
}

function battlePlanHTML(row){
  const p=row.published_document||{};
  const date=p.event_date
    ? `Event • ${p.event_date}`
    : 'SvS battle document';

  return `
    <div class="nexa-pulse-bp-card">
      <div class="nexa-pulse-form-head">
        <div class="nexa-pulse-form-copy">
          <b>Battle Plan Published</b>
          <small>${esc(row.title||'SvS Battle Plan')} • State ${esc(row.state_number||'')}</small>
        </div>
        <span class="nexa-pulse-status purple">PUBLISHED</span>
      </div>

      <div class="nexa-pulse-deadline-line" style="color:#cfc3ff">
        ${esc(date)}
      </div>

      <a
        class="nexa-pulse-form-action nexa-pulse-bp-action"
        href="battle-plan.html?id=${encodeURIComponent(row.id)}"
      >
        View Battle Plan
      </a>
    </div>
  `;
}

async function render(){
  installCSS();

  const surface=ensureSurface();
  if(!surface) return false;

  let forms=[];
  let plans=[];

  try{
    [forms,plans]=await Promise.all([
      loadPublishedForms(),
      loadBattlePlans()
    ]);
  }catch(err){
    console.warn('[NEXA Pulse V2.3] render failed',err);
    return false;
  }

  const paintKey=JSON.stringify({
    forms:forms.map(x=>[
      x.event_type_key,
      x.settings?.published_to_nexa,
      x.settings?.public_access_removed,
      x.settings?.deadline_at,
      x.settings?.form_title,
      x.settings?.public_url,
      x.settings?.form_url
    ]),
    plans:plans.map(x=>[
      x.id,
      x.title,
      x.published_at
    ])
  });

  /*
    If another Home renderer deleted/replaced our surface,
    ensureSurface() recreated it. Repaint even when the data key is unchanged.
  */
  const ownsPaint=
    surface.dataset.nexaPulsePainted==='1' &&
    surface.querySelector(
      '.nexa-pulse-form-card,.nexa-pulse-bp-card'
    );

  if(paintKey!==lastPaintKey || !ownsPaint){
    surface.innerHTML=
      forms.map(formHTML).join('')+
      plans.map(battlePlanHTML).join('');

    surface.dataset.nexaPulsePainted='1';
    lastPaintKey=paintKey;
  }

  surface.classList.toggle(
    'is-empty',
    forms.length===0 && plans.length===0
  );

  return true;
}

function finitePasses(){
  const mine=++generation;

  [0,120,300,650,1100,1800,3000,5000,8000].forEach(ms=>{
    setTimeout(()=>{
      if(mine!==generation) return;
      render().catch(()=>{});
    },ms);
  });
}

window.addEventListener('nexa:home-ready',finitePasses);
window.addEventListener('nexa:active-state-changed',finitePasses);
window.addEventListener('pageshow',finitePasses);

document.addEventListener('visibilitychange',()=>{
  if(!document.hidden) finitePasses();
});

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    finitePasses,
    {once:true}
  );
}else{
  finitePasses();
}

/* Slow refresh for deadline countdown / newly published forms. */
setInterval(()=>{
  render().catch(()=>{});
},60000);

})();