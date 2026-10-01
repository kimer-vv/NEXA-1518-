// NEXA DISCORD BOT V1.10.0 — TRANSFER LIST FIX + EVENT SCHEDULE CHANNEL
import {
  rawBody,verifyDiscord,db,getConfigByGuild,
  getCurrentEvent,currentApps,selectedApps,recruitingAlliances,inviteCounts,
  eventStartFromServerDate,phaseTimes,markPastTimeline,discordTime,
  placementLabel,progressionLabel,hasT12,fmtPower,groupLine,workspaceUrl,formUrl,
  env,discord,channelFor,sendChannel
} from '../lib/discord-common.js';

const commands=[
 {
  name:'nexa',
  description:'NEXA tools for your connected server',
  options:[
   {type:1,name:'help',description:'Show the NEXA Bot command guide'},
   {type:2,name:'transfer',description:'Transfer tools',options:[
    {type:1,name:'list',description:'View the current Transfer applicant list',options:[
     {type:3,name:'placement',description:'Which Transfer list do you want?',required:true,choices:[
      {name:'All Transfer Applicants',value:'all'},
      {name:'New Applicants',value:'inbox'},
      {name:'Ordinary',value:'ordinary'},
      {name:'Special',value:'special'},
      {name:'Group Transfer',value:'group'}
     ]}
    ]},
    {type:1,name:'view',description:'View one Transfer applicant by Game ID',options:[
     {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
    ]},
    {type:1,name:'move',description:'Move a Transfer applicant',options:[
     {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},
     {type:3,name:'placement',description:'Where should this applicant go?',required:true,choices:[
      {name:'Ordinary',value:'ordinary'},
      {name:'Special',value:'special'},
      {name:'Group Transfer',value:'group'}
     ]},
     {type:3,name:'alliance',description:'Recruiting Alliance for Ordinary / Special',required:false,autocomplete:true},
     {type:3,name:'group',description:'Approved Group for Group Transfer',required:false,autocomplete:true}
    ]},
    {type:1,name:'invite-list',description:'Post the current Transfer invite list'},
    {type:1,name:'invite-sent',description:'Mark a Transfer invite as sent',options:[
     {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
    ]},
    {type:1,name:'invite-pending',description:'Mark a Transfer invite as pending',options:[
     {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
    ]}
   ]},
   {type:2,name:'schedule',description:'Event Schedule tools',options:[
    {type:1,name:'set-channel',description:'Set the Discord channel for Event Schedule posts',options:[
     {type:7,name:'channel',description:'Channel for NEXA Event Schedule posts',required:true}
    ]},
    {type:1,name:'view',description:'View the configured Event Schedule channel'}
   ]}
  ]
 }
];

export const config={api:{bodyParser:false}};

const COLORS={
  milestone:0x5865F2,
  invite:0xF1C40F,
  warning:0xED4245,
  success:0x57F287,
  info:0x3498DB,
  applicant:0x9B59B6,
  ordinary:0x2E9B6F,
  special:0xD2A52B,
  group:0xB7435F,
  newApplicant:0x3498DB,
  muted:0x95A5A6
};
const nowIso=()=>new Date().toISOString();
const safe=s=>String(s??'').slice(0,100);
const actionRow=(...components)=>({type:1,components});
const linkButton=(label,url,emoji)=>({type:2,style:5,label,url,...(emoji?{emoji:{name:emoji}}:{})});
const customButton=(label,custom_id,style=2,emoji)=>({type:2,style,label,custom_id,...(emoji?{emoji:{name:emoji}}:{})});
const field=(name,value,inline=false)=>({name:String(name),value:String(value??'—'),inline});

function embed(cfg,{title='NEXA Transfer Workspace',description,color=COLORS.info,fields=[],footer='Tap the title to open the Workspace.',timestamp=false}={}){
  const e={title,url:workspaceUrl(cfg.workspace_id),description,color,fields,footer:{text:footer}};
  if(timestamp)e.timestamp=nowIso();
  return e;
}
function responseEmbed(e,{ephemeral=true,components=[]}={}){
  return {type:4,data:{embeds:[e],components,allowed_mentions:{parse:[]},...(ephemeral?{flags:64}:{})}};
}
function updateEmbed(e,components=[]){return{type:7,data:{embeds:[e],components,allowed_mentions:{parse:[]}}}}
function responseEmbeds(embeds,{ephemeral=false,components=[]}={}){
  const list=(embeds||[]).filter(Boolean).slice(0,10);
  return {type:4,data:{embeds:list.length?list:[{description:'No applicants found.',color:COLORS.muted}],components,allowed_mentions:{parse:[]},...(ephemeral?{flags:64}:{})}};
}
function errorEmbed(cfg,title,description){return embed(cfg,{title:`⚠️ ${title}`,description,color:COLORS.warning,footer:'NEXA Bot'})}
function successEmbed(cfg,title,description,fields=[]){return embed(cfg,{title:`✅ ${title}`,description,color:COLORS.success,fields,footer:'NEXA Bot'})}
function findFocused(options=[]){for(const o of options){if(o.focused)return o;if(o.options){const x=findFocused(o.options);if(x)return x}}return null}
function modalValue(body,id){for(const row of body.data?.components||[])for(const c of row.components||[])if(c.custom_id===id)return String(c.value||'').trim();return''}
function formIsOpen(event){return !!event&&event.public_access_enabled!==false}
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

function parseNexaCommand(data){
  if(data?.name!=='nexa')return{group:null,action:null,options:{}};
  const first=data.options?.[0];
  if(!first)return{group:null,action:null,options:{}};
  if(first.type===1)return{group:null,action:first.name,options:Object.fromEntries((first.options||[]).map(o=>[o.name,o.value]))};
  if(first.type===2){
    const sub=first.options?.[0];
    if(!sub)return{group:first.name,action:null,options:{}};
    return{group:first.name,action:sub.name,options:Object.fromEntries((sub.options||[]).map(o=>[o.name,o.value]))};
  }
  return{group:null,action:null,options:{}};
}

function startPreviewEmbed(cfg,date){
  const iso=eventStartFromServerDate(date);if(!iso)return null;
  const d=new Date(iso);
  return embed(cfg,{
    title:'🌌 Transfer Event Start',
    description:'Confirm the Game/Server reset date before starting the automatic Transfer timeline.',
    color:COLORS.milestone,
    fields:[field('📅 Server / Game Day',serverDateLabel(date),true),field('🕛 Server Start','00:00 UTC',true),field('📍 Your Local Time',discordTime(d),false)],
    footer:'Discord displays the local-time field in your device timezone. Tap the title to open the Workspace.'
  });
}
function startConfirmResponse(cfg,date){
  const e=startPreviewEmbed(cfg,date);
  if(!e)return responseEmbed(errorEmbed(cfg,'Invalid Date','Use the Game/Server date in `YYYY-MM-DD` format.'));
  return responseEmbed(e,{components:[actionRow(customButton('Confirm Start',`start_confirm:${date}`,3,'✅'),customButton('Change Date','start_pick:choose',2,'📅'),customButton('Cancel','start_cancel',4))]});
}
async function saveStart(cfg,date){
  const start=eventStartFromServerDate(date);if(!start)throw new Error('invalid_date');
  await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,event_start_at:start,last_sent:markPastTimeline(start),updated_at:nowIso()});
  return {start,t:phaseTimes(start)};
}
async function clearTransferStart(cfg){await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{event_start_at:null,last_sent:{},updated_at:nowIso()})}

