/* NEXA Shared Workspace UI V5.0 — SINGLE HUB TITLE / GLOBAL SSO
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
async function boot(){if(!MODULE)return;installCss();const t=token(),st=state();if(!t){location.replace(hub('sign_in_required'));return}if(!st){location.replace(hub('sign_in_required'));return}try{const d=await rpc('nexa_staff_hub_v2',{p_token:t,p_state_number:st});if(!d?.ok)throw Error(d?.error||'session_expired');const card=currentCard(d.cards||[]);if(!card?.enabled){location.replace(hub('no_access'));return}reveal();installHubTitle();[100,350,900,1600].forEach(ms=>setTimeout(installHubTitle,ms))}catch(e){const m=String(e?.message||e).toLowerCase();if(/session|token|jwt|unauthoriz/.test(m)){clear();location.replace(hub('session_expired'));return}reveal();installHubTitle()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
