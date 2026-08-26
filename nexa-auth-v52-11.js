(() => {
'use strict';
// NEXA V52.15 — SLIM AUTH / COMPACT LOGIN + CREATE ACCOUNT — 2026-08-25

const SUPABASE_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SUPABASE_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let sb,gate;
const $=id=>document.getElementById(id);

function decorativeName(value){for(const ch of String(value||'')){const cp=ch.codePointAt(0);if((cp>=0x1D400&&cp<=0x1D7FF)||(cp>=0xFF00&&cp<=0xFFEF)||(cp>=0x2460&&cp<=0x24FF))return true}return false}
function digitsOnly(el,max=12){if(!el)return;el.value=String(el.value||'').replace(/\D/g,'').slice(0,max)}
function validGameId(v){return /^[0-9]{6,12}$/.test(String(v||''))}

function styles(){
  document.getElementById('nexa-v52-auth-style')?.remove();
  const css=document.createElement('style');
  css.id='nexa-v52-auth-style';
  css.textContent=`
  #nexa-auth-gate{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:14px;overflow:auto;color:#fff;background:#050718}
  #nexa-auth-gate.hidden{display:none!important}
  .nexa-auth-space{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:radial-gradient(circle at 18% 17%,rgba(118,61,255,.28),transparent 31%),radial-gradient(circle at 82% 75%,rgba(17,119,255,.18),transparent 36%),radial-gradient(circle at 55% 42%,rgba(210,42,255,.08),transparent 28%),linear-gradient(150deg,#050718,#090d27 48%,#050717)}
  .nexa-star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 7px rgba(172,190,255,.8);animation:nexaTwinkle var(--d) ease-in-out infinite;animation-delay:var(--delay);opacity:.18}
  @keyframes nexaTwinkle{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.9;transform:scale(1.35)}}
  .nexa-comet{position:absolute;top:13%;left:-230px;width:190px;height:2px;transform:rotate(-19deg);background:linear-gradient(90deg,transparent,rgba(168,190,255,.3),#fff);filter:drop-shadow(0 0 8px #898aff);animation:nexaComet 7.5s ease-out 1.2s infinite}
  @keyframes nexaComet{0%,70%{left:-230px;top:13%;opacity:0}72%{opacity:1}88%{left:115%;top:54%;opacity:1}90%,100%{left:115%;top:54%;opacity:0}}

  .nexa-auth-card{position:relative;z-index:2;width:min(390px,100%);padding:16px 16px 36px;border-radius:22px;background:linear-gradient(155deg,rgba(7,13,34,.9),rgba(9,8,29,.86));border:1px solid rgba(126,145,255,.28);box-shadow:0 22px 70px rgba(0,0,0,.46),0 0 28px rgba(95,63,255,.10);backdrop-filter:blur(18px)}
  .nexa-auth-logo{width:42px;height:42px;border-radius:14px;margin:0 auto 6px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#8241ff,#158fff);box-shadow:0 0 20px rgba(93,80,255,.32)}
  .nexa-auth-logo img{width:100%;height:100%;object-fit:contain}
  .nexa-auth-brand{text-align:center;margin-bottom:10px}
  .nexa-auth-brand h1{margin:0;font-size:22px;letter-spacing:.16em}
  .nexa-auth-brand p{margin:3px 0 0;color:#9fa8cc;font-size:8.5px;letter-spacing:.08em;white-space:nowrap}

  .nexa-auth-guide{display:flex;align-items:center;gap:9px;margin:0 0 10px;padding:7px 9px;border-radius:11px;border:1px solid rgba(79,200,255,.20);background:linear-gradient(135deg,rgba(9,28,57,.55),rgba(32,10,57,.38))}
  .nexa-auth-guide-orb{width:28px;height:28px;flex:0 0 28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#9cf5ff,#5c6eff 52%,#6e2bbf 100%);box-shadow:0 0 14px rgba(76,213,255,.34)}
  .nexa-auth-guide-orb:after{content:"";width:10px;height:7px;border-radius:999px;background:#050b1b;box-shadow:0 0 6px #59e9ff inset}
  .nexa-auth-guide b{display:block;font-size:8px;letter-spacing:.12em;color:#67e7ff}
  .nexa-auth-guide span{display:block;margin-top:1px;font-size:9px;line-height:1.25;color:#aab6d5}

  .nexa-auth-tabs{display:grid;grid-template-columns:1fr 1fr;padding:3px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);margin-bottom:12px}
  .nexa-auth-tab{border:0;border-radius:9px;padding:8px 6px;color:#8f98bb;background:transparent;font-size:10.5px;font-weight:900;letter-spacing:.06em}
  .nexa-auth-tab.active{color:#fff;background:linear-gradient(135deg,rgba(112,70,255,.38),rgba(25,137,255,.22));box-shadow:inset 0 0 0 1px rgba(139,116,255,.30)}

  .nexa-auth-pane{display:none}
  .nexa-auth-pane.active{display:block}
  .nexa-auth-pane h2{font-size:17px;margin:0 0 3px}
  .nexa-auth-pane>.sub{color:#9da6c7;font-size:10px;margin:0 0 10px;line-height:1.35}
  .nexa-auth-form{display:grid;gap:8px}
  .nexa-auth-form label{display:grid;gap:4px;color:#cbd1e5;font-size:10px;font-weight:800}
  .nexa-auth-form input{width:100%;box-sizing:border-box;min-height:42px;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 11px;background:rgba(255,255,255,.04);color:#fff;outline:none;font:inherit;font-size:13px}
  .nexa-auth-form input::placeholder{color:#929ab5;font-weight:600}
  .nexa-auth-form input:focus{border-color:#7568ff;box-shadow:0 0 0 2px rgba(117,104,255,.11)}
  .nexa-field-hint{display:none}

  .nexa-auth-submit{width:100%;min-height:40px;border:0;border-radius:11px;padding:9px 12px;font-size:11px;font-weight:950;letter-spacing:.06em;color:#fff;background:linear-gradient(135deg,#7a3eff,#168fff)}
  .nexa-auth-help{display:flex;justify-content:flex-end;align-items:center;margin-top:7px;font-size:9.5px}
  .nexa-auth-help>span{display:none}
  .nexa-auth-link{border:0;background:transparent;padding:0;color:#b7b5ff;font:inherit;font-weight:800}
  .nexa-auth-note{margin-top:8px;padding:7px 9px;border-radius:9px;border:1px solid rgba(123,105,255,.18);background:rgba(108,77,255,.055);color:#9ea8cb;font-size:9px;line-height:1.35}
  .nexa-auth-message{min-height:14px;margin-top:7px;color:#98a4c9;font-size:10px;line-height:1.35}
  .nexa-auth-message.error{color:#ff9ba8}.nexa-auth-message.good{color:#85e9b6}
  .nexa-owner-lock{position:absolute;right:9px;bottom:7px;width:29px;height:29px;border:0;border-radius:50%;background:transparent;color:rgba(221,222,255,.55);font-size:14px}

  .nexa-verify-overlay{position:fixed;inset:0;z-index:1000001;display:grid;place-items:center;padding:18px;background:rgba(1,3,14,.86);backdrop-filter:blur(12px)}
  .nexa-verify-card{width:min(360px,100%);border:1px solid rgba(95,201,255,.38);border-radius:18px;padding:16px;background:linear-gradient(150deg,#0b1430,#08091f);box-shadow:0 25px 70px rgba(0,0,0,.55),0 0 28px rgba(99,73,255,.14)}
  .nexa-verify-card h3{margin:0 0 6px;font-size:17px}.nexa-verify-card p{color:#9faed0;font-size:10px;line-height:1.4}
  .nexa-verify-values{display:grid;gap:6px;margin:11px 0;padding:10px;border-radius:11px;background:rgba(255,255,255,.04);font-size:11px}.nexa-verify-values b{color:#72e7ff}
  .nexa-verify-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.nexa-verify-actions button{border:1px solid rgba(117,139,222,.35);border-radius:10px;padding:10px;color:#fff;background:#111936;font-size:10px;font-weight:900}.nexa-verify-actions .yes{border:0;background:linear-gradient(135deg,#704aff,#219cff)}

  @media(max-width:540px){
    #nexa-auth-gate{place-items:start center;padding-top:max(12px,calc(env(safe-area-inset-top) + 6px));padding-bottom:max(12px,env(safe-area-inset-bottom))}
    .nexa-auth-card{width:min(370px,calc(100vw - 22px));padding:14px 14px 34px;border-radius:20px;margin:auto 0}
    .nexa-auth-brand h1{font-size:21px}
    .nexa-auth-brand p{font-size:8px}
  }
  `;
  document.head.appendChild(css)
}

function stars(container){for(let i=0;i<55;i++){const s=document.createElement('span');s.className='nexa-star';s.style.left=(Math.random()*100)+'%';s.style.top=(Math.random()*100)+'%';s.style.setProperty('--d',(2.2+Math.random()*4.8)+'s');s.style.setProperty('--delay',(-Math.random()*5)+'s');container.appendChild(s)}}

function markup(){
  document.getElementById('nexa-auth-gate')?.remove();
  gate=document.createElement('div');
  gate.id='nexa-auth-gate';
  gate.innerHTML=`
  <div class="nexa-auth-space" id="nexa-auth-space"><div class="nexa-comet"></div></div>
  <section class="nexa-auth-card">
    <div class="nexa-auth-brand">
      <div class="nexa-auth-logo"><img src="/nexa-icon.png" alt="NEXA"></div>
      <h1>NEXA</h1>
      <p>ONE HUB • MANAGEMENT, EVENTS &amp; COORDINATION</p>
    </div>

    <div class="nexa-auth-guide">
      <div class="nexa-auth-guide-orb"></div>
      <div><b>NEXA // ACCESS</b><span>Sign in or create your account to enter your hub.</span></div>
    </div>

    <div class="nexa-auth-tabs">
      <button type="button" class="nexa-auth-tab active" data-auth-tab="login">LOGIN</button>
      <button type="button" class="nexa-auth-tab" data-auth-tab="create">CREATE ACCOUNT</button>
    </div>

    <div id="nexa-pane-login" class="nexa-auth-pane active">
      <h2>Welcome Back</h2>
      <p class="sub">Game ID, State and NEXA Password.</p>
      <form id="nexa-login-form" class="nexa-auth-form">
        <label>Game ID<input id="nexa-login-game-id" required autocomplete="username" inputmode="numeric" pattern="[0-9]{6,12}" minlength="6" maxlength="12" placeholder="Numbers only"></label>
        <label>State<input id="nexa-login-state" required inputmode="numeric" pattern="[0-9]*" placeholder="State"></label>
        <label>NEXA Password<input id="nexa-login-password" required minlength="8" type="password" autocomplete="current-password" placeholder="Password"></label>
        <button class="nexa-auth-submit" type="submit">LOGIN</button>
      </form>
      <div class="nexa-auth-help"><span></span><button id="nexa-forgot" class="nexa-auth-link" type="button">Forgot Password?</button></div>
    </div>

    <div id="nexa-pane-create" class="nexa-auth-pane">
      <h2>Create Account</h2>
      <p class="sub">Create your Main Game Account.</p>
      <form id="nexa-create-form" class="nexa-auth-form">
        <label>Main Game ID<input id="nexa-create-game-id" required autocomplete="username" inputmode="numeric" pattern="[0-9]{6,12}" minlength="6" maxlength="12" placeholder="Numbers only"></label>
        <label>In-Game Name<input id="nexa-create-name" required maxlength="40" autocomplete="nickname" placeholder="In-game name"></label>
        <label>State<input id="nexa-create-state" required inputmode="numeric" pattern="[0-9]*" placeholder="State"></label>
        <label>Create NEXA Password<input id="nexa-create-password" required minlength="8" type="password" autocomplete="new-password" placeholder="At least 8 characters"></label>
        <label>Confirm Password<input id="nexa-create-password2" required minlength="8" type="password" autocomplete="new-password" placeholder="Repeat password"></label>
        <button class="nexa-auth-submit" type="submit">CREATE ACCOUNT</button>
      </form>
      <div class="nexa-auth-note">ⓘ This will be your Main Game Account. You can add more accounts and States later.</div>
    </div>

    <div id="nexa-auth-message" class="nexa-auth-message"></div>
    <button id="nexa-owner-lock" class="nexa-owner-lock" type="button" aria-label="Owner access" title="Owner access">🔒</button>
  </section>`;
  document.body.prepend(gate);
  stars($('nexa-auth-space'))
}

function msg(text='',kind=''){const el=$('nexa-auth-message');if(!el)return;el.textContent=text;el.className='nexa-auth-message'+(kind?' '+kind:'')}
function show(tab='login'){gate?.classList.remove('hidden');document.body.style.overflow='hidden';document.querySelectorAll('.nexa-auth-tab').forEach(x=>x.classList.toggle('active',x.dataset.authTab===tab));$('nexa-pane-login')?.classList.toggle('active',tab==='login');$('nexa-pane-create')?.classList.toggle('active',tab==='create');msg('')}
function hide(){gate?.classList.add('hidden');document.body.style.overflow=''}

async function api(path,body={},token=''){const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body),cache:'no-store'});const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{}if(!r.ok)throw new Error(data.error||raw||`Request failed (${r.status})`);return data}
async function status(session){if(!session?.access_token)return{allowed:false};try{return await api('/api/nexa-auth-status',{},session.access_token)}catch{return{allowed:false}}}
async function reconcile(){const {data:{session}}=await sb.auth.getSession();if(!session){show('login');document.documentElement.classList.remove('nexa-auth-boot');return}const st=await status(session);if(st.allowed){hide();document.documentElement.classList.remove('nexa-auth-boot');return}await sb.auth.signOut();show('login');document.documentElement.classList.remove('nexa-auth-boot')}

