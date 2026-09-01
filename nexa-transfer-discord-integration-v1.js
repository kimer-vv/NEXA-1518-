// NEXA TRANSFER DISCORD INTEGRATION V1.0 — WORKSPACE CONTROL PANEL
(()=>{'use strict';
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co';
const SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
const APP_ID='1544220499943493652';
const INSTALL_URL=`https://discord.com/oauth2/authorize?client_id=${APP_ID}&permissions=84992&integration_type=0&scope=bot+applications.commands`;
const client=window.supabase?.createClient?window.supabase.createClient(SB_URL,SB_KEY):null;
let cfg=null,workspaceId='',staffToken='',channels=[];
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
#nexaDiscordPanel .nd-status{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(122,141,255,.28);border-radius:999px;background:rgba(8,12,28,.7);font-size:12px;font-weight:800}
#nexaDiscordPanel .nd-dot{width:8px;height:8px;border-radius:50%;background:#7d879f;box-shadow:0 0 12px currentColor}
#nexaDiscordPanel .nd-dot.on{background:#67e3ac}.nd-dot.warn{background:#ffc86b}
#nexaDiscordPanel .nd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
#nexaDiscordPanel .nd-box{border:1px solid rgba(130,150,255,.16);background:rgba(6,9,24,.52);border-radius:16px;padding:14px}
#nexaDiscordPanel .nd-box.full{grid-column:1/-1}
#nexaDiscordPanel .nd-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#98a6d7;font-weight:850;margin-bottom:7px}
#nexaDiscordPanel input,#nexaDiscordPanel select{width:100%;box-sizing:border-box;background:rgba(8,12,31,.84);color:#eef2ff;border:1px solid rgba(128,146,255,.24);border-radius:11px;padding:11px 12px;outline:none}
#nexaDiscordPanel input:focus,#nexaDiscordPanel select:focus{border-color:rgba(128,146,255,.55)}
#nexaDiscordPanel .nd-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#nexaDiscordPanel .nd-row>*{flex:1 1 150px}
#nexaDiscordPanel .nd-check{display:flex;gap:10px;align-items:center;margin:10px 0;color:#e8ebff;font-weight:700}
#nexaDiscordPanel .nd-check input{width:auto;accent-color:#8293ff}
#nexaDiscordPanel .nd-note{font-size:12px;color:#929bc2;line-height:1.55;margin-top:7px}
#nexaDiscordPanel .nd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
#nexaDiscordPanel .nd-btn{appearance:none;border:1px solid rgba(130,150,255,.3);border-radius:11px;background:linear-gradient(180deg,rgba(70,83,170,.55),rgba(39,48,110,.55));color:white;padding:10px 13px;font-weight:850;text-decoration:none;text-align:center;cursor:pointer}
#nexaDiscordPanel .nd-btn.secondary{background:rgba(10,14,35,.72)}
#nexaDiscordPanel .nd-btn:disabled{opacity:.45;cursor:not-allowed}
#nexaDiscordPanel .nd-times{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
#nexaDiscordPanel .nd-chip{display:inline-flex;gap:6px;align-items:center;padding:7px 9px;border:1px solid rgba(130,150,255,.22);border-radius:999px;background:rgba(18,25,60,.64);font-size:12px;font-weight:800}
#nexaDiscordPanel .nd-chip button{border:0;background:none;color:#aeb9ed;font-size:15px;padding:0;cursor:pointer}
#nexaDiscordPanel .nd-ready{margin-top:13px;border-radius:13px;padding:11px 12px;background:rgba(14,19,48,.66);border:1px solid rgba(127,145,255,.18);font-size:12px;line-height:1.6}
#nexaDiscordPanel .nd-msg{min-height:18px;margin-top:10px;font-size:12px;font-weight:750;color:#aab5e7}
@media(max-width:760px){#nexaDiscordPanel .nd-grid{grid-template-columns:1fr}#nexaDiscordPanel .nd-box.full{grid-column:auto}}
`;document.head.appendChild(s)}
function findCard(){return [...document.querySelectorAll('[data-panel="integrations"] article.card')].find(x=>/Discord Notifications/i.test(x.querySelector('h3')?.textContent||''))||byId('nexaDiscordPanel')}
function channelOptions(selected){const rows=channels.map(c=>`<option value="${esc(c.id)}" ${String(c.id)===String(selected||'')?'selected':''}>#${esc(c.name)}</option>`).join('');const fallback=selected&&!channels.some(c=>String(c.id)===String(selected))?`<option value="${esc(selected)}" selected>Saved channel · ${esc(selected)}</option>`:'';return `<option value="">Not selected</option>${fallback}${rows}`}
function dateValue(){return cfg?.event_start_at?String(cfg.event_start_at).slice(0,10):''}
function reminderList(){return Array.isArray(cfg?.invite_reminder_times)?cfg.invite_reminder_times:[]}
function localStartText(date){if(!date)return'Choose a Game/Server date to preview it.';const d=new Date(`${date}T00:00:00Z`);if(Number.isNaN(d.getTime()))return'Invalid date.';return `Server/Game: ${date} · 00:00 UTC<br>Your local time: ${esc(d.toLocaleString([], {dateStyle:'medium',timeStyle:'short'}))}`}
function readiness(){const checks=[['Discord server',!!cfg?.guild_id],['New Applications channel',!!cfg?.applications_channel_id],['Transfer Announcements channel',!!cfg?.reminders_channel_id],['Invite Operations channel',!!cfg?.invites_channel_id],['Integration enabled',cfg?.enabled===true]];const good=checks.every(x=>x[1]);return `<b>${good?'Bot Ready ✓':'Setup incomplete'}</b><br>${checks.map(([n,ok])=>`${ok?'✓':'○'} ${esc(n)}`).join(' · ')}`}
function renderTimes(){const box=byId('ndTimeChips');if(!box)return;box.innerHTML=reminderList().map(t=>`<span class="nd-chip">${esc(t)} UTC ${cfg.can_manage?`<button type="button" data-remove-time="${esc(t)}">×</button>`:''}</span>`).join('')||'<span class="nd-note">No Invite Check Times configured.</span>';box.querySelectorAll('[data-remove-time]').forEach(b=>b.onclick=()=>{cfg.invite_reminder_times=reminderList().filter(x=>x!==b.dataset.removeTime);renderTimes()})}
function render(){
  const card=findCard();if(!card)return false;card.id='nexaDiscordPanel';card.classList.add('full');
  const manage=cfg?.can_manage===true,connected=!!cfg?.guild_id&&cfg?.enabled===true;
  card.innerHTML=`
  <div class="nd-head"><div><div class="tag">DISCORD INTEGRATION</div><h3>NEXA Transfer Bot</h3><p class="muted">Connect this Workspace to a Discord server, route bot messages, and schedule Transfer announcements.</p></div><span class="nd-status"><i class="nd-dot ${connected?'on':cfg?.guild_id?'warn':''}"></i>${connected?'Connected':cfg?.guild_id?'Configured · Off':'Not Connected'}</span></div>
  <div class="nd-grid">
    <div class="nd-box full"><div class="nd-label">Discord Server</div><div class="nd-row"><input id="ndGuild" inputmode="numeric" placeholder="Discord Server ID" value="${esc(cfg?.guild_id||'')}" ${manage?'':'disabled'}><button class="nd-btn secondary" id="ndLoadChannels" type="button">Load Channels</button></div><div class="nd-note">Install NEXA in the server first. Management can change this ID later to move the Workspace to another Discord server without losing Transfer data.</div><div class="nd-actions"><a class="nd-btn" href="${INSTALL_URL}" target="_blank" rel="noopener">Install / Add Bot</a></div></div>
    <div class="nd-box"><div class="nd-label">New Applications Channel</div><select id="ndApplications" ${manage?'':'disabled'}>${channelOptions(cfg?.applications_channel_id)}</select><label class="nd-check"><input id="ndNewApps" type="checkbox" ${cfg?.new_application_notifications!==false?'checked':''} ${manage?'':'disabled'}> New Application Notifications</label></div>
    <div class="nd-box"><div class="nd-label">Transfer Announcements Channel</div><select id="ndReminders" ${manage?'':'disabled'}>${channelOptions(cfg?.reminders_channel_id)}</select><label class="nd-check"><input id="ndReminderOn" type="checkbox" ${cfg?.reminders_enabled!==false?'checked':''} ${manage?'':'disabled'}> Transfer Reminders</label></div>
    <div class="nd-box"><div class="nd-label">Invite Operations Channel</div><select id="ndInvites" ${manage?'':'disabled'}>${channelOptions(cfg?.invites_channel_id)}</select><div class="nd-note">For invite lists and Transfer invite operations.</div></div>
    <div class="nd-box"><div class="nd-label">Event Start Date</div><input id="ndStartDate" type="date" value="${esc(dateValue())}" ${manage?'':'disabled'}><div class="nd-note" id="ndLocalPreview">${localStartText(dateValue())}</div></div>
    <div class="nd-box full"><div class="nd-label">Invite Check Times · UTC / Game Time</div><div class="nd-row"><input id="ndAddTime" type="time" step="60" ${manage?'':'disabled'}><button class="nd-btn secondary" id="ndAddTimeBtn" type="button" ${manage?'':'disabled'}>Add Time</button></div><div class="nd-times" id="ndTimeChips"></div><div class="nd-note">Runs during Phase 2. If no Ordinary or Special invites remain, the availability message is skipped.</div></div>
    <div class="nd-box full"><div class="nd-label">Final Invite Warning</div><div class="nd-row"><input id="ndWarnHours" type="number" min="0" max="168" placeholder="Hours" value="${Math.floor(Number(cfg?.phase3_reminder_minutes||0)/60)}" ${manage?'':'disabled'}><input id="ndWarnMinutes" type="number" min="0" max="59" placeholder="Minutes" value="${Number(cfg?.phase3_reminder_minutes||0)%60}" ${manage?'':'disabled'}></div><div class="nd-note">Sent before Phase 3 and automatically includes remaining Ordinary / Special invites.</div></div>
  </div>
  <div class="nd-ready" id="ndReady">${readiness()}</div>
  <div class="nd-actions">${manage?'<button class="nd-btn" id="ndSave" type="button">Save Discord Integration</button>':''}<button class="nd-btn secondary" id="ndRefresh" type="button">Refresh Status</button></div><div class="nd-msg" id="ndMsg"></div>`;
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
function wire(){
  byId('ndLoadChannels')?.addEventListener('click',loadChannels);byId('ndSave')?.addEventListener('click',save);byId('ndRefresh')?.addEventListener('click',boot);
  byId('ndStartDate')?.addEventListener('change',e=>{byId('ndLocalPreview').innerHTML=localStartText(e.target.value)});
  byId('ndAddTimeBtn')?.addEventListener('click',()=>{const v=byId('ndAddTime')?.value;if(!v)return;cfg.invite_reminder_times=[...new Set([...reminderList(),v])].sort();byId('ndAddTime').value='';renderTimes()});
}
async function boot(){
  if(!client)return;workspaceId=getWorkspaceId();staffToken=tokenNow();if(!workspaceId||!staffToken)return false;
  injectStyle();try{cfg=await getConfig();render();if(cfg.guild_id)await loadChannels()}catch(e){const card=findCard();if(card){card.id='nexaDiscordPanel';card.innerHTML=`<div class="tag">DISCORD INTEGRATION</div><h3>NEXA Transfer Bot</h3><p class="muted">${esc(e.message||'Discord integration could not load.')}</p>`}}return true
}
let tries=0;const timer=setInterval(async()=>{tries++;if(await boot()||tries>40)clearInterval(timer)},250);
document.addEventListener('click',e=>{const b=e.target.closest('[data-tab="integrations"]');if(b)setTimeout(()=>{if(!byId('nexaDiscordPanel'))boot()},50)});
})();
