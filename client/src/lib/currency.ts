export const PLATFORM_CURRENCY =
  process.env.NEXT_PUBLIC_PLATFORM_CURRENCY ?? "GHS";

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  const amount = cents / 100;
  if (PLATFORM_CURRENCY === "GHS") {
    return `₵${amount.toFixed(2)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: PLATFORM_CURRENCY,
    minimumFractionDigits: 2,
  }).format(amount);
}
