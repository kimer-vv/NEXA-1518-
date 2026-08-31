/* NEXA TRANSFER HOME V1.0 — TRANSFER CENTER ACTIONS + STAFF WORKSPACE ENTRY
   - Decorates the existing V49 Transfer Center card.
   - Adds View Form + Copy Link for a published Transfer application.
   - Adds a separate Transfer Workspace home card only for authorized Transfer staff.
   - No MutationObserver. No polling. No touchmove preventDefault. No manual scrollLeft.
*/
(()=>{
'use strict';
if(window.__NEXA_TRANSFER_HOME_V1__)return;window.__NEXA_TRANSFER_HOME_V1__=true;
const SB_URL='https://dfxcxboxrkfmrnsgpyin.supabase.co',SB_KEY='sb_publishable_HTd6T3L8WuN_owZwPUjE1Q_glB9YWM-';
let client=null;
function sb(){if(window.supabaseClient?.rpc)return window.supabaseClient;if(window.sb?.rpc)return window.sb;if(!client&&window.supabase?.createClient)client=window.supabase.createClient(SB_URL,SB_KEY);return client}
function activeState(){return Number(window.NEXA_ACTIVE_STATE||localStorage.getItem('nexa_active_state_v49')||0)}
function normalize(data){if(Array.isArray(data))return data;if(Array.isArray(data?.get_transfer_center_cards))return data.get_transfer_center_cards;if(Array.isArray(data?.cards))return data.cards;if(data?.event_id)return[data];return[]}
function publicLink(row){return new URL(`transfer-form-v2.html?public=1&event=${encodeURIComponent(row.event_id)}`,location.href).href}
async function copy(text,button){try{await navigator.clipboard.writeText(text);const old=button.textContent;button.textContent='Copied ✓';setTimeout(()=>button.textContent=old,1200)}catch(_){location.href=text}}
function removeWorkspaceCard(){document.getElementById('nexa-transfer-workspace-card')?.remove()}
async function render(){
 const c=sb(),state=activeState();if(!c||!state)return;
 const transferCard=document.getElementById('nexa-v49-transfer-card');if(!transferCard)return;
 const centerHost=document.getElementById('nexa-v49-transfer-events');
 const cr=await c.rpc('get_transfer_center_cards');const cards=normalize(cr.data),row=cards.find(x=>Number(x.destination_state)===state);
 let actions=document.getElementById('nexa-transfer-center-actions');
 if(row&&centerHost){
   if(!actions){actions=document.createElement('div');actions.id='nexa-transfer-center-actions';actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px';centerHost.appendChild(actions)}
   const link=publicLink(row);
   actions.innerHTML=`<a class="btn" href="${link}" style="text-decoration:none">View Form</a><button class="btn secondary" type="button" id="nexa-transfer-copy">Copy Link</button>`;
   document.getElementById('nexa-transfer-copy').onclick=e=>copy(link,e.currentTarget);
 }else actions?.remove();
 const perm=await c.rpc('can_manage_transfers');const can=perm.data===true;
 removeWorkspaceCard();
 if(!can)return;
 const card=document.createElement('section');card.id='nexa-transfer-workspace-card';card.className=transferCard.className||'section';card.dataset.nexaTech='transfer-workspace';
 card.innerHTML=`<div style="font-size:10px;letter-spacing:.15em;font-weight:950;color:#8fefff">TRANSFER STAFF</div><h3 style="margin:7px 0">Transfer Workspace</h3><div class="muted">Manage the cycle, applicants, history and integrations for State ${state}.</div><div style="margin-top:12px"><a class="btn" href="transfer-workspace.html" style="text-decoration:none">Open Workspace</a></div>`;
 transferCard.insertAdjacentElement('afterend',card);
}
window.addEventListener('nexa:active-state-changed',render);
window.addEventListener('load',()=>{render();setTimeout(render,700)});
})();