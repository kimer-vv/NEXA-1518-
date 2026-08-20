/* NEXA Player Intelligence Galactic Library — v13.0 */
(()=>{
  'use strict';
  let accountId=window.NEXA_ACTIVE_ACCOUNT_ID||null;
  let activeTab='heroes';
  let profileWasOpen=false;
  let openItemId=null;
  let savedScroll=0;
  const colors=['#9b63ff','#31d8ff','#ff4fc8','#3d7bff','#45e59a','#ffb34c','#ef5d69','#51e1d5'];
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const types={heroes:'hero',experts:'expert',pets:'pet',gear:'chief_gear',charms:'chief_charm'};
  const petData={
    'Cave Hyena':{rarity:'Common',max:50,skill:'Builder’s Aide',icon:'🏗️',effect:'Construction Speed',values:[5,7,9,12,15],unit:'%',duration:'5 minutes',cooldown:'23 hours'},
    'Arctic Wolf':{rarity:'N',max:60,skill:'Arctic Embrace',icon:'❄️',effect:'Chief Stamina recovered',values:[10,20,30,40,50,60],unit:'',cooldown:'23 hours'},
    'Musk Ox':{rarity:'N',max:60,skill:'Burden Bearer',icon:'🦬',effect:'Finishes one resource-gathering march instantly',values:['Active','Active','Active','Active','Active','Active'],unit:'',cooldown:'23 hours'},
    'Titan Roc':{rarity:'R',max:70,skill:'Razorbeak',icon:'🦅',effect:'Enemy Troops Health Down',values:[2,2.5,3,3.5,4,4.5,5],unit:'%',duration:'2 hours',cooldown:'20 hours'},
    'Giant Tapir':{rarity:'R',max:70,skill:'Natural Intuition',icon:'🍖',effect:'Pet Food received',values:[100,150,200,250,300,400,500],unit:'',cooldown:'23 hours'},
    'Giant Elk':{rarity:'SR',max:80,skill:'Mystical Finding',icon:'🦌',effect:'Brings back a wilderness reward',values:['Lv. 1 reward','Lv. 2 reward','Lv. 3 reward','Lv. 4 reward','Lv. 5 reward','Lv. 6 reward','Lv. 7 reward','Lv. 8 reward'],unit:'',cooldown:'23 hours'},
    'Snow Leopard':{rarity:'SR',max:80,skill:'Lightning Raid',icon:'⚡',effect:'March Speed Up / Enemy Lethality Down',values:['15% / 2%','17% / 2.5%','19% / 3%','21% / 3.5%','23% / 4%','25% / 4.5%','28% / 5%','30% / 5%'],unit:'',duration:'2 hours',cooldown:'20 hours'},
    'Cave Lion':{rarity:'SSR',max:100,skill:'Feral Anthem',icon:'🦁',effect:'Troops Attack Up',values:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'%',duration:'2 hours',cooldown:'20 hours'},
    'Snow Ape':{rarity:'SSR',max:100,skill:'Tumbling Power',icon:'🦍',effect:'Squad Deployment Capacity Up',values:[1500,3000,4500,6000,7500,9000,10500,12000,13500,15000],unit:'',duration:'2 hours',cooldown:'20 hours'},
    'Iron Rhino':{rarity:'SSR',max:100,skill:'Rallying Beasts',icon:'🦏',effect:'Rally Capacity Up',values:[60000,70000,80000,90000,100000,110000,120000,130000,140000,150000],unit:'',duration:'2 hours',cooldown:'20 hours'},
    'Saber-tooth Tiger':{rarity:'SSR',max:100,skill:'Apex Assault',icon:'🐯',effect:'Troops Lethality Up',values:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'%',duration:'2 hours',cooldown:'20 hours'},
    'Mammoth':{rarity:'SSR',max:100,skill:'Hardened Skin',icon:'🐘',effect:'Troops Defense Up',values:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'%',duration:'2 hours',cooldown:'20 hours'},
    'Frost Gorilla':{rarity:'SSR',max:100,skill:'Earthbound Vigor',icon:'🧊',effect:'Troops Health Up',values:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'%',duration:'2 hours',cooldown:'20 hours'},
    'Frostscale Chameleon':{rarity:'SSR',max:100,skill:'Icy Shroud',icon:'🦎',effect:'Enemy Troops Defense Down',values:[2.5,3,3.5,4,5,6,7,8,9,10],unit:'%',duration:'2 hours',cooldown:'20 hours'}
  };
  const relationshipNames=['STRANGER','ACQUAINTANCE I','ACQUAINTANCE II','ACQUAINTANCE III','CASUAL I','CASUAL II','CASUAL III','CLOSE I','CLOSE II','CLOSE III','INTIMATE'];
  const relationship=l=>({name:relationshipNames[Math.min(10,Math.floor(Number(l||0)/10))],talent:Math.min(11,1+Math.floor(Number(l||0)/10))});
  const charmBase=[0,9,12,16,19,25,30,35,40,45,50,55,64,73,82,91,100,109,118];
  const charmSteps=l=>l>=18?0:l>=16?9:l>=11?5:l>=4?4:1;
  function charmStat(level,stage){level=Math.max(0,Math.min(18,Number(level||0)));if(!level)return 0;const max=charmSteps(level),next=charmBase[Math.min(18,level+1)],base=charmBase[level];return cleanNumber(base+(next-base)*(max?Math.min(max,Number(stage||0))/max:0));}
  function charmTroop(item){const s=String(item?.troop_type||item?.metadata?.benefits||item?.name||'').toLowerCase();return s.includes('lancer')||s.includes('watch')||s.includes('helmet')?'lancer':s.includes('marksman')||s.includes('belt')||s.includes('shortstaff')?'marksman':'infantry';}
  function charmImage(item,level){level=Math.max(1,Math.min(18,Number(level||1)));return `assets/charms/lv${String(level).padStart(2,'0')}-${charmTroop(item)}.png`;}
  const gearStats={
    Green:[[9.35,0],[12.75,0]],Blue:[[17,0],[21.25,0],[25.5,0],[29.75,0]],Purple:[[34,0],[36.89,0],[39.78,0],[42.67,0]],
    Gold:[[56.78,0],[59.33,0],[61.88,0],[64.43,0]],Red:[[89.25,40],[93.5,80],[97.75,120],[102,160]]
  };
  function gearStat(tier,t,star,stage){const base=gearStats[tier]||gearStats.Green;star=Math.min(base.length-1,Number(star||0));let stat=base[star][0],cap=base[star][1];if(tier==='Purple'&&Number(t)>0)stat+=11.56;if(tier==='Gold')stat+=Math.min(2,Number(t||0))*10.2;if(tier==='Red'){const tt=Math.min(6,Number(t||0));stat+=tt*25.5;cap+=tt*250;if(tt>=4){stat+=(tt-3)*8.5;cap+=(tt-3)*40;}if(tt===6&&star===3){stat=255;cap=1780;}}return {stat:cleanNumber(stat),cap:Math.round(cap),stage:Number(stage||0)};}

  let libraryClient=null;
  function client(){
    if(window.supabaseClient) return window.supabaseClient;
    if(!libraryClient && window.supabase?.createClient){
      libraryClient=window.supabase.createClient(
        'https://dfxcxboxrkfmrnsgpyin.supabase.co',
        'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-'
      );
    }
    return libraryClient;
  }
  function addStyles(){
    if($('nexa-library-profile-style')) return;
    const s=document.createElement('style'); s.id='nexa-library-profile-style';
    s.textContent=`
      #nexa-profile-modal .nexa-profile-sheet{background:radial-gradient(circle at 82% 8%,rgba(30,137,255,.18),transparent 28%),radial-gradient(circle at 12% 15%,rgba(123,71,255,.22),transparent 30%),linear-gradient(160deg,#080d25,#020611 72%);border-color:rgba(124,104,255,.55);box-shadow:0 0 80px rgba(47,92,255,.18),0 34px 100px #000}
      #nexa-profile-modal .nexa-profile-sheet:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.38;background-image:radial-gradient(circle,#9fc9ff 0 1px,transparent 1.5px),radial-gradient(circle,#945cff 0 1px,transparent 1.5px);background-size:43px 43px,71px 71px;background-position:7px 11px,18px 25px}
      #nexa-profile-modal .nexa-profile-hero{background:radial-gradient(circle at 18% 18%,rgba(126,72,255,.32),transparent 30%),radial-gradient(circle at 82% 12%,rgba(24,155,255,.22),transparent 27%),linear-gradient(135deg,rgba(16,18,58,.98),rgba(5,17,40,.96))}
      #nexa-profile-modal .nexa-profile-hero:before{content:'';position:absolute;inset:0;opacity:.18;background:repeating-linear-gradient(135deg,transparent 0 23px,rgba(95,159,255,.17) 24px,transparent 25px)}
      #nexa-profile-modal .nexa-profile-photo{box-shadow:0 0 0 5px rgba(113,75,255,.12),0 0 30px rgba(119,75,255,.58)}
      #nexa-profile-modal .nexa-stat{position:relative;overflow:hidden;padding-right:48px!important;background:linear-gradient(145deg,rgba(9,15,42,.86),rgba(5,11,28,.9));box-shadow:inset 0 0 18px rgba(74,109,255,.06)}
      #nexa-profile-modal .nexa-stat:after{position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:25px;filter:drop-shadow(0 0 8px currentColor);opacity:.8}
      #nexa-profile-modal .nexa-stat.furnace:after{content:'◉';color:#79c9ff}#nexa-profile-modal .nexa-stat.power:after{content:'ϟ';color:#b388ff}#nexa-profile-modal .nexa-stat.deployment:after{content:'◎';color:#55dcff}
      .nexa-profile-tabs{display:flex!important;overflow-x:auto;grid-template-columns:none!important;scrollbar-width:none}.nexa-profile-tab{flex:0 0 auto;min-width:82px}
      .nexa-lib-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:24px 12px}.nexa-lib-filterbar{display:flex;gap:8px;overflow-x:auto;margin-bottom:20px;padding:4px 2px 8px;scrollbar-width:none}.nexa-lib-filter{--glow:#8d63ff;flex:0 0 auto;border:1px solid color-mix(in srgb,var(--glow) 68%,transparent);border-radius:999px;padding:9px 15px;background:color-mix(in srgb,var(--glow) 10%,#071026);color:color-mix(in srgb,var(--glow) 55%,white);font-weight:950;box-shadow:0 0 16px color-mix(in srgb,var(--glow) 16%,transparent)}.nexa-lib-filter.active{color:#fff;background:linear-gradient(135deg,color-mix(in srgb,var(--glow) 70%,#391b87),color-mix(in srgb,var(--glow) 48%,#0676b7));box-shadow:0 0 22px color-mix(in srgb,var(--glow) 42%,transparent)}
      .nexa-lib-card{--planet:#8d63ff;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;text-align:center;cursor:pointer;min-width:0}.nexa-lib-head{display:flex!important;flex-direction:column;gap:7px!important}.nexa-lib-avatar-wrap{position:relative;width:92px!important;height:92px!important;border-radius:50%!important;margin:auto;overflow:visible!important;border:2px solid var(--planet)!important;background:radial-gradient(circle at 35% 28%,color-mix(in srgb,var(--planet) 34%,#132142),#071027 70%)!important;box-shadow:0 0 0 5px color-mix(in srgb,var(--planet) 9%,transparent),0 0 24px color-mix(in srgb,var(--planet) 48%,transparent),inset 0 0 20px color-mix(in srgb,var(--planet) 18%,transparent)}
      .nexa-lib-avatar-wrap:before,.nexa-lib-avatar-wrap:after{content:'';position:absolute;pointer-events:none;border:1px solid color-mix(in srgb,var(--planet) 46%,transparent);border-radius:50%;inset:-9px 5px;transform:rotate(-18deg)}.nexa-lib-avatar-wrap:after{inset:7px -10px;transform:rotate(43deg);border-style:dotted;animation:nexaOrbit 12s linear infinite}@keyframes nexaOrbit{to{transform:rotate(403deg)}}
      .nexa-lib-avatar{position:relative;z-index:1;width:100%;height:100%;border-radius:50%;object-fit:cover;background:#101b3b}.nexa-lib-avatar.hero{transform:none!important;object-position:50% 38%}.nexa-lib-fallback{color:#ccbfff;font-weight:950;font-size:18px}.nexa-lib-head h4{font-size:13px;margin:1px 0 0!important;color:white!important}.nexa-lib-head small{font-size:8px;color:#8592b7!important}.nexa-lib-owned,.nexa-lib-fields,.nexa-lib-save,.nexa-lib-status,.nexa-config-close{display:none!important}
      .nexa-lib-head{display:grid;grid-template-columns:58px 1fr auto;gap:10px;align-items:center}.nexa-lib-avatar-wrap{display:grid;place-items:center}.nexa-lib-avatar{width:100%;height:100%;object-fit:cover;background:transparent}.nexa-lib-avatar.hero{transform:none!important;object-fit:cover!important;object-position:50% 38%!important;clip-path:circle(49% at 50% 50%)!important;padding:0!important;border-radius:50%!important}.nexa-lib-fallback{color:#ccbfff;font-weight:950;font-size:18px}.nexa-lib-head h4{margin:0;color:#fff}.nexa-lib-head small{display:block;color:#8290b8;margin-top:3px}.nexa-lib-owned{display:flex;align-items:center;gap:5px;color:#81ddff;font-size:11px;font-weight:900}.nexa-lib-owned input{width:20px;height:20px}
      .nexa-lib-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.nexa-lib-fields label{font-size:9px;letter-spacing:.08em;color:#8491b8;font-weight:900}.nexa-lib-fields input,.nexa-lib-fields select{width:100%;margin-top:5px;padding:9px;border-radius:10px;border:1px solid rgba(132,146,211,.24);background:#09122b;color:#edf3ff}.nexa-lib-save{width:100%;margin-top:10px;border:0;border-radius:11px;padding:10px;background:linear-gradient(135deg,#754bff,#168fdc);color:white;font-weight:950}.nexa-lib-status{text-align:center;min-height:15px;color:#71dcff;font-size:10px;margin-top:5px}.nexa-lib-loading{text-align:center;color:#8390b8;padding:30px}
      .nexa-lib-card.open{position:fixed!important;z-index:2147483000;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(620px,calc(100% - 20px));max-height:min(82dvh,760px);overflow:auto;margin:0;padding:18px!important;border:1px solid var(--planet)!important;border-radius:26px!important;background:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--planet) 17%,transparent),transparent 28%),linear-gradient(155deg,#111737,#030714 72%)!important;box-shadow:0 0 70px color-mix(in srgb,var(--planet) 28%,transparent),0 25px 90px #000!important;text-align:left;overscroll-behavior:contain}.nexa-lib-card.open .nexa-lib-head{display:grid!important;grid-template-columns:88px 1fr auto!important;align-items:center;padding:32px 42px 8px 0}.nexa-lib-card.open .nexa-lib-owned{display:flex!important}.nexa-lib-card.open .nexa-lib-fields{display:grid!important}.nexa-lib-card.open .nexa-lib-save{display:block!important}.nexa-lib-card.open .nexa-lib-status{display:block!important}.nexa-lib-card.open .nexa-lib-avatar-wrap{margin:0}.nexa-lib-card.open:before{content:'PROFILE CONFIGURATION';position:absolute;top:15px;left:18px;color:#77dcff;font-size:9px;font-weight:950;letter-spacing:.18em}.nexa-lib-card.open .nexa-config-close{display:grid!important;position:absolute;right:13px;top:10px;z-index:5;width:38px;height:38px;border-radius:50%;place-items:center;background:#0c1530;border:1px solid #59678f;color:#fff;font-size:24px}.nexa-lib-card.open .nexa-lib-avatar-wrap{width:82px!important;height:82px!important}.nexa-lib-card.open .nexa-lib-head h4{font-size:22px}.nexa-lib-card.open .nexa-lib-head small{font-size:10px}
      .nexa-lib-fields{grid-template-columns:1fr!important;gap:13px!important}.nexa-control{border:1px solid rgba(111,139,220,.2);border-radius:16px;padding:12px;background:rgba(4,10,27,.72)}.nexa-control-title{display:flex;justify-content:space-between;align-items:center;color:#8e9bc1;font-size:9px;font-weight:950;letter-spacing:.13em;margin-bottom:10px}.nexa-control-title b{color:#79dcff;font-size:12px}.nexa-choice-row{display:flex;gap:6px;flex-wrap:wrap}.nexa-choice{min-width:34px;height:34px;padding:0 10px;border:1px solid rgba(119,136,205,.25);border-radius:10px;background:#08132e;color:#9ba8cc;font-weight:900}.nexa-choice.active{color:white;border-color:var(--planet);background:color-mix(in srgb,var(--planet) 28%,#08132e);box-shadow:0 0 14px color-mix(in srgb,var(--planet) 25%,transparent)}.nexa-stars{position:relative!important;display:grid!important;grid-template-columns:repeat(5,42px)!important;justify-content:center!important;align-items:center!important;gap:8px!important;min-height:48px!important;overflow:visible!important}.nexa-star{all:unset!important;position:relative!important;inset:auto!important;transform:none!important;display:grid!important;place-items:center!important;width:42px!important;height:42px!important;box-sizing:border-box!important;cursor:pointer!important;color:#536186!important;font-family:Arial,sans-serif!important;font-size:36px!important;line-height:1!important;text-align:center!important;opacity:1!important;visibility:visible!important;-webkit-appearance:none!important;appearance:none!important;filter:drop-shadow(0 0 3px rgba(119,142,209,.35))!important}.nexa-star.active{color:#ffc64c!important;-webkit-text-fill-color:#ffc64c!important;filter:drop-shadow(0 0 8px #ff9d30)!important}.nexa-star:focus-visible{outline:2px solid #79dcff!important;outline-offset:2px!important;border-radius:8px!important}#nexa-buff-toast{position:fixed;z-index:2147483647;left:50%;bottom:max(26px,env(safe-area-inset-bottom));width:min(390px,calc(100% - 28px));transform:translate(-50%,24px) scale(.96);opacity:0;pointer-events:none;padding:13px 15px;border:1px solid rgba(125,220,255,.55);border-radius:15px;background:linear-gradient(145deg,rgba(16,24,58,.98),rgba(3,8,24,.98));box-shadow:0 0 28px rgba(82,126,255,.34),0 16px 45px rgba(0,0,0,.55);transition:opacity .2s ease,transform .2s ease;color:#dff7ff;text-align:left}#nexa-buff-toast.show{opacity:1;transform:translate(-50%,0) scale(1)}#nexa-buff-toast strong{display:block;color:#7fe4ff;font-size:11px;letter-spacing:.08em;margin-bottom:5px}#nexa-buff-toast span{display:block;font-size:10px;line-height:1.45;font-weight:750}.nexa-buff-readout{margin:8px 0 11px;padding:9px 10px;border:1px solid color-mix(in srgb,var(--planet) 38%,transparent);border-radius:10px;background:color-mix(in srgb,var(--planet) 9%,#071129);color:#cfeeff;font-size:9px;line-height:1.4;font-weight:800;min-height:38px;display:flex;align-items:center}.nexa-widget-buff{color:#8ee8ff;font-size:10px;justify-content:center;text-align:center}.nexa-skill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.nexa-skill{display:grid;grid-template-columns:45px minmax(0,1fr);gap:9px;align-items:start;border:1px solid rgba(104,132,213,.2);border-radius:14px;padding:9px;background:#071129}.nexa-skill>div{min-width:0}.nexa-skill-icon{width:45px;height:45px;border-radius:50%;display:grid;place-items:center;font-size:21px;background:radial-gradient(circle,var(--planet),#101a3c 72%);box-shadow:0 0 16px color-mix(in srgb,var(--planet) 34%,transparent);overflow:hidden}.nexa-skill-icon img{width:100%;height:100%;object-fit:cover}.nexa-skill strong{display:block;color:#eef4ff;font-size:10px;line-height:1.3;min-height:26px}.nexa-skill small{display:block;color:#93a2ca;font-size:8px;line-height:1.45;margin:4px 0;overflow-wrap:anywhere}.nexa-progress{display:flex;gap:5px;margin-top:10px}.nexa-segment{flex:1;height:10px;border:1px solid color-mix(in srgb,var(--planet) 45%,transparent);border-radius:99px;background:#09142d}.nexa-segment.active{background:var(--planet);box-shadow:0 0 8px var(--planet)}.nexa-lib-save{border:1px solid rgba(116,224,255,.4)!important;border-radius:14px!important;padding:13px!important;background:linear-gradient(100deg,#7548ff,#168fe1)!important;box-shadow:0 0 22px rgba(55,112,255,.25);font-size:13px}.nexa-role-row{display:flex;gap:7px;margin-bottom:8px}.nexa-role{border:1px solid rgba(126,145,215,.24);border-radius:999px;padding:6px 10px;color:#8391b8;font-size:9px}.nexa-role.active{color:#fff;border-color:var(--planet);background:color-mix(in srgb,var(--planet) 22%,#071129)}.nexa-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px}.nexa-summary div{border:1px solid color-mix(in srgb,var(--planet) 32%,transparent);border-radius:12px;padding:10px;background:color-mix(in srgb,var(--planet) 8%,#071129)}.nexa-summary span{display:block;color:#7fe4ff;font-size:8px;font-weight:950;letter-spacing:.11em}.nexa-summary b{display:block;color:#fff;font-size:11px;margin-top:5px}.nexa-pet-skill{grid-template-columns:58px minmax(0,1fr)}.nexa-pet-skill .nexa-skill-icon{width:58px;height:58px;font-size:28px}.nexa-gear-readout{font-size:10px;justify-content:center;text-align:center}
      @media(max-width:520px){.nexa-lib-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:21px 6px}.nexa-profile-content{padding:14px 10px!important}.nexa-lib-avatar-wrap{width:78px!important;height:78px!important}.nexa-lib-head h4{font-size:11px}.nexa-lib-card.open{max-height:76dvh;padding:16px!important}.nexa-lib-card.open .nexa-skill-grid{grid-template-columns:1fr}.nexa-summary{grid-template-columns:1fr 1fr}.nexa-profile-stats{gap:6px!important}.nexa-stat{padding:9px 38px 9px 9px!important}.nexa-stat:after{right:9px!important;font-size:20px!important}}
      .nexa-skill .nexa-buff-readout{align-items:flex-start;min-height:70px}.nexa-charm-icon{display:block;width:70px;height:70px;object-fit:contain;margin:2px auto 8px;filter:drop-shadow(0 0 10px color-mix(in srgb,var(--planet) 65%,transparent))}.nexa-card-charms{display:flex;justify-content:center;gap:1px;margin:0 0 2px}.nexa-card-charms img{width:20px;height:20px;object-fit:contain}
    `; document.head.appendChild(s);
  }

  function installTabs(){
    const bar=document.querySelector('.nexa-profile-tabs'); if(!bar) return;
    const mapping={heroes:'HEROES',experts:'EXPERTS',pets:'PETS'};
    Object.entries(mapping).forEach(([key,label])=>{
      const b=bar.querySelector(`[data-nexa-tab="${key}"]`); if(!b)return;
      b.dataset.libraryTab=key; b.textContent=label;
    });
    const troop=bar.querySelector('[data-nexa-tab="troops"]'); if(troop) troop.remove();
    [['gear','CHIEF GEAR'],['charms','CHARMS']].forEach(([key,label])=>{
      if(bar.querySelector(`[data-library-tab="${key}"]`))return;
      const b=document.createElement('button'); b.type='button'; b.className='nexa-profile-tab'; b.dataset.libraryTab=key; b.textContent=label; bar.appendChild(b);
    });
  }

  function installAdministrationLibrary(){
    const section=$('admin-library');
    if(!section || section.dataset.nexaLibraryInstalled==='1') return;
    section.dataset.nexaLibraryInstalled='1';
    section.innerHTML=`
      <div class="admin-section-head">
        <div>
          <h3>NEXA Library</h3>
          <p>Manage Heroes, Experts, Pets, Chief Gear and Charms from the shared catalog.</p>
        </div>
      </div>
      <div style="border:1px solid rgba(137,110,255,.28);border-radius:18px;overflow:hidden;background:#030611">
        <iframe id="nexa-library-admin-frame" src="library.html?v=2" title="NEXA Library" style="display:block;width:100%;height:1200px;border:0;background:#030611"></iframe>
      </div>`;
  }

  const buttons=(field,max,value,step=1)=>`<div class="nexa-choice-row" data-choice-field="${field}">${Array.from({length:Math.floor(max/step)+1},(_,i)=>i*step).map(n=>`<button type="button" class="nexa-choice ${Number(value)===n?'active':''}" data-choice="${n}">${n}</button>`).join('')}<input type="hidden" data-f="${field}" value="${esc(value??'')}"></div>`;
  const control=(title,value,body)=>`<section class="nexa-control"><div class="nexa-control-title"><span>${title}</span><b data-control-value>${value??'—'}</b></div>${body}</section>`;
  const skillIcon=(skill,i)=>skill?.image_url||skill?.icon_url||skill?.icon?`<img src="${esc(skill.image_url||skill.icon_url||skill.icon)}" alt="${esc(skill.name||'Skill')}">`:['⚔','⬡','◎','✦'][i%4];
  const cleanNumber=n=>Number.isInteger(n)?String(n):Number(n.toFixed(2)).toString();
  function skillBuff(skill,level){
    level=Number(level||0); if(!level)return 'Select a level to see its buff';
    const explicit=Array.isArray(skill?.values)?skill.values[level-1]:null;
    if(explicit!=null)return `${String(skill.effect||'Buff').replace(/:\s*$/,'')}: ${explicit}`;
    const text=String(skill?.description||'');
    const match=text.match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)%/);
    if(!match)return `${String(skill?.effect||'Buff').replace(/:\s*$/,'')}: Level ${level}`;
    const low=Number(match[1]),high=Number(match[2]),value=low+((high-low)*(level-1)/4);
    return text.replace(match[0],`${cleanNumber(value)}%`);
  }
  function widgetBuff(item,level){
    level=Number(level||0); if(!level)return 'Select a level to see its buffs';
    const special={Natalia:5.5,Jeronimo:6.25,Molly:5,Zinman:5};
    const byGeneration={2:6,3:7,4:9.25,5:11.1,6:13.35,7:16.05,8:19.3,9:23.2,10:27.85};
    const base=special[item.name]??byGeneration[Number(item.generation)];
    if(!base)return `Widget Level ${level}`;
    const total=cleanNumber(base*level),exploration=Math.ceil(level/2),expedition=Math.floor(level/2);
    return `Lethality +${total}% • Health +${total}% • Exclusive skills ${exploration}/${expedition}`;
  }
  function widgetSkills(metadata,level){
    const configured=metadata.exclusive_skills||metadata.widget_skills||metadata.exclusive_weapon_skills||[];
    const fallback=[{name:'EXCLUSIVE SKILL I',effect:'Exploration exclusive skill'},{name:'EXCLUSIVE SKILL II',effect:'Expedition exclusive skill'}];
    return fallback.map((base,i)=>{const skill=configured[i]||base,skillLevel=i===0?Math.ceil(Number(level||0)/2):Math.floor(Number(level||0)/2);return {skill,level:skillLevel,buff:skillBuff(skill,skillLevel)};});
  }
  function widgetPanel(item,metadata,level){
    const exclusive=widgetSkills(metadata,level);
    return control('WIDGET',level||0,`<div class="nexa-buff-readout nexa-widget-buff" data-widget-buff data-buff-title="WIDGET" data-buff-values="${esc(JSON.stringify(Array.from({length:11},(_,n)=>widgetBuff(item,n))))}">${esc(widgetBuff(item,level))}</div>${buttons('widget_level',10,level)}<div class="nexa-skill-grid" data-widget-skills>${exclusive.map((x,i)=>`<div class="nexa-skill"><span class="nexa-skill-icon">${skillIcon(x.skill,i+2)}</span><div><strong>${esc(x.skill.name)}</strong><small>${esc(x.skill.effect||x.skill.description||'Exclusive Widget skill')}</small><div class="nexa-buff-readout" data-widget-exclusive="${i}" data-widget-skill="${esc(JSON.stringify(x.skill))}">LEVEL ${x.level} • ${esc(x.buff)}</div></div></div>`).join('')}</div>`);
  }
  const gearColors={Green:'#45e56f',Blue:'#31baff',Purple:'#a45cff',Gold:'#ffb52f',Red:'#ff4f5f'};
  let buffToastTimer=null;
  function showBuffToast(title,level,message){
    let toast=$('nexa-buff-toast');
    if(!toast){toast=document.createElement('div');toast.id='nexa-buff-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);}
    toast.innerHTML=`<strong>${esc(title)} · LEVEL ${esc(level)}</strong><span>${esc(message)}</span>`;
    toast.classList.remove('show');requestAnimationFrame(()=>toast.classList.add('show'));
    clearTimeout(buffToastTimer);buffToastTimer=setTimeout(()=>toast.classList.remove('show'),2800);
  }
  function refreshGear(card){const read=card?.querySelector('[data-gear-readout]');if(!read)return;const get=f=>card.querySelector(`[data-f="${f}"]`)?.value||0,s=gearStat(get('tier')||'Green',get('t_level'),get('stars'),get('stage'));read.textContent=`ATTACK +${s.stat}% • DEFENSE +${s.stat}% • TROOP DEPLOYMENT +${s.cap}`;}
  function refreshCharm(card,i){const select=card.querySelector(`[data-charm-level="${i}"]`),level=Number(select?.value||0),max=charmSteps(level),stagesInput=card.querySelector('[data-f="charm_stages"]'),a=JSON.parse(stagesInput?.value||'[0,0,0]'),stage=Math.min(max,Number(a[i]||0));a[i]=stage;if(stagesInput)stagesInput.value=JSON.stringify(a);const box=card.querySelector(`[data-charm-segments="${i}"]`);if(box)box.innerHTML=Array.from({length:max},(_,n)=>n+1).map(n=>`<button type="button" class="nexa-segment ${stage>=n?'active':''}" data-charm-segment="${n}"></button>`).join('');card.querySelector(`[data-charm-title="${i}"]`)?.replaceChildren(`LV ${level}${max?` · ${stage}/${max}`:''}`);card.querySelector(`[data-charm-readout="${i}"]`)?.replaceChildren(`LETHALITY +${charmStat(level,stage)}% • HEALTH +${charmStat(level,stage)}%`);const img=card.querySelector(`[data-charm-image="${i}"]`);if(img)img.src=charmImage({name:card.querySelector('h4')?.textContent||''},level||1);}
  function fields(item,row){
    const p=row?.progress||{},m=item.metadata||{};
    if(item.item_type==='hero'){
      const skills=m.expedition_skills||m.skills||[{name:'Expedition I'},{name:'Expedition II'},{name:'Expedition III'}];
      const level=Number(p.level||0),stars=Number(p.stars||0),widget=Number(p.widget_level||0),hasWidget=String(item.rarity||'').toLowerCase()==='legendary';
      return `${control('HERO LEVEL',level||'—',`<div class="nexa-choice-row"><button type="button" class="nexa-choice ${level===80?'active':''}" data-set-max="level" data-max="80">MAXED</button><select data-f="level" class="nexa-choice" aria-label="Hero level">${Array.from({length:80},(_,i)=>`<option value="${i+1}" ${level===i+1?'selected':''}>${i+1}</option>`).join('')}</select></div>`)}${control('STARS',stars||0,`<div class="nexa-stars" data-stars>${[1,2,3,4,5].map(n=>`<button type="button" class="nexa-star ${stars>=n?'active':''}" data-star="${n}">★</button>`).join('')}<input type="hidden" data-f="stars" value="${stars}"></div>`)}<section class="nexa-control"><div class="nexa-control-title"><span>EXPEDITION SKILLS</span><b>MAX LEVEL 5</b></div><div class="nexa-role-row"><span class="nexa-role">JOINER</span><span class="nexa-role active">RALLY LEADER</span></div><div class="nexa-skill-grid">${skills.slice(0,4).map((s,i)=>{const selected=(p.skills||[])[i]||0,buffs=Array.from({length:6},(_,n)=>skillBuff(s,n));return `<div class="nexa-skill"><span class="nexa-skill-icon">${skillIcon(s,i)}</span><div><strong>${esc(s.name||`Skill ${i+1}`)}</strong><small>${esc(s.effect||'Expedition skill')}</small><div class="nexa-buff-readout" data-skill-buff data-buff-title="${esc(s.name||`Skill ${i+1}`)}" data-buff-values="${esc(JSON.stringify(buffs))}">${esc(buffs[selected])}</div>${buttons('skill_'+i,5,selected)}</div></div>`}).join('')}</div></section>${hasWidget?widgetPanel(item,m,widget):''}`;
    }
    if(item.item_type==='expert'){
      const skills=m.skills||[],level=Number(p.level||0);
      const rel=relationship(level),talent=m.talent||{},specialty=m.specialty||m.event_specialty||'Expert specialty';
      return `${control('AFFINITY / RELATIONSHIP',level,`<select data-f="level" data-expert-affinity class="nexa-choice">${Array.from({length:100},(_,i)=>i+1).map(n=>`<option value="${n}" ${level===n?'selected':''}>${n}${n===100?' • MAXED':''}</option>`).join('')}</select><div class="nexa-summary" data-expert-summary><div><span>STATUS</span><b>${esc(rel.name)}</b></div><div><span>TALENT LEVEL</span><b>${rel.talent}/11</b></div><div><span>SPECIALTY / EVENT</span><b>${esc(specialty)}</b></div><div><span>${esc(talent.name||'AUTO TALENT')}</span><b>${esc(talent.effect||talent.max_effect||'Upgrades every 10 Affinity levels')}</b></div></div>`)}<section class="nexa-control"><div class="nexa-control-title"><span>EXPERT SKILLS</span><b>INDIVIDUAL MAX</b></div><div class="nexa-skill-grid">${skills.map((s,i)=>{const max=Number(s.max_level)||20,val=Number((p.skills||[])[i]||0),buffs=Array.from({length:max+1},(_,n)=>n?`${s.effect||s.max_effect||'Expert skill'} · LEVEL ${n}/${max}`:'Select a level to see its buff');return `<div class="nexa-skill"><span class="nexa-skill-icon">${skillIcon(s,i)}</span><div><strong>${esc(s.name)}</strong><small>${esc(s.effect||s.max_effect||'Expert skill')}</small><div class="nexa-buff-readout" data-skill-buff data-buff-title="${esc(s.name)}" data-buff-values="${esc(JSON.stringify(buffs))}">${esc(buffs[val])}</div><select data-f="skill_${i}" data-expert-skill class="nexa-choice">${Array.from({length:max+1},(_,n)=>`<option value="${n}" ${val===n?'selected':''}>${n}${n===max?' • MAXED':''}</option>`).join('')}</select></div></div>`}).join('')}</div></section>`;
    }
    if(item.item_type==='pet'){
      const d=petData[item.name]||{max:100,skill:'Pet Skill',icon:'✦',effect:'Pet skill buff',values:Array.from({length:10},(_,i)=>`Level ${i+1}`)},level=Math.min(d.max,Number(p.level||0)),skillMax=d.values.length,selected=Math.min(skillMax,Number((p.skills||[])[0]||p.skill_level||0));
      const buffs=['Select a level to see its buff',...d.values.map((v,i)=>`${d.effect}: ${v}${typeof v==='number'?(d.unit||''):''}${d.duration?` • Duration ${d.duration}`:''}${d.cooldown?` • Cooldown ${d.cooldown}`:''}`)];
      return `${control('PET LEVEL',level||'—',`<select data-f="level" class="nexa-choice">${Array.from({length:d.max+1},(_,i)=>`<option value="${i}" ${level===i?'selected':''}>${i}${i===d.max?' • MAXED':''}</option>`).join('')}</select><small>Maximum ${d.max} for ${esc(d.rarity||item.rarity||'this pet')} rarity • Skill improves every 10 pet levels</small>`)}<section class="nexa-control"><div class="nexa-control-title"><span>PET SKILLS</span><b>${esc(d.skill)} · MAX ${skillMax}</b></div><div class="nexa-skill-grid"><div class="nexa-skill nexa-pet-skill"><span class="nexa-skill-icon" aria-label="${esc(d.skill)}">${d.icon}</span><div><strong>${esc(d.skill)}</strong><small>${esc(d.effect)}${d.duration?` • ${esc(d.duration)}`:''}${d.cooldown?` • Cooldown ${esc(d.cooldown)}`:''}</small><div class="nexa-buff-readout" data-skill-buff data-buff-title="${esc(d.skill)}" data-buff-values="${esc(JSON.stringify(buffs))}">${esc(buffs[selected])}</div>${buttons('skill_0',skillMax,selected)}</div></div></div></section>`;
    }
    if(item.item_type==='chief_gear'){
      const tier=p.tier||p.current_tier||'',star=Number(p.stars||0),stage=Number(p.stage||0);
      const gs=gearStat(tier||'Green',p.t_level||0,star,stage);
      return `<div class="nexa-buff-readout nexa-gear-readout" data-gear-readout>ATTACK +${gs.stat}% • DEFENSE +${gs.stat}% • TROOP DEPLOYMENT +${gs.cap}</div>${control('GEAR COLOR / TIER',tier||'Select',`<div class="nexa-choice-row">${Object.keys(gearColors).map(x=>`<button type="button" class="nexa-choice ${tier===x?'active':''}" data-text-choice="tier" data-gear-color="${gearColors[x]}" style="--planet:${gearColors[x]}">${x}</button>`).join('')}<input type="hidden" data-f="tier" value="${esc(tier)}"></div>`)}${control('T LEVEL',p.t_level||0,buttons('t_level',6,p.t_level||0))}${control('STARS',star,`<div class="nexa-choice-row" data-stars><button type="button" class="nexa-choice ${star===0?'active':''}" data-star="0">0</button><div class="nexa-stars">${[1,2,3].map(n=>`<button type="button" class="nexa-star ${star>=n?'active':''}" data-star="${n}">★</button>`).join('')}<input type="hidden" data-f="stars" value="${star}"></div></div>`)}${control('STAR PROGRESS',`${stage}/4`,`<div class="nexa-progress" data-segments>${[1,2,3,4].map(n=>`<button type="button" class="nexa-segment ${stage>=n?'active':''}" data-segment="${n}"></button>`).join('')}<input type="hidden" data-f="stage" value="${stage}"></div>`)}`;
    }
    const levels=p.charm_levels||[0,0,0],stages=p.charm_stages||[0,0,0];
    return `<div class="nexa-skill-grid">${[0,1,2].map(i=>{const lv=Number(levels[i]||0),max=charmSteps(lv),stage=Math.min(max,Number(stages[i]||0));return `<section class="nexa-control"><div class="nexa-control-title"><span>CHARM ${i+1}</span><b data-charm-title="${i}">LV ${lv}${max?` · ${stage}/${max}`:''}</b></div><img class="nexa-charm-icon" data-charm-image="${i}" src="${esc(charmImage(item,lv||1))}" alt="${esc(item.name)} charm level ${lv||1}"><div class="nexa-buff-readout" data-charm-readout="${i}">LETHALITY +${charmStat(lv,stage)}% • HEALTH +${charmStat(lv,stage)}%</div><select data-charm-level="${i}" class="nexa-choice">${Array.from({length:19},(_,n)=>`<option value="${n}" ${lv===n?'selected':''}>LEVEL ${n}</option>`).join('')}</select><div class="nexa-progress" data-charm-segments="${i}">${Array.from({length:max},(_,n)=>n+1).map(n=>`<button type="button" class="nexa-segment ${stage>=n?'active':''}" data-charm-segment="${n}"></button>`).join('')}</div></section>`}).join('')}</div><input type="hidden" data-f="charm_levels" value="${esc(JSON.stringify(levels))}"><input type="hidden" data-f="charm_stages" value="${esc(JSON.stringify(stages))}">`;
  }

  async function render(key){
    activeTab=key||activeTab;
    installTabs(); addStyles();
    const c=$('nexa-profile-content'); if(!c)return;
    document.querySelectorAll('.nexa-profile-tab').forEach(b=>b.classList.toggle('active',b.dataset.libraryTab===key));
    if(!accountId){ c.innerHTML='<div class="nexa-profile-empty"><b>Select an account</b>Open this profile again from its planet.</div>';return; }
    const sb=client(); if(!sb){c.innerHTML='<div class="nexa-profile-empty"><b>Library unavailable</b>Supabase connection was not found.</div>';return;}
    c.innerHTML='<div class="nexa-lib-loading">Loading NEXA Library…</div>';
    const type=types[key]||'hero';
    const [{data:items,error},{data:owned}]=await Promise.all([
      sb.from('nexa_library_items').select('*').eq('item_type',type).eq('is_active',true).eq('is_visible',true).order('generation').order('sort_order').order('name'),
      sb.from('player_library_inventory').select('*').eq('player_account_id',accountId)
    ]);
    if(error){c.innerHTML=`<div class="nexa-profile-empty"><b>Could not load Library</b>${esc(error.message)}</div>`;return;}
    const map=new Map((owned||[]).map(x=>[x.library_item_id,x]));
    if(!items?.length){c.innerHTML='<div class="nexa-profile-empty"><b>No visible entries</b>This category is ready; an administrator must show its catalog entries.</div>';return;}
    let filters=[];
    if(key==='heroes') filters=['epic',...Array.from(new Set(items.filter(x=>String(x.rarity).toLowerCase()==='legendary'&&x.generation!=null).map(x=>Number(x.generation)))).sort((a,b)=>a-b).map(x=>'gen-'+x)];
    if(key==='pets') filters=['Common','N','R','SR','SSR'];
    let chosen=(window.NEXA_LIBRARY_FILTERS||(window.NEXA_LIBRARY_FILTERS={}))[key]||filters[0]||'';
    if(filters.length&&!filters.includes(chosen))chosen=filters[0];
    const visible=key==='heroes'?(chosen==='epic'?items.filter(x=>String(x.rarity).toLowerCase()==='epic'):items.filter(x=>'gen-'+x.generation===chosen&&String(x.rarity).toLowerCase()==='legendary')):key==='pets'?items.filter(x=>String(x.rarity||'').toUpperCase()===String(chosen).toUpperCase()):items;
    const filterHtml=filters.length?`<div class="nexa-lib-filterbar">${filters.map(f=>`<button type="button" class="nexa-lib-filter ${f===chosen?'active':''}" data-library-filter="${esc(f)}">${esc(f==='epic'?'EPIC':f.startsWith('gen-')?'GEN '+f.slice(4):f)}</button>`).join('')}</div>`:'';
    c.innerHTML=`${filterHtml}<div class="nexa-lib-grid">${visible.map((item,index)=>{
      const row=map.get(item.id), initials=item.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
      const img=item.image_url?`<span class="nexa-lib-avatar-wrap"><img class="nexa-lib-avatar ${item.item_type==='hero'?'hero':''}" src="${esc(item.image_url)}" alt="${esc(item.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="nexa-lib-fallback" hidden>${esc(initials)}</span></span>`:`<span class="nexa-lib-avatar-wrap nexa-lib-fallback">${esc(initials)}</span>`;
      const charmLevels=row?.progress?.charm_levels||[0,0,0],charmBadges=item.item_type==='chief_charm'?`<span class="nexa-card-charms">${charmLevels.map(l=>`<img src="${esc(charmImage(item,l||1))}" alt="Charm level ${Number(l||0)}">`).join('')}</span>`:'';
      const meta=item.item_type==='expert'?'EXPERT':item.item_type==='pet'?(item.rarity||'PET'):[item.generation!=null?`GEN ${item.generation}`:'',item.troop_type||'',item.rarity||''].filter(Boolean).join(' • ');
      const group=item.item_type==='hero'?(item.rarity==='Epic'?0:Number(item.generation||1)):item.item_type==='pet'?['Common','N','R','SR','SSR'].indexOf(item.rarity)+1:index;
      const planet=item.item_type==='chief_gear'&&gearColors[row?.progress?.tier]?gearColors[row.progress.tier]:colors[Math.abs(group)%colors.length];
      return `<article class="nexa-lib-card ${openItemId===item.id?'open':''}" data-item="${item.id}" style="--planet:${planet}"><button class="nexa-config-close" type="button" aria-label="Close configuration">×</button>${`<div class="nexa-lib-head">${img}<div>${charmBadges}<h4>${esc(item.name)}</h4><small>${esc(meta)}</small></div><label class="nexa-lib-owned"><input data-owned type="checkbox" ${row?.owned?'checked':''}> OWNED</label></div>`}<div class="nexa-lib-fields">${fields(item,row)}</div><button type="button" class="nexa-lib-save">SAVE PROFILE</button><div class="nexa-lib-status"></div></article>`;
    }).join('')}</div>`;
    filters.forEach((f,i)=>{const b=c.querySelector(`[data-library-filter="${CSS.escape(f)}"]`);if(b)b.style.setProperty('--glow',colors[i%colors.length])});
  }

  async function save(card){
    const sb=client(); if(!sb||!accountId)return;
    const status=card.querySelector('.nexa-lib-status'); status.textContent='Saving…';
    const {data:{user}}=await sb.auth.getUser(); if(!user){status.textContent='Sign in required';return;}
    const charmSelectors=card.querySelectorAll('[data-charm-level]');if(charmSelectors.length){const a=Array.from(charmSelectors).map(x=>Number(x.value));const hidden=card.querySelector('[data-f="charm_levels"]');if(hidden)hidden.value=JSON.stringify(a);}
    const progress={}; card.querySelectorAll('[data-f]').forEach(x=>{if(x.value!==''){let v=x.value.trim();if(v[0]==='['){try{v=JSON.parse(v)}catch(_){}}else if(v!==''&&!Number.isNaN(Number(v)))v=Number(v);progress[x.dataset.f]=v;}});
    const expertSkills=[]; Object.keys(progress).filter(k=>k.startsWith('skill_')).forEach(k=>{expertSkills[Number(k.slice(6))]=progress[k];delete progress[k];}); if(expertSkills.length)progress.skills=expertSkills;
    if(progress.charm_1!==undefined||progress.charm_2!==undefined||progress.charm_3!==undefined){progress.charm_levels=[progress.charm_1||0,progress.charm_2||0,progress.charm_3||0];delete progress.charm_1;delete progress.charm_2;delete progress.charm_3;}
    const payload={user_id:user.id,player_account_id:accountId,library_item_id:card.dataset.item,owned:card.querySelector('[data-owned]').checked,progress,updated_at:new Date().toISOString()};
    const {error}=await sb.from('player_library_inventory').upsert(payload,{onConflict:'player_account_id,library_item_id'});
    status.textContent=error?error.message:'Saved ✓'; status.style.color=error?'#ff7d9c':'#71dcff';
  }

  function selectAccount(id){
    if(!id)return;
    accountId=String(id);
    window.NEXA_ACTIVE_ACCOUNT_ID=accountId;
    document.dispatchEvent(new CustomEvent('nexa:library-account-selected',{detail:{accountId}}));
  }

  document.addEventListener('nexa:profile-opened',e=>{
    selectAccount(e.detail?.accountId);
    setTimeout(()=>{installTabs();render(activeTab);},80);
  });

  document.addEventListener('click',e=>{
    const planet=e.target.closest('[data-account-constellation-id],[data-nexa-profile]');
    if(planet){
      selectAccount(planet.dataset.accountConstellationId||planet.dataset.nexaProfile);
      setTimeout(()=>{installTabs();render('heroes');},120);
    }
    if(e.target.closest('[data-open-full-profile]')) setTimeout(()=>{installTabs();render(activeTab);},160);
    const tab=e.target.closest('[data-library-tab]'); if(tab){e.preventDefault();e.stopImmediatePropagation();render(tab.dataset.libraryTab);}
    const filter=e.target.closest('[data-library-filter]'); if(filter){e.preventDefault();window.NEXA_LIBRARY_FILTERS||(window.NEXA_LIBRARY_FILTERS={});window.NEXA_LIBRARY_FILTERS[activeTab]=filter.dataset.libraryFilter;render(activeTab);return;}
    const close=e.target.closest('.nexa-config-close');if(close){e.preventDefault();e.stopImmediatePropagation();openItemId=null;close.closest('.nexa-lib-card').classList.remove('open');document.querySelector('.nexa-profile-sheet')?.scrollTo(0,savedScroll);return;}
    const choice=e.target.closest('[data-choice]');if(choice){
      e.preventDefault();const row=choice.closest('[data-choice-field]'),selected=Number(choice.dataset.choice);
      row.querySelectorAll('.nexa-choice').forEach(x=>x.classList.remove('active'));choice.classList.add('active');row.querySelector('[data-f]').value=choice.dataset.choice;
      row.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(choice.dataset.choice);
      const readout=row.parentElement?.querySelector('[data-skill-buff],[data-widget-buff]');
      if(readout?.dataset.buffValues){try{const message=JSON.parse(readout.dataset.buffValues)[selected]||'';readout.textContent=message;if(selected>0)showBuffToast(readout.dataset.buffTitle||'BUFF',selected,message);}catch(_){}}
      if(row.dataset.choiceField==='widget_level')row.closest('.nexa-control')?.querySelectorAll('[data-widget-exclusive]').forEach(x=>{try{const i=Number(x.dataset.widgetExclusive),skill=JSON.parse(x.dataset.widgetSkill||'{}'),level=i===0?Math.ceil(selected/2):Math.floor(selected/2);x.textContent=`LEVEL ${level} • ${skillBuff(skill,level)}`;}catch(_){}});refreshGear(choice.closest('.nexa-lib-card'));
      return;
    }
    const textChoice=e.target.closest('[data-text-choice]');if(textChoice){e.preventDefault();const field=textChoice.dataset.textChoice,box=textChoice.parentElement;box.querySelectorAll('.nexa-choice').forEach(x=>x.classList.remove('active'));textChoice.classList.add('active');box.querySelector(`[data-f="${field}"]`).value=textChoice.textContent.trim();box.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(textChoice.textContent.trim());if(textChoice.dataset.gearColor)textChoice.closest('.nexa-lib-card')?.style.setProperty('--planet',textChoice.dataset.gearColor);refreshGear(textChoice.closest('.nexa-lib-card'));return;}
    const star=e.target.closest('[data-star]');if(star){e.preventDefault();const box=star.closest('[data-stars]'),n=Number(star.dataset.star);box.querySelectorAll('[data-star]').forEach(x=>x.classList.toggle('active',Number(x.dataset.star)<=n));box.querySelector('[data-f="stars"]').value=n;box.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(String(n));refreshGear(star.closest('.nexa-lib-card'));return;}
    const seg=e.target.closest('[data-segment]');if(seg){e.preventDefault();const box=seg.closest('[data-segments]'),n=Number(seg.dataset.segment);box.querySelectorAll('[data-segment]').forEach(x=>x.classList.toggle('active',Number(x.dataset.segment)<=n));box.querySelector('[data-f="stage"]').value=n;box.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(`${n}/4`);refreshGear(seg.closest('.nexa-lib-card'));return;}
    const cseg=e.target.closest('[data-charm-segment]');if(cseg){e.preventDefault();const box=cseg.parentElement,i=Number(box.dataset.charmSegments),n=Number(cseg.dataset.charmSegment),card=cseg.closest('.nexa-lib-card');box.querySelectorAll('[data-charm-segment]').forEach(x=>x.classList.toggle('active',Number(x.dataset.charmSegment)<=n));const input=card.querySelector('[data-f="charm_stages"]'),a=JSON.parse(input.value||'[0,0,0]');a[i]=n;input.value=JSON.stringify(a);refreshCharm(card,i);return;}
    const max=e.target.closest('[data-set-max]');if(max){e.preventDefault();const card=max.closest('.nexa-lib-card'),input=card.querySelector(`[data-f="${max.dataset.setMax}"]`);input.value=max.dataset.max;input.dispatchEvent(new Event('change',{bubbles:true}));max.classList.add('active');max.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(max.dataset.max);return;}
    const card=e.target.closest('.nexa-lib-card');
    if(card&&!card.classList.contains('open')&&!e.target.closest('input,select,button')){savedScroll=document.querySelector('.nexa-profile-sheet')?.scrollTop||0;openItemId=card.dataset.item;document.querySelectorAll('.nexa-lib-card.open').forEach(x=>x.classList.remove('open'));card.classList.add('open');return;}
    const saveBtn=e.target.closest('.nexa-lib-save'); if(saveBtn){e.preventDefault();save(saveBtn.closest('.nexa-lib-card'));}
  },true);
  document.addEventListener('change',e=>{
    const charm=e.target.closest?.('[data-charm-level]');if(charm){const card=charm.closest('.nexa-lib-card'),i=Number(charm.dataset.charmLevel),levels=card.querySelector('[data-f="charm_levels"]'),a=JSON.parse(levels.value||'[0,0,0]');a[i]=Number(charm.value);levels.value=JSON.stringify(a);refreshCharm(card,i);return;}
    const expertSkill=e.target.closest?.('[data-expert-skill]');if(expertSkill){const readout=expertSkill.parentElement.querySelector('[data-skill-buff]'),level=Number(expertSkill.value||0);if(readout?.dataset.buffValues){try{const message=JSON.parse(readout.dataset.buffValues)[level]||'';readout.textContent=message;if(level>0)showBuffToast(readout.dataset.buffTitle||'EXPERT SKILL',level,message);}catch(_){}}return;}
    const affinity=e.target.closest?.('[data-expert-affinity]');if(affinity){const r=relationship(affinity.value),summary=affinity.parentElement.querySelector('[data-expert-summary]'),boxes=summary?.querySelectorAll('b');if(boxes?.length>=2){boxes[0].textContent=r.name;boxes[1].textContent=`${r.talent}/11`;}affinity.closest('.nexa-control')?.querySelector('[data-control-value]')?.replaceChildren(affinity.value);}
  },true);
  new MutationObserver(()=>{
    const profileOpen=!!document.querySelector('#nexa-profile-modal.open');
    if(profileOpen){
      installTabs();
      if(!profileWasOpen)setTimeout(()=>render(activeTab),60);
    }
    profileWasOpen=profileOpen;
    installAdministrationLibrary();
  }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class']});
  addStyles(); installTabs(); installAdministrationLibrary();
})();
