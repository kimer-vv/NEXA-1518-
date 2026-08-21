/* NEXA V27 — Administration Visual + Stability Layer
   Consolidated client-side polish. Keeps legacy modules intact and adds safe overlays.
*/
(()=>{
'use strict';
if(window.__NEXA_V27_POLISH__) return;
window.__NEXA_V27_POLISH__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let localSb=null, raf=0, lastAdminTab='alliances';
const clientErrors=[];
function sb(){
  if(window.supabaseClient?.from) return window.supabaseClient;
  if(window.sb?.from) return window.sb;
  if(!localSb && window.supabase?.createClient) localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
}
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}

/* --- iOS viewport stability --- */
function fixViewport(){
  let meta=document.querySelector('meta[name="viewport"]');
  if(!meta){meta=document.createElement('meta');meta.name='viewport';document.head.prepend(meta)}
  meta.content='width=device-width, initial-scale=1, viewport-fit=cover';
  document.documentElement.style.setProperty('--nexa-vh',`${window.visualViewport?.height||innerHeight}px`);
}
fixViewport();
window.visualViewport?.addEventListener('resize',fixViewport,{passive:true});

/* --- capture useful client errors for Bug Reports --- */
window.addEventListener('error',e=>{
  clientErrors.push({type:'error',message:String(e.message||''),file:String(e.filename||''),line:e.lineno||0,col:e.colno||0,time:new Date().toISOString()});
  if(clientErrors.length>12) clientErrors.shift();
});
window.addEventListener('unhandledrejection',e=>{
  clientErrors.push({type:'promise',message:String(e.reason?.message||e.reason||''),time:new Date().toISOString()});
  if(clientErrors.length>12) clientErrors.shift();
});

function addStyle(){
 if($('#nexa-v27-style'))return;
 const st=document.createElement('style');st.id='nexa-v27-style';st.textContent=`
 html,body{max-width:100%!important;overflow-x:hidden!important;-webkit-text-size-adjust:100%!important}
 body{width:100%!important;min-width:0!important}
 input,select,textarea{font-size:16px!important}
 [class*="auth"],[id*="auth"],.modal-card,.login-card{max-width:calc(100dvw - 24px)!important;box-sizing:border-box!important}
 .nexa-v27-hide{display:none!important}

 /* Administration is one full scrolling panel — no nested page scroll box. */
 #admin-modal.nexa-v25-admin{position:fixed!important;inset:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))!important;width:auto!important;max-width:none!important;height:auto!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;box-sizing:border-box!important;border:1px solid rgba(103,127,255,.44)!important;border-radius:24px!important;background:
   radial-gradient(circle at 12% 8%,rgba(68,125,255,.16),transparent 26%),
   radial-gradient(circle at 88% 26%,rgba(176,73,255,.13),transparent 28%),
   radial-gradient(circle at 55% 92%,rgba(39,204,255,.08),transparent 25%),
   linear-gradient(155deg,rgba(5,10,29,.985),rgba(2,5,18,.995))!important;
   box-shadow:0 0 0 1px rgba(122,86,255,.10),0 24px 70px rgba(0,0,0,.62),0 0 36px rgba(69,94,255,.14)!important;
   scrollbar-width:thin!important;
 }
 #admin-modal.nexa-v25-admin::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:24px;background-image:radial-gradient(circle,rgba(255,255,255,.65) 0 1px,transparent 1.4px),radial-gradient(circle,rgba(109,184,255,.5) 0 1px,transparent 1.4px);background-size:47px 47px,79px 79px;background-position:8px 11px,31px 24px;opacity:.10;z-index:0}
 #admin-modal.nexa-v25-admin>*{position:relative;z-index:1}
 #admin-modal.nexa-v25-admin .modal-content,#admin-modal.nexa-v25-admin .admin-content,#admin-modal.nexa-v25-admin #svs-admin-content,#admin-modal.nexa-v25-admin .nexa-v25-host{overflow:visible!important;max-height:none!important;height:auto!important}
 .nexa-v25-nav{position:static!important;top:auto!important;z-index:auto!important;margin-top:42px!important;padding:6px 0 12px!important;background:transparent!important;grid-template-columns:minmax(52px,1fr) minmax(0,auto) minmax(52px,1fr)!important}
 .nexa-v25-arrow{border-color:rgba(111,125,255,.58)!important;background:linear-gradient(145deg,rgba(31,27,75,.94),rgba(7,14,37,.96))!important;box-shadow:0 0 18px rgba(87,92,255,.18)!important}
 .nexa-v25-title{font-size:.98rem!important;text-shadow:0 0 12px rgba(154,139,255,.25)}
 .nexa-v27-admin-close{position:absolute;top:10px;right:10px;z-index:140;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,91,167,.52);background:rgba(32,7,31,.88);color:#ff86bd;font-size:21px;font-weight:900;display:grid;place-items:center;box-shadow:0 0 18px rgba(255,72,167,.18)}
 .nexa-v27-admin-menu-space{padding-left:0!important}
 .nexa-v27-info{width:31px;height:31px;border-radius:50%;border:1px solid rgba(75,207,255,.62);background:#071a34;color:#7ee6ff;font-weight:950;display:inline-grid;place-items:center;box-shadow:0 0 14px rgba(63,197,255,.16);margin-left:2px}
 .nexa-v25-help{box-shadow:0 0 13px rgba(69,200,255,.13)}
 .nexa-v25-toolbar{margin:8px 0 15px!important}
 .nexa-v25-add{background:radial-gradient(circle at 35% 30%,rgba(92,220,255,.18),rgba(7,17,42,.98))!important;box-shadow:0 0 18px rgba(68,202,255,.20),inset 0 0 14px rgba(78,89,255,.10)!important}
 .nexa-v25-refresh{border-color:rgba(93,111,255,.45)!important;background:linear-gradient(145deg,#11193c,#090e27)!important}
 .nexa-v25-planets{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:11px!important}
 .nexa-v25-alliance{min-width:0!important;border-color:color-mix(in srgb,var(--pc) 68%,transparent)!important;background:radial-gradient(circle at 50% 22%,color-mix(in srgb,var(--pc) 19%,transparent),rgba(5,8,24,.97) 60%)!important;box-shadow:0 0 25px color-mix(in srgb,var(--pc) 15%,transparent),inset 0 0 25px rgba(255,255,255,.015)!important}
 .nexa-v25-orbit{box-shadow:0 0 24px color-mix(in srgb,var(--pc) 52%,transparent),0 0 44px color-mix(in srgb,var(--pc) 18%,transparent),inset 0 0 22px color-mix(in srgb,var(--pc) 18%,transparent)!important}
 .nexa-v25-panel{border-color:rgba(109,104,255,.32)!important;background:radial-gradient(circle at 10% 0%,rgba(95,96,255,.09),transparent 34%),linear-gradient(145deg,rgba(12,18,48,.92),rgba(4,8,24,.96))!important;box-shadow:0 0 22px rgba(91,76,255,.07),inset 0 0 18px rgba(71,193,255,.025)!important}
 .nexa-v27-role-card{border-color:rgba(108,107,255,.55)!important;box-shadow:0 0 18px rgba(77,97,255,.12),inset 0 0 20px rgba(62,194,255,.035)!important}
 .nexa-v27-role-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(79,198,255,.34);border-radius:999px;padding:6px 9px;margin:3px;background:rgba(7,25,50,.78);color:#c9edff;font-size:.72rem;font-weight:850;box-shadow:0 0 11px rgba(64,192,255,.09)}
 .nexa-v27-role-chip::before{content:"";width:6px;height:6px;border-radius:50%;background:#64d9ff;box-shadow:0 0 9px #64d9ff}
 .nexa-v27-guide{position:fixed;inset:0;z-index:2147483647;background:rgba(0,2,13,.78);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px}
 .nexa-v27-guide-card{width:min(560px,100%);max-height:86dvh;overflow:auto;border:1px solid rgba(83,190,255,.43);border-radius:22px;padding:18px;background:radial-gradient(circle at 12% 0%,rgba(83,116,255,.15),transparent 34%),linear-gradient(155deg,#0d1535,#040817);box-shadow:0 25px 70px rgba(0,0,0,.62),0 0 28px rgba(64,126,255,.13);color:#fff}
 .nexa-v27-guide-card h3{margin:0 42px 8px 0}.nexa-v27-guide-card h4{margin:14px 0 4px;color:#9fe9ff}.nexa-v27-guide-card p,.nexa-v27-guide-card li{color:#aeb9d4;line-height:1.48;font-size:.9rem}.nexa-v27-guide-card ul{padding-left:20px}.nexa-v27-guide-x{float:right;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,112,170,.4);background:#210a23;color:#ff9ac2;font-weight:900}

 /* Troop art: intentional glowing hexagon, black background visually blended into space. */
 img[src*="nexa-troop-"]{padding:0!important;border-radius:0!important;clip-path:polygon(25% 5%,75% 5%,98% 50%,75% 95%,25% 95%,2% 50%)!important;object-fit:contain!important;object-position:center!important;mix-blend-mode:screen!important;filter:contrast(1.04) saturate(1.04) drop-shadow(0 0 6px rgba(83,207,255,.36)) drop-shadow(0 0 13px rgba(119,75,255,.24))!important;background:transparent!important}
 .nexa-v27-troop-hex{position:relative!important;border-radius:0!important;border:0!important;background:radial-gradient(circle,rgba(20,43,78,.55),rgba(4,8,25,.20) 62%,transparent 72%)!important;overflow:visible!important}
 .nexa-v27-troop-hex::before{content:"";position:absolute;inset:-4px;clip-path:polygon(25% 5%,75% 5%,98% 50%,75% 95%,25% 95%,2% 50%);background:linear-gradient(135deg,rgba(92,220,255,.95),rgba(99,85,255,.72),rgba(224,76,255,.62),rgba(92,220,255,.95));filter:blur(.2px) drop-shadow(0 0 8px rgba(92,210,255,.65)) drop-shadow(0 0 17px rgba(124,76,255,.36));z-index:-1;opacity:.72;pointer-events:none}
 .nexa-v27-troop-hex::after{content:"";position:absolute;inset:-1px;clip-path:polygon(25% 5%,75% 5%,98% 50%,75% 95%,25% 95%,2% 50%);background:#071126;z-index:-1;pointer-events:none}
 .nexa-v25-troop-orbit::before,.nexa-v25-troop-orbit::after{display:none!important}

 /* stronger Main glows */
 .nexa-v27-home-main{box-shadow:0 0 22px rgba(68,210,255,.25),0 0 52px rgba(91,76,255,.24),inset 0 0 22px rgba(76,153,255,.06)!important}
 .nexa-v27-home-main img,.nexa-v26-main{filter:drop-shadow(0 0 18px rgba(91,220,255,.98)) drop-shadow(0 0 38px rgba(94,106,255,.88)) drop-shadow(0 0 60px rgba(165,68,255,.55))!important}

 .nexa-v27-bug-button{border:1px solid rgba(86,202,255,.44);background:linear-gradient(145deg,#0b1938,#0a1028);color:#d9f7ff;border-radius:13px;padding:10px 12px;font-weight:850;box-shadow:0 0 14px rgba(58,190,255,.10)}
 .nexa-v27-bug-list{display:grid;gap:10px}.nexa-v27-bug-card{border:1px solid rgba(91,101,255,.34);border-radius:16px;padding:12px;background:rgba(7,12,31,.88)}
 .nexa-v27-bug-card strong{display:block}.nexa-v27-bug-meta{color:#8fa0c8;font-size:.76rem;margin:4px 0}.nexa-v27-bug-diag{margin-top:8px;padding:9px;border-radius:11px;background:rgba(7,26,45,.78);border:1px solid rgba(71,188,255,.20);color:#b9dff1;font-size:.8rem;line-height:1.4}


 .nexa-v27-library-tools{display:flex;align-items:center;gap:8px;margin:2px 0 10px}.nexa-v27-library-tools .spacer{flex:1}.nexa-v27-library-x{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,91,167,.48);background:#21091f;color:#ff91bf;font-weight:900;font-size:19px}.nexa-v27-libmenu{position:fixed;inset:0;z-index:2147483646;background:rgba(0,2,13,.58);backdrop-filter:blur(5px);display:flex;align-items:flex-start;justify-content:center;padding:max(60px,env(safe-area-inset-top)) 14px 14px}.nexa-v27-libmenu-card{width:min(420px,100%);border:1px solid rgba(92,130,255,.42);border-radius:20px;padding:14px;background:linear-gradient(155deg,#0d1535,#040817);box-shadow:0 24px 70px rgba(0,0,0,.62)}.nexa-v27-libmenu-card a,.nexa-v27-libmenu-card button{display:block;width:100%;box-sizing:border-box;text-align:left;margin:7px 0;padding:11px 12px;border-radius:12px;border:1px solid rgba(117,105,255,.28);background:#0b1230;color:#fff;text-decoration:none;font-weight:850}
 @media(max-width:430px){
  #admin-modal.nexa-v25-admin{inset:max(6px,env(safe-area-inset-top)) 6px max(6px,env(safe-area-inset-bottom))!important;border-radius:20px!important}
  .nexa-v25-nav{margin-top:40px!important;gap:5px!important}.nexa-v25-title{font-size:.88rem!important;gap:4px!important}.nexa-v25-arrow{min-width:46px!important;padding:8px 9px!important}
  .nexa-v25-planets{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.nexa-v25-alliance{padding:11px 6px 10px!important}.nexa-v25-orbit{width:80px!important;height:80px!important}.nexa-v25-emblem{width:61px!important;height:61px!important}
  .nexa-v25-chip{font-size:.58rem!important;padding:4px 5px!important}.nexa-v25-tag{font-size:.96rem!important}
 }
 `;document.head.appendChild(st);
}

/* --- Home identity: query Main once and prevent legacy rerenders from stripping it --- */
let homeIdentity=null,homeBusy=false;
async function loadHomeIdentity(){
 if(homeBusy)return;homeBusy=true;
 try{
  const c=sb();if(!c)return;
  const {data:{session}}=await c.auth.getSession();if(!session)return;
  const {data:rows,error}=await c.from('player_accounts').select('id,in_game_name,player_id,is_main,alliance_id,custom_alliance_tag').eq('user_id',session.user.id).order('created_at');
  if(error||!rows?.length)return;
  const main=rows.find(x=>x.is_main)||rows[0];let tag=main.custom_alliance_tag||'';
  if(main.alliance_id){const {data:a}=await c.from('alliances').select('tag').eq('id',main.alliance_id).maybeSingle();tag=a?.tag||tag}
  homeIdentity={name:main.in_game_name||'Player',gameId:main.player_id||'',tag:tag||'',count:rows.length};
  patchHome();
 }catch(e){console.warn('NEXA V27 identity',e)}finally{homeBusy=false}
}
function patchHome(){
 if(!homeIdentity)return;
 const {name,gameId,tag,count}=homeIdentity;
 const exact=`${String(name).toUpperCase()}${tag?' • '+String(tag).toUpperCase():''}${gameId?' • ID '+gameId:''}`;
 // Remove deprecated subtitle fragment and debug build labels.
 $$('body *').forEach(el=>{
  if(el.children.length===0){const t=(el.textContent||'').trim();if(/^STATE\s+1518\b/i.test(t))el.classList.add('nexa-v27-hide');if(/^NEXA BUILD\b/i.test(t))el.classList.add('nexa-v27-hide')}
 });
 // Find compact Main card candidates and fix the smallest useful one.
 const candidates=$$('div,section,article,button').filter(el=>visible(el)&&/\bMAIN\b/i.test(el.textContent||'')&&new RegExp(name,'i').test(el.textContent||'')&&el.getBoundingClientRect().height<260);
 candidates.sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height);
 const card=candidates[0];if(!card)return;
 card.classList.add('nexa-v27-home-main');
 const leaves=$$('*',card).filter(x=>x.children.length===0);
 const nameLeaf=leaves.find(x=>new RegExp(`^${String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`,'i').test((x.textContent||'').trim()))||leaves.find(x=>new RegExp(name,'i').test(x.textContent||'')&&!/MAIN/i.test(x.textContent||''));
 if(nameLeaf) nameLeaf.textContent=exact;
 leaves.forEach(x=>{const t=(x.textContent||'').trim();if(/^\+?\d+\/?5?$/.test(t)||/^\d+\/5$/.test(t)){if(/\/5$/.test(t)||/^\+\d+$/.test(t))x.textContent=`${count}/5`}});
 const img=$('img',card);if(img)img.classList.add('nexa-v27-home-main-img');
}