async function applicantByGameId(cfg,event,gameId){
  const rows=await db.select('transfer_applications',`workspace_id=eq.${cfg.workspace_id}&transfer_event_id=eq.${event.id}&archived_at=is.null&player_id=eq.${encodeURIComponent(gameId)}&select=*&limit=2`);
  return rows?.[0]||null;
}
async function validateAlliance(cfg,tag){
  if(!tag)return null;
  const rows=await recruitingAlliances(cfg.workspace_id);
  return rows.find(x=>String(x.tag).toLowerCase()===String(tag).toLowerCase())||null;
}
async function hydrateGroupMeta(workspaceId,apps){
  const rows=Array.isArray(apps)?apps:[];
  const ids=[...new Set(rows.map(a=>String(a?.group_id||'').trim()).filter(Boolean))];
  if(!ids.length)return rows;
  try{
    const groups=await db.select('transfer_workspace_groups',`workspace_id=eq.${encodeURIComponent(workspaceId)}&select=id,group_name,main_contact_ign,plan,destination_alliance_tag,new_alliance_tag,status`);
    const map=new Map((groups||[]).map(g=>[String(g.id),g]));
    return rows.map(a=>{
      const g=map.get(String(a.group_id||''));
      return g?{...a,_group_name:g.group_name||a.group_name||null,_group_leader:g.main_contact_ign||a.group_leader||null,_group_plan:g.plan||null,_group_destination:(g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag)||a.assigned_alliance_tag||null}:a;
    });
  }catch{return rows}
}
function hmUtc(d){return`${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`}
function dayKey(d){return d.toISOString().slice(0,10)}
function inviteFields(counts,pendingOps){
  const fields=[field('🎟️ Ordinary Invites',`${counts.ordinaryLeft} available`,true)];
  if(Number(counts.specialLeft||0)>0)fields.push(field('⭐ Special Invites',`${counts.specialLeft} available`,true));
  fields.push(field('📋 Pending Operations',String(pendingOps),true));
  return fields;
}
function chunkRows(rows,size=25){const out=[];for(let i=0;i<rows.length;i+=size)out.push(rows.slice(i,i+size));return out}
function compactApplicantLine(a){
  const name=a.in_game_name||'Applicant',id=a.player_id||'—';
  const furnace=String(a.furnace_level||'—').toUpperCase();
  const n=Number(a.current_power||0),power=!n?'—':n>=1e9?`${Math.round(n/1e7)/100}B`:n>=1e6?`${Math.round(n/1e6)}M`:fmtPower(n);
  const alliance=a.assigned_alliance_tag||a._group_destination||'—';
  const special=a.application_bucket==='special'?'⭐ ':'';
  return `${special}${name} · \`${id}\`\n${furnace} │ ${power} │ ${alliance}`;
}
function categoryEmbeds(cfg,rows,{title,color}){
  if(!rows.length)return[];
  return chunkRows(rows,25).map((part,i)=>embed(cfg,{title:`${title} · ${rows.length}${rows.length>25?` · ${i+1}/${Math.ceil(rows.length/25)}`:''}`,description:part.map(a=>compactApplicantLine(a)).join('\n\n'),color,footer:'⭐ Special Invite'}));
}
function compactListEmbeds(cfg,apps,placement='all'){
  const active=(apps||[]).filter(a=>a.archived_at==null&&a.application_cycle!=='next');
  // Group membership is an overlay, not a placement. A Group member can also be Ordinary or Special.
  const groups=active.filter(a=>a.group_id);
  const ordinary=active.filter(a=>a.application_bucket==='ordinary');
  const special=active.filter(a=>a.application_bucket==='special');
  const inbox=active.filter(a=>a.application_bucket==='inbox');
  if(placement==='ordinary')return categoryEmbeds(cfg,ordinary,{title:'🟢 TRANSFER · Ordinary',color:COLORS.ordinary});
  if(placement==='special')return categoryEmbeds(cfg,special,{title:'🟡 TRANSFER · Special',color:COLORS.special});
  if(placement==='group')return categoryEmbeds(cfg,groups,{title:'🔴 TRANSFER · Group Transfer',color:COLORS.group});
  if(placement==='inbox')return categoryEmbeds(cfg,inbox,{title:'🔵 TRANSFER · New Applicants',color:COLORS.newApplicant});
  return categoryEmbeds(cfg,active,{title:'🌌 TRANSFER · All Transfer Applicants',color:COLORS.info});
}
async function saveLast(cfg,last){await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{last_sent:last,updated_at:nowIso()})}
async function postOnce(cfg,last,key,payload,type='reminders'){
  if(last[key])return false;
  await sendChannel(channelFor(cfg,type),{...payload,allowed_mentions:{parse:[]}});
  last[key]=nowIso();await saveLast(cfg,last);return true;
}
async function sendNewApplications(cfg){
  const rows=await db.select('transfer_discord_outbox',`workspace_id=eq.${cfg.workspace_id}&status=eq.pending&event_type=eq.new_application&available_at=lte.${encodeURIComponent(nowIso())}&order=created_at.asc&limit=10&select=*`);
  for(const item of rows||[]){
    try{
      const found=await db.select('transfer_applications',`id=eq.${item.application_id}&archived_at=is.null&select=id,in_game_name,player_id,current_state,current_alliance,furnace_level,current_power,discord_username,transferring_with_group,group_id,group_name,group_leader&limit=1`);
      let a=found?.[0];
      if(!a){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'failed',last_error:'application_not_found_or_archived'});continue}
      [a]=await hydrateGroupMeta(cfg.workspace_id,[a]);
      const g=groupLine(a);
      const e=embed(cfg,{title:'📥 New Transfer Application',description:`**${a.in_game_name||'Applicant'}** submitted a new Transfer application.`,color:COLORS.applicant,fields:[field('🎮 Game ID',`\`${a.player_id||'—'}\``,true),field('🏰 Current State',a.current_state?`State ${a.current_state}`:'—',true),field('🛡️ Alliance',a.current_alliance||'—',true),field('🔥 Furnace',a.furnace_level||'—',true),field('⚡ Power',fmtPower(a.current_power),true),field('👥 Group',g||'Individual applicant',false),...(a.discord_username?[field('💬 Discord',`\`${a.discord_username}\``,false)]:[])],timestamp:true});
      await sendChannel(channelFor(cfg,'applications'),{embeds:[e],components:workspaceOnlyComponents(cfg,'View in Transfer Workspace'),allowed_mentions:{parse:[]}});
      await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'sent',sent_at:nowIso(),attempts:Number(item.attempts||0)+1,last_error:null});
    }catch(e){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{attempts:Number(item.attempts||0)+1,last_error:String(e.message||e).slice(0,500)})}
  }
}
async function timeline(cfg){
  if(!cfg.enabled||!cfg.event_start_at)return;
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return;
  const now=new Date(),n=now.getTime(),t=phaseTimes(cfg.event_start_at),last={...(cfg.last_sent||{})};
  if(n>=t.phase1.getTime())await postOnce(cfg,last,'phase1_open',{embeds:[embed(cfg,{title:'🌌 Transfer Phase 1 Is Open',description:'The State Transfer Event has officially started.',color:COLORS.milestone,timestamp:true})],components:announcementComponents(cfg,event)});
  if(n>=t.phase2.getTime())await postOnce(cfg,last,'phase2_open',{embeds:[embed(cfg,{title:'📨 Transfer Phase 2 Is Open',description:'Invitation operations are now active.',color:COLORS.milestone,timestamp:true})],components:announcementComponents(cfg,event)});
  if(cfg.reminders_enabled){
    const warningMinutes=Math.max(0,Number(cfg.phase3_reminder_minutes||0)),warningAt=t.phase3.getTime()-warningMinutes*60000;
    if(warningMinutes>0&&n>=warningAt&&n<t.phase3.getTime()&&!last.phase3_final_warning){
      const apps=await selectedApps(cfg.workspace_id,event.id),counts=inviteCounts(event,apps),pendingOps=apps.filter(a=>a.invite_status!=='sent').length;
      const leadText=warningMinutes>=60&&warningMinutes%60===0?`${warningMinutes/60} hour${warningMinutes===60?'':'s'}`:`${warningMinutes} minutes`;
      await postOnce(cfg,last,'phase3_final_warning',{embeds:[embed(cfg,{title:'🚨 Final Invite Warning',description:`**${leadText} until Open Transfer begins.**\nReview any remaining invitation operations before Open Transfer begins.`,color:COLORS.warning,fields:inviteFields(counts,pendingOps),timestamp:true})],components:announcementComponents(cfg,event)});
    }
  }
  if(n>=t.phase3.getTime())await postOnce(cfg,last,'phase3_open',{embeds:[embed(cfg,{title:'🚪 Open Transfer Is Active',description:'Open Transfer is now active.',color:COLORS.milestone,timestamp:true})],components:announcementComponents(cfg,event)});
  if(n>=t.end.getTime())await postOnce(cfg,last,'event_end',{embeds:[embed(cfg,{title:'🌌 Transfer Event Ended',description:'This Transfer cycle has ended.',color:COLORS.milestone,footer:'Transfer cycle completed.',timestamp:true})]});
  if(cfg.reminders_enabled&&n>=t.phase2.getTime()&&n<t.phase3.getTime()){
    const wanted=(cfg.invite_reminder_times||[]).map(String),current=hmUtc(now),key=`invite_${dayKey(now)}_${current.replace(':','')}`;
    if(wanted.includes(current)&&!last[key]){
      const apps=await selectedApps(cfg.workspace_id,event.id),counts=inviteCounts(event,apps),pendingOps=apps.filter(a=>a.invite_status!=='sent').length;
      if(counts.ordinaryLeft>0||counts.specialLeft>0)await sendChannel(channelFor(cfg,'reminders'),{embeds:[embed(cfg,{title:'📋 Invite Check',description:'Current invitation status during the Invitational Phase.',color:COLORS.invite,fields:inviteFields(counts,pendingOps),timestamp:true})],components:announcementComponents(cfg,event),allowed_mentions:{parse:[]}});
      last[key]=nowIso();await saveLast(cfg,last);
    }
  }
}
async function runTick(){const cfgs=await db.select('transfer_discord_integrations','enabled=eq.true&select=*');for(const cfg of cfgs||[]){await sendNewApplications(cfg);await timeline(cfg)}return{ok:true,processed:(cfgs||[]).length,at:nowIso()}}
async function registerGuildCommands(guild){const app=env('DISCORD_APPLICATION_ID');await discord(`/applications/${app}/commands`,{method:'PUT',body:[]});const result=await discord(`/applications/${app}/guilds/${guild}/commands`,{method:'PUT',body:commands});return{ok:true,scope:'guild',guild_id:guild,global_commands_cleared:true,commands:result.map(x=>({id:x.id,name:x.name}))}}

