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

  /* ---------------- real download counts ----------------
     The APK is a GitHub release asset, so GitHub's own download_count is the
     number of times it was actually fetched. Nothing here is estimated: when
     the API cannot be reached the count stays hidden instead of showing a
     made-up figure. Results are cached for ten minutes per app. */
  function fmtCount(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function fillDownloadCounts() {
    var targets = $$('[data-dl]');
    if (!targets.length) return;

    var groups = {};
    targets.forEach(function (el) {
      var app = appById(el.getAttribute('data-dl'));
      if (!app || !app.release || !app.release.tag) return;
      if (!groups[app.id]) groups[app.id] = { app: app, nodes: [] };
      groups[app.id].nodes.push(el);
    });

    Object.keys(groups).forEach(function (id) {
      var app = groups[id].app;
      var nodes = groups[id].nodes;
      var cacheKey = 'alum-dl:' + app.release.tag;
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); } catch (e) { cached = null; }

      var show = function (count) {
        if (count == null) return;
        nodes.forEach(function (node) {
          node.textContent = count === 0 ? 'New' : fmtCount(count) + ' download' + (count === 1 ? '' : 's');
          node.hidden = false;
        });
      };

      if (cached && typeof cached.count === 'number' && Date.now() - cached.at < 10 * 60 * 1000) {
        show(cached.count);
        return;
      }

      var url = 'https://api.github.com/repos/' + app.release.repo + '/releases/tags/' + encodeURIComponent(app.release.tag);
      fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (rel) {
          if (!rel || !rel.assets) return;
          var apks = rel.assets.filter(function (a) { return /\.apk$/i.test(a.name || ''); });
          var list = apks.length ? apks : rel.assets;
          var count = list.reduce(function (n, a) { return n + (a.download_count || 0); }, 0);
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), count: count }));
          } catch (e) { /* storage full or blocked */ }
          show(count);
        })
        .catch(function () { /* leave the count hidden */ });
    });
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
              '<span class="dl-count" data-dl="' + esc(app.id) + '" hidden></span>' +
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
  // Wide (landscape) captures get their own full-width rows: at the 220 px used
  // for a portrait phone shot they would be a 90 px sliver. Portrait shots stay
  // in the scrolling strip.
  function shotHtml(app) {
    var all = app.screenshots || [];
    var wide = all.filter(function (s) { return s.wide; });
    var tall = all.filter(function (s) { return !s.wide; });

    function link(s) {
      return '<a href="' + esc(s.src) + '" target="_blank" rel="noopener">' +
             '<img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '"' +
             (s.wide ? '' : ' loading="lazy"') + '></a>';
    }

    return (wide.length
      ? '<div class="shots-wide" aria-label="Screenshots in landscape">' + wide.map(link).join('') + '</div>'
      : '') +
      (tall.length
        ? '<div class="shots" aria-label="Screenshots">' + tall.map(link).join('') + '</div>'
        : '');
  }

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

    var reviewForm = '' +
      '<form class="review-form" id="reviewForm" novalidate>' +
        '<h3>Leave a rating</h3>' +
        '<p class="review-help">Reviews are read before they appear here, so nothing is published automatically. Your mail app will open with the review ready to send.</p>' +
        '<div class="star-picker" role="radiogroup" aria-label="Your rating">' +
          [1, 2, 3, 4, 5].map(function (n) {
            return '<button type="button" class="star-pick" role="radio" aria-checked="false" data-value="' + n + '" aria-label="' + n + ' star' + (n === 1 ? '' : 's') + '">★</button>';
          }).join('') +
        '</div>' +
        '<label class="field"><span>Your name (optional)</span><input id="reviewName" type="text" maxlength="40" autocomplete="name"></label>' +
        '<label class="field"><span>Your review</span><textarea id="reviewText" rows="3" maxlength="600" placeholder="What did you enjoy? What could be better?" required></textarea></label>' +
        '<button class="btn btn-primary btn-sm" type="submit">Send review</button>' +
        '<p class="form-note" id="reviewNote" role="status"></p>' +
      '</form>';

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
          shotHtml(app) +

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

          (app.passes ? '' +
            '<section class="app-section">' +
              '<h2>What it costs</h2>' +
              '<p>GameNight is free to download. Points you earn open a locked category, and it stays open for good. If you want everything at once, a pass opens every category and Apa Ndipati until it ends.</p>' +
              '<ul class="price-list">' + app.passes.map(function (p) {
                return '<li><span>' + esc(p.name) + ' <em>' + esc(p.note) + '</em></span><b>' + esc(p.price) + '</b></li>';
              }).join('') + '</ul>' +
              '<p class="note" style="margin-top:0.9rem">A pass does not renew by itself: nothing is charged unless you pay again.</p>' +
            '</section>' : '') +

          '<section class="app-section" id="reviews">' +
            '<h2>Ratings and reviews</h2>' +
            reviewHtml +
            reviewForm +
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
              '<div><dt>Downloads</dt><dd><span class="dl-count" data-dl="' + esc(app.id) + '">—</span></dd></div>' +
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

    var reviewFormEl = $('#reviewForm');
    if (reviewFormEl) {
      var chosen = 0;
      var picks = $$('.star-pick', reviewFormEl);
      picks.forEach(function (b) {
        b.addEventListener('click', function () {
          chosen = Number(b.getAttribute('data-value'));
          picks.forEach(function (x) {
            x.classList.toggle('on', Number(x.getAttribute('data-value')) <= chosen);
            x.setAttribute('aria-checked', x === b ? 'true' : 'false');
          });
        });
      });
      reviewFormEl.addEventListener('submit', function (e) {
        e.preventDefault();
        var note = $('#reviewNote', reviewFormEl);
        var textEl = $('#reviewText', reviewFormEl);
        var text = textEl.value.trim();
        if (!chosen) { note.textContent = 'Pick a star rating first.'; return; }
        if (text.length < 10) { note.textContent = 'Add a sentence or two so the review is useful.'; textEl.focus(); return; }
        var name = ($('#reviewName', reviewFormEl).value || 'A player').trim();
        var subject = 'Review: ' + app.name + ' — ' + chosen + '/5';
        var body = 'App: ' + app.name + ' ' + app.version + '\nRating: ' + chosen + '/5\nName: ' + name + '\n\n' + text + '\n\nSent from ' + location.href;
        note.textContent = 'Opening your mail app with the review ready to send.';
        window.location.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });
    }

    // The app links to gamenight.html#reviews, but this section is built after
    // load, so jump to it once it exists. The jump is instant: a smooth scroll
    // down two screens is slower than the visitor expects from a link.
    if (location.hash === '#reviews') {
      setTimeout(function () {
        var target = document.getElementById('reviews');
        if (!target) return;
        var root = document.documentElement;
        var prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset);
        root.style.scrollBehavior = prev;
      }, 80);
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
  fillDownloadCounts();
})();
