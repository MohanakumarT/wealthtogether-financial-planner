import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { requireClientAccess } from "@/lib/server/user-auth";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Your dashboard",
  description: "Your private WealthTogether financial planning dashboard.",
  path: "/dashboard",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await requireClientAccess("/dashboard");
  const firstName =
    identity.profile.full_name.trim().split(/\s+/)[0] || "there";
  return (
    <ClientWorkspaceShell>
      <DashboardOverview firstName={firstName} />
    </ClientWorkspaceShell>
  );
}
