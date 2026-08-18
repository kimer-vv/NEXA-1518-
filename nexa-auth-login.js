import {SUPABASE_URL,SUPABASE_ANON,reply,normalizeGameId,rest} from './_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed.'});
  try{
    const gameId=normalizeGameId(req.body?.game_id);
    const password=String(req.body?.password||'');
    if(password.length<8)return reply(res,401,{error:'Invalid Game ID or password.'});

    const rows=await rest(
      `nexa_login_identities?game_id_normalized=eq.${encodeURIComponent(gameId)}&select=auth_email&limit=1`
    );
    const email=rows?.[0]?.auth_email;
    if(!email)return reply(res,401,{error:'Invalid Game ID or password.'});

    const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
      method:'POST',
      headers:{apikey:SUPABASE_ANON,'Content-Type':'application/json'},
      body:JSON.stringify({email,password})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)return reply(res,401,{error:'Invalid Game ID or password.'});

    return reply(res,200,{session:{
      access_token:data.access_token,
      refresh_token:data.refresh_token,
      expires_in:data.expires_in,
      token_type:data.token_type,
      user:data.user
    }});
  }catch(e){
    return reply(res,e.status===400?400:500,{error:e.message||'Could not sign in.'});
  }
}
