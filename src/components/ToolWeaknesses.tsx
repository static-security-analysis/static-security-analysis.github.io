import { Weakness, WeaknessCategory } from "@/lib/constants";
import { ShieldAlert } from "lucide-react";

interface ToolWeaknessesProps {
  weaknesses: Weakness[];
}

function slugifyKingdom(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

const ToolWeaknesses = ({ weaknesses }: ToolWeaknessesProps) => {
  const getCategoryColor = (category: WeaknessCategory) => {
    switch (category) {
      case "Input Validation and Representation":
        return "border-l-red-500";
      case "API Abuse":
        return "border-l-amber-500";
      case "Security Features":
        return "border-l-purple-500";
      case "Time and State":
        return "border-l-blue-500";
      case "Error Handling":
        return "border-l-orange-500";
      case "Code Quality":
        return "border-l-green-500";
      case "Encapsulation":
        return "border-l-indigo-500";
      case "Environment":
        return "border-l-teal-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={18} className="text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Detected Weaknesses</h2>
      </div>
      
      <p className="text-sm text-gray-500 italic mb-6">
        Based on the Seven Pernicious Kingdoms taxonomy of software security errors
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {weaknesses.map((weakness, index) => (
          <div
            key={index}
            id={`kingdom-${slugifyKingdom(weakness.category)}`}
            className={`bg-white border border-gray-200 border-l-4 rounded-r-lg p-5 shadow-sm ${getCategoryColor(weakness.category)}`}
          >
            <h3 className="font-semibold text-gray-900 mb-3">{weakness.category}</h3>
            <ul className="list-disc list-inside space-y-1.5">
              {weakness.examples.map((example, idx) => (
                <li key={idx} className="text-gray-600 text-sm">{example}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ToolWeaknesses;
