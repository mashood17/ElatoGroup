import { apiPost } from "../lib/api-client";
import type {
  AccessTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  TokenPairResponse,
} from "../types/api";

export const authApi = {
  login: (payload: LoginRequest) => apiPost<TokenPairResponse>("/admin/auth/login", payload),
  logout: (payload: LogoutRequest) => apiPost<void>("/admin/auth/logout", payload),
  refresh: (payload: RefreshRequest) => apiPost<AccessTokenResponse>("/admin/auth/refresh", payload),
  changePassword: (payload: ChangePasswordRequest) => apiPost<void>("/admin/auth/change-password", payload),
};
