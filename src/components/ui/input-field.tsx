import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
};

export function InputField({
  id,
  label,
  hint,
  error,
  leading,
  trailing,
  inputRef,
  className,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;

  const describedBy =
    [hint && !error && `${inputId}-hint`, error && `${inputId}-error`]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <div className="relative">
        {leading ? (
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-500">
            {leading}
          </span>
        ) : null}

        <Input
          id={inputId}
          inputRef={inputRef}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-14 rounded-2xl border-2 border-slate-200 bg-white text-lg font-semibold shadow-sm transition-all duration-200",
            "placeholder:text-slate-400",
            "focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/20",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-white",
            leading && "pl-12",
            trailing && "pr-20",
            className,
          )}
          onFocus={(e) => {
            // Automatically select the whole value
            e.target.select();

            // Preserve any existing onFocus handler
            props.onFocus?.(e);
          }}
          {...props}
        />

        {trailing ? (
          <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
            {trailing}
          </span>
        ) : null}
      </div>

      {hint && !error ? (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}