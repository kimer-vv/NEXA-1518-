(() => {
  'use strict';

  function mountClock() {
    if (document.getElementById('nexa-live-clock-v1')) return;

    const box = document.createElement('div');
    box.id = 'nexa-live-clock-v1';

    Object.assign(box.style, {
      position: 'fixed',
      top: 'max(8px, env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2147483000',
      display: 'flex',
      gap: '5px',
      alignItems: 'center',
      pointerEvents: 'none',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontVariantNumeric: 'tabular-nums'
    });

    const makeChip = (label, valueColor) => {
      const chip = document.createElement('div');
      Object.assign(chip.style, {
        minWidth: '78px',
        padding: '5px 7px',
        borderRadius: '11px',
        border: '1px solid rgba(131,145,214,.30)',
        background: 'rgba(5,10,27,.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 24px rgba(0,0,0,.26)',
        textAlign: 'center'
      });

      const title = document.createElement('span');
      title.textContent = label + ' ';
      Object.assign(title.style, {
        color: '#7f8bac',
        fontSize: '7px',
        fontWeight: '900',
        letterSpacing: '.12em'
      });

      const value = document.createElement('span');
      Object.assign(value.style, {
        color: valueColor,
        fontSize: '10px',
        fontWeight: '900'
      });

      chip.append(title, value);
      return { chip, value };
    };

    const utc = makeChip('UTC', '#b59cff');
    const local = makeChip('LOCAL', '#6ed8ff');

    box.append(utc.chip, local.chip);
    document.body.appendChild(box);

    function tick() {
      const now = new Date();

      utc.value.textContent = now.toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      local.value.textContent = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountClock, { once: true });
  } else {
    mountClock();
  }
})();