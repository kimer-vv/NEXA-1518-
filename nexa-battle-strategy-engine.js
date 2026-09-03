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
    const n=teamCounts.length,pools=Array.from({length:n},()=>[]);
    // Reserve enough unique RL resources for Team 1 PET continuity (3x 2h windows) and all simultaneous teams.
    const needs=teamCounts.map(t=>Math.max(3,Number(t)||1));
    // Do not force all RLs active. Cap active pool at what coverage requires, plus optional Team 2 PET depth when abundant.
    const baseNeed=needs.reduce((a,b)=>a+b,0);
    const secondPetNeed=teamCounts.map(t=>t>=2?3:0).reduce((a,b)=>a+b,0);
    const activeTarget=Math.min(leads.length, baseNeed + (leads.length>=baseNeed+secondPetNeed?secondPetNeed:0));
    const active=leads.slice(0,activeTarget),floating=leads.slice(activeTarget);

    let cursor=0;
    // Round robin strongest so counters are not leftovers; primary gets first pick each round.
    const order=[primaryIndex,...Array.from({length:n},(_,i)=>i).filter(i=>i!==primaryIndex)];
    while(cursor<active.length){
      let placed=false;
      for(const ai of order){
        if(cursor>=active.length)break;
        const desired=needs[ai] + ((teamCounts[ai]>=2 && activeTarget>=baseNeed+secondPetNeed)?3:0);
        if(pools[ai].length<desired){pools[ai].push(active[cursor++]);placed=true}
      }
      if(!placed)break;
    }
    return {pools,floating,active};
  }

  function planSchedule({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,team1PetRequired=true,team2PetPreferred=true}={}){
    const {pools,floating,active}=allocateAlliancePools(rallyLeads,teamCounts,primaryIndex);
    const assignments=[],petWindows=[],coverage=[],hours=[];
    for(let h=startHour;h<endHour;h++)hours.push([`${String(h).padStart(2,'0')}:00`,`${String(h+1).padStart(2,'0')}:00`]);

    pools.forEach((pool,ai)=>{
      const teams=Math.max(1,Number(teamCounts[ai])||1);
      if(!pool.length){coverage.push({allianceIndex:ai,complete:false,reason:'no_rally_leads'});return}
      const primaryPet=pool.slice(0,Math.min(3,pool.length));
      const secondPet=(team2PetPreferred&&teams>=2&&pool.length>=6)?pool.slice(3,6):[];
      const blocks=[[12,14],[14,16],[16,18]];
      primaryPet.forEach((lead,i)=>petWindows.push({allianceIndex:ai,teamIndex:0,lead,start:`${blocks[i][0]}:00`,end:`${blocks[i][1]}:00`}));
      secondPet.forEach((lead,i)=>petWindows.push({allianceIndex:ai,teamIndex:1,lead,start:`${blocks[i][0]}:00`,end:`${blocks[i][1]}:00`}));

      let complete=true;
      hours.forEach(([start,end],hi)=>{
        const hour=Number(start.slice(0,2));
        const used=new Set();
        for(let ti=0;ti<teams;ti++){
          let chosen=null,pet=false;
          if(ti===0&&team1PetRequired){
            const w=petWindows.find(w=>w.allianceIndex===ai&&w.teamIndex===0&&hour>=Number(w.start.slice(0,2))&&hour<Number(w.end.slice(0,2)));
            if(w){chosen=w.lead;pet=true}
          } else if(ti===1&&secondPet.length){
            const w=petWindows.find(w=>w.allianceIndex===ai&&w.teamIndex===1&&hour>=Number(w.start.slice(0,2))&&hour<Number(w.end.slice(0,2)));
            if(w){chosen=w.lead;pet=true}
          }
          if(!chosen){
            const available=pool.filter(x=>!used.has(String(x.id||x.in_game_name))).sort((a,b)=>scoreLead(b,{petActive:false})-scoreLead(a,{petActive:false}));
            chosen=available[(hi+ti)%Math.max(1,available.length)]||pool[(hi+ti)%pool.length];
          }
          if(!chosen){complete=false;continue}
          used.add(String(chosen.id||chosen.in_game_name));
          assignments.push({allianceIndex:ai,teamIndex:ti,lead:chosen,start,end,petsActive:pet});
        }
      });
      const team1Hours=assignments.filter(a=>a.allianceIndex===ai&&a.teamIndex===0&&a.petsActive).length;
      if(team1PetRequired&&team1Hours<hours.length)complete=false;
      coverage.push({allianceIndex:ai,complete,team1PetHours:team1Hours,totalHours:hours.length,team2PetEnabled:secondPet.length>=3,poolSize:pool.length});
    });
    return {assignments,petWindows,pools,floating,active,coverage,hours};
  }

  function explainConfidence(rec){
    if(!rec)return 'No recommendation';
    const pct=Math.round(num(rec.confidence,.5)*100);
    return `${rec.evidenceStatus||'baseline'} â¢ ${pct}% evidence confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.0.0',loadMeta,rulesFor,bestRule,recommendation,chooseAlternative,ensureConstraints,
    scoreLead,allocateAlliancePools,planSchedule,explainConfidence
  };
})();