async function sendWorkspaceTest(workspaceId,staffToken,kind){
  if(!workspaceId||!staffToken)throw new Error('Staff session required');
  const allowed=await db.rpc('transfer_staff_access_ok',{p_workspace_id:workspaceId,p_token:staffToken,p_manager:true});
  if(allowed!==true)throw new Error('Admin or Owner access required');
  const rows=await db.select('transfer_discord_integrations',`workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&limit=1`),cfg=rows?.[0];
  if(!cfg?.guild_id||cfg.enabled!==true)throw new Error('Discord integration is not enabled');
  let type='reminders',payload;
  if(kind==='application'){
    type='applications';payload={embeds:[embed(cfg,{title:'🧪 TEST · New Transfer Application',description:'This is a test of the **New Applications** notification route.',color:COLORS.applicant,fields:[field('🎮 Game ID','`123456789`',true),field('🏰 Current State','State 1500',true),field('🛡️ Alliance','TEST',true),field('🔥 Furnace','FC10',true),field('⚡ Power','1.2B',true),field('👥 Group','Individual applicant',false)],footer:'TEST MESSAGE · No applicant was created.',timestamp:true})],components:workspaceOnlyComponents(cfg,'Open Transfer Workspace'),allowed_mentions:{parse:[]}};
  }else if(kind==='applicant_ops'){
    type='applicants';payload={embeds:[embed(cfg,{title:'🧪 TEST · Applicant Operations',description:'This is a test of the **Applicant Operations** route. No applicant was moved or changed.',color:COLORS.applicant,fields:[field('👤 Applicant','Test Player',true),field('🎮 Game ID','`123456789`',true),field('📂 Placement','Ordinary',true)],footer:'TEST MESSAGE · No applicant data was changed.',timestamp:true})],components:workspaceOnlyComponents(cfg),allowed_mentions:{parse:[]}};
  }else if(kind==='warning'){
    type='reminders';payload={embeds:[embed(cfg,{title:'🧪 TEST · Final Invite Warning',description:'**3 hours until Open Transfer begins.**\nReview any remaining invitation operations before Open Transfer begins.',color:COLORS.warning,fields:[field('🎟️ Ordinary Invites','2 available',true),field('⭐ Special Invites','1 available',true),field('📋 Pending Operations','3',true)],footer:'TEST MESSAGE · No Transfer phase, invite, or schedule was changed.',timestamp:true})],components:workspaceOnlyComponents(cfg,'Open Transfer Workspace'),allowed_mentions:{parse:[]}};
  }else if(kind==='invite'){
    type='invites';payload={embeds:[embed(cfg,{title:'🧪 TEST · Invite Operations',description:'This is a test of the **Invite Operations** notification route.',color:COLORS.invite,fields:[field('🎟️ Ordinary Invites','2 available',true),field('⭐ Special Invites','1 available',true),field('📋 Pending Operations','3',true)],footer:'TEST MESSAGE · No invite status was changed.',timestamp:true})],components:workspaceOnlyComponents(cfg,'Open Transfer Workspace'),allowed_mentions:{parse:[]}};
  }else{
    type='reminders';payload={embeds:[embed(cfg,{title:'🧪 TEST · Transfer Announcement',description:'This is a test of the **Transfer Announcements** notification route. Your live Transfer timeline was not changed.',color:COLORS.milestone,fields:[field('🌌 Route','Transfer Announcements',true),field('✅ Status','Connected',true)],footer:'TEST MESSAGE · No Transfer phase was started or changed.',timestamp:true})],components:workspaceOnlyComponents(cfg,'Open Transfer Workspace'),allowed_mentions:{parse:[]}};
  }
  const channelId=channelFor(cfg,type);if(!channelId)throw new Error(`No ${type} channel is configured`);const sent=await sendChannel(channelId,payload);return{ok:true,kind,type,channel_id:channelId,message_id:sent?.id||null};
}

