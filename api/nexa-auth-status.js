import {
  reply,
  authUser,
  rest
} from '../server/_nexa-auth-common.js';

const HERO_IMAGE_HOSTS = new Set([
  'gom-s3-user-avatar.s3.us-west-2.amazonaws.com'
]);

async function serveHeroImage(req,res){
  const raw = typeof req.query?.image === 'string'
    ? req.query.image
    : '';

  if(!raw)
    return reply(res,400,{error:'Missing image URL.'});

  let target;
  try{
    target = new URL(raw);
  }catch{
    return reply(res,400,{error:'Invalid image URL.'});
  }

  if(
    target.protocol !== 'https:' ||
    !HERO_IMAGE_HOSTS.has(target.hostname)
  ){
    return reply(res,403,{error:'Image host not allowed.'});
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    ()=>controller.abort(),
    10000
  );

  try{
    const upstream = await fetch(
      target.toString(),
      {
        redirect:'follow',
        signal:controller.signal,
        headers:{
          'User-Agent':'NEXA/1.0 hero-image'
        }
      }
    );

    if(!upstream.ok){
      return res
        .status(upstream.status)
        .send('Image unavailable');
    }

    const contentType =
      upstream.headers.get('content-type') || '';

    if(
      !contentType
        .toLowerCase()
        .startsWith('image/')
    ){
      return res
        .status(415)
        .send('Not an image');
    }

    const body = Buffer.from(
      await upstream.arrayBuffer()
    );

    if(body.length > 6 * 1024 * 1024){
      return res
        .status(413)
        .send('Image too large');
    }

    res.setHeader(
      'Content-Type',
      contentType
    );
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
    );
    res.setHeader(
      'Access-Control-Allow-Origin',
      '*'
    );

    return res.status(200).send(body);

  }catch(e){
    if(e?.name === 'AbortError')
      return res
        .status(504)
        .send('Image timeout');

    return res
      .status(502)
      .send('Image proxy error');

  }finally{
    clearTimeout(timeout);
  }
}

export default async function handler(req,res){
  if(req.method==='GET'){
    return serveHeroImage(req,res);
  }

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
