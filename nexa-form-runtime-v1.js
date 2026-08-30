/* NEXA FORM RUNTIME V2.0 — PUBLIC/INTERNAL ROUTING / UTC DEADLINES / GUEST LIFECYCLE */
    (()=>{
    'use strict';
    if(window.__NEXA_FORM_RUNTIME_V2__) return;
    window.__NEXA_FORM_RUNTIME_V2__=true;
    const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
    const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
    const sb=window.supabase?.createClient?.(SB_URL,SB_KEY);
    const q=new URLSearchParams(location.search);
    const publicMode=q.get('public')==='1';
    const internalMode=q.get('internal')==='1';
    const path=location.pathname.toLowerCase();
    const eventKey=path.includes('tal-')?'tal':path.includes('fdt-')?'fdt':path.includes('battle-')?'svs':'';
    const isSettings=path.includes('settings');
    const $=(s,r=document)=>r.querySelector(s);

    function hidePublicNavigation(){
     if(!publicMode)return;
     document.querySelectorAll('a.back,.back,.ma-back,[href*="forms-center"],[href="index.html"]').forEach(x=>x.style.display='none');
    }
    async function template(){
     if(!sb||!eventKey)return null;
     const {data}=await sb.from('event_form_templates').select('id,event_type_key,settings').eq('event_type_key',eventKey).maybeSingle();
     return data||null;
    }
    function deadlineOpen(s){
     if(!s?.deadline_enabled||!s?.deadline_at)return true;
     return Date.now()<new Date(s.deadline_at).getTime();
    }
    function fmtUTC(iso){
     if(!iso)return '';
     const d=new Date(iso);
     return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')} · ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')} UTC`;
    }
    function addPublicDeadline(s){
     if(!publicMode||!s?.deadline_enabled||!s?.deadline_at)return;
     const head=$('header,.panel-head,.fdt-head,.head');
     if(!head)return;
     const box=document.createElement('div');
     box.className='nexa-public-deadline';
     box.style.cssText='margin:14px 0;padding:12px 14px;border:1px solid rgba(72,221,255,.28);border-radius:14px;background:rgba(8,18,38,.72);font-weight:850';
     head.insertAdjacentElement('afterend',box);
     const tick=()=>{
       const ms=new Date(s.deadline_at)-Date.now();
       if(ms<=0){box.textContent=`Form Closed · ${fmtUTC(s.deadline_at)}`; closePublic();return}
       const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60;
       box.textContent=`Form Deadline · ${fmtUTC(s.deadline_at)} · ${d?d+'d ':''}${h}h ${m}m remaining`;
     };
     tick();setInterval(tick,30000);
    }
    function closePublic(){
     if(!publicMode)return;
     const form=$('form');
     if(form)form.style.display='none';
     const gate=$('#entry-gate,#gate,.fdt-entry-gate');
     if(gate)gate.style.display='none';
     if(!$('#nexa-closed')){
      const n=document.createElement('section');n.id='nexa-closed';
      n.style.cssText='margin:18px;padding:20px;border:1px solid rgba(255,100,138,.35);border-radius:18px;background:rgba(35,8,20,.7)';
      n.innerHTML='<h2>Form Closed</h2><p>This form is no longer accepting new responses or edits.</p>';
      ($('main')||document.body).appendChild(n);
     }
     if(eventKey)localStorage.removeItem(`nexa_guest_${eventKey}_v2`);
    }
    function utcDeadlineEditor(row){
     if(!isSettings||!row||eventKey==='')return;
     if($('#nexa-deadline-v2'))return;
     const s=row.settings||{}, d=s.deadline_at?new Date(s.deadline_at):null;
     const date=d?`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`:'';
     const hh=d?String(d.getUTCHours()).padStart(2,'0'):'18', mm=d?String(d.getUTCMinutes()).padStart(2,'0'):'00';
     const sec=document.createElement('section');sec.id='nexa-deadline-v2';sec.className='setting-card card';
     sec.style.cssText='margin-top:14px;padding:16px;border:1px solid rgba(72,221,255,.28);border-radius:18px;background:rgba(8,18,38,.72)';
     sec.innerHTML=`<h3>Form Deadline</h3><p style="opacity:.72">Optional. Public access and Guest editing close automatically at this UTC deadline.</p>
     <label style="display:flex;gap:9px;align-items:center;margin:12px 0"><input id="nd-enabled" type="checkbox" ${s.deadline_enabled?'checked':''}> Enable Deadline</label>
     <div style="display:grid;grid-template-columns:1fr 92px 92px;gap:8px">
     <label>Date (UTC)<input id="nd-date" type="date" value="${date}"></label>
     <label>Hour<select id="nd-hour">${Array.from({length:24},(_,i)=>`<option ${String(i).padStart(2,'0')===hh?'selected':''}>${String(i).padStart(2,'0')}</option>`).join('')}</select></label>
     <label>Minute<select id="nd-minute">${['00','15','30','45'].map(x=>`<option ${x===mm?'selected':''}>${x}</option>`).join('')}</select></label>
     </div><div style="margin-top:7px;font-weight:900;color:#8fefff">24-hour UTC</div>
     <button id="nd-save" type="button" style="width:100%;min-height:46px;margin-top:12px">Save Deadline</button><div id="nd-status"></div>`;
     const anchor=$('.form-actions,.actions')||$('main')?.lastElementChild;
     (anchor?.parentNode||$('main')||document.body).insertBefore(sec,anchor||null);
     $('#nd-save').onclick=async()=>{
      const st=$('#nd-status');st.textContent='Saving…';
      const enabled=$('#nd-enabled').checked, dt=$('#nd-date').value;
      let iso=null;
      if(enabled){
       if(!dt){st.textContent='Choose a UTC date.';return}
       iso=new Date(`${dt}T${$('#nd-hour').value}:${$('#nd-minute').value}:00Z`).toISOString();
      }
      const next={...(row.settings||{}),deadline_enabled:enabled,deadline_at:iso};
      const {error}=await sb.from('event_form_templates').update({settings:next,updated_at:new Date().toISOString()}).eq('id',row.id);
      st.textContent=error?error.message:'Saved ✓';
      if(!error)row.settings=next;
     };
    }
    async function internalBypass(){
     if(!internalMode||isSettings)return;
     const {data:{session}}=await sb.auth.getSession();
     if(!session)return;
     const btn=$('#member,#nexa-member,#continue-nexa,[data-entry="member"]');
     if(btn) setTimeout(()=>btn.click(),50);
    }
    async function boot(){
     hidePublicNavigation();
     const row=await template();
     if(row){
       if(publicMode){addPublicDeadline(row.settings);if(!deadlineOpen(row.settings))closePublic()}
       if(isSettings)utcDeadlineEditor(row);
     }
     internalBypass();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
    })();