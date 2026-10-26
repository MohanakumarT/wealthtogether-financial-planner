import type { PortfolioHolding } from "@/features/portfolio/model";
import { familyProfileSeed } from "@/features/family/model";
import type { FamilyProfileId } from "@/features/family/model";
import {
  formatPortfolioCurrency,
  formatPortfolioDate,
  summarizePortfolio,
} from "@/features/portfolio/model";

function pdfText(value: unknown) {
  return String(value ?? "—")
    .replaceAll("₹", "INR ")
    .replace(/[^ -~]/g, "");
}

function pdfCurrency(value: number) {
  return pdfText(formatPortfolioCurrency(value));
}

export async function downloadPortfolioSummaryPdf(
  holdings: PortfolioHolding[],
  profiles: ReadonlyArray<{
    id: FamilyProfileId;
    name: string;
  }> = familyProfileSeed,
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const document = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const summary = summarizePortfolio(holdings);
  const navy: [number, number, number] = [8, 27, 58];
  const gold: [number, number, number] = [212, 175, 55];
  const muted: [number, number, number] = [101, 114, 132];
  const pageWidth = document.internal.pageSize.getWidth();
  const margin = 15;

  document.setFillColor(...navy);
  document.rect(0, 0, pageWidth, 34, "F");
  document.setFillColor(...gold);
  document.rect(margin, 12, 2, 13, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(14);
  document.text("WEALTHTOGETHER INVESTMENTS", margin + 6, 17);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(222, 229, 238);
  document.text("PORTFOLIO SUMMARY", margin + 6, 24);

  document.setTextColor(...navy);
  document.setFont("helvetica", "bold");
  document.setFontSize(17);
  document.text("Portfolio tracker", margin, 46);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(...muted);
  document.text(
    `Prepared ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })} · ${summary.holdingsCount} holdings`,
    margin,
    52,
  );

  const gainPercent =
    summary.investedAmount > 0
      ? `${(summary.gainLossPercent * 100).toFixed(1)}%`
      : "—";
  autoTable(document, {
    startY: 59,
    head: [
      ["Total invested", "Current value", "Overall gain / loss", "Return"],
    ],
    body: [
      [
        pdfCurrency(summary.investedAmount),
        pdfCurrency(summary.currentValue),
        pdfCurrency(summary.gainLoss),
        gainPercent,
      ],
    ],
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 3.5 },
    theme: "grid",
    margin: { left: margin, right: margin },
  });

  let y =
    (
      document as InstanceType<typeof jsPDF> & {
        lastAutoTable?: { finalY: number };
      }
    ).lastAutoTable?.finalY ?? 78;

  const categories = summary.categorySummaries.filter(
    (category) => category.investedAmount > 0 || category.currentValue > 0,
  );
  autoTable(document, {
    startY: y + 9,
    head: [["Asset category", "Invested", "Current value", "Allocation"]],
    body: categories.map((category) => [
      pdfText(category.label),
      pdfCurrency(category.investedAmount),
      pdfCurrency(category.currentValue),
      `${(category.allocation * 100).toFixed(1)}%`,
    ]),
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2.8 },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    theme: "grid",
    margin: { left: margin, right: margin },
    didDrawPage: ({ pageNumber }) => {
      if (pageNumber > 1) {
        document.setFont("helvetica", "bold");
        document.setFontSize(7);
        document.setTextColor(...navy);
        document.text("WEALTHTOGETHER INVESTMENTS", margin, 10);
        document.setDrawColor(...gold);
        document.line(margin, 14, pageWidth - margin, 14);
      }
    },
  });
  y =
    (
      document as InstanceType<typeof jsPDF> & {
        lastAutoTable?: { finalY: number };
      }
    ).lastAutoTable?.finalY ?? y;

  const sortedHoldings = [...holdings].sort((first, second) =>
    second.investmentDate.localeCompare(first.investmentDate),
  );
  autoTable(document, {
    startY: y + 10,
    head: [
      [
        "Investment",
        "Member",
        "Category",
        "Date",
        "Invested",
        "Current",
        "Gain / loss",
      ],
    ],
    body: sortedHoldings.map((holding) => [
      pdfText(holding.name),
      pdfText(
        profiles.find((profile) => profile.id === holding.profileId)?.name ??
          "Self",
      ),
      pdfText(
        summary.categorySummaries.find(
          (category) => category.category === holding.category,
        )?.label ?? holding.category,
      ),
      pdfText(formatPortfolioDate(holding.investmentDate)),
      pdfCurrency(holding.investedAmount),
      pdfCurrency(holding.currentValue),
      pdfCurrency(holding.currentValue - holding.investedAmount),
    ]),
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    styles: {
      font: "helvetica",
      fontSize: 6.6,
      cellPadding: 2.2,
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    theme: "grid",
    margin: { left: margin, right: margin, top: 20, bottom: 17 },
    didDrawPage: ({ pageNumber }) => {
      if (pageNumber > 1) {
        document.setFont("helvetica", "bold");
        document.setFontSize(7);
        document.setTextColor(...navy);
        document.text("WEALTHTOGETHER INVESTMENTS", margin, 10);
        document.setDrawColor(...gold);
        document.line(margin, 14, pageWidth - margin, 14);
      }
      document.setFont("helvetica", "normal");
      document.setFontSize(7);
      document.setTextColor(...muted);
      document.text(
        "Portfolio values are user-entered estimates, not investment advice or a verified account statement.",
        margin,
        document.internal.pageSize.getHeight() - 9,
      );
      document.text(
        `Page ${pageNumber}`,
        pageWidth - margin,
        document.internal.pageSize.getHeight() - 9,
        { align: "right" },
      );
    },
  });

  const date = new Date().toISOString().slice(0, 10);
  document.save(`wealthtogether-portfolio-${date}.pdf`);
}
