export const PLATFORM_CURRENCY =
  process.env.NEXT_PUBLIC_PLATFORM_CURRENCY ?? "USD";

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  const amountUSD = cents / 100;
  return `$${amountUSD.toFixed(2)}`;
}

export function formatPriceInUSD(cents: number): string {
  return formatPrice(cents);
}

// ⚠️ Add these back so your instructor forms stop complaining:
export function convertUSDToGHS(usdAmount: number): number {
  return usdAmount; // Pass-through for USD mode
}

export function convertGHSToUSD(ghsAmount: number): number {
  return ghsAmount; // Pass-through for USD mode
}