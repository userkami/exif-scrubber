// embed.js - inject the tool into any page with <div id="exif-tool"></div>
(function () {
  const container = document.getElementById("exif-tool");
  if (!container) return;

  fetch("tool/tool.html")
    .then((r) => r.text())
    .then((html) => {
      container.innerHTML = html;

      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "tool/tool.css";
      document.head.appendChild(link);

      // Load scripts in correct order: piexifjs → jszip → tool.js
      const scripts = [
        "https://cdn.jsdelivr.net/npm/piexifjs",
        "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
        "tool/tool.js",
      ];

      (function loadNext(i) {
        if (i >= scripts.length) return;
        const s = document.createElement("script");
        s.src = scripts[i];
        s.onload = () => loadNext(i + 1);
        document.body.appendChild(s);
      })(0);
    })
    .catch((err) => {
      container.innerHTML =
        '<div style="color:#f87171">Tool failed to load.</div>';
      console.error("Failed to load tool:", err);
    });
})();
