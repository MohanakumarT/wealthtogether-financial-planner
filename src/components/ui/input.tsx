import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputRef?: Ref<HTMLInputElement>;
};
function Input({ className, type = "text", inputRef, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 flex h-11 w-full rounded-lg border px-3.5 text-sm shadow-sm transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={inputRef}
      type={type}
      {...props}
    />
  );
}
export { Input };
