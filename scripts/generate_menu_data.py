#!/usr/bin/env python3
"""
generate_menu_data.py

Scans the repo for month folders (e.g. "July") containing pair subfolders
(e.g. "GBP", "EUR") full of dated report .html files, and writes a single
static JSON file (menu-data.json) describing that structure.

This runs inside GitHub Actions (which has authenticated, non-rate-limited
access to the repo), so the resulting JSON can be fetched by visitors'
browsers with zero calls to the GitHub API.

Output shape:
{
  "July": {
    "AUD": ["13-17.html"],
    "GBP": ["13-17.html"],
    ...
  },
  "August": { ... }
}
"""

import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PATH = os.path.join(REPO_ROOT, "menu-data.json")

# Folders at repo root that are NOT month folders — skip these.
IGNORE_DIRS = {".git", ".github", "node_modules", "__pycache__"}


def is_month_folder(name: str) -> bool:
    """A month folder is any top-level dir we're not explicitly ignoring
    that itself contains at least one subdirectory (a pair folder) or
    at least one .html file (a daily page)."""
    if name.startswith(".") or name in IGNORE_DIRS:
        return False
    return True


def build_menu_data() -> dict:
    data = {}

    for entry in sorted(os.listdir(REPO_ROOT)):
        full_path = os.path.join(REPO_ROOT, entry)
        if not os.path.isdir(full_path) or not is_month_folder(entry):
            continue

        pairs = {}
        for pair_entry in sorted(os.listdir(full_path)):
            pair_path = os.path.join(full_path, pair_entry)
            if not os.path.isdir(pair_path):
                continue  # skip loose files at the month level (e.g. daily homepage files)

            html_files = sorted(
                (f for f in os.listdir(pair_path) if f.endswith(".html")),
                reverse=True,  # newest first, matches menu.js expectations
            )
            if html_files:
                pairs[pair_entry] = html_files

        if pairs:
            data[entry] = pairs

    return data


def main():
    data = build_menu_data()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Wrote {OUTPUT_PATH} with {len(data)} month(s):")
    for month, pairs in data.items():
        print(f"  {month}: {len(pairs)} pair(s)")


if __name__ == "__main__":
    main()
