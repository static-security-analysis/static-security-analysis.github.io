import { AcademicReference, ReferenceType } from "@/lib/constants";
import { BookOpen, Book, FileText, Newspaper } from "lucide-react";

interface ToolReferencesProps {
  references: AcademicReference[];
}

const ToolReferences = ({ references }: ToolReferencesProps) => {
  const getReferenceIcon = (type: ReferenceType) => {
    switch (type) {
      case "Academic Paper":
        return <Book size={16} className="text-blue-600" />;
      case "White Paper":
        return <FileText size={16} className="text-purple-600" />;
      case "Blog Post":
        return <Newspaper size={16} className="text-green-600" />;
      case "Tool Documentation":
        return <BookOpen size={16} className="text-gray-600" />;
      default:
        return <BookOpen size={16} className="text-gray-600" />;
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
      case "Tool Documentation":
        return "Tool Documentation";
      default:
        return "Other References";
    }
  };
  
  const groupReferencesByType = () => {
    return references.reduce((acc, reference) => {
      if (!acc[reference.type]) {
        acc[reference.type] = [];
      }
      acc[reference.type].push(reference);
      return acc;
    }, {} as Record<ReferenceType, typeof references>);
  };
  
  const referenceGroups = groupReferencesByType();
  const referenceTypes = Object.keys(referenceGroups) as ReferenceType[];
  
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 text-gray-900">References</h2>
      <div className="space-y-6">
        {referenceTypes.map((type) => (
          <div key={type} className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              {getReferenceIcon(type)}
              <h3 className="font-semibold text-gray-800">{getTypeLabel(type)}</h3>
            </div>
            
            <div className="space-y-5">
              {referenceGroups[type]?.map((reference, index) => (
                <div key={index} className="pl-2">
                  <a 
                    href={reference.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline block mb-1"
                  >
                    {reference.title}
                  </a>
                  <p className="text-sm text-gray-700">
                    {reference.authors.join(", ")} ({reference.year})
                  </p>
                  {reference.publication && (
                    <p className="text-sm text-gray-500 italic mt-0.5">{reference.publication}</p>
                  )}
                  {reference.doi && (
                    <p className="text-xs text-gray-400 mt-1">
                      DOI: <a 
                        href={`https://doi.org/${reference.doi}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
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
      </div>
    </section>
  );
};

export default ToolReferences;
