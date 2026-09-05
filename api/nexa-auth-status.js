import {
  reply,
  authUser,
  rest
} from '../server/_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='POST')
    return reply(res,405,{error:'Method not allowed.'});

  try{
    const token=String(
      req.headers.authorization||''
    ).replace(/^Bearer\s+/i,'');

    const user=await authUser(token);

    const serviceRoleRows=await rest(
      `user_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`
    );

    const role=String(
      serviceRoleRows?.[0]?.role||'player'
    ).toLowerCase();

    const provider=String(
      user?.app_metadata?.provider||''
    );

    if(provider==='discord'){
      return reply(res,200,{
        allowed:role==='owner',
        role,
        method:'discord'
      });
    }

    const identities=await rest(
      `nexa_login_identities?user_id=eq.${encodeURIComponent(user.id)}&select=game_id,is_main&order=is_main.desc&limit=5`
    );

    return reply(res,200,{
      allowed:Boolean(identities?.length),
      role,
      method:'game_id',
      game_ids:identities||[]
    });

  }catch(e){
    return reply(
      res,
      e.status||500,
      {error:e.message||'Could not verify NEXA session.'}
    );
  }
}
