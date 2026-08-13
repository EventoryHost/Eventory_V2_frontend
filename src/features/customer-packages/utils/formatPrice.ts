const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatStartingPrice(amount: number) {
  return `Starts ${inr.format(amount)} onwards`;
}

export function formatStartingPackagePrice(amount: number) {
  return `Starting packages from ${inr.format(amount)}`;
}

export function formatBudgetRange(min: number, max: number) {
  return `${inr.format(min)} - ${inr.format(max)}`;
}
