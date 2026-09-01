// NEXA DISCORD BOT V1.1 — GUILD COMMAND REGISTRATION
import {env,discord} from './_discord-common.js';

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

export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'GET or POST only'});
 try{
  const app=env('DISCORD_APPLICATION_ID'),guild=env('DISCORD_GUILD_ID');
  const result=await discord(`/applications/${app}/guilds/${guild}/commands`,{method:'PUT',body:commands});
  return res.status(200).json({ok:true,guild_id:guild,commands:result.map(x=>({id:x.id,name:x.name}))});
 }catch(e){
  console.error(e);
  return res.status(500).json({ok:false,error:e.message});
 }
}
