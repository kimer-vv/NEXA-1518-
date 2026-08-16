NEXA — COMBINED TEAM + SvS TRUE NATIVE FIX
NO SQL.

Built from the last confirmed-good baseline:
• BBC / Team scrolling fixed
• Pet Schedule editor fixed

This combined patch adds:
1. Team Builder candidate loader fix
   • + Add Rally Leader
   • + Add Joiner
   • Reads submitted Battle Forms reliably
   • Accepts rally_lead / rally_leader
   • Uses live SvS, or newest not-ended SvS as fallback

2. SvS native secondary views
   • Schedule Setup no longer relies on the nested iframe
   • View Schedule opens as a real internal SvS view
   • History no longer relies on the nested iframe
   • View Archive opens as a real internal SvS view
   • No second NEXA header/page should appear inside SvS

Transfers are intentionally untouched in this patch.
