/* NEXA Gift Auto Worker v3. New file: server/nexa-gift-auto-worker.js
 * Requires SQL migration 01_gift_auto_redeem.sql.
 * Deliberately disabled unless NEXA_GIFT_AUTO_ENABLED=true.
 * Uses the same provider protocol validated in the single-account test.
 */
import {createHash} from 'node:crypto';
const SB_URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const ENDPOINT='https://wos-giftcode-api.centurygame.com/api/gift_code';
const ORIGIN='https://wos-giftcode.centurygame.com';
const SALT='tB87#kPtkxqOS2';
const MAX_PER_RUN=4;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function rpc(name,body){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw Error('SUPABASE_SERVICE_ROLE_KEY missing');
 const response=await fetch(`${SB_URL}/rest/v1/rpc/${name}`,{method:'POST',
  headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
  body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
 const raw=await response.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=null}
 if(!response.ok)throw Error(`RPC ${name} HTTP ${response.status}: ${String(data?.message||'error').slice(0,150)}`);
 return data;
}
function signedPayload(fid,kid,cdk){
 const data={fid:String(fid),cdk:String(cdk),kid:String(kid),time:String(Math.floor(Date.now()/1000))};
 const encoded=Object.keys(data).sort().map(k=>`${k}=${data[k]}`).join('&');
 return {sign:createHash('md5').update(encoded+SALT).digest('hex'),...data};
}
function classify(data){
 const msg=String(data?.msg||'').trim().replace(/\.$/,'');
 const err=Number(data?.err_code);
 if(msg==='SUCCESS' && (err===20000||Number(data?.code)===0))return {status:'redeemed',code:String(err),error:null};
 if(err===40011)return {status:'redeemed',code:String(err),error:msg};
 if(err===40008)return {status:'already_redeemed',code:String(err),error:msg};
 if(err===40007)return {status:'expired',code:String(err),error:msg};
 // Rate-limited or transient provider errors may be retried with a delay.
 if([40019,40004].includes(err))return {status:'retry_scheduled',code:String(err),error:msg};
 // Do not treat unknown responses as success or automatically retry them.
 if([40014,40005,40020,40006,40017,40018].includes(err))return {status:'failed',code:String(err),error:msg};
 return {status:'unknown',code:Number.isFinite(err)?String(err):null,error:msg||'unrecognized_provider_response'};
}
async function redeem(job){
 if(!/^[0-9]{1,30}$/.test(String(job.game_id))||!Number.isInteger(Number(job.state_number))||
  !/^[A-Za-z0-9_-]{4,120}$/.test(String(job.code)))
  return {status:'failed',code:'invalid_job',error:'Invalid queued game ID, state or code'};
 let response;
 try{
  response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',
   Accept:'application/json',Origin:ORIGIN,Referer:ORIGIN+'/'},
   body:new URLSearchParams(signedPayload(job.game_id,job.state_number,job.code)),
   signal:AbortSignal.timeout(12000)});
 }catch{return {status:'unknown',code:'transport_unknown',error:'Network failure; check game mail before manual retry'};}
 if(!response.ok)return {status:'unknown',code:`http_${response.status}`,error:'Unexpected provider HTTP response'};
 let data;try{data=await response.json()}catch{return {status:'unknown',code:'invalid_json',error:'Invalid provider JSON response'};}
 return classify(data);
}
export async function runGiftAutoWorker(){
 if(process.env.NEXA_GIFT_AUTO_ENABLED!=='true')return {enabled:false,processed:0};
 const stale=await rpc('gift_v3_mark_stale_unknown',{});
 let processed=0,redeemed=0,already_redeemed=0,failed=0,unknown=0,retry_scheduled=0;
 for(let i=0;i<MAX_PER_RUN;i++){
  const job=await rpc('gift_v3_claim_redemption',{p_max_attempts:3});
  if(!job)break;
  const result=await redeem(job);
  await rpc('gift_v3_finish_redemption',{p_id:job.id,p_attempt:job.attempt_count,
   p_status:result.status,p_provider_code:result.code,p_error:result.error});
  processed++;
  if(result.status==='redeemed')redeemed++;
  else if(result.status==='already_redeemed')already_redeemed++;
  else if(result.status==='retry_scheduled')retry_scheduled++;
  else if(result.status==='unknown')unknown++;
  else failed++;
  if(i+1<MAX_PER_RUN)await sleep(300);
 }
 return {enabled:true,processed,redeemed,already_redeemed,failed,unknown,retry_scheduled,stale_marked_unknown:stale};
}
