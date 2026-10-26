"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

const colors = [
  "#D4AF37",
  "#081B3A",
  "#4B77BE",
  "#6B9B87",
  "#9A7EBB",
  "#D6815C",
];
const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: value > 10_000_000 ? "compact" : "standard",
  }).format(value);

export function OverviewCharts({
  allocation,
  timeline,
}: {
  allocation: Array<{ name: string; value: number }>;
  timeline: Array<{ month: string; label: string; value: number }>;
}) {
  const total = allocation.reduce((sum, item) => sum + Number(item.value), 0);
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold">Asset allocation</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Current holding values grouped by investment type
          </p>
        </div>
        {allocation.length ? (
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(180px,0.9fr)_minmax(0,1fr)]">
            <div className="h-[220px] min-w-0">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {allocation.map((entry, index) => (
                      <Cell
                        fill={colors[index % colors.length]}
                        key={entry.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs">Tracked AUM</p>
              <p className="text-xl font-semibold tabular-nums">
                {currency(total)}
              </p>
              <ul className="space-y-2">
                {allocation.map((item, index) => (
                  <li
                    className="flex items-center justify-between gap-3 text-xs"
                    key={item.name}
                  >
                    <span className="text-muted-foreground flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{ background: colors[index % colors.length] }}
                      />
                      <span className="truncate capitalize">
                        {item.name.replaceAll("_", " ")}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {total
                        ? `${((Number(item.value) / total) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <EmptyChart message="Investment holdings will appear here when recorded." />
        )}
      </Card>
      <Card className="p-5 sm:p-6">
        <div>
          <h2 className="text-base font-semibold">Investment timeline</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Current value of holdings by investment month
          </p>
        </div>
        {timeline.some((item) => Number(item.value) > 0) ? (
          <div className="mt-5 h-[250px] min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart
                data={timeline}
                margin={{ top: 8, right: 8, bottom: 2, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value >= 1_000_000
                      ? `₹${(value / 1_000_000).toFixed(0)}L`
                      : value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : `₹${value}`
                  }
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => currency(Number(value))}
                  labelFormatter={(label) => `Investment month: ${label}`}
                />
                <Bar
                  dataKey="value"
                  fill="#D4AF37"
                  maxBarSize={36}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Add investment dates and current values to create a timeline." />
        )}
      </Card>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="text-muted-foreground mt-4 grid min-h-[230px] place-items-center rounded-xl border border-dashed p-6 text-center text-sm">
      {message}
    </div>
  );
}
