// /tool/embed.js
// This script injects the tool.html into any page with <div id="exif-tool"></div>

fetch("/tool/tool.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("exif-tool").innerHTML = html;

    // load the tool's CSS
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/tool/tool.css";
    document.head.appendChild(css);

    // load the tool's JS
    const js = document.createElement("script");
    js.src = "/tool/tool.js";
    document.body.appendChild(js);
  })
  .catch(err => {
    console.error("Error loading tool:", err);
  });
