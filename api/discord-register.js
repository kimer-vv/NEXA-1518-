// NEXA DISCORD BOT V1 — GUILD COMMAND REGISTRATION
import {env,discord} from './_discord-common.js';

const commands=[
 {name:'transfer',description:'Manage NEXA Transfer timing and Discord settings',options:[
  {type:1,name:'start',description:'Set the real Transfer Event start in UTC/Game Time',options:[{type:3,name:'date',description:'YYYY-MM-DD',required:true},{type:3,name:'time',description:'HH:MM UTC / Game Time',required:true}]},
  {type:1,name:'reminders',description:'Configure Transfer reminder timing',options:[
   {type:4,name:'phase2_before_minutes',description:'Minutes before Invitational Transfer opens',required:false,min_value:0,max_value:1440},
   {type:3,name:'invite_times',description:'UTC times, comma-separated. Example: 06:00,12:30,18:00',required:false},
   {type:4,name:'phase3_before_minutes',description:'Minutes before Free Transfer opens',required:false,min_value:0,max_value:1440},
   {type:3,name:'special_plan',description:'How to treat the Special Invite in reminders',required:false,choices:[{name:'Use this cycle',value:'use_this_cycle'},{name:'Reserve for next cycle',value:'reserve_next_cycle'}]}
  ]},
  {type:1,name:'channels',description:'Use one Discord channel or split Transfer messages',options:[
   {type:3,name:'mode',description:'Channel layout',required:true,choices:[{name:'Single Channel',value:'single'},{name:'Split by Category',value:'split'}]},
   {type:3,name:'single_channel',description:'Channel ID used for Single Channel mode',required:false},
   {type:3,name:'applications_channel',description:'New Applications Channel ID',required:false},
   {type:3,name:'reminders_channel',description:'Transfer Reminders Channel ID',required:false},
   {type:3,name:'invites_channel',description:'Invite Operations Channel ID',required:false}
  ]}
 ]},
 {name:'invite',description:'Manage Transfer invitation status',options:[
  {type:1,name:'sent',description:'Mark an approved applicant Invite Sent',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true}]},
  {type:1,name:'pending',description:'Keep an approved applicant pending',options:[{type:3,name:'game_id',description:'Whiteout Survival Game ID',required:true},{type:3,name:'reason',description:'Why it is still pending',required:true,choices:[{name:'Not sent yet',value:'not_sent'},{name:'Over Power Cap',value:'over_power'}]}]},
  {type:1,name:'list',description:'Post Invites Sent and Still Pending'}
 ]}
];

export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'GET or POST only'});
 try{
  const app=env('DISCORD_APPLICATION_ID'),guild=env('DISCORD_GUILD_ID');
  const result=await discord(`/applications/${app}/guilds/${guild}/commands`,{method:'PUT',body:commands});
  return res.status(200).json({ok:true,guild_id:guild,commands:result.map(x=>({id:x.id,name:x.name}))});
 }catch(e){console.error(e);return res.status(500).json({ok:false,error:e.message})}
}
