/* NEXA Battle Strategy Engine v1.3.0
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

  function desiredPetCurve(leadCount,totalTeams){
    const cap=Math.max(1,Math.min(Number(totalTeams)||1,Number(leadCount)||1));
    let curve;
    if(leadCount>=15)curve=[4,5,6,6,4];
    else if(leadCount>=12)curve=[3,4,5,5,3];
    else if(leadCount>=10)curve=[3,4,4,4,3];
    else if(leadCount>=8)curve=[2,3,4,4,2];
    else if(leadCount>=6)curve=[2,3,3,3,2];
    else curve=[1,2,2,2,1];
    return curve.map(x=>Math.min(cap,x));
  }

  function activationStartsFromCurve(curve,startHour=12){
    const counts={};
    for(let i=0;i<curve.length;i++){
      const h=startHour+i;
      const prev=i>0?(counts[h-1]||0):0;
      counts[h]=Math.max(0,curve[i]-prev);
    }
    return counts;
  }

  function strengthStartOrder(startCounts){
    const left={...startCounts},order=[],priority=[12,16,12,16,14,13,15,14,13,15];
    while(Object.values(left).some(n=>n>0)){
      let added=false;
      for(const h of priority){
        if((left[h]||0)>0){order.push(h);left[h]--;added=true}
      }
      if(!added)break;
    }
    return order;
  }

  function slotCandidates(teamCounts,primaryIndex,petHoursBySlot){
    const out=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        const key=`${ai}:${ti}`;
        let priority=0;
        if(ai===primaryIndex&&ti===0)priority=1000;                 // Castle / Garrison anchor
        else if(ti===0)priority=220;                              // T1 all other alliances: high priority, not mandatory
        else if(ai===primaryIndex&&ti===1)priority=190;           // Primary T2
        else if(ti===1)priority=170;                              // Counter T2
        else if(ai===primaryIndex&&ti===2)priority=155;           // Primary T3
        else priority=140-Math.min(40,ti*8);                      // Other secondary teams
        const covered=petHoursBySlot.get(key)||0;
        out.push({allianceIndex:ai,teamIndex:ti,key,priority,covered});
      }
    }
    return out;
  }

  function planSchedule({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,primaryTeam1PetRequired=true}={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const allianceCount=teamCounts.length,totalTeams=teamCounts.reduce((s,n)=>s+Number(n||0),0);
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    if(!leads.length||!totalTeams)return {assignments:[],petWindows:[],petTimeline:[],floating:leads,active:[],coverage:[],hours:[]};

    const curve=desiredPetCurve(leads.length,totalTeams);
    const startCounts=activationStartsFromCurve(curve,startHour);

    // Guarantee the Castle/Garrison T1 can be continuously covered 12â17:
    // one 2h activation at 12, another at 14 and another at 16.
    for(const h of [12,14,16])startCounts[h]=Math.max(1,startCounts[h]||0);

    // Do not create more 2h PET activations than the roster can support.
    let totalStarts=Object.values(startCounts).reduce((s,n)=>s+n,0);
    while(totalStarts>leads.length){
      const removable=[15,13,14,12,16].find(h=>(startCounts[h]||0)>((h===12||h===14||h===16)?1:0));
      if(removable==null)break;
      startCounts[removable]--;totalStarts--;
    }

    // Strongest leads are intentionally staggered: strongest resources go to OPEN/CLOSE first,
    // then bridge the middle. This preserves bullets for the final hour while keeping mid coverage dense.
    const startOrder=strengthStartOrder(startCounts);
    const windows=[];
    leads.slice(0,startOrder.length).forEach((lead,i)=>{
      const start=startOrder[i];
      windows.push({lead,start,end:start+2,id:`${leadKey(lead)}:${start}`});
    });

    const petTimeline=[],petHoursBySlot=new Map(),windowSlotHistory=new Map();
    for(const hour of hours){
      const activeWindows=windows.filter(w=>w.start<=hour&&w.end>hour);
      const usedSlots=new Set();

      // Castle T1 is always assigned first to a PET-active lead.
      const anchorWindow=activeWindows
        .filter(w=>!windowSlotHistory.get(w.id)?.some(x=>x.hour===hour))
        .sort((a,b)=>scoreLead(b.lead)-scoreLead(a.lead))[0];

      if(anchorWindow&&teamCounts[primaryIndex]>0){
        const entry={allianceIndex:primaryIndex,teamIndex:0,lead:anchorWindow.lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,windowStart:`${anchorWindow.start}:00`,windowEnd:`${anchorWindow.end}:00`};
        petTimeline.push(entry);usedSlots.add(`${primaryIndex}:0`);
        petHoursBySlot.set(`${primaryIndex}:0`,(petHoursBySlot.get(`${primaryIndex}:0`)||0)+1);
        const hist=windowSlotHistory.get(anchorWindow.id)||[];hist.push({hour,allianceIndex:primaryIndex,teamIndex:0});windowSlotHistory.set(anchorWindow.id,hist);
      }

      for(const w of activeWindows){
        if(anchorWindow&&w.id===anchorWindow.id)continue;
        const hist=windowSlotHistory.get(w.id)||[];
        const prev=hist.find(x=>x.hour===hour-1);
        const slots=slotCandidates(teamCounts,primaryIndex,petHoursBySlot)
          .filter(s=>!usedSlots.has(s.key))
          .map(s=>{
            // Continuity is useful but never a hard lock. Under-covered T1/T2/T3 can beat continuity.
            const continuity=prev&&prev.allianceIndex===s.allianceIndex&&prev.teamIndex===s.teamIndex?26:0;
            const balancePenalty=s.covered*22;
            // Middle hours deliberately spread PET support more broadly.
            const midBonus=(hour>=13&&hour<=15&&s.teamIndex>0)?12:0;
            // Keep counter alliances dangerous instead of stacking everything on Primary.
            const counterBonus=(s.allianceIndex!==primaryIndex)?10:0;
            return {...s,score:s.priority+continuity+midBonus+counterBonus-balancePenalty};
          })
          .sort((a,b)=>b.score-a.score);
        const slot=slots[0];if(!slot)continue;
        const entry={allianceIndex:slot.allianceIndex,teamIndex:slot.teamIndex,lead:w.lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,windowStart:`${w.start}:00`,windowEnd:`${w.end}:00`};
        petTimeline.push(entry);usedSlots.add(slot.key);
        petHoursBySlot.set(slot.key,(petHoursBySlot.get(slot.key)||0)+1);
        hist.push({hour,allianceIndex:slot.allianceIndex,teamIndex:slot.teamIndex});windowSlotHistory.set(w.id,hist);
      }
    }

    // Full RL movement schedule. PETS are one layer; non-PET RLs fill useful slots before anyone floats.
    const assignments=[],previousBySlot=new Map(),useCount=new Map();
    for(const hour of hours){
      const usedLeadKeys=new Set();
      const petNow=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      for(const x of petNow){
        assignments.push({...x});usedLeadKeys.add(leadKey(x.lead));
        previousBySlot.set(`${x.allianceIndex}:${x.teamIndex}`,x.lead);
        useCount.set(leadKey(x.lead),(useCount.get(leadKey(x.lead))||0)+1);
      }

      for(let ai=0;ai<allianceCount;ai++){
        for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
          if(assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===hour))continue;
          const slotKey=`${ai}:${ti}`,prev=previousBySlot.get(slotKey);
          const available=leads.filter(p=>!usedLeadKeys.has(leadKey(p))).map(p=>{
            const continuity=prev&&leadKey(prev)===leadKey(p)?18:0;
            const freshBonus=Math.max(0,30-(useCount.get(leadKey(p))||0)*5);
            const secondaryRotation=(ti>0)?10:0;
            const primaryStrength=(ai===primaryIndex&&ti===0)?scoreLead(p)*.02:0;
            return {p,score:scoreLead(p)+continuity+freshBonus+secondaryRotation+primaryStrength};
          }).sort((a,b)=>b.score-a.score);
          const chosen=available[0]?.p;if(!chosen)continue;
          assignments.push({allianceIndex:ai,teamIndex:ti,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false});
          usedLeadKeys.add(leadKey(chosen));previousBySlot.set(slotKey,chosen);
          useCount.set(leadKey(chosen),(useCount.get(leadKey(chosen))||0)+1);
        }
      }
    }

    const usedIds=new Set(assignments.map(a=>leadKey(a.lead)));
    const active=leads.filter(p=>usedIds.has(leadKey(p)));
    const floating=leads.filter(p=>!usedIds.has(leadKey(p)));
    const coverage=[];
    for(let ai=0;ai<allianceCount;ai++){
      const teamPetHours={};
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        teamPetHours[ti]=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      }
      const fullTeams=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)).every(Boolean));
      const primaryAnchorOk=ai!==primaryIndex||!primaryTeam1PetRequired||teamPetHours[0]===hours.length;
      coverage.push({allianceIndex:ai,complete:fullTeams&&primaryAnchorOk,totalHours:hours.length,teamPetHours,team1PetHours:teamPetHours[0]||0});
    }

    const petWindows=windows.map(w=>({
      lead:w.lead,start:`${w.start}:00`,end:`${w.end}:00`,
      movements:(windowSlotHistory.get(w.id)||[]).map(x=>({hour:x.hour,allianceIndex:x.allianceIndex,teamIndex:x.teamIndex}))
    }));

    return {assignments,petWindows,petTimeline,floating,active,coverage,petCurve:curve,startCounts,hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])};
  }

  function explainConfidence(rec){
    if(!rec)return 'No recommendation';
    const pct=Math.round(num(rec.confidence,.5)*100);
    return `${rec.evidenceStatus||'baseline'} â¢ ${pct}% evidence confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.3.0',loadMeta,rulesFor,bestRule,recommendation,chooseAlternative,ensureConstraints,
    scoreLead,allocateAlliancePools,planSchedule,explainConfidence
  };
})();