/* --- preserve horizontal chip-row position (Gen 10 etc.) --- */
const rowScroll=new WeakMap();
function isHorizontalRow(el){if(!el||el===document.body)return false;const s=getComputedStyle(el);return ['auto','scroll'].includes(s.overflowX)&&el.scrollWidth>el.clientWidth+8}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button,[role="button"]');if(!b)return;let p=b.parentElement;for(let i=0;i<4&&p;i++,p=p.parentElement){if(isHorizontalRow(p)){rowScroll.set(p,p.scrollLeft);p.dataset.nexaV27Scroll=String(p.scrollLeft);break}}},{capture:true,passive:true});
function restoreRows(){
 $$('[data-nexa-v27-scroll]').forEach(row=>{const v=Number(row.dataset.nexaV27Scroll);if(Number.isFinite(v)&&Math.abs(row.scrollLeft-v)>4)row.scrollLeft=v});
}

/* --- Troop visual decoration WITHOUT a global MutationObserver loop. --- */
function decorateTroops(root=document){
 root.querySelectorAll?.('img[src*="nexa-troop-"]').forEach(img=>img.parentElement?.classList.add('nexa-v27-troop-hex'));
}
document.addEventListener('click',e=>{if(e.target.closest('button,[role="button"],select'))setTimeout(()=>decorateTroops(),80)},{passive:true});

