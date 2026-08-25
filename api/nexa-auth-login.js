import {
  SUPABASE_URL,
  SUPABASE_ANON,
  reply,
  normalizeGameId,
  rest
} from './_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='POST')
    return reply(res,405,{error:'Method not allowed.'});

  try{
    const rawGameId=String(req.body?.game_id||'').normalize('NFKC').trim();
    const gameId=normalizeGameId(rawGameId);
    const stateNumber=Number(String(req.body?.state_number||'').replace(/\D/g,''));
    const password=String(req.body?.password||'');

    if(!Number.isInteger(stateNumber)||stateNumber<1)
      return reply(res,400,{error:'Enter your state.'});

    if(password.length<8)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    const rows=await rest(
      `nexa_login_identities?game_id_normalized=eq.${encodeURIComponent(gameId)}&select=auth_email,user_id&limit=1`
    );

    const identity=rows?.[0];
    if(!identity?.auth_email||!identity?.user_id)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    const accounts=await rest(
      `player_accounts?user_id=eq.${encodeURIComponent(identity.user_id)}&player_id=eq.${encodeURIComponent(rawGameId)}&state_number=eq.${encodeURIComponent(stateNumber)}&select=id&limit=1`
    );

    if(!accounts?.length)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    const r=await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method:'POST',
        headers:{
          apikey:SUPABASE_ANON,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({email:identity.auth_email,password})
      }
    );

    const data=await r.json().catch(()=>({}));

    if(!r.ok)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    return reply(res,200,{
      session:{
        access_token:data.access_token,
        refresh_token:data.refresh_token,
        expires_in:data.expires_in,
        token_type:data.token_type,
        user:data.user
      }
    });

  }catch(e){
    return reply(
      res,
      e.status===400?400:500,
      {error:e.message||'Could not sign in.'}
    );
  }
}
