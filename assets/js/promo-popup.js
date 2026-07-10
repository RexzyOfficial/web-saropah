/**
 * promo-popup.js — Kopi Saropah
 * Baca config promo dari Supabase (read-only, public), tampilkan popup otomatis.
 * Include di semua halaman publik, SETELAH assets/js/supabase-config.js,
 * sebelum </body>.
 */

(function () {
  const SEEN_SESSION = 'saropah_promo_seen_session';
  const SEEN_DAY     = 'saropah_promo_seen_day';

  function safeUrl(url) {
    try {
      const u = new URL(url, window.location.origin);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch (e) {
      return '';
    }
  }

  function shouldShow(cfg) {
    if (!cfg || !cfg.active || !cfg.url) return false;
    if (cfg.freq === 'session') return !sessionStorage.getItem(SEEN_SESSION);
    if (cfg.freq === 'once') {
      const today = new Date().toDateString();
      return localStorage.getItem(SEEN_DAY) !== today;
    }
    return true; // 'always'
  }

  function markSeen(cfg) {
    if (cfg.freq === 'session') sessionStorage.setItem(SEEN_SESSION, '1');
    if (cfg.freq === 'once')    localStorage.setItem(SEEN_DAY, new Date().toDateString());
  }

  // Tracking sederhana: panggil RPC increment_promo_view / increment_promo_click.
  // Best-effort — kalau gagal (offline, RPC belum di-setup, dll) diamkan saja,
  // jangan sampai ganggu tampilnya popup.
  function trackEvent(kind) {
    const url = window.SAROPAH_SUPABASE_URL;
    const key = window.SAROPAH_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('YOUR-PROJECT-REF')) return;
    fetch(`${url}/rest/v1/rpc/increment_promo_${kind}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      keepalive: true,
    }).catch(() => {});
  }

  async function fetchConfig() {
    const url = window.SAROPAH_SUPABASE_URL;
    const key = window.SAROPAH_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('YOUR-PROJECT-REF')) return null; // belum di-setup

    try {
      const res = await fetch(`${url}/rest/v1/promo_config?select=*&id=eq.1`, {
        headers: { apikey: key }
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows && rows[0] ? rows[0] : null;
    } catch (e) {
      return null; // gagal fetch (offline, project belum ada, dll) -> diamkan saja
    }
  }

  function buildPopup(cfg, isLandscape) {
    trackEvent('view');

    const style = document.createElement('style');
    style.textContent = `
      #sp-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.82);
        z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        padding: 1.25rem;
        animation: sp-fade-in 0.35s ease;
      }
      @keyframes sp-fade-in { from { opacity: 0; } to { opacity: 1; } }

      #sp-box {
        position: relative;
        width: 100%;
        animation: sp-scale-in 0.35s cubic-bezier(0.4,0,0.2,1);
      }
      @keyframes sp-scale-in { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

      #sp-box.portrait  { max-width: min(360px, 88vw); }
      #sp-box.landscape { max-width: min(600px, 92vw); }

      #sp-img {
        display: block;
        width: 100%; height: auto;
        border-radius: 10px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.6);
      }
      #sp-img.sp-clickable { cursor: pointer; }

      #sp-close {
        position: absolute;
        top: -13px; right: -13px;
        width: 30px; height: 30px;
        background: #fff;
        border: none; border-radius: 50%;
        font-size: 1rem; line-height: 1;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        transition: background 0.2s, transform 0.15s;
        color: #111;
        z-index: 1;
      }
      #sp-close:hover { background: #eee; transform: scale(1.1); }

      @media (max-width: 400px) {
        #sp-box.portrait  { max-width: 92vw; }
        #sp-box.landscape { max-width: 96vw; }
        #sp-close { top: -10px; right: -10px; width: 26px; height: 26px; font-size: 0.85rem; }
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'sp-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Promo Kopi Saropah');

    const box = document.createElement('div');
    box.id = 'sp-box';
    box.className = isLandscape ? 'landscape' : 'portrait';

    const closeBtn = document.createElement('button');
    closeBtn.id = 'sp-close';
    closeBtn.innerHTML = '✕';
    closeBtn.setAttribute('aria-label', 'Tutup promo');

    const img = document.createElement('img');
    img.id  = 'sp-img';
    img.src = cfg.url;
    img.alt = 'Promo Kopi Saropah';

    const safeLink = safeUrl(cfg.link);
    if (safeLink) {
      img.classList.add('sp-clickable');
      img.setAttribute('role', 'link');
      img.setAttribute('tabindex', '0');
      img.setAttribute('aria-label', 'Buka promo Kopi Saropah');
      const isMobile   = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isShopee   = /shopee\.co\.id/i.test(safeLink);
      const goToLink = () => {
        trackEvent('click');
        markSeen(cfg);
        if (isShopee && !isMobile) {
          // Desktop/laptop can't open Shopee Food links directly —
          // send them to order.html (QR code + fallback) instead.
          window.location.href = 'order.html';
          return;
        }
        window.open(safeLink, '_blank', 'noopener,noreferrer');
      };
      img.addEventListener('click', goToLink);
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToLink(); }
      });
    }

    box.appendChild(closeBtn);
    box.appendChild(img);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function close() {
      overlay.style.animation = 'sp-fade-in 0.25s ease reverse';
      setTimeout(() => overlay.remove(), 220);
      markSeen(cfg);
    }

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    });
  }

  function showWithOrientation(cfg) {
    const probe = new Image();
    probe.onload = () => buildPopup(cfg, probe.naturalWidth >= probe.naturalHeight);
    probe.onerror = () => buildPopup(cfg, true); // fallback landscape
    probe.src = cfg.url;
  }

  async function init() {
    const cfg = await fetchConfig();
    if (!shouldShow(cfg)) return;
    const delay = cfg.delay ?? 3000;
    setTimeout(() => showWithOrientation(cfg), delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
