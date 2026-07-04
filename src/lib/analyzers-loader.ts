import type { StaticAnalyzer, Language, License } from "./constants";
export type { StaticAnalyzer, Language, License } from "./constants";
export { languages, licenses } from "./constants";

// Eagerly import all analyzer YAML files at build time.
// The Vite YAML plugin turns each file into a plain object.
const analyzerFiles = import.meta.glob<StaticAnalyzer>(
  "../data/analyzers/*.yaml",
  {
    eager: true,
    import: "default",
  },
);

// Convert the imported map into a typed array of analyzers.
export const staticAnalyzers: StaticAnalyzer[] = Object.values(
  analyzerFiles,
);

/**
 * Rank other tools by similarity to `tool`: shared techniques and weakness
 * kingdoms count most, specialised ecosystems less. "General-purpose" is too
 * common to be a useful signal, so it is ignored.
 */
export function similarTools(tool: StaticAnalyzer, limit = 5): StaticAnalyzer[] {
  const tech = new Set(tool.techniques ?? []);
  const kingdoms = new Set((tool.weaknesses ?? []).map((w) => w.category));
  const eco = new Set((tool.ecosystem ?? []).filter((e) => e !== "General-purpose"));
  return staticAnalyzers
    .filter((a) => a.id !== tool.id)
    .map((a) => {
      let score = 0;
      for (const t of a.techniques ?? []) if (tech.has(t)) score += 2;
      for (const w of a.weaknesses ?? []) if (kingdoms.has(w.category)) score += 2;
      for (const e of a.ecosystem ?? []) if (eco.has(e)) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || (y.a.githubStars ?? 0) - (x.a.githubStars ?? 0))
    .slice(0, limit)
    .map((x) => x.a);
}

