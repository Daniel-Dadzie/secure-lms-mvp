import type { UserRegion } from "@prisma/client";

const MIDDLE_EAST_TIMEZONES = new Set([
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Jerusalem",
  "Asia/Baghdad",
  "Asia/Tehran",
  "Asia/Kuwait",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Muscat",
  "Asia/Aden",
  "Asia/Amman",
  "Asia/Beirut",
  "Asia/Damascus",
  "Asia/Gaza",
  "Asia/Hebron",
  "Asia/Nicosia",
  "Asia/Famagusta",
  "Asia/Baghdad",
  "Asia/Tehran",
  "Asia/Yerevan",
  "Asia/Baku",
  "Asia/Tbilisi",
  "Europe/Istanbul",
]);

const AFRICA_INDIAN_OCEAN = new Set([
  "Indian/Mauritius",
  "Indian/Reunion",
  "Indian/Mayotte",
  "Indian/Comoro",
  "Indian/Antananarivo",
  "Indian/Mahe",
]);

const NORTH_AMERICA_PREFIXES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "America/Detroit",
  "America/Indiana/",
  "America/Kentucky/",
  "America/North_Dakota/",
  "America/Boise",
  "America/Juneau",
  "America/Toronto",
  "America/Vancouver",
  "America/Winnipeg",
  "America/Edmonton",
  "America/Halifax",
  "America/St_Johns",
  "America/Regina",
  "America/Whitehorse",
  "America/Yellowknife",
  "America/Glace_Bay",
  "America/Goose_Bay",
  "America/Moncton",
  "America/Nipigon",
  "America/Thunder_Bay",
  "America/Rainy_River",
  "America/Atikokan",
  "America/Cambridge_Bay",
  "America/Creston",
  "America/Dawson",
  "America/Dawson_Creek",
  "America/Fort_Nelson",
  "America/Inuvik",
  "America/Iqaluit",
  "America/Rankin_Inlet",
  "America/Resolute",
  "America/Swift_Current",
  "America/Blanc-Sablon",
  "America/Pangnirtung",
  "America/Nome",
  "America/Sitka",
  "America/Metlakatla",
  "America/Yakutat",
  "America/Adak",
  "America/Menominee",
  "America/Marigot",
  "America/St_Thomas",
  "America/Puerto_Rico",
  "Pacific/Honolulu",
  "US/",
  "Canada/",
];

const LATIN_AMERICA_PREFIXES = [
  "America/Mexico",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Caracas",
  "America/Guayaquil",
  "America/La_Paz",
  "America/Asuncion",
  "America/Montevideo",
  "America/Panama",
  "America/Costa_Rica",
  "America/Guatemala",
  "America/Havana",
  "America/Jamaica",
  "America/Managua",
  "America/Tegucigalpa",
  "America/El_Salvador",
  "America/Santo_Domingo",
  "America/Port_of_Spain",
  "America/Barbados",
  "America/Cayenne",
  "America/Guyana",
  "America/Paramaribo",
  "America/Recife",
  "America/Fortaleza",
  "America/Belem",
  "America/Manaus",
  "America/Cuiaba",
  "America/Campo_Grande",
  "America/Porto_Velho",
  "America/Boa_Vista",
  "America/Rio_Branco",
  "America/Maceio",
  "America/Bahia",
  "America/Araguaina",
  "America/Cordoba",
  "America/Mendoza",
  "America/Jujuy",
  "America/Catamarca",
  "America/Argentina/",
  "America/Santarem",
  "America/Noronha",
  "America/Cancun",
  "America/Merida",
  "America/Monterrey",
  "America/Chihuahua",
  "America/Mazatlan",
  "America/Tijuana",
  "America/Hermosillo",
  "America/Belize",
  "America/Curacao",
  "America/Grand_Turk",
  "America/Nassau",
  "America/Kralendijk",
  "America/Lower_Princes",
  "America/St_Barthelemy",
  "America/St_Kitts",
  "America/St_Lucia",
  "America/St_Vincent",
  "America/Tortola",
  "America/Antigua",
  "America/Aruba",
  "America/Dominica",
  "America/Grenada",
  "America/Guadeloupe",
  "America/Martinique",
  "America/Montserrat",
  "America/Puerto_Rico",
  "America/Scoresbysund",
];

function matchesPrefix(tz: string, prefixes: string[]): boolean {
  return prefixes.some((p) => tz === p || tz.startsWith(p));
}

export function regionFromTimezone(timezone: string | null | undefined): UserRegion | null {
  if (!timezone || typeof timezone !== "string") return null;

  const tz = timezone.trim();
  if (!tz) return null;

  if (MIDDLE_EAST_TIMEZONES.has(tz)) return "MIDDLE_EAST";
  if (AFRICA_INDIAN_OCEAN.has(tz)) return "AFRICA";
  if (tz.startsWith("Africa/")) return "AFRICA";
  if (tz.startsWith("Europe/") || tz.startsWith("Atlantic/Reykjavik") || tz.startsWith("Atlantic/Faroe")) {
    return "EUROPE";
  }
  if (matchesPrefix(tz, LATIN_AMERICA_PREFIXES)) return "LATIN_AMERICA";
  if (matchesPrefix(tz, NORTH_AMERICA_PREFIXES)) return "NORTH_AMERICA";
  if (tz.startsWith("Asia/") || tz.startsWith("Australia/") || tz.startsWith("Pacific/")) {
    return "ASIA_PACIFIC";
  }
  if (tz.startsWith("Indian/")) return "ASIA_PACIFIC";

  return null;
}

export const USER_REGIONS: UserRegion[] = [
  "NORTH_AMERICA",
  "LATIN_AMERICA",
  "EUROPE",
  "AFRICA",
  "MIDDLE_EAST",
  "ASIA_PACIFIC",
];

export const USER_REGION_LABELS: Record<UserRegion, string> = {
  NORTH_AMERICA: "North America",
  LATIN_AMERICA: "Latin America",
  EUROPE: "Europe",
  AFRICA: "Africa",
  MIDDLE_EAST: "Middle East",
  ASIA_PACIFIC: "Asia Pacific",
};
