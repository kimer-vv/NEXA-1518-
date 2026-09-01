// NEXA DISCORD BOT V1.4 — CONSOLIDATED BOT / LINKS / START FLOW / MULTI-GUILD
import {
  rawBody,verifyDiscord,ephemeral,publicReply,subcommand,db,getConfigByGuild,
  getCurrentEvent,currentApps,selectedApps,recruitingAlliances,inviteCounts,inviteReport,
  eventStartFromServerDate,phaseState,phaseTimes,markPastTimeline,discordTime,
  miniApplicant,placementLabel,progressionLabel,hasT12,fmtPower,workspaceUrl,formUrl,
  env,discord,channelFor,sendChannel
} from '../lib/discord-common.js';

const commands=[
 {name:'help',description:'See how the NEXA Transfer Bot works and view all commands'},
 {name:'transfer',description:'Transfer event setup and quick status',options:[
  {type:1,name:'start',description:'Schedule Transfer start using the Game/Server reset date',options:[
   {type:3,name:'server_date',description:'Optional Game/Server date (YYYY-MM-DD)',required:false}
  ]},
  {type:1,name:'status',description:'Show the current Transfer cycle status'},
  {type:1,name:'reminders',description:'Turn Transfer reminders on or off',options:[{type:3,name:'setting',description:'Reminder status',required:true,choices:[{name:'On',value:'on'},{name:'Off',value:'off'}]}]},
  {type:1,name:'channels',description:'Assign a Discord channel to one message category',options:[
   {type:3,name:'category',description:'What should be sent to this channel?',required:true,choices:[{name:'New Applications',value:'applications'},{name:'Transfer Announcements',value:'reminders'},{name:'Invite Operations',value:'invites'}]},
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
   {type:3,name:'alliance',description:'Optional active Recruiting Alliance',required:false,autocomplete:true}
  ]}
 ]},
 {name:'invite',description:'Manage Transfer invitation status',options:[
  {type:1,name:'sent',description:'Mark an approved applicant Invite Sent',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}]},
  {type:1,name:'pending',description:'Keep an approved applicant pending',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},{type:3,name:'reason',description:'Why it is still pending',required:true,choices:[{name:'Not sent yet',value:'not_sent'},{name:'Over Power Cap',value:'over_power'}]}]},
  {type:1,name:'list',description:'Show Invites Sent and Still Pending'}
 ]}
];

export const config={api:{bodyParser:false}};
const nowIso=()=>new Date().toISOString();
const safe=s=>String(s??'').slice(0,100);
const actionRow=(...components)=>({type:1,components});
const linkButton=(label,url,emoji)=>({type:2,style:5,label,url,...(emoji?{emoji:{name:emoji}}:{})});
const customButton=(label,custom_id,style=2,emoji)=>({type:2,style,label,custom_id,...(emoji?{emoji:{name:emoji}}:{})});
const response=(content,{ephemeral=true,components=[]}={})=>({type:4,data:{content,components,allowed_mentions:{parse:[]},...(ephemeral?{flags:64}:{})}});
const updateResponse=(content,components=[])=>({type:7,data:{content,components,allowed_mentions:{parse:[]}}});

