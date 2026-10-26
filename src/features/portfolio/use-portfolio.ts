"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { localPortfolioRepository } from "@/features/portfolio/repository";
import {
  portfolioHoldingInputSchema,
  type PortfolioHolding,
  type PortfolioHoldingInput,
} from "@/features/portfolio/model";

type PortfolioState = {
  hydrated: boolean;
  holdings: PortfolioHolding[];
  error: string | null;
  warning: string | null;
};

const initialState: PortfolioState = {
  hydrated: false,
  holdings: [],
  error: null,
  warning: null,
};

export function usePortfolio(userId: string) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const refresh = () => {
      const loaded = localPortfolioRepository.load(userId);
      const next: PortfolioState = {
        hydrated: true,
        holdings: loaded.holdings,
        error: null,
        warning: loaded.warning ?? null,
      };
      stateRef.current = next;
      setState(next);
    };
    if (!userId) return;
    refresh();
    return localPortfolioRepository.subscribe(userId, refresh);
  }, [userId]);

  const persist = useCallback(
    (holdings: PortfolioHolding[]) => {
      try {
        localPortfolioRepository.save(userId, holdings);
        const next: PortfolioState = {
          hydrated: true,
          holdings,
          error: null,
          warning: null,
        };
        stateRef.current = next;
        setState(next);
        return true;
      } catch {
        const next = {
          ...stateRef.current,
          error:
            "Your changes could not be saved in this browser. Check the available storage and try again.",
        };
        stateRef.current = next;
        setState(next);
        return false;
      }
    },
    [userId],
  );

  const add = useCallback(
    (input: PortfolioHoldingInput) => {
      const parsed = portfolioHoldingInputSchema.safeParse(input);
      if (!parsed.success || !stateRef.current.hydrated) return false;
      if (stateRef.current.holdings.length >= 1_000) {
        const next = {
          ...stateRef.current,
          error: "This portfolio has reached the 1,000-holding limit.",
        };
        stateRef.current = next;
        setState(next);
        return false;
      }
      const id =
        globalThis.crypto?.randomUUID?.() ??
        `holding-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return persist([...stateRef.current.holdings, { ...parsed.data, id }]);
    },
    [persist],
  );

  const update = useCallback(
    (id: string, input: PortfolioHoldingInput) => {
      const parsed = portfolioHoldingInputSchema.safeParse(input);
      if (!parsed.success || !stateRef.current.hydrated) return false;
      const exists = stateRef.current.holdings.some(
        (holding) => holding.id === id,
      );
      if (!exists) return false;
      return persist(
        stateRef.current.holdings.map((holding) =>
          holding.id === id ? { ...parsed.data, id } : holding,
        ),
      );
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      if (!stateRef.current.hydrated) return false;
      return persist(
        stateRef.current.holdings.filter((holding) => holding.id !== id),
      );
    },
    [persist],
  );

  const clearError = useCallback(() => {
    const next = { ...stateRef.current, error: null };
    stateRef.current = next;
    setState(next);
  }, []);

  return {
    ...state,
    add,
    update,
    remove,
    clearError,
  };
}
