/* NEXA V26 — TIER-SPECIFIC TROOP ART
   Exact replacement for nexa-troop-assets-v21.js.
   Uses only the user-approved Infantry/Lancer/Marksman T1-T12 files.
*/
window.NEXA_TROOP_PORTRAITS={"infantry":{"t1":"/nexa-troop-infantry-t1.webp","t2":"/nexa-troop-infantry-t2.webp","t3":"/nexa-troop-infantry-t3.webp","t4":"/nexa-troop-infantry-t4.webp","t5":"/nexa-troop-infantry-t5.webp","t6":"/nexa-troop-infantry-t6.webp","t7":"/nexa-troop-infantry-t7.webp","t8":"/nexa-troop-infantry-t8.webp","t9":"/nexa-troop-infantry-t9.webp","t10":"/nexa-troop-infantry-t10.webp","t11":"/nexa-troop-infantry-t11.webp","t12":"/nexa-troop-infantry-t12.webp"},"lancer":{"t1":"/nexa-troop-lancer-t1.webp","t2":"/nexa-troop-lancer-t2.webp","t3":"/nexa-troop-lancer-t3.webp","t4":"/nexa-troop-lancer-t4.webp","t5":"/nexa-troop-lancer-t5.webp","t6":"/nexa-troop-lancer-t6.webp","t7":"/nexa-troop-lancer-t7.webp","t8":"/nexa-troop-lancer-t8.webp","t9":"/nexa-troop-lancer-t9.webp","t10":"/nexa-troop-lancer-t10.webp","t11":"/nexa-troop-lancer-t11.webp","t12":"/nexa-troop-lancer-t12.webp"},"marksman":{"t1":"/nexa-troop-marksman-t1.webp","t2":"/nexa-troop-marksman-t2.webp","t3":"/nexa-troop-marksman-t3.webp","t4":"/nexa-troop-marksman-t4.webp","t5":"/nexa-troop-marksman-t5.webp","t6":"/nexa-troop-marksman-t6.webp","t7":"/nexa-troop-marksman-t7.webp","t8":"/nexa-troop-marksman-t8.webp","t9":"/nexa-troop-marksman-t9.webp","t10":"/nexa-troop-marksman-t10.webp","t11":"/nexa-troop-marksman-t11.webp","t12":"/nexa-troop-marksman-t12.webp"}};

(function(){
  'use strict';
  if(window.__NEXA_V25_TROOP_STYLE__) return;
  window.__NEXA_V25_TROOP_STYLE__=true;

  const style=document.createElement('style');
  style.id='nexa-v25-troop-style';
  style.textContent=`
    img[src*="nexa-troop-"]{
      object-fit:contain!important;
      object-position:center!important;
      transform:none!important;
      border-radius:0!important;
      padding:4%!important;
      box-sizing:border-box!important;
      filter:drop-shadow(0 0 8px rgba(119,102,255,.32)) drop-shadow(0 0 13px rgba(63,200,255,.13));
    }
    .nexa-v25-troop-orbit{
      position:relative!important;
      overflow:visible!important;
      isolation:isolate!important;
    }
    .nexa-v25-troop-orbit::before{
      content:"";
      position:absolute;
      inset:-5px;
      border-radius:50%;
      border:1px dashed rgba(105,210,255,.34);
      box-shadow:0 0 15px rgba(99,195,255,.17),inset 0 0 14px rgba(119,77,255,.08);
      pointer-events:none;
      animation:nexaV25TroopOrbit 11s linear infinite;
      z-index:-1;
    }
    .nexa-v25-troop-orbit::after{
      content:"";
      position:absolute;
      width:5px;height:5px;border-radius:50%;
      right:3px;top:13%;
      background:#78dcff;
      box-shadow:0 0 10px #78dcff,0 0 18px rgba(137,91,255,.7);
      pointer-events:none;
    }
    @keyframes nexaV25TroopOrbit{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(style);

  function decorate(root=document){
    root.querySelectorAll?.('img[src*="nexa-troop-"]').forEach(img=>{
      const parent=img.parentElement;
      if(parent) parent.classList.add('nexa-v25-troop-orbit');
    });
  }
  function boot(){
    decorate();
    const obs=new MutationObserver(muts=>{
      let added=false;
      for(const m of muts) if(m.addedNodes?.length){added=true;break}
      if(added) requestAnimationFrame(()=>decorate());
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
