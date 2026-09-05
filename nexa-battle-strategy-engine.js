/* NEXA Battle Strategy Engine v1.4
   Shared battle brain for SvS / FDT / TAL / Matchup Lab.
   Approved formation catalog + resilient Join First/backup pools + purpose-aware PET scheduler.
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
      .select('id,generation,event_scope,mode,rule_key,leader_heroes,primary_ratio,alternative_ratios,alternative_formations,joiner_primary,joiner_alternatives,backup_joiner_pool,constraints,confidence,evidence_status,evidence_note,why_good,risk_note,source_urls,source_count,independent_source_count,approval_status,verified_at,last_researched_at,is_active,is_manual')
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
      return {
        id:rule.id,generation:Number(rule.generation),mode,ruleKey:rule.rule_key,
        heroes:resolved,heroNames:resolved.map(h=>h.name),ratio:ensureConstraints(rule,rule.primary_ratio),
        alternatives:(rule.alternative_ratios||[]).filter(ratioOk).map(r=>ensureConstraints(rule,r)),
        alternativeFormations:altForms,
        joiners:rule.joiner_primary||[],
        joinerAlternatives:rule.joiner_alternatives||[],
        backupJoinerPool:rule.backup_joiner_pool||[],
        confidence:num(rule.confidence,.5),evidenceStatus:rule.evidence_status||'baseline',
        approvalStatus:rule.approval_status||'approved',note:rule.evidence_note||'',
        whyGood:rule.why_good||'',riskNote:rule.risk_note||'',sourceUrls:rule.source_urls||[],
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

  function desiredPetCurve(leadCount,totalTeams){
    const cap=Math.max(1,Math.min(Number(totalTeams)||1,Number(leadCount)||1));
    let curve;
    if(leadCount>=15)curve=[4,6,5,6,4];
    else if(leadCount>=12)curve=[3,5,4,5,3];
    else if(leadCount>=10)curve=[3,4,4,4,3];
    else if(leadCount>=8)curve=[2,4,3,4,2];
    else if(leadCount>=6)curve=[2,3,3,3,2];
    else curve=[1,2,2,2,1];
    return curve.map(x=>Math.min(cap,x));
  }

  function planSchedule({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,primaryTeam1PetRequired=true}={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLead(b)-scoreLead(a));
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    const totalTeams=teamCounts.reduce((s,n)=>s+Number(n||0),0);
    if(!leads.length||!totalTeams)return{assignments:[],petTimeline:[],petWindows:[],floating:leads,active:[],coverage:[],petCurve:[],hours:[]};

    const curve=desiredPetCurve(leads.length,totalTeams);
    const petTimeline=[],assignments=[],petHours=new Map(),prevSlotByLead=new Map();
    const slots=[];
    for(let ai=0;ai<teamCounts.length;ai++)for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
      slots.push({allianceIndex:ai,teamIndex:ti,key:`${ai}:${ti}`,purpose:tacticalPurpose(ai,ti,primaryIndex)});
    }

    // PET assignment is recalculated hour-by-hour. Handoff is a hard exclusion.
    for(let hi=0;hi<hours.length;hi++){
      const hour=hours[hi],petTarget=Math.min(curve[hi]||1,leads.length);
      const petLeads=leads.slice(0,petTarget);
      const usedSlots=new Set();

      // Garrison first, but only one PET lane is reserved there.
      const garrison=slots.find(s=>s.purpose==='Garrison');
      if(garrison&&petLeads[0]){
        const x={...garrison,lead:petLeads[0],start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true};
        petTimeline.push(x);assignments.push(x);usedSlots.add(garrison.key);
        petHours.set(garrison.key,(petHours.get(garrison.key)||0)+1);
        prevSlotByLead.set(leadKey(petLeads[0]),garrison.key);
      }

      for(const lead of petLeads.slice(1)){
        const candidates=slots.filter(s=>s.purpose==='Counter'&&!usedSlots.has(s.key)).map(s=>{
          const covered=petHours.get(s.key)||0;
          const continuity=prevSlotByLead.get(leadKey(lead))===s.key?12:0;
          const otherAlliance=s.allianceIndex!==primaryIndex?18:0;
          const openingClosing=(hour===startHour||hour===endHour-1)?12:0;
          const middle=(hour>startHour&&hour<endHour-1)?8:0;
          const teamDepth=Math.max(0,22-s.teamIndex*3);
          return {...s,score:220+otherAlliance+openingClosing+middle+teamDepth+continuity-covered*30};
        }).sort((a,b)=>b.score-a.score);
        const s=candidates[0];if(!s)continue;
        const x={...s,lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true};
        petTimeline.push(x);assignments.push(x);usedSlots.add(s.key);
        petHours.set(s.key,(petHours.get(s.key)||0)+1);prevSlotByLead.set(leadKey(lead),s.key);
      }

      // Fill every remaining lane with non-PET leads, including Handoff.
      const usedLeads=new Set(assignments.filter(a=>a.start===`${hour}:00`).map(a=>leadKey(a.lead)));
      for(const s of slots){
        if(usedSlots.has(s.key))continue;
        const avail=leads.filter(p=>!usedLeads.has(leadKey(p))).map(p=>{
          const continuity=prevSlotByLead.get(leadKey(p))===s.key?16:0;
          let purposeBonus=0;
          if(s.purpose==='Garrison')purposeBonus=scoreLead(p)*.025;
          else if(s.purpose==='Counter')purposeBonus=scoreLead(p)*.01;
          else purposeBonus=-scoreLead(p)*.01; // keep top PET-capable whales available for real pressure
          return {p,score:scoreLead(p)+continuity+purposeBonus};
        }).sort((a,b)=>b.score-a.score);
        const chosen=avail[0]?.p;if(!chosen)continue;
        const x={...s,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false};
        assignments.push(x);usedLeads.add(leadKey(chosen));prevSlotByLead.set(leadKey(chosen),s.key);
      }
    }

    // Hard safety: Handoff can never be PET ACTIVE.
    for(const a of assignments)if(a.purpose==='Handoff')a.petsActive=false;
    for(let i=petTimeline.length-1;i>=0;i--)if(petTimeline[i].purpose==='Handoff')petTimeline.splice(i,1);

    const used=new Set(assignments.map(a=>leadKey(a.lead)));
    const active=leads.filter(p=>used.has(leadKey(p))),floating=leads.filter(p=>!used.has(leadKey(p)));
    const coverage=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      const teamPetHours={};
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        const key=`${ai}:${ti}`,purpose=tacticalPurpose(ai,ti,primaryIndex);
        teamPetHours[ti]=hours.filter(h=>petTimeline.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.start===`${h}:00`)).length;
        if(purpose==='Handoff')teamPetHours[ti]=0;
      }
      const complete=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.start===`${h}:00`)).every(Boolean));
      coverage.push({allianceIndex:ai,complete,totalHours:hours.length,teamPetHours,team1PetHours:teamPetHours[0]||0});
    }
    return{assignments,petTimeline,petWindows:[],floating,active,coverage,petCurve:curve,hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])};
  }

  function explainConfidence(rec){
    if(!rec)return'No approved formation for this generation';
    return `${rec.approvalStatus||'approved'} â¢ ${Math.round(num(rec.confidence,.5)*100)}% confidence`;
  }

  window.NexaBattleStrategyEngine={
    version:'1.4',loadMeta,rulesFor,bestRule,recommendation,joinerPlan,chooseAlternative,ensureConstraints,
    scoreLead,tacticalPurpose,planSchedule,explainConfidence
  };
})();