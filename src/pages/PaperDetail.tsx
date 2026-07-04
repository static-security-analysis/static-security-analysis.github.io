import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPaper, citedByCount, citesCount, isSeminal } from "@/lib/papers-loader";
import { staticAnalyzers } from "@/lib/analyzers-loader";
import { paperTypeLabel } from "@/lib/constants";
import type { PaperType } from "@/lib/constants";
import { ChevronLeft, ExternalLink, Wrench } from "lucide-react";

const typeBadgeClass: Record<PaperType, string> = {
  tool: "border-blue-200 text-blue-700 bg-blue-50",
  method: "border-violet-200 text-violet-700 bg-violet-50",
  empirical: "border-emerald-200 text-emerald-700 bg-emerald-50",
  survey: "border-amber-200 text-amber-700 bg-amber-50",
  motivation: "border-neutral-200 text-neutral-600 bg-neutral-50",
};

const PaperDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paper = getPaper(id ?? "");

  useEffect(() => {
    if (!paper) navigate("/not-found", { replace: true });
    window.scrollTo(0, 0);
  }, [id, paper, navigate]);

  if (!paper) return null;

  const tool = paper.presentsToolId
    ? staticAnalyzers.find((a) => a.id === paper.presentsToolId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container py-8 flex-grow">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-gray-100 text-gray-600"
          onClick={() => navigate("/papers")}
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to all papers
        </Button>

        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge variant="outline" className={typeBadgeClass[paper.type]}>
              {paperTypeLabel[paper.type]}
            </Badge>
            {isSeminal(paper.id) && (
              <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50">
                ★ Seminal
              </Badge>
            )}
            <span className="text-sm text-gray-500">{paper.year}</span>
            {citedByCount(paper.id) > 0 && (
              <span className="text-sm text-gray-500">
                · Cited by {citedByCount(paper.id)} in this corpus
                {citesCount(paper.id) > 0 ? ` · cites ${citesCount(paper.id)}` : ""}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {paper.title}
          </h1>

          <p className="text-gray-700 mt-3">{paper.authors.join(", ")}</p>
          {(paper.venue || paper.venueAcronym) && (
            <p className="text-gray-500 mt-1">
              {paper.venue}
              {paper.venue && paper.venueAcronym ? ` (${paper.venueAcronym})` : paper.venueAcronym}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-5">
            {paper.link && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={paper.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <ExternalLink size={14} /> {paper.doi ? "View (DOI)" : "View source"}
                </a>
              </Button>
            )}
            {tool && (
              <Button variant="outline" asChild className="text-gray-700">
                <Link to={`/tool/${tool.id}`} className="flex items-center gap-1">
                  <Wrench size={14} /> Tool: {tool.name}
                </Link>
              </Button>
            )}
          </div>

          {paper.doi && (
            <p className="text-sm text-gray-400 mt-3">DOI: {paper.doi}</p>
          )}

          <Separator className="my-8" />

          {paper.tldr && (
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-sm font-medium text-blue-800 mb-1">TL;DR</p>
              <p className="text-sm text-blue-900/90">{paper.tldr}</p>
            </div>
          )}

          {paper.abstract && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">Abstract</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {paper.abstract}
              </p>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaperDetail;
