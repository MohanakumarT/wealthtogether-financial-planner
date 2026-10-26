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
        className="text-foreground block text-sm font-medium"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="relative">
        {leading ? (
          <span className="text-muted-foreground absolute inset-y-0 left-3.5 flex items-center">
            {leading}
          </span>
        ) : null}
        <Input
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(leading && "pl-10", trailing && "pr-20", className)}
          id={inputId}
          inputRef={inputRef}
          {...props}
        />
        {trailing ? (
          <span className="text-muted-foreground absolute inset-y-0 right-3.5 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>
      {hint && !error ? (
        <p className="text-muted-foreground text-xs" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-destructive text-xs"
          id={`${inputId}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
