import { ChevronDown } from "lucide-react";
import {
  useId,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export type SelectOption = { label: string; value: string };
export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  selectRef?: Ref<HTMLSelectElement>;
  leading?: ReactNode;
};

export function SelectField({
  id,
  label,
  hint,
  error,
  options,
  selectRef,
  leading,
  className,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;
  const describedBy =
    [hint && !error && `${selectId}-hint`, error && `${selectId}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="space-y-2">
      <label
        className="text-foreground block text-sm font-medium"
        htmlFor={selectId}
      >
        {label}
      </label>
      <div className="relative">
        {leading ? (
          <span className="text-muted-foreground absolute inset-y-0 left-3.5 flex items-center">
            {leading}
          </span>
        ) : null}
        <select
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/25 h-11 w-full appearance-none rounded-lg border px-3.5 pr-10 text-sm shadow-sm transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
            leading && "pl-10",
            className,
          )}
          id={selectId}
          ref={selectRef}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
        />
      </div>
      {hint && !error ? (
        <p className="text-muted-foreground text-xs" id={`${selectId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-destructive text-xs"
          id={`${selectId}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
