import {reply,authUser,rest} from './_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='GET') return reply(res,405,{error:'Method not allowed.'});

  try{
    const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
    const user=await authUser(token);

    const accounts=await rest(
      `player_accounts?user_id=eq.${encodeURIComponent(user.id)}&select=id,user_id,in_game_name,player_id,alliance_id,custom_alliance_tag,created_at,updated_at,is_main,account_purpose,alliance_role,furnace_level,power,deployment_capacity,profile_photo_url&order=is_main.desc,created_at.asc`
    );

    return reply(res,200,{
      ok:true,
      accounts:Array.isArray(accounts)?accounts:[]
    });
  }catch(error){
    return reply(res,error.status||500,{
      error:error.message||'Could not load player accounts.'
    });
  }
}
