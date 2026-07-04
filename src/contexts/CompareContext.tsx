import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "compare-tools";
const MAX_COMPARE = 3;

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

interface CompareContextValue {
  compareIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  setCompareIds: (ids: string[]) => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIdsState] = useState<string[]>(loadFromStorage);

  useEffect(() => {
    const stored = loadFromStorage();
    setCompareIdsState(stored);
  }, []);

  const setCompareIds = useCallback((ids: string[]) => {
    const trimmed = ids.slice(0, MAX_COMPARE);
    setCompareIdsState(trimmed);
    saveToStorage(trimmed);
  }, []);

  const addToCompare = useCallback((id: string) => {
    setCompareIdsState((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, id];
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareIdsState((prev) => {
      const next = prev.filter((x) => x !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const isInCompare = useCallback(
    (id: string) => compareIds.includes(id),
    [compareIds]
  );

  const value: CompareContextValue = {
    compareIds,
    addToCompare,
    removeFromCompare,
    isInCompare,
    setCompareIds,
  };

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