/* --- contextual help --- */
const GUIDES={
 alliances:{title:'Alliances',html:`<p>This page is the alliance command view. Use it to review each alliance, its status, emblem, members and Alliance Access Code.</p><h4>What you can do</h4><ul><li><b>Add Alliance:</b> creates an alliance; NEXA assigns its color and Access Code.</li><li><b>Alliance Passport:</b> open a planet to manage its identity and members.</li><li><b>Access Code:</b> members use it when requesting to join/change alliance. It does not grant NEXA roles.</li><li><b>Emblems:</b> one exclusive emblem per alliance; occupied emblems cannot be selected elsewhere.</li></ul><h4>Example</h4><p>If a member is moving from FSU to BBC, the alliance process is separate from their Operational Role or Module Access.</p>`},
 access:{title:'NEXA Access',html:`<p>This is the editing page for special NEXA permissions.</p><h4>Operational Roles</h4><ul><li><b>Battle Strategist:</b> battle/rally strategy, formations and tactical coordination.</li><li><b>Event Operator:</b> operates event workflows, forms and active-event controls.</li><li><b>Scheduler:</b> coordinates time slots, availability and scheduling workflows.</li><li><b>Transfer Coordinator:</b> handles transfer applications and transfer workflow.</li></ul><h4>Module Access</h4><p>Module Access controls what restricted modules a person can open. Operational Roles describe their job; they do <b>not</b> automatically grant modules.</p><h4>How to use</h4><p>Search a player by name or Game ID, open their ficha, assign the needed Operational Role(s), then separately choose the Module Access they actually require.</p>`},
 roles:{title:'Roles',html:`<p>This page is a <b>visual dashboard</b>. It shows who currently has Operational Roles and their access summary. You do not assign roles here.</p><h4>Three different concepts</h4><ul><li><b>Alliance Rank:</b> R5/R4/R3/R2/R1. Managed from Alliance Passport.</li><li><b>Operational Role:</b> the person's work function in NEXA.</li><li><b>Module Access:</b> the restricted NEXA areas they are allowed to open.</li></ul><p>To change Operational Roles or Module Access, tap <b>Manage Access</b> and NEXA takes you to that player in NEXA Access.</p>`},
 system:{title:'System Operations',html:`<p>Owner/Admin technical controls live here.</p><h4>Maintenance</h4><p>Use Maintenance Mode only when you need to block normal access while working on NEXA. Owner bypass should be verified before relying on it.</p><h4>Testing / Recovery</h4><p>Use these tools for controlled testing and emergency recovery. Avoid changing settings that you do not need for the current task.</p><h4>Bug Reports</h4><p>Bug Reports collect user descriptions, screenshots and automatic technical context. NEXA triages the issue and prepares a diagnostic; it never edits production code by itself.</p>`},
 library:{title:'Library',html:`<p>The Library is NEXA's master catalog for Heroes, Experts, Pets, Troops, Chief Gear and Charms.</p><p>Admin visibility settings decide what players can see. A generation may be loaded in the database while still hidden from players.</p><h4>Tip</h4><p>Use the generation and category controls to verify content before exposing it. Library settings and a player's personal inventory are different things.</p>`}
};
function showGuide(key){const g=GUIDES[key]||GUIDES.system;const ov=document.createElement('div');ov.className='nexa-v27-guide';ov.innerHTML=`<div class="nexa-v27-guide-card"><button class="nexa-v27-guide-x" aria-label="Close">×</button><h3>${esc(g.title)} · Quick Guide</h3>${g.html}</div>`;document.body.appendChild(ov);ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.nexa-v27-guide-x'))ov.remove()})}

/* --- Admin structural polish + Roles read-only dashboard --- */
function currentAdminKey(){
 const active=$('#admin-modal .admin-section.nexa-v25-active');
 const id=active?.id||'';if(id.includes('alliances'))return'alliances';if(id.includes('permissions'))return'access';if(id.includes('roles'))return'roles';if(id.includes('system'))return'system';return lastAdminTab;
}
function closeAdmin(){
 const modal=$('#admin-modal');if(!modal)return;
 const existing=$$('button',modal).find(b=>/^(×|close)$/i.test((b.textContent||'').trim())&&!b.classList.contains('nexa-v27-admin-close'));
 if(existing){existing.click();return}
 modal.style.display='none';modal.classList.remove('active','open','show');
}
function patchRolesReadOnly(){
 const sec=$('#admin-roles');if(!sec)return;
 $$('.nexa-v25-panel',sec).forEach((panel,i)=>{if(i>0)panel.classList.add('nexa-v27-role-card')});
 $$('.nexa-v25-checks',sec).forEach(box=>{
  if(box.dataset.v27Readonly)return;box.dataset.v27Readonly='1';
  const labels=$$('label',box);const chips=labels.filter(l=>$('input',l)?.checked).map(l=>`<span class="nexa-v27-role-chip">${esc((l.textContent||'').trim())}</span>`).join('');
  box.innerHTML=chips||'<span class="nexa-v25-muted">No Operational Roles assigned</span>';
 });
 // Remove any role-edit/save control from this visual dashboard; Manage Access remains.
 $$('button',sec).forEach(b=>{const t=(b.textContent||'').trim();if(/save role|assign role|update role/i.test(t))b.remove()});
}
function patchAdmin(){
 const modal=$('#admin-modal');if(!modal||!visible(modal))return;
 modal.classList.add('nexa-v25-admin');
 if(!$('.nexa-v27-admin-close',modal)){
   const x=document.createElement('button');x.type='button';x.className='nexa-v27-admin-close';x.textContent='×';x.title='Close Administration';x.addEventListener('click',closeAdmin);modal.prepend(x);
 }
 const nav=$('.nexa-v25-nav',modal);if(nav){
   const key=currentAdminKey();lastAdminTab=key;
   const title=$('.nexa-v25-title',nav);
   if(title&&!$('.nexa-v27-info',title)){const info=document.createElement('button');info.type='button';info.className='nexa-v27-info';info.innerHTML='i';info.title='About this page';info.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showGuide(currentAdminKey())});title.appendChild(info)}
 }
 patchRolesReadOnly();
 addBugReportsToSystem();
}


