import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { staticAnalyzers } from "@/lib/analyzers-loader";
import { languages, licenses } from "@/lib/analyzers-loader";
import {
  weaknessCategories,
  referenceTypes,
  refTypeToSlug,
  slugToRefType,
  refTypeToLabel,
  licenseFilterOptions,
  toolTypes,
  toolTypeLabel,
  techniqueFamilies,
  soundnessValues,
  maintenanceValues,
} from "@/lib/constants";
import type {
  StaticAnalyzer,
  Language,
  WeaknessCategory,
  ReferenceType,
  ToolType,
  SoundnessValue,
  MaintenanceValue,
} from "@/lib/constants";
import AnalyzerCard from "./AnalyzerCard";
import Filters from "./Filters";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PARAM_LANGUAGES = "languages";
const PARAM_LICENSES = "licenses";
const PARAM_WEAKNESSES = "weaknesses";
const PARAM_INTEGRATIONS = "integrations";
const PARAM_REFS = "refs";
const PARAM_PROVENANCE = "provenance";
const PARAM_TECHNIQUES = "techniques";
const PARAM_SOUNDNESS = "soundness";
const PARAM_MAINTENANCE = "maintenance";
const PARAM_ECOSYSTEM = "ecosystem";

const ECOSYSTEMS = new Set(staticAnalyzers.flatMap((a) => a.ecosystem ?? []));

const INITIAL_DISPLAY = 12;
const LOAD_MORE_STEP = 12;

function parseFilters(searchParams: URLSearchParams) {
  const lang = searchParams.getAll(PARAM_LANGUAGES).filter((l) =>
    (languages as readonly string[]).includes(l)
  ) as Language[];
  const lic = searchParams.getAll(PARAM_LICENSES).filter((l) =>
    licenseFilterOptions.includes(l)
  );
  const weak = searchParams.getAll(PARAM_WEAKNESSES).filter((w) =>
    (weaknessCategories as readonly string[]).includes(w)
  ) as WeaknessCategory[];
  const integrationsRaw = searchParams.getAll(PARAM_INTEGRATIONS);
  const refSlugs = searchParams.getAll(PARAM_REFS);
  const selectedDocTypes = refSlugs
    .map((s) => slugToRefType[s])
    .filter((t): t is ReferenceType => t != null && referenceTypes.includes(t));
  const provenance = searchParams.getAll(PARAM_PROVENANCE).filter((p) =>
    (toolTypes as readonly string[]).includes(p)
  ) as ToolType[];
  const techniques = searchParams.getAll(PARAM_TECHNIQUES).filter((t) =>
    techniqueFamilies.includes(t)
  );
  const soundness = searchParams.getAll(PARAM_SOUNDNESS).filter((s) =>
    (soundnessValues as readonly string[]).includes(s)
  ) as SoundnessValue[];
  const maintenance = searchParams.getAll(PARAM_MAINTENANCE).filter((m) =>
    (maintenanceValues as readonly string[]).includes(m)
  ) as MaintenanceValue[];
  const ecosystems = searchParams.getAll(PARAM_ECOSYSTEM).filter((e) =>
    ECOSYSTEMS.has(e)
  );
  return {
    selectedLanguages: lang,
    selectedLicenses: lic,
    selectedWeaknesses: weak,
    selectedIntegrations: integrationsRaw,
    selectedDocTypes,
    selectedProvenance: provenance,
    selectedTechniques: techniques,
    selectedSoundness: soundness,
    selectedMaintenance: maintenance,
    selectedEcosystems: ecosystems,
  };
}

