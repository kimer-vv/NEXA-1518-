/* NEXA WORKSPACE MENU BRIDGE V1.3
   - Renames the native top-level "Transfers" menu entry to "Workspace".
   - Workspace opens Transfer / Ministry directly.
   - Does NOT intercept the inner "Transfer Workspace" button.
   - Scans menu entries whether hidden or visible, so the label is ready before opening.
   - No MutationObserver, polling, touchmove preventDefault or manual scrollLeft.
*/
(()=>{'use strict';
if(window.__NEXA_WORKSPACE_MENU_BRIDGE_V13__)return;
window.__NEXA_WORKSPACE_MENU_BRIDGE_V13__=true;

const LABEL_TRANSFERS='Transfers';
const LABEL_WORKSPACE='Workspace';

function textOf(el){
  return String(el?.textContent||'').replace(/\s+/g,' ').trim();
}
function actionable(el){
  return el?.closest?.('button,a,[role="button"]')||null;
}

function ensureStyle(){
  if(document.getElementById('nexa-workspace-picker-style'))return;
  const s=document.createElement('style');
  s.id='nexa-workspace-picker-style';
  s.textContent=`
    .nexa-workspace-picker{
      position:fixed;inset:0;z-index:2147483647;
      display:grid;place-items:center;padding:16px;
      background:rgba(0,2,13,.84);
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)
    }
    .nexa-workspace-picker-card{
      width:min(430px,100%);padding:18px;border-radius:23px;
      border:1px solid rgba(118,106,255,.40);
      background:linear-gradient(155deg,#0b1531,#050817);
      box-shadow:0 28px 80px rgba(0,0,0,.55);color:#fff
    }
    .nexa-workspace-picker-head{
      display:flex;align-items:flex-start;justify-content:space-between;gap:12px
    }
    .nexa-workspace-picker-head small{
      display:block;color:#9baadb;font-size:10px;letter-spacing:.15em;font-weight:950
    }
    .nexa-workspace-picker-head h3{margin:5px 0 0;font-size:1.35rem}
    .nexa-workspace-picker-close{
      width:34px;height:34px;border-radius:50%;
      border:1px solid rgba(255,255,255,.14);
      background:#0b1430;color:#fff;font-size:17px;font-weight:900
    }
    .nexa-workspace-choice{
      width:100%;margin-top:10px;padding:13px 14px;border-radius:15px;
      border:1px solid rgba(89,228,255,.28);
      background:linear-gradient(135deg,rgba(25,76,112,.72),rgba(36,30,97,.8));
      color:#fff;text-align:left;font-weight:950
    }
    .nexa-workspace-choice small{
      display:block;margin-top:4px;color:#aebbd7;font-size:10px;font-weight:700
    }
  `;
  document.head.appendChild(s);
}

function closePicker(){
  document.getElementById('nexa-workspace-picker')?.remove();
}

function openPicker(){
  ensureStyle();
  closePicker();

  const root=document.createElement('div');
  root.id='nexa-workspace-picker';
  root.className='nexa-workspace-picker';
  root.innerHTML=`<div class="nexa-workspace-picker-card">
    <div class="nexa-workspace-picker-head">
      <div>
        <small>NEXA Â· STATE OPERATIONS</small>
        <h3>Workspace</h3>
      </div>
      <button class="nexa-workspace-picker-close" type="button" aria-label="Close">X</button>
    </div>

    <button class="nexa-workspace-choice" data-go="transfer" type="button">
      Transfer Workspace
      <small>Transfer cycles, applicants, integrations and access</small>
    </button>

    <button class="nexa-workspace-choice" data-go="ministry" type="button">
      Ministry Workspace
      <small>Requests, appointment scheduling and access</small>
    </button>
  </div>`;

  root.querySelector('.nexa-workspace-picker-close').onclick=closePicker;
  root.addEventListener('click',e=>{if(e.target===root)closePicker()});
  root.querySelector('[data-go="transfer"]').onclick=()=>{location.href='transfer-workspace.html'};
  root.querySelector('[data-go="ministry"]').onclick=()=>{location.href='ministry-workspace.html'};
  document.body.appendChild(root);
}

function installWorkspaceEntry(){
  const nodes=[...document.querySelectorAll('button,a,[role="button"]')];
  for(const el of nodes){
    if(textOf(el)!==LABEL_TRANSFERS)continue;

    // Only convert the native top-level Transfers entry.
    // Never touch "Transfer Workspace".
    el.textContent=LABEL_WORKSPACE;
    el.dataset.nexaWorkspaceBridge='workspace';
    el.removeAttribute('href');
  }
}

function refreshAfterMenuAction(){
  // Menu rendering is owned by the state hub. Scan after its click handler paints.
  requestAnimationFrame(()=>requestAnimationFrame(installWorkspaceEntry));
}

document.addEventListener('click',e=>{
  const hit=actionable(e.target);
  if(!hit)return;

  const label=textOf(hit);

  if(label===LABEL_WORKSPACE || hit.dataset.nexaWorkspaceBridge==='workspace'){
    e.preventDefault();
    e.stopImmediatePropagation();
    openPicker();
    return;
  }

  // If an old cached "Transfers" entry gets clicked before relabeling,
  // treat it as Workspace immediately instead of opening the old Transfers subview.
  if(label===LABEL_TRANSFERS){
    e.preventDefault();
    e.stopImmediatePropagation();
    hit.textContent=LABEL_WORKSPACE;
    hit.dataset.nexaWorkspaceBridge='workspace';
    hit.removeAttribute('href');
    openPicker();
    return;
  }

  refreshAfterMenuAction();
},true);

document.addEventListener('DOMContentLoaded',()=>{
  installWorkspaceEntry();
  refreshAfterMenuAction();
});

window.addEventListener('pageshow',()=>{
  installWorkspaceEntry();
});
})();
