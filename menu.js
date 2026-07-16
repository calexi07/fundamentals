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

    /* Card */
    #pair-menu .pm-group {
      position: relative;
    }
    #pair-menu .pm-card {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 9px 14px;
      cursor: pointer;
      user-select: none;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    #pair-menu .pm-group:hover .pm-card {
      border-color: #58a6ff;
      background: #1c2333;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    #pair-menu .pm-pair {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #79c0ff;
      text-transform: uppercase;
      white-space: nowrap;
    }
    #pair-menu .pm-count {
      font-size: 10.5px;
      font-weight: 700;
      color: #6e7681;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 20px;
      padding: 1px 7px;
      min-width: 16px;
      text-align: center;
    }
    #pair-menu .pm-chevron {
      color: #6e7681;
      font-size: 9px;
      transition: transform 0.15s ease, color 0.15s ease;
      margin-left: -2px;
    }
    #pair-menu .pm-group:hover .pm-chevron {
      color: #58a6ff;
      transform: rotate(180deg);
    }

    /* Dropdown — flush against the card, no dead zone between them */
    #pair-menu .pm-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 190px;
      background: #161b22;
      border: 1px solid #58a6ff;
      border-top: 1px solid #21262d;
      border-radius: 0 8px 10px 10px;
      padding: 10px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.5);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.14s ease;
      z-index: 20;
    }
    #pair-menu .pm-group:hover .pm-dropdown {
      opacity: 1;
      pointer-events: auto;
    }
    #pair-menu .pm-dropdown-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6e7681;
      padding: 2px 6px 8px 6px;
      border-bottom: 1px solid #21262d;
      margin-bottom: 6px;
    }
    #pair-menu .pm-dropdown ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
      max-height: 260px;
      overflow-y: auto;
    }
    #pair-menu .pm-dropdown li a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 7px 10px;
      font-size: 13px;
      font-weight: 600;
      color: #c9d1d9;
      background: transparent;
      border-radius: 6px;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.12s ease, color 0.12s ease, padding-left 0.12s ease;
      border-left: 2px solid transparent;
    }
    #pair-menu .pm-dropdown li a:hover {
      background: #21262d;
      color: #fff;
      padding-left: 13px;
    }
    #pair-menu .pm-dropdown li.pm-latest a {
      border-left-color: #3fb950;
      color: #3fb950;
    }
    #pair-menu .pm-dropdown li.pm-latest a:hover {
      background: #0f3d1f;
      color: #56d364;
    }
    #pair-menu .pm-dropdown li.pm-latest a .pm-tag {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #3fb950;
      background: #0f3d1f;
      border: 1px solid #1f6feb33;
      border-radius: 10px;
      padding: 1px 6px;
    }
    #pair-menu .pm-dropdown li.pm-hidden {
      display: none;
    }

    #pair-menu .pm-see-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 100%;
      margin-top: 8px;
      padding: 7px 10px;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #58a6ff;
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.12s ease, border-color 0.12s ease;
    }
    #pair-menu .pm-see-more:hover {
      border-color: #58a6ff;
      background: #11182a;
    }

    #pair-menu .pm-empty, #pair-menu .pm-error {
      color: #8b949e;
      font-size: 13px;
      padding: 4px;
    }
    #pair-menu .pm-error { color: #ff7b72; }
    #pair-menu .pm-warning {
      width: 100%;
      color: #e3b341;
      font-size: 12px;
      background: #2b2410;
      border: 1px solid #e3b34155;
      border-radius: 6px;
      padding: 6px 10px;
    }
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
  const remaining = dropdown.querySelectorAll("li.pm-hidden").length;
  if (remaining === 0) {
    btn.remove();
  } else {
    btn.innerHTML = `See more (${remaining})`;
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

  const failedPairs = [];

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
      if (!pairRes.ok) {
        console.warn(`menu.js: failed to load ${folder.path} — HTTP ${pairRes.status}`, await pairRes.json().catch(() => null));
        failedPairs.push(`${folder.name} (${pairRes.status})`);
        continue;
      }
      const files = await pairRes.json();

      const sorted = files
        .filter(f => f.name.endsWith(".html"))
        .sort((a, b) => b.name.localeCompare(a.name)); // newest first

      if (!sorted.length) continue;

      const listItems = sorted
        .map((f, idx) => {
          const label = f.name.replace(".html", "");
          const hiddenClass = idx >= PM_PAGE_SIZE ? "pm-hidden" : "";
          const isLatest = idx === 0;
          const tag = isLatest ? `<span class="pm-tag">Latest</span>` : "";
          return `<li class="${isLatest ? "pm-latest" : ""} ${hiddenClass}"><a href="${folder.name}/${f.name}"><span>${label}</span>${tag}</a></li>`;
        })
        .join("");

      const needsSeeMore = sorted.length > PM_PAGE_SIZE;
      const seeMoreBtn = needsSeeMore
        ? `<button type="button" class="pm-see-more" onclick="pmRevealNext(this)">See more (${sorted.length - PM_PAGE_SIZE})</button>`
        : "";

      groups.push(`
        <div class="pm-group">
          <div class="pm-card">
            <span class="pm-pair">${folder.name}</span>
            <span class="pm-count">${sorted.length}</span>
            <span class="pm-chevron">&#9660;</span>
          </div>
          <div class="pm-dropdown">
            <div class="pm-dropdown-label">Reports</div>
            <ul>${listItems}</ul>
            ${seeMoreBtn}
          </div>
        </div>
      `);
    }

    let html = groups.join("") || `<span class="pm-empty">No pair folders found yet.</span>`;
    if (failedPairs.length) {
      html += `<div class="pm-warning">⚠ Couldn't load: ${failedPairs.join(", ")} — likely GitHub API rate limit. Wait a bit and reload (check console for details).</div>`;
    }
    menu.innerHTML = html;
  } catch (e) {
    console.error(e);
    menu.innerHTML = `<span class="pm-error">Menu failed to load: ${e.message} (see console for details)</span>`;
  }
}

buildMenu();
