# ALUM — company site

Static site for ALUM, an app studio in Lilongwe. No build step, no framework:
plain HTML, one stylesheet, two small scripts.

## Structure

```
index.html        Home — what the studio is, latest app
downloads.html    Every published app, links to the app page
gamenight.html    App page: size, version, ratings, screenshots, APK
about.html        The studio, how we build, why direct downloads
privacy.html      Privacy policy (app + site)
404.html          Not found

assets/css/site.css     all styles
assets/js/apps.js       site settings + the APPS array (edit this to add an app)
assets/js/site.js       renders the cards, downloads list and app page
assets/img/             icon, screenshots, favicon
downloads/              APK files served from here
```

## Adding a new app

1. Drop the APK in `downloads/`.
2. Add an object to `APPS` in `assets/js/apps.js` (copy the GameNight one).
3. Create `yourapp.html` using `gamenight.html` and change `data-app` to the new `id`.
4. If it is the newest release, set `featured: true` on it and remove it from the others.

The home page, downloads list and app page all read from that one array.

## Ratings and reviews

`rating.average` is `null` and `reviews` is empty until there are real ones — the
app page shows a "no reviews yet" state rather than invented numbers. Fill them in
when reviews exist.

## Local preview

```
node _tools/serve.js 8124
```

Then open http://localhost:8124. `_tools/` is git-ignored and not published.

## Publishing

The site is served by GitHub Pages from the root of the default branch. Push and
it is live.