function verifyGameAccount(gameId,state){return new Promise(resolve=>{document.querySelector('.nexa-verify-overlay')?.remove();const ov=document.createElement('div');ov.className='nexa-verify-overlay';ov.innerHTML=`<div class="nexa-verify-card"><h3>Verify Your Game Account</h3><p>Confirm these details before creating the account.</p><div class="nexa-verify-values"><span>Game ID: <b>${gameId}</b></span><span>State: <b>${state}</b></span></div><div class="nexa-verify-actions"><button type="button" data-edit>EDIT</button><button type="button" class="yes" data-yes>YES, THIS IS CORRECT</button></div></div>`;document.body.appendChild(ov);ov.querySelector('[data-edit]').onclick=()=>{ov.remove();resolve(false)};ov.querySelector('[data-yes]').onclick=()=>{ov.remove();resolve(true)}})}

async function login(e){
  e.preventDefault();msg('Signing in…');
  try{
    const gameId=$('nexa-login-game-id').value.trim();
    if(!validGameId(gameId))throw new Error('Game ID must contain 6–12 numbers only.');
    const stateNumber=Number(String($('nexa-login-state').value||'').replace(/\D/g,''));
    if(!stateNumber)throw new Error('Enter your state.');
    const data=await api('/api/nexa-auth-login',{game_id:gameId,state_number:stateNumber,password:$('nexa-login-password').value});
    const {error}=await sb.auth.setSession({access_token:data.session.access_token,refresh_token:data.session.refresh_token});
    if(error)throw error;
    msg('Welcome back.','good');
    await reconcile();
    sessionStorage.setItem('nexa_show_returning_welcome','1');
    location.reload();
  }catch(e){msg(e.message,'error')}
}

