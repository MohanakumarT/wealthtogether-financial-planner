import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { FamilyDashboard } from "@/features/family/family-dashboard";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Family financial dashboard",
  description:
    "Review family goals, investment holdings, insurance, emergency savings and net worth in one browser-based dashboard.",
  path: "/family",
  noIndex: true,
});

export default function FamilyPage() {
  return (
    <>
      <Navigation />
      <main className="px-content mx-auto min-h-[55vh] max-w-7xl py-10 sm:py-14">
        <FamilyDashboard />
      </main>
      <Footer />
    </>
  );
}
