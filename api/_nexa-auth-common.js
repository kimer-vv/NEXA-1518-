export const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://dfxcxboxrkfmrnsgpyin.supabase.co';

export const SUPABASE_ANON =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';

export function reply(res,status,body){
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json(body);
}

export function serviceKey(){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
  if(!key)throw Object.assign(
    new Error('SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel.'),
    {status:503}
  );
  return key;
}

export function normalizeGameId(value){
  const id=String(value??'').normalize('NFKC').trim();
  if(!/^[0-9A-Za-z_-]{4,30}$/.test(id)){
    throw Object.assign(new Error('Enter a valid Game ID.'),{status:400});
  }
  return id.toLowerCase();
}

export function cleanName(value){
  const name=String(value??'')
    .normalize('NFC')
    .trim()
    .replace(/\s+/g,' ');

  if(!name || name.length>40)
    throw Object.assign(
      new Error('Enter a valid In-Game Name.'),
      {status:400}
    );

  for(const ch of name){
    const cp=ch.codePointAt(0);

    if(
      (cp>=0x1D400&&cp<=0x1D7FF) ||
      (cp>=0xFF00&&cp<=0xFFEF) ||
      (cp>=0x2460&&cp<=0x24FF)
    ){
      throw Object.assign(
        new Error(
          'Decorative characters are not supported. Please use standard letters for your In-Game Name.'
        ),
        {status:400}
      );
    }
  }

  if(!/^[\p{L}\p{M}\p{N}\p{Zs}'’._-]+$/u.test(name)){
    throw Object.assign(
      new Error(
        'Use standard letters, numbers, spaces, apostrophes, periods, hyphens or underscores in your In-Game Name.'
      ),
      {status:400}
    );
  }

  return name;
}

export async function rest(
  path,
  {method='GET',body,prefer='return=representation'}={}
){
  const service=serviceKey();

  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    method,
    headers:{
      apikey:service,
      Authorization:`Bearer ${service}`,
      'Content-Type':'application/json',
      Prefer:prefer
    },
    body:body===undefined?undefined:JSON.stringify(body),
    cache:'no-store'
  });

  const raw=await r.text();

  let data=null;
  try{
    data=raw?JSON.parse(raw):null;
  }catch{
    data=raw;
  }

  if(!r.ok){
    const msg=
      data?.message ||
      data?.error_description ||
      data?.error ||
      raw ||
      `Database request failed (${r.status})`;

    throw Object.assign(new Error(msg),{status:r.status});
  }

  return data;
}

export async function authUser(token){
  if(!token)
    throw Object.assign(
      new Error('Sign in required.'),
      {status:401}
    );

  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{
    headers:{
      apikey:SUPABASE_ANON,
      Authorization:`Bearer ${token}`
    },
    cache:'no-store'
  });

  const data=await r.json().catch(()=>null);

  if(!r.ok||!data?.id)
    throw Object.assign(
      new Error('Invalid NEXA session.'),
      {status:401}
    );

  return data;
}