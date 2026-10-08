/* NEXA WORKSPACE MENU BRIDGE V1.9 — DIRECT HUB, SAFE MENU */
(()=>{'use strict';
if(window.__NEXA_WORKSPACE_MENU_BRIDGE_V19__)return;window.__NEXA_WORKSPACE_MENU_BRIDGE_V19__=true;
const HUB='staff-workspaces.html';
const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLowerCase();
const visible=el=>!!(el&&el.getClientRects().length&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');
function exactWorkspace(el){
 if(!el)return false;const t=norm(el.textContent).replace(/[›>→↗]+$/,'').trim();
 return t==='workspace'||t==='transfers'||el.dataset?.nexaWorkspaceHub==='1';
}
function go(e){if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.()}location.href=HUB}
function normalize(){
 for(const el of document.querySelectorAll('button,a,[role="button"],[data-menu],[data-action]')){
   const t=norm(el.textContent).replace(/[›>→↗]+$/,'').trim();
   if(t==='transfers'){el.textContent='Workspace';el.dataset.nexaWorkspaceHub='1';if(el.tagName==='A')el.href=HUB}
 }
}
function redirectVisibleLegacyWorkspace(){
 const nodes=[...document.querySelectorAll('div,section,nav,aside')].filter(visible);
 for(const el of nodes){
   const t=norm(el.textContent);
   if(t.includes('transfer workspace')&&t.includes('ministry workspace')&&t.includes('wos utilities')&&t.length<320){location.href=HUB;return true}
 }
 return false;
}
let topReset=false;
function restoreHubTop(){
 if(topReset)return;
 const control=[...document.querySelectorAll('strong,h1,h2')].find(el=>visible(el)&&norm(el.textContent)==='control hub');
 if(control){topReset=true;requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}))}
}
for(const ev of ['pointerdown','click'])document.addEventListener(ev,e=>{const hit=e.target?.closest?.('button,a,[role="button"],[data-menu],[data-action]');if(exactWorkspace(hit))go(e)},true);
function scan(){normalize();restoreHubTop();redirectVisibleLegacyWorkspace()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{scan();setTimeout(scan,300);setTimeout(scan,900)},{once:true});else scan();
new MutationObserver(()=>scan()).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
})();
