import { papers } from "./papers-loader";
import { staticAnalyzers } from "./analyzers-loader";
import type { PaperType } from "./constants";

// Techniques that make a tool "learning-based" (the ML wave); everything else is
// treated as classic static analysis.
const LEARNING = new Set([
  "Deep Learning (non-LLM)",
  "Graph Neural Network",
  "LLM-based",
]);

export interface PaperYearRow {
  year: number;
  tool: number;
  method: number;
  empirical: number;
  survey: number;
  motivation: number;
  total: number;
}

/** Papers grouped by publication year, split by paper type. */
export function papersByYear(): PaperYearRow[] {
  const byYear = new Map<number, PaperYearRow>();
  for (const p of papers) {
    if (typeof p.year !== "number") continue;
    let row = byYear.get(p.year);
    if (!row) {
      row = { year: p.year, tool: 0, method: 0, empirical: 0, survey: 0, motivation: 0, total: 0 };
      byYear.set(p.year, row);
    }
    if ((p.type as PaperType) in row) row[p.type as keyof PaperYearRow] = (row[p.type as keyof PaperYearRow] as number) + 1;
    row.total += 1;
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

export interface ToolYearRow {
  year: number;
  classic: number;
  learning: number;
  total: number;
}

/** Tools grouped by year of introduction, split classic vs learning-based. */
export function toolsByYearParadigm(): ToolYearRow[] {
  const byYear = new Map<number, ToolYearRow>();
  for (const t of staticAnalyzers) {
    if (typeof t.yearIntroduced !== "number") continue;
    let row = byYear.get(t.yearIntroduced);
    if (!row) {
      row = { year: t.yearIntroduced, classic: 0, learning: 0, total: 0 };
      byYear.set(t.yearIntroduced, row);
    }
    const isLearning = (t.techniques ?? []).some((x) => LEARNING.has(x));
    if (isLearning) row.learning += 1;
    else row.classic += 1;
    row.total += 1;
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

/** Latest year present in the data (partial — current year). */
export function latestYear(): number {
  return Math.max(...papers.map((p) => (typeof p.year === "number" ? p.year : 0)));
}
