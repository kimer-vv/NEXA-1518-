
(function(){
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const isTransfer=page.startsWith('transfer');
  const isSvs=['index.html','event.html','schedule.html','prep-requests.html','history.html','history-event.html'].includes(page);
  const $=(s,r=document)=>r.querySelector(s);

  const style=document.createElement('style');
  style.textContent=`
  .nexa-help-fab{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(150,120,255,.35);background:rgba(25,18,55,.78);color:#eee;border-radius:999px;padding:8px 12px;font-weight:700;cursor:pointer}
  .nexa-info{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;border:1px solid rgba(180,150,255,.5);font-size:12px;font-weight:900;margin-left:6px;cursor:pointer;vertical-align:middle}
  .nexa-help-overlay{position:fixed;inset:0;background:rgba(5,4,16,.78);z-index:99998;display:flex;align-items:flex-end;justify-content:center;padding:14px}
  .nexa-help-overlay.hidden{display:none}
  .nexa-help-card{width:min(760px,100%);max-height:88vh;overflow:auto;background:#100d23;border:1px solid rgba(170,140,255,.35);border-radius:22px;padding:18px;box-shadow:0 20px 70px rgba(0,0,0,.5)}
  .nexa-help-head{display:flex;justify-content:space-between;gap:12px;align-items:center;position:sticky;top:-18px;background:#100d23;padding:14px 0 10px;z-index:2}
  .nexa-help-head h2{margin:0}.nexa-help-close{border:0;background:rgba(255,255,255,.08);color:#fff;width:36px;height:36px;border-radius:50%;font-size:22px}
  .nexa-help-section{border-top:1px solid rgba(255,255,255,.09);padding:12px 0}.nexa-help-section h3{margin:0 0 6px}.nexa-help-section p{margin:5px 0;color:#c9c5d8;line-height:1.45}
  .nexa-help-section b{color:#fff}.nexa-mini-flow{background:rgba(255,255,255,.05);border-radius:12px;padding:10px;margin-top:8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5}
  .nexa-help-tip{background:rgba(105,77,210,.14);border:1px solid rgba(150,120,255,.25);border-radius:12px;padding:10px;margin-top:8px;color:#d9d4f2}
  `;
  document.head.appendChild(style);

  const svsGuide=[
    ['Events',`<p><b>Create Event</b> starts a new SvS cycle. Set the opponent, Prep Monday, Castle Alliance, Presidency Alliance, notes, form status, schedule publication, Live status and automatic end time.</p><p><b>Edit Event</b> opens the same full Events editor, so changes are made in one place and reflected everywhere.</p><p><b>Delete Event</b> is destructive: event-linked Prep Requests and Ministry schedule records are removed with that event. Use History/End Event when you want to preserve a completed cycle instead of deleting it.</p><div class="nexa-mini-flow">Create → Configure → Save → Live/Upcoming Event<br>Edit → Same event, same data<br>Delete → Event + dependent event data removed</div>`],
    ['Prep Requests',`<p>Players submit their resources, preferred UTC window, specific time and optional Scheduler note. NEXA estimates Prep value and helps staff prioritize appointments.</p><p>A preferred time is a preference, not a guarantee. Staff can assign a different open time when needed.</p>`],
    ['Ministry Schedule',`<p>Use the Monday, Tuesday and Thursday schedule to place VP/MOE appointments. Staff can select an occupied appointment and then select a destination.</p><div class="nexa-mini-flow">Empty destination → Move<br>Occupied destination → Swap / Unschedule displaced player / Cancel</div><p>Unscheduling removes only the appointment. The player's Prep Request remains available for reassignment.</p>`],
    ['Recent Changes + Undo',`<p>Every Move, Swap or Unschedule creates a Change Log entry. <b>Copy Change</b> copies only that update for Discord.</p><p><b>Undo</b> is available for 30 minutes. After that, the log remains but the change must be reversed manually. If later edits make an Undo unsafe, NEXA blocks it instead of overwriting a newer appointment.</p>`],
    ['Copy Schedule',`<p>Copy the current day, the full Ministry schedule, or filter by alliance. Alliance copy is useful when leadership only needs the appointments belonging to one alliance.</p>`],
    ['Verified State Access',`<p><b>External / Unverified</b> users can see public/basic event information and forms, but not the private Ministry schedule or State Assignments.</p><p><b>Verified State Members</b> can see the private schedule, About Event, State Assignments and internal Announcements. Owner/Admin/Scheduler may Verify or Remove Verification. Only the Owner changes staff roles.</p>`],
    ['Announcements',`<p>Internal Announcements are shown only to Verified Members and staff. Acknowledge confirms that the member has read the current announcement version.</p>`]
  ];
  const transferGuide=[
    ['Transfer Events',`<p>Create one cycle and choose the State status. <b>Not Leading</b> uses 35 Ordinary invites. <b>Leading</b> uses 10. <b>Leading + Prestige Benefits</b> keeps Ordinary capacity editable until the official value is confirmed.</p><p>Special Invites are configured from 0–3 for the cycle. Special Invite Power Cap remains a separate account-power rule.</p>`],
    ['Capacity',`<p>The dashboard tracks <b>Ordinary used/capacity</b>, <b>Special used/capacity</b>, Open and Waiting List.</p><div class="nexa-mini-flow">Ordinary 35/35 → New Ordinary applicant<br>→ Swap someone / Waiting List / Cancel</div><p>NEXA should never silently create a 36th Ordinary or exceed the configured Special count.</p>`],
    ['Ordinary / Special / Open',`<p><b>Ordinary</b> and <b>Special Invite</b> consume a limited slot. <b>Open Transfer</b> only identifies a player who plans to try Open Transfer; it is not a guaranteed place and does not consume a NEXA invite slot.</p>`],
    ['Swap Applicant',`<p>When a limited category is full, choose an existing person to replace. The displaced applicant can be moved to Waiting List or returned to an unclassified review state.</p><div class="nexa-mini-flow">Lourdes → Ordinary<br>Michael → Waiting List OR Unclassified</div>`],
    ['Waiting List',`<p>Waiting List is persistent across Transfer cycles. In a new cycle, staff can move a waiting player to Ordinary, Special or Open, keep them waiting, or remove them.</p><p>If Ordinary/Special is full, capacity rules still apply. Open applicants who fail to transfer do not automatically carry forward unless staff explicitly places them on Waiting List.</p>`],
    ['Recruiting Alliances',`<p>Only alliances marked Recruiting appear in the public Transfer form. Turn recruiting off and the alliance disappears from the form without deleting the alliance from NEXA.</p>`],
    ['Manual Priority',`<p>Manual Priority is a staff override. It signals that an applicant should be considered important even when estimated power/score would normally place them lower.</p>`],
    ['Transfer Permissions + History',`<p>Transfer staff permissions control who can manage Transfer. History/Audit records important staff actions so leadership can see what changed and who made the change.</p>`],
    ['Copy Tools',`<p>Roster, Waiting List and other copy buttons create clean text ready for Discord. They do not change application status.</p>`]
  ];

  function overlay(title,sections,focus=null){
    let old=$('#nexa-help-overlay'); if(old) old.remove();
    const el=document.createElement('div'); el.id='nexa-help-overlay'; el.className='nexa-help-overlay';
    el.innerHTML=`<section class="nexa-help-card"><div class="nexa-help-head"><h2>${title}</h2><button class="nexa-help-close" aria-label="Close">×</button></div>
      ${sections.map(([h,b])=>`<article class="nexa-help-section" data-help-name="${h.toLowerCase()}"><h3>${h}</h3>${b}</article>`).join('')}
      <div class="nexa-help-tip">Tip: the guide describes what NEXA actually does. If a workflow changes in a future build, update the guide with the feature.</div>
    </section>`;
    document.body.appendChild(el);
    $('.nexa-help-close',el).onclick=()=>el.remove();
    el.onclick=e=>{if(e.target===el)el.remove()};
    if(focus){const target=[...el.querySelectorAll('[data-help-name]')].find(x=>x.dataset.helpName.includes(focus.toLowerCase())); if(target) setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'start'}),50);}
  }

  function info(topic,title){
    const b=document.createElement('button');b.type='button';b.className='nexa-info';b.textContent='ⓘ';b.title='What does this mean?';
    b.onclick=e=>{e.preventDefault();e.stopPropagation();overlay(title,isTransfer?transferGuide:svsGuide,topic)};
    return b;
  }
  function appendInfo(selector,topic,title){
    const el=$(selector); if(!el||el.dataset.helpAdded)return;el.dataset.helpAdded='1';el.appendChild(info(topic,title));
  }
  async function setup(){
    if(!window.NEXA_I18N && !window.supabase) return;
    let role='player';
    try{
      const client=window.sb||window.supabaseClient;
      if(client){const {data}=await client.rpc('current_nexa_role'); role=String(data||'player').toLowerCase();}
    }catch(e){}
    const staff=['owner','admin','scheduler'].includes(role);
    const transferStaff=['owner','admin'].includes(role);
    if(isSvs && staff){
      const host=$('.topbar')||$('.hero')||$('main');
      if(host && !$('#nexa-svs-guide')){
        const b=document.createElement('button');b.id='nexa-svs-guide';b.type='button';b.className='nexa-help-fab';b.innerHTML='? SvS Guide';b.onclick=()=>overlay('SvS / Ministry Guide',svsGuide);
        host.appendChild(b);
      }
      appendInfo('#recent-changes-panel .section-head h3','Recent Changes','SvS / Ministry Guide');
      appendInfo('.schedule-tools-head h3','Copy Schedule','SvS / Ministry Guide');
      appendInfo('#admin-events h3','Events','SvS / Ministry Guide');
      appendInfo('#admin-permissions h3','Verified State Access','SvS / Ministry Guide');
    }
    if(isTransfer && transferStaff){
      const host=$('.topbar')||$('.page-head')||$('main');
      if(host && !$('#nexa-transfer-guide')){
        const b=document.createElement('button');b.id='nexa-transfer-guide';b.type='button';b.className='nexa-help-fab';b.innerHTML='? Transfer Guide';b.onclick=()=>overlay('Transfer Guide',transferGuide);
        host.appendChild(b);
      }
      appendInfo('#tab-events .panel-head h2','Transfer Events','Transfer Guide');
      appendInfo('#tab-waiting .panel-head h2','Waiting List','Transfer Guide');
      appendInfo('#tab-alliances .panel-head h2','Recruiting Alliances','Transfer Guide');
      appendInfo('#tab-permissions .panel-head h2','Transfer Permissions','Transfer Guide');
      appendInfo('#transfer-capacity-summary','Capacity','Transfer Guide');
    }
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(setup,150));
})();
