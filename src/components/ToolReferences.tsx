
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
      <h2 className="text-xl font-semibold mb-4">References</h2>
      <div className="space-y-6">
        {referenceTypes.map((type) => (
          <div key={type} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 border-b pb-2 mb-4">
              {getReferenceIcon(type)}
              <h3 className="font-medium">{getTypeLabel(type)}</h3>
            </div>
            
            <div className="space-y-4">
              {referenceGroups[type]?.map((reference, index) => (
                <div key={index} className="border-l-2 border-gray-300 pl-4 py-2">
                  <a 
                    href={reference.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline block"
                  >
                    {reference.title}
                  </a>
                  <p className="text-gray-700 mt-1">
                    {reference.authors.join(", ")} ({reference.year})
                  </p>
                  {reference.publication && (
                    <p className="text-gray-600 italic">{reference.publication}</p>
                  )}
                  {reference.doi && (
                    <p className="text-gray-600 mt-1">
                      DOI: <a 
                        href={`https://doi.org/${reference.doi}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
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
