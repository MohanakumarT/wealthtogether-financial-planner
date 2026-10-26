/** Project month-start contributions with monthly compounding. */
export function projectMonthlyBalance(
  startingBalance: number,
  monthlyContribution: number,
  monthlyRate: number,
  months: number,
) {
  let balance = startingBalance;
  for (let month = 0; month < months; month += 1) {
    balance = (balance + monthlyContribution) * (1 + monthlyRate);
  }
  return balance;
}

/** Future value factor for equal contributions made at the start of each month. */
export function monthlyContributionGrowthFactor(
  monthlyRate: number,
  months: number,
) {
  let factor = 0;
  for (let month = 0; month < months; month += 1) {
    factor += (1 + monthlyRate) ** (months - month);
  }
  return factor;
}

export function requiredMonthlyContribution(
  targetValue: number,
  projectedExistingBalance: number,
  monthlyRate: number,
  months: number,
) {
  const shortfall = targetValue - projectedExistingBalance;
  if (shortfall <= 0) return 0;
  if (months <= 0) throw new RangeError("A goal needs at least one month.");

  const growthFactor = monthlyContributionGrowthFactor(monthlyRate, months);
  if (!(growthFactor > 0) || !Number.isFinite(growthFactor)) {
    throw new RangeError("The contribution growth factor is not finite.");
  }
  return shortfall / growthFactor;
}

export function futureValueAtAnnualRate(
  presentValue: number,
  annualRate: number,
  years: number,
) {
  return presentValue * (1 + annualRate) ** years;
}