async function transferList(cfg,options){
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.'));
  const rawApps=await currentApps(cfg.workspace_id,event.id),apps=await hydrateGroupMeta(cfg.workspace_id,rawApps);
  return responseEmbeds(compactListEmbeds(cfg,apps,String(options.placement||'all')),{ephemeral:false,components:workspaceOnlyComponents(cfg)});
}
async function scheduleCommand(cfg,action,options){
  if(action==='set-channel'){
    const channelId=String(options.channel||'').trim();
    if(!channelId)return responseEmbed(errorEmbed(cfg,'Channel Required','Choose the Discord channel where NEXA should post Event Schedule reminders.'));
    await db.update('transfer_discord_integrations',`workspace_id=eq.${encodeURIComponent(cfg.workspace_id)}`,{
      event_schedule_channel_id:channelId,
      updated_at:nowIso()
    });
    return responseEmbed(successEmbed(cfg,'Event Schedule Channel Saved',`NEXA Event Schedule posts will use <#${channelId}>.`,[
      field('Channel',`<#${channelId}>`,false)
    ]));
  }
  if(action==='view'){
    const channelId=String(cfg.event_schedule_channel_id||'').trim();
    if(!channelId)return responseEmbed(embed(cfg,{
      title:'📅 Event Schedule',
      description:'No Event Schedule channel is configured yet. Use `/nexa schedule set-channel`.',
      color:COLORS.info,
      footer:'NEXA Bot'
    }));
    return responseEmbed(embed(cfg,{
      title:'📅 Event Schedule',
      description:`Configured channel: <#${channelId}>`,
      color:COLORS.info,
      footer:'NEXA Bot'
    }));
  }
  return responseEmbed(errorEmbed(cfg,'Command Not Recognized','Choose an Event Schedule command.'));
}

