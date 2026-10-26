import { notFound } from "next/navigation";
import { z } from "zod";

import { ClientProfile } from "@/features/admin/client-profile";

export const metadata = {
  title: "Client profile | WealthTogether Admin",
  robots: { index: false, follow: false },
};

export default async function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <ClientProfile id={id} />;
}
