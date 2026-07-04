import { useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { languages, licenses } from "@/lib/analyzers-loader";
import {
  weaknessCategories,
  referenceTypes,
  refTypeToLabel,
  licenseFilterOptions,
  toolTypes,
  toolTypeLabel,
  techniqueFamilies,
  soundnessValues,
  maintenanceValues,
} from "@/lib/constants";
import type {
  Language,
  WeaknessCategory,
  ReferenceType,
  ToolType,
  SoundnessValue,
  MaintenanceValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface FiltersProps {
  selectedLanguages: Language[];
  selectedLicenses: string[];
  selectedWeaknesses: WeaknessCategory[];
  selectedIntegrations: string[];
  selectedDocTypes: ReferenceType[];
  setSelectedLanguages: (languages: Language[]) => void;
  setSelectedLicenses: (licenses: string[]) => void;
  setSelectedWeaknesses: (w: WeaknessCategory[]) => void;
  setSelectedIntegrations: (i: string[]) => void;
  setSelectedDocTypes: (t: ReferenceType[]) => void;
  languageCounts: Record<Language, number>;
  licenseCounts: Record<string, number>;
  weaknessCounts: Record<WeaknessCategory, number>;
  integrationCounts: Record<string, number>;
  refCounts: Record<ReferenceType, number>;
  integrationsList: string[];
  selectedProvenance: ToolType[];
  selectedTechniques: string[];
  setSelectedProvenance: (p: ToolType[]) => void;
  setSelectedTechniques: (t: string[]) => void;
  provenanceCounts: Record<string, number>;
  techniqueCounts: Record<string, number>;
  selectedSoundness: SoundnessValue[];
  selectedMaintenance: MaintenanceValue[];
  setSelectedSoundness: (s: SoundnessValue[]) => void;
  setSelectedMaintenance: (m: MaintenanceValue[]) => void;
  soundnessCounts: Record<string, number>;
  maintenanceCounts: Record<string, number>;
  selectedEcosystems: string[];
  setSelectedEcosystems: (e: string[]) => void;
  ecosystemCounts: Record<string, number>;
  ecosystemsList: string[];
  onClearLanguages: () => void;
  onClearLicenses: () => void;
  onClearWeaknesses: () => void;
  onClearIntegrations: () => void;
  onClearDocTypes: () => void;
  onClearProvenance: () => void;
  onClearTechniques: () => void;
  onClearSoundness: () => void;
  onClearMaintenance: () => void;
  onClearEcosystems: () => void;
}

const DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}

function FilterPill<T extends string>({
  label,
  count,
  active,
  disabled,
  onClick,
  title,
  truncate,
}: {
  label: T;
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  title?: string;
  truncate?: boolean;
}) {
  return (
    <button
      type="button"
      title={title ?? (truncate ? label : undefined)}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-all inline-flex items-center gap-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active && "bg-primary text-primary-foreground shadow",
        !active && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        truncate && "max-w-[180px]"
      )}
    >
      <span className={truncate ? "truncate" : undefined}>{label}</span>
      <span className="shrink-0">({count})</span>
    </button>
  );
}

