import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { PortfolioTracker } from "@/features/portfolio/portfolio-tracker";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Portfolio Tracker",
  description:
    "Manually track mutual funds, stocks, deposits, retirement accounts, gold, and cash in one private browser-based portfolio view.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <Navigation />
      <main className="px-content mx-auto min-h-[65vh] max-w-7xl py-9 sm:py-14">
        <PortfolioTracker />
      </main>
      <Footer />
    </>
  );
}
