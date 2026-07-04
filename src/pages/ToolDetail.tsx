import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { staticAnalyzers, similarTools, githubStatsDate } from "@/lib/analyzers-loader";
import { papersForTool, papersEvaluatingTool, baselineCount } from "@/lib/papers-loader";
import { paperTypeLabel } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, Github, GitCompare } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import ToolWeaknesses from "@/components/ToolWeaknesses";
import ToolReferences from "@/components/ToolReferences";

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { compareIds, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const tool = staticAnalyzers.find((analyzer) => analyzer.id === id);
  const inCompare = tool ? isInCompare(tool.id) : false;
  const canAdd = compareIds.length < 3 || inCompare;
  
  useEffect(() => {
    if (!tool) {
      navigate("/not-found", { replace: true });
    }
    
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, [id, tool, navigate]);
  
  if (!tool) return null;

  const similar = similarTools(tool);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="container py-8 flex-grow">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-gray-100 text-gray-600"
          onClick={() => navigate("/")}
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to all tools
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <Badge 
                variant="outline"
                className={
                  tool.license === "Open Source" 
                    ? "border-green-200 text-green-700 bg-green-50" 
                    : tool.license === "Freemium" 
                      ? "border-purple-200 text-purple-700 bg-purple-50" 
                      : "border-blue-200 text-blue-700 bg-blue-50"
                }
              >
                {tool.license}
              </Badge>
              {tool.soundness && (
                <Badge
                  variant="outline"
                  className={tool.soundness === "Sound"
                    ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                    : "border-amber-200 text-amber-700 bg-amber-50"}
                >
                  {tool.soundness}
                </Badge>
              )}
              {tool.maintenance && (
                <Badge
                  variant="outline"
                  className={tool.maintenance === "Active"
                    ? "border-green-200 text-green-700 bg-green-50"
                    : tool.maintenance === "Dormant"
                      ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                      : "border-gray-200 text-gray-500 bg-gray-50"}
                >
                  {tool.maintenance}
                </Badge>
              )}
            </div>
            {tool.license === "Open Source" && tool.licenseDetail && (
              <p className="text-sm text-gray-500 mb-2">{tool.licenseDetail}</p>
            )}
            <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">{tool.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-start">
            {canAdd ? (
              <Button
                variant="outline"
                onClick={() => inCompare ? removeFromCompare(tool.id) : addToCompare(tool.id)}
                className={`flex items-center gap-1 ${inCompare ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100" : "text-gray-700"}`}
              >
                <GitCompare size={14} /> {inCompare ? "Remove from compare" : "Add to compare"}
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button variant="outline" disabled className="flex items-center gap-1 opacity-50">
                      <GitCompare size={14} /> Add to compare
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum 3 tools. Remove one from compare to add another.</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href={tool.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink size={14} /> Visit Website
              </a>
            </Button>
            {tool.github && (
              <Button variant="outline" asChild className="text-gray-700">
                <a href={tool.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Github size={14} /> GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Key Features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            {tool.cweIds && tool.cweIds.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">CWE Coverage</h2>
                <div className="flex flex-wrap gap-2">
                  {tool.cweIds.map((cweId) => {
                    const num = cweId.replace(/^CWE-/, "");
                    const url = `https://cwe.mitre.org/data/definitions/${num}.html`;
                    return (
                      <a
                        key={cweId}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition-all text-sm font-medium"
                      >
                        {cweId}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {tool.weaknesses && tool.weaknesses.length > 0 && (
              <ToolWeaknesses weaknesses={tool.weaknesses} />
            )}
            
            {tool.academicReferences && tool.academicReferences.length > 0 && (
              <ToolReferences references={tool.academicReferences} />
            )}

            {papersForTool(tool.id).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Presented in
                </h2>
                <ul className="space-y-3">
                  {papersForTool(tool.id).map((p) => (
                    <li
                      key={p.id}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                    >
                      <Link
                        to={`/paper/${p.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {p.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {p.authors.slice(0, 4).join(", ")}
                        {p.authors.length > 4 ? " et al." : ""}
                        {p.venueAcronym ? ` · ${p.venueAcronym}` : ""}
                        {p.year ? ` · ${p.year}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {papersEvaluatingTool(tool.id).length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Empirical studies &amp; comparisons
                </h2>
                <p className="text-sm text-gray-500 mb-4 -mt-2">
                  Studies that evaluate or benchmark {tool.name} against other tools.
                </p>
                <ul className="space-y-3">
                  {papersEvaluatingTool(tool.id).map((p) => (
                    <li
                      key={p.id}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/paper/${p.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {p.title}
                        </Link>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-emerald-200 text-emerald-700 bg-emerald-50"
                        >
                          {paperTypeLabel[p.type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {p.authors.slice(0, 4).join(", ")}
                        {p.authors.length > 4 ? " et al." : ""}
                        {p.venueAcronym ? ` · ${p.venueAcronym}` : ""}
                        {p.year ? ` · ${p.year}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {tool.price && (
                <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900">Pricing</h2>
                  <p className="text-gray-700">{tool.price}</p>
                </section>
              )}
              
              <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Supported Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {(tool.languagesDetail && tool.languagesDetail.length > 0
                    ? tool.languagesDetail
                    : tool.languages
                  ).map((language) => (
                    <Badge key={language} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200">
                      {language}
                    </Badge>
                  ))}
                </div>
              </section>
              
              {tool.integration.length > 0 && (
                <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-3 text-gray-900">Integrations</h2>
                  <div className="divide-y divide-gray-100">
                    {tool.integration.map((integration, index) => (
                      <div key={index} className="py-2 text-sm text-gray-700">
                        {integration}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Tool details</h2>
                <dl className="space-y-2 text-sm">
                  {tool.toolType && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Type</dt>
                      <dd className="text-gray-800 capitalize">{tool.toolType}</dd>
                    </div>
                  )}
                  {tool.yearIntroduced && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Introduced</dt>
                      <dd className="text-gray-800">{tool.yearIntroduced}</dd>
                    </div>
                  )}
                  {typeof tool.githubStars === "number" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">GitHub stars</dt>
                      <dd className="text-gray-800">{tool.githubStars.toLocaleString()}</dd>
                    </div>
                  )}
                  {typeof tool.empiricalValidation === "boolean" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500" title="Whether the tool's own paper or documentation reports an empirical evaluation. Third-party studies are listed under 'Empirical studies & comparisons'.">
                        Author-reported evaluation
                      </dt>
                      <dd className="text-gray-800">{tool.empiricalValidation ? "Yes" : "No"}</dd>
                    </div>
                  )}
                  {tool.institute && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Institute</dt>
                      <dd className="text-gray-800 text-right">{tool.institute}</dd>
                    </div>
                  )}
                  {baselineCount(tool.id) > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500" title="Number of catalogued studies that use this tool as an evaluation baseline.">
                        Baseline in
                      </dt>
                      <dd className="text-gray-800">{baselineCount(tool.id)} studies</dd>
                    </div>
                  )}
                </dl>
                {typeof tool.githubStars === "number" && githubStatsDate && (
                  <p className="text-[11px] text-gray-400 mt-2" title="Stars and maintenance status are refreshed monthly from the GitHub API.">
                    GitHub stats as of {githubStatsDate}
                  </p>
                )}
                {tool.ecosystem && tool.ecosystem.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Ecosystems</p>
                    <div className="flex flex-wrap gap-2">
                      {tool.ecosystem.map((eco) => (
                        <Badge key={eco} variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200">
                          {eco}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {similar.length > 0 && (
                <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold mb-3 text-gray-900">Similar tools</h2>
                  <ul className="space-y-2.5">
                    {similar.map((s) => (
                      <li key={s.id}>
                        <Link
                          to={`/tool/${s.id}`}
                          className="group flex items-center justify-between gap-2"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </span>
                          <span className="text-xs text-gray-400 text-right shrink-0">
                            {s.techniques?.[0] ?? s.languages?.[0] ?? ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ToolDetail;
