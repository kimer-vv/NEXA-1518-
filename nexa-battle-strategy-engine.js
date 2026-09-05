/* NEXA Battle Strategy Engine v1.7
   Shared battle brain for SvS / FDT / TAL / Matchup Lab.
   Approved formation catalog + resilient Join First/backup pools + FULL-USE purpose-aware PET scheduler.
   v1.7: use every available Rally Lead as a PET carrier when a valid PET lane/window exists.
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
        slots.push({
          allianceIndex:ai,
          teamIndex:ti,
          key:`${ai}:${ti}`,
          purpose:tacticalPurpose(ai,ti,primaryIndex)
        });
      }
    }
    const petEligible=slots.filter(s=>s.purpose!=='Handoff');
    const counterSlots=slots.filter(s=>s.purpose==='Counter');
    if(!leads.length||!slots.length)return{
      assignments:[],petTimeline:[],petWindows:[],floating:leads,active:[],coverage:[],petCurve:[],hours:[]
    };

    /*
      v1.7 FULL-USE PET RULE
      ---------------------
      - Every Rally Lead gets one PET window whenever the graph has a legal lane/time for it.
      - Reserve means WHEN the RL activates, never "leave the PET unused."
      - PET windows are always continuous for petDurationHours on ONE Team.
      - Primary Team 2 Handoff is never PET-eligible.
      - Legal starts for 12â17 with 2h duration are 12,13,14,15. Never 16â18 truncated.
    */
    const desiredWindows=petEligible.length?leads.length:0;
    const starts=petStartOrder(startHour,endHour,desiredWindows,petDurationHours);
    const windows=leads.slice(0,desiredWindows).map((lead,i)=>({
      id:`${leadKey(lead)}:${starts[i]}:${i}`,
      lead,
      start:starts[i],
      end:starts[i]+petDurationHours,
      strength:petCarrierScore(lead),
      slot:null
    }));

    const overlapsWindow=(a,b)=>a.start<b.end&&b.start<a.end;
    const assignedWindows=[];

    const canUseSlot=(slot,w)=>!assignedWindows.some(x=>
      x.slot?.key===slot.key && overlapsWindow(x,w)
    );

    const slotLoad=(slot)=>assignedWindows
      .filter(x=>x.slot?.key===slot.key)
      .reduce((sum,x)=>sum+(x.end-x.start),0);

    const slotWindowCount=(slot)=>assignedWindows.filter(x=>x.slot?.key===slot.key).length;

    const chooseSlot=(w,candidates)=>{
      return candidates
        .filter(s=>s.purpose!=='Handoff'&&canUseSlot(s,w))
        .map(s=>{
          const load=slotLoad(s);
          const activations=slotWindowCount(s);
          const otherAlliance=s.allianceIndex!==primaryIndex?18:0;
          const primaryCounter=s.allianceIndex===primaryIndex&&s.teamIndex>=2?10:0;
          const edge=(w.start===startHour||w.end===endHour)?14:0;
          const depthTie=Math.max(0,4-s.teamIndex);
          return {...s,_score:180+otherAlliance+primaryCounter+edge+depthTie-load*28-activations*20};
        })
        .sort((a,b)=>b._score-a._score)[0]||null;
    };

    /*
      Garrison gets strongest opening and strongest closing carriers when possible.
      These windows do not overlap: 12â14 and 15â17.
      Middle coverage is added only when it can remain continuous without colliding.
    */
    const garrison=slots.find(s=>s.purpose==='Garrison');
    if(garrison&&primaryTeam1PetRequired){
      const opening=windows.find(w=>!w.slot&&w.start===startHour);
      if(opening&&canUseSlot(garrison,opening)){
        opening.slot=garrison;assignedWindows.push(opening);
      }

      const closingCandidates=windows
        .filter(w=>!w.slot&&w.end===endHour)
        .sort((a,b)=>b.strength-a.strength);
      const closing=closingCandidates.find(w=>canUseSlot(garrison,w));
      if(closing){
        closing.slot=garrison;assignedWindows.push(closing);
      }

      const middleCandidates=windows
        .filter(w=>!w.slot&&w.start>startHour&&w.end<endHour)
        .sort((a,b)=>b.strength-a.strength);
      const middle=middleCandidates.find(w=>canUseSlot(garrison,w));
      if(middle){
        middle.slot=garrison;assignedWindows.push(middle);
      }
    }

    /*
      All remaining PET windows prefer Counter lanes.
      Each entire 2h window is placed as a unit; we never relocate only one hour.
    */
    for(const w of windows.filter(x=>!x.slot)){
      let s=chooseSlot(w,counterSlots);
      if(!s)s=chooseSlot(w,petEligible);
      if(!s)continue; // mathematically no legal non-overlapping lane remains
      w.slot=s;
      assignedWindows.push(w);
    }

    const petTimeline=[];
    for(const w of assignedWindows){
      if(!w.slot||w.slot.purpose==='Handoff')continue;
      for(const hour of hours){
        if(w.start<=hour&&w.end>hour){
          petTimeline.push({
            ...w.slot,
            lead:w.lead,
            start:`${hour}:00`,
            end:`${hour+1}:00`,
            petsActive:true,
            windowStart:`${w.start}:00`,
            windowEnd:`${w.end}:00`,
            petWindowId:w.id
          });
        }
      }
    }

    // Fill all lanes hour by hour. PET carriers are pinned to the same Team for their full PET window.
    const assignments=[],previousBySlot=new Map(),useCount=new Map();
    for(const hour of hours){
      const petNow=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      const usedLeadKeys=new Set();

      for(const x of petNow){
        const lk=leadKey(x.lead);
        if(usedLeadKeys.has(lk))continue;
        assignments.push({...x});
        usedLeadKeys.add(lk);
        previousBySlot.set(`${x.allianceIndex}:${x.teamIndex}`,x.lead);
        useCount.set(lk,(useCount.get(lk)||0)+1);
      }

      for(const s of slots){
        if(assignments.some(a=>a.allianceIndex===s.allianceIndex&&a.teamIndex===s.teamIndex&&Number(a.start.slice(0,2))===hour))continue;
        const prev=previousBySlot.get(s.key);
        const choices=leads.filter(p=>!usedLeadKeys.has(leadKey(p))).map(p=>{
          const continuity=prev&&leadKey(prev)===leadKey(p)?20:0;
          const usagePenalty=(useCount.get(leadKey(p))||0)*5;
          let purposeBonus=0;
          if(s.purpose==='Garrison')purposeBonus=scoreLead(p)*.024;
          else if(s.purpose==='Counter')purposeBonus=scoreLead(p)*.010;
          else purposeBonus=-petCarrierScore(p)*.012;
          return {p,score:scoreLead(p)+continuity+purposeBonus-usagePenalty};
        }).sort((a,b)=>b.score-a.score);
        const chosen=choices[0]?.p;
        if(!chosen)continue;
        assignments.push({
          ...s,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false
        });
        usedLeadKeys.add(leadKey(chosen));
        previousBySlot.set(s.key,chosen);
        useCount.set(leadKey(chosen),(useCount.get(leadKey(chosen))||0)+1);
      }
    }

    // Absolute safety: Handoff never carries PETS.
    for(const a of assignments)if(a.purpose==='Handoff')a.petsActive=false;

    const petLeadKeys=new Set(assignments.filter(a=>a.petsActive).map(a=>leadKey(a.lead)));
    const active=leads.filter(p=>petLeadKeys.has(leadKey(p)));
    const floating=leads.filter(p=>!petLeadKeys.has(leadKey(p)));

    const coverage=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      const teamPetHours={};
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        const purpose=tacticalPurpose(ai,ti,primaryIndex);
        teamPetHours[ti]=purpose==='Handoff'?0:hours.filter(h=>
          assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.petsActive&&Number(a.start.slice(0,2))===h)
        ).length;
      }
      const complete=hours.every(h=>
        Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>
          assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)
        ).every(Boolean)
      );
      coverage.push({
        allianceIndex:ai,complete,totalHours:hours.length,teamPetHours,team1PetHours:teamPetHours[0]||0
      });
    }

    const petWindows=assignedWindows
      .filter(w=>w.slot&&w.slot.purpose!=='Handoff')
      .map(w=>({
        lead:w.lead,
        start:`${w.start}:00`,
        end:`${w.end}:00`,
        allianceIndex:w.slot.allianceIndex,
        teamIndex:w.slot.teamIndex,
        purpose:w.slot.purpose
      }));

    return {
      assignments,
      petTimeline:assignments.filter(x=>x.petsActive&&x.purpose!=='Handoff'),
      petWindows,
      floating,
      active,
      coverage,
      petCurve:hours.map(h=>assignments.filter(x=>x.petsActive&&Number(x.start.slice(0,2))===h).length),
      hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])
    };
  }

  function explainConfidence(rec){
    if(!rec)return'No approved formation for this generation';
    return `${rec.approvalStatus||'approved'} â¢ ${Math.round(num(rec.confidence,.5)*100)}% confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.7',loadMeta,rulesFor,bestRule,recommendation,joinerPlan,chooseAlternative,ensureConstraints,
    scoreLead,tacticalPurpose,planSchedule,explainConfidence
  };
})();
