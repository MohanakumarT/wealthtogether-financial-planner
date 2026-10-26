# Calculator framework

Each calculator supplies a typed Zod schema, default values, responsive field metadata, and a pure calculation function. `CalculatorShell` provides the shared form lifecycle and presentation/actions.

## Calculator contract

`CalculatorDefinition<TValues>` requires:

- `schema`: Zod validation for the input values
- `defaultValues`: form defaults, also used by Reset
- `fields`: labels, input types, units, descriptions, bounds, responsive width, and optional conditional visibility
- `calculate(values)`: returns result metrics, one or more chart series, a year-wise table, and optionally a comparison table

The generic shell owns no financial assumptions. Each calculator module defines its own formula. SIP variants share the same monthly-compounding projection function.

A calculator definition contains a Zod schema and calculation function, so render it from a client component. This keeps those values on the client side of the Next.js server/client boundary.

```tsx
"use client";

import { CalculatorShell } from "@/features/calculators";
import { calculatorDefinition } from "./definition";

export function FeatureCalculator() {
  return <CalculatorShell definition={calculatorDefinition} />;
}
```

A route can import that component while keeping route metadata in a server page.

`useCalculator` connects React Hook Form to the Zod resolver and owns calculate/reset state. `useCalculatorActions` creates an explicit share summary and an on-demand PDF. Shared links omit query and fragment data; the generated share text includes result metrics only, not the input assumptions. PDF exports include assumptions, metrics, comparison data when present, and year-by-year rows.

The shell uses the app-wide light/dark theme and responsive input, result, chart, comparison, and table components. Charts support animated line, area, and bar series, respect reduced-motion preferences, and can be exported as PNG. A result can provide `charts` for multiple charts; when omitted, the shell displays its single `chart`. Add new formulas only inside their calculator feature module.

The shared shell also supports saved scenarios. It stores each validated input set and compact result summary in the authenticated user’s Supabase `saved_calculations` row. `/history` lets users reopen a scenario with its original inputs, recalculate and update it, duplicate it, or delete it. Apply the SQL migration in `supabase/migrations` and configure Supabase before enabling persistence.

The Retirement Planner at `/calculators/retirement` projects inflation-adjusted expenses and discounts a monthly expense timeline at the assumed return to estimate the required corpus. It uses current savings and current monthly contributions to estimate an additional SIP and a readiness coverage score. It applies the same return assumption before and during retirement.

The Child Education Planner at `/calculators/child-education` grows the current total education cost by annual education inflation and solves for a monthly SIP that reaches the future cost after accounting for current education savings. Contributions are assumed at the start of each month.

The House Purchase Planner at `/calculators/house-purchase` estimates the future home price and targets a selected down-payment percentage. It calculates the SIP after projecting current dedicated savings, using the expected return and monthly compounding assumption shown on the page.

The Car Purchase Planner at `/calculators/car-purchase` compares a cash purchase plan with a down payment and auto loan. It projects car price inflation, savings growth, monthly EMI, and total loan interest using the assumptions shown on the page.

The Marriage Goal Planner at `/calculators/marriage-goal` increases today's estimated goal cost by annual inflation and calculates a monthly SIP for the resulting future target, accounting for current goal savings and monthly investment growth.

The Emergency Fund Calculator at `/calculators/emergency-fund` sets a reserve target at 3, 6, 9, or 12 months of expenses and estimates the goal timeline from current savings and planned monthly additions. It assumes no investment return so the projection represents cash savings.

The Inflation Calculator at `/calculators/inflation` compounds a present-day amount by a constant annual inflation assumption to estimate a future equivalent cost, and discounts a fixed nominal amount to show its purchasing power in today's rupees.

The SWP Calculator at `/calculators/swp` projects month-end withdrawals, remaining corpus, cumulative withdrawals, and corpus longevity from a starting balance, withdrawal amount, and return assumption. It calculates the corpus exhaustion month analytically and shows the selected projection separately from that estimated timeline.

The Goal Planner at `/calculators/goal-planner` compares up to eight named goals across retirement, house, education, marriage, car, vacation, and emergency fund categories. Each goal has its own amount, timeline, inflation, return, and savings assumptions; the planner compares future corpus and monthly SIP requirements.

The Mutual Fund Goal Planner at `/calculators/mutual-fund-goal-planner` plans one goal at a time for retirement, child education, a house, marriage, a car, vacation, or wealth creation. It inflates the goal amount, projects current savings, solves the required monthly SIP, and compares two monthly SIP amounts over the same timeline. It illustrates goal-based SIP scenarios and does not recommend specific mutual funds or securities.
