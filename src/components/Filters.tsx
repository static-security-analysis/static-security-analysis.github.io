
import { Checkbox } from "@/components/ui/checkbox";
import { languages, licenses, Language, License } from "@/lib/constants";

interface FiltersProps {
  selectedLanguages: Language[];
  selectedLicenses: License[];
  setSelectedLanguages: (languages: Language[]) => void;
  setSelectedLicenses: (licenses: License[]) => void;
}

const Filters = ({
  selectedLanguages,
  selectedLicenses,
  setSelectedLanguages,
  setSelectedLicenses,
}: FiltersProps) => {
  const handleLanguageChange = (language: Language, checked: boolean) => {
    if (checked) {
      setSelectedLanguages([...selectedLanguages, language]);
    } else {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    }
  };

  const handleLicenseChange = (license: License, checked: boolean) => {
    if (checked) {
      setSelectedLicenses([...selectedLicenses, license]);
    } else {
      setSelectedLicenses(selectedLicenses.filter((l) => l !== license));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Programming Language</h3>
        <div className="space-y-2">
          {languages.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={`language-${language}`}
                checked={selectedLanguages.includes(language)}
                onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
              />
              <label
                htmlFor={`language-${language}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {language}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">License</h3>
        <div className="space-y-2">
          {licenses.map((license) => (
            <div key={license} className="flex items-center space-x-2">
              <Checkbox
                id={`license-${license}`}
                checked={selectedLicenses.includes(license)}
                onCheckedChange={(checked) => handleLicenseChange(license, checked as boolean)}
              />
              <label
                htmlFor={`license-${license}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {license}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
