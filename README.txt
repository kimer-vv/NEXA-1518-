NEXA — PET SCHEDULE PORTAL FIX
NO SQL.

This patch is intentionally narrow:
• Keeps the now-working native BBC/Team scrolling unchanged.
• When Edit Schedule is opened, the Pet Schedule modal is moved to document.body.
• The modal is rendered above the Admin panel with a global high z-index.
• Start UTC, End UTC, Pets and Save Schedule should be visible and usable.
• Closing/saving removes the modal-open state.
• Leaving the native Event Operations workspace cleans up any portal modal.

No Transfer/SvS changes in this patch.
