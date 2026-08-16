export const PLATFORM_CURRENCY =
  process.env.NEXT_PUBLIC_PLATFORM_CURRENCY ?? "GHS";

// Exchange rate: 1 USD = X GHS (can be configured via environment variable)
const USD_TO_GHS_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_GHS_RATE) || 15.0;

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";

  // Convert GHS cents to USD amount for display
  const amountGHS = cents / 100;
  const amountUSD = amountGHS / USD_TO_GHS_RATE;

  // Display as whole USD (no decimals)
  return `$${Math.round(amountUSD)}`;
}

export function formatPriceInGHS(cents: number): string {
  if (cents === 0) return "Free";
  const amount = cents / 100;
  return `₵${amount.toFixed(2)}`;
}

export function convertUSDToGHS(usdAmount: number): number {
  return usdAmount * USD_TO_GHS_RATE;
}

export function convertGHSToUSD(ghsAmount: number): number {
  return ghsAmount / USD_TO_GHS_RATE;
}
