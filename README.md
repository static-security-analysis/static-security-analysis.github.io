# AppSecHub

**An open, living catalogue of static security analysis tools and the research behind them.**

🔗 **Live:** https://static-security-analysis.github.io/

AppSecHub is the public companion to the *Static Security Analysis* survey — a
browsable, filterable collection of **254 static-analysis security tools** and
**385 research papers**, cross-linked and explorable through interactive graphs.
It is designed to stay alive: anyone can contribute a tool with a single YAML
file, and tool metadata (stars, maintenance) is refreshed from GitHub monthly.

## Features

- **Tool catalogue** — 254 tools with languages, licenses, techniques, soundness,
  maintenance status, weakness coverage (Seven Pernicious Kingdoms), and academic
  references. Filter by language, license, weakness, integration, provenance
  (OSS / academic / commercial), technique, soundness, maintenance, and ecosystem.
- **Papers** (`/papers`) — 385 papers (tool, method, empirical, survey,
  motivation), linked to the tools they present, compare, or mention.
- **Graph explorer** (`/graph`) — one force-directed view with **7 modes**:
  tool ↔ paper, baselines, co-authorship, technique co-occurrence, weakness
  coverage, citation network, and ecosystem.
- **Trends** (`/trends`) — papers per year by type, and tools per year split
  classic vs learning-based.
- **Research metrics** — “cited by / seminal” on papers, “baseline in N studies”
  on tools, surfaced from an OpenAlex-derived citation network.
- **Compare** (`/compare`) — side-by-side comparison of up to three tools.

## Repository layout

```
src/
  data/
    analyzers/*.yaml     # one file per tool (254)
    papers/*.yaml        # one file per paper (385)
    citations.json       # intra-corpus citation edges (from OpenAlex)
    github_stats.json    # live stars/maintenance overlay (refreshed monthly)
  lib/                   # loaders, graph builders, trends data
  pages/                 # routes: catalogue, tool, papers, graph, trends, submit…
  components/            # UI (filters, cards, navbar…)
scripts/
  refresh_github_stats.py  # refresh the GitHub-stats overlay
.github/workflows/
  refresh-github-stats.yml # monthly refresh → opens a PR
```

Data is loaded at build time via Vite's YAML plugin — **no code changes are
needed to add a tool or paper**, just a YAML file.

## Local development

Requires Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone git@github.com:static-security-analysis/static-security-analysis.github.io.git
cd static-security-analysis.github.io
npm install
npm run dev      # http://localhost:8080
```

Other scripts:

```sh
npm run build    # production build (also writes dist/404.html for SPA routing)
npm test         # data-integrity tests (vitest)
npm run lint     # eslint
```

## Contributing a tool

The easiest path is the in-app **[Submit a tool](https://static-security-analysis.github.io/submit)**
page, or open a pull request directly:

1. Create `src/data/analyzers/<id>.yaml` (the `id` field drives the URL `/tool/<id>`).
2. Follow the schema of an existing file (e.g. `src/data/analyzers/sonarqube.yaml`).

   **Required:** `id`, `name`, `description`, `languages` (list), `license`
   (`Open Source` | `Commercial` | `Freemium`), `website`, `features` (list).

   **Recommended:** `github`, `techniques` (list), `weaknesses`
   (`{ category, examples[] }`, categories align with the Seven Pernicious
   Kingdoms), `toolType` (`oss` | `academic` | `commercial`), `ecosystem`,
   `soundness` (`Sound` | `Unsound`), `maintenance` (`Active` | `Dormant` |
   `Stale`), `yearIntroduced`, `academicReferences`.

3. Run `npm test` to check integrity, open a PR. Once merged it appears on the
   homepage and at `/tool/<id>` automatically.

Papers work the same way, under `src/data/papers/` (see an existing file for the
`Paper` schema).

## Keeping the data fresh

Tool **stars** and **maintenance** status live in `src/data/github_stats.json`,
kept separate from the tool YAMLs so it survives data re-imports. Refresh it with:

```sh
GH_TOKEN=$(gh auth token) python3 scripts/refresh_github_stats.py
```

A monthly GitHub Action (`.github/workflows/refresh-github-stats.yml`) runs this
and opens a pull request with the updated file for review. After merging, run
`npm run deploy` to publish.

## Deployment

The site is served from the **`gh-pages`** branch (GitHub Pages → *Deploy from a
branch* → `gh-pages` / root). To publish:

```sh
npm run deploy   # builds and pushes dist/ to gh-pages
```

`main` holds the source; `gh-pages` holds the built site. The build copies
`index.html` → `404.html` so client-side routes (e.g. `/graph`) resolve on
GitHub Pages.

## Tech stack

Vite · React · TypeScript · Tailwind CSS · shadcn-ui · react-router · recharts ·
react-force-graph.

## License

This project is dual-licensed:

- **Code** — [MIT](./LICENSE).
- **Catalogue data** (`src/data/` — tools, papers, citation edges) — [Creative Commons Attribution 4.0 International (CC BY 4.0)](./src/data/LICENSE). Reuse is welcome with attribution to the AppSecHub / Static Security Analysis living collection.

Citation edges are derived from [OpenAlex](https://openalex.org) (CC0). Paper
abstracts remain the copyright of their original authors and publishers and are
not covered by the CC BY 4.0 grant.
