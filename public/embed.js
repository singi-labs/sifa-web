(function () {
  "use strict";

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  }

  function getBaseUrl(scriptEl) {
    var src = scriptEl.getAttribute("src") || "";
    try {
      var url = new URL(src);
      return url.origin;
    } catch (e) {
      return "https://sifa.id";
    }
  }

  function buildStyles(theme) {
    var lightVars =
      "--sifa-bg:#fff;--sifa-card:#fff;--sifa-text:#111;--sifa-muted:#666;--sifa-border:#e5e5e5;--sifa-primary:#6366f1;";
    var darkVars =
      "--sifa-bg:#1a1a2e;--sifa-card:#16213e;--sifa-text:#eee;--sifa-muted:#888;--sifa-border:#333;--sifa-primary:#6366f1;";

    var themeBlock = "";
    if (theme === "dark") {
      themeBlock = ":host{" + darkVars + "}";
    } else if (theme === "light") {
      themeBlock = ":host{" + lightVars + "}";
    } else {
      themeBlock =
        ":host{" +
        lightVars +
        "}@media(prefers-color-scheme:dark){:host{" +
        darkVars +
        "}}";
    }

    return (
      themeBlock +
      ":host{display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--sifa-text);}" +
      ".card{background:var(--sifa-card);border:1px solid var(--sifa-border);border-radius:12px;padding:20px;max-width:400px;}" +
      ".header{display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit;}" +
      ".avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;}" +
      ".avatar-placeholder{width:48px;height:48px;border-radius:50%;background:var(--sifa-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;}" +
      ".name{font-size:16px;font-weight:600;margin:0;}" +
      ".handle{font-size:13px;color:var(--sifa-muted);margin:0;}" +
      ".headline{font-size:14px;color:var(--sifa-muted);margin:8px 0 0;}" +
      ".location{font-size:13px;color:var(--sifa-muted);margin:4px 0 0;}" +
      ".open-to{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0;}" +
      ".pill{font-size:12px;padding:3px 10px;border-radius:12px;background:var(--sifa-primary);color:#fff;}" +
      ".stats{display:flex;gap:16px;margin:12px 0 0;}" +
      ".stat{text-align:center;}" +
      ".stat-value{font-size:18px;font-weight:700;display:block;}" +
      ".stat-label{font-size:11px;color:var(--sifa-muted);}" +
      ".footer{margin-top:14px;padding-top:12px;border-top:1px solid var(--sifa-border);}" +
      ".cta{display:inline-block;font-size:13px;color:var(--sifa-primary);text-decoration:none;font-weight:500;}" +
      ".cta:hover{text-decoration:underline;}" +
      ".error{font-size:14px;color:var(--sifa-muted);padding:16px;text-align:center;}"
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
      var letter = (data.displayName || data.handle || "?").charAt(0).toUpperCase();
      avatarHtml = '<div class="avatar-placeholder">' + escapeHtml(letter) + "</div>";
    }

    var headerHtml =
      '<a class="header" href="' +
      escapeHtml(data.profileUrl) +
      '" target="_blank" rel="noopener">' +
      avatarHtml +
      "<div>" +
      '<p class="name">' +
      escapeHtml(data.displayName || data.handle) +
      "</p>" +
      '<p class="handle">@' +
      escapeHtml(data.handle) +
      "</p>" +
      "</div></a>";

    var headlineHtml = data.headline
      ? '<div class="headline">' + escapeHtml(data.headline) + "</div>"
      : "";

    var locationHtml = data.location
      ? '<div class="location">' + escapeHtml(data.location) + "</div>"
      : "";

    var openToHtml = "";
    if (data.openTo && data.openTo.length > 0) {
      var pills = "";
      for (var i = 0; i < data.openTo.length; i++) {
        pills += '<span class="pill">' + escapeHtml(data.openTo[i]) + "</span>";
      }
      openToHtml = '<div class="open-to">' + pills + "</div>";
    }

    var statsHtml = "";
    if (data.trustStats && data.trustStats.length > 0) {
      var items = "";
      var max = Math.min(data.trustStats.length, 3);
      for (var j = 0; j < max; j++) {
        var s = data.trustStats[j];
        items +=
          '<div class="stat">' +
          '<span class="stat-value">' +
          escapeHtml(String(s.value)) +
          "</span>" +
          '<span class="stat-label">' +
          escapeHtml(s.label) +
          "</span>" +
          "</div>";
      }
      statsHtml = '<div class="stats">' + items + "</div>";
    }

    var footerHtml =
      '<div class="footer">' +
      '<a class="cta" href="' +
      escapeHtml(data.profileUrl) +
      '" target="_blank" rel="noopener">View on Sifa</a>' +
      "</div>";

    return (
      '<div class="card">' +
      headerHtml +
      headlineHtml +
      locationHtml +
      openToHtml +
      statsHtml +
      footerHtml +
      "</div>"
    );
  }

  function initSifaEmbeds() {
    var scripts = document.querySelectorAll("script[src*='embed.js']");
    var promises = [];

    for (var i = 0; i < scripts.length; i++) {
      (function (scriptEl) {
        var did = scriptEl.getAttribute("data-did");
        var handle = scriptEl.getAttribute("data-handle");
        var identifier = did || handle;
        if (!identifier) return;

        var theme = scriptEl.getAttribute("data-theme") || "auto";
        var baseUrl = getBaseUrl(scriptEl);
        var apiUrl = baseUrl + "/api/embed/" + encodeURIComponent(identifier) + "/data";

        var container = document.createElement("div");
        container.className = "sifa-embed";
        var shadow = container.attachShadow({ mode: "open" });

        scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);

        var promise = fetch(apiUrl)
          .then(function (res) {
            if (!res.ok) throw new Error("Not found");
            return res.json();
          })
          .then(function (data) {
            var styleEl = document.createElement("style");
            styleEl.textContent = buildStyles(theme);
            shadow.appendChild(styleEl);

            var wrapper = document.createElement("div");
            wrapper.innerHTML = renderCard(data);
            shadow.appendChild(wrapper);
          })
          .catch(function () {
            var styleEl = document.createElement("style");
            styleEl.textContent = buildStyles(theme);
            shadow.appendChild(styleEl);

            var errDiv = document.createElement("div");
            errDiv.innerHTML = '<div class="error">Profile not found</div>';
            shadow.appendChild(errDiv);
          });

        promises.push(promise);
      })(scripts[i]);
    }

    return Promise.all(promises);
  }

  window.initSifaEmbeds = initSifaEmbeds;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { initSifaEmbeds: initSifaEmbeds };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSifaEmbeds);
  } else {
    initSifaEmbeds();
  }
})();
