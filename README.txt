Replace index.html only.

This restores index.html from the exact ZIP 8 version so the Discord login/OAuth code is back untouched.
It then adds Layout Management as a normal Admin module using static HTML only.
No MutationObserver, no global click interception, no login handler changes.

Keep your existing layout-management.html and builder files.
No SQL changes.
