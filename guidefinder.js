/*!
 * guidefinder.js
 * Recommend Civic Tech Field Guide categories, issues, and communities
 * for any piece of text. Calls the public CTFG API at civictech.guide.
 *
 * Usage:
 *   GuiFinder.show(containerEl, text [, options])
 *
 * Options:
 *   limit    {number}  Max results (1–3, default 3)
 *   heading  {string}  Custom heading text
 */
(function (global) {
  'use strict';

  const API_URL = 'https://curator.civictech.guide/api/recommend';
  const DEFAULT_LIMIT = 3;
  const DEFAULT_HEADING = 'Explore related work on the Civic Tech Field Guide';

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
    );
  }

  function renderCards(container, items, heading) {
    const h = escHtml(heading || DEFAULT_HEADING);
    const cards = items.map(c => {
      const name = (c.type === 'issue' || c.type === 'community')
        ? c.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : c.name;
      return `<a class="gf-card" href="${escHtml(c.softrUrl || '#')}" target="_blank" rel="noopener noreferrer">
        <div class="gf-card-name">${escHtml(name)}</div>
        ${c.description ? `<div class="gf-card-desc">${escHtml(c.description)}</div>` : ''}
        <span class="gf-card-cta">Explore →</span>
      </a>`;
    }).join('');

    container.innerHTML = `
      <div class="gf-wrap">
        <h2 class="gf-heading">${h}</h2>
        <div class="gf-grid">${cards}</div>
      </div>`;
    container.removeAttribute('hidden');
  }

  async function fetchAndRender(container, text, options) {
    const limit = Math.max(1, Math.min(3, parseInt(options && options.limit, 10) || DEFAULT_LIMIT));
    const heading = (options && options.heading) || DEFAULT_HEADING;

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: String(text).slice(0, 5000), limit }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const payload = await res.json();
      const items = [
        ...(Array.isArray(payload.categories)  ? payload.categories  : []),
        ...(Array.isArray(payload.issues)       ? payload.issues      : []),
        ...(Array.isArray(payload.communities)  ? payload.communities : []),
      ];
      if (!items.length || payload.dailyCapReached) {
        container.setAttribute('hidden', '');
        return;
      }
      renderCards(container, items, heading);
    } catch (err) {
      container.setAttribute('hidden', '');
    }
  }

  function show(container, text, options) {
    if (!container || !text || !String(text).trim()) return;
    container.setAttribute('hidden', '');

    if (typeof IntersectionObserver === 'undefined') {
      fetchAndRender(container, text, options);
      return;
    }

    let fetched = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !fetched) {
          fetched = true;
          observer.disconnect();
          fetchAndRender(container, text, options);
        }
      }
    }, { rootMargin: '200px' });

    observer.observe(container);
  }

  global.GuiFinder = { show };
}(typeof window !== 'undefined' ? window : this));
