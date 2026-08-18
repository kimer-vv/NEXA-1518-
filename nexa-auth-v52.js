(() => {
'use strict';

const SUPABASE_URL = 'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let sb;
let gate;
let activeTab = 'login';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));

function decorativeName(value){
  for(const ch of String(value || '')){
    const cp = ch.codePointAt(0);
    if(
      (cp >= 0x1D400 && cp <= 0x1D7FF) || // mathematical/decorative alphabets
      (cp >= 0xFF00 && cp <= 0xFFEF) ||   // full-width forms
      (cp >= 0x2460 && cp <= 0x24FF)      // enclosed alphanumerics
    ) return true;
  }
  return false;
}

function styles(){
  const css = document.createElement('style');
  css.id = 'nexa-v52-auth-style';
  css.textContent = `
  #nexa-auth-gate{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:20px;overflow:auto;color:#fff;background:#050718}
  #nexa-auth-gate.hidden{display:none!important}
  .nexa-auth-space{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:
    radial-gradient(circle at 18% 17%,rgba(118,61,255,.34),transparent 31%),
    radial-gradient(circle at 82% 75%,rgba(17,119,255,.23),transparent 36%),
    radial-gradient(circle at 55% 42%,rgba(210,42,255,.11),transparent 28%),
    linear-gradient(150deg,#050718,#090d27 48%,#050717)}
  .nexa-star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 7px rgba(172,190,255,.8);animation:nexaTwinkle var(--d) ease-in-out infinite;animation-delay:var(--delay);opacity:.18}
  @keyframes nexaTwinkle{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.9;transform:scale(1.35)}}
  .nexa-comet{position:absolute;top:13%;left:-230px;width:190px;height:2px;transform:rotate(-19deg);background:linear-gradient(90deg,transparent,rgba(168,190,255,.3),#fff);filter:drop-shadow(0 0 8px #898aff);animation:nexaComet 7.5s ease-out 1.2s infinite}
  .nexa-comet:after{content:"";position:absolute;right:-4px;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 18px #8b86ff}
  @keyframes nexaComet{0%,70%{left:-230px;top:13%;opacity:0}72%{opacity:1}88%{left:115%;top:54%;opacity:1}90%,100%{left:115%;top:54%;opacity:0}}
  .nexa-auth-card{position:relative;z-index:2;width:min(500px,100%);padding:26px;border-radius:28px;background:rgba(8,12,31,.82);border:1px solid rgba(151,126,255,.38);box-shadow:0 30px 95px rgba(0,0,0,.48),0 0 45px rgba(95,63,255,.16);backdrop-filter:blur(22px)}
  .nexa-auth-logo{width:58px;height:58px;border-radius:19px;margin:0 auto 11px;display:grid;place-items:center;font-size:31px;background:linear-gradient(135deg,#8241ff,#158fff);box-shadow:0 0 32px rgba(93,80,255,.42)}
  .nexa-auth-brand{text-align:center;margin-bottom:20px}.nexa-auth-brand h1{margin:0;font-size:29px;letter-spacing:.17em}.nexa-auth-brand p{margin:5px 0 0;color:#9fa8cc;font-size:12px;letter-spacing:.08em}
  .nexa-auth-tabs{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);margin-bottom:20px}
  .nexa-auth-tab{border:0;border-radius:11px;padding:11px 8px;color:#8f98bb;background:transparent;font-weight:900;letter-spacing:.06em;cursor:pointer}
  .nexa-auth-tab.active{color:#fff;background:linear-gradient(135deg,rgba(112,70,255,.42),rgba(25,137,255,.24));box-shadow:inset 0 0 0 1px rgba(139,116,255,.34)}
  .nexa-auth-pane{display:none}.nexa-auth-pane.active{display:block}
  .nexa-auth-pane h2{font-size:20px;margin:0 0 5px}.nexa-auth-pane>.sub{color:#9da6c7;font-size:13px;margin:0 0 17px;line-height:1.45}
  .nexa-auth-form{display:grid;gap:12px}.nexa-auth-form label{display:grid;gap:6px;color:#cbd1e5;font-size:12px;font-weight:800}
  .nexa-auth-form input,.nexa-auth-form select{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.13);border-radius:12px;padding:12px 13px;background:rgba(255,255,255,.045);color:#fff;outline:none;font:inherit}
  .nexa-auth-form select option{color:#111}.nexa-auth-form input:focus,.nexa-auth-form select:focus{border-color:#7568ff;box-shadow:0 0 0 3px rgba(117,104,255,.12)}
  .nexa-auth-submit{border:0;border-radius:13px;padding:13px 15px;font-weight:950;letter-spacing:.05em;color:#fff;background:linear-gradient(135deg,#7a3eff,#168fff);cursor:pointer}
  .nexa-auth-help{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;font-size:11px;color:#8d97ba}
  .nexa-auth-link{border:0;background:transparent;padding:0;color:#b7b5ff;font:inherit;font-weight:800;cursor:pointer}
  .nexa-auth-note{margin-top:12px;padding:11px 12px;border-radius:12px;border:1px solid rgba(123,105,255,.22);background:rgba(108,77,255,.07);color:#9ea8cb;font-size:11px;line-height:1.5}
  .nexa-auth-message{min-height:19px;margin-top:11px;color:#98a4c9;font-size:12px;line-height:1.45}.nexa-auth-message.error{color:#ff9ba8}.nexa-auth-message.good{color:#85e9b6}
  .nexa-owner-lock{position:absolute;right:12px;bottom:11px;width:34px;height:34px;border:0;border-radius:50%;background:transparent;color:rgba(221,222,255,.35);font-size:16px;cursor:pointer}.nexa-owner-lock:hover{background:rgba(255,255,255,.05);color:#fff}
  .nexa-field-hint{font-weight:500;color:#7f89aa;line-height:1.35}
  @media(max-width:540px){.nexa-auth-card{padding:21px 18px;border-radius:23px}.nexa-auth-brand h1{font-size:25px}}
  `;
  document.head.appendChild(css);
}

