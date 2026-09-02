/* NEXA FORM RUNTIME V4.3 — WIDE UNIFIED FORMS / NATIVE DEADLINE SUPPORT / MINISTRY SCHEDULE */
(()=>{
'use strict';
if(window.__NEXA_FORM_RUNTIME_V43__) return;
window.__NEXA_FORM_RUNTIME_V43__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
const q=new URLSearchParams(location.search);
const path=location.pathname.toLowerCase();
const publicMode=q.get('public')==='1';
const internalMode=q.get('internal')==='1';
const isSettings=path.includes('settings');
const eventKey=path.includes('tal-')?'tal':path.includes('fdt-')?'fdt':path.includes('battle-')?'svs':path.includes('ministry')?'ministry':'';
const deadlineKey=['svs','fdt','tal'].includes(eventKey);
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function addGlobalCSS(){
 if($('#nexa-runtime-v4-css'))return;
 const s=document.createElement('style');s.id='nexa-runtime-v4-css';
 s.textContent=`
 .nexa-deadline-v3{width:calc(100% - 18px)!important;max-width:702px!important;margin:16px 0 16px 18px!important;padding:18px!important;box-sizing:border-box!important;border:1px solid rgba(72,221,255,.34)!important;border-radius:20px!important;background:rgba(7,16,35,.78)!important;overflow:hidden!important}
 .nexa-deadline-v3 h3{margin:0 0 8px!important;font-size:1.35rem!important}.nexa-deadline-v3 p{margin:0 0 16px!important;line-height:1.45!important;color:#aeb7d1!important}
 .nexa-deadline-enable{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 16px!important;font-weight:900!important}
 .nexa-deadline-enable input{width:24px!important;height:24px!important;min-height:24px!important;flex:0 0 24px!important;accent-color:#54f0b5!important}
 .nexa-deadline-date{display:grid!important;gap:7px!important;margin:0 0 14px!important}.nexa-deadline-time-title{font-size:.92rem!important;font-weight:950!important;color:#dbe3ff!important;margin:0 0 8px!important}
 .nexa-deadline-time{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}.nexa-deadline-v3 label{min-width:0!important}
 .nexa-deadline-v3 input[type=date],.nexa-deadline-v3 select{display:block!important;width:100%!important;min-width:0!important;min-inline-size:0!important;max-width:100%!important;min-height:48px!important;padding:10px 12px!important;box-sizing:border-box!important;overflow:hidden!important;border-radius:13px!important;background:#081126!important;color:#fff!important;font-size:16px!important;border:1px solid rgba(119,142,210,.32)!important}
 .nexa-deadline-utc{margin:10px 0 8px!important;color:#8fefff!important;font-weight:950!important}.nexa-deadline-note{font-size:12px!important;line-height:1.45!important;color:#9ca9c9!important}
 .nexa-public-deadline{width:calc(100% - 18px)!important;max-width:702px!important;margin:12px 18px 16px!important;padding:13px 15px!important;box-sizing:border-box!important;border:1px solid rgba(72,221,255,.28)!important;border-radius:15px!important;background:rgba(8,18,38,.78)!important;line-height:1.4!important;font-weight:850!important}
 body.nexa-tal-page .head,body.nexa-tal-page .panel-head{display:block!important;position:static!important;width:calc(100% - 36px)!important;max-width:none!important;margin:18px 0 20px 18px!important;padding:0!important;text-align:left!important;columns:auto!important;column-count:1!important}
 body.nexa-tal-page .head>* ,body.nexa-tal-page .panel-head>*{display:block!important;float:none!important;position:static!important;width:auto!important;max-width:100%!important;margin-left:0!important;margin-right:0!important;transform:none!important;text-align:left!important}
 body.nexa-tal-page .head h1,body.nexa-tal-page .panel-head h1{font-size:clamp(2rem,8vw,3rem)!important;line-height:1.04!important;margin:7px 0!important}
 body.nexa-tal-page .card{width:calc(100% - 18px)!important;max-width:calc(100% - 18px)!important;box-sizing:border-box!important;overflow:hidden!important}
 body.nexa-tal-page input[type=date]{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
 body.nexa-tal-page .slots{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important;min-width:0!important;overflow:hidden!important}
 body.nexa-tal-page .slots.hidden{display:none!important}
 body.nexa-tal-page .slots label{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;width:100%!important;min-width:0!important;margin:0!important;padding:10px 12px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:12px!important;box-sizing:border-box!important}
 body.nexa-tal-page .slots label input{width:23px!important;height:23px!important;min-width:23px!important;flex:0 0 23px!important;margin:0!important}
 .nexa-confirm-backdrop{position:fixed;inset:0;z-index:2147483200;background:rgba(0,0,0,.76);display:grid;place-items:center;padding:18px}
 .nexa-confirm-card{width:min(460px,100%);padding:20px;border:1px solid rgba(72,221,255,.34);border-radius:20px;background:#091126;color:#fff;box-shadow:0 22px 70px rgba(0,0,0,.5)}
 .nexa-confirm-card h3{margin:0 0 10px}.nexa-confirm-main{font-weight:950;color:#8fefff;font-size:17px;margin:10px 0}.nexa-confirm-local{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);color:#d6dcef;margin:10px 0 14px}
 .nexa-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.nexa-confirm-actions button{min-height:46px;border-radius:13px;border:1px solid rgba(72,221,255,.34);background:linear-gradient(135deg,rgba(19,104,111,.82),rgba(61,49,139,.78));color:#fff;font-weight:950}.nexa-confirm-actions .cancel{background:rgba(255,255,255,.05)}
 @media(max-width:560px){.nexa-deadline-time{grid-template-columns:1fr 1fr!important}}

 /* One visual family for every Edit Form */
 body:has(.setting-card) .setting-card,
 body:has(.setting-card) .battle-grid,
 body:has(.setting-card) .form-actions,
 body:has(.fdt-head) .card,
 body:has(.head) main.sh>.card,
 body:has(.ms-hero) .ms-card,
 body:has(.ms-hero) main.ms-shell>.actions{
   width:calc(100% - 18px)!important;
   max-width:702px!important;
   margin-left:18px!important;
   margin-right:0!important;
   box-sizing:border-box!important;
 }
 body:has(.setting-card) .battle-grid .setting-card{width:100%!important;max-width:100%!important;margin-left:0!important;margin-right:0!important}
 body:has(.setting-card) .setting-card,
 body:has(.fdt-head) .card,
 body:has(.head) main.sh>.card,
 body:has(.ms-hero) .ms-card{
   padding:18px!important;
   border-radius:20px!important;
   border:1px solid rgba(72,221,255,.20)!important;
   background:rgba(8,16,35,.68)!important;
   overflow:hidden!important;
 }
 body:has(.fdt-head) .shell,body:has(.panel-head) .shell,body:has(.head) .sh,body:has(.ms-hero) .ms-shell{max-width:720px!important;margin:0 auto!important;padding-left:16px!important;padding-right:16px!important}
 body:has(.setting-card) input,body:has(.setting-card) select,body:has(.setting-card) textarea,
 body:has(.fdt-head) input,body:has(.fdt-head) select,body:has(.fdt-head) textarea,
 body:has(.head) main.sh input,body:has(.head) main.sh select,body:has(.head) main.sh textarea,
 body:has(.ms-hero) input,body:has(.ms-hero) select,body:has(.ms-hero) textarea{
   width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;
   min-height:48px!important;padding:10px 12px!important;border-radius:13px!important;
   background:#081126!important;color:#fff!important;border:1px solid rgba(119,142,210,.32)!important;font-size:16px!important;color-scheme:dark!important;
 }
 body:has(.setting-card) input[type=date],body:has(.fdt-head) input[type=date],body:has(.head) main.sh input[type=date],body:has(.ms-hero) input[type=date]{
   display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;min-inline-size:0!important;padding:10px 12px!important;
 }
 .nexa-unified-time-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important}
 .nexa-unified-date{display:grid!important;gap:7px!important;margin-bottom:14px!important}
 .nexa-unified-time-grid label{display:grid!important;gap:7px!important;min-width:0!important}
 @media(max-width:560px){
   body:has(.setting-card) .setting-card,body:has(.setting-card) .battle-grid,body:has(.setting-card) .form-actions,
   body:has(.fdt-head) .card,body:has(.head) main.sh>.card,body:has(.ms-hero) .ms-card,body:has(.ms-hero) main.ms-shell>.actions{
     width:calc(100% - 18px)!important;max-width:calc(100% - 18px)!important;margin-left:18px!important;margin-right:0!important;
   }
 }

 `;
 document.head.appendChild(s);
}
function markPage(){if(path.includes('tal-'))document.body.classList.add('nexa-tal-page')}
function hidePublicNavigation(){if(!publicMode&&!internalMode)return;$$('a.back,.back,.ms-back,.ma-back,[href*="forms-center"],[href="index.html"]').forEach(x=>x.style.display='none')}
function fixGuestNotices(){
 if(!path.includes('fdt-form'))return;
 const copy='Your In-Game Name, Game ID, Alliance Tag and saved response can be reopened and edited on this browser while the form remains open. Guest access expires when the Form Deadline closes. The next event requires a new Guest entry unless you use NEXA.';
 $$('.guest-warning').forEach(el=>el.innerHTML=`<b>Guest Information Notice:</b> ${copy}`);
}
function formsCenterRouting(){
 if(!path.includes('forms-center'))return;
 document.addEventListener('click',async e=>{
   const open=e.target.closest('a');
   if(open&&open.textContent.trim()==='Open Form'){e.preventDefault();const u=new URL(open.getAttribute('href'),location.href);u.searchParams.delete('public');u.searchParams.delete('direct');u.searchParams.set('internal','1');location.href=u.pathname+u.search;return}
   const copy=e.target.closest('[data-copy]');
   if(copy&&!copy.disabled){e.preventDefault();e.stopImmediatePropagation();const u=new URL(copy.dataset.copy,location.href);u.searchParams.delete('internal');u.searchParams.delete('direct');u.searchParams.set('public','1');try{await navigator.clipboard.writeText(u.href);const st=copy.closest('.card')?.querySelector('.status');if(st)st.textContent='Public link copied ✓'}catch{}}
 },true);
}
async function template(){
 if(!sb||!eventKey)return null;
 const {data}=await sb.from('event_form_templates').select('id,event_type_key,settings,updated_at').eq('event_type_key',eventKey).maybeSingle();
 return data||null;
}
function fmtUTC(iso){const d=new Date(iso);return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} · ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')} UTC`}
function localReference(iso){try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso))}catch{return new Date(iso).toLocaleString()}}
function openDeadline(s){return !(s?.deadline_enabled&&s?.deadline_at&&Date.now()>=new Date(s.deadline_at).getTime())}
function publicAccessOpen(s){return s?.public_access_removed!==true&&s?.public_access_enabled!==false}
function closePublic(reason='closed'){
 if(!publicMode)return;
 const form=$('form');if(form)form.style.display='none';
 const gate=$('#entry-gate,#gate,.fdt-entry-gate');if(gate)gate.style.display='none';
 $$('#preview-note,#preview').forEach(el=>el.style.display='none');
 let n=$('#nexa-closed');
 if(!n){n=document.createElement('section');n.id='nexa-closed';n.className='nexa-deadline-v3';($('main')||document.body).appendChild(n)}
 n.innerHTML=reason==='access'
  ?'<h2 style="margin:0 0 8px">Form Unavailable</h2><p>Public access has been removed by leadership. Saved responses have not been deleted.</p>'
  :'<h2 style="margin:0 0 8px">Form Closed</h2><p>This form is no longer accepting new responses or edits.</p>';
}
function publicDeadline(s){
 if(!publicMode||!deadlineKey||!s?.deadline_enabled||!s?.deadline_at)return;
 const head=$('header,.panel-head,.fdt-head,.head,.ms-hero');if(!head)return;
 const box=document.createElement('div');box.className='nexa-public-deadline';head.insertAdjacentElement('afterend',box);
 const tick=()=>{const ms=new Date(s.deadline_at)-Date.now();if(ms<=0){box.textContent=`Form Closed · ${fmtUTC(s.deadline_at)}`;closePublic('closed');return}const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60;box.textContent=`Form Deadline · ${fmtUTC(s.deadline_at)} · ${d?d+'d ':''}${h}h ${m}m remaining`};
 tick();setInterval(tick,30000);
}
function removeOldDeadline(){
 $('#nexa-deadline-v2')?.remove();
 $$('section').filter(x=>x.id!=='nexa-deadline-v3'&&(x.querySelector?.('#nd-enabled')||x.querySelector?.('#nd3-save'))).forEach(x=>x.remove());
}
function deadlineValue(){
 const enabled=$('#nd3-enabled')?.checked===true;
 const dt=$('#nd3-date')?.value||'';
 if(!enabled)return {enabled:false,iso:null};
 if(!dt)return {enabled:true,iso:null,error:'Choose a UTC date.'};
 const iso=new Date(`${dt}T${$('#nd3-hour')?.value||'00'}:${$('#nd3-minute')?.value||'00'}:00Z`).toISOString();
 return {enabled:true,iso};
}
function deadlineEditor(row){
 if(!isSettings||!row||!deadlineKey)return;
 removeOldDeadline();if($('#nexa-deadline-v3'))return;
 const s=row.settings||{},d=s.deadline_at?new Date(s.deadline_at):null;
 const date=d?`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`:'';
 const hh=d?String(d.getUTCHours()).padStart(2,'0'):'18',mm=d?String(d.getUTCMinutes()).padStart(2,'0'):'00';
 const sec=document.createElement('section');sec.id='nexa-deadline-v3';sec.className='nexa-deadline-v3';
 sec.innerHTML=`<h3>Form Deadline</h3>
 <p>Optional. The date and time below are always interpreted as UTC, never as the editor's local timezone.</p>
 <label class="nexa-deadline-enable"><input id="nd3-enabled" type="checkbox" ${s.deadline_enabled?'checked':''}> Enable Deadline</label>
 <label class="nexa-deadline-date"><b>Date (UTC)</b><input id="nd3-date" type="date" value="${date}"></label>
 <div class="nexa-deadline-time-title">Time (UTC)</div>
 <div class="nexa-deadline-time">
  <label><b>Hour</b><select id="nd3-hour">${Array.from({length:24},(_,i)=>{const x=String(i).padStart(2,'0');return `<option ${x===hh?'selected':''}>${x}</option>`}).join('')}</select></label>
  <label><b>Minute</b><select id="nd3-minute">${['00','15','30','45'].map(x=>`<option ${x===mm?'selected':''}>${x}</option>`).join('')}</select></label>
 </div>
 <div class="nexa-deadline-utc">24-hour UTC</div>
 <div class="nexa-deadline-note">The deadline saves together with Save Form / Save & Publish Form. NEXA will show a UTC + local-time confirmation before saving.</div>`;
 let anchor=null;
 if(path.includes('tal-settings'))anchor=$('#save')?.closest('section');
 else anchor=$('.form-actions,.actions,.save-box')||$('main')?.lastElementChild;
 if(anchor?.parentNode)anchor.parentNode.insertBefore(sec,anchor);else($('main')||document.body).appendChild(sec);
}
function isPrimarySave(el){
 const b=el?.closest?.('button,input[type="button"],input[type="submit"],a.btn');if(!b)return null;
 if(b.closest('#nexa-deadline-v3,.nexa-confirm-backdrop'))return null;
 if(b.disabled||b.getAttribute('aria-disabled')==='true')return null;
 const txt=(b.textContent||b.value||b.getAttribute('aria-label')||'').trim().toLowerCase();
 if(!txt)return null;
 const looksLikeSave=txt.includes('save')||txt.includes('publish');
 const looksLikePreview=txt.includes('preview')||txt.includes('open form')||txt.includes('copy link')||txt.includes('remove')||txt.includes('restore')||txt.includes('unpublish');
 if(!looksLikeSave||looksLikePreview)return null;
 return b;
}
function showSmallAlert(message){
 $('#nexa-deadline-confirm')?.remove();
 const wrap=document.createElement('div');wrap.id='nexa-deadline-confirm';wrap.className='nexa-confirm-backdrop';
 wrap.innerHTML=`<div class="nexa-confirm-card"><h3>Deadline Needed</h3><p style="color:#aeb7d1;line-height:1.45">${message}</p><div class="nexa-confirm-actions" style="grid-template-columns:1fr"><button class="yes" type="button">OK</button></div></div>`;
 document.body.appendChild(wrap);
 wrap.querySelector('.yes').onclick=()=>wrap.remove();
 wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});
}
function showDeadlineConfirm(v,onYes){
 $('#nexa-deadline-confirm')?.remove();
 const wrap=document.createElement('div');wrap.id='nexa-deadline-confirm';wrap.className='nexa-confirm-backdrop';
 wrap.innerHTML=`<div class="nexa-confirm-card"><h3>Confirm Form Deadline</h3>
 <div>This form will close at:</div><div class="nexa-confirm-main">${fmtUTC(v.iso)}</div>
 <div class="nexa-confirm-local"><b>Local reference on this device:</b><br>${localReference(v.iso)}</div>
 <p style="color:#aeb7d1;line-height:1.45">After the deadline, players will no longer be able to submit or edit responses. Are you sure this deadline is correct?</p>
 <div class="nexa-confirm-actions"><button class="cancel" type="button">Cancel</button><button class="yes" type="button">Yes, Save Form</button></div></div>`;
 document.body.appendChild(wrap);
 wrap.querySelector('.cancel').onclick=()=>wrap.remove();
 wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelector('.yes').onclick=()=>{wrap.remove();onYes()};
}
async function syncDeadlineAfterNativeSave(row,v,beforeUpdated){
 let latest=null;
 for(let i=0;i<10;i++){
  await new Promise(r=>setTimeout(r,220));
  const {data}=await sb.from('event_form_templates').select('settings,updated_at').eq('event_type_key',eventKey).maybeSingle();
  if(data){latest=data;if(data.updated_at!==beforeUpdated)break;}
 }
 const base=latest?.settings||row.settings||{};
 const next={...base,deadline_enabled:v.enabled,deadline_at:v.iso};
 await sb.from('event_form_templates').update({settings:next,updated_at:new Date().toISOString()}).eq('event_type_key',eventKey);
 row.settings=next;row.updated_at=new Date().toISOString();
}
function bindUnifiedDeadlineSave(row){
 if(!isSettings||!deadlineKey||!row)return;
 document.addEventListener('click',e=>{
   const b=isPrimarySave(e.target);if(!b)return;
   const v=deadlineValue();
   if(v.error){e.preventDefault();e.stopImmediatePropagation();showSmallAlert(v.error);return}
   if(b.dataset.nexaDeadlineConfirmed==='1'){
     const before=row.updated_at;
     setTimeout(()=>syncDeadlineAfterNativeSave(row,v,before),0);
     return;
   }
   if(v.enabled){
     e.preventDefault();e.stopImmediatePropagation();
     showDeadlineConfirm(v,()=>{
       b.dataset.nexaDeadlineConfirmed='1';
       b.click();
       setTimeout(()=>delete b.dataset.nexaDeadlineConfirmed,250);
     });
   }else{
     const before=row.updated_at;
     setTimeout(()=>syncDeadlineAfterNativeSave(row,v,before),0);
   }
 },true);
}

