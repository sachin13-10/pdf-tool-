# EDITSMYPDF — Client-side PDF tools

Static website with free, private, browser‑based PDF tools. All processing runs locally using PDF.js, pdf-lib, jsPDF, and related libraries. No file uploads.

## Structure

- Pages: `index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html`
- Tools: `features/*.html` (one HTML per tool)
- Shared UI: `components/navbar.html`, `components/footer.html` (injected on load)
- Core assets: `assets/styles.css`, `assets/app.js`, `assets/images/*`
- Ads module: `assets/ads/ads.js` (AdSense + automatic placements), `assets/adsense-config.js` (publisher & slot IDs)
- Compliance/SEO: `privacy.html`, `terms.html`, `sitemap.xml`, `robots.txt`, `ads.txt`, `CNAME`
- Funding Choices CMP (optional): `vendor/cmp-id.js`

## How the app boots

`assets/app.js` runs on every page and:

- Injects the navbar and footer components
- Normalizes internal links so they work from both `/` and `/features/`
- Shows a simple cookie banner (hidden if a Funding Choices CMP is configured)
- Dynamically loads `assets/ads/ads.js` only if ad placeholders are present (keeping non-ad pages lean)

## Enable Google AdSense (optional)

By default, ad containers show placeholders. To serve real ads:

1. Set your publisher ID in `assets/adsense-config.js`:

   // assets/adsense-config.js
   // window.ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXX';

2. Optionally map specific placements to your slot IDs via `window.ADSENSE_SLOTS` in the same file.

3. Publish `ads.txt` at the root (already present) with your real publisher ID.
4. Ensure ad density stays reasonable: avoid stacking multiple large ads above the fold (the auto-placement logic is conservative).

### Ads module responsibilities

`assets/ads/ads.js` performs three steps on load:
1. Load `assets/adsense-config.js` (if not already in the DOM)
2. Insert structural ad placeholders (context-aware for index vs feature pages & blog sections)
3. Initialize AdSense and transform placeholders into live units

If `window.ADSENSE_CLIENT` isn’t set, placeholders remain simple grey boxes.

## Configure Funding Choices CMP (optional)

Set your property ID in `vendor/cmp-id.js`:

```js
// vendor/cmp-id.js
// window.__FC_ID = 'pub-REPLACE_WITH_REAL_ID';
```

or add `<meta name="fc-id" content="pub-...">` in the page head.

## Notes

- Each feature page now contains its own static “Feature Blog” section. The old dynamic injector was removed. Styles for the blog live in `assets/styles.css` under `.feature-blog`.
- Everything is static and can be hosted on GitHub Pages. A `404.html` is provided for nicer not-found handling.
- Ad logic is separated for clarity, performance, and easier audits (recommended by AdSense best practices for maintainability).

## Migration from older structure

Previously, ad placement and AdSense initialization lived directly in `assets/app.js`. That code has been removed and replaced by a lightweight loader (`loadAdsModule()`). If you had custom modifications inside the old ad functions, move them into `assets/ads/ads.js` inside the appropriate helper (`autoPlaceAds`, `initAds`).
