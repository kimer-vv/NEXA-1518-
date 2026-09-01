 NEXA DISCORD BOT V1.3.1 — SINGLE ENDPOINT / INTERACTIONS + REGISTER + TICK
import {
  rawBody,verifyDiscord,ephemeral,publicReply,subcommand,db,getConfigByGuild,
  getCurrentEvent,currentApps,selectedApps,inviteCounts,inviteReport,
  eventStartFromServerDate,phaseState,phaseTimes,markPastTimeline,discordTime,
  miniApplicant,placementLabel,progressionLabel,hasT12,fmtPower,workspaceUrl,
  env,discord,channelFor,sendChannel
} from '../lib/discord-common.js';


const commands=[
 {name:'help',description:'See how the NEXA Transfer Bot works and view all commands'},
 {name:'transfer',description:'Transfer event setup and quick status',options:[
  {type:1,name:'start',description:'Set Transfer start using the Game/Server reset date',options:[{type:3,name:'server_date',description:'Game/Server date at reset (YYYY-MM-DD), not your local date',required:true}]},
  {type:1,name:'status',description:'Show the current Transfer cycle status'},
  {type:1,name:'reminders',description:'Turn Transfer reminders on or off',options:[{type:3,name:'setting',description:'Reminder status',required:true,choices:[{name:'On',value:'on'},{name:'Off',value:'off'}]}]},
  {type:1,name:'channels',description:'Assign a Discord channel to one message category',options:[
   {type:3,name:'category',description:'What should be sent to this channel?',required:true,choices:[{name:'New Applications',value:'applications'},{name:'Transfer Reminders',value:'reminders'},{name:'Invite Operations',value:'invites'}]},
   {type:7,name:'channel',description:'Choose the Discord channel',required:true}
  ]}
 ]},
 {name:'applicants',description:'View Transfer applicant lists',options:[
  {type:1,name:'unassigned',description:'Show applicants still waiting for placement'},
  {type:1,name:'list',description:'View applicants by placement',options:[{type:3,name:'placement',description:'Which applicant list?',required:true,choices:[{name:'Unassigned',value:'inbox'},{name:'Ordinary',value:'ordinary'},{name:'Special',value:'special'},{name:'Not Selected',value:'not_selected'},{name:'Next Transfer Cycle',value:'next_cycle'},{name:'All',value:'all'}]}]}
 ]},
 {name:'applicant',description:'View or update one Transfer applicant',options:[
  {type:1,name:'view',description:'Show a quick applicant summary',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}]},
  {type:1,name:'move',description:'Move an applicant to a placement',options:[
   {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},
   {type:3,name:'placement',description:'New placement',required:true,choices:[{name:'Ordinary',value:'ordinary'},{name:'Special',value:'special'},{name:'Not Selected',value:'not_selected'},{name:'Next Transfer Cycle',value:'next_cycle'}]},
   {type:3,name:'alliance',description:'Optional recruiting alliance',required:false,autocomplete:true}
  ]}
 ]},
 {name:'invite',description:'Manage Transfer invitation status',options:[
  {type:1,name:'sent',description:'Mark an approved applicant Invite Sent',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}]},
  {type:1,name:'pending',description:'Keep an approved applicant pending',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},{type:3,name:'reason',description:'Why it is still pending',required:true,choices:[{name:'Not sent yet',value:'not_sent'},{name:'Over Power Cap',value:'over_power'}]}]},
  {type:1,name:'list',description:'Post Invites Sent and Still Pending'}
 ]}
];

export const config={api:{bodyParser:false}};
const ALLOWED_GUILD=process.env.DISCORD_GUILD_ID;

function findFocused(options=[]){
  for(const o of options){
    if(o.focused)return o;
    if(o.options){
      const x=findFocused(o.options);
      if(x)return x;
    }
  }
  return null;
}
function safe(s){return String(s??'').slice(0,100)}
async function applicantByGameId(cfg,event,gameId){
  const rows=await db.select(
    'transfer_applications',
    `workspace_id=eq.${cfg.workspace_id}&transfer_event_id=eq.${event.id}&player_id=eq.${encodeURIComponent(gameId)}&select=*&limit=2`
  );
  return rows?.[0]||null;
}
function listFooter(cfg){
  return `\n\n**Need the full picture?** Open NEXA Transfer Workspace for complete applicant details:\n${workspaceUrl(cfg.workspace_id)}`;
}
function listCards(apps,cfg,title){
  const max=10,shown=apps.slice(0,max);
  let text=`**${title}**\n\n${shown.length?shown.map(miniApplicant).join('\n\n'):'No applicants found.'}`;
  if(apps.length>max)text+=`\n\n…and ${apps.length-max} more.`;
  return text+listFooter(cfg);
}

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

