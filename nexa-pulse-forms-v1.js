/* NEXA PULSE FORMS V2.0 — HOME FORMS SIGNAL / PUBLISHED FORMS / DEADLINE COLORS */
(()=>{
'use strict';
if(window.__NEXA_PULSE_FORMS_V20__)return;
window.__NEXA_PULSE_FORMS_V20__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
if(!sb)return;

const META={
  svs:{title:'Battle Sign-Up',url:'battle-form.html?public=1',sub:''},
  fdt:{title:'FDT Sign-Up',url:'fdt-form.html?public=1',sub:''},
  tal:{title:'TAL Sign-Up',url:'tal-form.html?public=1',sub:'7 Rounds'},
  ministry:{title:'Ministry Sign-Up',url:'ministry-signup.html?internal=1',sub:'Construction · Research · Training'}
};
function deadline(settings){
  if(!settings?.deadline_enabled||!settings?.deadline_at){
    return {label:'OPEN',detail:'Open',tone:'green'};
  }
  const ms=new Date(settings.deadline_at).getTime()-Date.now();
  if(!Number.isFinite(ms))return {label:'OPEN',detail:'Open',tone:'green'};
  if(ms<=0)return {label:'CLOSED',detail:'Deadline passed',tone:'red'};

  const days=Math.floor(ms/86400000);
  const hours=Math.floor(ms/3600000)%24;
  const mins=Math.floor(ms/60000)%60;
  const detail=days>0?`Deadline · ${days}D ${hours}H`:`Deadline · ${hours}H ${mins}M`;

  // Fresh = green. Approaching = yellow. Final day / final hours = red.
  if(ms<=86400000)return {label:'OPEN',detail,tone:'red'};
  if(ms<=4*86400000)return {label:'OPEN',detail,tone:'yellow'};
  return {label:'OPEN',detail,tone:'green'};
}

function installCSS(){
  if(document.getElementById('nexa-pulse-forms-v20-css'))return;
  const s=document.createElement('style');
  s.id='nexa-pulse-forms-v20-css';
  s.textContent=`
    #nexa-pulse-published-forms{display:grid;gap:9px;margin-top:10px;width:100%;min-width:0}
    .nexa-pulse-form-card{display:grid;gap:8px;padding:11px 12px;border:1px solid rgba(57,223,255,.18);border-radius:14px;background:rgba(4,18,36,.46);min-width:0}
    .nexa-pulse-form-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
    .nexa-pulse-form-copy{display:grid;gap:3px;min-width:0}
    .nexa-pulse-form-copy b{font-size:12px;line-height:1.25;color:#f5fbff}
    .nexa-pulse-form-copy small{font-size:9px;line-height:1.35;color:#9faccb;font-weight:800}
    .nexa-pulse-status{flex:0 0 auto;font-size:8px;font-weight:950;letter-spacing:.08em;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.12)}
    .nexa-pulse-status.green{color:#8affcb;border-color:rgba(84,240,181,.38);background:rgba(22,92,72,.17)}
    .nexa-pulse-status.yellow{color:#ffe28a;border-color:rgba(255,215,94,.40);background:rgba(111,82,10,.15)}
    .nexa-pulse-status.red{color:#ff9aad;border-color:rgba(255,90,120,.43);background:rgba(109,24,45,.16)}
    .nexa-pulse-deadline-line{font-size:10px;font-weight:900}
    .nexa-pulse-deadline-line.green{color:#8affcb}.nexa-pulse-deadline-line.yellow{color:#ffe28a}.nexa-pulse-deadline-line.red{color:#ff9aad}
    .nexa-pulse-form-action{display:flex;align-items:center;justify-content:center;width:100%;min-height:38px;padding:8px 11px;border:1px solid rgba(75,213,231,.48);border-radius:11px;background:linear-gradient(135deg,rgba(19,104,111,.72),rgba(32,75,118,.78) 54%,rgba(61,49,139,.76));color:#fff;text-decoration:none;font-size:10px;font-weight:950;letter-spacing:.02em}
    .nexa-pulse-empty{font-size:10px;color:#8d99b8;padding:7px 1px}
  `;
  document.head.appendChild(s);
}

function getHost(){
  return document.querySelector('#nexa-v302-pulse') ||
         document.querySelector('[data-nexa-tech="pulse"]') ||
         document.querySelector('#nexa-pulse-card');
}

function ensureBox(host){
  let box=document.getElementById('nexa-pulse-published-forms');
  if(!box){
    box=document.createElement('div');
    box.id='nexa-pulse-published-forms';
    host.appendChild(box);
  }else if(box.parentElement!==host){
    host.appendChild(box);
  }
  return box;
}

function titleFor(key,settings){
  return META[key]?.title || settings?.form_title || settings?.title || `${String(key||'Form').toUpperCase()} Form`;
}
function urlFor(key,settings){
  return META[key]?.url || settings?.public_url || settings?.form_url || 'forms-center.html';
}
function subFor(key,settings){
  return META[key]?.sub || settings?.pulse_subtitle || '';
}

async function renderPublishedForms(){
  const host=getHost();
  if(!host)return false;
  installCSS();
  const box=ensureBox(host);

  const {data,error}=await sb.from('event_form_templates').select('event_type_key,settings');
  if(error){
    box.innerHTML='<div class="nexa-pulse-empty">Forms could not be loaded.</div>';
    return true;
  }

  const rows=(data||[]).filter(x=>x?.settings?.published_to_nexa===true && x?.settings?.public_access_removed!==true);
  if(!rows.length){
    box.innerHTML='';
    return true;
  }

  box.innerHTML=rows.map(x=>{
    const key=x.event_type_key;
    const st=x.settings||{};
    const d=deadline(st);
    const title=titleFor(key,st);
    const sub=subFor(key,st);
    const url=urlFor(key,st);
    const action=d.label==='CLOSED'?'View Form':'Start Form';
    return `<div class="nexa-pulse-form-card" data-form-key="${String(key||'').replace(/"/g,'&quot;')}">
      <div class="nexa-pulse-form-head">
        <div class="nexa-pulse-form-copy"><b>${title}</b>${sub?`<small>${sub}</small>`:''}</div>
        <span class="nexa-pulse-status ${d.tone}">${d.label}</span>
      </div>
      <div class="nexa-pulse-deadline-line ${d.tone}">${d.detail}</div>
      <a class="nexa-pulse-form-action" href="${url}">${action}</a>
    </div>`;
  }).join('');
  return true;
}

async function boot(){
  // Home signal cards are created by the Home visual owner after initial HTML parsing.
  // Use a short bounded retry instead of MutationObserver.
  for(let i=0;i<40;i++){
    if(await renderPublishedForms())return;
    await new Promise(r=>setTimeout(r,250));
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

// Refresh after returning to Home from a form, and keep deadline colors current.
window.addEventListener('pageshow',()=>renderPublishedForms());
setInterval(()=>renderPublishedForms(),60000);
})();
