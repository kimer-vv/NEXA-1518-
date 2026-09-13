// NEXA DISCORD BOT V1.8.1 — FULL INVITE ROSTER / ONE-LINE COMPACT ROWS
import {
  rawBody,verifyDiscord,subcommand,db,getConfigByGuild,
  getCurrentEvent,currentApps,selectedApps,recruitingAlliances,inviteCounts,inviteReport,
  eventStartFromServerDate,phaseState,phaseTimes,markPastTimeline,discordTime,
  miniApplicant,placementLabel,progressionLabel,hasT12,fmtPower,groupLine,workspaceUrl,formUrl,
  env,discord,channelFor,sendChannel
} from '../lib/discord-common.js';

const commands=[
 {name:'help',description:'See the simplified NEXA Transfer Bot commands'},
 {name:'applicants',description:'View the current Transfer list',options:[
  {type:1,name:'list',description:'Show a compact color-coded applicant list',options:[
   {type:3,name:'placement',description:'Which list do you want?',required:true,choices:[
    {name:'All',value:'all'},
    {name:'New Applicants',value:'inbox'},
    {name:'Ordinary',value:'ordinary'},
    {name:'Special',value:'special'},
    {name:'Group Transfer',value:'group'}
   ]}
  ]}
 ]},
 {name:'applicant',description:'View or move one Transfer applicant',options:[
  {type:1,name:'view',description:'Show one applicant by Game ID',options:[
   {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
  ]},
  {type:1,name:'move',description:'Move an applicant to Ordinary, Special, or a Group',options:[
   {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},
   {type:3,name:'placement',description:'Where should this applicant go?',required:true,choices:[
    {name:'Ordinary',value:'ordinary'},
    {name:'Special',value:'special'},
    {name:'Group Transfer',value:'group'}
   ]},
   {type:3,name:'alliance',description:'Recruiting Alliance for Ordinary / Special',required:false,autocomplete:true},
   {type:3,name:'group',description:'Approved Group for Group Transfer',required:false,autocomplete:true}
  ]}
 ]},
 {name:'invite',description:'Manage Transfer invitation status',options:[
  {type:1,name:'sent',description:'Mark an applicant Invite Sent',options:[
   {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
  ]},
  {type:1,name:'pending',description:'Mark an applicant Invite Pending',options:[
   {type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}
  ]},
  {type:1,name:'list',description:'Post the current color-coded invite list'}
 ]}
]

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
function errorEmbed(cfg,title,description){return embed(cfg,{title:`⚠️ ${title}`,description,color:COLORS.warning,footer:'NEXA Transfer Bot'})}
function successEmbed(cfg,title,description,fields=[]){return embed(cfg,{title:`✅ ${title}`,description,color:COLORS.success,fields})}
function findFocused(options=[]){for(const o of options){if(o.focused)return o;if(o.options){const x=findFocused(o.options);if(x)return x}}return null}
function modalValue(body,id){for(const row of body.data?.components||[])for(const c of row.components||[])if(c.custom_id===id)return String(c.value||'').trim();return''}
function topOption(body,name){return body.data?.options?.find(x=>x.name===name)?.value}
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
function startPreviewEmbed(cfg,date){
  const iso=eventStartFromServerDate(date);if(!iso)return null;
  const d=new Date(iso);
  return embed(cfg,{
    title:'🌌 Transfer Event Start',
    description:'Confirm the Game/Server reset date before starting the automatic Transfer timeline.',
    color:COLORS.milestone,
    fields:[
      field('📅 Server / Game Day',serverDateLabel(date),true),
      field('🕛 Server Start','00:00 UTC',true),
      field('📍 Your Local Time',discordTime(d),false)
    ],
    footer:'Discord displays the local-time field in your device timezone. Tap the title to open the Workspace.'
  });
}
function startChoiceResponse(cfg){
  const e=embed(cfg,{
    title:'🌌 Choose Transfer Event Start',
    description:'Choose the **Game/Server reset date**. Transfer always starts at **00:00 UTC**.',
    color:COLORS.milestone
  });
  return responseEmbed(e,{components:[actionRow(
    customButton('Today','start_pick:today',1),
    customButton('Tomorrow','start_pick:tomorrow',1),
    customButton('Choose Date','start_pick:choose',2,'📅')
  )]});
}
function startConfirmResponse(cfg,date){
  const e=startPreviewEmbed(cfg,date);
  if(!e)return responseEmbed(errorEmbed(cfg,'Invalid Date','Use the Game/Server date in `YYYY-MM-DD` format.'));
  return responseEmbed(e,{components:[actionRow(
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
async function clearTransferStart(cfg){
  await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{event_start_at:null,last_sent:{},updated_at:nowIso()});
}
function transferEndConfirmEmbed(cfg){
  if(!cfg.event_start_at)return errorEmbed(cfg,'No Transfer Timeline Scheduled','There is no scheduled or active Transfer timeline to cancel or end.');
  const start=new Date(cfg.event_start_at),started=Date.now()>=start.getTime();
  return embed(cfg,{
    title:started?'🏁 End Transfer Event?':'🛑 Cancel Scheduled Transfer Start?',
    description:started?'This stops all future automatic Transfer announcements. Applicants, placements, invites, and the Transfer cycle are not deleted.':'This removes the scheduled start date so no automatic Transfer phase announcements will begin. Applicants and Transfer data are not deleted.',
    color:started?COLORS.warning:COLORS.muted,
    fields:[field('🌌 Scheduled Start',discordTime(start),false)],
    footer:'This action only controls the Discord Transfer timeline.'
  });
}
async function applicantByGameId(cfg,event,gameId){
  const rows=await db.select('transfer_applications',`workspace_id=eq.${cfg.workspace_id}&transfer_event_id=eq.${event.id}&player_id=eq.${encodeURIComponent(gameId)}&select=*&limit=2`);
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
      return g?{...a,
        _group_name:g.group_name||a.group_name||null,
        _group_leader:g.main_contact_ign||a.group_leader||null,
        _group_plan:g.plan||null,
        _group_destination:(g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag)||a.assigned_alliance_tag||null
      }:a;
    });
  }catch{
    return rows;
  }
}
function hmUtc(d){return`${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`}
function dayKey(d){return d.toISOString().slice(0,10)}
function inviteFields(counts,pendingOps){
  const fields=[field('🎟️ Ordinary Invites',`${counts.ordinaryLeft} available`,true)];
  if(Number(counts.specialLeft||0)>0)fields.push(field('⭐ Special Invites',`${counts.specialLeft} available`,true));
  fields.push(field('📋 Pending Operations',String(pendingOps),true));
  return fields;
}
function chunkRows(rows,size=15){
  const out=[];for(let i=0;i<rows.length;i+=size)out.push(rows.slice(i,i+size));return out;
}
function inviteIcon(a){return a.invite_status==='sent'?'✅':'⬜'}
function routeDot(a){
  if(a.application_bucket==='special')return'🟡';
  if(a.application_bucket==='ordinary')return'🟢';
  return'⚪';
}
function compactApplicantLine(a,{groupMode=false}={}){
  const name=a.in_game_name||'Applicant',id=a.player_id||'—';
  const furnace=String(a.furnace_level||'—').toUpperCase();
  const n=Number(a.current_power||0),power=!n?'—':n>=1e9?`${Math.round(n/1e7)/100}B`:n>=1e6?`${Math.round(n/1e6)}M`:fmtPower(n);
  const alliance=a.assigned_alliance_tag||a._group_destination||'—';
  return `${groupMode?routeDot(a):''}${name} · ${id} · ${furnace} · ${power} · ${alliance} · ${inviteIcon(a)}`;
}
function categoryEmbeds(cfg,rows,{title,color,groupMode=false}){
  if(!rows.length)return[];
  return chunkRows(rows,15).map((part,i)=>embed(cfg,{
    title:`${title} · ${rows.length}${rows.length>15?` · ${i+1}/${Math.ceil(rows.length/15)}`:''}`,
    description:part.map(a=>compactApplicantLine(a,{groupMode})).join('\n'),
    color,
    footer:groupMode?'🟢 Ordinary · 🟡 Special · ✅ Sent · ⬜ Pending':'✅ Sent · ⬜ Pending'
  }));
}
function compactListEmbeds(cfg,apps,placement='all'){
  const active=(apps||[]).filter(a=>a.application_cycle!=='next');
  const groups=active.filter(a=>a.group_id);
  const ordinary=active.filter(a=>!a.group_id&&a.application_bucket==='ordinary');
  const special=active.filter(a=>!a.group_id&&a.application_bucket==='special');
  const inbox=active.filter(a=>!a.group_id&&a.application_bucket==='inbox');
  if(placement==='ordinary')return categoryEmbeds(cfg,ordinary,{title:'🟢 Ordinary',color:COLORS.ordinary});
  if(placement==='special')return categoryEmbeds(cfg,special,{title:'🟡 Special',color:COLORS.special});
  if(placement==='group'||placement==='groups')return categoryEmbeds(cfg,groups,{title:'🔴 Group Transfer',color:COLORS.group,groupMode:true});
  if(placement==='inbox')return categoryEmbeds(cfg,inbox,{title:'🔵 New Applicants',color:COLORS.newApplicant});
  return [
    ...categoryEmbeds(cfg,inbox,{title:'🔵 New Applicants',color:COLORS.newApplicant}),
    ...categoryEmbeds(cfg,ordinary,{title:'🟢 Ordinary',color:COLORS.ordinary}),
    ...categoryEmbeds(cfg,special,{title:'🟡 Special',color:COLORS.special}),
    ...categoryEmbeds(cfg,groups,{title:'🔴 Group Transfer',color:COLORS.group,groupMode:true})
  ];
}
function channelOverviewEmbed(cfg,area){
  const shared='\n\nNeed help with commands? Use `/help` to see all available commands and what each one does.';
  const map={
    invites:{title:'📨 Invite Operations Overview',text:'Use this channel to manage Transfer invitations directly from Discord. Review who still needs an invite, who is pending because of the Power Cap, who has already been sent one, and update invitation status without opening NEXA.'},
    applicants:{title:'👤 Applicant Operations Overview',text:'Use this channel to review and manage Transfer applicants directly from Discord. View applicant information, check placement, and move applicants into the appropriate Transfer category without opening NEXA. Groups are a parallel view: use `/applicants list` → `Groups` to see members organized by Transfer Group. A player can remain in a Group while also being Ordinary, Special, Not Selected, or Next Transfer Cycle.'},
    new_applications:{title:'📥 New Applications Overview',text:'This channel receives automatic notifications when a new Transfer application is submitted, giving staff the key applicant information needed for a quick first review.'},
    announcements:{title:'📢 Transfer Announcements Overview',text:'This channel receives automatic Transfer Cycle updates, phase announcements, invite checks, reminders, and final warnings so staff can keep track of what still needs attention as the cycle progresses.'}
  };
  const x=map[area]||map.invites;
  return embed(cfg,{title:x.title,description:x.text+shared,color:COLORS.info,footer:'NEXA Transfer Bot · Channel Overview'});
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
      const found=await db.select('transfer_applications',`id=eq.${item.application_id}&select=id,in_game_name,player_id,current_state,current_alliance,furnace_level,current_power,discord_username,transferring_with_group,group_id,group_name,group_leader&limit=1`);
      let a=found?.[0];
      if(!a){await db.update('transfer_discord_outbox',`id=eq.${item.id}`,{status:'failed',last_error:'application_not_found'});continue}
      [a]=await hydrateGroupMeta(cfg.workspace_id,[a]);
      const g=groupLine(a);
      const e=embed(cfg,{
        title:'📥 New Transfer Application',
        description:`**${a.in_game_name||'Applicant'}** submitted a new Transfer application.`,
        color:COLORS.applicant,
        fields:[
          field('🎮 Game ID',`\`${a.player_id||'—'}\``,true),
          field('🏰 Current State',a.current_state?`State ${a.current_state}`:'—',true),
          field('🛡️ Alliance',a.current_alliance||'—',true),
          field('🔥 Furnace',a.furnace_level||'—',true),
          field('⚡ Power',fmtPower(a.current_power),true),
          field('👥 Group',g||'Individual applicant',false),
          ...(a.discord_username?[field('💬 Discord',`\`${a.discord_username}\``,false)]:[])
        ],
        timestamp:true
      });
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
async function registerGlobalCommands(){const app=env('DISCORD_APPLICATION_ID');const result=await discord(`/applications/${app}/commands`,{method:'PUT',body:commands});return{ok:true,scope:'global',commands:result.map(x=>({id:x.id,name:x.name}))}}
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
      if(id.startsWith('copy_form:')){const eventId=id.split(':')[1];return res.status(200).json(responseEmbed(embed(cfg,{title:'🔗 Transfer Form Link',description:`${formUrl(eventId)}\n\nCopy and share this link wherever you need.`,color:COLORS.info,footer:'NEXA Transfer Bot'})))}
      if(id==='start_cancel')return res.status(200).json(updateEmbed(embed(cfg,{title:'❌ Transfer Start Cancelled',description:'No changes were made to the Transfer timeline.',color:COLORS.muted,footer:'NEXA Transfer Bot'}),[]));
      if(id==='transfer_end_cancel')return res.status(200).json(updateEmbed(embed(cfg,{title:'↩️ No Changes Made',description:'The Transfer timeline was left unchanged.',color:COLORS.muted,footer:'NEXA Transfer Bot'}),[]));
      if(id==='transfer_end_confirm'){
        if(!cfg.event_start_at)return res.status(200).json(updateEmbed(errorEmbed(cfg,'No Transfer Timeline Scheduled','There is no scheduled or active Transfer timeline to cancel or end.'),[]));
        const start=new Date(cfg.event_start_at),started=Date.now()>=start.getTime();if(started){const e=embed(cfg,{title:'🌌 Transfer Event Ended',description:'This Transfer cycle has ended.',color:COLORS.milestone,footer:'Transfer cycle completed.',timestamp:true});await sendChannel(channelFor(cfg,'reminders'),{embeds:[e],allowed_mentions:{parse:[]}})}
        await clearTransferStart(cfg);const done=successEmbed(cfg,started?'Transfer Event Ended':'Scheduled Start Cancelled',started?'Future automatic Transfer announcements have been stopped. Transfer data and applicants were kept.':'The scheduled start date was removed. No automatic Transfer phase announcements will begin until a new start is scheduled.');return res.status(200).json(updateEmbed(done,workspaceOnlyComponents(cfg)));
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
        const choices=(rows||[]).filter(g=>!q||String(g.group_name||'').toLowerCase().includes(q)||String(g.destination_alliance_tag||'').toLowerCase().includes(q)||String(g.new_alliance_tag||'').toLowerCase().includes(q)).slice(0,25).map(g=>{
          const dest=g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag;
          return {name:safe(`${g.group_name||'Current Alliance'}${dest?' → '+dest:''}`),value:String(g.id)};
        });
        return res.status(200).json({type:8,data:{choices}});
      }
      return res.status(200).json({type:8,data:{choices:[]}});
    }
    if(body.type!==2)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Unsupported Interaction','NEXA could not process that interaction.')));
    const {name,options}=subcommand(body.data);

    if(body.data.name==='overview'){const area=String(topOption(body,'area')||'invites');return res.status(200).json(responseEmbed(channelOverviewEmbed(cfg,area),{ephemeral:false}))}
    if(body.data.name==='help'){
      const e=embed(cfg,{title:'🌌 NEXA Transfer Bot — Simple Operations',description:'Fast Discord tools for the jobs you need most. Full Transfer setup stays in NEXA Workspace.',color:COLORS.info,fields:[
        field('📋 Lists','`/applicants list` → All / New Applicants / Ordinary / Special / Group Transfer',false),
        field('👤 Applicant','`/applicant view` · quick details\n`/applicant move` · Ordinary / Special / Group Transfer',false),
        field('📨 Invites','`/invite sent` · mark sent\n`/invite pending` · mark pending\n`/invite list` · post the color-coded roster',false),
        field('🎨 Colors','🟢 Ordinary · 🟡 Special · 🔴 Group Transfer\nInside Group Transfer: 🟢 Ordinary route · 🟡 Special route',false)
      ],footer:'Complex setup, cycles, alliances, groups, and PDFs stay in NEXA Workspace.'});
      return res.status(200).json(responseEmbed(e,{components:workspaceOnlyComponents(cfg,'Open Transfer Workspace')}));
    }

    if(body.data.name==='transfer'){
      if(name==='start')return res.status(200).json(startChoiceResponse(cfg));
      if(name==='end'){
        if(!cfg.event_start_at)return res.status(200).json(responseEmbed(errorEmbed(cfg,'No Transfer Timeline Scheduled','There is no scheduled or active Transfer timeline to cancel or end.')));
        const e=transferEndConfirmEmbed(cfg);return res.status(200).json(responseEmbed(e,{components:[actionRow(customButton(Date.now()>=new Date(cfg.event_start_at).getTime()?'End Event':'Cancel Scheduled Start','transfer_end_confirm',4,'⚠️'),customButton('Keep Timeline','transfer_end_cancel',2))]}));
      }
      if(name==='status'){
        const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.')));
        const apps=await currentApps(cfg.workspace_id,event.id),selected=apps.filter(a=>['ordinary','special'].includes(a.application_bucket)&&a.application_cycle!=='next'),counts=inviteCounts(event,selected),state=cfg.event_start_at?phaseState(cfg.event_start_at):null,unassigned=apps.filter(a=>a.application_bucket==='inbox'&&a.application_cycle!=='next').length,sent=selected.filter(a=>a.invite_status==='sent').length,pending=selected.length-sent,times=(cfg.invite_reminder_times||[]).length?cfg.invite_reminder_times.join(', ')+' UTC':'Not set',warning=Number(cfg.phase3_reminder_minutes||0)>0?`${cfg.phase3_reminder_minutes} minutes before Open Transfer`:'Not set',timelineText=state?`Current phase: **${state.phase}**${state.next?`\nNext transition: ${discordTime(state.next)}`:''}`:'Transfer timeline: **Not scheduled**';
        const e=embed(cfg,{title:'📊 Transfer Status',description:timelineText,color:COLORS.info,fields:[field('📥 Applicant Queue',`Unassigned: **${unassigned}**`,true),field('🎟️ Invite Availability',`Ordinary: **${counts.ordinaryLeft}**\nSpecial: **${counts.specialLeft}**`,true),field('📨 Invite Operations',`Sent: **${sent}**\nPending: **${pending}**`,true),field('🔔 Reminders',`**${cfg.reminders_enabled?'On':'Off'}**\n${times}`,true),field('🚨 Final Warning',warning,true)]});return res.status(200).json(responseEmbed(e,{ephemeral:false,components:workspaceOnlyComponents(cfg)}));
      }
      if(name==='reminders'){const on=String(options.setting)==='on';await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,reminders_enabled:on,updated_at:nowIso()});const e=successEmbed(cfg,`Transfer Reminders ${on?'Enabled':'Disabled'}`,on?'Invite checks and configured warning reminders are active.':'Invite checks and configured warning reminders are paused.',[field('⚙️ Scheduling','NEXA Transfer Workspace → Integrations → Discord',false)]);return res.status(200).json(responseEmbed(e))}
      if(name==='channels'){
        const category=String(options.category),channel=String(options.channel),fieldsByCategory={applications:'applications_channel_id',applicants:'applicant_operations_channel_id',reminders:'reminders_channel_id',invites:'invites_channel_id'},labels={applications:'New Applications',applicants:'Applicant Operations',reminders:'Transfer Announcements',invites:'Invite Operations'},dbField=fieldsByCategory[category]||'invites_channel_id';await db.update('transfer_discord_integrations',`workspace_id=eq.${cfg.workspace_id}`,{enabled:true,[dbField]:channel,updated_at:nowIso()});const e=successEmbed(cfg,'Discord Channel Updated',`${labels[category]||'Invite Operations'} is now assigned to <#${channel}>.`,[field('🔌 Integration','ON',true)]);return res.status(200).json(responseEmbed(e));
      }
    }

    if(body.data.name==='applicants'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.')));
      const rawApps=await currentApps(cfg.workspace_id,event.id),apps=await hydrateGroupMeta(cfg.workspace_id,rawApps);
      if(name==='list'){
        const placement=String(options.placement||'all'),embeds=compactListEmbeds(cfg,apps,placement);
        return res.status(200).json(responseEmbeds(embeds,{ephemeral:false,components:workspaceOnlyComponents(cfg)}));
      }
    }

    if(body.data.name==='applicant'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.')));
      let a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Applicant Not Found',`No current applicant was found with Game ID \`${options.game_id}\`.`)));
      [a]=await hydrateGroupMeta(cfg.workspace_id,[a]);
      if(name==='view'){
        const g=groupLine(a),e=embed(cfg,{title:`👤 ${a.in_game_name||'Applicant'}`,description:`Game ID: \`${a.player_id||'—'}\``,color:COLORS.applicant,fields:[field('🏰 From',`State ${a.current_state||'—'}${a.current_alliance?` · ${a.current_alliance}`:''}`,false),field('🔥 Furnace',a.furnace_level||'—',true),field('⚡ Power',fmtPower(a.current_power),true),field('🪖 T12',hasT12(a)?'Yes':'No',true),field('📈 Account Progress',progressionLabel(a.account_progression),true),field('📂 Placement',placementLabel(a),true),field('🛡️ Assigned Alliance',a.assigned_alliance_tag||'Unassigned',true),...(g?[field('👥 Group',g,false)]:[]),field('📨 Invite',a.invite_status==='sent'?'Sent':a.invite_pending_reason==='over_power'?'Pending · Over Power Cap':'Not Sent Yet',false)]});return res.status(200).json(responseEmbed(e,{ephemeral:false,components:workspaceOnlyComponents(cfg)}));
      }
      if(name==='move'){
        const placement=String(options.placement||''),allianceRaw=options.alliance?String(options.alliance):'',groupRaw=options.group?String(options.group):'';
        if(placement==='group'){
          if(!groupRaw)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Choose a Group','Select an approved Group Transfer destination.')));
          const rows=await db.select('transfer_workspace_groups',`id=eq.${encodeURIComponent(groupRaw)}&workspace_id=eq.${encodeURIComponent(cfg.workspace_id)}&archived_at=is.null&status=eq.approved&select=id,group_name,plan,destination_alliance_tag,new_alliance_tag&limit=1`);
          const g=rows?.[0];if(!g)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Group Not Available','That Group is not active or approved.')));
          const dest=g.plan==='start_own'?g.new_alliance_tag:g.destination_alliance_tag;
          await db.update('transfer_applications',`id=eq.${a.id}`,{group_id:g.id,group_name:g.group_name,transferring_with_group:true,assigned_alliance_tag:dest||a.assigned_alliance_tag||null,updated_at:nowIso()});
          const e=successEmbed(cfg,'Group Assigned',`**${a.in_game_name||a.player_id}** is now in Group Transfer.`,[
            field('Current Alliance',g.group_name||'—',true),field('Destination',dest||'Not decided',true),
            field('Route',a.application_bucket==='special'?'🟡 Special':a.application_bucket==='ordinary'?'🟢 Ordinary':'⚪ Not classified',true)
          ]);
          return res.status(200).json(responseEmbed(e));
        }
        if(!['ordinary','special'].includes(placement))return res.status(200).json(responseEmbed(errorEmbed(cfg,'Placement Not Available','Choose Ordinary, Special, or Group Transfer.')));
        let alliance=a._group_destination||a.assigned_alliance_tag||null;
        if(!a.group_id&&allianceRaw){
          const valid=await validateAlliance(cfg,allianceRaw);if(!valid)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Alliance Not Available',`**${allianceRaw}** is not an active Recruiting Alliance for this Workspace.`)));
          alliance=String(valid.tag);
        }
        if(!alliance)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Alliance Required','Choose an active Recruiting Alliance before moving this applicant to Ordinary or Special.')));
        await db.update('transfer_applications',`id=eq.${a.id}`,{application_bucket:placement,application_cycle:'current',assigned_alliance_tag:alliance,updated_at:nowIso()});
        const e=successEmbed(cfg,'Applicant Updated',`**${a.in_game_name||a.player_id}** moved successfully.`,[
          field('Route',placement==='special'?'🟡 Special':'🟢 Ordinary',true),field('Alliance',alliance,true),...(a.group_id?[field('Group Transfer','🔴 Yes',true)]:[])
        ]);
        return res.status(200).json(responseEmbed(e));
      }
    }

    if(body.data.name==='invite'){
      const event=await getCurrentEvent(cfg.workspace_id);if(!event)return res.status(200).json(responseEmbed(errorEmbed(cfg,'No Active Transfer Cycle','No active Transfer cycle was found.')));
      if(name==='list'){
        const rawApps=await currentApps(cfg.workspace_id,event.id),apps=await hydrateGroupMeta(cfg.workspace_id,rawApps),embeds=compactListEmbeds(cfg,apps,'all'),target=channelFor(cfg,'invites');
        if(!target)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Invite Channel Not Configured','Assign an Invite Operations channel first in NEXA Workspace.')));
        await sendChannel(target,{embeds:embeds.slice(0,10),components:workspaceOnlyComponents(cfg),allowed_mentions:{parse:[]}});
        return res.status(200).json(responseEmbed(successEmbed(cfg,'Invite List Posted',`The color-coded invite roster was posted to <#${target}>.`)));
      }
      const a=await applicantByGameId(cfg,event,String(options.game_id||'').trim());if(!a)return res.status(200).json(responseEmbed(errorEmbed(cfg,'Applicant Not Found',`No current applicant was found with Game ID \`${options.game_id}\`.`)));
      if(!['ordinary','special'].includes(a.application_bucket)||a.application_cycle==='next')return res.status(200).json(responseEmbed(errorEmbed(cfg,'Invite Not Available',`**${a.in_game_name||a.player_id}** is not currently in Ordinary or Special for this cycle.`)));
      if(name==='sent'){await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'sent',invite_pending_reason:null,invite_sent_at:nowIso(),updated_at:nowIso()});return res.status(200).json(responseEmbed(successEmbed(cfg,'Invite Marked Sent',`Invite marked as sent to **${a.in_game_name||a.player_id}**.`)))}
      if(name==='pending'){await db.update('transfer_applications',`id=eq.${a.id}`,{invite_status:'not_sent',invite_pending_reason:null,invite_sent_at:null,updated_at:nowIso()});return res.status(200).json(responseEmbed(embed(cfg,{title:'⬜ Invite Pending',description:`**${a.in_game_name||a.player_id}** is marked Pending.`,color:COLORS.warning})))}
    }

    return res.status(200).json(responseEmbed(errorEmbed(cfg,'Command Not Recognized','NEXA did not recognize that command.')));
  }catch(e){console.error(e);return res.status(200).json({type:4,data:{content:'NEXA could not complete that command. Check the bot configuration.',flags:64}})}
}
