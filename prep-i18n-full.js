(function(){
  function fmt(str,vars={}){let out=String(str||'');for(const [k,v] of Object.entries(vars))out=out.replaceAll('{'+k+'}',String(v));return out;}
  function lang(){return NEXA_I18N.device();}
  function t(k,v){return fmt(NEXA_I18N.t(lang(),k),v);}
  function txt(sel,key){const e=document.querySelector(sel);if(e)e.textContent=t(key);}
  function labelText(el,key){if(!el)return;const n=[...el.childNodes].find(x=>x.nodeType===3);if(n)n.nodeValue=t(key)+'\n            ';}
  window.NEXA_PREP_T=t;
  window.NEXA_APPLY_PREP_I18N=function(){
    NEXA_I18N.setDir(lang());
    txt('.topbar .back','backEvent'); txt('main > .back','backSvs'); txt('.form-hero .badge','svsPrepBadge'); txt('#prep-title','prepForm');
    txt('#access-choice h3','continueHow'); txt('#access-choice p','discordAccessInfo'); txt('#continue-discord','continueDiscord'); txt('#continue-guest','continueGuest'); txt('#guest-warning b','guestSubmission'); txt('#guest-warning p','guestWarning');
    const gi=document.querySelectorAll('#guest-identity > label'); if(gi[0])labelText(gi[0],'inGameName'); if(gi[1])labelText(gi[1],'playerId'); if(gi[2])labelText(gi[2],'alliance'); if(gi[3])labelText(gi[3],'allianceTag');
    labelText(document.querySelector('#account-selector-label'),'wosAccount');
    const sec=[...document.querySelectorAll('.prep-section')];
    const config=[['day1','constructionTitle','requestVP',['constructionQuestion','fireCrystalsQuestion','refinedQuestion','timeFrame','specificTime']],['day2','researchTitle','requestVP',['researchQuestion','shardsQuestion','timeFrame','specificTime']],['day4','trainingTitle','requestMOE',['troopsQuestion','trainingQuestion','timeFrame','specificTime']]];
    config.forEach((c,i)=>{const s=sec[i];if(!s)return; const b=s.querySelector('.badge');if(b)b.textContent=t(c[0]);const h=s.querySelector('h3');if(h)h.textContent=t(c[1]);const tog=s.querySelector('.toggle-line');if(tog){const n=[...tog.childNodes].find(x=>x.nodeType===3);if(n)n.nodeValue=' '+t(c[2]);} const labs=s.querySelectorAll('.conditional-fields label');c[3].forEach((k,j)=>labelText(labs[j],k));s.querySelectorAll('small').forEach(x=>x.textContent=t('minutesHint'));});
    if(sec[3]){const h=sec[3].querySelector('h3');if(h)h.textContent=t('t12Info');const tog=sec[3].querySelector('.toggle-line');if(tog){const n=[...tog.childNodes].find(x=>x.nodeType===3);if(n)n.nodeValue=' '+t('upgradingT12');}const labs=sec[3].querySelectorAll('.conditional-fields label');labelText(labs[0],'refinedQuestion');labelText(labs[1],'shardsQuestion');}
    document.querySelectorAll('select').forEach(sel=>{const o=sel.querySelector('option[value=""]');if(o){if(sel.id.endsWith('-time'))o.textContent=t('optionalUtc');else if(sel.id.includes('frame')||sel.id==='training-selection')o.textContent=t('select');}});
    const note=document.querySelector('label:has(#scheduler-note)');labelText(note,'schedulerNote');const ta=document.querySelector('#scheduler-note');if(ta)ta.placeholder=t('schedulerNoteExample');const submit=document.querySelector('#prep-form button[type="submit"]');if(submit)submit.textContent=t('submitPrep');
  };
  document.addEventListener('DOMContentLoaded',window.NEXA_APPLY_PREP_I18N);
})();