import { AuthPage } from "@/components/auth/auth-page";
import { SignupForm } from "@/components/auth/auth-forms";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Create your account",
  description: "Create a WealthTogether account to save your financial plans.",
  path: "/auth/sign-up",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <AuthPage
      description="Create a secure account to personalize your WealthTogether planning experience."
      eyebrow="Get started"
      title="Plan with confidence."
    >
      <SignupForm />
    </AuthPage>
  );
}
