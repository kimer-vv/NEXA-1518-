/* NEXA Gift Discovery phase 1 — CREATE NEW: server/nexa-gift-discovery.js
   Discovers public source-listed codes and prepares local redemption queue ONLY.
   DOES NOT SEND GAME IDS OR CODES TO A REDEMPTION PROVIDER. */
const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const SOURCE='https://www.whiteoutsurvival-community.com/en/gift-codes.html';
const TIMEOUT_MS=12000;
const enc=x=>encodeURIComponent(String(x));
async function db(path,{method='GET',body}={}){
 if(!KEY)throw Error('Missing SUPABASE_SERVICE_ROLE_KEY');
 const response=await fetch(`${SB_URL}/rest/v1/${path}`,{method,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(TIMEOUT_MS)});
 const text=await response.text();let out;try{out=text?JSON.parse(text):null}catch{out=text}
 if(!response.ok)throw Error(`Supabase ${response.status}: ${out?.message||out?.error||'Unknown error'}`);
 return out;
}
const rpc=(name,body)=>db('rpc/'+name,{method:'POST',body});
function stripHtml(s){return s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
export function extractWscoActiveCodes(html){
 if(typeof html!=='string'||html.length>3_000_000)throw Error('Invalid discovery document');
 const readable=stripHtml(html);
 const start=readable.indexOf('Active gift codes');
 if(start<0)throw Error('Active gift codes section missing');
 const after=readable.slice(start+'Active gift codes'.length);
 const end=after.indexOf('How to redeem');
 if(end<0)throw Error('Active codes section end missing');
 const block=after.slice(0,end);
 const out=[];
 const re=/Gift code\s+([A-Za-z0-9_-]{4,120})\s+Copy\b/g;
 let m;while((m=re.exec(block))!==null){if(!out.some(x=>x.toLowerCase()===m[1].toLowerCase()))out.push(m[1]);if(out.length>150)throw Error('Unexpectedly many codes; source layout changed')}
 if(!out.length&&!/\b0 active\b/i.test(block))throw Error('No codes extracted; source layout may have changed');
 return out;
}
export async function discoverAndPrepare(){
 const start=new Date().toISOString();let count=0,added=0,queued=0,status='success',error='';
 try{
  const upstream=await fetch(SOURCE,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:{Accept:'text/html','User-Agent':'NEXA-Gift-Discovery/1.0'}});
  if(!upstream.ok)throw Error(`Source unavailable (${upstream.status})`);
  const html=await upstream.text();const codes=extractWscoActiveCodes(html);count=codes.length;
  for(const code of codes){const r=await rpc('gift_v1_record_discovered_code',{p_code:code,p_source:SOURCE,p_reward_type:'unknown'});if(r?.added)added++}
  const q=await rpc('gift_v1_prepare_redemption_queue',{p_limit:5000});queued=Number(q?.queued)||0;
 }catch(e){status='failed';error=String(e?.message||e).slice(0,350);console.error('[NEXA Gift Discovery]',error)}
 try{await db('gift_discovery_runs',{method:'POST',body:{source:SOURCE,started_at:start,finished_at:new Date().toISOString(),status,codes_found:count,codes_added:added,queue_added:queued,error_detail:error||null}})}catch(e){console.error('[NEXA Gift Discovery logging]',e)}
 return {ok:status==='success',status,codes_found:count,codes_added:added,queue_added:queued,redemption_enabled:false,...(error?{error}:{})};
}
export async function giftCron(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({ok:false,error:'Unauthorized cron'});
 const r=await discoverAndPrepare();return res.status(r.ok?200:502).json(r);
}
