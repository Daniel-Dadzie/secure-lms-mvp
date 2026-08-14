import {
  formatCurrency,
  formatNumber,
  formatRelativeTime,
  formatDateTime,
} from "@/lib/admin/formatters";

describe("formatCurrency", () => {
  it("formats cents as USD currency", () => {
    expect(formatCurrency(5000)).toBe("$50.00");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("supports different currencies", () => {
    expect(formatCurrency(5000, "EUR")).toBe("€50.00");
  });
});

describe("formatNumber", () => {
  it("formats a number with thousands separators", () => {
    expect(formatNumber(1500000)).toBe("1,500,000");
  });

  it("formats zero correctly", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatRelativeTime", () => {
  it('returns "Just now" for a recent date', () => {
    const date = new Date(Date.now() - 10 * 1000).toISOString();

    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it("returns minutes for recent dates", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns hours for dates within a day", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days for dates within a week", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    expect(formatRelativeTime(date)).toBe("2d ago");
  });
});

describe("formatDateTime", () => {
  it("formats a date and time", () => {
    const result = formatDateTime("2026-08-14T12:30:00Z");

    expect(result).toContain("Aug");
    expect(result).toContain("14");
    expect(result).toContain("2026");
  });
});