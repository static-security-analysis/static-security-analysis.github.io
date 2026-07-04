import { staticAnalyzers } from "./analyzers-loader";
import { papers } from "./papers-loader";
import { weaknessCategories } from "./constants";
import type { PaperType } from "./constants";
import citationEdges from "../data/citations.json";

export type LinkKind = "presents" | "compares" | "mentions";

export interface GraphNode {
  id: string;
  kind: "tool" | "paper" | "author" | "kingdom" | "technique" | "ecosystem";
  routeId: string;
  label: string;
  paperType?: PaperType;
  degree: number; // tool/paper: link degree; author: papers; kingdom/technique/ecosystem: tools
}

export interface GraphLink {
  source: string;
  target: string;
  kind: LinkKind;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Bipartite tool <-> paper graph. Edges: a paper presents / compares-against /
 * mentions a catalogued tool. Only connected nodes (degree >= 1) are included.
 */
export function buildGraph(): GraphData {
  const toolIds = new Set(staticAnalyzers.map((t) => t.id));
  const links: GraphLink[] = [];
  const add = (paperId: string, toolId: string, kind: LinkKind) => {
    if (toolIds.has(toolId)) {
      links.push({ source: `paper:${paperId}`, target: `tool:${toolId}`, kind });
    }
  };
  for (const p of papers) {
    if (p.presentsToolId) add(p.id, p.presentsToolId, "presents");
    p.comparesToolIds?.forEach((t) => add(p.id, t, "compares"));
    p.mentionsToolIds?.forEach((t) => add(p.id, t, "mentions"));
  }

  const degree: Record<string, number> = {};
  for (const l of links) {
    degree[l.source] = (degree[l.source] ?? 0) + 1;
    degree[l.target] = (degree[l.target] ?? 0) + 1;
  }

  const nodes: GraphNode[] = [];
  for (const t of staticAnalyzers) {
    const id = `tool:${t.id}`;
    if (degree[id]) {
      nodes.push({ id, kind: "tool", routeId: t.id, label: t.name, degree: degree[id] });
    }
  }
  for (const p of papers) {
    const id = `paper:${p.id}`;
    if (degree[id]) {
      nodes.push({
        id,
        kind: "paper",
        routeId: p.id,
        label: p.title,
        paperType: p.type,
        degree: degree[id],
      });
    }
  }
  return { nodes, links };
}

export interface BaselineLink {
  source: string;
  target: string;
  weight: number; // number of papers co-evaluating the two tools
}

/**
 * Tool <-> tool "baseline" network: two tools are connected when a paper
 * evaluates them together (the presenting tool + its comparison baselines, or
 * all tools compared in an empirical study). Edge weight = number of such papers.
 * Weighted degree surfaces the de-facto baselines (e.g. FlowDroid).
 */
export function buildBaselineGraph(): { nodes: GraphNode[]; links: BaselineLink[] } {
  const toolIds = new Set(staticAnalyzers.map((t) => t.id));
  const pairCount = new Map<string, number>();
  const addPair = (a: string, b: string) => {
    if (a === b) return;
    const [x, y] = a < b ? [a, b] : [b, a];
    const k = `${x}|${y}`;
    pairCount.set(k, (pairCount.get(k) ?? 0) + 1);
  };
  for (const p of papers) {
    const set = new Set<string>();
    if (p.presentsToolId && toolIds.has(p.presentsToolId)) set.add(p.presentsToolId);
    p.comparesToolIds?.forEach((t) => toolIds.has(t) && set.add(t));
    const arr = [...set];
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++) addPair(arr[i], arr[j]);
  }
  const links: BaselineLink[] = [];
  const wdeg: Record<string, number> = {};
  pairCount.forEach((w, k) => {
    const [a, b] = k.split("|");
    const s = `tool:${a}`;
    const t = `tool:${b}`;
    links.push({ source: s, target: t, weight: w });
    wdeg[s] = (wdeg[s] ?? 0) + w;
    wdeg[t] = (wdeg[t] ?? 0) + w;
  });
  const nodes: GraphNode[] = [];
  for (const t of staticAnalyzers) {
    const id = `tool:${t.id}`;
    if (wdeg[id]) {
      nodes.push({ id, kind: "tool", routeId: t.id, label: t.name, degree: wdeg[id] });
    }
  }
  return { nodes, links };
}

/**
 * Co-authorship network: authors linked when they share a paper (weight =
 * shared papers). Node `degree` = number of papers by that author. Filter by a
 * minimum paper count in the UI to keep it navigable.
 */
export function buildCoauthorGraph(): { nodes: GraphNode[]; links: BaselineLink[] } {
  const paperCount = new Map<string, number>();
  const pairs = new Map<string, number>();
  for (const p of papers) {
    const uniq = [...new Set((p.authors ?? []).map((a) => a.trim()).filter(Boolean))];
    uniq.forEach((a) => paperCount.set(a, (paperCount.get(a) ?? 0) + 1));
    for (let i = 0; i < uniq.length; i++)
      for (let j = i + 1; j < uniq.length; j++) {
        const [x, y] = uniq[i] < uniq[j] ? [uniq[i], uniq[j]] : [uniq[j], uniq[i]];
        const k = `${x}|${y}`;
        pairs.set(k, (pairs.get(k) ?? 0) + 1);
      }
  }
  const links: BaselineLink[] = [];
  pairs.forEach((w, k) => {
    const [x, y] = k.split("|");
    links.push({ source: `author:${x}`, target: `author:${y}`, weight: w });
  });
  const nodes: GraphNode[] = [];
  paperCount.forEach((c, name) =>
    nodes.push({ id: `author:${name}`, kind: "author", routeId: name, label: name, degree: c })
  );
  return { nodes, links };
}

