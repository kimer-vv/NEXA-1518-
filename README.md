# NEXA v27.4 — Manual End Event + UTC Auto End

Fixes the two missing lifecycle controls:

- Manual **End Event** is visible when editing a Live event in Admin → Events.
- Manual **End Event** is also available directly from View Event → Edit Event for Admin/Owner.
- Auto End is split into:
  - Auto End Date
  - Auto End Time (UTC)
- Auto End Time uses 24-hour UTC only, in 30-minute increments.
- No AM/PM picker is used for operational event times.
- Local AM/PM remains only in the public/member Schedule underneath the official UTC time.

No new SQL is required because v26 already created:
- auto_end_at
- end_svs_event()
- lifecycle/history support

Upload/replace the web files in GitHub.
