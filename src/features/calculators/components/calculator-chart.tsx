"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/ui/chart-card";
import {
  formatCalculatorValue,
  formatCompactCalculatorValue,
} from "@/features/calculators/format";
import type { CalculatorChart as CalculatorChartConfig } from "@/features/calculators/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const palette = ["#D4AF37", "#4D78B8", "#4D9273", "#A879B6"];
const svgNamespace = "http://www.w3.org/2000/svg";
const computedSvgAttributes = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "fill-opacity",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "color",
];

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "chart"
  );
}

async function exportSvgAsPng(
  svg: SVGSVGElement,
  chart: CalculatorChartConfig,
  chartCard: Element,
) {
  const bounds = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const plotHeight = Math.max(1, Math.round(bounds.height));
  const headerHeight = 54;
  const viewBox = svg.viewBox.baseVal;
  const viewWidth = viewBox.width || width;
  const viewHeight = viewBox.height || plotHeight;
  const exportHeight = viewHeight + headerHeight;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", svgNamespace);
  clone.setAttribute("width", String(viewWidth));
  clone.setAttribute("height", String(exportHeight));
  clone.setAttribute(
    "viewBox",
    `${viewBox.x} ${viewBox.y} ${viewWidth} ${exportHeight}`,
  );

  const sourceNodes = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll("*"))];
  sourceNodes.forEach((source, index) => {
    const target = cloneNodes[index];
    if (!target) return;
    const computed = window.getComputedStyle(source);
    for (const attribute of computedSvgAttributes) {
      const value = computed.getPropertyValue(attribute);
      if (value) target.setAttribute(attribute, value);
    }
  });

  const backgroundColor = window.getComputedStyle(chartCard).backgroundColor;
  const foregroundColor = window.getComputedStyle(chartCard).color;
  const fontFamily = window.getComputedStyle(chartCard).fontFamily;
  const background = document.createElementNS(svgNamespace, "rect");
  background.setAttribute("width", String(viewWidth));
  background.setAttribute("height", String(exportHeight));
  background.setAttribute("fill", backgroundColor || "#ffffff");

  const title = document.createElementNS(svgNamespace, "text");
  title.setAttribute("x", "18");
  title.setAttribute("y", "25");
  title.setAttribute("fill", foregroundColor);
  title.setAttribute("font-family", fontFamily);
  title.setAttribute("font-size", "15");
  title.setAttribute("font-weight", "600");
  title.textContent = chart.title;

  const description = document.createElementNS(svgNamespace, "text");
  description.setAttribute("x", "18");
  description.setAttribute("y", "43");
  description.setAttribute("fill", foregroundColor);
  description.setAttribute("opacity", "0.72");
  description.setAttribute("font-family", fontFamily);
  description.setAttribute("font-size", "10");
  const maximumDescriptionLength = Math.max(
    24,
    Math.floor((viewWidth - 36) / 5.8),
  );
  const descriptionText = chart.description ?? "WealthTogether Investments";
  description.textContent =
    descriptionText.length > maximumDescriptionLength
      ? `${descriptionText.slice(0, maximumDescriptionLength - 1).trimEnd()}…`
      : descriptionText;

  const plot = document.createElementNS(svgNamespace, "g");
  plot.setAttribute("transform", `translate(0 ${headerHeight})`);
  while (clone.firstChild) plot.appendChild(clone.firstChild);
  clone.append(background, title, description, plot);

  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(
    new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
  );
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Chart image could not be rendered."));
      image.src = svgUrl;
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = Math.round((plotHeight + headerHeight) * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PNG export is not available in this browser.");
  context.scale(scale, scale);
  context.drawImage(image, 0, 0, width, plotHeight + headerHeight);

  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export could not be created."));
    }, "image/png");
  });
  const pngUrl = URL.createObjectURL(png);
  const link = document.createElement("a");
  link.href = pngUrl;
  link.download = `wealthtogether-${slugify(chart.title)}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1_000);
}

export function CalculatorChart({ chart }: { chart: CalculatorChartConfig }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const compactBarLabels = chart.kind === "bar" && chart.data.length > 5;

  const handleExport = async () => {
    setIsExporting(true);
    setExportMessage(null);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      const svg = chartRef.current?.querySelector("svg");
      const chartCard = chartRef.current?.closest("[data-chart-card]");
      if (!svg || !chartCard) throw new Error("Chart is not ready to export.");
      await exportSvgAsPng(svg, chart, chartCard);
      setExportMessage("PNG downloaded.");
    } catch {
      setExportMessage("PNG export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

 const axes = (
  <>
    <CartesianGrid
      stroke="#E8ECF2"
      strokeDasharray="3 6"
      vertical={false}
    />

    <XAxis
      angle={compactBarLabels ? -42 : chart.kind === "bar" ? -16 : 0}
      axisLine={false}
      dataKey={chart.xKey}
      height={compactBarLabels ? 78 : chart.kind === "bar" ? 54 : 30}
      interval={chart.kind === "bar" ? 0 : "preserveEnd"}
      minTickGap={chart.kind === "bar" ? 10 : 18}
      textAnchor={chart.kind === "bar" ? "end" : "middle"}
      tick={{
        fill: "#64748B",
        fontSize: 11,
        fontWeight: 600,
      }}
      
      tickFormatter={(value) => {
        const label = String(value);
        const maximumLength = compactBarLabels ? 10 : 16;

        return chart.kind === "bar" && label.length > maximumLength
          ? `${label.slice(0, maximumLength - 1)}…`
          : label;
      }}
      tickLine={false}
      tickMargin={10}
    />

    <YAxis
      axisLine={false}
      tick={{
        fill: "#64748B",
        fontSize: 11,
        fontWeight: 600,
      }}
      tickFormatter={(value) =>
        formatCompactCalculatorValue(
          Number(value),
          chart.valueFormat,
          chart.currency,
        )
      }
      tickLine={false}
      width={68}
    />

    <Tooltip
      cursor={{
        stroke: "#D4AF37",
        strokeWidth: 2,
        strokeDasharray: "5 5",
      }}
      formatter={(value, name) => [
        formatCalculatorValue(
          Number(value ?? 0),
          chart.valueFormat,
          chart.currency,
        ),
        String(name),
      ]}
      contentStyle={{
        background: "#081B3A",
        color: "#FFFFFF",
        border: "1px solid #D4AF37",
        borderRadius: 16,
        boxShadow: "0 18px 40px rgba(8,27,58,.35)",
        padding: "12px 16px",
      }}
      itemStyle={{
        color: "#FFFFFF",
        fontWeight: 600,
      }}
      labelStyle={{
        color: "#D4AF37",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 6,
      }}
    />

    {chart.series.length > 1 ? (
      <Legend
        align="center"
        verticalAlign="top"
        iconType="circle"
        iconSize={10}
        wrapperStyle={{
          fontSize: 13,
          fontWeight: 600,
          paddingBottom: 20,
        }}
      />
    ) : null}
  </>
);

  const action = (
    <div className="space-y-1">
      <Button
        aria-label={`Export ${chart.title} as PNG`}
        disabled={isExporting}
        onClick={handleExport}
        size="default"
        type="button"
        variant="outline"
      >
        {isExporting ? (
          <LoaderCircle
            aria-hidden="true"
            className={prefersReducedMotion ? "size-4" : "size-4 animate-spin"}
          />
        ) : (
          <Download aria-hidden="true" className="size-4" />
        )}
        {isExporting ? "Generating..." : "Download Chart"}
      </Button>
      {exportMessage ? (
        <p
          aria-live="polite"
          className="text-muted-foreground text-[11px]"
          role="status"
        >
          {exportMessage}
        </p>
      ) : null}
    </div>
  );

  return (
    <ChartCard
      action={action}
      className="min-w-0 overflow-hidden"
      contentClassName="h-[18rem] px-1 pb-4 sm:h-[20rem] sm:px-2 sm:pb-5 lg:h-[21rem]"
      description={chart.description}
      title={chart.title}
    >
      <div className="h-full min-w-0" ref={chartRef}>
        <ResponsiveContainer
          debounce={100}
          height="100%"
          minHeight={240}
          width="100%"
        >
          {chart.kind === "line" ? (
            <LineChart
              accessibilityLayer
              data={chart.data}
              margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
            >
              {axes}
              {chart.series.map((series, index) => (
                <Line
                  activeDot={{ r: 5, strokeWidth: 2 }}
                  animationBegin={prefersReducedMotion ? 0 : index * 110}
                  animationDuration={900}
                  animationEasing="ease-out"
                  dataKey={series.key}
                  dot={false}
                  isAnimationActive={!prefersReducedMotion && !isExporting}
                  key={series.key}
                  name={series.label}
                  stroke={series.color ?? palette[index % palette.length]}
                  strokeWidth={4}
                  type="monotone"
                />
              ))}
            </LineChart>
          ) : chart.kind === "bar" ? (
            <BarChart
              accessibilityLayer
              barCategoryGap="22%"
              data={chart.data}
              margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
            >
              {axes}
              {chart.series.map((series, index) => (
                <Bar
                  activeBar={{ fillOpacity: 0.82 }}
                  animationBegin={prefersReducedMotion ? 0 : index * 100}
                  animationDuration={800}
                  animationEasing="ease-out"
                  dataKey={series.key}
                  fill={series.color ?? palette[index % palette.length]}
                  isAnimationActive={!prefersReducedMotion && !isExporting}
                  key={series.key}
                  maxBarSize={64}
                  name={series.label}
                  radius={[12, 12, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <AreaChart
              accessibilityLayer
              data={chart.data}
              margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
            >
              {axes}
              {chart.series.map((series, index) => (
                <Area
                  activeDot={{ r:8,
                  strokeWidth:3 }}
                  animationBegin={prefersReducedMotion ? 0 : index * 110}
                  animationDuration={1_000}
                  animationEasing="ease-out"
                  dataKey={series.key}
                  fill={series.color ?? palette[index % palette.length]}
                  fillOpacity={chart.series.length > 1 ? 0.1 : 0.25}
                  isAnimationActive={!prefersReducedMotion && !isExporting}
                  key={series.key}
                  name={series.label}
                  stroke={series.color ?? palette[index % palette.length]}
                  strokeWidth={2.5}
                  type="monotone"
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
