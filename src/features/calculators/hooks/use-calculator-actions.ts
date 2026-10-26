"use client";

import { useCallback, useState } from "react";
import type { FieldValues } from "react-hook-form";

import {
  formatCalculatorValue,
  formatCompactCalculatorValue,
} from "@/features/calculators/format";
import type {
  CalculatorChart,
  CalculatorDefinition,
  CalculatorInputField,
  CalculatorResult,
  CalculatorValueFormat,
} from "@/features/calculators/types";

export type CalculatorActionMessage = {
  kind: "success" | "error";
  text: string;
};

function readPath(values: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object")
      return (current as Record<string, unknown>)[key];
    return undefined;
  }, values);
}

function sanitizePdfText(value: unknown) {
  return String(value ?? "—")
    .replaceAll("₹", "INR ")
    .replaceAll("×", "x")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("·", "-")
    .replaceAll("•", "-")
    .replaceAll("…", "...")
    .replace(/[^\x20-\x7E]/g, "");
}

function formatPdfValue(
  value: number | string | null | undefined,
  format: CalculatorValueFormat = "number",
  currency = "INR",
) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string") return sanitizePdfText(value);
  if (!Number.isFinite(value)) return "-";

  if (format === "currency") {
    const formatted = new Intl.NumberFormat(
      currency.toUpperCase() === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      },
    ).format(value);
    return sanitizePdfText(formatted);
  }
  if (format === "percent") {
    return sanitizePdfText(formatCalculatorValue(value, "percent"));
  }
  return sanitizePdfText(
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value),
  );
}

function formatPdfInputValue<TValues extends FieldValues>(
  value: unknown,
  field: CalculatorInputField<TValues>,
) {
  if (value === null || value === undefined || value === "") return "-";
  if (field.type === "select") {
    const option = field.options?.find((item) => item.value === String(value));
    return sanitizePdfText(option?.label ?? value);
  }
  if (field.type === "currency")
    return formatPdfValue(Number(value), "currency");
  if (field.type === "percentage") {
    return `${formatPdfValue(Number(value), "number")}${field.suffix ? ` ${sanitizePdfText(field.suffix)}` : "%"}`;
  }
  if (typeof value === "number") {
    const suffix = field.suffix ? ` ${sanitizePdfText(field.suffix)}` : "";
    return `${formatPdfValue(value, "number")}${suffix}`;
  }
  return sanitizePdfText(value);
}

function getRecommendations(
  definition: CalculatorDefinition<FieldValues>,
  result: CalculatorResult,
) {
  const metricByLabel = (pattern: RegExp) =>
    result.metrics.find((metric) => pattern.test(metric.label));
  const sipMetric = metricByLabel(/monthly.*(?:sip|contribution|savings)/i);
  const progressMetric = metricByLabel(/progress|score|coverage/i);
  const contributionField = definition.fields.find((field) =>
    /monthly.*(?:sip|contribution|savings)/i.test(field.label),
  );

  if (definition.id === "swp-calculator") {
    return [
      "Compare a lower withdrawal amount and a more conservative return assumption to see how corpus longevity changes.",
      "Review the withdrawal plan regularly; actual returns, taxes, and fees can change the depletion timeline.",
      "Keep a separate liquid reserve for near-term expenses so withdrawals do not depend on selling long-term assets at an unfavorable time.",
    ];
  }

  const recommendations: string[] = [];
  if (sipMetric) {
    recommendations.push(
      `Check that the estimated ${formatPdfValue(sipMetric.value, sipMetric.format, sipMetric.currency)} monthly contribution fits your regular cash flow. If it does not, revisit the target amount or timeline.`,
    );
  } else if (contributionField) {
    recommendations.push(
      `Review the ${contributionField.label.toLowerCase()} against your monthly budget and adjust it when your cash flow changes.`,
    );
  }

  if (definition.id === "inflation-calculator") {
    recommendations.push(
      "Compare several inflation rates and time periods; actual price changes can differ from a constant-rate projection.",
    );
  } else if (definition.id === "lumpsum-calculator") {
    recommendations.push(
      "Compare a range of return assumptions and time periods rather than relying on a single growth forecast.",
    );
  } else if (definition.id === "emergency-fund-calculator") {
    recommendations.push(
      "Keep an emergency reserve accessible and separate from investments intended for long-term growth.",
    );
  } else if (
    definition.fields.some((field) => /inflation/i.test(field.label)) &&
    definition.fields.some((field) => /return/i.test(field.label))
  ) {
    recommendations.push(
      "Stress-test the plan with higher inflation and a lower expected return instead of relying on a single forecast.",
    );
  } else {
    recommendations.push(
      "Compare at least one alternative timeline or contribution amount before treating this estimate as a target.",
    );
  }

  if (progressMetric) {
    recommendations.push(
      `Use ${sanitizePdfText(progressMetric.label.toLowerCase())} as a planning checkpoint, then update the inputs as your savings and goals change.`,
    );
  } else {
    recommendations.push(
      "Review the assumptions and refresh this projection when your costs, time horizon, or financial priorities change.",
    );
  }
  return recommendations.slice(0, 3);
}

