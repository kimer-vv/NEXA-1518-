NEXA v31.4 — Owner/Admin Transfer Navigation Fix

No SQL required.

Screenshot diagnosis:
- View Event was still hiding Manage Transfers because it depended only on can_manage_transfers().
- Owner/Admin access is now accepted when EITHER can_manage_transfers() OR is_admin() is true.
- Removed a malformed Supabase <script> block from Transfer View Event.
- View Event now has one clean Manage Transfers button for authorized users.
- Back to Home remains visible on View Event.
- Home Apply links explicitly carry from=nexa&return=home.
- Apply opened from Home always shows Back Home.
- Direct public application links remain isolated.
