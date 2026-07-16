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
      position: relative;
    }
    #pair-menu .pm-group {
      position: relative;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: default;
    }
    #pair-menu .pm-group:hover {
      border-color: #58a6ff;
    }
    #pair-menu .pm-pair {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #79c0ff;
      text-transform: uppercase;
      white-space: nowrap;
    }
    #pair-menu .pm-pair .pm-latest-badge {
      font-size: 11px;
      font-weight: 700;
      color: #3fb950;
      background: #0f3d1f;
      border: 1px solid #3fb950;
      border-radius: 20px;
      padding: 2px 9px;
      text-decoration: none;
      text-transform: none;
      letter-spacing: normal;
    }
    #pair-menu .pm-pair .pm-latest-badge:hover {
      background: #3fb950;
      color: #0d1117;
    }
    #pair-menu .pm-pair .pm-count {
      color: #8b949e;
      font-weight: 500;
      font-size: 11px;
    }

    /* Dropdown */
    #pair-menu .pm-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 160px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      opacity: 0;
      transform: translateY(-4px);
      pointer-events: none;
      transition: opacity 0.12s ease, transform 0.12s ease;
      z-index: 20;
    }
    #pair-menu .pm-group:hover .pm-dropdown,
    #pair-menu .pm-dropdown.pm-pinned {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    #pair-menu .pm-dropdown ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    #pair-menu .pm-dropdown li a {
      display: block;
      padding: 5px 10px;
      font-size: 12.5px;
      font-weight: 600;
      color: #c9d1d9;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }
    #pair-menu .pm-dropdown li a:hover {
      background: #2f81f7;
      border-color: #2f81f7;
      color: #fff;
    }
    #pair-menu .pm-dropdown li.pm-hidden {
      display: none;
    }
    #pair-menu .pm-see-more {
      display: block;
      width: 100%;
      margin-top: 6px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #79c0ff;
      background: transparent;
      border: 1px dashed #30363d;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
    }
    #pair-menu .pm-see-more:hover {
      border-color: #58a6ff;
      color: #58a6ff;
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

const PM_PAGE_SIZE = 10;

function pmRevealNext(btn) {
  const dropdown = btn.closest(".pm-dropdown");
  const hiddenItems = dropdown.querySelectorAll("li.pm-hidden");
  let toReveal = PM_PAGE_SIZE;
  hiddenItems.forEach(li => {
    if (toReveal > 0) {
      li.classList.remove("pm-hidden");
      toReveal--;
    }
  });
  if (dropdown.querySelectorAll("li.pm-hidden").length === 0) {
    btn.remove();
  }
}

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

      const latest = sorted[0];
      const latestLabel = latest.name.replace(".html", "");

      const listItems = sorted
        .map((f, idx) => {
          const label = f.name.replace(".html", "");
          const hiddenClass = idx >= PM_PAGE_SIZE ? "pm-hidden" : "";
          return `<li class="${hiddenClass}"><a href="${folder.name}/${f.name}">${label}</a></li>`;
        })
        .join("");

      const needsSeeMore = sorted.length > PM_PAGE_SIZE;
      const seeMoreBtn = needsSeeMore
        ? `<button type="button" class="pm-see-more" onclick="pmRevealNext(this)">See more (${sorted.length - PM_PAGE_SIZE})</button>`
        : "";

      groups.push(`
        <div class="pm-group">
          <div class="pm-pair">
            ${folder.name}
            <a class="pm-latest-badge" href="${folder.name}/${latest.name}">${latestLabel}</a>
            <span class="pm-count">${sorted.length}</span>
          </div>
          <div class="pm-dropdown">
            <ul>${listItems}</ul>
            ${seeMoreBtn}
          </div>
        </div>
      `);
    }

    menu.innerHTML = groups.join("") || `<span class="pm-empty">No pair folders found yet.</span>`;
  } catch (e) {
    console.error(e);
    menu.innerHTML = `<span class="pm-error">Menu failed to load.</span>`;
  }
}

buildMenu();