/**
 * Weakness-coverage bipartite graph: each catalogued weakness kingdom linked to
 * the tools that detect it. Kingdom node size = number of covering tools, so the
 * under-served kingdoms (RQ2 gaps) show up as small hubs.
 */
export function buildCoverageGraph(): {
  nodes: GraphNode[];
  links: { source: string; target: string }[];
} {
  const kCount = new Map<string, number>();
  const links: { source: string; target: string }[] = [];
  const usedTools = new Set<string>();
  for (const t of staticAnalyzers) {
    for (const w of t.weaknesses ?? []) {
      links.push({ source: `kingdom:${w.category}`, target: `tool:${t.id}` });
      kCount.set(w.category, (kCount.get(w.category) ?? 0) + 1);
      usedTools.add(t.id);
    }
  }
  const nodes: GraphNode[] = [];
  for (const k of weaknessCategories) {
    nodes.push({ id: `kingdom:${k}`, kind: "kingdom", routeId: k, label: k, degree: kCount.get(k) ?? 0 });
  }
  for (const t of staticAnalyzers) {
    if (usedTools.has(t.id)) {
      nodes.push({
        id: `tool:${t.id}`,
        kind: "tool",
        routeId: t.id,
        label: t.name,
        degree: t.weaknesses?.length ?? 0,
      });
    }
  }
  return { nodes, links };
}

/**
 * Technique co-occurrence graph: two technique families linked when a tool uses
 * both (weight = number of such tools). Node `degree` = tools using the technique.
 * Reveals which techniques combine (e.g. GNN + graph-based, taint + data-flow).
 */
export function buildTechniqueGraph(): { nodes: GraphNode[]; links: BaselineLink[] } {
  const freq = new Map<string, number>();
  const pairs = new Map<string, number>();
  for (const t of staticAnalyzers) {
    const techs = [...new Set(t.techniques ?? [])];
    techs.forEach((x) => freq.set(x, (freq.get(x) ?? 0) + 1));
    for (let i = 0; i < techs.length; i++)
      for (let j = i + 1; j < techs.length; j++) {
        const [a, b] = techs[i] < techs[j] ? [techs[i], techs[j]] : [techs[j], techs[i]];
        const k = `${a}|${b}`;
        pairs.set(k, (pairs.get(k) ?? 0) + 1);
      }
  }
  const links: BaselineLink[] = [];
  pairs.forEach((w, k) => {
    const [a, b] = k.split("|");
    links.push({ source: `tech:${a}`, target: `tech:${b}`, weight: w });
  });
  const nodes: GraphNode[] = [];
  freq.forEach((c, name) =>
    nodes.push({ id: `tech:${name}`, kind: "technique", routeId: name, label: name, degree: c })
  );
  return { nodes, links };
}

/**
 * Citation network among the corpus papers (directed A cites B), from OpenAlex
 * intra-corpus references (`src/data/citations.json`). Node `degree` = citations
 * received within the corpus (in-degree) → big nodes are the seminal papers.
 */
export function buildCitationGraph(): {
  nodes: GraphNode[];
  links: { source: string; target: string }[];
} {
  const byId = new Map(papers.map((p) => [p.id, p]));
  const links: { source: string; target: string }[] = [];
  const indeg = new Map<string, number>();
  const involved = new Set<string>();
  for (const [a, b] of citationEdges as [string, string][]) {
    if (!byId.has(a) || !byId.has(b) || a === b) continue;
    links.push({ source: `paper:${a}`, target: `paper:${b}` });
    indeg.set(b, (indeg.get(b) ?? 0) + 1);
    involved.add(a);
    involved.add(b);
  }
  const nodes: GraphNode[] = [];
  for (const id of involved) {
    const p = byId.get(id)!;
    nodes.push({
      id: `paper:${id}`,
      kind: "paper",
      routeId: id,
      label: p.title,
      paperType: p.type,
      degree: (indeg.get(id) ?? 0) + 1,
    });
  }
  return { nodes, links };
}

/**
 * Ecosystem/domain coverage: each target ecosystem (Web, IoT/Firmware, Binary…)
 * linked to the tools that target it. Ecosystem node size = number of tools, so
 * under-served domains show up as small hubs.
 */
export function buildEcosystemGraph(): {
  nodes: GraphNode[];
  links: { source: string; target: string }[];
} {
  const eCount = new Map<string, number>();
  const links: { source: string; target: string }[] = [];
  const usedTools = new Set<string>();
  for (const t of staticAnalyzers) {
    for (const e of t.ecosystem ?? []) {
      links.push({ source: `eco:${e}`, target: `tool:${t.id}` });
      eCount.set(e, (eCount.get(e) ?? 0) + 1);
      usedTools.add(t.id);
    }
  }
  const nodes: GraphNode[] = [];
  eCount.forEach((c, name) =>
    nodes.push({ id: `eco:${name}`, kind: "ecosystem", routeId: name, label: name, degree: c })
  );
  for (const t of staticAnalyzers) {
    if (usedTools.has(t.id)) {
      nodes.push({
        id: `tool:${t.id}`,
        kind: "tool",
        routeId: t.id,
        label: t.name,
        degree: t.ecosystem?.length ?? 0,
      });
    }
  }
  return { nodes, links };
}
