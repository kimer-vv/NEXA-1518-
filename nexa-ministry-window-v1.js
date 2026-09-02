/* NEXA MINISTRY WINDOW V3.0 — TEMPLATE-ONLY SECTION CLOSING / NO SVS DEPENDENCY */
(()=>{
'use strict';
if(window.__NEXA_MINISTRY_WINDOW_V30__)return;
window.__NEXA_MINISTRY_WINDOW_V30__=true;
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co',SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
const $=s=>document.querySelector(s);

function closeSection(key,label){
  const req=$(`#${key}-requested`),fields=$(`#${key}-fields`);if(!req)return;
  req.disabled=true;
  fields?.querySelectorAll('input,select,textarea,button').forEach(x=>x.disabled=true);
  const box=req.closest('.ms-section')||req.closest('section')||req.parentElement;
  if(box&&!box.querySelector('.nexa-ministry-closed')){
    const n=document.createElement('div');n.className='nexa-ministry-closed';
    n.style.cssText='margin-top:10px;color:#ff9bbd;font-size:12px;font-weight:850';
    n.textContent=`${label} sign-up is closed.`;
    box.appendChild(n);
  }
}
async function scheduleBase(){
  if(!sb)return null;
  const t=await sb.from('event_form_templates').select('settings').eq('event_type_key','ministry').maybeSingle();
  const manual=t.data?.settings?.ministry_schedule_start_at;
  if(!manual)return null;
  const ms=new Date(manual).getTime();
  return Number.isFinite(ms)?ms:null;
}
async function apply(){
  const base=await scheduleBase();if(!Number.isFinite(base))return;
  const now=Date.now();
  if(now>=base+1*86400000)closeSection('construction','Day 1 • Construction / VP');
  if(now>=base+2*86400000)closeSection('research','Day 2 • Research / VP');
  if(now>=base+4*86400000)closeSection('training','Day 4 • Training / MOE');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();