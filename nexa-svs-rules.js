/* NEXA SvS Rules v1.2 — canonical Join First + graph healer + incomplete-generation recovery */
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
  `;

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
          setTimeout(()=>healStrategyGraph(sid,{quiet:false}),250);
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
    if(sid)await healStrategyGraph(sid,{quiet:true});
  }

  function boot(){
    installReadability();
    installGenerationGuard();
    setTimeout(initialHealthCheck,1200);
    setInterval(installGenerationGuard,1200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();