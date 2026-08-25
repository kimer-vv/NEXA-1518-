import {
  SUPABASE_URL,
  SUPABASE_ANON,
  reply,
  serviceKey,
  normalizeGameId,
  cleanName,
  rest
} from './_nexa-auth-common.js';

async function adminCreate(email,password,metadata){
  const service=serviceKey();
  const r=await fetch(`${SUPABASE_URL}/auth/v1/admin/users`,{
    method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},
    body:JSON.stringify({email,password,email_confirm:true,user_metadata:metadata})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data?.message||data?.msg||data?.error_description||'Could not create NEXA account.');
  return data;
}
async function adminDelete(id){
  const service=serviceKey();
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(id)}`,{method:'DELETE',headers:{apikey:service,Authorization:`Bearer ${service}`}}).catch(()=>{});
}
async function login(email,password){
  const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_ANON,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data?.error_description||data?.message||'Could not start NEXA session.');
  return data;
}

export default async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed.'});
  let createdId=null;
  try{
    const rawGameId=String(req.body?.game_id||'').normalize('NFKC').trim();
    const normalized=normalizeGameId(rawGameId);
    const ign=cleanName(req.body?.in_game_name);
    const password=String(req.body?.password||'');
    const stateNumber=Number(String(req.body?.state_number||'').replace(/\D/g,''));
    if(!Number.isInteger(stateNumber)||stateNumber<1)return reply(res,400,{error:'Enter your state.'});
    if(password.length<8)return reply(res,400,{error:'NEXA Password must be at least 8 characters.'});

    const allianceId=req.body?.alliance_id==null?null:Number(req.body.alliance_id);
    const customAlliance=String(req.body?.custom_alliance_tag||'').normalize('NFC').trim().slice(0,12)||null;

    const claimed=await rest(`nexa_login_identities?game_id_normalized=eq.${encodeURIComponent(normalized)}&select=user_id&limit=1`);
    if(claimed?.length)return reply(res,409,{error:'That Game ID is already registered in NEXA.'});
    const existingPlayer=await rest(`player_accounts?player_id=eq.${encodeURIComponent(rawGameId)}&state_number=eq.${encodeURIComponent(stateNumber)}&select=id&limit=1`);
    if(existingPlayer?.length)return reply(res,409,{error:'That Game ID is already registered for this State.'});

    const email=`${normalized}@accounts.nexa.invalid`;
    const user=await adminCreate(email,password,{in_game_name:ign,nexa_game_id:rawGameId,nexa_state_number:stateNumber,auth_method:'game_id'});
    createdId=user.id;
    await rest('nexa_login_identities',{method:'POST',body:{user_id:user.id,game_id:rawGameId,game_id_normalized:normalized,auth_email:email,is_main:true}});
    await rest('player_accounts',{method:'POST',body:{user_id:user.id,player_id:rawGameId,in_game_name:ign,alliance_id:Number.isFinite(allianceId)&&allianceId>0?allianceId:null,custom_alliance_tag:Number.isFinite(allianceId)&&allianceId>0?null:customAlliance,is_main:true,account_purpose:'full',state_number:stateNumber}});
    const session=await login(email,password);
    return reply(res,200,{session:{access_token:session.access_token,refresh_token:session.refresh_token,expires_in:session.expires_in,token_type:session.token_type,user:session.user}});
  }catch(e){
    if(createdId)await adminDelete(createdId);
    const status=e.status||(/duplicate|unique/i.test(e.message||'')?409:500);
    return reply(res,status,{error:e.message||'Could not create NEXA account.'});
  }
}