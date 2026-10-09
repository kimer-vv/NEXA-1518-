/* NEXA Shared Workspace UI V5.1 — SINGLE HUB TITLE / GLOBAL SSO / WOS REMINDER UX
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
  `;
  document.head.appendChild(s);
 }

 const botTitle=[...document.querySelectorAll('.module-card h3')]
   .find(x=>x.textContent.trim()==='Discord Bot');
 const botCard=botTitle?.closest('.module-card');

 if(botCard&&!botCard.querySelector('.nexa-discord-install-note')){
  const p=document.createElement('p');
  p.className='nexa-discord-note nexa-discord-install-note';
  p.innerHTML='<b>After installing:</b> link the Discord server to this alliance in NEXA. Installing the bot alone does not connect its channels or reminders.';
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

 if(window.__NEXA_WOS_REMINDER_PATCHED__)return;
 window.__NEXA_WOS_REMINDER_PATCHED__=true;

 const originalBuild=window.buildSavedPreview;

 if(typeof originalBuild==='function'){
  window.buildSavedPreview=function(e){
   let text=String(originalBuild(e)||'');

   if(e?.event_type==='svs'){
    const lines=text.split('\n');
    if(lines.length)lines[0]='SVS — Battle Phase';
    text=lines.join('\n');
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

  [100,350,900,1600].forEach(ms=>setTimeout(()=>{
   installHubTitle();
   installWosEnhancements();
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
