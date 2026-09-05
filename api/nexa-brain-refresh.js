// NEXA Brain Research v1.1 — generation-safe scheduled corroboration pipeline
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

  try{
    const generations=await sb(
      'nexa_library_generations?item_type=eq.hero&select=generation,is_visible,unlock_at&order=generation.asc'
    );

    const generation=resolveGeneration(generations);
    if(!generation)throw new Error('No unlocked hero generation found');

    const manual=req.query?.manual==='1';

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

Use broad independent web research, including YouTube gameplay where useful, game-specific sites, guides, battle reports, community discussions, and independent creators.

Rules:
- Do not use heroes from any generation higher than ${generation}.
- Do not trust a claim merely because many pages copied the same source.
- Identify independent evidence groups.
- Prefer direct gameplay, battle reports, visible rally compositions, tested comparisons, and multiple independent creators.
- Do not fabricate sources, hero names, ratios, evidence, or conclusions.
- If evidence is weak or conflicting, lower confidence and return it as a candidate instead of pretending it is verified.
- Ratios must total exactly 100.
- Return ONLY valid JSON. No markdown fences and no commentary.

Return exactly this shape:
{
 "generation":${generation},
 "formations":[
  {
   "mode":"attack|defense",
   "rule_key":"short_stable_key",
   "leader_heroes":["hero","hero","hero"],
   "primary_ratio":[0,0,0],
   "joiner_primary":["hero","hero","hero","hero"],
   "backup_joiner_pool":["hero","..."],
   "alternative_formations":[
     {
       "leader_heroes":["hero","hero","hero"],
       "ratio":[0,0,0],
       "joiner_primary":["hero","hero","hero","hero"],
       "backup_joiner_pool":["hero","..."]
     }
   ],
   "confidence":0.0,
   "why_good":"concise technical explanation",
   "risk_note":"known uncertainty, counters, or limitations",
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

    const openaiResp=JSON.parse(openaiRaw);
    const data=cleanJson(textOf(openaiResp));

    if(Number(data?.generation)!==generation)
      throw new Error(`Research returned generation ${data?.generation}; expected ${generation}.`);

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

      let approval_status='candidate';
      let evidence_status='experimental';
      let active=false;

      if(confidence>=.90&&independent>=4&&src.length>=5&&direct>=2){
        approval_status='approved';
        evidence_status='verified';
        active=true;
      }else if(confidence>=.72&&independent>=3&&src.length>=3){
        approval_status='corroborated';
        evidence_status='cross_checked';
      }

      const row={
        generation,
        event_scope:'pvp_rally',
        mode:f.mode,
        rule_key:f.rule_key,
        leader_heroes:f.leader_heroes||[],
        primary_ratio:ratio,
        alternative_ratios:[],
        alternative_formations:f.alternative_formations||[],
        joiner_primary:f.joiner_primary||[],
        joiner_alternatives:f.backup_joiner_pool||[],
        backup_joiner_pool:f.backup_joiner_pool||[],
        constraints:{max_generation:generation},
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
          researched_generation:generation
        },
        last_researched_at:new Date().toISOString(),
        next_research_at:new Date(Date.now()+3*86400000).toISOString(),
        approval_status,
        is_active:active,
        is_manual:false,
        verified_at:approval_status==='approved'?new Date().toISOString():null,
        updated_at:new Date().toISOString()
      };

      const q='nexa_battle_meta_rules?on_conflict=generation,event_scope,mode,rule_key';
      const out=await sb(q,{method:'POST',body:row});
      saved.push(out?.[0]||row);
    }

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
    if(run?.id){
      try{
        await sb(`nexa_battle_research_runs?id=eq.${run.id}`,{
          method:'PATCH',
          body:{
            status:'failed',
            completed_at:new Date().toISOString(),
            error_text:String(e.message||e)
          }
        });
      }catch{}
    }

    return res.status(500).json({
      error:String(e.message||e)
    });
  }
}
