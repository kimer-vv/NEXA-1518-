/* NEXA WORKSPACE MENU BRIDGE V1.6 — DIRECT WORKSPACE HUB
   Complete replacement file.
   Converts the legacy Transfers entry to Workspace and routes it directly
   to the canonical Staff Workspace Hub. No intermediate workspace picker.
*/
(()=>{'use strict';
if(window.__NEXA_WORKSPACE_MENU_BRIDGE_V16__)return;
window.__NEXA_WORKSPACE_MENU_BRIDGE_V16__=true;

const HUB_URL='staff-workspaces.html';
const LEGACY_LABEL='Transfers';
const HUB_LABEL='Workspace';

const textOf=el=>String(el?.textContent||'').replace(/\s+/g,' ').trim();
const actionable=el=>el?.closest?.('button,a,[role="button"]')||null;

function install(){
  const nodes=[...document.querySelectorAll('button,a,[role="button"]')];
  for(const el of nodes){
    const label=textOf(el);
    if(label!==LEGACY_LABEL && label!==HUB_LABEL)continue;
    el.textContent=HUB_LABEL;
    el.dataset.nexaWorkspaceHub='1';
    if(el.tagName==='A')el.setAttribute('href',HUB_URL);
  }
}
function go(){
  location.href=HUB_URL;
}
document.addEventListener('click',e=>{
  const hit=actionable(e.target);
  if(!hit)return;
  const label=textOf(hit);
  if(hit.dataset.nexaWorkspaceHub==='1'||label===HUB_LABEL||label===LEGACY_LABEL){
    e.preventDefault();
    e.stopImmediatePropagation();
    go();
  }
},true);

install();
const observer=new MutationObserver(()=>install());
observer.observe(document.documentElement,{subtree:true,childList:true});
setTimeout(()=>{try{observer.disconnect()}catch{}},15000);
})();
