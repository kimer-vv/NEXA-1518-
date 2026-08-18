(() => {
'use strict';

function mount(){
  if(document.getElementById('nexa-live-clock-v7')) return;

  const box=document.createElement('div');
  box.id='nexa-live-clock-v7';

  Object.assign(box.style,{
    position:'absolute',
    left:'50%',
    transform:'translateX(-50%)',
    zIndex:'55',
    display:'grid',
    gridTemplateColumns:'1fr auto 1fr',
    alignItems:'center',
    gap:'10px',
    width:'178px',
    pointerEvents:'none',
    fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    fontVariantNumeric:'tabular-nums',
    textAlign:'center'
  });

  function side(label,color){
    const w=document.createElement('div');
    Object.assign(w.style,{
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      minWidth:'72px'
    });

    const t=document.createElement('div');
    t.textContent=label;
    Object.assign(t.style,{
      color:'rgba(158,166,198,.72)',
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
      letterSpacing:'.01em',
      lineHeight:'1.2',
      marginTop:'3px',
      whiteSpace:'nowrap',
      textShadow:`0 0 9px ${color}35`
    });

    w.append(t,v);
    return {w,v};
  }

  const utc=side('UTC','#b79cff');
  const local=side('LOCAL','#71d8ff');

  const divider=document.createElement('div');
  Object.assign(divider.style,{
    width:'1px',
    height:'16px',
    background:'linear-gradient(to bottom,transparent,rgba(160,170,215,.45),transparent)'
  });

  box.append(utc.w,divider,local.w);
  document.body.appendChild(box);

  function positionClock(){
    const header=document.querySelector('header.topbar');
    if(!header) return;
    const rect=header.getBoundingClientRect();
    // Float just outside the header, centered directly over the large NEXA wordmark.
    box.style.top=(window.scrollY + rect.bottom + 12)+'px';
  }

  function tick(){
    const n=new Date();

    utc.v.textContent=n.toLocaleTimeString('en-GB',{
      timeZone:'UTC',
      hour12:false,
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });

    local.v.textContent=n.toLocaleTimeString([],{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });
  }

  tick();
  positionClock();
  setInterval(tick,1000);
  window.addEventListener('resize',positionClock);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',mount,{once:true});
}else{
  mount();
}
})();