# NEXA 1518 v14 — Auto Time Zone

Adds automatic local time-zone detection and profile storage.

What it does:
- Detects the browser/device IANA time zone automatically.
- Saves it in Supabase `user_profiles` the first time.
- Shows the saved time zone and current UTC offset inside My Accounts.
- Lets the user change the time zone manually later.
- Keeps UTC as the official game/schedule time; local conversion will use this profile in the Schedule module.

Upload all files to the root of the GitHub repository and replace the previous versions.
