/* NEXA V44.8.4 — NEXA FLEET / DRONE / ONBOARDING / CANONICAL ACCOUNTS — 2026-08-25
   COMPLETE REPLACEMENT for nexa-v44-8-profile-stability.js
   Fixes:
   - MAIN / ALT labels across Constellation, Passport and Player Intelligence Profile
   - Restores native Constellation -> Passport flow (no click hijack)
   - Stable galaxy Constellation background + deterministic per-account colors
   - Snow Ape Deployment Capacity from the actually displayed account
   - Expert explanations/current effect
   - Chief Gear saved stars displayed vertically inside the left side of the planet
   - Login gate: no MENU, standalone Report Bugs, generic multi-server tagline
   - Create Account: State field; syncs state_number after account creation
   No MutationObserver. No polling. No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_V4484_CONSOLIDATED__) return;
window.__NEXA_V4484_CONSOLIDATED__=true;
window.NEXA_CANONICAL_ACCOUNTS=true;

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const $$=(s,r=document)=>r?.querySelectorAll?Array.from(r.querySelectorAll(s)):[];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const norm=s=>String(s||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let localSb=null;
const sb=()=>{
  if(window.supabaseClient?.from)return window.supabaseClient;
  if(window.sb?.from)return window.sb;
  if(!localSb&&window.supabase?.createClient)localSb=window.supabase.createClient(SB_URL,SB_KEY);
  return localSb;
};

let deployBusy=false, expertBusy=false, gearBusy=false, labelBusy=false;
let accountCache=[];
let profileCameFromConstellation=false;
let activeFleetState=null;
let onboardingChecked=false;
let typewriterRAF=0;

const ACCOUNT_COLORS=['#ff50d8','#58d8ff','#9c6dff','#5ce2b7','#ffae55'];

function cleanMojibake(){
  const roots=[$('#accounts-modal'),$('#nexa-account-constellation'),$('#nexa-profile-modal')].filter(Boolean);
  const pairs=[
    ['\u00e2\u009c\u00a6','\u2726'],
    ['\u00e2\u0098\u0085','\u2605'],
    ['\u00c3\u0097','\u00d7'],
    ['\u00e2\u0080\u0094','\u2014'],
    ['\u00e2\u0080\u00a2','\u2022'],
    ['\u00e2\u0086\u0092','\u2192'],
    ['\u00e2\u009c\u0093','\u2713'],
    ['\u00c2','']
  ];
  const fix=t=>{
    let v=String(t||'');
    for(const [bad,good] of pairs)v=v.split(bad).join(good);
    return v;
  };
  roots.forEach(root=>{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      const v=fix(n.nodeValue);
      if(v!==n.nodeValue)n.nodeValue=v;
    }
  });
}

function installCSS(){
  if($('#nexa-v4481-css'))return;
  const st=document.createElement('style');
  st.id='nexa-v4481-css';
  st.textContent=`
  /* Auth gate: NEXA only + Report Bugs */
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-home-menu-toggle,
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-home-menu{display:none!important}
  #nexa-v4481-report-bugs{
    position:fixed;z-index:1000002;left:14px;top:max(12px,calc(env(safe-area-inset-top) + 5px));
    width:34px;height:34px;padding:0;display:none;place-items:center;border:1px solid rgba(255,79,191,.48);border-radius:50%;
    background:rgba(28,8,42,.78);color:#ff8bd6;font-size:16px;font-weight:950;
    box-shadow:0 0 14px rgba(255,71,190,.14);backdrop-filter:blur(10px)
  }
  body:has(#nexa-auth-gate:not(.hidden)) #nexa-v4481-report-bugs{display:grid}
  #nexa-auth-gate .nexa-auth-brand p{max-width:360px;margin-left:auto!important;margin-right:auto!important}

  /* Stable canonical Constellation atmosphere */
  #nexa-account-constellation .nexa-constellation-backdrop{
    background:
      radial-gradient(circle at 77% 25%,rgba(92,135,255,.22) 0 4%,rgba(78,91,210,.16) 5%,transparent 13%),
      radial-gradient(circle at 16% 35%,rgba(212,70,255,.22) 0 2.2%,transparent 8%),
      radial-gradient(circle at 50% 52%,rgba(178,56,255,.20),transparent 27%),
      radial-gradient(circle at 46% 47%,rgba(75,61,232,.16),transparent 40%),
      linear-gradient(165deg,#030515 0%,#080722 48%,#020511 100%)!important;
    backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important
  }
  #nexa-account-constellation .nexa-constellation-backdrop:before{
    content:"";position:absolute;right:8%;top:20%;width:64px;height:64px;border-radius:50%;pointer-events:none;
    background:radial-gradient(circle at 35% 28%,#8ab1ff 0 8%,#526bd6 34%,#1d2868 68%,#080d2b 100%);
    box-shadow:0 0 28px rgba(93,121,255,.38),inset -10px -9px 16px rgba(0,0,0,.42)
  }
  #nexa-account-constellation .nexa-constellation-stage{
    background-image:
      radial-gradient(circle,rgba(255,255,255,.70) 0 1px,transparent 1.4px),
      radial-gradient(circle,rgba(111,142,255,.52) 0 1px,transparent 1.4px);
    background-size:63px 63px,97px 97px;background-position:7px 11px,31px 37px
  }
  #nexa-account-constellation .nexa-account-planet[data-nexa-profile]{
    --acct:#a56bff;
    border-color:var(--acct)!important;
    box-shadow:0 0 13px color-mix(in srgb,var(--acct) 78%,transparent),0 0 30px color-mix(in srgb,var(--acct) 32%,transparent)!important
  }
  #nexa-account-constellation .nexa-account-planet[data-nexa-profile] img{
    box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--acct) 62%,transparent)!important
  }
  #nexa-account-constellation .nexa-account-planet-type{
    color:var(--acct)!important;text-shadow:0 0 8px color-mix(in srgb,var(--acct) 70%,transparent)!important
  }


  .nexa-v4483-bug-overlay{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;background:rgba(0,2,13,.82);backdrop-filter:blur(9px)}
  .nexa-v4483-bug-card{width:min(560px,100%);max-height:88dvh;overflow:auto;box-sizing:border-box;border:1px solid rgba(83,190,255,.43);border-radius:22px;padding:18px;background:radial-gradient(circle at 12% 0%,rgba(83,116,255,.15),transparent 34%),linear-gradient(155deg,#0d1535,#040817);box-shadow:0 25px 70px rgba(0,0,0,.62),0 0 28px rgba(64,126,255,.13);color:#fff}
  .nexa-v4483-bug-card h3{margin:0 42px 8px 0}
  .nexa-v4483-bug-card p{color:#aeb9d4;line-height:1.45;font-size:.86rem}
  .nexa-v4483-bug-card label{display:grid;gap:6px;margin-top:11px;color:#dfe8ff;font-size:.78rem;font-weight:850}
  .nexa-v4483-bug-card input,.nexa-v4483-bug-card textarea{width:100%;box-sizing:border-box;padding:11px;border-radius:11px;border:1px solid #2b3c6f;background:#081126;color:#fff;font:inherit}
  .nexa-v4483-bug-shot{border:1px dashed rgba(91,202,255,.38)!important;background:rgba(9,24,47,.72)!important}
  .nexa-v4483-bug-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}
  .nexa-v4483-bug-actions button{border:1px solid rgba(104,127,225,.4);border-radius:11px;padding:10px 13px;background:#121a39;color:#fff;font-weight:850}
  .nexa-v4483-bug-actions .send{background:linear-gradient(135deg,#704aff,#219cff);border:0}
  .nexa-v4483-bug-close{float:right;width:32px;height:32px;border-radius:50%!important;border:1px solid rgba(255,112,170,.4)!important;background:#210a23!important;color:#ff9ac2!important;font-weight:900}
  .nexa-v4483-bug-status{min-height:18px;margin-top:10px;color:#8fdfff;font-size:.78rem;line-height:1.4}
  .nexa-v4483-bug-files{margin-top:5px;color:#8fa0c8;font-size:.72rem;line-height:1.4}


  /* NEXA V44.8.4 — Drone / Fleet / clean Constellation */
  .nexa-v4484-drone{position:relative;width:86px;height:66px;filter:drop-shadow(0 0 18px rgba(71,196,255,.45)) drop-shadow(0 0 30px rgba(137,69,255,.30));animation:nexaDroneFloat 3.4s ease-in-out infinite}
  .nexa-v4484-drone-body{position:absolute;left:16px;top:10px;width:54px;height:45px;border-radius:46% 46% 42% 42%;background:linear-gradient(145deg,#f7f8ff 0%,#bac7ff 42%,#7b73d7 100%);border:2px solid rgba(142,226,255,.92);box-shadow:inset 0 -8px 12px rgba(56,40,132,.28),0 0 15px rgba(61,214,255,.35)}
  .nexa-v4484-drone-face{position:absolute;left:7px;right:7px;top:8px;height:25px;border-radius:15px;background:linear-gradient(180deg,#07142e,#020817);border:1px solid rgba(73,221,255,.68);box-shadow:inset 0 0 16px rgba(25,122,255,.24)}
  .nexa-v4484-drone-eye{position:absolute;top:8px;width:7px;height:7px;border-radius:50%;background:#67f0ff;box-shadow:0 0 7px #67f0ff}
  .nexa-v4484-drone-eye.a{left:10px}.nexa-v4484-drone-eye.b{right:10px}
  .nexa-v4484-drone-wing{position:absolute;top:17px;width:24px;height:13px;border-radius:80% 20% 80% 20%;background:linear-gradient(135deg,rgba(168,112,255,.95),rgba(76,219,255,.92));box-shadow:0 0 13px rgba(103,176,255,.48)}
  .nexa-v4484-drone-wing.a{left:0;transform:rotate(-18deg)}.nexa-v4484-drone-wing.b{right:0;transform:scaleX(-1) rotate(-18deg)}
  .nexa-v4484-drone-core{position:absolute;left:38px;bottom:0;width:10px;height:10px;border-radius:50%;background:#bf58ff;box-shadow:0 0 10px #bf58ff,0 0 20px #5bbcff}
  @keyframes nexaDroneFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-8px) rotate(1deg)}}
  .nexa-v4484-drone.intro{animation:nexaDroneMaterialize 1.15s cubic-bezier(.2,.8,.2,1) both,nexaDroneFloat 3.4s ease-in-out 1.15s infinite}
  @keyframes nexaDroneMaterialize{0%{opacity:0;transform:translateY(42px) scale(.25) rotate(-20deg);filter:blur(8px) drop-shadow(0 0 40px #6d6cff)}55%{opacity:1;transform:translateY(-8px) scale(1.12) rotate(4deg);filter:blur(0) drop-shadow(0 0 34px #4ecfff)}100%{transform:translateY(0) scale(1) rotate(0)}}

  .nexa-v4484-dialog{position:relative;border:1px solid rgba(94,194,255,.48);border-radius:18px;padding:13px 14px;background:linear-gradient(145deg,rgba(11,27,61,.94),rgba(18,11,48,.94));box-shadow:0 0 24px rgba(79,119,255,.14),inset 0 0 22px rgba(83,205,255,.035);color:#f7f9ff}
  .nexa-v4484-dialog:before{content:"";position:absolute;left:-9px;top:22px;width:16px;height:16px;border-left:1px solid rgba(94,194,255,.48);border-bottom:1px solid rgba(94,194,255,.48);background:#0d1838;transform:rotate(45deg)}
  .nexa-v4484-dialog small{display:block;color:#66dfff;font-size:10px;font-weight:950;letter-spacing:.08em;margin-bottom:4px}
  .nexa-v4484-dialog p{margin:0!important;color:#eef4ff!important;font-size:13px!important;line-height:1.5!important;min-height:42px}

  #nexa-v4484-onboarding,#nexa-v4484-fleet,#nexa-v4484-wormhole{position:fixed;inset:0;z-index:2147483646;color:#fff;background:
    radial-gradient(circle at 17% 18%,rgba(101,58,255,.25),transparent 29%),
    radial-gradient(circle at 82% 70%,rgba(20,129,255,.22),transparent 34%),
    radial-gradient(circle at 54% 43%,rgba(226,49,255,.10),transparent 25%),
    linear-gradient(155deg,#030516,#070a24 55%,#02040f);overflow:auto}
  .nexa-v4484-stars{position:absolute;inset:0;pointer-events:none;opacity:.55;background-image:
    radial-gradient(circle,rgba(255,255,255,.9) 0 1px,transparent 1.4px),
    radial-gradient(circle,rgba(95,151,255,.7) 0 1px,transparent 1.4px);
    background-size:54px 54px,87px 87px;background-position:7px 13px,26px 39px}
  .nexa-v4484-shell{position:relative;z-index:2;width:min(640px,100%);min-height:100%;box-sizing:border-box;margin:auto;padding:max(22px,env(safe-area-inset-top)) 18px max(24px,env(safe-area-inset-bottom));display:flex;flex-direction:column}
  .nexa-v4484-onboard-main{flex:1;display:grid;place-items:center}
  .nexa-v4484-onboard-card{width:min(520px,100%);display:grid;grid-template-columns:105px 1fr;align-items:center;gap:13px}
  .nexa-v4484-step{grid-column:1/-1;text-align:center;color:#7d8db8;font-size:10px;font-weight:900;letter-spacing:.18em}
  .nexa-v4484-progress{grid-column:1/-1;display:flex;justify-content:center;gap:7px}.nexa-v4484-progress i{width:7px;height:7px;border-radius:50%;background:#24345e}.nexa-v4484-progress i.on{background:#69d8ff;box-shadow:0 0 9px #69d8ff}
  .nexa-v4484-primary{grid-column:1/-1;width:min(300px,100%);justify-self:center;border:0;border-radius:999px;padding:13px 19px;color:#fff;font-weight:950;background:linear-gradient(100deg,#225eff,#8449ff 55%,#ef4ed2);box-shadow:0 0 22px rgba(105,75,255,.32)}
  .nexa-v4484-primary:disabled{opacity:.45;filter:grayscale(.25)}
  .nexa-v4484-mini-path{grid-column:1/-1;display:flex;justify-content:center;align-items:center;gap:7px;flex-wrap:wrap;color:#98a7cb;font-size:10px}.nexa-v4484-mini-path b{color:#cfeaff}.nexa-v4484-mini-path em{font-style:normal;color:#6cdfff}

  .nexa-v4484-fleet-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
  .nexa-v4484-fleet-head h2{margin:0;font-size:23px;letter-spacing:.08em}.nexa-v4484-close{width:39px;height:39px;border-radius:50%;border:1px solid rgba(143,106,255,.48);background:#0a1028;color:#fff;font-size:22px}
  .nexa-v4484-fleet-guide{display:grid;grid-template-columns:88px 1fr;gap:12px;align-items:center;margin:8px 0 17px}
  .nexa-v4484-state-list{display:grid;gap:12px;padding-bottom:20px}
  .nexa-v4484-state-card{--ship:#6ad9ff;position:relative;width:100%;min-height:112px;border:1px solid color-mix(in srgb,var(--ship) 55%,transparent);border-radius:20px;padding:16px 17px 16px 132px;text-align:left;color:#fff;background:radial-gradient(circle at 20% 50%,color-mix(in srgb,var(--ship) 15%,transparent),transparent 35%),linear-gradient(145deg,rgba(9,17,43,.96),rgba(7,8,26,.97));box-shadow:0 0 24px color-mix(in srgb,var(--ship) 10%,transparent);overflow:hidden}
  .nexa-v4484-state-card b{display:block;font-size:17px;letter-spacing:.07em}.nexa-v4484-state-card small{display:block;margin-top:5px;color:#9eafd1;font-weight:750}.nexa-v4484-state-card .go{position:absolute;right:15px;top:50%;transform:translateY(-50%);width:33px;height:33px;border-radius:50%;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--ship) 55%,transparent);color:#c9f4ff}
  .nexa-v4484-ship{position:absolute;left:26px;top:37px;width:78px;height:38px;clip-path:polygon(0 50%,28% 8%,78% 0,100% 50%,78% 100%,28% 92%);background:linear-gradient(135deg,#f5efff 0%,var(--ship) 28%,#7b4fff 66%,#ff5cca 100%);transform:skewX(-10deg) rotate(-7deg);filter:drop-shadow(0 0 10px var(--ship))}
  .nexa-v4484-ship:before{content:"";position:absolute;left:8px;top:12px;width:22px;height:14px;border-radius:50%;background:#07152f;border:2px solid #80efff;box-shadow:0 0 8px #80efff}
  .nexa-v4484-ship:after{content:"";position:absolute;left:-18px;top:11px;width:25px;height:15px;background:linear-gradient(90deg,transparent,var(--ship));filter:blur(2px)}
  .nexa-v4484-fleet-empty{padding:28px 16px;border:1px dashed rgba(120,142,215,.27);border-radius:18px;text-align:center;color:#8fa0c4}

  #nexa-v4484-wormhole{display:grid;place-items:center;overflow:hidden}
  .nexa-v4484-worm{position:absolute;width:min(88vw,520px);aspect-ratio:1;border-radius:50%;background:
    radial-gradient(circle,transparent 0 24%,rgba(255,255,255,.95) 25% 26%,rgba(80,213,255,.85) 27% 31%,rgba(111,64,255,.76) 33% 38%,rgba(239,60,255,.55) 40% 46%,transparent 48%),
    conic-gradient(from 0deg,#7e55ff,#4cdcff,#ff58d3,#473cff,#7e55ff);
    filter:blur(.2px) drop-shadow(0 0 34px #744cff);animation:nexaWormSpin 1.05s linear infinite,nexaWormPulse 1.4s ease-in-out infinite}
  @keyframes nexaWormSpin{to{transform:rotate(360deg)}}@keyframes nexaWormPulse{50%{scale:1.07}}
  .nexa-v4484-streaks{position:absolute;inset:-30%;background:repeating-conic-gradient(from 0deg,transparent 0 5deg,rgba(129,181,255,.22) 6deg,transparent 7deg 14deg);animation:nexaStreak .6s linear infinite}
  @keyframes nexaStreak{to{transform:rotate(20deg) scale(1.08)}}
  .nexa-v4484-worm-content{position:relative;z-index:3;text-align:center;display:grid;place-items:center;gap:12px}.nexa-v4484-worm-content b{font-size:18px;letter-spacing:.10em}.nexa-v4484-worm-content span{color:#76eaff;font-size:11px;font-weight:850;letter-spacing:.12em}

  #nexa-account-constellation .nexa-account-planet.nexa-v4484-planet{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:0!important;overflow:visible!important}
  #nexa-account-constellation .nexa-v4484-planet-orb{display:grid;place-items:center;border-radius:50%;padding:4px;background:radial-gradient(circle,color-mix(in srgb,var(--acct) 22%,#081127),#061020 67%);border:2px solid var(--acct);box-shadow:0 0 16px color-mix(in srgb,var(--acct) 75%,transparent),0 0 34px color-mix(in srgb,var(--acct) 28%,transparent)}
  #nexa-account-constellation .nexa-v4484-planet-orb img{display:block;width:100%!important;height:100%!important;border-radius:50%!important;object-fit:cover!important;box-shadow:none!important}
  #nexa-account-constellation .nexa-account-planet.main .nexa-v4484-planet-orb{width:118px;height:118px}
  #nexa-account-constellation .nexa-account-planet.alt .nexa-v4484-planet-orb{width:80px;height:80px}
  #nexa-account-constellation .nexa-account-planet-name{margin-top:7px!important;text-shadow:0 0 8px rgba(0,0,0,.9)}
  #nexa-account-constellation .nexa-account-planet-type{display:block!important;background:transparent!important;border:0!important;padding:2px 0!important;box-shadow:none!important}
  #nexa-account-constellation .nexa-v4484-add-orb{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:auto;border:2px solid #65dfff;background:#07162e;color:#69e3ff;font-size:40px;box-shadow:0 0 22px rgba(83,215,255,.30)}
  #nexa-v4484-return-fleet{position:absolute;z-index:65;left:18px;top:max(18px,env(safe-area-inset-top));border:1px solid rgba(93,194,255,.38);border-radius:999px;padding:8px 11px;background:rgba(7,17,39,.86);color:#bceeff;font-size:10px;font-weight:900}
  #nexa-account-constellation .nexa-constellation-heading b{display:block;color:#f5f7ff;font-size:14px;letter-spacing:.09em;margin-bottom:4px}
  @media(max-width:560px){
    .nexa-v4484-onboard-card{grid-template-columns:82px 1fr}.nexa-v4484-drone{transform:scale(.88);transform-origin:center}
    .nexa-v4484-state-card{padding-left:116px}.nexa-v4484-ship{left:18px}
    #nexa-account-constellation .nexa-account-planet.main .nexa-v4484-planet-orb{width:104px;height:104px}
    #nexa-account-constellation .nexa-account-planet.alt .nexa-v4484-planet-orb{width:72px;height:72px}
  }

  #nexa-profile-type.v448-main{color:#ffd96b!important;border-color:rgba(255,198,64,.72)!important}
  #nexa-profile-type.v448-alt{color:#86eaff!important;border-color:rgba(77,216,255,.65)!important}

  .v448-expert-info{display:grid;gap:5px;margin:9px 0;padding:10px 11px;border:1px solid rgba(96,211,255,.28);border-radius:12px;background:rgba(7,28,48,.55)}
  .v448-expert-info small{font-size:8px;font-weight:950;letter-spacing:.11em;color:#68ddff}
  .v448-expert-info b{font-size:11px;line-height:1.42;color:#eef8ff}
  .v448-expert-info span{font-size:9px;line-height:1.4;color:#9daac8}
  .v448-expert-current{color:#ffd96b!important;font-weight:900!important}

  /* Chief Gear stars: inside planet, left side, vertical */
  .v448-gear-stars{
    position:absolute;z-index:8;left:5px;bottom:9px;
    display:flex;flex-direction:column-reverse;gap:1px;pointer-events:none
  }
  .v448-gear-stars span{
    font-size:8px;line-height:8px;color:#ffd84f;
    text-shadow:0 0 4px rgba(255,214,72,.95),0 0 8px rgba(255,184,35,.48)
  }
  `;
  document.head.appendChild(st);
}

async function loadAccounts(){
  const c=sb();if(!c)return [];
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return [];
    const q=await c.from('player_accounts')
      .select('id,in_game_name,player_id,is_main,account_purpose,state_number,deployment_capacity,profile_photo_url')
      .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at');
    accountCache=q.data||[];
    return accountCache;
  }catch{return accountCache}
}

async function resolveDisplayedAccount(){
  const c=sb();if(!c)return null;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return null;
    const fields='id,in_game_name,player_id,is_main,account_purpose,state_number,deployment_capacity,profile_photo_url';

    const active=String(window.NEXA_ACTIVE_ACCOUNT_ID||'');
    if(active){
      const q=await c.from('player_accounts').select(fields).eq('user_id',user.id).eq('id',active).maybeSingle();
      if(q.data)return q.data;
    }

    const pid=String($('#nexa-profile-player-id')?.textContent||'').trim();
    if(pid&&pid!=='—'){
      const q=await c.from('player_accounts').select(fields).eq('user_id',user.id).eq('player_id',pid).maybeSingle();
      if(q.data){window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);return q.data}
    }

    const q=await c.from('player_accounts').select(fields).eq('user_id',user.id)
      .order('is_main',{ascending:false}).order('created_at').limit(1).maybeSingle();
    if(q.data)window.NEXA_ACTIVE_ACCOUNT_ID=String(q.data.id);
    return q.data||null;
  }catch{return null}
}


async function refreshAccountManager(){
  const c=sb(), modal=$('#accounts-modal');if(!c||!modal)return;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return;
    const q=await c.from('player_accounts')
      .select('id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,state_number,alliances(tag)')
      .eq('user_id',user.id).order('is_main',{ascending:false}).order('created_at');
    if(q.error)throw q.error;
    const rows=q.data||[];
    const count=$('#account-count');if(count)count.textContent=`${rows.length} ACCOUNT${rows.length===1?'':'S'}`;
    const list=$('#accounts-list');
    if(list)list.innerHTML=rows.map(a=>{
      const tag=a.alliances?.tag||a.custom_alliance_tag||'Not Listed';
      return `<article class="claimed-account">
        <div><b>${esc(a.in_game_name||'Account')}</b><small>${a.is_main?'★ MAIN ACCOUNT':'✦ ALT ACCOUNT'} • State ${esc(a.state_number||'—')} • ${esc(tag)} • ID ${esc(a.player_id||'')}</small></div>
        <div class="account-actions"><button type="button" data-v4483-edit="${esc(a.id)}">Edit</button><button type="button" data-v4483-delete="${esc(a.id)}">Delete</button></div>
      </article>`;
    }).join('');
    accountCache=rows;renderCanonicalConstellation(rows);
  }catch(e){console.warn('[NEXA V44.8.3] account manager',e?.message||e)}
}
function installAccountManagerUI(){
  const form=$('#account-form');if(!form)return;
  const old=$('#account-purpose')?.closest('label');
  if(old&&!$('#account-state')){
    const label=document.createElement('label');
    label.innerHTML='State<input id="account-state" required inputmode="numeric" pattern="[0-9]*" placeholder="Enter state"><small>State/server for this Game Account.</small>';
    old.replaceWith(label);
  }
  const lang=$('#language-select');
  if(lang){
    const names={auto:'Auto (device)',en:'English',es:'Español',tr:'Türkçe',ko:'한국어',ar:'العربية',pt:'Português',ru:'Русский',uk:'Українська',fr:'Français',it:'Italiano',zh:'简体中文',ja:'日本語'};
    [...lang.options].forEach(o=>{if(names[o.value])o.textContent=names[o.value]});
  }
  const ll=$('#language-label');if(ll)ll.textContent='LANGUAGE';
}
async function saveManagedAccount(e){
  const form=e.target;if(form?.id!=='account-form')return false;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const c=sb();if(!c)return true;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)throw new Error('Sign in to NEXA first.');
    const editId=String($('#edit-account-id')?.value||'');
    const state=Number(String($('#account-state')?.value||'').replace(/\D/g,''));
    if(!state)throw new Error('Enter the account state.');
    const alliance=$('#alliance'),custom=$('#custom-alliance'),notListed=alliance?.value==='not-listed';
    const payload={
      in_game_name:String($('#ign')?.value||'').trim(),
      alliance_id:notListed?null:Number(alliance?.value),
      custom_alliance_tag:notListed?String(custom?.value||'').trim():null,
      account_purpose:'full',
      state_number:state
    };
    let r;
    if(editId)r=await c.from('player_accounts').update(payload).eq('id',editId).eq('user_id',user.id);
    else r=await c.from('player_accounts').insert({...payload,user_id:user.id,player_id:String($('#player-id')?.value||'').trim(),is_main:false});
    if(r.error)throw r.error;
    if($('#edit-account-id'))$('#edit-account-id').value='';
    if($('#ign'))$('#ign').value='';if($('#player-id')){$('#player-id').value='';$('#player-id').disabled=false}
    if($('#account-state'))$('#account-state').value='';
    await refreshAccountManager();await repairAccountLabels();
  }catch(err){const m=$('#accounts-message');if(m)m.textContent=err?.message||String(err)}
  return true;
}

function canonicalAccountText(el,isMain){
  if(!el)return;
  el.textContent=isMain?'★ MAIN ACCOUNT':'✦ ALT ACCOUNT';
}

function accountColor(id){
  const str=String(id||'');
  let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;
  return ACCOUNT_COLORS[h%ACCOUNT_COLORS.length];
}
function accountAvatar(a){
  return a?.profile_photo_url||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(a?.in_game_name||'NEXA')}&background=111a38&color=cabaff&bold=true&size=256`;
}
function renderCanonicalConstellation(rows,stateNumber=activeFleetState){
  const system=$('#nexa-constellation-system');if(!system)return;
  const all=Array.isArray(rows)?rows:[];
  const state=Number(stateNumber||0);
  const list=state?all.filter(a=>Number(a.state_number||0)===state):all;
  const main=list.find(a=>a.is_main)||list[0]||null;
  const others=main?list.filter(a=>String(a.id)!==String(main.id)):list;
  const pos=[[50,15],[79,31],[82,65],[52,84],[18,68],[18,34],[66,10],[91,49],[67,89],[32,89],[9,50],[33,10]];
  let out='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span>';

  if(main){
    out+=`<button type="button" class="nexa-account-planet main nexa-v4484-planet" data-nexa-profile="${esc(main.id)}" style="--acct:${accountColor(main.id)}">
      <span class="nexa-v4484-planet-orb"><img src="${esc(accountAvatar(main))}" alt=""></span>
      <span class="nexa-account-planet-name">${esc(main.in_game_name||'WOS Account')}</span>
      <span class="nexa-account-planet-type">★ MAIN ACCOUNT</span>
    </button>`;
  }
  others.forEach((a,i)=>{
    const p=pos[i%pos.length];
    out+=`<button type="button" class="nexa-account-planet alt nexa-v4484-planet" data-nexa-profile="${esc(a.id)}" style="left:${p[0]}%;top:${p[1]}%;--acct:${accountColor(a.id)}">
      <span class="nexa-v4484-planet-orb"><img src="${esc(accountAvatar(a))}" alt=""></span>
      <span class="nexa-account-planet-name">${esc(a.in_game_name||'Account')}</span>
      <span class="nexa-account-planet-type">✦ ALT ACCOUNT</span>
    </button>`;
  });

  const addPos=pos[Math.max(0,list.length-1)%pos.length];
  out+=`<button type="button" id="nexa-constellation-add" class="nexa-account-planet alt nexa-add-planet nexa-v4484-planet" style="left:${addPos[0]}%;top:${addPos[1]}%">
    <span class="nexa-v4484-add-orb">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span>
  </button>`;

  system.innerHTML=out;

  const wrap=$('#nexa-account-constellation');
  const heading=$('.nexa-constellation-heading',wrap);
  if(heading){
    const count=list.length;
    heading.innerHTML=`<b>STATE ${esc(state||'—')} · ${count} ACCOUNT${count===1?'':'S'}</b><span>Choose the Game Account you want to access.</span>`;
  }
  ensureFleetReturnButton();
}

async function repairAccountLabels(){
  if(labelBusy)return;labelBusy=true;
  try{
    const rows=await loadAccounts();
    const byId=new Map(rows.map(x=>[String(x.id),x]));
    renderCanonicalConstellation(rows);

    // Constellation: source of truth by data-nexa-profile.
    $$('#nexa-account-constellation [data-nexa-profile]').forEach((card,i)=>{
      const row=byId.get(String(card.dataset.nexaProfile));
      if(!row)return;
      card.classList.toggle('main',!!row.is_main);
      card.classList.toggle('alt',!row.is_main);
      const type=$('.nexa-account-planet-type',card);
      if(type)canonicalAccountText(type,!!row.is_main);
      const color=ACCOUNT_COLORS[i%ACCOUNT_COLORS.length];
      card.style.setProperty('--acct',color);
    });

    // Player Intelligence Profile header.
    const shown=await resolveDisplayedAccount();
    const badge=$('#nexa-profile-type');
    if(badge&&shown){
      badge.classList.remove('v445-main','v445-alt','v448-main','v448-alt');
      canonicalAccountText(badge,!!shown.is_main);
      badge.classList.add(shown.is_main?'v448-main':'v448-alt');
    }

    // Passport + any stale account-purpose leaves.
    const roots=[$('#nexa-account-constellation'),$('#nexa-profile-modal'),document].filter(Boolean);
    const seen=new Set();
    roots.forEach(root=>$$('span,b,strong,small,p,label,option',root).forEach(el=>{
      if(seen.has(el))return;seen.add(el);
      if(el.children.length&&el.tagName!=='OPTION')return;
      const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/^(point(s)? account|buff[_\s-]*points?|boost[_\s-]*points?|buff[_\s-]*account|boost[_\s-]*account|full|basic|alt)$/i.test(t)){
        el.textContent='✦ ALT ACCOUNT';
      }else if(/^main$/i.test(t)&&el.closest('[class*="passport"],[id*="passport"],[class*="account"],[id*="account"],#nexa-profile-modal')){
        el.textContent='★ MAIN ACCOUNT';
      }
    }));
  }finally{labelBusy=false}
}

async function deployment(){
  if(deployBusy)return;
  const panel=$('#nexa-deploy-panel');if(!panel)return;
  const parse=v=>Number(String(v||'').replace(/[^\d]/g,'')||0);
  const set=(id,v)=>{const el=$('#'+id);if(el)el.textContent=typeof v==='number'?Math.round(v).toLocaleString():String(v)};

  deployBusy=true;
  try{
    const c=sb(),account=await resolveDisplayedAccount();if(!c||!account?.id)return;
    const base=Number(account.deployment_capacity||0)||
      parse($('#nexa-edit-deployment')?.value)||
      parse($('#nexa-profile-deployment')?.textContent);
    if(!base)return;

    set('dep-base',base);set('dep-10',base*1.10);set('dep-20',base*1.20);

    let pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').eq('name','Snow Ape').maybeSingle();
    if(!pet.data?.id)pet=await c.from('nexa_library_items').select('id,name').eq('item_type','pet').ilike('name','%Snow%Ape%').limit(1).maybeSingle();
    if(!pet.data?.id){set('dep-pet','Snow Ape not found');set('dep-pet10','—');set('dep-pet20','—');return}

    const inv=await c.from('player_library_inventory').select('progress')
      .eq('player_account_id',account.id).eq('library_item_id',pet.data.id).maybeSingle();
    const p=inv.data?.progress||{};
    const lv=clamp(Number(p.pet_skill??p.skill_level??0),0,10);
    const plus=lv*1500;

    if(!plus){
      set('dep-pet','Set Snow Ape skill first');
      set('dep-pet10','Set Snow Ape skill first');
      set('dep-pet20','Set Snow Ape skill first');
      return;
    }
    const withPet=base+plus;
    set('dep-pet',withPet);
    set('dep-pet10',withPet*1.10);
    set('dep-pet20',withPet*1.20);
  }catch(e){console.warn('[NEXA V44.8.2] deployment',e)}
  finally{deployBusy=false}
}

const EXPERT_FALLBACK={
 'scavenging':['Earns extra Enhancement XP Components from Bear Hunt rewards.','Bear Hunt rewards'],
 'weapon master':['Earns extra Essence Stones from Bear Hunt rewards.','Bear Hunt rewards'],
 'entrapment':['Increases the maximum number of troops that can fit in your Bear Hunt rally.','Bear Hunt rally capacity'],
 "ursa's bane":['Increases the number of your own troops you can deploy during Bear Hunt.','Bear Hunt personal deployment']
};
async function experts(){
  if(expertBusy)return;
  const root=$('#nexa-v33-detail');if(!root?.classList.contains('open'))return;
  const boxes=$$('.v33-skill[data-v33-expert-box]',root);if(!boxes.length)return;
  expertBusy=true;
  try{
    const title=String($('.v33-title h3',root)?.textContent||'').trim(),c=sb();let md={};
    if(c&&title){
      const q=await c.from('nexa_library_items').select('metadata').eq('item_type','expert').eq('name',title).maybeSingle();
      md=q.data?.metadata||{};
    }
    const skills=Array.isArray(md.skills)?md.skills:[];
    boxes.forEach(box=>{
      const name=String($('h4',box)?.textContent||'').trim();
      const sk=skills.find(x=>norm(x.name)===norm(name))||{};
      const fb=EXPERT_FALLBACK[norm(name)]||[];
      const desc=sk.description||sk.effect||sk.details||fb[0]||'This Expert skill improves its listed bonus as the skill level increases.';
      const where=sk.applies_to||sk.scope||sk.specialty||fb[1]||md.specialty||'Expert bonus';
      const nativeResult=String($('.v33-result',box)?.textContent||'').replace(/\s+/g,' ').trim()||'Not active';
      let info=$('.v448-expert-info',box);
      if(!info){
        info=document.createElement('div');info.className='v448-expert-info';
        const result=$('.v33-result',box);result?result.before(info):box.appendChild(info);
      }
      info.innerHTML=`<small>WHAT IT DOES</small><b>${esc(desc)}</b><span>Applies to: ${esc(where)}</span><small>CURRENT EFFECT / BUFF</small><span class="v448-expert-current">${esc(nativeResult)}</span>`;
    });
  }catch(e){console.warn('[NEXA V44.8.1] experts',e)}
  finally{expertBusy=false}
}

async function chiefGearStars(){
  if(gearBusy)return;
  const cards=$$('#nexa-profile-modal .v33-item[data-type="chief_gear"][data-v33-item]');
  if(!cards.length)return;
  gearBusy=true;
  try{
    const c=sb(),account=await resolveDisplayedAccount();if(!c||!account?.id)return;
    const q=await c.from('player_library_inventory').select('library_item_id,progress').eq('player_account_id',account.id);
    const map=new Map((q.data||[]).map(x=>[String(x.library_item_id),x.progress||{}]));
    cards.forEach(card=>{
      const p=map.get(String(card.dataset.v33Item))||{};
      const stars=clamp(Number(p.gear_stars||0),0,3);
      const planet=$('.v33-planet',card);if(!planet)return;
      $('.v448-gear-stars',planet)?.remove();
      if(!stars)return;
      const host=document.createElement('span');host.className='v448-gear-stars';
      host.innerHTML=Array.from({length:stars},()=>'<span>★</span>').join('');
      planet.appendChild(host);
    });
  }catch(e){console.warn('[NEXA V44.8.2] chief gear stars',e)}
  finally{gearBusy=false}
}



function droneMarkup(extra=''){
  return `<div class="nexa-v4484-drone ${extra}">
    <span class="nexa-v4484-drone-wing a"></span><span class="nexa-v4484-drone-wing b"></span>
    <span class="nexa-v4484-drone-body"><span class="nexa-v4484-drone-face"><i class="nexa-v4484-drone-eye a"></i><i class="nexa-v4484-drone-eye b"></i></span></span>
    <span class="nexa-v4484-drone-core"></span>
  </div>`;
}

function typeMessage(el,text,onDone){
  cancelAnimationFrame(typewriterRAF);
  if(!el)return onDone?.();
  const full=String(text||'');
  let i=0,finished=false,last=0;
  el.textContent='';
  const complete=()=>{
    if(finished)return;
    finished=true;cancelAnimationFrame(typewriterRAF);el.textContent=full;onDone?.();
  };
  el.onclick=complete;
  function step(ts){
    if(finished)return;
    if(!last||ts-last>18){i=Math.min(full.length,i+2);el.textContent=full.slice(0,i);last=ts}
    if(i>=full.length){finished=true;onDone?.();return}
    typewriterRAF=requestAnimationFrame(step);
  }
  typewriterRAF=requestAnimationFrame(step);
  return complete;
}

function groupAccountsByState(rows){
  const map=new Map();
  (rows||[]).forEach(a=>{
    const key=Number(a.state_number||0)||0;
    if(!map.has(key))map.set(key,[]);
    map.get(key).push(a);
  });
  return [...map.entries()].sort((a,b)=>a[0]-b[0]);
}

function stateShipColor(state){
  const colors=['#64dcff','#ff9a45','#5ce2a4','#d766ff','#ff5eaa','#8c7bff'];
  let n=Number(state)||0;return colors[Math.abs(n)%colors.length];
}

function closeFleet(){
  $('#nexa-v4484-fleet')?.remove();
  document.body.style.overflow='';
}
async function openFleet(){
  const rows=await loadAccounts();
  $('#nexa-account-constellation')?.classList.remove('open');
  $('#nexa-account-constellation')?.setAttribute('aria-hidden','true');
  $('#nexa-v4484-fleet')?.remove();
  const ov=document.createElement('section');ov.id='nexa-v4484-fleet';
  ov.innerHTML=`<div class="nexa-v4484-stars"></div><div class="nexa-v4484-shell">
    <div class="nexa-v4484-fleet-head"><div><small style="color:#65dfff;font-weight:900;letter-spacing:.14em">MY PROFILE</small><h2>NEXA FLEET</h2></div><button class="nexa-v4484-close" type="button" data-fleet-close>×</button></div>
    <div class="nexa-v4484-fleet-guide">${droneMarkup()}<div class="nexa-v4484-dialog"><small>NEXA DRONE</small><p data-fleet-guide></p></div></div>
    <div class="nexa-v4484-state-list" data-fleet-list></div>
  </div>`;
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  const groups=groupAccountsByState(rows);
  const list=$('[data-fleet-list]',ov);
  list.innerHTML=groups.length?groups.map(([state,accounts])=>{
    const c=stateShipColor(state);
    return `<button class="nexa-v4484-state-card" type="button" data-fleet-state="${esc(state)}" style="--ship:${c}">
      <span class="nexa-v4484-ship"></span><b>STATE ${esc(state||'UNASSIGNED')}</b>
      <small>${accounts.length} ACCOUNT${accounts.length===1?'':'S'}</small><span class="go">→</span>
    </button>`;
  }).join(''):'<div class="nexa-v4484-fleet-empty">No Game Accounts found yet.</div>';
  typeMessage($('[data-fleet-guide]',ov),'Welcome to NEXA Fleet. Select a State to access its Account Constellation.');
  $('[data-fleet-close]',ov)?.addEventListener('click',closeFleet);
  ov.addEventListener('click',e=>{
    const card=e.target.closest?.('[data-fleet-state]');
    if(!card)return;
    const state=Number(card.dataset.fleetState||0);
    enterFleetState(state);
  });
}

function playWormhole(state,after){
  $('#nexa-v4484-wormhole')?.remove();
  const ov=document.createElement('section');ov.id='nexa-v4484-wormhole';
  ov.innerHTML=`<div class="nexa-v4484-streaks"></div><div class="nexa-v4484-worm"></div>
    <div class="nexa-v4484-worm-content">${droneMarkup('intro')}<div class="nexa-v4484-dialog" style="width:min(300px,80vw)"><small>NEXA DRONE</small><p>State selected. Opening Account Constellation…</p></div><b>STATE ${esc(state)}</b><span>PREPARING JUMP…</span></div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{ov.remove();after?.()},1150);
}

async function enterFleetState(state){
  activeFleetState=Number(state||0);
  closeFleet();
  const rows=await loadAccounts();
  playWormhole(activeFleetState,()=>{
    renderCanonicalConstellation(rows,activeFleetState);
    const c=$('#nexa-account-constellation');
    c?.classList.add('open');c?.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  });
}

function ensureFleetReturnButton(){
  const wrap=$('#nexa-account-constellation'),stage=$('.nexa-constellation-stage',wrap);
  if(!wrap||!stage)return;
  let b=$('#nexa-v4484-return-fleet',stage);
  if(!b){b=document.createElement('button');b.id='nexa-v4484-return-fleet';b.type='button';b.textContent='← RETURN TO NEXA FLEET';stage.prepend(b)}
  b.onclick=e=>{e.preventDefault();e.stopPropagation();wrap.classList.remove('open');wrap.setAttribute('aria-hidden','true');openFleet()};
}

async function openSelectedProfile(id){
  const c=sb();if(!c||!id)return;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return;
    const q=await c.from('player_accounts')
      .select('id,in_game_name,player_id,alliance_id,custom_alliance_tag,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url,state_number,alliances(tag)')
      .eq('id',id).eq('user_id',user.id).single();
    if(q.error)throw q.error;
    const a=q.data||{};
    window.NEXA_ACTIVE_ACCOUNT_ID=String(a.id);
    const text=(sel,val)=>{const el=$(sel);if(el)el.textContent=val};
    const value=(sel,val)=>{const el=$(sel);if(el)el.value=val??''};
    const tag=a.alliances?.tag||a.custom_alliance_tag||'Not Listed';
    text('#nexa-profile-name',String(a.in_game_name||'PLAYER').toUpperCase());
    text('#nexa-profile-player-id',a.player_id||'');
    text('#nexa-profile-alliance',tag);
    text('#nexa-profile-role',a.alliance_role||'R3');
    text('#nexa-profile-type',a.is_main?'★ MAIN ACCOUNT':'✦ ALT ACCOUNT');
    text('#nexa-profile-furnace',a.furnace_level||'—');
    text('#nexa-profile-power',a.power?Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:2}).format(Number(a.power)):'—');
    text('#nexa-profile-deployment',a.deployment_capacity?Number(a.deployment_capacity).toLocaleString():'—');
    const photo=$('#nexa-profile-photo');if(photo)photo.src=accountAvatar(a);
    value('#nexa-edit-name',a.in_game_name||'');value('#nexa-edit-role',a.alliance_role||'R3');value('#nexa-edit-furnace',a.furnace_level||'');value('#nexa-edit-power',a.power||'');value('#nexa-edit-deployment',a.deployment_capacity||'');
    $('#nexa-profile-editor')?.classList.remove('open');$('#nexa-deploy-panel')?.classList.remove('open');
    $('#nexa-account-constellation')?.classList.remove('open');$('#nexa-account-constellation')?.setAttribute('aria-hidden','true');
    const p=$('#nexa-profile-modal');p?.classList.add('open');p?.setAttribute('aria-hidden','false');
    profileCameFromConstellation=true;
    window.dispatchEvent(new CustomEvent('nexa:account-changed',{detail:{accountId:String(a.id),stateNumber:Number(a.state_number||0)}}));
    window.dispatchEvent(new CustomEvent('nexa:profile-open',{detail:{accountId:String(a.id)}}));
    schedule();
  }catch(err){alert(err?.message||String(err))}
}

const ONBOARDING=[
  {title:'WELCOME',text:'Welcome to NEXA — your hub for game accounts, profiles, events, schedules, forms, and State tools.'},
  {title:'YOUR ACCOUNTS',text:'Manage multiple Game Accounts, even across different States. Each account stays separate and keeps its own data.'},
  {title:'GET STARTED',text:'Open My Profile to access your NEXA Fleet. Select a State, enter its Account Constellation, and choose the account you want to use.'}
];

async function finishOnboarding(){
  const c=sb();
  try{if(c)await c.auth.updateUser({data:{nexa_onboarding_version:1}})}catch{}
  $('#nexa-v4484-onboarding')?.remove();document.body.style.overflow='';
}
function showOnboarding(){
  if($('#nexa-v4484-onboarding'))return;
  const ov=document.createElement('section');ov.id='nexa-v4484-onboarding';
  ov.innerHTML=`<div class="nexa-v4484-stars"></div><div class="nexa-v4484-shell"><div class="nexa-v4484-onboard-main"><div class="nexa-v4484-onboard-card">
    <div data-onboard-drone>${droneMarkup('intro')}</div>
    <div class="nexa-v4484-dialog"><small>NEXA DRONE</small><p data-onboard-text></p></div>
    <div class="nexa-v4484-mini-path" data-onboard-path></div>
    <div class="nexa-v4484-step" data-onboard-step></div>
    <div class="nexa-v4484-progress" data-onboard-progress></div>
    <button class="nexa-v4484-primary" type="button" data-onboard-next disabled>NEXT</button>
  </div></div></div>`;
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  let page=0;
  const text=$('[data-onboard-text]',ov),next=$('[data-onboard-next]',ov),step=$('[data-onboard-step]',ov),dots=$('[data-onboard-progress]',ov),path=$('[data-onboard-path]',ov);
  function render(){
    const item=ONBOARDING[page];next.disabled=true;
    step.textContent=`${page+1} / ${ONBOARDING.length} · ${item.title}`;
    dots.innerHTML=ONBOARDING.map((_,i)=>`<i class="${i===page?'on':''}"></i>`).join('');
    path.innerHTML=page===2?'<b>MY PROFILE</b><em>→</em><b>NEXA FLEET</b><em>→</em><b>STATE</b><em>→</em><b>ACCOUNT</b>':'';
    next.textContent=page===ONBOARDING.length-1?'ENTER NEXA':'NEXT';
    typeMessage(text,item.text,()=>{next.disabled=false});
  }
  next.addEventListener('click',async()=>{
    if(next.disabled){text.click();return}
    if(page<ONBOARDING.length-1){page++;render();return}
    next.disabled=true;next.textContent='ENTERING…';await finishOnboarding();
  });
  render();
}

async function maybeShowOnboarding(){
  if(onboardingChecked)return;onboardingChecked=true;
  const c=sb();if(!c)return;
  try{
    const {data:{user}}=await c.auth.getUser();
    if(!user){onboardingChecked=false;return}
    const done=Number(user.user_metadata?.nexa_onboarding_version||0)>=1;
    if(!done&&!$('#nexa-auth-gate:not(.hidden)'))showOnboarding();
  }catch{}
}

async function openCompleteBugReporter(){
  const c=sb();
  if(!c)return alert('NEXA is still connecting.');
  document.querySelector('.nexa-v4483-bug-overlay')?.remove();

  const ov=document.createElement('div');
  ov.className='nexa-v4483-bug-overlay';
  ov.innerHTML=`<form class="nexa-v4483-bug-card" id="nexa-v4483-bug-form">
    <button type="button" class="nexa-v4483-bug-close" aria-label="Close">×</button>
    <h3>Report a Bug</h3>
    <p>Tell us what happened. You can attach screenshots or images from iPhone, Android, tablet, Mac or PC. NEXA also sends the page, device and viewport with the report.</p>
    <label>Module
      <input id="nexa-v4483-bug-module" placeholder="Example: Profile → Pets">
    </label>
    <label>What Happened?
      <textarea id="nexa-v4483-bug-desc" required rows="5" placeholder="Tell us what you tapped and what went wrong."></textarea>
    </label>
    <label>Screenshot(s) / Images
      <input class="nexa-v4483-bug-shot" id="nexa-v4483-bug-shots" type="file" accept="image/*,.heic,.heif" multiple>
      <span class="nexa-v4483-bug-files" id="nexa-v4483-bug-files">Optional · up to 5 images.</span>
    </label>
    <div class="nexa-v4483-bug-actions">
      <button type="button" data-bug-cancel>Cancel</button>
      <button class="send" type="submit">Send</button>
    </div>
    <div class="nexa-v4483-bug-status" id="nexa-v4483-bug-status"></div>
  </form>`;
  document.body.appendChild(ov);

  const form=$('#nexa-v4483-bug-form',ov);
  const shots=$('#nexa-v4483-bug-shots',ov);
  const filesText=$('#nexa-v4483-bug-files',ov);
  const status=$('#nexa-v4483-bug-status',ov);

  function close(){ov.remove()}
  $('.nexa-v4483-bug-close',ov)?.addEventListener('click',close);
  $('[data-bug-cancel]',ov)?.addEventListener('click',close);
  ov.addEventListener('click',e=>{if(e.target===ov)close()});

  shots?.addEventListener('change',()=>{
    const files=Array.from(shots.files||[]).slice(0,5);
    filesText.textContent=files.length
      ? `${files.length} image${files.length===1?'':'s'} selected: ${files.map(f=>f.name).join(', ')}`
      : 'Optional · up to 5 images.';
  });

  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const desc=String($('#nexa-v4483-bug-desc',ov)?.value||'').trim();
    if(!desc){status.textContent='Tell us what happened first.';return}
    status.textContent='Preparing report…';
    try{
      const {data:{session}}=await c.auth.getSession();
      if(!session)throw new Error('Please sign in first.');

      const paths=[];
      const files=Array.from(shots?.files||[]).slice(0,5);
      const tempId=crypto.randomUUID?.()||String(Date.now());

      for(const f of files){
        if(!String(f.type||'').startsWith('image/') && !/\.(heic|heif)$/i.test(f.name||'')){
          throw new Error(`${f.name} is not an image.`);
        }
        if(f.size>12*1024*1024)throw new Error(`${f.name} is larger than 12 MB.`);
        const safe=String(f.name||'image').replace(/[^a-zA-Z0-9._-]+/g,'_');
        const path=`${session.user.id}/${tempId}/${Date.now()}-${safe}`;
        const up=await c.storage.from('nexa-bug-reports').upload(path,f,{upsert:false,contentType:f.type||undefined});
        if(up.error)throw up.error;
        paths.push(path);
      }

      const build=$$('body *').find(x=>x.children.length===0&&/^NEXA BUILD\b/i.test(String(x.textContent||'').trim()))?.textContent?.trim()||'';
      const args={
        p_module:String($('#nexa-v4483-bug-module',ov)?.value||'').trim()||'General',
        p_description:desc,
        p_expected_behavior:null,
        p_actual_behavior:desc,
        p_page_path:location.pathname+location.search,
        p_build_label:build,
        p_user_agent:navigator.userAgent,
        p_viewport:`${Math.round(innerWidth)}x${Math.round(window.visualViewport?.height||innerHeight)} @${devicePixelRatio||1}x`,
        p_client_errors:[],
        p_screenshot_paths:paths
      };
      const res=await c.rpc('nexa_submit_bug_report',args);
      if(res.error)throw res.error;
      status.textContent=`Sent ✓ Report ${String(res.data||'').slice(0,8)} is now available to the Owner.`;
      setTimeout(close,1300);
    }catch(err){
      status.textContent=`Could not send: ${err?.message||err}`;
    }
  });
}

function installAuthAdjustments(){
  const gate=$('#nexa-auth-gate');if(!gate)return;
  const brand=$('.nexa-auth-brand p',gate);
  if(brand)brand.textContent='ONE HUB • MANAGEMENT, EVENTS & COORDINATION';

  const note=$('#nexa-pane-create .nexa-auth-note',gate);
  if(note)note.innerHTML='<b>Main Account:</b> Your first Game Account becomes your Main Account. Add as many Game Accounts as you need, including accounts from different States. Each account keeps its own Profile data separate.';

  let report=$('#nexa-v4481-report-bugs');
  if(!report){
    report=document.createElement('button');report.id='nexa-v4481-report-bugs';report.type='button';
    report.innerHTML='🐞';report.setAttribute('aria-label','Report Bugs');report.title='Report Bugs';
    report.onclick=()=>openCompleteBugReporter();
    document.body.appendChild(report);
  }

  const form=$('#nexa-create-form');
  if(form&&!$('#nexa-create-state',form)){
    const ign=$('#nexa-create-name',form)?.closest('label');
    const label=document.createElement('label');
    label.innerHTML='State<input id="nexa-create-state" required inputmode="numeric" pattern="[0-9]*" placeholder="Enter your state"><span class="nexa-field-hint">The state/server this Main Game Account belongs to.</span>';
    ign?.insertAdjacentElement('afterend',label);
  }
}

function capturePendingState(e){
  const form=e.target.closest?.('#nexa-create-form');if(!form)return;
  const input=$('#nexa-create-state',form);if(!input)return;
  const state=Number(String(input.value||'').replace(/\D/g,''));
  if(!state||state<1){e.preventDefault();e.stopPropagation();alert('Enter your state.');return}
  sessionStorage.setItem('nexa_pending_state_number',String(state));
}

async function syncPendingState(){
  const raw=sessionStorage.getItem('nexa_pending_state_number');if(!raw)return;
  const state=Number(raw);if(!state)return;
  const c=sb();if(!c)return;
  try{
    const {data:{user}}=await c.auth.getUser();if(!user)return;
    const q=await c.from('player_accounts').update({state_number:state,updated_at:new Date().toISOString()})
      .eq('user_id',user.id).eq('is_main',true).select('id').limit(1);
    if(!q.error&&q.data?.length)sessionStorage.removeItem('nexa_pending_state_number');
  }catch{}
}

function apply(){
  installCSS();
  installAccountManagerUI();
  installAuthAdjustments();
  cleanMojibake();
  repairAccountLabels();
  if($('#accounts-modal')?.classList.contains('open'))refreshAccountManager();
  deployment();
  experts();
  chiefGearStars();
  syncPendingState();
  ensureFleetReturnButton();
  maybeShowOnboarding();
}
window.NEXADrone={openFleet,showOnboarding,openAccount:openSelectedProfile};

function schedule(){
  requestAnimationFrame(apply);
  [60,180,420,900,1600].forEach(ms=>setTimeout(apply,ms));
}

/* Canonical account selection: native index still opens Passport/Profile.
   This layer only establishes account identity before that native click runs. */

window.addEventListener('click',e=>{
  const launcher=e.target.closest?.('#nexa-profile-launcher');
  if(launcher){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    openFleet();
    return;
  }

  const fleetReturn=e.target.closest?.('#nexa-v4484-return-fleet');
  if(fleetReturn){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    $('#nexa-account-constellation')?.classList.remove('open');
    openFleet();
    return;
  }

  const card=e.target.closest?.('#nexa-account-constellation [data-nexa-profile]');
  if(card?.dataset.nexaProfile){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    openSelectedProfile(String(card.dataset.nexaProfile));
    return;
  }

  const add=e.target.closest?.('#nexa-constellation-add');
  if(add){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    $('#nexa-account-constellation')?.classList.remove('open');
    const m=$('#accounts-modal');m?.classList.add('open');m?.setAttribute('aria-hidden','false');
    installAccountManagerUI();
    if(activeFleetState&&$('#account-state'))$('#account-state').value=String(activeFleetState);
    return;
  }

  const close=e.target.closest?.('[data-close-nexa-profile]');
  if(close){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    const p=$('#nexa-profile-modal');p?.classList.remove('open');p?.setAttribute('aria-hidden','true');
    loadAccounts().then(rows=>{
      renderCanonicalConstellation(rows,activeFleetState);
      const c=$('#nexa-account-constellation');c?.classList.add('open');c?.setAttribute('aria-hidden','false');
    });
    return;
  }
},true);

document.addEventListener('pointerdown',e=>{
  const card=e.target.closest?.('#nexa-account-constellation [data-nexa-profile]');
  if(card?.dataset.nexaProfile){
    const id=String(card.dataset.nexaProfile);
    window.NEXA_ACTIVE_ACCOUNT_ID=id;
    profileCameFromConstellation=true;
    window.dispatchEvent(new CustomEvent('nexa:account-changed',{detail:{accountId:id,stateNumber:activeFleetState}}));
  }
},true);

window.addEventListener('submit',e=>{if(e.target?.id==='account-form'){saveManagedAccount(e);return}capturePendingState(e)},true);

document.addEventListener('click',e=>{
  const closeProfile=e.target.closest?.('[data-close-nexa-profile]');
  if(closeProfile&&profileCameFromConstellation){
    setTimeout(async()=>{
      const rows=await loadAccounts();
      renderCanonicalConstellation(rows);
      const c=$('#nexa-account-constellation');
      c?.classList.add('open');c?.setAttribute('aria-hidden','false');
    },0);
  }

  if(e.target.closest?.('#nexa-profile-launcher,[data-nexa-profile],[data-close-nexa-profile],[data-close-constellation],#nexa-deployment-stat,[data-v33-save],[data-v33-item],[data-v33-cat],[data-v33-gen]'))schedule();
  if(e.target.closest?.('[data-v33-save]'))[120,360,850].forEach(ms=>setTimeout(()=>{deployment();chiefGearStars();},ms));
},true);

document.addEventListener('change',e=>{
  if(e.target.matches?.('[data-v33-expert-skill],[data-v44-pet-level],[data-v33-pet-skill],#nexa-edit-deployment'))schedule();
},true);

window.addEventListener('nexa:profile-open',schedule);
window.addEventListener('nexa:profile-updated',schedule);
window.addEventListener('pageshow',schedule);
window.addEventListener('load',schedule);

schedule();
})();
