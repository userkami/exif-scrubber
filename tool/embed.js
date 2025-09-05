// embed.js - inject the tool into any page with <div id="exif-tool"></div>
(function(){
  const container = document.getElementById('exif-tool');
  if(!container) return;

  fetch('tool/tool.html')
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;

      // load css
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'tool/tool.css';
      document.head.appendChild(link);

      // load js
      const script = document.createElement('script');
      script.src = 'tool/tool.js';
      document.body.appendChild(script);
    })
    .catch(err => {
      container.innerHTML = '<div style="color:#f87171">Tool failed to load.</div>';
      console.error('Failed to load tool:', err);
    });
})();
