import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageHeading({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "font-display text-4xl leading-tight tracking-tight sm:text-5xl",
        className,
      )}
      {...props}
    />
  );
}
export function SectionHeading({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-display text-2xl tracking-tight sm:text-3xl",
        className,
      )}
      {...props}
    />
  );
}
export function BodyText({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-sm leading-6 sm:text-base",
        className,
      )}
      {...props}
    />
  );
}
export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-primary text-xs font-semibold tracking-[0.16em] uppercase",
        className,
      )}
      {...props}
    />
  );
}
