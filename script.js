(function () {
  'use strict';

  var REPO = 'Kallamo/Kallamo';
  var RELEASES = 'https://github.com/' + REPO + '/releases/latest';

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function byId(id) { return document.getElementById(id); }

  function initHero() {
    var hero = byId('top');
    if (!hero) return;
    var mock = byId('kl-mock');
    var text = byId('kl-text');
    var cue = byId('kl-cue');
    var hbg = byId('kl-headerbg');
    var glow = byId('kl-glow');
    var raf = null;

    function apply(p, scrolled) {
      var textFade = clamp(1 - p / 0.14, 0, 1);
      var mockFade = clamp(1 - (p - 0.6) / 0.4, 0, 1);
      if (mock) {
        mock.style.transform = 'scale(' + (1 + p * 0.55).toFixed(4) + ')';
        mock.style.opacity = mockFade.toFixed(3);
      }
      if (text) {
        text.style.transform = 'scale(' + (1 + p * 0.4).toFixed(4) + ')';
        text.style.opacity = textFade.toFixed(3);
      }
      if (cue) cue.style.opacity = clamp(1 - p * 6, 0, 1).toFixed(3);
      if (hbg) hbg.style.opacity = scrolled ? '1' : '0';
      if (glow) glow.style.transform = 'translateX(-50%) scale(' + (1 + p * 0.3).toFixed(4) + ')';
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var vh = window.innerHeight;
        var top = hero.getBoundingClientRect().top;
        var dist = Math.max(1, hero.offsetHeight - vh);
        var p = Math.min(1, Math.max(0, -top / dist));
        apply(p, -top > 30);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  function initCarousel() {
    var track = byId('cs-track');
    if (!track) return;
    var count = 7;
    var index = 0;
    var timer = null;

    function go(i) {
      index = ((i % count) + count) % count;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      for (var d = 0; d < count; d++) {
        var dot = byId('cs-dot-' + d);
        if (dot) dot.classList.toggle('is-active', d === index);
      }
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 5500);
    }

    var prev = byId('cs-prev');
    var next = byId('cs-next');
    if (prev) prev.addEventListener('click', function () { go(index - 1); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1); start(); });
    for (var d = 0; d < count; d++) {
      (function (di) {
        var dot = byId('cs-dot-' + di);
        if (dot) dot.addEventListener('click', function () { go(di); start(); });
      })(d);
    }
    var root = byId('cs-root');
    if (root) {
      root.addEventListener('mouseenter', function () { clearInterval(timer); });
      root.addEventListener('mouseleave', start);
    }
    go(0);
    start();
  }

  function initMarquee() {
    var row = byId('kl-marquee-row');
    if (row) row.innerHTML = row.innerHTML + row.innerHTML;
  }

  function initCustomize() {
    var colors = [
      ['#FBCB2D', '251, 203, 45', 'assets/ws-gold.png'],
      ['#ff5f56', '255, 95, 86', 'assets/ws-ruby.png'],
      ['#3b82f6', '59, 130, 246', 'assets/ws-sapphire.png'],
      ['#10b981', '16, 185, 129', 'assets/ws-emerald.png'],
      ['#9c27b0', '156, 39, 176', 'assets/ws-amethyst.png']
    ];
    var img = byId('cl-img');
    var root = document.documentElement;

    function set(i) {
      var c = colors[i];
      root.style.setProperty('--accent', c[0]);
      root.style.setProperty('--accent-rgb', c[1]);
      if (img) img.src = c[2];
      for (var s = 0; s < colors.length; s++) {
        var btn = byId('cl-sw-' + s);
        if (!btn) continue;
        var active = s === i;
        btn.style.transform = active ? 'scale(1.14)' : 'scale(1)';
        btn.style.boxShadow = active
          ? '0 0 0 3px #040d12, 0 0 0 5px ' + colors[s][0] + ', 0 0 28px -4px ' + colors[s][0]
          : '0 0 18px -6px ' + colors[s][0];
      }
    }
    for (var s = 0; s < colors.length; s++) {
      (function (si) {
        var btn = byId('cl-sw-' + si);
        if (btn) btn.addEventListener('click', function () { set(si); });
      })(s);
    }
    set(0);
  }

  function initCommunity() {
    var GOAL = 100;
    var FALLBACK = 30;
    var countEl = byId('cm-count');
    var goalEl = byId('cm-goal');
    var fillEl = byId('cm-fill');
    var hintEl = byId('cm-hint');
    var counter = byId('cm-counter');
    var targetPct = 0;
    var shown = false;

    if (goalEl) goalEl.textContent = GOAL;

    function applyWidth() { if (fillEl && shown) fillEl.style.width = targetPct + '%'; }
    function render(n) {
      targetPct = Math.min(100, Math.round(n / GOAL * 100));
      if (countEl) countEl.textContent = n;
      if (hintEl) {
        var left = Math.max(0, GOAL - n);
        hintEl.textContent = left > 0 ? (left + ' founding spots left') : 'Founding circle complete — welcome aboard';
      }
      applyWidth();
    }
    render(FALLBACK);

    if (counter && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { shown = true; applyWidth(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(counter);
    } else {
      shown = true;
      applyWidth();
    }

    fetch('https://discord.com/api/v10/invites/CE4C9JRS9H?with_counts=true')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && typeof d.approximate_member_count === 'number') render(d.approximate_member_count); })
      .catch(function () { });
  }

  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function detectOs() {
    var s = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '').toLowerCase();
    if (s.indexOf('win') !== -1) return 'win';
    if (s.indexOf('mac') !== -1) return 'mac';
    if (s.indexOf('linux') !== -1) return 'linux';
    return null;
  }

  function initDownloadPicker() {
    var picker = document.querySelector('.dlpicker');
    if (!picker) return;
    var items = picker.querySelectorAll('.dlpicker__item');
    var iconEl = byId('dp-icon');
    var nameEl = byId('dp-name');
    var descEl = byId('dp-desc');
    var ctaEl = byId('dp-cta');
    var ctaLabel = byId('dp-cta-label');
    var warnEl = byId('dp-warn');
    var warnTextEl = byId('dp-warn-text');
    var metaEl = byId('dp-meta');

    var ICONS = {
      win: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 3.4 9.8 2v9.6H0zM11 1.85 24 0v11.4H11zM0 12.6h9.8V22L0 20.6zM11 12.6H24V24l-13-1.85z"></path></svg>',
      mac: '<img src="https://cdn.simpleicons.org/apple/FBCB2D" alt="" aria-hidden="true">',
      linux: '<img src="https://cdn.simpleicons.org/linux/FBCB2D" alt="" aria-hidden="true">'
    };
    var DATA = {
      win: {
        name: 'Windows',
        label: 'Download for Windows',
        desc: 'For Windows 10 and 11 (64-bit). Run the installer once and Kallamo keeps itself up to date.',
        meta: 'Free · open source · AGPLv3 · updates apply automatically',
        warn: ''
      },
      mac: {
        name: 'macOS',
        label: 'Download for macOS',
        desc: 'For Apple Silicon and Intel Macs. Open the disk image and drag Kallamo into Applications.',
        meta: 'Free · open source · AGPLv3',
        warn: 'Unsigned build: on first launch, right-click the app and choose Open to get past macOS Gatekeeper. Automatic updates are not available on macOS yet — check back here for new versions.'
      },
      linux: {
        name: 'Linux',
        label: 'Download for Linux',
        desc: 'Universal AppImage, or a .deb for Debian and Ubuntu. Make it executable and run.',
        meta: 'Free · open source · AGPLv3',
        warn: 'The AppImage updates itself automatically. The .deb does not — update it through your package manager or by downloading the new version here.'
      }
    };
    var links = {};
    var current = 'win';

    function select(os) {
      if (!DATA[os]) os = 'win';
      current = os;
      var d = DATA[os];
      if (iconEl) iconEl.innerHTML = ICONS[os];
      if (nameEl) nameEl.textContent = d.name;
      if (descEl) descEl.textContent = d.desc;
      if (ctaLabel) ctaLabel.textContent = d.label;
      if (metaEl) metaEl.textContent = d.meta;
      if (ctaEl) ctaEl.href = links[os] || RELEASES;
      if (warnEl) {
        if (d.warn) { if (warnTextEl) warnTextEl.textContent = d.warn; warnEl.hidden = false; }
        else { warnEl.hidden = true; }
      }
      items.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-os') === os); });
    }

    items.forEach(function (it) {
      it.addEventListener('click', function () { select(it.getAttribute('data-os')); });
    });

    select(detectOs() || 'win');

    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.assets) return;
        data.assets.forEach(function (a) {
          var n = a.name.toLowerCase();
          if (n.endsWith('.exe')) links.win = a.browser_download_url;
          else if (n.endsWith('.dmg')) links.mac = a.browser_download_url;
          else if (n.endsWith('.appimage')) links.linux = a.browser_download_url;
          else if (!links.linux && n.endsWith('.deb')) links.linux = a.browser_download_url;
        });
        if (ctaEl) ctaEl.href = links[current] || RELEASES;
      })
      .catch(function () { });
  }

  function init() {
    initHero();
    initCarousel();
    initMarquee();
    initCustomize();
    initCommunity();
    initReveal();
    initDownloadPicker();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
