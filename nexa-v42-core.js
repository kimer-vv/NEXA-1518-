/* NEXA V42.4 — CLEAN SINGLE OWNER CORE
   Structural repair: native iOS rails, compact Home, stable Menu/Admin, My Alliance,
   working Profile Guide/Ministry, event themes. No MutationObserver. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V424__) return;
window.__NEXA_V424__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let localSb=null, currentAdmin='alliances', menuTimers=[];
const ADMIN_ORDER=['alliances','library','permissions','roles','system'];
const ADMIN_LABEL={alliances:'Alliances',library:'Library',permissions:'NEXA Access',roles:'Operational Roles',system:'System Operations'};

function sb(){
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}
function addCSS(){
 if($('#nexa-v424-css'))return;
 const s=document.createElement('style');s.id='nexa-v424-css';s.textContent=`
 :root{--nexa-event-primary:#9b79ff;--nexa-event-secondary:#55cfff;--nexa-event-deep:#24154c}
 html,body{max-width:100%!important;overflow-x:hidden!important}
 body.nexa-workspace-open #nexa-home-menu-toggle,body.nexa-workspace-open #nexa-home-menu{display:none!important}

 /* HOME */
 main.shell{width:min(680px,calc(100% - 24px))!important;max-width:calc(100% - 24px)!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
 main.shell>*{grid-column:1/-1!important;width:100%!important;max-width:100%!important;min-width:0!important}
 main.shell>.hero{padding:14px 0 8px!important;margin:0!important;min-height:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
 main.shell>.hero p{display:none!important}
 #nexa-profile-launcher-section{background:transparent!important;border:0!important;box-shadow:none!important;padding:18px 0 10px!important}
 #nexa-profile-launcher-section>*{box-shadow:none}
 #nexa-profile-launcher-photo{box-shadow:0 0 0 4px color-mix(in srgb,var(--nexa-event-primary) 24%,transparent),0 0 34px color-mix(in srgb,var(--nexa-event-secondary) 36%,transparent)!important}
 #nexa-profile-launcher-name{margin-top:12px!important;font-size:13px!important;line-height:1.25!important;letter-spacing:.07em!important;text-align:center!important;color:#e5ddff!important;background:none!important;-webkit-text-fill-color:currentColor!important}
 #nexa-v424-stellar{width:100%;padding:8px 8px 12px;text-align:center;background:transparent;border:0}
 #nexa-v424-stellar .line{display:flex;align-items:center;justify-content:center;gap:18px}
 #nexa-v424-stellar .orb{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--nexa-event-primary) 40%,transparent);background:radial-gradient(circle,color-mix(in srgb,var(--nexa-event-secondary) 16%,transparent),rgba(7,8,25,.14) 50%,transparent 72%);box-shadow:0 0 23px color-mix(in srgb,var(--nexa-event-primary) 15%,transparent);color:#dcd3ff;font-size:10px}
 #nexa-v424-stellar b{font-size:10px;letter-spacing:.22em;color:#ddd5ff;text-shadow:0 0 15px color-mix(in srgb,var(--nexa-event-primary) 50%,transparent)}
 #nexa-v424-stellar p{margin:4px 0 0;color:#d5d0e5;font-size:10px;line-height:1.35}
 #home-svs-section,#home-transfers-section,#nexa-v424-pulse,#nexa-v424-alliance{width:100%!important;max-width:100%!important;margin:0!important}
 #home-svs-section.nexa-v424-empty,#home-transfers-section.nexa-v424-empty,#nexa-v424-pulse,#nexa-v424-alliance{padding:12px 14px!important;min-height:0!important;height:auto!important;border-radius:18px!important}
 #home-svs-section.nexa-v424-empty{border:1px solid color-mix(in srgb,var(--nexa-event-primary) 38%,transparent)!important;background:linear-gradient(145deg,rgba(20,19,50,.88),rgba(5,9,27,.97))!important}
 #home-transfers-section.nexa-v424-empty{border:1px solid rgba(255,138,61,.36)!important;background:linear-gradient(145deg,rgba(55,28,14,.62),rgba(12,9,24,.96))!important}
 #home-svs-section.nexa-v424-empty>*:not(.nexa-v424-empty-copy),#home-transfers-section.nexa-v424-empty>*:not(.nexa-v424-empty-copy){display:none!important}
 .nexa-v424-empty-copy .kicker,#nexa-v424-pulse .kicker,#nexa-v424-alliance .kicker{font-size:8px;letter-spacing:.17em;font-weight:950;margin-bottom:4px}
 #home-svs-section .kicker{color:#bc9cff}#home-transfers-section .kicker{color:#ff9c5c}
 .nexa-v424-empty-copy h3,#nexa-v424-pulse h3,#nexa-v424-alliance h3{margin:0 0 3px;font-size:15px;line-height:1.1;color:#fff}
 .nexa-v424-empty-copy p,#nexa-v424-pulse p,#nexa-v424-alliance p{margin:0;font-size:10px;line-height:1.35;color:#adb7cf}
 #nexa-v424-pulse{border:1px solid rgba(48,211,255,.34);background:linear-gradient(145deg,rgba(4,34,53,.91),rgba(4,11,30,.97))}
 #nexa-v424-pulse .kicker{color:#66eaff}
 #nexa-v424-alliance{border:1px solid rgba(219,66,255,.34);background:linear-gradient(145deg,rgba(37,8,52,.91),rgba(13,6,30,.97))}
 #nexa-v424-alliance .kicker{color:#ec8cff}

 /* PROFILE — native horizontal scrolling only */
 #nexa-profile-modal{overflow:hidden!important;padding:6px!important}
 #nexa-profile-modal .nexa-profile-sheet{width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important}
 #nexa-profile-modal .nexa-profile-tabs,#nexa-profile-modal [class*="generation" i],#nexa-player-gen-rail{
   display:flex!important;flex-flow:row nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;
   width:100%!important;max-width:100%!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important;
   scroll-snap-type:none!important;scroll-behavior:auto!important;overscroll-behavior-x:auto!important;scrollbar-width:none!important
 }
 #nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,#nexa-profile-modal [class*="generation" i]::-webkit-scrollbar,#nexa-player-gen-rail::-webkit-scrollbar{display:none!important}
 #nexa-v424-profile-actions{display:flex;align-items:center;justify-content:center;gap:9px;margin:10px 0 2px;position:relative;z-index:20}
 .nexa-v424-guide,#nexa-v424-ministry{width:36px;height:36px;min-width:36px;border-radius:50%;display:grid;place-items:center;background:#0e122a;font-weight:950;touch-action:manipulation}
 .nexa-v424-guide{border:1px solid #ff4fd8;color:#ff4fd8}
 #nexa-v424-ministry{border:1px solid #baa6ff;color:#d8ccff;font-size:16px}

 /* HOME MENU */
 #nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px)!important}
 #nexa-home-menu-card{overflow:hidden!important}
 #nexa-home-menu .nexa-v424-hide{display:none!important}
 #nexa-v424-my-alliance,#nexa-v424-report{
   width:100%;border:0;border-radius:12px;background:transparent;padding:11px 12px;
   display:flex;align-items:center;justify-content:space-between;gap:10px;
   font-size:10px;font-weight:900;letter-spacing:.05em;text-align:left
 }
 #nexa-v424-my-alliance{color:#f1e8ff;background:linear-gradient(90deg,rgba(177,61,255,.13),rgba(54,106,255,.07))}
 #nexa-v424-report{color:#ff9fca}
 #nexa-v424-my-alliance .menu-dot{background:#e45dff;box-shadow:0 0 10px rgba(228,93,255,.45)}
 #nexa-v424-report .menu-dot{background:#ff6ea9;box-shadow:0 0 10px rgba(255,110,169,.45)}
 #nexa-v424-my-alliance .menu-dot,#nexa-v424-report .menu-dot{width:6px;height:6px;border-radius:50%}

 /* ADMIN — one surface */
 #admin-modal.open{position:fixed!important;inset:0!important;z-index:2147483200!important;overflow:hidden!important;background:#030611!important}
 #admin-modal .modal-backdrop{display:none!important}
 #admin-modal .admin-modal-card{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border:0!important;border-radius:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding:calc(16px + env(safe-area-inset-top)) 14px calc(40px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 12% 8%,rgba(75,93,255,.15),transparent 30%),radial-gradient(circle at 88% 20%,rgba(210,63,255,.11),transparent 30%),linear-gradient(165deg,#080d25,#030611 76%)!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important}
 #admin-modal .admin-modal-card:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.08;background-image:radial-gradient(circle,rgba(255,255,255,.8) 0 1px,transparent 1.4px);background-size:53px 53px}
 #admin-modal .modal-head{height:0!important;min-height:0!important;padding:0!important;margin:0!important}
 #admin-modal .modal-head>div{display:none!important}
 #admin-modal [data-close-admin]:not(.modal-backdrop){position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:14px!important;z-index:2147483500!important;width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid rgba(255,72,173,.62)!important;background:rgba(33,7,38,.92)!important;color:transparent!important;font-size:0!important}
 #admin-modal [data-close-admin]:not(.modal-backdrop):after{content:"×";color:#ff8fc8;font-size:27px;font-weight:900}
 #admin-modal #admin-context-tabs,#admin-modal #nexa-module-shell-head{display:none!important}
 #admin-modal #svs-admin-content{width:100%!important;max-width:720px!important;margin:0 auto!important;padding-top:44px!important;position:relative;z-index:2}
 #nexa-v424-admin-guide{width:34px;height:34px;border-radius:50%;border:1px solid #ff4fd8;background:#0d1129;color:#ff4fd8;display:grid;place-items:center;margin:0 auto 7px;font-weight:950}
 #nexa-v424-admin-nav{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:9px;align-items:center;margin:0 auto 12px}
 #nexa-v424-admin-nav button{width:42px;height:38px;border-radius:999px;border:1px solid rgba(118,101,255,.48);background:#0c1230;color:#dfe2ff;font-size:20px;font-weight:950}
 #nexa-v424-admin-nav button:disabled{opacity:.18}
 #nexa-v424-admin-nav b{text-align:center;font-size:18px;color:#fff}
 #admin-modal .admin-section{width:100%!important;max-width:680px!important;margin:0 auto!important}
 #admin-modal .admin-section.hidden{display:none!important}
 #admin-modal #admin-library.nexa-v424-library{display:block!important}
 #nexa-v424-library-frame{display:block;width:100%;height:1100px;border:0;background:transparent}
 #admin-modal .nexa-v424-roles-grid{display:grid;gap:10px}
 #admin-modal .nexa-v424-role{padding:14px;border:1px solid rgba(128,108,255,.22);border-radius:16px;background:rgba(10,15,38,.7)}
 #admin-modal .nexa-v424-role b{color:#fff}.nexa-v424-role p{margin:4px 0 0;color:#9fa9c3;font-size:11px;line-height:1.4}

 /* MY ALLIANCE */
 #nexa-v424-alliance-hub{position:fixed;inset:0;z-index:2147483400;overflow-y:auto;overflow-x:hidden;padding:calc(14px + env(safe-area-inset-top)) 14px calc(34px + env(safe-area-inset-bottom));color:#fff;background:radial-gradient(circle at 15% 8%,rgba(87,98,255,.18),transparent 31%),radial-gradient(circle at 85% 18%,rgba(224,59,255,.13),transparent 29%),linear-gradient(165deg,#080d25,#030611 76%);-webkit-overflow-scrolling:touch;touch-action:auto}
 .nexa-v424-hub-head{display:grid;grid-template-columns:40px 1fr 40px;align-items:center;max-width:680px;margin:0 auto 10px}
 .nexa-v424-hub-head h2{text-align:center;margin:0;font-size:19px}.nexa-v424-hub-head button{width:38px;height:38px;border-radius:50%;background:#10142e;font-weight:950}
 .nexa-v424-hub-guide{border:1px solid #ff4fd8;color:#ff4fd8}.nexa-v424-hub-close{border:1px solid #ff6ea9;color:#ff8fbd;font-size:24px}
 .nexa-v424-passport{max-width:560px;margin:0 auto;padding:15px;text-align:center;border:1px solid rgba(135,108,255,.25);border-radius:22px;background:rgba(9,14,38,.65)}
 .nexa-v424-passport h1{margin:0;font-size:28px}.nexa-v424-passport p{margin:4px 0;color:#98a3c0;font-size:11px}
 .nexa-v424-tabs{display:flex;flex-flow:row nowrap;gap:8px;max-width:680px;margin:11px auto 0;padding:5px 2px 10px;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;touch-action:auto;scroll-snap-type:none;scrollbar-width:none}
 .nexa-v424-tabs::-webkit-scrollbar{display:none}.nexa-v424-tabs button{flex:0 0 auto;border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:9px 13px;background:#11152c;color:#ddd;font-weight:850}.nexa-v424-tabs button.active{border-color:#b488ff;background:rgba(111,64,205,.26)}
 #nexa-v424-hub-body{max-width:680px;margin:0 auto}.nexa-v424-member{margin:9px 0;padding:13px;border:1px solid rgba(116,101,255,.22);border-radius:16px;background:rgba(10,15,38,.78)}.nexa-v424-member b{display:block}.nexa-v424-member small{color:#9ca6c2}.nexa-v424-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:9px}.nexa-v424-actions button{border-radius:999px;padding:7px 11px;font-weight:900}.nexa-v424-approve{border:1px solid rgba(74,220,179,.5);background:rgba(20,82,66,.3);color:#94efd5}.nexa-v424-reject{border:1px solid rgba(255,92,147,.5);background:rgba(89,21,48,.3);color:#ff9dbc}.nexa-v424-proof{margin-top:8px;padding:8px;border-radius:12px;border:1px solid rgba(255,255,255,.10);color:#98a4c4;font-size:10px}.nexa-v424-empty{padding:25px 12px;text-align:center;border:1px dashed rgba(255,255,255,.14);border-radius:16px;color:#98a3bf}

 /* overlays */
 .nexa-v424-overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.76);backdrop-filter:blur(7px);display:grid;place-items:center;padding:16px}
 .nexa-v424-overlay-card{width:min(520px,100%);max-height:84dvh;overflow:auto;border:1px solid var(--accent,#ff4fd8);border-radius:22px;padding:19px;background:radial-gradient(circle at 10% 0%,rgba(109,74,255,.17),transparent 35%),linear-gradient(155deg,#0b1028,#050713);color:#fff}
 .nexa-v424-overlay-card small{color:var(--accent,#ff4fd8);font-weight:950;letter-spacing:.16em}.nexa-v424-overlay-card h2{margin:6px 0 9px}.nexa-v424-overlay-card .body{color:#c5c8d9;line-height:1.5;font-size:13px}.nexa-v424-overlay-card .close{width:100%;margin-top:14px;padding:10px;border-radius:999px;border:1px solid var(--accent,#ff4fd8);background:#11152f;color:#fff;font-weight:900}
 `;
 document.head.appendChild(s);
}

function overlay(id,title,body,accent='#ff4fd8',kicker='GUIDE'){
 $('#'+id)?.remove();const d=document.createElement('div');d.id=id;d.className='nexa-v424-overlay';
 d.innerHTML=`<section class="nexa-v424-overlay-card" style="--accent:${accent}"><small>${esc(kicker)}</small><h2>${esc(title)}</h2><div class="body">${body}</div><button class="close" type="button">Close</button></section>`;
 d.querySelector('.close').onclick=()=>d.remove();d.addEventListener('click',e=>{if(e.target===d)d.remove()});document.body.appendChild(d);
}

/* ---------- HOME ---------- */
async function homeIdentity(){
 const c=sb();if(!c)return;
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)return;
  let q=await c.from('player_accounts').select('id,in_game_name,player_id,is_main,custom_alliance_tag,alliance_id,alliances(tag)').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
  const a=q.data;if(!a)return;
  const tag=a.alliances?.tag||a.custom_alliance_tag||'';
  const line=[a.in_game_name||'',tag,a.player_id?`ID ${a.player_id}`:''].filter(Boolean).join(' • ');
  const name=$('#nexa-profile-launcher-name');if(name)name.textContent=line||'MY PROFILE';
 }catch(e){console.warn('NEXA home identity',e?.message||e)}
}
function ensureStellar(){
 const profile=$('#nexa-profile-launcher-section');if(!profile)return;
 $$('[data-nexa-legacy-stellar]').forEach(x=>x.remove());
 $$('section,article,div').forEach(el=>{
   if(el.id==='nexa-v424-stellar'||el.closest?.('#nexa-v424-stellar'))return;
   const t=text(el);
   if(/STELLAR SIGNAL/i.test(t)&&(/Chart the course|Move together|Adjust with the stars/i.test(t)||el.id==='nexa-v42-stellar')){el.dataset.nexaLegacyStellar='1';el.style.display='none'}
 });
 let st=$('#nexa-v424-stellar');
 if(!st){st=document.createElement('section');st.id='nexa-v424-stellar';st.innerHTML='<div class="line"><span class="orb">✦</span><b>STELLAR SIGNAL</b><span class="orb">✦</span></div><p>Small course corrections can change the path of an entire orbit.</p>';profile.after(st)}
}
function compactSection(section,type){
 if(!section)return;
 const t=text(section);
 let inactive=false;
 if(type==='live')inactive=/No Live Event|no active or upcoming|SvS against XXXX|Ends in\s*[—-]/i.test(t);
 else inactive=/Applications stay available|no open transfer|Transfer Center/i.test(t) && !/active|live cycle|applications open/i.test(t);
 section.classList.toggle('nexa-v424-empty',inactive);
 let copy=$('.nexa-v424-empty-copy',section);
 if(inactive&&!copy){
   copy=document.createElement('div');copy.className='nexa-v424-empty-copy';
   copy.innerHTML=type==='live'
    ?'<div class="kicker">LIVE EVENT</div><h3>No Live Event</h3><p>Upcoming state events, schedules and forms will appear here when leadership publishes them.</p>'
    :'<div class="kicker">TRANSFERS</div><h3>Transfer Center</h3><p>Transfer cycles, applications and recruiting updates will appear here when a cycle is available.</p>';
   section.appendChild(copy);
 }
 if(!inactive)copy?.remove();
}
function ensureSignals(){
 const live=$('#home-svs-section'),tr=$('#home-transfers-section');
 let pulse=$('#nexa-v424-pulse');if(!pulse){pulse=document.createElement('section');pulse.id='nexa-v424-pulse';pulse.innerHTML='<div class="kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>'}
 let alliance=$('#nexa-v424-alliance');if(!alliance){alliance=document.createElement('section');alliance.id='nexa-v424-alliance';alliance.innerHTML='<div class="kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>'}
 if(tr){tr.after(pulse);pulse.after(alliance)}else if(live){live.after(pulse);pulse.after(alliance)}
}
function applyTheme(){
 const t=(text($('#home-svs-section'))+' '+text($('#nexa-v424-alliance'))).toLowerCase();
 let p='#9b79ff',s='#55cfff',d='#24154c',name='default';
 const themes=[
  [/state of power|\bsvs\b/,'svs','#E83D5B','#6EDCFF','#551426'],
  [/frostdragon|\bfdt\b/,'fdt','#49D9FF','#8D7BFF','#123D5C'],
  [/winter siege/,'winter-siege','#32E0A1','#8FFFD7','#0C4F46'],
  [/tundra arms|\btal\b/,'tal','#A56CFF','#FF9B45','#3F235F'],
  [/foundry/,'foundry','#FF9F43','#5CAEFF','#5B3311'],
  [/canyon/,'canyon','#D9A94E','#E66E52','#53371C']
 ];
 for(const [re,n,a,b,c] of themes){if(re.test(t)){name=n;p=a;s=b;d=c;break}}
 if(name==='default'&&!$('#home-transfers-section')?.classList.contains('nexa-v424-empty')&&/transfer/i.test(text($('#home-transfers-section')))){name='transfers';p='#FF8A3D';s='#FFC857';d='#5B2D12'}
 document.body.dataset.nexaEventTheme=name;
 document.documentElement.style.setProperty('--nexa-event-primary',p);
 document.documentElement.style.setProperty('--nexa-event-secondary',s);
 document.documentElement.style.setProperty('--nexa-event-deep',d);
}
function homePass(){ensureStellar();compactSection($('#home-svs-section'),'live');compactSection($('#home-transfers-section'),'transfer');ensureSignals();applyTheme();homeIdentity()}

/* ---------- PROFILE ---------- */
function ensureProfileActions(){
 const root=$('#nexa-profile-modal'),stats=$('#nexa-profile-modal .nexa-profile-stats');if(!root||!stats)return;
 if($('#nexa-v424-profile-actions',root))return;
 const row=document.createElement('div');row.id='nexa-v424-profile-actions';
 row.innerHTML='<button class="nexa-v424-guide" type="button" aria-label="Profile Guide">ⓘ</button><button id="nexa-v424-ministry" type="button" aria-label="Ministry">♜</button>';
 stats.after(row);
}
function profileGuide(){
 overlay('nexa-v424-profile-guide','My Profile','This is the inventory for the selected game account. Swipe the category and generation rails naturally. Each item card keeps its own <b>Reset</b> and gold <b>Guide</b>; the controls here apply to the whole Profile.','#ff4fd8');
}
async function ministry(){
 const c=sb();let body='<p>No Ministry appointment is published for this account right now.</p>';
 try{
  const {data:{user}}=await c.auth.getUser();if(user){
   const {data:a}=await c.from('player_accounts').select('id,in_game_name').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();
   if(a?.id){
    const {data,error}=await c.from('ministry_appointments').select('day_type,ministry_position,appointment_time,notes').eq('player_account_id',a.id).order('appointment_time',{ascending:true}).limit(12);
    if(!error&&data?.length)body=data.map(x=>`<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)"><b>${esc(x.ministry_position||'Ministry')}</b><br><span>${esc(x.day_type||'')} ${x.appointment_time?esc(new Date(x.appointment_time).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})):'Scheduled'}</span>${x.notes?`<br><small>${esc(x.notes)}</small>`:''}</div>`).join('');
   }
  }
 }catch(e){body=`<p>${esc(e?.message||'Ministry information could not be loaded.')}</p>`}
 overlay('nexa-v424-ministry-overlay','Ministry Schedule',body,'#bca7ff','MINISTRY');
}

/* ---------- MENU ---------- */
function closeHomeMenu(){const m=$('#nexa-home-menu'),t=$('#nexa-home-menu-toggle');m?.classList.remove('open');m?.setAttribute('aria-hidden','true');t?.classList.remove('open');t?.setAttribute('aria-expanded','false')}
function polishMenu(){
 const card=$('#nexa-home-menu-card');if(!card)return;
 const sub=$('.nexa-home-menu-subview',card);if(!sub||$('.nexa-submenu-header',sub))return;
 $$('.nexa-home-menu-label',sub).forEach(l=>{if(text(l).toUpperCase()==='NAVIGATION')l.classList.add('nexa-v424-hide')});
 $$('.nexa-home-menu-item',sub).forEach(b=>{const t=text(b).replace(/[•›>]/g,'').trim().toUpperCase();if(['HOME','LIVE EVENT','TRANSFERS'].includes(t))b.classList.add('nexa-v424-hide')});
 if(!$('#nexa-v424-my-alliance',sub)){
   const b=document.createElement('button');b.id='nexa-v424-my-alliance';b.type='button';b.innerHTML='<span>My Alliance</span><span class="menu-dot"></span>';
   const firstSep=$('.nexa-home-menu-separator',sub);if(firstSep)firstSep.before(b);else sub.prepend(b);
 }
 if(!$('#nexa-v424-report',sub)){
   const b=document.createElement('button');b.id='nexa-v424-report';b.type='button';b.innerHTML='<span>Report Bugs</span><span class="menu-dot"></span>';sub.appendChild(b);
 }
}
function scheduleMenuPolish(){menuTimers.forEach(clearTimeout);menuTimers=[100,300,700,1300].map(ms=>setTimeout(polishMenu,ms))}
async function reportBug(){
 const c=sb();overlay('nexa-v424-bug','Report Bugs',`<form id="nexa-v424-bug-form"><label style="display:block;margin-bottom:8px">Module<input name="module" placeholder="Home, Profile, Administration..." style="display:block;width:100%;margin-top:4px;padding:10px;border-radius:10px;background:#090f25;color:#fff;border:1px solid rgba(255,255,255,.15)"></label><label style="display:block">What happened?<textarea name="description" required rows="5" style="display:block;width:100%;margin-top:4px;padding:10px;border-radius:10px;background:#090f25;color:#fff;border:1px solid rgba(255,255,255,.15)"></textarea></label><button type="submit" style="width:100%;margin-top:10px;padding:10px;border-radius:999px;border:1px solid #ff6ea9;background:#241128;color:#fff;font-weight:900">Send Report</button><div id="nexa-v424-bug-status" style="margin-top:8px;font-size:11px"></div></form>`,'#ff6ea9','BUG REPORT');
 const form=$('#nexa-v424-bug-form');if(!form)return;
 form.onsubmit=async e=>{e.preventDefault();const st=$('#nexa-v424-bug-status');st.textContent='Sending…';try{
  const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');
  const fd=new FormData(form);const {error}=await c.from('nexa_bug_reports').insert({reporter_user_id:user.id,module:String(fd.get('module')||''),description:String(fd.get('description')||''),page_path:location.pathname+location.search,build_label:'V42.4',user_agent:navigator.userAgent,viewport:`${innerWidth}x${innerHeight}`,client_errors:[],screenshot_paths:[],status:'open',severity:'normal'});
  if(error)throw error;st.textContent='Report sent ✓';setTimeout(()=>$('#nexa-v424-bug')?.remove(),700)
 }catch(err){st.textContent=err?.message||String(err)}};
}

/* ---------- ADMIN ---------- */
function cleanAdminURL(){
 const u=new URL(location.href);let changed=false;for(const k of ['admin','tab'])if(u.searchParams.has(k)){u.searchParams.delete(k);changed=true}
 if(changed)history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash);
}
function ensureAdminShell(){
 const content=$('#svs-admin-content');if(!content)return;
 if(!$('#nexa-v424-admin-guide',content)){const g=document.createElement('button');g.id='nexa-v424-admin-guide';g.type='button';g.textContent='ⓘ';content.prepend(g)}
 if(!$('#nexa-v424-admin-nav',content)){
  const n=document.createElement('nav');n.id='nexa-v424-admin-nav';n.innerHTML='<button type="button" data-dir="-1">‹</button><b>Alliances</b><button type="button" data-dir="1">›</button>';
  const g=$('#nexa-v424-admin-guide',content);g.after(n);
 }
 updateAdminNav();
}
function updateAdminNav(){
 const nav=$('#nexa-v424-admin-nav');if(!nav)return;const i=ADMIN_ORDER.indexOf(currentAdmin);
 $('b',nav).textContent=ADMIN_LABEL[currentAdmin]||'Administration';
 const bs=$$('button',nav);bs[0].disabled=i<=0;bs[1].disabled=i<0||i===ADMIN_ORDER.length-1;
}
function ensureRolesContent(){
 const sec=$('#admin-roles');if(!sec)return;
 let empty=$('.empty-state',sec);if(empty)empty.remove();
 if($('.nexa-v424-roles-grid',sec))return;
 const grid=document.createElement('div');grid.className='nexa-v424-roles-grid';
 grid.innerHTML='<article class="nexa-v424-role"><b>Operational access</b><p>SvS, Event Operations, Transfer, Scheduler and leadership helpers are operational permissions. They do not automatically grant Administration access.</p></article><article class="nexa-v424-role"><b>Governance</b><p>Use NEXA Access to review a user and assign the permitted role. Owner access remains protected separately.</p></article>';
 sec.appendChild(grid);
}
function patchLibraryFrame(frame){
 try{
  const d=frame.contentDocument;if(!d)return;
  let s=d.getElementById('nexa-v424-library-embed');if(!s){s=d.createElement('style');s.id='nexa-v424-library-embed';d.head.appendChild(s)}
  s.textContent=`html,body{background:transparent!important;min-height:0!important}.nebula-bg,.starfield,header,.topbar,.admin-nav,.back,.nexa-v27-library-tools,.nexa-v40-library-tools,body>button[title*="Guide" i],body>button[title*="Menu" i]{display:none!important}.lib-shell{width:100%!important;max-width:100%!important;margin:0!important;padding:0 0 60px!important;background:transparent!important;border:0!important;box-shadow:none!important}.lib-head{display:none!important}main{margin-top:0!important}`;
  $$('button,a,div,h1,h2,h3,strong,b',d).forEach(el=>{
    const t=text(el);
    if(/^Gen 0\s*[•·-]\s*Unlocked$/i.test(t))el.textContent='EPIC • Unlocked';
    if(/HERO\s*[•·-]\s*GEN 0 VISIBILITY/i.test(t))el.textContent='HERO • EPIC VISIBILITY';
    if((/^MENU\b/i.test(t)||/^CLOSE$/i.test(t))&&el.getBoundingClientRect().top<190)el.style.display='none';
  });
  const h=Math.max(d.documentElement?.scrollHeight||0,d.body?.scrollHeight||0,900);frame.style.height=Math.min(h+20,5200)+'px';
 }catch(e){console.warn('NEXA Library embed',e?.message||e)}
}
function ensureLibrary(){
 const sec=$('#admin-library');if(!sec)return;
 if(sec.dataset.nexaV424!=='1'){
  sec.dataset.nexaV424='1';sec.classList.add('nexa-v424-library');
  sec.innerHTML='<iframe id="nexa-v424-library-frame" title="NEXA Library" src="library.html?admin=1&embed=1&v=424"></iframe>';
  const f=$('#nexa-v424-library-frame',sec);f.addEventListener('load',()=>{setTimeout(()=>patchLibraryFrame(f),80);setTimeout(()=>patchLibraryFrame(f),500)});
 }
}
function activateAdmin(target){
 target=ADMIN_ORDER.includes(target)?target:'alliances';currentAdmin=target;document.body.classList.add('nexa-workspace-open');closeHomeMenu();ensureAdminShell();
 if(target==='library'){ensureLibrary()}
 if(target==='roles'){ensureRolesContent()}
 const tab=$(`[data-admin-tab="${target}"]`);
 if(tab){tab.classList.remove('hidden');tab.click()}
 else{
   $$('.admin-section').forEach(s=>s.classList.add('hidden'));$('#admin-'+target)?.classList.remove('hidden');
 }
 if(target==='library'){$$('.admin-section').forEach(s=>s.classList.add('hidden'));$('#admin-library')?.classList.remove('hidden')}
 if(target==='roles'){$$('.admin-section').forEach(s=>s.classList.add('hidden'));$('#admin-roles')?.classList.remove('hidden')}
 updateAdminNav();setTimeout(()=>$('.admin-modal-card',$('#admin-modal'))?.scrollTo({top:0,behavior:'auto'}),20);
}
function initAdminFromURL(){
 const u=new URL(location.href);const mode=u.searchParams.get('admin'),target=u.searchParams.get('tab');
 if(mode==='administration'){
  setTimeout(()=>{document.body.classList.add('nexa-workspace-open');ensureAdminShell();activateAdmin(target||'alliances');cleanAdminURL()},220);
 }else if(mode){document.body.classList.add('nexa-workspace-open');setTimeout(cleanAdminURL,350)}
}

/* ---------- MY ALLIANCE ---------- */
async function allianceContext(){
 const c=sb();if(!c)return null;const {data:{user}}=await c.auth.getUser();if(!user)return null;
 const {data:acct,error}=await c.from('player_accounts').select('*').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();if(error||!acct)return null;
 let alliance=null,members=[];if(acct.alliance_id){const a=await c.from('alliances').select('*').eq('id',acct.alliance_id).maybeSingle();alliance=a.data||null;const m=await c.from('player_accounts').select('*').eq('alliance_id',acct.alliance_id).order('in_game_name');members=m.data||[]}
 return {c,user,acct,alliance,members};
}
function renderAllianceTab(type,ctx){
 const body=$('#nexa-v424-hub-body');if(!body)return;$$('.nexa-v424-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===type));
 const rows=ctx?.members||[];
 if(type==='members'){const m=rows.filter(x=>x.alliance_verified_at);body.innerHTML=m.length?m.map(x=>`<article class="nexa-v424-member"><b>${esc(x.in_game_name||'Player')}</b><small>ID ${esc(x.player_id||'—')} • ${esc(x.alliance_role||'Member')}</small></article>`).join(''):'<div class="nexa-v424-empty">No verified members found.</div>';return}
 if(type==='pending'){const m=rows.filter(x=>!x.alliance_verified_at);body.innerHTML=m.length?m.map(x=>`<article class="nexa-v424-member"><b>${esc(x.in_game_name||'Player')}</b><small>ID ${esc(x.player_id||'—')} • Waiting for Approval</small><div class="nexa-v424-proof">Verification proof is not currently stored on this account request.</div><div class="nexa-v424-actions"><button class="nexa-v424-reject" data-player="${esc(x.player_id||'')}" type="button">Reject</button><button class="nexa-v424-approve" data-player="${esc(x.player_id||'')}" type="button">Approve</button></div></article>`).join(''):'<div class="nexa-v424-empty">No pending members right now.</div>';return}
 const copy={pulse:'Active NEXA Pulse requests and response progress will appear here when published.',history:'Closed NEXA Pulse history will appear here.',events:'Foundry, Canyon and alliance strategy events will appear here when leadership publishes them.',store:'Alliance Store tools and published items will appear here.'};
 body.innerHTML=`<div class="nexa-v424-empty">${copy[type]||'Nothing published here yet.'}</div>`;
}
async function openAllianceHub(){
 closeHomeMenu();document.body.classList.add('nexa-workspace-open');$('#nexa-v424-alliance-hub')?.remove();
 const hub=document.createElement('section');hub.id='nexa-v424-alliance-hub';hub.innerHTML='<div class="nexa-v424-hub-head"><button class="nexa-v424-hub-guide" type="button">ⓘ</button><h2>My Alliance</h2><button class="nexa-v424-hub-close" type="button">×</button></div><div class="nexa-v424-passport"><h1>Loading…</h1><p>Alliance Passport</p></div><nav class="nexa-v424-tabs"><button class="active" data-tab="members">Members</button><button data-tab="pending">Pending Members</button><button data-tab="pulse">NEXA Pulse</button><button data-tab="history">Pulse History</button><button data-tab="events">Alliance Events</button><button data-tab="store">Store</button></nav><div id="nexa-v424-hub-body"><div class="nexa-v424-empty">Loading alliance…</div></div>';
 document.body.appendChild(hub);hub.querySelector('.nexa-v424-hub-close').onclick=()=>{hub.remove();document.body.classList.remove('nexa-workspace-open')};hub.querySelector('.nexa-v424-hub-guide').onclick=()=>overlay('nexa-v424-alliance-guide','My Alliance','Use this workspace for verified members, pending approvals, NEXA Pulse, alliance events and Store. Swipe the tabs naturally on iPhone.','#ff4fd8');
 const ctx=await allianceContext();hub._ctx=ctx;if(!ctx){hub.querySelector('h1').textContent='No Alliance';hub.querySelector('#nexa-v424-hub-body').innerHTML='<div class="nexa-v424-empty">No alliance is linked to this account.</div>';return}
 hub.querySelector('h1').textContent=ctx.alliance?.tag||ctx.alliance?.name||ctx.acct?.custom_alliance_tag||'Alliance';
 $$('.nexa-v424-tabs button',hub).forEach(b=>b.onclick=()=>renderAllianceTab(b.dataset.tab,ctx));renderAllianceTab('members',ctx);
}
async function approveReject(playerId,approve,button){
 const c=sb();if(!c||!playerId)return;button.disabled=true;const old=button.textContent;button.textContent=approve?'Approving…':'Rejecting…';
 try{
  const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in again.');
  const {data:me,error}=await c.from('player_accounts').select('alliance_id,alliance_role').eq('user_id',user.id).order('is_main',{ascending:false}).limit(1).maybeSingle();if(error)throw error;
  if(!me?.alliance_id)throw new Error('No alliance linked.');if(!['R4','R5'].includes(String(me.alliance_role||'').toUpperCase()))throw new Error('R4/R5 approval required.');
  const payload=approve?{alliance_verified_at:new Date().toISOString()}:{alliance_id:null,alliance_verified_at:null,custom_alliance_tag:null};
  const {error:up}=await c.from('player_accounts').update(payload).eq('player_id',String(playerId)).eq('alliance_id',me.alliance_id);if(up)throw up;
  await openAllianceHub();
 }catch(err){button.disabled=false;button.textContent=old;overlay('nexa-v424-alliance-error','Could not update member',esc(err?.message||err),'#ff6ea9','ERROR')}
}

/* ---------- EVENTS ---------- */
document.addEventListener('click',e=>{
 const b=e.target.closest?.('button,a');if(!b)return;
 if(b.id==='nexa-home-menu-toggle'){scheduleMenuPolish();return}
 if(b.id==='nexa-v424-my-alliance'){e.preventDefault();e.stopImmediatePropagation();openAllianceHub();return}
 if(b.id==='nexa-v424-report'){e.preventDefault();e.stopImmediatePropagation();closeHomeMenu();reportBug();return}
 if(b.matches('.nexa-v424-guide')){e.preventDefault();e.stopImmediatePropagation();profileGuide();return}
 if(b.id==='nexa-v424-ministry'){e.preventDefault();e.stopImmediatePropagation();ministry();return}
 if(b.id==='nexa-v424-admin-guide'){e.preventDefault();overlay('nexa-v424-admin-help','Administration','Use the arrows to move through Alliances, Library, NEXA Access, Operational Roles and System Operations. Library is embedded into this same panel.','#ff4fd8');return}
 if(b.closest('#nexa-v424-admin-nav')){
  const i=ADMIN_ORDER.indexOf(currentAdmin),ni=i+Number(b.dataset.dir||0);if(ni>=0&&ni<ADMIN_ORDER.length)activateAdmin(ADMIN_ORDER[ni]);return
 }
 if(b.matches('.nexa-v424-approve')){approveReject(b.dataset.player,true,b);return}
 if(b.matches('.nexa-v424-reject')){if(confirm('Reject this pending member?'))approveReject(b.dataset.player,false,b);return}
 if(b.matches('[data-close-admin]')){setTimeout(()=>document.body.classList.remove('nexa-workspace-open'),20);return}
 if(b.matches('[data-nexa-profile]')){setTimeout(ensureProfileActions,120);setTimeout(ensureProfileActions,320);return}
 if(b.matches('#nexa-profile-launcher')){setTimeout(()=>homeIdentity(),250);return}
},true);

function boot(){
 addCSS();ensureProfileActions();homePass();polishMenu();initAdminFromURL();
 setTimeout(()=>{ensureProfileActions();homePass();polishMenu()},450);
 setTimeout(()=>{ensureProfileActions();homePass();polishMenu()},1400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{homePass();ensureProfileActions()},80));
})();