async function runTick(){
  try{
    const cfgs=await db.select(
      'transfer_discord_integrations',
      'enabled=eq.true&select=*'
    );

    for(const cfg of cfgs||[]){
      await sendNewApplications(cfg);
      await timeline(cfg);
    }

    return {
      ok:true,
      processed:(cfgs||[]).length,
      at:nowIso()
    };
  }catch(e){
    console.error(e);
    throw e;
  }
}

async function registerGuildCommands(){
  const app=env('DISCORD_APPLICATION_ID');
  const guild=env('DISCORD_GUILD_ID');
  const result=await discord(`/applications/${app}/guilds/${guild}/commands`,{
    method:'PUT',
    body:commands
  });
  return {
    ok:true,
    guild_id:guild,
    commands:result.map(x=>({id:x.id,name:x.name}))
  };
}

export default async function handler(req,res){
  if(req.method==='GET'){
    try{
      const url=new URL(req.url||'/api/discord-interactions','http://localhost');
      const action=url.searchParams.get('action');
      if(action==='register'){
        return res.status(200).json(await registerGuildCommands());
      }
      if(action==='tick'){
        return res.status(200).json(await runTick());
      }
      return res.status(405).json({error:'Use POST for Discord interactions or GET ?action=register / ?action=tick'});
    }catch(e){
      console.error(e);
      return res.status(500).json({ok:false,error:e.message});
    }
  }

  if(req.method!=='POST')return res.status(405).json({error:'POST only'});
  try{
    const raw=await rawBody(req);
    const sig=req.headers['x-signature-ed25519'];
    const ts=req.headers['x-signature-timestamp'];

    if(!verifyDiscord(
      raw,
      Array.isArray(sig)?sig[0]:sig,
      Array.isArray(ts)?ts[0]:ts
    )){
      return res.status(401).send('invalid request signature');
    }

    const body=JSON.parse(raw.toString('utf8'));

    if(body.type===1){
      return res.status(200).json({type:1});
    }

    if(ALLOWED_GUILD&&body.guild_id!==ALLOWED_GUILD){
      return res.status(200).json(ephemeral('This bot is not configured for this server.'));
    }

    const cfg=await getConfigByGuild(body.guild_id);
    if(!cfg){
      return res.status(200).json(ephemeral('This Discord server is not connected to a NEXA Transfer Workspace yet.'));
    }

    if(body.type===4){
      const focused=findFocused(body.data?.options||[]);
      if(focused?.name!=='alliance'){
        return res.status(200).json({type:8,data:{choices:[]}});
      }

      const event=await getCurrentEvent(cfg.workspace_id);
      if(!event){
        return res.status(200).json({type:8,data:{choices:[]}});
      }

      const rows=await db.select(
        'transfer_recruiting_alliances',
        `transfer_event_id=eq.${event.id}&is_active=eq.true&select=tag,name&order=sort_order.asc`
      );

      const q=String(focused.value||'').toLowerCase();
      const choices=(rows||[])
        .filter(x=>!q||String(x.tag||'').toLowerCase().includes(q)||String(x.name||'').toLowerCase().includes(q))
        .slice(0,25)
        .map(x=>({
          name:safe(`${x.tag}${x.name?' · '+x.name:''}`),
          value:String(x.tag)
        }));

      return res.status(200).json({type:8,data:{choices}});
    }

    if(body.type!==2){
      return res.status(200).json(ephemeral('Unsupported interaction.'));
    }

    const {name,options}=subcommand(body.data);

    if(body.data.name==='help'){
      const text=[
        '**🌌 NEXA Transfer Bot — Help**',
        'A quick companion for **NEXA Transfer Workspace**. Use Discord for fast checks and common actions; use NEXA for complete applications and full Transfer management.',
        '',
        '**Transfer**',
        '`/transfer start` — Set the Transfer start using the **Game/Server reset date**. The bot calculates Phase 1, Phase 2, Phase 3, and Event End automatically.',
        '`/transfer status` — Show a quick cycle summary.',
        '`/transfer reminders` — Turn reminders On/Off. **Reminder times are scheduled in NEXA Transfer Workspace → Integrations → Discord** using Invite Check Times (UTC) and Final Invite Warning.',
        '`/transfer channels` — Pick a message category and assign the Discord channel where it should post.',
        '',
        '**Applicants**',
        '`/applicants unassigned` — Show applicants still waiting for placement.',
        '`/applicants list` — View applicants by placement.',
        '`/applicant view` — View a quick applicant card by Game ID.',
        '`/applicant move` — Move to Ordinary, Special, Not Selected, or Next Transfer Cycle. Alliance is optional.',
        '',
        '**Invites**',
        '`/invite sent` — Mark an invite sent.',
        '`/invite pending` — Keep it pending or mark Over Power Cap.',
        '`/invite list` — Show Invites Sent and Still Pending.',
        '',
        `**Full details:** ${workspaceUrl(cfg.workspace_id)}`
      ].join('\n');

      return res.status(200).json(ephemeral(text));
    }

    if(body.data.name==='transfer'){
      if(name==='start'){
        const start=eventStartFromServerDate(String(options.server_date||''));

        if(!start){
          return res.status(200).json(ephemeral(
            'Use the Game/Server reset date as YYYY-MM-DD. Do not use your local calendar date.'
          ));
        }

        const last=markPastTimeline(start);

        await db.update(
          'transfer_discord_integrations',
          `workspace_id=eq.${cfg.workspace_id}`,
          {
            enabled:true,
            event_start_at:start,
            last_sent:last,
            updated_at:new Date().toISOString()
          }
        );

        const t=phaseTimes(start);

        return res.status(200).json(ephemeral(
          `Transfer timeline saved ✓\n`+
          `Server Start: **${options.server_date} at reset (00:00 UTC)**\n`+
          `Phase 2: ${discordTime(t.phase2)}\n`+
          `Phase 3: ${discordTime(t.phase3)}\n`+
          `Event End: ${discordTime(t.end)}\n\n`+
          `The bot uses Game/Server time, not your local time.`
        ));
      }

      if(name==='status'){
        const event=await getCurrentEvent(cfg.workspace_id);

        if(!event){
          return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
        }

        const apps=await currentApps(cfg.workspace_id,event.id);
        const selected=apps.filter(a=>['ordinary','special'].includes(a.application_bucket));
        const counts=inviteCounts(event,selected);
        const state=phaseState(cfg.event_start_at);
        const unassigned=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next').length;
        const sent=selected.filter(a=>a.invite_status==='sent').length;
        const pending=selected.length-sent;

        const times=(cfg.invite_reminder_times||[]).length
          ? cfg.invite_reminder_times.join(', ')+' UTC'
          : 'Not set';

        const warning=Number(cfg.phase3_reminder_minutes||0)>0
          ? `${cfg.phase3_reminder_minutes} minutes before Phase 3`
          : 'Not set';

        const text=
          `**🌌 Transfer Status**\n`+
          `Phase: **${state.phase}**${state.next?`\nNext transition: ${discordTime(state.next)}`:''}\n\n`+
          `Unassigned Applicants: **${unassigned}**\n`+
          `Ordinary Invites Available: **${counts.ordinaryLeft}**\n`+
          `Special Invites Available: **${counts.specialLeft}**\n`+
          `Invites Sent: **${sent}** · Pending: **${pending}**\n\n`+
          `Reminders: **${cfg.reminders_enabled?'On':'Off'}**\n`+
          `Invite Check Times: **${times}**\n`+
          `Final Invite Warning: **${warning}**`;

        return res.status(200).json(publicReply(text));
      }

      if(name==='reminders'){
        const on=String(options.setting)==='on';

        await db.update(
          'transfer_discord_integrations',
          `workspace_id=eq.${cfg.workspace_id}`,
          {
            reminders_enabled:on,
            updated_at:new Date().toISOString()
          }
        );

        return res.status(200).json(ephemeral(
          `Transfer reminders are now **${on?'ON':'OFF'}**.\n`+
          `Reminder times are configured in **NEXA Transfer Workspace → Integrations → Discord**.`
        ));
      }

      if(name==='channels'){
        const category=String(options.category);
        const channel=String(options.channel);

        const field=
          category==='applications'
            ? 'applications_channel_id'
            : category==='reminders'
              ? 'reminders_channel_id'
              : 'invites_channel_id';

        await db.update(
          'transfer_discord_integrations',
          `workspace_id=eq.${cfg.workspace_id}`,
          {
            [field]:channel,
            updated_at:new Date().toISOString()
          }
        );

        const label=
          category==='applications'
            ? 'New Applications'
            : category==='reminders'
              ? 'Transfer Reminders'
              : 'Invite Operations';

        return res.status(200).json(ephemeral(
          `${label} → <#${channel}> ✓`
        ));
      }
    }

    if(body.data.name==='applicants'){
      const event=await getCurrentEvent(cfg.workspace_id);

      if(!event){
        return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      }

      const apps=await currentApps(cfg.workspace_id,event.id);

      if(name==='unassigned'){
        const rows=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next');

        return res.status(200).json(publicReply(
          listCards(rows,cfg,`📥 Unassigned Applicants · ${rows.length}`)
        ));
      }

      if(name==='list'){
        const placement=String(options.placement||'all');
        let rows=apps;
        let title='Applicants';

        if(placement==='inbox'){
          rows=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next');
          title='📥 Unassigned Applicants';
        }else if(placement==='next_cycle'){
          rows=apps.filter(a=>a.application_bucket==='next_cycle'||a.application_cycle==='next');
          title='⏭️ Next Transfer Cycle';
        }else if(placement!=='all'){
          rows=apps.filter(a=>a.application_bucket===placement);
          title=`📂 ${
            placement==='not_selected'
              ? 'Not Selected'
              : placement[0].toUpperCase()+placement.slice(1)
          }`;
        }

        return res.status(200).json(publicReply(
          listCards(rows,cfg,`${title} · ${rows.length}`)
        ));
      }
    }

    if(body.data.name==='applicant'){
      const event=await getCurrentEvent(cfg.workspace_id);

      if(!event){
        return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      }

      const a=await applicantByGameId(
        cfg,
        event,
        String(options.game_id||'').trim()
      );

      if(!a){
        return res.status(200).json(ephemeral(
          `No current applicant found with Game ID ${options.game_id}.`
        ));
      }

      if(name==='view'){
        const text=
          `**👤 ${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\n`+
          `From: State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}\n`+
          `Furnace: **${a.furnace_level||'—'}** · Power: **${fmtPower(a.current_power)}**\n`+
          `T12: **${hasT12(a)?'Yes':'No'}** · Account Progress: **${progressionLabel(a.account_progression)}**\n`+
          `Placement: **${placementLabel(a)}**\n`+
          `Assigned Alliance: **${a.assigned_alliance_tag||'Unassigned'}**\n`+
          `Invite: **${
            a.invite_status==='sent'
              ? 'Sent'
              : a.invite_pending_reason==='over_power'
                ? 'Pending · Over Power Cap'
                : 'Pending'
          }**`+
          listFooter(cfg);

        return res.status(200).json(publicReply(text));
      }

      if(name==='move'){
        const placement=String(options.placement);
        const alliance=options.alliance?String(options.alliance):null;

        const patch={
          application_bucket:placement,
          application_cycle:placement==='next_cycle'?'next':'current',
          assigned_alliance_tag:['ordinary','special'].includes(placement)?alliance:null,
          updated_at:new Date().toISOString()
        };

        await db.update(
          'transfer_applications',
          `id=eq.${a.id}`,
          patch
        );

        const placementText=
          placement==='next_cycle'
            ? 'Next Transfer Cycle'
            : placement==='not_selected'
              ? 'Not Selected'
              : placement[0].toUpperCase()+placement.slice(1);

        const allianceText=
          alliance
            ? ` · Alliance: **${alliance}**`
            : ['ordinary','special'].includes(placement)
              ? ' · Alliance: **Unassigned**'
              : '';

        return res.status(200).json(ephemeral(
          `${a.in_game_name||a.player_id} moved to **${placementText}**${allianceText} ✓`
        ));
      }
    }

    if(body.data.name==='invite'){
      const event=await getCurrentEvent(cfg.workspace_id);

      if(!event){
        return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      }

      if(name==='list'){
        const apps=await selectedApps(cfg.workspace_id,event.id);

        return res.status(200).json(publicReply(
          inviteReport(apps)+listFooter(cfg)
        ));
      }

      const a=await applicantByGameId(
        cfg,
        event,
        String(options.game_id||'').trim()
      );

      if(!a){
        return res.status(200).json(ephemeral(
          `No current applicant found with Game ID ${options.game_id}.`
        ));
      }

      if(!['ordinary','special'].includes(a.application_bucket)){
        return res.status(200).json(ephemeral(
          `${a.in_game_name||a.player_id} is not currently in Ordinary or Special.`
        ));
      }

      if(name==='sent'){
        await db.update(
          'transfer_applications',
          `id=eq.${a.id}`,
          {
            invite_status:'sent',
            invite_pending_reason:null,
            invite_sent_at:new Date().toISOString(),
            updated_at:new Date().toISOString()
          }
        );

        return res.status(200).json(ephemeral(
          `Invite marked as sent to **${a.in_game_name||a.player_id}** ✓`
        ));
      }

      if(name==='pending'){
        const reason=String(options.reason||'not_sent');

        await db.update(
          'transfer_applications',
          `id=eq.${a.id}`,
          {
            invite_status:'not_sent',
            invite_pending_reason:reason,
            invite_sent_at:null,
            updated_at:new Date().toISOString()
          }
        );

        return res.status(200).json(ephemeral(
          `**${a.in_game_name||a.player_id}** remains pending${reason==='over_power'?' · Over Power Cap':''} ✓`
        ));
      }
    }

    return res.status(200).json(ephemeral('Command not recognized.'));
  }catch(e){
    console.error(e);
    return res.status(200).json(ephemeral(
      'NEXA could not complete that command. Check the bot configuration.'
    ));
  }
}
