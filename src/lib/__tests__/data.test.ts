import { describe, it, expect } from "vitest";
import { staticAnalyzers } from "../analyzers-loader";
import { papers } from "../papers-loader";
import citations from "../../data/citations.json";
import {
  licenses,
  soundnessValues,
  maintenanceValues,
  toolTypes,
  weaknessCategories,
  techniqueFamilies,
  paperTypes,
} from "../constants";

const tools = staticAnalyzers;
const toolIds = new Set(tools.map((t) => t.id));
const paperIds = new Set(papers.map((p) => p.id));

const has = (arr: readonly string[], v: string) => arr.includes(v);

describe("analyzer data integrity", () => {
  it("loads the full catalogue", () => {
    expect(tools.length).toBeGreaterThan(200);
  });

  it("has unique tool ids", () => {
    expect(toolIds.size).toBe(tools.length);
  });

  it("every tool has the required fields", () => {
    for (const t of tools) {
      expect(t.id, "id").toBeTruthy();
      expect(t.name?.trim(), `${t.id}: name`).toBeTruthy();
      expect(t.description?.trim(), `${t.id}: description`).toBeTruthy();
      expect(Array.isArray(t.languages), `${t.id}: languages`).toBe(true);
      expect(has(licenses, t.license), `${t.id}: license "${t.license}"`).toBe(true);
    }
  });

  it("every tool uses valid enum values", () => {
    for (const t of tools) {
      if (t.soundness)
        expect(has(soundnessValues, t.soundness), `${t.id}: soundness`).toBe(true);
      if (t.maintenance)
        expect(has(maintenanceValues, t.maintenance), `${t.id}: maintenance`).toBe(true);
      if (t.toolType)
        expect(has(toolTypes, t.toolType), `${t.id}: toolType`).toBe(true);
      for (const w of t.weaknesses ?? [])
        expect(has(weaknessCategories, w.category), `${t.id}: kingdom "${w.category}"`).toBe(true);
      for (const tech of t.techniques ?? [])
        expect(has(techniqueFamilies, tech), `${t.id}: technique "${tech}"`).toBe(true);
    }
  });
});

describe("paper data integrity", () => {
  it("loads the full corpus", () => {
    expect(papers.length).toBeGreaterThan(300);
  });

  it("has unique paper ids", () => {
    expect(paperIds.size).toBe(papers.length);
  });

  it("every paper has required fields and a valid type", () => {
    for (const p of papers) {
      expect(p.id, "id").toBeTruthy();
      expect(p.title?.trim(), `${p.id}: title`).toBeTruthy();
      expect(has(paperTypes, p.type), `${p.id}: type "${p.type}"`).toBe(true);
    }
  });
});

describe("cross-link integrity", () => {
  it("every paper→tool reference resolves to a real tool", () => {
    for (const p of papers) {
      if (p.presentsToolId)
        expect(toolIds.has(p.presentsToolId), `${p.id} presents "${p.presentsToolId}"`).toBe(true);
      for (const t of p.comparesToolIds ?? [])
        expect(toolIds.has(t), `${p.id} compares "${t}"`).toBe(true);
      for (const t of p.mentionsToolIds ?? [])
        expect(toolIds.has(t), `${p.id} mentions "${t}"`).toBe(true);
    }
  });

  it("every citation edge references existing papers", () => {
    for (const [a, b] of citations as [string, string][]) {
      expect(paperIds.has(a), `citing "${a}"`).toBe(true);
      expect(paperIds.has(b), `cited "${b}"`).toBe(true);
    }
  });
});