function buildParams(filters: {
  selectedLanguages: Language[];
  selectedLicenses: string[];
  selectedWeaknesses: WeaknessCategory[];
  selectedIntegrations: string[];
  selectedDocTypes: ReferenceType[];
  selectedProvenance: ToolType[];
  selectedTechniques: string[];
  selectedSoundness: SoundnessValue[];
  selectedMaintenance: MaintenanceValue[];
  selectedEcosystems: string[];
}): URLSearchParams {
  const params = new URLSearchParams();
  filters.selectedLanguages.forEach((l) => params.append(PARAM_LANGUAGES, l));
  filters.selectedLicenses.forEach((l) => params.append(PARAM_LICENSES, l));
  filters.selectedWeaknesses.forEach((w) =>
    params.append(PARAM_WEAKNESSES, w)
  );
  filters.selectedIntegrations.forEach((i) =>
    params.append(PARAM_INTEGRATIONS, i)
  );
  filters.selectedDocTypes.forEach((t) =>
    params.append(PARAM_REFS, refTypeToSlug[t])
  );
  filters.selectedProvenance.forEach((p) => params.append(PARAM_PROVENANCE, p));
  filters.selectedTechniques.forEach((t) => params.append(PARAM_TECHNIQUES, t));
  filters.selectedSoundness.forEach((s) => params.append(PARAM_SOUNDNESS, s));
  filters.selectedMaintenance.forEach((m) => params.append(PARAM_MAINTENANCE, m));
  filters.selectedEcosystems.forEach((e) => params.append(PARAM_ECOSYSTEM, e));
  return params;
}

function analyzerMatchesQuery(a: StaticAnalyzer, q: string): boolean {
  const qLower = q.trim().toLowerCase();
  return (
    a.name.toLowerCase().includes(qLower) ||
    a.description.toLowerCase().includes(qLower) ||
    a.features.some((f) => f.toLowerCase().includes(qLower)) ||
    a.languages.some((l) => l.toLowerCase().includes(qLower)) ||
    (a.languagesDetail?.some((l) => l.toLowerCase().includes(qLower)) ?? false) ||
    a.integration.some((i) => i.toLowerCase().includes(qLower)) ||
    a.license.toLowerCase().includes(qLower) ||
    (a.licenseDetail?.toLowerCase().includes(qLower) ?? false) ||
    (a.price?.toLowerCase().includes(qLower) ?? false) ||
    (a.cweIds?.some((c) => c.toLowerCase().includes(qLower)) ?? false) ||
    (a.weaknesses?.some((w) => w.category.toLowerCase().includes(qLower)) ?? false) ||
    (a.weaknesses?.some((w) =>
      w.examples.some((e) => e.toLowerCase().includes(qLower))
    ) ?? false) ||
    (a.academicReferences?.some((r) => r.title.toLowerCase().includes(qLower)) ??
      false) ||
    (a.academicReferences?.some(
      (r) => r.publication?.toLowerCase().includes(qLower)
    ) ?? false) ||
    ((qLower.includes("multi") || qLower === "multiple") &&
      a.languages.some((l) => l.toLowerCase() === "multiple"))
  );
}

interface AnalyzerListProps {
  searchTerm: string;
}

