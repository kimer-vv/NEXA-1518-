/* NEXA controlled gift-code redemption — single-account test ONLY.
 * CREATE server/nexa-gift-redeemer.js
 * This is deliberately NOT connected to discovery/cron or bulk queues.
 * Reference: https://github.com/justncodes/wos-giftcode (v5 protocol).
 */
import { createHash, timingSafeEqual } from 'node:crypto';

const ENDPOINT='https://wos-giftcode-api.centurygame.com/api/gift_code';
const ORIGIN='https://wos-giftcode.centurygame.com';
const SIGNING_SALT='tB87#kPtkxqOS2';
const TEST_FID='439740340';
const TEST_STATE='2800';
const statuses=new Map([
 ['SUCCESS:0',['success',true]],
 ['SAME TYPE EXCHANGE:40011',['success',true]],
 ['RECEIVED:40008',['already_redeemed',true]],
 ['TIME ERROR:40007',['expired',true]],
 ['CDK NOT FOUND:40014',['invalid_code',true]],
 ['USED:40005',['claim_limit',true]],
 ['TOO FREQUENT:40019',['rate_limited',false]],
 ['TIMEOUT RETRY:40004',['retry_later',false]],
 ['USER INFO ERROR:40020',['wrong_state',true]],
 ['STOVE_LV ERROR:40006',['furnace_level',true]],
 ['RECHARGE_MONEY ERROR:40017',['spending_requirement',true]],
 ['RECHARGE_MONEY_VIP ERROR:40018',['vip_requirement',true]],
]);
function authorized(value,secret){
 const a=Buffer.from(String(value||'')),b=Buffer.from('Bearer '+secret);
 return a.length===b.length && timingSafeEqual(a,b);
}
function signedPayload(fid,kid,cdk){
 const data={fid,cdk,kid,time:String(Math.floor(Date.now()/1000))};
 const encoded=Object.keys(data).sort().map(k=>`${k}=${data[k]}`).join('&');
 return {sign:createHash('md5').update(encoded+SIGNING_SALT).digest('hex'),...data};
}
function classify(response){
 const msg=String(response?.msg||'').trim().replace(/\.$/,'');
 const code=Number(response?.err_code||0);
 if(msg==='SUCCESS'&&Number(response?.code)===0)return {status:'success',terminal:true};
 const item=statuses.get(`${msg}:${code}`);
 return item?{status:item[0],terminal:item[1]}:{status:'unrecognized_provider_response',terminal:false};
}
export async function redeemSingleTest(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST required'});
 const secret=process.env.NEXA_GIFT_TEST_SECRET||'';
 if(secret.length<24||!authorized(req.headers.authorization,secret))return res.status(401).json({ok:false,error:'Unauthorized'});
 if(process.env.NEXA_GIFT_TEST_ENABLED!=='true')return res.status(503).json({ok:false,error:'Single-account test is disabled'});
 const fid=String(req.body?.game_id||'').trim();
 const kid=String(req.body?.state_number||'').trim();
 const code=String(req.body?.code||'').trim();
 if(fid!==TEST_FID||kid!==TEST_STATE)return res.status(403).json({ok:false,error:'Test restricted to the authorized account and state'});
 if(!/^[A-Za-z0-9_-]{4,120}$/.test(code))return res.status(400).json({ok:false,error:'Invalid gift-code format'});
 // No automatic retries: ambiguous network failure must not generate repeated claims.
 const form=new URLSearchParams(signedPayload(fid,kid,code));
 let response;
 try{
  response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','Origin':ORIGIN,'Referer':ORIGIN+'/'},body:form,signal:AbortSignal.timeout(12000)});
 }catch(e){return res.status(502).json({ok:false,status:'transport_unknown',error:'Provider connection failed or timed out; check game mail before retrying'});}
 if(!response.ok)return res.status(502).json({ok:false,status:'provider_http_error',http_status:response.status});
 let data;
 try{data=await response.json()}catch{return res.status(502).json({ok:false,status:'invalid_provider_json'});}
 const result=classify(data);
 return res.status(200).json({ok:result.status==='success'||result.status==='already_redeemed',game_id:fid,state_number:Number(kid),code,status:result.status,terminal:result.terminal,provider_message:String(data?.msg||'').slice(0,100),provider_error_code:data?.err_code??null,mail_confirmation_required:result.status==='success'});
}
