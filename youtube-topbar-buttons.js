(function() {
  'use strict';

  console.log('[YouTube Topbar Create Replacer] content script loaded');

  const WATCH_LATER_URL = 'https://www.youtube.com/playlist?list=WL';
  const PLAYLISTS_URL = 'https://www.youtube.com/feed/playlists';

  function openInSameTab(url) {
    window.location.href = url;
  }

  function ensureStyles() {
    if (document.getElementById('ytp-topbar-create-replacer-style')) return;
    const style = document.createElement('style');
    style.id = 'ytp-topbar-create-replacer-style';
    style.textContent = `
      .ytp-topbar-btn { 
        display: inline-flex; 
        align-items: center; 
        justify-content: center; 
        height: 36px; 
        padding: 0 12px; 
        margin-left: 8px; 
        border-radius: 18px; 
        border: 1px solid rgba(255,255,255,0.2); 
        background: transparent; 
        color: var(--yt-spec-text-primary, #fff); 
        cursor: pointer; 
        font: 500 14px/1 Roboto, Arial, sans-serif; 
        white-space: nowrap; 
      }
      .ytp-topbar-btn:hover { 
        background: rgba(255,255,255,0.08); 
      }
      .ytp-topbar-btn:active { 
        background: rgba(255,255,255,0.12); 
      }
      .ytp-topbar-btns-wrap { 
        display: inline-flex; 
        align-items: center; 
      }
    `;
    document.head.appendChild(style);
  }

  function createPlainButton(text, ariaLabel, onClick) {
    const btn = document.createElement('button');
    btn.className = 'ytp-topbar-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', ariaLabel);
    btn.textContent = text;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  function findCreateRenderer() {
    // Try to find the Create button's renderer container reliably
    const candidates = Array.from(document.querySelectorAll('ytd-masthead #buttons ytd-button-renderer'));
    for (const renderer of candidates) {
      const btn = renderer.querySelector('button');
      const label = btn?.getAttribute('aria-label') || btn?.title || btn?.textContent?.trim();
      if (label === 'Create') return renderer;
    }
    return null;
  }

  function injectButtons() {
    ensureStyles();

    const createRenderer = findCreateRenderer();
    if (!createRenderer) return false;

    const buttonsHost = createRenderer.parentElement;
    if (!buttonsHost) return false;

    // Avoid double injection
    if (buttonsHost.querySelector('.ytp-topbar-btns-wrap')) return true;

    // Hide original create renderer but keep it in DOM to avoid layout shifts/Polymer rebuilds
    createRenderer.style.display = 'none';

    // Build our buttons
    const wrap = document.createElement('span');
    wrap.className = 'ytp-topbar-btns-wrap';

    const watchLaterBtn = createPlainButton('Watch later', 'Watch later', () => openInSameTab(WATCH_LATER_URL));
    const saveBtn = createPlainButton('Playlists', 'Playlists', () => openInSameTab(PLAYLISTS_URL));

    wrap.appendChild(watchLaterBtn);
    wrap.appendChild(saveBtn);

    // Insert our wrapper where the create button lived
    buttonsHost.insertBefore(wrap, createRenderer.nextSibling);

    return true;
  }

  function runOnce() {
    let attempts = 0;
    const maxAttempts = 25;
    const id = setInterval(() => {
      attempts++;
      if (injectButtons() || attempts >= maxAttempts) {
        clearInterval(id);
      }
    }, 200);
  }

  function observeMasthead() {
    const mastheadButtons = document.querySelector('ytd-masthead #buttons');
    if (!mastheadButtons) return;

    const observer = new MutationObserver(() => {
      injectButtons();
    });
    observer.observe(mastheadButtons, { childList: true, subtree: true });
  }

  function observeUrlChanges() {
    let last = location.href;
    const ob = new MutationObserver(() => {
      const cur = location.href;
      if (cur !== last) {
        last = cur;
        setTimeout(() => {
          injectButtons();
        }, 500);
      }
    });
    ob.observe(document, { childList: true, subtree: true });
  }

  function init() {
    if (!/^(?:https?:)?\/\/www\.youtube\.com\//.test(location.href)) return;
    runOnce();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        observeMasthead();
        injectButtons();
      });
    } else {
      observeMasthead();
      injectButtons();
    }
    observeUrlChanges();
  }

  init();
})();
