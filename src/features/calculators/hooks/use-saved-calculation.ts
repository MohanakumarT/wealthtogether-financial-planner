"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues } from "react-hook-form";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type {
  CalculatorDefinition,
  CalculatorResult,
} from "@/features/calculators/types";
import type { SavedCalculationRecord } from "@/features/calculators/saved/saved-calculations";

type SaveStatus = "checking" | "signed-in" | "signed-out" | "unconfigured";
type BrowserSupabaseClient = NonNullable<
  ReturnType<typeof import("@/lib/supabase/client").createSupabaseBrowserClient>
>;

export function useSavedCalculation<TValues extends FieldValues>(
  definition: CalculatorDefinition<TValues>,
  result: CalculatorResult | null,
  calculatedValues: TValues | null,
  restore: (inputs: unknown) => boolean,
) {
  const [status, setStatus] = useState<SaveStatus>(() =>
    getSupabasePublicEnv() ? "checking" : "unconfigured",
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedName, setSavedName] = useState(definition.title);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const clientPromise = useRef<Promise<BrowserSupabaseClient | null> | null>(
    null,
  );
  const subscription = useRef<{ unsubscribe: () => void } | null>(null);

  const getClient = useCallback(() => {
    if (!getSupabasePublicEnv()) return Promise.resolve(null);
    if (!clientPromise.current) {
      clientPromise.current = import("@/lib/supabase/client").then(
        ({ createSupabaseBrowserClient }) => createSupabaseBrowserClient(),
      );
    }
    return clientPromise.current;
  }, []);

  const prepareSave = useCallback(async () => {
    setBusy(true);
    try {
      const supabase = await getClient();
      if (!supabase) {
        setStatus("unconfigured");
        return false;
      }

      if (!subscription.current) {
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setStatus(session?.user ? "signed-in" : "signed-out");
        });
        subscription.current = authSubscription;
      }

      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const signedIn = Boolean(data.user);
      setStatus(signedIn ? "signed-in" : "signed-out");
      return signedIn;
    } catch {
      setStatus("signed-out");
      return false;
    } finally {
      setBusy(false);
    }
  }, [getClient]);

  useEffect(
    () => () => {
      subscription.current?.unsubscribe();
    },
    [],
  );

  const load = useCallback(
    async (id: string) => {
      if (!(await prepareSave())) {
        setMessage("Sign in to load a saved calculation from your account.");
        return false;
      }
      const supabase = await getClient();
      if (!supabase) return false;
      setBusy(true);
      setMessage("");
      try {
        const { data, error } = await supabase
          .from("saved_calculations")
          .select("*")
          .eq("id", id)
          .eq("calculator_id", definition.id)
          .maybeSingle();
        if (error || !data) {
          setMessage(
            "That saved calculation could not be loaded. Check your account and try again.",
          );
          return false;
        }
        const record = data as unknown as SavedCalculationRecord;
        if (!restore(record.inputs)) {
          setMessage(
            "These saved inputs no longer match this calculator. Start a fresh scenario instead.",
          );
          return false;
        }
        setSavedId(record.id);
        setSavedName(record.name);
        setMessage(`Loaded “${record.name}”. Save changes when you’re ready.`);
        return true;
      } catch {
        setMessage(
          "We couldn’t reach your saved calculations. Check your connection and try again.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [definition.id, getClient, prepareSave, restore],
  );

  const save = useCallback(
    async (name: string) => {
      const cleanName = name.trim();
      if (status !== "signed-in" && !(await prepareSave())) {
        setMessage(
          getSupabasePublicEnv()
            ? "Sign in to save calculations to your account."
            : "Add your Supabase project settings before saving calculations.",
        );
        return false;
      }
      const supabase = await getClient();
      if (!supabase) {
        setMessage(
          "Add your Supabase project settings before saving calculations.",
        );
        return false;
      }
      if (!result || !calculatedValues) {
        setMessage("Calculate this scenario before saving it.");
        return false;
      }
      if (!cleanName || cleanName.length > 80) {
        setMessage("Enter a name between 1 and 80 characters.");
        return false;
      }

      setBusy(true);
      setMessage("");
      const values = {
        name: cleanName,
        calculator_id: definition.id,
        calculator_title: definition.title,
        inputs: calculatedValues,
        results: { metrics: result.metrics },
      };
      try {
        const response = savedId
          ? await supabase
              .from("saved_calculations")
              .update(values)
              .eq("id", savedId)
              .select("id")
              .single()
          : await supabase
              .from("saved_calculations")
              .insert(values)
              .select("id")
              .single();

        if (response.error || !response.data) {
          const missingTable =
            response.error?.code === "42P01" ||
            response.error?.code === "PGRST205";
          setMessage(
            missingTable
              ? "Saved calculations aren’t set up yet. Apply the saved_calculations migration in Supabase."
              : (response.error?.message ??
                  "Your calculation could not be saved."),
          );
          return false;
        }
        setSavedId(response.data.id);
        setSavedName(cleanName);
        setMessage(
          savedId
            ? "Your changes have been saved."
            : "Calculation saved to your history.",
        );
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("edit", response.data.id);
        window.history.replaceState(null, "", nextUrl.toString());
        return true;
      } catch {
        setMessage(
          "We couldn’t reach your saved calculations. Check your connection and try again.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [
      calculatedValues,
      definition.id,
      definition.title,
      getClient,
      prepareSave,
      result,
      savedId,
      status,
    ],
  );

  const clear = useCallback(() => {
    setSavedId(null);
    setSavedName(definition.title);
    setMessage("");
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("edit");
      window.history.replaceState(null, "", nextUrl.toString());
    }
  }, [definition.title]);

  return {
    status,
    prepareSave,
    savedId,
    savedName,
    busy,
    message,
    setMessage,
    load,
    save,
    clear,
  };
}
