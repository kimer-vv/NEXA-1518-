const crypto=require('crypto');
const {json,bypassCookie}=require('./_nexa-maintenance-common');
function safeEqual(a,b){
 const A=Buffer.from(String(a||''));const B=Buffer.from(String(b||''));
 return A.length===B.length && crypto.timingSafeEqual(A,B);
}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
 const expected=process.env.NEXA_OWNER_RECOVERY_SECRET||'';
 if(!expected)return json(res,503,{error:'Owner recovery secret is not configured in Vercel.'});
 if(!safeEqual(req.body?.secret,expected))return json(res,403,{error:'Invalid Owner recovery secret.'});
 try{bypassCookie(res);return json(res,200,{ok:true});}
 catch(e){return json(res,500,{error:e.message});}
};