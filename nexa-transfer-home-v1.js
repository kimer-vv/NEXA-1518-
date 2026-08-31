/* NEXA TRANSFER HOME V1.2 — CENTER ACTIONS + RELIABLE WORKSPACE MENU
   - Keeps Transfer Center member actions.
   - Resolves Transfer Workspace access before Home cards finish rendering.
   - Adds Transfer Workspace for authorized NEXA Transfer access OR an existing Transfer Staff session.
   - Re-injects the Workspace entry when the Transfers submenu is rebuilt.
   - No MutationObserver.
   - No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{'use strict';
if(window.__NEXA_TRANSFER_HOME_V12__)return;window.__NEXA_TRANSFER_HOME_V12__=true;
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co',SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';let client=null,canWorkspace=false;
function sb(){if(window.supabaseClient?.rpc)return window.supabaseClient;if(window.sb?.rpc)return window.sb;if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);return client}
function activeState(){return Number(window.NEXA_ACTIVE_STATE||localStorage.getItem('nexa_active_state_v49')||0)}
function staffToken(){return localStorage.getItem('nexa_transfer_staff_token')||sessionStorage.getItem('nexa_transfer_staff_token')||''}
function normalize(data){if(Array.isArray(data))return data;if(Array.isArray(data?.get_transfer_center_cards))return data.get_transfer_center_cards;if(Array.isArray(data?.cards))return data.cards;if(data?.event_id)return[data];return[]}
function publicLink(row){return new URL(`transfer-form-v2.html?public=1&event=${encodeURIComponent(row.event_id)}`,location.href).href}
function workspaceLink(){const st=activeState();return new URL(`transfer-workspace.html${st?`?state=${encodeURIComponent(st)}`:''}`,location.href).href}
async function copy(text,button){try{await navigator.clipboard.writeText(text);const old=button.textContent;button.textContent='Copied ✓';setTimeout(()=>button.textContent=old,1200)}catch(_){location.href=text}}
function removeWorkspaceCard(){document.getElementById('nexa-transfer-workspace-card')?.remove()}
async function permission(){const c=sb();if(!c)return false;if(staffToken())return true;try{const r=await c.rpc('can_manage_transfers');if(r.data===true)return true}catch(_){}try{const r=await c.rpc('current_nexa_role');const role=String(r.data||'').toLowerCase();if(role==='owner'||role==='admin'||role==='super_admin')return true}catch(_){}return false}
function visibleTransferCenter(){return[...document.querySelectorAll('button,a')].find(x=>x.offsetParent!==null&&x.textContent.trim()==='Transfer Center')||null}
function injectWorkspaceIntoTransfersMenu(){if(!canWorkspace)return false;const center=visibleTransferCenter();if(!center)return false;const host=center.parentElement;if(!host||host.querySelector('[data-nexa-transfer-workspace-menu]'))return true;const b=document.createElement(center.tagName.toLowerCase()==='a'?'a':'button');b.className=center.className;b.dataset.nexaTransferWorkspaceMenu='1';b.textContent='Transfer Workspace';if(b.tagName==='A')b.href=workspaceLink();else{b.type='button';b.onclick=()=>location.href=workspaceLink()}center.insertAdjacentElement('afterend',b);return true}
async function render(){const c=sb(),state=activeState();if(!c||!state)return;canWorkspace=await permission();const transferCard=document.getElementById('nexa-v49-transfer-card');if(transferCard){const centerHost=document.getElementById('nexa-v49-transfer-events');const cr=await c.rpc('get_transfer_center_cards'),cards=normalize(cr.data),row=cards.find(x=>Number(x.destination_state)===state);let actions=document.getElementById('nexa-transfer-center-actions');if(row&&centerHost){if(!actions){actions=document.createElement('div');actions.id='nexa-transfer-center-actions';actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';centerHost.appendChild(actions)}const link=publicLink(row);actions.innerHTML=`<a class="btn" href="${link}" style="text-decoration:none">View Form</a><button class="btn secondary" type="button" id="nexa-transfer-copy">Copy Link</button>`;document.getElementById('nexa-transfer-copy').onclick=e=>copy(link,e.currentTarget)}else actions?.remove();removeWorkspaceCard();if(canWorkspace){const card=document.createElement('section');card.id='nexa-transfer-workspace-card';card.className=transferCard.className||'section';card.dataset.nexaTech='transfer-workspace';card.innerHTML=`<div style="font-size:10px;letter-spacing:.15em;font-weight:950;color:#8fefff">TRANSFER STAFF</div><h3 style="margin:7px 0">Transfer Workspace</h3><div class="muted">Cycle, applicants, history, integrations and staff access for State ${state}.</div><div style="margin-top:12px"><a class="btn" href="${workspaceLink()}" style="text-decoration:none">Open Workspace</a></div>`;transferCard.insertAdjacentElement('afterend',card)}}setTimeout(injectWorkspaceIntoTransfersMenu,60)}
function scheduleMenuInjection(){setTimeout(injectWorkspaceIntoTransfersMenu,30);setTimeout(injectWorkspaceIntoTransfersMenu,120);setTimeout(injectWorkspaceIntoTransfersMenu,350)}
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;const label=t.textContent.trim();if(label==='Transfers'||label==='Transfer Application'||label==='Transfer Center'||label==='HOME')scheduleMenuInjection()},true);
window.addEventListener('nexa:active-state-changed',()=>{render();scheduleMenuInjection()});
window.addEventListener('load',()=>{render();setTimeout(render,500);setTimeout(render,1200);scheduleMenuInjection()});
})();
