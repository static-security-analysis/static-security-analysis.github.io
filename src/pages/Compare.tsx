import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { staticAnalyzers } from "@/lib/analyzers-loader";
import type { StaticAnalyzer } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ExternalLink, Github, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompare } from "@/contexts/CompareContext";

const MAX_COMPARE = 3;

function parseIdsFromUrl(searchParams: URLSearchParams): string[] {
  const idsParam = searchParams.get("ids");
  if (!idsParam) return [];
  return idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);
}

function resolveTools(ids: string[]): StaticAnalyzer[] {
  const byId = new Map(staticAnalyzers.map((a) => [a.id, a]));
  return ids.map((id) => byId.get(id)).filter((a): a is StaticAnalyzer => !!a);
}

const Compare = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCompareIds } = useCompare();

  const ids = useMemo(() => parseIdsFromUrl(searchParams), [searchParams]);
  const tools = useMemo(() => resolveTools(ids), [ids]);

  // Hydrate compare context from URL so navbar badge stays in sync
  useEffect(() => {
    if (ids.length > 0) {
      setCompareIds(ids);
    }
  }, [ids.join(","), setCompareIds]);

  const handleRemove = (id: string) => {
    const remaining = ids.filter((i) => i !== id);
    if (remaining.length === 0) {
      navigate("/#analyzers", { replace: true });
      setCompareIds([]);
    } else {
      navigate(`/compare?ids=${remaining.join(",")}`, { replace: true });
      setCompareIds(remaining);
    }
  };

  if (tools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-12 flex-grow flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            No tools to compare
          </h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Add up to 3 tools from the list to compare features, languages,
            integrations, and weaknesses side by side.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/#analyzers">Browse tools</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container py-8 flex-grow">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-gray-100"
          onClick={() => navigate("/")}
          asChild
        >
          <Link to="/" className="flex items-center gap-2 text-gray-600">
            <ChevronLeft size={16} />
            Back to all tools
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Compare tools
        </h1>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-white border-b border-gray-200">
                <TableHead className="w-[180px] font-semibold bg-gray-50/50">
                  Feature
                </TableHead>
                {tools.map((tool) => (
                  <TableHead
                    key={tool.id}
                    className="min-w-[250px] font-semibold align-top bg-white p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/tool/${tool.id}`}
                          className="text-lg text-gray-900 hover:text-blue-600 font-bold transition-colors"
                        >
                          {tool.name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemove(tool.id)}
                          aria-label={`Remove ${tool.name} from compare`}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <Badge
                        variant={
                          tool.license === "Open Source"
                            ? "outline"
                            : tool.license === "Freemium"
                              ? "secondary"
                              : "default"
                        }
                        className={
                          tool.license === "Open Source"
                            ? "border-green-200 text-green-700 bg-green-50 w-fit"
                            : tool.license === "Freemium"
                              ? "border-purple-200 text-purple-700 bg-purple-50 w-fit"
                              : "bg-blue-600 hover:bg-blue-700 w-fit"
                        }
                      >
                        {tool.license}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Description
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/50">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Languages
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tool.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="text-xs bg-white border border-gray-200 text-gray-700 font-normal"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Features
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <ul className="text-sm text-gray-600 space-y-1.5">
                      {tool.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {tool.features.length > 5 && (
                        <li className="pl-3.5 pt-1">
                          <Link
                            to={`/tool/${tool.id}`}
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            +{tool.features.length - 5} more
                          </Link>
                        </li>
                      )}
                    </ul>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/50">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Integrations
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tool.integration.slice(0, 5).map((int) => (
                        <span
                          key={int}
                          className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-600"
                        >
                          {int}
                        </span>
                      ))}
                      {tool.integration.length > 5 && (
                        <span className="text-xs text-gray-400 self-center pl-1">
                          +{tool.integration.length - 5} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  CWE Coverage
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {tool.cweIds?.length
                        ? `${tool.cweIds.length} CWEs`
                        : "Not specified"}
                    </span>
                    {tool.cweIds && tool.cweIds.length > 0 && (
                      <Link
                        to={`/tool/${tool.id}`}
                        className="ml-2 text-blue-600 text-xs hover:underline"
                      >
                        View list
                      </Link>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/50">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Weaknesses
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {tool.weaknesses?.length ?? 0} categories
                    </span>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Price
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {tool.price ?? "Unknown"}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100 bg-gray-50/50">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  References
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <span className="text-sm text-gray-700">
                      {tool.academicReferences?.length ?? 0} papers
                    </span>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableCell className="font-medium text-gray-500 bg-gray-50/30 align-top py-4">
                  Links
                </TableCell>
                {tools.map((tool) => (
                  <TableCell key={tool.id} className="align-top py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild className="h-8 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50">
                        <a
                          href={tool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} /> Website
                        </a>
                      </Button>
                      {tool.github && (
                        <Button variant="outline" size="sm" asChild className="h-8 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                          <a
                            href={tool.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <Github size={12} /> GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Compare;
