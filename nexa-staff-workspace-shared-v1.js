/* NEXA Staff Workspace Shared UI V1.0
   CREATE: nexa-staff-workspace-shared-v1.js
   Identity is shared; module authorization is NOT shared.
   Install with one script tag in Transfer, Ministry and Gift pages.
*/
(()=>{'use strict';
if(window.__NEXA_STAFF_SHARED_V1__)return;
window.__NEXA_STAFF_SHARED_V1__=true;
const MODULE=location.pathname.split('/').pop().startsWith('ministry-')?'ministry':location.pathname.split('/').pop().startsWith('gift-code-')?'gift':'transfer';
const URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=id=>document.getElementById(id);
const getToken=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const saveToken=(token,remember)=>{localStorage.removeItem('nexa_transfer_staff_token');sessionStorage.removeItem('nexa_transfer_staff_token');(remember?localStorage:sessionStorage).setItem('nexa_transfer_staff_token',token);};
async function rpc(name,body){const r=await fetch(`${URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>null);if(!r.ok)throw Error(d?.message||'Workspace request failed.');return d;}
const humanError=x=>({invalid_credentials:'Incorrect username / Game ID or password.',no_active_workspace:'Your Game ID does not have access to an active workspace.',game_id_not_authorized:'Your Game ID has not been authorized for this Workspace.',already_registered_use_login:'This Game ID already has a staff account. Choose Log In.',username_taken:'That username is already in use.',invalid_username:'Username must be 3â32 letters, numbers, periods, dashes or underscores.',invalid_game_name:'Enter a valid Game Name.',invalid_game_id:'Enter a valid Game ID.',password_too_short:'Use a password with at least 8 characters.'}[x]||x||'Request failed.');
function installMinistryLogin(){
 const root=$('loginScreen');if(!root||root.dataset.sharedAuth)return;root.dataset.sharedAuth='yes';
 root.innerHTML=`<div class="nexa-staff-auth-brand"><small>MINISTRY WORKSPACE</small><h1>Staff Access</h1><p>Ministry appointments and scheduling</p></div>
 <section class="nexa-staff-auth-card">
  <div class="nexa-staff-auth-tabs"><button type="button" id="nexaLoginTab" class="active">Log In</button><button type="button" id="nexaRegisterTab">First Time? Register</button></div>
  <div id="nexaLoginPane"><label>Username or Game ID<input id="loginId" autocomplete="username"></label><label>Password<input id="loginPass" type="password" autocomplete="current-password"></label><label class="nexa-staff-remember"><input id="remember" type="checkbox" checked> Remember me on this device</label><button id="loginBtn" type="button">Log In</button><div class="nexa-staff-auth-links"><button id="nexaForgotUser" type="button">Forgot username?</button><button id="nexaForgotPass" type="button">Forgot password?</button></div></div>
  <div id="nexaRegisterPane" hidden><label>Username<input id="nexaRegUser" autocomplete="username"></label><label>Game Name<input id="nexaRegName"></label><label>Game ID<input id="nexaRegId" inputmode="numeric"></label><label>Create Password<input id="nexaRegPassword" type="password" autocomplete="new-password"></label><label>Confirm Password<input id="nexaRegConfirm" type="password" autocomplete="new-password"></label><label class="nexa-staff-remember"><input id="nexaRegRemember" type="checkbox" checked> Remember me on this device</label><button id="nexaRegisterBtn" type="button">Register</button></div>
  <div id="nexaRecoveryPane" hidden><h2>Use Recovery Code</h2><p>Ask your Workspace manager for a password recovery code.</p><label>Username or Game ID<input id="nexaRecoverId"></label><label>Recovery Code<input id="nexaRecoverCode"></label><label>New Password<input id="nexaRecoverPw" type="password" autocomplete="new-password"></label><label>Confirm New Password<input id="nexaRecoverConfirm" type="password" autocomplete="new-password"></label><button id="nexaRecoverBtn" type="button">Change Password</button><button id="nexaRecoverCancel" type="button" class="nexa-staff-link">Cancel</button></div>
  <p id="loginMsg" class="nexa-staff-login-status" role="status"></p>
 </section>`;
 const msg=$('loginMsg');const show=section=>{for(const id of ['nexaLoginPane','nexaRegisterPane','nexaRecoveryPane'])$(id).hidden=id!==section; $('nexaLoginTab').classList.toggle('active',section==='nexaLoginPane');$('nexaRegisterTab').classList.toggle('active',section==='nexaRegisterPane');msg.textContent='';};
 $('nexaLoginTab').onclick=()=>show('nexaLoginPane');$('nexaRegisterTab').onclick=()=>show('nexaRegisterPane');
 $('nexaForgotUser').onclick=()=>msg.textContent='Contact your Ministry Workspace manager. They can look up your username using your Game ID.';
 $('nexaForgotPass').onclick=()=>show('nexaRecoveryPane');$('nexaRecoverCancel').onclick=()=>show('nexaLoginPane');
 $('loginBtn').onclick=async()=>{const btn=$('loginBtn');btn.disabled=true;msg.textContent='Signing inâ¦';try{const d=await rpc('nexa_staff_login_v1',{p_identifier:$('loginId').value.trim(),p_password:$('loginPass').value,p_remember:$('remember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveToken(d.token,$('remember').checked);location.reload();}catch(e){msg.textContent=humanError(e.message);btn.disabled=false;}};
 $('nexaRegisterBtn').onclick=async()=>{const btn=$('nexaRegisterBtn');btn.disabled=true;msg.textContent='Registeringâ¦';try{if($('nexaRegPassword').value!==$('nexaRegConfirm').value)throw Error('Passwords do not match.');const d=await rpc('nexa_staff_register_module_v1',{p_module:'ministry',p_username:$('nexaRegUser').value.trim(),p_game_name:$('nexaRegName').value.trim(),p_game_id:$('nexaRegId').value.trim(),p_password:$('nexaRegPassword').value,p_remember:$('nexaRegRemember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveToken(d.token,$('nexaRegRemember').checked);location.reload();}catch(e){msg.textContent=humanError(e.message);btn.disabled=false;}};
 $('nexaRecoverBtn').onclick=async()=>{const btn=$('nexaRecoverBtn');btn.disabled=true;msg.textContent='Checking recovery codeâ¦';try{if($('nexaRecoverPw').value!==$('nexaRecoverConfirm').value)throw Error('Passwords do not match.');const d=await rpc('transfer_staff_reset_password',{p_identifier:$('nexaRecoverId').value.trim(),p_code:$('nexaRecoverCode').value.trim(),p_new_password:$('nexaRecoverPw').value});if(!d?.ok)throw Error('Recovery code is invalid or expired.');show('nexaLoginPane');msg.textContent='Password changed. You can now log in.';}catch(e){msg.textContent=e.message;}finally{btn.disabled=false;}};
}
function installStyle(){if($('nexa-staff-shared-css'))return;const s=document.createElement('style');s.id='nexa-staff-shared-css';s.textContent=`
#loginScreen.nexa-staff-shared-login:not(.hidden){display:block!important;padding:clamp(54px,11vh,110px) 16px 60px;min-height:100dvh;background:radial-gradient(circle at 0 0,#10202a,#0b0c1b 60%);color:#fff}
.nexa-staff-auth-brand{text-align:center;margin:0 auto 28px}.nexa-staff-auth-brand small{font-weight:950;letter-spacing:.25em;color:#a2eeff;font-size:12px}.nexa-staff-auth-brand h1{font-size:clamp(39px,8vw,65px);margin:12px 0;font-weight:950}.nexa-staff-auth-brand p{color:#b6c1d8;font-size:clamp(16px,4vw,24px)}
.nexa-staff-auth-card{width:min(740px,100%);margin:auto;padding:clamp(19px,5vw,38px);border:1px solid #30374f;border-radius:28px;background:#111626}
.nexa-staff-auth-tabs{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:23px}.nexa-staff-auth-tabs button{background:transparent;color:#f5f6ff;border:1px solid #4d447b;border-radius:999px;padding:11px 16px;font-weight:900;font-size:clamp(14px,3vw,21px)}.nexa-staff-auth-tabs button.active{background:linear-gradient(100deg,#346e93,#484084);border-color:#51c9f6}
.nexa-staff-auth-card label{display:grid;gap:8px;margin:14px 0;font-weight:850;color:#c0c9df}.nexa-staff-auth-card label input:not([type=checkbox]){width:100%;min-height:49px;background:#0d1324;border:1px solid #353d58;border-radius:13px;color:#fff;padding:12px}
.nexa-staff-auth-card .nexa-staff-remember{display:flex!important;align-items:center;gap:10px;font-weight:600}.nexa-staff-remember input{width:20px;height:20px;accent-color:#2499ff}
.nexa-staff-auth-card button:not(.nexa-staff-auth-tabs button):not(.nexa-staff-link){border:1px solid #557baa;border-radius:14px;padding:12px 16px;color:#fff;background:linear-gradient(110deg,#355c91,#39366f);font-weight:850}
.nexa-staff-auth-links{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}.nexa-staff-auth-links button,.nexa-staff-auth-card .nexa-staff-link{background:transparent!important;border:0!important;color:#a9eeff!important;text-decoration:underline;padding:4px!important}
.nexa-staff-login-status{color:#ffcf8b;white-space:pre-wrap;min-height:18px}
#nexa-staff-module-nav{display:flex;gap:7px;flex-wrap:wrap;align-items:center;width:100%;margin:9px 0 11px;order:9}
#nexa-staff-module-nav a{display:inline-flex;align-items:center;min-height:34px;border:1px solid #5b5b94;border-radius:999px;padding:7px 12px;background:#172141;color:#dce9ff;text-decoration:none;font:800 12px system-ui,-apple-system,sans-serif}
#nexa-staff-module-nav a[aria-current=page]{border-color:#66e9ff;color:#a7f6ff;background:#1b3150}
.top:has(#nexa-staff-module-nav){flex-wrap:wrap}
`;document.head.appendChild(s);}
function navRoot(){if(MODULE==='gift')return $('workspaceHeader')?.querySelector('.flex');return document.querySelector('#workspaceRoot .top')||document.querySelector('#app .top');}
async function refreshNav(){const token=getToken();const parent=navRoot();if(!parent||!token)return;
 const screen=MODULE==='gift'?$('app'):MODULE==='ministry'?$('app'):$('workspaceRoot');if(!screen||screen.classList.contains('hidden'))return;
 let d;try{d=await rpc('nexa_staff_workspace_access_v1',{p_token:token})}catch{return;}if(!d?.ok)return;
 let el=$('nexa-staff-module-nav');if(!el){el=document.createElement('nav');el.id='nexa-staff-module-nav';el.setAttribute('aria-label','Authorized Workspaces');parent.appendChild(el)}
 el.replaceChildren();for(const m of d.modules||[]){const a=document.createElement('a');a.href=m.url;a.textContent=m.label;if(m.module===MODULE)a.setAttribute('aria-current','page');el.appendChild(a)}
}
function init(){installStyle();if(MODULE==='ministry'){$('loginScreen')?.classList.add('nexa-staff-shared-login');installMinistryLogin()};if(MODULE==='gift'){for(const a of document.querySelectorAll('#workspaceHeader a'))if(/^(transfer|ministr)/i.test(a.getAttribute('href')||''))a.remove()}
 const observer=new MutationObserver(()=>{if(getToken()&&!$('nexa-staff-module-nav'))refreshNav()});observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});refreshNav();window.addEventListener('pageshow',refreshNav);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
