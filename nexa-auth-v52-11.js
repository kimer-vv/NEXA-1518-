(() => {
'use strict';
// NEXA V52.11 — ASTRONAUT REACHES MAIN LIGHT

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
  .nexa-welcome{position:fixed;inset:0;z-index:1000000;display:none;overflow:hidden;background:
    radial-gradient(circle at 77% 46%,rgba(112,66,255,.30),transparent 19%),
    radial-gradient(circle at 72% 48%,rgba(42,154,255,.18),transparent 30%),
    radial-gradient(circle at 28% 18%,rgba(143,59,255,.13),transparent 24%),
    linear-gradient(145deg,#03050f 0%,#071023 48%,#03050f 100%);color:#fff}
  .nexa-welcome.active{display:block}
  .nexa-welcome-stars{position:absolute;inset:0;overflow:hidden;pointer-events:none}
  .nexa-welcome-star{position:absolute;width:2px;height:2px;border-radius:50%;background:white;opacity:.2;box-shadow:0 0 8px rgba(180,196,255,.75);animation:nexaWelcomeTwinkle var(--wd) ease-in-out infinite;animation-delay:var(--wdelay)}
  @keyframes nexaWelcomeTwinkle{0%,100%{opacity:.12;transform:scale(.75)}50%{opacity:.95;transform:scale(1.5)}}
  .nexa-welcome-nebula{position:absolute;right:-3vw;top:16vh;width:min(52vw,680px);aspect-ratio:1;border-radius:50%;background:
    radial-gradient(circle at 44% 48%,#ffffff 0 1.2%,#b6d8ff 2.5%,rgba(110,121,255,.92) 7%,rgba(111,47,242,.64) 17%,rgba(38,88,214,.34) 31%,rgba(28,30,93,.10) 50%,transparent 68%);
    filter:blur(.2px) drop-shadow(0 0 70px rgba(109,91,255,.38));animation:nexaNebulaPulse 5.8s ease-in-out infinite;pointer-events:none}
  .nexa-welcome-nebula:before,.nexa-welcome-nebula:after{content:"";position:absolute;border-radius:50%;inset:15%;border:1px solid rgba(177,191,255,.12);transform:rotate(-22deg) scaleX(1.42)}
  .nexa-welcome-nebula:after{inset:28%;border-color:rgba(255,255,255,.10);transform:rotate(31deg) scaleX(1.7)}
  @keyframes nexaNebulaPulse{0%,100%{transform:scale(.97);filter:drop-shadow(0 0 58px rgba(109,91,255,.30))}50%{transform:scale(1.025);filter:drop-shadow(0 0 90px rgba(109,91,255,.52))}}
  .nexa-astronaut-wrap{position:absolute;right:18vw;top:15vh;width:min(43vw,540px);min-width:285px;animation:nexaFloat 7.2s ease-in-out infinite;transform-origin:65% 45%;filter:drop-shadow(0 22px 30px rgba(0,0,0,.38))}
  @keyframes nexaFloat{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-13px) rotate(1.5deg)}}
  .nexa-astronaut-svg{display:block;width:100%;height:auto;overflow:visible}
  .nexa-astronaut-hand{animation:nexaReach 6.8s ease-in-out infinite;transform-origin:78% 47%}
  @keyframes nexaReach{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(7px,-2px) rotate(-1deg)}}
  .nexa-touch-glow{animation:nexaTouch 2.8s ease-in-out infinite}
  @keyframes nexaTouch{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.3)}}
  .nexa-welcome-comet{position:absolute;left:-24vw;top:18%;width:220px;height:2px;transform:rotate(-17deg);background:linear-gradient(90deg,transparent,rgba(157,181,255,.38),#fff);filter:drop-shadow(0 0 8px #7b78ff);animation:nexaWelcomeComet 8.5s ease-out 1.8s infinite}
  .nexa-welcome-comet:after{content:"";position:absolute;right:-3px;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 20px #8d8aff}
  @keyframes nexaWelcomeComet{0%,72%{left:-24vw;top:18%;opacity:0}74%{opacity:1}90%{left:116vw;top:51%;opacity:1}92%,100%{left:116vw;top:51%;opacity:0}}
  .nexa-welcome-copy{position:absolute;left:clamp(26px,7vw,110px);top:50%;transform:translateY(-50%);z-index:4;width:min(42vw,560px)}
  .nexa-welcome-kicker{font-size:11px;letter-spacing:.34em;color:#8f98bf;font-weight:800;margin-bottom:12px;opacity:0;transform:translateY(10px);animation:nexaTextIn .8s ease .25s forwards}
  .nexa-welcome-copy h1{margin:0;font-size:clamp(42px,6vw,82px);line-height:.94;letter-spacing:.055em;opacity:0;transform:translateY(14px);animation:nexaTitleIn 1s cubic-bezier(.2,.8,.2,1) .7s forwards;background:linear-gradient(90deg,#dfe8ff 0%,#9e86ff 38%,#63b7ff 72%,#ffffff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 36px rgba(108,88,255,.16)}
  .nexa-welcome-copy h2{margin:16px 0 0;font-size:clamp(18px,2.2vw,29px);font-weight:700;color:#d5dbf1;opacity:0;transform:translateY(12px);animation:nexaTextIn .9s ease 1.55s forwards}
  .nexa-welcome-copy p{margin:10px 0 24px;color:#929dbf;font-size:14px;letter-spacing:.03em;opacity:0;transform:translateY(10px);animation:nexaTextIn .9s ease 2.05s forwards}
  .nexa-enter-btn{border:1px solid rgba(152,132,255,.5);border-radius:14px;padding:13px 19px;background:linear-gradient(135deg,#7a48ff,#2b9dff);color:#fff;font-weight:900;letter-spacing:.08em;box-shadow:0 14px 38px rgba(62,74,255,.18);cursor:pointer;opacity:0;transform:translateY(12px);animation:nexaTextIn .8s ease 2.65s forwards}
  @keyframes nexaTextIn{to{opacity:1;transform:translateY(0)}}
  @keyframes nexaTitleIn{0%{opacity:0;transform:translateY(16px) scale(.985);filter:blur(6px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
  .nexa-welcome.fade-out{animation:nexaWelcomeOut .6s ease forwards}
  @keyframes nexaWelcomeOut{to{opacity:0;transform:scale(1.015)}}
  @media(max-width:760px){
    .nexa-welcome-copy{left:24px;right:24px;top:auto;bottom:8vh;transform:none;width:auto}
    .nexa-welcome-copy h1{font-size:clamp(38px,11vw,58px)}
    .nexa-astronaut-wrap{right:5vw;top:6vh;width:78vw;min-width:285px}
    .nexa-welcome-nebula{right:-24vw;top:4vh;width:95vw}
  }
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


function buildWelcome(){
  if(document.getElementById('nexa-welcome')) return;
  const scene=document.createElement('section');
  scene.id='nexa-welcome';
  scene.className='nexa-welcome';
  scene.innerHTML=`
    <div class="nexa-welcome-stars" id="nexa-welcome-stars"></div>
    <div class="nexa-welcome-comet"></div>
    <div class="nexa-welcome-nebula"></div>
    <div class="nexa-astronaut-wrap" aria-hidden="true">
      <svg class="nexa-astronaut-svg" viewBox="0 0 620 500" role="img" aria-label="Astronaut reaching toward the light">
  <defs>
    <linearGradient id="suit10" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7faff"/>
      <stop offset=".55" stop-color="#d6e0f4"/>
      <stop offset="1" stop-color="#93a3c5"/>
    </linearGradient>
    <linearGradient id="visor10" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#050914"/>
      <stop offset=".55" stop-color="#122447"/>
      <stop offset="1" stop-color="#5472b4"/>
    </linearGradient>
    <radialGradient id="glow10">
      <stop stop-color="#fff"/>
      <stop offset=".28" stop-color="#cce3ff"/>
      <stop offset=".62" stop-color="#9a76ff" stop-opacity=".58"/>
      <stop offset="1" stop-color="#7d5eff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <g transform="translate(5 5) rotate(-10 320 250)">
    <!-- backpack -->
    <path d="M153 178 Q130 191 129 225 L129 317 Q131 343 153 350 L184 342 L185 188Z"
          fill="#8797bb" stroke="#647293" stroke-width="3"/>

    <!-- torso -->
    <path d="M175 164
             Q206 144 242 151
             Q284 158 300 193
             L322 294
             Q328 326 301 345
             Q276 361 228 356
             Q185 351 166 329
             Q151 311 157 281
             L160 208
             Q160 179 175 164Z"
          fill="url(#suit10)" stroke="#7584a5" stroke-width="3"/>

    <!-- waist -->
    <path d="M181 329 Q232 345 303 325 L311 352 Q253 375 177 353Z"
          fill="#a4b2ce" stroke="#7887a7" stroke-width="2"/>

    <!-- helmet, significantly smaller -->
    <path d="M169 116
             Q171 67 205 43
             Q239 19 274 38
             Q310 58 314 103
             Q317 141 294 165
             Q272 189 236 187
             Q202 185 183 162
             Q166 143 169 116Z"
          fill="#e9effa" stroke="#7180a0" stroke-width="4"/>

    <!-- visor -->
    <path d="M185 110
             Q188 78 211 61
             Q236 43 263 54
             Q290 65 296 96
             Q302 125 285 145
             Q268 164 241 164
             Q215 164 199 148
             Q183 132 185 110Z"
          fill="url(#visor10)" stroke="#4f607f" stroke-width="3"/>
    <path d="M205 77 Q232 58 267 70"
          fill="none" stroke="rgba(255,255,255,.27)" stroke-width="6" stroke-linecap="round"/>

    <!-- chest control -->
    <rect x="199" y="214" width="83" height="47" rx="10"
          fill="#c8d3e7" stroke="#8796b6" stroke-width="2"/>
    <rect x="212" y="226" width="56" height="21" rx="5" fill="#1d2845"/>
    <circle cx="222" cy="237" r="4" fill="#55dec5"/>
    <circle cx="235" cy="237" r="4" fill="#9980ff"/>
    <rect x="247" y="233" width="14" height="7" rx="3.5" fill="#7584a7"/>

    <!-- left arm floating -->
    <path d="M170 201
             Q135 225 118 261
             Q102 294 104 327"
          fill="none" stroke="url(#suit10)" stroke-width="28"
          stroke-linecap="round"/>
    <path d="M104 327 Q101 348 89 364"
          fill="none" stroke="#dce5f5" stroke-width="20" stroke-linecap="round"/>

    <!-- right arm reaching directly toward the main light -->
    <g class="nexa-astronaut-hand">
      <path d="M294 196
               Q345 208 388 230
               Q430 251 470 270"
            fill="none" stroke="url(#suit10)" stroke-width="29"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M468 270 Q494 281 519 288"
            fill="none" stroke="#eaf0fb" stroke-width="19" stroke-linecap="round"/>
      <ellipse cx="524" cy="289" rx="11" ry="13"
               fill="#edf3fd" transform="rotate(18 524 289)"/>
      <path d="M529 286 L555 281" stroke="#edf3fd" stroke-width="5.8" stroke-linecap="round"/>
      <path d="M530 290 L558 291" stroke="#edf3fd" stroke-width="5.2" stroke-linecap="round"/>
      <path d="M528 295 L554 302" stroke="#edf3fd" stroke-width="5.2" stroke-linecap="round"/>
    </g>

    <!-- long bent legs -->
    <path d="M208 351
             Q190 390 168 421
             Q151 444 129 460"
          fill="none" stroke="url(#suit10)" stroke-width="31"
          stroke-linecap="round"/>
    <path d="M282 354
             Q306 387 337 409
             Q363 428 391 435"
          fill="none" stroke="url(#suit10)" stroke-width="31"
          stroke-linecap="round"/>

    <!-- boots -->
    <path d="M118 463 Q136 475 153 467"
          fill="none" stroke="#a7b5d2" stroke-width="18" stroke-linecap="round"/>
    <path d="M390 436 Q412 444 428 433"
          fill="none" stroke="#a7b5d2" stroke-width="18" stroke-linecap="round"/>

    <!-- subtle seams -->
    <path d="M179 294 Q240 307 312 288"
          fill="none" stroke="rgba(86,102,139,.32)" stroke-width="2"/>
    <path d="M184 186 Q228 200 294 184"
          fill="none" stroke="rgba(86,102,139,.24)" stroke-width="2"/>

    <!-- fingertip energy -->
    <circle class="nexa-touch-glow" cx="566" cy="291" r="42" fill="url(#glow10)"/>
  </g>
</svg>
    </div>
    <div class="nexa-welcome-copy">
      <div class="nexa-welcome-kicker">WELCOME ABOARD</div>
      <h1 id="nexa-welcome-title">WELCOME TO NEXA</h1>
      <h2>Everything starts here.</h2>
      <p>Built to evolve. Ready when you are.</p>
      <button id="nexa-enter-btn" class="nexa-enter-btn" type="button">ENTER NEXA →</button>
    </div>`;
  document.body.appendChild(scene);

  const starBox=document.getElementById('nexa-welcome-stars');
  for(let i=0;i<90;i++){
    const s=document.createElement('span');
    s.className='nexa-welcome-star';
    s.style.left=(Math.random()*100)+'%';
    s.style.top=(Math.random()*100)+'%';
    s.style.setProperty('--wd',(2.4+Math.random()*5.2)+'s');
    s.style.setProperty('--wdelay',(-Math.random()*6)+'s');
    if(Math.random()>.76){s.style.width='3px';s.style.height='3px'}
    starBox.appendChild(s);
  }

  document.getElementById('nexa-enter-btn').addEventListener('click',completeWelcome);
}

async function completeWelcome(){
  const scene=document.getElementById('nexa-welcome');
  try{
    await sb.auth.updateUser({data:{nexa_welcome_completed:true}});
  }catch{}
  scene?.classList.add('fade-out');
  setTimeout(()=>{
    scene?.classList.remove('active','fade-out');
    hide();
    document.body.style.overflow='';
    location.reload();
  },560);
}

function showWelcome(name=''){
  buildWelcome();
  const scene=document.getElementById('nexa-welcome');
  const title=document.getElementById('nexa-welcome-title');
  const clean=String(name||'').trim();
  title.innerHTML=clean
    ? `WELCOME TO <span style="color:#ffffff">NEXA</span>, <span style="background:linear-gradient(90deg,#b49cff,#6cc6ff);-webkit-background-clip:text;background-clip:text;color:transparent">${esc(clean.toUpperCase())}</span>`
    : 'WELCOME TO <span style="color:#ffffff">NEXA</span>';
  hide();
  scene.classList.add('active');
  document.body.style.overflow='hidden';
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
  const select=$('nexa-create-alliance');
  select.innerHTML='<option value="">Loading alliances…</option>';

  try{
    const response=await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_public_nexa_alliances`,
      {
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:`Bearer ${SUPABASE_KEY}`,
          'Content-Type':'application/json'
        },
        body:'{}',
        cache:'no-store'
      }
    );

    const raw=await response.text();
    let rows=[];
    try{ rows=raw?JSON.parse(raw):[]; }catch{}

    if(!response.ok){
      throw new Error(
        rows?.message ||
        rows?.error ||
        raw ||
        `Alliance request failed (${response.status})`
      );
    }

    if(!Array.isArray(rows)) rows=[];

    select.innerHTML=
      '<option value="">Select alliance</option>'+
      rows.map(a=>`<option value="${esc(a.id)}">${esc(a.tag)}</option>`).join('')+
      '<option value="not-listed">Not Listed</option>';

    msg('');
  }catch(e){
    console.error('NEXA alliance load failed:',e);
    select.innerHTML=
      '<option value="">Could not load alliances</option>'+
      '<option value="not-listed">Not Listed</option>';
    msg('Could not load alliance list: '+(e?.message||'Unknown error'),'error');
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
    const provider=String(session.user?.app_metadata?.provider||'');
    const welcomeDone=session.user?.user_metadata?.nexa_welcome_completed===true;
    if(provider!=='discord' && !welcomeDone){
      document.documentElement.classList.remove('nexa-auth-boot');
      showWelcome(
        session.user?.user_metadata?.in_game_name ||
        session.user?.user_metadata?.nexa_game_id ||
        ''
      );
      return;
    }
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
    msg('Account created successfully.','good');
    await reconcile();
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

  const ignField=$('nexa-create-name');
  const ignWarn=document.createElement('div');
  ignWarn.id='nexa-ign-warning';
  ignWarn.style.cssText='display:none;color:#ff9ba8;font-size:11px;line-height:1.4;margin-top:-4px;';
  ignField.parentElement.appendChild(ignWarn);

  function validateIgnLive(){
    const value=ignField.value.trim();
    if(!value){
      ignWarn.style.display='none';
      ignWarn.textContent='';
      return true;
    }
    const invalidDecorative=decorativeName(value);
    const invalidBasic=!/^[\p{L}\p{M}\p{N}\p{Zs}'’._-]+$/u.test(value);
    const invalid=invalidDecorative||invalidBasic;
    ignWarn.style.display=invalid?'block':'none';
    ignWarn.textContent=invalid
      ? 'Special or decorative characters are not permitted. Please use standard characters only.'
      : '';
    return !invalid;
  }

  ignField.addEventListener('input',validateIgnLive);
  ignField.addEventListener('blur',validateIgnLive);

  window.NEXAAuth={show,reconcile};
  await loadAlliances();
  await reconcile();
  sb.auth.onAuthStateChange(()=>setTimeout(reconcile,0));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();