function patchLibraryShell(){
 if(!/library\.html$/i.test(location.pathname))return;
 const shell=$('.lib-shell');if(!shell||$('.nexa-v27-library-tools',shell))return;
 const tools=document.createElement('div');tools.className='nexa-v27-library-tools';tools.innerHTML='<button class="nexa-v27-bug-button" data-v27-libmenu>MENU</button><button class="nexa-v27-info" data-v27-libinfo>i</button><span class="spacer"></span><button class="nexa-v27-library-x" data-v27-libclose>×</button>';shell.prepend(tools);
 tools.addEventListener('click',e=>{
  if(e.target.closest('[data-v27-libinfo]')){showGuide('library');return}
  if(e.target.closest('[data-v27-libclose]')){location.href='index.html?admin=administration&tab=alliances';return}
  if(e.target.closest('[data-v27-libmenu]'))openLibraryMenu();
 });
}
function openLibraryMenu(){
 const ov=document.createElement('div');ov.className='nexa-v27-libmenu';ov.innerHTML='<div class="nexa-v27-libmenu-card"><b>NEXA Menu</b><a href="index.html">Home</a><a href="index.html?admin=administration&tab=alliances">Administration · Alliances</a><a href="index.html?admin=administration&tab=permissions">Administration · NEXA Access</a><a href="index.html?admin=administration&tab=roles">Administration · Roles</a><a href="index.html?admin=administration&tab=system">Administration · System Operations</a><button type="button" data-v27-libbug>Report a Bug</button><button type="button" data-v27-libcancel>Close Menu</button></div>';document.body.appendChild(ov);
 ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-v27-libcancel]'))ov.remove();if(e.target.closest('[data-v27-libbug]')){ov.remove();openBugReport()}});
}

