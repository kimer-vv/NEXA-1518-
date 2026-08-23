/* NEXA V41 — REVIEW FIXES
   Consolidates the visual/functional fixes found during the V40 live review.
   Safe overlay: no schema migration, no troop artwork integration, no Charms changes.
*/
(()=>{'use strict';
if(window.__NEXA_V41__) return; window.__NEXA_V41__=true;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
let userInteracted=false;
['pointerdown','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,()=>{userInteracted=true},{once:true,passive:true}));

function css(){
 if($('#nexa-v41-css')) return;
 const s=document.createElement('style'); s.id='nexa-v41-css';
 s.textContent=`
/* Home + menu */
#nexa-home-menu{width:min(470px,calc(100vw - 42px))!important;max-width:calc(100vw - 42px)!important}
#nexa-v40-stellar{border:0!important;background:transparent!important;box-shadow:none!important;padding:6px 8px 10px!important}

/* Profile owns ONE vertical scroll; child content cannot create a second page-width surface. */
#nexa-profile-modal{overflow:hidden!important;padding:6px!important}
#nexa-profile-modal .nexa-profile-sheet{width:min(680px,calc(100vw - 12px))!important;max-width:calc(100vw - 12px)!important;max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
#nexa-profile-modal .nexa-profile-hero,#nexa-profile-modal .nexa-profile-content{max-width:100%!important;min-width:0!important;overflow-x:hidden!important}
#nexa-profile-modal form,#nexa-profile-modal fieldset,#nexa-profile-modal [class*="form" i],#nexa-profile-modal [class*="editor" i],#nexa-profile-modal [class*="panel" i]{max-width:100%!important;min-width:0!important}
#nexa-profile-modal input,#nexa-profile-modal select,#nexa-profile-modal textarea{max-width:100%!important;min-width:0!important}
#nexa-profile-modal label,#nexa-profile-modal p,#nexa-profile-modal small{overflow-wrap:anywhere!important}

/* Horizontal rails: user position wins; no snap-back. */
#nexa-profile-modal .nexa-profile-tabs,
#nexa-profile-modal [class*="generation" i],
#nexa-profile-modal [class*="gen-tabs" i],
#nexa-profile-modal [class*="gen-row" i],
#nexa-profile-modal [class*="filter-row" i]{overflow-x:auto!important;overflow-y:hidden!important;scroll-behavior:auto!important;scroll-snap-type:none!important;overscroll-behavior-x:contain!important;touch-action:pan-x!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}
#nexa-profile-modal .nexa-profile-tabs>*,#nexa-profile-modal [class*="generation" i]>*,#nexa-profile-modal [class*="gen-tabs" i]>*,#nexa-profile-modal [class*="gen-row" i]>*,#nexa-profile-modal [class*="filter-row" i]>*{flex:0 0 auto!important}

/* Expanded library/item editors stay in flow and never sit over Deployment Capacity. */
#nexa-profile-modal [class*="detail" i],#nexa-profile-modal [class*="expanded" i],#nexa-profile-modal [class*="drawer" i],#nexa-profile-modal [class*="skill-panel" i],#nexa-profile-modal [class*="widget" i]{max-width:100%!important;min-width:0!important}
#nexa-profile-modal [class*="item-detail" i],#nexa-profile-modal [class*="hero-detail" i],#nexa-profile-modal [class*="expert-detail" i],#nexa-profile-modal [class*="pet-detail" i]{position:relative!important;inset:auto!important;transform:none!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important}

/* Edit Profile mobile overflow */
@media(max-width:700px){
 #nexa-profile-modal [class*="edit" i] [class*="grid" i],
 #nexa-profile-modal [class*="profile-form" i],
 #nexa-profile-modal [class*="account-form" i]{grid-template-columns:minmax(0,1fr)!important;width:100%!important}
 #nexa-profile-modal [class*="edit" i]>*{max-width:100%!important;min-width:0!important}
}

/* My Alliance */
#nexa-v40-alliance-hub{overflow-x:hidden!important}
.nexa-v40-hub-tabs{width:100%!important;max-width:100%!important;overflow-x:auto!important;overscroll-behavior-x:contain!important;-webkit-overflow-scrolling:touch!important;padding-right:12px!important}
.nexa-v40-hub-tabs button{flex:0 0 auto!important}
#nexa-v40-hub-body,.nexa-v40-member{max-width:100%!important;min-width:0!important}

/* Administration is one clean full-screen surface. */
#admin-modal.open{overflow:hidden!important}
#admin-modal .admin-modal-card{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;border-radius:0!important;border:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
#admin-modal .admin-modal-card>*{max-width:100%!important;min-width:0!important}
#admin-modal .nexa-guide-general + .nexa-guide-context{display:none!important}

/* Remove duplicate/stray info controls created beside an existing Guide. */
.nexa-v41-hide{display:none!important}
`;
 document.head.appendChild(s);
}

function removeDuplicateStellar(root=document){
 const v40=$('#nexa-v40-stellar',root);
 if(!v40) return;
 $$('section,div,article',root).forEach(el=>{
   if(el===v40 || v40.contains(el) || el.contains(v40)) return;
   const t=text(el);
   if(/STELLAR SIGNAL/i.test(t) && /Chart the course|Move together|Adjust with the stars/i.test(t)){
     el.classList.add('nexa-v41-hide');
   }
 });
}

function stabilizeRails(root=document){
 const rails=$$('#nexa-profile-modal .nexa-profile-tabs,#nexa-profile-modal [class*="generation" i],#nexa-profile-modal [class*="gen-tabs" i],#nexa-profile-modal [class*="gen-row" i],#nexa-profile-modal [class*="filter-row" i]',root);
 rails.forEach(r=>{
   if(r.dataset.nexa41Rail) return; r.dataset.nexa41Rail='1';
   let last=0,active=false;
   const save=()=>{last=r.scrollLeft; active=true;};
   r.addEventListener('scroll',save,{passive:true});
   r.addEventListener('touchstart',()=>{active=true},{passive:true});
   r.addEventListener('touchend',()=>{last=r.scrollLeft; setTimeout(()=>{r.scrollLeft=last;active=false},160)},{passive:true});
   new MutationObserver(()=>{if(active) requestAnimationFrame(()=>{r.scrollLeft=last})}).observe(r,{childList:true,subtree:false});
 });
}

function cleanAdminGuides(root=document){
 const modal=$('#admin-modal',root); if(!modal) return;
 // One pink general Guide for the surface; one gold contextual Guide per section maximum.
 const generals=$$('.nexa-guide-general',modal); generals.slice(1).forEach(g=>{
   if(g.closest('#nexa-v40-guidebox')) return;
   const p=g.parentElement;
   if(p && p.querySelector('.nexa-guide-general')!==g) g.remove();
 });
 $$('h1,h2,h3,strong',modal).forEach(h=>{
   const p=h.parentElement;if(!p)return;
   const gold=$$('.nexa-guide-context',p); gold.slice(1).forEach(x=>x.remove());
 });
}

function closeAllianceAutoOpen(){
 // Safari reload must return to the page, not resurrect the Alliances admin modal.
 if(userInteracted || performance.now()>3500) return;
 const modal=$('#admin-modal'); if(!modal || !modal.classList.contains('open')) return;
 const t=text(modal);
 if(!/\bAlliances\b/i.test(t)) return;
 const close=$('[data-close-admin],.modal-close,button[aria-label*="close" i]',modal);
 if(close){ close.click(); return; }
 modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
}

function patchGenerationDialog(doc=document){
 // Library is sometimes native and sometimes loaded same-origin inside Administration.
 $$('div,section,article',doc).forEach(box=>{
   const t=text(box);
   if(!/GEN\s*0\s*[•·-]\s*Unlocked/i.test(t)) return;
   if(!/generation becomes visible|Review only\. No changes will be made/i.test(t)) return;
   let gen='';
   const source=[...doc.querySelectorAll('button,[data-generation],[data-gen],select option:checked')].find(el=>{
     const n=(el.dataset?.generation||el.dataset?.gen||text(el)).match(/(?:GEN\s*)?(1[0-2]|[1-9])\b/i);
     if(n){gen=n[1];return true} return false;
   });
   if(source){ const m=(source.dataset?.generation||source.dataset?.gen||text(source)).match(/(?:GEN\s*)?(1[0-2]|[1-9])\b/i);gen=m?.[1]||''; }
   const heading=[...box.querySelectorAll('h1,h2,h3,strong,b')].find(x=>/GEN\s*0/i.test(text(x)));
   if(heading && gen) heading.textContent=`GEN ${gen} • Unlocked`;
   // A review-only dialog must never imply a mutation occurred.
   [...box.querySelectorAll('p,div,strong,b')].forEach(el=>{
     if(text(el)==='The generation becomes visible to every player immediately.') el.textContent='This generation is currently visible to players.';
   });
 });
}

function patchFrames(){
 $$('iframe').forEach(f=>{
   try{ const d=f.contentDocument;if(d){patchGenerationDialog(d); removeDuplicateStellar(d);} }catch(_){ }
 });
}

function run(){
 css(); removeDuplicateStellar(); stabilizeRails(); cleanAdminGuides(); closeAllianceAutoOpen(); patchGenerationDialog(); patchFrames();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,350);setTimeout(run,1200);setTimeout(run,2600)},{once:true});
else{run();setTimeout(run,350);setTimeout(run,1200);setTimeout(run,2600)}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('pageshow',()=>{userInteracted=false;setTimeout(closeAllianceAutoOpen,50)});
})();
