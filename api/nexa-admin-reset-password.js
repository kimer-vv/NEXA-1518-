import {
  SUPABASE_URL,
  reply,
  serviceKey,
  authUser,
  rest
} from './_nexa-auth-common.js';

export default async function handler(req,res){
  if(req.method!=='POST') return reply(res,405,{error:'Method not allowed.'});
  try{
    const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
    const caller=await authUser(token);
    const accountId=String(req.body?.account_id||'').trim();
    const password=String(req.body?.password||'');
    if(!accountId) return reply(res,400,{error:'Account is required.'});
    if(password.length<8) return reply(res,400,{error:'Temporary password must be at least 8 characters.'});

    const roleRows=await rest(`user_roles?user_id=eq.${encodeURIComponent(caller.id)}&select=role&limit=1`);
    const appRole=String(roleRows?.[0]?.role||'player').toLowerCase();

    const targetRows=await rest(`player_accounts?id=eq.${encodeURIComponent(accountId)}&select=id,user_id,alliance_id,in_game_name&limit=1`);
    const target=targetRows?.[0];
    if(!target) return reply(res,404,{error:'Player account not found.'});

    let allowed=appRole==='owner'||appRole==='admin';
    if(!allowed){
      const callerAccounts=await rest(`player_accounts?user_id=eq.${encodeURIComponent(caller.id)}&is_main=eq.true&select=alliance_id,alliance_role&limit=1`);
      const main=callerAccounts?.[0];
      allowed=String(main?.alliance_role||'').toUpperCase()==='R5' &&
              String(main?.alliance_id??'')===String(target.alliance_id??'');
    }
    if(!allowed) return reply(res,403,{error:'Owner, Admin, or the member’s R5 is required.'});
    if(target.user_id===caller.id && !['owner','admin'].includes(appRole))
      return reply(res,403,{error:'R5 cannot reset their own password.'});

    const service=serviceKey();
    const r=await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(target.user_id)}`,{
      method:'PUT',
      headers:{
        apikey:service,
        Authorization:`Bearer ${service}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({password})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok) return reply(res,r.status,{error:data?.message||data?.error||'Could not reset password.'});
    return reply(res,200,{ok:true});
  }catch(e){
    return reply(res,e.status||500,{error:e.message||'Could not reset password.'});
  }
}
