/* NEXA Staff Workspace Shared UI V1.1
   CREATE: nexa-staff-workspace-shared-v1.js
   Identity is shared; module authorization is NOT shared.
   Install with one script tag in Transfer and Ministry; Gift has its own dropdown.
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
function modal(title,body,{confirmText='Confirm',danger=false,inputLabel='',verify='',showCancel=true}={}){
 return new Promise(resolve=>{
  const box=document.createElement('div');box.className='nexa-modal-backdrop';
  const panel=document.createElement('section');panel.className='nexa-modal-card';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=body;panel.append(h,p);
  let input=null;if(inputLabel){const label=document.createElement('label');label.textContent=inputLabel;input=document.createElement('input');input.autocomplete='off';label.append(input);panel.append(label)}
  const actions=document.createElement('div');actions.className='nexa-modal-actions';const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.hidden=!showCancel;const ok=document.createElement('button');ok.textContent=confirmText;if(danger)ok.className='danger';actions.append(cancel,ok);panel.append(actions);box.append(panel);document.body.append(box);
  const finish=value=>{box.remove();resolve(value)};cancel.onclick=()=>finish(null);box.onclick=e=>{if(e.target===box)finish(null)};
  ok.onclick=()=>{if(verify&&String(input?.value||'').trim().toUpperCase()!==verify){input?.setAttribute('aria-invalid','true');input?.focus();return}finish(input?input.value:true)};
  input?.focus();
 });
}
window.nexaWorkspaceModal=modal;
function ensureHeaderLayout(){
 const style=$('nexa-staff-shared-css');if(style&&!style.dataset.v2){style.dataset.v2='1';style.textContent+=`
 #nexa-staff-module-nav{display:none!important}
 #workspaceRoot>.top,#app>.top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;background:transparent!important}
 #workspaceRoot>.top .workspaceTopActions,#app>.top .top-actions{display:flex;flex-direction:column;align-items:stretch;gap:9px;margin-left:auto;width:min(218px,100%)}
 #workspaceRoot>.top .workspaceSwitch,#app>.top .workspace-select{max-width:100%;width:100%;min-height:45px;border:1px solid #554c90;border-radius:13px;background:#151b34;color:#fff;font-size:13px;font-weight:850;padding:8px 12px}
 #workspaceRoot>.top #logoutBtn,#app>.top #logoutBtn{min-height:42px;width:100%;border:1px solid #52618d;border-radius:13px;background:#141b30;color:#f5f7ff;font-size:13px}
 .nexa-modal-backdrop{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:17px;background:rgba(1,4,15,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
 .nexa-modal-card{width:min(490px,100%);max-height:87dvh;overflow:auto;padding:22px;border-radius:24px;background:linear-gradient(145deg,#172045,#090f25);border:1px solid #7664b5;box-shadow:0 25px 80px #000a;color:#fff;font-family:system-ui,-apple-system,sans-serif}
 .nexa-modal-card h2{font-size:23px;margin:0 0 10px;color:#d2d6ff}.nexa-modal-card p{color:#c1c9e5;line-height:1.55;white-space:pre-line}
 .nexa-modal-card label{display:grid;gap:8px;color:#c6d4f0;font-weight:800}.nexa-modal-card input{min-height:48px;padding:12px;background:#080e23;border:1px solid #6874a8;border-radius:13px;color:#fff;font:inherit}
 .nexa-modal-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:23px}
 .nexa-modal-actions button{border:1px solid #7281b8;border-radius:13px;background:linear-gradient(120deg,#5547bb,#167eaa);color:#fff;min-height:43px;padding:10px 17px;font-weight:850}
 .nexa-modal-actions button:first-child{background:#17213b}.nexa-modal-actions button.danger{background:#653048;border-color:#ee81ab}
 @media(max-width:560px){#workspaceRoot>.top .workspaceTopActions,#app>.top .top-actions{width:min(185px,48%);margin-left:auto}#workspaceRoot>.top .brand,#app>.top .brand{flex:1;min-width:0}#workspaceRoot>.top .brand h1,#app>.top .brand h1{font-size:clamp(23px,6vw,36px)}}`}
}
let navBusy=false;
async function refreshNav(){
 const token=getToken();const sel=$('workspaceSwitch');if(!token||!sel||navBusy)return;
 const root=MODULE==='ministry'?$('app'):$('workspaceRoot');if(root?.classList.contains('hidden'))return;
 navBusy=true;
 try{const d=await rpc('nexa_staff_workspace_access_v1',{p_token:token});if(!d?.ok)return;
  const mine=d.modules||[];const current=sel.value;const local=[...sel.options].filter(o=>MODULE==='transfer'?o.value.includes('transfer-workspace.html'):o.value.includes('ministry-workspace.html'));
  if(!mine.some(x=>x.module===MODULE))return;
  sel.replaceChildren(...local);
  for(const m of mine){if(m.module===MODULE)continue;const o=new Option(m.label,m.url);sel.add(o)}
  if([...sel.options].some(o=>o.value===current))sel.value=current;
  sel.onchange=()=>{if(sel.value)location.href=sel.value};
 }catch(e){console.warn('Workspace navigation',e)}finally{navBusy=false}
}
function installMinistryModals(){if(MODULE!=='ministry')return;const btn=$('resetAllBtn');if(btn){btn.onclick=async()=>{
  if(!getToken())return;
  const result=await modal('Reset All Ministry Data','This clears ALL requests, responses and appointments in this Ministry Workspace, across all linked events. Staff access remains. Type RESET to confirm.',{inputLabel:'Confirmation',verify:'RESET',confirmText:'Reset All',danger:true});
  if(result===null)return;btn.disabled=true;try{
   const workspace=new URLSearchParams(location.search).get('workspace')||$('workspaceSwitch')?.value?.match(/workspace=([0-9a-f-]{36})/)?.[1];
   if(!workspace)throw Error('Open your Ministry Workspace before resetting.');
   const d=await rpc('ministry_owner_reset_v2',{p_workspace_id:workspace,p_token:getToken(),p_event_id:null});if(!d?.ok)throw Error(d?.error||'Reset failed');
   await modal('Ministry Cleared',`${d.requests_deleted||0} requests and ${d.appointments_deleted||0} appointments removed.`,{confirmText:'Done'});location.reload();
  }catch(e){await modal('Unable to Reset',e.message||String(e),{confirmText:'OK'});btn.disabled=false}
 }}
 // Replace legacy Safari confirmations used in the other Ministry actions with async NEXA dialogs in the source file's next release.
}
function init(){installStyle();ensureHeaderLayout();if(MODULE==='ministry'){$('loginScreen')?.classList.add('nexa-staff-shared-login');installMinistryLogin()};
 const observer=new MutationObserver(()=>{if(getToken())refreshNav()});observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
 const run=()=>{refreshNav();installMinistryModals()};setTimeout(run,50);window.addEventListener('pageshow',run);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();