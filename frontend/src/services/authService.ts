import apiClient from "./apiClient";
import type { LoginRequest, RegisterHRRequest } from "../interfaces/auth";

// ===== Login Function =====
export async function login(data: LoginRequest) {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
}

// ===== Register Function =====
export async function register(data: RegisterHRRequest) {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
}
