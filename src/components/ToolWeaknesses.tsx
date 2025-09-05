
import { Weakness, WeaknessCategory } from "@/lib/constants";
import { ShieldAlert } from "lucide-react";

interface ToolWeaknessesProps {
  weaknesses: Weakness[];
}

const ToolWeaknesses = ({ weaknesses }: ToolWeaknessesProps) => {
  const getCategoryColor = (category: WeaknessCategory) => {
    switch (category) {
      case "Input Validation and Representation":
        return "text-red-600 border-red-200 bg-red-50";
      case "API Abuse":
        return "text-amber-600 border-amber-200 bg-amber-50";
      case "Security Features":
        return "text-purple-600 border-purple-200 bg-purple-50";
      case "Time and State":
        return "text-blue-600 border-blue-200 bg-blue-50";
      case "Error Handling":
        return "text-orange-600 border-orange-200 bg-orange-50";
      case "Code Quality":
        return "text-green-600 border-green-200 bg-green-50";
      case "Encapsulation":
        return "text-indigo-600 border-indigo-200 bg-indigo-50";
      case "Environment":
        return "text-teal-600 border-teal-200 bg-teal-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={18} className="text-red-600" />
        <h2 className="text-xl font-semibold">Detected Weaknesses</h2>
      </div>
      
      <p className="text-sm text-gray-500 italic mb-4">
        Based on the Seven Pernicious Kingdoms taxonomy of software security errors
      </p>
      
      <div className="space-y-4">
        {weaknesses.map((weakness, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${getCategoryColor(weakness.category)}`}
          >
            <h3 className="font-medium mb-2">{weakness.category}</h3>
            <ul className="list-disc list-inside space-y-1">
              {weakness.examples.map((example, idx) => (
                <li key={idx} className="text-gray-700">{example}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ToolWeaknesses;
