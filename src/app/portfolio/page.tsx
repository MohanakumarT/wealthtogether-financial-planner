import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { PortfolioTracker } from "@/features/portfolio/portfolio-tracker";
import { createPageMetadata } from "@/lib/seo";
import { requireClientAccess } from "@/lib/server/user-auth";

export const metadata = createPageMetadata({
  title: "Portfolio Tracker",
  description:
    "Manually track mutual funds, stocks, deposits, retirement accounts, gold, and cash in one private browser-based portfolio view.",
  path: "/portfolio",
});
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const identity = await requireClientAccess("/portfolio");
  return (
    <ClientWorkspaceShell>
      <main className="px-content mx-auto min-h-[65vh] max-w-7xl py-9 sm:py-14">
        <PortfolioTracker key={identity.id} userId={identity.id} />
      </main>
    </ClientWorkspaceShell>
  );
}
