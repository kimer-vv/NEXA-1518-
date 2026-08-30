/* NEXA FORMS CENTER ROUTING V1.0 — INTERNAL OPEN / PUBLIC COPY */
    (()=>{
    'use strict';
    function fix(){
     document.querySelectorAll('.card').forEach(card=>{
      const open=[...card.querySelectorAll('a')].find(a=>a.textContent.trim()==='Open Form');
      const copy=card.querySelector('[data-copy]');
      if(open){
       const u=new URL(open.getAttribute('href'),location.href);u.searchParams.delete('public');u.searchParams.set('internal','1');open.href=u.pathname+u.search;
      }
      if(copy){
       const u=new URL(copy.dataset.copy,location.href);u.searchParams.delete('internal');u.searchParams.set('public','1');copy.dataset.copy=u.pathname+u.search;
      }
     });
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(fix,50));else setTimeout(fix,50);
    })();