/* --- Bug Report form --- */
async function openBugReport(){
 const c=sb();if(!c)return alert('NEXA is still connecting.');
 const ov=document.createElement('div');ov.className='nexa-v27-guide';
 ov.innerHTML=`<form class="nexa-v27-guide-card" id="nexa-v27-bug-form"><button type="button" class="nexa-v27-guide-x">×</button><h3>Report a Bug</h3><p>Describe what happened. NEXA automatically adds the page, device, viewport and recent client errors so the Owner receives a developer-ready diagnostic.</p>
 <label>Area / Module<input id="v27-bug-module" placeholder="Example: Profile → Troops" style="width:100%;box-sizing:border-box;margin:5px 0 10px;padding:11px;border-radius:11px;border:1px solid #2b3c6f;background:#081126;color:#fff"></label>
 <label>What happened?<textarea id="v27-bug-desc" required rows="4" placeholder="Tell us exactly what you tapped and what went wrong." style="width:100%;box-sizing:border-box;margin:5px 0 10px;padding:11px;border-radius:11px;border:1px solid #2b3c6f;background:#081126;color:#fff"></textarea></label>
 <label>What did you expect?<textarea id="v27-bug-expected" rows="2" style="width:100%;box-sizing:border-box;margin:5px 0 10px;padding:11px;border-radius:11px;border:1px solid #2b3c6f;background:#081126;color:#fff"></textarea></label>
 <label>Screenshot(s)<input id="v27-bug-shots" type="file" accept="image/png,image/jpeg,image/webp" multiple style="width:100%;margin:7px 0 10px"></label>
 <div id="v27-bug-status" class="nexa-v25-muted"></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button type="button" class="nexa-v25-btn" data-v27-cancel>Cancel</button><button class="nexa-v27-bug-button" type="submit">Send Bug Report</button></div></form>`;
 document.body.appendChild(ov);
 ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.nexa-v27-guide-x,[data-v27-cancel]'))ov.remove()});
 const form=$('#nexa-v27-bug-form',ov),status=$('#v27-bug-status',ov);
 form.addEventListener('submit',async e=>{
   e.preventDefault();status.textContent='Preparing diagnostic…';
   try{
    const {data:{session}}=await c.auth.getSession();if(!session)throw new Error('Please sign in first.');
    const paths=[];const files=Array.from($('#v27-bug-shots',ov).files||[]).slice(0,5);
    const tempId=(crypto.randomUUID?.()||String(Date.now()));
    for(const f of files){const safe=f.name.replace(/[^a-zA-Z0-9._-]+/g,'_');const path=`${session.user.id}/${tempId}/${Date.now()}-${safe}`;const {error}=await c.storage.from('nexa-bug-reports').upload(path,f,{upsert:false});if(error)throw error;paths.push(path)}
    const build=$$('body *').find(x=>x.children.length===0&&/^NEXA BUILD\b/i.test((x.textContent||'').trim()))?.textContent?.trim()||'';
    const args={p_module:$('#v27-bug-module',ov).value||'General',p_description:$('#v27-bug-desc',ov).value,p_expected_behavior:$('#v27-bug-expected',ov).value||null,p_actual_behavior:$('#v27-bug-desc',ov).value,p_page_path:location.pathname+location.search,p_build_label:build,p_user_agent:navigator.userAgent,p_viewport:`${Math.round(innerWidth)}x${Math.round(window.visualViewport?.height||innerHeight)} @${devicePixelRatio||1}x`,p_client_errors:clientErrors.slice(-8),p_screenshot_paths:paths};
    const {data,error}=await c.rpc('nexa_submit_bug_report',args);if(error)throw error;
    status.textContent=`Sent. Report ${String(data).slice(0,8)} is now in System Operations.`;setTimeout(()=>ov.remove(),1300);
   }catch(err){status.textContent=`Could not send: ${err.message||err}`}
 });
}

