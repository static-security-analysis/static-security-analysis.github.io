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
import { StaticAnalyzer, ReferenceType, WeaknessCategory } from "@/lib/constants";
import { 
  ExternalLink, 
  Github, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Newspaper,
  Book,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AnalyzerCardProps {
  analyzer: StaticAnalyzer;
}

const AnalyzerCard = ({ analyzer }: AnalyzerCardProps) => {
  const [isReferencesOpen, setIsReferencesOpen] = useState(false);
  const [isWeaknessesOpen, setIsWeaknessesOpen] = useState(false);
  
  const getReferenceIcon = (type: ReferenceType) => {
    switch (type) {
      case "Academic Paper":
        return <Book size={14} className="text-blue-600" />;
      case "White Paper":
        return <FileText size={14} className="text-purple-600" />;
      case "Blog Post":
        return <Newspaper size={14} className="text-green-600" />;
      default:
        return <BookOpen size={14} className="text-security-600" />;
    }
  };
  
  const getTypeLabel = (type: ReferenceType) => {
    switch (type) {
      case "Academic Paper":
        return "Academic Papers";
      case "White Paper":
        return "White Papers";
      case "Blog Post":
        return "Blog Posts";
      default:
        return "Other References";
    }
  };
  
  const groupReferencesByType = () => {
    if (!analyzer.academicReferences) return {};
    
    return analyzer.academicReferences.reduce((acc, reference) => {
      if (!acc[reference.type]) {
        acc[reference.type] = [];
      }
      acc[reference.type].push(reference);
      return acc;
    }, {} as Record<ReferenceType, typeof analyzer.academicReferences>);
  };
  
  const getCategoryColor = (category: WeaknessCategory) => {
    switch (category) {
      case "Input Validation and Representation":
        return "text-red-600";
      case "API Abuse":
        return "text-amber-600";
      case "Security Features":
        return "text-purple-600";
      case "Time and State":
        return "text-blue-600";
      case "Error Handling":
        return "text-orange-600";
      case "Code Quality":
        return "text-green-600";
      case "Encapsulation":
        return "text-indigo-600";
      case "Environment":
        return "text-teal-600";
      default:
        return "text-gray-600";
    }
  };
  
  const referenceGroups = groupReferencesByType();
  const referenceTypes = Object.keys(referenceGroups) as ReferenceType[];
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link to={`/tool/${analyzer.id}`} className="hover:underline">
            <CardTitle>{analyzer.name}</CardTitle>
          </Link>
          <Badge 
            variant={
              analyzer.license === "Open Source" 
                ? "outline" 
                : analyzer.license === "Freemium" 
                  ? "secondary" 
                  : "default"
            }
            className={
              analyzer.license === "Open Source" 
                ? "border-green-500 text-green-600" 
                : analyzer.license === "Freemium" 
                  ? "bg-purple-100 text-purple-700" 
                  : "bg-blue-500"
            }
          >
            {analyzer.license}
          </Badge>
        </div>
        <CardDescription className="mt-2">{analyzer.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Supported Languages</h4>
            <div className="flex flex-wrap gap-1.5">
              {analyzer.languages.map((language) => (
                <Badge key={language} variant="secondary" className="bg-gray-100 text-gray-700">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Key Features</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {analyzer.features.slice(0, 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
              {analyzer.features.length > 3 && (
                <li className="text-security-600">+{analyzer.features.length - 3} more features</li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Integrations</h4>
            <div className="flex flex-wrap gap-1.5">
              {analyzer.integration.slice(0, 3).map((integration, index) => (
                <Badge key={index} variant="outline" className="border-gray-200 text-gray-600">
                  {integration}
                </Badge>
              ))}
              {analyzer.integration.length > 3 && (
                <Badge variant="outline" className="border-gray-200 text-security-600">
                  +{analyzer.integration.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {analyzer.weaknesses && analyzer.weaknesses.length > 0 && (
            <Collapsible 
              open={isWeaknessesOpen} 
              onOpenChange={setIsWeaknessesOpen}
              className="border rounded-md p-2 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-600" />
                  <h4 className="text-sm font-medium text-gray-500">Detected Weaknesses</h4>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    {isWeaknessesOpen ? 
                      <ChevronUp size={16} className="text-gray-500" /> : 
                      <ChevronDown size={16} className="text-gray-500" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2 space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Based on the Seven Pernicious Kingdoms taxonomy of software security errors
                </p>
                {analyzer.weaknesses.map((weakness, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2 border-b pb-1">
                      <h5 className={`text-xs font-medium ${getCategoryColor(weakness.category)}`}>
                        {weakness.category}
                      </h5>
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 pl-1">
                      {weakness.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {analyzer.academicReferences && analyzer.academicReferences.length > 0 && (
            <Collapsible 
              open={isReferencesOpen} 
              onOpenChange={setIsReferencesOpen}
              className="border rounded-md p-2 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-security-700" />
                  <h4 className="text-sm font-medium text-gray-500">References</h4>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    {isReferencesOpen ? 
                      <ChevronUp size={16} className="text-gray-500" /> : 
                      <ChevronDown size={16} className="text-gray-500" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2 space-y-4">
                {referenceTypes.map((type) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-1">
                      {getReferenceIcon(type)}
                      <h5 className="text-xs font-medium text-gray-600">{getTypeLabel(type)}</h5>
                    </div>
                    
                    <div className="space-y-3 pl-1">
                      {referenceGroups[type]?.map((reference, index) => (
                        <div key={index} className="text-xs border-l-2 border-security-200 pl-2 py-1">
                          <a 
                            href={reference.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-security-700 hover:text-security-800 hover:underline block"
                          >
                            {reference.title}
                          </a>
                          <p className="text-gray-600 mt-1">
                            {reference.authors.join(", ")} ({reference.year})
                          </p>
                          {reference.publication && (
                            <p className="text-gray-500 italic">{reference.publication}</p>
                          )}
                          {reference.doi && (
                            <p className="text-gray-500 mt-1">
                              DOI: <a 
                                href={`https://doi.org/${reference.doi}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-security-600 hover:underline"
                              >
                                {reference.doi}
                              </a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button variant="outline" asChild>
          <a href={analyzer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <ExternalLink size={14} /> Website
          </a>
        </Button>
        
        <Button variant="default" asChild>
          <Link to={`/tool/${analyzer.id}`} className="flex items-center gap-1">
            Details <ArrowRight size={14} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnalyzerCard;
