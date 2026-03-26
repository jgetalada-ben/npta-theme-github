(() => {
  const SELECTOR_PRODUCT_INFO = 'product-info[data-gallery-autoplay="true"]';

  function isTrue(val) {
    return String(val) === 'true' || String(val) === '1';
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 749px)').matches;
  }

  function getThumbButtons(root) {
    const selectors = [
      '.thumbnail-list button',
      'button.thumbnail',
      'button[aria-controls^="GalleryViewer"]',
      '[data-media-id] button'
    ];

    for (const sel of selectors) {
      const found = Array.from(root.querySelectorAll(sel)).filter((el) => typeof el.click === 'function');
      if (found.length) return found;
    }

    const fallback = Array.from(root.querySelectorAll('.thumbnail-list [data-media-id]'))
      .map((el) => el.querySelector('button, a'))
      .filter(Boolean);

    return fallback;
  }

  function getActiveIndex(buttons) {
    const idx = buttons.findIndex((btn) => {
      const aria = btn.getAttribute('aria-current');
      if (aria === 'true') return true;
      if (btn.classList.contains('is-active') || btn.classList.contains('active')) return true;
      const li = btn.closest('li');
      if (li && (li.classList.contains('is-active') || li.classList.contains('active'))) return true;
      return false;
    });
    return idx >= 0 ? idx : 0;
  }

  function safeClick(el) {
    // Prefer dispatchEvent over .click() to reduce focus/scroll side effects
    el.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
    );
  }

  function restoreScrollIfJumped(yBefore, xBefore) {
    // Only restore if the page jumped UP significantly
    const yAfter = window.scrollY;
    if (yAfter < yBefore - 20) {
      window.scrollTo(xBefore, yBefore);
    }
  }

  class GalleryAutoplay {
    constructor(productInfoEl) {
      this.el = productInfoEl;
      this.intervalMs = parseInt(productInfoEl.getAttribute('data-gallery-autoplay-interval') || '5000', 10);
      this.effect = productInfoEl.getAttribute('data-gallery-autoplay-effect') || 'slide';
      this.pauseOnHover = isTrue(productInfoEl.getAttribute('data-gallery-autoplay-pause-hover'));
      this.enableMobile = isTrue(productInfoEl.getAttribute('data-gallery-autoplay-mobile'));

      this.timer = null;
      this.resumeTimer = null;

      this.galleryEl =
        productInfoEl.querySelector('media-gallery') ||
        productInfoEl.querySelector(`[id^="MediaGallery-"]`) ||
        productInfoEl.querySelector('.product__media-wrapper') ||
        productInfoEl;

      // If the page is using stacked layout, autoplay tends to cause scrollIntoView jumps.
      // We’ll still allow it ONLY when gallery is visible; otherwise we pause.
      this.fadeTarget =
        productInfoEl.querySelector('.product__media-list') ||
        this.galleryEl.querySelector?.('.product__media-list');

      this._boundTick = this.tick.bind(this);
      this._io = null;
      this._visible = true;
    }

    init() {
      if (!this.enableMobile && isMobile()) return;

      const btns = getThumbButtons(this.galleryEl);
      if (!btns || btns.length <= 1) return;

      if (this.el.dataset.nptaGalleryAutoplayInit === '1') return;
      this.el.dataset.nptaGalleryAutoplayInit = '1';

      // ✅ Pause autoplay when gallery is NOT visible (prevents scroll-jump while user reads below)
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            this._visible = !!(entry && entry.isIntersecting);
            if (!this._visible) this.pause();
            else this.resume(true);
          },
          { threshold: 0.75 }
        );
        this._io.observe(this.galleryEl);
      }

      // Pause on hover/focus
      if (this.pauseOnHover) {
        this.galleryEl.addEventListener('mouseenter', () => this.pause());
        this.galleryEl.addEventListener('mouseleave', () => this.resume(true));
        this.galleryEl.addEventListener('focusin', () => this.pause());
        this.galleryEl.addEventListener('focusout', () => this.resume(true));
      }

      // Pause briefly on user interaction
      this.galleryEl.addEventListener(
        'pointerdown',
        () => {
          this.pause();
          this.scheduleResume(Math.max(this.intervalMs, 5000));
        },
        { passive: true }
      );

      // Stop when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.pause();
        else this.resume(true);
      });

      // If gallery DOM changes (variant/media updates), restart safely
      const mo = new MutationObserver(() => {
        this.pause();
        this.resume(true);
      });
      mo.observe(this.galleryEl, { childList: true, subtree: true });

      this.resume(true);
    }

    scheduleResume(ms) {
      clearTimeout(this.resumeTimer);
      this.resumeTimer = setTimeout(() => this.resume(true), ms);
    }

    pause() {
      clearInterval(this.timer);
      this.timer = null;
      if (this.fadeTarget) this.fadeTarget.classList.remove('npta-fade-out');
    }

    resume(forceRestart = false) {
      if (!forceRestart && this.timer) return;
      if (!this.enableMobile && isMobile()) return;
      if (document.hidden) return;
      if (this._io && !this._visible) return;

      const btns = getThumbButtons(this.galleryEl);
      if (!btns || btns.length <= 1) return;

      clearInterval(this.timer);
      this.timer = setInterval(this._boundTick, Math.max(1200, this.intervalMs));
    }

    tick() {
      if (this._io && !this._visible) return;

      const buttons = getThumbButtons(this.galleryEl);
      if (!buttons || buttons.length <= 1) return;

      const activeIdx = getActiveIndex(buttons);
      const nextIdx = (activeIdx + 1) % buttons.length;
      const nextBtn = buttons[nextIdx];
      if (!nextBtn) return;

      // ✅ Save scroll position before switching
      const yBefore = window.scrollY;
      const xBefore = window.scrollX;

      const doSwitch = () => {
        safeClick(nextBtn);

        // ✅ Restore scroll if theme/browser jumped the page upward
        requestAnimationFrame(() => restoreScrollIfJumped(yBefore, xBefore));
        setTimeout(() => restoreScrollIfJumped(yBefore, xBefore), 60);
        setTimeout(() => restoreScrollIfJumped(yBefore, xBefore), 180);
      };

      if (this.effect === 'fade' && this.fadeTarget) {
        this.fadeTarget.classList.add('npta-fade-out');
        setTimeout(() => {
          doSwitch();
          requestAnimationFrame(() => this.fadeTarget.classList.remove('npta-fade-out'));
        }, 650);
      } else {
        doSwitch();
      }
    }
  }

  function initAll(root = document) {
    root.querySelectorAll(SELECTOR_PRODUCT_INFO).forEach((el) => {
      const inst = new GalleryAutoplay(el);
      inst.init();
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());
  document.addEventListener('shopify:section:load', (e) => initAll(e.target));
})();