import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import Navbar from "@/components/Navbar";
import {
  buildGraph,
  buildBaselineGraph,
  buildCoauthorGraph,
  buildCoverageGraph,
  buildTechniqueGraph,
  buildCitationGraph,
  buildEcosystemGraph,
} from "@/lib/graph-data";
import type { GraphNode, LinkKind } from "@/lib/graph-data";
import { paperTypeLabel } from "@/lib/constants";
import type { PaperType } from "@/lib/constants";

type Mode =
  | "toolpaper"
  | "baselines"
  | "coauthors"
  | "coverage"
  | "techniques"
  | "citations"
  | "ecosystem";
const AUTHOR_COLOR = "#0d9488";
const KINGDOM_COLOR = "#ea580c";
const TECH_COLOR = "#6366f1";
const ECO_COLOR = "#0891b2";

const PAPER_COLOR: Record<PaperType, string> = {
  tool: "#38bdf8",
  method: "#8b5cf6",
  empirical: "#10b981",
  survey: "#f59e0b",
  motivation: "#94a3b8",
};
const TOOL_COLOR = "#1d4ed8";
const LINK_COLOR: Record<LinkKind, string> = {
  presents: "#2563eb",
  compares: "#db2777",
  mentions: "#9ca3af",
};

const nodeColor = (n: GraphNode) =>
  n.kind === "tool"
    ? TOOL_COLOR
    : n.kind === "author"
      ? AUTHOR_COLOR
      : n.kind === "kingdom"
        ? KINGDOM_COLOR
        : n.kind === "technique"
          ? TECH_COLOR
          : n.kind === "ecosystem"
            ? ECO_COLOR
            : PAPER_COLOR[n.paperType ?? "method"];
const nodeRadius = (n: GraphNode, mode: Mode) =>
  mode === "baselines" ? 2 + Math.sqrt(n.degree) * 0.9 : 2 + Math.sqrt(n.degree) * 1.1;

type AnyLink = { source: unknown; target: unknown; kind?: LinkKind; weight?: number };
const endId = (e: unknown) =>
  typeof e === "object" && e !== null ? (e as GraphNode).id : (e as string);

