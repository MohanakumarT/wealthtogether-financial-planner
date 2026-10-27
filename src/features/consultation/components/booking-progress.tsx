import { Check } from "lucide-react";

import { consultationSteps } from "../constants/services";

export function BookingProgress({ currentStep }: { currentStep: number }) {
  const progress = Math.round(
    (currentStep / (consultationSteps.length - 1)) * 100,
  );
  return (
    <div
      aria-label={`Step ${currentStep + 1} of ${consultationSteps.length}`}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        {consultationSteps.map((step, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          return (
            <div
              className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:flex-row"
              key={step}
            >
              <span
                aria-current={active ? "step" : undefined}
                className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${complete ? "bg-primary text-primary-foreground" : active ? "bg-gold text-gold-foreground ring-gold/30 ring-4" : "bg-muted text-muted-foreground"}`}
              >
                {complete ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span
                className={`hidden truncate text-xs font-medium sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-gold h-full rounded-full transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-muted-foreground text-xs sm:hidden">
        Step {currentStep + 1} of {consultationSteps.length} ·{" "}
        {consultationSteps[currentStep]}
      </p>
    </div>
  );
}
