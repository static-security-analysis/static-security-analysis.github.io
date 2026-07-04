# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7fea26ae-0dbd-463a-9247-0a97778d0365

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7fea26ae-0dbd-463a-9247-0a97778d0365) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Adding a new static analyzer

Analyzer data lives in **one YAML file per tool** under `src/data/analyzers/`. To add a new tool:

1. **Create a new YAML file** in `src/data/analyzers/` named after the tool’s ID (e.g. `my-tool.yaml`). The filename (without `.yaml`) is not used for routing; the `id` field inside the file is.

2. **Follow the schema** used by existing files (e.g. `src/data/analyzers/sonarqube.yaml`). Required fields:
   - `id` – unique slug (used in URLs, e.g. `/tool/my-tool`)
   - `name` – display name
   - `description` – short description (string)
   - `languages` – list of supported languages (use values from the filter list, e.g. `JavaScript`, `TypeScript`, `Multiple`)
   - `license` – one of: `Open Source`, `Commercial`, `Freemium`
   - `website` – URL
   - `features` – list of feature strings
   - `integration` – list of integration names

   Optional:
   - `github` – repository URL
   - `weaknesses` – list of `{ category: string, examples: string[] }` (categories align with the Seven Pernicious Kingdoms taxonomy)
   - `academicReferences` – list of `{ title, authors[], year, link, type, publication?, doi? }` where `type` is `Academic Paper`, `White Paper`, or `Blog Post`

3. **No code changes are required.** The app loads all `*.yaml` files in `src/data/analyzers/` at build time; your new file will appear on the homepage and at `/tool/<id>` automatically.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7fea26ae-0dbd-463a-9247-0a97778d0365) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## License

This project is dual-licensed:

- **Code** — [MIT](./LICENSE).
- **Catalogue data** (`src/data/` — tools, papers, citation edges) — [Creative Commons Attribution 4.0 International (CC BY 4.0)](./src/data/LICENSE). Reuse is welcome with attribution to the AppSecHub / Static Security Analysis living collection.

Citation edges are derived from [OpenAlex](https://openalex.org) (CC0). Paper abstracts remain the copyright of their original authors and publishers and are not covered by the CC BY 4.0 grant.
