(() => {
'use strict';

function mount(){
  if(document.getElementById('nexa-live-clock-v6')) return;

  const box=document.createElement('div');
  box.id='nexa-live-clock-v6';

  Object.assign(box.style,{
    position:'absolute',
    left:'50%',
    transform:'translateX(-50%)',
    zIndex:'55',
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'18px',
    width:'164px',
    pointerEvents:'none',
    fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    fontVariantNumeric:'tabular-nums',
    textAlign:'center',
    filter:'drop-shadow(0 0 8px rgba(92,104,255,.14))'
  });

  function side(label,color){
    const w=document.createElement('div');
    Object.assign(w.style,{display:'flex',flexDirection:'column',alignItems:'center'});

    const t=document.createElement('div');
    t.textContent=label;
    Object.assign(t.style,{
      color:'rgba(160,168,202,.72)',
      fontSize:'7px',
      fontWeight:'900',
      letterSpacing:'.18em',
      lineHeight:'1'
    });

    const v=document.createElement('div');
    Object.assign(v.style,{
      color,
      fontSize:'9px',
      fontWeight:'900',
      letterSpacing:'.015em',
      lineHeight:'1.2',
      marginTop:'3px',
      whiteSpace:'nowrap',
      textShadow:`0 0 10px ${color}40`
    });

    w.append(t,v);
    return {w,v};
  }

  const utc=side('UTC','#b79cff');
  const local=side('LOCAL','#71d8ff');
  box.append(utc.w,local.w);
  document.body.appendChild(box);

  function positionClock(){
    const header=document.querySelector('header.topbar');
    if(!header) return;
    const rect=header.getBoundingClientRect();
    box.style.top=(window.scrollY + rect.bottom + 15)+'px';
  }

  function tick(){
    const n=new Date();
    utc.v.textContent=n.toLocaleTimeString('en-GB',{
      timeZone:'UTC',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'
    });
    local.v.textContent=n.toLocaleTimeString([],{
      hour:'2-digit',minute:'2-digit',second:'2-digit'
    });
  }

  tick();
  positionClock();
  setInterval(tick,1000);
  window.addEventListener('resize',positionClock);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',mount,{once:true});
}else mount();
})();