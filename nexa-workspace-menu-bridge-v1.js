/* NEXA WORKSPACE MENU BRIDGE V1.0
   - Keeps Ministry Workspace visible in the main NEXA menu.
   - Routes Transfer Workspace through the shared Staff Workspaces login/chooser.
   - Routes Ministry Workspace directly to Ministry.
   - No MutationObserver, no polling, no touchmove preventDefault, no manual scrollLeft.
*/
(()=>{'use strict';
if(window.__NEXA_WORKSPACE_MENU_BRIDGE_V1__)return;
window.__NEXA_WORKSPACE_MENU_BRIDGE_V1__=true;

const TRANSFER_LABEL='Transfer Workspace';
const MINISTRY_LABEL='Ministry Workspace';

function textOf(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim()}
function visible(el){
  if(!el)return false;
  const cs=getComputedStyle(el);
  return cs.display!=='none'&&cs.visibility!=='hidden'&&el.getClientRects().length>0;
}
function actionable(el){return el?.closest?.('button,a,[role="button"]')||null}

function installMinistryBesideTransfer(){
  const all=[...document.querySelectorAll('button,a,[role="button"]')];
  const transfer=all.find(el=>visible(el)&&textOf(el)===TRANSFER_LABEL);
  if(!transfer)return;

  // Transfer now opens the shared workspace login/chooser.
  transfer.dataset.nexaWorkspaceBridge='transfer';

  const parent=transfer.parentElement;
  if(!parent)return;

  const existing=[...parent.children].find(el=>textOf(el)===MINISTRY_LABEL);
  if(existing){existing.dataset.nexaWorkspaceBridge='ministry';return}

  const ministry=transfer.cloneNode(true);
  ministry.removeAttribute('id');
  ministry.removeAttribute('href');
  ministry.textContent=MINISTRY_LABEL;
  ministry.dataset.nexaWorkspaceBridge='ministry';
  ministry.setAttribute('aria-label',MINISTRY_LABEL);
  parent.insertBefore(ministry,transfer.nextSibling);
}

document.addEventListener('click',e=>{
  const hit=actionable(e.target);
  if(!hit)return;

  const label=textOf(hit);

  // Existing or injected Transfer entry -> one shared login/chooser.
  if(label===TRANSFER_LABEL || hit.dataset.nexaWorkspaceBridge==='transfer'){
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href='staff-workspaces.html';
    return;
  }

  // Existing or injected Ministry entry -> Ministry directly.
  if(label===MINISTRY_LABEL || hit.dataset.nexaWorkspaceBridge==='ministry'){
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href='ministry-workspace.html';
    return;
  }

  // Menus are rendered on demand. After any menu-opening click finishes,
  // inspect the resulting visible menu once and add Ministry beside Transfer.
  requestAnimationFrame(installMinistryBesideTransfer);
},true);

document.addEventListener('DOMContentLoaded',()=>{
  requestAnimationFrame(installMinistryBesideTransfer);
});
})();
