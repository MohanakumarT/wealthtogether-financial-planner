import {
  familyFinanceDocumentSchema,
  createFamilyDefaults,
  type FamilyFinanceDocument,
} from "@/features/family/model";
import {
  claimLegacyLocalData,
  getUserStorageKey,
} from "@/lib/auth/local-data-scope";

const storageKey = "wealthtogether.family-finance.v1";

export type FamilyLoadResult = {
  data: FamilyFinanceDocument;
  warning?: string;
};

export interface FamilyFinanceRepository {
  load(userId: string): FamilyLoadResult;
  save(userId: string, data: FamilyFinanceDocument): void;
  subscribe(userId: string, listener: () => void): () => void;
}

export const localFamilyFinanceRepository: FamilyFinanceRepository = {
  load(userId) {
    if (typeof window === "undefined" || !userId)
      return { data: createFamilyDefaults() };
    const scopedStorageKey = getUserStorageKey(storageKey, userId);
    const ownsLegacyData = claimLegacyLocalData(userId);
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(scopedStorageKey);
      if (!raw && ownsLegacyData) {
        raw = window.localStorage.getItem(storageKey);
        if (raw) window.localStorage.setItem(scopedStorageKey, raw);
      }
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
  save(userId, data) {
    if (typeof window === "undefined" || !userId)
      throw new Error("Family storage is only available in a browser.");
    const parsed = familyFinanceDocumentSchema.parse(data);
    window.localStorage.setItem(
      getUserStorageKey(storageKey, userId),
      JSON.stringify(parsed),
    );
  },
  subscribe(userId, listener) {
    if (typeof window === "undefined") return () => undefined;
    const scopedStorageKey = getUserStorageKey(storageKey, userId);
    const onStorage = (event: StorageEvent) => {
      if (event.key === scopedStorageKey || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};
