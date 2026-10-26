import { CircleUserRound, ShieldCheck } from "lucide-react";

import { AccountProfileForm } from "@/components/auth/account-profile-form";
import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { Card } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";
import { requireClientAccess } from "@/lib/server/user-auth";

export const metadata = createPageMetadata({
  title: "Your profile",
  description: "Manage your WealthTogether account and profile details.",
  path: "/profile",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const identity = await requireClientAccess("/profile");
  const displayName =
    identity.profile.full_name ||
    identity.email.split("@")[0] ||
    "Your profile";

  return (
    <ClientWorkspaceShell>
      <div className="mx-auto max-w-4xl space-y-7">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Account settings
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Your profile
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Update the details connected to your WealthTogether account.
          </p>
        </div>
        <Card className="flex items-center gap-3 p-4 sm:p-5">
          <span className="bg-accent text-accent-foreground grid size-11 shrink-0 place-items-center rounded-xl">
            {identity.profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="size-11 rounded-xl object-cover"
                src={identity.profile.avatar}
              />
            ) : (
              <CircleUserRound aria-hidden="true" className="size-6" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-muted-foreground truncate text-xs">
              {identity.email}
            </p>
          </div>
          <span className="border-border text-muted-foreground ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs capitalize">
            <ShieldCheck aria-hidden="true" className="text-primary size-3.5" />
            {identity.role}
          </span>
        </Card>
        <AccountProfileForm email={identity.email} profile={identity.profile} />
      </div>
    </ClientWorkspaceShell>
  );
}
