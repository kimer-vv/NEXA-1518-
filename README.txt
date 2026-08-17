NEXA V51.6 — SYSTEM OPERATIONS SCOPE FIX

This patch is rebuilt from the last working V51.1 index, NOT from the broken V51.5 file.

Fix:
- Keeps the existing main NEXA Supabase client untouched.
- Gives only System Operations its own isolated Supabase client.
- Fixes the error caused by System Operations trying to access a client outside its JavaScript scope.
- Restores normal Home/Admin click behavior.

UPLOAD ONLY:
index.html -> repository root (replace current index.html)

Do not change:
- /api
- middleware.ts
- package.json
- SQL
- Vercel environment variables

After the new Production deployment is Ready:
1. Confirm Admin opens normally.
2. Go to Administration > System Operations.
3. Confirm the blue client-variable error is gone.
4. DO NOT turn Maintenance Mode on until confirmed.