function stars(container){
  for(let i=0;i<55;i++){
    const s=document.createElement('span');
    s.className='nexa-star';
    s.style.left=(Math.random()*100)+'%';
    s.style.top=(Math.random()*100)+'%';
    s.style.setProperty('--d',(2.2+Math.random()*4.8)+'s');
    s.style.setProperty('--delay',(-Math.random()*5)+'s');
    if(Math.random()>.7){s.style.width='3px';s.style.height='3px'}
    container.appendChild(s);
  }
}

function markup(){
  gate=document.createElement('div');
  gate.id='nexa-auth-gate';
  gate.innerHTML=`
  <div class="nexa-auth-space" id="nexa-auth-space"><div class="nexa-comet"></div></div>
  <section class="nexa-auth-card">
    <div class="nexa-auth-brand">
      <div class="nexa-auth-logo">✦</div>
      <h1>NEXA</h1>
      <p>STATE 1518 • MANAGEMENT & EVENT COORDINATION</p>
    </div>

    <div class="nexa-auth-tabs">
      <button type="button" class="nexa-auth-tab active" data-auth-tab="login">LOGIN</button>
      <button type="button" class="nexa-auth-tab" data-auth-tab="create">CREATE ACCOUNT</button>
    </div>

    <div id="nexa-pane-login" class="nexa-auth-pane active">
      <h2>Welcome Back</h2>
      <p class="sub">Use your Game ID and NEXA Password to continue.</p>
      <form id="nexa-login-form" class="nexa-auth-form">
        <label>Game ID
          <input id="nexa-login-game-id" required autocomplete="username" inputmode="numeric" placeholder="Enter your Game ID">
        </label>
        <label>NEXA Password
          <input id="nexa-login-password" required minlength="8" type="password" autocomplete="current-password" placeholder="Enter your password">
        </label>
        <button class="nexa-auth-submit" type="submit">LOGIN</button>
      </form>
      <div class="nexa-auth-help">
        <span>Any linked Game ID can later access the same NEXA profile.</span>
        <button id="nexa-forgot" class="nexa-auth-link" type="button">Forgot Password?</button>
      </div>
    </div>

    <div id="nexa-pane-create" class="nexa-auth-pane">
      <h2>Create Your NEXA Account</h2>
      <p class="sub">Set up your Main Game Account. Additional accounts can be added after registration.</p>
      <form id="nexa-create-form" class="nexa-auth-form">
        <label>Main Game ID
          <input id="nexa-create-game-id" required autocomplete="username" inputmode="numeric" placeholder="Enter your Main Game ID">
          <span class="nexa-field-hint">Your first account becomes your Main Account.</span>
        </label>
        <label>In-Game Name
          <input id="nexa-create-name" required maxlength="40" autocomplete="nickname" placeholder="Your current in-game name">
        </label>
        <label>Alliance
          <select id="nexa-create-alliance" required><option value="">Loading alliances…</option></select>
        </label>
        <label id="nexa-custom-alliance-wrap" style="display:none">Alliance Tag
          <input id="nexa-create-custom-alliance" maxlength="12" placeholder="Enter alliance tag">
        </label>
        <label>Create NEXA Password
          <input id="nexa-create-password" required minlength="8" type="password" autocomplete="new-password" placeholder="At least 8 characters">
        </label>
        <label>Confirm Password
          <input id="nexa-create-password2" required minlength="8" type="password" autocomplete="new-password" placeholder="Repeat password">
        </label>
        <button class="nexa-auth-submit" type="submit">CREATE ACCOUNT</button>
      </form>
      <div class="nexa-auth-note"><b>Main Account:</b> You can save up to 5 game accounts in NEXA. Your Main Account appears first by default. Additional account setup and Full / Buff-Only options are the next account-management phase.</div>
    </div>

    <div id="nexa-auth-message" class="nexa-auth-message"></div>
    <button id="nexa-owner-lock" class="nexa-owner-lock" type="button" aria-label="Owner access" title="Owner access">🔒</button>
  </section>`;
  document.body.prepend(gate);
  stars($('nexa-auth-space'));
}

