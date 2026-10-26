import { redirect } from "next/navigation";

import { AuthPage } from "@/components/auth/auth-page";
import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { createPageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = createPageMetadata({
  title: "Choose a new password",
  description: "Choose a new password for your WealthTogether account.",
  path: "/auth/update-password",
  noIndex: true,
});

export default async function UpdatePasswordPage() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");
  }

  return (
    <AuthPage
      description="Choose a new password for your WealthTogether account."
      eyebrow="Account recovery"
      title="Choose a new password."
    >
      <UpdatePasswordForm />
    </AuthPage>
  );
}
