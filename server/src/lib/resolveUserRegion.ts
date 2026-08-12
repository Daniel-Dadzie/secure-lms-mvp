import type { UserRegion } from "@prisma/client";
import { regionFromTimezone } from "./regionFromTimezone";
import { regionFromCountryCode } from "./regionFromCountryCode";

export function resolveUserRegion(params: {
  timezone?: string | null;
  countryCode?: string | null;
}): { region: UserRegion | null; timezone: string | null } {
  const timezone = params.timezone?.trim() || null;
  const fromTz = regionFromTimezone(timezone);
  if (fromTz) return { region: fromTz, timezone };

  const fromCountry = regionFromCountryCode(params.countryCode);
  if (fromCountry) return { region: fromCountry, timezone };

  return { region: null, timezone };
}

export async function persistUserRegion(
  userId: string,
  params: { timezone?: string | null; countryCode?: string | null },
  prisma: { user: { update: (args: any) => Promise<unknown> } }
): Promise<UserRegion | null> {
  const { region, timezone } = resolveUserRegion(params);
  if (!region && !timezone) return null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(region ? { region } : {}),
      ...(timezone ? { detectedTimezone: timezone } : {}),
    },
  });

  return region;
}
