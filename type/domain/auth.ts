export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER' | 'APPLE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  message: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  email: string;
  message: string;
}
