import { ConsultationsList } from "@/features/admin/consultations-list";

export const metadata = {
  title: "Consultations | WealthTogether Admin",
  robots: { index: false, follow: false },
};

export default function AdminConsultationsPage() {
  return <ConsultationsList />;
}
