import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { papers, citedByCount, isSeminal } from "@/lib/papers-loader";
import { paperTypes, paperTypeLabel } from "@/lib/constants";
import type { Paper, PaperType } from "@/lib/constants";
import { Search, Wrench, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL = 24;
const STEP = 24;

const typeBadgeClass: Record<PaperType, string> = {
  tool: "border-blue-200 text-blue-700 bg-blue-50",
  method: "border-violet-200 text-violet-700 bg-violet-50",
  empirical: "border-emerald-200 text-emerald-700 bg-emerald-50",
  survey: "border-amber-200 text-amber-700 bg-amber-50",
  motivation: "border-neutral-200 text-neutral-600 bg-neutral-50",
};

function matches(p: Paper, q: string) {
  const s = q.toLowerCase();
  return (
    p.title.toLowerCase().includes(s) ||
    p.authors.some((a) => a.toLowerCase().includes(s)) ||
    (p.venue?.toLowerCase().includes(s) ?? false) ||
    (p.venueAcronym?.toLowerCase().includes(s) ?? false) ||
    (p.toolName?.toLowerCase().includes(s) ?? false) ||
    (p.abstract?.toLowerCase().includes(s) ?? false)
  );
}

const Papers = () => {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PaperType[]>([]);
  const [sortBy, setSortBy] = useState("yearDesc");
  const [limit, setLimit] = useState(INITIAL);
  const [searchParams, setSearchParams] = useSearchParams();
  const authorFilter = searchParams.get("author");

  const bySearch = useMemo(() => {
    let list = authorFilter
      ? papers.filter((p) => p.authors.includes(authorFilter))
      : papers;
    const q = query.trim();
    return q ? list.filter((p) => matches(p, q)) : list;
  }, [query, authorFilter]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    paperTypes.forEach((t) => (c[t] = bySearch.filter((p) => p.type === t).length));
    return c;
  }, [bySearch]);

  const filtered = useMemo(() => {
    let list = bySearch;
    if (selectedTypes.length > 0)
      list = list.filter((p) => selectedTypes.includes(p.type));
    return [...list].sort((a, b) => {
      if (sortBy === "yearAsc") return (a.year ?? 0) - (b.year ?? 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return (b.year ?? 0) - (a.year ?? 0);
    });
  }, [bySearch, selectedTypes, sortBy]);

  const visible = filtered.slice(0, limit);

  const toggleType = (t: PaperType) => {
    setLimit(INITIAL);
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Primary Studies</h1>
          <p className="text-gray-600 mt-1">
            {filtered.length} papers from the static-security-analysis corpus
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search title, authors, venue, abstract..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(INITIAL);
              }}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yearDesc">Year (newest)</SelectItem>
              <SelectItem value="yearAsc">Year (oldest)</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {paperTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              aria-pressed={selectedTypes.includes(t)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all inline-flex items-center gap-1.5",
                selectedTypes.includes(t)
                  ? "bg-primary text-primary-foreground shadow"
                  : "border border-input bg-background hover:bg-accent"
              )}
            >
              {paperTypeLabel[t]}
              <span className="shrink-0 opacity-70">({typeCounts[t] ?? 0})</span>
            </button>
          ))}
        </div>

        {authorFilter && (
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filtered by author:</span>
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("author");
                setSearchParams(next);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-2.5 py-1 text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              {authorFilter} <X size={13} className="shrink-0" />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">No papers found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col h-full bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={typeBadgeClass[p.type]}>
                        {paperTypeLabel[p.type]}
                      </Badge>
                      {isSeminal(p.id) && (
                        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50">
                          ★
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {citedByCount(p.id) > 0 ? `${citedByCount(p.id)} cites · ` : ""}{p.year}
                    </span>
                  </div>
                  <Link
                    to={`/paper/${p.id}`}
                    className="font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-3"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-1">
                    {p.authors.join(", ")}
                  </p>
                  {(p.venueAcronym || p.venue) && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {p.venueAcronym || p.venue}
                    </p>
                  )}
                  {p.presentsToolId && (
                    <Link
                      to={`/tool/${p.presentsToolId}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Wrench size={12} /> Presents {p.toolName || p.presentsToolId}
                    </Link>
                  )}
                  <div className="mt-auto pt-3 flex items-center gap-3">
                    <Link
                      to={`/paper/${p.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
                      >
                        <ExternalLink size={13} /> Source
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length > limit && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setLimit((n) => n + STEP)}
                >
                  Load more ({filtered.length - limit} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Papers;
