import api from "./axios";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth.types";

export const registerUser = async (
  data: RegisterInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);

  return response.data;
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", data);

  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>("/auth/me");

  return response.data.user;
};
