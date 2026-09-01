// NEXA DISCORD BOT V1 — AUTOMATIC OUTBOX + TRANSFER REMINDERS
import {db,getCurrentEvent,getSelectedApps,channelFor,sendChannel,fmtPower,phaseTimes} from './_discord-common.js';

const nowIso=()=>new Date().toISOString();
function hmUtc(d){return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`}
function dayKey(d){return d.toISOString().slice(0,10)}
async function saveLast(cfg,last){await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{last_sent:last,updated_at:nowIso()})}

async function sendNewApplications(cfg){
 const rows=await db.select('transfer_discord_outbox',`workspace_id=eq.${cfg.workspace_id}&status=eq.pending&event_type=eq.new_application&available_at=lte.${encodeURIComponent(nowIso())}&order=created_at.asc&limit=10&select=*`);
 for(const item of rows||[]){
  try{
   const apps=await db.select('transfer_applications',`id=eq.${item.application_id}&select=id,in_game_name,player_id,current_state,current_alliance,furnace_level,current_power,discord_username,transferring_with_group&limit=1`);
   const a=apps?.[0];if(!a){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'failed',last_error:'application_not_found'});continue}
   const content=`**📥 New Transfer Application**\n**${a.in_game_name||'Applicant'}**\nState ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}${a.furnace_level?` · ${String(a.furnace_level).toUpperCase()}`:''}\nPower: **${fmtPower(a.current_power)}**\nGame ID: \`${a.player_id||'—'}\`${a.discord_username?`\nDiscord: \`${a.discord_username}\``:''}\nGroup Transfer: **${a.transferring_with_group?'Yes':'No'}**\n\n[Open NEXA Transfer Workspace](https://nexa-1518.vercel.app/transfer-workspace.html?workspace=${cfg.workspace_id})`;
   await sendChannel(channelFor(cfg,'applications'),{content,allowed_mentions:{parse:[]}});
   await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'sent',sent_at:nowIso(),attempts:Number(item.attempts||0)+1,last_error:null});
  }catch(e){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{attempts:Number(item.attempts||0)+1,last_error:String(e.message||e).slice(0,500)})}
 }
}

async function reminders(cfg){
 if(!cfg.enabled||!cfg.event_start_at)return;
 const event=await getCurrentEvent(cfg.workspace_id);if(!event)return;
 const now=new Date(),n=now.getTime(),t=phaseTimes(cfg.event_start_at),last={...(cfg.last_sent||{})};
 const p2r=t.phase2.getTime()-Number(cfg.phase2_reminder_minutes||60)*60000;
 const p3r=t.phase3.getTime()-Number(cfg.phase3_reminder_minutes||60)*60000;
 const send=async(key,msg)=>{if(last[key])return;await sendChannel(channelFor(cfg,'reminders'),{content:msg,allowed_mentions:{parse:[]}});last[key]=nowIso();await saveLast(cfg,last)};
 if(n>=p2r&&n<t.phase2.getTime())await send('phase2_reminder',`⏰ **Invitational Transfer opens in ${cfg.phase2_reminder_minutes||60} minutes.**`);
 if(n>=t.phase2.getTime()&&n<t.phase3.getTime())await send('phase2_open','📩 **Invitational Transfer is OPEN.** Invitations can now be sent.');
 if(n>=p3r&&n<t.phase3.getTime())await send('phase3_reminder',`⏰ **Free Transfer opens in ${cfg.phase3_reminder_minutes||60} minutes.**`);
 if(n>=t.phase3.getTime()&&n<t.end.getTime())await send('phase3_open','🚪 **Free Transfer is OPEN.**');
 if(n>=t.end.getTime())await send('event_end','🌌 **Transfer Event ended.**');
 if(n>=t.phase2.getTime()&&n<t.phase3.getTime()){
  const wanted=(cfg.invite_reminder_times||[]).map(String),current=hmUtc(now);
  if(wanted.includes(current)){
   const k=`invite_${dayKey(now)}_${current.replace(':','')}`;
   if(!last[k]){
    const apps=await getSelectedApps(cfg.workspace_id,event.id),ordinaryUsed=apps.filter(a=>a.application_bucket==='ordinary').length,specialUsed=apps.filter(a=>a.application_bucket==='special').length;
    const ordinaryLeft=Math.max(0,Number(event.ordinary_capacity||0)-ordinaryUsed);
    const specialLeft=cfg.special_invite_plan==='reserve_next_cycle'?0:Math.max(0,Number(event.special_invites_available||0)-specialUsed);
    if(ordinaryLeft>0||specialLeft>0){
      const parts=[];if(ordinaryLeft>0)parts.push(`**${ordinaryLeft} Ordinary Invite${ordinaryLeft===1?'':'s'} still available.**`);if(specialLeft>0)parts.push(`**${specialLeft} Special Invite${specialLeft===1?'':'s'} still available.**`);
      await sendChannel(channelFor(cfg,'reminders'),{content:`⚠️ **Transfer Invite Reminder**\n${parts.join('\n')}`,allowed_mentions:{parse:[]}});
    }
    last[k]=nowIso();await saveLast(cfg,last);
   }
  }
 }
}

export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'GET or POST only'});
 try{
  const cfgs=await db.select('transfer_discord_integrations','enabled=eq.true&select=*');
  for(const cfg of cfgs||[]){await sendNewApplications(cfg);await reminders(cfg)}
  return res.status(200).json({ok:true,processed:(cfgs||[]).length,at:nowIso()});
 }catch(e){console.error(e);return res.status(500).json({ok:false,error:e.message})}
}
