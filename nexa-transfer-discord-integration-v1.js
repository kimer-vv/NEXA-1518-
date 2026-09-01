// NEXA TRANSFER DISCORD INTEGRATION V1.1 — COMPACT PANEL / GUIDE / UTC PREVIEWS
(()=>{'use strict';
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const APP_ID='1544220499943493652';
const INSTALL_URL=`https://discord.com/oauth2/authorize?client_id=${APP_ID}&permissions=84992&integration_type=0&scope=bot+applications.commands`;
const client=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
let cfg=null,workspaceId='',staffToken='',channels=[],panelOpen=false,guideOpen=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=id=>document.getElementById(id);
const tokenNow=()=>localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||'';
function getWorkspaceId(){
  const q=new URLSearchParams(location.search),direct=q.get('workspace');
  if(direct&&/^[0-9a-f-]{36}$/i.test(direct))return direct;
  const input=byId('workspaceLink');
  if(input?.value){try{const u=new URL(input.value,location.href),id=u.searchParams.get('workspace');if(id)return id}catch{}}
  return'';
}
function injectStyle(){if(byId('nexaDiscordPanelStyle'))return;const s=document.createElement('style');s.id='nexaDiscordPanelStyle';s.textContent=`
#nexaDiscordPanel .nd-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
#nexaDiscordPanel .nd-title-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#nexaDiscordPanel .nd-status{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(122,141,255,.28);border-radius:999px;background:rgba(8,12,28,.7);font-size:12px;font-weight:800}
#nexaDiscordPanel .nd-dot{width:8px;height:8px;border-radius:50%;background:#7d879f;box-shadow:0 0 12px currentColor}
#nexaDiscordPanel .nd-dot.on{background:#67e3ac}.nd-dot.warn{background:#ffc86b}
#nexaDiscordPanel .nd-summary{margin-top:12px;padding:10px 12px;border:1px solid rgba(130,150,255,.14);border-radius:13px;background:rgba(8,12,28,.5);font-size:12px;color:#aeb9df;line-height:1.55}
#nexaDiscordPanel .nd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
#nexaDiscordPanel .nd-box{border:1px solid rgba(130,150,255,.16);background:rgba(6,9,24,.52);border-radius:16px;padding:14px}
#nexaDiscordPanel .nd-box.full{grid-column:1/-1}
#nexaDiscordPanel .nd-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#98a6d7;font-weight:850;margin-bottom:7px}
#nexaDiscordPanel .nd-mini-label{font-size:11px;color:#aeb9df;font-weight:800;margin-bottom:5px}
#nexaDiscordPanel input,#nexaDiscordPanel select{width:100%;box-sizing:border-box;background:rgba(8,12,31,.84);color:#eef2ff;border:1px solid rgba(128,146,255,.24);border-radius:11px;padding:11px 12px;outline:none}
#nexaDiscordPanel input:focus,#nexaDiscordPanel select:focus{border-color:rgba(128,146,255,.55)}
#nexaDiscordPanel .nd-row{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
#nexaDiscordPanel .nd-row>*{flex:1 1 150px}
#nexaDiscordPanel .nd-check{display:flex;gap:10px;align-items:center;margin:10px 0;color:#e8ebff;font-weight:700}
#nexaDiscordPanel .nd-check input{width:auto;accent-color:#8293ff}
#nexaDiscordPanel .nd-preview{margin-top:9px;padding:10px 11px;border:1px solid rgba(130,150,255,.14);border-radius:11px;background:rgba(11,16,39,.72);font-size:12px;color:#c1c9ef;line-height:1.6}
#nexaDiscordPanel .nd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
#nexaDiscordPanel .nd-btn{appearance:none;border:1px solid rgba(130,150,255,.3);border-radius:11px;background:linear-gradient(180deg,rgba(70,83,170,.55),rgba(39,48,110,.55));color:white;padding:10px 13px;font-weight:850;text-decoration:none;text-align:center;cursor:pointer}
#nexaDiscordPanel .nd-btn.secondary{background:rgba(10,14,35,.72)}
#nexaDiscordPanel .nd-btn.ghost{background:transparent;padding:7px 10px}
#nexaDiscordPanel .nd-btn:disabled{opacity:.45;cursor:not-allowed}
#nexaDiscordPanel .nd-times{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
#nexaDiscordPanel .nd-chip{display:inline-flex;gap:6px;align-items:center;padding:7px 9px;border:1px solid rgba(130,150,255,.22);border-radius:999px;background:rgba(18,25,60,.64);font-size:12px;font-weight:800}
#nexaDiscordPanel .nd-chip button{border:0;background:none;color:#aeb9ed;font-size:15px;padding:0;cursor:pointer}
#nexaDiscordPanel .nd-ready{margin-top:13px;border-radius:13px;padding:11px 12px;background:rgba(14,19,48,.66);border:1px solid rgba(127,145,255,.18);font-size:12px;line-height:1.6}
#nexaDiscordPanel .nd-msg{min-height:18px;margin-top:10px;font-size:12px;font-weight:750;color:#aab5e7}
#nexaDiscordPanel .nd-guide{margin-top:12px;border:1px solid rgba(130,150,255,.18);border-radius:14px;background:rgba(8,12,31,.72);padding:14px;font-size:12px;line-height:1.65;color:#c7cff0}
#nexaDiscordPanel .nd-guide ul{margin:8px 0 0;padding-left:18px}
#nexaDiscordPanel .nd-guide li{margin:7px 0}
#nexaDiscordPanel .nd-hidden{display:none!important}
@media(max-width:760px){#nexaDiscordPanel .nd-grid{grid-template-columns:1fr}#nexaDiscordPanel .nd-box.full{grid-column:auto}}
`;document.head.appendChild(s)}
function findCard(){return [...document.querySelectorAll('[data-panel="integrations"] article.card')].find(x=>/Discord Notifications/i.test(x.querySelector('h3')?.textContent||''))||byId('nexaDiscordPanel')}
function channelOptions(selected){const rows=channels.map(c=>`<option value="${esc(c.id)}" ${String(c.id)===String(selected||'')?'selected':''}>#${esc(c.name)}</option>`).join('');const fallback=selected&&!channels.some(c=>String(c.id)===String(selected))?`<option value="${esc(selected)}" selected>Saved channel · ${esc(selected)}</option>`:'';return `<option value="">Not selected</option>${fallback}${rows}`}
function dateValue(){return cfg?.event_start_at?String(cfg.event_start_at).slice(0,10):''}
function reminderList(){return Array.isArray(cfg?.invite_reminder_times)?cfg.invite_reminder_times:[]}
function fmtDateUtc(d){return d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'})}
function fmtLocal(d){return d.toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}
function localStartText(date){if(!date)return'Choose a Game/Server date to preview it.';const d=new Date(`${date}T00:00:00Z`);if(Number.isNaN(d.getTime()))return'Invalid date.';return `<b>Game/Server:</b> ${esc(fmtDateUtc(d))} · 00:00 UTC<br><b>Your local time:</b> ${esc(fmtLocal(d))}`}
function previewDateForInvites(){const date=dateValue();const d=date?new Date(`${date}T00:00:00Z`):new Date();d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()+3);return d}
function validUtcTime(v){const m=/^(\d{2}):(\d{2})$/.exec(String(v||'').trim());if(!m)return false;return Number(m[1])<=23&&Number(m[2])<=59}
function localForUtcTime(t){if(!validUtcTime(t))return'';const [h,m]=t.split(':').map(Number),d=previewDateForInvites();d.setUTCHours(h,m,0,0);return fmtLocal(d)}
function warningPreview(){const h=Math.max(0,Number(byId('ndWarnHours')?.value??Math.floor(Number(cfg?.phase3_reminder_minutes||0)/60))),m=Math.max(0,Math.min(59,Number(byId('ndWarnMinutes')?.value??Number(cfg?.phase3_reminder_minutes||0)%60))),total=h*60+m,date=dateValue();if(!date)return `<b>Warning:</b> ${h}h ${m}m before Open Transfer<br>Set an Event Start Date to preview UTC and local send time.`;const open=new Date(`${date}T00:00:00Z`);open.setUTCHours(open.getUTCHours()+120);const send=new Date(open.getTime()-total*60000);return `<b>Warning:</b> ${h}h ${m}m before Open Transfer<br><b>Game/Server send time:</b> ${esc(fmtDateUtc(send))} · ${String(send.getUTCHours()).padStart(2,'0')}:${String(send.getUTCMinutes()).padStart(2,'0')} UTC<br><b>Your local time:</b> ${esc(fmtLocal(send))}`}
function readiness(){const checks=[['Discord server',!!cfg?.guild_id],['New Applications channel',!!cfg?.applications_channel_id],['Transfer Announcements channel',!!cfg?.reminders_channel_id],['Invite Operations channel',!!cfg?.invites_channel_id],['Integration enabled',cfg?.enabled===true]];const good=checks.every(x=>x[1]);return `<b>${good?'Bot Ready ✓':'Setup incomplete'}</b><br>${checks.map(([n,ok])=>`${ok?'✓':'○'} ${esc(n)}`).join(' · ')}`}
function compactSummary(){const count=[cfg?.applications_channel_id,cfg?.reminders_channel_id,cfg?.invites_channel_id].filter(Boolean).length,start=dateValue()||'Not set';return `${cfg?.guild_id&&cfg?.enabled?'Connected':'Not Connected'} · ${count}/3 channels configured · Reminders ${cfg?.reminders_enabled!==false?'On':'Off'} · Start ${esc(start)} · 00:00 UTC`}
function guideHtml(){return `<div class="nd-guide ${guideOpen?'':'nd-hidden'}" id="ndGuideBox"><b>Discord Integration Guide</b><ul>
<li><b>Discord Server:</b> enter the Server ID where NEXA is installed. <b>Install / Add Bot</b> adds NEXA to that server.</li>
<li><b>Load Channels:</b> refreshes the channel list from the connected Discord server. It does not create or change channels.</li>
<li><b>New Applications Channel:</b> receives new Transfer application alerts.</li>
<li><b>Transfer Announcements Channel:</b> receives Transfer Start, Invitational Phase, Invite Checks, Final Warning, Open Transfer, and Event Ended announcements.</li>
<li><b>Invite Operations Channel:</b> receives invite lists and invite-operation posts.</li>
<li><b>Event Start Date:</b> use the <b>WOS Game/Server date</b> at reset. NEXA always interprets this as <b>00:00 UTC</b>. Your local calendar date can be different. The preview below the field shows both.</li>
<li><b>Invite Check Times:</b> enter times in <b>24-hour UTC / Game Time</b>, for example <b>20:50</b>. NEXA shows the local-time equivalent underneath.</li>
<li><b>Final Warning Before Open Transfer:</b> choose how long before Open Transfer you want the final warning. Example: 3 hours 0 minutes means the warning sends three hours before Open Transfer. The preview shows both UTC/Game Time and local time.</li>
<li><b>Save Discord Integration:</b> saves the complete configuration for this Workspace.</li>
</ul></div>`}
function renderTimes(){const box=byId('ndTimeChips'),preview=byId('ndTimePreview');if(!box)return;const times=reminderList();box.innerHTML=times.map(t=>`<span class="nd-chip">${esc(t)} UTC ${cfg.can_manage?`<button type="button" data-remove-time="${esc(t)}">×</button>`:''}</span>`).join('')||'<span style="font-size:12px;color:#929bc2">No Invite Check Times configured.</span>';if(preview)preview.innerHTML=times.length?times.map(t=>`<b>${esc(t)} UTC</b> → ${esc(localForUtcTime(t))}`).join('<br>'):'Add a UTC/Game Time to see the local-time preview.';box.querySelectorAll('[data-remove-time]').forEach(b=>b.onclick=()=>{cfg.invite_reminder_times=reminderList().filter(x=>x!==b.dataset.removeTime);renderTimes()})}
function render(){
  const card=findCard();if(!card)return false;card.id='nexaDiscordPanel';card.classList.add('full');
  const manage=cfg?.can_manage===true,connected=!!cfg?.guild_id&&cfg?.enabled===true;
  card.innerHTML=`
  <div class="nd-head"><div><div class="tag">DISCORD INTEGRATION</div><div class="nd-title-row"><h3 style="margin:0">NEXA Transfer Bot</h3><button class="nd-btn ghost" id="ndGuide" type="button">Guide</button></div></div><span class="nd-status"><i class="nd-dot ${connected?'on':cfg?.guild_id?'warn':''}"></i>${connected?'Connected':cfg?.guild_id?'Configured · Off':'Not Connected'}</span></div>
  <div class="nd-summary">${compactSummary()}</div>
  ${guideHtml()}
  <div class="nd-actions"><button class="nd-btn secondary" id="ndToggle" type="button">${panelOpen?'Collapse Integration ▴':'Manage Integration ▾'}</button></div>
  <div id="ndBody" class="${panelOpen?'':'nd-hidden'}">
  <div class="nd-grid">
    <div class="nd-box full"><div class="nd-label">Discord Server</div><div class="nd-row"><input id="ndGuild" inputmode="numeric" placeholder="Discord Server ID" value="${esc(cfg?.guild_id||'')}" ${manage?'':'disabled'}><button class="nd-btn secondary" id="ndLoadChannels" type="button">Load Channels</button></div><div class="nd-actions"><a class="nd-btn" href="${INSTALL_URL}" target="_blank" rel="noopener">Install / Add Bot</a></div></div>
    <div class="nd-box"><div class="nd-label">New Applications Channel</div><select id="ndApplications" ${manage?'':'disabled'}>${channelOptions(cfg?.applications_channel_id)}</select><label class="nd-check"><input id="ndNewApps" type="checkbox" ${cfg?.new_application_notifications!==false?'checked':''} ${manage?'':'disabled'}> New Application Notifications</label></div>
    <div class="nd-box"><div class="nd-label">Transfer Announcements Channel</div><select id="ndReminders" ${manage?'':'disabled'}>${channelOptions(cfg?.reminders_channel_id)}</select><label class="nd-check"><input id="ndReminderOn" type="checkbox" ${cfg?.reminders_enabled!==false?'checked':''} ${manage?'':'disabled'}> Transfer Reminders</label></div>
    <div class="nd-box"><div class="nd-label">Invite Operations Channel</div><select id="ndInvites" ${manage?'':'disabled'}>${channelOptions(cfg?.invites_channel_id)}</select></div>
    <div class="nd-box"><div class="nd-label">Event Start Date · WOS Game/Server Date</div><input id="ndStartDate" type="date" value="${esc(dateValue())}" ${manage?'':'disabled'}><div class="nd-preview" id="ndLocalPreview">${localStartText(dateValue())}</div></div>
    <div class="nd-box full"><div class="nd-label">Invite Check Times · UTC / Game Time</div><div class="nd-row"><div><div class="nd-mini-label">24h UTC Time</div><input id="ndAddTime" type="text" inputmode="numeric" maxlength="5" placeholder="20:50" ${manage?'':'disabled'}></div><button class="nd-btn secondary" id="ndAddTimeBtn" type="button" ${manage?'':'disabled'}>Add Time</button></div><div class="nd-times" id="ndTimeChips"></div><div class="nd-preview" id="ndTimePreview"></div></div>
    <div class="nd-box full"><div class="nd-label">Final Warning Before Open Transfer</div><div class="nd-row"><div><div class="nd-mini-label">Hours</div><input id="ndWarnHours" type="number" min="0" max="168" value="${Math.floor(Number(cfg?.phase3_reminder_minutes||0)/60)}" ${manage?'':'disabled'}></div><div><div class="nd-mini-label">Minutes</div><input id="ndWarnMinutes" type="number" min="0" max="59" value="${Number(cfg?.phase3_reminder_minutes||0)%60}" ${manage?'':'disabled'}></div></div><div class="nd-preview" id="ndWarnPreview">${warningPreview()}</div></div>
  </div>
  <div class="nd-ready" id="ndReady">${readiness()}</div>
  <div class="nd-actions">${manage?'<button class="nd-btn" id="ndSave" type="button">Save Discord Integration</button>':''}<button class="nd-btn secondary" id="ndRefresh" type="button">Refresh Status</button></div><div class="nd-msg" id="ndMsg"></div>
  </div>`;
  renderTimes();wire();return true;
}
function msg(t,bad=false){const el=byId('ndMsg');if(el){el.textContent=t;el.style.color=bad?'#ff9b9b':'#aab5e7'}}
async function loadChannels(){
  const guild=byId('ndGuild')?.value.trim();if(cfg?.can_manage&&guild&&guild!==cfg.guild_id){msg('Save the new Discord Server ID first, then load its channels.');return}
  if(!cfg?.guild_id){msg('Add the Discord Server ID and save the integration first.');return}
  msg('Loading Discord channels…');
  try{const r=await fetch(`/api/discord-interactions?action=workspace-channels&workspace_id=${encodeURIComponent(workspaceId)}`,{headers:{Authorization:`Bearer ${staffToken}`}});const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Could not load channels');channels=j.channels||[];if(j.guild?.name)msg(`Connected to ${j.guild.name}.`);render()}catch(e){msg(e.message||'Could not load Discord channels.',true)}
}
function collect(){const h=Math.max(0,Number(byId('ndWarnHours')?.value||0)),m=Math.max(0,Math.min(59,Number(byId('ndWarnMinutes')?.value||0)));return{enabled:!!byId('ndGuild')?.value.trim(),guild_id:byId('ndGuild')?.value.trim()||null,channel_mode:'split',single_channel_id:null,applications_channel_id:byId('ndApplications')?.value||null,reminders_channel_id:byId('ndReminders')?.value||null,invites_channel_id:byId('ndInvites')?.value||null,new_application_notifications:!!byId('ndNewApps')?.checked,reminders_enabled:!!byId('ndReminderOn')?.checked,event_start_date:byId('ndStartDate')?.value||null,phase2_reminder_minutes:60,phase3_reminder_minutes:h*60+m,invite_reminder_times:reminderList(),special_invite_plan:'use_this_cycle',report_settings:{mode:'compact',show_game_id:true,show_state:false,show_alliance:true,show_power:true,show_totals:true}}}
async function save(){msg('Saving Discord integration…');try{const {data,error}=await client.rpc('transfer_workspace_discord_save',{p_workspace_id:workspaceId,p_token:staffToken,p_config:collect()});if(error)throw error;if(!data?.ok)throw new Error(data?.error||'Could not save');cfg=data.config||await getConfig();msg('Discord integration saved ✓');render();if(cfg.guild_id)await loadChannels()}catch(e){msg(e.message||'Could not save Discord integration.',true)}}
async function getConfig(){const {data,error}=await client.rpc('transfer_workspace_discord_config',{p_workspace_id:workspaceId,p_token:staffToken});if(error)throw error;return data||{configured:false,can_manage:false}}
function refreshWarningPreview(){const el=byId('ndWarnPreview');if(el)el.innerHTML=warningPreview()}
function wire(){
  byId('ndGuide')?.addEventListener('click',()=>{guideOpen=!guideOpen;render()});
  byId('ndToggle')?.addEventListener('click',()=>{panelOpen=!panelOpen;render()});
  byId('ndLoadChannels')?.addEventListener('click',loadChannels);byId('ndSave')?.addEventListener('click',save);byId('ndRefresh')?.addEventListener('click',boot);
  byId('ndStartDate')?.addEventListener('change',e=>{byId('ndLocalPreview').innerHTML=localStartText(e.target.value);renderTimes();refreshWarningPreview()});
  byId('ndWarnHours')?.addEventListener('input',refreshWarningPreview);byId('ndWarnMinutes')?.addEventListener('input',refreshWarningPreview);
  byId('ndAddTime')?.addEventListener('input',e=>{let v=e.target.value.replace(/[^0-9:]/g,'').slice(0,5);if(v.length===2&&!v.includes(':'))v+=':';e.target.value=v});
  byId('ndAddTimeBtn')?.addEventListener('click',()=>{const v=String(byId('ndAddTime')?.value||'').trim();if(!validUtcTime(v)){msg('Use 24-hour UTC/Game Time in HH:MM format, for example 20:50.',true);return}cfg.invite_reminder_times=[...new Set([...reminderList(),v])].sort();byId('ndAddTime').value='';renderTimes();msg('Invite Check Time added. Save Discord Integration to apply it.')});
}
async function boot(){
  if(!client)return;workspaceId=getWorkspaceId();staffToken=tokenNow();if(!workspaceId||!staffToken)return false;
  injectStyle();try{cfg=await getConfig();render();if(cfg.guild_id)await loadChannels()}catch(e){const card=findCard();if(card){card.id='nexaDiscordPanel';card.innerHTML=`<div class="tag">DISCORD INTEGRATION</div><h3>NEXA Transfer Bot</h3><p class="muted">${esc(e.message||'Discord integration could not load.')}</p>`}}return true
}
let tries=0;const timer=setInterval(async()=>{tries++;if(await boot()||tries>40)clearInterval(timer)},250);
document.addEventListener('click',e=>{const b=e.target.closest('[data-tab="integrations"]');if(b)setTimeout(()=>{if(!byId('nexaDiscordPanel'))boot()},50)});
})();