export function useCalculatorActions<TValues extends FieldValues>(
  definition: CalculatorDefinition<TValues>,
  result: CalculatorResult | null,
  values: TValues,
) {
  const [message, setMessage] = useState<CalculatorActionMessage | null>(null);
  const clearMessage = useCallback(() => setMessage(null), []);

  const share = useCallback(async () => {
    if (!result || typeof window === "undefined") return;
    const summary = result.metrics
      .map(
        (metric) =>
          `${metric.label}: ${formatCalculatorValue(metric.value, metric.format, metric.currency)}`,
      )
      .join("\n");
    const safeUrl = new URL(window.location.href);
    safeUrl.search = "";
    safeUrl.hash = "";
    const text = `${definition.title}\n${summary}\n\nShared from WealthTogether Investments`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: definition.title,
          text,
          url: safeUrl.toString(),
        });
        setMessage({ kind: "success", text: "Scenario shared." });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${safeUrl.toString()}`);
      setMessage({
        kind: "success",
        text: "Summary and link copied. Your input assumptions stay private.",
      });
    } catch {
      setMessage({
        kind: "error",
        text: "Sharing isn’t available in this browser.",
      });
    }
  }, [definition.title, result]);

  const downloadPdf = useCallback(async () => {
    if (!result) return;
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const navy: [number, number, number] = [8, 27, 58];
      const gold: [number, number, number] = [212, 175, 55];
      const bodyText: [number, number, number] = [39, 51, 68];
      const mutedText: [number, number, number] = [101, 114, 132];
      const border: [number, number, number] = [226, 231, 237];
      const palette: [number, number, number][] = [
        gold,
        [77, 120, 184],
        [77, 146, 115],
        [168, 121, 182],
      ];
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const pagesWithHeader = new Set<number>([1]);

      const currentPage = () => doc.getNumberOfPages();
      const drawRunningHeader = () => {
        const page = currentPage();
        if (page === 1 || pagesWithHeader.has(page)) return;
        pagesWithHeader.add(page);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...navy);
        doc.text("WEALTHTOGETHER INVESTMENTS", margin, 10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedText);
        doc.text(sanitizePdfText(definition.title), pageWidth - margin, 10, {
          align: "right",
        });
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, 14, pageWidth - margin, 14);
      };

      const addContinuationPage = () => {
        doc.addPage();
        drawRunningHeader();
        return 23;
      };

      const ensureSpace = (y: number, requiredHeight: number) =>
        y + requiredHeight > pageHeight - 19 ? addContinuationPage() : y;

      const addSectionHeading = (title: string, y: number) => {
        const top = ensureSpace(y, 11);
        doc.setDrawColor(...gold);
        doc.setLineWidth(1);
        doc.line(margin, top + 1, margin, top + 7);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...navy);
        doc.text(sanitizePdfText(title), margin + 4, top + 6);
        return top + 11;
      };

      const appendTable = (
        title: string,
        head: string[],
        body: string[][],
        startY: number,
      ) => {
        const tableReady = ensureSpace(startY, 30);
        const tableStart = addSectionHeading(title, tableReady);
        autoTable(doc, {
          startY: tableStart,
          head: [head.map(sanitizePdfText)],
          body: body.map((row) => row.map(sanitizePdfText)),
          headStyles: {
            fillColor: navy,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
          },
          alternateRowStyles: { fillColor: [247, 248, 250] },
          styles: {
            font: "helvetica",
            fontSize: 7.2,
            textColor: bodyText,
            cellPadding: 2.2,
            overflow: "linebreak",
            valign: "middle",
          },
          margin: { left: margin, right: margin, top: 23, bottom: 19 },
          theme: "grid",
          tableLineColor: border,
          tableLineWidth: 0.15,
          willDrawPage: drawRunningHeader,
        });
        const finalY = (
          doc as InstanceType<typeof jsPDF> & {
            lastAutoTable?: { finalY: number };
          }
        ).lastAutoTable?.finalY;
        return (finalY ?? tableStart) + 8;
      };

      const colorFor = (hex: string | undefined, index: number) => {
        const match = hex?.match(/^#([\da-f]{6})$/i);
        if (!match) return palette[index % palette.length];
        const value = match[1];
        return [
          Number.parseInt(value.slice(0, 2), 16),
          Number.parseInt(value.slice(2, 4), 16),
          Number.parseInt(value.slice(4, 6), 16),
        ] as [number, number, number];
      };

      const tint = (color: [number, number, number]) =>
        color.map((component) => Math.round(component * 0.18 + 255 * 0.82)) as [
          number,
          number,
          number,
        ];

      const drawPdfChart = (chart: CalculatorChart, startY: number) => {
        const legendRows = Math.ceil(chart.series.length / 2);
        const cardHeight = 69 + legendRows * 5;
        const top = ensureSpace(startY, cardHeight + 4);
        doc.setDrawColor(...border);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, top, contentWidth, cardHeight, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...navy);
        doc.text(sanitizePdfText(chart.title), margin + 5, top + 7);
        if (chart.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(...mutedText);
          doc.text(
            doc.splitTextToSize(
              sanitizePdfText(chart.description),
              contentWidth - 10,
            )[0],
            margin + 5,
            top + 12,
          );
        }

        const plotX = margin + 24;
        const plotY = top + 17;
        const plotWidth = contentWidth - 31;
        const plotHeight = 31;
        const data = chart.data;
        const allValues = chart.series.flatMap((series) =>
          data
            .map((row) => Number(row[series.key] ?? 0))
            .filter(Number.isFinite),
        );
        const maxValue = Math.max(1, ...allValues);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        for (let tick = 0; tick <= 3; tick += 1) {
          const value = (maxValue * (3 - tick)) / 3;
          const y = plotY + (plotHeight * tick) / 3;
          doc.setDrawColor(...border);
          doc.setLineWidth(0.15);
          doc.line(plotX, y, plotX + plotWidth, y);
          doc.setTextColor(...mutedText);
          doc.text(
            sanitizePdfText(
              formatCompactCalculatorValue(
                value,
                chart.valueFormat,
                chart.currency,
              ),
            ),
            plotX - 2,
            y + 1,
            { align: "right" },
          );
        }
        doc.setDrawColor(...mutedText);
        doc.setLineWidth(0.3);
        doc.line(plotX, plotY, plotX, plotY + plotHeight);
        doc.line(
          plotX,
          plotY + plotHeight,
          plotX + plotWidth,
          plotY + plotHeight,
        );

        if (chart.kind === "bar") {
          const slotWidth = plotWidth / Math.max(data.length, 1);
          const groupWidth = slotWidth * 0.72;
          const barWidth = groupWidth / Math.max(chart.series.length, 1);
          data.forEach((row, dataIndex) => {
            chart.series.forEach((series, seriesIndex) => {
              const value = Math.max(0, Number(row[series.key] ?? 0));
              if (!Number.isFinite(value)) return;
              const barHeight = (value / maxValue) * plotHeight;
              const x =
                plotX +
                dataIndex * slotWidth +
                (slotWidth - groupWidth) / 2 +
                seriesIndex * barWidth;
              doc.setFillColor(...colorFor(series.color, seriesIndex));
              doc.rect(
                x,
                plotY + plotHeight - barHeight,
                Math.max(0.7, barWidth - 0.5),
                barHeight,
                "F",
              );
            });
          });
        } else {
          chart.series.forEach((series, seriesIndex) => {
            const color = colorFor(series.color, seriesIndex);
            const points = data.map((row, index) => {
              const value = Math.max(0, Number(row[series.key] ?? 0));
              return {
                x:
                  plotX +
                  (data.length <= 1
                    ? plotWidth / 2
                    : (index / (data.length - 1)) * plotWidth),
                y: plotY + plotHeight - (value / maxValue) * plotHeight,
              };
            });

            if (chart.kind === "area" && points.length > 1) {
              doc.setFillColor(...tint(color));
              for (let index = 0; index < points.length - 1; index += 1) {
                const first = points[index];
                const second = points[index + 1];
                doc.triangle(
                  first.x,
                  first.y,
                  second.x,
                  second.y,
                  second.x,
                  plotY + plotHeight,
                  "F",
                );
                doc.triangle(
                  first.x,
                  first.y,
                  second.x,
                  plotY + plotHeight,
                  first.x,
                  plotY + plotHeight,
                  "F",
                );
              }
            }

            doc.setDrawColor(...color);
            doc.setFillColor(...color);
            doc.setLineWidth(0.8);
            for (let index = 0; index < points.length - 1; index += 1) {
              doc.line(
                points[index].x,
                points[index].y,
                points[index + 1].x,
                points[index + 1].y,
              );
            }
            if (points.length < 24) {
              points.forEach((point) =>
                doc.circle(point.x, point.y, 0.55, "F"),
              );
            }
          });
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(chart.kind === "bar" ? 5.8 : 6.2);
        doc.setTextColor(...mutedText);
        const labelAt = (index: number) => {
          const label = sanitizePdfText(data[index]?.[chart.xKey] ?? "");
          const maxLength = chart.kind === "bar" ? 9 : 12;
          return label.length > maxLength
            ? `${label.slice(0, maxLength - 1)}...`
            : label;
        };
        if (chart.kind === "bar") {
          const slotWidth = plotWidth / Math.max(data.length, 1);
          data.forEach((_, index) => {
            doc.text(
              labelAt(index),
              plotX + slotWidth * (index + 0.5),
              plotY + plotHeight + 4,
              {
                align: "center",
              },
            );
          });
        } else if (data.length > 0) {
          const labelIndices = new Set<number>([0, data.length - 1]);
          const step = Math.max(1, Math.ceil(data.length / 6));
          for (let index = 0; index < data.length; index += step) {
            labelIndices.add(index);
          }
          for (const index of labelIndices) {
            const x =
              plotX +
              (data.length <= 1
                ? plotWidth / 2
                : (index / (data.length - 1)) * plotWidth);
            doc.text(labelAt(index), x, plotY + plotHeight + 4, {
              align: "center",
            });
          }
        }

        const legendY = top + 61;
        chart.series.forEach((series, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          const x = margin + 7 + column * (contentWidth / 2);
          const y = legendY + row * 5;
          const color = colorFor(series.color, index);
          doc.setDrawColor(...color);
          doc.setFillColor(...color);
          if (chart.kind === "bar") doc.rect(x, y - 2.2, 3.2, 2.2, "F");
          else doc.line(x, y - 1.2, x + 4, y - 1.2);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.2);
          doc.setTextColor(...bodyText);
          const label = sanitizePdfText(series.label);
          doc.text(
            label.length > 37 ? `${label.slice(0, 34)}...` : label,
            x + 6,
            y,
          );
        });
        return top + cardHeight + 5;
      };

      doc.setProperties({
        title: `${definition.title} - WealthTogether Investments`,
        subject: "Financial planning report",
        author: "WealthTogether Investments",
        creator: "WealthTogether Financial Planner",
      });
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 43, "F");
      doc.setFillColor(...gold);
      doc.rect(0, 43, pageWidth, 1.2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("WealthTogether Investments", margin, 15);
      doc.setFontSize(7);
      doc.setTextColor(232, 219, 170);
      doc.text("PERSONAL FINANCIAL PLANNING REPORT", margin, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(sanitizePdfText(definition.title), margin, 34);
      doc.setFontSize(7);
      doc.setTextColor(232, 219, 170);
      doc.text(
        `PREPARED ${sanitizePdfText(new Date().toLocaleDateString("en-IN"))}`,
        pageWidth - margin,
        15,
        { align: "right" },
      );

      let nextY = 51;
      nextY = addSectionHeading("Summary", nextY);
      const summaryMetrics = result.metrics
        .slice(0, 3)
        .map(
          (metric) =>
            `${metric.label}: ${formatPdfValue(metric.value, metric.format, metric.currency)}`,
        )
        .join("; ");
      const summary = [
        `This report summarizes an illustrative ${definition.title} scenario.`,
        definition.description,
        summaryMetrics ? `Key estimates: ${summaryMetrics}.` : "",
      ]
        .filter(Boolean)
        .join(" ");
      const summaryLines = doc.splitTextToSize(
        sanitizePdfText(summary),
        contentWidth,
      ) as string[];
      nextY = ensureSpace(nextY, summaryLines.length * 4.2 + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...bodyText);
      doc.text(summaryLines, margin, nextY);
      nextY += summaryLines.length * 4.2 + 6;

      const inputRows = definition.fields
        .filter(
          (field) =>
            !field.visibleWhen ||
            readPath(values, String(field.visibleWhen.field)) ===
              field.visibleWhen.equals,
        )
        .map((field) => [
          field.label,
          formatPdfInputValue(readPath(values, String(field.name)), field),
        ]);
      nextY = appendTable(
        "Inputs and assumptions",
        ["Input", "Selected assumption"],
        inputRows.length
          ? inputRows
          : [["Scenario", "See results and timeline"]],
        nextY,
      );

      nextY = appendTable(
        "Results",
        ["Result", "Estimate", "Context"],
        result.metrics.map((metric) => [
          metric.label,
          formatPdfValue(metric.value, metric.format, metric.currency),
          metric.detail ?? "",
        ]),
        nextY,
      );

      const charts = result.charts ?? [result.chart];
      const firstChartHeight =
        69 + Math.ceil(charts[0].series.length / 2) * 5 + 4;
      nextY = ensureSpace(nextY, firstChartHeight + 11);
      nextY = addSectionHeading("Charts", nextY);
      for (const chart of charts) nextY = drawPdfChart(chart, nextY);

      const recommendations = getRecommendations(
        definition as CalculatorDefinition<FieldValues>,
        result,
      );
      nextY = ensureSpace(nextY, 44);
      nextY = addSectionHeading("Recommendations", nextY);
      for (const recommendation of recommendations) {
        const lines = doc.splitTextToSize(
          `- ${sanitizePdfText(recommendation)}`,
          contentWidth - 2,
        ) as string[];
        nextY = ensureSpace(nextY, lines.length * 4.2 + 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.2);
        doc.setTextColor(...bodyText);
        doc.text(lines, margin + 1, nextY);
        nextY += lines.length * 4.2 + 3;
      }

      if (result.comparisonTable) {
        nextY = appendTable(
          result.comparisonTable.title,
          result.comparisonTable.columns.map((column) => column.label),
          result.comparisonTable.rows.map((row) =>
            result.comparisonTable!.columns.map((column) =>
              formatPdfValue(row[column.key], column.format, column.currency),
            ),
          ),
          nextY,
        );
      }
      nextY = appendTable(
        result.yearTable.title,
        result.yearTable.columns.map((column) => column.label),
        result.yearTable.rows.map((row) =>
          result.yearTable.columns.map((column) =>
            formatPdfValue(row[column.key], column.format, column.currency),
          ),
        ),
        nextY,
      );

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.35);
        doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...mutedText);
        doc.text(
          "Illustrative planning report - not investment, tax, or legal advice",
          margin,
          pageHeight - 8,
        );
        doc.text(`${page} / ${pageCount}`, pageWidth - margin, pageHeight - 8, {
          align: "right",
        });
      }

      const slug = definition.id
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      doc.save(`wealthtogether-${slug || "financial-report"}-report.pdf`);
      setMessage({ kind: "success", text: "Your PDF report is ready." });
    } catch {
      setMessage({
        kind: "error",
        text: "We couldn’t create the PDF report. Please try again.",
      });
    }
  }, [definition, result, values]);

  return { share, downloadPdf, message, clearMessage };
}
