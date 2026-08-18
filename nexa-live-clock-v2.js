(() => {
  'use strict';

  function mountClock() {
    if (document.getElementById('nexa-live-clock-v2')) return;

    const box = document.createElement('div');
    box.id = 'nexa-live-clock-v2';

    Object.assign(box.style, {
      position: 'absolute',
      top: '118px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '40',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '42px',
      width: 'min(360px, calc(100% - 90px))',
      alignItems: 'start',
      justifyItems: 'center',
      pointerEvents: 'none',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'center'
    });

    const makeSide = (label, valueColor) => {
      const wrap = document.createElement('div');
      Object.assign(wrap.style, {
        minWidth: '120px'
      });

      const title = document.createElement('div');
      title.textContent = label;
      Object.assign(title.style, {
        color: 'rgba(151,160,196,.72)',
        fontSize: '9px',
        fontWeight: '900',
        letterSpacing: '.22em',
        marginBottom: '3px'
      });

      const value = document.createElement('div');
      Object.assign(value.style, {
        color: valueColor,
        fontSize: '14px',
        lineHeight: '1.1',
        fontWeight: '900',
        letterSpacing: '.03em',
        textShadow: `0 0 12px ${valueColor}44`
      });

      wrap.append(title, value);
      return { wrap, value };
    };

    const utc = makeSide('UTC', '#b79cff');
    const local = makeSide('LOCAL', '#71d8ff');
    box.append(utc.wrap, local.wrap);

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

    function reposition() {
      // Keep it visually under the top NEXA header on mobile and desktop.
      const width = window.innerWidth;
      box.style.top = width <= 760 ? '112px' : '116px';
      box.style.width = width <= 760 ? 'min(320px, calc(100% - 110px))' : '360px';
      box.style.gap = width <= 760 ? '30px' : '42px';
    }

    tick();
    reposition();
    setInterval(tick, 1000);
    window.addEventListener('resize', reposition);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountClock, { once: true });
  } else {
    mountClock();
  }
})();