/* NEXA FORM RUNTIME V3.0 — INTERNAL/PUBLIC ROUTING / CLEAN UTC DEADLINES / MOBILE FORM FIXES */
(()=>{
'use strict';
if(window.__NEXA_FORM_RUNTIME_V3__) return;
window.__NEXA_FORM_RUNTIME_V3__=true;

const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
const q=new URLSearchParams(location.search);
const path=location.pathname.toLowerCase();
const publicMode=q.get('public')==='1';
const internalMode=q.get('internal')==='1';
const isSettings=path.includes('settings');
const eventKey=path.includes('tal-')?'tal':path.includes('fdt-')?'fdt':path.includes('battle-')?'svs':'';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

function addGlobalCSS(){
 if($('#nexa-runtime-v3-css'))return;
 const s=document.createElement('style');s.id='nexa-runtime-v3-css';
 s.textContent=`
 .nexa-deadline-v3{width:calc(100% - 18px)!important;max-width:calc(100% - 18px)!important;margin:16px 0 16px 18px!important;padding:18px!important;box-sizing:border-box!important;border:1px solid rgba(72,221,255,.34)!important;border-radius:20px!important;background:rgba(7,16,35,.78)!important;overflow:hidden!important}
 .nexa-deadline-v3 h3{margin:0 0 8px!important;font-size:1.35rem!important}.nexa-deadline-v3 p{margin:0 0 16px!important;line-height:1.45!important;color:#aeb7d1!important}
 .nexa-deadline-enable{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 16px!important;font-weight:900!important}
 .nexa-deadline-enable input{width:24px!important;height:24px!important;min-height:24px!important;flex:0 0 24px!important}
 .nexa-deadline-date{display:grid!important;gap:7px!important;margin:0 0 14px!important}
 .nexa-deadline-time-title{font-size:.92rem!important;font-weight:950!important;color:#dbe3ff!important;margin:0 0 8px!important}
 .nexa-deadline-time{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
 .nexa-deadline-v3 label{min-width:0!important}.nexa-deadline-v3 input[type=date],.nexa-deadline-v3 select{width:100%!important;min-width:0!important;max-width:100%!important;min-height:48px!important;padding:10px 12px!important;box-sizing:border-box!important;border-radius:13px!important;background:#081126!important;color:#fff!important;font-size:16px!important;border:1px solid rgba(119,142,210,.32)!important}
 .nexa-deadline-utc{margin:10px 0 14px!important;color:#8fefff!important;font-weight:950!important}.nexa-deadline-v3 button{width:100%!important;min-height:48px!important;border-radius:14px!important}
 .nexa-public-deadline{width:calc(100% - 36px)!important;max-width:684px!important;margin:12px 18px 16px!important;padding:13px 15px!important;box-sizing:border-box!important;border:1px solid rgba(72,221,255,.28)!important;border-radius:15px!important;background:rgba(8,18,38,.78)!important;line-height:1.4!important;font-weight:850!important}
 body.nexa-tal-page .head,body.nexa-tal-page .panel-head{display:block!important;position:static!important;width:calc(100% - 36px)!important;max-width:none!important;margin:18px 0 20px 18px!important;padding:0!important;text-align:left!important;columns:auto!important;column-count:1!important}
 body.nexa-tal-page .head>* ,body.nexa-tal-page .panel-head>*{display:block!important;float:none!important;position:static!important;width:auto!important;max-width:100%!important;margin-left:0!important;margin-right:0!important;transform:none!important;text-align:left!important}
 body.nexa-tal-page .head small,body.nexa-tal-page .panel-head:before{white-space:normal!important}
 body.nexa-tal-page .head h1,body.nexa-tal-page .panel-head h1{font-size:clamp(2rem,8vw,3rem)!important;line-height:1.04!important;margin:7px 0!important}
 body.nexa-tal-page .head p,body.nexa-tal-page .panel-head p{margin:8px 0 0!important;line-height:1.45!important}
 body.nexa-tal-page .card{width:calc(100% - 18px)!important;max-width:calc(100% - 18px)!important;box-sizing:border-box!important;overflow:hidden!important}
 body.nexa-tal-page input[type=date]{width:100%!important;max-width:100%!important;box-sizing:border-box!important}
 body.nexa-tal-page .slots{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;width:100%!important;min-width:0!important;overflow:hidden!important}
 body.nexa-tal-page .slots label{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;width:100%!important;min-width:0!important;margin:0!important;padding:10px 12px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:12px!important;box-sizing:border-box!important}
 body.nexa-tal-page .slots label input{width:23px!important;height:23px!important;min-width:23px!important;flex:0 0 23px!important;margin:0!important}
 body.nexa-tal-page .slots label span,body.nexa-tal-page .slots label{white-space:normal!important;overflow-wrap:anywhere!important}
 body.nexa-tal-page .notice{font-size:13px!important;line-height:1.42!important;padding:13px!important}
 @media(max-width:560px){
   .nexa-deadline-v3{margin-left:18px!important}.nexa-deadline-time{grid-template-columns:1fr 1fr!important}
 }
 `;
 document.head.appendChild(s);
}

function markPage(){
 if(path.includes('tal-'))document.body.classList.add('nexa-tal-page');
}

function hidePublicNavigation(){
 if(!publicMode&&!internalMode)return;
 $$('a.back,.back,.ms-back,.ma-back,[href*="forms-center"],[href="index.html"]').forEach(x=>x.style.display='none');
}

function fixGuestNotices(){
 if(!path.includes('fdt-form'))return;
 const copy='Your In-Game Name, Game ID, Alliance Tag and saved response can be reopened and edited on this browser while the form remains open. Guest access expires when the Form Deadline closes. The next event requires a new Guest entry unless you use NEXA.';
 $$('.guest-warning').forEach((el,i)=>{
   el.innerHTML=`<b>${i===0?'Guest Information Notice:':'Guest Information Notice:'}</b> ${copy}`;
 });
}

function formsCenterRouting(){
 if(!path.includes('forms-center'))return;
 document.addEventListener('click',async e=>{
   const open=e.target.closest('a');
   if(open && open.textContent.trim()==='Open Form'){
     e.preventDefault();
     const u=new URL(open.getAttribute('href'),location.href);
     u.searchParams.delete('public');u.searchParams.delete('direct');u.searchParams.set('internal','1');
     location.href=u.pathname+u.search;
     return;
   }
   const copy=e.target.closest('[data-copy]');
   if(copy){
     e.preventDefault();e.stopImmediatePropagation();
     const u=new URL(copy.dataset.copy,location.href);
     u.searchParams.delete('internal');u.searchParams.delete('direct');u.searchParams.set('public','1');
     try{
       await navigator.clipboard.writeText(u.href);
       const st=copy.closest('.card')?.querySelector('.status');if(st)st.textContent='Public link copied ✓';
     }catch{}
   }
 },true);
}

async function template(){
 if(!sb||!eventKey)return null;
 const {data}=await sb.from('event_form_templates').select('id,event_type_key,settings').eq('event_type_key',eventKey).maybeSingle();
 return data||null;
}
function fmtUTC(iso){
 const d=new Date(iso);
 return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} · ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')} UTC`;
}
function openDeadline(s){return !(s?.deadline_enabled&&s?.deadline_at&&Date.now()>=new Date(s.deadline_at).getTime())}

function closePublic(){
 if(!publicMode)return;
 const form=$('form');if(form)form.style.display='none';
 const gate=$('#entry-gate,#gate,.fdt-entry-gate');if(gate)gate.style.display='none';
 if(!$('#nexa-closed')){
  const n=document.createElement('section');n.id='nexa-closed';n.className='nexa-deadline-v3';
  n.innerHTML='<h2 style="margin:0 0 8px">Form Closed</h2><p>This form is no longer accepting new responses or edits.</p>';
  ($('main')||document.body).appendChild(n);
 }
 if(eventKey)localStorage.removeItem(`nexa_guest_${eventKey}_token_v2`);
}
function publicDeadline(s){
 if(!publicMode||!s?.deadline_enabled||!s?.deadline_at)return;
 const head=$('header,.panel-head,.fdt-head,.head,.ms-hero');if(!head)return;
 const box=document.createElement('div');box.className='nexa-public-deadline';head.insertAdjacentElement('afterend',box);
 const tick=()=>{
  const ms=new Date(s.deadline_at)-Date.now();
  if(ms<=0){box.textContent=`Form Closed · ${fmtUTC(s.deadline_at)}`;closePublic();return}
  const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60;
  box.textContent=`Form Deadline · ${fmtUTC(s.deadline_at)} · ${d?d+'d ':''}${h}h ${m}m remaining`;
 };
 tick();setInterval(tick,30000);
}

function removeOldDeadline(){
 $('#nexa-deadline-v2')?.remove();
 $$('section').filter(x=>x.id!=='nexa-deadline-v3'&&x.querySelector?.('#nd-enabled')).forEach(x=>x.remove());
}

function deadlineEditor(row){
 if(!isSettings||!row||!eventKey)return;
 removeOldDeadline();
 if($('#nexa-deadline-v3'))return;
 const s=row.settings||{},d=s.deadline_at?new Date(s.deadline_at):null;
 const date=d?`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`:'';
 const hh=d?String(d.getUTCHours()).padStart(2,'0'):'18',mm=d?String(d.getUTCMinutes()).padStart(2,'0'):'00';
 const sec=document.createElement('section');sec.id='nexa-deadline-v3';sec.className='nexa-deadline-v3';
 sec.innerHTML=`<h3>Form Deadline</h3>
 <p>Optional. Public access and Guest editing close automatically at this UTC deadline.</p>
 <label class="nexa-deadline-enable"><input id="nd3-enabled" type="checkbox" ${s.deadline_enabled?'checked':''}> Enable Deadline</label>
 <label class="nexa-deadline-date"><b>Date (UTC)</b><input id="nd3-date" type="date" value="${date}"></label>
 <div class="nexa-deadline-time-title">Time (UTC)</div>
 <div class="nexa-deadline-time">
  <label><b>Hour</b><select id="nd3-hour">${Array.from({length:24},(_,i)=>{const x=String(i).padStart(2,'0');return `<option ${x===hh?'selected':''}>${x}</option>`}).join('')}</select></label>
  <label><b>Minute</b><select id="nd3-minute">${['00','15','30','45'].map(x=>`<option ${x===mm?'selected':''}>${x}</option>`).join('')}</select></label>
 </div>
 <div class="nexa-deadline-utc">24-hour UTC</div>
 <button id="nd3-save" type="button" class="btn">Save Deadline</button><div id="nd3-status" style="min-height:18px;margin-top:8px;color:#8ef0cf"></div>`;
 let anchor=null;
 if(path.includes('tal-settings'))anchor=$('#save')?.closest('section');
 else anchor=$('.form-actions,.actions,.save-box')||$('main')?.lastElementChild;
 if(anchor?.parentNode)anchor.parentNode.insertBefore(sec,anchor);
 else ($('main')||document.body).appendChild(sec);
 $('#nd3-save').onclick=async()=>{
  const st=$('#nd3-status');st.textContent='Saving…';
  const enabled=$('#nd3-enabled').checked,dt=$('#nd3-date').value;let iso=null;
  if(enabled){
   if(!dt){st.textContent='Choose a UTC date.';return}
   iso=new Date(`${dt}T${$('#nd3-hour').value}:${$('#nd3-minute').value}:00Z`).toISOString();
  }
  const next={...(row.settings||{}),deadline_enabled:enabled,deadline_at:iso};
  const {error}=await sb.from('event_form_templates').update({settings:next,updated_at:new Date().toISOString()}).eq('id',row.id);
  if(error){st.textContent=error.message;return}
  row.settings=next;st.textContent='Saved ✓';
 };
}

async function internalBypass(){
 if(!internalMode||isSettings)return;
 const {data:{session}}=await sb.auth.getSession();
 if(!session)return;
 const gate=$('#entry-gate,#gate,.fdt-entry-gate');
 const btn=$('#continue-nexa,#member,#nexa-member,[data-entry="member"]');
 if(btn){setTimeout(()=>btn.click(),80)}
 if(gate)setTimeout(()=>gate.classList.add('hidden'),140);
}

async function boot(){
 addGlobalCSS();markPage();hidePublicNavigation();fixGuestNotices();formsCenterRouting();
 const row=await template();
 if(row){
  if(publicMode){publicDeadline(row.settings);if(!openDeadline(row.settings))closePublic()}
  if(isSettings)deadlineEditor(row);
 }
 internalBypass();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();