async function transferView(cfg,options){
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.'));
  let a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return responseEmbed(errorEmbed(cfg,'Applicant Not Found',`No current applicant was found with Game ID \`${options.game_id}\`.`));
  [a]=await hydrateGroupMeta(cfg.workspace_id,[a]);
  const g=groupLine(a),e=embed(cfg,{title:`👤 TRANSFER · ${a.in_game_name||'Applicant'}`,description:`Game ID: \`${a.player_id||'—'}\``,color:COLORS.applicant,fields:[field('🏰 From',`State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}`,false),field('🔥 Furnace',a.furnace_level||'—',true),field('⚡ Power',fmtPower(a.current_power),true),field('🪖 T12',hasT12(a)?'Yes':'No',true),field('📈 Account Progress',progressionLabel(a.account_progression),true),field('📂 Placement',placementLabel(a),true),field('🛡️ Assigned Alliance',a.assigned_alliance_tag||'Unassigned',true),...(g?[field('👥 Group',g,false)]:[]),field('📨 Invite',a.invite_status==='sent'?'Sent':a.invite_pending_reason==='over_power'?'Pending · Over Power Cap':'Not Sent Yet',false)]});
  return responseEmbed(e,{ephemeral:false,components:workspaceOnlyComponents(cfg)});
}
async function transferMove(cfg,options){
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.'));
  let a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return responseEmbed(errorEmbed(cfg,'Applicant Not Found',`No current applicant was found with Game ID \`${options.game_id}\`.`));
  [a]=await hydrateGroupMeta(cfg.workspace_id,[a]);
  const placement=String(options.placement||''),allianceRaw=options.alliance?String(options.alliance):'',groupRaw=options.group?String(options.group):'';
  if(placement==='group'){
    if(!groupRaw)return responseEmbed(errorEmbed(cfg,'Choose a Group','Select an approved Group Transfer destination.'));
    const rows=await db.select('transfer_workspace_groups',`id=eq.${encodeURIComponent(groupRaw)}&workspace_id=eq.${encodeURIComponent(cfg.workspace_id)}&archived_at=is.null&status=eq.approved&select=id,group_name,plan,destination_alliance_tag,new_alliance_tag&limit=1`);
    const g=rows?.[0];if(!g)return responseEmbed(errorEmbed(cfg,'Group Not Available','That Group is not active or approved.'));
    const dest=g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag;
    await db.update('transfer_applications',`id=eq.${a.id}`,{group_id:g.id,group_name:g.group_name,transferring_with_group:true,assigned_alliance_tag:dest||a.assigned_alliance_tag||null,updated_at:nowIso()});
    return responseEmbed(successEmbed(cfg,'Group Assigned',`**${a.in_game_name||a.player_id}** is now in Group Transfer.`,[field('Current Alliance',g.group_name||'—',true),field('Destination',dest||'Not decided',true),field('Route',a.application_bucket==='special'?'🟡 Special':a.application_bucket==='ordinary'?'🟢 Ordinary':'⚪ Not classified',true)]));
  }
  if(!['ordinary','special'].includes(placement))return responseEmbed(errorEmbed(cfg,'Placement Not Available','Choose Ordinary, Special, or Group Transfer.'));
  let alliance=a._group_destination||a.assigned_alliance_tag||null;
  if(!a.group_id&&allianceRaw){const valid=await validateAlliance(cfg,allianceRaw);if(!valid)return responseEmbed(errorEmbed(cfg,'Alliance Not Available',`**${allianceRaw}** is not an active Recruiting Alliance for this Workspace.`));alliance=String(valid.tag)}
  if(!alliance)return responseEmbed(errorEmbed(cfg,'Alliance Required','Choose an active Recruiting Alliance before moving this applicant to Ordinary or Special.'));
  await db.update('transfer_applications',`id=eq.${a.id}`,{application_bucket:placement,application_cycle:'current',assigned_alliance_tag:alliance,updated_at:nowIso()});
  return responseEmbed(successEmbed(cfg,'Applicant Updated',`**${a.in_game_name||a.player_id}** moved successfully.`,[field('Route',placement==='special'?'🟡 Special':'🟢 Ordinary',true),field('Alliance',alliance,true),...(a.group_id?[field('Group Transfer','🔴 Yes',true)]:[])]));
}
async function transferInvite(cfg,action,options){
  const event=await getCurrentEvent(cfg.workspace_id);if(!event)return responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.'));
  if(action==='invite-list'){
    const rawApps=await currentApps(cfg.workspace_id,event.id),apps=await hydrateGroupMeta(cfg.workspace_id,rawApps),target=channelFor(cfg,'invites');
    if(!target)return responseEmbed(errorEmbed(cfg,'Invite Channel Not Configured','Assign an Invite Operations channel first in NEXA Workspace.'));
    const selected=apps.filter(a=>a.application_cycle!=='next'&&['ordinary','special'].includes(String(a.application_bucket||''))),sent=selected.filter(a=>a.invite_status==='sent'),pending=selected.filter(a=>a.invite_status!=='sent');
    const sections=[{rows:sent,title:'✅ TRANSFER · Invite Sent',color:COLORS.success},{rows:pending,title:'⏳ TRANSFER · Invite Pending',color:COLORS.invite}];
    let posted=0;
    for(const s of sections){for(const e of categoryEmbeds(cfg,s.rows,s)){await sendChannel(target,{embeds:[e],components:workspaceOnlyComponents(cfg),allowed_mentions:{parse:[]}});posted++}}
    return responseEmbed(successEmbed(cfg,'Invite List Posted',`Posted **${posted}** invite section${posted===1?'':'s'} to <#${target}>.`,[field('✅ Sent',String(sent.length),true),field('⏳ Pending',String(pending.length),true),field('⭐ Special',String(selected.filter(a=>a.application_bucket==='special').length),true)]));
  }
  const a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return responseEmbed(errorEmbed(cfg,'Applicant Not Found',`No current applicant was found with Game ID \`${options.game_id}\`.`));
  if(!['ordinary','special'].includes(a.application_bucket)||a.application_cycle==='next')return responseEmbed(errorEmbed(cfg,'Invite Not Available',`**${a.in_game_name||a.player_id}** is not currently in Ordinary or Special for this cycle.`));
  if(action==='invite-sent'){await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'sent',invite_pending_reason:null,invite_sent_at:nowIso(),updated_at:nowIso()});return responseEmbed(successEmbed(cfg,'Invite Marked Sent',`Invite marked as sent to **${a.in_game_name||a.player_id}**.`))}
  await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'not_sent',invite_pending_reason:null,invite_sent_at:null,updated_at:nowIso()});return responseEmbed(embed(cfg,{title:'⬜ TRANSFER · Invite Pending',description:`**${a.in_game_name||a.player_id}** is marked Pending.`,color:COLORS.warning,footer:'NEXA Bot'}));
}
function helpResponse(cfg){
  const e=embed(cfg,{title:'🌌 NEXA Bot',description:'One NEXA command hub for Transfer and Event Schedule tools.',color:COLORS.info,fields:[
    field('📋 Transfer List','`/nexa transfer list` → All / New Applicants / Ordinary / Special / Group Transfer',false),
    field('👤 Applicant','`/nexa transfer view` · quick details\n`/nexa transfer move` · Ordinary / Special / Group Transfer',false),
    field('📨 Invites','`/nexa transfer invite-list` · post roster\n`/nexa transfer invite-sent` · mark sent\n`/nexa transfer invite-pending` · mark pending',false),
    field('📅 Event Schedule','`/nexa schedule set-channel` · choose posting channel\n`/nexa schedule view` · show configured channel',false),
    field('🎨 Transfer Colors','🟢 Ordinary · 🟡 Special · 🔴 Group Transfer',false)
  ],footer:'Full setup stays in NEXA Workspace.'});
  return responseEmbed(e,{components:workspaceOnlyComponents(cfg,'Open Transfer Workspace')});
}

