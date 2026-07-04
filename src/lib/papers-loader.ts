import type { Paper } from "./constants";
import citationEdges from "../data/citations.json";
export type { Paper } from "./constants";
export { paperTypes, paperTypeLabel } from "./constants";

// Eagerly import all paper YAML files at build time (Vite YAML plugin -> objects).
const paperFiles = import.meta.glob<Paper>("../data/papers/*.yaml", {
  eager: true,
  import: "default",
});

export const papers: Paper[] = Object.values(paperFiles);

/** Papers that present a given tool id (for the tool detail "Presented in" section). */
export function papersForTool(toolId: string): Paper[] {
  return papers.filter((p) => p.presentsToolId === toolId);
}

/**
 * Papers that empirically study / compare against a tool without being its
 * defining paper (for the tool detail "Evaluated in" section).
 */
export function papersEvaluatingTool(toolId: string): Paper[] {
  return papers
    .filter(
      (p) =>
        p.presentsToolId !== toolId &&
        ((p.comparesToolIds?.includes(toolId) ?? false) ||
          (p.mentionsToolIds?.includes(toolId) ?? false))
    )
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

/** Look up a single paper by id. */
export function getPaper(id: string): Paper | undefined {
  return papers.find((p) => p.id === id);
}

// ---- Intra-corpus citation metrics (from OpenAlex, src/data/citations.json) ----
const _citedBy = new Map<string, number>();
const _cites = new Map<string, number>();
for (const [a, b] of citationEdges as [string, string][]) {
  _cites.set(a, (_cites.get(a) ?? 0) + 1);
  _citedBy.set(b, (_citedBy.get(b) ?? 0) + 1);
}
/** Papers cited-within-corpus at or above this are flagged "seminal". */
export const SEMINAL_MIN = 8;
export const citedByCount = (id: string) => _citedBy.get(id) ?? 0;
export const citesCount = (id: string) => _cites.get(id) ?? 0;
export const isSeminal = (id: string) => citedByCount(id) >= SEMINAL_MIN;

/** Number of catalogued studies that use a tool as an evaluation baseline. */
export const baselineCount = (toolId: string) =>
  papers.filter((p) => p.comparesToolIds?.includes(toolId)).length;
