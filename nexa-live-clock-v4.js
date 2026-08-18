(() => {
'use strict';
function mount(){
  if(document.getElementById('nexa-live-clock-v4')) return;
  const box=document.createElement('div');
  box.id='nexa-live-clock-v4';
  Object.assign(box.style,{
    position:'fixed',
    top:'48px',
    left:'50%',
    transform:'translateX(-50%)',
    zIndex:'2147483000',
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'16px',
    width:'170px',
    pointerEvents:'none',
    fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    fontVariantNumeric:'tabular-nums',
    textAlign:'center'
  });
  function side(label,color){
    const w=document.createElement('div');
    const t=document.createElement('div');
    const v=document.createElement('div');
    t.textContent=label;
    Object.assign(t.style,{color:'rgba(151,160,196,.76)',fontSize:'8px',fontWeight:'900',letterSpacing:'.20em',lineHeight:'1'});
    Object.assign(v.style,{color,fontSize:'10px',fontWeight:'900',letterSpacing:'.02em',lineHeight:'1.25',marginTop:'3px',whiteSpace:'nowrap',textShadow:`0 0 10px ${color}35`});
    w.append(t,v); return {w,v};
  }
  const u=side('UTC','#b79cff'), l=side('LOCAL','#71d8ff');
  box.append(u.w,l.w); document.body.appendChild(box);
  function tick(){
    const n=new Date();
    u.v.textContent=n.toLocaleTimeString('en-GB',{timeZone:'UTC',hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
    l.v.textContent=n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  tick(); setInterval(tick,1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();