/* NEXA WOS Utilities Server Handler V2.3
 * Complete replacement: preserves staff/event actions and adds alliance-scoped Discord linking.
 * Requires the companion SQL migration: wos-discord-alliance-links-migration.txt
 */
import { createHash, randomBytes } from 'node:crypto';
import { sendChannel, discord } from '../lib/discord-common.js';

const URL=process.env.SUPABASE_URL||'https://dfxcxboxrkfmrnsgpyin.supabase.co';
const KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
const enc=x=>encodeURIComponent(String(x));
const fail=(m,s=400)=>Object.assign(new Error(m),{status:s});

async function db(path,{method='GET',body,prefer='return=representation'}={}){
 if(!KEY)throw fail('Server configuration unavailable.',503);
 const r=await fetch(`${URL}/rest/v1/${path}`,{method,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json',Prefer:prefer},body:body===undefined?undefined:JSON.stringify(body)});
 const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}
 if(!r.ok)throw fail(d?.message||d?.error||`Database request failed (${r.status}).`,r.status>=500?502:400);
 return d;
}
async function rpc(name,body){return db(`rpc/${name}`,{method:'POST',body});}
function token(req){const a=String(req.headers.authorization||'');return a.startsWith('Bearer ')?a.slice(7).trim():''}
async function session(req){
 const raw=token(req);if(!raw)throw fail('Staff sign-in required.',401);
 const hash=createHash('sha256').update(raw).digest('hex');
 const ss=await db(`transfer_staff_sessions?token_hash=eq.${hash}&expires_at=gt.${enc(new Date().toISOString())}&select=account_id&limit=1`);
 if(!ss.length)throw fail('Staff session expired.',401);
 const ac=(await db(`transfer_staff_accounts?id=eq.${ss[0].account_id}&select=id,game_id,game_name,username&limit=1`))[0];
 if(!ac)throw fail('Staff account not found.',401);
 let access=(await db(`wos_utility_staff_access?game_id=eq.${enc(ac.game_id)}&status=eq.active&select=*&limit=1`))[0]||null;
 const giftOwner=(await db(`gift_staff_access?staff_account_id=eq.${ac.id}&role=eq.owner&is_active=eq.true&select=id&limit=1`)).length>0;
 if(!access&&giftOwner)access=(await db('wos_utility_staff_access',{method:'POST',body:{game_id:ac.game_id,staff_account_id:ac.id,role:'owner',status:'active'}}))[0];
 if(!access)throw fail('No WOS Utilities access has been assigned.',403);
 if(!access.staff_account_id)await db(`wos_utility_staff_access?id=eq.${access.id}`,{method:'PATCH',body:{staff_account_id:ac.id,updated_at:new Date().toISOString()}});
 return {raw,account:ac,access};
}
const isAdmin=s=>['owner','administrative'].includes(s.access.role);
const isOwner=s=>s.access.role==='owner';
async function scope(s){
 const managed=await db(`wos_utility_managed_alliances?staff_access_id=eq.${s.access.id}&select=alliance_id`);
 const ids=new Set(managed.map(x=>String(x.alliance_id)));if(s.access.main_alliance_id)ids.add(String(s.access.main_alliance_id));return ids;
}
async function allianceAllowed(s,id){if(isAdmin(s))return true;return (await scope(s)).has(String(id))}
async function staffRow(id){return (await db(`wos_utility_staff_access?id=eq.${enc(id)}&status=neq.removed&select=*&limit=1`))[0]||null}
async function snapshot(s){
 const states=await db('gift_states?select=state_number,display_name,is_active&order=state_number.asc');
 const alliances=await db('gift_alliances?deleted_at=is.null&select=id,state_number,tag,name,is_active&order=state_number.asc,tag.asc');
 const ids=await scope(s),visible=isAdmin(s)?alliances:alliances.filter(a=>ids.has(String(a.id)));
 const staff=isAdmin(s)?await db('wos_utility_staff_access?status=neq.removed&select=id,game_id,role,main_alliance_id,module_access,status,staff_account_id,created_at&order=created_at.asc'):[s.access];
 const accountIds=staff.map(x=>x.staff_account_id).filter(Boolean);let accounts=[];
 if(accountIds.length)accounts=await db(`transfer_staff_accounts?id=in.(${accountIds.map(enc).join(',')})&select=id,game_id,game_name,username`);
 const byId=new Map(accounts.map(a=>[a.id,a]));
 return {ok:true,me:{access_id:s.access.id,account_id:s.account.id,game_id:s.account.game_id,game_name:s.account.game_name,username:s.account.username,role:s.access.role,main_alliance_id:s.access.main_alliance_id,module_access:s.access.module_access},states,alliances:visible,all_alliances:isAdmin(s)?alliances:visible,staff:staff.map(x=>({...x,game_name:byId.get(x.staff_account_id)?.game_name||null,username:byId.get(x.staff_account_id)?.username||null,registered:!!x.staff_account_id,is_self:x.game_id===s.account.game_id})),can_manage_staff:isAdmin(s),is_owner:isOwner(s)};
}
async function events(s){const all=await db('wos_event_reminders?select=*&order=updated_at.desc');if(isAdmin(s))return all;const ids=await scope(s);return all.filter(e=>!e.alliance_id||ids.has(String(e.alliance_id)))}
async function requireAlliance(s,id){id=String(id||'');if(!id)throw fail('Alliance is required.');if(!await allianceAllowed(s,id))throw fail('Access denied for this alliance.',403);return id}
async function linkedServer(s,allianceId,guildId){
 const aid=await requireAlliance(s,allianceId),gid=String(guildId||'').trim();
 if(!/^\d{10,30}$/.test(gid))throw fail('Invalid Discord Server ID.');
 const row=(await db(`wos_discord_alliance_links?alliance_id=eq.${enc(aid)}&guild_id=eq.${enc(gid)}&enabled=eq.true&select=*&limit=1`))[0];
 if(!row)throw fail('This Discord server is not linked to the current alliance.',409);
 return row;
}
async function visibleTextChannels(guildId){
 const channels=await discord(`/guilds/${guildId}/channels`);
 return (channels||[]).filter(c=>[0,5].includes(Number(c.type))).sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0)).map(c=>({id:String(c.id),name:String(c.name||c.id),type:Number(c.type)}));
}
async function verifyChannelInGuild(guildId,channelId){
 const cid=String(channelId||'').trim();if(!/^\d{10,30}$/.test(cid))throw fail('Select a valid Discord channel.');
 const channels=await visibleTextChannels(guildId);
 const channel=channels.find(c=>c.id===cid);if(!channel)throw fail('That channel does not belong to the selected linked Discord server, or the bot cannot see it.',409);
 return channel;
}
async function sendSafeTest({s,alliance_id,guild_id,channel_id,preview}){
 await linkedServer(s,alliance_id,guild_id);
 await verifyChannelInGuild(guild_id,channel_id);
 const text=String(preview||'NEXA Event Reminder').slice(0,1800);
 await sendChannel(channel_id,{content:`ð§ª **NEXA TEST â NOT A LIVE REMINDER**\n\n${text}`,allowed_mentions:{parse:[]}});
 return {ok:true,message:'Test sent to the selected alliance Discord channel.'};
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
  if(b.action==='discord_invite'){
   const app=String(process.env.DISCORD_APPLICATION_ID||'').trim();if(!/^\d+$/.test(app))throw fail('Discord install link is not configured.',503);
   const permissions=String(process.env.DISCORD_INSTALL_PERMISSIONS||'274877975552');
   return res.status(200).json({ok:true,url:`https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(app)}&permissions=${encodeURIComponent(permissions)}&integration_type=0&scope=bot%20applications.commands`});
  }
  if(b.action==='discord_servers'){
   const aid=await requireAlliance(s,b.alliance_id);
   const servers=await db(`wos_discord_alliance_links?alliance_id=eq.${enc(aid)}&enabled=eq.true&select=guild_id,guild_name,updated_at&order=guild_name.asc`);
   return res.status(200).json({ok:true,servers});
  }
  if(b.action==='link_discord_server'){
   const aid=await requireAlliance(s,b.alliance_id),gid=String(b.guild_id||'').trim();if(!/^\d{10,30}$/.test(gid))throw fail('Enter a valid Discord Server ID.');
   let guild;try{guild=await discord(`/guilds/${gid}`)}catch{throw fail('NEXA Bot cannot see that Discord server. Install the bot first, then try again.',409)}
   await visibleTextChannels(gid);
   const payload={alliance_id:aid,guild_id:gid,guild_name:String(guild?.name||gid).slice(0,120),enabled:true,linked_by_game_id:String(s.account.game_id),updated_at:new Date().toISOString()};
   const rows=await db('wos_discord_alliance_links?on_conflict=alliance_id,guild_id',{method:'POST',body:payload,prefer:'resolution=merge-duplicates,return=representation'});
   return res.status(200).json({ok:true,server:rows?.[0]||payload});
  }
  if(b.action==='discord_channels'){
   await linkedServer(s,b.alliance_id,b.guild_id);
   return res.status(200).json({ok:true,channels:await visibleTextChannels(String(b.guild_id))});
  }
  if(b.action==='test_event_draft')return res.status(200).json(await sendSafeTest({s,...b}));
  if(b.action==='change_username'){
   const out=await rpc('transfer_staff_change_username',{p_token:s.raw,p_current_password:String(b.current_password||''),p_new_username:String(b.username||'').trim()});
   return res.status(200).json(out||{ok:true});
  }
  if(b.action==='change_password'){
   const out=await rpc('transfer_staff_change_password',{p_token:s.raw,p_current_password:String(b.current_password||''),p_new_password:String(b.new_password||'')});
   return res.status(200).json(out||{ok:true});
  }
  if(b.action==='generate_recovery'){
   if(!isAdmin(s))throw fail('Administrative access required.',403);
   const target=await staffRow(String(b.id||''));if(!target)throw fail('Staff member not found.',404);if(target.role==='owner')throw fail('Owner recovery cannot be generated by another staff member.',403);if(!target.staff_account_id)throw fail('This staff member has not registered a login yet.');
   const ws=(await db('transfer_workspaces?select=id&limit=1'))[0];if(!ws)throw fail('Recovery service is unavailable.',503);
   const code=randomBytes(6).toString('hex').toUpperCase(),code_hash=createHash('sha256').update(code).digest('hex');
   await db(`transfer_staff_recovery_codes?account_id=eq.${enc(target.staff_account_id)}&used_at=is.null`,{method:'PATCH',body:{used_at:new Date().toISOString()}});
   await db('transfer_staff_recovery_codes',{method:'POST',body:{account_id:target.staff_account_id,workspace_id:ws.id,code_hash,created_by_account_id:s.account.id,expires_at:new Date(Date.now()+30*60*1000).toISOString()}});
   return res.status(200).json({ok:true,code,expires_in_minutes:30});
  }
  if(b.action==='add_staff'){
   if(!isAdmin(s))throw fail('Administrative access required.',403);
   const game_id=String(b.game_id||'').trim();if(!/^\d{1,30}$/.test(game_id))throw fail('Enter a valid Game ID.');
   const role=String(b.role||'r4');if(!['r4','r5','administrative'].includes(role))throw fail('Invalid role.');
   const ac=(await db(`transfer_staff_accounts?game_id=eq.${enc(game_id)}&select=id&limit=1`))[0];
   const rows=await db('wos_utility_staff_access',{method:'POST',body:{game_id,staff_account_id:ac?.id||null,role,module_access:{gift:true,reminders:true},status:'active'}});
   return res.status(200).json({ok:true,staff:rows[0]});
  }
  if(b.action==='update_staff'){
   if(!isAdmin(s))throw fail('Administrative access required.',403);
   const target=await staffRow(String(b.id||''));if(!target)throw fail('Staff member not found.',404);if(target.role==='owner')throw fail('Owner role and access are protected.',403);
   const role=String(b.role||'');if(!['r4','r5','administrative'].includes(role))throw fail('Invalid role.');
   await db(`wos_utility_staff_access?id=eq.${enc(target.id)}`,{method:'PATCH',body:{role,main_alliance_id:b.main_alliance_id||null,module_access:b.module_access||{gift:true,reminders:true},updated_at:new Date().toISOString()}});
   return res.status(200).json({ok:true});
  }
  if(b.action==='remove_staff'){
   if(!isAdmin(s))throw fail('Administrative access required.',403);
   const target=await staffRow(String(b.id||''));if(!target)throw fail('Staff member not found.',404);if(target.role==='owner')throw fail('Owner access cannot be removed.',403);
   await db(`wos_utility_staff_access?id=eq.${enc(target.id)}`,{method:'PATCH',body:{status:'removed',updated_at:new Date().toISOString()}});
   return res.status(200).json({ok:true});
  }
  if(b.action==='create_alliance'){
   if(!['owner','administrative','r4','r5'].includes(s.access.role))throw fail('Access denied.',403);
   if(!isAdmin(s)&&s.access.main_alliance_id)throw fail('Your Main Alliance is already assigned. Ask an administrator to create or assign another alliance.');
   const state=Number(b.state_number),tag=String(b.tag||'').trim();if(!Number.isSafeInteger(state)||state<1)throw fail('Invalid State.');if(!/^\S{1,24}$/.test(tag))throw fail('Alliance tag must be 1â24 characters without spaces.');
   const dup=await db(`gift_alliances?state_number=eq.${state}&tag=eq.${enc(tag)}&deleted_at=is.null&select=id&limit=1`);if(dup.length)throw fail('This Alliance Tag already exists in this State.');
   const rows=await db('gift_alliances',{method:'POST',body:{state_number:state,tag,name:String(b.name||tag).trim().slice(0,80),auto_redeem:false}});
   if(!isAdmin(s)&&b.make_main!==false)await db(`wos_utility_staff_access?id=eq.${s.access.id}`,{method:'PATCH',body:{main_alliance_id:rows[0].id,updated_at:new Date().toISOString()}});
   return res.status(200).json({ok:true,alliance:rows[0]});
  }
  if(b.action==='request_alliance_deletion'){
   const id=await requireAlliance(s,b.alliance_id);if(!['owner','administrative','r5'].includes(s.access.role))throw fail('R5 or Administrative access required.',403);
   const rows=await db('wos_alliance_deletion_requests',{method:'POST',body:{alliance_id:id,requested_by_game_id:s.account.game_id}});return res.status(200).json({ok:true,request:rows[0]});
  }
  if(b.action==='test_event'){
   const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);
   const settings=found.settings||{},aid=String(found.alliance_id||'');
   if(String(b.alliance_id||aid)!==aid)throw fail('Alliance mismatch. Test blocked.',409);
   if(String(b.guild_id||'')!==String(settings.discord_server_id||'')||String(b.channel_id||'')!==String(settings.discord_channel_id||''))throw fail('Saved Discord destination mismatch. Test blocked.',409);
   return res.status(200).json(await sendSafeTest({s,alliance_id:aid,guild_id:settings.discord_server_id,channel_id:settings.discord_channel_id,preview:b.preview||found.message||found.event_name}));
  }
  if(b.action==='save_event'){
   const e=b.event||{},type=String(e.event_type||'custom');
   if(!['bear_trap','foundry','canyon','arena_reset','crazy_joe','brothers_in_arms','svs','custom'].includes(type))throw fail('Invalid event type.');
   if(e.alliance_id)await requireAlliance(s,e.alliance_id);
   const settings=e.settings||{};
   if(settings.discord_server_id||settings.discord_channel_id){
    if(!settings.discord_server_id||!settings.discord_channel_id)throw fail('Choose both a Discord Server and Channel.');
    await linkedServer(s,e.alliance_id,settings.discord_server_id);await verifyChannelInGuild(settings.discord_server_id,settings.discord_channel_id);
   }
   const repeats=['one_time','daily','every_other_day','weekly','every_2_weeks','monthly','custom'];
   const row={alliance_id:e.alliance_id||null,event_type:type,event_name:String(e.event_name||'').trim().slice(0,120)||'Custom Event',status:e.status==='paused'?'paused':'active',repeat_type:repeats.includes(e.repeat_type)?e.repeat_type:'one_time',event_at:e.event_at||null,timezone:'UTC',message:String(e.message||'').slice(0,2000),notes:String(e.notes||'').slice(0,2000),settings,created_by_game_id:s.account.game_id,updated_at:new Date().toISOString()};
   let saved;if(e.id){const found=(await events(s)).find(x=>String(x.id)===String(e.id));if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(e.id)}`,{method:'PATCH',body:row});saved={...row,id:e.id}}else saved=(await db('wos_event_reminders',{method:'POST',body:row}))[0];
   if(Array.isArray(e.notifications)){await db(`wos_event_notifications?event_id=eq.${enc(saved.id)}`,{method:'DELETE'});if(e.notifications.length)await db('wos_event_notifications',{method:'POST',body:e.notifications.map(n=>({event_id:saved.id,offset_minutes:Number(n.offset_minutes)||0,label:String(n.label||''),message_override:String(n.message_override||''),enabled:n.enabled!==false}))})}
   return res.status(200).json({ok:true,event:saved});
  }
  if(b.action==='set_event_status'){const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(id)}`,{method:'PATCH',body:{status:b.status==='paused'?'paused':'active',updated_at:new Date().toISOString()}});return res.status(200).json({ok:true})}
  if(b.action==='delete_event'){const id=String(b.id||''),found=(await events(s)).find(x=>String(x.id)===id);if(!found)throw fail('Event not found.',404);await db(`wos_event_reminders?id=eq.${enc(id)}`,{method:'DELETE'});return res.status(200).json({ok:true})}
  throw fail('Unknown action.');
 }catch(e){return res.status(e.status||500).json({ok:false,error:e.message||'Unexpected error.'})}
} 