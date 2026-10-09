/* NEXA Shared Workspace UI V5.5.2 — SAVED PREVIEW + DISCORD FORMATION FIX
 * One global Staff token. No local access management. No duplicate workspace switcher.
 */
(()=>{'use strict';
if(window.__NEXA_SHARED_V50__)return;window.__NEXA_SHARED_V50__=true;
const SUPA='https://dfxcxboxrkfmrnsgpyin.supabase.co',PUB='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const sb=window.supabase?.createClient?.(SUPA,PUB);if(!sb)return;
const file=(location.pathname.split('/').pop()||'').toLowerCase();
const MODULE=file.startsWith('transfer-')?'transfer':file.startsWith('ministry-')?'ministry':file.startsWith('wos-utilities')?'wos':file.startsWith('gift-code-')?'gift':'';
const q=new URLSearchParams(location.search),$=id=>document.getElementById(id);
const token=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const state=()=>Number(q.get('state')||localStorage.getItem('nexa_active_state')||sessionStorage.getItem('nexa_active_state')||localStorage.getItem('nexa_active_state_v49')||sessionStorage.getItem('nexa_active_state_v49')||0);
async function rpc(n,a){const {data,error}=await sb.rpc(n,a);if(error)throw Error(error.message||String(error));return data}
function clear(){for(const s of [localStorage,sessionStorage]){s.removeItem('nexa_transfer_staff_token');s.removeItem('nexa_active_state');s.removeItem('nexa_active_state_v49')}}
function hub(reason=''){const u=new URL('staff-workspaces.html',location.href);if(reason)u.searchParams.set('reason',reason);return u.href}
function reveal(){document.documentElement.classList.remove('nexa-auth-pending');document.documentElement.classList.add('nexa-auth-ready');if(MODULE==='transfer'){$('authRoot')?.classList.add('hidden');$('workspaceRoot')?.classList.remove('hidden')}if(MODULE==='gift'){document.body.classList.remove('gift-auth');$('login')?.classList.add('hidden');$('app')?.classList.remove('hidden')}}
function installCss(){if($('nexaSharedV50Css'))return;const s=document.createElement('style');s.id='nexaSharedV50Css';s.textContent=`
#workspaceSwitch,#moduleSwitch,#nexaHubButton{display:none!important}
button[data-tab="access"],button[data-view="access"],#openStaff,[data-tab="staff"],[data-view="staff"]{display:none!important}
section[data-panel="access"],#view-access,#staffView,#staffAccess,#staffAccessView,.staff-access,.staffAccess{display:none!important}
.nexaClickableHubTitle{cursor:pointer!important}
`;document.head.appendChild(s)}
function currentCard(cards){const key=MODULE==='gift'?'wos':MODULE;return cards.find(x=>x.module===key)}
function installHubTitle(){
 document.querySelectorAll('#workspaceSwitch,#moduleSwitch,#nexaHubButton').forEach(el=>el.remove?.());
 const brand=document.querySelector('.top .brand h1,.top h1');if(!brand)return;
 brand.textContent='Workspace Hub';brand.setAttribute('role','button');brand.setAttribute('tabindex','0');brand.setAttribute('aria-label','Return to Workspace Hub');brand.classList.add('nexaClickableHubTitle');
 brand.onclick=()=>location.href='staff-workspaces.html';
 brand.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.href='staff-workspaces.html'}};
}
function installWosEnhancements(){
 if(MODULE!=='wos')return;

 if(!$('nexaWosReminderUxCss')){
  const s=document.createElement('style');
  s.id='nexaWosReminderUxCss';
  s.textContent=`
  #reminderChips .chip{
    background:#252936!important;
    border-color:#454b5d!important;
    color:#9fa8ba!important;
    box-shadow:none!important;
    filter:saturate(.45)
  }
  #reminderChips .chip.active{
    background:linear-gradient(120deg,#6f43ff,#00bfe8)!important;
    border-color:#65e7ff!important;
    color:#fff!important;
    box-shadow:0 0 0 1px rgba(101,231,255,.18),0 7px 18px rgba(65,80,255,.20)!important;
    filter:none
  }
  .nexa-discord-note{
    margin:8px 0 0;
    padding:9px 11px;
    border:1px solid rgba(89,228,255,.24);
    border-radius:12px;
    background:rgba(89,228,255,.055);
    color:#b9c9e8;
    font-size:12px;
    line-height:1.45
  }
  .nexa-discord-checklist{
    margin:8px 0 0;
    padding:10px 12px;
    border:1px solid rgba(108,241,178,.25);
    border-radius:12px;
    background:rgba(108,241,178,.055);
    color:#cfe9df;
    font-size:12px;
    line-height:1.5
  }
  .nexa-discord-checklist b{color:#eafff7}
  `;
  document.head.appendChild(s);
 }

 const botTitle=[...document.querySelectorAll('.module-card h3')]
   .find(x=>x.textContent.trim()==='Discord Bot');
 const botCard=botTitle?.closest('.module-card');

 if(botCard&&!botCard.querySelector('.nexa-discord-install-note')){
  const p=document.createElement('p');
  p.className='nexa-discord-note nexa-discord-install-note';
  p.innerHTML='<b>After installing:</b> link the Discord server to this alliance in NEXA. Installing the bot alone does not connect its channels or reminders.<br><br><b>Before testing:</b> NEXA needs View Channel, Send Messages, Embed Links, and Read Message History in the selected channel. Channel-specific Deny rules can override the server role.';
  const existing=botCard.querySelector('.muted');
  existing?.insertAdjacentElement('afterend',p);
 }

 const discordHub=document.querySelector('.discord-hub');

 if(discordHub&&!discordHub.querySelector('.nexa-discord-link-note')){
  const p=document.createElement('p');
  p.className='nexa-discord-note nexa-discord-link-note';
  p.textContent='Link each Discord server once so NEXA can load its channels, use reminders, and register alliance commands for that server.';
  const head=discordHub.querySelector('.discord-hub-head');
  head?.insertAdjacentElement('afterend',p);
 }

 if(discordHub&&!discordHub.querySelector('.nexa-discord-checklist')){
  const p=document.createElement('div');
  p.className='nexa-discord-checklist';
  p.innerHTML='<b>Discord delivery check</b><br>Use <b>Test</b> on a reminder after choosing the destination. Test sends a real Discord message. If it succeeds, NEXA has verified live delivery to that channel.<br>If you use @everyone, @here, or role mentions, also allow the matching mention permission.';
  discordHub.appendChild(p);
 }

 if(window.__NEXA_WOS_REMINDER_PATCHED__)return;
 window.__NEXA_WOS_REMINDER_PATCHED__=true;


 const originalDraftText=window.draftPreviewText;
 if(typeof originalDraftText==='function'){
  window.draftPreviewText=function(...args){
   let text=String(originalDraftText.apply(this,args)||'');
   if(document.getElementById('eventType')?.value==='bear_trap'){
    let inFormations=false;
    text=text.split('\n').map(line=>{
     const trimmed=String(line||'').trim();
     if(trimmed==='Own Rally Formations:'){inFormations=true;return line}
     if(inFormations && /^(Recommended|Alternative|F2P)$/.test(trimmed))return `• ${trimmed}`;
     return line;
    }).join('\n');
   }
   return text;
  };
 }

 const originalBuild=window.buildSavedPreview;

 if(typeof originalBuild==='function'){
  window.buildSavedPreview=function(e){
   let text=String(originalBuild(e)||'');

   if(e?.event_type==='svs'){
    const lines=text.split('\n');
    if(lines.length)lines[0]='SVS — Battle Phase';
    text=lines.join('\n');
   }

   if(e?.event_type==='bear_trap'){
    const lines=text.split('\n');
    let inFormations=false;
    text=lines.map(line=>{
     const trimmed=String(line||'').trim();

     if(trimmed==='Own Rally Formations:'){
      inFormations=true;
      return line;
     }

     if(inFormations && /^(Recommended|Alternative|F2P)$/.test(trimmed)){
      return `• ${trimmed}`;
     }

     return line;
    }).join('\n');
   }

   return text;
  };
 }

 const originalPreviewEvent=window.previewEvent;

 if(typeof originalPreviewEvent==='function'){
  window.previewEvent=function(e){
   const out=originalPreviewEvent(e);

   if(e?.event_type!=='bear_trap'){
    document.querySelectorAll('.modal-box .muted').forEach(p=>{
     if(p.textContent.trim()==='Empty optional Bear sections are omitted.')p.remove();
    });
   }

   return out;
  };
 }

 const originalApi=window.api;

 if(typeof originalApi==='function'){
  window.api=async function(action,payload,...rest){
   if(action==='save_event'&&payload?.event?.event_type==='svs'){
    payload={
     ...payload,
     event:{
      ...payload.event,
      event_name:'SVS — Battle Phase'
     }
    };
   }

   return originalApi.call(this,action,payload,...rest);
  };
 }


 // Draft Preview must be temporary: preserve the actual editor DOM,
 // let the existing Preview render, then restore the exact editor on Close.
 if(!window.__NEXA_WOS_PREVIEW_STATE_FIX__){
  window.__NEXA_WOS_PREVIEW_STATE_FIX__=true;
  let previewReturn=null;

  const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function captureFormationCards(){
   return [...document.querySelectorAll('#rallyFormationGrid .formation-card')].map(card=>({
    label:(card.querySelector('h4')?.textContent||'Formation').trim(),
    heroes:(card.querySelector('.formation-heroes')?.textContent||'').trim(),
    ratio:(card.querySelector('.formation-split')?.textContent||'').trim()
   })).filter(x=>x.label||x.heroes||x.ratio);
  }

  function renderAllPreviewFormations(rows){
   if(!rows?.length)return;
   const title=[...document.querySelectorAll('.preview-section-title')]
    .find(x=>String(x.textContent||'').trim().toUpperCase()==='OWN RALLY FORMATIONS');
   const section=title?.closest('.preview-section');
   if(!section)return;
   section.innerHTML=
    '<div class="preview-section-title">OWN RALLY FORMATIONS</div>'+
    '<div class="preview-formations">'+
    rows.map(x=>
      '<div class="preview-formation" style="border-top:0;padding-top:0;margin-top:7px">'+
       '<b>• '+escHtml(x.label)+'</b>'+
       '<div>'+escHtml(x.heroes)+'</div>'+
       '<div style="color:var(--cyan);font-weight:950">'+escHtml(x.ratio)+'</div>'+
      '</div>'
    ).join('')+
    '</div>';
  }

  function restoreDraftEditor(){
   if(!previewReturn)return false;
   const body=document.getElementById('modalBody');
   const title=document.getElementById('modalTitle');
   const modal=document.getElementById('modal');
   if(!body||!previewReturn.stash)return false;

   body.replaceChildren();
   while(previewReturn.stash.firstChild)body.appendChild(previewReturn.stash.firstChild);
   if(title)title.textContent=previewReturn.title;
   previewReturn.stash.remove();
   previewReturn=null;
   modal?.classList.remove('hidden');
   return true;
  }

  document.addEventListener('click',ev=>{
   const target=ev.target?.closest?.('#previewDraft');
   if(target&&!previewReturn){
    const body=document.getElementById('modalBody');
    const title=document.getElementById('modalTitle');
    if(body){
     const stash=document.createElement('div');
     stash.id='nexaWosDraftPreviewStash';
     stash.style.display='none';
     document.body.appendChild(stash);

     const formations=captureFormationCards();
     const savedTitle=title?.textContent||'Event Reminder';

     while(body.firstChild)stash.appendChild(body.firstChild);
     previewReturn={stash,title:savedTitle,formations};

     [0,20,80,180].forEach(ms=>setTimeout(()=>renderAllPreviewFormations(formations),ms));
    }
    return;
   }

   if(previewReturn){
    const close=ev.target?.closest?.('#closeModal');
    const backdrop=ev.target===document.getElementById('modal');
    if(close||backdrop){
     ev.preventDefault();
     ev.stopImmediatePropagation();
     restoreDraftEditor();
    }
   }
  },true);
 }

 // Global Preview cleanup + user-friendly Discord permission diagnostics.
 // This runs independently of event-local functions, so Bear-only helper text
 // cannot leak into SvS, Foundry, Canyon, Crazy Joe, BIA, Custom, etc.
 if(!window.__NEXA_WOS_DOM_QA__){
  window.__NEXA_WOS_DOM_QA__=true;

  const cleanUi=()=>{
   document.querySelectorAll('.modal-box .muted,.info-card .muted').forEach(el=>{
    if(String(el.textContent||'').trim()==='Empty optional Bear sections are omitted.')el.remove();
   });

   document.querySelectorAll('.toast').forEach(el=>{
    const raw=String(el.textContent||'');
    if(/Discord\s*403/i.test(raw)&&(/50013/.test(raw)||/Missing Permissions/i.test(raw))){
     el.textContent='Discord permission check failed. In the selected channel, allow NEXA: View Channel, Send Messages, Embed Links, and Read Message History. Check channel overrides, then press Test again.';
     el.classList.add('error');
    }
   });
  };

  const obs=new MutationObserver(cleanUi);
  obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  cleanUi();
 }
}


 // Saved Preview + Discord Test formation consistency.
 // Fixes the real formatter path used outside Edit.
 if(!window.__NEXA_WOS_SAVED_PREVIEW_FIX__){
  window.__NEXA_WOS_SAVED_PREVIEW_FIX__=true;

  const basePreviewSectionsHtml=window.previewSectionsHtml;

  window.previewSectionsHtml=function(text){
   const raw=String(text||'');
   const lines=raw.split('\n');
   const sections=[],head=[];
   let current=null;

   const sectionNames=[
    'Max Joiner Troops',
    'Approved Joiners',
    'Bear Trap Rules',
    'Rally Timing',
    'Buff Preparation',
    'Notes',
    'Own Rally Formations'
   ];

   for(const line of lines){
    const title=sectionNames.find(n=>line===`${n}:`||line.startsWith(`${n}:`));
    if(title){
     current={title,body:line.slice(title.length+1).trim(),lines:[]};
     sections.push(current);
     continue;
    }
    if(!current) head.push(line);
    else current.lines.push(line);
   }

   const formation=sections.find(s=>s.title==='Own Rally Formations');
   const normal=sections.filter(s=>s.title!=='Own Rally Formations');
   const escLocal=s=>String(s??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
   }[c]));

   let html=
    `<div class="preview-sections">`+
    `<div class="preview-section">`+
    `<div class="preview-section-title">REMINDER</div>`+
    `<div class="preview-section-body">${escLocal(head.join('\n').trim())}</div>`+
    `</div>`;

   for(const s of normal){
    const body=[s.body,...s.lines].filter(v=>String(v).trim()).join('\n').trim();
    if(!body)continue;
    html+=
     `<div class="preview-section">`+
     `<div class="preview-section-title">${escLocal(s.title.toUpperCase())}</div>`+
     `<div class="preview-section-body">${escLocal(body)}</div>`+
     `</div>`;
   }

   if(formation){
    const fLines=[formation.body,...formation.lines]
      .map(x=>String(x||'').trim())
      .filter(Boolean);

    const groups=[];
    let g=null;

    for(const line of fLines){
     const m=line.match(/^[•\-]?\s*(Recommended|Alternative|F2P)$/i);
     if(m){
      if(g)groups.push(g);
      g={label:m[1],heroes:'',ratio:''};
      continue;
     }
     if(!g)continue;

     if(!g.heroes) g.heroes=line;
     else if(!g.ratio) g.ratio=line;
     else g.heroes+=` · ${line}`;
    }
    if(g)groups.push(g);

    if(groups.length){
     html+=
      `<div class="preview-section">`+
      `<div class="preview-section-title">OWN RALLY FORMATIONS</div>`+
      `<div class="preview-formations">`+
      groups.map(x=>
       `<div class="preview-formation" style="border-top:0;padding-top:0;margin-top:7px">`+
       `<b>• ${escLocal(x.label)}</b>`+
       `<div>${escLocal(x.heroes)}</div>`+
       `<div style="color:var(--cyan);font-weight:950">${escLocal(x.ratio)}</div>`+
       `</div>`
      ).join('')+
      `</div></div>`;
    }
   }

   return html+'</div>';
  };

  // Make both saved Test and draft Test send bullet-delimited formations.
  function normalizeBearFormationText(raw){
   let inFormations=false;
   return String(raw||'').split('\n').map(line=>{
    const t=String(line||'').trim();
    if(t==='Own Rally Formations:'){
     inFormations=true;
     return line;
    }
    if(inFormations && /^(Recommended|Alternative|F2P)$/i.test(t)){
     return `• ${t}`;
    }
    return line;
   }).join('\n');
  }

  const savedBuilder=window.buildSavedPreview;
  if(typeof savedBuilder==='function'){
   window.buildSavedPreview=function(e){
    let out=String(savedBuilder(e)||'');
    if(e?.event_type==='bear_trap')out=normalizeBearFormationText(out);
    return out;
   };
  }

  const draftBuilder=window.draftPreviewText;
  if(typeof draftBuilder==='function'){
   window.draftPreviewText=function(...args){
    let out=String(draftBuilder.apply(this,args)||'');
    if(document.getElementById('eventType')?.value==='bear_trap'){
     out=normalizeBearFormationText(out);
    }
    return out;
   };
  }
 }


