// NEXA DISCORD BOT V1 — INTERACTIONS ENDPOINT
import {rawBody,verifyDiscord,ephemeral,publicReply,subcommand,db,getConfigByGuild,getCurrentEvent,getSelectedApps,inviteReport,isoFromUtc,markElapsed} from './_discord-common.js';

export const config={api:{bodyParser:false}};
const ALLOWED_GUILD=process.env.DISCORD_GUILD_ID;

function validTimes(v){if(!v)return[];const out=[...new Set(String(v).split(',').map(x=>x.trim()).filter(x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x)))];return out.slice(0,24)}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const raw=await rawBody(req);
    const sig=req.headers['x-signature-ed25519'];
    const ts=req.headers['x-signature-timestamp'];
    if(!verifyDiscord(raw,Array.isArray(sig)?sig[0]:sig,Array.isArray(ts)?ts[0]:ts))return res.status(401).send('invalid request signature');
    const body=JSON.parse(raw.toString('utf8'));
    if(body.type===1)return res.status(200).json({type:1});
    if(body.type!==2)return res.status(200).json(ephemeral('Unsupported interaction.'));
    if(ALLOWED_GUILD&&body.guild_id!==ALLOWED_GUILD)return res.status(200).json(ephemeral('This bot is not configured for this server.'));
    const cfg=await getConfigByGuild(body.guild_id);
    if(!cfg)return res.status(200).json(ephemeral('This Discord server is not connected to a NEXA Transfer Workspace yet.'));
    const {name,options}=subcommand(body.data);
    if(body.data.name==='transfer'){
      if(name==='start'){
        const start=isoFromUtc(String(options.date||''),String(options.time||''));
        if(!start)return res.status(200).json(ephemeral('Use UTC/Game Time. Date must be YYYY-MM-DD and time must be HH:MM.'));
        const last=markElapsed(start,cfg.phase2_reminder_minutes,cfg.phase3_reminder_minutes);
        await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,event_start_at:start,last_sent:last,updated_at:new Date().toISOString()});
        return res.status(200).json(ephemeral(`Transfer reminders activated ✓\nEvent Start: ${String(options.date)} ${String(options.time)} UTC`));
      }
      if(name==='reminders'){
        const times=validTimes(options.invite_times);
        if(options.invite_times&&times.length===0)return res.status(200).json(ephemeral('Invite times must look like 06:00, 12:30, 18:00 using UTC/Game Time.'));
        const patch={updated_at:new Date().toISOString()};
        if(options.phase2_before_minutes!==undefined)patch.phase2_reminder_minutes=Number(options.phase2_before_minutes);
        if(options.phase3_before_minutes!==undefined)patch.phase3_reminder_minutes=Number(options.phase3_before_minutes);
        if(options.invite_times!==undefined)patch.invite_reminder_times=times;
        if(options.special_plan!==undefined)patch.special_invite_plan=String(options.special_plan);
        await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,patch);
        return res.status(200).json(ephemeral(`Reminder settings saved ✓\nInvite reminder times: ${times.length?times.join(', ')+' UTC':'unchanged / none supplied'}`));
      }
      if(name==='channels'){
        const patch={channel_mode:String(options.mode||'single'),updated_at:new Date().toISOString()};
        if(options.single_channel)patch.single_channel_id=String(options.single_channel);
        if(options.applications_channel)patch.applications_channel_id=String(options.applications_channel);
        if(options.reminders_channel)patch.reminders_channel_id=String(options.reminders_channel);
        if(options.invites_channel)patch.invites_channel_id=String(options.invites_channel);
        await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,patch);
        return res.status(200).json(ephemeral(`Discord channel mode saved: ${patch.channel_mode} ✓`));
      }
    }
    if(body.data.name==='invite'){
      const event=await getCurrentEvent(cfg.workspace_id);
      if(!event)return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      if(name==='list'){
        const apps=await getSelectedApps(cfg.workspace_id,event.id);
        return res.status(200).json(publicReply(inviteReport(apps)));
      }
      if(name==='sent'||name==='pending'){
        const gameId=String(options.game_id||'').trim();
        const rows=await db.select('transfer_applications',`workspace_id=eq.${cfg.workspace_id}&transfer_event_id=eq.${event.id}&player_id=eq.${encodeURIComponent(gameId)}&select=id,in_game_name,player_id,application_bucket,invite_status,current_power&limit=2`);
        if(!rows?.length)return res.status(200).json(ephemeral(`No current applicant found with Game ID ${gameId}.`));
        const a=rows[0];
        if(!['ordinary','special'].includes(a.application_bucket))return res.status(200).json(ephemeral(`${a.in_game_name||gameId} is not currently in Ordinary or Special.`));
        if(name==='sent'){
          await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'sent',invite_pending_reason:null,invite_sent_at:new Date().toISOString(),updated_at:new Date().toISOString()});
          return res.status(200).json(ephemeral(`Invite marked as sent to ${a.in_game_name||gameId} ✓`));
        }
        const reason=String(options.reason||'not_sent');
        await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'not_sent',invite_pending_reason:reason,invite_sent_at:null,updated_at:new Date().toISOString()});
        return res.status(200).json(ephemeral(`${a.in_game_name||gameId} remains pending${reason==='over_power'?' — Over Power Cap':''}.`));
      }
    }
    return res.status(200).json(ephemeral('Command not recognized.'));
  }catch(e){console.error(e);return res.status(200).json(ephemeral('NEXA could not complete that command. Check the bot configuration.'))}
}
