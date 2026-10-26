import { redirect } from "next/navigation";

import { AdminSettings } from "@/features/admin/admin-settings";
import { getAdminAccess } from "@/lib/server/admin-auth";

export const metadata = {
  title: "Admin Settings | WealthTogether",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const access = await getAdminAccess();
  if (!access) redirect("/admin/login");
  if (access.role !== "owner") redirect("/admin");
  return <AdminSettings />;
}
