/* NEXA PULSE FORMS V1.0 — PUBLISHED FORMS + DEADLINE STATUS */
(()=>{
'use strict';
if(window.__NEXA_PULSE_FORMS_V1__)return;
window.__NEXA_PULSE_FORMS_V1__=true;
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
const LABEL={svs:'SvS Battle Sign-Up',fdt:'FDT Sign-Up',tal:'TAL Sign-Up',ministry:'Ministry Sign-Up'};
const URLS={svs:'battle-form.html?internal=1',fdt:'fdt-form.html?internal=1',tal:'tal-form.html?internal=1',ministry:'ministry-signup.html?internal=1'};
function deadline(s){
 if(!s?.deadline_enabled||!s?.deadline_at)return {text:'Open',cls:'open'};
 const ms=new Date(s.deadline_at)-Date.now();
 if(ms<=0)return {text:'Closed',cls:'closed'};
 const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60;
 return {text:d?`${d}d ${h}h`:`${h}h ${m}m`,cls:ms<=86400000?'red':ms<=4*86400000?'yellow':'green'};
}
function css(){
 if(document.getElementById('nexa-pulse-forms-css'))return;
 const s=document.createElement('style');s.id='nexa-pulse-forms-css';s.textContent=`
 #nexa-pulse-published-forms{display:grid;gap:7px;margin-top:9px}
 .nexa-pulse-form-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 10px;border:1px solid rgba(57,223,255,.16);border-radius:11px;background:rgba(4,18,36,.44);text-decoration:none;color:#eefbff}
 .nexa-pulse-form-row b{font-size:11px;line-height:1.25}.nexa-pulse-deadline{font-size:9px;font-weight:950;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.13);white-space:nowrap}
 .nexa-pulse-deadline.open,.nexa-pulse-deadline.green{color:#8affcb;border-color:rgba(84,240,181,.32)}
 .nexa-pulse-deadline.yellow{color:#ffe28a;border-color:rgba(255,215,94,.32)}
 .nexa-pulse-deadline.red,.nexa-pulse-deadline.closed{color:#ff9aad;border-color:rgba(255,90,120,.34)}
 `;document.head.appendChild(s);
}
async function boot(){
 if(!sb)return;
 const host=document.querySelector('#nexa-v302-pulse');
 if(!host)return;
 css();
 const {data,error}=await sb.from('event_form_templates').select('event_type_key,settings').in('event_type_key',['svs','fdt','tal','ministry']);
 if(error)return;
 const rows=(data||[]).filter(x=>x.settings?.published_to_nexa===true);
 let box=document.getElementById('nexa-pulse-published-forms');
 if(!box){box=document.createElement('div');box.id='nexa-pulse-published-forms';host.appendChild(box)}
 box.innerHTML=rows.map(x=>{const d=deadline(x.settings);return `<a class="nexa-pulse-form-row" href="${URLS[x.event_type_key]||'#'}"><b>${LABEL[x.event_type_key]||x.event_type_key}</b><span class="nexa-pulse-deadline ${d.cls}">${d.text}</span></a>`}).join('');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
