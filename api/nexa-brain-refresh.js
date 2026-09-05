// NEXA Brain Research v1.0 — scheduled corroboration pipeline
// Vercel env required: OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
const SB='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const MODEL=process.env.NEXA_RESEARCH_MODEL||'gpt-5.6-terra';

async function sb(path,{method='GET',body}={}){
  const r=await fetch(`${SB}/rest/v1/${path}`,{
    method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation,resolution=merge-duplicates'},
    body:body?JSON.stringify(body):undefined
  });
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const t=await r.text();return t?JSON.parse(t):null;
}
function textOf(resp){
  return (resp.output||[]).flatMap(o=>o.content||[]).map(c=>c.text||'').join('').trim();
}
function cleanJson(s){return JSON.parse(s.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}
function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch{return''}}

export default async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const secret=process.env.CRON_SECRET;
  const auth=req.headers.authorization||'';
  if(!secret||auth!==`Bearer ${secret}`)return res.status(401).json({error:'Unauthorized'});
  if(!process.env.OPENAI_API_KEY||!process.env.SUPABASE_SERVICE_ROLE_KEY)return res.status(500).json({error:'Missing research environment variables'});

  let run;
  try{
    const lib=await sb('nexa_library_items?item_type=eq.hero&is_active=eq.true&select=generation&order=generation.desc&limit=1');
    const generation=Number(lib?.[0]?.generation||0);
    if(!generation)throw new Error('No active hero generation found');

    const manual=req.query?.manual==='1';
    const prior=await sb('nexa_battle_research_runs?status=eq.completed&select=generation,completed_at&order=completed_at.desc&limit=1');
    const last=prior?.[0]||null;
    const generationChanged=!!last&&Number(last.generation)!==generation;
    const ageMs=last?.completed_at?(Date.now()-new Date(last.completed_at).getTime()):Infinity;

    // Cron checks daily. Research runs immediately for a newly detected generation,
    // otherwise only when the previous completed research is at least 72 hours old.
    if(!manual&&!generationChanged&&ageMs<72*60*60*1000){
      await sb('nexa_battle_research_runs',{method:'POST',body:{
        state_number:1518,generation,run_type:'scheduled',status:'skipped',
        completed_at:new Date().toISOString(),notes:'Not due yet; NEXA refreshes every 72 hours unless a new generation is detected.'
      }});
      return res.status(200).json({ok:true,skipped:true,generation,nextInHours:Math.ceil((72*60*60*1000-ageMs)/3600000)});
    }

    [run]=await sb('nexa_battle_research_runs',{method:'POST',body:{
      state_number:1518,generation,run_type:manual?'manual':(generationChanged?'generation_detected':'scheduled'),
      status:'running',started_at:new Date().toISOString()
    }});

    const prompt=`You are NEXA's Whiteout Survival battle-meta research analyst.
Research Generation ${generation} PvP rally formations for ATTACK and DEFENSE.
Use broad web research, including YouTube where useful, game-specific sites, guides, battle reports, community discussions, and independent creators.
Do NOT trust a claim merely because many pages copied the same source. Identify independent evidence groups.
Prefer direct gameplay, battle reports, visible rally compositions, tested comparisons, and multiple independent creators.
Return ONLY JSON with this shape:
{
 "generation":${generation},
 "formations":[
  {
   "mode":"attack|defense",
   "rule_key":"short_stable_key",
   "leader_heroes":["hero","hero","hero"],
   "primary_ratio":[0,0,0],
   "joiner_primary":["hero","hero","hero","hero"],
   "backup_joiner_pool":["hero", "..."],
   "alternative_formations":[{"leader_heroes":["","",""],"ratio":[0,0,0],"joiner_primary":["","","",""],"backup_joiner_pool":[""]}],
   "confidence":0.0,
   "why_good":"concise technical explanation",
   "risk_note":"known uncertainty/counters/limitations",
   "sources":[{"url":"https://...","type":"youtube_gameplay|battle_report|guide|community|other","evidence_strength":"direct|strong|supporting","independent_group":"creator_or_origin_key"}]
  }
 ]
}
Ratios must total 100. Do not fabricate sources or evidence. If evidence is weak, lower confidence and still return the candidate rather than pretending it is verified.`;

    const or=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:MODEL,tools:[{type:'web_search',search_context_size:'high'}],input:prompt})
    });
    if(!or.ok)throw new Error(`OpenAI ${or.status}: ${await or.text()}`);
    const data=cleanJson(textOf(await or.json()));
    const saved=[];
    for(const f of data.formations||[]){
      const src=(f.sources||[]).filter(x=>x?.url);
      const independent=new Set(src.map(x=>x.independent_group||host(x.url)).filter(Boolean)).size;
      const direct=src.filter(x=>x.evidence_strength==='direct'||x.type==='youtube_gameplay'||x.type==='battle_report').length;
      const confidence=Math.max(0,Math.min(1,Number(f.confidence||0)));
      let approval_status='candidate',evidence_status='experimental',active=false;
      if(confidence>=.90&&independent>=4&&src.length>=5&&direct>=2){approval_status='approved';evidence_status='verified';active=true}
      else if(confidence>=.72&&independent>=3&&src.length>=3){approval_status='corroborated';evidence_status='cross_checked';active=false}
      const row={
        generation,event_scope:'pvp_rally',mode:f.mode,rule_key:f.rule_key,
        leader_heroes:f.leader_heroes||[],primary_ratio:f.primary_ratio||[50,20,30],alternative_ratios:[],
        alternative_formations:f.alternative_formations||[],joiner_primary:f.joiner_primary||[],
        joiner_alternatives:f.backup_joiner_pool||[],backup_joiner_pool:f.backup_joiner_pool||[],
        constraints:{},confidence,evidence_status,evidence_note:f.why_good||'',why_good:f.why_good||'',risk_note:f.risk_note||'',
        source_urls:src.map(x=>x.url),source_count:src.length,independent_source_count:independent,
        research_metadata:{sources:src,direct_evidence_count:direct,model:MODEL},
        last_researched_at:new Date().toISOString(),next_research_at:new Date(Date.now()+3*86400000).toISOString(),
        approval_status,is_active:active,is_manual:false,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()
      };
      const q=`nexa_battle_meta_rules?on_conflict=generation,event_scope,mode,rule_key`;
      const out=await sb(q,{method:'POST',body:row});saved.push(out?.[0]||row);
    }
    await sb(`nexa_battle_research_runs?id=eq.${run.id}`,{method:'PATCH',body:{status:'completed',completed_at:new Date().toISOString(),source_count:saved.reduce((s,x)=>s+Number(x.source_count||0),0),independent_source_count:Math.max(0,...saved.map(x=>Number(x.independent_source_count||0))),result_summary:{saved:saved.map(x=>({mode:x.mode,rule_key:x.rule_key,approval_status:x.approval_status,confidence:x.confidence}))}}});
    return res.status(200).json({ok:true,generation,saved:saved.map(x=>({mode:x.mode,rule_key:x.rule_key,status:x.approval_status,confidence:x.confidence}))});
  }catch(e){
    if(run?.id)try{await sb(`nexa_battle_research_runs?id=eq.${run.id}`,{method:'PATCH',body:{status:'failed',completed_at:new Date().toISOString(),error_text:String(e.message||e)}})}catch{}
    return res.status(500).json({error:String(e.message||e)});
  }
}
