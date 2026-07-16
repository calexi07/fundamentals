// menu.js
async function buildMenu() {
  const menu = document.getElementById("pair-menu");
  if (!menu) return;
  menu.innerHTML = "Loading menu...";

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
    const pairFolders = items.filter(i => i.type === "dir");

    const sections = [];

    for (const folder of pairFolders) {
      const pairRes = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folder.path}`
      );
      if (!pairRes.ok) continue;
      const files = await pairRes.json();

      const links = files
        .filter(f => f.name.endsWith(".html"))
        .sort((a, b) => b.name.localeCompare(a.name))
        .map(f => `<li><a href="${folder.name}/${f.name}">${f.name.replace(".html", "")}</a></li>`)
        .join("");

      if (links) sections.push(`<h3>${folder.name}</h3><ul>${links}</ul>`);
    }

    menu.innerHTML = sections.join("") || "<p>No pair folders found yet.</p>";
  } catch (e) {
    console.error(e);
    menu.innerHTML = "<p>Menu failed to load.</p>";
  }
}

buildMenu();
