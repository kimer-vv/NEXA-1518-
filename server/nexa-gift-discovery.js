/* NEXA Gift Discovery v1.6
 * Public-source discovery and local queue only.
 * Sources:
 *  - WSCO gift-code page, with browser-like request headers
 *  - WSCO homepage fallback
 *  - BoostBot fallback
 * A source failure does not stop the other healthy sources.
 */
const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const TIMEOUT_MS=12000;
const BROWSER_HEADERS={
 Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
 'Accept-Language':'en-US,en;q=0.9',
 'Cache-Control':'no-cache',
 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
};
const SOURCES=[
 {name:'WSCO Gift Codes',url:'https://www.whiteoutsurvival-community.com/en/gift-codes.html',parse:extractWscoGiftPage},
 {name:'WSCO Home',url:'https://www.whiteoutsurvival-community.com/',parse:extractWscoHome},
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
 return out
}
const rpc=(name,body)=>db('rpc/'+name,{method:'POST',body});
function stripHtml(html){return String(html||'').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/\s+/g,' ').trim()}
function validateDocument(html){if(typeof html!=='string'||html.length>3000000)throw Error('Invalid or oversized source document');return stripHtml(html)}
function distinctCodes(codes){const seen=new Set(),out=[];for(const value of codes){const code=String(value||'').trim();if(!/^[A-Za-z0-9_-]{4,120}$/.test(code))continue;const key=code.toLowerCase();if(!seen.has(key)){seen.add(key);out.push(code)}}return out.slice(0,150)}

export function extractWscoGiftPage(html){
 const text=validateDocument(html),start=text.indexOf('Active gift codes');
 if(start<0)throw Error('WSCO active-code section missing');
 const after=text.slice(start+'Active gift codes'.length);
 const end=after.search(/Expired codes|What if you never missed a code again\?|How to redeem/i);
 const block=end>=0?after.slice(0,end):after.slice(0,12000);
 if(/No active codes right now/i.test(block))return [];
 const codes=[...block.matchAll(/Gift code\s+([A-Za-z0-9_-]{4,120})\s+(?:Copy|Online since)/gi)].map(x=>x[1]);
 if(!codes.length){
  // Text renderers may keep code text but omit the exact button label.
  const fallback=[...block.matchAll(/\b([A-Za-z0-9_-]{4,120})\b(?=\s+(?:Copy|Online since))/g)].map(x=>x[1]);
  if(fallback.length)return distinctCodes(fallback);
  throw Error('WSCO code layout changed');
 }
 return distinctCodes(codes)
}
export function extractWscoHome(html){
 const text=validateDocument(html),start=text.indexOf('Active gift codes');
 if(start<0)throw Error('WSCO homepage active-code section missing');
 const after=text.slice(start+'Active gift codes'.length);
 const end=after.search(/Latest event guides|Tools chiefs use daily/i);
 const block=end>=0?after.slice(0,end):after.slice(0,5000);
 if(/No active codes right now/i.test(block))return [];
 return distinctCodes([...block.matchAll(/Gift code\s+([A-Za-z0-9_-]{4,120})\b/gi)].map(x=>x[1]))
}
function parseBoostBotRow(row,index){
 let text=stripHtml(row).trim();
 if(index===0){
  const instruction=text.match(/Tap a code to copy it\.[\s\S]*?paste rather than type\./i);
  if(instruction)text=text.slice(instruction.index+instruction[0].length).trim()
 }
 text=text.replace(/^\s*\d{1,3}\s*[.)]\s*/,'').trim();
 if(/\bNot published\b/i.test(text))return {code:null,notPublished:true};
 const ordinal=text.match(/^([1-9])\s+(st|nd|rd|th)([A-Za-z0-9_-]+)(?=\s|$)/i);
 if(ordinal)text=ordinal[1]+ordinal[2]+ordinal[3]+text.slice(ordinal[0].length);
 const match=text.match(/^([A-Za-z0-9_-]{4,120})(?=\s|$)/);
 if(!match||/^(Copy|Copied|Not|Code|Active|Tap|Verified|Gift|Current|Published)$/i.test(match[1])||/^\d+x$/i.test(match[1]))return null;
 return {code:match[1],notPublished:false}
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
 const section=after.slice(0,end),marker=section.match(/\bCopy\s+all\b/i);
 if(!marker)throw Error('BoostBot copy-all marker missing');
 const rows=section.slice(marker.index+marker[0].length).split(/\bCopy\s+Copied\b/i).slice(0,-1);
 if(!rows.length)throw Error('BoostBot code rows missing');
 const parsed=rows.map((r,i)=>parseBoostBotRow(r,i));
 if(parsed.some(x=>!x))throw Error('BoostBot row layout changed; refusing to guess');
 return distinctCodes(parsed.filter(x=>!x.notPublished).map(x=>x.code))
}
async function logSource(entry){try{await db('gift_discovery_runs',{method:'POST',body:entry})}catch(e){console.error('[NEXA Gift Discovery logging]',String(e?.message||e))}}

export async function discoverAndPrepare(){
 const started=new Date().toISOString();let found=0,added=0,queued=0,healthy=0;const errors=[];
 const discovered=new Map(),sourceLogs=[];
 for(const source of SOURCES){
  let count=0,status='success',error='';
  try{
   const response=await fetch(source.url,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:BROWSER_HEADERS,redirect:'follow'});
   if(!response.ok)throw Error(`Source unavailable (${response.status})`);
   const html=await response.text(),codes=source.parse(html);count=codes.length;healthy++;
   for(const code of codes){const key=code.toLowerCase();if(!discovered.has(key))discovered.set(key,{code,source:source.url})}
  }catch(e){status='failed';error=String(e?.message||e).slice(0,350);errors.push(`${source.name}: ${error}`)}
  sourceLogs.push({source:source.url,started_at:started,finished_at:new Date().toISOString(),status,codes_found:count,codes_added:0,queue_added:0,error_detail:error||null})
 }
 if(healthy){
  found=discovered.size;
  for(const {code,source} of discovered.values()){
   const item=await rpc('gift_v1_record_discovered_code',{p_code:code,p_source:source,p_reward_type:'unknown'});
   if(item?.added){added++;const log=sourceLogs.find(x=>x.source===source);if(log)log.codes_added++}
  }
  const result=await rpc('gift_v1_prepare_redemption_queue',{p_limit:5000});queued=Number(result?.queued)||0;
  const firstHealthy=sourceLogs.find(x=>x.status==='success');if(firstHealthy)firstHealthy.queue_added=queued
 }
 for(const log of sourceLogs)await logSource(log);
 return {ok:healthy>0,status:healthy===SOURCES.length?'success':healthy>0?'partial':'failed',sources_checked:SOURCES.length,sources_available:healthy,codes_found:found,codes_added:added,queue_added:queued,redemption_enabled:false,...(errors.length?{warnings:errors}:{}),...(healthy===0?{error:errors.join(' | ')}:{})}
}
export async function giftCron(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({ok:false,error:'Unauthorized cron'});
 const result=await discoverAndPrepare();return res.status(result.ok?200:502).json(result)
}