export default async function handler(req,res){
  if(req.method==='GET'){
    try{
      const url=new URL(req.url||'/api/discord-interactions','http://localhost'),action=url.searchParams.get('action');
      if(action==='register')return res.status(200).json(await registerGuildCommands(url.searchParams.get('guild_id')||env('DISCORD_GUILD_ID')));
      if(action==='register-global')return res.status(409).json({ok:false,error:'global_registration_disabled',message:'NEXA uses guild commands only. Use action=register.'});
      if(action==='workspace-test'){
        const workspaceId=String(url.searchParams.get('workspace_id')||'').trim(),kind=String(url.searchParams.get('kind')||'announcement').trim(),auth=String(req.headers.authorization||''),staffToken=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
        try{return res.status(200).json(await sendWorkspaceTest(workspaceId,staffToken,kind))}catch(e){const msg=String(e.message||e),status=/required|denied|access/i.test(msg)?403:400;return res.status(status).json({ok:false,error:msg})}
      }
      if(action==='workspace-channels'){
        const workspaceId=String(url.searchParams.get('workspace_id')||'').trim(),auth=String(req.headers.authorization||''),staffToken=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
        if(!workspaceId||!staffToken)return res.status(401).json({ok:false,error:'Staff session required'});
        const allowed=await db.rpc('transfer_staff_access_ok',{p_workspace_id:workspaceId,p_token:staffToken,p_manager:false});if(allowed!==true)return res.status(403).json({ok:false,error:'Workspace access denied'});
        const rows=await db.select('transfer_discord_integrations',`workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&limit=1`),cfg=rows?.[0];if(!cfg?.guild_id)return res.status(200).json({ok:true,connected:false,guild:null,channels:[]});
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
    const body=JSON.parse(raw.toString('utf8'));if(body.type===1)return res.status(200).json({type:1});
    const cfg=await getConfigByGuild(body.guild_id);if(!cfg)return res.status(200).json({type:4,data:{content:'This Discord server is not connected to a NEXA Transfer Workspace yet.',flags:64}});

    if(body.type===3){
      const id=String(body.data?.custom_id||'');
      if(id.startsWith('copy_form:')){const eventId=id.split(':')[1];return res.status(200).json(responseEmbed(embed(cfg,{title:'🔗 Transfer Form Link',description:`${formUrl(eventId)}\n\nCopy and share this link wherever you need.`,color:COLORS.info,footer:'NEXA Bot'})))}
      if(id==='start_cancel')return res.status(200).json(updateEmbed(embed(cfg,{title:'❌ Transfer Start Cancelled',description:'No changes were made to the Transfer timeline.',color:COLORS.muted,footer:'NEXA Bot'}),[]));
      if(id==='transfer_end_cancel')return res.status(200).json(updateEmbed(embed(cfg,{title:'↩️ No Changes Made',description:'The Transfer timeline was left unchanged.',color:COLORS.muted,footer:'NEXA Bot'}),[]));
      if(id==='transfer_end_confirm'){
        if(!cfg.event_start_at)return res.status(200).json(updateEmbed(errorEmbed(cfg,'No Transfer Timeline Scheduled','There is no scheduled or active Transfer timeline to cancel or end.'),[]));
        const start=new Date(cfg.event_start_at),started=Date.now()>=start.getTime();if(started){const e=embed(cfg,{title:'🌌 Transfer Event Ended',description:'This Transfer cycle has ended.',color:COLORS.milestone,footer:'Transfer cycle completed.',timestamp:true});await sendChannel(channelFor(cfg,'reminders'),{embeds:[e],allowed_mentions:{parse:[]}})}
        await clearTransferStart(cfg);return res.status(200).json(updateEmbed(successEmbed(cfg,started?'Transfer Event Ended':'Scheduled Start Cancelled',started?'Future automatic Transfer announcements have been stopped. Transfer data and applicants were kept.':'The scheduled start date was removed. No automatic Transfer phase announcements will begin until a new start is scheduled.'),workspaceOnlyComponents(cfg)));
      }
      if(id.startsWith('start_pick:')){
        const choice=id.split(':')[1];
        if(choice==='choose')return res.status(200).json({type:9,data:{custom_id:'start_date_modal',title:'Choose Transfer Start Date',components:[{type:1,components:[{type:4,custom_id:'server_date',label:'Game/Server reset date (YYYY-MM-DD)',style:1,min_length:10,max_length:10,required:true,placeholder:'2026-09-08'}]}]}});
        const date=choice==='tomorrow'?utcDateOffset(1):utcDateOffset(0),e=startPreviewEmbed(cfg,date);return res.status(200).json(updateEmbed(e,[actionRow(customButton('Confirm Start',`start_confirm:${date}`,3,'✅'),customButton('Change Date','start_pick:choose',2,'📅'),customButton('Cancel','start_cancel',4))]));
      }
      if(id.startsWith('start_confirm:')){const date=id.slice('start_confirm:'.length),saved=await saveStart(cfg,date),e=successEmbed(cfg,'Transfer Timeline Saved','Automatic phase announcements are now scheduled.',[field('🌌 Server Start',`${serverDateLabel(date)} · 00:00 UTC`,false),field('📍 Your Local Time',discordTime(new Date(saved.start)),false),field('📨 Invitational Phase',discordTime(saved.t.phase2),true),field('🚪 Open Transfer',discordTime(saved.t.phase3),true),field('🏁 Event End',discordTime(saved.t.end),false)]);return res.status(200).json(updateEmbed(e,workspaceOnlyComponents(cfg)))}
      return res.status(200).json(responseEmbed(errorEmbed(cfg,'Action Unavailable','That button is no longer available.')));
    }

    if(body.type===5){if(body.data?.custom_id==='start_date_modal')return res.status(200).json(startConfirmResponse(cfg,modalValue(body,'server_date')));return res.status(200).json(responseEmbed(errorEmbed(cfg,'Form Unavailable','That form is no longer available.')))}

    if(body.type===4){
      const focused=findFocused(body.data?.options||[]),q=String(focused?.value||'').toLowerCase();
      if(focused?.name==='alliance'){
        const rows=await recruitingAlliances(cfg.workspace_id),choices=(rows||[]).filter(x=>!q||String(x.tag||'').toLowerCase().includes(q)||String(x.name||'').toLowerCase().includes(q)).slice(0,25).map(x=>({name:safe(`${x.tag}${x.name?' · '+x.name:''}`),value:String(x.tag)}));
        return res.status(200).json({type:8,data:{choices}});
      }
      if(focused?.name==='group'){
        const rows=await db.select('transfer_workspace_groups',`workspace_id=eq.${encodeURIComponent(cfg.workspace_id)}&archived_at=is.null&status=eq.approved&select=id,group_name,plan,destination_alliance_tag,new_alliance_tag&order=group_name.asc`);
        const choices=(rows||[]).filter(g=>!q||String(g.group_name||'').toLowerCase().includes(q)||String(g.destination_alliance_tag||'').toLowerCase().includes(q)||String(g.new_alliance_tag||'').toLowerCase().includes(q)).slice(0,25).map(g=>{const dest=g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag;return{name:safe(`${g.group_name||'Current Alliance'}${dest?' → '+dest:''}`),value:String(g.id)}});
        return res.status(200).json({type:8,data:{choices}});
      }
      return res.status(200).json({type:8,data:{choices:[]}});
    }

    if(body.type!==2)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Unsupported Interaction','NEXA could not process that interaction.')));
    const route=parseNexaCommand(body.data);
    if(body.data.name!=='nexa')return res.status(200).json(responseEmbed(errorEmbed(cfg,'Old Command','This server now uses `/nexa`. Start typing `/nexa` to see the organized command menu.')));
    if(route.action==='help')return res.status(200).json(helpResponse(cfg));
    if(route.group==='schedule')return res.status(200).json(await scheduleCommand(cfg,route.action,route.options));
    if(route.group!=='transfer')return res.status(200).json(responseEmbed(errorEmbed(cfg,'Command Not Recognized','Choose a NEXA category and command.')));
    if(route.action==='list')return res.status(200).json(await transferList(cfg,route.options));
    if(route.action==='view')return res.status(200).json(await transferView(cfg,route.options));
    if(route.action==='move')return res.status(200).json(await transferMove(cfg,route.options));
    if(['invite-list','invite-sent','invite-pending'].includes(route.action))return res.status(200).json(await transferInvite(cfg,route.action,route.options));
    return res.status(200).json(responseEmbed(errorEmbed(cfg,'Command Not Recognized','NEXA did not recognize that command.')));
  }catch(e){console.error(e);return res.status(200).json({type:4,data:{content:'NEXA could not complete that command. Check the bot configuration.',flags:64}})}
}
