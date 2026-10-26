"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createFamilyDefaults,
  familyFinanceDocumentSchema,
  type FamilyFinanceDocument,
  type FamilyGoal,
  type FamilyInsurance,
  type FamilyProfile,
  type FamilyProfileId,
} from "@/features/family/model";
import { localFamilyFinanceRepository } from "@/features/family/repository";

type State = {
  hydrated: boolean;
  data: FamilyFinanceDocument;
  error: string | null;
  warning: string | null;
};

export function useFamilyFinance() {
  const [state, setState] = useState<State>(() => ({
    hydrated: false,
    data: createFamilyDefaults(),
    error: null,
    warning: null,
  }));
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  }, [state]);

  useEffect(() => {
    const refresh = () => {
      const loaded = localFamilyFinanceRepository.load();
      const next = {
        hydrated: true,
        data: loaded.data,
        error: null,
        warning: loaded.warning ?? null,
      };
      ref.current = next;
      setState(next);
    };
    refresh();
    return localFamilyFinanceRepository.subscribe(refresh);
  }, []);

  const persist = useCallback((data: FamilyFinanceDocument) => {
    try {
      const parsed = familyFinanceDocumentSchema.parse(data);
      localFamilyFinanceRepository.save(parsed);
      const next = { hydrated: true, data: parsed, error: null, warning: null };
      ref.current = next;
      setState(next);
      return true;
    } catch {
      const next = {
        ...ref.current,
        error:
          "These changes could not be saved in this browser. Check available storage and try again.",
      };
      ref.current = next;
      setState(next);
      return false;
    }
  }, []);

  const updateProfile = useCallback(
    (
      id: FamilyProfileId,
      patch: Partial<Omit<FamilyProfile, "id" | "goals" | "insurance">>,
    ) => {
      if (!ref.current.hydrated) return false;
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((profile) =>
          profile.id === id ? { ...profile, ...patch } : profile,
        ),
      });
    },
    [persist],
  );

  const addGoal = useCallback(
    (id: FamilyProfileId, goal: Omit<FamilyGoal, "id">) => {
      if (!ref.current.hydrated) return false;
      const profile = ref.current.data.profiles.find((item) => item.id === id);
      if (!profile || profile.goals.length >= 100) return false;
      const newGoal = {
        ...goal,
        id: globalThis.crypto?.randomUUID?.() ?? `goal-${Date.now()}`,
      };
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id ? { ...item, goals: [...item.goals, newGoal] } : item,
        ),
      });
    },
    [persist],
  );

  const removeGoal = useCallback(
    (id: FamilyProfileId, goalId: string) => {
      if (!ref.current.hydrated) return false;
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id
            ? {
                ...item,
                goals: item.goals.filter((goal) => goal.id !== goalId),
              }
            : item,
        ),
      });
    },
    [persist],
  );

  const updateGoal = useCallback(
    (id: FamilyProfileId, goalId: string, goal: Omit<FamilyGoal, "id">) => {
      if (!ref.current.hydrated) return false;
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id
            ? {
                ...item,
                goals: item.goals.map((existing) =>
                  existing.id === goalId ? { ...goal, id: goalId } : existing,
                ),
              }
            : item,
        ),
      });
    },
    [persist],
  );

  const addInsurance = useCallback(
    (id: FamilyProfileId, policy: Omit<FamilyInsurance, "id">) => {
      if (!ref.current.hydrated) return false;
      const profile = ref.current.data.profiles.find((item) => item.id === id);
      if (!profile || profile.insurance.length >= 100) return false;
      const newPolicy = {
        ...policy,
        id: globalThis.crypto?.randomUUID?.() ?? `policy-${Date.now()}`,
      };
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id
            ? { ...item, insurance: [...item.insurance, newPolicy] }
            : item,
        ),
      });
    },
    [persist],
  );

  const removeInsurance = useCallback(
    (id: FamilyProfileId, policyId: string) => {
      if (!ref.current.hydrated) return false;
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id
            ? {
                ...item,
                insurance: item.insurance.filter(
                  (policy) => policy.id !== policyId,
                ),
              }
            : item,
        ),
      });
    },
    [persist],
  );

  const updateInsurance = useCallback(
    (
      id: FamilyProfileId,
      policyId: string,
      policy: Omit<FamilyInsurance, "id">,
    ) => {
      if (!ref.current.hydrated) return false;
      return persist({
        ...ref.current.data,
        profiles: ref.current.data.profiles.map((item) =>
          item.id === id
            ? {
                ...item,
                insurance: item.insurance.map((existing) =>
                  existing.id === policyId
                    ? { ...policy, id: policyId }
                    : existing,
                ),
              }
            : item,
        ),
      });
    },
    [persist],
  );

  const clearError = useCallback(() => {
    const next = { ...ref.current, error: null };
    ref.current = next;
    setState(next);
  }, []);

  return {
    ...state,
    updateProfile,
    addGoal,
    updateGoal,
    removeGoal,
    addInsurance,
    updateInsurance,
    removeInsurance,
    clearError,
  };
}
