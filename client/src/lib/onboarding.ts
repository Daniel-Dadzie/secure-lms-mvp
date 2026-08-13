const STORAGE_PREFIX = "lms-onboarding-completed";

export function onboardingStorageKey(userId: string, role: string): string {
  return `${STORAGE_PREFIX}:${userId}:${role}`;
}

export function isOnboardingCompleted(userId: string, role: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(onboardingStorageKey(userId, role)) === "true";
}

export function markOnboardingCompleted(userId: string, role: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(onboardingStorageKey(userId, role), "true");
}
