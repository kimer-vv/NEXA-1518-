// NEXA DISCORD BOT V1.1 — AUTOMATIC APPLICATION ALERTS + TRANSFER TIMELINE
import {
  db,getCurrentEvent,selectedApps,inviteCounts,channelFor,sendChannel,
  fmtPower,phaseTimes,workspaceUrl
} from './_discord-common.js';

const nowIso=()=>new Date().toISOString();

function hmUtc(d){
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
}
function dayKey(d){
  return d.toISOString().slice(0,10);
}
async function saveLast(cfg,last){
  await db.update(
    'transfer_discord_integrations',
    `workspace_id=eq.${cfg.workspace_id}`,
    {
      last_sent:last,
      updated_at:nowIso()
    }
  );
}
async function postOnce(cfg,last,key,content,type='reminders'){
  if(last[key])return false;

  await sendChannel(
    channelFor(cfg,type),
    {
      content,
      allowed_mentions:{parse:[]}
    }
  );

  last[key]=nowIso();
  await saveLast(cfg,last);
  return true;
}

async function sendNewApplications(cfg){
  const rows=await db.select(
    'transfer_discord_outbox',
    `workspace_id=eq.${cfg.workspace_id}&status=eq.pending&event_type=eq.new_application&available_at=lte.${encodeURIComponent(nowIso())}&order=created_at.asc&limit=10&select=*`
  );

  for(const item of rows||[]){
    try{
      const apps=await db.select(
        'transfer_applications',
        `id=eq.${item.application_id}&select=id,in_game_name,player_id,current_state,current_alliance,furnace_level,current_power,discord_username,transferring_with_group&limit=1`
      );

      const a=apps?.[0];

      if(!a){
        await db.update(
          'transfer_discord_outbox',
          `id=eq.${item.id}`,
          {
            status:'failed',
            last_error:'application_not_found'
          }
        );
        continue;
      }

      const content=
        `**📥 New Transfer Application**\n`+
        `**${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\n`+
        `From: State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}\n`+
        `Furnace: **${a.furnace_level||'—'}** · Power: **${fmtPower(a.current_power)}**`+
        `${a.discord_username?`\nDiscord: \`${a.discord_username}\``:''}\n`+
        `Group Transfer: **${a.transferring_with_group?'Yes':'No'}**\n\n`+
        `**Review full application:** ${workspaceUrl(cfg.workspace_id)}`;

      await sendChannel(
        channelFor(cfg,'applications'),
        {
          content,
          allowed_mentions:{parse:[]}
        }
      );

      await db.update(
        'transfer_discord_outbox',
        `id=eq.${item.id}`,
        {
          status:'sent',
          sent_at:nowIso(),
          attempts:Number(item.attempts||0)+1,
          last_error:null
        }
      );
    }catch(e){
      await db.update(
        'transfer_discord_outbox',
        `id=eq.${item.id}`,
        {
          attempts:Number(item.attempts||0)+1,
          last_error:String(e.message||e).slice(0,500)
        }
      );
    }
  }
}

async function timeline(cfg){
  if(!cfg.enabled||!cfg.event_start_at||!cfg.reminders_enabled)return;

  const event=await getCurrentEvent(cfg.workspace_id);
  if(!event)return;

  const now=new Date();
  const n=now.getTime();
  const t=phaseTimes(cfg.event_start_at);
  const last={...(cfg.last_sent||{})};

  if(n>=t.phase1.getTime()){
    await postOnce(
      cfg,
      last,
      'phase1_open',
      '🌌 **TRANSFER PHASE 1 IS OPEN**\nThe State Transfer Event has officially started.'
    );
  }

  if(n>=t.phase2.getTime()){
    await postOnce(
      cfg,
      last,
      'phase2_open',
      '📨 **TRANSFER PHASE 2 IS OPEN**\nInvitation operations are now active.'
    );
  }

  const warningMinutes=Math.max(
    0,
    Number(cfg.phase3_reminder_minutes||0)
  );

  const warningAt=
    t.phase3.getTime()-
    warningMinutes*60000;

  if(
    warningMinutes>0 &&
    n>=warningAt &&
    n<t.phase3.getTime() &&
    !last.phase3_final_warning
  ){
    const apps=await selectedApps(cfg.workspace_id,event.id);
    const counts=inviteCounts(event,apps);
    const parts=[];

    if(counts.ordinaryLeft>0){
      parts.push(
        `**${counts.ordinaryLeft} Ordinary Invite${counts.ordinaryLeft===1?'':'s'} still available.**`
      );
    }

    if(counts.specialLeft>0){
      parts.push(
        `**${counts.specialLeft} Special Invite${counts.specialLeft===1?'':'s'} still available.**`
      );
    }

    const remaining=
      parts.length
        ? `\n${parts.join('\n')}`
        : '\nAll available invites have been assigned.';

    const leadText=
      warningMinutes>=60 &&
      warningMinutes%60===0
        ? `${warningMinutes/60} hour${warningMinutes===60?'':'s'}`
        : `${warningMinutes} minutes`;

    await postOnce(
      cfg,
      last,
      'phase3_final_warning',
      `⏰ **FINAL INVITE WARNING**\nTransfer Phase 3 opens in ${leadText}.${remaining}`
    );
  }

  if(n>=t.phase3.getTime()){
    await postOnce(
      cfg,
      last,
      'phase3_open',
      '🚪 **TRANSFER PHASE 3 IS OPEN**'
    );
  }

  if(n>=t.end.getTime()){
    await postOnce(
      cfg,
      last,
      'event_end',
      '🌌 **TRANSFER EVENT ENDED**'
    );
  }

  if(
    n>=t.phase2.getTime() &&
    n<t.phase3.getTime()
  ){
    const wanted=(cfg.invite_reminder_times||[]).map(String);
    const current=hmUtc(now);
    const key=`invite_${dayKey(now)}_${current.replace(':','')}`;

    if(
      wanted.includes(current) &&
      !last[key]
    ){
      const apps=await selectedApps(cfg.workspace_id,event.id);
      const counts=inviteCounts(event,apps);
      const parts=[];

      if(counts.ordinaryLeft>0){
        parts.push(
          `**${counts.ordinaryLeft} Ordinary Invite${counts.ordinaryLeft===1?'':'s'} still available.**`
        );
      }

      if(counts.specialLeft>0){
        parts.push(
          `**${counts.specialLeft} Special Invite${counts.specialLeft===1?'':'s'} still available.**`
        );
      }

      if(parts.length){
        await sendChannel(
          channelFor(cfg,'reminders'),
          {
            content:`📨 **INVITE CHECK**\n${parts.join('\n')}`,
            allowed_mentions:{parse:[]}
          }
        );
      }

      last[key]=nowIso();
      await saveLast(cfg,last);
    }
  }
}

export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method)){
    return res.status(405).json({error:'GET or POST only'});
  }

  try{
    const cfgs=await db.select(
      'transfer_discord_integrations',
      'enabled=eq.true&select=*'
    );

    for(const cfg of cfgs||[]){
      await sendNewApplications(cfg);
      await timeline(cfg);
    }

    return res.status(200).json({
      ok:true,
      processed:(cfgs||[]).length,
      at:nowIso()
    });
  }catch(e){
    console.error(e);

    return res.status(500).json({
      ok:false,
      error:e.message
    });
  }
}
