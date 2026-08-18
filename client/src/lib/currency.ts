export const PLATFORM_CURRENCY =
  process.env.NEXT_PUBLIC_PLATFORM_CURRENCY ?? "USD";

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";

  // Directly convert cents to USD dollars
  const amountUSD = cents / 100;

  // Display as whole USD (no decimals) or use toFixed(2) if you want exact cents
  return `$${amountUSD.toFixed(2)}`;
}

// You can safely remove the GHS conversion functions or keep them 
// as pass-throughs if other components still import them.
export function formatPriceInUSD(cents: number): string {
  return formatPrice(cents);
}