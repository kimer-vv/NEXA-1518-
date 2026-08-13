
(function(){
 const L=()=>NEXA_I18N.device();
 const tr=(k)=>NEXA_I18N.t(L(),k);
 const MAP={
  "LIVE":"live","View Event":"viewEvent","Apply":"apply","Apply →":"apply",
  "View Prep":"viewPrep","Fill Prep":"fillPrep","Claim Account":"claimAccount",
  "State Assignments":"stateAssignments","Puzzle & Presidency":"puzzlePresidency",
  "Transfers":"transfers","TRANSFER":"transfers","Back Home":"backHome",
  "My Submissions":"mySubmissions","Admin":"admin"
 };
 function walk(){
   document.querySelectorAll("a,button,.badge,.pill,.eyebrow,.nav-link").forEach(el=>{
     const raw=(el.textContent||"").trim();
     if(MAP[raw] && !el.dataset.nexaUiI18n){
       el.textContent=tr(MAP[raw]) + (raw.endsWith("→")?" →":"");
       el.dataset.nexaUiI18n="1";
     }
   });
   // Dynamic "SvS against ####" text.
   document.querySelectorAll("h1,h2,h3,p,div,span").forEach(el=>{
     if(el.children.length) return;
     const s=(el.textContent||"").trim();
     const m=s.match(/^SvS against\s+(.+)$/i);
     if(m && !el.dataset.nexaUiI18n){
       el.textContent=tr("svsAgainst").replace("{state}",m[1]);
       el.dataset.nexaUiI18n="1";
     }
   });
 }
 document.addEventListener("DOMContentLoaded",()=>{
   NEXA_I18N.setDir(L()); walk();
   new MutationObserver(walk).observe(document.body,{childList:true,subtree:true});
 });
})();