async function create(e){
  e.preventDefault();msg('');
  const gameId=$('nexa-create-game-id').value.trim(),
        ign=$('nexa-create-name').value.trim(),
        p1=$('nexa-create-password').value,
        p2=$('nexa-create-password2').value,
        stateNumber=Number(String($('nexa-create-state').value||'').replace(/\D/g,''));
  if(!validGameId(gameId))return msg('Game ID must contain 6–12 numbers only.','error');
  if(!stateNumber)return msg('Enter your state.','error');
  if(decorativeName(ign))return msg('Decorative characters are not supported. Please use standard letters for your In-Game Name.','error');
  if(p1!==p2)return msg('Passwords do not match.','error');
  if(p1.length<8)return msg('NEXA Password must be at least 8 characters.','error');
  if(!(await verifyGameAccount(gameId,stateNumber)))return;
  msg('Creating account…');
  try{
    const data=await api('/api/nexa-auth-create',{game_id:gameId,in_game_name:ign,state_number:stateNumber,alliance_id:null,custom_alliance_tag:null,password:p1});
    const {error}=await sb.auth.setSession({access_token:data.session.access_token,refresh_token:data.session.refresh_token});
    if(error)throw error;
    await reconcile();
    location.reload()
  }catch(e){msg(e.message,'error')}
}

async function init(){
  styles();
  markup();
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.authTab)));
  $('nexa-login-form').addEventListener('submit',login);
  $('nexa-create-form').addEventListener('submit',create);
  $('nexa-owner-lock').addEventListener('click',()=>{location.href='/owner-access.html'});
  $('nexa-forgot').addEventListener('click',()=>msg('Forgot your password? Ask your R5 or an authorized NEXA administrator for help.',''));
  ['nexa-login-game-id','nexa-create-game-id'].forEach(id=>$(id)?.addEventListener('input',e=>digitsOnly(e.target,12)));
  ['nexa-login-state','nexa-create-state'].forEach(id=>$(id)?.addEventListener('input',e=>digitsOnly(e.target,6)));
  window.NEXAAuth={show,reconcile};
  await reconcile();
  sb.auth.onAuthStateChange(()=>setTimeout(reconcile,0))
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