function ministryScheduleValue(){
 const dt=$('#nms-date')?.value||'';
 if(!dt)return {error:'Choose the Ministry schedule start date in UTC.'};
 const iso=new Date(`${dt}T${$('#nms-hour')?.value||'00'}:${$('#nms-minute')?.value||'00'}:00Z`).toISOString();
 return {iso};
}
function ministryScheduleEditor(row){
 if(!isSettings||eventKey!=='ministry'||!row)return;
 if($('#nexa-ministry-schedule'))return;
 const s=row.settings||{},d=s.ministry_schedule_start_at?new Date(s.ministry_schedule_start_at):null;
 const date=d?`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`:'';
 const hh=d?String(d.getUTCHours()).padStart(2,'0'):'00',mm=d?String(d.getUTCMinutes()).padStart(2,'0'):'00';
 const sec=document.createElement('section');sec.id='nexa-ministry-schedule';sec.className='ms-card nexa-deadline-v3';
 sec.innerHTML=`<h3>Ministry Schedule Start</h3>
 <p>Set the UTC date and time when the Ministry schedule begins. NEXA uses this as the calendar anchor for Day 1 Construction, Day 2 Research and Day 4 Training.</p>
 <label class="nexa-unified-date"><b>Date (UTC)</b><input id="nms-date" type="date" value="${date}"></label>
 <div class="nexa-deadline-time-title">Time (UTC)</div>
 <div class="nexa-unified-time-grid">
   <label><b>Hour</b><select id="nms-hour">${Array.from({length:24},(_,i)=>{const x=String(i).padStart(2,'0');return `<option ${x===hh?'selected':''}>${x}</option>`}).join('')}</select></label>
   <label><b>Minute</b><select id="nms-minute">${['00','15','30','45'].map(x=>`<option ${x===mm?'selected':''}>${x}</option>`).join('')}</select></label>
 </div>
 <div class="nexa-deadline-utc">24-hour UTC</div>
 <div class="nexa-deadline-note">This is not a general form deadline. The Ministry sections close automatically from this UTC schedule.</div>`;
 const anchor=$('#section-blocks')||$('.ms-card');
 if(anchor?.parentNode)anchor.parentNode.insertBefore(sec,anchor);else($('main')||document.body).appendChild(sec);
}
async function syncMinistryScheduleAfterSave(row,v,beforeUpdated){
 let latest=null;
 for(let i=0;i<10;i++){
   await new Promise(r=>setTimeout(r,220));
   const {data}=await sb.from('event_form_templates').select('settings,updated_at').eq('event_type_key','ministry').maybeSingle();
   if(data){latest=data;if(data.updated_at!==beforeUpdated)break;}
 }
 const next={...(latest?.settings||row.settings||{}),ministry_schedule_start_at:v.iso};
 await sb.from('event_form_templates').update({settings:next,updated_at:new Date().toISOString()}).eq('event_type_key','ministry');
 row.settings=next;row.updated_at=new Date().toISOString();
}
function showMinistryConfirm(v,onYes){
 $('#nexa-deadline-confirm')?.remove();
 const wrap=document.createElement('div');wrap.id='nexa-deadline-confirm';wrap.className='nexa-confirm-backdrop';
 wrap.innerHTML=`<div class="nexa-confirm-card"><h3>Confirm Ministry Schedule</h3>
 <div>Ministry schedule begins:</div><div class="nexa-confirm-main">${fmtUTC(v.iso)}</div>
 <div class="nexa-confirm-local"><b>Local reference on this device:</b><br>${localReference(v.iso)}</div>
 <p style="color:#aeb7d1;line-height:1.45">NEXA will use this UTC moment to calculate Day 1, Day 2 and Day 4 section closures. Is this schedule correct?</p>
 <div class="nexa-confirm-actions"><button class="cancel" type="button">Cancel</button><button class="yes" type="button">Yes, Save Form</button></div></div>`;
 document.body.appendChild(wrap);
 wrap.querySelector('.cancel').onclick=()=>wrap.remove();
 wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelector('.yes').onclick=()=>{wrap.remove();onYes()};
}
function bindMinistryScheduleSave(row){
 if(!isSettings||eventKey!=='ministry'||!row)return;
 document.addEventListener('click',e=>{
   const b=e.target.closest('button,input[type="button"],input[type="submit"]');if(!b)return;
   const txt=(b.textContent||b.value||'').trim().toLowerCase();
   if(!(b.id==='save-all'||txt.includes('save ministry form')))return;
   const v=ministryScheduleValue();
   if(v.error){e.preventDefault();e.stopImmediatePropagation();showSmallAlert(v.error);return}
   if(b.dataset.nexaMinistryConfirmed==='1'){
      const before=row.updated_at;setTimeout(()=>syncMinistryScheduleAfterSave(row,v,before),0);return;
   }
   e.preventDefault();e.stopImmediatePropagation();
   showMinistryConfirm(v,()=>{
      b.dataset.nexaMinistryConfirmed='1';b.click();
      setTimeout(()=>delete b.dataset.nexaMinistryConfirmed,250);
   });
 },true);
}
async function internalBypass(){
 if(!internalMode||isSettings)return;
 const {data:{session}}=await sb.auth.getSession();if(!session)return;
 const gate=$('#entry-gate,#gate,.fdt-entry-gate');const btn=$('#continue-nexa,#member,#nexa-member,[data-entry="member"]');
 if(btn)setTimeout(()=>btn.click(),80);if(gate)setTimeout(()=>gate.classList.add('hidden'),140);
}
async function boot(){
 addGlobalCSS();markPage();hidePublicNavigation();fixGuestNotices();formsCenterRouting();
 const row=await template();
 if(row){
   if(publicMode){
     if(!publicAccessOpen(row.settings))closePublic('access');
     else if(deadlineKey){publicDeadline(row.settings);if(!openDeadline(row.settings))closePublic('closed')}
   }
   if(isSettings&&deadlineKey){deadlineEditor(row);bindUnifiedDeadlineSave(row)}
   if(isSettings&&eventKey==='ministry'){ministryScheduleEditor(row);bindMinistryScheduleSave(row)}
 }
 internalBypass();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();