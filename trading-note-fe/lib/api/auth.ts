import apiClient from './client';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '@/type/domain/auth';

const TOKEN_KEY = 'auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', request);
  storeToken(data.token);
  return data;
}

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<SignupResponse>('/auth/signup', request);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    removeToken();
  }
}

export function getKakaoLoginUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  return `${backendUrl}/oauth2/authorization/kakao`;
}
