// menu.js
(function injectMenuStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #pair-menu {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0 0 28px 0;
      padding: 16px;
      background: #0f1520;
      border: 1px solid #30363d;
      border-radius: 10px;
    }
    #pair-menu .pm-group {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 6px 8px 6px 12px;
    }
    #pair-menu .pm-pair {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #79c0ff;
      text-transform: uppercase;
      white-space: nowrap;
    }
    #pair-menu .pm-links {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    #pair-menu .pm-links a {
      display: inline-block;
      padding: 4px 10px;
      font-size: 12.5px;
      font-weight: 600;
      color: #c9d1d9;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 20px;
      text-decoration: none;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    #pair-menu .pm-links a:hover {
      background: #2f81f7;
      border-color: #2f81f7;
      color: #fff;
    }
    #pair-menu .pm-links a.pm-latest {
      background: #0f3d1f;
      border-color: #3fb950;
      color: #3fb950;
    }
    #pair-menu .pm-links a.pm-latest:hover {
      background: #3fb950;
      color: #0d1117;
    }
    #pair-menu .pm-empty, #pair-menu .pm-error {
      color: #8b949e;
      font-size: 13px;
      padding: 4px;
    }
    #pair-menu .pm-error { color: #ff7b72; }
  `;
  document.head.appendChild(style);
})();

async function buildMenu() {
  const menu = document.getElementById("pair-menu");
  if (!menu) return;
  menu.innerHTML = `<span class="pm-empty">Loading menu…</span>`;

  const OWNER = "calexi07";
  const REPO = "fundamentals";

  const parts = window.location.pathname.split("/").filter(Boolean);
  parts.shift(); // drop "fundamentals" (repo name / first path segment)
  parts.pop();   // drop the filename, e.g. "16.07.2026.html"
  const MONTH_PATH = parts.join("/"); // -> "July"

  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${MONTH_PATH}`
    );
    if (!res.ok) throw new Error(`Could not load ${MONTH_PATH} (${res.status})`);
    const items = await res.json();
    const pairFolders = items.filter(i => i.type === "dir").sort((a, b) => a.name.localeCompare(b.name));

    const groups = [];

    for (const folder of pairFolders) {
      const pairRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folder.path}`
      );
      if (!pairRes.ok) continue;
      const files = await pairRes.json();

      const sorted = files
        .filter(f => f.name.endsWith(".html"))
        .sort((a, b) => b.name.localeCompare(a.name)); // newest first

      if (!sorted.length) continue;

      const links = sorted
        .map((f, idx) => {
          const label = f.name.replace(".html", "");
          const cls = idx === 0 ? "pm-latest" : "";
          return `<a href="${folder.name}/${f.name}" class="${cls}">${label}</a>`;
        })
        .join("");

      groups.push(
        `<div class="pm-group"><span class="pm-pair">${folder.name}</span><span class="pm-links">${links}</span></div>`
      );
    }

    menu.innerHTML = groups.join("") || `<span class="pm-empty">No pair folders found yet.</span>`;
  } catch (e) {
    console.error(e);
    menu.innerHTML = `<span class="pm-error">Menu failed to load.</span>`;
  }
}

buildMenu();
