import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaticAnalyzer } from "@/lib/constants";
import {
  ExternalLink,
  ArrowRight,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompare } from "@/contexts/CompareContext";

interface AnalyzerCardProps {
  analyzer: StaticAnalyzer;
}

const AnalyzerCard = ({ analyzer }: AnalyzerCardProps) => {
  const { compareIds, addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(analyzer.id);
  const canAdd = compareIds.length < 3 || inCompare;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300 group bg-white border-neutral-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/tool/${analyzer.id}`} className="hover:text-blue-600 transition-colors min-w-0 flex-1">
            <CardTitle className="text-xl font-bold">{analyzer.name}</CardTitle>
          </Link>
          <Badge 
            variant="outline"
            className={
              analyzer.license === "Open Source" 
                ? "border-green-200 text-green-700 bg-green-50" 
                : analyzer.license === "Freemium" 
                  ? "border-purple-200 text-purple-700 bg-purple-50" 
                  : "border-blue-200 text-blue-700 bg-blue-50"
            }
          >
            {analyzer.license}
          </Badge>
        </div>
        <CardDescription className="mt-2 line-clamp-2 text-neutral-500 text-sm">
          {analyzer.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow py-2">
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {analyzer.languages.slice(0, 5).map((language) => (
                <Badge key={language} variant="secondary" className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-normal">
                  {language}
                </Badge>
              ))}
              {analyzer.languages.length > 5 && (
                <span className="text-xs text-neutral-500 self-center">+{analyzer.languages.length - 5} more</span>
              )}
            </div>
          </div>
          
          {(analyzer.soundness || analyzer.maintenance || typeof analyzer.githubStars === "number") && (
            <div className="flex flex-wrap items-center gap-1.5">
              {analyzer.soundness && (
                <Badge variant="outline" className={"text-xs font-normal " + (analyzer.soundness === "Sound" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50")}>
                  {analyzer.soundness}
                </Badge>
              )}
              {analyzer.maintenance && (
                <Badge variant="outline" className={"text-xs font-normal " + (analyzer.maintenance === "Active" ? "border-green-200 text-green-700 bg-green-50" : analyzer.maintenance === "Dormant" ? "border-yellow-200 text-yellow-700 bg-yellow-50" : "border-gray-200 text-gray-500 bg-gray-50")}>
                  {analyzer.maintenance}
                </Badge>
              )}
              {typeof analyzer.githubStars === "number" && (
                <span className="text-xs text-neutral-500 inline-flex items-center gap-0.5">
                  <Star size={11} className="fill-current" />{analyzer.githubStars.toLocaleString()}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-600">
             {analyzer.features.slice(0, 4).map((feature, i) => (
               <div key={i} className="flex items-center gap-1.5 overflow-hidden">
                 <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                 <span className="truncate" title={feature}>{feature}</span>
               </div>
             ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t border-neutral-100 mt-auto">
        <div className="flex gap-2">
          {canAdd ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                inCompare ? removeFromCompare(analyzer.id) : addToCompare(analyzer.id);
              }}
              className={inCompare ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-neutral-500 hover:text-blue-600 hover:bg-blue-50"}
            >
              {inCompare ? "Remove" : "Compare"}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-muted-foreground cursor-not-allowed px-3 py-2">
                  Compare
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Maximum 3 tools</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Button variant="ghost" size="sm" asChild className="text-neutral-500 hover:text-neutral-900">
            <a href={analyzer.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} className="mr-1" /> Web
            </a>
          </Button>
        </div>

        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to={`/tool/${analyzer.id}`}>
            Details <ArrowRight size={14} className="ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalyzerCard;
