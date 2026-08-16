NEXA — FINAL TEAM SHEET REDESIGN + TEAM DATA FIX
NO SQL.

This patch changes only template-builder.html.

What changed:
• Fixes Team loading for event-type case differences (e.g. TAL vs tal).
• Adds a visible empty-state message if no Teams are actually saved.
• Keeps the approved clean white four-column Team Sheet essence.
• Each Team has its own TEAM 1 / TEAM 2 / TEAM 3 / TEAM 4 header.
• Rally Leader icon appears only in the RALLY LEADERS section header, not beside every player.
• Joiner icon appears only in the JOINERS section header, not beside every player.
• Rally Leader rows show player name + assigned time.
• Yellow paw appears only on a Rally Leader who actually has a Pet window/active Pet.
• Removes “PET SCHEDULE” as a column title.
• Joiner table is JOINER | ATTACK | DEFENSE.
• No Attack/Defense icons are repeated in player rows.
• Hero cells support portrait + name automatically if future Library data provides an image URL; for current string-only data they show the hero name cleanly.
• Legend is top-right and contains only Rally Leader / Joiner / Pet Active.
• “All times in UTC” appears only once at the bottom.
• Global Formations render once for the whole sheet, not under every Team.
• Global Formations are separated into JOINER FORMATIONS and RALLY LEADER FORMATIONS.
• Formation cards are automatically labeled Main Attack / Alt Attack / Main Defense / Alt Defense.
• Removes repeated “Joiner” / “Rally Leader” wording from individual formation cards.
• Removes “OUT:” wording; ratio displays directly as e.g. 50 / 20 / 30.
• If heroes are selected in a formation, they appear; if no heroes are selected, the card stays clean with just title + ratio.
• Existing Preview Layout / Download Layout / Save Layout workflow is preserved.
• Color customization remains; the Team Sheet structure stays uniform/professional.

Future Library integration:
When Hero Library is built, image URLs can flow into the same hero cells/cards without redesigning this sheet again.
