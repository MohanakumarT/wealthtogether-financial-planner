import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { FamilyDashboard } from "@/features/family/family-dashboard";
import { createPageMetadata } from "@/lib/seo";
import { requireClientAccess } from "@/lib/server/user-auth";

export const metadata = createPageMetadata({
  title: "Family financial dashboard",
  description:
    "Review family goals, investment holdings, insurance, emergency savings and net worth in one browser-based dashboard.",
  path: "/family",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const identity = await requireClientAccess("/family");
  return (
    <ClientWorkspaceShell>
      <main className="px-content mx-auto min-h-[55vh] max-w-7xl py-10 sm:py-14">
        <FamilyDashboard key={identity.id} userId={identity.id} />
      </main>
    </ClientWorkspaceShell>
  );
}
