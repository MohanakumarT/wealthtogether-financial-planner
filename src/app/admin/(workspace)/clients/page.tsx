import { ClientsList } from "@/features/admin/clients-list";

export const metadata = {
  title: "Clients | WealthTogether Admin",
  robots: { index: false, follow: false },
};

export default function ClientsPage() {
  return <ClientsList />;
}
