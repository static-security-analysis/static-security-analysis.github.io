
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { staticAnalyzers, StaticAnalyzer, Language, License } from "@/lib/constants";
import AnalyzerCard from "./AnalyzerCard";
import Filters from "./Filters";
import { Filter, X } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface AnalyzerListProps {
  searchTerm: string;
}

const AnalyzerList = ({ searchTerm }: AnalyzerListProps) => {
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<License[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [filteredAnalyzers, setFilteredAnalyzers] = useState<StaticAnalyzer[]>(staticAnalyzers);

  useEffect(() => {
    let filtered = [...staticAnalyzers];

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((analyzer) => 
        analyzer.name.toLowerCase().includes(lowercasedSearch) ||
        analyzer.description.toLowerCase().includes(lowercasedSearch) ||
        analyzer.features.some(feature => feature.toLowerCase().includes(lowercasedSearch)) ||
        analyzer.languages.some(language => language.toLowerCase().includes(lowercasedSearch))
      );
    }

    // Apply language filter
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((analyzer) =>
        analyzer.languages.some(language => 
          selectedLanguages.includes(language) || 
          (selectedLanguages.includes("Multiple") && language === "Multiple")
        )
      );
    }

    // Apply license filter
    if (selectedLicenses.length > 0) {
      filtered = filtered.filter((analyzer) =>
        selectedLicenses.includes(analyzer.license)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredAnalyzers(filtered);
  }, [searchTerm, selectedLanguages, selectedLicenses, sortBy]);

  const clearFilters = () => {
    setSelectedLanguages([]);
    setSelectedLicenses([]);
  };

  return (
    <section className="py-12 px-4 container" id="analyzers">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Static Analyzers</h2>
          <p className="text-gray-600 mt-1">
            {filteredAnalyzers.length} tools available for security analysis
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 md:hidden">
                <Filter size={16} />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <Filters
                  selectedLanguages={selectedLanguages}
                  selectedLicenses={selectedLicenses}
                  setSelectedLanguages={setSelectedLanguages}
                  setSelectedLicenses={setSelectedLicenses}
                />
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <SheetClose asChild>
                  <Button>Apply</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {(selectedLanguages.length > 0 || selectedLicenses.length > 0) && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {selectedLanguages.map((language) => (
            <Button
              key={language}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex items-center gap-1"
              onClick={() => setSelectedLanguages(selectedLanguages.filter(l => l !== language))}
            >
              {language} <X size={12} />
            </Button>
          ))}
          {selectedLicenses.map((license) => (
            <Button
              key={license}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex items-center gap-1"
              onClick={() => setSelectedLicenses(selectedLicenses.filter(l => l !== license))}
            >
              {license} <X size={12} />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-security-600 hover:text-security-800"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block w-1/4 lg:w-1/5">
          <Filters
            selectedLanguages={selectedLanguages}
            selectedLicenses={selectedLicenses}
            setSelectedLanguages={setSelectedLanguages}
            setSelectedLicenses={setSelectedLicenses}
          />
          {(selectedLanguages.length > 0 || selectedLicenses.length > 0) && (
            <Button
              variant="ghost"
              className="mt-4 text-security-600 hover:text-security-800"
              onClick={clearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>

        <div className="w-full md:w-3/4 lg:w-4/5">
          {filteredAnalyzers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnalyzers.map((analyzer) => (
                <AnalyzerCard key={analyzer.id} analyzer={analyzer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyzerList;
