import api, {
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
} from "./api";

import type { SafeUser } from "@/types/auth";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: "STUDENT" | "INSTRUCTOR";
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(
  input: RegisterInput
): Promise<SafeUser> {
  const response = await api.post("/auth/register", input);

  setAccessToken(response.data.accessToken);

  return response.data.user;
}

export async function login(
  input: LoginInput
): Promise<SafeUser> {
  const response = await api.post("/auth/login", input);

  setAccessToken(response.data.accessToken);

  return response.data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}

export async function getMe(): Promise<SafeUser> {
  const response = await api.get("/auth/me");

  return response.data.user;
}

export async function refreshToken(): Promise<string> {
  return refreshAccessToken();
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
}
