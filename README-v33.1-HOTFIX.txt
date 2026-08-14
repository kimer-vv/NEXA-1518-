NEXA v33.1 HOTFIX
Fixes v33 packaging issue where new JavaScript was accidentally inserted inside external <script src> tags.
That caused the browser to ignore those new functions, making the deployed site look unchanged.

No new SQL is required if NEXA-v33-SQL.sql already ran successfully.
Use the SAME v33 SQL if it has not been run yet.
Visible deployment marker: "NEXA v33.1" appears faintly at bottom-right on key pages.
