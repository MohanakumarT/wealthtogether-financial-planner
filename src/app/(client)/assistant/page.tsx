import { ClientWorkspaceShell } from "@/components/auth/client-workspace-shell";
import { AssistantWorkspace } from "@/features/financial-assistant/assistant-workspace";
import { createPageMetadata } from "@/lib/seo";
import { requireClientAccess } from "@/lib/server/user-auth";

export const metadata = createPageMetadata({
  title: "AI financial assistant",
  description: "Explore financial planning concepts in plain language.",
  path: "/assistant",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const identity = await requireClientAccess("/assistant");
  return (
    <ClientWorkspaceShell>
      <AssistantWorkspace profile={identity.profile} userId={identity.id} />
    </ClientWorkspaceShell>
  );
}
