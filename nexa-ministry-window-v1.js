/* NEXA MINISTRY WINDOW V2.1 — TEMPLATE SCHEDULE UTC SECTION CLOSING / EVENT FALLBACK */
(()=>{
'use strict';
if(window.__NEXA_MINISTRY_WINDOW_V21__)return;
window.__NEXA_MINISTRY_WINDOW_V21__=true;
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
 const t=await sb.from('event_form_templates').select('settings').eq('event_type_key','ministry').maybeSingle();
 const manual=t.data?.settings?.ministry_schedule_start_at;
 if(manual){
   const ms=new Date(manual).getTime();
   if(Number.isFinite(ms))return ms;
 }
 const ev=await sb.from('svs_events').select('prep_monday,status').in('status',['live','upcoming']).order('prep_monday',{ascending:true}).limit(1).maybeSingle();
 if(!ev.data?.prep_monday)return null;
 return Date.parse(ev.data.prep_monday+'T00:00:00Z');
}
async function apply(){
 if(!sb)return;
 const base=await scheduleBase();if(!Number.isFinite(base))return;
 const now=Date.now();
 if(now>=base+1*86400000)closeSection('construction','Day 1 • Construction / VP');
 if(now>=base+2*86400000)closeSection('research','Day 2 • Research / VP');
 if(now>=base+4*86400000)closeSection('training','Day 4 • Training / MOE');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();