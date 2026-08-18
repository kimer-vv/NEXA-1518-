import {reply,rest} from './_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed.'});
  try{
    const rows=await rest('alliances?is_active=eq.true&select=id,tag&order=tag.asc');
    return reply(res,200,{alliances:rows||[]});
  }catch(e){
    return reply(res,e.status||500,{error:e.message||'Could not load alliances.'});
  }
}