const Filters = ({
  selectedLanguages,
  selectedLicenses,
  selectedWeaknesses,
  selectedIntegrations,
  selectedDocTypes,
  setSelectedLanguages,
  setSelectedLicenses,
  setSelectedWeaknesses,
  setSelectedIntegrations,
  setSelectedDocTypes,
  languageCounts,
  licenseCounts,
  weaknessCounts,
  integrationCounts,
  refCounts,
  integrationsList,
  selectedProvenance,
  selectedTechniques,
  setSelectedProvenance,
  setSelectedTechniques,
  provenanceCounts,
  techniqueCounts,
  selectedSoundness,
  selectedMaintenance,
  setSelectedSoundness,
  setSelectedMaintenance,
  soundnessCounts,
  maintenanceCounts,
  selectedEcosystems,
  setSelectedEcosystems,
  ecosystemCounts,
  ecosystemsList,
  onClearLanguages,
  onClearLicenses,
  onClearWeaknesses,
  onClearIntegrations,
  onClearDocTypes,
  onClearProvenance,
  onClearTechniques,
  onClearSoundness,
  onClearMaintenance,
  onClearEcosystems,
}: FiltersProps) => {
  const [weaknessSearch, setWeaknessSearch] = useState("");
  const debouncedWeaknessSearch = useDebouncedValue(weaknessSearch, DEBOUNCE_MS);

  const filteredWeaknessCategories = useMemo(() => {
    if (!debouncedWeaknessSearch.trim()) return weaknessCategories;
    const q = debouncedWeaknessSearch.toLowerCase();
    return weaknessCategories.filter((cat) => cat.toLowerCase().includes(q));
  }, [debouncedWeaknessSearch]);

  const sectionsWithActiveFilters = useMemo(() => {
    const open: string[] = [];
    if (selectedLanguages.length > 0) open.push("languages");
    if (selectedLicenses.length > 0) open.push("licenses");
    if (selectedWeaknesses.length > 0) open.push("weaknesses");
    if (selectedIntegrations.length > 0) open.push("integrations");
    if (selectedDocTypes.length > 0) open.push("refs");
    if (selectedProvenance.length > 0) open.push("provenance");
    if (selectedTechniques.length > 0) open.push("techniques");
    if (selectedSoundness.length > 0) open.push("soundness");
    if (selectedMaintenance.length > 0) open.push("maintenance");
    if (selectedEcosystems.length > 0) open.push("ecosystem");
    return open;
  }, [
    selectedLanguages.length,
    selectedLicenses.length,
    selectedWeaknesses.length,
    selectedIntegrations.length,
    selectedDocTypes.length,
    selectedProvenance.length,
    selectedTechniques.length,
    selectedSoundness.length,
    selectedMaintenance.length,
    selectedEcosystems.length,
  ]);

  // Load persisted accordion state from localStorage
  const getPersistedState = (): string[] => {
    try {
      const stored = localStorage.getItem("filter-accordion-state");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore errors
    }
    return sectionsWithActiveFilters;
  };

  const [openSections, setOpenSections] = useState<string[]>(() => getPersistedState());

  // Persist accordion state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("filter-accordion-state", JSON.stringify(openSections));
    } catch {
      // Ignore errors
    }
  }, [openSections]);

  useEffect(() => {
    if (sectionsWithActiveFilters.length === 0) {
      // Keep user's manually opened sections, but close all if nothing persisted
      const persisted = getPersistedState();
      if (persisted.length === 0) {
        setOpenSections([]);
      }
    } else {
      setOpenSections((prev) =>
        Array.from(new Set([...sectionsWithActiveFilters, ...prev]))
      );
    }
  }, [sectionsWithActiveFilters]);

  // Calculate total counts for each filter group
  const languageGroupCount = languages.length;
  const licenseGroupCount = licenseFilterOptions.length;
  const weaknessGroupCount = weaknessCategories.length;
  const integrationGroupCount = integrationsList.length;

  // Hide entire sections when no options have count > 0 (cleaner sidebar)
  const hasAnyLanguages = languages.some((l) => (languageCounts[l] ?? 0) > 0);
  const hasAnyLicenses = licenseFilterOptions.some((l) => (licenseCounts[l] ?? 0) > 0);
  const hasAnyWeaknesses = weaknessCategories.some(
    (c) => (weaknessCounts[c] ?? 0) > 0
  );
  const hasAnyIntegrations = integrationsList.some(
    (i) => (integrationCounts[i] ?? 0) > 0
  );
  const hasAnyRefs = Object.values(refCounts).some((c) => c > 0);
  const hasAnyProvenance = toolTypes.some((t) => (provenanceCounts[t] ?? 0) > 0);
  const hasAnyTechniques = techniqueFamilies.some(
    (t) => (techniqueCounts[t] ?? 0) > 0
  );
  const hasAnySoundness = soundnessValues.some(
    (s) => (soundnessCounts[s] ?? 0) > 0
  );
  const hasAnyMaintenance = maintenanceValues.some(
    (m) => (maintenanceCounts[m] ?? 0) > 0
  );

  const toggleSoundness = (s: SoundnessValue) => {
    if (selectedSoundness.includes(s)) {
      setSelectedSoundness(selectedSoundness.filter((x) => x !== s));
    } else {
      setSelectedSoundness([...selectedSoundness, s]);
    }
  };

  const toggleMaintenance = (m: MaintenanceValue) => {
    if (selectedMaintenance.includes(m)) {
      setSelectedMaintenance(selectedMaintenance.filter((x) => x !== m));
    } else {
      setSelectedMaintenance([...selectedMaintenance, m]);
    }
  };

  const hasAnyEcosystems = ecosystemsList.some(
    (e) => (ecosystemCounts[e] ?? 0) > 0
  );
  const toggleEcosystem = (e: string) => {
    if (selectedEcosystems.includes(e)) {
      setSelectedEcosystems(selectedEcosystems.filter((x) => x !== e));
    } else {
      setSelectedEcosystems([...selectedEcosystems, e]);
    }
  };

  const toggleProvenance = (t: ToolType) => {
    if (selectedProvenance.includes(t)) {
      setSelectedProvenance(selectedProvenance.filter((x) => x !== t));
    } else {
      setSelectedProvenance([...selectedProvenance, t]);
    }
  };

  const toggleTechnique = (t: string) => {
    if (selectedTechniques.includes(t)) {
      setSelectedTechniques(selectedTechniques.filter((x) => x !== t));
    } else {
      setSelectedTechniques([...selectedTechniques, t]);
    }
  };

  const toggleLanguage = (language: Language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const toggleLicense = (license: string) => {
    if (selectedLicenses.includes(license)) {
      setSelectedLicenses(selectedLicenses.filter((l) => l !== license));
    } else {
      setSelectedLicenses([...selectedLicenses, license]);
    }
  };

  const toggleWeakness = (cat: WeaknessCategory) => {
    if (selectedWeaknesses.includes(cat)) {
      setSelectedWeaknesses(selectedWeaknesses.filter((w) => w !== cat));
    } else {
      setSelectedWeaknesses([...selectedWeaknesses, cat]);
    }
  };

  const toggleIntegration = (int: string) => {
    if (selectedIntegrations.includes(int)) {
      setSelectedIntegrations(selectedIntegrations.filter((i) => i !== int));
    } else {
      setSelectedIntegrations([...selectedIntegrations, int]);
    }
  };

  const toggleDocType = (type: ReferenceType) => {
    if (selectedDocTypes.includes(type)) {
      setSelectedDocTypes(selectedDocTypes.filter((t) => t !== type));
    } else {
      setSelectedDocTypes([...selectedDocTypes, type]);
    }
  };

  const handleAccordionChange = (value: string[]) => {
    setOpenSections(Array.from(new Set([...sectionsWithActiveFilters, ...value])));
  };

  return (
    <div className="space-y-1">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={handleAccordionChange}
        className="w-full space-y-0"
      >
        {hasAnyLanguages && (
        <AccordionItem value="languages" className="border-b border-border">
          <AccordionTrigger 
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("languages")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Programming Language
                <span className="text-xs text-muted-foreground font-normal">({languageGroupCount})</span>
              </span>
              {selectedLanguages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearLanguages();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <FilterPill
                  key={language}
                  label={language}
                  count={languageCounts[language] ?? 0}
                  active={selectedLanguages.includes(language)}
                  disabled={(languageCounts[language] ?? 0) === 0}
                  onClick={() => toggleLanguage(language)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyProvenance && (
        <AccordionItem value="provenance" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("provenance")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Provenance
                <span className="text-xs text-muted-foreground font-normal">({toolTypes.length})</span>
              </span>
              {selectedProvenance.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearProvenance();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {toolTypes.map((t) => (
                <FilterPill
                  key={t}
                  label={toolTypeLabel[t]}
                  count={provenanceCounts[t] ?? 0}
                  active={selectedProvenance.includes(t)}
                  disabled={(provenanceCounts[t] ?? 0) === 0}
                  onClick={() => toggleProvenance(t)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyEcosystems && (
        <AccordionItem value="ecosystem" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("ecosystem")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Ecosystem
                <span className="text-xs text-muted-foreground font-normal">({ecosystemsList.length})</span>
              </span>
              {selectedEcosystems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearEcosystems();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {ecosystemsList.map((e) => (
                <FilterPill
                  key={e}
                  label={e}
                  count={ecosystemCounts[e] ?? 0}
                  active={selectedEcosystems.includes(e)}
                  disabled={(ecosystemCounts[e] ?? 0) === 0}
                  onClick={() => toggleEcosystem(e)}
                  title={e}
                  truncate
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyLicenses && (
        <AccordionItem value="licenses" className="border-b border-border">
          <AccordionTrigger 
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("licenses")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                License
                <span className="text-xs text-muted-foreground font-normal">({licenseGroupCount})</span>
              </span>
              {selectedLicenses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearLicenses();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {licenseFilterOptions.map((license) => (
                <FilterPill
                  key={license}
                  label={license}
                  count={licenseCounts[license] ?? 0}
                  active={selectedLicenses.includes(license)}
                  disabled={(licenseCounts[license] ?? 0) === 0}
                  onClick={() => toggleLicense(license)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyWeaknesses && (
        <AccordionItem value="weaknesses" className="border-b border-border">
          <AccordionTrigger 
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("weaknesses")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Weakness category
                <span className="text-xs text-muted-foreground font-normal">({weaknessGroupCount})</span>
              </span>
              {selectedWeaknesses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearWeaknesses();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search weaknesses..."
                value={weaknessSearch}
                onChange={(e) => setWeaknessSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
                aria-label="Search weakness categories"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredWeaknessCategories.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat as WeaknessCategory}
                  count={weaknessCounts[cat] ?? 0}
                  active={selectedWeaknesses.includes(cat)}
                  disabled={(weaknessCounts[cat] ?? 0) === 0}
                  onClick={() => toggleWeakness(cat)}
                  title={cat}
                  truncate
                />
              ))}
              {filteredWeaknessCategories.length === 0 && (
                <p className="text-sm text-muted-foreground py-1">
                  No matching categories
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyTechniques && (
        <AccordionItem value="techniques" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("techniques")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Technique
                <span className="text-xs text-muted-foreground font-normal">({techniqueFamilies.length})</span>
              </span>
              {selectedTechniques.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTechniques();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {techniqueFamilies.map((t) => (
                <FilterPill
                  key={t}
                  label={t}
                  count={techniqueCounts[t] ?? 0}
                  active={selectedTechniques.includes(t)}
                  disabled={(techniqueCounts[t] ?? 0) === 0}
                  onClick={() => toggleTechnique(t)}
                  title={t}
                  truncate
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnySoundness && (
        <AccordionItem value="soundness" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("soundness")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Soundness
                <span className="text-xs text-muted-foreground font-normal">({soundnessValues.length})</span>
              </span>
              {selectedSoundness.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSoundness();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {soundnessValues.map((s) => (
                <FilterPill
                  key={s}
                  label={s}
                  count={soundnessCounts[s] ?? 0}
                  active={selectedSoundness.includes(s)}
                  disabled={(soundnessCounts[s] ?? 0) === 0}
                  onClick={() => toggleSoundness(s)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyMaintenance && (
        <AccordionItem value="maintenance" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("maintenance")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Maintenance
                <span className="text-xs text-muted-foreground font-normal">({maintenanceValues.length})</span>
              </span>
              {selectedMaintenance.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearMaintenance();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {maintenanceValues.map((m) => (
                <FilterPill
                  key={m}
                  label={m}
                  count={maintenanceCounts[m] ?? 0}
                  active={selectedMaintenance.includes(m)}
                  disabled={(maintenanceCounts[m] ?? 0) === 0}
                  onClick={() => toggleMaintenance(m)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyIntegrations && (
        <AccordionItem value="integrations" className="border-b border-border">
          <AccordionTrigger
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("integrations")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Integration
                <span className="text-xs text-muted-foreground font-normal">({integrationGroupCount})</span>
              </span>
              {selectedIntegrations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearIntegrations();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {integrationsList.map((int) => (
                <FilterPill
                  key={int}
                  label={int}
                  count={integrationCounts[int] ?? 0}
                  active={selectedIntegrations.includes(int)}
                  disabled={(integrationCounts[int] ?? 0) === 0}
                  onClick={() => toggleIntegration(int)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}

        {hasAnyRefs && (
        <AccordionItem value="refs" className="border-b border-border">
          <AccordionTrigger 
            className="py-3 text-sm font-medium hover:no-underline text-left"
            aria-expanded={openSections.includes("refs")}
          >
            <span className="flex items-center justify-between w-full pr-2 text-left">
              <span className="flex items-center gap-2">
                Documentation
                <span className="text-xs text-muted-foreground font-normal">({referenceTypes.length})</span>
              </span>
              {selectedDocTypes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearDocTypes();
                  }}
                >
                  Clear
                </Button>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {referenceTypes.map((type) => (
                <FilterPill
                  key={type}
                  label={refTypeToLabel[type]}
                  count={refCounts[type] ?? 0}
                  active={selectedDocTypes.includes(type)}
                  disabled={(refCounts[type] ?? 0) === 0}
                  onClick={() => toggleDocType(type)}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default Filters;
