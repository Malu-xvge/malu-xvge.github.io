// Web-only glue: service worker, resume after returning from checkout, and the
// iOS "add to home screen" hint. Not part of the Android app.
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' }).then(function () {
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

    navigator.serviceWorker.addEventListener('message', function (e) {
      var plan = e.data;
      if (!plan || plan.type !== 'warm-plan') return;
      runWarm(plan);
    });

    if (reg.active) reg.active.postMessage({ type: 'warm-plan' });
  }

  function runWarm(plan) {
    var queue = (plan.warm || []).slice();
    var WORKERS = 4;

    for (var w = 0; w < WORKERS; w++) work();

    async function work() {
      var cache = await caches.open(plan.runtimeCache);
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
