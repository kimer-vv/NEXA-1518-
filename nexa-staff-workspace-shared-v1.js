/* NEXA Staff Workspace Shared UI V2.2 — TRANSFER SESSION FIX — STATE + GAME ID ONLY */
(()=>{'use strict';
if(window.__NEXA_STAFF_SHARED_V2__)return;
window.__NEXA_STAFF_SHARED_V2__=true;
const MODULE=location.pathname.split('/').pop().startsWith('ministry-')?'ministry':location.pathname.split('/').pop().startsWith('gift-code-')?'gift':'transfer';
const URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const $=id=>document.getElementById(id);
const getToken=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
const getState=()=>Number(localStorage.getItem('nexa_active_state')||sessionStorage.getItem('nexa_active_state')||0);
const saveAuth=(token,remember,state)=>{for(const s of [localStorage,sessionStorage]){s.removeItem('nexa_transfer_staff_token');s.removeItem('nexa_active_state')}const s=remember?localStorage:sessionStorage;s.setItem('nexa_transfer_staff_token',token);s.setItem('nexa_active_state',String(state));};
async function rpc(name,body){const r=await fetch(`${URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>null);if(!r.ok)throw Error(d?.message||'Workspace request failed.');return d;}
const humanError=x=>({invalid_credentials:'Incorrect State, Game ID, or password.',no_active_workspace_for_state:'Your Game ID does not have access to an active workspace in this State.',game_id_not_authorized:'Your Game ID has not been authorized for this Workspace.',existing_account_password_mismatch:'This Game ID already has an account. Use its existing password.',invalid_state:'Enter a valid State / Server.',invalid_game_name:'Enter a valid Game Name.',invalid_game_id:'Enter a valid Game ID.',password_too_short:'Use a password with at least 8 characters.'}[x]||x||'Request failed.');
function installMinistryLogin(){
 const root=$('loginScreen');if(!root||root.dataset.sharedAuth)return;root.dataset.sharedAuth='yes';
 root.innerHTML=`<div class="nexa-staff-auth-brand"><small>MINISTRY WORKSPACE</small><h1>Staff Access</h1><p>Ministry appointments and scheduling</p></div>
 <section class="nexa-staff-auth-card">
  <div class="nexa-staff-auth-tabs"><button type="button" id="nexaLoginTab" class="active">Log In</button><button type="button" id="nexaRegisterTab">First Time? Register</button></div>
  <div id="nexaLoginPane"><label>State / Server<input id="nexaState" inputmode="numeric" placeholder="e.g. 1518"></label><label>Game ID<input id="loginId" inputmode="numeric" autocomplete="username"></label><label>Password<input id="loginPass" type="password" autocomplete="current-password"></label><label class="nexa-staff-remember"><input id="remember" type="checkbox" checked> Remember me on this device</label><button id="loginBtn" type="button">Log In</button><div class="nexa-staff-auth-links"><button id="nexaForgotPass" type="button">Forgot password?</button></div></div>
  <div id="nexaRegisterPane" hidden><label>State / Server<input id="nexaRegState" inputmode="numeric" placeholder="e.g. 1518"></label><label>Game Name<input id="nexaRegName"></label><label>Game ID<input id="nexaRegId" inputmode="numeric"></label><label>Create Password<input id="nexaRegPassword" type="password" autocomplete="new-password"></label><label>Confirm Password<input id="nexaRegConfirm" type="password" autocomplete="new-password"></label><label class="nexa-staff-remember"><input id="nexaRegRemember" type="checkbox" checked> Remember me on this device</label><button id="nexaRegisterBtn" type="button">Register</button></div>
  <div id="nexaRecoveryPane" hidden><h2>Use Recovery Code</h2><p>Ask your Workspace manager for a password recovery code.</p><label>Game ID<input id="nexaRecoverId" inputmode="numeric"></label><label>Recovery Code<input id="nexaRecoverCode"></label><label>New Password<input id="nexaRecoverPw" type="password" autocomplete="new-password"></label><label>Confirm New Password<input id="nexaRecoverConfirm" type="password" autocomplete="new-password"></label><button id="nexaRecoverBtn" type="button">Change Password</button><button id="nexaRecoverCancel" type="button" class="nexa-staff-link">Cancel</button></div>
  <p id="loginMsg" class="nexa-staff-login-status" role="status"></p>
 </section>`;
 const msg=$('loginMsg'),show=section=>{for(const id of ['nexaLoginPane','nexaRegisterPane','nexaRecoveryPane'])$(id).hidden=id!==section;$('nexaLoginTab').classList.toggle('active',section==='nexaLoginPane');$('nexaRegisterTab').classList.toggle('active',section==='nexaRegisterPane');msg.textContent='';};
 $('nexaLoginTab').onclick=()=>show('nexaLoginPane');$('nexaRegisterTab').onclick=()=>show('nexaRegisterPane');$('nexaForgotPass').onclick=()=>show('nexaRecoveryPane');$('nexaRecoverCancel').onclick=()=>show('nexaLoginPane');
 $('loginBtn').onclick=async()=>{const btn=$('loginBtn');btn.disabled=true;msg.textContent='Signing in…';try{const state=Number($('nexaState').value.trim());const d=await rpc('nexa_staff_login_v2',{p_state_number:state,p_game_id:$('loginId').value.trim(),p_password:$('loginPass').value,p_remember:$('remember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveAuth(d.token,$('remember').checked,state);location.reload()}catch(e){msg.textContent=humanError(e.message);btn.disabled=false}};
 $('nexaRegisterBtn').onclick=async()=>{const btn=$('nexaRegisterBtn');btn.disabled=true;msg.textContent='Registering…';try{if($('nexaRegPassword').value!==$('nexaRegConfirm').value)throw Error('Passwords do not match.');const state=Number($('nexaRegState').value.trim());const d=await rpc('nexa_staff_register_module_v2',{p_module:'ministry',p_state_number:state,p_game_name:$('nexaRegName').value.trim(),p_game_id:$('nexaRegId').value.trim(),p_password:$('nexaRegPassword').value,p_remember:$('nexaRegRemember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveAuth(d.token,$('nexaRegRemember').checked,state);location.reload()}catch(e){msg.textContent=humanError(e.message);btn.disabled=false}};
 $('nexaRecoverBtn').onclick=async()=>{const btn=$('nexaRecoverBtn');btn.disabled=true;msg.textContent='Checking recovery code…';try{if($('nexaRecoverPw').value!==$('nexaRecoverConfirm').value)throw Error('Passwords do not match.');const d=await rpc('transfer_staff_reset_password',{p_identifier:$('nexaRecoverId').value.trim(),p_code:$('nexaRecoverCode').value.trim(),p_new_password:$('nexaRecoverPw').value});if(!d?.ok)throw Error('Recovery code is invalid or expired.');show('nexaLoginPane');msg.textContent='Password changed. You can now log in.'}catch(e){msg.textContent=e.message}finally{btn.disabled=false}};
}
function installStyle(){if($('nexa-staff-shared-css'))return;const s=document.createElement('style');s.id='nexa-staff-shared-css';s.textContent=`
#loginScreen.nexa-staff-shared-login:not(.hidden){display:block!important;padding:clamp(54px,11vh,110px) 16px 60px;min-height:100dvh;background:radial-gradient(circle at 0 0,#10202a,#0b0c1b 60%);color:#fff}
.nexa-staff-auth-brand{text-align:center;margin:0 auto 28px}.nexa-staff-auth-brand small{font-weight:950;letter-spacing:.25em;color:#a2eeff;font-size:12px}.nexa-staff-auth-brand h1{font-size:clamp(39px,8vw,65px);margin:12px 0;font-weight:950}.nexa-staff-auth-brand p{color:#b6c1d8;font-size:clamp(16px,4vw,24px)}
.nexa-staff-auth-card{width:min(740px,100%);margin:auto;padding:clamp(19px,5vw,38px);border:1px solid #30374f;border-radius:28px;background:#111626}.nexa-staff-auth-tabs{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:23px}.nexa-staff-auth-tabs button{background:transparent;color:#f5f6ff;border:1px solid #4d447b;border-radius:999px;padding:11px 16px;font-weight:900}.nexa-staff-auth-tabs button.active{background:linear-gradient(100deg,#346e93,#484084);border-color:#51c9f6}
.nexa-staff-auth-card label{display:grid;gap:8px;margin:14px 0;font-weight:850;color:#c0c9df}.nexa-staff-auth-card label input:not([type=checkbox]){width:100%;min-height:49px;background:#0d1324;border:1px solid #353d58;border-radius:13px;color:#fff;padding:12px}.nexa-staff-auth-card .nexa-staff-remember{display:flex!important;align-items:center;gap:10px;font-weight:600}.nexa-staff-remember input{width:20px;height:20px}.nexa-staff-auth-card button:not(.nexa-staff-auth-tabs button):not(.nexa-staff-link){border:1px solid #557baa;border-radius:14px;padding:12px 16px;color:#fff;background:linear-gradient(110deg,#355c91,#39366f);font-weight:850}.nexa-staff-auth-links{display:flex;gap:12px;margin:18px 0}.nexa-staff-auth-links button,.nexa-staff-link{background:transparent!important;border:0!important;color:#a9eeff!important;text-decoration:underline;padding:4px!important}.nexa-staff-login-status{color:#ffcf8b;white-space:pre-wrap;min-height:18px}
`;document.head.appendChild(s)}
let navBusy=false;
async function refreshNav(){const token=getToken(),sel=$('workspaceSwitch');if(!token||!sel||navBusy)return;navBusy=true;try{const d=await rpc('nexa_staff_workspace_access_v1',{p_token:token});if(!d?.ok)return;const state=getState(),mine=(d.modules||[]).filter(m=>!state||Number(m.state_number)===state),current=sel.value,local=[...sel.options].filter(o=>MODULE==='transfer'?o.value.includes('transfer-workspace.html'):o.value.includes('ministry-workspace.html'));sel.replaceChildren(...local);for(const m of mine){if(m.module===MODULE)continue;sel.add(new Option(m.label,m.url))}if([...sel.options].some(o=>o.value===current))sel.value=current;sel.onchange=()=>{if(sel.value)location.href=sel.value}}catch(e){console.warn('Workspace navigation',e)}finally{navBusy=false}}

function installTransferLogin(){
 const root=$('authRoot');if(!root||root.dataset.sharedAuthV2)return;root.dataset.sharedAuthV2='yes';
 root.innerHTML=`<div class="authLogo"><small>TRANSFER WORKSPACE</small><h1>Staff Access</h1><div class="muted" id="authDestination">Private transfer operations</div></div>
 <section class="card">
  <div class="authTabs"><button class="authTab active" id="nexaTransferLoginTab" type="button">Log In</button><button class="authTab" id="nexaTransferRegisterTab" type="button">First Time? Register</button></div>
  <div id="nexaTransferLoginPane">
   <label class="field">State / Server<input id="nexaTransferState" inputmode="numeric" placeholder="e.g. 1518" autocomplete="off"></label>
   <label class="field">Game ID<input id="nexaTransferGameId" inputmode="numeric" autocomplete="username"></label>
   <label class="field">Password<input id="nexaTransferPassword" type="password" autocomplete="current-password"></label>
   <label class="check" style="margin-top:12px"><input id="nexaTransferRemember" type="checkbox" checked> Remember me on this device</label>
   <div class="actions"><button class="btn" id="nexaTransferLoginBtn" type="button">Log In</button></div>
   <div class="actions"><button class="linkBtn" id="nexaTransferForgotPass" type="button">Forgot password?</button></div>
  </div>
  <div id="nexaTransferRegisterPane" class="hidden">
   <label class="field">State / Server<input id="nexaTransferRegState" inputmode="numeric" placeholder="e.g. 1518"></label>
   <label class="field">Game Name / IGN<input id="nexaTransferRegName"></label>
   <label class="field">Game ID<input id="nexaTransferRegId" inputmode="numeric"></label>
   <label class="field">Create Password<input id="nexaTransferRegPassword" type="password" autocomplete="new-password"></label>
   <label class="field">Confirm Password<input id="nexaTransferRegConfirm" type="password" autocomplete="new-password"></label>
   <label class="check" style="margin-top:12px"><input id="nexaTransferRegRemember" type="checkbox" checked> Remember me on this device</label>
   <div class="actions"><button class="btn" id="nexaTransferRegisterBtn" type="button">Register</button></div>
  </div>
  <div id="nexaTransferRecoveryPane" class="hidden">
   <h3>Use Recovery Code</h3>
   <label class="field">Game ID<input id="nexaTransferRecoverId" inputmode="numeric"></label>
   <label class="field">Recovery Code<input id="nexaTransferRecoverCode"></label>
   <label class="field">New Password<input id="nexaTransferRecoverPw" type="password" autocomplete="new-password"></label>
   <label class="field">Confirm New Password<input id="nexaTransferRecoverConfirm" type="password" autocomplete="new-password"></label>
   <div class="actions"><button class="btn" id="nexaTransferRecoverBtn" type="button">Change Password</button><button class="btn secondary" id="nexaTransferRecoverCancel" type="button">Cancel</button></div>
  </div>
  <div class="status" id="nexaTransferAuthStatus"></div>
 </section>`;
 const status=$('nexaTransferAuthStatus');
 const show=pane=>{for(const id of ['nexaTransferLoginPane','nexaTransferRegisterPane','nexaTransferRecoveryPane'])$(id)?.classList.toggle('hidden',id!==pane);$('nexaTransferLoginTab')?.classList.toggle('active',pane==='nexaTransferLoginPane');$('nexaTransferRegisterTab')?.classList.toggle('active',pane==='nexaTransferRegisterPane');status.textContent=''};
 $('nexaTransferLoginTab').onclick=()=>show('nexaTransferLoginPane');
 $('nexaTransferRegisterTab').onclick=()=>show('nexaTransferRegisterPane');
 $('nexaTransferForgotPass').onclick=()=>show('nexaTransferRecoveryPane');
 $('nexaTransferRecoverCancel').onclick=()=>show('nexaTransferLoginPane');
 $('nexaTransferLoginBtn').onclick=async()=>{const b=$('nexaTransferLoginBtn');b.disabled=true;status.textContent='Signing in…';try{const state=Number($('nexaTransferState').value.trim()),gid=$('nexaTransferGameId').value.trim();if(!Number.isInteger(state)||state<1)throw Error('Enter your State / Server.');if(!/^\d{4,24}$/.test(gid))throw Error('Enter a valid Game ID.');const d=await rpc('transfer_staff_login_v2',{p_state_number:state,p_game_id:gid,p_password:$('nexaTransferPassword').value,p_remember:$('nexaTransferRemember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveAuth(d.token,$('nexaTransferRemember').checked,state);location.href=`transfer-workspace.html?state=${encodeURIComponent(state)}`}catch(e){status.textContent=humanError(e.message);b.disabled=false}};
 $('nexaTransferRegisterBtn').onclick=async()=>{const b=$('nexaTransferRegisterBtn');b.disabled=true;status.textContent='Registering…';try{const state=Number($('nexaTransferRegState').value.trim()),gid=$('nexaTransferRegId').value.trim(),pw=$('nexaTransferRegPassword').value;if(pw!==$('nexaTransferRegConfirm').value)throw Error('Passwords do not match.');const resolved=await rpc('transfer_workspace_resolve',{p_state:state});if(!resolved?.ok||!resolved.workspace_id)throw Error('No active Transfer Workspace was found for this State.');const d=await rpc('transfer_staff_register_v2',{p_workspace_id:resolved.workspace_id,p_state_number:state,p_game_name:$('nexaTransferRegName').value.trim(),p_game_id:gid,p_password:pw,p_remember:$('nexaTransferRegRemember').checked});if(!d?.ok)throw Error(humanError(d?.error));saveAuth(d.token,$('nexaTransferRegRemember').checked,state);location.href=`transfer-workspace.html?workspace=${encodeURIComponent(resolved.workspace_id)}&state=${encodeURIComponent(state)}`}catch(e){status.textContent=humanError(e.message);b.disabled=false}};
 $('nexaTransferRecoverBtn').onclick=async()=>{const b=$('nexaTransferRecoverBtn');b.disabled=true;status.textContent='Checking recovery code…';try{if($('nexaTransferRecoverPw').value!==$('nexaTransferRecoverConfirm').value)throw Error('Passwords do not match.');const d=await rpc('transfer_staff_reset_password',{p_identifier:$('nexaTransferRecoverId').value.trim(),p_code:$('nexaTransferRecoverCode').value.trim(),p_new_password:$('nexaTransferRecoverPw').value});if(!d?.ok)throw Error('Recovery code is invalid or expired.');show('nexaTransferLoginPane');status.textContent='Password changed. You can now log in.'}catch(e){status.textContent=e.message}finally{b.disabled=false}};
}
function installUsernameFirewall(){
 if($('nexa-no-username-css'))return;
 const st=document.createElement('style');st.id='nexa-no-username-css';st.textContent=`
 .staffUser,[data-access-copy-user],[data-access-change-user],#changeUsernameModal,#forgotUserModal{display:none!important}
 `;document.head.appendChild(st);
 const clean=()=>{
   document.querySelectorAll('.detailItem').forEach(el=>{const t=(el.querySelector('small')?.textContent||'').trim().toUpperCase();if(t==='USERNAME')el.remove()});
   document.querySelectorAll('button,a,label,small,b,div,p,span').forEach(el=>{
     if(el.children.length===0 && /\busername\b/i.test(el.textContent||'')) {
       const txt=(el.textContent||'').trim();
       if(/^(username|copy username|change username|forgot username)/i.test(txt)) el.style.display='none';
     }
   });
 };
 clean();new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});
}

function init(){installStyle();if(MODULE==='ministry'){$('loginScreen')?.classList.add('nexa-staff-shared-login');installMinistryLogin()}
if(MODULE==='transfer'){installTransferLogin();installUsernameFirewall()}setTimeout(refreshNav,50);window.addEventListener('pageshow',refreshNav)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();