function installBugEntry(){
 if($('#nexa-v27-home-bug'))return;
 const heading=$$('body *').find(el=>el.children.length===0&&visible(el)&&/^QUICK ACTIONS$/i.test((el.textContent||'').trim()));
 if(!heading)return;
 const scope=heading.parentElement; if(!scope)return;
 const b=document.createElement('button');b.id='nexa-v27-home-bug';b.type='button';b.className='nexa-v27-bug-button';b.textContent='Report a Bug';b.style.cssText='width:100%;margin-top:8px';b.addEventListener('click',openBugReport);scope.appendChild(b);
}
function augmentMenu(){
 const menuButtons=$$('button').filter(b=>visible(b)&&/^MENU$/i.test((b.textContent||'').trim()));
 for(const mb of menuButtons){
   const panel=mb.getAttribute('aria-controls')?document.getElementById(mb.getAttribute('aria-controls')):null;
   const scope=panel||mb.parentElement?.parentElement;
   if(!scope||$('.nexa-v27-menu-bug',scope))continue;
   const many=$$('button,a',scope).filter(visible);if(many.length<3)continue;
   const b=document.createElement('button');b.type='button';b.className='nexa-v27-bug-button nexa-v27-menu-bug';b.textContent='Report a Bug';b.addEventListener('click',openBugReport);scope.appendChild(b);
 }
}

