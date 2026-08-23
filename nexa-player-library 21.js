/* NEXA Player Library legacy compatibility shim — retired renderer
   The visual Profile owner moved to nexa-profile-owner-v29.js.
   This file remains only because index.html still references the historical filename.
*/
(()=>{
'use strict';
window.__NEXA_PLAYER_LIBRARY_LEGACY_RETIRED__=true;
// Intentionally no renderer, intervals, MutationObserver, or click interception.
// V29 owns Profile Library rendering and data writes.
})();
