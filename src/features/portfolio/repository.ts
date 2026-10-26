import {
  portfolioHoldingSchema,
  type PortfolioHolding,
} from "@/features/portfolio/model";

const storageKey = "wealthtogether.portfolio.v2";
const legacyStorageKey = "wealthtogether.portfolio.v1";
const storageVersion = 2;

export type PortfolioLoadResult = {
  holdings: PortfolioHolding[];
  warning?: string;
};

/** Replace this adapter with an authenticated Supabase repository when needed. */
export interface PortfolioRepository {
  load(): PortfolioLoadResult;
  save(holdings: PortfolioHolding[]): void;
  subscribe(listener: () => void): () => void;
}

export const localPortfolioRepository: PortfolioRepository = {
  load() {
    if (typeof window === "undefined") return { holdings: [] };

    let raw: string | null;
    try {
      raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        const legacyRaw = window.localStorage.getItem(legacyStorageKey);
        if (!legacyRaw) return { holdings: [] };
        const legacyDocument = JSON.parse(legacyRaw) as {
          version?: unknown;
          holdings?: unknown;
        };
        if (
          legacyDocument.version !== 1 ||
          !Array.isArray(legacyDocument.holdings)
        ) {
          return {
            holdings: [],
            warning:
              "The saved portfolio could not be read. Its local data has been left untouched.",
          };
        }
        const holdings: PortfolioHolding[] = [];
        for (const value of legacyDocument.holdings) {
          const migratedValue =
            typeof value === "object" && value !== null
              ? { ...value, profileId: "self" }
              : value;
          const parsed = portfolioHoldingSchema.safeParse(migratedValue);
          if (parsed.success) holdings.push(parsed.data);
        }
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({ version: storageVersion, holdings }),
          );
        } catch {
          return {
            holdings,
            warning:
              "Your older portfolio is available, but this browser could not save its updated copy. Free up storage before making changes.",
          };
        }
        return {
          holdings,
          ...(holdings.length !== legacyDocument.holdings.length
            ? {
                warning:
                  "Some saved entries were invalid and were skipped during the portfolio update.",
              }
            : {}),
        };
      }
    } catch {
      return {
        holdings: [],
        warning:
          "The portfolio could not be read because this browser blocked storage or the saved data was malformed. The original local data has been left untouched.",
      };
    }
    if (!raw) return { holdings: [] };

    try {
      const document = JSON.parse(raw) as {
        version?: unknown;
        holdings?: unknown;
      };
      if (document.version !== storageVersion) {
        return {
          holdings: [],
          warning:
            "This portfolio was saved in a different format and could not be opened. Its local data has been left untouched.",
        };
      }
      if (!Array.isArray(document.holdings)) {
        return {
          holdings: [],
          warning:
            "The saved portfolio could not be read. Its local data has been left untouched.",
        };
      }

      const holdings: PortfolioHolding[] = [];
      for (const value of document.holdings) {
        const parsed = portfolioHoldingSchema.safeParse(value);
        if (parsed.success) holdings.push(parsed.data);
      }

      return {
        holdings,
        ...(holdings.length !== document.holdings.length
          ? {
              warning:
                "Some saved entries were invalid and were skipped. The remaining portfolio is available below.",
            }
          : {}),
      };
    } catch {
      return {
        holdings: [],
        warning:
          "The saved portfolio could not be read. Its local data has been left untouched.",
      };
    }
  },

  save(holdings) {
    if (typeof window === "undefined") {
      throw new Error("Portfolio storage is only available in a browser.");
    }
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ version: storageVersion, holdings }),
    );
  },

  subscribe(listener) {
    if (typeof window === "undefined") return () => undefined;
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === storageKey ||
        event.key === legacyStorageKey ||
        event.key === null
      ) {
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};
