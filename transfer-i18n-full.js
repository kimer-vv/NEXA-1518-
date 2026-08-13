
(function(){
  const SUPPORTED=['en','es','tr','ko','ar','pt','ru','uk','fr','it','zh','ja'];
  function norm(v){
    v=String(v||'').toLowerCase().replace('_','-');
    for(const c of SUPPORTED) if(v===c||v.startsWith(c+'-')) return c;
    return 'en';
  }
  const lang=(window.NEXA_I18N&&NEXA_I18N.device)?NEXA_I18N.device():norm(navigator.language);
  const D=(window.NEXA_TRANSFER_I18N||{})[lang]||(window.NEXA_TRANSFER_I18N||{}).en;
  window.NEXA_TRANSFER_LANG=lang;
  document.documentElement.lang=lang==='zh'?'zh-CN':lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';

  window.NEXA_TF=function(key,vars={}){
    let out=D[key]||key;
    Object.entries(vars).forEach(([k,v])=>out=out.replaceAll('{'+k+'}',String(v)));
    return out;
  };

  function textOnly(el,key){
    if(!el) return;
    const value=D[key];
    if(!value) return;
    const textNode=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE && n.nodeValue.trim());
    if(textNode) textNode.nodeValue=value;
    else el.insertBefore(document.createTextNode(value),el.firstChild);
  }
  function setOption(select,value,key){
    const o=select?.querySelector(`option[value="${value}"]`);
    if(o&&D[key]) o.textContent=D[key];
  }
  function setText(sel,key){const el=document.querySelector(sel); if(el&&D[key]) el.textContent=D[key];}
  function setHtml(sel,key){const el=document.querySelector(sel); if(el&&D[key]) el.innerHTML=D[key];}

  window.NEXA_APPLY_TRANSFER_LANGUAGE=function(){
    if(!D) return;

    setText('#event-title','title');
    setText('.transfer-welcome h2','welcome');
    setHtml('.transfer-welcome > p','intro');
    setText('details summary','major');

    const aps=document.querySelectorAll('details article p');
    if(aps[0]) aps[0].innerHTML=D.fdt;
    if(aps[1]) aps[1].innerHTML=D.tal;
    if(aps[2]) aps[2].innerHTML=D.sunfire;
    if(aps[3]) aps[3].innerHTML=D.svs;
    setHtml('.state-first-line','stateFirst');

    const ack=document.querySelector('.event-understanding');
    if(ack){
      [...ack.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
      ack.appendChild(document.createTextNode(' '+D.ack));
    }

    setText('.transfer-placement-note h3','placementTitle');
    const pp=document.querySelectorAll('.transfer-placement-note p');
    if(pp[0]) pp[0].textContent=D.placement1;
    if(pp[1]) pp[1].innerHTML=D.placement2;

    const stats=document.querySelectorAll('.transfer-stat-grid small');
    if(stats[0]) stats[0].textContent=D.destination;
    if(stats[1]) stats[1].textContent=D.ordinary;
    if(stats[2]) stats[2].textContent=D.special;

    const steps=document.querySelectorAll('.form-step');
    const stepKeys=['s1','s2','s3','s4','s5','s6','s7'];
    steps.forEach((s,i)=>{const h=s.querySelector('h2'); if(h&&D[stepKeys[i]]) h.textContent=D[stepKeys[i]];});

    textOnly(document.querySelector('label:has(#completed_by)'),'who');
    setOption(document.querySelector('#completed_by'),'self','self');
    setOption(document.querySelector('#completed_by'),'state_player','refState');
    setOption(document.querySelector('#completed_by'),'group_leader','groupLeader');
    textOnly(document.querySelector('label:has(#referred)'),'referred');
    setOption(document.querySelector('#referred'),'false','no');
    setOption(document.querySelector('#referred'),'true','yes');
    textOnly(document.querySelector('#referred_by_wrap'),'whoRef');
    const rb=document.querySelector('#referred_by'); if(rb) rb.placeholder=D.gameName;

    textOnly(document.querySelector('label:has(#in_game_name)'),'ign');
    textOnly(document.querySelector('label:has(#player_id)'),'playerId');
    textOnly(document.querySelector('label:has(#current_state)'),'currentState');
    textOnly(document.querySelector('label:has(#current_alliance)'),'currentAlliance');
    textOnly(document.querySelector('label:has(#discord_username)'),'discord');
    const opt=document.querySelector('label:has(#discord_username) .optional'); if(opt) opt.textContent=D.optional;
    const du=document.querySelector('#discord_username'); if(du) du.placeholder=D.optionalContact;

    textOnly(document.querySelector('label:has(#furnace_level)'),'furnace');
    textOnly(document.querySelector('label:has(#current_power)'),'power');
    setHtml('.power-format-help','powerHelp');
    setText('fieldset legend','advanced');
    textOnly(document.querySelector('label:has(#labyrinth_score)'),'labyrinth');
    textOnly(document.querySelector('label:has(#transfer_passes)'),'passes');
    setOption(document.querySelector('#transfer_passes'),'yes','yes');
    setOption(document.querySelector('#transfer_passes'),'no','no');
    setOption(document.querySelector('#transfer_passes'),'not_sure','notYet');
    textOnly(document.querySelector('label:has(#willing_to_reduce_power)'),'reduce');
    setOption(document.querySelector('#willing_to_reduce_power'),'yes','yes');
    setOption(document.querySelector('#willing_to_reduce_power'),'review_first','reviewFirst');
    setOption(document.querySelector('#willing_to_reduce_power'),'no','no');

    const rq=document.querySelector('.recruit-question-head b'); if(rq) rq.textContent=D.alliances;
    const rh=document.querySelector('.recruit-question-head + .field-help'); if(rh) rh.textContent=D.alliancesHelp;
    const flex=document.querySelector('label:has(#flexible_alliance)');
    if(flex){[...flex.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove()); flex.appendChild(document.createTextNode(' '+D.flexible));}
    const fs=document.querySelectorAll('.form-step')[3]?.querySelector('fieldset legend'); if(fs) fs.textContent=D.utc;
    textOnly(document.querySelector('label:has(#discord_vc)'),'vc');
    setOption(document.querySelector('#discord_vc'),'yes','yes');
    setOption(document.querySelector('#discord_vc'),'sometimes','sometimes');
    setOption(document.querySelector('#discord_vc'),'no','no');

    textOnly(document.querySelector('label:has(#transferring_with_group)'),'withGroup');
    setOption(document.querySelector('#transferring_with_group'),'false','no');
    setOption(document.querySelector('#transferring_with_group'),'true','yes');
    textOnly(document.querySelector('label:has(#group_name)'),'groupName');
    textOnly(document.querySelector('label:has(#group_size)'),'groupSize');
    textOnly(document.querySelector('label:has(#group_members_submitting)'),'others');
    [...document.querySelectorAll('#group_members_submitting option')].forEach(o=>{
      if(o.textContent.trim()==='Yes') o.textContent=D.yes;
      if(o.textContent.trim()==='No') o.textContent=D.no;
      if(o.textContent.trim()==='Some of them') o.textContent=D.some;
    });
    textOnly(document.querySelector('label:has(#transfer_without_full_group)'),'still');
    [...document.querySelectorAll('#transfer_without_full_group option')].forEach(o=>{
      if(o.textContent.trim()==='Yes') o.textContent=D.yes;
      if(o.textContent.trim()==='No') o.textContent=D.no;
      if(o.textContent.trim()==='It depends') o.textContent=D.depends;
    });

    textOnly(document.querySelector('label:has(#coordinates)'),'coords');
    const co=document.querySelector('label:has(#coordinates) .optional'); if(co) co.textContent=D.optional;
    textOnly(document.querySelector('label:has(#additional_information)'),'anything');
    const ao=document.querySelector('label:has(#additional_information) .optional'); if(ao) ao.textContent=D.optional;

    const c1=document.querySelector('label:has(#confirms_information)');
    const c2=document.querySelector('label:has(#confirms_interest_only)');
    const c3=document.querySelector('label:has(#confirms_alliance_flexibility)');
    [[c1,'confirm1'],[c2,'confirm2'],[c3,'confirm3']].forEach(([el,key])=>{
      if(!el)return; [...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove()); el.appendChild(document.createTextNode(' '+D[key]));
    });

    const cw=document.querySelector('#contact-warning');
    if(cw) cw.innerHTML=`<b>${D.noContact}</b><br>${D.noContact2}`;
    const submit=document.querySelector('#transfer-form button[type="submit"]'); if(submit) submit.textContent=D.submit;

    setText('#success-card .badge','received');
    setText('#success-card h2','receivedTitle');
    const sp=document.querySelectorAll('#success-card p');
    if(sp[0]) sp[0].textContent=D.thanks;
    if(sp[1]) sp[1].textContent=D.saveId;
    setText('#copy-id','copyId');
    setText('#back-to-home','back');
    setText('#manage-transfers-from-form','manage');
  };

  document.addEventListener('DOMContentLoaded',window.NEXA_APPLY_TRANSFER_LANGUAGE);
})();
