const {json,userRole,bypassCookie}=require('./_nexa-maintenance-common');
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed.'});
 try{
   const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
   const role=await userRole(token);
   if(role!=='owner')return json(res,403,{error:'This Discord account is not linked to the NEXA Owner.'});
   bypassCookie(res);
   return json(res,200,{ok:true});
 }catch(e){return json(res,e.status||500,{error:e.message||'Owner verification failed.'});}
};