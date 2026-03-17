(function () {
  'use strict';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function getBaseUrl(scriptEl) {
    var src = scriptEl.getAttribute('src') || '';
    try {
      var url = new URL(src);
      return url.origin;
    } catch (e) {
      return 'https://sifa.id';
    }
  }

  function formatCompact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  var APP_COLORS = {
    bluesky: { bg: '#e0f2fe', text: '#075985' },
    whitewind: { bg: '#f1f5f9', text: '#334155' },
    smokesignal: { bg: '#ffedd5', text: '#9a3412' },
    frontpage: { bg: '#ede9fe', text: '#5b21b6' },
    picosky: { bg: '#fce7f3', text: '#9d174d' },
    linkat: { bg: '#d1fae5', text: '#065f46' },
    pastesphere: { bg: '#fef3c7', text: '#92400e' },
  };
  var FALLBACK_COLOR = { bg: '#f3f4f6', text: '#374151' };

  var sifaIconSvg =
    '<svg viewBox="0 0 256 256" class="sifa-icon" role="img" aria-label="Sifa">' +
    '<g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">' +
    '<path d="M128,71.5C159.183,71.5 184.5,96.817 184.5,128C184.5,159.183 159.183,184.5 128,184.5C96.817,184.5 71.5,159.183 71.5,128C71.5,96.817 96.817,71.5 128,71.5ZM128,104.5C115.03,104.5 104.5,115.03 104.5,128C104.5,140.97 115.03,151.5 128,151.5C140.97,151.5 151.5,140.97 151.5,128C151.5,115.03 140.97,104.5 128,104.5Z" fill="currentColor"/>' +
    '</g>' +
    '<g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">' +
    '<path d="M174.866,194.259C182.45,189.218 192.7,191.282 197.741,198.866C202.782,206.45 200.718,216.7 193.134,221.741C175.432,233.507 150.846,240.5 128,240.5C66.284,240.5 15.5,189.716 15.5,128C15.5,66.284 66.284,15.5 128,15.5C189.716,15.5 240.5,66.284 240.5,128C240.5,160.538 225.46,184.5 196,184.5C166.54,184.5 151.5,160.538 151.5,128L151.5,88C151.5,78.893 158.893,71.5 168,71.5C177.107,71.5 184.5,78.893 184.5,88L184.5,128C184.5,134.408 185.237,140.363 187.279,145.164C188.851,148.858 191.536,151.5 196,151.5C200.464,151.5 203.149,148.858 204.721,145.164C206.763,140.363 207.5,134.408 207.5,128C207.5,84.388 171.612,48.5 128,48.5C84.388,48.5 48.5,84.388 48.5,128C48.5,171.612 84.388,207.5 128,207.5C144.415,207.5 162.148,202.713 174.866,194.259Z" fill="currentColor"/>' +
    '</g>' +
    '<path d="M176,47.75 L208,79.75 L176,111.75 L144,79.75 Z" fill="none" stroke="currentColor" stroke-width="12"/>' +
    '<path d="M80,144 L112,176 L80,208 L48,176 Z" fill="none" stroke="currentColor" stroke-width="12"/>' +
    '<path d="M152,192 L176,160 L200,192" fill="none" stroke="currentColor" stroke-width="11"/>' +
    '</svg>';

  function buildStyles(theme) {
    var lightVars =
      '--sifa-bg:#fff;--sifa-card:#fff;--sifa-text:#111;--sifa-muted:#666;--sifa-border:#e5e5e5;--sifa-primary:#6366f1;';
    var darkVars =
      '--sifa-bg:#1a1a2e;--sifa-card:#16213e;--sifa-text:#eee;--sifa-muted:#888;--sifa-border:#333;--sifa-primary:#6366f1;';

    var themeBlock = '';
    if (theme === 'dark') {
      themeBlock = ':host{' + darkVars + '}';
    } else if (theme === 'light') {
      themeBlock = ':host{' + lightVars + '}';
    } else {
      themeBlock =
        ':host{' + lightVars + '}@media(prefers-color-scheme:dark){:host{' + darkVars + '}}';
    }

    return (
      themeBlock +
      ":host{display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--sifa-text);}" +
      '.card{background:var(--sifa-card);border:1px solid var(--sifa-border);border-radius:12px;padding:20px;max-width:400px;}' +
      '.top{display:flex;align-items:flex-start;gap:10px;}' +
      '.avatar-link{flex-shrink:0;}' +
      '.info{flex:1;min-width:0;}' +
      '.name-row a{text-decoration:none;color:inherit;}' +
      '.name{font-size:15px;font-weight:600;margin:0;}' +
      '.handle{font-size:12px;color:var(--sifa-muted);margin:0;}' +
      '.avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;}' +
      '.avatar-placeholder{width:48px;height:48px;border-radius:50%;background:var(--sifa-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;}' +
      '.headline{font-size:13px;color:var(--sifa-muted);margin:6px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}' +
      '.location{font-size:12px;color:var(--sifa-muted);margin:4px 0 0;}' +
      '.open-to{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 0;}' +
      '.pill{font-size:11px;padding:2px 8px;border-radius:10px;background:var(--sifa-primary);color:#fff;}' +
      '.activity-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;font-size:12px;color:var(--sifa-muted);}' +
      '.app-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;}' +
      '.app-badge{font-size:10px;font-weight:500;padding:2px 8px;border-radius:10px;}' +
      '.footer{margin-top:12px;padding-top:10px;border-top:1px solid var(--sifa-border);display:flex;align-items:center;justify-content:space-between;}' +
      '.cta{display:inline-block;font-size:13px;color:var(--sifa-primary);text-decoration:none;font-weight:500;}' +
      '.cta:hover{text-decoration:underline;}' +
      '.sifa-icon{width:16px;height:16px;color:var(--sifa-muted);opacity:0.5;}' +
      '.error{font-size:14px;color:var(--sifa-muted);padding:16px;text-align:center;}'
    );
  }

  function renderCard(data) {
    var avatarHtml;
    if (data.avatar) {
      avatarHtml =
        '<img class="avatar" src="' +
        escapeHtml(data.avatar) +
        '" alt="' +
        escapeHtml(data.displayName) +
        '">';
    } else {
      var letter = (data.displayName || data.handle || '?').charAt(0).toUpperCase();
      avatarHtml = '<div class="avatar-placeholder">' + escapeHtml(letter) + '</div>';
    }

    var headlineHtml = data.headline
      ? '<div class="headline">' + escapeHtml(data.headline) + '</div>'
      : '';

    var locationHtml = data.location
      ? '<div class="location">' + escapeHtml(data.location) + '</div>'
      : '';

    var openToHtml = '';
    if (data.openTo && data.openTo.length > 0) {
      var pills = '';
      for (var i = 0; i < data.openTo.length; i++) {
        pills += '<span class="pill">' + escapeHtml(data.openTo[i]) + '</span>';
      }
      openToHtml = '<div class="open-to">' + pills + '</div>';
    }

    // Activity row: follower count + PDS provider
    // Prefer AT Protocol follower count over Sifa-internal count
    // (mirrors src/lib/follower-utils.ts resolveDisplayFollowers)
    var displayFollowers = (data.atprotoFollowersCount != null && data.atprotoFollowersCount > 0)
      ? data.atprotoFollowersCount
      : data.followersCount;
    var activityHtml = '';
    var activityItems = '';
    if (displayFollowers && displayFollowers > 0) {
      activityItems +=
        '<span>' + escapeHtml(formatCompact(displayFollowers)) + ' followers</span>';
    }
    if (data.pdsProvider) {
      activityItems += '<span>on ' + escapeHtml(data.pdsProvider.name) + '</span>';
    }
    if (activityItems) {
      activityHtml = '<div class="activity-row">' + activityItems + '</div>';
    }

    // Active apps badges
    var appsHtml = '';
    if (data.activeApps && data.activeApps.length > 0) {
      var badges = '';
      for (var k = 0; k < data.activeApps.length; k++) {
        var app = data.activeApps[k];
        var colors = APP_COLORS[app.id] || FALLBACK_COLOR;
        badges +=
          '<span class="app-badge" style="background:' +
          colors.bg +
          ';color:' +
          colors.text +
          '">' +
          escapeHtml(app.name) +
          '</span>';
      }
      appsHtml = '<div class="app-badges">' + badges + '</div>';
    }

    var footerHtml =
      '<div class="footer">' +
      '<a class="cta" href="' +
      escapeHtml(data.profileUrl) +
      '" target="_blank" rel="noopener">View on Sifa</a>' +
      sifaIconSvg +
      '</div>';

    return (
      '<div class="card">' +
      '<div class="top">' +
      '<a class="avatar-link" href="' +
      escapeHtml(data.profileUrl) +
      '" target="_blank" rel="noopener">' +
      avatarHtml +
      '</a>' +
      '<div class="info">' +
      '<div class="name-row"><a href="' +
      escapeHtml(data.profileUrl) +
      '" target="_blank" rel="noopener">' +
      '<p class="name">' +
      escapeHtml(data.displayName || data.handle) +
      '</p></a></div>' +
      '<p class="handle">@' +
      escapeHtml(data.handle) +
      '</p>' +
      '</div>' +
      '</div>' +
      headlineHtml +
      locationHtml +
      openToHtml +
      activityHtml +
      appsHtml +
      footerHtml +
      '</div>'
    );
  }

  function initSifaEmbeds() {
    var scripts = document.querySelectorAll("script[src*='embed.js']");
    var promises = [];

    for (var i = 0; i < scripts.length; i++) {
      (function (scriptEl) {
        var did = scriptEl.getAttribute('data-did');
        var handle = scriptEl.getAttribute('data-handle');
        var identifier = did || handle;
        if (!identifier) return;

        var theme = scriptEl.getAttribute('data-theme') || 'auto';
        var baseUrl = getBaseUrl(scriptEl);
        var apiUrl = baseUrl + '/api/embed/' + encodeURIComponent(identifier) + '/data';

        var container = document.createElement('div');
        container.className = 'sifa-embed';
        var shadow = container.attachShadow({ mode: 'open' });

        scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);

        var promise = fetch(apiUrl)
          .then(function (res) {
            if (!res.ok) throw new Error('Not found');
            return res.json();
          })
          .then(function (data) {
            var styleEl = document.createElement('style');
            styleEl.textContent = buildStyles(theme);
            shadow.appendChild(styleEl);

            var wrapper = document.createElement('div');
            wrapper.innerHTML = renderCard(data);
            shadow.appendChild(wrapper);
          })
          .catch(function () {
            var styleEl = document.createElement('style');
            styleEl.textContent = buildStyles(theme);
            shadow.appendChild(styleEl);

            var errDiv = document.createElement('div');
            errDiv.innerHTML = '<div class="error">Profile not found</div>';
            shadow.appendChild(errDiv);
          });

        promises.push(promise);
      })(scripts[i]);
    }

    return Promise.all(promises);
  }

  window.initSifaEmbeds = initSifaEmbeds;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSifaEmbeds: initSifaEmbeds };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSifaEmbeds);
  } else {
    initSifaEmbeds();
  }
})();
