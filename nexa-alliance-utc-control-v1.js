   /* NEXA ALLIANCE UTC CONTROL V1.0 — 24-HOUR UTC EVENT SLOTS */
    (()=>{
    'use strict';
    if(window.__NEXA_ALLIANCE_UTC_V1__)return;window.__NEXA_ALLIANCE_UTC_V1__=true;
    function enhance(){
     document.querySelectorAll('#scheduleHost input[type="time"][data-time]').forEach(inp=>{
      if(inp.dataset.utcEnhanced)return; inp.dataset.utcEnhanced='1';
      const value=inp.value||'', [vh='00',vm='00']=value.split(':');
      const wrap=document.createElement('div');wrap.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px';
      const h=document.createElement('select'),m=document.createElement('select');h.className=m.className='ma-select';
      h.innerHTML=Array.from({length:24},(_,i)=>{const x=String(i).padStart(2,'0');return `<option ${x===vh?'selected':''}>${x}</option>`}).join('');
      m.innerHTML=['00','15','30','45'].map(x=>`<option ${x===vm?'selected':''}>${x}</option>`).join('');
      const sync=()=>{inp.value=`${h.value}:${m.value}`;inp.dispatchEvent(new Event('input',{bubbles:true}))};
      h.onchange=sync;m.onchange=sync;wrap.append(h,m);inp.style.display='none';inp.after(wrap);
      const tag=document.createElement('small');tag.textContent='UTC · 24-hour';tag.style.cssText='color:#8deeff;font-weight:900';wrap.after(tag);
     });
    }
    document.addEventListener('click',()=>setTimeout(enhance,40));
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,80));else setTimeout(enhance,80);
    })();
