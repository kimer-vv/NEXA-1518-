/* NEXA Gift Discovery v1.5 | REPLACE EXISTING: server/nexa-gift-discovery.js
 * Public-source discovery and local queue ONLY. No redemption requests or player IDs sent to sources.
 * BoostBot: preserve leading ordinal digits in codes (2ndYoutubeKR), separate rewards,
 * skip unpublished placeholders, and reject ambiguous layouts instead of inventing codes.
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
function stripHtml(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/\s+/g,' ').trim()}
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
function parseBoostBotRow(row,index){
 let text=stripHtml(row).trim();
 if(index===0){
  const instruction=text.match(/Tap a code to copy it\.[\s\S]*?paste rather than type\./i);
  if(instruction)text=text.slice(instruction.index+instruction[0].length).trim();
 }
 // Only remove explicitly punctuated list numbering. Never strip a leading digit
 // from 2ndYoutubeKR / 1stYoutubeKR just because it looks like a row index.
 text=text.replace(/^\s*\d{1,3}\s*[.)]\s*/,'').trim();
 if(/\bNot published\b/i.test(text))return {code:null,notPublished:true};
 // BoostBot can split a code's ordinal digit and suffix across HTML elements:
 // "2 ndYoutubeKR 5x 100 Gems" is code "2ndYoutubeKR", NOT a numbered row.
 // Rejoin ONLY a 1-9 digit followed by st/nd/rd/th and an alphanumeric suffix.
 const ordinal=text.match(/^([1-9])\s+(st|nd|rd|th)([A-Za-z0-9_-]+)(?=\s|$)/i);
 if(ordinal)text=ordinal[1]+ordinal[2]+ordinal[3]+text.slice(ordinal[0].length);
 // An unpunctuated ordinal row index may be present, but is ambiguous unless
 // independently identified in source markup. Reject rather than guess.
 const match=text.match(/^([A-Za-z0-9_-]{4,120})(?=\s|$)/);
 if(!match||/^(Copy|Copied|Not|Code|Active|Tap|Verified|Gift|Current|Published)$/i.test(match[1]))return null;
 // Reward counts like "5x 100 Gems" must never be interpreted as gift codes.
 if(/^\d+x$/i.test(match[1]))return null;
 return {code:match[1],notPublished:false};
}
export function extractBoostBotActiveCodes(html,now=new Date()){
 const text=validateDocument(html);
 const start=text.indexOf('Current Active Whiteout Survival Gift Codes');
 if(start<0)throw Error('BoostBot active-code heading missing');
 const nearby=text.slice(Math.max(0,start-1000),start+1100);
 const months='January|February|March|April|May|June|July|August|September|October|November|December';
 const dateRegex=new RegExp(`(?:Updated|Verified)\\s+(${months})\\s+(\\d{1,2}),?\\s+(20\\d{2})`,'i');
 const dated=nearby.match(dateRegex);
 if(!dated)throw Error('BoostBot update date unavailable; refusing stale codes');
 const stamp=new Date(`${dated[1]} ${dated[2]}, ${dated[3]} 12:00:00 GMT`);
 const age=now.getTime()-stamp.getTime();
 if(!Number.isFinite(age)||age< -2*86400000||age>14*86400000)throw Error('BoostBot list older than 14 days');
 const after=text.slice(start+'Current Active Whiteout Survival Gift Codes'.length);
 const end=after.search(/Want something better than a code\?|How to Redeem|Expired (?:Gift )?Codes|Frequently Asked Questions/i);
 if(end<0)throw Error('BoostBot section end missing');
 const section=after.slice(0,end),expected=section.match(/\b(\d{1,3})\s+active codes\b/i);
 const marker=section.match(/\bCopy\s+all\b/i);
 if(!marker)throw Error('BoostBot copy-all marker missing');
 const list=section.slice(marker.index+marker[0].length);
 const rawRows=list.split(/\bCopy\s+Copied\b/i);
 const rows=rawRows.slice(0,-1);
 if(rows.length<1)throw Error('BoostBot code rows missing');
 let parsed=rows.map((r,i)=>parseBoostBotRow(r,i));
 if(parsed.some(x=>!x)||expected&&rows.length!==Number(expected[1])){
  const activeHeading=html.search(/Current Active Whiteout Survival Gift Codes/i);
  const tail=html.slice(Math.max(0,activeHeading));
  const cutoff=tail.search(/Want something better than a code\?|How to Redeem|Recently Expired Whiteout Survival Codes/i);
  const activeHtml=cutoff>=0?tail.slice(0,cutoff):tail.slice(0,180000);
  const listItems=[...activeHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/gi)].map(m=>m[1]);
  if(listItems.length>=1&&(!expected||listItems.length===Number(expected[1]))){
   const itemRows=listItems.map((v,i)=>parseBoostBotRow(v,i));
   if(itemRows.every(Boolean))parsed=itemRows;
  }
 }
 if(parsed.some(x=>!x)||expected&&parsed.length!==Number(expected[1])){
  const bad=parsed.findIndex(x=>!x);
  const sample=bad>=0?stripHtml(rows[bad]||'').slice(0,70).replace(/[^A-Za-z0-9 ._-]/g,''):'';
  throw Error(`BoostBot row layout changed (rows ${rows.length}, expected ${expected?.[1]||'unknown'}, bad row ${bad+1}, sample ${sample||'none'}); refusing to guess`);
 }
 const codes=distinctCodes(parsed.filter(x=>!x.notPublished).map(x=>x.code));
 if(!codes.length)throw Error('BoostBot has no published code rows');
 return codes;
}
async function logSource(entry){try{await db('gift_discovery_runs',{method:'POST',body:entry})}catch(e){console.error('[NEXA Gift Discovery logging]',String(e?.message||e))}}
export async function discoverAndPrepare(){
 const started=new Date().toISOString();let found=0,added=0,queued=0,healthy=0;const errors=[];
 const discovered=new Map(),sourceLogs=[];
 for(const source of SOURCES){
  let count=0,status='success',error='';
  try{
   const response=await fetch(source.url,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:{Accept:'text/html','User-Agent':'NEXA-Gift-Discovery/1.5'}});
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
   return {ok:false,status:'failed',codes_found:found,codes_added:added,queue_added:queued,redemption_enabled:false,error:errors.join(' | ')};
  }
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