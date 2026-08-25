/* NEXA V44.8.1 — CONSOLIDATED PROFILE / CONSTELLATION / MULTISERVER PASS — 2026-08-25
   COMPLETE REPLACEMENT for nexa-v44-8-profile-stability.js
   Fixes:
   - MAIN / ALT labels across Constellation, Passport and Player Intelligence Profile
   - Restores native Constellation -> Passport flow (no click hijack)
   - Stable galaxy Constellation background + deterministic per-account colors
   - Snow Ape Deployment Capacity from the actually displayed account
   - Expert explanations/current effect
   - Chief Gear saved stars displayed vertically inside the left side of the planet
   - Login gate: no MENU, standalone Report Bugs, generic multi-server tagline
   - Create Account: State field; syncs state_number after account creation
   No MutationObserver. No polling. No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V4481_CONSOLIDATED__) return;
window.__NEXA_V4481_CONSOLIDATED__=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');
const sb=()=>window.supabaseClient?.from?window.supabaseClient:(window.sb?.from?window.sb:null);

let deployBusy=false, expertBusy=false, gearBusy=false, labelBusy=false;
let accountCache=[];

const ACCOUNT_COLORS=['#ff50d8','#58d8ff','#9c6dff','#5ce2b7','#ffae55'];

function installCSS(){
  if($('#nexa-v4481-css'))return;
  const st=document.createElement('style');
  st.id='nexa-v4481-css';
  st.textContent=`
  /* Auth gate: NEXA only + Report Bugs */
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-home-menu-toggle,
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-home-menu{display:none!important}
  #nexa-v4481-report-bugs{
    position:fixed;z-index:1000002;left:22px;top:max(18px,calc(env(safe-area-inset-top) + 8px));
    display:none;align-items:center;gap:8px;border:1px solid rgba(255,79,191,.55);border-radius:999px;
    background:rgba(28,8,42,.82);color:#ff83d2;padding:10px 14px;font-size:11px;font-weight:950;
    letter-spacing:.08em;box-shadow:0 0 18px rgba(255,71,190,.18);backdrop-filter:blur(12px)
  }
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-v4481-report-bugs{display:inline-flex}
  #nexa-auth-gate .nexa-auth-brand p{max-width:360px;margin-left:auto!important;margin-right:auto!important}

  /* Stable canonical Constellation atmosphere */
  #nexa-account-constellation .nexa-constellation-backdrop{
    background:
      radial-gradient(circle at 77% 25%,rgba(92,135,255,.22) 0 4%,rgba(78,91,210,.16) 5%,transparent 13%),
      radial-gradient(circle at 16% 35%,rgba(212,70,255,.22) 0 2.2%,transparent 8%),
      radial-gradient(circle at 50% 52%,rgba(178,56,255,.20),transparent 27%),
      radial-gradient(circle at 46% 47%,rgba(75,61,232,.16),transparent 40%),
      linear-gradient(165deg,#030515 0%,#080722 48%,#020511 100%)!important;
    backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important
  }
  #nexa-account-constellation .nexa-constellation-backdrop:before{
    content:"";position:absolute;right:8%;top:20%;width:64px;height:64px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 35% 28%,#8ab1ff 0 8%,#526bd6 34%,#1d2868 68%,#080d2b 100%);
    box-shadow:0 0 28px rgba(93,121,255,.38),inset -10px -9px 16px rgba(0,0,0,.42)
  }
  #nexa-account-constellation .nexa-constellation-stage{
    background-image:
      radial-gradient(circle,rgba(255,255,255,.70) 0 1px,transparent 1.4px),
      radial-gradient(circle,rgba(111,142,255,.52) 0 1px,transparent 1.4px);
    background-size:63px 63px,97px 97px;background-position:7px 11px,31px 37px
  }
  #nexa-account-constellation .nexa-account-planet[data-nexa-profile]{
    --acct:#a56bff;
    border-color:var(--acct)!important;
    box-shadow:0 0 13px color-mix(in srgb,var(--acct) 78%,transparent),0 0 30px color-mix(in srgb,var(--acct) 32%,transparent)!important
  }
  #nexa-account-constellation .nexa-account-planet[data-nexa-profile] img{
    box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--acct) 62%,transparent)!important
  }
  #nexa-account-constellation .nexa-account-planet-type{
    color:var(--acct)!important;text-shadow:0 0 8px color-mix(in srgb,var(--acct) 70%,transparent)!important
  }

  #nexa-profile-type.v448-main{color:#ffd96b!important;border-color:rgba(255,198,64,.72)!important}
  #nexa-profile-type.v448-alt{color:#86eaff!important;border-color:rgba(77,216,255,.65)!important}

  .v448-expert-info{display:grid;gap:5px;margin:9px 0;padding:10px 11px;border:1px solid rgba(96,211,255,.28);border-radius:12px;background:rgba(7,28,48,.55)}
  .v448-expert-info small{font-size:8px;font-weight:950;letter-spacing:.11em;color:#68ddff}
  .v448-expert-info b{font-size:11px;line-height:1.42;color:#eef8ff}
  .v448-expert-info span{font-size:9px;line-height:1.4;color:#9daac8}
  .v448-expert-current{color:#ffd96b!important;font-weight:900!important}

  /* Chief Gear stars: inside planet, left side, vertical */
  .v448-gear-stars{
    position:absolute;z-index:8;left:5px;top:50%;transform:translateY(-50%);
    display:flex;flex-direction:column;gap:1px;pointer-events:none
  }
  .v448-gear-stars span{
    font-size:10px;line-height:10px;color:rgba(255,232,132,.22);
    text-shadow:0 0 5px rgba(255,205,67,.08)
  }
  .v448-gear-stars span.on{
    color:#ffd84f;text-shadow:0 0 5px rgba(255,214,72,.95),0 0 10px rgba(255,184,35,.52)
  }
  `;
  document.head.appendChild(st);
}

async function loadAccounts(){
  const c=sb();if(!c)return [];
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return [];
    const q=await c.from('player_accounts')
      .select('id,in_game_name,player_id,is_main,account_purpose,state_number')
      .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at');
    accountCache=q.data||[];
    return accountCache;
  }catch{return accountCache}
}

async function resolveDisplayedAccount(){
  const c=sb();if(!c)return null;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return null;
    const pid=String($('#nexa-profile-player-id')?.textContent||'').trim();
    if(pid&&pid!=='—'){
      const q=await c.from('player_accounts')
        .select('id,in_game_name,player_id,is_main,account_purpose,state_number')
        .eq('user_id',user.id).eq('player_id',pid).maybeSingle();
      if(q.data){window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);return q.data}
    }
    const active=String(window.NEXA_ACTIVE_ACCOUNT_ID||'');
    if(active){
      const q=await c.from('player_accounts').select('id,in_game_name,player_id,is_main,account_purpose,state_number').eq('user_id',user.id).eq('id',active).maybeSingle();
      if(q.data)return q.data;
    }
    const q=await c.from('player_accounts').select('id,in_game_name,player_id,is_main,account_purpose,state_number').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
    return q.data||null;
  }catch{return null}
}

function canonicalAccountText(el,isMain){
  if(!el)return;
  el.textContent=isMain?'★ MAIN ACCOUNT':'✦ ALT ACCOUNT';
}

async function repairAccountLabels(){
  if(labelBusy)return;labelBusy=true;
  try{
    const rows=await loadAccounts();
    const byId=new Map(rows.map(x=>[String(x.id),x]));

    // Constellation: source of truth by data-nexa-profile.
    $$('#nexa-account-constellation [data-nexa-profile]').forEach((card,i)=>{
      const row=byId.get(String(card.dataset.nexaProfile));
      if(!row)return;
      card.classList.toggle('main',!!row.is_main);
      card.classList.toggle('alt',!row.is_main);
      const type=$('.nexa-account-planet-type',card);
      if(type)canonicalAccountText(type,!!row.is_main);
      const color=ACCOUNT_COLORS[i%ACCOUNT_COLORS.length];
      card.style.setProperty('--acct',color);
    });

    // Player Intelligence Profile header.
    const shown=await resolveDisplayedAccount();
    const badge=$('#nexa-profile-type');
    if(badge&&shown){
      badge.classList.remove('v445-main','v445-alt','v448-main','v448-alt');
      canonicalAccountText(badge,!!shown.is_main);
      badge.classList.add(shown.is_main?'v448-main':'v448-alt');
    }

    // Passport + any stale account-purpose leaves.
    const roots=[$('#nexa-account-constellation'),$('#nexa-profile-modal'),document].filter(Boolean);
    const seen=new Set();
    roots.forEach(root=>$$('span,b,strong,small,p,label,option',root).forEach(el=>{
      if(seen.has(el))return;seen.add(el);
      if(el.children.length&&el.tagName!=='OPTION')return;
      const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/^(point(s)? account|buff[_\s-]*points?|boost[_\s-]*points?|buff[_\s-]*account|boost[_\s-]*account|full|basic|alt)$/i.test(t)){
        el.textContent='✦ ALT ACCOUNT';
      }else if(/^main$/i.test(t)&&el.closest('[class*="passport"],[id*="passport"],[class*="account"],[id*="account"],#nexa-profile-modal')){
        el.textContent='★ MAIN ACCOUNT';
      }
    }));
  }finally{labelBusy=false}
}

async function deployment(){
  if(deployBusy)return;
  const panel=$('#nexa-deploy-panel');if(!panel)return;
  const parse=v=>Number(String(v||'').replace(/[^\d]/g,'')||0);
  const base=parse($('#nexa-edit-deployment')?.value)||parse($('#nexa-profile-deployment')?.textContent);
  if(!base)return;
  const set=(id,v)=>{const el=$('#'+id);if(el)el.textContent=typeof v==='number'?Math.round(v).toLocaleString():String(v)};
  set('dep-base',base);set('dep-10',base*1.10);set('dep-20',base*1.20);

  deployBusy=true;
  try{
    const c=sb(),account=await resolveDisplayedAccount();if(!c||!account?.id)return;
    let pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').eq('name','Snow Ape').maybeSingle();
    if(!pet.data?.id)pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').ilike('name','%Snow%Ape%').limit(1).maybeSingle();
    if(!pet.data?.id){set('dep-pet','Snow Ape not found');set('dep-pet10','—');set('dep-pet20','—');return}

    const inv=await c.from('player_library_inventory').select('progress')
      .eq('player_account_id',account.id).eq('library_item_id',pet.data.id).maybeSingle();
    const p=inv.data?.progress||{};
    const lv=clamp(Number(p.pet_skill??p.skill_level??0),0,10);
    const vals=[0,1500,3000,4500,6000,7500,9000,10500,12000,13500,15000];
    const plus=vals[lv]||0;

    if(!plus){
      set('dep-pet','Set Snow Ape skill first');
      set('dep-pet10','Set Snow Ape skill first');
      set('dep-pet20','Set Snow Ape skill first');
      return;
    }
    // Flat Snow Ape capacity stacks with the percentage deployment buff calculated from Base.
    set('dep-pet',base+plus);
    set('dep-pet10',base+plus+(base*.10));
    set('dep-pet20',base+plus+(base*.20));
  }catch(e){console.warn('[NEXA V44.8.1] deployment',e)}
  finally{deployBusy=false}
}

const EXPERT_FALLBACK={
 'scavenging':['Earns extra Enhancement XP Components from Bear Hunt rewards.','Bear Hunt rewards'],
 'weapon master':['Earns extra Essence Stones from Bear Hunt rewards.','Bear Hunt rewards'],
 'entrapment':['Increases the maximum number of troops that can fit in your Bear Hunt rally.','Bear Hunt rally capacity'],
 "ursa's bane":['Increases the number of your own troops you can deploy during Bear Hunt.','Bear Hunt personal deployment']
};
async function experts(){
  if(expertBusy)return;
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const boxes=$$('.v33-skill[data-v33-expert-box]',root);if(!boxes.length)return;
  expertBusy=true;
  try{
    const title=String($('.v33-title h3',root)?.textContent||'').trim(),c=sb();let md={};
    if(c&&title){
      const q=await c.from('nexa_library_items').select('metadata').eq('item_type','expert').eq('name',title).maybeSingle();
      md=q.data?.metadata||{};
    }
    const skills=Array.isArray(md.skills)?md.skills:[];
    boxes.forEach(box=>{
      const name=String($('h4',box)?.textContent||'').trim();
      const sk=skills.find(x=>norm(x.name)===norm(name))||{};
      const fb=EXPERT_FALLBACK[norm(name)]||[];
      const desc=sk.description||sk.effect||sk.details||fb[0]||'This Expert skill improves its listed bonus as the skill level increases.';
      const where=sk.applies_to||sk.scope||sk.specialty||fb[1]||md.specialty||'Expert bonus';
      const nativeResult=String($('.v33-result',box)?.textContent||'').replace(/\s+/g,' ').trim()||'Not active';
      let info=$('.v448-expert-info',box);
      if(!info){
        info=document.createElement('div');info.className='v448-expert-info';
        const result=$('.v33-result',box);result?result.before(info):box.appendChild(info);
      }
      info.innerHTML=`<small>WHAT IT DOES</small><b>${esc(desc)}</b><span>Applies to: ${esc(where)}</span><small>CURRENT EFFECT / BUFF</small><span class="v448-expert-current">${esc(nativeResult)}</span>`;
    });
  }catch(e){console.warn('[NEXA V44.8.1] experts',e)}
  finally{expertBusy=false}
}

async function chiefGearStars(){
  if(gearBusy)return;
  const cards=$$('#nexa-profile-modal .v33-item[data-type="chief_gear"][data-v33-item]');
  if(!cards.length)return;
  gearBusy=true;
  try{
    const c=sb(),account=await resolveDisplayedAccount();if(!c||!account?.id)return;
    const q=await c.from('player_library_inventory').select('library_item_id,progress').eq('player_account_id',account.id);
    const map=new Map((q.data||[]).map(x=>[String(x.library_item_id),x.progress||{}]));
    cards.forEach(card=>{
      const p=map.get(String(card.dataset.v33Item))||{};
      const stars=clamp(Number(p.gear_stars||0),0,3);
      const planet=$('.v33-planet',card);if(!planet)return;
      let host=$('.v448-gear-stars',planet);
      if(!host){host=document.createElement('span');host.className='v448-gear-stars';planet.appendChild(host)}
      host.innerHTML=[1,2,3].map(n=>`<span class="${n<=stars?'on':''}">★</span>`).join('');
    });
  }catch(e){console.warn('[NEXA V44.8.1] chief gear stars',e)}
  finally{gearBusy=false}
}

function installAuthAdjustments(){
  const gate=$('#nexa-auth-gate');if(!gate)return;
  const brand=$('.nexa-auth-brand p',gate);
  if(brand)brand.textContent='ONE HUB • MANAGEMENT, EVENTS & COORDINATION';

  let report=$('#nexa-v4481-report-bugs');
  if(!report){
    report=document.createElement('button');report.id='nexa-v4481-report-bugs';report.type='button';
    report.innerHTML='<span>●</span><span>REPORT BUGS</span>';
    report.onclick=()=>{
      const candidates=$$('button,a');
      const native=candidates.find(x=>/report\s*bugs/i.test(String(x.textContent||''))&&x!==report);
      if(native){native.click();return}
      if(typeof window.openBugReport==='function'){window.openBugReport();return}
      location.hash='report-bugs';
    };
    document.body.appendChild(report);
  }

  const form=$('#nexa-create-form');
  if(form&&!$('#nexa-create-state',form)){
    const ign=$('#nexa-create-name',form)?.closest('label');
    const label=document.createElement('label');
    label.innerHTML='State<input id="nexa-create-state" required inputmode="numeric" pattern="[0-9]*" placeholder="Enter your state"><span class="nexa-field-hint">The state/server this Main Game Account belongs to.</span>';
    ign?.insertAdjacentElement('afterend',label);
  }
}

function capturePendingState(e){
  const form=e.target.closest?.('#nexa-create-form');if(!form)return;
  const input=$('#nexa-create-state',form);if(!input)return;
  const state=Number(String(input.value||'').replace(/\D/g,''));
  if(!state||state<1){e.preventDefault();e.stopPropagation();alert('Enter your state.');return}
  sessionStorage.setItem('nexa_pending_state_number',String(state));
}

async function syncPendingState(){
  const raw=sessionStorage.getItem('nexa_pending_state_number');if(!raw)return;
  const state=Number(raw);if(!state)return;
  const c=sb();if(!c)return;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return;
    const q=await c.from('player_accounts').update({state_number:state,updated_at:new Date().toISOString()})
      .eq('user_id',user.id).eq('is_main',true).select('id').limit(1);
    if(!q.error&&q.data?.length)sessionStorage.removeItem('nexa_pending_state_number');
  }catch{}
}

function apply(){
  installCSS();
  installAuthAdjustments();
  repairAccountLabels();
  deployment();
  experts();
  chiefGearStars();
  syncPendingState();
}
function schedule(){
  requestAnimationFrame(apply);
  [60,180,420,900,1600].forEach(ms=>setTimeout(apply,ms));
}

/* Do NOT hijack Constellation clicks. Native code owns Passport navigation. */
document.addEventListener('pointerdown',e=>{
  const card=e.target.closest?.('#nexa-account-constellation [data-nexa-profile]');
  if(card?.dataset.nexaProfile)window.NEXA_ACTIVE_ACCOUNT_ID=String(card.dataset.nexaProfile);
},true);

document.addEventListener('submit',capturePendingState,true);

document.addEventListener('click',e=>{
  if(e.target.closest?.('#nexa-profile-launcher,[data-nexa-profile],[data-close-nexa-profile],[data-close-constellation],#nexa-deployment-stat,[data-v33-save],[data-v33-item],[data-v33-cat],[data-v33-gen]'))schedule();
  if(e.target.closest?.('[data-v33-save]'))[100,320,800].forEach(ms=>setTimeout(()=>{deployment();chiefGearStars();},ms));
},true);

document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v33-expert-skill],[data-v44-pet-level],[data-v33-pet-skill],#nexa-edit-deployment'))schedule();
},true);

window.addEventListener('nexa:profile-open',schedule);
window.addEventListener('nexa:profile-updated',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('load',schedule);

schedule();
})();
