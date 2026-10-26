import {
  familyFinanceDocumentSchema,
  createFamilyDefaults,
  type FamilyFinanceDocument,
} from "@/features/family/model";

const storageKey = "wealthtogether.family-finance.v1";

export type FamilyLoadResult = {
  data: FamilyFinanceDocument;
  warning?: string;
};

export interface FamilyFinanceRepository {
  load(): FamilyLoadResult;
  save(data: FamilyFinanceDocument): void;
  subscribe(listener: () => void): () => void;
}

export const localFamilyFinanceRepository: FamilyFinanceRepository = {
  load() {
    if (typeof window === "undefined") return { data: createFamilyDefaults() };
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch {
      return {
        data: createFamilyDefaults(),
        warning:
          "This browser does not allow local storage, so family details cannot be saved here.",
      };
    }
    if (!raw) return { data: createFamilyDefaults() };
    try {
      const parsed = familyFinanceDocumentSchema.safeParse(JSON.parse(raw));
      if (!parsed.success)
        return {
          data: createFamilyDefaults(),
          warning:
            "Saved family details could not be read. The original local data has been left untouched.",
        };
      return { data: parsed.data };
    } catch {
      return {
        data: createFamilyDefaults(),
        warning:
          "Saved family details could not be read. The original local data has been left untouched.",
      };
    }
  },
  save(data) {
    if (typeof window === "undefined")
      throw new Error("Family storage is only available in a browser.");
    const parsed = familyFinanceDocumentSchema.parse(data);
    window.localStorage.setItem(storageKey, JSON.stringify(parsed));
  },
  subscribe(listener) {
    if (typeof window === "undefined") return () => undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};
