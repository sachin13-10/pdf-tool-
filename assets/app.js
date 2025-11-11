(function(){
  // Detect base path: if in features/, use ../ for components/assets
  var isFeature = location.pathname.indexOf('/features/') !== -1;
  var base = isFeature ? '..' : '.';

  // Inject CSS if not present
  function ensureStyles(){
    if (!document.querySelector('link[data-app-style]')){
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + '/assets/styles.css';
      link.setAttribute('data-app-style','1');
      document.head.appendChild(link);
    }
  }

  // Fetch and inject components
  function inject(selector, url){
    var host = document.querySelector(selector);
    if (!host) return Promise.resolve();
    return fetch(url).then(function(r){ return r.text(); }).then(function(html){
      host.innerHTML = html;
    }).catch(function(){ /* ignore */ });
  }

  function initNavbar(){
    var btn = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Mark active link
    try {
      var path = location.pathname.replace(/index\.html$/, '');
      // Rewrite brand link for feature pages so Home goes to site root
      var brand = document.querySelector('.site-navbar .brand[href]');
      if (brand){
        var hrefB = brand.getAttribute('href') || '';
        if (isFeature && hrefB.indexOf('../') !== 0){ brand.setAttribute('href', hrefB.replace(/^\./, '..')); }
      }

      // Normalize all nav links
      document.querySelectorAll('.nav-links a').forEach(function(a){
        var href = a.getAttribute('href') || '';
        // Fix relative links for /features/ pages
        if (isFeature && href.charAt(0) === '.' && href.indexOf('../') !== 0){
          // Convert ./x.html to ../x.html so it points to root page
          a.setAttribute('href', href.replace(/^\./, '..'));
        }
        // Normalize for active highlighting
        var full = new URL(a.getAttribute('href'), location.origin + location.pathname).pathname.replace(/index\.html$/, '');
        if (full === path) a.classList.add('active');
      });
    } catch(e){}
  }

  // Ads module loader (loads optional AdSense + placements logic from assets/ads/ads.js)
  function loadAdsModule(){
    // Only load if placeholders exist (keeps non-ad pages lean)
    if (!document.querySelector('.ad-slot, .ad-box, .ad-banner')) return;
    if (document.getElementById('ads-module')) return;
    var s = document.createElement('script');
    s.id = 'ads-module';
    s.async = true;
    s.src = base + '/assets/ads/ads.js';
    document.head.appendChild(s);
  }

  // Simple cookie banner (hidden if Funding Choices CMP loads)
  function ensureCookieBanner(){
    if (document.getElementById('cookie-consent')) return;
    var div = document.createElement('div');
    div.id = 'cookie-consent';
    div.className = 'cookie-banner';
    div.innerHTML = '<span>We use cookies for ads and measurement. See our <a href="' + (isFeature?'../':'./') + 'privacy.html">Privacy Policy</a>.</span>' +
      '<button type="button" data-accept>Accept</button>';
    document.body.appendChild(div);
    try {
      if (localStorage.getItem('cookieConsent') === 'accepted') {
        div.remove();
        return;
      }
    } catch(e){}
    var btn = div.querySelector('[data-accept]');
    if (btn) btn.addEventListener('click', function(){
      try { localStorage.setItem('cookieConsent','accepted'); } catch(e){}
      div.remove();
    });
  }

  // Funding Choices CMP auto-loader (respects meta[name=fc-id] or vendor/cmp-id.js)
  function loadFundingChoicesIfConfigured(){
    function load(id){
      var bar = document.getElementById('cookie-consent');
      if (bar) bar.remove();
      var s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = 'https://fundingchoicesmessages.google.com/i/' + encodeURIComponent(id);
      document.head.appendChild(s);
    }
    var meta = document.querySelector('meta[name="fc-id"]');
    var id = (window.__FC_ID && (''+window.__FC_ID).trim()) || (meta && (meta.content||'').trim());
    if (id && !/^REPLACE_/i.test(id)) { load(id); return; }
    var tagId = 'cmp-id-loader';
    if (!document.getElementById(tagId)){
      var t = document.createElement('script');
      t.id = tagId;
      t.async = true;
      t.src = base + '/vendor/cmp-id.js';
      t.onload = function(){
        var id2 = (window.__FC_ID && (''+window.__FC_ID).trim()) || (meta && (meta.content||'').trim());
        if (id2 && !/^REPLACE_/i.test(id2)) load(id2);
      };
      t.onerror = function(){};
      document.head.appendChild(t);
    }
  }

  // Bootstrap
  ensureStyles();
  // Stubs for mount points
  var headerMount = document.querySelector('header[data-include="navbar"]');
  if (!headerMount){ headerMount = document.createElement('header'); headerMount.setAttribute('data-include','navbar'); document.body.insertBefore(headerMount, document.body.firstChild); }
  var footerMount = document.querySelector('div[data-include="footer"]');
  if (!footerMount){ footerMount = document.createElement('div'); footerMount.setAttribute('data-include','footer'); document.body.appendChild(footerMount); }

  Promise.all([
    inject('header[data-include="navbar"]', base + '/components/navbar.html'),
    inject('div[data-include="footer"]', base + '/components/footer.html')
  ]).then(function(){
    // Ensure header is at the top and footer at the end (in case markup order varies)
    try {
      var body = document.body;
      var header = document.querySelector('header[data-include="navbar"]');
      if (header && body.firstElementChild !== header){ body.insertBefore(header, body.firstElementChild); }
      var footer = document.querySelector('div[data-include="footer"]');
      if (footer && body.lastElementChild !== footer){ body.appendChild(footer); }
    } catch(e){}

    // Normalize internal links so they work from both root and /features/
    try {
      var prefix = isFeature ? '..' : '.';
      function isExternal(h){ return /^(https?:|mailto:|tel:|#)/i.test(h); }
      // Footer links
      document.querySelectorAll('.site-footer a[href]').forEach(function(a){
        var href = a.getAttribute('href') || '';
        if (isExternal(href)) return;
        var parts = href.split('#');
        var leaf = (parts[0]||'').split('/').pop();
        var hash = parts[1] ? ('#'+parts[1]) : '';
        if (leaf) a.setAttribute('href', prefix + '/' + leaf + hash);
      });

      // Navbar brand + links normalization (handles ./ paths on feature pages)
      document.querySelectorAll('.site-navbar a[href]').forEach(function(a){
        var href = a.getAttribute('href') || '';
        if (isExternal(href)) return;
        if (isFeature && href.charAt(0) === '.' && href.indexOf('../') !== 0){
          a.setAttribute('href', href.replace(/^\./, '..'));
        }
      });
    } catch(e){}
    initNavbar();
    ensureCookieBanner();
    loadFundingChoicesIfConfigured();
    // Load ads module which handles config, auto placement, and AdSense init
    try { loadAdsModule(); } catch(e){}
    setupStickyActions();
  });

  // Mobile sticky action bar: mirror primary buttons when they scroll out of view
  function setupStickyActions(){
    var mq = window.matchMedia('(max-width: 760px)');
    if (!mq.matches) return;
    var container = document.createElement('div');
    container.className = 'sticky-actions';
    document.body.appendChild(container);

    // Collect up to two primary buttons on the page
    var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('main button.primary, .card button.primary'))
      .filter(function(b){ return !!(b.offsetParent); });
    if (!sourceButtons.length) return;
    sourceButtons = sourceButtons.slice(0,2);

    // Create mirrored buttons that trigger originals
    sourceButtons.forEach(function(src){
      var clone = src.cloneNode(true);
      clone.removeAttribute('id');
      // Ensure accessible name stays in sync
      var sync = function(){ clone.textContent = src.textContent; clone.disabled = !!src.disabled; clone.style.display = window.getComputedStyle(src).display === 'none' ? 'none' : ''; };
      sync();
      clone.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); if (!src.disabled) src.click(); });
      container.appendChild(clone);
      // Observe state changes
      var mo = new MutationObserver(sync); mo.observe(src, { attributes:true, attributeFilter:['disabled','style','class'] });
    });

    function isMostlyVisible(el){
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      return visible >= Math.min(vh*0.5, r.height*0.6);
    }
    function updateBar(){
      // Hide bar when any source primary button is in view; show otherwise
      var anyVisible = sourceButtons.some(function(b){ return b.offsetParent && isMostlyVisible(b); });
      container.classList.toggle('show', !anyVisible && sourceButtons.some(function(b){ return b.offsetParent; }));
    }
    ['scroll','resize','orientationchange'].forEach(function(evt){ window.addEventListener(evt, updateBar, { passive:true }); });
    updateBar();
  }

  // (Legacy) Dynamic feature blog injection removed: each feature page now contains
  // its own static <section class="feature-blog"> with unique educational content and ad slots.

  // (Ad placement + AdSense logic moved to assets/ads/ads.js)
})();