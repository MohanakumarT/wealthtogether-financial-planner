import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/admin-shell";
import { getAdminAccess } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAdminAccess();
  if (!access) redirect("/admin/login");
  return (
    <AdminShell email={access.email} role={access.role}>
      {children}
    </AdminShell>
  );
}