const AnalyzerList = ({ searchTerm }: AnalyzerListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<string>("name");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY);
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  const {
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
    selectedProvenance,
    selectedTechniques,
    selectedSoundness,
    selectedMaintenance,
    selectedEcosystems,
  } = useMemo(() => parseFilters(searchParams), [searchParams]);

  const updateFilters = useCallback(
    (updates: Partial<ReturnType<typeof parseFilters>>) => {
      const next = {
        selectedLanguages: updates.selectedLanguages ?? selectedLanguages,
        selectedLicenses: updates.selectedLicenses ?? selectedLicenses,
        selectedWeaknesses: updates.selectedWeaknesses ?? selectedWeaknesses,
        selectedIntegrations:
          updates.selectedIntegrations ?? selectedIntegrations,
        selectedDocTypes: updates.selectedDocTypes ?? selectedDocTypes,
        selectedProvenance: updates.selectedProvenance ?? selectedProvenance,
        selectedTechniques: updates.selectedTechniques ?? selectedTechniques,
        selectedSoundness: updates.selectedSoundness ?? selectedSoundness,
        selectedMaintenance: updates.selectedMaintenance ?? selectedMaintenance,
        selectedEcosystems: updates.selectedEcosystems ?? selectedEcosystems,
      };
      setSearchParams(buildParams(next), { replace: true });
    },
    [
      selectedLanguages,
      selectedLicenses,
      selectedWeaknesses,
      selectedIntegrations,
      selectedDocTypes,
      selectedProvenance,
      selectedTechniques,
      selectedSoundness,
      selectedMaintenance,
      selectedEcosystems,
      setSearchParams,
    ]
  );

  const integrationsList = useMemo(
    () =>
      [...new Set(staticAnalyzers.flatMap((a) => a.integration))].sort(),
    []
  );

  const filteredBySearch = useMemo(() => {
    let list = [...staticAnalyzers];
    if (searchTerm) {
      const normalized = searchTerm.toLowerCase().trim().replace(/\s+/g, " ");
      const tokens = normalized.split(/\s+/).filter(Boolean);
      list = list.filter((a) =>
        tokens.length === 0
          ? true
          : tokens.length === 1
            ? analyzerMatchesQuery(a, tokens[0])
            : tokens.every((token) => analyzerMatchesQuery(a, token))
      );
    }
    return list;
  }, [searchTerm]);

  const filteredAnalyzers = useMemo(() => {
    let list = [...filteredBySearch];

    if (selectedLanguages.length > 0) {
      list = list.filter((a) =>
        a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) &&
              l === "Multiple")
        )
      );
    }
    if (selectedLicenses.length > 0) {
      list = list.filter((a) =>
        selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      );
    }
    if (selectedWeaknesses.length > 0) {
      list = list.filter((a) =>
        a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      );
    }
    if (selectedIntegrations.length > 0) {
      list = list.filter((a) =>
        a.integration.some((i) => selectedIntegrations.includes(i))
      );
    }
    if (selectedDocTypes.length > 0) {
      list = list.filter(
        (a) =>
          a.academicReferences?.some((r) =>
            selectedDocTypes.includes(r.type)
          ) ?? false
      );
    }
    if (selectedProvenance.length > 0) {
      list = list.filter(
        (a) => a.toolType != null && selectedProvenance.includes(a.toolType)
      );
    }
    if (selectedTechniques.length > 0) {
      list = list.filter((a) =>
        a.techniques?.some((t) => selectedTechniques.includes(t))
      );
    }
    if (selectedSoundness.length > 0) {
      list = list.filter(
        (a) => a.soundness != null && selectedSoundness.includes(a.soundness)
      );
    }
    if (selectedMaintenance.length > 0) {
      list = list.filter(
        (a) => a.maintenance != null && selectedMaintenance.includes(a.maintenance)
      );
    }
    if (selectedEcosystems.length > 0) {
      list = list.filter((a) =>
        a.ecosystem?.some((e) => selectedEcosystems.includes(e))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  }, [
    filteredBySearch,
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
    selectedProvenance,
    selectedTechniques,
    selectedSoundness,
    selectedMaintenance,
    selectedEcosystems,
    sortBy,
  ]);

  useEffect(() => {
    setDisplayLimit(INITIAL_DISPLAY);
  }, [
    searchTerm,
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
    selectedProvenance,
    selectedTechniques,
    selectedSoundness,
    selectedMaintenance,
    selectedEcosystems,
    sortBy,
  ]);

  const visibleAnalyzers = useMemo(
    () => filteredAnalyzers.slice(0, displayLimit),
    [filteredAnalyzers, displayLimit]
  );

  const withoutLanguage = useMemo(() => {
    let list = [...filteredBySearch];
    if (selectedLicenses.length > 0)
      list = list.filter((a) =>
        selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      );
    if (selectedWeaknesses.length > 0)
      list = list.filter((a) =>
        a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      );
    if (selectedIntegrations.length > 0)
      list = list.filter((a) =>
        a.integration.some((i) => selectedIntegrations.includes(i))
      );
    if (selectedDocTypes.length > 0)
      list = list.filter(
        (a) =>
          a.academicReferences?.some((r) =>
            selectedDocTypes.includes(r.type)
          ) ?? false
      );
    return list;
  }, [
    filteredBySearch,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
  ]);

  const withoutLicense = useMemo(() => {
    let list = [...filteredBySearch];
    if (selectedLanguages.length > 0)
      list = list.filter((a) =>
        a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) && l === "Multiple")
        )
      );
    if (selectedWeaknesses.length > 0)
      list = list.filter((a) =>
        a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      );
    if (selectedIntegrations.length > 0)
      list = list.filter((a) =>
        a.integration.some((i) => selectedIntegrations.includes(i))
      );
    if (selectedDocTypes.length > 0)
      list = list.filter(
        (a) =>
          a.academicReferences?.some((r) =>
            selectedDocTypes.includes(r.type)
          ) ?? false
      );
    return list;
  }, [
    filteredBySearch,
    selectedLanguages,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
  ]);

  const withoutWeakness = useMemo(() => {
    let list = [...filteredBySearch];
    if (selectedLanguages.length > 0)
      list = list.filter((a) =>
        a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) && l === "Multiple")
        )
      );
    if (selectedLicenses.length > 0)
      list = list.filter((a) =>
        selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      );
    if (selectedIntegrations.length > 0)
      list = list.filter((a) =>
        a.integration.some((i) => selectedIntegrations.includes(i))
      );
    if (selectedDocTypes.length > 0)
      list = list.filter(
        (a) =>
          a.academicReferences?.some((r) =>
            selectedDocTypes.includes(r.type)
          ) ?? false
      );
    return list;
  }, [
    filteredBySearch,
    selectedLanguages,
    selectedLicenses,
    selectedIntegrations,
    selectedDocTypes,
  ]);

  const withoutIntegration = useMemo(() => {
    let list = [...filteredBySearch];
    if (selectedLanguages.length > 0)
      list = list.filter((a) =>
        a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) && l === "Multiple")
        )
      );
    if (selectedLicenses.length > 0)
      list = list.filter((a) =>
        selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      );
    if (selectedWeaknesses.length > 0)
      list = list.filter((a) =>
        a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      );
    if (selectedDocTypes.length > 0)
      list = list.filter(
        (a) =>
          a.academicReferences?.some((r) =>
            selectedDocTypes.includes(r.type)
          ) ?? false
      );
    return list;
  }, [
    filteredBySearch,
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedDocTypes,
  ]);

  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    languages.forEach((lang) => {
      counts[lang] = withoutLanguage.filter((a) =>
        a.languages.some(
          (l) => l === lang || (lang === "Multiple" && l === "Multiple")
        )
      ).length;
    });
    return counts as Record<Language, number>;
  }, [withoutLanguage]);

  const licenseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    licenseFilterOptions.forEach((opt) => {
      counts[opt] = withoutLicense.filter(
        (a) => a.license === opt || a.licenseDetail === opt
      ).length;
    });
    return counts;
  }, [withoutLicense]);

  const weaknessCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    weaknessCategories.forEach((cat) => {
      counts[cat] = withoutWeakness.filter((a) =>
        a.weaknesses?.some((w) => w.category === cat)
      ).length;
    });
    return counts as Record<WeaknessCategory, number>;
  }, [withoutWeakness]);

  const integrationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    integrationsList.forEach((int) => {
      counts[int] = withoutIntegration.filter((a) =>
        a.integration.includes(int)
      ).length;
    });
    return counts;
  }, [withoutIntegration, integrationsList]);

  const withoutDocTypes = useMemo(() => {
    let list = [...filteredBySearch];
    if (selectedLanguages.length > 0)
      list = list.filter((a) =>
        a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) && l === "Multiple")
        )
      );
    if (selectedLicenses.length > 0)
      list = list.filter((a) =>
        selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      );
    if (selectedWeaknesses.length > 0)
      list = list.filter((a) =>
        a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      );
    if (selectedIntegrations.length > 0)
      list = list.filter((a) =>
        a.integration.some((i) => selectedIntegrations.includes(i))
      );
    return list;
  }, [
    filteredBySearch,
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
  ]);

  const refCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    referenceTypes.forEach((type) => {
      counts[type] = withoutDocTypes.filter(
        (a) =>
          a.academicReferences?.some((r) => r.type === type) ?? false
      ).length;
    });
    return counts as Record<ReferenceType, number>;
  }, [withoutDocTypes]);

  // Cross-filtered base sets for the two survey filters (apply every OTHER active filter).
  const applyBase = useCallback(
    (
      a: StaticAnalyzer,
      except: "provenance" | "technique" | "soundness" | "maintenance" | "ecosystem"
    ) => {
      if (
        selectedLanguages.length > 0 &&
        !a.languages.some(
          (l) =>
            selectedLanguages.includes(l) ||
            (selectedLanguages.includes("Multiple" as Language) && l === "Multiple")
        )
      )
        return false;
      if (
        selectedLicenses.length > 0 &&
        !selectedLicenses.some((s) => s === a.license || s === a.licenseDetail)
      )
        return false;
      if (
        selectedWeaknesses.length > 0 &&
        !a.weaknesses?.some((w) => selectedWeaknesses.includes(w.category))
      )
        return false;
      if (
        selectedIntegrations.length > 0 &&
        !a.integration.some((i) => selectedIntegrations.includes(i))
      )
        return false;
      if (
        selectedDocTypes.length > 0 &&
        !(a.academicReferences?.some((r) => selectedDocTypes.includes(r.type)) ?? false)
      )
        return false;
      if (
        except !== "provenance" &&
        selectedProvenance.length > 0 &&
        !(a.toolType != null && selectedProvenance.includes(a.toolType))
      )
        return false;
      if (
        except !== "technique" &&
        selectedTechniques.length > 0 &&
        !a.techniques?.some((t) => selectedTechniques.includes(t))
      )
        return false;
      if (
        except !== "soundness" &&
        selectedSoundness.length > 0 &&
        !(a.soundness != null && selectedSoundness.includes(a.soundness))
      )
        return false;
      if (
        except !== "maintenance" &&
        selectedMaintenance.length > 0 &&
        !(a.maintenance != null && selectedMaintenance.includes(a.maintenance))
      )
        return false;
      if (
        except !== "ecosystem" &&
        selectedEcosystems.length > 0 &&
        !a.ecosystem?.some((e) => selectedEcosystems.includes(e))
      )
        return false;
      return true;
    },
    [
      selectedLanguages,
      selectedLicenses,
      selectedWeaknesses,
      selectedIntegrations,
      selectedDocTypes,
      selectedProvenance,
      selectedTechniques,
      selectedSoundness,
      selectedMaintenance,
      selectedEcosystems,
    ]
  );

  const ecosystemsList = useMemo(
    () => [...ECOSYSTEMS].sort((a, b) => a.localeCompare(b)),
    []
  );

  const provenanceCounts = useMemo(() => {
    const base = filteredBySearch.filter((a) => applyBase(a, "provenance"));
    const counts: Record<string, number> = {};
    toolTypes.forEach((t) => {
      counts[t] = base.filter((a) => a.toolType === t).length;
    });
    return counts;
  }, [filteredBySearch, applyBase]);

  const techniqueCounts = useMemo(() => {
    const base = filteredBySearch.filter((a) => applyBase(a, "technique"));
    const counts: Record<string, number> = {};
    techniqueFamilies.forEach((t) => {
      counts[t] = base.filter((a) => a.techniques?.includes(t)).length;
    });
    return counts;
  }, [filteredBySearch, applyBase]);

  const soundnessCounts = useMemo(() => {
    const base = filteredBySearch.filter((a) => applyBase(a, "soundness"));
    const counts: Record<string, number> = {};
    soundnessValues.forEach((s) => {
      counts[s] = base.filter((a) => a.soundness === s).length;
    });
    return counts;
  }, [filteredBySearch, applyBase]);

  const maintenanceCounts = useMemo(() => {
    const base = filteredBySearch.filter((a) => applyBase(a, "maintenance"));
    const counts: Record<string, number> = {};
    maintenanceValues.forEach((m) => {
      counts[m] = base.filter((a) => a.maintenance === m).length;
    });
    return counts;
  }, [filteredBySearch, applyBase]);

  const ecosystemCounts = useMemo(() => {
    const base = filteredBySearch.filter((a) => applyBase(a, "ecosystem"));
    const counts: Record<string, number> = {};
    ecosystemsList.forEach((e) => {
      counts[e] = base.filter((a) => a.ecosystem?.includes(e)).length;
    });
    return counts;
  }, [filteredBySearch, applyBase, ecosystemsList]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const clearLanguages = useCallback(
    () => updateFilters({ selectedLanguages: [] }),
    [updateFilters]
  );
  const clearLicenses = useCallback(
    () => updateFilters({ selectedLicenses: [] }),
    [updateFilters]
  );
  const clearWeaknesses = useCallback(
    () => updateFilters({ selectedWeaknesses: [] }),
    [updateFilters]
  );
  const clearIntegrations = useCallback(
    () => updateFilters({ selectedIntegrations: [] }),
    [updateFilters]
  );
  const clearDocTypes = useCallback(
    () => updateFilters({ selectedDocTypes: [] }),
    [updateFilters]
  );
  const clearProvenance = useCallback(
    () => updateFilters({ selectedProvenance: [] }),
    [updateFilters]
  );
  const clearTechniques = useCallback(
    () => updateFilters({ selectedTechniques: [] }),
    [updateFilters]
  );
  const clearSoundness = useCallback(
    () => updateFilters({ selectedSoundness: [] }),
    [updateFilters]
  );
  const clearMaintenance = useCallback(
    () => updateFilters({ selectedMaintenance: [] }),
    [updateFilters]
  );
  const clearEcosystems = useCallback(
    () => updateFilters({ selectedEcosystems: [] }),
    [updateFilters]
  );

  const hasActiveFilters =
    selectedLanguages.length > 0 ||
    selectedLicenses.length > 0 ||
    selectedWeaknesses.length > 0 ||
    selectedIntegrations.length > 0 ||
    selectedDocTypes.length > 0 ||
    selectedProvenance.length > 0 ||
    selectedTechniques.length > 0 ||
    selectedSoundness.length > 0 ||
    selectedMaintenance.length > 0 ||
    selectedEcosystems.length > 0;

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    const el = filtersContainerRef.current?.querySelector<HTMLElement>(
      'button, [role="checkbox"], input'
    );
    el?.focus();
  }, []);

  const filterProps = {
    selectedLanguages,
    selectedLicenses,
    selectedWeaknesses,
    selectedIntegrations,
    selectedDocTypes,
    setSelectedLanguages: (l: Language[]) =>
      updateFilters({ selectedLanguages: l }),
    setSelectedLicenses: (l: string[]) => updateFilters({ selectedLicenses: l }),
    setSelectedWeaknesses: (w: WeaknessCategory[]) =>
      updateFilters({ selectedWeaknesses: w }),
    setSelectedIntegrations: (i: string[]) =>
      updateFilters({ selectedIntegrations: i }),
    setSelectedDocTypes: (t: ReferenceType[]) =>
      updateFilters({ selectedDocTypes: t }),
    selectedProvenance,
    selectedTechniques,
    setSelectedProvenance: (p: ToolType[]) =>
      updateFilters({ selectedProvenance: p }),
    setSelectedTechniques: (t: string[]) =>
      updateFilters({ selectedTechniques: t }),
    selectedSoundness,
    selectedMaintenance,
    setSelectedSoundness: (s: SoundnessValue[]) =>
      updateFilters({ selectedSoundness: s }),
    setSelectedMaintenance: (m: MaintenanceValue[]) =>
      updateFilters({ selectedMaintenance: m }),
    selectedEcosystems,
    setSelectedEcosystems: (e: string[]) =>
      updateFilters({ selectedEcosystems: e }),
    languageCounts,
    licenseCounts,
    weaknessCounts,
    integrationCounts,
    refCounts,
    provenanceCounts,
    techniqueCounts,
    soundnessCounts,
    maintenanceCounts,
    ecosystemCounts,
    integrationsList,
    ecosystemsList,
    onClearLanguages: clearLanguages,
    onClearLicenses: clearLicenses,
    onClearWeaknesses: clearWeaknesses,
    onClearIntegrations: clearIntegrations,
    onClearDocTypes: clearDocTypes,
    onClearProvenance: clearProvenance,
    onClearTechniques: clearTechniques,
    onClearSoundness: clearSoundness,
    onClearMaintenance: clearMaintenance,
    onClearEcosystems: clearEcosystems,
  };

  return (
    <section className="mt-10 py-12 px-4 container" id="analyzers">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Static Analyzers</h2>
          <p className="text-gray-600 mt-1">
            {filteredAnalyzers.length} tools available for security analysis
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 md:hidden">
                <Filter size={16} />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              onOpenAutoFocus={handleOpenAutoFocus}
              className="flex flex-col"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div
                ref={filtersContainerRef}
                className="py-4 overflow-y-auto flex-1 min-h-0"
              >
                <Filters {...filterProps} />
              </div>
              <div className="flex justify-between mt-4 shrink-0">
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

      <div className="flex flex-col md:flex-row gap-0">
        <div className="hidden md:block w-[220px] shrink-0 border-r-2 border-border pr-6">
          <Filters {...filterProps} />
        </div>

        <div className="w-full min-w-0 flex-1 pl-0 md:pl-6">
          {hasActiveFilters && (
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Active filters</span>
              {selectedLanguages.map((language) => {
                const count = languageCounts[language] ?? 0;
                return (
                  <button
                    key={language}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedLanguages: selectedLanguages.filter((l) => l !== language),
                      })
                    }
                  >
                    {language} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedLicenses.map((license) => {
                const count = licenseCounts[license] ?? 0;
                return (
                  <button
                    key={license}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedLicenses: selectedLicenses.filter((l) => l !== license),
                      })
                    }
                  >
                    {license} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedWeaknesses.map((w) => {
                const count = weaknessCounts[w] ?? 0;
                return (
                  <button
                    key={w}
                    type="button"
                    title={w}
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium max-w-[180px] truncate hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedWeaknesses: selectedWeaknesses.filter((x) => x !== w),
                      })
                    }
                  >
                    <span className="truncate">{w}</span> ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedIntegrations.map((i) => {
                const count = integrationCounts[i] ?? 0;
                return (
                  <button
                    key={i}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedIntegrations: selectedIntegrations.filter((x) => x !== i),
                      })
                    }
                  >
                    {i} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedDocTypes.map((t) => {
                const count = refCounts[t] ?? 0;
                const label = refTypeToLabel[t];
                return (
                  <button
                    key={t}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedDocTypes: selectedDocTypes.filter((x) => x !== t),
                      })
                    }
                  >
                    Documentation: {label} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedProvenance.map((p) => {
                const count = provenanceCounts[p] ?? 0;
                return (
                  <button
                    key={p}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedProvenance: selectedProvenance.filter((x) => x !== p),
                      })
                    }
                  >
                    {toolTypeLabel[p]} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedTechniques.map((t) => {
                const count = techniqueCounts[t] ?? 0;
                return (
                  <button
                    key={t}
                    type="button"
                    title={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium max-w-[180px] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedTechniques: selectedTechniques.filter((x) => x !== t),
                      })
                    }
                  >
                    <span className="truncate">{t}</span> ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedSoundness.map((s) => {
                const count = soundnessCounts[s] ?? 0;
                return (
                  <button
                    key={s}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedSoundness: selectedSoundness.filter((x) => x !== s),
                      })
                    }
                  >
                    {s} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedMaintenance.map((m) => {
                const count = maintenanceCounts[m] ?? 0;
                return (
                  <button
                    key={m}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedMaintenance: selectedMaintenance.filter((x) => x !== m),
                      })
                    }
                  >
                    {m} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              {selectedEcosystems.map((e) => {
                const count = ecosystemCounts[e] ?? 0;
                return (
                  <button
                    key={e}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    onClick={() =>
                      updateFilters({
                        selectedEcosystems: selectedEcosystems.filter((x) => x !== e),
                      })
                    }
                  >
                    {e} ({count}) <X size={12} className="shrink-0" />
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary/90"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}

          {filteredAnalyzers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleAnalyzers.map((analyzer, index) => (
                  <div
                    key={analyzer.id}
                    className="opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    <AnalyzerCard analyzer={analyzer} />
                  </div>
                ))}
              </div>
              {filteredAnalyzers.length > displayLimit && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDisplayLimit((prev) =>
                        Math.min(prev + LOAD_MORE_STEP, filteredAnalyzers.length)
                      )
                    }
                  >
                    Carregar mais
                    {filteredAnalyzers.length - displayLimit > 0 && (
                      <span className="ml-1.5 text-muted-foreground">
                        ({filteredAnalyzers.length - displayLimit} restantes)
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyzerList;
