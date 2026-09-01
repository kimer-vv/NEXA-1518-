// NEXA DISCORD BOT V1 — SHARED BACKEND HELPERS
import crypto from 'node:crypto';

const SUPABASE_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const DISCORD_API='https://discord.com/api/v10';

export function env(name){const v=process.env[name];if(!v)throw new Error(`Missing ${name}`);return v}
export async function rawBody(req){
  if(Buffer.isBuffer(req.body)) return req.body;
  if(typeof req.body==='string') return Buffer.from(req.body);
  const chunks=[];
  for await(const c of req) chunks.push(Buffer.isBuffer(c)?c:Buffer.from(c));
  return Buffer.concat(chunks);
}
export function verifyDiscord(raw,signature,timestamp){
  if(!signature||!timestamp)return false;
  const key=env('DISCORD_PUBLIC_KEY');
  const der=Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(key,'hex')]);
  const pub=crypto.createPublicKey({key:der,format:'der',type:'spki'});
  return crypto.verify(null,Buffer.concat([Buffer.from(timestamp),raw]),pub,Buffer.from(signature,'hex'));
}
async function sb(path,{method='GET',body,prefer}={}){
  const key=env('SUPABASE_SERVICE_ROLE_KEY');
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    method,
    headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const text=await r.text();let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof data==='string'?data:JSON.stringify(data)}`);
  return data;
}
export const db={
  select:(table,qs)=>sb(`${table}?${qs}`),
  insert:(table,body,prefer='return=representation')=>sb(table,{method:'POST',body,prefer}),
  update:(table,qs,body,prefer='return=representation')=>sb(`${table}?${qs}`,{method:'PATCH',body,prefer})
};
export async function discord(path,{method='GET',body}={}){
  const token=env('DISCORD_BOT_TOKEN');
  const r=await fetch(`${DISCORD_API}${path}`,{method,headers:{Authorization:`Bot ${token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(`Discord ${r.status}: ${typeof data==='string'?data:JSON.stringify(data)}`);
  return data;
}
export const ephemeral=content=>({type:4,data:{content,flags:64}});
export const publicReply=(content,embeds)=>({type:4,data:{content,embeds}});
export function subcommand(data){const first=data?.options?.[0];return first?.type===1?{name:first.name,options:Object.fromEntries((first.options||[]).map(o=>[o.name,o.value]))}:{name:null,options:{}}}
export function fmtPower(n){n=Number(n||0);if(!n)return'—';if(n>=1e9)return`${(n/1e9).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')}B`;if(n>=1e6)return`${(n/1e6).toFixed(1).replace(/\.0$/,'')}M`;if(n>=1e3)return`${(n/1e3).toFixed(1).replace(/\.0$/,'')}K`;return n.toLocaleString()}
export function channelFor(cfg,type){if(cfg.channel_mode==='split'){if(type==='applications')return cfg.applications_channel_id||cfg.single_channel_id;if(type==='reminders')return cfg.reminders_channel_id||cfg.single_channel_id;if(type==='invites')return cfg.invites_channel_id||cfg.single_channel_id}return cfg.single_channel_id||process.env.DISCORD_CHANNEL_ID}
export async function sendChannel(channelId,payload){if(!channelId)throw new Error('Discord channel is not configured');return discord(`/channels/${channelId}/messages`,{method:'POST',body:payload})}
export async function getConfigByGuild(guild){const rows=await db.select('transfer_discord_integrations',`guild_id=eq.${encodeURIComponent(guild)}&select=*`);return rows?.[0]||null}
export async function getCurrentEvent(workspaceId){const rows=await db.select('transfer_events',`workspace_id=eq.${workspaceId}&status=neq.archived&order=created_at.desc&limit=1&select=*`);return rows?.[0]||null}
export async function getSelectedApps(workspaceId,eventId){return db.select('transfer_applications',`workspace_id=eq.${workspaceId}&transfer_event_id=eq.${eventId}&application_bucket=in.(ordinary,special)&select=id,application_id,in_game_name,player_id,current_state,current_alliance,current_power,application_bucket,invite_status,invite_pending_reason,assigned_alliance_tag,discord_username&order=created_at.asc`)}
export function inviteReport(apps){
  const sent=apps.filter(a=>a.invite_status==='sent'),pending=apps.filter(a=>a.invite_status!=='sent');
  const line=a=>`• **${a.in_game_name||'Applicant'}** — ${a.player_id||'—'}${a.invite_pending_reason==='over_power'?' · Over Power Cap':''}`;
  let s='**📨 Transfer Invite Report**\n\n**Invites Sent ✓**\n'+(sent.length?sent.map(line).join('\n'):'None yet.');
  s+='\n\n**Still Pending**\n'+(pending.length?pending.map(line).join('\n'):'None 🎉');
  s+=`\n\n**Sent: ${sent.length} · Pending: ${pending.length}**`;
  return s;
}
export function isoFromUtc(date,time){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time||''))return null;const d=new Date(`${date}T${time}:00Z`);return Number.isNaN(d.getTime())?null:d.toISOString()}
export function phaseTimes(startIso){const s=new Date(startIso).getTime();return{phase2:new Date(s+72*3600000),phase3:new Date(s+120*3600000),end:new Date(s+168*3600000)}}
export function markElapsed(startIso,p2mins,p3mins){const now=Date.now(),t=phaseTimes(startIso),x={};if(now>=t.phase2.getTime()-Number(p2mins||60)*60000)x.phase2_reminder=true;if(now>=t.phase2.getTime())x.phase2_open=true;if(now>=t.phase3.getTime()-Number(p3mins||60)*60000)x.phase3_reminder=true;if(now>=t.phase3.getTime())x.phase3_open=true;if(now>=t.end.getTime())x.event_end=true;return x}
