#!/usr/bin/env python3
"""Refresh live GitHub stats for catalogue tools.

Reads `src/data/analyzers/*.yaml`, and for every tool with a GitHub repo queries
the GitHub API for stars, last push, and archived status, deriving a maintenance
status. Writes `src/data/github_stats.json` — kept SEPARATE from the tool YAMLs so
it survives re-migration from the survey and produces a one-file diff.

Auth: uses `GITHUB_TOKEN` / `GH_TOKEN` env (as in GitHub Actions), else falls back
to `gh auth token`. Run: `python scripts/refresh_github_stats.py`.
"""
import glob, json, os, re, subprocess, sys, time, urllib.error, urllib.request
from datetime import datetime, timezone

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANALYZERS = os.path.join(ROOT, "src/data/analyzers")
OUT = os.path.join(ROOT, "src/data/github_stats.json")

# github.com paths that are not repositories
NON_REPO = {"marketplace", "sponsors", "features", "about", "topics", "orgs", "settings"}


def get_token():
    for env in ("GITHUB_TOKEN", "GH_TOKEN"):
        if os.environ.get(env):
            return os.environ[env]
    try:
        return subprocess.check_output(["gh", "auth", "token"], text=True).strip()
    except Exception:
        return None


def repo_of(tool):
    for key in ("github", "website"):
        url = (tool.get(key) or "").strip()
        m = re.search(r"github\.com/([^/\s]+)/([^/\s#?]+?)(?:\.git)?(?:[/#?].*)?$", url)
        if m and m.group(1).lower() not in NON_REPO:
            return f"{m.group(1)}/{m.group(2)}"
    return None


def maintenance_from(pushed_at, archived):
    if archived:
        return "Stale"
    if not pushed_at:
        return None
    dt = datetime.fromisoformat(pushed_at.replace("Z", "+00:00"))
    months = (datetime.now(timezone.utc) - dt).days / 30.4
    if months <= 12:
        return "Active"
    if months <= 24:
        return "Dormant"
    return "Stale"


def fetch(repo, token):
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "appsechub-refresh",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def main():
    token = get_token()
    if not token:
        sys.exit("No GitHub token (set GITHUB_TOKEN or run `gh auth login`).")

    tools = []
    for f in sorted(glob.glob(f"{ANALYZERS}/*.yaml")):
        d = yaml.safe_load(open(f, encoding="utf-8"))
        repo = repo_of(d)
        if repo:
            tools.append((d["id"], repo))

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"Refreshing {len(tools)} tools with GitHub repos…", file=sys.stderr)
    stats, moved = {}, []
    for i, (tid, repo) in enumerate(tools):
        try:
            j = fetch(repo, token)
        except urllib.error.HTTPError as e:
            if e.code in (404, 451):
                moved.append(f"{tid} ({repo})")
            else:
                print(f"  {tid}: HTTP {e.code}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"  {tid}: {e}", file=sys.stderr)
            continue
        pushed = j.get("pushed_at")
        stats[tid] = {
            "repo": repo,
            "stars": j.get("stargazers_count"),
            "pushedAt": pushed,
            "archived": bool(j.get("archived")),
            "maintenance": maintenance_from(pushed, j.get("archived")),
            "checkedAt": today,
        }
        if (i + 1) % 25 == 0:
            print(f"  {i + 1}/{len(tools)}", file=sys.stderr)
        time.sleep(0.05)

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(dict(sorted(stats.items())), fh, indent=1)
        fh.write("\n")
    print(f"Wrote {OUT}: {len(stats)} refreshed, {len(moved)} not found.")
    if moved:
        print("Not found (repo moved/removed):", ", ".join(moved[:10]))


if __name__ == "__main__":
    main()
