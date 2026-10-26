import { AdminOverview } from "@/features/admin/admin-overview";

export const metadata = {
  title: "Overview | WealthTogether Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminOverview />;
}
