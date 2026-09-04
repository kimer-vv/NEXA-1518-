/* NEXA SvS Rules v1.1 — canonical Join First + reduced visual noise */
(()=> {
  window.NEXA_SVS_RULES={
    key:'svs',
    battleStart:'12:00',
    battleEnd:'17:00',
    team1PetRequired:true,
    team2PetPreferred:true,
    petActivationHours:2,
    wholeHourScheduling:true,
    primaryAlliancePriority:true,
    allowCrossAllianceRotation:true,
    floatingRallyLeads:true,

    /* Canonical first-four buff seats. Duplicates are intentional. */
    joinFirst:{
      attack:{
        leaderHeroes:['Gregory','Mia','Blanchette'],
        top4:['Norah','Norah','Hendrik','Patrick'],
        strategicBackups:['Gatot','Jessie','Jasser','Seo-yoon']
      },
      defense:{
        leaderHeroes:['Gregory','Freya','Bradley'],
        top4:['Renee','Mia','Patrick','Hendrik'],
        strategicBackups:['Wu Ming','Gatot','Sergey','Jessie']
      }
    },

    coverage:{
      team1:'PETS must remain active continuously when mathematically possible.',
      team2:'Use PETS when roster depth supports it without weakening Team 1.',
      otherTeams:'Use strongest effective available Rally Lead; PETS are optional.'
    }
  };

  /*
    V1.1 layout readability pass.
    Scope is intentionally limited to the SvS Team Layout so the rest of NEXA
    and the underlying rarity system remain untouched.
  */
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

    /* Keep rarity identity, but lower saturation so the sheet is easier on the eyes. */
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

    .layout-sheet .hero-line b:first-child{
      color:#dfe4ef!important;
      opacity:.88;
    }

    .layout-sheet .layout-row{
      color:#e7eaf2;
    }
  `;

  const installReadability=()=>{
    if(document.getElementById('nexa-svs-layout-readability-v11'))return;
    const style=document.createElement('style');
    style.id='nexa-svs-layout-readability-v11';
    style.textContent=css;
    document.head.appendChild(style);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installReadability,{once:true});
  else installReadability();
})();
