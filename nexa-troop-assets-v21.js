/* NEXA V27 — TIER-SPECIFIC TROOP ART + consolidated stability loader */
window.NEXA_TROOP_PORTRAITS={"infantry":{"t1":"/nexa-troop-infantry-t1.webp","t2":"/nexa-troop-infantry-t2.webp","t3":"/nexa-troop-infantry-t3.webp","t4":"/nexa-troop-infantry-t4.webp","t5":"/nexa-troop-infantry-t5.webp","t6":"/nexa-troop-infantry-t6.webp","t7":"/nexa-troop-infantry-t7.webp","t8":"/nexa-troop-infantry-t8.webp","t9":"/nexa-troop-infantry-t9.webp","t10":"/nexa-troop-infantry-t10.webp","t11":"/nexa-troop-infantry-t11.webp","t12":"/nexa-troop-infantry-t12.webp"},"lancer":{"t1":"/nexa-troop-lancer-t1.webp","t2":"/nexa-troop-lancer-t2.webp","t3":"/nexa-troop-lancer-t3.webp","t4":"/nexa-troop-lancer-t4.webp","t5":"/nexa-troop-lancer-t5.webp","t6":"/nexa-troop-lancer-t6.webp","t7":"/nexa-troop-lancer-t7.webp","t8":"/nexa-troop-lancer-t8.webp","t9":"/nexa-troop-lancer-t9.webp","t10":"/nexa-troop-lancer-t10.webp","t11":"/nexa-troop-lancer-t11.webp","t12":"/nexa-troop-lancer-t12.webp"},"marksman":{"t1":"/nexa-troop-marksman-t1.webp","t2":"/nexa-troop-marksman-t2.webp","t3":"/nexa-troop-marksman-t3.webp","t4":"/nexa-troop-marksman-t4.webp","t5":"/nexa-troop-marksman-t5.webp","t6":"/nexa-troop-marksman-t6.webp","t7":"/nexa-troop-marksman-t7.webp","t8":"/nexa-troop-marksman-t8.webp","t9":"/nexa-troop-marksman-t9.webp","t10":"/nexa-troop-marksman-t10.webp","t11":"/nexa-troop-marksman-t11.webp","t12":"/nexa-troop-marksman-t12.webp"}};

/* V26 used a document-wide MutationObserver that repeatedly rescanned every troop image.
   V27 intentionally removes that observer to prevent Profile > Troops from lagging/freezing. */
(()=>{
 'use strict';
 if(window.__NEXA_V27_LOADER__)return;window.__NEXA_V27_LOADER__=true;
 const load=()=>{
   if(document.querySelector('script[data-nexa-v27-polish]'))return;
   const s=document.createElement('script');s.src='/nexa-v27-admin-polish.js?v=27';s.defer=true;s.dataset.nexaV27Polish='1';document.head.appendChild(s);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
