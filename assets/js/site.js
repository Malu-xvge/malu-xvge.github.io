(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function appById(id) {
    for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i];
    return null;
  }

  function stars(avg, count) {
    var filled = avg ? Math.round(avg) : 0;
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="star' + (i <= filled ? ' on' : '') + '" aria-hidden="true">★</span>';
    }
    var label = avg ? avg.toFixed(1) + ' out of 5 from ' + count + ' review' + (count === 1 ? '' : 's')
                    : 'No ratings yet';
    return '<span class="stars" role="img" aria-label="' + esc(label) + '">' + out + '</span>';
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var box = $('#featuredCard');
    if (!box) return;
    var app = APPS.filter(function (a) { return a.featured; })[0] || APPS[0];
    if (!app) return;

    box.innerHTML = '' +
      '<div class="feature-card">' +
        '<img class="feature-icon" src="' + esc(app.icon) + '" alt="" width="112" height="112">' +
        '<div class="feature-body">' +
          '<span class="badge gold">Latest release</span>' +
          '<h3>' + esc(app.name) + '</h3>' +
          '<p>' + esc(app.summary) + '</p>' +
          '<div class="feature-meta">' +
            '<span>v' + esc(app.version) + '</span><span aria-hidden="true">·</span>' +
            '<span>' + esc(app.size) + '</span><span aria-hidden="true">·</span>' +
            '<span>Android ' + esc(app.minAndroid) + '+</span><span aria-hidden="true">·</span>' +
            (app.iphone ? '<span>iPhone + iPad</span><span aria-hidden="true">·</span>' : '') +
            '<span>' + esc(app.price) + '</span>' +
          '</div>' +
          '<div class="card-actions">' +
            '<a class="btn btn-primary btn-sm" href="gamenight.html">View ' + esc(app.name) + '</a>' +
            '<a class="btn btn-ghost btn-sm" href="' + esc(app.apk) + '" download>Download APK</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- downloads list ---------------- */
  function renderDownloads() {
    var list = $('#downloadList');
    if (!list) return;

    if (!APPS.length) {
      list.innerHTML = '<p class="meta-line">Nothing published yet.</p>';
      return;
    }

    list.innerHTML = APPS.map(function (app) {
      var available = app.status === 'available';
      var meta = available
        ? ['v' + app.version, app.size, 'Android ' + app.minAndroid + '+']
            .concat(app.iphone ? ['iPhone + iPad'] : [])
            .concat(['Updated ' + app.released])
        : ['In development'];
      return '' +
        '<article class="app-row' + (available ? '' : ' soon') + '">' +
          '<img src="' + esc(app.icon) + '" alt="" width="76" height="76" loading="lazy">' +
          '<div class="app-row-main">' +
            '<div class="app-row-head">' +
              '<h3>' + esc(app.name) + '</h3>' +
              (available ? '' : '<span class="badge">Coming soon</span>') +
            '</div>' +
            '<p class="app-row-tag">' + esc(app.tagline) + '</p>' +
            '<div class="app-row-meta">' +
              meta.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') +
              '<span class="app-row-rating">' + stars(app.rating.average, app.rating.count) +
                (app.rating.count ? '' : '<em>No ratings yet</em>') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="app-row-cta">' +
            (available ? '<a class="btn btn-primary btn-sm" href="' + esc(app.id) + '.html">View app</a>' : '') +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ---------------- app page ---------------- */
  function renderAppPage() {
    var root = $('#appPage');
    if (!root) return;
    var app = appById(root.getAttribute('data-app'));
    if (!app) {
      root.innerHTML = '<p>App not found. <a href="downloads.html">See all downloads</a>.</p>';
      return;
    }

    document.title = app.name + ' — ' + SITE.name;
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', app.tagline + ' Download the ' + app.name + ' APK directly from ' + SITE.name + '.');

    var ratingCount = app.rating.count || 0;
    var ratingAvg = app.rating.average;

    var reviewHtml;
    if (app.reviews && app.reviews.length) {
      reviewHtml = '<div class="review-list">' + app.reviews.map(function (r) {
        return '<article class="review">' +
          '<div class="review-head"><strong>' + esc(r.name || 'Player') + '</strong>' +
          '<span>' + stars(r.stars, r.stars) + '</span></div>' +
          '<p>' + esc(r.text) + '</p>' +
          '</article>';
      }).join('') + '</div>';
    } else {
      reviewHtml = '<div class="empty-reviews">' +
        '<p><strong>No reviews yet.</strong></p>' +
        '<p>' + esc(app.name) + ' was released on ' + esc(app.released) + '. Ratings and reviews from players will appear here as they come in. ' +
        'If you have played it, tell us what worked and what did not — honest feedback is more useful than stars.</p>' +
        '<a class="btn btn-ghost btn-sm" href="mailto:' + esc(SITE.email) + '?subject=' + encodeURIComponent('Feedback on ' + app.name) + '">Send feedback</a>' +
      '</div>';
    }

    root.innerHTML = '' +
      '<header class="app-hero">' +
        '<img class="app-icon" src="' + esc(app.icon) + '" alt="' + esc(app.name) + ' icon" width="128" height="128">' +
        '<div class="app-hero-body">' +
          '<h1>' + esc(app.name) + '</h1>' +
          '<p class="app-tagline">' + esc(app.tagline) + '</p>' +
          '<div class="rating-line">' +
            stars(ratingAvg, ratingCount) +
            '<span>' + (ratingAvg ? ratingAvg.toFixed(1) + ' · ' + ratingCount + ' review' + (ratingCount === 1 ? '' : 's') : 'No ratings yet') + '</span>' +
            '<span class="dot-sep" aria-hidden="true">·</span>' +
            '<span>' + esc(app.price) + '</span>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<div class="app-layout">' +
        '<div class="app-main">' +
          '<div class="shots" aria-label="Screenshots">' +
            (app.screenshots || []).map(function (s) {
              return '<a href="' + esc(s.src) + '" target="_blank" rel="noopener">' +
                     '<img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '" loading="lazy" width="220"></a>';
            }).join('') +
          '</div>' +

          '<section class="app-section">' +
            '<h2>About this app</h2>' +
            app.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
            '<ul class="chips">' + (app.modes || []).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
          '</section>' +

          '<section class="app-section">' +
            '<h2>What it does well</h2>' +
            '<ul class="hl-list">' + (app.highlights || []).map(function (h) {
              return '<li><span class="tick" aria-hidden="true">✓</span><div><b>' + esc(h.t) + '</b><p>' + esc(h.d) + '</p></div></li>';
            }).join('') + '</ul>' +
          '</section>' +

          '<section class="app-section">' +
            '<h2>Ratings and reviews</h2>' +
            reviewHtml +
          '</section>' +

          '<section class="app-section">' +
            '<h2>What\'s new in ' + esc(app.version) + '</h2>' +
            '<ul class="changes">' + (app.whatsNew || []).map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
          '</section>' +
        '</div>' +

        '<aside class="app-aside">' +
          '<div class="panel download-panel">' +
            '<a class="btn btn-primary" href="' + esc(app.apk) + '" download style="width:100%">Download APK · ' + esc(app.size) + '</a>' +
            '<p class="meta-line" style="margin:0.75rem 0 0">Version ' + esc(app.version) + ' · ' + esc(app.released) + '</p>' +
            '<dl class="facts">' +
              '<div><dt>Size</dt><dd>' + esc(app.size) + '</dd></div>' +
              '<div><dt>Android</dt><dd>' + esc(app.minAndroid) + ' and up</dd></div>' +
              '<div><dt>Version</dt><dd>' + esc(app.version) + ' (' + esc(app.versionCode) + ')</dd></div>' +
              '<div><dt>Price</dt><dd>' + esc(app.price) + '</dd></div>' +
              '<div><dt>Updated</dt><dd>' + esc(app.released) + '</dd></div>' +
            '</dl>' +
            '<details class="verify" style="margin-top:1rem">' +
              '<summary>Verify download</summary>' +
              '<p class="meta-line" style="margin:0.6rem 0 0">SHA-256 — compare it with the file you downloaded.</p>' +
              '<div class="sha">' +
                '<input id="shaValue" type="text" readonly aria-label="SHA-256 checksum" value="' + esc(app.sha256) + '">' +
                '<button type="button" id="copySha">Copy</button>' +
              '</div>' +
            '</details>' +
          '</div>' +

          (app.iphone ? '' +
            '<div class="panel iphone-panel">' +
              '<h3>On iPhone or iPad</h3>' +
              '<p>No App Store needed. GameNight runs in Safari and can sit on your Home Screen like an app.</p>' +
              '<ol class="install-list">' +
                '<li>Open <b>' + esc(app.iphone.label) + '</b> in Safari.</li>' +
                '<li>Tap <b>Share</b>, then <b>Add to Home Screen</b>.</li>' +
                '<li>Keep it open once to finish the first load (' + esc(app.iphone.size) + '). After that it works offline.</li>' +
              '</ol>' +
              '<a class="btn btn-ghost btn-sm" href="' + esc(app.iphone.url) + '" style="width:100%;margin-top:0.9rem">' + esc(app.iphone.label) + '</a>' +
            '</div>' : '') +

          '<div class="panel">' +
            '<h3>Installing on Android</h3>' +
            '<ol class="install-list">' +
              '<li>Download the APK on your phone.</li>' +
              '<li>Allow <b>install unknown apps</b> for Chrome when asked. Android warns about anything outside the Play Store.</li>' +
              '<li>Open the file, install, then open GameNight.</li>' +
            '</ol>' +
            '<p class="note" style="margin-top:0.9rem">Updating installs over the old version and keeps your points.</p>' +
          '</div>' +
        '</aside>' +
      '</div>';

    var shaValue = $('#shaValue');
    var copyBtn = $('#copySha');
    if (copyBtn && shaValue) {
      copyBtn.addEventListener('click', function () {
        var done = function () {
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shaValue.value).then(done, function () { shaValue.select(); });
        } else {
          shaValue.select();
          document.execCommand('copy');
          done();
        }
      });
    }
  }

  /* ---------------- shared ---------------- */
  var mailLinks = $$('[data-mail]');
  mailLinks.forEach(function (a) {
    a.href = 'mailto:' + SITE.email;
    if (a.getAttribute('data-mail') === 'subject') {
      a.href += '?subject=' + encodeURIComponent('Hello ' + SITE.name);
    }
  });

  $$('[data-site-name]').forEach(function (el) { el.textContent = SITE.name; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var page = document.body.getAttribute('data-page');
  if (page === 'home') renderHome();
  if (page === 'downloads') renderDownloads();
  if (page === 'app') renderAppPage();
})();
