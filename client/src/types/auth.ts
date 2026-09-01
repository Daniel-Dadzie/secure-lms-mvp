export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