function installGiftRetryEnhancements(){
 if(MODULE!=='gift')return;

 if(!document.getElementById('nexaGiftRetryCss')){
  const s=document.createElement('style');
  s.id='nexaGiftRetryCss';
  s.textContent=`
   .nexa-gift-retry{
    flex:0 0 auto!important;
    min-width:38px!important;
    width:auto!important;
    padding:6px 9px!important;
    font-size:12px!important;
    border-color:#d4aa4f!important;
    color:#ffe39a!important;
    background:#302713!important
   }
   .nexa-gift-retry.retry-red{
    border-color:#b85b77!important;
    color:#ffc0cf!important;
    background:#351925!important
   }
  `;
  document.head.appendChild(s);
 }

 const showRetryToast=(msg,bad=false)=>{
  let t=document.getElementById('nexaGiftRetryToast');
  if(!t){
   t=document.createElement('div');
   t.id='nexaGiftRetryToast';
   Object.assign(t.style,{
    position:'fixed',left:'50%',bottom:'26px',transform:'translateX(-50%)',
    zIndex:'25000',maxWidth:'min(560px,92vw)',padding:'12px 16px',
    borderRadius:'14px',fontWeight:'850',boxShadow:'0 12px 40px #0009'
   });
   document.body.appendChild(t);
  }
  t.style.background=bad?'#3d1725':'#102d25';
  t.style.border=bad?'1px solid #c05d7a':'1px solid #4bb98f';
  t.style.color=bad?'#ffd3df':'#cffff0';
  t.textContent=msg;
  t.style.display='block';
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.style.display='none',5000);
 };

 async function retryGameId(gameId,row,btn){
  const currentToken=token();
  if(!currentToken){showRetryToast('Staff sign-in required.',true);return}
  const old=btn.textContent;
  btn.disabled=true;
  btn.textContent='↻ Retrying…';
  try{
   const r=await fetch('https://dfxcxboxrkfmrnsgpyin.supabase.co/functions/v1/nexa-gift-retry',{
    method:'POST',
    headers:{Authorization:`Bearer ${currentToken}`,'Content-Type':'application/json'},
    body:JSON.stringify({game_id:gameId})
   });
   const j=await r.json().catch(()=>({}));
   if(!r.ok||!j.ok)throw Error(j.error||`Retry failed (${r.status})`);

   const h=j.health||{};
   const level=String(h.level||'yellow');
   const label=String(h.label||(
    j.processed>0?'Retry completed. Refreshing member status.':'No active Gift Code needed a retry right now.'
   ));

   const dot=row.querySelector('.memberHealth');
   if(dot){
    dot.classList.remove('green','yellow','red');
    dot.classList.add(level);
    dot.title=label;
    dot.setAttribute('aria-label',label);
   }
   const name=row.querySelector('.memberName');
   if(name){
    name.classList.remove('health-green','health-yellow','health-red');
    name.classList.add(`health-${level}`);
   }
   const small=row.querySelector('.info small');
   if(small)small.textContent=`${gameId} · ${label}`;

   if(level==='green'){
    btn.remove();
    showRetryToast(`✓ ${gameId}: Gift Codes working.`);
   }else{
    btn.disabled=false;
    btn.textContent=old;
    btn.classList.toggle('retry-red',level==='red');
    showRetryToast(j.processed
      ? `Retry finished for ${gameId}. Current status: ${label}`
      : `${gameId}: ${label}`);
   }
  }catch(err){
   btn.disabled=false;
   btn.textContent=old;
   showRetryToast(err?.message||String(err),true);
  }
 }

 function scan(){
  document.querySelectorAll('.member').forEach(row=>{
   if(row.querySelector('.nexa-gift-retry'))return;
   const dot=row.querySelector('.memberHealth');
   if(!dot)return;
   const isYellow=dot.classList.contains('yellow');
   const isRed=dot.classList.contains('red');
   if(!isYellow&&!isRed)return;

   const small=row.querySelector('.info small');
   const statusText=String(small?.textContent||'');
   if(/Auto-Redeem OFF/i.test(statusText))return;

   const id=(statusText.match(/\b\d{5,30}\b/)||[])[0];
   if(!id)return;

   const tools=row.querySelector('.tools');
   if(!tools)return;

   const btn=document.createElement('button');
   btn.type='button';
   btn.className='ghost tiny nexa-gift-retry'+(isRed?' retry-red':'');
   btn.textContent='↻ Retry';
   btn.title='Retry Gift Codes for this member now';
   btn.setAttribute('aria-label',`Retry Gift Codes for ${id}`);
   btn.onclick=()=>retryGameId(id,row,btn);
   tools.prepend(btn);
  });
 }

 if(!window.__NEXA_GIFT_RETRY_OBSERVER__){
  window.__NEXA_GIFT_RETRY_OBSERVER__=new MutationObserver(scan);
  window.__NEXA_GIFT_RETRY_OBSERVER__.observe(document.documentElement,{subtree:true,childList:true});
 }
 scan();
}

async function boot(){
 if(!MODULE)return;
 installCss();

 const t=token(),st=state();

 if(!t){location.replace(hub('sign_in_required'));return}
 if(!st){location.replace(hub('sign_in_required'));return}

 try{
  const d=await rpc('nexa_staff_hub_v2',{p_token:t,p_state_number:st});

  if(!d?.ok)throw Error(d?.error||'session_expired');

  const card=currentCard(d.cards||[]);

  if(!card?.enabled){
   location.replace(hub('no_access'));
   return;
  }

  reveal();
  installHubTitle();
  installWosEnhancements();
  installGiftRetryEnhancements();

  [100,350,900,1600].forEach(ms=>setTimeout(()=>{
   installHubTitle();
   installWosEnhancements();
   installGiftRetryEnhancements();
  },ms));
 }catch(e){
  const m=String(e?.message||e).toLowerCase();

  if(/session|token|jwt|unauthoriz/.test(m)){
   clear();
   location.replace(hub('session_expired'));
   return;
  }

  reveal();
  installHubTitle();
  installWosEnhancements();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