async function bugRows(){const c=sb();if(!c)return[];const {data,error}=await c.rpc('nexa_list_bug_reports');if(error)throw error;return data||[]}
async function signedShot(path){const c=sb();if(!c)return null;const {data,error}=await c.storage.from('nexa-bug-reports').createSignedUrl(path,900);return error?null:data?.signedUrl}
function addBugReportsToSystem(){
 const sec=$('#admin-system');if(!sec)return;const host=$('.nexa-v25-host',sec)||sec;
 if($('#nexa-v27-bug-admin',host))return;
 const wrap=document.createElement('div');wrap.id='nexa-v27-bug-admin';wrap.className='nexa-v25-panel';wrap.innerHTML=`<h3>Bug Reports</h3><div class="nexa-v25-muted">User reports are auto-triaged with technical context. NEXA analyzes and prepares the issue; it does not change production code automatically.</div><div class="nexa-v25-buttons"><button class="nexa-v27-bug-button" data-v27-load-bugs>Open Bug Reports</button><button class="nexa-v25-btn" data-v27-bug-help>i</button></div><div class="nexa-v27-bug-list" data-v27-bug-list></div>`;host.prepend(wrap);
 wrap.addEventListener('click',async e=>{
  if(e.target.closest('[data-v27-bug-help]')){showGuide('system');return}
  if(e.target.closest('[data-v27-load-bugs]')){
   const list=$('[data-v27-bug-list]',wrap);list.innerHTML='<div class="nexa-v25-muted">Loading reports…</div>';
   try{const rows=await bugRows();list.innerHTML=rows.length?'':'<div class="nexa-v25-muted">No bug reports yet.</div>';for(const r of rows){const card=document.createElement('article');card.className='nexa-v27-bug-card';card.innerHTML=`<strong>${esc(r.module||'General')} · ${esc(String(r.severity||'untriaged').toUpperCase())}</strong><div class="nexa-v27-bug-meta">${esc(r.reporter_name||'Player')} · ID ${esc(r.game_id||'—')} · ${esc(r.alliance_tag||'—')} · ${new Date(r.created_at).toLocaleString()}${Number(r.duplicate_count)>1?` · ${r.duplicate_count} similar reports`:''}</div><div>${esc(r.description||'')}</div><div class="nexa-v27-bug-diag"><b>Auto diagnostic</b><br>${esc(r.diagnostic_summary||'No diagnostic')}<br><br><b>Likely cause</b><br>${esc(r.likely_cause||'Not identified')}<br><br><b>Suggested review</b><br>${esc(r.suggested_review||'')}</div><div class="nexa-v25-buttons"><button class="nexa-v25-btn" data-v27-copy-diag>Copy Diagnostic</button>${r.screenshot_paths?.length?'<button class="nexa-v25-btn" data-v27-shots>Screenshot(s)</button>':''}</div>`;
      card.querySelector('[data-v27-copy-diag]')?.addEventListener('click',()=>{const txt=`NEXA BUG REPORT\nArea: ${r.module||'General'}\nSeverity: ${r.severity}\nReporter: ${r.reporter_name||'Player'} · ID ${r.game_id||'—'}\nPage: ${r.page_path||'—'}\nViewport: ${r.viewport||'—'}\nIssue: ${r.description||''}\nExpected: ${r.expected_behavior||''}\nAuto diagnostic: ${r.diagnostic_summary||''}\nLikely cause: ${r.likely_cause||''}\nReproduction: ${r.reproduction_steps||''}\nSuggested review: ${r.suggested_review||''}\nClient errors: ${JSON.stringify(r.client_errors||[])}`;navigator.clipboard?.writeText(txt)});
      card.querySelector('[data-v27-shots]')?.addEventListener('click',async()=>{for(const p of r.screenshot_paths||[]){const u=await signedShot(p);if(u)window.open(u,'_blank','noopener')}});list.appendChild(card)}
   }catch(err){list.innerHTML=`<div class="nexa-v25-muted">${esc(err.message||err)}</div>`}
  }
 });
}

/* close MENU by tapping outside without navigating */
document.addEventListener('pointerdown',e=>{
 const visibleMenuButtons=$$('button').filter(b=>visible(b)&&/^MENU$/i.test((b.textContent||'').trim()));
 for(const mb of visibleMenuButtons){const panel=mb.getAttribute('aria-controls')?document.getElementById(mb.getAttribute('aria-controls')):null;if(panel&&visible(panel)&&!panel.contains(e.target)&&!mb.contains(e.target)){mb.click();break}}
},{capture:true,passive:true});

function cycle(){
 addStyle();installBugEntry();patchLibraryShell();patchHome();patchAdmin();decorateTroops();restoreRows();augmentMenu();
 // hide technical labels that may be recreated later
 $$('body *').forEach(el=>{if(el.children.length===0&&/^NEXA BUILD\b/i.test((el.textContent||'').trim()))el.classList.add('nexa-v27-hide')});
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;cycle()})}
function boot(){addStyle();installBugEntry();loadHomeIdentity();cycle();
 const obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{patchHome();patchAdmin()},3000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