function findFocused(options=[]){for(const o of options){if(o.focused)return o;if(o.options){const x=findFocused(o.options);if(x)return x}}return null}
function modalValue(body,id){for(const row of body.data?.components||[])for(const c of row.components||[])if(c.custom_id===id)return String(c.value||'').trim();return''}
function formIsOpen(event){return !!event&&event.applications_open!==false&&event.public_access_enabled!==false}
function workspaceMarkdown(cfg,label='Open Transfer Workspace'){return `[${label}](${workspaceUrl(cfg.workspace_id)})`}
function listFooter(cfg){return `\n\n**Need the full picture?** ${workspaceMarkdown(cfg)}`}
function listCards(apps,cfg,title){const max=10,shown=apps.slice(0,max);let text=`**${title}**\n\n${shown.length?shown.map(miniApplicant).join('\n\n'):'No applicants found.'}`;if(apps.length>max)text+=`\n\n…and ${apps.length-max} more.`;return text+listFooter(cfg)}
function announcementComponents(cfg,event,{includeForm=true}={}){
  const buttons=[linkButton('Transfer Workspace',workspaceUrl(cfg.workspace_id),'🌐')];
  if(includeForm&&formIsOpen(event)){
    buttons.push(linkButton('View Form',formUrl(event.id),'📝'));
    buttons.push(customButton('Copy Form Link',`copy_form:${event.id}`,2,'🔗'));
  }
  return [actionRow(...buttons)];
}
function workspaceOnlyComponents(cfg,label='Transfer Workspace'){return[actionRow(linkButton(label,workspaceUrl(cfg.workspace_id),'🌐'))]}
function serverDateLabel(date){const d=new Date(`${date}T00:00:00Z`);return d.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric',year:'numeric'})}
function utcDateOffset(days=0){const d=new Date();d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
function startPreview(date){
  const iso=eventStartFromServerDate(date);if(!iso)return null;
  const d=new Date(iso);
  return `**🌌 Transfer Event Start**\n**Server/Game Day:** ${serverDateLabel(date)}\n**Server/Game Start:** 00:00 UTC\n**Your Local Time:** ${discordTime(d)}\n\nDiscord automatically displays the last line in your device's local time. Confirm only if the Server/Game Day is correct.`;
}
function startChoiceResponse(){
  return response('**🌌 Choose Transfer Event Start**\nThe date is always the **Game/Server reset date at 00:00 UTC**, not your local calendar date.',{
    components:[actionRow(
      customButton('Today','start_pick:today',1),
      customButton('Tomorrow','start_pick:tomorrow',1),
      customButton('Choose Date','start_pick:choose',2,'📅')
    )]
  });
}
function startConfirmResponse(date){
  const text=startPreview(date);
  if(!text)return response('That date is invalid. Use YYYY-MM-DD.');
  return response(text,{components:[actionRow(
    customButton('Confirm Start',`start_confirm:${date}`,3,'✅'),
    customButton('Change Date','start_pick:choose',2,'📅'),
    customButton('Cancel','start_cancel',4)
  )]});
}
async function saveStart(cfg,date){
  const start=eventStartFromServerDate(date);if(!start)throw new Error('invalid_date');
  await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{
    enabled:true,event_start_at:start,last_sent:markPastTimeline(start),updated_at:nowIso()
  });
  return {start,t:phaseTimes(start)};
}
async function applicantByGameId(cfg,event,gameId){const rows=await db.select('transfer_applications',`workspace_id=eq.${cfg.workspace_id}&transfer_event_id=eq.${event.id}&player_id=eq.${encodeURIComponent(gameId)}&select=*&limit=2`);return rows?.[0]||null}
async function validateAlliance(cfg,tag){
  if(!tag)return null;
  const rows=await recruitingAlliances(cfg.workspace_id);
  return rows.find(x=>String(x.tag).toLowerCase()===String(tag).toLowerCase())||null;
}
function hmUtc(d){return`${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`}
function dayKey(d){return d.toISOString().slice(0,10)}
async function saveLast(cfg,last){await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{last_sent:last,updated_at:nowIso()})}
async function postOnce(cfg,last,key,payload,type='reminders'){
  if(last[key])return false;
  await sendChannel(channelFor(cfg,type),typeof payload==='string'?{content:payload,allowed_mentions:{parse:[]}}:{...payload,allowed_mentions:{parse:[]}});
  last[key]=nowIso();await saveLast(cfg,last);return true;
}

