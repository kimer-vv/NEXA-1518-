/* NEXA Gift Code Discovery v1.2 | REPLACE EXISTING: server/nexa-gift-discovery.js
 * Public-source discovery ONLY. No redemption requests or player IDs are sent to sources.
 * Sources are independent: a WSCO 403 does not prevent the secondary catalog from working.
 */
const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const TIMEOUT_MS=12000;
const SOURCES=[
 {name:'WSCO',url:'https://www.whiteoutsurvival-community.com/en/gift-codes.html',parse:extractWscoActiveCodes},
 {name:'BoostBot',url:'https://boostbot.org/blog/whiteout-survival-gift-codes/',parse:extractBoostBotActiveCodes},
];
async function db(path,{method='GET',body}={}){
 if(!KEY)throw Error('Missing SUPABASE_SERVICE_ROLE_KEY');
 const response=await fetch(`${SB_URL}/rest/v1/${path}`,{
  method,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:'return=representation'},
  body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(TIMEOUT_MS)
 });
 const raw=await response.text();let out;try{out=raw?JSON.parse(raw):null}catch{out=raw}
 if(!response.ok)throw Error(`Supabase ${response.status}: ${out?.message||out?.error||'Unknown error'}`);
 return out;
}
const rpc=(name,body)=>db('rpc/'+name,{method:'POST',body});
function stripHtml(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;|&apos;/gi,"'").replace(/\s+/g,' ').trim()}
function validateDocument(html){if(typeof html!=='string'||html.length>3000000)throw Error('Invalid or oversized source document');return stripHtml(html)}
function distinctCodes(codes){const seen=new Set(),out=[];for(const value of codes){const code=String(value||'').trim();if(!/^[A-Za-z0-9_-]{4,120}$/.test(code))continue;const key=code.toLowerCase();if(!seen.has(key)){out.push(code);seen.add(key)}if(out.length>150)throw Error('Too many codes; source structure may have changed')}return out}
export function extractWscoActiveCodes(html){
 const text=validateDocument(html),start=text.indexOf('Active gift codes');
 if(start<0)throw Error('WSCO active-code section missing');
 const after=text.slice(start+'Active gift codes'.length),end=after.indexOf('How to redeem');
 if(end<0)throw Error('WSCO active-code section end missing');
 const block=after.slice(0,end),codes=[...block.matchAll(/Gift code\s+([A-Za-z0-9_-]{4,120})\s+Copy\b/g)].map(x=>x[1]);
 if(!codes.length&&!/\b0 active\b/i.test(block))throw Error('WSCO code layout changed');
 return distinctCodes(codes);
}
export function extractBoostBotActiveCodes(html,now=new Date()){
 const text=validateDocument(html);
 const start=text.indexOf('Current Active Whiteout Survival Gift Codes');
 if(start<0)throw Error('BoostBot active-code heading missing');
 // Do not queue a page that may be months old merely because it says "active".
 const nearby=text.slice(Math.max(0,start-1000),start+1100);
 const dated=nearby.match(/Updated\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})/i)
  ||nearby.match(/Verified\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})/i);
 if(!dated)throw Error('BoostBot update date unavailable; refusing to import possibly stale codes');
 const stamp=new Date(`${dated[1]} ${dated[2]}, ${dated[3]} 12:00:00 GMT`);
 const age=now.getTime()-stamp.getTime();
 if(!Number.isFinite(age)||age< -2*86400000||age>14*86400000)throw Error('BoostBot active-code list is older than 14 days');
 const after=text.slice(start+'Current Active Whiteout Survival Gift Codes'.length);
 const end=after.search(/Want something better than a code\?|How to Redeem|Expired (?:Gift )?Codes|Frequently Asked Questions/i);
 if(end<0)throw Error('BoostBot section end missing');
 const section=after.slice(0,end);
 const marker=section.match(/\bCopy\s+all\b/i);
 if(!marker)throw Error('BoostBot copy-all marker missing');
 const list=section.slice(marker.index+marker[0].length);
 const parts=list.split(/\bCopy\s+Copied\b/i);
 if(parts.length<2)throw Error('BoostBot code rows missing');
 const expected=section.match(/\b(\d{1,3})\s+active codes\b/i);
 // Source markup may render an ordered list as "1. CODE" or hide numbering in CSS.
 // Only take the first token of each distinctly delimited Copy/Copied row.
 const codes=[];
 for(let i=0;i<parts.length-1;i++){
  let item=parts[i].trim();
  if(i===0){
   // The first row follows the introductory "Tap a code ... paste rather than type" text.
   const intro=item.match(/\bTap a code to copy it\.[\s\S]*?\bpaste rather than type\.\s*/i);
   if(intro)item=item.slice(intro.index+intro[0].length).trim();
   else {
    // First source row has no reward-description text: capture the trailing token only.
    const last=item.match(/(?:^|\s)([A-Za-z0-9_-]{4,120})(?:\s+Not published)?\s*$/i);
    if(!last)throw Error('BoostBot first code row changed; refusing to guess');
    item=last[1];
   }
  }
  item=item.replace(/^\d{1,3}[.)]\s*/, '');
  const token=item.match(/^([A-Za-z0-9_-]{4,120})(?=\s|$)/);
  if(!token||/^(Copy|Not|Code|Active|Tap|Verified)$/i.test(token[1]))throw Error('BoostBot code row changed; refusing to guess');
  if(/\bNot published\b/i.test(item))continue;
  codes.push(token[1]);
 }
 // Guard against inadvertently accepting article prose as gift codes.
 if(expected&&parts.length-1!==Number(expected[1]))throw Error('BoostBot listed code count changed; refusing partial import');
 if(!codes.length)throw Error('BoostBot has no published code rows');
 return distinctCodes(codes);
}
async function logSource(entry){try{await db('gift_discovery_runs',{method:'POST',body:entry})}catch(e){console.error('[NEXA Gift Discovery logging]',String(e?.message||e))}}
export async function discoverAndPrepare(){
 const started=new Date().toISOString();let found=0,added=0,queued=0,healthy=0;const errors=[];
 const discovered=new Map(),sourceLogs=[];
 for(const source of SOURCES){
  let count=0,status='success',error='';
  try{
   const response=await fetch(source.url,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:{Accept:'text/html','User-Agent':'NEXA-Gift-Discovery/1.1'}});
   if(!response.ok)throw Error(`Source unavailable (${response.status})`);
   const html=await response.text();const codes=source.parse(html);count=codes.length;healthy++;
   for(const code of codes){const key=code.toLowerCase();if(!discovered.has(key))discovered.set(key,{code,source:source.url});}
  }catch(e){status='failed';error=String(e?.message||e).slice(0,350);errors.push(`${source.name}: ${error}`);console.warn('[NEXA Gift Discovery]',source.name,error)}
  sourceLogs.push({source:source.url,started_at:started,finished_at:new Date().toISOString(),status,codes_found:count,codes_added:0,queue_added:0,error_detail:error||null});
 }
 if(healthy){
  found=discovered.size;
  try{
   for(const {code,source} of discovered.values()){
    const item=await rpc('gift_v1_record_discovered_code',{p_code:code,p_source:source,p_reward_type:'unknown'});
    if(item?.added){added++;const log=sourceLogs.find(x=>x.source===source);if(log)log.codes_added++;}
   }
   const result=await rpc('gift_v1_prepare_redemption_queue',{p_limit:5000});queued=Number(result?.queued)||0;
   const firstHealthy=sourceLogs.find(x=>x.status==='success');if(firstHealthy)firstHealthy.queue_added=queued;
  }catch(e){errors.push(`Storage or queue: ${String(e?.message||e).slice(0,350)}`);
   for(const log of sourceLogs)await logSource(log);
   return {ok:false,status:'failed',codes_found:found,codes_added:added,queue_added:queued,redemption_enabled:false,error:errors.join(' | ')}}
 }
 for(const log of sourceLogs)await logSource(log);
 return {ok:healthy>0,status:healthy===SOURCES.length?'success':healthy>0?'partial':'failed',sources_checked:SOURCES.length,sources_available:healthy,codes_found:found,codes_added:added,queue_added:queued,redemption_enabled:false,...(errors.length?{warnings:errors}:{}),...(healthy===0?{error:errors.join(' | ')}:{})};
}
export async function giftCron(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({ok:false,error:'Unauthorized cron'});
 const result=await discoverAndPrepare();return res.status(result.ok?200:502).json(result);
}