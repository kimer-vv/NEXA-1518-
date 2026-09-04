/* NEXA Battle Strategy Engine v1.2
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

  function leadKey(p){return String(p?.id||p?.in_game_name||'')}

  function staggerPetBuckets(leads,neededPerPhase){
    // Strength staggering: strongest resources are intentionally split across OPEN / MID / CLOSE.
    // Pattern keeps peak strength at the opening and closing while still leaving strong bridge leads for mid battle.
    const buckets=[[],[],[]],phasePattern=[0,2,1];
    const wanted=neededPerPhase*3;
    leads.slice(0,wanted).forEach((lead,i)=>buckets[phasePattern[i%3]].push(lead));
    return buckets;
  }

  function allianceOrderForPhase(allianceCount,primaryIndex,phase){
    const rest=Array.from({length:allianceCount},(_,i)=>i).filter(i=>i!==primaryIndex);
    if(!rest.length)return [primaryIndex];
    // Opening: primary gets first anchor. Mid: strongest bridge goes to a counter. Closing: primary gets first anchor again.
    if(phase===1)return [rest[0],primaryIndex,...rest.slice(1)];
    if(phase===2&&rest.length>1)return [primaryIndex,rest[1],rest[0],...rest.slice(2)];
    return [primaryIndex,...rest];
  }

  function allocateAlliancePools(rallyLeads,teamCounts,primaryIndex=0){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const allianceCount=teamCounts.length;
    const mainOwnersNeeded=allianceCount*3;
    const reserveTarget=Math.max(1,Math.ceil(leads.length*.15));
    const surplus=Math.max(0,leads.length-mainOwnersNeeded-reserveTarget);
    const eligibleSecondLanes=teamCounts.map((t,i)=>({i,t:Number(t)||0})).filter(x=>x.t>=2);
    // Extra PET lane costs three additional 2h activations. Never spend reserves just to color more cells violet.
    const extraLaneCount=Math.min(eligibleSecondLanes.length,Math.floor(surplus/3));
    const extraLaneOrder=[primaryIndex,...eligibleSecondLanes.map(x=>x.i).filter(i=>i!==primaryIndex)].filter((v,i,a)=>a.indexOf(v)===i);
    const extraLanes=extraLaneOrder.slice(0,extraLaneCount).map(allianceIndex=>({allianceIndex,teamIndex:1,mandatory:false}));
    const activePetCount=Math.min(leads.length,mainOwnersNeeded+extraLanes.length*3);
    const petOwners=leads.slice(0,activePetCount);
    return {pools:[],petOwners,extraLanes,reserveTarget,active:petOwners,floating:leads.slice(activePetCount)};
  }

  function planSchedule({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,team1PetRequired=true,team2PetPreferred=true}={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const allianceCount=teamCounts.length;
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    const blocks=[[12,14],[14,16],[16,18]];
    const mainLaneCount=allianceCount;
    const {extraLanes,reserveTarget}=allocateAlliancePools(leads,teamCounts,primaryIndex);
    const lanes=[...Array.from({length:allianceCount},(_,allianceIndex)=>({allianceIndex,teamIndex:0,mandatory:true})),...(team2PetPreferred?extraLanes:[])];
    const ownerCountPerPhase=lanes.length;
    const petOwnerCount=Math.min(leads.length,ownerCountPerPhase*3);
    const phaseBuckets=staggerPetBuckets(leads.slice(0,petOwnerCount),ownerCountPerPhase);
    const petWindows=[],petTimeline=[];

    // One 2h activation per owner. Default is continuity: stay in the same lane for both hours.
    // We only move a player later if a non-PET assignment needs them after the PET window.
    for(let phase=0;phase<3;phase++){
      const bucket=phaseBuckets[phase]||[];
      const mainOrder=allianceOrderForPhase(allianceCount,primaryIndex,phase);
      const orderedLanes=[...mainOrder.map(allianceIndex=>({allianceIndex,teamIndex:0,mandatory:true})),...lanes.filter(l=>l.teamIndex>0)];
      orderedLanes.forEach((lane,li)=>{
        const lead=bucket[li];if(!lead)return;
        const start=blocks[phase][0],end=blocks[phase][1];
        petWindows.push({allianceIndex:lane.allianceIndex,teamIndex:lane.teamIndex,lead,start:`${start}:00`,end:`${end}:00`,blockIndex:phase,mandatory:lane.mandatory});
        for(let hour=start;hour<Math.min(end,endHour);hour++)petTimeline.push({allianceIndex:lane.allianceIndex,teamIndex:lane.teamIndex,lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,blockIndex:phase,mandatory:lane.mandatory});
      });
    }

    const assignments=[];
    const previousBySlot=new Map();
    for(const hour of hours){
      const used=new Set();
      const petNow=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      // PET lanes first. Team 1 PET owners are anchors and stay for their full 2h activation by default.
      for(const x of petNow){
        if(x.teamIndex>=Number(teamCounts[x.allianceIndex]||0))continue;
        const key=leadKey(x.lead);if(!key||used.has(key))continue;
        assignments.push({...x});used.add(key);previousBySlot.set(`${x.allianceIndex}:${x.teamIndex}`,x.lead);
      }

      // Fill every remaining team. Prefer continuity from the previous hour, then strongest available.
      for(let ai=0;ai<allianceCount;ai++){
        for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
          if(assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===hour))continue;
          const slotKey=`${ai}:${ti}`;
          let chosen=previousBySlot.get(slotKey)||null;
          if(chosen&&used.has(leadKey(chosen)))chosen=null;
          if(!chosen){
            const available=leads.filter(p=>!used.has(leadKey(p))).sort((a,b)=>scoreLead(b)-scoreLead(a));
            chosen=available[0]||null;
          }
          if(!chosen)continue;
          assignments.push({allianceIndex:ai,teamIndex:ti,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false});
          used.add(leadKey(chosen));previousBySlot.set(slotKey,chosen);
        }
      }
    }

    const usedIds=new Set(assignments.map(a=>leadKey(a.lead)));
    const active=leads.filter(p=>usedIds.has(leadKey(p)));
    const floating=leads.filter(p=>!usedIds.has(leadKey(p)));
    const coverage=[];
    for(let ai=0;ai<allianceCount;ai++){
      const team1PetHours=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===0&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      const team2PetHours=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===1&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      const fullTeams=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)).every(Boolean));
      coverage.push({allianceIndex:ai,complete:fullTeams&&(!team1PetRequired||team1PetHours===hours.length),team1PetHours,totalHours:hours.length,team2PetEnabled:team2PetHours>0,team2PetHours});
    }

    return {assignments,petWindows,petTimeline,lanes,floating,active,coverage,reserveTarget,hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])};
  }

  function explainConfidence(rec){
    if(!rec)return 'No recommendation';
    const pct=Math.round(num(rec.confidence,.5)*100);
    return `${rec.evidenceStatus||'baseline'} â¢ ${pct}% evidence confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.2.0',loadMeta,rulesFor,bestRule,recommendation,chooseAlternative,ensureConstraints,
    scoreLead,allocateAlliancePools,planSchedule,explainConfidence
  };
})();