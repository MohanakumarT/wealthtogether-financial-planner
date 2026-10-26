import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { SavedCalculationsList } from "@/app/history/saved-calculations-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPageMetadata } from "@/lib/seo";
import type { SavedCalculationRecord } from "@/features/calculators/saved/saved-calculations";

export const metadata = createPageMetadata({
  title: "Saved financial plans",
  description: "Review and manage your saved WealthTogether financial plans.",
  path: "/history",
  noIndex: true,
});

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <>
        <Navigation />
        <main className="px-content mx-auto min-h-[55vh] max-w-7xl py-12 sm:py-16">
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            WealthTogether Investments
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Saved calculations
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-6">
            Connect your Supabase project and apply the saved calculations
            migration to enable your private planning history.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=%2Fhistory");

  const { data, error } = await supabase
    .from("saved_calculations")
    .select("*")
    .order("updated_at", { ascending: false });
  const tableMissing = error?.code === "42P01" || error?.code === "PGRST205";
  const setupMessage = error
    ? tableMissing
      ? "History storage is not enabled yet. Apply supabase/migrations/20261026000000_saved_calculations.sql in your Supabase project."
      : "Your saved calculations could not be loaded. Check your Supabase configuration and try again."
    : undefined;
  const records = error ? [] : (data as unknown as SavedCalculationRecord[]);

  return (
    <>
      <Navigation />
      <main className="px-content mx-auto min-h-[55vh] max-w-7xl py-10 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Your planning workspace
            </p>
            <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
              Saved calculations
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
              Revisit your assumptions, update a plan, or make a copy to compare
              another path.
            </p>
          </div>
        </div>
        <SavedCalculationsList
          initialRecords={records}
          setupMessage={setupMessage}
        />
      </main>
      <Footer />
    </>
  );
}
