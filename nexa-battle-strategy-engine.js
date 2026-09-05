/* NEXA Battle Strategy Engine v2.1
   Shared battle brain for SvS / FDT / TAL / Matchup Lab.
   Approved formation catalog + resilient Join First/backup pools + FULL-USE purpose-aware PET scheduler.
   v2.1: hard continuous Main Team 1 PET lane + strategic Counter distribution + smart up-to-2h same-team continuity + pre/post-PET lane safety.
*/
(()=> {
  'use strict';
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const norm=s=>String(s||'').trim().toLowerCase();
  const copy=o=>JSON.parse(JSON.stringify(o));
  const ratioOk=r=>Array.isArray(r)&&r.length===3&&r.every(x=>Number.isFinite(Number(x)))&&Math.abs(r.reduce((a,b)=>a+Number(b),0)-100)<.01;

  async function loadMeta(sb,{includeSuggestions=false}={}){
    if(!sb)return [];
    let q=sb.from('nexa_battle_meta_rules')
      .select('id,generation,event_scope,mode,rule_key,leader_heroes,primary_ratio,alternative_ratios,alternative_formations,joiner_primary,joiner_alternatives,backup_joiner_pool,constraints,confidence,evidence_status,evidence_note,why_good,risk_note,source_urls,source_count,independent_source_count,research_metadata,approval_status,verified_at,last_researched_at,is_active,is_manual')
      .order('generation').order('confidence',{ascending:false});
    if(!includeSuggestions)q=q.eq('approval_status','approved').eq('is_active',true);
    const {data,error}=await q;
    if(error){console.warn('[NEXA engine] meta load failed',error);return []}
    return data||[];
  }

  function rulesFor(meta,generation,mode,eventScope='pvp_rally',{approvedOnly=true}={}){
    return (meta||[]).filter(r=>
      Number(r.generation)===Number(generation)&&
      r.mode===mode&&r.event_scope===eventScope&&
      (!approvedOnly||((r.approval_status||'approved')==='approved'&&r.is_active!==false))
    ).sort((a,b)=>num(b.confidence)-num(a.confidence));
  }
  function bestRule(meta,generation,mode,eventScope='pvp_rally'){return rulesFor(meta,generation,mode,eventScope)[0]||null}
  function heroMap(heroes){const m=new Map();for(const h of heroes||[])m.set(norm(h.name),h);return m}

  function ensureConstraints(rule,ratio){
    let r=ratioOk(ratio)?ratio.map(Number):[50,20,30];
    const c=rule?.constraints||{},names=(rule?.leader_heroes||[]).map(norm);
    const needsLancer=(c.requires_lancer_if_hero||[]).some(n=>names.includes(norm(n)))||num(c.t12_min_lancer)>0;
    if(needsLancer&&r[1]<=0){
      const min=Math.max(1,num(c.t12_min_lancer,1)),take=Math.min(min,r[2]>r[0]?r[2]:r[0]);
      if(r[2]>=r[0]){r[2]-=take;r[1]+=take}else{r[0]-=take;r[1]+=take}
    }
    return r;
  }

  function recommendation(meta,generation,mode,heroes,{allowCrossGeneration=false,eventScope='pvp_rally'}={}){
    const byName=heroMap(heroes),gen=Number(generation);
    let candidates=rulesFor(meta,gen,mode,eventScope);
    if(allowCrossGeneration&&!candidates.length){
      for(let g=gen-1;g>=1;g--)candidates.push(...rulesFor(meta,g,mode,eventScope));
    }
    for(const rule of candidates){
      const resolved=(rule.leader_heroes||[]).map(n=>byName.get(norm(n))).filter(Boolean);
      if(resolved.length!==3)continue;
      const altForms=(rule.alternative_formations||[]).map(f=>{
        const hs=(f.leader_heroes||[]).map(n=>byName.get(norm(n))).filter(Boolean);
        return hs.length===3?{...f,heroes:hs,heroNames:hs.map(h=>h.name),ratio:ensureConstraints(f,f.ratio)}:null;
      }).filter(Boolean);
      const siblingRules=candidates
        .filter(x=>String(x.id)!==String(rule.id))
        .map(x=>{
          const hs=(x.leader_heroes||[]).map(n=>byName.get(norm(n))).filter(Boolean);
          if(hs.length!==3)return null;
          return {
            id:x.id,ruleKey:x.rule_key,heroes:hs,heroNames:hs.map(h=>h.name),
            ratio:ensureConstraints(x,x.primary_ratio),
            joiners:x.joiner_primary||[],
            backupJoinerPool:x.backup_joiner_pool||[],
            confidence:num(x.confidence,.5),
            evidenceStatus:x.evidence_status||'baseline',
            whyGood:x.why_good||'',riskNote:x.risk_note||''
          };
        }).filter(Boolean);

      return {
        id:rule.id,generation:Number(rule.generation),mode,ruleKey:rule.rule_key,
        heroes:resolved,heroNames:resolved.map(h=>h.name),ratio:ensureConstraints(rule,rule.primary_ratio),
        alternatives:(rule.alternative_ratios||[]).filter(ratioOk).map(r=>ensureConstraints(rule,r)),
        alternativeFormations:altForms,
        catalogAlternatives:siblingRules,
        joiners:rule.joiner_primary||[],
        joinerAlternatives:rule.joiner_alternatives||[],
        backupJoinerPool:rule.backup_joiner_pool||[],
        confidence:num(rule.confidence,.5),evidenceStatus:rule.evidence_status||'baseline',
        approvalStatus:rule.approval_status||'approved',note:rule.evidence_note||'',
        whyGood:rule.why_good||'',riskNote:rule.risk_note||'',sourceUrls:rule.source_urls||[],researchMetadata:rule.research_metadata||{},
        constraints:rule.constraints||{},exactGeneration:Number(rule.generation)===gen
      };
    }
    return null;
  }

  function joinerPlan(rec,count,{secondary=false}={}){
    if(!rec||count<=0)return [];
    const first=(rec.joiners||[]).filter(Boolean).slice(0,4);
    const backup=(rec.backupJoinerPool||rec.joinerAlternatives||[]).filter(Boolean);
    const alt=rec.alternativeFormations?.[0]||null;
    const altFirst=(alt?.joiner_primary||first).filter(Boolean);
    const altBackup=(alt?.backup_joiner_pool||backup).filter(Boolean);
    const rows=[];
    for(let i=0;i<count;i++){
      let a,b;
      if(i<4){
        a=first[i%Math.max(1,first.length)]||backup[i%Math.max(1,backup.length)]||null;
        b=(secondary?altFirst:first)[i%Math.max(1,(secondary?altFirst:first).length)]||first[(i+1)%Math.max(1,first.length)]||a;
        if(b===a&&first.length>1)b=first[(i+1)%first.length];
      }else{
        const k=i-4;
        a=backup.length?backup[k%backup.length]:(first.length?first[k%first.length]:null);
        const pool=secondary&&altBackup.length?altBackup:backup;
        b=pool.length?pool[(k+1)%pool.length]:(first.length?first[(k+1)%first.length]:a);
        if(b===a&&pool.length>1)b=pool[(k+2)%pool.length];
      }
      rows.push({index:i,joinFirst:i<4,heroA:a,heroB:b});
    }
    return rows;
  }

  function chooseAlternative(rec,index=0){
    const r=copy(rec);
    if(r.alternativeFormations?.[index]){
      const f=r.alternativeFormations[index];
      r.heroes=f.heroes;r.heroNames=f.heroNames;r.ratio=f.ratio;
      r.joiners=f.joiner_primary||r.joiners;r.backupJoinerPool=f.backup_joiner_pool||r.backupJoinerPool;
      return r;
    }
    if(r.alternatives?.[index])r.ratio=copy(r.alternatives[index]);
    return r;
  }

  function scoreLead(p,{mode='attack'}={}){
    const strength=num(p?._strength)||num(p?.power)/1000;
    const rally=num(p?.rally_capacity)/100,deploy=num(p?.deployment_capacity)/200;
    const gear=typeof p?.hero_gear==='object'&&p.hero_gear?Object.values(p.hero_gear).reduce((s,v)=>s+num(v),0):0;
    return strength+rally+deploy+gear+(mode==='defense'?num(p?._defenseScore):num(p?._attackScore));
  }
  const leadKey=p=>String(p?.id||p?.in_game_name||'');

  function tacticalPurpose(allianceIndex,teamIndex,primaryIndex=0){
    if(allianceIndex===primaryIndex&&teamIndex===0)return'Garrison';
    if(allianceIndex===primaryIndex&&teamIndex===1)return'Handoff';
    return'Counter';
  }

  function petCarrierScore(p){
    const base=scoreLead(p);
    const explicit=num(p?._petScore)||num(p?.pet_score)||num(p?.petScore);
    const tier=norm(p?._tier);
    const tierBonus=tier.includes('max')?base*.18:tier.includes('strong')?base*.09:0;
    return base+explicit*80+tierBonus;
  }

  /*
    Valid two-hour PET windows for a 12:00â17:00 battle are:
      12â14, 13â15, 14â16, 15â17.
    Never create 16â18 and truncate it at 17.
    Edge hours get extra weight so strong carriers can be preserved for both opening and closing.
  */
  function petStartOrder(startHour,endHour,count,petDurationHours=2){
    const last=Math.max(startHour,endHour-petDurationHours);
    const valid=[];
    for(let h=startHour;h<=last;h++)valid.push(h);
    if(!valid.length||count<=0)return [];

    const first=valid[0],closing=valid[valid.length-1];
    const mids=valid.slice(1,-1);
    const pattern=[];

    // First pass: strong opening + strong closing.
    pattern.push(first);
    if(closing!==first)pattern.push(closing);

    // Second edge pass gives depth at both battle edges.
    if(count>pattern.length)pattern.push(first);
    if(count>pattern.length&&closing!==first)pattern.push(closing);

    // Middle relief.
    for(const h of mids)if(pattern.length<count)pattern.push(h);

    // Continue cycling opening -> closing -> middle, never outside valid 2h starts.
    const cycle=[first,...(closing!==first?[closing]:[]),...mids];
    let i=0;
    while(pattern.length<count){
      pattern.push(cycle[i%cycle.length]);
      i++;
    }
    return pattern.slice(0,count);
  }

  function planSchedule({
    rallyLeads=[],
    teamCounts=[],
    primaryIndex=0,
    startHour=12,
    endHour=17,
    primaryTeam1PetRequired=true,
    petDurationHours=2
  }={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>petCarrierScore(b)-petCarrierScore(a));
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    const slots=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        slots.push({allianceIndex:ai,teamIndex:ti,key:`${ai}:${ti}`,purpose:tacticalPurpose(ai,ti,primaryIndex)});
      }
    }
    const garrison=slots.find(s=>s.purpose==='Garrison')||null;
    const handoff=slots.find(s=>s.purpose==='Handoff')||null;
    const counterSlots=slots.filter(s=>s.purpose==='Counter');
    const petEligible=slots.filter(s=>s.purpose!=='Handoff');
    if(!leads.length||!slots.length)return{
      assignments:[],petTimeline:[],petWindows:[],floating:leads,active:[],coverage:[],petCurve:[],hours:[]
    };

    const windows=[];
    const assignedWindows=[];
    const overlapsWindow=(a,b)=>a.start<b.end&&b.start<a.end;
    const canUseSlot=(slot,w)=>!assignedWindows.some(x=>x.slot?.key===slot.key&&overlapsWindow(x,w));
    const addWindow=(lead,start,end,slot,kind='counter')=>{
      if(!lead||!slot||slot.purpose==='Handoff')return null;
      const w={id:`${leadKey(lead)}:${start}:${windows.length}`,lead,start,end,strength:petCarrierScore(lead),slot,kind};
      windows.push(w);assignedWindows.push(w);return w;
    };

    /*
      HARD MAIN T1 RULE
      -----------------
      Main / Primary Team 1 must have PET coverage for every displayed battle hour.
      For a 12:00â17:00 battle with 2h buffs, the clean non-overlapping chain is:
        12â14, 14â16, 16â18
      The last buff legitimately continues past battle end; NEXA only renders the 16â17 portion.
      This is the only place where a 16:00 PET start is structurally required.
    */
    const reservedLeadKeys=new Set();
    if(garrison&&primaryTeam1PetRequired){
      const garrisonStarts=[];
      for(let h=startHour;h<endHour;h+=petDurationHours)garrisonStarts.push(h);
      const needed=Math.min(garrisonStarts.length,leads.length);
      for(let i=0;i<needed;i++){
        const lead=leads[i];
        const s=garrisonStarts[i];
        addWindow(lead,s,s+petDurationHours,garrison,'garrison');
        reservedLeadKeys.add(leadKey(lead));
      }
    }

    const remaining=leads.filter(p=>!reservedLeadKeys.has(leadKey(p)));
    const counterStarts=[];
    const latestCounterStart=Math.max(startHour,endHour-petDurationHours);
    for(let h=startHour;h<=latestCounterStart;h++)counterStarts.push(h);
    const phasePattern=[startHour,latestCounterStart,...counterStarts.filter(h=>h!==startHour&&h!==latestCounterStart)];
    const expandedStarts=[];
    let pi=0;
    while(expandedStarts.length<remaining.length&&phasePattern.length){
      expandedStarts.push(phasePattern[pi%phasePattern.length]);pi++;
    }

    const alliancePetHours=new Map();
    const slotPetHours=new Map();
    const phasePetCount=new Map();
    const touchStats=(slot,start,end)=>{
      const shownHours=hours.filter(h=>h>=start&&h<end).length;
      alliancePetHours.set(slot.allianceIndex,(alliancePetHours.get(slot.allianceIndex)||0)+shownHours);
      slotPetHours.set(slot.key,(slotPetHours.get(slot.key)||0)+shownHours);
      phasePetCount.set(start,(phasePetCount.get(start)||0)+1);
    };
    for(const w of assignedWindows)touchStats(w.slot,w.start,w.end);

    const chooseCounterSlot=(lead,start,end)=>{
      const probe={start,end};
      const candidates=counterSlots.filter(s=>canUseSlot(s,probe));
      return candidates.map(s=>{
        const allianceLoad=alliancePetHours.get(s.allianceIndex)||0;
        const slotLoad=slotPetHours.get(s.key)||0;
        const phaseLoad=phasePetCount.get(start)||0;
        const outsideMain=s.allianceIndex!==primaryIndex?28:8;
        const undercoveredAlliance=Math.max(0,20-allianceLoad*2.2);
        const undercoveredSlot=Math.max(0,14-slotLoad*3.0);
        const phaseBalance=Math.max(0,10-phaseLoad*2.5);
        const strengthFit=petCarrierScore(lead)*0.0008;
        const teamDepth=Math.max(0,4-s.teamIndex);
        return {...s,_score:outsideMain+undercoveredAlliance+undercoveredSlot+phaseBalance+strengthFit+teamDepth};
      }).sort((a,b)=>b._score-a._score)[0]||null;
    };

    // Strategic Counter allocation: opening, closing, then middle; favor under-covered other alliances.
    for(let i=0;i<remaining.length;i++){
      const lead=remaining[i];
      const start=expandedStarts[i]??startHour;
      const end=start+petDurationHours;
      let slot=chooseCounterSlot(lead,start,end);
      if(!slot){
        // If all preferred starts collide, search any legal Counter start before giving up.
        for(const altStart of counterStarts){
          slot=chooseCounterSlot(lead,altStart,altStart+petDurationHours);
          if(slot){
            const w=addWindow(lead,altStart,altStart+petDurationHours,slot,'counter');
            touchStats(slot,w.start,w.end);
            break;
          }
        }
        continue;
      }
      const w=addWindow(lead,start,end,slot,'counter');
      touchStats(slot,w.start,w.end);
    }

    const petTimeline=[];
    for(const w of assignedWindows){
      if(!w.slot||w.slot.purpose==='Handoff')continue;
      for(const hour of hours){
        if(w.start<=hour&&w.end>hour){
          petTimeline.push({...w.slot,lead:w.lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,windowStart:`${w.start}:00`,windowEnd:`${w.end}:00`,petWindowId:w.id});
        }
      }
    }

    // Fill all lanes hour-by-hour. PET rows are authoritative and pinned first.
    const assignments=[],previousBySlot=new Map(),streakBySlot=new Map(),useCount=new Map();
    for(const hour of hours){
      const petNow=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      const usedLeadKeys=new Set();
      for(const x of petNow){
        const lk=leadKey(x.lead);
        if(usedLeadKeys.has(lk))continue;
        assignments.push({...x});usedLeadKeys.add(lk);
        const slotKey=`${x.allianceIndex}:${x.teamIndex}`;
        const oldPrev=previousBySlot.get(slotKey);
        const oldStreak=streakBySlot.get(slotKey)||0;
        streakBySlot.set(slotKey,oldPrev&&leadKey(oldPrev)===lk?oldStreak+1:1);
        previousBySlot.set(slotKey,x.lead);
        useCount.set(lk,(useCount.get(lk)||0)+1);
      }

      for(const s of slots){
        if(assignments.some(a=>a.allianceIndex===s.allianceIndex&&a.teamIndex===s.teamIndex&&Number(a.start.slice(0,2))===hour))continue;
        const prev=previousBySlot.get(s.key);
        const petAdjacentHere=(p)=>{
          const lk=leadKey(p);
          return assignedWindows.some(w=>{
            if(leadKey(w.lead)!==lk||w.slot?.key!==s.key)return false;
            return Number(w.end)===hour||Number(w.start)===hour+1;
          });
        };
        const baseChoices=leads.filter(p=>!usedLeadKeys.has(leadKey(p))&&!petAdjacentHere(p));
        const currentStreak=streakBySlot.get(s.key)||0;
        const rotatedChoices=(currentStreak>=2&&prev)
          ? baseChoices.filter(p=>leadKey(p)!==leadKey(prev))
          : baseChoices;
        const scoringPool=rotatedChoices.length?rotatedChoices:baseChoices;
        const choices=scoringPool.map(p=>{
          const sameAsPrev=prev&&leadKey(prev)===leadKey(p);
          // Strategic continuity: a second hour in the same Team is useful when it improves
          // stability, but after 2 consecutive hours rotate if any legal alternative exists.
          const continuity=sameAsPrev?34:0;
          const usagePenalty=(useCount.get(leadKey(p))||0)*5;
          let purposeBonus=0;
          if(s.purpose==='Garrison')purposeBonus=scoreLead(p)*.024;
          else if(s.purpose==='Counter')purposeBonus=scoreLead(p)*.010;
          else purposeBonus=-petCarrierScore(p)*.012;
          return {p,score:scoreLead(p)+continuity+purposeBonus-usagePenalty};
        }).sort((a,b)=>b.score-a.score);
        const chosen=choices[0]?.p;
        if(!chosen)continue;
        assignments.push({...s,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false});
        usedLeadKeys.add(leadKey(chosen));
        const priorLead=previousBySlot.get(s.key);
        const priorStreak=streakBySlot.get(s.key)||0;
        streakBySlot.set(s.key,priorLead&&leadKey(priorLead)===leadKey(chosen)?priorStreak+1:1);
        previousBySlot.set(s.key,chosen);
        useCount.set(leadKey(chosen),(useCount.get(leadKey(chosen))||0)+1);
      }
    }

    // Absolute Handoff safety.
    for(const a of assignments)if(a.purpose==='Handoff')a.petsActive=false;

    const petLeadKeys=new Set(assignments.filter(a=>a.petsActive).map(a=>leadKey(a.lead)));
    const active=leads.filter(p=>petLeadKeys.has(leadKey(p)));
    const floating=leads.filter(p=>!petLeadKeys.has(leadKey(p)));

    const coverage=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      const teamPetHours={};
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        const purpose=tacticalPurpose(ai,ti,primaryIndex);
        teamPetHours[ti]=purpose==='Handoff'?0:hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      }
      const complete=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)).every(Boolean));
      coverage.push({allianceIndex:ai,complete,totalHours:hours.length,teamPetHours,team1PetHours:teamPetHours[0]||0});
    }

    const petWindows=assignedWindows.filter(w=>w.slot&&w.slot.purpose!=='Handoff').map(w=>({lead:w.lead,start:`${w.start}:00`,end:`${w.end}:00`,allianceIndex:w.slot.allianceIndex,teamIndex:w.slot.teamIndex,purpose:w.slot.purpose,kind:w.kind}));

    const garrisonCoverageOk=!garrison||!primaryTeam1PetRequired||hours.every(h=>assignments.some(a=>a.allianceIndex===garrison.allianceIndex&&a.teamIndex===garrison.teamIndex&&a.petsActive&&Number(a.start.slice(0,2))===h));

    return {
      assignments,
      petTimeline:assignments.filter(x=>x.petsActive&&x.purpose!=='Handoff'),
      petWindows,
      floating,
      active,
      coverage,
      garrisonCoverageOk,
      petCurve:hours.map(h=>assignments.filter(x=>x.petsActive&&Number(x.start.slice(0,2))===h).length),
      hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])
    };
  }

  function explainConfidence(rec){
    if(!rec)return'No approved formation for this generation';
    return `${rec.approvalStatus||'approved'} â¢ ${Math.round(num(rec.confidence,.5)*100)}% confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'2.1',loadMeta,rulesFor,bestRule,recommendation,joinerPlan,chooseAlternative,ensureConstraints,
    scoreLead,tacticalPurpose,planSchedule,explainConfidence
  };
})();
