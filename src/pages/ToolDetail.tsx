
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { staticAnalyzers } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ToolWeaknesses from "@/components/ToolWeaknesses";
import ToolReferences from "@/components/ToolReferences";

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const tool = staticAnalyzers.find((analyzer) => analyzer.id === id);
  
  useEffect(() => {
    if (!tool) {
      navigate("/not-found", { replace: true });
    }
    
    // Scroll to top when the component mounts
    window.scrollTo(0, 0);
  }, [id, tool, navigate]);
  
  if (!tool) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={() => {}} />
      
      <div className="container py-8 flex-grow">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to all tools
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
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
                    ? "border-green-500 text-green-600" 
                    : tool.license === "Freemium" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-blue-500"
                }
              >
                {tool.license}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2 text-lg">{tool.description}</p>
          </div>
          
          <div className="flex gap-2">
            <Button asChild>
              <a href={tool.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink size={14} /> Visit Website
              </a>
            </Button>
            
            {tool.github && (
              <Button variant="outline" asChild>
                <a href={tool.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Github size={14} /> GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Key Features</h2>
              <ul className="space-y-2 list-disc pl-5">
                {tool.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </section>
            
            {tool.weaknesses && tool.weaknesses.length > 0 && (
              <ToolWeaknesses weaknesses={tool.weaknesses} />
            )}
            
            {tool.academicReferences && tool.academicReferences.length > 0 && (
              <ToolReferences references={tool.academicReferences} />
            )}
          </div>
          
          <div className="space-y-6">
            <section className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Supported Languages</h2>
              <div className="flex flex-wrap gap-2">
                {tool.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="bg-gray-100 text-gray-700">
                    {language}
                  </Badge>
                ))}
              </div>
            </section>
            
            <section className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Integrations</h2>
              <Table>
                <TableBody>
                  {tool.integration.map((integration, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-2">{integration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ToolDetail;
