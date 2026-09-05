/* NEXA SvS Rules v1.6 — READ/UI ONLY • SINGLE WRITER = svs-operations.html • NO AUTO-HEAL WRITES */
(()=> {
  'use strict';

  /*
    IMPORTANT OWNERSHIP RULE
    ------------------------
    This file is intentionally READ/UI ONLY.

    It must NEVER insert/update/delete:
    - svs_rally_formations
    - svs_pet_schedule_rows
    - svs_pet_schedule_assignments
    - svs_strategy_rally_slots
    - svs_strategy_joiners
    - svs_strategy_teams
    - svs_strategy_alliances

    svs-operations.html is the sole Strategy graph writer.
    nexa-battle-strategy-engine.js v1.6 is the sole shared PET scheduler/strategy engine.
  */

  window.NEXA_SVS_RULES = Object.freeze({
    key:'svs',
    version:'1.6',
    readOnly:true,
    battleStart:'12:00',
    battleEnd:'17:00',
    petActivationHours:2,
    wholeHourScheduling:true,
    primaryAlliancePriority:true,
    allowCrossAllianceRotation:true,
    floatingRallyLeads:true,
    ownership:Object.freeze({
      strategyWriter:'svs-operations.html',
      battleEngine:'nexa-battle-strategy-engine.js',
      thisFile:'ui-read-only'
    }),
    coverage:Object.freeze({
      garrison:'Primary Team 1 receives structural PET coverage priority when mathematically possible.',
      handoff:'Primary Team 2 is Handoff and never receives PETS.',
      counter:'All non-Handoff teams are Counter teams and PET coverage is dynamic by strength, phase and coverage need.'
    })
  });

  const css=`
    .layout-sheet .pname b{
      color:#f3f5fb!important;
      font-weight:900!important;
      -webkit-text-stroke:.34px rgba(0,0,0,.96)!important;
      text-shadow:0 1px 1px rgba(0,0,0,.98),0 0 2px rgba(0,0,0,.82)!important;
    }
    .layout-sheet .hero-name,
    .layout-sheet .rl-formation-hero b{
      font-weight:900!important;
      -webkit-text-stroke:.30px rgba(0,0,0,.96)!important;
      text-shadow:0 1px 1px rgba(0,0,0,.98),0 0 2px rgba(0,0,0,.78)!important;
    }
    .layout-sheet .hero-name.rarity-mythic,
    .layout-sheet .hero-name.rarity-gold,
    .layout-sheet .hero-name.rarity-legendary,
    .layout-sheet .rl-formation-hero b.rarity-mythic,
    .layout-sheet .rl-formation-hero b.rarity-gold,
    .layout-sheet .rl-formation-hero b.rarity-legendary{color:#e4d2a0!important}
    .layout-sheet .hero-name.rarity-epic,
    .layout-sheet .hero-name.rarity-purple,
    .layout-sheet .rl-formation-hero b.rarity-epic,
    .layout-sheet .rl-formation-hero b.rarity-purple{color:#c8b9dd!important}
    .layout-sheet .hero-name.rarity-rare,
    .layout-sheet .hero-name.rarity-blue,
    .layout-sheet .rl-formation-hero b.rarity-rare,
    .layout-sheet .rl-formation-hero b.rarity-blue{color:#b7cfdd!important}

    /* Team Layout: joiner rows are text-first. Portraits remain available in Strategy Board/Battle Plan. */
    .layout-sheet .layout-team .hero-line img{display:none!important}

    .layout-sheet .layout-headrow,
    .layout-sheet .layout-row{
      grid-template-columns:minmax(125px,.95fr) 1.05fr 1.05fr!important;
      gap:10px!important;
    }
    .layout-sheet .layout-row{
      color:#e7eaf2;
      font-size:12.5px!important;
      line-height:1.42!important;
      padding:9px 10px!important;
    }
    .layout-sheet .layout-headrow{
      font-size:10.5px!important;
      padding:8px 10px!important;
      letter-spacing:.08em;
    }
    .layout-sheet .pname b{
      font-size:12.8px!important;
      font-weight:950!important;
      letter-spacing:.01em;
    }
    .layout-sheet .hero-name{
      font-size:11.8px!important;
      font-weight:950!important;
      letter-spacing:.015em;
      overflow:visible!important;
      text-overflow:clip!important;
    }
    .layout-sheet .hero-line{gap:6px!important}
    .layout-sheet .hero-line>b:first-child{
      color:#dfe4ef!important;
      opacity:.88;
      font-size:10.8px!important;
      font-weight:950!important;
      min-width:12px;
    }
    .layout-sheet .hero-stack{gap:5px!important}
    .layout-sheet .layout-team-title{font-size:14px!important}
    .layout-sheet .layout-rally .rally{font-size:12px!important}

    /* Keep the native V11.3.8 top formation block authoritative.
       Attack/Defense portraits, names and ratios remain visible. */
    .layout-sheet .rl-formations-group h4{
      font-size:12px!important;
      letter-spacing:.09em;
    }
    .layout-sheet .rl-formation-list{gap:9px!important}
    .layout-sheet .rl-formation-card{padding:10px!important}
    .layout-sheet .rl-formation-card .f-ratio{display:block!important}
    .layout-sheet .rl-formation-card .rl-formation-heroes{display:grid!important}
    .layout-sheet .rl-formation-hero img{
      width:52px!important;
      height:52px!important;
    }
    .layout-sheet .rl-formation-hero b{
      font-size:10px!important;
      font-weight:950!important;
    }

    /* Legacy enhancer grids are suppressed; the native top formation UI is the source of truth. */
    .layout-sheet .nexa-formation-grid{display:none!important}
    .joiner-ratio-grid{display:none!important}
  `;

  function installReadability(){
    if(document.getElementById('nexa-svs-layout-readability-v16'))return;
    const style=document.createElement('style');
    style.id='nexa-svs-layout-readability-v16';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function clarifyFormationUI(){
    document.querySelectorAll('.rl-formations-group.attack h4')
      .forEach(x=>x.textContent='⚔ ATTACK FORMATION');

    document.querySelectorAll('.rl-formations-group.defense h4')
      .forEach(x=>x.textContent='🛡 DEFENSIVE FORMATION');
  }

  function installFormationsPill(){
    const nav=document.querySelector('.nav');
    if(!nav||nav.querySelector('[data-nexa-formations]'))return;

    const b=document.createElement('button');
    b.type='button';
    b.dataset.nexaFormations='1';
    b.textContent='Formations';
    b.addEventListener('click',()=>{ location.href='formations.html'; });
    nav.appendChild(b);
  }

  function assertEngine16(){
    const v=String(window.NexaBattleStrategyEngine?.version||'');
    if(v && v!=='1.6'){
      console.warn(`[NEXA SvS Rules] Expected Battle Strategy Engine v1.6; found ${v}.`);
    }
  }

  function refreshUiOnly(){
    installReadability();
    installFormationsPill();
    clarifyFormationUI();
    assertEngine16();
  }

  function boot(){
    refreshUiOnly();

    /*
      Strategy Board rerenders sections dynamically.
      This timer only reapplies presentation labels/styles.
      It performs ZERO Supabase reads/writes and ZERO graph healing.
    */
    setInterval(refreshUiOnly,900);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
