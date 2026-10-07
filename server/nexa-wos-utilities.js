  /* NEXA WOS Utilities Server Handler V4.0
     * Multi-State / Multi-Server alliance-scoped permissions.
     * Preserves existing route and event/reminder/Discord flows.
     * R4/R5 are scoped to State + Alliance. Global Owner is explicit.
     * Invite links are available to both R4 and R5.
     */
    import { createHash, randomBytes } from 'node:crypto';
    import { sendChannel, discord } from '../lib/discord-common.js';

    const URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
    const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
    const enc=x=>encodeURIComponent(String(x));
    const fail=(m,s=400)=>Object.assign(new Error(m),{status:s});

    async function db(path,{method='GET',body,prefer='return=representation'}={}){
     if(!KEY)throw fail('Server configuration unavailable.',503);
     const r=await fetch(`${URL}/rest/v1/${path}`,{
      method,
      headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:prefer},
      body:body===undefined?undefined:JSON.stringify(body)
     });
     const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}
     if(!r.ok)throw fail(d?.message||d?.error||`Database request failed (${r.status}).`,r.status>=500?502:400);
     return d;
    }
    async function rpc(name,body){return db(`rpc/${name}`,{method:'POST',body});}
    function token(req){const a=String(req.headers.authorization||'');return a.startsWith('Bearer ')?a.slice(7).trim():''}
    function hashToken(v){return createHash('sha256').update(String(v)).digest('hex')}

    async function resolveNexaIdentity(gameId){
     const rows=await db(`player_accounts?game_id=eq.${enc(gameId)}&select=id,user_id,game_id,in_game_name,state_number,alliance_id,alliance_tag,alliance_role&limit=1`);
     return rows?.[0]||null;
    }
    async function globalOwnerFor(identity){
     if(!identity?.user_id)return false;
     const rows=await db(`user_roles?user_id=eq.${enc(identity.user_id)}&role=eq.owner&select=user_id&limit=1`);
     return rows.length>0;
    }
    async function canonicalAccess(gameId){
     try{await rpc('nexa_sync_legacy_wos_access',{p_game_id:String(gameId)});}catch{}
     return db(`nexa_wos_alliance_access?game_id=eq.${enc(gameId)}&status=eq.active&select=id,state_number,alliance_id,game_id,user_id,player_account_id,role,status,created_at,updated_at&order=created_at.asc`);
    }
    async function allianceRow(id){
     return (await db(`gift_alliances?id=eq.${enc(id)}&deleted_at=is.null&select=id,state_number,tag,name,is_active&limit=1`))[0]||null;
    }
    async function session(req){
     const raw=token(req);if(!raw)throw fail('Staff sign-in required.',401);
     const hash=hashToken(raw);
     const ss=await db(`transfer_staff_sessions?token_hash=eq.${hash}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
     if(!ss.length)throw fail('Staff session expired.',401);
     const ac=(await db(`transfer_staff_accounts?id=eq.${ss[0].account_id}&select=id,game_id,game_name,username&limit=1`))[0];
     if(!ac)throw fail('Staff account not found.',401);

     const identity=await resolveNexaIdentity(ac.game_id);
     const global_owner=await globalOwnerFor(identity);
     const access=await canonicalAccess(ac.game_id);

     if(!global_owner&&!access.length)throw fail('No WOS Utilities R4/R5 access has been assigned.',403);
     return {raw,account:ac,identity,global_owner,access};
    }
    const isGlobalOwner=s=>s.global_owner===true;
    function accessForAlliance(s,id){
     const key=String(id||'');
     return s.access.find(x=>String(x.alliance_id)===key&&['r4','r5'].includes(String(x.role)))||null;
    }
    function canManageAlliance(s,id){return isGlobalOwner(s)||!!accessForAlliance(s,id)}
    function isR5For(s,id){return isGlobalOwner(s)||accessForAlliance(s,id)?.role==='r5'}
    function isR4OrR5For(s,id){return isGlobalOwner(s)||['r4','r5'].includes(accessForAlliance(s,id)?.role)}
    async function requireAlliance(s,id){
     id=String(id||'');if(!id)throw fail('Alliance is required.');
     const a=await allianceRow(id);if(!a)throw fail('Alliance not found.',404);
     if(!canManageAlliance(s,id))throw fail('Access denied for this alliance.',403);
     return a;
    }
    async function requireR5(s,id){
     const a=await requireAlliance(s,id);
     if(!isR5For(s,a.id))throw fail('R5 access required for this action.',403);
     return a;
    }
    async function requireR4OrR5(s,id){
     const a=await requireAlliance(s,id);
     if(!isR4OrR5For(s,a.id))throw fail('R4 or R5 access required.',403);
     return a;
    }
    async function scopedAllianceIds(s){
     if(isGlobalOwner(s)){
      const rows=await db('gift_alliances?deleted_at=is.null&select=id');
      return new Set(rows.map(x=>String(x.id)));
     }
     return new Set(s.access.filter(x=>['r4','r5'].includes(x.role)).map(x=>String(x.alliance_id)));
    }
    async function staffForAlliance(allianceId){
     const rows=await db(`nexa_wos_alliance_access?alliance_id=eq.${enc(allianceId)}&status=eq.active&select=id,state_number,alliance_id,game_id,user_id,player_account_id,role,status,created_at,updated_at&order=created_at.asc`);
     const gameIds=[...new Set(rows.map(x=>x.game_id).filter(Boolean))];
     let accounts=[];
     if(gameIds.length)accounts=await db(`transfer_staff_accounts?game_id=in.(${gameIds.map(enc).join(',')})&select=id,game_id,game_name,username`);
     const byGame=new Map(accounts.map(a=>[String(a.game_id),a]));
     return rows.map(x=>({...x,staff_account_id:byGame.get(String(x.game_id))?.id||null,game_name:byGame.get(String(x.game_id))?.game_name||null,username:byGame.get(String(x.game_id))?.username||null,registered:!!byGame.get(String(x.game_id))}));
    }
    async function snapshot(s){
     const states=await db('gift_states?select=state_number,display_name,is_active&order=state_number.asc');
     const all=await db('gift_alliances?deleted_at=is.null&select=id,state_number,tag,name,is_active&order=state_number.asc,tag.asc');
     const ids=await scopedAllianceIds(s);
     const visible=isGlobalOwner(s)?all:all.filter(a=>ids.has(String(a.id)));

     let staff=[];
     for(const a of visible)staff.push(...await staffForAlliance(a.id));

     const primary=s.access[0]||null;
     return {
      ok:true,
      me:{
       account_id:s.account.id,game_id:s.account.game_id,game_name:s.account.game_name,username:s.account.username,
       role:isGlobalOwner(s)?'owner':primary?.role||null,
       state_number:primary?.state_number||s.identity?.state_number||null,
       main_alliance_id:primary?.alliance_id||null,
       global_owner:isGlobalOwner(s),
       alliance_access:s.access.map(x=>({state_number:x.state_number,alliance_id:x.alliance_id,role:x.role}))
      },
      states,
      alliances:visible,
      all_alliances:isGlobalOwner(s)?all:visible,
      staff,
      can_manage_staff:isGlobalOwner(s)||s.access.some(x=>x.role==='r5'),
      is_owner:isGlobalOwner(s)
     };
    }
    async function events(s){
     const all=await db('wos_event_reminders?select=*&order=updated_at.desc');
     if(isGlobalOwner(s))return all;
     const ids=await scopedAllianceIds(s);
     return all.filter(e=>e.alliance_id&&ids.has(String(e.alliance_id)));
    }
    async function linkedServer(s,allianceId,guildId){
     const a=await requireR4OrR5(s,allianceId),gid=String(guildId||'').trim();
     if(!/^\d{10,30}$/.test(gid))throw fail('Invalid Discord Server ID.');
     const row=(await db(`wos_discord_alliance_links?alliance_id=eq.${enc(a.id)}&guild_id=eq.${enc(gid)}&enabled=eq.true&select=*&limit=1`))[0];
     if(!row)throw fail('This Discord server is not linked to the current alliance.',409);
     return row;
    }
    async function visibleTextChannels(guildId){
     const channels=await discord(`/guilds/${guildId}/channels`);
     return (channels||[]).filter(c=>[0,5].includes(Number(c.type))).sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0)).map(c=>({id:String(c.id),name:String(c.name||c.id),type:Number(c.type)}));
    }
    async function visibleRoles(guildId){
     const roles=await discord(`/guilds/${guildId}/roles`);
     return (roles||[]).filter(r=>String(r.id)!==String(guildId)&&!r.managed).sort((a,b)=>(Number(b.position)||0)-(Number(a.position)||0)).map(r=>({id:String(r.id),name:String(r.name||r.id),position:Number(r.position)||0,mentionable:!!r.mentionable}));
    }
    async function verifyChannelInGuild(guildId,channelId){
     const cid=String(channelId||'').trim();if(!/^\d{10,30}$/.test(cid))throw fail('Select a valid Discord channel.');
     const channel=(await visibleTextChannels(guildId)).find(c=>c.id===cid);
     if(!channel)throw fail('That channel does not belong to the selected linked Discord server, or the bot cannot see it.',409);
     return channel;
    }
    async function verifyRoleInGuild(guildId,roleId){
     const rid=String(roleId||'').trim();if(!/^\d{10,30}$/.test(rid))throw fail('Select a valid Discord role.');
     const role=(await visibleRoles(guildId)).find(r=>r.id===rid);
     if(!role)throw fail('That role does not belong to the selected linked Discord server, is managed by an integration, or the bot cannot see it.',409);
     return role;
    }
    function previewToEmbed(preview,{test=false,compact=false,offsetMinutes=null}={}){
     const raw=String(preview||'NEXA Event Reminder').slice(0,5000),lines=raw.split('\n');
     const first=String(lines.shift()||'Event Reminder').trim();
     const bearEmoji=String.fromCodePoint(0x1F43B),clockEmoji=String.fromCodePoint(0x1F552),testEmoji=String.fromCodePoint(0x1F9EA),fireEmoji=String.fromCodePoint(0x1F525),hourglassEmoji=String.fromCodePoint(0x23F3);
     const title=first.replace(/^[^A-Za-z0-9]*BEAR/i,'BEAR').trim().toUpperCase();
     const timeLine=lines.find(x=>/^Time:\s*/i.test(x))||'',eventTime=timeLine.replace(/^Time:\s*/i,'').trim();
     const cleanTitle=title.includes('BEAR')?`${bearEmoji} ${title.includes('REMINDER')?title:`${title} REMINDER`}`:`${clockEmoji} ${title.includes('REMINDER')?title:`${title} REMINDER`}`;
     const fields=[],sectionNames=new Set(['Max Joiner Troops','Approved Joiners','Bear Trap Rules','Rally Timing','Buff Preparation','Notes','Own Rally Formations']);
     let current=null,description=[];
     for(const line of lines){if(/^Time:\s*/i.test(line))continue;const m=line.match(/^([^:]+):\s*(.*)$/);if(m&&sectionNames.has(m[1])){current={name:m[1],value:m[2]||''};fields.push(current);continue}if(current&&line.trim())current.value+=(current.value?'\n':'')+line.trim();else if(line.trim())description.push(line.trim())}
     const countdown=offsetMinutes===0?`${fireEmoji} **IS STARTING NOW**`:Number(offsetMinutes)>0?`${hourglassEmoji} **Starts in ${Number(offsetMinutes)>=60&&Number(offsetMinutes)%60===0?`${Number(offsetMinutes)/60} hour${Number(offsetMinutes)===60?'':'s'}`:`${offsetMinutes} minute${Number(offsetMinutes)===1?'':'s'}`}**`:`${testEmoji} **Full reminder preview**`;
     const embed={title:cleanTitle,color:0x59e4ff,description:[eventTime?`${clockEmoji} **${eventTime}**`:'',countdown,...description].filter(Boolean).join('\n\n'),footer:{text:test?`NEXA TEST ${String.fromCodePoint(0x2022)} Not a live reminder`:`NEXA ${String.fromCodePoint(0x2022)} WOS Utilities`},timestamp:new Date().toISOString()};
     if(!compact){
      const visible=fields.filter(f=>f.value).slice(0,12),spaced=[];
      visible.forEach((f,i)=>{let value=String(f.value).slice(0,1024);if(f.name==='Own Rally Formations')value=value.replace(/(10 \/ 10 \/ 80)\n(?=(Alternative|F2P))/g,'$1\n\n');spaced.push({name:f.name,value,inline:false});if(i<visible.length-1)spaced.push({name:'\u200B',value:'\u200B\n\u200B',inline:false});});
      embed.fields=spaced.slice(0,25);
     }
     return embed;
    }
    async function sendSafeTest({s,alliance_id,guild_id,channel_id,preview,mention_type='none',mention_target_id=null}){
     await linkedServer(s,alliance_id,guild_id);await verifyChannelInGuild(guild_id,channel_id);
     const mt=['none','role','everyone','here'].includes(String(mention_type))?String(mention_type):'none';
     const rid=String(mention_target_id||'').trim();let content='',allowed={parse:[]};
     if(mt==='role'){if(!rid)throw fail('Select a Discord role to mention.');await verifyRoleInGuild(guild_id,rid);content=`<@&${rid}>`;allowed={parse:[],roles:[rid]};}
     else if(mt==='everyone'){content='@everyone';allowed={parse:['everyone']};}
     else if(mt==='here'){content='@here';allowed={parse:['everyone']};}
     await sendChannel(channel_id,{...(content?{content}:{}),embeds:[previewToEmbed(preview,{test:true})],allowed_mentions:allowed});
     return {ok:true,message:mt==='none'?'Full event reminder test sent.':'Full event reminder test sent with mention.'};
    }
    async function createR4Invite(s,allianceId,expiresHours=72){
     const a=await requireR4OrR5(s,allianceId);
     const hours=Math.max(1,Math.min(168,Number(expiresHours)||72));
     const raw=randomBytes(24).toString('base64url');
     const row=(await db('nexa_wos_alliance_invites',{method:'POST',body:{
      state_number:a.state_number,alliance_id:a.id,role:'r4',token_hash:hashToken(raw),status:'active',
      created_by_game_id:String(s.account.game_id),expires_at:new Date(Date.now()+hours*3600000).toISOString()
     }}))[0];
     return {ok:true,invite:{id:row.id,state_number:a.state_number,alliance_id:a.id,role:'r4',token:raw,expires_at:row.expires_at}};
    }
    async function listInvites(s,allianceId){
     const a=await requireR4OrR5(s,allianceId);
     let q=`nexa_wos_alliance_invites?alliance_id=eq.${enc(a.id)}&select=id,state_number,alliance_id,role,status,created_by_game_id,expires_at,used_by_game_id,used_at,revoked_at,created_at&order=created_at.desc`;
     const rows=await db(q);
     return isR5For(s,a.id)||isGlobalOwner(s)?rows:rows.filter(x=>String(x.created_by_game_id)===String(s.account.game_id));
    }
    async function revokeInvite(s,id){
     const row=(await db(`nexa_wos_alliance_invites?id=eq.${enc(id)}&select=*&limit=1`))[0];
     if(!row)throw fail('Invite link not found.',404);
     await requireR4OrR5(s,row.alliance_id);
     const own=String(row.created_by_game_id)===String(s.account.game_id);
     if(!own&&!isR5For(s,row.alliance_id))throw fail('R4 can only revoke invite links they created.',403);
     if(row.status!=='active')throw fail('Invite link is not active.',409);
     await db(`nexa_wos_alliance_invites?id=eq.${enc(id)}`,{method:'PATCH',body:{status:'revoked',revoked_at:new Date().toISOString(),updated_at:new Date().toISOString()}});
     return {ok:true};
    }

    export default async function handler(req,res){
     res.setHeader('Cache-Control','no-store');
     try{
      if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
      const s=await session(req);
      if(req.method==='GET'){
       if(req.query?.action==='events')return res.status(200).json({ok:true,events:await events(s)});
       return res.status(200).json(await snapshot(s));
      }
      const b=req.body||{};

      if(b.action==='create_r4_invite')return res.status(200).json(await createR4Invite(s,b.alliance_id,b.expires_hours));
      if(b.action==='list_r4_invites')return res.status(200).json({ok:true,invites:await listInvites(s,b.alliance_id)});
      if(b.action==='revoke_r4_invite')return res.status(200).json(await revokeInvite(s,b.id));

      if(b.action==='discord_invite'){
       if(b.alliance_id)await requireR4OrR5(s,b.alliance_id);
       const app=String(process.env.DISCORD_APPLICATION_ID||'').trim();if(!/^\d+$/.test(app))throw fail('Discord install link is not configured.',503);
       const permissions=String(process.env.DISCORD_INSTALL_PERMISSIONS||'274877975552');
       return res.status(200).json({ok:true,url:`https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(app)}&permissions=${encodeURIComponent(permissions)}&integration_type=0&scope=bot%20applications.commands`});
      }
      if(b.action==='discord_servers'){
       const a=await requireR4OrR5(s,b.alliance_id);
       const servers=await db(`wos_discord_alliance_links?alliance_id=eq.${enc(a.id)}&enabled=eq.true&select=guild_id,guild_name,reminder_channel_id,updated_at&order=guild_name.asc`);
       return res.status(200).json({ok:true,servers});
      }
      if(b.action==='link_discord_server'){
       const a=await requireR4OrR5(s,b.alliance_id),gid=String(b.guild_id||'').trim();if(!/^\d{10,30}$/.test(gid))throw fail('Enter a valid Discord Server ID.');
       let guild;try{guild=await discord(`/guilds/${gid}`)}catch{throw fail('NEXA Bot cannot see that Discord server. Install the bot first, then try again.',409)}
       await visibleTextChannels(gid);
       const payload={alliance_id:a.id,guild_id:gid,guild_name:String(guild?.name||gid).slice(0,120),enabled:true,linked_by_game_id:String(s.account.game_id),updated_at:new Date().toISOString()};
       const rows=await db('wos_discord_alliance_links?on_conflict=alliance_id,guild_id',{method:'POST',body:payload,prefer:'resolution=merge-duplicates,return=representation'});
       return res.status(200).json({ok:true,server:rows?.[0]||payload});
      }
      if(b.action==='unlink_discord_server'){
       const a=await requireR4OrR5(s,b.alliance_id),gid=String(b.guild_id||'').trim();if(!/^\d{10,30}$/.test(gid))throw fail('Invalid Discord Server ID.');
       const found=await db(`wos_discord_alliance_links?alliance_id=eq.${enc(a.id)}&guild_id=eq.${enc(gid)}&select=alliance_id,guild_id&limit=1`);
       if(!found.length)throw fail('Discord server link not found.',404);
       await db(`wos_discord_alliance_links?alliance_id=eq.${enc(a.id)}&guild_id=eq.${enc(gid)}`,{method:'PATCH',body:{enabled:false,updated_at:new Date().toISOString()}});
       return res.status(200).json({ok:true});
      }
      if(b.action==='discord_channels'){await linkedServer(s,b.alliance_id,b.guild_id);return res.status(200).json({ok:true,channels:await visibleTextChannels(String(b.guild_id))});}
      if(b.action==='discord_roles'){await linkedServer(s,b.alliance_id,b.guild_id);return res.status(200).json({ok:true,roles:await visibleRoles(String(b.guild_id))});}
      if(b.action==='set_default_reminder_channel'){
       const a=await requireR4OrR5(s,b.alliance_id),gid=String(b.guild_id||'').trim(),cid=String(b.channel_id||'').trim();
       await linkedServer(s,a.id,gid);const ch=await verifyChannelInGuild(gid,cid);
       await db(`wos_discord_alliance_links?alliance_id=eq.${enc(a.id)}&guild_id=eq.${enc(gid)}&enabled=eq.true`,{method:'PATCH',body:{reminder_channel_id:cid,updated_at:new Date().toISOString()}});
       return res.status(200).json({ok:true,guild_id:gid,channel:{id:cid,name:ch.name}});
      }
      if(b.action==='test_event_draft')return res.status(200).json(await sendSafeTest({s,...b}));
      if(b.action==='change_username'){const out=await rpc('transfer_staff_change_username',{p_token:s.raw,p_current_password:String(b.current_password||''),p_new_username:String(b.username||'').trim()});return res.status(200).json(out||{ok:true});}
      if(b.action==='change_password'){const out=await rpc('transfer_staff_change_password',{p_token:s.raw,p_current_password:String(b.current_password||''),p_new_password:String(b.new_password||'')});return res.status(200).json(out||{ok:true});}

      if(b.action==='add_staff'){
       const a=await requireR5(s,b.alliance_id);
       const game_id=String(b.game_id||'').trim();if(!/^\d{1,30}$/.test(game_id))throw fail('Enter a valid Game ID.');
       const role=String(b.role||'r4');if(role!=='r4')throw fail('R5 can add R4 staff. R5 transfer uses the dedicated transfer flow.',403);
       const existing=await db(`nexa_wos_alliance_access?state_number=eq.${a.state_number}&alliance_id=eq.${enc(a.id)}&game_id=eq.${enc(game_id)}&status=eq.active&select=id&limit=1`);
       if(existing.length)throw fail('This Game ID already has active WOS Utilities access for this alliance.',409);
       const identity=await resolveNexaIdentity(game_id);
       const rows=await db('nexa_wos_alliance_access',{method:'POST',body:{state_number:a.state_number,alliance_id:a.id,game_id,user_id:identity?.user_id||null,player_account_id:identity?.id||null,role:'r4',status:'active'}});
       return res.status(200).json({ok:true,staff:rows[0]});
      }
      if(b.action==='update_staff'){
       const target=(await db(`nexa_wos_alliance_access?id=eq.${enc(String(b.id||''))}&status=eq.active&select=*&limit=1`))[0];
       if(!target)throw fail('Staff member not found.',404);
       await requireR5(s,target.alliance_id);
       if(target.role==='r5')throw fail('R5 cannot be changed through normal staff editing.',403);
       const role=String(b.role||'r4');if(role!=='r4')throw fail('Only R4 can be assigned here.',403);
       return res.status(200).json({ok:true});
      }
      if(b.action==='remove_staff'){
       const target=(await db(`nexa_wos_alliance_access?id=eq.${enc(String(b.id||''))}&status=eq.active&select=*&limit=1`))[0];
       if(!target)throw fail('Staff member not found.',404);
       await requireR5(s,target.alliance_id);
       if(target.role==='r5')throw fail('R5 access cannot be removed through normal staff removal.',403);
       await db(`nexa_wos_alliance_access?id=eq.${enc(target.id)}`,{method:'PATCH',body:{status:'removed',updated_at:new Date().toISOString()}});
       return res.status(200).json({ok:true});
      }
      if(b.action==='generate_recovery')throw fail('Recovery is not part of alliance-scoped WOS Utilities access.',403);

      if(b.action==='create_alliance'){
       if(!isGlobalOwner(s))throw fail('Only the Global NEXA Owner can create alliances from this WOS Utilities endpoint.',403);
       const state=Number(b.state_number),tag=String(b.tag||'').trim();if(!Number.isSafeInteger(state)||state<1)throw fail('Invalid State.');if(!/^\S{1,24}$/.test(tag))throw fail('Alliance tag must be 1-24 characters without spaces.');
       const dup=await db(`gift_alliances?state_number=eq.${state}&tag=eq.${enc(tag)}&deleted_at=is.null&select=id&limit=1`);if(dup.length)throw fail('This Alliance Tag already exists in this State.');
       const rows=await db('gift_alliances',{method:'POST',body:{state_number:state,tag,name:String(b.name||tag).trim().slice(0,80),auto_redeem:false}});
       return res.status(200).json({ok:true,alliance:rows[0]});
      }
      if(b.action==='request_alliance_deletion'){
       const a=await requireR4OrR5(s,b.alliance_id);
       const rows=await db('wos_alliance_deletion_requests',{method:'POST',body:{alliance_id:a.id,requested_by_game_id:s.account.game_id}});
       return res.status(200).json({ok:true,request:rows[0]});
      }

      if(b.action==='test_event'){
       const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);
       const settings=found.settings||{},aid=String(found.alliance_id||'');if(String(b.alliance_id||aid)!==aid)throw fail('Alliance mismatch. Test blocked.',409);
       const gid=String(settings.discord_server_id||b.guild_id||'').trim();if(!gid)throw fail('This event does not have a Discord server selected.',409);
       await linkedServer(s,aid,gid);let cid=String(settings.discord_channel_id||'').trim();
       if(!cid){const link=(await db(`wos_discord_alliance_links?alliance_id=eq.${enc(aid)}&guild_id=eq.${enc(gid)}&enabled=eq.true&select=reminder_channel_id&limit=1`))[0];cid=String(link?.reminder_channel_id||'').trim();}
       if(!cid)throw fail('Set a Default Reminder Channel for this Discord server before testing.',409);
       return res.status(200).json(await sendSafeTest({s,alliance_id:aid,guild_id:gid,channel_id:cid,preview:b.preview||found.message||found.event_name,mention_type:settings.mention_type||'none',mention_target_id:settings.mention_target_id||null}));
      }
      if(b.action==='save_event'){
       const e=b.event||{},type=String(e.event_type||'custom');
       if(!['bear_trap','foundry','canyon','arena_reset','crazy_joe','brothers_in_arms','svs','custom'].includes(type))throw fail('Invalid event type.');
       if(!e.alliance_id)throw fail('Alliance is required.');
       await requireR4OrR5(s,e.alliance_id);
       const settings={...(e.settings||{})};
       if(settings.discord_server_id||settings.discord_channel_id){
        if(!settings.discord_server_id)throw fail('Choose a linked Discord Server.');
        await linkedServer(s,e.alliance_id,settings.discord_server_id);
        if(settings.discord_channel_id)await verifyChannelInGuild(settings.discord_server_id,settings.discord_channel_id);
       }
       const mentionTypes=['none','role','everyone','here'];settings.mention_type=mentionTypes.includes(String(settings.mention_type))?String(settings.mention_type):'none';
       if(settings.mention_type==='role'){if(!settings.discord_server_id)throw fail('Choose a linked Discord destination before selecting a role.');const role=await verifyRoleInGuild(settings.discord_server_id,settings.mention_target_id);settings.mention_target_id=role.id;}else settings.mention_target_id=null;
       const repeats=['one_time','daily','every_other_day','weekly','every_2_weeks','every_4_weeks','monthly','custom'];
       const row={alliance_id:e.alliance_id,event_type:type,event_name:String(e.event_name||'').trim().slice(0,120)||'Custom Event',status:e.status==='paused'?'paused':'active',repeat_type:repeats.includes(e.repeat_type)?e.repeat_type:'one_time',event_at:e.event_at||null,timezone:'UTC',message:String(e.message||'').slice(0,2000),notes:String(e.notes||'').slice(0,2000),settings,created_by_game_id:s.account.game_id,updated_at:new Date().toISOString()};
       let saved;if(e.id){const found=(await events(s)).find(x=>String(x.id)===String(e.id));if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(e.id)}`,{method:'PATCH',body:row});saved={...row,id:e.id}}else saved=(await db('wos_event_reminders',{method:'POST',body:row}))[0];
       if(Array.isArray(e.notifications)){await db(`wos_event_notifications?event_id=eq.${enc(saved.id)}`,{method:'DELETE'});if(e.notifications.length)await db('wos_event_notifications',{method:'POST',body:e.notifications.map(n=>({event_id:saved.id,offset_minutes:Number(n.offset_minutes)||0,label:String(n.label||''),message_override:String(n.message_override||''),enabled:n.enabled!==false}))})}
       return res.status(200).json({ok:true,event:saved});
      }
      if(b.action==='set_event_status'){const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(id)}`,{method:'PATCH',body:{status:b.status==='paused'?'paused':'active',updated_at:new Date().toISOString()}});return res.status(200).json({ok:true});}
      if(b.action==='delete_event'){const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(id)}`,{method:'DELETE'});return res.status(200).json({ok:true});}

      throw fail('Unknown action.');
     }catch(e){return res.status(e.status||500).json({ok:false,error:e.message||'Unexpected error.'});}
    }