function msg(text='',kind=''){
  const el=$('nexa-auth-message');
  if(!el)return;
  el.textContent=text;
  el.className='nexa-auth-message'+(kind?' '+kind:'');
}

function show(tab='login'){
  activeTab=tab;
  gate?.classList.remove('hidden');
  document.body.style.overflow='hidden';
  document.querySelectorAll('.nexa-auth-tab').forEach(x=>x.classList.toggle('active',x.dataset.authTab===tab));
  $('nexa-pane-login')?.classList.toggle('active',tab==='login');
  $('nexa-pane-create')?.classList.toggle('active',tab==='create');
  msg('');
}
function hide(){
  gate?.classList.add('hidden');
  document.body.style.overflow='';
}

async function api(path,body={},token=''){
  const r=await fetch(path,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
    body:JSON.stringify(body),
    cache:'no-store'
  });
  const raw=await r.text();
  let data={};try{data=raw?JSON.parse(raw):{}}catch{}
  if(!r.ok)throw new Error(data.error||raw||`Request failed (${r.status})`);
  return data;
}

async function loadAlliances(){
  try{
    const data=await api('/api/nexa-auth-alliances');
    const select=$('nexa-create-alliance');
    select.innerHTML='<option value="">Select alliance</option>'+
      (data.alliances||[]).map(a=>`<option value="${esc(a.id)}">${esc(a.tag)}</option>`).join('')+
      '<option value="not-listed">Not Listed</option>';
  }catch(e){
    $('nexa-create-alliance').innerHTML='<option value="">Could not load alliances</option><option value="not-listed">Not Listed</option>';
  }
}

async function status(session){
  if(!session?.access_token)return {allowed:false};
  try{return await api('/api/nexa-auth-status',{},session.access_token)}
  catch{return {allowed:false}}
}

async function reconcile(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){
    show('login');
    document.documentElement.classList.remove('nexa-auth-boot');
    return;
  }
  const st=await status(session);
  if(st.allowed){
    hide();
    document.documentElement.classList.remove('nexa-auth-boot');
    return;
  }
  // Old/non-owner Discord sessions are not a general login method anymore.
  await sb.auth.signOut();
  show('login');
  document.documentElement.classList.remove('nexa-auth-boot');
  msg('Please sign in with your Game ID and NEXA Password.','');
}

async function login(e){
  e.preventDefault();
  msg('Signing in…');
  try{
    const data=await api('/api/nexa-auth-login',{
      game_id:$('nexa-login-game-id').value.trim(),
      password:$('nexa-login-password').value
    });
    const {error}=await sb.auth.setSession({
      access_token:data.session.access_token,
      refresh_token:data.session.refresh_token
    });
    if(error)throw error;
    msg('Welcome back.','good');
    await reconcile();
    location.reload();
  }catch(e){msg(e.message,'error')}
}

async function create(e){
  e.preventDefault();
  msg('');
  const gameId=$('nexa-create-game-id').value.trim();
  const ign=$('nexa-create-name').value.trim();
  const p1=$('nexa-create-password').value;
  const p2=$('nexa-create-password2').value;
  const alliance=$('nexa-create-alliance').value;

  if(decorativeName(ign)){
    return msg('Decorative characters are not supported. Please use standard letters for your In-Game Name.','error');
  }
  if(p1!==p2)return msg('Passwords do not match.','error');
  if(p1.length<8)return msg('NEXA Password must be at least 8 characters.','error');
  if(!alliance)return msg('Select your alliance.','error');

  msg('Creating your NEXA account…');
  try{
    const data=await api('/api/nexa-auth-create',{
      game_id:gameId,
      in_game_name:ign,
      alliance_id:alliance==='not-listed'?null:Number(alliance),
      custom_alliance_tag:alliance==='not-listed'?$('nexa-create-custom-alliance').value.trim():null,
      password:p1
    });
    const {error}=await sb.auth.setSession({
      access_token:data.session.access_token,
      refresh_token:data.session.refresh_token
    });
    if(error)throw error;
    msg('Account created. Welcome to NEXA.','good');
    await reconcile();
    location.reload();
  }catch(e){msg(e.message,'error')}
}

async function init(){
  styles();markup();
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

  document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.authTab)));
  $('nexa-login-form').addEventListener('submit',login);
  $('nexa-create-form').addEventListener('submit',create);
  $('nexa-owner-lock').addEventListener('click',()=>{ location.href='/owner-access.html'; });
  $('nexa-forgot').addEventListener('click',()=>msg('Forgot your password? Ask your R5 or an authorized NEXA administrator for help. 30-minute recovery codes will be added in the recovery phase.',''));
  $('nexa-create-alliance').addEventListener('change',e=>{
    const custom=e.target.value==='not-listed';
    $('nexa-custom-alliance-wrap').style.display=custom?'grid':'none';
    $('nexa-create-custom-alliance').required=custom;
  });

  window.NEXAAuth={show,reconcile};
  await loadAlliances();
  await reconcile();
  sb.auth.onAuthStateChange(()=>setTimeout(reconcile,0));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();