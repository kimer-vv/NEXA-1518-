NEXA v32.2 — Waiting List + Transfer Roster Repair

Run NEXA-v32-2-WAITLIST-ROSTER-FIX.sql first.

Fixes:
- Drops the ACTUAL live constraint name: transfer_status_check.
- Recreates it with next_transfer allowed.
- Uses UUID correctly for application IDs.
- Adds Transfer Roster and Waiting List as REAL transfer tabs using:
  - class="transfer-tab"
  - class="transfer-panel"
  - id="tab-roster"
  - id="tab-waiting"
- Transfer Roster includes only Ordinary / Special Invite / Open Transfer.
- Copy List is available.
- Waiting List is persistent and has its own Copy Waiting List action.
