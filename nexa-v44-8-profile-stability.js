/* NEXA V45.2 — HOME MENU / NEXA GUIDE / ALLIANCE PENDING / TEXT CLEANUP — 2026-08-25
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
if(window.__NEXA_V452_HOME_GUIDE__) return;
window.__NEXA_V452_HOME_GUIDE__=true;
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
let motionMode=null;

const ACCOUNT_COLORS=['#43e8ff','#ff4fd8','#66ffb2','#ff9f43','#8f63ff','#f7e65c','#ff5f6d','#43a7ff','#b7ff3c','#ff6bf2'];

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
    if(/English\s+.*en-US/i.test(v))v=v.replace(/English\s+.*?en-US/i,'English • en-US');
    if(/Español\s+.*es-/i.test(v))v=v.replace(/Español\s+.*?(es-[A-Z]{2})/i,'Español • $1');
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

  /* V44.8.5 — accessibility + companion drone + brighter Home accents */
  .nexa-v4485-motion-card{width:min(520px,100%);display:grid;gap:16px;text-align:center}
  .nexa-v4485-motion-card h2{margin:0;font-size:24px;letter-spacing:.06em}
  .nexa-v4485-motion-card>p{margin:0;color:#aebbd9;font-size:13px;line-height:1.55}
  .nexa-v4485-motion-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .nexa-v4485-motion-choice{border:1px solid rgba(103,197,255,.38);border-radius:16px;padding:14px 11px;background:linear-gradient(145deg,rgba(18,31,67,.95),rgba(12,10,38,.96));color:#fff;font-weight:900;box-shadow:0 0 18px rgba(79,103,255,.10)}
  .nexa-v4485-motion-choice small{display:block;margin-top:5px;color:#92a3c8;font-weight:650;line-height:1.35}
  .nexa-v4485-motion-choice.full{border-color:rgba(221,87,255,.48);box-shadow:0 0 22px rgba(208,70,255,.13)}
  .nexa-v4485-motion-note{font-size:10px!important;color:#7587ae!important}

  .nexa-v4485-companion{position:fixed;z-index:99970;right:12px;bottom:max(16px,calc(env(safe-area-inset-bottom) + 12px));width:74px;height:74px;border:0;background:transparent;padding:0;display:grid;place-items:center;filter:drop-shadow(0 0 12px rgba(95,200,255,.28));animation:nexaCompanionTrick 120s linear infinite}
  .nexa-v4485-companion .nexa-v4484-drone{transform:scale(.72);transform-origin:center}
  .nexa-v4485-companion-bubble{position:fixed;z-index:99969;right:82px;bottom:max(26px,calc(env(safe-area-inset-bottom) + 22px));width:min(260px,calc(100vw - 110px));border:1px solid rgba(96,205,255,.42);border-radius:15px;padding:11px 12px;background:rgba(7,17,43,.96);box-shadow:0 0 25px rgba(77,104,255,.18);color:#eaf5ff;font-size:11px;line-height:1.45;display:none}
  .nexa-v4485-companion-bubble.open{display:block}
  @keyframes nexaCompanionTrick{0%,92%,100%{transform:rotate(0deg) translateY(0)}93%{transform:rotate(0deg) translateY(-7px)}94.5%{transform:rotate(360deg) translateY(-7px)}96%{transform:rotate(360deg) translateY(0)}}

  /* Keep the existing Home layout; only strengthen its sci-fi glow. */
  #home-svs-section .event,#home-transfers-section .event,#home-announcements-module .event,#home-event-operations-module .event{
    box-shadow:0 0 0 1px rgba(107,129,255,.09),0 0 22px rgba(82,93,255,.08)!important
  }
  #nexa-profile-launcher{filter:drop-shadow(0 0 9px rgba(92,205,255,.24)) drop-shadow(0 0 16px rgba(176,69,255,.15))}

  html.nexa-reduced-motion .nexa-v4484-drone,
  html.nexa-reduced-motion .nexa-v4484-drone.intro,
  html.nexa-reduced-motion .nexa-v4485-companion,
  html.nexa-reduced-motion .nexa-v4484-worm,
  html.nexa-reduced-motion .nexa-v4484-streaks{animation:none!important;transform:none!important}
  html.nexa-reduced-motion .nexa-v4484-worm{filter:none!important;background:radial-gradient(circle,transparent 0 30%,rgba(90,210,255,.55) 31% 35%,rgba(103,73,255,.40) 36% 43%,transparent 44%)!important}
  html.nexa-reduced-motion .nexa-v4484-streaks{display:none!important}
  html.nexa-reduced-motion .nexa-star,html.nexa-reduced-motion .nexa-comet{animation:none!important}
  @media(max-width:520px){.nexa-v4485-motion-actions{grid-template-columns:1fr}.nexa-v4485-companion{right:7px;bottom:max(10px,calc(env(safe-area-inset-bottom) + 8px))}}


  /* ================= NEXA V45.0 CINEMATIC SYSTEM ================= */
  :root{--nexa-cyan:#55e7ff;--nexa-blue:#397cff;--nexa-violet:#8b4dff;--nexa-magenta:#f34de7;--nexa-ink:#02040f}
  #nexa-v4484-onboarding,#nexa-v4484-fleet,#nexa-v4484-wormhole,#nexa-v4485-motion{
    background:
      radial-gradient(circle at 15% 8%,rgba(103,45,255,.38),transparent 26%),
      radial-gradient(circle at 86% 22%,rgba(23,119,255,.34),transparent 31%),
      radial-gradient(circle at 52% 67%,rgba(235,52,255,.18),transparent 33%),
      linear-gradient(160deg,#02030e 0%,#070826 46%,#02040f 100%)!important
  }
  .nexa-v450-nebula{position:absolute;inset:0;pointer-events:none;overflow:hidden;background:
      radial-gradient(ellipse at 18% 78%,rgba(89,54,255,.24),transparent 38%),
      radial-gradient(ellipse at 82% 63%,rgba(0,204,255,.14),transparent 34%),
      radial-gradient(ellipse at 50% 18%,rgba(242,48,255,.12),transparent 31%);
      filter:saturate(1.35)}
  .nexa-v450-nebula:before,.nexa-v450-nebula:after{content:"";position:absolute;border-radius:50%;filter:blur(20px);opacity:.62}
  .nexa-v450-nebula:before{width:58vw;height:18vw;left:-16vw;top:24%;background:linear-gradient(90deg,transparent,#763cff,#27d9ff);transform:rotate(-22deg)}
  .nexa-v450-nebula:after{width:54vw;height:14vw;right:-19vw;bottom:18%;background:linear-gradient(90deg,#ff48da,#5d4cff,transparent);transform:rotate(22deg)}
  .nexa-v4484-stars{opacity:.82!important;background-size:37px 37px,61px 61px!important;filter:drop-shadow(0 0 2px #65bfff)}
  .nexa-v4484-shell{width:min(720px,100%)!important}
  .nexa-v4484-fleet-head small,.nexa-v450-fleet-label,.nexa-v4484-fleet-head p{
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;letter-spacing:.16em
  }
  .nexa-v4484-fleet-head small{color:#65e4ff!important;font-size:9px!important;font-weight:950}
  .nexa-v4484-fleet-head h2{font-size:30px!important;letter-spacing:.14em!important;text-shadow:0 0 18px rgba(90,207,255,.45),0 0 34px rgba(170,75,255,.23)}
  .nexa-v4484-fleet-head p{margin:4px 0 0;color:#8395c3;font-size:9px;font-weight:800}
  .nexa-v450-fleet-label{margin:9px 2px 10px;color:#6fdfff;font-size:9px;font-weight:900}
  .nexa-v4484-fleet-guide{padding:12px;border:1px solid rgba(109,82,255,.22);border-radius:22px;background:linear-gradient(135deg,rgba(7,18,48,.72),rgba(25,7,47,.48));box-shadow:inset 0 0 30px rgba(80,108,255,.05),0 0 26px rgba(101,69,255,.08)}
  .nexa-v4484-dialog{border-color:rgba(85,218,255,.72)!important;background:linear-gradient(145deg,rgba(6,25,61,.96),rgba(28,8,54,.95))!important;box-shadow:0 0 18px rgba(61,211,255,.19),0 0 32px rgba(203,58,255,.12)!important}
  .nexa-v4484-dialog small{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;color:#5ce8ff!important;letter-spacing:.12em!important}
  .nexa-v4484-dialog p{font-family:ui-rounded,"SF Pro Rounded",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
  .nexa-v4484-state-list{gap:14px!important}
  .nexa-v450-ship-card{min-height:126px!important;padding:14px 52px 14px 138px!important;border-radius:24px!important;
    background:
      radial-gradient(circle at 18% 52%,color-mix(in srgb,var(--ship) 24%,transparent),transparent 30%),
      linear-gradient(135deg,rgba(12,19,55,.96),rgba(5,8,28,.96))!important;
    border:1px solid color-mix(in srgb,var(--ship) 68%,transparent)!important;
    box-shadow:0 0 24px color-mix(in srgb,var(--ship) 16%,transparent),inset 0 0 30px rgba(93,76,255,.06)!important}
  .nexa-v450-ship-card:before{content:"";position:absolute;inset:5px;border-radius:19px;border:1px solid rgba(255,255,255,.035);pointer-events:none}
  .nexa-v450-ship-card:active{transform:scale(.985)}
  .nexa-v450-ship-space{position:absolute;left:13px;top:15px;width:112px;height:96px;display:grid;place-items:center}
  .nexa-v450-ship-space:before{content:"";position:absolute;width:92px;height:56px;border-radius:50%;border:1px solid color-mix(in srgb,var(--ship) 40%,transparent);transform:rotate(-14deg);box-shadow:0 0 18px color-mix(in srgb,var(--ship) 15%,transparent)}
  .nexa-v450-ship-card .nexa-v4484-ship{left:auto!important;top:auto!important;width:91px!important;height:43px!important;position:relative!important;z-index:2;transform:skewX(-10deg) rotate(-8deg)!important;
    background:linear-gradient(135deg,#fff 0%,#a5ecff 13%,var(--ship) 34%,#7554ff 67%,#ff55da 100%)!important;
    filter:drop-shadow(0 0 7px #fff) drop-shadow(0 0 14px var(--ship))!important}
  .nexa-v4484-ship i{position:absolute;right:14px;top:13px;width:21px;height:10px;border-radius:50%;background:#071631;border:1px solid #8ef5ff;box-shadow:0 0 8px #5ce8ff}
  .nexa-v450-thruster{position:absolute;z-index:1;left:5px;width:44px;height:10px;border-radius:50%;background:linear-gradient(90deg,transparent,var(--ship),#fff);filter:blur(3px);opacity:.85}
  .nexa-v450-state-copy{position:relative;z-index:2;display:block}
  .nexa-v450-state-copy em{display:block;color:color-mix(in srgb,var(--ship) 90%,white);font-style:normal;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8px;font-weight:900;letter-spacing:.13em;margin-bottom:5px}
  .nexa-v450-state-copy b{font-size:18px!important;text-shadow:0 0 13px color-mix(in srgb,var(--ship) 35%,transparent)}
  .nexa-v450-state-copy small{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px!important;letter-spacing:.07em!important}
  .nexa-v450-ship-card .go{width:36px!important;height:36px!important;box-shadow:0 0 14px color-mix(in srgb,var(--ship) 24%,transparent)}

  /* cinematic wormhole + visible ship */
  #nexa-v4484-wormhole{background:#01030c!important}
  .nexa-v4484-worm{width:min(105vw,650px)!important;box-shadow:0 0 85px rgba(112,64,255,.42);filter:drop-shadow(0 0 44px #7546ff) saturate(1.45)!important}
  .nexa-v450-jump-ship{position:absolute;z-index:4;left:8%;top:54%;width:150px;height:70px;display:grid;place-items:center;transform:translateY(-50%) rotate(-6deg);animation:nexaV450ShipJump 1.45s cubic-bezier(.25,.7,.2,1) both}
  .nexa-v450-jump-ship .nexa-v4484-ship{position:relative!important;left:auto!important;top:auto!important;width:118px!important;height:55px!important;background:linear-gradient(135deg,#fff,#70e8ff 23%,#6c48ff 64%,#ff4fd8)!important;filter:drop-shadow(0 0 12px #4ee8ff) drop-shadow(0 0 24px #7c4fff)!important}
  .nexa-v450-jump-ship .nexa-v450-thruster{left:-4px;width:65px;height:13px}
  @keyframes nexaV450ShipJump{0%{opacity:.15;transform:translate(-70vw,-40%) scale(.72) rotate(-8deg)}38%{opacity:1}100%{opacity:.96;transform:translate(46vw,-50%) scale(.52) rotate(-2deg)}}
  .nexa-v4484-worm-content{width:min(420px,90vw);padding-top:44vh!important}
  .nexa-v4484-worm-content .nexa-v4484-dialog{width:min(330px,84vw)!important}
  .nexa-v4484-worm-content>b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px!important}
  .nexa-v4484-worm-content>span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .nexa-v450-jump-progress{width:min(300px,72vw);height:4px;border-radius:999px;background:rgba(77,94,157,.28);overflow:hidden;box-shadow:0 0 10px rgba(93,197,255,.18)}
  .nexa-v450-jump-progress i{display:block;height:100%;width:100%;transform-origin:left;background:linear-gradient(90deg,#50e8ff,#724dff,#ff4cd6);animation:nexaV450Progress 1.35s ease-out both}
  @keyframes nexaV450Progress{from{transform:scaleX(.04)}to{transform:scaleX(1)}}

  /* Account Constellation: textured CSS planets instead of profile photos */
  #nexa-account-constellation.nexa-v450-constellation .nexa-constellation-backdrop{
    background:
      radial-gradient(circle at 73% 16%,rgba(109,69,255,.34),transparent 24%),
      radial-gradient(circle at 22% 68%,rgba(15,176,255,.18),transparent 29%),
      radial-gradient(circle at 50% 44%,rgba(227,48,255,.15),transparent 33%),
      linear-gradient(160deg,#01030d,#080629 52%,#02030e)!important
  }
  #nexa-account-constellation.nexa-v450-constellation .nexa-constellation-stage{
    background-image:
      radial-gradient(circle,rgba(255,255,255,.95) 0 1px,transparent 1.35px),
      radial-gradient(circle,rgba(81,198,255,.82) 0 1px,transparent 1.5px),
      linear-gradient(28deg,transparent 48%,rgba(81,144,255,.07) 49% 50%,transparent 51%)!important;
    background-size:37px 37px,71px 71px,118px 118px!important
  }
  #nexa-account-constellation.nexa-v450-constellation .nexa-constellation-heading{
    top:max(62px,calc(env(safe-area-inset-top) + 54px))!important;border:1px solid rgba(86,113,255,.55)!important;border-radius:999px!important;padding:9px 17px!important;
    background:linear-gradient(90deg,rgba(11,27,70,.87),rgba(33,10,67,.84))!important;box-shadow:0 0 18px rgba(74,110,255,.15)!important
  }
  #nexa-account-constellation.nexa-v450-constellation .nexa-constellation-heading b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;font-size:13px!important;text-shadow:0 0 9px #6ca7ff}
  #nexa-account-constellation.nexa-v450-constellation .nexa-constellation-heading span{display:block!important;margin-top:2px;color:#778bb8!important;font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;font-size:7px!important;letter-spacing:.10em!important}
  #nexa-v4484-return-fleet{top:max(14px,env(safe-area-inset-top))!important;left:12px!important;padding:9px 13px!important;border-color:rgba(63,125,255,.75)!important;background:rgba(4,13,39,.90)!important;color:#ddecff!important;box-shadow:0 0 16px rgba(63,112,255,.16)!important;font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important}
  #nexa-v4484-return-fleet span{font-size:15px;color:#65e4ff}
  .nexa-v450-orbit.third{position:absolute;left:50%;top:52%;width:68%;height:68%;transform:translate(-50%,-50%) rotate(24deg);border:1px solid rgba(79,128,255,.20);border-radius:50%;pointer-events:none}
  #nexa-account-constellation .nexa-v450-world{z-index:8!important}
  #nexa-account-constellation .nexa-v450-world.main{top:28%!important;left:50%!important}
  #nexa-account-constellation .nexa-v450-world .nexa-v4484-planet-orb{position:relative;padding:0!important;overflow:visible!important;border-width:2px!important}
  #nexa-account-constellation .nexa-v450-world.main .nexa-v4484-planet-orb{width:154px!important;height:154px!important}
  #nexa-account-constellation .nexa-v450-world.alt .nexa-v4484-planet-orb{width:90px!important;height:90px!important}
  .nexa-v450-planet-surface{background:
      radial-gradient(circle at 31% 24%,rgba(255,255,255,.88) 0 2%,transparent 3%),
      radial-gradient(circle at 38% 33%,color-mix(in srgb,var(--acct) 72%,#fff) 0 5%,transparent 15%),
      radial-gradient(circle at 62% 67%,rgba(0,0,0,.44) 0 14%,transparent 32%),
      radial-gradient(circle at 48% 43%,var(--acct),color-mix(in srgb,var(--acct) 64%,#35115f) 44%,#06091d 76%)!important;
      box-shadow:inset -24px -20px 28px rgba(0,0,0,.42),inset 9px 8px 16px rgba(255,255,255,.12),0 0 18px var(--acct),0 0 45px color-mix(in srgb,var(--acct) 44%,transparent)!important}
  .nexa-v450-planet-surface:before{content:"";position:absolute;left:-16%;right:-16%;top:43%;height:26%;border-radius:50%;border:2px solid color-mix(in srgb,var(--acct) 88%,#fff);transform:rotate(-11deg);box-shadow:0 0 9px var(--acct),inset 0 0 10px color-mix(in srgb,var(--acct) 30%,transparent);pointer-events:none}
  .nexa-v450-planet-surface:after{content:"";position:absolute;inset:7%;border-radius:50%;background:repeating-radial-gradient(circle at 30% 35%,rgba(255,255,255,.08) 0 2px,transparent 3px 11px);mix-blend-mode:screen;opacity:.65}
  .nexa-v450-planet-surface i{position:absolute;right:-10%;top:7%;width:18%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff,var(--acct) 34%,#10152f 80%);box-shadow:0 0 9px var(--acct)}
  .nexa-v450-crown{position:absolute;z-index:12;top:-38px;left:50%;transform:translateX(-50%);font-size:39px;color:#ffd84e;text-shadow:0 0 5px #fff3a2,0 0 14px #ffc120,0 0 24px #ff6d00}
  .nexa-v450-account-badge{display:inline-flex!important;align-items:center;justify-content:center;margin-top:8px!important;padding:5px 11px!important;border:1px solid var(--acct)!important;border-radius:999px!important;background:rgba(11,8,42,.90)!important;color:#fff!important;font-size:8px!important;font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;font-weight:900!important;letter-spacing:.08em!important;box-shadow:0 0 13px color-mix(in srgb,var(--acct) 28%,transparent)!important}
  .nexa-v450-account-badge.alt{padding:4px 9px!important}
  #nexa-account-constellation .nexa-v450-world .nexa-account-planet-name{font-size:12px!important;font-weight:950!important;letter-spacing:.04em!important;text-shadow:0 0 8px #000,0 0 10px var(--acct)!important}
  #nexa-account-constellation .nexa-v450-world.main .nexa-account-planet-name{font-size:15px!important}
  .nexa-v450-player-id{display:block;margin-top:2px;color:#c5d8ff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:7px;white-space:nowrap}
  .nexa-v450-alliance-chip{display:inline-flex;margin-top:5px;padding:4px 8px;border-radius:999px;border:1px solid color-mix(in srgb,var(--acct) 58%,transparent);background:rgba(6,12,33,.84);color:#e9f4ff;font-size:8px;font-weight:850;white-space:nowrap}
  #nexa-account-constellation .nexa-v450-add .nexa-v4484-add-orb{width:62px!important;height:62px!important;font-size:31px!important;background:rgba(5,17,43,.86)!important;border-color:#56e8ff!important;box-shadow:0 0 19px rgba(71,222,255,.32)!important}
  #nexa-account-constellation .nexa-v450-add .nexa-account-planet-name{font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;font-size:8px!important}

  /* Returning-login cinematic welcome */
  #nexa-v450-returning{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:hidden;color:#fff;background:#02030e}
  .nexa-v450-return-card{position:relative;z-index:3;width:min(460px,90vw);display:grid;place-items:center;gap:16px;text-align:center}
  .nexa-v450-logo-ring{position:relative;width:150px;height:150px;border-radius:50%;display:grid;place-items:center;border:2px solid #4ce6ff;box-shadow:0 0 20px #41dcff,0 0 55px rgba(124,64,255,.65),inset 0 0 30px rgba(101,67,255,.25)}
  .nexa-v450-logo-ring:before,.nexa-v450-logo-ring:after{content:"";position:absolute;border-radius:50%;inset:-16px;border:2px solid rgba(239,69,255,.66);box-shadow:0 0 25px rgba(239,69,255,.35)}
  .nexa-v450-logo-ring:after{inset:-31px;border-color:rgba(60,122,255,.30)}
  .nexa-v450-logo-ring img{width:88px;height:88px;object-fit:contain;filter:drop-shadow(0 0 15px #77eaff)}
  .nexa-v450-return-card h1{margin:2px 0 0;font-size:31px;letter-spacing:.22em;text-shadow:0 0 16px #4de3ff,0 0 29px rgba(205,66,255,.45)}
  .nexa-v450-systemline{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#7fe9ff;font-size:9px;font-weight:900;letter-spacing:.17em}
  .nexa-v450-return-card .nexa-v4484-drone{margin-top:7px}
  .nexa-v450-tagline{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#a2add0;font-size:9px;letter-spacing:.23em}
  .nexa-v450-sync{width:min(285px,78vw);height:4px;border-radius:99px;overflow:hidden;background:#111934}
  .nexa-v450-sync i{display:block;width:100%;height:100%;background:linear-gradient(90deg,#46eaff,#7654ff,#ff4ddd);transform-origin:left;animation:nexaV450Sync 1.25s ease-out both}
  @keyframes nexaV450Sync{from{transform:scaleX(.03)}to{transform:scaleX(1)}}

  /* Companion moved to top near NEXA, one tap hint / double-tap full help */
  #nexa-v4485-home-drone,#nexa-v4485-profile-drone{right:10px!important;bottom:auto!important;top:max(62px,calc(env(safe-area-inset-top) + 48px))!important}
  #nexa-v4485-home-bubble,#nexa-v4485-profile-bubble{right:78px!important;bottom:auto!important;top:max(75px,calc(env(safe-area-inset-top) + 61px))!important}
  .nexa-v450-help-overlay{position:fixed;inset:0;z-index:2147483647;padding:14px;display:grid;place-items:center;background:rgba(0,2,12,.78);backdrop-filter:blur(10px)}
  .nexa-v450-help-card{position:relative;width:min(570px,100%);max-height:88dvh;overflow:auto;border:1px solid rgba(79,209,255,.55);border-radius:25px;padding:18px;background:radial-gradient(circle at 12% 0%,rgba(101,75,255,.18),transparent 35%),linear-gradient(155deg,#0a1231,#050718);box-shadow:0 28px 80px rgba(0,0,0,.62),0 0 35px rgba(98,76,255,.17);color:#fff}
  .nexa-v450-help-head{display:grid;grid-template-columns:78px 1fr 34px;gap:10px;align-items:center}
  .nexa-v450-help-head .nexa-v4484-drone{transform:scale(.78)}
  .nexa-v450-help-head small{color:#63e6ff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:900;letter-spacing:.14em}
  .nexa-v450-help-head h3{margin:3px 0;font-size:20px}.nexa-v450-help-head p{margin:0;color:#9eafd0;font-size:11px;line-height:1.4}
  .nexa-v450-help-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,92,182,.45);background:#210921;color:#ff9fd0;font-size:20px}
  .nexa-v450-help-list{display:grid;gap:8px;margin-top:15px}
  .nexa-v450-help-q{width:100%;border:1px solid rgba(107,116,255,.28);border-radius:14px;padding:11px 12px;background:linear-gradient(135deg,rgba(11,24,57,.92),rgba(22,9,48,.87));color:#eaf4ff;text-align:left;font-weight:800}
  .nexa-v450-help-q span{float:right;color:#5ee4ff}
  .nexa-v450-help-answer{margin-top:13px;padding:13px;border:1px solid rgba(88,217,255,.26);border-radius:15px;background:rgba(5,20,43,.76);color:#c8d6ef;font-size:12px;line-height:1.5}
  .nexa-v450-help-answer b{color:#fff}.nexa-v450-help-back{margin-top:10px;border:0;background:transparent;color:#72e5ff;font-weight:900}

  html.nexa-reduced-motion .nexa-v450-jump-ship,
  html.nexa-reduced-motion .nexa-v450-sync i,
  html.nexa-reduced-motion .nexa-v450-jump-progress i{animation:none!important;transform:none!important}

  @media(max-width:560px){
    .nexa-v450-ship-card{padding-left:118px!important;min-height:116px!important}.nexa-v450-ship-space{left:4px;width:106px}
    #nexa-account-constellation .nexa-v450-world.main .nexa-v4484-planet-orb{width:130px!important;height:130px!important}
    #nexa-account-constellation .nexa-v450-world.alt .nexa-v4484-planet-orb{width:78px!important;height:78px!important}
    .nexa-v450-crown{font-size:32px;top:-31px}
    .nexa-v450-player-id{font-size:6.5px}.nexa-v450-alliance-chip{font-size:7px}
  }



  /* ================= NEXA V45.1 POLISH ================= */
  body.nexa-v451-fleet-open #nexa-home-menu-toggle,
  body.nexa-v451-constellation-open #nexa-home-menu-toggle,
  body.nexa-v451-profile-open #nexa-home-menu-toggle,
  body:has(#accounts-modal.open) #nexa-home-menu-toggle{display:none!important}

  .nexa-v451-ship-img{display:block;width:108px;height:76px;object-fit:contain;filter:drop-shadow(0 0 7px #62e8ff) drop-shadow(0 0 14px #8f4fff) drop-shadow(0 0 18px rgba(255,71,221,.42));transform:rotate(-7deg)}
  .nexa-v450-ship-card:nth-child(2n) .nexa-v451-ship-img{filter:hue-rotate(42deg) saturate(1.18) drop-shadow(0 0 8px #6effdc) drop-shadow(0 0 16px rgba(93,255,180,.42))}
  .nexa-v450-ship-card:nth-child(3n) .nexa-v451-ship-img{filter:hue-rotate(300deg) saturate(1.24) drop-shadow(0 0 8px #ff9b59) drop-shadow(0 0 16px rgba(255,97,67,.40))}
  .nexa-v450-ship-space:before{width:105px!important;height:60px!important;opacity:.52}
  .nexa-v450-jump-ship .nexa-v451-ship-img{width:150px;height:104px;transform:rotate(-5deg);filter:drop-shadow(0 0 10px #5cecff) drop-shadow(0 0 24px #784cff) drop-shadow(0 0 32px rgba(255,67,218,.46))}
  .nexa-v450-jump-ship:after{content:"";position:absolute;left:-42px;top:29px;width:88px;height:22px;border-radius:50%;background:linear-gradient(90deg,transparent,#42eaff 47%,#fff 72%,#ff50dc);filter:blur(6px);opacity:.8;z-index:-1}

  #nexa-account-constellation .nexa-v451-world .nexa-v4484-planet-orb{overflow:visible!important}
  .nexa-v451-inside{position:absolute;z-index:7;left:50%;top:54%;width:82%;transform:translate(-50%,-50%);display:grid;gap:2px;text-align:center;pointer-events:none;text-shadow:0 2px 7px rgba(0,0,0,.95),0 0 8px rgba(0,0,0,.95)}
  .nexa-v451-inside b{display:block;color:#fff;font-size:11px;line-height:1.05;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .nexa-v451-inside small{display:block;color:#eef6ff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:6px;line-height:1.05;white-space:nowrap}
  #nexa-account-constellation .nexa-v451-world.main .nexa-v451-inside b{font-size:15px}
  #nexa-account-constellation .nexa-v451-world.main .nexa-v451-inside small{font-size:7px}
  #nexa-account-constellation .nexa-v451-world .nexa-v450-account-badge{margin-top:7px!important}
  #nexa-account-constellation .nexa-v451-world .nexa-v450-alliance-chip{margin-top:4px!important}
  #nexa-account-constellation .nexa-v451-world .nexa-account-planet-name,
  #nexa-account-constellation .nexa-v451-world .nexa-v450-player-id{display:none!important}
  #nexa-account-constellation .nexa-v451-world.alt .nexa-v450-account-badge{font-size:6.7px!important;padding:4px 7px!important}

  #nexa-v4485-home-drone.accounts-context{top:max(178px,calc(env(safe-area-inset-top) + 164px))!important}
  #nexa-v4485-home-drone.accounts-context + #nexa-v4485-home-bubble{top:max(190px,calc(env(safe-area-inset-top) + 176px))!important}

  /* Profile: stronger neon depth without changing structure */
  #nexa-profile-modal.open .nexa-profile-shell,
  #nexa-profile-modal.open [class*="profile-shell"],
  #nexa-profile-modal.open [class*="profile-card"]{box-shadow:0 0 0 1px rgba(94,194,255,.09),0 0 28px rgba(71,145,255,.08),0 0 44px rgba(190,62,255,.07)!important}
  #nexa-profile-modal.open .v33-tab.active,
  #nexa-profile-modal.open .v33-chip.active{box-shadow:0 0 16px rgba(121,72,255,.24),0 0 26px rgba(71,211,255,.10)!important}
  #nexa-profile-modal.open .v33-planet{filter:saturate(1.12) brightness(1.04)}

  @media(max-width:560px){
    .nexa-v451-ship-img{width:98px;height:70px}
    .nexa-v450-jump-ship .nexa-v451-ship-img{width:128px;height:90px}
    .nexa-v451-inside b{font-size:9px}.nexa-v451-inside small{font-size:5.3px}
    #nexa-account-constellation .nexa-v451-world.main .nexa-v451-inside b{font-size:13px}
  }


  /* ================= NEXA V45.2 HOME + MENU ================= */
  body.nexa-v452-away-home #nexa-home-menu-toggle,
  body.nexa-v452-away-home #nexa-home-menu{display:none!important}
  body:not(.nexa-v452-away-home):not(:has(#nexa-auth-gate:not(.hidden))) #nexa-home-menu-toggle{
    display:flex!important;
    border:1px solid rgba(76,228,255,.72)!important;
    background:linear-gradient(135deg,rgba(4,34,68,.94),rgba(7,18,48,.96))!important;
    color:#dffcff!important;
    box-shadow:0 0 12px rgba(68,223,255,.30),0 0 28px rgba(54,143,255,.16),inset 0 0 18px rgba(70,226,255,.08)!important
  }
  #nexa-home-menu{
    border-color:rgba(68,220,255,.48)!important;
    background:
      radial-gradient(circle at 18% 0%,rgba(53,202,255,.16),transparent 34%),
      radial-gradient(circle at 86% 86%,rgba(93,74,255,.14),transparent 38%),
      linear-gradient(155deg,rgba(4,15,39,.98),rgba(6,8,27,.98))!important;
    box-shadow:0 22px 65px rgba(0,0,0,.58),0 0 26px rgba(57,214,255,.17)!important
  }
  #nexa-home-menu button,#nexa-home-menu a{
    border-color:rgba(67,209,255,.16)!important
  }
  #nexa-home-menu button:hover,#nexa-home-menu a:hover,
  #nexa-home-menu button:active,#nexa-home-menu a:active{
    background:rgba(34,183,255,.10)!important;
    box-shadow:inset 3px 0 0 #5ce8ff!important
  }

  /* Keep Home structure and wording; upgrade only the four signal cards. */
  #home-svs-section .event,
  #home-transfers-section .event,
  #home-announcements-module .event,
  #home-event-operations-module .event{
    --nexa-card-accent:#55e7ff;
    position:relative!important;
    overflow:hidden!important;
    border:1px solid color-mix(in srgb,var(--nexa-card-accent) 55%,transparent)!important;
    background:
      radial-gradient(circle at 92% 18%,color-mix(in srgb,var(--nexa-card-accent) 15%,transparent),transparent 31%),
      linear-gradient(135deg,rgba(7,18,47,.94),rgba(5,8,26,.96))!important;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.018),
      0 0 22px color-mix(in srgb,var(--nexa-card-accent) 12%,transparent),
      inset 0 0 28px color-mix(in srgb,var(--nexa-card-accent) 5%,transparent)!important
  }
  #home-svs-section .event{--nexa-card-accent:#ff62cf}
  #home-transfers-section .event{--nexa-card-accent:#ff9b54}
  #home-announcements-module .event{--nexa-card-accent:#56e9ff}
  #home-event-operations-module .event{--nexa-card-accent:#67ffd0}
  #home-svs-section .event:before,
  #home-transfers-section .event:before,
  #home-announcements-module .event:before,
  #home-event-operations-module .event:before{
    content:"";position:absolute;left:0;top:12%;bottom:12%;width:2px;border-radius:99px;
    background:var(--nexa-card-accent);box-shadow:0 0 12px var(--nexa-card-accent)
  }
  #home-svs-section .event h2,#home-svs-section .event h3,#home-svs-section .event strong,
  #home-transfers-section .event h2,#home-transfers-section .event h3,#home-transfers-section .event strong,
  #home-announcements-module .event h2,#home-announcements-module .event h3,#home-announcements-module .event strong,
  #home-event-operations-module .event h2,#home-event-operations-module .event h3,#home-event-operations-module .event strong{
    letter-spacing:.035em!important;
    text-shadow:0 0 12px color-mix(in srgb,var(--nexa-card-accent) 18%,transparent)
  }
  #home-svs-section .event [class*="label"],
  #home-transfers-section .event [class*="label"],
  #home-announcements-module .event [class*="label"],
  #home-event-operations-module .event [class*="label"]{
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;
    letter-spacing:.15em!important
  }

  #nexa-v452-alliance-note{
    margin-top:2px;padding:8px 9px;border-radius:10px;
    border:1px solid rgba(79,219,255,.18);background:rgba(21,132,172,.07);color:#91dded!important
  }

  /* Chief Gear stars: inside planet, left side, vertical */
  .v448-gear-stars{
    position:absolute;z-index:8;left:8px;bottom:15px;
    display:flex;flex-direction:column-reverse;gap:1px;pointer-events:none
  }
  .v448-gear-stars span{
    font-size:10px;line-height:10px;color:#ffd84f;
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
      .select('id,in_game_name,player_id,is_main,account_purpose,state_number,deployment_capacity,profile_photo_url,alliance_id,custom_alliance_tag,alliances(tag)')
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
  const game=$('#player-id',form);
  if(game){game.inputMode='numeric';game.pattern='[0-9]{6,12}';game.minLength=6;game.maxLength=12;game.placeholder='Game ID (numbers only)';game.oninput=()=>{game.value=game.value.replace(/\D/g,'').slice(0,12)}}
  const alliance=$('#alliance',form);
  if(alliance){alliance.required=false;const label=alliance.closest('label');if(label&&label.firstChild?.nodeType===3)label.firstChild.nodeValue='Alliance (Optional)';}
  const custom=$('#custom-alliance',form);if(custom)custom.required=false;
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
    const gameId=String($('#player-id')?.value||'').replace(/\D/g,'');
    if(!editId&&!/^[0-9]{6,12}$/.test(gameId))throw new Error('Game ID must contain 6–12 numbers only.');
    const alliance=$('#alliance'),custom=$('#custom-alliance'),notListed=alliance?.value==='not-listed',allianceValue=String(alliance?.value||'');
    const payload={
      in_game_name:String($('#ign')?.value||'').trim(),
      alliance_id:(!allianceValue||notListed)?null:Number(allianceValue),
      custom_alliance_tag:notListed?String(custom?.value||'').trim()||null:null,
      account_purpose:'full',
      state_number:state
    };
    let r;
    if(editId)r=await c.from('player_accounts').update(payload).eq('id',editId).eq('user_id',user.id);
    else{
      const existing=await c.from('player_accounts').select('id').eq('user_id',user.id).eq('player_id',gameId).eq('state_number',state).limit(1);
      if(existing.data?.length)throw new Error('That Game ID is already added for this State.');
      if(!confirm(`Verify Your Game Account\n\nGame ID: ${gameId}\nState: ${state}\n\nIs this information correct?`))return true;
      r=await c.from('player_accounts').insert({...payload,user_id:user.id,player_id:gameId,is_main:false});
    }
    if(r.error)throw r.error;
    if($('#edit-account-id'))$('#edit-account-id').value='';
    if($('#ign'))$('#ign').value='';if($('#player-id')){$('#player-id').value='';$('#player-id').disabled=false}
    if($('#account-state'))$('#account-state').value='';
    await refreshAccountManager();await repairAccountLabels();
    const modal=$('#accounts-modal');modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');
    const rows=await loadAccounts();
    renderCanonicalConstellation(rows,activeFleetState||state);
    const cst=$('#nexa-account-constellation');cst?.classList.add('open');cst?.setAttribute('aria-hidden','false');
    document.body.classList.add('nexa-v451-constellation-open');
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
function shuffledAccountColors(count){
  const pool=[...ACCOUNT_COLORS];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  while(pool.length<count)pool.push(...ACCOUNT_COLORS);
  return pool.slice(0,count);
}
function shipAssetMarkup(extra=''){
  return `<img class="nexa-v451-ship-img ${extra}" src="/nexa-fleet-ship.png" alt="NEXA ship">`;
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
  const pos=[[18,63],[82,63],[18,34],[82,34],[50,79],[50,16],[10,49],[90,49],[33,82],[67,82],[33,18],[67,18]];
  const alliance=a=>a?.alliances?.tag||a?.custom_alliance_tag||'UNASSIGNED';
  const colors=shuffledAccountColors(Math.max(1,list.length));
  const colorById=new Map(list.map((a,i)=>[String(a.id),colors[i]]));

  let out='<span class="nexa-constellation-orbit one"></span><span class="nexa-constellation-orbit two"></span><span class="nexa-v450-orbit third"></span>';

  if(main){
    const c=colorById.get(String(main.id))||ACCOUNT_COLORS[0];
    out+=`<button type="button" class="nexa-account-planet main nexa-v4484-planet nexa-v450-world nexa-v451-world" data-nexa-profile="${esc(main.id)}" style="--acct:${c}">
      <span class="nexa-v450-crown">♛</span>
      <span class="nexa-v4484-planet-orb nexa-v450-planet-surface">
        <i></i>
        <span class="nexa-v451-inside"><b>${esc(main.in_game_name||'WOS Account')}</b><small>ID: ${esc(main.player_id||'—')}</small></span>
      </span>
      <span class="nexa-v450-account-badge">♛ MY MAIN</span>
      <span class="nexa-v450-alliance-chip">✦ ${esc(alliance(main))}</span>
    </button>`;
  }

  others.forEach((a,i)=>{
    const p=pos[i%pos.length];
    const c=colorById.get(String(a.id))||ACCOUNT_COLORS[(i+1)%ACCOUNT_COLORS.length];
    out+=`<button type="button" class="nexa-account-planet alt nexa-v4484-planet nexa-v450-world nexa-v451-world" data-nexa-profile="${esc(a.id)}" style="left:${p[0]}%;top:${p[1]}%;--acct:${c}">
      <span class="nexa-v4484-planet-orb nexa-v450-planet-surface">
        <i></i>
        <span class="nexa-v451-inside"><b>${esc(a.in_game_name||'Account')}</b><small>ID: ${esc(a.player_id||'—')}</small></span>
      </span>
      <span class="nexa-v450-account-badge alt">ALT ACCOUNT</span>
      <span class="nexa-v450-alliance-chip">✦ ${esc(alliance(a))}</span>
    </button>`;
  });

  const addPos=pos[Math.max(0,list.length-1)%pos.length];
  out+=`<button type="button" id="nexa-constellation-add" class="nexa-account-planet alt nexa-add-planet nexa-v4484-planet nexa-v450-add" style="left:${addPos[0]}%;top:${addPos[1]}%">
    <span class="nexa-v4484-add-orb">+</span><span class="nexa-account-planet-name">ADD ACCOUNT</span>
  </button>`;

  system.innerHTML=out;
  const wrap=$('#nexa-account-constellation');
  wrap?.classList.add('nexa-v450-constellation');
  document.body.classList.add('nexa-v451-constellation-open');
  const heading=$('.nexa-constellation-heading',wrap);
  if(heading){
    const count=list.length;
    heading.innerHTML=`<b>STATE ${esc(state||'—')} &nbsp;•&nbsp; ${count} ACCOUNT${count===1?'':'S'}</b><span>CHOOSE THE GAME ACCOUNT YOU WANT TO ACCESS</span>`;
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
  document.body.classList.remove('nexa-v451-fleet-open');
  document.body.style.overflow='';
}
async function openFleet(){
  const rows=await loadAccounts();
  $('#nexa-account-constellation')?.classList.remove('open');
  $('#nexa-account-constellation')?.setAttribute('aria-hidden','true');
  $('#nexa-v4484-fleet')?.remove();
  const ov=document.createElement('section');ov.id='nexa-v4484-fleet';ov.className='nexa-v450-cinematic';
  ov.innerHTML=`<div class="nexa-v450-nebula"></div><div class="nexa-v4484-stars"></div><div class="nexa-v4484-shell">
    <div class="nexa-v4484-fleet-head">
      <div><small>NEXA SYSTEM // PROFILE NAVIGATION</small><h2>NEXA FLEET</h2><p>DISCOVER • CONNECT • EXPLORE</p></div>
      <button class="nexa-v4484-close" type="button" data-fleet-close>×</button>
    </div>
    <div class="nexa-v4484-fleet-guide">${droneMarkup()}<div class="nexa-v4484-dialog"><small>NEXA</small><p data-fleet-guide></p></div></div>
    <div class="nexa-v450-fleet-label">AVAILABLE STATES // SELECT DESTINATION</div>
    <div class="nexa-v4484-state-list" data-fleet-list></div>
  </div>`;
  document.body.appendChild(ov);document.body.classList.add('nexa-v451-fleet-open');document.body.style.overflow='hidden';

  const groups=groupAccountsByState(rows);
  const list=$('[data-fleet-list]',ov);
  list.innerHTML=groups.length?groups.map(([state,accounts],i)=>{
    const c=stateShipColor(state);
    return `<button class="nexa-v4484-state-card nexa-v450-ship-card" type="button" data-fleet-state="${esc(state)}" style="--ship:${c};--ship-i:${i}">
      <span class="nexa-v450-ship-space">${shipAssetMarkup()}</span>
      <span class="nexa-v450-state-copy"><em>STATE LINK // READY</em><b>STATE ${esc(state||'UNASSIGNED')}</b><small>${accounts.length} ACCOUNT${accounts.length===1?'':'S'} CONNECTED</small></span>
      <span class="go">→</span>
    </button>`;
  }).join(''):'<div class="nexa-v4484-fleet-empty">NO GAME ACCOUNTS FOUND // ADD AN ACCOUNT TO BEGIN</div>';

  typeMessage($('[data-fleet-guide]',ov),'Hi, I’m NEXA. Welcome to NEXA Fleet. Choose a State and I’ll guide your ship to its Account Constellation.');
  $('[data-fleet-close]',ov)?.addEventListener('click',closeFleet);
  ov.addEventListener('click',e=>{
    const card=e.target.closest?.('[data-fleet-state]');if(!card)return;
    enterFleetState(Number(card.dataset.fleetState||0));
  });
}

function playWormhole(state,after,direction='in'){
  $('#nexa-v4484-wormhole')?.remove();
  const ov=document.createElement('section');ov.id='nexa-v4484-wormhole';ov.className='nexa-v450-cinematic';
  const returning=direction==='out';
  ov.innerHTML=`<div class="nexa-v450-nebula"></div><div class="nexa-v4484-streaks"></div><div class="nexa-v4484-worm"></div>
    <div class="nexa-v450-jump-ship">${shipAssetMarkup("jump")}</div>
    <div class="nexa-v4484-worm-content">${droneMarkup('intro')}
      <div class="nexa-v4484-dialog"><small>NEXA</small><p>${returning?'Heading back to NEXA Fleet. I’ll guide you to the ship.':'I’ve got it. Opening your Account Constellation…'}</p></div>
      <b>${returning?'RETURNING TO NEXA FLEET':`STATE ${esc(state)}`}</b>
      <span>${returning?'NAVIGATION LOCKED // RETURN JUMP':'PREPARING JUMP // CONSTELLATION LOCKED'}</span>
      <div class="nexa-v450-jump-progress"><i></i></div>
    </div>`;
  document.body.appendChild(ov);
  const delay=document.documentElement.classList.contains('nexa-reduced-motion')?420:1450;
  setTimeout(()=>{ov.remove();after?.()},delay);
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
  },'in');
}

function returnToFleetWithJump(){
  const wrap=$('#nexa-account-constellation');
  wrap?.classList.remove('open');wrap?.setAttribute('aria-hidden','true');
  document.body.classList.remove('nexa-v451-constellation-open');
  playWormhole(activeFleetState,()=>openFleet(),'out');
}

function ensureFleetReturnButton(){
  const wrap=$('#nexa-account-constellation'),stage=$('.nexa-constellation-stage',wrap);
  if(!wrap||!stage)return;
  let b=$('#nexa-v4484-return-fleet',stage);
  if(!b){b=document.createElement('button');b.id='nexa-v4484-return-fleet';b.type='button';stage.prepend(b)}
  b.innerHTML='<span>←</span> RETURN TO NEXA FLEET';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();returnToFleetWithJump()};
}
function maybeShowFirstProfileGuide(account){
  if(!account?.id)return;
  const key=`nexa_profile_intro_${account.id}`;
  if(localStorage.getItem(key)==='1')return;
  const empty=!String(account.furnace_level||'').trim();
  if(!empty)return;
  setTimeout(()=>{
    if(!$('#nexa-profile-modal')?.classList.contains('open'))return;
    $('.nexa-v451-first-profile')?.remove();
    const ov=document.createElement('div');ov.className='nexa-v450-help-overlay nexa-v451-first-profile';
    ov.innerHTML=`<section class="nexa-v450-help-card">
      <div class="nexa-v450-help-head">${droneMarkup()}<div><small>NEXA // FIRST PROFILE SETUP</small><h3>Hi, I’m NEXA. Welcome to your Profile.</h3><p>This Game Account is still missing its progression details.</p></div><button class="nexa-v450-help-close" type="button">×</button></div>
      <div class="nexa-v450-help-answer" style="display:block;margin-top:14px">
        <b>Start with Edit Profile.</b>
        <div style="margin-top:7px">Enter your Furnace or Fire Crystal level, Power, Deployment Capacity and the rest of the account information you know. NEXA uses that progression to adapt available Profile items and unlock the correct options as your account grows.</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px">
        <button type="button" class="nexa-v450-help-q" data-profile-later>GOT IT</button>
        <button type="button" class="nexa-v450-help-q" data-profile-edit>EDIT MY PROFILE <span>→</span></button>
      </div>
    </section>`;
    document.body.appendChild(ov);
    const done=()=>{localStorage.setItem(key,'1');ov.remove()};
    $('.nexa-v450-help-close',ov).onclick=done;
    $('[data-profile-later]',ov).onclick=done;
    $('[data-profile-edit]',ov).onclick=()=>{
      done();
      const buttons=$$('#nexa-profile-modal button');
      const edit=buttons.find(b=>/edit profile/i.test(String(b.textContent||'')));
      edit?.click();
    };
  },260);
}

function cleanLegacyHomeAccountLimit(){
  const root=$('#nexa-profile-launcher');if(!root)return;
  $$('*',root).forEach(el=>{
    if(el.children.length)return;
    const t=String(el.textContent||'').trim();
    if(/^\d+\s*\/\s*5$/.test(t))el.style.display='none';
  });
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
    $('#nexa-account-constellation')?.classList.remove('open');$('#nexa-account-constellation')?.setAttribute('aria-hidden','true');document.body.classList.remove('nexa-v451-constellation-open');
    const p=$('#nexa-profile-modal');p?.classList.add('open');p?.setAttribute('aria-hidden','false');document.body.classList.add('nexa-v451-profile-open');
    profileCameFromConstellation=true;ensureCompanionDrones();
    window.dispatchEvent(new CustomEvent('nexa:account-changed',{detail:{accountId:String(a.id),stateNumber:Number(a.state_number||0)}}));
    window.dispatchEvent(new CustomEvent('nexa:profile-open',{detail:{accountId:String(a.id)}}));
    maybeShowFirstProfileGuide(a);schedule();
  }catch(err){alert(err?.message||String(err))}
}

function devicePrefersReducedMotion(){
  try{return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true}catch{return false}
}
function applyMotionMode(mode){
  motionMode=mode==='reduced'?'reduced':'full';
  document.documentElement.classList.toggle('nexa-reduced-motion',motionMode==='reduced');
}
async function loadMotionMode(){
  const c=sb();
  try{
    const {data:{user}}=await c.auth.getUser();
    const saved=String(user?.user_metadata?.nexa_motion_mode||'');
    if(saved==='full'||saved==='reduced'){applyMotionMode(saved);return saved}
  }catch{}
  const fallback=devicePrefersReducedMotion()?'reduced':'full';applyMotionMode(fallback);return null;
}
async function saveMotionMode(mode){
  applyMotionMode(mode);
  const c=sb();
  try{if(c)await c.auth.updateUser({data:{nexa_motion_mode:motionMode}})}catch{}
}
function showMotionChoice(after){
  if($('#nexa-v4485-motion'))return;
  const ov=document.createElement('section');ov.id='nexa-v4485-motion';ov.setAttribute('style','position:fixed;inset:0;z-index:2147483647;color:#fff;background:radial-gradient(circle at 18% 18%,rgba(112,58,255,.28),transparent 30%),radial-gradient(circle at 80% 72%,rgba(23,143,255,.22),transparent 34%),linear-gradient(155deg,#030516,#070a24 55%,#02040f);overflow:auto');
  const recommended=devicePrefersReducedMotion();
  ov.innerHTML=`<div class="nexa-v4484-stars"></div><div class="nexa-v4484-shell"><div class="nexa-v4484-onboard-main"><div class="nexa-v4485-motion-card">
    <div style="display:grid;place-items:center">${droneMarkup('intro')}</div>
    <div><small style="color:#67dfff;font-weight:950;letter-spacing:.13em">ACCESSIBILITY</small><h2>MOTION & VISUAL EFFECTS</h2></div>
    <p>NEXA uses animated transitions, glowing effects, flashes, and space-motion visuals. If you are sensitive to motion or flashing effects, you can reduce them.</p>
    <div class="nexa-v4485-motion-actions">
      <button type="button" class="nexa-v4485-motion-choice full" data-motion="full">KEEP FULL EFFECTS<small>Full glow, flashes, wormholes and animated transitions.</small></button>
      <button type="button" class="nexa-v4485-motion-choice" data-motion="reduced">REDUCE MOTION & EFFECTS<small>Softer transitions with fewer flashes and less movement.${recommended?' Recommended by your device settings.':''}</small></button>
    </div>
    <p class="nexa-v4485-motion-note">You can change this preference later in Settings.</p>
  </div></div></div>`;
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  ov.addEventListener('click',async e=>{
    const btn=e.target.closest?.('[data-motion]');if(!btn)return;
    $$('.nexa-v4485-motion-choice',ov).forEach(x=>x.disabled=true);
    await saveMotionMode(btn.dataset.motion);ov.remove();after?.();
  });
}

function ensureCompanionDrones(){
  const authOpen=!!$('#nexa-auth-gate:not(.hidden)');
  const firstRun=!!$('#nexa-v4485-motion,#nexa-v4484-onboarding,#nexa-v4484-fleet,#nexa-v4484-wormhole');
  const profileOpen=$('#nexa-profile-modal')?.classList.contains('open');
  const accountsOpen=$('#accounts-modal')?.classList.contains('open');
  let home=$('#nexa-v4485-home-drone');
  if(!home){
    home=document.createElement('button');home.id='nexa-v4485-home-drone';home.className='nexa-v4485-companion';home.type='button';home.setAttribute('aria-label','NEXA Drone help');home.innerHTML=droneMarkup();
    const bubble=document.createElement('div');bubble.id='nexa-v4485-home-bubble';bubble.className='nexa-v4485-companion-bubble';bubble.textContent='Hi! I’m NEXA. Tap My Profile to open your NEXA Fleet. Double-tap me anytime for quick help.';
    document.body.append(home,bubble);bindDroneGesture(home,bubble,'home');
  }
  bindDroneGesture(home,$('#nexa-v4485-home-bubble'),'home');
  home.classList.toggle('accounts-context',accountsOpen);
  home.style.display=(!authOpen&&!firstRun&&!profileOpen&&location.pathname.match(/(?:\/|index\.html)$/))?'grid':'none';
  if(home.style.display==='none')$('#nexa-v4485-home-bubble')?.classList.remove('open');

  let pd=$('#nexa-v4485-profile-drone');
  if(!pd){
    pd=document.createElement('button');pd.id='nexa-v4485-profile-drone';pd.className='nexa-v4485-companion';pd.type='button';pd.setAttribute('aria-label','NEXA Drone profile help');pd.innerHTML=droneMarkup();
    const bubble=document.createElement('div');bubble.id='nexa-v4485-profile-bubble';bubble.className='nexa-v4485-companion-bubble';bubble.textContent='Need help with your Profile? Your Heroes, Experts, Pets, Chief Gear, Charms and account stats all stay attached to this Game Account.';
    document.body.append(pd,bubble);bindDroneGesture(pd,bubble,'profile');
  }
  bindDroneGesture(pd,$('#nexa-v4485-profile-bubble'),'profile');
  pd.style.display=profileOpen?'grid':'none';
  if(!profileOpen)$('#nexa-v4485-profile-bubble')?.classList.remove('open');
}


function showReturningWelcome(){
  if($('#nexa-v450-returning')||$('#nexa-v4484-onboarding')||$('#nexa-v4485-motion'))return;
  const flag=sessionStorage.getItem('nexa_show_returning_welcome');
  if(flag!=='1')return;
  sessionStorage.removeItem('nexa_show_returning_welcome');
  const ov=document.createElement('section');ov.id='nexa-v450-returning';
  ov.innerHTML=`<div class="nexa-v450-nebula"></div><div class="nexa-v4484-stars"></div>
    <div class="nexa-v450-return-card">
      <div class="nexa-v450-logo-ring"><img src="/nexa-icon.png" alt="NEXA"></div>
      <h1>NEXA</h1>
      <div class="nexa-v450-systemline">CONNECT // MANAGE // EXPLORE</div>
      ${droneMarkup('intro')}
      <div class="nexa-v4484-dialog" style="width:min(320px,84vw)"><small>NEXA</small><p>Hi, I’m NEXA. Welcome back. Connecting your Profile, States, and NEXA systems…</p></div>
      <div class="nexa-v450-sync"><i></i></div>
      <div class="nexa-v450-tagline">YOUR UNIVERSE // YOUR CONTROL</div>
    </div>`;
  document.body.appendChild(ov);
  const delay=document.documentElement.classList.contains('nexa-reduced-motion')?520:1650;
  setTimeout(()=>ov.remove(),delay);
}

const HELP_ITEMS=[
 ['profile','How do I set up my Profile?','Open Edit My Profile and enter the information for this Game Account, including Furnace or Fire Crystal level, Power and Deployment. Your progression choices should follow the account data you save.'],
 ['accounts','How do my Game Accounts work?','Each Game Account keeps its own Profile data. My Profile opens NEXA Fleet, then you choose a State and the Account Constellation for that State.'],
 ['states','How do States work in NEXA?','Your accounts are grouped by State. State-specific events, alliances, schedules and tools stay separated so one server does not overwrite another.'],
 ['events','How do Events work?','Events belong to the active State hub. Open the event area to see schedules, instructions, forms and any actions available to your account.'],
 ['forms','How do Forms work?','Forms collect the information requested by State leadership. Complete the requested fields and submit them; your saved Profile can be used to reduce repeated entry.'],
 ['alliance','How do Alliances work?','Choose the alliance for the correct State when alliance selection is available. New selections can appear as Pending until leadership approves them.'],
 ['library','Heroes, Experts, Pets & Gear?','These Profile sections track the progression of this Game Account. Saved levels and equipment remain attached only to the selected account.'],
 ['locked','Why are some options locked?','Some options depend on Furnace or Fire Crystal progression, generation, State configuration, or your NEXA permissions.'],
 ['switch','How do I change account or State?','Open My Profile → NEXA Fleet → choose a State → choose the Game Account you want to access.'],
 ['bug','Something is not working.','Use Report a Bug so NEXA can capture the page, device information and any screenshots you choose to attach.']
];

function openDroneHelp(context='home'){
  $('.nexa-v450-help-overlay')?.remove();
  const ov=document.createElement('div');ov.className='nexa-v450-help-overlay';
  ov.innerHTML=`<section class="nexa-v450-help-card">
    <div class="nexa-v450-help-head">${droneMarkup()}<div><small>NEXA // QUICK HELP</small><h3>What do you need help with?</h3><p>${context==='profile'?'You’re viewing a Game Account Profile. Choose a quick question below.':'Choose a quick question and I’ll guide you.'}</p></div><button class="nexa-v450-help-close" type="button">×</button></div>
    <div class="nexa-v450-help-list">${HELP_ITEMS.map(([k,q])=>`<button type="button" class="nexa-v450-help-q" data-help-key="${k}">${q}<span>→</span></button>`).join('')}</div>
    <div class="nexa-v450-help-answer" data-help-answer style="display:none"></div>
  </section>`;
  document.body.appendChild(ov);
  $('.nexa-v450-help-close',ov).onclick=()=>ov.remove();
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
  ov.addEventListener('click',e=>{
    const q=e.target.closest?.('[data-help-key]');if(!q)return;
    const item=HELP_ITEMS.find(x=>x[0]===q.dataset.helpKey);if(!item)return;
    const ans=$('[data-help-answer]',ov);
    ans.style.display='block';
    ans.innerHTML=`<b>${esc(item[1])}</b><div style="margin-top:6px">${esc(item[2])}</div><button type="button" class="nexa-v450-help-back">↑ Back to questions</button>`;
    ans.scrollIntoView({block:'nearest',behavior:document.documentElement.classList.contains('nexa-reduced-motion')?'auto':'smooth'});
    $('.nexa-v450-help-back',ans).onclick=()=>{$('.nexa-v450-help-list',ov)?.scrollIntoView({block:'start',behavior:'smooth'})};
  });
}

function bindDroneGesture(btn,bubble,context){
  if(!btn||btn.dataset.v450Gesture==='1')return;
  btn.dataset.v450Gesture='1';
  let last=0,timer=0;
  btn.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const now=Date.now();
    if(now-last<360){
      clearTimeout(timer);last=0;bubble?.classList.remove('open');openDroneHelp(context);return;
    }
    last=now;
    timer=setTimeout(()=>{
      bubble.textContent=context==='profile'
        ? 'Need help with this Profile? Double-tap me and I’ll guide you.'
        : 'Need help? Double-tap me and I’ll guide you.';
      bubble?.classList.add('open');
      setTimeout(()=>bubble?.classList.remove('open'),5200);
    },220);
  };
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
    <div class="nexa-v4484-dialog"><small>NEXA</small><p data-onboard-text></p></div>
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
  const c=sb();if(!c){onboardingChecked=false;return}
  try{
    const {data:{user}}=await c.auth.getUser();
    if(!user){onboardingChecked=false;return}
    const done=Number(user.user_metadata?.nexa_onboarding_version||0)>=1;
    const saved=String(user.user_metadata?.nexa_motion_mode||'');
    if(done){applyMotionMode(saved==='reduced'?'reduced':(saved==='full'?'full':(devicePrefersReducedMotion()?'reduced':'full')));showReturningWelcome();return}
    if($('#nexa-auth-gate:not(.hidden)')){onboardingChecked=false;return}
    if(saved==='full'||saved==='reduced'){
      applyMotionMode(saved);showOnboarding();return;
    }
    showMotionChoice(()=>showOnboarding());
  }catch{onboardingChecked=false}
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


function syncHomeOnlyMenu(){
  const authOpen=!!$('#nexa-auth-gate:not(.hidden)');
  const away=authOpen
    || !!$('#nexa-v4484-fleet')
    || !!$('#nexa-v4484-wormhole')
    || !!$('#nexa-account-constellation.open')
    || !!$('#nexa-profile-modal.open')
    || !!$('#accounts-modal.open')
    || !!$('.nexa-v450-help-overlay');
  document.body.classList.toggle('nexa-v452-away-home',away);
  if(!away){
    document.body.classList.remove('nexa-v451-fleet-open','nexa-v451-constellation-open','nexa-v451-profile-open');
  }
}

function normalizeUnlimitedAccountUI(){
  const modal=$('#accounts-modal');
  if(modal){
    const count=Math.max(accountCache.length,Number(String($('#account-count')?.textContent||'').match(/\d+/)?.[0]||0));
    $$('*',modal).forEach(el=>{
      if(el.children.length)return;
      const t=String(el.textContent||'').trim();
      if(/^\d+\s*\/\s*5$/i.test(t))el.textContent=`${count||''} ACCOUNT${count===1?'':'S'}`.trim();
      if(/^WOS Accounts\s+\d+\s*\/\s*5$/i.test(t))el.textContent=`WOS Accounts ${count||''} ACCOUNT${count===1?'':'S'}`.trim();
    });
  }
  const launcher=$('#nexa-profile-launcher');
  if(launcher)$$('*',launcher).forEach(el=>{
    if(el.children.length)return;
    if(/^\d+\s*\/\s*5$/.test(String(el.textContent||'').trim()))el.style.display='none';
  });
}

function removeAllianceCodeRequirement(){
  const wrap=$('#v26-alliance-code-wrap');
  const input=$('#v26-alliance-code');
  if(wrap){wrap.hidden=true;wrap.style.display='none'}
  if(input)input.value='NEXA_PENDING';
  const select=$('#v26-edit-alliance');
  const block=$('#v26-profile-alliance-block');
  if(select&&block&&!$('#nexa-v452-alliance-note',block)){
    const note=document.createElement('div');
    note.id='nexa-v452-alliance-note';
    note.className='nexa-v25-muted';
    note.textContent='No access code required. Selecting a new alliance submits this Game Account as a Pending Member for leadership approval.';
    select.closest('label')?.insertAdjacentElement('afterend',note);
  }
}

function apply(){
  installCSS();
  installAccountManagerUI();
  installAuthAdjustments();
  cleanMojibake();
  normalizeUnlimitedAccountUI();
  removeAllianceCodeRequirement();
  syncHomeOnlyMenu();
  repairAccountLabels();
  if($('#accounts-modal')?.classList.contains('open'))refreshAccountManager();
  deployment();
  experts();
  chiefGearStars();
  syncPendingState();
  ensureFleetReturnButton();
  loadMotionMode();
  ensureCompanionDrones();
  cleanLegacyHomeAccountLimit();
  maybeShowOnboarding();
}
window.NEXADrone={openFleet,showOnboarding,showMotionChoice,openHelp:openDroneHelp,openAccount:openSelectedProfile};

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
    returnToFleetWithJump();
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
    const p=$('#nexa-profile-modal');p?.classList.remove('open');p?.setAttribute('aria-hidden','true');document.body.classList.remove('nexa-v451-profile-open');
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
