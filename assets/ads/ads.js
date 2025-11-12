// Dedicated AdSense & ad placement module
// Loads optional config, auto-places structural ad slots, then initializes AdSense
// This file is intentionally separate from core UI bootstrap (app.js) so that
// performance and non-ad functionality remain decoupled.
(function(){
  var isFeature = location.pathname.indexOf('/features/') !== -1;

  function initAds(){
    var client = (window.ADSENSE_CLIENT || '').trim();
    if (!client) return; // Only run when publisher ID set
    if (!document.querySelector('script[data-adsbygoogle]')){
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-adsbygoogle','1');
      document.head.appendChild(s);
    }
    var cfg = (window.ADSENSE_SLOTS || {});
    document.querySelectorAll('.ad-banner, .ad-box, .ad-slot').forEach(function(el){
      if (el.classList.contains('ads-init')) return;
      el.classList.add('ads-init');
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', client);
      var slot = (el.getAttribute('data-ad-slot')||'').trim();
      if (!slot && cfg){
        var id = el.id || '';
        if (id && cfg[id]) slot = cfg[id];
        if (!slot){
          var cls = (el.className||'').split(/\s+/);
          for (var i=0;i<cls.length;i++){ if (cfg[cls[i]]){ slot = cfg[cls[i]]; break; } }
        }
        if (!slot && el.parentElement && el.parentElement.classList.contains('blog-ads')){
          var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
          if (Array.isArray(cfg.blogAds) && cfg.blogAds[idx]) slot = cfg.blogAds[idx];
        }
      }
      ins.setAttribute('data-ad-slot', slot || '0000000000');
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      el.innerHTML = '';
      el.appendChild(ins);
      try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(e){}
    });
  }

  function tryLoadAdsenseConfig(){
    var id = 'adsense-config';
    if (document.getElementById(id)) return;
    var base = isFeature ? '..' : '.';
    var s = document.createElement('script');
    s.id = id; s.async = true; s.src = base + '/assets/adsense-config.js';
    s.onload = function(){
      try {
        var client = (window.ADSENSE_CLIENT || '').trim();
        if (client) { autoPlaceAds(); initAds(); }
      } catch(e){}
    };
    document.head.appendChild(s);
  }

  function autoPlaceAds(){
    var main = document.querySelector('main');
    if (!main) return;
    function makeAd(id, extraClass, slot){
      var d = document.createElement('div');
      d.className = 'ad-slot' + (extraClass ? (' ' + extraClass) : '');
      if (id) d.id = id;
      if (slot) d.setAttribute('data-ad-slot', slot);
      d.setAttribute('role','complementary');
      d.setAttribute('aria-label','Advertisement');
      d.textContent = 'Ad';
      return d;
    }
    if (!document.getElementById('ad-under-title')){
      var h2 = main.querySelector('h2');
      if (h2 && h2.parentNode){
        var node = makeAd('ad-under-title','ad-in-article','1001');
        if (h2.nextSibling) h2.parentNode.insertBefore(node, h2.nextSibling); else h2.parentNode.appendChild(node);
      }
    }
    if (isFeature && !document.getElementById('ad-below-tool')){
      var primaryCard = main.querySelector('.card');
      if (primaryCard && primaryCard.parentNode){
        var node2 = makeAd('ad-below-tool','ad-below-tool','1002');
        if (primaryCard.nextSibling) primaryCard.parentNode.insertBefore(node2, primaryCard.nextSibling); else primaryCard.parentNode.appendChild(node2);
      }
    }
    if (!document.getElementById('ad-mid')){
      main.appendChild(makeAd('ad-mid','ad-mid','1003'));
    }
    document.querySelectorAll('section.feature-blog').forEach(function(blog, idx){
      if (!blog.querySelector('.ad-inline-top')){
        var ref = blog.querySelector('p, h4, h3, ol, ul');
        if (ref && ref.parentNode){
          var adTop = makeAd(null,'ad-inline-top','2' + (idx+1) + '01');
          if (ref.nextSibling) ref.parentNode.insertBefore(adTop, ref.nextSibling); else ref.parentNode.appendChild(adTop);
        }
      }
      if (!blog.querySelector('.blog-ads')){
        var grid = document.createElement('div');
        grid.className = 'blog-ads';
        grid.appendChild(makeAd(null,'','2' + (idx+1) + '11'));
        grid.appendChild(makeAd(null,'','2' + (idx+1) + '12'));
        grid.appendChild(makeAd(null,'','2' + (idx+1) + '13'));
        blog.appendChild(grid);
      }
      if (!blog.querySelector('.ad-after-explainer')){
        var afterExplainerTarget = blog.querySelector('ol.blog-steps, h4, p');
        if (afterExplainerTarget){
          var explAd = makeAd(null,'ad-after-explainer','2' + (idx+1) + '21');
          var parent = afterExplainerTarget.parentNode;
          if (afterExplainerTarget.nextSibling) parent.insertBefore(explAd, afterExplainerTarget.nextSibling); else parent.appendChild(explAd);
        }
      }
    });
    if (isFeature && !document.getElementById('ad-after-blog')){
      var lastBlog = main.querySelector('section.feature-blog:last-of-type');
      if (lastBlog){
        var afterBlogAd = makeAd('ad-after-blog','ad-after-blog','1004');
        if (lastBlog.nextSibling) main.insertBefore(afterBlogAd, lastBlog.nextSibling); else main.appendChild(afterBlogAd);
      }
    }
    if (!isFeature){
      var toolsGrid = main.querySelector('.tools');
      if (toolsGrid && !document.getElementById('ad-after-tools')){
        var afterToolsAd = makeAd('ad-after-tools','ad-after-tools','1011');
        if (toolsGrid.nextSibling) toolsGrid.parentNode.insertBefore(afterToolsAd, toolsGrid.nextSibling); else toolsGrid.parentNode.appendChild(afterToolsAd);
      }
      if (!document.getElementById('ad-bottom-main')){
        main.appendChild(makeAd('ad-bottom-main','ad-bottom-main','1012'));
      }
    }
  }

  function bootstrap(){
    // Load config and only place/init ads when a publisher ID is present
    tryLoadAdsenseConfig();
    var client = (window.ADSENSE_CLIENT || '').trim();
    if (client) { autoPlaceAds(); initAds(); }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') bootstrap();
  else document.addEventListener('DOMContentLoaded', bootstrap);
})();