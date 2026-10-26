import { AuthPage } from "@/components/auth/auth-page";
import { LoginForm } from "@/components/auth/auth-forms";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to manage your WealthTogether financial plans.",
  path: "/auth/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <AuthPage
      description="Sign in to continue to your financial planning profile."
      eyebrow="Welcome back"
      title="Good to see you."
    >
      <LoginForm
        callbackFailed={error === "auth_callback_failed"}
        nextPath={safeRedirectPath(next)}
      />
    </AuthPage>
  );
}
