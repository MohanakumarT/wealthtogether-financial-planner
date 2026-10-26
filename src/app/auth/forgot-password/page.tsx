import { AuthPage } from "@/components/auth/auth-page";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reset your password",
  description:
    "Request a secure password reset for your WealthTogether account.",
  path: "/auth/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      description="We’ll send a secure reset link if an account is associated with that email address."
      eyebrow="Account recovery"
      title="Reset your password."
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}
