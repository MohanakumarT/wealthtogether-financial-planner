import { redirect } from "next/navigation";

import { getAdminAccess } from "@/lib/server/admin-auth";

export const metadata = {
  title: "Client management | WealthTogether",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ClientManagementAliasPage() {
  const access = await getAdminAccess();
  if (!access) redirect("/admin/login");
  redirect("/admin/clients");
}