const Graph = () => {
  const navigate = useNavigate();
  const full = useMemo(() => buildGraph(), []);
  const baseline = useMemo(() => buildBaselineGraph(), []);
  const coauthor = useMemo(() => buildCoauthorGraph(), []);
  const coverage = useMemo(() => buildCoverageGraph(), []);
  const technique = useMemo(() => buildTechniqueGraph(), []);
  const citation = useMemo(() => buildCitationGraph(), []);
  const ecosystem = useMemo(() => buildEcosystemGraph(), []);

  const [mode, setMode] = useState<Mode>("toolpaper");
  const [edges, setEdges] = useState<Record<LinkKind, boolean>>({
    presents: true,
    compares: true,
    mentions: false,
  });
  const [minWeight, setMinWeight] = useState(1);
  const [minPapers, setMinPapers] = useState(2);
  const [hovered, setHovered] = useState<string | null>(null);

  const graphData = useMemo(() => {
    if (mode === "baselines") {
      const links = baseline.links
        .filter((l) => l.weight >= minWeight)
        .map((l) => ({ ...l }));
      const used = new Set<string>();
      links.forEach((l) => {
        used.add(l.source);
        used.add(l.target);
      });
      return { nodes: baseline.nodes.filter((n) => used.has(n.id)), links };
    }
    if (mode === "coauthors") {
      const deg = new Map(coauthor.nodes.map((n) => [n.id, n.degree]));
      const links = coauthor.links
        .filter(
          (l) =>
            (deg.get(l.source) ?? 0) >= minPapers && (deg.get(l.target) ?? 0) >= minPapers
        )
        .map((l) => ({ ...l }));
      const used = new Set<string>();
      links.forEach((l) => {
        used.add(l.source);
        used.add(l.target);
      });
      return { nodes: coauthor.nodes.filter((n) => used.has(n.id)), links };
    }
    if (mode === "coverage") {
      return { nodes: coverage.nodes, links: coverage.links.map((l) => ({ ...l })) };
    }
    if (mode === "techniques") {
      return { nodes: technique.nodes, links: technique.links.map((l) => ({ ...l })) };
    }
    if (mode === "citations") {
      return { nodes: citation.nodes, links: citation.links.map((l) => ({ ...l })) };
    }
    if (mode === "ecosystem") {
      return { nodes: ecosystem.nodes, links: ecosystem.links.map((l) => ({ ...l })) };
    }
    const links = full.links.filter((l) => edges[l.kind]).map((l) => ({ ...l }));
    return { nodes: full.nodes, links };
  }, [mode, full, baseline, coauthor, coverage, technique, citation, ecosystem, edges, minWeight, minPapers]);

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of graphData.links as AnyLink[]) {
      const s = endId(l.source);
      const t = endId(l.target);
      if (!m.has(s)) m.set(s, new Set());
      if (!m.has(t)) m.set(t, new Set());
      m.get(s)!.add(t);
      m.get(t)!.add(s);
    }
    return m;
  }, [graphData]);

  const highlightNodes = useMemo(() => {
    if (!hovered) return null;
    const s = new Set<string>([hovered]);
    neighbors.get(hovered)?.forEach((n) => s.add(n));
    return s;
  }, [hovered, neighbors]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) =>
      setDim({ w: e.contentRect.width, h: e.contentRect.height })
    );
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const drawNode = useCallback(
    (node: GraphNode & { x?: number; y?: number }, ctx: CanvasRenderingContext2D, scale: number) => {
      const r = nodeRadius(node, mode);
      const faded = highlightNodes && !highlightNodes.has(node.id);
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor(node);
      ctx.globalAlpha = faded ? 0.15 : 1;
      ctx.fill();
      if (node.kind === "tool") {
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = "#0b1a4a";
        ctx.stroke();
      }
      const showLabel =
        node.kind === "kingdom" ||
        node.kind === "technique" ||
        node.kind === "ecosystem" ||
        scale > 2.4 ||
        (highlightNodes?.has(node.id) ?? false);
      if (showLabel) {
        const label = node.label.length > 34 ? node.label.slice(0, 33) + "…" : node.label;
        ctx.font = `${Math.max(3, 10 / scale)}px Inter, sans-serif`;
        ctx.fillStyle = "#111827";
        ctx.globalAlpha = faded ? 0.2 : 1;
        ctx.fillText(label, node.x! + r + 1, node.y! + 3 / scale);
      }
      ctx.globalAlpha = 1;
    },
    [highlightNodes, mode]
  );

  const pointerArea = useCallback(
    (node: GraphNode & { x?: number; y?: number }, color: string, ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, nodeRadius(node, mode) + 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [mode]
  );

  const linkColor = useCallback(
    (l: AnyLink) => {
      const base = l.kind ? LINK_COLOR[l.kind] : "#7c3aed";
      if (highlightNodes) {
        const s = endId(l.source);
        const t = endId(l.target);
        return highlightNodes.has(s) && highlightNodes.has(t)
          ? base
          : "rgba(200,200,200,0.12)";
      }
      return `${base}44`;
    },
    [highlightNodes]
  );

  const linkWidth = useCallback(
    (l: AnyLink) =>
      l.weight != null ? Math.min(6, 0.5 + l.weight) : l.kind === "presents" ? 1.2 : 0.6,
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container pt-6 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "baselines"
                ? "Baseline network"
                : mode === "coauthors"
                  ? "Co-authorship network"
                  : mode === "coverage"
                    ? "Weakness coverage"
                    : mode === "techniques"
                      ? "Technique co-occurrence"
                      : mode === "citations"
                        ? "Citation network"
                        : mode === "ecosystem"
                          ? "Ecosystem coverage"
                          : "Tool–Paper graph"}
            </h1>
            <p className="text-gray-600 text-sm mt-1 max-w-2xl">
              {mode === "baselines"
                ? `${graphData.nodes.length} tools linked when a study evaluates them together. Thicker/bigger = a more common baseline. Click a tool to open it.`
                : mode === "coauthors"
                  ? `${graphData.nodes.length} authors linked by shared papers; bigger = more prolific. Click an author to see their papers.`
                  : mode === "coverage"
                    ? "Each of the 8 weakness kingdoms linked to the tools that detect it. Bigger kingdom = better covered; small ones are the gaps. Click a kingdom to filter the catalogue."
                    : mode === "techniques"
                      ? "Technique families linked when a tool uses both; bigger = more tools use it. Click a technique to filter the catalogue."
                      : mode === "citations"
                        ? `${graphData.nodes.length} papers, ${graphData.links.length} citations (A → B = A cites B, via OpenAlex). Bigger = more cited within the corpus (seminal). Click a paper to open it.`
                        : mode === "ecosystem"
                          ? "Target domains linked to the tools that address them. Bigger domain = more tools; specialised domains (IoT, crypto, smart contracts) are sparse. Click a domain to filter the catalogue, or a tool to open it."
                          : "Tools and papers connected by who presents, compares, and mentions whom. Click a node to open it; hover to highlight neighbours."}
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-sm">
            {(["toolpaper", "baselines", "coauthors", "coverage", "techniques", "citations", "ecosystem"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  "px-3 py-1.5 rounded-md font-medium transition-colors " +
                  (mode === m ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800")
                }
              >
                {m === "toolpaper"
                  ? "Tool ↔ Paper"
                  : m === "baselines"
                    ? "Baselines"
                    : m === "coauthors"
                      ? "Co-authorship"
                      : m === "coverage"
                        ? "Coverage"
                        : m === "techniques"
                          ? "Techniques"
                          : m === "citations"
                            ? "Citations"
                            : "Ecosystem"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
          {mode === "toolpaper" ? (
            <>
              {(["presents", "compares", "mentions"] as LinkKind[]).map((k) => (
                <label key={k} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edges[k]}
                    onChange={() => setEdges((e) => ({ ...e, [k]: !e[k] }))}
                  />
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: LINK_COLOR[k] }} />
                  {k}
                </label>
              ))}
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: TOOL_COLOR }} /> Analyzer
              </span>
              {(Object.keys(PAPER_COLOR) as PaperType[]).map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: PAPER_COLOR[t] }} />
                  {paperTypeLabel[t]}
                </span>
              ))}
            </>
          ) : mode === "baselines" ? (
            <label className="inline-flex items-center gap-2">
              Min. shared studies:
              <select
                value={minWeight}
                onChange={(e) => setMinWeight(Number(e.target.value))}
                className="border border-gray-200 rounded-md px-2 py-1"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    ≥ {n}
                  </option>
                ))}
              </select>
              <span className="text-gray-400">{graphData.links.length} edges</span>
            </label>
          ) : mode === "coauthors" ? (
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2">
                Min. papers per author:
                <select
                  value={minPapers}
                  onChange={(e) => setMinPapers(Number(e.target.value))}
                  className="border border-gray-200 rounded-md px-2 py-1"
                >
                  {[2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      ≥ {n}
                    </option>
                  ))}
                </select>
              </label>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: AUTHOR_COLOR }} />
                Author
              </span>
              <span className="text-gray-400">
                {graphData.nodes.length} authors · {graphData.links.length} edges
              </span>
            </div>
          ) : mode === "coverage" ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: KINGDOM_COLOR }} />
                Weakness kingdom
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: TOOL_COLOR }} />
                Analyzer
              </span>
              <span className="text-gray-400">
                Kingdom size = tools covering it (small = RQ2 gap)
              </span>
            </div>
          ) : mode === "techniques" ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: TECH_COLOR }} />
                Technique family
              </span>
              <span className="text-gray-400">
                Node size = tools using it · edge = tools combining both
              </span>
            </div>
          ) : mode === "citations" ? (
            <div className="flex flex-wrap items-center gap-4">
              {(Object.keys(PAPER_COLOR) as PaperType[]).map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: PAPER_COLOR[t] }} />
                  {paperTypeLabel[t]}
                </span>
              ))}
              <span className="text-gray-400">size = citations received · arrow = cites</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: ECO_COLOR }} />
                Domain
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: TOOL_COLOR }} />
                Analyzer
              </span>
              <span className="text-gray-400">domain size = tools targeting it</span>
            </div>
          )}
        </div>
      </div>

      <div ref={wrapRef} className="flex-1 min-h-0 border-t border-gray-200">
        <ForceGraph2D
          graphData={graphData as never}
          width={dim.w}
          height={dim.h}
          nodeRelSize={4}
          nodeCanvasObject={drawNode as never}
          nodePointerAreaPaint={pointerArea as never}
          linkColor={linkColor as never}
          linkWidth={linkWidth as never}
          linkDirectionalArrowLength={mode === "citations" ? 3 : 0}
          linkDirectionalArrowRelPos={1}
          onNodeHover={(n: GraphNode | null) => setHovered(n ? n.id : null)}
          onNodeClick={(n: GraphNode) => {
            if (n.kind === "author")
              navigate(`/papers?author=${encodeURIComponent(n.routeId)}`);
            else if (n.kind === "kingdom")
              navigate(`/?weaknesses=${encodeURIComponent(n.routeId)}#analyzers`);
            else if (n.kind === "technique")
              navigate(`/?techniques=${encodeURIComponent(n.routeId)}#analyzers`);
            else if (n.kind === "ecosystem")
              navigate(`/?ecosystem=${encodeURIComponent(n.routeId)}#analyzers`);
            else navigate(`/${n.kind}/${n.routeId}`);
          }}
          cooldownTicks={120}
          warmupTicks={40}
        />
      </div>
    </div>
  );
};

export default Graph;
