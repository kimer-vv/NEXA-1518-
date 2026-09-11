/* NEXA PULSE FORMS V3.3 — STABLE HOME SIGNAL STACK
   COMPLETE REPLACEMENT for: nexa-pulse-forms-v1.js

   Purpose:
   - Own the entire visible NEXA Pulse Home card.
   - Do NOT depend on the legacy #nexa-v302-pulse markup surviving.
   - Read published forms from event_form_templates.
   - Read listed published SvS Battle Plans.
   - Retire legacy Pulse cards by ID/data/text.
   - Keep exact Home order before Alliance Signal.

   Safety:
   - No MutationObserver.
   - No sub-second indefinite polling.
   - No touchmove preventDefault.
   - No manual scrollLeft.
*/
(()=>{
'use strict';

if(window.__NEXA_PULSE_FORMS_V33_STABLE_HOME_SIGNAL_STACK__) return;
window.__NEXA_PULSE_FORMS_V33_STABLE_HOME_SIGNAL_STACK__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

const sb=
  window.supabaseClient?.from ? window.supabaseClient :
  window.sb?.from ? window.sb :
  window.supabase?.createClient?.(SB_URL,SB_KEY);

if(!sb) return;

const CARD_ID='nexa-v302-pulse';
let generation=0;
let lastPaintKey='';

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];

const META={
  svs:{title:'Battle Sign-Up',url:'battle-form.html?public=1',sub:''},
  fdt:{title:'FDT Sign-Up',url:'fdt-form.html?public=1',sub:''},
  tal:{title:'TAL Sign-Up',url:'tal-form.html?public=1',sub:'7 Rounds'},
  ministry:{title:'Ministry Sign-Up',url:'ministry-signup.html?internal=1',sub:'Construction · Research · Training'}
};

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function clean(v){
  return String(v??'').replace(/\s+/g,' ').trim();
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
  if($('#nexa-pulse-v33-css')) return;

  const s=document.createElement('style');
  s.id='nexa-pulse-v33-css';
  s.textContent=`
    #${CARD_ID}{
      --tech:#35dfff;
      --tech-rgb:53,223,255;
      width:100%!important;
      max-width:100%!important;
      min-height:64px!important;
      height:auto!important;
      margin:0!important;
      padding:12px 16px!important;
      box-sizing:border-box!important;
      border-radius:20px!important;
      border:1px solid rgba(var(--tech-rgb),.34)!important;
      background:
        radial-gradient(circle at 8% 8%,rgba(var(--tech-rgb),.065),transparent 34%),
        linear-gradient(145deg,rgba(7,18,38,.97),rgba(4,10,27,.985))!important;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.012),
        0 0 9px rgba(var(--tech-rgb),.035)!important;
      position:relative!important;
      overflow:hidden!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    #${CARD_ID}::after{
      content:"";
      position:absolute;
      left:-1px;
      top:18px;
      width:3px;
      height:40px;
      border-radius:999px;
      background:#53e8ff;
      box-shadow:0 0 5px rgba(83,232,255,.82),0 0 10px rgba(53,223,255,.38);
      pointer-events:none;
      z-index:5;
    }

    #${CARD_ID} .nexa-pulse-kicker{
      margin:0 0 6px!important;
      color:#7beeff!important;
      font-size:10px!important;
      font-weight:950!important;
      letter-spacing:.18em!important;
      line-height:1.1!important;
      text-transform:uppercase!important;
    }

    #${CARD_ID} .nexa-pulse-title{
      margin:0 0 5px!important;
      color:#fff!important;
      font-size:16px!important;
      line-height:1.15!important;
      font-weight:900!important;
      letter-spacing:-.01em!important;
      font-family:inherit!important;
    }

    #${CARD_ID} .nexa-pulse-copy{
      margin:0!important;
      color:#9aa8c3!important;
      font-size:12px!important;
      line-height:1.35!important;
      font-weight:400!important;
      letter-spacing:0!important;
      font-family:inherit!important;
    }

    /* Empty-state copy only: hide it whenever at least one active item exists. */
    #${CARD_ID}.has-active-content .nexa-pulse-copy{
      display:none!important;
      visibility:hidden!important;
      height:0!important;
      margin:0!important;
      overflow:hidden!important;
    }

    #${CARD_ID} .nexa-pulse-live-surface{
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

    #${CARD_ID} .nexa-pulse-live-surface.is-empty{
      display:none!important;
      margin:0!important;
    }

    #${CARD_ID} .nexa-pulse-form-card,
    #${CARD_ID} .nexa-pulse-bp-card{
      display:grid!important;
      gap:8px!important;
      min-width:0!important;
      padding:11px 12px!important;
      border:1px solid rgba(57,223,255,.18)!important;
      border-radius:14px!important;
      background:rgba(4,18,36,.46)!important;
      box-shadow:none!important;
    }

    #${CARD_ID} .nexa-pulse-bp-card{
      border-color:rgba(158,116,255,.28)!important;
      background:linear-gradient(145deg,rgba(28,20,70,.46),rgba(5,24,45,.48))!important;
    }

    #${CARD_ID} .nexa-pulse-form-head{
      display:flex!important;
      align-items:flex-start!important;
      justify-content:space-between!important;
      gap:10px!important;
      min-width:0!important;
    }

    #${CARD_ID} .nexa-pulse-form-copy{
      display:grid!important;
      gap:3px!important;
      min-width:0!important;
    }

    #${CARD_ID} .nexa-pulse-form-copy b{
      color:#f5fbff!important;
      font-size:12px!important;
      line-height:1.25!important;
    }

    #${CARD_ID} .nexa-pulse-form-copy small{
      color:#9faccb!important;
      font-size:9px!important;
      line-height:1.35!important;
      font-weight:800!important;
    }

    #${CARD_ID} .nexa-pulse-status{
      flex:0 0 auto!important;
      padding:4px 7px!important;
      border-radius:999px!important;
      border:1px solid rgba(255,255,255,.12)!important;
      font-size:8px!important;
      font-weight:950!important;
      letter-spacing:.08em!important;
    }

    #${CARD_ID} .nexa-pulse-status.green{color:#8affcb!important;border-color:rgba(84,240,181,.38)!important;background:rgba(22,92,72,.17)!important}
    #${CARD_ID} .nexa-pulse-status.yellow{color:#ffe28a!important;border-color:rgba(255,215,94,.40)!important;background:rgba(111,82,10,.15)!important}
    #${CARD_ID} .nexa-pulse-status.red{color:#ff9aad!important;border-color:rgba(255,90,120,.43)!important;background:rgba(109,24,45,.16)!important}
    #${CARD_ID} .nexa-pulse-status.purple{color:#d5c5ff!important;border-color:rgba(170,126,255,.40)!important;background:rgba(76,49,133,.18)!important}

    #${CARD_ID} .nexa-pulse-deadline-line{
      font-size:10px!important;
      line-height:1.3!important;
      font-weight:900!important;
    }

    #${CARD_ID} .nexa-pulse-deadline-line.green{color:#8affcb!important}
    #${CARD_ID} .nexa-pulse-deadline-line.yellow{color:#ffe28a!important}
    #${CARD_ID} .nexa-pulse-deadline-line.red{color:#ff9aad!important}

    #${CARD_ID} .nexa-pulse-form-action{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:100%!important;
      min-height:38px!important;
      padding:8px 11px!important;
      box-sizing:border-box!important;
      border:1px solid rgba(75,213,231,.48)!important;
      border-radius:11px!important;
      background:linear-gradient(135deg,rgba(19,104,111,.72),rgba(32,75,118,.78) 54%,rgba(61,49,139,.76))!important;
      color:#fff!important;
      text-decoration:none!important;
      font-size:10px!important;
      font-weight:950!important;
      letter-spacing:.02em!important;
    }

    #${CARD_ID} .nexa-pulse-bp-action{
      border-color:rgba(156,116,255,.48)!important;
      background:linear-gradient(135deg,rgba(73,45,146,.82),rgba(42,72,133,.80),rgba(20,104,114,.72))!important;
    }

    /* Any late legacy Pulse duplicate is hidden immediately unless V3.3 marked it canonical. */
    #nexa-v302-pulse:not(.nexa-pulse-canonical),
    [data-nexa-tech="pulse"]:not(.nexa-pulse-canonical){
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      max-height:0!important;
      min-height:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }

    #nexa-home-signals-stable-stack{
      display:flex!important;
      flex-direction:column!important;
      gap:10px!important;
      width:100%!important;
      max-width:100%!important;
      margin:0!important;
      padding:0!important;
      background:transparent!important;
      border:0!important;
      box-shadow:none!important;
    }

    [data-nexa-retired-pulse="v31"]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      max-height:0!important;
      min-height:0!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      overflow:hidden!important;
    }
  `;
  document.head.appendChild(s);
}

function pulseTextMatch(el){
  if(!el) return false;
  const t=clean(el.textContent);
  return /\bNEXA PULSE\b/i.test(t) &&
         /Signals\s*&\s*response requests/i.test(t);
}

function allianceAnchor(){
  return $('#nexa-v31-alliance') ||
         $$('section,article,div').find(el=>{
           const t=clean(el.textContent);
           if(!/ALLIANCE SIGNAL/i.test(t)) return false;
           if(/TRANSFERS|LIVE EVENT|NEXA PULSE/i.test(t)) return false;
           return true;
         }) ||
         null;
}

function pulseCandidates(){
  const out=[];
  const push=el=>{
    if(!el || out.includes(el)) return;
    out.push(el);
  };

  $$('[id="nexa-v302-pulse"]').forEach(push);
  $$('[data-nexa-tech="pulse"]').forEach(push);

  $$('section,article,div').forEach(el=>{
    if(!pulseTextMatch(el)) return;
    if(/ALLIANCE SIGNAL|TRANSFERS|LIVE EVENT/i.test(clean(el.textContent))) return;
    push(el);
  });

  return out;
}

function chooseExistingPulse(){
  const alliance=allianceAnchor();
  const parent=alliance?.parentNode;
  const candidates=pulseCandidates();

  if(!candidates.length) return null;

  const canonical=candidates.find(el=>el.classList?.contains('nexa-pulse-canonical'));
  if(canonical) return canonical;

  if(parent){
    const sibling=candidates.find(el=>el.parentNode===parent);
    if(sibling) return sibling;
  }

  const exact=candidates.find(el=>el.id==='nexa-v302-pulse');
  if(exact) return exact;

  return candidates[0];
}

function removeExtraPulseCards(keep){
  pulseCandidates().forEach(el=>{
    if(el===keep || keep?.contains(el) || el.contains?.(keep)) return;
    el.remove();
  });

  [
    '#nexa-pulse-owner-v24',
    '#nexa-pulse-owner-v25',
    '#nexa-pulse-owner-v26',
    '#nexa-pulse-owner-v27'
  ].forEach(sel=>{
    const el=$(sel);
    if(el && el!==keep) el.remove();
  });
}

function shellIsIntact(card){
  return !!(
    card &&
    $('.nexa-pulse-kicker',card) &&
    $('.nexa-pulse-title',card) &&
    $('.nexa-pulse-copy',card) &&
    $('.nexa-pulse-live-surface',card)
  );
}

function applyOwnedShell(card){
  if(!card) return null;

  card.id=CARD_ID;
  card.classList.add('section','nexa-v31-strip','nexa-pulse-canonical');
  card.dataset.nexaTech='pulse';
  card.dataset.nexaPulseOwner='v3.3';
  card.setAttribute('aria-live','polite');
  card.removeAttribute('hidden');
  card.setAttribute('aria-hidden','false');

  card.innerHTML=`
    <div class="nexa-pulse-kicker">NEXA PULSE</div>
    <h3 class="nexa-pulse-title">Signals &amp; response requests</h3>
    <p class="nexa-pulse-copy">When leadership publishes a response request, it will appear here.</p>
    <div class="nexa-pulse-live-surface is-empty"></div>
  `;

  return card;
}

function isVisibleCard(el){
  if(!el) return false;
  if(el.hidden) return false;
  if(el.getAttribute('aria-hidden')==='true') return false;
  const style=window.getComputedStyle?.(el);
  if(style){
    if(style.display==='none' || style.visibility==='hidden') return false;
    if(Number(style.opacity||1)===0) return false;
  }
  return true;
}

function findLiveCard(){
  const owned=$('#nexa-v4937-live-event');
  if(owned && isVisibleCard(owned)) return owned;

  const legacy=$('#home-svs-section');
  if(legacy && isVisibleCard(legacy)) return legacy;

  return $$('section,article,div').find(el=>{
    const t=clean(el.textContent);
    if(!isVisibleCard(el)) return false;
    if(!/LIVE EVENT/i.test(t)) return false;
    if(/NEXA PULSE|ALLIANCE SIGNAL|TRANSFERS/i.test(t)) return false;
    return true;
  }) || null;
}

function findTransferCard(){
  const owned=$('#nexa-v49-transfer-card');
  if(owned && isVisibleCard(owned)) return owned;

  return $$('section,article,div').find(el=>{
    const t=clean(el.textContent);
    if(!isVisibleCard(el)) return false;
    if(!/TRANSFERS/i.test(t)) return false;
    if(/LIVE EVENT|NEXA PULSE|ALLIANCE SIGNAL/i.test(t)) return false;
    return true;
  }) || null;
}

function ensureStableStack(pulse){
  const alliance=allianceAnchor();
  if(!alliance || !pulse) return null;

  let stack=$('#nexa-home-signals-stable-stack');

  if(!stack){
    stack=document.createElement('div');
    stack.id='nexa-home-signals-stable-stack';
    stack.dataset.nexaHomeOrderOwner='pulse-v3.3';

    const parent=alliance.parentNode;
    if(!parent) return null;

    /*
      Insert the stable stack exactly where the current signal family lives,
      then move only the four Home signal cards into it.
    */
    parent.insertBefore(stack,alliance);
  }

  const live=findLiveCard();
  const transfer=findTransferCard();

  /* One parent, one permanent visual order. */
  if(live && live.parentNode!==stack) stack.appendChild(live);
  if(pulse.parentNode!==stack) stack.appendChild(pulse);
  if(alliance.parentNode!==stack) stack.appendChild(alliance);
  if(transfer && transfer.parentNode!==stack) stack.appendChild(transfer);

  /*
    appendChild on an existing child is also a deterministic reorder.
    Other owners can still update content, but their anchors now resolve
    inside this same stack, so they cannot send cards elsewhere.
  */
  if(live) stack.appendChild(live);
  stack.appendChild(pulse);
  stack.appendChild(alliance);
  if(transfer) stack.appendChild(transfer);

  return stack;
}

function ensureCard(){
  let card=chooseExistingPulse();

  /*
    Critical V3.3 rule:
    DO NOT create a second Pulse card.
    Wait for the real legacy Home Pulse, then take it over in place.
  */
  if(!card) return null;

  if(!shellIsIntact(card)){
    card=applyOwnedShell(card);
  }else{
    card.id=CARD_ID;
    card.classList.add('nexa-pulse-canonical');
    card.dataset.nexaTech='pulse';
    card.dataset.nexaPulseOwner='v3.3';
    card.setAttribute('aria-hidden','false');
    card.removeAttribute('hidden');
  }

  removeExtraPulseCards(card);
  ensureStableStack(card);
  return card;
}

function normalizeHomeOrder(){
  const card=ensureCard();
  if(!card) return false;
  return !!ensureStableStack(card);
}

function forceSlot(){
  const card=ensureCard();
  if(!card) return null;

  ensureStableStack(card);
  removeExtraPulseCards(card);
  return card;
}

async function loadPublishedForms(){
  const {data,error}=await sb
    .from('event_form_templates')
    .select('event_type_key,settings');

  if(error) throw error;

  return (data||[]).filter(row=>
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
      <div class="nexa-pulse-deadline-line ${esc(d.tone)}">${esc(d.detail)}</div>
      <a class="nexa-pulse-form-action" href="${esc(url)}">${esc(action)}</a>
    </div>
  `;
}

function battlePlanHTML(row){
  const p=row.published_document||{};
  const date=p.event_date ? `Event • ${p.event_date}` : 'SvS battle document';

  return `
    <div class="nexa-pulse-bp-card">
      <div class="nexa-pulse-form-head">
        <div class="nexa-pulse-form-copy">
          <b>Battle Plan Published</b>
          <small>${esc(row.title||'SvS Battle Plan')} • State ${esc(row.state_number||'')}</small>
        </div>
        <span class="nexa-pulse-status purple">PUBLISHED</span>
      </div>
      <div class="nexa-pulse-deadline-line" style="color:#cfc3ff">${esc(date)}</div>
      <a class="nexa-pulse-form-action nexa-pulse-bp-action" href="battle-plan.html?id=${encodeURIComponent(row.id)}">View Battle Plan</a>
    </div>
  `;
}

async function render(){
  installCSS();

  let card=forceSlot();
  if(!card) return false;

  retireExtraPulseCards(card);

  let forms=[];
  let plans=[];

  try{
    [forms,plans]=await Promise.all([
      loadPublishedForms(),
      loadBattlePlans()
    ]);
  }catch(err){
    console.warn('[NEXA Pulse V3.3] data load failed',err);
    return false;
  }

  /*
    The database request is async. A late Home renderer can rewrite Pulse
    while that request is in flight, so reacquire/rehydrate before painting.
  */
  card=forceSlot();
  if(!card) return false;

  let surface=$('.nexa-pulse-live-surface',card);
  if(!surface){
    applyOwnedShell(card);
    surface=$('.nexa-pulse-live-surface',card);
  }
  if(!surface) return false;

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

  const ownsPaint=
    surface.dataset.nexaPulsePainted==='1' &&
    surface.querySelector('.nexa-pulse-form-card,.nexa-pulse-bp-card');

  if(paintKey!==lastPaintKey || !ownsPaint){
    surface.innerHTML=
      forms.map(formHTML).join('')+
      plans.map(battlePlanHTML).join('');

    surface.dataset.nexaPulsePainted='1';
    lastPaintKey=paintKey;
  }

  const hasActiveContent=forms.length>0 || plans.length>0;

  surface.classList.toggle(
    'is-empty',
    !hasActiveContent
  );

  card.classList.toggle('has-active-content',hasActiveContent);

  forceSlot();
  retireExtraPulseCards(card);
  normalizeHomeOrder();
  return true;
}

function finitePasses(){
  const mine=++generation;

  [0,120,300,650,1100,1800,3000,5000,8000,12000,18000,25000].forEach(ms=>{
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
  document.addEventListener('DOMContentLoaded',finitePasses,{once:true});
}else{
  finitePasses();
}

setInterval(()=>render().catch(()=>{}),60000);

})();
