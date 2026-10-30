import CountUp from "react-countup";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Wallet,
  Landmark,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NumberCardProps = {
  label: string;
  value: string;
  detail?: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  className?: string;
};

function AnimatedValue({ value }: { value: string }) {
  // Remove commas before converting
  const cleaned = value.replace(/,/g, "");
  const numeric = Number(cleaned.replace(/[^\d.-]/g, ""));

  if (Number.isNaN(numeric)) {
    return <>{value}</>;
  }

  const prefix = value.match(/^[^\d-]*/)?.[0] ?? "";

  const suffix =
    value.match(/[A-Za-z%₹$€£¥×x]+$/)?.[0] ??
    (value.endsWith("%") ? "%" : "");

  return (
    <CountUp
  start={0}
  end={numeric}
  duration={1.8}
  separator=","
  decimals={value.includes(".") ? 2 : 0}
  decimal="."
  prefix={prefix}
  suffix={suffix}
  preserveValue={false}
  useEasing
/>
  );
}

export function NumberCard({
  label,
  value,
  detail,
  change,
  changeDirection = "neutral",
  icon: Icon,
  className,
}: NumberCardProps) {
  const TrendIcon =
    changeDirection === "up"
      ? ArrowUpRight
      : changeDirection === "down"
      ? ArrowDownRight
      : Minus;

  let DisplayIcon = Icon;
  let iconBg = "bg-slate-100 dark:bg-slate-800";
  let iconColor = "text-slate-700 dark:text-slate-300";

  if (!DisplayIcon) {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes("final")) {
      DisplayIcon = Trophy;
      iconBg = "bg-yellow-100 dark:bg-yellow-900/30";
      iconColor = "text-yellow-600";
    } else if (lowerLabel.includes("investment")) {
      DisplayIcon = Wallet;
      iconBg = "bg-blue-100 dark:bg-blue-900/30";
      iconColor = "text-blue-600";
    } else if (lowerLabel.includes("return")) {
      DisplayIcon = TrendingUp;
      iconBg = "bg-emerald-100 dark:bg-emerald-900/30";
      iconColor = "text-emerald-600";
    } else if (lowerLabel.includes("multiplier")) {
      DisplayIcon = Landmark;
      iconBg = "bg-purple-100 dark:bg-purple-900/30";
      iconColor = "text-purple-600";
    }
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#D4AF37]" />

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {label}
            </p>

            <h3
  className="
    mt-4
    font-bold
    leading-tight
    tracking-tight
    text-[#081B3A]
    dark:text-white

    text-[clamp(1.3rem,2.2vw,2.2rem)]
  "
>
  <AnimatedValue value={value} />
</h3>
          </div>

          {DisplayIcon && (
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110",
                iconBg,
                iconColor,
              )}
            >
              <DisplayIcon className="h-7 w-7" />
            </div>
          )}
        </div>

        {detail && (
          <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {detail}
          </p>
        )}

        {change && (
          <div
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
              changeDirection === "up"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : changeDirection === "down"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
            )}
          >
            <TrendIcon className="h-4 w-4" />
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}