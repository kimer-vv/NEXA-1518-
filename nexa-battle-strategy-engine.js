/* NEXA Battle Strategy Engine v1
   Shared battle brain for SvS / FDT / TAL / Matchup Lab.
   Data-driven: reads nexa_battle_meta_rules from Supabase and falls back conservatively.
*/
(()=> {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const norm=s=>String(s||'').trim().toLowerCase();
  const ratioOk=r=>Array.isArray(r)&&r.length===3&&r.every(x=>Number.isFinite(Number(x)))&&Math.abs(r.reduce((a,b)=>a+Number(b),0)-100)<.01;
  const copy=o=>JSON.parse(JSON.stringify(o));

  async function loadMeta(sb){
    if(!sb) return [];
    const {data,error}=await sb.from('nexa_battle_meta_rules')
      .select('generation,event_scope,mode,rule_key,leader_heroes,primary_ratio,alternative_ratios,joiner_primary,joiner_alternatives,constraints,confidence,evidence_status,evidence_note,source_urls,verified_at,is_active')
      .eq('is_active',true).order('generation').order('confidence',{ascending:false});
    if(error){ console.warn('[NEXA engine] meta load failed',error); return []; }
    return data||[];
  }

  function rulesFor(meta,generation,mode,eventScope='pvp_rally'){
    return (meta||[]).filter(r=>r.is_active!==false&&Number(r.generation)===Number(generation)&&r.mode===mode&&r.event_scope===eventScope)
      .sort((a,b)=>num(b.confidence)-num(a.confidence));
  }

  function bestRule(meta,generation,mode,eventScope='pvp_rally'){
    return rulesFor(meta,generation,mode,eventScope)[0]||null;
  }

  function heroMap(heroes){
    const m=new Map();
    for(const h of heroes||[])m.set(norm(h.name),h);
    return m;
  }

  function ensureConstraints(rule,ratio){
    let r=ratioOk(ratio)?ratio.map(Number):[50,20,30];
    const c=rule?.constraints||{};
    const names=(rule?.leader_heroes||[]).map(norm);
    const needsLancer=(c.requires_lancer_if_hero||[]).some(n=>names.includes(norm(n))) || num(c.t12_min_lancer)>0;
    if(needsLancer&&r[1]<=0){
      const min=Math.max(1,num(c.t12_min_lancer,1));
      const take=Math.min(min,r[2]>r[0]?r[2]:r[0]);
      if(r[2]>=r[0]){r[2]-=take;r[1]+=take}else{r[0]-=take;r[1]+=take}
    }
    return r;
  }

  function recommendation(meta,generation,mode,heroes,{allowCrossGeneration=true,eventScope='pvp_rally'}={}){
    const byName=heroMap(heroes), gen=Number(generation);
    let candidates=rulesFor(meta,gen,mode,eventScope);
    if(allowCrossGeneration){
      for(let g=gen-1;g>=1;g--) candidates.push(...rulesFor(meta,g,mode,eventScope));
    }
    for(const rule of candidates){
      const resolved=(rule.leader_heroes||[]).map(n=>byName.get(norm(n))).filter(Boolean);
      if(resolved.length===3){
        const primary=ensureConstraints(rule,rule.primary_ratio);
        const alternatives=(rule.alternative_ratios||[]).filter(ratioOk).map(r=>ensureConstraints(rule,r));
        return {
          generation:Number(rule.generation), mode, ruleKey:rule.rule_key, heroes:resolved, heroNames:resolved.map(h=>h.name),
          ratio:primary, alternatives, joiners:rule.joiner_primary||[], joinerAlternatives:rule.joiner_alternatives||[],
          confidence:num(rule.confidence,.5), evidenceStatus:rule.evidence_status||'baseline',
          note:rule.evidence_note||'', sourceUrls:rule.source_urls||[], constraints:rule.constraints||{},
          exactGeneration:Number(rule.generation)===gen
        };
      }
    }
    // Conservative fallback: highest available hero by troop class <= requested generation.
    const usable=(heroes||[]).filter(h=>num(h.generation)<=gen).sort((a,b)=>num(b.generation)-num(a.generation));
    const byType=t=>usable.find(h=>norm(h.troop_type)===t);
    const trio=[byType('infantry'),byType('lancer'),byType('marksman')].filter(Boolean);
    return {
      generation:gen,mode,ruleKey:'fallback',heroes:trio,heroNames:trio.map(h=>h.name),
      ratio:mode==='attack'?[50,20,30]:[60,20,20],alternatives:mode==='attack'?[[48,4,48]]:[[50,40,10]],
      joiners:mode==='attack'?['Jessie','Seo-yoon','Jasser','Norah']:['Patrick','Norah','Sergey','Hendrik'],
      joinerAlternatives:[],confidence:.35,evidenceStatus:'baseline',
      note:'Fallback only. NEXA does not claim a verified meta rule for this exact generation/setup.',sourceUrls:[],constraints:{}
    };
  }

  function chooseAlternative(rec,index=0){
    const r=copy(rec);
    if(r.alternatives?.[index])r.ratio=copy(r.alternatives[index]);
    return r;
  }

  function scoreLead(p,{petActive=false,mode='attack'}={}){
    const strength=num(p._strength)||num(p.power)/1000;
    const rally=num(p.rally_capacity)/100;
    const deploy=num(p.deployment_capacity)/200;
    const gear=typeof p.hero_gear==='object'&&p.hero_gear?Object.values(p.hero_gear).reduce((s,v)=>s+num(v),0):0;
    return strength+rally+deploy+gear+(petActive?500000:0)+(mode==='defense'?num(p._defenseScore):num(p._attackScore));
  }

  function allocateAlliancePools(rallyLeads,teamCounts,primaryIndex=0){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const allianceCount=teamCounts.length;
    const mandatoryPetOwners=allianceCount*3; // one Team 1 PET lane per Alliance, three 2h blocks.
    const fullTeam2Lanes=teamCounts.filter(t=>Number(t)>=2).length;
    const possibleExtraLanes=Math.min(fullTeam2Lanes,Math.floor(Math.max(0,leads.length-mandatoryPetOwners)/3));
    const petOwnerTarget=Math.min(leads.length,mandatoryPetOwners+possibleExtraLanes*3);
    const petOwners=leads.slice(0,petOwnerTarget);
    const coreNeed=Math.max(0,Math.max(...teamCounts.map(Number),0)*allianceCount-petOwners.length);
    const core=leads.slice(petOwnerTarget,Math.min(leads.length,petOwnerTarget+coreNeed));
    const active=[...petOwners,...core];
    return {pools:[],floating:leads.filter(x=>!active.includes(x)),active,petOwners,possibleExtraLanes};
  }

  function planSchedule({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,team1PetRequired=true,team2PetPreferred=true}={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const allianceCount=teamCounts.length;
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    const activationHours=[];for(let h=startHour;h<endHour+1;h++)activationHours.push(h); // includes 17 for the 16â18 PET block.
    const blocks=[[12,14],[14,16],[16,18]];

    // PET lanes: Team 1 for every Alliance is mandatory. Team 2 lanes are added only in complete 3-owner sets.
    const lanes=[];
    for(let ai=0;ai<allianceCount;ai++)lanes.push({allianceIndex:ai,teamIndex:0,mandatory:true});
    const mandatoryOwners=lanes.length*3;
    let extraLaneBudget=team2PetPreferred?Math.floor(Math.max(0,leads.length-mandatoryOwners)/3):0;
    const team2Order=[primaryIndex,...Array.from({length:allianceCount},(_,i)=>i).filter(i=>i!==primaryIndex)];
    for(const ai of team2Order){if(extraLaneBudget<=0)break;if(Number(teamCounts[ai])>=2){lanes.push({allianceIndex:ai,teamIndex:1,mandatory:false});extraLaneBudget--}}

    const ownersNeeded=lanes.length*3;
    const petOwners=leads.slice(0,Math.min(leads.length,ownersNeeded));
    const petWindows=[];
    const blockOwners=[];
    let cursor=0;
    for(let bi=0;bi<3;bi++){
      const owners=[];
      for(let li=0;li<lanes.length;li++){const lead=petOwners[cursor++];if(lead){owners.push(lead);petWindows.push({lead,start:`${blocks[bi][0]}:00`,end:`${blocks[bi][1]}:00`,blockIndex:bi})}}
      blockOwners.push(owners);
    }

    // Build an hourly PET timeline. Within the same 2h activation, rotate lane ownership after one hour.
    const petTimeline=[];
    for(let bi=0;bi<3;bi++){
      const owners=blockOwners[bi],bh=blocks[bi][0];
      if(!owners.length)continue;
      for(let offset=0;offset<2;offset++){
        const hour=bh+offset;
        for(let li=0;li<lanes.length;li++){
          const lead=owners[(li+offset)%owners.length];
          if(!lead)continue;
          const lane=lanes[li];
          petTimeline.push({allianceIndex:lane.allianceIndex,teamIndex:lane.teamIndex,lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,blockIndex:bi});
        }
      }
    }

    // Rally assignments only cover the battle 12â17. Each Team gets exactly one unique RL per hour.
    const assignments=[];
    for(const hour of hours){
      const used=new Set();
      const hourPets=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      // PET lanes first so Team 1 can never be displaced by a non-PET choice.
      for(const x of hourPets){
        if(x.teamIndex>=Number(teamCounts[x.allianceIndex]||0) || used.has(String(x.lead.id||x.lead.in_game_name)))continue;
        assignments.push({...x});used.add(String(x.lead.id||x.lead.in_game_name));
      }
      const slots=[];
      for(let ai=0;ai<allianceCount;ai++)for(let ti=0;ti<Number(teamCounts[ai]||0);ti++)if(!assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===hour))slots.push({allianceIndex:ai,teamIndex:ti});
      for(const slot of slots){
        const available=leads.filter(p=>!used.has(String(p.id||p.in_game_name))).sort((a,b)=>scoreLead(b,{petActive:false})-scoreLead(a,{petActive:false}));
        const chosen=available[0];if(!chosen)continue;
        assignments.push({...slot,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false});
        used.add(String(chosen.id||chosen.in_game_name));
      }
    }

    const usedIds=new Set(assignments.map(a=>String(a.lead.id||a.lead.in_game_name)));
    const active=leads.filter(p=>usedIds.has(String(p.id||p.in_game_name)));
    const floating=leads.filter(p=>!usedIds.has(String(p.id||p.in_game_name)));
    const coverage=[];
    for(let ai=0;ai<allianceCount;ai++){
      const team1PetHours=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===0&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      const team2PetHours=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===1&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      const fullTeams=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)).every(Boolean));
      coverage.push({allianceIndex:ai,complete:fullTeams&&(!team1PetRequired||team1PetHours===hours.length),team1PetHours,totalHours:hours.length,team2PetEnabled:team2PetHours===hours.length,team2PetHours});
    }
    return {assignments,petWindows,petTimeline,lanes,floating,active,coverage,hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])};
  }

  function explainConfidence(rec){
    if(!rec)return 'No recommendation';
    const pct=Math.round(num(rec.confidence,.5)*100);
    return `${rec.evidenceStatus||'baseline'} â¢ ${pct}% evidence confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.1.0',loadMeta,rulesFor,bestRule,recommendation,chooseAlternative,ensureConstraints,
    scoreLead,allocateAlliancePools,planSchedule,explainConfidence
  };
})();