import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
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
  return (
    <Card className={className}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          {Icon ? (
            <span className="bg-accent text-accent-foreground rounded-lg p-2">
              <Icon aria-hidden="true" className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="font-display mt-4 text-3xl tracking-tight sm:text-4xl">
          {value}
        </p>
        <div className="mt-3 flex min-h-5 items-center gap-1.5 text-xs">
          {change ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                changeDirection === "down"
                  ? "text-destructive"
                  : changeDirection === "up"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground",
              )}
            >
              <TrendIcon aria-hidden="true" className="size-3.5" />
              {change}
            </span>
          ) : null}
          {detail ? (
            <span className="text-muted-foreground">{detail}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
