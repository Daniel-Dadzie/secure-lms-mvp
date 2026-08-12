import api from "@/lib/api";
import { detectTimezone } from "@/lib/detectTimezone";

let synced = false;

export async function syncUserRegionOnce(): Promise<void> {
  if (synced || typeof window === "undefined") return;
  const timezone = detectTimezone();
  if (!timezone) return;

  synced = true;
  try {
    await api.patch("/users/region", { timezone });
  } catch {
    synced = false;
  }
}
