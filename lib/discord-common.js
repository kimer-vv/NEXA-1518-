// NEXA DISCORD BOT V1.4.2 — FOUR ROUTES / COPY-FRIENDLY IDS / THREE-STATE INVITE REPORT
import crypto from 'node:crypto';

const SUPABASE_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const DISCORD_API='https://discord.com/api/v10';
const BASE_URL='https://nexa-1518.vercel.app';

export function env(name){const v=process.env[name];if(!v)throw new Error(`Missing ${name}`);return v}
export function workspaceUrl(workspaceId){return `${BASE_URL}/transfer-workspace.html?workspace=${encodeURIComponent(workspaceId)}`}
export function formUrl(eventId){return `${BASE_URL}/transfer-form-v2.html?public=1&event=${encodeURIComponent(eventId)}`}
export async function rawBody(req){
  if(Buffer.isBuffer(req.body)) return req.body;
  if(typeof req.body==='string') return Buffer.from(req.body);
  const chunks=[];for await(const c of req)chunks.push(Buffer.isBuffer(c)?c:Buffer.from(c));return Buffer.concat(chunks);
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
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof data==='string'?data:JSON.stringify(data)}`);return data;
}
export const db={
  select:(table,qs)=>sb(`${table}?${qs}`),
  insert:(table,body,prefer='return=representation')=>sb(table,{method:'POST',body,prefer}),
  update:(table,qs,body,prefer='return=representation')=>sb(`${table}?${qs}`,{method:'PATCH',body,prefer}),
  rpc:(fn,body)=>sb(`rpc/${fn}`,{method:'POST',body})
};
export async function discord(path,{method='GET',body}={}){
  const token=env('DISCORD_BOT_TOKEN');
  const r=await fetch(`${DISCORD_API}${path}`,{method,headers:{Authorization:`Bot ${token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error(`Discord ${r.status}: ${typeof data==='string'?data:JSON.stringify(data)}`);return data;
}
export const ephemeral=content=>({type:4,data:{content,flags:64}});
export const publicReply=content=>({type:4,data:{content,allowed_mentions:{parse:[]}}});
export function subcommand(data){const first=data?.options?.[0];return first?.type===1?{name:first.name,options:Object.fromEntries((first.options||[]).map(o=>[o.name,o.value]))}:{name:null,options:{}}}
export function fmtPower(n){n=Number(n||0);if(!n)return'—';if(n>=1e9)return`${(n/1e9).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')}B`;if(n>=1e6)return`${(n/1e6).toFixed(1).replace(/\.0$/,'')}M`;if(n>=1e3)return`${(n/1e3).toFixed(1).replace(/\.0$/,'')}K`;return n.toLocaleString()}
export function progressionLabel(v){return({actively_progressing:'Still Progressing',still_progressing:'Still Progressing',well_developed:'Well Developed',highly_developed:'Highly Developed',near_max:'Near Max / Maxed',maxed:'Near Max / Maxed'})[String(v||'').toLowerCase()]||String(v||'Not specified').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
export function hasT12(a){return !!(a?.t12_infantry||a?.t12_lancer||a?.t12_marksman)}
export function placementLabel(a){if(a.application_cycle==='next'||a.application_bucket==='next_cycle')return'Next Transfer Cycle';return({inbox:'Unassigned',ordinary:'Ordinary',special:'Special',not_selected:'Not Selected',next_cycle:'Next Transfer Cycle'})[a.application_bucket]||a.application_bucket||'Unassigned'}
export function channelFor(cfg,type){if(type==='applications'&&cfg.applications_channel_id)return cfg.applications_channel_id;if(type==='applicants'&&cfg.applicant_operations_channel_id)return cfg.applicant_operations_channel_id;if(type==='reminders'&&cfg.reminders_channel_id)return cfg.reminders_channel_id;if(type==='invites'&&cfg.invites_channel_id)return cfg.invites_channel_id;return cfg.single_channel_id||process.env.DISCORD_CHANNEL_ID}
export async function sendChannel(channelId,payload){if(!channelId)throw new Error('Discord channel is not configured');return discord(`/channels/${channelId}/messages`,{method:'POST',body:payload})}
export async function getConfigByGuild(guild){const rows=await db.select('transfer_discord_integrations',`guild_id=eq.${encodeURIComponent(guild)}&select=*`);return rows?.[0]||null}
export async function getCurrentEvent(workspaceId){const rows=await db.select('transfer_events',`workspace_id=eq.${workspaceId}&status=neq.archived&order=created_at.desc&limit=1&select=*`);return rows?.[0]||null}
export async function currentApps(workspaceId,eventId){return db.select('transfer_applications',`workspace_id=eq.${workspaceId}&transfer_event_id=eq.${eventId}&select=*`)}
export async function selectedApps(workspaceId,eventId){return db.select('transfer_applications',`workspace_id=eq.${workspaceId}&transfer_event_id=eq.${eventId}&application_bucket=in.(ordinary,special)&select=*`)}
export async function recruitingAlliances(workspaceId){
  const profiles=await db.select('transfer_workspace_recruiting_profiles',`workspace_id=eq.${encodeURIComponent(workspaceId)}&is_active=eq.true&select=alliance_id`);
  const ids=(profiles||[]).map(x=>Number(x.alliance_id)).filter(Number.isFinite);
  if(!ids.length)return [];
  const rows=await db.select('alliances',`id=in.(${ids.join(',')})&select=id,tag,name&order=tag.asc`);
  const active=new Set(ids);
  return (rows||[]).filter(x=>active.has(Number(x.id)));
}
export function inviteCounts(event,apps){const ordinaryUsed=apps.filter(a=>a.application_bucket==='ordinary').length,specialUsed=apps.filter(a=>a.application_bucket==='special').length;return{ordinaryLeft:Math.max(0,Number(event?.ordinary_capacity||0)-ordinaryUsed),specialLeft:Math.max(0,Number(event?.special_invites_available||0)-specialUsed)}}
export function inviteReport(apps){
  const selected=(apps||[]).filter(a=>['ordinary','special'].includes(String(a.application_bucket||''))&&a.application_cycle!=='next');
  const notSent=selected.filter(a=>a.invite_status!=='sent'&&a.invite_pending_reason!=='over_power');
  const overPower=selected.filter(a=>a.invite_status!=='sent'&&a.invite_pending_reason==='over_power');
  const sent=selected.filter(a=>a.invite_status==='sent');
  const line=a=>{
    const star=a.application_bucket==='special'?'⭐ ':'';
    const state=a.current_state?`State ${a.current_state}`:'State —';
    const alliance=String(a.current_alliance||'—').trim()||'—';
    return `${star}**${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\n${state} · ${alliance}`;
  };
  const group=(title,rows,empty)=>`**${title}**\n${rows.length?rows.map(line).join('\n\n'):empty}`;
  return [
    group('Invite Not Sent Yet',notSent,'None.'),
    group('Still Pending · Over Power Cap',overPower,'None.'),
    group('Invites Sent ✓',sent,'None yet.'),
    '**⭐ = Special Invitation Required**'
  ].join('\n\n');
}
export function eventStartFromServerDate(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;const d=new Date(`${date}T00:00:00Z`);return Number.isNaN(d.getTime())?null:d.toISOString()}
export function phaseTimes(startIso){const s=new Date(startIso).getTime();return{phase1:new Date(s),phase2:new Date(s+72*3600000),phase3:new Date(s+120*3600000),end:new Date(s+168*3600000)}}
export function phaseState(startIso,nowMs=Date.now()){if(!startIso)return{phase:'Not Started',next:null};const t=phaseTimes(startIso);if(nowMs<t.phase1.getTime())return{phase:'Scheduled',next:t.phase1};if(nowMs<t.phase2.getTime())return{phase:'Phase 1',next:t.phase2};if(nowMs<t.phase3.getTime())return{phase:'Phase 2',next:t.phase3};if(nowMs<t.end.getTime())return{phase:'Phase 3',next:t.end};return{phase:'Ended',next:null}}
export function markPastTimeline(startIso,nowMs=Date.now()){const t=phaseTimes(startIso),x={};if(nowMs>=t.phase1.getTime())x.phase1_open=true;if(nowMs>=t.phase2.getTime())x.phase2_open=true;if(nowMs>=t.phase3.getTime())x.phase3_open=true;if(nowMs>=t.end.getTime())x.event_end=true;return x}
export function discordTime(d,style='F'){return d?`<t:${Math.floor(d.getTime()/1000)}:${style}>`:'—'}
export function miniApplicant(a){return `**${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\nFrom: State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}\nFurnace: **${a.furnace_level||'—'}** · Power: **${fmtPower(a.current_power)}**\nT12: **${hasT12(a)?'Yes':'No'}** · Account Progress: **${progressionLabel(a.account_progression)}**`}