async function sendNewApplications(cfg){
  const rows=await db.select('transfer_discord_outbox',`workspace_id=eq.${cfg.workspace_id}&status=eq.pending&event_type=eq.new_application&available_at=lte.${encodeURIComponent(nowIso())}&order=created_at.asc&limit=10&select=*`);
  for(const item of rows||[]){
    try{
      const apps=await db.select('transfer_applications',`id=eq.${item.application_id}&select=id,in_game_name,player_id,current_state,current_alliance,furnace_level,current_power,discord_username,transferring_with_group&limit=1`);
      const a=apps?.[0];
      if(!a){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'failed',last_error:'application_not_found'});continue}
      const content=`**📥 New Transfer Application**\n**${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\nFrom: State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}\nFurnace: **${a.furnace_level||'—'}** · Power: **${fmtPower(a.current_power)}**${a.discord_username?`\nDiscord: \`${a.discord_username}\``:''}\nGroup Transfer: **${a.transferring_with_group?'Yes':'No'}**`;
      await sendChannel(channelFor(cfg,'applications'),{content,components:workspaceOnlyComponents(cfg,'View in Transfer Workspace'),allowed_mentions:{parse:[]}});
      await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'sent',sent_at:nowIso(),attempts:Number(item.attempts||0)+1,last_error:null});
    }catch(e){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{attempts:Number(item.attempts||0)+1,last_error:String(e.message||e).slice(0,500)})}
  }
}

async function timeline(cfg){
  if(!cfg.enabled||!cfg.event_start_at)return;
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return;
  const now=new Date(),n=now.getTime(),t=phaseTimes(cfg.event_start_at),last={...(cfg.last_sent||{})};

  if(n>=t.phase1.getTime())await postOnce(cfg,last,'phase1_open',{content:'🌌 **TRANSFER PHASE 1 IS OPEN**\nThe State Transfer Event has officially started.',components:announcementComponents(cfg,event)});
  if(n>=t.phase2.getTime())await postOnce(cfg,last,'phase2_open',{content:'📨 **TRANSFER PHASE 2 IS OPEN**\nInvitation operations are now active.',components:announcementComponents(cfg,event)});

  if(cfg.reminders_enabled){
    const warningMinutes=Math.max(0,Number(cfg.phase3_reminder_minutes||0));
    const warningAt=t.phase3.getTime()-warningMinutes*60000;
    if(warningMinutes>0&&n>=warningAt&&n<t.phase3.getTime()&&!last.phase3_final_warning){
      const apps=await selectedApps(cfg.workspace_id,event.id),counts=inviteCounts(event,apps),parts=[],pendingOps=apps.filter(a=>a.invite_status!=='sent').length;
      if(counts.ordinaryLeft>0)parts.push(`**${counts.ordinaryLeft} Ordinary Invite${counts.ordinaryLeft===1?'':'s'} still available.**`);
      if(counts.specialLeft>0)parts.push(`**${counts.specialLeft} Special Invite${counts.specialLeft===1?'':'s'} still available.**`);
      const remaining=(parts.length?`\n${parts.join('\n')}`:'\nAll available invites have been assigned.')+`\n**Pending Invite Operations: ${pendingOps}**`;
      const leadText=warningMinutes>=60&&warningMinutes%60===0?`${warningMinutes/60} hour${warningMinutes===60?'':'s'}`:`${warningMinutes} minutes`;
      await postOnce(cfg,last,'phase3_final_warning',{content:`⏰ **FINAL INVITE WARNING**\nTransfer Phase 3 opens in ${leadText}.${remaining}`,components:announcementComponents(cfg,event)});
    }
  }

  if(n>=t.phase3.getTime())await postOnce(cfg,last,'phase3_open',{content:'🚪 **TRANSFER PHASE 3 IS OPEN**',components:announcementComponents(cfg,event)});
  if(n>=t.end.getTime())await postOnce(cfg,last,'event_end','🌌 **TRANSFER EVENT ENDED**');

  if(cfg.reminders_enabled&&n>=t.phase2.getTime()&&n<t.phase3.getTime()){
    const wanted=(cfg.invite_reminder_times||[]).map(String),current=hmUtc(now),key=`invite_${dayKey(now)}_${current.replace(':','')}`;
    if(wanted.includes(current)&&!last[key]){
      const apps=await selectedApps(cfg.workspace_id,event.id),counts=inviteCounts(event,apps),parts=[],pendingOps=apps.filter(a=>a.invite_status!=='sent').length;
      if(counts.ordinaryLeft>0)parts.push(`**${counts.ordinaryLeft} Ordinary Invite${counts.ordinaryLeft===1?'':'s'} still available.**`);
      if(counts.specialLeft>0)parts.push(`**${counts.specialLeft} Special Invite${counts.specialLeft===1?'':'s'} still available.**`);
      if(parts.length)await sendChannel(channelFor(cfg,'reminders'),{content:`📨 **INVITE CHECK**\n${parts.join('\n')}\n**Pending Invite Operations: ${pendingOps}**`,components:announcementComponents(cfg,event),allowed_mentions:{parse:[]}});
      last[key]=nowIso();await saveLast(cfg,last);
    }
  }
}

async function runTick(){
  const cfgs=await db.select('transfer_discord_integrations','enabled=eq.true&select=*');
  for(const cfg of cfgs||[]){await sendNewApplications(cfg);await timeline(cfg)}
  return{ok:true,processed:(cfgs||[]).length,at:nowIso()};
}
async function registerGuildCommands(guild){const app=env('DISCORD_APPLICATION_ID');const result=await discord(`/applications/${app}/guilds/${guild}/commands`,{method:'PUT',body:commands});return{ok:true,scope:'guild',guild_id:guild,commands:result.map(x=>({id:x.id,name:x.name}))}}
async function registerGlobalCommands(){const app=env('DISCORD_APPLICATION_ID');const result=await discord(`/applications/${app}/commands`,{method:'PUT',body:commands});return{ok:true,scope:'global',commands:result.map(x=>({id:x.id,name:x.name}))}}

export default async function handler(req,res){
  if(req.method==='GET'){
    try{
      const url=new URL(req.url||'/api/discord-interactions','http://localhost'),action=url.searchParams.get('action');
      if(action==='register')return res.status(200).json(await registerGuildCommands(url.searchParams.get('guild_id')||env('DISCORD_GUILD_ID')));
      if(action==='register-global')return res.status(200).json(await registerGlobalCommands());
      if(action==='workspace-channels'){
        const workspaceId=String(url.searchParams.get('workspace_id')||'').trim();
        const auth=String(req.headers.authorization||'');
        const staffToken=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
        if(!workspaceId||!staffToken)return res.status(401).json({ok:false,error:'Staff session required'});
        const allowed=await db.rpc('transfer_staff_access_ok',{p_workspace_id:workspaceId,p_token:staffToken,p_manager:false});
        if(allowed!==true)return res.status(403).json({ok:false,error:'Workspace access denied'});
        const rows=await db.select('transfer_discord_integrations',`workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&limit=1`);
        const cfg=rows?.[0];
        if(!cfg?.guild_id)return res.status(200).json({ok:true,connected:false,guild:null,channels:[]});
        const [guild,allChannels]=await Promise.all([discord(`/guilds/${cfg.guild_id}`),discord(`/guilds/${cfg.guild_id}/channels`)]);
        const channels=(allChannels||[]).filter(c=>[0,5].includes(Number(c.type))).sort((a,b)=>(Number(a.position||0)-Number(b.position||0))||String(a.name).localeCompare(String(b.name))).map(c=>({id:c.id,name:c.name,type:c.type}));
        return res.status(200).json({ok:true,connected:true,guild:{id:guild.id,name:guild.name,icon:guild.icon||null},channels});
      }
      if(action==='tick')return res.status(200).json(await runTick());
      return res.status(405).json({error:'Use POST for Discord interactions or supported GET actions'});
    }catch(e){console.error(e);return res.status(500).json({ok:false,error:e.message})}
  }
  if(req.method!=='POST')return res.status(405).json({error:'POST only'});

  try{
    const raw=await rawBody(req),sig=req.headers['x-signature-ed25519'],ts=req.headers['x-signature-timestamp'];
    if(!verifyDiscord(raw,Array.isArray(sig)?sig[0]:sig,Array.isArray(ts)?ts[0]:ts))return res.status(401).send('invalid request signature');
    const body=JSON.parse(raw.toString('utf8'));
    if(body.type===1)return res.status(200).json({type:1});

    const cfg=await getConfigByGuild(body.guild_id);
    if(!cfg)return res.status(200).json(ephemeral('This Discord server is not connected to a NEXA Transfer Workspace yet.'));

    if(body.type===3){
      const id=String(body.data?.custom_id||'');
      if(id.startsWith('copy_form:')){
        const eventId=id.split(':')[1];
        return res.status(200).json(response(`**Form Link**\n${formUrl(eventId)}\n\nCopy and share this link wherever you need.`));
      }
      if(id==='start_cancel')return res.status(200).json(updateResponse('Transfer start cancelled.',[]));
      if(id.startsWith('start_pick:')){
        const choice=id.split(':')[1];
        if(choice==='choose')return res.status(200).json({type:9,data:{custom_id:'start_date_modal',title:'Choose Transfer Start Date',components:[{type:1,components:[{type:4,custom_id:'server_date',label:'Game/Server reset date (YYYY-MM-DD)',style:1,min_length:10,max_length:10,required:true,placeholder:'2026-09-08'}]}]}});
        const date=choice==='tomorrow'?utcDateOffset(1):utcDateOffset(0);
        const preview=startPreview(date);
        return res.status(200).json(updateResponse(preview,[actionRow(customButton('Confirm Start',`start_confirm:${date}`,3,'✅'),customButton('Change Date','start_pick:choose',2,'📅'),customButton('Cancel','start_cancel',4))]));
      }
      if(id.startsWith('start_confirm:')){
        const date=id.slice('start_confirm:'.length),saved=await saveStart(cfg,date);
        return res.status(200).json(updateResponse(`**✅ Transfer timeline saved**\n**Server Start:** ${serverDateLabel(date)} · 00:00 UTC\n**Your Local Time:** ${discordTime(new Date(saved.start))}\n**Phase 2:** ${discordTime(saved.t.phase2)}\n**Phase 3:** ${discordTime(saved.t.phase3)}\n**Event End:** ${discordTime(saved.t.end)}\n\nPhase announcements are automatic. Invite reminder times are configured in NEXA Transfer Workspace → Integrations → Discord.`,workspaceOnlyComponents(cfg)));
      }
      return res.status(200).json(ephemeral('That action is no longer available.'));
    }

    if(body.type===5){
      if(body.data?.custom_id==='start_date_modal'){
        const date=modalValue(body,'server_date');
        return res.status(200).json(startConfirmResponse(date));
      }
      return res.status(200).json(ephemeral('That form is no longer available.'));
    }

    if(body.type===4){
      const focused=findFocused(body.data?.options||[]);
      if(focused?.name!=='alliance')return res.status(200).json({type:8,data:{choices:[]}});
      const q=String(focused.value||'').toLowerCase(),rows=await recruitingAlliances(cfg.workspace_id);
      const choices=(rows||[]).filter(x=>!q||String(x.tag||'').toLowerCase().includes(q)||String(x.name||'').toLowerCase().includes(q)).slice(0,25).map(x=>({name:safe(`${x.tag}${x.name?' · '+x.name:''}`),value:String(x.tag)}));
      return res.status(200).json({type:8,data:{choices}});
    }

    if(body.type!==2)return res.status(200).json(ephemeral('Unsupported interaction.'));
    const {name,options}=subcommand(body.data);

    if(body.data.name==='help'){
      const text=['**🌌 NEXA Transfer Bot — Help**','Use Discord for quick Transfer operations and NEXA Transfer Workspace for complete management.','','**Transfer**','`/transfer start` — Choose Today, Tomorrow, or a Game/Server reset date.','`/transfer status` — Show the current Transfer cycle status.','`/transfer reminders` — Turn reminder checks On/Off. Schedule times live in NEXA Integrations.','`/transfer channels` — Assign New Applications, Transfer Announcements, or Invite Operations to a channel.','','**Applicants**','`/applicants unassigned` — Show applicants waiting for placement.','`/applicants list` — View applicants by placement.','`/applicant view` — Quick applicant card by Game ID.','`/applicant move` — Move applicant; Alliance suggestions come only from active Recruiting Alliances.','','**Invites**','`/invite sent` — Mark an invite sent.','`/invite pending` — Keep pending / Over Power Cap.','`/invite list` — Show Invites Sent and Still Pending.'].join('\n');
      return res.status(200).json(response(text,{components:workspaceOnlyComponents(cfg,'Full Details')}));
    }

    if(body.data.name==='transfer'){
      if(name==='start'){
        const date=String(options.server_date||'').trim();
        return res.status(200).json(date?startConfirmResponse(date):startChoiceResponse());
      }
      if(name==='status'){
        const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
        const apps=await currentApps(cfg.workspace_id,event.id),selected=apps.filter(a=>['ordinary','special'].includes(a.application_bucket)),counts=inviteCounts(event,selected),state=phaseState(cfg.event_start_at),unassigned=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next').length,sent=selected.filter(a=>a.invite_status==='sent').length,pending=selected.length-sent;
        const times=(cfg.invite_reminder_times||[]).length?cfg.invite_reminder_times.join(', ')+' UTC':'Not set';
        const warning=Number(cfg.phase3_reminder_minutes||0)>0?`${cfg.phase3_reminder_minutes} minutes before Phase 3`:'Not set';
        const text=`**🌌 Transfer Status**\nPhase: **${state.phase}**${state.next?`\nNext transition: ${discordTime(state.next)}`:''}\n\nUnassigned Applicants: **${unassigned}**\nOrdinary Invites Available: **${counts.ordinaryLeft}**\nSpecial Invites Available: **${counts.specialLeft}**\nInvites Sent: **${sent}** · Pending: **${pending}**\n\nReminders: **${cfg.reminders_enabled?'On':'Off'}**\nInvite Check Times: **${times}**\nFinal Invite Warning: **${warning}**`;
        return res.status(200).json(publicReply(text));
      }
      if(name==='reminders'){
        const on=String(options.setting)==='on';
        await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,reminders_enabled:on,updated_at:nowIso()});
        return res.status(200).json(ephemeral(`Transfer reminders are now **${on?'ON':'OFF'}**.\nReminder times are configured in **NEXA Transfer Workspace → Integrations → Discord**.`));
      }
      if(name==='channels'){
        const category=String(options.category),channel=String(options.channel),field=category==='applications'?'applications_channel_id':category==='reminders'?'reminders_channel_id':'invites_channel_id';
        await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,[field]:channel,updated_at:nowIso()});
        const label=category==='applications'?'New Applications':category==='reminders'?'Transfer Announcements':'Invite Operations';
        return res.status(200).json(ephemeral(`${label} → <#${channel}> ✓\nDiscord integration is **ON** for this Workspace.`));
      }
    }

    if(body.data.name==='applicants'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      const apps=await currentApps(cfg.workspace_id,event.id);
      if(name==='unassigned'){const rows=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next');return res.status(200).json(publicReply(listCards(rows,cfg,`📥 Unassigned Applicants · ${rows.length}`)))}
      if(name==='list'){
        const placement=String(options.placement||'all');let rows=apps,title='Applicants';
        if(placement==='inbox'){rows=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next');title='📥 Unassigned Applicants'}
        else if(placement==='next_cycle'){rows=apps.filter(a=>a.application_bucket==='next_cycle'||a.application_cycle==='next');title='⏭️ Next Transfer Cycle'}
        else if(placement!=='all'){rows=apps.filter(a=>a.application_bucket===placement);title=`📂 ${placement==='not_selected'?'Not Selected':placement[0].toUpperCase()+placement.slice(1)}`}
        return res.status(200).json(publicReply(listCards(rows,cfg,`${title} · ${rows.length}`)));
      }
    }

    if(body.data.name==='applicant'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      const a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return res.status(200).json(ephemeral(`No current applicant found with Game ID ${options.game_id}.`));
      if(name==='view'){
        const text=`**👤 ${a.in_game_name||'Applicant'}** · \`${a.player_id||'—'}\`\nFrom: State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}\nFurnace: **${a.furnace_level||'—'}** · Power: **${fmtPower(a.current_power)}**\nT12: **${hasT12(a)?'Yes':'No'}** · Account Progress: **${progressionLabel(a.account_progression)}**\nPlacement: **${placementLabel(a)}**\nAssigned Alliance: **${a.assigned_alliance_tag||'Unassigned'}**\nInvite: **${a.invite_status==='sent'?'Sent':a.invite_pending_reason==='over_power'?'Pending · Over Power Cap':'Pending'}**${listFooter(cfg)}`;
        return res.status(200).json(publicReply(text));
      }
      if(name==='move'){
        const placement=String(options.placement),allianceRaw=options.alliance?String(options.alliance):null;
        let alliance=null;
        if(['ordinary','special'].includes(placement)&&allianceRaw){const valid=await validateAlliance(cfg,allianceRaw);if(!valid)return res.status(200).json(ephemeral(`**${allianceRaw}** is not an active Recruiting Alliance for this Workspace. Choose one of the suggested alliances.`));alliance=String(valid.tag)}
        await db.update('transfer_applications',`id=eq.${a.id}`,{application_bucket:placement,application_cycle:placement==='next_cycle'?'next':'current',assigned_alliance_tag:['ordinary','special'].includes(placement)?alliance:null,updated_at:nowIso()});
        const placementText=placement==='next_cycle'?'Next Transfer Cycle':placement==='not_selected'?'Not Selected':placement[0].toUpperCase()+placement.slice(1),allianceText=alliance?` · Alliance: **${alliance}**`:['ordinary','special'].includes(placement)?' · Alliance: **Unassigned**':'';
        return res.status(200).json(ephemeral(`${a.in_game_name||a.player_id} moved to **${placementText}**${allianceText} ✓`));
      }
    }

    if(body.data.name==='invite'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(ephemeral('No active Transfer cycle was found.'));
      if(name==='list'){const apps=await selectedApps(cfg.workspace_id,event.id),content=inviteReport(apps)+listFooter(cfg);await sendChannel(channelFor(cfg,'invites'),{content,allowed_mentions:{parse:[]}});return res.status(200).json(ephemeral(`Invite list posted to <#${channelFor(cfg,'invites')}> ✓`))}
      const a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return res.status(200).json(ephemeral(`No current applicant found with Game ID ${options.game_id}.`));
      if(!['ordinary','special'].includes(a.application_bucket))return res.status(200).json(ephemeral(`${a.in_game_name||a.player_id} is not currently in Ordinary or Special.`));
      if(name==='sent'){await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'sent',invite_pending_reason:null,invite_sent_at:nowIso(),updated_at:nowIso()});return res.status(200).json(ephemeral(`Invite marked as sent to **${a.in_game_name||a.player_id}** ✓`))}
      if(name==='pending'){const reason=String(options.reason||'not_sent');await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'not_sent',invite_pending_reason:reason,invite_sent_at:null,updated_at:nowIso()});return res.status(200).json(ephemeral(`**${a.in_game_name||a.player_id}** remains pending${reason==='over_power'?' · Over Power Cap':''} ✓`))}
    }

    return res.status(200).json(ephemeral('Command not recognized.'));
  }catch(e){console.error(e);return res.status(200).json(ephemeral('NEXA could not complete that command. Check the bot configuration.'))}
}
