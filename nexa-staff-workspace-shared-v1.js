/* NEXA Shared Workspace UI V4.8 — GALAXY UI HUB BUTTON + PRIVATE ACCESS
 * Global token only. No local Access Management. No duplicate login.
 * Workspace authorization is resolved through nexa_staff_hub_v2.
 */
(()=>{'use strict';
if(window.__NEXA_SHARED_V48__)return;window.__NEXA_SHARED_V48__=true;
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
function installCss(){if($('nexaSharedV47Css'))return;const s=document.createElement('style');s.id='nexaSharedV47Css';s.textContent=`
#workspaceSwitch,#moduleSwitch{display:none!important}
.nexaHubButton{min-height:42px!important;border-radius:13px!important;border:1px solid rgba(141,118,255,.34)!important;background:#10172c!important;color:#fff!important;padding:9px 14px!important;font-weight:900!important;text-decoration:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important}
button[data-tab="access"],button[data-view="access"],#openStaff,[data-tab="staff"],[data-view="staff"]{display:none!important}
section[data-panel="access"],#view-access,#staffView,#staffAccess,#staffAccessView,.staff-access,.staffAccess{display:none!important}
`;document.head.appendChild(s)}
function currentCard(cards){const key=MODULE==='gift'?'wos':MODULE;return cards.find(x=>x.module===key)}
function nav(cards){
 const old=$('workspaceSwitch')||$('moduleSwitch');
 if(!old)return;
 let b=$('nexaHubButton');
 if(!b){
   b=document.createElement('a');b.id='nexaHubButton';b.className='nexaHubButton';b.href='staff-workspaces.html';b.textContent='Workspace Hub';
   old.insertAdjacentElement('afterend',b);
 }
 b.href='staff-workspaces.html';
}
async function boot(){if(!MODULE)return;installCss();const t=token(),st=state();if(!t){location.replace(hub('sign_in_required'));return}if(!st){location.replace(hub('sign_in_required'));return}try{const d=await rpc('nexa_staff_hub_v2',{p_token:t,p_state_number:st});if(!d?.ok)throw Error(d?.error||'session_expired');const card=currentCard(d.cards||[]);if(!card?.enabled){location.replace(hub('no_access'));return}nav(d.cards||[]);reveal();[150,500,1100].forEach(ms=>setTimeout(()=>nav(d.cards||[]),ms))}catch(e){const m=String(e?.message||e).toLowerCase();if(/session|token|jwt|unauthoriz/.test(m)){clear();location.replace(hub('session_expired'));return}reveal()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();