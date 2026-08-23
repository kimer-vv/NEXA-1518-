/* NEXA V43.1 — CACHE OWNER + HOME POLISH
   Home polish, stable Administration shell, embedded Library, My Alliance management,
   Profile helpers and event-aware themes. No global MutationObserver. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V431__)return;
window.__NEXA_V431__=true;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co',SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
function forceFreshOwners(){
 const load=(id,src)=>{
  document.getElementById(id)?.remove();
  const el=document.createElement('script');el.id=id;el.src=src;el.defer=false;document.head.appendChild(el);
 };
 // index.html still requests historical ?v=21 URLs. Load the current owners with unique URLs so Safari/Vercel cannot serve the stale copies.
 load('nexa-fresh-troop-owner','nexa-troop-assets-v21.js?v=24-431');
 load('nexa-fresh-profile-owner','nexa-player-library%2021.js?v=28-431');
}

let localSb=null,currentAdmin='alliances',allianceCtx=null,allianceTargetTag=null;
const ADMIN=['alliances','library','permissions','roles','system'];
const LABEL={alliances:'Alliances',library:'Library',permissions:'NEXA Access',roles:'Operational Roles',system:'System Operations'};
function sb(){if(window.supabaseClient?.from)return window.supabaseClient;if(window.sb?.from)return window.sb;if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);return localSb}

function addCSS(){
 if($('#nexa-v428-css'))return;
 const s=document.createElement('style');s.id='nexa-v428-css';s.textContent=`
 :root{--nexa-event-primary:#9b79ff;--nexa-event-secondary:#55cfff;--nexa-event-deep:#24154c}
 html,body{max-width:100%!important;overflow-x:hidden!important}
 body.nexa-workspace-open #nexa-home-menu-toggle,body.nexa-workspace-open #nexa-home-menu{display:none!important}

 /* HOME */
 main.shell{width:min(680px,calc(100% - 24px))!important;max-width:calc(100% - 24px)!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
 main.shell>*{grid-column:1/-1!important;width:100%!important;max-width:100%!important;min-width:0!important}
 main.shell>.hero{padding:14px 0 8px!important;margin:0!important;min-height:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
 main.shell>.hero p{display:none!important}
 #nexa-profile-launcher-section{background:transparent!important;border:0!important;box-shadow:none!important;padding:18px 0 10px!important}
 #home-transfers-section{display:none!important}
 #nexa-v430-transfer-card{width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;margin:0!important;padding:14px 16px!important;border-radius:22px!important;border:1px solid rgba(255,137,76,.34)!important;background:linear-gradient(145deg,rgba(32,18,35,.92),rgba(10,10,29,.98))!important;box-shadow:none!important;overflow:hidden!important}
 #nexa-v430-transfer-card .kicker{color:#ff9a5f!important;font-size:10px!important;letter-spacing:.16em!important;font-weight:950!important}
 #nexa-v430-transfer-card h3{margin:4px 0 4px!important;font-size:20px!important;line-height:1.15!important}
 #nexa-v430-transfer-card p{margin:0!important;color:#c7bfd0!important;font-size:12px!important;line-height:1.4!important}
 #nexa-v430-transfer-card .nexa-v430-actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:10px!important}
 #nexa-v430-transfer-card .nexa-v430-actions a{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:34px!important;padding:7px 13px!important;border-radius:999px!important;border:1px solid rgba(87,111,255,.64)!important;background:rgba(52,66,190,.16)!important;color:#73baff!important;text-decoration:none!important;font-weight:900!important}

 #nexa-profile-launcher-name{margin-top:12px!important;font-size:13px!important;line-height:1.3!important;letter-spacing:.07em!important;text-align:center!important;color:#ece6ff!important;background:none!important;-webkit-text-fill-color:currentColor!important}
 #nexa-v425-stellar{width:100%!important;height:auto!important;padding:8px 8px 12px!important;text-align:center!important;background:transparent!important;border:0!important}
 #nexa-v425-stellar .line{display:flex!important;align-items:center!important;justify-content:center!important;gap:18px!important}
 #nexa-v425-stellar .orb{width:56px!important;height:56px!important;flex:0 0 56px!important;border-radius:50%!important;display:grid!important;place-items:center!important;border:1px solid color-mix(in srgb,var(--nexa-event-primary) 45%,transparent)!important;background:radial-gradient(circle,color-mix(in srgb,var(--nexa-event-secondary) 18%,transparent),rgba(7,8,25,.14) 52%,transparent 73%)!important;color:#fff!important;font-size:11px!important;animation:nexa425Blink 2.1s ease-in-out infinite!important}
 #nexa-v425-stellar .orb:last-child{animation-delay:1.05s!important}
 #nexa-v425-stellar b{font-size:10px!important;letter-spacing:.22em!important;color:#ddd5ff!important;text-shadow:0 0 15px color-mix(in srgb,var(--nexa-event-primary) 55%,transparent)!important}
 #nexa-v425-stellar p{width:100%!important;height:auto!important;white-space:normal!important;overflow:visible!important;overflow-wrap:anywhere!important;margin:5px 0 0!important;color:#d5d0e5!important;font-size:10px!important;line-height:1.42!important}
 @keyframes nexa425Blink{0%,100%{opacity:.42;transform:scale(.92);box-shadow:0 0 9px color-mix(in srgb,var(--nexa-event-primary) 10%,transparent)}50%{opacity:1;transform:scale(1.05);box-shadow:0 0 20px color-mix(in srgb,var(--nexa-event-secondary) 64%,transparent),0 0 36px color-mix(in srgb,var(--nexa-event-primary) 38%,transparent)}}

 #home-svs-section,#home-transfers-section,#nexa-v428-transfer-card,#nexa-v425-pulse,#nexa-v425-alliance{width:100%!important;max-width:100%!important;margin:0!important;min-height:0!important;height:auto!important;border-radius:18px!important;box-sizing:border-box!important}
 #home-svs-section.nexa-v425-empty,#home-transfers-section.nexa-v425-empty,#nexa-v428-transfer-card,#nexa-v425-pulse,#nexa-v425-alliance{padding:12px 14px!important;min-height:0!important;height:auto!important;max-height:none!important;aspect-ratio:auto!important;overflow:hidden!important}
 #home-svs-section.nexa-v425-empty{border:1px solid color-mix(in srgb,var(--nexa-event-primary) 38%,transparent)!important;background:linear-gradient(145deg,rgba(20,19,50,.88),rgba(5,9,27,.97))!important;text-align:left!important}
 #home-transfers-section.nexa-v425-empty,#nexa-v428-transfer-card{border:1px solid rgba(255,138,61,.36)!important;background:linear-gradient(145deg,rgba(55,28,14,.62),rgba(12,9,24,.96))!important;text-align:left!important}
 #home-svs-section.nexa-v425-empty>*:not(.nexa-v425-empty-copy){display:none!important}
 #home-transfers-section.nexa-v425-empty>*:not(.nexa-v425-empty-copy),#nexa-v428-transfer-card>*:not(.nexa-v425-empty-copy){display:none!important}
 .nexa-v425-empty-copy{display:block!important;width:100%!important;text-align:left!important}
 .nexa-v425-empty-copy .kicker,#nexa-v425-pulse .kicker,#nexa-v425-alliance .kicker{font-size:8px!important;letter-spacing:.17em!important;font-weight:950!important;margin:0 0 4px!important}
 .nexa-v425-empty-copy h3,#nexa-v425-pulse h3,#nexa-v425-alliance h3{margin:0 0 3px!important;font-size:15px!important;line-height:1.12!important;color:#fff!important;text-align:left!important}
 .nexa-v425-empty-copy p,#nexa-v425-pulse p,#nexa-v425-alliance p{margin:0!important;font-size:10px!important;line-height:1.38!important;color:#adb7cf!important;text-align:left!important;white-space:normal!important}
 #home-svs-section .kicker{color:#bc9cff!important}#home-transfers-section .kicker,#nexa-v428-transfer-card .kicker{color:#ff9c5c!important}
 #nexa-v425-pulse{border:1px solid rgba(48,211,255,.34)!important;background:linear-gradient(145deg,rgba(4,34,53,.91),rgba(4,11,30,.97))!important}
 #nexa-v425-pulse .kicker{color:#66eaff!important}
 #nexa-v425-alliance{border:1px solid rgba(219,66,255,.34)!important;background:linear-gradient(145deg,rgba(37,8,52,.91),rgba(13,6,30,.97))!important}
 #nexa-v425-alliance .kicker{color:#ec8cff!important}

 #nexa-home-menu-toggle{top:calc(env(safe-area-inset-top) + 70px)!important}

 /* UNIFIED ADMIN INTRO + BUG REPORTS */
 .nexa-v428-admin-intro{margin:0 0 14px!important;padding:13px 15px!important;border:1px solid rgba(134,105,255,.28)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(14,19,46,.88),rgba(5,9,24,.94))!important;color:#aeb8d3!important;font-size:12px!important;line-height:1.48!important}
 .nexa-v428-admin-intro h2,.nexa-v428-admin-intro h3,.nexa-v428-admin-intro h4{display:none!important}
 .nexa-v428-admin-intro p,.nexa-v428-admin-intro div{margin:0!important;color:#aeb8d3!important}
 #admin-system>.admin-section-head{display:none!important}
 #nexa-v428-bugs{margin-top:16px!important;padding-top:4px!important}
 .nexa-v428-bug-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-bottom:10px!important}
 .nexa-v428-bug-head h3{margin:0!important;font-size:18px!important}.nexa-v428-bug-refresh{border:1px solid rgba(103,210,255,.35)!important;border-radius:999px!important;background:#0a1430!important;color:#7ee5ff!important;padding:8px 12px!important;font-weight:900!important}
 .nexa-v428-bug{border:1px solid rgba(132,101,255,.24)!important;border-radius:16px!important;background:#081027!important;padding:12px!important;margin:8px 0!important}.nexa-v428-bug b{display:block!important}.nexa-v428-bug small{display:block!important;color:#8f9ab8!important;margin:3px 0 8px!important}.nexa-v428-bug p{margin:5px 0!important;color:#c3c9dc!important;font-size:12px!important;line-height:1.4!important}.nexa-v428-bug-controls{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-top:9px!important}.nexa-v428-bug-controls select,.nexa-v428-bug-controls button{border:1px solid rgba(255,255,255,.14)!important;border-radius:10px!important;background:#0d1430!important;color:#fff!important;padding:8px!important;font-weight:800!important}

 /* PROFILE */
 #nexa-profile-modal{overflow:hidden!important;padding:6px!important}
 #nexa-profile-modal .nexa-profile-sheet{width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important}
 #nexa-profile-modal .nexa-profile-tabs,#nexa-player-gen-rail{display:flex!important;flex-flow:row nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important;scroll-snap-type:none!important;scrollbar-width:none!important}
 #nexa-profile-modal .nexa-profile-tabs::-webkit-scrollbar,#nexa-player-gen-rail::-webkit-scrollbar{display:none!important}
 #nexa-v425-profile-actions{display:flex!important;align-items:center!important;justify-content:center!important;gap:9px!important;margin:10px 0 2px!important}
 .nexa-v425-guide,#nexa-v425-ministry{width:36px!important;height:36px!important;min-width:36px!important;border-radius:50%!important;display:grid!important;place-items:center!important;background:#0e122a!important;font-weight:950!important}
 .nexa-v425-guide{border:1px solid #ff4fd8!important;color:#ff4fd8!important}.nexa-v425-ministry{border:1px solid #baa6ff!important;color:#d8ccff!important;font-size:16px!important}

 /* ADMIN: one shell; legacy per-section nav is hidden */
 #admin-modal.open{position:fixed!important;inset:0!important;z-index:2147483200!important;overflow:hidden!important;background:#030611!important}
 #admin-modal .modal-backdrop{display:none!important}
 #admin-modal .admin-modal-card{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border:0!important;border-radius:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding:calc(16px + env(safe-area-inset-top)) 14px calc(42px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 12% 8%,rgba(75,93,255,.15),transparent 30%),radial-gradient(circle at 88% 20%,rgba(210,63,255,.11),transparent 30%),linear-gradient(165deg,#080d25,#030611 76%)!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important}
 #admin-modal .modal-head,#admin-modal #nexa-module-shell-head,#admin-modal #admin-context-tabs{display:none!important}
 #admin-modal #svs-admin-content{display:block!important;width:100%!important;max-width:720px!important;margin:0 auto!important;padding-top:2px!important;position:relative!important;z-index:2!important}
 #admin-modal .nexa-v25-nav{display:none!important}
 #admin-modal .admin-section{width:100%!important;max-width:680px!important;margin:0 auto!important;position:static!important}
 #admin-modal .admin-section-head{position:static!important}
 /* V42.6: never expose the obsolete native Administration bodies behind the new shell. */
 #admin-modal.open #admin-alliances>:not(.nexa-v25-nav):not(.nexa-v25-host):not(.nexa-v428-admin-intro),
 #admin-modal.open #admin-permissions>:not(.nexa-v25-nav):not(.nexa-v25-host):not(.nexa-v428-admin-intro),
 #admin-modal.open #admin-roles>:not(.nexa-v25-nav):not(.nexa-v25-host):not(.nexa-v428-admin-intro){display:none!important}
 #admin-modal.open #admin-alliances>.nexa-v25-host,
 #admin-modal.open #admin-permissions>.nexa-v25-host,
 #admin-modal.open #admin-roles>.nexa-v25-host{display:block!important}
 #nexa-v425-admin-close{position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:14px!important;z-index:2147483590!important;width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid rgba(255,72,173,.65)!important;background:rgba(33,7,38,.94)!important;color:#ff8fc8!important;font-size:27px!important;font-weight:950!important;display:grid!important;place-items:center!important}
 #nexa-v425-admin-shell{position:static!important;width:100%!important;max-width:680px!important;margin:0 auto 12px!important;padding:36px 54px 0!important;text-align:center!important;box-sizing:border-box!important}
 #nexa-v425-admin-shell .guide{width:34px!important;height:34px!important;border-radius:50%!important;border:1px solid #ff4fd8!important;background:#0d1129!important;color:#ff4fd8!important;font-weight:950!important}
 #nexa-v425-admin-shell h2{margin:8px 0 9px!important;font-size:22px!important;color:#fff!important;line-height:1.1!important}
 #nexa-v425-admin-arrows{display:flex!important;justify-content:center!important;gap:10px!important}
 #nexa-v425-admin-arrows button{width:54px!important;height:38px!important;border-radius:999px!important;border:1px solid rgba(118,101,255,.50)!important;background:#0c1230!important;color:#dfe2ff!important;font-size:21px!important;font-weight:950!important}
 #nexa-v425-admin-arrows button:disabled{opacity:.18!important}
 #admin-library.nexa-v425-library{display:block!important}
 #nexa-v425-library-frame{display:block!important;width:100%!important;height:1200px;border:0!important;background:transparent!important}

 /* MY ALLIANCE */
 #nexa-v425-alliance-hub{position:fixed!important;inset:0!important;z-index:2147483400!important;overflow-y:auto!important;overflow-x:hidden!important;padding:calc(14px + env(safe-area-inset-top)) 14px calc(34px + env(safe-area-inset-bottom))!important;color:#fff!important;background:radial-gradient(circle at 15% 8%,rgba(87,98,255,.18),transparent 31%),radial-gradient(circle at 85% 18%,rgba(224,59,255,.13),transparent 29%),linear-gradient(165deg,#080d25,#030611 76%)!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important}
 .nexa-v425-hub-head{display:grid!important;grid-template-columns:40px 1fr 40px!important;align-items:center!important;max-width:680px!important;margin:0 auto 10px!important}.nexa-v425-hub-head h2{text-align:center!important;margin:0!important;font-size:19px!important}.nexa-v425-hub-head button{width:38px!important;height:38px!important;border-radius:50%!important;background:#10142e!important;font-weight:950!important}
 .nexa-v425-hub-guide{border:1px solid #ff4fd8!important;color:#ff4fd8!important}.nexa-v425-hub-close{border:1px solid #ff6ea9!important;color:#ff8fbd!important;font-size:24px!important}
 .nexa-v425-passport{max-width:560px!important;margin:0 auto!important;padding:15px!important;text-align:center!important;border:1px solid rgba(135,108,255,.25)!important;border-radius:22px!important;background:rgba(9,14,38,.65)!important}
 .nexa-v425-emblem{width:76px!important;height:76px!important;margin:0 auto 8px!important;border-radius:50%!important;display:grid!important;place-items:center!important;border:2px solid var(--ac,#8b6cff)!important;box-shadow:0 0 25px color-mix(in srgb,var(--ac,#8b6cff) 35%,transparent)!important;overflow:hidden!important}.nexa-v425-emblem img{width:68px!important;height:68px!important;object-fit:contain!important}.nexa-v425-emblem span{font-size:21px!important;font-weight:950!important}
 .nexa-v425-passport h1{margin:0!important;font-size:28px!important}.nexa-v425-passport p{margin:4px 0!important;color:#98a3c0!important;font-size:11px!important}
 .nexa-v425-tabs{display:flex!important;flex-flow:row nowrap!important;gap:8px!important;max-width:680px!important;margin:11px auto 0!important;padding:5px 2px 10px!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:auto!important;scrollbar-width:none!important}.nexa-v425-tabs::-webkit-scrollbar{display:none!important}
 .nexa-v425-tabs button{flex:0 0 auto!important;border:1px solid rgba(255,255,255,.13)!important;border-radius:999px!important;padding:9px 13px!important;background:#11152c!important;color:#ddd!important;font-weight:850!important}.nexa-v425-tabs button.active{border-color:#b488ff!important;background:rgba(111,64,205,.26)!important}
 #nexa-v425-hub-body{max-width:680px!important;margin:0 auto!important}.nexa-v425-member{width:100%!important;margin:9px 0!important;padding:12px!important;border:1px solid rgba(116,101,255,.22)!important;border-radius:16px!important;background:rgba(10,15,38,.78)!important;color:#fff!important;text-align:left!important}.nexa-v425-member-main{display:grid!important;grid-template-columns:42px minmax(0,1fr) auto!important;gap:9px!important;align-items:center!important}.nexa-v425-member img{width:42px!important;height:42px!important;border-radius:50%!important;object-fit:cover!important;border:1px solid rgba(146,113,255,.55)!important}.nexa-v425-member b{display:block!important}.nexa-v425-member small{color:#9ca6c2!important}.nexa-v425-chip{font-size:8px!important;padding:4px 7px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.14)!important;color:#b9c4e1!important;white-space:nowrap!important}
 .nexa-v425-actions{display:flex!important;justify-content:flex-end!important;gap:7px!important;margin-top:9px!important}.nexa-v425-actions button{border-radius:999px!important;padding:7px 10px!important;font-weight:900!important}.nexa-v425-approve{border:1px solid rgba(74,220,179,.5)!important;background:rgba(20,82,66,.3)!important;color:#94efd5!important}.nexa-v425-reject{border:1px solid rgba(255,92,147,.5)!important;background:rgba(89,21,48,.3)!important;color:#ff9dbc!important}
 .nexa-v425-empty{padding:25px 12px!important;text-align:center!important;border:1px dashed rgba(255,255,255,.14)!important;border-radius:16px!important;color:#98a3bf!important}

 /* overlays */
 .nexa-v425-overlay{position:fixed!important;inset:0!important;z-index:2147483647!important;background:rgba(0,0,0,.76)!important;backdrop-filter:blur(7px)!important;display:grid!important;place-items:center!important;padding:16px!important}
 .nexa-v425-overlay-card{width:min(520px,100%)!important;max-height:84dvh!important;overflow:auto!important;border:1px solid var(--accent,#ff4fd8)!important;border-radius:22px!important;padding:19px!important;background:linear-gradient(155deg,#0b1028,#050713)!important;color:#fff!important}
 .nexa-v425-overlay-card input,.nexa-v425-overlay-card select,.nexa-v425-overlay-card textarea{width:100%!important;box-sizing:border-box!important;margin-top:5px!important;padding:10px!important;border-radius:10px!important;border:1px solid rgba(255,255,255,.15)!important;background:#090f25!important;color:#fff!important;font-size:16px!important}.nexa-v425-overlay-card label{display:block!important;margin:9px 0!important;color:#cbd2e7!important}.nexa-v425-overlay-card .body{color:#c5c8d9!important;line-height:1.5!important;font-size:13px!important}.nexa-v425-overlay-card .actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}.nexa-v425-overlay-card button{padding:9px 12px!important;border-radius:999px!important;border:1px solid var(--accent,#ff4fd8)!important;background:#11152f!important;color:#fff!important;font-weight:900!important}
 `;
 document.head.appendChild(s);
}
function overlay(id,title,body,accent='#ff4fd8',kicker='GUIDE'){
 $('#'+id)?.remove();const d=document.createElement('div');d.id=id;d.className='nexa-v425-overlay';
 d.innerHTML=`<section class="nexa-v425-overlay-card" style="--accent:${accent}"><small style="color:${accent};font-weight:950;letter-spacing:.15em">${esc(kicker)}</small><h2 style="margin:6px 0 9px">${esc(title)}</h2><div class="body">${body}</div><div class="actions"><button type="button" data-v425-close>Close</button></div></section>`;
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-v425-close]'))d.remove()});document.body.appendChild(d);return d;
}

/* HOME */
async function mainAccount(){
 const c=sb();if(!c)return null;
 try{const {data:{user}}=await c.auth.getUser();if(!user)return null;const {data}=await c.from('player_accounts').select('id,in_game_name,player_id,is_main,alliance_id,custom_alliance_tag,alliance_role,alliances(tag,emblem_url,color)').eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();return data||null}catch{return null}
}
function ensureStellar(){
 const profile=$('#nexa-profile-launcher-section');if(!profile)return;
 ['#nexa-v424-stellar','#nexa-v42-stellar'].forEach(sel=>$(sel)?.remove());
 let s=$('#nexa-v425-stellar');if(!s){s=document.createElement('section');s.id='nexa-v425-stellar';s.innerHTML='<div class="line"><span class="orb">✦</span><b>STELLAR SIGNAL</b><span class="orb">✦</span></div><p>Small course corrections can change the path of an entire orbit.</p>';profile.after(s)}
}
function normalizeIOSZoom(){
 const meta=document.querySelector('meta[name="viewport"]');if(!meta)return;
 // Keep the app viewport locked to 1 after the external Verify Human page returns.
 // Safari can otherwise preserve the challenge zoom level into NEXA.
 meta.setAttribute('content','width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
 try{document.activeElement?.blur?.();window.scrollTo({left:0,top:window.scrollY,behavior:'auto'})}catch{}
}

function compactLive(){
 const section=$('#home-svs-section');if(!section)return;const t=txt(section);
 const inactive=/No Live Event|no active or upcoming|SvS against XXXX|Ends in\s*[—-]/i.test(t);
 section.classList.toggle('nexa-v425-empty',inactive);
 let copy=$('.nexa-v425-empty-copy',section);
 if(inactive&&!copy){copy=document.createElement('div');copy.className='nexa-v425-empty-copy';copy.innerHTML='<div class="kicker">LIVE EVENT</div><h3>No Live Event</h3><p>Upcoming state events, schedules and forms will appear here when leadership publishes them.</p>';section.appendChild(copy)}
 if(!inactive)copy?.remove();
}
function transferOwnedCard(){
 let owned=$('#nexa-v430-transfer-card');
 const legacy=$('#home-transfers-section');
 if(legacy){
  legacy.style.setProperty('display','none','important');
  legacy.setAttribute('aria-hidden','true');
 }
 if(!owned){
  owned=document.createElement('section');owned.id='nexa-v430-transfer-card';
  if(legacy)legacy.after(owned);
  else $('#home-svs-section')?.after(owned);
 }
 return owned;
}
function renderTransferOwned(rows=[]){
 const section=transferOwnedCard();if(!section)return;
 section.dataset.nexaTransferOwner='430';
 if(!rows.length){
  section.innerHTML='<div class="kicker">TRANSFERS</div><h3>Transfer Center</h3><p>Transfer cycles and recruiting information will appear here when a transfer cycle is active.</p>';
  return;
 }
 const r=rows[0]||{};
 const actions=r.public_token?'<div class="nexa-v430-actions"><a href="transfer-event.html?token='+encodeURIComponent(r.public_token)+'">Open</a><a href="transfer-apply.html?token='+encodeURIComponent(r.public_token)+'">Apply</a></div>':'';
 section.innerHTML='<div class="kicker">TRANSFERS</div><h3>'+esc(r.title||'Transfer Event')+'</h3><p>'+esc(r.destination_state?('Transfer to State '+r.destination_state):'Applications are open.')+'</p>'+actions;
}
async function refreshTransferOwner(){
 try{
  const c=sb();if(!c)throw new Error('No Supabase');
  const {data,error}=await c.from('transfer_events').select('id,title,destination_state,public_token,starts_at,ends_at').eq('status','open').eq('applications_open',true).order('starts_at',{ascending:true});
  if(error)throw error;renderTransferOwned(Array.isArray(data)?data:[]);
 }catch(e){renderTransferOwned([])}
}
function compactTransfers(){
 transferOwnedCard();
}

function ensureSignals(){
 const tr=$('#nexa-v430-transfer-card')||transferOwnedCard(),live=$('#home-svs-section');
 let pulse=$('#nexa-v425-pulse');if(!pulse){pulse=document.createElement('section');pulse.id='nexa-v425-pulse';pulse.innerHTML='<div class="kicker">NEXA PULSE</div><h3>Signals & response requests</h3><p>Forms, surveys and requests appear here when leadership publishes them.</p>'}
 let alliance=$('#nexa-v425-alliance');if(!alliance){alliance=document.createElement('section');alliance.id='nexa-v425-alliance';alliance.innerHTML='<div class="kicker">ALLIANCE SIGNAL</div><h3>No alliance event published</h3><p>Foundry, Canyon and alliance strategy updates will appear here.</p>'}
 if(tr){tr.after(pulse);pulse.after(alliance)}else if(live){live.after(pulse);pulse.after(alliance)}
}
function hideBuild(){
 $$('[id*="build" i],[class*="build" i],footer *').forEach(el=>{if(/^NEXA BUILD\b/i.test(txt(el)))el.style.display='none'});
 $$('main.shell>*').forEach(el=>{if(/^NEXA BUILD\b/i.test(txt(el)))el.style.display='none'});
}
function applyTheme(){
 const t=(txt($('#home-svs-section'))+' '+txt($('#nexa-v425-alliance'))).toLowerCase();let p='#9b79ff',s='#55cfff',d='#24154c',name='default';
 const themes=[[/state of power|\bsvs\b/,'svs','#E83D5B','#6EDCFF','#551426'],[/frostdragon|\bfdt\b/,'fdt','#49D9FF','#8D7BFF','#123D5C'],[/winter siege/,'winter-siege','#32E0A1','#8FFFD7','#0C4F46'],[/tundra arms|\btal\b/,'tal','#A56CFF','#FF9B45','#3F235F'],[/foundry/,'foundry','#FF9F43','#5CAEFF','#5B3311'],[/canyon/,'canyon','#D9A94E','#E66E52','#53371C']];
 for(const [re,n,a,b,c] of themes)if(re.test(t)&&!$('#home-svs-section')?.classList.contains('nexa-v425-empty')){name=n;p=a;s=b;d=c;break}
 if(name==='default'&&!$('#home-transfers-section')?.classList.contains('nexa-v425-empty')&&/transfer/i.test(txt($('#home-transfers-section')))){name='transfers';p='#FF8A3D';s='#FFC857';d='#5B2D12'}
 document.body.dataset.nexaEventTheme=name;document.documentElement.style.setProperty('--nexa-event-primary',p);document.documentElement.style.setProperty('--nexa-event-secondary',s);document.documentElement.style.setProperty('--nexa-event-deep',d);
}
async function homeIdentity(){
 const a=await mainAccount();if(!a)return;const tag=a.alliances?.tag||a.custom_alliance_tag||'';const line=[a.in_game_name||'',tag,a.player_id?`ID ${a.player_id}`:''].filter(Boolean).join(' • ');
 const n=$('#nexa-profile-launcher-name');if(n)n.textContent=line||'MY PROFILE';
 const mb=$('#nexa-v425-my-alliance .label');if(mb)mb.textContent=tag?`My Alliance • ${tag}`:'My Alliance';
}
function homePass(){ensureStellar();compactLive();compactTransfers();ensureSignals();hideBuild();applyTheme();homeIdentity()}

/* PROFILE HELPERS */
function ensureProfileActions(){
 const stats=$('#nexa-profile-modal .nexa-profile-stats');if(!stats||$('#nexa-v425-profile-actions'))return;
 const r=document.createElement('div');r.id='nexa-v425-profile-actions';r.innerHTML='<button class="nexa-v425-guide" type="button">ⓘ</button><button class="nexa-v425-ministry" type="button">♜</button>';stats.after(r);
}
function profileGuide(){overlay('nexa-v425-profile-guide','My Profile','Swipe categories and generations naturally. Each Library card has its own <b>Reset</b>, gold <b>Guide</b> and <b>Save</b>. Troop tier and Fire Crystal choices update their artwork.','#ff4fd8')}
async function ministry(){
 const c=sb();let body='<p>No Ministry appointment is published for this account right now.</p>';
 try{const a=await mainAccount();if(a?.id){const {data}=await c.from('ministry_appointments').select('day_type,ministry_position,appointment_time,notes').eq('player_account_id',a.id).order('appointment_time').limit(12);if(data?.length)body=data.map(x=>`<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08)"><b>${esc(x.ministry_position||'Ministry')}</b><br>${esc(x.day_type||'')} ${x.appointment_time?esc(new Date(x.appointment_time).toLocaleString()):''}${x.notes?`<br><small>${esc(x.notes)}</small>`:''}</div>`).join('')}}catch(e){body=`<p>${esc(e?.message||e)}</p>`}
 overlay('nexa-v425-ministry-overlay','Ministry Schedule',body,'#bca7ff','MINISTRY');
}

/* MENU */
function closeMenu(){const m=$('#nexa-home-menu'),t=$('#nexa-home-menu-toggle');m?.classList.remove('open');m?.setAttribute('aria-hidden','true');t?.classList.remove('open');t?.setAttribute('aria-expanded','false')}
function polishMenu(){
 const sub=$('.nexa-home-menu-subview', $('#nexa-home-menu-card'));if(!sub)return;
 $$('.nexa-home-menu-label',sub).forEach(x=>{if(txt(x).toUpperCase()==='NAVIGATION')x.style.display='none'});
 $$('.nexa-home-menu-item',sub).forEach(x=>{const t=txt(x).replace(/[•›>]/g,'').trim().toUpperCase();if(['HOME','LIVE EVENT','TRANSFERS'].includes(t))x.style.display='none'});
 if(!$('#nexa-v425-my-alliance',sub)){const b=document.createElement('button');b.id='nexa-v425-my-alliance';b.type='button';b.style.cssText='width:100%;border:0;border-radius:12px;background:linear-gradient(90deg,rgba(177,61,255,.13),rgba(54,106,255,.07));padding:11px 12px;color:#f1e8ff;display:flex;justify-content:space-between;font-weight:900';b.innerHTML='<span class="label">My Alliance</span><span>✦</span>';const sep=$('.nexa-home-menu-separator',sub);sep?sep.before(b):sub.prepend(b)}
 if(!$('#nexa-v425-report',sub)){const b=document.createElement('button');b.id='nexa-v425-report';b.type='button';b.style.cssText='width:100%;border:0;border-radius:12px;background:transparent;padding:11px 12px;color:#ff9fca;display:flex;justify-content:space-between;font-weight:900';b.innerHTML='<span>Report Bugs</span><span>•</span>';sub.appendChild(b)}
 homeIdentity();
}
async function reportBug(){
 const d=overlay('nexa-v425-bug','Report Bugs','<form id="nexa-v425-bug-form"><label>Module<input name="module" placeholder="Home, Profile, Administration..."></label><label>What happened?<textarea name="description" rows="5" required></textarea></label><button type="submit">Send Report</button><div id="nexa-v425-bug-status"></div></form>','#ff6ea9','BUG REPORT');
 const f=$('#nexa-v425-bug-form',d);if(!f)return;f.onsubmit=async e=>{e.preventDefault();const st=$('#nexa-v425-bug-status');st.textContent='Sending…';try{const c=sb(),{data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in required.');const fd=new FormData(f);const {error}=await c.rpc('nexa_submit_bug_report',{p_module:String(fd.get('module')||''),p_description:String(fd.get('description')||''),p_expected_behavior:null,p_actual_behavior:null,p_page_path:location.pathname+location.search,p_build_label:'V42.8',p_user_agent:navigator.userAgent,p_viewport:`${innerWidth}x${innerHeight}`,p_client_errors:[],p_screenshot_paths:[]});if(error)throw error;st.textContent='Report sent ✓'}catch(err){st.textContent=err?.message||err}};
}

/* ADMIN */
function cleanAdminURL(){const u=new URL(location.href);let c=false;['admin','tab'].forEach(k=>{if(u.searchParams.has(k)){u.searchParams.delete(k);c=true}});if(c)history.replaceState(history.state,'',u.pathname+(u.searchParams.toString()?`?${u.searchParams}`:'')+u.hash)}
function closeAdmin(){
 const m=$('#admin-modal');m?.classList.remove('open','module-view','nexa-v25-admin');m?.setAttribute('aria-hidden','true');document.body.classList.remove('nexa-workspace-open');$('#internal-module-frame-wrap')?.classList.add('hidden');$('#native-module-host')?.classList.add('hidden');cleanAdminURL();
}
function ensureAdminShell(){
 const content=$('#svs-admin-content'),modal=$('#admin-modal');if(!content||!modal)return;
 let x=$('#nexa-v425-admin-close');if(!x){x=document.createElement('button');x.id='nexa-v425-admin-close';x.type='button';x.textContent='×';x.onclick=closeAdmin;modal.appendChild(x)}
 let shell=$('#nexa-v425-admin-shell',content);if(!shell){shell=document.createElement('header');shell.id='nexa-v425-admin-shell';shell.innerHTML='<button class="guide" type="button">ⓘ</button><h2>Alliances</h2><div id="nexa-v425-admin-arrows"><button data-dir="-1" type="button">‹</button><button data-dir="1" type="button">›</button></div>';content.prepend(shell)}
 updateAdminShell();
}
function updateAdminShell(){
 const sh=$('#nexa-v425-admin-shell');if(!sh)return;const i=ADMIN.indexOf(currentAdmin);$('h2',sh).textContent=LABEL[currentAdmin]||'Administration';const b=$$('#nexa-v425-admin-arrows button');if(b[0])b[0].disabled=i<=0;if(b[1])b[1].disabled=i<0||i===ADMIN.length-1;
}
function hideNativeWorkspaces(){$('#internal-module-frame-wrap')?.classList.add('hidden');$('#native-module-host')?.classList.add('hidden')}
function triggerPassport(key){
 const fake=document.createElement('button');fake.type='button';fake.dataset.v25Go=key;fake.style.display='none';document.body.appendChild(fake);fake.click();fake.remove();
}
function patchLibraryFrame(frame){
 try{
  const d=frame.contentDocument;if(!d)return;
  let st=d.getElementById('nexa-v425-embed-style');if(!st){st=d.createElement('style');st.id='nexa-v425-embed-style';d.head.appendChild(st)}
  st.textContent=`html,body{background:transparent!important;min-height:0!important;overflow-x:hidden!important}.nebula-bg,.starfield,.admin-nav,.back,.lib-head,body>button{display:none!important}.lib-shell{width:100%!important;max-width:100%!important;margin:0!important;padding:0 0 50px!important;background:transparent!important}.lib-tabs,.gen-row{touch-action:auto!important}`;
  $$('button,a,div,h1,h2,h3,strong,b',d).forEach(el=>{const t=txt(el);if(/^Gen 0\s*[•·-]\s*Unlocked$/i.test(t))el.textContent='EPIC • Unlocked';if(/HERO\s*[•·-]\s*GEN 0 VISIBILITY/i.test(t))el.textContent='HERO • EPIC VISIBILITY'});
  const size=()=>{const h=Math.max(d.body?.scrollHeight||0,d.documentElement?.scrollHeight||0,900);frame.style.height=Math.min(h+25,6000)+'px'};size();setTimeout(size,200);setTimeout(size,700);
  if(window.ResizeObserver&&!frame._nexa425RO){frame._nexa425RO=new ResizeObserver(size);frame._nexa425RO.observe(d.documentElement)}
 }catch(e){console.warn('Library embed',e?.message||e)}
}
const ADMIN_COPY={
 alliances:'Create, activate and manage alliance passports, emblems, access codes, members and alliance operations.',
 library:'Verified NEXA master catalog. Control the Heroes, Experts, Pets, Troops, Chief Gear and Charms players can see.',
 permissions:'Find a player and manage Operational Roles and module access from one place.',
 roles:"Alliance Rank is managed inside each Alliance Passport. Operational Roles describe a person's work in NEXA and never grant module access automatically.",
 system:'Owner-only website controls. Maintenance Mode protects every public NEXA route while you work.'
};
function adminSection(target){return $({alliances:'#admin-alliances',library:'#admin-library',permissions:'#admin-permissions',roles:'#admin-roles',system:'#admin-system'}[target]||'')}
function normalizeAdminSection(target){
 const sec=adminSection(target);if(!sec)return;
 $$('.nexa-v428-admin-intro',sec).forEach(x=>x.remove());
 if(target==='roles'){
  const first=$('.nexa-v25-host>.nexa-v25-panel',sec);
  if(first&&/Alliance Rank is managed inside each Alliance Passport|Operational Roles describe/i.test(txt(first)))first.style.display='none';
 }
 if(target==='system'){
  $(':scope>.admin-section-head',sec)?.style.setProperty('display','none','important');
  $$('h2,h3',sec).filter(x=>/^System Operations$/i.test(txt(x))).forEach(x=>x.style.display='none');
 }
 if(target==='permissions'){
  $$('p,small,div',sec).filter(x=>/Find a player, then manage Operational Roles and Module Access in one ficha\.?/i.test(txt(x))).forEach(x=>{if(!x.classList.contains('nexa-v428-admin-intro'))x.style.display='none'});
 }
 const intro=document.createElement('div');intro.className='nexa-v428-admin-intro';intro.textContent=ADMIN_COPY[target]||'';
 sec.prepend(intro);
 if(target==='alliances')setTimeout(decorateAlliancePassports,60);
}
async function loadBugReports(){
 const sec=$('#admin-system');if(!sec)return;let wrap=$('#nexa-v428-bugs',sec);if(!wrap){wrap=document.createElement('section');wrap.id='nexa-v428-bugs';sec.appendChild(wrap)}
 wrap.innerHTML='<div class="nexa-v428-bug-head"><h3>Bug Reports</h3><button class="nexa-v428-bug-refresh" type="button">Refresh</button></div><div class="nexa-v425-empty">Loading bug reports…</div>';
 try{const {data,error}=await sb().rpc('nexa_list_bug_reports');if(error)throw error;const rows=Array.isArray(data)?data:[];
  wrap.innerHTML='<div class="nexa-v428-bug-head"><h3>Bug Reports</h3><button class="nexa-v428-bug-refresh" type="button">Refresh</button></div>'+(rows.length?rows.map(r=>`<article class="nexa-v428-bug" data-bug-id="${esc(r.id)}"><b>${esc(r.module||'General')} · ${esc(r.reporter_name||'Player')}</b><small>${esc(r.game_id||'—')} ${r.alliance_tag?'· '+esc(r.alliance_tag):''} · ${r.created_at?esc(new Date(r.created_at).toLocaleString()):''}</small><p>${esc(r.description||'No description')}</p><div class="nexa-v428-bug-controls"><select data-bug-status><option ${r.status==='new'?'selected':''}>new</option><option ${r.status==='reviewing'?'selected':''}>reviewing</option><option ${r.status==='resolved'?'selected':''}>resolved</option><option ${r.status==='closed'?'selected':''}>closed</option></select><select data-bug-severity><option value="">severity</option>${['low','medium','high','critical'].map(v=>`<option ${r.severity===v?'selected':''}>${v}</option>`).join('')}</select><button type="button" data-save-bug>Save</button></div></article>`).join(''):'<div class="nexa-v425-empty">No bug reports yet.</div>');
 }catch(e){wrap.innerHTML='<div class="nexa-v428-bug-head"><h3>Bug Reports</h3><button class="nexa-v428-bug-refresh" type="button">Refresh</button></div><div class="nexa-v425-empty">'+esc(e?.message||e)+'</div>'}
}
async function saveBugReport(card){if(!card)return;const status=$('[data-bug-status]',card)?.value||null,severity=$('[data-bug-severity]',card)?.value||null;try{const {error}=await sb().rpc('nexa_update_bug_report',{p_id:card.dataset.bugId,p_status:status,p_severity:severity||null,p_diagnostic_summary:null,p_likely_cause:null,p_reproduction_steps:null,p_suggested_review:null});if(error)throw error;await loadBugReports()}catch(e){overlay('nexa-v428-bug-error','Bug Report',esc(e?.message||e),'#ff6ea9','ERROR')}}

function showLibrary(){
 hideNativeWorkspaces();const modal=$('#admin-modal'),content=$('#svs-admin-content'),sec=$('#admin-library');if(!modal||!content||!sec)return;
 modal.classList.add('open','module-view','nexa-v25-admin');modal.setAttribute('aria-hidden','false');$('#admin-module-chooser')?.classList.add('hidden');content.classList.remove('hidden');
 $$('.admin-section').forEach(s=>{s.classList.add('hidden');s.classList.remove('nexa-v25-active')});sec.classList.remove('hidden');sec.classList.add('nexa-v25-active','nexa-v425-library');
 if(!$('#nexa-v425-library-frame',sec)){sec.innerHTML='<div class="nexa-v428-admin-intro">'+ADMIN_COPY.library+'</div><iframe id="nexa-v425-library-frame" title="NEXA Library" src="library.html?admin=1&embed=1&v=428"></iframe>';const f=$('#nexa-v425-library-frame',sec);f.addEventListener('load',()=>patchLibraryFrame(f))}
 else{normalizeAdminSection('library');patchLibraryFrame($('#nexa-v425-library-frame',sec))}
}
async function activateAdmin(target){
 target=ADMIN.includes(target)?target:'alliances';currentAdmin=target;document.body.classList.add('nexa-workspace-open');closeMenu();ensureAdminShell();hideNativeWorkspaces();
 if(target==='library'){showLibrary();updateAdminShell();return}
 $('#admin-library')?.classList.add('hidden');$('#admin-library')?.classList.remove('nexa-v25-active');
 if(target==='system'){try{const {data}=await sb().rpc('is_nexa_owner');if(data!==true){overlay('nexa-v425-system-denied','System Operations','System Operations is Owner-only.','#ff6ea9','ACCESS');currentAdmin='roles';updateAdminShell();triggerPassport('roles');return}}catch{}}
 const key=target==='permissions'?'access':target;triggerPassport(key);updateAdminShell();[80,240,600,1200].forEach(ms=>setTimeout(()=>normalizeAdminSection(target),ms));if(target==='system'){setTimeout(loadBugReports,520);setTimeout(loadBugReports,1400);}setTimeout(()=>$('.admin-modal-card',$('#admin-modal'))?.scrollTo({top:0,behavior:'auto'}),30);
}
function openAdminFromExisting(){
 setTimeout(()=>{const m=$('#admin-modal');if(!m?.classList.contains('open'))return;document.body.classList.add('nexa-workspace-open');ensureAdminShell();activateAdmin('alliances')},260);
}
function initAdminURL(){const u=new URL(location.href);if(u.searchParams.get('admin')==='administration'){const t=u.searchParams.get('tab');setTimeout(()=>activateAdmin(ADMIN.includes(t)?t:'alliances'),700)}}

function openAdminTarget(target='alliances'){
 target=ADMIN.includes(target)?target:'alliances';
 closeMenu();cleanAdminURL();
 const modal=$('#admin-modal'),content=$('#svs-admin-content');if(!modal||!content)return;
 document.body.classList.add('nexa-workspace-open');
 modal.classList.add('open','module-view','nexa-v25-admin');modal.setAttribute('aria-hidden','false');
 $('#admin-module-chooser')?.classList.add('hidden');content.classList.remove('hidden');
 ensureAdminShell();activateAdmin(target);
}
function adminMenuTarget(button){
 if(!button?.closest?.('#nexa-home-menu'))return null;
 const label=txt(button).replace(/[•›>→←]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 if(/^alliances?$/.test(label))return'alliances';
 if(/^library$/.test(label))return'library';
 if(/^(nexa access|permissions?)$/.test(label))return'permissions';
 if(/^(operational roles?|roles?)$/.test(label))return'roles';
 if(/^system operations?$/.test(label))return'system';
 return null;
}

/* MY ALLIANCE */
function decorateAlliancePassports(){
 const sec=$('#admin-alliances');if(!sec)return;
 $$('button',sec).filter(b=>/^Choose Alliance Emblem$/i.test(txt(b))).forEach(choose=>{
  if(choose.parentElement?.querySelector?.('[data-v428-manage-alliance]'))return;
  const card=choose.closest('[data-alliance-id],article,section,.nexa-v25-panel,.card')||choose.parentElement;
  if(!card)return;
  const heads=$$('h1,h2,h3,h4,strong,b',card).map(txt);
  const tag=heads.find(v=>/^[A-Z0-9]{2,8}$/.test(v)&&!/^R[1-5]$/.test(v));
  if(!tag)return;
  const b=document.createElement('button');b.type='button';b.dataset.v428ManageAlliance=tag;b.textContent='Manage Alliance';
  b.style.cssText='margin-left:8px;border:1px solid rgba(94,212,255,.46);border-radius:12px;background:#0b1730;color:#7ee6ff;padding:10px 14px;font-weight:900';
  choose.after(b);
 });
}
async function loadAllianceContext(targetTag=null){
 const c=sb(),a=await mainAccount();if(!c||!a)return null;
 const {data,error}=await c.rpc('nexa_list_alliance_passports');if(error)throw error;const rows=Array.isArray(data)?data:[];
 let alliance=targetTag?rows.find(x=>String(x.id)===String(targetTag)||String(x.tag||'').toUpperCase()===String(targetTag).toUpperCase()):rows.find(x=>String(x.id)===String(a.alliance_id));if(!alliance&&!targetTag&&a.alliances?.tag)alliance=rows.find(x=>String(x.tag)===String(a.alliances.tag));
 const {data:publicRows}=await c.rpc('get_public_nexa_alliances');
 return {account:a,rows,alliance,publicAlliances:Array.isArray(publicRows)?publicRows:[]};
}
function memberHTML(m,manage=false){
 const photo=m.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name||'?')}&background=111a38&color=cabaff&bold=true`;
 return `<button type="button" class="nexa-v425-member" data-member="${esc(m.accountId)}"><span class="nexa-v425-member-main"><img src="${esc(photo)}" alt=""><span><b>${esc(m.name||'Player')}</b><small>ID ${esc(m.gameId||'—')} • ${esc(m.rank||'Member')}</small></span><span class="nexa-v425-chip">${m.allianceVerified?'VERIFIED':'PENDING'}</span></span>${manage?'<span style="display:block;text-align:right;margin-top:7px;color:#b9a8ff;font-size:9px;font-weight:900">Manage ›</span>':''}</button>`;
}
function renderAllianceTab(type){
 const body=$('#nexa-v425-hub-body'),a=allianceCtx?.alliance;if(!body||!a)return;$$('.nexa-v425-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===type));
 const ms=a.members||[],manage=!!a.canAssignRanks;
 if(type==='members'){body.innerHTML=ms.length?ms.map(m=>memberHTML(m,manage)).join(''):'<div class="nexa-v425-empty">No members found.</div>';return}
 if(type==='pending'){const p=ms.filter(m=>!m.allianceVerified);body.innerHTML=p.length?p.map(m=>`${memberHTML(m,manage)}${manage?`<div class="nexa-v425-actions"><button class="nexa-v425-reject" data-reject="${esc(m.accountId)}" type="button">Reject</button><button class="nexa-v425-approve" data-approve="${esc(m.accountId)}" type="button">Approve</button></div>`:''}`).join(''):'<div class="nexa-v425-empty">No pending members right now.</div>';return}
 const copy={pulse:'Active NEXA Pulse requests and response progress will appear here when published.',history:'Closed NEXA Pulse history will appear here.',events:'Foundry, Canyon and alliance strategy events will appear here when leadership publishes them.'};body.innerHTML=`<div class="nexa-v425-empty">${copy[type]||'Nothing published here yet.'}</div>`;
}
async function refreshAllianceHub(active='members'){
 try{allianceCtx=await loadAllianceContext(allianceTargetTag);const hub=$('#nexa-v425-alliance-hub');if(!hub)return;const a=allianceCtx?.alliance;if(!a){$('.nexa-v425-passport',hub).innerHTML='<h1>No Alliance</h1><p>No alliance is linked to this account.</p>';$('#nexa-v425-hub-body').innerHTML='<div class="nexa-v425-empty">No alliance found.</div>';return}
  const em=a.emblemUrl?`<img src="${esc(a.emblemUrl)}" alt="${esc(a.tag)} emblem">`:`<span>${esc(a.tag||'?')}</span>`;$('.nexa-v425-passport',hub).style.setProperty('--ac',a.color||'#8b6cff');$('.nexa-v425-passport',hub).innerHTML=`<div class="nexa-v425-emblem">${em}</div><h1>${esc(a.tag||a.name||'Alliance')}</h1><p>Alliance Passport • ${(a.members||[]).length} members</p>`;renderAllianceTab(active);
 }catch(e){const b=$('#nexa-v425-hub-body');if(b)b.innerHTML=`<div class="nexa-v425-empty">${esc(e?.message||e)}</div>`}
}
async function openAllianceHub(targetTag=null){
 allianceTargetTag=targetTag||null;closeMenu();document.body.classList.add('nexa-workspace-open');$('#nexa-v425-alliance-hub')?.remove();const h=document.createElement('section');h.id='nexa-v425-alliance-hub';h.innerHTML='<div class="nexa-v425-hub-head"><button class="nexa-v425-hub-guide" type="button">ⓘ</button><h2>'+(targetTag?'Alliance Management':'My Alliance')+'</h2><button class="nexa-v425-hub-close" type="button">×</button></div><div class="nexa-v425-passport"><h1>Loading…</h1><p>Alliance Passport</p></div><nav class="nexa-v425-tabs"><button class="active" data-tab="members">Members</button><button data-tab="pending">Pending Members</button><button data-tab="pulse">NEXA Pulse</button><button data-tab="history">Pulse History</button><button data-tab="events">Alliance Events</button></nav><div id="nexa-v425-hub-body"><div class="nexa-v425-empty">Loading alliance…</div></div>';document.body.appendChild(h);
 $('.nexa-v425-hub-close',h).onclick=()=>{allianceTargetTag=null;h.remove();document.body.classList.remove('nexa-workspace-open')};$('.nexa-v425-hub-guide',h).onclick=()=>overlay('nexa-v425-alliance-guide','My Alliance','Members opens the alliance roster. Authorized R4/R5 leadership can tap a member to change rank, remove them, or move them to another active alliance. Pending Members contains approval actions.','#ff4fd8');
 if(targetTag){try{allianceCtx=await loadAllianceContext(targetTag);const a=allianceCtx?.alliance;if(a){const em=a.emblemUrl?`<img src="${esc(a.emblemUrl)}" alt="${esc(a.tag)} emblem">`:`<span>${esc(a.tag||'?')}</span>`;$('.nexa-v425-passport',h).style.setProperty('--ac',a.color||'#8b6cff');$('.nexa-v425-passport',h).innerHTML=`<div class="nexa-v425-emblem">${em}</div><h1>${esc(a.tag||a.name||'Alliance')}</h1><p>Alliance Passport • ${(a.members||[]).length} members</p>`;renderAllianceTab('members')}else await refreshAllianceHub()}catch{await refreshAllianceHub()}}else await refreshAllianceHub('members',forcedAllianceId);
}
function findMember(id){return allianceCtx?.alliance?.members?.find(m=>String(m.accountId)===String(id))}
function openMemberManager(id){
 const m=findMember(id),a=allianceCtx?.alliance;if(!m||!a?.canAssignRanks)return;
 const destinations=(allianceCtx.publicAlliances||[]).filter(x=>String(x.id)!==String(a.id));
 const d=overlay('nexa-v425-member-manager','Manage Member',`<b>${esc(m.name||'Player')}</b><p>ID ${esc(m.gameId||'—')} • ${esc(m.rank||'Member')}</p><label>Alliance Rank<select id="v425-member-rank">${['R5','R4','R3','R2','R1'].map(r=>`<option ${r===String(m.rank).toUpperCase()?'selected':''}>${r}</option>`).join('')}</select></label><label>Move to Alliance<select id="v425-member-alliance"><option value="">Choose destination</option>${destinations.map(x=>`<option value="${esc(x.id)}">${esc(x.tag||x.name||x.id)}</option>`).join('')}</select></label><div class="actions"><button type="button" data-member-action="rank" data-id="${esc(m.accountId)}">Save Rank</button><button type="button" data-member-action="move" data-id="${esc(m.accountId)}">Move Alliance</button><button type="button" data-member-action="remove" data-id="${esc(m.accountId)}" style="--accent:#ff6ea9">Remove</button></div>`,'#b68cff','MEMBER');
}
async function memberAction(id,action,button){
 if(!id||!action)return;const c=sb();button&&(button.disabled=true);
 try{let rank=null,target=null;if(action==='rank')rank=$('#v425-member-rank')?.value||null;if(action==='move')target=Number($('#v425-member-alliance')?.value||0)||null;if(action==='remove'&&!confirm('Remove this member from the alliance?'))return;
  const {error}=await c.rpc('nexa_manage_alliance_member',{p_account_id:id,p_action:action,p_new_rank:rank,p_target_alliance_id:target});if(error)throw error;$('#nexa-v425-member-manager')?.remove();await refreshAllianceHub(action==='approve'?'members':'members');
 }catch(e){overlay('nexa-v425-member-error','Could not update member',esc(e?.message||e),'#ff6ea9','ERROR')}finally{button&&(button.disabled=false)}
}

let lastAdminAllianceId=null;
function ensureAdminManageAlliance(){
 const host=$('#admin-alliances .nexa-v25-host');if(!host)return;
 const emblemBtn=$('[data-v25-emblems]',host);
 const aid=emblemBtn?.dataset.v25Emblems||lastAdminAllianceId;
 const panel=emblemBtn?.closest('.nexa-v25-panel')||$('.nexa-v25-panel',host);
 if(!aid||!panel||$('[data-v429-manage-alliance]',panel))return;
 let row=$('.nexa-v25-buttons',panel);if(!row){row=document.createElement('div');row.className='nexa-v25-buttons';panel.appendChild(row)}
 const b=document.createElement('button');b.type='button';b.className='nexa-v25-btn';b.dataset.v429ManageAlliance=String(aid);b.textContent='Manage Alliance';row.appendChild(b);
}

/* EVENTS */
document.addEventListener('click',e=>{
 const b=e.target.closest?.('button,a');if(!b)return;
 const alliancePlanet=b.closest?.('[data-v25-alliance]');if(alliancePlanet){lastAdminAllianceId=alliancePlanet.dataset.v25Alliance;[80,220,500].forEach(ms=>setTimeout(ensureAdminManageAlliance,ms));}
 if(b.matches?.('[data-v429-manage-alliance]')){e.preventDefault();e.stopImmediatePropagation();openAllianceHub(b.dataset.v429ManageAlliance);return}
 const adminTarget=adminMenuTarget(b);
 if(adminTarget){e.preventDefault();e.stopImmediatePropagation();openAdminTarget(adminTarget);return}
 if(b.id==='nexa-home-menu-toggle'){[80,220,520].forEach(ms=>setTimeout(polishMenu,ms));return}
 if(b.id==='nexa-v425-my-alliance'){e.preventDefault();e.stopImmediatePropagation();openAllianceHub();return}
 if(b.matches('[data-v428-manage-alliance]')){e.preventDefault();e.stopImmediatePropagation();openAllianceHub(b.dataset.v428ManageAlliance);return}
 if(b.id==='nexa-v425-report'){e.preventDefault();e.stopImmediatePropagation();closeMenu();reportBug();return}
 if(b.matches('.nexa-v425-guide')){e.preventDefault();profileGuide();return}
 if(b.matches('.nexa-v425-ministry')){e.preventDefault();ministry();return}
 if(b.id==='open-administration'){e.preventDefault();e.stopImmediatePropagation();openAdminTarget('alliances');return}
 if(b.closest('#nexa-v425-admin-shell .guide')){e.preventDefault();overlay('nexa-v425-admin-help','Administration','One Administration workspace owns the page. Use the arrows below the title to move between Alliances, Library, NEXA Access, Operational Roles and System Operations. The pink × closes Administration.','#ff4fd8');return}
 if(b.closest('#nexa-v425-admin-arrows')){e.preventDefault();e.stopImmediatePropagation();const i=ADMIN.indexOf(currentAdmin),n=i+Number(b.dataset.dir||0);if(n>=0&&n<ADMIN.length)activateAdmin(ADMIN[n]);return}
 if(b.matches('.nexa-v425-tabs button')){renderAllianceTab(b.dataset.tab);return}
 if(b.matches('.nexa-v425-member')){openMemberManager(b.dataset.member);return}
 if(b.matches('[data-approve]')){e.preventDefault();memberAction(b.dataset.approve,'approve',b);return}
 if(b.matches('[data-reject]')){e.preventDefault();if(confirm('Reject this pending member?'))memberAction(b.dataset.reject,'remove',b);return}
 if(b.matches('[data-member-action]')){e.preventDefault();memberAction(b.dataset.id,b.dataset.memberAction,b);return}
 if(b.matches('.nexa-v428-bug-refresh')){e.preventDefault();loadBugReports();return}
 if(b.matches('[data-save-bug]')){e.preventDefault();saveBugReport(b.closest('.nexa-v428-bug'));return}
 if(b.matches('[data-close-admin]'))setTimeout(()=>document.body.classList.remove('nexa-workspace-open'),30);
 if(b.matches('[data-nexa-profile],#nexa-profile-launcher,#nexa-profile-launcher-section')){[120,380].forEach(ms=>setTimeout(ensureProfileActions,ms))}
},true);

function add431Polish(){
 if($('#nexa-v431-polish'))return;
 const st=document.createElement('style');st.id='nexa-v431-polish';st.textContent=`
 #nexa-v430-transfer-card h2,#nexa-v429-transfer-card h2,#nexa-v431-transfer-card h2{font-size:clamp(1.35rem,5vw,1.7rem)!important;line-height:1.08!important;margin:4px 0 5px!important}
 #nexa-v430-transfer-card p,#nexa-v429-transfer-card p,#nexa-v431-transfer-card p{font-size:.96rem!important;line-height:1.35!important;margin:0!important}
 #nexa-v430-transfer-card,#nexa-v429-transfer-card,#nexa-v431-transfer-card{padding-top:16px!important;padding-bottom:16px!important}
 `;document.head.appendChild(st);
}
function boot(){
 forceFreshOwners();add431Polish();
 addCSS();normalizeIOSZoom();ensureStellar();ensureSignals();ensureProfileActions();polishMenu();homePass();refreshTransferOwner();initAdminURL();
 [350,950,1800,3200,5200].forEach(ms=>setTimeout(()=>{homePass();ensureProfileActions();polishMenu();if($('#admin-modal')?.classList.contains('open')){ensureAdminShell();if(currentAdmin==='alliances')decorateAlliancePassports()}},ms));
 let n=0;const homeTimer=setInterval(()=>{homePass();if(++n>=16)clearInterval(homeTimer)},250);
 // Legacy Home code may repaint cards later. Keep only the lightweight visual normalization alive; no DOM observer and no database polling here.
 setInterval(()=>{compactLive();compactTransfers();ensureSignals();hideBuild();applyTheme();ensureAdminManageAlliance();},1800);setInterval(refreshTransferOwner,30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('pageshow',()=>setTimeout(()=>{normalizeIOSZoom();homePass();refreshTransferOwner();ensureProfileActions()},80));
})();
