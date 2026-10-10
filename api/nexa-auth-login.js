import { randomBytes } from 'node:crypto';
import {
  SUPABASE_URL,
  SUPABASE_ANON,
  reply,
  serviceKey,
  normalizeGameId,
  rest
} from '../server/_nexa-auth-common.js';

async function passwordSession(email,password){
  const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
    method:'POST',
    headers:{apikey:SUPABASE_ANON,'Content-Type':'application/json'},
    body:JSON.stringify({email,password})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)return null;
  return data;
}

async function adminCreateUser(email,metadata){
  const service=serviceKey();
  const generatedPassword=randomBytes(48).toString('base64url');
  const r=await fetch(`${SUPABASE_URL}/auth/v1/admin/users`,{
    method:'POST',
    headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},
    body:JSON.stringify({email,password:generatedPassword,email_confirm:true,user_metadata:metadata})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(data?.message||data?.msg||data?.error_description||'Could not activate NEXA account.'),{status:r.status});
  return data;
}

async function sessionForExistingUser(email){
  const service=serviceKey();
  const linkResponse=await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`,{
    method:'POST',
    headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},
    body:JSON.stringify({type:'magiclink',email})
  });
  const link=await linkResponse.json().catch(()=>({}));
  if(!linkResponse.ok)throw Object.assign(new Error('Could not start NEXA session.'),{status:500});

  const tokenHash=link?.properties?.hashed_token||link?.hashed_token;
  if(!tokenHash)throw Object.assign(new Error('Could not start NEXA session.'),{status:500});

  const verifyResponse=await fetch(`${SUPABASE_URL}/auth/v1/verify`,{
    method:'POST',
    headers:{apikey:SUPABASE_ANON,'Content-Type':'application/json'},
    body:JSON.stringify({token_hash:tokenHash,type:'email'})
  });
  const session=await verifyResponse.json().catch(()=>({}));
  if(!verifyResponse.ok||!session?.access_token||!session?.refresh_token)
    throw Object.assign(new Error('Could not start NEXA session.'),{status:500});
  return session;
}

function sessionPayload(data){
  return {
    access_token:data.access_token,
    refresh_token:data.refresh_token,
    expires_in:data.expires_in,
    token_type:data.token_type,
    user:data.user
  };
}

export default async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed.'});

  try{
    const rawGameId=String(req.body?.game_id||'').normalize('NFKC').trim();
    const gameId=normalizeGameId(rawGameId);
    const stateNumber=Number(String(req.body?.state_number||'').replace(/\D/g,''));
    const password=String(req.body?.password||'');

    if(!Number.isInteger(stateNumber)||stateNumber<1)
      return reply(res,400,{error:'Enter your state.'});
    if(password.length<8)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    // Existing NEXA login remains compatible.
    const rows=await rest(
      `nexa_login_identities?game_id_normalized=eq.${encodeURIComponent(gameId)}&select=auth_email,user_id&limit=1`
    );
    const identity=rows?.[0];
    if(identity?.auth_email&&identity?.user_id){
      const accounts=await rest(
        `player_accounts?user_id=eq.${encodeURIComponent(identity.user_id)}&player_id=eq.${encodeURIComponent(rawGameId)}&state_number=eq.${encodeURIComponent(stateNumber)}&select=id&limit=1`
      );
      if(accounts?.length){
        const direct=await passwordSession(identity.auth_email,password);
        if(direct){
          return reply(res,200,{session:sessionPayload(direct),activated:false,login_source:'nexa'});
        }
      }
    }

    // Workspace credentials can activate NEXA, but Workspace existence alone never does.
    const bridge=await rest('rpc/nexa_workspace_auth_bridge_v1',{
      method:'POST',
      body:{p_state_number:stateNumber,p_game_id:rawGameId,p_password:password}
    });
    if(!bridge?.ok)
      return reply(res,401,{error:'Invalid Game ID, State, or password.'});

    let userId=bridge.user_id||null;
    let authEmail=bridge.auth_email||null;

    // Create the internal NEXA auth identity only when this Workspace account
    // does not already belong to an existing Fleet identity.
    if(!userId||!authEmail){
      authEmail=`${gameId}@accounts.nexa.invalid`;
      const created=await adminCreateUser(authEmail,{
        in_game_name:bridge.game_name||'',
        nexa_game_id:rawGameId,
        nexa_state_number:stateNumber,
        auth_method:'workspace_bridge'
      });
      userId=created.id;
      authEmail=created.email||authEmail;
    }

    const finalized=await rest('rpc/nexa_workspace_finalize_activation_v1',{
      method:'POST',
      body:{
        p_state_number:stateNumber,
        p_game_id:rawGameId,
        p_staff_account_id:bridge.staff_account_id,
        p_user_id:userId,
        p_auth_email:authEmail,
        p_activated_via:'nexa_login'
      }
    });
    if(!finalized?.ok)
      throw Object.assign(new Error('Could not activate NEXA for this Workspace account.'),{status:409});

    const linkedSession=await sessionForExistingUser(authEmail);
    return reply(res,200,{
      session:sessionPayload(linkedSession),
      activated:true,
      login_source:'workspace'
    });

  }catch(e){
    const status=e.status===400?400:e.status===409?409:500;
    return reply(res,status,{error:e.message||'Could not sign in.'});
  }
}
