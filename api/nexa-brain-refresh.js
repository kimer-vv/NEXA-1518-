// NEXA Brain Research v1.8 — Top 4 rally-fit synergy/stack research + multi-variant Suggested
// Vercel env required: OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
const SB='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const MODEL=process.env.NEXA_RESEARCH_MODEL||'gpt-5.6-terra';

async function sb(path,{method='GET',body}={}){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r=await fetch(`${SB}/rest/v1/${path}`,{
    method,
    headers:{
      apikey:key,
      Authorization:`Bearer ${key}`,
      'Content-Type':'application/json',
      Prefer:'return=representation,resolution=merge-duplicates'
    },
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const raw=await r.text();
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${raw}`);
  return raw?JSON.parse(raw):null;
}

function textOf(resp){
  if(typeof resp?.output_text==='string'&&resp.output_text.trim())return resp.output_text.trim();
  return (resp?.output||[])
    .flatMap(o=>o?.content||[])
    .map(c=>c?.text||'')
    .join('')
    .trim();
}

function cleanJson(s){
  return JSON.parse(String(s||'')
    .replace(/^```(?:json)?\s*/i,'')
    .replace(/\s*```$/,'')
    .trim());
}

function host(u){
  try{return new URL(u).hostname.replace(/^www\./,'')}
  catch{return''}
}

function resolveGeneration(rows){
  const now=Date.now();
  const eligible=(rows||[]).filter(r=>{
    const g=Number(r?.generation||0);
    if(!g)return false;
    if(r?.is_visible===true)return true;
    if(r?.unlock_at){
      const t=new Date(r.unlock_at).getTime();
      return Number.isFinite(t)&&t<=now;
    }
    return false;
  });
  return Math.max(0,...eligible.map(r=>Number(r.generation||0)));
}

function slugPart(v){
  return String(v||'')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g,'_')
    .replace(/^_+|_+$/g,'')
    .slice(0,28);
}

function researchRuleKey(generation,mode,leaders,ratio){
  const heroKey=(leaders||[]).map(slugPart).filter(Boolean).join('_');
  const ratioKey=(ratio||[]).map(Number).join('_');
  return `research_g${generation}_${slugPart(mode)}_${heroKey}_${ratioKey}`.slice(0,120);
}

function sameFormation(aLeaders,aRatio,bLeaders,bRatio){
  const al=(aLeaders||[]).map(x=>String(x||'').trim().toLowerCase());
  const bl=(bLeaders||[]).map(x=>String(x||'').trim().toLowerCase());
  const ar=(aRatio||[]).map(Number),br=(bRatio||[]).map(Number);
  return al.length===bl.length&&al.every((x,i)=>x===bl[i])&&
    ar.length===br.length&&ar.every((x,i)=>Number(x)===Number(br[i]));
}

function evidencePasses(row){
  const allowedRelevance=new Set([
    'tested_with_current_generation',
    'explicitly_recommended_for_current_generation'
  ]);
  if(!row?.hero||!allowedRelevance.has(row.generation_relevance))return false;
  const groups=new Set((row.independent_groups||[]).map(String).filter(Boolean));
  const urls=new Set((row.source_urls||[]).map(String).filter(Boolean));
  const skill=String(row.skill_name||'').trim();
  const effect=String(row.buff_effect||'').trim();
  const why=String(row.why||'').trim();
  const rallyFit=String(row.rally_fit||'').trim();
  return groups.size>=2&&urls.size>=2&&skill&&effect&&why&&rallyFit;
}

function vettedPrimaryJoiners(rawPrimary,evidence){
  const good=new Set((evidence||[]).filter(x=>x?.role==='primary'&&evidencePasses(x)).map(x=>String(x.hero).trim().toLowerCase()));
  // Preserve slot order AND intentional duplicates, e.g. Norah / Norah / Hendrik / Patrick.
  return (rawPrimary||[]).map(x=>String(x||'').trim()).filter(x=>x&&good.has(x.toLowerCase())).slice(0,4);
}

function vettedBackupJoiners(rawBackup,evidence){
  const good=new Set((evidence||[]).filter(x=>x?.role==='backup'&&evidencePasses(x)).map(x=>String(x.hero).trim().toLowerCase()));
  const out=[];
  for(const x of rawBackup||[]){
    const n=String(x||'').trim();
    if(n&&good.has(n.toLowerCase())&&!out.some(y=>y.toLowerCase()===n.toLowerCase()))out.push(n);
  }
  return out.slice(0,8);
}

export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST')
    return res.status(405).json({error:'Method not allowed'});

  const secret=process.env.CRON_SECRET;
  const auth=req.headers.authorization||'';

  if(!secret||auth!==`Bearer ${secret}`)
    return res.status(401).json({error:'Unauthorized'});

  if(!process.env.OPENAI_API_KEY||!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return res.status(500).json({error:'Missing research environment variables'});

  let run;
  let stage='startup';

  try{
    stage='generation_lookup';
    const generations=await sb(
      'nexa_library_generations?item_type=eq.hero&select=generation,is_visible,unlock_at&order=generation.asc'
    );

    const generation=resolveGeneration(generations);
    if(!generation)throw new Error('No unlocked hero generation found');

    const manual=req.query?.manual==='1';

    stage='prior_run_lookup';
    const prior=await sb(
      'nexa_battle_research_runs?status=eq.completed&state_number=eq.1518&select=generation,completed_at&order=completed_at.desc&limit=1'
    );

    const last=prior?.[0]||null;
    const generationChanged=!last||Number(last.generation)!==generation;
    const ageMs=last?.completed_at
      ? Date.now()-new Date(last.completed_at).getTime()
      : Infinity;

    if(!manual&&!generationChanged&&ageMs<72*60*60*1000){
      await sb('nexa_battle_research_runs',{
        method:'POST',
        body:{
          state_number:1518,
          generation,
          run_type:'scheduled',
          status:'skipped',
          completed_at:new Date().toISOString(),
          notes:'Not due yet; NEXA refreshes every 72 hours unless a new generation is detected.'
        }
      });

      return res.status(200).json({
        ok:true,
        skipped:true,
        generation,
        nextInHours:Math.ceil((72*60*60*1000-ageMs)/3600000)
      });
    }

    stage='create_run';
    [run]=await sb('nexa_battle_research_runs',{
      method:'POST',
      body:{
        state_number:1518,
        generation,
        run_type:manual?'manual':(generationChanged?'generation_detected':'scheduled'),
        status:'running',
        started_at:new Date().toISOString()
      }
    });

    const prompt=`You are NEXA's Whiteout Survival battle-meta research analyst.

Research CURRENTLY UNLOCKED Generation ${generation} PvP rally formations for ATTACK and DEFENSE for State 1518.

Your job is NOT to return only one attack and one defense. Return EVERY distinct formation variant that is worth human review, as long as it has at least 60% confidence and enough independent evidence. A different hero trio OR a materially different troop ratio is a separate formation and must be a separate object.

Use broad independent web research, including direct gameplay, YouTube battle footage, battle reports, game-specific sites, guides, community discussions, and independent creators.

Hard rules:
- Do not use heroes from any generation higher than ${generation}.
- Research the CURRENT Gen ${generation} meta, not generic old lists.
- Do not invent a ratio because it sounds logical.
- If a source says a ratio should preserve Lancer presence or another troop-class requirement, explain WHY only when the underlying mechanic is actually corroborated.
- If 40/10/50, 50/0/50, 50/10/40, or any other ratio is independently supported, do NOT hide it inside the explanation of another formation. Return it as its own formation object if it reaches the 60% review threshold.
- Likewise, if a different trio such as Gregory/Freya/Xura is supported at 60%+, return it as its own formation object. Never mention another hero trio as a hidden recommendation inside a different card.
- Each formation's why_good, ratio_reasoning, joiner explanations, top4_synergy, and risk_note must discuss ONLY that formation.
- Confidence 0.72+ with >=3 independent groups and >=3 sources can be Corroborated.
- Confidence 0.60-0.719 with >=2 independent groups and >=2 sources is a Promising human-review candidate.
- Below 0.60 is not a Suggested formation and should not be returned.
- Do not trust duplicated/copy-pasted sources as independent.
- Ratios must total exactly 100.
- Do not fabricate sources, hero names, skills, mechanics, ratios, evidence, or conclusions.

Join First / Top 4 Stack rules:
- Return exactly four Top 4 Joiner slots whenever four can be corroborated.
- Treat the four slots as ONE synergy/stack package, not as four individually ranked skills.
- Intentional duplicates are allowed and must be preserved when the duplicate effect is useful in separate join seats and is corroborated.
- Select the Top 4 by how their joiner effects complement each other, what can stack or coexist, and how the combined package supports THIS exact Rally Lead trio + troop ratio.
- Do NOT choose or rank the Top 4 merely because four heroes have individually strong skills/buffs.
- For every unique Top-4 hero, identify the actual joiner effect it contributes, but visible reasoning must emphasize its ROLE IN THE COMBINED STACK.
- Return one concise formation-level field named top4_synergy explaining: (a) why these four belong together, (b) what effects complement or stack, (c) HOW the package specifically complements the exact Rally Lead trio, (d) HOW it supports the exact troop ratio/formation role, and (e) any important stacking limitation or non-stacking interaction when corroborated.
- For each Top-4 seat, return rally_fit: a mechanic-first explanation of why THAT joiner effect is useful for THIS exact Rally Lead trio + troop ratio. Tie it to the rally's needs (damage conversion, survivability, defense reduction, lethality, troop-class pressure, etc.) only when corroborated.
- Never claim a direct hero-to-hero interaction unless the evidence actually demonstrates it. If only a formation-level interaction is supported, say that instead.
- Visible reasoning must never name sources, websites, creators, guides, videos, or phrases such as 'X recommends'.
- A legacy hero is not valid merely because it was historically popular.
- A primary or backup joiner must be tied to CURRENT Gen ${generation} rally use through at least 2 independent evidence groups and 2 source URLs.
- generation_relevance must use:
  * tested_with_current_generation
  * explicitly_recommended_for_current_generation
  * legacy_skill_only
- legacy_skill_only is rejected from operational fields.

Backup Joiner Pool rules:
- Backups are emergency substitutes, not random filler.
- They may include heroes also represented in the Top 4 if a duplicated/interchangeable slot is genuinely useful.
- They may also include other current-generation-relevant joiners that preserve a useful buff family or add a compatible buff.
- joiner_primary MUST contain exactly 4 joiner slots for every returned formation.
- PRESERVE intentional duplicates exactly. If the supported Top 4 are Norah / Norah / Hendrik / Patrick, return ["Norah","Norah","Hendrik","Patrick"]. Never deduplicate Top-4 slots.
- For EVERY Top-4 hero, identify its FIRST EXPEDITION SKILL used as a rally joiner, the actual buff/debuff/combat effect of that skill, and WHY that effect helps the COMBINED Top-4 stack for THIS exact hero trio + troop ratio.
- Never treat a hero appearing in the Rally Lead trio as proof that the same hero is a good joiner. Rally-leader value and joiner value are separate; every joiner seat must be independently corroborated through that hero's first Expedition skill.
- The joiner "why" text must be mechanic-first and synergy-aware. Do NOT mention source names, guide names, creators, websites, tables, or phrases such as "X source lists/recommends/supports". Provenance belongs only in sources/source_urls metadata.
- Duplicate Top-4 heroes may reuse the same corroborated mechanical explanation when they occupy separate buff seats, but top4_synergy must explain why the duplicate is useful in the combined package.
- For each backup, say which Top-4 role/hero it can replace (or "flex"), what buff/effect it preserves or adds, and why that matters to THIS formation.
- Backup explanations must also be mechanic-first and must not cite source names in the visible reasoning.
- If no backup is corroborated, return an empty pool. Never fill it just to make the card look complete.

Return ONLY valid JSON:
{
 "generation":${generation},
 "formations":[
  {
   "mode":"attack|defense",
   "leader_heroes":["hero","hero","hero"],
   "primary_ratio":[0,0,0],
   "confidence":0.60,
   "why_good":"brief but useful explanation of why these heroes + this ratio work together",
   "ratio_reasoning":"brief explanation of why this exact troop split matters; only corroborated mechanics",
   "risk_note":"uncertainty, counters, investment variables, or matchup limitations for THIS formation only",
   "joiner_primary":["hero","hero","hero","hero"],
   "top4_synergy":"formation-level explanation of why these four joiner effects complement/stack together and what the combined package adds to this exact rally",
   "backup_joiner_pool":["hero","..."],
   "joiner_evidence":[
     {
       "hero":"hero",
       "role":"primary|backup",
       "generation_relevance":"tested_with_current_generation|explicitly_recommended_for_current_generation|legacy_skill_only",
       "independent_groups":["origin_a","origin_b"],
       "source_urls":["https://...","https://..."],
       "skill_name":"name of the hero's first Expedition skill used when joining",
       "buff_effect":"plain-language effect of that first Expedition skill, including percentage/value when corroborated",
       "why":"mechanic-first explanation of this hero's role inside the combined Top-4 stack; no source names",
       "rally_fit":"why this exact joiner effect complements THIS Rally Lead trio + troop ratio; no source names and no invented direct hero interaction",
       "replaces":"for backup only: hero name, buff role, or flex"
     }
   ],
   "sources":[
     {
       "url":"https://...",
       "type":"youtube_gameplay|battle_report|guide|community|other",
       "evidence_strength":"direct|strong|supporting",
       "independent_group":"creator_or_origin_key"
     }
   ]
  }
 ]
}`;

    stage='openai_request';
    const or=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:MODEL,
        tools:[{
          type:'web_search_preview',
          search_context_size:'high'
        }],
        input:prompt
      })
    });

    const openaiRaw=await or.text();
    if(!or.ok)throw new Error(`OpenAI ${or.status}: ${openaiRaw}`);

    stage='openai_parse';
    const openaiResp=JSON.parse(openaiRaw);
    const data=cleanJson(textOf(openaiResp));

    if(Number(data?.generation)!==generation)
      throw new Error(`Research returned generation ${data?.generation}; expected ${generation}.`);

    stage='save_results';
    const saved=[];

    for(const f of data.formations||[]){
      const ratio=Array.isArray(f.primary_ratio)?f.primary_ratio.map(Number):[];
      if(ratio.length!==3||ratio.some(x=>!Number.isFinite(x))||ratio.reduce((a,b)=>a+b,0)!==100)
        continue;

      const src=(f.sources||[]).filter(x=>x?.url);
      const independent=new Set(
        src.map(x=>x.independent_group||host(x.url)).filter(Boolean)
      ).size;
      const direct=src.filter(
        x=>x.evidence_strength==='direct'||
           x.type==='youtube_gameplay'||
           x.type==='battle_report'
      ).length;

      const confidence=Math.max(0,Math.min(1,Number(f.confidence||0)));
      const rawPrimary=(f.joiner_primary||[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,4);
      // Every Suggested formation must be operationally reviewable: four explicit Top-4 slots.
      // Intentional duplicates are valid and preserved.
      if(rawPrimary.length!==4)continue;

      // Suggested threshold: 60%+ AND at least two independent evidence groups / sources.
      // Brain never auto-approves.
      if(confidence<.60||independent<2||src.length<2)continue;

      let approval_status='candidate';
      let evidence_status='promising';
      const active=false;

      if(confidence>=.72&&independent>=3&&src.length>=3){
        approval_status='corroborated';
        evidence_status='cross_checked';
      }

      const joinerEvidence=Array.isArray(f.joiner_evidence)?f.joiner_evidence:[];
      const vettedPrimary=vettedPrimaryJoiners(rawPrimary,joinerEvidence);
      const vettedBackup=vettedBackupJoiners(f.backup_joiner_pool||[],joinerEvidence);
      // Suggested must be operationally reviewable: four vetted Top-4 seats.
      // Intentional duplicate seats count separately and must survive.
      if(vettedPrimary.length!==4)continue;

      const stableRuleKey=researchRuleKey(
        generation,
        f.mode,
        f.leader_heroes||[],
        ratio
      );

      const row={
        generation,
        event_scope:'pvp_rally',
        mode:f.mode,
        rule_key:stableRuleKey,
        leader_heroes:f.leader_heroes||[],
        primary_ratio:ratio,
        alternative_ratios:[],
        alternative_formations:[],
        joiner_primary:vettedPrimary,
        joiner_alternatives:vettedBackup,
        backup_joiner_pool:vettedBackup,
        constraints:{max_generation:generation,ratio_reasoning:f.ratio_reasoning||''},
        confidence,
        evidence_status,
        evidence_note:f.why_good||'',
        why_good:f.why_good||'',
        risk_note:f.risk_note||'',
        source_urls:src.map(x=>x.url),
        source_count:src.length,
        independent_source_count:independent,
        research_metadata:{
          sources:src,
          direct_evidence_count:direct,
          model:MODEL,
          researched_generation:generation,
          model_rule_key:f.rule_key||null,
          raw_joiner_primary:rawPrimary,
          raw_backup_joiner_pool:f.backup_joiner_pool||[],
          ratio_reasoning:f.ratio_reasoning||'',
          top4_synergy:f.top4_synergy||'',
          joiner_evidence:joinerEvidence,
          vetted_joiner_primary:vettedPrimary,
          vetted_backup_joiner_pool:vettedBackup,
          joiner_gate:{
            min_independent_groups:2,
            min_source_urls:2,
            preserving_primary_duplicates:true,
            selection_basis:'combined_synergy_stack_and_rally_fit',
            requires_rally_fit:true,
            allowed_generation_relevance:[
              'tested_with_current_generation',
              'explicitly_recommended_for_current_generation'
            ]
          }
        },
        last_researched_at:new Date().toISOString(),
        next_research_at:new Date(Date.now()+3*86400000).toISOString(),
        approval_status,
        is_active:active,
        is_manual:false,
        verified_at:null,
        updated_at:new Date().toISOString()
      };

      // Research rows use a dedicated stable research_* key so Brain cannot
      // overwrite an existing manual/approved canonical formation.
      const q='nexa_battle_meta_rules?on_conflict=generation,event_scope,mode,rule_key';
      const out=await sb(q,{method:'POST',body:row});
      const savedRow=out?.[0]||row;
      saved.push(savedRow);

      // If the exact same trio + ratio is already human-Approved, refresh its research
      // evidence and vetted joiners instead of making NEXA show contradictory duplicates.
      // This NEVER approves a new/different formation.
      const approved=await sb(
        `nexa_battle_meta_rules?generation=eq.${generation}&event_scope=eq.pvp_rally&mode=eq.${encodeURIComponent(f.mode)}&approval_status=eq.approved&is_active=eq.true&select=id,leader_heroes,primary_ratio`
      );
      const exact=(approved||[]).find(x=>sameFormation(x.leader_heroes,x.primary_ratio,f.leader_heroes||[],ratio));
      if(exact?.id){
        await sb(`nexa_battle_meta_rules?id=eq.${exact.id}`,{
          method:'PATCH',
          body:{
            joiner_primary:vettedPrimary,
            joiner_alternatives:vettedBackup,
            backup_joiner_pool:vettedBackup,
            constraints:{max_generation:generation,ratio_reasoning:f.ratio_reasoning||''},
            confidence,
            evidence_status,
            evidence_note:f.why_good||'',
            why_good:f.why_good||'',
            risk_note:f.risk_note||'',
            source_urls:src.map(x=>x.url),
            source_count:src.length,
            independent_source_count:independent,
            research_metadata:row.research_metadata,
            last_researched_at:row.last_researched_at,
            next_research_at:row.next_research_at,
            updated_at:new Date().toISOString()
          }
        });
      }
    }

    stage='complete_run';
    await sb(`nexa_battle_research_runs?id=eq.${run.id}`,{
      method:'PATCH',
      body:{
        status:'completed',
        completed_at:new Date().toISOString(),
        source_count:saved.reduce((s,x)=>s+Number(x.source_count||0),0),
        independent_source_count:Math.max(
          0,
          ...saved.map(x=>Number(x.independent_source_count||0))
        ),
        result_summary:{
          model:MODEL,
          generation,
          saved:saved.map(x=>({
            mode:x.mode,
            rule_key:x.rule_key,
            approval_status:x.approval_status,
            confidence:x.confidence
          }))
        }
      }
    });

    stage='done';
    return res.status(200).json({
      ok:true,
      generation,
      model:MODEL,
      saved:saved.map(x=>({
        mode:x.mode,
        rule_key:x.rule_key,
        status:x.approval_status,
        confidence:x.confidence
      }))
    });

  }catch(e){
    const message=String(e?.message||e||'Unknown error');

    if(run?.id){
      try{
        await sb(`nexa_battle_research_runs?id=eq.${run.id}`,{
          method:'PATCH',
          body:{
            status:'failed',
            completed_at:new Date().toISOString(),
            error_text:`[${stage}] ${message}`
          }
        });
      }catch{}
    }

    console.error('[NEXA Brain]', {
      stage,
      message
    });

    return res.status(500).json({
      error:message,
      stage
    });
  }
}
