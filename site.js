// Fills in the download buttons from GitHub's latest release, so the site never needs editing for a new version.
// No tracking: the only request is to GitHub's public API.
const LAUNCHER_REPOS = ['onedeck-launcher/onedeck', 'goodthanksdev/harbour'];  // where OneDeck's releases are (first found wins)
const isLinux = /linux/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent) && !/android/i.test(navigator.userAgent);
const all = s => [...document.querySelectorAll(s)];

async function downloads() {
  for (const repo of LAUNCHER_REPOS) {
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
      if (!r.ok) continue;
      const rel = await r.json();
      const win = rel.assets.find(a => /onedeck.*win64\.zip$/i.test(a.name)), lin = rel.assets.find(a => /onedeck.*x86_64\.appimage$/i.test(a.name));
      if (!win && !lin) continue;
      const first = (isLinux ? lin : win) || win || lin, second = first === win ? lin : win;
      const label = a => a === win ? 'Windows' : 'Linux';
      for (const a of all('.dlMain')) { a.href = first.browser_download_url; a.textContent = `Download for ${label(first)}`; }
      for (const a of all('.dlOther')) { if (second) { a.href = second.browser_download_url; a.textContent = label(second); a.hidden = false; } }
      for (const p of all('.dlNote')) p.textContent = `Version ${rel.tag_name.replace(/^v/, '')}. Free and open source. No account, no tracking.`;
      // On Linux before there's an AppImage: say it's on its way (the button gives the Windows one).
      if (isLinux && !lin) for (const p of all('.dlNote')) p.textContent = `Version ${rel.tag_name.replace(/^v/, '')} is out for Windows. The Linux version is coming soon.`;
      return;
    } catch {}
  }
  // No OneDeck release yet.
  for (const a of all('.dlMain')) { a.textContent = 'Coming soon'; a.classList.add('off'); }
  for (const p of all('.dlNote')) p.innerHTML = 'Windows and Linux supported. Free and open source. <a href="https://github.com/onedeck-launcher">Follow on GitHub</a>';
}
downloads();

// Ports page: each port's current version under its Download button.
for (const p of all('.portVer')) fetch(`https://api.github.com/repos/${p.dataset.repo}/releases/latest`)
  .then(r => r.ok ? r.json() : null).then(rel => { if (rel?.tag_name) p.textContent = `Version ${rel.tag_name.replace(/^v/, '')} for Windows. Bring your own copy of the game.`; }).catch(() => {});
