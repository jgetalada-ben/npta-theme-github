(() => {
  const SELECTOR_PRODUCT_INFO = 'product-info[data-gallery-autoplay="true"]';

  function isTrue(val) {
    return String(val) === 'true' || String(val) === '1';
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 749px)').matches;
  }

  function getThumbButtons(root) {
    // Dawn-style thumbnails (covers most OS2 themes based on Dawn)
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

    // Fallback: clickable elements inside thumbnail list items
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

  class GalleryAutoplay {
    constructor(productInfoEl) {
      this.el = productInfoEl;
      this.sectionId = productInfoEl.getAttribute('data-section') || '';
      this.intervalMs = parseInt(productInfoEl.getAttribute('data-gallery-autoplay-interval') || '5000', 10);
      this.effect = productInfoEl.getAttribute('data-gallery-autoplay-effect') || 'slide';
      this.pauseOnHover = isTrue(productInfoEl.getAttribute('data-gallery-autoplay-pause-hover'));
      this.enableMobile = isTrue(productInfoEl.getAttribute('data-gallery-autoplay-mobile'));

      this.timer = null;
      this.resumeTimer = null;

      this.galleryRoot =
        productInfoEl.querySelector('media-gallery') ||
        productInfoEl.querySelector(`[id^="MediaGallery-"]`) ||
        productInfoEl.querySelector('.product__media-wrapper') ||
        productInfoEl;

      this.fadeTarget =
        productInfoEl.querySelector('.product__media-list') ||
        this.galleryRoot.querySelector?.('.product__media-list');

      this._boundTick = this.tick.bind(this);
      this._boundPause = this.pause.bind(this);
      this._boundResume = this.resume.bind(this);

      this._io = null;
      this._visible = true;
    }

    init() {
      // Respect mobile setting
      if (!this.enableMobile && isMobile()) return;

      // Don’t run if there’s only 0–1 thumbnails
      const btns = getThumbButtons(this.galleryRoot);
      if (!btns || btns.length <= 1) return;

      // Avoid double-init
      if (this.el.dataset.nptaGalleryAutoplayInit === '1') return;
      this.el.dataset.nptaGalleryAutoplayInit = '1';

      // Pause on hover/focus
      if (this.pauseOnHover) {
        this.galleryRoot.addEventListener('mouseenter', this._boundPause);
        this.galleryRoot.addEventListener('mouseleave', this._boundResume);
        this.galleryRoot.addEventListener('focusin', this._boundPause);
        this.galleryRoot.addEventListener('focusout', this._boundResume);
      }

      // Pause briefly on user interaction (click/touch) so it doesn’t “fight” the user
      this.galleryRoot.addEventListener(
        'pointerdown',
        () => {
          this.pause();
          this.scheduleResume(Math.max(this.intervalMs, 5000));
        },
        { passive: true }
      );

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.pause();
        else this.resume();
      });

      // Stop when out of view (good for performance)
      if ('IntersectionObserver' in window) {
        this._io = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            this._visible = !!(entry && entry.isIntersecting);
            if (!this._visible) this.pause();
            else this.resume();
          },
          { threshold: 0.15 }
        );
        this._io.observe(this.el);
      }

      // Re-scan thumbnails on DOM changes (variant changes can swap media)
      const mo = new MutationObserver(() => {
        // If media count changes, restart safely
        this.pause();
        this.resume(true);
      });
      mo.observe(this.galleryRoot, { childList: true, subtree: true });

      this.resume(true);
    }

    scheduleResume(ms) {
      clearTimeout(this.resumeTimer);
      this.resumeTimer = setTimeout(() => this.resume(), ms);
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

      const btns = getThumbButtons(this.galleryRoot);
      if (!btns || btns.length <= 1) return;

      clearInterval(this.timer);
      this.timer = setInterval(this._boundTick, Math.max(1200, this.intervalMs));
    }

    tick() {
      const buttons = getThumbButtons(this.galleryRoot);
      if (!buttons || buttons.length <= 1) return;

      const activeIdx = getActiveIndex(buttons);
      const nextIdx = (activeIdx + 1) % buttons.length;
      const nextBtn = buttons[nextIdx];
      if (!nextBtn) return;

      if (this.effect === 'fade' && this.fadeTarget) {
        this.fadeTarget.classList.add('npta-fade-out');
        // fade out → switch → fade in
        setTimeout(() => {
          nextBtn.click();
          requestAnimationFrame(() => {
            this.fadeTarget.classList.remove('npta-fade-out');
          });
        }, 180);
      } else {
        nextBtn.click();
      }
    }

    destroy() {
      this.pause();
      clearTimeout(this.resumeTimer);
      if (this._io) this._io.disconnect();
      delete this.el.dataset.nptaGalleryAutoplayInit;
    }
  }

  function initAll(root = document) {
    root.querySelectorAll(SELECTOR_PRODUCT_INFO).forEach((el) => {
      const inst = new GalleryAutoplay(el);
      inst.init();
    });
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  // Theme editor support
  document.addEventListener('shopify:section:load', (e) => initAll(e.target));
})();