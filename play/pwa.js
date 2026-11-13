// Web-only glue: service worker, resume after returning from checkout, and the
// iOS "add to home screen" hint. Not part of the Android app.
(function () {
  'use strict';

  // The build stamp on this script says which app version this page is.
  // Captured now: document.currentScript is null once any promise resolves.
  var MY_VERSION = (function () {
    var src = (document.currentScript && document.currentScript.src) || '';
    var m = /[?&]v=gamenight-(\d+)/.exec(src);
    return m ? m[1] : '';
  })();

  if ('serviceWorker' in navigator) {
    // If a newer worker takes over this page after it started, the scripts in
    // memory may belong to the previous build. Reload once so the whole app
    // comes from one version. Only when a worker was already in charge: a first
    // visit is fine as it is.
    var HAD_WORKER = !!navigator.serviceWorker.controller;
    if (HAD_WORKER) {
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        var KEY = 'gn_sw_reload_' + MY_VERSION;
        try {
          if (sessionStorage.getItem(KEY) === '1') return;
          sessionStorage.setItem(KEY, '1');
        } catch (e) { return; }
        location.reload();
      });
    }

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './', updateViaCache: 'none' }).then(function (reg) {
        // Browsers only re-check sw.js about once a day on their own, so a new
        // build could sit unseen. Ask every time the app opens.
        reg.update().catch(function () {});
        return navigator.serviceWorker.ready;
      }).then(function (reg) {
        startWarm(reg);
      }).catch(function () {});
    });
  }

  // The core app is cached by the service worker on install. The photos and
  // music are too big for that, so the page downloads them into the same
  // cache after the first load. The service worker would be suspended halfway
  // through; the page keeps going as long as the game is open.
  function startWarm(reg) {
    if (!window.caches) return;

    var warmed = {};
    var remaining = 20;
    var running = false;

    // A worker from an older build can answer first; its cache is about to be
    // thrown away, so do not spend 10 MB filling it.
    navigator.serviceWorker.addEventListener('message', function (e) {
      var plan = e.data;
      if (!plan || plan.type !== 'warm-plan') return;
      var m = /gamenight-(\d+)-/.exec(plan.runtimeCache || '');
      var planVersion = m ? m[1] : '';
      if (MY_VERSION && planVersion && planVersion < MY_VERSION) return;
      if (warmed[plan.runtimeCache]) return;
      warmed[plan.runtimeCache] = true;
      runWarm(plan);
    });

    function ask() {
      var worker = reg.active || reg.waiting || reg.installing;
      if (!worker) return;
      try { worker.postMessage({ type: 'warm-plan' }); } catch (err) {}
    }

    // Keep asking for a while: the first worker to answer may be an old version
    // that is about to be replaced by an update, and its cache then disappears.
    function tick() {
      if (remaining-- <= 0) { running = false; return; }
      ask();
      setTimeout(tick, 4000);
    }
    function start() {
      if (running) return;
      running = true;
      remaining = 20;
      tick();
    }

    start();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') start();
    });
  }

  function runWarm(plan) {
    // Fill the core cache too: browsers can evict it under storage pressure
    // without reinstalling the worker, which would leave the app unable to
    // start offline. Cached files are skipped, so this costs nothing normally.
    fill(plan.coreCache, plan.core);
    fill(plan.runtimeCache, plan.warm);
  }

  function fill(cacheName, list) {
    if (!cacheName || !list || !list.length) return;

    var queue = list.slice();
    var WORKERS = 4;

    for (var w = 0; w < WORKERS; w++) work();

    async function work() {
      var cache = await caches.open(cacheName);
      while (queue.length) {
        var url = queue.shift();
        try {
          if (await cache.match(url)) continue;
          var res = await fetch(url, { cache: 'reload' });
          if (res && res.ok) await cache.put(url, res);
        } catch (err) { /* offline or flaky: the next visit finishes it */ }
      }
    }
  }

  // Payments open in another tab/page. When the player comes back, re-check any
  // purchase that was left pending — same recovery the Android app does on resume.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (typeof window.resumePendingPurchases === 'function' && typeof window.grantPaidUnlock === 'function') {
      setTimeout(function () { window.resumePendingPurchases(window.grantPaidUnlock); }, 800);
    }
  });

  // Standing alone already (installed) — nothing to suggest.
  var standalone = (window.navigator.standalone === true) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (standalone) return;

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isSafari = isIOS && !/crios|fxios|edgios/i.test(navigator.userAgent);
  if (!isIOS) return;

  var HINT_KEY = 'gn_install_hint_dismissed';
  try { if (localStorage.getItem(HINT_KEY) === '1') return; } catch (e) { return; }

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (document.getElementById('installHint')) return;
      var box = document.createElement('div');
      box.id = 'installHint';
      box.innerHTML = (isSafari
        ? 'Add GameNight to your home screen: tap <b>Share</b>, then <b>Add to Home Screen</b>. It then opens full screen and works without internet.'
        : 'For full screen and offline play, open this page in <b>Safari</b>, then Share → <b>Add to Home Screen</b>.')
        + '<button type="button" aria-label="Dismiss">✕</button>';
      document.body.appendChild(box);
      box.querySelector('button').addEventListener('click', function () {
        box.hidden = true;
        try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
      });
    }, 1800);
  });
})();
