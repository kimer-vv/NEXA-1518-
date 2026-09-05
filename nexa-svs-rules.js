/* NEXA SvS Rules v1.3 — PET priority rebalance + primary-only handoff + canonical Join First + compact formation UI */
(()=> {
  'use strict';

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

  const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
  const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
  const sb=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
  let healing=false,lastHealed='',watchTimer=null;

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
    .layout-sheet .hero-line b:first-child{color:#dfe4ef!important;opacity:.88}
    .layout-sheet .layout-row{color:#e7eaf2}
    .joiner-ratio-grid{display:none!important}
    .rl-formations-group h4{font-size:12px!important;letter-spacing:.09em}
    .rl-formation-card .f-ratio,
    .rl-formation-card .rl-formation-heroes{display:none!important}
    .nexa-formation-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
    .nexa-formation-col{display:grid;justify-items:center;gap:5px;min-width:0}
    .nexa-formation-pct{font-size:22px;font-weight:950;line-height:1;color:#fff}
    .nexa-formation-col img{width:46px;height:46px;border-radius:9px;object-fit:cover;border:1px solid rgba(255,255,255,.15)}
    .nexa-formation-col b{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-align:center}
    .nexa-formation-note{margin-top:8px;color:#98a6c7;font-size:9px;line-height:1.35;text-align:center}
  `;


  function scoreLeadLocal(p){
    const n=v=>Number.isFinite(Number(v))?Number(v):0;
    const strength=n(p?._strength)||n(p?.power)/1000;
    const rally=n(p?.rally_capacity)/100;
    const deploy=n(p?.deployment_capacity)/200;
    const gear=typeof p?.hero_gear==='object'&&p.hero_gear?Object.values(p.hero_gear).reduce((s,v)=>s+n(v),0):0;
    return strength+rally+deploy+gear;
  }
  function leadKeyLocal(p){return String(p?.id||p?.in_game_name||'')}
  function desiredPetCurveV13(leadCount,totalTeams){
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
  function activationStartsV13(curve,startHour=12){
    const counts={};
    for(let i=0;i<curve.length;i++){
      const h=startHour+i,prev=i>0?(counts[h-1]||0):0;
      counts[h]=Math.max(0,curve[i]-prev);
    }
    return counts;
  }
  function strengthStartOrderV13(startCounts){
    const left={...startCounts},order=[],priority=[12,16,13,15,14,12,16,13,15,14];
    while(Object.values(left).some(n=>n>0)){
      let added=false;
      for(const h of priority){
        if((left[h]||0)>0){order.push(h);left[h]--;added=true}
      }
      if(!added)break;
    }
    return order;
  }
  function slotCandidatesV13(teamCounts,primaryIndex,petHoursBySlot,hour){
    const out=[];
    for(let ai=0;ai<teamCounts.length;ai++){
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        const key=`${ai}:${ti}`,covered=petHoursBySlot.get(key)||0;
        const isPrimary=ai===primaryIndex;
        const isGarrison=isPrimary&&ti===0;
        const isHandoff=isPrimary&&ti===1&&Number(teamCounts[ai]||0)>1;
        const isCounter=!isGarrison&&!isHandoff;
        let priority;
        if(isGarrison)priority=1000;
        else if(isHandoff)priority=28;
        else if(ai!==primaryIndex&&ti===0)priority=255;
        else if(ai!==primaryIndex&&ti===1)priority=235;
        else if(ai!==primaryIndex)priority=210-Math.min(50,ti*8);
        else priority=205-Math.min(45,Math.max(0,ti-2)*8);
        if(isCounter&&(hour===12||hour===16))priority+=22;
        if(isCounter&&hour>=13&&hour<=15)priority+=12;
        out.push({allianceIndex:ai,teamIndex:ti,key,priority,covered,isGarrison,isHandoff,isCounter});
      }
    }
    return out;
  }
  function planScheduleV13({rallyLeads=[],teamCounts=[],primaryIndex=0,startHour=12,endHour=17,primaryTeam1PetRequired=true}={}){
    const leads=[...(rallyLeads||[])].sort((a,b)=>scoreLeadLocal(b)-scoreLeadLocal(a));
    const allianceCount=teamCounts.length,totalTeams=teamCounts.reduce((s,n)=>s+Number(n||0),0);
    const hours=[];for(let h=startHour;h<endHour;h++)hours.push(h);
    if(!leads.length||!totalTeams)return {assignments:[],petWindows:[],petTimeline:[],floating:leads,active:[],coverage:[],hours:[]};

    const curve=desiredPetCurveV13(leads.length,totalTeams);
    const startCounts=activationStartsV13(curve,startHour);
    for(const h of [12,14,16])startCounts[h]=Math.max(1,startCounts[h]||0);

    let totalStarts=Object.values(startCounts).reduce((s,n)=>s+n,0);
    while(totalStarts>leads.length){
      const removable=[15,13,14,12,16].find(h=>(startCounts[h]||0)>((h===12||h===14||h===16)?1:0));
      if(removable==null)break;
      startCounts[removable]--;totalStarts--;
    }

    const startOrder=strengthStartOrderV13(startCounts),windows=[];
    leads.slice(0,startOrder.length).forEach((lead,i)=>{
      const start=startOrder[i];windows.push({lead,start,end:start+2,id:`${leadKeyLocal(lead)}:${start}`});
    });

    const petTimeline=[],petHoursBySlot=new Map(),windowSlotHistory=new Map();
    for(const hour of hours){
      const activeWindows=windows.filter(w=>w.start<=hour&&w.end>hour),usedSlots=new Set();
      const anchorWindow=activeWindows.slice().sort((a,b)=>scoreLeadLocal(b.lead)-scoreLeadLocal(a.lead))[0];
      if(anchorWindow&&teamCounts[primaryIndex]>0){
        const entry={allianceIndex:primaryIndex,teamIndex:0,lead:anchorWindow.lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,windowStart:`${anchorWindow.start}:00`,windowEnd:`${anchorWindow.end}:00`};
        petTimeline.push(entry);usedSlots.add(`${primaryIndex}:0`);
        petHoursBySlot.set(`${primaryIndex}:0`,(petHoursBySlot.get(`${primaryIndex}:0`)||0)+1);
        const hist=windowSlotHistory.get(anchorWindow.id)||[];hist.push({hour,allianceIndex:primaryIndex,teamIndex:0});windowSlotHistory.set(anchorWindow.id,hist);
      }

      for(const w of activeWindows){
        if(anchorWindow&&w.id===anchorWindow.id)continue;
        const hist=windowSlotHistory.get(w.id)||[],prev=hist.find(x=>x.hour===hour-1);
        const slots=slotCandidatesV13(teamCounts,primaryIndex,petHoursBySlot,hour)
          .filter(s=>!usedSlots.has(s.key))
          .map(s=>{
            const continuity=prev&&prev.allianceIndex===s.allianceIndex&&prev.teamIndex===s.teamIndex?18:0;
            const balancePenalty=s.covered*24;
            const counterAllianceBonus=s.isCounter&&s.allianceIndex!==primaryIndex?14:0;
            const handoffPenalty=s.isHandoff?36:0;
            return {...s,score:s.priority+continuity+counterAllianceBonus-balancePenalty-handoffPenalty};
          }).sort((a,b)=>b.score-a.score);
        const slot=slots[0];if(!slot)continue;
        const entry={allianceIndex:slot.allianceIndex,teamIndex:slot.teamIndex,lead:w.lead,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:true,windowStart:`${w.start}:00`,windowEnd:`${w.end}:00`};
        petTimeline.push(entry);usedSlots.add(slot.key);
        petHoursBySlot.set(slot.key,(petHoursBySlot.get(slot.key)||0)+1);
        hist.push({hour,allianceIndex:slot.allianceIndex,teamIndex:slot.teamIndex});windowSlotHistory.set(w.id,hist);
      }
    }

    const assignments=[],previousBySlot=new Map(),useCount=new Map();
    for(const hour of hours){
      const usedLeadKeys=new Set(),petNow=petTimeline.filter(x=>Number(x.start.slice(0,2))===hour);
      for(const x of petNow){
        assignments.push({...x});usedLeadKeys.add(leadKeyLocal(x.lead));
        previousBySlot.set(`${x.allianceIndex}:${x.teamIndex}`,x.lead);
        useCount.set(leadKeyLocal(x.lead),(useCount.get(leadKeyLocal(x.lead))||0)+1);
      }
      for(let ai=0;ai<allianceCount;ai++){
        for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
          if(assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===hour))continue;
          const slotKey=`${ai}:${ti}`,prev=previousBySlot.get(slotKey);
          const isHandoff=ai===primaryIndex&&ti===1&&Number(teamCounts[ai]||0)>1;
          const available=leads.filter(p=>!usedLeadKeys.has(leadKeyLocal(p))).map(p=>{
            const continuity=prev&&leadKeyLocal(prev)===leadKeyLocal(p)?18:0;
            const freshBonus=Math.max(0,30-(useCount.get(leadKeyLocal(p))||0)*5);
            const garrisonStrength=(ai===primaryIndex&&ti===0)?scoreLeadLocal(p)*.02:0;
            const counterStrength=!isHandoff?scoreLeadLocal(p)*.006:0;
            const handoffReserve=isHandoff?-scoreLeadLocal(p)*.004:0;
            return {p,score:scoreLeadLocal(p)+continuity+freshBonus+garrisonStrength+counterStrength+handoffReserve};
          }).sort((a,b)=>b.score-a.score);
          const chosen=available[0]?.p;if(!chosen)continue;
          assignments.push({allianceIndex:ai,teamIndex:ti,lead:chosen,start:`${hour}:00`,end:`${hour+1}:00`,petsActive:false});
          usedLeadKeys.add(leadKeyLocal(chosen));previousBySlot.set(slotKey,chosen);
          useCount.set(leadKeyLocal(chosen),(useCount.get(leadKeyLocal(chosen))||0)+1);
        }
      }
    }

    const usedIds=new Set(assignments.map(a=>leadKeyLocal(a.lead)));
    const active=leads.filter(p=>usedIds.has(leadKeyLocal(p))),floating=leads.filter(p=>!usedIds.has(leadKeyLocal(p))),coverage=[];
    for(let ai=0;ai<allianceCount;ai++){
      const teamPetHours={};
      for(let ti=0;ti<Number(teamCounts[ai]||0);ti++){
        teamPetHours[ti]=hours.filter(h=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&a.petsActive&&Number(a.start.slice(0,2))===h)).length;
      }
      const fullTeams=hours.every(h=>Array.from({length:Number(teamCounts[ai]||0)},(_,ti)=>assignments.some(a=>a.allianceIndex===ai&&a.teamIndex===ti&&Number(a.start.slice(0,2))===h)).every(Boolean));
      const primaryAnchorOk=ai!==primaryIndex||!primaryTeam1PetRequired||teamPetHours[0]===hours.length;
      coverage.push({allianceIndex:ai,complete:fullTeams&&primaryAnchorOk,totalHours:hours.length,teamPetHours,team1PetHours:teamPetHours[0]||0});
    }
    const petWindows=windows.map(w=>({lead:w.lead,start:`${w.start}:00`,end:`${w.end}:00`,movements:(windowSlotHistory.get(w.id)||[]).map(x=>({hour:x.hour,allianceIndex:x.allianceIndex,teamIndex:x.teamIndex}))}));
    return {assignments,petWindows,petTimeline,floating,active,coverage,petCurve:curve,startCounts,hours:hours.map(h=>[`${h}:00`,`${h+1}:00`])};
  }

  function installSchedulerOverride(){
    if(!window.NexaBattleStrategyEngine?.planSchedule)return;
    if(window.NexaBattleStrategyEngine.version==='1.3.2'&&!window.NexaBattleStrategyEngine.__svsV13){
      window.NexaBattleStrategyEngine.planSchedule=planScheduleV13;
      window.NexaBattleStrategyEngine.__svsV13=true;
    }
  }

  async function normalizePetPurposes(strategyId){
    if(!sb||!strategyId)return;
    const g=await graphFor(strategyId);
    const primaryId=(await sb.from('svs_strategies').select('primary_alliance_id').eq('id',strategyId).single()).data?.primary_alliance_id;
    const primary=g.alliances.find(a=>Number(a.alliance_id)===Number(primaryId))||g.alliances.slice().sort((a,b)=>a.sort_order-b.sort_order)[0];
    if(!primary)return;
    const primaryTeams=g.teams.filter(t=>String(t.strategy_alliance_id)===String(primary.id)).sort((a,b)=>a.sort_order-b.sort_order);
    const teamMeta=new Map();
    for(const a of g.alliances){
      const ts=g.teams.filter(t=>String(t.strategy_alliance_id)===String(a.id)).sort((x,y)=>x.sort_order-y.sort_order);
      ts.forEach((t,i)=>{
        let purpose='Counter';
        if(String(a.id)===String(primary.id)&&i===0)purpose='Garrison';
        else if(String(a.id)===String(primary.id)&&i===1)purpose='Handoff';
        teamMeta.set(String(t.id),purpose);
      });
    }
    for(const row of g.petRows){
      const purpose=teamMeta.get(String(row.source_team_id))||'Counter';
      if(row.purpose!==purpose)await sb.from('svs_pet_schedule_rows').update({purpose}).eq('id',row.id);
    }
  }

  async function canonicalizeJoinFirst(strategyId){
    if(!sb||!strategyId)return;
    const g=await graphFor(strategyId);
    if(!g.joiners.length)return;
    const {data:heroRows}=await sb.from('nexa_library_items').select('id,name').eq('item_type','hero').eq('is_active',true);
    const heroId=new Map((heroRows||[]).map(h=>[String(h.name).toLowerCase(),h.id]));
    const attack=['Norah','Norah','Hendrik','Patrick'],defense=['Renee','Mia','Patrick','Hendrik'];
    const attackB=['Hendrik','Patrick','Norah','Norah'],defenseB=['Mia','Renee','Renee','Renee'];
    for(const t of g.teams){
      const rows=g.joiners.filter(j=>String(j.team_id)===String(t.id)).sort((a,b)=>a.sort_order-b.sort_order).slice(0,4);
      for(let i=0;i<rows.length;i++){
        const j=rows[i],patch={
          join_first:true,
          attack_a_hero_id:heroId.get(attack[i].toLowerCase())||j.attack_a_hero_id,
          attack_b_hero_id:heroId.get(attackB[i].toLowerCase())||j.attack_b_hero_id,
          defense_a_hero_id:heroId.get(defense[i].toLowerCase())||j.defense_a_hero_id,
          defense_b_hero_id:heroId.get(defenseB[i].toLowerCase())||j.defense_b_hero_id
        };
        await sb.from('svs_strategy_joiners').update(patch).eq('id',j.id);
      }
    }
  }

  function clarifyFormationUI(){
    document.querySelectorAll('.rl-formations-group.attack h4').forEach(x=>x.textContent='⚔ ATTACK FORMATION');
    document.querySelectorAll('.rl-formations-group.defense h4').forEach(x=>x.textContent='🛡 DEFENSIVE FORMATION');
    document.querySelectorAll('.rl-formation-card').forEach(card=>{
      if(card.dataset.nexaCompact==='1')return;
      const ratio=String(card.querySelector('.f-ratio')?.textContent||'').match(/\d+/g)||[];
      const heroes=[...card.querySelectorAll('.rl-formation-hero')];
      if(ratio.length<3||heroes.length<3)return;
      const grid=document.createElement('div');grid.className='nexa-formation-grid';
      heroes.slice(0,3).forEach((hero,i)=>{
        const col=document.createElement('div');col.className='nexa-formation-col';
        const pct=document.createElement('div');pct.className='nexa-formation-pct';pct.textContent=ratio[i];
        col.appendChild(pct);
        const img=hero.querySelector('img')?.cloneNode(true);if(img)col.appendChild(img);
        const name=hero.querySelector('b')?.cloneNode(true);if(name)col.appendChild(name);
        grid.appendChild(col);
      });
      const note=document.createElement('div');note.className='nexa-formation-note';note.textContent='Rally Lead heroes • Joiners use this troop ratio and their assigned Join First heroes in each Team.';
      card.appendChild(grid);card.appendChild(note);card.dataset.nexaCompact='1';
    });
  }

  function installReadability(){
    if(document.getElementById('nexa-svs-layout-readability-v12'))return;
    const style=document.createElement('style');
    style.id='nexa-svs-layout-readability-v12';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function status(msg,bad=false){
    const el=document.getElementById('status');
    if(!el)return;
    el.textContent=msg||'';
    el.style.color=bad?'#ff9cad':'#82f0ff';
  }

  function currentStrategyId(){
    const picker=document.getElementById('strategy-picker');
    if(picker?.value)return picker.value;
    return '';
  }

  async function latestStrategyId(){
    if(!sb)return '';
    const {data}=await sb.from('svs_strategies')
      .select('id,updated_at')
      .eq('state_number',Number(String(window.NEXA_ACTIVE_STATE||localStorage.getItem('nexa_active_state_v49')||1518).replace(/\D/g,''))||1518)
      .order('updated_at',{ascending:false})
      .limit(1);
    return data?.[0]?.id||'';
  }

  async function graphFor(strategyId){
    const out={alliances:[],teams:[],joiners:[],rally:[],formations:[],petRows:[],petAssignments:[]};
    let r=await sb.from('svs_strategy_alliances').select('*').eq('strategy_id',strategyId).order('sort_order');
    if(r.error)throw r.error; out.alliances=r.data||[];
    const aids=out.alliances.map(x=>x.id);
    if(aids.length){
      r=await sb.from('svs_strategy_teams').select('*').in('strategy_alliance_id',aids).order('sort_order');
      if(r.error)throw r.error; out.teams=r.data||[];
      r=await sb.from('svs_rally_formations').select('*').in('strategy_alliance_id',aids).order('formation_type').order('sort_order');
      if(r.error)throw r.error; out.formations=r.data||[];
    }
    const tids=out.teams.map(x=>x.id);
    if(tids.length){
      const [j,rs]=await Promise.all([
        sb.from('svs_strategy_joiners').select('*').in('team_id',tids).order('sort_order'),
        sb.from('svs_strategy_rally_slots').select('*').in('team_id',tids).order('sort_order')
      ]);
      if(j.error)throw j.error;if(rs.error)throw rs.error;
      out.joiners=j.data||[];out.rally=rs.data||[];
    }
    r=await sb.from('svs_pet_schedule_rows').select('*').eq('strategy_id',strategyId).order('sort_order');
    if(r.error)throw r.error;out.petRows=r.data||[];
    if(out.petRows.length){
      r=await sb.from('svs_pet_schedule_assignments').select('*').in('row_id',out.petRows.map(x=>x.id)).order('sort_order');
      if(r.error)throw r.error;out.petAssignments=r.data||[];
    }
    return out;
  }

  async function latestCompleteSnapshot(strategyId){
    const {data,error}=await sb.from('svs_team_layout_versions')
      .select('version,snapshot,published_at')
      .eq('strategy_id',strategyId)
      .order('version',{ascending:false})
      .limit(12);
    if(error)throw error;
    return (data||[]).find(v=>{
      const s=v.snapshot||{};
      return Array.isArray(s.alliances)&&s.alliances.length &&
             Array.isArray(s.teams)&&s.teams.length &&
             Array.isArray(s.rally_slots)&&s.rally_slots.length &&
             Array.isArray(s.joiners)&&s.joiners.length &&
             Array.isArray(s.formations)&&s.formations.length &&
             Array.isArray(s.pet_rows)&&s.pet_rows.length &&
             Array.isArray(s.pet_assignments)&&s.pet_assignments.length;
    })||null;
  }

  function topologyMaps(current,snap){
    const oldAById=new Map((snap.alliances||[]).map(a=>[String(a.id),a]));
    const currentAByTag=new Map((current.alliances||[]).map(a=>[String(a.alliance_tag||'').toLowerCase(),a]));
    const oldTeamMeta=new Map();
    for(const t of snap.teams||[]){
      const a=oldAById.get(String(t.strategy_alliance_id));
      oldTeamMeta.set(String(t.id),{tag:String(a?.alliance_tag||'').toLowerCase(),name:String(t.name||'')});
    }
    const currentTeamByKey=new Map();
    for(const t of current.teams||[]){
      const a=current.alliances.find(x=>String(x.id)===String(t.strategy_alliance_id));
      currentTeamByKey.set(`${String(a?.alliance_tag||'').toLowerCase()}|${String(t.name||'')}`,t);
    }
    const allianceMap=new Map();
    for(const old of snap.alliances||[]){
      const cur=currentAByTag.get(String(old.alliance_tag||'').toLowerCase());
      if(cur)allianceMap.set(String(old.id),cur.id);
    }
    const teamMap=new Map();
    for(const [oldId,meta] of oldTeamMeta){
      const cur=currentTeamByKey.get(`${meta.tag}|${meta.name}`);
      if(cur)teamMap.set(oldId,cur.id);
    }
    return {allianceMap,teamMap,oldTeamMeta};
  }

  function topologyCompatible(current,snap,maps){
    if(!current.alliances.length||!current.teams.length)return false;
    if(maps.allianceMap.size!==current.alliances.length)return false;
    return maps.teamMap.size===current.teams.length;
  }

  async function insertInChunks(table,rows,size=100){
    for(let i=0;i<rows.length;i+=size){
      const batch=rows.slice(i,i+size);
      const {error}=await sb.from(table).insert(batch);
      if(error)throw error;
    }
  }

  async function restoreMissing(strategyId,current,snap){
    const s=snap.snapshot||{},maps=topologyMaps(current,s);
    if(!topologyCompatible(current,s,maps))return {ok:false,reason:'topology_mismatch'};

    let changed=false;

    if(!current.joiners.length && (s.joiners||[]).length){
      const rows=(s.joiners||[]).map(j=>{
        const team_id=maps.teamMap.get(String(j.team_id));if(!team_id)return null;
        return {
          team_id,
          player_account_id:j.player_account_id||null,
          player_name:j.player_name||'Player',
          sort_order:Number(j.sort_order||0),
          join_first:!!j.join_first,
          attack_a_hero_id:j.attack_a_hero_id||null,
          attack_b_hero_id:j.attack_b_hero_id||null,
          defense_a_hero_id:j.defense_a_hero_id||null,
          defense_b_hero_id:j.defense_b_hero_id||null,
          locked:!!j.locked
        };
      }).filter(Boolean);
      await insertInChunks('svs_strategy_joiners',rows);changed=true;
    }

    if(!current.rally.length && (s.rally_slots||[]).length){
      const rows=(s.rally_slots||[]).map(x=>{
        const team_id=maps.teamMap.get(String(x.team_id));if(!team_id)return null;
        return {
          team_id,
          player_account_id:x.player_account_id||null,
          player_name:x.player_name||'Rally Lead',
          start_utc:x.start_utc,
          end_utc:x.end_utc,
          pets_active:!!x.pets_active,
          sort_order:Number(x.sort_order||0)
        };
      }).filter(Boolean);
      await insertInChunks('svs_strategy_rally_slots',rows);changed=true;
    }

    if(!current.formations.length && (s.formations||[]).length){
      const rows=(s.formations||[]).map(f=>{
        const strategy_alliance_id=maps.allianceMap.get(String(f.strategy_alliance_id));if(!strategy_alliance_id)return null;
        return {
          strategy_alliance_id,
          formation_type:f.formation_type,
          name:f.name,
          ratio:f.ratio||[],
          hero_infantry_id:f.hero_infantry_id||null,
          hero_lancer_id:f.hero_lancer_id||null,
          hero_marksman_id:f.hero_marksman_id||null,
          is_recommended:!!f.is_recommended,
          sort_order:Number(f.sort_order||0)
        };
      }).filter(Boolean);
      await insertInChunks('svs_rally_formations',rows);changed=true;
    }

    if(!current.petRows.length && (s.pet_rows||[]).length){
      const oldRowToNew=new Map();
      for(const old of s.pet_rows||[]){
        const source_team_id=maps.teamMap.get(String(old.source_team_id));
        const strategy_alliance_id=maps.allianceMap.get(String(old.strategy_alliance_id));
        if(!source_team_id||!strategy_alliance_id)continue;
        const {data,error}=await sb.from('svs_pet_schedule_rows').insert({
          strategy_id:strategyId,
          strategy_alliance_id,
          source_team_id,
          purpose:old.purpose||null,
          slot_label:old.slot_label||null,
          sort_order:Number(old.sort_order||0)
        }).select('id').single();
        if(error)throw error;
        oldRowToNew.set(String(old.id),data.id);
      }
      const pa=(s.pet_assignments||[]).map(x=>{
        const row_id=oldRowToNew.get(String(x.row_id));if(!row_id)return null;
        return {
          row_id,
          player_account_id:x.player_account_id||null,
          player_name:x.player_name||'Rally Lead',
          start_utc:x.start_utc,
          end_utc:x.end_utc,
          pets_active:!!x.pets_active,
          sort_order:Number(x.sort_order||0)
        };
      }).filter(Boolean);
      if(pa.length)await insertInChunks('svs_pet_schedule_assignments',pa);
      changed=true;
    }else if(current.petRows.length && !current.petAssignments.length && (s.pet_assignments||[]).length){
      const curRowByTeam=new Map(current.petRows.map(r=>[String(r.source_team_id),r.id]));
      const oldRowById=new Map((s.pet_rows||[]).map(r=>[String(r.id),r]));
      const pa=(s.pet_assignments||[]).map(x=>{
        const oldRow=oldRowById.get(String(x.row_id));if(!oldRow)return null;
        const currentTeam=maps.teamMap.get(String(oldRow.source_team_id));
        const row_id=curRowByTeam.get(String(currentTeam));if(!row_id)return null;
        return {
          row_id,
          player_account_id:x.player_account_id||null,
          player_name:x.player_name||'Rally Lead',
          start_utc:x.start_utc,
          end_utc:x.end_utc,
          pets_active:!!x.pets_active,
          sort_order:Number(x.sort_order||0)
        };
      }).filter(Boolean);
      if(pa.length)await insertInChunks('svs_pet_schedule_assignments',pa);
      changed=true;
    }

    return {ok:true,changed};
  }

  async function healStrategyGraph(strategyId,{quiet=false}={}){
    if(!sb||!strategyId||healing)return false;
    healing=true;
    try{
      let current=await graphFor(strategyId);
      if(!current.alliances.length||!current.teams.length)return false;

      const incomplete=!current.joiners.length||!current.rally.length||!current.formations.length||!current.petRows.length||!current.petAssignments.length;
      if(!incomplete)return false;

      const snap=await latestCompleteSnapshot(strategyId);
      if(!snap){
        if(!quiet)status('NEXA detected an incomplete Strategy, but no complete published snapshot is available for safe recovery.',true);
        return false;
      }

      const result=await restoreMissing(strategyId,current,snap);
      if(!result.ok){
        if(!quiet)status('NEXA detected an incomplete Strategy. Automatic recovery was skipped because the current Team structure differs from the last complete layout.',true);
        return false;
      }
      if(!result.changed)return false;

      current=await graphFor(strategyId);
      const complete=current.joiners.length&&current.rally.length&&current.formations.length&&current.petRows.length&&current.petAssignments.length;
      if(!complete){
        if(!quiet)status('NEXA restored part of the Strategy, but it still needs review before publishing.',true);
        return false;
      }

      await normalizePetPurposes(strategyId);
      await canonicalizeJoinFirst(strategyId);
      lastHealed=strategyId;
      status(`NEXA recovered the complete Strategy graph from Team Layout v${snap.version} ✓`);
      const picker=document.getElementById('strategy-picker');
      if(picker&&picker.value===strategyId)picker.dispatchEvent(new Event('change',{bubbles:true}));
      return true;
    }catch(e){
      console.error('[NEXA SvS healer]',e);
      if(!quiet)status(`NEXA recovery failed: ${e?.message||e}`,true);
      return false;
    }finally{
      healing=false;
    }
  }

  function installGenerationGuard(){
    const btn=document.getElementById('run-assist');
    if(btn&&!btn.dataset.nexaGraphGuard){
      btn.dataset.nexaGraphGuard='1';
      btn.addEventListener('click',()=>{
        clearInterval(watchTimer);
        let ticks=0;
        watchTimer=setInterval(async()=>{
          ticks++;
          if(ticks>35){clearInterval(watchTimer);watchTimer=null;return}
          const sid=currentStrategyId()||await latestStrategyId();
          if(!sid)return;
          if(btn.disabled)return;
          clearInterval(watchTimer);watchTimer=null;
          setTimeout(async()=>{
            await normalizePetPurposes(sid);
            await canonicalizeJoinFirst(sid);
            await healStrategyGraph(sid,{quiet:false});
            const picker=document.getElementById('strategy-picker');
            if(picker&&picker.value===sid)picker.dispatchEvent(new Event('change',{bubbles:true}));
          },250);
        },700);
      },true);
    }

    document.querySelectorAll('.nav button[data-tab="pets"],.nav button[data-tab="layout"]').forEach(b=>{
      if(b.dataset.nexaGraphHeal)return;
      b.dataset.nexaGraphHeal='1';
      b.addEventListener('click',()=>{
        const sid=currentStrategyId();
        if(sid)setTimeout(()=>healStrategyGraph(sid,{quiet:true}),50);
      },true);
    });
  }

  async function initialHealthCheck(){
    const sid=currentStrategyId()||await latestStrategyId();
    if(sid){await normalizePetPurposes(sid);await canonicalizeJoinFirst(sid);await healStrategyGraph(sid,{quiet:true});}
  }

  function boot(){
    installReadability();
    installSchedulerOverride();
    installGenerationGuard();
    clarifyFormationUI();
    setTimeout(initialHealthCheck,1200);
    setInterval(()=>{installSchedulerOverride();installGenerationGuard();clarifyFormationUI();},900);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();