import { redirect } from "next/navigation";
import { CircleUserRound, ShieldCheck } from "lucide-react";

import { AuthPage } from "@/components/auth/auth-page";
import { ProfileForm } from "@/components/auth/auth-forms";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = createPageMetadata({
  title: "Your profile",
  description: "Manage your WealthTogether account and profile details.",
  path: "/profile",
  noIndex: true,
});

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <AuthPage
        description="Add your Supabase project settings to enable account access."
        eyebrow="Profile setup"
        title="Connect your account."
      >
        <div className="border-border bg-muted text-muted-foreground rounded-xl border p-4 text-sm leading-6">
          Set <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="text-foreground">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>{" "}
          in your local environment, then restart the app.
        </div>
      </AuthPage>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=%2Fprofile");

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";
  const displayName = fullName || user.email?.split("@")[0] || "there";

  return (
    <>
      <AuthPage
        description="Manage the details connected to your WealthTogether account."
        eyebrow="Your account"
        title={`Welcome, ${displayName}.`}
      >
        <div className="bg-muted mb-7 flex items-center gap-3 rounded-2xl p-4">
          <span className="bg-background text-foreground grid size-11 shrink-0 place-items-center rounded-xl">
            <CircleUserRound aria-hidden="true" className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">
              {fullName || "Your profile"}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email}
            </p>
          </div>
          <ShieldCheck
            aria-hidden="true"
            className="ml-auto size-5 shrink-0 text-emerald-600 dark:text-emerald-300"
          />
        </div>
        <ProfileForm email={user.email ?? ""} initialName={fullName} />
      </AuthPage>
    </>
  );
}
