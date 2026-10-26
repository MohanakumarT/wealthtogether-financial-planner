import { FileText, History } from "lucide-react";

import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedCalculationsList } from "@/app/history/saved-calculations-list";
import type { SavedCalculationRecord } from "@/features/calculators/saved/saved-calculations";
import { createPageMetadata } from "@/lib/seo";
import { requireClientAccess } from "@/lib/server/user-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = createPageMetadata({
  title: "Your reports",
  description: "Review saved financial calculations and planning reports.",
  path: "/reports",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireClientAccess("/reports");
  const supabase = await createSupabaseServerClient();
  let records: SavedCalculationRecord[] = [];
  let needsSetup = !supabase;
  let loadFailed = false;
  if (supabase) {
    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      needsSetup = error.code === "42P01" || error.code === "PGRST205";
      loadFailed = !needsSetup;
    } else {
      records = (data ?? []) as unknown as SavedCalculationRecord[];
    }
  }

  return (
    <ClientWorkspaceShell>
      <div className="space-y-7">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Your planning workspace
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Reports & saved plans
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
            Revisit the calculations you saved and continue refining your
            assumptions over time.
          </p>
        </div>
        {needsSetup ? (
          <Card>
            <CardContent className="flex items-start gap-3 p-5 sm:p-6">
              <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-xl">
                <History aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Report storage needs setup</h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Apply the saved calculations migration in your Supabase
                  project to keep reports in your account.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : loadFailed ? (
          <p
            className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm"
            role="alert"
          >
            Saved reports could not be loaded. Please refresh the page and try
            again.
          </p>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-xl">
                  <FileText aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle>Saved calculations</CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {records.length} saved{" "}
                    {records.length === 1 ? "plan" : "plans"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SavedCalculationsList initialRecords={records} />
            </CardContent>
          </Card>
        )}
      </div>
    </ClientWorkspaceShell>
  );
}
